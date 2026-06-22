# StudioHxH — Hunter x Hunter 5e RPG

Projeto de RPG baseado em Hunter x Hunter, com sistema de Nen (aura) adaptado para D&D 5e.
Contém dois sistemas integrados: **HxH5e** (ficha de personagem) e **Torre Celestial** (arena de apostas/lutas).

---

## Estrutura de arquivos

```
HxH5e.html                              — App principal (ficha de personagem, ~6000+ linhas)
index.tsx                               — NEN Architect (construtor de Hatsu com IA)
style.css                               — Estilos compartilhados
js/                                     — Módulos JS do HxH5e (auth, views, core)
torre/                                  — Build estático da Torre Celestial (output do Vite)
supabase/migrations/                    — Migrações SQL do Supabase
"Torre Celestial ZIP/App-Torre-Celestial-main/" — Código-fonte React da Torre
```

---

# TORRE CELESTIAL

Sistema de arena de apostas para personagens do HxH5e. React + TypeScript + Vite + Supabase.

## Visão geral

- **Sem backend Express** — todas as operações usam Supabase direto (anon key com RLS permissiva)
- **Operações atômicas** usam funções PL/pgSQL com `SECURITY DEFINER` (bypassa RLS)
- **Build**: `cd "Torre Celestial ZIP/App-Torre-Celestial-main" && npm run build`
  - Output em `../../torre/` (servido como subdiretório do HxH5e)
- **Dois apps, mesma origem**: HxH5e e Torre rodam em `127.0.0.1:5500`, compartilhando localStorage

## SSO (Single Sign-On)

O HxH5e escreve a sessão no localStorage e a Torre lê automaticamente:

```
hxh_hunter_session  → JSON com { id, username, discriminator, avatar (URL completa), roles, email }
hxh_tc_token        → 'hxh_bridge' (placeholder; ops reais usam Supabase direto)
```

`js/auth/auth.js` → `writeTorreSession(user, roles)`:
- Discord: avatar é hash → converte para `https://cdn.discordapp.com/avatars/{id}/{hash}.png`
- Google: avatar já é URL completa → usa direto
- PAID_USERS e ADMIN_USERS recebem roles `["1100984179845505044", "1100415887971991572"]` (Investidor + Staff)
- Google login também chama `writeTorreSession` nos dois caminhos de auth

## Auth — IDs de usuário

| Contexto | Formato |
|----------|---------|
| `hxh_hunter_session.id` (Discord) | `"833442073..."` (raw) |
| `hxh_hunter_session.id` (Google) | `"google_103..."` |
| `tc_users.id` | `"discord:833442073..."` (normalizado) |
| `tc_users.discord_id` | `"833442073..."` (raw) |
| `characters.user_id` | Raw ID (Discord ou `google_XXX`) |
| `tc_fighters.owner_id` | `"discord:833442073..."` (normalizado) |

**Regra**: `norm(id)` = `id.startsWith('discord:') ? id : `discord:${id}``

## Roles do Discord (RBAC)

```ts
DISCORD_ROLES = {
  JUDGE:    ["1100415887971991572", "1263215631784869949", "1335940980628521000"],
  INVESTOR: ["1100984179845505044"]
}
ADMIN_USERS = ["513323323355037717", "1262779092646758404", "521367784013922304", "741703273188229150"]
NPC_ADMIN_ID = "513323323355037717"  // personagens NPC cadastrados nessa conta
```

## Views do App

```
appView === 'SELECT'  → ModeSelector (tela de escolha entre V1 e V2)
appView === 'CLASSIC' → V1 Classic (CharacterHeader + tabs + ProfileManager)
appView === 'NEW'     → V2Dashboard (sistema completo com apostas em tempo real)
```

## Supabase — Tabelas principais

| Tabela | Chave | Propósito |
|--------|-------|-----------|
| `tc_users` | `id` = `discord:ID` | Investidores e lutadores da Torre |
| `tc_fighters` | `id` = `discord:ID____nome` | Lutadores registrados (owner_id → tc_users.id) |
| `tc_quotes` | `(fighter_id, user_id)` | Cotas detidas por investidores |
| `tc_transactions` | uuid | Ledger imutável de transações |
| `tc_pending_transactions` | uuid | Saques/depósitos aguardando aprovação admin |
| `tc_fights` | uuid | Histórico de lutas (imutável) |
| `tc_npc_matches` | uuid | Partidas automáticas NPC vs jogador |
| `tc_notifications` | uuid | Notificações por usuário |
| `tc_backups` | id | Snapshots do estado da arena |
| `characters` | id | Fichas RPG do HxH5e (pertence a HxH5e, não à Torre) |

**Atenção**: `characters` é a tabela do HxH5e (fichas de personagem). `tc_fighters` é da Torre (lutadores registrados na arena). São sistemas separados com relação indireta.

## Funções RPC atômicas (SECURITY DEFINER)

```sql
tc_buy_quote(TEXT, TEXT, INT, INT)          -- userId, fighterId, amount, price
tc_sell_quote(TEXT, TEXT, INT, INT)
tc_record_fight(TEXT, TEXT, TEXT, TEXT, BOOLEAN)
tc_process_pending_tx(TEXT, TEXT, TEXT, TEXT)
```

## Arquivos-chave da Torre (fonte em `Torre Celestial ZIP/App-Torre-Celestial-main/`)

```
App.tsx                          — Root: estado global, roteamento de views
src/supabase.ts                  — Cliente Supabase + SessionUser + helpers de sessão
src/services/v2Service.ts        — Toda a lógica de negócio da Torre (sem Express)
components/CharacterHeader.tsx   — Header com avatar, nome do jogador/personagem, seletor
components/ProfileManager.tsx    — Lista e seleção de personagens (busca na tabela 'characters')
components/v2/V2Dashboard.tsx    — Dashboard principal V2 com subscrições Realtime
components/v2/V2EconomyModals.tsx— Modais de depósito, registro de lutador, etc.
constants.ts                     — DISCORD_ROLES, ADMIN_USERS, NPC_ADMIN_ID, INITIAL_CHARACTER
types.ts                         — Interfaces TypeScript (Character, DiscordUser, etc.)
```

## Comportamentos importantes

**ProfileManager** (SELETOR DE PERFIL HUNTER — V1 Classic):
- Busca `characters` por `user_id = discordUser.id` (sem normalização)
- Mostra cards com avatar, nome, nenType, floor, level
- "Buscar Personagem" re-fetcha do banco; máximo 2 personagens ativos

**CharacterHeader**:
- Avatar: `activeSbFighter?.image_url || discordUser?.avatar`
- Nome grande: `activeSbFighter?.name || discordUser?.username || character.name`
- Dropdown "Escolher Personagem": busca `tc_fighters` por `owner_id = discord:{userId}`

**V2RegisterFighterModal** — 3 origens:
- `SELF`: busca `characters` do usuário → auto-preenche formulário
- `OTHER` (admin): lista `tc_users` → seleciona usuário → busca `characters` dele
- `NPC` (admin): busca `characters` do NPC_ADMIN_ID (`513323323355037717`)
- Submissão: chama `v2Service.registerFighter()` direto (sem fetch para Express)

**v2Service** — padrão de subscriptions:
```ts
subscribeTable(tableName, fetchFn, callback, onError): UnsubFn
// Usa Supabase Realtime + polling inicial
```

## Build e deploy local

```powershell
# Compilar Torre Celestial
cd "Torre Celestial ZIP\App-Torre-Celestial-main"
npm run build
# Output: StudioHxH/torre/index.html + assets/

# Servir (Live Server do VSCode em StudioHxH/)
# HxH5e.html → http://127.0.0.1:5500/HxH5e.html
# Torre      → http://127.0.0.1:5500/torre/
```

## Armadilhas comuns

1. **`tc_fighters` vazio no header**: verificar se `owner_id` bate com `discord:{discordUser.id}` — usuários antigos podem ter owner_id diferente
2. **Acesso Restrito no login**: `writeTorreSession` não foi chamado (ex: Google auth antes da correção) — roles estão vazias
3. **Avatar quebrado**: Discord avatar é hash, não URL — precisa construir `cdn.discordapp.com/avatars/{id}/{hash}.png`
4. **Characters vs tc_fighters**: `characters` usa `user_id` raw; `tc_fighters` usa `owner_id` normalizado (`discord:ID`)
5. **Não adicionar nada ao Express** (`api/index.ts`) — o backend foi eliminado; tudo vai direto no Supabase via `v2Service`

---

# HxH5e.html — Ficha de Personagem

Aplicação standalone de ~750KB em HTML/CSS/JS vanilla. Sem build, sem bundler. Abre direto no browser.

## Arquitetura geral

- **`state`** — objeto global reativo (linha ~630). Toda a UI é re-renderizada chamando `render()`.
- **`render()`** — função top-level que atualiza o DOM com base em `state.view` e `state.activeTab`.
- **`renderHatsuInPlace()`** (linha ~5412) — re-renderiza apenas a seção de criação de Hatsu sem recarregar toda a ficha.

## Auth (js/auth/auth.js)

Suporte a Discord OAuth e Google OAuth no mesmo arquivo.

```js
// Caminhos de login → escrevem hxh_hunter_session:
checkDiscordAuth()  → PAID_USERS/ADMIN_USERS path: writeTorreSession(user, [investorRoleId, judgeRoleId])
checkDiscordAuth()  → guild member path:           writeTorreSession(user, member.roles)
checkDiscordAuth()  → Google resume path:           writeTorreSession(state.user, [investorRoleId, judgeRoleId])
loginGoogle()       → callback success:             writeTorreSession(state.user, [investorRoleId, judgeRoleId])

// Logout → limpa Torre session:
logoutDiscord() → remove hxh_hunter_session + hxh_tc_token
logoutGoogle()  → remove hxh_hunter_session + hxh_tc_token + google_access_token
```

`PAID_USERS` (definido em HxH5e.html) — usuários que bypassam verificação de cargo do Discord mas recebem roles completas na Torre.

## Sistema de Hatsu (criador de Hatsus)

`state.hatsuBuilder` (hb) guarda todo o estado do wizard de criação:

```js
{
  step: 0,           // 0=tipo, 1=nome/desc, 2=restrições, 3=efeitos gerais, 4=efeitos categoria
  nome: '',
  descricao: '',
  tipoA: '',         // Categoria principal (ex: 'MATERIALIZAÇÃO')
  tipoB: '',         // Categoria secundária (opcional)
  rg: [],            // IDs de restrições gerais selecionadas
  rc: [],            // IDs de restrições de categoria selecionadas
  eg: [],            // IDs de efeitos gerais selecionados
  ec: [],            // IDs de efeitos de categoria selecionados
  beneficioChoices: {},   // { [id]: string } — escolha quando bnf tem " ou "
  pureRestrictions: {},   // { [id]: true } — restrições marcadas como "pura"
  specialChoices: {},     // { [id]: any } — dados extras por ID (texto, objeto, array)
  filterText: '',
  filterStatus: 'todos',
  filterRestrPeso: 'todos',
  openAccordions: [...],
  restrTab: 'gerais',
}
```

## Banco de dados — window.HATSU_DB (linha ~3503)

```js
window.HATSU_DB = {
  restricoes_gerais: { leves, moderadas, pesadas, variaveis, extremas },
  efeitos_gerais: [],
  categorias: {
    'INTENSIFICAÇÃO': { efeitos: [], restricoes: [] },
    'TRANSMUTAÇÃO':   { efeitos: [], restricoes: [] },
    'MATERIALIZAÇÃO': { efeitos: [], restricoes: [] },
    'CONJURAÇÃO':     { efeitos: [], restricoes: [] },
    'MANIPULAÇÃO':    { efeitos: [], restricoes: [] },
    'EMISSÃO':        { efeitos: [], restricoes: [] },
    'ESPECIALIZAÇÃO': { efeitos: [], restricoes: [] },
  }
}
```

Estrutura de restrição: `{ id, nome, desc, bnf, peso }` onde `peso` é `'leve'|'moderada'|'pesada'|'variavel'|'extrema'`.

Estrutura de efeito: `{ id, nome, desc, req, pn }` onde `req` é uma string como `"Nível 3"` ou `"Nível 5 + INT 2+"`.

## Regras importantes de acesso

- **Especialização**: personagens de outras categorias NÃO podem acessar efeitos/restrições de ESPECIALIZAÇÃO, exceto MANIPULAÇÃO e MATERIALIZAÇÃO (via regra de 1% de afinidade).
- Guards de acesso ficam em `window._hToggleR` e `window._hToggleE` — verificam `state.currentChar.class`.
- `window.CATEGORY_AFFINITY` (linha ~3155) — mapa de afinidade entre categorias.
- `window.calcCategoryAccess(charLevel, extremeCount)` — retorna `{ pct100, pct80, pct60, pct40 }` (níveis máximos por categoria).
- Nível efetivo: `Math.min(12, charLevel + extremeCount * 2)` (restrições extremas dão +2 níveis cada).

## Funções de render principais

| Função | Descrição |
|--------|-----------|
| `renderHatsuCreator()` | Wizard completo de criação de Hatsu (steps 0–4) |
| `renderR(items, arr, tipo)` | Renderiza cards de restrições; `tipo='rg'` (geral) ou `'rc'` (categoria) |
| `renderE(items, arr, tipo, color)` | Renderiza cards de efeitos |
| `buildFilterBar(showStatusFilter, accentColor)` | Barra de busca + filtros |

## Funções globais de interação (window._h*)

| Função | O que faz |
|--------|-----------|
| `window._hToggleR(id, tipo)` | Seleciona/deseleciona restrição |
| `window._hToggleE(id, tipo, pn)` | Seleciona/deseleciona efeito |
| `window._hTogglePure(id)` | Marca restrição como "pura" |
| `window._hSetBeneficioChoice(id, choice)` | Define escolha de benefício alternativo (bnf com " ou ") |
| `window._hSetBeneficioChoiceIdx(id, idx)` | Define benefício por índice |
| `window._hSetSpecialChoice(id, value)` | Define valor em `hb.specialChoices[id]` |
| `window._hSetSpecialText(id, value)` | Alias de `_hSetSpecialChoice` para inputs de texto |
| `window._hToggleReP1Effect(effId)` | Toggle de efeito no picker da restrição `re_p1` |

## Restrições com UI especial (specialInputHtml em renderR)

| ID | Restrição | Tipo de input |
|----|-----------|---------------|
| `rg_p8` | Local/condição de ativação | Campo de texto livre |
| `rg_e5` | Juramento | Textarea |
| `rg_v10` | Zetsu por Falha | Picker de rodadas (1–6) + alcance/área |
| `rg_l9`, `rg_l10` | Bônus de alcance/área | Botões Alcance/Área |
| `rma_m2` | Zetsu Interrompe | Botões de efeito (dano san vs bônus jogadas) |
| `re_p1` | Inconsciente Após Uso (Especialização) | Picker de 2 efeitos (gerais + categoria), filtrado por nível |

Para adicionar nova restrição especial:
1. Adicione bloco `if (sel && item.id === 'novo_id') { specialInputHtml += '...'; }` em `renderR` (após os blocos existentes)
2. Adicione `item.id !== 'novo_id'` na condição de `choiceHtml` (linha ~3977) se o `bnf` tiver " ou "
3. Se precisar de função de toggle global, adicione `window._hSetNome = function(...) {...}` próximo aos outros `window._h*` (linha ~5565)

## Paleta de cores por peso (palR)

```js
palR = {
  leve:     { bs:'#22c55e', ... },
  moderada: { bs:'#eab308', ... },
  pesada:   { bs:'#ef4444', ... },
  variavel: { bs:'#a855f7', ... },
  extrema:  { bs:'#f97316', ... },
}
```

---

## index.tsx — NEN Architect

Aplicação React standalone com Google Generative AI (Gemini). Usa Tailwind via CDN e Lucide React para ícones.

- **Sem backend/serverless** — toda a lógica é client-side.
- API key do Google GenAI configurada no próprio arquivo.
- `NenType`: `'Reforço' | 'Transmutação' | 'Materialização' | 'Emissão' | 'Manipulação' | 'Especialização'`
- `CATEGORY_EFFECTS_MAP` — lookup de efeitos por categoria (todas as 6 categorias + Geral).
- `RESTRICTIONS_DB` — `Record<string, Restriction[]>` com 'Geral', 'Variáveis' + 6 categorias.

---

## Categorias de Nen (classes)

| Nome no HxH5e.html | Equivalente no manual |
|--------------------|-----------------------|
| INTENSIFICAÇÃO     | Reforço               |
| TRANSMUTAÇÃO       | Transmutação          |
| MATERIALIZAÇÃO     | Conjuração            |
| CONJURAÇÃO         | Conjuração (alt.)     |
| MANIPULAÇÃO        | Manipulação           |
| EMISSÃO            | Emissão               |
| ESPECIALIZAÇÃO     | Especialização        |

---

## Convenções de código em HxH5e.html

- Todo o JS fica dentro de uma única `<script>` tag no final do `<body>`.
- Prefixo `rg_` = restrição geral, `rc_` / `ri_` / `rma_` / `re_` = restrições de categoria.
- Prefixo `eg_` = efeito geral, `ec_` / outros = efeitos de categoria.
- IDs de restrição são únicos no banco inteiro (não repetir entre categorias).
- Para re-renderizar após mudança de estado: chamar `renderHatsuInPlace()` (dentro do wizard) ou `render()` (fora).
- Eventos inline nos elementos HTML chamam `window._h*` diretamente.
- `event.stopPropagation()` é obrigatório em botões internos para não propagar o clique para o card pai (que togglaria a seleção).
