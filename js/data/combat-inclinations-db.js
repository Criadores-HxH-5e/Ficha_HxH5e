// ── Inclinações de Combate (Manual v2.0, cap. 4) ─────────────────────────────
// Reescrito a partir do capítulo atualizado. Três mudanças estruturais em relação
// à versão anterior deste arquivo:
//
// 1. Os textos dos três níveis passaram a ser os do livro. A versão antiga tinha
//    uma redação própria, resumida, que já divergia da regra em vários pontos.
// 2. Os acréscimos "Com aura" ganharam campo próprio (aura[]), em vez de ficarem
//    fundidos no texto do nível ou simplesmente ausentes. "Em vez disso" no texto
//    indica que o acréscimo SUBSTITUI o efeito comum.
// 3. Os bônus de Maestria foram corrigidos: o livro dá +1 em atributo (muitas
//    entradas aqui diziam +2) e usa "ou" (escolha) onde havia "e" (fixo).
//    Isso muda fichas já existentes — ver COMBAT_INC_ATTR_LEGADO e a migração
//    migrarBonusMaestria() em sheet.js, que desfaz o bônus antigo antes de
//    aplicar o novo.
//
// CAR do livro = PRE (Presença) na ficha, que é o nome do atributo no app.
// Nomenclatura dos níveis: tiers[0] = Básico (1 ponto), tiers[1] = Intermediário,
// tiers[2] = Maestria. O custo segue 1 Ponto de Inclinação por nível.

// auraEtq: o princípio exigido POR NÍVEL. Cada nível de uma inclinação usa o princípio
// do seu próprio bloco "Com aura", e não o da inclinação inteira — Defensiva Precisa pede
// TEN no Básico e SHU no Intermediário. Então o jogador que só tem TEN compra o Básico e
// fica travado no Intermediário, em vez de a inclinação toda liberar ou travar junto.
// null = nível sem princípio exigido (as Maestrias, que são só +1 em atributo).
// Lista com mais de um = qualquer um deles serve (o livro escreve "REN/GYO").
//
// Nome dos três níveis, na redação do livro. O app mostrava "Tier 1/2/3", que não
// existe em lugar nenhum da regra.
window.CI_NIVEL_NOME = ['Básico', 'Intermediário', 'Maestria'];

window.COMBAT_INCLINATIONS_DB = [
  {
    id: 'analitica',
    auraEtq: [['GYO'], ['GYO'], null],
    nome: 'Analítica',
    etiquetas: ['GYO'],
    tiers: [
      '+2 no total de Reações.',
      'Gaste 1 Reação do total para somar +2 no acerto do próximo ataque (1x por rodada).',
      '+1 em INT ou SAB.'
    ],
    aura: [
      'GYO nos olhos: você vê quais princípios e técnicas um alvo mantém ativos e onde ele concentra a aura. Sua próxima Reação contra um ataque desse alvo tem resultado +2 mesmo com GYO nos olhos.',
      'GYO: o bônus adicionado por GYO adiciona o nível do personagem e também vale no dano.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'INT', valor: 1 }, { attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'arsenal_militar',
    auraEtq: [null, null, null],
    nome: 'Arsenal Militar',
    tiers: [
      'Acesso a armas científicas simples.',
      'Acesso a armas científicas complexas.',
      'Acesso a armas científicas especiais e de cerco.'
    ]
  },
  {
    id: 'cirurgica',
    auraEtq: [['KO'], ['KO'], null],
    nome: 'Cirúrgica',
    etiquetas: ['KO'],
    tiers: [
      'Seus golpes mirados têm 2 a menos de penalidade no acerto: −1 nos simples, −3 nos precisos e −5 na cabeça.',
      'Quando um golpe mirado seu acertar, escolha dois desdobramentos da mesma lista, em vez de um (por exemplo, desarmar e derrubar).',
      '+1 em DES ou SAB.'
    ],
    aura: [
      'KO: o alvo tem desvantagem no Bloqueio contra um golpe mirado com KO.',
      'KO: um golpe mirado com KO não sofre penalidade no acerto, como uma arma com SHU.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'combate_montado',
    auraEtq: [['SHU'], null, null],
    nome: 'Combate Montado',
    etiquetas: ['SHU'],
    tiers: [
      'Montado ou pilotando, você tem vantagem em ataques corpo a corpo contra alvos a pé ao menos um tamanho menores que seu veículo ou montaria.',
      'Com sua Reação, redirecione para você um ataque contra a montaria ou o veículo, ou o contrário. O atacante rola de novo se o alvo mudar.',
      'O veículo ou a montaria conduzidos por você ganham +2 na CA ou no dano.'
    ],
    aura: [
      'SHU no seu veículo/montaria custa 10%, qualquer que seja o tamanho.',
      null,
      null
    ]
  },
  {
    id: 'conjurador_de_guerra',
    auraEtq: [['HATSU'], ['IN'], null],
    nome: 'Conjurador de Guerra',
    etiquetas: ['HATSU', 'IN'],
    tiers: [
      'Vantagem em TR de CON para manter a concentração de uma conjuração ao sofrer dano. Se já tiver essa vantagem, some +2 grau/passo de duração (respeitando o teto).',
      'Aplique IN em suas conjurações como ação livre, sem gastar Ação Bônus, ou pela metade da aura.',
      '+1 em INT.'
    ],
    attrBonus: { fixo: [{ attr: 'INT', valor: 1 }] }
  },
  {
    id: 'decisiva',
    auraEtq: [['KO'], ['KO'], null],
    nome: 'Decisiva',
    etiquetas: ['KO'],
    tiers: [
      'Ao utilizar uma ação protagonista, o ataque ganha +2 no acerto e +1 grau de dano (se acertar).',
      'Se o ataque decisivo errar, você recupera uma Reação.',
      '+1 em FOR ou DES.'
    ],
    aura: [
      'KO: o ataque decisivo da ação protagonista pode receber KO sem gastar a Ação Bônus. Pague só a aura.',
      'KO: se o ataque decisivo com KO acertar, sua CA volta ao normal no fim do seu turno, em vez de no início do próximo.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'FOR', valor: 1 }, { attr: 'DES', valor: 1 }] }
  },
  {
    id: 'defensiva_bruta',
    auraEtq: [['TEN'], ['TEN'], null],
    nome: 'Defensiva Bruta',
    etiquetas: ['TEN'],
    tiers: [
      '+2 no Bloqueio Desarmado.',
      'Se o Bloqueio falhar por 3 ou menos (empate incluso), adicione +1 no próximo bloqueio (acumulativo enquanto falhar sequencialmente).',
      '+1 em CON.'
    ],
    aura: [
      'TEN: adicione +2 RD ao sofrer dano bloqueando, além da RD padrão de TEN.',
      'TEN: se o Bloqueio falhar com TEN ativo, some sua CON na RD do TEN contra esse golpe. Aplique a RD antes de dividir o dano.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'CON', valor: 1 }] }
  },
  {
    id: 'defensiva_precisa',
    auraEtq: [['TEN'], ['SHU'], null],
    nome: 'Defensiva Precisa',
    etiquetas: ['TEN', 'SHU'],
    tiers: [
      'No seu turno, sem gastar ação (mas declarando ao mestre), escolha um oponente como alvo marcado (até trocar). Contra ele, você tem +1 na CA.',
      '+2 no resultado final do Bloqueio Armado.',
      '+1 em CON.'
    ],
    aura: [
      'TEN: contra golpes do alvo marcado, seu TEN tem +2 de RD além da RD padrão de TEN.',
      'SHU: com SHU na arma, some também o bônus de CA do SHU no Bloqueio Armado.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'CON', valor: 1 }] }
  },
  {
    id: 'defensiva_reativa_agil',
    auraEtq: [['EN'], ['ZETSU'], null],
    nome: 'Defensiva Reativa-Ágil',
    etiquetas: ['EN', 'ZETSU'],
    tiers: [
      'Se sua Esquiva ou Bloqueio superar o ataque por 5 ou mais, a Reação não sai do seu total.',
      'Some o dobro da proficiência na Esquiva Acrobática.',
      '+1 em CON ou DES.'
    ],
    aura: [
      'EN: com EN ativo, você é imune a desprevenido e pode Esquivar de ataques "que não vê", se o atacante estiver dentro da área.',
      'ZETSU: ao Esquivar com sucesso, ative Zetsu na mesma Reação e receba o benefício no início do seu turno (sem completar uma rodada inteira).',
      null
    ],
    attrBonus: { escolha: [{ attr: 'CON', valor: 1 }, { attr: 'DES', valor: 1 }] }
  },
  {
    id: 'experiente',
    auraEtq: [['ZETSU'], ['GYO'], null],
    nome: 'Experiente',
    etiquetas: ['ZETSU', 'GYO'],
    tiers: [
      'Com a Ação Principal (1x por rodada), registre uma das características de combate de um inimigo que você já tenha enfrentado/sofrido diretamente: ataques, danos, efeitos, testes, TR, CA etc. Com o Antecedente Cientista/Técnico, use a Ação Bônus. (Acumulativo em novas ações.)',
      'Some 1d6 (+prof, se ainda não somar) em todos os aspectos analisados de um inimigo que já enfrentou.',
      'Escolha uma: dobra a proficiência do benefício intermediário; ou analisa +1 inimigo numa rodada de análise; ou fica imune a Intimidação e Enganação/Prestidigitação de alvos analisados durante a batalha.'
    ],
    aura: [
      'ZETSU: em Zetsu e sem o alvo ter percebido você, a análise custa um grau/passo de tempo de ação a menos: Principal vira Bônus, Bônus vira Reação.',
      'GYO: com GYO nos olhos, a análise também revela quanto de aura (%) ele ainda tem.',
      null
    ]
  },
  {
    id: 'fluida',
    auraEtq: [['RYU'], ['RYU'], null],
    nome: 'Fluida',
    etiquetas: ['RYU'],
    tiers: [
      'Quando seu Contra-ataque superar o ataque inimigo por 5 ou mais, ele custa sua próxima Ação Bônus, em vez da próxima Ação Principal.',
      'No início do seu turno, troque até 2 pontos entre seu acerto e sua CA até o início do próximo turno (ex.: +2 no acerto e −2 na CA, ou o contrário).',
      '+1 em DES ou SAB.'
    ],
    aura: [
      'RYU: com RYU ativo, um Contra-ataque que superar o ataque por 5 ou mais também não sai do total de Reações.',
      'RYU: com RYU ativo, você também pode trocar até 2 pontos entre o bônus de CA e o de ataque e dano da linha do RYU desse turno. Para a regra de não repetir linhas, vale a linha original.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'guardia',
    auraEtq: [['KEN'], ['KEN'], null],
    nome: 'Guardiã',
    etiquetas: ['KEN'],
    tiers: [
      'Você pode Assumir Lugar de um aliado a até 3 m, não só adjacente: mova-se até ele nessa distância como parte da Reação, sem provocar Ataque de Oportunidade.',
      'Quando você Assumir Lugar, o atacante tem −2 para atingir qualquer alvo que não seja você até o fim do próximo turno dele (como uma evolução de Provocar).',
      '+1 em CON ou SAB.'
    ],
    aura: [
      'KEN: ative KEN na mesma Reação do Assumir Lugar, pagando a aura e as Reações do total do KEN. A CA dobrada já vale para o teste.',
      'KEN: com KEN ativo, Assumir Lugar faz você perder a próxima Ação Bônus, em vez da próxima Ação Principal.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'CON', valor: 1 }, { attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'imobilizador',
    auraEtq: [['REN', 'GYO'], ['REN'], null],
    nome: 'Imobilizador',
    etiquetas: ['REN', 'GYO'],
    req: 'FOR 16+',
    tiers: [
      'Agarrar é um ataque contra a CA, em vez de teste contestado. Se sua raça já agarra contra a CA, some +2 nesse ataque.',
      'Use sua Reação para agarrar de novo um alvo que escapou de você, com nova rolagem.',
      '+1 em FOR.'
    ],
    aura: [
      'REN/GYO: se você ativar REN/GYO enquanto agarrado, o alvo tem desvantagem nos testes para escapar enquanto o princípio/técnica durar.',
      'REN: gastar REN para atacar um alvo agarrado adiciona +2 graus/passos de dano, no lugar de 1 no ataque.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'FOR', valor: 1 }] }
  },
  {
    id: 'inabalavel',
    auraEtq: [['KEN'], ['KEN'], null],
    nome: 'Inabalável',
    etiquetas: ['KEN'],
    tiers: [
      'Vantagem nos TR e testes para não ficar Empurrado/Puxado, Caído ou Esmagado.',
      'Na primeira vez em cada combate que seus PV caírem abaixo da metade, recupere Reações do total igual à sua CON (mínimo 1, sem passar do máximo).',
      '+1 em CON ou FOR.'
    ],
    aura: [
      'KEN: com KEN ativo, você é imune a Empurrado/Puxado, Caído e Esmagado.',
      'KEN: ative KEN como ação livre. Pague a aura e as Reações do total normalmente, mas sem depender do tempo de ativação (Ação Bônus ou Reações).',
      null
    ],
    attrBonus: { escolha: [{ attr: 'CON', valor: 1 }, { attr: 'FOR', valor: 1 }] }
  },
  {
    id: 'investida_poderosa',
    auraEtq: [['REN'], ['REN'], null],
    nome: 'Investida Poderosa',
    etiquetas: ['REN'],
    req: 'FOR 16+',
    tiers: [
      'Ao usar Disparada e mover ao menos 6 m em linha reta até o alvo, use a Ação Bônus para um ataque corpo a corpo com arma ou para empurrá-lo.',
      'Se o ataque ou o empurrão da Ação Bônus acertar, escolha: empurre o alvo até 4 m ou some +5 no dano.',
      '+1 em FOR.'
    ],
    aura: [
      'REN: esse ataque pode receber REN na mesma Ação Bônus.',
      'REN: se o ataque teve REN, aplique os dois efeitos.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'FOR', valor: 1 }] }
  },
  {
    id: 'maestria_armadura_media',
    auraEtq: [['SHU'], null, null],
    nome: 'Maestria em Armadura Média',
    etiquetas: ['SHU'],
    req: 'Prof. em Armadura Média',
    tiers: [
      'Vestir armadura média não impõe desvantagem, prejuízo ou limitação.',
      'Some até 4 de DES na CA, em vez do máximo 3.',
      '+2 na durabilidade da armadura média.'
    ],
    aura: [
      'SHU na armadura vestida custa 10%, qualquer que seja o tamanho.',
      null,
      null
    ]
  },
  {
    id: 'maestria_armadura_pesada',
    auraEtq: [['SHU'], null, null],
    nome: 'Maestria em Armadura Pesada',
    etiquetas: ['SHU'],
    req: 'Prof. em Armadura Pesada',
    tiers: [
      '+2 na CA da armadura.',
      'Acertos que igualam sua CA sofrem RD 3.',
      '+2 na durabilidade da armadura pesada.'
    ],
    aura: [
      'SHU na armadura vestida custa 10%, qualquer que seja o tamanho.',
      null,
      null
    ]
  },
  {
    id: 'mestre_de_armas',
    auraEtq: [['SHU'], ['SHU'], null],
    nome: 'Mestre de Armas',
    etiquetas: ['SHU'],
    tiers: [
      'Proficiência com qualquer arma.',
      'Qualquer item em sua posse vira arma com dano mínimo 1d8, e você é imune a ser desarmado.',
      '+1 em FOR ou DES.'
    ],
    aura: [
      'SHU em uma arma que você empunha custa 5%, em vez de 10%.',
      'SHU: um item improvisado com SHU ganha +1 grau de dano.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'FOR', valor: 1 }, { attr: 'DES', valor: 1 }] }
  },
  {
    id: 'mestre_de_armas_grandes',
    auraEtq: [['REN'], ['GYO'], null],
    nome: 'Mestre de Armas Grandes',
    etiquetas: ['REN', 'GYO'],
    req: 'FOR 16+',
    tiers: [
      'No seu turno, ao acertar um crítico com arma corpo a corpo ou levar uma criatura a 0 PV, faça um ataque corpo a corpo adicional com a Ação Bônus.',
      'Antes de atacar com arma pesada em que seja proficiente, aceite −5 no acerto para somar +10 no dano.',
      'Armas corpo a corpo com Alcance ou Duas Mãos ganham Mortal x3 em suas mãos.'
    ],
    aura: [
      'REN: se foi utilizado REN no ataque inicial, o adicional recebe +3 graus/passos.',
      'GYO: com GYO aumentando sua FOR, a penalidade cai para −3.',
      null
    ]
  },
  {
    id: 'mestre_de_escudo',
    auraEtq: [['SHU'], ['TEN'], null],
    nome: 'Mestre de Escudo',
    etiquetas: ['SHU', 'TEN'],
    tiers: [
      'Se não estiver incapacitado, some o bônus de CA do escudo em TR de DES contra efeitos que tenham você como alvo, incluindo armadilhas.',
      'Contra um efeito com TR de DES para metade do dano, use sua Reação: se passar, não sofre dano.',
      '+1 em CON ou FOR.'
    ],
    aura: [
      'SHU no escudo permite somar também o bônus de CA do SHU no TR.',
      'TEN: se falhar nesse TR, ative TEN na mesma Reação para aplicar RD.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'CON', valor: 1 }, { attr: 'FOR', valor: 1 }] }
  },
  {
    id: 'ofensiva_agil',
    auraEtq: [['GYO'], ['KO'], null],
    nome: 'Ofensiva Ágil',
    etiquetas: ['GYO', 'KO'],
    tiers: [
      '+5 na Iniciativa.',
      'Contra-ataques contra você têm −2.',
      '+1 em DES, SAB ou INT.'
    ],
    aura: [
      'GYO para aumentar sua DES custa 20%, em vez de 30%.',
      'KO: armas de propriedade cortante provocam TR de CON contra sangramento, independente do dano causado.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }, { attr: 'INT', valor: 1 }] }
  },
  {
    id: 'ofensiva_bruta',
    auraEtq: [['REN'], ['REN'], null],
    nome: 'Ofensiva Bruta',
    etiquetas: ['REN'],
    tiers: [
      'Ataques corpo a corpo com FOR ganham +1 grau, e você fica com −1 na CA.',
      'Após a rolagem de ataque, gaste 3 Reações do total para somar sua FOR duas vezes no dano (1x por rodada).',
      '+1 em FOR.'
    ],
    aura: [
      'REN: nos turnos em que usar REN nesses ataques, em vez disso: +2 graus e −2 na CA até seu próximo turno.',
      'REN: se o ataque tiver REN, gaste 2 Reações em vez de 3.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'FOR', valor: 1 }] }
  },
  {
    id: 'ofensiva_precisa',
    auraEtq: [['SHU'], ['GYO'], null],
    nome: 'Ofensiva Precisa',
    etiquetas: ['SHU', 'GYO'],
    tiers: [
      'Ataques à distância e de arremesso ganham +1 grau, e você fica com −1 na CA.',
      '+2 no acerto de um ataque à distância ou de arremesso, se você não se moveu na rodada.',
      '+1 em DES, SAB ou INT.'
    ],
    aura: [
      'SHU: nos turnos em que usar SHU nesses ataques, em vez do básico: +2 graus e −2 na CA até seu próximo turno.',
      'GYO: aplicado em FOR ou DES, o bônus também se ativa nos olhos pela duração, e o ataque ganha a propriedade Crítico 19, caso não tenha.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }, { attr: 'INT', valor: 1 }] }
  },
  {
    id: 'perceptiva',
    auraEtq: [['ZETSU'], ['GYO'], null],
    nome: 'Perceptiva',
    etiquetas: ['ZETSU', 'GYO'],
    tiers: [
      '+2 na Iniciativa.',
      '+5 na Percepção passiva em combate.',
      '+1 em SAB.'
    ],
    aura: [
      'ZETSU: +3 na Percepção passiva enquanto estiver em Zetsu.',
      'GYO: se não se mover na rodada, ative GYO nos olhos com sua Ação de Movimento, em vez da Ação Bônus.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'premeditada_manipulada',
    auraEtq: [['HATSU'], ['HATSU'], null],
    nome: 'Premeditada (Manipulada)',
    etiquetas: ['HATSU'],
    tiers: [
      'Escolha uma opção: alvos ou objetos que você manipula ganham +1 grau/passo de dano ou +2 na CA.',
      '1x por rodada, some 1d6 em uma rolagem que não seja de d20 do alvo manipulado.',
      '+1 em INT ou PRE.'
    ],
    attrBonus: { escolha: [{ attr: 'INT', valor: 1 }, { attr: 'PRE', valor: 1 }] }
  },
  {
    id: 'premeditada_planejada',
    auraEtq: [['IN'], ['HATSU'], null],
    nome: 'Premeditada (Planejada)',
    etiquetas: ['HATSU', 'IN'],
    tiers: [
      'Uma arma, objeto ou constructo seu que dependa da sua aura fica com IN passivo, sem gastar aura ou sem gastar Ação Bônus inicialmente.',
      'A mesma arma, objeto ou constructo soma sua proficiência no ataque ou na defesa ou no TR que provoca.',
      '+1 em INT.'
    ],
    attrBonus: { fixo: [{ attr: 'INT', valor: 1 }] }
  },
  {
    id: 'sentinela',
    auraEtq: [['REN'], ['REN'], null],
    nome: 'Sentinela',
    etiquetas: ['REN'],
    tiers: [
      'Criaturas provocam Ataque de Oportunidade mesmo usando Desengajar.',
      'Ao acertar um Ataque de Oportunidade, o alvo fica Lento (após falhar no TR de CON) até o fim do turno dele.',
      '+1 em DES ou SAB.'
    ],
    aura: [
      'REN: seu Ataque de Oportunidade pode aplicar REN na mesma Reação, consumindo aura e "desligando" logo após o ataque.',
      'REN: se o ataque teve REN, o alvo fica Imóvel (após falhar no TR de CON) em vez de Lento.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }] }
  },
  {
    id: 'trapaceira',
    auraEtq: [['ZETSU'], ['ZETSU'], null],
    nome: 'Trapaceira',
    // A etiqueta REN saiu: os dois blocos "Com aura" da Trapaceira são de ZETSU, então
    // REN não liberava nível nenhum e aparecia no card sem servir para nada. Removida
    // também do livro.
    etiquetas: ['ZETSU'],
    tiers: [
      'Seus golpes desarmados e armas Leves ganham a propriedade Finta/Oculto. Se a arma já tiver essa propriedade, você tem vantagem no teste da Finta.',
      '1x por rodada, com a Ação Bônus, faça um truque contra um alvo a até 1,5 m: jogue areia nos olhos, puxe a roupa, finja um golpe. Teste de Enganação contra a Percepção ou Intuição do alvo (escolha dele). Se vencer, escolha: o alvo fica Desprevenido até o fim do seu turno; ou você pega ou derruba um item que ele segura com uma mão.',
      '+1 em DES ou PRE.'
    ],
    aura: [
      'ZETSU: se você estava em Zetsu no momento do seu ataque (mesmo não oculto), o alvo tem desvantagem no teste contra a sua Finta.',
      'ZETSU: enquanto Zetsu estiver ativo, com uma ação livre, faça um truque de distração contra o resultado de ataque de um alvo pensante a até 1,5 m que tem você como alvo. Se vencer a distração, o ataque erra você.',
      null
    ],
    attrBonus: { escolha: [{ attr: 'DES', valor: 1 }, { attr: 'PRE', valor: 1 }] }
  },
  {
    id: 'visao_360',
    auraEtq: [['EN'], ['EN'], null],
    nome: 'Visão 360º',
    etiquetas: ['EN'],
    tiers: [
      'Campo de visão de 360º: você é imune a flanqueamento.',
      '1x por rodada, vantagem e +3 em Percepção ou Intuição contra Finta/Oculto de um ataque recebido.',
      '+1 em SAB.'
    ],
    aura: [
      'EN: seu EN custa 1 Reação a menos do total (mínimo 1).',
      'EN: com EN ativo, você vence automaticamente o teste contra Finta/Oculto de atacantes dentro da área.',
      null
    ],
    attrBonus: { fixo: [{ attr: 'SAB', valor: 1 }] }
  }
];

// ── Bônus de Maestria da VERSÃO ANTERIOR deste arquivo ───────────────────────
// Necessário para a migração: o ledger char.combatInclinationAttrApplied só diz
// QUE o bônus foi aplicado (true, ou o atributo escolhido), não QUANTO. Sem esta
// tabela não há como desfazer o valor antigo, e o personagem ficaria com o +2
// antigo somado ao +1 novo. Entradas sem bônus de atributo ficam de fora.
window.COMBAT_INC_ATTR_LEGADO = {
  analitica:              { fixo: [{ attr: 'INT', valor: 1 }, { attr: 'SAB', valor: 1 }] },
  conjurador_de_guerra:   { fixo: [{ attr: 'INT', valor: 2 }] },
  defensiva_bruta:        { fixo: [{ attr: 'CON', valor: 2 }] },
  defensiva_precisa:      { fixo: [{ attr: 'CON', valor: 2 }] },
  defensiva_reativa_agil: { fixo: [{ attr: 'CON', valor: 2 }] },
  imobilizador:           { fixo: [{ attr: 'FOR', valor: 2 }] },
  investida_poderosa:     { fixo: [{ attr: 'FOR', valor: 2 }] },
  mestre_de_armas:        { escolha: [{ attr: 'FOR', valor: 1 }, { attr: 'DES', valor: 1 }] },
  mestre_de_escudo:       { fixo: [{ attr: 'CON', valor: 1 }, { attr: 'FOR', valor: 1 }] },
  ofensiva_bruta:         { fixo: [{ attr: 'FOR', valor: 2 }] },
  ofensiva_precisa:       { escolha: [{ attr: 'DES', valor: 2 }, { attr: 'SAB', valor: 2 }, { attr: 'INT', valor: 2 }] },
  ofensiva_agil:          { escolha: [{ attr: 'DES', valor: 2 }, { attr: 'SAB', valor: 2 }, { attr: 'INT', valor: 2 }] },
  perceptiva:             { fixo: [{ attr: 'SAB', valor: 2 }] },
  premeditada_manipulada: { escolha: [{ attr: 'INT', valor: 1 }, { attr: 'PRE', valor: 1 }] },
  premeditada_planejada:  { fixo: [{ attr: 'INT', valor: 2 }] },
  sentinela:              { fixo: [{ attr: 'DES', valor: 1 }, { attr: 'SAB', valor: 1 }] },
  trapaceira:             { escolha: [{ attr: 'DES', valor: 2 }, { attr: 'PRE', valor: 2 }] },
  visao_360:              { fixo: [{ attr: 'SAB', valor: 2 }] },
};
