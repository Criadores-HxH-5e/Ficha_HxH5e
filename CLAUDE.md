# StudioHxH — Hunter x Hunter 5e RPG

Projeto de RPG baseado em Hunter x Hunter, com sistema de Nen (aura) adaptado para D&D 5e.

## Estrutura de arquivos

```
HxH5e.html                            — App principal (ficha de personagem completa, ~6000+ linhas)
index.tsx                             — NEN Architect (construtor de Hatsu com IA, React + Google GenAI)
style.css                             — Estilos compartilhados
HB-HunterxHunter5ev2.0 (1).txt       — Manual principal do sistema
HB-ManualdeHatsusHxH5eRPG2.0.txt     — Manual de criação de Hatsus
HB-EnciclopédiaHunterdeRaçaseBestas Magicas.txt — Enciclopédia de raças e bestiário
```

---

## HxH5e.html — Ficha de Personagem

Aplicação standalone de ~750KB em HTML/CSS/JS vanilla. Sem build, sem bundler. Abre direto no browser.

### Arquitetura geral

- **`state`** — objeto global reativo (linha ~630). Toda a UI é re-renderizada chamando `render()`.
- **`render()`** — função top-level que atualiza o DOM com base em `state.view` e `state.activeTab`.
- **`renderHatsuInPlace()`** (linha ~5412) — re-renderiza apenas a seção de criação de Hatsu sem recarregar toda a ficha.

### Sistema de Hatsu (criador de Hatsus)

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

### Banco de dados — window.HATSU_DB (linha ~3503)

```js
window.HATSU_DB = {
  restricoes_gerais: { leves, moderadas, pesadas, variaveis, extremas },  // arrays de restrições
  efeitos_gerais: [],   // array de efeitos gerais
  categorias: {         // uma entrada por categoria de Nen
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

### Regras importantes de acesso

- **Especialização**: personagens de outras categorias NÃO podem acessar efeitos/restrições de ESPECIALIZAÇÃO, exceto MANIPULAÇÃO e MATERIALIZAÇÃO (via regra de 1% de afinidade).
- Guards de acesso ficam em `window._hToggleR` e `window._hToggleE` — verificam `state.currentChar.class`.
- `window.CATEGORY_AFFINITY` (linha ~3155) — mapa de afinidade entre categorias.
- `window.calcCategoryAccess(charLevel, extremeCount)` — retorna `{ pct100, pct80, pct60, pct40 }` (níveis máximos por categoria).
- Nível efetivo: `Math.min(12, charLevel + extremeCount * 2)` (restrições extremas dão +2 níveis cada).

### Funções de render principais

| Função | Descrição |
|--------|-----------|
| `renderHatsuCreator()` | Wizard completo de criação de Hatsu (steps 0–4) |
| `renderR(items, arr, tipo)` | Renderiza cards de restrições; `tipo='rg'` (geral) ou `'rc'` (categoria) |
| `renderE(items, arr, tipo, color)` | Renderiza cards de efeitos |
| `buildFilterBar(showStatusFilter, accentColor)` | Barra de busca + filtros |

### Funções globais de interação (window._h*)

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

### Restrições com UI especial (specialInputHtml em renderR)

Algumas restrições precisam de input adicional após seleção. O HTML extra é construído na variável `specialInputHtml` dentro de `renderR` e salvo em `hb.specialChoices[id]`:

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

### Paleta de cores por peso (palR)

```js
palR = {
  leve:     { bs:'#22c55e', ... },   // verde
  moderada: { bs:'#eab308', ... },   // amarelo
  pesada:   { bs:'#ef4444', ... },   // vermelho
  variavel: { bs:'#a855f7', ... },   // roxo
  extrema:  { bs:'#f97316', ... },   // laranja
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

> Nota: no `index.tsx` os nomes usam acentuação e capitalização diferente das usadas como keys no `HATSU_DB`.

---

## Convenções de código em HxH5e.html

- Todo o JS fica dentro de uma única `<script>` tag no final do `<body>`.
- Prefixo `rg_` = restrição geral, `rc_` / `ri_` / `rma_` / `re_` = restrições de categoria.
- Prefixo `eg_` = efeito geral, `ec_` / outros = efeitos de categoria.
- IDs de restrição são únicos no banco inteiro (não repetir entre categorias).
- Para re-renderizar após mudança de estado: chamar `renderHatsuInPlace()` (dentro do wizard) ou `render()` (fora).
- Eventos inline nos elementos HTML chamam `window._h*` diretamente.
- `event.stopPropagation()` é obrigatório em botões internos para não propagar o clique para o card pai (que togglaria a seleção).
