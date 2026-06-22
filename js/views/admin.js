        function renderAdmin(container) {
            if (!state.isAdmin) { state.view = 'LIST'; render(); return; }
            const registry = state.adminRegistry || { admins: [], mestres: {}, users: [] };
            const users = registry.users || [];
            const admins = registry.admins || [];
            const mestres = registry.mestres || {};

            const userRows = users.map(u => {
                const isAdm = admins.includes(u.id) || ADMIN_USERS.includes(u.id);
                const isHardcoded = ADMIN_USERS.includes(u.id);
                const isMst = !!mestres[u.id];
                const avatar = u.avatar ? `<img src="https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png" style="width:32px;height:32px;border-radius:50%;border:1px solid #374151">` : `<div style="width:32px;height:32px;border-radius:50%;background:#1f2937;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:14px">?</div>`;
                return `<div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:12px 14px;margin-bottom:8px">
                    <div style="display:flex;align-items:center;gap:10px">
                        ${avatar}
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:900;color:#fff;font-size:12px">${u.username || u.id}</div>
                            <div style="font-size:9px;color:#4b5563;font-family:monospace">${u.id}</div>
                            <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
                                ${isAdm ? `<span style="font-size:8px;background:#dc262633;color:#f87171;border-radius:4px;padding:2px 6px;font-weight:900">🛡️ ADMIN${isHardcoded?' (fixo)':''}</span>` : ''}
                                ${isMst ? `<span style="font-size:8px;background:#7c3aed33;color:#a78bfa;border-radius:4px;padding:2px 6px;font-weight:900">⚔️ MESTRE</span>` : ''}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
                            <button onclick="viewUserChars(${JSON.stringify(u).replace(/"/g,'&quot;')})" style="padding:5px 8px;border-radius:7px;background:#0f2937;border:1px solid #1e4a6f;color:#60a5fa;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">Ver Fichas</button>
                            ${!isHardcoded && isAdm ? `<button onclick="adminRevokeAdmin('${u.id}')" style="padding:5px 8px;border-radius:7px;background:#3b0f0f;border:1px solid #7f1d1d;color:#f87171;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">– Admin</button>` : ''}
                            ${!isAdm ? `<button onclick="adminGrantAdmin('${u.id}')" style="padding:5px 8px;border-radius:7px;background:#0f1f3b;border:1px solid #1e3a6e;color:#93c5fd;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">+ Admin</button>` : ''}
                            ${isMst ? `<button onclick="adminRevokeMestre('${u.id}')" style="padding:5px 8px;border-radius:7px;background:#2e1065;border:1px solid #4c1d95;color:#c4b5fd;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">– Mestre</button>` : `<button onclick="window._openMestreModal('${u.id}')" style="padding:5px 8px;border-radius:7px;background:#1a0a3a;border:1px solid #4c1d95;color:#a78bfa;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">+ Mestre</button>`}
                        </div>
                    </div>
                    ${isMst ? `<div style="margin-top:8px;padding:8px;background:#0d0d18;border-radius:8px;border:1px solid #2d1a5e">
                        <div style="font-size:8px;color:#7c3aed;font-weight:900;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Jogadores atribuídos:</div>
                        ${(mestres[u.id]||[]).length === 0 ? '<div style="font-size:9px;color:#4b5563;font-style:italic">Nenhum</div>' : (mestres[u.id]||[]).map(pid => { const pu = users.find(x=>x.id===pid); return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px"><span style="font-size:10px;color:#c4b5fd">${pu?pu.username:pid}</span><button onclick="window._removeMestrePlayer('${u.id}','${pid}')" style="font-size:10px;background:none;border:none;color:#7f1d1d;cursor:pointer">✕</button></div>`; }).join('')}
                    </div>` : ''}
                </div>`;
            }).join('');

            const setupSection = '';

            container.innerHTML = `
                <div style="background:#0a0a0f;min-height:100%;display:flex;flex-direction:column">
                    <div style="padding:16px;border-bottom:1px solid #1f2937;display:flex;align-items:center;gap:12px;flex-shrink:0">
                        <button onclick="state.view='LIST';render()" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px"><i data-lucide="arrow-left" size="20"></i></button>
                        <div>
                            <div style="font-size:9px;color:#f87171;font-weight:900;text-transform:uppercase;letter-spacing:.15em">Painel</div>
                            <div style="font-size:16px;font-weight:900;color:#fff;font-family:'Orbitron',sans-serif">ADMINISTRAÇÃO</div>
                        </div>
                        <button onclick="window._reloadRegistry()" style="margin-left:auto;padding:6px 10px;background:#111827;border:1px solid #374151;border-radius:8px;color:#9ca3af;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif">â†» Atualizar</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px">
                        ${setupSection}
                        <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:16px">
                            <div style="font-size:9px;color:#f87171;font-weight:900;text-transform:uppercase;letter-spacing:.15em;margin-bottom:10px">🛡️ Adicionar Admin por ID</div>
                            <div style="display:flex;gap:8px">
                                <input id="new-admin-id-input" type="text" placeholder="Discord User ID (ex: 123456789012345678)" style="flex:1;padding:8px 12px;background:#0d1117;border:1px solid #374151;border-radius:8px;color:#e5e7eb;font-size:11px;font-family:monospace;outline:none" />
                                <button onclick="window._addAdminById()" style="padding:8px 14px;background:#7f1d1d;border:1px solid #991b1b;border-radius:8px;color:#fca5a5;font-size:9px;font-weight:900;text-transform:uppercase;cursor:pointer;font-family:'Orbitron',sans-serif;white-space:nowrap">+ Admin</button>
                            </div>
                        </div>
                        <div style="font-size:9px;color:#6b7280;font-weight:900;text-transform:uppercase;letter-spacing:.15em;margin-bottom:12px">Usuários Registrados (${users.length})</div>
                        ${users.length === 0 ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:32px 0;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhum usuário registrado ainda.</div>' : userRows}
                    </div>
                </div>
                <!-- Modal atribuir mestre -->
                <div id="mestre-modal" style="display:none;position:fixed;inset:0;background:#000000bb;z-index:999;display:flex;align-items:center;justify-content:center;padding:20px">
                    <div style="background:#111827;border:1px solid #374151;border-radius:16px;padding:20px;width:100%;max-width:360px">
                        <div style="font-size:11px;font-weight:900;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">Atribuir como Mestre</div>
                        <div id="mestre-modal-target" style="font-size:10px;color:#9ca3af;margin-bottom:12px"></div>
                        <div style="font-size:9px;color:#6b7280;margin-bottom:8px">Selecione os jogadores que este mestre pode ver:</div>
                        <div id="mestre-player-list" style="max-height:200px;overflow-y:auto;margin-bottom:14px"></div>
                        <div style="display:flex;gap:8px">
                            <button onclick="document.getElementById('mestre-modal').style.display='none'" style="flex:1;padding:10px;border-radius:9px;background:#1f2937;border:none;color:#9ca3af;font-size:9px;font-weight:900;cursor:pointer;font-family:'Orbitron',sans-serif">Cancelar</button>
                            <button onclick="window._confirmMestreModal()" style="flex:1;padding:10px;border-radius:9px;background:#4c1d95;border:none;color:#c4b5fd;font-size:9px;font-weight:900;cursor:pointer;font-family:'Orbitron',sans-serif">Confirmar</button>
                        </div>
                    </div>
                </div>`;

            document.getElementById('mestre-modal').style.display = 'none';

            window._addAdminById = async function() {
                const input = document.getElementById('new-admin-id-input');
                const targetId = (input ? input.value : '').trim();
                if (!targetId || !/^\d{17,20}$/.test(targetId)) {
                    alert('ID inválido. Digite um Discord User ID válido (17-20 dígitos numéricos).');
                    return;
                }
                if (ADMIN_USERS.includes(targetId)) { alert('Este usuário já é admin fixo (hardcoded).'); return; }
                const existing = await sbSelect('admins', `user_id=eq.${targetId}&select=user_id`);
                if (existing && existing.length > 0) { alert('Este ID já é admin.'); return; }
                await sbUpsert('admins', { user_id: targetId });
                if (input) input.value = '';
                const registry = await loadAdminRegistry();
                state.adminRegistry = registry;
                render(true);
            };

            window._reloadRegistry = async function() {
                const reg = await loadAdminRegistry();
                state.adminRegistry = reg;
                const roles = checkUserRoles(state.user.id, reg);
                state.isAdmin = roles.isAdmin;
                state.isMestre = roles.isMestre;
                state.assignedPlayers = roles.assignedPlayers;
                render();
            };

            window._openMestreModal = function(mestreId) {
                const reg = state.adminRegistry || { admins:[], mestres:{}, users:[] };
                const users = reg.users || [];
                const targetUser = users.find(u => u.id === mestreId);
                document.getElementById('mestre-modal-target').textContent = 'Mestre: ' + (targetUser ? targetUser.username : mestreId);
                const existing = (reg.mestres || {})[mestreId] || [];
                const listEl = document.getElementById('mestre-player-list');
                listEl.innerHTML = users.filter(u => u.id !== mestreId).map(u => `
                    <label style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:#0d1117">
                        <input type="checkbox" value="${u.id}" ${existing.includes(u.id)?'checked':''} style="width:14px;height:14px;accent-color:#7c3aed">
                        <span style="font-size:11px;color:#e5e7eb">${u.username || u.id}</span>
                    </label>`).join('');
                document.getElementById('mestre-modal').style.display = 'flex';
                window._pendingMestreId = mestreId;
            };

            window._confirmMestreModal = function() {
                const checked = [...document.querySelectorAll('#mestre-player-list input[type=checkbox]:checked')].map(el => el.value);
                adminAssignMestre(window._pendingMestreId, checked);
                document.getElementById('mestre-modal').style.display = 'none';
            };

            window._removeMestrePlayer = function(mestreId, playerId) {
                const reg = state.adminRegistry || { admins:[], mestres:{}, users:[] };
                const current = (reg.mestres || {})[mestreId] || [];
                adminAssignMestre(mestreId, current.filter(id => id !== playerId));
            };

            if (window.lucide) lucide.createIcons();
        }
