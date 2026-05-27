function renderHatsuCreator(container) {
    const char = state.currentChar;
    const cls  = char.class;
    const catDB = window.HATSU_DB.categorias[cls] || window.HATSU_DB.categorias['INTENSIFICAÃ‡ÃƒO'];
    const tc   = catDB.cor || '#00ff88';

    // Inicializa o builder
    if (!state.hatsuBuilder) {
        state.hatsuBuilder = { step:0, nome:'', descricao:'', tipoA:'', tipoB:'', rg:[], rc:[], eg:[], ec:[], openAccordions:['leves','moderadas','pesadas','variaveis','extremas'], restrTab:'gerais', beneficioChoices:{}, pureRestrictions:{}, filterText:'', filterStatus:'todos', filterRestrPeso:'todos', specialChoices:{} };
    }
    const hb = state.hatsuBuilder;

    const pnBase = window.calcularPHBase(char.level);
    const pnBonus = window.calcPNBonusFromRestr(state.hatsuBuilder || {});
    const pnSpentOthers = window.calcPNSpentInOtherHatsus(char, hb.editingIdx);
    const pnSpentDominio = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(char) : 0;
    const pnBaseAvail = Math.max(0, pnBase - pnSpentOthers - pnSpentDominio); // base pool disponÃ­vel
    let pnUsed = 0;
    hb.eg.forEach(id => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===id); if(e) pnUsed += e.pn; });
    hb.ec.forEach(id => {
        for (const cat of Object.values(window.HATSU_DB.categorias||{})) {
            if (!cat || !cat.efeitos) continue;
            const e = cat.efeitos.find(x=>x.id===id);
            if (e) { pnUsed += e.pn; break; }
        }
    });
    // â”€â”€ Breakdown por tipo de P.N â”€â”€
    // Ordem de consumo: Extremo â†’ Pura nÃ£o-extrema â†’ Base
    const pnFromExtreme = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
    const pnFromPureNonExtreme = Math.max(0, pnBonus - pnFromExtreme);
    const usedFromExtreme = Math.min(pnUsed, pnFromExtreme);
    const usedFromPureNonExtreme = Math.min(Math.max(0, pnUsed - pnFromExtreme), pnFromPureNonExtreme);
    const usedFromBase = Math.max(0, pnUsed - pnFromExtreme - pnFromPureNonExtreme);
    const pnExtremeLeft = pnFromExtreme - usedFromExtreme;
    const pnPureNonExtremeLeft = pnFromPureNonExtreme - usedFromPureNonExtreme;
    const pnBonusLeft = pnExtremeLeft + pnPureNonExtremeLeft; // total restriÃ§Ãµes ainda nÃ£o gastos
    const pnBaseLeft = Math.max(0, pnBaseAvail - usedFromBase); // base restante (pode ser guardado)
    const pnLeft = pnBonusLeft + pnBaseLeft; // total disponÃ­vel ainda
    const pnMax = pnBaseAvail + pnBonus; // total mÃ¡ximo deste hatsu

    const STEPS = ['CONCEITO','TIPO','RESTRIÃ‡Ã•ES','EFEITOS GERAIS','EFEITOS CATEG.','RESUMO'];

    // â”€â”€ barra de progresso â”€â”€
    const progressBar = STEPS.map((s,i) => {
        const active = i === hb.step, done = i < hb.step;
        const circleStyle = active ? `background:${tc};color:#000;box-shadow:0 0 8px ${tc}88` : done ? 'background:#374151;color:#9ca3af' : 'background:#111827;color:#4b5563;border:1px solid #1f2937';
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;">
            <div style="width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;flex-shrink:0;${circleStyle}">${done?'âœ“':i+1}</div>
        </div>${i<STEPS.length-1?`<div style="flex:1;height:1px;background:#1f2937;margin-top:10px;max-width:6px;"></div>`:''}`;
    }).join('');

    // â”€â”€ helpers â”€â”€
    const palR = {
        leve:    { bs:'#22c55e', bun:'#14532d55', bg:'#22c55e18', badge:'#4ade8055', bt:'#4ade80' },
        moderada:{ bs:'#eab308', bun:'#71350055', bg:'#eab30818', badge:'#fbbf2455', bt:'#fbbf24' },
        pesada:  { bs:'#ef4444', bun:'#7f1d1d55', bg:'#ef444418', badge:'#f8717155', bt:'#f87171' },
        variavel:{ bs:'#a855f7', bun:'#3b076455', bg:'#a855f718', badge:'#c084fc55', bt:'#c084fc' },
        extrema: { bs:'#f97316', bun:'#7c2d1255', bg:'#f9731618', badge:'#fb923c55', bt:'#fb923c' },
    };

    function renderR(items, arr, tipo) {
        const PURE_PN = { leve:1, moderada:2, pesada:3, extrema:4 };
        return items.map(function(item) {
            var sel = arr.includes(item.id);
            var pw = item.peso || 'leve';
            var p  = palR[pw] || palR.leve;
            var hb = state.hatsuBuilder;
            var isPure = !!(hb && hb.pureRestrictions && hb.pureRestrictions[item.id]);
            var hasAlt = !!(item.bnf && /\s[Oo][Uu]\s/.test(item.bnf));
            var choiceKey = (hb && hb.beneficioChoices) ? hb.beneficioChoices[item.id] : undefined;
            var needsChoice = sel && !isPure && hasAlt && choiceKey === null && !['rg_l9','rg_l10'].includes(item.id);
            var borderColor = isPure ? '#fbbf24' : sel ? (needsChoice ? '#fb923c' : p.bs) : p.bun;
            var purePn = PURE_PN[pw] || 0;

            var choiceHtml = '';
            if (sel && !isPure && hasAlt && item.id !== 'rma_m2' && item.id !== 're_p1' && !['rg_l9','rg_l10'].includes(item.id)) {
                var opts = item.bnf.split(/\s[Oo][Uu]\s/);
                if (!window._hBnfOpts) window._hBnfOpts = {};
                window._hBnfOpts[item.id] = opts.map(function(o){ return o.trim(); });
                var optBtns = opts.map(function(opt, idx) {
                    var isSel = choiceKey === opt.trim();
                    return '<button onclick="event.stopPropagation();window._hSetBeneficioChoiceIdx(\'' + item.id + '\',' + idx + ');return false"'
                        + ' style="text-align:left;padding:7px 10px;border-radius:7px;border:1.5px solid '
                        + (isSel ? '#4ade80' : '#1f2937')
                        + ';background:' + (isSel ? '#4ade8018' : '#0d1117')
                        + ';cursor:pointer;font-size:9px;font-weight:' + (isSel ? '700' : '400')
                        + ';color:' + (isSel ? '#4ade80' : '#9ca3af') + '">'
                        + (isSel ? 'âœ“ ' : '') + opt.trim() + '</button>';
                }).join('');
                choiceHtml = '<div style="margin-top:8px;padding:8px;background:#060a10;border-radius:8px;border:1px solid '
                    + (needsChoice ? '#fb923c44' : '#1f2937') + '">'
                    + '<div style="font-size:8px;font-weight:700;color:' + (needsChoice ? '#fb923c' : '#6b7280')
                    + ';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">'
                    + (needsChoice ? 'âš  Escolha um benefÃ­cio:' : 'âœ“ BenefÃ­cio escolhido:') + '</div>'
                    + '<div style="display:flex;flex-direction:column;gap:4px">' + optBtns + '</div></div>';
            }

            // RestriÃ§Ãµes com P.N automÃ¡tico: exibe badge fixo, sem toggle pura
            var AUTO_PN = { 'rg_e9': 7, 'rg_p3': 3, 'ri_p3': 3 };
            var pureToggleHtml = '';
            if (sel && AUTO_PN[item.id] !== undefined) {
                pureToggleHtml = '<div style="margin-top:8px;padding:5px 10px;border-radius:7px;border:1.5px solid #4ade8055;background:#4ade8018;font-size:8px;font-weight:900;color:#4ade80;display:inline-block">âš¡ +' + AUTO_PN[item.id] + ' P.N automÃ¡tico</div>';
            } else if (sel && tipo === 'rg') {
                // Pure toggle button (only for general restrictions without auto P.N)
                pureToggleHtml = '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
                    + '<button onclick="event.stopPropagation();window._hTogglePure(\'' + item.id + '\');return false"'
                    + ' style="padding:5px 10px;border-radius:7px;border:1.5px solid '
                    + (isPure ? '#fbbf24' : '#374151')
                    + ';background:' + (isPure ? '#fbbf2418' : '#0d1117')
                    + ';cursor:pointer;font-size:8px;font-weight:900;color:' + (isPure ? '#fbbf24' : '#6b7280')
                    + ';text-transform:uppercase;letter-spacing:1px;transition:all .15s">'
                    + (isPure ? 'âœ“ Pura â€” +' + purePn + ' P.N' : 'ðŸ”„ Usar como Pura (+' + purePn + ' P.N)')
                    + '</button>'
                    + (isPure ? '<span style="font-size:8px;color:#6b7280;font-style:italic">Converte benefÃ­cio em '
                        + purePn + ' P.N extra' + (pw === 'extrema' ? ' Â· permite repetir efeito' : '') + '</span>' : '')
                    + '</div>';
            }

            // Special: rg_p8 needs a text input for the specific location/condition
            var specialInputHtml = '';
            // rg_l9 and rg_l10: ask alcance or Ã¡rea
            var ALCANCE_AREA_IDS = ['rg_l9','rg_l10'];
            if (sel && ALCANCE_AREA_IDS.includes(item.id)) {
                var aaVal = (hb && hb.specialChoices && hb.specialChoices[item.id]) || '';
                var aaBonusAlc = item.id === 'rg_l9' ? '+1,5m' : '+3m';
                var aaBonusArea = item.id === 'rg_l9' ? '+1,5m' : '+1,5m';
                specialInputHtml = '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">ðŸ“ BÃ´nus em:</div>'
                    + '<div style="display:flex;gap:6px">'
                    + ['Alcance','Ãrea'].map(function(o) {
                        var active = aaVal === o;
                        var label = o === 'Alcance' ? 'ðŸ“ Alcance (' + aaBonusAlc + ')' : 'ðŸ”µ Ãrea (' + aaBonusArea + ')';
                        return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'' + item.id + '\',\'' + o + '\')" '
                            + 'style="flex:1;padding:7px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '
                            + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs + '22' : 'transparent')
                            + ';color:' + (active ? p.bs : '#9ca3af') + ';transition:all .15s">' + label + '</button>';
                    }).join('')
                    + '</div>'
                    + (aaVal ? '<div style="font-size:8px;color:' + p.bs + ';margin-top:4px">âœ“ ' + aaVal + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha alcance ou Ã¡rea</div>')
                    + '</div>';
            }
            if (sel && item.id === 'rg_p8') {
                var currentVal = (hb && hb.specialChoices && hb.specialChoices['rg_p8']) || '';
                specialInputHtml = '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">ðŸ“ Especifique o local ou condiÃ§Ã£o:</div>'
                    + '<input type="text" value="' + currentVal.replace(/"/g,'&quot;') + '" placeholder="Ex: Sob a chuva, No topo de uma montanha..."'
                    + ' onchange="window._hSetSpecialChoice(\'rg_p8\', this.value)"'
                    + ' oninput="window._hSetSpecialText(\'rg_p8\', this.value);this.style.borderColor=this.value?\'#4ade80\':\'#374151\'"'
                    + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (currentVal ? '#4ade80' : '#374151') + ';border-radius:8px;padding:8px 10px;color:#fff;font-size:10px;outline:none;transition:border-color .15s">'
                    + (currentVal ? '<div style="font-size:8px;color:#4ade80;margin-top:4px">âœ“ ' + currentVal + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Campo obrigatÃ³rio para finalizar</div>')
                    + '</div>';
            }
            // Special: rg_v10 Zetsu por Falha â€” choose rodadas and alcance/area
            if (sel && item.id === 'rg_v10') {
                var v10Val = (hb && hb.specialChoices && hb.specialChoices['rg_v10']) || {};
                if (typeof v10Val === 'string') v10Val = {}; // migrate old
                var v10Rodadas = v10Val.rodadas || 0;
                var v10Tipo = v10Val.tipo || '';
                var rodadasOpts = [1,2,3,4,5,6];
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">âš¡ Zetsu por Falha â€” configure o risco:</div>'
                    // Rodadas picker
                    + '<div style="font-size:8px;color:#9ca3af;font-weight:700;margin-bottom:5px">ðŸ”„ Rodadas de Zetsu (= bÃ´nus de graus):</div>'
                    + '<div style="display:flex;gap:4px;margin-bottom:10px">'
                    + rodadasOpts.map(function(n) {
                        var active = v10Rodadas === n;
                        return '<button onclick="event.stopPropagation();(function(){'
                            + 'var sc=state.hatsuBuilder.specialChoices||{};'
                            + 'if(!sc.rg_v10||typeof sc.rg_v10!==\'object\')sc.rg_v10={};'
                            + 'sc.rg_v10.rodadas='+n+';'
                            + 'state.hatsuBuilder.specialChoices=sc;'
                            + 'renderHatsuInPlace();'
                            + '})()" '
                            + 'style="flex:1;padding:7px 4px;border-radius:7px;font-size:11px;font-weight:900;cursor:pointer;border:1.5px solid '
                            + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs+'22' : 'transparent')
                            + ';color:' + (active ? p.bs : '#6b7280') + '">' + n + '</button>';
                    }).join('')
                    + '</div>'
                    // Alcance ou Ãrea
                    + '<div style="font-size:8px;color:#9ca3af;font-weight:700;margin-bottom:5px">ðŸ“ Aplicar graus em:</div>'
                    + '<div style="display:flex;gap:6px;margin-bottom:8px">'
                    + ['Alcance','Ãrea'].map(function(o) {
                        var active = v10Tipo === o;
                        return '<button onclick="event.stopPropagation();(function(){'
                            + 'var sc=state.hatsuBuilder.specialChoices||{};'
                            + 'if(!sc.rg_v10||typeof sc.rg_v10!==\'object\')sc.rg_v10={};'
                            + 'sc.rg_v10.tipo=\'' + o + '\';'
                            + 'state.hatsuBuilder.specialChoices=sc;'
                            + 'renderHatsuInPlace();'
                            + '})()" '
                            + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '
                            + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs+'22' : 'transparent')
                            + ';color:' + (active ? p.bs : '#9ca3af') + '">'
                            + (o === 'Alcance' ? 'ðŸ“' : 'ðŸ”µ') + ' ' + o + '</button>';
                    }).join('')
                    + '</div>'
                    + (v10Rodadas && v10Tipo
                        ? '<div style="font-size:9px;font-weight:700;color:' + p.bs + ';padding:6px 10px;background:' + p.bs + '18;border-radius:8px">'
                          + 'âœ“ +' + v10Rodadas + ' Grau(s) em ' + v10Tipo + ' â€” risco: ' + v10Rodadas + ' rod. de Zetsu'
                          + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">âš  Escolha as rodadas e onde aplicar</div>')
                    + '</div>';
            }
            if (sel && item.id === 'rg_e5') {
                var jurVal = (hb && hb.specialChoices && hb.specialChoices['rg_e5']) || '';
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#fb923c;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">âš”ï¸ Escreva seu Juramento:</div>'
                    + '<textarea placeholder="Ex: Juro que nunca usarei meu Nen contra aliados..." rows="3"'
                    + ' onchange="window._hSetSpecialChoice(\'rg_e5\', this.value)"'
                    + ' oninput="window._hSetSpecialText(\'rg_e5\', this.value);this.style.borderColor=this.value?\'#fb923c\':\'#374151\'"'
                    + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (jurVal ? '#fb923c' : '#374151') + ';border-radius:8px;padding:8px 10px;color:#fff;font-size:10px;outline:none;resize:vertical;transition:border-color .15s;font-family:Rajdhani,sans-serif">'
                    + jurVal.replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    + '</textarea>'
                    + (jurVal ? '<div style="font-size:8px;color:#fb923c;margin-top:4px;font-style:italic">"' + jurVal + '"</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  O juramento deve ser escrito para ativar o bÃ´nus</div>')
                    + '</div>';
            }
            // Special: re_p1 Inconsciente ApÃ³s Uso â€” choose exactly 2 effects (general + category)
            if (sel && item.id === 're_p1') {
                var re1Chosen = (hb && hb.specialChoices && Array.isArray(hb.specialChoices['re_p1'])) ? hb.specialChoices['re_p1'] : [];
                var re1CharLevel = parseInt(char.level) || 0;
                var re1AllExtremas = [
                    ...(window.HATSU_DB.restricoes_gerais.extremas||[]),
                    ...(catDB && catDB.restricoes ? catDB.restricoes.filter(function(r){ return r.peso === 'extrema'; }) : [])
                ];
                var re1ExtremeCount = [...(hb.rg||[]), ...(hb.rc||[])].filter(function(rid){ return re1AllExtremas.some(function(r){ return r.id === rid; }); }).length;
                var re1EffLevel = Math.min(12, re1CharLevel + re1ExtremeCount * 2);
                var re1Gerais = (window.HATSU_DB.efeitos_gerais || []);
                var re1CatEfs = (catDB && catDB.efeitos) ? catDB.efeitos : [];
                function re1ReqLevel(req) {
                    if (!req) return 0;
                    var m = req.match(/N[iÃ­]vel\s+(\d+)/i);
                    return m ? parseInt(m[1]) : 0;
                }
                function re1CardHtml(eff, grp) {
                    var isSelected = re1Chosen.includes(eff.id);
                    var reqLvl = re1ReqLevel(eff.req);
                    var locked = reqLvl > re1EffLevel;
                    var maxed = !isSelected && re1Chosen.length >= 2;
                    var disabled = locked || maxed;
                    var color = grp === 'geral' ? '#9ca3af' : p.bs;
                    return '<div onclick="event.stopPropagation();' + (disabled ? '' : 'window._hToggleReP1Effect(\'' + eff.id + '\')') + '"'
                        + ' style="padding:7px 10px;border-radius:8px;border:1.5px solid '
                        + (isSelected ? color : disabled ? '#1f293788' : '#1f2937')
                        + ';background:' + (isSelected ? color + '22' : 'transparent')
                        + ';cursor:' + (disabled ? 'not-allowed' : 'pointer')
                        + ';opacity:' + (disabled && !isSelected ? '0.5' : '1')
                        + ';margin-bottom:4px;transition:all .15s">'
                        + '<div style="display:flex;align-items:center;gap:6px">'
                        + '<span style="font-size:7px;font-weight:900;padding:2px 5px;border-radius:4px;background:' + color + '33;color:' + color + ';text-transform:uppercase;flex-shrink:0">'
                        + (grp === 'geral' ? 'GER' : 'CAT') + '</span>'
                        + '<div style="flex:1;min-width:0">'
                        + '<div style="font-size:9px;font-weight:' + (isSelected ? '900' : '700') + ';color:' + (isSelected ? color : disabled ? '#374151' : '#d1d5db') + '">'
                        + (isSelected ? 'âœ“ ' : '') + eff.nome + '</div>'
                        + (eff.req ? '<div style="font-size:7px;color:' + (locked ? '#f87171' : '#6b7280') + ';margin-top:1px">' + eff.req + (locked ? ' ðŸ”’' : '') + '</div>' : '')
                        + '</div></div></div>';
                }
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">âš¡ Escolha 2 Efeitos (' + re1Chosen.length + '/2)</div>'
                    + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">NÃ­vel efetivo: ' + re1EffLevel + ' â€” efeitos bloqueados nÃ£o satisfazem o requisito</div>'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">ðŸŒ Efeitos Gerais</div>'
                    + re1Gerais.map(function(e){ return re1CardHtml(e, 'geral'); }).join('')
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';margin-top:8px;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">âš¡ Efeitos de Categoria</div>'
                    + re1CatEfs.map(function(e){ return re1CardHtml(e, 'cat'); }).join('')
                    + (re1Chosen.length === 2
                        ? '<div style="font-size:9px;font-weight:700;color:' + p.bs + ';padding:6px 10px;background:' + p.bs + '18;border-radius:8px;margin-top:6px">âœ“ '
                          + re1Chosen.map(function(id){
                              var ef = re1Gerais.find(function(e){ return e.id===id; }) || re1CatEfs.find(function(e){ return e.id===id; });
                              return ef ? ef.nome : id;
                            }).join(' + ')
                          + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:6px">âš  Selecione exatamente 2 efeitos</div>')
                    + '</div>';
            }
            // Special: rma_m2 Zetsu Interrompe â€” choose benefit
            if (sel && item.id === 'rma_m2') {
                var rma2Val = (hb && hb.specialChoices && hb.specialChoices['rma_m2']) || '';
                var rma2opts = [['Dano Sanidade','ðŸ’œ','+2 San/rod'],['BÃ´nus Jogadas','âš¡','+2 jogadas']];
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">âš¡ Escolha o efeito:</div>'
                    + '<div style="display:flex;gap:6px">'
                    + rma2opts.map(function(op) {
                        var active = rma2Val === op[0];
                        return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rma_m2\',\'' + op[0] + '\')" '
                            + 'style="flex:1;padding:7px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '
                            + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs + '22' : 'transparent')
                            + ';color:' + (active ? p.bs : '#9ca3af') + ';transition:all .15s">'
                            + op[1] + ' ' + op[0] + ' <span style="font-size:7px;opacity:.7;display:block">' + op[2] + '</span></button>';
                    }).join('')
                    + '</div>'
                    + (rma2Val ? '<div style="font-size:8px;color:' + p.bs + ';margin-top:4px">âœ“ ' + rma2Val + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha o efeito do Zetsu</div>')
                    + '</div>';
            }

            return '<div onclick="window._hToggleR(\'' + item.id + '\',\'' + tipo + '\')"'
                + ' style="padding:8px;border-radius:10px;border:2px solid ' + borderColor
                + ';background:' + (isPure ? '#fbbf2408' : sel ? p.bg : 'transparent')
                + ';cursor:pointer;margin-bottom:8px;transition:all .15s">'
                + '<div style="display:flex;align-items:flex-start;gap:8px;">'
                + '<span style="font-size:7px;font-weight:900;padding:2px 5px;border-radius:4px;background:' + p.badge + ';color:' + p.bt + ';text-transform:uppercase;flex-shrink:0;margin-top:2px">'
                + pw.substring(0,3).toUpperCase() + '</span>'
                + '<div style="flex:1;min-width:0">'
                + '<div style="font-size:9px;font-weight:900;text-transform:uppercase;color:' + (isPure ? '#fbbf24' : sel ? p.bs : '#d1d5db') + ';line-height:1.2">'
                + item.nome + (sel ? ' <span style="color:' + (isPure ? '#fbbf24' : p.bt) + '">âœ“</span>' : '') + '</div>'
                + '<div style="font-size:8px;color:#6b7280;font-style:italic;margin-top:3px;line-height:1.4">' + item.desc + '</div>'
                + (isPure
                    ? '<div style="font-size:8px;font-weight:700;color:#fbbf24;margin-top:4px">âš¡ Pura: +' + purePn + ' P.N</div>'
                    : '<div style="font-size:8px;font-weight:700;color:' + p.bt + ';margin-top:4px">âš¡ ' + item.bnf + '</div>')
                + '</div></div>'
                + (isPure ? '' : choiceHtml)
                + pureToggleHtml
                + specialInputHtml
                + '</div>';
        }).join('');
    }

    // â”€â”€ Filter bar helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function buildFilterBar(showStatusFilter = true, accentColor = '#9ca3af') {
        const ft = hb.filterText || '';
        const fs = hb.filterStatus || 'todos';
        const statusOpts = [
            { id:'todos',       label:'Todos' },
            { id:'selecionados',label:'âœ“ Selecionados' },
            { id:'disponiveis', label:'ðŸ”“ DisponÃ­veis' },
            { id:'bloqueados',  label:'ðŸ”’ Bloqueados' },
        ];
        const statusBtns = showStatusFilter ? statusOpts.map(o => {
            const active = fs === o.id;
            return `<button onclick="window._hSetFilter('filterStatus','${o.id}')"
                style="padding:4px 9px;border-radius:7px;border:1.5px solid ${active ? accentColor : '#1f2937'};background:${active ? accentColor+'22' : 'transparent'};color:${active ? accentColor : '#6b7280'};font-size:8px;font-weight:${active?'900':'600'};cursor:pointer;white-space:nowrap;transition:all .1s">${o.label}</button>`;
        }).join('') : '';
        return `
        <div style="margin-bottom:12px">
            <div style="display:flex;gap:6px;margin-bottom:8px">
                <div style="position:relative;flex:1">
                    <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#4b5563">ðŸ”</span>
                    <input id="hb-filter-input" type="text" value="${ft.replace(/"/g,'&quot;')}" placeholder="Buscar efeito..."
                        onkeydown="if(event.key==='Enter'){window._hSetFilterText(this.value);}"
                        style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ${ft ? accentColor : '#1f2937'};border-radius:9px;padding:8px 10px 8px 30px;color:#fff;font-size:11px;outline:none;transition:border-color .15s"
                        oninput="this.style.borderColor=this.value?'${accentColor}':'#1f2937'">
                </div>
                <button onclick="window._hSetFilterText(document.getElementById('hb-filter-input').value)"
                    style="padding:8px 14px;border-radius:9px;background:${accentColor};color:#000;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0;font-family:'Orbitron',sans-serif">ðŸ”</button>
                ${ft ? `<button onclick="window._hSetFilterText('');document.getElementById('hb-filter-input').value='';"
                    style="padding:8px 12px;border-radius:9px;background:#1f2937;color:#9ca3af;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">âœ•</button>` : ''}
            </div>
            ${showStatusFilter ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${statusBtns}</div>` : ''}
        </div>`;
    }

    function renderE(items, arr, tipo, color, maxLevelOverride) {
        const char = state.currentChar;
        const charLevel = parseInt(char.level) || 0;
        const getMod = v => Math.floor(((v||10) - 10) / 2);
        const attrMod = k => getMod(char.attributes && char.attributes[k] ? char.attributes[k].value : 10);

        // Verifica se Kamikaze (rg_e6) estÃ¡ selecionado â†’ ignora todos os prÃ©-requisitos de efeitos
        const kamikazeActive = (hb.rg||[]).includes('rg_e6');

        // Verifica se hÃ¡ restriÃ§Ã£o extrema PURA ativa â†’ permite selecionar mesmo efeito mÃºltiplas vezes
        const pureRestr = hb.pureRestrictions || {};
        const allRDB_check = [];
        const rgCheck = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
        if (rgCheck) ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => {
            const peso = k === 'variaveis' ? 'variavel' : k.replace(/s$/,'');
            (rgCheck[k]||[]).forEach(r => allRDB_check.push({...r, peso}));
        });
        const hasPureExtreme =
            // rg_e9 (Vida por Poder) equivale a extrema pura: P.N automÃ¡tico habilita duplicatas
            (hb.rg||[]).includes('rg_e9') ||
            [...(hb.rg||[]), ...(hb.rc||[])].some(id =>
                pureRestr[id] && (allRDB_check.find(r => r.id === id) || {}).peso === 'extrema'
            );

        // P.N extremo disponÃ­vel e quanto jÃ¡ foi gasto em duplicatas
        const extremePurePN = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
        const dupPNUsed = window.calcDuplicatePNUsed ? window.calcDuplicatePNUsed(hb) : 0;
        const extremePNLeft = extremePurePN - dupPNUsed;

        // Parses a req string and returns { ok: bool, reason: string, bypassedByReforco: bool }
        function checkReq(req) {
            if (!req) return { ok: true, reason: '', bypassedByReforco: false };
            const reasons = [];

            // "Acesso a ReforÃ§o" â€” satisfied if char is REFORÃ‡O/INTENSIFICAÃ‡ÃƒO or has access via affinity
            if (/acesso\s+a\s+refor[Ã§c]o/i.test(req)) {
                const REFORCO_CLASSES = ['REFORÃ‡O','INTENSIFICAÃ‡ÃƒO'];
                const hasReforcoAccess = REFORCO_CLASSES.includes(char.class) ||
                    (window.CATEGORY_AFFINITY && window.CATEGORY_AFFINITY[char.class] &&
                     (window.CATEGORY_AFFINITY[char.class]['REFORÃ‡O'] || window.CATEGORY_AFFINITY[char.class]['INTENSIFICAÃ‡ÃƒO']));
                if (hasReforcoAccess) return { ok: true, reason: '', bypassedByReforco: true }; // bypass level cap too
            }

            // NÃ­vel X â€” sempre verificado, mesmo com Kamikaze ativo
            const lvlMatch = req.match(/N[iÃ­]vel\s+(\d+)/i);
            if (lvlMatch) {
                const needed = parseInt(lvlMatch[1]);
                if (charLevel < needed) reasons.push(`NÃ­vel ${needed} (vocÃª estÃ¡ no NÃ­vel ${charLevel})`);
            }

            // Kamikaze ignora todos os outros requisitos (atributos, prÃ©-requisitos de efeitos), mas nÃ£o o nÃ­vel
            if (kamikazeActive) return { ok: reasons.length === 0, reason: reasons.join(' â€¢ '), bypassedByReforco: false };

            // Handle "ATTR ou ATTR X+" pattern (e.g. "INT ou SAB 3+", "SAB ou INT 3+")
            // Must be checked BEFORE the generic per-attr pattern to avoid double-counting
            const orAttrPattern = /\b(FOR|DES|CON|INT|SAB|PRE)\s+ou\s+(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
            let orMatch;
            const handledByOr = new Set();
            while ((orMatch = orAttrPattern.exec(req)) !== null) {
                const a1 = orMatch[1].toUpperCase(), a2 = orMatch[2].toUpperCase(), min = parseInt(orMatch[3]);
                handledByOr.add(a1); handledByOr.add(a2);
                if (attrMod(a1) < min && attrMod(a2) < min) {
                    reasons.push(`mod. ${a1} ou ${a2} ${min}+ (atual: ${a1} ${attrMod(a1) >= 0?'+':''}${attrMod(a1)}, ${a2} ${attrMod(a2) >= 0?'+':''}${attrMod(a2)})`);
                }
            }

            // Handle remaining single "ATTR X+" not already covered by or-pattern
            const singleAttrPattern = /\b(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
            let sm;
            while ((sm = singleAttrPattern.exec(req)) !== null) {
                const attr = sm[1].toUpperCase(), min = parseInt(sm[2]);
                if (handledByOr.has(attr)) continue; // already handled
                // Check if this attr appears in an "ou" context in original string
                const orCtx = new RegExp(`(${attr})\\s+ou\\s+\\w+\\s+${min}\\+|\\w+\\s+ou\\s+(${attr})\\s+${min}\\+`, 'i');
                if (orCtx.test(req)) continue; // part of an or group already handled
                if (attrMod(attr) < min) {
                    reasons.push(`mod. ${attr} ${min}+ (atual: ${attrMod(attr) >= 0?'+':''}${attrMod(attr)})`);
                }
            }

            return { ok: reasons.length === 0, reason: reasons.join(' â€¢ '), bypassedByReforco: false };
        }

        return items.filter(item => {
            // Text filter
            const ft = (hb.filterText||'').toLowerCase().trim();
            if (ft && !item.nome.toLowerCase().includes(ft) && !(item.desc||'').toLowerCase().includes(ft)) return false;
            // Status filter
            const fs = hb.filterStatus || 'todos';
            if (fs !== 'todos') {
                const isSel = arr.includes(item.id);
                const { ok: reqOk } = checkReq(item.req);
                const levelCapOk = maxLevelOverride === undefined || maxLevelOverride === null
                    ? true
                    : (() => { const lm = (item.req||'').match(/N[iÃ­]vel\s+(\d+)/i); return !lm || parseInt(lm[1]) <= maxLevelOverride; })();
                const isBlocked = !isSel && (!reqOk || !levelCapOk);
                if (fs === 'selecionados' && !isSel) return false;
                if (fs === 'disponiveis' && (isSel || isBlocked)) return false;
                if (fs === 'bloqueados' && !isBlocked) return false;
            }
            return true;
        }).map(item => {
            const sel = arr.includes(item.id);
            const afford = pnLeft >= item.pn || sel;
            const { ok: reqOk, reason: reqReason, bypassedByReforco } = checkReq(item.req);

            // Cross-category level cap check â€” skipped if "Acesso a ReforÃ§o" was the bypass reason
            let levelCapBlocked = false, levelCapReason = '';
            if (!bypassedByReforco && maxLevelOverride !== undefined && maxLevelOverride !== null) {
                const itemLvlMatch = (item.req || '').match(/N[iÃ­]vel\s+(\d+)/i);
                const itemLevel = itemLvlMatch ? parseInt(itemLvlMatch[1]) : 1;
                if (itemLevel > maxLevelOverride) {
                    levelCapBlocked = true;
                    levelCapReason = `Acesso limitado a efeitos atÃ© NÃ­vel ${maxLevelOverride} para esta categoria`;
                }
            }

            const blocked = (!reqOk || levelCapBlocked) && !sel;
            const blockReason = levelCapBlocked ? levelCapReason : reqReason;
            const costColor = item.pn >= 3 ? '#f87171' : item.pn >= 2 ? '#fbbf24' : '#6b7280';

            // Determine click action
            let clickAction;
            if (blocked) {
                const msg = levelCapBlocked
                    ? `ðŸŒ Acesso por Afinidade Insuficiente\\n\\n${levelCapReason}`
                    : `âŒ Requisito nÃ£o atendido\\n\\n${blockReason}\\n\\nReq. original: ${item.req}`;
                clickAction = `alert('${msg.replace(/'/g, "\\'")}')`;
            } else if (!afford) {
                clickAction = 'void(0)';
            } else {
                // Sem extrema pura: toggle normal (sem duplicatas no mesmo nÃ­vel)
                clickAction = `window._hToggleE('${item.id}','${tipo}',${item.pn})`;
            }

            // Count duplicates for this effect
            const dupCount = hasPureExtreme ? (hb.ec||[]).concat(hb.eg||[]).filter(id => id === item.id).length : 0;
            const showDupControls = hasPureExtreme && sel && dupCount > 0;
            // BotÃ£o + sÃ³ ativo se hÃ¡ P.N extremo suficiente para mais uma cÃ³pia
            const canAddDup = hasPureExtreme && extremePNLeft >= item.pn && afford;

            const lockBadge = blocked
                ? levelCapBlocked
                    ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#3b82f622;color:#60a5fa">ðŸŒ LV${maxLevelOverride}+</span>`
                    : `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#ef444422;color:#f87171">ðŸ”’ REQ</span>`
                : kamikazeActive && item.req && item.req !== 'NÃ­vel 1'
                    ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#f9731622;color:#fb923c">âš¡ KAMIKAZE</span>`
                    : showDupControls
                        ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#fbbf2422;color:#fbbf24">Ã—${dupCount} PURA</span>`
                        : '';

            // Special UI blocks for specific effects
            let specialHtml = '';
            if (sel && !blocked) {
                const specialChoices = hb.specialChoices || {};

                // eg3: CondiÃ§Ã£o Perigosa â€” show condition picker based on level
                if (item.id === 'eg3') {
                    const CONDITIONS_BY_LEVEL = {
                        1: ['CaÃ­do','Cego','Surdo','Mudo','Lento (âˆ’3m)','Assustado','Envenenado'],
                        2: ['Agarrado','Imobilizado','Atordoado','Sangramento Leve (2d4)','Fragilizado','Desorientado'],
                        3: ['Paralisado','Incapacitado','Sangramento MÃ©dio (2d6)','ExaustÃ£o NÃ­vel 1','Inconsciente'],
                        5: ['Sangramento Forte (2d10)','ExaustÃ£o NÃ­vel 2','Dano Permanente (1d4)'],
                        7: ['Morte Imediata (CD 20 CON)','ExaustÃ£o NÃ­vel 3','Coma'],
                    };
                    const selected = specialChoices['eg3'] || [];
                    const allAvail = [];
                    Object.entries(CONDITIONS_BY_LEVEL).forEach(([lvl, conds]) => {
                        if (charLevel >= parseInt(lvl)) conds.forEach(c => allAvail.push({c, lvl: parseInt(lvl)}));
                    });
                    // Category suggestions
                    const catSuggestions = {
                        'MANIPULAÃ‡ÃƒO': ['Agarrado','Atordoado','Paralisado'],
                        'EMISSÃƒO': ['CaÃ­do','Sangramento Leve (2d4)','Cego'],
                        'TRANSMUTAÃ‡ÃƒO': ['Envenenado','Sangramento Leve (2d4)','Lento (âˆ’3m)'],
                        'INTENSIFICAÃ‡ÃƒO': ['CaÃ­do','Atordoado','Fragilizado'],
                        'MATERIALIZAÃ‡ÃƒO': ['Agarrado','Imobilizado','Paralisado'],
                    };
                    const suggestions = catSuggestions[char.class] || [];
                    specialHtml = `<div style="margin-top:8px;background:#0a0f1a;border:1px solid ${color}33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">
                        <div style="font-size:8px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ©¸ Escolha a CondiÃ§Ã£o Aplicada</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px">
                        ${allAvail.map(({c, lvl}) => {
                            const isSel = Array.isArray(selected) ? selected.includes(c) : selected === c;
                            const isSugg = suggestions.includes(c);
                            return `<button onclick="event.stopPropagation();window._hSetSpecialChoice('eg3','${c}')"
                                style="padding:4px 8px;border-radius:7px;font-size:8px;font-weight:${isSel?'900':'600'};cursor:pointer;border:1.5px solid ${isSel?color:(isSugg?color+'66':'#1f2937')};background:${isSel?color+'22':(isSugg?color+'11':'transparent')};color:${isSel?color:(isSugg?color+'cc':'#9ca3af')};white-space:nowrap">
                                ${isSugg?'â­ ':''}${c}${lvl>1?` <span style="font-size:7px;opacity:.6">Lv${lvl}+</span>`:''}
                            </button>`;
                        }).join('')}
                        </div>
                        ${specialChoices['eg3'] ? `<div style="margin-top:8px;font-size:9px;font-weight:700;color:${color}">âœ“ CondiÃ§Ã£o: ${specialChoices['eg3']}</div>` : '<div style="margin-top:6px;font-size:8px;color:#f87171">âš  Selecione uma condiÃ§Ã£o</div>'}
                    </div>`;
                }

                // eg4: Efeito Alternativo â€” pn:0, picker de efeito do modo alternativo
                if (item.id === 'eg4') {
                    const chosen = specialChoices['eg4'] || '';
                    const allEgList = (window.HATSU_DB && window.HATSU_DB.efeitos_gerais) || [];
                    const eg4Buttons = allEgList.filter(function(e){ return e.id !== 'eg4' && e.id !== 'eg6'; }).map(function(e) {
                        var active = chosen === e.nome;
                        var rq = checkReq(e.req);
                        var isBlocked = !rq.ok;
                        var btnStyle = 'padding:4px 8px;border-radius:7px;font-size:8px;white-space:nowrap;transition:all .15s;font-weight:' + (active?'900':'600') + ';border:1.5px solid ';
                        if (active) {
                            btnStyle += color + ';background:' + color + '22;color:' + color + ';cursor:pointer';
                        } else if (isBlocked) {
                            btnStyle += '#ef444433;background:#0f1117;color:#6b728066;cursor:not-allowed;opacity:0.55';
                        } else {
                            btnStyle += '#1f2937;background:transparent;color:#9ca3af;cursor:pointer';
                        }
                        var onclick;
                        if (isBlocked) {
                            var alertMsg = 'âŒ Requisito nÃ£o atendido\\n\\n' + rq.reason + '\\n\\nReq: ' + e.req;
                            onclick = 'event.stopPropagation();alert(\'' + alertMsg.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n') + '\')';
                        } else {
                            onclick = 'event.stopPropagation();window._hSetSpecialChoice(\'eg4\',\'' + e.nome.replace(/'/g,"\\'") + '\')';
                        }
                        return '<button onclick="' + onclick + '" style="' + btnStyle + '">'
                            + (active ? 'âœ“ ' : '') + e.nome + (isBlocked ? ' ðŸ”’' : '') + '</button>';
                    }).join('');
                    const chosenEff4 = chosen ? allEgList.find(function(e){ return e.nome === chosen; }) : null;
                    const chosenPanel4 = chosenEff4
                        ? '<div style="margin-top:6px;background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px">'
                            + '<div style="font-size:8px;font-weight:900;color:'+ color +';margin-bottom:3px">ðŸ”€ '+ chosenEff4.nome +'</div>'
                            + '<div style="font-size:8px;color:#9ca3af;line-height:1.5;margin-bottom:4px">'+ chosenEff4.desc +'</div>'
                            + '<div style="font-size:7px;color:#4b5563;font-style:italic">Req: '+ chosenEff4.req +'</div>'
                            + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">âš  Selecione o efeito do modo alternativo</div>';
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">ðŸ”€ Efeito Alternativo â€” Modo B</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">Selecione o efeito que compÃµe o modo alternativo do Hatsu:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">'
                        + eg4Buttons
                        + '</div>'
                        + chosenPanel4
                        + '</div>';
                }

                // eg1: Aumento de Alcance â€” ask if it's alcance or Ã¡rea
                if (item.id === 'eg1') {
                    const chosen = specialChoices['eg1'] || '';
                    const eg1opts = [['Alcance','ðŸ“'],['Ãrea','ðŸ”µ']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ“ Aplicar bÃ´nus em:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg1opts.map(function([o,icon]){
                            var active = chosen === o;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg1\',\''+ o +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + icon +' '+ o +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">âœ“ +1,5m de '+ chosen +'</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha alcance ou Ã¡rea</div>')
                        + '</div>';
                }

                // eg9: Ajuste de Forma (Ãrea) â€” ask shape
                if (item.id === 'eg9') {
                    const chosen = specialChoices['eg9'] || '';
                    const eg9shapes = [['Cone','ðŸ“'],['Linha','âž¡'],['Esfera','ðŸ”µ']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ”µ Forma da Ãrea:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg9shapes.map(function([o,icon]){
                            var active = chosen === o;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg9\',\''+ o +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + icon +' '+ o +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">âœ“ Ãrea em '+ chosen +' de 1,5m</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha a forma da Ã¡rea</div>')
                        + '</div>';
                }

                // em_e2: DistÃ¢ncia Segura â€” ask alcance (+6m) or Ã¡rea (+3m)
                if (item.id === 'em_e2' || item.id === 'em_e14') {
                    const scKey = item.id;
                    const chosen = specialChoices[scKey] || '';
                    const opts = item.id === 'em_e2'
                        ? [['Alcance','ðŸ“','+6m'],['Ãrea','ðŸ”µ','+3m']]
                        : [['Alcance','ðŸ“','+6m (linha/cone/etc.)'],['Ãrea','ðŸ”µ','+3m (Ã  distÃ¢ncia)']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ“ Aplicar bÃ´nus em:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + opts.map(function(op){
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\''+ scKey +'\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + op[1]+' '+op[0]+' <span style="font-size:7px;opacity:.7">('+op[2]+')</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">âœ“ '+chosen+': '+(chosen==='Alcance'?'+6m':'+3m')+'</div>'
                                   : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha onde aplicar</div>')
                        + '</div>';
                }

                // rma_m2: Zetsu Interrompe â€” ask which benefit
                if (item.id === 'rma_m2') {
                    const chosen = specialChoices['rma_m2'] || '';
                    const opts2 = [['Dano Sanidade','ðŸ’œ','âˆ’2 San/rod no alvo'],['BÃ´nus Jogadas','âš¡','+2 jogadas a favor']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">âš¡ Efeito do Zetsu:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + opts2.map(function(op){
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rma_m2\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + op[1]+' '+op[0]+' <span style="font-size:7px;opacity:.7;display:block">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">âœ“ '+chosen+'</div>'
                                   : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha o efeito do Zetsu</div>')
                        + '</div>';
                }

                // eg10: Flagelo da Mente â€” Puro (2d6 principal) ou Complementar (1d8 adicional)
                if (item.id === 'eg10') {
                    const chosen = specialChoices['eg10'] || '';
                    const eg10opts = [
                        ['Puro','ðŸ§ ','1d10 PsÃ­quico â€” substitui o dano base do Hatsu'],
                        ['Complementar','âž•','1d8 PsÃ­quico â€” efeito adicional ao dano'],
                    ];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ§  Modo do Flagelo da Mente:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg10opts.map(function(op) {
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg10\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:8px 6px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s;text-align:center">'
                                + op[1]+' <b>'+ op[0] +'</b><br><span style="font-size:7px;opacity:.7">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:6px">âœ“ '+chosen+'</div>'
                                  : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha o modo do efeito</div>')
                        + '</div>';
                }

                // rm_e2: Golem de Aura â€” material picker (tamanho fixo: Pequeno)
                if (item.id === 'rm_e2') {
                    const chosenMat = specialChoices['rm_e2'] || '';
                    const MATERIAIS = [
                        { nome:'Tecido/Papel',      ca:11, icon:'ðŸ“„' },
                        { nome:'Cristal/Vidro',     ca:12, icon:'ðŸ’Ž' },
                        { nome:'Madeira/OrgÃ¢nico',  ca:13, icon:'ðŸŒ¿' },
                        { nome:'Mineral/Pedra',     ca:14, icon:'ðŸª¨' },
                        { nome:'LÃ­quido/Gel',       ca:14, icon:'ðŸ’§' },
                        { nome:'Metal',             ca:15, icon:'âš™ï¸' },
                        { nome:'Gasoso',            ca:'â€”', icon:'ðŸ’¨' },
                    ];
                    const matSel = MATERIAIS.find(function(m){ return m.nome === chosenMat; });
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ§± Material do Constructo:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'
                        + MATERIAIS.map(function(m) {
                            var active = chosenMat === m.nome;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rm_e2\',\''+ m.nome +'\')" '
                                + 'style="padding:5px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#d1d5db') +';transition:all .15s">'
                                + m.icon + ' ' + m.nome + ' <span style="opacity:.7;font-size:7px">CA '+ m.ca +'</span></button>';
                        }).join('')
                        + '</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:6px">ðŸ“ Tamanho: <strong style="color:#d1d5db">Pequeno</strong> (fixo)</div>'
                        + (chosenMat
                            ? '<div style="background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px;font-size:8px;color:#9ca3af">'
                                + '<span style="color:'+ color +';font-weight:700">âœ“ Constructo: '+ chosenMat +' Â· Pequeno</span><br>'
                                + 'CA base: '+ (matSel ? matSel.ca : 'â€”') +' + INT &nbsp;|&nbsp; PV = 5 + CONÃ—2'
                              + '</div>'
                            : '<div style="font-size:8px;color:#f87171;margin-top:2px">âš  Escolha o material</div>')
                        + '</div>';
                }

                // rm_e3: CaracterÃ­sticas BÃ¡sicas â€” picker de 1 CaracterÃ­stica de InvocaÃ§Ã£o
                if (item.id === 'rm_e3') {
                    const chosenCarac = specialChoices['rm_e3'] || '';
                    const CARACTS = [
                        { nome:'Atento',               icon:'ðŸ‘',  desc:'PercepÃ§Ã£o/investigaÃ§Ã£o de criaturas prÃ³ximas (3m) +2 (escalÃ¡vel)' },
                        { nome:'CarapaÃ§a/Armadura',    icon:'ðŸ›¡',  desc:'ReduÃ§Ã£o de Danos 2 (escalÃ¡vel atÃ© 5)' },
                        { nome:'Curandeira',           icon:'ðŸ’š',  desc:'Cura +1 por dado rolado. Req: Efeito de Cura' },
                        { nome:'Defensor',             icon:'ðŸ”°',  desc:'CA +2 para criaturas adjacentes (escalÃ¡vel atÃ© 5)' },
                        { nome:'Destruidor',           icon:'ðŸ’¥',  desc:'Ataque crÃ­tico causa 1 dado de dano adicional' },
                        { nome:'DimensÃ£o',             icon:'ðŸŒ€',  desc:'ConjuraÃ§Ã£o pode ser um ambiente/espaÃ§o independente onde se pode entrar' },
                        { nome:'Enxame',               icon:'ðŸ',  desc:'3+ conjuraÃ§Ãµes iguais formam um Enxame (mesma iniciativa, PVs/CAs/Atributos somados)' },
                        { nome:'Furtivo',              icon:'ðŸŒ‘',  desc:'BÃ´nus +2 em Furtividade (escalÃ¡vel atÃ© 5)' },
                        { nome:'Grande',               icon:'â¬†',   desc:'Tamanho +1 grau (MÃ©dioâ†’Grandeâ†’Enormeâ†’Colossal). Vantagem em TR de FOR/CON' },
                        { nome:'ImparÃ¡vel',            icon:'ðŸƒ',  desc:'Ignora terreno difÃ­cil e nÃ£o pode ter movimento reduzido' },
                        { nome:'Investida',            icon:'âš¡',  desc:'ApÃ³s mover 4,5m em linha reta: TR de FOR ou derruba + 1 dado de dano extra' },
                        { nome:'Montaria',             icon:'ðŸŽ',  desc:'Pode servir como montaria (deve ser pelo menos MÃ©dio)' },
                        { nome:'MÃ³vel/Veloz',          icon:'ðŸ’¨',  desc:'Movimento +3m (escalÃ¡vel: 4,5m, 6m, 7,5m, 9m)' },
                        { nome:'Movimento VariÃ¡vel',   icon:'ðŸŒŠ',  desc:'Adquire voo, nado, escalada ou movimento subterrÃ¢neo (escalÃ¡vel)' },
                        { nome:'Pequeno',              icon:'â¬‡',   desc:'Tamanho âˆ’1 grau (MÃ©dioâ†’Pequenoâ†’MinÃºsculo). Vantagem em Furtividade' },
                        { nome:'Perito',               icon:'ðŸŽ¯',  desc:'Recebe 2 perÃ­cias adicionais' },
                        { nome:'Perturbador',          icon:'ðŸ˜µ',  desc:'Hostis prÃ³ximos (3m) sofrem âˆ’2 em testes de perÃ­cia (escalÃ¡vel atÃ© 5)' },
                        { nome:'Reativo',              icon:'âš”',   desc:'Possui reaÃ§Ãµes = Prof do usuÃ¡rio. 1x/rodada pode usar reaÃ§Ã£o independente' },
                        { nome:'Robustez',             icon:'â¤',   desc:'PV mÃ¡ximo +5 (escalÃ¡vel: 10, 15, 25)' },
                        { nome:'Sangue Ruim',          icon:'ðŸŒµ',  desc:'Ao receber ataque perfurante: criaturas adjacentes sofrem 1d6 de dano (Ã¡cido ou perfurante)' },
                    ];
                    const caracSel = CARACTS.find(function(c){ return c.nome === chosenCarac; });
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">âœ¨ CaracterÃ­stica de InvocaÃ§Ã£o:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'
                        + CARACTS.map(function(c) {
                            var active = chosenCarac === c.nome;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rm_e3\',\''+ c.nome +'\')" '
                                + 'style="padding:4px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#d1d5db') +';transition:all .15s">'
                                + c.icon + ' ' + c.nome + '</button>';
                        }).join('')
                        + '</div>'
                        + (caracSel
                            ? '<div style="background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px;font-size:8px;color:#9ca3af">'
                                + '<span style="color:'+ color +';font-weight:700">'+ caracSel.icon +' '+ caracSel.nome +'</span><br>'
                                + caracSel.desc
                              + '</div>'
                            : '<div style="font-size:8px;color:#f87171;margin-top:2px">âš  Escolha uma CaracterÃ­stica</div>')
                        + '</div>';
                }

                // eg17: Dor pra Disgrama! â€” choose between duration reduction or concentration penalty
                if (item.id === 'eg17') {
                    const chosen = specialChoices['eg17'] || '';
                    const eg17opts = [
                        ['Reduz DuraÃ§Ã£o','â±','âˆ’1/3 da duraÃ§Ã£o total'],
                        ['Penalidade TR','ðŸŽ²','âˆ’5 no TR de ConcentraÃ§Ã£o'],
                    ];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">âš¡ ConsequÃªncia do Dano ContÃ­nuo:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg17opts.map(function(op) {
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg17\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:8px 6px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s;text-align:center">'
                                + op[1]+' <b>'+ op[0] +'</b><br><span style="font-size:7px;opacity:.7">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:6px">âœ“ '+chosen+'</div>'
                                  : '<div style="font-size:8px;color:#f87171;margin-top:4px">âš  Escolha a consequÃªncia</div>')
                        + '</div>';
                }
                // rt_e4: TransmutaÃ§Ã£o Elemental â€” choose element
                if (item.id === 'rt_e4') {
                    const chosen = specialChoices['rt_e4'] || '';
                    const opts = window.TRANSMUTACAO_DB ? window.TRANSMUTACAO_DB.elemental : [];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">âš¡ Escolha o Elemento:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">'
                        + opts.map(function(o){
                            var active = chosen === o.id;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rt_e4\',\''+ o.id +'\')" '
                                + 'style="padding:5px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?o.cor:color+'33') +';background:'+ (active?o.cor+'22':'transparent') +';color:'+ (active?o.cor:'#9ca3af') +';transition:all .15s">'
                                + o.icon +' '+ o.nome +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? (function(){
                            var sel = opts.find(function(o){return o.id===chosen;});
                            if (!sel) return '';
                            return '<div style="background:#060d1a;border:1px solid '+ sel.cor +'44;border-radius:8px;padding:10px">'
                                + '<div style="font-size:9px;font-weight:900;color:'+ sel.cor +';margin-bottom:4px">'+ sel.icon +' '+ sel.nome +'</div>'
                                + '<div style="font-size:8px;color:#9ca3af;margin-bottom:6px">'+ sel.efeito +'</div>'
                                + '<div style="font-size:7px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">ProgressÃ£o:</div>'
                                + sel.progressao.map(function(p){
                                    return '<div style="font-size:8px;color:#6b7280;margin-bottom:3px;padding-left:6px;border-left:2px solid '+ sel.cor+'33 \'>">'
                                        + '<span style="color:'+ sel.cor +';font-weight:700">Nv '+ p.nivel +' Â· '+ p.nome +'</span> â€” '+ p.desc +'</div>';
                                }).join('')
                                + '</div>';
                        })() : '<div style="font-size:8px;color:#f87171">âš  Escolha um elemento para continuar</div>')
                        + '</div>';
                }

                // rt_e5: TransmutaÃ§Ã£o VersÃ¡til â€” choose property
                if (item.id === 'rt_e5') {
                    const chosen = specialChoices['rt_e5'] || '';
                    const opts = window.TRANSMUTACAO_DB ? window.TRANSMUTACAO_DB.versatil : [];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ”® Escolha a Propriedade:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">'
                        + opts.map(function(o){
                            var active = chosen === o.id;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rt_e5\',\''+ o.id +'\')" '
                                + 'style="padding:5px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?o.cor:color+'33') +';background:'+ (active?o.cor+'22':'transparent') +';color:'+ (active?o.cor:'#9ca3af') +';transition:all .15s">'
                                + o.icon +' '+ o.nome +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? (function(){
                            var sel = opts.find(function(o){return o.id===chosen;});
                            if (!sel) return '';
                            return '<div style="background:#060d1a;border:1px solid '+ sel.cor +'44;border-radius:8px;padding:10px">'
                                + '<div style="font-size:9px;font-weight:900;color:'+ sel.cor +';margin-bottom:4px">'+ sel.icon +' '+ sel.nome +'</div>'
                                + '<div style="font-size:8px;color:#9ca3af;margin-bottom:6px">'+ sel.efeito +'</div>'
                                + '<div style="font-size:7px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">ProgressÃ£o:</div>'
                                + sel.progressao.map(function(p){
                                    return '<div style="font-size:8px;color:#6b7280;margin-bottom:3px;padding-left:6px;border-left:2px solid '+ sel.cor+'33 \'>">'
                                        + '<span style="color:'+ sel.cor +';font-weight:700">Nv '+ p.nivel +' Â· '+ p.nome +'</span> â€” '+ p.desc +'</div>';
                                }).join('')
                                + '</div>';
                        })() : '<div style="font-size:8px;color:#f87171">âš  Escolha uma propriedade para continuar</div>')
                        + '</div>';
                }
                // eg6: Poder Ã© IntenÃ§Ã£o â€” pn:0, picker de efeito alvo
                if (item.id === 'eg6') {
                    const chosen = specialChoices['eg6'] || '';
                    const allEgList6 = (window.HATSU_DB && window.HATSU_DB.efeitos_gerais) || [];
                    const eg6Buttons = allEgList6.filter(function(e){ return e.id !== 'eg6'; }).map(function(e) {
                        var active = chosen === e.nome;
                        var rq = checkReq(e.req);
                        var isBlocked = !rq.ok;
                        var btnStyle = 'padding:4px 8px;border-radius:7px;font-size:8px;white-space:nowrap;transition:all .15s;font-weight:' + (active?'900':'600') + ';border:1.5px solid ';
                        if (active) {
                            btnStyle += color + ';background:' + color + '22;color:' + color + ';cursor:pointer';
                        } else if (isBlocked) {
                            btnStyle += '#ef444433;background:#0f1117;color:#6b728066;cursor:not-allowed;opacity:0.55';
                        } else {
                            btnStyle += '#1f2937;background:transparent;color:#9ca3af;cursor:pointer';
                        }
                        var onclick;
                        if (isBlocked) {
                            var alertMsg = 'âŒ Requisito nÃ£o atendido\\n\\n' + rq.reason + '\\n\\nReq: ' + e.req;
                            onclick = 'event.stopPropagation();alert(\'' + alertMsg.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n') + '\')';
                        } else {
                            onclick = 'event.stopPropagation();window._hSetSpecialChoice(\'eg6\',\'' + e.nome.replace(/'/g,"\\'") + '\')';
                        }
                        return '<button onclick="' + onclick + '" style="' + btnStyle + '">'
                            + (active ? 'âœ“ ' : '') + e.nome + (isBlocked ? ' ðŸ”’' : '') + '</button>';
                    }).join('');
                    const chosenEff6 = chosen ? allEgList6.find(function(e){ return e.nome === chosen; }) : null;
                    const chosenPanel6 = chosenEff6
                        ? '<div style="margin-top:6px;background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px">'
                            + '<div style="font-size:8px;font-weight:900;color:'+ color +';margin-bottom:3px">ðŸŽ¯ '+ chosenEff6.nome +'</div>'
                            + '<div style="font-size:8px;color:#9ca3af;line-height:1.5;margin-bottom:4px">'+ chosenEff6.desc +'</div>'
                            + '<div style="font-size:7px;color:#4b5563;font-style:italic">Req: '+ chosenEff6.req +'</div>'
                            + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">âš  Selecione o efeito alvo</div>';
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">ðŸŽ¯ Poder Ã© IntenÃ§Ã£o</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">Selecione o efeito que serÃ¡ direcionado a inimigo(s):</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">'
                        + eg6Buttons
                        + '</div>'
                        + chosenPanel6
                        + '</div>';
                }
            }
            // rm_e5: AparÃªncias Enganam â€” picker interativo (sÃ³ quando selecionado)
            if (item.id === 'rm_e5' && sel) {
                var _chosen5 = (hb.specialChoices || {})['rm_e5'] || '';
                var _cLvl = charLevel;
                var _alt = [
                    { id:'ap_partes',  nome:'Aparencia por Partes', lvl:1, icon:'ðŸŽ­', desc:'Simula ate 3 caracteristicas fisicas (voz, cor, olhos, cabelo, roupas) de uma criatura ou objeto da mesma categoria de tamanho.', extra:'Interacao Sensorial Simples sobre o alvo' },
                    { id:'fn_partes',  nome:'FunÃ§Ãµes em Partes',    lvl:1, icon:'ðŸ¦¾', desc:'Reproduz partes fisicas extras de uma criatura por suas funÃ§Ãµes. Ex.: guelras, asas, braco-corda.', extra:'Conhecimento profundo das dimensoes e propriedades do alvo' },
                    { id:'ap_compl',   nome:'Aparencia Completa',   lvl:5, icon:'ðŸªž', desc:'Reproduz completamente a aparencia de uma criatura ou objeto da mesma categoria de tamanho.', extra:'Interacao Sensorial Simples + Conhecimento do Alvo' },
                    { id:'fn_compl',   nome:'FunÃ§Ãµes Completas',    lvl:5, icon:'ðŸ”„', desc:'Reproduz completamente as funÃ§Ãµes de uma criatura ou objeto. Requer alteracao de categoria de tamanho. Ex.: moto ou aviao.', extra:'Conhecimento profundo com interacoes profundas/constantes ou pontuais importantes' },
                    { id:'ben10',      nome:'Ben 10',               lvl:6, icon:'ðŸ§¬', desc:'A conjuracao assume os Atributos Fisicos alem das funÃ§Ãµes, no caso de seres vivos.', extra:'FunÃ§Ãµes em Partes ou FunÃ§Ãµes Completas' },
                ];
                var _altRows = '';
                for (var _i = 0; _i < _alt.length; _i++) {
                    var _a = _alt[_i];
                    var _ok = _cLvl >= _a.lvl;
                    var _act = _chosen5 === _a.id;
                    var _bc = _act ? color : (_ok ? '#1f2937' : '#111827');
                    var _tc2 = _act ? color : (_ok ? '#d1d5db' : '#374151');
                    var _bg = _act ? (color + '22') : 'transparent';
                    var _click = _ok
                        ? 'event.stopPropagation();window._hSetSpecialChoice(\'rm_e5\',\'' + _a.id + '\')'
                        : 'event.stopPropagation()';
                    _altRows += '<div onclick="' + _click + '" style="border:1.5px solid ' + _bc + ';border-radius:8px;padding:8px;margin-bottom:6px;background:' + _bg + ';cursor:' + (_ok ? 'pointer' : 'not-allowed') + ';opacity:' + (_ok ? '1' : '0.4') + ';transition:all .15s">'
                        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:' + (_act ? '6' : '0') + 'px">'
                        + '<span style="font-size:13px">' + _a.icon + '</span>'
                        + '<span style="font-size:8px;font-weight:900;color:' + _tc2 + '">' + _a.nome + '</span>'
                        + '<span style="margin-left:auto;font-size:7px;font-weight:700;color:' + (_ok ? color : '#4b5563') + ';background:' + (_ok ? color : '#374151') + '18;padding:2px 6px;border-radius:4px">Nivel ' + _a.lvl + '</span>'
                        + (_act ? '<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:' + color + '33;color:' + color + '">âœ“</span>' : '')
                        + '</div>'
                        + (_act ? '<div style="font-size:7.5px;color:#9ca3af;line-height:1.4;margin-bottom:3px">' + _a.desc + '</div>'
                               + '<div style="font-size:7px;color:#6b7280;font-style:italic">Req. extra: ' + _a.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">ðŸŽ¨ Conjuracao com Alteracoes Fisicas</div>'
                    + '<div style="font-size:7px;color:#6b7280;margin-bottom:8px">+10% de aura por categoria de tamanho acima do usuario</div>'
                    + _altRows
                    + (!_chosen5 ? '<div style="font-size:8px;color:#f87171;margin-top:2px">Escolha uma alteracao para usar</div>' : '')
                    + '</div>';
            }
            // â”€â”€ re_e17: OrÃ¡culo â€” picker de PrevisÃµes e ClarividÃªncia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            if (item.id === 're_e17' && sel) {
                var _re17c = (hb.specialChoices || {})['re_e17'] || '';
                var _re17lvl = charLevel;
                var _re17opts = [
                    { id:'vidente',   nome:'Vidente (Sharingan)', lvl:0,  icon:'ðŸ‘',  desc:'Preveja por milissegundos acoes dos oponentes. +3 em todas as rolagens pela duracao do Hatsu.', extra:'Req: Hatsu com duracao nao Instantanea' },
                    { id:'profeta',   nome:'Profeta',             lvl:4,  icon:'ðŸ“œ',  desc:'Preveja em segredo a proxima acao de um alvo. Com sucesso, o obrigue a seguir essa linha de acao pela duracao. Deve prever 2 acoes por turno.', extra:'Req: Nivel 4' },
                    { id:'cego',      nome:'Cego de Tebas',       lvl:6,  icon:'ðŸ”®',  desc:'1x/dia o Mestre concede uma informacao relevante (aliado, alvo, missao, objeto). Minimo 1, maximo = metade do nivel do personagem.', extra:'Req: Nivel 6' },
                    { id:'joia',      nome:'Joia do Tempo',       lvl:8,  icon:'ðŸ’Ž',  desc:'Fora de combate, ao se concentrar por 1 rodada, veja possibilidades para superar um desafio (Teste ou TR). Role com vantagem.', extra:'Req: Nivel 8' },
                    { id:'olho',      nome:'Olho de Agamoto',     lvl:10, icon:'ðŸŒ€',  desc:'Abra a percepcao temporal. Pela duracao, use Reacoes contra qualquer acao (principal, movimento ou bonus) sem limite, mas sofre 1 nivel de exaustao ao usar 3+ por rodada.', extra:'Req: Nivel 10' },
                ];
                var _re17rows = '';
                for (var _ri = 0; _ri < _re17opts.length; _ri++) {
                    var _ro = _re17opts[_ri];
                    var _rok = _re17lvl >= _ro.lvl;
                    var _ract = _re17c === _ro.id;
                    _re17rows += '<div onclick="event.stopPropagation();' + (_rok ? 'window._hSetSpecialChoice(\'re_e17\',\'' + _ro.id + '\')' : '') + '"'
                        + ' style="border:1.5px solid ' + (_ract ? color : (_rok ? '#1f2937' : '#111827')) + ';border-radius:8px;padding:8px;margin-bottom:5px;background:' + (_ract ? color + '22' : 'transparent') + ';cursor:' + (_rok ? 'pointer' : 'not-allowed') + ';opacity:' + (_rok ? '1' : '0.4') + ';transition:all .15s">'
                        + '<div style="display:flex;align-items:center;gap:6px">'
                        + '<span style="font-size:13px">' + _ro.icon + '</span>'
                        + '<span style="font-size:8px;font-weight:900;color:' + (_ract ? color : (_rok ? '#d1d5db' : '#374151')) + '">' + (_ract ? 'âœ“ ' : '') + _ro.nome + '</span>'
                        + (_ro.lvl > 0 ? '<span style="margin-left:auto;font-size:7px;font-weight:700;color:' + (_rok ? color : '#4b5563') + ';background:' + (_rok ? color : '#374151') + '18;padding:2px 6px;border-radius:4px">Nivel ' + _ro.lvl + '</span>' : '')
                        + '</div>'
                        + (_ract ? '<div style="font-size:7.5px;color:#9ca3af;margin-top:5px;line-height:1.4">' + _ro.desc + '</div><div style="font-size:7px;color:#6b7280;font-style:italic;margin-top:2px">' + _ro.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ðŸ”® Previsoes e Clarividencia</div>'
                    + _re17rows
                    + (!_re17c ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha um efeito</div>' : '')
                    + '</div>';
            }

            // â”€â”€ re_e16: Controle do Tempo â€” picker de Fluxo Temporal ou Tempo de Vida â”€â”€
            if (item.id === 're_e16' && sel) {
                var _re16c = (hb.specialChoices || {})['re_e16'] || '';
                var _re16lvl = charLevel;
                var _re16flux = [
                    { id:'ft_raven',  nome:'Visoes da Raven',    lvl:0,  icon:'âª', desc:'Volte ao fim do seu ultimo turno. Eventos continuam os mesmos, mas ha nova chance de superar recebendo-os e refazendo testes.', extra:'Req: Hatsu com duracao Instantanea' },
                    { id:'ft_cronos', nome:'Cronos',             lvl:4,  icon:'âº', desc:'O beneficio de Visoes da Raven pode ser expandido a um alvo escolhido com toque ou na area do Nen Expandido.', extra:'Req: Nivel 4 + Visoes da Raven' },
                    { id:'ft_senhor', nome:'Senhor do Tempo',    lvl:6,  icon:'â±', desc:'Rebobine um evento (Golpe/Hatsu/Efeito) que ocorreria na rodada atual e adicione ou subtraia 2d6 ao resultado.', extra:'Req: Nivel 6' },
                    { id:'ft_kairos', nome:'Kairos',             lvl:8,  icon:'ðŸŒ€', desc:'Volte ao inicio do seu ultimo turno. Aliados com vantagem, inimigos com desvantagem. Usos = proficiencia por dia.', extra:'Req: Nivel 8 + 2 Restricoes Pesadas' },
                    { id:'ft_futuro', nome:'De volta pro Futuro',lvl:10, icon:'â©', desc:'Remove um alvo do combate ou cena por 3 rodadas (combate) ou 1 minuto (cena).', extra:'Req: Nivel 10' },
                    { id:'ft_tictac', nome:'Tic Tac',            lvl:12, icon:'â°', desc:'Pause o tempo por 1 rodada (ganha um novo turno). Nao pode interagir com pessoas, mas pode com tudo ao redor. Todos ao redor ficam Atordoados. +1 rodada por Restricao Pesada adicional.', extra:'Req: Nivel 12' },
                ];
                var _re16vida = [
                    { id:'tv_envelhece', nome:'Envelhecimento / Rejuvenescimento', lvl:0, icon:'ðŸ•°', desc:'Role 1d10. O resultado x2 e a quantidade em anos que um alvo altera seu tempo de vida pela duracao.', extra:'Req: Controle de Tempo + TR' },
                    { id:'tv_deterio',   nome:'Deteriorar',                        lvl:0, icon:'ðŸ’€', desc:'Ao falhar em um TR, o alvo tem envelhecida determinada caracteristica fisica, cognitiva ou sensorial.', extra:'Req: Envelhecimento + TR' },
                ];
                var _re16rows = '';
                for (var _rfi = 0; _rfi < _re16flux.length; _rfi++) {
                    var _rf = _re16flux[_rfi];
                    var _rfok = _re16lvl >= _rf.lvl;
                    var _rfact = _re16c === _rf.id;
                    _re16rows += '<div onclick="event.stopPropagation();' + (_rfok ? 'window._hSetSpecialChoice(\'re_e16\',\'' + _rf.id + '\')' : '') + '"'
                        + ' style="border:1.5px solid ' + (_rfact ? color : (_rfok ? '#1f2937' : '#111827')) + ';border-radius:8px;padding:7px;margin-bottom:5px;background:' + (_rfact ? color + '22' : 'transparent') + ';cursor:' + (_rfok ? 'pointer' : 'not-allowed') + ';opacity:' + (_rfok ? '1' : '0.4') + ';transition:all .15s">'
                        + '<div style="display:flex;align-items:center;gap:6px">'
                        + '<span style="font-size:12px">' + _rf.icon + '</span>'
                        + '<span style="font-size:8px;font-weight:900;color:' + (_rfact ? color : (_rfok ? '#d1d5db' : '#374151')) + '">' + (_rfact ? 'âœ“ ' : '') + _rf.nome + '</span>'
                        + (_rf.lvl > 0 ? '<span style="margin-left:auto;font-size:7px;font-weight:700;color:' + (_rfok ? color : '#4b5563') + ';background:' + (_rfok ? color : '#374151') + '18;padding:2px 6px;border-radius:4px">Nivel ' + _rf.lvl + '</span>' : '')
                        + '</div>'
                        + (_rfact ? '<div style="font-size:7.5px;color:#9ca3af;margin-top:5px;line-height:1.4">' + _rf.desc + '</div><div style="font-size:7px;color:#6b7280;font-style:italic;margin-top:2px">' + _rf.extra + '</div>' : '')
                        + '</div>';
                }
                var _re16vrows = '';
                for (var _rvi = 0; _rvi < _re16vida.length; _rvi++) {
                    var _rv = _re16vida[_rvi];
                    var _rvact = _re16c === _rv.id;
                    _re16vrows += '<div onclick="event.stopPropagation();window._hSetSpecialChoice(\'re_e16\',\'' + _rv.id + '\')"'
                        + ' style="border:1.5px solid ' + (_rvact ? color : '#1f2937') + ';border-radius:8px;padding:7px;margin-bottom:5px;background:' + (_rvact ? color + '22' : 'transparent') + ';cursor:pointer;transition:all .15s">'
                        + '<div style="display:flex;align-items:center;gap:6px">'
                        + '<span style="font-size:12px">' + _rv.icon + '</span>'
                        + '<span style="font-size:8px;font-weight:900;color:' + (_rvact ? color : '#d1d5db') + '">' + (_rvact ? 'âœ“ ' : '') + _rv.nome + '</span>'
                        + '</div>'
                        + (_rvact ? '<div style="font-size:7.5px;color:#9ca3af;margin-top:5px;line-height:1.4">' + _rv.desc + '</div><div style="font-size:7px;color:#6b7280;font-style:italic;margin-top:2px">' + _rv.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">â± Fluxo Temporal</div>'
                    + '<div style="font-size:7px;color:#6b7280;margin-bottom:8px">Escolha um efeito para usar neste Hatsu</div>'
                    + _re16rows
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">ðŸ•° Tempo de Vida Longo</div>'
                    + _re16vrows
                    + (!_re16c ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha um efeito</div>' : '')
                    + '</div>';
            }

            // â”€â”€ re_e2: CombinaÃ§Ã£o Perigosa â€” picker multi-categoria (atÃ© 3 efeitos) â”€â”€
            if (item.id === 're_e2' && sel) {
                var _re2sc = hb.specialChoices || {};
                var _re2chosen = Array.isArray(_re2sc['re_e2']) ? _re2sc['re_e2'] : [];
                var _re2lvl = charLevel;
                // Numero de vezes que re_e2 esta em ec determina o maximo de slots
                var _re2count = (hb.ec || []).filter(function(id){ return id === 're_e2'; }).length;
                var _re2max = 3 + (_re2count - 1);
                // Categoria filtrada atual
                var _re2cat = (_re2sc['re_e2_cat'] || '');
                var _re2cats = Object.keys(window.HATSU_DB.categorias || {}).filter(function(c){ return c !== 'ESPECIALIZAÃ‡ÃƒO'; });
                var _re2ger = window.HATSU_DB.efeitos_gerais || [];
                // Coleta efeitos da categoria selecionada
                var _re2effList = _re2cat === 'GERAL' ? _re2ger : (_re2cat && window.HATSU_DB.categorias[_re2cat] ? window.HATSU_DB.categorias[_re2cat].efeitos || [] : []);
                // Verifica categorias ja usadas
                var _re2usedCats = {};
                for (var _r2ci = 0; _r2ci < _re2chosen.length; _r2ci++) {
                    var _r2cid = _re2chosen[_r2ci];
                    if (_re2ger.find(function(e){ return e.id === _r2cid; })) { _re2usedCats['GERAL'] = true; continue; }
                    var _foundCat = '';
                    var _catKeys = Object.keys(window.HATSU_DB.categorias || {});
                    for (var _cki = 0; _cki < _catKeys.length; _cki++) {
                        var _ck = _catKeys[_cki];
                        var _catEfs = window.HATSU_DB.categorias[_ck].efeitos || [];
                        if (_catEfs.find(function(e){ return e.id === _r2cid; })) { _foundCat = _ck; break; }
                    }
                    if (_foundCat) _re2usedCats[_foundCat] = true;
                }
                var _re2catButtons = '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'re_e2_cat\',\'GERAL\')" style="padding:3px 7px;border-radius:5px;font-size:7px;font-weight:700;cursor:pointer;border:1px solid ' + (_re2cat==='GERAL'?color:'#1f2937') + ';background:' + (_re2cat==='GERAL'?color+'22':'transparent') + ';color:' + (_re2cat==='GERAL'?color:'#9ca3af') + '">GERAL</button>';
                for (var _r2bi = 0; _r2bi < _re2cats.length; _r2bi++) {
                    var _r2b = _re2cats[_r2bi];
                    var _r2bActive = _re2cat === _r2b;
                    _re2catButtons += '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'re_e2_cat\',\'' + _r2b + '\')" style="padding:3px 7px;border-radius:5px;font-size:7px;font-weight:700;cursor:pointer;border:1px solid ' + (_r2bActive?color:'#1f2937') + ';background:' + (_r2bActive?color+'22':'transparent') + ';color:' + (_r2bActive?color:'#9ca3af') + '">' + _r2b.substring(0,5) + '</button>';
                }
                // Lista de efeitos da categoria selecionada
                var _re2effRows = '';
                if (_re2cat) {
                    for (var _r2ei = 0; _r2ei < _re2effList.length; _r2ei++) {
                        var _r2e = _re2effList[_r2ei];
                        var _r2eAct = _re2chosen.indexOf(_r2e.id) > -1;
                        var _r2eLvlM = (_r2e.req || '').match(/N[iÃ­]vel\s*(\d+)/i);
                        var _r2eLvl = _r2eLvlM ? parseInt(_r2eLvlM[1]) : 0;
                        var _r2eOk = _re2lvl >= _r2eLvl;
                        var _r2eMaxed = !_r2eAct && _re2chosen.length >= _re2max;
                        var _r2eDis = !_r2eOk || _r2eMaxed;
                        var _r2eClick = _r2eDis ? '' : 'window._hToggleRe2Effect(\'' + _r2e.id + '\')';
                        _re2effRows += '<div onclick="event.stopPropagation();' + _r2eClick + '" style="border:1px solid ' + (_r2eAct?color:(_r2eDis?'#111827':'#1f2937')) + ';border-radius:7px;padding:6px 8px;margin-bottom:4px;background:' + (_r2eAct?color+'15':'transparent') + ';cursor:' + (_r2eDis?'not-allowed':'pointer') + ';opacity:' + ((_r2eDis&&!_r2eAct)?'0.4':'1') + ';transition:all .15s">'
                            + '<div style="display:flex;align-items:center;gap:5px">'
                            + '<span style="font-size:8px;font-weight:900;color:' + (_r2eAct?color:(_r2eOk?'#d1d5db':'#374151')) + '">' + (_r2eAct ? 'âœ“ ' : '') + _r2e.nome + '</span>'
                            + (_r2e.req ? '<span style="margin-left:auto;font-size:7px;color:' + (_r2eOk?'#6b7280':'#f87171') + ';flex-shrink:0">' + _r2e.req + '</span>' : '')
                            + '</div>'
                            + (_r2eAct || !_r2eDis ? '<div style="font-size:7px;color:#6b7280;margin-top:2px;line-height:1.3">' + (_r2e.desc || '') + '</div>' : '')
                            + '</div>';
                    }
                }
                // Efeitos ja escolhidos
                var _re2selNames = [];
                for (var _r2si = 0; _r2si < _re2chosen.length; _r2si++) {
                    var _r2sid = _re2chosen[_r2si];
                    var _r2sef = _re2ger.find(function(e){ return e.id===_r2sid; });
                    if (!_r2sef) {
                        var _catKeys2 = Object.keys(window.HATSU_DB.categorias || {});
                        for (var _ck2i = 0; _ck2i < _catKeys2.length; _ck2i++) {
                            var _ck2efs = (window.HATSU_DB.categorias[_catKeys2[_ck2i]].efeitos||[]);
                            _r2sef = _ck2efs.find(function(e){ return e.id===_r2sid; });
                            if (_r2sef) break;
                        }
                    }
                    if (_r2sef) _re2selNames.push(_r2sef.nome);
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px">âš— Combinacao Perigosa</div>'
                    + '<span style="margin-left:auto;font-size:8px;font-weight:700;color:' + (_re2chosen.length>=_re2max?'#f87171':color) + '">' + _re2chosen.length + ' / ' + _re2max + '</span>'
                    + '</div>'
                    + (_re2selNames.length ? '<div style="background:#060d1a;border:1px solid ' + color + '33;border-radius:7px;padding:6px 8px;font-size:8px;color:#9ca3af;margin-bottom:8px">'
                        + _re2selNames.map(function(n){ return '<span style="color:' + color + ';font-weight:700">' + n + '</span>'; }).join(' + ')
                        + '</div>' : '')
                    + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' + _re2catButtons + '</div>'
                    + (_re2cat
                        ? (_re2effList.length ? _re2effRows : '<div style="font-size:8px;color:#4b5563">Sem efeitos disponiveis</div>')
                        : '<div style="font-size:8px;color:#6b7280">Escolha uma categoria acima para ver os efeitos</div>')
                    + (!_re2cat && _re2chosen.length === 0 ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha ate ' + _re2max + ' efeitos de atÃ© ' + _re2max + ' categorias diferentes</div>' : '')
                    + '</div>';
            }

            const dupControlsHtml = showDupControls ? `
                <div style="display:flex;align-items:center;gap:6px;margin-top:6px" onclick="event.stopPropagation()">
                    <span style="font-size:8px;color:#fbbf24;font-weight:700">CÃ³pias:</span>
                    <button onclick="window._hRemoveDuplicateE('${item.id}','${tipo}')"
                        style="width:22px;height:22px;border-radius:6px;background:#1f2937;border:1px solid #374151;color:#f87171;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">âˆ’</button>
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#fbbf24;min-width:16px;text-align:center">${dupCount}</span>
                    <button onclick="${canAddDup ? `window._hAddDuplicateE('${item.id}','${tipo}',${item.pn})` : 'void(0)'}"
                        style="width:22px;height:22px;border-radius:6px;background:${canAddDup?'#fbbf2422':'#1f293755'};border:1px solid ${canAddDup?'#fbbf2455':'#374151'};color:${canAddDup?'#fbbf24':'#4b5563'};font-size:14px;font-weight:900;cursor:${canAddDup?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">+</button>
                    <span style="font-size:8px;color:#6b7280">(${dupCount} Ã— ${item.pn} P.N = ${dupCount * item.pn} P.N${canAddDup?'':' â€” sem P.N âš¡'})</span>
                </div>` : '';

            // Main card onclick: normal toggle unless showing dup controls (then clicking card does nothing extra)
            const mainClick = blocked
                ? clickAction
                : showDupControls
                    ? 'void(0)'
                    : clickAction;

            return `<div onclick="${mainClick}"
                style="padding:8px 10px;border-radius:10px;border:2px solid ${sel ? color : blocked ? (levelCapBlocked ? '#3b82f633' : '#ef444433') : '#1f2937'};background:${sel ? color+'18' : blocked ? '#0f1117' : '#0f1117'};cursor:${blocked ? 'pointer' : showDupControls ? 'default' : afford ? 'pointer' : 'not-allowed'};opacity:${blocked ? '0.45' : afford ? '1' : '0.3'};margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                    <span style="font-size:9px;font-weight:900;text-transform:uppercase;color:${sel ? color : blocked ? '#6b7280' : '#d1d5db'}">${item.nome}</span>
                    <span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:${costColor}22;color:${costColor}">${item.pn} P.N</span>
                    ${sel ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:${color}33;color:${color}">âœ“</span>` : ''}
                    ${lockBadge}
                </div>
                <div style="font-size:8px;color:#6b7280;line-height:1.4">${item.desc}</div>
                <div style="font-size:7px;color:${blocked ? (levelCapBlocked ? '#60a5fa77' : '#ef444499') : '#374151'};font-style:italic;margin-top:3px">Req: ${item.req}${blocked && !levelCapBlocked ? ` â€” <span style="color:#f87171;font-weight:700">${blockReason}</span>` : ''}</div>
                ${dupControlsHtml}
                ${specialHtml}
            </div>`;
        }).join('');
    }

    // â”€â”€ conteÃºdo por etapa â”€â”€
    let content = '', canNext = false;

    // ETAPA 0 â€” CONCEITO
    if (hb.step === 0) {
        canNext = hb.nome.trim().length > 0;
        content = `
        <div style="padding:16px;background:${tc}0f;border:2px solid ${tc}44;border-radius:14px;text-align:center;margin-bottom:20px">
            <div style="font-size:24px;margin-bottom:4px">âœ¦</div>
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:3px">Conceito do Hatsu</div>
            <div style="font-size:9px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:2px">Defina a identidade do seu poder</div>
        </div>
        <div style="margin-bottom:16px">
            <label style="display:block;font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Nome do Hatsu *</label>
            <input type="text" id="hatsu-nome-input" value="${hb.nome.replace(/"/g,'&quot;')}" placeholder="Ex: Corrente do Aprisionamento..."
                style="width:100%;background:#0f1117;border:2px solid ${hb.nome?tc:'#1f2937'};border-radius:10px;padding:12px;color:#fff;font-family:'Orbitron',sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;outline:none;box-sizing:border-box;letter-spacing:1px"
                oninput="window._hUpdateNome(this.value,'${tc}',this)">
        </div>
        <div style="margin-bottom:16px">
            <label style="display:block;font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">DescriÃ§Ã£o narrativa <span style="color:#374151;font-weight:400;text-transform:none">(opcional)</span></label>
            <textarea rows="3" placeholder="Como se manifesta? Qual a origem deste poder..."
                style="width:100%;background:#0f1117;border:2px solid #1f2937;border-radius:10px;padding:12px;color:#9ca3af;font-size:11px;resize:none;outline:none;box-sizing:border-box;line-height:1.5"
                oninput="state.hatsuBuilder.descricao=this.value">${hb.descricao}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Categoria</div>
                <div style="font-size:10px;font-weight:900;color:${tc}">${cls}</div>
            </div>
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">NÃ­vel</div>
                <div style="font-size:10px;font-weight:900;color:#fff">${char.level}</div>
            </div>
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N DisponÃ­veis</div>
                <div style="font-size:10px;font-weight:900;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:8px;color:#374151"> / ${pnMax}</span></div>
                <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap">
                    <span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#6b728018;color:#9ca3af">Base: ${pnBaseLeft}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#fbbf2418;color:#fbbf24">Puras: ${pnPureNonExtremeLeft}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#f9731618;color:#fb923c">Extr.: ${pnExtremeLeft}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:7px;color:#f87171;margin-top:1px">âˆ’${pnSpentOthers} em outros Hatsus</div>`:''}
            </div>
        </div>`;
    }

    // ETAPA 1 â€” TIPO
    else if (hb.step === 1) {
        canNext = hb.tipoA !== '' && hb.tipoB !== '';
        const tiposA = [
            { id:'hostil',   icon:'âš”ï¸', label:'HOSTIL',   sub:'Dano direto e condiÃ§Ãµes negativas', tip:'ComeÃ§a com 2d6+Atributo. Focado em ofensa.' },
            { id:'suporte',  icon:'ðŸ›¡ï¸', label:'SUPORTE',  sub:'Cura, buffs, sem dano direto',      tip:'Sem 2d6 inicial. Curas: 2d6+CON do alvo.' },
            { id:'versatil', icon:'ðŸŒ€', label:'VERSÃTIL',  sub:'Mescla hostil e suporte',           tip:'Pode causar dano E suportar.' },
        ];
        const tiposB = [
            { id:'instantaneo',   icon:'âš¡', label:'INSTANTÃ‚NEO',   sub:'Ativa e termina no mesmo turno', tip:'Investe em dano, alcance ou Ã¡rea.' },
            { id:'longa_duracao', icon:'â³', label:'LONGA DURAÃ‡ÃƒO',  sub:'Persiste por mÃºltiplas rodadas', tip:'Investe em duraÃ§Ã£o, alcance ou CD.' },
        ];
        content = `
        <div style="text-align:center;margin-bottom:14px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">Tipo de Hatsu</div>
            <div style="font-size:9px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Escolha um de cada grupo</div>
        </div>

        <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">ðŸŽ¯ Grupo 1 â€” Foco</div>
        ${tiposA.map(t => {
            const sel = hb.tipoA === t.id;
            return `<div onclick="state.hatsuBuilder.tipoA='${t.id}';render()"
                style="padding:11px;border-radius:12px;border:2px solid ${sel?tc:'#1f2937'};background:${sel?tc+'18':'#0f1117'};cursor:pointer;margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px;flex-shrink:0">${t.icon}</span>
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;color:${sel?tc:'#d1d5db'}">${t.label}</span>
                            ${sel?`<span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:20px;background:${tc}33;color:${tc}">âœ“</span>`:''}
                        </div>
                        <div style="font-size:9px;color:#6b7280;margin-top:2px">${t.sub}</div>
                    </div>
                </div>
                ${sel?`<div style="font-size:9px;color:${tc}cc;margin-top:6px;padding-left:28px;line-height:1.5">${t.tip}</div>`:''}
            </div>`;
        }).join('')}

        <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin:12px 0 8px">â± Grupo 2 â€” DuraÃ§Ã£o</div>
        ${tiposB.map(t => {
            const sel = hb.tipoB === t.id;
            return `<div onclick="state.hatsuBuilder.tipoB='${t.id}';render()"
                style="padding:11px;border-radius:12px;border:2px solid ${sel?tc:'#1f2937'};background:${sel?tc+'18':'#0f1117'};cursor:pointer;margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px;flex-shrink:0">${t.icon}</span>
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;color:${sel?tc:'#d1d5db'}">${t.label}</span>
                            ${sel?`<span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:20px;background:${tc}33;color:${tc}">âœ“</span>`:''}
                        </div>
                        <div style="font-size:9px;color:#6b7280;margin-top:2px">${t.sub}</div>
                    </div>
                </div>
                ${sel?`<div style="font-size:9px;color:${tc}cc;margin-top:6px;padding-left:28px;line-height:1.5">${t.tip}</div>`:''}
            </div>`;
        }).join('')}

        ${hb.tipoA && hb.tipoB ? `<div style="background:${tc}18;border:2px solid ${tc};border-radius:12px;padding:10px;margin-top:4px;text-align:center">
            <div style="font-size:9px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:1px">âœ“ CombinaÃ§Ã£o: ${hb.tipoA.toUpperCase()} + ${hb.tipoB.toUpperCase()}</div>
        </div>` : `<div style="text-align:center;font-size:9px;color:#4b5563;margin-top:8px">Selecione um item de cada grupo para continuar</div>`}
        `;
    }

    // ETAPA 2 â€” RESTRIÃ‡Ã•ES (Gerais + Categoria em tabs)
    else if (hb.step === 2) {
        canNext = true;
        if (!hb.restrTab) hb.restrTab = 'gerais';
        var isGerais = hb.restrTab === 'gerais';
        var db = window.HATSU_DB.restricoes_gerais;
        var grupos = [
            { key:'leves',    label:'LEVES',    peso:'leve',    cor:'#4ade80', cb:'#22c55e33' },
            { key:'moderadas',label:'MODERADAS',peso:'moderada',cor:'#fbbf24', cb:'#eab30833' },
            { key:'pesadas',  label:'PESADAS',  peso:'pesada',  cor:'#f87171', cb:'#ef444433' },
            { key:'variaveis',label:'VARIÃVEIS',peso:'variavel',cor:'#c084fc', cb:'#a855f733' },
            { key:'extremas', label:'EXTREMAS', peso:'extrema', cor:'#fb923c', cb:'#f9731633' },
        ];
        var catItems = catDB.restricoes || [];
        var totalRG = hb.rg.length;
        var totalRC = hb.rc.length;

        // Tabs
        var tabGeraisStyle = isGerais
            ? 'background:#1f2937;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4)'
            : 'background:transparent;color:#4b5563';
        var tabCatStyle = !isGerais
            ? 'background:' + tc + '33;color:' + tc + ';box-shadow:0 2px 8px rgba(0,0,0,.4);border:1px solid ' + tc + '55'
            : 'background:transparent;color:#4b5563;border:1px solid transparent';

        var tabGeraisLabel = 'GERAIS' + (totalRG > 0 ? ' <span style="font-size:8px;background:#ffffff22;padding:1px 5px;border-radius:10px">' + totalRG + '</span>' : '');
        var tabCatLabel = cls + (totalRC > 0 ? ' <span style="font-size:8px;background:' + tc + '33;padding:1px 5px;border-radius:10px">' + totalRC + '</span>' : '');

        var tabsHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;background:#0a0f1a;border-radius:12px;padding:4px">'
            + '<button onclick="state.hatsuBuilder.restrTab=\'gerais\';renderHatsuInPlace()" style="padding:10px;border-radius:9px;font-family:\'Orbitron\',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;border:none;cursor:pointer;transition:all .15s;' + tabGeraisStyle + '">' + tabGeraisLabel + '</button>'
            + '<button onclick="state.hatsuBuilder.restrTab=\'categoria\';renderHatsuInPlace()" style="padding:10px;border-radius:9px;font-family:\'Orbitron\',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;border:none;cursor:pointer;transition:all .15s;' + tabCatStyle + '">' + tabCatLabel + '</button>'
            + '</div>';

        // Search bar for restrictions
        var ft2 = hb.filterText || '';
        var searchBarHtml = '<div style="display:flex;gap:6px;margin-bottom:10px">'
            + '<div style="position:relative;flex:1">'
            + '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#4b5563">ðŸ”</span>'
            + '<input id="hb-filter-input" type="text" value="' + ft2.replace(/"/g,'&quot;') + '" placeholder="Buscar restriÃ§Ã£o..."'
            + ' onkeydown="if(event.key===\'Enter\'){window._hSetFilterText(this.value);}"'
            + ' oninput="this.style.borderColor=this.value?\'' + tc + '\':\'#1f2937\'"'
            + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (ft2 ? tc : '#1f2937') + ';border-radius:9px;padding:8px 10px 8px 30px;color:#fff;font-size:11px;outline:none;transition:border-color .15s">'
            + '</div>'
            + '<button onclick="window._hSetFilterText(document.getElementById(\'hb-filter-input\').value)"'
            + ' style="padding:8px 14px;border-radius:9px;background:' + tc + ';color:#000;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0;font-family:\'Orbitron\',sans-serif">ðŸ”</button>'
            + (ft2 ? '<button onclick="window._hSetFilterText(\'\');document.getElementById(\'hb-filter-input\').value=\'\';"'
                + ' style="padding:8px 12px;border-radius:9px;background:#1f2937;color:#9ca3af;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">âœ•</button>' : '')
            + '</div>';

        var bodyHtml = '';
        if (isGerais) {
            bodyHtml += '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:9px;margin-bottom:10px;font-size:9px;color:#6b7280;line-height:1.5">'
                + 'ðŸ’¡ <span style="color:#fb923c;font-weight:700">Extremas</span> = acesso +2 nÃ­veis. <span style="color:#9ca3af;font-weight:700">Puras</span> = benefÃ­cio vira P.N.'
                + '<span style="float:right;color:#fff;font-weight:900">' + totalRG + ' selecionadas</span></div>';

            bodyHtml += grupos.map(function(g) {
                var rawItems = (db[g.key]||[]).map(function(i){ return Object.assign({}, i, {peso:g.peso}); });
                // Apply text filter
                var items = ft2 ? rawItems.filter(function(i){ return i.nome.toLowerCase().includes(ft2.toLowerCase()) || (i.desc||'').toLowerCase().includes(ft2.toLowerCase()); }) : rawItems;
                var cnt = rawItems.filter(function(i){ return hb.rg.includes(i.id); }).length;
                if (ft2 && items.length === 0) return ''; // hide empty groups when filtering
                var isOpen = ft2 ? true : ((hb.openAccordions||[]).includes(g.key) || cnt > 0);
                var cntBadge = cnt ? '<span style="font-size:9px;font-weight:900;padding:2px 8px;border-radius:20px;background:' + g.cb + ';color:' + g.cor + '">' + cnt + ' sel.</span>' : '';
                var arrow = isOpen ? 'â–¾' : 'â–¸';
                var innerContent = isOpen ? '<div style="padding:8px">' + renderR(items, hb.rg, 'rg') + '</div>' : '';
                return '<div style="margin-bottom:6px;border-radius:10px;border:1px solid ' + (cnt > 0 ? g.cor + '55' : '#1f2937') + ';overflow:hidden">'
                    + '<div onclick="window._hToggleAccordion(\'' + g.key + '\')" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;background:' + g.cb + '44;user-select:none">'
                    + '<span style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:' + g.cor + '">' + g.label + '</span>'
                    + '<div style="display:flex;align-items:center;gap:6px">' + cntBadge + '<span style="font-size:10px;color:' + g.cor + ';display:inline-block">' + arrow + '</span></div>'
                    + '</div>' + innerContent + '</div>';
            }).join('');
        } else {
            // CATEGORIA TAB
            bodyHtml += '<div style="background:#0f1117;border:1px solid ' + tc + '22;border-radius:10px;padding:9px;margin-bottom:10px;font-size:9px;color:#6b7280;line-height:1.5">'
                + '<span style="color:' + tc + ';font-weight:700">Attr. Principal:</span> ' + (catDB.attr_princ || 'â€”')
                + ' &nbsp;â€¢&nbsp; <span style="color:#6b7280">Graus:</span> ' + (catDB.graus || 'â€”')
                + '<span style="float:right;color:' + tc + ';font-weight:900">' + totalRC + ' selecionadas</span></div>';

            var filteredCatItems = ft2 ? catItems.filter(function(i){ return i.nome.toLowerCase().includes(ft2.toLowerCase()) || (i.desc||'').toLowerCase().includes(ft2.toLowerCase()); }) : catItems;

            if (catItems.length === 0) {
                bodyHtml += '<div style="text-align:center;color:#374151;font-style:italic;padding:30px 0">Nenhuma restriÃ§Ã£o especÃ­fica para ' + cls + '.</div>';
            } else if (filteredCatItems.length === 0) {
                bodyHtml += '<div style="text-align:center;color:#374151;font-style:italic;padding:20px">Nenhuma restriÃ§Ã£o encontrada.</div>';
            } else {
                bodyHtml += renderR(filteredCatItems, hb.rc, 'rc');
            }
        }

        content = '<div style="text-align:center;margin-bottom:10px">'
            + '<div style="font-family:\'Orbitron\',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">RestriÃ§Ãµes</div>'
            + '</div>' + tabsHtml + searchBarHtml + bodyHtml;
    }

    // ETAPA 3 â€” EFEITOS GERAIS
    else if (hb.step === 3) {
        canNext = true;
        content = `
        <div style="text-align:center;margin-bottom:10px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">Efeitos Gerais</div>
            <div style="font-size:9px;color:#6b7280;margin-top:3px">DisponÃ­veis para qualquer categoria</div>
        </div>
        <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:9px;margin-bottom:10px">
            <div style="display:flex;align-items:flex-start;gap:7px">
                <span style="font-size:12px;flex-shrink:0">ðŸ“–</span>
                <div>
                    <div style="font-size:8px;font-weight:700;color:#9ca3af;margin-bottom:4px">P.N restantes podem ser usados nos PrincÃ­pios de Nen:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:3px">
                        ${['TEN','REN','ZETSU','HATSU','GYO','EN','IN','KEN','KO','RYU'].map(pn => '<span style="font-size:7px;font-weight:700;padding:2px 5px;border-radius:5px;background:#1f2937;color:#6b7280">'+pn+'</span>').join('')}
                    </div>
                    <div style="font-size:7px;color:#374151">MÃ¡x. 10 P.N por princÃ­pio Â· Hatsus nÃ£o tÃªm limite</div>
                </div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#0f1117;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:14px">
            <div>
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N DisponÃ­veis</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:12px;color:#374151;font-weight:400"> / ${pnMax}</span></div>
                <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">
                    <span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#1f2937;color:#9ca3af" title="Pode ser guardado para outro hatsu">Base <span style="color:#fff">${pnBaseLeft}</span>/${pnBaseAvail}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#fbbf2418;color:#fbbf24" title="Deve ser gasto aqui">Puras <span style="color:#fff">${pnPureNonExtremeLeft}</span>/${pnFromPureNonExtreme}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#f9731618;color:#fb923c" title="Deve ser gasto aqui">Extr. <span style="color:#fff">${pnExtremeLeft}</span>/${pnFromExtreme}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:8px;color:#f87171;font-weight:700;margin-top:1px">âˆ’${pnSpentOthers} em outros Hatsus</div>`:''}
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Selecionados</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:#fff">${hb.eg.length}</div>
            </div>
        </div>
        ${buildFilterBar(true, '#9ca3af')}
        ${renderE(window.HATSU_DB.efeitos_gerais, hb.eg, 'eg', '#9ca3af')}
        ${(() => { const ft = hb.filterText||''; const fs = hb.filterStatus||'todos'; const allItems = window.HATSU_DB.efeitos_gerais; const shown = allItems.filter(item => { if (ft && !item.nome.toLowerCase().includes(ft.toLowerCase()) && !(item.desc||'').toLowerCase().includes(ft.toLowerCase())) return false; return true; }); return shown.length === 0 ? `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhum efeito encontrado.</div>` : ''; })()}`;
    }
    else if (hb.step === 4) {
        canNext = true;

        const charLevel = parseInt(char.level) || 0;

        // Conta restriÃ§Ãµes extremas selecionadas (bÃ´nus de 2 nÃ­veis cada)
        const allRDB_flat = [
            ...(window.HATSU_DB.restricoes_gerais.extremas||[]),
            ...(catDB.restricoes||[]).filter(r => r.peso === 'extrema')
        ];
        const extremeCount = [...hb.rg, ...hb.rc].filter(id => allRDB_flat.some(r => r.id === id)).length;
        const effectiveLevel = Math.min(12, charLevel + extremeCount * 2);
        const access = window.calcCategoryAccess(charLevel, extremeCount);

        // Todas as categorias disponÃ­veis no HATSU_DB
        const ALL_CATS = ['INTENSIFICAÃ‡ÃƒO','TRANSMUTAÃ‡ÃƒO','MATERIALIZAÃ‡ÃƒO','MANIPULAÃ‡ÃƒO','EMISSÃƒO','ESPECIALIZAÃ‡ÃƒO'];
        const CAT_COLORS = {
            'INTENSIFICAÃ‡ÃƒO':'#00ff9d','TRANSMUTAÃ‡ÃƒO':'#d946ef','MATERIALIZAÃ‡ÃƒO':'#ff0055',
            'MANIPULAÃ‡ÃƒO':'#9ca3af','EMISSÃƒO':'#ffe600','ESPECIALIZAÃ‡ÃƒO':'#00f0ff'
        };
        const affinityMap = window.CATEGORY_AFFINITY[cls] || {};
        const pctLabel = { 80:'80%', 60:'60%', 40:'40%', 1:'1%' };

        // Info card â€” tabela de acesso atual
        const accessRows = [
            { pct: '100%', max: access.pct100, color: '#4ade80' },
            { pct: '80%',  max: access.pct80,  color: '#60a5fa' },
            { pct: '60%',  max: access.pct60,  color: '#fbbf24' },
            { pct: '40%',  max: access.pct40,  color: '#f87171' },
        ].filter(r => r.max > 0);

        const accessInfoHtml = `
        <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px">ðŸŒ Acesso a Categorias</div>
                <div style="font-size:8px;color:#4b5563">NÃ­vel ${charLevel}${extremeCount>0?` + ${extremeCount*2} (ext.)`:''} = Efetivo ${effectiveLevel}</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
                ${accessRows.map(r => `<span style="font-size:8px;font-weight:700;padding:3px 8px;border-radius:6px;background:${r.color}18;color:${r.color};border:1px solid ${r.color}33">${r.pct} â†’ atÃ© NÃ­vel ${r.max}</span>`).join('')}
                ${extremeCount>0?`<span style="font-size:8px;font-weight:700;padding:3px 8px;border-radius:6px;background:#f9731618;color:#fb923c;border:1px solid #f9731633">âš¡ +${extremeCount} Extrema${extremeCount>1?'s':''}</span>`:''}
            </div>
        </div>`;

        // Gera seÃ§Ãµes de outras categorias acessÃ­veis
        let otherCatSections = '';

        // Salva a classe atual para checkEspecializacaoAccess
        window._currentBuilderClass = cls;

        for (const otherCls of ALL_CATS) {
            if (otherCls === cls) continue;

            // EspecializaÃ§Ã£o: tratamento especial para ManipulaÃ§Ã£o e MaterializaÃ§Ã£o
            if (otherCls === 'ESPECIALIZAÃ‡ÃƒO') {
                if (cls !== 'MANIPULAÃ‡ÃƒO' && cls !== 'MATERIALIZAÃ‡ÃƒO') continue; // outras categorias: sem acesso
                const espCheck = window.checkEspecializacaoAccess(hb);
                const espDB = window.HATSU_DB.categorias['ESPECIALIZAÃ‡ÃƒO'];
                const espColor = '#a78bfa';
                const openKey = 'xcat_ESPECIALIZAÃ‡ÃƒO';
                const isOpen = (hb.openAccordions||[]).includes(openKey);

                if (espCheck.ok) {
                    // Acesso liberado â€” mostra efeitos atÃ© nÃ­vel 3
                    otherCatSections += `
                    <div style="margin-bottom:10px">
                        <div onclick="window._hToggleAccordion('${openKey}')"
                            style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:2px solid ${espColor}44;border-radius:${isOpen?'12px 12px 0 0':'12px'};padding:10px 12px;cursor:pointer;user-select:none">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${espColor}">ESPECIALIZAÃ‡ÃƒO</span>
                                <span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:${espColor}22;color:${espColor}">1% â€” desbloqueado âœ“</span>
                                <span style="font-size:7px;font-weight:700;color:#6b7280">atÃ© NÃ­vel 3</span>
                            </div>
                            <span style="color:#4b5563;font-size:12px">${isOpen?'â–²':'â–¼'}</span>
                        </div>
                        ${isOpen ? `<div style="background:#0a0f1a;border:2px solid ${espColor}44;border-top:none;border-radius:0 0 12px 12px;padding:10px">
                            ${renderE((espDB&&espDB.efeitos)||[], hb.ec, 'ec', espColor, 3)}
                        </div>` : ''}
                    </div>`;
                } else {
                    // Bloqueado â€” mostra card com regra e progresso
                    const { specEfeitos, totalRestr, needed, counts, pyramidOk, pyramidMsg } = espCheck;
                    const progressPct = Math.min(100, Math.round((totalRestr/needed)*100));
                    otherCatSections += `
                    <div style="margin-bottom:10px">
                        <div onclick="window._showEspRule()"
                            style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:2px solid ${espColor}33;border-radius:12px;padding:10px 12px;cursor:pointer;user-select:none;opacity:0.75">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${espColor}">ESPECIALIZAÃ‡ÃƒO</span>
                                <span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:#ef444422;color:#f87171">ðŸ”’ 1% â€” bloqueado</span>
                            </div>
                            <span style="font-size:8px;color:${espColor};font-weight:700">${totalRestr}/${needed} restr. â„¹ï¸</span>
                        </div>
                        <div style="background:#0a0f1a;border:2px solid ${espColor}22;border-top:none;border-radius:0 0 12px 12px;padding:10px 12px">
                            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                                <span style="font-size:8px;color:#6b7280">RestriÃ§Ãµes necessÃ¡rias</span>
                                <span style="font-size:8px;font-weight:700;color:${totalRestr>=needed?'#4ade80':'#f87171'}">${totalRestr} / ${needed}</span>
                            </div>
                            <div style="background:#1f2937;border-radius:99px;height:6px;overflow:hidden;margin-bottom:8px">
                                <div style="height:100%;width:${progressPct}%;background:${totalRestr>=needed?'#4ade80':espColor};border-radius:99px;transition:width .3s"></div>
                            </div>
                            ${!pyramidOk ? `<div style="font-size:8px;color:#f87171;margin-bottom:6px">âš ï¸ PirÃ¢mide invÃ¡lida: ${pyramidMsg}</div>` : ''}
                            <div style="display:flex;gap:6px;flex-wrap:wrap">
                                ${['leve','moderada','pesada','extrema'].map(p => `<span style="font-size:7px;padding:2px 6px;border-radius:4px;background:#1f2937;color:#9ca3af">${p[0].toUpperCase()+p.slice(1)}: ${counts[p]||0}</span>`).join('')}
                            </div>
                            <button onclick="window._showEspRule()" style="margin-top:8px;width:100%;padding:6px;border-radius:8px;background:${espColor}18;border:1px solid ${espColor}44;color:${espColor};font-size:9px;font-weight:900;text-transform:uppercase;cursor:pointer;letter-spacing:1px">â„¹ï¸ Ver Regra Completa</button>
                        </div>
                    </div>`;
                }
                continue;
            }

            // Acesso normal para outras categorias
            const maxLvl = window.getMaxLevelForCategory(cls, otherCls, charLevel, extremeCount);
            if (!maxLvl || maxLvl <= 0) continue;
            const otherDB = window.HATSU_DB.categorias[otherCls];
            if (!otherDB || !otherDB.efeitos) continue;
            const pct = (window.CATEGORY_AFFINITY[cls]||{})[otherCls] || 0;
            const otherColor = CAT_COLORS[otherCls] || '#9ca3af';
            const pctStr = pct + '%';
            const openKey = 'xcat_' + otherCls;
            const isOpen = (hb.openAccordions||[]).includes(openKey);
            otherCatSections += `
            <div style="margin-bottom:10px">
                <div onclick="window._hToggleAccordion('${openKey}')"
                    style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:2px solid ${otherColor}44;border-radius:${isOpen?'12px 12px 0 0':'12px'};padding:10px 12px;cursor:pointer;user-select:none">
                    <div style="display:flex;align-items:center;gap:8px">
                        <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${otherColor}">${otherCls}</span>
                        <span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:${otherColor}22;color:${otherColor}">${pctStr} afinidade</span>
                        <span style="font-size:7px;font-weight:700;color:#6b7280">atÃ© NÃ­vel ${maxLvl}</span>
                    </div>
                    <span style="color:#4b5563;font-size:12px">${isOpen?'â–²':'â–¼'}</span>
                </div>
                ${isOpen ? `<div style="background:#0a0f1a;border:2px solid ${otherColor}44;border-top:none;border-radius:0 0 12px 12px;padding:10px">
                    ${renderE(otherDB.efeitos, hb.ec, 'ec', otherColor, maxLvl)}
                </div>` : ''}
            </div>`;
        }

        content = `
        <div style="text-align:center;margin-bottom:10px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:#fff;text-transform:uppercase;letter-spacing:2px">Efeitos de ${cls}</div>
            <div style="font-size:9px;font-weight:700;margin-top:3px;color:${tc}">${catDB.graus}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#0f1117;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:14px">
            <div>
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N DisponÃ­veis</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:12px;color:#374151;font-weight:400"> / ${pnMax}</span></div>
                <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">
                    <span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#1f2937;color:#9ca3af" title="Pode ser guardado para outro hatsu">Base <span style="color:#fff">${pnBaseLeft}</span>/${pnBaseAvail}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#fbbf2418;color:#fbbf24" title="Deve ser gasto aqui">Puras <span style="color:#fff">${pnPureNonExtremeLeft}</span>/${pnFromPureNonExtreme}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#f9731618;color:#fb923c" title="Deve ser gasto aqui">Extr. <span style="color:#fff">${pnExtremeLeft}</span>/${pnFromExtreme}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:8px;color:#f87171;font-weight:700;margin-top:1px">âˆ’${pnSpentOthers} em outros Hatsus</div>`:''}
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Attr. Principal</div>
                ${cls === 'MANIPULAÃ‡ÃƒO' ? (() => {
                    const hasCSO = hb.ec.includes('ma_e1');
                    const hasCSC = hb.ec.includes('ma_e2');
                    const activeAttr = (hasCSO && !hasCSC) ? 'INT' : 'PRE';
                    const inactiveAttr = activeAttr === 'INT' ? 'PRE' : 'INT';
                    const activeLabel = activeAttr === 'INT' ? 'INT â€” Objetos' : 'PRE â€” Pessoas';
                    const inactiveLabel = inactiveAttr === 'INT' ? 'INT â€” Objetos' : 'PRE â€” Pessoas';
                    return `<div style="font-size:12px;font-weight:900;color:${tc}">${activeLabel}</div>
                            <div style="font-size:9px;color:#4b5563;margin-top:2px">${inactiveLabel} (outro modo)</div>`;
                })() : `<div style="font-size:13px;font-weight:900;color:${tc}">${catDB.attr_princ}</div>`}
                <div style="font-size:9px;color:#4b5563">${catDB.attr_sec}</div>
            </div>
        </div>
        ${accessInfoHtml}
        ${buildFilterBar(true, tc)}
        <!-- Efeitos da categoria principal -->
        <div style="font-size:9px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">âš¡ ${cls} â€” 100%</div>
        ${renderE(catDB.efeitos, hb.ec, 'ec', tc)}
        <!-- Efeitos de outras categorias acessÃ­veis -->
        ${otherCatSections ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">ðŸŒ Outras Categorias (por Afinidade)</div>
            ${otherCatSections}
        </div>` : ''}`;
    }

    // ETAPA 5 â€” RESUMO
    else if (hb.step === 5) {
        canNext = hb.nome.trim().length > 0 && pnBonusLeft === 0;
        const allRDB = [
            ...(window.HATSU_DB.restricoes_gerais.leves||[]).map(r=>({...r,peso:'leve'})),
            ...(window.HATSU_DB.restricoes_gerais.moderadas||[]).map(r=>({...r,peso:'moderada'})),
            ...(window.HATSU_DB.restricoes_gerais.pesadas||[]).map(r=>({...r,peso:'pesada'})),
            ...(window.HATSU_DB.restricoes_gerais.variaveis||[]).map(r=>({...r,peso:'variavel'})),
            ...(window.HATSU_DB.restricoes_gerais.extremas||[]).map(r=>({...r,peso:'extrema'})),
        ];
        const rGSel = hb.rg.map(id => allRDB.find(r=>r.id===id)).filter(Boolean);
        const rCSel = hb.rc.map(id => catDB.restricoes.find(r=>r.id===id)).filter(Boolean);
        const efGSel = hb.eg.map(id => window.HATSU_DB.efeitos_gerais.find(e=>e.id===id)).filter(Boolean);
        // Resolve efeitos de categoria de TODAS as categorias (suporte cross-category)
        const allCatEfeitos = [];
        Object.values(window.HATSU_DB.categorias||{}).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allCatEfeitos.find(x=>x.id===e.id)) allCatEfeitos.push(e); });
        });
        const efCSel = hb.ec.map(id => allCatEfeitos.find(e=>e.id===id)).filter(Boolean);
        const allR = [...rGSel, ...rCSel];
        const allE = [...efGSel, ...efCSel];
        const _tipoIconsMap = { hostil:'âš”ï¸', suporte:'ðŸ›¡ï¸', versatil:'ðŸŒ€', instantaneo:'âš¡', longa_duracao:'â³' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'âœ¦').join(''); } });
        const _tipoLabels = { hostil:'Hostil', suporte:'Suporte', versatil:'VersÃ¡til', instantaneo:'InstantÃ¢neo', longa_duracao:'Longa DuraÃ§Ã£o' };
    const tipoNames = new Proxy(_tipoLabels, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||p).join(' + '); } });

        content = `
        ${pnBonusLeft > 0 ? `<div style="background:#7f1d1d22;border:2px solid #ef4444;border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
            <span style="font-size:18px;flex-shrink:0">âš ï¸</span>
            <div>
                <div style="font-size:10px;font-weight:900;color:#f87171;text-transform:uppercase;letter-spacing:1px">P.N de restriÃ§Ãµes nÃ£o gastos: ${pnBonusLeft}</div>
                <div style="font-size:8px;color:#9ca3af;margin-top:3px">P.N de restriÃ§Ãµes puras e extremas nÃ£o podem ser guardados. Volte e gaste ${pnBonusLeft} P.N de restriÃ§Ã£o antes de finalizar${pnBaseLeft > 0 ? ` (${pnBaseLeft} P.N de nÃ­vel podem ser guardados para outro hatsu)` : ''}.</div>
            </div>
        </div>` : ''}
        <!-- CabeÃ§alho do Hatsu -->
        <div style="text-align:center;padding:20px;border-radius:16px;border:2px solid ${tc};background:${tc}0a;margin-bottom:16px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;letter-spacing:3px;color:${tc};text-transform:uppercase">${hb.nome||'SEM NOME'}</div>
            <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-top:4px">${cls}</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px">
                <span style="font-size:14px">${tipoIcons[hb.tipo]||'âœ¦'}</span>
                <span style="font-size:10px;font-weight:700;color:#d1d5db">${tipoNames[hb.tipo]||'â€”'}</span>
                <span style="color:#374151">â€¢</span>
                <span style="font-size:10px;color:#6b7280">NÃ­vel ${char.level}</span>
            </div>
            ${hb.descricao?`<div style="font-size:9px;color:#6b7280;font-style:italic;margin-top:10px;line-height:1.6">"${hb.descricao}"</div>`:''}
        </div>
        <!-- Stats -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N Usados</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:#fff">${pnUsed}<span style="font-size:9px;color:#374151">/${pnMax}</span></div>
            </div>
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">RestriÃ§Ãµes</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:#fff">${allR.length}</div>
            </div>
            <div style="background:#0f1117;border:1px solid ${tc}44;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Efeitos</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:${tc}">${allE.length}</div>
            </div>
        </div>
        <!-- Custo base de aura -->
        <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
            <div>
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700">Tempo de AtivaÃ§Ã£o</div>
                <div style="font-size:10px;color:#d1d5db;font-weight:700;margin-top:2px">AÃ§Ã£o Principal</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700">Custo de Aura Base</div>
                ${(() => { const cc = window.calcAuraCost ? window.calcAuraCost(hb) : {pct:50,label:'50% de Aura'}; const reduced = cc.pct < 50; return `<div style="font-size:10px;color:${reduced?'#4ade80':'#d1d5db'};font-weight:700;margin-top:2px">${cc.label}${reduced?` <span style="font-size:8px;color:#4b5563">(reduzido)</span>`:''}</div>`; })()}
            </div>
        </div>
        <!-- RestriÃ§Ãµes -->
        ${allR.length ? `<div style="margin-bottom:16px">
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">â›“ RestriÃ§Ãµes (${allR.length})</div>
            ${allR.map(r=>`<div style="display:flex;align-items:flex-start;gap:8px;background:#0f1117;border-radius:8px;padding:8px;border:1px solid #1f2937;margin-bottom:6px">
                <span style="color:#ef4444;font-size:11px;flex-shrink:0;margin-top:1px">â›“</span>
                <div>
                    <div style="font-size:9px;font-weight:700;color:#d1d5db">${r.nome} <span style="font-size:7px;color:#4b5563">(${r.peso||'geral'})</span></div>
                    <div style="font-size:8px;color:#6b7280;font-style:italic;margin-top:2px">${r.bnf||r.desc}</div>
                </div>
            </div>`).join('')}
        </div>` : ''}
        <!-- Efeitos -->
        ${allE.length ? `<div>
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">âš¡ Efeitos (${allE.length})</div>
            ${allE.map(e=>`<div style="display:flex;align-items:flex-start;gap:8px;background:#0f1117;border-radius:8px;padding:8px;border:2px solid ${tc}22;margin-bottom:6px">
                <span style="color:${tc};font-size:11px;flex-shrink:0;margin-top:1px">âš¡</span>
                <div>
                    <div style="font-size:9px;font-weight:700;color:${tc}">${e.nome} <span style="font-size:8px;color:#4b5563;font-weight:400">(${e.pn} P.N)</span></div>
                    <div style="font-size:8px;color:#6b7280;margin-top:2px;line-height:1.4">${e.desc}</div>
                </div>
            </div>`).join('')}
        </div>` : ''}`;
    }

    // â”€â”€ botÃµes de nav â”€â”€
    const isLast = hb.step === STEPS.length - 1;
    const btnNext = `<button id="hatsu-next-btn" onclick="window._hNext()"
        style="${canNext?`background:${tc};color:#000;box-shadow:0 0 18px ${tc}66`:'background:#1f2937;color:#4b5563;opacity:0.55'};flex:1;padding:14px;border-radius:12px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;transition:all .15s">
        ${isLast ? 'âš”ï¸ FINALIZAR HATSU' : 'PRÃ“XIMO â†’'}
    </button>`;
    const btnPrev = hb.step > 0
        ? `<button onclick="window._hPrev()" style="padding:14px 18px;border-radius:12px;background:#111827;color:#9ca3af;border:1px solid #374151;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">â† VOLTAR</button>`
        : '';

    // â”€â”€ render final â”€â”€
    container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;background:#030712;color:#d1d5db;font-family:'Rajdhani',sans-serif">
        <!-- HEADER -->
        <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            <button onclick="closeHatsuCreator()"
                style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#111827;border:1px solid #1f2937;cursor:pointer;color:#6b7280;font-size:14px">âœ•</button>
            <div style="display:flex;align-items:center;gap:2px;flex:1">${progressBar}</div>
            <div style="flex-shrink:0;text-align:right">
                <div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700">P.N</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;line-height:1;color:${pnLeft<0?'#f87171':'#fff'}">${pnLeft}</div>
            </div>
        </div>
        <!-- STEP LABEL -->
        <div style="padding:6px 14px;background:#0a0f1a;border-bottom:1px solid #0f1117;flex-shrink:0;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#4b5563">Etapa ${hb.step+1} / ${STEPS.length}</span>
            <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:${tc}">${STEPS[hb.step]}</span>
        </div>
        <!-- CONTEÃšDO -->
        <div style="flex:1;overflow-y:auto;padding:16px" class="custom-scrollbar hatsu-creator-scroll">${content}</div>
        <!-- RODAPÃ‰ -->
        <div style="display:flex;gap:10px;padding:14px;border-top:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            ${btnPrev}${btnNext}
        </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
}

// â”€â”€ Handlers globais do Hatsu Creator â”€â”€
window._hUpdateNome = function(val, tc, el) {
    if (!state.hatsuBuilder) return;
    state.hatsuBuilder.nome = val;
    if (el) el.style.borderColor = val.trim() ? tc : '#1f2937';
    // Atualiza visual do botÃ£o sem re-renderizar toda a tela
    const btn = document.querySelector('#hatsu-next-btn');
    if (btn) {
        if (val.trim()) {
            btn.style.background = tc;
            btn.style.color = '#000';
            btn.style.opacity = '1';
            btn.style.boxShadow = '0 0 18px ' + tc + '66';
        } else {
            btn.style.background = '#1f2937';
            btn.style.color = '#4b5563';
            btn.style.opacity = '0.55';
            btn.style.boxShadow = 'none';
        }
    }
};

window._hNext = function() {
    const hb = state.hatsuBuilder; if (!hb) return;
    // ValidaÃ§Ã£o por etapa
    if (hb.step === 0 && !hb.nome.trim()) {
        const input = document.getElementById('hatsu-nome-input');
        if (input) { input.focus(); input.style.borderColor = '#ef4444'; }
        return;
    }
    if (hb.step === 1 && (!hb.tipoA || !hb.tipoB)) {
        return; // usuÃ¡rio precisa selecionar um tipo de cada grupo
    }
    if (hb.step === 5) {
        // Bloqueia se hÃ¡ P.N nÃ£o gastos â€” P.N nÃ£o podem ser guardados para outro nÃ­vel
        const _char5 = state.currentChar;
        const _pnBase5 = window.calcularPHBase(_char5.level);
        const _pnBonus5 = window.calcPNBonusFromRestr(hb);
        const _pnSpentOth5 = window.calcPNSpentInOtherHatsus(_char5, hb.editingIdx);
        const _pnDom5 = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(_char5) : 0;
        const _pnBaseAvail5 = Math.max(0, _pnBase5 - _pnSpentOth5 - _pnDom5);
        let _pnUsed5 = 0;
        hb.eg.forEach(id => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===id); if(e) _pnUsed5+=e.pn; });
        hb.ec.forEach(id => { for (const cat of Object.values(window.HATSU_DB.categorias||{})) { if (!cat||!cat.efeitos) continue; const e=cat.efeitos.find(x=>x.id===id); if(e){_pnUsed5+=e.pn;break;} } });
        // Breakdown por tipo: restriÃ§Ãµes devem ser gastas, base pode ser guardada
        const _pnFromExtreme5 = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
        const _pnFromPureNonExtreme5 = Math.max(0, _pnBonus5 - _pnFromExtreme5);
        const _usedFromExtreme5 = Math.min(_pnUsed5, _pnFromExtreme5);
        const _usedFromPureNonExtreme5 = Math.min(Math.max(0, _pnUsed5 - _pnFromExtreme5), _pnFromPureNonExtreme5);
        const _pnExtremeLeft5 = _pnFromExtreme5 - _usedFromExtreme5;
        const _pnPureNonExtremeLeft5 = _pnFromPureNonExtreme5 - _usedFromPureNonExtreme5;
        const _pnBonusLeft5 = _pnExtremeLeft5 + _pnPureNonExtremeLeft5;
        if (_pnBonusLeft5 > 0) return; // P.N de restriÃ§Ãµes devem ser todos gastos antes de finalizar

        // Salva o hatsu
        const char = state.currentChar;
        if (!char.hatsus) char.hatsus = [];
        const catDB = window.HATSU_DB.categorias[char.class];
        let pnUsed = 0;
        hb.eg.forEach(id => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===id); if(e) pnUsed+=e.pn; });
        hb.ec.forEach(id => {
            for (const cat of Object.values(window.HATSU_DB.categorias||{})) {
                if (!cat || !cat.efeitos) continue;
                const e = cat.efeitos.find(x=>x.id===id);
                if (e) { pnUsed += e.pn; break; }
            }
        });
        const hatsuData = {
            id: (hb.editingIdx !== undefined ? char.hatsus[hb.editingIdx].id : null) || ('hatsu_' + Date.now()),
            nome: hb.nome,
            descricao: hb.descricao,
            tipo: (hb.tipoA||'')+(hb.tipoB?'+'+hb.tipoB:''),
            restricoes: [...hb.rg, ...hb.rc],
            beneficioChoices: {...(hb.beneficioChoices||{})},
            pureRestrictions: {...(hb.pureRestrictions||{})},
            specialChoices: {...(hb.specialChoices||{})},
            efeitos: [...hb.eg, ...hb.ec],
            // Only count base P.N consumed (bonus from pure restrictions is local to this hatsu)
            pnUsados: Math.max(0, pnUsed - window.calcPNBonusFromRestr(hb)),
            nivel: char.level,
            classe: char.class,
            criadoEm: (hb.editingIdx !== undefined ? char.hatsus[hb.editingIdx].criadoEm : null) || new Date().toLocaleDateString('pt-BR')
        };
        if (hb.editingIdx !== undefined) {
            char.hatsus[hb.editingIdx] = hatsuData;
        } else {
            char.hatsus.push(hatsuData);
        }
        saveCharacter(char);
        state.hatsuBuilder = null;
        state.view = 'SHEET';
        state.activeTab = 'NEN';
        render();

        // Primeiro Hatsu â€” distribuiÃ§Ã£o de 5 Graus de PotÃªncia
        const isFirstHatsu = hb.editingIdx === undefined && char.hatsus.length === 1;
        const genTier = char.genialidade;
        if (isFirstHatsu) {
            window._showPrimeiroHatsuModal(char, 0, hatsuData, genTier);
        }
        return;
    }
    hb.step++;
    hb.filterText = '';
    hb.filterStatus = 'todos';
    render();
};
window._hPrev = function() {
    const hb = state.hatsuBuilder; if (!hb || hb.step === 0) return;
    hb.step--;
    render();
};
// Re-render hatsu creator preserving scroll position of content area
function renderHatsuInPlace() {
    const app = document.getElementById('app');
    if (!app) return;
    if (state.view === 'HATSU_CREATOR') {
        const contentDiv = document.querySelector('.hatsu-creator-scroll');
        const scrollTop = contentDiv ? contentDiv.scrollTop : 0;
        renderHatsuCreator(app);
        if (scrollTop > 0) {
            requestAnimationFrame(() => {
                const newContentDiv = document.querySelector('.hatsu-creator-scroll');
                if (newContentDiv) newContentDiv.scrollTop = scrollTop;
            });
        }
    } else if (state.view === 'HATSU_DETAIL') {
        const container = document.querySelector('.hatsu-detail-scroll') || app;
        const scrollTop = container ? container.scrollTop : 0;
        renderHatsuDetail(app);
        if (scrollTop > 0) {
            requestAnimationFrame(() => {
                const c = document.querySelector('.hatsu-detail-scroll') || app;
                if (c) c.scrollTop = scrollTop;
            });
        }
    }
}

window._hToggleAccordion = function(key) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.openAccordions) hb.openAccordions = [];
    const idx = hb.openAccordions.indexOf(key);
    if (idx > -1) hb.openAccordions.splice(idx, 1);
    else hb.openAccordions.push(key);
    renderHatsuInPlace();
};
window._hRemoveDuplicateE = function(id, tipo) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    // Remove last occurrence of id
    const lastIdx = arr.lastIndexOf(id);
    if (lastIdx === -1) return;
    arr.splice(lastIdx, 1);
    renderHatsuInPlace();
};

window._hAddDuplicateE = function(id, tipo, pn) {
    const hb = state.hatsuBuilder; if (!hb) return;
    // Apenas restriÃ§Ãµes EXTREMAS puras permitem comprar o mesmo efeito mais de uma vez
    const _extremePN = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
    const _dupUsed = window.calcDuplicatePNUsed ? window.calcDuplicatePNUsed(hb) : 0;
    if (_extremePN <= 0 || _extremePN - _dupUsed < pn) return;
    let used = 0;
    hb.eg.forEach(eid => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===eid); if(e) used+=e.pn; });
    hb.ec.forEach(eid => {
        for (const cat of Object.values(window.HATSU_DB.categorias||{})) {
            if (!cat || !cat.efeitos) continue;
            const e = cat.efeitos.find(x=>x.id===eid);
            if (e) { used += e.pn; break; }
        }
    });
    const _pnSpentOth = window.calcPNSpentInOtherHatsus(state.currentChar, hb.editingIdx); const _pnDom = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(state.currentChar) : 0; const _pnBaseAvail = Math.max(0, window.calcularPHBase(state.currentChar.level) - _pnSpentOth - _pnDom); const _pnBonus = window.calcPNBonusFromRestr(hb); const _pnBaseUsed = Math.max(0, used - _pnBonus); if (_pnBaseUsed + pn > _pnBaseAvail && used + pn > _pnBaseAvail + _pnBonus) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    // Guarda final: efeitos de ESPECIALIZAÃ‡ÃƒO sÃ³ para ESPECIALIZAÃ‡ÃƒO, MANIPULAÃ‡ÃƒO e MATERIALIZAÃ‡ÃƒO
    if (tipo === 'ec') {
        const _espCatDB2 = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÃ‡ÃƒO'];
        const _espEfIds2 = new Set((_espCatDB2 && _espCatDB2.efeitos || []).map(e => e.id));
        if (_espEfIds2.has(id)) {
            const _charCls2 = state.currentChar && state.currentChar.class;
            if (_charCls2 !== 'ESPECIALIZAÃ‡ÃƒO' && _charCls2 !== 'MANIPULAÃ‡ÃƒO' && _charCls2 !== 'MATERIALIZAÃ‡ÃƒO') return;
        }
    }
    arr.push(id);
    renderHatsuInPlace();
};

window._hSetFilter = function(key, val) {
    const hb = state.hatsuBuilder; if (!hb) return;
    hb[key] = val;
    renderHatsuInPlace();
};
window._hSetFilterText = function(val) {
    const hb = state.hatsuBuilder; if (!hb) return;
    hb.filterText = val;
    renderHatsuInPlace();
};

window._hSetSpecialChoice = function(id, val) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    hb.specialChoices[id] = val;
    renderHatsuInPlace();
};
window._hSetSpecialText = function(id, val) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    hb.specialChoices[id] = val;
    // Don't re-render on every keystroke â€” just store
};

window._hShowDanoInfo = function(idx, btn) {
    var popId = '_dano_info_popup';
    var existing = document.getElementById(popId);
    if (existing) { if (existing.dataset.for == idx) { existing.remove(); return; } existing.remove(); }
    var lines = (window._HATSU_DANO_INFO || {})[idx];
    if (!lines || !lines.length) return;
    var pop = document.createElement('div');
    pop.id = popId;
    pop.dataset.for = String(idx);
    pop.style.cssText = 'position:fixed;z-index:99999;background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:14px 16px;min-width:230px;box-shadow:0 8px 32px #000c;font-size:11px;pointer-events:auto';
    pop.innerHTML = '<div style="font-weight:900;color:#e5e7eb;margin-bottom:10px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase">ðŸ“Š CÃ¡lculo do Dano</div>'
        + lines.map(function(l){
            return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;margin-bottom:5px'+(l.i?';opacity:.75':'')+'">'
                + '<span style="color:#6b7280;white-space:nowrap">'+l.l+'</span>'
                + '<span style="color:'+l.c+';font-weight:'+(l.b?'900':'600')+';font-family:'+(l.b?"'Orbitron',sans-serif":'inherit')+'">'+l.v+'</span>'
                + '</div>';
        }).join('')
        + '<div onclick="document.getElementById(\''+popId+'\').remove()" style="margin-top:10px;font-size:8px;color:#4b5563;cursor:pointer;text-align:right;padding-top:6px;border-top:1px solid #1f2937">âœ• fechar</div>';
    var r = btn.getBoundingClientRect();
    pop.style.top = Math.min(r.bottom + 6, window.innerHeight - 250) + 'px';
    pop.style.left = Math.max(8, r.left - 110) + 'px';
    document.body.appendChild(pop);
    setTimeout(function(){
        document.addEventListener('click', function _cl(e){
            if (!pop.contains(e.target) && e.target !== btn){ pop.remove(); document.removeEventListener('click', _cl); }
        });
    }, 50);
};

window._hTogglePure = function(id) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.pureRestrictions) hb.pureRestrictions = {};
    if (hb.pureRestrictions[id]) {
        delete hb.pureRestrictions[id];
        // Se era restriÃ§Ã£o extrema, limpa duplicatas que excedam o P.N extremo restante
        window._hCleanDuplicatesIfNeeded && window._hCleanDuplicatesIfNeeded(hb);
    } else {
        hb.pureRestrictions[id] = true;
        // Pura nÃ£o usa benefÃ­cio escolhido
        if (hb.beneficioChoices) delete hb.beneficioChoices[id];
    }
    renderHatsuInPlace();
};

window._hToggleR = function(id, tipo) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'rg' ? hb.rg : hb.rc;
    const idx = arr.indexOf(id);
    if (idx > -1) {
        arr.splice(idx, 1);
        // Remove benefÃ­cio escolhido ao desselecionar
        if (hb.beneficioChoices) delete hb.beneficioChoices[id];
        // Se a restriÃ§Ã£o removida era pura extrema, limpa duplicatas que excedam o P.N restante
        if (hb.pureRestrictions && hb.pureRestrictions[id]) {
            delete hb.pureRestrictions[id];
            window._hCleanDuplicatesIfNeeded && window._hCleanDuplicatesIfNeeded(hb);
        }
    } else {
        // Guarda final: restriÃ§Ãµes de ESPECIALIZAÃ‡ÃƒO sÃ³ para ESPECIALIZAÃ‡ÃƒO, MANIPULAÃ‡ÃƒO e MATERIALIZAÃ‡ÃƒO
        if (tipo === 'rc') {
            const _espCatR = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÃ‡ÃƒO'];
            const _espRIds = new Set((_espCatR && _espCatR.restricoes || []).map(r => r.id));
            if (_espRIds.has(id)) {
                const _charClsR = state.currentChar && state.currentChar.class;
                if (_charClsR !== 'ESPECIALIZAÃ‡ÃƒO' && _charClsR !== 'MANIPULAÃ‡ÃƒO' && _charClsR !== 'MATERIALIZAÃ‡ÃƒO') return;
            }
        }
        arr.push(id);
        // Verifica se tem benefÃ­cio alternativo (bnf com " OU ")
        const allRDB = [];
        const rg = window.HATSU_DB.restricoes_gerais;
        ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => (rg[k]||[]).forEach(r => allRDB.push(r)));
        const char = state.currentChar;
        const catDB = window.HATSU_DB.categorias[char.class];
        if (catDB && catDB.restricoes) catDB.restricoes.forEach(r => allRDB.push(r));
        const item = allRDB.find(r => r.id === id);
        if (item && item.bnf && /\s[Oo][Uu]\s/.test(item.bnf)) {
            // Has alternatives â€” will show inline choice, mark as needs-choice
            if (hb.beneficioChoices[id] === undefined) hb.beneficioChoices[id] = null; // null = not yet chosen
        }
    }
    renderHatsuInPlace();
};

window._hSetBeneficioChoice = function(id, choice) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.beneficioChoices) hb.beneficioChoices = {};
    hb.beneficioChoices[id] = choice;
    renderHatsuInPlace();
};
window._hSetBeneficioChoiceIdx = function(id, idx) {
    const opts = window._hBnfOpts && window._hBnfOpts[id];
    if (!opts || idx >= opts.length) return;
    window._hSetBeneficioChoice(id, opts[idx]);
};
window._hToggleRe2Effect = function(effId) {
    var hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    var current = Array.isArray(hb.specialChoices['re_e2']) ? hb.specialChoices['re_e2'].slice() : [];
    var re2count = (hb.ec || []).filter(function(id){ return id === 're_e2'; }).length;
    var re2max = 3 + (re2count - 1);
    var idx = current.indexOf(effId);
    if (idx > -1) {
        current.splice(idx, 1);
    } else {
        if (current.length >= re2max) return;
        current.push(effId);
    }
    hb.specialChoices['re_e2'] = current;
    renderHatsuInPlace();
};
window._hToggleReP1Effect = function(effId) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    const current = Array.isArray(hb.specialChoices['re_p1']) ? hb.specialChoices['re_p1'].slice() : [];
    const idx = current.indexOf(effId);
    if (idx > -1) {
        current.splice(idx, 1);
    } else {
        if (current.length >= 2) return;
        current.push(effId);
    }
    hb.specialChoices['re_p1'] = current;
    renderHatsuInPlace();
};
window._hToggleE = function(id, tipo, pn) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const idx = arr.indexOf(id);
    if (idx > -1) {
        arr.splice(idx, 1);
    } else {
        // Verifica requisito de nÃ­vel/atributo
        const char = state.currentChar;
        const allEDB = [];
        (window.HATSU_DB.efeitos_gerais||[]).forEach(e => allEDB.push(e));
        // Inclui efeitos de TODAS as categorias (para suporte cross-category)
        Object.values(window.HATSU_DB.categorias||{}).forEach(cat => {
            if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allEDB.find(x=>x.id===e.id)) allEDB.push(e); });
        });
        const item = allEDB.find(e => e.id === id);
        if (item && item.req) {
            const kamikazeActive = (hb.rg||[]).includes('rg_e6');
            const req = item.req;
            const charLevel = parseInt(char.level) || 0;
            const getMod = v => Math.floor(((v||10) - 10) / 2);
            const attrMod = k => getMod(char.attributes && char.attributes[k] ? char.attributes[k].value : 10);

            // "Acesso a ReforÃ§o" bypass â€” skip level check entirely
            let bypassedByReforco = false;
            if (/acesso\s+a\s+refor[Ã§c]o/i.test(req)) {
                const REFORCO_CLASSES = ['REFORÃ‡O','INTENSIFICAÃ‡ÃƒO'];
                bypassedByReforco = REFORCO_CLASSES.includes(char.class) ||
                    (window.CATEGORY_AFFINITY && window.CATEGORY_AFFINITY[char.class] &&
                     (window.CATEGORY_AFFINITY[char.class]['REFORÃ‡O'] || window.CATEGORY_AFFINITY[char.class]['INTENSIFICAÃ‡ÃƒO']));
            }

            // NÃ­vel sempre verificado (mesmo com Kamikaze)
            if (!bypassedByReforco) {
                const lvlMatch = req.match(/N[iÃ­]vel\s+(\d+)/i);
                if (lvlMatch && charLevel < parseInt(lvlMatch[1])) return;
            }

            // Kamikaze ignora atributos e prÃ©-requisitos de efeitos, mas nÃ£o o nÃ­vel (jÃ¡ verificado acima)
            if (!kamikazeActive) {
                // "ATTR ou ATTR X+"
                const orAttrPat = /\b(FOR|DES|CON|INT|SAB|PRE)\s+ou\s+(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
                let om; const handledByOr = new Set();
                while ((om = orAttrPat.exec(req)) !== null) {
                    const a1 = om[1].toUpperCase(), a2 = om[2].toUpperCase(), min = parseInt(om[3]);
                    handledByOr.add(a1); handledByOr.add(a2);
                    if (attrMod(a1) < min && attrMod(a2) < min) return;
                }
                // single "ATTR X+"
                const singlePat = /\b(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
                let sm;
                while ((sm = singlePat.exec(req)) !== null) {
                    const attr = sm[1].toUpperCase(), min = parseInt(sm[2]);
                    if (handledByOr.has(attr)) continue;
                    const orCtx = new RegExp(`(${attr})\\s+ou\\s+\\w+\\s+${min}\\+|\\w+\\s+ou\\s+(${attr})\\s+${min}\\+`, 'i');
                    if (orCtx.test(req)) continue;
                    if (attrMod(attr) < min) return;
                }
            }
        }
        // Verifica P.N â€” busca em efeitos gerais + todas as categorias
        let used = 0;
        hb.eg.forEach(eid => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===eid); if(e) used+=e.pn; });
        hb.ec.forEach(eid => {
            // Procura o efeito em todas as categorias
            for (const cat of Object.values(window.HATSU_DB.categorias||{})) {
                if (!cat || !cat.efeitos) continue;
                const e = cat.efeitos.find(x=>x.id===eid);
                if (e) { used += e.pn; break; }
            }
        });
        const _pnSpentOth = window.calcPNSpentInOtherHatsus(state.currentChar, hb.editingIdx); const _pnDom = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(state.currentChar) : 0; const _pnBaseAvail = Math.max(0, window.calcularPHBase(state.currentChar.level) - _pnSpentOth - _pnDom); const _pnBonus = window.calcPNBonusFromRestr(hb); const _pnBaseUsed = Math.max(0, used - _pnBonus); if (_pnBaseUsed + pn > _pnBaseAvail && used + pn > _pnBaseAvail + _pnBonus) return;
        // Guarda final: efeitos de ESPECIALIZAÃ‡ÃƒO sÃ³ para ESPECIALIZAÃ‡ÃƒO, MANIPULAÃ‡ÃƒO e MATERIALIZAÃ‡ÃƒO
        if (tipo === 'ec') {
            const _espCatDB = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÃ‡ÃƒO'];
            const _espEfIds = new Set((_espCatDB && _espCatDB.efeitos || []).map(e => e.id));
            if (_espEfIds.has(id)) {
                const _charCls = state.currentChar && state.currentChar.class;
                if (_charCls !== 'ESPECIALIZAÃ‡ÃƒO' && _charCls !== 'MANIPULAÃ‡ÃƒO' && _charCls !== 'MATERIALIZAÃ‡ÃƒO') return;
            }
        }
        arr.push(id);
    }
    renderHatsuInPlace();
};

// â”€â”€ renderCard (legado â€” mantido para compatibilidade) â”€â”€
function renderCard(item, color) {
    return `<div style="padding:8px;border-radius:8px;border:1px solid #1f2937;background:#0f1117">
        <div style="font-size:9px;font-weight:700;color:#d1d5db;text-transform:uppercase;margin-bottom:4px">${item.nome}</div>
        <div style="font-size:8px;color:#6b7280;font-style:italic;margin-bottom:4px">${item.desc}</div>
        ${item.bnf?`<div style="font-size:8px;font-weight:700;color:#9ca3af">âš¡ ${item.bnf}</div>`:''}
    </div>`;
}
