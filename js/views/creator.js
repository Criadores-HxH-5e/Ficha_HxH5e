        function renderCreator(container) {
             if (!state.tempChar) { state.tempChar = { name: '', class: 'INTENSIFICAÃ‡ÃƒO', race: 'Humano Comum', attributes: { FOR:10, DES:10, CON:10, INT:10, SAB:10, PRE:10 }, skills: [], otherSkills: [], raceTraits: [], traitDetails: {}, background: null, backgroundFeature: null, inclinations: { positive: [], negative: [] }, fagogenese: null }; }
            const step = state.creatorStep;
            let themeColorHex = '#00ff9d';
            if (state.tempChar && state.tempChar.class) { const clsTheme = SYSTEM_DB.classes.find(c => c.id === state.tempChar.class); if (clsTheme) { setThemeColor(clsTheme.color); themeColorHex = clsTheme.color; } }
            let contentHtml = '';
            let title = '';

            if (step === 0) {
                 title = 'IDENTIDADE';
                const currentClass = SYSTEM_DB.classes.find(c => c.id === state.tempChar.class);
                
                // Usando a nova funÃ§Ã£o refatorada renderNenHexagon
                const diagramHtml = renderNenHexagon(state.tempChar.class, true);

                // Afinidade e Genialidade jÃ¡ rolados?
                const afinidade = state.tempChar.afinidade;
                const genialidade = state.tempChar.genialidade;

                const afinidadeHtml = afinidade != null ? (() => {
                    const nivel = afinidade <= 20 ? { label:'Baixa', cor:'#6b7280', desc:'Seu Nen Ã© bruto mas eficiente' }
                        : afinidade <= 50 ? { label:'MÃ©dia', cor:'#fbbf24', desc:'EquilÃ­brio entre poder e controle' }
                        : afinidade <= 80 ? { label:'Alta', cor:'#4ade80', desc:'Seu Nen flui com naturalidade' }
                        : { label:'Excepcional', cor:'#00f0ff', desc:'VocÃª nasceu para dominar o Nen' };
                    return `<div style="background:#0a0f1a;border:2px solid ${nivel.cor}44;border-radius:12px;padding:14px;text-align:center">
                        <div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">ðŸŽ¯ Afinidade com Nen</div>
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:28px;color:${nivel.cor};text-shadow:0 0 12px ${nivel.cor}66;line-height:1.1">${afinidade}<span style="font-size:12px;color:#4b5563">/100</span></div>
                        <div style="font-size:10px;font-weight:700;color:${nivel.cor};margin-top:4px">${nivel.label}</div>
                        <div style="font-size:9px;color:#6b7280;margin-top:2px;font-style:italic">"${nivel.desc}"</div>
                    </div>`;
                })() : '';

                const genialidadeHtml = genialidade != null ? (() => {
                    const tiers = {
                        'Normal':    {
                            cor:'#9ca3af', icon:'âš”ï¸', raridade:'~78.5%',
                            titulo:'Normal',
                            beneficio:'Segue a evoluÃ§Ã£o padrÃ£o do sistema.',
                            flavor:'Cada Hunter comeÃ§a de algum lugar. A consistÃªncia e o esforÃ§o moldam quem vocÃª se torna.'
                        },
                        'Talentoso': {
                            cor:'#60a5fa', icon:'ðŸ’ ', raridade:'~18.5%',
                            titulo:'Talentoso',
                            beneficio:'+2 Graus de PotÃªncia para distribuir na criaÃ§Ã£o do Primeiro Hatsu.',
                            flavor:'Um lampejo acima da mÃ©dia. Poucos percebem no inÃ­cio â€” mas os Mestres notam.'
                        },
                        'GÃªnio':     {
                            cor:'#fbbf24', icon:'âœ¨', raridade:'~2.5%',
                            titulo:'GÃªnio',
                            beneficio:'Recebe XP 1,5Ã— maior em qualquer situaÃ§Ã£o.',
                            flavor:'Raro. Impressionante. O tipo que faz Mestres pararem para observar uma segunda vez.'
                        },
                        'Ultimate':  {
                            cor:'#ff4df7', icon:'ðŸ‘‘', raridade:'~0.25%',
                            titulo:'Ultimate',
                            beneficio:'XP dobrado + +5 Graus de PotÃªncia para distribuir livremente ao longo da evoluÃ§Ã£o.',
                            flavor:'Anormalmente superior. Ocorre menos de uma vez a cada 400 despertar de NEN. Sua lenda comeÃ§a agora.'
                        }
                    };
                    const gn = tiers[genialidade] || tiers['Normal'];
                    const dice = state.tempChar.genialidadeDice || [];
                    const roll = state.tempChar.genialidadeRoll || 0;
                    const isSpecial = genialidade !== 'Normal';

                    const diceHtml = dice.length === 2 ? `
                        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:12px 0">
                            <div style="width:36px;height:36px;border-radius:9px;background:#111827;border:2px solid ${gn.cor}88;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;color:#fff">${dice[0]}</div>
                            <span style="color:#9ca3af;font-size:14px;font-weight:700">+</span>
                            <div style="width:36px;height:36px;border-radius:9px;background:#111827;border:2px solid ${gn.cor}88;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;color:#fff">${dice[1]}</div>
                            <span style="color:#9ca3af;font-size:14px;font-weight:700">=</span>
                            <div style="padding:7px 16px;border-radius:9px;background:${gn.cor}33;border:2px solid ${gn.cor};font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:${gn.cor};text-shadow:0 0 12px ${gn.cor}">${roll}</div>
                            <span style="font-size:10px;color:#9ca3af;font-weight:700">/ 40</span>
                        </div>` : '';

                    return `<div style="background:#0d1117;border:2px solid ${gn.cor}88;border-radius:16px;padding:16px;text-align:center;box-shadow:0 0 20px ${gn.cor}22">
                        <div style="font-size:8px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">ðŸŽ¯ Talento para ProficiÃªncia de NEN</div>
                        <div style="font-size:28px;margin-bottom:4px">${gn.icon}</div>
                        <div style="font-size:16px;font-weight:900;font-family:'Orbitron',sans-serif;color:${gn.cor};text-shadow:0 0 14px ${gn.cor};letter-spacing:2px">${gn.titulo}</div>
                        <div style="font-size:9px;color:#9ca3af;margin-top:3px;font-weight:600">${gn.raridade} dos Hunters</div>
                        <div style="margin-top:12px;background:#060d1a;border:1px solid ${gn.cor}55;border-radius:10px;padding:12px;text-align:left">
                            ${isSpecial ? `<div style="font-size:8px;font-weight:900;color:${gn.cor};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">âš¡ BENEFÃCIO</div>` : ''}
                            <div style="font-size:10px;color:#e5e7eb;margin-bottom:10px;line-height:1.6;font-weight:600">${gn.beneficio}</div>
                            <div style="font-size:9px;color:#9ca3af;font-style:italic;line-height:1.6;padding-top:8px;border-top:1px solid #1f2937">"${gn.flavor}"</div>
                        </div>
                        <div style="margin-top:10px;font-size:8px;color:#6b7280;line-height:1.6;padding:0 4px">
                            A proficiÃªncia inata representa o <em style="color:#9ca3af">fator de aprendizado natural</em>.<br>
                            A proficiÃªncia <em style="color:#9ca3af">real</em> se manifesta com uso criativo e consistente.
                        </div>
                    </div>`;
                })() : '';

                const rollBtnHtml = (afinidade == null || genialidade == null) ? `
                    <div style="text-align:center;margin-top:10px">
                        <button onclick="window.rollAfinidadeGenialidade()" 
                            style="padding:12px 28px;border-radius:12px;background:var(--theme-color-hex,#00ff9d);color:#000;font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;box-shadow:0 0 20px rgba(var(--theme-rgb,0,255,157),0.5);transition:all .2s">
                            ðŸŽ² ROLAR TALENTO DE NEN
                        </button>
                        <p style="font-size:9px;color:#4b5563;margin-top:6px">Role seu talento inato de Nen antes de continuar</p>
                    </div>` : `
                    <div>
                        ${genialidadeHtml}
                    </div>`;

                contentHtml = `
                    <div class="space-y-6">
                        <div class="relative">
                            <label class="text-[10px] font-bold text-neon-theme uppercase tracking-widest mb-2 block pl-2">Nome do Candidato</label>
                            <input type="text" id="creator-name" value="${state.tempChar.name}" placeholder="INSIRA SEU NOME..." class="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white text-center font-display font-bold tracking-wider focus:border-neon-theme focus:shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)] transition-all uppercase placeholder-gray-600" oninput="state.tempChar.name = this.value">
                        </div>
                        
                        ${diagramHtml}

                        <div class="text-center px-4 bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                            <p class="text-sm font-medium text-gray-300 italic">"${currentClass.desc}"</p>
                        </div>

                        ${rollBtnHtml}
                    </div>`;
            } else if (step === 1) {
                title = 'RAÃ‡A';
                contentHtml = `<div class="space-y-4">`;
                let lastCat = '';
                SYSTEM_DB.racas.forEach(r => {
                    if (r.categoria && r.categoria !== lastCat) { contentHtml += `<div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4 mb-2 pl-2">${r.categoria}</div>`; lastCat = r.categoria; }
                    const isSelected = state.tempChar.race === r.nome;
                    const borderColor = isSelected ? 'border-neon-theme ring-2 ring-neon-theme/20' : 'border-gray-800';
                    const bgColor = isSelected ? 'bg-neon-theme/5' : 'bg-gray-900';
                    const textColor = isSelected ? 'text-neon-theme' : 'text-white';
                    
                    let attrHtml = typeof r.aumento_atributo === 'object' ? Object.entries(r.aumento_atributo).map(([k,v]) => `<span class="bg-gray-900 border border-gray-700 rounded-full px-3 py-1 text-[10px] font-bold text-gray-300 shadow-sm flex items-center gap-1">${k.replace(/_/g, ' ')} <span class="${v>0?'text-neon-theme':'text-red-500'}">${v>0?'+':''}${v}</span></span>`).join('') : `<span class="text-xs text-gray-400 italic">${r.aumento_atributo}</span>`;
                    
                    let featuresHtml = '';
                    if (r.nome === 'Formiga Quimera') {
                         const selectedCount = (state.tempChar.raceTraits || []).length;
                         const maxTraits = 3;
                         
                         // Seletor de Origem da FagogÃªnese
                         const originOpts = r.fagogenese_options || [];
                         const currentOrigin = state.tempChar.fagogenese || originOpts[0];
                         if(!state.tempChar.fagogenese) state.tempChar.fagogenese = currentOrigin;

                         const originHtml = `
                            <div class="mb-4" onclick="event.stopPropagation()">
                                <h4 class="text-[10px] font-black text-neon-theme uppercase tracking-widest mb-2">Origem da FagogÃªnese (Visual Predominante)</h4>
                                <div class="bg-gray-950/50 rounded-lg p-2 border border-gray-800/50">
                                    <select onchange="state.tempChar.fagogenese = this.value" class="w-full bg-black border border-gray-700 rounded p-2 text-xs text-white outline-none focus:border-neon-theme">
                                        ${originOpts.map(o => `<option value="${o}" ${currentOrigin === o ? 'selected' : ''}>${o}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                         `;

                         featuresHtml = originHtml + `<div class="mb-4"><h4 class="text-[10px] font-black text-neon-theme uppercase tracking-widest mb-2 flex justify-between">CaracterÃ­sticas da EspÃ©cie <span id="trait-counter" class="${selectedCount >= maxTraits ? 'text-neon-theme' : 'text-gray-500'}">(${selectedCount}/${maxTraits})</span></h4><div class="bg-gray-950/50 rounded-lg p-2 border border-gray-800/50 grid grid-cols-1 gap-2">${r.caracteristicas.map(f => {
                                const isTraitSelected = (state.tempChar.raceTraits || []).includes(f.nome);
                                let optionsHtml = '';
                                if (isTraitSelected && f.opcoes) {
                                    const currentDetail = (state.tempChar.traitDetails || {})[f.nome] || f.opcoes[0];
                                    if (!state.tempChar.traitDetails) state.tempChar.traitDetails = {};
                                    if (!state.tempChar.traitDetails[f.nome]) state.tempChar.traitDetails[f.nome] = f.opcoes[0];
                                    optionsHtml = `<div class="mt-2 pl-6 pointer-events-auto" onclick="event.stopPropagation()"><select class="bg-black border border-gray-700 text-[9px] text-white rounded p-1 w-full outline-none focus:border-neon-theme" onchange="updateTraitDetail('${f.nome}', this.value)">${f.opcoes.map(opt => `<option value="${opt}" ${currentDetail === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></div>`;
                                }
                                return `<div id="trait-btn-${f.nome.replace(/\s/g,'-')}" onclick="event.stopPropagation(); toggleRaceTrait('${f.nome}')" class="p-2 rounded border cursor-pointer transition-all flex flex-col items-start ${isTraitSelected ? 'bg-neon-theme/10 border-neon-theme text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:bg-gray-800'}"><div class="flex items-start gap-2 w-full"><div class="mt-0.5 pointer-events-none shrink-0">${isTraitSelected ? '<i data-lucide="check-square" size="14"></i>' : '<i data-lucide="square" size="14"></i>'}</div><div class="pointer-events-none"><span class="text-[10px] font-bold block">${f.nome}</span><span class="text-[9px] block leading-tight opacity-70">${f.efeito || f.mecanica || ''}</span></div></div>${optionsHtml}</div>`;
                            }).join('')}</div></div>`;
                    } else {
                        const features = [...(r.caracteristicas || []), ...(r.opcoes_caracteristica || [])];
                        if (features.length > 0) featuresHtml = `<div class="mb-4"><h4 class="text-[10px] font-black text-neon-theme uppercase tracking-widest mb-2">CaracterÃ­sticas</h4><div class="bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">${features.map(f => `<div class="mb-2 last:mb-0"><span class="text-[11px] font-bold text-gray-300 block">${f.nome}</span><span class="text-[10px] text-gray-500 block leading-tight">${f.efeito || f.mecanica || ''} ${f.tabela_ancestral ? '('+f.tabela_ancestral+')' : ''}</span></div>`).join('')}</div></div>`;
                    }
                    
                    const checkIcon = `<span id="check-${r.nome.replace(/\s/g,'-')}" class="transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'} flex items-center"><i data-lucide="check" size="16"></i></span>`;
                    const chevronClass = isSelected ? 'rotate-0' : '-rotate-90';

                    contentHtml += `<div id="race-card-${r.nome.replace(/\s/g,'-')}" onclick="selectRace('${r.nome}')" class="w-full text-left rounded-2xl border ${borderColor} ${bgColor} transition-all duration-300 cursor-pointer group relative overflow-hidden mb-2"><div class="p-4 flex items-start justify-between"><div><h3 class="font-display font-bold text-lg uppercase tracking-wider ${textColor} flex items-center gap-2">${r.nome} ${checkIcon}</h3><p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 pr-6 leading-tight">${r.descricao}</p></div><div id="chevron-${r.nome.replace(/\s/g,'-')}" class="transition-transform duration-300 ${chevronClass} ${isSelected ? 'text-neon-theme' : 'text-gray-600'}"><i data-lucide="chevron-down" size="20"></i></div></div><div id="race-content-${r.nome.replace(/\s/g,'-')}" class="accordion-content px-4 ${isSelected ? 'open pb-4' : ''}"><div class="h-px w-full bg-gray-800 mb-4"></div><div class="mb-4"><h4 class="text-[10px] font-black text-neon-theme uppercase tracking-widest mb-2">BÃ´nus de Atributo</h4><div class="flex flex-wrap gap-2">${attrHtml}</div></div>${featuresHtml}<div class="grid grid-cols-2 gap-2 text-[10px] text-gray-500"><div class="col-span-2 text-right italic text-gray-600">Fonte: ${r.fonte}</div></div></div></div>`;
                });
                contentHtml += `</div>`;
            } else if (step === 2) {
                // ... (Step 2 - Atributos)
                title = 'ATRIBUTOS';
                const totalCost = calculateTotalCost(state.tempChar.attributes);
                const maxCost = 20;
                const tabBtn = (id, label, icon) => {
                    const isActive = state.attrTab === id;
                    const isLocked = state.attrMethodLocked && !isActive;
                    let baseClasses = "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all flex items-center justify-center gap-2";
                    let stateClasses = isActive ? "bg-neon-theme/20 border-neon-theme text-neon-theme shadow-[0_0_10px_rgba(var(--theme-rgb),0.2)]" : (isLocked ? "bg-gray-900 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed" : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 cursor-pointer");
                    return `<button onclick="${isLocked ? '' : `setAttrTab('${id}')`}" class="${baseClasses} ${stateClasses}">${isLocked ? '<i data-lucide="lock" size="14"></i>' : `<i data-lucide="${icon}" size="14"></i>`} ${label}</button>`;
                };
                contentHtml = `<div class="space-y-6"><div class="bg-[#2a0e14] border border-neon-red/30 p-4 rounded-xl text-center relative overflow-hidden shadow-[0_0_15px_rgba(255,0,85,0.1)]"><p class="text-[10px] text-neon-red font-bold uppercase tracking-widest flex items-center justify-center gap-2 relative z-10"><i data-lucide="alert-triangle" size="14"></i> AtenÃ§Ã£o: Apenas um modo pode ser escolhido. Ao iniciar, os outros serÃ£o bloqueados.</p></div><div class="flex gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800">${tabBtn('ROLAGEM', 'Rolagem', 'dices')}${tabBtn('ARRAY', 'MÃ©dia', 'list')}${tabBtn('COMPRA', 'Compra', 'coins')}</div>`;
                if (state.attrTab === 'ROLAGEM' || state.attrTab === 'ARRAY') {
                    contentHtml += `<div class="space-y-4">${!state.attrMethodLocked ? (state.attrTab === 'ROLAGEM' ? `<button onclick="rollAllStats()" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-display font-bold text-white tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 border border-white/10"><i data-lucide="dices"></i> ROLAR ATRIBUTOS</button>` : `<button onclick="applyStandardArray()" class="w-full py-4 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 rounded-xl font-display font-bold tracking-widest hover:bg-neon-blue hover:text-black active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]"><i data-lucide="list"></i> USAR MÃ‰DIA PADRÃƒO</button>`) : ''}${state.attrMethodLocked ? `<div class="bg-gray-900/50 border border-gray-700 rounded-xl p-4"><p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3 text-center">Banco de Atributos</p>${state.attrPool.length === 0 ? '<div class="text-center text-xs text-gray-600 py-2 italic">Todos os valores alocados.</div>' : `<div class="flex flex-wrap gap-2 justify-center">${state.attrPool.map((val, idx) => `<button draggable="true" ondragstart="handleDragStart(event, ${idx})" ondragend="handleDragEnd(event)" onclick="selectPoolItem(${idx})" class="w-10 h-10 rounded-lg font-display font-bold text-lg flex items-center justify-center transition-all cursor-move ${state.selectedPoolIdx === idx ? 'bg-neon-theme text-black shadow-[0_0_10px_var(--theme-color-hex)] scale-110' : 'bg-gray-800 text-white hover:bg-gray-700'}">${val}</button>`).join('')}</div>`}<p class="text-[9px] text-gray-500 text-center mt-3">${state.selectedPoolIdx !== null ? 'Selecione um atributo abaixo para aplicar.' : 'Clique em um nÃºmero para selecionar ou arraste para um slot.'}</p></div>` : ''}</div>`;
                } else if (state.attrTab === 'COMPRA') {
                     contentHtml += `<div id="buy-container" class="bg-gray-900 border border-gray-800 p-4 rounded-xl relative overflow-hidden"><div class="flex justify-between items-center relative z-10"><span class="text-xs text-gray-400 uppercase font-bold tracking-widest">Pontos Gastos</span><div class="flex items-center gap-1"><span id="buy-total" class="font-display font-bold text-2xl ${totalCost > maxCost ? 'text-red-500' : 'text-white'} transition-all">${totalCost}</span><span class="font-display text-gray-600 text-lg">/ ${maxCost}</span></div></div><div class="absolute bottom-0 left-0 h-1 bg-gray-800 w-full"><div id="buy-bar" class="h-full ${totalCost > maxCost ? 'bg-red-500' : 'bg-neon-theme'} transition-all duration-300" style="width: ${Math.min(100, (totalCost/maxCost)*100)}%"></div></div></div>`;
                }
                contentHtml += `<div class="grid grid-cols-2 gap-3">${Object.keys(state.tempChar.attributes).map(attr => {
                    const val = state.tempChar.attributes[attr];
                    const isPoolMode = state.attrTab !== 'COMPRA';
                    const dndAttrs = isPoolMode ? `ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${attr}')"` : '';
                    return `<div ${dndAttrs} class="bg-gray-900 rounded-xl p-3 border transition-all relative overflow-hidden group ${state.selectedPoolIdx !== null && isPoolMode ? 'border-neon-theme/50 cursor-pointer hover:border-neon-theme' : 'border-gray-800'} ${val === null && isPoolMode ? 'border-dashed' : ''}" onclick="${isPoolMode ? (val === null ? `assignToSlot('${attr}')` : `returnToPool('${attr}')`) : ''}"><div class="flex justify-between items-center mb-2"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${attr}</span>${val !== null ? `<span class="text-[10px] bg-gray-800 text-gray-400 px-1.5 rounded border border-gray-700">Mod ${getModStr(val)}</span>` : ''}</div>${state.attrTab === 'COMPRA' ? `<div class="flex items-center justify-between"><button onclick="buyStat('${attr}', -1)" class="w-8 h-8 bg-black/30 rounded text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"><i data-lucide="minus" size="14"></i></button><span id="attr-val-${attr}" class="text-xl font-display font-bold text-white transition-all">${val}</span><button onclick="buyStat('${attr}', 1)" class="w-8 h-8 bg-black/30 rounded text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"><i data-lucide="plus" size="14"></i></button></div><div class="text-center mt-1"><span class="text-[8px] text-gray-600">Custo: ${getPointBuyCost(val)}</span></div>` : `<div class="text-center py-1 h-10 flex items-center justify-center pointer-events-none">${val !== null ? `<span class="text-3xl font-display font-bold text-white transition-colors">${val}</span>` : `<span class="text-[10px] text-gray-700 uppercase font-bold tracking-widest">Vazio</span>`}</div>${isPoolMode && val !== null ? '<div class="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none"><i data-lucide="x" class="text-red-500"></i></div>' : ''}`}</div>`;
                }).join('')}</div></div>`;
            } else if (step === 3) {
                // ... (Step 3 - Antecedente)
                 title = 'ANTECEDENTE';
                contentHtml = `<div class="space-y-4">`;
                SYSTEM_DB.antecedentes.forEach(bg => {
                    const isSelected = state.tempChar.background === bg.nome;
                    const borderColor = isSelected ? 'border-neon-theme ring-2 ring-neon-theme/20' : 'border-gray-800';
                    const bgColor = isSelected ? 'bg-neon-theme/5' : 'bg-gray-900';
                    const textColor = isSelected ? 'text-neon-theme' : 'text-white';
                    const checkIcon = `<span class="transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'} flex items-center"><i data-lucide="check" size="16" class="text-neon-theme"></i></span>`;
                    const chevronClass = isSelected ? 'rotate-0' : '-rotate-90';
                    contentHtml += `<div id="bg-card-${bg.nome.replace(/\s/g,'-')}" onclick="selectBackground('${bg.nome}')" class="w-full text-left rounded-2xl border ${borderColor} ${bgColor} transition-all duration-300 cursor-pointer group relative overflow-hidden mb-2"><div class="p-4 flex items-start justify-between"><div><h3 class="font-display font-bold text-lg uppercase tracking-wider ${textColor} flex items-center gap-2">${bg.nome} ${checkIcon}</h3><p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 pr-6 leading-tight line-clamp-2">${bg.descricao}</p></div><div class="transition-transform duration-300 ${chevronClass} ${isSelected ? 'text-neon-theme' : 'text-gray-600'}"><i data-lucide="chevron-down" size="20"></i></div></div><div class="accordion-content px-4 ${isSelected ? 'open pb-4' : ''}"><div class="h-px w-full bg-gray-800 mb-4"></div><p class="text-xs text-gray-400 italic mb-4">"${bg.descricao}"</p><div class="bg-gray-950/50 border border-cyan-500/30 rounded-xl p-3 mb-3 relative overflow-hidden"><div class="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div><h4 class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-2"><i data-lucide="graduation-cap" size="12"></i> ProficiÃªncias</h4><p class="text-xs text-gray-300 font-bold">${bg.proficiencias}</p><p class="text-[10px] text-gray-500 italic mt-1">Estas perÃ­cias serÃ£o adicionadas automaticamente.</p></div><div class="bg-gray-950/50 border border-green-500/30 rounded-xl p-3 mb-3 relative overflow-hidden"><div class="absolute top-0 left-0 w-1 h-full bg-green-500"></div><h4 class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2"><i data-lucide="backpack" size="12"></i> Equipamento</h4><div class="space-y-1">${bg.equipamento.map(item => `<div class="bg-gray-900 border border-gray-800 px-2 py-1 rounded text-[10px] text-gray-300 font-mono">${item}</div>`).join('')}</div></div><div class="bg-gray-950/50 border border-purple-500/30 rounded-xl p-3 relative overflow-hidden"><div class="absolute top-0 left-0 w-1 h-full bg-purple-500"></div><h4 class="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><i data-lucide="star" size="12"></i> Escolha uma CaracterÃ­stica</h4><div class="space-y-2">${bg.caracteristicas.map(c => `<label class="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors"><div class="relative flex items-center mt-0.5"><input type="radio" name="bg-feature" value="${c.nome}" class="peer sr-only" onclick="selectBackgroundFeature('${c.nome}')" ${state.tempChar.backgroundFeature === c.nome ? 'checked' : ''}><div class="w-4 h-4 border-2 border-gray-600 rounded-full peer-checked:border-purple-500 peer-checked:bg-purple-500/20 transition-all flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-transparent peer-checked:bg-purple-500 transition-colors radio-indicator"></div></div></div><div class="flex-1"><span class="text-xs font-bold text-white block ${state.tempChar.backgroundFeature === c.nome ? 'text-purple-400' : ''}">${c.nome}</span><span class="text-[10px] text-gray-500 leading-tight block">${c.efeito}</span></div></label>`).join('')}</div></div></div></div>`;
                });
                contentHtml += `</div>`;
            } else if (step === 4) {
                // ... (Step 4 - InclinaÃ§Ã£o)
                  title = 'INCLINAÃ‡ÃƒO';
                const posCost = state.tempChar.inclinations.positive.reduce((acc, i) => acc + i.custo, 0);
                const negVal = state.tempChar.inclinations.negative.reduce((acc, i) => acc + i.valor, 0);
                const sortedPos = [...state.tempChar.inclinations.positive].sort((a,b) => b.custo - a.custo);
                const freeCost = sortedPos.length > 0 ? sortedPos[0].custo : 0;
                const paidCost = Math.max(0, posCost - freeCost);
                const balance = (negVal) - paidCost; 
                const isOk = balance >= 0;
                contentHtml = `<div class="space-y-6"><div class="grid grid-cols-3 gap-2 bg-gray-900 border border-gray-800 rounded-xl p-3"><div class="text-center border-r border-gray-800"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Custo Positivo</span><span class="text-xl font-display font-bold text-white">${posCost} <span class="text-[10px] text-gray-600">pts</span></span></div><div class="text-center border-r border-gray-800"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">CompensaÃ§Ã£o</span><div class="flex items-center justify-center gap-2"><i data-lucide="scale" size="16" class="${isOk ? 'text-neon-green' : 'text-neon-red'}"></i><span class="text-xl font-display font-bold ${isOk ? 'text-neon-green' : 'text-neon-red'}">${isOk ? 'OK' : balance}</span></div></div><div class="text-center"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Pontos Neg.</span><span class="text-xl font-display font-bold text-neon-red">${negVal} <span class="text-[10px] text-gray-600">/ 10</span></span></div></div><div><div class="flex items-center justify-between mb-2"><h4 class="text-xs font-black text-neon-green uppercase tracking-widest flex items-center gap-2"><i data-lucide="thumbs-up" size="14"></i> Gerais Positivas</h4><span class="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">1Âª GrÃ¡tis (Maior Valor)</span></div><div class="space-y-2">${SYSTEM_DB.inclinacoes.positivas.map(inc => { if (inc.hasOptions) { const hasChildSelected = state.tempChar.inclinations.positive.some(i => i.nome.startsWith(inc.nome + ':')); return `<div class="bg-gray-900 border ${hasChildSelected ? 'border-neon-green/50' : 'border-gray-800'} rounded-xl p-3 relative overflow-hidden"><div class="mb-2 border-b border-gray-800 pb-2"><span class="text-xs font-bold text-white flex items-center gap-2">${inc.nome}${hasChildSelected ? '<span class="text-[9px] bg-neon-green/10 text-neon-green px-1.5 rounded border border-neon-green/20 uppercase">Selecionado</span>' : ''}</span><p class="text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2">${inc.desc}</p></div><div class="space-y-1 pl-2 border-l-2 border-gray-800">${inc.options.map(opt => { const fullName = `${inc.nome}: ${opt.label}`; const isSelected = state.tempChar.inclinations.positive.some(i => i.nome === fullName); return `<div onclick="toggleInclination('positive', '${fullName}', ${opt.custo})" class="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-neon-green/10' : ''}"><div class="flex flex-col"><span class="text-[11px] font-bold ${isSelected ? 'text-neon-green' : 'text-gray-300'}">${opt.label}</span>${opt.desc ? `<span class="text-[9px] text-gray-500 line-clamp-1">${opt.desc}</span>` : ''}</div><div class="flex items-center gap-2"><span class="text-[9px] font-mono text-gray-500">${opt.custo} pts</span>${isSelected ? '<i data-lucide="check" size="12" class="text-neon-green"></i>' : '<div class="w-3 h-3"></div>'}</div></div>`; }).join('')}</div></div>`; } else { const isSelected = state.tempChar.inclinations.positive.some(i => i.nome === inc.nome); return `<div onclick="toggleInclination('positive', '${inc.nome}', ${inc.custo})" class="bg-gray-900 border ${isSelected ? 'border-neon-green shadow-[0_0_10px_rgba(0,255,157,0.2)]' : 'border-gray-800'} rounded-xl p-3 cursor-pointer transition-all hover:border-gray-600 group relative overflow-hidden">${isSelected ? '<div class="absolute top-0 right-0 p-1"><i data-lucide="check" size="14" class="text-neon-green"></i></div>' : ''}<div class="flex justify-between items-start mb-1"><span class="text-xs font-bold ${isSelected ? 'text-neon-green' : 'text-white'}">${inc.nome}</span><span class="text-[10px] font-mono bg-black/50 px-1.5 rounded text-gray-400 border border-gray-700">${inc.custo} pts</span></div><p class="text-[10px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors line-clamp-2">${inc.desc}</p></div>`; } }).join('')}</div></div><div><h4 class="text-xs font-black text-neon-red uppercase tracking-widest mb-2 flex items-center gap-2"><i data-lucide="thumbs-down" size="14"></i> Gerais Negativas</h4><div class="space-y-2">${SYSTEM_DB.inclinacoes.negativas.map(inc => { if (inc.hasOptions) { const hasChildSelected = state.tempChar.inclinations.negative.some(i => i.nome.startsWith(inc.nome + ':')); return `<div class="bg-gray-900 border ${hasChildSelected ? 'border-neon-red/50' : 'border-gray-800'} rounded-xl p-3 relative overflow-hidden"><div class="mb-2 border-b border-gray-800 pb-2"><span class="text-xs font-bold text-white flex items-center gap-2">${inc.nome}${hasChildSelected ? '<span class="text-[9px] bg-neon-red/10 text-neon-red px-1.5 rounded border border-neon-red/20 uppercase">Selecionado</span>' : ''}</span><p class="text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2">${inc.desc}</p></div><div class="space-y-1 pl-2 border-l-2 border-gray-800">${inc.options.map(opt => { const fullName = `${inc.nome}: ${opt.label}`; const isSelected = state.tempChar.inclinations.negative.some(i => i.nome === fullName); return `<div onclick="toggleInclination('negative', '${fullName}', ${opt.valor})" class="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-neon-red/10' : ''}"><div class="flex flex-col"><span class="text-[11px] font-bold ${isSelected ? 'text-neon-red' : 'text-gray-300'}">${opt.label}</span>${opt.desc ? `<span class="text-[9px] text-gray-500 line-clamp-1">${opt.desc}</span>` : ''}</div><div class="flex items-center gap-2"><span class="text-[9px] font-mono text-gray-500">+${opt.valor} pts</span>${isSelected ? '<i data-lucide="check" size="12" class="text-neon-red"></i>' : '<div class="w-3 h-3"></div>'}</div></div>`; }).join('')}</div></div>`; } else { const isSelected = state.tempChar.inclinations.negative.some(i => i.nome === inc.nome); return `<div onclick="toggleInclination('negative', '${inc.nome}', ${inc.valor})" class="bg-gray-900 border ${isSelected ? 'border-neon-red shadow-[0_0_10px_rgba(255,0,85,0.2)]' : 'border-gray-800'} rounded-xl p-3 cursor-pointer transition-all hover:border-gray-600 group relative overflow-hidden">${isSelected ? '<div class="absolute top-0 right-0 p-1"><i data-lucide="check" size="14" class="text-neon-red"></i></div>' : ''}<div class="flex justify-between items-start mb-1"><span class="text-xs font-bold ${isSelected ? 'text-neon-red' : 'text-white'}">${inc.nome}</span><span class="text-[10px] font-mono bg-black/50 px-1.5 rounded text-gray-400 border border-gray-700">+${inc.valor} pts</span></div><p class="text-[10px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors line-clamp-2">${inc.desc}</p></div>`; } }).join('')}</div></div></div>`;
            } else if (step === 5) {
                // ... (Step 5 - Treinamentos)
                 title = 'TREINAMENTOS';
                window.toggleAccordion = (section) => { state.openSkillAccordion = state.openSkillAccordion === section ? null : section; render(true); };
                const bgSkillsText = state.tempChar.background ? SYSTEM_DB.antecedentes.find(b => b.nome === state.tempChar.background).proficiencias : "";
                const manualMainSkills = state.tempChar.skills.filter(s => !bgSkillsText.includes(s));
                const mainCount = manualMainSkills.length;
                const otherCount = state.tempChar.otherSkills.length;
                const maxMain = 5;
                const hasBgKit = bgSkillsText.includes("Kit") || bgSkillsText.includes("Ferramenta");
                const maxOther = hasBgKit ? 5 : 4;
                const renderAccordionHeader = (id, label, count, max, isOpen, colorClass, labelColorClass) => {
                    return `<div onclick="toggleAccordion('${id}')" class="flex items-center justify-between p-4 bg-gray-900 border ${isOpen ? `border-${colorClass.split('-')[1]}-${colorClass.split('-')[2]}` : 'border-gray-800'} rounded-xl cursor-pointer hover:bg-gray-800 transition-all mb-2 relative group overflow-hidden"><div class="absolute left-0 top-0 bottom-0 w-1 ${isOpen ? 'bg-' + colorClass.replace('text-', '') : 'bg-transparent'} transition-colors"></div><div class="flex items-center gap-3 pl-2"><div><h3 class="font-display font-bold text-sm text-white uppercase tracking-wider ${isOpen ? colorClass : ''}">${label}</h3><div class="flex items-baseline gap-2 mt-0.5"><span class="text-[10px] text-gray-500 font-bold tracking-wider">SELECIONADO</span><span id="counter-text-${id}" class="font-display font-bold text-xs ${count >= max ? colorClass : 'text-gray-400'}">${count} <span class="text-gray-600 text-[10px]">/ ${max}</span></span></div></div></div><div class="transition-transform duration-300 ${isOpen ? colorClass + ' rotate-180' : 'text-gray-600'}"><i data-lucide="chevron-down" size="20"></i></div></div>`;
                };
                const tc = themeColorHex;
                contentHtml = `<div class="space-y-4 pt-2"><div class="text-center mb-4"><p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Defina suas competÃªncias de combate e perÃ­cias</p></div>${bgSkillsText ? `<div class="bg-gray-900/50 border border-gray-800 p-3 rounded-xl mb-4 text-center"><p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">PerÃ­cias de Antecedente (Extra)</p><p class="text-xs text-neon-blue font-bold">${bgSkillsText}</p></div>` : ''}${renderAccordionHeader('MAIN', 'PERÃCIAS E RESISTÃŠNCIAS', mainCount, maxMain, state.openSkillAccordion === 'MAIN', 'text-neon-theme', 'text-neon-theme')}${state.openSkillAccordion === 'MAIN' ? `<div class="pl-1 pr-1 pb-4 pt-1"><div class="grid grid-cols-2 gap-2">${SYSTEM_DB.skills.map(skill => { const isSelected = state.tempChar.skills.includes(skill); const isFromBg = bgSkillsText.includes(skill); return `<div id="skill-btn-${skill.replace(/\s/g,'-')}" onclick="toggleCreatorSkill('${skill}', 'main')" class="flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-neon-theme/10 border-neon-theme text-white shadow-[0_0_10px_rgba(var(--theme-rgb),0.1)]' : 'bg-gray-900 border-gray-800 text-gray-500 hover:bg-gray-800 hover:border-gray-700'} group"><span class="text-[10px] font-bold uppercase tracking-wide pointer-events-none group-hover:text-gray-300 transition-colors ${isSelected ? 'text-neon-theme' : ''}">${skill} ${isFromBg ? '<span class="text-[9px] bg-gray-900 px-1 rounded ml-1 border border-gray-700 text-gray-400 block mt-1 w-fit">ANTECEDENTE</span>' : ''}</span><div class="pointer-events-none ${isSelected ? 'text-neon-theme' : 'text-gray-700'}">${isSelected ? '<i data-lucide="check-square" size="14"></i>' : '<i data-lucide="square" size="14"></i>'}</div></div>`; }).join('')}</div></div>` : ''}${renderAccordionHeader('OTHER', 'OUTROS TREINAMENTOS', otherCount, maxOther, state.openSkillAccordion === 'OTHER', `text-[${tc}]`, `text-[${tc}]`)}${state.openSkillAccordion === 'OTHER' ? `<div class="pl-1 pr-1 pb-4 pt-1"><p class="text-[10px] text-gray-500 italic mb-3 px-2">A 5Âª escolha Ã© atribuÃ­da automaticamente pelo kit de antecedente.</p><div class="grid grid-cols-1 gap-2">${SYSTEM_DB.otherSkills.map(skill => { const isSelected = state.tempChar.otherSkills.includes(skill); const isKitItem = skill === 'Kits'; const isLocked = isKitItem && hasBgKit; let r = 0, g = 0, b = 0; if (themeColorHex.startsWith('#')) { const h = themeColorHex.substring(1); r = parseInt(h.substring(0, 2), 16); g = parseInt(h.substring(2, 4), 16); b = parseInt(h.substring(4, 6), 16); } const activeStyle = `color: ${tc}; border-color: ${tc}; background-color: rgba(${r}, ${g}, ${b}, 0.15); box-shadow: 0 0 10px rgba(${r}, ${g}, ${b}, 0.1);`; const inactiveStyle = `border-color: #1f2937; background-color: #111827;`; return `<div id="skill-btn-${skill.replace(/\s/g,'-')}" onclick="${isLocked ? '' : `toggleCreatorSkill('${skill}', 'other')`}" class="flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group" style="${isSelected && !isLocked ? activeStyle : inactiveStyle}"><div class="flex items-center gap-3 pointer-events-none"><i data-lucide="${isLocked ? 'lock' : 'hammer'}" size="14" style="${isSelected ? `color:${tc}` : 'color:#4b5563'}"></i><span class="text-[10px] font-bold uppercase tracking-wide transition-colors" style="${isSelected ? `color:${tc}` : 'color:#6b7280'}">${skill} ${isLocked ? '(ANTECEDENTE)' : ''}</span></div><div class="pointer-events-none" style="${isSelected ? `color:${tc}` : 'color:#374151'}">${isSelected ? (isLocked ? '<i data-lucide="lock" size="14"></i>' : '<i data-lucide="check-square" size="14"></i>') : '<i data-lucide="square" size="14"></i>'}</div></div>`; }).join('')}</div></div>` : ''}</div>`;
            } else if (step === 6) {
                // ... (Step 6 - RevisÃ£o)
                title = 'REVISÃƒO';
                const color = SYSTEM_DB.classes.find(c => c.id === state.tempChar.class).color;
                const bonusReq = getBonusRequirements(state.tempChar.race);
                const allocatedTotal = getAllocatedTotal();
                const isBonusReady = !bonusReq || (bonusReq.type === 'wildcard' && allocatedTotal === bonusReq.amount) || (bonusReq.type === 'choice' && allocatedTotal === bonusReq.amount);
                
                let bonusHtml = '';
                if (bonusReq) {
                    const tc2 = `var(--theme-color, #00ff9d)`;
                    if (bonusReq.type === 'wildcard') {
                        const remaining = bonusReq.amount - allocatedTotal;
                        const attrs = Object.keys(state.tempChar.attributes);
                        bonusHtml = `
                        <div style="background:#0d1421;border:2px solid var(--theme-color,#00ff9d);border-radius:16px;padding:16px;margin-bottom:16px">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                                <div>
                                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:var(--theme-color,#00ff9d);text-transform:uppercase;letter-spacing:2px">ðŸŽ BÃ´nus Racial</div>
                                    <div style="font-size:9px;color:#6b7280;margin-top:2px">Distribua os pontos entre seus atributos</div>
                                </div>
                                <div style="text-align:right">
                                    <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:22px;line-height:1;color:${remaining > 0 ? '#fbbf24' : '#4ade80'}">${remaining}</div>
                                    <div style="font-size:8px;color:#4b5563;font-weight:700;text-transform:uppercase">restante${remaining !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
                                ${attrs.map(attr => {
                                    const cur = state.allocations[attr] || 0;
                                    const canAdd = remaining > 0;
                                    const canSub = cur > 0;
                                    const baseVal = state.tempChar.attributes[attr];
                                    return `<div style="background:#0a0f1a;border:2px solid ${cur > 0 ? 'var(--theme-color,#00ff9d)' : '#1f2937'};border-radius:12px;padding:12px 8px;text-align:center;transition:border-color .15s">
                                        <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${attr}</div>
                                        <div style="font-size:9px;color:#374151;margin-bottom:8px">(base: ${baseVal})</div>
                                        <div style="display:flex;align-items:center;justify-content:center;gap:0">
                                            <button onclick="updateAllocation('${attr}', -1, ${bonusReq.amount})"
                                                style="width:30px;height:30px;border-radius:8px 0 0 8px;background:${canSub ? '#1f2937' : '#0d1117'};border:1px solid ${canSub ? '#374151' : '#111827'};color:${canSub ? '#f87171' : '#1f2937'};font-size:16px;font-weight:900;cursor:${canSub ? 'pointer' : 'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1;transition:all .1s">âˆ’</button>
                                            <div style="min-width:32px;height:30px;display:flex;align-items:center;justify-content:center;background:#060a10;border-top:1px solid #1f2937;border-bottom:1px solid #1f2937">
                                                <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:${cur > 0 ? 'var(--theme-color,#00ff9d)' : '#fff'}">${cur > 0 ? '+' : ''}${cur}</span>
                                            </div>
                                            <button onclick="updateAllocation('${attr}', 1, ${bonusReq.amount})"
                                                style="width:30px;height:30px;border-radius:0 8px 8px 0;background:${canAdd ? '#1f2937' : '#0d1117'};border:1px solid ${canAdd ? '#374151' : '#111827'};color:${canAdd ? 'var(--theme-color,#00ff9d)' : '#1f2937'};font-size:16px;font-weight:900;cursor:${canAdd ? 'pointer' : 'not-allowed'};display:flex;align-items:center;justify-content:center;line-height:1;transition:all .1s">+</button>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                            <div style="margin-top:12px;height:6px;background:#111827;border-radius:99px;overflow:hidden">
                                <div style="height:100%;width:${Math.round((allocatedTotal/bonusReq.amount)*100)}%;background:var(--theme-color,#00ff9d);border-radius:99px;transition:width .3s;box-shadow:0 0 8px var(--theme-color,#00ff9d)"></div>
                            </div>
                            <div style="margin-top:4px;text-align:right;font-size:9px;font-weight:700;color:${allocatedTotal === bonusReq.amount ? '#4ade80' : '#fbbf24'}">${allocatedTotal} / ${bonusReq.amount} pontos alocados</div>
                        </div>`;
                    } else if (bonusReq.type === 'choice') {
                        bonusHtml = `
                        <div style="background:#0d1421;border:2px solid var(--theme-color,#00ff9d);border-radius:16px;padding:16px;margin-bottom:16px">
                            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:var(--theme-color,#00ff9d);text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">ðŸŽ BÃ´nus Racial</div>
                            <div style="font-size:9px;color:#6b7280;margin-bottom:12px">Escolha um atributo para receber +${bonusReq.amount}</div>
                            <div style="display:flex;flex-wrap:wrap;gap:8px">
                                ${bonusReq.keys.map(attr => {
                                    const isSel = (state.allocations[attr]||0) === bonusReq.amount;
                                    return `<button onclick="updateChoiceAllocation('${attr}', ${bonusReq.amount})"
                                        style="flex:1;min-width:60px;padding:10px 8px;border-radius:10px;border:2px solid ${isSel ? 'var(--theme-color,#00ff9d)' : '#1f2937'};background:${isSel ? 'rgba(var(--theme-rgb,0,255,157),0.15)' : '#0a0f1a'};color:${isSel ? 'var(--theme-color,#00ff9d)' : '#9ca3af'};font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;cursor:pointer;text-align:center;transition:all .15s">
                                        ${attr}<br><span style="font-size:12px">+${bonusReq.amount}</span>
                                    </button>`;
                                }).join('')}
                            </div>
                        </div>`;
                    }
                }

                contentHtml = `<div class="space-y-6"><div class="text-center"><h2 class="text-3xl font-display font-bold text-white mb-1">${state.tempChar.name || 'Sem Nome'}</h2><span class="bg-[${color}]/20 text-[${color}] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-[${color}]/30">${state.tempChar.class}</span></div>${bonusHtml}<div class="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-4"><div class="flex justify-between border-b border-gray-800 pb-2"><span class="text-xs text-gray-500 uppercase">RaÃ§a</span><span class="text-sm font-bold text-white">${state.tempChar.race}</span></div><div class="flex justify-between border-b border-gray-800 pb-2"><span class="text-xs text-gray-500 uppercase">Antecedente</span><span class="text-sm font-bold text-white">${state.tempChar.background || '-'}</span></div>${state.tempChar.raceTraits && state.tempChar.raceTraits.length > 0 ? `<div><span class="text-xs text-gray-500 uppercase block mb-2">TraÃ§os Raciais Selecionados</span><div class="flex flex-wrap gap-1">${state.tempChar.raceTraits.map(t => { 
                    const detail = state.tempChar.traitDetails && state.tempChar.traitDetails[t];
                    return `<span class="text-[10px] bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">${t}${detail ? ': ' + detail : ''}</span>`;
                }).join('')}</div></div>` : ''}<div><span class="text-xs text-gray-500 uppercase block mb-2">Atributos Base</span><div class="grid grid-cols-6 gap-1 text-center">${Object.entries(state.tempChar.attributes).map(([k,v]) => `<div class="bg-black rounded p-1"><div class="text-[8px] text-gray-500">${k}</div><div class="text-xs font-bold text-white">${v}</div></div>`).join('')}</div></div><div><span class="text-xs text-gray-500 uppercase block mb-2">Treinamentos</span><div class="flex flex-wrap gap-1 mb-2">${state.tempChar.skills.length > 0 ? state.tempChar.skills.map(s => `<span class="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">${s}</span>`).join('') : '<span class="text-[10px] text-gray-600 italic">Nenhum treinamento principal</span>'}</div><div class="flex flex-wrap gap-1">${state.tempChar.otherSkills.length > 0 ? state.tempChar.otherSkills.map(s => `<span class="text-[10px] bg-gray-800 text-neon-blue/70 px-2 py-1 rounded border border-gray-700">${s}</span>`).join('') : '<span class="text-[10px] text-gray-600 italic">Nenhum treinamento extra</span>'}</div></div><div><span class="text-xs text-gray-500 uppercase block mb-2">InclinaÃ§Ãµes</span><div class="space-y-1">${state.tempChar.inclinations.positive.map(i => `<div class="text-[10px] text-neon-green flex justify-between"><span>+ ${i.nome}</span><span>${i.custo}</span></div>`).join('')}${state.tempChar.inclinations.negative.map(i => `<div class="text-[10px] text-neon-red flex justify-between"><span>- ${i.nome}</span><span>${i.valor}</span></div>`).join('')}</div></div></div>${!isBonusReady ? `<div class="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-pulse"><i data-lucide="alert-circle" size="20"></i> Aloque todos os pontos de bÃ´nus para finalizar.</div>` : ''}</div>`;
            }

            const footerBtn = step < 6 
                ? `<button onclick="nextCreatorStep()" class="flex-1 py-4 bg-neon-theme text-black font-bold rounded-xl hover:brightness-110 transition-colors text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(var(--theme-rgb),0.4)]">PRÃ“XIMO <i data-lucide="chevron-right" size="14" class="inline mb-0.5"></i></button>`
                : (() => {
                    const bonusReq = getBonusRequirements(state.tempChar.race);
                    const allocatedTotal = getAllocatedTotal();
                    const isBonusReady = !bonusReq || (bonusReq.type === 'wildcard' && allocatedTotal === bonusReq.amount) || (bonusReq.type === 'choice' && allocatedTotal === bonusReq.amount);
                    return `<button onclick="finishCreator()" ${!isBonusReady ? 'disabled' : ''} class="flex-1 py-4 ${isBonusReady ? 'bg-neon-theme text-black hover:brightness-110 shadow-[0_0_20px_rgba(var(--theme-rgb),0.6)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} font-bold rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"><i data-lucide="save" size="16"></i> FINALIZAR</button>`;
                })();

            container.innerHTML = `<div class="flex flex-col h-full bg-gray-950"><div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50"><button onclick="state.view='LIST'; render()" class="text-gray-500 hover:text-white flex items-center gap-1 text-[10px] uppercase font-bold"><i data-lucide="chevron-left" size="14"></i> Cancelar</button><div class="flex gap-1">${[0,1,2,3,4,5,6].map(i => `<div class="w-4 h-1 rounded-full ${i <= step ? 'bg-neon-theme shadow-[0_0_5px_var(--theme-color-hex)]' : 'bg-gray-800'} transition-all duration-300"></div>`).join('')}</div><div class="w-16"></div></div><div class="flex-1 p-6 overflow-y-auto custom-scrollbar relative"><h2 class="text-2xl font-display font-bold text-white text-center mb-6 tracking-widest drop-shadow-[0_0_10px_rgba(var(--theme-rgb),0.5)]">${title}</h2>${contentHtml}</div><div class="p-6 border-t border-gray-800 flex gap-4 bg-gray-900/50 pb-6 pb-safe">${step > 0 ? `<button onclick="state.creatorStep--; render()" class="w-1/3 py-4 bg-transparent border border-gray-700 rounded-xl text-gray-400 font-bold hover:text-white hover:border-gray-500 transition-colors text-xs uppercase tracking-wider">Voltar</button>` : '<div class="w-1/3"></div>'}${footerBtn}</div></div>`;
        }

        // --- SHEET RENDERER ---
