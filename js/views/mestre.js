        function renderMestrePlayers(container) {
            if (!state.isMestre) { state.view = 'LIST'; render(); return; }
            const players = state.assignedPlayers || [];
            const rows = players.length === 0
                ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:32px 0;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhum jogador atribuÃ­do ainda.</div>'
                : players.map(u => {
                    const avatar = u.avatar ? `<img src="https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png" style="width:40px;height:40px;border-radius:50%;border:1px solid #374151">` : `<div style="width:40px;height:40px;border-radius:50%;background:#1f2937;display:flex;align-items:center;justify-content:center;color:#6b7280">?</div>`;
                    return `<div onclick="viewUserChars(${JSON.stringify(u).replace(/"/g,'&quot;')})" style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='#7c3aed'" onmouseout="this.style.borderColor='#1f2937'">
                        ${avatar}
                        <div>
                            <div style="font-weight:900;color:#fff;font-size:13px">${u.username || u.id}</div>
                            <div style="font-size:9px;color:#6b7280;margin-top:2px">Ver fichas â†’</div>
                        </div>
                    </div>`;
                }).join('');

            container.innerHTML = `
                <div style="background:#0a0a0f;min-height:100%;display:flex;flex-direction:column">
                    <div style="padding:16px;border-bottom:1px solid #1f2937;display:flex;align-items:center;gap:12px;flex-shrink:0">
                        <button onclick="state.view='LIST';render()" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px"><i data-lucide="arrow-left" size="20"></i></button>
                        <div>
                            <div style="font-size:9px;color:#a78bfa;font-weight:900;text-transform:uppercase;letter-spacing:.15em">Mestre</div>
                            <div style="font-size:16px;font-weight:900;color:#fff;font-family:'Orbitron',sans-serif">JOGADORES</div>
                        </div>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px">${rows}</div>
                </div>`;
            if (window.lucide) lucide.createIcons();
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        //  RENDER PLAYER CHARS â€” fichas de outro usuÃ¡rio
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        function renderPlayerChars(container) {
            const user = state.viewingUser;
            const chars = state.viewingChars || [];
            const backView = state.isAdmin ? 'ADMIN' : 'MESTRE_PLAYERS';
            const level0 = chars.filter(c => c.level === 0);
            const levelHigh = chars.filter(c => c.level > 0);

            const makeCard = (char, canEdit) => {
                const color = SYSTEM_DB.classes.find(c => c.id === char.class)?.color || '#fff';
                const avatar = char.imageUrl
                    ? `<img src="${char.imageUrl}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid #374151">`
                    : `<div style="width:44px;height:44px;border-radius:50%;background:#1f2937;display:flex;align-items:center;justify-content:center;color:#6b7280"><i data-lucide="user" size="18"></i></div>`;
                return `<div onclick="window._openViewingChar('${char.id}')" style="background:#111827;border:1px solid #1f2937;border-left:3px solid ${color};border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer" onmouseover="this.style.borderColor='${color}'" onmouseout="this.style.borderLeftColor='${color}';this.style.borderTopColor='#1f2937';this.style.borderRightColor='#1f2937';this.style.borderBottomColor='#1f2937'">
                    ${avatar}
                    <div style="flex:1">
                        <div style="font-weight:900;color:#fff;font-size:13px">${char.name}</div>
                        <div style="font-size:9px;color:#9ca3af;text-transform:uppercase">${char.race || ''} â€¢ <span style="color:${color}">${char.class || ''}</span> ${char.level > 0 ? `â€¢ Lv ${char.level}` : ''}</div>
                    </div>
                </div>`;
            };

            const rows0 = level0.length === 0
                ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:20px;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhuma ficha nÃ­vel 0.</div>'
                : level0.map(c => makeCard(c, state.isAdmin)).join('');
            const rowsH = levelHigh.length === 0
                ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:20px;border:2px dashed #1f2937;border-radius:12px;font-size:11px">Nenhum Hunter.</div>'
                : levelHigh.map(c => makeCard(c, state.isAdmin)).join('');

            const userAvatar = user && user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" style="width:36px;height:36px;border-radius:50%;border:1px solid #374151">` : '';

            container.innerHTML = `
                <div style="background:#0a0a0f;min-height:100%;display:flex;flex-direction:column">
                    <div style="padding:16px;border-bottom:1px solid #1f2937;display:flex;align-items:center;gap:10px;flex-shrink:0">
                        <button onclick="state.view='${backView}';state.viewingUser=null;state.viewingChars=[];render()" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:4px"><i data-lucide="arrow-left" size="20"></i></button>
                        ${userAvatar}
                        <div>
                            <div style="font-size:9px;color:#60a5fa;font-weight:900;text-transform:uppercase;letter-spacing:.1em">Fichas de</div>
                            <div style="font-size:15px;font-weight:900;color:#fff;font-family:'Orbitron',sans-serif">${user ? user.username : ''}</div>
                        </div>
                        ${state.isAdmin ? '<span style="margin-left:auto;font-size:8px;background:#dc262633;color:#f87171;border-radius:4px;padding:3px 8px;font-weight:900">MODO ADMIN</span>' : '<span style="margin-left:auto;font-size:8px;background:#7c3aed33;color:#a78bfa;border-radius:4px;padding:3px 8px;font-weight:900">LEITURA</span>'}
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px">
                        ${chars.length === 0 ? '<div style="text-align:center;color:#4b5563;font-style:italic;padding:40px;border:2px dashed #1f2937;border-radius:12px">Carregando fichas...</div>' : ''}
                        ${chars.length > 0 ? `<div style="font-size:9px;color:#4b5563;font-weight:900;text-transform:uppercase;margin-bottom:8px">NÃ­vel 0</div>${rows0}<div style="font-size:9px;color:#4ade80;font-weight:900;text-transform:uppercase;margin:16px 0 8px">UsuÃ¡rios de Nen</div>${rowsH}` : ''}
                    </div>
                </div>`;

            window._openViewingChar = function(charId) {
                const char = state.viewingChars.find(c => c.id === charId);
                if (!char) return;
                state._prevChar = state.currentChar;
                state._viewingMode = true;
                state.readOnly = !state.isAdmin;
                state.currentChar = char;
                state.view = 'SHEET';
                state.activeTab = 'FICHA';
                render();
            };

            if (window.lucide) lucide.createIcons();
        }
