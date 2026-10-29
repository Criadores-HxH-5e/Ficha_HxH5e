        window._openVitalInputModal = function(key, cur, max) {
            document.getElementById('vital-input-overlay')?.remove();
            const isDmg = key === 'pv';
            const color = key === 'pv' ? '#ef4444' : '#ffffff';
            const label = key.toUpperCase();
            const html = `<div id="vital-input-overlay" style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif" onclick="if(event.target===this)document.getElementById('vital-input-overlay').remove()">
                <div style="background:#0d1117;border:2px solid ${color};border-radius:16px;padding:22px;width:100%;max-width:290px;box-shadow:0 0 40px ${color}44" onclick="event.stopPropagation()">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
                        <div>
                            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;color:${color};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">${label}</div>
                            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:26px;color:#fff;line-height:1">${cur}<span style="font-size:13px;color:#6b7280;font-weight:400"> /${max}</span></div>
                        </div>
                        <button onclick="document.getElementById('vital-input-overlay').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:22px;line-height:1;padding:0">×</button>
                    </div>
                    <input id="vital-input-val" type="number" min="0" placeholder="Quantidade..." autofocus
                        style="width:100%;box-sizing:border-box;background:#111827;border:2px solid #374151;border-radius:8px;padding:11px 12px;color:#fff;font-size:22px;font-family:Orbitron,sans-serif;font-weight:900;outline:none;margin-bottom:10px;text-align:center;letter-spacing:1px"
                        oninput="this.style.borderColor=this.value?'${color}':'#374151'"
                        onkeydown="if(event.key==='Enter'){const v=parseInt(this.value);if(!isNaN(v)&&v>0)window._applyVitalDelta('${key}',-v)}"
                    >
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                        <button onclick="const v=parseInt(document.getElementById('vital-input-val').value);if(!isNaN(v)&&v>0)window._applyVitalDelta('${key}',-v)"
                            style="padding:12px;border-radius:10px;background:#ef444420;border:1px solid #ef4444;color:#ef4444;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                            − Dano
                        </button>
                        <button onclick="const v=parseInt(document.getElementById('vital-input-val').value);if(!isNaN(v)&&v>0)window._applyVitalDelta('${key}',v)"
                            style="padding:12px;border-radius:10px;background:#22c55e20;border:1px solid #22c55e;color:#22c55e;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                            + Cura
                        </button>
                    </div>
                    <button onclick="const v=parseInt(document.getElementById('vital-input-val').value);if(!isNaN(v))window._setVitalExact('${key}',v)"
                        style="width:100%;padding:10px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-sizing:border-box">
                        = Definir Valor Exato
                    </button>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
            setTimeout(() => document.getElementById('vital-input-val')?.focus(), 80);
        };

        window._applyVitalDelta = function(key, delta) {
            updateVital(key, delta);
            document.getElementById('vital-input-overlay')?.remove();
        };

        window._setVitalExact = function(key, val) {
            const char = state.currentChar;
            if (!char) return;
            const v = char.vitals;
            if (key === 'pv') v.hp = Math.min(v.hpMax || v.hp, Math.max(0, val));
            else if (key === 'rea') { const rMax = 7 + getMod(char.attributes.SAB.value) + (((char.combatInclinations || {}).analitica || 0) >= 1 ? 2 : 0); v.rea = Math.min(rMax, Math.max(0, val)); }
            saveCharacter(char);
            render(true);
            document.getElementById('vital-input-overlay')?.remove();
        };

        function getCIPointsForLevel(level) {
            let pts = 0;
            if (level >= 2)  pts += 2;
            if (level >= 4)  pts += 3;
            if (level >= 7)  pts += 2;
            if (level >= 11) pts += 3;
            return pts;
        }

        function renderSheet(container) {
            const char = state.currentChar;
            // Retroativo: personagem antigo com Aura Gigantesca recebe o bônus na 1ª abertura.
            if (aplicarAuraGigantesca(char)) saveCharacter(char);
            // Migração dos bônus de Maestria (roda antes do aviso, para o jogador já abrir
            // o modal com os atributos corretos).
            if (migrarBonusMaestria(char)) saveCharacter(char);
            // Dedup CONJURAÇÃO → MATERIALIZAÇÃO: converte restrições rc_* já salvas.
            if (migrarRestricoesConjuracao(char)) saveCharacter(char);
            // eg4 (Efeito Alternativo): as 4 chaves passaram de nome para id.
            if (migrarEg4ParaIds(char)) saveCharacter(char);
            if (migrarEg6RmE8ParaIds(char)) saveCharacter(char);
            // Aviso único da nova mecânica das Inclinações (só para quem já tinha pontos).
            setTimeout(function () { avisarRealocacaoInclinacoes(state.currentChar); }, 400);
            const clsData = SYSTEM_DB.classes.find(c => c.id === char.class);
            // Sem categoria de Nen o app fica em preto e branco, não em verde neon.
            const themeColor = clsData ? clsData.color : (window.TEMA_SEM_NEN || '#eaecf0');
            setThemeColor(themeColor);
            
            // Helpers de renderização interna da ficha
            const renderNeonVital = (label, val, max, colorClass, borderClass, showBtns = true, step = 1, showMax = false) => `
                <div class="flex flex-col items-center justify-center w-full">
                    <span class="text-[9px] font-bold ${colorClass} uppercase tracking-wider mb-0.5">${label}</span>
                    <div class="flex items-center justify-between w-full max-w-[80%] gap-1">
                         ${showBtns ? `<button onclick="${label === 'SAN' ? 'window._showSanDamageModal()' : (label === 'PV' ? 'window._showPvDamageModal()' : `updateVital('${label.toLowerCase()}', ${-step})`)}" class="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><i data-lucide="minus" size="10"></i></button>` : '<div class="w-4"></div>'}
                        <span class="font-display font-bold text-lg text-white tracking-wider${showMax && max != null ? ' cursor-pointer select-none active:opacity-60' : ''}" ${showMax && max != null ? `onclick="window._openVitalInputModal('${label.toLowerCase()}',${val},${max})"` : ''}>${showMax && max != null ? `${val}<span class="text-gray-400 text-xs font-normal">/${max}</span>` : val}</span>
                         ${showBtns ? `<button onclick="updateVital('${label.toLowerCase()}', ${step})" class="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><i data-lucide="plus" size="10"></i></button>` : '<div class="w-4"></div>'}
                    </div>
                    <div class="w-8 h-0.5 rounded-full mt-0.5 ${borderClass} opacity-80"></div>
                </div>
            `;
            const rollModeBtn = (mode) => {
                const isActive = state.rollMode === mode;
                return `<button onclick="setRollMode('${mode}')" class="flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg ${isActive ? `bg-[${themeColor}] text-black shadow-[0_0_15px_${themeColor}80]` : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}">${mode}</button>`;
            };
            const renderNavItem = (id, icon, color) => { 
                const active = state.activeTab === id; 
                const showBadge = (id === 'DADOS' && state.unreadRolls && !active);
                return `<button onclick="setTab('${id}')" class="flex flex-col items-center justify-center w-full h-full gap-1 group relative">${active ? `<div class="absolute top-0 w-8 h-0.5 bg-[${color}] shadow-[0_0_10px_${color}]"></div>` : ''}<div class="relative"><i data-lucide="${icon}" size="${active ? 20 : 18}" class="${active ? `text-[${color}] drop-shadow-[0_0_5px_${color}]` : 'text-gray-600 group-hover:text-gray-400'} transition-all"></i>${showBadge ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[${color}] shadow-[0_0_8px_${color}] animate-pulse border border-black"></div>` : ''}</div><span class="text-[7px] font-bold tracking-widest ${active ? `text-[${color}]` : 'text-gray-600'}">${id}</span></button>`; 
            };

            let tabContent = '';
            
            if (state.activeTab === 'FICHA') {
                const ATTR_FULL_NAMES = { 'FOR': 'FORÇA', 'DES': 'DESTREZA', 'CON': 'CONSTITUIÇÃO', 'INT': 'INTELIGÊNCIA', 'SAB': 'SABEDORIA', 'PRE': 'PRESENÇA', 'CAR': 'PRESENÇA' };
                const ATTR_ICONS_MAP = { 'FOR': ['dumbbell', 'swords'], 'DES': ['wind', 'target'], 'CON': ['heart', 'activity'], 'INT': ['brain-circuit', 'book-open'], 'SAB': ['eye', 'sparkles'], 'PRE': ['crown', 'message-circle'], 'CAR': ['crown', 'message-circle'] };
                const infoGridHtml = `<div class="grid grid-cols-4 divide-x divide-gray-800 bg-[#0b0c10] border-t border-b border-gray-800 mb-2"><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-neon-blue uppercase tracking-widest mb-0.5">Tendência</span><select onchange="updateCharProperty('alignment', this.value)" class="bg-transparent text-white font-display font-bold text-xs uppercase outline-none cursor-pointer text-center appearance-none w-full"><option value="Heróico" ${char.alignment === 'Heróico' ? 'selected' : ''} class="bg-gray-900">Heróico</option><option value="Caótico" ${char.alignment === 'Caótico' ? 'selected' : ''} class="bg-gray-900">Caótico</option><option value="Neutro" ${!char.alignment || char.alignment === 'Neutro' ? 'selected' : ''} class="bg-gray-900">Neutro</option><option value="Maligno" ${char.alignment === 'Maligno' ? 'selected' : ''} class="bg-gray-900">Maligno</option></select></div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-neon-yellow uppercase tracking-widest mb-0.5">Proficiência</span><span class="font-display font-bold text-lg text-white tracking-wider">+${getProficiencyBonus(char.level)}</span></div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-white uppercase tracking-widest mb-0.5">Desl.</span><span class="font-display font-bold text-lg text-white tracking-wider">${(() => { const _d = window.calcDeslocamentoEfetivo ? window.calcDeslocamentoEfetivo(char) : { total: (char.vitals.desl || 9), bonus: 0 }; return String(_d.total).replace('.', ',') + 'm'; })()}</span>${(() => { const _d = window.calcDeslocamentoEfetivo ? window.calcDeslocamentoEfetivo(char) : { bonus: 0 }; return _d.bonus > 0 ? `<span class="text-[8px] font-bold text-neon-theme mt-0.5">💪 +${String(_d.bonus).replace('.', ',')}m</span>` : ''; })()}${char.deslocamentoTipo ? `<span class="text-[8px] font-bold text-neon-theme mt-0.5">${char.deslocamentoTipo === 'voo' ? '🕊️' : char.deslocamentoTipo === 'aquatico' ? '🌊' : '🧗'} +${char.deslocamentoValor}m</span>` : ''}</div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Jogador</span><input type="text" value="${char.playerName || ''}" placeholder="Nome..." onchange="updateCharProperty('playerName', this.value)" class="bg-transparent text-white font-display font-bold text-xs outline-none w-full text-center placeholder-gray-700"></div></div>`;
                // Migrate old characters: fix sanMax and add rdm
                if (!char.vitals.sanMax || char.vitals.sanMax < 100) { char.vitals.sanMax = 100; if (char.vitals.san < 10) char.vitals.san = 100; }
                const rdmVal = calcRDM(char);
                const sanPct = Math.round((char.vitals.san / char.vitals.sanMax) * 100);
                const sanColor = sanPct >= 90 ? 'text-green-400' : sanPct >= 75 ? 'text-yellow-400' : sanPct >= 50 ? 'text-orange-400' : 'text-purple-400';
                const reaMax = window.calcReacoesMax ? window.calcReacoesMax(char) : (7 + getMod(char.attributes.SAB.value));
                const reaCur = char.vitals.rea !== undefined ? char.vitals.rea : reaMax;
                const vitalsGridHtml = `<div class="grid grid-cols-3 gap-y-2 gap-x-2 px-2 py-2 border-b border-gray-800 bg-[#0b0c10] mb-4">${renderNeonVital('SAN', char.vitals.san, char.vitals.sanMax, sanColor, 'bg-white')}${renderNeonVital('REA', reaCur, reaMax, 'text-white', 'bg-white text-white', true, 1, true)}${renderNeonVital('AURA', char.vitals.aura, char.vitals.auraMax, `text-[${themeColor}]`, `bg-[${themeColor}] text-[${themeColor}]`, true, 5)}${(() => {
                    // Escudo desenhado ATRÁS do número da CA, como marca d'água.
                    const _ca = calcCAAtual(char);
                    return `<div class="flex flex-col items-center justify-center w-full">
                        <span class="text-[9px] font-bold text-white uppercase tracking-wider mb-0.5">CA</span>
                        <div class="relative flex items-center justify-center" style="width:34px;height:26px">
                            <i data-lucide="shield" size="26" class="absolute text-gray-600" style="opacity:.28"></i>
                            <span class="relative font-display font-bold text-lg text-white tracking-wider">${_ca}</span>
                        </div>
                        <div class="w-8 h-0.5 rounded-full mt-0.5 bg-white opacity-80"></div>
                    </div>`;
                })()}${(() => {
                    // Ícone de ARMADURA (não mais escudo) com a durabilidade no centro.
                    // Clicar reduz 1. Zerada, o ícone mostra um X e o clique oferece reparo.
                    const _d = getDurabilidade(char);
                    const _cor = !_d.temArmadura ? '#4b5563' : (_d.quebrada ? '#ef4444' : (_d.atual <= Math.ceil(_d.max / 4) ? '#fbbf24' : themeColor));
                    const _icone = _d.quebrada ? 'shield-off' : 'shield-half';
                    const _titulo = !_d.temArmadura
                        ? 'Sem armadura no inventário'
                        : (_d.quebrada ? 'Armadura quebrada — clique para reparar' : `Durabilidade ${_d.atual}/${_d.max} — clique para marcar 1 golpe`);
                    return `<div class="flex flex-col items-center justify-center cursor-pointer group" onclick="handleArmorClick()" title="${_titulo}">
                        <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ARMADURA</span>
                        <div class="w-10 h-10 rounded-full border flex items-center justify-center bg-gray-900 transition-all" style="border-color:${_cor}55">
                            <i data-lucide="${_icone}" size="26" class="absolute" style="color:${_cor};opacity:${_d.quebrada ? '.9' : '.3'}"></i>
                            ${_d.temArmadura && !_d.quebrada ? `<span class="relative font-display font-bold text-sm tracking-wider" style="color:${_cor}">${_d.atual}</span>` : ''}
                        </div>
                        <div class="w-8 h-0.5 rounded-full mt-1.5 opacity-80" style="background:${_d.temArmadura ? _cor : '#1f2937'}"></div>
                    </div>`;
                })()}${renderNeonVital('PV', char.vitals.hp, char.vitals.hpMax, 'text-neon-red', 'bg-neon-red text-neon-red', true, 1, true)}</div>${rdmVal > 0 ? `<div class="flex items-center justify-center gap-2 text-[9px] text-blue-400 font-bold pb-2 border-b border-gray-800 mb-2"><span> 🛡️ RDM (Resist. Mental)</span><span class="font-display text-sm">−${rdmVal}</span></div>` : ''}`;
                const rollModesHtml = ''; // removido — modo é escolhido por rolagem via modal
                const _attrPts = (char.pendingAttrPoints !== undefined && char.pendingAttrPoints !== null) ? char.pendingAttrPoints : null;
                const _attrBanner = (_attrPts !== null && _attrPts > 0) ? `<div class="mx-4 mb-3 px-4 py-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-xs font-black uppercase tracking-widest text-yellow-400">✦ Pontos de Atributo</span><span class="text-[9px] text-yellow-400/60 font-bold">para distribuir</span></div><span class="font-display font-black text-2xl text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">${_attrPts}</span></div>` : '';
                const _showAttrBtns = state.isAdmin || (_attrPts !== null && _attrPts > 0);
                const attributesHtml = `${_attrBanner}<div class="grid grid-cols-2 gap-3 p-4 pt-0">${Object.entries(char.attributes).map(([key, attr]) => { const _ef = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, key) : { valor: attr.value, mod: getMod(attr.value), bonusValor: 0, bonusMod: 0, fontes: [] }; const mod = _ef.mod; const fullName = ATTR_FULL_NAMES[key]; const icons = ATTR_ICONS_MAP[key] || ["star","star"]; const saveSkillName = `TR de ${key}`; const isTrained = char.skills.includes(saveSkillName); const isExpert = (char.expertise || []).includes(saveSkillName); const pb = getProficiencyBonus(char.level); let saveBonus = mod; if(isExpert) saveBonus += pb * 2; else if(isTrained) saveBonus += pb; const saveBonusStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`; return `<div class="bg-gray-900 border border-gray-800 rounded-3xl p-3 relative overflow-hidden transition-all duration-300 hover:border-[${themeColor}] hover:shadow-[0_0_20px_rgba(var(--theme-rgb),0.1)] h-full flex flex-col justify-between group" onclick="handleAttributeClick('${key}')"><div class="relative w-full flex justify-center items-center mb-1 min-h-[30px]"><div class="flex items-center gap-2 text-[${themeColor}] bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm z-10 shadow-[0_0_15px_${themeColor}40]"><i data-lucide="${icons[0]}" size="10" class="drop-shadow-[0_0_8px_${themeColor}]"></i><span class="text-[9px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">${fullName}</span><i data-lucide="${icons[1]}" size="10" class="drop-shadow-[0_0_8px_${themeColor}]"></i></div></div><div class="flex items-center justify-center my-0 relative flex-1">${_showAttrBtns ? `<button onclick="event.stopPropagation(); updateSheetAttr('${key}', -1)" class="absolute left-0 text-gray-600 hover:text-white p-1"><i data-lucide="minus" size="14"></i></button>` : ''}<span class="text-4xl font-display font-bold text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">${attr.value}</span>${_showAttrBtns ? `<button onclick="event.stopPropagation(); updateSheetAttr('${key}', 1)" class="absolute right-0 text-gray-600 hover:text-white p-1"><i data-lucide="plus" size="14"></i></button>` : ''}</div><div class="flex justify-center mt-1 mb-1"><div class="px-4 py-0.5 rounded-full border border-[${themeColor}]/30 bg-[${themeColor}]/5 text-[${themeColor}] text-xs font-bold shadow-[0_0_10px_rgba(var(--theme-rgb),0.2)]">${mod >= 0 ? '+'+mod : mod}</div></div><div onclick="event.stopPropagation(); handleShieldClick('${key}')" class="absolute right-2 bottom-2 cursor-pointer z-20 hover:scale-110 transition-transform flex items-center justify-center" title="TR de ${fullName}: ${saveBonusStr}"><i data-lucide="shield" size="18" class="${isTrained ? (isExpert ? 'text-neon-yellow fill-neon-yellow/10 drop-shadow-[0_0_5px_rgba(255,230,0,0.8)]' : `text-[${themeColor}] fill-[${themeColor}]/10 drop-shadow-[0_0_5px_${themeColor}]`) : 'text-gray-800 fill-gray-900'} transition-colors"></i><span class="absolute text-[7px] font-bold ${isTrained ? 'text-white' : 'text-gray-500'}" style="padding-top: 1px;">${saveBonusStr}</span></div></div>`; }).join('')}${state.openAttrPopup ? (() => { const key = state.openAttrPopup; const attr = char.attributes[key]; const mod = getMod(attr.value); const skillsList = SKILL_MAP[key] || []; return `<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onclick="toggleAttrPopup(null)"><div class="bg-gray-900 border-2 border-[${themeColor}] rounded-2xl p-6 w-[85%] max-w-[320px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative transform scale-100 animate-in zoom-in-95 duration-200" onclick="event.stopPropagation()"><button onclick="toggleAttrPopup(null)" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i data-lucide="x" size="20"></i></button><div class="text-center mb-6"><h2 class="text-2xl font-display font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_${themeColor}]">${ATTR_FULL_NAMES[key]}</h2><div class="flex justify-center items-center gap-4 mt-2"><div class="text-4xl font-display font-bold text-[${themeColor}]">${attr.value}</div><div class="bg-gray-800 px-4 py-1 rounded-full text-sm font-bold text-white border border-gray-700">Mod ${mod >= 0 ? '+'+mod : mod}</div></div></div><div class="space-y-3 mb-6"><h4 class="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800 pb-2 text-center">Perícias Associadas</h4><div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">${skillsList.length > 0 ? skillsList.map(s => { const isTrained = char.skills.includes(s); const isExpert = (char.expertise || []).includes(s); const pb = getProficiencyBonus(char.level); let totalBonus = mod; if (isExpert) totalBonus += (pb * 2); else if (isTrained) totalBonus += pb; const _nbS = window.calcBonusPericiaNen ? window.calcBonusPericiaNen(char, s) : { total: 0 }; totalBonus += _nbS.total; const _ibS = window.calcBonusPericiaInclinacao ? window.calcBonusPericiaInclinacao(char, s) : { total: 0 }; totalBonus += _ibS.total; /* Iniciativa: soma os bônus de inclinação no número mostrado no botão. */ const _iniB = (s === 'Iniciativa' && window.calcIniciativaBonus) ? window.calcIniciativaBonus(char) : { total: 0, fontes: [] }; totalBonus += _iniB.total; let iconName = 'circle'; let iconColorClass = 'text-gray-600'; if (isExpert) { iconName = 'badge-check'; iconColorClass = 'text-neon-yellow fill-neon-yellow/20'; } else if (isTrained) { iconName = 'check-circle-2'; iconColorClass = `text-[${themeColor}]`; } return `<div class="flex items-center justify-between p-3 rounded-xl border transition-all group ${isTrained ? `bg-[${themeColor}]/10 border-[${themeColor}]/30` : 'bg-gray-950 border-gray-800 hover:border-gray-600'}"><div class="flex items-center gap-3 cursor-pointer" onclick="handleSkillStatus('${s}')"><i data-lucide="${iconName}" size="20" class="${iconColorClass} hover:scale-110 transition-transform"></i><span class="text-xs font-bold uppercase tracking-wide ${isTrained ? 'text-white' : 'text-gray-400'}">${s}</span></div><button class="flex items-center gap-2 px-2 py-1 rounded-lg border ${isExpert ? 'border-neon-yellow/40 bg-neon-yellow/10' : (isTrained ? `border-[${themeColor}]/40 bg-[${themeColor}]/10` : 'border-gray-700 bg-gray-900')} hover:brightness-125 transition-all cursor-pointer" onclick="toggleAttrPopup(null); openRollModeModal('skill', '${s}', '${key}')"><span class="text-xs font-mono font-bold ${isExpert ? 'text-neon-yellow' : (isTrained ? `text-[${themeColor}]` : 'text-gray-400')}">${totalBonus >= 0 ? '+'+totalBonus : totalBonus}</span><i data-lucide="dices" size="14" class="${isExpert ? 'text-neon-yellow' : (isTrained ? `text-[${themeColor}]` : 'text-gray-400')} transition-colors"></i></button></div>` }).join('') : '<span class="text-xs text-gray-600 italic block text-center py-2">Nenhuma perícia associada.</span>'}</div></div><button onclick="toggleAttrPopup(null); openRollModeModal('dice', '${key}', ${mod})" class="w-full py-3 bg-[${themeColor}] text-black font-black font-display tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_${themeColor}40]"><i data-lucide="dices" size="18"></i> ROLAR ATRIBUTO PURO</button></div></div>${state.skillSelectionModal ? `<div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 animate-in fade-in duration-200" onclick="closeSkillModal()"><div class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[85%] max-w-[300px] shadow-2xl relative" onclick="event.stopPropagation()"><h3 class="text-lg font-display font-bold text-white mb-1">${state.skillSelectionModal}</h3><p class="text-xs text-gray-400 mb-4 uppercase tracking-widest">Selecione o nível de treinamento</p><div class="space-y-2"><button onclick="setSkillLevel('${state.skillSelectionModal}', 'remove')" class="w-full p-3 rounded-lg border border-red-900/50 bg-red-500/10 text-red-500 font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"><i data-lucide="x" size="16"></i> Remover Proficiência</button><button onclick="setSkillLevel('${state.skillSelectionModal}', 'trained')" class="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 font-bold text-xs uppercase hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"><i data-lucide="check-circle-2" size="16"></i> Normal (1x Bônus)</button><button onclick="setSkillLevel('${state.skillSelectionModal}', 'expert')" class="w-full p-3 rounded-lg border border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow font-bold text-xs uppercase hover:bg-neon-yellow hover:text-black transition-colors flex items-center gap-2"><i data-lucide="badge-check" size="16"></i> Especialização (2x Bônus)</button></div><button onclick="closeSkillModal()" class="mt-4 w-full py-2 text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest">Cancelar</button></div></div>` : ''}`; })() : ''}</div>`;
                tabContent = `${infoGridHtml}${vitalsGridHtml}${(() => {
                    // ── Cartão da Ênfase e da Ação Protagonista ─────────────────────────
                    // O gasto da Ação Protagonista acontece DEPOIS de ver o d20 — só se
                    // troca um resultado que já se conhece — por isso o botão fica solto
                    // na Ficha, e não dentro do balão de rolagem. Vale para qualquer
                    // rolagem de d20, que foi o pedido.
                    const _temAP = window.temAcaoProtagonista && window.temAcaoProtagonista(char);
                    const _usados = parseInt(char.enfaseUsos) || 0;
                    if (!_temAP && _usados === 0 && !char.enfaseFalha) return '';
                    const _rest = window.enfaseUsosRestantes ? window.enfaseUsosRestantes(char) : 3;
                    const _max = window.ENFASE_USOS_POR_SESSAO || 3;
                    return `<div style="margin:0 12px 10px;padding:9px 12px;border-radius:11px;background:linear-gradient(90deg,#fbbf2418,#fbbf2405);border:1px solid #fbbf2455">
                        <div style="display:flex;align-items:center;gap:10px">
                            <span style="font-size:17px">${_temAP ? '⭐' : '🎯'}</span>
                            <div style="flex:1;line-height:1.4">
                                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;color:#fbbf24;text-transform:uppercase;letter-spacing:1px">${_temAP ? 'Ação Protagonista' : 'Ênfase'}</div>
                                <div style="font-size:8px;color:#9ca3af">${_temAP ? 'Reroll com Vantagem, ou 3d6 num resultado' : 'Guardada: nenhuma'}</div>
                            </div>
                            ${_temAP ? `<button onclick="window._abrirAcaoProtagonista()" style="flex-shrink:0;padding:7px 12px;border-radius:8px;background:#fbbf24;border:none;color:#000;font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:1px;cursor:pointer">Usar</button>` : ''}
                        </div>
                        ${(() => {
                            // A consequência ativa precisa ficar à vista: ela muda TODAS as
                            // rolagens enquanto durar, e nada mais na tela diria isso.
                            const _fe = char.enfaseFalha;
                            if (!_fe || !(_fe.rodadas > 0)) return '';
                            return `<div style="margin-top:7px;padding:6px 9px;border-radius:8px;background:#f8717115;border:1px solid #f8717144;font-size:9px;color:#f87171;line-height:1.5">
                                💥 <b>${_fe.rotulo}</b> — ${_fe.rodadas} rodada${_fe.rodadas !== 1 ? 's' : ''} restante${_fe.rodadas !== 1 ? 's' : ''}${_fe.penalidade ? ` · <b>${_fe.penalidade}</b> em todas as rolagens` : ''}
                            </div>`;
                        })()}
                        <div style="display:flex;align-items:center;gap:8px;margin-top:7px;padding-top:7px;border-top:1px dashed #fbbf2433">
                            <span style="flex:1;font-size:8px;color:#9ca3af">🎯 Ênfase: <b style="color:${_rest > 0 ? '#fbbf24' : '#f87171'}">${_rest}</b> de ${_max} usos nesta sessão</span>
                            <button onclick="window._novaSessaoEnfase()" style="flex-shrink:0;font-size:8px;color:#fbbf24;background:transparent;border:none;cursor:pointer;text-decoration:underline">nova sessão</button>
                        </div>
                    </div>`;
                })()}${(() => {
                    // Active Nen principles quick-use buttons
                    const d = char.nenDominio || {};
                    const aura = char.vitals.aura || 0;
                    const activeAny = (d.ten||0)>0||(d.ren||0)>0||(d.zetsu||0)>0||d.en||d.inp||d.gyo||d.shu||d.ken||d.ko||d.ryu;
                    if (!activeAny) return '';
                    const tc2 = (window.HATSU_DB&&window.HATSU_DB.categorias[char.class]&&window.HATSU_DB.categorias[char.class].cor)||themeColor;

                    // Bônus vivos (já contam Aprimoramento — P.N investido além da Maestria/Superior)
                    const rBon = window.calcRenBonus ? window.calcRenBonus(char) : { grau:1, teste:0, teste1x:0, opcao:1, extra:0 };
                    const zBon = window.calcZetsuBonus ? window.calcZetsuBonus(char) : { auraPct:0, furtividade:0, rodadas:3, opcao:1, extra:0 };
                    const tenRD = window.calcTenRD ? window.calcTenRD(char) : 0;
                    const enB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'en') : { diametro:3, reacoes:2 };
                    const inB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'inp') : { rodadas:1 };
                    const gyB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'gyo') : { attrBonus:3 };
                    const shB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'shu') : { rodadas:1 };
                    const keB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'ken') : { auraCusto:30, reacoes:4 };
                    const koB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'ko') : { caBonus:0 };
                    const ryB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char,'ryu') : { tabelaBonus:0 };

                    const PRINCIPIOS = [
                        { key:'ten', label:'TEN', icon:'🛡️',
                          custo: (() => {
                              const isR = char.class === 'REFORÇO' || char.class === 'INTENSIFICAÇÃO';
                              const nv = d.ten || 1;
                              if (isR) return nv === 2 ? 5 : 10;
                              return 20;
                          })(),
                          efeito: `+${(window.calcTenRDAtivo && window.principioAtivo && window.principioAtivo(char,'ten')) ? window.calcTenRDAtivo(char) : tenRD} RD`,
                           desc: 'Reação ou Ação Bônus — RD contra Corte/Impacto/Explosão', show: (d.ten||0)>0 },
                        { key:'ren', label:'REN', icon:'💪', custo:10,
                          efeito: rBon.opcao===2 && rBon.extra>0 ? `+${rBon.teste} Intim./Arc.` : `+${rBon.grau} Grau dano`,
                          desc: 'Ação Bônus — aumenta grau/passo de dano', show: (d.ren||0)>0 },
                        { key:'zetsu', label:'ZETSU', icon:'👁️', custo:0,
                          efeito: `+${zBon.auraPct}% Aura/${zBon.rodadas}rod`,
                          desc: 'Ação Bônus — recupera aura', show: (d.zetsu||0)>0 },
                        { key:'en', label:'EN', icon:'🔵', custo:10,
                          efeito: `Detecta ${(window.diametroEnAtivo && window.principioAtivo && window.principioAtivo(char,'en')) ? window.diametroEnAtivo(char) : enB.diametro}m`,
                          desc: `10% + ${enB.reacoes} Reações`, show: !!d.en },
                        { key:'inp', label:'IN', icon:'🌑', custo:5,
                          efeito: `Oculta ${inB.rodadas}rod`, desc: '5% por rodada', show: !!d.inp },
                        { key:'gyo', label:'GYO', icon:'🔍', custo:10,
                          efeito: `Ver aura/oculto (+${gyB.attrBonus} corp.)`, desc: '10% olhos / 30% corpo', show: !!d.gyo },
                        { key:'shu', label:'SHU', icon:'⚡', custo:10,
                          efeito: (() => {
                              const _s = (window.calcShuAtivo && window.principioAtivo && window.principioAtivo(char,'shu'))
                                  ? window.calcShuAtivo(char) : null;
                              return _s ? `+${_s.dadoDano} dano/+${_s.caBonus} CA ${_s.rodadas}rod`
                                        : `+1d4 dano+CA ${shB.rodadas}rod`;
                          })(),
                          desc: '10% em objeto 1m', show: !!d.shu },
                        { key:'ken', label:'KEN', icon:'🏰', custo: keB.auraCusto,
                          efeito: `CA ×${(window.multiplicadorKen && window.principioAtivo && window.principioAtivo(char,'ken')) ? window.multiplicadorKen(char) : 2} por 2rod`,
                          desc: `${keB.auraCusto}% + ${keB.reacoes} Reações`, show: !!d.ken },
                        { key:'ko', label:'KO', icon:'🔥', custo:30,
                          efeito: `Dano ×${window.KO_MULTIPLICADOR || 3}, CA −80%${koB.caBonus>0?` (+${koB.caBonus})`:''}`, desc: '30% Aura', show: !!d.ko },
                        { key:'ryu', label:'RYU', icon:'🌊', custo:30,
                          efeito: (() => {
                              // Com o RYU ligado mostra a linha do turno; desligado, a inicial.
                              const _r = window.calcRyuAtivo ? window.calcRyuAtivo(char) : null;
                              return _r ? `+${_r.ca} CA/+${_r.ataqueDano} Atq` : `+3 CA/Atq${ryB.tabelaBonus>0?` (+${ryB.tabelaBonus})`:''}`;
                          })(),
                          desc: `30% Aura, ${window.RYU_TURNOS_MAX||6} turnos`, show: !!d.ryu },
                    ].filter(p => p.show);

                    const btns = PRINCIPIOS.map(p => {
                        // Princípio ATIVO ganha destaque e o clique passa a DESLIGAR.
                        // O desligamento é manual: o app não acompanha as rodadas da mesa.
                        const ativo = window.principioAtivo && window.principioAtivo(char, p.key);
                        // ZETSU custa 0 e serve de carga: sempre pode ser iniciado.
                        const canAct = ativo || p.key === 'zetsu' || aura >= p.custo;
                        const col = ativo ? '#4ade80' : (canAct ? tc2 : '#374151');
                        // Princípio escalável (TEN, EN, KEN) abre o balão de pacotes, para o
                        // jogador decidir quanta aura e quantas Reações vai pagar. Os outros
                        // continuam ativando com um clique, no custo fechado.
                        const _esc = window.principioEscalavel && window.principioEscalavel(p.key);
                        // O RYU entra na mesma categoria do SHU: tem uma escolha a fazer
                        // antes de ligar (qual tabela seguir), então abre balão em vez de
                        // ativar direto.
                        const acao = ativo
                            ? `window._desativarPrincipio('${p.key}')`
                            : (p.key === 'shu'
                                ? `window._abrirMenuShu()`
                                : (p.key === 'ryu'
                                    ? `window._abrirTabelaRyu()`
                                    : (_esc
                                        ? `window._abrirEscalaPrincipio('${p.key}',${p.custo})`
                                        : `window._activatePrincipio('${p.key}',${p.custo})`)));
                        return `<button onclick="${acao}"
                            style="display:flex;flex-direction:column;align-items:center;padding:8px 6px;border-radius:10px;border:1.5px solid ${col}44;background:${col}11;cursor:${canAct?'pointer':'not-allowed'};opacity:${canAct?1:0.5};min-width:56px;flex:1;transition:all .15s"
                            title="${ativo ? 'ATIVO — clique para desligar' : p.desc}">
                            <span style="font-size:14px;margin-bottom:2px">${p.icon}${ativo ? ' ✓' : ''}</span>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:7px;color:${col};text-transform:uppercase">${p.label}</span>
                            <span style="font-size:7px;color:#6b7280;margin-top:1px">${p.custo>0?p.custo+'%':p.efeito}</span>
                            <span style="font-size:7px;color:${col};font-weight:700;margin-top:1px">${p.efeito}</span>
                        </button>`;
                    }).join('');

                    return `<div style="padding:8px 12px;border-bottom:1px solid #111827;background:#0a0f1a">
                        ${(() => {
                            // Faixa dos princípios ligados, com o botão de desligar tudo.
                            // Serve de lembrete: como o desligamento é manual, é fácil esquecer
                            // um princípio aceso depois do combate.
                            const at = char.principiosAtivos || {};
                            const ligados = Object.keys(at).filter(k => at[k]);
                            if (!ligados.length) return '';
                            const nomes = ligados.map(k => {
                                const p = PRINCIPIOS.find(x => x.key === k);
                                const n = p ? p.label : k.toUpperCase();
                                const rod = (char.principiosRodadas || {})[k];
                                // ZETSU é carga: mostra quanto falta para receber o benefício,
                                // não quanto falta para expirar.
                                const suf = rod == null ? '' : (k === 'zetsu' ? (' em ' + rod + 'r') : (' ' + rod + 'r'));
                                return (k === 'gyo' && char.gyoAlvo ? (n + ' (' + char.gyoAlvo + ')') : n) + suf;
                            }).join(', ');
                            // O container externo NÃO é flex: antes ele era, e a linha era
                            // fechada cedo para caber o botão de passar rodada, sobrando uma
                            // </div>. Esse fechamento a mais quebrava o layout e engolia a
                            // barra inferior de abas do app.
                            return `<div style="background:#4ade8015;border:1px solid #4ade8044;border-radius:9px;padding:7px 10px;margin-bottom:8px">
                                <div style="display:flex;align-items:center;gap:8px">
                                    <div style="flex:1;font-size:9px;color:#4ade80;font-weight:700;line-height:1.4">⚡ Ativo: ${nomes}</div>
                                    <button onclick="window._desativarTodosPrincipios()" style="flex-shrink:0;padding:4px 9px;border-radius:6px;background:transparent;border:1px solid #4ade8055;color:#4ade80;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">Desligar tudo</button>
                                </div>
                                <button onclick="window._passarRodada()" style="width:100%;margin-top:7px;padding:8px;border-radius:8px;background:#4ade8022;border:1px solid #4ade8066;color:#4ade80;font-family:'Orbitron',sans-serif;font-weight:900;font-size:8px;text-transform:uppercase;letter-spacing:1px;cursor:pointer">⏭ Passar rodada${char.rodadaAtual ? ' (rodada ' + char.rodadaAtual + ')' : ''}</button>
                                ${(function () {
                                    // Faixa do RYU: ele é o único princípio que anda em TURNOS,
                                    // então ganha o próprio botão ao lado do "Passar rodada".
                                    // Mostra a linha vigente para o jogador conferir o que a ficha
                                    // já está somando sozinha na CA, no acerto e no dano.
                                    const _r = window.calcRyuAtivo ? window.calcRyuAtivo(char) : null;
                                    if (!_r) return '';
                                    const _max = window.RYU_TURNOS_MAX || 6;
                                    return `<div style="margin-top:7px;background:#38bdf815;border:1px solid #38bdf844;border-radius:8px;padding:7px 9px;display:flex;align-items:center;gap:8px">
                                        <div style="flex:1;line-height:1.5">
                                            <div style="font-size:9px;color:#38bdf8;font-weight:700">🌊 RYU — ${_r.tabela} · turno ${_r.turno}/${_max}</div>
                                            <div style="font-size:8px;color:#7dd3fc;font-weight:600">+${_r.ca} CA · +${_r.ataqueDano} Ataque e Dano${_r.temReacoes ? ' · +' + _r.reacoes + ' Reações' : ''}</div>
                                        </div>
                                        <button onclick="window._passarTurnoRyu()" style="flex-shrink:0;padding:6px 10px;border-radius:7px;background:#38bdf822;border:1px solid #38bdf866;color:#38bdf8;font-family:'Orbitron',sans-serif;font-weight:900;font-size:8px;text-transform:uppercase;letter-spacing:1px;cursor:pointer">⏭ ${_r.ultimoTurno ? 'Encerrar' : 'Passar turno'}</button>
                                    </div>`;
                                })()}
                            </div>`;
                        })()}
                        ${(() => {
                            // ── Hatsus na mesma aba dos Princípios ─────────────────────────────
                            // Assim o jogador controla tudo de um lugar, sem abrir cada Hatsu.
                            // Os desativados piscam na cor do TEMA (que segue a categoria de Nen).
                            const ha = char.hatsusAtivos || {};
                            const lista = (char.hatsus || []);
                            if (!lista.length) return '';
                            const nAtivos = Object.keys(ha).filter(k => ha[k]).length;
                            const html = lista.map((h, i) => {
                                const a = ha[i];
                                if (a) {
                                    const txt = a.constante ? 'constante' : ('restam ' + (a.rodadas || 0) + '/' + a.max + ' rod.');
                                    // ── rm_e12 Aura Condensada ──────────────────────────────────────
                                    // Fica aqui, e não na tela do Hatsu, porque a reserva é decidida
                                    // DURANTE o combate: é no mesmo lugar onde o jogador já desliga o
                                    // Hatsu e passa a rodada. Mostra os dois destinos lado a lado,
                                    // com o número que cada um entrega, para a escolha ser informada.
                                    const _e12Html = (function () {
                                        if (!window.tetoAuraCondensada) return '';
                                        const teto = window.tetoAuraCondensada(h);
                                        if (!teto) return '';
                                        const res = window.reservaAuraCondensada(a);
                                        const passos = window.passosAuraCondensada(res.pct);
                                        const espaco = window.grauDanoDisponivel ? window.grauDanoDisponivel(h, char) : 0;
                                        const grausReais = (espaco === Infinity) ? passos : Math.min(passos, espaco);
                                        const auraOk = (char.vitals.aura || 0) >= window.AURA_CONDENSADA_PASSO;
                                        const cheio = res.pct >= teto;

                                        let corpo = '';
                                        if (res.destino === 'rd') {
                                            corpo = '<div style="font-size:9px;font-weight:900;color:#60a5fa">🛡 ' + passos
                                                + ' de RD ativos <span style="font-weight:600;color:#6b7280">(' + res.pct + '% guardados)</span></div>'
                                                + '<div style="font-size:8px;color:#4b5563">Aparece no cálculo de Dano Recebido enquanto o Hatsu durar.</div>';
                                        } else if (res.destino === 'dano') {
                                            corpo = '<div style="font-size:9px;font-weight:900;color:#f87171">⚔ +' + grausReais
                                                + ' Grau(s) na próxima rolagem de dano'
                                                + (grausReais < passos ? ' <span style="font-weight:600;color:#fbbf24">(teto do nível cortou ' + (passos - grausReais) + ')</span>' : '')
                                                + '</div>'
                                                + '<button onclick="window._hDesarmarAuraCondensada(' + i + ')" style="margin-top:4px;padding:3px 8px;border-radius:6px;background:transparent;border:1px solid #37415188;color:#9ca3af;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">↩ Trocar destino</button>';
                                        } else if (res.pct > 0) {
                                            corpo = '<div style="font-size:9px;font-weight:900;color:#fbbf24">🔋 ' + res.pct + '% guardados'
                                                + '<span style="font-weight:600;color:#6b7280"> de ' + teto + '%</span></div>'
                                                + '<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">'
                                                + (cheio || !auraOk ? '' : '<button onclick="window._hReservarAuraCondensada(' + i + ')" style="padding:4px 8px;border-radius:6px;background:#fbbf2418;border:1px solid #fbbf2455;color:#fbbf24;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">+5%</button>')
                                                + '<button onclick="window._hUsarAuraCondensada(' + i + ',\'dano\')" style="padding:4px 8px;border-radius:6px;background:#f8717118;border:1px solid #f8717155;color:#f87171;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">⚔ +'
                                                + grausReais + ' Grau</button>'
                                                + '<button onclick="window._hUsarAuraCondensada(' + i + ',\'rd\')" style="padding:4px 8px;border-radius:6px;background:#60a5fa18;border:1px solid #60a5fa55;color:#60a5fa;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">🛡 '
                                                + passos + ' RD</button>'
                                                + '</div>'
                                                + (grausReais < passos ? '<div style="font-size:8px;color:#fbbf24;margin-top:3px">⚠ O teto de Grau do nível só aceita +' + grausReais + '. Como RD valem ' + passos + '.</div>' : '');
                                        } else {
                                            corpo = '<div style="display:flex;align-items:center;gap:6px">'
                                                + '<div style="flex:1;min-width:0;font-size:8px;color:#6b7280">🔋 Aura Condensada — até ' + teto + '%, 5% por clique</div>'
                                                + (auraOk
                                                    ? '<button onclick="window._hReservarAuraCondensada(' + i + ')" style="flex-shrink:0;padding:4px 8px;border-radius:6px;background:#fbbf2418;border:1px solid #fbbf2455;color:#fbbf24;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">Reservar +5%</button>'
                                                    : '<span style="flex-shrink:0;font-size:8px;color:#f87171">aura insuficiente</span>')
                                                + '</div>';
                                        }
                                        return '<div style="margin-top:5px;padding-top:5px;border-top:1px dashed #4ade8033">' + corpo + '</div>';
                                    })();
                                    return `<div style="background:#4ade8012;border:1px solid #4ade8033;border-radius:8px;padding:6px 9px;margin-bottom:5px">
                                        <div style="display:flex;align-items:center;gap:8px">
                                            <div style="flex:1;min-width:0;font-size:9px;color:#4ade80;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">⚡ ${h.nome || ('Hatsu ' + (i+1))} <span style="color:#6b7280;font-weight:400">(${txt})</span></div>
                                            <button onclick="window._desativarHatsu(${i})" style="flex-shrink:0;padding:3px 8px;border-radius:6px;background:transparent;border:1px solid #4ade8055;color:#4ade80;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">Desligar</button>
                                        </div>
                                        ${_e12Html}
                                    </div>`;
                                }
                                return `<div class="aviso-tag-piscando" style="display:flex;align-items:center;gap:8px;background:${tc2}12;border:1px solid ${tc2}33;border-radius:8px;padding:6px 9px;margin-bottom:5px">
                                    <div style="flex:1;min-width:0;font-size:9px;color:${tc2};font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.nome || ('Hatsu ' + (i+1))}</div>
                                    <button onclick="window._ativarHatsuDaFicha(${i})" style="flex-shrink:0;padding:3px 9px;border-radius:6px;background:${tc2};border:none;color:#000;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer">⚡ Ativar</button>
                                </div>`;
                            }).join('');
                            return `<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🌀 Hatsus${nAtivos ? ' — ' + nAtivos + ' ativo(s)' : ''}</div>${html}<div style="height:8px"></div>`;
                        })()}
                        ${(() => {
                            // ── CA vinda das Inclinações de Combate ────────────────
                            // O que é permanente já está somado no número da CA lá em cima, mas o
                            // jogador precisa ver DE ONDE vem — um −1 que aparece sozinho parece bug.
                            // O condicional nunca entra no total: a ficha não sabe quem é o alvo
                            // marcado nem se o REN/SHU está neste ataque.
                            if (!window.calcBonusCAInclinacao) return '';
                            const _cb = window.calcBonusCAInclinacao(char);
                            if (!_cb.fontes.length && !_cb.condicionais.length) return '';
                            const _sin = v => (v >= 0 ? '+' + v : String(v));
                            return `<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🛡 CA — Inclinações</div>
                            <div style="background:#60a5fa10;border:1px solid #60a5fa33;border-radius:8px;padding:6px 9px;margin-bottom:8px">
                                ${_cb.fontes.length ? `<div style="display:flex;align-items:center;gap:8px">
                                    <div style="flex:1;min-width:0;font-size:9px;color:#60a5fa;font-weight:700">Já somado na CA</div>
                                    <span style="flex-shrink:0;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;color:#60a5fa">${_sin(_cb.total)}</span>
                                </div>
                                <div style="font-size:8px;color:#4b5563;margin-top:1px">${_cb.fontes.map(f => f.nome + ' ' + _sin(f.valor)).join(' · ')}</div>` : ''}
                                ${_cb.condicionais.map(c => `<div style="font-size:8px;color:#fbbf24;margin-top:2px">+ ${c.nome} ${_sin(c.valor)} — ${c.condicao} (aplicar na mão)</div>`).join('')}
                            </div>`;
                        })()}
                        ${(() => {
                            // ── Bônus nos resultados das reações ───────────────────────────────
                            // A rolagem de reação (Esquiva, Bloqueio, Assumir Lugar) acontece na
                            // MESA, não aqui. Mas os bônus vêm da ficha — Potencial Liberado,
                            // Instâncias e Inclinações — e o jogador precisa vê-los para aplicar
                            // quando joga sem a mesa aberta, e para conferir quando joga com ela.
                            // calcBonusReacao/resumoBonusReacoes estão em js/data/config.js, que a
                            // mesa também carrega: um cálculo só para os dois lados.
                            if (!window.resumoBonusReacoes) return '';
                            const _rb = window.resumoBonusReacoes(char);
                            if (!_rb.length) return '';
                            return `<div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🛡 Bônus nas Reações</div>
                            ${_rb.map(r => `<div style="background:#60a5fa10;border:1px solid #60a5fa33;border-radius:8px;padding:6px 9px;margin-bottom:5px">
                                <div style="display:flex;align-items:center;gap:8px">
                                    <div style="flex:1;min-width:0;font-size:9px;color:#60a5fa;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.nome}</div>
                                    <span style="flex-shrink:0;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;color:#60a5fa">+${r.total}</span>
                                </div>
                                <div style="font-size:8px;color:#4b5563;margin-top:1px">${r.formula} +${r.total} · ${r.fontes.filter(f => !f.condicional).map(f => f.nome + ' +' + f.valor).join(' · ')}</div>
                                ${r.fontes.filter(f => f.condicional).map(f => `<div style="font-size:8px;color:#fbbf24;margin-top:2px">+ ${f.nome} +${f.valor} — ${f.condicao} (aplicar na mão)</div>`).join('')}
                            </div>`).join('')}
                            <div style="font-size:8px;color:#4b5563;margin-bottom:8px">A rolagem da reação acontece na mesa online; estes bônus somam ao resultado dela.</div>`;
                        })()}
                        <div style="font-size:7px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🔮 Princípios de NEN</div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap">${btns}</div>
                    </div>`;
                })()}${rollModesHtml}${attributesHtml}${(() => {
                    // ── Seção de Ataques ──────────────────────────────────────
                    const weapons = (char.inventory || []).map(item => {
                        const data = findItemData(item.name);
                        if (!data || !data.dano || data.dano === '-' || data.dano.startsWith('+')) return null;
                        return { nome: item.name, dano: data.dano, tipoDano: data.tipo_dano || '', tags: data.tags || [] };
                    }).filter(Boolean);
                    // ── Ataque desarmado: 1d6 com Artista Marcial ou Monge ──────────────────
                    // Os dois antecedentes dizem, com as mesmas palavras, que "seus golpes
                    // desarmados causam 1d6 no lugar de 1d4": Artista Marcial (Guarda Costas)
                    // e Monge (Recluso). A escolha já era gravada em char.backgroundFeature na
                    // criação, mas o dano estava escrito fixo como 1d4 e nunca a consultava.
                    const _FEATS_1D6 = ['Artista Marcial', 'Monge'];
                    const _featNome = typeof char.backgroundFeature === 'string'
                        ? char.backgroundFeature
                        : ((char.backgroundFeature || {}).nome || '');
                    const _desarmadoMarcial = _FEATS_1D6.indexOf(String(_featNome).trim()) >= 0;
                    const _danoDesarmado = _desarmadoMarcial ? '1d6' : '1d4';
                    const attacksList = [{ nome: 'Ataque Desarmado' + (_desarmadoMarcial ? ' (Marcial)' : ''), dano: _danoDesarmado, tipoDano: 'Impacto', tags: [] }, ...weapons];
                    // Margem de crítico: quadradinho em cada linha de ataque. Fica amarelo
                    // quando algo reduziu a margem, cinza no 20 natural.
                    const _mc = window.calcMargemCritico ? window.calcMargemCritico(char) : { valor: 20, base: 20, piso: 18, fontes: [], condicionais: [], perdidoNoPiso: 0 };
                    const _mcCor = _mc.valor < _mc.base ? '#fbbf24' : '#4b5563';
                    const _mcHtml = `<div style="flex-shrink:0;width:34px;text-align:center;background:#0d1117;border:1px solid ${_mcCor}44;border-radius:7px;padding:3px 0" title="Margem de acerto crítico (piso ${_mc.piso})">
                        <div style="font-size:7px;font-weight:900;color:${_mcCor};letter-spacing:.5px">CRÍT</div>
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;color:${_mc.valor < _mc.base ? '#fbbf24' : '#9ca3af'}">${_mc.valor}+</div>
                    </div>`;
                    // SHU envolve UM item. Quando esse item é uma das armas da lista, o dado
                    // extra aparece na linha dela — e só nela, senão o selo mentiria nas outras.
                    const _shuAt = (window.calcShuAtivo && window.principioAtivo && window.principioAtivo(char, 'shu'))
                        ? window.calcShuAtivo(char) : null;
                    const rows = attacksList.map(w => {
                        const _temShu = !!(_shuAt && _shuAt.item && _shuAt.item === w.nome);
                        const tagsHtml = ((w.tags || []).slice(0, 2).map(t => `<span style="font-size:7px;background:#111827;color:#6b7280;padding:1px 5px;border-radius:3px;border:1px solid #1f2937">${t}</span>`).join(''))
                            + (_temShu ? `<span style="font-size:7px;background:#a78bfa22;color:#a78bfa;padding:1px 5px;border-radius:3px;border:1px solid #a78bfa55">⚡ SHU +${_shuAt.dadoDano}${_shuAt.cerco ? ' · Cerco' : ''}</span>` : '');
                        const safeNome = w.nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                        const safeDano = w.dano.replace(/'/g, "\\'");
                        const safeTipo = (w.tipoDano || '').replace(/'/g, "\\'");
                        return `<div style="display:flex;align-items:center;gap:8px;background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:8px 10px;margin-bottom:6px">
                            <div style="flex:1;min-width:0">
                                <div style="font-size:11px;font-weight:700;color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.nome}</div>
                                <div style="display:flex;gap:3px;margin-top:2px;flex-wrap:wrap">${tagsHtml}</div>
                            </div>
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:#f87171;flex-shrink:0;margin:0 4px">${w.dano}</div>
                            ${_mcHtml}
                            <button onclick="openAttackModal('${safeNome}','${safeDano}','${safeTipo}')" style="flex-shrink:0;background:#ef444422;border:1px solid #ef444455;color:#f87171;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:900;cursor:pointer;letter-spacing:.5px">⚔️</button>
                        </div>`;
                    }).join('');
                    // ── Margem de crítico: coluna ao lado do dano ──────────────────────
                    // Vale para todos os ataques (Aura Afiada e Assassino Veterano não
                    // distinguem arma), então o número é o mesmo em todas as linhas. A do
                    // Executor é condicional (só no golpe decisivo) e sai como nota abaixo.
                    const _mcNota = (_mc.condicionais || []).length
                        ? `<div style="font-size:8px;color:#fbbf24;margin-top:2px">🎯 ${_mc.condicionais.map(x => x.nome + ' −' + x.valor + ' (' + x.condicao + ')').join(' · ')}${_mc.valor <= _mc.piso ? ' — já no piso ' + _mc.piso : ''}</div>`
                        : '';
                    const _mcFontes = (_mc.fontes || []).length
                        ? `<div style="font-size:8px;color:#4b5563;margin-top:2px">🎯 Margem ${_mc.valor}: ${_mc.fontes.map(f => f.nome + ' −' + f.valor).join(' · ')}${_mc.perdidoNoPiso > 0 ? ` · piso ${_mc.piso} cortou −${_mc.perdidoNoPiso}` : ''}</div>`
                        : '';
                    const weaponsSection = `<div style="margin:0 16px 20px"><div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;border-top:1px solid #1f2937;padding-top:12px">⚔️ Ataques</div>${rows}${_mcFontes}${_mcNota}</div>`;
                    if (!state.attackModal) return weaponsSection;
                    // ── Modal de escolha FOR/DES ──────────────────────────────
                    const wm = state.attackModal;
                    // Atributo EFETIVO nos ataques com arma, para GYO e Aumento de Atributo
                    // valerem também aqui — antes só o Hatsu enxergava esses bônus.
                    const forMod = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, 'FOR').mod : getMod((char.attributes.FOR || {}).value || 10);
                    const desMod = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, 'DES').mod : getMod((char.attributes.DES || {}).value || 10);
                    const pb2 = getProficiencyBonus(char.level);
                    const safeNome2 = wm.nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    const safeDano2 = wm.dano.replace(/'/g, "\\'");
                    const modalHtml = `<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onclick="closeAttackModal()">
                        <div style="background:#0d1117;border:2px solid #ef4444;border-radius:16px;padding:20px;width:80%;max-width:300px;box-shadow:0 0 40px #ef444440" onclick="event.stopPropagation()">
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${wm.nome}</div>
                            <div style="font-size:9px;color:#6b7280;margin-bottom:16px">Dano: <b style="color:#f87171">${wm.dano}</b> ${wm.tipoDano} · Qual modificador usar no ataque?</div>
                            <div style="display:flex;flex-direction:column;gap:8px">
                                <button onclick="pickAttackAttr('${safeNome2}','${safeDano2}','FOR')" style="width:100%;padding:13px;border-radius:10px;background:#ef444422;border:1px solid #ef444466;color:#f87171;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px">
                                    💪 FORÇA (${forMod >= 0 ? '+' : ''}${forMod}) · Ataque ${(forMod + pb2) >= 0 ? '+' : ''}${forMod + pb2}
                                </button>
                                <button onclick="pickAttackAttr('${safeNome2}','${safeDano2}','DES')" style="width:100%;padding:13px;border-radius:10px;background:#38bdf822;border:1px solid #38bdf866;color:#38bdf8;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px">
                                    💨 DESTREZA (${desMod >= 0 ? '+' : ''}${desMod}) · Ataque ${(desMod + pb2) >= 0 ? '+' : ''}${desMod + pb2}
                                </button>
                            </div>
                            <button onclick="closeAttackModal()" style="width:100%;margin-top:10px;padding:8px;border-radius:8px;background:transparent;border:1px solid #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">Cancelar</button>
                        </div>
                    </div>`;
                    return weaponsSection + modalHtml;
                })()}`;
            } else if (state.activeTab === 'BIO') {
                const bioData = char.bio || {};
                const sections = [ { id: 'personality', label: 'Personalidade', icon: 'fingerprint' }, { id: 'history', label: 'História', icon: 'scroll' }, { id: 'organizations', label: 'Organizações', icon: 'building-2' }, { id: 'enemies', label: 'Inimigos', icon: 'skull' }, { id: 'allies', label: 'Aliados', icon: 'heart-handshake' } ];
                tabContent = `<div class="p-4 space-y-3"><div class="text-center mb-4"><h2 class="text-lg font-display font-bold text-white uppercase tracking-widest">Biografia</h2><p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Informações Detalhadas</p></div>${sections.map(section => { const isOpen = state.bioAccordionOpen === section.id; const isPersonality = section.id === 'personality'; let hasContent = false; if (isPersonality) { hasContent = (bioData.personality_traits || bioData.personality_goals || bioData.personality_hates || bioData.personality_likes || bioData.personality); } else { hasContent = bioData[section.id] && bioData[section.id].trim().length > 0; } const borderColor = isOpen ? `border-[${themeColor}]` : 'border-gray-800'; const headerColor = isOpen ? `text-[${themeColor}]` : (hasContent ? 'text-white' : 'text-gray-500'); const renderSubField = (key, label, placeholder, legacyVal = '') => `<div class="mb-3 last:mb-0 w-full"><label class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block pl-1">${label}</label><textarea class="w-full h-20 bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 focus:border-[${themeColor}] focus:shadow-[0_0_10px_rgba(var(--theme-rgb),0.1)] transition-all custom-scrollbar resize-none leading-relaxed" placeholder="${placeholder}" onblur="updateBio('${key}', this.value)">${bioData[key] || legacyVal || ''}</textarea></div>`; return `<div class="bg-gray-900 border ${borderColor} rounded-xl transition-all duration-300"><div onclick="toggleBioAccordion('${section.id}')" class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 rounded-xl"><div class="flex items-center gap-3"><div class="bg-gray-950 p-2 rounded-lg border border-gray-800"><i data-lucide="${section.icon}" size="18" class="${headerColor}"></i></div><div><h3 class="font-display font-bold text-sm uppercase tracking-wider ${headerColor}">${section.label}</h3>${hasContent && !isOpen ? '<span class="text-[8px] text-gray-500 bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800 font-bold uppercase tracking-widest">Preenchido</span>' : ''}</div></div><div class="transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-gray-600'}"><i data-lucide="chevron-down" size="18"></i></div></div><div class="accordion-content ${isOpen ? 'open' : ''}"><div class="px-4 pb-4"><div class="h-px w-full bg-gray-800 mb-3"></div>${isPersonality ? `${renderSubField('personality_traits', 'Traços de Personalidade', 'Descreva como seu personagem se comporta...', bioData.personality)}${renderSubField('personality_goals', 'Sonho / Objetivo', 'Qual o maior desejo do seu personagem?')}<div class="flex gap-3">${renderSubField('personality_hates', 'O que odeio', 'O que te tira do sério...')}${renderSubField('personality_likes', 'O que gosto', 'O que te agrada...')}</div>` : `<textarea class="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 focus:border-[${themeColor}] focus:shadow-[0_0_10px_rgba(var(--theme-rgb),0.1)] transition-all custom-scrollbar resize-none leading-relaxed" placeholder="Escreva aqui..." onblur="updateBio('${section.id}', this.value)">${bioData[section.id] || ''}</textarea>`}</div></div></div>`; }).join('')}</div>`;
            } else if (state.activeTab === 'NEN') {
                //Menu Nen
                const diagramHtml = renderNenHexagon(char.class, false);
                const currentClass = SYSTEM_DB.classes.find(c => c.id === char.class);
                const catDB = window.HATSU_DB && window.HATSU_DB.categorias[char.class];
                const catColor = catDB ? catDB.cor : themeColor;
                const savedHatsus = char.hatsus || [];

                // Build hatsus list HTML — fica no topo da aba (junto com o botão de criar, ver
                // hatsuBoxHtml abaixo); com mais de 1 Hatsu, os cards ficam "guardados" atrás de uma
                // barra em accordion ("Hatsus (N)") para não empurrar o resto da aba pra baixo.
                let hatsuListHtml = '';
                if (savedHatsus.length > 0) {
                    const _tipoIconsMap = { hostil:'⚔️', suporte:'🛡️', versatil:'🌀', instantaneo:'⚡', longa_duracao:'⏳' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'✦').join(''); } });
                    const hatsuCardsHtml = savedHatsus.map((h, idx) => {
                            const pnMax = window.calcularPHBase ? window.calcularPHBase(h.nivel||1) : 6;
                            const efTotal = (h.efeitos||[]).length;
                            const rTotal  = (h.restricoes||[]).length;
                            return `<div onclick="openHatsuDetail(${idx})" style="background:#0a0f1a;border:2px solid ${catColor}44;border-radius:14px;padding:14px;margin-bottom:10px;position:relative;cursor:pointer;transition:border-color .2s,box-shadow .2s" onmouseover="this.style.borderColor='${catColor}99';this.style.boxShadow='0 0 16px ${catColor}22'" onmouseout="this.style.borderColor='${catColor}44';this.style.boxShadow='none'">
                                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
                                    <div style="flex:1;min-width:0">
                                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${catColor};text-transform:uppercase;letter-spacing:1px;line-height:1.2">${h.nome||'Sem nome'}</div>
                                        <div style="font-size:8px;color:#4b5563;margin-top:3px">${tipoIcons[h.tipo]||'✦'} ${h.tipo||'—'} · Nível ${h.nivel||'?'} · ${h.criadoEm||''}</div>
                                    </div>
                                    <button onclick="event.stopPropagation();deleteHatsuConfirm(${idx},'list')"
                                        style="flex-shrink:0;background:#1f2937;border:1px solid #374151;border-radius:8px;color:#6b7280;font-size:11px;padding:4px 8px;cursor:pointer;line-height:1">✕</button>
                                </div>
                                ${h.descricao?`<div style="font-size:9px;color:#6b7280;font-style:italic;margin-bottom:8px;line-height:1.5">"${h.descricao}"</div>`:''}
                                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
                                    <div style="background:#111827;border-radius:8px;padding:6px;text-align:center">
                                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700">P.N</div>
                                        <div style="font-weight:900;color:#fff;font-size:13px">${h.pnUsados||0}<span style="color:#374151;font-size:8px">/${pnMax}</span></div>
                                    </div>
                                    <div style="background:#111827;border-radius:8px;padding:6px;text-align:center">
                                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700">Efeit.</div>
                                        <div style="font-weight:900;color:${catColor};font-size:13px">${efTotal}</div>
                                    </div>
                                    <div style="background:#111827;border-radius:8px;padding:6px;text-align:center">
                                        <div style="font-size:8px;color:#374151;text-transform:uppercase;font-weight:700">Restr.</div>
                                        <div style="font-weight:900;color:#ef4444;font-size:13px">${rTotal}</div>
                                    </div>
                                </div>
                                <div style="text-align:right;font-size:8px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px">Ver detalhes ›</div>
                            </div>`;
                        }).join('');

                    if (savedHatsus.length > 1) {
                        const isHatsuListOpen = !!state.hatsuListOpen;
                        hatsuListHtml = `<div style="width:100%;padding:0 4px;margin-bottom:16px">
                            <div onclick="toggleHatsuAccordion()" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:12px 14px;background:#0a0f1a;border:2px solid ${catColor}44;border-radius:14px;transition:border-color .2s">
                                <span style="font-size:10px;font-weight:900;color:${catColor};text-transform:uppercase;letter-spacing:2px">⚡ Hatsus (${savedHatsus.length})</span>
                                <span style="transition:transform .3s;transform:rotate(${isHatsuListOpen ? 180 : 0}deg);color:${catColor};font-size:12px">▾</span>
                            </div>
                            <div class="accordion-content ${isHatsuListOpen ? 'open' : ''}" style="margin-top:10px">
                                ${hatsuCardsHtml}
                            </div>
                        </div>`;
                    } else {
                        hatsuListHtml = `<div style="width:100%;padding:0 4px;margin-bottom:16px">
                            <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center">⚡ Hatsus Criados</div>
                            ${hatsuCardsHtml}
                        </div>`;
                    }
                }
                // Caixa de Hatsu (lista + botão de criar) — vai pro topo da aba, antes de tudo o resto.
                const hatsuBoxHtml = `${hatsuListHtml}
                    <div class="btn-hatsu-container" style="width:100%;padding:0 4px;margin-bottom:16px">
                        <button class="btn-hatsu" onclick="openHatsuCreator()">
                            <span class="text-xl">+</span> CRIAR HATSU
                        </button>
                    </div>`;

                tabContent = `
                    <div class="p-4 h-full flex flex-col items-center" style="overflow-y:auto">
                        ${hatsuBoxHtml}

                        <div class="text-center mb-4" style="width:100%">
                            <h3 class="text-2xl font-display font-black tracking-widest uppercase" style="color:${themeColor};text-shadow:0 0 10px ${themeColor}40">${char.class}</h3>
                        </div>

                        ${diagramHtml}

                        <div class="text-center px-4 bg-gray-900/50 p-3 rounded-xl border border-gray-800/50 max-w-sm mx-auto mb-4">
                            <p class="text-xs font-medium text-gray-400 italic">"${currentClass.desc}"</p>
                        </div>

                        ${(() => {
                            if (!char.afinidade && !char.genialidade) return '';
                            const af = char.afinidade;
                            const gn = char.genialidade;
                            const roll = char.genialidadeRoll;

                            const afNivel = af <= 20 ? { label:'Baixa', cor:'#6b7280' }
                                : af <= 50 ? { label:'Média', cor:'#fbbf24' }
                                : af <= 80 ? { label:'Alta', cor:'#4ade80' }
                                : { label:'Excepcional', cor:'#00f0ff' };

                            const gnTiers = {
                                'Normal':     { cor:'#6b7280', icon:'⚔️', beneficio: 'Evolução padrão do sistema.' },
                                'Talentoso': { cor:'#60a5fa', icon:'💠', beneficio: '+2 Graus de Potência no Primeiro Hatsu.' },
                                'Gênio':     { cor:'#fbbf24', icon:'✨', beneficio: 'XP 1,5× em qualquer situação.' },
                                'Ultimate':  { cor:'#ff4df7', icon:'👑', beneficio: 'XP dobrado + +5 Graus de Potência livres.' },
                                // retrocompatibilidade com nomes antigos
                                'Ótimo':     { cor:'#6b7280', icon:'⚔️', beneficio: 'Evolução padrão do sistema.' },
                                'Excelente': { cor:'#a78bfa', icon:'💜', beneficio: '+2 Graus de Potência no Primeiro Hatsu.' },
                            };
                            const gnData = gnTiers[gn] || gnTiers['Normal'];
                            const isSpecial = gn === 'Talentoso' || gn === 'Gênio' || gn === 'Ultimate' || gn === 'Excelente';

                            const benefitBlock = isSpecial ? `
                                <div style="margin-top:8px;background:#0d1117;border:1px solid ${gnData.cor}44;border-radius:8px;padding:8px;text-align:left">
                                    <div style="font-size:8px;font-weight:900;color:${gnData.cor};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">⚡ BENEFÍCIO</div>
                                    <div style="font-size:9px;color:#d1d5db">${gnData.beneficio}</div>
                                </div>` : '';

                            return `<div style="width:100%;margin-bottom:16px;padding:0 4px">
                                <div style="background:#0a0f1a;border:2px solid ${gnData.cor}66;border-radius:12px;padding:14px;text-align:center">
                                    <div style="font-size:7px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🎯 Talento para Proficiência de NEN</div>
                                    <div style="font-size:22px;margin-bottom:4px">${gnData.icon}</div>
                                    <div style="font-size:14px;font-weight:900;font-family:'Orbitron',sans-serif;color:${gnData.cor};text-shadow:0 0 10px ${gnData.cor}">${gn}</div>
                                    ${benefitBlock}
                                </div>
                            </div>`;
                        })()}


                        ${(() => {
                            const pnTotal = window.calcularPHBase ? window.calcularPHBase(char.level) : 6;
                            const pnDominio = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(char) : 0;
                            const pnUsedAll = (char.hatsus||[]).reduce((sum, h) => sum + (h.pnUsados||0), 0);
                            const pnUsedTotal = pnUsedAll + pnDominio;
                            const pnFree = pnTotal - pnUsedTotal;
                            const pct = Math.min(100, Math.round((pnUsedTotal / pnTotal) * 100));
                            const barColor = pnFree <= 0 ? '#ef4444' : pnFree <= 2 ? '#fbbf24' : '#00ff9d';
                            return `<div style="width:100%;padding:0 4px;margin-bottom:14px">
                                <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                                        <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px">⚡ Pool de P.N do Personagem</div>
                                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${barColor}">${pnFree}<span style="font-size:9px;color:#374151"> / ${pnTotal}</span></div>
                                    </div>
                                    <div style="background:#1f2937;border-radius:99px;height:8px;overflow:hidden;margin-bottom:6px">
                                        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:99px;box-shadow:0 0 8px ${barColor}88;transition:width .4s"></div>
                                    </div>
                                    <div style="display:flex;justify-content:space-between">
                                        <span style="font-size:8px;color:#6b7280">${pnUsedAll} P.N Hatsus · ${pnDominio} P.N Domínio</span>
                                        <span style="font-size:8px;color:${pnFree<=0?'#ef4444':'#4b5563'}">${pnFree<=0?'Pool esgotado':pnFree+' livre'+(pnFree!==1?'s':'')}</span>
                                    </div>
                                    ${(char.talentBonus&&char.talentBonus.grausLivres) ? `
                                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1f2937;display:flex;justify-content:space-between;align-items:center">
                                        <span style="font-size:8px;color:#60a5fa;font-weight:700">🔮 Graus de Potência livres</span>
                                        <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#60a5fa">+${char.talentBonus.grausLivres}</span>
                                    </div>` : ''}
                                </div>
                            </div>`;
                        })()}

                        ${(() => {
                            // ── DOMÍNIO DE NEN SECTION ──────────────────────────────
                            const pnTotal = window.calcularPHBase ? window.calcularPHBase(char.level) : 6;
                            const pnDominio = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(char) : 0;
                            const pnHatsu = (char.hatsus||[]).reduce((s,h)=>s+(h.pnUsados||0),0);
                            const pnFree = Math.max(0, pnTotal - pnDominio - pnHatsu);
                            const d = char.nenDominio || {};
                            const tc2 = catColor;

                            // Comprar princípio consome P.N do pool base. Antes a gravação era
                            // direta, SEM conferir se havia P.N disponível: dava para subir
                            // qualquer princípio com o pool zerado ou negativo. Agora valida.
                            const setDom = (key, val) => {
                                return `window._comprarPrincipio('${key}', ${val})`;
                            };

                            const noteBox = (text) => `<div style="background:#0d1117;border:1px dashed #374151;border-radius:8px;padding:6px 8px;margin:0 0 8px;font-size:7px;color:#6b7280;line-height:1.4">💡 ${text}</div>`;

                            // Bloco de "Aprimoramento" — P.N extra investido após a Maestria/Superior.
                            // opcaoInfo = null | { value, labels:[opcao1, opcao2] }
                            const aprimoramentoBox = (key, curExtra, maxExtra, opcaoInfo, bonusText) => {
                                const canUp = curExtra < maxExtra && pnFree > 0;
                                const canDown = curExtra > 0;
                                const opcaoHtml = opcaoInfo ? `<div style="display:flex;gap:4px;margin-bottom:6px">${[1,2].map(v => `<button onclick="${setDom(key+'_opcao', v)}" style="flex:1;padding:4px 3px;border-radius:6px;font-size:7px;font-weight:700;border:1px solid ${opcaoInfo.value===v?'#a78bfa88':'#1f2937'};background:${opcaoInfo.value===v?'#a78bfa22':'transparent'};color:${opcaoInfo.value===v?'#a78bfa':'#6b7280'};cursor:pointer">${opcaoInfo.labels[v-1]}</button>`).join('')}</div>` : '';
                                return `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #2d2440">
                                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                                        <span style="font-size:7px;font-weight:900;color:#a78bfa;text-transform:uppercase;letter-spacing:1px">✦ Aprimoramento</span>
                                        <div style="display:flex;align-items:center;gap:5px">
                                            <button onclick="${setDom(key+'_pn', Math.max(0, curExtra-1))}" ${canDown?'':'disabled'}
                                                style="width:20px;height:20px;border-radius:5px;background:${canDown?'#1f2937':'#111'};border:1px solid #374151;color:${canDown?'#f87171':'#374151'};font-size:12px;cursor:${canDown?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center">−</button>
                                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;min-width:16px;text-align:center;color:#a78bfa">${curExtra}</span>
                                            <button onclick="${setDom(key+'_pn', Math.min(maxExtra, curExtra+1))}" ${canUp?'':'disabled'}
                                                style="width:20px;height:20px;border-radius:5px;background:${canUp?'#a78bfa22':'#111'};border:1px solid ${canUp?'#a78bfa55':'#374151'};color:${canUp?'#a78bfa':'#374151'};font-size:12px;cursor:${canUp?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center">+</button>
                                        </div>
                                    </div>
                                    ${opcaoHtml}
                                    <div style="font-size:8px;color:#c4b5fd;line-height:1.5">${bonusText}</div>
                                    <div style="font-size:7px;color:#4b5563;margin-top:2px">Máx. de P.N aplicáveis neste princípio: 10</div>
                                </div>`;
                            };

                            // Helper: render level selector (0-3) para os Princípios Fundamentais + Aprimoramento pós-Maestria
                            const fundamentalCard = (key, label, icon, desc, levelsData, reqCheck, aprimoramento) => {
                                const cur = d[key] || 0;
                                const canUp = cur < 3 && pnFree > 0 && (reqCheck ? reqCheck(d) : true);
                                const canDown = cur > 0;
                                const levelLabel = ['—','Básico','Intermediário','Maestria'][cur];
                                const levelColor = cur===0?'#374151':cur===1?'#4ade80':cur===2?'#fbbf24':'#ff4df7';
                                return `<div style="background:#0a0f1a;border:1.5px solid ${cur>0?tc2+'66':'#1f2937'};border-radius:12px;padding:12px;margin-bottom:8px">
                                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                                        <div style="display:flex;align-items:center;gap:8px">
                                            <span style="font-size:16px">${icon}</span>
                                            <div>
                                                <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:${cur>0?tc2:'#d1d5db'};text-transform:uppercase">${label}</div>
                                                <div style="font-size:8px;color:#6b7280;margin-top:1px">${desc}</div>
                                            </div>
                                        </div>
                                        <div style="display:flex;align-items:center;gap:6px">
                                            <button onclick="${setDom(key, Math.max(0, cur-1))}" ${canDown?'':'disabled'}
                                                style="width:24px;height:24px;border-radius:6px;background:${canDown?'#1f2937':'#111'};border:1px solid #374151;color:${canDown?'#f87171':'#374151'};font-size:14px;cursor:${canDown?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center">−</button>
                                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;min-width:20px;text-align:center;color:${levelColor}">${cur}</span>
                                            <button onclick="${setDom(key, Math.min(3, cur+1))}" ${canUp?'':'disabled'}
                                                style="width:24px;height:24px;border-radius:6px;background:${canUp?tc2+'22':'#111'};border:1px solid ${canUp?tc2+'55':'#374151'};color:${canUp?tc2:'#374151'};font-size:14px;cursor:${canUp?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center">+</button>
                                        </div>
                                    </div>
                                    <div style="display:flex;gap:4px;margin-bottom:8px">
                                        ${[1,2,3].map(i=>`<div style="flex:1;height:4px;border-radius:2px;background:${cur>=i?levelColor:'#1f2937'};transition:background .2s"></div>`).join('')}
                                    </div>
                                    ${cur > 0 ? `<div style="font-size:8px;font-weight:700;color:${levelColor};margin-bottom:4px">● ${levelLabel}</div>
                                    <div style="font-size:8px;color:#9ca3af;line-height:1.5">${levelsData[cur-1]}</div>` : `<div style="font-size:8px;color:#374151;font-style:italic">Não desbloqueado (custa 1 P.N por nível)</div>`}
                                    ${cur === 3 && aprimoramento ? aprimoramento : ''}
                                </div>`;
                            };

                            // Helper: Princípio/Técnica Avançada — desbloqueio (1 P.N) → Superior (+1 P.N) → Aprimoramento (P.N extra)
                            const advancedCard = (key, label, icon, desc, effect, req, reqMet, supInfo) => {
                                const active = !!(d[key]);
                                const canBuy = !active && pnFree > 0 && reqMet;
                                const sup = active && !!(d[key + '_sup']);
                                const canBuySup = active && !sup && pnFree > 0 && supInfo;
                                return `<div style="background:#0a0f1a;border:1.5px solid ${active?'#a78bfa44':'#1f2937'};border-radius:12px;padding:10px;margin-bottom:6px;opacity:${reqMet||active?1:0.45}">
                                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                                        <div style="flex:1">
                                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                                                <span style="font-size:13px">${icon}</span>
                                                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:${active?'#a78bfa':'#d1d5db'};text-transform:uppercase">${label}</span>
                                                ${active?`<span style="font-size:7px;font-weight:900;padding:1px 5px;background:#a78bfa22;color:#a78bfa;border-radius:4px">✓ ATIVO</span>`:''}
                                                ${sup?`<span style="font-size:7px;font-weight:900;padding:1px 5px;background:#ff4df722;color:#ff4df7;border-radius:4px">★ SUPERIOR</span>`:''}
                                            </div>
                                            <div style="font-size:8px;color:#6b7280;margin-bottom:4px">${desc}</div>
                                            ${req?`<div style="font-size:7px;color:${reqMet?'#4ade80':'#ef4444'};font-weight:700">Req: ${req}</div>`:''}
                                            ${active?`<div style="font-size:8px;color:#9ca3af;margin-top:4px;line-height:1.5">${effect}</div>`:''}
                                            ${sup&&supInfo?`<div style="font-size:8px;color:#ff9df7;margin-top:4px;line-height:1.5"><b>Superior:</b> ${supInfo.effect}</div>`:''}
                                        </div>
                                        <button onclick="${active?setDom(key, false):setDom(key, true)}" ${(canBuy||active)?'':'disabled'}
                                            style="flex-shrink:0;padding:6px 10px;border-radius:8px;font-size:8px;font-weight:900;cursor:${(canBuy||active)?'pointer':'not-allowed'};border:1.5px solid ${active?'#ef444455':'#a78bfa44'};background:${active?'#ef444411':'#a78bfa11'};color:${active?'#f87171':'#a78bfa'}">
                                            ${active?'−1 P.N':'+1 P.N'}
                                        </button>
                                    </div>
                                    ${active&&supInfo&&!sup?`<button onclick="${setDom(key+'_sup', true)}" ${canBuySup?'':'disabled'}
                                        style="width:100%;margin-top:8px;padding:6px;border-radius:8px;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:1px;cursor:${canBuySup?'pointer':'not-allowed'};border:1.5px dashed #ff4df766;background:#ff4df711;color:${canBuySup?'#ff4df7':'#374151'}">★ Desbloquear Nível Superior (+1 P.N)</button>`:''}
                                    ${sup&&supInfo?supInfo.aprimoramento||'':''}
                                    ${sup&&supInfo&&supInfo.extraHtml?supInfo.extraHtml:''}
                                </div>`;
                            };

                            const isReforco = char.class === 'REFORÇO' || char.class === 'INTENSIFICAÇÃO';
                            const tenLevels = isReforco ? [
                                '10% Aura + Reação ou Ação Bônus → +2 RD (Corte, Impacto, Explosão — incluso quedas).',
                                '5% Aura + Reação ou Ação Bônus → +4 RD. Imune a proj. que igualem CA.',
                                '10% Aura + Reação ou Ação Bônus → +6 RD. Desbloqueia SHU.'
                            ] : [
                                '20% Aura + Reação ou Ação Bônus → +2 RD (Corte, Impacto, Explosão — incluso quedas).',
                                '20% Aura + Reação ou Ação Bônus → +4 RD. Imune a proj. que igualem CA.',
                                '20% Aura + Reação ou Ação Bônus → +6 RD. Desbloqueia SHU.'
                            ];
                            const renLevels = [
                                '10% Aura + Ação Bônus → +1 Grau/Passo de dano de Armas, interação com materiais de NEN, proteção contra REN (Reação).',
                                '10% Aura + Ação Bônus/Ação → Básico + +3 em Intimidação ou Arcanismo/Religião usando REN. Desbloqueia EN.',
                                '10% Aura + Ação Bônus/Ação → Intermediário + 1×/dia +6 em Intimidação ou Arcanismo/Religião sem gastar aura. Desbloqueia GYO.'
                            ];
                            const zetsuLevels = [
                                '3 rodadas em Zetsu → +5% Aura, +1 Reação, +3 Furtividade. (Dano crítico ao sofrer dano de NEN)',
                                '2 rodadas em Zetsu → +10% Aura, +1 Reação, +3 Furtividade. Desbloqueia IN. (Dano crítico ao sofrer dano de NEN)',
                                '1 rodada em Zetsu → +10% Aura, +2 Reações, +6 Furtividade. Criaturas não-inteligentes te ignoram. (Dano crítico ao sofrer dano de NEN)'
                            ];

                            const ten = d.ten||0; const ren = d.ren||0; const zetsu = d.zetsu||0;

                            const rBon = window.calcRenBonus(char);
                            const zBon = window.calcZetsuBonus(char);
                            const tenAprimoramento = aprimoramentoBox('ten', Math.min(window.PN_APRIMORAMENTO_MAX, d.ten_pn||0), window.PN_APRIMORAMENTO_MAX, null,
                                `RD total: <b>+${window.calcTenRD(char)}</b> (Maestria +6, +1 por P.N extra)`);
                            const renAprimoramento = aprimoramentoBox('ren', Math.min(window.PN_APRIMORAMENTO_MAX, d.ren_pn||0), window.PN_APRIMORAMENTO_MAX,
                                { value: d.ren_opcao||1, labels: ['① Grau de Dano', '② Testes com REN'] },
                                rBon.opcao===1 ? `Opção 1: Grau/Passo de dano corpo-a-corpo: <b>+${rBon.grau}</b>`
                                    : `Opção 2: Testes com REN: <b>+${rBon.teste}</b> (padrão) / <b>+${rBon.teste1x}</b> (1×dia sem gastar aura)`);
                            const zetsuAprimoramento = aprimoramentoBox('zetsu', Math.min(window.PN_APRIMORAMENTO_MAX, d.zetsu_pn||0), window.PN_APRIMORAMENTO_MAX,
                                { value: d.zetsu_opcao||1, labels: ['① Recuperação', '② Furtividade'] },
                                zBon.opcao===1 ? `Opção 1: Recuperação de Aura: <b>+${zBon.auraPct}%</b> por conclusão`
                                    : `Opção 2: Furtividade: <b>+${zBon.furtividade}</b>`);

                            const enB = window.calcAvancadoBonus(char,'en'), inB = window.calcAvancadoBonus(char,'inp'), gyB = window.calcAvancadoBonus(char,'gyo');
                            const shB = window.calcAvancadoBonus(char,'shu'), keB = window.calcAvancadoBonus(char,'ken'), koB = window.calcAvancadoBonus(char,'ko'), ryB = window.calcAvancadoBonus(char,'ryu');

                            const ryuTablesHtml = `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #2d2440">
                                <div style="font-size:7px;font-weight:900;color:#ff4df7;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Exemplos de RYU disponíveis ${ryB.tabelaBonus>0?`(+${ryB.tabelaBonus} em todos os valores)`:''}</div>
                                ${window.NEN_RYU_TABLES.filter(t => !t.superior || d.ryu_sup).map(t => `<div style="font-size:7px;color:#9ca3af;margin-bottom:2px"><b style="color:#d1d5db">${t.nome}${t.superior?' ★':''}:</b> ${t.linhas.map(l => `${l.turno}(CA+${l.ca+ryB.tabelaBonus}${l.reacoes!==null?`/Rea ${l.reacoes+ryB.tabelaBonus}`:''}/At+${l.ataqueDano+ryB.tabelaBonus})`).join(' · ')}</div>`).join('')}
                            </div>`;

                            return `<div style="width:100%;padding:0 4px;margin-bottom:16px">
                                <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center">🔮 Domínio de NEN</div>

                                <div style="background:#060d1a;border:1px solid #1f2937;border-radius:10px;padding:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                                    <span style="font-size:8px;color:#6b7280;font-weight:700">P.N em Domínio</span>
                                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:${tc2}">${pnDominio} / ${pnTotal}</span>
                                </div>

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ PRINCÍPIOS FUNDAMENTAIS</div>
                                ${fundamentalCard('ten','TEN — Proteção','🛡️','Envolver/Proteger. RD contra Corte, Impacto e Explosão; interrompe intimidação por aura (não Hatsu) sem precisar superar a rolagem.',tenLevels,null,tenAprimoramento)}
                                ${fundamentalCard('ren','REN — Controlar','💪','Praticar/Expandir. Aumenta grau de dano e testes de Intimidação/Arcanismo-Religião.',renLevels,null,renAprimoramento)}
                                ${noteBox('Quem não usa REN pode ter sua vontade subjugada automaticamente por um usuário, mesmo hostil e consciente. Saber ao menos o Básico de REN evita a subjugação automática — permite contestar gastando 1 Reação, ou usar TEN (Ação Principal ou Reação) após ser afetado.')}
                                ${fundamentalCard('zetsu','ZETSU — Suprimir','🧠','Anular/Ocultar. Recupera aura e oculta presença; pode ser desativado livremente, mas perde os benefícios se fizer isso.',zetsuLevels,null,zetsuAprimoramento)}
                                ${noteBox('Transformadores têm vantagem para detectar alguém em Zetsu; Reforçadores e Emissores têm desvantagem. Em combate, Zetsu só pode ser usado por restrição de Hatsu, esgotamento de aura, necessidade estratégica ou condição de Selado.')}

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">🌟 PRINCÍPIOS AVANÇADOS</div>
                                ${advancedCard('en','EN — Envolver','🔵','Expansão do Ren em esfera de detecção. 10% Aura + 2 Reações para 3m de diâmetro (dura até o início do seu próximo turno).',
                                    `Detecta forma/movimento em ${enB.diametro}m de diâmetro. Ataque de reação sem gastar Ação Principal contra quem entrar. +10% Aura e +2 Reações a cada +3m adicional. Funciona contra ilusões. Emissores mantêm por +1 turno sem custo extra.`,
                                    'REN 2 + TEN 1', ren>=2 && ten>=1,
                                    { effect: 'Dobra o alcance base e permite mudar o formato entre Círculo, Cone (+3m), Linha (+4,5m) ou Cilindro (+3m).',
                                      aprimoramento: aprimoramentoBox('en', Math.min(window.PN_APRIMORAMENTO_MAX, d.en_pn||0), window.PN_APRIMORAMENTO_MAX, { value: d.en_opcao||1, labels: ['① Menos Reações', '② Mais Alcance'] },
                                          enB.opcao===1 ? `Opção 1: Custo de Reações: <b>${enB.reacoes}</b> (mínimo 1)` : `Opção 2: Diâmetro do EN: <b>${enB.diametro.toFixed(1)}m</b>`) })}
                                ${advancedCard('inp','IN — Ocultar','🌑','Princípio Avançado do Zetsu — esconde objeto/material feito de NEN. Só é revelado com GYO. 5% Aura por rodada (1 item em sua posse/domínio/controle).',
                                    `Oculta por ${inB.rodadas} rodada(s). Custa 10% (5% acima do padrão) para Reforçadores, Manipuladores e Especialistas.`,
                                    'ZETSU 2', zetsu>=2,
                                    { effect: 'Duração aumentada para 2 Rodadas.',
                                      aprimoramento: aprimoramentoBox('inp', Math.min(window.PN_APRIMORAMENTO_MAX, d.inp_pn||0), window.PN_APRIMORAMENTO_MAX, null, `Duração do IN: <b>${inB.rodadas}</b> rodada(s) (+1 a cada 2 P.N extra)`) })}
                                ${advancedCard('gyo','GYO — Focar','🧠','Aplicação avançada de REN+ZETSU concentrada em uma parte do corpo. 10% Aura nos olhos/ouvidos (vê aura e oculto por IN, +5 Investigação/Percepção) ou 30% Aura em outra parte do corpo.',
                                    `Aplicado no corpo: +${gyB.attrBonus} temporário em FOR, DES ou CON por 1 rodada (propriedade de Arma de Cerco). Ataques com GYO forçam TR de FOR ou CON (CD = valor do ataque) para não ser empurrado 6m — bloqueado por GYO, KEN ou RYU no defensor.`,
                                    'ZETSU 2 + REN Maestria', ren>=3 && zetsu>=2,
                                    { effect: '1) Cancela condição de golpe mirado ao usar GYO em bloqueio reativo, mesmo com o ataque acertando. 2) Multiplica distância/altura de salto em 1,5m × valor de FOR ou Atletismo.',
                                      aprimoramento: aprimoramentoBox('gyo', Math.min(window.PN_APRIMORAMENTO_MAX, d.gyo_pn||0), window.PN_APRIMORAMENTO_MAX, null, `Bônus de atributo com GYO: <b>+${gyB.attrBonus}</b> (+1 a cada 2 P.N extra)`) })}
                                ${advancedCard('shu','SHU — Agregar/Proteger','⚡','Envolve um item/objeto (até 1m) em aura completa. 10% Aura → +1d4 Dano e CA por 1 rodada, protegido de efeitos físicos. +5% para equipamentos maiores; +5% adicional para aumentar CA/Dano, aplicar Arma de Cerco, +1 rodada de duração ou +1m de tamanho.',
                                    `Duração: ${shB.rodadas} rodada(s). Só pode ser destruído por Hatsu, SHU, KO ou RYU. Golpe com item em SHU é considerado mirado/preciso sem o ônus da mecânica. Emissores, Manipuladores e Reforçadores (adjacentes à Emissão) mantêm por +1 rodada por uso.`,
                                    'TEN Maestria', ten>=3,
                                    { effect: 'Gasta a mesma aura independente do tamanho do objeto e aumenta Dano e CA ao mesmo tempo.',
                                      aprimoramento: aprimoramentoBox('shu', Math.min(window.PN_APRIMORAMENTO_MAX, d.shu_pn||0), window.PN_APRIMORAMENTO_MAX, null, `Duração do SHU: <b>${shB.rodadas}</b> rodada(s) (+1 por P.N extra)`) })}

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">🌟 TÉCNICAS AVANÇADAS</div>
                                ${advancedCard('ken','KEN — Fortificar','🏰','Mantém REN fora do corpo todo com proteção de TEN, defendendo contra ataques de qualquer direção sem precisar de GYO.',
                                    `${keB.auraCusto}% Aura + ${keB.reacoes} Reações → dobra a CA por 2 rodadas (o dobro de aura/reações para triplicar). Também aplica RD de TEN contra dano de queda: CA iguala a altura = 50% menos dano; CA supera a altura = nenhum dano.`,
                                    'TEN Maestria + REN Maestria', ten>=3 && ren>=3,
                                    { effect: 'Gaste 1 P.N para escolher, por uso: (1) Triplicar o RD de TEN na Maestria (3×6=18) OU (2) +5 CA até o início do próximo turno.',
                                      aprimoramento: aprimoramentoBox('ken', Math.min(window.PN_APRIMORAMENTO_MAX, d.ken_pn||0), window.PN_APRIMORAMENTO_MAX, { value: d.ken_opcao||1, labels: ['① −5% Aura', '② −1 Reação'] },
                                          keB.opcao===1 ? `Opção 1: Custo de Aura: <b>${keB.auraCusto}%</b>` : `Opção 2: Custo de Reações: <b>${keB.reacoes}</b> (mínimo 1)`) })}
                                ${advancedCard('ko','KO — Endurecer','🔥','Toda a aura concentrada em uma parte do corpo, com Zetsu no resto. 30% Aura → triplica o dano, mas reduz a CA em 80% até o início do próximo turno (não pode ser interrompido intencionalmente).',
                                    `CA cai para a faixa 2–6 conforme CA inicial${koB.caBonus>0?` <b>+${koB.caBonus}</b>`:''} (tabela de impacto).`,
                                    'REN Maestria + ZETSU Maestria + TEN 1', ren>=3 && zetsu>=3 && ten>=1,
                                    { effect: 'CA mínima após o uso passa a ser 10 (em vez da faixa 2–6).',
                                      aprimoramento: aprimoramentoBox('ko', Math.min(window.PN_APRIMORAMENTO_MAX, d.ko_pn||0), window.PN_APRIMORAMENTO_MAX, null, `Bônus na CA restante após KO: <b>+${koB.caBonus}</b> (+1 a cada 2 P.N extra)`) })}
                                ${advancedCard('ryu','RYU — Fluir','🌊','GYO em tempo real em várias partes do corpo simultaneamente, para combate corpo-a-corpo e armas de arremesso. 30% Aura → acesso aos Exemplos 1–3 (Bônus em CA e Ataque+Dano).',
                                    `Escolha UMA tabela ao ativar e siga a ordem dela até o 6º turno — as tabelas são ordens diferentes das mesmas linhas, então a escolha é em QUE turno o golpe forte cai. O botão "Passar turno", no painel de princípios ativos, anda na tabela. Consome Reações para contra-ataques sem perder Ação Principal.`,
                                    'TEN + REN + ZETSU Maestria', ten>=3 && ren>=3 && zetsu>=3,
                                    { effect: 'Desbloqueia os Exemplos 4, 5 e 6 de RYU, que concedem Reações Extras.',
                                      aprimoramento: aprimoramentoBox('ryu', Math.min(window.PN_APRIMORAMENTO_MAX, d.ryu_pn||0), window.PN_APRIMORAMENTO_MAX, null, `Bônus em todos os valores das tabelas de RYU: <b>+${ryB.tabelaBonus}</b> (+1 a cada 2 P.N extra)`),
                                      extraHtml: ryuTablesHtml })}
                            </div>`;
                        })()}

                    </div>`;
            } else if (state.activeTab === 'TRACOS') {
                const raceData = SYSTEM_DB.racas.find(r => r.nome === char.race); const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === char.background);
                // Botão "Editar" — permite fichas antigas (criadas antes dessas opções existirem, ex.
                // Humano sem "Esforço no lugar de talento") preencherem retroativamente a característica.
                const canEditRaceTraits = char.race === 'Humano Comum' || (raceData && (raceData.opcoes_caracteristica||[]).length > 0);
                let traitsHtml = `<div class="flex items-center justify-between mb-2 mt-2"><div class="flex items-center gap-3"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="dna" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">${char.race}</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Características Raciais</p></div></div>${canEditRaceTraits ? `<button onclick="window._openRaceTraitsModal()" class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[${themeColor}]/10 border border-[${themeColor}]/30 text-[${themeColor}] text-[10px] font-bold uppercase tracking-widest hover:bg-[${themeColor}]/20 transition-colors"><i data-lucide="edit-3" size="12"></i> Editar</button>` : ''}</div><div class="space-y-2 mb-6">`;
                
                // Add Origin Display Here
                if (char.race === 'Formiga Quimera' && char.fagogenese) {
                    const deslocLabel = char.deslocamentoTipo === 'voo' ? '🕊️ Voo' : char.deslocamentoTipo === 'aquatico' ? '🌊 Aquático' : char.deslocamentoTipo === 'escalada' ? '🧗 Escalada' : null;
                    traitsHtml += `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}] mb-2"><h4 class="font-bold text-white text-xs mb-1">Origem da Fagogênese</h4><p class="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold text-neon-blue">${char.fagogenese}${char.fqPreset ? ` — Ref.: ${char.fqPreset}` : ''}</p><p class="text-[10px] text-gray-500 leading-relaxed mt-1">Tamanho: <b class="text-white">${char.fqTamanho || 'Médio'}</b> · Deslocamento: <b class="text-white">${char.vitals.desl || 9}m Terrestre</b>${deslocLabel ? ` + <b class="text-white">${char.deslocamentoValor}m ${deslocLabel}</b>` : ''}</p></div>`;
                }

                // "Esforço no lugar de talento" (Humano Comum) — característica emprestada de outra raça
                if (char.race === 'Humano Comum' && char.effortTrait) {
                    const effortData = (SYSTEM_DB.esforcoRacas || {})[char.effortRace];
                    const effortOpt = effortData && effortData.opcoes.find(o => o.nome === char.effortTrait);
                    traitsHtml += `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}] mb-2"><h4 class="font-bold text-white text-xs mb-1">💪 Esforço no Lugar de Talento — ${char.effortTrait}</h4><p class="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Origem: ${char.effortRace || '—'}</p><p class="text-[10px] text-gray-400 leading-relaxed">${effortOpt ? effortOpt.efeito : 'Descrição não encontrada.'}</p></div>`;
                }

                if (char.race === 'Formiga Quimera') { if (char.raceTraits && char.raceTraits.length > 0) { traitsHtml += char.raceTraits.map(tName => { 
                    // Handle "Trait: Detail" format
                    const parts = tName.split(':');
                    const baseTraitName = parts[0].trim();
                    const detail = parts.length > 1 ? parts[1].trim() : '';
                    const tData = raceData.caracteristicas.find(c => c.nome === baseTraitName); 
                    return `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}]"><h4 class="font-bold text-white text-xs mb-1">${tName}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${tData ? (tData.efeito || tData.mecanica) : 'Descrição não encontrada.'}</p></div>`; }).join(''); } } else { const fixedFeatures = [...(raceData.caracteristicas || [])]; if (fixedFeatures.length > 0) { traitsHtml += fixedFeatures.map(f => `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}]"><h4 class="font-bold text-white text-xs mb-1">${f.nome}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${f.efeito || f.mecanica || ''}</p></div>`).join(''); } if (char.raceFeatureChoice) { const chosenFeature = (raceData.opcoes_caracteristica || []).find(f => f.nome === char.raceFeatureChoice); traitsHtml += `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-4 border-l-[${themeColor}]"><h4 class="font-bold text-[${themeColor}] text-xs mb-1">${char.raceFeatureChoice}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${chosenFeature ? (chosenFeature.efeito || chosenFeature.mecanica) : 'Descrição não encontrada.'}</p></div>`; } } traitsHtml += `</div>`; let bgHtml = ''; if (bgData && char.backgroundFeature) { const feature = bgData.caracteristicas.find(f => f.nome === char.backgroundFeature); bgHtml = `<div class="flex items-center gap-3 mb-2 border-t border-gray-800 pt-4"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="book-open" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">${char.background}</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Antecedente</p></div></div><div class="space-y-2 mb-6"><div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-4 border-l-[${themeColor}]"><h4 class="font-bold text-[${themeColor}] text-xs mb-1">${feature.nome}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${feature.efeito}</p></div></div>`; }
                let generalIncHtml = '';
                // Gerais compradas com pontos entram na mesma lista visual das positivas,
                // marcadas para o jogador saber que não vieram da criação.
                const posPontos = (char.generalIncByPoints || []).map(function (i) {
                    return { nome: i.nome, custo: i.custo, porPontos: true };
                });
                const posIncs = (((char.inclinations && char.inclinations.positive) || []).concat(posPontos));
                const negPontos = (char.generalNegByPoints || []).map(function (i) {
                    return { nome: i.nome, valor: i.valor, porPontos: true };
                });
                const negIncs = (((char.inclinations && char.inclinations.negative) || []).concat(negPontos));
                if (posIncs.length > 0 || negIncs.length > 0) {
                    // Sinaliza inclinações não-básicas vindas de fichas criadas antes desta regra.
                    // Só aviso visual: nada é removido nem alterado no personagem.
                    const _giNaoBasicas = posIncs.filter(i => !isInclinacaoBasica(i.nome, 'positive')).length
                                        + negIncs.filter(i => !isInclinacaoBasica(i.nome, 'negative')).length;
                    const _giLegadoAviso = _giNaoBasicas > 0
                        ? `<p class="text-[10px] text-amber-400 uppercase tracking-widest">${_giNaoBasicas} não-básica(s) de criação anterior</p>`
                        : `<p class="text-[10px] text-gray-500 uppercase tracking-widest">Positivas e Negativas</p>`;
                    function _ciLookup(nome, tipo) {
                        const list = tipo === 'pos' ? (SYSTEM_DB.inclinacoes && SYSTEM_DB.inclinacoes.positivas) : (SYSTEM_DB.inclinacoes && SYSTEM_DB.inclinacoes.negativas);
                        if (!list) return '';
                        const direct = list.find(i => i.nome === nome);
                        if (direct) return direct.desc || '';
                        const parts = nome.split(':');
                        if (parts.length >= 2) { const parent = list.find(i => i.nome === parts[0].trim() && i.hasOptions); if (parent) { const opt = parent.options && parent.options.find(o => o.label === parts[1].trim()); if (opt) return opt.desc || parent.desc || ''; } }
                        return '';
                    }
                    const posHtml = posIncs.length > 0 ? `<div class="mb-2"><p class="text-[9px] font-black text-neon-green uppercase tracking-widest mb-1 flex items-center gap-1"><i data-lucide="thumbs-up" size="10"></i> Positivas</p><div class="space-y-1">${posIncs.map(inc => { const desc = _ciLookup(inc.nome, 'pos'); return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3" style="border-left:3px solid #00ff9d"><div class="flex justify-between items-start mb-0.5"><span class="text-xs font-bold text-neon-green">${inc.nome}</span><span class="text-[9px] bg-neon-green/10 text-neon-green border border-neon-green/20 px-1.5 rounded">${inc.custo} pts</span>${inc.porPontos ? '<span style=\'font-size:9px;background:#f9731620;color:#fb923c;border:1px solid #f9731640;padding:2px 6px;border-radius:5px;margin-left:4px\'>por pontos</span>' : ''}</div>${desc ? `<p class="text-[10px] text-gray-400 leading-relaxed mt-1">${desc}</p>` : ''}</div>`; }).join('')}</div></div>` : '';
                    const negHtml = negIncs.length > 0 ? `<div><p class="text-[9px] font-black text-neon-red uppercase tracking-widest mb-1 flex items-center gap-1"><i data-lucide="thumbs-down" size="10"></i> Negativas</p><div class="space-y-1">${negIncs.map(inc => { const desc = _ciLookup(inc.nome, 'neg'); return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3" style="border-left:3px solid #ff0055"><div class="flex justify-between items-start mb-0.5"><span class="text-xs font-bold text-neon-red">${inc.nome}</span><span class="text-[9px] bg-neon-red/10 text-neon-red border border-neon-red/20 px-1.5 rounded">+${inc.valor} pts</span>${inc.porPontos ? '<span style=\'font-size:9px;background:#f9731620;color:#fb923c;border:1px solid #f9731640;padding:2px 6px;border-radius:5px;margin-left:4px\'>por pontos</span>' : ''}</div>${desc ? `<p class="text-[10px] text-gray-400 leading-relaxed mt-1">${desc}</p>` : ''}</div>`; }).join('')}</div></div>` : '';
                    generalIncHtml = `<div class="mt-2 border-t border-gray-800 pt-4"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-3"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="scale" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">Inclinações Gerais</h3>${_giLegadoAviso}</div></div><button onclick="window._openGeneralIncModal()" class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[${themeColor}]/10 border border-[${themeColor}]/30 text-[${themeColor}] text-[10px] font-bold uppercase tracking-widest hover:bg-[${themeColor}]/20 transition-colors"><i data-lucide="edit-3" size="12"></i> Editar</button></div>${posHtml}${negHtml}</div>`;
                }
                const otherTrainings = char.skills.filter(s => SYSTEM_DB.otherSkills.includes(s)); let otherSkillsHtml = ''; if (otherTrainings.length > 0) { const isOpen = state.sheetOtherSkillsOpen; otherSkillsHtml = `<div class="mt-2 border-t border-gray-800 pt-4"><div onclick="toggleSheetAccordion()" class="flex items-center justify-between cursor-pointer group"><div class="flex items-center gap-3 mb-2"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="hammer" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">Outros Treinamentos</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Equipamentos, Linguagens e Ferramentas</p></div></div><div class="transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-gray-600 group-hover:text-gray-400'}"><i data-lucide="chevron-down" size="20"></i></div></div><div class="accordion-content ${isOpen ? 'open' : ''}"><div class="flex flex-wrap gap-2 pt-2">${otherTrainings.map(s => `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl inline-flex items-center gap-2 w-auto pr-4"><i data-lucide="check-circle" size="14" style="color: ${themeColor}" class="shrink-0"></i><span class="text-xs font-bold whitespace-nowrap" style="color: ${themeColor}">${s}</span></div>`).join('')}</div></div></div>`; }
                let combatIncHtml = '';
                if (char.level >= 2 && window.COMBAT_INCLINATIONS_DB) {
                    const ciTotalPts = getCIPointsForLevel(char.level);
                    const ciInvested = char.combatInclinations || {};
                    const ciSpent = Object.values(ciInvested).reduce((a, b) => a + b, 0);
                    const ciAvail = ciTotalPts - ciSpent;
                    const ciEntries = Object.entries(ciInvested).filter(([, v]) => v > 0);
                    let ciListHtml = ciEntries.length === 0
                        ? `<p class="text-[10px] text-gray-600 italic text-center py-2">Nenhuma inclinação investida. Clique em Editar para distribuir seus pontos.</p>`
                        : ciEntries.map(([id, pts]) => {
                            const inc = window.COMBAT_INCLINATIONS_DB.find(i => i.id === id);
                            if (!inc) return '';
                            // Na ficha o jogador precisa do acréscimo "Com aura" à mão durante
                            // a mesa, não só no modal de compra — é lá que ele decide se paga.
                            return inc.tiers.slice(0, pts).map((desc, ti) => {
                                const nvl = window.CI_NIVEL_NOME ? window.CI_NIVEL_NOME[ti] : ('Tier ' + (ti + 1));
                                const au = (inc.aura || [])[ti];
                                const auHtml = au ? `<div class="mt-1.5 flex gap-1.5 items-start rounded-md px-2 py-1.5" style="background:#1e3a8a22;border:1px solid #3b82f633"><span style="font-size:9px;line-height:1.3">💠</span><p class="text-[9px] leading-relaxed" style="color:#93c5fd">${au}</p></div>` : '';
                                return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3" style="border-left:3px solid #f97316"><div class="flex items-center gap-2 mb-1 flex-wrap"><span class="text-xs font-bold text-orange-400">${inc.nome}</span><span class="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 rounded">${nvl}</span>${(inc.etiquetas || []).map(e => `<span class="text-[8px] font-bold px-1.5 rounded" style="background:#1e3a8a33;color:#93c5fd;border:1px solid #3b82f644">${e}</span>`).join('')}</div><p class="text-[10px] text-gray-400 leading-relaxed">${desc}</p>${auHtml}</div>`;
                            }).join('');
                          }).join('');
                    // Porta de entrada: sem Nen, ou sem nenhum princípio/técnica, a seção fica
                    // visível (o jogador precisa ver o que falta e o que já investiu) mas o botão
                    // Editar é trocado por um aviso com o motivo.
                    const _ciPorta = window.podeComprarInclinacoes
                        ? window.podeComprarInclinacoes(char) : { ok: true, motivo: '' };
                    const _ciBotao = _ciPorta.ok
                        ? `<button onclick="window._openCombatIncModal()" class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500/20 transition-colors"><i data-lucide="edit-3" size="12"></i> Editar</button>`
                        : `<span class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-500 text-[10px] font-bold uppercase tracking-widest"><i data-lucide="lock" size="12"></i> Bloqueado</span>`;
                    const _ciMotivo = _ciPorta.ok ? '' :
                        `<div class="flex items-start gap-2 text-[10px] text-gray-400 font-semibold mb-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"><i data-lucide="info" size="12" class="shrink-0 mt-0.5 text-gray-500"></i><span>${_ciPorta.motivo}</span></div>`;
                    combatIncHtml = `<div class="mt-2 border-t border-gray-800 pt-4"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-3"><div class="bg-gray-800 p-2 rounded text-orange-400"><i data-lucide="swords" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">Inclinações de Combate</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">${ciSpent}/${ciTotalPts} pontos usados</p></div></div>${_ciBotao}</div>${_ciMotivo}${(_ciPorta.ok && ciAvail > 0) ? `<div class="flex items-center gap-2 text-[10px] text-orange-400 font-bold mb-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 animate-pulse"><i data-lucide="alert-circle" size="12"></i> ${ciAvail} ponto(s) disponível(is) para investir!</div>` : ''}<div class="space-y-2">${ciListHtml}</div></div>`;
                }
                // ── Instâncias Shingen-Ryu ───────────────────────────────────────────
                // Pagas com P.N (2 no Nível 1, 3 no Nível 2), não com Pontos de Inclinação.
                // Por isso o contador mostra P.N, e não o bolo das inclinações.
                let instHtml = '';
                if (window.INSTANCIAS_DB && char.level >= 2) {
                    const _iPorta = window.podeComprarInstancias
                        ? window.podeComprarInstancias(char) : { ok: true, motivo: '' };
                    const _iInvest = char.instancias || {};
                    const _iGasto = window.calcPNSpentInInstancias ? window.calcPNSpentInInstancias(char) : 0;
                    const _iLivre = window._pnLivreDoPersonagem ? window._pnLivreDoPersonagem(char) : 0;
                    const _iEntries = Object.keys(_iInvest).filter(function (k) { return (_iInvest[k] || 0) > 0; });
                    const _iLista = _iEntries.length === 0
                        ? `<p class="text-[10px] text-gray-600 italic text-center py-2">Nenhuma Instância treinada.</p>`
                        : _iEntries.map(function (id) {
                            const ins = window.INSTANCIAS_DB.filter(function (x) { return x.id === id; })[0];
                            if (!ins) return '';
                            const n = _iInvest[id];
                            return ins.niveis.slice(0, n).map(function (d, ni) {
                                // Combatente Rápido nível 2 é a única Instância com "ou" na
                                // descrição ("+2 na CA ou Ações de Esquivas"): precisa de escolha,
                                // porque os dois destinos são calculados em lugares diferentes
                                // (calcBonusCAInstancia e calcBonusReacao).
                                let _esc = '';
                                if (id === 'combatente_rapido' && ni === 1) {
                                    const _at = (char.instanciaEscolhas || {}).combatente_rapido_2 || '';
                                    const _bt = function (v, rot) {
                                        const on = _at === v;
                                        return `<button onclick="window._setInstanciaEscolha('combatente_rapido_2','${v}')" class="flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors" style="border:1.5px solid ${on ? '#a855f7' : '#374151'};background:${on ? '#a855f722' : 'transparent'};color:${on ? '#c084fc' : '#9ca3af'}">${on ? '✓ ' : ''}${rot}</button>`;
                                    };
                                    _esc = `<div class="mt-2 pt-2" style="border-top:1px dashed #a855f733"><div class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Escolha o destino</div><div class="flex gap-2">${_bt('ca', '+2 na CA')}${_bt('esquiva', '+2 nas Esquivas')}</div>${_at ? '' : '<div class="text-[9px] text-red-400 mt-1.5">⚠ Sem escolha, o bônus não é aplicado.</div>'}</div>`;
                                }
                                return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3" style="border-left:3px solid #a855f7"><div class="flex items-center gap-2 mb-1 flex-wrap"><span class="text-xs font-bold" style="color:#c084fc">${ins.nome}</span><span class="text-[9px] px-1.5 rounded" style="background:#a855f71a;color:#c084fc;border:1px solid #a855f733">Nível ${ni + 1}</span>${(ins.etiquetas || []).map(function (e) { return `<span class="text-[8px] font-bold px-1.5 rounded" style="background:#1e3a8a33;color:#93c5fd;border:1px solid #3b82f644">${e}</span>`; }).join('')}</div><p class="text-[10px] text-gray-400 leading-relaxed">${d}</p>${_esc}</div>`;
                            }).join('');
                          }).join('');
                    const _iBotao = _iPorta.ok
                        ? `<button onclick="window._openInstanciasModal()" class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors" style="background:#a855f71a;border:1px solid #a855f74d;color:#c084fc"><i data-lucide="edit-3" size="12"></i> Editar</button>`
                        : `<span class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-500 text-[10px] font-bold uppercase tracking-widest"><i data-lucide="lock" size="12"></i> Bloqueado</span>`;
                    instHtml = `<div class="mt-2 border-t border-gray-800 pt-4"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-3"><div class="bg-gray-800 p-2 rounded" style="color:#c084fc"><i data-lucide="git-branch" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">Instâncias Shingen-Ryu</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">${_iGasto} P.N investidos &#183; ${Math.max(0, _iLivre)} P.N livres</p></div></div>${_iBotao}</div>${_iPorta.ok ? '' : `<div class="flex items-start gap-2 text-[10px] text-gray-400 font-semibold mb-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"><i data-lucide="info" size="12" class="shrink-0 mt-0.5 text-gray-500"></i><span>${_iPorta.motivo}</span></div>`}<div class="space-y-2">${_iLista}</div></div>`;
                }
                tabContent = `<div class="p-4 space-y-2">${traitsHtml}${bgHtml}${generalIncHtml}${otherSkillsHtml}${combatIncHtml}${instHtml}</div>`;
            } else if (state.activeTab === 'INV') {
                const isShop = state.invMode === 'SHOP';
                const headerHtml = `<div class="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-gray-950 z-20 border-b border-gray-800/50"><div class="flex bg-gray-900 rounded-lg p-1 border border-gray-800"><button onclick="toggleInvMode('BAG')" class="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${!isShop ? `bg-[${themeColor}] text-black shadow-[0_0_10px_${themeColor}]` : 'text-gray-500 hover:text-white'}">Mochila</button><button onclick="toggleInvMode('SHOP')" class="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${isShop ? `bg-[${themeColor}] text-black shadow-[0_0_10px_${themeColor}]` : 'text-gray-500 hover:text-white'}">Loja</button></div><div class="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5"><span class="text-[${themeColor}] font-bold text-xs">$</span><input type="number" value="${char.money}" onchange="updateMoney(this.value)" class="w-16 bg-transparent text-white font-mono text-sm text-right outline-none"></div></div>`;
                let bodyHtml = '';
                if (!isShop) {
                    const totalWeight = char.inventory.reduce((acc, item) => { const data = findItemData(item.name); return acc + (data ? (data.peso * item.qty) : 0); }, 0);
                    bodyHtml = `<div class="p-4 space-y-4"><div class="flex gap-2"><input type="text" id="new-item-name" placeholder="Adicionar item customizado..." class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[${themeColor}] outline-none"><button onclick="addItem()" class="bg-gray-800 border border-gray-700 text-gray-300 px-4 rounded-lg font-bold hover:bg-gray-700 hover:text-white transition-colors"><i data-lucide="plus" size="16"></i></button></div><div class="flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1"><span>Itens: ${char.inventory.length}</span><span>Peso Est.: ${totalWeight.toFixed(1)} kg</span></div><div class="space-y-2">${char.inventory.length === 0 ? '<div class="text-center text-gray-600 text-xs py-8 border border-dashed border-gray-800 rounded-xl">Mochila vazia.</div>' : ''}${char.inventory.map((item, idx) => { const data = findItemData(item.name); let tagsHtml = '', statsHtml = ''; if (data) { if(data.tags) tagsHtml = data.tags.map(t => `<span class="text-[8px] bg-gray-950 text-gray-400 px-1.5 py-0.5 rounded border border-gray-800">${t}</span>`).join(''); if(data.dano) statsHtml += `<span class="text-[9px] text-red-400 font-bold flex items-center gap-1"><i data-lucide="sword" size="10"></i> ${data.dano} ${data.tipo_dano}</span>`; if(data.ca) statsHtml += `<span class="text-[9px] text-blue-400 font-bold flex items-center gap-1"><i data-lucide="shield" size="10"></i> CA ${data.ca}</span>`; if(data.peso) statsHtml += `<span class="text-[9px] text-gray-500 flex items-center gap-1"><i data-lucide="weight" size="10"></i> ${data.peso}kg</span>`; } return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3 relative group transition-all hover:border-gray-600"><div class="flex justify-between items-start mb-1"><span class="text-sm font-bold text-white">${item.name}</span><div class="flex items-center gap-2"><button onclick="sellItem(${idx})" class="text-[9px] text-red-900 hover:text-red-500 uppercase font-bold tracking-wider mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Vender</button><button onclick="updateItemQty(${idx}, -1)" class="text-gray-600 hover:text-white"><i data-lucide="minus" size="14"></i></button><span class="text-sm w-4 text-center font-mono text-gray-300">${item.qty}</span><button onclick="updateItemQty(${idx}, 1)" class="text-gray-600 hover:text-white"><i data-lucide="plus" size="14"></i></button></div></div>${statsHtml ? `<div class="flex gap-3 mb-1.5">${statsHtml}</div>` : ''}${tagsHtml ? `<div class="flex flex-wrap gap-1">${tagsHtml}</div>` : ''}${data && data.detalhe ? `<div class="mt-1 text-[9px] text-gray-600 italic border-t border-gray-800/50 pt-1">${data.detalhe}</div>` : ''}</div>`; }).join('')}</div></div>`;
                } else {
                    const categories = [ { id: 'armas', label: 'Armas', icon: 'sword' }, { id: 'armaduras', label: 'Armaduras', icon: 'shield' }, { id: 'municoes', label: 'Munições', icon: 'crosshair' }, { id: 'itens_medicos', label: 'Médicos', icon: 'heart' }, { id: 'kits', label: 'Kits', icon: 'briefcase' }, { id: 'equipamentos_gerais', label: 'Gerais', icon: 'backpack' } ];
                    const currentCat = state.shopCategory; const dbCat = ITEM_DB[currentCat]; let itemsToDisplay = []; let subFilters = [];
                    if (Array.isArray(dbCat)) { itemsToDisplay = dbCat; } else { subFilters = Object.keys(dbCat); if (state.shopSubFilter && dbCat[state.shopSubFilter]) { itemsToDisplay = dbCat[state.shopSubFilter]; } else { itemsToDisplay = Object.values(dbCat).flat(); } }
                    if (state.searchTerm) { const term = state.searchTerm.toLowerCase(); itemsToDisplay = itemsToDisplay.filter(i => i.nome.toLowerCase().includes(term)); }
                    bodyHtml = `<div class="flex flex-col h-full"><div class="px-4 py-2 border-b border-gray-800 bg-gray-900/50"><div class="relative"><i data-lucide="search" size="14" class="absolute left-3 top-3 text-gray-600"></i><input type="text" placeholder="Buscar na loja..." oninput="state.searchTerm = this.value; render(true)" value="${state.searchTerm}" class="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-[${themeColor}] outline-none"></div></div><div class="flex overflow-x-auto no-scrollbar gap-2 p-2 border-b border-gray-800 bg-gray-950">${categories.map(c => `<button onclick="setShopCategory('${c.id}')" class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${currentCat === c.id ? `bg-[${themeColor}]/10 border-[${themeColor}] text-[${themeColor}]` : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'}"><i data-lucide="${c.icon}" size="14"></i><span class="text-[10px] font-bold uppercase tracking-wide">${c.label}</span></button>`).join('')}</div>${subFilters.length > 0 ? `<div class="flex overflow-x-auto no-scrollbar gap-2 px-4 py-2 bg-gray-900/30 border-b border-gray-800"><button onclick="setShopSubFilter(null)" class="px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${!state.shopSubFilter ? `bg-gray-800 text-white border-gray-600` : 'text-gray-500 border-transparent hover:text-gray-300'}">Todos</button>${subFilters.map(s => `<button onclick="setShopSubFilter('${s}')" class="px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${state.shopSubFilter === s ? `bg-[${themeColor}]/20 text-[${themeColor}] border-[${themeColor}]/50` : 'text-gray-500 border-transparent hover:bg-gray-800'}">${s.replace(/_/g, ' ')}</button>`).join('')}</div>` : ''}<div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-24">${itemsToDisplay.length === 0 ? '<div class="text-center text-gray-600 text-xs italic py-10">Nenhum item encontrado.</div>' : ''}${itemsToDisplay.map(item => { const canBuy = char.money >= item.custo; let statsHtml = `<span class="text-[10px] font-mono text-gray-400">$${item.custo}</span>`; if(item.peso) statsHtml += `<span class="text-[9px] text-gray-600"> • ${item.peso}kg</span>`; let combatHtml = ''; if(item.dano) combatHtml += `<div class="flex items-center gap-1 text-[9px] text-red-400 font-bold bg-red-900/10 px-1.5 rounded"><i data-lucide="sword" size="10"></i> ${item.dano} ${item.tipo_dano}</div>`; if(item.ca) combatHtml += `<div class="flex items-center gap-1 text-[9px] text-blue-400 font-bold bg-blue-900/10 px-1.5 rounded"><i data-lucide="shield" size="10"></i> CA ${item.ca}</div>`; return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col gap-2 group hover:border-gray-600 transition-colors"><div class="flex justify-between items-start"><div><span class="text-xs font-bold text-white block">${item.nome}</span><div class="flex items-center gap-1 mt-0.5">${statsHtml}</div></div><button onclick="buyItem('${item.nome}', ${item.custo})" class="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all flex items-center gap-1 ${canBuy ? `bg-[${themeColor}] text-black hover:brightness-110 shadow-[0_0_10px_${themeColor}40]` : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'}"><i data-lucide="shopping-bag" size="12"></i> Comprar</button></div>${combatHtml || item.tags ? `<div class="flex flex-wrap gap-1">${combatHtml}${item.tags ? item.tags.map(t => `<span class="text-[8px] bg-gray-950 text-gray-500 px-1.5 py-0.5 rounded border border-gray-800">${t}</span>`).join('') : ''}</div>` : ''}${item.detalhe ? `<p class="text-[9px] text-gray-500 leading-tight">${item.detalhe}</p>` : ''}</div>`; }).join('')}</div></div>`;
                }
                tabContent = `<div class="h-full flex flex-col">${headerHtml}<div class="flex-1 overflow-hidden relative">${bodyHtml}</div></div>`;
            } else if (state.activeTab === 'DADOS') {
                const _whs = loadWebhooks();
                const _defWh = state.defaultWebhook;
                const _selWh = state.selectedWebhook;
                const _dSub = state.dadosSubTab || 'HISTORICO';

                // ── Sub-aba HISTÓRICO ──────────────────────────────────────────
                const _historicoHtml = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                        <h3 style="font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.1em;font-size:11px">Histórico de Rolagens</h3>
                        <button onclick="clearHistory()" style="font-size:9px;color:#ef4444;text-transform:uppercase;font-weight:900;border:1px solid rgba(239,68,68,.3);padding:4px 10px;border-radius:6px;background:transparent;cursor:pointer">Limpar Log</button>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-sm pb-4">
                        ${char.history.length === 0 ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:40px 0">Sem rolagens recentes.</div>' : ''}
                        ${char.history.slice().reverse().map((h, index) => { const originalIndex = char.history.length - 1 - index; return `<div class="bg-gray-900/50 p-3 rounded-lg border-l-2 border-[${themeColor}] flex flex-col gap-1 group relative"><button onclick="copyToClipboard(${originalIndex})" class="absolute top-2 right-2 p-1.5 bg-gray-800 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all" title="Copiar para Discord"><i data-lucide="copy" size="14"></i></button><div class="flex justify-between text-[10px] text-gray-500 pr-8"><span>${h.time}</span><span class="uppercase font-bold tracking-wider text-gray-400">${h.label}</span></div><div class="flex justify-between items-center mt-1"><div class="flex flex-col"><span class="text-xs text-gray-500">Resultado</span><span class="text-2xl font-bold ${h.dice===20?'text-neon-yellow':h.dice===1?'text-neon-red':'text-white'} font-display">${h.total}</span></div>${h.img ? `<img src="${String(h.img).replace(/"/g,'&quot;')}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;border:1px solid #374151;margin:0 8px" onerror="this.style.display='none'" />` : ''}<div class="text-right"><span class="text-xs text-gray-600 block">D20 + Mod</span><span class="text-gray-300 font-mono text-sm">[${h.dice}] ${h.mod>=0?'+':''}${h.mod}</span></div></div></div>`; }).join('')}
                    </div>`;

                // ── Sub-aba DISCORD ────────────────────────────────────────────
                const _webhookListHtml = _whs.length === 0
                    ? `<div style="text-align:center;color:#4b5563;font-style:italic;padding:32px 0;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhum webhook cadastrado.<br><span style="font-size:10px;color:#374151">Adicione um abaixo.</span></div>`
                    : _whs.map((w, i) => {
                        const isDefault = _defWh === i;
                        return `<div data-wh-name="${w.name}" style="background:#111827;border:2px solid ${isDefault ? '#f59e0b' : '#1f2937'};border-radius:12px;padding:12px 14px;margin-bottom:8px;position:relative">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                                <div style="flex:1;min-width:0">
                                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                                        ${isDefault ? '<span style="font-size:9px;background:#92400e;color:#fbbf24;border-radius:4px;padding:2px 6px;font-weight:900;text-transform:uppercase;letter-spacing:.05em">⭐ Padrão</span>' : ''}
                                        <span style="font-weight:900;color:#fff;font-size:12px">${w.name}</span>
                                    </div>
                                    ${state.isAdmin
                                        ? `<div style="font-size:9px;color:#4b5563;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px">${w.url.replace(/^https:\/\/discord\.com\/api\/webhooks\//, 'discord.com/…/')}</div>`
                                        : `<div style="font-size:9px;color:#4b5563">${isDefault ? 'Rolagens vão para esta mesa.' : 'Toque em Selecionar para usar esta mesa.'}</div>`}
                                </div>
                                <div style="display:flex;gap:6px;flex-shrink:0">
                                    ${state.isAdmin
                                        ? `<button onclick="setDefaultWebhook(${i})" title="${isDefault ? 'Remover padrão' : 'Marcar como padrão'}" style="padding:6px 8px;border-radius:8px;border:2px solid ${isDefault ? '#f59e0b' : '#374151'};background:${isDefault ? '#92400e' : 'transparent'};color:${isDefault ? '#fbbf24' : '#6b7280'};cursor:pointer;font-size:13px;line-height:1">⭐</button>`
                                        : `<button onclick="setDefaultWebhook(${i})" style="padding:6px 12px;border-radius:8px;border:2px solid ${isDefault ? '#f59e0b' : '#374151'};background:${isDefault ? '#92400e' : 'transparent'};color:${isDefault ? '#fbbf24' : '#9ca3af'};cursor:pointer;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-family:'Orbitron',sans-serif;white-space:nowrap">${isDefault ? 'Selecionada' : 'Selecionar'}</button>`}
                                   ${state.isAdmin ? `<button onclick="deleteWebhook(${i})" title="Apagar webhook" style="padding:6px 8px;border-radius:8px;border:2px solid #7f1d1d;background:transparent;color:#f87171;cursor:pointer;font-size:13px;line-height:1">🗑️</button>` : ''}
                                </div>
                            </div>
                        </div>`;
                    }).join('');

                const _statusHtml = `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:10px">
                    <div style="color:#60a5fa;font-weight:900;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">📊 Status</div>
                    <div style="color:#94a3b8">${_defWh >= 0 && _whs[_defWh] ? `Padrão ativo: <strong style="color:#fff">${_whs[_defWh].name}</strong> — rolagens enviadas direto.` : _whs.length > 1 ? 'Nenhum padrão — você escolherá o destino a cada rolagem.' : _whs.length === 1 ? `Usando <strong style="color:#fff">${_whs[0].name}</strong> automaticamente.` : 'Nenhum webhook configurado.'}</div>
                </div>`;

                const _addFormHtml = state.isAdmin ? `<div style="background:#0d1117;border:2px dashed #1f2937;border-radius:12px;padding:16px;margin-top:12px">
                    <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:.15em;margin-bottom:12px">+ Novo Webhook</div>
                    <input id="wh-name-input" placeholder="Nome (ex: Mesa Principal)" style="width:100%;background:#111827;border:1px solid #374151;border-radius:8px;padding:9px 12px;color:#fff;font-size:11px;margin-bottom:8px;box-sizing:border-box;outline:none" />
                    <input id="wh-url-input" placeholder="https://discord.com/api/webhooks/..." style="width:100%;background:#111827;border:1px solid #374151;border-radius:8px;padding:9px 12px;color:#fff;font-size:10px;font-family:monospace;margin-bottom:10px;box-sizing:border-box;outline:none" />
                    <button onclick="addWebhook(document.getElementById('wh-name-input').value, document.getElementById('wh-url-input').value)" style="width:100%;padding:10px;border-radius:9px;background:#1d4ed8;border:none;color:#fff;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;font-family:'Orbitron',sans-serif">Adicionar</button>
                </div>` : `<div style="background:#0d1117;border:2px dashed #1f2937;border-radius:12px;padding:12px;margin-top:12px;text-align:center"><div style="font-size:9px;color:#4b5563;font-style:italic">As mesas são definidas pela administração. Escolha acima para onde suas rolagens vão.</div></div>`;

                // Barra de busca + botão de ocultar. Só faz sentido com várias mesas.
                const _searchHtml = _whs.length > 1 ? `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
                    <input id="wh-search-input" oninput="filterWebhookList(this.value)" placeholder="Buscar mesa..." style="flex:1;background:#111827;border:1px solid #374151;border-radius:8px;padding:8px 12px;color:#fff;font-size:11px;box-sizing:border-box;outline:none" />
                    <button id="wh-toggle-btn" onclick="toggleWebhookList()" style="padding:8px 12px;border-radius:8px;border:2px solid #374151;background:transparent;color:#9ca3af;cursor:pointer;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-family:'Orbitron',sans-serif;white-space:nowrap">Ocultar</button>
                </div>` : '';

                const _semResultadoHtml = `<div id="wh-sem-resultado" style="display:none;text-align:center;color:#4b5563;font-style:italic;padding:24px 0;font-size:11px">Nenhuma mesa encontrada.</div>`;

                const _discordHtml = `${_statusHtml}${_searchHtml}<div id="wh-lista-box">${_webhookListHtml}${_semResultadoHtml}</div>${_addFormHtml}`;

                tabContent = `<div class="p-4 h-full flex flex-col">
                    <div style="display:flex;gap:4px;margin-bottom:16px;background:#111827;border-radius:10px;padding:3px;flex-shrink:0">
                        <button onclick="setDadosSubTab('HISTORICO')" style="flex:1;padding:8px;border-radius:8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;font-family:'Orbitron',sans-serif;border:none;transition:all .15s;${_dSub==='HISTORICO'?'background:#1f2937;color:#fff;':'background:transparent;color:#4b5563;'}">🎲 Histórico</button>
                        <button onclick="setDadosSubTab('DISCORD')" style="flex:1;padding:8px;border-radius:8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;font-family:'Orbitron',sans-serif;border:none;transition:all .15s;${_dSub==='DISCORD'?'background:#1f2937;color:#fff;':'background:transparent;color:#4b5563;'}">📡 Discord${_whs.length>0?` <span style="background:#1d4ed8;color:#93c5fd;border-radius:99px;padding:1px 6px;font-size:8px">${_whs.length}</span>`:''}</button>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                        ${_dSub === 'HISTORICO' ? _historicoHtml : _discordHtml}
                    </div>
                </div>`;
            } else if (state.activeTab === 'COND') {
                const conditions = char.conditions || [];
                const rdmVal = calcRDM(char);
                const sanPct = Math.round(((char.vitals.san||100) / (char.vitals.sanMax||100)) * 100);
                const sanBarColor = sanPct >= 90 ? '#4ade80' : sanPct >= 75 ? '#fbbf24' : sanPct >= 50 ? '#f97316' : '#a78bfa';
                const activeConditions = conditions.filter(c => !c.resolved);
                const resolvedConditions = conditions.filter(c => c.resolved);
                // Os dois nomes "PERMANENTE" continuam aqui por causa das fichas salvas
                // antes da troca para "INDETERMINADO" — sem eles, uma condição antiga
                // ficaria sem cor no cartão.
                const catColors = { 'CURTA DURAÇÃO':'#fbbf24', 'LONGA DURAÇÃO':'#f87171',
                    'INDETERMINADO LEVE':'#a78bfa', 'INDETERMINADO PESADO':'#ff4df7',
                    'PERMANENTE LEVE':'#a78bfa', 'PERMANENTE PESADO':'#ff4df7',
                    'FALHA DE ÊNFASE':'#f87171' };

                const activeHtml = activeConditions.length === 0
                    ? '<div class="text-center text-gray-600 italic py-6 border-2 border-dashed border-gray-800 rounded-xl text-xs">Nenhuma condição ativa.<br><span class="text-gray-700">Reduza a Sanidade para registrar surtos.</span></div>'
                    : activeConditions.map(function(c) {
                        const cc = catColors[c.categoria] || '#9ca3af';
                        const idx = conditions.indexOf(c);
                        return '<div style="border:2px solid '+cc+'" class="bg-gray-900 rounded-xl p-4 relative mb-3">'
                            + '<div class="flex justify-between items-start mb-2">'
                            + '<div><span style="color:'+cc+'" class="text-[10px] font-bold uppercase tracking-wider">'+c.categoria+'</span>'
                            + '<div class="text-[9px] text-gray-500 mt-0.5">'+c.data+' • Sanidade '+c.sanPct+'%</div></div>'
                            + '<button onclick="window._resolveCondition('+idx+')" class="text-[9px] text-green-500 border border-green-500/40 px-2 py-1 rounded hover:bg-green-500/10 font-bold uppercase">✓ Resolver</button>'
                            + '</div>'
                            + '<div class="text-sm text-white font-semibold leading-relaxed mb-2">'+c.condicao+'</div>'
                            + '<div class="flex gap-2 flex-wrap">'
                            + '<span class="text-[9px] bg-gray-800 border border-gray-700 px-2 py-0.5 rounded font-mono">🎲 '+c.roll+'</span>'
                            + '<span style="color:'+cc+'" class="text-[9px] bg-gray-800 border border-gray-700 px-2 py-0.5 rounded font-bold">⏱ '+c.duracao+'</span>'
                            + '</div></div>';
                    }).join('');

                const resolvedHtml = resolvedConditions.length > 0
                    ? '<div class="border-t border-gray-800 pt-3 mt-3"><div class="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Resolvidas</div>'
                        + resolvedConditions.map(function(c) {
                            const cc = catColors[c.categoria] || '#9ca3af';
                            return '<div class="bg-gray-900/50 border border-gray-800 rounded-xl p-3 opacity-50 mb-2">'
                                + '<div class="text-[9px] font-bold uppercase" style="color:'+cc+'">'+c.categoria+'</div>'
                                + '<div class="text-xs text-gray-400 leading-relaxed">'+c.condicao+'</div>'
                                + '<div class="text-[9px] text-gray-600 mt-1">⏱ '+c.duracao+'</div>'
                                + '</div>';
                        }).join('')
                        + '</div>'
                    : '';

                tabContent = `<div class="p-4 h-full flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2"><i data-lucide="brain" size="14"></i> Condições de Sanidade</h3>
                        <button onclick="window._clearResolvedConditions()" class="text-[10px] text-gray-500 uppercase font-bold hover:text-red-400 border border-gray-700 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Limpar Resolvidas</button>
                    </div>
                    <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sanidade Atual</span>
                            <span class="font-display font-bold text-sm" style="color:${sanBarColor}">${char.vitals.san||100} / ${char.vitals.sanMax||100} (${sanPct}%)</span>
                        </div>
                        <div class="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                            <div style="height:100%;width:${sanPct}%;background:${sanBarColor};border-radius:99px;transition:width .4s;box-shadow:0 0 8px ${sanBarColor}88"></div>
                        </div>
                        <div class="flex justify-between text-[9px]">
                            <span style="color:${sanPct<25?'#ff4df7':'#374151'}">< 25% Perm. Pesado</span>
                            <span style="color:${sanPct<50&&sanPct>=25?'#a78bfa':'#374151'}">< 50% Perm. Leve</span>
                            <span style="color:${sanPct<75&&sanPct>=50?'#f87171':'#374151'}">< 75% Longa</span>
                            <span style="color:${sanPct<90&&sanPct>=75?'#fbbf24':'#374151'}">< 90% Curta</span>
                        </div>
                        ${rdmVal > 0 ? '<div class="mt-2 text-center text-[10px] font-bold text-blue-400">🛡️ RDM '+rdmVal+' — reduz dano mental recebido</div>' : ''}
                    </div>
                    ${(() => {
                        // ── Recuperando Sanidade ────────────────────────────────────
                        // As seis rotas do livro, todas com +INT. Nenhuma existia no app:
                        // a única recuperação era a do level-up (RDM). Três delas
                        // dependiam da Ação Protagonista, que até agora não existia.
                        //
                        // As duas automáticas (receber a Ação Protagonista e tirar 20
                        // natural) não aparecem como botão — o app já as aplicou sozinho,
                        // e um botão delas convidaria a cobrar duas vezes. Ficam listadas
                        // apagadas, para o jogador saber que existem e são automáticas.
                        const _rotas = window.SANIDADE_RECUPERACAO || [];
                        if (!_rotas.length) return '';
                        const _cheia = (char.vitals.san || 100) >= (char.vitals.sanMax || 100);
                        return `<div class="bg-gray-900 border border-gray-800 rounded-xl p-3 mb-4">
                            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">🔮 Recuperar Sanidade</div>
                            ${_cheia ? '<div class="text-[9px] text-gray-600 italic mb-2">Sanidade cheia — nada a recuperar.</div>' : ''}
                            <div style="display:flex;flex-direction:column;gap:5px">
                                ${_rotas.map(r => r.auto
                                    ? `<div style="display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:8px;border:1px dashed #1f2937;opacity:.55">
                                        <span style="font-size:12px">${r.icone}</span>
                                        <span style="flex:1;font-size:9px;color:#6b7280">${r.rotulo}</span>
                                        <span style="font-size:8px;color:#4b5563;font-weight:700">automático · ${r.dado}+INT</span>
                                    </div>`
                                    : `<button onclick="window._recuperarSanidade('${r.id}')" ${_cheia ? 'disabled' : ''}
                                        style="display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:8px;border:1px solid #c084fc33;background:#c084fc0d;cursor:${_cheia ? 'not-allowed' : 'pointer'};opacity:${_cheia ? .4 : 1};text-align:left">
                                        <span style="font-size:12px">${r.icone}</span>
                                        <span style="flex:1;font-size:9px;color:#d1d5db;font-weight:600">${r.rotulo}</span>
                                        <span style="font-size:8px;color:#c084fc;font-weight:900">${r.dado}+INT</span>
                                    </button>`).join('')}
                            </div>
                        </div>`;
                    })()}
                    <div class="flex-1 overflow-y-auto custom-scrollbar pb-4">
                        ${activeHtml}
                        ${resolvedHtml}
                    </div>
                </div>`;
            }

            // ── Sem categoria de Nen: a aba de Nen fica bloqueada ───────────────────────
            // Personagem criado com "Começar do nível 0 — Sem Nen" não tem categoria, e a aba
            // inteira depende dela (princípios, Hatsus, roda de afinidade). Em vez de desenhar
            // com dados faltando, sobrescrevemos o conteúdo da aba pelo estado de bloqueio.
            if (state.activeTab === 'NEN' && !char.class) {
                tabContent = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;text-align:center">
                    <div style="font-size:44px;margin-bottom:14px;opacity:.5">🚫</div>
                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:2px">Nen Adormecido</div>
                    <div style="font-size:11px;color:#4b5563;margin-top:12px;line-height:1.6;max-width:280px">Este personagem começou sem Nen. Quando o Nen despertar na mesa, defina a categoria para liberar princípios, Hatsus e a roda de afinidade.</div>
                </div>`;
            }


            const nextXp = char.xp_next || 100;
            const xpPct = Math.min(100, (char.xp / nextXp) * 100);
            const imgPos = char.imagePosition || { x: 50, y: 50 };
            const bgImage = char.imageUrl ? `background-image: url('${char.imageUrl}'); background-position: ${imgPos.x}% ${imgPos.y}%;` : '';

            container.innerHTML = `
            <div class="flex flex-col h-full bg-gray-950">
                ${state.activeTab !== 'INV' ? `
                <div class="flex-1 overflow-y-auto custom-scrollbar pb-20 relative">
                    <div onclick="document.getElementById('char-image-upload').click()" class="relative h-64 w-full overflow-hidden cursor-pointer group bg-gray-900 border-b border-gray-800">
                        <input type="file" id="char-image-upload" accept="image/*" class="hidden" onchange="uploadCharacterImage(this)">
                        <div class="absolute inset-0 bg-cover bg-no-repeat transition-all duration-700 group-hover:scale-105" style="${bgImage}"></div>
                        ${!char.imageUrl ? `<div class="absolute inset-0 bg-[${themeColor}]/5 flex items-center justify-center"><i data-lucide="image-plus" size="48" class="text-[${themeColor}]/30"></i></div>` : ''}
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
                        <button onclick="event.stopPropagation(); window._sairDaFicha()" class="absolute top-6 left-6 text-white/80 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 z-20 transition-all hover:bg-black/60"><i data-lucide="arrow-left" size="20"></i></button>
                        ${char.imageUrl ? `<button onclick="event.stopPropagation(); window._openImagePositionModal()" class="absolute top-6 right-6 text-white/80 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 z-20 transition-all hover:bg-black/60" title="Ajustar posição da imagem"><i data-lucide="move" size="18"></i></button>` : ''}
                        <div class="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end z-10" onclick="event.stopPropagation()">
                            <h1 contenteditable="true" 
                                onblur="updateCharProperty('name', this.innerText)"
                                onkeydown="if(event.key === 'Enter'){event.preventDefault(); this.blur();}"
                                class="font-display font-black text-3xl text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-2 break-words whitespace-normal outline-none border-b border-transparent focus:border-white/50 transition-colors"
                                style="text-shadow: 0px 2px 4px rgba(0,0,0,0.9);">${char.name}</h1>
                            <div class="flex items-center gap-4 w-full">
                                <div class="flex-1 flex flex-col gap-1">
                                    <div class="h-2.5 bg-gray-800/80 backdrop-blur rounded-full overflow-hidden border border-gray-600/50" onclick="window.openXpModal()" style="cursor:pointer" title="Clique para adicionar XP"><div class="h-full bg-[${themeColor}] shadow-[0_0_15px_${themeColor}]" style="width: ${xpPct}%;transition:width .4s"></div></div>
                                    <div class="flex justify-between px-0.5">
                                        <span class="text-[8px] text-gray-500 font-mono">${char.xp || 0} XP</span>
                                        <span class="text-[8px] font-bold cursor-pointer" style="color:${themeColor}" onclick="window.openXpModal()">+ XP</span>
                                        <span class="text-[8px] text-gray-500 font-mono">${char.xp_next || 50} XP</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 bg-black/60 backdrop-blur rounded-lg px-2 py-1 border border-white/10">
                                    <button onclick="changeLevel(-1)" class="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white hover:bg-white/20 transition-colors"><i data-lucide="minus" size="12"></i></button>
                                    <div class="flex flex-col items-center leading-none px-1"><span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Nível</span><span class="text-xl font-display font-bold text-white">${char.level}</span></div>
                                    <button onclick="window.openXpModal()" class="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white hover:bg-white/20 transition-colors"><i data-lucide="plus" size="12"></i></button>
                                </div>
                                ${state.isAdmin ? `<button onclick="event.stopPropagation(); updateCharProperty('isNPC', !state.currentChar.isNPC)"
                                    class="flex items-center gap-1 px-2 py-1.5 rounded-lg border backdrop-blur transition-colors ${char.isNPC ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-gray-600 bg-black/40 text-gray-400'}"
                                    title="Marcar/desmarcar como NPC — libera as regras de criação de Hatsu sem o limite de 1x por nível">
                                    <span class="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">${char.isNPC ? '🤖 NPC' : '👤 PJ'}</span>
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="relative">${tabContent}</div>
                </div>` : 
                `<div class="flex-1 overflow-hidden relative flex flex-col">
                    <div class="absolute top-4 left-4 z-50">
                        <button onclick="event.stopPropagation(); window._sairDaFicha()" class="text-white/80 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 transition-all hover:bg-black/60"><i data-lucide="arrow-left" size="20"></i></button>
                    </div>
                    ${tabContent}
                </div>`
                }
                ${renderRollModeModalHtml()}
                ${renderRenPromptModalHtml()}
                ${renderAcaoProtagonistaModalHtml()}
                ${renderFalhaEnfaseModalHtml()}
                ${renderRyuEntregaModalHtml()}
                ${renderEscalaPrincipioModalHtml()}
                ${renderMenuShuModalHtml()}
                ${renderTabelaRyuModalHtml()}
                ${renderRenAttackPromptModalHtml()}
                ${renderZetsuPromptModalHtml()}
                <div class="h-auto min-h-[4rem] bg-[#0e0e14] border-t border-gray-800 flex items-center justify-around px-2 relative z-50 pb-safe pt-2">
                    ${renderNavItem('FICHA', 'user', themeColor)}${renderNavItem('BIO', 'contact', themeColor)}${renderNavItem('NEN', 'flame', themeColor)}${renderNavItem('TRACOS', 'dna', themeColor)}${renderNavItem('INV', 'backpack', themeColor)}${renderNavItem('DADOS', 'dices', themeColor)}${renderNavItem('COND', 'brain', themeColor)}
                </div>
            </div>`;
        }

        function findItemData(itemName) {
            const cleanName = itemName.toLowerCase();
            for (const cat in ITEM_DB.armas) { const found = ITEM_DB.armas[cat].find(i => i.nome.toLowerCase() === cleanName || cleanName.includes(i.nome.toLowerCase())); if(found) return { ...found, category: 'Armas', sub: cat }; }
            for (const cat in ITEM_DB.armaduras) { const found = ITEM_DB.armaduras[cat].find(i => i.nome.toLowerCase() === cleanName || cleanName.includes(i.nome.toLowerCase())); if(found) return { ...found, category: 'Armaduras', sub: cat }; }
            const foundMun = ITEM_DB.municoes.find(i => i.nome.toLowerCase() === cleanName); if(foundMun) return { ...foundMun, category: 'Munições' };
            const foundMed = ITEM_DB.itens_medicos.find(i => i.nome.toLowerCase() === cleanName); if(foundMed) return { ...foundMed, category: 'Médicos' };
            const foundKit = ITEM_DB.kits.find(i => i.nome.toLowerCase() === cleanName); if(foundKit) return { ...foundKit, category: 'Kits' };
            for (const cat in ITEM_DB.equipamentos_gerais) { const found = ITEM_DB.equipamentos_gerais[cat].find(i => i.nome.toLowerCase() === cleanName); if(found) return { ...found, category: 'Gerais', sub: cat }; }
            return null;
        }

        // --- NEW CONTROLLERS FOR INVENTORY ---
        function toggleInvMode(mode) { state.invMode = mode; state.searchTerm = ''; render(true); }
        function setShopCategory(cat) { state.shopCategory = cat; state.shopSubFilter = null; render(true); }
        function setShopSubFilter(sub) { state.shopSubFilter = sub; render(true); }
        function buyItem(name, cost) { if (state.currentChar.money >= cost) { state.currentChar.money -= cost; const existingItem = state.currentChar.inventory.find(i => i.name === name); if (existingItem) { existingItem.qty += 1; } else { state.currentChar.inventory.push({ name: name, qty: 1 }); } saveCharacter(state.currentChar); render(true); } else { alert("Dinheiro insuficiente!"); } }
        function sellItem(idx) { if(confirm("Vender este item por 50% do valor original?")) { const item = state.currentChar.inventory[idx]; const data = findItemData(item.name); const value = data ? Math.floor(data.custo / 2) : 0; state.currentChar.money += value; if (item.qty > 1) { item.qty -= 1; } else { state.currentChar.inventory.splice(idx, 1); } saveCharacter(state.currentChar); render(true); } }

        // --- NEW HELPER FOR CHIMERA OPTIONS ---
        function updateTraitDetail(traitName, value) {
            if (!state.tempChar.traitDetails) state.tempChar.traitDetails = {};
            state.tempChar.traitDetails[traitName] = value;
        }

        // --- CONTROLLERS ---
        function selectChar(id) { state.currentChar = state.characters.find(c => c.id === id); state.view = 'SHEET'; state.activeTab = 'FICHA'; render(); }
        function startCreator() { state.creatorStep = 0; state.tempChar = null; state.attrMethodLocked = false; state.allocations = {}; state.view = 'CREATOR'; render(); }

        window.rollAfinidadeGenialidade = function() {
            if (!state.tempChar) return;
            // Afinidade: d100 (1-100)
            const afinidade = Math.floor(Math.random() * 100) + 1;
            // Talento para Proficiência de NEN: 2d20 (2-40)
            const d1 = Math.floor(Math.random() * 20) + 1;
            const d2 = Math.floor(Math.random() * 20) + 1;
            const genRoll = d1 + d2;
            let genialidade;
            if (genRoll === 40)       genialidade = 'Ultimate';  // 0.25%
            else if (genRoll >= 37)   genialidade = 'Gênio';     // ~2.5%
            else if (genRoll >= 30)   genialidade = 'Talentoso'; // ~18.5%
            else                      genialidade = 'Normal';    // ~78.5%
            state.tempChar.afinidade = afinidade;
            state.tempChar.genialidade = genialidade;
            state.tempChar.genialidadeRoll = genRoll;
            state.tempChar.genialidadeDice = [d1, d2];
            render(true);
        };
        function selectNenType(cls) { state.tempChar.class = cls; const clsData = SYSTEM_DB.classes.find(c => c.id === cls); if(clsData) setThemeColor(clsData.color); render(true); }
        // Aviso ao escolher a categoria manualmente. A escolha livre existe para NPCs e
        // playtesters; jogador comum normalmente rola o 1d100 ou descobre com a evolução.
        // Informa e segue: confirmar o aviso abre a seleção manual.
        window._avisoEscolhaManual = function () {
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#eaecf0';
            const ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif';
            ov.innerHTML = '<div style="background:#0d1117;border:2px solid #374151;border-radius:20px;padding:20px;width:100%;max-width:360px;text-align:center">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:#d1d5db;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">Escolher Manualmente</div>'
                + '<div style="font-size:12px;color:#9ca3af;line-height:1.6;margin-bottom:16px">Recurso para NPCs e Playtesters</div>'
                + '<div style="display:flex;gap:8px">'
                + '<button id="aviso-manual-cancel" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Voltar</button>'
                + '<button id="aviso-manual-ok" style="flex:2;padding:11px;border-radius:10px;background:#e5e7eb;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Entendido</button>'
                + '</div></div>';
            document.body.appendChild(ov);
            document.getElementById('aviso-manual-cancel').onclick = function () { ov.remove(); };
            document.getElementById('aviso-manual-ok').onclick = function () { ov.remove(); setCategoriaMetodo('chosen'); };
        };

        // Compra/ajuste de um Princípio de Nen, validando o P.N disponível.
        // Subir um nível custa a diferença; descer devolve e é sempre permitido.
        // P.N livre do personagem: total do nível menos o gasto em Princípios e Hatsus.
        window._pnLivreDoPersonagem = function (char) {
            const pnTotal = window.calcularPHBase ? window.calcularPHBase(char.level) : 6;
            const pnDominio = window.calcPNSpentInDominio ? window.calcPNSpentInDominio(char) : 0;
            const pnHatsu = (char.hatsus || []).reduce(function (s, h) { return s + (h.pnUsados || 0); }, 0);
            return pnTotal - pnDominio - pnHatsu;
        };

        window._comprarPrincipio = function (key, val) {
            const char = state.currentChar;
            if (!char.nenDominio) char.nenDominio = {};

            // Os Princípios Avançados (EN, IN, GYO, SHU, KEN, KO, RYU) e o nível Superior
            // são gravados como BOOLEANO (true/false), não como número de nível — só os
            // Fundamentais (TEN, REN, ZETSU) usam 0..3.
            //
            // A validação que eu escrevi convertia tudo com parseInt. Para os avançados,
            // parseInt(true) dá NaN e caía no "|| 0", então comprar gravava 0: o botão
            // respondia, o P.N não era cobrado e o princípio simplesmente não ligava.
            // Por isso os Fundamentais funcionavam e as Técnicas não.
            if (typeof val === 'boolean') {
                if (val) {
                    const livre = window._pnLivreDoPersonagem(char);
                    if (livre < 1) {
                        alert('P.N insuficiente\n\nEste avanço custa 1 P.N e você tem ' + Math.max(0, livre) + ' livre(s).\n\n'
                            + 'Lembre: o P.N concedido por restrições vale apenas dentro do Hatsu e não pode ser usado em Princípios de Nen.');
                        return;
                    }
                }
                char.nenDominio[key] = val;
                saveCharacter(char);
                render(true);
                return;
            }

            // ── Chaves que NÃO custam P.N ───────────────────────────────────────────
            // "_opcao" é uma ESCOLHA entre dois benefícios do mesmo aprimoramento já pago
            // (ex.: EN — menos reações OU mais alcance). Trocar de opção não compra nada.
            // Como a validação compara o valor novo com o antigo, ir da opção 1 para a 2
            // era lido como "subiu 1 nível" e cobrava 1 P.N — chegando a bloquear a troca
            // quando o pool estava esgotado.
            if (/_opcao$/.test(key)) {
                char.nenDominio[key] = parseInt(val) || 1;
                saveCharacter(char);
                render(true);
                return;
            }

            // "_pn" é o Aprimoramento: P.N extra investido depois da Maestria (Fundamentais,
            // até 7) ou do Superior (Avançados, até 8). Somado ao desbloqueio, cada princípio
            // aceita no máximo 10 P.N. Aqui ele é número e segue o caminho normal de custo.
            const atual = parseInt(char.nenDominio[key]) || 0;
            const novo = parseInt(val) || 0;
            if (novo > atual) {
                const livre = window._pnLivreDoPersonagem(char);
                const custo = novo - atual;
                if (custo > livre) {
                    alert('P.N insuficiente\n\n'
                        + 'Este avanço custa ' + custo + ' P.N e você tem ' + Math.max(0, livre) + ' livre(s).\n\n'
                        + 'Lembre: o P.N concedido por restrições vale apenas dentro do Hatsu e não pode ser usado em Princípios de Nen.');
                    return;
                }
            }
            char.nenDominio[key] = novo;
            saveCharacter(char);
            render(true);
        };

        function setCategoriaMetodo(method) {
            state.tempChar.categoriaMetodo = method;
            // "Sem Nen": o personagem começa nível 0 sem categoria. Limpamos categoria,
            // afinidade e talento para nada ficar meio-preenchido de uma escolha anterior.
            // Os cálculos que dependem de categoria já têm padrão de segurança:
            // tema cai em verde neon (sheet.js:70) e dado de vida em d8 (sheet.js:2016).
            if (method === 'semnen') {
                state.tempChar.class = null;
                state.tempChar.afinidade = null;
                state.tempChar.genialidade = null;
                state.tempChar.categoriaRoll = null;
            }
            render(true);
        }
        function rollCategoriaNen() {
            const roll = Math.floor(Math.random() * 100) + 1;
            const cls = window.rollCategoriaNenTable ? window.rollCategoriaNenTable(roll) : 'INTENSIFICAÇÃO';
            state.tempChar.categoriaMetodo = 'rolled';
            state.tempChar.categoriaRoll = roll;
            selectNenType(cls);
        }
        // ── Inclinações Gerais: a "1ª de graça" só pode ser uma inclinação BÁSICA ──
        // Antes o sistema chutava "básica = custo <= 3", porque não havia marcação nos dados.
        // Isso errava nos dois sentidos: Corpo de Gigante (básica, custo 5) nunca podia ser a
        // grátis, e Habitat Natural / Memória Excepcional (não-básicas, custo 1) contavam como
        // grátis. Agora a lista vem do livro, via isInclinacaoBasica (config.js).
        // Sem nenhuma básica selecionada, não há desconto (freeCost = 0).
        function calcGeneralIncFreeCost(positiveList) {
            const basics = (positiveList || []).filter(i => isInclinacaoBasica(i.nome, 'positive'));
            if (basics.length === 0) return 0;
            return Math.max(...basics.map(i => i.custo));
        }

        // ── Aura Gigantesca: +30% de Aura Máxima ───────────────────────────────────
        // A inclinação existia só como texto no config.js; nunca foi aplicada em lugar nenhum.
        // ── Migração única: os bônus de Maestria mudaram de valor ───────────────────
        // O capítulo atualizado dá +1 em atributo nas Maestrias (este arquivo aplicava +2
        // em várias) e usa "ou" (escolha) onde havia "e" (fixo). Trocar só o banco não
        // resolve: o ledger char.combatInclinationAttrApplied registra QUE o bônus foi
        // aplicado, não QUANTO. Sem desfazer o valor antigo acontecia um de dois erros:
        //   • valor diferente → o save não refaz nada e o +2 antigo ficava para sempre;
        //   • fixo → escolha  → o ledger guarda `true`, escolha.find(o => o.attr === true)
        //     não acha nada, nada é subtraído e o novo bônus soma em cima (valor dobrado).
        // Aqui o bônus antigo é devolvido usando COMBAT_INC_ATTR_LEGADO. Quando o bônus
        // novo é FIXO, ele já é aplicado na hora (não há o que escolher). Quando é ESCOLHA,
        // a entrada do ledger é limpa e o modal passa a exigir o atributo antes de salvar —
        // é a "realocação" que o aviso pede.
        function migrarBonusMaestria(char) {
            if (!char || char.migracaoIncV2) return false;
            if (!window.COMBAT_INCLINATIONS_DB || !window.COMBAT_INC_ATTR_LEGADO) return false;
            const ledger = char.combatInclinationAttrApplied || {};
            const mesmo = function (a, b) { return JSON.stringify(a || null) === JSON.stringify(b || null); };

            window.COMBAT_INCLINATIONS_DB.forEach(function (inc) {
                const legado = window.COMBAT_INC_ATTR_LEGADO[inc.id];
                if (!legado) return;                       // inclinação nova: nada aplicado antes
                if (mesmo(legado, inc.attrBonus)) return;  // definição não mudou
                const aplicado = ledger[inc.id];
                if (aplicado === undefined) return;        // nunca chegou a aplicar

                // Devolve o bônus ANTIGO. O tipo do valor no ledger diz qual forma antiga
                // foi usada: `true` = fixo, string = escolha. Se não casar, não arrisca um
                // número errado: deixa como está para o jogador conferir na mão.
                let devolveu = false;
                if (legado.fixo && aplicado === true) {
                    legado.fixo.forEach(function (b) {
                        if (char.attributes[b.attr]) char.attributes[b.attr].value -= b.valor;
                    });
                    devolveu = true;
                } else if (legado.escolha && typeof aplicado === 'string') {
                    const opt = legado.escolha.filter(function (o) { return o.attr === aplicado; })[0];
                    if (opt && char.attributes[opt.attr]) {
                        char.attributes[opt.attr].value -= opt.valor;
                        devolveu = true;
                    }
                }
                if (!devolveu) return;

                if (inc.attrBonus && inc.attrBonus.fixo) {
                    inc.attrBonus.fixo.forEach(function (b) {
                        if (char.attributes[b.attr]) char.attributes[b.attr].value += b.valor;
                    });
                    ledger[inc.id] = true;
                } else {
                    // escolha (ou bônus removido): o jogador decide no modal.
                    delete ledger[inc.id];
                }
            });

            char.combatInclinationAttrApplied = ledger;
            char.migracaoIncV2 = true;
            // Retorna SEMPRE true: a flag precisa ser gravada mesmo quando nada mudou.
            // Sem isso, um personagem sem nada a migrar não salvaria a marca e a migração
            // rodaria de novo no próximo render — e aí, num personagem que TINHA algo a
            // migrar, o bônus antigo seria subtraído duas vezes.
            return true;
        }

        // ── Dedup CONJURAÇÃO → MATERIALIZAÇÃO (restrições de categoria) ─────────────
        // As 9 restrições rc_l*/rc_m*/rc_p* saíram do banco por serem duplicatas exatas
        // das rm_*. O Hatsu salvo guarda o ID CRU em h.restricoes, então sem esta
        // conversão `catDB.restricoes.find(r => r.id === id)` devolveria undefined, o
        // .filter(Boolean) dropava a restrição e o jogador perderia o benefício, o
        // desconto de aura e os graus de potência que pagou — sem nenhuma mensagem.
        // Converte também as chaves paralelas (beneficioChoices, pureRestrictions,
        // specialChoices), porque rc_p2 tinha benefício de escolha.
        function migrarRestricoesConjuracao(char) {
            if (!char || char.migracaoDedupConjuracao) return false;
            const MAPA = window.ID_DEDUP_CONJURACAO;
            if (!MAPA) return false;

            (char.hatsus || []).forEach(function (h) {
                if (!h) return;

                // h.restricoes: troca pelo equivalente e remove duplicata, para quem
                // tinha as DUAS marcadas não ficar com o mesmo id repetido no array.
                if (Array.isArray(h.restricoes)) {
                    const vistos = {};
                    h.restricoes = h.restricoes.map(function (id) {
                        return MAPA[id] || id;
                    }).filter(function (id) {
                        if (vistos[id]) return false;
                        vistos[id] = true;
                        return true;
                    });
                }

                // Chaves por id. A chave do rm_* equivalente tem prioridade: se o
                // jogador preencheu as duas, a que ele escolheu no Hatsu "oficial" vence.
                ['beneficioChoices', 'pureRestrictions', 'specialChoices'].forEach(function (campo) {
                    const obj = h[campo];
                    if (!obj || typeof obj !== 'object') return;
                    Object.keys(obj).forEach(function (k) {
                        // cobre 'rc_p2' e sufixos como 'rc_p2_carac'
                        const base = k.slice(0, 5);
                        const novo = MAPA[base];
                        if (!novo) return;
                        const kNovo = novo + k.slice(5);
                        if (obj[kNovo] === undefined) obj[kNovo] = obj[k];
                        delete obj[k];
                    });
                });
            });

            char.migracaoDedupConjuracao = true;
            // Retorna SEMPRE true, pelo mesmo motivo do migrarBonusMaestria: a flag
            // precisa ser gravada mesmo quando este personagem não tinha nenhum rc_*.
            return true;
        }

        // ── eg4 (Efeito Alternativo): chaves de nome → id ──────────────────────────
        // As 4 chaves do eg4 em specialChoices guardavam o NOME do efeito/restrição:
        //   eg4            → efeito adicionado no modo
        //   eg4_remove     → efeito removido no modo
        //   eg4_restr_off  → restrições da raiz desligadas no modo
        //   eg4_restr_add  → restrições exclusivas do modo
        // Nome não é chave confiável: "Sem Movimento no Turno" existe como rt_l2
        // (TRANSMUTAÇÃO, +2 Grau/Passo de Alcance) e em_l2 (EMISSÃO, ignora cobertura
        // total), com benefícios diferentes, e o find() devolvia sempre o primeiro.
        // Os 165 efeitos do banco têm nome único, então os dois campos de efeito são
        // conversão direta; só as restrições precisam desempatar.
        // Sufixo '#N' é o modo (eg4_restr_off#1 = Modo C).
        // ── eg6 e rm_e8: nome do efeito → id ────────────────────────────────────────
        // O eg4 virou id no PR #62 porque dois nomes de restrição iguais (rt_l2 e em_l2,
        // "Sem Movimento no Turno") faziam o lookup por nome pegar a errada. Estes dois
        // wrappers ficaram para trás guardando o NOME do efeito escolhido. Hoje o risco é
        // teórico — a colisão conhecida é entre restrições, e eles escolhem efeitos — mas
        // o padrão fica inconsistente e quebra no dia em que dois efeitos dividirem nome.
        //
        // Flag própria: migracaoEg4Ids já está marcada em quem passou pela migração
        // anterior, então reaproveitá-la deixaria estes dois sem migrar para sempre.
        function migrarEg6RmE8ParaIds(char) {
            if (!char || char.migracaoEg6RmE8Ids) return false;
            const D = window.HATSU_DB;
            if (!D) return false;
            const idPorNome = {}, existeId = {};
            const anotar = function (e) {
                if (!e || !e.id) return;
                existeId[e.id] = true;
                if (!idPorNome[e.nome]) idPorNome[e.nome] = e.id;   // nomes de efeito são únicos
            };
            (D.efeitos_gerais || []).forEach(anotar);
            const vistos = [];
            Object.keys(D.categorias || {}).forEach(function (k) {
                const cat = D.categorias[k];
                if (!cat || vistos.indexOf(cat) >= 0) return;   // CONJURAÇÃO é alias de MATERIALIZAÇÃO
                vistos.push(cat);
                (cat.efeitos || []).forEach(anotar);
            });
            (char.hatsus || []).forEach(function (h) {
                const sc = h && h.specialChoices;
                if (!sc || typeof sc !== 'object') return;
                ['eg6', 'rm_e8'].forEach(function (k) {
                    const v = sc[k];
                    if (typeof v !== 'string' || !v) return;
                    if (existeId[v]) return;                 // já é id
                    if (idPorNome[v]) sc[k] = idPorNome[v];  // nome conhecido → id
                    // Nome desconhecido: PRESERVA, igual ao migrarEg4ParaIds. Destruir o
                    // dado é pior que deixar um valor que o jogador pode reescolher.
                });
            });
            char.migracaoEg6RmE8Ids = true;
            return true;   // sempre true, para a flag ser salva junto
        }
        function migrarEg4ParaIds(char) {
            if (!char || char.migracaoEg4Ids) return false;
            const D = window.HATSU_DB;
            if (!D) return false;

            const efeitos = [].concat(D.efeitos_gerais || []);
            const restr = [];
            const catDeRestr = {};   // id da restrição → categoria onde vive ('' = geral)
            const vistos = [];
            Object.keys(D.categorias || {}).forEach(function (k) {
                const cat = D.categorias[k];
                if (!cat || vistos.indexOf(cat) >= 0) return;   // CONJURAÇÃO é alias
                vistos.push(cat);
                (cat.efeitos || []).forEach(function (e) { efeitos.push(e); });
                (cat.restricoes || []).forEach(function (r) { restr.push(r); catDeRestr[r.id] = k; });
            });
            Object.keys(D.restricoes_gerais || {}).forEach(function (k) {
                const g = D.restricoes_gerais[k];
                if (Array.isArray(g)) g.forEach(function (r) { restr.push(r); catDeRestr[r.id] = ''; });
            });

            const idEfeito = {};     // nome → id (nomes de efeito são únicos)
            efeitos.forEach(function (e) { if (!idEfeito[e.nome]) idEfeito[e.nome] = e.id; });
            const idsRestr = {};     // nome → [ids] (pode ter mais de um)
            restr.forEach(function (r) { (idsRestr[r.nome] = idsRestr[r.nome] || []).push(r.id); });
            const existeRestr = {};
            restr.forEach(function (r) { existeRestr[r.id] = true; });

            // Resolve um valor salvo. Devolve o id, o próprio valor se já era id, ou
            // null quando não há como desempatar — aí o botão aparece desmarcado e o
            // jogador reescolhe, que é melhor que aplicar a restrição errada em silêncio.
            const resolver = function (valor, h, ehOff) {
                if (typeof valor !== 'string' || !valor) return null;
                if (existeRestr[valor]) return valor;          // já migrado
                const cands = idsRestr[valor] || [];
                if (cands.length === 0) return valor;           // nome desconhecido: preserva
                if (cands.length === 1) return cands[0];
                if (ehOff) {
                    // A restrição desligada está na raiz do Hatsu: isso desempata sempre.
                    const naRaiz = cands.filter(function (id) {
                        return (h.restricoes || []).indexOf(id) >= 0;
                    });
                    if (naRaiz.length === 1) return naRaiz[0];
                }
                // Restrição exclusiva do modo: desempata pela categoria do Hatsu.
                const cats = [h.classe, h.tipoA, h.tipoB].filter(Boolean);
                const daCat = cands.filter(function (id) { return cats.indexOf(catDeRestr[id]) >= 0; });
                if (daCat.length === 1) return daCat[0];
                return null;
            };

            (char.hatsus || []).forEach(function (h) {
                const sc = h && h.specialChoices;
                if (!sc || typeof sc !== 'object') return;
                Object.keys(sc).forEach(function (k) {
                    if (/^eg4(_remove)?(#\d+)?$/.test(k)) {
                        const v = sc[k];
                        if (typeof v === 'string' && v && idEfeito[v]) sc[k] = idEfeito[v];
                        return;
                    }
                    if (/^eg4_restr_(off|add)(#\d+)?$/.test(k) && Array.isArray(sc[k])) {
                        const ehOff = k.indexOf('_off') >= 0;
                        sc[k] = sc[k].map(function (v) { return resolver(v, h, ehOff); })
                                     .filter(function (v) { return v !== null; });
                    }
                });
            });

            char.migracaoEg4Ids = true;
            // Retorna SEMPRE true, pelo mesmo motivo das outras migrações.
            return true;
        }

        // ── Aviso único: a mecânica das Inclinações de Combate mudou ────────────────
        // As Inclinações passaram a exigir Nen e Princípios/Técnicas, e as Instâncias
        // Shingen-Ryu saíram dos Pontos de Inclinação para o P.N. Quem já tinha pontos
        // distribuídos precisa conferir (e provavelmente realocar) o que comprou, então
        // o aviso aparece UMA vez por personagem, marcado em char.avisoInclinacoesV2.
        function avisarRealocacaoInclinacoes(char) {
            if (!char || char.avisoInclinacoesV2) return;
            const ci = char.combatInclinations || {};
            const temAlgo = Object.keys(ci).some(function (k) { return (ci[k] || 0) > 0; });
            if (!temAlgo) return;   // nada comprado: não há o que realocar
            const porta = window.podeComprarInclinacoes
                ? window.podeComprarInclinacoes(char) : { ok: true, motivo: '' };
            const tc = '#f97316';
            const ov = document.createElement('div');
            ov.id = 'inc-v2-overlay';
            ov.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px;font-family:Rajdhani,sans-serif';
            ov.innerHTML = '<div style="background:#0d1117;border:2px solid ' + tc + ';border-radius:20px;padding:20px;width:100%;max-width:400px;box-shadow:0 0 60px ' + tc + '44">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + tc + ';text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">\u2694 As Inclinações mudaram</div>'
                + '<div style="font-size:11px;color:#d1d5db;line-height:1.65;margin-bottom:12px">'
                + '<b>Realoque as inclinações que você comprou de acordo com a nova mecânica.</b><br><br>'
                + 'O que mudou:<br>'
                + '\u2022 Inclinações de Combate agora exigem Nen e ao menos 1 Princípio ou Técnica desbloqueado.<br>'
                + '\u2022 As <b>Instâncias Shingen-Ryu</b> saíram dos Pontos de Inclinação: agora custam <b>P.N</b> (2 no Nível 1, 3 no Nível 2).'
                + '</div>'
                + (porta.ok ? '' : '<div style="background:#1f2937;border:1px solid #374151;border-radius:9px;padding:9px 11px;font-size:10px;color:#9ca3af;margin-bottom:12px">\u26a0 Este personagem está bloqueado agora: ' + porta.motivo + ' O que já estava investido continua na ficha.</div>')
                + '<div style="display:flex;gap:8px">'
                + '<button onclick="window._incV2Fechar()" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Depois</button>'
                + (porta.ok ? '<button onclick="window._incV2Abrir()" style="flex:2;padding:11px;border-radius:10px;background:' + tc + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Realocar agora</button>' : '')
                + '</div></div>';
            document.body.appendChild(ov);
            char.avisoInclinacoesV2 = true;
            saveCharacter(char);
        }
        window._incV2Fechar = function () { document.getElementById('inc-v2-overlay')?.remove(); };
        window._incV2Abrir = function () {
            document.getElementById('inc-v2-overlay')?.remove();
            window._openCombatIncModal && window._openCombatIncModal();
        };

        // A aura base é 100 e os ganhos de nível (auraP) já entram como pontos percentuais
        // somados a essa base (nível 1 = +5 -> 105). Aura Gigantesca segue a mesma régua.
        // Ex.: 100 (base) + 30 (Aura Gigantesca) + 5 (nível 1) = 135.
        const AURA_GIGANTESCA_BONUS = 30;
        function temAuraGigantesca(char) {
            return ((((char || {}).inclinations) || {}).positive || [])
                .some(i => i.nome === 'Aura Gigantesca');
        }
        // Aplica o bônus UMA ÚNICA VEZ por personagem, inclusive nos que já existem.
        // O marcador auraGiganteAplicada impede aplicação dupla a cada render.
        function aplicarAuraGigantesca(char) {
            if (!char || !char.vitals) return false;
            if (!temAuraGigantesca(char)) return false;
            if (char.auraGiganteAplicada) return false;
            char.vitals.auraMax = (char.vitals.auraMax || 100) + AURA_GIGANTESCA_BONUS;
            char.vitals.aura = Math.min(char.vitals.auraMax, (char.vitals.aura || 0) + AURA_GIGANTESCA_BONUS);
            char.auraGiganteAplicada = true;
            return true;
        }
        window.aplicarAuraGigantesca = aplicarAuraGigantesca;

        // ── Popup de escolha de Equipamento do Antecedente ("etapa 4") ──────────────────────────
        // O array `equipamento` de um antecedente mistura itens fixos com alternativas em texto
        // livre ("A ou B", "Qualquer arma simples/Marcial", "Qualquer outro Kit"). Sem resolver isso
        // pra um nome real do ITEM_DB, o item entra "quebrado" no inventário (sem dano/CA/peso — ver
        // findItemData, sheet.js:765). classifyEquipSlot decide o tipo de cada posição do array.
        const EQUIP_FLAVOR_PASSTHROUGH = [
            'Celular com contato ou anotações de seu mestre', // Discípulo — sabor, não é escolha de item real
            'Bíblia, ou qualquer outro livro sagrado',         // Religioso — idem
        ];
        // Mismatches conhecidos entre o texto do antecedente e o nome exato no ITEM_DB.
        const EQUIP_NAME_ALIASES = {
            'Kit de Caça e Rastreio de Criaturas': 'Kit de Caça e Rastreio',
            'Kit de Ferramenta de Ofício': 'Kit Ferramentas Ofício',
            'Kit de Ferramentas de Ofício': 'Kit Ferramentas Ofício',
            'Mochila Comum/Maleta': 'Mochila',
            'Espingarda Carregada': 'Espingarda',
            'Tazer': 'Tazer (3 Cargas)',
            '1 Mala de Roupas': 'Mala de Roupas', // Soldado: "1 Mala de Roupas ou Mochila Comum/Maleta"
        };
        function resolveEquipName(nome) { return EQUIP_NAME_ALIASES[nome] || nome; }
        function getWeaponPool(category) {
            const { simples_corpo_a_corpo, simples_distancia, marciais_corpo_a_corpo, marciais_distancia } = ITEM_DB.armas;
            if (category === 'simples') return [...simples_corpo_a_corpo, ...simples_distancia];
            if (category === 'marcial') return [...marciais_corpo_a_corpo, ...marciais_distancia];
            return [...simples_corpo_a_corpo, ...simples_distancia, ...marciais_corpo_a_corpo, ...marciais_distancia];
        }
        function classifyEquipSlot(str) {
            const s = (str || '').trim();
            if (EQUIP_FLAVOR_PASSTHROUGH.includes(s)) return { type: 'fixed' };
            // "Qualquer equipamento dentro do orçamento de X$" (Negociante) — mini-loja com teto de
            // gasto, mecânica separada; fica como texto por ora.
            if (/qualquer equipamento dentro do orçamento/i.test(s)) return { type: 'fixed' };
            if (/^qualquer outro kit$/i.test(s)) return { type: 'kit-any' };
            const weaponMatch = s.match(/^Qualquer arma (simples ou Marcial|simples|Marcial)(\s+e\s+(.+))?$/i);
            if (weaponMatch) {
                const catRaw = weaponMatch[1].toLowerCase();
                const category = catRaw.includes('simples') && catRaw.includes('marcial') ? 'ambas' : catRaw.includes('marcial') ? 'marcial' : 'simples';
                return { type: 'weapon-category', category, extra: weaponMatch[3] ? weaponMatch[3].trim() : null };
            }
            if (/\bou\b/i.test(s)) {
                const parts = s.split(/\s+ou\s+/i).map(p => p.trim()).filter(Boolean);
                if (parts.length > 1) return { type: 'choice', options: parts };
            }
            return { type: 'fixed' };
        }
        // Slots (índices do array `equipamento`) que precisam de uma escolha do jogador.
        function getPendingEquipSlots(bgData) {
            if (!bgData) return [];
            return bgData.equipamento.map((str, idx) => ({ idx, str, info: classifyEquipSlot(str) })).filter(s => s.info.type !== 'fixed');
        }
        function selectBackground(bgName) {
            if (state.tempChar.background !== bgName) {
                state.tempChar.background = bgName;
                state.tempChar.backgroundFeature = null;
                const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === bgName);
                const pending = getPendingEquipSlots(bgData);
                state.tempChar.equipChoices = {};
                pending.forEach(slot => {
                    if (slot.info.type === 'choice') state.tempChar.equipChoices[slot.idx] = slot.info.options[0];
                    else if (slot.info.type === 'weapon-category') state.tempChar.equipChoices[slot.idx] = getWeaponPool(slot.info.category)[0].nome;
                    else if (slot.info.type === 'kit-any') state.tempChar.equipChoices[slot.idx] = [...ITEM_DB.kits, ...ITEM_DB.itens_medicos][0].nome;
                });
                state.equipChoiceModalOpen = pending.length > 0;
            }
            render(true);
        }
        function openEquipChoiceModal() { state.equipChoiceModalOpen = true; render(true); }
        function closeEquipChoiceModal() { state.equipChoiceModalOpen = false; render(true); }
        function setEquipChoice(idx, value) { if (!state.tempChar.equipChoices) state.tempChar.equipChoices = {}; state.tempChar.equipChoices[idx] = value; render(true); }
        function renderEquipChoiceModalHtml() {
            if (!state.equipChoiceModalOpen || !state.tempChar || !state.tempChar.background) return '';
            const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background);
            const pending = getPendingEquipSlots(bgData);
            if (pending.length === 0) return '';
            const choices = state.tempChar.equipChoices || {};
            const rows = pending.map(slot => {
                let optionsHtml = '';
                let label = slot.str;
                if (slot.info.type === 'choice') {
                    optionsHtml = slot.info.options.map(o => `<option value="${o}" ${choices[slot.idx] === o ? 'selected' : ''}>${o}</option>`).join('');
                } else if (slot.info.type === 'weapon-category') {
                    label = slot.info.category === 'ambas' ? 'Qualquer arma simples ou Marcial' : `Qualquer arma ${slot.info.category}`;
                    if (slot.info.extra) label += ` (+ ${slot.info.extra} incluso)`;
                    optionsHtml = getWeaponPool(slot.info.category).map(w => `<option value="${w.nome}" ${choices[slot.idx] === w.nome ? 'selected' : ''}>${w.nome} (${w.dano} ${w.tipo_dano||''})</option>`).join('');
                } else if (slot.info.type === 'kit-any') {
                    label = 'Qualquer outro Kit';
                    optionsHtml = [...ITEM_DB.kits, ...ITEM_DB.itens_medicos].map(k => `<option value="${k.nome}" ${choices[slot.idx] === k.nome ? 'selected' : ''}>${k.nome}</option>`).join('');
                }
                return `<div class="mb-3">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">${label}</label>
                    <select onchange="setEquipChoice(${slot.idx}, this.value)" class="w-full bg-black border border-gray-700 rounded p-2 text-xs text-white outline-none focus:border-neon-theme">${optionsHtml}</select>
                </div>`;
            }).join('');
            return `<div class="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onclick="closeEquipChoiceModal()">
                <div style="background:#0d1117;border:2px solid var(--theme-color-hex,#00ff9d);border-radius:16px;padding:20px;width:100%;max-width:360px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()">
                    <div class="font-display font-black text-sm text-white uppercase tracking-widest mb-1">⚔️ Escolha seu Equipamento</div>
                    <div class="text-[10px] text-gray-500 mb-4">${state.tempChar.background} — resolva as alternativas abaixo.</div>
                    ${rows}
                    <button onclick="closeEquipChoiceModal()" class="w-full mt-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider" style="background:var(--theme-color-hex,#00ff9d);color:#000">Confirmar</button>
                </div>
            </div>`;
        }
        function selectBackgroundFeature(featureName) { state.tempChar.backgroundFeature = featureName; }
        function toggleInclination(type, name, value) { const list = state.tempChar.inclinations[type]; const existsIdx = list.findIndex(i => i.nome === name); if (existsIdx >= 0) { list.splice(existsIdx, 1); } else { list.push({ nome: name, [type === 'positive' ? 'custo' : 'valor']: value }); } render(true); }
        function selectRace(raceName) { state.tempChar.race = raceName; state.allocations = {}; state.tempChar.raceFeatureChoice = null; render(true); }
        // Escolha genérica de "1 entre N" características raciais (qualquer raça com `opcoes_caracteristica`
        // em SYSTEM_DB.racas — antes só existia texto informativo, sem seleção real nem exibição em Traços).
        function selectRaceFeatureChoice(nome) { state.tempChar.raceFeatureChoice = nome; render(true); }
        // "Esforço no lugar de talento" (Humano Comum) — ao trocar a raça-fonte, limpa a característica
        // escolhida (as opções mudam por raça, não faz sentido manter a seleção anterior).
        // Aviso ao abrir a lista de raças-fonte do Humano Comum: a regra concede APENAS a
        // característica escolhida, nunca os pontos de atributo daquela raça. Aparece uma vez
        // por sessão de criação, para não incomodar a cada clique no dropdown.
        window._avisoEsforcoHumano = function () {
            if (!state.tempChar || state.tempChar._avisoEsforcoVisto) return;
            state.tempChar._avisoEsforcoVisto = true;
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#eaecf0';
            const ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif';
            ov.innerHTML = '<div style="background:#0d1117;border:2px solid ' + tc + ';border-radius:20px;padding:20px;width:100%;max-width:380px">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + tc + ';text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">💪 Esforço no Lugar de Talento</div>'
                + '<div style="font-size:11px;color:#d1d5db;line-height:1.6;margin-bottom:14px">Os <b>pontos de atributo</b> da raça escolhida <b style="color:#f87171">não são recebidos</b>. O Humano Comum ganha apenas a <b style="color:' + tc + '">característica</b> que você selecionar.</div>'
                + '<button id="aviso-esforco-ok" style="width:100%;padding:11px;border-radius:10px;background:' + tc + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Entendido</button>'
                + '</div>';
            document.body.appendChild(ov);
            document.getElementById('aviso-esforco-ok').onclick = function () { ov.remove(); };
        };

        function selectEffortRace(raceName) {
            state.tempChar.effortRace = raceName || null;
            state.tempChar.effortTrait = null;
            render(true);
        }
        function selectEffortTrait(traitName) { state.tempChar.effortTrait = traitName; render(true); }
        // ── Formiga Quimera: fagogênese, referência pronta, tamanho e deslocamento de inseto ──────
        // Trocar a categoria de fagogênese invalida a referência pronta escolhida (presets são por categoria).
        function selectFagogenese(value) { state.tempChar.fagogenese = value; state.tempChar.fqPreset = null; render(true); }
        function selectFQTamanho(tamanho) { state.tempChar.fqTamanho = tamanho; render(true); }
        function selectFQPequenoPenalidade(attr) { state.tempChar.fqPequenoPenalidade = attr; render(true); }
        function selectFQInsetoDeslocamento(tipo) { state.tempChar.fqInsetoDeslocamento = tipo; render(true); }
        function selectFQPreset(nome) {
            state.tempChar.fqPreset = nome || null;
            if (nome) {
                const presetsList = (SYSTEM_DB.fqPresets && SYSTEM_DB.fqPresets[state.tempChar.fagogenese]) || [];
                const preset = presetsList.find(p => p.nome === nome);
                if (preset) {
                    if (!state.tempChar.raceTraits) state.tempChar.raceTraits = [];
                    if (!state.tempChar.traitDetails) state.tempChar.traitDetails = {};
                    (preset.tracosSugeridos || []).forEach(sug => {
                        if (state.tempChar.raceTraits.length >= 3) return; // respeita o limite de 3 traços
                        if (!state.tempChar.raceTraits.includes(sug.nome)) state.tempChar.raceTraits.push(sug.nome);
                        if (sug.opcao) state.tempChar.traitDetails[sug.nome] = sug.opcao;
                    });
                }
            }
            render(true);
        }
        function toggleRaceTrait(traitName) { const list = state.tempChar.raceTraits || []; const idx = list.indexOf(traitName); if (idx >= 0) { list.splice(idx, 1); if(state.tempChar.traitDetails && state.tempChar.traitDetails[traitName]) { delete state.tempChar.traitDetails[traitName]; } } else { if (list.length >= 3) { alert("Você só pode escolher até 3 características."); return; } list.push(traitName); } state.tempChar.raceTraits = list; render(true); }
        function toggleCreatorSkill(skill, type = 'main') { const list = type === 'main' ? state.tempChar.skills : state.tempChar.otherSkills; const bgSkillsText = state.tempChar.background ? SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background).proficiencias : ""; const isBgSkill = type === 'main' && bgSkillsText.includes(skill); let limit = type === 'main' ? 5 : 4; if (type === 'other') { if (bgSkillsText.includes("Kit") || bgSkillsText.includes("Ferramenta")) { limit = 5; } } const idx = list.indexOf(skill); if (idx >= 0) { list.splice(idx, 1); } else { if (!isBgSkill) { const currentManualCount = list.filter(s => !bgSkillsText.includes(s)).length; if (currentManualCount >= limit) { alert(`Limite de ${limit} escolhas manuais atingido.`); return; } } list.push(skill); } render(true); }
        // ── Gerenciamento de Webhooks do Discord ─────────────────────────────
        const _WEBHOOKS_KEY = 'hxhrpg_webhooks';

        // ── Webhooks: mesas oficiais + extras locais do admin ──────────────────────
        // Antes, a lista inteira vinha do localStorage, ou seja, cada navegador tinha a
        // sua. O que o admin cadastrava nunca chegava aos jogadores. Agora as mesas
        // oficiais vêm de WEBHOOKS_OFICIAIS (config.js), publicadas para todo mundo, e o
        // localStorage guarda só os extras que o admin cadastra para testar na máquina
        // dele. Extras nunca aparecem para jogador.
        function loadOfficialWebhooks() {
            return ((window.WEBHOOKS_OFICIAIS) || []).map(function (w) {
                return { name: w.name, url: w.url, threadId: w.threadId || null, oficial: true };
            });
        }
        function loadLocalWebhooks() {
            try {
                const raw = JSON.parse(localStorage.getItem(_WEBHOOKS_KEY) || '[]');
                return raw.map(function (w) { return { name: w.name, url: w.url, oficial: false }; });
            } catch { return []; }
        }
        function saveWebhooks(list) {
            // Só os extras locais são gravados; as oficiais moram no código.
            const locais = (list || []).filter(function (w) { return !w.oficial; })
                .map(function (w) { return { name: w.name, url: w.url }; });
            localStorage.setItem(_WEBHOOKS_KEY, JSON.stringify(locais));
        }
        function loadWebhooks() {
            const oficiais = loadOfficialWebhooks();
            // Jogador enxerga apenas as mesas oficiais.
            if (!state.isAdmin) return oficiais;
            return oficiais.concat(loadLocalWebhooks());
        }
        // ── Lembrar a mesa escolhida entre sessões ────────────────────────────────
        // state.selectedWebhook/defaultWebhook nascem zerados a cada carregamento, então o
        // jogador precisava reescolher a mesa toda vez que abria o app. Guardamos a escolha
        // pela URL (não pelo índice), para não apontar para a mesa errada quando a lista mudar.
        const _WEBHOOK_ESCOLHIDO_KEY = 'hxhrpg_webhook_escolhido';
        function salvarMesaEscolhida(idx) {
            const wh = loadWebhooks()[idx];
            try {
                if (wh && wh.url) localStorage.setItem(_WEBHOOK_ESCOLHIDO_KEY, wh.url);
                else localStorage.removeItem(_WEBHOOK_ESCOLHIDO_KEY);
            } catch (e) {}
        }
        function restaurarMesaEscolhida() {
            let url = null;
            try { url = localStorage.getItem(_WEBHOOK_ESCOLHIDO_KEY); } catch (e) {}
            if (!url) return;
            const i = loadWebhooks().findIndex(function (w) { return w.url === url; });
            if (i >= 0) { state.defaultWebhook = i; state.selectedWebhook = i; }
        }

        function initWebhooks() {
            // A lista base agora vem do código; nada a semear no localStorage.
            // Remove a semente antiga para a Mesa Principal não aparecer duplicada.
            const antigos = loadLocalWebhooks();
            const oficiaisUrls = loadOfficialWebhooks().map(function (w) { return w.url; });
            const limpos = antigos.filter(function (w) { return oficiaisUrls.indexOf(w.url) === -1; });
            if (limpos.length !== antigos.length) saveWebhooks(limpos);
            restaurarMesaEscolhida();
        }
        function addWebhook(name, url) {
            // Trava real: antes a checagem existia só no botão, então dava para chamar
            // esta função pelo console do navegador mesmo sem ser admin.
            if (!state.isAdmin) return;
            name = (name || '').trim(); url = (url || '').trim();
            if (!name || !url) return;
            saveWebhooks(loadLocalWebhooks().concat([{ name, url, oficial: false }]));
            render(true);
        }
        function deleteWebhook(idx) {
            if (!state.isAdmin) return;
            const list = loadWebhooks();
            // Mesa oficial não se apaga pela interface: ela mora no config.js.
            if (!list[idx] || list[idx].oficial) return;
            list.splice(idx, 1);
            saveWebhooks(list);
            if (state.selectedWebhook >= list.length) state.selectedWebhook = Math.max(0, list.length - 1);
            if (state.defaultWebhook === idx) state.defaultWebhook = -1;
            else if (state.defaultWebhook > idx) state.defaultWebhook--;
            render(true);
        }
        function setDefaultWebhook(idx) {
            state.defaultWebhook = (state.defaultWebhook === idx) ? -1 : idx;
            salvarMesaEscolhida(state.defaultWebhook);
            render(true);
        }

        // ── Busca e ocultar da lista de mesas ──────────────────────────────────────
        // Feito direto no DOM, sem re-render: se chamasse render() a cada tecla o campo
        // de busca perderia o foco e o texto digitado.
        function _whNorm(s) {
            return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        function filterWebhookList(termo) {
            const alvo = _whNorm(termo);
            let visiveis = 0;
            document.querySelectorAll('[data-wh-name]').forEach(function (el) {
                const bate = _whNorm(el.getAttribute('data-wh-name')).indexOf(alvo) >= 0;
                el.style.display = bate ? '' : 'none';
                if (bate) visiveis++;
            });
            const vazio = document.getElementById('wh-sem-resultado');
            if (vazio) vazio.style.display = visiveis === 0 ? 'block' : 'none';
        }
        function toggleWebhookList() {
            const box = document.getElementById('wh-lista-box');
            const btn = document.getElementById('wh-toggle-btn');
            if (!box) return;
            const estaOculto = box.style.display === 'none';
            box.style.display = estaOculto ? '' : 'none';
            if (btn) btn.textContent = estaOculto ? 'Ocultar' : 'Mostrar';
        }
        window.filterWebhookList = filterWebhookList;
        window.toggleWebhookList = toggleWebhookList;
        function setWebhook(idx) { state.selectedWebhook = idx; salvarMesaEscolhida(idx); render(true); }
        function setDadosSubTab(tab) { state.dadosSubTab = tab; render(true); }
        function getActiveWebhookUrl() {
            const list = loadWebhooks();
            if (!list.length) return null;
            const idx = state.defaultWebhook >= 0 ? state.defaultWebhook : (state.selectedWebhook < list.length ? state.selectedWebhook : 0);
            const wh = list[idx] || list[0];
            if (!wh || !wh.url) return null;
            // Canal de fórum, ou tópico fixo: o Discord exige thread_id na query string,
            // senão a requisição falha (erro 220001). Todos os pontos de envio passam
            // por aqui, então basta anexar neste lugar.
            if (wh.threadId) {
                return wh.url + (wh.url.indexOf('?') >= 0 ? '&' : '?') + 'thread_id=' + encodeURIComponent(wh.threadId);
            }
            return wh.url;
        }
        // ─────────────────────────────────────────────────────────────────────
        // Aceita expressão de VÁRIOS termos: "2d10 + 1d6 + 5". A regex antiga exigia um
        // único "NdM" e devolvia total 1 para qualquer outra coisa — então "20d20+5", o
        // overflow do fim da escada, rolava como **1**. O termo de dados extras que o REN
        // agora deixa fora do dado base cairia no mesmo buraco.
        function _termosExpr(expr) {
            return String(expr || '').split('+').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        function rollDiceExpr(expr) {
            const termos = _termosExpr(expr);
            let rolls = [], total = 0, achou = false;
            termos.forEach(function (termo) {
                const m = termo.match(/^(\d+)d(\d+)$/);
                if (m) {
                    achou = true;
                    const n = parseInt(m[1]), d = parseInt(m[2]);
                    for (let i = 0; i < n; i++) {
                        const v = Math.floor(Math.random() * d) + 1;
                        rolls.push(v); total += v;
                    }
                    return;
                }
                const fixo = parseInt(termo);
                if (!isNaN(fixo)) { achou = true; total += fixo; }
            });
            if (!achou) return { rolls: [1], total: 1 };
            return { rolls: rolls, total: total };
        }
        function rollHatsuDamage(mode, grausRen) {
            const rs = window._hatsuRollState;
            if (!rs || !rs.dice || !rs.hasBaseDmg) { alert('Este Hatsu não possui dano calculável.'); return; }
            const char = state.currentChar;
            const h = (char.hatsus||[])[state.hatsuDetailIdx];
            const effectiveMode = mode || state.rollMode;
            const mod = getMod((char.attributes[rs.attr] || {}).value || 10);

            // ── REN: escalona +N Grau(s) de dano neste ataque (já validado o teto de grau antes de perguntar) ──
            const renGraus = Math.max(0, parseInt(grausRen) || 0);
            const useRen = renGraus > 0;

            // ── rm_e12 Aura Condensada armada para DANO ─────────────────────────────
            // Cada 5% guardados vale +1 Grau/Passo. É grau como qualquer outro, então
            // obedece ao teto do nível — e divide esse teto com o REN: o REN é escolhido
            // na pergunta da rolagem, então entra primeiro e a Aura Condensada usa o que
            // sobrou. A reserva é de uso único: zera nesta rolagem, tenha ela caber ou não.
            const _acAtivo = ((char.hatsusAtivos || {})[state.hatsuDetailIdx]) || null;
            const _acRes = (window.reservaAuraCondensada && _acAtivo)
                ? window.reservaAuraCondensada(_acAtivo) : { pct: 0, destino: null };
            let acGraus = 0;
            let acPerdidos = 0;
            if (_acRes.destino === 'dano' && _acRes.pct > 0 && h) {
                const _acPassos = window.passosAuraCondensada(_acRes.pct);
                const _espaco = window.grauDanoDisponivel ? window.grauDanoDisponivel(h, char) : 0;
                const _sobra = (_espaco === Infinity) ? _acPassos : Math.max(0, _espaco - renGraus);
                acGraus = Math.min(_acPassos, _sobra);
                acPerdidos = _acPassos - acGraus;
                // Gasta a reserva agora. Fica null em vez de ser apagada para o painel
                // mostrar que o Hatsu já usou a sua carga nesta ativação.
                _acAtivo.reservaCondensada = { pct: 0, destino: null };
            }

            const _grausExtra = renGraus + acGraus;
            // O grau sobe no DADO BASE e o termo de dados extras é recolocado intacto:
            // 2d6 + 1d6 com +2 graus vira "2d10 + 1d6", não "3d10". Regra do Lucas —
            // escalar o pacote inteiro deixaria o REN bem mais forte do que deveria.
            const _dBase = (rs.diceBase || rs.dice);
            const _dExtra = rs.diceExtra || '';
            let renDice = rs.dice;
            if (_grausExtra > 0 && window.DAMAGE_TABLE) {
                const _idxD = window.DAMAGE_TABLE.indexOf(_dBase);
                if (_idxD >= 0) {
                    const _novoBase = window.DAMAGE_TABLE[Math.min(_idxD + _grausExtra, window.DAMAGE_TABLE.length - 1)];
                    renDice = _dExtra ? (_novoBase + ' + ' + _dExtra) : _novoBase;
                }
            }
            if (acPerdidos > 0) {
                setTimeout(function () {
                    alert('Aura Condensada\n\nO teto de Grau de Potência do seu nível aceitou +' + acGraus
                        + ' de ' + (acGraus + acPerdidos) + '.\n\n' + acPerdidos
                        + ' grau(s) foram perdidos. Da próxima vez, com o teto cheio, liberar como RD aproveita tudo.');
                }, 60);
            }

            // ── Custo de Aura: ativação do Hatsu + REN (1º grau grátis 1x/dia no REN nível 3; demais 5% cada) ──
            const _auraCost = h ? window.calcHatsuAuraCostFinal(h, state.hatsuDetailIdx).pct : 0;
            let renCost = 0;
            let renUsedFree = false;
            // Escolher grau no popup é um CAMINHO DE ATIVAÇÃO do REN (decisão do Lucas):
            // antes era preciso ligar o princípio na aba Ficha primeiro, e quem não ligava
            // nem via o popup. A taxa de 10% da ativação pela Ficha NÃO é cobrada aqui —
            // só os 5% por grau — então este caminho sai mais barato de propósito.
            // Registra também a duração, senão o contador de rodadas da Ficha não acende.
            let _renLigadoAgora = false;
            if (useRen && !((char.principiosAtivos || {}).ren)) {
                if (!char.principiosAtivos) char.principiosAtivos = {};
                char.principiosAtivos.ren = true;
                if (!char.principiosRodadas) char.principiosRodadas = {};
                const _rodRen = (window.PRINCIPIO_RODADAS || {}).ren;
                char.principiosRodadas.ren = (_rodRen == null) ? null : _rodRen;
                _renLigadoAgora = true;
            }
            if (useRen) {
                renUsedFree = window.isRenFreeUsoDisponivel ? window.isRenFreeUsoDisponivel(char) : false;
                const grausGratisAprim = window.calcRenGrausGratisAprimoramento ? window.calcRenGrausGratisAprimoramento(char) : 0;
                const grausPagos = Math.max(0, renGraus - (renUsedFree ? 1 : 0) - grausGratisAprim);
                renCost = grausPagos * 5;
                if (renUsedFree && window.marcarRenFreeUsoConsumido) window.marcarRenFreeUsoConsumido(char);
            }
            // Se o Hatsu já está ATIVO, a aura foi paga na ativação — não cobra de novo.
            // O custo do REN continua sendo cobrado, porque é decidido na rolagem.
            const _jaPago = window._hatsuJaPago && window._hatsuJaPago(char, state.hatsuDetailIdx);
            const totalAuraCost = (_jaPago ? 0 : _auraCost) + renCost;
            const auraAntes = char.vitals.aura || 0;
            char.vitals.aura = Math.max(0, auraAntes - totalAuraCost);

            const _hAtualRoll = (state.currentChar.hatsus || [])[state.hatsuDetailIdx] || {};
            // ── Condição Hostil: dados MAXIMIZADOS (não rolados) ───────────────────
            // Em vez de rolar, cada dado entrega o valor máximo. 3d10 vira 30.
            const _hMax = window.hatsuDanoMaximizado && window.hatsuDanoMaximizado(_hAtualRoll || {});
            const dmgResult = _hMax ? maximizarExpr(renDice) : rollDiceExpr(renDice);

            // Separar extras: valores fixos (somam ao total) vs dados (linha extra)
            let flatBonus = 0;
            const flatParts = [];   // ex: ['+2', '+3'] → para exibir na fórmula
            const extraLines = [];  // dados rolados separadamente

            (rs.sanExtras || []).forEach(e => {
                const clean = e.dado.replace(/\/\w+$/, ''); // remove /rod etc
                const num = parseInt(clean);
                if (!isNaN(num)) { flatBonus += num; flatParts.push(clean); }
            });
            // Dados extras (Golpe Reforçado, Fúria Potencializada...) somam no MESMO total.
            // Antes eles eram rolados e exibidos numa linha à parte, mas NÃO entravam na
            // conta: o Discord recebia um total sem o 1d8. E o atributo entra uma vez só,
            // no fim — é o mesmo Hatsu, não duas instâncias de dano.
            let extraDiceTotal = 0;
            const _maximizar = _hMax;
            (rs.dmgExtras || []).forEach(e => {
                if (e.dado === '(contínuo)') return;
                // A regex exigia o "+" colado no dado, mas o catálogo grava "+ 1d8" COM
                // espaço. Nenhum extra casava, então caía no ramo de valor bruto, o
                // parseInt dava NaN e o dado simplesmente desaparecia: nunca era rolado
                // nem somado. Agora o espaço é aceito.
                const rollable = /^\+?\s*\d+d\d+$/.test(String(e.dado).trim());
                if (rollable) {
                    const _expr = String(e.dado).replace(/^\+?\s*/, '').trim();
                    const er = _maximizar ? maximizarExpr(_expr) : rollDiceExpr(_expr);
                    extraDiceTotal += er.total;
                    extraLines.push(`💥 ${e.tipo} (${e.desc}): [${er.rolls.join('+')}] = **${er.total}**`);
                } else {
                    const clean = e.dado.replace(/\/\w+$/, '');
                    const num = parseInt(clean);
                    if (!isNaN(num)) { flatBonus += num; flatParts.push(clean); }
                }
            });

            // ── RYU: só em Hatsu de corpo-a-corpo ──────────────────────────────────
            // rs.corpoACorpo é gravado pela tela de detalhe (hatsu-detail.js) e vale
            // quando o Hatsu não comprou alcance nem área e não é Projétil de Aura.
            // O bônus é plano, então entra junto dos outros extras fixos: o crítico
            // não o dobra, e ele aparece na fórmula que vai ao Discord.
            // A arma guardada é reconferida contra o inventário a cada rolagem: se ela
            // foi vendida ou renomeada, o bônus para de valer sozinho.
            const _ryuOkH = window.ryuAlcancaHatsu
                ? window.ryuAlcancaHatsu(rs, h, function (nome) {
                    return !!(window.ryuAlcancaArma && window.ryuAlcancaArma(findItemData(nome), nome));
                })
                : false;
            const _ryuH = window.calcBonusAcertoRyu
                ? window.calcBonusAcertoRyu(char, _ryuOkH)
                : { total: 0 };
            if (_ryuH.total > 0) {
                flatBonus += _ryuH.total;
                flatParts.push('RYU ' + _ryuH.total);
            }

            // ── Rolagem de ATAQUE, antecipada ──────────────────────────────────────
            // Ela acontecia DEPOIS do cálculo do dano, e por isso o crítico nunca pôde
            // dobrar nada: quando o d20 era rolado o total já estava fechado. Agora o
            // d20 vem primeiro e o dano sabe se o golpe foi crítico.
            const _atk = (function () {
                if (!rs.hasAttack) return null;
                const nivel = rs.nivel || parseInt(char.level) || 1;
                const pb = getProficiencyBonus(nivel);
                // Atributo do Ataque pode ser diferente do atributo de Dano (rs.attr)
                const atkMod = getMod((char.attributes[rs.atkAttr || rs.attr] || {}).value || 10);
                // Segredo Mortal: força vantagem se modo for Normal
                const attackMode = (rs.acertoVantagem && effectiveMode === 'NORMAL') ? 'VANTAGEM' : effectiveMode;
                const attackRoll = getRollResult(attackMode);
                // RYU entra aqui, e não no rs.acertoBonus montado em hatsu-detail.js:
                // lá o Hatsu ainda não sabe se é corpo-a-corpo, porque os metros de
                // alcance e de área são calculados depois do estado da rolagem.
                const acertoBonus = (rs.acertoBonus || 0) + _ryuH.total;
                // Margem de crítico da ficha (Aura Afiada, Assassino Veterano, Executor),
                // com piso 18. Comparada contra o d20 USADO — antes era
                // dice.includes(20), que declarava crítico mesmo quando o 20 era o dado
                // DESCARTADO numa rolagem com desvantagem.
                const mc = window.calcMargemCritico ? window.calcMargemCritico(char) : { valor: 20 };
                return {
                    pb: pb, atkMod: atkMod, attackMode: attackMode, attackRoll: attackRoll,
                    acertoBonus: acertoBonus, margem: mc.valor,
                    isCrit: attackRoll.total >= mc.valor,
                    isFumble: attackRoll.dice.length === 1 && attackRoll.dice[0] === 1,
                    attackTotal: window.totalComEnfase(attackRoll, atkMod + pb + acertoBonus,
                        window.calcPenalidadeEnfase ? window.calcPenalidadeEnfase(char) : 0),
                };
            })();

            // ── Vida ou Morte e crítico: dobram os DADOS ───────────────────────────
            // (não os bônus fixos nem o atributo). Um não soma com o outro: dobrar é
            // dobrar, e dois dobros viram quádruplo sem base em regra nenhuma.
            const _hCrit = window.hatsuDanoCritico && window.hatsuDanoCritico(_hAtualRoll || {});
            const _critDobra = _hCrit || !!(_atk && _atk.isCrit);
            // KO multiplica o dano INTEIRO, depois de tudo — ver multiplicadorDanoKo.
            const _koMult = window.multiplicadorDanoKo ? window.multiplicadorDanoKo(char) : 1;
            const _dadosTotal = dmgResult.total + extraDiceTotal;
            const total = ((_critDobra ? _dadosTotal * 2 : _dadosTotal) + mod + flatBonus) * _koMult;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const modeLabel = effectiveMode === 'NORMAL' ? '' : ` (${effectiveMode.charAt(0) + effectiveMode.slice(1).toLowerCase()})`;
            const renLabel = useRen ? ' 💪REN' : '';
            // Marca no histórico quando a Aura Condensada entrou nesta rolagem.
            const acLabel = acGraus > 0 ? (' 🔋+' + acGraus + 'G') : '';
            // Dano causado POR MEIO de constructo/arma/criatura: o rótulo diz quem bate.
            const origemLabel = rs.origem ? ` · por meio de ${rs.origem}` : '';
            char.history.push({ time, label: `⚡ ${rs.nome} (${rs.attr})${modeLabel}${renLabel}${acLabel}${origemLabel}`, dice: dmgResult.rolls.join(', ') + (extraDiceTotal > 0 ? ` (+${extraDiceTotal} extra)` : ''), mod: mod + flatBonus, total, img: state.pendingRollImage || '' });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);

            // Fórmula: "2d10 + PRE + 5" com os bônus fixos somados
            const flatStr = flatParts.length > 0 ? ` + ${flatBonus}` : '';
            const allModStr = (mod !== 0 || flatBonus !== 0)
                ? ` ${(mod + flatBonus) >= 0 ? '+' : ''}${mod + flatBonus}`
                : '';
            // Fórmula com os dados extras somados e o atributo uma vez só.
            const extraDiceStr = (rs.dmgExtras || [])
                .filter(e => /^\+?\s*\d+d\d+$/.test(String(e.dado).trim()))
                .map(e => String(e.dado).replace(/^\+?\s*/, '').trim())
                .join(' + ');
            // Sem dado principal (Hatsu sem dano base), a fórmula começa pelo extra,
            // para não sair um "+ 1d8 + FOR" com sobra à esquerda.
            const _partes = [renDice, extraDiceStr].filter(Boolean);
            // Linha de CURA, rolada junto e mostrada separada na mensagem.
            let _curaLinha = '';
            if (rs.curaDice) {
                const cr = _hMax ? maximizarExpr(rs.curaDice) : rollDiceExpr(rs.curaDice);
                const curaTotal = (_hCrit ? cr.total * 2 : cr.total) + mod;
                _curaLinha = `\n💚 Cura: [${cr.rolls.join('+')}] ${mod >= 0 ? '+' : ''}${mod} = **${curaTotal}** de vida`;
            }
            const _selo = (_hMax ? '  **[DANO MAXIMIZADO POR RESTRIÇÃO]**'
                    : (_hCrit ? '  **[CRÍTICO — VIDA OU MORTE]**'
                    : ((_atk && _atk.isCrit) ? '  **[CRÍTICO — DADOS DOBRADOS]**' : '')))
                + (_koMult > 1 ? '  **[KO — DANO ×' + _koMult + ']**' : '');
            const formula = `${_partes.join(' + ')}${_partes.length ? ' + ' : ''}${rs.attr}${flatStr}${_selo}`;
            const extrasText = extraLines.length > 0 ? '\n' + extraLines.join('\n') : '';

            // ── Rolagem de Ataque ─────────────────────────────────────────────
            let attackLine = '';
            if (_atk) {
                const _somaAtk = _atk.atkMod + _atk.pb + _atk.acertoBonus;
                const critSuffix = _atk.isCrit
                    ? ` 🎯 **CRÍTICO!**${_atk.margem < 20 ? ` (margem ${_atk.margem}+)` : ''}`
                    : (_atk.isFumble ? ' 💀 **FALHA CRÍTICA!**' : '');
                const attackModStr = _somaAtk < 0 ? `${_somaAtk}` : `+${_somaAtk}`;
                const attackModeLabel = _atk.attackMode !== 'NORMAL'
                    ? ` (${_atk.attackMode.charAt(0) + _atk.attackMode.slice(1).toLowerCase()})` : '';
                attackLine = `\nAtaque${attackModeLabel}: [${_atk.attackRoll.dice.join(', ')}] ${attackModStr} = **${_atk.attackTotal}**${critSuffix}`;
            } else if (rs.cd) {
                attackLine = `\n🎯 CD do TR: **${rs.cd}**`;
            }
            // ── Fim rolagem de ataque ─────────────────────────────────────────

            const renNote = useRen ? `\n💪 **REN ativado** — +${renGraus} Grau${renGraus>1?'s':''} de dano${renUsedFree ? ' (1º grátis no dia)' : ''}${_renLigadoAgora ? ' (princípio ligado agora)' : ''}` : '';
            const origemNote = rs.origem ? `\n🧩 **Este dano é causado por ${rs.origem}**, não pelo usuário diretamente` : '';
            const content = `⚡ **${char.name}** usou **${rs.nome}**${modeLabel}${attackLine}\nDano: [${dmgResult.rolls.join('+')}]${allModStr} = **${total}** (${formula})${_curaLinha}${extrasText}${renNote}${origemNote}`;
            sendRollToDiscord(content, state.pendingRollImage);
            state.pendingRollImage = '';
            if (state.activeTab !== 'DADOS') state.unreadRolls = true;
            if (window._showXpToast) window._showXpToast(`🎲 ${rs.nome}: ${total} de dano enviado ao Discord!`);
            // Corrige bug pré-existente: esta função nunca fechava o modal de modo de rolagem (nem o
            // novo prompt de REN) porque nunca chamava render() — diferente de rollDice/rollSkill/rollAttack.
            render(true);
        }
        // Manda uma rolagem pro Discord, anexando a imagem/gif de verdade quando ela foi enviada por
        // upload (guardada como data: URI local): o Discord não aceita data: URI em embed.image.url
        // (precisa ser http/https), então nesse caso sobe o arquivo via multipart (payload_json +
        // files[0]) e referencia via attachment://. Se já for uma URL http(s) normal (colada pelo
        // jogador, ex. link de GIF), manda direto no embed sem precisar reenviar o arquivo.
        // Usada tanto pelo ataque do constructo (cst.imagemUrl) quanto pelo anexo opcional de
        // imagem/gif nas rolagens de ataque (state.pendingRollImage, ver renderRollModeModalHtml).
        function sendRollToDiscord(content, imagemUrl) {
            const url = getActiveWebhookUrl();
            if (!url) return;
            if (imagemUrl && /^data:image\//i.test(imagemUrl)) {
                fetch(imagemUrl)
                    .then(r => r.blob())
                    .then(blob => {
                        if (blob.size > 8 * 1024 * 1024) throw new Error('imagem muito grande');
                        const ext = (blob.type.split('/')[1] || 'png').split('+')[0];
                        const filename = `rolagem.${ext}`;
                        const form = new FormData();
                        form.append('payload_json', JSON.stringify({ content, embeds: [{ image: { url: `attachment://${filename}` } }] }));
                        form.append('files[0]', blob, filename);
                        return fetch(url, { method: 'POST', body: form });
                    })
                    .catch(() => {
                        // Se o upload falhar (ou a imagem for grande demais), manda ao menos o texto
                        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).catch(() => {});
                    });
            } else {
                const payload = { content };
                if (imagemUrl && /^https?:\/\//i.test(imagemUrl)) payload.embeds = [{ image: { url: imagemUrl } }];
                fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
            }
        }
        // Ataque básico do Constructo (Ficha do Constructo): sem efeito de dano próprio,
        // o manual usa 1d6 + atributo (normalmente FOR/DES), mas o jogador pode escolher
        // qual atributo do constructo entra na rolagem (guardado em h.constructo.atributoAtaque).
        window.rollConstructoAtaque = function(idx, cIdx) {
            const char = state.currentChar;
            const h = (char.hatsus || [])[idx];
            if (!h) return;
            // cIdx = qual cópia do constructo está atacando (0 = a primeira).
            const cst = window._hCst ? window._hCst(h, parseInt(cIdx) || 0) : h.constructo;
            if (!cst) return;
            const atributos = Object.assign({ FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, PRE: 0 }, cst.atributos || {});
            const attrKey = (cst.atributoAtaque && atributos.hasOwnProperty(cst.atributoAtaque))
                ? cst.atributoAtaque
                : (atributos.FOR >= atributos.DES ? 'FOR' : 'DES');
            const attrMod = atributos[attrKey] || 0;
            const roll = rollDiceExpr('1d6');
            const total = roll.total + attrMod;
            const nome = cst.nome || `${h.nome} (Constructo)`;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            char.history.push({ time, label: `🐣 ${nome} — Ataque`, dice: roll.rolls.join(', '), mod: attrMod, total, img: cst.imagemUrl || '' });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);
            const content = `🐣 **${nome}** ataca!\nDano: [${roll.rolls.join('+')}] ${attrMod >= 0 ? '+' : ''}${attrMod} = **${total}** (1d6 + ${attrKey})`;
            sendRollToDiscord(content, cst.imagemUrl);
            if (state.activeTab !== 'DADOS') state.unreadRolls = true;
            if (window._showXpToast) window._showXpToast(`🎲 ${nome}: ${total} de dano enviado ao Discord!`);
            render(true);
        };
        function openAttackModal(weaponName, diceExpr, tipoDano) {
            state.attackModal = { nome: weaponName, dano: diceExpr, tipoDano: tipoDano || '' };
            render(true);
        }
        function closeAttackModal() { state.attackModal = null; render(true); }
        function pickAttackAttr(nome, dano, attrKey) {
            state.attackModal = null;
            openRollModeModal('attack', nome, dano, attrKey);
        }
        function openRollModeModal(type, a1, a2, a3) {
            state.pendingRoll = { type, a1, a2, a3 };
            // Hatsu: a imagem/gif já foi anexada antes de clicar em "Rolar" (ver widget acima do
            // botão em hatsu-detail.js), guardada no próprio Hatsu (h.attachImage) — cada Hatsu tem
            // a sua própria imagem, então carrega a do Hatsu atual em vez de zerar.
            const _hAtual = type === 'hatsu' ? (state.currentChar.hatsus || [])[state.hatsuDetailIdx] : null;
            state.pendingRollImage = _hAtual ? (_hAtual.attachImage || '') : '';
            render(true);
        }
        function executePendingRoll(mode) {
            const pr = state.pendingRoll;
            state.pendingRoll = null;
            state.rollMode = mode; // persiste o último modo usado
            if (!pr) return;
            if (pr.type === 'dice')   rollDice(pr.a1, pr.a2, mode);
            else if (pr.type === 'skill')  maybeAskZetsuThenRollSkill(pr.a1, pr.a2, mode);
            else if (pr.type === 'attack') maybeAskRenThenRollAttack(pr.a1, pr.a2, pr.a3, mode);
            else if (pr.type === 'hatsu')  maybeAskRenThenRoll(mode);
        }
        function cancelPendingRoll() { state.pendingRoll = null; state.pendingRollImage = ''; render(true); }
        // Anexo opcional de imagem/gif na rolagem de ataque (ver renderRollModeModalHtml). O input de
        // URL atualiza o estado sem re-render (pra não perder o foco/cursor a cada tecla); a preview
        // e o upload de arquivo re-renderizam normalmente, pois só acontecem uma vez.
        window._hUploadPendingRollImage = function(input) {
            if (!input.files || !input.files[0]) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                state.pendingRollImage = e.target.result;
                render(true);
            };
            reader.readAsDataURL(input.files[0]);
        };
        window._hClearPendingRollImage = function() {
            state.pendingRollImage = '';
            render(true);
        };
        // Anexo de imagem/gif do Hatsu, escolhido na tela de detalhe ANTES de clicar em "Rolar
        // Hatsu no Discord" (ver widget no rodapé de renderHatsuDetail, hatsu-detail.js). Fica
        // guardado no próprio Hatsu (h.attachImage, salvo com o personagem) — cada Hatsu tem a sua
        // própria imagem — e é copiado para state.pendingRollImage só quando o jogador abre o modal
        // de rolagem (openRollModeModal), permanecendo disponível para as próximas rolagens
        // daquele Hatsu até o jogador removê-lo.
        window._hUploadHatsuAttachImage = function(idx, input) {
            if (!input.files || !input.files[0]) return;
            const h = (state.currentChar.hatsus || [])[idx];
            if (!h) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                h.attachImage = e.target.result;
                saveCharacter(state.currentChar);
                render(true);
            };
            reader.readAsDataURL(input.files[0]);
        };
        window._hClearHatsuAttachImage = function(idx) {
            const h = (state.currentChar.hatsus || [])[idx];
            if (!h) return;
            h.attachImage = '';
            saveCharacter(state.currentChar);
            render(true);
        };
        window._hSetHatsuAttachImage = function(idx, value) {
            const h = (state.currentChar.hatsus || [])[idx];
            if (!h) return;
            h.attachImage = value;
        };
        // Zetsu (Suprimir) dá bônus de Furtividade: nível 1/2 → +3, nível 3 (Maestria) → +6.
        // Se a Aprimoramento (Opção 2 — P.N extra pós-Maestria) estiver escolhida, o bônus sobe +1 por P.N investido.
        function getZetsuFurtividadeBonus(char) {
            if (window.calcZetsuBonus) return window.calcZetsuBonus(char).furtividade;
            const zetsu = ((char.nenDominio || {}).zetsu) || 0;
            if (zetsu >= 3) return 6;
            if (zetsu >= 1) return 3;
            return 0;
        }
        function maybeAskZetsuThenRollSkill(skillName, attrKey, mode) {
            const char = state.currentChar;
            const bonus = skillName === 'Furtividade' ? getZetsuFurtividadeBonus(char) : 0;
            if (bonus > 0) {
                state.pendingZetsuRoll = { skillName, attrKey, mode, bonus };
                render(true);
            } else {
                rollSkill(skillName, attrKey, mode);
            }
        }
        window._hResolveZetsuPrompt = function(useZetsu) {
            const pr = state.pendingZetsuRoll;
            state.pendingZetsuRoll = null;
            if (!pr) return;
            rollSkill(pr.skillName, pr.attrKey, pr.mode, useZetsu ? pr.bonus : 0);
        };
        function renderZetsuPromptModalHtml() {
            if (!state.pendingZetsuRoll) return '';
            const pr = state.pendingZetsuRoll;
            return `<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif">
                <div style="background:#0d1117;border:2px solid #22c55e;border-radius:18px;padding:22px;width:100%;max-width:340px;box-shadow:0 0 40px #22c55e44;text-align:center">
                    <div style="font-size:22px;margin-bottom:6px">👁️</div>
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#22c55e;text-transform:uppercase;letter-spacing:2px">Zetsu está ativo?</div>
                    <div style="font-size:10px;color:#9ca3af;margin-top:8px;line-height:1.5">Suprimir a aura oculta sua presença.<br>Bônus: <b style="color:#22c55e">+${pr.bonus} Furtividade</b></div>
                    <div style="display:flex;gap:8px;margin-top:16px">
                        <button onclick="window._hResolveZetsuPrompt(false)" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Não</button>
                        <button onclick="window._hResolveZetsuPrompt(true)" style="flex:2;padding:12px;border-radius:10px;background:#22c55e;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">👁️ Usar Zetsu</button>
                    </div>
                </div>
            </div>`;
        }
        // rev. Manual 2.0 — antes de rolar o Hatsu, pergunta se o jogador quer usar REN (+1 Grau de
        // dano), mas só se ainda houver espaço dentro do limite de Grau de Potência do nível.
        function maybeAskRenThenRoll(mode) {
            const rs = window._hatsuRollState;
            const char = state.currentChar;
            const h = (char.hatsus||[])[state.hatsuDetailIdx];
            // ── RYU: perguntar como o Hatsu é entregue, uma vez por Hatsu ──────────
            // Vem antes do balão do REN para a ordem ficar: o que é o golpe → quanto
            // de aura gastar nele → rolar. Depois de responder, _gravarRyuEntrega
            // chama esta mesma função de novo e o fluxo continua normalmente.
            if (window.ryuPrecisaPerguntar && window.ryuPrecisaPerguntar(char, h, rs)) {
                state.pendingRyuEntrega = { idx: state.hatsuDetailIdx, mode: mode || state.rollMode || 'NORMAL' };
                render(true);
                return;
            }
            // grauDanoDisponivel em vez de calcRenGrauDisponivel: o segundo exige o REN já
            // ATIVO na ficha, e por decisão do Lucas escolher um grau AQUI é um caminho de
            // ativação do REN. A conta do teto de grau é idêntica nos dois.
            const grausDisp = (rs && rs.hasBaseDmg && h && window.grauDanoDisponivel)
                ? window.grauDanoDisponivel(h, char) : 0;
            // O grau anda na ESCADA, então a posição sai do DADO BASE. Usar rs.dice aqui era
            // o bug: com dados extras ele é uma string fora da tabela ("3d6"), o indexOf
            // devolvia −1, grausTabela virava 0 e o popup era pulado em silêncio.
            const _base = (rs && (rs.diceBase || rs.dice)) || '';
            const idxAtual = window.DAMAGE_TABLE ? window.DAMAGE_TABLE.indexOf(_base) : -1;
            const grausTabela = idxAtual >= 0 ? (window.DAMAGE_TABLE.length - 1 - idxAtual) : 0;
            const grausMax = Math.min(grausDisp === Infinity ? grausTabela : grausDisp, grausTabela);
            if (grausMax > 0) {
                state.pendingRenRoll = { mode, grausMax, grausEscolhidos: 1 };
                render(true);
            } else {
                // Antes o skip era MUDO: o jogador não tinha como distinguir teto cheio de
                // bug. Agora o motivo aparece, no mesmo formato do aviso da Aura Condensada.
                if (rs && rs.hasBaseDmg) {
                    const _motivo = !((char.nenDominio || {}).ren > 0)
                        ? 'Você ainda não treinou o princípio REN.'
                        : (grausTabela <= 0
                            ? 'O dado de dano deste Hatsu já está no topo da escada de grau/passo.'
                            : 'O teto de Grau de Potência do seu nível já está todo usado neste Hatsu.');
                    setTimeout(function () {
                        alert('REN indisponível neste golpe\n\n' + _motivo);
                    }, 60);
                }
                rollHatsuDamage(mode, 0);
            }
        }
        function _hSetRenPromptGraus(n) {
            if (!state.pendingRenRoll) return;
            const max = state.pendingRenRoll.grausMax || 1;
            state.pendingRenRoll.grausEscolhidos = Math.max(1, Math.min(max, parseInt(n) || 1));
            render(true);
        }
        window._hResolveRenPrompt = function(useRen) {
            const pr = state.pendingRenRoll;
            state.pendingRenRoll = null;
            if (!pr) return;
            rollHatsuDamage(pr.mode, useRen ? (pr.grausEscolhidos || 1) : 0);
        };
        // ── Balão de PACOTES dos princípios escaláveis (TEN, EN, KEN) ───────────────
        // Mesmo desenho do balão de ativação do Hatsu e do popup de REN: contador, custo
        // somado e o resultado antes de confirmar. O botão de confirmar fica apagado
        // quando a aura ou as Reações não cobrem a escolha — foi o que o Lucas pediu.
        window._abrirEscalaPrincipio = function (key, custo) {
            const char = state.currentChar;
            const maxPac = window.pacotesPossiveisPrincipio ? window.pacotesPossiveisPrincipio(char, key) : 1;
            if (maxPac <= 0) {
                const c = window.custoPacotePrincipio ? window.custoPacotePrincipio(char, key) : { aura: custo, reacoes: 0 };
                alert('Recurso insuficiente para ativar.\n\nUm pacote custa ' + c.aura + '% de aura'
                    + (c.reacoes > 0 ? ' e ' + c.reacoes + ' Reaç' + (c.reacoes > 1 ? 'ões' : 'ão') : '') + '.');
                return;
            }
            // Com um pacote só disponível não há escolha a fazer: ativa direto.
            if (maxPac === 1) { window._activatePrincipio(key, custo, 1); return; }
            state.pendingEscala = { key: key, custo: custo, pacotes: 1, maxPac: maxPac };
            render(true);
        };
        window._setEscalaPacotes = function (n) {
            if (!state.pendingEscala) return;
            const max = state.pendingEscala.maxPac || 1;
            state.pendingEscala.pacotes = Math.max(1, Math.min(max, parseInt(n) || 1));
            render(true);
        };
        window._fecharEscalaPrincipio = function () { state.pendingEscala = null; render(true); };
        window._confirmarEscalaPrincipio = function () {
            const pe = state.pendingEscala;
            state.pendingEscala = null;
            if (!pe) return;
            window._activatePrincipio(pe.key, pe.custo, pe.pacotes);
        };
        // Resultado de cada princípio para N pacotes, só para mostrar no balão.
        function _resultadoEscala(char, key, pac) {
            if (key === 'ten') {
                const base = window.calcTenRD ? window.calcTenRD(char) : 0;
                return '+' + (base * pac) + ' RD' + (pac > 1 ? ' (era +' + base + ')' : '');
            }
            if (key === 'en') {
                const adv = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'en') : { diametro: 3 };
                const d0 = adv.diametro || 3;
                const dv = d0 + (pac - 1) * 3;
                return String(dv).replace('.', ',') + 'm de diâmetro' + (pac > 1 ? ' (era ' + String(d0).replace('.', ',') + 'm)' : '');
            }
            if (key === 'ken') return 'CA ×' + (1 + pac) + (pac > 1 ? ' (era ×2)' : '');
            return '';
        }
        // ── Menu do SHU ─────────────────────────────────────────────────────────────
        // O SHU não escala por pacotes como TEN/EN/KEN: são 4 alternativas a 5% cada,
        // acumuláveis, sobre uma base de 10%. O item envolvido é escolhido aqui porque
        // o dado de dano do SHU só vale para ele.
        window._abrirMenuShu = function () {
            const char = state.currentChar;
            const e = window.escolhasShu ? window.escolhasShu(char) : {};
            state.pendingShu = {
                mais: e.mais || 0, alvoMais: e.alvoMais || 'dano', cerco: !!e.cerco,
                duracao: e.duracao || 0, tamanho: e.tamanho || 0, item: e.item || '',
            };
            render(true);
        };
        window._setShuCampo = function (campo, valor) {
            if (!state.pendingShu) return;
            const max = window.SHU_MENU_MAX || 6;
            if (campo === 'cerco') state.pendingShu.cerco = !state.pendingShu.cerco;
            else if (campo === 'alvoMais') state.pendingShu.alvoMais = (valor === 'ca') ? 'ca' : 'dano';
            else if (campo === 'item') state.pendingShu.item = String(valor || '');
            else state.pendingShu[campo] = Math.max(0, Math.min(max, parseInt(valor) || 0));
            render(true);
        };
        window._fecharMenuShu = function () { state.pendingShu = null; render(true); };
        window._confirmarMenuShu = function () {
            const ps = state.pendingShu;
            state.pendingShu = null;
            if (!ps) return;
            const char = state.currentChar;
            char.shuEscolhas = {
                mais: ps.mais, alvoMais: ps.alvoMais, cerco: ps.cerco,
                duracao: ps.duracao, tamanho: ps.tamanho, item: ps.item,
            };
            // O custo é lido de char.shuEscolhas dentro do _activatePrincipio, por isso
            // a gravação acontece ANTES da chamada.
            window._activatePrincipio('shu', 0, 1);
        };
        function renderMenuShuModalHtml() {
            if (!state.pendingShu) return '';
            const char = state.currentChar;
            const ps = state.pendingShu;
            const sup = !!((char.nenDominio || {}).shu_sup);
            const max = window.SHU_MENU_MAX || 6;
            const custo = window.custoShu ? window.custoShu(char, ps) : 10;
            const cabe = (char.vitals.aura || 0) >= custo;
            // O 1d4 da CA só é rolado na confirmação, então o balão mostra "1d4 + N".
            const prev = window.calcShuAtivo
                ? window.calcShuAtivo(Object.assign({}, char, { shuEscolhas: ps, shuCaRolado: 0 }))
                : { dadoDano: '1d4', caPasso: 0, rodadas: 1, metros: 1, cerco: false };
            const contador = function (campo, rotulo, nota) {
                const v = ps[campo] || 0;
                const btn = function (n, lbl) {
                    const sel = v === n;
                    return '<button onclick="window._setShuCampo(\'' + campo + '\',' + n + ')" style="width:26px;height:26px;border-radius:7px;'
                        + 'font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;cursor:pointer;border:1px solid '
                        + (sel ? '#a78bfa' : '#374151') + ';background:' + (sel ? '#a78bfa33' : '#1f2937')
                        + ';color:' + (sel ? '#a78bfa' : '#9ca3af') + '">' + lbl + '</button>';
                };
                let steps = btn(0, '–');
                for (let i = 1; i <= max; i++) steps += btn(i, String(i));
                return '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:9px;padding:8px;margin-bottom:6px;text-align:left">'
                    + '<div style="font-size:9px;font-weight:700;color:#d1d5db">' + rotulo + '</div>'
                    + (nota ? '<div style="font-size:7px;color:#6b7280;margin-top:1px">' + nota + '</div>' : '')
                    + '<div style="display:flex;gap:3px;margin-top:5px;flex-wrap:wrap">' + steps + '</div></div>';
            };
            // Armas do inventário, para dizer em QUE o SHU foi aplicado.
            const _itens = (char.inventory || []).map(function (it) { return it && it.name; }).filter(Boolean);
            const itemOpts = ['<option value="">— escolher item —</option>'].concat(_itens.map(function (nm) {
                return '<option value="' + nm.replace(/"/g, '&quot;') + '"' + (ps.item === nm ? ' selected' : '') + '>' + nm + '</option>';
            })).join('');
            const alvoBtns = sup
                ? '<div style="font-size:8px;color:#4ade80;margin-top:4px">SHU Superior: vale no Dano E na CA ao mesmo tempo.</div>'
                : '<div style="display:flex;gap:4px;margin-top:5px">'
                    + ['dano', 'ca'].map(function (a) {
                        const sel = ps.alvoMais === a;
                        return '<button onclick="window._setShuCampo(\'alvoMais\',\'' + a + '\')" style="flex:1;padding:5px;border-radius:7px;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;border:1px solid '
                            + (sel ? '#a78bfa' : '#374151') + ';background:' + (sel ? '#a78bfa33' : '#1f2937')
                            + ';color:' + (sel ? '#a78bfa' : '#9ca3af') + '">' + (a === 'ca' ? 'na CA' : 'no Dano') + '</button>';
                    }).join('') + '</div>';
            return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif;overflow:auto">'
                + '<div style="background:#0d1117;border:2px solid #a78bfa;border-radius:18px;padding:20px;width:100%;max-width:360px;box-shadow:0 0 40px #a78bfa44;text-align:center;max-height:92vh;overflow:auto">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#a78bfa;text-transform:uppercase;letter-spacing:2px">SHU — o que agregar?</div>'
                + '<div style="font-size:9px;color:#6b7280;margin-top:5px;line-height:1.5">Base: <b style="color:#9ca3af">10% de aura</b> → +1d4 no Dano e na CA de um item de 1m, por 1 rodada. Cada alternativa custa <b style="color:#9ca3af">+5%</b>.</div>'
                + '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:9px;padding:8px;margin:10px 0 6px;text-align:left">'
                + '<div style="font-size:9px;font-weight:700;color:#d1d5db;margin-bottom:4px">Item envolvido</div>'
                + '<select onchange="window._setShuCampo(\'item\', this.value)" style="width:100%;background:#1f2937;border:1px solid #374151;color:#e5e7eb;border-radius:7px;padding:6px;font-size:9px">'
                + itemOpts + '</select>'
                + '<div style="font-size:7px;color:#6b7280;margin-top:3px">O dado de dano do SHU só entra na rolagem desta arma.</div></div>'
                + '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:9px;padding:8px;margin-bottom:6px;text-align:left">'
                + '<div style="font-size:9px;font-weight:700;color:#d1d5db">Aumentar CA ou Dano (como REN)</div>'
                + '<div style="font-size:7px;color:#6b7280;margin-top:1px">No Dano, cada compra sobe 1 degrau na escada (como REN). Na CA, cada compra vale +1.</div>'
                + '<div style="display:flex;gap:3px;margin-top:5px;flex-wrap:wrap">'
                + (function () { let s = ''; for (let i = 0; i <= max; i++) {
                    const sel = (ps.mais || 0) === i;
                    s += '<button onclick="window._setShuCampo(\'mais\',' + i + ')" style="width:26px;height:26px;border-radius:7px;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;cursor:pointer;border:1px solid '
                      + (sel ? '#a78bfa' : '#374151') + ';background:' + (sel ? '#a78bfa33' : '#1f2937')
                      + ';color:' + (sel ? '#a78bfa' : '#9ca3af') + '">' + (i === 0 ? '–' : i) + '</button>'; } return s; })()
                + '</div>' + ((ps.mais || 0) > 0 ? alvoBtns : '') + '</div>'
                + '<div style="background:#0f1117;border:1px solid #1f2937;border-radius:9px;padding:8px;margin-bottom:6px;text-align:left">'
                + '<div style="display:flex;align-items:center;gap:8px">'
                + '<div style="flex:1"><div style="font-size:9px;font-weight:700;color:#d1d5db">Propriedade Arma de Cerco</div>'
                + '<div style="font-size:7px;color:#6b7280;margin-top:1px">+5%</div></div>'
                + '<button onclick="window._setShuCampo(\'cerco\')" style="flex-shrink:0;padding:6px 12px;border-radius:7px;font-size:9px;font-weight:900;cursor:pointer;border:1px solid '
                + (ps.cerco ? '#a78bfa' : '#374151') + ';background:' + (ps.cerco ? '#a78bfa33' : '#1f2937')
                + ';color:' + (ps.cerco ? '#a78bfa' : '#9ca3af') + '">' + (ps.cerco ? '✓ Sim' : 'Não') + '</button></div></div>'
                + contador('duracao', '+1 rodada de duração', '+5% por rodada')
                + contador('tamanho', 'Englobar +1m de tamanho',
                    sup ? 'SHU Superior: grátis, a aura é a mesma em qualquer tamanho.' : '+5% por metro')
                + '<div style="background:#a78bfa10;border:1px solid #a78bfa33;border-radius:10px;padding:10px;margin-top:4px">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#a78bfa">+'
                + prev.dadoDano + ' Dano · +1d4' + ((prev.caPasso || 0) > 0 ? ' +' + prev.caPasso : '') + ' CA</div>'
                + '<div style="font-size:7px;color:#6b7280">o 1d4 da CA é rolado na ativação</div>'
                + '<div style="font-size:9px;color:#9ca3af;margin-top:3px">' + prev.rodadas + ' rodada(s) · até '
                + String(prev.metros).replace('.', ',') + 'm' + (prev.cerco ? ' · Arma de Cerco' : '') + '</div>'
                + '<div style="font-size:10px;color:' + (cabe ? '#a78bfa' : '#f87171') + ';font-weight:900;margin-top:5px">Custo: '
                + custo + '% de aura' + (cabe ? '' : ' — aura insuficiente') + '</div></div>'
                + '<div style="display:flex;gap:8px;margin-top:14px">'
                + '<button onclick="window._fecharMenuShu()" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '<button ' + (cabe ? 'onclick="window._confirmarMenuShu()"' : 'disabled')
                + ' style="flex:2;padding:12px;border-radius:10px;background:#a78bfa;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:'
                + (cabe ? 'pointer' : 'not-allowed') + ';opacity:' + (cabe ? '1' : '0.5') + '">Ativar SHU</button>'
                + '</div></div></div>';
        }

        // ── Balão da tabela do RYU ──────────────────────────────────────────────────
        // O RYU não escala por pacotes nem por menu de alternativas: o custo é fechado
        // em 30%, e a única decisão é QUAL TABELA seguir. Como as seis tabelas são
        // ordens diferentes das mesmas três linhas finais, escolher a tabela é escolher
        // em que turno cada linha vai cair — adiantar o golpe forte (CA+5 / Atq+5) para
        // o 4º turno ou guardá-lo para o 6º. Essa é a decisão tática do princípio, e
        // ela precisava de uma tela: antes o jogador ligava o RYU e recebia +3 de CA.
        window._abrirTabelaRyu = function () {
            const char = state.currentChar;
            const disp = window.tabelasRyuDisponiveis ? window.tabelasRyuDisponiveis(char) : [];
            if (!disp.length) { alert('Nenhuma tabela de RYU disponível.'); return; }
            state.pendingRyu = { tabela: disp[0].i };
            render(true);
        };
        window._setTabelaRyu = function (i) {
            if (!state.pendingRyu) return;
            state.pendingRyu.tabela = parseInt(i) || 0;
            render(true);
        };
        window._fecharTabelaRyu = function () { state.pendingRyu = null; render(true); };
        window._confirmarTabelaRyu = function () {
            const pr = state.pendingRyu;
            state.pendingRyu = null;
            if (!pr) return;
            const char = state.currentChar;
            // Gravado ANTES de ativar: a mensagem de ativação e calcRyuAtivo leem daqui.
            char.ryuTabela = pr.tabela;
            char.ryuTurno = 1;
            window._activatePrincipio('ryu', 30, 1);
        };
        function renderTabelaRyuModalHtml() {
            if (!state.pendingRyu) return '';
            const char = state.currentChar;
            const sel = state.pendingRyu.tabela;
            const disp = window.tabelasRyuDisponiveis ? window.tabelasRyuDisponiveis(char) : [];
            const ryB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'ryu') : { tabelaBonus: 0 };
            const extra = ryB.tabelaBonus || 0;
            const max = window.RYU_TURNOS_MAX || 6;
            const cabe = (char.vitals.aura || 0) >= 30;
            const COR = '#38bdf8';
            const cartoes = disp.map(function (o) {
                const on = o.i === sel;
                const linhas = (o.tabela.linhas || []).map(function (l, k) {
                    const rot = k === 0 ? 'Turnos 1-3' : (l.turno + ' turno');
                    return '<div style="display:flex;gap:6px;font-size:8px;color:' + (on ? '#e5e7eb' : '#6b7280') + ';padding:2px 0">'
                        + '<span style="width:62px;flex-shrink:0;color:#9ca3af">' + rot + '</span>'
                        + '<span style="flex:1">+' + (l.ca + extra) + ' CA</span>'
                        + '<span style="flex:1">+' + (l.ataqueDano + extra) + ' Atq/Dano</span>'
                        + '<span style="flex:1">' + (l.reacoes == null ? '—' : ('+' + (l.reacoes + extra) + ' Reaç.')) + '</span>'
                        + '</div>';
                }).join('');
                return '<button onclick="window._setTabelaRyu(' + o.i + ')" style="display:block;width:100%;text-align:left;'
                    + 'border-radius:10px;padding:8px 10px;margin-bottom:6px;cursor:pointer;border:1px solid '
                    + (on ? COR : '#1f2937') + ';background:' + (on ? COR + '15' : '#0f1117') + '">'
                    + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;color:'
                    + (on ? COR : '#9ca3af') + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">'
                    + (on ? '✓ ' : '') + o.tabela.nome + (o.tabela.superior ? ' · Superior' : '') + '</div>'
                    + linhas + '</button>';
            }).join('');
            return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif;overflow:auto">'
                + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:18px;padding:20px;width:100%;max-width:380px;box-shadow:0 0 40px ' + COR + '44;text-align:center;max-height:92vh;overflow:auto">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:' + COR + ';text-transform:uppercase;letter-spacing:2px">RYU — qual tabela?</div>'
                + '<div style="font-size:9px;color:#6b7280;margin-top:5px;line-height:1.5">As tabelas são a mesma combinação de linhas em <b style="color:#9ca3af">ordens diferentes</b>. Escolha uma e siga até o ' + max + 'º turno — o botão <b style="color:#9ca3af">Passar turno</b> anda nela.</div>'
                + (extra > 0 ? '<div style="font-size:8px;color:' + COR + ';margin-top:4px">Aprimoramento: +' + extra + ' já somado em todos os valores abaixo.</div>' : '')
                + '<div style="margin-top:12px">' + cartoes + '</div>'
                + '<div style="font-size:10px;color:' + (cabe ? COR : '#f87171') + ';font-weight:900;margin-top:4px">Custo: 30% de aura' + (cabe ? '' : ' — aura insuficiente') + '</div>'
                + '<div style="display:flex;gap:8px;margin-top:14px">'
                + '<button onclick="window._fecharTabelaRyu()" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '<button ' + (cabe ? 'onclick="window._confirmarTabelaRyu()"' : 'disabled')
                + ' style="flex:2;padding:12px;border-radius:10px;background:' + COR + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:'
                + (cabe ? 'pointer' : 'not-allowed') + ';opacity:' + (cabe ? '1' : '0.5') + '">Ativar RYU</button>'
                + '</div></div></div>';
        }
        function renderEscalaPrincipioModalHtml() {
            if (!state.pendingEscala) return '';
            const char = state.currentChar;
            const pe = state.pendingEscala;
            const key = pe.key, pac = pe.pacotes || 1, maxPac = pe.maxPac || 1;
            const NOMES = { ten: 'TEN', en: 'EN', ken: 'KEN' };
            const c = window.custoPacotePrincipio ? window.custoPacotePrincipio(char, key) : { aura: pe.custo, reacoes: 0 };
            const auraTot = c.aura * pac, reaTot = c.reacoes * pac;
            const reaMax = window.calcReacoesMax ? window.calcReacoesMax(char) : 7;
            const reaAtual = (char.vitals.rea !== undefined) ? char.vitals.rea : reaMax;
            const cabe = (char.vitals.aura || 0) >= auraTot && reaAtual >= reaTot;
            const steps = Array.from({ length: maxPac }, function (_, i) { return i + 1; }).map(function (n) {
                const sel = pac === n;
                return '<button onclick="window._setEscalaPacotes(' + n + ')" style="width:34px;height:34px;border-radius:9px;'
                    + 'font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;cursor:pointer;border:1.5px solid '
                    + (sel ? '#60a5fa' : '#374151') + ';background:' + (sel ? '#60a5fa33' : '#1f2937')
                    + ';color:' + (sel ? '#60a5fa' : '#9ca3af') + '">' + n + '</button>';
            }).join('');
            return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif">'
                + '<div style="background:#0d1117;border:2px solid #60a5fa;border-radius:18px;padding:22px;width:100%;max-width:340px;box-shadow:0 0 40px #60a5fa44;text-align:center">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#60a5fa;text-transform:uppercase;letter-spacing:2px">'
                + 'Quanto pagar no ' + (NOMES[key] || key.toUpperCase()) + '?</div>'
                + '<div style="font-size:9px;color:#6b7280;margin-top:6px;line-height:1.5">Cada pacote custa <b style="color:#9ca3af">'
                + c.aura + '% de aura' + (c.reacoes > 0 ? ' e ' + c.reacoes + ' Reaç' + (c.reacoes > 1 ? 'ões' : 'ão') : '') + '</b>.</div>'
                + '<div style="display:flex;gap:4px;justify-content:center;margin-top:12px">' + steps + '</div>'
                + '<div style="font-size:8px;color:#6b7280;margin-top:6px">Pacotes (máx. ' + maxPac + ' — aura e Reações disponíveis)</div>'
                + '<div style="background:#60a5fa10;border:1px solid #60a5fa33;border-radius:10px;padding:10px;margin-top:12px">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:15px;color:#60a5fa">'
                + _resultadoEscala(char, key, pac) + '</div>'
                + '<div style="font-size:9px;color:#9ca3af;margin-top:4px">Custo: ' + auraTot + '% de aura'
                + (reaTot > 0 ? ' · ' + reaTot + ' Reaç' + (reaTot > 1 ? 'ões' : 'ão') : '') + '</div></div>'
                + '<div style="display:flex;gap:8px;margin-top:16px">'
                + '<button onclick="window._fecharEscalaPrincipio()" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '<button ' + (cabe ? 'onclick="window._confirmarEscalaPrincipio()"' : 'disabled')
                + ' style="flex:2;padding:12px;border-radius:10px;background:#60a5fa;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:'
                + (cabe ? 'pointer' : 'not-allowed') + ';opacity:' + (cabe ? '1' : '0.5') + '">Ativar</button>'
                + '</div></div></div>';
        }
        // ── Balão: como este Hatsu é entregue? ──────────────────────────────────────
        // O RYU só vale em combate direto, mas um Hatsu que comprou ALCANCE pode ser
        // tanto uma rajada quanto uma adaga arremessada — os metros são os mesmos nos
        // dois casos. Quem sabe é o jogador, então o app pergunta UMA VEZ por Hatsu e
        // guarda a resposta: como o Hatsu é entregue não muda de golpe para golpe, e
        // perguntar a cada rolagem seria o terceiro balão do mesmo ataque (os outros
        // dois são o modo de rolagem e o REN).
        //
        // A lista oferece só as armas do inventário que de fato qualificam — nada de
        // mostrar o arco para depois recusar o bônus em silêncio.
        function ryuArmasDoInventario(char) {
            const vistos = {};
            return ((char || {}).inventory || [])
                .map(function (it) { return it && it.name; })
                .filter(function (nome) {
                    if (!nome || vistos[nome]) return false;
                    vistos[nome] = 1;
                    return !!(window.ryuAlcancaArma && window.ryuAlcancaArma(findItemData(nome), nome));
                });
        }
        window._trocarRyuEntrega = function (idx) {
            // Chamado pelo link "trocar" na tela do Hatsu: abre o balão sem nenhuma
            // rolagem em andamento (mode null), então confirmar só grava e fecha.
            state.pendingRyuEntrega = { idx: idx, mode: null };
            render(true);
        };
        window._fecharRyuEntrega = function () { state.pendingRyuEntrega = null; render(true); };
        function _gravarRyuEntrega(valor) {
            const p = state.pendingRyuEntrega;
            state.pendingRyuEntrega = null;
            if (!p) return;
            const char = state.currentChar;
            const h = (char.hatsus || [])[p.idx];
            if (h) { h.ryuEntrega = String(valor); saveCharacter(char); }
            render(true);
            // Retoma a rolagem de onde ela parou. O render acima refez o
            // _hatsuRollState, então o maybeAskRenThenRoll segue com o estado novo.
            if (p.mode) setTimeout(function () { maybeAskRenThenRoll(p.mode); }, 0);
        }
        window._confirmarRyuEntrega = function (valor) { _gravarRyuEntrega(valor); };
        // Por ÍNDICE, e não por nome: nome de item pode ter aspas e acento, e montar
        // isso dentro de um onclick é pedir para quebrar.
        window._confirmarRyuEntregaArma = function (i) {
            const armas = ryuArmasDoInventario(state.currentChar);
            const nome = armas[parseInt(i)];
            if (!nome) return;
            _gravarRyuEntrega(nome);
        };
        function renderRyuEntregaModalHtml() {
            if (!state.pendingRyuEntrega) return '';
            const char = state.currentChar;
            const h = (char.hatsus || [])[state.pendingRyuEntrega.idx] || {};
            const armas = ryuArmasDoInventario(char);
            const COR = '#38bdf8';
            const atual = h.ryuEntrega || '';
            const botao = function (acao, rotulo, nota, ligado) {
                return '<button onclick="' + acao + '" style="display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:9px 11px;margin-bottom:6px;border-radius:9px;cursor:pointer;border:1px solid '
                    + (ligado ? COR : '#1f2937') + ';background:' + (ligado ? COR + '15' : '#0f1117') + '">'
                    + '<span style="flex:1;font-size:10px;font-weight:700;color:' + (ligado ? COR : '#d1d5db') + '">' + rotulo + '</span>'
                    + (nota ? '<span style="font-size:8px;color:#6b7280">' + nota + '</span>' : '')
                    + '</button>';
            };
            const DESARM = window.RYU_ENTREGA_DESARMADO || 'desarmado';
            const NENHUM = window.RYU_ENTREGA_NENHUM || 'nenhum';
            let lista = botao("window._confirmarRyuEntrega('" + DESARM + "')", '✊ Desarmado', 'corpo-a-corpo', atual === DESARM);
            lista += armas.map(function (nome, i) {
                const d = findItemData(nome) || {};
                const arremesso = (d.tags || []).some(function (t) { return /^arremesso/i.test(String(t).trim()); });
                return botao('window._confirmarRyuEntregaArma(' + i + ')', '⚔️ ' + nome,
                    arremesso ? 'arremesso' : 'corpo-a-corpo', atual === nome);
            }).join('');
            lista += botao("window._confirmarRyuEntrega('" + NENHUM + "')",
                '✖ Nenhum dos dois', 'o RYU não entra', atual === NENHUM);
            const semArmas = armas.length === 0
                ? '<div style="font-size:8px;color:#6b7280;margin:-2px 0 8px">Nenhuma arma de corpo-a-corpo ou de arremesso no seu inventário.</div>'
                : '';
            return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif;overflow:auto">'
                + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:18px;padding:20px;width:100%;max-width:360px;box-shadow:0 0 40px ' + COR + '44;text-align:center;max-height:92vh;overflow:auto">'
                + '<div style="font-size:22px;margin-bottom:4px">🌊</div>'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + COR + ';text-transform:uppercase;letter-spacing:1.5px">Esse ataque é desarmado ou usa arma?</div>'
                + '<div style="font-size:9px;color:#6b7280;margin:7px 0 12px;line-height:1.5">O RYU só vale em combate direto. Este Hatsu tem alcance, então pode ser tanto um arremesso quanto uma rajada — a ficha não tem como saber. <b style="color:#9ca3af">A resposta fica salva neste Hatsu</b> e dá para trocar depois.</div>'
                + '<div style="text-align:left">' + lista + '</div>'
                + semArmas
                + '<button onclick="window._fecharRyuEntrega()" style="width:100%;margin-top:6px;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '</div></div>';
        }
        // ── Balão: que tipo de ação falhou na Ênfase? ───────────────────────────────
        // Abre no instante da falha, antes de qualquer outra coisa, porque a
        // consequência muda tudo e só o jogador sabe o que a ação era.
        window._abrirFalhaEnfase = function () { state.pendingFalhaEnfase = { tipo: null }; render(true); };
        window._fecharFalhaEnfase = function () { state.pendingFalhaEnfase = null; render(true); };
        window._aplicarFalhaEnfase = function (id) {
            const char = state.currentChar;
            const t = window.tipoFalhaEnfase(id);
            if (!t) return;
            let ambiental = null;
            if (t.tabela) {
                const r = Math.floor(Math.random() * 10) + 1;
                ambiental = { roll: r, texto: (window.ENFASE_FALHA_AMBIENTAL || [])[r - 1] || '—' };
            }
            // O estado com duração vive aqui e é descontado pelo "Passar rodada".
            if (t.rodadas > 0 || t.interacoes > 0) {
                char.enfaseFalha = { tipo: t.id, rotulo: t.rotulo,
                    rodadas: t.rodadas, penalidade: t.penalidade, interacoes: t.interacoes };
            }
            // Fica registrado no painel de Condições, junto dos surtos, para não
            // depender de ninguém lembrar.
            if (!char.conditions) char.conditions = [];
            char.conditions.push({
                categoria: 'FALHA DE ÊNFASE',
                condicao: t.texto + (ambiental ? ' → 1d10 [' + ambiental.roll + ']: ' + ambiental.texto : ''),
                roll: ambiental ? (ambiental.roll + ' (1d10)') : '—',
                duracao: t.rodadas > 0 ? (t.rodadas + ' rodadas') : (t.interacoes > 0 ? (t.interacoes + ' interações') : 'imediata'),
                sanPct: Math.round(((char.vitals.san || 100) / (char.vitals.sanMax || 100)) * 100),
                data: new Date().toLocaleDateString('pt-BR'),
                resolved: false,
            });
            state.pendingFalhaEnfase = null;
            // A sanidade sai pelo updateVital para o surto de loucura disparar se a
            // perda cruzar uma faixa — é o mesmo caminho de qualquer outro dano mental.
            if (t.sanidade < 0) { saveCharacter(char); updateVital('san', t.sanidade); }
            else { saveCharacter(char); render(true); }
            window._showXpToast && window._showXpToast('💥 ' + t.rotulo + (t.sanidade ? (' — ' + t.sanidade + ' de Sanidade') : ''));
        };
        function renderFalhaEnfaseModalHtml() {
            if (!state.pendingFalhaEnfase) return '';
            const COR = '#f87171';
            const opts = (window.ENFASE_FALHA_TIPOS || []).map(function (t) {
                const custo = [];
                if (t.sanidade) custo.push(t.sanidade + ' Sanidade');
                if (t.penalidade) custo.push(t.penalidade + ' por ' + t.rodadas + ' rodadas');
                else if (t.rodadas) custo.push(t.rodadas + ' rodadas');
                if (t.interacoes) custo.push(t.interacoes + ' interações');
                if (t.tabela) custo.push('rola 1d10');
                return '<button onclick="window._aplicarFalhaEnfase(\'' + t.id + '\')" style="display:block;width:100%;text-align:left;padding:9px 11px;margin-bottom:6px;border-radius:9px;cursor:pointer;border:1px solid #1f2937;background:#0f1117">'
                    + '<div style="font-size:10px;font-weight:700;color:#d1d5db">' + t.icone + ' ' + t.rotulo
                    + (custo.length ? ' <span style="font-size:8px;color:' + COR + '">(' + custo.join(' · ') + ')</span>' : '') + '</div>'
                    + '<div style="font-size:8px;color:#6b7280;margin-top:2px;line-height:1.45">' + t.texto + '</div>'
                    + '</button>';
            }).join('');
            return '<div style="position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif;overflow:auto">'
                + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:18px;padding:20px;width:100%;max-width:380px;box-shadow:0 0 40px ' + COR + '44;text-align:center;max-height:92vh;overflow:auto">'
                + '<div style="font-size:24px;margin-bottom:2px">💥</div>'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + COR + ';text-transform:uppercase;letter-spacing:1.5px">Falha na Ênfase</div>'
                + '<div style="font-size:9px;color:#6b7280;margin:6px 0 12px;line-height:1.5">A Ênfase cobra o preço na falha. <b style="color:#9ca3af">Que tipo de ação era?</b> A consequência muda conforme a resposta.</div>'
                + '<div style="text-align:left">' + opts + '</div>'
                + '<button onclick="window._fecharFalhaEnfase()" style="width:100%;margin-top:4px;padding:10px;border-radius:10px;background:transparent;border:1px solid #374151;color:#6b7280;font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer">O mestre resolve na mão</button>'
                + '</div></div>';
        }

        // ── Recuperar Sanidade pelas rotas de mesa ──────────────────────────────────
        // As quatro rotas não automáticas: um descanso longo, cumprir o que se ama,
        // o Foco de Caça e a Ação Protagonista BEM SUCEDIDA. Essa última depende de
        // um julgamento que só o jogador faz — o app sabe que ela foi gasta, não que
        // ela deu certo.
        window._recuperarSanidade = function (id) {
            const char = state.currentChar;
            const v = char.vitals || {};
            if ((v.san || 0) >= (v.sanMax || 100)) return;
            const rec = window.calcRecuperacaoSanidade ? window.calcRecuperacaoSanidade(char, id) : null;
            if (!rec) return;
            const antes = v.san || 0;
            v.san = Math.min(v.sanMax || 100, antes + rec.total);
            const ganho = v.san - antes;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            char.history.push({ time, label: '🔮 Sanidade — ' + rec.rota.rotulo,
                dice: rec.dados.join(', '), mod: rec.int, total: rec.total });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);
            render(true);
            window._showXpToast && window._showXpToast('🔮 +' + ganho + ' de Sanidade — '
                + rec.rota.rotulo + ' (' + rec.rota.dado + ' [' + rec.dados.join(', ') + ']'
                + (rec.int ? (rec.int > 0 ? ' +' : ' ') + rec.int : '') + ')');
        };

        // ── Nova sessão: devolve os 3 usos de Ênfase ────────────────────────────────
        // Não mexe na Ação Protagonista guardada: ela é fruto de uma falha que
        // aconteceu, e não um recurso que recarrega.
        window._novaSessaoEnfase = function () {
            const char = state.currentChar;
            const _max = window.ENFASE_USOS_POR_SESSAO || 3;
            if (!confirm('Nova sessão?\n\nIsso devolve os ' + _max + ' usos de Ênfase. A Ação Protagonista guardada, se houver, continua.')) return;
            char.enfaseUsos = 0;
            saveCharacter(char);
            render(true);
            window._showXpToast && window._showXpToast('🎯 Nova sessão — ' + _max + ' usos de Ênfase disponíveis.');
        };

        // ── Balão da Ação Protagonista ──────────────────────────────────────────────
        window._abrirAcaoProtagonista = function () {
            if (!window.temAcaoProtagonista || !window.temAcaoProtagonista(state.currentChar)) return;
            state.pendingAcaoProt = { uso: 'virada', resultado: null };
            render(true);
        };
        window._setUsoAcaoProtagonista = function (id) {
            if (!state.pendingAcaoProt) return;
            state.pendingAcaoProt.uso = String(id);
            render(true);
        };
        window._fecharAcaoProtagonista = function () { state.pendingAcaoProt = null; render(true); };
        window._rolarAcaoProtagonista = function () {
            const pa = state.pendingAcaoProt;
            if (!pa) return;
            const char = state.currentChar;
            const uso = window.usoAcaoProtagonista(pa.uso);
            if (!uso) return;
            // Gasta primeiro: assim uma falha de rede no Discord não devolve o recurso
            // sem o jogador perceber.
            char.acaoProtagonista = Math.max(0, (parseInt(char.acaoProtagonista) || 0) - 1);
            let dados, total;
            if (uso.modo) {
                // Rerolagem com Vantagem ou Desvantagem: 2d20, como qualquer outra.
                // Passa pelo mesmo getRollResult para não existirem duas regras de
                // Vantagem no app.
                const r = getRollResult(uso.modo);
                dados = r.dice; total = r.total;
            } else {
                dados = [];
                for (let i = 0; i < 3; i++) dados.push(Math.floor(Math.random() * 6) + 1);
                total = dados.reduce(function (a, b) { return a + b; }, 0);
            }
            const rotulo = '⭐ Ação Protagonista — ' + uso.rotulo;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            char.history.push({ time, label: rotulo, dice: dados.join(', '), mod: 0, total: total });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);
            sendToDiscord(rotulo + ' (' + uso.dado + ')', dados, 0, total, char.name);
            state.pendingAcaoProt = { uso: pa.uso, resultado: { dados: dados, total: total, uso: uso } };
            render(true);
        };
        function renderAcaoProtagonistaModalHtml() {
            if (!state.pendingAcaoProt) return '';
            const pa = state.pendingAcaoProt;
            const COR = '#fbbf24';
            if (pa.resultado) {
                const r = pa.resultado;
                const explica = r.uso.id === 'virada'
                    ? 'Este é o seu novo resultado. Some os seus bônus normalmente.'
                    : (r.uso.id === 'penalizar'
                        ? 'Passe este número ao mestre: é a nova rolagem do inimigo.'
                        : (r.uso.alvo === 'inimigo'
                            ? 'Passe ao mestre: este total sai da rolagem do inimigo.'
                            : 'Some este total ao resultado que você tinha rolado.'));
                return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif">'
                    + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:18px;padding:22px;width:100%;max-width:330px;box-shadow:0 0 40px ' + COR + '44;text-align:center">'
                    + '<div style="font-size:26px;margin-bottom:4px">⭐</div>'
                    + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;color:' + COR + ';text-transform:uppercase;letter-spacing:1.5px">' + r.uso.rotulo + '</div>'
                    + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:40px;color:#fff;margin:10px 0 2px;text-shadow:0 0 18px ' + COR + '88">'
                    + (r.uso.id === 'impulso_subtrair' ? '−' : '') + r.total + '</div>'
                    + '<div style="font-size:9px;color:#6b7280">' + r.uso.dado + ': [' + r.dados.join(', ') + ']</div>'
                    + '<div style="font-size:10px;color:#9ca3af;margin-top:10px;line-height:1.5">' + explica + '</div>'
                    // "Após o uso/gasto de uma Ação Protagonista BEM SUCEDIDA: 1d10+INT."
                    // O app sabe que ela foi gasta, não que deu certo — então pergunta
                    // aqui, no momento em que o jogador acabou de ver o resultado.
                    + ((state.currentChar.vitals.san || 100) < (state.currentChar.vitals.sanMax || 100)
                        ? '<button onclick="window._recuperarSanidade(\'usar_ap\');window._fecharAcaoProtagonista()" style="width:100%;margin-top:12px;padding:10px;border-radius:10px;background:#c084fc18;border:1px solid #c084fc55;color:#c084fc;font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer">🔮 Foi bem sucedida (+1d10+INT de Sanidade)</button>'
                        : '')
                    + '<button onclick="window._fecharAcaoProtagonista()" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:' + COR + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Fechar</button>'
                    + '</div></div>';
            }
            const opts = (window.ACAO_PROTAGONISTA_USOS || []).map(function (u) {
                const on = pa.uso === u.id;
                return '<button onclick="window._setUsoAcaoProtagonista(\'' + u.id + '\')" style="display:block;width:100%;text-align:left;padding:9px 11px;margin-bottom:6px;border-radius:9px;cursor:pointer;border:1px solid '
                    + (on ? COR : '#1f2937') + ';background:' + (on ? COR + '15' : '#0f1117') + '">'
                    + '<div style="font-size:10px;font-weight:700;color:' + (on ? COR : '#d1d5db') + '">'
                    + u.icone + ' ' + u.rotulo + ' <span style="font-size:8px;color:#6b7280">(' + u.dado + ')</span></div>'
                    + '<div style="font-size:8px;color:#6b7280;margin-top:2px">' + u.nota + '</div>'
                    + '</button>';
            }).join('');
            return '<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif;overflow:auto">'
                + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:18px;padding:20px;width:100%;max-width:360px;box-shadow:0 0 40px ' + COR + '44;text-align:center;max-height:92vh;overflow:auto">'
                + '<div style="font-size:24px;margin-bottom:2px">⭐</div>'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + COR + ';text-transform:uppercase;letter-spacing:1.5px">Ação Protagonista</div>'
                + '<div style="font-size:9px;color:#6b7280;margin:6px 0 12px;line-height:1.5">Use depois de ver o resultado. Gasta a sua única Ação Protagonista — a próxima só vem na próxima falha de Ênfase.</div>'
                + '<div style="text-align:left">' + opts + '</div>'
                + '<div style="display:flex;gap:8px;margin-top:10px">'
                + '<button onclick="window._fecharAcaoProtagonista()" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '<button onclick="window._rolarAcaoProtagonista()" style="flex:2;padding:12px;border-radius:10px;background:' + COR + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Rolar</button>'
                + '</div></div></div>';
        }
        function renderRenPromptModalHtml() {
            if (!state.pendingRenRoll) return '';
            const char = state.currentChar;
            const pr = state.pendingRenRoll;
            const grausMax = pr.grausMax || 1;
            const grausEsc = pr.grausEscolhidos || 1;
            const renFree = window.isRenFreeUsoDisponivel ? window.isRenFreeUsoDisponivel(char) : false;
            const grausGratisAprim = window.calcRenGrausGratisAprimoramento ? window.calcRenGrausGratisAprimoramento(char) : 0;
            const grausPagos = Math.max(0, grausEsc - (renFree ? 1 : 0) - grausGratisAprim);
            const custoTxt = grausPagos <= 0 ? 'Grátis' : `${grausPagos * 5}% de Aura${(renFree || grausGratisAprim>0) ? ` (${(renFree?1:0)+grausGratisAprim} grátis)` : ''}`;
            const stepperHtml = grausMax > 1
                ? `<div style="display:flex;gap:4px;justify-content:center;margin-top:12px">
                    ${Array.from({length: grausMax}, (_, i) => i + 1).map(n => `
                        <button onclick="_hSetRenPromptGraus(${n})" style="width:34px;height:34px;border-radius:9px;font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;cursor:pointer;border:1.5px solid ${grausEsc===n?'#a78bfa':'#374151'};background:${grausEsc===n?'#a78bfa33':'#1f2937'};color:${grausEsc===n?'#a78bfa':'#9ca3af'}">${n}</button>
                    `).join('')}
                   </div>
                   <div style="font-size:8px;color:#6b7280;margin-top:6px">Graus de dano a comprar (máx. ${grausMax} — limite do nível)</div>`
                : '';
            return `<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif">
                <div style="background:#0d1117;border:2px solid #a78bfa;border-radius:18px;padding:22px;width:100%;max-width:340px;box-shadow:0 0 40px #a78bfa44;text-align:center">
                    <div style="font-size:22px;margin-bottom:6px">💪</div>
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#a78bfa;text-transform:uppercase;letter-spacing:2px">Usar REN neste ataque?</div>
                    <div style="font-size:10px;color:#9ca3af;margin-top:8px;line-height:1.5">Adiciona +${grausEsc} Grau${grausEsc>1?'s':''} de dano a este golpe.<br>Custo: <b style="color:#a78bfa">${custoTxt}</b></div>
                    ${stepperHtml}
                    <div style="display:flex;gap:8px;margin-top:16px">
                        <button onclick="window._hResolveRenPrompt(false)" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Não</button>
                        <button onclick="window._hResolveRenPrompt(true)" style="flex:2;padding:12px;border-radius:10px;background:#a78bfa;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">💪 Usar REN</button>
                    </div>
                </div>
            </div>`;
        }
        // rev. Manual (Cap. 4 Combate) — mesma mecânica de REN do Hatsu ("Cada 5% Aura = +1
        // grau/passo de dano"), agora aplicada a golpes de arma/desarmado. Só oferece o prompt se
        // o dado atual da arma existir na window.DAMAGE_TABLE (armas com dado fora da progressão
        // padrão, ex. 2d4/3d6/4d6, não têm posição na tabela — o golpe rola normal, sem REN).
        function maybeAskRenThenRollAttack(weaponName, diceExpr, attrKey, mode) {
            const char = state.currentChar;
            const ren = ((char.nenDominio || {}).ren) || 0;
            const idxAtual = window.DAMAGE_TABLE ? window.DAMAGE_TABLE.indexOf(diceExpr) : -1;
            const grausTabela = idxAtual >= 0 ? (window.DAMAGE_TABLE.length - 1 - idxAtual) : 0;
            const aura = char.vitals.aura || 0;
            const renFree = window.isRenFreeUsoDisponivel ? window.isRenFreeUsoDisponivel(char) : false;
            const grausGratisAprim = window.calcRenGrausGratisAprimoramento ? window.calcRenGrausGratisAprimoramento(char) : 0;
            const grausAura = Math.floor(aura / 5) + (renFree ? 1 : 0) + grausGratisAprim;
            const grausMax = ren > 0 ? Math.min(grausTabela, grausAura) : 0;
            if (grausMax > 0) {
                state.pendingRenAttackRoll = { weaponName, diceExpr, attrKey, mode, grausMax, grausEscolhidos: 1 };
                render(true);
            } else {
                rollAttack(weaponName, diceExpr, attrKey, mode, 0);
            }
        }
        function _hSetRenAttackPromptGraus(n) {
            if (!state.pendingRenAttackRoll) return;
            const max = state.pendingRenAttackRoll.grausMax || 1;
            state.pendingRenAttackRoll.grausEscolhidos = Math.max(1, Math.min(max, parseInt(n) || 1));
            render(true);
        }
        window._hResolveRenAttackPrompt = function(useRen) {
            const pr = state.pendingRenAttackRoll;
            state.pendingRenAttackRoll = null;
            if (!pr) return;
            rollAttack(pr.weaponName, pr.diceExpr, pr.attrKey, pr.mode, useRen ? (pr.grausEscolhidos || 1) : 0);
        };
        function renderRenAttackPromptModalHtml() {
            if (!state.pendingRenAttackRoll) return '';
            const char = state.currentChar;
            const pr = state.pendingRenAttackRoll;
            const grausMax = pr.grausMax || 1;
            const grausEsc = pr.grausEscolhidos || 1;
            const renFree = window.isRenFreeUsoDisponivel ? window.isRenFreeUsoDisponivel(char) : false;
            const grausGratisAprim = window.calcRenGrausGratisAprimoramento ? window.calcRenGrausGratisAprimoramento(char) : 0;
            const grausPagos = Math.max(0, grausEsc - (renFree ? 1 : 0) - grausGratisAprim);
            const custoTxt = grausPagos <= 0 ? 'Grátis' : `${grausPagos * 5}% de Aura${(renFree || grausGratisAprim>0) ? ` (${(renFree?1:0)+grausGratisAprim} grátis)` : ''}`;
            const stepperHtml = grausMax > 1
                ? `<div style="display:flex;gap:4px;justify-content:center;margin-top:12px;flex-wrap:wrap">
                    ${Array.from({length: grausMax}, (_, i) => i + 1).map(n => `
                        <button onclick="_hSetRenAttackPromptGraus(${n})" style="width:34px;height:34px;border-radius:9px;font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;cursor:pointer;border:1.5px solid ${grausEsc===n?'#a78bfa':'#374151'};background:${grausEsc===n?'#a78bfa33':'#1f2937'};color:${grausEsc===n?'#a78bfa':'#9ca3af'}">${n}</button>
                    `).join('')}
                   </div>
                   <div style="font-size:8px;color:#6b7280;margin-top:6px">Graus de dano a comprar (máx. ${grausMax} — limite de Aura disponível)</div>`
                : '';
            return `<div style="position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif">
                <div style="background:#0d1117;border:2px solid #a78bfa;border-radius:18px;padding:22px;width:100%;max-width:340px;box-shadow:0 0 40px #a78bfa44;text-align:center">
                    <div style="font-size:22px;margin-bottom:6px">💪</div>
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#a78bfa;text-transform:uppercase;letter-spacing:2px">Usar REN neste golpe?</div>
                    <div style="font-size:10px;color:#9ca3af;margin-top:8px;line-height:1.5">${pr.weaponName}: adiciona +${grausEsc} Grau${grausEsc>1?'s':''} de dano a este golpe.<br>Custo: <b style="color:#a78bfa">${custoTxt}</b></div>
                    ${stepperHtml}
                    <div style="display:flex;gap:8px;margin-top:16px">
                        <button onclick="window._hResolveRenAttackPrompt(false)" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Não</button>
                        <button onclick="window._hResolveRenAttackPrompt(true)" style="flex:2;padding:12px;border-radius:10px;background:#a78bfa;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">💪 Usar REN</button>
                    </div>
                </div>
            </div>`;
        }
        function renderRollModeModalHtml() {
            if (!state.pendingRoll) return '';
            const pr = state.pendingRoll;
           const MODES = [
                { id: 'NORMAL',      label: 'Normal',      icon: '🎲', desc: '1d20',       bg: '#1f2937', col: '#9ca3af' },
                { id: 'VANTAGEM',    label: 'Vantagem',    icon: '⬆️', desc: '2d20 maior',  bg: '#14532d', col: '#4ade80' },
                { id: 'DESVANTAGEM', label: 'Desvantagem', icon: '⬇️', desc: '2d20 menor',  bg: '#7f1d1d', col: '#f87171' },
                // O rótulo dizia "2d20 ≈ 10", o OPOSTO do que o getRollResult faz: ele fica
                // com o dado MAIS DISTANTE de 10. O bestiario já descrevia certo ("o mais
                // extremo"); era a ficha que mentia para o jogador.
                { id: 'ÊNFASE',      label: 'Ênfase',      icon: '🎯', desc: '2d20, o mais extremo', bg: '#1e1b4b', col: '#a78bfa' },
            ];
            const _mwhs = loadWebhooks();
            // Só mostra o seletor se há múltiplos webhooks E nenhum padrão definido
            const _showWhPicker = _mwhs.length > 1 && state.defaultWebhook < 0;
            const _whPickerHtml = _showWhPicker ? `
                <div style="margin-bottom:14px">
                    <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;text-align:center">📡 Enviar para</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
                        ${_mwhs.map((w, i) => `<button onclick="setWebhook(${i})" style="padding:6px 12px;border-radius:8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;cursor:pointer;font-family:'Orbitron',sans-serif;transition:all .15s;${state.selectedWebhook === i ? 'background:#1d4ed8;border:2px solid #3b82f6;color:#93c5fd;' : 'background:#111827;border:2px solid #374151;color:#6b7280;'}">${w.name}</button>`).join('')}
                    </div>
                </div>` : '';
            // Anexo de imagem/gif: só faz sentido em rolagens de ataque (arma), onde o resultado
            // vira uma mensagem de combate no Discord — dano puro/perícia não tem esse anexo. O
            // Hatsu já escolhe a imagem antes de abrir este modal (widget no rodapé de
            // renderHatsuDetail), então não duplica o campo aqui.
            const _showImageAttach = pr.type === 'attack';
            const _imgVal = state.pendingRollImage || '';
            const _isDataImg = /^data:image\//i.test(_imgVal);
            const _imageAttachHtml = _showImageAttach ? `
                <div style="margin-bottom:14px">
                    <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;text-align:center">🖼️ Imagem/GIF (opcional)</div>
                    <div style="display:flex;gap:6px;align-items:center">
                        <input id="pending-roll-image-input" type="text" value="${_isDataImg ? '' : _imgVal.replace(/"/g, '&quot;')}" placeholder="Cole um link (ex: GIF do Tenor/Giphy)..." oninput="state.pendingRollImage=this.value" onchange="render(true)" style="flex:1;min-width:0;background:#111827;border:1px solid #374151;border-radius:8px;padding:9px 10px;color:#fff;font-size:10px;box-sizing:border-box;outline:none" />
                        <label title="Enviar arquivo de imagem" style="padding:9px 10px;border-radius:8px;border:2px solid #374151;background:transparent;color:#9ca3af;cursor:pointer;font-size:13px;line-height:1;flex-shrink:0">📎<input type="file" accept="image/*" style="display:none" onchange="window._hUploadPendingRollImage(this)" /></label>
                    </div>
                    ${_imgVal ? `<div style="margin-top:8px;display:flex;align-items:center;gap:8px">
                        <img src="${_imgVal.replace(/"/g, '&quot;')}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #374151" onerror="this.style.display='none'" />
                        <span style="font-size:9px;color:#4b5563">${_isDataImg ? 'Arquivo anexado' : 'Link anexado'}</span>
                        <button onclick="window._hClearPendingRollImage()" style="font-size:9px;color:#f87171;background:transparent;border:none;cursor:pointer;text-decoration:underline;margin-left:auto">remover</button>
                    </div>` : ''}
                </div>` : '';
            return `<div class="fixed inset-0 z-[200] flex items-end justify-center" style="background:rgba(0,0,0,0.75);backdrop-filter:blur(4px)" onclick="cancelPendingRoll()">
                <div style="background:#0d1117;border-radius:20px 20px 0 0;border:1px solid #1f2937;border-bottom:none;padding:20px 16px 32px;width:100%;max-width:440px" onclick="event.stopPropagation()">
                    <div style="width:40px;height:4px;background:#374151;border-radius:2px;margin:0 auto 16px"></div>
                    ${_whPickerHtml}
                    ${_imageAttachHtml}
                    <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;text-align:center">🎲 Modo de Rolagem</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                        ${MODES.map(m => {
                            // A Ênfase tem 3 usos por sessão e é o único modo contado.
                            // Sem usos, o botão apaga e deixa de ser clicável — senão o
                            // jogador gastaria um 4º sem o app dizer nada.
                            const _enf = m.id === 'ÊNFASE';
                            const _rest = _enf && window.enfaseUsosRestantes
                                ? window.enfaseUsosRestantes(state.currentChar) : null;
                            const _off = _enf && _rest === 0;
                            return `<button ${_off ? '' : `onclick="executePendingRoll('${m.id}')"`}
                            style="display:flex;flex-direction:column;align-items:center;padding:14px 8px;border-radius:12px;background:${m.bg};border:2px solid ${m.col}44;color:${m.col};cursor:${_off ? 'not-allowed' : 'pointer'};opacity:${_off ? 0.4 : 1};font-family:'Rajdhani',sans-serif">
                            <span style="font-size:20px;margin-bottom:4px">${m.icon}</span>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:1px">${m.label}</span>
                            <span style="font-size:8px;opacity:.6;margin-top:2px">${_enf ? (_off ? 'sem usos' : m.desc + ' · ' + _rest + '/' + (window.ENFASE_USOS_POR_SESSAO || 3)) : m.desc}</span>
                        </button>`; }).join('')}
                    </div>
                    ${(() => {
                        // Aviso ANTES de rolar: com uma Ação Protagonista ainda guardada, a
                        // falha da Ênfase não concede outra — e esse é justamente o motivo
                        // de alguém escolher Ênfase de propósito. Sem o aviso, o jogador
                        // arriscaria a rolagem mais extrema do jogo por um prêmio que não viria.
                        const _c = state.currentChar;
                        if (!(window.temAcaoProtagonista && window.temAcaoProtagonista(_c))) return '';
                        return `<div style="margin:-4px 0 12px;padding:8px 10px;border-radius:9px;background:#fbbf2412;border:1px solid #fbbf2444;font-size:9px;color:#fbbf24;line-height:1.5;text-align:left">
                            ⭐ Você ainda tem uma <b>Ação Protagonista</b> guardada — falhar na Ênfase <b>não</b> vai conceder outra até gastar esta.
                        </div>`;
                    })()}
                    <button onclick="cancelPendingRoll()" style="width:100%;padding:10px;border-radius:10px;background:transparent;border:1px solid #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">Cancelar</button>
                </div>
            </div>`;
        }
        function rollAttack(weaponName, diceExpr, attrKey, mode, grausRen) {
            const char = state.currentChar;
            const mod = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, attrKey).mod : getMod((char.attributes[attrKey] || {}).value || 10);
            const pb = getProficiencyBonus(char.level);
            // Instâncias e Inclinações de acerto (Observador, Decisiva) — o mesmo
            // calcBonusAcerto que o Hatsu usa, para os dois caminhos não divergirem.
            const _baW = window.calcBonusAcerto ? window.calcBonusAcerto(char) : { total: 0, fontes: [] };
            // RYU: vale com o punho, com arma de corpo-a-corpo e com arma de arremesso.
            // Fica de fora de arco, besta, arma de fogo e arma de cerco — nelas a aura
            // do RYU não acompanha o projétil. findItemData acha a arma no ITEM_DB, que
            // já traz a categoria e as etiquetas.
            const _ryuArmaOk = window.ryuAlcancaArma
                ? window.ryuAlcancaArma(findItemData(weaponName), weaponName) : false;
            const _ryuW = window.calcBonusAcertoRyu
                ? window.calcBonusAcertoRyu(char, _ryuArmaOk) : { total: 0, ryu: null };
            const attackRoll = getRollResult(mode || state.rollMode);
            // Na falha da Ênfase todo esse pacote vira penalidade — ver totalComEnfase.
            const attackTotal = window.totalComEnfase(attackRoll, mod + pb + _baW.total + _ryuW.total,
                window.calcPenalidadeEnfase ? window.calcPenalidadeEnfase(char) : 0);
            // Margem de crítico da ficha, piso 18, comparada contra o d20 USADO.
            const _mcW = window.calcMargemCritico ? window.calcMargemCritico(char) : { valor: 20 };
            const isCrit = attackRoll.total >= _mcW.valor;
            const isFumble = attackRoll.dice.length === 1 && attackRoll.dice[0] === 1;

            // ── REN: escalona +N Grau(s) de dano deste golpe (Manual: cada 5% Aura = +1 grau/passo) ──
            const renGraus = Math.max(0, parseInt(grausRen) || 0);
            const useRen = renGraus > 0;
            let renDiceExpr = diceExpr;
            let renCost = 0;
            let renUsedFree = false;
            if (useRen && window.DAMAGE_TABLE) {
                const idxD = window.DAMAGE_TABLE.indexOf(diceExpr);
                if (idxD >= 0) renDiceExpr = window.DAMAGE_TABLE[Math.min(idxD + renGraus, window.DAMAGE_TABLE.length - 1)];
                renUsedFree = window.isRenFreeUsoDisponivel ? window.isRenFreeUsoDisponivel(char) : false;
                const grausGratisAprim = window.calcRenGrausGratisAprimoramento ? window.calcRenGrausGratisAprimoramento(char) : 0;
                const grausPagos = Math.max(0, renGraus - (renUsedFree ? 1 : 0) - grausGratisAprim);
                renCost = grausPagos * 5;
                if (renUsedFree && window.marcarRenFreeUsoConsumido) window.marcarRenFreeUsoConsumido(char);
                char.vitals.aura = Math.max(0, (char.vitals.aura || 0) - renCost);
            }

            // SHU: o dado vai no item envolvido, então só entra quando a arma rolada é ela.
            // Só é possível somar como SEGUNDO TERMO porque o rollDiceExpr passou a aceitar
            // expressão de vários termos.
            const _shuR = (window.calcShuAtivo && window.principioAtivo && window.principioAtivo(char, 'shu'))
                ? window.calcShuAtivo(char) : null;
            const _shuNaArma = !!(_shuR && _shuR.item && _shuR.item === weaponName);
            if (_shuNaArma) renDiceExpr = renDiceExpr + ' + ' + _shuR.dadoDano;
            const dmgResult = rollDiceExpr(renDiceExpr);
            // Crítico dobra os DADOS; o KO multiplica o dano inteiro depois disso.
            const _koMultW = window.multiplicadorDanoKo ? window.multiplicadorDanoKo(char) : 1;
            // RYU: o mesmo número que entrou no acerto entra também no dano, porque a
            // coluna da tabela é "Ataque e Dano". É valor fixo, então fica FORA da dobra
            // do crítico — o crítico dobra os dados.
            const dmgTotal = ((isCrit ? dmgResult.total * 2 : dmgResult.total) + mod + _ryuW.total) * _koMultW;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const renLabel = useRen ? ' 💪REN' : '';
            char.history.push({ time, label: `⚔️ ${weaponName} (${attrKey})${renLabel}`, dice: attackRoll.dice.join(', '), mod: mod + pb, total: attackTotal, img: state.pendingRollImage || '' });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);
            const suffix = isCrit
                ? ` 🎯 **CRÍTICO!**${_mcW.valor < 20 ? ` (margem ${_mcW.valor}+)` : ''}`
                : (isFumble ? ' 💀 **FALHA CRÍTICA!**' : '');
            const renNote = useRen ? `\n💪 **REN ativado** — +${renGraus} Grau${renGraus>1?'s':''} de dano${renUsedFree ? ' (1º grátis no dia)' : ''}` : '';
            const _critNote = isCrit ? '\n🎯 **Crítico** — dados de dano dobrados' : '';
            const _koNote = _koMultW > 1 ? `\n🔥 **KO ativado** — dano total ×${_koMultW} (CA reduzida em 80%)` : '';
            const content = `⚔️ **${char.name}** atacou com **${weaponName}**\nAtaque: [${attackRoll.dice.join(', ')}] +${mod + pb} = **${attackTotal}**${suffix}\nDano: [${dmgResult.rolls.join('+')}] +${mod} = **${dmgTotal}** (${renDiceExpr} + ${attrKey})${renNote}${_critNote}${_koNote}`;
            sendRollToDiscord(content, state.pendingRollImage);
            state.pendingRollImage = '';
            state.attackModal = null;
            state.rollResult = { name: `⚔️ ${weaponName}`, total: attackTotal, diceVal: attackRoll.total, mod: mod + pb, label: attackRoll.label };
            if (state.activeTab !== 'DADOS') state.unreadRolls = true;
            render(true);
        }
        function sendToDiscord(label, dice, mod, total, charName) {
            const diceStr = dice.length > 1 ? `[${dice.join(', ')}]` : `[${dice[0]}]`;
            const modStr = mod !== 0 ? ` ${mod >= 0 ? '+' : ''}${mod}` : '';
            const isCrit = dice.includes(20);
            const isFumble = dice.includes(1) && dice.length === 1;
            let suffix = isCrit ? ' 🎯 **CRÍTICO!**' : isFumble ? ' 💀 **FALHA CRÍTICA!**' : '';
            const content = `🎲 **${charName}** rolou **${label}**\nDado: ${diceStr}${modStr} = **${total}**${suffix}`;
            fetch(getActiveWebhookUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).catch(() => {});
        }
        function rollDice(attrName, mod, mode) { const roll = getRollResult(mode || state.rollMode); const total = window.totalComEnfase(roll, mod, window.calcPenalidadeEnfase ? window.calcPenalidadeEnfase(state.currentChar) : 0); const entry = { time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), label: `${attrName} (${roll.label})`, dice: roll.dice.join(', '), mod: mod, total: total }; state.currentChar.history.push(entry); if (state.currentChar.history.length > 50) state.currentChar.history.shift(); saveCharacter(state.currentChar); state.rollResult = { name: attrName, total: total, diceVal: roll.total, mod: mod, label: roll.label }; if (state.activeTab !== 'DADOS') state.unreadRolls = true; sendToDiscord(`${attrName} (${roll.label})`, roll.dice, mod, total, state.currentChar.name || 'Personagem'); render(true); }
        // Entrega o valor MÁXIMO de cada dado em vez de rolar. Usado pela Condição
        // Hostil, cuja regra diz "os dados de dano são maximizados (não rolados)".
        // Mesma tolerância a vários termos do rollDiceExpr: a Condição Hostil maximiza os
        // dados, e um "2d10 + 1d6" tem de maximizar os dois termos, não devolver zero.
        function maximizarExpr(expr) {
            let rolls = [], total = 0, achou = false;
            _termosExpr(expr).forEach(function (termo) {
                const m = termo.match(/^(\d+)d(\d+)$/);
                if (m) {
                    achou = true;
                    const n = parseInt(m[1]), faces = parseInt(m[2]);
                    for (let i = 0; i < n; i++) rolls.push(faces);
                    total += n * faces;
                    return;
                }
                const fixo = parseInt(termo);
                if (!isNaN(fixo)) { achou = true; total += fixo; }
            });
            if (!achou) return { total: 0, rolls: [] };
            return { total: total, rolls: rolls };
        }

        function rollSkill(skillName, attrKey, mode, zetsuBonus) { const char = state.currentChar; const _efS = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, attrKey) : null; const mod = _efS ? _efS.mod : getMod(char.attributes[attrKey].value); const isTrained = char.skills.includes(skillName); const isExpert = (char.expertise || []).includes(skillName); const pb = getProficiencyBonus(char.level); let totalMod = mod; if (isExpert) { totalMod += (pb * 2); } else if (isTrained) { totalMod += pb; } const zb = zetsuBonus || 0; totalMod += zb; const zetsuTag = zb > 0 ? ' 👁️Zetsu' : ''; const _ini = (skillName === 'Iniciativa' && window.calcIniciativaBonus) ? window.calcIniciativaBonus(char) : { total: 0, fontes: [] }; totalMod += _ini.total; const _nb = window.calcBonusPericiaNen ? window.calcBonusPericiaNen(char, skillName) : { total: 0 }; totalMod += _nb.total; const _ib = window.calcBonusPericiaInclinacao ? window.calcBonusPericiaInclinacao(char, skillName) : { total: 0 }; totalMod += _ib.total; const roll = getRollResult(mode || state.rollMode); const total = window.totalComEnfase(roll, totalMod, window.calcPenalidadeEnfase ? window.calcPenalidadeEnfase(char) : 0); const entry = { time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), label: `${skillName} ${isExpert ? "(Exp)" : ""}${zetsuTag} (${roll.label})`, dice: roll.dice.join(', '), mod: totalMod, total: total }; state.currentChar.history.push(entry); if (state.currentChar.history.length > 50) state.currentChar.history.shift(); saveCharacter(state.currentChar); state.rollResult = { name: skillName, total: total, diceVal: roll.total, mod: totalMod, label: roll.label }; if (state.activeTab !== 'DADOS') state.unreadRolls = true; sendToDiscord(`${skillName}${isExpert ? ' (Exp)' : ''}${zetsuTag} (${roll.label})`, roll.dice, totalMod, total, char.name || 'Personagem'); render(true); }
        function closeRollModal() { state.rollResult = null; render(true); }
        function copyToClipboard(idx) { const h = state.currentChar.history[idx]; if(!h) return; const text = `**${h.label}**\nRolagem: [${h.dice}] ${h.mod>=0?'+':''}${h.mod} = **${h.total}**`; navigator.clipboard.writeText(text).then(() => { const btn = document.activeElement; if(btn && btn.tagName === 'BUTTON') { const originalHTML = btn.innerHTML; btn.innerHTML = '<i data-lucide="check" size="14"></i>'; btn.classList.add('text-green-500'); setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('text-green-500'); lucide.createIcons(); }, 1000); } }); }
        // Devolve a sanidade do 20 natural: "Resultado 20 em qualquer rolagem →
        // recupere 1d20+INT". Fica num lugar só porque o getRollResult tem saída
        // única — era por isso que ele foi reescrito assim.
        function _sanidadeNatural20(res) {
            const char = state.currentChar;
            if (!char || !res || res.total !== 20) return res;
            const v = char.vitals || {};
            if ((v.san || 0) >= (v.sanMax || 100)) return res;   // já está cheia
            const rec = window.calcRecuperacaoSanidade ? window.calcRecuperacaoSanidade(char, 'natural20') : null;
            if (!rec || rec.total <= 0) return res;
            v.san = Math.min(v.sanMax || 100, (v.san || 0) + rec.total);
            saveCharacter(char);
            setTimeout(function () {
                window._showXpToast && window._showXpToast('🎲 20 natural — +' + rec.total
                    + ' de Sanidade (1d20 [' + rec.dados.join(', ') + ']'
                    + (rec.int ? (rec.int > 0 ? ' +' : ' ') + rec.int : '') + ')');
            }, 260);
            return res;
        }
        function getRollResult(mode) {
            const d20 = function () { return Math.floor(Math.random() * 20) + 1; };
            const r1 = d20(), r2 = d20();
            if (mode === 'NORMAL') return _sanidadeNatural20({ total: r1, dice: [r1], label: 'Normal' });
            if (mode === 'VANTAGEM') return _sanidadeNatural20({ total: Math.max(r1, r2), dice: [r1, r2], label: 'Vantagem' });
            if (mode === 'DESVANTAGEM') return _sanidadeNatural20({ total: Math.min(r1, r2), dice: [r1, r2], label: 'Desvantagem' });
            if (mode === 'ÊNFASE') {
                // Distância a partir de 10 — ver ENFASE_REFERENCIA (config.js). Era
                // 10,5, e com 10,5 o empate do livro nunca acontecia.
                const REF = window.ENFASE_REFERENCIA || 10;
                const dados = [r1, r2];
                let escolhido;
                if (Math.abs(r1 - REF) === Math.abs(r2 - REF)) {
                    // "Em caso de empate um novo dado é rolado." Vale tanto para o
                    // empate de distância (5 e 15) quanto para dados iguais (7 e 7).
                    escolhido = d20();
                    dados.push(escolhido);
                } else {
                    escolhido = Math.abs(r1 - REF) > Math.abs(r2 - REF) ? r1 : r2;
                }
                const out = {
                    total: escolhido, dice: dados, label: 'Ênfase',
                    // É isto que o totalComEnfase lê para virar o bônus em penalidade.
                    enfaseInferior: escolhido < REF
                };
                const _c = state.currentChar;
                if (_c) {
                    _c.enfaseUsos = (parseInt(_c.enfaseUsos) || 0) + 1;
                    // A concessão mora aqui porque o getRollResult é o funil de TODAS
                    // as rolagens de d20 da ficha — ataque, Hatsu, atributo e perícia.
                    window._resultadoEnfase = window.resolverEnfase ? window.resolverEnfase(_c, mode, out.total) : null;
                    saveCharacter(_c);
                    // "Ao receber uma Ação Protagonista: recupere 1d4+INT." É automática
                    // porque o gatilho é mecânico e o app o enxerga no mesmo instante.
                    let _sanTxt = '';
                    if (window._resultadoEnfase === 'ganhou') {
                        const _rec = window.calcRecuperacaoSanidade ? window.calcRecuperacaoSanidade(_c, 'receber_ap') : null;
                        const _v = _c.vitals || {};
                        if (_rec && _rec.total > 0 && (_v.san || 0) < (_v.sanMax || 100)) {
                            _v.san = Math.min(_v.sanMax || 100, (_v.san || 0) + _rec.total);
                            _sanTxt = ' (+' + _rec.total + ' de Sanidade)';
                        }
                    }
                    const _msg = window._resultadoEnfase === 'ganhou'
                        ? '⭐ Falha na Ênfase — você ganhou uma Ação Protagonista!' + _sanTxt
                        : (window._resultadoEnfase === 'jaTinha'
                            ? '⚠ Falha na Ênfase, mas a Ação Protagonista anterior ainda não foi gasta.'
                            : '');
                    if (_msg) setTimeout(function () { window._showXpToast && window._showXpToast(_msg); }, 120);
                    // As consequências valem em TODA falha de Ênfase — inclusive quando
                    // a Ação Protagonista anterior ainda não foi gasta e nenhuma nova é
                    // concedida. O preço é da rolagem, não do prêmio.
                    if (out.total < (window.ENFASE_FALHA_ABAIXO_DE || 10)) {
                        setTimeout(function () { window._abrirFalhaEnfase && window._abrirFalhaEnfase(); }, 420);
                    }
                }
                return _sanidadeNatural20(out);
            }
            return _sanidadeNatural20({ total: r1, dice: [r1], label: 'Normal' });
        }
        function buyStat(attr, delta) { lockAttributeMethod(); const current = state.tempChar.attributes[attr]; const next = current + delta; if (next >= 1 && next <= 30) { const currentCost = calculateTotalCost(state.tempChar.attributes); const costDiff = getPointBuyCost(next) - getPointBuyCost(current); const MAX = 20; if (costDiff > 0 && (currentCost + costDiff > MAX)) { const totalEl = document.getElementById('buy-total'); totalEl.classList.add('text-red-500', 'shake'); setTimeout(() => totalEl.classList.remove('shake'), 500); return; } state.tempChar.attributes[attr] = next; render(true); } }
        function setAttrTab(mode) { if (state.attrMethodLocked) return; state.attrTab = mode; state.selectedPoolIdx = null; if(mode === 'COMPRA') { Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = 10); state.attrPool = []; } else { Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); state.attrPool = []; } render(true); }
        function lockAttributeMethod() { if(!state.attrMethodLocked) { state.attrMethodLocked = true; render(true); } }
        function rollAllStats() { lockAttributeMethod(); Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); let newPool = []; for(let k=0; k<6; k++) { let dice = []; for(let i=0; i<4; i++) { let d = Math.floor(Math.random()*6)+1; if(d === 1) d = Math.floor(Math.random()*6)+1; dice.push(d); } dice.sort((a,b) => b-a); newPool.push(dice[0] + dice[1] + dice[2]); } state.attrPool = newPool.sort((a,b) => b-a); render(true); }
        function applyStandardArray() { lockAttributeMethod(); Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); state.attrPool = [15, 14, 13, 12, 10, 8]; render(true); }
        function selectPoolItem(idx) { if (state.selectedPoolIdx === idx) state.selectedPoolIdx = null; else state.selectedPoolIdx = idx; render(true); }
        function assignToSlot(attr) { if (state.selectedPoolIdx === null) return; if (state.tempChar.attributes[attr] !== null) state.attrPool.push(state.tempChar.attributes[attr]); const val = state.attrPool[state.selectedPoolIdx]; state.tempChar.attributes[attr] = val; state.attrPool.splice(state.selectedPoolIdx, 1); state.attrPool.sort((a,b) => b-a); state.selectedPoolIdx = null; render(true); }
        function returnToPool(attr) { const val = state.tempChar.attributes[attr]; if (val !== null) { state.attrPool.push(val); state.attrPool.sort((a,b) => b-a); state.tempChar.attributes[attr] = null; render(true); } }
        function applyBackgroundProficiencies() { if (!state.tempChar.background) return; const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background); if (!bgData) return; const profText = bgData.proficiencias; SYSTEM_DB.skills.forEach(skill => { if (profText.includes(skill) && !state.tempChar.skills.includes(skill)) { state.tempChar.skills.push(skill); } }); if (profText.includes("Kit") || profText.includes("Ferramenta")) { if (!state.tempChar.otherSkills.includes("Kits")) { state.tempChar.otherSkills.push("Kits"); } } }
        function nextCreatorStep() { if (state.creatorStep === 0 && !state.tempChar.name) { alert("Dê um nome ao personagem!"); return; } if (state.creatorStep === 1 && state.tempChar.race === 'Humano Comum' && !state.tempChar.effortTrait) { alert("Escolha uma característica de 'Esforço no lugar de talento'!"); return; } if (state.creatorStep === 1) { const rd1 = SYSTEM_DB.racas.find(r => r.nome === state.tempChar.race); if (rd1 && (rd1.opcoes_caracteristica||[]).length > 0 && !state.tempChar.raceFeatureChoice) { alert("Escolha uma característica racial!"); return; } } if (state.creatorStep === 2) { if (state.attrTab === 'COMPRA') { const cost = calculateTotalCost(state.tempChar.attributes); if (cost > 20) { alert("Você excedeu o limite de pontos de compra (20)!"); return; } } else { const values = Object.values(state.tempChar.attributes); if (values.some(v => v === null)) { alert("Aloque todos os valores do pool para os atributos!"); return; } } } if (state.creatorStep === 3 && state.tempChar.race !== 'Formiga Quimera') { if (!state.tempChar.background) { alert("Selecione um Antecedente!"); return; } if (!state.tempChar.backgroundFeature) { alert("Escolha uma característica do Antecedente!"); return; } } if (state.creatorStep === 4) { const posCost = state.tempChar.inclinations.positive.reduce((acc, i) => acc + i.custo, 0); const negVal = state.tempChar.inclinations.negative.reduce((acc, i) => acc + i.valor, 0); const freeCost = calcGeneralIncFreeCost(state.tempChar.inclinations.positive); const paidCost = Math.max(0, posCost - freeCost); const balance = negVal - paidCost; if (balance < 0) { alert("Suas inclinações não estão balanceadas! Adicione negativas ou remova positivas extras."); return; } if (negVal > 10) { alert("O máximo de compensação negativa é 10 pontos."); return; } applyBackgroundProficiencies(); } if (state.creatorStep === 5) { const bgSkillsText = state.tempChar.background ? SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background).proficiencias : ""; const currentManualCount = state.tempChar.skills.filter(s => !bgSkillsText.includes(s)).length; if (currentManualCount !== 5) { alert(`Você deve selecionar exatamente 5 perícias manuais (além das concedidas pelo antecedente). Atualmente: ${currentManualCount}`); return; } }
            // rev. Manual (Formiga Quimera "inicia sem Antecedentes") — pula o step 3 (Antecedente) nos dois sentidos.
            if (state.tempChar.race === 'Formiga Quimera' && state.creatorStep === 2) { state.creatorStep = 4; render(); return; }
            state.creatorStep++; render(); }
        function prevCreatorStep() {
            if (state.tempChar.race === 'Formiga Quimera' && state.creatorStep === 4) { state.creatorStep = 2; render(); return; }
            state.creatorStep--; render();
        }
        function finishCreator() { Object.entries(state.allocations).forEach(([key, val]) => { state.tempChar.attributes[key] += val; }); const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background);
            // Resolve equipamento do antecedente: itens fixos passam pelo alias de nome (corrige
            // mismatches com o ITEM_DB); slots ambíguos ("A ou B", "Qualquer arma...") usam a escolha
            // feita no popup (state.tempChar.equipChoices), com um fallback sensato se não foi aberto.
            const equipChoicesFinal = state.tempChar.equipChoices || {};
            const initialInv = bgData ? bgData.equipamento.flatMap((str, idx) => {
                const info = classifyEquipSlot(str);
                if (info.type === 'choice') return [{ name: resolveEquipName(equipChoicesFinal[idx] || info.options[0]), qty: 1 }];
                if (info.type === 'kit-any') return [{ name: equipChoicesFinal[idx] || [...ITEM_DB.kits, ...ITEM_DB.itens_medicos][0].nome, qty: 1 }];
                if (info.type === 'weapon-category') {
                    const items = [{ name: equipChoicesFinal[idx] || getWeaponPool(info.category)[0].nome, qty: 1 }];
                    if (info.extra) items.push({ name: resolveEquipName(info.extra), qty: 1 });
                    return items;
                }
                return [{ name: resolveEquipName(str), qty: 1 }];
            }) : [];
            const raceData = SYSTEM_DB.racas.find(r => r.nome === state.tempChar.race); const finalAttrs = { ...state.tempChar.attributes }; if (raceData && typeof raceData.aumento_atributo === 'object') { const req = getBonusRequirements(state.tempChar.race); if (!req) { Object.entries(raceData.aumento_atributo).forEach(([key, val]) => { if (finalAttrs[key] !== undefined) { finalAttrs[key] += val; } }); } }
            // rev. Manual (regra de tamanho de Formiga Quimera) — Miúdo/Pequeno alteram atributos finais.
            const fqTamanho = state.tempChar.race === 'Formiga Quimera' ? (state.tempChar.fqTamanho || 'Médio') : null;
            if (fqTamanho === 'Miúdo') { finalAttrs.DES += 2; finalAttrs.FOR -= 1; finalAttrs.CON -= 1; }
            else if (fqTamanho === 'Pequeno') { finalAttrs.DES += 1; finalAttrs[state.tempChar.fqPequenoPenalidade || 'FOR'] -= 1; }
            const modCon = getMod(finalAttrs.CON || 10); const modInt = getMod(finalAttrs.INT || 10); const modSab = getMod(finalAttrs.SAB || 10); const hasGiantBody = state.tempChar.inclinations.positive.some(i => i.nome === "Corpo de Gigante"); let hpInitial = 15 + modCon; if (hasGiantBody) hpInitial += 5; 
            // Merge traits with details
            const mergedTraits = (state.tempChar.raceTraits || []).map(t => { const detail = state.tempChar.traitDetails && state.tempChar.traitDetails[t]; return detail ? `${t}: ${detail}` : t; });
            // rev. Manual — deslocamento especial de Formiga Quimera: referência pronta manda (inclusive
            // quando ela é "terrestre" mas mais rápida/lenta que o padrão, ex. Coelho 10,5m, Tatu 7,5m);
            // sem referência, aplica a regra por categoria (Ave→voo, Aquático→aquático, Inseto→escolha).
            let fqDeslocTipo = null, fqDeslocValor = null, deslTerrestre = 9;
            if (state.tempChar.race === 'Formiga Quimera') {
                const presetsList = (SYSTEM_DB.fqPresets && SYSTEM_DB.fqPresets[state.tempChar.fagogenese]) || [];
                const preset = state.tempChar.fqPreset ? presetsList.find(p => p.nome === state.tempChar.fqPreset) : null;
                if (preset) {
                    if (preset.deslocamentoTipo === 'terrestre') { deslTerrestre = preset.deslocamentoValor; }
                    else { fqDeslocTipo = preset.deslocamentoTipo; fqDeslocValor = preset.deslocamentoValor; }
                } else if (state.tempChar.fagogenese === 'Ave') { fqDeslocTipo = 'voo'; fqDeslocValor = 9; }
                else if (state.tempChar.fagogenese === 'Aquático') { fqDeslocTipo = 'aquatico'; fqDeslocValor = 9; }
                else if (state.tempChar.fagogenese === 'Inseto/Insectóide') { fqDeslocTipo = state.tempChar.fqInsetoDeslocamento || 'voo'; fqDeslocValor = 9; }
            }
            const newChar = { id: generateId(), name: state.tempChar.name, class: state.tempChar.class, race: state.tempChar.race, background: state.tempChar.background, backgroundFeature: state.tempChar.backgroundFeature, inclinations: state.tempChar.inclinations, level: 0, xp: 0, xp_next: 50, money: 0, alignment: 'Neutro', playerName: '', attributes: {}, skills: [...state.tempChar.skills, ...state.tempChar.otherSkills], expertise: [], raceTraits: mergedTraits, effortRace: state.tempChar.race === 'Humano Comum' ? (state.tempChar.effortRace || null) : null, effortTrait: state.tempChar.race === 'Humano Comum' ? (state.tempChar.effortTrait || null) : null, raceFeatureChoice: state.tempChar.raceFeatureChoice || null, fqTamanho: fqTamanho, fqPreset: state.tempChar.race === 'Formiga Quimera' ? (state.tempChar.fqPreset || null) : null, deslocamentoTipo: fqDeslocTipo, deslocamentoValor: fqDeslocValor, vitals: { hp: hpInitial, hpMax: hpInitial, aura: 100, auraMax: 100, san: 100, sanMax: 100, rdm: 0, ca: 10 + modCon, rea: 7 + modSab, desl: deslTerrestre }, inventory: initialInv, history: [], imageUrl: null, bio: { personality: '', history: '', organizations: '', enemies: '', allies: '' }, fagogenese: state.tempChar.fagogenese || null, afinidade: state.tempChar.afinidade || null, genialidade: state.tempChar.genialidade || null, genialidadeRoll: state.tempChar.genialidadeRoll || null }; Object.entries(finalAttrs).forEach(([k,v]) => { const hasSave = state.tempChar.skills.includes(`TR de ${k}`); newChar.attributes[k] = { value: v || 10, save: hasSave }; }); saveCharacter(newChar); state.currentChar = newChar; state.view = 'SHEET'; state.activeTab = 'FICHA'; render(); }
        function setTab(tab) { state.activeTab = tab; if(tab === 'DADOS') state.unreadRolls = false; render(true); }
        function setRollMode(mode) { state.rollMode = mode; render(true); }
        function updateSheetAttr(key, delta) {
            const char = state.currentChar;
            // ── Pontos de atributo pendentes ────────────────────────────────────────────
            // O campo pendingAttrPoints NÃO é criado na ficha nova: ele só passa a existir
            // quando o personagem sobe de nível e ganha pontos. Antes, o controle inteiro
            // ficava dentro de "if (pending !== undefined && pending !== null)" — ou seja,
            // numa ficha onde o campo ainda não existia, a verificação era PULADA e o
            // atributo subia sem limite nenhum, a cada clique.
            //
            // Agora um campo ausente vale ZERO ponto pendente, que é o correto: quem não
            // ganhou ponto não tem ponto para gastar.
            const pending = (char.pendingAttrPoints === undefined || char.pendingAttrPoints === null)
                ? 0
                : char.pendingAttrPoints;
            // ── Quanto já foi ALOCADO em cada atributo depois da criação ────────────────
            // A devolução era incondicional: baixar qualquer atributo gerava 1 ponto. Dava
            // para rebaixar um atributo que nunca foi aumentado — inclusive abaixo do valor
            // de criação — e FABRICAR pontos, que depois iam para CON antes de rolar o PV.
            // Agora só se devolve o que foi alocado aqui, atributo por atributo.
            if (!char.attrAlocados) char.attrAlocados = {};
            const alocado = parseInt(char.attrAlocados[key]) || 0;

            if (delta > 0) {
                if (pending <= 0 && !state.isAdmin) {
                    window._showXpToast('⚠️ Sem pontos de atributo para distribuir!');
                    return;
                }
                // Admin pode corrigir fichas e montar NPC sem gastar pontos.
                if (!state.isAdmin || pending > 0) char.pendingAttrPoints = Math.max(0, pending - 1);
                char.attrAlocados[key] = alocado + 1;
            } else if (delta < 0) {
                if (alocado <= 0 && !state.isAdmin) {
                    window._showXpToast('⚠️ Nada a devolver: este atributo não foi aumentado por pontos.');
                    return;
                }
                if (alocado > 0) {
                    char.pendingAttrPoints = pending + 1;
                    char.attrAlocados[key] = alocado - 1;
                }
            }
            char.attributes[key].value += delta;
            saveCharacter(char);
            render(true);
        }
        function toggleAttrPopup(key) { if (state.openAttrPopup === key) state.openAttrPopup = null; else state.openAttrPopup = key; render(true); }
        function handleAttributeClick(key) { if (state.clickTimer) { clearTimeout(state.clickTimer); state.clickTimer = null; const _efA = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(state.currentChar, key) : null; const attr = _efA ? { value: _efA.valor } : state.currentChar.attributes[key]; openRollModeModal('dice', key, getMod(attr.value)); } else { state.clickTimer = setTimeout(() => { state.clickTimer = null; toggleAttrPopup(key); }, 250); } }
        function handleShieldClick(key) { if (state.clickTimer) { clearTimeout(state.clickTimer); state.clickTimer = null; const skillName = `TR de ${key}`; openRollModeModal('skill', skillName, key); } else { state.clickTimer = setTimeout(() => { state.clickTimer = null; handleSkillStatus(`TR de ${key}`); }, 250); } }
        function handleSkillStatus(skillName) { const char = state.currentChar; const isTrained = char.skills.includes(skillName); if (!isTrained) { if (confirm(`Deseja adicionar proficiência em ${skillName}?`)) { state.currentChar.skills.push(skillName); saveCharacter(state.currentChar); render(true); } } else { state.skillSelectionModal = skillName; render(true); } }
        function closeSkillModal() { state.skillSelectionModal = null; render(true); }
        function setSkillLevel(skillName, level) { const char = state.currentChar; if (!char.expertise) char.expertise = []; if (level === 'remove') { char.skills = char.skills.filter(s => s !== skillName); char.expertise = char.expertise.filter(s => s !== skillName); } else if (level === 'trained') { if (!char.skills.includes(skillName)) char.skills.push(skillName); char.expertise = char.expertise.filter(s => s !== skillName); } else if (level === 'expert') { if (!char.skills.includes(skillName)) char.skills.push(skillName); if (!char.expertise.includes(skillName)) char.expertise.push(skillName); } saveCharacter(char); closeSkillModal(); }
        function calcRDM(char) {
            const intVal = char.attributes && char.attributes.INT ? char.attributes.INT.value : 10;
            const intMod = Math.floor((intVal - 10) / 2);
            const lvl = parseInt(char.level) || 0;
            if (lvl === 0) return 0;
            return (intMod * 2) + lvl;
        }

        function updateVital(type, delta) {
            const v = state.currentChar.vitals;
            const char = state.currentChar;

            if (type === 'pv') v.hp = Math.min(v.hpMax || v.hp, v.hp + delta);
            if (type === 'aura') v.aura = Math.min(v.auraMax || 100, Math.max(0, v.aura + delta));
            if (type === 'rea') { const rMax = 7 + getMod(char.attributes.SAB.value) + (((char.combatInclinations || {}).analitica || 0) >= 1 ? 2 : 0); if (v.rea === undefined) v.rea = rMax; v.rea = Math.min(rMax, Math.max(0, v.rea + delta)); }
            if (type === 'san') {
                if (!v.sanMax) v.sanMax = 100;
                const prevSan = v.san;
                const prevPct = Math.round((prevSan / v.sanMax) * 100);
                // O piso 0 faltava: aura tinha Math.max(0,…) e sanidade não, então uma
                // perda grande deixava a barra em número negativo.
                v.san = Math.max(0, Math.min(v.sanMax, v.san + delta));
                const newPct = Math.round((v.san / v.sanMax) * 100);

                // Check if we crossed a threshold going DOWN
                if (delta < 0) {
                    const thresholds = [90, 75, 50, 25];
                    for (const t of thresholds) {
                        if (prevPct >= t && newPct < t) {
                            saveCharacter(char);
                            window._showSanityModal(char, t, newPct);
                            return;
                        }
                    }
                }
            }
            saveCharacter(char);
            render(true);
        }
        function updateCharProperty(prop, val) { state.currentChar[prop] = val; saveCharacter(state.currentChar); render(true); }
        // ── Dado de vida por categoria ─────────────────────────────────────────
        const HIT_DICE = {
            'INTENSIFICAÇÃO': { dado: 'd12', faces: 12, media: 7 },
            'REFORÇO':         { dado: 'd12', faces: 12, media: 7 },
            'TRANSMUTAÇÃO':    { dado: 'd10', faces: 10, media: 6 },
            'EMISSÃO':         { dado: 'd10', faces: 10, media: 6 },
            'MATERIALIZAÇÃO':  { dado: 'd8',  faces: 8,  media: 5 },
            'MANIPULAÇÃO':     { dado: 'd8',  faces: 8,  media: 5 },
            'ESPECIALIZAÇÃO':  { dado: 'd6',  faces: 6,  media: 4 },
        };

        // ── Abre modal de ganho de XP ──────────────────────────────────────────
        window.openXpModal = function() {
            const char = state.currentChar;
            const overlay = document.createElement('div');
            overlay.id = 'xp-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const nextXp = char.xp_next || 50;
            const curXp  = char.xp || 0;
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:16px;padding:24px;width:100%;max-width:360px;box-shadow:0 0 40px ${tc}33">
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">✨ Adicionar XP</div>
                    <div style="font-size:10px;color:#6b7280;margin-bottom:16px">XP atual: <b style="color:#d1d5db">${curXp}</b> / <b style="color:${tc}">${nextXp}</b> para o próximo nível</div>
                    <!-- barra atual -->
                    <div style="background:#1f2937;border-radius:99px;height:8px;overflow:hidden;margin-bottom:16px">
                        <div style="height:100%;width:${Math.min(100,(curXp/nextXp)*100)}%;background:${tc};box-shadow:0 0 10px ${tc};border-radius:99px;transition:width .4s"></div>
                    </div>
                    <label style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;display:block;margin-bottom:6px">Quantidade de XP ganho</label>
                    <input id="xp-gain-input" type="number" min="1" placeholder="Ex: 150" autofocus
                        style="width:100%;box-sizing:border-box;background:#0a0a0f;border:2px solid #374151;border-radius:8px;padding:12px;color:#fff;font-size:18px;font-family:Orbitron,sans-serif;font-weight:900;text-align:center;outline:none;margin-bottom:16px"
                        oninput="this.style.borderColor='${tc}'"
                        onkeydown="if(event.key==='Enter')window.confirmXpGain();if(event.key==='Escape')document.getElementById('xp-modal-overlay').remove();">
                    <div style="display:flex;gap:10px">
                        <button onclick="document.getElementById('xp-modal-overlay').remove()"
                            style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">
                            Cancelar
                        </button>
                        <button onclick="window.confirmXpGain()"
                            style="flex:2;padding:12px;border-radius:10px;background:${tc};color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;border:none;box-shadow:0 0 16px ${tc}55">
                            ✨ Confirmar XP
                        </button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            setTimeout(() => { const inp = document.getElementById('xp-gain-input'); if(inp) inp.focus(); }, 50);
        };

        window.confirmXpGain = function() {
            const inp = document.getElementById('xp-gain-input');
            const gained = parseInt(inp ? inp.value : 0) || 0;
            if (gained <= 0) { if(inp) inp.style.borderColor='#ef4444'; return; }
            document.getElementById('xp-modal-overlay')?.remove();
            const char = state.currentChar;

            const genTier = char.genialidade;
            const xpMultiplier = genTier === 'Ultimate' ? 2 : (genTier === 'Gênio' ? 1.5 : 1);
            const finalGained = xpMultiplier > 1 ? Math.floor(gained * xpMultiplier) : gained;

            let xp = (char.xp || 0) + finalGained;
            const xpTable = SYSTEM_DB.xpTable;
            let curLevel = char.level;
            let nextXp = char.xp_next || xpTable[0];
            const levelsToProcess = [];

            while (xp >= nextXp && curLevel < 12) {
                xp -= nextXp;
                curLevel++;
                levelsToProcess.push(curLevel);
                nextXp = xpTable[Math.min(curLevel, xpTable.length - 1)] || 9999;
            }

            char.xp = xp;
            char.xp_next = nextXp;
            saveCharacter(char);
            render(true);

            // Níveis já celebrados não disparam o modal de novo. Sem isso, o admin que
            // baixa o nível para corrigir uma ficha e depois sobe de novo recebia todas as
            // recompensas outra vez — pontos de atributo, P.N, aura e PV em dobro.
            const jaCelebrado = parseInt(char.nivelMaxCelebrado) || 0;
            const novos = levelsToProcess.filter(function (lv) { return lv > jaCelebrado; });
            const repetidos = levelsToProcess.length - novos.length;
            if (repetidos > 0) {
                window._showXpToast('↩️ ' + repetidos + ' nível(is) já celebrado(s) — recompensas não repetidas.');
            }
            if (novos.length > 0) {
                char.nivelMaxCelebrado = Math.max(jaCelebrado, novos[novos.length - 1]);
                saveCharacter(char);
                window._processLevelQueue(novos, 0, xpMultiplier > 1, finalGained);
            } else if (levelsToProcess.length > 0) {
                // Subiu de nível, mas todos já tinham sido celebrados: aplica só o nível.
                char.level = levelsToProcess[levelsToProcess.length - 1];
                saveCharacter(char);
                render(true);
            } else {
                if (xpMultiplier > 1) window._showXpToast(`+${finalGained} XP ${xpMultiplier === 2 ? '👑 (×2 Ultimate)' : '✨ (×1.5 Gênio)'}`);
                else window._showXpToast(`+${finalGained} XP`);
            }
        };

        window._showXpToast = function(msg) {
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0d1117;border:1px solid #374151;color:#d1d5db;padding:10px 20px;border-radius:99px;font-family:Orbitron,sans-serif;font-size:10px;font-weight:900;z-index:9999;pointer-events:none;opacity:1;transition:opacity .5s';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 2000);
        };

        // ── Tabela de recompensas por nível ──────────────────────────────────
        const LEVEL_REWARDS = {
            1:  { titulo: 'Batismo & Despertar',          attr: 1, auraP: 5,  pn: 6, pi: 0, prof: 0, extras: ['Criação de Hatsu(s) e Domínio de Nen'] },
            2:  { titulo: 'Inclinações & Proficiências',  attr: 0, auraP: 0,  pn: 2, pi: 2, prof: 0, extras: ['Inclinações de Combate/Gerais', 'Proficiência em Armas e Equipamentos'] },
            3:  { titulo: 'Eficiência de Aura 1',         attr: 2, auraP: 10, pn: 2, pi: 0, prof: 0, extras: ['Eficiência de Aura 1'] },
            4:  { titulo: 'Foco de Caça & Renome',        attr: 0, auraP: 0,  pn: 2, pi: 3, prof: 0, extras: ['Foco de Caça', 'Renome', 'Inclinações de Combate/Gerais'] },
            5:  { titulo: '+1 Proficiência',               attr: 0, auraP: 0,  pn: 2, pi: 0, prof: 1, extras: ['+1 Ponto de Proficiência'] },
            6:  { titulo: 'Evolução de Atributos',         attr: 2, auraP: 10, pn: 3, pi: 0, prof: 0, extras: ['Aumento de Atributo ou Aura'] },
            7:  { titulo: 'Inclinações de Combate',        attr: 0, auraP: 0,  pn: 3, pi: 2, prof: 0, extras: ['Inclinações de Combate ou Gerais'] },
            8:  { titulo: 'Eficiência de Aura 2',          attr: 0, auraP: 0,  pn: 3, pi: 0, prof: 0, extras: ['Eficiência de Aura 2'] },
            9:  { titulo: 'Redistribuição de Atributos',   attr: 0, auraP: 0,  pn: 3, pi: 0, prof: 0, extras: ['Redistribuição de Atributos'] },
            10: { titulo: 'Nen Post-Mortem',               attr: 0, auraP: 0,  pn: 3, pi: 0, prof: 0, extras: ['Nen Post-Mortem (Pós-Morte)', 'Eficiência de Aura 3'] },
            11: { titulo: 'Inclinações de Combate',        attr: 0, auraP: 0,  pn: 3, pi: 3, prof: 0, extras: ['Inclinação de Combate ou Gerais'] },
            12: { titulo: 'Evolução Final',                attr: 3, auraP: 15, pn: 3, pi: 0, prof: 0, extras: ['Evolução Final'] },
        };

        window._processLevelQueue = function(queue, idx, isGenius, xpGained) {
            if (idx >= queue.length) { render(true); return; }
            window.openLevelUpModal(queue[idx], queue.length, idx + 1, isGenius, xpGained, function() {
                window._processLevelQueue(queue, idx + 1, isGenius, xpGained);
            });
        };

        window._showContinueLevelBtn = function(nextLevel, tc, onContinue) {
            document.getElementById('lv-continue-float')?.remove();
            const btn = document.createElement('div');
            btn.id = 'lv-continue-float';
            btn.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);z-index:9998;white-space:nowrap';
            btn.innerHTML = `<button onclick="document.getElementById('lv-continue-float')?.remove();window._lvContinueNow()" style="background:#7c3aed;border:2px solid #a78bfa;border-radius:99px;padding:12px 28px;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;box-shadow:0 0 30px #7c3aed88">✨ Continuar → Nível ${nextLevel}</button>`;
            document.body.appendChild(btn);
            window._lvContinueNow = onContinue;
        };

        // ── Modal de Level Up individual (um nível por vez) ──────────────────
        window.openLevelUpModal = function(targetLevel, totalLevels, levelNum, isGenius, xpGained, onDone) {
            const char = state.currentChar;
            const rewards = LEVEL_REWARDS[targetLevel] || { titulo: 'Subida de Nível', pn: 0, pi: 0, attr: 0, auraP: 0, prof: 0, extras: [] };
            // CON lido na hora do modal — se jogador alocou CON em nível anterior, já vale aqui
            const hitDiceData = HIT_DICE[char.class] || { dado: 'd8', faces: 8, media: 5 };
            const conMod = getMod(char.attributes?.CON?.value || 10);
            const hasGiantBody = (char.inclinations?.positive || []).some(i => i.nome === 'Corpo de Gigante');
            const giantBonus = hasGiantBody ? 3 : 0;
            const mediaTotal = Math.max(1, hitDiceData.media + 1 + giantBonus);
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const hasMore = levelNum < totalLevels;
            const isAttrChoice = rewards.attr > 0 && rewards.auraP > 0;

            // ── Build recompensas HTML ──
            let rewardsRows = '';
            (rewards.extras || []).forEach(e => {
                rewardsRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:5px;height:5px;border-radius:50%;background:${tc};flex-shrink:0"></div><span style="font-size:11px;color:#d1d5db;font-weight:600">${e}</span></div>`;
            });
            if (rewards.attr)  rewardsRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:5px;height:5px;border-radius:50%;background:#f59e0b;flex-shrink:0"></div><span style="font-size:11px;color:#fbbf24;font-weight:700">+${rewards.attr} ponto(s) de Atributo <span style="color:#6b7280">ou</span> +${rewards.auraP}% de Aura máxima</span></div>`;
            if (rewards.pi)    rewardsRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:5px;height:5px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div><span style="font-size:11px;color:#60a5fa;font-weight:700">+${rewards.pi} ponto(s) de Inclinação de Combate</span></div>`;
            if (rewards.pn)    rewardsRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:5px;height:5px;border-radius:50%;background:#8b5cf6;flex-shrink:0"></div><span style="font-size:11px;color:#a78bfa;font-weight:700">+${rewards.pn} Ponto(s) de Nen (P.N)</span></div>`;
            if (rewards.prof)  rewardsRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:5px;height:5px;border-radius:50%;background:#10b981;flex-shrink:0"></div><span style="font-size:11px;color:#34d399;font-weight:700">+1 Ponto de Proficiência</span></div>`;

            const attrWarning = rewards.attr && hasMore && !isAttrChoice
                ? `<div style="background:#92400e22;border:1px solid #f59e0b44;border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:9px;color:#fbbf24;font-weight:700;text-align:left">⚠️ Se for alocar ponto em CON, faça isso ANTES de confirmar o próximo nível para que o dado de vida já use o novo valor.</div>`
                : '';

            const rdmVal = calcRDM(char);

            const overlay = document.createElement('div');
            overlay.id = 'levelup-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif;overflow-y:auto';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:20px;width:100%;max-width:370px;box-shadow:0 0 60px ${tc}44;text-align:center;margin:auto">
                    ${totalLevels > 1 ? `<div style="font-size:9px;color:#6b7280;font-family:Orbitron,sans-serif;letter-spacing:2px;margin-bottom:6px">${levelNum} / ${totalLevels}</div>` : ''}
                    <div style="font-size:24px;margin-bottom:2px">🏆</div>
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:15px;color:${tc};text-transform:uppercase;letter-spacing:3px;text-shadow:0 0 12px ${tc}88">Nível ${targetLevel}!</div>
                    <div style="font-size:11px;color:#9ca3af;margin-top:3px;margin-bottom:12px;font-weight:600">${rewards.titulo}</div>
                    ${isGenius && levelNum === 1 ? `<div style="font-size:9px;color:#fbbf24;background:#fbbf2411;border:1px solid #fbbf2433;border-radius:8px;padding:5px 10px;margin-bottom:10px">✨ Gênio: +${xpGained} XP</div>` : ''}

                    <!-- Recompensas -->
                    <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:12px;text-align:left">
                        <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">🎁 Ganhos deste nível</div>
                        ${rewardsRows || '<span style="font-size:10px;color:#4b5563">Nenhum ganho especial</span>'}
                    </div>

                    ${attrWarning}

                    <!-- Dado de vida -->
                    <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:12px">
                        <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">🎲 Vida — ${hitDiceData.dado}${giantBonus ? ' + ' + giantBonus + ' Gig.' : ''}</div>
                        <div id="lv-dice-result" style="font-family:Orbitron,sans-serif;font-size:38px;font-weight:900;color:#fff;margin-bottom:3px;min-height:48px;line-height:1">—</div>
                        <div id="lv-dice-breakdown" style="font-size:9px;color:#6b7280;min-height:14px"></div>
                        <div style="display:flex;gap:8px;margin-top:10px">
                            <button id="lv-roll-btn" onclick="window._lvRoll()"
                                style="flex:1;padding:10px;border-radius:10px;background:#7c3aed;border:none;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                                🎲 Rolar ${hitDiceData.dado}
                            </button>
                            <button id="lv-media-btn" onclick="window._lvPickMedia()"
                                style="flex:1;padding:10px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#d1d5db;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                                📊 Média (${mediaTotal})
                            </button>
                        </div>
                    </div>

                    ${rdmVal > 0 ? `<div style="background:#0a0f1a;border:1px solid #1f293788;border-radius:10px;padding:9px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
                        <span style="font-size:9px;color:#9ca3af;font-weight:700">🔮 Recuperação de Sanidade</span>
                        <span style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#c084fc">+${rdmVal}</span>
                    </div>` : ''}

                    ${isAttrChoice ? `<div id="lv-choice-section" style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:12px"><div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⚡ Escolha sua Evolução</div><div style="display:flex;gap:8px"><button id="lv-choice-attr" onclick="window._lvPickChoice('attr')" style="flex:1;padding:10px;border-radius:10px;border:1.5px solid #374151;background:#1f2937;color:#d1d5db;cursor:pointer"><div style="font-size:18px;margin-bottom:4px">💪</div><div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:11px">+${rewards.attr} Atrib.</div><div style="font-size:9px;color:#9ca3af;margin-top:2px">pontos para distribuir</div>${hasMore ? '<div style="font-size:8px;color:#fbbf2488;margin-top:3px">⚠️ CON afeta próx. PV</div>' : ''}</button><button id="lv-choice-aura" onclick="window._lvPickChoice('aura')" style="flex:1;padding:10px;border-radius:10px;border:1.5px solid #374151;background:#1f2937;color:#d1d5db;cursor:pointer"><div style="font-size:18px;margin-bottom:4px">✨</div><div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:11px">+${rewards.auraP}% Aura</div><div style="font-size:9px;color:#9ca3af;margin-top:2px">aura máxima permanente</div></button></div></div>` : ''}
                    <button id="lv-confirm-btn" disabled onclick="window._lvConfirm()"
                        style="width:100%;padding:12px;border-radius:10px;background:#374151;border:none;color:#6b7280;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:not-allowed;letter-spacing:1px">
                        ${hasMore ? `Confirmar Nível ${targetLevel} →` : `Confirmar Nível ${targetLevel}`}
                    </button>
                </div>`;
            document.body.appendChild(overlay);

            overlay._hitGain = null;
            overlay._faces = hitDiceData.faces;
            overlay._attrChoice = null;

            window._lvRoll = function() {
                const roll = Math.floor(Math.random() * overlay._faces) + 1;
                const total = Math.max(1, roll + conMod + giantBonus);
                overlay._hitGain = total;
                document.getElementById('lv-dice-result').textContent = total;
                document.getElementById('lv-dice-result').style.color = tc;
                document.getElementById('lv-dice-result').style.textShadow = `0 0 20px ${tc}`;
                let bd = `[${roll}] + ${conMod >= 0?'+':''}${conMod} CON`;
                if (giantBonus) bd += ` + ${giantBonus} Gigante`;
                document.getElementById('lv-dice-breakdown').textContent = bd;
                window._lvEnableConfirm();
            };
            window._lvPickMedia = function() {
                overlay._hitGain = mediaTotal;
                document.getElementById('lv-dice-result').textContent = mediaTotal;
                document.getElementById('lv-dice-result').style.color = '#60a5fa';
                document.getElementById('lv-dice-result').style.textShadow = '0 0 10px #60a5fa88';
                let bd = `${hitDiceData.media} (média) + 1`;
                if (giantBonus) bd += ` + ${giantBonus} Gigante`;
                document.getElementById('lv-dice-breakdown').textContent = bd;
                window._lvEnableConfirm();
            };
            window._lvEnableConfirm = function() {
                if (isAttrChoice && !overlay._attrChoice) return;
                const btn = document.getElementById('lv-confirm-btn');
                btn.disabled = false;
                btn.style.background = tc;
                btn.style.color = '#000';
                btn.style.cursor = 'pointer';
                btn.style.boxShadow = `0 0 20px ${tc}55`;
                const rollBtn = document.getElementById('lv-roll-btn');
                const mediaBtn = document.getElementById('lv-media-btn');
                if (rollBtn)  { rollBtn.disabled  = true; rollBtn.style.opacity  = '0.35'; rollBtn.style.cursor  = 'not-allowed'; }
                if (mediaBtn) { mediaBtn.disabled = true; mediaBtn.style.opacity = '0.35'; mediaBtn.style.cursor = 'not-allowed'; }
            };
            window._lvPickChoice = function(choice) {
                overlay._attrChoice = choice;
                const attrBtn = document.getElementById('lv-choice-attr');
                const auraBtn = document.getElementById('lv-choice-aura');
                if (attrBtn) {
                    attrBtn.style.borderColor = choice === 'attr' ? tc : '#374151';
                    attrBtn.style.background  = choice === 'attr' ? tc + '22' : '#1f2937';
                    attrBtn.style.color       = choice === 'attr' ? '#fff' : '#d1d5db';
                }
                if (auraBtn) {
                    auraBtn.style.borderColor = choice === 'aura' ? tc : '#374151';
                    auraBtn.style.background  = choice === 'aura' ? tc + '22' : '#1f2937';
                    auraBtn.style.color       = choice === 'aura' ? '#fff' : '#d1d5db';
                }
                if (overlay._hitGain !== null) window._lvEnableConfirm();
            };
            window._lvConfirm = function() {
                const gain = overlay._hitGain || mediaTotal;
                // Aplica exatamente este nível (um por vez)
                const _previousLevel = char.level;
                char.level = targetLevel;
                // Registra o nível celebrado, para não repetir as recompensas se o nível
                // for reduzido pelo admin e subido de novo.
                char.nivelMaxCelebrado = Math.max(parseInt(char.nivelMaxCelebrado) || 0, targetLevel);
                if (window._checkJuramentoImutavelLevelUp) window._checkJuramentoImutavelLevelUp(char, _previousLevel);
                if (isAttrChoice) {
                    if (overlay._attrChoice === 'aura') {
                        // Sobe o máximo E a aura atual, igual ao que já é feito com o PV logo
                        // abaixo. Antes só o máximo subia, então o jogador tinha de lembrar de
                        // clicar em + para ver a aura cheia de verdade.
                        char.vitals.auraMax = (char.vitals.auraMax || 100) + rewards.auraP;
                        char.vitals.aura = (char.vitals.aura || 0) + rewards.auraP;
                    } else {
                        char.pendingAttrPoints = (char.pendingAttrPoints || 0) + rewards.attr;
                    }
                } else if (rewards.attr) {
                    char.pendingAttrPoints = (char.pendingAttrPoints || 0) + rewards.attr;
                }
                char.vitals.hpMax = (char.vitals.hpMax || 0) + gain;
                char.vitals.hp   = (char.vitals.hp   || 0) + gain;
                if (!char.vitals.sanMax) char.vitals.sanMax = 100;
                const newRdm = calcRDM(char);
                char.vitals.san = Math.min(char.vitals.sanMax, (char.vitals.san || 100) + newRdm);
                saveCharacter(char);
                document.getElementById('levelup-modal-overlay')?.remove();
                render(true);

                let toast = `Nível ${targetLevel}! +${gain} PV`;
                if (newRdm > 0) toast += ` | +${newRdm} SAN`;
                if (rewards.pn) toast += ` | +${rewards.pn} P.N`;
                if (isAttrChoice && overlay._attrChoice === 'aura') toast += ` | +${rewards.auraP}% Aura Máx`;
                window._showXpToast(toast);

                const ciGained = rewards.pi || 0;
                const choseAttr = rewards.attr > 0 && (!isAttrChoice || overlay._attrChoice !== 'aura');

                function continueToNext() {
                    if (onDone) onDone();
                }

                if (ciGained > 0) {
                    // Perguntar sobre inclinações antes de continuar
                    setTimeout(() => {
                        if (confirm(`Você ganhou ${ciGained} ponto(s) de Inclinação! Pode gastar em Combate, em Gerais, ou guardar para depois. Deseja distribuir agora?`)) {
                            state.activeTab = 'TRACOS';
                            render(true);
                            // Só abre sozinho se o personagem realmente puder comprar: antes,
                            // um personagem sem Nen levava um alerta de bloqueio ao subir de nível.
                            if (!window.podeComprarInclinacoes || window.podeComprarInclinacoes(state.currentChar).ok) {
                                setTimeout(() => window._openCombatIncModal(), 300);
                            }
                        }
                        // Se tem mais níveis e ganhou atributo, mostrar botão de pausa
                        if (hasMore && choseAttr) {
                            window._showContinueLevelBtn(targetLevel + 1, tc, continueToNext);
                        } else {
                            setTimeout(continueToNext, 500);
                        }
                    }, 800);
                } else if (hasMore && choseAttr) {
                    // Pausa para alocar atributo antes do próximo dado de vida
                    window._showContinueLevelBtn(targetLevel + 1, tc, continueToNext);
                } else {
                    setTimeout(continueToNext, hasMore ? 500 : 0);
                }
            };
        };

        window._openGeneralIncModal = function() {
            const char = state.currentChar;
            if (!char) return;
            if (!SYSTEM_DB.inclinacoes) { alert('Banco de inclinações não carregado.'); return; }
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const draft = {
                positive: JSON.parse(JSON.stringify((char.inclinations && char.inclinations.positive) || [])),
                negative: JSON.parse(JSON.stringify((char.inclinations && char.inclinations.negative) || []))
            };
            let giFilterText = '';

            function giMatchesFilter(inc) {
                const ft = giFilterText.trim().toLowerCase();
                if (!ft) return true;
                if (inc.nome.toLowerCase().includes(ft) || (inc.desc || '').toLowerCase().includes(ft)) return true;
                if (inc.hasOptions) return inc.options.some(o => o.label.toLowerCase().includes(ft) || (o.desc || '').toLowerCase().includes(ft));
                return false;
            }

            function giPosCost() { return draft.positive.reduce((a, i) => a + i.custo, 0); }
            function giNegVal()  { return draft.negative.reduce((a, i) => a + i.valor, 0); }
            function giFree()    { return calcGeneralIncFreeCost(draft.positive); }
            function giPaid()    { return Math.max(0, giPosCost() - giFree()); }
            function giBalance() { return giNegVal() - giPaid(); }
            function giIsOk()    { return giBalance() >= 0; }

            function giToggle(type, nome, val) {
                const arr = type === 'pos' ? draft.positive : draft.negative;
                const key = type === 'pos' ? 'custo' : 'valor';
                const idx = arr.findIndex(i => i.nome === nome);
                if (idx > -1) arr.splice(idx, 1); else arr.push({ nome, [key]: val });
                document.getElementById('gi-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildGiHtml());
            }

            window._giSetFilterText = function(val) {
                giFilterText = val || '';
                document.getElementById('gi-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildGiHtml());
            };
            window._giToggle = giToggle;

            function buildGiHtml() {
                const posCost = giPosCost(), negVal = giNegVal(), balance = giBalance(), isOk = giIsOk();

                function renderPosInc(inc) {
                    if (inc.hasOptions) {
                        const hasChild = draft.positive.some(i => i.nome.startsWith(inc.nome + ':'));
                        return `<div style="background:#111827;border:1px solid ${hasChild ? '#00ff9d44' : '#1f2937'};border-radius:12px;padding:12px;margin-bottom:8px">
                            <div style="font-size:11px;font-weight:700;color:${hasChild ? '#00ff9d' : '#fff'};margin-bottom:4px">${inc.nome}${hasChild ? ' <span style="font-size:9px;background:#00ff9d15;color:#00ff9d;border:1px solid #00ff9d30;padding:1px 6px;border-radius:4px">Selecionado</span>' : ''}</div>
                            <div style="font-size:10px;color:#6b7280;margin-bottom:8px">${inc.desc || ''}</div>
                            <div style="padding-left:8px;border-left:2px solid #1f2937">
                                ${inc.options.map(opt => { const fullName = inc.nome + ': ' + opt.label; const sel = draft.positive.some(i => i.nome === fullName); return `<div onclick="window._giToggle('pos','${fullName.replace(/'/g,"\\'")}',${opt.custo})" style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;cursor:pointer;background:${sel ? '#00ff9d15' : 'transparent'};margin-bottom:4px"><div><div style="font-size:11px;font-weight:700;color:${sel ? '#00ff9d' : '#d1d5db'}">${opt.label}</div>${opt.desc ? `<div style="font-size:9px;color:#6b7280">${opt.desc}</div>` : ''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:9px;color:#6b7280">${opt.custo} pts</span>${sel ? '<span style="color:#00ff9d;font-size:12px">✓</span>' : ''}</div></div>`; }).join('')}
                            </div>
                        </div>`;
                    }
                    const sel = draft.positive.some(i => i.nome === inc.nome);
                    return `<div onclick="window._giToggle('pos','${inc.nome.replace(/'/g,"\\'")}',${inc.custo})" style="background:#111827;border:1px solid ${sel ? '#00ff9d88' : '#1f2937'};border-radius:12px;padding:12px;cursor:pointer;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start">
                        <div style="flex:1;padding-right:8px"><div style="font-size:11px;font-weight:700;color:${sel ? '#00ff9d' : '#fff'};margin-bottom:2px">${inc.nome}</div><div style="font-size:10px;color:#6b7280">${inc.desc || ''}</div></div>
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0"><span style="font-size:9px;background:#00000080;border:1px solid #374151;padding:2px 6px;border-radius:4px;color:#9ca3af">${inc.custo} pts</span>${sel ? '<span style="color:#00ff9d;font-size:14px">✓</span>' : ''}</div>
                    </div>`;
                }

                function renderNegInc(inc) {
                    if (inc.hasOptions) {
                        const hasChild = draft.negative.some(i => i.nome.startsWith(inc.nome + ':'));
                        return `<div style="background:#111827;border:1px solid ${hasChild ? '#ff005544' : '#1f2937'};border-radius:12px;padding:12px;margin-bottom:8px">
                            <div style="font-size:11px;font-weight:700;color:${hasChild ? '#ff4d6d' : '#fff'};margin-bottom:4px">${inc.nome}${hasChild ? ' <span style="font-size:9px;background:#ff005515;color:#ff4d6d;border:1px solid #ff005530;padding:1px 6px;border-radius:4px">Selecionado</span>' : ''}</div>
                            <div style="font-size:10px;color:#6b7280;margin-bottom:8px">${inc.desc || ''}</div>
                            <div style="padding-left:8px;border-left:2px solid #1f2937">
                                ${inc.options.map(opt => { const fullName = inc.nome + ': ' + opt.label; const sel = draft.negative.some(i => i.nome === fullName); return `<div onclick="window._giToggle('neg','${fullName.replace(/'/g,"\\'")}',${opt.valor})" style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;cursor:pointer;background:${sel ? '#ff005515' : 'transparent'};margin-bottom:4px"><div><div style="font-size:11px;font-weight:700;color:${sel ? '#ff4d6d' : '#d1d5db'}">${opt.label}</div>${opt.desc ? `<div style="font-size:9px;color:#6b7280">${opt.desc}</div>` : ''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:9px;color:#6b7280">+${opt.valor} pts</span>${sel ? '<span style="color:#ff4d6d;font-size:12px">✓</span>' : ''}</div></div>`; }).join('')}
                            </div>
                        </div>`;
                    }
                    const sel = draft.negative.some(i => i.nome === inc.nome);
                    return `<div onclick="window._giToggle('neg','${inc.nome.replace(/'/g,"\\'")}',${inc.valor})" style="background:#111827;border:1px solid ${sel ? '#ff005588' : '#1f2937'};border-radius:12px;padding:12px;cursor:pointer;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start">
                        <div style="flex:1;padding-right:8px"><div style="font-size:11px;font-weight:700;color:${sel ? '#ff4d6d' : '#fff'};margin-bottom:2px">${inc.nome}</div><div style="font-size:10px;color:#6b7280">${inc.desc || ''}</div></div>
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0"><span style="font-size:9px;background:#00000080;border:1px solid #374151;padding:2px 6px;border-radius:4px;color:#9ca3af">+${inc.valor} pts</span>${sel ? '<span style="color:#ff4d6d;font-size:14px">✓</span>' : ''}</div>
                    </div>`;
                }

                return `<div id="gi-modal-overlay" style="position:fixed;inset:0;background:#000000ee;display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif;overflow-y:auto">
                    <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:20px;width:100%;max-width:420px;box-shadow:0 0 60px ${tc}44;margin:auto">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
                            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px">Inclinações Gerais</div>
                            <button onclick="document.getElementById('gi-modal-overlay').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:20px;line-height:1">×</button>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:10px;margin-bottom:14px">
                            <div style="text-align:center;border-right:1px solid #1f2937"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Custo Pos.</div><div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:18px;color:#fff">${posCost}<span style="font-size:9px;color:#6b7280"> pts</span></div></div>
                            <div style="text-align:center;border-right:1px solid #1f2937"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Compensação</div><div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:18px;color:${isOk ? '#00ff9d' : '#ef4444'}">${isOk ? '✓ OK' : balance}</div></div>
                            <div style="text-align:center"><div style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Pts Neg.</div><div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:18px;color:#ef4444">${negVal}<span style="font-size:9px;color:#6b7280"> /10</span></div></div>
                        </div>
                        <div style="margin-bottom:12px">
                            <div style="display:flex;gap:6px">
                                <div style="position:relative;flex:1">
                                    <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#4b5563">🔍</span>
                                    <input id="gi-filter-input" type="text" value="${giFilterText.replace(/"/g,'&quot;')}" placeholder="Buscar inclinação..."
                                        onkeydown="if(event.key==='Enter'){window._giSetFilterText(this.value);}"
                                        style="width:100%;box-sizing:border-box;background:#0a0f1a;border:1.5px solid ${giFilterText ? tc : '#1f2937'};border-radius:9px;padding:8px 10px 8px 30px;color:#fff;font-size:11px;outline:none;transition:border-color .15s"
                                        oninput="this.style.borderColor=this.value?'${tc}':'#1f2937'">
                                </div>
                                <button onclick="window._giSetFilterText(document.getElementById('gi-filter-input').value)"
                                    style="padding:8px 14px;border-radius:9px;background:${tc};color:#000;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0;font-family:Orbitron,sans-serif">🔍</button>
                                ${giFilterText ? `<button onclick="window._giSetFilterText('');document.getElementById('gi-filter-input').value='';"
                                    style="padding:8px 12px;border-radius:9px;background:#1f2937;color:#9ca3af;border:none;font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">✕</button>` : ''}
                            </div>
                        </div>
                        <div style="max-height:55vh;overflow-y:auto;padding-right:4px">
                            ${(() => {
                                const posShown = SYSTEM_DB.inclinacoes.positivas.filter(giMatchesFilter);
                                const negShown = SYSTEM_DB.inclinacoes.negativas.filter(giMatchesFilter);
                                if (giFilterText && posShown.length === 0 && negShown.length === 0) {
                                    return `<div style="text-align:center;color:#374151;font-style:italic;font-size:11px;padding:20px">Nenhuma inclinação encontrada para "${giFilterText}".</div>`;
                                }
                                return `${posShown.length ? `<div style="font-size:9px;font-weight:900;color:#00ff9d;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;display:flex;align-items:center;gap:6px">👍 Gerais Positivas <span style="font-size:8px;background:#00ff9d15;border:1px solid #00ff9d30;padding:2px 6px;border-radius:4px;font-weight:700">1ª Básica Grátis</span></div>${posShown.map(renderPosInc).join('')}` : ''}
                                ${negShown.length ? `<div style="font-size:9px;font-weight:900;color:#ff4d6d;text-transform:uppercase;letter-spacing:2px;margin:12px 0 8px;display:flex;align-items:center;gap:6px">👎 Gerais Negativas</div>${negShown.map(renderNegInc).join('')}` : ''}`;
                            })()}
                        </div>
                        <div style="display:flex;gap:8px;margin-top:14px">
                            <button onclick="document.getElementById('gi-modal-overlay').remove()" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Cancelar</button>
                            <button onclick="window._giSave()" style="flex:2;padding:11px;border-radius:10px;background:${tc};border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 20px ${tc}55">✓ Salvar</button>
                        </div>
                    </div>
                </div>`;
            }

            window._giSave = function() {
                const negVal = giNegVal();
                if (negVal > 10) { alert('O máximo de compensação negativa é 10 pontos.'); return; }
                if (!giIsOk()) { alert('Suas inclinações não estão balanceadas! Adicione negativas ou remova positivas extras.'); return; }
                if (!char.inclinations) char.inclinations = {};
                char.inclinations.positive = JSON.parse(JSON.stringify(draft.positive));
                char.inclinations.negative = JSON.parse(JSON.stringify(draft.negative));
                saveCharacter(char);
                document.getElementById('gi-modal-overlay')?.remove();
                render(true);
                window._showXpToast && window._showXpToast('Inclinações Gerais salvas!');
            };

            document.getElementById('gi-modal-overlay')?.remove();
            document.body.insertAdjacentHTML('beforeend', buildGiHtml());
        };

        // ── Modal das Instâncias Shingen-Ryu ───────────────────────────────────────
        // Diferente do modal das Inclinações em dois pontos: o recurso é P.N (não Pontos
        // de Inclinação) e não existe bônus de atributo, então não há ledger a manter —
        // salvar é só gravar char.instancias.
        window._openInstanciasModal = function () {
            const char = state.currentChar;
            if (!char || !window.INSTANCIAS_DB) { alert('Banco de Instâncias não carregado.'); return; }
            const porta = window.podeComprarInstancias
                ? window.podeComprarInstancias(char) : { ok: true, motivo: '' };
            if (!porta.ok) { alert('Instâncias Shingen-Ryu bloqueadas.\n\n' + (porta.motivo || '')); return; }

            const COR = '#a855f7';
            const draft = JSON.parse(JSON.stringify(char.instancias || {}));
            const ci = char.combatInclinations || {};
            // P.N livre IGNORANDO o que já está gasto em Instâncias, para o modal poder
            // devolver e regastar livremente sem o orçamento "andar" durante a edição.
            const gastoSalvo = window.calcPNSpentInInstancias ? window.calcPNSpentInInstancias(char) : 0;
            const livreBase = (window._pnLivreDoPersonagem ? window._pnLivreDoPersonagem(char) : 0) + gastoSalvo;
            const custoDe = function (n) {
                let c = 0;
                for (let i = 0; i < n; i++) c += (window.INSTANCIA_CUSTO_PN || [2, 3])[i] || 0;
                return c;
            };
            const gastoDraft = function () {
                return Object.keys(draft).reduce(function (a, k) { return a + custoDe(draft[k] || 0); }, 0);
            };

            window._instSetNivel = function (id, n) {
                const atual = draft[id] || 0;
                if (n === atual) return;
                if (n > atual) {
                    const ins = window.INSTANCIAS_DB.filter(function (x) { return x.id === id; })[0];
                    if (!ins) return;
                    if (!window.avaliarRequisitoInstancia(ins.requisitos, ci)) return;
                    const delta = custoDe(n) - custoDe(atual);
                    if (gastoDraft() + delta > livreBase) return;   // sem P.N suficiente
                }
                if (n <= 0) delete draft[id]; else draft[id] = n;
                redesenhar();
            };
            window._instSalvar = function () {
                char.instancias = JSON.parse(JSON.stringify(draft));
                saveCharacter(char);
                document.getElementById('inst-modal-overlay')?.remove();
                render(true);
                window._showXpToast && window._showXpToast('Instâncias Shingen-Ryu salvas!');
            };

            function corpo() {
                const livre = livreBase - gastoDraft();
                return window.INSTANCIAS_DB.map(function (ins) {
                    const cur = draft[ins.id] || 0;
                    const atende = window.avaliarRequisitoInstancia(ins.requisitos, ci);
                    const niveis = ins.niveis.map(function (desc, ni) {
                        const n = ni + 1;
                        const custo = (window.INSTANCIA_CUSTO_PN || [2, 3])[ni] || 0;
                        const ativo = cur >= n;
                        const podeLigar = !ativo && atende && cur === ni && (custo <= livre);
                        const podeDesligar = ativo && cur === n;
                        const clicavel = podeLigar || podeDesligar;
                        return '<div class="flex gap-2 items-start p-2 rounded-lg mb-1" style="background:' + (ativo ? COR + '1a' : '#11182780') + ';border:1px solid ' + (ativo ? COR + '33' : '#1f293780') + '">'
                            + '<button onclick="window._instSetNivel(\'' + ins.id + '\',' + (ativo ? n - 1 : n) + ')" ' + (clicavel ? '' : 'disabled')
                            + ' style="min-width:28px;height:28px;border-radius:6px;border:1px solid ' + (ativo ? COR : '#374151') + ';background:' + (ativo ? COR + '20' : '#111827') + ';color:' + (ativo ? COR : '#6b7280') + ';font-weight:900;font-size:11px;cursor:' + (clicavel ? 'pointer' : 'not-allowed') + ';opacity:' + (clicavel || ativo ? '1' : '0.35') + '">' + (ativo ? '✓' : n) + '</button>'
                            + '<div class="flex-1"><span class="text-[9px] font-bold uppercase tracking-widest block mb-0.5" style="color:' + (ativo ? COR : '#6b7280') + '">Nível ' + n + ' — ' + custo + ' P.N</span>'
                            + '<p class="text-[10px] leading-relaxed ' + (ativo ? 'text-gray-300' : 'text-gray-600') + '">' + desc + '</p></div></div>';
                    }).join('');
                    return '<div class="rounded-xl p-3 mb-2" style="background:#111827;border:1px solid ' + (cur > 0 ? COR + '4d' : '#1f2937') + '">'
                        + '<div class="flex items-center gap-2 mb-1 flex-wrap">'
                        + '<span class="text-xs font-bold" style="color:' + (cur > 0 ? COR : '#fff') + '">' + ins.nome + '</span>'
                        + (ins.etiquetas || []).map(function (e) { return '<span class="text-[8px] font-bold px-1.5 rounded" style="background:#1e3a8a33;color:#93c5fd;border:1px solid #3b82f644">' + e + '</span>'; }).join('')
                        + (atende
                            ? '<span class="text-[8px] font-bold px-1.5 rounded ml-auto" style="background:#16a34a22;color:#4ade80;border:1px solid #16a34a44">requisitos OK</span>'
                            : '<span class="text-[8px] font-bold px-1.5 rounded ml-auto" style="background:#4b556322;color:#9ca3af;border:1px solid #4b556344">requisitos faltando</span>')
                        + '</div>'
                        + '<p class="text-[9px] mb-2 leading-relaxed" style="color:' + (atende ? '#6b7280' : '#f59e0b') + '">Requer: ' + ins.reqTexto + '</p>'
                        + niveis + '</div>';
                }).join('');
            }

            function html() {
                const livre = livreBase - gastoDraft();
                return '<div id="inst-modal-overlay" style="position:fixed;inset:0;background:#000000ee;display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif;overflow-y:auto">'
                    + '<div style="background:#0d1117;border:2px solid ' + COR + ';border-radius:20px;padding:20px;width:100%;max-width:420px;box-shadow:0 0 60px ' + COR + '44;margin:auto">'
                    + '<div style="margin-bottom:14px">'
                    + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:' + COR + ';text-transform:uppercase;letter-spacing:2px">Instâncias Shingen-Ryu</div>'
                    + '<div style="font-size:10px;color:#6b7280;margin-top:2px">Pagas com P.N — o mesmo dos Hatsus e Princípios</div>'
                    + '</div>'
                    + '<div style="border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10px;font-weight:700;background:' + (livre > 0 ? COR + '15' : '#1f2937') + ';border:1px solid ' + (livre > 0 ? COR + '30' : '#374151') + ';color:' + (livre > 0 ? COR : '#9ca3af') + '">⚡ ' + livre + ' P.N disponível(is)</div>'
                    + '<div style="max-height:52vh;overflow-y:auto;padding-right:4px">' + corpo() + '</div>'
                    + '<div style="display:flex;gap:8px;margin-top:14px">'
                    + '<button onclick="document.getElementById(\'inst-modal-overlay\').remove()" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Cancelar</button>'
                    + '<button onclick="window._instSalvar()" style="flex:2;padding:11px;border-radius:10px;background:' + COR + ';border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">✓ Salvar</button>'
                    + '</div></div></div>';
            }
            function redesenhar() {
                document.getElementById('inst-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', html());
            }
            redesenhar();
        };

        window._openCombatIncModal = function() {
            const char = state.currentChar;
            // Gate único (nível + Nen + princípio/técnica) — a mesma função decide o que a
            // ficha mostra, para a tela e o modal nunca discordarem.
            const _porta = window.podeComprarInclinacoes ? window.podeComprarInclinacoes(char) : { ok: !!char && char.level >= 2, motivo: '' };
            if (!char || !_porta.ok) { alert('Inclinações de Combate bloqueadas.\n\n' + (_porta.motivo || '')); return; }
            if (!window.COMBAT_INCLINATIONS_DB) { alert('Banco de Inclinações de Combate não carregado.'); return; }
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#f97316';
            const draft = JSON.parse(JSON.stringify(char.combatInclinations || {}));
            // draftChoices só guarda a escolha de atributo (tiers "escolha"); tiers "fixo" não precisam
            // de escolha — a aplicação real na ficha é resolvida por um "ledger" no save (ver _ciSave),
            // que também AUTOCORRIGE personagens antigos cujo bônus nunca chegou a ser aplicado.
            const draftChoices = {};
            Object.entries(char.combatInclinationAttrApplied || {}).forEach(([id, val]) => {
                if (typeof val === 'string') draftChoices[id] = val;
            });
            const basePts = getCIPointsForLevel(char.level);

            // ── Aba GERAIS: inclinações não-básicas compradas com os MESMOS pontos ──────
            // O livro concede "Inclinações de Combate/Gerais" nos níveis 2, 4, 7 e 11, com
            // um único bolo de pontos. Antes, só Combate consumia esses pontos e as Gerais
            // não-básicas ficavam livres na criação. Agora as duas abas dividem o orçamento.
            // Guardadas em char.generalIncByPoints, separado de char.inclinations, para não
            // misturar com a conta de compensação por negativas usada na criação.
            let ciTab = 'COMBATE';
            const draftGerais = JSON.parse(JSON.stringify(char.generalIncByPoints || []));
            const draftGeraisNeg = JSON.parse(JSON.stringify(char.generalNegByPoints || []));
            const jaNaCriacao = (((char.inclinations || {}).positive) || []).map(function (i) { return i.nome; });
            const jaNaCriacaoNeg = (((char.inclinations || {}).negative) || []).map(function (i) { return i.nome; });

            // Teto de compensação do livro (p29): "Essa compensação pode chegar até um
            // máximo de 10 pontos totais." O teto é do personagem, não de cada etapa, então
            // as negativas da criação e as pegas com pontos dividem o mesmo limite de 10.
            const NEG_COMP_MAX = 10;
            const negCriacaoVal = (((char.inclinations || {}).negative) || [])
                .reduce(function (a, i) { return a + (i.valor || 0); }, 0);
            function getNegPontosVal() { return draftGeraisNeg.reduce(function (a, i) { return a + (i.valor || 0); }, 0); }
            function getNegTotalVal() { return negCriacaoVal + getNegPontosVal(); }
            function getTotalPts() { return basePts + getNegPontosVal(); }

            function geraisCompraveis() {
                const out = [];
                ((SYSTEM_DB.inclinacoes && SYSTEM_DB.inclinacoes.positivas) || []).forEach(function (inc) {
                    if (inc.basica) return; // básicas são da criação, não se compram com pontos
                    if (inc.hasOptions) {
                        (inc.options || []).forEach(function (opt) {
                            out.push({ nome: inc.nome + ': ' + opt.label, custo: opt.custo, desc: opt.desc || '' });
                        });
                    } else {
                        out.push({ nome: inc.nome, custo: inc.custo, desc: inc.desc || '' });
                    }
                });
                return out;
            }
            function negativasDisponiveis() {
                const out = [];
                ((SYSTEM_DB.inclinacoes && SYSTEM_DB.inclinacoes.negativas) || []).forEach(function (inc) {
                    if (inc.basica) return; // básicas são da criação
                    if (inc.hasOptions) {
                        (inc.options || []).forEach(function (opt) {
                            out.push({ nome: inc.nome + ': ' + opt.label, valor: opt.valor, desc: opt.desc || '' });
                        });
                    } else {
                        out.push({ nome: inc.nome, valor: inc.valor, desc: inc.desc || '' });
                    }
                });
                return out;
            }
            function getGeraisSpent() { return draftGerais.reduce(function (a, i) { return a + (i.custo || 0); }, 0); }
            function getCombatSpent() { return Object.values(draft).reduce(function (a, b) { return a + b; }, 0); }
            function getSpent() { return getCombatSpent() + getGeraisSpent(); }

            window._ciSetTab = function (tab) {
                ciTab = tab;
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };
            window._ciToggleNeg = function (nome, valor) {
                const idx = draftGeraisNeg.findIndex(function (i) { return i.nome === nome; });
                if (idx > -1) {
                    // Tirar uma negativa devolve pontos ao bolo. Se isso deixaria o gasto
                    // acima do orçamento, bloqueia: o jogador precisa desfazer a compra antes.
                    const valorSaindo = draftGeraisNeg[idx].valor || 0;
                    if (getSpent() > getTotalPts() - valorSaindo) return;
                    draftGeraisNeg.splice(idx, 1);
                } else {
                    if (getNegTotalVal() + valor > NEG_COMP_MAX) return; // teto de 10 do livro
                    draftGeraisNeg.push({ nome: nome, valor: valor });
                }
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };
            window._ciToggleGeral = function (nome, custo) {
                const idx = draftGerais.findIndex(function (i) { return i.nome === nome; });
                if (idx > -1) {
                    draftGerais.splice(idx, 1);
                } else {
                    // Custo cheio do livro, sem conversão. Sem pontos suficientes, não compra.
                    if (getTotalPts() - getSpent() < custo) return;
                    draftGerais.push({ nome: nome, custo: custo });
                }
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };

            function buildGeraisListHtml(avail) {
                return geraisCompraveis().map(function (g) {
                    const sel = draftGerais.some(function (i) { return i.nome === g.nome; });
                    const jaTem = jaNaCriacao.indexOf(g.nome) > -1;
                    const podeComprar = sel || jaTem || avail >= g.custo;
                    const cor = jaTem ? '#4b5563' : (sel ? '#00ff9d' : (podeComprar ? '#fff' : '#4b5563'));
                    const borda = sel ? '#00ff9d88' : '#1f2937';
                    const clique = jaTem ? '' : ' onclick="window._ciToggleGeral(\'' + g.nome.replace(/'/g, "\\'") + '\',' + g.custo + ')"';
                    const etiqueta = jaTem
                        ? '<span style="font-size:9px;background:#1f2937;color:#6b7280;padding:2px 6px;border-radius:5px">já possui</span>'
                        : '<span style="font-size:9px;background:#00000080;border:1px solid #374151;padding:2px 6px;border-radius:5px;color:' + (podeComprar ? '#9ca3af' : '#4b5563') + '">' + g.custo + ' pt</span>';
                    return '<div' + clique + ' style="background:#111827;border:1px solid ' + borda + ';border-radius:12px;padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:' + (jaTem ? 'default' : (podeComprar ? 'pointer' : 'not-allowed')) + ';opacity:' + (podeComprar ? '1' : '.5') + '">'
                        + '<div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;color:' + cor + ';margin-bottom:2px">' + g.nome + '</div>'
                        + '<div style="font-size:10px;color:#6b7280;line-height:1.35">' + (g.desc || '') + '</div></div>'
                        + '<div style="flex-shrink:0">' + etiqueta + '</div></div>';
                }).join('');
            }

            function buildNegListHtml() {
                const restanteCap = NEG_COMP_MAX - getNegTotalVal();
                const cabecalho = '<div style="background:#0a0f1a;border:1px solid #ff005530;border-radius:8px;padding:8px 12px;margin:14px 0 8px;font-size:10px;color:#ff4d6d;font-weight:700">'
                    + 'Negativas dão pontos. Teto de compensação: ' + getNegTotalVal() + ' / ' + NEG_COMP_MAX
                    + (negCriacaoVal > 0 ? ' <span style="color:#6b7280;font-weight:400">(' + negCriacaoVal + ' já vindos da criação)</span>' : '')
                    + '</div>';
                const itens = negativasDisponiveis().map(function (n) {
                    const sel = draftGeraisNeg.some(function (i) { return i.nome === n.nome; });
                    const jaTem = jaNaCriacaoNeg.indexOf(n.nome) > -1;
                    const cabeNoCap = sel || jaTem || n.valor <= restanteCap;
                    const cor = jaTem ? '#4b5563' : (sel ? '#ff4d6d' : (cabeNoCap ? '#fff' : '#4b5563'));
                    const clique = jaTem ? '' : ' onclick="window._ciToggleNeg(\'' + n.nome.replace(/'/g, "\\'") + '\',' + n.valor + ')"';
                    const etiqueta = jaTem
                        ? '<span style="font-size:9px;background:#1f2937;color:#6b7280;padding:2px 6px;border-radius:5px">já possui</span>'
                        : '<span style="font-size:9px;background:#00000080;border:1px solid #374151;padding:2px 6px;border-radius:5px;color:' + (cabeNoCap ? '#ff4d6d' : '#4b5563') + '">+' + n.valor + ' pt</span>';
                    return '<div' + clique + ' style="background:#111827;border:1px solid ' + (sel ? '#ff005588' : '#1f2937') + ';border-radius:12px;padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:' + (jaTem ? 'default' : (cabeNoCap ? 'pointer' : 'not-allowed')) + ';opacity:' + (cabeNoCap ? '1' : '.5') + '">'
                        + '<div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;color:' + cor + ';margin-bottom:2px">' + n.nome + '</div>'
                        + '<div style="font-size:10px;color:#6b7280;line-height:1.35">' + (n.desc || '') + '</div></div>'
                        + '<div style="flex-shrink:0">' + etiqueta + '</div></div>';
                }).join('');
                return cabecalho + itens;
            }

            function buildModalHtml() {
                const spent = getSpent();
                const totalPts = getTotalPts();
                const avail = totalPts - spent;
                const incsHtml = window.COMBAT_INCLINATIONS_DB.map(inc => {
                    const cur = draft[inc.id] || 0;
                    // Requisito de princípio POR NÍVEL (a etiqueta do bloco "Com aura" daquele
                    // nível). Defensiva Precisa pede TEN no Básico e SHU no Intermediário: quem
                    // só tem TEN compra o Básico e fica travado ali. Antes a inclinação inteira
                    // liberava junto, e era possível comprar Cirúrgica (KO) tendo só TEN.
                    const portaInc = window.podeComprarInclinacao
                        ? window.podeComprarInclinacao(char, inc) : { ok: true, motivo: '' };
                    const portasNivel = inc.tiers.map((_, ti) => window.podeComprarNivelInclinacao
                        ? window.podeComprarNivelInclinacao(char, inc, ti) : { ok: true, motivo: '' });
                    const nAbertos = portasNivel.filter(p => p.ok).length;
                    const tiersHtml = inc.tiers.map((desc, ti) => {
                        const tierNum = ti + 1;
                        const active = cur >= tierNum;
                        const portaN = portasNivel[ti];
                        const canActivate = !active && avail > 0 && cur === ti && portaN.ok;
                        const canDeactivate = active && cur === tierNum;
                        // Tier com bônus de atributo (sempre o último tier, quando inc.attrBonus existe)
                        const isAttrTier = tierNum === inc.tiers.length && !!inc.attrBonus;
                        let attrChoiceHtml = '';
                        if (isAttrTier && active) {
                            if (inc.attrBonus.fixo) {
                                const label = inc.attrBonus.fixo.map(b => `+${b.valor} ${b.attr}`).join(' e ');
                                attrChoiceHtml = `<div class="mt-1.5 text-[9px] font-bold text-orange-400">✦ ${label} (aplicado)</div>`;
                            } else if (inc.attrBonus.escolha) {
                                const chosen = draftChoices[inc.id] || '';
                                const btns = inc.attrBonus.escolha.map(o => {
                                    const isSel = chosen === o.attr;
                                    return `<button onclick="event.stopPropagation();window._ciSetChoice('${inc.id}','${o.attr}')" style="padding:3px 8px;border-radius:6px;font-size:9px;font-weight:900;cursor:pointer;border:1.5px solid ${isSel ? '#f97316' : '#374151'};background:${isSel ? '#f9731622' : 'transparent'};color:${isSel ? '#f97316' : '#9ca3af'}">+${o.valor} ${o.attr}</button>`;
                                }).join(' ');
                                attrChoiceHtml = `<div class="mt-1.5 flex flex-wrap gap-1.5 items-center">${btns}${!chosen ? '<span class="text-[9px] text-red-400 font-bold">⚠ escolha o atributo</span>' : ''}</div>`;
                            }
                        }
                        // Nome do nível como no livro, em vez de "Tier 1/2/3".
                        const nivelNome = window.CI_NIVEL_NOME ? window.CI_NIVEL_NOME[ti] : ('Tier ' + tierNum);
                        // Acréscimo "Com aura": vale para quem conhece o princípio e paga a aura.
                        // "Em vez disso" no texto significa que ele SUBSTITUI o efeito comum.
                        const auraTxt = (inc.aura || [])[ti];
                        const auraHtml = auraTxt
                            ? `<div class="mt-1.5 flex gap-1.5 items-start rounded-md px-2 py-1.5" style="background:#1e3a8a22;border:1px solid #3b82f633"><span style="font-size:9px;line-height:1.3">💠</span><p class="text-[9px] leading-relaxed" style="color:#93c5fd">${auraTxt}</p></div>`
                            : '';
                        return `<div class="flex gap-2 items-start p-2 rounded-lg ${active ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-gray-900/50 border border-gray-800/50'} mb-1">
                            <button onclick="window._ciSetTier('${inc.id}',${active ? tierNum - 1 : tierNum})" style="min-width:28px;height:28px;border-radius:6px;border:1px solid ${active ? '#f97316' : '#374151'};background:${active ? '#f9731620' : '#111827'};color:${active ? '#f97316' : '#6b7280'};font-weight:900;font-size:11px;cursor:${(active && canDeactivate) || canActivate ? 'pointer' : 'default'};opacity:${(active && canDeactivate) || canActivate || active ? '1' : '0.35'}" ${(!canActivate && !active) ? 'disabled' : ''}>${active ? '✓' : tierNum}</button>
                            <div class="flex-1"><span class="text-[9px] font-bold ${active ? 'text-orange-400' : 'text-gray-500'} uppercase tracking-widest block mb-0.5">${nivelNome} — 1 ponto${portaN.ok ? '' : ' 🔒'}</span><p class="text-[10px] ${active ? 'text-gray-300' : 'text-gray-600'} leading-relaxed">${desc}</p>${portaN.ok ? '' : `<p class="text-[9px] font-semibold mt-1" style="color:#f59e0b">${portaN.motivo}</p>`}${auraHtml}${attrChoiceHtml}</div>
                        </div>`;
                    }).join('');
                    return `<div class="bg-gray-900 border ${cur > 0 ? 'border-orange-500/30' : 'border-gray-800'} rounded-xl p-3 mb-2">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-bold ${cur > 0 ? 'text-orange-400' : 'text-white'}">${inc.nome}</span>
                            ${inc.req ? `<span class="text-[9px] bg-gray-800 text-gray-500 px-1.5 rounded border border-gray-700">${inc.req}</span>` : ''}
                            ${(inc.etiquetas || []).map(e => `<span class="text-[8px] font-bold px-1.5 rounded" style="background:#1e3a8a33;color:#93c5fd;border:1px solid #3b82f644">${e}</span>`).join('')}
                            ${nAbertos === 0
                                ? `<span class="text-[8px] font-bold px-1.5 rounded ml-auto" style="background:#4b556322;color:#9ca3af;border:1px solid #4b556344">requisitos faltando</span>`
                                : (nAbertos < inc.tiers.length
                                    ? `<span class="text-[8px] font-bold px-1.5 rounded ml-auto" style="background:#f59e0b22;color:#fbbf24;border:1px solid #f59e0b44">${nAbertos} de ${inc.tiers.length} níveis</span>`
                                    : ((inc.etiquetas || []).length ? `<span class="text-[8px] font-bold px-1.5 rounded ml-auto" style="background:#16a34a22;color:#4ade80;border:1px solid #16a34a44">requisitos OK</span>` : ''))}
                            ${cur > 0 ? `<span class="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 rounded ml-auto">${cur} ponto(s)</span>` : ''}
                        </div>
                        ${tiersHtml}
                    </div>`;
                }).join('');

                return `<div id="ci-modal-overlay" style="position:fixed;inset:0;background:#000000ee;display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif;overflow-y:auto">
                    <div style="background:#0d1117;border:2px solid #f97316;border-radius:20px;padding:20px;width:100%;max-width:420px;box-shadow:0 0 60px #f9741644;margin:auto">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                            <div>
                                <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#f97316;text-transform:uppercase;letter-spacing:2px">Pontos de Inclinação</div>
                                <div style="font-size:10px;color:#6b7280;margin-top:2px">Combate ou Gerais — mesmo bolo de pontos</div>
                            </div>
                            <button onclick="document.getElementById('ci-modal-overlay').remove()" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:20px;line-height:1">×</button>
                        </div>
                        <div id="ci-points-bar" style="background:#0a0f1a;border:1px solid #f9731640;border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
                            <span style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Pontos</span>
                            <span style="font-family:Orbitron,sans-serif;font-weight:900;font-size:16px;color:${getSpent() <= totalPts ? '#f97316' : '#ef4444'}">${getSpent()} <span style="color:#6b7280;font-size:11px">/ ${totalPts}</span></span>
                        </div>
                        ${avail > 0 ? `<div style="background:#f9731615;border:1px solid #f9731630;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10px;font-weight:700;color:#f97316">⚡ ${avail} ponto(s) disponível(is) para investir</div>` : ''}
                        <div style="display:flex;gap:4px;margin-bottom:12px;background:#111827;border-radius:10px;padding:3px">
                            <button onclick="window._ciSetTab('COMBATE')" style="flex:1;padding:8px;border-radius:8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;font-family:Orbitron,sans-serif;border:none;background:${ciTab === 'COMBATE' ? '#f97316' : 'transparent'};color:${ciTab === 'COMBATE' ? '#000' : '#6b7280'}">Combate</button>
                            <button onclick="window._ciSetTab('GERAIS')" style="flex:1;padding:8px;border-radius:8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;font-family:Orbitron,sans-serif;border:none;background:${ciTab === 'GERAIS' ? '#00ff9d' : 'transparent'};color:${ciTab === 'GERAIS' ? '#000' : '#6b7280'}">Gerais</button>
                        </div>
                        <div style="max-height:50vh;overflow-y:auto;padding-right:4px">${ciTab === 'COMBATE' ? incsHtml : (buildGeraisListHtml(avail) + buildNegListHtml())}</div>
                        ${(ciTab === 'COMBATE' && getCombatSpent() > 0) ? `<button onclick="window._ciZerarCombate()" style="width:100%;margin-top:10px;padding:9px;border-radius:9px;background:transparent;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">↺ Zerar e realocar</button>` : ''}
                        <div style="display:flex;gap:8px;margin-top:14px">
                            <button onclick="document.getElementById('ci-modal-overlay').remove()" title="Fecha sem gastar: os pontos ficam guardados para um item mais caro depois" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Acumular Pontos</button>
                            <button onclick="window._ciSave()" style="flex:2;padding:11px;border-radius:10px;background:#f97316;border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 20px #f9731655">✓ Salvar</button>
                        </div>
                    </div>
                </div>`;
            }

            window._ciSetTier = function(id, tierNum) {
                if (tierNum < 0) return;
                const cur = draft[id] || 0;
                if (tierNum > cur && (getTotalPts() - getSpent()) <= 0) return;
                if (tierNum > 3) return;
                // Segunda trava, além do botão desabilitado: o handler é global e pode ser
                // chamado de fora. Valida TODO o caminho, não só o nível de destino — subir
                // para a Maestria passa pelo Intermediário, que pode estar travado.
                if (tierNum > cur && window.podeComprarNivelInclinacao) {
                    const _i = (window.COMBAT_INCLINATIONS_DB || []).filter(function (x) { return x.id === id; })[0];
                    if (_i) {
                        for (let _ti = cur; _ti < tierNum; _ti++) {
                            if (!window.podeComprarNivelInclinacao(char, _i, _ti).ok) return;
                        }
                    }
                }
                draft[id] = tierNum;
                if (tierNum < 3) delete draftChoices[id]; // saiu do tier de bônus — esquece a escolha
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };

            window._ciSetChoice = function(id, attr) {
                draftChoices[id] = attr;
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };

            // ── Zerar as Inclinações de Combate para realocar ───────────────────────────
            // Mexe só no DRAFT e não salva: quem devolve os bônus de atributo é o ledger do
            // _ciSave (appliedBefore → changes com delta negativo). Zerar direto em
            // char.combatInclinations deixaria os +1 de atributo aplicados para sempre.
            window._ciZerarCombate = function () {
                if (!confirm('Zerar todas as Inclinações de Combate para realocar?\n\nOs Pontos de Inclinação voltam para o bolo e os bônus de atributo das Maestrias são desfeitos ao salvar.')) return;
                Object.keys(draft).forEach(function (k) { delete draft[k]; });
                Object.keys(draftChoices).forEach(function (k) { delete draftChoices[k]; });
                document.getElementById('ci-modal-overlay')?.remove();
                document.body.insertAdjacentHTML('beforeend', buildModalHtml());
            };

            window._ciSave = function() {
                // Bloqueia salvar se algum tier de bônus com escolha está ativo sem atributo escolhido
                const pending = window.COMBAT_INCLINATIONS_DB.find(inc =>
                    inc.attrBonus && inc.attrBonus.escolha &&
                    (draft[inc.id] || 0) >= inc.tiers.length && !draftChoices[inc.id]
                );
                if (pending) { alert(`Escolha o atributo do bônus de "${pending.nome}" antes de salvar.`); return; }

                // As Instâncias Shingen-Ryu têm inclinações como requisito. Realocar pode
                // derrubar o requisito de uma Instância já paga com P.N — o jogador precisa
                // saber antes de confirmar, senão descobre depois que treinou uma Instância
                // que a ficha não sustenta mais.
                if (window.INSTANCIAS_DB && window.avaliarRequisitoInstancia) {
                    const inst = char.instancias || {};
                    const orfas = window.INSTANCIAS_DB.filter(function (ins) {
                        if (!(inst[ins.id] > 0)) return false;
                        const antes = window.avaliarRequisitoInstancia(ins.requisitos, char.combatInclinations || {});
                        const depois = window.avaliarRequisitoInstancia(ins.requisitos, draft);
                        return antes && !depois;
                    }).map(function (ins) { return ins.nome; });
                    if (orfas.length > 0) {
                        if (!confirm('Atenção: esta distribuição derruba o requisito de ' + orfas.length
                            + ' Instância(s) Shingen-Ryu já treinada(s):\n\n• ' + orfas.join('\n• ')
                            + '\n\nElas continuam na ficha e o P.N segue gasto, mas ficam sem requisito. Salvar assim mesmo?')) return;
                    }
                }

                // "Ledger" do que já foi de fato aplicado nos atributos: fixo → true, escolha → attr
                // escolhido. Comparar contra isso (em vez de contra o tier salvo anteriormente) também
                // AUTOCORRIGE personagens que já tinham o tier de bônus marcado mas nunca receberam o
                // ganho de atributo (bug anterior a esta correção).
                const appliedBefore = char.combatInclinationAttrApplied || {};
                const appliedAfter = {};
                const changes = [];

                window.COMBAT_INCLINATIONS_DB.forEach(inc => {
                    if (!inc.attrBonus) return;
                    const isActive = (draft[inc.id] || 0) >= inc.tiers.length;
                    const wasApplied = appliedBefore[inc.id];

                    if (!isActive) {
                        if (wasApplied) {
                            if (inc.attrBonus.fixo) {
                                inc.attrBonus.fixo.forEach(b => changes.push({ attr: b.attr, delta: -b.valor, inc: inc.nome }));
                            } else if (inc.attrBonus.escolha) {
                                const opt = inc.attrBonus.escolha.find(o => o.attr === wasApplied);
                                if (opt) changes.push({ attr: opt.attr, delta: -opt.valor, inc: inc.nome });
                            }
                        }
                        return;
                    }

                    if (inc.attrBonus.fixo) {
                        if (!wasApplied) inc.attrBonus.fixo.forEach(b => changes.push({ attr: b.attr, delta: b.valor, inc: inc.nome }));
                        appliedAfter[inc.id] = true;
                    } else if (inc.attrBonus.escolha) {
                        const choice = draftChoices[inc.id];
                        if (wasApplied !== choice) {
                            if (wasApplied) {
                                const oldOpt = inc.attrBonus.escolha.find(o => o.attr === wasApplied);
                                if (oldOpt) changes.push({ attr: oldOpt.attr, delta: -oldOpt.valor, inc: inc.nome });
                            }
                            const newOpt = inc.attrBonus.escolha.find(o => o.attr === choice);
                            if (newOpt) changes.push({ attr: newOpt.attr, delta: newOpt.valor, inc: inc.nome });
                        }
                        appliedAfter[inc.id] = choice;
                    }
                });

                changes.forEach(c => {
                    if (char.attributes[c.attr]) char.attributes[c.attr].value += c.delta;
                });

                char.combatInclinations = JSON.parse(JSON.stringify(draft));
                char.combatInclinationAttrApplied = appliedAfter;
                // Gerais compradas com pontos ficam em campo próprio; nenhuma migração de
                // SQL é necessária porque o personagem inteiro é um JSONB no Supabase.
                char.generalIncByPoints = JSON.parse(JSON.stringify(draftGerais));
                char.generalNegByPoints = JSON.parse(JSON.stringify(draftGeraisNeg));
                saveCharacter(char);
                document.getElementById('ci-modal-overlay')?.remove();
                render(true);

                if (changes.length > 0) {
                    const byInc = {};
                    changes.forEach(c => { (byInc[c.inc] = byInc[c.inc] || []).push(`${c.delta >= 0 ? '+' : ''}${c.delta} ${c.attr}`); });
                    const summary = Object.entries(byInc).map(([nome, parts]) => `${nome}: ${parts.join(', ')}`).join(' · ');
                    window._showXpToast && window._showXpToast(`✨ Atributo adicionado — ${summary}`);
                } else {
                    window._showXpToast && window._showXpToast('Inclinações de Combate salvas!');
                }
            };

            document.getElementById('ci-modal-overlay')?.remove();
            document.body.insertAdjacentHTML('beforeend', buildModalHtml());
        };

        function changeLevel(delta) {
            const char = state.currentChar;
            // Fichas criadas antes deste controle não têm o registro. O nível em que já
            // estão conta como celebrado, senão baixar e subir daria recompensa de novo.
            if (char.nivelMaxCelebrado == null) char.nivelMaxCelebrado = parseInt(char.level) || 0;
            const newLevel = char.level + delta;
            if (newLevel < 0) return;
            if (delta > 0) {
                // Novo comportamento: abre modal de XP primeiro
                window.openXpModal();
            } else {
                if (!confirm('Reduzir nível não desfaz automaticamente os ganhos de vida. Continuar?')) return;
                char.level = newLevel;
                // Ajusta xp_next para o nível anterior
                char.xp_next = SYSTEM_DB.xpTable[Math.min(newLevel, SYSTEM_DB.xpTable.length - 1)] || 50;
                saveCharacter(char);
                render(true);
            }
        }
        function toggleSheetAccordion() { state.sheetOtherSkillsOpen = !state.sheetOtherSkillsOpen; render(true); }
        function toggleHatsuAccordion() { state.hatsuListOpen = !state.hatsuListOpen; render(true); }
        // ── CA calculada na hora, nunca gravada ──────────────────────────────────────
        // Antes a CA era gravada em char.vitals.ca na criação (10 + mod CON) e nunca mais
        // recalculada: se o CON subisse, a CA continuava a mesma. Agora é sempre conta.
        // Sem armadura: 10 + mod CON. Com armadura: vale a MAIOR das duas.
        // CA de objeto de Hatsu não entra aqui — ela tem lugar próprio na ficha do Hatsu.
        // A CA sem armadura usa o modificador EFETIVO de CON, que já inclui GYO (+3 no
        // modificador, conforme o livro) e Aumento de Atributo dos Hatsus ativos (+2 no
        // valor). Antes o GYO era somado ao valor, o que dava só +1 de modificador.
        function calcCASemArmadura(char) {
            const ef = window.calcAtributoEfetivo ? window.calcAtributoEfetivo(char, 'CON') : null;
            return 10 + (ef ? ef.mod : getMod(((char.attributes || {}).CON || {}).value || 10));
        }
        // O campo ca do ITEM_DB é texto: "16", "12 + DES", "14 + DES (max. 3)" para armaduras
        // e "+1", "+3", "+5" para escudos. Escudo é BÔNUS: soma por cima, com armadura ou sem.
        function _parseCAItem(txt) {
            const s = String(txt || '').trim();
            if (!s) return null;
            if (s[0] === '+') {
                const b = parseInt(s.slice(1));
                return isNaN(b) ? null : { tipo: 'escudo', bonus: b };
            }
            const base = parseInt(s);
            if (isNaN(base)) return null;
            const usaDes = /DES/i.test(s);
            const mx = s.match(/max\.?\s*(\d+)/i);
            return { tipo: 'armadura', base: base, usaDes: usaDes, teto: mx ? parseInt(mx[1]) : null };
        }
        // Melhor armadura vestida (uma só) + soma de TODOS os escudos do inventário.
        function calcCAArmadura(char) {
            const modDes = getMod(((char.attributes || {}).DES || {}).value || 10);
            // Maestrias de armadura, que até aqui não chegavam à CA. As duas mexem na CA
            // DA PEÇA, então entram ANTES da escolha da "melhor armadura": aplicadas depois,
            // uma média com o teto de DES ampliado poderia perder a comparação para uma
            // pesada sem o +2 e o jogador veria a CA errada.
            // O tipo da peça vem do findItemData, que devolve sub = 'leves'|'medias'|'pesadas'.
            // Peça com CA digitada à mão e fora do ITEM_DB não tem sub: as maestrias não
            // se aplicam, porque não há como saber o tipo.
            const _ci = (char && char.combatInclinations) || {};
            const _mMedia  = (parseInt(_ci.maestria_armadura_media) || 0) >= 2;   // tier 2
            const _mPesada = (parseInt(_ci.maestria_armadura_pesada) || 0) >= 1;  // tier 1
            let melhorArmadura = 0, bonusEscudo = 0;
            (char.inventory || []).forEach(function (item) {
                const data = (typeof findItemData === 'function') ? findItemData(item && item.name) : null;
                const info = _parseCAItem((item && item.ca) || (data && data.ca));
                if (!info) return;
                if (info.tipo === 'escudo') { bonusEscudo += info.bonus; return; }
                const sub = (data && data.sub) || '';
                let total = info.base;
                let teto = info.teto;
                // "Some até 4 de DES na CA, em vez do máximo 3." O livro assume que média
                // tem teto 3; o ITEM_DB também tem médias de teto 2. Subimos 1, com 4 de
                // limite: dá exatamente o 4 do livro no caso dele e nunca mais de +1.
                if (_mMedia && sub === 'medias' && teto != null) teto = Math.min(4, teto + 1);
                if (info.usaDes) total += (teto != null) ? Math.min(modDes, teto) : modDes;
                if (_mPesada && sub === 'pesadas') total += 2;   // "+2 na CA da armadura"
                if (total > melhorArmadura) melhorArmadura = total;
            });
            return { armadura: melhorArmadura, escudo: bonusEscudo };
        }
        // ── Princípios ativos que mexem na CA ───────────────────────────────────────
        // KEN multiplica a CA, KO reduz 80%, RYU soma a linha da tabela do turno e SHU
        // soma o 1d4 rolado na ativação. (O comentário antigo descrevia duas médias que
        // não existem mais: nem o RYU é fixo em 3, nem o SHU usa a média 2 do 1d4.)
        // O GYO concentrado em CON entra pela porta normal, no 10 + modificador.
        function calcCAPrincipios(char, caBase) {
            const at = (char && char.principiosAtivos) || {};
            const fontes = [];
            let ca = caBase;
            if (at.ken) {
                // 1 pacote dobra, 2 triplicam, 3 quadruplicam — "gastar o dobro de aura e
                // Reações para triplicar a CA original no lugar de dobrar".
                const _mk = window.multiplicadorKen ? window.multiplicadorKen(char) : 2;
                ca = ca * _mk; fontes.push('KEN (×' + _mk + ')');
            }
            if (at.ko) {
                const koB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'ko') : { caBonus: 0 };
                ca = Math.round(ca * 0.2) + (koB.caBonus || 0);
                fontes.push('KO (−80%' + ((koB.caBonus || 0) > 0 ? ', +' + koB.caBonus : '') + ')');
            }
            if (at.ryu) {
                // Era +3 fixo, o valor dos 3 turnos iniciais, para sempre. Agora vem da
                // linha vigente: nos turnos 4-6 ela vale 3, 4 ou 5 conforme a ordem da
                // tabela que o jogador escolheu.
                const _r = window.calcRyuAtivo ? window.calcRyuAtivo(char) : null;
                const v = _r ? _r.ca : 3;
                ca += v;
                fontes.push('RYU (+' + v + (_r ? ', ' + _r.tabela + ' turno ' + _r.turno : '') + ')');
            }
            if (at.shu) {
                // Antes era fixo em 2, a média do 1d4. O livro manda somar o RESULTADO do
                // 1d4, que agora é rolado na ativação (char.shuCaRolado), mais +1 por cada
                // 5% do item 1 do menu. No SHU Superior esse +1 vem junto com o degrau
                // de escada do Dano, sem precisar escolher entre os dois.
                const _s = window.calcShuAtivo ? window.calcShuAtivo(char) : { caBonus: 0, caRolado: 0, caPasso: 0 };
                ca += _s.caBonus;
                fontes.push('SHU (1d4 rolou ' + _s.caRolado
                    + (_s.caPasso > 0 ? ' +' + _s.caPasso : '') + ')');
            }
            return { ca: Math.max(0, ca), fontes: fontes };
        }

        function calcCAAtual(char) {
            if (!char) return 10;
            const arm = calcCAArmadura(char);
            // ── Armadura quebrada não protege mais ──────────────────────────────────
            // A durabilidade é o número de golpes que a armadura aguenta, e esse número
            // É a CA que ela concede: uma armadura de CA 13 aguenta 13 golpes. Zerada,
            // o personagem cai para a CA natural. Antes a durabilidade era só um
            // contador na tela — dava para zerar e a CA não mudava um ponto.
            // Sem recursão: getDurabilidade chama calcCAArmadura, nunca calcCAAtual.
            const _dur = getDurabilidade(char);
            const _caArmadura = _dur.quebrada ? 0 : arm.armadura;
            // A maior entre "sem armadura" e a armadura vestida, e o escudo soma dos dois
            // jeitos — escudo é item à parte e não tem durabilidade.
            const base = Math.max(calcCASemArmadura(char), _caArmadura) + arm.escudo;
            // Instância Combatente Rápido nível 2, quando o jogador escolheu CA.
            // Primeiro bônus de CA vindo de Instância/Inclinação a entrar no cálculo —
            // antes nada disso chegava aqui (ver a lacuna de CA no backlog).
            const _bci = window.calcBonusCAInstancia ? window.calcBonusCAInstancia(char).total : 0;
            // Inclinações: só o que é permanente. O condicional fica no painel da Ficha.
            const _bcl = window.calcBonusCAInclinacao ? window.calcBonusCAInclinacao(char).total : 0;
            return calcCAPrincipios(char, base + _bci + _bcl).ca;
        }
        window.calcCAAtual = calcCAAtual;

        // Escolha de uma Instância que oferece "ou" na descrição (hoje só o
        // Combatente Rápido nível 2). Guarda em char.instanciaEscolhas para os
        // dois destinos possíveis poderem ler de um lugar só.
        window._setInstanciaEscolha = function (chave, valor) {
            const char = state.currentChar;
            if (!char) return;
            if (!char.instanciaEscolhas) char.instanciaEscolhas = {};
            char.instanciaEscolhas[chave] = valor;
            saveCharacter(char);
            render(true);
        };

        // ── Durabilidade de Equipamentos de Proteção ─────────────────────────────────
        // Regra: a durabilidade de uma armadura é igual à CA que ela concede — Colete de
        // Resposta Rápida (CA 15) aguenta 15 golpes, Colete Fino de Kevlar (CA 12+DES) é
        // destruído em 12. Reduz 1 por golpe recebido sem TEN, KEN ou RYU; golpes de rajada
        // ou explosivos reduzem 2. Escudos NÃO entram: só quebram por balístico, explosivo,
        // arma de cerco ou golpe mirado com aura.
        // Por decisão de mesa, a redução é MANUAL: clicar no ícone tira 1. Nada automático,
        // porque o app não acompanha a rodada e clicar no PV não significa golpe recebido.
        function calcDurabilidadeMax(char) {
            const arm = calcCAArmadura(char);
            return arm.armadura > 0 ? arm.armadura : 0;
        }
        function getDurabilidade(char) {
            const max = calcDurabilidadeMax(char);
            if (max <= 0) return { max: 0, atual: 0, quebrada: false, temArmadura: false };
            const atual = (char.armorDurability != null) ? char.armorDurability : max;
            return { max: max, atual: Math.max(0, Math.min(atual, max)), quebrada: atual <= 0, temArmadura: true };
        }
        // ── Sair da ficha para a lista ───────────────────────────────────────────────
        // Precisa DESLIGAR o modo de visualização. Antes, abrir uma ficha pelo painel de
        // admin ligava state._viewingMode e o desligamento só acontecia no botão da faixa
        // de somente leitura — faixa que nunca aparece para admin, porque readOnly fica
        // false. O modo ficava ligado pelo resto da sessão e TODO saveCharacter passava a
        // gravar só no Supabase, via saveViewingChar, sem tocar o localStorage. Como a
        // lista inicial lê do localStorage, as fichas do próprio admin ficavam invisíveis.
        window._sairDaFicha = function () {
            state._viewingMode = false;
            state.readOnly = false;
            state.viewingUser = null;
            state.currentChar = state._prevChar || null;
            state._prevChar = null;
            state.view = 'LIST';
            render();
        };

        function handleArmorClick() {
            const char = state.currentChar;
            const d = getDurabilidade(char);
            if (!d.temArmadura) {
                alert('Nenhuma armadura no inventário.\n\nA durabilidade é igual à CA que a armadura concede. Escudos não têm durabilidade nesta regra.');
                return;
            }
            if (d.quebrada) {
                if (confirm('Armadura quebrada.\n\nReparar e restaurar a durabilidade para ' + d.max + '?')) {
                    char.armorDurability = d.max;
                    saveCharacter(char);
                    render(true);
                }
                return;
            }
            char.armorDurability = d.atual - 1;
            saveCharacter(char);
            render(true);
        }
        window.handleArmorRepair = function () {
            const char = state.currentChar;
            const d = getDurabilidade(char);
            if (!d.temArmadura) return;
            char.armorDurability = d.max;
            saveCharacter(char);
            render(true);
        };
        function uploadCharacterImage(input) { if (input.files && input.files[0]) { const reader = new FileReader(); reader.onload = function(e) { state.currentChar.imageUrl = e.target.result; state.currentChar.imagePosition = { x: 50, y: 50 }; saveCharacter(state.currentChar); render(true); }; reader.readAsDataURL(input.files[0]); } }

        // Modal pra escolher qual parte da imagem do personagem fica visível no recorte do header
        // (a área do header usa background-size:cover, então o resto da imagem é cortado — aqui o
        // jogador clica/arrasta na prévia pra mover o ponto de foco do recorte).
        window._openImagePositionModal = function() {
            const char = state.currentChar;
            if (!char || !char.imageUrl) return;
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const initial = char.imagePosition || { x: 50, y: 50 };
            const draft = { x: initial.x, y: initial.y };

            const overlay = document.createElement('div');
            overlay.id = 'img-pos-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:20px;width:100%;max-width:400px;box-shadow:0 0 60px ${tc}44">
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">📍 Ajustar Imagem</div>
                    <div style="font-size:10px;color:#6b7280;margin-bottom:14px">Clique ou arraste na prévia abaixo para escolher qual parte da imagem fica visível.</div>
                    <div id="img-pos-preview" style="position:relative;width:100%;aspect-ratio:15/8;border-radius:12px;overflow:hidden;border:2px solid #1f2937;cursor:crosshair;background-image:url('${char.imageUrl.replace(/'/g,"\\'")}');background-size:cover;background-repeat:no-repeat;background-position:${draft.x}% ${draft.y}%;touch-action:none">
                        <div id="img-pos-crosshair" style="position:absolute;width:18px;height:18px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ${tc},0 2px 8px rgba(0,0,0,0.6);left:${draft.x}%;top:${draft.y}%;transform:translate(-50%,-50%);pointer-events:none"></div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:16px">
                        <button id="img-pos-cancel" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">Cancelar</button>
                        <button id="img-pos-save" style="flex:2;padding:11px;border-radius:10px;background:${tc};border:none;color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;box-shadow:0 0 20px ${tc}55">✓ Salvar</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            const preview = document.getElementById('img-pos-preview');
            const crosshair = document.getElementById('img-pos-crosshair');
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
            document.getElementById('img-pos-cancel').onclick = cleanup;
            document.getElementById('img-pos-save').onclick = function() {
                char.imagePosition = { x: draft.x, y: draft.y };
                saveCharacter(char);
                cleanup();
                render(true);
            };
        };
        function addItem() { const name = document.getElementById('new-item-name').value; if (name) { state.currentChar.inventory.push({ name, qty: 1 }); saveCharacter(state.currentChar); render(true); } }
        function updateItemQty(idx, delta) { const item = state.currentChar.inventory[idx]; item.qty += delta; if (item.qty <= 0) state.currentChar.inventory.splice(idx, 1); saveCharacter(state.currentChar); render(true); }
        function updateMoney(val) { state.currentChar.money = parseInt(val) || 0; saveCharacter(state.currentChar); render(true); }
        function clearHistory() { if(confirm('Limpar histórico?')) { state.currentChar.history = []; saveCharacter(state.currentChar); render(true); } }
        function toggleBioAccordion(id) { state.bioAccordionOpen = state.bioAccordionOpen === id ? null : id; render(true); }
        function updateBio(field, val) { if (!state.currentChar.bio) state.currentChar.bio = {}; state.currentChar.bio[field] = val; saveCharacter(state.currentChar); render(true); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  renderHatsuDetail — tela de visualização do Hatsu
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
