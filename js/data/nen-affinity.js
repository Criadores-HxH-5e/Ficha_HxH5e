        //HATSU CREATOR — baseado no Manual de Hatsus HxH5e RPG 2.0

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

// ── P.N gasto exclusivamente em compras duplicadas (2Âª cópia em diante do mesmo efeito) ──
window.calcDuplicatePNUsed = function(hb) {
    if (!hb) return 0;
    const allEffects = [...(hb.eg||[]), ...(hb.ec||[])];
    const seenIds = new Set();
    let dupPNUsed = 0;
    const allEDB = [...((window.HATSU_DB && window.HATSU_DB.efeitos_gerais)||[])];
    if (window.HATSU_DB && window.HATSU_DB.categorias) {
        Object.values(window.HATSU_DB.categorias).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allEDB.find(x=>x.id===e.id)) allEDB.push(e); });
        });
    }
    allEffects.forEach(eid => {
        if (seenIds.has(eid)) {
            const effect = allEDB.find(x => x.id === eid);
            if (effect) dupPNUsed += (effect.pn || 0);
        } else {
            seenIds.add(eid);
        }
    });
    return dupPNUsed;
};

// ── Remove duplicatas de efeitos quando o P.N extremo disponível é insuficiente ──
window._hCleanDuplicatesIfNeeded = function(hb) {
    if (!hb) return;
    const extremePurePN = window.calcPNFromExtremeRestr(hb);
    let safety = 50;
    while (safety-- > 0 && window.calcDuplicatePNUsed(hb) > extremePurePN) {
        let removed = false;
        for (let i = (hb.eg||[]).length - 1; i >= 0; i--) {
            const id = hb.eg[i];
            if ((hb.eg||[]).indexOf(id) !== i) { hb.eg.splice(i, 1); removed = true; break; }
        }
        if (!removed) {
            for (let i = (hb.ec||[]).length - 1; i >= 0; i--) {
                const id = hb.ec[i];
                if ((hb.ec||[]).indexOf(id) !== i) { hb.ec.splice(i, 1); removed = true; break; }
            }
        }
        if (!removed) break;
    }
};

// Calcula o custo real de aura do Hatsu com base nas restrições e efeitos selecionados
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
        if (id === 'ri_e18') custo = Math.max(10, custo - 15);
    });

    // eg8: Redução de Custo — soma todas as reduções aplicáveis
    const hasEg8 = (hb.eg||[]).includes('eg8') || (hb.ec||[]).includes('eg8');
    if (hasEg8) {
        let eg8Reducao = 5; // base: -5%
        if (numPesadas >= 2) eg8Reducao += 10; // +mais 10% por 2 pesadas
        if (hasExtrema) eg8Reducao += 25;       // +mais 25% por extrema
        custo -= eg8Reducao;
    }

    // rg_p8: Local/Condição Específica — reduz à metade (mínimo 5%)
    if (allR.includes('rg_p8')) custo = Math.max(5, Math.floor(custo / 2));

    // Garante mínimo de 10%
    custo = Math.max(10, custo);
    return { pct: custo, label: custo + '% de Aura' };
};

// Hexágono de afinidade entre categorias (padrão HxH)
// Posições no hexágono (sentido horário, baseado nos ângulos de SYSTEM_DB):
//   INTENSIFICAÇÃO(270Â°) → TRANSMUTAÇÃO(330Â°) → MATERIALIZAÇÃO(30Â°) → ESPECIALIZAÇÃO(90Â°) → MANIPULAÇÃO(150Â°) → EMISSÃO(210Â°)
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

// Verifica se Manipulação/Materialização cumpre a regra especial para acessar Especialização (1%)
// Regra: restrições >= 3 + nÂº efeitos de especialização comprados; distribuição obedece pirâmide de pesos
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
    // Fundamentais: Ten, Ren, Zetsu → 1 ponto por nível (0-3)
    spent += (d.ten || 0);
    spent += (d.ren || 0);
    spent += (d.zetsu || 0);
    // Avançados: cada um custa 1 ponto extra
    if (d.en)  spent += 1;
    if (d.inp) spent += 1; // IN (inp para não conflitar com keyword)
    if (d.gyo) spent += 1;
    if (d.shu) spent += 1;
    if (d.ken) spent += 1;
    if (d.ko)  spent += 1;
    if (d.ryu) spent += 1;
    return spent;
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

window.calcPNDisponivelParaHatsu = function(char, editingIdx) {
    const total = window.calcularPHBase ? window.calcularPHBase(char.level) : 6;
    const dominio = window.calcPNSpentInDominio(char);
    const outros  = window.calcPNSpentInOtherHatsus(char, editingIdx);
    return Math.max(0, total - dominio - outros);
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRANSMUTACAO_DB — subtipos de Transmutação Elemental e Versátil
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
