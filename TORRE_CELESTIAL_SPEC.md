# Torre Celestial — Especificação do Sistema

> Versão analisada: 2.1.0 | Data: 2026-05-27

---

## 1. Visão Geral

**Torre Celestial** é uma aplicação web separada do HxH5e RPG, hospedada em `https://app-torre-celestial.vercel.app/`. Funciona como uma **arena de combates + bolsa de valores temática de RPG** para o mesmo universo Hunter x Hunter 5e. Os jogadores podem:

- Registrar personagens como **lutadores** na arena (Torre Celestial)
- **Comprar e vender cotas** de lutadores (como ações de uma bolsa)
- **Investir TC Coin** (moeda virtual) em lutas e competidores
- Acompanhar **rankings, andares e estatísticas** de combate em tempo real
- Realizar **depósitos e saques** de dinheiro real (R$) convertidos em TC Coin

---

## 2. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Estilização | Tailwind CSS v4 + Orbitron/Rajdhani |
| Ícones | Lucide React |
| Animações | Motion (Framer Motion) |
| Backend | Express v5 + tsx (Node.js) |
| Banco de Dados | Firebase Firestore |
| Autenticação | Discord OAuth2 (Authorization Code Flow) + Firebase Auth (Custom Tokens) |
| Deploy | Vercel (frontend + serverless API unificado) |
| Notificações | Discord Webhooks (outbound) |

**Diferença de auth vs HxH5e.html:**
- HxH5e usa Discord **Implicit Flow** (sem backend, `client_secret` não necessário, token no fragmento URL)
- Torre Celestial usa Discord **Authorization Code Flow** (com backend Express, `client_secret` no servidor — mais seguro)

---

## 3. Estrutura de Arquivos

```
App.tsx                    — Raiz React: auth, roteamento entre modos, sync Firebase
index.tsx / index.html     — Entry point
constants.ts               — Versão, dados estáticos, configs Discord/Admin
types.ts                   — Interfaces TypeScript
firebase.ts                — Init Firebase client-side
firestore.rules            — Regras de segurança Firestore (produção)
DRAFT_firestore.rules      — Rascunho de regras para V2
security_spec.md           — Especificação de segurança e payloads de teste
api/index.ts               — Backend Express: OAuth, V2 arena, economia (2047 linhas)

components/
  DiscordLogin.tsx          — Tela de login via Discord
  ModeSelector.tsx          — Seletor entre modo Classic e V2
  CharacterHeader.tsx       — Cabeçalho com dados do personagem ativo
  CompetitorDashboard.tsx   — Dashboard do competidor (modo V1)
  BettingTerminal.tsx       — Terminal de apostas (modo V1)
  ArenaNotification.tsx     — Notificações de eventos da arena
  OtherCompetitors.tsx      — Painel do Juiz para gerenciar competidores (V1)
  PaymentModal.tsx          — Modal de depósito/saque (V1)
  ProfileManager.tsx        — Criação e seleção de personagens (V1)

  v2/
    V2Dashboard.tsx         — Dashboard principal V2 (mercado + juiz + investimentos)
    V2EconomyModals.tsx     — Modais de TC Coin, registro de lutador, edição, reset arena
```

---

## 4. Dois Modos de Operação

O app divide-se em **V1 (Classic)** e **V2 (Ascenção)**, selecionáveis via `ModeSelector`.

### 4.1 V1 — Classic (Sistema de Apostas)

Modo mais antigo, usa as coleções `characters`, `matches`, `investments`, `profiles` no Firestore.

- **Personagem**: criado/selecionado em `ProfileManager` (nome + tipo de Nen)
- **Apostas** (`BettingTerminal`): investimento em lutas ao vivo com odds
- **Competidor** (`CompetitorDashboard`): visualização de stats do personagem ativo
- **Juiz** (`OtherCompetitors`): painel para criação/gerenciamento de lutas
- **Carteira V1**: `jenny` (saldo real), `trainingJenny` (saldo bloqueado de treino), `investmentsPlaced` (contador para desbloqueio)

### 4.2 V2 — Ascenção (Mercado de Cotas)

Sistema principal atual, mais complexo. Tudo em `V2Dashboard.tsx` + `api/index.ts`.

Seções da interface:
1. **Investimentos da Torre** — histórico de transações e patrimônio em cotas
2. **Mercado de Lutadores** — grid de lutadores com filtros por andar + compra/venda de cotas
3. **Painel de Juiz** (apenas roles autorizados) — cadastro de lutadores, sanção de combates, auditoria financeira

---

## 5. Entidades de Dados (V2)

### V2User (`v2_users/{userId}`)
```ts
{
  id: string            // discord:XXXXXXXXX
  name: string
  coins_balance: number // Saldo TOTAL de TC Coin
  released_balance: number // Saldo LIBERADO (sacável)
  user_type: 'FIGHTER' | 'INVESTOR' | 'BOTH'
  is_admin: boolean
  is_fighter: boolean
  phone?: string
  last_activity: Timestamp
}
```

### V2Fighter (`v2_fighters/{fighterId}`)
```ts
{
  id: string            // "{userId}____{safeName}"
  user_id: string       // dono (ou "NPC_ASSOCIATION")
  name: string
  floor: number         // andar atual (1–251)
  level: number         // 1–12
  nenType: string
  imageUrl: string
  ranking: number       // 1–251 (inversamente proporcional ao andar)
  popularity: number    // 0–100
  wins: number
  losses: number
  total_fights: number
  streak: number        // positivo = sequência de vitórias; negativo = derrotas
  quotes_available: number // cotas restantes para compra (de 1000)
  quote_value: number   // valor calculado por cota (em TC Coin)
  performance_value: number // componente de performance do valor
  market_value: number  // componente de mercado do valor
  volume_buy_24h: number
  volume_sell_24h: number
  owner_buy_volume_24h: number // detecção de auto-pump
  is_npc: boolean
  last_match_at: Timestamp
}
```

### V2Quote (`v2_quotes/{fighterId}____{userId}`)
```ts
{
  id: string
  fighter_id: string
  user_id: string
  amount: number         // quantidade de cotas detidas
  avg_price: number      // preço médio de compra
  released_principal: number // parte do custo que era saldo liberado
  entry_performance_avg: number // performance no momento da compra
  entry_market_avg: number      // mercado no momento da compra
  lutas_ocorridas_desde_compra: number
  created_at: Timestamp
}
```

### V2Transaction (`v2_transactions/{txId}`) — imutável
```ts
{
  id: string
  user_id: string
  type: 'BUY_QUOTE' | 'SELL_QUOTE' | 'BUY_COIN' | 'WITHDRAW'
  amount: number
  fee: number
  timestamp: Timestamp
  metadata: { fighterId?, amount?, unitValue?, approvedBy?, amountBRL? }
}
```

### V2PendingTransaction (`v2_pending_transactions/{txId}`)
```ts
{
  id: string
  user_id: string
  user_name: string
  type: 'DEPOSIT' | 'WITHDRAW'
  amountBRL?: number
  amountCoins: number
  method?: 'PIX' | 'CHARACTER'
  details?: any
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: Timestamp
  updated_at: Timestamp
  processed_by?: string
  reject_reason?: string
}
```

### V2Fight (`v2_fights/{fightId}`)
```ts
{
  id: string
  fighter_a_id: string
  fighter_b_id: string
  winner_id: string
  timestamp: Timestamp
  type?: 'NPC_AUTO' | undefined  // undefined = registrado pelo Juiz
  impact_ranking: number
  impact_popularity: number
}
```

### V2NPCMatch (`v2_npc_matches/{matchId}`)
```ts
{
  id: string
  fighter_a_id: string
  fighter_b_id: string
  fighter_a_name: string
  fighter_b_name: string
  floor_range: string    // "1-9", "10-19", etc.
  status: 'SCHEDULED' | 'FINISHED'
  winner_id?: string
  win_probability_a: number  // 0–100 (%)
  scheduled_for: string  // ISO timestamp
  created_at: string
}
```

---

## 6. Economia (TC Coin)

### Conversão
- **1 TC Coin = R$ 0,01** (1 Real = 100 TC Coin)
- Taxa de saque: **15%** para sacar como Jenny do personagem, implicitamente ~30% em outras formas
- Taxa de compra de cota: **0%** (mas 20% do total vai para o dono do lutador)
- Taxa de venda de cota: **5%** sobre o valor bruto

### Tipos de Saldo
| Tipo | Origem | Sacável? |
|------|--------|----------|
| **Liberado** (released_balance) | Depósito real + lucro de mercado (outros hunters comprando) | Sim |
| **Bloqueado** (coins_balance - released_balance) | Bônus inicial + ganhos de performance/NPC | Não (até regras de conversão) |

### Fluxo de Depósito
1. Usuário solicita depósito via app → cria `v2_pending_transactions` (status: PENDING)
2. Admin recebe notificação no Discord e no app
3. Admin aprova/rejeita via Painel de Juiz → `v2_transactions` é criado; saldo atualizado

### Fluxo de Saque
1. Usuário solicita saque → saldo é **imediatamente congelado** (deduzido de `coins_balance`)
2. Cria `v2_pending_transactions` (status: PENDING)
3. Admin processa: se aprovado → pagamento externo; se rejeitado → saldo devolvido

### Valor de Cota — Fórmula

O `quote_value` de um lutador é calculado pela função `calculateQuoteValueComponents()`:

```
base = 50
factorRanking = max(0, (251 - ranking) × 0.8)
factorPopularity = popularity × 0.05
factorPerformance = (wins × 2) - (losses × 1)
factorStreak = streak × 5
floorBonus = (floorGroup × 4)  // Mestres de Andar: floorGroup = 100
levelBonus = level × 2         // Mestres: multiplicador inverso (nível 1 = ×15, nível 12 = ×4)

performanceSubtotal = soma dos acima
marketSubtotal = (volume_buy_24h - volume_sell_24h) × 2  // Pressão de mercado

rawValor = performanceSubtotal + marketSubtotal

// Suavização: delta × 0.3 + limite de ±50% em relação ao dia anterior
// Anti-pump: se dono compra >50% do volume, valorização é congelada
// Mínimo: 20 TC Coin
```

**Dualidade de lucro na venda**:
- Lucro vindo do componente de mercado (`market_value`) → crédita como saldo **liberado**
- Lucro vindo de performance/NPCs → crédita como saldo **bloqueado**

---

## 7. Sistema de Andares e Ranking

### Progressão
- **Vitória**: +10 andares, ranking sobe 5 posições, popularidade +5
- **Derrota**: -10 andares, ranking cai 3 posições, popularidade -2
- **Mestres de Andar** (andares especiais: 210, 220, 230, 240, 250, 251): ao perder apenas -1 andar (perde o status de Mestre)
- **Andar mínimo no topo**: derrota em andares 200–209 → vai para no mínimo andar 200

### Mestres de Andar
Para ser Mestre de Andar (200+), o lutador precisa:
- Estar no andar 200+
- 10 vitórias consecutivas contra oponentes do mesmo patamar, OU
- 10 vitórias com menos de 4 derrotas totais (interpretação narrativa do Juiz)

**Bolsa de Mestre**: +200 TC Coin (bloqueado) por semana enquanto estiver no andar de Mestre.

### Penalidade por Inatividade
Se o lutador ficar mais de 2 semanas sem lutar, o valor das cotas vendidas é penalizado:
- **-5% por semana** acima de 2 semanas (máximo -50%)

### Anti-Match-Loop
O sistema detecta lutas repetidas entre os mesmos oponentes:
- 1ª luta extra com mesmo oponente: penaltyMultiplier = 0.6
- 2ª luta extra: 0.2
- 3+ lutas extras: registra alerta em `v2_suspicious_activity`

---

## 8. Permissões e Cargos (RBAC)

### Cargos Discord
| Cargo | ID | Permissões |
|-------|-----|-----------|
| Árbitro/Narrador/Mestre | 1100415887971991572 | Painel de Juiz, sanção de combates, cadastro de lutadores |
| Candidato a Mestre | 1263215631784869949 | Idem |
| Playtester | 1335940980628521000 | Idem |
| Investidor/Competidor | 1100984179845505044 | Comprar/vender cotas |

### Administradores (Super Admin)
IDs hardcoded com poder total: resetar arena, matchmaking NPC, auditoria financeira, Protocolo Ômega.

### Verificação de Admin
1. Lista hardcoded de IDs (emergência/bootstrap)
2. Campo `is_admin: true` na coleção `v2_users` (dinâmico, verificado no backend)

---

## 9. API Endpoints (Backend Express)

Todos em `api/index.ts`, expostos via `/api/*`.

### Auth
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/discord/url` | GET | Gera URL OAuth2 do Discord com state (anonUid) |
| `/api/auth/discord/callback` | GET | Troca code por token, cria Firebase Custom Token, postMessage para janela pai |

### V2 — Perfil e Mercado
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v2/init-profile` | POST | Inicializa ou repara perfil V2; cria usuário com 50 TC Coin iniciais |
| `/api/v2/buy-quote` | POST | Compra cotas (transação atômica Firestore) |
| `/api/v2/sell-quote` | POST | Vende cotas com cálculo de lucro dual |
| `/api/v2/register-fighter` | POST | Registra lutador (modos: SELF, NPC, OTHER) |
| `/api/v2/update-fighter/:id` | PATCH | Edita dados do lutador |
| `/api/v2/delete-fighter/:id` | DELETE | Remove lutador e todas suas cotas |
| `/api/v2/record-fight` | POST | Registra resultado de luta com anti-loop |
| `/api/v2/market-analysis/:id` | GET | Analisa auto-pump de lutador |
| `/api/v2/update-phone` | POST | Vincula celular ao perfil |

### V2 — Financeiro
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v2/deposit` | POST | Solicita depósito R$ → TC Coin (cria pendente) |
| `/api/v2/withdraw` | POST | Solicita saque (congela saldo imediatamente) |
| `/api/v2/admin/process-transaction` | POST | Aprova ou rejeita transação pendente (admin only) |

### V2 — Admin
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v2/admin/npc-matchmaking` | POST | Sorteia e agenda luta NPC (Super Admin only) |
| `/api/v2/admin/clear-v2-data` | POST | Protocolo Ômega: zera toda a Arena V2 (Super Admin only) |
| `/api/v2/sanction-match` | POST | Sanciona luta com embed no Discord Webhook |

### V1 — Legacy
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/bot/sanction` | POST | Inicia luta V1 via webhook de bot (chave de API) |
| `/api/health` | GET | Health check da API |
| `/api/v2/debug-db` | GET | Lista coleções do Firestore (diagnóstico) |

---

## 10. Notificações Discord

Dois webhooks configurados no backend:
- **DISCORD_MATCH_WEBHOOK**: notificações de lutas, registro/expulsão de lutadores, resultados
- **DISCORD_FINANCE_WEBHOOK**: solicitações de depósito/saque (canal financeiro separado)

Embeds enviados automaticamente nas operações: registrar lutador, deletar lutador, sancionar combate, resultado de luta, matchmaking NPC, depósito/saque.

---

## 11. Segurança (Firestore Rules)

Filosofia: **"Fortress Layer"** — cliente pode ler dados públicos, mas toda operação econômica sensível passa pelo backend com Firebase Admin SDK.

| Coleção | Leitura | Escrita Cliente |
|---------|---------|-----------------|
| `v2_users` | Próprio usuário ou admin | Apenas campos não-financeiros (name, user_type, last_activity, phone) |
| `v2_fighters` | Pública | Apenas admin |
| `v2_quotes` | Próprio usuário ou admin | Apenas admin (via API) |
| `v2_fights` | Pública | Apenas admin |
| `v2_transactions` | Próprio usuário ou admin | Apenas criação por admin (imutável) |
| `v2_pending_transactions` | Admin ou próprio usuário | Apenas via API (Admin SDK) |
| `v2_notifications` | Próprio usuário ou admin | Apenas via API (Admin SDK) |

O `security_spec.md` define os 12 "Dirty Dozen" payloads de teste para validar as regras.

---

## 12. Integração com HxH5e.html (Análise de Oportunidades)

### Conexões Existentes
1. **Menu hamburguer** — link "Torre Celestial" já adicionado em `js/views/list.js` (abre em nova aba)
2. **Coleção `characters`** — Torre Celestial V1 lê e escreve na mesma coleção `characters` do Firestore que o HxH5e pode usar
3. **Saque para Jenny** — Torre Celestial suporta sacar TC Coin diretamente como `jenny` no documento do personagem
4. **Discord Auth** — ambos os sistemas usam Discord como identidade (IDs compatíveis)

### Campos de Personagem Compartilháveis
| Campo | HxH5e (state.currentChar) | Torre Celestial (V2Fighter) |
|-------|--------------------------|------------------------------|
| nome | `char.name` | `fighter.name` |
| andar/nível | `char.level` | `fighter.floor` + `fighter.level` |
| tipo de Nen | `char.class` | `fighter.nenType` |
| imagem | `char.imageUrl` | `fighter.imageUrl` |
| jenny | `char.jenny` | via saque TC Coin |

### Pontos de Integração Propostos

**1. Login Unificado (SSO)**
- Ambos já usam Discord OAuth, mas com flows diferentes (Implicit vs Code)
- HxH5e poderia detectar se o usuário já tem sessão na Torre Celestial via `localStorage` comum (mesmo domínio seria necessário, ou postMessage cross-domain)
- Mais simples: mostrar o saldo TC Coin do jogador dentro da ficha HxH5e

**2. Sincronização de Personagem → Lutador**
- Ao criar/editar personagem no HxH5e, enviar dados para Torre Celestial via API (`/api/v2/register-fighter`)
- Campos: name, level, nenType, imageUrl, floor (baseado em level do HxH5e)
- Requisito: HxH5e precisaria ter a URL base da API da Torre Celestial configurada

**3. Exibição de Saldo TC Coin na Ficha**
- HxH5e poderia fazer um GET Firestore direto (`v2_users/{discordId}`) usando as credenciais Supabase existentes (problema: banco diferente — Firebase vs Supabase)
- Alternativa: exibir apenas o link da Torre com o saldo não integrado (solução atual)

**4. Jenny como TC Coin In-Game**
- O saque "para personagem" já debita TC Coin e credita `jenny` no documento `characters` do Firestore
- HxH5e poderia ler esse campo `jenny` se ambos usassem o mesmo banco (ambos precisariam estar no Firebase, mas HxH5e usa Supabase)
- Banco diferente é a principal barreira técnica

**5. Exibir Dados da Torre na Ficha (Read-Only)**
- Widget na ficha HxH5e mostrando: andar na Torre, ranking, cotas vendidas, valor atual
- Requereria uma API pública (sem auth) para buscar dados básicos de um lutador por Discord ID
- Endpoint sugerido: `GET /api/v2/public/fighter/{discordId}` (não existe ainda)

### Barreira Principal
**HxH5e usa Supabase; Torre Celestial usa Firebase.** Para integração profunda de dados, seria necessário:
- Migrar HxH5e para Firebase (trabalho alto)
- Ou criar uma API de ponte entre os dois sistemas (duplicação de dados)
- Ou manter integração superficial (link + dados sincronizados manualmente)

### Integração Superficial (Recomendada sem refatoração)
Sem alterar nada estruturalmente, o que já é possível:
- Link no menu hamburguer (✅ já feito)
- Mostrar iframe/webview da Torre na ficha (UX complexo)
- Instruções ao Mestre para cadastrar personagens do HxH5e na Torre manualmente
- Saque de TC Coin para `jenny` funciona se o ID do personagem for conhecido

---

## 13. Resumo do Fluxo de Usuário (V2)

```
Login Discord
     ↓
ModeSelector → Escolhe "V2 (Ascenção)"
     ↓
V2Dashboard inicializa → initProfile API → cria/carrega v2_users
     ↓
┌──────────────────────────────────────────────────────────────┐
│  Seção MERCADO                                                │
│  → Ver lista de lutadores filtrada por andar                 │
│  → Clicar em lutador → TradeModal → Comprar/Vender cotas     │
│  → Cadastrar próprio personagem como lutador                 │
├──────────────────────────────────────────────────────────────┤
│  Seção INVESTIMENTOS                                          │
│  → Ver patrimônio total em cotas                             │
│  → Histórico de transações                                   │
│  → Acessar Gerenciar TC Coin → Depositar ou Sacar            │
├──────────────────────────────────────────────────────────────┤
│  Seção PAINEL DE JUIZ (roles autorizados)                    │
│  → Cadastrar/editar/expulsar lutadores                       │
│  → Sancionar combate → Notificação Discord                   │
│  → Registrar resultado → atualiza fighter stats              │
│  → Super Admin: matchmaking NPC, recalcular valores,         │
│    backup/restore, duelo em massa, auditoria financeira      │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. Configuração de Ambiente (.env)

```env
# Bot para sancionar lutas via Webhook (V1)
BOT_API_KEY=hxh_secret_key_123

# Discord OAuth2 (Authorization Code Flow)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_GUILD_ID=831867588656758804

# Firebase Admin SDK (JSON da service account)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# (Automático no Vercel, opcional local)
APP_URL=https://app-torre-celestial.vercel.app
```

---

## 15. Pendências e Melhorias Identificadas

### Técnicas
- `services/firebaseService` e `services/v2Service` são importados nos componentes mas **não existem no ZIP** (provavelmente gerados/omitidos — precisam ser implementados ou são arquivos faltantes)
- O `App.tsx` importa `firebaseService` de `./services/firebaseService` que não está no repositório entregue
- O `V2Dashboard.tsx` usa `../../src/services/v2Service` com path relativo estranho (`../../src/`)

### Funcionais
- Não há endpoint público para buscar dados de um lutador sem auth (necessário para integração com HxH5e)
- A resolução automática de NPC matches (`v2Service.resolveNPCMatches()`) não tem endpoint no `api/index.ts` visível — pode estar nos arquivos de serviço ausentes
- Sem rate-limiting nos endpoints de compra/venda (proteção apenas por Firestore transactions)
- Backup/restore (`backupFighters`, `restoreFighters`) também chamados via serviço ausente
