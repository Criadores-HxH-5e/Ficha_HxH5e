// ══════════════════════════════════════════════════════════════════════════════
//  MALDIÇÃO, EXORCISMO E BESTAS DE NEN — catálogo
//  Fonte: HB-ManualdeHatsusHxH5eRPG2.0.txt, "Maldições, Exorcismo e Nen Parasita
//  (Bestas Especiais)", linhas ~5891-6425.
//
//  Regra estrutural: escolher uma destas TAGS limita o usuário a 2 Hatsus NO TOTAL.
//  As tags (P/M/E/B) são aplicadas sobre os tipos de Hatsu que já existem, não
//  substituem os grupos Foco e Duração.
// ══════════════════════════════════════════════════════════════════════════════

// Tags de Hatsu. 'P' é o padrão e não impõe limite.
window.HATSU_TAGS = [
    { id: 'P', nome: 'Hatsu Padrão',            limite2: false },
    { id: 'M', nome: 'Hatsu de Maldição',       limite2: true  },
    { id: 'E', nome: 'Hatsu de Exorcista',      limite2: true  },
    { id: 'B', nome: 'Hatsu de Besta Especial', limite2: true  },
];
window.HATSU_TAG_AVISO = 'Hatsus de Maldição, Exorcismo ou Besta Especial limitam você a 2 Hatsus no total. Exclua um dos existentes para continuar.';

window.MALDICAO_DB = {
    // Efeitos Especiais de Maldições. Cada um custa 1 P.N; o número é o LIMIAR de
    // P.N já investido EM EFEITOS no Hatsu (P.N devolvido por restrição NÃO conta).
    efeitos: [
        { id:'mal_e1', limiar:3,  pn:1, desc:'Aplica até 2 Condições Leves ou impõe uma Restrição Geral Leve no Hatsu do alvo' },
        { id:'mal_e2', limiar:5,  pn:1, desc:'Aplica até 2 Condições Leves e 1 Média, ou impõe duas Restrições Gerais Leves no Hatsu do alvo' },
        { id:'mal_e3', limiar:7,  pn:1, desc:'Aplica uma Condição Média E impede o próximo uso de um Hatsu, ou impõe uma Restrição Geral Moderada no Hatsu do alvo' },
        { id:'mal_e4', limiar:10, pn:1, desc:'Limita o alvo a usar apenas Princípios de Nen, ou uma Condição Forte, ou impõe duas Restrições Gerais Moderadas no Hatsu do alvo' },
        { id:'mal_e5', limiar:15, pn:1, desc:'Limita o alvo a usar apenas Princípios de Nen E uma Condição Forte' },
        { id:'mal_e6', limiar:20, pn:1, desc:'Impede o alvo de utilizar seus Hatsus ou todos os Princípios de Nen' },
        { id:'mal_e7', limiar:25, pn:1, desc:'Impõe Zetsu Forçado ou uma Condição Extrema' },
    ],
    // Temporizador (Marca da Maldição) — um dos quatro é obrigatório.
    temporizadores: [
        { id:'acordos',   nome:'Temporizador de Acordos',            min:'5 rodadas',            max:'Quebra do Acordo' },
        { id:'acumulo_t', nome:'Temporizador de Acúmulo (Tempo)',    min:'2 rodadas',            max:'5 rod., 10 (1min), 15 (1:30), 20 (2min), 30 (3min), 50 (25min)' },
        { id:'acumulo_a', nome:'Temporizador de Acúmulo (Ações)',    min:'2 ações',              max:'Ocorrência de ações determinadas' },
        { id:'objetivos', nome:'Temporizador de Objetivos/Missões',  min:'1',                    max:'3 a 5' },
        { id:'simples',   nome:'Temporizador Simples de Tempo',      min:'5 rodadas (30 seg.)',  max:'30 dias' },
    ],
    // As 6 características obrigatórias (8 quando a maldição é positiva).
    requisitos: [
        { n:1, texto:'Pelo menos uma Restrição Pesada ou três inferiores' },
        { n:2, texto:'Pelo menos uma Restrição de gatilho: Interação Sensorial Simples, Golpe/Toque, Contrato Simples, Limitação de Alvos, Alvo Único em Combate ou Explicar Hatsu' },
        { n:3, texto:'Um destes efeitos: Materialização (Dimensão de Bolso ou Forjar Objeto/Arma), Emissão (Golem de Aura, Aura Viva, Plano Avançado ou Transporte Abstrato) ou Manipulação (C.S.C ou evoluções)' },
        { n:4, texto:'Definir um tipo de Temporizador' },
        { n:5, texto:'Uma Restrição/Efeito COMO CONSEQUÊNCIA por cumprir ou descumprir a imposição' },
        { n:6, texto:'Uma forma de NÃO RECEBER ou SAIR da maldição sem ser por Exorcismo' },
    ],
    // ── Mapa dos requisitos para os ids reais do HATSU_DB ───────────────────────
    // Requisitos 1 a 4 o app detecta sozinho; 5 e 6 são declarações do jogador, porque
    // "consequência" e "forma de sair" dependem da narrativa, não de uma lista fechada.
    // Um mesmo item pode cumprir mais de um requisito — o validador não consome nada.
    mapa: {
        req1: { pesada: 1, inferiores: 3 },
        req2: ['rg_l10','rg_m9','rg_v4','rg_l11','rg_m1','rg_m8'],
        // Golem de Aura fica em MATERIALIZAÇÃO no app (o livro agrupa em Emissão);
        // seguimos o app, que é o correto.
        req3: ['rm_e4','rm_e1','rm_e2','em_e1','em_e3','em_e5','ma_e2',
               'ma_e3','ma_e4','ma_e7','ma_e8','ma_e9','ma_e10','ma_e11'],
    },

    requisitosPositiva: [
        { n:7, texto:'Bônus máximo de +3 Graus de Potência em qualquer característica' },
        { n:8, texto:'Desmaiar com o Hatsu ativo ou ser Selado (Zetsu forçado) bloqueia o efeito — exige novo ritual' },
    ],
};

window.EXORCISMO_DB = {
    // Resultados do ritual de Exorcismo, comparando a rolagem com a CD.
    resultados: [
        { id:'falha_critica', comparacao:'Falha por 5 ou mais', resultado:'Falha crítica',                                                              consequencia:'-3 de Sanidade por ponto de diferença e 3º Grau de Exaustão' },
        { id:'falha',         comparacao:'Falha por 1 a 4',     resultado:'Falha; o Exorcismo completo passa a levar 3 dias a mais',                     consequencia:'A maldição consome sua aura e deixa no 2º Grau de Exaustão' },
        { id:'sucesso',       comparacao:'Sucesso normal',      resultado:'Absorve a maldição, interrompe os efeitos e apaga em 7 dias',                 consequencia:'O Exorcista carrega o volume da maldição até ser apagada' },
        { id:'sucesso_5',     comparacao:'Sucesso por 5 ou mais', resultado:'Absorve a maldição, interrompe os efeitos e apaga em 3 dias',               consequencia:'+1 no próximo Exorcismo' },
        { id:'sucesso_crit',  comparacao:'Sucesso crítico',     resultado:'Absorve a maldição e apaga instantaneamente',                                 consequencia:'Recupera a aura gasta no ritual e recebe uma ação protagonista' },
    ],
    efeitos: [
        { id:'exo_e1', nome:'Purificar',            req:'Nível 1', desc:'Toca em si ou em aliado e remove condições de qualquer grau causadas por aura, exceto maldições de Nen.' },
        { id:'exo_e2', nome:'Expurgar',             req:'Nível 4', desc:'Com um toque, remove por 1d4 rodadas efeitos positivos ou negativos sobre um alvo.' },
        { id:'exo_e3', nome:'Miscelânea Criativa',  req:'Nível 7', desc:'Adiciona até 3 efeitos de uma categoria a que tenha acesso, e esses efeitos podem aplicar Purificar e Expurgar.' },
    ],
};

window.BESTA_DB = {
    // A categoria da besta é INDEPENDENTE da do usuário e ALEATÓRIA.
    categorias: ['REFORÇO', 'TRANSMUTAÇÃO', 'MATERIALIZAÇÃO', 'ESPECIALIZAÇÃO', 'MANIPULAÇÃO', 'EMISSÃO'],
    // Manifestação A — auto-imposta ou amistosa em aliado.
    favoraveis: [
        { id:'bes_f1',  nome:'Periculosidade',      req:'Nível 1', cat:'REFORÇO',        desc:'A presença da Besta intimida inimigos que possam vê-la. Criaturas em até 6m fazem TR de Presença ou sofrem desvantagem em ataques contra você.' },
        { id:'bes_f2',  nome:'Amplificador',        req:'Nível 3', cat:'REFORÇO',        desc:'Concede bônus +3 nos atributos físicos.' },
        { id:'bes_f3',  nome:'Tanque de Guerra',    req:'Nível 5', cat:'REFORÇO',        desc:'A Besta assume forma protetora, absorvendo até 25% do dano sofrido pelo hospedeiro e redirecionando para si.' },
        { id:'bes_f4',  nome:'Extensão Wireless',   req:'Nível 1', cat:'TRANSMUTAÇÃO',   desc:'A Besta funciona como nova fonte de liberação local do Hatsu.' },
        { id:'bes_f5',  nome:'O Avatar',            req:'Nível 1', cat:'TRANSMUTAÇÃO',   desc:'O usuário expande o uso de Transmutação elemental para 4 elementos simultâneos.' },
        { id:'bes_f6',  nome:'Troca Equivalente',   req:'Nível 3', cat:'TRANSMUTAÇÃO',   desc:'Escolha qualquer outro efeito de Transmutação no nível máximo de um efeito que já possua (efeitos repetidos).' },
        { id:'bes_f7',  nome:'Caixa de Pandora',    req:'Nível 3', cat:'MATERIALIZAÇÃO', desc:'A Besta pode invocar, com uma ação principal, qualquer objeto de tamanho médio mundano ou comum.' },
        { id:'bes_f8',  nome:'Titeireiro',          req:'Nível 3', cat:'MATERIALIZAÇÃO', desc:'Um constructo de Materialização do alvo é possuído pela Besta, que age usando a ficha da Materialização. Se for objeto ou equipamento, a Besta pode vestir ou utilizar em combate.' },
        { id:'bes_f9',  nome:'Espelho-Espelho Meu', req:'Nível 3', cat:'MATERIALIZAÇÃO', desc:'A Besta toma forma e funções de qualquer objeto ou pessoa que o alvo conheça pelo menos de vista.' },
        { id:'bes_f10', nome:'Incomparável',        req:'Nível 5', cat:'ESPECIALIZAÇÃO', desc:'Escolha até 3 efeitos de qualquer categoria e aplique em um único efeito totalmente novo.' },
        { id:'bes_f11', nome:'Ventríloquo',         req:'Nível 1 + marcação tátil', cat:'MANIPULAÇÃO', desc:'A Besta se aloja em um alvo, que passa a ver o usuário como pessoa confiável e conhecida de seu histórico.' },
        { id:'bes_f12', nome:'Abelha Rainha',       req:'Nível 6', cat:'MANIPULAÇÃO',    desc:'A Besta espalha o comando sobre um alvo manipulado para outros tocados por ele, expandindo a manipulação.' },
        { id:'bes_f13', nome:'1001 Utilidades',     req:'Nível 8 + C.S.O', cat:'MANIPULAÇÃO', desc:'A Besta possui qualquer objeto de tamanho até Gigante, permitindo a manipulação pelo usuário.' },
        { id:'bes_f14', nome:'Até Onde o Sol Toca', req:'Nível 3', cat:'EMISSÃO',        desc:'O alcance da Besta é ilimitado e os sentidos são compartilhados com o usuário.' },
        { id:'bes_f15', nome:'Rajada',              req:'Nível 5', cat:'EMISSÃO',        desc:'A Besta reproduz ataques do usuário e aplica a propriedade Rajada com 4,5m de alcance em cone.' },
        { id:'bes_f16', nome:'Teleguiar',           req:'Nível 8', cat:'EMISSÃO',        desc:'Enquanto ativa, ataques da Besta ou do usuário feitos de aura atingem os alvos automaticamente, como se fossem em Área.' },
    ],
    // Manifestação B — imposta a oponentes.
    hostis: [
        { id:'bes_h1', nome:'Autoimune 1',     req:'Nível 1', desc:'O alvo recebe o efeito dos atributos penalizados de CON: -2 Pontos de Vida ao sofrer qualquer dano.' },
        { id:'bes_h2', nome:'Autoimune 2',     req:'Nível 5', desc:'O alvo recebe o efeito dos atributos penalizados de CON: 10% a mais de gasto de aura em todo uso de Nen.' },
        { id:'bes_h3', nome:'Adoecedora',      req:'Nível 3', desc:'O alvo recebe a condição Enjoado.' },
        { id:'bes_h4', nome:'Enfraquecedora',  req:'Nível 5', desc:'A CA do alvo e suas Reações não ofensivas recebem -3.' },
        { id:'bes_h5', nome:'Ineficiente',     req:'Nível 6', desc:'O alvo perde momentaneamente, pela duração, os efeitos de Eficiência de aura.' },
        { id:'bes_h6', nome:'Fonte de Loucura', req:'Nível 6', desc:'Provoca um TR de Vontade (SAB/CAR) cuja dificuldade aumenta em 3 por rodada. Ao falhar: (A) ativa uma manipulação do usuário ou (B) reduz a sanidade do alvo em 10.' },
    ],
    // Nível 12: escolhe UM Efeito Lendário, valendo para Manifestação A ou B.
    lendarios: [
        { id:'bes_l1', nome:'Amplificação de Princípios de Nen', desc:'Reduz a aura gasta ou amplifica os efeitos de Princípios e Técnicas de Nen pela duração. Pode combinar com Eficiência de Aura.' },
        { id:'bes_l2', nome:'Arma Amaldiçoada',   desc:'A Besta se sacrifica, passa a ser vista e se torna arma amaldiçoada não tecnológica com Acuidade, Arma de Cerco e Mortal x4, mais 2 entre Balista, Bloqueio, Desarmar, Explosivo e Perfurante.' },
        { id:'bes_l3', nome:'Drenadora de Aura',  desc:'Drena 5% de aura, até 30%, de todos os inimigos em área de 9m que falharem em Teste de Presença.' },
        { id:'bes_l4', nome:'Exponenciador',      desc:'Em área de 9m ao seu redor, ou mais conforme o alcance da Besta, seus Hatsus e efeitos recebem +3 Graus de Potência.' },
        { id:'bes_l5', nome:'Imortalidade',       desc:'Se o usuário morrer com a Besta ativa, ela se sacrifica para trazê-lo de volta, não podendo ser conjurada por 10 dias.' },
        { id:'bes_l6', nome:'Independente',       desc:'A Besta passa a usar a aura do hospedeiro apenas a cada 3 usos, não a cada uso como em Condenado.' },
        { id:'bes_l7', nome:'Roubo de Hatsu',     desc:'Rouba e armazena um Hatsu até ser utilizado; o usuário original o perde nesse tempo. Teste = 10 + proficiência + SAB do Materializador da Besta.' },
        { id:'bes_l8', nome:'Teletransportadora', desc:'Teletransporta todos na área para um local definido como Lar, redefinível pessoalmente 1 vez por semana. A Besta desaparece e só volta após um descanso longo.' },
        { id:'bes_l9', nome:'Autossuficiente',    desc:'Mantém-se ativa por +1 rodada sem consumir aura a cada sucesso em jogada de ataque, ou a cada CD/TR originado da Besta que o alvo falhe.' },
    ],
};
