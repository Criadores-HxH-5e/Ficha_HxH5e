        function renderSheet(container) {
            const char = state.currentChar;
            const clsData = SYSTEM_DB.classes.find(c => c.id === char.class);
            const themeColor = clsData ? clsData.color : '#00ff9d';
            setThemeColor(themeColor);
            
            // Helpers de renderização interna da ficha
            const renderNeonVital = (label, val, max, colorClass, borderClass, showBtns = true, step = 1, showMax = false) => `
                <div class="flex flex-col items-center justify-center w-full">
                    <span class="text-[9px] font-bold ${colorClass} uppercase tracking-wider mb-0.5">${label}</span>
                    <div class="flex items-center justify-between w-full max-w-[80%] gap-1">
                         ${showBtns ? `<button onclick="${label === 'SAN' ? 'window._showSanDamageModal()' : `updateVital('${label.toLowerCase()}', ${-step})`}" class="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><i data-lucide="minus" size="10"></i></button>` : '<div class="w-4"></div>'}
                        <span class="font-display font-bold text-lg text-white tracking-wider">${showMax && max != null ? `${val}<span class="text-gray-400 text-xs font-normal">/${max}</span>` : val}</span>
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
                const infoGridHtml = `<div class="grid grid-cols-4 divide-x divide-gray-800 bg-[#0b0c10] border-t border-b border-gray-800 mb-2"><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-neon-blue uppercase tracking-widest mb-0.5">Tendência</span><select onchange="updateCharProperty('alignment', this.value)" class="bg-transparent text-white font-display font-bold text-xs uppercase outline-none cursor-pointer text-center appearance-none w-full"><option value="Heróico" ${char.alignment === 'Heróico' ? 'selected' : ''} class="bg-gray-900">Heróico</option><option value="Caótico" ${char.alignment === 'Caótico' ? 'selected' : ''} class="bg-gray-900">Caótico</option><option value="Neutro" ${!char.alignment || char.alignment === 'Neutro' ? 'selected' : ''} class="bg-gray-900">Neutro</option><option value="Maligno" ${char.alignment === 'Maligno' ? 'selected' : ''} class="bg-gray-900">Maligno</option></select></div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-neon-yellow uppercase tracking-widest mb-0.5">Proficiência</span><span class="font-display font-bold text-lg text-white tracking-wider">+${getProficiencyBonus(char.level)}</span></div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-white uppercase tracking-widest mb-0.5">Desl.</span><span class="font-display font-bold text-lg text-white tracking-wider">${char.vitals.desl || 9}m</span></div><div class="p-2 flex flex-col items-center justify-center"><span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Jogador</span><input type="text" value="${char.playerName || ''}" placeholder="Nome..." onchange="updateCharProperty('playerName', this.value)" class="bg-transparent text-white font-display font-bold text-xs outline-none w-full text-center placeholder-gray-700"></div></div>`;
                // Migrate old characters: fix sanMax and add rdm
                if (!char.vitals.sanMax || char.vitals.sanMax < 100) { char.vitals.sanMax = 100; if (char.vitals.san < 10) char.vitals.san = 100; }
                const rdmVal = calcRDM(char);
                const sanPct = Math.round((char.vitals.san / char.vitals.sanMax) * 100);
                const sanColor = sanPct >= 90 ? 'text-green-400' : sanPct >= 75 ? 'text-yellow-400' : sanPct >= 50 ? 'text-orange-400' : 'text-purple-400';
                const vitalsGridHtml = `<div class="grid grid-cols-3 gap-y-2 gap-x-2 px-2 py-2 border-b border-gray-800 bg-[#0b0c10] mb-4">${renderNeonVital('SAN', char.vitals.san, char.vitals.sanMax, sanColor, 'bg-white')}${renderNeonVital('REA', char.vitals.rea || (7 + getMod(char.attributes.SAB.value)), null, 'text-white', 'bg-white text-white', true)}${renderNeonVital('AURA', char.vitals.aura, char.vitals.auraMax, `text-[${themeColor}]`, `bg-[${themeColor}] text-[${themeColor}]`, true, 5)}${renderNeonVital('CA', char.vitals.ca, null, 'text-white', 'bg-white text-white', false)}<div class="flex flex-col items-center justify-center cursor-pointer group" onclick="handleArmorClick()"><span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ARMADURA</span><div class="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center bg-gray-900 group-hover:border-[${themeColor}] group-hover:shadow-[0_0_10px_rgba(var(--theme-rgb),0.3)] transition-all"><i data-lucide="shield" size="20" class="text-gray-400 group-hover:text-[${themeColor}] transition-colors"></i></div><div class="w-8 h-0.5 rounded-full mt-1.5 bg-gray-800 opacity-80"></div></div>${renderNeonVital('PV', char.vitals.hp, char.vitals.hpMax, 'text-neon-red', 'bg-neon-red text-neon-red', true, 1, true)}</div>${rdmVal > 0 ? `<div class="flex items-center justify-center gap-2 text-[9px] text-blue-400 font-bold pb-2 border-b border-gray-800 mb-2"><span> 🛡️ RDM (Resist. Mental)</span><span class="font-display text-sm">−${rdmVal}</span></div>` : ''}`;
                const rollModesHtml = ''; // removido — modo é escolhido por rolagem via modal
                const attributesHtml = `<div class="grid grid-cols-2 gap-3 p-4 pt-0">${Object.entries(char.attributes).map(([key, attr]) => { const mod = getMod(attr.value); const fullName = ATTR_FULL_NAMES[key]; const icons = ATTR_ICONS_MAP[key] || ["star","star"]; const saveSkillName = `TR de ${key}`; const isTrained = char.skills.includes(saveSkillName); const isExpert = (char.expertise || []).includes(saveSkillName); const pb = getProficiencyBonus(char.level); let saveBonus = mod; if(isExpert) saveBonus += pb * 2; else if(isTrained) saveBonus += pb; const saveBonusStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`; return `<div class="bg-gray-900 border border-gray-800 rounded-3xl p-3 relative overflow-hidden transition-all duration-300 hover:border-[${themeColor}] hover:shadow-[0_0_20px_rgba(var(--theme-rgb),0.1)] h-full flex flex-col justify-between group" onclick="handleAttributeClick('${key}')"><div class="relative w-full flex justify-center items-center mb-1 min-h-[30px]"><div class="flex items-center gap-2 text-[${themeColor}] bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm z-10 shadow-[0_0_15px_${themeColor}40]"><i data-lucide="${icons[0]}" size="10" class="drop-shadow-[0_0_8px_${themeColor}]"></i><span class="text-[9px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">${fullName}</span><i data-lucide="${icons[1]}" size="10" class="drop-shadow-[0_0_8px_${themeColor}]"></i></div></div><div class="flex items-center justify-center my-0 relative flex-1"><button onclick="event.stopPropagation(); updateSheetAttr('${key}', -1)" class="absolute left-0 text-gray-600 hover:text-white p-1"><i data-lucide="minus" size="14"></i></button><span class="text-4xl font-display font-bold text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">${attr.value}</span><button onclick="event.stopPropagation(); updateSheetAttr('${key}', 1)" class="absolute right-0 text-gray-600 hover:text-white p-1"><i data-lucide="plus" size="14"></i></button></div><div class="flex justify-center mt-1 mb-1"><div class="px-4 py-0.5 rounded-full border border-[${themeColor}]/30 bg-[${themeColor}]/5 text-[${themeColor}] text-xs font-bold shadow-[0_0_10px_rgba(var(--theme-rgb),0.2)]">${mod >= 0 ? '+'+mod : mod}</div></div><div onclick="event.stopPropagation(); handleShieldClick('${key}')" class="absolute right-2 bottom-2 cursor-pointer z-20 hover:scale-110 transition-transform flex items-center justify-center" title="TR de ${fullName}: ${saveBonusStr}"><i data-lucide="shield" size="18" class="${isTrained ? (isExpert ? 'text-neon-yellow fill-neon-yellow/10 drop-shadow-[0_0_5px_rgba(255,230,0,0.8)]' : `text-[${themeColor}] fill-[${themeColor}]/10 drop-shadow-[0_0_5px_${themeColor}]`) : 'text-gray-800 fill-gray-900'} transition-colors"></i><span class="absolute text-[7px] font-bold ${isTrained ? 'text-white' : 'text-gray-500'}" style="padding-top: 1px;">${saveBonusStr}</span></div></div>`; }).join('')}${state.openAttrPopup ? (() => { const key = state.openAttrPopup; const attr = char.attributes[key]; const mod = getMod(attr.value); const skillsList = SKILL_MAP[key] || []; return `<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onclick="toggleAttrPopup(null)"><div class="bg-gray-900 border-2 border-[${themeColor}] rounded-2xl p-6 w-[85%] max-w-[320px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative transform scale-100 animate-in zoom-in-95 duration-200" onclick="event.stopPropagation()"><button onclick="toggleAttrPopup(null)" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i data-lucide="x" size="20"></i></button><div class="text-center mb-6"><h2 class="text-2xl font-display font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_${themeColor}]">${ATTR_FULL_NAMES[key]}</h2><div class="flex justify-center items-center gap-4 mt-2"><div class="text-4xl font-display font-bold text-[${themeColor}]">${attr.value}</div><div class="bg-gray-800 px-4 py-1 rounded-full text-sm font-bold text-white border border-gray-700">Mod ${mod >= 0 ? '+'+mod : mod}</div></div></div><div class="space-y-3 mb-6"><h4 class="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800 pb-2 text-center">Perícias Associadas</h4><div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">${skillsList.length > 0 ? skillsList.map(s => { const isTrained = char.skills.includes(s); const isExpert = (char.expertise || []).includes(s); const pb = getProficiencyBonus(char.level); let totalBonus = mod; if (isExpert) totalBonus += (pb * 2); else if (isTrained) totalBonus += pb; let iconName = 'circle'; let iconColorClass = 'text-gray-600'; if (isExpert) { iconName = 'badge-check'; iconColorClass = 'text-neon-yellow fill-neon-yellow/20'; } else if (isTrained) { iconName = 'check-circle-2'; iconColorClass = `text-[${themeColor}]`; } return `<div class="flex items-center justify-between p-3 rounded-xl border transition-all group ${isTrained ? `bg-[${themeColor}]/10 border-[${themeColor}]/30` : 'bg-gray-950 border-gray-800 hover:border-gray-600'}"><div class="flex items-center gap-3 cursor-pointer" onclick="handleSkillStatus('${s}')"><i data-lucide="${iconName}" size="20" class="${iconColorClass} hover:scale-110 transition-transform"></i><span class="text-xs font-bold uppercase tracking-wide ${isTrained ? 'text-white' : 'text-gray-400'}">${s}</span></div><button class="flex items-center gap-2 px-2 py-1 rounded-lg border ${isExpert ? 'border-neon-yellow/40 bg-neon-yellow/10' : (isTrained ? `border-[${themeColor}]/40 bg-[${themeColor}]/10` : 'border-gray-700 bg-gray-900')} hover:brightness-125 transition-all cursor-pointer" onclick="toggleAttrPopup(null); openRollModeModal('skill', '${s}', '${key}')"><span class="text-xs font-mono font-bold ${isExpert ? 'text-neon-yellow' : (isTrained ? `text-[${themeColor}]` : 'text-gray-400')}">${totalBonus >= 0 ? '+'+totalBonus : totalBonus}</span><i data-lucide="dices" size="14" class="${isExpert ? 'text-neon-yellow' : (isTrained ? `text-[${themeColor}]` : 'text-gray-400')} transition-colors"></i></button></div>` }).join('') : '<span class="text-xs text-gray-600 italic block text-center py-2">Nenhuma perícia associada.</span>'}</div></div><button onclick="toggleAttrPopup(null); openRollModeModal('dice', '${key}', ${mod})" class="w-full py-3 bg-[${themeColor}] text-black font-black font-display tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_${themeColor}40]"><i data-lucide="dices" size="18"></i> ROLAR ATRIBUTO PURO</button></div></div>${state.skillSelectionModal ? `<div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 animate-in fade-in duration-200" onclick="closeSkillModal()"><div class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[85%] max-w-[300px] shadow-2xl relative" onclick="event.stopPropagation()"><h3 class="text-lg font-display font-bold text-white mb-1">${state.skillSelectionModal}</h3><p class="text-xs text-gray-400 mb-4 uppercase tracking-widest">Selecione o nível de treinamento</p><div class="space-y-2"><button onclick="setSkillLevel('${state.skillSelectionModal}', 'remove')" class="w-full p-3 rounded-lg border border-red-900/50 bg-red-500/10 text-red-500 font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"><i data-lucide="x" size="16"></i> Remover Proficiência</button><button onclick="setSkillLevel('${state.skillSelectionModal}', 'trained')" class="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 font-bold text-xs uppercase hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"><i data-lucide="check-circle-2" size="16"></i> Normal (1x Bônus)</button><button onclick="setSkillLevel('${state.skillSelectionModal}', 'expert')" class="w-full p-3 rounded-lg border border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow font-bold text-xs uppercase hover:bg-neon-yellow hover:text-black transition-colors flex items-center gap-2"><i data-lucide="badge-check" size="16"></i> Especialização (2x Bônus)</button></div><button onclick="closeSkillModal()" class="mt-4 w-full py-2 text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest">Cancelar</button></div></div>` : ''}`; })() : ''}</div>`;
                tabContent = `${infoGridHtml}${vitalsGridHtml}${(() => {
                    // Active Nen principles quick-use buttons
                    const d = char.nenDominio || {};
                    const aura = char.vitals.aura || 0;
                    const activeAny = (d.ten||0)>0||(d.ren||0)>0||(d.zetsu||0)>0||d.en||d.inp||d.gyo||d.shu||d.ken||d.ko||d.ryu;
                    if (!activeAny) return '';
                    const tc2 = (window.HATSU_DB&&window.HATSU_DB.categorias[char.class]&&window.HATSU_DB.categorias[char.class].cor)||themeColor;

                    const PRINCIPIOS = [
                        { key:'ten', label:'TEN', icon:'🛡️',
                          custo: (() => {
                              const isR = char.class === 'REFORÇO' || char.class === 'INTENSIFICAÇÃO';
                              const nv = d.ten || 1;
                              if (isR) return nv === 2 ? 5 : 10;
                              return 20;
                          })(),
                        efeito: d.ten===1?'+2 RD':d.ten===2?'+4 RD':'+6 RD',
                           desc: 'Reação — RD física', show: (d.ten||0)>0 },
                        { key:'ren', label:'REN', icon:'💪', custo:5,
                          efeito: '+1 Grau dano',
                          desc: 'Ação Bônus — aumenta grau', show: (d.ren||0)>0 },
                        { key:'zetsu', label:'ZETSU', icon:'👁️', custo:0,
                          efeito: d.zetsu===1?'+5% Aura/3rod':d.zetsu===2?'+10% Aura/2rod':'+10% Aura/1rod',
                          desc: 'Ação Bônus — recupera aura', show: (d.zetsu||0)>0 },
                        { key:'en', label:'EN', icon:'🔵', custo:10,
                          efeito: 'Detecta 3m', desc: '10% + 2 Reações', show: !!d.en },
                        { key:'inp', label:'IN', icon:'🌑', custo:5,
                          efeito: 'Oculta objeto', desc: '5% por rodada', show: !!d.inp },
                        { key:'gyo', label:'GYO', icon:'🔍', custo:10,
                          efeito: 'Ver aura/oculto', desc: '10% olhos / 30% corpo', show: !!d.gyo },
                        { key:'shu', label:'SHU', icon:'⚡', custo:10,
                          efeito: '+1d4 dano+CA', desc: '10% em objeto 1m', show: !!d.shu },
                        { key:'ken', label:'KEN', icon:'🏰', custo:30,
                          efeito: 'CA ×2 por 2rod', desc: '30% + 4 Reações', show: !!d.ken },
                        { key:'ko', label:'KO', icon:'🔥', custo:30,
                          efeito: 'Dano ×3, CA −80%', desc: '30% Aura', show: !!d.ko },
                        { key:'ryu', label:'RYU', icon:'🌊', custo:30,
                          efeito: '+3 CA/Ataque', desc: '30% Aura, 3 turnos', show: !!d.ryu },
                    ].filter(p => p.show);

                    const btns = PRINCIPIOS.map(p => {
                        const canAct = aura >= p.custo;
                        const col = canAct ? tc2 : '#374151';
                        return `<button onclick="window._activatePrincipio('${p.key}',${p.custo})"
                            style="display:flex;flex-direction:column;align-items:center;padding:8px 6px;border-radius:10px;border:1.5px solid ${col}44;background:${col}11;cursor:${canAct?'pointer':'not-allowed'};opacity:${canAct?1:0.5};min-width:56px;flex:1;transition:all .15s"
                            title="${p.desc}">
                            <span style="font-size:14px;margin-bottom:2px">${p.icon}</span>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:7px;color:${col};text-transform:uppercase">${p.label}</span>
                            <span style="font-size:7px;color:#6b7280;margin-top:1px">${p.custo>0?p.custo+'%':p.efeito}</span>
                            <span style="font-size:7px;color:${col};font-weight:700;margin-top:1px">${p.efeito}</span>
                        </button>`;
                    }).join('');

                    return `<div style="padding:8px 12px;border-bottom:1px solid #111827;background:#0a0f1a">
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
                    const attacksList = [{ nome: 'Ataque Desarmado', dano: '1d4', tipoDano: 'Impacto', tags: [] }, ...weapons];
                    const rows = attacksList.map(w => {
                        const tagsHtml = (w.tags || []).slice(0, 2).map(t => `<span style="font-size:7px;background:#111827;color:#6b7280;padding:1px 5px;border-radius:3px;border:1px solid #1f2937">${t}</span>`).join('');
                        const safeNome = w.nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                        const safeDano = w.dano.replace(/'/g, "\\'");
                        const safeTipo = (w.tipoDano || '').replace(/'/g, "\\'");
                        return `<div style="display:flex;align-items:center;gap:8px;background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:8px 10px;margin-bottom:6px">
                            <div style="flex:1;min-width:0">
                                <div style="font-size:11px;font-weight:700;color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.nome}</div>
                                <div style="display:flex;gap:3px;margin-top:2px;flex-wrap:wrap">${tagsHtml}</div>
                            </div>
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:#f87171;flex-shrink:0;margin:0 4px">${w.dano}</div>
                            <button onclick="openAttackModal('${safeNome}','${safeDano}','${safeTipo}')" style="flex-shrink:0;background:#ef444422;border:1px solid #ef444455;color:#f87171;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:900;cursor:pointer;letter-spacing:.5px">⚔️</button>
                        </div>`;
                    }).join('');
                    const weaponsSection = `<div style="margin:0 16px 20px"><div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;border-top:1px solid #1f2937;padding-top:12px">⚔️ Ataques</div>${rows}</div>`;
                    if (!state.attackModal) return weaponsSection;
                    // ── Modal de escolha FOR/DES ──────────────────────────────
                    const wm = state.attackModal;
                    const forMod = getMod((char.attributes.FOR || {}).value || 10);
                    const desMod = getMod((char.attributes.DES || {}).value || 10);
                    const pb2 = getProficiencyBonus(char.level);
                    const safeNome2 = wm.nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    const safeDano2 = wm.dano.replace(/'/g, "\\'");
                    const modalHtml = `<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onclick="closeAttackModal()">
                        <div style="background:#0d1117;border:2px solid #ef4444;border-radius:16px;padding:20px;width:80%;max-width:300px;box-shadow:0 0 40px #ef444440" onclick="event.stopPropagation()">
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${wm.nome}</div>
                            <div style="font-size:9px;color:#6b7280;margin-bottom:16px">Dano: <b style="color:#f87171">${wm.dano}</b> ${wm.tipoDano} Â· Qual modificador usar no ataque?</div>
                            <div style="display:flex;flex-direction:column;gap:8px">
                                <button onclick="pickAttackAttr('${safeNome2}','${safeDano2}','FOR')" style="width:100%;padding:13px;border-radius:10px;background:#ef444422;border:1px solid #ef444466;color:#f87171;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px">
                                    💪 FORÇA (${forMod >= 0 ? '+' : ''}${forMod}) Â· Ataque ${(forMod + pb2) >= 0 ? '+' : ''}${forMod + pb2}
                                </button>
                                <button onclick="pickAttackAttr('${safeNome2}','${safeDano2}','DES')" style="width:100%;padding:13px;border-radius:10px;background:#38bdf822;border:1px solid #38bdf866;color:#38bdf8;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px">
                                    💨 DESTREZA (${desMod >= 0 ? '+' : ''}${desMod}) Â· Ataque ${(desMod + pb2) >= 0 ? '+' : ''}${desMod + pb2}
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

                // Build hatsus list HTML
                let hatsuListHtml = '';
                if (savedHatsus.length > 0) {
                    const _tipoIconsMap = { hostil:'⚔️', suporte:'🛡️', versatil:'🌀', instantaneo:'⚡', longa_duracao:'⏳' };
    const tipoIcons = new Proxy(_tipoIconsMap, { get(t,k) { if(k in t) return t[k]; const parts=(k||'').split('+'); return parts.map(p=>t[p]||'✦').join(''); } });
                    hatsuListHtml = `<div style="width:100%;padding:0 4px;margin-bottom:16px">
                        <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center">⚡ Hatsus Criados</div>
                        ${savedHatsus.map((h, idx) => {
                            const pnMax = window.calcularPHBase ? window.calcularPHBase(h.nivel||1) : 6;
                            const efTotal = (h.efeitos||[]).length;
                            const rTotal  = (h.restricoes||[]).length;
                            return `<div onclick="openHatsuDetail(${idx})" style="background:#0a0f1a;border:2px solid ${catColor}44;border-radius:14px;padding:14px;margin-bottom:10px;position:relative;cursor:pointer;transition:border-color .2s,box-shadow .2s" onmouseover="this.style.borderColor='${catColor}99';this.style.boxShadow='0 0 16px ${catColor}22'" onmouseout="this.style.borderColor='${catColor}44';this.style.boxShadow='none'">
                                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
                                    <div style="flex:1;min-width:0">
                                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${catColor};text-transform:uppercase;letter-spacing:1px;line-height:1.2">${h.nome||'Sem nome'}</div>
                                        <div style="font-size:8px;color:#4b5563;margin-top:3px">${tipoIcons[h.tipo]||'✦'} ${h.tipo||'—'} Â· Nível ${h.nivel||'?'} Â· ${h.criadoEm||''}</div>
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
                                <div style="text-align:right;font-size:8px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px">Ver detalhes â€º</div>
                            </div>`;
                        }).join('')}
                    </div>`;
                }

                tabContent = `
                    <div class="p-4 h-full flex flex-col items-center" style="overflow-y:auto">
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
                                        <span style="font-size:8px;color:#6b7280">${pnUsedAll} P.N Hatsus Â· ${pnDominio} P.N Domínio</span>
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

                            const setDom = (key, val) => {
                                // inline call via onclick
                                return `(function(){
                                    var c=state.currentChar;
                                    if(!c.nenDominio)c.nenDominio={};
                                    c.nenDominio['${key}']=${val};
                                    saveCharacter(c);render(true);
                                })()`;
                            };

                            // Helper: render level selector (0-3) for fundamental principles
                            const fundamentalCard = (key, label, icon, desc, levelsData, reqCheck) => {
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
                                </div>`;
                            };

                            // Helper: advanced principle toggle
                            const advancedCard = (key, label, icon, desc, effect, req, reqMet) => {
                                const active = !!(d[key]);
                                const canBuy = !active && pnFree > 0 && reqMet;
                                const ac = active ? '#a78bfa' : '#374151';
                                return `<div style="background:#0a0f1a;border:1.5px solid ${active?'#a78bfa44':'#1f2937'};border-radius:12px;padding:10px;margin-bottom:6px;opacity:${reqMet||active?1:0.45}">
                                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                                        <div style="flex:1">
                                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                                                <span style="font-size:13px">${icon}</span>
                                                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:${active?'#a78bfa':'#d1d5db'};text-transform:uppercase">${label}</span>
                                                ${active?`<span style="font-size:7px;font-weight:900;padding:1px 5px;background:#a78bfa22;color:#a78bfa;border-radius:4px">✓ ATIVO</span>`:''}
                                            </div>
                                            <div style="font-size:8px;color:#6b7280;margin-bottom:4px">${desc}</div>
                                            ${req?`<div style="font-size:7px;color:${reqMet?'#4ade80':'#ef4444'};font-weight:700">Req: ${req}</div>`:''}
                                            ${active?`<div style="font-size:8px;color:#9ca3af;margin-top:4px;line-height:1.5">${effect}</div>`:''}
                                        </div>
                                        <button onclick="${active?setDom(key, false):setDom(key, true)}" ${(canBuy||active)?'':'disabled'}
                                            style="flex-shrink:0;padding:6px 10px;border-radius:8px;font-size:8px;font-weight:900;cursor:${(canBuy||active)?'pointer':'not-allowed'};border:1.5px solid ${active?'#ef444455':'#a78bfa44'};background:${active?'#ef444411':'#a78bfa11'};color:${active?'#f87171':'#a78bfa'}">
                                            ${active?'−1 P.N':'+1 P.N'}
                                        </button>
                                    </div>
                                </div>`;
                            };

                            const isReforco = char.class === 'REFORÇO' || char.class === 'INTENSIFICAÇÃO';
                            const tenLevels = isReforco ? [
                                '10% Aura + 1 Reação → +2 RD (Corte, Impacto, Explosão). Bloqueia intimidação por aura.',
                                '5% Aura + 1 Reação → +4 RD. Imune a proj. que igualem CA.',
                                '10% Aura + 1 Reação → +6 RD. Desbloqueia SHU.'
                            ] : [
                                '20% Aura + 1 Reação → +2 RD (Corte, Impacto, Explosão). Bloqueia intimidação por aura.',
                                '20% Aura + 1 Reação → +4 RD. Imune a proj. que igualem CA.',
                                '20% Aura + 1 Reação → +6 RD. Desbloqueia SHU.'
                            ];
                            const renLevels = [
                                '5% Aura + Ação Bônus → +1 Grau/Passo de dano, interação com NEN, proteção vs REN.',
                                '10% Aura + Ação Bônus → Básico + +3 em Intimidação/Arcanismo com REN. Desbloqueia EN.',
                                '10% Aura + Ação Bônus → Intermediário + 1×/dia +6 Intimidação sem gastar aura. Desbloqueia GYO.'
                            ];
                            const zetsuLevels = [
                                '3 rodadas → +5% Aura, +1 Reação, +3 Furtividade. (Dano crítico ao sofrer NEN)',
                                '2 rodadas → +10% Aura, +1 Reação, +3 Furtividade. Desbloqueia IN.',
                                '1 rodada → +10% Aura, +2 Reações, +6 Furtividade. Criaturas não-inteligentes te ignoram.'
                            ];

                            const ten = d.ten||0; const ren = d.ren||0; const zetsu = d.zetsu||0;

                            return `<div style="width:100%;padding:0 4px;margin-bottom:16px">
                                <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center">🔮 Domínio de NEN</div>

                                <div style="background:#060d1a;border:1px solid #1f2937;border-radius:10px;padding:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                                    <span style="font-size:8px;color:#6b7280;font-weight:700">P.N em Domínio</span>
                                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:12px;color:${tc2}">${pnDominio} / ${pnTotal}</span>
                                </div>

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ PRINCÍPIOS FUNDAMENTAIS</div>
                                ${fundamentalCard('ten','TEN — Proteção','🛡️','Envolver/Proteger. Ativa RD contra golpes físicos.',tenLevels,null)}
                                ${fundamentalCard('ren','REN — Controlar','💪','Praticar/Expandir. Aumenta grau de dano e intimidação.',renLevels,null)}
                                ${fundamentalCard('zetsu','ZETSU — Suprimir','🧠','Anular/Ocultar. Recupera aura e oculta presença.',zetsuLevels,null)}

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">🌟 PRINCÍPIOS AVANÇADOS</div>
                                ${advancedCard('en','EN — Envolver','🔵','Expansão do Ren em esfera de detecção (3m+). 10% Aura + 2 Reações.',
                                    '10% Aura + 2 Reações → detecta tudo a 3m. Ataque de reação contra quem entrar.',
                                    'REN 2 + TEN 1', ren>=2 && ten>=1)}
                                ${advancedCard('inp','IN — Ocultar','🌑','Oculta objetos de aura. 5% Aura por rodada.',
                                    '5% Aura → oculta item de aura até próximo turno. Com Zetsu Maestria: +1 rodada ou −5%.',
                                    'ZETSU 2', zetsu>=2)}
                                ${advancedCard('gyo','GYO — Focar','🧠','Concentra aura nos olhos/corpo. 10%/30% Aura.',
                                    '10% Aura → ver aura e oculto. 30% Aura → +3 FOR/DES/CON por 1 rodada.',
                                    'REN Maestria + ZETSU 2', ren>=3 && zetsu>=2)}
                                ${advancedCard('shu','SHU — Agregar','⚡','Envolve objetos em aura. 10% Aura.',
                                    '10% Aura → +1d4 Dano e CA em objeto (1m). Golpe considerado mirado sem ônus.',
                                    'TEN Maestria', ten>=3)}

                                <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">🌟 TÉCNICAS AVANÇADAS</div>
                                ${advancedCard('ken','KEN — Fortificar','🏰','Combina REN+TEN em proteção total. 30% Aura + 4 Reações.',
                                    '30% Aura + 4 Reações → CA dobrada por 2 rodadas. Pode triplicar gastando o dobro.',
                                    'TEN Maestria + REN Maestria', ten>=3 && ren>=3)}
                                ${advancedCard('ko','KO — Endurecer','🔥','Toda aura em um ponto. 30% Aura → dano ×3, CA −80%.',
                                    '30% Aura → triplica dano, mas CA cai 80% até próximo turno.',
                                    'REN Maestria + ZETSU Maestria + TEN 1', ren>=3 && zetsu>=3 && ten>=1)}
                                ${advancedCard('ryu','RYU — Fluir','🌊','Maestria total em tempo real. 30% Aura.',
                                    '30% Aura → múltiplos contra-ataques, +3 CA e Ataque por 3 turnos.',
                                    'TEN + REN + ZETSU Maestria', ten>=3 && ren>=3 && zetsu>=3)}
                            </div>`;
                        })()}

                        ${hatsuListHtml}

                        <div class="btn-hatsu-container" style="width:100%;padding:0 4px">
                            <button class="btn-hatsu" onclick="openHatsuCreator()">
                                <span class="text-xl">+</span> CRIAR HATSU
                            </button>
                        </div>
                    </div>`;
            } else if (state.activeTab === 'TRACOS') {
                const raceData = SYSTEM_DB.racas.find(r => r.nome === char.race); const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === char.background); let traitsHtml = `<div class="flex items-center gap-3 mb-2 mt-2"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="dna" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">${char.race}</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Características Raciais</p></div></div><div class="space-y-2 mb-6">`; 
                
                // Add Origin Display Here
                if (char.race === 'Formiga Quimera' && char.fagogenese) {
                    traitsHtml += `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}] mb-2"><h4 class="font-bold text-white text-xs mb-1">Origem da Fagogênese</h4><p class="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold text-neon-blue">${char.fagogenese}</p></div>`;
                }

                if (char.race === 'Formiga Quimera') { if (char.raceTraits && char.raceTraits.length > 0) { traitsHtml += char.raceTraits.map(tName => { 
                    // Handle "Trait: Detail" format
                    const parts = tName.split(':');
                    const baseTraitName = parts[0].trim();
                    const detail = parts.length > 1 ? parts[1].trim() : '';
                    const tData = raceData.caracteristicas.find(c => c.nome === baseTraitName); 
                    return `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}]"><h4 class="font-bold text-white text-xs mb-1">${tName}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${tData ? (tData.efeito || tData.mecanica) : 'Descrição não encontrada.'}</p></div>`; }).join(''); } } else { const fixedFeatures = [...(raceData.caracteristicas || [])]; if (fixedFeatures.length > 0) { traitsHtml += fixedFeatures.map(f => `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-2 border-l-[${themeColor}]"><h4 class="font-bold text-white text-xs mb-1">${f.nome}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${f.efeito || f.mecanica || ''}</p></div>`).join(''); } } traitsHtml += `</div>`; let bgHtml = ''; if (bgData && char.backgroundFeature) { const feature = bgData.caracteristicas.find(f => f.nome === char.backgroundFeature); bgHtml = `<div class="flex items-center gap-3 mb-2 border-t border-gray-800 pt-4"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="book-open" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">${char.background}</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Antecedente</p></div></div><div class="space-y-2 mb-6"><div class="bg-gray-900 border border-gray-800 p-3 rounded-xl border-l-4 border-l-[${themeColor}]"><h4 class="font-bold text-[${themeColor}] text-xs mb-1">${feature.nome}</h4><p class="text-[10px] text-gray-400 leading-relaxed">${feature.efeito}</p></div></div>`; }
                const otherTrainings = char.skills.filter(s => SYSTEM_DB.otherSkills.includes(s)); let otherSkillsHtml = ''; if (otherTrainings.length > 0) { const isOpen = state.sheetOtherSkillsOpen; otherSkillsHtml = `<div class="mt-2 border-t border-gray-800 pt-4"><div onclick="toggleSheetAccordion()" class="flex items-center justify-between cursor-pointer group"><div class="flex items-center gap-3 mb-2"><div class="bg-gray-800 p-2 rounded text-[${themeColor}]"><i data-lucide="hammer" size="20"></i></div><div><h3 class="font-bold text-white uppercase tracking-wider text-sm">Outros Treinamentos</h3><p class="text-[10px] text-gray-500 uppercase tracking-widest">Equipamentos, Linguagens e Ferramentas</p></div></div><div class="transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-gray-600 group-hover:text-gray-400'}"><i data-lucide="chevron-down" size="20"></i></div></div><div class="accordion-content ${isOpen ? 'open' : ''}"><div class="flex flex-wrap gap-2 pt-2">${otherTrainings.map(s => `<div class="bg-gray-900 border border-gray-800 p-3 rounded-xl inline-flex items-center gap-2 w-auto pr-4"><i data-lucide="check-circle" size="14" style="color: ${themeColor}" class="shrink-0"></i><span class="text-xs font-bold whitespace-nowrap" style="color: ${themeColor}">${s}</span></div>`).join('')}</div></div></div>`; }
                tabContent = `<div class="p-4 space-y-2">${traitsHtml}${bgHtml}${otherSkillsHtml}</div>`;
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
                        ${char.history.slice().reverse().map((h, index) => { const originalIndex = char.history.length - 1 - index; return `<div class="bg-gray-900/50 p-3 rounded-lg border-l-2 border-[${themeColor}] flex flex-col gap-1 group relative"><button onclick="copyToClipboard(${originalIndex})" class="absolute top-2 right-2 p-1.5 bg-gray-800 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all" title="Copiar para Discord"><i data-lucide="copy" size="14"></i></button><div class="flex justify-between text-[10px] text-gray-500 pr-8"><span>${h.time}</span><span class="uppercase font-bold tracking-wider text-gray-400">${h.label}</span></div><div class="flex justify-between items-center mt-1"><div class="flex flex-col"><span class="text-xs text-gray-500">Resultado</span><span class="text-2xl font-bold ${h.dice===20?'text-neon-yellow':h.dice===1?'text-neon-red':'text-white'} font-display">${h.total}</span></div><div class="text-right"><span class="text-xs text-gray-600 block">D20 + Mod</span><span class="text-gray-300 font-mono text-sm">[${h.dice}] ${h.mod>=0?'+':''}${h.mod}</span></div></div></div>`; }).join('')}
                    </div>`;

                // ── Sub-aba DISCORD ────────────────────────────────────────────
                const _webhookListHtml = _whs.length === 0
                    ? `<div style="text-align:center;color:#4b5563;font-style:italic;padding:32px 0;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhum webhook cadastrado.<br><span style="font-size:10px;color:#374151">Adicione um abaixo.</span></div>`
                    : _whs.map((w, i) => {
                        const isDefault = _defWh === i;
                        return `<div style="background:#111827;border:2px solid ${isDefault ? '#f59e0b' : '#1f2937'};border-radius:12px;padding:12px 14px;margin-bottom:8px;position:relative">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                                <div style="flex:1;min-width:0">
                                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                                        ${isDefault ? '<span style="font-size:9px;background:#92400e;color:#fbbf24;border-radius:4px;padding:2px 6px;font-weight:900;text-transform:uppercase;letter-spacing:.05em">â­ Padrão</span>' : ''}
                                        <span style="font-weight:900;color:#fff;font-size:12px">${w.name}</span>
                                    </div>
                                    <div style="font-size:9px;color:#4b5563;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px">${w.url.replace(/^https:\/\/discord\.com\/api\/webhooks\//, 'discord.com/…/')}</div>
                                </div>
                                <div style="display:flex;gap:6px;flex-shrink:0">
                                    <button onclick="setDefaultWebhook(${i})" title="${isDefault ? 'Remover padrão' : 'Marcar como padrão'}" style="padding:6px 8px;border-radius:8px;border:2px solid ${isDefault ? '#f59e0b' : '#374151'};background:${isDefault ? '#92400e' : 'transparent'};color:${isDefault ? '#fbbf24' : '#6b7280'};cursor:pointer;font-size:13px;line-height:1">â­</button>
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
                </div>` : `<div style="background:#0d1117;border:2px dashed #1f2937;border-radius:12px;padding:12px;margin-top:12px;text-align:center"><div style="font-size:9px;color:#4b5563;font-style:italic">Somente administradores podem adicionar webhooks.</div></div>`;

                const _discordHtml = `${_statusHtml}${_webhookListHtml}${_addFormHtml}`;

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
                const catColors = { 'CURTA DURAÇÃO':'#fbbf24', 'LONGA DURAÇÃO':'#f87171', 'PERMANENTE LEVE':'#a78bfa', 'PERMANENTE PESADO':'#ff4df7' };

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
                    <div class="flex-1 overflow-y-auto custom-scrollbar pb-4">
                        ${activeHtml}
                        ${resolvedHtml}
                    </div>
                </div>`;
            }

            const nextXp = char.xp_next || 100;
            const xpPct = Math.min(100, (char.xp / nextXp) * 100);
            const bgImage = char.imageUrl ? `background-image: url('${char.imageUrl}');` : '';

            container.innerHTML = `
            <div class="flex flex-col h-full bg-gray-950">
                ${state.activeTab !== 'INV' ? `
                <div class="flex-1 overflow-y-auto custom-scrollbar pb-20 relative">
                    <div onclick="document.getElementById('char-image-upload').click()" class="relative h-64 w-full overflow-hidden cursor-pointer group bg-gray-900 border-b border-gray-800">
                        <input type="file" id="char-image-upload" accept="image/*" class="hidden" onchange="uploadCharacterImage(this)">
                        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 group-hover:scale-105" style="${bgImage}"></div>
                        ${!char.imageUrl ? `<div class="absolute inset-0 bg-[${themeColor}]/5 flex items-center justify-center"><i data-lucide="image-plus" size="48" class="text-[${themeColor}]/30"></i></div>` : ''}
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
                        <button onclick="event.stopPropagation(); state.view='LIST'; render()" class="absolute top-6 left-6 text-white/80 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 z-20 transition-all hover:bg-black/60"><i data-lucide="arrow-left" size="20"></i></button>
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
                            </div>
                        </div>
                    </div>
                    <div class="relative">${tabContent}</div>
                </div>` : 
                `<div class="flex-1 overflow-hidden relative flex flex-col">
                    <div class="absolute top-4 left-4 z-50">
                        <button onclick="event.stopPropagation(); state.view='LIST'; render()" class="text-white/80 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 transition-all hover:bg-black/60"><i data-lucide="arrow-left" size="20"></i></button>
                    </div>
                    ${tabContent}
                </div>`
                }
                ${renderRollModeModalHtml()}
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
        function selectBackground(bgName) { if (state.tempChar.background !== bgName) { state.tempChar.background = bgName; state.tempChar.backgroundFeature = null; } render(true); }
        function selectBackgroundFeature(featureName) { state.tempChar.backgroundFeature = featureName; }
        function toggleInclination(type, name, value) { const list = state.tempChar.inclinations[type]; const existsIdx = list.findIndex(i => i.nome === name); if (existsIdx >= 0) { list.splice(existsIdx, 1); } else { list.push({ nome: name, [type === 'positive' ? 'custo' : 'valor']: value }); } render(true); }
        function selectRace(raceName) { state.tempChar.race = raceName; state.allocations = {}; render(true); }
        function toggleRaceTrait(traitName) { const list = state.tempChar.raceTraits || []; const idx = list.indexOf(traitName); if (idx >= 0) { list.splice(idx, 1); if(state.tempChar.traitDetails && state.tempChar.traitDetails[traitName]) { delete state.tempChar.traitDetails[traitName]; } } else { if (list.length >= 3) { alert("Você só pode escolher até 3 características."); return; } list.push(traitName); } state.tempChar.raceTraits = list; render(true); }
        function toggleCreatorSkill(skill, type = 'main') { const list = type === 'main' ? state.tempChar.skills : state.tempChar.otherSkills; const bgSkillsText = state.tempChar.background ? SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background).proficiencias : ""; const isBgSkill = type === 'main' && bgSkillsText.includes(skill); let limit = type === 'main' ? 5 : 4; if (type === 'other') { if (bgSkillsText.includes("Kit") || bgSkillsText.includes("Ferramenta")) { limit = 5; } } const idx = list.indexOf(skill); if (idx >= 0) { list.splice(idx, 1); } else { if (!isBgSkill) { const currentManualCount = list.filter(s => !bgSkillsText.includes(s)).length; if (currentManualCount >= limit) { alert(`Limite de ${limit} escolhas manuais atingido.`); return; } } list.push(skill); } render(true); }
        // ── Gerenciamento de Webhooks do Discord ─────────────────────────────
        const _WEBHOOKS_KEY = 'hxhrpg_webhooks';
        function loadWebhooks() { try { return JSON.parse(localStorage.getItem(_WEBHOOKS_KEY) || '[]'); } catch { return []; } }
        function saveWebhooks(list) { localStorage.setItem(_WEBHOOKS_KEY, JSON.stringify(list)); }
        function initWebhooks() {
            // Migra o webhook original caso ainda não haja nada salvo
            if (!localStorage.getItem(_WEBHOOKS_KEY)) {
                saveWebhooks([{ name: 'Mesa Principal', url: 'https://discord.com/api/webhooks/1488630085023170671/n6afq3FqpQP_H-fPUMmWbfHufnp3LLqhlYk4zrSm9caYWz1k8JXUjF6rD8KnUz9-CwrK' }]);
            }
        }
        function addWebhook(name, url) {
            name = (name || '').trim(); url = (url || '').trim();
            if (!name || !url) return;
            const list = loadWebhooks();
            list.push({ name, url });
            saveWebhooks(list);
            render(true);
        }
        function deleteWebhook(idx) {
            const list = loadWebhooks();
            list.splice(idx, 1);
            saveWebhooks(list);
            if (state.selectedWebhook >= list.length) state.selectedWebhook = Math.max(0, list.length - 1);
            if (state.defaultWebhook === idx) state.defaultWebhook = -1;
            else if (state.defaultWebhook > idx) state.defaultWebhook--;
            render(true);
        }
        function setDefaultWebhook(idx) { state.defaultWebhook = (state.defaultWebhook === idx) ? -1 : idx; render(true); }
        function setWebhook(idx) { state.selectedWebhook = idx; render(true); }
        function setDadosSubTab(tab) { state.dadosSubTab = tab; render(true); }
        function getActiveWebhookUrl() {
            const list = loadWebhooks();
            if (!list.length) return null;
            const idx = state.defaultWebhook >= 0 ? state.defaultWebhook : (state.selectedWebhook < list.length ? state.selectedWebhook : 0);
            return list[idx]?.url || list[0].url;
        }
        // ─────────────────────────────────────────────────────────────────────
        function rollDiceExpr(expr) {
            const match = (expr || '').match(/^(\d+)d(\d+)$/);
            if (!match) return { rolls: [1], total: 1 };
            const n = parseInt(match[1]), d = parseInt(match[2]);
            const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * d) + 1);
            return { rolls, total: rolls.reduce((a, b) => a + b, 0) };
        }
        function rollHatsuDamage(mode) {
            const rs = window._hatsuRollState;
            if (!rs || !rs.dice || !rs.hasBaseDmg) { alert('Este Hatsu não possui dano calculável.'); return; }
            const char = state.currentChar;
            const effectiveMode = mode || state.rollMode;
            const mod = getMod((char.attributes[rs.attr] || {}).value || 10);
            const dmgResult = rollDiceExpr(rs.dice);

            // Separar extras: valores fixos (somam ao total) vs dados (linha extra)
            let flatBonus = 0;
            const flatParts = [];   // ex: ['+2', '+3'] → para exibir na fórmula
            const extraLines = [];  // dados rolados separadamente

            (rs.sanExtras || []).forEach(e => {
                const clean = e.dado.replace(/\/\w+$/, ''); // remove /rod etc
                const num = parseInt(clean);
                if (!isNaN(num)) { flatBonus += num; flatParts.push(clean); }
            });
            (rs.dmgExtras || []).forEach(e => {
                if (e.dado === '(contínuo)') return;
                const rollable = /^\+?\d+d\d+$/.test(e.dado);
                if (rollable) {
                    const er = rollDiceExpr(e.dado.replace(/^\+/, ''));
                    extraLines.push(`💥 ${e.tipo}: [${er.rolls.join('+')}] = **${er.total}**`);
                } else {
                    const clean = e.dado.replace(/\/\w+$/, '');
                    const num = parseInt(clean);
                    if (!isNaN(num)) { flatBonus += num; flatParts.push(clean); }
                }
            });

            const total = dmgResult.total + mod + flatBonus;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const modeLabel = effectiveMode === 'NORMAL' ? '' : ` (${effectiveMode.charAt(0) + effectiveMode.slice(1).toLowerCase()})`;
            char.history.push({ time, label: `⚡ ${rs.nome} (${rs.attr})${modeLabel}`, dice: dmgResult.rolls.join(', '), mod: mod + flatBonus, total });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);

            // Fórmula: "2d10 + PRE + 5" com os bônus fixos somados
            const flatStr = flatParts.length > 0 ? ` + ${flatBonus}` : '';
            const allModStr = (mod !== 0 || flatBonus !== 0)
                ? ` ${(mod + flatBonus) >= 0 ? '+' : ''}${mod + flatBonus}`
                : '';
            const formula = `${rs.dice} + ${rs.attr}${flatStr}`;
            const extrasText = extraLines.length > 0 ? '\n' + extraLines.join('\n') : '';

            // ── Rolagem de Ataque ─────────────────────────────────────────────
            let attackLine = '';
            if (rs.hasAttack) {
                const nivel = rs.nivel || parseInt(char.level) || 1;
                const pb = getProficiencyBonus(nivel);
                // Segredo Mortal: força vantagem se modo for Normal
                const attackMode = (rs.acertoVantagem && effectiveMode === 'NORMAL') ? 'VANTAGEM' : effectiveMode;
                const attackRoll = getRollResult(attackMode);
                const acertoBonus = rs.acertoBonus || 0;
                const attackTotal = attackRoll.total + mod + pb + acertoBonus;
                const isCrit = attackRoll.dice.includes(20);
                const isFumble = attackRoll.dice.length === 1 && attackRoll.dice[0] === 1;
                const critSuffix = isCrit ? ' 🎯 **CRÍTICO!**' : isFumble ? ' 💀 **FALHA CRÍTICA!**' : '';
                let attackModStr = `+${mod + pb + acertoBonus}`;
                if ((mod + pb + acertoBonus) < 0) attackModStr = `${mod + pb + acertoBonus}`;
                const attackModeLabel = attackMode !== 'NORMAL' ? ` (${attackMode.charAt(0) + attackMode.slice(1).toLowerCase()})` : '';
                attackLine = `\nAtaque${attackModeLabel}: [${attackRoll.dice.join(', ')}] ${attackModStr} = **${attackTotal}**${critSuffix}`;
            }
            // ── Fim rolagem de ataque ─────────────────────────────────────────

            const content = `⚡ **${char.name}** usou **${rs.nome}**${modeLabel}${attackLine}\nDano: [${dmgResult.rolls.join('+')}]${allModStr} = **${total}** (${formula})${extrasText}`;
            fetch(getActiveWebhookUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).catch(() => {});
            if (state.activeTab !== 'DADOS') state.unreadRolls = true;
        }
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
            render(true);
        }
        function executePendingRoll(mode) {
            const pr = state.pendingRoll;
            state.pendingRoll = null;
            state.rollMode = mode; // persiste o último modo usado
            if (!pr) return;
            if (pr.type === 'dice')   rollDice(pr.a1, pr.a2, mode);
            else if (pr.type === 'skill')  rollSkill(pr.a1, pr.a2, mode);
            else if (pr.type === 'attack') rollAttack(pr.a1, pr.a2, pr.a3, mode);
            else if (pr.type === 'hatsu')  rollHatsuDamage(mode);
        }
        function cancelPendingRoll() { state.pendingRoll = null; render(true); }
        function renderRollModeModalHtml() {
            if (!state.pendingRoll) return '';
           const MODES = [
                { id: 'NORMAL',      label: 'Normal',      icon: '🎲', desc: '1d20',       bg: '#1f2937', col: '#9ca3af' },
                { id: 'VANTAGEM',    label: 'Vantagem',    icon: '⬆️', desc: '2d20 maior',  bg: '#14532d', col: '#4ade80' },
                { id: 'DESVANTAGEM', label: 'Desvantagem', icon: '⬇️', desc: '2d20 menor',  bg: '#7f1d1d', col: '#f87171' },
                { id: 'ÊNFASE',      label: 'Ênfase',      icon: '🎯', desc: '2d20 ≈ 10',   bg: '#1e1b4b', col: '#a78bfa' },
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
            return `<div class="fixed inset-0 z-[200] flex items-end justify-center" style="background:rgba(0,0,0,0.75);backdrop-filter:blur(4px)" onclick="cancelPendingRoll()">
                <div style="background:#0d1117;border-radius:20px 20px 0 0;border:1px solid #1f2937;border-bottom:none;padding:20px 16px 32px;width:100%;max-width:440px" onclick="event.stopPropagation()">
                    <div style="width:40px;height:4px;background:#374151;border-radius:2px;margin:0 auto 16px"></div>
                    ${_whPickerHtml}
                    <div style="font-size:9px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;text-align:center">🎲 Modo de Rolagem</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                        ${MODES.map(m => `<button onclick="executePendingRoll('${m.id}')"
                            style="display:flex;flex-direction:column;align-items:center;padding:14px 8px;border-radius:12px;background:${m.bg};border:2px solid ${m.col}44;color:${m.col};cursor:pointer;font-family:'Rajdhani',sans-serif">
                            <span style="font-size:20px;margin-bottom:4px">${m.icon}</span>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;letter-spacing:1px">${m.label}</span>
                            <span style="font-size:8px;opacity:.6;margin-top:2px">${m.desc}</span>
                        </button>`).join('')}
                    </div>
                    <button onclick="cancelPendingRoll()" style="width:100%;padding:10px;border-radius:10px;background:transparent;border:1px solid #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">Cancelar</button>
                </div>
            </div>`;
        }
        function rollAttack(weaponName, diceExpr, attrKey, mode) {
            const char = state.currentChar;
            const mod = getMod((char.attributes[attrKey] || {}).value || 10);
            const pb = getProficiencyBonus(char.level);
            const attackRoll = getRollResult(mode || state.rollMode);
            const attackTotal = attackRoll.total + mod + pb;
            const dmgResult = rollDiceExpr(diceExpr);
            const dmgTotal = dmgResult.total + mod;
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            char.history.push({ time, label: `⚔️ ${weaponName} (${attrKey})`, dice: attackRoll.dice.join(', '), mod: mod + pb, total: attackTotal });
            if (char.history.length > 50) char.history.shift();
            saveCharacter(char);
            const isCrit = attackRoll.dice.includes(20);
            const isFumble = attackRoll.dice.length === 1 && attackRoll.dice[0] === 1;
            const suffix = isCrit ? ' 🎯 **CRÍTICO!**' : isFumble ? ' 💀 **FALHA CRÍTICA!**' : '';
            const content = `⚔️ **${char.name}** atacou com **${weaponName}**\nAtaque: [${attackRoll.dice.join(', ')}] +${mod + pb} = **${attackTotal}**${suffix}\nDano: [${dmgResult.rolls.join('+')}] +${mod} = **${dmgTotal}** (${diceExpr} + ${attrKey})`;
            fetch(getActiveWebhookUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).catch(() => {});
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
        function rollDice(attrName, mod, mode) { const roll = getRollResult(mode || state.rollMode); const total = roll.total + mod; const entry = { time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), label: `${attrName} (${roll.label})`, dice: roll.dice.join(', '), mod: mod, total: total }; state.currentChar.history.push(entry); if (state.currentChar.history.length > 50) state.currentChar.history.shift(); saveCharacter(state.currentChar); state.rollResult = { name: attrName, total: total, diceVal: roll.total, mod: mod, label: roll.label }; if (state.activeTab !== 'DADOS') state.unreadRolls = true; sendToDiscord(`${attrName} (${roll.label})`, roll.dice, mod, total, state.currentChar.name || 'Personagem'); render(true); }
        function rollSkill(skillName, attrKey, mode) { const char = state.currentChar; const mod = getMod(char.attributes[attrKey].value); const isTrained = char.skills.includes(skillName); const isExpert = (char.expertise || []).includes(skillName); const pb = getProficiencyBonus(char.level); let totalMod = mod; if (isExpert) { totalMod += (pb * 2); } else if (isTrained) { totalMod += pb; } const roll = getRollResult(mode || state.rollMode); const total = roll.total + totalMod; const entry = { time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), label: `${skillName} ${isExpert ? "(Exp)" : ""} (${roll.label})`, dice: roll.dice.join(', '), mod: totalMod, total: total }; state.currentChar.history.push(entry); if (state.currentChar.history.length > 50) state.currentChar.history.shift(); saveCharacter(state.currentChar); state.rollResult = { name: skillName, total: total, diceVal: roll.total, mod: totalMod, label: roll.label }; if (state.activeTab !== 'DADOS') state.unreadRolls = true; sendToDiscord(`${skillName}${isExpert ? ' (Exp)' : ''} (${roll.label})`, roll.dice, totalMod, total, char.name || 'Personagem'); render(true); }
        function closeRollModal() { state.rollResult = null; render(true); }
        function copyToClipboard(idx) { const h = state.currentChar.history[idx]; if(!h) return; const text = `**${h.label}**\nRolagem: [${h.dice}] ${h.mod>=0?'+':''}${h.mod} = **${h.total}**`; navigator.clipboard.writeText(text).then(() => { const btn = document.activeElement; if(btn && btn.tagName === 'BUTTON') { const originalHTML = btn.innerHTML; btn.innerHTML = '<i data-lucide="check" size="14"></i>'; btn.classList.add('text-green-500'); setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('text-green-500'); lucide.createIcons(); }, 1000); } }); }
        function getRollResult(mode) { const r1 = Math.floor(Math.random() * 20) + 1; const r2 = Math.floor(Math.random() * 20) + 1; if (mode === 'NORMAL') return { total: r1, dice: [r1], label: 'Normal' }; if (mode === 'VANTAGEM') return { total: Math.max(r1, r2), dice: [r1, r2], label: 'Vantagem' }; if (mode === 'DESVANTAGEM') return { total: Math.min(r1, r2), dice: [r1, r2], label: 'Desvantagem' }; if (mode === 'ÊNFASE') { const dist1 = Math.abs(r1 - 10.5); const dist2 = Math.abs(r2 - 10.5); return { total: dist1 > dist2 ? r1 : r2, dice: [r1, r2], label: 'Ênfase' }; } return { total: r1, dice: [r1], label: 'Normal' }; }
        function buyStat(attr, delta) { lockAttributeMethod(); const current = state.tempChar.attributes[attr]; const next = current + delta; if (next >= 1 && next <= 30) { const currentCost = calculateTotalCost(state.tempChar.attributes); const costDiff = getPointBuyCost(next) - getPointBuyCost(current); const MAX = 20; if (costDiff > 0 && (currentCost + costDiff > MAX)) { const totalEl = document.getElementById('buy-total'); totalEl.classList.add('text-red-500', 'shake'); setTimeout(() => totalEl.classList.remove('shake'), 500); return; } state.tempChar.attributes[attr] = next; render(true); } }
        function setAttrTab(mode) { if (state.attrMethodLocked) return; state.attrTab = mode; state.selectedPoolIdx = null; if(mode === 'COMPRA') { Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = 10); state.attrPool = []; } else { Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); state.attrPool = []; } render(true); }
        function lockAttributeMethod() { if(!state.attrMethodLocked) { state.attrMethodLocked = true; render(true); } }
        function rollAllStats() { lockAttributeMethod(); Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); let newPool = []; for(let k=0; k<6; k++) { let dice = []; for(let i=0; i<4; i++) { let d = Math.floor(Math.random()*6)+1; if(d === 1) d = Math.floor(Math.random()*6)+1; dice.push(d); } dice.sort((a,b) => b-a); newPool.push(dice[0] + dice[1] + dice[2]); } state.attrPool = newPool.sort((a,b) => b-a); render(true); }
        function applyStandardArray() { lockAttributeMethod(); Object.keys(state.tempChar.attributes).forEach(k => state.tempChar.attributes[k] = null); state.attrPool = [15, 14, 13, 12, 10, 8]; render(true); }
        function selectPoolItem(idx) { if (state.selectedPoolIdx === idx) state.selectedPoolIdx = null; else state.selectedPoolIdx = idx; render(true); }
        function assignToSlot(attr) { if (state.selectedPoolIdx === null) return; if (state.tempChar.attributes[attr] !== null) state.attrPool.push(state.tempChar.attributes[attr]); const val = state.attrPool[state.selectedPoolIdx]; state.tempChar.attributes[attr] = val; state.attrPool.splice(state.selectedPoolIdx, 1); state.attrPool.sort((a,b) => b-a); state.selectedPoolIdx = null; render(true); }
        function returnToPool(attr) { const val = state.tempChar.attributes[attr]; if (val !== null) { state.attrPool.push(val); state.attrPool.sort((a,b) => b-a); state.tempChar.attributes[attr] = null; render(true); } }
        function applyBackgroundProficiencies() { if (!state.tempChar.background) return; const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background); if (!bgData) return; const profText = bgData.proficiencias; SYSTEM_DB.skills.forEach(skill => { if (profText.includes(skill) && !state.tempChar.skills.includes(skill)) { state.tempChar.skills.push(skill); } }); if (profText.includes("Kit") || profText.includes("Ferramenta")) { if (!state.tempChar.otherSkills.includes("Kits")) { state.tempChar.otherSkills.push("Kits"); } } }
        function nextCreatorStep() { if (state.creatorStep === 0 && !state.tempChar.name) { alert("Dê um nome ao personagem!"); return; } if (state.creatorStep === 2) { if (state.attrTab === 'COMPRA') { const cost = calculateTotalCost(state.tempChar.attributes); if (cost > 20) { alert("Você excedeu o limite de pontos de compra (20)!"); return; } } else { const values = Object.values(state.tempChar.attributes); if (values.some(v => v === null)) { alert("Aloque todos os valores do pool para os atributos!"); return; } } } if (state.creatorStep === 3) { if (!state.tempChar.background) { alert("Selecione um Antecedente!"); return; } if (!state.tempChar.backgroundFeature) { alert("Escolha uma característica do Antecedente!"); return; } } if (state.creatorStep === 4) { const posCost = state.tempChar.inclinations.positive.reduce((acc, i) => acc + i.custo, 0); const negVal = state.tempChar.inclinations.negative.reduce((acc, i) => acc + i.valor, 0); const sortedPos = [...state.tempChar.inclinations.positive].sort((a,b) => b.custo - a.custo); const freeCost = sortedPos.length > 0 ? sortedPos[0].custo : 0; const paidCost = Math.max(0, posCost - freeCost); const balance = negVal - paidCost; if (balance < 0) { alert("Suas inclinações não estão balanceadas! Adicione negativas ou remova positivas extras."); return; } if (negVal > 10) { alert("O máximo de compensação negativa é 10 pontos."); return; } applyBackgroundProficiencies(); } if (state.creatorStep === 5) { const bgSkillsText = state.tempChar.background ? SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background).proficiencias : ""; const currentManualCount = state.tempChar.skills.filter(s => !bgSkillsText.includes(s)).length; if (currentManualCount !== 5) { alert(`Você deve selecionar exatamente 5 perícias manuais (além das concedidas pelo antecedente). Atualmente: ${currentManualCount}`); return; } } state.creatorStep++; render(); }
        function finishCreator() { Object.entries(state.allocations).forEach(([key, val]) => { state.tempChar.attributes[key] += val; }); const bgData = SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background); const initialInv = bgData ? bgData.equipamento.map(i => ({ name: i, qty: 1 })) : []; const raceData = SYSTEM_DB.racas.find(r => r.nome === state.tempChar.race); const finalAttrs = { ...state.tempChar.attributes }; if (raceData && typeof raceData.aumento_atributo === 'object') { const req = getBonusRequirements(state.tempChar.race); if (!req) { Object.entries(raceData.aumento_atributo).forEach(([key, val]) => { if (finalAttrs[key] !== undefined) { finalAttrs[key] += val; } }); } } const modCon = getMod(finalAttrs.CON || 10); const modInt = getMod(finalAttrs.INT || 10); const modSab = getMod(finalAttrs.SAB || 10); const hasGiantBody = state.tempChar.inclinations.positive.some(i => i.nome === "Corpo de Gigante"); let hpInitial = 15 + modCon; if (hasGiantBody) hpInitial += 5; 
            // Merge traits with details
            const mergedTraits = (state.tempChar.raceTraits || []).map(t => { const detail = state.tempChar.traitDetails && state.tempChar.traitDetails[t]; return detail ? `${t}: ${detail}` : t; });
            const newChar = { id: generateId(), name: state.tempChar.name, class: state.tempChar.class, race: state.tempChar.race, background: state.tempChar.background, backgroundFeature: state.tempChar.backgroundFeature, inclinations: state.tempChar.inclinations, level: 0, xp: 0, xp_next: 50, money: 0, alignment: 'Neutro', playerName: '', attributes: {}, skills: [...state.tempChar.skills, ...state.tempChar.otherSkills], expertise: [], raceTraits: mergedTraits, vitals: { hp: hpInitial, hpMax: hpInitial, aura: 100, auraMax: 100, san: 100, sanMax: 100, rdm: 0, ca: 10 + modCon, rea: 7 + modSab, desl: 9 }, inventory: initialInv, history: [], imageUrl: null, bio: { personality: '', history: '', organizations: '', enemies: '', allies: '' }, fagogenese: state.tempChar.fagogenese || null, afinidade: state.tempChar.afinidade || null, genialidade: state.tempChar.genialidade || null, genialidadeRoll: state.tempChar.genialidadeRoll || null }; Object.entries(finalAttrs).forEach(([k,v]) => { const hasSave = state.tempChar.skills.includes(`TR de ${k}`); newChar.attributes[k] = { value: v || 10, save: hasSave }; }); saveCharacter(newChar); state.currentChar = newChar; state.view = 'SHEET'; state.activeTab = 'FICHA'; render(); }
        function setTab(tab) { state.activeTab = tab; if(tab === 'DADOS') state.unreadRolls = false; render(true); }
        function setRollMode(mode) { state.rollMode = mode; render(true); }
        function updateSheetAttr(key, delta) { state.currentChar.attributes[key].value += delta; saveCharacter(state.currentChar); render(true); }
        function toggleAttrPopup(key) { if (state.openAttrPopup === key) state.openAttrPopup = null; else state.openAttrPopup = key; render(true); }
        function handleAttributeClick(key) { if (state.clickTimer) { clearTimeout(state.clickTimer); state.clickTimer = null; const attr = state.currentChar.attributes[key]; openRollModeModal('dice', key, getMod(attr.value)); } else { state.clickTimer = setTimeout(() => { state.clickTimer = null; toggleAttrPopup(key); }, 250); } }
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
            if (type === 'aura') v.aura += delta;
            if (type === 'rea') { if (v.rea === undefined) v.rea = 7 + getMod(char.attributes.SAB.value); v.rea += delta; }
            if (type === 'san') {
                if (!v.sanMax) v.sanMax = 100;
                const prevSan = v.san;
                const prevPct = Math.round((prevSan / v.sanMax) * 100);
                v.san = Math.min(v.sanMax, v.san + delta); // cap at sanMax
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

            // Talento para Proficiência de NEN: multiplicadores de XP
            const genTier = char.genialidade;
            const xpMultiplier = genTier === 'Ultimate' ? 2 : (genTier === 'Gênio' ? 1.5 : 1);
            const finalGained = xpMultiplier > 1 ? Math.floor(gained * xpMultiplier) : gained;

            let xp = (char.xp || 0) + finalGained;
            const xpTable = SYSTEM_DB.xpTable; // [50,150,350,500,800,1000,1500,2500,3200,4000,5000,6500]

            // Verifica se passou de nível (pode passar mais de um)
            let newLevel = char.level;
            let nextXp = char.xp_next || xpTable[0];

            while (xp >= nextXp && newLevel < 12) {
                xp -= nextXp;
                newLevel++;
                nextXp = xpTable[Math.min(newLevel, xpTable.length - 1)] || 9999;
            }

            char.xp = xp;
            char.xp_next = nextXp;

            if (newLevel > char.level) {
                const levelsGained = newLevel - char.level;
                char.level = newLevel;
                saveCharacter(char);
                render(true);
                window.openLevelUpModal(levelsGained, xpMultiplier > 1, finalGained);
            } else {
                saveCharacter(char);
                render(true);
                if (xpMultiplier > 1) window._showXpToast(`+${finalGained} XP ${xpMultiplier === 2 ? ' 👑 (×2 Ultimate)' : ' ✨ (×1.5 Gênio)'}`);
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

        // ── Modal de Level Up com dado de vida ────────────────────────────────
        window.openLevelUpModal = function(levelsGained = 1, isGenius = false, xpGained = 0) {
            const char = state.currentChar;
            const newLevel = char.level;
            const hitDiceData = HIT_DICE[char.class] || { dado: 'd8', faces: 8, media: 5 };
            const conMod = getMod(char.attributes?.CON?.value || 10);
            const hasGiantBody = (char.inclinations?.positive || []).some(i => i.nome === 'Corpo de Gigante');
            const giantBonus = hasGiantBody ? 3 : 0;
            const mediaTotal = hitDiceData.media + conMod + giantBonus;
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';

            const overlay = document.createElement('div');
            overlay.id = 'levelup-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:24px;width:100%;max-width:370px;box-shadow:0 0 60px ${tc}44;text-align:center">
                    <!-- Cabeçalho -->
                    <div style="font-size:28px;margin-bottom:4px">🏆</div>
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:16px;color:${tc};text-transform:uppercase;letter-spacing:3px;text-shadow:0 0 12px ${tc}88">Nível ${newLevel}!</div>
                    <div style="font-size:10px;color:#6b7280;margin-top:4px;margin-bottom:16px">${levelsGained > 1 ? `+${levelsGained} níveis ganhos de uma vez!` : 'Você subiu de nível!'}</div>
                    ${isGenius ? `<div style="font-size:9px;color:#fbbf24;background:#fbbf2411;border:1px solid #fbbf2433;border-radius:8px;padding:6px 12px;margin-bottom:14px">✨ Gênio: +${xpGained} XP (1.5×)</div>` : ''}
                    <!-- Dado de vida -->
                    <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px">
                        <div style="font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">🎲 Dado de Vida — ${hitDiceData.dado} (${char.class})</div>
                        <div id="lv-dice-result" style="font-family:Orbitron,sans-serif;font-size:40px;font-weight:900;color:#fff;margin-bottom:4px;min-height:52px;line-height:1">—</div>
                        <div id="lv-dice-breakdown" style="font-size:9px;color:#6b7280;min-height:16px"></div>
                        <div style="display:flex;gap:8px;margin-top:12px">
                            <button id="lv-roll-btn" onclick="window._lvRoll()"
                                style="flex:1;padding:11px;border-radius:10px;background:#7c3aed;border:none;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;transition:all .2s">
                                🎲 Rolar ${hitDiceData.dado}
                            </button>
                            <button id="lv-media-btn" onclick="window._lvPickMedia()"
                                style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#d1d5db;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px;transition:all .2s">
                                📊 Média (${mediaTotal})
                            </button>
                        </div>
                    </div>
                    <!-- Sanidade recovery preview -->
                    ${calcRDM(char) > 0 ? `<div style="background:#0a0f1a;border:1px solid #1f293788;border-radius:10px;padding:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
                        <span style="font-size:9px;color:#9ca3af;font-weight:700">🔮 Recuperação de Sanidade</span>
                        <span style="font-family:Orbitron,sans-serif;font-weight:900;font-size:14px;color:#c084fc">+${calcRDM(char)}</span>
                    </div>` : ''}
                    <!-- Botão confirmar (desabilitado até rolar/escolher) -->
                    <button id="lv-confirm-btn" disabled onclick="window._lvConfirm()"
                        style="width:100%;padding:13px;border-radius:10px;background:#374151;border:none;color:#6b7280;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:not-allowed;letter-spacing:1px;transition:all .2s">
                        Confirmar Nível ${newLevel}
                    </button>
                </div>`;
            document.body.appendChild(overlay);

            // State interno do modal
            overlay._hitGain = null;
            overlay._faces = hitDiceData.faces;
            overlay._rolled = null;

            window._lvRoll = function() {
                const roll = Math.floor(Math.random() * overlay._faces) + 1;
                overlay._rolled = roll;
                const total = roll + conMod + giantBonus;
                overlay._hitGain = total;
                document.getElementById('lv-dice-result').textContent = total;
                document.getElementById('lv-dice-result').style.color = tc;
                document.getElementById('lv-dice-result').style.textShadow = `0 0 20px ${tc}`;
                let breakdown = `[${roll}] + ${conMod >= 0?'+':''}${conMod} CON`;
                if (giantBonus) breakdown += ` + ${giantBonus} Gigante`;
                document.getElementById('lv-dice-breakdown').textContent = breakdown;
                window._lvEnableConfirm();
            };
            window._lvPickMedia = function() {
                overlay._hitGain = mediaTotal;
                document.getElementById('lv-dice-result').textContent = mediaTotal;
                document.getElementById('lv-dice-result').style.color = '#60a5fa';
                document.getElementById('lv-dice-result').style.textShadow = '0 0 10px #60a5fa88';
                let breakdown = `${hitDiceData.media} (média) + ${conMod >= 0?'+':''}${conMod} CON`;
                if (giantBonus) breakdown += ` + ${giantBonus} Gigante`;
                document.getElementById('lv-dice-breakdown').textContent = breakdown;
                window._lvEnableConfirm();
            };
            window._lvEnableConfirm = function() {
                const btn = document.getElementById('lv-confirm-btn');
                btn.disabled = false;
                btn.style.background = tc;
                btn.style.color = '#000';
                btn.style.cursor = 'pointer';
                btn.style.boxShadow = `0 0 20px ${tc}55`;
                // Desabilita os botões de rolar/média
                const rollBtn = document.getElementById('lv-roll-btn');
                const mediaBtn = document.getElementById('lv-media-btn');
                if (rollBtn)  { rollBtn.disabled  = true; rollBtn.style.opacity  = '0.35'; rollBtn.style.cursor  = 'not-allowed'; }
                if (mediaBtn) { mediaBtn.disabled = true; mediaBtn.style.opacity = '0.35'; mediaBtn.style.cursor = 'not-allowed'; }
            };
            window._lvConfirm = function() {
                const gain = overlay._hitGain || mediaTotal;
                char.vitals.hpMax = (char.vitals.hpMax || 0) + gain;
                char.vitals.hp   = (char.vitals.hp   || 0) + gain;
                // Sanidade: recalcula RDM e recupera essa quantidade (cap sanMax=100)
                if (!char.vitals.sanMax) char.vitals.sanMax = 100;
                const newRdm = calcRDM(char);
                const sanRecovery = newRdm; // recupera o RDM do novo nível
                char.vitals.san = Math.min(char.vitals.sanMax, (char.vitals.san || 100) + sanRecovery);
                saveCharacter(char);
                document.getElementById('levelup-modal-overlay')?.remove();
                render(true);
                window._showXpToast('Nível ' + newLevel + '! +' + gain + ' PV' + (sanRecovery > 0 ? ' | +' + sanRecovery + ' Sanidade' : ''));
            };
        };

        function changeLevel(delta) {
            const char = state.currentChar;
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
        function handleArmorClick() { alert('Funcionalidade de Armadura em desenvolvimento.'); }
        function uploadCharacterImage(input) { if (input.files && input.files[0]) { const reader = new FileReader(); reader.onload = function(e) { state.currentChar.imageUrl = e.target.result; saveCharacter(state.currentChar); render(true); }; reader.readAsDataURL(input.files[0]); } }
        function addItem() { const name = document.getElementById('new-item-name').value; if (name) { state.currentChar.inventory.push({ name, qty: 1 }); saveCharacter(state.currentChar); render(true); } }
        function updateItemQty(idx, delta) { const item = state.currentChar.inventory[idx]; item.qty += delta; if (item.qty <= 0) state.currentChar.inventory.splice(idx, 1); saveCharacter(state.currentChar); render(true); }
        function updateMoney(val) { state.currentChar.money = parseInt(val) || 0; saveCharacter(state.currentChar); render(true); }
        function clearHistory() { if(confirm('Limpar histórico?')) { state.currentChar.history = []; saveCharacter(state.currentChar); render(true); } }
        function toggleBioAccordion(id) { state.bioAccordionOpen = state.bioAccordionOpen === id ? null : id; render(true); }
        function updateBio(field, val) { if (!state.currentChar.bio) state.currentChar.bio = {}; state.currentChar.bio[field] = val; saveCharacter(state.currentChar); render(true); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  renderHatsuDetail — tela de visualização do Hatsu
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
