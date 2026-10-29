        //HATSU CREATOR — baseado no Manual de Hatsus HxH5e RPG 2.0

// Por padrão, TODO efeito é repetível (pode ser comprado de novo, uma vez por nível) — a menos
// que seja marcado explicitamente com repetivel:false em hatsu-db.js.
window.isEfeitoRepetivel = function(item) {
    return !!item && item.repetivel !== false;
};

// Tabela de rolagem de Categoria de Nen (1d100) — usada na criação de personagem
window.CATEGORY_ROLL_TABLE = [
    { min:1,  max:18,  classId:'INTENSIFICAÇÃO' },
    { min:19, max:36,  classId:'TRANSMUTAÇÃO' },
    { min:37, max:54,  classId:'MATERIALIZAÇÃO' },
    { min:55, max:72,  classId:'EMISSÃO' },
    { min:73, max:90,  classId:'MANIPULAÇÃO' },
    { min:91, max:100, classId:'ESPECIALIZAÇÃO' },
];
window.rollCategoriaNenTable = function(roll) {
    const entry = window.CATEGORY_ROLL_TABLE.find(function(e){ return roll >= e.min && roll <= e.max; });
    return entry ? entry.classId : 'INTENSIFICAÇÃO';
};

// Calculate bonus P.N granted by selected restrictions
window.calcPNBonusFromRestr = function(hb) {
    if (!hb) return 0;
    let bonus = 0;
    const allSelected = [...(hb.rg||[]), ...(hb.rc||[])];
    const pureRestr = hb.pureRestrictions || {};

    // P.N de Restrições Puras: Leve+1, Mod+2, Pes+3, Ext+4
    const PURE_PN = { leve:1, moderada:2, pesada:3, extrema:4 };
    if (Object.keys(pureRestr).length > 0) {
        const allRDB = [];
        const rg = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
        if (rg) ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => {
            const peso = k === 'variaveis' ? 'variavel' : k.replace(/s$/,'');
            (rg[k]||[]).forEach(r => allRDB.push({...r, peso}));
        });
        // Also add category restrictions
        const catCls = window._currentBuilderClass || (window.state && window.state.currentChar && window.state.currentChar.class) || '';
        const catDB = window.HATSU_DB && window.HATSU_DB.categorias && window.HATSU_DB.categorias[catCls];
        if (catDB && catDB.restricoes) catDB.restricoes.forEach(r => allRDB.push(r));

        allSelected.forEach(id => {
            if (!pureRestr[id]) return;
            // Restrições com P.N automático não usam o sistema pura (são ignoradas aqui)
            if (['rg_e9', 'rg_p3', 'ri_p3'].includes(id)) return;
            const r = allRDB.find(x => x.id === id);
            if (r) {
                const pn = PURE_PN[r.peso] || 0;
                bonus += pn;
            }
        });
    }

    allSelected.forEach(id => {
        // Restrições com P.N automático (sem toggle pura): sempre somam ao selecionar
        if (id === 'rg_e9') bonus += 7;  // Vida por Poder: +7 automático
        if (id === 'ri_p3') bonus += 3;  // 1x por Combate: +3 automático
        if (id === 'rg_p3') bonus += 3;  // Dano Permanente: +3 automático

        // rg_v7: Limite de Uso Contínuo — P.N variável via benefício escolhido (quando não pura)
        if (id === 'rg_v7' && !pureRestr[id]) {
            const choice = hb.beneficioChoices && hb.beneficioChoices['rg_v7'];
            if (choice) {
                const m = choice.match(/(\d+)\s*P\.N/);
                if (m) bonus += parseInt(m[1]);
            } else {
                bonus += 1;
            }
        }
    });
    return bonus;
};

// ── P.N de restrições EXTREMAS puras (único tipo que permite compra duplicada no mesmo nível) ──
window.calcPNFromExtremeRestr = function(hb) {
    if (!hb) return 0;
    const pureRestr = hb.pureRestrictions || {};
    const rg = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
    if (!rg) return 0;
    let bonus = 0;
    (rg.extremas || []).forEach(r => {
        if (r.id === 'rg_e9') {
            // Vida por Poder: P.N automático ao selecionar, equivale a extrema pura
            if ((hb.rg||[]).includes(r.id)) bonus += 7;
            return;
        }
        if ((hb.rg||[]).includes(r.id) && pureRestr[r.id]) bonus += 4;
    });
    return bonus;
};

// ── P.N gasto exclusivamente em compras duplicadas (2ª cópia em diante do mesmo efeito) ──
// Efeitos "repetíveis" (evoluem por nível — ex: Aumento de Duração) têm cada cópia comprada
// com P.N normal já rastreada em hb.efeitoNiveis[id]; essas cópias NÃO contam como duplicata
// extrema. Só cópias além das rastreadas (compradas via botões de Restrição Extrema Pura) contam.
window.calcDuplicatePNUsed = function(hb) {
    if (!hb) return 0;
    const allEffects = [...(hb.eg||[]), ...(hb.ec||[])];
    const allEDB = [...((window.HATSU_DB && window.HATSU_DB.efeitos_gerais)||[])];
    if (window.HATSU_DB && window.HATSU_DB.categorias) {
        Object.values(window.HATSU_DB.categorias).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allEDB.find(x=>x.id===e.id)) allEDB.push(e); });
        });
    }
    const efeitoNiveis = hb.efeitoNiveis || {};
    const counts = {};
    allEffects.forEach(eid => { counts[eid] = (counts[eid] || 0) + 1; });
    let dupPNUsed = 0;
    Object.keys(counts).forEach(eid => {
        const total = counts[eid];
        const effect = allEDB.find(x => x.id === eid);
        if (!effect) return;
        const trackedNormal = window.isEfeitoRepetivel(effect) ? Math.min(total, (efeitoNiveis[eid] || []).length) : Math.min(total, 1);
        const extra = Math.max(0, total - trackedNormal);
        dupPNUsed += extra * (effect.pn || 0);
    });
    return dupPNUsed;
};

// ── Remove duplicatas de efeitos quando o P.N extremo disponível é insuficiente ──
// Nunca remove cópias de efeitos repetíveis já rastreadas em hb.efeitoNiveis (compradas com
// P.N normal por nível) — só remove cópias "extra" além dessas (compradas via extrema pura).
window._hCleanDuplicatesIfNeeded = function(hb) {
    if (!hb) return;
    const extremePurePN = window.calcPNFromExtremeRestr(hb);
    const allEDB = [...((window.HATSU_DB && window.HATSU_DB.efeitos_gerais)||[])];
    if (window.HATSU_DB && window.HATSU_DB.categorias) {
        Object.values(window.HATSU_DB.categorias).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allEDB.find(x=>x.id===e.id)) allEDB.push(e); });
        });
    }
    function trackedCount(id) {
        const effect = allEDB.find(x => x.id === id);
        if (window.isEfeitoRepetivel(effect)) return ((hb.efeitoNiveis||{})[id] || []).length;
        return 1; // efeitos marcados repetivel:false: só a 1ª cópia é protegida (comportamento original)
    }
    function totalCount(id) {
        return (hb.eg||[]).filter(x => x === id).length + (hb.ec||[]).filter(x => x === id).length;
    }
    let safety = 50;
    while (safety-- > 0 && window.calcDuplicatePNUsed(hb) > extremePurePN) {
        let removed = false;
        for (let i = (hb.eg||[]).length - 1; i >= 0; i--) {
            const id = hb.eg[i];
            if (totalCount(id) > trackedCount(id)) { hb.eg.splice(i, 1); removed = true; break; }
        }
        if (!removed) {
            for (let i = (hb.ec||[]).length - 1; i >= 0; i--) {
                const id = hb.ec[i];
                if (totalCount(id) > trackedCount(id)) { hb.ec.splice(i, 1); removed = true; break; }
            }
        }
        if (!removed) break;
    }
};

// Calcula o custo real de aura do Hatsu com base nas restrições e efeitos selecionados
// ── Custo de aura cobrado POR UNIDADE ────────────────────────────────────────
// Alguns benefícios não são um desconto fechado: eles valem "por membro", "por
// Reação", "a cada 2 Graus". O app não tinha onde o jogador dizer QUANTOS, e o
// resultado era um desconto errado ou nenhum:
//
//   rg_e1  Condição Alheia ou Simbiótica — "−10% de custo por membro"
//          Nunca foi lido. O jogador escolhia a opção de aura e o custo não mudava.
//   rg_v9  Troca Perigosa — "−5% por Reação"
//          Era lido extraindo os dígitos do RÓTULO da opção ("...em 5% por
//          reação"), o que dava sempre 5 → −25% fixo, independente de quantas
//          Reações o jogador trocasse.
//   rg_v12 Cálculo Pensado Variável 2 — "−5% a cada 2 Graus/Passos"
//          O bnf não tem " ou ", então beneficioChoices nunca era preenchido e o
//          desconto era sempre 0.
//
// Agora a quantidade mora em specialChoices[id + '_qtd'], escolhida num seletor
// no criador do Hatsu, e o desconto sai daqui.
window.CUSTO_AURA_QUANTIDADE = {
    rg_e1:  { pct: -10, porUnidade: 1, max: 8,
              rotulo: 'Membros da condição',
              nota: '\u221210% de custo por membro.', exigeEscolhaAura: true },
    rg_v9:  { pct: -5,  porUnidade: 1, max: 10,
              rotulo: 'Reações trocadas',
              nota: '\u22125% de custo por Reação trocada.', exigeEscolhaAura: true },
    rg_v12: { pct: -5,  porUnidade: 2, max: 20,
              rotulo: 'Graus/Passos reduzidos',
              nota: '\u22125% a cada 2 Graus/Passos reduzidos.', exigeEscolhaAura: false },
};

// Efeitos de Materialização que ACRESCENTAM custo: "+10% por categoria de tamanho
// acima do usuário". Nunca foram cobrados — o jogador virava um avião pelo mesmo
// preço de virar um gato.
//
// A quantidade é lida da PRIMEIRA compra e, se houver cópias, vale a MAIOR: a
// categoria de tamanho é uma propriedade da forma final, não algo que some a cada
// compra do efeito.
window.CUSTO_AURA_TAMANHO = ['rm_e22', 'rm_e23', 'rm_e24', 'rm_e25'];
window.CUSTO_AURA_TAMANHO_PCT = 10;
window.CUSTO_AURA_TAMANHO_MAX = 4;

window.custoAuraQuantidade = function (id, specialChoices) {
    const cfg = (window.CUSTO_AURA_QUANTIDADE || {})[id];
    if (!cfg) return 0;
    const bruto = parseInt((specialChoices || {})[id + '_qtd']) || 0;
    const n = Math.max(0, Math.min(cfg.max, bruto));
    return cfg.pct * Math.floor(n / cfg.porUnidade);
};

// Quantas categorias de tamanho acima o jogador declarou, somando sobre as cópias
// pela MAIOR (ver acima). Aceita a chave por cópia 'id#1', 'id#2'.
window.categoriasTamanhoDeclaradas = function (id, specialChoices) {
    const sc = specialChoices || {};
    let maior = 0;
    Object.keys(sc).forEach(function (k) {
        if (k !== id && k.indexOf(id + '#') !== 0) return;
        const v = parseInt(sc[k]);
        if (!isNaN(v) && v > maior) maior = v;
    });
    return Math.max(0, Math.min(window.CUSTO_AURA_TAMANHO_MAX || 4, maior));
};

window.calcAuraCost = function(hb) {
    if (!hb) return { pct: 50, label: '50%' };
    let custo = 50; // base 50%
    const allR = [...(hb.rg||[]), ...(hb.rc||[])];

    // Build full restriction DB including all categories
    const allRDB = [];
    const rg = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
    if (rg) {
        ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => {
            const peso = k === 'variaveis' ? 'variavel' : k.replace(/s$/, '');
            (rg[k]||[]).forEach(r => allRDB.push({...r, peso}));
        });
    }
    // Include ALL category restrictions (not just current char's class)
    if (window.HATSU_DB && window.HATSU_DB.categorias) {
        Object.values(window.HATSU_DB.categorias).forEach(cat => {
            if (cat && cat.restricoes) cat.restricoes.forEach(r => {
                if (!allRDB.find(x => x.id === r.id)) allRDB.push(r);
            });
        });
    }

    let numPesadas = 0, hasExtrema = false;

    allR.forEach(id => {
        const item = allRDB.find(r => r.id === id);
        if (!item) return;
        const peso = item.peso || 'leve';
        if (peso === 'pesada') numPesadas++;
        if (peso === 'extrema') hasExtrema = true;

        // rg_l2: Cálculo Pensado 2 — Reduz em 5%
        if (id === 'rg_l2') custo -= 5;
        // rg_m2: Área Definida — Reduz custo em 10%
        if (id === 'rg_m2') custo -= 10;
        // ri_e18 (Intensificação): Estabilização de Aura — Diminui 15%
        // ri_e18 saiu daqui: ele é EFEITO, não restrição — ver o bloco abaixo.

        // ── Benefícios de CUSTO DE AURA que nunca eram lidos ────────────────────
        // O cálculo reconhecia só três identificadores. Restrições com benefício de
        // aura escrito no banco (ex.: "−15% de aura") simplesmente não faziam nada:
        // o jogador escolhia a opção e o custo continuava igual.
        //
        // Quando o benefício é uma ESCOLHA ("+2 Rodadas OU −15% de aura"), só conta
        // se o jogador tiver marcado a opção de aura em beneficioChoices.
        const esc = String((hb.beneficioChoices || {})[id] || '').toLowerCase();
        const escolheuAura = esc.includes('aura') || esc.includes('%');

        // rg_m10: Limite de Uso Definitivo — "+2 Rodadas ou −15% de aura"
        if (id === 'rg_m10' && escolheuAura) custo -= 15;
        // rg_p14: Técnica Elementar — o desconto é na TÉCNICA, não no Hatsu.
        // (Leitura anterior estava errada: eu cortava o custo do Hatsu pela metade.
        //  A regra diz "o Hatsu depende de uma Técnica" e "A TÉCNICA custa metade
        //  da aura" — o desconto é aplicado na ativação da técnica, ver _ativConfirmar.)
        // rm_p2: Conjuração Controlável — "... ou custo −15% ou ..."
        if (id === 'rm_p2' && escolheuAura) custo -= 15;

        // Benefícios cobrados POR UNIDADE (rg_e1, rg_v9, rg_v12). A quantidade vem do
        // seletor do criador, em specialChoices[id + '_qtd'] — ver CUSTO_AURA_QUANTIDADE.
        const _cfgQtd = (window.CUSTO_AURA_QUANTIDADE || {})[id];
        if (_cfgQtd && (!_cfgQtd.exigeEscolhaAura || escolheuAura)) {
            custo += window.custoAuraQuantidade(id, hb.specialChoices || {});
        }
    });

    // eg8: Redução de Custo — soma todas as reduções aplicáveis
    const hasEg8 = (hb.eg||[]).includes('eg8') || (hb.ec||[]).includes('eg8');
    if (hasEg8) {
        let eg8Reducao = 5; // base: -5%
        if (numPesadas >= 2) eg8Reducao += 10; // +mais 10% por 2 pesadas
        if (hasExtrema) eg8Reducao += 25;       // +mais 25% por extrema
        custo -= eg8Reducao;
    }

    // Graus genéricos ("Adicione X Graus de Potência em qualquer característica")
    // que o jogador mandou para Redução de Custo: 1 grau = -5% de aura.
    if (window.grausGenericosDoHatsu) {
        const _gen = window.grausGenericosDoHatsu({
            restricoes: allR, efeitos: [].concat(hb.eg || [], hb.ec || []),
            specialChoices: hb.specialChoices || {},
            beneficioChoices: hb.beneficioChoices || {},
            pureRestrictions: hb.pureRestrictions || {},
        });
        if (_gen.custo) custo -= _gen.custo * 5;
    }

    // rg_p8: Local/Condição Específica — reduz à metade (mínimo 5%)
    if (allR.includes('rg_p8')) custo = Math.max(5, Math.floor(custo / 2));

    // O custo de aura só existe em incrementos de 5% — qualquer redução que não preserve isso
    // (ex: rg_p8 dividindo por 2) precisa ser arredondada pro múltiplo de 5 mais próximo.
    custo = Math.round(custo / 5) * 5;

    // ── ri_e18 Estabilização de Aura: −15%, mínimo 10% ──────────────────────────
    // Estava escrito DENTRO do laço das restrições, e o `ri_e18` é um EFEITO de
    // Intensificação: aquele laço varre `hb.rg` + `hb.rc` e procura o id no banco de
    // RESTRIÇÕES, então o `if` nunca chegava a rodar. Na prática o jogador gastava
    // 1 P.N em "Diminui custo de aura do Hatsu em 15%" e o custo não mudava nada.
    //
    // O mínimo de 10% é do texto do próprio efeito, e não o piso geral de 5% — por
    // isso ele fica aqui, com o número que o livro imprime.
    if ([].concat(hb.eg || [], hb.ec || []).indexOf('ri_e18') >= 0) {
        custo = Math.max(10, custo - 15);
    }

    // ── Efeitos que ACRESCENTAM custo por categoria de tamanho ──────────────────
    // "+10% por categoria de tamanho acima do usuário" (rm_e22…rm_e25). Entra depois
    // dos descontos, e por isso pode levar um Hatsu barato de volta para cima — é o
    // único ponto do cálculo que sobe o preço.
    (function () {
        const _todosEf = [].concat(hb.eg || [], hb.ec || []);
        (window.CUSTO_AURA_TAMANHO || []).forEach(function (id) {
            if (_todosEf.indexOf(id) < 0) return;
            const cat = window.categoriasTamanhoDeclaradas(id, hb.specialChoices || {});
            custo += cat * (window.CUSTO_AURA_TAMANHO_PCT || 10);
        });
    })();

    // Piso de 5%, decisão de regra do Lucas (28/10). Era 10% aqui, e isso anulava em
    // silêncio o próprio piso de 5% do rg_p8 logo acima: um Hatsu que caísse para 5%
    // pela metade do rg_p8 voltava para 10% nesta linha.
    custo = Math.max(5, custo);
    return { pct: custo, label: custo + '% de Aura' };
};

// Hexágono de afinidade entre categorias (padrão HxH)
// Posições no hexágono (sentido horário, baseado nos ângulos de SYSTEM_DB):
//   INTENSIFICAÇÃO(270°) → TRANSMUTAÇÃO(330°) → MATERIALIZAÇÃO(30°) → ESPECIALIZAÇÃO(90°) → MANIPULAÇÃO(150°) → EMISSÃO(210°)
// Adjacentes (1 posição) = 80% | 2 posições = 60% | Opostos (3 posições) = 40%
// Especialização é excluída do acesso cruzado padrão — regra especial para Manipulação/Materialização
window.CATEGORY_AFFINITY = {
    'INTENSIFICAÇÃO': { 'TRANSMUTAÇÃO':80, 'EMISSÃO':80, 'MATERIALIZAÇÃO':60, 'MANIPULAÇÃO':60 },
    'TRANSMUTAÇÃO':   { 'INTENSIFICAÇÃO':80, 'MATERIALIZAÇÃO':80, 'EMISSÃO':60, 'MANIPULAÇÃO':40 },
    'MATERIALIZAÇÃO': { 'TRANSMUTAÇÃO':80, 'INTENSIFICAÇÃO':60, 'MANIPULAÇÃO':60, 'EMISSÃO':40 },
    'MANIPULAÇÃO':    { 'EMISSÃO':80, 'MATERIALIZAÇÃO':60, 'INTENSIFICAÇÃO':60, 'TRANSMUTAÇÃO':40 },
    'EMISSÃO':        { 'MANIPULAÇÃO':80, 'INTENSIFICAÇÃO':80, 'TRANSMUTAÇÃO':60, 'MATERIALIZAÇÃO':40 },
    'ESPECIALIZAÇÃO': { 'MATERIALIZAÇÃO':80, 'MANIPULAÇÃO':80, 'TRANSMUTAÇÃO':60, 'EMISSÃO':60, 'INTENSIFICAÇÃO':40 },
    'REFORÇO':        { 'TRANSMUTAÇÃO':80, 'EMISSÃO':80, 'MATERIALIZAÇÃO':60, 'MANIPULAÇÃO':60 },
};

// Dado um nível efetivo (ajustado por restrições extremas), retorna o nível máximo de efeitos acessível por afinidade
// Tabela: nível efetivo → {100: maxLvl, 80: maxLvl, 60: maxLvl, 40: maxLvl}
window.calcCategoryAccess = function(charLevel, extremeRestrictionCount) {
    const efectiveLevel = Math.min(12, charLevel + (extremeRestrictionCount * 2));
    const table = [
        // [lvl, 100%, 80%, 60%, 40%]
        [0,  0,  0,  0,  0],
        [1,  1,  0,  0,  0],
        [2,  2,  0,  0,  0],
        [3,  3,  1,  0,  0],
        [4,  4,  2,  0,  0],
        [5,  5,  3,  1,  0],
        [6,  6,  4,  2,  0],
        [7,  7,  5,  3,  1],
        [8,  8,  6,  4,  2],
        [9,  9,  7,  5,  3],
        [10, 10,  8,  6,  4],
        [11, 11,  9,  7,  5],
        [12, 12, 10,  8,  6],
    ];
    const row = table[Math.min(efectiveLevel, 12)] || table[0];
    return { pct100: row[1], pct80: row[2], pct60: row[3], pct40: row[4] };
};

// rev. Manual 2.0 — Limite de Grau de Potência por nível (soma de Graus/Passo por característica,
// dentro ou fora do Hatsu). Diferente de calcCategoryAccess (acesso a efeitos de OUTRA categoria).
window.calcMaxGrauPorNivel = function(charLevel) {
    const lvl = parseInt(charLevel) || 1;
    if (lvl >= 11) return Infinity;
    if (lvl >= 9)  return 15;
    if (lvl >= 7)  return 12;
    if (lvl >= 5)  return 7;
    if (lvl >= 3)  return 5;
    return 3;
};

// Verifica se Manipulação/Materialização cumpre a regra especial para acessar Especialização (1%)
// Regra: restrições >= 3 + nº efeitos de especialização comprados; distribuição obedece pirâmide de pesos
window.checkEspecializacaoAccess = function(hb) {
    if (!hb) return { ok: false, specEfeitos: 0, totalRestr: 0, needed: 3, rule: null };

    // Conta efeitos de especialização já selecionados
    const espDB = window.HATSU_DB.categorias['ESPECIALIZAÇÃO'];
    const espEfeitosIds = new Set((espDB && espDB.efeitos || []).map(e => e.id));
    const specEfeitos = (hb.ec||[]).filter(id => espEfeitosIds.has(id)).length;
    const needed = 3 + specEfeitos;

    // Coleta pesos de todas as restrições selecionadas
    const allRDB = [];
    const rg = window.HATSU_DB.restricoes_gerais;
    ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => (rg[k]||[]).forEach(r => allRDB.push({...r, peso: k === 'variaveis' ? 'variavel' : k.replace('s','')})));
    const catDB = window.HATSU_DB.categorias[window._currentBuilderClass||''];
    if (catDB && catDB.restricoes) catDB.restricoes.forEach(r => allRDB.push(r));

    const weightOrder = ['leve','moderada','pesada','extrema']; // variável não conta para pirâmide
    const counts = { leve:0, moderada:0, pesada:0, extrema:0, variavel:0 };
    const allSel = [...(hb.rg||[]), ...(hb.rc||[])];
    allSel.forEach(id => {
        const r = allRDB.find(x => x.id === id);
        if (r) {
            const p = r.peso || 'leve';
            if (counts[p] !== undefined) counts[p]++;
        }
    });
    const totalRestr = allSel.length;

    // Regra de pirâmide: nunca pode ter mais de um peso que o peso imediatamente superior
    // "inicia com uma de cada peso E uma de peso menor, nunca pode ter maior quantidade do que as de peso maior"
    let pyramidOk = true;
    let pyramidMsg = '';
    // Pesada deve ser >= moderada; moderada >= leve (para os pesos definidos)
    if (counts.leve > counts.moderada && counts.moderada > 0) { pyramidOk = false; pyramidMsg = `Leves (${counts.leve}) > Moderadas (${counts.moderada}) — inválido`; }
    if (counts.moderada > counts.pesada && counts.pesada > 0) { pyramidOk = false; pyramidMsg = `Moderadas (${counts.moderada}) > Pesadas (${counts.pesada}) — inválido`; }

    const ok = totalRestr >= needed && pyramidOk;
    return { ok, specEfeitos, totalRestr, needed, counts, pyramidOk, pyramidMsg };
};

// Retorna o nível máximo de efeitos que o personagem pode usar de uma categoria externa
window.getMaxLevelForCategory = function(myClass, targetClass, charLevel, extremeCount) {
    const access = window.calcCategoryAccess(charLevel, extremeCount);
    if (myClass === targetClass) return access.pct100;

    // Especialização: acesso APENAS para Manipulação/Materialização via regra especial
    if (targetClass === 'ESPECIALIZAÇÃO') {
        if (myClass === 'MANIPULAÇÃO' || myClass === 'MATERIALIZAÇÃO') return 'check_esp'; // sinaliza verificação especial
        return 0; // outras categorias: zero acesso
    }

    const affinityMap = window.CATEGORY_AFFINITY[myClass] || {};
    const pct = affinityMap[targetClass] || 0;
    if (pct >= 80) return access.pct80;
    if (pct >= 60) return access.pct60;
    if (pct >= 40) return access.pct40;
    return 0;
};

// Calcula P.N gastos em OUTROS hatsus do personagem (excluindo o hatsu sendo editado)
window.calcPNSpentInDominio = function(char) {
    const d = char.nenDominio || {};
    let spent = 0;
    // Fundamentais: Ten, Ren, Zetsu → 1 ponto por nível (0-3) + Aprimoramento (P.N extra após a Maestria)
    spent += (d.ten || 0) + (d.ten===3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.ten_pn||0) : 0);
    spent += (d.ren || 0) + (d.ren===3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.ren_pn||0) : 0);
    spent += (d.zetsu || 0) + (d.zetsu===3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.zetsu_pn||0) : 0);
    // Avançados: 1 P.N para desbloquear + 1 P.N para o nível Superior + Aprimoramento (até 8 P.N extra)
    window.NEN_AVANCADOS.forEach(function(key) {
        if (!d[key]) return;
        spent += 1;
        if (d[key + '_sup']) {
            spent += 1;
            spent += Math.min(window.PN_APRIMORAMENTO_MAX, d[key + '_pn'] || 0);
        }
    });
    // Instâncias Shingen-Ryu: 2 P.N no Nível 1 e 3 no Nível 2, do MESMO bolo.
    // Somadas aqui de propósito. Todo cálculo de P.N disponível do app (criador de
    // Hatsu, ficha, nível do Hatsu, _pnLivreDoPersonagem) já subtrai esta função —
    // são 8 pontos diferentes. Criar uma subtração separada em cada um deles daria
    // na mesma conta em 8 lugares e, na prática, significaria esquecer um.
    if (window.calcPNSpentInInstancias) spent += window.calcPNSpentInInstancias(char);
    return spent;
};

// Chaves dos Princípios/Técnicas Avançadas (desbloqueio 1 P.N + Superior 1 P.N + Aprimoramento até 8 P.N)
window.NEN_AVANCADOS = ['en', 'inp', 'gyo', 'shu', 'ken', 'ko', 'ryu'];

// ── Aprimoramento — bônus vivos calculados a partir do P.N investido em cada Princípio/Técnica ──
// (ver "Atualizações -> Princípios e Técnicas de Nen")

// TEN: Maestria (+6 RD) + 1 RD para cada P.N investido alem da Maestria (máx. P.N total = 10)
// ── Teto de P.N por Aprimoramento ────────────────────────────────────────────
// Cada caixa "APRIMORANDO <princípio>" do capítulo de Domínio de NEN repete a mesma
// frase: "Além da maestria (ou do nível Superior), o máximo de P.N aplicáveis é = 10."
// O app usava 7 nos fundamentais e 8 nos avançados, em 18 lugares diferentes — então
// um TEN em maestria com 10 P.N rendia RD 13 em vez de 16, e o P.N acima do teto nem
// era contado como gasto: o jogador investia e não recebia nada.
// Vale para TODOS: TEN, REN, ZETSU, EN, IN, GYO, SHU, KEN, KO e RYU.
window.PN_APRIMORAMENTO_MAX = 10;

window.calcTenRD = function(char) {
    const d = (char && char.nenDominio) || {};
    const lvl = d.ten || 0;
    if (!lvl) return 0;
    const base = lvl === 1 ? 2 : lvl === 2 ? 4 : 6;
    const extra = lvl === 3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.ten_pn || 0) : 0;
    // Instância Combatente Tanque, nível 1: "+5 na RD do seu TEN". Entra aqui e não
    // em calcFontesRD porque é a RD DO TEN que cresce — assim o número certo já sai
    // em todo lugar que consulta o TEN, inclusive na fonte "TEN (ativo)" do modal de
    // Dano Recebido. Exige TEN treinado: sem TEN não há RD para aumentar.
    const inst = ((char && char.instancias) || {});
    const tanque = (parseInt(inst.combatente_tanque) || 0) >= 1 ? 5 : 0;
    return base + extra + tanque;
};

// REN: grau/passo de dano (sempre ativo a partir do Básico) + testes de Intimidação/Arcanismo-Religião
// (Intermediário/Maestria). Aprimoramento: Opção 1 = +1 Grau por P.N | Opção 2 = +1 nos testes por P.N.
window.calcRenBonus = function(char) {
    const d = (char && char.nenDominio) || {};
    const lvl = d.ren || 0;
    if (!lvl) return { grau: 0, teste: 0, teste1x: 0, freeUso: false, opcao: 1, extra: 0 };
    const opcao = d.ren_opcao || 1;
    const extra = lvl === 3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.ren_pn || 0) : 0;
    let grau = 1;
    let teste = lvl >= 2 ? 3 : 0;
    let teste1x = lvl >= 3 ? 6 : 0;
    if (extra > 0) {
        if (opcao === 1) grau += extra;
        else { teste += extra; teste1x += extra; }
    }
    return { grau, teste, teste1x, freeUso: lvl >= 3, opcao, extra };
};

// ZETSU: recuperação de aura + Furtividade. Aprimoramento: Opção 1 = +5% recuperação a cada 2 P.N |
// Opção 2 = +1 em Furtividade por P.N.
window.calcZetsuBonus = function(char) {
    const d = (char && char.nenDominio) || {};
    const lvl = d.zetsu || 0;
    if (!lvl) return { auraPct: 0, furtividade: 0, reacoes: 0, rodadas: 0, opcao: 1, extra: 0 };
    const opcao = d.zetsu_opcao || 1;
    const extra = lvl === 3 ? Math.min(window.PN_APRIMORAMENTO_MAX, d.zetsu_pn || 0) : 0;
    const base = lvl === 1 ? { auraPct: 5, furtividade: 3, reacoes: 1, rodadas: 3 }
        : lvl === 2 ? { auraPct: 10, furtividade: 3, reacoes: 1, rodadas: 2 }
        : { auraPct: 10, furtividade: 6, reacoes: 2, rodadas: 1 };
    if (extra > 0) {
        if (opcao === 1) base.auraPct += Math.floor(extra / 2) * 5;
        else base.furtividade += extra;
    }
    return Object.assign({ opcao, extra }, base);
};

// Tabelas de fluidez do RYU. Exemplos 1-3 disponíveis a partir da Maestria em TEN+REN+ZETSU;
// Exemplos 4-6 (com Reações Extras) exigem RYU Superior.
//
// O comentário anterior dizia que, do 4º turno em diante, o jogador escolheria livremente
// entre as linhas de qualquer tabela. NÃO é isso: o jogador escolhe UMA tabela na ativação
// e segue a ordem dela até o fim (regra confirmada pelo Lucas). As seis tabelas são
// ORDENS diferentes das mesmas três linhas finais — por isso escolher a tabela é escolher
// em que turno cada linha vai cair, que é a decisão tática do princípio.
//
// A leitura é por TURNO do usuário, e não por rodada da mesa:
//   turnos 1, 2 e 3 → linha "3 iniciais"      turno 4 → linha 4º
//   turno 5 → linha 5º                       turno 6 → linha 6º (último)
window.NEN_RYU_TABLES = [
    { nome: 'Exemplo 1', superior: false, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: null, ataqueDano: 3 },
        { turno: '4º', ca: 3, reacoes: null, ataqueDano: 2 },
        { turno: '5º', ca: 4, reacoes: null, ataqueDano: 2 },
        { turno: '6º', ca: 5, reacoes: null, ataqueDano: 5 },
    ]},
    { nome: 'Exemplo 2', superior: false, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: null, ataqueDano: 3 },
        { turno: '4º', ca: 4, reacoes: null, ataqueDano: 2 },
        { turno: '5º', ca: 5, reacoes: null, ataqueDano: 5 },
        { turno: '6º', ca: 3, reacoes: null, ataqueDano: 2 },
    ]},
    { nome: 'Exemplo 3', superior: false, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: null, ataqueDano: 3 },
        { turno: '4º', ca: 5, reacoes: null, ataqueDano: 5 },
        { turno: '5º', ca: 4, reacoes: null, ataqueDano: 2 },
        { turno: '6º', ca: 3, reacoes: null, ataqueDano: 2 },
    ]},
    { nome: 'Exemplo 4', superior: true, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: 3, ataqueDano: 3 },
        { turno: '4º', ca: 3, reacoes: 1, ataqueDano: 2 },
        { turno: '5º', ca: 5, reacoes: 0, ataqueDano: 5 },
        { turno: '6º', ca: 4, reacoes: 2, ataqueDano: 2 },
    ]},
    { nome: 'Exemplo 5', superior: true, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: 3, ataqueDano: 3 },
        { turno: '4º', ca: 4, reacoes: 2, ataqueDano: 2 },
        { turno: '5º', ca: 3, reacoes: 1, ataqueDano: 2 },
        { turno: '6º', ca: 5, reacoes: 0, ataqueDano: 5 },
    ]},
    { nome: 'Exemplo 6', superior: true, linhas: [
        { turno: '3 iniciais', ca: 3, reacoes: 3, ataqueDano: 3 },
        { turno: '4º', ca: 5, reacoes: 0, ataqueDano: 5 },
        { turno: '5º', ca: 3, reacoes: 1, ataqueDano: 2 },
        { turno: '6º', ca: 4, reacoes: 2, ataqueDano: 2 },
    ]},
];

// ── Estado vivo do RYU ─────────────────────────────────────────────
// Antes destas funções o RYU era meio decorativo: ligar somava +3 fixos na CA e mais
// nada. O "Ataque+Dano" das tabelas nunca chegava a uma rolagem, as Reações Extras dos
// Exemplos 4-6 nunca chegavam ao total de Reações, e as quatro linhas de cada tabela
// ficavam só como texto num cartão — o jogador tinha que fazer a conta na mão.
//
// Agora o princípio guarda DUAS coisas na ficha: qual tabela foi escolhida
// (char.ryuTabela) e em que turno ele está (char.ryuTurno). Dessas duas sai a linha
// vigente, e da linha saem os três números que a ficha passa a aplicar sozinha.
window.RYU_TURNOS_MAX = 6;

// Quais tabelas o personagem pode escolher. As de Superior só aparecem com ryu_sup.
window.tabelasRyuDisponiveis = function (char) {
    const d = (char && char.nenDominio) || {};
    return (window.NEN_RYU_TABLES || [])
        .map(function (t, i) { return { i: i, tabela: t }; })
        .filter(function (o) { return !o.tabela.superior || !!d.ryu_sup; });
};

// Qual linha vale no turno N. Os três primeiros turnos compartilham a linha 0.
window.linhaRyuDoTurno = function (tabela, turno) {
    if (!tabela || !tabela.linhas) return null;
    const max = window.RYU_TURNOS_MAX || 6;
    const t = Math.max(1, Math.min(max, parseInt(turno) || 1));
    return tabela.linhas[t <= 3 ? 0 : (t - 3)] || null;
};

// O que o RYU está somando AGORA. Devolve null quando o princípio não está ligado,
// que é o jeito de todos os pontos de aplicação (CA, acerto, dano, reações) pularem
// o cálculo com um único if.
//
// O Aprimoramento do RYU dá "+1 a cada 2 P.N extra em TODOS os valores das tabelas",
// então o mesmo `extra` entra na CA, no Ataque+Dano e nas Reações.
window.calcRyuAtivo = function (char) {
    if (!char) return null;
    if (!(((char.principiosAtivos) || {}).ryu)) return null;
    const idx = parseInt(char.ryuTabela);
    const tabela = (window.NEN_RYU_TABLES || [])[isNaN(idx) ? 0 : idx];
    if (!tabela) return null;
    const max = window.RYU_TURNOS_MAX || 6;
    const turno = Math.max(1, Math.min(max, parseInt(char.ryuTurno) || 1));
    const linha = window.linhaRyuDoTurno(tabela, turno);
    if (!linha) return null;
    const b = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'ryu') : { tabelaBonus: 0 };
    const extra = b.tabelaBonus || 0;
    // Nas tabelas sem Superior o campo reacoes é null (não existe a linha de Reações).
    // Já um 0 nas tabelas de Superior é um zero de verdade — é o turno do golpe forte,
    // que troca todas as Reações por +5 de Ataque e Dano. Por isso os dois casos não
    // podem ser confundidos, e quem distingue é o temReacoes.
    return {
        tabelaIdx: isNaN(idx) ? 0 : idx,
        tabela: tabela.nome,
        superior: !!tabela.superior,
        turno: turno,
        turnoRotulo: linha.turno,
        ultimoTurno: turno >= max,
        ca: linha.ca + extra,
        ataqueDano: linha.ataqueDano + extra,
        temReacoes: linha.reacoes != null,
        reacoes: linha.reacoes == null ? 0 : (linha.reacoes + extra),
        extra: extra
    };
};

// ── O RYU só alcança combate direto ──────────────────────────────────────────
// O RYU é GYO em tempo real espalhado pelo corpo: ele é a evolução máxima do
// combate DIRETO, não um multiplicador geral de dano. Por decisão de regra do
// Lucas, o bônus da tabela vale em:
//   • ataque corpo-a-corpo, desarmado ou armado;
//   • arma de arremesso (a aura acompanha a arma que a mão lançou);
// e NÃO vale em projétil, alcance ou área — nem em arma de disparo (arco,
// besta, arma de fogo, arma de cerco), porque nelas a aura fica na arma e não
// no projétil que sai dela.
//
// Sem este recorte o RYU somava em tudo, inclusive num Hatsu de explosão a 30m,
// e virava o princípio mais eficiente do jogo justamente longe do corpo-a-corpo.

// Armas: a decisão sai do ITEM_DB, que já separa corpo-a-corpo de distância na
// própria categoria e marca o arremesso por etiqueta. "Ataque Desarmado" não é
// item nenhum, então entra por nome.
window.RYU_CATEGORIAS_ARMA = ['simples_corpo_a_corpo', 'marciais_corpo_a_corpo'];

window.ryuAlcancaArma = function (dadosDoItem, nomeDaArma) {
    // Punho é corpo-a-corpo por definição — e é o caso mais comum do princípio.
    if (/^ataque desarmado/i.test(String(nomeDaArma || '').trim())) return true;
    if (!dadosDoItem) return false;   // item fora do ITEM_DB: não dá para afirmar
    const sub = dadosDoItem.sub || '';
    if ((window.RYU_CATEGORIAS_ARMA || []).indexOf(sub) >= 0) return true;
    // Arremesso: a adaga lançada, a azagaia, o shuriken. A etiqueta é a mesma que
    // o livro usa, e vem com o alcance entre parênteses — por isso o teste é por
    // prefixo, e não por igualdade.
    return (dadosDoItem.tags || []).some(function (t) {
        return /^arremesso/i.test(String(t).trim());
    });
};

// Hatsus: aqui o app sozinho não consegue decidir, e por isso há três faixas.
//
// A ficha calcula quantos metros de ALCANCE e de ÁREA o Hatsu comprou:
//
//   sem alcance e sem área  → "Pessoal / Toque": acontece no corpo. RYU entra
//                             direto, sem perguntar nada ao jogador.
//   com ÁREA, ou Projétil   → explosão ou projétil. RYU nunca entra, e não há
//   de Aura                   o que perguntar.
//   só com ALCANCE          → pode ser uma adaga arremessada tanto quanto uma
//                             rajada. Os metros não distinguem as duas, e só o
//                             jogador sabe — então o app PERGUNTA, uma vez por
//                             Hatsu, e guarda a resposta em h.ryuEntrega.
//
// A resposta guardada é revalidada a cada rolagem pelo classificaArma: se o
// jogador vender a arma ou renomear o item, o bônus para de valer sozinho em vez
// de ficar preso a um nome que não existe mais.
window.RYU_ENTREGA_DESARMADO = 'desarmado';
window.RYU_ENTREGA_NENHUM = 'nenhum';

window.ryuAlcancaHatsu = function (rollState, hatsu, classificaArma) {
    if (!rollState) return false;
    if (rollState.corpoACorpo) return true;
    if (!rollState.ryuPodePerguntar) return false;
    const e = hatsu && hatsu.ryuEntrega;
    if (!e || e === window.RYU_ENTREGA_NENHUM) return false;
    if (e === window.RYU_ENTREGA_DESARMADO) return true;
    return typeof classificaArma === 'function' ? !!classificaArma(e) : false;
};

// Só pergunta quando a pergunta muda alguma coisa: ataque de Hatsu, RYU ligado,
// Hatsu na faixa duvidosa e jogador ainda não respondeu por este Hatsu.
window.ryuPrecisaPerguntar = function (char, hatsu, rollState) {
    if (!char || !hatsu || !rollState) return false;
    if (!rollState.hasAttack) return false;
    if (!(((char.principiosAtivos) || {}).ryu)) return false;
    if (rollState.corpoACorpo) return false;
    if (!rollState.ryuPodePerguntar) return false;
    return !hatsu.ryuEntrega;
};

// Quantas graduações extras de dano do REN saem "de graça" (sem custo de aura) por conta da
// Aprimoramento Opção 1 (+1 Grau/Passo por P.N investido além da Maestria). Usado junto com o
// 1º grau grátis diário da Maestria (isRenFreeUsoDisponivel) ao calcular o custo de aura do golpe.
window.calcRenGrausGratisAprimoramento = function(char) {
    const b = window.calcRenBonus ? window.calcRenBonus(char) : { opcao: 1, extra: 0 };
    return b.opcao === 1 ? b.extra : 0;
};

// Avançados/Técnicas — cada um com Superior + Aprimoramento próprios.
window.calcAvancadoBonus = function(char, key) {
    const d = (char && char.nenDominio) || {};
    const active = !!d[key];
    const sup = active && !!d[key + '_sup'];
    const extra = sup ? Math.min(window.PN_APRIMORAMENTO_MAX, d[key + '_pn'] || 0) : 0;
    const opcao = d[key + '_opcao'] || 1;
    const out = { active, sup, extra, opcao };
    switch (key) {
        case 'en':
            out.diametro = (sup ? 6 : 3) + (opcao === 2 ? extra * 1.5 : 0); // Superior dobra o alcance base (3m → 6m)
            out.reacoes = opcao === 1 ? Math.max(1, 2 - extra) : 2;
            break;
        case 'inp':
            out.rodadas = (sup ? 2 : 1) + Math.floor(extra / 2);
            break;
        case 'gyo':
            out.attrBonus = 3 + Math.floor(extra / 2);
            break;
        case 'shu':
            out.rodadas = 1 + extra;
            break;
        case 'ken':
            out.auraCusto = opcao === 1 ? Math.max(5, 30 - extra * 5) : 30;
            out.reacoes = opcao === 2 ? Math.max(1, 4 - extra) : 4;
            break;
        case 'ko':
            out.caBonus = Math.floor(extra / 2);
            break;
        case 'ryu':
            out.tabelaBonus = Math.floor(extra / 2);
            break;
    }
    return out;
};

// ── Gastar mais aura e Reações para escalar o princípio ──────────────────────
// Cap. 6 "Domínio de NEN". Três princípios aceitam pagar PACOTES do custo base:
//
//   TEN  "É possível gastar mais aura para aumentar a RD proporcionalmente, como
//        por exemplo, 40% e 2 reações para +4 RD se o domínio é apenas o nível
//        Básico." Multiplica o MÁXIMO DESBLOQUEADO (decisão de regra do Lucas):
//        um TEN em Maestria com aprimoramento e Combatente Tanque somando RD 16
//        rende 32 com 2 pacotes, não 22.
//   EN   "Para ampliar o efeito de maneira natural, gasta-se +10% de aura e +2
//        reações para aumentar a distância a cada 3m." (30% e 6 Reações = 9m)
//   KEN  "É possível gastar o dobro de aura e Reações para triplicar a CA original
//        no lugar de dobrar." Daí em diante na mesma proporção: 3 pacotes = ×4.
//
// O limite é a aura e as Reações disponíveis, mais o teto do nível — não existe
// teto numérico próprio. O PRINCIPIO_PACOTES_MAX abaixo só evita que a interface
// desenhe uma régua sem fim; o 3º pacote do KEN já custa 90% e 12 Reações.
//
// O SHU também escala, mas com menu de alternativas em vez de pacotes — fica para
// o patch seguinte.
window.PRINCIPIO_PACOTES_MAX = 6;
window.PRINCIPIOS_ESCALAVEIS = ['ten', 'en', 'ken'];
window.principioEscalavel = function (key) {
    return window.PRINCIPIOS_ESCALAVEIS.indexOf(key) >= 0;
};

// Custo de UM pacote: o mesmo custo base do princípio, aura e Reações.
window.custoPacotePrincipio = function (char, key) {
    const d = (char && char.nenDominio) || {};
    const adv = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, key) : {};
    if (key === 'ten') {
        // Eficiência de Aura: Reforço/Intensificação paga 10/5/10 em vez de 20.
        const isR = char && (char.class === 'REFORÇO' || char.class === 'INTENSIFICAÇÃO');
        const nv = d.ten || 1;
        return { aura: isR ? (nv === 2 ? 5 : 10) : 20, reacoes: 1 };
    }
    if (key === 'en') {
        return { aura: 10, reacoes: (adv.reacoes != null) ? adv.reacoes : 2 };
    }
    if (key === 'ken') {
        return { aura: (adv.auraCusto != null) ? adv.auraCusto : 30,
                 reacoes: (adv.reacoes != null) ? adv.reacoes : 4 };
    }
    return null;
};

// Pacotes pagos na ativação atual. 1 = só o custo base (comportamento de sempre).
window.pacotesPrincipio = function (char, key) {
    const p = ((char || {}).principiosPacotes || {})[key];
    return Math.max(1, parseInt(p) || 1);
};

// Quantos pacotes a aura e as Reações de agora permitem pagar.
window.pacotesPossiveisPrincipio = function (char, key) {
    const c = window.custoPacotePrincipio(char, key);
    if (!c) return 1;
    const vit = (char || {}).vitals || {};
    const aura = vit.aura || 0;
    const reaMax = window.calcReacoesMax ? window.calcReacoesMax(char) : 7;
    const rea = (vit.rea !== undefined) ? vit.rea : reaMax;
    const porAura = c.aura > 0 ? Math.floor(aura / c.aura) : window.PRINCIPIO_PACOTES_MAX;
    const porRea = c.reacoes > 0 ? Math.floor(rea / c.reacoes) : window.PRINCIPIO_PACOTES_MAX;
    return Math.max(0, Math.min(window.PRINCIPIO_PACOTES_MAX, porAura, porRea));
};

// RD do TEN já com os pacotes. calcTenRD segue sendo o "máximo desbloqueado" puro,
// porque é ele que a tela de domínio mostra como valor do princípio.
window.calcTenRDAtivo = function (char) {
    const base = window.calcTenRD ? window.calcTenRD(char) : 0;
    return base * window.pacotesPrincipio(char, 'ten');
};
// KEN: 1 pacote dobra a CA, 2 triplicam, 3 quadruplicam.
window.multiplicadorKen = function (char) {
    return 1 + window.pacotesPrincipio(char, 'ken');
};
// EN: +3m de diâmetro por pacote além do primeiro.
window.diametroEnAtivo = function (char) {
    const adv = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'en') : { diametro: 3 };
    return (adv.diametro || 3) + (window.pacotesPrincipio(char, 'en') - 1) * 3;
};

// ── KO: o multiplicador de dano ──────────────────────────────────────────────
// Cap. 6: "Gasta-se 30% de aura e TRIPLICA O DANO, porém reduz a CA em 80% até o
// início do próximo turno."
//
// Até aqui só a PENALIDADE existia: calcCAPrincipios aplicava o −80% de CA e o ×3
// ficava escrito no botão e no balão, sem entrar em rolagem nenhuma. O jogador
// pagava 30% de aura, ficava com a CA em 20% e não recebia nada em troca.
//
// Multiplica o DANO INTEIRO — dados, atributo e bônus fixos. Essa é a exceção à
// convenção do app (crítico e Vida ou Morte dobram só os dados): é justamente o
// tamanho desse ganho que paga a CA reduzida a 20% e o consumo de Reações, e é o
// que impede o KO de virar uso rotineiro.
window.KO_MULTIPLICADOR = 3;
window.multiplicadorDanoKo = function (char) {
    return (((char || {}).principiosAtivos) || {}).ko ? window.KO_MULTIPLICADOR : 1;
};

// ── SHU: menu de alternativas a 5% cada ──────────────────────────────────────
// Cap. 6: "Gasta-se 10% de aura para aplicar +1d4 no Dano e CA ao item de 1m (...)
// por uma rodada." E depois: "É possível gastar 5% a mais de aura para:
//   1. Aumentar a CA ou Dano do item (como REN)
//   2. Aplicar a propriedade de Arma de Cerco
//   3. Aumentar em uma rodada o tempo de duração
//   4. Englobar itens maiores que 1m. Sendo 5% para cada metro"
// O Lucas confirmou que acumula: "é possível acumular pegando 3 coisas diferentes
// ao custo de 15%, mas lembre-se que dura por uma rodada, por padrão."
//
// SHU SUPERIOR muda duas das quatro: "gastar a mesma aura independente do tamanho
// do objeto E aumentar dano e CA ao mesmo tempo". Então no Superior o item 4 sai de
// graça e o item 1 sobe os DOIS em vez de pedir escolha.
//
// "Como REN" no item 1 = um degrau na escada de grau/passo, partindo do 1d4 base.
window.SHU_BASE_AURA = 10;
window.SHU_DADO_BASE = '1d4';
window.SHU_MENU = [
    { id: 'mais',    rotulo: 'Aumentar CA ou Dano (como REN)', custo: 5, tipo: 'contador' },
    { id: 'cerco',   rotulo: 'Propriedade Arma de Cerco',      custo: 5, tipo: 'toggle'   },
    { id: 'duracao', rotulo: '+1 rodada de duração',           custo: 5, tipo: 'contador' },
    { id: 'tamanho', rotulo: 'Englobar +1m de tamanho',        custo: 5, tipo: 'contador' },
];
window.SHU_MENU_MAX = 6;   // só para a interface não virar régua infinita

window.escolhasShu = function (char) {
    const e = ((char || {}).shuEscolhas) || {};
    return {
        mais: Math.max(0, parseInt(e.mais) || 0),
        alvoMais: (e.alvoMais === 'ca') ? 'ca' : 'dano',
        cerco: !!e.cerco,
        duracao: Math.max(0, parseInt(e.duracao) || 0),
        tamanho: Math.max(0, parseInt(e.tamanho) || 0),
        item: e.item || '',
    };
};

// Custo total: 10% de base + 5% por unidade escolhida. No Superior o tamanho é grátis.
window.custoShu = function (char, esc) {
    const e = esc || window.escolhasShu(char);
    const sup = !!(((char || {}).nenDominio) || {}).shu_sup;
    let pct = window.SHU_BASE_AURA;
    pct += 5 * e.mais;
    pct += e.cerco ? 5 : 0;
    pct += 5 * e.duracao;
    if (!sup) pct += 5 * e.tamanho;
    return pct;
};

// Estado do SHU ativo: dados de dano e CA, duração, Arma de Cerco e o item envolvido.
window.calcShuAtivo = function (char) {
    const e = window.escolhasShu(char);
    const sup = !!(((char || {}).nenDominio) || {}).shu_sup;
    const T = window.DAMAGE_TABLE || ['1d4', '1d6', '1d8'];
    const i0 = Math.max(0, T.indexOf(window.SHU_DADO_BASE));
    const sobe = function (passos) { return T[Math.min(i0 + Math.max(0, passos), T.length - 1)]; };
    // No Superior os passos valem para os dois ao mesmo tempo; fora dele, só para o
    // alvo escolhido — "Aumentar a CA OU Dano do item".
    const passosDano = sup ? e.mais : (e.alvoMais === 'dano' ? e.mais : 0);
    const passosCA   = sup ? e.mais : (e.alvoMais === 'ca'   ? e.mais : 0);
    // No Dano o item 1 anda na escada ("como REN"); na CA ele é +1 por compra.
    const dadoDano = sobe(passosDano);
    // A CA NÃO usa escada nem média: o livro dá "+1d4 no Dano e CA", e o Lucas
    // confirmou que é o RESULTADO do 1d4 que entra na CA — não a média. O dado é
    // rolado UMA vez, na ativação, e guardado em char.shuCaRolado: a CA é um número
    // só na ficha, e rolar a cada render faria ela dançar entre 11 e 14.
    // E o item 1 do menu vale "+1 na CA para cada 5%" (decisão do Lucas), em vez do
    // degrau de escada que vale só para o Dano.
    // 0 = ainda não rolado (é o que o balão usa para mostrar "1d4 + N" na prévia).
    // O Math.max(1, ...) que eu tinha escrito aqui forçava 1 nesse caso e inventava
    // um bônus que ninguém rolou.
    const _cr = parseInt((char || {}).shuCaRolado) || 0;
    const caRolado = _cr > 0 ? Math.min(4, _cr) : 0;
    const adv = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'shu') : { rodadas: 1 };
    return {
        sup: sup,
        dadoDano: dadoDano,
        caRolado: caRolado,
        caPasso: passosCA,
        caBonus: caRolado + passosCA,
        cerco: e.cerco,
        rodadas: (adv.rodadas || 1) + e.duracao,
        metros: 1 + e.tamanho,
        item: e.item,
        custo: window.custoShu(char, e),
    };
};

window.calcPNSpentInOtherHatsus = function(char, editingIdx) {
    if (!char || !char.hatsus) return 0;
    let spent = 0;
    char.hatsus.forEach((h, idx) => {
        if (editingIdx !== undefined && idx === editingIdx) return;
        spent += (h.pnUsados || 0);
    });
    return spent;
};

// Quanto P.N. sobra para ESTE Hatsu. Estava declarada e nunca chamada enquanto o
// criador refazia a mesma conta em quatro lugares — o risco apontado na auditoria de
// 28/10 ("o criador recalcula por conta própria — risco de divergir"). Agora os quatro
// chamam daqui.
window.calcPNDisponivelParaHatsu = function(char, editingIdx) {
    const total = window.calcularPHBase ? window.calcularPHBase(char.level) : 6;
    const dominio = window.calcPNSpentInDominio(char);
    const outros  = window.calcPNSpentInOtherHatsus(char, editingIdx);
    return Math.max(0, total - dominio - outros);
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRANSMUTACAO_DB — subtipos de Transmutação Elemental e Versátil
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


// ── Acesso a efeitos de OUTRAS categorias (Manual de Hatsus, p6) ──────────────
// A tabela "Acesso a Categorias" já existe em calcCategoryAccess. Estas funções
// só a colocam para trabalhar nos pickers de efeito (eg6 e rm_e8).

// Nível do efeito, lido do próprio req ("Nível 3", "Nível 5 SAB 4+"...).
window.nivelDoEfeito = function (e) {
    const m = String((e && e.req) || '').match(/N[íi]vel\s+(\d+)/i);
    return m ? parseInt(m[1]) : 1;
};

// Efeito "sem pré-requisito": o req não exige nada além do nível.
// Ex.: "Nível 2" passa; "Nível 3 SAB 4+" ou "Nível 5, Anticoagulante" não.
window.efeitoSemPreRequisito = function (e) {
    const resto = String((e && e.req) || '')
        .replace(/N[íi]vel\s+\d+/ig, '')
        .replace(/[\s,;.:•+\-\/()]/g, '');
    return resto.length === 0;
};

// Restrições Extremas valem +2 níveis na tabela de acesso (NOTA 1 do manual).
window.contarRestricoesExtremas = function (hb) {
    if (!hb) return 0;
    const extremasIds = [];
    const rg = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
    if (rg) (rg.extremas || []).forEach(function (r) { extremasIds.push(r.id); });
    const cats = (window.HATSU_DB && window.HATSU_DB.categorias) || {};
    Object.keys(cats).forEach(function (k) {
        (cats[k].restricoes || []).forEach(function (r) {
            if (r.peso === 'extrema') extremasIds.push(r.id);
        });
    });
    const sel = [].concat(hb.rg || [], hb.rc || []);
    return sel.filter(function (id) { return extremasIds.indexOf(id) >= 0; }).length;
};

// Nível máximo de efeito acessível numa categoria. 0 = sem acesso nenhum.
// Especialização NÃO passa por aqui: ela tem regra própria (pirâmide de restrições).
window.acessoMaxPorCategoria = function (charClass, charLevel, hb, categoria) {
    if (!window.calcCategoryAccess) return 0;
    const acesso = window.calcCategoryAccess(parseInt(charLevel) || 0, window.contarRestricoesExtremas(hb));
    if (categoria === charClass) return acesso.pct100;
    const af = ((window.CATEGORY_AFFINITY || {})[charClass] || {})[categoria];
    if (af === 80) return acesso.pct80;
    if (af === 60) return acesso.pct60;
    if (af === 40) return acesso.pct40;
    return 0;
};
