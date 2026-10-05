/* ==========================================================
   SISTEMA SHINOBI — gerador de battlemaps
   Mapa = receita { tipo, seed, mix, layout } → SVG determinístico.
   "mix" é a quantidade de cada elemento, de 0 a 100% (0 = não entra).
   Todo navegador desenha o mesmo mapa a partir da mesma receita.
   1 célula = 64 px = 1,5 m.

   As peças vêm da biblioteca (assets/blocos.js) e ganham a cor da sua
   função: cobertura (azul-marinho), elevação (laranja), água (azul-claro),
   árvores (verde) e pedras (preto). O chão é só uma tinta clara.
   ========================================================== */
window.MapGen = (function () {
  const C = 64;

  const TIPOS = [
    { id: 'vila',        grupo: 'Urbano',   nome: 'Vila',          ico: 'buildings',      desc: 'Ruas, telhados e praça' },
    { id: 'residencial', grupo: 'Urbano',   nome: 'Residencial',   ico: 'house-line',     desc: 'Casas por dentro, com jardim', planta: true },
    { id: 'comercial',   grupo: 'Urbano',   nome: 'Comercial',     ico: 'storefront',     desc: 'Biblioteca, academia, lámen…', planta: true },
    { id: 'treino',      grupo: 'Urbano',   nome: 'Campo de treino', ico: 'target',       desc: 'Alvos, postes e a pedra memorial' },
    { id: 'dungeon',     grupo: 'Urbano',   nome: 'Dungeon',       ico: 'castle-turret',  desc: 'Salas de pedra e corredores' },
    { id: 'floresta',    grupo: 'Natureza', nome: 'Floresta',      ico: 'tree-evergreen', desc: 'Árvores, trilhas, rios e pedras' },
    { id: 'aquatico',    grupo: 'Natureza', nome: 'Aquático',      ico: 'waves',          desc: 'Tudo é água: ilhas, barcos, porto' },
    { id: 'deserto',     grupo: 'Natureza', nome: 'Deserto',       ico: 'cactus',         desc: 'Dunas, rochas e ruínas' },
    { id: 'neve',        grupo: 'Natureza', nome: 'Neve',          ico: 'snowflake',      desc: 'Pinheiros, gelo e rochas' },
    { id: 'montanha',    grupo: 'Natureza', nome: 'Montanha',      ico: 'mountains',      desc: 'Rochedos e penhascos' },
    { id: 'caverna',     grupo: 'Natureza', nome: 'Caverna',       ico: 'mountains',      desc: 'Galerias de pedra, poças' },
  ];
  // Elementos controlados pelos sliders (0 a 100%, de 20 em 20)
  const ELEMENTOS = {
    casas:     { nome: 'Casas', desc: 'telhados da vila' },
    arvores:   { nome: 'Árvores e mato', desc: 'copas, arbustos, bambu' },
    pedras:    { nome: 'Pedras', desc: 'rochas, lascas, escombros' },
    relevo:    { nome: 'Terreno elevado', desc: 'morros e curvas de nível' },
    agua:      { nome: 'Rios e lagos', desc: 'água que corta o mapa' },
    pontes:    { nome: 'Pontes', desc: 'sobre rios e entre ilhas' },
    objetos:   { nome: 'Objetos', desc: 'peças de cena e cobertura' },
    penhascos: { nome: 'Penhascos', desc: 'paredões intransponíveis' },
    moveis:    { nome: 'Móveis', desc: 'quanto mobiliário extra' },
    salas:     { nome: 'Salas', desc: 'quantas câmaras' },
    espaco:    { nome: 'Espaço aberto', desc: 'galerias largas ou estreitas' },
    textura:   { nome: 'Texturas', desc: 'hachuras de chão e detalhes' },
    ilhas:     { nome: 'Ilhas', desc: 'terra no meio da água' },
    barcos:    { nome: 'Embarcações', desc: 'barcos, sampans, juncos' },
    porto:     { nome: 'Porto', desc: 'cais, píeres e carga' },
  };
  const PADRAO = {
    vila:        { casas: 60, arvores: 40, objetos: 40, agua: 0, pontes: 0, relevo: 0, textura: 60 },
    residencial: { moveis: 60, arvores: 40, pedras: 20, textura: 60 },
    comercial:   { moveis: 60, arvores: 20, pedras: 0, textura: 40 },
    treino:      { objetos: 60, arvores: 60, pedras: 20, relevo: 0, textura: 60 },
    dungeon:     { salas: 60, pedras: 40, objetos: 40, textura: 40 },
    floresta:    { arvores: 80, pedras: 40, relevo: 40, agua: 20, pontes: 40, textura: 60 },
    aquatico:    { ilhas: 40, barcos: 40, porto: 40, arvores: 60, pedras: 40, pontes: 20, textura: 60 },
    deserto:     { pedras: 60, relevo: 60, arvores: 20, objetos: 40, textura: 80 },
    neve:        { arvores: 60, pedras: 40, relevo: 40, agua: 20, pontes: 20, textura: 60 },
    montanha:    { pedras: 80, relevo: 80, penhascos: 40, arvores: 20, textura: 60 },
    caverna:     { espaco: 60, pedras: 60, agua: 20, textura: 60 },
  };
  const VERTICAL = { aquatico: ['ilhas', 'barcos', 'porto'] }; // escolhas em lista vertical, com quantidade
  const ANTIGOS = { casa: { tipo: 'residencial', layout: 'casaG1' }, biblioteca: { tipo: 'comercial', layout: 'biblioteca' }, lago: { tipo: 'floresta', mix: { arvores: 40, pedras: 30, relevo: 20, agua: 100, pontes: 20, textura: 60 } } };
  const DENS = [0.3, 0.5, 0.75, 1, 1.35, 1.75];

  /* ---------- paleta ---------- */
  const COR = { cob: '#1f2d52', alto: '#e0742a', agua: '#4a9ad0', arv: '#3b8a4e', pedra: '#1d1d1f' };
  const AGUA_CLARA = '#d9e9f4';
  const LEG = {
    cob:   { cor: COR.cob,   nome: 'Cobertura / obstáculo' },
    alto:  { cor: COR.alto,  nome: 'Terreno elevado' },
    agua:  { cor: COR.agua,  nome: 'Água' },
    arv:   { cor: COR.arv,   nome: 'Árvores e mato' },
    pedra: { cor: COR.pedra, nome: 'Pedras' },
  };
  const CHAO = {
    grama:  { bg: '#e9eee3', linha: '#6f8a62', nome: 'Grama' },
    areia:  { bg: '#f3ead7', linha: '#a88a55', nome: 'Areia' },
    neve:   { bg: '#eef3f7', linha: '#7c93a6', nome: 'Neve' },
    rocha:  { bg: '#e8e5df', linha: '#7d766b', nome: 'Rocha e cascalho' },
    madeira:{ bg: '#f0e7da', linha: '#9a7b58', nome: 'Assoalho' },
    pedra:  { bg: '#e7e5e1', linha: '#827d74', nome: 'Piso de pedra' },
    agua:   { bg: AGUA_CLARA, linha: '#4a7fa6', nome: 'Água' },
  };
  const CHAO_TIPO = { vila: 'grama', residencial: 'grama', comercial: 'grama', treino: 'grama', dungeon: 'pedra', floresta: 'grama', aquatico: 'agua', deserto: 'areia', neve: 'neve', montanha: 'rocha', caverna: 'rocha' };

  /* ---------- aleatório determinístico ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.range = (a, b) => a + r() * (b - a);
    r.int = (a, b) => Math.floor(a + r() * (b - a + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    return r;
  }
  const f1 = n => Math.round(n * 10) / 10;
  let USO = new Set(), CLIP = 0, FUNDO = '#f4f2ec', CHAO_ATUAL = CHAO.grama;
  const usa = k => USO.add(k);
  // Blocos da biblioteca desenham em preto; aqui ganham a cor da categoria
  const BL = (lista, id) => window.Blocos[lista].find(b => b.id === id);
  function tinge(svg, cor, fundo) { return svg.replace(/#161616/g, cor).replace(/fill="#fff"/g, `fill="${fundo}"`).replace(/stroke="#fff"/g, `stroke="${fundo.split('"')[0]}"`); }
  const naCaixa = (svg, x, y, w, h, rot = 0) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) translate(${f1(-w / 2)} ${f1(-h / 2)})">${svg}</g>`;
  const VERDE = `${COR.arv}" fill-opacity=".07`;
  const OBJ = (cor, larg = 2.5, fo = .1) => `fill="${cor}" fill-opacity="${fo}" stroke="${cor}" stroke-width="${larg}" stroke-linejoin="round"`;
  function bloco(lista, id, x, y, rot = 0, cor = COR.cob, r) { usa(cor === COR.pedra ? 'pedra' : cor === COR.agua ? 'agua' : 'cob'); const b = BL(lista, id); return naCaixa(tinge(b.f(r), cor, FUNDO), x, y, b.w, b.h, rot); }
  const movel = (id, x, y, rot = 0) => bloco('MOVEIS', id, x, y, rot);
  const objeto = (id, x, y, rot = 0) => bloco('OBJETOS', id, x, y, rot);

  /* ---------- ocupação (para os objetos não se sobreporem) ---------- */
  function Grade(cols, rows) {
    const o = new Uint8Array(cols * rows), m = new Uint8Array(cols * rows);
    return {
      semTextura(x, y, w = 1, h = 1) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < cols && j < rows) m[j * cols + i] = 1; },
      texturaOk(x, y) { return x >= 0 && y >= 0 && x < cols && y < rows && !m[y * cols + x]; },
      livre(x, y, w = 1, h = 1) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { if (i < 0 || j < 0 || i >= cols || j >= rows || o[j * cols + i]) return false; } return true; },
      marca(x, y, w = 1, h = 1) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < cols && j < rows) o[j * cols + i] = 1; },
    };
  }

  /* ---------- formas orgânicas ---------- */
  function blob(r, cx, cy, rx, ry, n = 16, irr = .25) {
    return Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, d = 1 + r.range(-irr, irr); return [cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d]; });
  }
  function suave(P) { // caminho fechado suave pelos pontos médios
    const n = P.length; let d = '';
    for (let i = 0; i < n; i++) {
      const p = P[i], q = P[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      if (i === 0) d += `M${f1(m[0])} ${f1(m[1])}`;
      const s = P[(i + 2) % n], m2 = [(q[0] + s[0]) / 2, (q[1] + s[1]) / 2];
      d += ` Q${f1(q[0])} ${f1(q[1])} ${f1(m2[0])} ${f1(m2[1])}`;
    }
    return d + 'Z';
  }
  const escala = (P, cx, cy, s, dx = 0, dy = 0) => P.map(([x, y]) => [cx + dx + (x - cx) * s, cy + dy + (y - cy) * s]);


  /* ---------- relevo ---------- */
  // curvas de nível: anéis concêntricos irregulares; o topo leva uma cruz
  function relevo(r, cx, cy, rx, ry, aneis, cor, op, comTopo) {
    const base = blob(r, cx, cy, rx, ry, 18, .22);
    const ddx = r.range(-.25, .25) * rx, ddy = r.range(-.25, .25) * ry; // o pico não fica no centro
    let s = '';
    for (let i = 0; i < aneis; i++) {
      const t = i / aneis, k = 1 - t * .88;
      const P = escala(base, cx, cy, k, ddx * t, ddy * t).map(([x, y]) => [x + r.range(-5, 5), y + r.range(-5, 5)]);
      const tracej = i % 4 === 3 ? ' stroke-dasharray="10 7"' : '';
      s += `<path d="${suave(P)}" fill="${comTopo && i === aneis - 1 ? cor : 'none'}" fill-opacity=".14" stroke="${cor}" stroke-opacity="${op * (i === 0 ? .7 : 1)}" stroke-width="${i % 5 === 0 ? 2.4 : 1.5}"${tracej}/>`;
    }
    if (comTopo) { const px = cx + ddx, py = cy + ddy; s += `<path d="M${f1(px - 9)} ${f1(py)}h18M${f1(px)} ${f1(py - 9)}v18" stroke="${cor}" stroke-width="2" stroke-opacity="${op}"/>`; }
    return s;
  }

  function relevoFundo(r, cols, rows, linha, q = 1) { // textura do chão: curvas de nível bem apagadas
    let s = '';
    const n = Math.max(1, Math.round(cols * rows / 260 * q * 1.6));
    for (let i = 0; i < n; i++) s += relevo(r, r.range(0, cols) * C, r.range(0, rows) * C, r.range(5, 11) * C, r.range(4, 9) * C, r.int(6, 10), linha, .16, false);
    return s;
  }
  // morro: curvas de nível de verdade da biblioteca
  const RELEVOS = ['pico', 'duplo', 'sela', 'ingreme', 'rampa', 'planalto', 'colinas', 'macico', 'vale', 'meandro', 'cratera'];
  function morro(r, cx, cy, R) {
    usa('alto');
    const tipo = r.pick(RELEVOS), W = R * r.range(2.3, 2.9), H = R * r.range(1.8, 2.2), flip = r() < .5 ? -1 : 1;
    return `<g opacity=".85" transform="translate(${f1(cx)} ${f1(cy)}) scale(${flip} 1) translate(${f1(-W / 2)} ${f1(-H / 2)})">${tinge(BL('TOPOS', tipo).f(r, W, H), COR.alto, FUNDO)}</g>`;
  }

  /* ---------- peças de natureza ---------- */
  const COPAS = ['raiosBorda', 'serrilhada', 'seixos', 'raios', 'raiosBorda', 'serrilhada'];
  function arvore(r, x, y, rad, ids = COPAS) { usa('arv'); return tinge(BL('ARVORES', r.pick(ids)).f(r, x, y, rad), COR.arv, VERDE) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.6" fill="${COR.arv}"/>`; }
  const pinheiro = (r, x, y, rad) => (usa('arv'), tinge(BL('ARVORES', 'conifera').f(r, x, y, rad), COR.arv, VERDE));
  const arbusto = (r, x, y, rad) => (usa('arv'), tinge(BL('ARVORES', r() < .8 ? 'arbusto' : 'bambu').f(r, x, y, rad * 1.1), COR.arv, VERDE));
  function rocha(r, x, y, rad, ids) {
    usa('pedra');
    ids = ids || (rad > C * .8 ? ['rochedo', 'sombreada', 'facetada'] : rad < C * .3 ? ['facetada', 'cristal'] : ['facetada', 'sombreada', 'cristal', 'facetada']);
    return tinge(BL('PEDRAS', r.pick(ids)).f(r, x, y, rad), COR.pedra, FUNDO);
  }
  // Textura do chão: tufos de grama, pontilhado de areia, cascalho; pula água, caminhos e casas
  function textura(r, cols, rows, grade, tipoChao, linha, k) {
    const dens = { grama: 2.2, areia: 9, neve: 1.6, rocha: 4 }[tipoChao];
    if (!dens) return '';
    if (!(k > 0)) return '';
    const n = Math.round(cols * rows * dens * k);
    let d = '', pedr = '';
    for (let i = 0; i < n; i++) {
      const x = r.range(0, cols), y = r.range(0, rows);
      if (!grade.texturaOk(Math.floor(x), Math.floor(y))) continue;
      const px = x * C, py = y * C;
      if (tipoChao === 'grama') d += `M${f1(px)} ${f1(py)}l-3 -7M${f1(px)} ${f1(py)}l0 -9M${f1(px)} ${f1(py)}l3 -7`;
      else if (tipoChao === 'rocha' && r() < .18) pedr += `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(r.range(3, 7))}" ry="${f1(r.range(2, 5))}" fill="none" stroke="${linha}" stroke-width="1"/>`;
      else d += `M${f1(px)} ${f1(py)}h.1`;
    }
    const traco = tipoChao === 'grama' ? `stroke-width="1.1" stroke-opacity=".3"` : `stroke-width="${tipoChao === 'areia' ? 2.2 : 2.6}" stroke-opacity="${tipoChao === 'neve' ? .22 : .32}"`;
    return `<path d="${d}" stroke="${linha}" ${traco} stroke-linecap="round" fill="none"/>${pedr ? `<g stroke-opacity=".4">${pedr}</g>` : ''}`;
  }

  function trilha(r, cols, rows, larg, chao, grade) {
    const horiz = r() < .5, pts = [];
    const n = horiz ? cols : rows;
    let off = (horiz ? rows : cols) * r.range(.3, .7);
    for (let i = -1; i <= n + 1; i += 2) { off += r.range(-1.6, 1.6); off = Math.max(2, Math.min((horiz ? rows : cols) - 3, off)); pts.push(horiz ? [i, off] : [off, i]); }
    // curva suave pelos pontos médios
    let d = `M${f1(pts[0][0] * C)} ${f1(pts[0][1] * C)}`;
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += ` Q${f1(pts[i][0] * C)} ${f1(pts[i][1] * C)} ${f1(m[0] * C)} ${f1(m[1] * C)}`; }
    const u = pts[pts.length - 1]; d += ` L${f1(u[0] * C)} ${f1(u[1] * C)}`;
    let pedras = '';
    pts.forEach(([x, y], i) => {
      if (!i) return; const [px, py] = pts[i - 1];
      for (let t = 0; t <= 1; t += .1) { const cx = px + (x - px) * t, cy = py + (y - py) * t; grade.marca(Math.round(cx - larg / 2), Math.round(cy - larg / 2), Math.round(larg), Math.round(larg)); grade.semTextura(Math.floor(cx - larg / 2), Math.floor(cy - larg / 2), Math.ceil(larg), Math.ceil(larg)); }
      // pedras irregulares pelo caminho (calçamento solto)
      const seg = Math.hypot(x - px, y - py), nn = Math.round(seg * 1.6);
      for (let j = 0; j < nn; j++) {
        const t = j / nn, cx = (px + (x - px) * t) * C + r.range(-larg * C * .32, larg * C * .32), cy = (py + (y - py) * t) * C + r.range(-larg * C * .32, larg * C * .32);
        if (r() < .55) pedras += `<path d="${suave(blob(r, cx, cy, r.range(9, 17), r.range(7, 13), 7, .3))}"/>`;
      }
    });
    const W = larg * C;
    return `<path d="${d}" fill="none" stroke="${chao.linha}" stroke-opacity=".55" stroke-width="${f1(W)}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${chao.bg}" stroke-width="${f1(W - 5)}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${chao.linha}" stroke-opacity=".08" stroke-width="${f1(W - 5)}" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="${chao.linha}" fill-opacity=".06" stroke="${chao.linha}" stroke-opacity=".45" stroke-width="1.2">${pedras}</g>`;
  }

  function lago(r, cols, rows, grade, esc = .3, gelo = false) {
    usa('agua');
    const cx = cols * r.range(.35, .65) * C, cy = rows * r.range(.35, .65) * C, R = Math.min(cols, rows) * esc * C;
    const P = blob(r, cx, cy, R * r.range(.9, 1.15), R * r.range(.75, 1), 14, .2);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const dx = ((x + .5) * C - cx) / (R * 1.2), dy = ((y + .5) * C - cy) / (R * 1.2); if (dx * dx + dy * dy < 1.05) { grade.marca(x, y); grade.semTextura(x, y); } }
    const id = 'lg' + (++CLIP), contorno = suave(P);
    let s = `<path d="${contorno}" fill="${COR.agua}" fill-opacity="${gelo ? .1 : .16}" stroke="${COR.agua}" stroke-width="3"/>`;
    s += `<path d="${suave(escala(P, cx, cy, 1.08))}" fill="none" stroke="${COR.agua}" stroke-width="1.2" stroke-opacity=".45" stroke-dasharray="3 7" stroke-linecap="round"/>`; // margem úmida
    [.78, .55].forEach((k, i) => { s += `<path d="${suave(escala(P, cx, cy, k))}" fill="none" stroke="${COR.agua}" stroke-width="1.3" stroke-opacity="${.6 - i * .15}"/>`; });
    if (!gelo) { // ondas dentro da água
      let d = '';
      for (let yy = cy - R * 1.2, i = 0; yy < cy + R * 1.2; yy += 26, i++) { const off = (i % 2) * 30; d += `M${f1(cx - R * 1.3 - off)} ${f1(yy)}`; for (let xx = 0; xx < R * 2.8; xx += 60) d += ` q15 -7 30 0 t30 0`; }
      s += `<clipPath id="${id}"><path d="${contorno}"/></clipPath><path d="${d}" clip-path="url(#${id})" fill="none" stroke="${COR.agua}" stroke-width="1.1" stroke-opacity=".45"/>`;
    }
    if (gelo) for (let i = 0; i < 4; i++) { const a = r.range(0, Math.PI * 2); s += `<path d="M${f1(cx)} ${f1(cy)} l${f1(Math.cos(a) * R * .35)} ${f1(Math.sin(a) * R * .35)} l${f1(r.range(-20, 20))} ${f1(r.range(-20, 20))}" fill="none" stroke="${COR.agua}" stroke-width="1.3" stroke-opacity=".7"/>`; }
    return s;
  }

  function penhasco(r, cols, rows) { // linha de obstáculo com hachuras
    usa('cob');
    const x0 = r.range(0, cols) * C, y0 = r.range(0, rows) * C, ang = r.range(0, Math.PI), len = r.range(5, 12) * C, n = 10;
    const P = Array.from({ length: n + 1 }, (_, i) => { const t = i / n, o = Math.sin(t * Math.PI * 2 + r()) * 40; return [x0 + Math.cos(ang) * len * t - Math.sin(ang) * o, y0 + Math.sin(ang) * len * t + Math.cos(ang) * o]; });
    let s = `<polyline points="${P.map(p => p.map(f1).join(',')).join(' ')}" fill="none" stroke="${COR.cob}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i < n; i++) { const [a, b] = [P[i], P[i + 1]]; for (let t = .15; t < 1; t += .3) { const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; s += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x - dy / L * 14)}" y2="${f1(y + dx / L * 14)}" stroke="${COR.cob}" stroke-width="1.6" stroke-opacity=".75"/>`; } }
    return s;
  }

  // Rio: faixa de água que atravessa o mapa; devolve os pontos para as pontes
  function rio(r, cols, rows, larg, grade) {
    usa('agua');
    const horiz = r() < .5, pts = [], n = horiz ? cols : rows;
    let off = (horiz ? rows : cols) * r.range(.25, .75);
    for (let i = -1; i <= n + 1; i += 2) { off += r.range(-1.8, 1.8); off = Math.max(2, Math.min((horiz ? rows : cols) - 3, off)); pts.push(horiz ? [i, off] : [off, i]); }
    let d = `M${f1(pts[0][0] * C)} ${f1(pts[0][1] * C)}`;
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += ` Q${f1(pts[i][0] * C)} ${f1(pts[i][1] * C)} ${f1(m[0] * C)} ${f1(m[1] * C)}`; }
    const u = pts[pts.length - 1]; d += ` L${f1(u[0] * C)} ${f1(u[1] * C)}`;
    pts.forEach(([x, y], i) => { if (!i) return; const [px, py] = pts[i - 1]; for (let t = 0; t <= 1; t += .1) { const cx = px + (x - px) * t, cy = py + (y - py) * t; grade.marca(Math.round(cx - larg / 2), Math.round(cy - larg / 2), Math.round(larg), Math.round(larg)); grade.semTextura(Math.floor(cx - larg / 2), Math.floor(cy - larg / 2), Math.ceil(larg) + 1, Math.ceil(larg) + 1); } });
    const W = larg * C;
    return { pts, larg, svg: `<path d="${d}" fill="none" stroke="${COR.agua}" stroke-width="${f1(W + 6)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${AGUA_CLARA}" stroke-width="${f1(W)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${COR.agua}" stroke-width="1.3" stroke-opacity=".5" stroke-dasharray="18 14"/><path d="${d}" fill="none" stroke="${COR.agua}" stroke-width="1" stroke-opacity=".35" stroke-dasharray="6 22" transform="translate(0 ${f1(W * .22)})"/>` };
  }
  // Ponte genérica: centro (x,y), ângulo do vão, comprimento e largura em px
  function ponte(x, y, ang, len, larg = 46) {
    usa('cob');
    let s = `<rect x="${f1(-len / 2)}" y="${f1(-larg / 2)}" width="${f1(len)}" height="${larg}" fill="${FUNDO}" stroke="${COR.cob}" stroke-width="2"/>`;
    for (let t = -len / 2 + 9; t < len / 2; t += 9) s += `<line x1="${f1(t)}" y1="${f1(-larg / 2)}" x2="${f1(t)}" y2="${f1(larg / 2)}" stroke="${COR.cob}" stroke-width=".8"/>`;
    s += `<line x1="${f1(-len / 2)}" y1="${f1(-larg / 2 + 3)}" x2="${f1(len / 2)}" y2="${f1(-larg / 2 + 3)}" stroke="${COR.cob}" stroke-width="3.2"/><line x1="${f1(-len / 2)}" y1="${f1(larg / 2 - 3)}" x2="${f1(len / 2)}" y2="${f1(larg / 2 - 3)}" stroke="${COR.cob}" stroke-width="3.2"/>`;
    [-1, 1].forEach(a => [-1, 1].forEach(b => { s += `<circle cx="${f1(a * len / 2)}" cy="${f1(b * (larg / 2 - 3))}" r="5" fill="${FUNDO}" stroke="${COR.cob}" stroke-width="2"/>`; }));
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})">${s}</g>`;
  }
  function pontesNoRio(r, R, qtd) {
    let s = ''; const P = R.pts, usados = [];
    for (let i = 0; i < qtd; i++) {
      let k, t = 0; do { k = r.int(2, P.length - 3); t++; } while (usados.some(u => Math.abs(u - k) < 2) && t < 20);
      usados.push(k);
      const a = P[k - 1], b = P[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 90;
      s += ponte(P[k][0] * C, P[k][1] * C, ang, R.larg * C + 70);
    }
    return s;
  }
  function espalha(r, cols, rows, grade, qtd, tam, desenha) {
    let out = '', tent = qtd * 6;
    for (let k = 0; k < qtd && tent > 0; tent--) {
      const x = r.int(0, cols - tam), y = r.int(0, rows - tam);
      if (!grade.livre(x, y, tam, tam)) continue;
      grade.marca(x, y, tam, tam); out += desenha(x, y); k++;
    }
    return out;
  }

  // quantidade a partir do slider: 60% equivale ao padrão de antes
  const qtd = (area, base, pct) => pct <= 0 ? 0 : Math.max(1, Math.round(area * base * pct / 60));

  /* ---------- telhados (vila) ---------- */
  // Casa da vila vista de cima: só o telhado (o tipo depende do formato do terreno)
  function telhado(r, x, y, w, h) {
    usa('cob');
    const X = x * C + 6, Y = y * C + 6, W = w * C - 12, H = h * C - 12;
    const quadrada = Math.abs(w - h) <= 1 && w <= 5;
    const id = quadrada ? r.pick(['hougyo', 'yosemune', 'shiroko', 'irimoya']) : r.pick(['yosemune', 'irimoya', 'kiritsuma', 'koshi', 'shiroko', 'emL', 'emT', 'anexo', 'irimoya', 'yosemune']);
    const op = r() < .22 ? { telhas: true } : r() < .3 ? { estilo: 'onda', gap: 5 } : {};
    const b = BL('TELHADOS', id);
    const sx = r() < .5 ? -1 : 1, sy = (id === 'emL' && r() < .5) ? -1 : 1;
    return `<g transform="translate(${f1(X + W / 2)} ${f1(Y + H / 2)}) scale(${sx} ${sy}) translate(${f1(-X - W / 2)} ${f1(-Y - H / 2)})">${tinge(b.f(r, X, Y, W, H, op), COR.cob, '#f3f4f7')}</g>`;
  }

  /* ---------- ambientes por dentro (plantas da biblioteca) ---------- */
  const rotulo = (x, y, t, linha) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Nunito, sans-serif" font-weight="800" font-size="11" letter-spacing="1.5" fill="${linha}" fill-opacity=".75">${t}</text>`;
  function tatame(X, Y, W, H, linha) { // esteiras 1×2 alternando a direção
    const a = 38, b = 76; let d = '';
    for (let yy = Y, lin = 0; yy < Y + H - 4; yy += a, lin++) {
      const off = lin % 2 ? a : 0;
      d += `M${f1(X)} ${f1(Math.min(yy + a, Y + H))}H${f1(X + W)}`;
      for (let xx = X + off; xx < X + W; xx += b) if (xx > X + 2) d += `M${f1(xx)} ${f1(yy)}V${f1(Math.min(yy + a, Y + H))}`;
    }
    return `<path d="${d}" stroke="${linha}" stroke-width="1" stroke-opacity=".38" fill="none"/>`;
  }

  // porta de correr (fusuma/shoji): vão na parede + duas folhas deslocadas
  function portaCorrer(x1, y1, x2, y2, larg, bg) {
    const vert = x1 === x2, c = COR.cob;
    if (vert) return `<rect x="${f1(x1 - larg)}" y="${f1(y1)}" width="${f1(larg * 2)}" height="${f1(y2 - y1)}" fill="${bg}"/><line x1="${f1(x1 - 3)}" y1="${f1(y1)}" x2="${f1(x1 - 3)}" y2="${f1(y1 + (y2 - y1) * .6)}" stroke="${c}" stroke-width="2"/><line x1="${f1(x1 + 3)}" y1="${f1(y1 + (y2 - y1) * .4)}" x2="${f1(x1 + 3)}" y2="${f1(y2)}" stroke="${c}" stroke-width="2"/>`;
    return `<rect x="${f1(x1)}" y="${f1(y1 - larg)}" width="${f1(x2 - x1)}" height="${f1(larg * 2)}" fill="${bg}"/><line x1="${f1(x1)}" y1="${f1(y1 - 3)}" x2="${f1(x1 + (x2 - x1) * .6)}" y2="${f1(y1 - 3)}" stroke="${c}" stroke-width="2"/><line x1="${f1(x1 + (x2 - x1) * .4)}" y1="${f1(y1 + 3)}" x2="${f1(x2)}" y2="${f1(y1 + 3)}" stroke="${c}" stroke-width="2"/>`;
  }

  function mesa(x, y, w, h, cadeiras) {
    usa('cob');
    let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="4" ${OBJ(COR.cob, 2.4, .1)}/>`;
    if (cadeiras) { const cs = 18; for (let xx = x + 10; xx + cs <= x + w - 6; xx += 40) s += `<rect x="${f1(xx)}" y="${f1(y - cs - 5)}" width="${cs}" height="${cs}" rx="4" fill="none" stroke="${COR.cob}" stroke-width="1.5" stroke-opacity=".6"/><rect x="${f1(xx)}" y="${f1(y + h + 5)}" width="${cs}" height="${cs}" rx="4" fill="none" stroke="${COR.cob}" stroke-width="1.5" stroke-opacity=".6"/>`; }
    return s;
  }
  function estante(x, y, w, h) {
    usa('cob');
    const horiz = w >= h;
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" ${OBJ(COR.cob, 2.4, .16)}/>` +
      (horiz ? `<line x1="${f1(x + 4)}" y1="${f1(y + h / 2)}" x2="${f1(x + w - 4)}" y2="${f1(y + h / 2)}" stroke="${COR.cob}" stroke-width="1.2" stroke-opacity=".6" stroke-dasharray="7 5"/>`
        : `<line x1="${f1(x + w / 2)}" y1="${f1(y + 4)}" x2="${f1(x + w / 2)}" y2="${f1(y + h - 4)}" stroke="${COR.cob}" stroke-width="1.2" stroke-opacity=".6" stroke-dasharray="7 5"/>`);
  }

  const NOMES_COMODO = { sala: 'SALA', cozinha: 'COZINHA', quarto: 'QUARTO', banho: 'BANHO', corredor: '', jardim: 'JARDIM', deposito: 'DEPÓSITO', escritorio: 'ESCRITÓRIO', aula: 'SALA DE AULA', salao: 'SALÃO', loja: 'LOJA', acervo: 'ACERVO', leitura: 'LEITURA', recepcao: 'RECEPÇÃO', reuniao: 'REUNIÃO', enfermaria: 'ENFERMARIA' };
  // Móveis por cômodo. X,Y,W,H em px (área interna). m = quantidade de móveis (0 a 1+)
  function comodo(r, tipo, X, Y, W, H, chao, m) {
    const L = chao.linha;
    let s = '';
    const extra = (p) => m > 0 && r() < p * m; // móveis opcionais aparecem mais com o slider alto
    if (tipo === 'sala' || tipo === 'quarto') s += tatame(X, Y, W, H, L);
    if (tipo === 'jardim') {
      s += `<rect x="${f1(X)}" y="${f1(Y)}" width="${f1(W)}" height="${f1(H)}" fill="${CHAO.grama.bg}"/>`;
      let d = ''; for (let yy = Y + 10; yy < Y + H - 4; yy += 9) d += `M${f1(X + 6)} ${f1(yy)}q${f1(W / 8)} -4 ${f1(W / 4)} 0t${f1(W / 4)} 0t${f1(W / 4)} 0t${f1(W / 4 - 12)} 0`;
      s += `<path d="${d}" fill="none" stroke="${CHAO.areia.linha}" stroke-width=".9" stroke-opacity=".5"/>`; // areia rastelada
      s += arvore(r, X + W * .35, Y + H * .38, Math.min(W, H) * .28, ['raiosBorda', 'serrilhada']) + rocha(r, X + W * .7, Y + H * .7, Math.min(W, H) * .13, ['facetada', 'sombreada']);
    } else if (m <= 0) { /* sem móveis */ }
    else if (tipo === 'sala') {
      const nx = Math.max(1, Math.min(3, Math.floor(W / 230))), ny = Math.max(1, Math.min(2, Math.floor(H / 200)));
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const cx = X + W / nx * (i + .5), cy = Y + H / ny * (j + .5);
        s += (nx * ny === 1 && r() < .35 && W > 110 && H > 110) ? movel('irori', cx, cy) : (W / nx > 120 && H / ny > 100 ? movel('chabudai', cx, cy) : '');
      }
      if (W > 150 && H > 90) s += movel('tokonoma', X + W - 52, Y + 22);
      if (W > 200 && H > 160 && extra(.8)) s += movel('andon', X + 20, Y + 20);
      if (W > 260 && H > 160 && extra(.5)) s += movel('byobu', X + W / 2, Y + H - 16);
    } else if (tipo === 'cozinha') {
      s += movel('kamado', X + 52, Y + 25);
      if (W >= 236) s += movel('bancada', X + 108 + 62, Y + 22);
      else if (H >= 140) s += movel('bancada', X + 22, Y + 52 + 62, 90);
      if (W > 110 && H > 110 && extra(.9)) s += movel('barril', X + W - 26, Y + H - 26);
      if (W > 230 && H > 220) s += movel('mesa', X + W / 2, Y + H / 2 + 20);
    } else if (tipo === 'quarto') {
      const emPe = H >= 112, n = Math.max(1, Math.min(4, Math.floor(((emPe ? W : H) - 60) / 54)));
      for (let i = 0; i < n; i++) s += emPe ? movel('futon', X + 30 + i * 54, Y + 10 + 43) : movel('futon', X + 10 + 43, Y + 26 + i * 54, 90);
      if ((emPe ? W - 60 - n * 54 : W - 110) > 40) s += movel('tansu', X + W - 34, Y + 20);
      if (W > 170 && H > 150 && extra(.8)) s += movel('andon', X + W - 20, Y + H - 20);
    } else if (tipo === 'banho') {
      if (W >= 120 && H >= 90) s += movel('ofuro', X + W - 58, Y + 44);
      let d = ''; for (let yy = Y + 8; yy < Y + H - 6; yy += 10) d += `M${f1(X + 6)} ${f1(yy)}H${f1(X + Math.max(30, Math.min(W * .4, W - 124)))}`;
      s += `<path d="${d}" stroke="${L}" stroke-width="1" stroke-opacity=".35"/>`;
    } else if (tipo === 'deposito') {
      const n = Math.max(1, Math.round(W * H / 5000 * m));
      for (let i = 0; i < n; i++) { const x = X + r.range(28, W - 28), y = Y + r.range(28, H - 28); s += r() < .55 ? movel('caixote', x, y, r.pick([0, 8, -6])) : movel('barril', x, y); }
    } else if (tipo === 'escritorio') {
      s += movel('mesaEscritorio', X + W / 2, Y + Math.min(H / 2, 70));
      if (W > 150) s += movel('prateleira', X + W / 2, Y + H - 16);
      if (extra(.6) && H > 150) s += movel('pergaminhos', X + 52, Y + H - 50);
    } else if (tipo === 'aula') {
      s += movel('quadro', X + W / 2, Y + 10);
      for (let y = Y + 60; y < Y + H - 50; y += 70) for (let x = X + 40; x < X + W - 30; x += 70) s += movel('carteira', x, y + 24);
    } else if (tipo === 'salao') {
      s += movel('balcao', X + Math.min(W - 84, 90), Y + 34);
      for (let y = Y + 140; y < Y + H - 60; y += 120) for (let x = X + 70; x < X + W - 60; x += 140) s += movel('chabudai', x, y);
    } else if (tipo === 'loja') {
      s += movel('balcao', X + W / 2, Y + H - 50, 180);
      for (let x = X + 70; x < X + W - 60; x += 140) s += movel('prateleira', x, Y + 16);
      if (H > 250) s += movel('prateleira', X + 16, Y + H / 2, 90) + movel('armas', X + W / 2, Y + H / 2 - 20);
    } else if (tipo === 'acervo') {
      const horiz = W >= H;
      if (horiz) for (let y = Y + 30; y < Y + H - 30; y += 96) s += estante(X + 30, y, W - 60, C * .5);
      else for (let x = X + 30; x < X + W - 30; x += 96) s += estante(x, Y + 30, C * .5, H - 60);
    } else if (tipo === 'leitura') {
      for (let y = Y + 70; y < Y + H - 60; y += 130) s += mesa(X + 30, y, W - 60, 44, true);
    } else if (tipo === 'recepcao') {
      s += movel('balcao', X + W / 2, Y + H / 2);
      if (extra(.7)) s += movel('andon', X + 20, Y + 20) + movel('andon', X + W - 20, Y + 20);
    } else if (tipo === 'reuniao') {
      s += mesa(X + W / 2 - Math.min(W * .6, 260) / 2, Y + H / 2 - 30, Math.min(W * .6, 260), 60, true);
      if (W > 200) s += movel('tokonoma', X + W / 2, Y + 22);
    } else if (tipo === 'enfermaria') {
      for (let x = X + 34; x < X + W - 30; x += 70) s += movel('cama', x, Y + 60);
      if (H > 250) for (let x = X + 34; x < X + W - 30; x += 70) s += movel('cama', x, Y + H - 60);
    }
    const nome = NOMES_COMODO[tipo];
    if (nome && W > 70 && H > 50) s += rotulo(X + 6, Y + H - 8, nome, L);
    return s;
  }
  // janela: vão na parede com duas linhas finas de vidro/papel
  function janela(x1, y1, x2, y2) {
    const c = COR.cob;
    if (x1 === x2) return `<rect x="${f1(x1 - 5)}" y="${f1(y1)}" width="10" height="${f1(y2 - y1)}" fill="#fbfbfd"/><line x1="${f1(x1 - 2.5)}" y1="${f1(y1)}" x2="${f1(x1 - 2.5)}" y2="${f1(y2)}" stroke="${c}" stroke-width="1.1"/><line x1="${f1(x1 + 2.5)}" y1="${f1(y1)}" x2="${f1(x1 + 2.5)}" y2="${f1(y2)}" stroke="${c}" stroke-width="1.1"/><line x1="${f1(x1 - 5)}" y1="${f1(y1)}" x2="${f1(x1 + 5)}" y2="${f1(y1)}" stroke="${c}" stroke-width="2"/><line x1="${f1(x1 - 5)}" y1="${f1(y2)}" x2="${f1(x1 + 5)}" y2="${f1(y2)}" stroke="${c}" stroke-width="2"/>`;
    return `<rect x="${f1(x1)}" y="${f1(y1 - 5)}" width="${f1(x2 - x1)}" height="10" fill="#fbfbfd"/><line x1="${f1(x1)}" y1="${f1(y1 - 2.5)}" x2="${f1(x2)}" y2="${f1(y1 - 2.5)}" stroke="${c}" stroke-width="1.1"/><line x1="${f1(x1)}" y1="${f1(y1 + 2.5)}" x2="${f1(x2)}" y2="${f1(y1 + 2.5)}" stroke="${c}" stroke-width="1.1"/><line x1="${f1(x1)}" y1="${f1(y1 - 5)}" x2="${f1(x1)}" y2="${f1(y1 + 5)}" stroke="${c}" stroke-width="2"/><line x1="${f1(x2)}" y1="${f1(y1 - 5)}" x2="${f1(x2)}" y2="${f1(y1 + 5)}" stroke="${c}" stroke-width="2"/>`;
  }
  // Desenha uma planta. Regras: todo cômodo tem porta (ligado à entrada) e
  // janela em cada parede que dá para fora (ou para o jardim interno).
  function planta(r, L, ox, oy, chaoInt, m, grade) {
    usa('cob');
    const R = L.c.map(([tipo, x, y, w, h]) => ({ tipo, x: x + ox, y: y + oy, w, h }));
    const occ = {}; R.forEach((q, i) => { for (let j = q.y; j < q.y + q.h; j++) for (let k = q.x; k < q.x + q.w; k++) occ[k + ',' + j] = i; });
    const fora = (x, y, i) => { const o = occ[x + ',' + y]; return o == null || (R[o].tipo === 'jardim' && R[i].tipo !== 'jardim'); };
    // vizinhos e trechos de parede em comum
    const seg = (a, b) => {
      const A = R[a], B = R[b];
      if (A.x + A.w === B.x || B.x + B.w === A.x) { const x = A.x + A.w === B.x ? B.x : A.x, i0 = Math.max(A.y, B.y), i1 = Math.min(A.y + A.h, B.y + B.h); if (i1 - i0 >= 1) return { v: true, x, a: i0, b: i1 }; }
      if (A.y + A.h === B.y || B.y + B.h === A.y) { const y = A.y + A.h === B.y ? B.y : A.y, i0 = Math.max(A.x, B.x), i1 = Math.min(A.x + A.w, B.x + B.w); if (i1 - i0 >= 1) return { v: false, y, a: i0, b: i1 }; }
      return null;
    };
    // árvore de portas a partir da entrada (busca em largura)
    const [ent, lado] = L.entrada, pai = { [ent]: -1 }, fila = [ent], portas = [];
    while (fila.length) { const a = fila.shift(); R.forEach((_, b) => { if (pai[b] != null) return; const sg = seg(a, b); if (sg) { pai[b] = a; fila.push(b); portas.push(sg); } }); }
    // porta da rua
    const E = R[ent]; let pr;
    if (lado === 'n') pr = { v: false, y: E.y, m: E.x + E.w / 2 }; else if (lado === 's') pr = { v: false, y: E.y + E.h, m: E.x + E.w / 2 };
    else if (lado === 'w') pr = { v: true, x: E.x, m: E.y + E.h / 2 }; else pr = { v: true, x: E.x + E.w, m: E.y + E.h / 2 };
    // chão e móveis
    let piso = '', mov = '', par = '', ab = '';
    R.forEach((q, i) => {
      const X = q.x * C, Y = q.y * C, W = q.w * C, H = q.h * C;
      if (q.tipo !== 'jardim') piso += `<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${chaoInt.bg}"/>`;
      mov += comodo(r, q.tipo, X + 6, Y + 6, W - 12, H - 12, chaoInt, m);
      if (q.tipo !== 'jardim') par += `<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="none" stroke="${COR.cob}" stroke-width="8"/>`;
      else par += `<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="none" stroke="${COR.cob}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    });
    // janelas: trechos de parede externa com 2+ quadrados (o banho aceita 1)
    R.forEach((q, i) => {
      if (q.tipo === 'jardim' || q.tipo === 'corredor') return;
      const lados = [['n', q.x, q.y - 1, 1, 0], ['s', q.x, q.y + q.h, 1, 0], ['w', q.x - 1, q.y, 0, 1], ['e', q.x + q.w, q.y, 0, 1]];
      lados.forEach(([ld, sx, sy, dx, dy]) => {
        const len = dx ? q.w : q.h; let ini = -1;
        for (let t = 0; t <= len; t++) {
          const ext = t < len && fora(sx + dx * t, sy + dy * t, i);
          if (ext && ini < 0) ini = t;
          if (!ext && ini >= 0) {
            const run = t - ini;
            if (run >= 2 || (run >= 1 && q.tipo === 'banho')) {
              const mid = ini + run / 2, jl = Math.min(run * .55, 1.6) / 2;
              const naPorta = i === ent && ld === lado && Math.abs((dx ? q.x : q.y) + mid - pr.m) < 1.2;
              if (!naPorta) {
                if (dx) { const y = (ld === 'n' ? q.y : q.y + q.h) * C; ab += janela((q.x + mid - jl) * C, y, (q.x + mid + jl) * C, y); }
                else { const x = (ld === 'w' ? q.x : q.x + q.w) * C; ab += janela(x, (q.y + mid - jl) * C, x, (q.y + mid + jl) * C); }
              }
            }
            ini = -1;
          }
        }
      });
    });
    // portas internas no meio do trecho em comum
    portas.forEach(sg => { const m0 = (sg.a + sg.b) / 2; ab += sg.v ? portaCorrer(sg.x * C, (m0 - .42) * C, sg.x * C, (m0 + .42) * C, 6, chaoInt.bg) : portaCorrer((m0 - .42) * C, sg.y * C, (m0 + .42) * C, sg.y * C, 6, chaoInt.bg); });
    // porta da rua com pedra de degrau
    if (pr.v) { ab += portaCorrer(pr.x * C, (pr.m - .5) * C, pr.x * C, (pr.m + .5) * C, 7, chaoInt.bg); const sx = lado === 'w' ? pr.x * C - 30 : pr.x * C + 12; ab += `<rect x="${f1(sx)}" y="${f1((pr.m - .35) * C)}" width="18" height="${f1(C * .7)}" rx="7" fill="${FUNDO}" stroke="${COR.pedra}" stroke-width="1.4"/>`; }
    else { ab += portaCorrer((pr.m - .5) * C, pr.y * C, (pr.m + .5) * C, pr.y * C, 7, chaoInt.bg); const sy = lado === 'n' ? pr.y * C - 30 : pr.y * C + 12; ab += `<rect x="${f1((pr.m - .35) * C)}" y="${f1(sy)}" width="${f1(C * .7)}" height="18" rx="7" fill="${FUNDO}" stroke="${COR.pedra}" stroke-width="1.4"/>`; }
    usa('pedra');
    if (grade) R.forEach(q => { grade.marca(q.x, q.y, q.w, q.h); grade.semTextura(q.x, q.y, q.w, q.h); });
    const saida = pr.v ? { x: lado === 'w' ? pr.x - 1 : pr.x, y: Math.floor(pr.m), lado } : { x: Math.floor(pr.m), y: lado === 'n' ? pr.y - 1 : pr.y, lado };
    return { svg: piso + mov + par + ab, saida };
  }

  /* ---------- dungeon ---------- */
  function dungeon(r, cols, rows, mix, chao) {
    usa('cob');
    const piso = new Uint8Array(cols * rows), sala = new Int16Array(cols * rows).fill(-1), at = (x, y) => y * cols + x;
    const alvo = 2 + Math.round(mix.salas / 100 * 9), salas = [];
    for (let t = 0; t < 400 && salas.length < alvo; t++) {
      const w = r.int(4, Math.min(9, cols - 4)), h = r.int(4, Math.min(8, rows - 4)), x = r.int(1, cols - w - 1), y = r.int(1, rows - h - 1);
      if (salas.some(s => x < s.x + s.w + 2 && x + w + 2 > s.x && y < s.y + s.h + 2 && y + h + 2 > s.y)) continue;
      salas.push({ x, y, w, h });
    }
    salas.forEach((s, i) => { for (let j = s.y; j < s.y + s.h; j++) for (let k = s.x; k < s.x + s.w; k++) { piso[at(k, j)] = 1; sala[at(k, j)] = i; } });
    // corredores de 2 quadrados ligando as salas em sequência, mais um atalho
    const portas = new Map();
    const cava = (a, b) => {
      let [x, y] = [Math.floor(a.x + a.w / 2), Math.floor(a.y + a.h / 2)];
      const [tx, ty] = [Math.floor(b.x + b.w / 2), Math.floor(b.y + b.h / 2)], hFirst = r() < .5, passos = [];
      const andaX = () => { while (x !== tx) { x += Math.sign(tx - x); passos.push([x, y]); } };
      const andaY = () => { while (y !== ty) { y += Math.sign(ty - y); passos.push([x, y]); } };
      passos.push([x, y]);
      if (hFirst) { andaX(); andaY(); } else { andaY(); andaX(); }
      let ant = null;
      passos.forEach(([px, py]) => {
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([ox, oy]) => { const qx = Math.min(cols - 2, px + ox), qy = Math.min(rows - 2, py + oy); piso[at(qx, qy)] = 1; });
        if (ant) { const sa = sala[at(ant[0], ant[1])], sb = sala[at(px, py)]; if ((sa >= 0) !== (sb >= 0)) { const k = `${Math.max(ant[0], px)},${Math.max(ant[1], py)},${ant[0] !== px ? 'v' : 'h'}`; portas.set(k, { x: Math.max(ant[0], px), y: Math.max(ant[1], py), v: ant[0] !== px }); } }
        ant = [px, py];
      });
    };
    const ordem = salas.map((s, i) => i).sort((a, b) => salas[a].x - salas[b].x);
    for (let i = 1; i < ordem.length; i++) cava(salas[ordem[i - 1]], salas[ordem[i]]);
    if (salas.length > 3) cava(salas[ordem[0]], salas[ordem[ordem.length - 1]]);
    // rocha em volta
    let s = `<rect width="${cols * C}" height="${rows * C}" fill="${COR.cob}" fill-opacity=".07"/>` + `<g opacity=".28">${tinge(window.Blocos.hachura([[0, 0], [cols * C, 0], [cols * C, rows * C], [0, rows * C]], 'd', 12, 1.2), COR.cob, FUNDO)}</g>`;
    // chão (por linhas, para não gerar um retângulo por quadrado)
    for (let j = 0; j < rows; j++) { let i = 0; while (i < cols) { if (!piso[at(i, j)]) { i++; continue; } let k = i; while (k < cols && piso[at(k, j)]) k++; s += `<rect x="${i * C}" y="${j * C}" width="${(k - i) * C}" height="${C}" fill="${FUNDO}"/>`; i = k; } }
    // lajotas nas salas (textura)
    if (mix.textura > 0) salas.forEach(q => { const id = 'dg' + (++CLIP); s += `<clipPath id="${id}"><rect x="${q.x * C}" y="${q.y * C}" width="${q.w * C}" height="${q.h * C}"/></clipPath><g clip-path="url(#${id})" opacity="${f1(.12 + mix.textura / 100 * .35)}"><g transform="translate(${q.x * C} ${q.y * C})">${tinge(BL('HACHURAS', 'pedraAssentada').f(r, q.w * C, q.h * C), chao.linha, FUNDO)}</g></g>`; });
    // paredes: borda entre chão e rocha
    let d = '';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (!piso[at(i, j)]) continue;
      const v = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && piso[at(x, y)];
      if (!v(i, j - 1)) d += `M${i * C} ${j * C}h${C}`; if (!v(i, j + 1)) d += `M${i * C} ${(j + 1) * C}h${C}`;
      if (!v(i - 1, j)) d += `M${i * C} ${j * C}v${C}`; if (!v(i + 1, j)) d += `M${(i + 1) * C} ${j * C}v${C}`;
    }
    s += `<path d="${d}" stroke="${COR.cob}" stroke-width="7" stroke-linecap="square" fill="none"/>`;
    // portas na passagem sala ↔ corredor
    const ehChao = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && piso[at(x, y)];
    const naParede = p => p.v ? [p.y - 1, p.y + 1].some(yy => ehChao(p.x - 1, yy) !== ehChao(p.x, yy)) : [p.x - 1, p.x + 1].some(xx => ehChao(xx, p.y - 1) !== ehChao(xx, p.y));
    portas.forEach(p => { if (!naParede(p)) return; s += p.v ? `<rect x="${p.x * C - 6}" y="${p.y * C + 8}" width="12" height="${C - 16}" fill="${FUNDO}" stroke="${COR.cob}" stroke-width="2"/><line x1="${p.x * C}" y1="${p.y * C + 8}" x2="${p.x * C}" y2="${(p.y + 1) * C - 8}" stroke="${COR.cob}" stroke-width="1.2"/>` : `<rect x="${p.x * C + 8}" y="${p.y * C - 6}" width="${C - 16}" height="12" fill="${FUNDO}" stroke="${COR.cob}" stroke-width="2"/><line x1="${p.x * C + 8}" y1="${p.y * C}" x2="${(p.x + 1) * C - 8}" y2="${p.y * C}" stroke="${COR.cob}" stroke-width="1.2"/>`; });
    // colunas, escombros e objetos dentro das salas
    const kp = mix.pedras / 100, ko = mix.objetos / 100;
    salas.forEach((q, i) => {
      const cx = (q.x + q.w / 2) * C, cy = (q.y + q.h / 2) * C;
      if (q.w >= 6 && q.h >= 6) [[1.5, 1.5], [q.w - 1.5, 1.5], [1.5, q.h - 1.5], [q.w - 1.5, q.h - 1.5]].forEach(([a, b]) => { s += bloco('MASMORRA', r() < kp * .6 ? 'quebrada' : 'coluna', (q.x + a) * C, (q.y + b) * C, 0, COR.cob, r); });
      const ne = Math.round(q.w * q.h / 12 * kp); for (let e = 0; e < ne; e++) s += bloco('MASMORRA', 'escombros', (q.x + r.range(1, q.w - 1)) * C, (q.y + r.range(1, q.h - 1)) * C, r.range(0, 360), COR.pedra, r);
      if (ko > 0 && r() < ko) s += bloco('MASMORRA', r.pick(['altar', 'estatua', 'sarcofago', 'alcapao']), cx, cy, r.pick([0, 90]), COR.cob, r);
      if (ko > 0 && r() < ko * .8) s += movel('bau', (q.x + .8) * C, (q.y + q.h - .7) * C);
      if (ko > 0) s += bloco('MASMORRA', 'tocha', cx, q.y * C + 16) + (r() < ko ? bloco('MASMORRA', 'tocha', cx, (q.y + q.h) * C - 16, 180) : '');
    });
    return s;
  }

  /* ---------- caverna (autômato celular) ---------- */
  function caverna(r, cols, rows, mix, chao, grade) {
    usa('cob');
    const at = (x, y) => y * cols + x;
    let g = new Uint8Array(cols * rows);
    const p0 = .61 - mix.espaco / 100 * .17;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) g[at(i, j)] = (i === 0 || j === 0 || i === cols - 1 || j === rows - 1 || r() < p0) ? 1 : 0;
    for (let it = 0; it < 5; it++) {
      const n = new Uint8Array(cols * rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        if (i === 0 || j === 0 || i === cols - 1 || j === rows - 1) { n[at(i, j)] = 1; continue; }
        let c = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) c += g[at(i + a, j + b)];
        n[at(i, j)] = c >= 5 ? 1 : 0;
      }
      g = n;
    }
    // fica só a maior galeria
    const reg = new Int32Array(cols * rows).fill(-1); let melhor = -1, tamMelhor = 0, id = 0;
    for (let k = 0; k < cols * rows; k++) { if (g[k] || reg[k] >= 0) continue; const pilha = [k]; reg[k] = id; let t = 0; while (pilha.length) { const c = pilha.pop(); t++; const x = c % cols, y = (c - x) / cols; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, ny = y + b; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return; const q = at(nx, ny); if (!g[q] && reg[q] < 0) { reg[q] = id; pilha.push(q); } }); } if (t > tamMelhor) { tamMelhor = t; melhor = id; } id++; }
    const chaoOk = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && !g[at(x, y)] && reg[at(x, y)] === melhor;
    // rocha + galeria: círculos unidos (contorno = círculo maior escuro por baixo)
    let s = `<rect width="${cols * C}" height="${rows * C}" fill="${COR.cob}" fill-opacity=".08"/><g opacity=".22">${tinge(window.Blocos.hachura([[0, 0], [cols * C, 0], [cols * C, rows * C], [0, rows * C]], 'd', 10, 1.1), COR.cob, FUNDO)}</g>`;
    let fundo = '', borda = '';
    // campo suave (bilinear entre os centros das células) amostrado a cada meia célula
    const val = (x, y) => chaoOk(x, y) ? 1 : 0;
    const campo = (u, v) => { const x0 = Math.floor(u - .5), y0 = Math.floor(v - .5), tx = u - .5 - x0, ty = v - .5 - y0; return (val(x0, y0) * (1 - tx) + val(x0 + 1, y0) * tx) * (1 - ty) + (val(x0, y0 + 1) * (1 - tx) + val(x0 + 1, y0 + 1) * tx) * ty; };
    const f = [r.range(0, 6), r.range(0, 6), r.range(0, 6), r.range(0, 6)];
    const ruido = (u, v) => .22 * Math.sin(u * 1.3 + f[0]) * Math.sin(v * 1.5 + f[1]) + .14 * Math.sin(u * 2.9 + v * 1.1 + f[2]) + .09 * Math.sin(v * 3.7 - u * .8 + f[3]);
    for (let v = .25; v < rows; v += .5) for (let u = .25; u < cols; u += .5) {
      if (campo(u, v) + ruido(u, v) < .5 + r.range(-.06, .06)) continue;
      const rr = C * r.range(.34, .44), x = f1(u * C + r.range(-4, 4)), y = f1(v * C + r.range(-4, 4));
      borda += `<circle cx="${x}" cy="${y}" r="${f1(rr + 5)}"/>`; fundo += `<circle cx="${x}" cy="${y}" r="${f1(rr)}"/>`;
    }
    s += `<g fill="${COR.cob}">${borda}</g><g fill="${FUNDO}">${fundo}</g>`;
    // ocupação: só o chão da galeria é livre
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (!chaoOk(i, j)) { grade.marca(i, j); grade.semTextura(i, j); }
    // poças d'água
    const kA = mix.agua / 100;
    let poc = Math.round(kA * 5);
    for (let t = 0; t < 200 && poc > 0; t++) {
      const x = r.int(2, cols - 3), y = r.int(2, rows - 3);
      let ok = true; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (!chaoOk(x + a, y + b) || !grade.livre(x + a, y + b)) ok = false;
      if (!ok) continue;
      const P = blob(r, (x + .5) * C, (y + .5) * C, C * r.range(.9, 1.4), C * r.range(.7, 1.1), 12, .22);
      s += `<path d="${suave(P)}" fill="${COR.agua}" fill-opacity=".18" stroke="${COR.agua}" stroke-width="2.5"/><path d="${suave(escala(P, (x + .5) * C, (y + .5) * C, .6))}" fill="none" stroke="${COR.agua}" stroke-width="1.1" stroke-opacity=".6"/>`;
      usa('agua'); grade.marca(x - 1, y - 1, 3, 3); grade.semTextura(x - 1, y - 1, 3, 3); poc--;
    }
    return s;
  }

  /* ---------- aquático: tudo é água ---------- */
  function aquatico(r, cols, rows, mix, grade) {
    usa('agua');
    const area = cols * rows;
    let bx = '', fx = '';
    // ondas pelo mapa (textura)
    if (mix.textura > 0) { let d = ''; const passo = 70 - mix.textura / 100 * 34; for (let y = 20, i = 0; y < rows * C; y += passo, i++) { d += `M${-(i % 2) * 40} ${f1(y)}`; for (let x = 0; x < cols * C + 80; x += 80) d += ` q20 -8 40 0 t40 0`; } bx += `<path d="${d}" fill="none" stroke="${COR.agua}" stroke-width="1.1" stroke-opacity=".38"/>`; }
    // porto: cais na borda de baixo e píeres entrando na água
    const piers = [];
    if (mix.porto > 0) {
      const y0 = rows - 1;
      let cais = ''; for (let x = 0; x < cols * C; x += 260) cais += naCaixa(tinge(BL('AGUA', 'cais').f(), COR.cob, FUNDO), x + 130, y0 * C + 30, 260, 60);
      fx += cais.replace(/<g /, `<g `); usa('cob');
      grade.marca(0, y0 - 1, cols, 2);
      const np = 1 + Math.round(mix.porto / 100 * 2);
      for (let i = 0; i < np; i++) { const x = Math.round((i + 1) * cols / (np + 1)); if (x < 1 || x > cols - 2) continue; piers.push(x); fx += bloco('AGUA', 'pier', x * C, (y0 - 1.7) * C, 0); grade.marca(x - 1, y0 - 5, 2, 5); }
      const carga = Math.round(cols / 4 * mix.porto / 100);
      for (let i = 0; i < carga; i++) { const x = r.range(.6, cols - .6) * C, y = (y0 + r.range(.25, .7)) * C; fx += r() < .55 ? movel('caixote', x, y, r.pick([0, 6, -8])) : movel('barril', x, y); }
    }
    // ilhas
    const ilhas = [], ni = mix.ilhas <= 0 ? 0 : Math.max(1, Math.round(mix.ilhas / 100 * Math.max(2, area / 120)));
    for (let t = 0; t < 300 && ilhas.length < ni; t++) {
      const R = r.range(1.8, Math.min(5, Math.min(cols, rows) / 4)), cx = r.range(R + 1, cols - R - 1), cy = r.range(R + 1, rows - R - (mix.porto > 0 ? 3 : 1));
      if (ilhas.some(q => Math.hypot(q.cx - cx, q.cy - cy) < q.R + R + 1.5)) continue;
      ilhas.push({ cx, cy, R });
    }
    const terra = Grade(cols, rows); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) terra.marca(i, j);
    const sobre = Grade(cols, rows);
    ilhas.forEach(q => {
      const P = blob(r, q.cx * C, q.cy * C, q.R * C * r.range(1, 1.2), q.R * C * r.range(.75, 1), 16, .22);
      bx += `<path d="${suave(escala(P, q.cx * C, q.cy * C, 1.12))}" fill="none" stroke="${COR.agua}" stroke-width="1.2" stroke-opacity=".55" stroke-dasharray="4 8" stroke-linecap="round"/>`;
      bx += `<path d="${suave(P)}" fill="${CHAO.areia.bg}" stroke="${COR.agua}" stroke-width="3"/><path d="${suave(escala(P, q.cx * C, q.cy * C, .8))}" fill="${CHAO.grama.bg}" stroke="${CHAO.grama.linha}" stroke-width="1.2" stroke-opacity=".6"/>`;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const dx = (i + .5 - q.cx) / (q.R * .8), dy = (j + .5 - q.cy) / (q.R * .65); if (dx * dx + dy * dy < 1) { terra.livre(i, j); sobre.marca(i, j); } }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const dx = (i + .5 - q.cx) / (q.R * 1.15), dy = (j + .5 - q.cy) / (q.R); if (dx * dx + dy * dy < 1.1) grade.marca(i, j); }
    });
    // árvores e pedras só em terra firme
    const livreTerra = { livre: (x, y, w = 1, h = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (!sobre.livre(i, j) === false) return false; return true; }, marca: () => {} };
    const ocupado = new Set();
    const emTerra = (x, y, w, h) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { if (sobre.livre(i, j) || ocupado.has(i + ',' + j)) return false; } return true; };
    const coloca = (n, tam, f) => { let s = '', t = n * 12; for (let k = 0; k < n && t > 0; t--) { const x = r.int(0, cols - tam), y = r.int(0, rows - tam); if (!emTerra(x, y, tam, tam)) continue; for (let j = y; j < y + tam; j++) for (let i = x; i < x + tam; i++) ocupado.add(i + ',' + j); s += f(x, y); k++; } return s; };
    void livreTerra;
    const terraCel = ilhas.reduce((s, q) => s + Math.PI * q.R * q.R * .5, 0);
    fx += coloca(qtd(terraCel, .5, mix.arvores), 1, (x, y) => arvore(r, (x + .5) * C, (y + .5) * C, C * r.range(.55, .9), ['raiosBorda', 'serrilhada', 'raios', 'seixos']));
    fx += coloca(qtd(terraCel, .25, mix.pedras), 1, (x, y) => rocha(r, (x + .5) * C, (y + .5) * C, C * r.range(.25, .42)));
    // pontes entre ilhas próximas
    if (mix.pontes > 0 && ilhas.length > 1) {
      const pares = [];
      ilhas.forEach((a, i) => ilhas.forEach((b, j) => { if (j > i) pares.push([Math.hypot(a.cx - b.cx, a.cy - b.cy) - a.R - b.R, a, b]); }));
      pares.sort((p, q) => p[0] - q[0]).slice(0, Math.max(1, Math.round(mix.pontes / 100 * 3))).forEach(([d, a, b]) => {
        if (d > 9) return;
        const ang = Math.atan2(b.cy - a.cy, b.cx - a.cx), x1 = a.cx + Math.cos(ang) * a.R * .75, y1 = a.cy + Math.sin(ang) * a.R * .6, x2 = b.cx - Math.cos(ang) * b.R * .75, y2 = b.cy - Math.sin(ang) * b.R * .6;
        fx += ponte((x1 + x2) / 2 * C, (y1 + y2) / 2 * C, ang * 180 / Math.PI, Math.hypot(x2 - x1, y2 - y1) * C + 30);
      });
    }
    // embarcações na água livre (as primeiras atracam nos píeres)
    const nb = mix.barcos <= 0 ? 0 : Math.max(1, Math.round(mix.barcos / 100 * Math.max(2, area / 90)));
    let feitos = 0;
    piers.forEach(x => { if (feitos < nb) { fx += bloco('AGUA', r.pick(['barco', 'sampan']), (x + 1.1) * C, (rows - 4.2) * C, r.pick([0, 180])); feitos++; } });
    for (let t = 0; t < 300 && feitos < nb; t++) {
      const tipo = area > 500 && r() < .25 ? 'junco' : r.pick(['barco', 'barco', 'sampan', 'jangada']);
      const tam = tipo === 'junco' ? 4 : tipo === 'sampan' ? 3 : 2, x = r.int(0, cols - tam), y = r.int(0, rows - tam);
      if (!grade.livre(x, y, tam, tam)) continue;
      grade.marca(x, y, tam, tam);
      fx += bloco('AGUA', tipo, (x + tam / 2) * C, (y + tam / 2) * C, r.range(0, 360)); feitos++;
    }
    if (mix.porto > 0) for (let i = 0; i < 2; i++) fx += bloco('AGUA', 'boia', r.range(1, cols - 1) * C, (rows - r.range(5, 7)) * C);
    return { bx, fx, usouTerra: ilhas.length > 0 };
  }

  /* ---------- gerador ---------- */
  function mixDe(cfg) {
    let tipo = cfg.tipo, mix = cfg.mix, layout = cfg.layout;
    if (ANTIGOS[tipo]) { const a = ANTIGOS[tipo]; tipo = a.tipo; layout = layout || a.layout; mix = mix || a.mix; }
    const base = Object.assign({}, PADRAO[tipo] || PADRAO.floresta);
    if (!mix && cfg.dens) { const k = DENS[(cfg.dens || 4) - 1] || 1; Object.keys(base).forEach(e => { if (e !== 'textura') base[e] = Math.max(0, Math.min(100, Math.round(base[e] * k / 20) * 20)); }); }
    return { tipo, layout, mix: Object.assign(base, mix || {}) };
  }
  function gerar(cfg, cols, rows) {
    USO = new Set();
    const { tipo, layout, mix } = mixDe(cfg);
    const r = rng(cfg.seed || 1), area = cols * rows, grade = Grade(cols, rows);
    const chao = CHAO[CHAO_TIPO[tipo] || 'grama'];
    FUNDO = chao.bg; CHAO_ATUAL = chao;
    const kt = mix.textura / 60, pt = mix.textura;
    const natural = !['dungeon', 'caverna', 'aquatico'].includes(tipo);
    const rf = natural && pt > 0 ? relevoFundo(r, cols, rows, chao.linha, mix.textura / 100) : '';
    let bx = '', mx = '', fx = '';
    const morros = (q, rmin, rmax) => { for (let i = 0; i < q; i++) mx += morro(r, r.range(.1, .9) * cols * C, r.range(.1, .9) * rows * C, r.range(rmin, rmax) * C); };
    const nMorros = base => mix.relevo <= 0 ? 0 : Math.max(1, Math.round(area / base * mix.relevo / 60));
    // água comum aos mapas naturais: rio a partir de 20%, lago a partir de 60%
    const aguas = (gelo = false) => {
      if (!(mix.agua > 0)) return;
      if (mix.agua >= 60 || gelo) bx += lago(r, cols, rows, grade, .12 + mix.agua / 100 * .16, gelo);
      if (!gelo && (mix.agua < 60 || mix.agua >= 80)) { const R = rio(r, cols, rows, 1.3 + mix.agua / 100 * 1.2, grade); bx += R.svg; if (mix.pontes > 0) fx += pontesNoRio(r, R, Math.max(1, Math.round(mix.pontes / 100 * 3))); }
    };
    switch (tipo) {
      case 'floresta': {
        morros(nMorros(400), 2.5, 4.5);
        aguas();
        if (r() < .8) bx += trilha(r, cols, rows, r.range(1.3, 2), chao, grade);
        fx += espalha(r, cols, rows, grade, qtd(area, .012, mix.pedras), 2, (x, y) => rocha(r, (x + 1) * C, (y + 1) * C, C * r.range(.5, .85)));
        fx += espalha(r, cols, rows, grade, qtd(area, .006, mix.pedras), 2, (x, y) => objeto('tora', (x + 1) * C, (y + 1) * C, r.range(0, 180)));
        fx += espalha(r, cols, rows, grade, qtd(area, .03, mix.arvores), 1, (x, y) => arbusto(r, (x + .5) * C, (y + .5) * C, C * r.range(.32, .45)));
        fx += espalha(r, cols, rows, grade, qtd(area, .045, mix.arvores), 2, (x, y) => arvore(r, (x + 1) * C + r.range(-8, 8), (y + 1) * C + r.range(-8, 8), C * r.range(.8, 1.15), ['raiosBorda', 'serrilhada', 'seixos', 'raios', 'raiosBorda', 'galhos', 'palmeira']));
        fx += espalha(r, cols, rows, grade, qtd(area, .015, mix.arvores), 3, (x, y) => arvore(r, (x + 1.5) * C, (y + 1.5) * C, C * r.range(1.25, 1.6)));
        break;
      }
      case 'deserto': {
        const nd = mix.relevo <= 0 ? 0 : Math.max(1, Math.round(area / 220 * mix.relevo / 60));
        for (let i = 0; i < nd; i++) { usa('alto'); mx += relevo(r, r.range(0, cols) * C, r.range(0, rows) * C, r.range(3.5, 7) * C, r.range(1.2, 2.2) * C, r.int(3, 5), COR.alto, .7, true); }
        if (mix.objetos > 0) fx += espalha(r, cols, rows, grade, Math.max(1, Math.round(area / 300 * mix.objetos / 60)), 4, (x, y) => { usa('cob'); const w = r.int(2, 4) * C; return `<path d="M${x * C} ${y * C + C * 1.2}V${y * C}H${x * C + w}V${y * C + C * .7}" fill="none" stroke="${COR.cob}" stroke-width="3" stroke-linejoin="round"/>` + bloco('MASMORRA', 'quebrada', x * C + C * .5, y * C + C * 2.2, 0, COR.cob, r); });
        fx += espalha(r, cols, rows, grade, qtd(area, .03, mix.pedras), 2, (x, y) => rocha(r, (x + 1) * C, (y + 1) * C, C * r.range(.45, .9)));
        fx += espalha(r, cols, rows, grade, qtd(area, .008, mix.pedras), 3, (x, y) => rocha(r, (x + 1.5) * C, (y + 1.5) * C, C * r.range(1, 1.4)));
        fx += espalha(r, cols, rows, grade, qtd(area, .012, mix.arvores), 1, (x, y) => r() < .3 ? arvore(r, (x + .5) * C, (y + .5) * C, C * .45, ['palmeira']) : arbusto(r, (x + .5) * C, (y + .5) * C, C * .28));
        break;
      }
      case 'neve': {
        morros(nMorros(450), 2.5, 4);
        aguas(true);
        fx += espalha(r, cols, rows, grade, qtd(area, .015, mix.pedras), 2, (x, y) => rocha(r, (x + 1) * C, (y + 1) * C, C * r.range(.5, .8)));
        fx += espalha(r, cols, rows, grade, qtd(area, .04, mix.arvores), 2, (x, y) => pinheiro(r, (x + 1) * C, (y + 1) * C, C * r.range(.75, 1.05)));
        break;
      }
      case 'montanha': {
        morros(nMorros(160), 3, 6);
        const np = mix.penhascos <= 0 ? 0 : Math.max(1, Math.round(area / 300 * mix.penhascos / 60));
        for (let i = 0; i < np; i++) fx += penhasco(r, cols, rows);
        fx += espalha(r, cols, rows, grade, qtd(area, .03, mix.pedras), 3, (x, y) => rocha(r, (x + 1.5) * C, (y + 1.5) * C, C * r.range(.9, 1.4)));
        fx += espalha(r, cols, rows, grade, qtd(area, .04, mix.pedras), 1, (x, y) => rocha(r, (x + .5) * C, (y + .5) * C, C * r.range(.22, .36)));
        fx += espalha(r, cols, rows, grade, qtd(area, .008, mix.arvores), 2, (x, y) => pinheiro(r, (x + 1) * C, (y + 1) * C, C * r.range(.65, .9)));
        break;
      }
      case 'treino': {
        morros(nMorros(400), 2.5, 4);
        bx += `<rect x="${C}" y="${C}" width="${(cols - 2) * C}" height="${(rows - 2) * C}" rx="40" fill="${chao.linha}" fill-opacity=".06" stroke="${chao.linha}" stroke-opacity=".4" stroke-width="2" stroke-dasharray="14 10"/>`;
        const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
        if (mix.objetos > 0) for (let i = -1; i <= 1; i++) { const x = cx + i * 2, y = cy - 3; if (grade.livre(x, y)) { grade.marca(x, y); fx += objeto('poste', (x + .5) * C, (y + .5) * C); } }
        if (grade.livre(cx - 1, cy + 3, 3, 2)) { grade.marca(cx - 1, cy + 3, 3, 2); usa('pedra'); fx += `<g transform="translate(${(cx - .1) * C} ${(cy + 3.3) * C})">${tinge(BL('OBJETOS', 'pedraMemorial').f(), COR.pedra, FUNDO)}</g>`; }
        fx += espalha(r, cols, rows, grade, qtd(area, .012, mix.objetos), 1, (x, y) => objeto('alvo', (x + .5) * C, (y + .5) * C));
        fx += espalha(r, cols, rows, grade, qtd(area, .008, mix.objetos), 2, (x, y) => objeto('tora', (x + 1) * C, (y + 1) * C, r.range(0, 180)));
        fx += espalha(r, cols, rows, grade, qtd(area, .01, mix.pedras), 1, (x, y) => rocha(r, (x + .5) * C, (y + .5) * C, C * r.range(.3, .45)));
        const pa = mix.arvores / 100 * .9;
        for (let x = 0; x < cols; x++) for (const y of [0, rows - 1]) if (grade.livre(x, y) && r() < pa) { grade.marca(x, y); fx += arvore(r, (x + .5) * C, (y + .5) * C, C * r.range(.6, .85)); }
        for (let y = 1; y < rows - 1; y++) for (const x of [0, cols - 1]) if (grade.livre(x, y) && r() < pa) { grade.marca(x, y); fx += arvore(r, (x + .5) * C, (y + .5) * C, C * r.range(.6, .85)); }
        break;
      }
      case 'vila': {
        morros(nMorros(500), 2.5, 4);
        const larg = r.range(2, 2.6);
        bx += trilha(r, cols, rows, larg, chao, grade);
        if (area > 900 && r() < .7) bx += trilha(r, cols, rows, larg * .75, chao, grade);
        aguas();
        const alvoCasas = mix.casas <= 0 ? 0 : Math.max(1, Math.round(area / 75 * mix.casas / 60));
        for (let feitas = 0, t = 0; feitas < alvoCasas && t < alvoCasas * 60; t++) {
          const w = r.int(5, 7), h = r.int(4, 6), x = r.int(0, cols - w), y = r.int(0, rows - h);
          const x0 = Math.max(0, x - 1), y0 = Math.max(0, y - 1), x1 = Math.min(cols, x + w + 1), y1 = Math.min(rows, y + h + 1);
          if (!grade.livre(x0, y0, x1 - x0, y1 - y0)) continue;
          grade.marca(x0, y0, x1 - x0, y1 - y0); grade.semTextura(x, y, w, h);
          fx += telhado(r, x, y, w, h); feitas++;
        }
        if (mix.objetos > 0) for (let t = 0; t < 40; t++) { // praça calçada com o poço
          const x = r.int(1, cols - 4), y = r.int(1, rows - 4);
          if (!grade.livre(x, y, 3, 3)) continue;
          grade.marca(x, y, 3, 3); grade.semTextura(x, y, 3, 3);
          const id = 'pr' + (++CLIP), cx = (x + 1.5) * C, cy = (y + 1.5) * C;
          if (pt > 0) bx += `<clipPath id="${id}"><path d="${suave(blob(r, cx, cy, C * 1.45, C * 1.3, 12, .12))}"/></clipPath><g clip-path="url(#${id})" opacity="${f1(.2 + pt / 100 * .45)}"><g transform="translate(${f1(cx - 110)} ${f1(cy - 110)})">${tinge(BL('HACHURAS', 'pedraAssentada').f(r, 220, 220), chao.linha, FUNDO)}</g></g>`;
          fx += objeto('poco', cx, cy);
          break;
        }
        fx += espalha(r, cols, rows, grade, qtd(area, .008, mix.objetos), 1, (x, y) => objeto('toro', (x + .5) * C, (y + .5) * C));
        if (mix.objetos > 0 && r() < .3 + mix.objetos / 200) fx += espalha(r, cols, rows, grade, 1, 3, (x, y) => objeto('carroca', (x + 1.5) * C, (y + 1.5) * C, r.pick([0, 90, 180, 270])));
        fx += espalha(r, cols, rows, grade, qtd(area, .004, mix.objetos), 2, (x, y) => objeto('banco', (x + 1) * C, (y + 1) * C, r.pick([0, 90])));
        fx += espalha(r, cols, rows, grade, qtd(area, .01, mix.objetos), 1, (x, y) => r() < .5 ? movel('caixote', (x + .5) * C, (y + .5) * C) : movel('barril', (x + .5) * C, (y + .5) * C));
        fx += espalha(r, cols, rows, grade, qtd(area, .01, mix.arvores), 2, (x, y) => arvore(r, (x + 1) * C, (y + 1) * C, C * r.range(.65, .95), ['raiosBorda', 'serrilhada', 'seixos']));
        fx += espalha(r, cols, rows, grade, qtd(area, .012, mix.arvores), 1, (x, y) => arbusto(r, (x + .5) * C, (y + .5) * C, C * .32));
        break;
      }
      case 'residencial': case 'comercial': {
        const L = BL('PLANTAS', layout) || window.Blocos.PLANTAS.find(p => p.grupo === tipo);
        const ox = Math.floor((cols - L.w) / 2), oy = Math.floor((rows - L.h) / 2);
        const chaoInt = tipo === 'residencial' ? CHAO.madeira : CHAO.pedra;
        // margem livre em volta da casa
        grade.marca(ox - 1, oy - 1, L.w + 2, L.h + 2);
        const P = planta(r, L, ox, oy, chaoInt, mix.moveis / 60, grade);
        fx += P.svg;
        // caminho de pedras da porta até a borda do mapa
        const s0 = P.saida, dir = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[s0.lado];
        let pedr = ''; for (let x = s0.x + .5, y = s0.y + .5; x > 0 && y > 0 && x < cols && y < rows; x += dir[0] * .7, y += dir[1] * .7) { grade.marca(Math.floor(x), Math.floor(y)); pedr += `<path d="${suave(blob(r, x * C + r.range(-6, 6), y * C + r.range(-6, 6), r.range(14, 20), r.range(11, 16), 7, .25))}"/>`; }
        bx += `<g fill="${FUNDO}" stroke="${COR.pedra}" stroke-width="1.3" stroke-opacity=".7">${pedr}</g>`; usa('pedra');
        // jardim de fora
        if (tipo === 'residencial' && pt >= 40) for (let t = 0; t < 30; t++) { // canteiro de areia rastelada (karesansui)
          const x = r.int(0, cols - 4), y = r.int(0, rows - 3);
          if (!grade.livre(x, y, 4, 3)) continue; grade.marca(x, y, 4, 3); grade.semTextura(x, y, 4, 3);
          const id = 'ks' + (++CLIP), Q = blob(r, (x + 2) * C, (y + 1.5) * C, C * 1.9, C * 1.35, 12, .1);
          bx += `<path d="${suave(Q)}" fill="${CHAO.areia.bg}" stroke="${CHAO.areia.linha}" stroke-width="1.3"/><clipPath id="${id}"><path d="${suave(Q)}"/></clipPath><g clip-path="url(#${id})" opacity=".5"><g transform="translate(${x * C} ${y * C})">${tinge(BL('HACHURAS', 'ondas').f(r, 4 * C, 3 * C), CHAO.areia.linha, FUNDO)}</g></g>` + rocha(r, (x + 2.4) * C, (y + 1.4) * C, C * .32, ['facetada']);
          break;
        }
        fx += espalha(r, cols, rows, grade, qtd(area, .025, mix.arvores), 1, (x, y) => r() < .6 ? arvore(r, (x + .5) * C, (y + .5) * C, C * r.range(.5, .75), ['raiosBorda', 'serrilhada', 'seixos']) : arbusto(r, (x + .5) * C, (y + .5) * C, C * .32));
        fx += espalha(r, cols, rows, grade, qtd(area, .012, mix.pedras), 1, (x, y) => rocha(r, (x + .5) * C, (y + .5) * C, C * r.range(.25, .4)));
        if (tipo === 'comercial') fx += espalha(r, cols, rows, grade, Math.round(area / 120), 1, (x, y) => objeto('toro', (x + .5) * C, (y + .5) * C));
        break;
      }
      case 'dungeon':
        fx += dungeon(r, cols, rows, mix, chao);
        break;
      case 'caverna': {
        bx += caverna(r, cols, rows, mix, chao, grade);
        fx += espalha(r, cols, rows, grade, qtd(area, .02, mix.pedras), 1, (x, y) => tinge(BL('PEDRAS', 'estalagmite').f(r, (x + .5) * C, (y + .5) * C, C * r.range(.25, .42)), COR.pedra, FUNDO));
        fx += espalha(r, cols, rows, grade, qtd(area, .008, mix.pedras), 2, (x, y) => rocha(r, (x + 1) * C, (y + 1) * C, C * r.range(.5, .8)));
        usa('pedra');
        break;
      }
      case 'aquatico': {
        const A = aquatico(r, cols, rows, mix, grade);
        bx += A.bx; fx += A.fx;
        break;
      }
    }
    let tx = '';
    if (pt > 0 && tipo !== 'dungeon' && tipo !== 'aquatico') tx = textura(r, cols, rows, grade, CHAO_TIPO[tipo] || 'grama', chao.linha, kt);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * C}" height="${rows * C}" viewBox="0 0 ${cols * C} ${rows * C}" style="position:absolute;inset:0;pointer-events:none">${rf}${tx}${bx}${mx}${fx}</svg>`;
  }

  // legenda do último mapa gerado (na ordem fixa), mais o chão
  function legenda(tipo) {
    const t = ANTIGOS[tipo] ? ANTIGOS[tipo].tipo : tipo, ch = CHAO[CHAO_TIPO[t] || 'grama'];
    const itens = ['cob', 'alto', 'agua', 'arv', 'pedra'].filter(k => USO.has(k)).map(k => ({ id: k, cor: LEG[k].cor, nome: LEG[k].nome }));
    if (t !== 'aquatico') itens.push({ id: 'chao', cor: ch.linha, fundo: ch.bg, nome: ch.nome });
    return itens;
  }
  // tamanho sugerido de mapa para uma planta (casa + jardim em volta)
  function tamanhoPlanta(id) { const L = BL('PLANTAS', id); return L ? { cols: L.w + 8, rows: L.h + 6 } : null; }
  // miniatura de uma planta (só a construção, sem jardim)
  function miniPlanta(id) {
    USO = new Set();
    const L = BL('PLANTAS', id), r = rng(7), chaoInt = L.grupo === 'residencial' ? CHAO.madeira : CHAO.pedra;
    FUNDO = '#ffffff';
    const P = planta(r, L, 1, 1, chaoInt, 1, null);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(L.w + 2) * C} ${(L.h + 2) * C}">${P.svg}</svg>`;
  }

  return {
    TIPOS, ELEMENTOS, PADRAO, VERTICAL, DENS, COR,
    novaSemente: () => Math.floor(Math.random() * 2147483646) + 1,
    normaliza: mixDe,
    fundo: tipo => (CHAO[CHAO_TIPO[ANTIGOS[tipo] ? ANTIGOS[tipo].tipo : tipo] || 'grama']).bg,
    chao: tipo => (CHAO[CHAO_TIPO[ANTIGOS[tipo] ? ANTIGOS[tipo].tipo : tipo] || 'grama']).bg,
    svg: gerar,
    legenda, tamanhoPlanta, miniPlanta,
  };
})();
