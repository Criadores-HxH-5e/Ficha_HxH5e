// ── Tabela de Dano e mapas de Grau/Passo (rev. Manual 2.0) ──────────────────
// Hoisted para o escopo do módulo (window.*) para serem reaproveitados fora de renderHatsuDetail,
// por ex. em window.calcGrausPotenciaPorCaracteristica (usado no criador para o limite de grau por nível).

// rev. Manual 2.0 — Tabela de grau/passo de dados de dano por % de aura
window.DAMAGE_TABLE = [
    '1d4','1d6','1d8','1d10','1d12',
    '2d6',  // ← índice 5 (base)
    '2d8','2d10','2d12','3d10','4d8','3d12',
    '4d10','4d12','5d10','7d8','6d10','8d8',
    '7d10','6d12','8d10','7d12','9d10','8d12',
    '10d10','9d12','11d10','10d12','13d10','11d12',
    '14d10','12d12','15d10','13d12','16d10','14d12',
    '17d10','15d12','19d10','16d12','20d10','17d12',
    '18d12','19d12','20d12','13d20','14d20','15d20',
    '16d20','18d20','20d20',
    // Fim da tabela do manual: depois do 20d20 cada degrau soma +5 fixo.
    '20d20+5','20d20+10','20d20+15'
];
window.BASE_DAMAGE_IDX = 5; // 2d6
window.DAMAGE_OVERFLOW_STEP = 5; // ao passar do fim da tabela (20d20), cada grau extra vira +5 de dano fixo (REN)

// Graus de dano concedidos por restrições/efeitos específicos
window.DANO_GRAU_MAP = {
    // Restrições gerais
    'rg_l1':  1,  // Cálculo Pensado Básico 1 → +1 Grau/Passo
    'rg_l7':  1,  // "Diálogo" → +1 Grau/Passo Dano
    'rg_l11': 1,  // Limitação de Alvos → +1 Grau/Passo (rev. Manual 2.0: era +1 dado)
    'rg_l16': 1,  // Tempo de Carregamento → +1 Grau/Passo (rev. Manual 2.0: era +1 dado)
    'rg_l17': 1,  // Condição Levemente Hostil → +1 Grau/Passo (só se escolheu "+1 Contra o Alvo" + sub-escolha "Dano")
    'rg_m1':  2,  // Alvo Único em Combate → +2 Grau/Passo Dano
    'rg_m13': 2,  // Zetsu Protetivo → +2 Grau/Passo (inclui dano)
    'rg_p9':  3,  // Perda de Membros → +3 grau de potência
    'rg_v2':  1,  // Canalizar com Concentração → +X (mín 1) — só se a escolha for Dano/Cura (ver DURACAO_GRAU_MAP p/ a outra opção)
    // "Adicione N Graus de Potência em qualquer característica" — RAW é livre-escolha; o sistema
    // simplifica atribuindo a Dano/Cura para não deixar a restrição de fora do limite por nível
    // (mesma simplificação já usada para eg7/rg_p9, que também são "qualquer característica").
    'rg_p1':  3,  // Alto Risco...
    'rg_p3':  3,  // Dano Permanente
    'rg_p5':  3,  // Efeitos Aleatórios (só se a escolha NÃO for "Margem de Crítico")
    // Restrições de categoria
    'ri_l1':  1,  // PV < 75% → +1 grau/passo dano
    // 'rt_m1' (Perde 5% de aura extra ao errar) saiu daqui. O benefício da restrição é
    // "Se atingir, causa 1 Condição fraca adicional" — condição, não grau. Ela estava
    // dando +2 de dano que a regra não concede. A condição é escolhida no criador.
    // ri_m1 (Aumento por Rodada) saiu daqui: ver GRAU_DIRIGIDO_IDS — o jogador escolhe
    // QUAL efeito comprado recebe os +2 graus, em vez de caírem sempre no dano base.
    'ri_m3':  1,  // Inutilizável c/ +50% Aura (Reforço) → +1 Grau de Potência no Hatsu (simplificado como Dano)
    'rt_l1':  1,  // Preparação Obrigatória (Transmutação) → +1 Grau de Potência no Hatsu (simplificado como Dano)
    're_l2':  2,  // Nome Verdadeiro do Alvo (Especialização) → +2 Graus de Potência no Hatsu (simplificado como Dano)
    're_l3':  1,  // Terreno Específico (Especialização) → +1 Grau de Potência no Hatsu (simplificado como Dano)
    're_p2':  2,  // Uso Único por Sessão (Especialização) → +2 Graus de Potência no Hatsu (simplificado como Dano)
    'em_m2':  1,  // Distância Reduzida ao Mover (Emissão) → +1 Grau de Potência (simplificado como Dano)
    // ── Efeitos que sobem o GRAU/PASSO DO DANO BÁSICO ────────────────────────────
    // Só entram aqui os que realmente empurram a escada do dano básico (2d6 → 2d8 → …).
    // Antes, todo o bloco de Intensificação (ri_e1..ri_e30) estava aqui, incluindo efeitos
    // que não têm nada a ver com dano: Aumento de Atributo, Mais de 8000 (divide aura),
    // Postura de Ferro (imune a empurrão), Vitalidade Extra (recupera PV), Equiparação,
    // Potencial Liberado, Barreira Interna (RD). Todos saíram.
    // Os que concedem dano PRÓPRIO (Fúria Potencializada, Penetração Dolorosa, Explosão de
    // Aura, Carga de Energia…) também saíram: eles escalam o próprio dado/valor, não o
    // dano básico — ver DANO_PROPRIO_MAP.
    // Benefícios de restrição continuam contando (bloco acima).
    'eg7':    1,  // Poder Valioso → +1 Grau de potência
    'eg15':   1,  // Dano/Cura Focal → +1 grau/passo no dano básico
};

// ── Efeitos cujo grau é ESCOLHIDO pelo jogador ────────────────────────────────
// Aumentar um atributo melhora acerto, CD do TR e o dano somado no final ao mesmo tempo.
// Como o teto é por característica, o jogador escolhe onde o grau é contabilizado, do
// mesmo jeito que já acontece no Cálculo Pensado Básico. A escolha fica em
// specialChoices[id] e aparece na tela do Hatsu.
window.GRAU_ESCOLHIDO_EFEITOS = {
    // Intensificação segue as características de Grau de Potência da CATEGORIA do usuário
    // (Manual: "Adicione N graus usando qualquer uma das características abaixo"), então as
    // opções são montadas em tempo de execução — ver grauEscolhidoOpcoes().
    'ri_e2': { graus: 1, porCategoria: true },
};

// Características de Grau de Potência por categoria, na redação do manual.
// Mesma lista do GRAUS_POR_CAT (js/init.js), usada nos 5 Graus do 1º Hatsu.
window.GRAU_OPCOES_POR_CATEGORIA = {
    // Acerto saiu de Reforço/Intensificação: era duplicado. Aumentar um atributo já melhora
    // a jogada de ataque (e as perícias), então "Atributos" cobre o que "Acerto" cobria.
    'INTENSIFICAÇÃO': ['Atributos', 'Dano/Cura', 'Redução de Custo'],
    'REFORÇO':        ['Atributos', 'Dano/Cura', 'Redução de Custo'],
    'TRANSMUTAÇÃO':   ['Área', 'Dano/Cura', 'Redução de Custo'],
    'MATERIALIZAÇÃO': ['Alcance/Área', 'Duração', 'Redução de Custo'],
    'CONJURAÇÃO':     ['Alcance/Área', 'Duração', 'Redução de Custo'],
    'ESPECIALIZAÇÃO': ['Alcance/Área', 'Dano/Cura', 'Duração', 'CD do TR', 'Redução de Custo'],
    'MANIPULAÇÃO':    ['Alcance/Área', 'Número de Alvos', 'Duração', 'CD do TR', 'Redução de Custo'],
    'EMISSÃO':        ['Acerto', 'Alcance/Área', 'Redução de Custo'],
};

// Opções do picker de grau de um efeito, já resolvidas para a categoria do Hatsu.
// ── Aumento de Atributo (ri_e1): roteamento automático ────────────────────────
// O jogador escolhe QUAL atributo aumentar; onde o grau conta é consequência, não
// pergunta. Se o atributo aumentado é o mesmo usado na Jogada de Ataque do Hatsu, o
// grau consome o teto de Acerto. Se é o usado na CD do TR, consome o teto de CD. Pode
// consumir os dois quando for o mesmo atributo nos dois papéis — o benefício acontece
// nos dois. Se não for nenhum dos dois, não consome teto: vale só para perícias.
// Chaves: cópia 0 em 'ri_e1_attr', extras em 'ri_e1_attr#1', '#2'… (padrão do rm_e2).
window.atributosDeAumento = function (h) {
    const sc = (h && h.specialChoices) || {};
    const copias = ((h && h.efeitos) || []).filter(function (id) { return id === 'ri_e1'; }).length;
    const out = [];
    for (let i = 0; i < copias; i++) {
        const v = sc[i > 0 ? ('ri_e1_attr#' + i) : 'ri_e1_attr'];
        if (v) out.push(v);
    }
    return out;
};
// Quantos pontos de Aumento de Atributo caem em cada teto, dado o atributo de ataque
// e o de CD/dano configurados no Hatsu.
window.aumentoAtributoPorTeto = function (h, attrAtaque, attrCD) {
    const lista = window.atributosDeAumento(h);
    let acerto = 0, cd = 0;
    lista.forEach(function (a) {
        if (attrAtaque && a === attrAtaque) acerto++;
        if (attrCD && a === attrCD) cd++;
    });
    return { acerto: acerto, cd: cd, total: lista.length, lista: lista };
};

window.grauEscolhidoOpcoes = function (id, categoria) {
    const def = (window.GRAU_ESCOLHIDO_EFEITOS || {})[id];
    if (!def) return null;
    if (!def.porCategoria) return def.opcoes;
    return (window.GRAU_OPCOES_POR_CATEGORIA || {})[categoria] || ['Redução de Custo'];
};
window.GRAU_ESCOLHA_PARA_CHAVE = {
    'Acerto': 'acerto',
    'CD do TR': 'cd',
    'Dano/Cura': 'dano',
    'Área': 'area',
    'Alcance/Área': 'alcance',
    'Duração': 'duracao',
    // Estas três não têm TETO, mas agora SÃO rastreadas: o grau investido nelas aparece
    // nos painéis e recebe o piso da categoria e o +4 do Juramento Imutável.
    'Redução de Custo': 'custo',
    'Atributos': 'atributos',
    'Número de Alvos': 'alvos',
};

// +1 DADO: aumenta a QUANTIDADE de dados (ex: 2d6 → 3d6), aplicado ANTES dos graus
// "o maior" = usa o maior dado atual; "o menor" = usa 1 dado do mesmo tipo
window.DANO_DADO_MAP = {
    'rt_m3':  { n: 1, tipo: 'maior' }, // Condição no Usuário (Transmutação)
};

// Efeitos que CONCEDEM dano próprio (tornam o hatsu "com dano" independente do tipo)
// Estrutura: id → { dado, desc }
window.DANO_PROPRIO_MAP = {
    'eg10':   { dado: '1d10',     tipo: 'Psíquico',   desc: 'Flagelo da Mente' },
    'eg17':   { dado: '(contínuo)',tipo: 'Contínuo',   desc: 'Dor pra Disgrama!' },
    'ri_e11': { dado: '+ 1d8',    tipo: 'Extra',      desc: 'Golpe Reforçado' },
    'ri_e20': { dado: '+ 1d6',    tipo: 'Extra',      desc: 'Fúria Potencializada' },
    'rm_e1':  { dado: '2d6',      tipo: 'Arma/Objeto', desc: 'Forjar Objeto/Arma Conjurada' },
    'rc_e1':  { dado: '1d6',      tipo: 'Criatura',   desc: 'Invocar Criatura' },
    'rc_e9':  { dado: '1d8',      tipo: 'Corporal',   desc: 'Metamorfose Corporal' },
    // ── Emissão: os ids estavam DESLOCADOS ─────────────────────────────────────
    // O bloco inteiro foi escrito contra uma numeração antiga da categoria. Já tinha
    // sido limpo pela METADE: 'em_e6' e 'em_e9' saíram porque diziam "Canhão de Aura
    // 3d6" e "Bomba de Aura 4d6", efeitos que não existem — os ids são Transporte de
    // Cargas e Troca Estratégica, que não causam dano.
    // Faltava a outra metade, que é o que se corrige agora:
    //   'em_e1' estava como "Projétil de Aura 1d8" → em_e1 é AURA VIVA (constructos)
    //   'em_e3' estava como "Disparo Potente 2d6"  → em_e3 é PLANO AVANÇADO (marca)
    // Resultado em mesa: quem comprava Aura Viva ganhava 1d8 fantasma, quem comprava
    // Plano Avançado (que é uma marca, sem dano) ganhava 2d6 fantasma, e os efeitos
    // de verdade — em_e4 e em_e20 — não davam dano nenhum.
    'em_e20': { dado: '+ 2d6',    tipo: 'Potente',    desc: 'Disparo Potente' },
    // ── Efeitos que prometiam NÚMERO e não tinham destino ──────────────────────
    // Os quatro abaixo têm dano escrito no banco e nenhum deles aparecia em arquivo
    // de cálculo nenhum: o jogador comprava, lia "+5 de dano" no card e rolava sem o
    // +5. Levantado na auditoria de mecânicas decorativas de 28/10.
    'ri_e27': { dado: '+5 dano',  tipo: 'Titânica',   desc: 'Força Titânica (ataques físicos)' },
    'rm_e13': { dado: '+ 1d8',    tipo: 'Forja',      desc: 'Forja Avançada (Ação Bônus, 1x/rodada)' },
    'rt_e8':  { dado: '2d4',      tipo: 'Sangramento',desc: 'Anticoagulante (sangramento leve)' },
    'rt_e15': { dado: '2d8',      tipo: 'Sangramento',desc: 'Hemorragia Oculta (sangramento médio)' },
    'rt_e16': { dado: '+5 dano',  tipo: 'Ferida',     desc: 'Ferida Interna' },
    'ri_e12': { dado: '+5',       tipo: 'Perfurante', desc: 'Penetração Dolorosa' },
};

// ── Escala por efeito (cada efeito sobe o PRÓPRIO dano, não o dano básico) ─────
// Antes, comprar de novo um efeito destes multiplicava a quantidade de dados
// (2× Golpe Reforçado virava 2d8) e, pior, o efeito também empurrava a escada do
// dano básico. Agora cada um escala sozinho:
//  - tipo 'dado':  sobe 1 degrau na DAMAGE_TABLE por cópia extra (1d6 → 1d8 → 1d10…)
//  - tipo 'bruto': valor fixo que cresce de 'passo' por cópia extra (+5 → +6 → +7)
// O teto de Dano/Cura do nível limita o quanto cada efeito entrega: com teto 3, a
// Penetração Dolorosa libera +3 em vez de +5, e o resto fica reservado até o nível subir.
// Regra geral: TODO efeito que trabalha com dados usa a MESMA tabela de grau/passo
// (DAMAGE_TABLE). O que muda é o ponto de partida — o primeiro passo é o dado do
// próprio efeito. Comprar de novo SOBE UM DEGRAU, nunca acrescenta outro dado.
//   Dano/Cura Focal parte de 2d6 · Golpe Reforçado e Recuperação Veloz de 1d8 · etc.
// Antes só três efeitos tinham escada; os outros viravam linhas separadas a cada
// cópia, o que dava "mais dados" em vez de subir na escala.
window.DANO_PROPRIO_ESCALA = {
    'ri_e11': { tipo: 'dado',  base: '1d8' },          // Golpe Reforçado
    'ri_e20': { tipo: 'dado',  base: '1d6' },          // Fúria Potencializada
    'ri_e3':  { tipo: 'dado',  base: '1d8', cura: true }, // Recuperação Veloz
    'rm_e1':  { tipo: 'dado',  base: '2d6' },          // Forjar Objeto/Arma
    'rc_e1':  { tipo: 'dado',  base: '1d6' },          // Invocar Criatura
    'rc_e9':  { tipo: 'dado',  base: '1d8' },          // Metamorfose Corporal
    'em_e20': { tipo: 'dado',  base: '2d6' },          // Disparo Potente (era 'em_e3')
    // Força Titânica é valor BRUTO, como Penetração Dolorosa e Ferida Interna.
    'ri_e27': { tipo: 'bruto', base: 5, passo: 1 },
    // ── Ficam FORA desta tabela, de propósito ─────────────────────────────────
    // rm_e13 Forja Avançada: a própria descrição diz "Não é aumento de grau: é
    //   transformar a Ação Bônus em +1d8". Na escada, comprar de novo subiria o dado
    //   em vez de ser outro uso.
    // rt_e8 Anticoagulante e rt_e15 Hemorragia Oculta: sobem por CONDIÇÃO NÃO
    //   RESOLVIDA, não por grau/passo. O sangramento leve que ninguém trata vira
    //   médio — a escalada é do estado do alvo na mesa, não de REN nem de compra
    //   repetida. O que muda entre os dois é só o dado em que começam.
    'eg10':   { tipo: 'dado',  base: '1d10' },         // Flagelo da Mente (dano em SANIDADE)
    // Valor BRUTO sobe de 1 em 1, qualquer que seja a base: +5 vira +6, não +10.
    // Só os efeitos com DADO usam a tabela de grau/passo.
    'ri_e12': { tipo: 'bruto', base: 5, passo: 1 },    // Penetração Dolorosa
    'rt_e16': { tipo: 'bruto', base: 5, passo: 1 },    // Ferida Interna
};

// ── Graus/Passo em outras características (Alcance, Área, Duração, Acerto, CD) ──
// Conversão canônica de 1 grau por característica (mesma tabela usada nos "5 Graus do 1º Hatsu",
// GRAU_INFO em js/init.js): Acerto=+1, Dano=+1 passo, Duração=+1 rodada, CD=+1, Alcance=+1,5m,
// Área=+1,5m (rev. — Alcance passou de 3m/grau para 1,5m/grau, igualando a taxa de Área; os graus
// abaixo foram recalculados para preservar os mesmos metros de cada item, só refinando a granularidade).
// Bônus numéricos diretos (sem a palavra "Grau/Passo" no texto) são convertidos por essa tabela —
// não contados como "1 por compra" independente da magnitude.
window.ALCANCE_GRAU_MAP = {
    'rg_l9':  2, // Efeitos Neg. Exaustão 1 (escolha: Alcance ou Área): +3m = 2 graus
    'rg_l10': 2, // Interação Sensorial Simples (escolha: Alcance ou Área): +3m = 2 graus
    'rt_l2':  2, // Sem Movimento no Turno (Transmutação): +3m = 2 graus
    'em_l1':  4, // Linha Reta Apenas (Emissão): +6m = 4 graus
    'em_e2':  4, // Distância Segura: +6m = 6m ÷ 1,5m/grau = 4 graus
    // em_e14 SAIU daqui: pelo dicionário do livro, as duas opções da Expansão de
    // Domínio adicionam ÁREA — o que muda é o ponto de partida (6m a partir de si
    // quando o Hatsu não tem alcance além de toque, 3m quando já tem). O app lia a
    // opção "b" como Alcance, que é outra característica.
    'em_e20': 12, // Disparo Potente: +18m = 18m ÷ 1,5m/grau = 12 graus
};
window.AREA_GRAU_MAP    = {
    'rg_l9':  1,
    'rg_l10': 1, // Interação Sensorial Simples (escolha: Alcance ou Área): +1,5m = 1 grau
    'rt_m2':  1, // Sem Aliados a 3m (Transmutação): +1,5m = 1 grau
    'em_e2':  2, // Distância Segura: +3m = 3m ÷ 1,5m/grau = 2 graus
    // Expansão de Domínio: 4 graus (6m, partindo de si) ou 2 (3m, à distância).
    // O valor abaixo é o da opção de 6m; a de 3m é resolvida em grausExpansaoDominio.
    'em_e14': 4,
    'em_e20': 12, // Disparo Potente: +18m = 18m ÷ 1,5m/grau = 12 graus
};
// ── Expansão de Domínio (em_e14): qual das duas áreas ────────────────────────
// Grava 'si' (6m, partindo de si/marca) ou 'distancia' (3m, à distância). Fichas
// salvas antes desta correção têm 'Área' e 'Alcance', que eram os rótulos antigos —
// aceitos aqui pelo valor que produziam, para não precisar de migração: 'Área' dava
// 6m e 'Alcance' dava 3m.
window.EXPANSAO_DOMINIO_OPCOES = [
    { id: 'si',        metros: 6, graus: 4, rotulo: '6m a partir de si ou de uma marca' },
    { id: 'distancia', metros: 3, graus: 2, rotulo: '3m à distância' },
];
window.opcaoExpansaoDominio = function (valorSalvo) {
    const v = String(valorSalvo || '');
    const ehDistancia = (v === 'distancia' || v === 'Alcance');
    return window.EXPANSAO_DOMINIO_OPCOES[ehDistancia ? 1 : 0];
};

window.DURACAO_GRAU_MAP = {
    'rg_m13': 2, // Zetsu Protetivo (escolha: Rodadas/Duração, Acerto ou Dano)
    'rg_v2':  1, // Canalizar com Concentração (escolha: Duração em vez de Dano/Cura)
};
window.ACERTO_GRAU_MAP  = {
    'rg_l12': 1, // Limitação de Movimento 1
    'rg_m11': 2, // Limite Emocional
    'rg_m13': 2, // Zetsu Protetivo (escolha: Acerto)
    'ri_l3':  1, // Sem Defesas (Reforço)
};
window.CD_GRAU_MAP = {
    'rma_m3': 2, // Imune por 5 Rodadas (Manipulação): +2 Grau/Passo na CD do TR
    'rma_p1': 5, // +10% Aura por Rodada (Manipulação): +5 Grau/Passo na CD do TR
};

// Características de Grau de Potência por categoria — lista completa das "Peculiaridades
// da Categoria" do manual, igual à de GRAUS_POR_CAT (js/init.js).
//
// Antes esta lista era RESTRITA às 6 características com teto rastreado, deixando de fora
// Atributos, Redução de Custo e Número de Alvos. Isso tinha duas consequências: o piso de
// +5 e o +4 do Juramento Imutável nunca chegavam nelas, e elas não apareciam em painel
// nenhum. Agora as três são rastreadas — sem teto, porque a regra não define um para elas.
//
// Acerto saiu de Intensificação/Reforço junto com a mesma decisão tomada em
// GRAU_OPCOES_POR_CATEGORIA: aumentar Atributos já melhora a jogada de ataque.
window.CATEGORIA_CARACTERISTICAS_GRAU = {
    'INTENSIFICAÇÃO': ['atributos', 'dano', 'custo'],
    'REFORÇO':        ['atributos', 'dano', 'custo'],
    'TRANSMUTAÇÃO':   ['area', 'dano', 'custo'],
    'MATERIALIZAÇÃO': ['alcance', 'area', 'duracao', 'custo'],
    'CONJURAÇÃO':     ['alcance', 'area', 'duracao', 'custo'],
    'ESPECIALIZAÇÃO': ['alcance', 'area', 'dano', 'duracao', 'cd', 'custo'],
    'MANIPULAÇÃO':    ['alcance', 'area', 'alvos', 'duracao', 'cd', 'custo'],
    'EMISSÃO':        ['acerto', 'alcance', 'area', 'custo'],
};

// Características SEM teto: a regra não define limite para elas, então o Grau investido
// vale inteiro e nenhum excedente fica "em espera".
// Acerto entrou aqui: efeitos e restrições que o concedem apenas SOMAM, sem teto.
window.CARACTERISTICAS_SEM_TETO = ['atributos', 'custo', 'alvos', 'acerto'];

// Rótulo legível de cada característica, usado nos painéis.
// CARACTERISTICA_LABEL foi removida em 29/10: ela traduzia chaves internas
// ('dano', 'alcance', 'area'...) para rótulos, e o resto do app nunca usou essas
// chaves — trabalha direto com os nomes de exibição, inclusive com um 'Alcance/Área'
// combinado que não existia no mapa. Religar daria rótulo errado; o vocabulário vivo
// é o de CATEGORIA_CARACTERISTICAS_GRAU, logo abaixo.

// Peculiaridades da Categoria: TODAS as características da lista acima (não só uma) já nascem com
// piso de +5 no Grau de Potência, mesmo quando calcMaxGrauPorNivel ainda travaria em +3 (nível 1-2).
// Fora dessas características (ou fora da categoria), vale o limite normal por nível.
window.calcMaxGrauPorCaracteristica = function(charLevel, classe, caracteristica) {
    // Atributos, Redução de Custo e Número de Alvos não têm teto definido na regra.
    if ((window.CARACTERISTICAS_SEM_TETO || []).includes(caracteristica)) return Infinity;
    const base = window.calcMaxGrauPorNivel(charLevel);
    if (base === Infinity) return base;
    const peculiares = window.CATEGORIA_CARACTERISTICAS_GRAU[classe] || [];
    return peculiares.includes(caracteristica) ? Math.max(base, 5) : base;
};

// Nível em que o bônus do Juramento Imutável (rg_e5) passa a valer: 3 níveis após a restrição
// ter sido adquirida (h.juramentoImutavelNivelBase, gravado quando o jogador seleciona rg_e5).
window.calcJuramentoImutavelNivelAtivo = function(h) {
    if (!h) return null;
    // O nível base só passou a ser gravado depois que a mecânica foi escrita. Hatsus
    // criados antes disso ficavam com o campo vazio, e a função devolvia null — o bônus
    // de +4 NUNCA era aplicado neles, mesmo com a restrição comprada e o nível cumprido.
    // Sem o registro, usamos o nível em que o Hatsu foi criado, que é o mais próximo da
    // realidade: a restrição foi escolhida na criação dele.
    const base = (h.juramentoImutavelNivelBase != null)
        ? h.juramentoImutavelNivelBase
        : (parseInt(h.nivel) || 1);
    return base + 3;
};

// Soma os Graus de Potência já comprometidos por característica de um Hatsu — usado para
// comparar contra window.calcMaxGrauPorNivel(nível) no criador (limite de Grau de Potência por nível).
// charLevel: nível ATUAL do personagem (necessário para resolver o Juramento Imutável, que só ativa
// 3 níveis após ser adquirido). Se omitido, usa h.nivel (nível salvo do Hatsu) como aproximação.
window.calcGrausPotenciaPorCaracteristica = function(h, charLevel) {
    const totals = { dano: 0, alcance: 0, area: 0, duracao: 0, acerto: 0, cd: 0,
                     atributos: 0, custo: 0, alvos: 0 };
    if (!h) return totals;
    const allIds = [...(h.restricoes||[]), ...(h.efeitos||[])];
    const bc = h.beneficioChoices || {};
    const sc = h.specialChoices || {};
    const pr = h.pureRestrictions || {};
    const choiceIncludes = (id, palavra) => (bc[id]||'').toLowerCase().includes(palavra);
    const nivelAtual = charLevel != null ? parseInt(charLevel) : (h.nivel || 1);

    allIds.forEach(id => {
        // Restrição marcada como "Pura" converte o benefício em P.N — não aplica o Grau/Passo real,
        // então não deve contar para o limite de Grau de Potência.
        if (pr[id]) return;
        // Graus genéricos ("+X Graus em qualquer característica"): o destino é escolhido pelo
        // jogador no criador. Somados de uma vez depois do loop, via grausGenericosDoHatsu().
        if ((window.GRAU_GENERICO_IDS || {})[id] !== undefined) return;
        // Efeitos com grau de escolha (Aumento de Atributo, Intensificação): o grau vai para a
        // característica que o jogador escolheu, não para o dano por padrão.
        const _esc = (window.GRAU_ESCOLHIDO_EFEITOS || {})[id];
        if (_esc) {
            const chave = (window.GRAU_ESCOLHA_PARA_CHAVE || {})[sc[id]];
            if (chave && totals[chave] !== undefined) totals[chave] += _esc.graus;
            return;
        }
        // Dano: mesma lógica de escolha usada em renderHatsuDetail (rg_l16/rg_m13 só contam se escolhido "dano")
        const g = window.DANO_GRAU_MAP[id];
        if (g) {
            if (id === 'rg_l16' && !choiceIncludes(id, 'dano')) { /* não conta */ }
            else if (id === 'rg_m13' && !choiceIncludes(id, 'dano')) { /* não conta */ }
            else if (id === 'rg_v2' && !choiceIncludes(id, 'dano') && !choiceIncludes(id, 'cura')) { /* escolheu Duração — ver DURACAO_GRAU_MAP */ }
            else if (id === 'rg_p5' && (!bc[id] || choiceIncludes(id, 'margem') || choiceIncludes(id, 'crítico'))) { /* escolheu Margem de Crítico, ou ainda não escolheu */ }
            else if (id === 'rg_l1' && choiceIncludes(id, 'acerto')) { /* escolheu Acerto — ver ACERTO_GRAU_MAP, não conta em dano */ }
            else if (id === 'rg_l17' && !(choiceIncludes(id, '+1') && (sc[id]||'').toLowerCase() === 'dano')) { /* rg_l17: só conta em dano se escolheu "+1 Contra o Alvo" + sub-escolha "Dano" (senão é Acerto, ou é o debuff "-1 do Alvo", não rastreado) */ }
            else totals.dano += g;
        }
        // Alcance / Área: rg_l9 e rg_l10 usam specialChoices (picker dedicado 'Alcance'/'Área' em
        // hatsu-creator.js — ALCANCE_AREA_IDS), NÃO beneficioChoices (correção: antes lia de bc[id],
        // que nunca é preenchido para esses dois, então o grau nunca era contado).
        if (id === 'rg_l9' || id === 'rg_l10') {
            const escolhaAA = sc[id] || '';
            if (escolhaAA === 'Área') totals.area += window.AREA_GRAU_MAP[id] || 0;
            else if (escolhaAA === 'Alcance') totals.alcance += window.ALCANCE_GRAU_MAP[id] || 0;
        }
        // Alcance / Área: restrições/efeitos com valor fixo e sem ambiguidade de escolha
        if (!['rg_l9','rg_l10','eg1','em_e2','em_e14'].includes(id)) {
            if (window.ALCANCE_GRAU_MAP[id]) totals.alcance += window.ALCANCE_GRAU_MAP[id];
            if (window.AREA_GRAU_MAP[id]) totals.area += window.AREA_GRAU_MAP[id];
        }
        // Duração: rg_v2 (escolha: Duração em vez de Dano/Cura)
        if (id === 'rg_v2' && (choiceIncludes(id, 'duração') || choiceIncludes(id, 'rodada'))) {
            totals.duracao += window.DURACAO_GRAU_MAP[id] || 0;
        }
        // Duração / Acerto: rg_m13 é uma escolha entre Rodadas, Acerto ou Dano (dano já tratado acima)
        if (id === 'rg_m13') {
            if (choiceIncludes(id, 'rodada')) totals.duracao += window.DURACAO_GRAU_MAP[id] || 0;
            else if (choiceIncludes(id, 'acerto')) totals.acerto += window.ACERTO_GRAU_MAP[id] || 0;
        } else if (window.ACERTO_GRAU_MAP[id]) {
            totals.acerto += window.ACERTO_GRAU_MAP[id];
        }
        // Condicionais de acerto (rg_l1 / rg_l13 escolhem entre acerto e outra característica)
        if ((id === 'rg_l1' || id === 'rg_l13') && choiceIncludes(id, 'acerto')) totals.acerto += 1;
        // rg_l17: escolheu "+1 Contra o Alvo" + sub-escolha "Acerto" (specialChoices, ver ALCANCE_AREA_IDS-like picker)
        if (id === 'rg_l17' && choiceIncludes(id, '+1') && (sc[id]||'').toLowerCase() === 'acerto') totals.acerto += 1;
        // rg_l18: escolheu "Jogadas de Acerto" (a alternativa "Reações Defensivas" não tem total rastreado)
        if (id === 'rg_l18' && choiceIncludes(id, 'acerto')) totals.acerto += 1;
        // CD do TR (sem ambiguidade de escolha)
        if (window.CD_GRAU_MAP[id]) totals.cd += window.CD_GRAU_MAP[id];

        // Efeitos gerais escaláveis (repetíveis via restrição extrema pura) — cada cópia soma 1 grau
        // na característica correspondente, mesmo sem o texto falar literalmente em "Grau/Passo".
        if (id === 'eg1') { // Aumento de Alcance — escolha Alcance ou Área
            const escolha = sc['eg1'] || '';
            if (escolha === 'Área') totals.area += 1;
            else if (escolha === 'Alcance') totals.alcance += 1;
        }
        if (id === 'eg2') totals.duracao += 1; // Aumento de Duração
        if (id === 'eg9') totals.area += 1;    // Ajuste de Forma (Área)
        // Efeitos de categoria com bônus fixo de Alcance/Área (mesma lógica de escolha do eg1)
        if (id === 'em_e2') { // Distância Segura: Alcance OU Área, escolha do jogador
            const escolha = sc[id] || '';
            if (escolha === 'Área') totals.area += window.AREA_GRAU_MAP[id] || 0;
            else if (escolha === 'Alcance') totals.alcance += window.ALCANCE_GRAU_MAP[id] || 0;
        }
        // Expansão de Domínio: SEMPRE área; a escolha define quantos graus.
        if (id === 'em_e14') totals.area += window.opcaoExpansaoDominio(sc[id]).graus;
        // em_e20 (Disparo Potente) e outros itens sem escolha caem no bloco genérico acima
    });

    // Aumento de Atributo: roteado pelo atributo escolhido, não por pergunta ao jogador.
    if (window.aumentoAtributoPorTeto) {
        const _atkA = h.atkMod || h.dmgMod || null;
        const _cdA = h.dmgMod || h.atkMod || null;
        const _aa = window.aumentoAtributoPorTeto(h, _atkA, _cdA);
        totals.acerto += _aa.acerto;
        totals.cd += _aa.cd;
    }

    // ── Juramento Imutável (rg_e5) ──────────────────────────────────────────────
    // Benefício do manual: "+4 Graus de potência em TODAS as características possíveis
    // da sua categoria". Não há escolha: aplica em todas de uma vez. Funciona como o
    // efeito Intensificação, mas sem perguntar onde vai.
    //
    // NOTA 3 do manual: o benefício só é recebido APÓS 3 NÍVEIS cumprindo a restrição.
    // Vale só quando o jogador escolhe o BENEFÍCIO — marcando como pura, ele troca os
    // +4 graus pelos 4 P.N, e aí não recebe os graus.
    if (allIds.includes('rg_e5') && !pr['rg_e5']) {
        const nivelAtivo = window.calcJuramentoImutavelNivelAtivo(h);
        if (nivelAtivo != null && nivelAtual >= nivelAtivo) {
            const caracts = window.CATEGORIA_CARACTERISTICAS_GRAU[h.classe]
                || window.CATEGORIA_CARACTERISTICAS_GRAU[(h.classe || '').toUpperCase()]
                || Object.keys(totals);
            caracts.forEach(k => { if (totals[k] !== undefined) totals[k] += 4; });
        }
    }

    // 5 Graus do 1º Hatsu — soma direta por característica
    const ph = h.primeiroHatsuGraus || {};
    totals.dano    += ph.dano    || 0;
    totals.alcance += ph.alcance || 0;
    totals.area    += ph.area    || 0;
    totals.duracao += ph.duracao || 0;
    totals.acerto  += ph.acerto  || 0;
    totals.cd      += ph.cd      || 0;

    // Bônus de Talento (Talentoso/Ultimate) aplicado a este Hatsu
    if (h.bonusGraus && totals[h.bonusGraus.tipo] !== undefined) {
        totals[h.bonusGraus.tipo] += h.bonusGraus.valor || 0;
    }
    // Graus genéricos: cada um conta no teto da característica que o jogador escolheu.
    const _gen = window.grausGenericosDoHatsu ? window.grausGenericosDoHatsu(h) : {};
    Object.keys(_gen).forEach(function (k) {
        if (totals[k] !== undefined) totals[k] += _gen[k];
    });
    // Graus dirigidos (ri_m1) saíram do DANO_GRAU_MAP, mas continuam sendo graus de
    // Dano/Cura — todas as linhas que eles podem escolher vivem nesse mesmo teto.
    Object.keys(window.GRAU_DIRIGIDO_IDS || {}).forEach(function (id) {
        if (allIds.indexOf(id) < 0 || pr[id]) return;
        totals.dano += window.GRAU_DIRIGIDO_IDS[id];
    });
    return totals;
};

// Chame após um level-up (com o nível ANTERIOR à mudança) para avisar o jogador quando algum Hatsu
// com Juramento Imutável (rg_e5) acabou de cruzar o limiar de 3 níveis e ganhou +4 em tudo.
window._checkJuramentoImutavelLevelUp = function(char, previousLevel) {
    if (!char || !char.hatsus) return;
    const newLevel = parseInt(char.level) || 0;
    char.hatsus.forEach(h => {
        if (!(h.restricoes||[]).includes('rg_e5')) return;
        const nivelAtivo = window.calcJuramentoImutavelNivelAtivo(h);
        if (nivelAtivo == null) return;
        // Só notifica no exato level-up que cruza o limiar (evita repetir em níveis seguintes)
        if (previousLevel < nivelAtivo && newLevel >= nivelAtivo) {
            const caracts = window.CATEGORIA_CARACTERISTICAS_GRAU[h.classe] || [];
            const LABELS = { dano:'Dano/Cura', alcance:'Alcance', area:'Área', duracao:'Duração', acerto:'Acerto', cd:'CD do TR' };
            const lista = caracts.map(k => LABELS[k]).filter(Boolean).join(', ') || 'todas as características';
            if (window._showXpToast) {
                // Pequeno atraso para não sobrepor o toast principal de "Nível X!" do level-up
                setTimeout(() => window._showXpToast('🎖️ Juramento Imutável ativo em "' + h.nome + '"! +4 Graus de Potência em: ' + lista), 2600);
            }
        }
    });
};

// Custo final de aura de um Hatsu (base calculada pelas restrições/efeitos, reduzido pelos
// Graus dos "5 Graus do 1º Hatsu" aplicados em Redução de Custo). Única fonte de verdade — usada
// tanto na exibição (renderHatsuDetail) quanto no desconto real ao rolar (rollHatsuDamage).
// ── Duração do Hatsu, reutilizável fora da tela de detalhe ────────────────────
// A tela de detalhe calcula a duração com todos os bônus. A aba Ficha precisa do
// mesmo número para ativar o Hatsu sem abrir, então a regra vive aqui.
// Constante = sem contagem: Relíquia Viva, Vínculo Sustentado, Concentração Total,
// Canalizar com Concentração e Maldição (que tem temporizador próprio).
// ── Extremas que mudam a ROLAGEM ────────────────────────────────────────────
// Só valem quando o jogador fica com o BENEFÍCIO: marcando a restrição como pura,
// ele trocou o efeito pelos 4 P.N e não recebe nada disto.
//
//  rg_e2 Condição Hostil — dados de dano MAXIMIZADOS (não rolados) e área dobrada
//  rg_e8 Vida ou Morte   — só ativa com PV ou Sanidade abaixo de 10%; o dano conta
//                          como crítico (dobra o resultado dos dados)
window.hatsuDanoMaximizado = function (h) {
    return (h.restricoes || []).includes('rg_e2') && !((h.pureRestrictions || {})['rg_e2']);
};
window.hatsuDanoCritico = function (h) {
    return (h.restricoes || []).includes('rg_e8') && !((h.pureRestrictions || {})['rg_e8']);
};
// Requisito do Vida ou Morte: basta UMA das duas barras abaixo de 10%, o que vier
// primeiro. Devolve { exige, liberado, motivo }.
window.hatsuVidaOuMorte = function (h, char) {
    if (!window.hatsuDanoCritico(h)) return { exige: false, liberado: true, motivo: '' };
    const v = (char && char.vitals) || {};
    const pvPct = (v.hpMax > 0) ? (v.hp / v.hpMax) * 100 : 100;
    const sanPct = (v.sanMax > 0) ? (v.san / v.sanMax) * 100 : 100;
    const lib = pvPct < 10 || sanPct < 10;
    return {
        exige: true, liberado: lib,
        motivo: lib
            ? ('Liberado: ' + (pvPct < 10 ? 'PV em ' + Math.round(pvPct) + '%' : 'Sanidade em ' + Math.round(sanPct) + '%'))
            : ('Bloqueado: exige PV ou Sanidade abaixo de 10% (PV ' + Math.round(pvPct) + '% · SAN ' + Math.round(sanPct) + '%)'),
    };
};

// ── Dano/Cura Focal separado por TAG ─────────────────────────────────────────
// Cada cópia do efeito recebe a tag "dano" ou "cura" (specialChoices.eg15_tag…).
// Cada tag tem a PRÓPRIA escada: a primeira cópia da tag libera a base 2d6 e cada
// cópia seguinte sobe um degrau. Assim um Hatsu pode causar 2d6 de dano E curar 2d8.
// Cópia sem tag conta como "dano", para não quebrar Hatsus criados antes disso.
window.contarTagsFocal = function (h, efeitosSel) {
    const sc = (h && h.specialChoices) || {};
    const lista = efeitosSel || [];
    const copias = lista.filter(function (e) { return e.id === 'eg15'; }).length;
    const out = { dano: 0, cura: 0 };
    for (let i = 0; i < copias; i++) {
        const tag = sc[i > 0 ? ('eg15_tag#' + i) : 'eg15_tag'];
        if (tag === 'cura') out.cura++; else out.dano++;
    }
    return out;
};

// ── Graus "genéricos": o benefício não diz onde o grau entra ─────────────────
// Onze restrições (e um efeito) dizem "Adicione X Graus de Potência em qualquer
// característica da Categoria" ou "+X Grau de Potência no Hatsu". O app jogava todos
// em Dano/Cura à força, sem perguntar — quem queria alcance ou duração não tinha como.
// Agora o jogador escolhe a característica na criação do Hatsu.
window.GRAU_GENERICO_IDS = {
    'rg_p1': 3,   // Alto Risco
    'rg_p3': 3,   // Dano Permanente
    'rg_p5': 3,   // Efeitos Aleatórios (só quando escolhe Graus, não Margem de Crítico)
    'rg_p9': 3,   // Perda de Membros
    're_l2': 2,   // Nome Verdadeiro do Alvo
    're_p2': 2,   // Uso Único por Sessão
    're_l3': 1,   // Terreno Específico
    'ri_m3': 1,   // Inutilizável c/ +50% Aura
    'rt_l1': 1,   // Preparação Obrigatória
    'em_m2': 1,   // Distância Reduzida ao Mover
    'eg7':   1,   // Poder Valioso (efeito)
};

// Destinos que o app sabe APLICAR de verdade. "Atributos" fica de fora: a regra não
// define onde um grau de atributo entra num Hatsu, e oferecer sem aplicar enganaria.
window.GRAU_DESTINOS_APLICAVEIS = ['dano', 'alcance', 'area', 'duracao', 'cd', 'acerto', 'alvos', 'custo'];

// Soma os graus genéricos por característica escolhida.
// Sem escolha, o padrão é Dano/Cura — assim nenhuma ficha antiga muda sozinha.
window.grausGenericosDoHatsu = function (h) {
    const out = {};
    if (!h) return out;
    const sc = h.specialChoices || {};
    const bc = h.beneficioChoices || {};
    const pr = h.pureRestrictions || {};
    const todos = [].concat(h.restricoes || [], h.efeitos || []);
    Object.keys(window.GRAU_GENERICO_IDS).forEach(function (id) {
        if (todos.indexOf(id) < 0) return;
        if (pr[id]) return;                       // marcada como pura: virou P.N
        // rg_p5 só concede graus quando o jogador NÃO escolheu Margem de Crítico.
        if (id === 'rg_p5') {
            const esc = String(bc[id] || '').toLowerCase();
            if (!esc || esc.indexOf('margem') >= 0 || esc.indexOf('crítico') >= 0) return;
        }
        const qtd = window.GRAU_GENERICO_IDS[id];
        // Distribuição por característica. Os graus de uma mesma restrição NÃO precisam
        // ir todos para o mesmo lugar: "Adicione 3 Graus em qualquer característica" pode
        // virar 2 em alcance e 1 em duração. A versão anterior só aceitava um destino.
        const dist = sc[id + '_dist'];
        if (dist && typeof dist === 'object') {
            let somado = 0;
            Object.keys(dist).forEach(function (k) {
                const v = Math.max(0, parseInt(dist[k]) || 0);
                if (!v) return;
                // Nunca entrega mais graus do que a restrição concede, mesmo que a ficha
                // tenha sido salva com número maior (edição manual, bug antigo, nível que caiu).
                const cabe = Math.min(v, qtd - somado);
                if (cabe <= 0) return;
                out[k] = (out[k] || 0) + cabe;
                somado += cabe;
            });
            // O que o jogador não distribuiu cai em Dano/Cura, como era o padrão antes.
            const resto = qtd - somado;
            if (resto > 0) out.dano = (out.dano || 0) + resto;
            return;
        }
        // Compatibilidade: fichas salvas antes da distribuição guardaram um destino único.
        const dest = sc[id + '_carac'] || 'dano';
        out[dest] = (out[dest] || 0) + qtd;
    });
    return out;
};

// ── Por meio de QUEM o Dano/Cura Focal acontece ──────────────────────────────
// O 2d6 do Dano/Cura Focal pode ser causado pelo usuário diretamente ou POR MEIO de
// um constructo, criatura, arma forjada ou objeto. Isso não muda o número: muda quem
// bate. Havendo uma origem escolhida, é ELA que causa os 2d6 e o Hatsu não causa dano
// por si — para ter dano fora dela, o jogador compra e atribui ao próprio usuário.
//
// As CHAVES salvas seguem 'eg15_veiculo'/'eg15_veiculo_txt' de propósito: fichas já
// gravadas usam esses nomes, e renomear a chave apagaria a escolha de quem já definiu
// uma origem. O nome antigo vive só no armazenamento; o que o jogador lê é "origem".
window.ORIGEM_DANO_IDS = {
    'rm_e1':  'Objeto/Arma Forjada',
    'rc_e1':  'Criatura Invocada',
    'rc_e11': 'Criatura Complexa',
    'ma_e1':  'Objeto Controlado (C.S.O)',
    'ma_e2':  'Criatura Controlada (C.S.C)',
    'rt_e6':  'Forma Esculpida de Aura',
    'rg_l14': 'Objeto Canalizador',
};
// Retorna null quando o dano é do próprio usuário (padrão, e o que vale para toda ficha
// antiga). A opção 'texto' guarda a descrição livre, para uma origem que não corresponde
// a nenhum efeito do banco.
window.origemDoFocal = function (h) {
    const sc = (h && h.specialChoices) || {};
    const esc = String(sc['eg15_veiculo'] || '');
    if (!esc || esc === 'usuario') return null;
    if (esc === 'texto') {
        const nome = String(sc['eg15_veiculo_txt'] || '').trim();
        return nome ? { id: null, nome: nome } : null;
    }
    const nome = window.ORIGEM_DANO_IDS[esc];
    return nome ? { id: esc, nome: nome } : null;
};

// ── Graus DIRIGIDOS: a própria restrição diz que escolhe um efeito ───────────
// ri_m1 (Aumento por Rodada): "+2 Graus de Potência no total de cada efeito similar",
// com os efeitos "ativados parcialmente (não de uma vez)". O app somava os 2 graus no
// dano base sempre. Agora o jogador escolhe a linha que recebe, e os 2 graus entram
// 1 por rodada (o número exibido é o total; o detalhamento mostra o escalonamento).
window.GRAU_DIRIGIDO_IDS = { 'ri_m1': 2 };
window.grausDirigidosDoHatsu = function (h, linhas) {
    const out = {};
    if (!h || !linhas || !linhas.length) return out;
    const todos = [].concat(h.restricoes || [], h.efeitos || []);
    const sc = h.specialChoices || {};
    const pr = h.pureRestrictions || {};
    const validas = {};
    linhas.forEach(function (l) { validas[l.id] = true; });
    Object.keys(window.GRAU_DIRIGIDO_IDS).forEach(function (id) {
        if (todos.indexOf(id) < 0 || pr[id]) return;
        // Sem escolha, cai na primeira linha (o dano base) — ficha antiga não muda sozinha.
        const alvo = sc[id + '_linha'];
        const dest = validas[alvo] ? alvo : linhas[0].id;
        out[dest] = (out[dest] || 0) + window.GRAU_DIRIGIDO_IDS[id];
    });
    return out;
};

// Monta as linhas de dano a partir de uma lista de ids, sem passar pelo render.
// Usado pelos pickers do criador, para que eles ofereçam exatamente as mesmas linhas
// que o painel de distribuição mostra — uma fonte de verdade só.
window.linhasDanoPorIds = function (h, ids) {
    const lista = (ids || []).map(function (id) { return { id: id, nome: id }; });
    const tags = window.contarTagsFocal(h, lista);
    const temForjar = (ids || []).indexOf('rm_e1') >= 0;
    return window.linhasDeDanoDoHatsu(h, lista, {
        temBase:    true,
        baseDado:   (tags.dano > 0 || temForjar) ? '2d6' : '1d8',
        temCura:    tags.cura > 0 || (ids || []).indexOf('ri_e3') >= 0,
        curaDado:   tags.cura > 0 ? '2d6' : '1d8',
        temFlagelo: (ids || []).indexOf('eg10') >= 0,
    });
};

// ── Alocação de Graus de Dano/Cura entre as LINHAS do Hatsu ──────────────────
// Antes, um grau de Dano/Cura era REPLICADO: subia o dano base, cada efeito extra e
// a cura, tudo ao mesmo tempo. Um Hatsu com três linhas multiplicava por três o valor
// de cada grau comprado, e dois Hatsus que pagaram o mesmo P.N rendiam muito diferente.
//
// Agora o grau é ALOCADO: o jogador escolhe em qual linha ele entra. Efeitos com dano
// próprio continuam subindo sozinhos por cópia; o que se distribui aqui é o pool de
// graus vindo de restrições, Bônus Talentoso e 5 Graus do 1º Hatsu.
//
// Cada linha tem o próprio teto, como já acontecia.
window.linhasDeDanoDoHatsu = function (h, efeitosSel, info) {
    const i = info || {};
    const linhas = [];
    // A primeira linha é o destino padrão de tudo que não foi alocado.
    if (i.temBase) linhas.push({ id: 'base', label: 'Dano base', dado: i.baseDado || '' });
    if (i.temCura) linhas.push({ id: 'cura', label: 'Cura', dado: i.curaDado || '' });
    if (i.temFlagelo) linhas.push({ id: 'eg10', label: 'Flagelo da Mente (Sanidade)', dado: '1d10' });
    const vistos = {};
    (efeitosSel || []).forEach(function (e) {
        if (e.id === 'eg10') return;                      // já entrou acima
        const d = (window.DANO_PROPRIO_MAP || {})[e.id];
        if (!d || vistos[e.id]) return;
        vistos[e.id] = true;
        linhas.push({ id: e.id, label: d.desc || e.nome, dado: d.dado });
    });
    return linhas;
};

// Distribui o pool entre as linhas. O que o jogador não alocou cai na PRIMEIRA linha,
// que é o dano base — assim nenhuma ficha antiga muda sozinha ao abrir.
window.calcGrausPorLinha = function (h, pool, linhas) {
    const out = {};
    (linhas || []).forEach(function (l) { out[l.id] = 0; });
    if (!linhas || !linhas.length) return out;
    const salvo = (h && h.grauLinhas) || {};
    let usado = 0;
    linhas.forEach(function (l) {
        const quer = Math.max(0, parseInt(salvo[l.id]) || 0);
        const cabe = Math.max(0, Math.min(quer, pool - usado));
        out[l.id] = cabe;
        usado += cabe;
    });
    const resto = Math.max(0, pool - usado);
    if (resto > 0) out[linhas[0].id] += resto;
    return out;
};

window.calcDuracaoHatsu = function (h, char) {
    if (!h) return { rodadas: 0, constante: false };
    const efeitos = h.efeitos || [];
    const restr = h.restricoes || [];
    if ((h.tag || 'P') === 'M') return { rodadas: null, constante: true };
    if (efeitos.includes('rm_e21') || efeitos.includes('rm_e11') || efeitos.includes('ri_e15')) {
        return { rodadas: null, constante: true };
    }
    if (restr.includes('rg_v2')) return { rodadas: null, constante: true };
    let rod = 0;
    rod += efeitos.filter(function (id) { return id === 'eg2'; }).length;  // Aumento de Duração
    if (restr.includes('rg_p2')) rod += 3;                                 // Boneca Russa
    if (restr.includes('rm_l3')) rod += 2;                                 // 1 Item por Combate
    if (restr.includes('rma_l2')) rod += 1;                                // Dano Quebra o Efeito
    const _escolheuRod = function (id) {
        const v = String((h.beneficioChoices || {})[id] || '').toLowerCase();
        return v.includes('rodada') || v.includes('dura');
    };
    if (restr.includes('rg_m10') && _escolheuRod('rg_m10')) rod += 2;      // Limite de Uso Definitivo
    if (restr.includes('rm_p2') && _escolheuRod('rm_p2')) rod += 2;        // Conjuração Controlável
    const bc = h.beneficioChoices || {};
    if (restr.includes('rg_m13')) {
        const esc = String(bc.rg_m13 || '').toLowerCase();
        if (esc.includes('rodada') || esc.includes('dura')) rod += 2;      // Zetsu Protetivo
    }
    const ph = h.primeiroHatsuGraus || {};
    rod += ph.duracao || 0;
    if (h.bonusGraus && h.bonusGraus.tipo === 'duracao') rod += h.bonusGraus.valor || 0;

    // ── Fontes que só existiam na tela do Hatsu ─────────────────────────────────
    // Esta função era uma SEGUNDA implementação da duração, criada para a aba Ficha
    // poder ativar o Hatsu sem abrir a tela. Ela nasceu com menos fontes e foi ficando
    // para trás: a tela somava 16 e aqui eram 11, então o mesmo Hatsu podia mostrar 6
    // rodadas na tela e ser ativado com 4 pela Ficha.
    if (restr.includes('rg_m2')) rod += 2;   // Experiência Comprovada
    // Confirmação de Duas Etapas: +1 por Leve, +2 Moderada, +3 Pesada, +4 Extrema
    if (restr.includes('rg_m6')) {
        const peso = String((h.beneficioChoices || {})['rg_m6'] || '').toLowerCase();
        rod += peso.includes('extrem') ? 4 : peso.includes('pesad') ? 3 : peso.includes('moder') ? 2 : 1;
    }
    // Dor pra Disgrama: ativar custa 1/3 da duração já acumulada.
    if (efeitos.includes('eg17')) rod = Math.max(0, rod - Math.floor(rod / 3));

    return { rodadas: Math.max(0, rod), constante: false };
};

window.calcHatsuAuraCostFinal = function(h, idx, idsModo) {
    if (!window.calcAuraCost) return { pct: 50, reduced: false, phgCusto: 0 };
    // idsModo permite calcular o custo com as restrições/efeitos DO MODO ATIVO, e não
    // sempre com os do Hatsu raiz. Sem isso, desligar ou acrescentar restrição num modo
    // mudava o dano mas não mudava o custo de aura.
    const _rIds = (idsModo && idsModo.restricoes) || h.restricoes || [];
    const _eIds = (idsModo && idsModo.efeitos) || h.efeitos || [];
    const fakeHb = {
        rg: _rIds.filter(id => id.startsWith('rg_')),
        rc: _rIds.filter(id => !id.startsWith('rg_')),
        eg: _eIds.filter(id => id.startsWith('eg')),
        ec: _eIds.filter(id => !id.startsWith('eg')),
        // As escolhas do jogador precisam viajar junto: sem elas, um grau genérico mandado
        // para "Reduz Custo" aparecia no criador mas não no Hatsu já salvo.
        specialChoices: h.specialChoices || {},
        beneficioChoices: h.beneficioChoices || {},
        pureRestrictions: h.pureRestrictions || {},
    };
    const cc = window.calcAuraCost(fakeHb);
    const phgCusto = (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.custo) ? h.primeiroHatsuGraus.custo : 0;
    // Piso de 5%, igual ao do calcAuraCost. Com 10% aqui, os Graus de Potência do 1º
    // Hatsu mandados para Redução de Custo paravam de valer a partir dos 10%.
    const pct = Math.max(5, cc.pct - phgCusto * 5);
    return { pct, reduced: pct < 50, phgCusto };
};

// Quanto espaço de Grau de Potência (característica "dano") ainda sobra neste Hatsu.
// É a mesma conta do calcRenGrauDisponivel, mas SEM exigir o REN ativo: serve para
// qualquer fonte que queira somar grau de dano — hoje o REN e a Aura Condensada
// (rm_e12). As duas disputam o MESMO espaço, então quem soma depois usa o que sobrou.
window.grauDanoDisponivel = function (h, char) {
    if (!h || !char) return 0;
    if (!window.calcGrausPotenciaPorCaracteristica || !window.calcMaxGrauPorNivel) return 0;
    const grauMax = window.calcMaxGrauPorCaracteristica
        ? window.calcMaxGrauPorCaracteristica(char.level, h.classe, 'dano')
        : window.calcMaxGrauPorNivel(char.level);
    if (grauMax === Infinity) return Infinity;
    const totals = window.calcGrausPotenciaPorCaracteristica(h, char.level);
    return Math.max(0, grauMax - totals.dano);
};

// rev. Manual 2.0 — REN só pode adicionar seu grau de dano se ainda houver espaço dentro do limite
// de Grau de Potência do nível do personagem (mesma regra de qualquer outra fonte de grau).
// Retorna a quantidade de graus de REN ainda disponíveis para este golpe (0 = sem espaço).
window.calcRenGrauDisponivel = function(h, char) {
    // Só conta quando o REN está ATIVO. Antes bastava ter comprado o princípio, o que
    // dava o grau de dano o tempo todo — agora precisa estar ligado na ficha.
    if (!(((char || {}).principiosAtivos) || {}).ren) return 0;
    if (!h || !char || !char.nenDominio || !(char.nenDominio.ren > 0)) return 0;
    if (!window.calcGrausPotenciaPorCaracteristica || !window.calcMaxGrauPorNivel) return 0;
    const grauMax = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, h.classe, 'dano') : window.calcMaxGrauPorNivel(char.level);
    if (grauMax === Infinity) return Infinity;
    const totals = window.calcGrausPotenciaPorCaracteristica(h, char.level);
    return Math.max(0, grauMax - totals.dano);
};

// REN nível 3 permite 1 uso gratuito (sem custo de aura) por dia — rastreado por data (pt-BR).
window.isRenFreeUsoDisponivel = function(char) {
    if (!char || !char.nenDominio || (char.nenDominio.ren||0) < 3) return false;
    const hoje = new Date().toLocaleDateString('pt-BR');
    return char.renFreeUsedDate !== hoje;
};
window.marcarRenFreeUsoConsumido = function(char) {
    char.renFreeUsedDate = new Date().toLocaleDateString('pt-BR');
};

// Calculadora ao vivo para restrições de Grau Variável (X) — rg_v1/rg_v6/rg_v10. O jogador informa
// X e a característica no momento do uso; isso não é salvo no personagem, é só conferência.
window._hCalcGrauVariavel = function(idx, restrId) {
    const char = state.currentChar;
    const h = (char.hatsus||[])[idx];
    if (!h) return;
    const xInput = document.getElementById('gv-' + restrId + '-x');
    const carSelect = document.getElementById('gv-' + restrId + '-car');
    const resEl = document.getElementById('gv-' + restrId + '-res');
    if (!xInput || !carSelect || !resEl) return;
    const x = Math.max(0, parseInt(xInput.value) || 0);
    const caract = carSelect.value;
    const LABELS = { dano:'Dano/Cura', alcance:'Alcance', area:'Área', duracao:'Duração', acerto:'Acerto', cd:'CD do TR' };
    const grauMax = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, h.classe, caract) : (window.calcMaxGrauPorNivel ? window.calcMaxGrauPorNivel(char.level) : Infinity);
    if (grauMax === Infinity) {
        resEl.innerHTML = '<span style="color:#4ade80;font-weight:700">✓ Nível 11+ — sem limite de Grau de Potência</span>';
        return;
    }
    const totals = window.calcGrausPotenciaPorCaracteristica ? window.calcGrausPotenciaPorCaracteristica(h, char.level) : {};
    const base = totals[caract] || 0;
    const total = base + x;
    const over = total > grauMax;
    resEl.innerHTML = (base > 0 ? base + ' (já no Hatsu) + ' : '') + x + ' (X) em ' + (LABELS[caract]||caract) + ' = '
        + '<b style="color:' + (over ? '#f87171' : '#4ade80') + '">' + total + '</b> / ' + grauMax + ' '
        + (over ? '<span style="color:#f87171;font-weight:700">⚠ Excede o limite em ' + (total - grauMax) + '</span>' : '<span style="color:#4ade80;font-weight:700">✓ Dentro do limite</span>');
};

// Liga/desliga o Modo Alternativo do Hatsu (eg4). Guardado no próprio Hatsu, dentro
// do JSONB do personagem — nenhuma alteração de banco necessária.
// ── rm_e12: reserva 5% de aura dentro do item ────────────────────────────────
// Só com o Hatsu ativo. Barra em dois limites: o teto do efeito (25% por compra)
// e a aura que o personagem tem na hora. Enquanto a reserva não foi usada, pode
// continuar somando.
window._hReservarAuraCondensada = function (idx) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const ativo = ((char.hatsusAtivos || {})[idx]);
    if (!h || !ativo) return;
    const passo = window.AURA_CONDENSADA_PASSO;
    const teto = window.tetoAuraCondensada(h);
    const atual = window.reservaAuraCondensada(ativo);
    if (atual.destino) { alert('Esta reserva já foi usada\n\nA reserva inteira vai para um destino só. Desligue e religue o Hatsu para começar outra.'); return; }
    if (atual.pct + passo > teto) {
        alert('Teto da Aura Condensada\n\nEste Hatsu guarda no máximo ' + teto + '% ('
            + window.comprasAuraCondensada(h) + ' compra(s) × ' + window.AURA_CONDENSADA_TETO_POR_COMPRA + '%).');
        return;
    }
    const aura = char.vitals.aura || 0;
    if (aura < passo) { alert('Aura insuficiente\n\nReservar custa ' + passo + '% e você tem ' + aura + '%.'); return; }
    char.vitals.aura = Math.max(0, aura - passo);
    ativo.reservaCondensada = { pct: atual.pct + passo, destino: null };
    saveCharacter(char);
    render(true);
};

// Escolhe o destino da reserva — a decisão é feita AQUI, no uso, não na compra.
// 'rd' resolve na hora: vira fonte de Redução de Dano enquanto o Hatsu durar.
// 'dano' arma a reserva: a próxima rolagem de dano deste Hatsu soma os graus,
// limitada pelo teto do nível, e zera a reserva.
window._hUsarAuraCondensada = function (idx, destino) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const ativo = ((char.hatsusAtivos || {})[idx]);
    if (!h || !ativo) return;
    if (destino !== 'dano' && destino !== 'rd') return;
    const atual = window.reservaAuraCondensada(ativo);
    if (!atual.pct || atual.destino) return;
    ativo.reservaCondensada = { pct: atual.pct, destino: destino };
    saveCharacter(char);
    render(true);
};

// Desfaz a escolha de destino enquanto ela ainda não foi gasta (a reserva continua
// guardada). Não devolve aura: ela já foi consumida para carregar o item.
window._hDesarmarAuraCondensada = function (idx) {
    const char = state.currentChar;
    const ativo = ((char.hatsusAtivos || {})[idx]);
    if (!ativo) return;
    const atual = window.reservaAuraCondensada(ativo);
    if (!atual.pct) return;
    ativo.reservaCondensada = { pct: atual.pct, destino: null };
    saveCharacter(char);
    render(true);
};

window._hSetModoAtivo = function(idx, modoIdx) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    if (!h) return;
    h.modoAtivo = parseInt(modoIdx) || 0;
    saveCharacter(char);
    render(true);
};

// ── Constructos: de UM para VÁRIOS ───────────────────────────────────────────
// Antes existia só h.constructo (objeto único). O criador já permitia comprar
// Golem de Aura mais de uma vez e pedia material/característica de cada cópia,
// mas a ficha só tinha lugar para guardar UMA — então as duas cópias caíam no
// mesmo card e os PV se somavam. Agora cada cópia tem a sua ficha em
// h.constructos[]. A migração é automática na primeira leitura e não exige
// nenhuma alteração no Supabase, porque o personagem é um JSONB inteiro.
function _hCstList(h) {
    if (!h) return [];
    if (!Array.isArray(h.constructos)) {
        h.constructos = h.constructo ? [h.constructo] : [];
    }
    return h.constructos;
}
function _hCst(h, c) {
    const lista = _hCstList(h);
    const i = parseInt(c) || 0;
    while (lista.length <= i) lista.push({});
    // h.constructo continua apontando para a 1ª cópia, para não quebrar código antigo.
    h.constructo = lista[0];
    return lista[i];
}
window._hCstList = _hCstList;
window._hCst = _hCst;

// ── Ataque do Constructo: acerto e dano ──────────────────────────────────────
// Até aqui o constructo NÃO tinha rolagem de acerto. O botão rolava 1d6, somava o
// atributo e mandava ao Discord com o rótulo "Dano": o d20 ficava na mão do jogador.
// O livro diz o contrário, em "Criando a ficha da Materialização": "Ações de ataque
// das Materializações seguem a mesma lógica que a de personagens comuns: Rolagens de
// Ataque/Acerto, que irão em direção a alvos específicos". E as perícias do constructo
// "aproveitam o valor de proficiência do Materializador" — "o constructo terá o bônus
// do atributo+proficiência". Daí o acerto ser d20 + atributo DELE + proficiência do DONO.
//
// O DADO de dano também estava fixo em 1d6, e o 1d6 do livro é o PISO, não a regra:
// "O dano normalmente será definido a partir dos efeitos e/ou restrições escolhidos
// pelo usuário nas tabelas gerais ou de categorias. Caso contrário, apenas é calculado
// o atributo de FOR ou DES do constructo + 1d6." Quando o Hatsu comprou dano próprio,
// é esse dano que o constructo entrega.
//
// `comDanoDoHatsu` só pode ser verdadeiro quando ESTE Hatsu é o que está aberto:
// window._hatsuRollState é montado por render, e usá-lo de outro Hatsu entregaria o
// dado errado em silêncio.
window.ataqueDoConstructo = function (char, h, c, comDanoDoHatsu) {
    const cst = _hCst(h, c);
    const atributos = Object.assign({ FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, PRE: 0 }, cst.atributos || {});
    const attr = (cst.atributoAtaque && atributos.hasOwnProperty(cst.atributoAtaque))
        ? cst.atributoAtaque
        : (atributos.FOR >= atributos.DES ? 'FOR' : 'DES');
    const rs = (comDanoDoHatsu && window._hatsuRollState) ? window._hatsuRollState : null;
    let dado = (rs && rs.hasBaseDmg && rs.dice) ? rs.dice : '1d6';
    const doHatsu = dado !== '1d6';
    const copias = Math.max(1, (h.efeitos || []).filter(function (id) { return id === 'rm_e2'; }).length);
    const fd = window.statusFusaoDivisao ? window.statusFusaoDivisao(h, copias) : null;
    let acertoExtra = 0, graus = 0;
    if (fd && fd.modo && fd.graus) {
        if (fd.alvo === 'acerto') {
            acertoExtra = fd.graus;
        } else {
            const tab = window.DAMAGE_TABLE || [];
            const i = tab.indexOf(dado);
            // Fora da escada o grau não tem onde andar, e aí o efeito AVISA em vez de
            // prometer um número. Acontece de verdade: o SHU soma um segundo termo
            // ("2d6 + 1d4") e expressão composta não é degrau de tabela nenhuma.
            if (i >= 0) { dado = tab[Math.max(0, Math.min(tab.length - 1, i + fd.graus))]; graus = fd.graus; }
        }
    }
    return {
        attr: attr,
        atributo: atributos[attr] || 0,
        proficiencia: getProficiencyBonus(parseInt((char || {}).level) || 1),
        dado: dado,
        doHatsu: doHatsu,
        acertoExtra: acertoExtra,
        graus: graus,
        grauSemDestino: !!(fd && fd.modo && fd.graus && fd.alvo === 'dano' && !graus),
        fusaoDiv: (fd && fd.modo) ? fd : null,
    };
};

// ── rm_e19: liga/desliga a fusão ou a divisão ───────────────────────────────
// Mora em h.fusaoDiv e NÃO em char.hatsusAtivos porque é escolha do Hatsu, não do
// personagem — mas some junto com a desativação dele (ver _desativarHatsu).
window._hSetFusaoDiv = function (idx, campo, valor) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    if (!h) return;
    const fd = Object.assign({ modo: null, alvo: 'dano', folga: 0 }, h.fusaoDiv || {});
    if (campo === 'modo') fd.modo = (fd.modo === valor) ? null : valor;   // clicar de novo desliga
    else fd[campo] = valor;
    h.fusaoDiv = fd;
    saveCharacter(char);
    render(true);
};

// ── Setters da Ficha do Constructo (h.constructos[c]) ────────────────────────────
window._hSetConstructoField = function(idx, c, field, value) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    if (!h) return;
    const cst = _hCst(h, c);
    cst[field] = value;
    saveCharacter(char);
    renderHatsuInPlace();
};
// Igual a uploadCharacterImage (sheet.js): lê o arquivo como data URL e guarda direto no personagem,
// sem depender de nenhum bucket/storage externo.
window._hUploadConstructoImage = function(idx, c, input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const char = state.currentChar;
        const h = (char.hatsus || [])[idx];
        if (!h) return;
        const cst = _hCst(h, c);
        cst.imagemUrl = e.target.result;
        cst.imagePosition = { x: 50, y: 50 };
        saveCharacter(char);
        renderHatsuInPlace();
    };
    reader.readAsDataURL(input.files[0]);
};
// Mesmo modal de arrastar/clicar de window._openImagePositionModal (sheet.js), mas grava em
// cst.imagePosition em vez de char.imagePosition.
window._hOpenConstructoImagePositionModal = function(idx, c) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const cst = h ? _hCst(h, c) : null;
        if (!h || !cst || !cst.imagemUrl) return;
    
    const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
    const initial = cst.imagePosition || { x: 50, y: 50 };
    const draft = { x: initial.x, y: initial.y };

    const overlay = document.createElement('div');
    overlay.id = 'constructo-img-pos-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif';
    overlay.innerHTML = `
        <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:20px;width:100%;max-width:360px;box-shadow:0 0 60px ${tc}44">
            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">📍 Ajustar Imagem</div>
            <div style="font-size:10px;color:#6b7280;margin-bottom:14px">Clique ou arraste na prévia abaixo para escolher qual parte da imagem fica visível.</div>
            <div id="constructo-img-pos-preview" style="position:relative;width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;border:2px solid #1f2937;cursor:crosshair;background-image:url('${cst.imagemUrl.replace(/'/g, "\\'")}');background-size:cover;background-repeat:no-repeat;background-position:${draft.x}% ${draft.y}%;touch-action:none">
                <div id="constructo-img-pos-crosshair" style="position:absolute;width:18px;height:18px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ${tc},0 2px 8px rgba(0,0,0,0.6);left:${draft.x}%;top:${draft.y}%;transform:translate(-50%,-50%);pointer-events:none"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:16px">
                <button id="constructo-img-pos-cancel" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Cancelar</button>
                <button id="constructo-img-pos-save" style="flex:2;padding:11px;border-radius:10px;background:${tc};border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 20px ${tc}55">✓ Salvar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const preview = document.getElementById('constructo-img-pos-preview');
    const crosshair = document.getElementById('constructo-img-pos-crosshair');
    let dragging = false;

    function updateFromPoint(clientX, clientY) {
        const rect = preview.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        draft.x = x; draft.y = y;
        preview.style.backgroundPosition = `${x}% ${y}%`;
        crosshair.style.left = `${x}%`;
        crosshair.style.top = `${y}%`;
    }
    function onMouseDown(e) { dragging = true; updateFromPoint(e.clientX, e.clientY); }
    function onMouseMove(e) { if (dragging) updateFromPoint(e.clientX, e.clientY); }
    function onMouseUp() { dragging = false; }
    function onTouchStart(e) { dragging = true; const t = e.touches[0]; updateFromPoint(t.clientX, t.clientY); }
    function onTouchMove(e) { if (dragging) { const t = e.touches[0]; updateFromPoint(t.clientX, t.clientY); } }
    function onTouchEnd() { dragging = false; }

    preview.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    preview.addEventListener('touchstart', onTouchStart, { passive: true });
    preview.addEventListener('touchmove', onTouchMove, { passive: true });
    preview.addEventListener('touchend', onTouchEnd);

    function cleanup() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        overlay.remove();
    }
    document.getElementById('constructo-img-pos-cancel').onclick = cleanup;
    document.getElementById('constructo-img-pos-save').onclick = function() {
        cst.imagePosition = { x: draft.x, y: draft.y };
        saveCharacter(char);
        cleanup();
        renderHatsuInPlace();
    };
};
window._hAddConstructoCaracteristica = function(idx, c) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    if (!h) return;
    const cst = _hCst(h, c);
    if (!cst.caracteristicas) cst.caracteristicas = [];
    const nomes = (window.CARACTERISTICAS_INVOCACAO || []).map(c => c.nome);
    cst.caracteristicas.push(nomes[0] || '');
    saveCharacter(char);
    renderHatsuInPlace();
};
window._hSetConstructoCaracteristica = function(idx, c, i, nome) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const cst = h ? _hCst(h, c) : null;
        if (!h || !cst || !cst.caracteristicas) return;
    cst.caracteristicas[i] = nome;
    saveCharacter(char);
    renderHatsuInPlace();
};
window._hRemoveConstructoCaracteristica = function(idx, c, i) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const cst = h ? _hCst(h, c) : null;
        if (!h || !cst || !cst.caracteristicas) return;
    cst.caracteristicas.splice(i, 1);
    saveCharacter(char);
    renderHatsuInPlace();
};
window._hAddConstructoPericia = function(idx, c) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    if (!h) return;
    const cst = _hCst(h, c);
    if (!cst.pericias) cst.pericias = [];
    const slots = (window.CONSTRUCTO_DB || {}).PERICIA_SLOTS || 5;
    if (cst.pericias.length >= slots) return;
    cst.pericias.push({ tipo: 'tr', valor: 'FOR' });
    saveCharacter(char);
    renderHatsuInPlace();
};
window._hSetConstructoPericia = function(idx, c, i, field, value) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const cst = h ? _hCst(h, c) : null;
        if (!h || !cst || !cst.pericias || !cst.pericias[i]) return;
    cst.pericias[i][field] = value;
    if (field === 'tipo') {
        const tipoDef = ((window.CONSTRUCTO_DB || {}).PERICIA_TIPOS || []).find(t => t.id === value);
        cst.pericias[i].valor = tipoDef ? tipoDef.valores[0] : '';
    }
    saveCharacter(char);
    renderHatsuInPlace();
};
window._hRemoveConstructoPericia = function(idx, c, i) {
    const char = state.currentChar;
    const h = (char.hatsus || [])[idx];
    const cst = h ? _hCst(h, c) : null;
        if (!h || !cst || !cst.pericias) return;
    cst.pericias.splice(i, 1);
    saveCharacter(char);
    renderHatsuInPlace();
};
// ── Fim setters da Ficha do Constructo ───────────────────────────────────────

function renderHatsuDetail(container) {
    const char  = state.currentChar;
    const idx   = state.hatsuDetailIdx || 0;
    const h     = (char.hatsus || [])[idx];
    if (!h) { state.view = 'SHEET'; state.activeTab = 'NEN'; render(); return; }

    const catDB = (window.HATSU_DB && window.HATSU_DB.categorias[h.classe]) ||
                  (window.HATSU_DB && window.HATSU_DB.categorias[char.class]) || {};
    const tc    = catDB.cor || '#00ff88';
    const pnMax = window.calcularPHBase ? window.calcularPHBase(h.nivel||1) : 6;

    const _tipoIconsMap = { hostil:'⚔️', suporte:'🛡️', versatil:'🌀', instantaneo:'⚡', longa_duracao:'⏳' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'✦').join(''); } });
    const _tipoLabels = { hostil:'Hostil', suporte:'Suporte', versatil:'Versátil', instantaneo:'Instantâneo', longa_duracao:'Longa Duração' };
    const tipoNames = new Proxy(_tipoLabels, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||p).join(' + '); } });

    // Resolve nomes completos das restrições
    const allRDB = [];
    if (window.HATSU_DB) {
        const rg = window.HATSU_DB.restricoes_gerais;
        ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => {
            (rg[k]||[]).forEach(r => allRDB.push({...r, grupo:k}));
        });
        if (catDB.restricoes) catDB.restricoes.forEach(r => allRDB.push({...r, grupo:'categoria'}));
    }
    const allEDB = [];
    if (window.HATSU_DB) {
        (window.HATSU_DB.efeitos_gerais||[]).forEach(e => allEDB.push({...e, origem:'geral'}));
        // Include ALL categories so cross-category effects are found
        Object.values(window.HATSU_DB.categorias||{}).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => {
                if (!allEDB.find(x=>x.id===e.id)) allEDB.push({...e, origem:'categoria'});
            });
        });
    }

    const restricoesSel = (h.restricoes||[]).map(id => allRDB.find(r=>r.id===id)).filter(Boolean);
    const efeitosSel    = (h.efeitos||[]).map(id => allEDB.find(e=>e.id===id)).filter(Boolean);

    // Injeta efeitos escolhidos dentro de eg4 (Efeito Alternativo) e eg6 (Poder é Intenção)
    // sem duplicar caso o usuário também os tenha selecionado manualmente
    const _WRAPPER_META = {
        'eg4': { label:'🔀 Modo Alternativo' },
        'eg6': { label:'🎯 Poder é Intenção'   },
        'rm_e8': { label:'🔮 Imbuir Conjuração' },
    };
    // ── MODOS do Efeito Alternativo ───────────────────────────────────────────
    // Regra do manual: cada compra de eg4 CLONA o Modo A (raiz) num modo novo, que
    // adiciona um efeito e remove obrigatoriamente um efeito herdado da raiz. Modos
    // nunca clonam uns aos outros — todos partem do Modo A. Restrições herdadas podem
    // ser desligadas por modo. Nada disso é somado ao mesmo tempo: a tela mostra UM
    // modo de cada vez, e dano, TR e custo de aura são recalculados para aquele modo.
    const _sc = h.specialChoices || {};
    const _qtdEg4 = (h.efeitos || []).filter(function(id){ return id === 'eg4'; }).length;
    const _kEg4 = function(base, i) { return i > 0 ? (base + '#' + i) : base; };
    const _LETRAS = ['A','B','C','D','E','F','G','H'];
    // Modo 0 = raiz. Os demais vêm das compras de eg4.
    const _modos = [{ letra: 'A', nome: _sc['eg4_nome_raiz'] || '', raiz: true }];
    for (let _i = 0; _i < _qtdEg4; _i++) {
        _modos.push({
            letra: _LETRAS[_i + 1] || ('#' + (_i + 2)),
            nome: _sc[_kEg4('eg4_nome', _i)] || '',
            adicionado: _sc[_kEg4('eg4', _i)] || '',
            removido: _sc[_kEg4('eg4_remove', _i)] || '',
            restrOff: Array.isArray(_sc[_kEg4('eg4_restr_off', _i)]) ? _sc[_kEg4('eg4_restr_off', _i)] : [],
            restrAdd: Array.isArray(_sc[_kEg4('eg4_restr_add', _i)]) ? _sc[_kEg4('eg4_restr_add', _i)] : []
        });
    }
    let _modoIdx = parseInt(h.modoAtivo) || 0;
    if (_modoIdx >= _modos.length) _modoIdx = 0;
    const _modo = _modos[_modoIdx];
    const _temModos = _modos.length > 1;

    // As 4 chaves do eg4 guardam ID, não nome — ver o comentário em eg4Btn
    // (hatsu-creator.js). Resolvem para nome só na hora de exibir; o fallback para o
    // próprio valor cobre um dado antigo que ainda não migrou.
    const _nomeEfeitoEg4 = function (id) {
        const o = allEDB.find(function (e) { return e.id === id; });
        return o ? o.nome : id;
    };
    const _nomeRestrEg4 = function (id) {
        const o = allRDB.find(function (r) { return r.id === id; });
        return o ? o.nome : id;
    };

    // Aplica o modo ativo: tira o efeito removido, tira as restrições desligadas.
    if (_temModos && !_modo.raiz) {
        if (_modo.removido) {
            const _iRem = efeitosSel.findIndex(function(e){ return e.id === _modo.removido; });
            if (_iRem >= 0) efeitosSel.splice(_iRem, 1);
        }
        (_modo.restrOff || []).forEach(function(idR){
            const _iR = restricoesSel.findIndex(function(r){ return r.id === idR; });
            if (_iR >= 0) restricoesSel.splice(_iR, 1);
        });
        // Restrições exclusivas deste modo entram aqui, com todos os efeitos mecânicos
        // (inclusive o P.N que concedem, que vale só neste modo).
        (_modo.restrAdd || []).forEach(function (idR) {
            if (restricoesSel.some(function (r) { return r.id === idR; })) return;
            const add = allRDB.find(function (r) { return r.id === idR; });
            if (add) restricoesSel.push(add);
        });
    }

    Object.keys(_WRAPPER_META).forEach(function(wid) {
        if (!(h.efeitos||[]).includes(wid)) return;
        // O efeito adicionado por eg4 só entra no modo que o comprou.
        if (wid === 'eg4') {
            if (_modo.raiz || !_modo.adicionado) return;
            const addObj = allEDB.find(function(e){ return e.id === _modo.adicionado; });
            if (addObj && !efeitosSel.find(function(e){ return e.id === addObj.id; })) {
                efeitosSel.push(Object.assign({}, addObj, { _wrapper: 'eg4', _wrapperLabel: _WRAPPER_META.eg4.label }));
            }
            return;
        }
        // Guardado como ID desde a migração migrarEg6RmE8ParaIds. O fallback por nome
        // fica para Hatsu que ainda não passou por ela (ficha aberta antes de salvar).
        const pickedVal = (h.specialChoices||{})[wid];
        if (!pickedVal) return;
        const picked = allEDB.find(function(e){ return e.id === pickedVal; })
                    || allEDB.find(function(e){ return e.nome === pickedVal; });
        if (picked && !efeitosSel.find(function(e){ return e.id === picked.id; })) {
            efeitosSel.push(Object.assign({}, picked, { _wrapper: wid, _wrapperLabel: _WRAPPER_META[wid].label }));
        }
    });

    // ── Cálculo de Dano Final ──────────────────────────────────────────────────
    // DAMAGE_TABLE, BASE_DAMAGE_IDX, DAMAGE_OVERFLOW_STEP, DANO_GRAU_MAP, DANO_DADO_MAP e
    // DANO_PROPRIO_MAP agora vivem em window.* (topo do arquivo) para serem reaproveitados
    // fora desta função — ver window.calcGrausPotenciaPorCaracteristica.

    // Tipos e categorias que têm dano base (2d6 + attr)
    // h.tipo pode ser combinado ex: "hostil+instantaneo" — split para checar cada parte
    const tipoTemDano = ['hostil','versatil','instantaneo'];
    const tiposParts  = (h.tipo||'').split('+').map(t => t.trim());
    const isHostil    = tiposParts.some(t => tipoTemDano.includes(t));
    const catTemDano  = ['INTENSIFICAÇÃO','REFORÇO','TRANSMUTAÇÃO','EMISSÃO'];
    // h.classe é a categoria cross-category do hatsu (ex: EMISSÃO comprada por manipulador)
    const hatsuClasse = h.classe || char.class;
    // ── A CATEGORIA não cria dano sozinha ───────────────────────────────────────
    // Antes bastava a categoria ser uma das quatro para o Hatsu ganhar dano base, e
    // isso valia mesmo num Hatsu 100% de suporte: um Hatsu só de cura, de um
    // Intensificador, exibia "1d8 + FOR", um botão de distribuir graus e o botão de
    // rolar dano no Discord — tudo em cima de um dano que a construção não tem.
    // Quem decide é o TIPO escolhido (hostil/versátil/instantâneo) ou um efeito que
    // conceda dano. A categoria segue valendo APENAS como rede de segurança para
    // Hatsu salvo sem tipo nenhum, que é dado antigo e perderia o dano em silêncio.
    const temTipoDefinido = tiposParts.some(function (p) { return !!p; });
    const catDmg      = catTemDano.some(c => c === hatsuClasse) && !temTipoDefinido;

    // Verifica se algum efeito selecionado concede dano próprio
    const efeitosComDanoProprio = efeitosSel.filter(e => DANO_PROPRIO_MAP[e.id] && e.id !== 'eg10');
    const flageloCopias = (h.efeitos||[]).filter(id => id === 'eg10').length; // can have multiple copies
    const temFlagelo = flageloCopias > 0;
    const hasEfeitoDano = efeitosComDanoProprio.length > 0 || temFlagelo;

    // Dano/Cura Focal com cópia marcada como DANO (ou Forjar Arma escolhido como Arma)
    // também dá dano base — inclusive num Hatsu de suporte, porque aí foi o jogador que
    // marcou a cópia como dano. Calculado aqui em cima, e não lá dentro do bloco de
    // dano, porque agora é ele que ajuda a decidir SE existe bloco de dano.
    // Projétil de Aura: "Um Hatsu Hostil (de dano) criado com esse efeito inicia com 2d6
    // de dano. Um hatsu de suporte ou outros tipos, iniciam em 1d8." Ou seja, ele concede
    // o dano BASE — não uma linha extra —, e sobe esse base para 2d6 quando o Hatsu é
    // hostil, exatamente como o Dano/Cura Focal já fazia.
    const _temProjetilAura = efeitosSel.some(function (e) { return e.id === 'em_e4'; });
    const _temForjarArmaBase = efeitosSel.some(function (e) { return e.id === 'rm_e1'; })
        && (h.specialChoices || {})['rm_e1_tipo'] === 'Arma';
    const _tagsFocalBase = window.contarTagsFocal
        ? window.contarTagsFocal(h, efeitosSel) : { dano: 0, cura: 0 };
    const _temDanoFocalBase = _tagsFocalBase.dano > 0 || _temForjarArmaBase
        || (_temProjetilAura && isHostil);
    // Uma variável só para "este Hatsu tem a linha de dano BASE", usada em todos os
    // pontos que antes repetiam (isHostil || catDmg).
    const temDanoBase = isHostil || catDmg || _temDanoFocalBase || _temProjetilAura;

    // Detects sanity damage from restrictions/effects (beyond eg10)
    // Map of items that deal sanity damage with their values
    const SANIDADE_MAP = {
        'rma_m2': { dado: '+2/rod', desc: 'Zetsu Interrompe' },
        'ma_e7':  { dado: '+3',     desc: 'Mente Frágil' },
        'rg_p3':  { dado: '+1d10',  desc: 'Dano Permanente (ativação)' },
        'rg_e4':  { dado: '+5',     desc: 'Dano Permanente Constante (ativação)' },
        'rg_v5':  { dado: '+1d10',  desc: 'Dano Momentâneo Variável (ativação)' },
        'rg_v8':  { dado: '+5',     desc: 'Sorte ou Revés (crítico no alvo)' },
    };
    const sanidadeExtras = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        if (item.id === 'eg10') return;
        if (!SANIDADE_MAP[item.id]) return;
        // rma_m2: only show sanity damage if player chose that benefit
        if (item.id === 'rma_m2') {
            const sc = (h.specialChoices||{})['rma_m2'] || '';
            if (sc !== 'Dano Sanidade') return;
        }
        sanidadeExtras.push({ ...item, _san: SANIDADE_MAP[item.id] });
    });

    // Hatsu tem dano se: tipo que causa dano, OU Focal marcado como dano, OU efeito que
    // concede dano próprio. (A categoria entra só quando não há tipo salvo — ver acima.)
    const hasBaseDmg = temDanoBase || hasEfeitoDano;

    // Calcula graus totais de dano (só aplica se há dano base)
    let totalGraus = 0;
    const grauSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        // Restrição marcada como "Pura" converte o benefício em P.N — não aplica o Grau/Passo real
        if (h.pureRestrictions && h.pureRestrictions[item.id]) return;
        // Graus genéricos ("+X Graus em qualquer característica"): o destino é escolhido pelo
        // jogador no criador e somado em grausGenericosDoHatsu(). Pular aqui evita contar duas vezes.
        if ((window.GRAU_GENERICO_IDS || {})[item.id] !== undefined) return;
        // Efeitos de grau escolhido só somam no dano quando o jogador escolheu Dano/Cura.
        const _escDano = (window.GRAU_ESCOLHIDO_EFEITOS || {})[item.id];
        if (_escDano) {
            if ((h.specialChoices || {})[item.id] === 'Dano/Cura') {
                totalGraus += _escDano.graus;
                grauSources.push({ nome: item.nome + ' (escolha: Dano/Cura)', graus: _escDano.graus });
            }
            return;
        }
        let g = DANO_GRAU_MAP[item.id];
        if (!g || g <= 0) return;
        // rg_l11: Limitação de Alvos — "+1 Grau/Passo de dano/cura OU Aplica +1 condição".
        // O criador já oferecia as duas opções, mas o cálculo somava o dano sempre:
        // quem escolhia a condição levava o grau junto, de graça.
        if (item.id === 'rg_l11') {
            const bcL11 = (h.beneficioChoices||{})['rg_l11'] || '';
            if (!bcL11.toLowerCase().includes('dano') && !bcL11.toLowerCase().includes('cura')) return;
        }
        // rg_l16: Tempo de Carregamento — só aplica grau de Dano se escolheu "dano/cura" (alternativa é Concentração)
        if (item.id === 'rg_l16') {
            const bc = (h.beneficioChoices||{})['rg_l16'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
        }
        // rg_m13: Zetsu Protetivo — só aplica grau de Dano se escolheu "Dano"
        if (item.id === 'rg_m13') {
            const bc = (h.beneficioChoices||{})['rg_m13'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
        }
        // rg_v2: Canalizar com Concentração — só aplica grau de Dano se NÃO escolheu Duração
        if (item.id === 'rg_v2') {
            const bc = (h.beneficioChoices||{})['rg_v2'] || '';
            if (!bc.toLowerCase().includes('dano') && !bc.toLowerCase().includes('cura')) return;
        }
        // rg_p5: Efeitos Aleatórios — só aplica grau de Dano se escolheu "Graus de Potência" (não Margem de Crítico)
        if (item.id === 'rg_p5') {
            const bc = (h.beneficioChoices||{})['rg_p5'] || '';
            if (!bc || bc.toLowerCase().includes('margem') || bc.toLowerCase().includes('crítico')) return;
        }
        // rg_l1: Cálculo Pensado Básico 1 — escolha entre +1 Acerto OU +1 Grau/Passo de Dano/Cura
        // (mutuamente exclusivo); se escolheu Acerto, não conta aqui (ver bloco de acerto abaixo).
        if (item.id === 'rg_l1') {
            const bc = (h.beneficioChoices||{})['rg_l1'] || '';
            if (bc.toLowerCase().includes('acerto')) return;
        }
        // rg_l17: Condição Levemente Hostil — bnf usa "Acerto/Dano" (2ª escolha em specialChoices);
        // só conta aqui se escolheu a opção "+1 Contra o Alvo" (a de "-1 do Alvo" é um debuff no
        // alvo, não rastreado nos totais do usuário) E a 2ª escolha foi "Dano".
        if (item.id === 'rg_l17') {
            const bc = (h.beneficioChoices||{})['rg_l17'] || '';
            const sc = (h.specialChoices||{})['rg_l17'] || '';
            if (!bc.includes('+1') || sc.toLowerCase() !== 'dano') return;
        }
        totalGraus += g;
        grauSources.push({ nome: item.nome, graus: g });
    });

    // +1 Dado: acumula dados extras (ex: 2d6 → 3d6)
    let totalDados = 0;
    const dadoSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        const d = DANO_DADO_MAP[item.id];
        if (!d) return;
        totalDados += d.n;
        dadoSources.push({ nome: item.nome, n: d.n, tipo: d.tipo });
    });

    // Bônus de Talento aplicado a este hatsu
    if (h.bonusGraus && h.bonusGraus.tipo === 'dano') {
        totalGraus += h.bonusGraus.valor;
      grauSources.push({ nome: '💠 Bônus Talentoso', graus: h.bonusGraus.valor });
    }
    // Graus genéricos que o jogador mandou para Dano/Cura.
    const _genericos = window.grausGenericosDoHatsu ? window.grausGenericosDoHatsu(h) : {};
    if (_genericos.dano) {
        totalGraus += _genericos.dano;
        grauSources.push({ nome: 'Graus de Potência (escolha: Dano/Cura)', graus: _genericos.dano });
    }
    // 5 Graus do 1º Hatsu — dano
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.dano) {
        totalGraus += h.primeiroHatsuGraus.dano;
        grauSources.push({ nome: '⭐ 1º Hatsu (Dano)', graus: h.primeiroHatsuGraus.dano });
    }

    // rev.: a seleção de restrições/efeitos nunca é bloqueada por ultrapassar o teto de Grau de
    // Potência (ver hatsu-creator.js) — mas mecanicamente só o valor até o teto é aplicado aqui. O
    // excedente fica "reservado" e passa a contar automaticamente quando o nível do personagem
    // aumentar o teto (calcMaxGrauPorCaracteristica é recalculado a cada render).
    let danoGrauReservado = 0;
    if (window.calcMaxGrauPorCaracteristica) {
        const _grauMaxDano = window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'dano');
        if (_grauMaxDano !== Infinity && totalGraus > _grauMaxDano) {
            danoGrauReservado = totalGraus - _grauMaxDano;
            totalGraus = _grauMaxDano;
        }
    }

    // Atributo base pelo tipo/categoria
    // MANIPULAÇÃO: INT para C.S.O (objetos), PRE para C.S.C (criaturas/pessoas)
    const attrMap = {
        'INTENSIFICAÇÃO':'FOR','REFORÇO':'FOR',
        'TRANSMUTAÇÃO':'DES','EMISSÃO':'INT',
        'MATERIALIZAÇÃO':'INT',
        'ESPECIALIZAÇÃO':'PRE',
    };

    // Detect if attack is ranged (has emission effects or ranged attack)
    // em_e4 (Projétil de Aura) e em_e20 (Disparo Potente) faltavam aqui — eram os dois
    // efeitos mais obviamente à distância da categoria.
    const isRanged = (h.efeitos||[]).some(id => ['em_e1','em_e2','em_e3','em_e4','em_e6','em_e9','em_e14','em_e20'].includes(id));
    // Player-chosen modifier (stored in h.dmgMod); default by category/range
    let defaultAttr = attrMap[hatsuClasse] || 'FOR';
    if (hatsuClasse === 'MANIPULAÇÃO') {
        const hasCSO = (h.efeitos||[]).includes('ma_e1');
        const hasCSC = (h.efeitos||[]).includes('ma_e2');
        defaultAttr = (hasCSO && !hasCSC) ? 'INT' : 'PRE';
    }
    if (isRanged && !['EMISSÃO','TRANSMUTAÇÃO'].includes(hatsuClasse)) defaultAttr = 'DES';

    // Sugestões por categoria (destacadas, mas todos os atributos são selecionáveis)
    const CAT_MOD_SUGEST = {
        'INTENSIFICAÇÃO': ['FOR','DES'],
        'REFORÇO':        ['FOR','DES'],
        'TRANSMUTAÇÃO':   ['DES','SAB','INT'],
        'MATERIALIZAÇÃO': ['INT','FOR'],
        'ESPECIALIZAÇÃO': ['PRE','INT'],
        'MANIPULAÇÃO':    ['PRE','INT'],
        'EMISSÃO':        ['DES','INT'],
    };
    const modSugest = CAT_MOD_SUGEST[hatsuClasse] || (isRanged ? ['DES','INT'] : ['FOR','DES']);
    const ALL_ATTRS = ['FOR','DES','CON','INT','SAB','PRE'];

    // Usa o atributo salvo se válido, senão usa o primeiro sugerido
    const rawBaseAttr = h.dmgMod || defaultAttr;
    const baseAttr = ALL_ATTRS.includes(rawBaseAttr) ? rawBaseAttr : modSugest[0];

    // Atributo usado na Jogada de Ataque (acerto) — independente do atributo de Dano, pois o
    // jogador pode querer, por ex., DES para acertar e FOR para o dano de um mesmo golpe.
    const rawAtkAttr = h.atkMod || defaultAttr;
    const baseAttrAtk = ALL_ATTRS.includes(rawAtkAttr) ? rawAtkAttr : modSugest[0];

    // Categorias que usam CD (definido aqui pois é usado no modPickerHtml também)
    const catTemCD = ['MANIPULAÇÃO','MATERIALIZAÇÃO','ESPECIALIZAÇÃO'];
    const hasCDCategory = catTemCD.some(c => c === (h.classe||char.class));

    // Modifier picker — todos os atributos disponíveis, sugeridos destacados com estrela
    const modPickerHtml = (hasBaseDmg || hasCDCategory) ? `<div style="margin-bottom:10px">
        <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">💥 Modificador de Dano</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${ALL_ATTRS.map(a => {
                const active = baseAttr === a;
                const isSugest = modSugest.includes(a);
                // Atributo EFETIVO: inclui GYO e Aumento de Atributo dos Hatsus ativos.
        const mod = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, a).mod : getMod(char.attributes?.[a]?.value || 10);
                return `<button onclick="state.currentChar.hatsus[${idx}].dmgMod='${a}';saveCharacter(state.currentChar);renderHatsuInPlace()"
                    style="flex:1;min-width:52px;padding:7px 4px;border-radius:9px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid ${active?tc:isSugest?tc+'66':'#1f2937'};background:${active?tc+'22':'transparent'};color:${active?tc:isSugest?tc:'#6b7280'};transition:all .15s">
                    ${isSugest?'★ ':''}${a} <span style="font-size:8px;opacity:.8">(${mod>=0?'+'+mod:mod})</span>
                </button>`;
            }).join('')}
        </div>
        <div style="font-size:7px;color:#4b5563;margin-top:4px">★ sugerido para ${hatsuClasse}</div>
    </div>` : '';

    let _hatsuFinalDice = null;
    // Dado base (degrau da escada) e termo de dados extras, separados: o REN precisa do
    // primeiro para andar na DAMAGE_TABLE e do segundo para recolocar depois.
    let _hatsuDiceBase = null, _hatsuDiceExtra = '';
    // Dado da linha de CURA (Dano/Cura Focal com tag cura). Null quando não há cura.
    let _hatsuCuraDice = null, _hatsuCuraEspera = 0;
    let calcDanoHtml = '';
    if (hasBaseDmg) {
        // ── Linhas de dano/cura e a distribuição dos graus ──────────────────────
        // Calculado ANTES do bloco de dano base, porque as linhas extras e a de cura
        // também precisam saber quanto lhes coube do pool.
        // Reaproveita o que foi calculado lá em cima: recalcular aqui abriria espaço
        // para as duas contas divergirem no futuro.
        const _tags = _tagsFocalBase;
        const _temDanoFocal = _temDanoFocalBase;
        const _temCuraFocal = _tags.cura > 0;
        const _copiasRecup = efeitosSel.filter(function (e) { return e.id === 'ri_e3'; }).length;
        const _linhasDano = window.linhasDeDanoDoHatsu(h, efeitosSel, {
            temBase: temDanoBase,
            baseDado: _temDanoFocal ? '2d6' : '1d8',
            temCura: _temCuraFocal || _copiasRecup > 0,
            curaDado: _temCuraFocal ? '2d6' : '1d8',
            temFlagelo: temFlagelo,
        });
        // Distribuição do POOL livre. Fica separada dos graus dirigidos: o painel
        // "⚖ Distribuir" só pode mexer no pool, senão salvaria o grau dirigido dentro de
        // h.grauLinhas e ele passaria a contar duas vezes.
        const _poolPorLinha = window.calcGrausPorLinha(h, totalGraus, _linhasDano);
        // Graus dirigidos (ri_m1): a própria restrição aponta a linha, então entram por
        // fora do pool e não aparecem no painel de distribuição.
        const _dirigidos = window.grausDirigidosDoHatsu ? window.grausDirigidosDoHatsu(h, _linhasDano) : {};
        const _porLinha = {};
        _linhasDano.forEach(function (l) { _porLinha[l.id] = _poolPorLinha[l.id] || 0; });
        Object.keys(_dirigidos).forEach(function (k) {
            _porLinha[k] = (_porLinha[k] || 0) + _dirigidos[k];
            const _lbl = (_linhasDano.filter(function (l) { return l.id === k; })[0] || {}).label || k;
            grauSources.push({ nome: 'Aumento por Rodada → ' + _lbl, graus: _dirigidos[k] });
        });
        // Por meio de quem o dano acontece (constructo, arma forjada, criatura...).
        const _origem = window.origemDoFocal ? window.origemDoFocal(h) : null;
        // Guardado para o painel de distribuição (porLinha = só o pool) e para a rolagem
        // (porLinhaTotal = pool + dirigidos, o que de fato sobe a escada).
        if (!window._HATSU_ALOC) window._HATSU_ALOC = {};
        window._HATSU_ALOC[idx] = {
            linhas: _linhasDano, pool: totalGraus,
            porLinha: _poolPorLinha, porLinhaTotal: _porLinha, dirigidos: _dirigidos,
        };

        const danoColor = totalGraus > 0 ? '#f87171' : '#d1d5db';
        const grauDelta = totalGraus > 0 ? `+${totalGraus}` : totalGraus < 0 ? `${totalGraus}` : '';

        // Bloco de dano base (2d6 escalado) — aparece quando o Hatsu tem dano base
        // ── Flagelo da Mente: linha própria de SANIDADE ─────────────────────────
        // O efeito tinha dois modos: "Puro" (substituía o dano base por 1d10) e
        // "Complementar" (linha extra de 1d8). Pelo manual, Dano/Cura Focal e Flagelo
        // da Mente são o mesmo papel para recursos diferentes — PV e Sanidade — então
        // o Flagelo é SEMPRE a sua própria linha, partindo de 1d10, e um Hatsu pode
        // ter as duas ao mesmo tempo. Não há modo a escolher.
        let baseDmgSection = '';
        if (temDanoBase) {
            // Step 1: apply +dado (ex: 2d6 → 3d6)
            // ── Dano base: 2d6 só com Dano/Cura Focal ────────────────────────────────
            // Antes, ser Hostil (ou de categoria ofensiva) já garantia 2d6. Pela regra do
            // manual, o 2d6 é o dano do efeito Dano/Cura Focal (eg15) — quem não comprou
            // o efeito bate mais fraco. Hatsus hostis sem eg15 partem de 1d8.
            // Flagelo Puro segue a régua própria dele (1d10) e não é afetado.
            // ── Portas para o dano básico 2d6 ────────────────────────────────────────
            // Duas: o efeito Dano/Cura Focal (eg15) ou Forjar Objeto/Arma (rm_e1) QUANDO o
            // jogador escolhe "Arma" — a própria descrição do rm_e1 diz que causa 2d6 nesse caso.
            // Olhamos efeitosSel, não h.efeitos, porque ele já inclui o que veio por Poder é
            // Intenção, Efeito Alternativo e Imbuir Conjuração, e já respeita o modo ativo.
            const _idxSemFocal = DAMAGE_TABLE.indexOf('1d8');
            const _baseLabel = _temDanoFocal ? '2d6' : '1d8';
            let baseIdx = _temDanoFocal ? BASE_DAMAGE_IDX : _idxSemFocal;
            // ── Dados extras: termo PRÓPRIO quando saem da escada ───────────────────
            // A DAMAGE_TABLE é uma ESCADA, não um catálogo: vai 2d6 → 2d8 → 2d10 → 2d12 →
            // 3d10, então 3d6, 4d6, 5d6 e 3d8 não existem nela. Antes, quando a soma do
            // base com os dados extras caía num desses, o resultado virava uma string
            // solta e três coisas quebravam:
            //   1. DAMAGE_TABLE.indexOf(string) dava −1, então o popup de REN NUNCA abria
            //      (independente do teto e de o REN estar ligado);
            //   2. com grau aplicado, finalDice vinha da escada e o dado extra DESAPARECIA
            //      (um 3d6 com +1 grau exibia 2d8, perdendo um dado);
            //   3. baseIdx era jogado em BASE_DAMAGE_IDX (2d6) mesmo num Hatsu cujo base
            //      era 1d8, inflando o dano de quem não tem Dano/Cura Focal.
            // Agora o dado BASE continua na escada — é nele que o grau e o REN andam, por
            // decisão de regra do Lucas ("manter o REN apenas no dado base") — e os extras
            // saem como segundo termo, intactos.
            let afterDadoNote = '';
            let _dadosExtraTermo = '';
            if (totalDados > 0) {
                // Parse current base dice: "2d6" → n=2, d=6
                const baseMatch = DAMAGE_TABLE[baseIdx].match(/^(\d+)d(\d+)$/);
                if (baseMatch) {
                    const n = parseInt(baseMatch[1]) + totalDados;
                    const d = parseInt(baseMatch[2]);
                    // Find this new dice in the table or construct string
                    const newDice = n + 'd' + d;
                    const foundIdx = DAMAGE_TABLE.indexOf(newDice);
                    if (foundIdx >= 0) {
                        baseIdx = foundIdx;             // couberam na escada: nada muda
                    } else {
                        afterDadoNote = newDice;        // mantido para a linha de detalhe
                        _dadosExtraTermo = totalDados + 'd' + d;
                    }
                }
            }
            // O Flagelo não soma mais no dano base: ele tem linha própria de sanidade.
            const flageloGrauPuro = 0;

            // ── TETO DE GRAU/PASSO NO DANO PRINCIPAL ────────────────────────────────
            // O teto já existia, mas só era aplicado nos efeitos de dano EXTRA (Golpe
            // Reforçado, Penetração Dolorosa). O dano principal somava os graus e subia a
            // escada sem limite nenhum — por isso um nível 3 chegava a 4d8 sem aviso.
            //
            // O teto conta o DADO BASE como o primeiro degrau: teto 1 = 2d6 (o próprio
            // base), teto 2 = 2d8, teto 5 = 3d10. Então os degraus que podem ser subidos
            // são (teto − 1), e não o teto inteiro.
            const _tetoDanoBase = window.calcMaxGrauPorCaracteristica
                ? window.calcMaxGrauPorCaracteristica(char.level, h.classe || char.class, 'dano')
                : Infinity;
            const _grausQuerBase = (_porLinha.base || 0) + flageloGrauPuro;
            const _grausPodeBase = (_tetoDanoBase === Infinity)
                ? _grausQuerBase
                : Math.min(_grausQuerBase, Math.max(0, _tetoDanoBase - 1));
            const _grausEsperaBase = Math.max(0, _grausQuerBase - _grausPodeBase);

            // Step 2: apply graus on top
            const rawIdx = baseIdx + _grausPodeBase;
            const finalIdx = Math.max(0, Math.min(rawIdx, DAMAGE_TABLE.length - 1));
            // rev. Manual 2.0: ao ultrapassar o fim da tabela (20d20), cada grau excedente vira +5 de dano fixo
            const overflowSteps = Math.max(0, rawIdx - (DAMAGE_TABLE.length - 1));
            const overflowBonus = overflowSteps * DAMAGE_OVERFLOW_STEP;
            // Guardados separados: é do dado BASE que o REN sobe a escada, e ele é sempre
            // um degrau real da tabela — nunca uma string construída.
            _hatsuDiceBase = DAMAGE_TABLE[finalIdx];
            _hatsuDiceExtra = _dadosExtraTermo;
            let finalDice = DAMAGE_TABLE[finalIdx];
            if (_dadosExtraTermo) finalDice = finalDice + ' + ' + _dadosExtraTermo;
            if (overflowBonus > 0) finalDice = finalDice + ' + ' + overflowBonus;
            _hatsuFinalDice = finalDice;

            // ── Linha de CURA, quando há cópias do Focal marcadas como cura ─────────
            // A cura tem escada própria: base 2d6 na primeira cópia e +1 degrau por cópia
            // seguinte. Os graus gerais do Hatsu (restrições, Bônus Talentoso...) valem
            // para as duas linhas, porque são graus da característica Dano/Cura.
            // O teto do nível vale igual, e o excedente fica em espera.
            // Recuperação Veloz também é cura: entra na MESMA linha, somando os degraus
            // dela aos do Dano/Cura Focal marcado como cura. Duas fontes de cura no mesmo
            // Hatsu sobem juntas na escada, em vez de virarem linhas separadas.
            if (_temCuraFocal || _copiasRecup > 0) {
                // Sem o Focal marcado como cura, a base é a do próprio efeito de cura.
                const _baseCuraIdx = _temCuraFocal ? BASE_DAMAGE_IDX : DAMAGE_TABLE.indexOf('1d8');
                const _grausCura = Math.max(0, (_tags.cura - (_temCuraFocal ? 1 : 0)))
                    + Math.max(0, _copiasRecup - (_temCuraFocal ? 0 : 1))
                    + (_porLinha.cura || 0);
                const _curaPode = (_tetoDanoBase === Infinity)
                    ? _grausCura
                    : Math.min(_grausCura, Math.max(0, _tetoDanoBase - 1));
                const _idxCura = Math.max(0, Math.min(_baseCuraIdx + _curaPode, DAMAGE_TABLE.length - 1));
                _hatsuCuraDice = DAMAGE_TABLE[_idxCura];
                _hatsuCuraEspera = Math.max(0, _grausCura - _curaPode);
            }
            // Build info breakdown for popup
            const _danoInfo = [{ l: 'Base', v: _baseLabel, c: '#9ca3af' }];
            if (_grausEsperaBase > 0) {
                _danoInfo.push({
                    l: 'Teto do nível',
                    v: 'máx. ' + DAMAGE_TABLE[Math.min(baseIdx + Math.max(0, _tetoDanoBase - 1), DAMAGE_TABLE.length - 1)]
                        + ' — ' + _grausEsperaBase + ' grau(s) em espera',
                    c: '#fbbf24',
                });
            }
            if (!_temDanoFocal) {
                _danoInfo.push({ l: 'Sem Dano/Cura Focal', v: 'compre o efeito (ou Forjar Arma) para partir de 2d6', c: '#fbbf24' });
            }
            if (dadoSources.length > 0) {
                dadoSources.forEach(function(s){ _danoInfo.push({ l: '+' + s.n + ' dado (' + s.tipo + ')', v: s.nome, c: '#fbbf24' }); });
                const _afterDadoV = afterDadoNote || DAMAGE_TABLE[Math.min(baseIdx, DAMAGE_TABLE.length - 1)];
                _danoInfo.push({ l: '  → após dados', v: _afterDadoV, c: '#fbbf24', i: true });
            }
            grauSources.forEach(function(s){ _danoInfo.push({ l: '+' + s.graus + ' grau' + (s.graus > 1 ? 's' : ''), v: s.nome, c: '#f87171' }); });
            if (danoGrauReservado > 0) _danoInfo.push({ l: '⏳ Reservado (teto do nível)', v: '+' + danoGrauReservado + ' grau' + (danoGrauReservado > 1 ? 's' : '') + ' aguardando', c: '#fbbf24' });
            if (flageloGrauPuro > 0) _danoInfo.push({ l: '+' + flageloGrauPuro + ' grau' + (flageloGrauPuro > 1 ? 's' : ''), v: 'Flagelo Puro ×' + flageloCopias, c: '#a78bfa' });
            if (overflowBonus > 0) _danoInfo.push({ l: '+' + overflowBonus + ' dano fixo', v: 'Excedente da tabela (fim em 20d20)', c: '#fbbf24' });
            if (_origem) {
                _danoInfo.push({ l: 'Causado por', v: _origem.nome + ' — não pelo usuário diretamente', c: '#60a5fa' });
            }
            if (Object.keys(_dirigidos).length) {
                _danoInfo.push({ l: 'Aumento por Rodada', v: 'os graus entram 1 por rodada (rodada 1: +1 · rodada 2: +2)', c: '#fbbf24' });
            }
            _danoInfo.push({ l: '→ Total', v: finalDice + ' + ' + baseAttr, c: '#f87171', b: true });
            _danoInfo.push({ type: 'diceTable', table: DAMAGE_TABLE, tblStart: (_temDanoFocal ? BASE_DAMAGE_IDX : _idxSemFocal), tblAfterDado: baseIdx, tblFinal: finalIdx });
            if (!window._HATSU_DANO_INFO) window._HATSU_DANO_INFO = {};
            window._HATSU_DANO_INFO[idx] = _danoInfo;
            const baseNote = (totalDados > 0 || totalGraus > 0 || flageloGrauPuro > 0) ? `(base ${_baseLabel})` : '';
            const psiLabel = '';  // o rótulo Psíquico vive na linha do Flagelo, não no dano base
            baseDmgSection = `
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:26px;color:${danoColor};text-shadow:0 0 14px ${danoColor+'66'};line-height:1">${finalDice}</div>
                    <div style="font-size:14px;font-weight:700;color:#6b7280">+ ${baseAttr}</div>
                    ${psiLabel}
                    ${baseNote ? `<div style="font-size:9px;color:#4b5563;font-style:italic">${baseNote}</div>` : ''}
                    ${_origem ? `<div style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:10px;background:#60a5fa22;color:#60a5fa;border:1px solid #60a5fa55">⚔ ${_origem.nome}</div>` : ''}
                    <button onclick="event.stopPropagation();window._hShowDanoInfo(${idx},this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0;transition:border-color .15s,color .15s" title="Como chegamos aqui">ⓘ</button>
                </div>
                ${_origem ? `<div style="font-size:8px;color:#60a5fa;margin-bottom:4px;line-height:1.5">Este dano é causado por <b>${_origem.nome}</b>, não pelo usuário diretamente. Para causar dano sem ser por meio de ${_origem.nome}, compre e atribua ao próprio usuário.</div>` : ''}
                ${totalDados > 0 ? `<div style="font-size:8px;color:#fbbf24;margin-bottom:4px">${dadoSources.map(s=>`• ${s.nome}: +${s.n} dado (${s.tipo})`).join(', ')}</div>` : ''}`;
        }

        // Danos extras de efeitos próprios
        let extraDmgSection = '';
        if (temFlagelo) {
            // Base 1d10 (manual: "Hatsus de dano de sanidade começam com 1d10+Atributo"),
            // subindo um grau/passo por compra: 1d10 → 1d12 → 2d6 → 2d8…
            // Era 1d8 aqui, valor que não existe na regra.
            const FLAGELO_BASE_IDX = DAMAGE_TABLE.indexOf('1d10');
            const flageloGraus = (flageloCopias - 1) + (_porLinha.eg10 || 0);
            const flageloIdx = Math.min(FLAGELO_BASE_IDX + flageloGraus, DAMAGE_TABLE.length - 1);
            const flageloDado = DAMAGE_TABLE[flageloIdx];
            const extraLabel = flageloGraus > 0 ? ` ×${flageloCopias} (+${flageloGraus} grau${flageloGraus>1?'s':''})` : '';
            extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#a78bfa">${flageloDado}</span>
                <span style="font-size:10px;color:#7c3aed;font-weight:700">Psíquico</span>
                <span style="font-size:9px;color:#4b5563">Flagelo da Mente${extraLabel}</span>
            </div>`;
        }
        // Sanidade extras de outras fontes
        if (sanidadeExtras.length > 0) {
            sanidadeExtras.forEach(item => {
                extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#c084fc">${item._san.dado}</span>
                    <span style="font-size:10px;color:#7c3aed;font-weight:700">Sanidade</span>
                    <span style="font-size:9px;color:#4b5563">${item._san.desc}</span>
                </div>`;
            });
        }
        // Golpe Reforçado / Fúria Potencializada: escalam pela COMPRA REPETIDA do efeito (não por REN) — renderiza 1x por id, já consolidado
        // Consolidados num card só por id: quem escala por cópia não aparece repetido.
        const REPETIVEIS_POR_COPIA = Object.keys(window.DANO_PROPRIO_ESCALA || {});
        const idsJaRenderizados = new Set();
        // ── O atributo entra UMA vez só, no fim ─────────────────────────────────────
        // Cada efeito de dano próprio foi escrito como se fosse um Hatsu inteiro, então
        // a linha dele imprimia "+ ATRIBUTO" também. Somados no mesmo Hatsu, isso mostrava
        // o atributo duas ou três vezes, sugerindo 4d8+FOR+1d8+FOR quando o correto é
        // 4d8+1d8+FOR.
        //
        // Quando NÃO existe dano base (Hatsu sem Dano/Cura Focal nem Forjar Arma), o dado
        // extra É o dano do Hatsu — aí ele precisa mostrar o atributo, e só o primeiro
        // extra com dado o faz. Valor bruto (Penetração Dolorosa) nunca mostra: não é
        // rolagem própria, é número somado ao total.
        const _mostraAttrNoExtra = !_hatsuFinalDice;
        const _primeiroExtraComDado = (function () {
            const p = efeitosComDanoProprio.find(function (e) {
                const d = DANO_PROPRIO_MAP[e.id];
                return d && /\d+d\d+/.test(String(d.dado));
            });
            return p ? p.id : null;
        })();

        efeitosComDanoProprio.forEach(e => {
            const d = DANO_PROPRIO_MAP[e.id];
            if (!d) return;
            const isRepetivel = REPETIVEIS_POR_COPIA.includes(e.id);
            if (isRepetivel) {
                if (idsJaRenderizados.has(e.id)) return; // já consolidado na 1ª ocorrência
                idsJaRenderizados.add(e.id);
            }
            // HB (p.11): Hatsu Hostil inicia em 2d6 "independente de arma ou efeito de dano escolhido (se for menor)".
            // Efeitos cujo dado próprio é ≤ 2d6 são absorvidos pelo dano base e não aparecem separados.
            if (temDanoBase && !d.dado.startsWith('+')) {
                const specialTypes = ['Psíquico', 'Contínuo', 'Ferida', 'Sanidade'];
                if (!specialTypes.includes(d.tipo)) {
                    const eIdx = DAMAGE_TABLE.indexOf(d.dado);
                    if (eIdx >= 0 && eIdx <= BASE_DAMAGE_IDX) return; // absorvido pelo 2d6 base
                }
            }
            const typeColors = { 'Projétil':'#38bdf8','Potente':'#38bdf8','Linha':'#38bdf8','Área':'#f87171','Objeto':'#a3e635','Corporal':'#a3e635','Criatura':'#fb923c','Extra':'#fb923c','Bloquear':'#fb923c','Contínuo':'#f43f5e','Ferida':'#f43f5e' };
            const ec = typeColors[d.tipo] || '#9ca3af';
            // Efeitos SEM escada cadastrada: a regra antiga só os escalava quando o Hatsu
            // não tinha dano base nenhum (!temDanoBase). Quem TEM escada passa pelo
            // bloco abaixo, que agora também soma os graus gerais — antes a condição aqui
            // era restrita demais e a de baixo ignorava os graus, então um Materializador
            // com +5 graus via o dado base e o rótulo "(+5 grau)" ao lado.
            let displayDado = d.dado;
            const _grausDesta = _porLinha[e.id] || 0;
            if (!temDanoBase && _grausDesta > 0 && !(window.DANO_PROPRIO_ESCALA || {})[e.id]) {
                // Find base index from dado string (e.g. "1d8" → idx 2)
                const baseIdx = DAMAGE_TABLE.indexOf(d.dado);
                if (baseIdx >= 0) {
                    const scaledIdx = Math.min(baseIdx + _grausDesta, DAMAGE_TABLE.length - 1);
                    displayDado = DAMAGE_TABLE[scaledIdx];
                }
            }
            // ── Escala do próprio efeito, limitada pelo teto de Dano/Cura do nível ──────
            let copiasLabel = '';
            let reservadoLabel = '';
            const _esc = (window.DANO_PROPRIO_ESCALA || {})[e.id];
            if (_esc) {
                const copias = (h.efeitos||[]).filter(id => id === e.id).length;
                const _tetoDano = window.calcMaxGrauPorCaracteristica
                    ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'dano')
                    : Infinity;
                if (_esc.tipo === 'dado') {
                    // Cada cópia extra vale 1 degrau na tabela, e 1 grau contra o teto.
                    // O teto conta o dado base como primeiro degrau, então dá para subir
                    // (teto − 1) degraus — mesma contagem do dano principal.
                    //
                    // Os GRAUS GERAIS do Hatsu (restrições, Bônus Talentoso, 5 Graus do
                    // 1º Hatsu…) também contam aqui: são graus da característica Dano/Cura,
                    // e valem para TODA linha de dano/cura do Hatsu — é como a linha de
                    // cura já funcionava. Antes só as cópias contavam, então um Hatsu com
                    // +5 graus exibia o rótulo "(+5 grau)" e mostrava o dado base.
                    const degrausQuer = (copias - 1) + _grausDesta;
                    const _tetoPassos = (_tetoDano === Infinity) ? Infinity : Math.max(0, _tetoDano - 1);
                    const degrausPode = (_tetoPassos === Infinity) ? degrausQuer : Math.min(degrausQuer, _tetoPassos);
                    const bIdx = DAMAGE_TABLE.indexOf(_esc.base);
                    if (bIdx >= 0) {
                        displayDado = DAMAGE_TABLE[Math.min(bIdx + degrausPode, DAMAGE_TABLE.length - 1)];
                        if (copias > 1) copiasLabel = ` ×${copias}`;
                        if (degrausQuer > degrausPode) reservadoLabel = ` ⏳ +${degrausQuer - degrausPode} em espera`;
                    }
                } else if (_esc.tipo === 'bruto') {
                    // O valor bruto É a contagem de graus: com teto 3, +5 vira +3.
                    const valorQuer = _esc.base + ((copias - 1) + _grausDesta) * (_esc.passo || 1);
                    const valorPode = (_tetoDano === Infinity) ? valorQuer : Math.min(valorQuer, _tetoDano);
                    displayDado = '+' + valorPode;
                    if (copias > 1) copiasLabel = ` ×${copias}`;
                    if (valorQuer > valorPode) reservadoLabel = ` ⏳ +${valorQuer - valorPode} em espera`;
                }
            }
            extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:${ec}">${displayDado}</span>
                <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:${ec}22;color:${ec}">${d.tipo}</span>
                <span style="font-size:9px;color:#4b5563">${d.desc}${copiasLabel}${_grausDesta > 0 ? ` (+${_grausDesta} grau)` : ''}</span>
                ${reservadoLabel ? `<span style="font-size:8px;font-weight:900;padding:1px 6px;border-radius:8px;background:#fbbf2422;color:#fbbf24">${reservadoLabel}</span>` : ''}
                ${_mostraAttrNoExtra && _primeiroExtraComDado === e.id ? `<span style="font-size:9px;color:#6b7280">+ ${baseAttr}</span>` : ''}
            </div>`;
        });

        // Onda Surda (ri_e13): não concede dado/grau extra — ignora RD/bloqueio em parte dos dados já rolados
        const temOndaSurda = efeitosSel.some(e => e.id === 'ri_e13');
        if (temOndaSurda && _hatsuFinalDice) {
            const diceMatch = String(_hatsuFinalDice).match(/^(\d+)d\d+/);
            const totalDiceCount = diceMatch ? parseInt(diceMatch[1]) : 1;
            const metadeDados = Math.max(1, Math.floor(totalDiceCount / 2));
            extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:#fb923c22;color:#fb923c">Onda Surda</span>
                <span style="font-size:9px;color:#4b5563">até ${metadeDados} dado${metadeDados>1?'s':''} ignora(m) RD/bloqueio (rolado após o cálculo de defesa)</span>
            </div>`;
        }

        // Chips de fontes de grau e dado
        const sourcesHtml = (grauSources.length > 0 || dadoSources.length > 0)
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
                ${dadoSources.map(s => `<span style="font-size:7px;font-weight:900;background:#fbbf2418;color:#fbbf24;padding:2px 6px;border-radius:4px">+${s.n} dado · ${s.nome}</span>`).join('')}
                ${grauSources.map(s => `<span style="font-size:7px;font-weight:900;background:#ef444418;color:#f87171;padding:2px 6px;border-radius:4px">+${s.graus} grau · ${s.nome}</span>`).join('')}
              </div>`
            : '';

        // Linha de CURA: escada própria, exibida logo abaixo do dano. O Hatsu pode ter
        // as duas — causa X de dano e recupera Y de vida.
        const _curaSection = _hatsuCuraDice ? `
            <div style="display:flex;align-items:center;gap:10px;margin-top:10px;padding-top:10px;border-top:1px dashed #1f2937">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:26px;color:#4ade80;text-shadow:0 0 18px #4ade8055">${_hatsuCuraDice}</div>
                <div style="flex:1">
                    <div style="font-size:11px;font-weight:700;color:#4ade80">💚 de Cura <span style="font-size:9px;color:#6b7280">+ ${baseAttr}</span></div>
                    <div style="font-size:8px;color:#6b7280;margin-top:2px">Dano/Cura Focal com tag Cura (base 2d6)${_origem ? ` · por meio de <span style="color:#60a5fa">${_origem.nome}</span>` : ''}</div>
                </div>
                ${_hatsuCuraEspera > 0 ? `<span style="flex-shrink:0;font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24">+${_hatsuCuraEspera} em espera ⏳</span>` : ''}
            </div>` : '';

        calcDanoHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px">💥 Dano Final</div>
                <div style="display:flex;gap:4px;align-items:center">
                ${(totalGraus > 0 && _linhasDano.length > 1) ? `<button onclick="event.stopPropagation();window._openAlocacaoGraus()" title="Escolher em qual linha cada grau entra" style="font-size:7px;font-weight:900;padding:3px 9px;border-radius:10px;background:${tc}22;border:1px solid ${tc}55;color:${tc};cursor:pointer;text-transform:uppercase;letter-spacing:.5px">⚖ Distribuir</button>` : ''}
                ${grauDelta ? `<span title="Pool distribuível entre as linhas" style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#ef444422;color:#f87171">${grauDelta} grau${Math.abs(totalGraus)!==1?'s':''}</span>` : ''}
                ${(() => { const _nd = Object.keys(_dirigidos).reduce((a,k)=>a+_dirigidos[k],0); return _nd > 0 ? `<span title="Aumento por Rodada — a restrição já aponta a linha, fora do pool" style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#60a5fa22;color:#60a5fa">+${_nd} dirigido${_nd!==1?'s':''} ⏱</span>` : ''; })()}
                ${danoGrauReservado > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${danoGrauReservado} em espera ⏳</span>` : ''}
                </div>
            </div>
            ${modPickerHtml}
            ${baseDmgSection}
            ${_curaSection}
            ${extraDmgSection}
            ${sourcesHtml}
        </div>`;
    }
    // ── Cálculo de bônus de acerto ───────────────────────────────────────────
    // Hatsus hostis/versáteis/instantâneos que NÃO usam CD precisam de jogada de ataque.
    // O jogador pode sobrescrever a regra padrão por categoria (h.ataqueOverride: 'sim'|'nao'),
    // já que um Hatsu de categoria CD também pode ter jogada de Ataque, e vice-versa.
    const ataqueOverride = h.ataqueOverride || '';
    const hasAttack = hasBaseDmg && (ataqueOverride === 'sim' ? true : ataqueOverride === 'nao' ? false : !hasCDCategory);

    const ACERTO_BNF_MAP = {
        'rg_l12': 1,  // Limitação de Movimento 1: +1 em Jogadas de Acerto
        'rg_m11': 2,  // Limite Emocional: +2 em Jogadas de Acerto
        'ri_l3':  1,  // Sem Defesas (Reforço): +1 na jogada de ataque
    };

    let acertoBonus = 0;
    let acertoVantagem = false;
    const acertoBonusSources = [];
    let _ma15Contado = false;   // Controle Superior soma com teto — ver abaixo

    // Instâncias e Inclinações: calcBonusAcerto (config.js) vale para o Hatsu e para
    // o ataque com arma, então mora fora deste arquivo. Até aqui o acerto só lia o
    // ACERTO_BNF_MAP (restrições e efeitos do Hatsu) e ignorava as duas.
    if (window.calcBonusAcerto) {
        const _ba = window.calcBonusAcerto(char);
        if (_ba.total > 0) {
            acertoBonus += _ba.total;
            _ba.fontes.forEach(function (f) { acertoBonusSources.push({ nome: f.nome, bonus: f.valor }); });
        }
    }
    // em_e8 Stalker: "+1 para encontrar/acertar (máx. +3)". O bônus é do Hatsu que
    // marcou o alvo, então entra no acerto DELE, e não no cálculo compartilhado.
    // Cada compra escolhe entre localizar e acertar; só as de acerto contam.
    if (window.bonusStalker) {
        const _st = window.bonusStalker(h);
        if (_st > 0) { acertoBonus += _st; acertoBonusSources.push({ nome: 'Stalker (alvo marcado)', bonus: _st }); }
    }

    [...restricoesSel, ...efeitosSel].forEach(item => {
        // Bônus fixos
        const bonus = ACERTO_BNF_MAP[item.id];
        if (bonus) {
            acertoBonus += bonus;
            acertoBonusSources.push({ nome: item.nome, bonus });
        }
        // ma_e15 Controle Superior: "+1 em Testes ou Ataques (+5 no máximo)". Fica fora
        // do ACERTO_BNF_MAP porque aquele mapa soma uma vez por cópia, sem teto — e este
        // efeito tem teto. O acumulado é contado uma vez só, na primeira cópia.
        if (item.id === 'ma_e15' && !_ma15Contado) {
            _ma15Contado = true;
            const _copias = efeitosSel.filter(function (e) { return e.id === 'ma_e15'; }).length;
            const _b15 = Math.min(5, _copias);
            acertoBonus += _b15;
            acertoBonusSources.push({ nome: item.nome + (_copias > 5 ? ' (teto +5)' : ''), bonus: _b15 });
        }
        // Condicionais: rg_l1 (Cálculo Pensado 1) — +1 acerto ou dano
        if (item.id === 'rg_l1') {
            const bc = (h.beneficioChoices||{})[item.id] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Condicionais: rg_l13 (Limitação de Movimento 2) — +1 acerto ou +1 CD
        if (item.id === 'rg_l13') {
            const bc = (h.beneficioChoices||{})[item.id] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Condicionais: rg_m13 (Zetsu Protetivo) — +2 acerto ou dano ou rodadas
        if (item.id === 'rg_m13') {
            const bc = (h.beneficioChoices||{})[item.id] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 2;
                acertoBonusSources.push({ nome: item.nome, bonus: 2 });
            }
        }
        // Condicionais: rg_l17 (Condição Levemente Hostil) — +1 Acerto/Dano contra o alvo, com
        // 2ª escolha (Acerto ou Dano) em specialChoices; a opção "-1 do Alvo" é um debuff no
        // alvo (não rastreado nos totais do usuário).
        if (item.id === 'rg_l17') {
            const bc = (h.beneficioChoices||{})['rg_l17'] || '';
            const sc = (h.specialChoices||{})['rg_l17'] || '';
            if (bc.includes('+1') && sc.toLowerCase() === 'acerto') {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Condicionais: rg_l18 (Mãos Livres) — +1 em Jogadas de Acerto ou +1 em Reações Defensivas
        // (Reações Defensivas não tem contrapartida rastreada nos totais, então só conta se escolheu Acerto).
        if (item.id === 'rg_l18') {
            const bc = (h.beneficioChoices||{})['rg_l18'] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Efeitos de grau escolhido apontados para Acerto
        const _escAc = (window.GRAU_ESCOLHIDO_EFEITOS || {})[item.id];
        if (_escAc && (h.specialChoices || {})[item.id] === 'Acerto') {
            acertoBonus += _escAc.graus;
            acertoBonusSources.push({ nome: item.nome, bonus: _escAc.graus });
        }
        // Segredo Mortal: vantagem em acerto
        if (item.id === 'rg_p12') {
            acertoVantagem = true;
        }
    });
    // Aumento de Atributo: entra no acerto quando o atributo aumentado é o do ataque.
    const _aaTeto = window.aumentoAtributoPorTeto
        ? window.aumentoAtributoPorTeto(h, baseAttrAtk, baseAttr)
        : { acerto: 0, cd: 0, total: 0, lista: [] };
    if (_aaTeto.acerto > 0) {
        acertoBonus += _aaTeto.acerto;
        acertoBonusSources.push({ nome: 'Aumento de Atributo (' + baseAttrAtk + ')', bonus: _aaTeto.acerto });
    }
    // Graus genéricos mandados para o Acerto (1 grau = +1 na jogada).
    if (_genericos.acerto) {
        acertoBonus += _genericos.acerto;
        acertoBonusSources.push({ nome: 'Graus de Potência (Acerto)', bonus: _genericos.acerto });
    }
    // 5 Graus do 1º Hatsu — Acerto
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.acerto) {
        acertoBonus += h.primeiroHatsuGraus.acerto;
        acertoBonusSources.push({ nome: '⭐ 1º Hatsu', bonus: h.primeiroHatsuGraus.acerto });
    }
    // Nunca deixa o bônus de acerto ultrapassar o teto do nível — excedente reservado, aplicado
    // automaticamente quando o teto do nível aumentar.
    let acertoGrauReservado = 0;
    // (sem teto: acertoBonus fica como está — acerto entra em CARACTERISTICAS_SEM_TETO)
    // ── Fim cálculo de acerto ─────────────────────────────────────────────────

    window._hatsuRollState = {
        dice: _hatsuFinalDice,
        diceBase: _hatsuDiceBase,
        diceExtra: _hatsuDiceExtra,
        // Linha de CURA separada, quando o Dano/Cura Focal tem cópias marcadas como cura.
        curaDice: _hatsuCuraDice,
        curaEspera: _hatsuCuraEspera,
        attr: baseAttr,
        atkAttr: baseAttrAtk,
        nome: h.nome,
        // Por meio de quem o dano acontece — vai no histórico e na mensagem do Discord,
        // para a mesa saber que quem bate é o constructo/arma e não o usuário.
        origem: ((window.origemDoFocal ? window.origemDoFocal(h) : null) || {}).nome || '',
        hasBaseDmg,
        hasAttack,
        cd: null,
        acertoBonus,
        acertoVantagem,
        nivel: parseInt(h.nivel || char.level || 1),
        sanExtras: sanidadeExtras.map(e => ({ dado: e._san.dado, desc: e._san.desc })),
        // ── Extras que vão para a ROLAGEM ───────────────────────────────────────────
        // A TELA consolidava as cópias (Golpe Reforçado 2x = 1d10), mas a rolagem montava
        // uma entrada por CÓPIA, então o Discord recebia duas linhas de 1d8. Os dois lados
        // precisam usar a mesma escada.
        dmgExtras: (function () {
            const vistos = new Set();
            const out = [];
            efeitosComDanoProprio.forEach(function (e) {
                const d = DANO_PROPRIO_MAP[e.id];
                if (!d) return;
                const esc = (window.DANO_PROPRIO_ESCALA || {})[e.id];
                if (!esc) { out.push({ dado: d.dado, tipo: d.tipo, desc: d.desc }); return; }
                if (vistos.has(e.id)) return;
                vistos.add(e.id);
                const copias = (h.efeitos || []).filter(function (id) { return id === e.id; }).length;
                    // Usa a MESMA distribuição que a tela calculou (window._HATSU_ALOC), em vez
                // de refazer a conta aqui — foi assim que tela e rolagem divergiram antes.
                const _alocRoll = ((window._HATSU_ALOC || {})[idx] || {}).porLinhaTotal || {};
                const quer = Math.max(0, (copias - 1) + (_alocRoll[e.id] || 0));
                const teto = window.calcMaxGrauPorCaracteristica
                    ? window.calcMaxGrauPorCaracteristica(char.level, h.classe || char.class, 'dano')
                    : Infinity;
                const pode = (teto === Infinity) ? quer : Math.min(quer, Math.max(0, teto - 1));
                if (esc.tipo === 'dado') {
                    const bIdx = DAMAGE_TABLE.indexOf(esc.base);
                    const dado = (bIdx >= 0)
                        ? DAMAGE_TABLE[Math.min(bIdx + pode, DAMAGE_TABLE.length - 1)]
                        : String(d.dado).replace(/^\+\s*/, '');
                    out.push({ dado: '+ ' + dado, tipo: d.tipo, desc: d.desc });
                } else {
                    out.push({ dado: '+' + (esc.base + (esc.passo || 1) * pode), tipo: d.tipo, desc: d.desc });
                }
            });
            return out;
        })()
    };
    // ── Fim cálculo de dano ────────────────────────────────────────────────────

    // ── Cálculo de CD do TR ───────────────────────────────────────────────────
    // catTemCD e hasCDCategory já definidos acima (antes do modPickerHtml)

    // Verifica se alguma restrição ou efeito tem bônus de CD no bnf
    // Extrai o MAIOR valor positivo de "+X na CD" mencionado no bnf de cada item
    const CD_BNF_MAP = {
        'rg_l4':  1, // +1 na CD do TR
        'rg_l13': 1, // +1 em Jogadas de Acerto ou +1 na CD do TR
        'rg_m5':  2, // Ignora Resistências Físicas ou +2 na CD do TR
        'rg_m9':  2, // +2 na CD do TR
        'rg_p7':  3, // +3 ou -3 na CD de TRs Impostos ou Enfrentados
        'rma_l1': 1, // +1 na CD de resistência do alvo
        'rma_m3': 2, // +2 na CD de resistência do alvo
        'rma_p1': 5, // +5 na CD de resistência do alvo
    };

    let cdBonusTotal = 0;
    const cdBonusSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        // Efeitos de grau escolhido apontados para a CD do TR
        const _escCd = (window.GRAU_ESCOLHIDO_EFEITOS || {})[item.id];
        if (_escCd) {
            if ((h.specialChoices || {})[item.id] === 'CD do TR') {
                cdBonusTotal += _escCd.graus;
                cdBonusSources.push({ nome: item.nome, bonus: _escCd.graus });
            }
            return;
        }
        const bonus = CD_BNF_MAP[item.id];
        if (!bonus) return;
        const bc = (h.beneficioChoices||{})[item.id] || '';
        // rg_l13: Limitação de Movimento 2 — escolha entre +1 Acerto OU +1 CD (mutuamente exclusivo);
        // se escolheu Acerto, não conta aqui (ver bloco de acerto).
        if (item.id === 'rg_l13' && bc.toLowerCase().includes('acerto')) return;
        // rg_m5: Conhecimento Prof. do Alvo — escolha entre Ignora Resistências Físicas OU +2 CD;
        // só conta aqui se explicitamente escolheu a opção de CD (ou ainda não escolheu).
        if (item.id === 'rg_m5' && bc && !bc.toLowerCase().includes('cd')) return;
        cdBonusTotal += bonus;
        cdBonusSources.push({ nome: item.nome, bonus });
    });
    // Aumento de Atributo: entra na CD quando o atributo aumentado é o usado no TR.
    if (_aaTeto.cd > 0) {
        cdBonusTotal += _aaTeto.cd;
        cdBonusSources.push({ nome: 'Aumento de Atributo (' + baseAttr + ')', bonus: _aaTeto.cd });
    }
    // Graus genéricos mandados para a CD do TR (1 grau = +1 na CD).
    if (_genericos.cd) {
        cdBonusTotal += _genericos.cd;
        cdBonusSources.push({ nome: 'Graus de Potência (CD)', bonus: _genericos.cd });
    }
    // 5 Graus do 1º Hatsu — CD
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.cd) {
        cdBonusTotal += h.primeiroHatsuGraus.cd;
        cdBonusSources.push({ nome: '⭐ 1º Hatsu', bonus: h.primeiroHatsuGraus.cd });
    }

    // Nunca deixa o bônus de CD ultrapassar o teto do nível — excedente reservado, aplicado
    // automaticamente quando o teto do nível aumentar.
    let cdGrauReservado = 0;
    if (window.calcMaxGrauPorCaracteristica) {
        const _grauMaxCD = window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'cd');
        if (_grauMaxCD !== Infinity && cdBonusTotal > _grauMaxCD) {
            cdGrauReservado = cdBonusTotal - _grauMaxCD;
            cdBonusTotal = _grauMaxCD;
        }
    }

    // Determina se exibir o bloco de CD:
    // - categoria que usa CD, OU
    // - tem pelo menos 1 restrição/efeito com bônus de CD
    const hasCDBlock = hasCDCategory || cdBonusSources.length > 0;

    let calcCDHtml = '';
    if (hasCDBlock) {
        const lvl = parseInt(h.nivel || char.level || 1);
        const halfLevel = Math.max(1, Math.floor(lvl / 2));
        const attrVal = char.attributes && char.attributes[baseAttr] ? char.attributes[baseAttr].value : 10;
        const attrMod = Math.floor((attrVal - 10) / 2);
        const cdBase = 8 + halfLevel + attrMod;
        const cdFinal = cdBase + cdBonusTotal;
        if (window._hatsuRollState) window._hatsuRollState.cd = cdFinal;

        if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
        if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
        window._HATSU_STAT_INFO[idx].cd = [
            { l: 'Base', v: '8', c: '#9ca3af' },
            { l: '½ Nível ('+halfLevel+')', v: '+'+halfLevel, c: '#d1d5db' },
            { l: 'Mod '+baseAttr+' ('+(attrMod>=0?'+':'')+attrMod+')', v: (attrMod>=0?'+':'')+attrMod, c: '#60a5fa' },
            ...cdBonusSources.map(s => ({ l: '+'+s.bonus+' bônus', v: s.nome, c: tc })),
            ...(cdGrauReservado > 0 ? [{ l: '⏳ Reservado (teto do nível)', v: '+'+cdGrauReservado+' aguardando', c: '#fbbf24' }] : []),
            { l: '→ Total', v: 'CD '+cdFinal, c: tc, b: true }
        ];

        const cdSourcesHtml = cdBonusSources.length > 0
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${cdBonusSources.map(s =>
                `<span style="font-size:7px;font-weight:900;background:${tc}18;color:${tc};padding:2px 6px;border-radius:4px">+${s.bonus} CD · ${s.nome}</span>`
              ).join('')}</div>` : '';

        const formulaStr = `8 + ${halfLevel} (nível) + ${attrMod >= 0 ? '+' : ''}${attrMod} (${baseAttr})${cdBonusTotal > 0 ? ` + ${cdBonusTotal} (restrições)` : ''}`;
        const manipContextNote = (h.classe||char.class) === 'MANIPULAÇÃO'
            ? `<div style="font-size:8px;color:#6b7280;margin-top:4px">
                ${(h.efeitos||[]).includes('ma_e1') && !(h.efeitos||[]).includes('ma_e2')
                    ? '🔧 Modo Objetos (C.S.O) → usa <b style="color:#60a5fa">INT</b>'
                    : '👤 Modo Pessoas/Criaturas (C.S.C) → usa <b style="color:#f43f5e">PRE</b>'}
               </div>` : '';

        calcCDHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px">🎯 CD do Teste de Resistência</div>
                <div style="display:flex;gap:4px">
                ${cdBonusTotal > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:${tc}22;color:${tc}">+${cdBonusTotal} bônus</span>` : ''}
                ${cdGrauReservado > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${cdGrauReservado} em espera ⏳</span>` : ''}
                </div>
            </div>
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:32px;color:${tc};text-shadow:0 0 14px ${tc}66;line-height:1">CD ${cdFinal}</div>
                <div style="font-size:11px;font-weight:700;color:#6b7280">TR de ${baseAttr}</div>
                <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'cd',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0;transition:border-color .15s,color .15s" title="Como chegamos aqui">ⓘ</button>
            </div>
            <div style="font-size:8px;color:#4b5563;font-style:italic;margin-bottom:4px">${formulaStr}</div>
            ${manipContextNote}
            ${cdSourcesHtml}
        </div>`;
    }
    // ── Fim cálculo de CD ─────────────────────────────────────────────────────

    // ── Resumo de rolagem para a Mesa Virtual (mesa/mesa.html) ────────────────
    // A mesa não carrega este arquivo (depende de state e do render inteiro), então
    // guarda na própria ficha o resultado já calculado aqui: dado, atributos, acerto,
    // CD e custo de Aura. Só grava quando muda, para não salvar a ficha a cada render.
    // Não roda quando o mestre está só olhando a ficha de outro jogador.
    if (window._hatsuRollState && !state._viewingMode) {
        const _rs = window._hatsuRollState;
        const _custo = window.calcHatsuAuraCostFinal ? window.calcHatsuAuraCostFinal(h, idx) : null;
        const _mesa = {
            dice: _rs.dice || null,
            curaDice: _rs.curaDice || null,
            attr: _rs.attr || null,
            atkAttr: _rs.atkAttr || _rs.attr || null,
            hasBaseDmg: !!_rs.hasBaseDmg,
            hasAttack: !!_rs.hasAttack,
            cd: _rs.cd || null,
            acertoBonus: _rs.acertoBonus || 0,
            acertoVantagem: !!_rs.acertoVantagem,
            nivel: _rs.nivel || null,
            sanExtras: _rs.sanExtras || [],
            dmgExtras: _rs.dmgExtras || [],
            maximizado: !!(window.hatsuDanoMaximizado && window.hatsuDanoMaximizado(h)),
            critico: !!(window.hatsuDanoCritico && window.hatsuDanoCritico(h)),
            aura: _custo ? (_custo.pct || 0) : 0,
        };
        if (JSON.stringify(h.mesaRolagem || null) !== JSON.stringify(_mesa)) {
            h.mesaRolagem = _mesa;
            saveCharacter(char);
        }
    }

    // ── Toggle: este Hatsu tem jogada de Ataque? ───────────────────────────────
    // Padrão é por categoria (CD → não, resto → sim), mas o jogador pode sobrescrever
    // porque um Hatsu de categoria CD também pode ter Ataque, e vice-versa.
    let ataqueToggleHtml = '';
    if (hasBaseDmg) {
        const _atkOpts = [
            { v: '', label: 'Automático', sub: hasCDCategory ? '(sem ataque)' : '(com ataque)' },
            { v: 'sim', label: 'Tem Ataque' },
            { v: 'nao', label: 'Sem Ataque' }
        ];

        // Preview do total da Jogada de Ataque + seletor do atributo usado nela (independente
        // do atributo de Dano escolhido em modPickerHtml — ex: DES para acertar, FOR pro dano).
        let atkPreviewHtml = '';
        if (hasAttack) {
            const nivelAtk = parseInt(h.nivel || char.level || 1);
            const pbAtk = getProficiencyBonus(nivelAtk);
            const attrValAtk = char.attributes && char.attributes[baseAttrAtk] ? char.attributes[baseAttrAtk].value : 10;
            const attrModAtk = getMod(attrValAtk);
            const ataqueTotal = pbAtk + attrModAtk + acertoBonus;
            const ataqueFormula = `1d20 ${ataqueTotal >= 0 ? '+' : ''}${ataqueTotal} (PB +${pbAtk}, ${baseAttrAtk} ${attrModAtk >= 0 ? '+' : ''}${attrModAtk}${acertoBonus !== 0 ? `, restrições ${acertoBonus >= 0 ? '+' : ''}${acertoBonus}` : ''})`;

            if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
            if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
            window._HATSU_STAT_INFO[idx].ataque = [
                { l: 'Bônus de Proficiência', v: '+'+pbAtk, c: '#9ca3af' },
                { l: 'Mod '+baseAttrAtk+' ('+(attrModAtk>=0?'+':'')+attrModAtk+')', v: (attrModAtk>=0?'+':'')+attrModAtk, c: '#60a5fa' },
                ...(acertoBonus !== 0 ? [{ l: (acertoBonus>=0?'+':'')+acertoBonus+' bônus', v: acertoBonusSources.map(s=>s.nome).join(', ') || 'restrições', c: tc }] : []),
                ...(acertoGrauReservado > 0 ? [{ l: '⏳ Reservado (teto do nível)', v: '+'+acertoGrauReservado+' aguardando', c: '#fbbf24' }] : []),
                { l: '→ Total', v: (ataqueTotal>=0?'+':'')+ataqueTotal, c: tc, b: true }
            ];

            const atkAttrPickerHtml = `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
                ${ALL_ATTRS.map(a => {
                    const active = baseAttrAtk === a;
                    const isSugest = modSugest.includes(a);
                    // Atributo EFETIVO: inclui GYO e Aumento de Atributo dos Hatsus ativos.
        const mod = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, a).mod : getMod(char.attributes?.[a]?.value || 10);
                    return `<button onclick="event.stopPropagation();state.currentChar.hatsus[${idx}].atkMod='${a}';saveCharacter(state.currentChar);renderHatsuInPlace()"
                        style="flex:1;min-width:52px;padding:6px 4px;border-radius:9px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid ${active?tc:isSugest?tc+'66':'#1f2937'};background:${active?tc+'22':'transparent'};color:${active?tc:isSugest?tc:'#6b7280'};transition:all .15s">
                        ${isSugest?'★ ':''}${a} <span style="font-size:8px;opacity:.8">(${mod>=0?'+'+mod:mod})</span>
                    </button>`;
                }).join('')}
            </div>`;

            atkPreviewHtml = `<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #1f2937">
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:${tc};text-shadow:0 0 10px ${tc}55;line-height:1">${ataqueTotal>=0?'+':''}${ataqueTotal}</div>
                    <div style="font-size:10px;font-weight:700;color:#6b7280">na Jogada de Ataque</div>
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'ataque',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Como chegamos aqui">ⓘ</button>
                </div>
                <div style="font-size:8px;color:#4b5563;font-style:italic;margin-top:2px">${ataqueFormula}</div>
                <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-top:8px">🎯 Atributo do Ataque</div>
                ${atkAttrPickerHtml}
            </div>`;
        }

        ataqueToggleHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">⚔️ Jogada de Ataque</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
                ${_atkOpts.map(o => {
                    const active = ataqueOverride === o.v;
                    return `<button onclick="event.stopPropagation();state.currentChar.hatsus[${idx}].ataqueOverride='${o.v}';saveCharacter(state.currentChar);renderHatsuInPlace()"
                        style="flex:1;min-width:80px;padding:7px 4px;border-radius:9px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid ${active?tc:'#1f2937'};background:${active?tc+'22':'transparent'};color:${active?tc:'#6b7280'};transition:all .15s">
                        ${o.label}${o.sub?` <span style="font-size:7px;opacity:.7">${o.sub}</span>`:''}
                    </button>`;
                }).join('')}
            </div>
            <div style="font-size:8px;color:#4b5563;font-style:italic;margin-top:4px">${hasAttack ? '' : 'Sem jogada de ataque — usa a CD do TR.'}</div>
            ${atkPreviewHtml}
        </div>`;
    }
    // ── Fim toggle de Ataque ───────────────────────────────────────────────────

    // ── Ficha do Constructo (efeitos de Materialização/Emissão que criam constructos) ──
    // Ver HB-ManualdeHatsusHxH5eRPG2.0.txt, "Criando a ficha da Materialização".
    const CDB = window.CONSTRUCTO_DB || {};
    const constructEffectIds = (h.efeitos || []).filter(id => (window.CONSTRUCT_EFFECT_IDS || []).includes(id));
    const hasConstructo = constructEffectIds.length > 0;
    let constructoCardHtml = '';
    if (hasConstructo) {
        // Uma ficha por cópia de Golem de Aura. Cada rm_e2 comprado vale um constructo
        // próprio; os demais efeitos de constructo (rm_e3 etc.) reforçam a primeira ficha,
        // que é a "principal". Sem isso, os PV de todas as cópias somavam num card só.
        const _copiasRm2 = constructEffectIds.filter(id => id === 'rm_e2').length;
        const _copiasBase = Math.max(1, _copiasRm2);
        // rm_e19 Fusão/Divisão: fundir junta duas fichas numa, dividir parte uma em
        // duas. Por isso o número de fichas deixa de ser só a contagem de Golens.
        const _fd = window.statusFusaoDivisao ? window.statusFusaoDivisao(h, _copiasBase) : null;
        const _fdModo = _fd ? _fd.modo : null;
        const _totalCopias = _fdModo === 'fundir' ? Math.max(1, _copiasBase - 1)
                           : _fdModo === 'dividir' ? _copiasBase + 1
                           : _copiasBase;
        const _outrosEfeitos = constructEffectIds.filter(id => id !== 'rm_e2');
        function _efeitosDaCopia(c) {
            const rm2 = _copiasRm2 > 0 ? ['rm_e2'] : [];
            // Fundidas, as duas viram uma: a ficha que sobra carrega o Golem de Aura
            // das DUAS. É isso que soma os PV e junta as Características — o livro diz
            // "unindo suas habilidades", e cada Golem concede um slot de Característica.
            const dobra = _fdModo === 'fundir' ? rm2 : [];
            return c === 0 ? [].concat(rm2, dobra, _outrosEfeitos) : rm2;
        }
        for (let _c = 0; _c < _totalCopias; _c++) {
        const cst = _hCst(h, _c);
        
        const escAttr = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const intMod = getMod((char.attributes.INT || {}).value || 10);
        const intPontosTotal = Math.max(0, intMod);

        const constructEffectIds = _efeitosDaCopia(_c);
        const atributosDist = Object.assign({ FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, PRE: 0 }, cst.atributos || {});
        const intUsados = Object.values(atributosDist).reduce((a, b) => a + (parseInt(b) || 0), 0);
        // Trava pós-conclusão (mesmo padrão dos "5 Graus do 1º Hatsu") — destrava sozinha quando o
        // personagem sobe de nível após concluir (ganhou mais P.N. pra editar o Hatsu), ou pra admin.
        const _cstNivelConclusao = cst.atributosConcluidosNivel;
        const _cstGanhouNivel = _cstNivelConclusao != null && (parseInt(char.level) || 0) > _cstNivelConclusao;
        const atributosLocked = !!cst.atributosConcluidos && !_cstGanhouNivel && !state.isAdmin;
        const attrAtaqueEfetivo = (cst.atributoAtaque && atributosDist.hasOwnProperty(cst.atributoAtaque))
            ? cst.atributoAtaque
            : (atributosDist.FOR >= atributosDist.DES ? 'FOR' : 'DES');

        // Características já escolhidas por outros efeitos (rm_e2_carac × cópia, rm_e3) + as extras
        // escolhidas aqui. Cada cópia de Golem de Aura (rm_e2) tem sua própria Característica de
        // Invocação — cópia 0 na chave sem sufixo, cópias extras em 'rm_e2_carac#1', '#2', etc.
        const _rm2CopiesForCarac = constructEffectIds.filter(id => id === 'rm_e2').length;
        // Cada cópia usa APENAS a sua própria Característica de Invocação.
        const _rm2CaracsAll = _rm2CopiesForCarac > 0
            ? [(h.specialChoices || {})[_c > 0 ? `rm_e2_carac#${_c}` : 'rm_e2_carac']].filter(Boolean)
            : [];
        const caracJaEscolhidas = [..._rm2CaracsAll, (h.specialChoices || {})['rm_e3']].filter(Boolean);
        const caracExtras = cst.caracteristicas || [];
        const todasCaracteristicas = [...caracJaEscolhidas, ...caracExtras];
        const slotsCaracteristicas = constructEffectIds.reduce((sum, id) => sum + (CDB.EFEITO_CARACTERISTICAS[id] || 0), 0);
        const slotsLivres = Math.max(0, slotsCaracteristicas - caracJaEscolhidas.length);

        // Tamanho efetivo (Característica Grande/Pequeno desloca a ordem a partir do tamanho base).
        // Golem de Aura (rm_e2) já é fixado como "Pequeno" no picker de material do criador de Hatsu;
        // os demais constructos partem de Médio, como o restante do manual.
        const grandes = todasCaracteristicas.filter(n => n === 'Grande').length;
        const pequenos = todasCaracteristicas.filter(n => n === 'Pequeno').length;
        const tamanhoOrdem = CDB.TAMANHO_ORDEM || ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
        const tamanhoBase = constructEffectIds.includes('rm_e2') ? 'Pequeno' : 'Médio';
        const baseIdx = tamanhoOrdem.indexOf(tamanhoBase);
        const tamanhoIdx = Math.max(0, Math.min(tamanhoOrdem.length - 1, baseIdx + grandes - pequenos));
        const tamanho = tamanhoOrdem[tamanhoIdx];

        const durabilidadeEfetiva = cst.durabilidade === 'resistente' ? 'resistente' : 'fragil';

        const valorEscala = (nome) => {
            const escala = (CDB.CARACTERISTICA_SCALE || {})[nome];
            if (!escala) return 0;
            const vezes = todasCaracteristicas.filter(n => n === nome).length;
            if (vezes <= 0) return 0;
            return escala[Math.min(vezes, escala.length) - 1];
        };
        const robustezBonus = valorEscala('Robustez');

        // ── PV ──
        const pvBase = (CDB.PV_POR_TAMANHO[tamanho] || {})[durabilidadeEfetiva] || 0;
        let pvEfeitos = 0;
        const pvFontes = [];
        // ── Aura Viva: a conta é por ESCOLHA, não por cópia ────────────────────
        // Antes cada cópia somava os mesmos +6 de PV. Agora a 1ª compra dá a base e as
        // seguintes aplicam o que o jogador escolheu: mais massas (não mexe no PV) ou
        // um degrau no dado de dano e PV. Ver statusAuraViva em hatsu-db.js.
        const _av = window.statusAuraViva ? window.statusAuraViva(h) : null;
        // Declarada AQUI, antes do PV e da CA: ela é lida nos dois blocos, e enquanto
        // morava no bloco da CA a leitura do PV caía na zona morta do `const`.
        const _un = window.statusUnificacao ? window.statusUnificacao(h) : null;
        if (_av) {
            pvEfeitos += _av.pv;
            pvFontes.push({ nome: 'Aura Viva (' + _av.dado + ' cheio · ' + _av.massas + ' massas)', bonus: _av.pv });
        }
        constructEffectIds.forEach(id => {
            if (id === 'em_e1') return;   // já contado acima, com a escolha
            let b = CDB.EFEITO_PV[id];
            if (!b) return;
            // Golem de Aura (rm_e2): a própria descrição do efeito documenta "PV = 5 + CON×2" — o
            // +5 fixo já vinha de CDB.EFEITO_PV, faltava somar o CON distribuído no constructo.
            let nomeFonte = (efeitosSel.find(e => e.id === id) || {}).nome || id;
            if (id === 'rm_e2') {
                const conBonusPv = atributosDist.CON * 2;
                if (conBonusPv !== 0) { b += conBonusPv; nomeFonte += ` (+CON×2)`; }
            }
            pvEfeitos += b;
            pvFontes.push({ nome: nomeFonte, bonus: b });
        });
        let pvRestricoes = 0;
        (h.restricoes || []).forEach(id => {
            const b = (CDB.RESTRICAO_PV || {})[id];
            if (b) { pvRestricoes += b; const rObj = restricoesSel.find(r => r.id === id); pvFontes.push({ nome: rObj ? rObj.nome : id, bonus: b }); }
        });
        // rg_l14 Objeto Canalizador: "+2 CA ou +5 PV" — benefício de escolha que não
        // estava ligado. Só conta a metade que o jogador escolheu.
        if ((h.restricoes || []).includes('rg_l14')) {
            const escL14 = String((h.beneficioChoices || {})['rg_l14'] || '').toLowerCase();
            if (escL14.includes('pv')) { pvRestricoes += 5; pvFontes.push({ nome: 'Objeto Canalizador (PV)', bonus: 5 }); }
        }
        // A Unificação dobra o PV por cópia que escolheu PV — depois de tudo somado,
        // porque o livro diz "Dobre o PV", não "+X de PV".
        const _pvSomado = pvBase + pvEfeitos + pvRestricoes + robustezBonus;
        let pvTotal = _un ? _pvSomado * _un.multPV : _pvSomado;
        if (_un && _un.multPV > 1) pvFontes.push({ nome: 'Unificação de Constructos (×' + _un.multPV + ')', bonus: pvTotal - _pvSomado });
        // ── rm_e19: o PV da fusão e o da divisão ───────────────────────────────
        // Fundindo, o PV das duas fichas já veio somado (a cópia 0 carrega os dois
        // Golens) e aqui entra o +10 por compra. Dividindo, "sempre será dividido por
        // 2": cada metade fica com metade do total — é esse corte que faz o papel do
        // "-10 PV" do texto, e por isso ele não é descontado de novo.
        if (_fdModo === 'fundir' && _fd.pv) {
            pvTotal += _fd.pv;
            pvFontes.push({ nome: 'Fusão de Constructos (' + _fd.compras + '×)', bonus: _fd.pv });
        } else if (_fdModo === 'dividir') {
            const _antesPv = pvTotal;
            pvTotal = Math.max(1, Math.floor(pvTotal / 2));
            pvFontes.push({ nome: 'Divisão de Constructos (÷2)', bonus: pvTotal - _antesPv });
        }

        // ── CA ──
        // NOTA: "Ficha do Constructo" (nome/imagem/atributos/PV/CA/ataque) ainda é 1 bloco só por
        // Hatsu, mesmo com 2+ cópias de Golem de Aura — por isso usamos aqui sempre o material da
        // cópia 0. Ter 2 Golems com PV/CA/atributos DE VERDADE independentes exigiria transformar
        // cst num array (1 ficha por cópia) — fora do escopo desta correção, que resolveu
        // só o material/característica de cada cópia ficarem sobrescrevendo um ao outro.
        const materialEscolhido = (h.specialChoices || {})[_c > 0 ? `rm_e2#${_c}` : 'rm_e2'] || '';
        const usaMaterial = cst.tipoCA === 'material' || (cst.tipoCA !== 'organico' && !!materialEscolhido);
        const caBaseMaterial = usaMaterial ? (CDB.CA_POR_MATERIAL || {})[materialEscolhido] : undefined;
        const caBaseNum = (caBaseMaterial !== undefined) ? caBaseMaterial : (13 + intMod);
        let caEfeitos = 0;
        const caFontes = [];
        // Aura Viva: CA 10 fixa, contada UMA vez por mais cópias que existam — as
        // cópias extras viram massa ou grau no dado, nunca CA.
        if (_av) { caEfeitos += _av.ca; caFontes.push({ nome: 'Aura Viva', bonus: _av.ca }); }
        constructEffectIds.forEach(id => {
            if (id === 'em_e1' && _av) return;   // já contada acima
            const b = CDB.EFEITO_CA[id];
            if (b) { caEfeitos += b; const efObj = efeitosSel.find(e => e.id === id); caFontes.push({ nome: efObj ? efObj.nome : id, bonus: b }); }
        });
        // ── Unificação de Constructos: +1 na CA por cópia que escolheu CA ──────
        if (_un && _un.caExtra > 0) {
            caEfeitos += _un.caExtra;
            caFontes.push({ nome: 'Unificação de Constructos', bonus: _un.caExtra });
        }
        let caRestricoes = 0;
        (h.restricoes || []).forEach(id => {
            const b = (CDB.RESTRICAO_CA || {})[id];
            if (b) { caRestricoes += b; const rObj = restricoesSel.find(r => r.id === id); caFontes.push({ nome: rObj ? rObj.nome : id, bonus: b }); }
        });
        if ((h.restricoes || []).includes('rg_l14')) {
            const escL14ca = String((h.beneficioChoices || {})['rg_l14'] || '').toLowerCase();
            if (escL14ca.includes('ca')) { caRestricoes += 2; caFontes.push({ nome: 'Objeto Canalizador (CA)', bonus: 2 }); }
        }
        // rev. — regra homebrew do projeto: além do RAW (13 + INT do usuário), o CON distribuído no
        // constructo também soma na CA. Não conta quando a CA é null.
        //
        // O ramo de CA null é LEGADO e fica de propósito: 'Gasoso' saiu do seletor do jogador
        // (Materialização é de sólidos — ver hatsu-creator.js), mas um Hatsu salvo antes dessa
        // mudança pode ter 'Gasoso' em specialChoices. Sem este ramo, a ficha dele quebraria
        // ao abrir. Não remova enquanto houver fichas antigas no Supabase.
        const caConBonus = atributosDist.CON;
        let caTotal = (caBaseNum === null) ? null : (caBaseNum + caEfeitos + caRestricoes + caConBonus);
        // ── rm_e19: os -5 de CA da divisão, repartidos ─────────────────────────
        // Não são -5 em CADA metade: são -5 no conjunto, divididos entre as duas (-3 e
        // -2). O ponto que sobra fica com a metade que o jogador escolher — é o que o
        // botão "ponto de CA" pergunta. Fundir não mexe na CA: o texto do efeito só
        // cita CA na divisão.
        if (caTotal !== null && _fdModo === 'dividir') {
            const _pen = _fd.caPenalidade[_c === _fd.folga ? 1 : 0];
            caTotal -= _pen;
            caFontes.push({ nome: 'Divisão de Constructos', bonus: -_pen });
        }

        if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
        if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
        window._HATSU_STAT_INFO[idx]['constructoPv' + (_c > 0 ? _c : '')] = [
            { l: `Base (${tamanho}, ${durabilidadeEfetiva === 'resistente' ? 'Resistente' : 'Frágil'})`, v: pvBase, c: '#9ca3af' },
            ...pvFontes.map(f => ({ l: `+${f.bonus} PV`, v: f.nome, c: '#4ade80' })),
            ...(robustezBonus ? [{ l: `+${robustezBonus} PV`, v: 'Robustez', c: '#f87171' }] : []),
            { l: '→ Total', v: pvTotal, c: '#4ade80', b: true },
        ];
        window._HATSU_STAT_INFO[idx]['constructoCa' + (_c > 0 ? _c : '')] = [
            { l: usaMaterial ? `Base (material: ${materialEscolhido || '—'})` : `Base (13 + INT ${intMod >= 0 ? '+' : ''}${intMod})`, v: caBaseNum === null ? '—' : caBaseNum, c: '#9ca3af' },
            ...caFontes.map(f => ({ l: `+${f.bonus} CA`, v: f.nome, c: '#60a5fa' })),
            ...(caBaseNum !== null && caConBonus !== 0 ? [{ l: `${caConBonus >= 0 ? '+' : ''}${caConBonus} CA`, v: 'CON do Constructo', c: '#a78bfa' }] : []),
            { l: '→ Total', v: caTotal === null ? '—' : caTotal, c: '#60a5fa', b: true },
        ];

        const _periciaTipos = CDB.PERICIA_TIPOS || [];
        const _periciaSlots = CDB.PERICIA_SLOTS || 5;

        constructoCardHtml += `<div style="background:#0d1117;border:1px solid ${tc}33;border-radius:12px;padding:14px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                <span style="font-size:14px">🐣</span>
                <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">Ficha do Constructo${_totalCopias > 1 ? ` #${_c + 1}` : ''}</span>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:12px;align-items:flex-start">
                <div onclick="event.stopPropagation();document.getElementById('constructo-img-${idx}-${_c}').click()" title="Clique para enviar uma imagem" style="width:56px;height:56px;border-radius:10px;border:1px ${cst.imagemUrl ? 'solid ' + tc + '44' : 'dashed #374151'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;cursor:pointer;position:relative;overflow:hidden;background-color:#0a0f1a;${cst.imagemUrl ? `background-image:url('${escAttr(cst.imagemUrl)}');background-size:cover;background-position:${(cst.imagePosition||{x:50,y:50}).x}% ${(cst.imagePosition||{x:50,y:50}).y}%;` : ''}">
                    <input type="file" id="constructo-img-${idx}-${_c}" accept="image/*" style="display:none" onchange="event.stopPropagation();window._hUploadConstructoImage(${idx},${_c},this)">
                    ${!cst.imagemUrl ? '🐣' : ''}
                    ${cst.imagemUrl ? `<button onclick="event.stopPropagation();window._hOpenConstructoImagePositionModal(${idx},${_c})" title="Ajustar posição da imagem" style="position:absolute;bottom:2px;right:2px;background:#000000aa;border:1px solid #ffffff33;border-radius:5px;width:16px;height:16px;color:#fff;font-size:8px;cursor:pointer;padding:0;line-height:16px">✥</button>` : ''}
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0">
                    <input type="text" value="${escAttr(cst.nome)}" placeholder="Nome do constructo..." onchange="window._hSetConstructoField(${idx},${_c},'nome',this.value)" style="width:100%;box-sizing:border-box;background:#111827;border:1px solid #374151;border-radius:8px;padding:6px 8px;color:#fff;font-size:11px;font-weight:700">
                    <div style="display:flex;gap:4px;align-items:center">
                        <button onclick="event.stopPropagation();document.getElementById('constructo-img-${idx}-${_c}').click()" style="flex-shrink:0;background:${tc}18;border:1px solid ${tc}44;color:${tc};border-radius:6px;padding:5px 8px;font-size:8px;font-weight:900;cursor:pointer;white-space:nowrap">📤 Enviar</button>
                        <input type="text" value="${escAttr(cst.imagemUrl)}" placeholder="ou cole uma URL de imagem..." onchange="window._hSetConstructoField(${idx},${_c},'imagemUrl',this.value)" style="flex:1;min-width:0;box-sizing:border-box;background:#111827;border:1px solid #374151;border-radius:8px;padding:6px 8px;color:#9ca3af;font-size:9px">
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:2px">PV <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'constructoPv${_c > 0 ? _c : ''}',this)" style="background:transparent;border:1px solid #374151;border-radius:50%;width:14px;height:14px;font-size:8px;color:#6b7280;cursor:pointer;padding:0;line-height:14px">ⓘ</button></div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:#4ade80">${pvTotal}</div>
                </div>
                <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:2px">CA <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'constructoCa${_c > 0 ? _c : ''}',this)" style="background:transparent;border:1px solid #374151;border-radius:50%;width:14px;height:14px;font-size:8px;color:#6b7280;cursor:pointer;padding:0;line-height:14px">ⓘ</button></div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:#60a5fa">${caTotal === null ? '—' : caTotal}</div>
                </div>
            </div>

            ${_fd && _c === 0 ? (() => {
                const bt = (on, lbl, oc, cor) => `<button onclick="event.stopPropagation();${oc}" style="padding:6px 4px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid ${on ? (cor || tc) : '#1f2937'};background:${on ? (cor || tc) + '22' : 'transparent'};color:${on ? (cor || tc) : '#6b7280'}">${lbl}</button>`;
                const pen = _fd.caPenalidade;
                return `<div style="background:#0a0f1a;border:1px solid ${tc}33;border-radius:10px;padding:10px;margin-bottom:12px">
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:6px">⚗️ Fusão / Divisão${_fd.compras > 1 ? ` · ${_fd.compras} compras` : ''}</div>
                    <div style="display:grid;grid-template-columns:repeat(${1 + (_fd.podeFundir ? 1 : 0) + (_fd.podeDividir ? 1 : 0)},1fr);gap:4px">
                        ${bt(!_fd.modo, 'Nenhum', `window._hSetFusaoDiv(${idx},'modo',null)`, '#6b7280')}
                        ${_fd.podeFundir ? bt(_fd.modo === 'fundir', '🔗 Fundir', `window._hSetFusaoDiv(${idx},'modo','fundir')`, '#4ade80') : ''}
                        ${_fd.podeDividir ? bt(_fd.modo === 'dividir', '✂️ Dividir', `window._hSetFusaoDiv(${idx},'modo','dividir')`, '#f87171') : ''}
                    </div>
                    ${_fd.modo ? `
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin:8px 0 4px">${_fd.graus >= 0 ? '+' : ''}${_fd.graus} grau/passo em</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                        ${bt(_fd.alvo === 'dano', 'Dano', `window._hSetFusaoDiv(${idx},'alvo','dano')`)}
                        ${bt(_fd.alvo === 'acerto', 'Acerto (d20)', `window._hSetFusaoDiv(${idx},'alvo','acerto')`)}
                    </div>` : ''}
                    ${_fd.modo === 'dividir' ? `
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin:8px 0 4px">Os −${window.DIVISAO_CA_PENALIDADE || 5} de CA se repartem (−${pen[0]} e −${pen[1]}). Fica com o −${pen[1]}:</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                        ${bt(_fd.folga === 0, 'Ficha #1', `window._hSetFusaoDiv(${idx},'folga',0)`)}
                        ${bt(_fd.folga === 1, 'Ficha #2', `window._hSetFusaoDiv(${idx},'folga',1)`)}
                    </div>` : ''}
                    <div style="font-size:8px;color:#4b5563;font-style:italic;margin-top:6px">${_fd.modo === 'fundir'
                        ? 'Duas fichas viram uma: os PV somam, as Características das duas valem e entram +' + _fd.pv + ' PV.'
                        : _fd.modo === 'dividir'
                        ? 'Uma ficha vira duas, cada uma com metade do PV. Sai junto com o Hatsu.'
                        : (_fd.podeFundir ? 'Escolha o que fazer com as fichas. A escolha some quando o Hatsu é desativado.'
                                          : 'Com uma ficha só, dá para dividir. Fundir exige dois constructos (duas compras de Golem de Aura).')}</div>
                </div>`;
            })() : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                <div>
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:4px">Durabilidade</div>
                    <div style="display:flex;gap:3px">
                        ${['', 'fragil', 'resistente'].map(v => {
                            const active = (cst.durabilidade || '') === v;
                            const label = v === '' ? 'Auto' : v === 'fragil' ? 'Frágil' : 'Resistente';
                            return `<button onclick="window._hSetConstructoField(${idx},${_c},'durabilidade','${v}')" style="flex:1;padding:5px 2px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid ${active ? tc : '#1f2937'};background:${active ? tc + '22' : 'transparent'};color:${active ? tc : '#6b7280'}">${label}</button>`;
                        }).join('')}
                    </div>
                </div>
                <div>
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:4px">CA base</div>
                    <div style="display:flex;gap:3px">
                        ${['', 'organico', 'material'].map(v => {
                            const active = (cst.tipoCA || '') === v;
                            const label = v === '' ? 'Auto' : v === 'organico' ? 'Orgânico' : 'Material';
                            return `<button onclick="window._hSetConstructoField(${idx},${_c},'tipoCA','${v}')" style="flex:1;padding:5px 2px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid ${active ? tc : '#1f2937'};background:${active ? tc + '22' : 'transparent'};color:${active ? tc : '#6b7280'}">${label}</button>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div style="margin-bottom:12px">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                    <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700">Atributos (${intUsados}/${intPontosTotal} do mod. INT distribuído)</div>
                    ${atributosLocked
                        ? `<span style="font-size:7px;padding:2px 8px;border-radius:6px;background:#1f2937;border:1px solid #374151;color:#4b5563;font-weight:900;text-transform:uppercase">🔒 Bloqueado</span>`
                        : (cst.atributosConcluidos ? `<span style="font-size:7px;padding:2px 8px;border-radius:6px;background:#f9731622;border:1px solid #f9731655;color:#fb923c;font-weight:900;text-transform:uppercase">⬆️ Redistribuir</span>` : '')}
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:6px">
                    ${['FOR', 'DES', 'CON', 'INT', 'SAB', 'PRE'].map(attr => `
                        <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:8px;padding:6px;text-align:center">
                            <div style="font-size:7px;color:#6b7280;font-weight:700">${attr}</div>
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#fff;margin-top:2px">${atributosDist[attr] >= 0 ? '+' : ''}${atributosDist[attr]}</div>
                        </div>
                    `).join('')}
                </div>
                ${atributosLocked
                    ? (state.isAdmin ? `<button onclick="window._openConstructoAttrModal(${idx},${_c})" style="width:100%;padding:6px;border-radius:8px;background:#f9731622;border:1px solid #f9731655;color:#fb923c;font-size:9px;font-weight:900;cursor:pointer;text-transform:uppercase">⚙️ Editar (Admin)</button>` : '')
                    : `<button onclick="window._openConstructoAttrModal(${idx},${_c})" style="width:100%;padding:6px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};font-size:9px;font-weight:900;cursor:pointer;text-transform:uppercase">🪨 ${cst.atributosConcluidos ? 'Redistribuir' : 'Distribuir'} Atributos</button>`}
            </div>

            <div style="margin-bottom:12px">
                <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:4px">Características de Invocação (${todasCaracteristicas.length}/${slotsCaracteristicas})</div>
                ${caracJaEscolhidas.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${caracJaEscolhidas.map(n => `<span style="font-size:8px;font-weight:700;padding:3px 8px;border-radius:6px;background:${tc}18;color:${tc}">${n}</span>`).join('')}</div>` : ''}
                ${caracExtras.map((n, i) => `
                    <div style="display:flex;gap:4px;margin-bottom:4px;align-items:center">
                        <select onchange="window._hSetConstructoCaracteristica(${idx},${_c},${i},this.value)" style="flex:1;background:#111827;border:1px solid #374151;border-radius:6px;padding:4px 6px;color:#d1d5db;font-size:9px">
                            ${(window.CARACTERISTICAS_INVOCACAO || []).map(c => `<option value="${c.nome}" ${c.nome === n ? 'selected' : ''}>${c.icon} ${c.nome}</option>`).join('')}
                        </select>
                        <button onclick="window._hRemoveConstructoCaracteristica(${idx},${_c},${i})" style="background:#ef444422;border:1px solid #ef444455;color:#f87171;border-radius:6px;padding:4px 8px;font-size:9px;cursor:pointer">×</button>
                    </div>
                `).join('')}
                ${slotsLivres > caracExtras.length ? `<button onclick="window._hAddConstructoCaracteristica(${idx},${_c})" style="width:100%;padding:6px;border-radius:8px;background:transparent;border:1px dashed #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer">+ Adicionar Característica (${slotsLivres - caracExtras.length} livre${slotsLivres - caracExtras.length > 1 ? 's' : ''})</button>` : ''}
            </div>

            <div style="margin-bottom:12px">
                <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:4px">Perícias (${(cst.pericias || []).length}/${_periciaSlots} pontos)</div>
                ${(cst.pericias || []).map((p, i) => {
                    const tipoDef = _periciaTipos.find(t => t.id === p.tipo) || _periciaTipos[0] || { valores: [] };
                    return `<div style="display:flex;gap:4px;margin-bottom:4px">
                        <select onchange="window._hSetConstructoPericia(${idx},${_c},${i},'tipo',this.value)" style="background:#111827;border:1px solid #374151;border-radius:6px;padding:4px 6px;color:#d1d5db;font-size:9px">
                            ${_periciaTipos.map(t => `<option value="${t.id}" ${t.id === p.tipo ? 'selected' : ''}>${t.label}</option>`).join('')}
                        </select>
                        <select onchange="window._hSetConstructoPericia(${idx},${_c},${i},'valor',this.value)" style="flex:1;background:#111827;border:1px solid #374151;border-radius:6px;padding:4px 6px;color:#d1d5db;font-size:9px">
                            ${tipoDef.valores.map(v => `<option value="${v}" ${v === p.valor ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                        <button onclick="window._hRemoveConstructoPericia(${idx},${_c},${i})" style="background:#ef444422;border:1px solid #ef444455;color:#f87171;border-radius:6px;padding:4px 8px;font-size:9px;cursor:pointer">×</button>
                    </div>`;
                }).join('')}
                ${(cst.pericias || []).length < _periciaSlots ? `<button onclick="window._hAddConstructoPericia(${idx},${_c})" style="width:100%;padding:6px;border-radius:8px;background:transparent;border:1px dashed #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer">+ Adicionar Perícia</button>` : ''}
            </div>

            <details style="margin-bottom:12px">
                <summary style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;cursor:pointer">📖 Ações (referência)</summary>
                <div style="margin-top:6px">
                    <div style="font-size:8px;color:${tc};font-weight:700;margin-bottom:2px">Simples (o constructo faz sozinho)</div>
                    ${(CDB.ACOES_SIMPLES || []).map(a => `<div style="font-size:8px;color:#6b7280;margin-bottom:3px"><b style="color:#9ca3af">${a.nome}:</b> ${a.desc}</div>`).join('')}
                    <div style="font-size:8px;color:${tc};font-weight:700;margin:8px 0 2px">Complexas (consomem ação do Materializador)</div>
                    ${(CDB.ACOES_COMPLEXAS || []).map(a => `<div style="font-size:8px;color:#6b7280;margin-bottom:3px"><b style="color:#9ca3af">${a.nome}:</b> ${a.desc}</div>`).join('')}
                </div>
            </details>

            <textarea placeholder="Notas (ações customizadas, roleplay...)" onchange="window._hSetConstructoField(${idx},${_c},'notas',this.value)" style="width:100%;box-sizing:border-box;background:#111827;border:1px solid #374151;border-radius:8px;padding:6px 8px;color:#9ca3af;font-size:9px;min-height:44px;resize:vertical;margin-bottom:12px">${escAttr(cst.notas)}</textarea>

            <div style="margin-bottom:8px">
                <div style="font-size:7px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:4px">Atributo usado no Ataque</div>
                <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px">
                    ${['FOR', 'DES', 'CON', 'INT', 'SAB', 'PRE'].map(attr => {
                        const active = attrAtaqueEfetivo === attr;
                        return `<button onclick="window._hSetConstructoField(${idx},${_c},'atributoAtaque','${attr}')" style="padding:5px 2px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid ${active ? tc : '#1f2937'};background:${active ? tc + '22' : 'transparent'};color:${active ? tc : '#6b7280'}">${attr}</button>`;
                    }).join('')}
                </div>
            </div>

            ${(() => {
                // O dado e o acerto saem da MESMA função que a rolagem usa, para o botão
                // nunca prometer um número diferente do que vai sair.
                const _ai = window.ataqueDoConstructo ? window.ataqueDoConstructo(char, h, _c, true) : null;
                if (!_ai) return '';
                const _s = n => (n >= 0 ? '+' : '') + n;
                const _acerto = _ai.atributo + _ai.proficiencia + _ai.acertoExtra;
                return `<button onclick="event.stopPropagation();window.rollConstructoAtaque(${idx},${_c})" style="width:100%;padding:10px;border-radius:10px;background:${tc}22;border:1px solid ${tc}66;color:${tc};font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px">⚔️ Ataque do Constructo</button>
                <div style="font-size:8px;color:#6b7280;text-align:center;margin-top:4px">Acerto 1d20 ${_s(_acerto)} <span style="color:#4b5563">(${_ai.attr} ${_s(_ai.atributo)} · prof. ${_s(_ai.proficiencia)}${_ai.acertoExtra ? ' · Fusão/Divisão ' + _s(_ai.acertoExtra) : ''})</span> · Dano ${_ai.dado} ${_s(_ai.atributo)}${_ai.doHatsu ? ' <span style="color:#4b5563">(dano comprado do Hatsu)</span>' : ''}</div>
                ${_ai.grauSemDestino ? `<div style="font-size:8px;color:#fbbf24;text-align:center;margin-top:3px">⚠ O grau/passo não tem onde andar com dano ${_ai.dado}: escolha "Acerto" acima, ou compre dano próprio para o Hatsu.</div>` : ''}`;
            })()}
        </div>`;
        }
    }
    // ── Fim Ficha do Constructo ─────────────────────────────────────────────────

    // ── rm_e7 Cópia Perfeita: a ficha copiada ───────────────────────────────────
    // Não entra na Ficha do Constructo porque não é um constructo: é a ficha de
    // OUTRA criatura, com o formato do bestiário (24 campos de texto), enquanto o
    // constructo tem 7 campos estruturados. Forçar um no outro perderia quase tudo
    // — e o efeito manda copiar "tudo da ficha". Então o statblock é mostrado como
    // statblock, só de leitura, com os três campos excetuados marcados.
    let copiaPerfeitaHtml = '';
    if ((h.efeitos || []).includes('rm_e7') && window.excecoesCopiaPerfeita) {
        const _nCop7 = (h.efeitos || []).filter(function (id) { return id === 'rm_e7'; }).length;
        // O dano do Hatsu já foi calculado acima (window._hatsuRollState). Se o Hatsu
        // não tem dano próprio, cai no padrão do livro (1d8).
        const _danoH = (window._hatsuRollState && window._hatsuRollState.hasBaseDmg)
            ? window._hatsuRollState.dice : null;
        const _sc7 = h.specialChoices || {};
        const _esc7 = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
        const _linha = function (rot, val) {
            if (!val) return '';
            return '<div style="font-size:9px;color:#9ca3af;margin-bottom:2px"><b style="color:#d1d5db">' + rot + ':</b> ' + _esc7(val) + '</div>';
        };
        const _excBadge = function (rot, campo) {
            const cor = campo.copiado ? '#60a5fa' : (campo.padrao ? '#fbbf24' : '#4ade80');
            const nota = campo.copiado
                ? ' <span style="font-weight:600;color:#6b7280">(copiado)</span>'
                : (campo.padrao ? ' <span style="font-weight:600;color:#6b7280">(mínimo)</span>' : '');
            const txt = campo.valor === null
                ? 'da Ficha do Constructo'
                : (_esc7(campo.valor) + nota);
            return '<div style="flex:1;min-width:80px;background:#0a0f1a;border:1px solid ' + cor + '44;border-radius:8px;padding:6px 8px">'
                + '<div style="font-size:7px;font-weight:900;color:' + cor + ';text-transform:uppercase;letter-spacing:1px">' + rot + '</div>'
                + '<div style="font-size:10px;font-weight:900;color:#d1d5db;margin-top:1px">' + txt + '</div></div>';
        };

        for (let _i = 0; _i < _nCop7; _i++) {
            const _id7 = _sc7[window.chaveCopiaPerfeita(_i)] || '';
            let _corpo = '';
            let _titulo = 'Cópia Perfeita' + (_nCop7 > 1 ? ' ' + (_i + 1) : '');

            if (!_id7) {
                _corpo = '<div style="font-size:9px;color:#f87171">⚠ Nenhum alvo escolhido. Edite o Hatsu e escolha o que está sendo copiado.</div>';
            } else if (_id7 === 'objeto') {
                const _k7 = window.chaveCopiaPerfeita(_i);
                const _txt7 = _sc7[_k7 + '_txt'] || '';
                const _tam7 = _sc7[_k7 + '_tam'] || '';
                const _dur7 = _sc7[_k7 + '_dur'] || '';
                const _pv7 = (_tam7 && _dur7 && window.pvObjetoCopiado) ? window.pvObjetoCopiado(_tam7, _dur7) : null;
                // Para objeto o PV É copiado — por isso o 4º argumento.
                const _excO = window.excecoesCopiaPerfeita(h, char, _danoH, { objeto: true, pvObjeto: _pv7 });
                _titulo += ' — ' + (_txt7 ? _esc7(_txt7) : 'objeto ou arma simples');
                _corpo = (_txt7 ? '' : '<div style="font-size:9px;color:#f87171;margin-bottom:5px">⚠ Descreva o objeto copiado ao editar o Hatsu.</div>')
                    + '<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Copiado do original</div>'
                    + _linha('Tipo e natureza do dano', _sc7[_k7 + '_dano'])
                    + _linha('Alcance e área', _sc7[_k7 + '_alc'])
                    + _linha('Resistências', _sc7[_k7 + '_res'])
                    + _linha('Tamanho', _tam7 && (_tam7 + (_dur7 ? ' · ' + (_dur7 === 'resistente' ? 'Resistente' : 'Frágil') : '')))
                    + (!_tam7 && !_dur7 && !_sc7[_k7 + '_dano'] && !_sc7[_k7 + '_alc'] && !_sc7[_k7 + '_res']
                        ? '<div style="font-size:9px;color:#6b7280;font-style:italic">Nada descrito ainda. Edite o Hatsu para registrar o que foi copiado.</div>' : '')
                    + '<div style="margin-top:7px;padding-top:6px;border-top:1px dashed #1f2937">'
                    + '<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Valor do dano e CA — valem os do Hatsu</div>'
                    + '<div style="display:flex;gap:5px;flex-wrap:wrap">'
                    + _excBadge('Dano', _excO.dano) + _excBadge('CA', _excO.ca) + _excBadge('PV', _excO.pv)
                    + '</div>'
                    + '<div style="font-size:8px;color:#4b5563;margin-top:4px">Objeto copia o PV do original (tamanho × durabilidade). De dano copia-se só o tipo; o valor e a CA ficam no mínimo ou no comprado.</div>'
                    + '</div>';
            } else {
                const _m = window.criaturaPorId ? window.criaturaPorId(_id7) : null;
                if (!_m) {
                    _corpo = '<div style="font-size:9px;color:#f87171">⚠ A criatura "' + _esc7(_id7) + '" não está mais no bestiário. Escolha outra ao editar o Hatsu.</div>';
                } else {
                    // Criatura: os três no mínimo ou no comprado, sem exceção.
                    const _exc = window.excecoesCopiaPerfeita(h, char, _danoH);
                    _titulo += ' — ' + _esc7(_m.nome);
                    _corpo = '<div style="font-size:8px;color:#6b7280;font-style:italic;margin-bottom:6px">' + _esc7(_m.tipo) + '</div>'
                        + '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'
                        + ['for', 'des', 'con', 'int', 'sab', 'pre'].map(function (a) {
                            return '<div style="flex:1;min-width:44px;background:#0a0f1a;border:1px solid #1f2937;border-radius:7px;padding:4px;text-align:center">'
                                + '<div style="font-size:7px;font-weight:900;color:#4b5563">' + a.toUpperCase() + '</div>'
                                + '<div style="font-size:9px;font-weight:900;color:#d1d5db">' + _esc7(_m[a]) + '</div></div>';
                        }).join('')
                        + '</div>'
                        + _linha('Deslocamento', _m.desl)
                        + _linha('Reações', _m.reacoes)
                        + _linha('Perícias', _m.pericias)
                        + _linha('Testes de Resistência', _m.trs)
                        + _linha('Sentidos', _m.sentidos)
                        + _linha('Idiomas', _m.lingua)
                        + _linha('Imunidades', _m.imunidades)
                        + _linha('Resistências', _m.resistencias)
                        + _linha('Vulnerabilidades', _m.vulnerabilidades)
                        + _linha('Limiar Mínimo de Dano', _m.limiar)
                        + ((_m.tracos || []).length
                            ? '<div style="margin-top:7px;padding-top:6px;border-top:1px dashed #1f2937"><div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Traços</div>'
                                + _m.tracos.map(function (t2) { return '<div style="font-size:8px;color:#9ca3af;margin-bottom:3px;line-height:1.45"><b style="color:#d1d5db">' + _esc7(t2.n) + '.</b> ' + _esc7(t2.d) + '</div>'; }).join('')
                                + '</div>'
                            : '')
                        + ((_m.acoes || []).length
                            ? '<div style="margin-top:7px;padding-top:6px;border-top:1px dashed #1f2937"><div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Ações</div>'
                                + _m.acoes.map(function (a2) { return '<div style="font-size:8px;color:#9ca3af;margin-bottom:3px;line-height:1.45"><b style="color:#d1d5db">' + _esc7(a2.n) + '.</b> ' + _esc7(a2.d) + '</div>'; }).join('')
                                + '</div>'
                            : '')
                        + '<div style="margin-top:7px;padding-top:6px;border-top:1px dashed #1f2937">'
                        + '<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Não copiados — valem o mínimo ou o comprado</div>'
                        + '<div style="display:flex;gap:5px;flex-wrap:wrap">'
                        + _excBadge('Dano', _exc.dano) + _excBadge('CA', _exc.ca) + _excBadge('PV', _exc.pv)
                        + '</div>'
                        + '<div style="font-size:8px;color:#4b5563;margin-top:4px">A criatura original tem CA ' + _esc7(_m.ca) + ' e PV ' + _esc7(_m.pv) + ' — não são copiados.</div>'
                        + '</div>';
                }
            }

            copiaPerfeitaHtml += '<div style="background:#0d1117;border:1px solid ' + tc + '33;border-radius:12px;padding:14px;margin-bottom:20px">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;color:' + tc + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🧬 ' + _titulo + '</div>'
                + _corpo
                + '</div>';
        }
    }
    // ── Fim Cópia Perfeita ──────────────────────────────────────────────────────

    // ── Cálculo de Alcance e Duração ──────────────────────────────────────────
    const allSelIds = [...(h.restricoes||[]), ...(h.efeitos||[])];
    let alcanceBonus = [];
    let areaBonus = [];
    let duracaoBonus = [];
    let alcanceDobrado = false;
    let duracaoDobrada = false;
    // Graus genéricos mandados para alcance, área ou duração.
    // Conversão canônica: 1 grau = 1,5m de alcance ou área, ou 1 rodada de duração.
    if (_genericos.alcance) alcanceBonus.push({ valor: _genericos.alcance * 1.5, fonte: 'Graus de Potência (Alcance)', grau: _genericos.alcance });
    if (_genericos.area)    areaBonus.push({ valor: _genericos.area * 1.5, fonte: 'Graus de Potência (Área)', grau: _genericos.area });
    if (_genericos.duracao) duracaoBonus.push({ valor: _genericos.duracao, fonte: 'Graus de Potência (Duração)', unidade: 'rodada', grau: _genericos.duracao });
    // 5 Graus do 1º Hatsu — alcance, área, duração
    if (idx === 0 && h.primeiroHatsuGraus) {
        const _phg = h.primeiroHatsuGraus;
        if (_phg.alcance) alcanceBonus.push({ valor: _phg.alcance * 1.5, fonte: '⭐ 1º Hatsu (Alcance)', grau: _phg.alcance });
        if (_phg.area)    areaBonus.push({ valor: _phg.area * 1.5, fonte: '⭐ 1º Hatsu (Área)', grau: _phg.area });
        if (_phg.duracao) duracaoBonus.push({ valor: _phg.duracao, fonte: '⭐ 1º Hatsu (Duração)', unidade: 'rodada', grau: _phg.duracao });
    }

    // Bônus de Talento aplicado a alcance/área/duração
    if (h.bonusGraus) {
        const _bg = h.bonusGraus;
        if (_bg.tipo === 'alcance' && _bg.valor)
            alcanceBonus.push({ valor: _bg.valor * 1.5, fonte: '💠 Bônus Talentoso (Alcance)', grau: _bg.valor });
        else if (_bg.tipo === 'area' && _bg.valor)
            areaBonus.push({   valor: _bg.valor * 1.5,  fonte: '💠 Bônus Talentoso (Área)', grau: _bg.valor });
        else if (_bg.tipo === 'duracao' && _bg.valor)
            duracaoBonus.push({ valor: _bg.valor, fonte: '💠 Bônus Talentoso (Duração)', unidade: 'rodada', grau: _bg.valor });
    }

    // Efeitos Gerais
    const eg1Count = (h.efeitos||[]).filter(id => id === 'eg1').length;
    if (eg1Count > 0) {
        const eg1choice = (h.specialChoices||{})['eg1'] || 'Alcance';
        if (eg1choice === 'Área') {
            areaBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance ×${eg1Count} (Área)`, grau: eg1Count });
        } else {
            alcanceBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance ×${eg1Count}`, grau: eg1Count });
        }
    }
    const eg2Count = (h.efeitos||[]).filter(id => id === 'eg2').length;
    if (eg2Count > 0) duracaoBonus.push({ valor: eg2Count, fonte: `Aumento de Duração ×${eg2Count}`, unidade: 'rodada', grau: eg2Count });
    if ((h.efeitos||[]).includes('eg18')) duracaoBonus.push({ valor: null, fonte: 'Experiência Comprovada', unidade: 'escala' });
    const eg9Count = (h.efeitos||[]).filter(id => id === 'eg9').length;
    if (eg9Count > 0) {
        const eg9shape = (h.specialChoices||{})['eg9'] || 'Área';
        areaBonus.push({ valor: eg9Count * 1.5, fonte: `Ajuste de Forma — ${eg9shape} ×${eg9Count}`, grau: eg9Count });
    }

    // Efeitos de categoria
    if ((h.efeitos||[]).includes('em_e2')) {
        const c = (h.specialChoices||{})['em_e2'] || 'Alcance';
        if (c === 'Área') areaBonus.push({ valor: 3, fonte: 'Distância Segura (Área)', grau: window.AREA_GRAU_MAP['em_e2']||0 });
        else alcanceBonus.push({ valor: 6, fonte: 'Distância Segura (Alcance)', grau: window.ALCANCE_GRAU_MAP['em_e2']||0 });
    }
    if ((h.efeitos||[]).includes('em_e14')) {
        // As duas opções somam ÁREA — ver EXPANSAO_DOMINIO_OPCOES.
        const op = window.opcaoExpansaoDominio((h.specialChoices||{})['em_e14']);
        areaBonus.push({ valor: op.metros, fonte: 'Expansão de Domínio (' + op.rotulo + ')', grau: op.graus });
    }

    // Restrições — Alcance/Área (usando specialChoices para saber qual)
    const rg_l9Count = (h.restricoes||[]).filter(id => id === 'rg_l9').length;
    if (rg_l9Count > 0) {
        const l9choice = (h.specialChoices||{})['rg_l9'] || 'Alcance';
        // Alcance e Área concedem magnitudes de grau diferentes por cópia (2 vs 1), então os metros
        // por cópia também diferem (3m vs 1,5m) mesmo com a mesma taxa de 1,5m/grau.
        if (l9choice === 'Área') areaBonus.push({ valor: rg_l9Count * 1.5, fonte: `Exaustão 1 ×${rg_l9Count} (Área)`, grau: rg_l9Count * (window.AREA_GRAU_MAP['rg_l9']||0) });
        else alcanceBonus.push({ valor: rg_l9Count * 3, fonte: `Exaustão 1 ×${rg_l9Count} (Alcance)`, grau: rg_l9Count * (window.ALCANCE_GRAU_MAP['rg_l9']||0) });
    }
    if ((h.restricoes||[]).includes('rg_l10')) {
        const l10choice = (h.specialChoices||{})['rg_l10'] || 'Alcance';
        if (l10choice === 'Área') areaBonus.push({ valor: 1.5, fonte: 'Interação Sensorial Simples (Área)', grau: window.AREA_GRAU_MAP['rg_l10']||0 });
        else alcanceBonus.push({ valor: 3, fonte: 'Interação Sensorial Simples (Alcance)', grau: window.ALCANCE_GRAU_MAP['rg_l10']||0 });
    }
    if ((h.restricoes||[]).includes('rg_m12')) {
        const m12choice = (h.beneficioChoices||{})['rg_m12'] || '';
        if (m12choice.toLowerCase().includes('dura')) duracaoDobrada = true;
        else alcanceDobrado = true;
    }
    if ((h.restricoes||[]).includes('rt_l2')) alcanceBonus.push({ valor: 3, fonte: 'Sem Movimento no Turno', grau: window.ALCANCE_GRAU_MAP['rt_l2']||0 });
    if ((h.restricoes||[]).includes('rt_m2')) areaBonus.push({ valor: 1.5, fonte: 'Sem Aliados a 3m', grau: window.AREA_GRAU_MAP['rt_m2']||0 });
    if ((h.restricoes||[]).includes('em_l1')) alcanceBonus.push({ valor: 6, fonte: 'Linha Reta Apenas', grau: window.ALCANCE_GRAU_MAP['em_l1']||0 });

    // Restrições — Duração
    if ((h.restricoes||[]).includes('rg_p2')) duracaoBonus.push({ valor: 3, fonte: 'Boneca Russa', unidade: 'rodada' });
    const rg_v2Count = (h.restricoes||[]).filter(id => id === 'rg_v2').length;
    if (rg_v2Count > 0) duracaoBonus.push({ valor: null, fonte: 'Canalizar com Concentração (+X rodadas)', unidade: 'variável' });
    if ((h.restricoes||[]).includes('rg_v3')) duracaoBonus.push({ valor: null, fonte: 'Confirmação de Duas Etapas (Leve+1r/Mod+2r/Pes+3r/Ext+4r)', unidade: 'variável' });
    if ((h.restricoes||[]).includes('rm_l3')) duracaoBonus.push({ valor: 2, fonte: '1 Item por Combate', unidade: 'rodada' });

    // ── Restrições com benefício de DURAÇÃO que não estavam ligadas ─────────────
    // Elas tinham o benefício escrito no banco ("+2 Rodadas"), mas nada no cálculo lia.
    // O Hatsu continuava marcado como Instantâneo mesmo com a restrição comprada.
    // Quando o benefício é uma ESCOLHA ("+2 Rodadas ou -15% de aura"), só conta se o
    // jogador tiver escolhido a opção de rodadas em beneficioChoices.
    const _bc = h.beneficioChoices || {};
    const _escolheuRodadas = function (id) {
        const v = String(_bc[id] || '').toLowerCase();
        return v.includes('rodada') || v.includes('dura');
    };
    // +2 rodadas fixas, sem escolha
    // Condição Hostil também DOBRA a área de efeito.
    if (window.hatsuDanoMaximizado && window.hatsuDanoMaximizado(h)) {
        areaBonus.push({ valor: null, fonte: 'Condição Hostil (área dobrada)', unidade: 'dobro' });
    }
    // rm_l3 ("1 Item por Combate"): o +2 rodadas já era somado no cálculo, mas só o
    // gêmeo rc_l3 aparecia aqui — o jogador via a duração certa sem a fonte listada.
    if ((h.restricoes||[]).includes('rm_l3')) duracaoBonus.push({ valor: 2, fonte: '1 Item por Combate', unidade: 'rodada' });
    if ((h.restricoes||[]).includes('rma_l2')) duracaoBonus.push({ valor: 1, fonte: 'Dano Quebra o Efeito', unidade: 'rodada' });
    // Benefício de escolha: "+2 Rodadas ou −15% de aura"
    if ((h.restricoes||[]).includes('rg_m10') && _escolheuRodadas('rg_m10')) {
        duracaoBonus.push({ valor: 2, fonte: 'Limite de Uso Definitivo (Rodadas)', unidade: 'rodada' });
    }
    // Benefícios de escolha múltipla que incluem duração
    if ((h.restricoes||[]).includes('rm_p2') && _escolheuRodadas('rm_p2')) {
        duracaoBonus.push({ valor: 2, fonte: 'Conjuração Controlável (Duração)', unidade: 'rodada' });
    }
    // Condição Alheia ou Simbiótica: +4 rodadas POR MEMBRO — quantidade definida na mesa
    if ((h.restricoes||[]).includes('rg_e1') && _escolheuRodadas('rg_e1')) {
        duracaoBonus.push({ valor: null, fonte: 'Condição Alheia ou Simbiótica (+4 rodadas por membro)', unidade: 'variável' });
    }
    // rg_m13: Zetsu Protetivo — só conta se beneficioChoice for "Rodadas"
    if ((h.restricoes||[]).includes('rg_m13')) {
        const m13choice = (h.beneficioChoices||{})['rg_m13'] || '';
        if (m13choice.toLowerCase().includes('rodada') || m13choice.toLowerCase().includes('dura')) {
            duracaoBonus.push({ valor: 2, fonte: 'Zetsu Protetivo (Rodadas)', unidade: 'rodada', grau: window.DURACAO_GRAU_MAP['rg_m13']||0 });
        }
    }

    // rg_v10: Zetsu por Falha — graus em alcance ou área baseado nas rodadas configuradas (não conta
    // para o teto de Grau de Potência — é limitado pelo próprio risco de Zetsu, um sistema separado)
    if ((h.restricoes||[]).includes('rg_v10')) {
        const v10 = (h.specialChoices||{})['rg_v10'] || {};
        const rod = v10.rodadas || 0;
        const tipo = v10.tipo || '';
        if (rod > 0 && tipo) {
            if (tipo === 'Área') areaBonus.push({ valor: rod * 1.5, fonte: 'Zetsu por Falha ('+rod+' rod. Zetsu)' });
            else alcanceBonus.push({ valor: rod * 1.5, fonte: 'Zetsu por Falha ('+rod+' rod. Zetsu)' });
        }
    }
    if ((h.efeitos||[]).includes('eg17')) {
        const eg17choice = (h.specialChoices||{})['eg17'] || '';
        if (eg17choice === 'Reduz Duração') duracaoBonus.push({ valor: null, fonte: 'Dor pra Disgrama! — −1/3 da duração ao ativar', unidade: 'penalidade' });
        else if (eg17choice === 'Penalidade TR') duracaoBonus.push({ valor: null, fonte: 'Dor pra Disgrama! — −5 no TR de Concentração', unidade: 'penalidade' });
    }

    // rev.: nunca bloqueia a seleção por ultrapassar o teto de Grau de Potência (ver hatsu-creator.js)
    // — mas mecanicamente só a fatia "rastreada" pelo teto (marcada com `grau`) é reduzida quando
    // ultrapassa o limite do nível; o restante (bônus fixos fora do sistema de grau, como Boneca
    // Russa ou Zetsu por Falha) nunca é afetado. O excedente reservado passa a valer quando o
    // personagem subir de nível e o teto crescer.
    function _hClampGrauTrackedTotal(bonusArr, grauMaxRaw) {
        const grauMax = (grauMaxRaw == null) ? Infinity : grauMaxRaw;
        let trackedGrau = 0, trackedValor = 0, untrackedValor = 0;
        bonusArr.forEach(b => {
            const v = typeof b.valor === 'number' ? b.valor : 0;
            if (b.grau) { trackedGrau += b.grau; trackedValor += v; }
            else { untrackedValor += v; }
        });
        if (grauMax === Infinity || trackedGrau <= grauMax) {
            return { total: trackedValor + untrackedValor, reservado: 0 };
        }
        const ratio = trackedGrau > 0 ? grauMax / trackedGrau : 0;
        const trackedValorClamped = Math.round(trackedValor * ratio * 10) / 10;
        return { total: trackedValorClamped + untrackedValor, reservado: Math.round((trackedValor - trackedValorClamped) * 10) / 10 };
    }
    const _grauMaxAlcance = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'alcance') : Infinity;
    const _grauMaxArea    = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'area') : Infinity;
    const _grauMaxDuracao = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'duracao') : Infinity;
    const _alcClamp = _hClampGrauTrackedTotal(alcanceBonus, _grauMaxAlcance);
    const _areaClamp = _hClampGrauTrackedTotal(areaBonus, _grauMaxArea);
    const _duracaoClamp = _hClampGrauTrackedTotal(duracaoBonus, _grauMaxDuracao);
    const totalAlcanceM = _alcClamp.total;
    const totalAreaM = _areaClamp.total;
    const totalDuracaoR = _duracaoClamp.total;
    // ── O Hatsu é corpo-a-corpo? ──────────────────────────────────────────────
    // Decide se o RYU alcança este Hatsu. Fica aqui, e não junto do _hatsuRollState
    // lá em cima, porque os metros de alcance e de área só existem a partir desta
    // linha — o estado da rolagem é montado antes deles.
    // Sem alcance e sem área comprados, o Hatsu é "Pessoal / Toque": acontece no
    // corpo. O Projétil de Aura sai fora mesmo assim, porque quem atinge o alvo é
    // o projétil.
    if (window._hatsuRollState) {
        window._hatsuRollState.corpoACorpo =
            totalAlcanceM === 0 && totalAreaM === 0 && !_temProjetilAura;
        // Com ÁREA ou com Projétil de Aura não há o que perguntar: é explosão ou é
        // projétil, e o RYU não entra de jeito nenhum. Já um Hatsu que comprou só
        // ALCANCE pode perfeitamente ser uma adaga arremessada — os metros não
        // distinguem as duas coisas, então esse é o caso em que o app pergunta.
        window._hatsuRollState.ryuPodePerguntar =
            totalAreaM === 0 && !_temProjetilAura;
    }

    const alcanceReservadoM = _alcClamp.reservado;
    const areaReservadoM = _areaClamp.reservado;
    const duracaoReservadoR = _duracaoClamp.reservado;



            // ── Marcas e cargas da Emissão ──────────────────────────────────────
            // Fica na tela do Hatsu, e não na aba Ficha como a Aura Condensada,
            // porque a marca do Plano Avançado é PRÉVIA: ela é colocada antes de o
            // Hatsu ser ativado, e o painel da Ficha só mostra Hatsus ligados.
            const _marcasCfg = window.marcasDoHatsu ? window.marcasDoHatsu(h) : [];
            const marcasHtml = _marcasCfg.length ? `
                <div style="background:#0a0f1a;border:1px solid #34d39944;border-radius:12px;padding:12px;margin-top:10px">
                    <div style="font-size:8px;font-weight:900;color:#34d399;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📍 Marcas e cargas · ${window.MARCA_EMISSAO_CUSTO}% de aura cada</div>
                    ${_marcasCfg.map(m => {
                        const n = window.contagemMarcas(char, idx, m.id);
                        const custo = window.MARCA_EMISSAO_CUSTO || 5;
                        const temAura = (char.vitals.aura || 0) >= custo;
                        const modo = m.modos ? window.modoMarca(char, idx, m.id) : '';
                        return `<div style="margin-bottom:8px">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="font-size:13px">${m.icone}</span>
                                <div style="flex:1;line-height:1.35">
                                    <div style="font-size:9px;font-weight:700;color:#d1d5db">${m.nome}</div>
                                    <div style="font-size:8px;color:#6b7280">${m.nota}</div>
                                </div>
                                <button onclick="window._retirarMarcaEmissao(${idx},'${m.id}')" ${n > 0 ? '' : 'disabled'}
                                    style="flex-shrink:0;width:26px;height:26px;border-radius:7px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;cursor:${n > 0 ? 'pointer' : 'not-allowed'};opacity:${n > 0 ? 1 : .35};border:1px solid #34d39955;background:transparent;color:#34d399">−</button>
                                <span style="flex-shrink:0;min-width:24px;text-align:center;font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;color:${n > 0 ? '#34d399' : '#374151'}">${n}</span>
                                <button onclick="window._aplicarMarcaEmissao(${idx},'${m.id}')" ${temAura ? '' : 'disabled'}
                                    style="flex-shrink:0;width:26px;height:26px;border-radius:7px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;cursor:${temAura ? 'pointer' : 'not-allowed'};opacity:${temAura ? 1 : .35};border:none;background:#34d399;color:#000">+</button>
                            </div>
                            ${m.modos ? `<div style="display:flex;gap:4px;margin-top:5px;margin-left:21px">
                                ${m.modos.map(o => {
                                    const on = modo === o[0];
                                    return `<button onclick="window._setModoMarcaEmissao(${idx},'${m.id}','${o[0]}')" style="padding:4px 9px;border-radius:6px;font-size:8px;font-weight:700;cursor:pointer;border:1px solid ${on ? '#34d399' : '#1f2937'};background:${on ? '#34d39918' : 'transparent'};color:${on ? '#34d399' : '#6b7280'}">${on ? '✓ ' : ''}${o[1]}</button>`;
                                }).join('')}
                                <span style="flex:1;font-size:7px;color:#4b5563;align-self:center;line-height:1.3">só o modo de aplicar — não liga o princípio REN</span>
                            </div>` : ''}
                            ${n > 0 ? `<div style="font-size:8px;color:#34d399;margin-top:4px;margin-left:21px">${n} ${n === 1 ? m.unidade : m.plural} no tabuleiro · ${n * (window.MARCA_EMISSAO_CUSTO || 5)}% de aura empatados</div>` : ''}
                        </div>`;
                    }).join('')}
                    <div style="font-size:8px;color:#6b7280;border-top:1px dashed #1f2937;padding-top:6px;line-height:1.5">
                        Retirar devolve os ${window.MARCA_EMISSAO_CUSTO}%. Só a aura limita quantas existem ao mesmo tempo.
                    </div>
                </div>` : '';

            // ── Sanidade que este Hatsu tira do ALVO ────────────────────────────
            // Informativo por natureza: a sanidade atingida está na ficha de outra
            // pessoa. O cartão existe porque a regra estava invisível — ninguém
            // somava 1 por condição no meio do combate.
            const _sanH = window.calcSanidadeDoHatsu ? window.calcSanidadeDoHatsu(h, 100) : null;
            const sanidadeAlvoHtml = (_sanH && _sanH.temAlgo) ? `
                <div style="background:#0a0f1a;border:1px solid #c084fc44;border-radius:12px;padding:12px;margin-top:10px">
                    <div style="font-size:8px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">🧠 Sanidade do alvo</div>
                    ${_sanH.condicoes.length ? `
                        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:5px">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:#c084fc">−${_sanH.base}</span>
                            <span style="flex:1;font-size:9px;color:#9ca3af;line-height:1.45">por aplicar ${_sanH.condicoes.join(', ')} <span style="color:#6b7280">(−${_sanH.porCondicao} por condição)</span></span>
                        </div>` : ''}
                    ${_sanH.ilusao ? `<div style="font-size:9px;color:#c084fc;margin-bottom:5px">🌀 Ilusão: ${_sanH.ilusaoRotulo}</div>` : ''}
                    <div style="font-size:8px;color:#6b7280;line-height:1.5;border-top:1px dashed #1f2937;padding-top:6px">
                        Teto do livro: um Hatsu nunca tira mais que <b style="color:#9ca3af">${_sanH.tetoPct}%</b> da sanidade do alvo — ${_sanH.teto} pontos num alvo com 100.
                    </div>
                </div>` : '';

            // Marca de Hatsu de Ilusão. Fica aqui, e não no criador, porque não existe
            // uma etiqueta de "Ilusão" no banco: quem sabe é a mesa.
            const ilusaoToggleHtml = `
                <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:10px;margin-top:8px">
                    <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌀 É um Hatsu de Ilusão?</div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap">
                        ${[['', 'Não']].concat(window.ILUSAO_SANIDADE_OPCOES || []).map(o => {
                            const on = ((h.ilusaoSanidade || '') === o[0]);
                            return `<button onclick="window._hSetIlusaoHatsu(${idx},'${o[0]}')" style="flex:1;min-width:92px;padding:6px;border-radius:8px;font-size:8px;font-weight:700;cursor:pointer;border:1px solid ${on ? '#c084fc' : '#1f2937'};background:${on ? '#c084fc18' : 'transparent'};color:${on ? '#c084fc' : '#9ca3af'}">${on ? '✓ ' : ''}${o[1]}</button>`;
                        }).join('')}
                    </div>
                </div>`;

    // Store info for alcance/área/duração popups
    if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
    if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
    if (alcanceBonus.length > 0 || alcanceDobrado) {
        const _alcLines = alcanceBonus.map(b => ({ l: b.fonte, v: '+'+b.valor+'m', c: '#60a5fa' }));
        if (alcanceDobrado) _alcLines.push({ l: 'Tempo Marcado', v: 'Base ×2', c: '#60a5fa' });
        if (alcanceReservadoM > 0) _alcLines.push({ l: '⏳ Reservado (teto do nível)', v: '+'+alcanceReservadoM+'m aguardando', c: '#fbbf24' });
        _alcLines.push({ l: '→ Total', v: (totalAlcanceM>0?'+'+totalAlcanceM+'m':'')+(alcanceDobrado?' + Base×2':''), c: '#60a5fa', b: true });
        window._HATSU_STAT_INFO[idx].alcance = _alcLines;
    }
    if (areaBonus.length > 0) {
        const _areaLines = areaBonus.map(b => ({ l: b.fonte, v: '+'+b.valor+'m', c: '#34d399' }));
        if (areaReservadoM > 0) _areaLines.push({ l: '⏳ Reservado (teto do nível)', v: '+'+areaReservadoM+'m aguardando', c: '#fbbf24' });
        _areaLines.push({ l: '→ Total', v: '+'+totalAreaM+'m', c: '#34d399', b: true });
        window._HATSU_STAT_INFO[idx].area = _areaLines;
    }
    if (duracaoBonus.length > 0 || duracaoDobrada) {
        const _durLines = duracaoBonus.map(b => ({ l: b.fonte, v: b.valor !== null ? (typeof b.valor === 'number' ? '+'+b.valor+' rod.' : b.valor) : '(ver desc.)', c: '#a78bfa' }));
        if (duracaoDobrada) _durLines.push({ l: 'Tempo Marcado', v: 'Base ×2', c: '#a78bfa' });
        if (duracaoReservadoR > 0) _durLines.push({ l: '⏳ Reservado (teto do nível)', v: '+'+duracaoReservadoR+' rod. aguardando', c: '#fbbf24' });
        const _durTotalStr = (totalDuracaoR>0?'+'+totalDuracaoR+' rod.':'')+(duracaoDobrada?' + Base×2':'');
        _durLines.push({ l: '→ Total', v: _durTotalStr||'(variável)', c: '#a78bfa', b: true });
        window._HATSU_STAT_INFO[idx].duracao = _durLines;
    }

    // ── NÚMERO DE ALVOS ─────────────────────────────────────────────────────────
    // A característica estava cadastrada (aparece no modal dos 5 Graus e é peculiar da
    // Manipulação), mas NADA no app calculava ou exibia quantos alvos o Hatsu atinge:
    // o jogador investia graus em Número de Alvos e eles não produziam efeito nenhum.
    //
    // Regra: todo Hatsu começa em 1 alvo (que pode ser o próprio usuário) e cada grau
    // soma mais um. É diferente de Área: área atinge todos dentro dela, enquanto alvos
    // permite escolher alvos DIFERENTES, cada um dentro do alcance.
    const _grausAlvos = (function () {
        let n = 0;
        // Graus escolhidos para "alvos" nos efeitos com picker (Intensificação etc.)
        const sc = h.specialChoices || {};
        (h.efeitos || []).forEach(function (id) {
            const chave = (window.GRAU_ESCOLHA_PARA_CHAVE || {})[sc[id]];
            if (chave === 'alvos') n += 1;
        });
        // 5 Graus do 1º Hatsu e Bônus Talentoso aplicados em alvos
        const ph = h.primeiroHatsuGraus || {};
        n += ph.alvos || 0;
        if (h.bonusGraus && h.bonusGraus.tipo === 'alvos') n += h.bonusGraus.valor || 0;
        // Juramento Imutável: +4 em todas as características da categoria
        if ((h.restricoes || []).includes('rg_e5') && !((h.pureRestrictions || {})['rg_e5'])) {
            const cars = window.CATEGORIA_CARACTERISTICAS_GRAU[hatsuClasse] || [];
            const nivelAtivo = window.calcJuramentoImutavelNivelAtivo(h);
            const nivelAtual = parseInt(char.level) || 1;
            if (cars.includes('alvos') && nivelAtivo != null && nivelAtual >= nivelAtivo) n += 4;
        }
        n += (_genericos.alvos || 0);   // graus genéricos mandados para Número de Alvos
        return n;
    })();
    // Alvos extras vindos da Troca Perigosa, escolhidos na ativação do Hatsu.
    const _alvosDaAtivacao = (((char.hatsusAtivos || {})[idx] || {}).extras || {}).alvosExtra || 0;
    // Teto: consultado pela via normal. Hoje "alvos" está em CARACTERISTICAS_SEM_TETO,
    // então a função devolve Infinity — se a regra passar a ter teto, basta tirá-la de lá.
    const _tetoAlvos = window.calcMaxGrauPorCaracteristica
        ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, 'alvos') : Infinity;
    const _alvosQuer = _grausAlvos + _alvosDaAtivacao;
    const _alvosPode = (_tetoAlvos === Infinity) ? _alvosQuer : Math.min(_alvosQuer, _tetoAlvos);
    const totalAlvos = 1 + _alvosPode;              // o 1º alvo é a base de todo Hatsu
    const alvosReservado = Math.max(0, _alvosQuer - _alvosPode);
    if (_alvosQuer > 0) {
        const _alvLines = [{ l: 'Base', v: '1 alvo', c: '#9ca3af' }];
        if (_grausAlvos > 0) _alvLines.push({ l: 'Graus em Número de Alvos', v: '+' + _grausAlvos, c: '#38bdf8' });
        if (_alvosDaAtivacao > 0) _alvLines.push({ l: 'Troca Perigosa (ativação)', v: '+' + _alvosDaAtivacao, c: '#38bdf8' });
        if (alvosReservado > 0) _alvLines.push({ l: '⏳ Reservado (teto do nível)', v: '+' + alvosReservado + ' aguardando', c: '#fbbf24' });
        _alvLines.push({ l: '→ Total', v: totalAlvos + ' alvo(s)', c: '#38bdf8', b: true });
        window._HATSU_STAT_INFO[idx].alvos = _alvLines;
    }

    // ── Duração real do Hatsu ───────────────────────────────────────────────────
    // O campo mostrava "Instantâneo" fixo para todos, ignorando o total já calculado
    // logo abaixo. A regra é que a duração É o que foi comprado (o manual fala em
    // "rodadas compradas pela evolução"), então o campo passa a mostrar esse total.
    //
    // Alguns efeitos tornam a duração CONSTANTE, e nesses casos não há contagem:
    //  • Vínculo Sustentado (rm_e11) — dura enquanto houver concentração e aura
    //  • Relíquia Viva (rm_e21) — permanente até ser destruída
    //  • Concentração Total (ri_e15) — +1 rodada por acerto ininterrupto, variável
    const _EF_CONSTANTE = {
        'rm_e21': { texto: 'Permanente', nota: 'Relíquia Viva — até ser destruída' },
        'rm_e11': { texto: 'Enquanto concentrar', nota: 'Vínculo Sustentado — 5% de aura a cada 2 rodadas' },
        'ri_e15': { texto: 'Variável', nota: 'Concentração Total — +1 rodada por acerto ininterrupto' },
    };
    const _duracaoInfo = (function () {
        // Maldição tem temporizador próprio e não usa contagem de rodada.
        if ((h.tag || 'P') === 'M') {
            const tp = ((window.MALDICAO_DB || {}).temporizadores || []).find(function (x) { return x.id === h.temporizador; });
            return { rodadas: null, constante: true, texto: tp ? tp.nome.replace('Temporizador ', '') : 'Temporizador', nota: 'Maldição — regida pelo Temporizador' };
        }
        for (const id of Object.keys(_EF_CONSTANTE)) {
            if (efeitosSel.some(function (e) { return e.id === id; })) {
                return { rodadas: null, constante: true, texto: _EF_CONSTANTE[id].texto, nota: _EF_CONSTANTE[id].nota };
            }
        }
        if ((h.restricoes || []).includes('rg_v2')) {
            return { rodadas: null, constante: true, texto: 'Variável (X)', nota: 'Canalizar com Concentração — X definido no uso' };
        }
        const r = totalDuracaoR;
        if (duracaoDobrada) return { rodadas: r, constante: false, texto: (r > 0 ? r + ' rod. + base ×2' : 'Base ×2'), nota: 'Tempo Marcado dobra a duração base' };
        if (r > 0) return { rodadas: r, constante: false, texto: r + (r === 1 ? ' rodada' : ' rodadas'), nota: '' };
        return { rodadas: 0, constante: false, texto: 'Instantâneo', nota: 'Nenhuma rodada comprada' };
    })();

    const hasRangeOrDuration = alcanceBonus.length > 0 || areaBonus.length > 0 || duracaoBonus.length > 0 || alcanceDobrado || duracaoDobrada || _alvosQuer > 0;
    let calcRangeDurHtml = '';
    if (hasRangeOrDuration) {
        const alcanceHtml = alcanceBonus.length > 0 || alcanceDobrado ? `
            <div style="margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">📐 Alcance</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${alcanceDobrado ? `<span style="font-size:12px;font-weight:900;color:#60a5fa">Base ×2</span>` : ''}
                    ${totalAlcanceM > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#60a5fa;text-shadow:0 0 10px #60a5fa66">+${totalAlcanceM}m</span>` : ''}
                    ${alcanceReservadoM > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${alcanceReservadoM}m em espera ⏳</span>` : ''}
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'alcance',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Detalhes">ⓘ</button>
                </div>
                ${alcanceBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• ${b.fonte}: +${b.valor}m</div>`).join('')}
                ${alcanceDobrado ? `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• Tempo Marcado: dobra alcance base</div>` : ''}
            </div>` : '';

        const areaHtml = areaBonus.length > 0 ? `
            <div style="margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">🔵 Área</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#34d399;text-shadow:0 0 10px #34d39966">+${totalAreaM}m</span>
                    ${areaReservadoM > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${areaReservadoM}m em espera ⏳</span>` : ''}
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'area',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Detalhes">ⓘ</button>
                </div>
                ${areaBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• ${b.fonte}: +${b.valor}m</div>`).join('')}
            </div>` : '';

        // Campo de Número de Alvos, no mesmo formato de Alcance, Área e Duração.
    const alvosHtml = _alvosQuer > 0 ? `
        <div style="margin-bottom:10px">
            <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">👥 Número de Alvos</div>
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#38bdf8;text-shadow:0 0 10px #38bdf866">${totalAlvos}</span>
                <span style="font-size:10px;color:#6b7280">alvo(s) diferentes, cada um dentro do alcance</span>
                ${alvosReservado > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${alvosReservado} em espera ⏳</span>` : ''}
                <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'alvos',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;color:#6b7280;font-size:9px;cursor:pointer;padding:0">i</button>
            </div>
            <div style="font-size:8px;color:#6b7280">• Base: 1 alvo${_grausAlvos > 0 ? ` &nbsp;• Graus: +${_grausAlvos}` : ''}${_alvosDaAtivacao > 0 ? ` &nbsp;• Troca Perigosa: +${_alvosDaAtivacao}` : ''}</div>
        </div>` : '';

    const duracaoHtml = duracaoBonus.length > 0 || duracaoDobrada ? `
            <div>
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">⏱ Duração</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${duracaoDobrada ? `<span style="font-size:12px;font-weight:900;color:#a78bfa">Base ×2</span>` : ''}
                    ${totalDuracaoR > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#a78bfa;text-shadow:0 0 10px #a78bfa66">+${totalDuracaoR} rod.</span>` : ''}
                    ${duracaoReservadoR > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#fbbf2422;color:#fbbf24" title="Excedente aguardando o teto do nível aumentar">+${duracaoReservadoR} rod. em espera ⏳</span>` : ''}
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'duracao',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Detalhes">ⓘ</button>
                </div>
                ${duracaoBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• ${b.fonte}: ${b.valor !== null ? (typeof b.valor === 'number' ? '+'+b.valor+' rodada'+(b.valor!==1?'s':'') : b.valor) : '(ver descrição)'}</div>`).join('')}
                ${duracaoDobrada ? `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• Tempo Marcado: dobra duração base</div>` : ''}
            </div>` : '';

        calcRangeDurHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:10px">📐 Alcance, Área & Duração</div>
            ${alcanceHtml}
            ${areaHtml}
            ${alvosHtml}
            ${duracaoHtml}
        </div>`;
    }
    // ── Fim cálculo Alcance & Duração ─────────────────────────────────────────

    const palBadge = {
        leves:    {bg:'#22c55e22',tc:'#4ade80',label:'LEVE'},
        moderadas:{bg:'#eab30822',tc:'#fbbf24',label:'MOD'},
        pesadas:  {bg:'#ef444422',tc:'#f87171',label:'PES'},
        variaveis:{bg:'#a855f722',tc:'#c084fc',label:'VAR'},
        extremas: {bg:'#f9731622',tc:'#fb923c',label:'EXT'},
        categoria:{bg:'#ffffff11',tc:'#9ca3af', label:'CAT'},
    };

    const rHtml = restricoesSel.length
        ? restricoesSel.map(r => {
            const p = palBadge[r.grupo] || palBadge.categoria;
            const sc = h.specialChoices || {};
            const isPure = h.pureRestrictions && h.pureRestrictions[r.id];
            const PURE_PN = { leve:1, moderada:2, pesada:3, extrema:4 };
            const purePn = PURE_PN[r.peso] || 0;
            let specialDetail = '';
            if (r.id === 'rg_p8' && sc.rg_p8) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#4ade80;padding:4px 8px;background:#4ade8018;border-radius:6px">📍 ${sc.rg_p8}</div>`;
            if (r.id === 'rg_m8' && sc.rg_m8) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#fbbf24;padding:4px 8px;background:#fbbf2418;border-radius:6px">🩸 Condição Média: ${sc.rg_m8}</div>`;
            if (r.id === 'rg_e5') {
                const _nivelAtivo = window.calcJuramentoImutavelNivelAtivo ? window.calcJuramentoImutavelNivelAtivo(h) : null;
                const _nivelAtualJ = parseInt(char.level) || 1;
                let _statusJuramento = '';
                if (_nivelAtivo != null) {
                    _statusJuramento = _nivelAtualJ >= _nivelAtivo
                        ? `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#4ade80;padding:4px 8px;background:#4ade8018;border-radius:6px">✓ Bônus de +4 Graus de Potência ATIVO em todas as características</div>`
                        : `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#fbbf24;padding:4px 8px;background:#fbbf2418;border-radius:6px">⏳ Bônus de +4 Graus de Potência ativa no nível ${_nivelAtivo} (faltam ${_nivelAtivo - _nivelAtualJ} nível${(_nivelAtivo - _nivelAtualJ) !== 1 ? 'is' : ''})</div>`;
                }
                specialDetail = (sc.rg_e5 ? `<div style="margin-top:6px;font-size:9px;color:#fb923c;padding:6px 10px;background:#fb923c11;border-radius:6px;border:1px solid #fb923c33;font-style:italic">"${sc.rg_e5}"</div>` : '') + _statusJuramento;
            }
            if ((r.id === 'rg_l9' || r.id === 'rg_l10') && sc[r.id]) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc[r.id] === 'Área' ? '🔵 Área' : '📐 Alcance'}</div>`;
            if (r.id === 'rg_l17' && sc.rg_l17) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#f87171;padding:2px 7px;background:#f8717118;border-radius:5px">⚔️ Aplicado em: ${sc.rg_l17}</div>`;
            // A condição escolhida para "Perde 5% de aura extra ao errar" aparece na ficha,
            // para a mesa saber o que aplicar quando o ataque acerta.
            if (r.id === 'rt_m1' && sc.rt_m1) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">🩸 Ao atingir: <b>${sc.rt_m1}</b></div>`;
            if (r.id === 'rg_v10' && sc.rg_v10 && typeof sc.rg_v10 === 'object' && sc.rg_v10.rodadas) {
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#c084fc;padding:4px 8px;background:#c084fc18;border-radius:6px">⚡ +${sc.rg_v10.rodadas} grau(s) em ${sc.rg_v10.tipo||'?'} — ${sc.rg_v10.rodadas} rod. de Zetsu por falha</div>`;
            }
            return `<div style="display:flex;align-items:flex-start;gap:10px;background:#0d1117;border-radius:10px;padding:12px;border:1px solid ${isPure?'#fbbf2444':'#1f2937'};margin-bottom:8px">
                <span style="font-size:7px;font-weight:900;padding:3px 6px;border-radius:4px;background:${p.bg};color:${p.tc};text-transform:uppercase;flex-shrink:0;margin-top:2px;letter-spacing:1px">${p.label}</span>
                <div style="flex:1">
                    <div style="font-size:11px;font-weight:700;color:#e5e7eb;margin-bottom:3px">${r.nome}</div>
                    <div style="font-size:9px;color:#6b7280;line-height:1.5;margin-bottom:4px">${r.desc}</div>
                    ${isPure
                        ? `<div style="font-size:9px;font-weight:700;color:#fbbf24">⚡ Pura — +${purePn} P.N</div>`
                        : `<div style="font-size:9px;font-weight:700;color:${p.tc}">⚡ ${r.bnf}</div>`}
                    ${(h.beneficioChoices && h.beneficioChoices[r.id]) ? `<div style="font-size:8px;margin-top:4px;padding:4px 8px;background:#4ade8018;border-radius:6px;color:#4ade80;font-weight:700">✓ Escolhido: ${h.beneficioChoices[r.id]}</div>` : ''}
                    ${specialDetail}
                </div>
            </div>`;
          }).join('')
        : `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhuma restrição selecionada.</div>`;

    // Conta ocorrências de cada ID pra saber "qual cópia" cada card representa (efeitosSel preserva
    // duplicatas na mesma ordem de h.efeitos) — usado por rm_e2 pra mostrar o material/característica
    // certos de CADA Golem, em vez de repetir a mesma escolha em todos os cards.
    const _eIdOccurrence = {};
    const eHtml = efeitosSel.length
        ? efeitosSel.map(e => {
            const _eCopyIdx = _eIdOccurrence[e.id] || 0;
            _eIdOccurrence[e.id] = _eCopyIdx + 1;
            const isGeral = e.origem === 'geral';
            const ec = isGeral ? '#9ca3af' : tc;
            const costColor = (e.pn||1) >= 3 ? '#f87171' : (e.pn||1) >= 2 ? '#fbbf24' : '#6b7280';
            const sc = h.specialChoices || {};
            let specialDetail = '';
   if (e.id === 'eg3' && sc.eg3) {
       const eg3List = Array.isArray(sc.eg3) ? sc.eg3 : [sc.eg3];
       const eg3Counts = {};
       eg3List.forEach(c => { eg3Counts[c] = (eg3Counts[c]||0) + 1; });
       const eg3Summary = Object.keys(eg3Counts).map(c => `${c} (${eg3Counts[c]} rodada${eg3Counts[c]>1?'s':''})`).join(', ');
       specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🩸 Condição: ${eg3Summary}</div>`;
   }
            // eg4 guarda o ID do efeito adicionado, então resolve para nome antes de
            // exibir. E usa a chave DA CÓPIA: com duas compras de eg4 (Modos B e C), os
            // dois cards mostravam o efeito do Modo B, porque a chave era sempre 'eg4'.
            if (e.id === 'eg4') {
                const _kAdd4 = _eCopyIdx > 0 ? ('eg4#' + _eCopyIdx) : 'eg4';
                const _letra4 = _LETRAS[_eCopyIdx + 1] || ('#' + (_eCopyIdx + 2));
                if (sc[_kAdd4]) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🔀 Modo ${_letra4} → ${_nomeEfeitoEg4(sc[_kAdd4])}</div>`;
            }
            // Escolhas simples de Reforço: mostra a opção desta cópia no card do efeito.
            // ri_e25 aparece também no modal de Dano Recebido (via calcFontesRD); os
            // outros dois são lembretes de mesa, por não terem campo de destino no app.
            const _ESC_REF_CARD = {
                ri_e25: { icone: '🛡', pre: '10 RD contra ' },
                ri_e14: { icone: '👊', pre: '' },
                ri_e28: { icone: '🤝', pre: '' },
            };
            if (_ESC_REF_CARD[e.id]) {
                const _cf = _ESC_REF_CARD[e.id];
                const _kc = _eCopyIdx > 0 ? (e.id + '#' + _eCopyIdx) : e.id;
                const _vc = sc[_kc];
                specialDetail = _vc
                    ? `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">${_cf.icone} ${_cf.pre}${_vc}</div>`
                    : `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Escolha a opção deste efeito ao editar o Hatsu.</div>`;
            }
            // ri_e29 Dano Fragilizante: mostra o TOTAL acumulado de cada opção, não a
            // escolha da cópia — com duas compras de "−2 nos ataques" o jogador tem de
            // ler −4, e o número precisa ser o mesmo em qualquer um dos cards.
            if (e.id === 'ri_e29' && window.bonusDanoFragilizante) {
                const _df = window.bonusDanoFragilizante(h);
                specialDetail = _df.length
                    ? `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">💥 Dano > 20: ${_df.map(function (x) { return '−' + x.total + ' ' + x.opcao.alvo + (x.vezes > 1 ? ' (' + x.vezes + '×)' : ''); }).join(' · ')}</div>`
                    : `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Escolha o que o dano acima de 20 provoca, ao editar o Hatsu.</div>`;
            }
            // ri_e30: mostra a escolha DESTA compra e quanto ela vale na contagem atual.
            // O "+2 aos resultados das reações" (Ágil) aparece aqui com destaque porque
            // o app não tem onde aplicá-lo: não existe rolagem de reação, só o contador
            // de Reações disponíveis. Fica visível para a mesa aplicar na mão — mesma
            // situação dos bônus de Esquiva/Bloqueio das Instâncias Shingen-Ryu.
            if (e.id === 'ri_e30') {
                const _k30 = window.chavePotencialLiberado(_eCopyIdx);
                const _id30 = sc[_k30] || '';
                const _o30 = _id30 && window.potencialLiberadoPorId ? window.potencialLiberadoPorId(_id30) : null;
                if (!_o30) {
                    specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Este P.N não foi gasto em nenhum efeito da tabela de Potencial Liberado.</div>`;
                } else {
                    // Quantas vezes esta opção foi escolhida até esta cópia (inclusive).
                    const _tot30 = (h.efeitos || []).filter(function (x) { return x === 'ri_e30'; }).length;
                    let _vz30 = 0;
                    for (let _q = 0; _q <= _eCopyIdx && _q < _tot30; _q++) {
                        if (sc[window.chavePotencialLiberado(_q)] === _id30) _vz30++;
                    }
                    const _mel30 = window.potencialLiberadoMelhora(_o30);
                    const _val30 = _mel30 ? window.valorPotencialLiberado(_o30, _vz30) : null;
                    const _a30 = _o30.aplica || {};
                    let _txt30;
                    if (!_mel30) {
                        _txt30 = _o30.efeito;
                    } else if (_a30.grandeza === 'deslocamento') {
                        _txt30 = '+' + String(_val30).replace('.', ',') + 'm de deslocamento';
                    } else if (_a30.grandeza === 'reacoes') {
                        _txt30 = '+' + _val30 + ' nos RESULTADOS das reações — aplicar na mesa (o app não rola reação)';
                    } else {
                        _txt30 = '+' + _val30 + ' em ' + _a30.attr + (_a30.condicao ? ' (só em ' + _a30.condicao + ')' : '');
                    }
                    const _cor30 = (_a30.grandeza === 'reacoes' || _a30.condicao) ? '#fbbf24' : ec;
                    specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${_cor30};padding:4px 8px;background:${_cor30}18;border-radius:6px">💪 ${window.rotuloPotencialLiberado(_o30)}${_vz30 > 1 ? ' <span style="font-weight:600;color:#9ca3af">(' + _vz30 + 'ª vez)</span>' : ''} — ${_txt30}</div>`;
                }
            }
            // rm_e4: a capacidade vem da contagem de compras (3 na primeira, +3 por
            // recompra). Escala própria do efeito — ver o bloco em hatsu-creator.js.
            if (e.id === 'rm_e4') {
                const _n4 = Math.max(1, (h.efeitos || []).filter(function (id) { return id === 'rm_e4'; }).length);
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">📦 ${3 * _n4} objetos ou criaturas <span style="font-weight:600;color:#9ca3af">— ${_n4} compra${_n4 > 1 ? 's' : ''} × 3, até o dobro do tamanho/peso cada</span></div>`;
            }
            // Poder é Intenção: além de QUAL efeito, mostra EM QUEM ele pousa.
            if (e.id === 'eg6' && sc.eg6) {
                const _d6 = { alvo: 'no alvo (inimigo)', usuario: 'no próprio usuário', hatsu: 'no Hatsu / constructo' };
                const _dest6 = _d6[sc.eg6_destino || 'alvo'] || _d6.alvo;
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🎯 Poder é Intenção: ${sc.eg6} <span style="font-weight:600;color:#9ca3af">— ${_dest6}</span></div>`;
            }
            if (e.id === 'rm_e2') {
                const _rm2Mat = sc[_eCopyIdx > 0 ? `rm_e2#${_eCopyIdx}` : 'rm_e2'];
                if (_rm2Mat) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🧱 Pequeno · ${_rm2Mat} &nbsp;|&nbsp; PV = 5 + CON×2</div>`;
            }
            if (e.id === 'rm_e1') {
                const _t = sc['rm_e1_tipo'];
                specialDetail = _t
                    ? `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🔨 ${_t}${_t === 'Arma' ? ' — concede o dano básico 2d6' : ' — sem dano básico'}</div>`
                    : `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Escolha o que foi forjado: Objeto, Arma ou Equipamento</div>`;
            }
            if (e.id === 'rm_e3' && sc.rm_e3) { specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">✨ Característica: ${sc.rm_e3}</div>`; }
           if (e.id === 'rm_e5' && sc.rm_e5) { const _e5Names = {'ap_partes':'Aparência por Partes','fn_partes':'Funções em Partes','ap_compl':'Aparência Completa','fn_compl':'Funções Completas','ben10':'Ben 10'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🎭 Alteração: ${_e5Names[sc.rm_e5] || sc.rm_e5}</div>`; }
            if (e.id === 're_e17' && sc.re_e17) { const _e17n = {'vidente':'Vidente (Sharingan)','profeta':'Profeta','cego':'Cego de Tebas','joia':'Joia do Tempo','olho':'Olho de Agamoto'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🕧 Previsão: ${_e17n[sc.re_e17] || sc.re_e17}</div>`; }
            if (e.id === 're_e16' && sc.re_e16) { const _e16n = {'ft_raven':'Visões da Raven','ft_cronos':'Cronos','ft_senhor':'Senhor do Tempo','ft_kairos':'Kairós','ft_futuro':'De volta pro Futuro','ft_tictac':'Tic Tac','tv_envelhece':'Envelhecimento/Rejuvenescimento','tv_deterio':'Deteriorar'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">⏱ Tempo: ${_e16n[sc.re_e16] || sc.re_e16}</div>`; }
            if (e.id === 're_e2' && Array.isArray(sc.re_e2) && sc.re_e2.length) {
                const _re2db = [...(window.HATSU_DB.efeitos_gerais||[]), ...Object.values(window.HATSU_DB.categorias||{}).flatMap(c=>c.efeitos||[])];
                const _re2names = sc.re_e2.map(id => { const ef = _re2db.find(e=>e.id===id); return ef ? ef.nome : id; }).join(' + ');
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">⚗ Combinação: ${_re2names}</div>`;
            }
            if (e.id === 'eg17' && sc.eg17) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">⚡ Consequência: ${sc.eg17 === 'Reduz Duração' ? '⏱ −1/3 da duração total' : '🎲 −5 no TR de Concentração'}</div>`;
            if (e.id === 'rt_e4' || e.id === 'rt_e5') {
                const dbCategoria = e.id === 'rt_e4' ? (window.TRANSMUTACAO_DB && window.TRANSMUTACAO_DB.elemental) : (window.TRANSMUTACAO_DB && window.TRANSMUTACAO_DB.versatil);
                const legacyElId = sc[e.id + '_elemento'] || (typeof sc[e.id] === 'string' ? sc[e.id] : '');
                let elementos = Array.isArray(sc[e.id + '_elementos']) ? sc[e.id + '_elementos'] : (legacyElId ? [legacyElId] : []);
                let escolhas = Array.isArray(sc[e.id]) ? sc[e.id] : [];
                // Compatibilidade com formato antigo (escolhas como strings simples, sem elemento associado)
                escolhas = escolhas.map(x => typeof x === 'string' ? { elemento: elementos[0] || '', nome: x } : x);
                if (dbCategoria && elementos.length) {
                    specialDetail = elementos.map(elId => {
                        const db = dbCategoria.find(x => x.id === elId);
                        if (!db) return '';
                        const escolhasDoElemento = escolhas.filter(x => x.elemento === elId).map(x => x.nome);
                        return `<div style="margin-top:6px;padding:6px 10px;background:${db.cor}18;border:1px solid ${db.cor}44;border-radius:8px">
                            <div style="font-size:9px;font-weight:900;color:${db.cor};margin-bottom:2px">${db.icon} ${db.nome}</div>
                            <div style="font-size:8px;color:#9ca3af;margin-bottom:${escolhasDoElemento.length?'6px':'0'}">${db.efeito}</div>
                            ${escolhasDoElemento.map(nome => `<div style="font-size:8px;color:${db.cor};margin-top:2px">✓ ${nome}</div>`).join('')}
                        </div>`;
                    }).join('');
                }
            }
            if (e.id === 'eg1' && sc.eg1) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc.eg1 === 'Área' ? '🔵 Aplicado em Área' : '📐 Aplicado em Alcance'}</div>`;
            // Aumento de Atributo: mostra o atributo escolhido e o teto que ele consome.
            if (e.id === 'ri_e1') {
                const _attr = sc[_eCopyIdx > 0 ? ('ri_e1_attr#' + _eCopyIdx) : 'ri_e1_attr'];
                if (!_attr) {
                    specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Escolha qual atributo aumentar (edite o Hatsu)</div>`;
                } else {
                    const _destinos = [];
                    if (_attr === baseAttrAtk) _destinos.push('teto de Acerto');
                    if (hasCDBlock && _attr === baseAttr) _destinos.push('teto de CD do TR');
                    specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">💪 +2 em ${_attr} (mod. +1)${_destinos.length ? ` &nbsp;|&nbsp; consome ${_destinos.join(' e ')}` : ' &nbsp;|&nbsp; não consome teto (vale para perícias)'}</div>`;
                }
            }
            // Grau de escolha (Intensificação): deixa visível onde o grau caiu.
            if ((window.GRAU_ESCOLHIDO_EFEITOS || {})[e.id]) {
                specialDetail = sc[e.id]
                    ? `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">⚖ Grau aplicado em: ${sc[e.id]}</div>`
                    : `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#f87171;padding:4px 8px;background:#f8717118;border-radius:6px">⚠ Escolha onde aplicar o grau (edite o Hatsu)</div>`;
            }
            if (e.id === 'eg9' && sc.eg9) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#34d399;padding:2px 7px;background:#34d39918;border-radius:5px">🔵 Forma: ${sc.eg9}</div>`;
            const isWrapper  = e.id === 'eg4' || e.id === 'eg6';
            const isWrapped  = !!e._wrapper;
            const pnDisplay  = (e.pn === 0 || isWrapper)
                ? `<span style="font-size:7px;font-weight:900;padding:3px 6px;border-radius:4px;background:#374151;color:#6b7280;letter-spacing:1px">Grátis</span>`
                : `<span style="font-size:7px;font-weight:900;padding:3px 6px;border-radius:4px;background:${costColor}22;color:${costColor};letter-spacing:1px">${e.pn||1} P.N</span>`;
            const wrapBadge  = isWrapped
                ? `<div style="font-size:7px;font-weight:900;color:#6b7280;margin-bottom:4px;letter-spacing:.5px">${e._wrapperLabel}</div>`
                : '';
            const cardBorder = isWrapped ? `border-left:3px solid ${ec}55;padding-left:10px;` : '';
            return `<div style="display:flex;align-items:flex-start;gap:10px;background:#0d1117;border-radius:10px;padding:12px;border:2px solid ${ec}22;margin-bottom:8px;${isWrapped?'margin-left:12px;':''}">
                <div style="flex-shrink:0;margin-top:2px">${pnDisplay}</div>
                <div style="flex:1;${cardBorder}">
                    ${wrapBadge}
                    <div style="font-size:11px;font-weight:700;color:${ec};margin-bottom:3px">${e.nome}</div>
                    <div style="font-size:9px;color:#6b7280;line-height:1.5;margin-bottom:4px">${e.desc}</div>
                    <div style="font-size:8px;color:#374151;font-style:italic">Req: ${e.req||'—'}</div>
                    ${specialDetail}
                </div>
            </div>`;
          }).join('')
        : `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhum efeito selecionado.</div>`;

    // ── Interruptor Modo A / Modo B ───────────────────────────────────────────────
    // Só aparece em Hatsus que compraram o Efeito Alternativo (eg4) e já escolheram o
    // efeito do modo B. Trocar de modo recalcula dano, TR e custo de aura, porque o
    // efeito alternativo entra ou sai de efeitosSel lá em cima.
    const _switchModoHtml = _temModos
        ? `<div style="margin-bottom:12px">
                <div style="display:flex;gap:4px;background:#0d1117;border:1px solid ${tc}33;border-radius:10px;padding:4px;flex-wrap:wrap">
                    ${_modos.map((m, i) => `<button onclick="event.stopPropagation();window._hSetModoAtivo(${idx},${i})"
                        style="flex:1;min-width:70px;padding:9px 6px;border-radius:8px;border:none;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:900;font-size:8px;text-transform:uppercase;letter-spacing:1px;background:${i === _modoIdx ? tc : 'transparent'};color:${i === _modoIdx ? '#000' : '#6b7280'}">
                        Modo ${m.letra}${m.nome ? ` — ${m.nome}` : (m.raiz ? ' — Raiz' : '')}
                    </button>`).join('')}
                </div>
                ${!_modo.raiz ? `<div style="margin-top:6px;background:#060d1a;border:1px solid ${tc}33;border-radius:8px;padding:8px;font-size:8px;line-height:1.6">
                    ${_modo.adicionado ? `<div style="color:#4ade80;font-weight:700">+ ${_nomeEfeitoEg4(_modo.adicionado)}</div>` : ''}
                    ${_modo.removido ? `<div style="color:#f87171;font-weight:700">− ${_nomeEfeitoEg4(_modo.removido)}</div>` : ''}
                    ${(_modo.restrOff || []).length ? `<div style="color:#fb923c;font-weight:700;margin-top:2px">Restrições desligadas: ${_modo.restrOff.map(_nomeRestrEg4).join(', ')}</div>` : ''}
                    ${(_modo.restrAdd || []).length ? `<div style="color:#4ade80;font-weight:700;margin-top:2px">Restrições só deste modo: ${_modo.restrAdd.map(_nomeRestrEg4).join(', ')}</div>` : ''}
                </div>` : ''}
            </div>`
        : '';

    // ── Seção 5 Graus do 1º Hatsu ─────────────────────────────────────────────
   const _PH_LABELS = {
        acerto:    { icon:'⚔️', label:'Acerto',           desc:'+1 ataque' },
        atributos: { icon:'💪', label:'Atributos',         desc:'+1 atrib./perícia' },
        dano:      { icon:'🔥', label:'Dano',              desc:'+1 passo de dano' },
        alcance:   { icon:'📐', label:'Alcance',           desc:'+1,5m por grau' },
        area:      { icon:'🔵', label:'Área',              desc:'+1,5m por grau' },
        duracao:   { icon:'⏱',  label:'Duração',           desc:'+1 rodada' },
        cd:        { icon:'🎯', label:'CD do TR',          desc:'+1 CD' },
        alvos:     { icon:'👥', label:'Nº de Alvos',       desc:'+1 alvo' },
        custo:     { icon:'💨', label:'Redução de Custo',  desc:'-5% custo' },
    };
    let primeiroHatsuSection = '';
    if (idx === 0) {
        const _phg = h.primeiroHatsuGraus;
        const _phgEntries = _phg ? Object.entries(_phg).filter(([,v]) => v > 0) : [];
        const _phgRows = _phgEntries.length > 0
            ? _phgEntries.map(([k,v]) => {
                const info = _PH_LABELS[k] || { icon:'⭐', label:k, desc:'' };
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1f2937">
                    <span style="font-size:9px;color:#9ca3af">${info.icon} ${info.label} <span style="font-size:8px;color:#4b5563">(${info.desc})</span></span>
                    <span style="font-size:11px;font-weight:900;color:${tc}">+${v}</span>
                </div>`;
              }).join('')
            : `<div style="font-size:9px;color:#4b5563;text-align:center;padding:6px 0">Graus ainda não distribuídos.</div>`;
        const _phgLocked = !!_phg && !state.isAdmin;
        const _phgBtnHtml = _phg
            ? (_phgLocked
                ? `<span style="font-size:8px;padding:4px 10px;border-radius:8px;background:#1f2937;border:1px solid #374151;color:#4b5563;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">🔒 Bloqueado</span>`
                : `<button onclick="window._openPrimeiroHatsuModal()" style="font-size:8px;padding:4px 10px;border-radius:8px;background:#f9731622;border:1px solid #f9731655;color:#fb923c;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">⚙️ Editar (Admin)</button>`)
            : `<button onclick="window._openPrimeiroHatsuModal()" style="font-size:8px;padding:4px 10px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">🪨 Distribuir</button>`;
        primeiroHatsuSection = `
        <div style="background:#0d1117;border:2px solid ${tc}33;border-radius:12px;padding:14px;margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:8px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px">⭐ 5 Graus do 1º Hatsu</div>
                ${_phgBtnHtml}
            </div>
            ${_phgRows}
        </div>`;
    }

    // ── Seção Grau Variável (X) — restrições cujo valor só é decidido no momento do uso ──────────
    const VARIAVEL_X_RESTR = {
        'rg_v1':  { nome: 'Canalizar Rodadas em Zetsu' },
        'rg_v6':  { nome: 'Exposição Desnecessária' },
        'rg_v10': { nome: 'Zetsu por Falha', caracteristicasFixas: ['alcance', 'area'] },
    };
    const CARACT_LABELS_VARX = { dano:'🔥 Dano/Cura', alcance:'📏 Alcance', area:'🔵 Área', duracao:'⏱️ Duração', acerto:'⚔️ Acerto', cd:'🎯 CD do TR' };
    let grauVariavelSection = '';
    const _varXPresentes = Object.keys(VARIAVEL_X_RESTR).filter(id => (h.restricoes||[]).includes(id));
    if (_varXPresentes.length > 0) {
        const _caractsPermitidas = (window.CATEGORIA_CARACTERISTICAS_GRAU && window.CATEGORIA_CARACTERISTICAS_GRAU[h.classe||char.class]) || Object.keys(CARACT_LABELS_VARX);
        const _varXRows = _varXPresentes.map(rid => {
            const info = VARIAVEL_X_RESTR[rid];
            const opts = info.caracteristicasFixas || _caractsPermitidas;
            const optsHtml = opts.map(k => `<option value="${k}">${CARACT_LABELS_VARX[k]||k}</option>`).join('');
            return `<div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:10px;margin-bottom:8px">
                <div style="font-size:9px;font-weight:700;color:#e5e7eb;margin-bottom:6px">🎲 ${info.nome}</div>
                <div style="display:flex;gap:6px;margin-bottom:6px">
                    <input id="gv-${rid}-x" type="number" min="0" placeholder="X" oninput="window._hCalcGrauVariavel(${idx},'${rid}')"
                        style="width:64px;background:#060d1a;border:1.5px solid #374151;border-radius:8px;padding:6px;color:#fff;font-family:'Orbitron',sans-serif;font-weight:900;text-align:center;outline:none">
                    <select id="gv-${rid}-car" onchange="window._hCalcGrauVariavel(${idx},'${rid}')"
                        style="flex:1;background:#060d1a;border:1.5px solid #374151;border-radius:8px;padding:6px;color:#d1d5db;font-size:10px;outline:none">
                        ${optsHtml}
                    </select>
                </div>
                <div id="gv-${rid}-res" style="font-size:9px;color:#6b7280">Informe X e a característica para calcular.</div>
            </div>`;
        }).join('');
        grauVariavelSection = `
        <div style="background:#0d1117;border:2px solid #c084fc33;border-radius:12px;padding:14px;margin-bottom:20px">
            <div style="font-size:8px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">🎲 Grau Variável (X) — calculadora de uso</div>
            <div style="font-size:8px;color:#6b7280;margin-bottom:10px;line-height:1.5">Estas restrições têm um valor de X decidido só no momento do uso. Ao rolar este Hatsu, informe X e onde está aplicando para conferir se respeita o limite de Grau de Potência do seu nível — o cálculo abaixo não é salvo, é só para conferência na hora.</div>
            ${_varXRows}
        </div>`;
    }

    // ── Faixa de Ativar Hatsu / contador de rodada ──────────────────────────────
    // Piscando quando desligado, no mesmo padrão do aviso de armazenamento da lista.
    // Ativado, mostra as rodadas restantes e o botão de passar rodada — que é global:
    // desconta de todos os Hatsus e Princípios ativos de uma vez.
    const _ativoH = ((char.hatsusAtivos || {})[idx]) || null;
    const _barraAtivarHtml = (function () {
        if (!_ativoH) {
            const rod = _duracaoInfo.constante ? 'null' : (_duracaoInfo.rodadas || 0);
            // Vida ou Morte: o botão fica vermelho e travado até PV ou Sanidade cair
            // abaixo de 10%. A verificação é automática, sem o jogador declarar nada.
            const _vm = window.hatsuVidaOuMorte ? window.hatsuVidaOuMorte(h, char) : { exige: false, liberado: true, motivo: '' };
            if (_vm.exige && !_vm.liberado) {
                return `<div style="margin:0 16px 12px;background:#7f1d1d22;border:1px solid #ef444455;border-radius:12px;padding:11px 13px;display:flex;align-items:center;gap:10px">
                    <div style="flex:1;min-width:0">
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:#f87171;text-transform:uppercase;letter-spacing:1px">🩸 Vida ou Morte</div>
                        <div style="font-size:9px;color:#9ca3af;margin-top:2px">${_vm.motivo}</div>
                    </div>
                    <button disabled style="flex-shrink:0;padding:9px 14px;border-radius:9px;background:#374151;border:none;color:#6b7280;font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:not-allowed">Travado</button>
                </div>`;
            }
            return `<div class="aviso-tag-piscando" style="margin:0 16px 12px;background:${tc}15;border:1px solid ${tc}55;border-radius:12px;padding:11px 13px;display:flex;align-items:center;gap:10px">
                <div style="flex:1;min-width:0">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:${tc};text-transform:uppercase;letter-spacing:1px">Hatsu desativado</div>
                    <div style="font-size:9px;color:#6b7280;margin-top:2px">Duração: ${_duracaoInfo.texto}${_duracaoInfo.nota ? ' — ' + _duracaoInfo.nota : ''}</div>
                </div>
                <button onclick="window._abrirAtivacaoHatsu(${idx}, ${rod}, ${_duracaoInfo.constante})" style="flex-shrink:0;padding:9px 14px;border-radius:9px;background:${tc};border:none;color:#000;font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:1px;cursor:pointer">⚡ Ativar</button>
            </div>`;
        }
        const restante = _ativoH.constante ? null : (_ativoH.rodadas || 0);
        return `<div style="margin:0 16px 12px;background:#4ade8015;border:1px solid #4ade8055;border-radius:12px;padding:11px 13px">
            <div style="display:flex;align-items:center;gap:10px">
                <div style="flex:1;min-width:0">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:#4ade80;text-transform:uppercase;letter-spacing:1px">⚡ Hatsu ativo</div>
                    <div style="font-size:9px;color:#6b7280;margin-top:2px">${_ativoH.constante
                        ? _duracaoInfo.texto + (_duracaoInfo.nota ? ' — ' + _duracaoInfo.nota : '')
                        : 'Restam <b style="color:#4ade80">' + restante + '</b> de ' + _ativoH.max + ' rodada(s)'}</div>
                </div>
                <button onclick="window._desativarHatsu(${idx})" style="flex-shrink:0;padding:7px 11px;border-radius:8px;background:transparent;border:1px solid #4ade8055;color:#4ade80;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">Desligar</button>
            </div>
            ${!_ativoH.constante ? `<button onclick="window._passarRodada()" style="width:100%;margin-top:9px;padding:9px;border-radius:9px;background:#4ade8022;border:1px solid #4ade8066;color:#4ade80;font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:1px;cursor:pointer">⏭ Passar rodada${char.rodadaAtual ? ' (rodada ' + char.rodadaAtual + ')' : ''}</button>
            <div style="font-size:8px;color:#4b5563;margin-top:5px;text-align:center">Passar rodada desconta de TODOS os Hatsus e Princípios ativos.</div>` : ''}
        </div>`;
    })();

    container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;background:#030712;color:#d1d5db;font-family:'Rajdhani',sans-serif">
        <!-- HEADER -->
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            <button onclick="state.view='SHEET';state.activeTab='NEN';render()"
                style="flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#111827;border:1px solid #1f2937;cursor:pointer;color:#9ca3af;font-size:16px;font-weight:900">←</button>
            <div style="flex:1;min-width:0">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:${tc};text-transform:uppercase;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.nome||'Hatsu'}</div>
                <div style="font-size:8px;color:#4b5563;margin-top:1px">${h.classe||char.class} · ${tipoNames[h.tipo]||'—'} · Nível ${h.nivel||'?'}</div>
            </div>
            <button onclick="openHatsuEdit(${idx})"
                style="flex-shrink:0;padding:7px 14px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">✏️ Editar</button>
        </div>

        <!-- CONTEÚDO SCROLLÁVEL -->
        <div style="flex:1;overflow-y:auto;padding:16px 0" class="custom-scrollbar hatsu-scroll-area">
            ${_barraAtivarHtml}
            <div style="padding:0 16px">

            <!-- Card principal -->
            <div style="text-align:center;padding:20px 16px;border-radius:16px;border:2px solid ${tc};background:${tc}08;margin-bottom:16px">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:${tc};text-transform:uppercase;letter-spacing:2px;line-height:1.2;margin-bottom:6px">${h.nome||'SEM NOME'}</div>
                <div style="display:inline-flex;align-items:center;gap:6px;background:#ffffff08;border-radius:20px;padding:5px 12px;margin-bottom:${h.descricao?'12px':'0'}">
                    <span style="font-size:14px">${tipoIcons[h.tipo]||'✦'}</span>
                    <span style="font-size:10px;font-weight:700;color:#d1d5db">${tipoNames[h.tipo]||'—'}</span>
                </div>
                ${h.descricao?`<div style="font-size:10px;color:#6b7280;font-style:italic;line-height:1.6;margin-top:8px;padding:0 8px">"${h.descricao}"</div>`:''}
            </div>

            <!-- Stats rápidos -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
                <div style="background:#0d1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Nível</div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#fff">${h.nivel||'?'}</div>
                </div>
                <div style="background:#0d1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N</div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#fff">${h.pnUsados||0}<span style="font-size:8px;color:#374151">/${pnMax}</span></div>
                </div>
                <div style="background:#0d1117;border:1px solid ${tc}33;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Efeitos</div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:${tc}">${efeitosSel.length}</div>
                </div>
                <div style="background:#0d1117;border:1px solid #ef444433;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Restr.</div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#ef4444">${restricoesSel.length}</div>
                </div>
            </div>

            <!-- Mecânicas base -->
            <div style="background:#0d1117;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:20px">
                <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">⚙ Mecânicas Base</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Ativação</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">Ação Principal</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Custo Base</div>
                        <div style="font-size:10px;font-weight:600">${(() => { const _ac = window.calcHatsuAuraCostFinal(h, idx, { restricoes: restricoesSel.map(function(r){return r.id;}), efeitos: efeitosSel.map(function(e){return e.id;}) }); const color = _ac.reduced ? '#4ade80' : '#d1d5db'; const extra = _ac.phgCusto > 0 ? ` <span style="font-size:8px;color:#4b5563">(−${_ac.phgCusto*5}% 1º Hatsu)</span>` : ''; return '<span style="color:'+color+'">' + _ac.pct + '% de Aura' + (_ac.reduced?' ✓':'') + '</span>' + extra; })()}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Alcance</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">Pessoal / Toque</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Duração</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">${_duracaoInfo.texto}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Categoria</div>
                        <div style="font-size:10px;font-weight:700;color:${tc}">${h.classe||char.class}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Criado em</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">${h.criadoEm||'—'}</div>
                    </div>
                </div>
                ${calcDanoHtml}
                ${marcasHtml}
                ${sanidadeAlvoHtml}
                ${ilusaoToggleHtml}
                ${calcCDHtml}
                ${ataqueToggleHtml}
                ${calcRangeDurHtml}
            </div>

            ${constructoCardHtml}
            ${copiaPerfeitaHtml}

            ${primeiroHatsuSection}
            ${grauVariavelSection}

            <!-- Restrições -->
            <div style="margin-bottom:20px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <span style="font-size:14px">⛓</span>
                    <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">Restrições</span>
                    <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:#ef444422;color:#f87171">${restricoesSel.length}</span>
                </div>
                ${rHtml}
            </div>

            <!-- Efeitos -->
            <div style="margin-bottom:24px">
                ${_switchModoHtml}
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <span style="font-size:14px">⚡</span>
                    <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">Efeitos</span>
                    <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:${tc}22;color:${tc}">${efeitosSel.length}</span>
                </div>
                ${eHtml}
            </div>
            </div>

        </div>

        <!-- RODAPÉ -->
        <div style="padding:12px 14px;border-top:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            ${hasBaseDmg ? (() => {
                // Anexo de imagem/gif do Hatsu — fica ANTES do botão de rolar, guardado no próprio
                // Hatsu (h.attachImage, salvo com o personagem) para que cada Hatsu tenha a sua
                // própria imagem em vez de compartilhar uma imagem global entre todos.
                const _hImgVal = h.attachImage || '';
                const _hIsDataImg = /^data:image\//i.test(_hImgVal);
                return `<div style="margin-bottom:10px">
                    <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;text-align:center">🖼️ Imagem/GIF (opcional)</div>
                    <div style="display:flex;gap:6px;align-items:center">
                        <input id="hatsu-attach-image-input" type="text" value="${_hIsDataImg ? '' : _hImgVal.replace(/"/g, '&quot;')}" placeholder="Cole um link (ex: GIF do Tenor/Giphy)..." oninput="window._hSetHatsuAttachImage(${idx},this.value)" onchange="saveCharacter(state.currentChar);render(true)" style="flex:1;min-width:0;background:#111827;border:1px solid #374151;border-radius:8px;padding:9px 10px;color:#fff;font-size:10px;box-sizing:border-box;outline:none" />
                        <label title="Enviar arquivo de imagem" style="padding:9px 10px;border-radius:8px;border:2px solid #374151;background:transparent;color:#9ca3af;cursor:pointer;font-size:13px;line-height:1;flex-shrink:0">📎<input type="file" accept="image/*" style="display:none" onchange="window._hUploadHatsuAttachImage(${idx},this)" /></label>
                    </div>
                    ${_hImgVal ? `<div style="margin-top:8px;display:flex;align-items:center;gap:8px">
                        <img src="${_hImgVal.replace(/"/g, '&quot;')}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;border:1px solid #374151" onerror="this.style.display='none'" />
                        <span style="font-size:9px;color:#4b5563">${_hIsDataImg ? 'Arquivo anexado' : 'Link anexado'}</span>
                        <button onclick="window._hClearHatsuAttachImage(${idx})" style="font-size:9px;color:#f87171;background:transparent;border:none;cursor:pointer;text-decoration:underline;margin-left:auto">remover</button>
                    </div>` : ''}
                </div>`;
            })() : ''}
            ${(function () {
                // Resposta guardada do RYU. Aparece só depois que o jogador respondeu
                // uma vez, para ele conferir e trocar sem precisar refazer o Hatsu.
                const _re = h.ryuEntrega;
                if (!_re) return '';
                const _rot = _re === (window.RYU_ENTREGA_DESARMADO || 'desarmado')
                    ? '✊ Desarmado'
                    : (_re === (window.RYU_ENTREGA_NENHUM || 'nenhum')
                        ? 'À distância — o RYU não entra neste Hatsu'
                        : '⚔️ ' + _re);
                return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:7px 10px;border-radius:9px;background:#38bdf810;border:1px solid #38bdf833">
                    <span style="flex-shrink:0;font-family:'Orbitron',sans-serif;font-size:8px;color:#38bdf8;font-weight:900;text-transform:uppercase;letter-spacing:1px">RYU</span>
                    <span style="flex:1;font-size:9px;color:#9ca3af">${_rot}</span>
                    <button onclick="window._trocarRyuEntrega(${idx})" style="flex-shrink:0;font-size:9px;color:#38bdf8;background:transparent;border:none;cursor:pointer;text-decoration:underline">trocar</button>
                </div>`;
            })()}
            ${hasBaseDmg ? `<button onclick="openRollModeModal('hatsu')"
                style="width:100%;margin-bottom:8px;padding:13px;border-radius:10px;background:#22c55e22;border:2px solid #22c55e66;color:#22c55e;font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 16px #22c55e22">🎲 Rolar Hatsu no Discord</button>` : ''}
            <div style="display:flex;gap:8px">
                <button onclick="state.view='SHEET';state.activeTab='NEN';render()"
                    style="flex:1;padding:12px;border-radius:10px;background:#111827;border:1px solid #1f2937;color:#9ca3af;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">← Voltar</button>
                <button onclick="deleteHatsuConfirm(${idx},'sheet')"
                    style="padding:12px 14px;border-radius:10px;background:#7f1d1d44;border:1px solid #ef444455;color:#f87171;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">🗑️</button>
                <button onclick="openHatsuEdit(${idx})"
                    style="flex:1;padding:12px;border-radius:10px;background:${tc};color:#000;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;border:none;box-shadow:0 0 16px ${tc}55">✏️ Editar</button>
            </div>
        </div>
        ${renderRollModeModalHtml()}
        ${renderRenPromptModalHtml()}
        ${renderRyuEntregaModalHtml()}
    </div>`;

    if (window.lucide) lucide.createIcons();
}

