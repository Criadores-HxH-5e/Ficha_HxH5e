window.CARACTERISTICAS_INVOCACAO = [
    { nome:'Atento',               icon:'👁️',  desc:'Percepção/investigação de criaturas próximas (3m) +2 (escalável)' },
    { nome:'Carapaça/Armadura',    icon:'🛡️',  desc:'Redução de Danos 2 (escalável até 5)' },
    { nome:'Curandeira',           icon:'💚',  desc:'Cura +1 por dado rolado. Req: Efeito de Cura' },
    { nome:'Defensor',             icon:'💎',  desc:'CA +2 para criaturas adjacentes (escalável até 5)' },
    { nome:'Destruidor',           icon:'💥',  desc:'Ataque crítico causa +1 grau/passo de dano' },
    { nome:'Dimensão',             icon:'🌀',  desc:'Conjuração pode ser um ambiente/espaço independente onde se pode entrar' },
    { nome:'Enxame',               icon:'🐝',  desc:'3+ conjurações iguais formam um Enxame (mesma iniciativa, PVs/CAs/Atributos somados)' },
    { nome:'Furtivo',              icon:'🌑',  desc:'Bônus +2 em Furtividade (escalável até 5)' },
    { nome:'Grande',               icon:'⬆️',   desc:'Tamanho +1 grau (Médio→Grande→Enorme→Colossal). Vantagem em TR de FOR/CON' },
    { nome:'Imparável',            icon:'🏃',  desc:'Ignora terreno difícil e não pode ter movimento reduzido' },
    { nome:'Investida',            icon:'⚡',  desc:'Após mover 4,5m em linha reta: TR de FOR ou derruba + 1 grau/passo de dano' },
    { nome:'Montaria',             icon:'🐴',  desc:'Pode servir como montaria (deve ser pelo menos Médio)' },
    { nome:'Móvel/Veloz',          icon:'💨',  desc:'Movimento +3m (escalável: 4,5m, 6m, 7,5m, 9m)' },
    { nome:'Movimento Variável',   icon:'🌊',  desc:'Adquire voo, nado, escalada ou movimento subterrâneo (escalável)' },
    { nome:'Pequeno',              icon:'⬇️',   desc:'Tamanho −1 grau (Médio→Pequeno→Minúsculo). Vantagem em Furtividade' },
    { nome:'Perito',               icon:'🎯',  desc:'Recebe 2 perícias adicionais' },
    { nome:'Perturbador',          icon:'😵',  desc:'Hostis próximos (3m) sofrem −2 em testes de perícia (escalável até 5)' },
    { nome:'Reativo',              icon:'⚔️',   desc:'Possui reações = Prof do usuário. 1x/rodada pode usar reação independente' },
    { nome:'Robustez',             icon:'❤️',   desc:'PV máximo +5 (escalável: 10, 15, 25)' },
    { nome:'Sangue Ruim',          icon:'🌵',  desc:'Ao receber ataque perfurante: criaturas adjacentes sofrem 1d6 de dano (ácido ou perfurante)' },
];

function renderHatsuCreator(container) {
    const char = state.currentChar;
    const cls  = char.class;
    const catDB = window.HATSU_DB.categorias[cls] || window.HATSU_DB.categorias['INTENSIFICAÇÃO'];
    const tc   = catDB.cor || '#00ff88';

    // Inicializa o builder
    if (!state.hatsuBuilder) {
        state.hatsuBuilder = { step:0, nome:'', descricao:'', tipoA:'', tipoB:'', rg:[], rc:[], eg:[], ec:[], openAccordions:['leves','moderadas','pesadas','variaveis','extremas'], restrTab:'gerais', beneficioChoices:{}, pureRestrictions:{}, filterText:'', filterStatus:'todos', filterRestrPeso:'todos', specialChoices:{}, efeitoNiveis:{} };
    }
    const hb = state.hatsuBuilder;

    const pnBase = window.calcularPHBase(char.level);
    const pnBonus = window.calcPNBonusFromRestr(state.hatsuBuilder || {});
    const pnSpentOthers = window.calcPNSpentInOtherHatsus(char, hb.editingIdx);
    const pnSpentDominio = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(char) : 0;
    const pnBaseAvail = Math.max(0, pnBase - pnSpentOthers - pnSpentDominio); // base pool disponível
    let pnUsed = 0;
    hb.eg.forEach(id => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===id); if(e) pnUsed += e.pn; });
    hb.ec.forEach(id => {
        for (const cat of Object.values(window.HATSU_DB.categorias||{})) {
            if (!cat || !cat.efeitos) continue;
            const e = cat.efeitos.find(x=>x.id===id);
            if (e) { pnUsed += e.pn; break; }
        }
    });
    // ── Breakdown por tipo de P.N ──
    // Ordem de consumo: Extremo → Pura não-extrema → Base
    const pnFromExtreme = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
    const pnFromPureNonExtreme = Math.max(0, pnBonus - pnFromExtreme);
    const usedFromExtreme = Math.min(pnUsed, pnFromExtreme);
    const usedFromPureNonExtreme = Math.min(Math.max(0, pnUsed - pnFromExtreme), pnFromPureNonExtreme);
    const usedFromBase = Math.max(0, pnUsed - pnFromExtreme - pnFromPureNonExtreme);
    const pnExtremeLeft = pnFromExtreme - usedFromExtreme;
    const pnPureNonExtremeLeft = pnFromPureNonExtreme - usedFromPureNonExtreme;
    const pnBonusLeft = pnExtremeLeft + pnPureNonExtremeLeft; // total restrições ainda não gastos
    const pnBaseLeft = Math.max(0, pnBaseAvail - usedFromBase); // base restante (pode ser guardado)
    const pnLeft = pnBonusLeft + pnBaseLeft; // total disponível ainda
    const pnMax = pnBaseAvail + pnBonus; // total máximo deste hatsu

    const STEPS = ['CONCEITO','TIPO','RESTRIÇÕES','EFEITOS GERAIS','EFEITOS CATEG.','RESUMO'];

    // ── barra de progresso ──
    const progressBar = STEPS.map((s,i) => {
        const active = i === hb.step, done = i < hb.step;
        const circleStyle = active ? `background:${tc};color:#000;box-shadow:0 0 8px ${tc}88` : done ? 'background:#374151;color:#9ca3af' : 'background:#111827;color:#4b5563;border:1px solid #1f2937';
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;">
            <div style="width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;flex-shrink:0;${circleStyle}">${done?'✓':i+1}</div>
        </div>${i<STEPS.length-1?`<div style="flex:1;height:1px;background:#1f2937;margin-top:10px;max-width:6px;"></div>`:''}`;
    }).join('');

    // ── helpers ──
    const palR = {
        leve:    { bs:'#22c55e', bun:'#14532d55', bg:'#22c55e18', badge:'#4ade8055', bt:'#4ade80' },
        moderada:{ bs:'#eab308', bun:'#71350055', bg:'#eab30818', badge:'#fbbf2455', bt:'#fbbf24' },
        pesada:  { bs:'#ef4444', bun:'#7f1d1d55', bg:'#ef444418', badge:'#f8717155', bt:'#f87171' },
        variavel:{ bs:'#a855f7', bun:'#3b076455', bg:'#a855f718', badge:'#c084fc55', bt:'#c084fc' },
        extrema: { bs:'#f97316', bun:'#7c2d1255', bg:'#f9731618', badge:'#fb923c55', bt:'#fb923c' },
    };

    // rev. Manual 2.0 — painel de Grau de Potência usado/máximo por característica (limite por nível)
    function buildGrauPanelHtml() {
        var grauMaxNivel = window.calcMaxGrauPorNivel ? window.calcMaxGrauPorNivel(char.level) : Infinity;
        if (grauMaxNivel === Infinity || !window.calcGrausPotenciaPorCaracteristica) return '';
        var grauShim = { restricoes: [].concat(hb.rg, hb.rc), efeitos: [].concat(hb.eg, hb.ec), beneficioChoices: hb.beneficioChoices || {}, specialChoices: hb.specialChoices || {}, pureRestrictions: hb.pureRestrictions || {}, classe: char.class, juramentoImutavelNivelBase: hb.juramentoImutavelNivelBase };
        var grauTotals = window.calcGrausPotenciaPorCaracteristica(grauShim, char.level);
        var GRAU_LABELS = { dano:'🔥 Dano/Cura', alcance:'📏 Alcance', area:'🔵 Área', duracao:'⏱️ Duração', acerto:'⚔️ Acerto', cd:'🎯 CD do TR' };
        var grauChips = Object.keys(GRAU_LABELS).filter(function(k){ return grauTotals[k] > 0; }).map(function(k) {
            var grauMaxCar = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, char.class, k) : grauMaxNivel;
            var over = grauTotals[k] > grauMaxCar;
            return '<span style="font-size:8px;font-weight:900;padding:2px 7px;border-radius:10px;background:' + (over ? '#fbbf2422' : '#1f2937') + ';color:' + (over ? '#fbbf24' : '#9ca3af') + '" title="' + (over ? 'Excedente reservado — só ' + grauMaxCar + ' conta(m) até seu nível aumentar o teto' : '') + '">' + GRAU_LABELS[k] + ': ' + grauTotals[k] + '/' + grauMaxCar + (over ? ' ⏳' : '') + '</span>';
        }).join('');
        if (!grauChips) return '';
        return '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:8px;margin-bottom:10px">'
            + '<div style="font-size:7px;color:#4b5563;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:5px">⭐ Grau de Potência por Característica (nível ' + char.level + ')</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:4px">' + grauChips + '</div>'
            + '<div style="font-size:7px;color:#4b5563;margin-top:5px;font-style:italic">⏳ = excedente reservado, aplicado automaticamente quando o teto do nível aumentar</div>'
            + '</div>';
    }

    function renderR(items, arr, tipo) {
        const PURE_PN = { leve:1, moderada:2, pesada:3, extrema:4 };
        return items.map(function(item) {
            var sel = arr.includes(item.id);
            var pw = item.peso || 'leve';
            var p  = palR[pw] || palR.leve;
            var hb = state.hatsuBuilder;
            var isPure = !!(hb && hb.pureRestrictions && hb.pureRestrictions[item.id]);
            var loreOpen = !!(hb && hb.openLore && hb.openLore[item.id]);
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
                        + (isSel ? '✓ ' : '') + opt.trim() + '</button>';
                }).join('');
                choiceHtml = '<div style="margin-top:8px;padding:8px;background:#060a10;border-radius:8px;border:1px solid '
                    + (needsChoice ? '#fb923c44' : '#1f2937') + '">'
                    + '<div style="font-size:8px;font-weight:700;color:' + (needsChoice ? '#fb923c' : '#6b7280')
                    + ';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">'
                    + (needsChoice ? '⚠ Escolha um benefício:' : '✓ Benefício escolhido:') + '</div>'
                    + '<div style="display:flex;flex-direction:column;gap:4px">' + optBtns + '</div></div>';
            }

            // Restrições com P.N automático: exibe badge fixo, sem toggle pura
            var AUTO_PN = { 'rg_e9': 7, 'rg_p3': 3, 'ri_p3': 3 };
            var pureToggleHtml = '';
            if (sel && AUTO_PN[item.id] !== undefined) {
                pureToggleHtml = '<div style="margin-top:8px;padding:5px 10px;border-radius:7px;border:1.5px solid #4ade8055;background:#4ade8018;font-size:8px;font-weight:900;color:#4ade80;display:inline-block">⚡ +' + AUTO_PN[item.id] + ' P.N automático</div>';
            } else if (sel && tipo === 'rg') {
                // Pure toggle button (only for general restrictions without auto P.N)
                pureToggleHtml = '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
                    + '<button onclick="event.stopPropagation();window._hTogglePure(\'' + item.id + '\');return false"'
                    + ' style="padding:5px 10px;border-radius:7px;border:1.5px solid '
                    + (isPure ? '#fbbf24' : '#374151')
                    + ';background:' + (isPure ? '#fbbf2418' : '#0d1117')
                    + ';cursor:pointer;font-size:8px;font-weight:900;color:' + (isPure ? '#fbbf24' : '#6b7280')
                    + ';text-transform:uppercase;letter-spacing:1px;transition:all .15s">'
                    + (isPure ? '✓ Pura — +' + purePn + ' P.N' : '🔄 Usar como Pura (+' + purePn + ' P.N)')
                    + '</button>'
                    + (isPure ? '<span style="font-size:8px;color:#6b7280;font-style:italic">Converte benefício em '
                        + purePn + ' P.N extra' + (pw === 'extrema' ? ' Â· permite repetir efeito' : '') + '</span>' : '')
                    + '</div>';
            }

            // Special: rg_p8 needs a text input for the specific location/condition
            var specialInputHtml = '';
            // rg_l9 and rg_l10: ask alcance or área
            var ALCANCE_AREA_IDS = ['rg_l9','rg_l10'];
            if (sel && ALCANCE_AREA_IDS.includes(item.id)) {
                var aaVal = (hb && hb.specialChoices && hb.specialChoices[item.id]) || '';
                var aaBonusAlc = item.id === 'rg_l9' ? '+1,5m' : '+3m';
                var aaBonusArea = item.id === 'rg_l9' ? '+1,5m' : '+1,5m';
                specialInputHtml = '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📍 Bônus em:</div>'
                    + '<div style="display:flex;gap:6px">'
                    + ['Alcance','Área'].map(function(o) {
                        var active = aaVal === o;
                        var label = o === 'Alcance' ? '📐 Alcance (' + aaBonusAlc + ')' : '🔵 Área (' + aaBonusArea + ')';
                        return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'' + item.id + '\',\'' + o + '\')" '
                            + 'style="flex:1;padding:7px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '
                            + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs + '22' : 'transparent')
                            + ';color:' + (active ? p.bs : '#9ca3af') + ';transition:all .15s">' + label + '</button>';
                    }).join('')
                    + '</div>'
                    + (aaVal ? '<div style="font-size:8px;color:' + p.bs + ';margin-top:4px">✓ ' + aaVal + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha alcance ou área</div>')
                    + '</div>';
            }
            if (sel && item.id === 'rg_p8') {
                var currentVal = (hb && hb.specialChoices && hb.specialChoices['rg_p8']) || '';
                specialInputHtml = '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📍 Especifique o local ou condição:</div>'
                    + '<input type="text" value="' + currentVal.replace(/"/g,'&quot;') + '" placeholder="Ex: Sob a chuva, No topo de uma montanha..."'
                    + ' onchange="window._hSetSpecialChoice(\'rg_p8\', this.value)"'
                    + ' oninput="window._hSetSpecialText(\'rg_p8\', this.value);this.style.borderColor=this.value?\'#4ade80\':\'#374151\'"'
                    + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (currentVal ? '#4ade80' : '#374151') + ';border-radius:8px;padding:8px 10px;color:#fff;font-size:10px;outline:none;transition:border-color .15s">'
                    + (currentVal ? '<div style="font-size:8px;color:#4ade80;margin-top:4px">✓ ' + currentVal + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Campo obrigatório para finalizar</div>')
                    + '</div>';
            }
            // Special: rg_v10 Zetsu por Falha — choose rodadas and alcance/area
            if (sel && item.id === 'rg_v10') {
                var v10Val = (hb && hb.specialChoices && hb.specialChoices['rg_v10']) || {};
                if (typeof v10Val === 'string') v10Val = {}; // migrate old
                var v10Rodadas = v10Val.rodadas || 0;
                var v10Tipo = v10Val.tipo || '';
                var rodadasOpts = [1,2,3,4,5,6];
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ Zetsu por Falha — configure o risco:</div>'
                    // Rodadas picker
                    + '<div style="font-size:8px;color:#9ca3af;font-weight:700;margin-bottom:5px">🔄 Rodadas de Zetsu (= bônus de graus):</div>'
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
                    // Alcance ou Área
                    + '<div style="font-size:8px;color:#9ca3af;font-weight:700;margin-bottom:5px">📍 Aplicar graus em:</div>'
                    + '<div style="display:flex;gap:6px;margin-bottom:8px">'
                    + ['Alcance','Área'].map(function(o) {
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
                            + (o === 'Alcance' ? '📐' : '🔵') + ' ' + o + '</button>';
                    }).join('')
                    + '</div>'
                    + (v10Rodadas && v10Tipo
                        ? '<div style="font-size:9px;font-weight:700;color:' + p.bs + ';padding:6px 10px;background:' + p.bs + '18;border-radius:8px">'
                          + '✓ +' + v10Rodadas + ' Grau(s) em ' + v10Tipo + ' — risco: ' + v10Rodadas + ' rod. de Zetsu'
                          + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Escolha as rodadas e onde aplicar</div>')
                    + '</div>';
            }
            if (sel && item.id === 'rg_e5') {
                var jurVal = (hb && hb.specialChoices && hb.specialChoices['rg_e5']) || '';
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:#fb923c;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">⚔️ Escreva seu Juramento:</div>'
                    + '<textarea placeholder="Ex: Juro que nunca usarei meu Nen contra aliados..." rows="3"'
                    + ' onchange="window._hSetSpecialChoice(\'rg_e5\', this.value)"'
                    + ' oninput="window._hSetSpecialText(\'rg_e5\', this.value);this.style.borderColor=this.value?\'#fb923c\':\'#374151\'"'
                    + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (jurVal ? '#fb923c' : '#374151') + ';border-radius:8px;padding:8px 10px;color:#fff;font-size:10px;outline:none;resize:vertical;transition:border-color .15s;font-family:Rajdhani,sans-serif">'
                    + jurVal.replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    + '</textarea>'
                    + (jurVal ? '<div style="font-size:8px;color:#fb923c;margin-top:4px;font-style:italic">"' + jurVal + '"</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ O juramento deve ser escrito para ativar o bônus</div>')
                    + '</div>';
            }
            // Special: rg_m8 Explicar o Hatsu — escolhe a Condição Média aplicada
            if (sel && item.id === 'rg_m8') {
                var m8Val = (hb && hb.specialChoices && hb.specialChoices['rg_m8']) || '';
                var MEDIA_CONDITIONS = ['Agarrado','Imobilizado','Atordoado','Sangramento Leve (2d4)','Fragilizado','Desorientado'];
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🩸 Escolha a Condição Média Aplicada:</div>'
                    + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
                    + MEDIA_CONDITIONS.map(function(c) {
                        var active = m8Val === c;
                        return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rg_m8\',\'' + c + '\')" '
                            + 'style="padding:4px 8px;border-radius:7px;font-size:8px;font-weight:' + (active?'900':'600') + ';cursor:pointer;border:1.5px solid ' + (active ? p.bs : '#1f2937') + ';background:' + (active ? p.bs + '22' : 'transparent') + ';color:' + (active ? p.bs : '#9ca3af') + ';white-space:nowrap">' + c + '</button>';
                    }).join('')
                    + '</div>'
                    + (m8Val ? '<div style="font-size:8px;color:' + p.bs + ';margin-top:5px">✓ Condição: ' + m8Val + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha a condição aplicada</div>')
                    + '</div>';
            }
            // Special: re_p1 Inconsciente Após Uso — choose exactly 2 effects (general + category)
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
                    var m = req.match(/N[ií]vel\s+(\d+)/i);
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
                        + (isSelected ? '✓ ' : '') + eff.nome + '</div>'
                        + (eff.req ? '<div style="font-size:7px;color:' + (locked ? '#f87171' : '#6b7280') + ';margin-top:1px">' + eff.req + (locked ? ' 🚫' : '') + '</div>' : '')
                        + '</div></div></div>';
                }
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">⚡ Escolha 2 Efeitos (' + re1Chosen.length + '/2)</div>'
                    + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">Nível efetivo: ' + re1EffLevel + ' — efeitos bloqueados não satisfazem o requisito</div>'
                    + '<div style="font-size:8px;font-weight:700;color:#9ca3af;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">🌐 Efeitos Gerais</div>'
                    + re1Gerais.map(function(e){ return re1CardHtml(e, 'geral'); }).join('')
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';margin-top:8px;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">⚡ Efeitos de Categoria</div>'
                    + re1CatEfs.map(function(e){ return re1CardHtml(e, 'cat'); }).join('')
                    + (re1Chosen.length === 2
                        ? '<div style="font-size:9px;font-weight:700;color:' + p.bs + ';padding:6px 10px;background:' + p.bs + '18;border-radius:8px;margin-top:6px">✓ '
                          + re1Chosen.map(function(id){
                              var ef = re1Gerais.find(function(e){ return e.id===id; }) || re1CatEfs.find(function(e){ return e.id===id; });
                              return ef ? ef.nome : id;
                            }).join(' + ')
                          + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:6px">⚠ Selecione exatamente 2 efeitos</div>')
                    + '</div>';
            }
            // Special: rma_m2 Zetsu Interrompe — choose benefit
            if (sel && item.id === 'rma_m2') {
                var rma2Val = (hb && hb.specialChoices && hb.specialChoices['rma_m2']) || '';
                var rma2opts = [['Dano Sanidade','💜','+2 San/rod'],['Bônus Jogadas','⚡','+2 jogadas']];
                specialInputHtml += '<div style="margin-top:8px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:700;color:' + p.bs + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ Escolha o efeito:</div>'
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
                    + (rma2Val ? '<div style="font-size:8px;color:' + p.bs + ';margin-top:4px">✓ ' + rma2Val + '</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha o efeito do Zetsu</div>')
                    + '</div>';
            }

            return '<div onclick="window._hToggleR(\'' + item.id + '\',\'' + tipo + '\')"'
                + ' style="padding:8px;border-radius:10px;border:2px solid ' + borderColor
                + ';background:' + (isPure ? '#fbbf2408' : sel ? p.bg : 'transparent')
                + ';cursor:pointer;margin-bottom:8px;transition:all .15s">'
                + '<div style="display:flex;align-items:flex-start;gap:8px;">'
                + '<span style="font-size:7px;font-weight:900;padding:2px 5px;border-radius:4px;background:' + p.badge + ';color:' + p.bt + ';text-transform:uppercase;flex-shrink:0;margin-top:2px">'
                + pw.substring(0,3).toUpperCase() + '</span>'
                + (pw === 'variavel'
                    ? '<button onclick="event.stopPropagation();window._hShowVariavelInfo(this)" style="background:transparent;border:1px solid ' + p.bt + '77;border-radius:50%;width:14px;height:14px;line-height:12px;padding:0;margin-top:2px;cursor:pointer;font-size:8px;font-weight:900;color:' + p.bt + ';flex-shrink:0" title="O que são Restrições Variáveis?">i</button>'
                    : '')
                + '<div style="flex:1;min-width:0">'
                + '<div style="font-size:9px;font-weight:900;text-transform:uppercase;color:' + (isPure ? '#fbbf24' : sel ? p.bs : '#d1d5db') + ';line-height:1.2">'
                + item.nome + (sel ? ' <span style="color:' + (isPure ? '#fbbf24' : p.bt) + '">✓</span>' : '') + '</div>'
                + '<div style="font-size:8px;color:#6b7280;font-style:italic;margin-top:3px;line-height:1.4">' + item.desc + '</div>'
                + (isPure
                    ? '<div style="font-size:8px;font-weight:700;color:#fbbf24;margin-top:4px">⚡ Pura: +' + purePn + ' P.N</div>'
                    : '<div style="font-size:8px;font-weight:700;color:' + p.bt + ';margin-top:4px">⚡ ' + item.bnf + '</div>')
                + '</div></div>'
                + (isPure ? '' : choiceHtml)
                + pureToggleHtml
                + specialInputHtml
                + (item.lore
                    ? '<div style="margin-top:6px" onclick="event.stopPropagation()">'
                        + '<button onclick="event.stopPropagation();window._hToggleLore(\'' + item.id + '\')" style="background:transparent;border:none;padding:0;font-size:7px;font-weight:900;color:#4b5563;cursor:pointer;text-transform:uppercase;letter-spacing:1px">'
                        + (loreOpen ? '▾ ' : '▸ ') + '📖 Dicionário'
                        + '</button>'
                        + (loreOpen
                            ? '<div style="margin-top:4px;padding:8px;background:#0a0f1a;border:1px solid ' + p.bs + '33;border-radius:8px;font-size:8px;color:#9ca3af;line-height:1.5">' + item.lore + '</div>'
                            : '')
                        + '</div>'
                    : '')
                + '</div>';
        }).join('');
    }

    // ── Filter bar helper ──────────────────────────────────────────────────────
    function buildFilterBar(showStatusFilter = true, accentColor = '#9ca3af') {
        const ft = hb.filterText || '';
        const fs = hb.filterStatus || 'todos';
        const statusOpts = [
            { id:'todos',       label:'Todos' },
            { id:'selecionados',label:'✓ Selecionados' },
            { id:'disponiveis', label:'✅ Disponíveis' },
            { id:'bloqueados',  label:'🚫 Bloqueados' },
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
                    <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#4b5563">🔍</span>
                    <input id="hb-filter-input" type="text" value="${ft.replace(/"/g,'&quot;')}" placeholder="Buscar efeito..."
                        onkeydown="if(event.key==='Enter'){window._hSetFilterText(this.value);}"
                        style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ${ft ? accentColor : '#1f2937'};border-radius:9px;padding:8px 10px 8px 30px;color:#fff;font-size:11px;outline:none;transition:border-color .15s"
                        oninput="this.style.borderColor=this.value?'${accentColor}':'#1f2937'">
                </div>
                <button onclick="window._hSetFilterText(document.getElementById('hb-filter-input').value)"
                    style="padding:8px 14px;border-radius:9px;background:${accentColor};color:#000;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0;font-family:'Orbitron',sans-serif">🔍</button>
                ${ft ? `<button onclick="window._hSetFilterText('');document.getElementById('hb-filter-input').value='';"
                    style="padding:8px 12px;border-radius:9px;background:#1f2937;color:#9ca3af;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">✕</button>` : ''}
            </div>
            ${showStatusFilter ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${statusBtns}</div>` : ''}
        </div>`;
    }

    function renderE(items, arr, tipo, color, maxLevelOverride) {
        const char = state.currentChar;
        const charLevel = parseInt(char.level) || 0;
        const getMod = v => Math.floor(((v||10) - 10) / 2);
        const attrMod = k => getMod(char.attributes && char.attributes[k] ? char.attributes[k].value : 10);

        // Verifica se Kamikaze (rg_e6) está selecionado → ignora todos os pré-requisitos de efeitos
        const kamikazeActive = (hb.rg||[]).includes('rg_e6');

        // Verifica se há restrição extrema PURA ativa → permite selecionar mesmo efeito múltiplas vezes
        const pureRestr = hb.pureRestrictions || {};
        const allRDB_check = [];
        const rgCheck = window.HATSU_DB && window.HATSU_DB.restricoes_gerais;
        if (rgCheck) ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => {
            const peso = k === 'variaveis' ? 'variavel' : k.replace(/s$/,'');
            (rgCheck[k]||[]).forEach(r => allRDB_check.push({...r, peso}));
        });
        const hasPureExtreme =
            // rg_e9 (Vida por Poder) equivale a extrema pura: P.N automático habilita duplicatas
            (hb.rg||[]).includes('rg_e9') ||
            [...(hb.rg||[]), ...(hb.rc||[])].some(id =>
                pureRestr[id] && (allRDB_check.find(r => r.id === id) || {}).peso === 'extrema'
            );

        // P.N extremo disponível e quanto já foi gasto em duplicatas
        const extremePurePN = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
        const dupPNUsed = window.calcDuplicatePNUsed ? window.calcDuplicatePNUsed(hb) : 0;
        const extremePNLeft = extremePurePN - dupPNUsed;

        // Parses a req string and returns { ok: bool, reason: string, bypassedByReforco: bool }
        function checkReq(req) {
            if (!req) return { ok: true, reason: '', bypassedByReforco: false };
            const reasons = [];

            // "Acesso a Reforço" — satisfied if char is REFORÇO/INTENSIFICAÇÃO or has access via affinity
            if (/acesso\s+a\s+refor[çc]o/i.test(req)) {
                const REFORCO_CLASSES = ['REFORÇO','INTENSIFICAÇÃO'];
                const hasReforcoAccess = REFORCO_CLASSES.includes(char.class) ||
                    (window.CATEGORY_AFFINITY && window.CATEGORY_AFFINITY[char.class] &&
                     (window.CATEGORY_AFFINITY[char.class]['REFORÇO'] || window.CATEGORY_AFFINITY[char.class]['INTENSIFICAÇÃO']));
                if (hasReforcoAccess) return { ok: true, reason: '', bypassedByReforco: true }; // bypass level cap too
            }

            // Nível X — sempre verificado, mesmo com Kamikaze ativo
            const lvlMatch = req.match(/N[ií]vel\s+(\d+)/i);
            if (lvlMatch) {
                const needed = parseInt(lvlMatch[1]);
                if (charLevel < needed) reasons.push(`Nível ${needed} (você está no Nível ${charLevel})`);
            }

            // Kamikaze ignora todos os outros requisitos (atributos, pré-requisitos de efeitos), mas não o nível
            if (kamikazeActive) return { ok: reasons.length === 0, reason: reasons.join(' • '), bypassedByReforco: false };

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

            return { ok: reasons.length === 0, reason: reasons.join(' • '), bypassedByReforco: false };
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
                    : (() => { const lm = (item.req||'').match(/N[ií]vel\s+(\d+)/i); return !lm || parseInt(lm[1]) <= maxLevelOverride; })();
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

            // Cross-category level cap check — skipped if "Acesso a Reforço" was the bypass reason
            let levelCapBlocked = false, levelCapReason = '';
            if (!bypassedByReforco && maxLevelOverride !== undefined && maxLevelOverride !== null) {
                const itemLvlMatch = (item.req || '').match(/N[ií]vel\s+(\d+)/i);
                const itemLevel = itemLvlMatch ? parseInt(itemLvlMatch[1]) : 1;
                if (itemLevel > maxLevelOverride) {
                    levelCapBlocked = true;
                    levelCapReason = `Acesso limitado a efeitos até Nível ${maxLevelOverride} para esta categoria`;
                }
            }

            const blocked = (!reqOk || levelCapBlocked) && !sel;
            const blockReason = levelCapBlocked ? levelCapReason : reqReason;
            const costColor = item.pn >= 3 ? '#f87171' : item.pn >= 2 ? '#fbbf24' : '#6b7280';

            // Determine click action
            let clickAction;
            if (blocked) {
                const msg = levelCapBlocked
                    ? `🌐 Acesso por Afinidade Insuficiente\\n\\n${levelCapReason}`
                    : `❌ Requisito não atendido\\n\\n${blockReason}\\n\\nReq. original: ${item.req}`;
                clickAction = `alert('${msg.replace(/'/g, "\\'")}')`;
            } else if (!afford) {
                clickAction = 'void(0)';
            } else {
                // Sem extrema pura: toggle normal (sem duplicatas no mesmo nível)
                clickAction = `window._hToggleE('${item.id}','${tipo}',${item.pn})`;
            }

            // Contagem TOTAL de cópias deste efeito (soma de compras via P.N normal por nível + extrema pura)
            const totalCopies = arr.filter(x => x === item.id).length;
            const itemRepetivel = window.isEfeitoRepetivel(item);
            const repetivelNiveisArr = (hb.efeitoNiveis && hb.efeitoNiveis[item.id]) || [];
            const repetivelTracked = itemRepetivel ? repetivelNiveisArr.length : 0;
            const repetivelNesteNivel = itemRepetivel && repetivelNiveisArr.some(lv => lv === charLevel);
            const showRepetivelBadge = itemRepetivel && sel && totalCopies > 0;

            // Duplicatas via Restrição Extrema Pura: para efeitos repetíveis, só as cópias ALÉM das já
            // rastreadas por nível contam como "extra extrema" (senão a mesma cópia seria contada 2x)
            const extremeExtra = itemRepetivel ? Math.max(0, totalCopies - repetivelTracked) : totalCopies;
            const dupCount = hasPureExtreme ? extremeExtra : 0;
            const showDupControls = hasPureExtreme && sel && dupCount > 0 && !itemRepetivel;
            // Botão + só ativo se há P.N extremo suficiente para mais uma cópia e não estourou o teto de usos
            const canAddDup = hasPureExtreme && extremePNLeft >= item.pn && afford && (!item.maxUsos || totalCopies < item.maxUsos);

            const lockBadge = blocked
                ? levelCapBlocked
                    ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#3b82f622;color:#60a5fa">🌐 LV${maxLevelOverride}+</span>`
                    : `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#ef444422;color:#f87171">❌ REQ</span>`
                : kamikazeActive && item.req && item.req !== 'Nível 1'
                    ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#f9731622;color:#fb923c">⚡ KAMIKAZE</span>`
                    : showDupControls
                        ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#fbbf2422;color:#fbbf24">×${dupCount} PURA</span>`
                        : showRepetivelBadge
                            ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#22c55e22;color:#4ade80">✦ Selecionado ${totalCopies}x${item.maxUsos ? `/${item.maxUsos}` : ''}</span>`
                            : '';

            // Special UI blocks for specific effects
            let specialHtml = '';
            if (sel && !blocked) {
                const specialChoices = hb.specialChoices || {};

                // eg3: Condição Perigosa — show condition picker based on level
                if (item.id === 'eg3') {
                    const CONDITIONS_BY_LEVEL = {
                        1: ['Caído','Cego','Surdo','Mudo','Lento (−3m)','Assustado','Envenenado'],
                        2: ['Agarrado','Imobilizado','Atordoado','Sangramento Leve (2d4)','Fragilizado','Desorientado'],
                        3: ['Paralisado','Incapacitado','Sangramento Médio (2d6)','Exaustão Nível 1','Inconsciente'],
                        5: ['Sangramento Forte (2d10)','Exaustão Nível 2','Dano Permanente (1d4)'],
                        7: ['Morte Imediata (CD 20 CON)','Exaustão Nível 3','Coma'],
                    };
                    // hb.specialChoices['eg3'] é uma lista "flat" de condições — 1 entrada por rodada
                    // alocada, na ordem em que foi adicionada. Ex: ['Surdo','Surdo','Cego'] = Surdo
                    // com 2 rodadas + Cego com 1 rodada. Total de entradas ≤ cópias compradas do eg3.
                    let eg3Points = specialChoices['eg3'];
                    if (!Array.isArray(eg3Points)) eg3Points = eg3Points ? [eg3Points] : [];
                    const eg3Counts = {};
                    eg3Points.forEach(c => { eg3Counts[c] = (eg3Counts[c] || 0) + 1; });
                    const pontosUsados = eg3Points.length;
                    const pontosRestantes = Math.max(0, totalCopies - pontosUsados);

                    const allAvail = [];
                    Object.entries(CONDITIONS_BY_LEVEL).forEach(([lvl, conds]) => {
                        if (charLevel >= parseInt(lvl)) conds.forEach(c => allAvail.push({c, lvl: parseInt(lvl)}));
                    });
                    // Category suggestions
                    const catSuggestions = {
                        'MANIPULAÇÃO': ['Agarrado','Atordoado','Paralisado'],
                        'EMISSÃO': ['Caído','Sangramento Leve (2d4)','Cego'],
                        'TRANSMUTAÇÃO': ['Envenenado','Sangramento Leve (2d4)','Lento (−3m)'],
                        'INTENSIFICAÇÃO': ['Caído','Atordoado','Fragilizado'],
                        'MATERIALIZAÇÃO': ['Agarrado','Imobilizado','Paralisado'],
                    };
                    const suggestions = catSuggestions[char.class] || [];

                    const chosenRowsHtml = Object.keys(eg3Counts).map(c => {
                        const rodadas = eg3Counts[c];
                        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
                            <span style="flex:1;font-size:9px;font-weight:700;color:${color}">${c}</span>
                            <span style="font-size:8px;color:#9ca3af">${rodadas} rodada${rodadas>1?'s':''}</span>
                            <button onclick="event.stopPropagation();window._hEg3RemovePonto('${c}')"
                                style="width:20px;height:20px;border-radius:5px;background:#1f2937;border:1px solid #374151;color:#f87171;font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">−</button>
                            <button onclick="event.stopPropagation();${pontosRestantes>0?`window._hEg3AddPonto('${c}')`:'void(0)'}"
                                style="width:20px;height:20px;border-radius:5px;background:${pontosRestantes>0?color+'22':'#1f293755'};border:1px solid ${pontosRestantes>0?color+'55':'#374151'};color:${pontosRestantes>0?color:'#4b5563'};font-size:12px;font-weight:900;cursor:${pontosRestantes>0?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">+</button>
                        </div>`;
                    }).join('');

                    const addButtonsHtml = allAvail.filter(({c}) => !eg3Counts[c]).map(({c, lvl}) => {
                        const isSugg = suggestions.includes(c);
                        const canAdd = pontosRestantes > 0;
                        return `<button onclick="event.stopPropagation();${canAdd?`window._hEg3AddPonto('${c}')`:'void(0)'}"
                            style="padding:4px 8px;border-radius:7px;font-size:8px;font-weight:600;cursor:${canAdd?'pointer':'not-allowed'};opacity:${canAdd?1:0.4};border:1.5px solid ${isSugg?color+'66':'#1f2937'};background:${isSugg?color+'11':'transparent'};color:${isSugg?color+'cc':'#9ca3af'};white-space:nowrap">
                            ${isSugg?'⭐':''}${c}${lvl>1?` <span style="font-size:7px;opacity:.6">Lv${lvl}+</span>`:''}
                        </button>`;
                    }).join('');

                    specialHtml = `<div style="margin-top:8px;background:#0a0f1a;border:1px solid ${color}33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                            <div style="font-size:8px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:1px">🩸 Condições Aplicadas</div>
                            <span style="margin-left:auto;font-size:8px;font-weight:700;color:${pontosRestantes>0?'#4ade80':'#6b7280'}">${pontosUsados}/${totalCopies} rodadas usadas</span>
                        </div>
                        ${chosenRowsHtml || '<div style="font-size:8px;color:#f87171;margin-bottom:6px">⚠ Nenhuma condição selecionada</div>'}
                        <div style="font-size:7px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:8px 0 4px">
                            ${pontosRestantes>0 ? `Nova condição (${pontosRestantes} rodada${pontosRestantes>1?'s':''} livre${pontosRestantes>1?'s':''}):` : 'Sem rodadas livres — evolua o efeito pra escolher mais'}
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px">${addButtonsHtml}</div>
                    </div>`;
                }

                // eg4: Efeito Alternativo — pn:0, picker de efeito do modo alternativo
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
                            var alertMsg = 'âŒ Requisito não atendido\\n\\n' + rq.reason + '\\n\\nReq: ' + e.req;
                            onclick = 'event.stopPropagation();alert(\'' + alertMsg.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n') + '\')';
                        } else {
                            onclick = 'event.stopPropagation();window._hSetSpecialChoice(\'eg4\',\'' + e.nome.replace(/'/g,"\\'") + '\')';
                        }
                        return '<button onclick="' + onclick + '" style="' + btnStyle + '">'
                            + (active ? '✓ ' : '') + e.nome + (isBlocked ? '🔒' : '') + '</button>';
                    }).join('');
                    const chosenEff4 = chosen ? allEgList.find(function(e){ return e.nome === chosen; }) : null;
                    const chosenPanel4 = chosenEff4
                        ? '<div style="margin-top:6px;background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px">'
                            + '<div style="font-size:8px;font-weight:900;color:'+ color +';margin-bottom:3px">🔀 '+ chosenEff4.nome +'</div>'
                            + '<div style="font-size:8px;color:#9ca3af;line-height:1.5;margin-bottom:4px">'+ chosenEff4.desc +'</div>'
                            + '<div style="font-size:7px;color:#4b5563;font-style:italic">Req: '+ chosenEff4.req +'</div>'
                            + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Selecione o efeito do modo alternativo</div>';
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🔀 Efeito Alternativo — Modo B</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">Selecione o efeito que compõe o modo alternativo do Hatsu:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">'
                        + eg4Buttons
                        + '</div>'
                        + chosenPanel4
                        + '</div>';
                }

                // eg1: Aumento de Alcance — ask if it's alcance or área
                if (item.id === 'eg1') {
                    const chosen = specialChoices['eg1'] || '';
                    const eg1opts = [['Alcance','📐'],['Área','🔵']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📍 Aplicar bônus em:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg1opts.map(function([o,icon]){
                            var active = chosen === o;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg1\',\''+ o +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + icon +' '+ o +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">✓ +1,5m de '+ chosen +'</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha alcance ou área</div>')
                        + '</div>';
                }

                // eg9: Ajuste de Forma (Área) — ask shape
                if (item.id === 'eg9') {
                    const chosen = specialChoices['eg9'] || '';
                    const eg9shapes = [['Cone','📐'],['Linha','➡️'],['Esfera','🔵']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔵 Forma da Área:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg9shapes.map(function([o,icon]){
                            var active = chosen === o;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg9\',\''+ o +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + icon +' '+ o +'</button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">✓ Área em '+ chosen +' de 1,5m</div>' : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha a forma da área</div>')
                        + '</div>';
                }

                // em_e2: Distância Segura (+6m Alcance ou +3m Área) / em_e14: Expansão de Domínio (+3m Alcance ou +6m Área)
                if (item.id === 'em_e2' || item.id === 'em_e14') {
                    const scKey = item.id;
                    const chosen = specialChoices[scKey] || '';
                    const opts = item.id === 'em_e2'
                        ? [['Alcance','📐','+6m · 2 Grau/Passo'],['Área','🔵','+3m · 2 Grau/Passo']]
                        : [['Alcance','📐','+3m à distância · 1 Grau/Passo'],['Área','🔵','+6m em forma · 4 Grau/Passo']];
                    const confirmLabel = item.id === 'em_e2'
                        ? { Alcance: '+6m · 2 Grau/Passo', 'Área': '+3m · 2 Grau/Passo' }
                        : { Alcance: '+3m à distância · 1 Grau/Passo', 'Área': '+6m em forma · 4 Grau/Passo' };
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📐 Aplicar bônus em:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + opts.map(function(op){
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\''+ scKey +'\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + op[1]+' '+op[0]+' <span style="font-size:7px;opacity:.7">('+op[2]+')</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">✓ '+chosen+': '+(confirmLabel[chosen]||'')+'</div>'
                                   : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha onde aplicar</div>')
                        + '</div>';
                }

                // rma_m2: Zetsu Interrompe — ask which benefit
                if (item.id === 'rma_m2') {
                    const chosen = specialChoices['rma_m2'] || '';
                    const opts2 = [['Dano Sanidade','💜','−2 San/rod no alvo'],['Bônus Jogadas','⚡','+2 jogadas a favor']];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ Efeito do Zetsu:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + opts2.map(function(op){
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rma_m2\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:7px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s">'
                                + op[1]+' '+op[0]+' <span style="font-size:7px;opacity:.7;display:block">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:5px">✓ '+chosen+'</div>'
                                   : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha o efeito do Zetsu</div>')
                        + '</div>';
                }

                // eg10: Flagelo da Mente — Puro (2d6 principal) ou Complementar (1d8 adicional)
                if (item.id === 'eg10') {
                    const chosen = specialChoices['eg10'] || '';
                    const eg10opts = [
                        ['Puro','💜','1d10 Psíquico — substitui o dano base do Hatsu'],
                        ['Complementar','➕','1d8 Psíquico — efeito adicional ao dano'],
                    ];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💜 Modo do Flagelo da Mente:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg10opts.map(function(op) {
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg10\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:8px 6px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s;text-align:center">'
                                + op[1]+' <b>'+ op[0] +'</b><br><span style="font-size:7px;opacity:.7">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:6px">✓ '+chosen+'</div>'
                                  : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha o modo do efeito</div>')
                        + '</div>';
                }

                // rm_e2: Golem de Aura — material picker (tamanho fixo: Pequeno)
                if (item.id === 'rm_e2') {
                    const chosenMat = specialChoices['rm_e2'] || '';
                   const MATERIAIS = [
                        { nome:'Tecido/Papel',      ca:11, icon:'📄' },
                        { nome:'Cristal/Vidro',     ca:12, icon:'💎' },
                        { nome:'Madeira/Orgânico',  ca:13, icon:'🌿' },
                        { nome:'Mineral/Pedra',     ca:14, icon:'🪨' },
                        { nome:'Líquido/Gel',       ca:14, icon:'💧' },
                        { nome:'Metal',             ca:15, icon:'⚙️' },
                        { nome:'Gasoso',            ca:'—', icon:'💨' },
                    ];
                    const matSel = MATERIAIS.find(function(m){ return m.nome === chosenMat; });
                    const chosenCaracE2 = specialChoices['rm_e2_carac'] || '';
                    const CARACTS_E2 = window.CARACTERISTICAS_INVOCACAO || [];
                    const caracSelE2 = CARACTS_E2.find(function(c){ return c.nome === chosenCaracE2; });
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💜 Material do Constructo:</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'
                        + MATERIAIS.map(function(m) {
                            var active = chosenMat === m.nome;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rm_e2\',\''+ m.nome +'\')" '
                                + 'style="padding:5px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#d1d5db') +';transition:all .15s">'
                                + m.icon + ' ' + m.nome + ' <span style="opacity:.7;font-size:7px">CA '+ m.ca +'</span></button>';
                        }).join('')
                        + '</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:6px">📍 Tamanho: <strong style="color:#d1d5db">Pequeno</strong> (fixo)</div>'
                        + (chosenMat
                            ? '<div style="background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px;font-size:8px;color:#9ca3af">'
                                + '<span style="color:'+ color +';font-weight:700">✓ Constructo: '+ chosenMat +' Â· Pequeno</span><br>'
                                + 'CA base: '+ (matSel ? matSel.ca : '—') +' + INT &nbsp;|&nbsp; PV = 5 + CON×2'
                              + '</div>'
                            : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Escolha o material</div>')
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">✨ Característica de Invocação (grátis):</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'
                        + CARACTS_E2.map(function(c) {
                            var active = chosenCaracE2 === c.nome;
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'rm_e2_carac\',\''+ c.nome +'\')" '
                                + 'style="padding:4px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#d1d5db') +';transition:all .15s">'
                                + c.icon + ' ' + c.nome + '</button>';
                        }).join('')
                        + '</div>'
                        + (caracSelE2
                            ? '<div style="background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px;font-size:8px;color:#9ca3af">'
                                + '<span style="color:'+ color +';font-weight:700">'+ caracSelE2.icon +' '+ caracSelE2.nome +'</span><br>'
                                + caracSelE2.desc
                              + '</div>'
                            : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Escolha a Característica de Invocação incluída gratuitamente</div>')
                        + '</div>';
                }

                // rm_e3: Características Básicas — picker de 1 Característica de Invocação
                if (item.id === 'rm_e3') {
                    const chosenCarac = specialChoices['rm_e3'] || '';
                    const CARACTS = window.CARACTERISTICAS_INVOCACAO || [];
                    const caracSel = CARACTS.find(function(c){ return c.nome === chosenCarac; });
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✨ Característica de Invocação:</div>'
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
                            : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Escolha uma Característica</div>')
                        + '</div>';
                }

                // eg17: Dor pra Disgrama! — choose between duration reduction or concentration penalty
                if (item.id === 'eg17') {
                    const chosen = specialChoices['eg17'] || '';
                    const eg17opts = [
                        ['Reduz Duração','⏱','−1/3 da duração total'],
                        ['Penalidade TR','🎲','−5 no TR de Concentração'],
                    ];
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ Consequência do Dano Contínuo:</div>'
                        + '<div style="display:flex;gap:6px">'
                        + eg17opts.map(function(op) {
                            var active = chosen === op[0];
                            return '<button onclick="event.stopPropagation();window._hSetSpecialChoice(\'eg17\',\''+ op[0] +'\')" '
                                + 'style="flex:1;padding:8px 6px;border-radius:8px;font-size:8px;font-weight:900;cursor:pointer;border:1.5px solid '+ (active?color:'#1f2937') +';background:'+ (active?color+'22':'transparent') +';color:'+ (active?color:'#9ca3af') +';transition:all .15s;text-align:center">'
                                + op[1]+' <b>'+ op[0] +'</b><br><span style="font-size:7px;opacity:.7">'+ op[2] +'</span></button>';
                        }).join('')
                        + '</div>'
                        + (chosen ? '<div style="font-size:8px;color:'+ color +';margin-top:6px">✓ '+chosen+'</div>'
                                  : '<div style="font-size:8px;color:#f87171;margin-top:4px">⚠ Escolha a consequência</div>')
                        + '</div>';
                }
                // rt_e4: Transmutação Elemental — escolhe até 2 elementos + 1 sub-efeito da progressão
                // (de qualquer um dos elementos escolhidos) por cópia comprada do efeito
                if (item.id === 'rt_e4') {
                    specialHtml = window._hBuildTransmutacaoProgressaoHtml('rt_e4', window.TRANSMUTACAO_DB ? window.TRANSMUTACAO_DB.elemental : [], color, totalCopies, charLevel, hb, '⚡ Escolha o Elemento:');
                }

                // rt_e5: Transmutação Versátil — mesma lógica de rt_e4, mas sobre a lista "versatil"
                if (item.id === 'rt_e5') {
                    specialHtml = window._hBuildTransmutacaoProgressaoHtml('rt_e5', window.TRANSMUTACAO_DB ? window.TRANSMUTACAO_DB.versatil : [], color, totalCopies, charLevel, hb, '🔮 Escolha a Propriedade:');
                }
                // eg6: Poder é Intenção — pn:0, picker de efeito alvo (Gerais + Categoria)
                if (item.id === 'eg6') {
                    const chosen = specialChoices['eg6'] || '';
                    const eg6Gerais = (window.HATSU_DB && window.HATSU_DB.efeitos_gerais) || [];
                    const eg6CatEfs = (catDB && catDB.efeitos) ? catDB.efeitos : [];
                    const allEgList6 = [...eg6Gerais, ...eg6CatEfs];
                    function eg6BtnHtml(e) {
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
                            var alertMsg = '❌ Requisito não atendido\\n\\n' + rq.reason + '\\n\\nReq: ' + e.req;
                            onclick = 'event.stopPropagation();alert(\'' + alertMsg.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n') + '\')';
                        } else {
                            onclick = 'event.stopPropagation();window._hSetSpecialChoice(\'eg6\',\'' + e.nome.replace(/'/g,"\\'") + '\')';
                        }
                        return '<button onclick="' + onclick + '" style="' + btnStyle + '">'
                            + (active ? '✓ ' : '') + e.nome + (isBlocked ? ' 🔒' : '') + '</button>';
                    }
                    const eg6Buttons = '<div style="font-size:7px;font-weight:700;color:#9ca3af;margin:2px 0;text-transform:uppercase;letter-spacing:1px">🌐 Efeitos Gerais</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">'
                        + eg6Gerais.filter(function(e){ return e.id !== 'eg6'; }).map(eg6BtnHtml).join('')
                        + '</div>'
                        + '<div style="font-size:7px;font-weight:700;color:' + color + ';margin:2px 0;text-transform:uppercase;letter-spacing:1px">⚡ Efeitos de Categoria</div>'
                        + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
                        + eg6CatEfs.filter(function(e){ return e.id !== 'eg6'; }).map(eg6BtnHtml).join('')
                        + '</div>';
                    const chosenEff6 = chosen ? allEgList6.find(function(e){ return e.nome === chosen; }) : null;
                    const chosenPanel6 = chosenEff6
                        ? '<div style="margin-top:6px;background:#060d1a;border:1px solid '+ color +'33;border-radius:8px;padding:8px">'
                            + '<div style="font-size:8px;font-weight:900;color:'+ color +';margin-bottom:3px">🎯 '+ chosenEff6.nome +'</div>'
                            + '<div style="font-size:8px;color:#9ca3af;line-height:1.5;margin-bottom:4px">'+ chosenEff6.desc +'</div>'
                            + '<div style="font-size:7px;color:#4b5563;font-style:italic">Req: '+ chosenEff6.req +'</div>'
                            + '</div>'
                        : '<div style="font-size:8px;color:#f87171;margin-top:2px">⚠ Selecione o efeito alvo</div>';
                    specialHtml = '<div style="margin-top:8px;background:#0a0f1a;border:1px solid '+ color +'33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                        + '<div style="font-size:8px;font-weight:900;color:'+ color +';text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🎯 Poder é Intenção</div>'
                        + '<div style="font-size:8px;color:#6b7280;margin-bottom:8px">Selecione o efeito que será direcionado a inimigo(s):</div>'
                        + eg6Buttons
                        + chosenPanel6
                        + '</div>';
                }
            }
            // rm_e5: Aparências Enganam — picker interativo (só quando selecionado)
            if (item.id === 'rm_e5' && sel) {
                var _chosen5 = (hb.specialChoices || {})['rm_e5'] || '';
                var _cLvl = charLevel;
                var _alt = [
                    { id:'ap_partes',  nome:'Aparencia por Partes', lvl:1, icon:'🎭', desc:'Simula ate 3 caracteristicas fisicas (voz, cor, olhos, cabelo, roupas) de uma criatura ou objeto da mesma categoria de tamanho.', extra:'Interacao Sensorial Simples sobre o alvo' },
                    { id:'fn_partes',  nome:'Funções em Partes',    lvl:1, icon:'🦾', desc:'Reproduz partes fisicas extras de uma criatura por suas funções. Ex.: guelras, asas, braco-corda.', extra:'Conhecimento profundo das dimensoes e propriedades do alvo' },
                    { id:'ap_compl',   nome:'Aparencia Completa',   lvl:5, icon:'🪞', desc:'Reproduz completamente a aparencia de uma criatura ou objeto da mesma categoria de tamanho.', extra:'Interacao Sensorial Simples + Conhecimento do Alvo' },
                    { id:'fn_compl',   nome:'Funções Completas',    lvl:5, icon:'🔄', desc:'Reproduz completamente as funções de uma criatura ou objeto. Requer alteracao de categoria de tamanho. Ex.: moto ou aviao.', extra:'Conhecimento profundo com interacoes profundas/constantes ou pontuais importantes' },
                    { id:'ben10',      nome:'Ben 10',               lvl:6, icon:'🧪', desc:'A conjuracao assume os Atributos Fisicos alem das funções, no caso de seres vivos.', extra:'Funções em Partes ou Funções Completas' },
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
                        + (_act ? '<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:' + color + '33;color:' + color + '">✓</span>' : '')
                        + '</div>'
                        + (_act ? '<div style="font-size:7.5px;color:#9ca3af;line-height:1.4;margin-bottom:3px">' + _a.desc + '</div>'
                               + '<div style="font-size:7px;color:#6b7280;font-style:italic">Req. extra: ' + _a.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">🔮 Conjuracao com Alteracoes Fisicas</div>'
                    + '<div style="font-size:7px;color:#6b7280;margin-bottom:8px">+10% de aura por categoria de tamanho acima do usuario</div>'
                    + _altRows
                    + (!_chosen5 ? '<div style="font-size:8px;color:#f87171;margin-top:2px">Escolha uma alteracao para usar</div>' : '')
                    + '</div>';
            }
            // ── re_e17: Oráculo — picker de Previsões e Clarividência ──────────────
            if (item.id === 're_e17' && sel) {
                var _re17c = (hb.specialChoices || {})['re_e17'] || '';
                var _re17lvl = charLevel;
               var _re17opts = [
                    { id:'vidente',   nome:'Vidente (Sharingan)', lvl:0,  icon:'👁️',  desc:'Preveja por milissegundos acoes dos oponentes. +3 em todas as rolagens pela duracao do Hatsu.', extra:'Req: Hatsu com duracao nao Instantanea' },
                    { id:'profeta',   nome:'Profeta',             lvl:4,  icon:'📜',  desc:'Preveja em segredo a proxima acao de um alvo. Com sucesso, o obrigue a seguir essa linha de acao pela duracao. Deve prever 2 acoes por turno.', extra:'Req: Nivel 4' },
                    { id:'cego',      nome:'Cego de Tebas',       lvl:6,  icon:'🔮',  desc:'1x/dia o Mestre concede uma informacao relevante (aliado, alvo, missao, objeto). Minimo 1, maximo = metade do nivel do personagem.', extra:'Req: Nivel 6' },
                    { id:'joia',      nome:'Joia do Tempo',       lvl:8,  icon:'💎',  desc:'Fora de combate, ao se concentrar por 1 rodada, veja possibilidades para superar um desafio (Teste ou TR). Role com vantagem.', extra:'Req: Nivel 8' },
                    { id:'olho',      nome:'Olho de Agamoto',     lvl:10, icon:'🌀',  desc:'Abra a percepcao temporal. Pela duracao, use Reacoes contra qualquer acao (principal, movimento ou bonus) sem limite, mas sofre 1 nivel de exaustao ao usar 3+ por rodada.', extra:'Req: Nivel 10' },
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
                        + '<span style="font-size:8px;font-weight:900;color:' + (_ract ? color : (_rok ? '#d1d5db' : '#374151')) + '">' + (_ract ? '✓ ' : '') + _ro.nome + '</span>'
                        + (_ro.lvl > 0 ? '<span style="margin-left:auto;font-size:7px;font-weight:700;color:' + (_rok ? color : '#4b5563') + ';background:' + (_rok ? color : '#374151') + '18;padding:2px 6px;border-radius:4px">Nivel ' + _ro.lvl + '</span>' : '')
                        + '</div>'
                        + (_ract ? '<div style="font-size:7.5px;color:#9ca3af;margin-top:5px;line-height:1.4">' + _ro.desc + '</div><div style="font-size:7px;color:#6b7280;font-style:italic;margin-top:2px">' + _ro.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔮 Previsoes e Clarividencia</div>'
                    + _re17rows
                    + (!_re17c ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha um efeito</div>' : '')
                    + '</div>';
            }

            // ── re_e16: Controle do Tempo — picker de Fluxo Temporal ou Tempo de Vida ──
            if (item.id === 're_e16' && sel) {
                var _re16c = (hb.specialChoices || {})['re_e16'] || '';
                var _re16lvl = charLevel;
              var _re16flux = [
                    { id:'ft_raven',  nome:'Visoes da Raven',    lvl:0,  icon:'⏳', desc:'Volte ao fim do seu ultimo turno. Eventos continuam os mesmos, mas ha nova chance de superar recebendo-os e refazendo testes.', extra:'Req: Hatsu com duracao Instantanea' },
                    { id:'ft_cronos', nome:'Cronos',             lvl:4,  icon:'⏪', desc:'O beneficio de Visoes da Raven pode ser expandido a um alvo escolhido com toque ou na area do Nen Expandido.', extra:'Req: Nivel 4 + Visoes da Raven' },
                    { id:'ft_senhor', nome:'Senhor do Tempo',    lvl:6,  icon:'⏱', desc:'Rebobine um evento (Golpe/Hatsu/Efeito) que ocorreria na rodada atual e adicione ou subtraia 2d6 ao resultado.', extra:'Req: Nivel 6' },
                    { id:'ft_kairos', nome:'Kairos',             lvl:8,  icon:'🌀', desc:'Volte ao inicio do seu ultimo turno. Aliados com vantagem, inimigos com desvantagem. Usos = proficiencia por dia.', extra:'Req: Nivel 8 + 2 Restricoes Pesadas' },
                    { id:'ft_futuro', nome:'De volta pro Futuro',lvl:10, icon:'⏩', desc:'Remove um alvo do combate ou cena por 3 rodadas (combate) ou 1 minuto (cena).', extra:'Req: Nivel 10' },
                    { id:'ft_tictac', nome:'Tic Tac',            lvl:12, icon:'⌚', desc:'Pause o tempo por 1 rodada (ganha um novo turno). Nao pode interagir com pessoas, mas pode com tudo ao redor. Todos ao redor ficam Atordoados. +1 rodada por Restricao Pesada adicional.', extra:'Req: Nivel 12' },
                ];
                var _re16vida = [
                    { id:'tv_envelhece', nome:'Envelhecimento / Rejuvenescimento', lvl:0, icon:'⌚', desc:'Role 1d10. O resultado x2 e a quantidade em anos que um alvo altera seu tempo de vida pela duracao.', extra:'Req: Controle de Tempo + TR' },
                    { id:'tv_deterio',   nome:'Deteriorar',                        lvl:0, icon:'💀', desc:'Ao falhar em um TR, o alvo tem envelhecida determinada caracteristica fisica, cognitiva ou sensorial.', extra:'Req: Envelhecimento + TR' },
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
                        + '<span style="font-size:8px;font-weight:900;color:' + (_rfact ? color : (_rfok ? '#d1d5db' : '#374151')) + '">' + (_rfact ? '✓ ' : '') + _rf.nome + '</span>'
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
                        + '<span style="font-size:8px;font-weight:900;color:' + (_rvact ? color : '#d1d5db') + '">' + (_rvact ? '✓ ' : '') + _rv.nome + '</span>'
                        + '</div>'
                        + (_rvact ? '<div style="font-size:7.5px;color:#9ca3af;margin-top:5px;line-height:1.4">' + _rv.desc + '</div><div style="font-size:7px;color:#6b7280;font-style:italic;margin-top:2px">' + _rv.extra + '</div>' : '')
                        + '</div>';
                }
                specialHtml += '<div style="margin-top:8px;background:#0a0f1a;border:1px solid ' + color + '33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">'
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">⏱ Fluxo Temporal</div>'
                    + '<div style="font-size:7px;color:#6b7280;margin-bottom:8px">Escolha um efeito para usar neste Hatsu</div>'
                    + _re16rows
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">⌚ Tempo de Vida Longo</div>'
                    + _re16vrows
                    + (!_re16c ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha um efeito</div>' : '')
                    + '</div>';
            }

            // ── re_e2: Combinação Perigosa — picker multi-categoria (até 3 efeitos) ──
            if (item.id === 're_e2' && sel) {
                var _re2sc = hb.specialChoices || {};
                var _re2chosen = Array.isArray(_re2sc['re_e2']) ? _re2sc['re_e2'] : [];
                var _re2lvl = charLevel;
                // Numero de vezes que re_e2 esta em ec determina o maximo de slots
                var _re2count = (hb.ec || []).filter(function(id){ return id === 're_e2'; }).length;
                var _re2max = 3 + (_re2count - 1);
                // Categoria filtrada atual
                var _re2cat = (_re2sc['re_e2_cat'] || '');
                var _re2cats = Object.keys(window.HATSU_DB.categorias || {}).filter(function(c){ return c !== 'ESPECIALIZAÇÃO'; });
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
                        var _r2eLvlM = (_r2e.req || '').match(/N[ií]vel\s*(\d+)/i);
                        var _r2eLvl = _r2eLvlM ? parseInt(_r2eLvlM[1]) : 0;
                        var _r2eOk = _re2lvl >= _r2eLvl;
                        var _r2eMaxed = !_r2eAct && _re2chosen.length >= _re2max;
                        var _r2eDis = !_r2eOk || _r2eMaxed;
                        var _r2eClick = _r2eDis ? '' : 'window._hToggleRe2Effect(\'' + _r2e.id + '\')';
                        _re2effRows += '<div onclick="event.stopPropagation();' + _r2eClick + '" style="border:1px solid ' + (_r2eAct?color:(_r2eDis?'#111827':'#1f2937')) + ';border-radius:7px;padding:6px 8px;margin-bottom:4px;background:' + (_r2eAct?color+'15':'transparent') + ';cursor:' + (_r2eDis?'not-allowed':'pointer') + ';opacity:' + ((_r2eDis&&!_r2eAct)?'0.4':'1') + ';transition:all .15s">'
                            + '<div style="display:flex;align-items:center;gap:5px">'
                            + '<span style="font-size:8px;font-weight:900;color:' + (_r2eAct?color:(_r2eOk?'#d1d5db':'#374151')) + '">' + (_r2eAct ? '✓ ' : '') + _r2e.nome + '</span>'
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
                    + '<div style="font-size:8px;font-weight:900;color:' + color + ';text-transform:uppercase;letter-spacing:1px">⚗ Combinacao Perigosa</div>'
                    + '<span style="margin-left:auto;font-size:8px;font-weight:700;color:' + (_re2chosen.length>=_re2max?'#f87171':color) + '">' + _re2chosen.length + ' / ' + _re2max + '</span>'
                    + '</div>'
                    + (_re2selNames.length ? '<div style="background:#060d1a;border:1px solid ' + color + '33;border-radius:7px;padding:6px 8px;font-size:8px;color:#9ca3af;margin-bottom:8px">'
                        + _re2selNames.map(function(n){ return '<span style="color:' + color + ';font-weight:700">' + n + '</span>'; }).join(' + ')
                        + '</div>' : '')
                    + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' + _re2catButtons + '</div>'
                    + (_re2cat
                        ? (_re2effList.length ? _re2effRows : '<div style="font-size:8px;color:#4b5563">Sem efeitos disponiveis</div>')
                        : '<div style="font-size:8px;color:#6b7280">Escolha uma categoria acima para ver os efeitos</div>')
                    + (!_re2cat && _re2chosen.length === 0 ? '<div style="font-size:8px;color:#f87171;margin-top:4px">Escolha ate ' + _re2max + ' efeitos de até ' + _re2max + ' categorias diferentes</div>' : '')
                    + '</div>';
            }

            const dupControlsHtml = showDupControls ? `
                <div style="display:flex;align-items:center;gap:6px;margin-top:6px" onclick="event.stopPropagation()">
                    <span style="font-size:8px;color:#fbbf24;font-weight:700">Cópias:</span>
                    <button onclick="window._hRemoveDuplicateE('${item.id}','${tipo}')"
                        style="width:22px;height:22px;border-radius:6px;background:#1f2937;border:1px solid #374151;color:#f87171;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">−</button>
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#fbbf24;min-width:16px;text-align:center">${dupCount}</span>
                    <button onclick="${canAddDup ? `window._hAddDuplicateE('${item.id}','${tipo}',${item.pn})` : 'void(0)'}"
                        style="width:22px;height:22px;border-radius:6px;background:${canAddDup?'#fbbf2422':'#1f293755'};border:1px solid ${canAddDup?'#fbbf2455':'#374151'};color:${canAddDup?'#fbbf24':'#4b5563'};font-size:14px;font-weight:900;cursor:${canAddDup?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">+</button>
                    <span style="font-size:8px;color:#6b7280">(${dupCount} × ${item.pn} P.N = ${dupCount * item.pn} P.N${canAddDup?'':' — sem P.N ⚡'})</span>
                </div>` : '';

            // Controles de cópia para efeitos repetíveis (evoluem a cada nível, ex: Aumento de Duração).
            // Linha "Nível atual": compra/desfaz usando o P.N normal do nível corrente (1 por nível).
            // Linha "Extra ⚡": só aparece com Restrição Extrema Pura ativa — compra cópias adicionais
            // além do limite de 1-por-nível, usando o P.N da extrema. As duas linhas somam no mesmo total.
            const canAddRepetivel = showRepetivelBadge && !repetivelNesteNivel && (!item.maxUsos || totalCopies < item.maxUsos) && pnLeft >= item.pn;
            const canRemoveRepetivel = showRepetivelBadge && repetivelNesteNivel;
            const repetivelControlsHtml = showRepetivelBadge ? `
                <div style="margin-top:6px" onclick="event.stopPropagation()">
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="font-size:8px;color:#4ade80;font-weight:700">Nível atual:</span>
                        <button onclick="${canRemoveRepetivel ? `window._hRemoveRepetivelE('${item.id}','${tipo}')` : 'void(0)'}"
                            style="width:22px;height:22px;border-radius:6px;background:${canRemoveRepetivel?'#1f2937':'#1f293755'};border:1px solid ${canRemoveRepetivel?'#374151':'#1f2937'};color:${canRemoveRepetivel?'#f87171':'#4b5563'};font-size:14px;font-weight:900;cursor:${canRemoveRepetivel?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">−</button>
                        <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#4ade80;min-width:16px;text-align:center">${repetivelTracked}</span>
                        <button onclick="${canAddRepetivel ? `window._hAddRepetivelE('${item.id}','${tipo}',${item.pn})` : 'void(0)'}"
                            style="width:22px;height:22px;border-radius:6px;background:${canAddRepetivel?'#22c55e22':'#1f293755'};border:1px solid ${canAddRepetivel?'#22c55e55':'#374151'};color:${canAddRepetivel?'#4ade80':'#4b5563'};font-size:14px;font-weight:900;cursor:${canAddRepetivel?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">+</button>
                        <span style="font-size:8px;color:#6b7280">${repetivelNesteNivel ? 'já evoluído neste nível' : (canAddRepetivel ? `evoluir custa ${item.pn} P.N` : (item.maxUsos && totalCopies >= item.maxUsos ? 'máximo de usos atingido' : 'sem P.N para evoluir'))}</span>
                    </div>
                    ${hasPureExtreme ? `<div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                        <span style="font-size:8px;color:#fbbf24;font-weight:700">Extra ⚡:</span>
                        <button onclick="${dupCount > 0 ? `window._hRemoveDuplicateE('${item.id}','${tipo}')` : 'void(0)'}"
                            style="width:22px;height:22px;border-radius:6px;background:${dupCount>0?'#1f2937':'#1f293755'};border:1px solid ${dupCount>0?'#374151':'#1f2937'};color:${dupCount>0?'#f87171':'#4b5563'};font-size:14px;font-weight:900;cursor:${dupCount>0?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">−</button>
                        <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#fbbf24;min-width:16px;text-align:center">${dupCount}</span>
                        <button onclick="${canAddDup ? `window._hAddDuplicateE('${item.id}','${tipo}',${item.pn})` : 'void(0)'}"
                            style="width:22px;height:22px;border-radius:6px;background:${canAddDup?'#fbbf2422':'#1f293755'};border:1px solid ${canAddDup?'#fbbf2455':'#374151'};color:${canAddDup?'#fbbf24':'#4b5563'};font-size:14px;font-weight:900;cursor:${canAddDup?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1">+</button>
                        <span style="font-size:8px;color:#6b7280">${canAddDup ? `${extremePNLeft} P.N extremo disp.` : 'sem P.N extremo'}</span>
                    </div>` : ''}
                    <div style="font-size:8px;color:#6b7280;margin-top:4px">Total: ${totalCopies}${item.maxUsos ? `/${item.maxUsos}` : ''}</div>
                </div>` : '';

            // Main card onclick: normal toggle unless showing dup/repetível controls (então o clique no card não faz nada)
            const mainClick = blocked
                ? clickAction
                : (showDupControls || showRepetivelBadge)
                    ? 'void(0)'
                    : clickAction;

            return `<div onclick="${mainClick}"
                style="padding:8px 10px;border-radius:10px;border:2px solid ${sel ? color : blocked ? (levelCapBlocked ? '#3b82f633' : '#ef444433') : '#1f2937'};background:${sel ? color+'18' : blocked ? '#0f1117' : '#0f1117'};cursor:${blocked ? 'pointer' : (showDupControls || showRepetivelBadge) ? 'default' : afford ? 'pointer' : 'not-allowed'};opacity:${blocked ? '0.45' : afford ? '1' : '0.3'};margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                    <span style="font-size:9px;font-weight:900;text-transform:uppercase;color:${sel ? color : blocked ? '#6b7280' : '#d1d5db'}">${item.nome}</span>
                    <span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:${costColor}22;color:${costColor}">${item.pn} P.N</span>
                    ${sel ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:${color}33;color:${color}">✓</span>` : ''}
                    ${lockBadge}
                </div>
                <div style="font-size:8px;color:#6b7280;line-height:1.4">${item.desc}</div>
                <div style="font-size:7px;color:${blocked ? (levelCapBlocked ? '#60a5fa77' : '#ef444499') : '#374151'};font-style:italic;margin-top:3px">Req: ${item.req}${blocked && !levelCapBlocked ? ` — <span style="color:#f87171;font-weight:700">${blockReason}</span>` : ''}</div>
                ${dupControlsHtml}
                ${repetivelControlsHtml}
                ${specialHtml}
            </div>`;
        }).join('');
    }

    // ── conteúdo por etapa ──
    let content = '', canNext = false;

    // ETAPA 0 — CONCEITO
    if (hb.step === 0) {
        canNext = hb.nome.trim().length > 0;
        content = `
        <div style="padding:16px;background:${tc}0f;border:2px solid ${tc}44;border-radius:14px;text-align:center;margin-bottom:20px">
            <div style="font-size:24px;margin-bottom:4px">✦</div>
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
            <label style="display:block;font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Descrição narrativa <span style="color:#374151;font-weight:400;text-transform:none">(opcional)</span></label>
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
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Nível</div>
                <div style="font-size:10px;font-weight:900;color:#fff">${char.level}</div>
            </div>
            <div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N Disponíveis</div>
                <div style="font-size:10px;font-weight:900;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:8px;color:#374151"> / ${pnMax}</span></div>
                <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap">
                    <span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#6b728018;color:#9ca3af">Base: ${pnBaseLeft}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#fbbf2418;color:#fbbf24">Puras: ${pnPureNonExtremeLeft}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:4px;background:#f9731618;color:#fb923c">Extr.: ${pnExtremeLeft}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:7px;color:#f87171;margin-top:1px">−${pnSpentOthers} em outros Hatsus</div>`:''}
            </div>
        </div>`;
    }

    // ETAPA 1 — TIPO
    else if (hb.step === 1) {
        canNext = hb.tipoA !== '' && hb.tipoB !== '';
        const tiposA = [
            { id:'hostil',   icon:'⚔️', label:'HOSTIL',   sub:'Dano direto e condições negativas', tip:'Começa com 2d6+Atributo. Focado em ofensa.' },
            { id:'suporte',  icon:'🛡️', label:'SUPORTE',  sub:'Cura, buffs, sem dano direto',      tip:'Sem 2d6 inicial. Curas: 2d6+CON do alvo.' },
            { id:'versatil', icon:'🌀', label:'VERSÁTIL',  sub:'Mescla hostil e suporte',           tip:'Pode causar dano E suportar.' },
        ];
        const tiposB = [
            { id:'instantaneo',   icon:'⚡', label:'INSTANTÂNEO',   sub:'Ativa e termina no mesmo turno', tip:'Investe em dano, alcance ou área.' },
            { id:'longa_duracao', icon:'⏳', label:'LONGA DURAÇÃO',  sub:'Persiste por múltiplas rodadas', tip:'Investe em duração, alcance ou CD.' },
        ];
        content = `
        <div style="text-align:center;margin-bottom:14px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">Tipo de Hatsu</div>
            <div style="font-size:9px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Escolha um de cada grupo</div>
        </div>

        <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">🎯 Grupo 1 — Foco</div>
        ${tiposA.map(t => {
            const sel = hb.tipoA === t.id;
            return `<div onclick="state.hatsuBuilder.tipoA='${t.id}';render()"
                style="padding:11px;border-radius:12px;border:2px solid ${sel?tc:'#1f2937'};background:${sel?tc+'18':'#0f1117'};cursor:pointer;margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px;flex-shrink:0">${t.icon}</span>
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;color:${sel?tc:'#d1d5db'}">${t.label}</span>
                            ${sel?`<span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:20px;background:${tc}33;color:${tc}">✓</span>`:''}
                        </div>
                        <div style="font-size:9px;color:#6b7280;margin-top:2px">${t.sub}</div>
                    </div>
                </div>
                ${sel?`<div style="font-size:9px;color:${tc}cc;margin-top:6px;padding-left:28px;line-height:1.5">${t.tip}</div>`:''}
            </div>`;
        }).join('')}

        <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin:12px 0 8px">⏱ Grupo 2 — Duração</div>
        ${tiposB.map(t => {
            const sel = hb.tipoB === t.id;
            return `<div onclick="state.hatsuBuilder.tipoB='${t.id}';render()"
                style="padding:11px;border-radius:12px;border:2px solid ${sel?tc:'#1f2937'};background:${sel?tc+'18':'#0f1117'};cursor:pointer;margin-bottom:8px;transition:all .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px;flex-shrink:0">${t.icon}</span>
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;color:${sel?tc:'#d1d5db'}">${t.label}</span>
                            ${sel?`<span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:20px;background:${tc}33;color:${tc}">✓</span>`:''}
                        </div>
                        <div style="font-size:9px;color:#6b7280;margin-top:2px">${t.sub}</div>
                    </div>
                </div>
                ${sel?`<div style="font-size:9px;color:${tc}cc;margin-top:6px;padding-left:28px;line-height:1.5">${t.tip}</div>`:''}
            </div>`;
        }).join('')}

        ${hb.tipoA && hb.tipoB ? `<div style="background:${tc}18;border:2px solid ${tc};border-radius:12px;padding:10px;margin-top:4px;text-align:center">
            <div style="font-size:9px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:1px">✓ Combinação: ${hb.tipoA.toUpperCase()} + ${hb.tipoB.toUpperCase()}</div>
        </div>` : `<div style="text-align:center;font-size:9px;color:#4b5563;margin-top:8px">Selecione um item de cada grupo para continuar</div>`}
        `;
    }

    // ETAPA 2 — RESTRIÇÕES (Gerais + Categoria em tabs)
    else if (hb.step === 2) {
        canNext = true;
        if (!hb.restrTab) hb.restrTab = 'gerais';
        var isGerais = hb.restrTab === 'gerais';
        var db = window.HATSU_DB.restricoes_gerais;
        var grupos = [
            { key:'leves',    label:'LEVES',    peso:'leve',    cor:'#4ade80', cb:'#22c55e33' },
            { key:'moderadas',label:'MODERADAS',peso:'moderada',cor:'#fbbf24', cb:'#eab30833' },
            { key:'pesadas',  label:'PESADAS',  peso:'pesada',  cor:'#f87171', cb:'#ef444433' },
            { key:'variaveis',label:'VARIÁVEIS',peso:'variavel',cor:'#c084fc', cb:'#a855f733' },
            { key:'extremas', label:'EXTREMAS', peso:'extrema', cor:'#fb923c', cb:'#f9731633' },
        ];
        var catItems = catDB.restricoes || [];
        var totalRG = hb.rg.length;
        var totalRC = hb.rc.length;

        // rev. Manual 2.0 — indicador de Grau de Potência usado por característica (limite por nível)
        var grauPanelHtml = buildGrauPanelHtml();

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
            + '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#4b5563">🔍</span>'
            + '<input id="hb-filter-input" type="text" value="' + ft2.replace(/"/g,'&quot;') + '" placeholder="Buscar restrição..."'
            + ' onkeydown="if(event.key===\'Enter\'){window._hSetFilterText(this.value);}"'
            + ' oninput="this.style.borderColor=this.value?\'' + tc + '\':\'#1f2937\'"'
            + ' style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ' + (ft2 ? tc : '#1f2937') + ';border-radius:9px;padding:8px 10px 8px 30px;color:#fff;font-size:11px;outline:none;transition:border-color .15s">'
            + '</div>'
            + '<button onclick="window._hSetFilterText(document.getElementById(\'hb-filter-input\').value)"'
            + ' style="padding:8px 14px;border-radius:9px;background:' + tc + ';color:#000;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0;font-family:\'Orbitron\',sans-serif">🔍</button>'
            + (ft2 ? '<button onclick="window._hSetFilterText(\'\');document.getElementById(\'hb-filter-input\').value=\'\';"'
                + ' style="padding:8px 12px;border-radius:9px;background:#1f2937;color:#9ca3af;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">✕</button>' : '')
            + '</div>';

        var bodyHtml = '';
        if (isGerais) {
            bodyHtml += '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:10px;padding:9px;margin-bottom:10px;font-size:9px;color:#6b7280;line-height:1.5">'
                + '💡 <span style="color:#fb923c;font-weight:700">Extremas</span> = acesso +2 níveis. <span style="color:#9ca3af;font-weight:700">Puras</span> = benefício vira P.N.'
                + '<span style="float:right;color:#fff;font-weight:900">' + totalRG + ' selecionadas</span></div>';

            bodyHtml += grupos.map(function(g) {
                var rawItems = (db[g.key]||[]).map(function(i){ return Object.assign({}, i, {peso:g.peso}); });
                // Apply text filter
                var items = ft2 ? rawItems.filter(function(i){ return i.nome.toLowerCase().includes(ft2.toLowerCase()) || (i.desc||'').toLowerCase().includes(ft2.toLowerCase()); }) : rawItems;
                var cnt = rawItems.filter(function(i){ return hb.rg.includes(i.id); }).length;
                if (ft2 && items.length === 0) return ''; // hide empty groups when filtering
                var isOpen = ft2 ? true : ((hb.openAccordions||[]).includes(g.key) || cnt > 0);
                var cntBadge = cnt ? '<span style="font-size:9px;font-weight:900;padding:2px 8px;border-radius:20px;background:' + g.cb + ';color:' + g.cor + '">' + cnt + ' sel.</span>' : '';
                var arrow = isOpen ? '▼' : '▸';
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
                + '<span style="color:' + tc + ';font-weight:700">Attr. Principal:</span> ' + (catDB.attr_princ || '—')
                + ' &nbsp;•&nbsp; <span style="color:#6b7280">Graus:</span> ' + (catDB.graus || '—')
                + '<span style="float:right;color:' + tc + ';font-weight:900">' + totalRC + ' selecionadas</span></div>';

            var filteredCatItems = ft2 ? catItems.filter(function(i){ return i.nome.toLowerCase().includes(ft2.toLowerCase()) || (i.desc||'').toLowerCase().includes(ft2.toLowerCase()); }) : catItems;

            if (catItems.length === 0) {
                bodyHtml += '<div style="text-align:center;color:#374151;font-style:italic;padding:30px 0">Nenhuma restrição específica para ' + cls + '.</div>';
            } else if (filteredCatItems.length === 0) {
                bodyHtml += '<div style="text-align:center;color:#374151;font-style:italic;padding:20px">Nenhuma restrição encontrada.</div>';
            } else {
                bodyHtml += renderR(filteredCatItems, hb.rc, 'rc');
            }
        }

        content = '<div style="text-align:center;margin-bottom:10px">'
            + '<div style="font-family:\'Orbitron\',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">Restrições</div>'
            + '</div>' + grauPanelHtml + tabsHtml + searchBarHtml + bodyHtml;
    }

    // ETAPA 3 — EFEITOS GERAIS
    else if (hb.step === 3) {
        canNext = true;
        content = `
        <div style="text-align:center;margin-bottom:10px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:2px">Efeitos Gerais</div>
            <div style="font-size:9px;color:#6b7280;margin-top:3px">Disponíveis para qualquer categoria</div>
        </div>
        ${buildGrauPanelHtml()}
        <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:9px;margin-bottom:10px">
            <div style="display:flex;align-items:flex-start;gap:7px">
                <span style="font-size:12px;flex-shrink:0">📍</span>
                <div>
                    <div style="font-size:8px;font-weight:700;color:#9ca3af;margin-bottom:4px">P.N restantes podem ser usados nos Princípios de Nen:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:3px">
                        ${['TEN','REN','ZETSU','HATSU','GYO','EN','IN','KEN','KO','RYU'].map(pn => '<span style="font-size:7px;font-weight:700;padding:2px 5px;border-radius:5px;background:#1f2937;color:#6b7280">'+pn+'</span>').join('')}
                    </div>
                    <div style="font-size:7px;color:#374151">Máx. 10 P.N por princípio Â· Hatsus não têm limite</div>
                </div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#0f1117;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:14px">
            <div>
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N Disponíveis</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:12px;color:#374151;font-weight:400"> / ${pnMax}</span></div>
                <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">
                    <span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#1f2937;color:#9ca3af" title="Pode ser guardado para outro hatsu">Base <span style="color:#fff">${pnBaseLeft}</span>/${pnBaseAvail}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#fbbf2418;color:#fbbf24" title="Deve ser gasto aqui">Puras <span style="color:#fff">${pnPureNonExtremeLeft}</span>/${pnFromPureNonExtreme}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#f9731618;color:#fb923c" title="Deve ser gasto aqui">Extr. <span style="color:#fff">${pnExtremeLeft}</span>/${pnFromExtreme}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:8px;color:#f87171;font-weight:700;margin-top:1px">−${pnSpentOthers} em outros Hatsus</div>`:''}
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

        // Conta restrições extremas selecionadas (bônus de 2 níveis cada)
        const allRDB_flat = [
            ...(window.HATSU_DB.restricoes_gerais.extremas||[]),
            ...(catDB.restricoes||[]).filter(r => r.peso === 'extrema')
        ];
        const extremeCount = [...hb.rg, ...hb.rc].filter(id => allRDB_flat.some(r => r.id === id)).length;
        const effectiveLevel = Math.min(12, charLevel + extremeCount * 2);
        const access = window.calcCategoryAccess(charLevel, extremeCount);

        // Todas as categorias disponíveis no HATSU_DB
        const ALL_CATS = ['INTENSIFICAÇÃO','TRANSMUTAÇÃO','MATERIALIZAÇÃO','MANIPULAÇÃO','EMISSÃO','ESPECIALIZAÇÃO'];
        const CAT_COLORS = {
            'INTENSIFICAÇÃO':'#00ff9d','TRANSMUTAÇÃO':'#d946ef','MATERIALIZAÇÃO':'#ff0055',
            'MANIPULAÇÃO':'#9ca3af','EMISSÃO':'#ffe600','ESPECIALIZAÇÃO':'#00f0ff'
        };
        const affinityMap = window.CATEGORY_AFFINITY[cls] || {};
        const pctLabel = { 80:'80%', 60:'60%', 40:'40%', 1:'1%' };

        // Info card — tabela de acesso atual
        const accessRows = [
            { pct: '100%', max: access.pct100, color: '#4ade80' },
            { pct: '80%',  max: access.pct80,  color: '#60a5fa' },
            { pct: '60%',  max: access.pct60,  color: '#fbbf24' },
            { pct: '40%',  max: access.pct40,  color: '#f87171' },
        ].filter(r => r.max > 0);

        const accessInfoHtml = `
        <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px">🌐 Acesso a Categorias</div>
                <div style="font-size:8px;color:#4b5563">Nível ${charLevel}${extremeCount>0?` + ${extremeCount*2} (ext.)`:''} = Efetivo ${effectiveLevel}</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
                ${accessRows.map(r => `<span style="font-size:8px;font-weight:700;padding:3px 8px;border-radius:6px;background:${r.color}18;color:${r.color};border:1px solid ${r.color}33">${r.pct} → até Nível ${r.max}</span>`).join('')}
                ${extremeCount>0?`<span style="font-size:8px;font-weight:700;padding:3px 8px;border-radius:6px;background:#f9731618;color:#fb923c;border:1px solid #f9731633">⚡ +${extremeCount} Extrema${extremeCount>1?'s':''}</span>`:''}
            </div>
        </div>`;

        // Gera seções de outras categorias acessíveis
        let otherCatSections = '';

        // Salva a classe atual para checkEspecializacaoAccess
        window._currentBuilderClass = cls;

        for (const otherCls of ALL_CATS) {
            if (otherCls === cls) continue;

            // Especialização: tratamento especial para Manipulação e Materialização
            if (otherCls === 'ESPECIALIZAÇÃO') {
                if (cls !== 'MANIPULAÇÃO' && cls !== 'MATERIALIZAÇÃO') continue; // outras categorias: sem acesso
                const espCheck = window.checkEspecializacaoAccess(hb);
                const espDB = window.HATSU_DB.categorias['ESPECIALIZAÇÃO'];
                const espColor = '#a78bfa';
                const openKey = 'xcat_ESPECIALIZAÇÃO';
                const isOpen = (hb.openAccordions||[]).includes(openKey);

                if (espCheck.ok) {
                    // Acesso liberado — mostra efeitos até nível 3
                    otherCatSections += `
                    <div style="margin-bottom:10px">
                        <div onclick="window._hToggleAccordion('${openKey}')"
                            style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:2px solid ${espColor}44;border-radius:${isOpen?'12px 12px 0 0':'12px'};padding:10px 12px;cursor:pointer;user-select:none">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${espColor}">ESPECIALIZAÇÃO</span>
                                <span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:${espColor}22;color:${espColor}">1% — desbloqueado ✓</span>
                                <span style="font-size:7px;font-weight:700;color:#6b7280">até Nível 3</span>
                            </div>
                            <span style="color:#4b5563;font-size:12px">${isOpen?'▲':'▼'}</span>
                        </div>
                        ${isOpen ? `<div style="background:#0a0f1a;border:2px solid ${espColor}44;border-top:none;border-radius:0 0 12px 12px;padding:10px">
                            ${renderE((espDB&&espDB.efeitos)||[], hb.ec, 'ec', espColor, 3)}
                        </div>` : ''}
                    </div>`;
                } else {
                    // Bloqueado — mostra card com regra e progresso
                    const { specEfeitos, totalRestr, needed, counts, pyramidOk, pyramidMsg } = espCheck;
                    const progressPct = Math.min(100, Math.round((totalRestr/needed)*100));
                    otherCatSections += `
                    <div style="margin-bottom:10px">
                        <div onclick="window._showEspRule()"
                            style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:2px solid ${espColor}33;border-radius:12px;padding:10px 12px;cursor:pointer;user-select:none;opacity:0.75">
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${espColor}">ESPECIALIZAÇÃO</span>
                                <span style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:#ef444422;color:#f87171">🔒 1% — bloqueado</span>
                            </div>
                            <span style="font-size:8px;color:${espColor};font-weight:700">${totalRestr}/${needed} restr. â„¹️</span>
                        </div>
                        <div style="background:#0a0f1a;border:2px solid ${espColor}22;border-top:none;border-radius:0 0 12px 12px;padding:10px 12px">
                            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                                <span style="font-size:8px;color:#6b7280">Restrições necessárias</span>
                                <span style="font-size:8px;font-weight:700;color:${totalRestr>=needed?'#4ade80':'#f87171'}">${totalRestr} / ${needed}</span>
                            </div>
                            <div style="background:#1f2937;border-radius:99px;height:6px;overflow:hidden;margin-bottom:8px">
                                <div style="height:100%;width:${progressPct}%;background:${totalRestr>=needed?'#4ade80':espColor};border-radius:99px;transition:width .3s"></div>
                            </div>
                            ${!pyramidOk ? `<div style="font-size:8px;color:#f87171;margin-bottom:6px">⚠️ Pirâmide inválida: ${pyramidMsg}</div>` : ''}
                            <div style="display:flex;gap:6px;flex-wrap:wrap">
                                ${['leve','moderada','pesada','extrema'].map(p => `<span style="font-size:7px;padding:2px 6px;border-radius:4px;background:#1f2937;color:#9ca3af">${p[0].toUpperCase()+p.slice(1)}: ${counts[p]||0}</span>`).join('')}
                            </div>
                            <button onclick="window._showEspRule()" style="margin-top:8px;width:100%;padding:6px;border-radius:8px;background:${espColor}18;border:1px solid ${espColor}44;color:${espColor};font-size:9px;font-weight:900;text-transform:uppercase;cursor:pointer;letter-spacing:1px">â„¹️ Ver Regra Completa</button>
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
                        <span style="font-size:7px;font-weight:700;color:#6b7280">até Nível ${maxLvl}</span>
                    </div>
                    <span style="color:#4b5563;font-size:12px">${isOpen?'▲':'▼'}</span>
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
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">P.N Disponíveis</div>
                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:24px;color:${pnLeft<=0?'#f87171':'#fff'}">${pnLeft}<span style="font-size:12px;color:#374151;font-weight:400"> / ${pnMax}</span></div>
                <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">
                    <span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#1f2937;color:#9ca3af" title="Pode ser guardado para outro hatsu">Base <span style="color:#fff">${pnBaseLeft}</span>/${pnBaseAvail}</span>
                    ${pnFromPureNonExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#fbbf2418;color:#fbbf24" title="Deve ser gasto aqui">Puras <span style="color:#fff">${pnPureNonExtremeLeft}</span>/${pnFromPureNonExtreme}</span>`:''}
                    ${pnFromExtreme>0?`<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:#f9731618;color:#fb923c" title="Deve ser gasto aqui">Extr. <span style="color:#fff">${pnExtremeLeft}</span>/${pnFromExtreme}</span>`:''}
                </div>
                ${pnSpentOthers>0?`<div style="font-size:8px;color:#f87171;font-weight:700;margin-top:1px">−${pnSpentOthers} em outros Hatsus</div>`:''}
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Attr. Principal</div>
                ${cls === 'MANIPULAÇÃO' ? (() => {
                    const hasCSO = hb.ec.includes('ma_e1');
                    const hasCSC = hb.ec.includes('ma_e2');
                    const activeAttr = (hasCSO && !hasCSC) ? 'INT' : 'PRE';
                    const inactiveAttr = activeAttr === 'INT' ? 'PRE' : 'INT';
                    const activeLabel = activeAttr === 'INT' ? 'INT — Objetos' : 'PRE — Pessoas';
                    const inactiveLabel = inactiveAttr === 'INT' ? 'INT — Objetos' : 'PRE — Pessoas';
                    return `<div style="font-size:12px;font-weight:900;color:${tc}">${activeLabel}</div>
                            <div style="font-size:9px;color:#4b5563;margin-top:2px">${inactiveLabel} (outro modo)</div>`;
                })() : `<div style="font-size:13px;font-weight:900;color:${tc}">${catDB.attr_princ}</div>`}
                <div style="font-size:9px;color:#4b5563">${catDB.attr_sec}</div>
            </div>
        </div>
        ${buildGrauPanelHtml()}
        ${accessInfoHtml}
        ${buildFilterBar(true, tc)}
        <!-- Efeitos da categoria principal -->
        <div style="font-size:9px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⚡ ${cls} — 100%</div>
        ${renderE(catDB.efeitos, hb.ec, 'ec', tc)}
        <!-- Efeitos de outras categorias acessíveis -->
        ${otherCatSections ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #1f2937">
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">🌐 Outras Categorias (por Afinidade)</div>
            ${otherCatSections}
        </div>` : ''}`;
    }

    // ETAPA 5 — RESUMO
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
        const _tipoIconsMap = { hostil:'⚔️', suporte:'🛡️', versatil:'🌀', instantaneo:'⚡', longa_duracao:'⏳' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'✦').join(''); } });
        const _tipoLabels = { hostil:'Hostil', suporte:'Suporte', versatil:'Versátil', instantaneo:'Instantâneo', longa_duracao:'Longa Duração' };
    const tipoNames = new Proxy(_tipoLabels, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||p).join(' + '); } });

        content = `
        ${pnBonusLeft > 0 ? `<div style="background:#7f1d1d22;border:2px solid #ef4444;border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
            <span style="font-size:18px;flex-shrink:0">⚠️</span>
            <div>
                <div style="font-size:10px;font-weight:900;color:#f87171;text-transform:uppercase;letter-spacing:1px">P.N de restrições não gastos: ${pnBonusLeft}</div>
                <div style="font-size:8px;color:#9ca3af;margin-top:3px">P.N de restrições puras e extremas não podem ser guardados. Volte e gaste ${pnBonusLeft} P.N de restrição antes de finalizar${pnBaseLeft > 0 ? ` (${pnBaseLeft} P.N de nível podem ser guardados para outro hatsu)` : ''}.</div>
            </div>
        </div>` : ''}
        <!-- Cabeçalho do Hatsu -->
        <div style="text-align:center;padding:20px;border-radius:16px;border:2px solid ${tc};background:${tc}0a;margin-bottom:16px">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;letter-spacing:3px;color:${tc};text-transform:uppercase">${hb.nome||'SEM NOME'}</div>
            <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-top:4px">${cls}</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px">
                <span style="font-size:14px">${tipoIcons[hb.tipo]||'✦'}</span>
                <span style="font-size:10px;font-weight:700;color:#d1d5db">${tipoNames[hb.tipo]||'—'}</span>
                <span style="color:#374151">•</span>
                <span style="font-size:10px;color:#6b7280">Nível ${char.level}</span>
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
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700;margin-bottom:4px">Restrições</div>
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
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700">Tempo de Ativação</div>
                <div style="font-size:10px;color:#d1d5db;font-weight:700;margin-top:2px">Ação Principal</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#4b5563;text-transform:uppercase;font-weight:700">Custo de Aura Base</div>
                ${(() => { const cc = window.calcAuraCost ? window.calcAuraCost(hb) : {pct:50,label:'50% de Aura'}; const reduced = cc.pct < 50; return `<div style="font-size:10px;color:${reduced?'#4ade80':'#d1d5db'};font-weight:700;margin-top:2px">${cc.label}${reduced?` <span style="font-size:8px;color:#4b5563">(reduzido)</span>`:''}</div>`; })()}
            </div>
        </div>
        <!-- Restrições -->
        ${allR.length ? `<div style="margin-bottom:16px">
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⛓ Restrições (${allR.length})</div>
            ${allR.map(r=>`<div style="display:flex;align-items:flex-start;gap:8px;background:#0f1117;border-radius:8px;padding:8px;border:1px solid #1f2937;margin-bottom:6px">
                <span style="color:#ef4444;font-size:11px;flex-shrink:0;margin-top:1px">⛓</span>
                <div>
                    <div style="font-size:9px;font-weight:700;color:#d1d5db">${r.nome} <span style="font-size:7px;color:#4b5563">(${r.peso||'geral'})</span></div>
                    <div style="font-size:8px;color:#6b7280;font-style:italic;margin-top:2px">${r.bnf||r.desc}</div>
                </div>
            </div>`).join('')}
        </div>` : ''}
        <!-- Efeitos -->
        ${allE.length ? `<div>
            <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⚡ Efeitos (${allE.length})</div>
            ${allE.map(e=>`<div style="display:flex;align-items:flex-start;gap:8px;background:#0f1117;border-radius:8px;padding:8px;border:2px solid ${tc}22;margin-bottom:6px">
                <span style="color:${tc};font-size:11px;flex-shrink:0;margin-top:1px">⚡</span>
                <div>
                    <div style="font-size:9px;font-weight:700;color:${tc}">${e.nome} <span style="font-size:8px;color:#4b5563;font-weight:400">(${e.pn} P.N)</span></div>
                    <div style="font-size:8px;color:#6b7280;margin-top:2px;line-height:1.4">${e.desc}</div>
                </div>
            </div>`).join('')}
        </div>` : ''}`;
    }

    // ── botões de nav ──
    const isLast = hb.step === STEPS.length - 1;
    const btnNext = `<button id="hatsu-next-btn" onclick="window._hNext()"
        style="${canNext?`background:${tc};color:#000;box-shadow:0 0 18px ${tc}66`:'background:#1f2937;color:#4b5563;opacity:0.55'};flex:1;padding:14px;border-radius:12px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;transition:all .15s">
        ${isLast ? '⚔️ FINALIZAR HATSU' : 'PRÓXIMO →'}
    </button>`;
    const btnPrev = hb.step > 0
        ? `<button onclick="window._hPrev()" style="padding:14px 18px;border-radius:12px;background:#111827;color:#9ca3af;border:1px solid #374151;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">← VOLTAR</button>`
        : '';

    // ── render final ──
    container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;background:#030712;color:#d1d5db;font-family:'Rajdhani',sans-serif">
        <!-- HEADER -->
        <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            <button onclick="closeHatsuCreator()"
                style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#111827;border:1px solid #1f2937;cursor:pointer;color:#6b7280;font-size:14px">✕</button>
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
        <!-- CONTEÚDO -->
        <div style="flex:1;overflow-y:auto;padding:16px" class="custom-scrollbar hatsu-creator-scroll">${content}</div>
        <!-- RODAPÉ -->
        <div style="display:flex;gap:10px;padding:14px;border-top:1px solid #111827;background:#0a0f1a;flex-shrink:0">
            ${btnPrev}${btnNext}
        </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
}

// ── Handlers globais do Hatsu Creator ──
window._hUpdateNome = function(val, tc, el) {
    if (!state.hatsuBuilder) return;
    state.hatsuBuilder.nome = val;
    if (el) el.style.borderColor = val.trim() ? tc : '#1f2937';
    // Atualiza visual do botão sem re-renderizar toda a tela
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
    // Validação por etapa
    if (hb.step === 0 && !hb.nome.trim()) {
        const input = document.getElementById('hatsu-nome-input');
        if (input) { input.focus(); input.style.borderColor = '#ef4444'; }
        return;
    }
    if (hb.step === 1 && (!hb.tipoA || !hb.tipoB)) {
        return; // usuário precisa selecionar um tipo de cada grupo
    }
    if (hb.step === 5) {
        // Bloqueia se há P.N não gastos — P.N não podem ser guardados para outro nível
        const _char5 = state.currentChar;
        const _pnBase5 = window.calcularPHBase(_char5.level);
        const _pnBonus5 = window.calcPNBonusFromRestr(hb);
        const _pnSpentOth5 = window.calcPNSpentInOtherHatsus(_char5, hb.editingIdx);
        const _pnDom5 = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(_char5) : 0;
        const _pnBaseAvail5 = Math.max(0, _pnBase5 - _pnSpentOth5 - _pnDom5);
        let _pnUsed5 = 0;
        hb.eg.forEach(id => { const e = window.HATSU_DB.efeitos_gerais.find(x=>x.id===id); if(e) _pnUsed5+=e.pn; });
        hb.ec.forEach(id => { for (const cat of Object.values(window.HATSU_DB.categorias||{})) { if (!cat||!cat.efeitos) continue; const e=cat.efeitos.find(x=>x.id===id); if(e){_pnUsed5+=e.pn;break;} } });
        // Breakdown por tipo: restrições devem ser gastas, base pode ser guardada
        const _pnFromExtreme5 = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
        const _pnFromPureNonExtreme5 = Math.max(0, _pnBonus5 - _pnFromExtreme5);
        const _usedFromExtreme5 = Math.min(_pnUsed5, _pnFromExtreme5);
        const _usedFromPureNonExtreme5 = Math.min(Math.max(0, _pnUsed5 - _pnFromExtreme5), _pnFromPureNonExtreme5);
        const _pnExtremeLeft5 = _pnFromExtreme5 - _usedFromExtreme5;
        const _pnPureNonExtremeLeft5 = _pnFromPureNonExtreme5 - _usedFromPureNonExtreme5;
        const _pnBonusLeft5 = _pnExtremeLeft5 + _pnPureNonExtremeLeft5;
        if (_pnBonusLeft5 > 0) return; // P.N de restrições devem ser todos gastos antes de finalizar

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
            juramentoImutavelNivelBase: hb.juramentoImutavelNivelBase != null ? hb.juramentoImutavelNivelBase : null,
            efeitos: [...hb.eg, ...hb.ec],
            efeitoNiveis: {...(hb.efeitoNiveis||{})},
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

        // Primeiro Hatsu — distribuição de 5 Graus de Potência
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
        const container = document.querySelector('.hatsu-scroll-area') || app;
        const scrollTop = container ? container.scrollTop : 0;
        renderHatsuDetail(app);
        if (scrollTop > 0) {
            requestAnimationFrame(() => {
                const c = document.querySelector('.hatsu-scroll-area') || app;
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
    const item = _hFindEfeitoDB(id);
    // Efeitos repetíveis: nunca remove cópias já rastreadas em hb.efeitoNiveis (compradas com
    // P.N normal por nível) — só cópias "extra" além dessas (compradas via extrema pura).
    if (window.isEfeitoRepetivel(item)) {
        const tracked = ((hb.efeitoNiveis||{})[id] || []).length;
        const total = arr.filter(x => x === id).length;
        if (total <= tracked) return; // não há cópia extra pra remover
    }
    // Remove last occurrence of id
    const lastIdx = arr.lastIndexOf(id);
    if (lastIdx === -1) return;
    arr.splice(lastIdx, 1);
    _hClampSpecialArray(hb, id, tipo);
    renderHatsuInPlace();
};

window._hAddDuplicateE = function(id, tipo, pn) {
    const hb = state.hatsuBuilder; if (!hb) return;
    // Apenas restrições EXTREMAS puras permitem comprar o mesmo efeito mais de uma vez
    const _extremePN = window.calcPNFromExtremeRestr ? window.calcPNFromExtremeRestr(hb) : 0;
    const _dupUsed = window.calcDuplicatePNUsed ? window.calcDuplicatePNUsed(hb) : 0;
    if (_extremePN <= 0 || _extremePN - _dupUsed < pn) return;
    const _itemForCap = _hFindEfeitoDB(id);
    if (_itemForCap && _itemForCap.maxUsos) {
        const _arrForCap = tipo === 'eg' ? hb.eg : hb.ec;
        if (_arrForCap.filter(x => x === id).length >= _itemForCap.maxUsos) return;
    }
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
    // Guarda final: efeitos de ESPECIALIZAÇÃO só para ESPECIALIZAÇÃO, MANIPULAÇÃO e MATERIALIZAÇÃO
    if (tipo === 'ec') {
        const _espCatDB2 = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÇÃO'];
        const _espEfIds2 = new Set((_espCatDB2 && _espCatDB2.efeitos || []).map(e => e.id));
        if (_espEfIds2.has(id)) {
            const _charCls2 = state.currentChar && state.currentChar.class;
            if (_charCls2 !== 'ESPECIALIZAÇÃO' && _charCls2 !== 'MANIPULAÇÃO' && _charCls2 !== 'MATERIALIZAÇÃO') return;
        }
    }
    const _beforeDup = window._hSnapshotGrauTotals(hb);
    arr.push(id);
    // rev.: não bloqueia mais a cópia extra — apenas avisa se isso ultrapassar o limite de Grau de
    // Potência do nível. O excedente simplesmente não conta na mecânica até o teto subir de nível.
    window._hCheckGrauLimiteENotify(hb, _beforeDup);
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
    const _beforeSC = window._hSnapshotGrauTotals(hb);
    hb.specialChoices[id] = val;
    // rev.: não bloqueia mais — apenas avisa se ultrapassar o limite de Grau de Potência do nível
    // (afeta principalmente eg1/eg9, que aplicam bônus em Alcance/Área)
    window._hCheckGrauLimiteENotify(hb, _beforeSC);
    renderHatsuInPlace();
};
window._hSetSpecialText = function(id, val) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    hb.specialChoices[id] = val;
    // Don't re-render on every keystroke — just store
};

// eg3 (Condição Perigosa): cada cópia comprada do efeito é 1 "ponto" — usado pra uma condição
// nova (1ª rodada) ou +1 rodada numa condição já escolhida. hb.specialChoices['eg3'] guarda a
// lista flat de condições, na ordem em que os pontos foram gastos.
window._hEg3AddPonto = function(condicao) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    let arr = hb.specialChoices['eg3'];
    if (!Array.isArray(arr)) arr = arr ? [arr] : [];
    const totalCopiasEg3 = (hb.eg||[]).filter(x => x === 'eg3').length;
    if (arr.length >= totalCopiasEg3) return; // sem rodadas livres pra gastar
    arr.push(condicao);
    hb.specialChoices['eg3'] = arr;
    renderHatsuInPlace();
};
window._hEg3RemovePonto = function(condicao) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    let arr = hb.specialChoices['eg3'];
    if (!Array.isArray(arr)) arr = arr ? [arr] : [];
    const idx = arr.lastIndexOf(condicao);
    if (idx === -1) return;
    arr.splice(idx, 1);
    hb.specialChoices['eg3'] = arr;
    renderHatsuInPlace();
};

// rt_e4/rt_e5: escolhe até TRANSMUTACAO_MAX_ELEMENTOS elementos/propriedades (gratuito) + 1
// sub-efeito da progressão (de qualquer elemento escolhido) por cópia comprada do efeito.
// hb.specialChoices[itemId+'_elementos'] guarda os elementos escolhidos (array, máx. 2);
// hb.specialChoices[itemId] guarda a lista flat de escolhas {elemento, nome}, 1 por cópia.
const TRANSMUTACAO_MAX_ELEMENTOS = 2;

// Lê os elementos/propriedades escolhidos para rt_e4/rt_e5, migrando formatos antigos:
// - specialChoices[itemId+'_elemento'] (string única, versão anterior) → elementos: [essa string]
// - specialChoices[itemId] como array de strings simples (nome do sub-efeito, sem saber o elemento)
//   → assume que pertencem ao 1º (e único, na época) elemento escolhido
function _hGetTransmutacaoElementos(hb, itemId) {
    const specialChoices = hb.specialChoices || {};
    const elementosKey = itemId + '_elementos';
    let elementos = specialChoices[elementosKey];
    if (!Array.isArray(elementos)) {
        const legacyElemento = specialChoices[itemId + '_elemento'];
        elementos = legacyElemento ? [legacyElemento] : [];
        specialChoices[elementosKey] = elementos;
    }
    let escolhas = specialChoices[itemId];
    if (!Array.isArray(escolhas)) escolhas = [];
    // Migra escolhas antigas (strings simples) para o formato {elemento, nome}
    escolhas = escolhas.map(e => {
        if (typeof e === 'string') return { elemento: elementos[0] || '', nome: e };
        return e;
    });
    specialChoices[itemId] = escolhas;
    return { elementos, escolhas };
}

function _hBuildTransmutacaoProgressaoHtml(itemId, dbList, color, totalCopies, charLevel, hb, tituloElemento) {
    if (!hb.specialChoices) hb.specialChoices = {};
    const { elementos, escolhas } = _hGetTransmutacaoElementos(hb, itemId);
    const pontosUsados = escolhas.length;
    const pontosRestantes = Math.max(0, totalCopies - pontosUsados);

    const elementButtons = dbList.map(o => {
        const active = elementos.includes(o.id);
        const cheio = !active && elementos.length >= TRANSMUTACAO_MAX_ELEMENTOS;
        return `<button onclick="event.stopPropagation();${cheio ? 'void(0)' : `window._hToggleTransmutacaoElemento('${itemId}','${o.id}')`}"
            style="padding:5px 8px;border-radius:7px;font-size:8px;font-weight:900;cursor:${cheio ? 'not-allowed' : 'pointer'};opacity:${cheio ? 0.4 : 1};border:1.5px solid ${active?o.cor:color+'33'};background:${active?o.cor+'22':'transparent'};color:${active?o.cor:'#9ca3af'};transition:all .15s">
            ${o.icon} ${o.nome}</button>`;
    }).join('');

    const blocosHtml = elementos.map(elId => {
        const sel = dbList.find(o => o.id === elId);
        if (!sel) return '';
        const escolhidos = sel.progressao.filter(p => escolhas.some(e => e.elemento === elId && e.nome === p.nome));
        const disponiveis = sel.progressao.filter(p => !escolhas.some(e => e.elemento === elId && e.nome === p.nome));

        const escolhidosHtml = escolhidos.map(p => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;padding:6px 8px;background:${sel.cor}18;border-radius:7px">
            <div style="flex:1"><span style="font-size:8px;font-weight:900;color:${sel.cor}">Nv${p.nivel} · ${p.nome}</span>
            <div style="font-size:7px;color:#9ca3af">${p.desc}</div></div>
            <button onclick="event.stopPropagation();window._hRemoveTransmutacaoEscolha('${itemId}','${elId}','${p.nome.replace(/'/g,"\\'")}')"
                style="width:20px;height:20px;border-radius:5px;background:#1f2937;border:1px solid #374151;color:#f87171;font-size:12px;font-weight:900;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;line-height:1">×</button>
        </div>`).join('');

        const disponiveisHtml = disponiveis.map(p => {
            const bloqueado = charLevel < p.nivel;
            const canPick = !bloqueado && pontosRestantes > 0;
            const onclick = bloqueado
                ? `event.stopPropagation();alert('❌ Requisito não atendido\\n\\nNível ${p.nivel} (você está no Nível ${charLevel})')`
                : (canPick ? `event.stopPropagation();window._hAddTransmutacaoEscolha('${itemId}','${elId}','${p.nome.replace(/'/g,"\\'")}')` : 'event.stopPropagation()');
            return `<div onclick="${onclick}" style="display:flex;align-items:center;gap:6px;margin-bottom:5px;padding:6px 8px;background:#0f1117;border:1px solid ${bloqueado?'#ef444433':'#1f2937'};border-radius:7px;cursor:${bloqueado?'pointer':(canPick?'pointer':'not-allowed')};opacity:${bloqueado?0.5:(canPick?1:0.4)}">
                <div style="flex:1"><span style="font-size:8px;font-weight:900;color:${bloqueado?'#f87171':'#d1d5db'}">Nv${p.nivel} · ${p.nome}</span>
                <div style="font-size:7px;color:#6b7280">${p.desc}</div></div>
                ${bloqueado ? `<span style="font-size:7px;font-weight:900;padding:1px 5px;border-radius:4px;background:#ef444422;color:#f87171;flex-shrink:0">❌ REQ</span>` : ''}
            </div>`;
        }).join('');

        return `<div style="background:#060d1a;border:1px solid ${sel.cor}44;border-radius:8px;padding:10px;margin-bottom:8px">
            <div style="font-size:9px;font-weight:900;color:${sel.cor};margin-bottom:4px">${sel.icon} ${sel.nome}</div>
            <div style="font-size:8px;color:#9ca3af;margin-bottom:8px">${sel.efeito}</div>
            ${escolhidosHtml || '<div style="font-size:8px;color:#f87171;margin-bottom:6px">⚠ Nenhum sub-efeito escolhido ainda</div>'}
            <div style="font-size:7px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:8px 0 4px">
                ${pontosRestantes>0 ? 'Escolha um sub-efeito disponível:' : 'Sem vagas — compre o efeito de novo em outro nível'}
            </div>
            ${disponiveisHtml}
        </div>`;
    }).join('');

    return `<div style="margin-top:8px;background:#0a0f1a;border:1px solid ${color}33;border-radius:10px;padding:10px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <div style="font-size:8px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:1px">${tituloElemento}</div>
            <span style="margin-left:auto;font-size:8px;font-weight:700;color:#6b7280">${elementos.length}/${TRANSMUTACAO_MAX_ELEMENTOS} elementos</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${elementButtons}</div>
        ${elementos.length === 0 ? '<div style="font-size:8px;color:#f87171">⚠ Escolha uma opção para continuar</div>' : ''}
        ${blocosHtml}
        ${elementos.length > 0 ? `<div style="font-size:8px;color:#6b7280;text-align:right">Sub-efeitos: ${pontosUsados}/${totalCopies}</div>` : ''}
    </div>`;
}
window._hBuildTransmutacaoProgressaoHtml = _hBuildTransmutacaoProgressaoHtml;

window._hToggleTransmutacaoElemento = function(itemId, elementoId) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    const { elementos, escolhas } = _hGetTransmutacaoElementos(hb, itemId);
    const idx = elementos.indexOf(elementoId);
    if (idx > -1) {
        // Desmarcar remove o elemento E todas as escolhas de sub-efeito feitas nele
        elementos.splice(idx, 1);
        hb.specialChoices[itemId] = escolhas.filter(e => e.elemento !== elementoId);
    } else {
        if (elementos.length >= TRANSMUTACAO_MAX_ELEMENTOS) return;
        elementos.push(elementoId);
        if (elementos.length === TRANSMUTACAO_MAX_ELEMENTOS && window._showXpToast) {
            window._showXpToast(`⚡ Seu Hatsu agora possui ${TRANSMUTACAO_MAX_ELEMENTOS} elementos. Esse é o limite máximo de transmutação.`);
        }
    }
    hb.specialChoices[itemId + '_elementos'] = elementos;
    renderHatsuInPlace();
};
window._hAddTransmutacaoEscolha = function(itemId, elementoId, nome) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    const { escolhas } = _hGetTransmutacaoElementos(hb, itemId);
    const tipo = itemId.startsWith('eg') ? 'eg' : 'ec';
    const totalCopias = ((tipo === 'eg' ? hb.eg : hb.ec) || []).filter(x => x === itemId).length;
    if (escolhas.length >= totalCopias || escolhas.some(e => e.elemento === elementoId && e.nome === nome)) return;
    escolhas.push({ elemento: elementoId, nome });
    hb.specialChoices[itemId] = escolhas;
    renderHatsuInPlace();
};
window._hRemoveTransmutacaoEscolha = function(itemId, elementoId, nome) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.specialChoices) hb.specialChoices = {};
    const { escolhas } = _hGetTransmutacaoElementos(hb, itemId);
    const idx = escolhas.findIndex(e => e.elemento === elementoId && e.nome === nome);
    if (idx === -1) return;
    escolhas.splice(idx, 1);
    hb.specialChoices[itemId] = escolhas;
    renderHatsuInPlace();
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
    pop.innerHTML = '<div style="font-weight:900;color:#e5e7eb;margin-bottom:10px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase">📍 Cálculo do Dano</div>'
        + lines.map(function(l){
            if (l.type === 'diceTable') {
                var tbl = l.table;
                var showUntil = Math.min(tbl.length - 1, l.tblFinal + 3);
                var chips = '';
                for (var i = 0; i <= showUntil; i++) {
                    var isFinal = i === l.tblFinal;
                    var isAfterDado = i === l.tblAfterDado && l.tblAfterDado !== l.tblStart;
                    var isStart = i === l.tblStart;
                    var isPath = i > l.tblStart && i < l.tblFinal && i !== l.tblAfterDado;
                    var bg, color, border, fw, extraStyle = '';
                    if (isFinal)         { bg='#ef4444';    color='#000';    border='#ef4444'; fw='900'; extraStyle='box-shadow:0 0 8px #ef444488;'; }
                    else if (isAfterDado){ bg='#fbbf2418';  color='#fbbf24'; border='#fbbf24'; fw='700'; }
                    else if (isStart)    { bg='#1f2937';    color='#9ca3af'; border='#374151'; fw='700'; }
                    else if (isPath)     { bg='#ef444412';  color='#f87171'; border='#ef444430'; fw='600'; }
                    else                 { bg='transparent';color='#2d3748'; border='transparent'; fw='400'; }
                    chips += '<div style="padding:3px 6px;border-radius:4px;background:'+bg+';border:1px solid '+border+';font-family:\'Orbitron\',sans-serif;font-weight:'+fw+';font-size:8px;color:'+color+';white-space:nowrap;'+extraStyle+'">'+tbl[i]+'</div>';
                }
                var moreCount = tbl.length - 1 - showUntil;
                var moreHtml = moreCount > 0 ? '<div style="font-size:8px;color:#374151;align-self:center;white-space:nowrap">+'+moreCount+' …</div>' : '';
                return '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #1f2937">'
                    + '<div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📊 Progressão dos dados</div>'
                    + '<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">'+chips+moreHtml+'</div>'
                    + '<div style="display:flex;gap:10px;margin-top:7px;flex-wrap:wrap">'
                    + '<span style="font-size:8px;color:#9ca3af">■ base</span>'
                    + (l.tblAfterDado !== l.tblStart ? '<span style="font-size:8px;color:#fbbf24">■ após dado</span>' : '')
                    + (l.tblFinal > l.tblAfterDado ? '<span style="font-size:8px;color:#f87171">■ graus</span>' : '')
                    + '<span style="font-size:8px;color:#ef4444">■ final</span>'
                    + '</div>'
                    + '</div>';
            }
            return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;margin-bottom:5px'+(l.i?';opacity:.75':'')+'">'
                + '<span style="color:#6b7280;white-space:nowrap">'+l.l+'</span>'
                + '<span style="color:'+l.c+';font-weight:'+(l.b?'900':'600')+';font-family:'+(l.b?"'Orbitron',sans-serif":'inherit')+'">'+l.v+'</span>'
                + '</div>';
        }).join('')
        + '<div onclick="document.getElementById(\''+popId+'\').remove()" style="margin-top:10px;font-size:8px;color:#4b5563;cursor:pointer;text-align:right;padding-top:6px;border-top:1px solid #1f2937">✕ fechar</div>';
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

window._hShowStatInfo = function(idx, type, btn) {
    var popId = '_stat_info_popup';
    var existing = document.getElementById(popId);
    if (existing) { if (existing.dataset.for == idx+'_'+type) { existing.remove(); return; } existing.remove(); }
    var lines = ((window._HATSU_STAT_INFO || {})[idx] || {})[type];
    if (!lines || !lines.length) return;
    var titles = { cd:'🎯 Cálculo do CD', alcance:'📐 Cálculo do Alcance', area:'🔵 Cálculo da Área', duracao:'⏱ Cálculo da Duração', constructoPv:'❤️ Cálculo do PV do Constructo', constructoCa:'🛡️ Cálculo da CA do Constructo' };
    var pop = document.createElement('div');
    pop.id = popId;
    pop.dataset.for = idx+'_'+type;
    pop.style.cssText = 'position:fixed;z-index:99999;background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:14px 16px;min-width:220px;box-shadow:0 8px 32px #000c;font-size:11px;pointer-events:auto';
    pop.innerHTML = '<div style="font-weight:900;color:#e5e7eb;margin-bottom:10px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase">'+(titles[type]||'📍 Detalhes')+'</div>'
        + lines.map(function(l){
            return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;margin-bottom:5px">'
                + '<span style="color:#6b7280;white-space:nowrap">'+l.l+'</span>'
                + '<span style="color:'+l.c+';font-weight:'+(l.b?'900':'600')+';font-family:'+(l.b?"'Orbitron',sans-serif":'inherit')+'">'+l.v+'</span>'
                + '</div>';
        }).join('')
        + '<div onclick="document.getElementById(\''+popId+'\').remove()" style="margin-top:10px;font-size:8px;color:#4b5563;cursor:pointer;text-align:right;padding-top:6px;border-top:1px solid #1f2937">✕ fechar</div>';
    var r = btn.getBoundingClientRect();
    pop.style.top = Math.min(r.bottom + 6, window.innerHeight - 200) + 'px';
    pop.style.left = Math.max(8, r.left - 110) + 'px';
    document.body.appendChild(pop);
    setTimeout(function(){
        document.addEventListener('click', function _cl(e){
            if (!pop.contains(e.target) && e.target !== btn){ pop.remove(); document.removeEventListener('click', _cl); }
        });
    }, 50);
};

window._hShowVariavelInfo = function(btn) {
    var popId = '_variavel_info_popup';
    var existing = document.getElementById(popId);
    if (existing) { existing.remove(); return; }
    var pop = document.createElement('div');
    pop.id = popId;
    pop.style.cssText = 'position:fixed;z-index:99999;background:#0f172a;border:1px solid #a855f755;border-radius:12px;padding:14px 16px;min-width:220px;max-width:280px;box-shadow:0 8px 32px #000c;font-size:11px;pointer-events:auto';
    pop.innerHTML = '<div style="font-weight:900;color:#c084fc;margin-bottom:8px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase">🔮 Restrição Variável</div>'
        + '<div style="color:#d1d5db;font-size:10px;line-height:1.5">Ao selecionar essa restrição, você varia no cumprimento dela em troca de receber também um benefício variável e correspondente.</div>'
        + '<div onclick="document.getElementById(\''+popId+'\').remove()" style="margin-top:10px;font-size:8px;color:#4b5563;cursor:pointer;text-align:right;padding-top:6px;border-top:1px solid #1f2937">✕ fechar</div>';
    var r = btn.getBoundingClientRect();
    pop.style.top = Math.min(r.bottom + 6, window.innerHeight - 160) + 'px';
    pop.style.left = Math.max(8, Math.min(r.left - 100, window.innerWidth - 300)) + 'px';
    document.body.appendChild(pop);
    setTimeout(function(){
        document.addEventListener('click', function _cl(e){
            if (!pop.contains(e.target) && e.target !== btn){ pop.remove(); document.removeEventListener('click', _cl); }
        });
    }, 50);
};

window._hToggleLore = function(id) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.openLore) hb.openLore = {};
    if (hb.openLore[id]) delete hb.openLore[id];
    else hb.openLore[id] = true;
    renderHatsuInPlace();
};

window._hTogglePure = function(id) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.pureRestrictions) hb.pureRestrictions = {};
    if (hb.pureRestrictions[id]) {
        // Deixando de ser Pura = passa a valer o benefício mecânico real. Não bloqueia mais —
        // apenas avisa se isso ultrapassar o limite de Grau de Potência (o excedente só entra em
        // vigor mecanicamente quando o teto do nível crescer).
        const _before = window._hSnapshotGrauTotals(hb);
        delete hb.pureRestrictions[id];
        window._hCheckGrauLimiteENotify(hb, _before);
        // Se era restrição extrema, limpa duplicatas que excedam o P.N extremo restante
        window._hCleanDuplicatesIfNeeded && window._hCleanDuplicatesIfNeeded(hb);
    } else {
        hb.pureRestrictions[id] = true;
        // Pura não usa benefício escolhido
        if (hb.beneficioChoices) delete hb.beneficioChoices[id];
    }
    renderHatsuInPlace();
};

// rev. Manual 2.0 — snapshot dos totais de Grau de Potência por característica (chame ANTES de
// mutar hb, para poder comparar depois e só bloquear quando a ação atual causar o estouro).
window._hSnapshotGrauTotals = function(hb) {
    if (!window.calcGrausPotenciaPorCaracteristica) return {};
    const char = state.currentChar; if (!char) return {};
    const shim = { restricoes: [...(hb.rg||[]), ...(hb.rc||[])], efeitos: [...(hb.eg||[]), ...(hb.ec||[])], beneficioChoices: hb.beneficioChoices || {}, specialChoices: hb.specialChoices || {}, pureRestrictions: hb.pureRestrictions || {}, classe: char.class, juramentoImutavelNivelBase: hb.juramentoImutavelNivelBase };
    return window.calcGrausPotenciaPorCaracteristica(shim, char.level);
};

// rev.: Limite de Grau de Potência por nível. NÃO bloqueia mais nenhuma seleção — o jogador pode
// pegar restrições/efeitos que somem mais graus do que o teto do nível permite. Apenas avisa
// (toast informativo) quando a característica ultrapassa o limite E a ação atual piorou esse
// total. Mecanicamente, apenas o valor até o teto é aplicado (ver clamp em hatsu-detail.js); o
// excedente passa a contar automaticamente quando o personagem subir de nível e o teto crescer.
window._hCheckGrauLimiteENotify = function(hb, beforeTotals) {
    if (!window.calcGrausPotenciaPorCaracteristica || !window.calcMaxGrauPorNivel) return true;
    const char = state.currentChar; if (!char) return true;
    const grauMaxBase = window.calcMaxGrauPorNivel(char.level);
    if (grauMaxBase === Infinity) return true; // nível 11-12: ilimitado
    const totals = window._hSnapshotGrauTotals(hb);
    const LABELS = { dano:'🔥 Dano/Cura', alcance:'📏 Alcance', area:'🔵 Área', duracao:'⏱️ Duração', acerto:'⚔️ Acerto', cd:'🎯 CD do TR' };
    for (const k in totals) {
        const before = beforeTotals ? (beforeTotals[k] || 0) : 0;
        if (totals[k] <= before) continue; // não piorou nesta ação — não é essa ação que estourou
        const grauMax = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, char.class, k) : grauMaxBase;
        if (totals[k] > grauMax) {
            window._hShowGrauLimiteToast(LABELS[k], totals[k], grauMax, char.level || 1);
        }
    }
    return true;
};

// Toast estilizado (substitui o alert() nativo) — aviso informativo de excedente de Grau de
// Potência. Não bloqueia nada; só explica que o excedente aguarda o teto do nível crescer.
window._hShowGrauLimiteToast = function(label, atual, max, nivel) {
    const existing = document.getElementById('grau-limite-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'grau-limite-toast';
    toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#0d1117;border:2px solid #fbbf24;border-radius:14px;padding:14px 18px;z-index:99999;font-family:Rajdhani,sans-serif;max-width:340px;width:calc(100% - 32px);box-shadow:0 8px 32px #000c,0 0 24px #fbbf2444;animation:fadeIn .2s;cursor:pointer';
    toast.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px">'
        + '<span style="font-size:20px;flex-shrink:0;line-height:1">⭐</span>'
        + '<div style="min-width:0">'
        + '<div style="font-family:\'Orbitron\',sans-serif;font-weight:900;font-size:11px;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Excedente de Grau de Potência</div>'
        + '<div style="font-size:12px;color:#e5e7eb;font-weight:700;margin-bottom:4px">' + label + ': <span style="color:#fbbf24">' + atual + '/' + max + '</span> <span style="color:#6b7280;font-weight:400">(nível ' + nivel + ')</span></div>'
        + '<div style="font-size:10px;color:#9ca3af;line-height:1.4">A seleção foi mantida, mas só ' + max + ' grau(s) serão aplicados nesta característica por enquanto. O restante passa a valer automaticamente quando o teto do seu nível aumentar.</div>'
        + '</div>'
        + '</div>';
    toast.onclick = function() { toast.style.opacity = '0'; toast.style.transition = 'opacity .2s'; setTimeout(() => toast.remove(), 200); };
    document.body.appendChild(toast);
    setTimeout(() => {
        if (!document.getElementById('grau-limite-toast')) return;
        toast.style.opacity = '0'; toast.style.transition = 'opacity .4s';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
};

window._hToggleR = function(id, tipo) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'rg' ? hb.rg : hb.rc;
    const idx = arr.indexOf(id);
    if (idx > -1) {
        arr.splice(idx, 1);
        // Remove benefício escolhido ao desselecionar
        if (hb.beneficioChoices) delete hb.beneficioChoices[id];
        // Se a restrição removida era pura extrema, limpa duplicatas que excedam o P.N restante
        if (hb.pureRestrictions && hb.pureRestrictions[id]) {
            delete hb.pureRestrictions[id];
            window._hCleanDuplicatesIfNeeded && window._hCleanDuplicatesIfNeeded(hb);
        }
        // Juramento Imutável: ao desmarcar, esquece o nível em que foi adquirida
        if (id === 'rg_e5') delete hb.juramentoImutavelNivelBase;
    } else {
        // Guarda final: restrições de ESPECIALIZAÇÃO só para ESPECIALIZAÇÃO, MANIPULAÇÃO e MATERIALIZAÇÃO
        if (tipo === 'rc') {
            const _espCatR = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÇÃO'];
            const _espRIds = new Set((_espCatR && _espCatR.restricoes || []).map(r => r.id));
            if (_espRIds.has(id)) {
                const _charClsR = state.currentChar && state.currentChar.class;
                if (_charClsR !== 'ESPECIALIZAÇÃO' && _charClsR !== 'MANIPULAÇÃO' && _charClsR !== 'MATERIALIZAÇÃO') return;
            }
        }
        arr.push(id);
        // Juramento Imutável: grava o nível em que foi adquirida (o bônus só ativa 3 níveis depois)
        if (id === 'rg_e5' && hb.juramentoImutavelNivelBase == null) {
            hb.juramentoImutavelNivelBase = (state.currentChar && state.currentChar.level) || 1;
        }
        // Verifica se tem benefício alternativo (bnf com " OU ")
        const allRDB = [];
        const rg = window.HATSU_DB.restricoes_gerais;
        ['leves','moderadas','pesadas','variaveis','extremas'].forEach(k => (rg[k]||[]).forEach(r => allRDB.push(r)));
        const char = state.currentChar;
        const catDB = window.HATSU_DB.categorias[char.class];
        if (catDB && catDB.restricoes) catDB.restricoes.forEach(r => allRDB.push(r));
        const item = allRDB.find(r => r.id === id);
        if (item && item.bnf && /\s[Oo][Uu]\s/.test(item.bnf)) {
            // Has alternatives — will show inline choice, mark as needs-choice
            if (hb.beneficioChoices[id] === undefined) hb.beneficioChoices[id] = null; // null = not yet chosen
        }
        // rev. Manual 2.0: NÃO bloqueia a seleção aqui — o jogador ainda pode marcar como "Pura"
        // (converte o benefício em P.N e não conta para o limite de grau). O bloqueio real acontece
        // em _hTogglePure, quando ele efetivamente opta por usar o benefício mecânico (não-pura).
    }
    renderHatsuInPlace();
};

window._hSetBeneficioChoice = function(id, choice) {
    const hb = state.hatsuBuilder; if (!hb) return;
    if (!hb.beneficioChoices) hb.beneficioChoices = {};
    const _beforeBC = window._hSnapshotGrauTotals(hb);
    hb.beneficioChoices[id] = choice;
    // rev.: não bloqueia mais — apenas avisa se ultrapassar o limite de Grau de Potência do nível
    window._hCheckGrauLimiteENotify(hb, _beforeBC);
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
// Busca um efeito (geral ou de qualquer categoria) pelo id
function _hFindEfeitoDB(id) {
    const allEDB = [];
    (window.HATSU_DB.efeitos_gerais||[]).forEach(e => allEDB.push(e));
    // Inclui efeitos de TODAS as categorias (para suporte cross-category)
    Object.values(window.HATSU_DB.categorias||{}).forEach(cat => {
        if (cat && cat.efeitos) cat.efeitos.forEach(e => { if (!allEDB.find(x=>x.id===e.id)) allEDB.push(e); });
    });
    return allEDB.find(e => e.id === id);
}

// Tenta comprar uma cópia do efeito `id` (valida req/PN/guardas) e a adiciona ao array.
// Se `isRepetivel`, também registra em hb.efeitoNiveis o nível em que a cópia foi comprada.
// Retorna true se a compra foi efetivada.
function _hTryComprarEfeito(hb, item, id, tipo, pn, isRepetivel) {
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const char = state.currentChar;
    // Verifica requisito de nível/atributo
    if (item && item.req) {
        const kamikazeActive = (hb.rg||[]).includes('rg_e6');
        const req = item.req;
        const charLevel = parseInt(char.level) || 0;
        const getMod = v => Math.floor(((v||10) - 10) / 2);
        const attrMod = k => getMod(char.attributes && char.attributes[k] ? char.attributes[k].value : 10);

        // "Acesso a Reforço" bypass — skip level check entirely
        let bypassedByReforco = false;
        if (/acesso\s+a\s+refor[çc]o/i.test(req)) {
            const REFORCO_CLASSES = ['REFORÇO','INTENSIFICAÇÃO'];
            bypassedByReforco = REFORCO_CLASSES.includes(char.class) ||
                (window.CATEGORY_AFFINITY && window.CATEGORY_AFFINITY[char.class] &&
                 (window.CATEGORY_AFFINITY[char.class]['REFORÇO'] || window.CATEGORY_AFFINITY[char.class]['INTENSIFICAÇÃO']));
        }

        // Nível sempre verificado (mesmo com Kamikaze)
        if (!bypassedByReforco) {
            const lvlMatch = req.match(/N[ií]vel\s+(\d+)/i);
            if (lvlMatch && charLevel < parseInt(lvlMatch[1])) return false;
        }

        // Kamikaze ignora atributos e pré-requisitos de efeitos, mas não o nível (já verificado acima)
        if (!kamikazeActive) {
            // "ATTR ou ATTR X+"
            const orAttrPat = /\b(FOR|DES|CON|INT|SAB|PRE)\s+ou\s+(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
            let om; const handledByOr = new Set();
            while ((om = orAttrPat.exec(req)) !== null) {
                const a1 = om[1].toUpperCase(), a2 = om[2].toUpperCase(), min = parseInt(om[3]);
                handledByOr.add(a1); handledByOr.add(a2);
                if (attrMod(a1) < min && attrMod(a2) < min) return false;
            }
            // single "ATTR X+"
            const singlePat = /\b(FOR|DES|CON|INT|SAB|PRE)\s+(\d+)\+/gi;
            let sm;
            while ((sm = singlePat.exec(req)) !== null) {
                const attr = sm[1].toUpperCase(), min = parseInt(sm[2]);
                if (handledByOr.has(attr)) continue;
                const orCtx = new RegExp(`(${attr})\\s+ou\\s+\\w+\\s+${min}\\+|\\w+\\s+ou\\s+(${attr})\\s+${min}\\+`, 'i');
                if (orCtx.test(req)) continue;
                if (attrMod(attr) < min) return false;
            }
        }
    }
    // Verifica P.N — busca em efeitos gerais + todas as categorias
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
    const _pnSpentOth = window.calcPNSpentInOtherHatsus(state.currentChar, hb.editingIdx); const _pnDom = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(state.currentChar) : 0; const _pnBaseAvail = Math.max(0, window.calcularPHBase(state.currentChar.level) - _pnSpentOth - _pnDom); const _pnBonus = window.calcPNBonusFromRestr(hb); const _pnBaseUsed = Math.max(0, used - _pnBonus); if (_pnBaseUsed + pn > _pnBaseAvail && used + pn > _pnBaseAvail + _pnBonus) return false;
    // Guarda final: efeitos de ESPECIALIZAÇÃO só para ESPECIALIZAÇÃO, MANIPULAÇÃO e MATERIALIZAÇÃO
    if (tipo === 'ec') {
        const _espCatDB = window.HATSU_DB && window.HATSU_DB.categorias['ESPECIALIZAÇÃO'];
        const _espEfIds = new Set((_espCatDB && _espCatDB.efeitos || []).map(e => e.id));
        if (_espEfIds.has(id)) {
            const _charCls = state.currentChar && state.currentChar.class;
            if (_charCls !== 'ESPECIALIZAÇÃO' && _charCls !== 'MANIPULAÇÃO' && _charCls !== 'MATERIALIZAÇÃO') return false;
        }
    }
    const charLevelNow = parseInt(char.level) || 0;
    const _beforeE = window._hSnapshotGrauTotals(hb);
    arr.push(id);
    if (isRepetivel) {
        hb.efeitoNiveis = hb.efeitoNiveis || {};
        hb.efeitoNiveis[id] = (hb.efeitoNiveis[id] || []).concat([charLevelNow]);
    }
    // rev.: não bloqueia mais a seleção — apenas avisa se ultrapassar o limite de Grau de Potência
    // do nível. O excedente fica sem efeito mecânico até o teto subir de nível.
    window._hCheckGrauLimiteENotify(hb, _beforeE);
    return true;
}

window._hToggleE = function(id, tipo, pn) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const item = _hFindEfeitoDB(id);
    const isRepetivel = window.isEfeitoRepetivel(item);

    const idx = arr.indexOf(id);
    if (idx > -1) {
        // Efeitos repetíveis já selecionados são geridos pelos controles de cópias (+/−), não pelo clique no card
        if (isRepetivel) return;
        arr.splice(idx, 1);
    } else {
        _hTryComprarEfeito(hb, item, id, tipo, pn, isRepetivel);
    }
    renderHatsuInPlace();
};

// Compra uma nova cópia de um efeito repetível (evolução no nível atual)
window._hAddRepetivelE = function(id, tipo, pn) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const item = _hFindEfeitoDB(id);
    if (!window.isEfeitoRepetivel(item)) return;
    const char = state.currentChar;
    const charLevelNow = parseInt(char.level) || 0;
    hb.efeitoNiveis = hb.efeitoNiveis || {};
    const niveisComprados = hb.efeitoNiveis[id] || [];

    // Só pode comprar mais uma cópia por nível
    if (niveisComprados.some(lv => lv === charLevelNow)) return;
    // Respeita o teto de usos do efeito, se houver
    if (item.maxUsos) {
        const totalAtual = arr.filter(x => x === id).length;
        if (totalAtual >= item.maxUsos) {
            if (window._showXpToast) window._showXpToast(`⚠️ ${item.nome}: máximo de ${item.maxUsos} usos atingido`);
            return;
        }
    }
    _hTryComprarEfeito(hb, item, id, tipo, pn, true);
    renderHatsuInPlace();
};

// Corta hb.specialChoices[id] (quando é uma lista de "pontos" alocados, ex: eg3) de volta ao
// tamanho do total de cópias do efeito, removendo do FIM (pontos mais recentemente adicionados) —
// chamado sempre que uma cópia do efeito é removida, pra nunca deixar mais pontos alocados do que
// cópias compradas.
function _hClampSpecialArray(hb, id, tipo) {
    const sc = hb.specialChoices && hb.specialChoices[id];
    if (!Array.isArray(sc)) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const total = arr.filter(x => x === id).length;
    if (sc.length > total) sc.length = total;
}

// Desfaz a cópia de um efeito repetível comprada NESTE nível (não mexe em cópias de níveis anteriores)
window._hRemoveRepetivelE = function(id, tipo) {
    const hb = state.hatsuBuilder; if (!hb) return;
    const arr = tipo === 'eg' ? hb.eg : hb.ec;
    const char = state.currentChar;
    const charLevelNow = parseInt(char.level) || 0;
    hb.efeitoNiveis = hb.efeitoNiveis || {};
    const niveisComprados = hb.efeitoNiveis[id] || [];
    const lastIdx = niveisComprados.lastIndexOf(charLevelNow);
    if (lastIdx === -1) return; // nada comprado neste nível para desfazer
    niveisComprados.splice(lastIdx, 1);
    const removeIdx = arr.lastIndexOf(id);
    if (removeIdx > -1) arr.splice(removeIdx, 1);
    _hClampSpecialArray(hb, id, tipo);
    renderHatsuInPlace();
};

// ── renderCard (legado — mantido para compatibilidade) ──
function renderCard(item, color) {
    return `<div style="padding:8px;border-radius:8px;border:1px solid #1f2937;background:#0f1117">
        <div style="font-size:9px;font-weight:700;color:#d1d5db;text-transform:uppercase;margin-bottom:4px">${item.nome}</div>
        <div style="font-size:8px;color:#6b7280;font-style:italic;margin-bottom:4px">${item.desc}</div>
        ${item.bnf?`<div style="font-size:8px;font-weight:700;color:#9ca3af">⚡ ${item.bnf}</div>`:''}
    </div>`;
}
