# Proposta — Nível de Domínio de Categoria (Grau de Maestria em Nen)

> Documento de estudo. **Nada aqui foi implementado.** O objetivo é mapear o conceito do
> memorando/exposição oficial de HxH (os 4 graus de proficiência — Habilidoso, Excelente,
> Genial e Extremo) para o sistema atual do HxH5e e decidir, junto com você, qual abordagem
> seguir antes de mexer em código.

---

## 1. O que já existe no sistema (não confundir com a proposta)

O HxH5e **já implementa** o "hexágono de afinidade" entre categorias — isso é outro conceito,
descrito no anime como "afinidade com o tipo vizinho". Está em
[js/data/nen-affinity.js](js/data/nen-affinity.js):

- `window.CATEGORY_AFFINITY` (linha 226) — tabela fixa por categoria: adjacente = 80%,
  distância 2 = 60%, oposto = 40%. Especialização é tratada à parte.
- `window.calcCategoryAccess(charLevel, extremeRestrictionCount)` (linha 238) — converte
  nível efetivo do personagem em nível máximo de efeito acessível em cada faixa de afinidade
  (`pct100`, `pct80`, `pct60`, `pct40`).
- `window.getMaxLevelForCategory` / `window.acessoMaxPorCategoria` — aplicam essa tabela nos
  pickers de efeito de outra categoria (ex: `eg6`, `rm_e8`).

**Isso resolve "quanto de outra categoria eu consigo acessar"**, mas é igual para todo
personagem da mesma classe — não existe hoje nenhum conceito de "talento individual" ou
"grau de maestria na própria categoria", que é exatamente o que o memorando descreve nos
4 níveis (Habilidoso/Excelente/Genial/Extremo). É essa lacuna que a proposta abaixo cobre.

---

## 2. O conceito a mapear

| Grau (memorando) | PT sugerido | Ideia mecânica |
|---|---|---|
| 優 Skillful | **Habilidoso** | Nível "padrão" — bom domínio da própria categoria. Baseline, sem bônus extra. |
| 秀 Excellent | **Excelente** | Usuário acima da média, mas ainda não é um prodígio. |
| 天賦 Natural/Genius | **Genial** | Talento natural raro para Nen. |
| 極 Extreme | **Supremo** (ou "Extremo") | Ápice absoluto — raríssimo, poucos personagens da fic­ção chegam lá. |

Pontos-chave do texto que **precisam** virar regras (senão a feature vira só um adjetivo
decorativo):

1. É uma medida de **talento/domínio técnico da própria categoria**, não de poder de combate
   (Morel é Habilidoso e ainda assim um dos mais competentes; Meruem é Extremo em Emissão e
   também é fisicamente monstruoso — são eixos independentes).
2. **Não deve escalar automaticamente com o nível de personagem.** Se acoplarmos direto ao
   nível (ex.: nível 10+ = Extremo), perdemos exatamente a nuance que o memorando quer
   (personagens "fracos" narrativamente podem ser Genial/Extremo; "fortes" podem ser Habilidoso).
3. É **por categoria principal**, não um atributo geral do personagem — só faz sentido dentro
   do Nen que ele domina (o Kurapika do Emperor Time é o único caso de troca de grau/categoria
   no meio da história).

---

## 3. Duas abordagens possíveis

### A) Cosmético / narrativo (zero risco de balanceamento)

- Campo novo na ficha, só para *flavor*: `state.currentChar.grauDominio` (string, uma das 4).
- Aparece como uma badge ao lado da categoria de Nen na ficha e no card de lutador da Torre
  Celestial (ex.: 🔴 Extremo, 🟣 Genial, 🔵 Excelente, 🟢 Habilidoso — reaproveitando a paleta
  de cores que já existe em `palR` para pesos de restrição, só que ressignificada).
- **Sem efeito em P.N., custo de aura, acesso a efeitos, etc.**
- Prós: implementação trivial, impossível de desequilibrar o jogo, mestre pode atribuir
  livremente respeitando a lógica "não é sobre força bruta".
- Contras: é só um rótulo — não "faz nada" mecanicamente, pode parecer feature vazia pros
  jogadores.

### B) Mecânico (dá um efeito de jogo ao grau)

Cada grau acima de Habilidoso concede um pequeno bônus **restrito à categoria principal do
personagem** (nunca às categorias de afinidade cruzada — aquilo já é coberto pelo hexágono).
Exemplo de tabela (só ilustrativa, a calibrar):

| Grau | Bônus proposto |
|---|---|
| Habilidoso | — (baseline) |
| Excelente | +1 P.N. disponível por nível de personagem, só na categoria principal |
| Genial | Efeito acima + reduz em 5% o custo de aura de Hatsus feitos 100% na categoria principal |
| Supremo | Efeitos acima + o teto de nível de efeito da própria categoria (`pct100` em
  `calcCategoryAccess`) é tratado como se o personagem tivesse +1 nível efetivo |

- Prós: o grau "faz algo", dá motivo pro jogador se importar com ele.
- Contras: se for escolha livre do jogador, vira "escolha sempre Supremo" (power creep). Precisa
  de um **gate** — ver seção 4.

### Recomendação

Nem A puro, nem B liberado. O ponto do memorando é justamente que o grau **não é uma escolha
de otimização, é um traço narrativo raro** — então o gate certo não é "pagar P.N.", é
**aprovação de mesa / critério narrativo**, com o mecânico de B como recompensa leve, não como
sistema de compra. Estrutura proposta na seção 4.

---

## 4. Proposta recomendada (híbrida, com gate narrativo)

### 4.1 Modelo de dados

```js
// Novo campo em state.currentChar (paralelo a class, level, etc.)
state.currentChar.grauDominio = {
  tier: 'habilidoso',       // 'habilidoso' | 'excelente' | 'genial' | 'supremo'
  categoria: null,          // por padrão = state.currentChar.class; só difere em casos tipo Kurapika
  aprovadoPorMestre: false, // Excelente/Genial/Supremo exigem true pra valer a mecânica (seção B)
  justificativa: ''         // texto livre: por que a mesa decidiu esse grau (histórico/arco)
};
```

- Todo personagem novo nasce **Habilidoso** por padrão (nenhuma ação necessária, comportamento
  atual do sistema não muda).
- Subir de grau é uma decisão de mesa (like um "marco de história"), não uma compra com P.N. —
  evita virar mais um item na lista de otimização do wizard de Hatsu.
- `aprovadoPorMestre` separa "o jogador está roleplayando/alegando esse grau" de "o mestre
  confirmou e os bônus mecânicos da seção B passam a valer". Enquanto for `false`, o grau é
  só cosmético (abordagem A) — dá pra declarar na ficha sem desbalancear nada até o mestre
  validar.

### 4.2 Onde isso entra no código existente

Sem alterar a assinatura de `calcCategoryAccess` (pra não quebrar quem já chama ela), a ideia
é um **bônus aditivo calculado antes** de chamar a função, só quando a categoria consultada é a
categoria principal do personagem:

```js
// Exemplo ilustrativo — NÃO aplicado ainda
window.GRAU_DOMINIO_BONUS = {
  habilidoso: 0,
  excelente:  0,   // efeito de Excelente é só em P.N., não em nível efetivo (ver 4.3)
  genial:     0,   // efeito de Genial é custo de aura, não em nível efetivo
  supremo:    1,   // Supremo: +1 nível efetivo, só na própria categoria
};

window.calcNivelEfetivoComDominio = function (char, hb) {
  const base = window.contarRestricoesExtremas ? window.contarRestricoesExtremas(hb) : 0;
  const grau = char.grauDominio;
  const bonusSupremo = (grau && grau.aprovadoPorMestre &&
                         (grau.categoria || char.class) === char.class)
    ? (window.GRAU_DOMINIO_BONUS[grau.tier] || 0)
    : 0;
  return { charLevel: (char.level || 1) + bonusSupremo, extremeCount: base };
};

// Uso: em vez de
//   window.calcCategoryAccess(char.level, extremos)
// passaria a ser
//   const { charLevel, extremeCount } = window.calcNivelEfetivoComDominio(char, hb);
//   window.calcCategoryAccess(charLevel, extremeCount)
```

Para o bônus de **Excelente** (P.N. extra) e **Genial** (redução de custo de aura), os pontos
de integração seriam:

- `window.calcPNDisponivelParaHatsu(char, editingIdx)` — somar o bônus de P.N. do grau antes
  de retornar o total disponível.
- `window.calcAuraCost(hb)` — se `hb` pertence à categoria principal do personagem e o grau é
  Genial/Supremo, aplicar mais um desconto (mesmo padrão que já existe pra `eg8`/`ri_e18`).

Nenhuma dessas funções precisaria mudar de assinatura — só ganhariam uma leitura opcional de
`state.currentChar.grauDominio` no meio do cálculo, com fallback pro comportamento atual quando
o campo não existir (compatibilidade com fichas antigas).

### 4.3 UI (esboço)

**Na ficha do personagem** (perto de onde hoje mostra a categoria de Nen):

```
┌─────────────────────────────────────────┐
│  🟡 EMISSÃO                              │
│  Grau de Domínio: 🟣 Genial              │
│  [Alterar grau — requer aprovação do ME] │
└─────────────────────────────────────────┘
```

Clicar em "Alterar grau" abre um seletor com as 4 opções, cada uma com a descrição do
memorando (tooltip com os nomes de personagens de exemplo — Morel/Razor/Shizuku para
Habilidoso, etc.), e um checkbox "Aprovado pelo mestre" que só o mestre/admin marcaria
(reaproveitando o mesmo tipo de gate de permissão que `ADMIN_USERS`/`NPC_ADMIN_ID` já usam
na Torre Celestial).

**No card de lutador da Torre Celestial** (`CharacterHeader.tsx` / listagem de `tc_fighters`):
badge pequena ao lado do nome, só leitura — dá um tempero pra quem está apostando ver "esse
lutador é classificado como Genial em Transmutação".

### 4.4 Calibragem dos bônus (a decidir com você)

Os valores da tabela da seção 3-B são só ponto de partida. Antes de implementar, vale fechar:

1. Os bônus valem só para a **categoria primária**, ou também para a categoria secundária de
   afinidade (`tipoB` do Hatsu)?
2. Personagens de Especialização (Chrollo, Pitou) — o grau se aplica à "categoria" deles do
   mesmo jeito, ou Especialização precisa de uma régua própria (já que ela tem regra de acesso
   diferente via `checkEspecializacaoAccess`)?
3. Isso deveria ser **por personagem** (ficha do jogador) ou também precisa existir pra NPCs
   da Torre Celestial (lutadores cadastrados por `NPC_ADMIN_ID`)? Se sim, o campo teria que
   também viver em `tc_fighters` (ou em `characters`, já que a Torre lê a ficha de lá).

---

## 5. Se decidirmos seguir, ordem de implementação sugerida

1. Adicionar `grauDominio` ao objeto de personagem (`state.currentChar`) com valor padrão
   `habilidoso` — sem nenhum efeito mecânico ainda (só abordagem A / cosmético).
2. Adicionar a badge na ficha (HxH5e.html) e um seletor simples (sem gate de aprovação ainda,
   só pra validar a UI).
3. Só depois de aprovar a UI, decidir os itens da seção 4.4 e então plugar os bônus nas funções
   de `js/data/nen-affinity.js` citadas acima.
4. Por último, se fizer sentido, espelhar o campo pro lado da Torre Celestial (leitura apenas,
   como badge no card do lutador).

---

## 6. Perguntas em aberto pra você decidir antes de eu mexer em qualquer coisa

- [ ] Seguimos com a abordagem híbrida (cosmético por padrão + mecânico só com aprovação do
      mestre), ou você prefere puramente cosmético (A) ou liberado sem gate (B)?
- [ ] Os nomes em português dos 4 graus — "Habilidoso / Excelente / Genial / Supremo" — servem,
      ou você quer manter mais perto do inglês ("Skillful / Excellent / Genial / Extremo")?
- [ ] Bônus mecânicos ficam como esboçado (P.N. extra / desconto de aura / +1 nível efetivo),
      ou prefere outro efeito (ex.: vantagem em testes de Ten/Ren/Zetsu na categoria principal)?
- [ ] Vale a pena estender pra Torre Celestial (NPCs/lutadores) já nessa primeira leva, ou só
      ficha de personagem por enquanto?
