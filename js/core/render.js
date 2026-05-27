        // --- RENDERIZADORES ---
       function render(preserveScroll = false) {
    const app = document.getElementById('app');
    let scrollTop = 0;
    if (preserveScroll) {
        const scrollEl = app.querySelector('.custom-scrollbar');
        if (scrollEl) scrollTop = scrollEl.scrollTop;
    }

    app.innerHTML = '';
    // Remove banner de leitura se existir
    const _oldBanner = document.getElementById('readonly-banner');
    if (_oldBanner) _oldBanner.remove();

    if (state.view === 'LOGIN') {
        renderLogin(app);
    } else if (state.view === 'LIST') {
        if (!state.authorized) { state.view = 'LOGIN'; render(); return; }
        renderList(app);
    }
    else if (state.view === 'ADMIN') {
        if (!state.authorized) { state.view = 'LOGIN'; render(); return; }
        renderAdmin(app);
    }
    else if (state.view === 'MESTRE_PLAYERS') {
        if (!state.authorized) { state.view = 'LOGIN'; render(); return; }
        renderMestrePlayers(app);
    }
    else if (state.view === 'PLAYER_CHARS') {
        if (!state.authorized) { state.view = 'LOGIN'; render(); return; }
        renderPlayerChars(app);
    }
    else if (state.view === 'CREATOR') renderCreator(app);
    else if (state.view === 'SHEET') {
        renderSheet(app);
    }
    // ADICIONE AQUI:
    else if (state.view === 'HATSU_CREATOR') renderHatsuCreator(app);
    else if (state.view === 'HATSU_DETAIL') renderHatsuDetail(app);
    else if (state.view === 'BESTIARIO') {
        if (!state.authorized) { state.view = 'LOGIN'; render(); return; }
        renderBestiario(app);
    }

    // Roll Popup Overlay (O restante do seu cÃ³digo continua igual...)
    if (state.rollResult) {
        // ... (seu cÃ³digo do modal de rolagem)
    }

    if (preserveScroll && scrollTop > 0) {
        const newScrollEl = app.querySelector('.custom-scrollbar');
        if (newScrollEl) newScrollEl.scrollTop = scrollTop;
    }

    if (window.lucide) lucide.createIcons();

    // Modo leitura para Mestre: bloqueia interaÃ§Ã£o sem impedir scroll
    if (state.readOnly && state.view === 'SHEET') {
        // Torna o conteÃºdo da sheet nÃ£o-interativo (inert = sem cliques, sem foco, mas scroll ok)
        const sheetRoot = app.firstElementChild;
        if (sheetRoot) sheetRoot.setAttribute('inert', '');

        // Banner fixo com botÃ£o de voltar (fora do elemento inert)
        const banner = document.createElement('div');
        banner.id = 'readonly-banner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:7px 16px;background:#4c1d95;border-bottom:1px solid #7c3aed;display:flex;align-items:center;justify-content:space-between;z-index:9999;max-width:480px;margin:0 auto;';
        banner.innerHTML = `
            <span style="font-size:9px;font-weight:900;color:#e9d5ff;text-transform:uppercase;letter-spacing:.15em;font-family:'Orbitron',sans-serif">âš”ï¸ Leitura â€” ${state.viewingUser?.username || ''}</span>
            <button id="readonly-back-btn" style="font-size:9px;font-weight:900;color:#e9d5ff;background:#6d28d9;border:1px solid #a78bfa;border-radius:6px;padding:4px 12px;cursor:pointer;font-family:'Orbitron',sans-serif">â† Voltar</button>
        `;
        document.body.appendChild(banner);

        document.getElementById('readonly-back-btn').addEventListener('click', () => {
            state.readOnly = false;
            state.currentChar = state._prevChar || null;
            state._viewingMode = false;
            state.view = 'PLAYER_CHARS';
            render();
        });
    }
}
