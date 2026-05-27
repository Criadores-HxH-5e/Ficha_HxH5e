function renderHatsuDetail(container) {
    const char  = state.currentChar;
    const idx   = state.hatsuDetailIdx || 0;
    const h     = (char.hatsus || [])[idx];
    if (!h) { state.view = 'SHEET'; state.activeTab = 'NEN'; render(); return; }

    const catDB = (window.HATSU_DB && window.HATSU_DB.categorias[h.classe]) ||
                  (window.HATSU_DB && window.HATSU_DB.categorias[char.class]) || {};
    const tc    = catDB.cor || '#00ff88';
    const pnMax = window.calcularPHBase ? window.calcularPHBase(h.nivel||1) : 6;

    const _tipoIconsMap = { hostil:'âš”ï¸', suporte:'ðŸ›¡ï¸', versatil:'ðŸŒ€', instantaneo:'âš¡', longa_duracao:'â³' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'âœ¦').join(''); } });
    const _tipoLabels = { hostil:'Hostil', suporte:'Suporte', versatil:'VersÃ¡til', instantaneo:'InstantÃ¢neo', longa_duracao:'Longa DuraÃ§Ã£o' };
    const tipoNames = new Proxy(_tipoLabels, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||p).join(' + '); } });

    // Resolve nomes completos das restriÃ§Ãµes
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

    // Injeta efeitos escolhidos dentro de eg4 (Efeito Alternativo) e eg6 (Poder Ã© IntenÃ§Ã£o)
    // sem duplicar caso o usuÃ¡rio tambÃ©m os tenha selecionado manualmente
    const _WRAPPER_META = {
        'eg4': { label:'ðŸ”€ Efeito Alternativo' },
        'eg6': { label:'ðŸŽ¯ Poder Ã© IntenÃ§Ã£o'   },
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

    // â”€â”€ CÃ¡lculo de Dano Final â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const DAMAGE_TABLE = [
        '1d4','1d6','1d8','2d4','1d10','1d12',
        '2d6',  // â† Ã­ndice 6 (base)
        '3d4','2d8','4d4','3d6','2d10','5d4','2d12',
        '3d8','4d6','6d4','7d4','3d10','5d6','4d8',
        '3d12','8d4','6d6','9d4','4d10','10d4','4d12',
        '5d8','7d6','6d8','8d6','5d10','9d6','7d8',
        '5d12','6d10','10d6','8d8','7d10','6d12','9d8',
        '8d10','10d8','7d12','9d10','8d12','10d10','9d12',
        '10d12'
    ];
    const BASE_DAMAGE_IDX = 6; // 2d6

    // Graus de dano concedidos por restriÃ§Ãµes/efeitos especÃ­ficos
    const DANO_GRAU_MAP = {
        // RestriÃ§Ãµes gerais
        'rg_l1':  1,  // CÃ¡lculo Pensado 1 â†’ +1 Grau/Passo
        'rg_l7':  1,  // "DiÃ¡logo" â†’ +1 Grau/Passo Dano
        'rg_m1':  2,  // Alvo Ãšnico em Combate â†’ +2 Grau/Passo Dano
        'rg_m13': 2,  // Zetsu Protetivo â†’ +2 Grau/Passo (inclui dano)
        'rg_p9':  3,  // Perda de Membros â†’ +3 grau de potÃªncia
        'rg_v2':  1,  // Canalizar com ConcentraÃ§Ã£o â†’ +X (mÃ­n 1)
        // RestriÃ§Ãµes de categoria
        'ri_l1':  1,  // PV < 75% â†’ +1 grau/passo dano
        'rt_m1':  2,  // Dor Reflexiva Elemental â†’ +2 Graus
        // Efeitos gerais com dano
        'eg7':    1,  // Poder Valioso â†’ +1 Grau de potÃªncia
        'eg10':   0,  // Flagelo da Mente â†’ dano psÃ­quico fixo 1d8 (tratado Ã  parte)
        'eg15':   1,  // Dano/Cura Focal â†’ +1 grau/passo
        // Efeitos de IntensificaÃ§Ã£o (graus de dano)
        'ri_e1':  1,'ri_e2': 1,'ri_e3': 2,'ri_e4': 2,'ri_e6': 1,'ri_e8': 2,'ri_e10': 2,
        'ri_e12': 3,'ri_e16': 2,'ri_e20': 3,'ri_e22': 3,'ri_e24': 4,'ri_e26': 4,'ri_e30': 5,
    };

    // +1 DADO: aumenta a QUANTIDADE de dados (ex: 2d6 â†’ 3d6), aplicado ANTES dos graus
    // "o maior" = usa o maior dado atual; "o menor" = usa 1 dado do mesmo tipo
    const DANO_DADO_MAP = {
        'rg_l16': { n: 1, tipo: 'maior' }, // Tempo de Carregamento
        'rg_l11': { n: 1, tipo: 'menor' }, // LimitaÃ§Ã£o de Alvos
        'rt_m3':  { n: 1, tipo: 'maior' }, // CondiÃ§Ã£o no UsuÃ¡rio (TransmutaÃ§Ã£o)
    };

    // Efeitos que CONCEDEM dano prÃ³prio (tornam o hatsu "com dano" independente do tipo)
    // Estrutura: id â†’ { dado, desc }
    const DANO_PROPRIO_MAP = {
        'eg10':   { dado: '1d8',      tipo: 'PsÃ­quico',   desc: 'Flagelo da Mente' },
        'eg17':   { dado: '(contÃ­nuo)',tipo: 'ContÃ­nuo',   desc: 'Dor pra Disgrama!' },
        'ri_e11': { dado: '+ 1d8',    tipo: 'Extra',      desc: 'Golpe ReforÃ§ado' },
        'ri_e13': { dado: '+ 1d(maior)',tipo:'Bloquear',   desc: 'Onda Surda' },
        'ri_e20': { dado: '+ 1d6',    tipo: 'Extra',      desc: 'FÃºria Potencializada' },
        'rm_e1':  { dado: '2d6',      tipo: 'Arma/Objeto', desc: 'Forjar Objeto/Arma Conjurada' },
        'rc_e1':  { dado: '1d6',      tipo: 'Criatura',   desc: 'Invocar Criatura' },
        'rc_e9':  { dado: '1d8',      tipo: 'Corporal',   desc: 'Metamorfose Corporal' },
        'em_e1':  { dado: '1d8',      tipo: 'ProjÃ©til',   desc: 'ProjÃ©til de Aura' },
        'em_e3':  { dado: '2d6',      tipo: 'Potente',    desc: 'Disparo Potente' },
        'em_e6':  { dado: '3d6',      tipo: 'Linha',      desc: 'CanhÃ£o de Aura' },
        'em_e9':  { dado: '4d6',      tipo: 'Ãrea',       desc: 'Bomba de Aura' },
        'rt_e16': { dado: '+5 dano',  tipo: 'Ferida',     desc: 'Ferida Interna' },
    };

    // Tipos e categorias que tÃªm dano base (2d6 + attr)
    // h.tipo pode ser combinado ex: "hostil+instantaneo" â€” split para checar cada parte
    const tipoTemDano = ['hostil','versatil','instantaneo'];
    const tiposParts  = (h.tipo||'').split('+').map(t => t.trim());
    const isHostil    = tiposParts.some(t => tipoTemDano.includes(t));
    const catTemDano  = ['INTENSIFICAÃ‡ÃƒO','REFORÃ‡O','TRANSMUTAÃ‡ÃƒO','EMISSÃƒO'];
    // h.classe Ã© a categoria cross-category do hatsu (ex: EMISSÃƒO comprada por manipulador)
    const hatsuClasse = h.classe || char.class;
    const catDmg      = catTemDano.some(c => c === hatsuClasse);

    // Verifica se algum efeito selecionado concede dano prÃ³prio
    const efeitosComDanoProprio = efeitosSel.filter(e => DANO_PROPRIO_MAP[e.id] && e.id !== 'eg10');
    const flageloCopias = (h.efeitos||[]).filter(id => id === 'eg10').length; // can have multiple copies
    const temFlagelo = flageloCopias > 0;
    const hasEfeitoDano = efeitosComDanoProprio.length > 0 || temFlagelo;

    // Detects sanity damage from restrictions/effects (beyond eg10)
    // Map of items that deal sanity damage with their values
    const SANIDADE_MAP = {
        'rma_m2': { dado: '+2/rod', desc: 'Zetsu Interrompe' },
        'ma_e7':  { dado: '+3',     desc: 'Mente FrÃ¡gil' },
        'rg_p3':  { dado: '+1d10',  desc: 'Dano Permanente (ativaÃ§Ã£o)' },
        'rg_e4':  { dado: '+5',     desc: 'Dano Permanente Constante (ativaÃ§Ã£o)' },
        'rg_v5':  { dado: '+1d10',  desc: 'Dano MomentÃ¢neo VariÃ¡vel (ativaÃ§Ã£o)' },
        'rg_v8':  { dado: '+5',     desc: 'Sorte ou RevÃ©s (crÃ­tico no alvo)' },
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

    // Hatsu tem dano base se: tipo hostil/versÃ¡til/instantÃ¢neo, OU categoria ofensiva, OU tem efeito com dano
    const hasBaseDmg = isHostil || catDmg || hasEfeitoDano;

    // Calcula graus totais de dano (sÃ³ aplica se hÃ¡ dano base)
    let totalGraus = 0;
    const grauSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        let g = DANO_GRAU_MAP[item.id];
        if (!g || g <= 0) return;
        // rg_l16 agora Ã© DADO, nÃ£o grau â€” tratado abaixo
        if (item.id === 'rg_l16') return;
        // rg_m13: Zetsu Protetivo â€” sÃ³ aplica grau de Dano se escolheu "Dano"
        if (item.id === 'rg_m13') {
            const bc = (h.beneficioChoices||{})['rg_m13'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
        }
        totalGraus += g;
        grauSources.push({ nome: item.nome, graus: g });
    });

    // +1 Dado: acumula dados extras (ex: 2d6 â†’ 3d6)
    let totalDados = 0;
    const dadoSources = [];
    [...restricoesSel, ...efeitosSel].forEach(item => {
        const d = DANO_DADO_MAP[item.id];
        if (!d) return;
        // rg_l16: sÃ³ conta se beneficioChoice foi "dano"
        if (item.id === 'rg_l16') {
            const bc = (h.beneficioChoices||{})['rg_l16'] || '';
            if (!bc.toLowerCase().includes('dano')) return;
        }
        totalDados += d.n;
        dadoSources.push({ nome: item.nome, n: d.n, tipo: d.tipo });
    });

    // BÃ´nus de Talento aplicado a este hatsu
    if (h.bonusGraus && h.bonusGraus.tipo === 'dano') {
        totalGraus += h.bonusGraus.valor;
        grauSources.push({ nome: 'ðŸ’  BÃ´nus Talentoso', graus: h.bonusGraus.valor });
    }
    // 5 Graus do 1Âº Hatsu â€” dano
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.dano) {
        totalGraus += h.primeiroHatsuGraus.dano;
        grauSources.push({ nome: 'â­ 1Âº Hatsu (Dano)', graus: h.primeiroHatsuGraus.dano });
    }

    // Atributo base pelo tipo/categoria
    // MANIPULAÃ‡ÃƒO: INT para C.S.O (objetos), PRE para C.S.C (criaturas/pessoas)
    const attrMap = {
        'INTENSIFICAÃ‡ÃƒO':'FOR','REFORÃ‡O':'FOR',
        'TRANSMUTAÃ‡ÃƒO':'DES','EMISSÃƒO':'INT',
        'MATERIALIZAÃ‡ÃƒO':'INT',
        'ESPECIALIZAÃ‡ÃƒO':'PRE',
    };

    // Detect if attack is ranged (has emission effects or ranged attack)
    const isRanged = (h.efeitos||[]).some(id => ['em_e1','em_e3','em_e6','em_e9','em_e2','em_e14'].includes(id));
    // Player-chosen modifier (stored in h.dmgMod); default by category/range
    let defaultAttr = attrMap[hatsuClasse] || 'FOR';
    if (hatsuClasse === 'MANIPULAÃ‡ÃƒO') {
        const hasCSO = (h.efeitos||[]).includes('ma_e1');
        const hasCSC = (h.efeitos||[]).includes('ma_e2');
        defaultAttr = (hasCSO && !hasCSC) ? 'INT' : 'PRE';
    }
    if (isRanged && !['EMISSÃƒO','TRANSMUTAÃ‡ÃƒO'].includes(hatsuClasse)) defaultAttr = 'DES';

    // SugestÃµes por categoria (destacadas, mas todos os atributos sÃ£o selecionÃ¡veis)
    const CAT_MOD_SUGEST = {
        'INTENSIFICAÃ‡ÃƒO': ['FOR','DES'],
        'REFORÃ‡O':        ['FOR','DES'],
        'TRANSMUTAÃ‡ÃƒO':   ['DES','SAB','INT'],
        'MATERIALIZAÃ‡ÃƒO': ['INT','FOR'],
        'ESPECIALIZAÃ‡ÃƒO': ['PRE','INT'],
        'MANIPULAÃ‡ÃƒO':    ['PRE','INT'],
        'EMISSÃƒO':        ['DES','INT'],
    };
    const modSugest = CAT_MOD_SUGEST[hatsuClasse] || (isRanged ? ['DES','INT'] : ['FOR','DES']);
    const ALL_ATTRS = ['FOR','DES','CON','INT','SAB','PRE'];

    // Usa o atributo salvo se vÃ¡lido, senÃ£o usa o primeiro sugerido
    const rawBaseAttr = h.dmgMod || defaultAttr;
    const baseAttr = ALL_ATTRS.includes(rawBaseAttr) ? rawBaseAttr : modSugest[0];

    // Categorias que usam CD (definido aqui pois Ã© usado no modPickerHtml tambÃ©m)
    const catTemCD = ['MANIPULAÃ‡ÃƒO','MATERIALIZAÃ‡ÃƒO','ESPECIALIZAÃ‡ÃƒO'];
    const hasCDCategory = catTemCD.some(c => c === (h.classe||char.class));

    // Modifier picker â€” todos os atributos disponÃ­veis, sugeridos destacados com estrela
    const modPickerHtml = (hasBaseDmg || hasCDCategory) ? `<div style="margin-bottom:10px">
        <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">âš”ï¸ Modificador do Ataque</div>
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
        <div style="font-size:7px;color:#4b5563;margin-top:4px">â˜… sugerido para ${hatsuClasse}</div>
    </div>` : '';

    let _hatsuFinalDice = null;
    let calcDanoHtml = '';
    if (hasBaseDmg) {
        const danoColor = totalGraus > 0 ? '#f87171' : '#d1d5db';
        const grauDelta = totalGraus > 0 ? `+${totalGraus}` : totalGraus < 0 ? `${totalGraus}` : '';

        // Bloco de dano base (2d6 escalado) â€” aparece quando hostil/catDmg (sem efeito prÃ³prio de dano)
        const eg10modeFinal = (h.specialChoices||{})['eg10'] || 'Complementar';
        const isPuroFlagelo = temFlagelo && eg10modeFinal === 'Puro';
        let baseDmgSection = '';
        if (isHostil || catDmg || isPuroFlagelo) {
            // Step 1: apply +dado (ex: 2d6 â†’ 3d6)
            let baseIdx = isPuroFlagelo ? 4 : BASE_DAMAGE_IDX; // Puro: 1d10 | padrÃ£o: 2d6
            let afterDadoNote = '';
            if (totalDados > 0) {
                // Parse current base dice: "2d6" â†’ n=2, d=6
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
            // Se Flagelo Puro: graus extras de cÃ³pias somam ao dano base tambÃ©m
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
                _danoInfo.push({ l: 'Â Â â†’ apÃ³s dados', v: _afterDadoV, c: '#fbbf24', i: true });
            }
            grauSources.forEach(function(s){ _danoInfo.push({ l: '+' + s.graus + ' grau' + (s.graus > 1 ? 's' : ''), v: s.nome, c: '#f87171' }); });
            if (flageloGrauPuro > 0) _danoInfo.push({ l: '+' + flageloGrauPuro + ' grau' + (flageloGrauPuro > 1 ? 's' : ''), v: 'Flagelo Puro Ã—' + flageloCopias, c: '#a78bfa' });
            _danoInfo.push({ l: 'â†’ Total', v: finalDice + ' + ' + baseAttr, c: isPuroFlagelo ? '#a78bfa' : '#f87171', b: true });
            if (!window._HATSU_DANO_INFO) window._HATSU_DANO_INFO = {};
            window._HATSU_DANO_INFO[idx] = _danoInfo;
            const baseNote = (totalDados > 0 || totalGraus > 0 || flageloGrauPuro > 0) ? `(base ${isPuroFlagelo ? '1d10' : '2d6'})` : '';
            const psiLabel = isPuroFlagelo ? `<span style="font-size:10px;font-weight:700;color:#a78bfa;margin-left:4px">PsÃ­quico</span>` : '';
            baseDmgSection = `
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:26px;color:${isPuroFlagelo?'#a78bfa':danoColor};text-shadow:0 0 14px ${isPuroFlagelo?'#a78bfa66':danoColor+'66'};line-height:1">${finalDice}</div>
                    <div style="font-size:14px;font-weight:700;color:#6b7280">+ ${baseAttr}</div>
                    ${psiLabel}
                    ${baseNote ? `<div style="font-size:9px;color:#4b5563;font-style:italic">${baseNote}</div>` : ''}
                    <button onclick="event.stopPropagation();window._hShowDanoInfo(${idx},this)" style="margin-left:4px;background:transparent;border:1px solid #374151;border-radius:50%;width:16px;height:16px;font-size:9px;color:#6b7280;cursor:pointer;padding:0;line-height:16px;flex-shrink:0;transition:border-color .15s,color .15s" title="Como chegamos aqui">â“˜</button>
                </div>
                ${totalDados > 0 ? `<div style="font-size:8px;color:#fbbf24;margin-bottom:4px">${dadoSources.map(s=>`â€¢ ${s.nome}: +${s.n} dado (${s.tipo})`).join(', ')}</div>` : ''}`;
        }

        // Danos extras de efeitos prÃ³prios
        let extraDmgSection = '';
        if (temFlagelo && !isPuroFlagelo) {
            // Complementar: base 1d8 + graus por cÃ³pias extras
            const FLAGELO_COMP_IDX = 2; // 1d8
            const flageloGraus = flageloCopias - 1;
            const flageloIdx = Math.min(FLAGELO_COMP_IDX + flageloGraus, DAMAGE_TABLE.length - 1);
            const flageloDado = DAMAGE_TABLE[flageloIdx];
            const extraLabel = flageloGraus > 0 ? ` Ã—${flageloCopias} (+${flageloGraus} grau${flageloGraus>1?'s':''})` : ' (Complementar)';
            extraDmgSection += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:16px;color:#a78bfa">${flageloDado}</span>
                <span style="font-size:10px;color:#7c3aed;font-weight:700">PsÃ­quico</span>
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
            // Efeitos cujo dado prÃ³prio Ã© â‰¤ 2d6 sÃ£o absorvidos pelo dano base e nÃ£o aparecem separados.
            if ((isHostil || catDmg) && !d.dado.startsWith('+')) {
                const specialTypes = ['PsÃ­quico', 'ContÃ­nuo', 'Ferida', 'Sanidade'];
                if (!specialTypes.includes(d.tipo)) {
                    const eIdx = DAMAGE_TABLE.indexOf(d.dado);
                    if (eIdx >= 0 && eIdx <= BASE_DAMAGE_IDX) return; // absorvido pelo 2d6 base
                }
            }
            const typeColors = { 'ProjÃ©til':'#38bdf8','Potente':'#38bdf8','Linha':'#38bdf8','Ãrea':'#f87171','Objeto':'#a3e635','Corporal':'#a3e635','Criatura':'#fb923c','Extra':'#fb923c','Bloquear':'#fb923c','ContÃ­nuo':'#f43f5e','Ferida':'#f43f5e' };
            const ec = typeColors[d.tipo] || '#9ca3af';
            // If this is the only damage source (no base), scale it with totalGraus
            let displayDado = d.dado;
            if (!isHostil && !catDmg && totalGraus > 0) {
                // Find base index from dado string (e.g. "1d8" â†’ idx 2)
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
                ${dadoSources.map(s => `<span style="font-size:7px;font-weight:900;background:#fbbf2418;color:#fbbf24;padding:2px 6px;border-radius:4px">+${s.n} dado Â· ${s.nome}</span>`).join('')}
                ${grauSources.map(s => `<span style="font-size:7px;font-weight:900;background:#ef444418;color:#f87171;padding:2px 6px;border-radius:4px">+${s.graus} grau Â· ${s.nome}</span>`).join('')}
              </div>`
            : '';

        calcDanoHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px">ðŸ’¥ Dano Final</div>
                ${grauDelta ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:#ef444422;color:#f87171">${grauDelta} grau${Math.abs(totalGraus)!==1?'s':''}</span>` : ''}
            </div>
            ${modPickerHtml}
            ${baseDmgSection}
            ${extraDmgSection}
            ${sourcesHtml}
        </div>`;
    }
    // â”€â”€ CÃ¡lculo de bÃ´nus de acerto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Hatsus hostis/versÃ¡teis/instantÃ¢neos que NÃƒO usam CD precisam de jogada de ataque
    const hasAttack = hasBaseDmg && !hasCDCategory;

    const ACERTO_BNF_MAP = {
        'rg_l12': 1,  // LimitaÃ§Ã£o de Movimento 1: +1 em Jogadas de Acerto
        'rg_m11': 2,  // Limite Emocional: +2 em Jogadas de Acerto
        'ri_l3':  1,  // Sem Defesas (ReforÃ§o): +1 na jogada de ataque
    };

    let acertoBonus = 0;
    let acertoVantagem = false;
    const acertoBonusSources = [];

    [...restricoesSel, ...efeitosSel].forEach(item => {
        // BÃ´nus fixos
        const bonus = ACERTO_BNF_MAP[item.id];
        if (bonus) {
            acertoBonus += bonus;
            acertoBonusSources.push({ nome: item.nome, bonus });
        }
        // Condicionais: rg_l1 (CÃ¡lculo Pensado 1) â€” +1 acerto ou dano
        if (item.id === 'rg_l1') {
            const bc = (h.beneficioChoices||{})[item.id] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Condicionais: rg_l13 (LimitaÃ§Ã£o de Movimento 2) â€” +1 acerto ou +1 CD
        if (item.id === 'rg_l13') {
            const bc = (h.beneficioChoices||{})[item.id] || '';
            if (bc.toLowerCase().includes('acerto')) {
                acertoBonus += 1;
                acertoBonusSources.push({ nome: item.nome, bonus: 1 });
            }
        }
        // Condicionais: rg_m13 (Zetsu Protetivo) â€” +2 acerto ou dano ou rodadas
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
    // â”€â”€ Fim cÃ¡lculo de acerto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    // â”€â”€ Fim cÃ¡lculo de dano â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // â”€â”€ CÃ¡lculo de CD do TR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // catTemCD e hasCDCategory jÃ¡ definidos acima (antes do modPickerHtml)

    // Verifica se alguma restriÃ§Ã£o ou efeito tem bÃ´nus de CD no bnf
    // Extrai o MAIOR valor positivo de "+X na CD" mencionado no bnf de cada item
    const CD_BNF_MAP = {
        'rg_l4':  1, // +1 na CD do TR
        'rg_l13': 1, // +1 em Jogadas de Acerto ou +1 na CD do TR
        'rg_m5':  2, // Ignora ResistÃªncias FÃ­sicas ou +2 na CD do TR
        'rg_m9':  2, // +2 na CD do TR
        'rg_p7':  3, // +3 ou -3 na CD de TRs Impostos ou Enfrentados
        'rma_l1': 1, // +1 na CD de resistÃªncia do alvo
        'rma_m3': 2, // +2 na CD de resistÃªncia do alvo
        'rma_p1': 5, // +5 na CD de resistÃªncia do alvo
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
    // 5 Graus do 1Âº Hatsu â€” CD
    if (idx === 0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.cd) {
        cdBonusTotal += h.primeiroHatsuGraus.cd;
        cdBonusSources.push({ nome: 'â­ 1Âº Hatsu', bonus: h.primeiroHatsuGraus.cd });
    }

    // Determina se exibir o bloco de CD:
    // - categoria que usa CD, OU
    // - tem pelo menos 1 restriÃ§Ã£o/efeito com bÃ´nus de CD
    const hasCDBlock = hasCDCategory || cdBonusSources.length > 0;

    let calcCDHtml = '';
    if (hasCDBlock) {
        const lvl = parseInt(h.nivel || char.level || 1);
        const halfLevel = Math.max(1, Math.floor(lvl / 2));
        const attrVal = char.attributes && char.attributes[baseAttr] ? char.attributes[baseAttr].value : 10;
        const attrMod = Math.floor((attrVal - 10) / 2);
        const cdBase = 8 + halfLevel + attrMod;
        const cdFinal = cdBase + cdBonusTotal;

        const cdSourcesHtml = cdBonusSources.length > 0
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${cdBonusSources.map(s =>
                `<span style="font-size:7px;font-weight:900;background:${tc}18;color:${tc};padding:2px 6px;border-radius:4px">+${s.bonus} CD Â· ${s.nome}</span>`
              ).join('')}</div>` : '';

        const formulaStr = `8 + ${halfLevel} (nÃ­vel) + ${attrMod >= 0 ? '+' : ''}${attrMod} (${baseAttr})${cdBonusTotal > 0 ? ` + ${cdBonusTotal} (restriÃ§Ãµes)` : ''}`;
        const manipContextNote = (h.classe||char.class) === 'MANIPULAÃ‡ÃƒO'
            ? `<div style="font-size:8px;color:#6b7280;margin-top:4px">
                ${(h.efeitos||[]).includes('ma_e1') && !(h.efeitos||[]).includes('ma_e2')
                    ? 'ðŸ”§ Modo Objetos (C.S.O) â†’ usa <b style="color:#60a5fa">INT</b>'
                    : 'ðŸ§  Modo Pessoas/Criaturas (C.S.C) â†’ usa <b style="color:#f43f5e">PRE</b>'}
               </div>` : '';

        calcCDHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px">ðŸŽ¯ CD do Teste de ResistÃªncia</div>
                ${cdBonusTotal > 0 ? `<span style="font-size:7px;font-weight:900;padding:2px 8px;border-radius:10px;background:${tc}22;color:${tc}">+${cdBonusTotal} bÃ´nus</span>` : ''}
            </div>
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:32px;color:${tc};text-shadow:0 0 14px ${tc}66;line-height:1">CD ${cdFinal}</div>
                <div style="font-size:11px;font-weight:700;color:#6b7280">TR de ${baseAttr}</div>
            </div>
            <div style="font-size:8px;color:#4b5563;font-style:italic;margin-bottom:4px">${formulaStr}</div>
            ${manipContextNote}
            ${cdSourcesHtml}
        </div>`;
    }
    // â”€â”€ Fim cÃ¡lculo de CD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // â”€â”€ CÃ¡lculo de Alcance e DuraÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const allSelIds = [...(h.restricoes||[]), ...(h.efeitos||[])];
    let alcanceBonus = [];
    let areaBonus = [];
    let duracaoBonus = [];
    let alcanceDobrado = false;
    let duracaoDobrada = false;
    // 5 Graus do 1Âº Hatsu â€” alcance, Ã¡rea, duraÃ§Ã£o
    if (idx === 0 && h.primeiroHatsuGraus) {
        const _phg = h.primeiroHatsuGraus;
        if (_phg.alcance) alcanceBonus.push({ valor: _phg.alcance * 3, fonte: 'â­ 1Âº Hatsu (Alcance)' });
        if (_phg.area)    areaBonus.push({ valor: _phg.area * 1.5, fonte: 'â­ 1Âº Hatsu (Ãrea)' });
        if (_phg.duracao) duracaoBonus.push({ valor: _phg.duracao, fonte: 'â­ 1Âº Hatsu (DuraÃ§Ã£o)', unidade: 'rodada' });
    }

    // Efeitos Gerais
    const eg1Count = (h.efeitos||[]).filter(id => id === 'eg1').length;
    if (eg1Count > 0) {
        const eg1choice = (h.specialChoices||{})['eg1'] || 'Alcance';
        if (eg1choice === 'Ãrea') {
            areaBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance Ã—${eg1Count} (Ãrea)` });
        } else {
            alcanceBonus.push({ valor: eg1Count * 1.5, fonte: `Aumento de Alcance Ã—${eg1Count}` });
        }
    }
    const eg2Count = (h.efeitos||[]).filter(id => id === 'eg2').length;
    if (eg2Count > 0) duracaoBonus.push({ valor: eg2Count, fonte: `Aumento de DuraÃ§Ã£o Ã—${eg2Count}`, unidade: 'rodada' });
    if ((h.efeitos||[]).includes('eg18')) duracaoBonus.push({ valor: null, fonte: 'ExperiÃªncia Comprovada', unidade: 'escala' });
    const eg9Count = (h.efeitos||[]).filter(id => id === 'eg9').length;
    if (eg9Count > 0) {
        const eg9shape = (h.specialChoices||{})['eg9'] || 'Ãrea';
        areaBonus.push({ valor: eg9Count * 1.5, fonte: `Ajuste de Forma â€” ${eg9shape} Ã—${eg9Count}` });
    }

    // Efeitos de categoria
    if ((h.efeitos||[]).includes('em_e2')) {
        const c = (h.specialChoices||{})['em_e2'] || 'Alcance';
        if (c === 'Ãrea') areaBonus.push({ valor: 3, fonte: 'DistÃ¢ncia Segura (Ãrea)' });
        else alcanceBonus.push({ valor: 6, fonte: 'DistÃ¢ncia Segura (Alcance)' });
    }
    if ((h.efeitos||[]).includes('em_e14')) {
        const c = (h.specialChoices||{})['em_e14'] || 'Alcance';
        if (c === 'Ãrea') areaBonus.push({ valor: 3, fonte: 'ExpansÃ£o de DomÃ­nio (Ãrea)' });
        else alcanceBonus.push({ valor: 6, fonte: 'ExpansÃ£o de DomÃ­nio (Alcance)' });
    }

    // RestriÃ§Ãµes â€” Alcance/Ãrea (usando specialChoices para saber qual)
    const rg_l9Count = (h.restricoes||[]).filter(id => id === 'rg_l9').length;
    if (rg_l9Count > 0) {
        const l9choice = (h.specialChoices||{})['rg_l9'] || 'Alcance';
        if (l9choice === 'Ãrea') areaBonus.push({ valor: rg_l9Count * 1.5, fonte: `ExaustÃ£o 1 Ã—${rg_l9Count} (Ãrea)` });
        else alcanceBonus.push({ valor: rg_l9Count * 1.5, fonte: `ExaustÃ£o 1 Ã—${rg_l9Count} (Alcance)` });
    }
    if ((h.restricoes||[]).includes('rg_l10')) {
        const l10choice = (h.specialChoices||{})['rg_l10'] || 'Alcance';
        if (l10choice === 'Ãrea') areaBonus.push({ valor: 1.5, fonte: 'InteraÃ§Ã£o Sensorial Simples (Ãrea)' });
        else alcanceBonus.push({ valor: 3, fonte: 'InteraÃ§Ã£o Sensorial Simples (Alcance)' });
    }
    if ((h.restricoes||[]).includes('rg_m12')) {
        const m12choice = (h.beneficioChoices||{})['rg_m12'] || '';
        if (m12choice.toLowerCase().includes('dura')) duracaoDobrada = true;
        else alcanceDobrado = true;
    }
    if ((h.restricoes||[]).includes('rt_l2')) alcanceBonus.push({ valor: 3, fonte: 'Sem Movimento no Turno' });
    if ((h.restricoes||[]).includes('rt_m2')) areaBonus.push({ valor: 1.5, fonte: 'Sem Aliados a 3m' });
    if ((h.restricoes||[]).includes('em_l1')) alcanceBonus.push({ valor: 6, fonte: 'Linha Reta Apenas' });

    // RestriÃ§Ãµes â€” DuraÃ§Ã£o
    if ((h.restricoes||[]).includes('rg_p2')) duracaoBonus.push({ valor: 3, fonte: 'Boneca Russa', unidade: 'rodada' });
    const rg_v2Count = (h.restricoes||[]).filter(id => id === 'rg_v2').length;
    if (rg_v2Count > 0) duracaoBonus.push({ valor: null, fonte: 'Canalizar com ConcentraÃ§Ã£o (+X rodadas)', unidade: 'variÃ¡vel' });
    if ((h.restricoes||[]).includes('rg_v3')) duracaoBonus.push({ valor: null, fonte: 'ConfirmaÃ§Ã£o de Duas Etapas (Leve+1r/Mod+2r/Pes+3r/Ext+4r)', unidade: 'variÃ¡vel' });
    if ((h.restricoes||[]).includes('rm_l3')) duracaoBonus.push({ valor: 2, fonte: '1 Item por Combate', unidade: 'rodada' });
    // rg_m13: Zetsu Protetivo â€” sÃ³ conta se beneficioChoice for "Rodadas"
    if ((h.restricoes||[]).includes('rg_m13')) {
        const m13choice = (h.beneficioChoices||{})['rg_m13'] || '';
        if (m13choice.toLowerCase().includes('rodada') || m13choice.toLowerCase().includes('dura')) {
            duracaoBonus.push({ valor: 2, fonte: 'Zetsu Protetivo (Rodadas)', unidade: 'rodada' });
        }
    }

    // rg_v10: Zetsu por Falha â€” graus em alcance ou Ã¡rea baseado nas rodadas configuradas
    if ((h.restricoes||[]).includes('rg_v10')) {
        const v10 = (h.specialChoices||{})['rg_v10'] || {};
        const rod = v10.rodadas || 0;
        const tipo = v10.tipo || '';
        if (rod > 0 && tipo) {
            if (tipo === 'Ãrea') areaBonus.push({ valor: rod * 1.5, fonte: 'Zetsu por Falha ('+rod+' rod. Zetsu)' });
            else alcanceBonus.push({ valor: rod * 1.5, fonte: 'Zetsu por Falha ('+rod+' rod. Zetsu)' });
        }
    }
    if ((h.efeitos||[]).includes('eg17')) {
        const eg17choice = (h.specialChoices||{})['eg17'] || '';
        if (eg17choice === 'Reduz DuraÃ§Ã£o') duracaoBonus.push({ valor: null, fonte: 'Dor pra Disgrama! â€” âˆ’1/3 da duraÃ§Ã£o ao ativar', unidade: 'penalidade' });
        else if (eg17choice === 'Penalidade TR') duracaoBonus.push({ valor: null, fonte: 'Dor pra Disgrama! â€” âˆ’5 no TR de ConcentraÃ§Ã£o', unidade: 'penalidade' });
    }

    const totalAlcanceM = alcanceBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);
    const totalAreaM = areaBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);
    const totalDuracaoR = duracaoBonus.reduce((s,b) => s + (typeof b.valor === 'number' ? b.valor : 0), 0);

    const hasRangeOrDuration = alcanceBonus.length > 0 || areaBonus.length > 0 || duracaoBonus.length > 0 || alcanceDobrado || duracaoDobrada;
    let calcRangeDurHtml = '';
    if (hasRangeOrDuration) {
        const alcanceHtml = alcanceBonus.length > 0 || alcanceDobrado ? `
            <div style="margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">ðŸ“ Alcance</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${alcanceDobrado ? `<span style="font-size:12px;font-weight:900;color:#60a5fa">Base Ã—2</span>` : ''}
                    ${totalAlcanceM > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#60a5fa;text-shadow:0 0 10px #60a5fa66">+${totalAlcanceM}m</span>` : ''}
                </div>
                ${alcanceBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">â€¢ ${b.fonte}: +${b.valor}m</div>`).join('')}
                ${alcanceDobrado ? `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">â€¢ Tempo Marcado: dobra alcance base</div>` : ''}
            </div>` : '';

        const areaHtml = areaBonus.length > 0 ? `
            <div style="margin-bottom:10px">
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">ðŸ”µ Ãrea</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#34d399;text-shadow:0 0 10px #34d39966">+${totalAreaM}m</span>
                </div>
                ${areaBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">â€¢ ${b.fonte}: +${b.valor}m</div>`).join('')}
            </div>` : '';

        const duracaoHtml = duracaoBonus.length > 0 || duracaoDobrada ? `
            <div>
                <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px">â± DuraÃ§Ã£o</div>
                <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                    ${duracaoDobrada ? `<span style="font-size:12px;font-weight:900;color:#a78bfa">Base Ã—2</span>` : ''}
                    ${totalDuracaoR > 0 ? `<span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;color:#a78bfa;text-shadow:0 0 10px #a78bfa66">+${totalDuracaoR} rod.</span>` : ''}
                </div>
                ${duracaoBonus.map(b => `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">â€¢ ${b.fonte}: ${b.valor !== null ? (typeof b.valor === 'number' ? '+'+b.valor+' rodada'+(b.valor!==1?'s':'') : b.valor) : '(ver descriÃ§Ã£o)'}</div>`).join('')}
                ${duracaoDobrada ? `<div style="font-size:8px;color:#6b7280;margin-bottom:2px">â€¢ Tempo Marcado: dobra duraÃ§Ã£o base</div>` : ''}
            </div>` : '';

        calcRangeDurHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:10px">ðŸ“ Alcance, Ãrea & DuraÃ§Ã£o</div>
            ${alcanceHtml}
            ${areaHtml}
            ${duracaoHtml}
        </div>`;
    }
    // â”€â”€ Fim cÃ¡lculo Alcance & DuraÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            if (r.id === 'rg_p8' && sc.rg_p8) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#4ade80;padding:4px 8px;background:#4ade8018;border-radius:6px">ðŸ“ ${sc.rg_p8}</div>`;
            if (r.id === 'rg_e5' && sc.rg_e5) specialDetail = `<div style="margin-top:6px;font-size:9px;color:#fb923c;padding:6px 10px;background:#fb923c11;border-radius:6px;border:1px solid #fb923c33;font-style:italic">"${sc.rg_e5}"</div>`;
            if ((r.id === 'rg_l9' || r.id === 'rg_l10') && sc[r.id]) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc[r.id] === 'Ãrea' ? 'ðŸ”µ Ãrea' : 'ðŸ“ Alcance'}</div>`;
            if (r.id === 'rg_v10' && sc.rg_v10 && typeof sc.rg_v10 === 'object' && sc.rg_v10.rodadas) {
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:#c084fc;padding:4px 8px;background:#c084fc18;border-radius:6px">âš¡ +${sc.rg_v10.rodadas} grau(s) em ${sc.rg_v10.tipo||'?'} â€” ${sc.rg_v10.rodadas} rod. de Zetsu por falha</div>`;
            }
            return `<div style="display:flex;align-items:flex-start;gap:10px;background:#0d1117;border-radius:10px;padding:12px;border:1px solid ${isPure?'#fbbf2444':'#1f2937'};margin-bottom:8px">
                <span style="font-size:7px;font-weight:900;padding:3px 6px;border-radius:4px;background:${p.bg};color:${p.tc};text-transform:uppercase;flex-shrink:0;margin-top:2px;letter-spacing:1px">${p.label}</span>
                <div style="flex:1">
                    <div style="font-size:11px;font-weight:700;color:#e5e7eb;margin-bottom:3px">${r.nome}</div>
                    <div style="font-size:9px;color:#6b7280;line-height:1.5;margin-bottom:4px">${r.desc}</div>
                    ${isPure
                        ? `<div style="font-size:9px;font-weight:700;color:#fbbf24">âš¡ Pura â€” +${purePn} P.N</div>`
                        : `<div style="font-size:9px;font-weight:700;color:${p.tc}">âš¡ ${r.bnf}</div>`}
                    ${(h.beneficioChoices && h.beneficioChoices[r.id]) ? `<div style="font-size:8px;margin-top:4px;padding:4px 8px;background:#4ade8018;border-radius:6px;color:#4ade80;font-weight:700">âœ“ Escolhido: ${h.beneficioChoices[r.id]}</div>` : ''}
                    ${specialDetail}
                </div>
            </div>`;
          }).join('')
        : `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhuma restriÃ§Ã£o selecionada.</div>`;

    const eHtml = efeitosSel.length
        ? efeitosSel.map(e => {
            const isGeral = e.origem === 'geral';
            const ec = isGeral ? '#9ca3af' : tc;
            const costColor = (e.pn||1) >= 3 ? '#f87171' : (e.pn||1) >= 2 ? '#fbbf24' : '#6b7280';
            const sc = h.specialChoices || {};
            let specialDetail = '';
            if (e.id === 'eg3' && sc.eg3) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸ©¸ CondiÃ§Ã£o: ${sc.eg3}</div>`;
            if (e.id === 'eg4' && sc.eg4) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸ”€ Efeito Alternativo â†’ ${sc.eg4}</div>`;
            if (e.id === 'eg6' && sc.eg6) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸŽ¯ Poder Ã© IntenÃ§Ã£o: ${sc.eg6}</div>`;
            if (e.id === 'rm_e2' && sc.rm_e2) { specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸ§± Pequeno Â· ${sc.rm_e2} &nbsp;|&nbsp; PV = 5 + CONÃ—2</div>`; }
            if (e.id === 'rm_e3' && sc.rm_e3) { specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">âœ¨ CaracterÃ­stica: ${sc.rm_e3}</div>`; }
            if (e.id === 'rm_e5' && sc.rm_e5) { const _e5Names = {'ap_partes':'AparÃªncia por Partes','fn_partes':'FunÃ§Ãµes em Partes','ap_compl':'AparÃªncia Completa','fn_compl':'FunÃ§Ãµes Completas','ben10':'Ben 10'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸŽ­ AlteraÃ§Ã£o: ${_e5Names[sc.rm_e5] || sc.rm_e5}</div>`; }
            if (e.id === 're_e17' && sc.re_e17) { const _e17n = {'vidente':'Vidente (Sharingan)','profeta':'Profeta','cego':'Cego de Tebas','joia':'Joia do Tempo','olho':'Olho de Agamoto'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">ðŸ”® PrevisÃ£o: ${_e17n[sc.re_e17] || sc.re_e17}</div>`; }
            if (e.id === 're_e16' && sc.re_e16) { const _e16n = {'ft_raven':'VisÃµes da Raven','ft_cronos':'Cronos','ft_senhor':'Senhor do Tempo','ft_kairos':'KairÃ³s','ft_futuro':'De volta pro Futuro','ft_tictac':'Tic Tac','tv_envelhece':'Envelhecimento/Rejuvenescimento','tv_deterio':'Deteriorar'}; specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">â± Tempo: ${_e16n[sc.re_e16] || sc.re_e16}</div>`; }
            if (e.id === 're_e2' && Array.isArray(sc.re_e2) && sc.re_e2.length) {
                const _re2db = [...(window.HATSU_DB.efeitos_gerais||[]), ...Object.values(window.HATSU_DB.categorias||{}).flatMap(c=>c.efeitos||[])];
                const _re2names = sc.re_e2.map(id => { const ef = _re2db.find(e=>e.id===id); return ef ? ef.nome : id; }).join(' + ');
                specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">âš— CombinaÃ§Ã£o: ${_re2names}</div>`;
            }
            if (e.id === 'eg17' && sc.eg17) specialDetail = `<div style="margin-top:6px;font-size:9px;font-weight:700;color:${ec};padding:4px 8px;background:${ec}18;border-radius:6px">âš¡ ConsequÃªncia: ${sc.eg17 === 'Reduz DuraÃ§Ã£o' ? 'â± âˆ’1/3 da duraÃ§Ã£o total' : 'ðŸŽ² âˆ’5 no TR de ConcentraÃ§Ã£o'}</div>`;
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
            if (e.id === 'eg1' && sc.eg1) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#60a5fa;padding:2px 7px;background:#60a5fa18;border-radius:5px">${sc.eg1 === 'Ãrea' ? 'ðŸ”µ Aplicado em Ãrea' : 'ðŸ“ Aplicado em Alcance'}</div>`;
            if (e.id === 'eg9' && sc.eg9) specialDetail = `<div style="margin-top:6px;font-size:8px;font-weight:700;color:#34d399;padding:2px 7px;background:#34d39918;border-radius:5px">ðŸ”µ Forma: ${sc.eg9}</div>`;
            const isWrapper  = e.id === 'eg4' || e.id === 'eg6';
            const isWrapped  = !!e._wrapper;
            const pnDisplay  = (e.pn === 0 || isWrapper)
                ? `<span style="font-size:7px;font-weight:900;padding:3px 6px;border-radius:4px;background:#374151;color:#6b7280;letter-spacing:1px">GrÃ¡tis</span>`
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
                    <div style="font-size:8px;color:#374151;font-style:italic">Req: ${e.req||'â€”'}</div>
                    ${specialDetail}
                </div>
            </div>`;
          }).join('')
        : `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhum efeito selecionado.</div>`;

    // â”€â”€ SeÃ§Ã£o 5 Graus do 1Âº Hatsu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const _PH_LABELS = {
        acerto:    { icon:'âš”ï¸', label:'Acerto',           desc:'+1 ataque' },
        atributos: { icon:'ðŸ’ª', label:'Atributos',         desc:'+1 atrib./perÃ­cia' },
        dano:      { icon:'ðŸ”¥', label:'Dano',              desc:'+1 passo de dano' },
        alcance:   { icon:'ðŸ“', label:'Alcance',           desc:'+3m por grau' },
        area:      { icon:'ðŸ”µ', label:'Ãrea',              desc:'+1,5m por grau' },
        duracao:   { icon:'â±',  label:'DuraÃ§Ã£o',           desc:'+1 rodada' },
        cd:        { icon:'ðŸŽ¯', label:'CD do TR',          desc:'+1 CD' },
        alvos:     { icon:'ðŸ‘¥', label:'NÂº de Alvos',      desc:'+1 alvo' },
        custo:     { icon:'ðŸ’¨', label:'ReduÃ§Ã£o de Custo',  desc:'-5% custo' },
    };
    let primeiroHatsuSection = '';
    if (idx === 0) {
        const _phg = h.primeiroHatsuGraus;
        const _phgEntries = _phg ? Object.entries(_phg).filter(([,v]) => v > 0) : [];
        const _phgRows = _phgEntries.length > 0
            ? _phgEntries.map(([k,v]) => {
                const info = _PH_LABELS[k] || { icon:'â­', label:k, desc:'' };
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1f2937">
                    <span style="font-size:9px;color:#9ca3af">${info.icon} ${info.label} <span style="font-size:8px;color:#4b5563">(${info.desc})</span></span>
                    <span style="font-size:11px;font-weight:900;color:${tc}">+${v}</span>
                </div>`;
              }).join('')
            : `<div style="font-size:9px;color:#4b5563;text-align:center;padding:6px 0">Graus ainda nÃ£o distribuÃ­dos.</div>`;
        const _phgLocked = !!_phg && !state.isAdmin;
        const _phgBtnHtml = _phg
            ? (_phgLocked
                ? `<span style="font-size:8px;padding:4px 10px;border-radius:8px;background:#1f2937;border:1px solid #374151;color:#4b5563;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">ðŸ”’ Bloqueado</span>`
                : `<button onclick="window._openPrimeiroHatsuModal()" style="font-size:8px;padding:4px 10px;border-radius:8px;background:#f9731622;border:1px solid #f9731655;color:#fb923c;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">âš™ï¸ Editar (Admin)</button>`)
            : `<button onclick="window._openPrimeiroHatsuModal()" style="font-size:8px;padding:4px 10px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.5px">â­ Distribuir</button>`;
        primeiroHatsuSection = `
        <div style="background:#0d1117;border:2px solid ${tc}33;border-radius:12px;padding:14px;margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:8px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px">â­ 5 Graus do 1Âº Hatsu</div>
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
                style="flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#111827;border:1px solid #1f2937;cursor:pointer;color:#9ca3af;font-size:16px;font-weight:900">â†</button>
            <div style="flex:1;min-width:0">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:${tc};text-transform:uppercase;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.nome||'Hatsu'}</div>
                <div style="font-size:8px;color:#4b5563;margin-top:1px">${h.classe||char.class} Â· ${tipoNames[h.tipo]||'â€”'} Â· NÃ­vel ${h.nivel||'?'}</div>
            </div>
            <button onclick="openHatsuEdit(${idx})"
                style="flex-shrink:0;padding:7px 14px;border-radius:8px;background:${tc}22;border:1px solid ${tc}55;color:${tc};font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">âœï¸ Editar</button>
        </div>

        <!-- CONTEÃšDO SCROLLÃVEL -->
        <div style="flex:1;overflow-y:auto;padding:16px" class="custom-scrollbar hatsu-scroll-area">

            <!-- Card principal -->
            <div style="text-align:center;padding:20px 16px;border-radius:16px;border:2px solid ${tc};background:${tc}08;margin-bottom:16px">
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:${tc};text-transform:uppercase;letter-spacing:2px;line-height:1.2;margin-bottom:6px">${h.nome||'SEM NOME'}</div>
                <div style="display:inline-flex;align-items:center;gap:6px;background:#ffffff08;border-radius:20px;padding:5px 12px;margin-bottom:${h.descricao?'12px':'0'}">
                    <span style="font-size:14px">${tipoIcons[h.tipo]||'âœ¦'}</span>
                    <span style="font-size:10px;font-weight:700;color:#d1d5db">${tipoNames[h.tipo]||'â€”'}</span>
                </div>
                ${h.descricao?`<div style="font-size:10px;color:#6b7280;font-style:italic;line-height:1.6;margin-top:8px;padding:0 8px">"${h.descricao}"</div>`:''}
            </div>

            <!-- Stats rÃ¡pidos -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
                <div style="background:#0d1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                    <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">NÃ­vel</div>
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

            <!-- MecÃ¢nicas base -->
            <div style="background:#0d1117;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:20px">
                <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">âš™ MecÃ¢nicas Base</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">AtivaÃ§Ã£o</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">AÃ§Ã£o Principal</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Custo Base</div>
                        <div style="font-size:10px;font-weight:600">${(() => { if (!window.calcAuraCost) return '<span style="color:#d1d5db">50% de Aura</span>'; const fakeHb = { rg: (h.restricoes||[]).filter(id=>id.startsWith('rg_')), rc: (h.restricoes||[]).filter(id=>!id.startsWith('rg_')), eg: (h.efeitos||[]).filter(id=>id.startsWith('eg')), ec: (h.efeitos||[]).filter(id=>!id.startsWith('eg')) }; const cc = window.calcAuraCost(fakeHb); const phgCusto = (idx===0 && h.primeiroHatsuGraus && h.primeiroHatsuGraus.custo) ? h.primeiroHatsuGraus.custo : 0; const finalPct = Math.max(10, cc.pct - phgCusto * 5); const reduced = finalPct < 50; const color = reduced ? '#4ade80' : '#d1d5db'; const extra = phgCusto > 0 ? ` <span style="font-size:8px;color:#4b5563">(âˆ’${phgCusto*5}% 1Âº Hatsu)</span>` : ''; return '<span style="color:'+color+'">' + finalPct + '% de Aura' + (reduced?' âœ“':'') + '</span>' + extra; })()}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Alcance</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">Pessoal / Toque</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">DuraÃ§Ã£o</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">InstantÃ¢neo</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Categoria</div>
                        <div style="font-size:10px;font-weight:700;color:${tc}">${h.classe||char.class}</div>
                    </div>
                    <div>
                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700;margin-bottom:2px">Criado em</div>
                        <div style="font-size:10px;color:#d1d5db;font-weight:600">${h.criadoEm||'â€”'}</div>
                    </div>
                </div>
                ${calcDanoHtml}
                ${calcCDHtml}
                ${calcRangeDurHtml}
            </div>

            ${primeiroHatsuSection}

            <!-- RestriÃ§Ãµes -->
            <div style="margin-bottom:20px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <span style="font-size:14px">â›“</span>
                    <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">RestriÃ§Ãµes</span>
                    <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:#ef444422;color:#f87171">${restricoesSel.length}</span>
                </div>
                ${rHtml}
            </div>

            <!-- Efeitos -->
            <div style="margin-bottom:24px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <span style="font-size:14px">âš¡</span>
                    <span style="font-size:10px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:2px">Efeitos</span>
                    <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:${tc}22;color:${tc}">${efeitosSel.length}</span>
                </div>
                ${eHtml}
            </div>

        </div>

        <!-- RODAPÃ‰ -->
        <div style="padding:12px 14px;border-top:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            ${hasBaseDmg ? `<button onclick="openRollModeModal('hatsu')"
                style="width:100%;margin-bottom:8px;padding:13px;border-radius:10px;background:#22c55e22;border:2px solid #22c55e66;color:#22c55e;font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 16px #22c55e22">ðŸŽ² Rolar Hatsu no Discord</button>` : ''}
            <div style="display:flex;gap:8px">
                <button onclick="state.view='SHEET';state.activeTab='NEN';render()"
                    style="flex:1;padding:12px;border-radius:10px;background:#111827;border:1px solid #1f2937;color:#9ca3af;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">â† Voltar</button>
                <button onclick="deleteHatsuConfirm(${idx},'sheet')"
                    style="padding:12px 14px;border-radius:10px;background:#7f1d1d44;border:1px solid #ef444455;color:#f87171;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">ðŸ—‘ï¸</button>
                <button onclick="openHatsuEdit(${idx})"
                    style="flex:1;padding:12px;border-radius:10px;background:${tc};color:#000;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;border:none;box-shadow:0 0 16px ${tc}55">âœï¸ Editar</button>
            </div>
        </div>
        ${renderRollModeModalHtml()}
    </div>`;

    if (window.lucide) lucide.createIcons();
}

