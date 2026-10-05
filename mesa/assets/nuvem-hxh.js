/* ==========================================================
   MESA VIRTUAL — ponte com o HxH5e
   Mesma interface do nuvem.js do Sistema Shinobi (window.Nuvem),
   mas usando o Supabase, a sessão e as fichas do HxH5e.

   - Sem login próprio: lê a sessão que o HxH5e grava em
     localStorage (hxh_hunter_session), igual à Torre Celestial.
   - Sem Supabase Auth: o id do usuário vai explícito em cada
     gravação (owner, user_id), no mesmo padrão do resto do app.
   - Imagens vão para o bucket "mesa" do Storage, nunca em base64
     dentro das linhas (o tempo real ficaria pesado).
   ========================================================== */
(function () {
  const SB_URL = 'https://qbppvrsevwucrbrtdonx.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicHB2cnNldnd1Y3JicnRkb254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA3OTgsImV4cCI6MjA5MTI5Njc5OH0.HCLqFi7jTrRpNZymWjGs-O2L3uPjWHGzD2Z2k2Dce-M';
  const BUCKET = 'mesa';
  const APP_URL = '../HxH5e.html';
  const ok = !!(window.supabase && window.supabase.createClient);
  // persistSession desligado: não existe sessão do Supabase Auth, só a chave pública.
  const sb = ok ? window.supabase.createClient(SB_URL, KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }) : null;

  const listeners = new Set();
  let user = null;
  const papel = { isAdmin: false, isMestre: false };

  function lerSessao() {
    try {
      const s = JSON.parse(localStorage.getItem('hxh_hunter_session') || 'null');
      return s && s.id ? s : null;
    } catch (e) { return null; }
  }

  // Avatar do Discord vem como hash na tabela users; o do Google já é URL.
  function avatarUrl(id, avatar) {
    if (!avatar) return '';
    if (/^https?:/.test(avatar)) return avatar;
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
  }

  async function iniciar() {
    const s = lerSessao();
    if (!s || !sb) return null;
    const adminsFixos = typeof ADMIN_USERS !== 'undefined' ? ADMIN_USERS : [];
    const [bl, ad, ms] = await Promise.all([
      sb.from('bloqueados').select('user_id').eq('user_id', s.id),
      sb.from('admins').select('user_id').eq('user_id', s.id),
      sb.from('mestres').select('mestre_id').eq('mestre_id', s.id).limit(1),
    ]);
    // Mesma regra do login do HxH5e: falha de leitura não bloqueia ninguém.
    if (bl.data && bl.data.length && !adminsFixos.includes(s.id)) {
      alert('Acesso bloqueado: sua conta não tem permissão para usar este app.');
      location.href = APP_URL;
      return null;
    }
    papel.isAdmin = adminsFixos.includes(s.id) || !!(ad.data && ad.data.length);
    papel.isMestre = !!(ms.data && ms.data.length);
    user = { id: s.id, nome: s.username || 'Hunter', email: s.email || '', avatar: s.avatar || '' };
    return user;
  }
  const ready = iniciar();

  // Logout feito no HxH5e em outra aba derruba a mesa também.
  addEventListener('storage', e => {
    if (e.key !== 'hxh_hunter_session') return;
    const s = lerSessao();
    if (!s || !user || s.id !== user.id) { user = null; listeners.forEach(fn => fn(null)); }
  });

  function perfil() {
    if (!user) return null;
    return { id: user.id, nome: user.nome, email: user.email, avatar: user.avatar };
  }

  // Não há login na mesa: quem não está logado volta para o HxH5e.
  async function entrar() { location.href = APP_URL; }
  async function sair() { location.href = APP_URL; }

  // Perfis dos participantes, no formato que a mesa espera (id, nome, avatar_url).
  async function perfis(ids) {
    if (!ids.length) return [];
    const { data } = await sb.from('users').select('id, username, avatar').in('id', ids);
    return (data || []).map(u => ({ id: u.id, nome: u.username || 'Hunter', avatar_url: avatarUrl(u.id, u.avatar) }));
  }

  /* ---------- Fichas do HxH5e (tabela characters, JSON em "data") ---------- */
  async function listar() {
    if (!user) return [];
    const { data, error } = await sb.from('characters').select('id, data, last_mod').eq('user_id', user.id).order('last_mod', { ascending: false });
    if (error) throw error;
    return (data || []).filter(r => r.data).map(r => ({ id: r.id, nome: r.data.name || 'Sem nome', dados: r.data, token_url: null }));
  }
  async function obter(id) {
    const { data, error } = await sb.from('characters').select('id, data').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? { id: data.id, nome: (data.data || {}).name || 'Sem nome', dados: data.data || {} } : null;
  }

  /* ---------- Regras do HxH5e usadas na mesa ---------- */
  const ATRS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'PRE'];
  const mod = v => v ? Math.floor((v - 10) / 2) : 0;                       // = getMod do HxH5e
  const prof = nivel => Math.max(2, Math.floor(((nivel || 0) - 1) / 4) + 2); // = getProficiencyBonus
  function classe(c) {
    const lista = (typeof SYSTEM_DB !== 'undefined' && SYSTEM_DB.classes) || [];
    return lista.find(x => x.id === (c && c.class)) || null;
  }
  // Resumo da ficha para a mesa. Usa o valor base dos atributos: os bônus de
  // Hatsu/princípios vivem no sheet.js, que não é carregado aqui.
  function resumo(c) {
    c = c || {};
    const at = c.attributes || {}, sk = c.skills || [], v = c.vitals || {};
    const pb = prof(c.level);
    const attrs = {};
    ATRS.forEach(k => {
      const valor = (at[k] && at[k].value) || 10, m = mod(valor), tr = sk.includes('TR de ' + k);
      attrs[k] = { valor, mod: m, tr, save: m + (tr ? pb : 0) };
    });
    const ini = attrs.DES.mod + (sk.includes('Iniciativa') ? pb : 0);
    return {
      nome: c.name || 'Sem nome', nivel: c.level || 0, pb, classe: classe(c), attrs, iniciativa: ini,
      hp: v.hp || 0, hpMax: v.hpMax || 0, aura: v.aura || 0, auraMax: v.auraMax || 0,
    };
  }

  /* ---------- Imagens (bucket "mesa") ---------- */
  function carregarImg(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Arquivo de imagem inválido.'));
      img.src = src;
    });
  }
  function paraBlob(c, q) {
    return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('Não deu para converter a imagem.')), 'image/webp', q));
  }
  async function quadrado(src, lado = 256) {
    const img = await carregarImg(src);
    const c = document.createElement('canvas'); c.width = c.height = lado;
    const m = Math.min(img.width, img.height);
    c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
    return paraBlob(c, 0.88);
  }
  async function reduzido(src, max) {
    const img = await carregarImg(src);
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return paraBlob(c, 0.86);
  }
  async function subir(blob, pasta) {
    const id = (user ? user.id : 'anon').replace(/[^\w-]/g, '_');
    const path = `${pasta}/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  function validar(file) {
    if (!user) throw new Error('Entre no HxH5e primeiro.');
    if (!/^image\//.test(file.type)) throw new Error('Escolha uma imagem (PNG, JPG ou WebP).');
  }
  async function enviarToken(file) {
    validar(file);
    const url = URL.createObjectURL(file);
    try { return await subir(await quadrado(url), 'tokens'); } finally { URL.revokeObjectURL(url); }
  }
  async function enviarImagem(file, max = 2400) {
    validar(file);
    const url = URL.createObjectURL(file);
    try { return await subir(await reduzido(url, max), 'cenas'); } finally { URL.revokeObjectURL(url); }
  }
  // A foto da ficha fica em base64 dentro do JSON. Para o token, ela é reduzida
  // a 256 px e enviada uma vez por ficha+foto (cache local pelo tamanho da string).
  async function tokenDaFicha(c) {
    const src = c && c.imageUrl;
    if (!src) return null;
    const chave = 'hxh-mesa-tok-' + c.id;
    try { const k = JSON.parse(localStorage.getItem(chave) || 'null'); if (k && k.n === src.length) return k.url; } catch (e) {}
    const url = await subir(await quadrado(src), 'tokens');
    try { localStorage.setItem(chave, JSON.stringify({ n: src.length, url })); } catch (e) {}
    return url;
  }

  /* ---------- Menu do usuário (topo do lobby) ---------- */
  function montarMenu(el) {
    if (!el) return;
    const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    ready.then(() => {
      const p = perfil();
      if (!p) { el.innerHTML = ''; return; }
      const foto = p.avatar ? `<img src="${esc(p.avatar)}" alt="" referrerpolicy="no-referrer">` : `<span>${esc((p.nome || '?')[0])}</span>`;
      el.innerHTML = `<a class="me" href="${APP_URL}" title="Voltar para o HxH5e">${foto.replace('<img', '<img class="av"').replace('<span>', '<span class="av">')}${esc(p.nome)}</a>`;
    });
  }

  window.Nuvem = {
    sb, disponivel: ok, ready, APP_URL,
    get user() { return user; }, perfil, papel,
    get podeNarrar() { return papel.isAdmin || papel.isMestre; },
    onAuth(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    entrar, sair, perfis, listar, obter, resumo, classe,
    enviarToken, enviarImagem, tokenDaFicha, montarMenu,
  };
})();
