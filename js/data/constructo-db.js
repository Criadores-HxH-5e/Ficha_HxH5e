// Tabelas para a "Ficha do Constructo" — gerada automaticamente quando um Hatsu de
// MATERIALIZAÇÃO/CONJURAÇÃO ou EMISSÃO compra efeitos que criam um constructo.
// Fonte: HB-ManualdeHatsusHxH5eRPG2.0.txt, seção "Criando a ficha da Materialização" (~linha 3722).
window.CONSTRUCTO_DB = {
    TAMANHO_ORDEM: ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'],

    // PV base por Tamanho x Durabilidade (manual, tabela "PV (BÁSICO!!) por Tamanho")
    PV_POR_TAMANHO: {
        'Minúsculo': { fragil: 4, resistente: 9 },
        'Pequeno':   { fragil: 5, resistente: 13 },
        'Médio':     { fragil: 6, resistente: 17 },
        'Grande':    { fragil: 7, resistente: 20 },
        'Enorme':    { fragil: 8, resistente: 23 },
        'Colossal':  { fragil: 12, resistente: 25 },
    },

    // CA de objeto por material — mesma lista/valores usados no picker de Golem de Aura
    // (hatsu-creator.js, efeito rm_e2), para as chaves baterem com specialChoices.rm_e2.
    CA_POR_MATERIAL: {
        'Tecido/Papel':     11,
        'Cristal/Vidro':    12,
        'Madeira/Orgânico': 13,
        'Mineral/Pedra':    14,
        'Líquido/Gel':      14,
        'Metal':            15,
        'Gasoso':           null,
    },

    // Bônus fixos por efeito de constructo comprado (transcritos da desc de cada efeito em hatsu-db.js)
    EFEITO_PV: {
        rm_e2: 5,    // Golem de Aura
        rm_e14: 10,  // Forma Evoluída
        rc_e2: 5,    // Corpo Evoluído 1
        rc_e5: 10,   // Corpo Evoluído 2
        rc_e7: 10,   // Corpo Evoluído 3
        rc_e10: 15,  // Corpo Evoluído 4
        rc_e13: 20,  // Forma Suprema
        em_e1: 6,    // Aura Viva (PV e dano 1d6 — usa 1d6 médio ≈ +6 de referência)
    },
    EFEITO_CA: {
        rm_e14: 2,   // Forma Evoluída
        rc_e2: 1,    // Corpo Evoluído 1
        rc_e5: 2,    // Corpo Evoluído 2
        rc_e7: 2,    // Corpo Evoluído 3
        rc_e10: 2,   // Corpo Evoluído 4
        rc_e13: 3,   // Forma Suprema
        em_e1: 12,   // Aura Viva (CA fixa 12)
    },
    // Quantos "slots" de Característica de Invocação cada efeito concede ao ser comprado
    EFEITO_CARACTERISTICAS: {
        rm_e2: 1, rm_e3: 1, rm_e14: 1,
        rc_e5: 1, rc_e7: 1, rc_e10: 2,
    },

    // Bônus de restrições de conjuração relevantes para PV/CA
    RESTRICAO_PV: { rc_p3: 10 },           // Sacrifício Ritual: +2 CA e +10 PV ao ser criada
    RESTRICAO_CA: { rc_l1: 1, rc_p3: 2 },  // Vínculo de Alcance: +1 na CA / Sacrifício Ritual: +2 CA

    // Valor ABSOLUTO (não cumulativo) por nº de vezes que a Característica foi escolhida.
    // Índice 0 = 1ª escolha, índice 1 = 2ª escolha, etc. Além do array, mantém o último valor.
    CARACTERISTICA_SCALE: {
        'Robustez':          [5, 10, 15, 25],
        'Carapaça/Armadura': [2, 3, 4, 5],
        'Furtivo':           [2, 3, 4, 5],
        'Atento':            [2, 3, 4, 5],
        'Perturbador':       [2, 3, 4, 5],
        'Defensor':          [2, 3, 4, 5],
        'Móvel/Veloz':       [3, 4.5, 6, 7.5, 9],
    },

    PERICIA_SLOTS: 5,
    PERICIA_TIPOS: [
        { id: 'tr', label: 'Teste de Resistência', valores: ['FOR', 'DES', 'CON', 'INT', 'SAB', 'PRE'] },
        { id: 'pericia', label: 'Perícia', valores: [
            'Atletismo', 'Acrobacia', 'Furtividade', 'Prestidigitação', 'Arcanismo', 'História',
            'Investigação', 'Natureza', 'Religião', 'Lidar com Animais', 'Intuição', 'Medicina',
            'Percepção', 'Sobrevivência', 'Atuação', 'Enganação', 'Intimidação', 'Persuasão',
        ] },
        { id: 'arma', label: 'Armas/Equipamentos', valores: [
            'Armas de Cerco', 'Proteção Média', 'Proteção Pesada', 'Improvisados/Manufaturados',
            'Científicas/Explosivas', 'Marciais corpo-a-corpo', 'Marciais à distância',
            'Simples corpo-a-corpo', 'Simples à distância',
        ] },
    ],

    ACOES_SIMPLES: [
        { nome: 'Arma Natural', desc: 'Golpe corpo-a-corpo: 2d6 + atributo (normalmente FOR) em um acerto.' },
        { nome: 'Ataque Simples', desc: 'Realiza um ataque simples e direto.' },
        { nome: 'Auxílio Rápido', desc: 'Concede a ação de Ajuda a um aliado a até 1,5m para Testes ou Ataques.' },
        { nome: 'Desarme Simples', desc: 'Ataque vs Atletismo do alvo; vencendo, o alvo derruba o item em 1,5m.' },
        { nome: 'Focar em Precisão', desc: 'Durante 1 rodada, todo ataque recebe +2 para acertar.' },
        { nome: 'Levantar Guarda', desc: 'Durante 1 rodada, recebe 2 de RD contra qualquer dano.' },
        { nome: 'Observar Alvo', desc: '+2 em TR contra ataques/efeitos daquele alvo na próxima rodada.' },
        { nome: 'Preparar Ataque', desc: 'O próximo ataque causa 1d4 de dano adicional.' },
        { nome: 'Provocação', desc: 'Alvo em TR de SAB/PRE vs Intimidação; se falhar, vantagem pra atacar o constructo.' },
        { nome: 'Reposicionamento Tático', desc: 'Move até 3m sem provocar ataques de oportunidade.' },
    ],
    ACOES_COMPLEXAS: [
        { nome: 'Acompanhar Golpe', desc: 'Próximo ataque de um aliado a 3m: +2 para acertar e +1d4 de dano.' },
        { nome: 'Ataque com Sangue-Frio', desc: 'Ataque corpo-a-corpo com desvantagem; em acerto, +2d6 de dano crítico.' },
        { nome: 'Combo Coordenado', desc: 'Dois ataques corpo-a-corpo contra o mesmo alvo, cada um com −1 grau/passo de dano.' },
        { nome: 'Empurrar e Ferir', desc: 'Atletismo vs Atletismo — se vencer, derruba (Caído) e ainda desfere um ataque.' },
        { nome: 'Investida Poderosa', desc: 'Move até 3m em linha reta + ataque com +2 para acertar; em acerto, +mod de atributo em dano.' },
        { nome: 'Rasgar Defesa', desc: 'Em acerto, além do dano normal, alvo recebe −2 de CA até o fim do próximo turno.' },
    ],
};

// Efeitos que, ao serem comprados num Hatsu, indicam que ele cria um constructo com ficha própria
window.CONSTRUCT_EFFECT_IDS = Array.from(new Set([
    ...Object.keys(window.CONSTRUCTO_DB.EFEITO_PV),
    ...Object.keys(window.CONSTRUCTO_DB.EFEITO_CA),
    ...Object.keys(window.CONSTRUCTO_DB.EFEITO_CARACTERISTICAS),
]));
