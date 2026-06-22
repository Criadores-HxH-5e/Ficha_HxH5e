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
        'eg4': { label:'🎯 Efeito Alternativo' },
        'eg6': { label:'🎯 Poder é Intenção'   },
    };
    Object.keys(_WRAPPER_META).forEach(function(wid) {
        if (!(h.efeitos||[]).includes(wid)) return;
        const pickedName = (h.specialChoices||{})[wid];
        if (!pickedName) return;
        const picked = allEDB.find(function(e){ return e.nome === pickedName; });
        if (picked && !efeitosSel.find(function(e){ return e.id === picked.id; })) {
            efeitosSel.push(Object.assign({}, picked, { _wrapper: wid, _wrapperLabel: _WRAPPER_META[wid].label }));
        }
    });

    // ── Cálculo de Dano Final ──────────────────────────────────────────────────
    const DAMAGE_TABLE = [
        '1d4','1d6','1d8','2d4','1d10','1d12',
        '2d6',  // ← índice 6 (base)
        '3d4','2d8','4d4','3d6','2d10','5d4','2d12',
        '3d8','4d6','6d4','7d4','3d10','5d6','4d8',
        '3d12','8d4','6d6','9d4','4d10','10d4','4d12',
        '5d8','7d6','6d8','8d6','5d10','9d6','7d8',
        '5d12','6d10','10d6','8d8','7d10','6d12','9d8',
        '8d10','10d8','7d12','9d10','8d12','10d10','9d12',
        '10d12'
    ];
    const BASE_DAMAGE_IDX = 6; // 2d6

    // Graus de dano concedidos por restrições/efeitos específicos
    const DANO_GRAU_MAP = {
        // Restrições gerais
        'rg_l1':  1,  // Cálculo Pensado 1 → +1 Grau/Passo
        'rg_l7':  1,  // "Diálogo" → +1 Grau/Passo Dano
        'rg_m1':  2,  // Alvo Único em Combate → +2 Grau/Passo Dano
        'rg_m13': 2,  // Zetsu Protetivo → +2 Grau/Passo (inclui dano)
        'rg_p9':  3,  // Perda de Membros → +3 grau de potência
        'rg_v2':  1,  // Canalizar com Concentração → +X (mín 1)
        // Restrições de categoria
        'ri_l1':  1,  // PV < 75% → +1 grau/passo dano
        'rt_m1':  2,  // Dor Reflexiva Elemental → +2 Graus
        // Efeitos gerais com dano
        'eg7':    1,  // Poder Valioso → +1 Grau de potência
        'eg10':   0,  // Flagelo da Mente → dano psíquico fixo 1d8 (tratado à parte)
        'eg15':   1,  // Dano/Cura Focal → +1 grau/passo
        // Efeitos de Intensificação (graus de dano)
        'ri_e1':  1,'ri_e2': 1,'ri_e3': 2,'ri_e4': 2,'ri_e6': 1,'ri_e8': 2,'ri_e10': 2,
        'ri_e12': 3,'ri_e16': 2,'ri_e20': 3,'ri_e22': 3,'ri_e24': 4,'ri_e26': 4,'ri_e30': 5,
    };

    // +1 DADO: aumenta a QUANTIDADE de dados (ex: 2d6 → 3d6), aplicado ANTES dos graus
    // "o maior" = usa o maior dado atual; "o menor" = usa 1 dado do mesmo tipo
    const DANO_DADO_MAP = {
        'rg_l16': { n: 1, tipo: 'maior' }, // Tempo de Carregamento
        'rg_l11': { n: 1, tipo: 'menor' }, // Limitação de Alvos
        'rt_m3':  { n: 1, tipo: 'maior' }, // Condição no Usuário (Transmutação)
    };

    // Efeitos que CONCEDEM dano próprio (tornam o hatsu "com dano" independente do tipo)
    // Estrutura: id → { dado, desc }
    const DANO_PROPRIO_MAP = {
        'eg10':   { dado: '1d8',      tipo: 'Psíquico',   desc: 'Flagelo da Mente' },
        'eg17':   { dado: '(contínuo)',tipo: 'Contínuo',   desc: 'Dor pra Disgrama!' },
        'ri_e11': { dado: '+ 1d8',    tipo: 'Extra',      desc: 'Golpe Reforçado' },
        'ri_e13': { dado: '+ 1d(maior)',tipo:'Bloquear',   desc: 'Onda Surda' },
        'ri_e20': { dado: '+ 1d6',    tipo: 'Extra',      desc: 'Fúria Potencializada' },
        'rm_e1':  { dado: '2d6',      tipo: 'Arma/Objeto', desc: 'Forjar Objeto/Arma Conjurada' },
        'rc_e1':  { dado: '1d6',      tipo: 'Criatura',   desc: 'Invocar Criatura' },
        'rc_e9':  { dado: '1d8',      tipo: 'Corporal',   desc: 'Metamorfose Corporal' },
        'em_e1':  { dado: '1d8',      tipo: 'Projétil',   desc: 'Projétil de Aura' },
        'em_e3':  { dado: '2d6',      tipo: 'Potente',    desc: 'Disparo Potente' },
        'em_e6':  { dado: '3d6',      tipo: 'Linha',      desc: 'Canhão de Aura' },
        'em_e9':  { dado: '4d6',      tipo: 'Área',       desc: 'Bomba de Aura' },
        'rt_e16': { dado: '+5 dano',  tipo: 'Ferida',     desc: 'Ferida Interna' },
    };

    // Tipos e categorias que têm dano base (2d6 + attr)
    // h.tipo pode ser combinado ex: "hostil+instantaneo" — split para checar cada parte
    const tipoTemDano = ['hostil','versatil','instantaneo'];
    const tiposParts  = (h.tipo||'').split('+').map(t => t.trim());
    const isHostil    = tiposParts.some(t => tipoTemDano.includes(t));
    const catTemDano  = ['INTENSIFICAÇÃO','REFORÇO','TRANSMUTAÇÃO','EMISSÃO'];
    // h.classe é a categoria cross-category do hatsu (ex: EMISSÃO comprada por manipulador)
    const hatsuClasse = h.classe || char.class;
    const catDmg      = catTemDano.some(c => c === hatsuClasse);

    // Verifica se algum efeito selecionado concede dano próprio
    const efeitosComDanoProprio = efeitosSel.filter(e => DANO_PROPRIO_MAP[e.id] && e.id !== 'eg10');
    const flageloCopias = (h.efeitos||[]).filter(id => id === 'eg10').length; // can have multiple copies
    const temFlagelo = flageloCopias > 0;
    const hasEfeitoDano = efeitosComDanoProprio.length > 0 || temFlagelo;

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

    // Hatsu tem dano base se: tipo hostil/versátil/instantâneo, OU categoria ofensiva, OU tem efeito com dano
    const hasBaseDmg = isHostil || catDmg || hasEfeitoDano;

    // Calcula graus totais de dano (só aplica se há dano base)
    let totalGraus = 0;
    const grauSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        let g = DANO_GRAU_MAP[item.id];
        if (!g || g <= 0) return;
        // rg_l16 agora é DADO, não grau — tratado abaixo
        if (item.id === 'rg_l16') return;
        // rg_m13: Zetsu Protetivo — só aplica grau de Dano se escolheu "Dano"
        if (item.id === 'rg_m13') {
            const bc = (h.beneficioChoices||{})['rg_m13'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
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
        // rg_l16: só conta se beneficioChoice foi "dano"
        if (item.id === 'rg_l16') {
            const bc = (h.beneficioChoices||{})['rg_l16'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
        }
        totalDados += d.n;
        dadoSources.push({ nome: item.nome, n: d.n, tipo: d.tipo });
    });

    // Bônus de Talento aplicado a este hatsu
    if (h.bonusGraus && h.bonusGraus.tipo === 'dano') {
        totalGraus += h.bonusGraus.valor;
      grauSources.push({ nome: '💠 Bônus Talentoso', graus: h.bonusGraus.valor });
    }
    // 5 Graus do 1Âº Hatsu — dano
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.dano) {
        totalGraus += h.primeiroHatsuGraus.dano;
        grauSources.push({ nome: '⭐ 1Âº Hatsu (Dano)', graus: h.primeiroHatsuGraus.dano });
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
    const isRanged = (h.efeitos||[]).some(id => ['em_e1','em_e3','em_e6','em_e9','em_e2','em_e14'].includes(id));
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

    // Categorias que usam CD (definido aqui pois é usado no modPickerHtml também)
    const catTemCD = ['MANIPULAÇÃO','MATERIALIZAÇÃO','ESPECIALIZAÇÃO'];
    const hasCDCategory = catTemCD.some(c => c === (h.classe||char.class));

    // Modifier picker — todos os atributos disponíveis, sugeridos destacados com estrela
    const modPickerHtml = (hasBaseDmg || hasCDCategory) ? `<div style="margin-bottom:10px">
        <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">⚔️ Modificador do Ataque</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${ALL_ATTRS.map(a => {
                const active = baseAttr === a;
                const isSugest = modSugest.includes(a);
                const mod = getMod(char.attributes?.[a]?.value || 10);
                return `<button onclick="state.currentChar.hatsus[${idx}].dmgMod='${a}';saveCharacter(state.currentChar);renderHatsuInPlace()"
                    style="flex:1;min-width:52px;padding:7px 4px;border-radius:9px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid ${active?tc:isSugest?tc+'66':'#1f2937'};background:${active?tc+'22':'transparent'};color:${active?tc:isSugest?tc:'#6b7280'};transition:all .15s">
                    ${isSugest?'â˜… ':''}${a} <span style="font-size:8px;opacity:.8">(${mod>=0?'+'+mod:mod})</span>
                </button>`;
            }).join('')}
        </div>
        <div style="font-size:7px;color:#4b5563;margin-top:4px">★ sugerido para ${hatsuClasse}</div>
    </div>` : '';

    let _hatsuFinalDice = null;
    let calcDanoHtml = '';
    if (hasBaseDmg) {
        const danoColor = totalGraus > 0 ? '#f87171' : '#d1d5db';
        const grauDelta = totalGraus > 0 ? `+${totalGraus}` : totalGraus < 0 ? `${totalGraus}` : '';

        // Bloco de dano base (2d6 escalado) — aparece quando hostil/catDmg (sem efeito próprio de dano)
        const eg10modeFinal = (h.specialChoices||{})['eg10'] || 'Complementar';
        const isPuroFlagelo = temFlagelo && eg10modeFinal === 'Puro';
        let baseDmgSection = '';
        if (isHostil || catDmg || isPuroFlagelo) {
            // Step 1: apply +dado (ex: 2d6 → 3d6)
            let baseIdx = isPuroFlagelo ? 4 : BASE_DAMAGE_IDX; // Puro: 1d10 | padrão: 2d6
            let afterDadoNote = '';
            if (totalDados > 0) {
                // Parse current base dice: "2d6" → n=2, d=6
                const baseMatch = DAMAGE_TABLE[baseIdx].match(/^(\d+)d(\d+)$/);
                if (baseMatch) {
                    const n = parseInt(baseMatch[1]) + totalDados;
                    const d = parseInt(baseMatch[2]);
                    // Find this new dice in the table or construct string
                    const newDice = n + 'd' + d;
                    const foundIdx = DAMAGE_TABLE.indexOf(newDice);
                    if (foundIdx >= 0) baseIdx = foundIdx;
                    else { baseIdx = BASE_DAMAGE_IDX; afterDadoNote = newDice; } // use constructed string
                    if (!afterDadoNote) afterDadoNote = '';
                }
            }
            // Se Flagelo Puro: graus extras de cópias somam ao dano base também
            const flageloGrauPuro = isPuroFlagelo ? (flageloCopias - 1) : 0;
            // Step 2: apply graus on top
            const finalIdx = Math.min(baseIdx + totalGraus + flageloGrauPuro, DAMAGE_TABLE.length - 1);
            const finalDice = afterDadoNote && (totalGraus + flageloGrauPuro) === 0 ? afterDadoNote : DAMAGE_TABLE[Math.max(0, finalIdx)];
            _hatsuFinalDice = finalDice;
            // Build info breakdown for popup
            const _infoBase = isPuroFlagelo ? '1d10' : '2d6';
            const _danoInfo = [{ l: 'Base', v: _infoBase, c: '#9ca3af' }];
            if (dadoSources.length > 0) {
                dadoSources.forEach(function(s){ _danoInfo.push({ l: '+' + s.n + ' dado (' + s.tipo + ')', v: s.nome, c: '#fbbf24' }); });
                const _afterDadoV = afterDadoNote || DAMAGE_TABLE[Math.min(baseIdx, DAMAGE_TABLE.length - 1)];
                _danoInfo.push({ l: 'Â Â → após dados', v: _afterDadoV, c: '#fbbf24', i: true });
            }
            grauSources.forEach(function(s){ _danoInfo.push({ l: '+' + s.graus + ' grau' + (s.graus > 1 ? 's' : ''), v: s.nome, c: '#f87171' }); });
            if (flageloGrauPuro > 0) _danoInfo.push({ l: '+' + flageloGrauPuro + ' grau' + (flageloGrauPuro > 1 ? 's' : ''), v: 'Flagelo Puro ×' + flageloCopias, c: '#a78bfa' });
            _danoInfo.push({ l: '→ Total', v: finalDice + ' + ' + baseAttr, c: isPuroFlagelo ? '#a78bfa' : '#f87171', b: true });
            _danoInfo.push({ type: 'diceTable', table: DAMAGE_TABLE, tblStart: isPuroFlagelo ? 4 : BASE_DAMAGE_IDX, tblAfterDado: baseIdx, tblFinal: finalIdx });
            if (!window._HATSU_DANO_INFO) window._HATSU_DANO_INFO = {};
            window._HATSU_DANO_INFO[idx] = _danoInfo;
            const baseNote = (totalDados > 0 || totalGraus > 0 || flageloGrauPuro > 0) ? `(base ${isPuroFlagelo ? '1d10' : '2d6'})` : '';
            const psiLabel = isPuroFlagelo ? `<span style="font-size:10px;font-weight:700;color:#a78bfa;margin-left:4px">Psíquico</span>` : '';
            baseDmgSection = `
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:26px;color:${isPuroFlagelo?'#a78bfa':danoColor};text-shadow:0 0 14px ${isPuroFlagelo?'#a78bfa66':danoColor+'66'};line-height:1">${finalDice}</div>
                    <div style="font-size:14px;font-weight:700;color:#6b7280">+ ${baseAttr}</div>
                    ${psiLabel}
                    ${baseNote ? `<div style="font-size:9px;color:#4b5563;font-style:italic">${baseNote}</div>` : ''}
                    <button onclick="event.stopPropagation();window._hShowDanoInfo(${idx},this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0;transition:border-color .15s,color .15s" title="Como chegamos aqui">ⓘ</button>
                </div>
                ${totalDados > 0 ? `<div style="font-size:8px;color:#fbbf24;margin-bottom:4px">${dadoSources.map(s=>`• ${s.nome}: +${s.n} dado (${s.tipo})`).join(', ')}</div>` : ''}`;
        }

        // Danos extras de efeitos próprios
        let extraDmgSection = '';
        if (temFlagelo && !isPuroFlagelo) {
            // Complementar: base 1d8 + graus por cópias extras
            const FLAGELO_COMP_IDX = 2; // 1d8
            const flageloGraus = flageloCopias - 1;
            const flageloIdx = Math.min(FLAGELO_COMP_IDX + flageloGraus, DAMAGE_TABLE.length - 1);
            const flageloDado = DAMAGE_TABLE[flageloIdx];
            const extraLabel = flageloGraus > 0 ? ` ×${flageloCopias} (+${flageloGraus} grau${flageloGraus>1?'s':''})` : ' (Complementar)';
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
        efeitosComDanoProprio.forEach(e => {
            const d = DANO_PROPRIO_MAP[e.id];
            if (!d) return;
            // HB (p.11): Hatsu Hostil inicia em 2d6 "independente de arma ou efeito de dano escolhido (se for menor)".
            // Efeitos cujo dado próprio é â‰¤ 2d6 são absorvidos pelo dano base e não aparecem separados.
            if ((isHostil || catDmg) && !d.dado.startsWith('+')) {
                const specialTypes = ['Psíquico', 'Contínuo', 'Ferida', 'Sanidade'];
                if (!specialTypes.includes(d.tipo)) {
                    const eIdx = DAMAGE_TABLE.indexOf(d.dado);
                    if (eIdx >= 0 && eIdx <= BASE_DAMAGE_IDX) return; // absorvido pelo 2d6 base
                }
            }
            const typeColors = { 'Projétil':'#38bdf8','Potente':'#38bdf8','Linha':'#38bdf8','Área':'#f87171','Objeto':'#a3e635','Corporal':'#a3e635','Criatura':'#fb923c','Extra':'#fb923c','Bloquear':'#fb923c','Contínuo':'#f43f5e','Ferida':'#f43f5e' };
            const ec = typeColors[d.tipo] || '#9ca3af';
            // If this is the only damage source (no base), scale it with totalGraus
            let displayDado = d.dado;
            if (!isHostil && !catDmg && totalGraus > 0) {
                // Find base index from dado string (e.g. "1d8" → idx 2)
                const baseIdx = DAMAGE_TABLE.indexOf(d.dado);
                if (baseIdx >= 0) {
                    const scaledIdx = Math.min(baseIdx + totalGraus, DAMAGE_TABLE.length - 1);
                    displayDado = DAMAGE_TABLE[scaledIdx];
                }
            }
            extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:${ec}">${displayDado}</span>
                <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:${ec}22;color:${ec}">${d.tipo}</span>
                <span style="font-size:9px;color:#4b5563">${d.desc}${!isHostil && !catDmg && totalGraus > 0 ? ` (+${totalGraus} grau)` : ''}</span>
                <span style="font-size:9px;color:#6b7280">+ ${baseAttr}</span>
            </div>`;
        });

        // Chips de fontes de grau e dado
        const sourcesHtml = (grauSources.length > 0 || dadoSources.length > 0)
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
                ${dadoSources.map(s => `<span style="font-size:7px;font-weight:900;background:#fbbf2418;color:#fbbf24;padding:2px 6px;border-radius:4px">+${s.n} dado · ${s.nome}</span>`).join('')}
                ${grauSources.map(s => `<span style="font-size:7px;font-weight:900;background:#ef444418;color:#f87171;padding:2px 6px;border-radius:4px">+${s.graus} grau · ${s.nome}</span>`).join('')}
              </div>`
            : '';

        calcDanoHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px">💥 Dano Final</div>
                ${grauDelta ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#ef444422;color:#f87171">${grauDelta} grau${Math.abs(totalGraus)!==1?'s':''}</span>` : ''}
            </div>
            ${modPickerHtml}
            ${baseDmgSection}
            ${extraDmgSection}
            ${sourcesHtml}
        </div>`;
    }
    // ── Cálculo de bônus de acerto ───────────────────────────────────────────
    // Hatsus hostis/versáteis/instantâneos que NÃO usam CD precisam de jogada de ataque
    const hasAttack = hasBaseDmg && !hasCDCategory;

    const ACERTO_BNF_MAP = {
        'rg_l12': 1,  // Limitação de Movimento 1: +1 em Jogadas de Acerto
        'rg_m11': 2,  // Limite Emocional: +2 em Jogadas de Acerto
        'ri_l3':  1,  // Sem Defesas (Reforço): +1 na jogada de ataque
    };

    let acertoBonus = 0;
    let acertoVantagem = false;
    const acertoBonusSources = [];

    [...restricoesSel, ...efeitosSel].forEach(item => {
        // Bônus fixos
        const bonus = ACERTO_BNF_MAP[item.id];
        if (bonus) {
            acertoBonus += bonus;
            acertoBonusSources.push({ nome: item.nome, bonus });
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
        // Segredo Mortal: vantagem em acerto
        if (item.id === 'rg_p12') {
            acertoVantagem = true;
        }
    });
    // ── Fim cálculo de acerto ─────────────────────────────────────────────────

    window._hatsuRollState = {
        dice: _hatsuFinalDice,
        attr: baseAttr,
        nome: h.nome,
        hasBaseDmg,
        hasAttack,
        acertoBonus,
        acertoVantagem,
        nivel: parseInt(h.nivel || char.level || 1),
        sanExtras: sanidadeExtras.map(e => ({ dado: e._san.dado, desc: e._san.desc })),
        dmgExtras: efeitosComDanoProprio.map(e => {
            const d = DANO_PROPRIO_MAP[e.id];
            return d ? { dado: d.dado, tipo: d.tipo, desc: d.desc } : null;
        }).filter(Boolean)
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
        const bonus = CD_BNF_MAP[item.id];
        if (bonus) {
            cdBonusTotal += bonus;
            cdBonusSources.push({ nome: item.nome, bonus });
        }
    });
    // 5 Graus do 1Âº Hatsu — CD
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.cd) {
        cdBonusTotal += h.primeiroHatsuGraus.cd;
        cdBonusSources.push({ nome: '⭐ 1Âº Hatsu', bonus: h.primeiroHatsuGraus.cd });
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

        if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
        if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
        window._HATSU_STAT_INFO[idx].cd = [
            { l: 'Base', v: '8', c: '#9ca3af' },
            { l: '½ Nível ('+halfLevel+')', v: '+'+halfLevel, c: '#d1d5db' },
            { l: 'Mod '+baseAttr+' ('+(attrMod>=0?'+':'')+attrMod+')', v: (attrMod>=0?'+':'')+attrMod, c: '#60a5fa' },
            ...cdBonusSources.map(s => ({ l: '+'+s.bonus+' bônus', v: s.nome, c: tc })),
            { l: '→ Total', v: 'CD '+cdFinal, c: tc, b: true }
        ];

        const cdSourcesHtml = cdBonusSources.length > 0
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${cdBonusSources.map(s =>
                `<span style="font-size:7px;font-weight:900;background:${tc}18;color:${tc};padding:2px 6px;border-radius:4px">+${s.bonus} CD Â· ${s.nome}</span>`
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
                ${cdBonusTotal > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:${tc}22;color:${tc}">+${cdBonusTotal} bônus</span>` : ''}
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

    // ── Cálculo de Alcance e Duração ──────────────────────────────────────────
    const allSelIds = [...(h.restricoes||[]), ...(h.efeitos||[])];
    let alcanceBonus = [];
    let areaBonus = [];
    let duracaoBonus = [];
    let alcanceDobrado = false;
    let duracaoDobrada = false;
    // 5 Graus do 1Âº Hatsu — alcance, área, duração
    if (idx === 0 && h.primeiroHatsuGraus) {
        const _phg = h.primeiroHatsuGraus;
        if (_phg.alcance) alcanceBonus.push({ valor: _phg.alcance * 3, fonte: '⭐ 1º Hatsu (Alcance)' });
        if (_phg.area)    areaBonus.push({ valor: _phg.area * 1.5, fonte: '⭐ 1º Hatsu (Área)' });
        if (_phg.duracao) duracaoBonus.push({ valor: _phg.duracao, fonte: '⭐ 1º Hatsu (Duração)', unidade: 'rodada' });
    }

    // Bônus de Talento aplicado a alcance/área/duração
    if (h.bonusGraus) {
        const _bg = h.bonusGraus;
        if (_bg.tipo === 'alcance' && _bg.valor)
            alcanceBonus.push({ valor: _bg.valor * 3,   fonte: '💠 Bônus Talentoso (Alcance)' });
        else if (_bg.tipo === 'area' && _bg.valor)
            areaBonus.push({   valor: _bg.valor * 1.5,  fonte: '💠 Bônus Talentoso (Área)' });
        else if (_bg.tipo === 'duracao' && _bg.valor)
            duracaoBonus.push({ valor: _bg.valor, fonte: '💠 Bônus Talentoso (Duração)', unidade: 'rodada' });
    }

    // Efeitos Gerais
    const eg1Count = (h.efeitos||[]).filter(id => id === 'eg1').length;
    if (eg1Count > 0) {
        const eg1choice = (h.specialChoices||{})['eg1'] || 'Alcance';
        if (eg1choice === 'Área') {
            areaBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance ×${eg1Count} (Área)` });
        } else {
            alcanceBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance ×${eg1Count}` });
        }
    }
    const eg2Count = (h.efeitos||[]).filter(id => id === 'eg2').length;
    if (eg2Count > 0) duracaoBonus.push({ valor: eg2Count, fonte: `Aumento de Duração ×${eg2Count}`, unidade: 'rodada' });
    if ((h.efeitos||[]).includes('eg18')) duracaoBonus.push({ valor: null, fonte: 'Experiência Comprovada', unidade: 'escala' });
    const eg9Count = (h.efeitos||[]).filter(id => id === 'eg9').length;
    if (eg9Count > 0) {
        const eg9shape = (h.specialChoices||{})['eg9'] || 'Área';
        areaBonus.push({ valor: eg9Count * 1.5, fonte: `Ajuste de Forma — ${eg9shape} ×${eg9Count}` });
    }

    // Efeitos de categoria
    if ((h.efeitos||[]).includes('em_e2')) {
        const c = (h.specialChoices||{})['em_e2'] || 'Alcance';
        if (c === 'Área') areaBonus.push({ valor: 3, fonte: 'Distância Segura (Área)' });
        else alcanceBonus.push({ valor: 6, fonte: 'Distância Segura (Alcance)' });
    }
    if ((h.efeitos||[]).includes('em_e14')) {
        const c = (h.specialChoices||{})['em_e14'] || 'Alcance';
        if (c === 'Área') areaBonus.push({ valor: 3, fonte: 'Expansão de Domínio (Área)' });
        else alcanceBonus.push({ valor: 6, fonte: 'Expansão de Domínio (Alcance)' });
    }

    // Restrições — Alcance/Área (usando specialChoices para saber qual)
    const rg_l9Count = (h.restricoes||[]).filter(id => id === 'rg_l9').length;
    if (rg_l9Count > 0) {
        const l9choice = (h.specialChoices||{})['rg_l9'] || 'Alcance';
        if (l9choice === 'Área') areaBonus.push({ valor: rg_l9Count * 1.5, fonte: `Exaustão 1 ×${rg_l9Count} (Área)` });
        else alcanceBonus.push({ valor: rg_l9Count * 1.5, fonte: `Exaustão 1 ×${rg_l9Count} (Alcance)` });
    }
    if ((h.restricoes||[]).includes('rg_l10')) {
        const l10choice = (h.specialChoices||{})['rg_l10'] || 'Alcance';
        if (l10choice === 'Área') areaBonus.push({ valor: 1.5, fonte: 'Interação Sensorial Simples (Área)' });
        else alcanceBonus.push({ valor: 3, fonte: 'Interação Sensorial Simples (Alcance)' });
    }
    if ((h.restricoes||[]).includes('rg_m12')) {
        const m12choice = (h.beneficioChoices||{})['rg_m12'] || '';
        if (m12choice.toLowerCase().includes('dura')) duracaoDobrada = true;
        else alcanceDobrado = true;
    }
    if ((h.restricoes||[]).includes('rt_l2')) alcanceBonus.push({ valor: 3, fonte: 'Sem Movimento no Turno' });
    if ((h.restricoes||[]).includes('rt_m2')) areaBonus.push({ valor: 1.5, fonte: 'Sem Aliados a 3m' });
    if ((h.restricoes||[]).includes('em_l1')) alcanceBonus.push({ valor: 6, fonte: 'Linha Reta Apenas' });

    // Restrições — Duração
    if ((h.restricoes||[]).includes('rg_p2')) duracaoBonus.push({ valor: 3, fonte: 'Boneca Russa', unidade: 'rodada' });
    const rg_v2Count = (h.restricoes||[]).filter(id => id === 'rg_v2').length;
    if (rg_v2Count > 0) duracaoBonus.push({ valor: null, fonte: 'Canalizar com Concentração (+X rodadas)', unidade: 'variável' });
    if ((h.restricoes||[]).includes('rg_v3')) duracaoBonus.push({ valor: null, fonte: 'Confirmação de Duas Etapas (Leve+1r/Mod+2r/Pes+3r/Ext+4r)', unidade: 'variável' });
    if ((h.restricoes||[]).includes('rm_l3')) duracaoBonus.push({ valor: 2, fonte: '1 Item por Combate', unidade: 'rodada' });
    // rg_m13: Zetsu Protetivo — só conta se beneficioChoice for "Rodadas"
    if ((h.restricoes||[]).includes('rg_m13')) {
        const m13choice = (h.beneficioChoices||{})['rg_m13'] || '';
        if (m13choice.toLowerCase().includes('rodada') || m13choice.toLowerCase().includes('dura')) {
            duracaoBonus.push({ valor: 2, fonte: 'Zetsu Protetivo (Rodadas)', unidade: 'rodada' });
        }
    }

    // rg_v10: Zetsu por Falha — graus em alcance ou área baseado nas rodadas configuradas
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

    const totalAlcanceM = alcanceBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);
    const totalAreaM = areaBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);
    const totalDuracaoR = duracaoBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);

    // Store info for alcance/área/duração popups
    if (!window._HATSU_STAT_INFO) window._HATSU_STAT_INFO = {};
    if (!window._HATSU_STAT_INFO[idx]) window._HATSU_STAT_INFO[idx] = {};
    if (alcanceBonus.length > 0 || alcanceDobrado) {
        const _alcLines = alcanceBonus.map(b => ({ l: b.fonte, v: '+'+b.valor+'m', c: '#60a5fa' }));
        if (alcanceDobrado) _alcLines.push({ l: 'Tempo Marcado', v: 'Base ×2', c: '#60a5fa' });
        _alcLines.push({ l: '→ Total', v: (totalAlcanceM>0?'+'+totalAlcanceM+'m':'')+(alcanceDobrado?' + Base×2':''), c: '#60a5fa', b: true });
        window._HATSU_STAT_INFO[idx].alcance = _alcLines;
    }
    if (areaBonus.length > 0) {
        const _areaLines = areaBonus.map(b => ({ l: b.fonte, v: '+'+b.valor+'m', c: '#34d399' }));
        _areaLines.push({ l: '→ Total', v: '+'+totalAreaM+'m', c: '#34d399', b: true });
        window._HATSU_STAT_INFO[idx].area = _areaLines;
    }
    if (duracaoBonus.length > 0 || duracaoDobrada) {
        const _durLines = duracaoBonus.map(b => ({ l: b.fonte, v: b.valor !== null ? (typeof b.valor === 'number' ? '+'+b.valor+' rod.' : b.valor) : '(ver desc.)', c: '#a78bfa' }));
        if (duracaoDobrada) _durLines.push({ l: 'Tempo Marcado', v: 'Base ×2', c: '#a78bfa' });
        const _durTotalStr = (totalDuracaoR>0?'+'+totalDuracaoR+' rod.':'')+(duracaoDobrada?' + Base×2':'');
        _durLines.push({ l: '→ Total', v: _durTotalStr||'(variável)', c: '#a78bfa', b: true });
        window._HATSU_STAT_INFO[idx].duracao = _durLines;
    }

    const hasRangeOrDuration = alcanceBonus.length > 0 || areaBonus.length > 0 || duracaoBonus.length > 0 || alcanceDobrado || duracaoDobrada;
    let calcRangeDurHtml = '';
    if (hasRangeOrDuration) {
        const alcanceHtml = alcanceBonus.length > 0 || alcanceDobrado ? `
            <div style="margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">📐 Alcance</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${alcanceDobrado ? `<span style="font-size:12px;font-weight:900;color:#60a5fa">Base ×2</span>` : ''}
                    ${totalAlcanceM > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#60a5fa;text-shadow:0 0 10px #60a5fa66">+${totalAlcanceM}m</span>` : ''}
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
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'area',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Detalhes">ⓘ</button>
                </div>
                ${areaBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• ${b.fonte}: +${b.valor}m</div>`).join('')}
            </div>` : '';

        const duracaoHtml = duracaoBonus.length > 0 || duracaoDobrada ? `
            <div>
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">⏱ Duração</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${duracaoDobrada ? `<span style="font-size:12px;font-weight:900;color:#a78bfa">Base ×2</span>` : ''}
                    ${totalDuracaoR > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#a78bfa;text-shadow:0 0 10px #a78bfa66">+${totalDuracaoR} rod.</span>` : ''}
                    <button onclick="event.stopPropagation();window._hShowStatInfo(${idx},'duracao',this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0" title="Detalhes">ⓘ</button>
                </div>
                ${duracaoBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• ${b.fonte}: ${b.valor !== null ? (typeof b.valor === 'number' ? '+'+b.valor+' rodada'+(b.valor!==1?'s':'') : b.valor) : '(ver descrição)'}</div>`).join('')}
                ${duracaoDobrada ? `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">• Tempo Marcado: dobra duração base</div>` : ''}
            </div>` : '';

        calcRangeDurHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:10px">📐 Alcance, Área & Duração</div>
            ${alcanceHtml}
            ${areaHtml}
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
            if (r.id === 'rg_e5' && sc.rg_e5) specialDetail = `<div style="margin-top:6px;font-size:9px;color:#fb923c;padding:6px 10px;background:#fb923c11;border-radius:6px;border:1px solid #fb923c33;font-style:italic">"${sc.rg_e5}"</div>`;
            if ((r.id === 'rg_l9' || r.id === 'rg_l10') && sc[r.id]) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc[r.id] === 'Área' ? '🔵 Área' : '📐 Alcance'}</div>`;
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

    const eHtml = efeitosSel.length
        ? efeitosSel.map(e => {
            const isGeral = e.origem === 'geral';
            const ec = isGeral ? '#9ca3af' : tc;
            const costColor = (e.pn||1) >= 3 ? '#f87171' : (e.pn||1) >= 2 ? '#fbbf24' : '#6b7280';
            const sc = h.specialChoices || {};
            let specialDetail = '';
   if (e.id === 'eg3' && sc.eg3) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🩸 Condição: ${sc.eg3}</div>`;
            if (e.id === 'eg4' && sc.eg4) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🔀 Efeito Alternativo → ${sc.eg4}</div>`;
            if (e.id === 'eg6' && sc.eg6) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🎯 Poder é Intenção: ${sc.eg6}</div>`;
            if (e.id === 'rm_e2' && sc.rm_e2) { specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">🧱 Pequeno Â· ${sc.rm_e2} &nbsp;|&nbsp; PV = 5 + CON×2</div>`; }
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
            if (e.id === 'rt_e4' && sc.rt_e4) {
                const db4 = window.TRANSMUTACAO_DB && window.TRANSMUTACAO_DB.elemental.find(x=>x.id===sc.rt_e4);
                if (db4) specialDetail = `<div style="margin-top:6px;padding:6px 10px;background:${db4.cor}18;border:1px solid ${db4.cor}44;border-radius:8px">
                    <div style="font-size:9px;font-weight:900;color:${db4.cor};margin-bottom:2px">${db4.icon} ${db4.nome}</div>
                    <div style="font-size:8px;color:#9ca3af">${db4.efeito}</div>
                </div>`;
            }
            if (e.id === 'rt_e5' && sc.rt_e5) {
                const db5 = window.TRANSMUTACAO_DB && window.TRANSMUTACAO_DB.versatil.find(x=>x.id===sc.rt_e5);
                if (db5) specialDetail = `<div style="margin-top:6px;padding:6px 10px;background:${db5.cor}18;border:1px solid ${db5.cor}44;border-radius:8px">
                    <div style="font-size:9px;font-weight:900;color:${db5.cor};margin-bottom:2px">${db5.icon} ${db5.nome}</div>
                    <div style="font-size:8px;color:#9ca3af">${db5.efeito}</div>
                </div>`;
            }
            if (e.id === 'eg1' && sc.eg1) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc.eg1 === 'Área' ? '🔵 Aplicado em Área' : '📐 Aplicado em Alcance'}</div>`;
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

    // ── Seção 5 Graus do 1Âº Hatsu ─────────────────────────────────────────────
   const _PH_LABELS = {
        acerto:    { icon:'⚔️', label:'Acerto',           desc:'+1 ataque' },
        atributos: { icon:'💪', label:'Atributos',         desc:'+1 atrib./perícia' },
        dano:      { icon:'🔥', label:'Dano',              desc:'+1 passo de dano' },
        alcance:   { icon:'📐', label:'Alcance',           desc:'+3m por grau' },
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
                <div style="font-size:8px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px">⭐ 5 Graus do 1Âº Hatsu</div>
                ${_phgBtnHtml}
            </div>
            ${_phgRows}
        </div>`;
    }

    container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;background:#030712;color:#d1d5db;font-family:'Rajdhani',sans-serif">
        <!-- HEADER -->
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            <button onclick="state.view='SHEET';state.activeTab='NEN';render()"
                style="flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#111827;border:1px solid #1f2937;cursor:pointer;color:#9ca3af;font-size:16px;font-weight:900">←</button>
            <div style="flex:1;min-width:0">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:${tc};text-transform:uppercase;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.nome||'Hatsu'}</div>
                <div style="font-size:8px;color:#4b5563;margin-top:1px">${h.classe||char.class} Â· ${tipoNames[h.tipo]||'—'} Â· Nível ${h.nivel||'?'}</div>
            </div>
            <button onclick="openHatsuEdit(${idx})"
                style="flex-shrink:0;padding:7px 14px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">✏️ Editar</button>
        </div>

        <!-- CONTEÚDO SCROLLÁVEL -->
        <div style="flex:1;overflow-y:auto;padding:16px" class="custom-scrollbar hatsu-scroll-area">

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
                        <div style="font-size:10px;font-weight:600">${(() => { if (!window.calcAuraCost) return '<span style="color:#d1d5db">50% de Aura</span>'; const fakeHb = { rg: (h.restricoes||[]).filter(id=>id.startsWith('rg_')), rc: (h.restricoes||[]).filter(id=>!id.startsWith('rg_')), eg: (h.efeitos||[]).filter(id=>id.startsWith('eg')), ec: (h.efeitos||[]).filter(id=>!id.startsWith('eg')) }; const cc = window.calcAuraCost(fakeHb); const phgCusto = (idx===0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.custo) ? h.primeiroHatsuGraus.custo : 0; const finalPct = Math.max(10, cc.pct - phgCusto * 5); const reduced = finalPct < 50; const color = reduced ? '#4ade80' : '#d1d5db'; const extra = phgCusto > 0 ? ` <span style="font-size:8px;color:#4b5563">(−${phgCusto*5}% 1Âº Hatsu)</span>` : ''; return '<span style="color:'+color+'">' + finalPct + '% de Aura' + (reduced?' ✓':'') + '</span>' + extra; })()}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Alcance</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">Pessoal / Toque</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Duração</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">Instantâneo</div>
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
                ${calcCDHtml}
                ${calcRangeDurHtml}
            </div>

            ${primeiroHatsuSection}

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
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <span style="font-size:14px">⚡</span>
                    <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">Efeitos</span>
                    <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:${tc}22;color:${tc}">${efeitosSel.length}</span>
                </div>
                ${eHtml}
            </div>

        </div>

        <!-- RODAPÉ -->
        <div style="padding:12px 14px;border-top:1px solid #111827;background:#0a0f1a;flex-shrink:0">
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
    </div>`;

    if (window.lucide) lucide.createIcons();
}

