// --- AUTH & LOGIN ---
function loginDiscord() {
    const scope = 'identify guilds.members.read';
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.clientId}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = url;
}

function logoutDiscord() {
    localStorage.removeItem('discord_access_token');
    state.user = null;
    state.authorized = false;
    state.view = 'LOGIN';
    render();
}

function bypassLogin() {
    state.user = { username: 'Tester', id: '000000', avatar: null };
    state.authorized = true;
    state.view = 'LIST';
    render();
}

function bypassLoginAdmin() {
    state.user = { username: 'Tester Admin', id: '000000', avatar: null };
    state.authorized = true;
    state.isAdmin = true;
    state.isMestre = false;
    state.assignedPlayers = [];
    state.view = 'LIST';
    render();
}

function loginGoogle() {
    if (typeof google === 'undefined') {
        alert('Biblioteca do Google ainda carregando. Tente novamente em instantes.');
        return;
    }
    const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: 'openid profile email',
        callback: async (response) => {
            if (response.error) {
                alert('Erro ao autenticar com Google: ' + response.error);
                return;
            }
            try {
                const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${response.access_token}` }
                });
                if (!profileRes.ok) throw new Error('Falha ao buscar perfil');
                const profile = await profileRes.json();

                localStorage.setItem('google_access_token', response.access_token);
                localStorage.removeItem('discord_access_token');
                localStorage.setItem('last_auth_provider', 'google');
                state.user = {
                    id: 'google_' + profile.sub,
                    username: profile.name,
                    email: profile.email,
                    avatar: profile.picture,
                    loginProvider: 'google'
                };
                state.authorized = true;
                state.view = 'LIST';
                loadAdminRegistry().then(registry => {
                    state.adminRegistry = registry;
                    const roles = checkUserRoles(state.user.id, registry);
                    state.isAdmin = roles.isAdmin;
                    state.isMestre = roles.isMestre;
                    state.assignedPlayers = roles.assignedPlayers;
                    render(true);
                });
                render();
                syncFromCloud().then(() => { loadCharacters(); saveToCloudNow(); registerUserInRegistry(); render(true); });
            } catch (e) {
                console.error('Google Auth Error', e);
                alert('Erro ao buscar perfil do Google. Tente novamente.');
            }
        }
    });
    client.requestAccessToken();
}

function logoutGoogle() {
    const token = localStorage.getItem('google_access_token');
    if (token && typeof google !== 'undefined') {
        google.accounts.oauth2.revoke(token, () => {});
    }
    localStorage.removeItem('google_access_token');
    state.user = null;
    state.authorized = false;
    state.view = 'LOGIN';
    render();
}

function logout() {
    if (state.user && state.user.loginProvider === 'google') {
        logoutGoogle();
    } else {
        logoutDiscord();
    }
}

async function checkDiscordAuth() {
    const _fragment = new URLSearchParams(window.location.hash.slice(1));
    const _freshDiscordToken = _fragment.get('access_token');
    if (_freshDiscordToken) {
        localStorage.removeItem('google_access_token');
        localStorage.setItem('last_auth_provider', 'discord');
    }

    const lastProvider = localStorage.getItem('last_auth_provider');
    const hasDiscordStored = !!localStorage.getItem('discord_access_token');
    const googleToken = !_freshDiscordToken
        && lastProvider === 'google'
        && !hasDiscordStored
        && localStorage.getItem('google_access_token');
    if (googleToken) {
        try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${googleToken}` }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                state.user = {
                    id: 'google_' + profile.sub,
                    username: profile.name,
                    email: profile.email,
                    avatar: profile.picture,
                    loginProvider: 'google'
                };
                state.authorized = true;
                state.view = 'LIST';
                loadAdminRegistry().then(registry => {
                    state.adminRegistry = registry;
                    const roles = checkUserRoles(state.user.id, registry);
                    state.isAdmin = roles.isAdmin;
                    state.isMestre = roles.isMestre;
                    state.assignedPlayers = roles.assignedPlayers;
                    render(true);
                });
                render();
                syncFromCloud().then(() => { loadCharacters(); render(true); });
                return;
            }
        } catch (e) { /* token expirado, continua para Discord */ }
        localStorage.removeItem('google_access_token');
    }

    let accessToken = _freshDiscordToken;

    if (accessToken) {
        window.history.replaceState(null, null, window.location.pathname);
        localStorage.setItem('discord_access_token', accessToken);
        localStorage.setItem('last_auth_provider', 'discord');
    } else {
        accessToken = localStorage.getItem('discord_access_token');
    }

    if (!accessToken) {
        state.authorized = false;
        state.view = 'LOGIN';
        render();
        return;
    }

    try {
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userRes.ok) throw new Error('Invalid Token');
        const user = await userRes.json();
        state.user = user;

        if (PAID_USERS.includes(user.id) || ADMIN_USERS.includes(user.id)) {
            state.authorized = true;
            state.view = 'LIST';
            loadAdminRegistry().then(registry => {
                state.adminRegistry = registry;
                const roles = checkUserRoles(user.id, registry);
                state.isAdmin = roles.isAdmin;
                state.isMestre = roles.isMestre;
                state.assignedPlayers = roles.assignedPlayers;
                render(true);
            });
            render();
            syncFromCloud().then(() => { loadCharacters(); saveToCloudNow(); registerUserInRegistry(); render(true); });
            return;
        }

        const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.guildId}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (memberRes.ok) {
            const member = await memberRes.json();
            if (member.roles && member.roles.includes(DISCORD_CONFIG.roleId)) {
                state.authorized = true;
                state.view = 'LIST';
                loadAdminRegistry().then(registry => {
                    state.adminRegistry = registry;
                    const roles = checkUserRoles(user.id, registry);
                    state.isAdmin = roles.isAdmin;
                    state.isMestre = roles.isMestre;
                    state.assignedPlayers = roles.assignedPlayers;
                    render(true);
                });
            } else {
                alert('Acesso Negado: Você não possui o cargo necessário no servidor.');
                logoutDiscord();
                return;
            }
        } else {
            alert('Acesso Negado: Você não é membro do servidor oficial.');
            logoutDiscord();
            return;
        }
        render();
        syncFromCloud().then(() => { loadCharacters(); saveToCloudNow(); registerUserInRegistry(); render(true); });

    } catch (e) {
        console.error("Auth Error", e);
        logoutDiscord();
    }
}

// ══════════════════════════════════════════════════════════
//  ADMIN REGISTRY — gerenciamento de admins e mestres
// ══════════════════════════════════════════════════════════

async function loadAdminRegistry() {
    const [usersData, adminsData, mestresData] = await Promise.all([
        sbSelect('users', 'select=*'),
        sbSelect('admins', 'select=*'),
        sbSelect('mestres', 'select=*')
    ]);
    if (!usersData || !adminsData || !mestresData) return null;
    const mestreMap = {};
    mestresData.forEach(m => {
        if (!mestreMap[m.mestre_id]) mestreMap[m.mestre_id] = [];
        mestreMap[m.mestre_id].push(m.player_id);
    });
    return { admins: adminsData.map(a => a.user_id), mestres: mestreMap, users: usersData };
}

async function registerUserInRegistry() {
    if (!state.user) return;
    await sbUpsert('users', { id: state.user.id, username: state.user.username, avatar: state.user.avatar, last_seen: new Date().toISOString() });
    const registry = await loadAdminRegistry();
    if (registry) state.adminRegistry = registry;
}

function checkUserRoles(userId, registry) {
    if (!registry) return { isAdmin: false, isMestre: false, assignedPlayers: [] };
    const isAdmin = (registry.admins || []).includes(userId) || ADMIN_USERS.includes(userId);
    const mestreData = (registry.mestres || {})[userId];
    const isMestre = !!mestreData;
    const assignedPlayerIds = mestreData || [];
    const assignedPlayers = (registry.users || []).filter(u => assignedPlayerIds.includes(u.id));
    return { isAdmin, isMestre, assignedPlayers };
}

async function adminGrantAdmin(targetUserId) {
    await sbUpsert('admins', { user_id: targetUserId });
    const registry = await loadAdminRegistry();
    state.adminRegistry = registry;
    render(true);
}

async function adminRevokeAdmin(targetUserId) {
    await sbDelete('admins', `user_id=eq.${targetUserId}`);
    const registry = await loadAdminRegistry();
    state.adminRegistry = registry;
    render(true);
}

async function adminAssignMestre(mestreId, playerIds) {
    await sbDelete('mestres', `mestre_id=eq.${mestreId}`);
    if (playerIds.length > 0) {
        await sbUpsert('mestres', playerIds.map(pid => ({ mestre_id: mestreId, player_id: pid })));
    }
    const registry = await loadAdminRegistry();
    state.adminRegistry = registry;
    render(true);
}

async function adminRevokeMestre(mestreId) {
    await adminAssignMestre(mestreId, []);
}

async function fetchUserChars(userId) {
    if (!userId) return [];
    const data = await sbSelect('characters', `user_id=eq.${userId}&select=data&order=last_mod.desc`);
    if (!data) return [];
    return data.map(row => row.data).filter(Boolean);
}

async function viewUserChars(user) {
    state.viewingUser = user;
    state.viewingChars = [];
    state.view = 'PLAYER_CHARS';
    render();
    const chars = await fetchUserChars(user.id);
    state.viewingChars = chars;
    render(true);
}

async function saveViewingChar(char) {
    const user = state.viewingUser;
    if (!user) return;
    char.lastMod = new Date().toISOString();
    await sbUpsert('characters', { id: char.id, user_id: user.id, data: char, last_mod: char.lastMod });
    const chars = await fetchUserChars(user.id);
    state.viewingChars = chars;
    render(true);
}
