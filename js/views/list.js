        function renderList(container) {
            setThemeColor('#00ff9d');
            const level0 = state.characters.filter(c => c.level === 0);
            const levelHigh = state.characters.filter(c => c.level > 0);
            const userAvatar = state.user && state.user.avatar 
                ? `https://cdn.discordapp.com/avatars/${state.user.id}/${state.user.avatar}.png` 
                : null;

            let html = `
                <div class="p-6 flex flex-col h-full">
                    <div class="flex justify-between items-center mb-6 mt-2">
                        <div class="flex items-center gap-3">
                            ${userAvatar ? `<img src="${userAvatar}" class="w-10 h-10 rounded-full border border-gray-700">` : `<div class="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"><i data-lucide="user" size="16"></i></div>`}
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Bem-vindo</span>
                                <span class="text-sm font-display font-bold text-white uppercase tracking-wide">${state.user ? state.user.username : 'Hunter'}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                            <div style="position:relative">
                                <button id="nav-hamburger" onclick="window._toggleNavMenu(event)"
                                    style="width:36px;height:36px;border-radius:8px;border:1px solid #1f2937;background:#0d1117;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;transition:border-color .15s,background .15s"
                                    onmouseover="this.style.background='#1f2937'" onmouseout="this.style.background='#0d1117'">
                                    <span style="display:block;width:14px;height:2px;background:#9ca3af;border-radius:1px"></span>
                                    <span style="display:block;width:14px;height:2px;background:#9ca3af;border-radius:1px"></span>
                                    <span style="display:block;width:14px;height:2px;background:#9ca3af;border-radius:1px"></span>
                                </button>
                                <div id="nav-dropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:#0d1117;border:1px solid #1f2937;border-radius:12px;padding:6px;min-width:175px;z-index:100;box-shadow:0 8px 32px rgba(0,0,0,.7)">
                                    ${state.isAdmin ? `<a href="/torre/"
                                        style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;border-radius:8px;color:#60a5fa;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;font-family:'Orbitron',sans-serif;transition:background .15s;text-decoration:none"
                                        onmouseover="this.style.background='#1e40af22'" onmouseout="this.style.background='transparent'">
                                        &#x1F3F0; Torre Celestial <span style="color:#6b7280;font-size:8px;margin-left:2px">(S&#xF3; para admin)</span>
                                    </a>` : ''}
                                    ${state.isMestre ? `<button onclick="state.view='MESTRE_PLAYERS';render()"
                                        style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;border-radius:8px;color:#a78bfa;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;font-family:'Orbitron',sans-serif;transition:background .15s"
                                        onmouseover="this.style.background='#7c3aed22'" onmouseout="this.style.background='transparent'">
                                        &#x2694;&#xFE0F; Jogadores
                                    </button>` : ''}
                                    ${(state.isMestre || state.isAdmin) ? `<button onclick="state.view='BESTIARIO';render()"
                                        style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;border-radius:8px;color:#fb923c;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;font-family:'Orbitron',sans-serif;transition:background .15s"
                                        onmouseover="this.style.background='#b4530022'" onmouseout="this.style.background='transparent'">
                                        &#x1F432; Besti&#xE1;rio
                                    </button>` : ''}
                                    ${state.isAdmin ? `
                                    <div style="height:1px;background:#1f2937;margin:4px 6px"></div>
                                    <button onclick="state.view='ADMIN';render()"
                                        style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:transparent;border-radius:8px;color:#f87171;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;font-family:'Orbitron',sans-serif;transition:background .15s"
                                        onmouseover="this.style.background='#dc262622'" onmouseout="this.style.background='transparent'">
                                        &#x1F6E1; Admin
                                    </button>` : ''}
                                </div>
                            </div>
                            <button onclick="logout()" style="width:36px;height:36px;border-radius:8px;border:1px solid transparent;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4b5563;transition:color .15s,border-color .15s,background .15s"
                                onmouseover="this.style.color='#f87171';this.style.borderColor='#7f1d1d55';this.style.background='#7f1d1d15'"
                                onmouseout="this.style.color='#4b5563';this.style.borderColor='transparent';this.style.background='transparent'">
                                <i data-lucide="log-out" size="18"></i>
                            </button>
                        </div>
                    </div>

                    ${state.isAdmin ? `<div onclick="window._manualSync()" style="display:flex;align-items:center;justify-content:space-between;background:#0a0f1a;border:1px solid #1f2937;border-radius:10px;padding:8px 12px;margin-bottom:12px;cursor:pointer" title="Clique para sincronizar agora">
                        <div style="display:flex;align-items:center;gap:6px">
                            <span style="font-size:10px">&#x2601;&#xFE0F;</span>
                            <span style="font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Sync Nuvem</span>
                            <span id="sync-status-badge" style="font-size:7px;font-weight:900;padding:2px 6px;border-radius:4px;background:#4ade8022;color:#4ade80">&#x2714; Ativo</span>
                        </div>
                        <span style="font-size:8px;color:#374151">&#x21BB; Sincronizar</span>
                    </div>` : ''}

                    <div class="text-center mb-8">
                        <h1 class="font-display font-black text-3xl tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">HxH 5e RPG</h1>
                        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">Banco de Dados</p>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-20">
            `;
            html += `<div><div class="flex items-center gap-2 mb-3"><i data-lucide="circle-dashed" class="text-gray-500 w-4 h-4"></i><h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Iniciantes (N&#xED;vel 0)</h2></div>`;
            if (level0.length === 0) html += `<div class="h-24 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 text-xs bg-gray-900/20">Nenhuma ficha de n&#xED;vel 0 encontrada.</div>`;
            else {
                level0.forEach(char => {
                    const color = SYSTEM_DB.classes.find(c => c.id === char.class)?.color || '#fff';
                    const avatar = char.imageUrl 
                        ? `<img src="${char.imageUrl}" class="w-12 h-12 rounded-full object-cover border border-gray-700 bg-gray-800" alt="${char.name}">`
                        : `<div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-500"><i data-lucide="user" size="20"></i></div>`;
                    
                    html += `<div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-all cursor-pointer relative group mb-2" onclick="selectChar('${char.id}')">
                        ${avatar}
                        <div class="flex-1">
                            <h3 class="font-display font-bold text-white text-base">${char.name}</h3>
                            <p class="text-[10px] text-gray-400 uppercase">${char.race} &#x2022; <span style="color:${color}">${char.class}</span></p>
                        </div>
                        <button onclick="event.stopPropagation(); deleteCharacter('${char.id}')" class="p-2 text-gray-600 hover:text-neon-red transition-colors"><i data-lucide="trash-2" size="16"></i></button>
                    </div>`;
                });
            }
            html += `</div><div><div class="flex items-center gap-2 mb-3"><i data-lucide="zap" class="text-neon-green w-4 h-4"></i><h2 class="text-xs font-bold text-neon-green uppercase tracking-widest">Usu&#xE1;rios de Nen (N&#xED;vel 1-12)</h2></div>`;
            if (levelHigh.length === 0) html += `<div class="h-24 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 text-xs bg-gray-900/20">Nenhum Hunter registrado.</div>`;
            else {
                levelHigh.forEach(char => {
                    const color = SYSTEM_DB.classes.find(c => c.id === char.class)?.color || '#fff';
                    const avatar = char.imageUrl 
                        ? `<img src="${char.imageUrl}" class="w-12 h-12 rounded-full object-cover border border-gray-700 bg-gray-800" alt="${char.name}">`
                        : `<div class="w-12 h-12 rounded bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-500"><i data-lucide="shield" size="20"></i></div>`;

                    html += `<div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-[${color}] transition-all cursor-pointer relative group mb-2" onclick="selectChar('${char.id}')" style="border-left: 3px solid ${color}">
                        ${avatar}
                        <div class="flex-1">
                            <h3 class="font-display font-bold text-white text-base">${char.name}</h3>
                            <p class="text-[10px] text-gray-400 uppercase">LVL ${char.level} &#x2022; <span style="color:${color}">${char.class}</span></p>
                        </div>
                        <button onclick="event.stopPropagation(); deleteCharacter('${char.id}')" class="p-2 text-gray-600 hover:text-neon-red transition-colors"><i data-lucide="trash-2" size="16"></i></button>
                    </div>`;
                });
            }
            html += `</div>`;
            html += `</div><div class="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-black to-transparent max-w-[480px] mx-auto">
                <button onclick="startCreator()" class="w-full py-4 bg-neon-green text-black font-black font-display tracking-widest rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> CRIAR NOVA FICHA</button>
            </div></div>`;
            container.innerHTML = html;
        }
