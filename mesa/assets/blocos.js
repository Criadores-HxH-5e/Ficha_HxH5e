/* ==========================================================
   SISTEMA SHINOBI — biblioteca de blocos em planta (top view)
   Cada bloco é uma função que devolve SVG (só traço, preto) a
   partir de uma semente, então toda pedra, árvore ou telhado
   pode sair diferente sem perder o estilo. O gerador de mapas
   usa estes blocos e troca a cor do traço por categoria.
   Escala dos móveis: 1 quadrado = 64 px = 1,5 m.
   ========================================================== */
window.Blocos = (function () {
  const K = '#161616';
  const f1 = n => Math.round(n * 10) / 10;
  let CLIP = 0;

  function rng(seed) {
    let a = seed >>> 0;
    const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.range = (a, b) => a + r() * (b - a);
    r.int = (a, b) => Math.floor(a + r() * (b - a + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    return r;
  }
  const pts = P => P.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ');
  const poly = (P, extra = '') => `<polygon points="${pts(P)}" ${extra}/>`;
  const line = (a, b, w = 1.2, extra = '', cor = K) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${cor}" stroke-width="${w}" ${extra}/>`;
  function suave(P, fechado = true) {
    const n = P.length; let d = '';
    const lim = fechado ? n : n - 2;
    if (!fechado) d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
    for (let i = 0; i < lim; i++) {
      const p = P[i], q = P[(i + 1) % n], s = P[(i + 2) % n];
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m2 = [(q[0] + s[0]) / 2, (q[1] + s[1]) / 2];
      if (fechado && i === 0) d += `M${f1(m[0])} ${f1(m[1])}`;
      d += ` Q${f1(q[0])} ${f1(q[1])} ${f1(m2[0])} ${f1(m2[1])}`;
    }
    return d + (fechado ? 'Z' : ` L${f1(P[n - 1][0])} ${f1(P[n - 1][1])}`);
  }
  function convexo(P) { // casco convexo (monotone chain)
    P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  const centro = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];

  // hachura de linhas paralelas recortada por um polígono (dir: 'v' verticais, 'h' horizontais, 'd' diagonais)
  function hachura(P, dir, gap = 4, w = .9, estilo = 'reta', r) {
    const id = 'bk' + (++CLIP);
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    const x0 = Math.min(...xs) - 2, x1 = Math.max(...xs) + 2, y0 = Math.min(...ys) - 2, y1 = Math.max(...ys) + 2;
    let d = '';
    if (dir === 'v') for (let x = x0; x <= x1; x += gap) d += estilo === 'onda' && r ? onda(x, y0, x, y1, r) : `M${f1(x)} ${f1(y0)}V${f1(y1)}`;
    else if (dir === 'h') for (let y = y0; y <= y1; y += gap) d += estilo === 'onda' && r ? onda(x0, y, x1, y, r) : `M${f1(x0)} ${f1(y)}H${f1(x1)}`;
    else { const L = (x1 - x0) + (y1 - y0); for (let t = -L; t <= L; t += gap) d += `M${f1(x0 + t)} ${f1(y1)}L${f1(x0 + t + (y1 - y0))} ${f1(y0)}`; }
    return `<clipPath id="${id}"><polygon points="${pts(P)}"/></clipPath><path d="${d}" clip-path="url(#${id})" stroke="${K}" stroke-width="${w}" fill="none"/>`;
  }
  function onda(xa, ya, xb, yb, r) { // linha levemente ondulada, como veio de madeira
    const n = 6, L = Math.hypot(xb - xa, yb - ya), nx = -(yb - ya) / L, ny = (xb - xa) / L;
    let d = `M${f1(xa)} ${f1(ya)}`;
    for (let i = 1; i <= n; i++) { const t = i / n, a = r.range(-1.6, 1.6); d += ` Q${f1(xa + (xb - xa) * (t - .5 / n) + nx * a * 2)} ${f1(ya + (yb - ya) * (t - .5 / n) + ny * a * 2)} ${f1(xa + (xb - xa) * t)} ${f1(ya + (yb - ya) * t)}`; }
    return d;
  }

  /* ======================= TELHADOS ======================= */
  // Cada telhado é uma lista de águas (polígono + para onde a água desce). As águas viradas
  // para baixo e para a direita ficam na sombra e levam hachura (luz vem do canto de cima à esquerda).
  function desenhaTelhado(r, aguas, contorno, cumeeiras, op = {}) {
    const est = op.estilo || 'reta', gap = op.gap || 4.5;
    let s = '';
    aguas.forEach(a => {
      s += poly(a.P, `fill="#fff" stroke="${K}" stroke-width="1.1" stroke-linejoin="round"`);
      const sombra = a.dir === 's' || a.dir === 'e';
      const dirLinha = (a.dir === 'n' || a.dir === 's') ? 'v' : 'h';
      if (sombra) s += hachura(a.P, dirLinha, gap, .85, est, r);
      else if (op.telhas) s += hachura(a.P, dirLinha, gap * 2.6, .7, est, r);
      if (op.telhas) s += hachura(a.P, dirLinha === 'v' ? 'h' : 'v', 9, .9, 'reta', r).replace('stroke-width="0.9"', `stroke-width="0.9" stroke-dasharray="1.5 ${f1(gap * 2.6 - 1.5)}" stroke-dashoffset="${f1(gap)}"`); // fiadas de telha
    });
    cumeeiras.forEach(([a, b]) => { s += line(a, b, 5) + line(a, b, 2.2, '', '#fff'); });
    // beiral com linha dupla
    s += `<polygon points="${pts(contorno)}" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="miter"/><polygon points="${pts(contorno)}" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="miter"/>`;
    return s;
  }
  const T = {};
  T.kiritsuma = (r, x, y, w, h, op) => { // duas águas (gable)
    const v = h > w;
    const aguas = v ? [{ P: [[x, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h]], dir: 'w' }, { P: [[x + w / 2, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h]], dir: 'e' }]
      : [{ P: [[x, y], [x + w, y], [x + w, y + h / 2], [x, y + h / 2]], dir: 'n' }, { P: [[x, y + h / 2], [x + w, y + h / 2], [x + w, y + h], [x, y + h]], dir: 's' }];
    const cum = v ? [[[x + w / 2, y], [x + w / 2, y + h]]] : [[[x, y + h / 2], [x + w, y + h / 2]]];
    return desenhaTelhado(r, aguas, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], cum, op);
  };
  T.yosemune = (r, x, y, w, h, op) => { // quatro águas (hipped)
    if (h > w) { const s = T.yosemune(r, y, x, h, w, op); return `<g transform="matrix(0 1 1 0 0 0)">${s}</g>`; }
    const k = h / 2, a = [x + k, y + k], b = [x + w - k, y + k];
    const aguas = [{ P: [[x, y], [x + w, y], b, a], dir: 'n' }, { P: [[x, y + h], [x + w, y + h], b, a], dir: 's' }, { P: [[x, y], [x, y + h], a], dir: 'w' }, { P: [[x + w, y], [x + w, y + h], b], dir: 'e' }];
    return desenhaTelhado(r, aguas, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], [[a, b]], op);
  };
  T.hougyo = (r, x, y, w, h, op) => { // pavilhão: quatro águas até um ponto
    const c = [x + w / 2, y + h / 2];
    const aguas = [{ P: [[x, y], [x + w, y], c], dir: 'n' }, { P: [[x, y + h], [x + w, y + h], c], dir: 's' }, { P: [[x, y], [x, y + h], c], dir: 'w' }, { P: [[x + w, y], [x + w, y + h], c], dir: 'e' }];
    let s = desenhaTelhado(r, aguas, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], [], op);
    return s + `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="5" fill="#fff" stroke="${K}" stroke-width="2"/>`; // hōju no topo
  };
  T.irimoya = (r, x, y, w, h, op) => { // meia-água: quatro águas embaixo, empena em cima
    if (h > w) { const s = T.irimoya(r, y, x, h, w, op); return `<g transform="matrix(0 1 1 0 0 0)">${s}</g>`; }
    const k = h * .24, m = y + h / 2;
    const p1 = [x + k, y + k], p2 = [x + k, y + h - k], p3 = [x + w - k, y + k], p4 = [x + w - k, y + h - k];
    const aguas = [
      { P: [[x, y], [x + w, y], p3, [x + w - k, m], [x + k, m], p1], dir: 'n' },
      { P: [[x, y + h], [x + w, y + h], p4, [x + w - k, m], [x + k, m], p2], dir: 's' },
      { P: [[x, y], p1, p2, [x, y + h]], dir: 'w' }, { P: [[x + w, y], p3, p4, [x + w, y + h]], dir: 'e' },
    ];
    let s = desenhaTelhado(r, aguas, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], [[[x + k, m], [x + w - k, m]]], op);
    return s + line(p1, p2, 2) + line(p3, p4, 2); // empenas (triângulos de madeira)
  };
  T.koshi = (r, x, y, w, h, op) => { // duas águas com lanternim no meio
    let s = T.kiritsuma(r, x, y, w, h, op);
    const lw = w * .34, lh = h * .38;
    return s + T.kiritsuma(r, x + w / 2 - lw / 2, y + h / 2 - lh / 2, lw, lh, Object.assign({}, op, { gap: 3.5 }));
  };
  T.shiroko = (r, x, y, w, h, op) => { // duas camadas: saia em volta e duas águas no centro
    const k = Math.min(w, h) * .2, ix = x + k, iy = y + k, iw = w - 2 * k, ih = h - 2 * k;
    const aguas = [
      { P: [[x, y], [x + w, y], [ix + iw, iy], [ix, iy]], dir: 'n' }, { P: [[x, y + h], [x + w, y + h], [ix + iw, iy + ih], [ix, iy + ih]], dir: 's' },
      { P: [[x, y], [ix, iy], [ix, iy + ih], [x, y + h]], dir: 'w' }, { P: [[x + w, y], [ix + iw, iy], [ix + iw, iy + ih], [x + w, y + h]], dir: 'e' },
    ];
    return desenhaTelhado(r, aguas, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], [], op) + T.kiritsuma(r, ix, iy, iw, ih, op);
  };
  T.emL = (r, x, y, W, H, op) => { // quatro águas em L (largura d constante)
    const d = Math.min(W, H) * .45, q = d / 2;
    const a = [x + q, y + q], b = [x + W - q, y + q], c = [x + W - q, y + H - q];
    const aguas = [
      { P: [[x, y], [x + W, y], b, a], dir: 'n' },
      { P: [[x, y + d], [x + W - d, y + d], b, a], dir: 's' },
      { P: [[x, y], [x, y + d], a], dir: 'w' },
      { P: [[x + W, y], [x + W, y + H], c, b], dir: 'e' },
      { P: [[x + W - d, y + d], [x + W - d, y + H], c, b], dir: 'w' },
      { P: [[x + W - d, y + H], [x + W, y + H], c], dir: 's' },
    ];
    const cont = [[x, y], [x + W, y], [x + W, y + H], [x + W - d, y + H], [x + W - d, y + d], [x, y + d]];
    return desenhaTelhado(r, aguas, cont, [[a, b], [b, c]], op);
  };
  T.emT = (r, x, y, W, H, op) => { // quatro águas em T
    const d = Math.min(W * .4, H * .45), q = d / 2, cx = x + W / 2;
    const a = [x + q, y + q], b = [x + W - q, y + q], m = [cx, y + q], e = [cx, y + H - q];
    const aguas = [
      { P: [[x, y], [x + W, y], b, a], dir: 'n' },
      { P: [[x, y + d], [cx - q, y + d], m, a], dir: 's' }, { P: [[cx + q, y + d], [x + W, y + d], b, m], dir: 's' },
      { P: [[x, y], [x, y + d], a], dir: 'w' }, { P: [[x + W, y], [x + W, y + d], b], dir: 'e' },
      { P: [[cx - q, y + d], [cx - q, y + H], e, m], dir: 'w' }, { P: [[cx + q, y + d], [cx + q, y + H], e, m], dir: 'e' },
      { P: [[cx - q, y + H], [cx + q, y + H], e], dir: 's' },
    ];
    const cont = [[x, y], [x + W, y], [x + W, y + d], [cx + q, y + d], [cx + q, y + H], [cx - q, y + H], [cx - q, y + d], [x, y + d]];
    return desenhaTelhado(r, aguas, cont, [[a, b], [m, e]], op);
  };
  T.comAnexo = (r, x, y, w, h, op) => { // casa de quatro águas com varanda de duas águas encostada
    const aw = w * .34, ah = h * .3;
    return T.kiritsuma(r, x + w / 2 - aw / 2, y + h - ah, aw, ah, Object.assign({}, op, { gap: 3.5 })) + T.yosemune(r, x, y, w, h * .76, op);
  };
  const TELHADOS = [
    { id: 'kiritsuma', nome: 'Kiritsuma', pt: 'Duas águas', f: T.kiritsuma, w: 150, h: 100 },
    { id: 'yosemune', nome: 'Yosemune', pt: 'Quatro águas', f: T.yosemune, w: 160, h: 100 },
    { id: 'hougyo', nome: 'Hōgyo', pt: 'Pavilhão (pirâmide)', f: T.hougyo, w: 120, h: 120 },
    { id: 'irimoya', nome: 'Irimoya', pt: 'Meia-água com empena', f: T.irimoya, w: 160, h: 110 },
    { id: 'koshi', nome: 'Koshi', pt: 'Com lanternim', f: T.koshi, w: 160, h: 110 },
    { id: 'shiroko', nome: 'Shiroko', pt: 'Duas camadas', f: T.shiroko, w: 160, h: 120 },
    { id: 'emL', nome: 'Em L', pt: 'Quatro águas em L', f: T.emL, w: 160, h: 150 },
    { id: 'emT', nome: 'Em T', pt: 'Quatro águas em T', f: T.emT, w: 170, h: 150 },
    { id: 'anexo', nome: 'Com varanda', pt: 'Quatro águas + anexo', f: T.comAnexo, w: 160, h: 140 },
    { id: 'telhas', nome: 'Yosemune · telhas', pt: 'Fiadas de telha', f: (r, x, y, w, h) => T.yosemune(r, x, y, w, h, { telhas: true }), w: 160, h: 100 },
    { id: 'madeira', nome: 'Irimoya · madeira', pt: 'Veio ondulado', f: (r, x, y, w, h) => T.irimoya(r, x, y, w, h, { estilo: 'onda', gap: 5 }), w: 160, h: 110 },
  ];

  /* ======================= PEDRAS ======================= */
  const P = {};
  P.facetada = (r, cx, cy, R, comSombra) => { // contorno + face de cima + arestas
    const n = r.int(7, 10);
    const out = convexo(Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + r.range(-.2, .2), d = R * r.range(.78, 1); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * r.range(.8, 1)]; }));
    const c = centro(out), ox = -R * r.range(.06, .16), oy = -R * r.range(.06, .16), k = r.range(.45, .6);
    const m = r.int(4, Math.min(6, out.length - 1));
    const top = convexo(Array.from({ length: m }, (_, i) => { const a = i / m * Math.PI * 2 + r.range(-.3, .3), d = R * k * r.range(.75, 1); return [c[0] + ox + Math.cos(a) * d, c[1] + oy + Math.sin(a) * d * .85]; }));
    let s = poly(out, `fill="#fff" stroke="${K}" stroke-width="2" stroke-linejoin="round"`) + poly(top, `fill="none" stroke="${K}" stroke-width="1.2" stroke-linejoin="round"`);
    top.forEach(t => { let best = out[0], bd = 1e9; out.forEach(o => { const dd = Math.hypot(o[0] - t[0], o[1] - t[1]); if (dd < bd) { bd = dd; best = o; } }); s += line(t, best, 1.1); });
    if (comSombra) { // hachura só nas faces de baixo e da direita, dentro da pedra
      const id = 'bk' + (++CLIP);
      s += `<clipPath id="${id}"><polygon points="${pts(out)}"/></clipPath><g clip-path="url(#${id})"><clipPath id="${id}b"><circle cx="${f1(cx + R * .7)}" cy="${f1(cy + R * .7)}" r="${f1(R * .95)}"/></clipPath><g clip-path="url(#${id}b)">${hachura(out, 'd', 3.6, .75)}</g></g>` + poly(top, `fill="#fff" stroke="${K}" stroke-width="1.2" stroke-linejoin="round"`);
    }
    return s;
  };
  P.cristal = (r, cx, cy, R) => { // lascas pontudas
    const a0 = r.range(0, Math.PI), L = R * 1.1, wd = R * .42;
    const ax = Math.cos(a0), ay = Math.sin(a0), nx = -ay, ny = ax;
    const tip1 = [cx + ax * L, cy + ay * L], tip2 = [cx - ax * L * .7, cy - ay * L * .7];
    const out = [tip1, [cx + nx * wd + ax * L * .2, cy + ny * wd + ay * L * .2], [cx + nx * wd * .8 - ax * L * .4, cy + ny * wd * .8 - ay * L * .4], tip2, [cx - nx * wd * .9 - ax * L * .3, cy - ny * wd * .9 - ay * L * .3], [cx - nx * wd + ax * L * .3, cy - ny * wd + ay * L * .3]];
    return poly(out, `fill="#fff" stroke="${K}" stroke-width="2" stroke-linejoin="round"`) + line(tip1, tip2, 1.1) + line(out[1], [cx + ax * L * .05, cy + ay * L * .05], 1) + line(out[4], [cx - ax * L * .15, cy - ay * L * .15], 1);
  };
  P.seixo = (r, cx, cy, R) => { // pedra rolada, lisa
    const B = Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2, d = R * r.range(.88, 1); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7]; });
    return `<path d="${suave(B)}" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M${f1(cx - R * .5)} ${f1(cy - R * .15)} Q${f1(cx - R * .2)} ${f1(cy - R * .45)} ${f1(cx + R * .25)} ${f1(cy - R * .35)}" fill="none" stroke="${K}" stroke-width="1.1"/>`;
  };
  P.sombreada = (r, cx, cy, R) => P.facetada(r, cx, cy, R, true);
  P.grupo = (r, cx, cy, R) => P.facetada(r, cx - R * .35, cy - R * .1, R * .55) + P.facetada(r, cx + R * .4, cy + R * .2, R * .42) + P.seixo(r, cx - R * .1, cy + R * .55, R * .28);
  P.rochedo = (r, cx, cy, R) => { // pedra grande com faces em leque
    const n = r.int(9, 12);
    const out = convexo(Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, d = R * r.range(.8, 1); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * .85]; }));
    const pk = [cx - R * .18, cy - R * .2];
    let s = poly(out, `fill="#fff" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"`);
    out.forEach((o, i) => { if (i % 2 === 0) s += line(pk, o, 1.1); });
    out.forEach((a, i) => { const b = out[(i + 1) % out.length]; if ((a[0] + b[0]) / 2 - cx + (a[1] + b[1]) / 2 - cy > R * .3) s += hachura([pk, a, b], 'd', 3.6, .7); });
    return s;
  };
  P.laje = (r, cx, cy, R) => { // laje plana com rachaduras
    const n = r.int(6, 8);
    const out = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + r.range(-.2, .2), d = R * r.range(.75, 1); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * .75]; });
    let s = poly(out, `fill="#fff" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"`);
    let p = [cx + r.range(-R * .3, R * .3), cy + r.range(-R * .2, R * .2)], d = `M${f1(p[0])} ${f1(p[1])}`;
    for (let i = 0; i < 5; i++) { p = [p[0] + r.range(R * .05, R * .3) * (i % 2 ? 1 : -1) + R * .12, p[1] + r.range(-R * .2, R * .2)]; d += `L${f1(p[0])} ${f1(p[1])}`; }
    d += `M${f1(cx - R * .5)} ${f1(cy + R * .3)}l${f1(R * .25)} ${f1(-R * .1)}l${f1(R * .1)} ${f1(R * .15)}`;
    return s + `<path d="${d}" fill="none" stroke="${K}" stroke-width=".9"/>`;
  };
  P.cascalho = (r, cx, cy, R) => {
    let s = '';
    for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * .9, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rr = r.range(3, 8) * (1 - d / R * .5);
      const Q = Array.from({ length: 5 }, (_, j) => { const b = j / 5 * Math.PI * 2 + r(), e = rr * r.range(.7, 1); return [x + Math.cos(b) * e, y + Math.sin(b) * e]; });
      s += poly(Q, `fill="#fff" stroke="${K}" stroke-width="1"`); }
    return s;
  };
  P.estalagmite = (r, cx, cy, R) => { // cone de pedra visto de cima: anéis irregulares até a ponta
    let s = '';
    [1, .7, .42].forEach((k, i) => { const n = 9, Q = Array.from({ length: n }, (_, j) => { const a = j / n * Math.PI * 2 + r.range(-.2, .2), d = R * k * r.range(.8, 1); return [cx + Math.cos(a) * d - R * (1 - k) * .25, cy + Math.sin(a) * d - R * (1 - k) * .25]; }); s += poly(Q, `fill="#fff" stroke="${K}" stroke-width="${i ? 1 : 1.8}" stroke-linejoin="round"`); });
    return s + `<circle cx="${f1(cx - R * .17)}" cy="${f1(cy - R * .17)}" r="2.2" fill="${K}"/>`;
  };
  const PEDRAS = [
    { id: 'facetada', nome: 'Facetada', pt: 'Face de cima e arestas', f: P.facetada },
    { id: 'sombreada', nome: 'Com sombra', pt: 'Hachura no lado escuro', f: P.sombreada },
    { id: 'rochedo', nome: 'Rochedo', pt: 'Faces em leque', f: P.rochedo },
    { id: 'cristal', nome: 'Lasca', pt: 'Pedra pontuda', f: P.cristal },
    { id: 'estalagmite', nome: 'Estalagmite', pt: 'Cavernas', f: P.estalagmite },
    { id: 'grupo', nome: 'Grupo', pt: 'Três pedras', f: P.grupo },
    { id: 'cascalho', nome: 'Cascalho', pt: 'Brita espalhada', f: P.cascalho },
  ];

  /* ======================= ÁRVORES ======================= */
  const A = {};
  A.raios = (r, cx, cy, R) => { // muitos raios saindo do tronco (pinheiro-guarda-chuva)
    const n = r.int(40, 56); let d = '';
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r.range(-.04, .04), L = R * r.range(.82, 1), b = a + r.range(-.12, .12); d += `M${f1(cx)} ${f1(cy)}Q${f1(cx + Math.cos(b) * L * .55)} ${f1(cy + Math.sin(b) * L * .55)} ${f1(cx + Math.cos(a) * L)} ${f1(cy + Math.sin(a) * L)}`; }
    return `<path d="${d}" fill="none" stroke="${K}" stroke-width=".9"/>`;
  };
  A.raiosBorda = (r, cx, cy, R) => { // raios + borda em laçadas
    return A.raios(r, cx, cy, R * .9) + `<path d="${nuvem(r, cx, cy, R, r.int(24, 30))}" fill="none" stroke="${K}" stroke-width="1.2"/>`;
  };

  function nuvem(r, cx, cy, R, n, de = 0, ate = Math.PI * 2, fechado = true) { // contorno de bolinhas (folhagem)
    let d = '', ant = null;
    for (let i = 0; i <= n; i++) {
      const a = de + (ate - de) * i / n, rr = R * r.range(.9, 1.03), p = [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
      if (!ant) d += `M${f1(p[0])} ${f1(p[1])}`;
      else { const ch = Math.hypot(p[0] - ant[0], p[1] - ant[1]); d += ` A${f1(ch * r.range(.5, .62))} ${f1(ch * r.range(.5, .62))} 0 0 1 ${f1(p[0])} ${f1(p[1])}`; }
      ant = p;
    }
    return d + (fechado ? 'Z' : '');
  }
  A.crespa = (r, cx, cy, R) => { // copa de folhagem crespa, com volumes de sombra por dentro
    let s = `<path d="${nuvem(r, cx, cy, R, r.int(30, 38))}" fill="#fff" stroke="${K}" stroke-width="1.3"/>`;
    for (let i = 0; i < 6; i++) { const a = r.range(-1.2, 3.4), d = R * r.range(.2, .6), de = r.range(0, 6.28); s += `<path d="${nuvem(r, cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * r.range(.18, .32), 8, de, de + r.range(2, 3.4), false)}" fill="none" stroke="${K}" stroke-width=".9"/>`; }
    return s;
  };
  A.seixos = (r, cx, cy, R) => { // copa leve com folhas ovais concentradas na sombra
    let s = `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" fill="#fff" stroke="${K}" stroke-width="1" stroke-dasharray="1 3" stroke-linecap="round"/>`;
    for (let i = 0; i < 60; i++) { const a = r.range(-.6, 2.2), d = R * Math.sqrt(r.range(.1, .95)), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rr = r.range(2.5, 6);
      if (r() < .3 && d < R * .5) continue;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr)}" ry="${f1(rr * .7)}" transform="rotate(${f1(r.range(0, 180))} ${f1(x)} ${f1(y)})" fill="none" stroke="${K}" stroke-width=".9"/>`; }
    return s;
  };
  A.galhos = (r, cx, cy, R) => { // árvore sem folhas: galhos ramificados
    let s = `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" fill="#fff" stroke="${K}" stroke-width=".8" stroke-opacity=".5"/>`;
    const galho = (x, y, a, L, w, prof) => {
      if (prof === 0 || L < 3) return;
      const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
      s += `<path d="M${f1(x)} ${f1(y)}Q${f1(x + Math.cos(a + r.range(-.3, .3)) * L * .5)} ${f1(y + Math.sin(a + r.range(-.3, .3)) * L * .5)} ${f1(ex)} ${f1(ey)}" stroke="${K}" stroke-width="${f1(w)}" stroke-linecap="round" fill="none"/>`;
      const nf = prof > 2 ? 2 : r.int(1, 3);
      for (let i = 0; i < nf; i++) galho(ex, ey, a + r.range(-.7, .7), L * r.range(.55, .72), w * .62, prof - 1);
    };
    const n = r.int(4, 6);
    for (let i = 0; i < n; i++) galho(cx, cy, i / n * Math.PI * 2 + r.range(-.3, .3), R * .42, 4.5, 4);
    return s + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="4.5" fill="${K}"/>`;
  };
  A.petalas = (r, cx, cy, R) => { // folhas em laçada ao redor do centro
    const n = r.int(18, 26); let d = '';
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, w = Math.PI / n * .9, L = R * r.range(.85, 1);
      d += `M${f1(cx)} ${f1(cy)}Q${f1(cx + Math.cos(a - w) * L * 1.05)} ${f1(cy + Math.sin(a - w) * L * 1.05)} ${f1(cx + Math.cos(a) * L)} ${f1(cy + Math.sin(a) * L)}Q${f1(cx + Math.cos(a + w) * L * 1.05)} ${f1(cy + Math.sin(a + w) * L * 1.05)} ${f1(cx)} ${f1(cy)}`; }
    return `<path d="${d}" fill="#fff" stroke="${K}" stroke-width="1"/>`;
  };
  A.serrilhada = (r, cx, cy, R) => { // raios esparsos e borda serrilhada
    const n = r.int(16, 22), m = r.int(36, 48); let d = '', b = '';
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; d += `M${f1(cx)} ${f1(cy)}L${f1(cx + Math.cos(a) * R * .9)} ${f1(cy + Math.sin(a) * R * .9)}`; }
    for (let i = 0; i <= m; i++) { const a = i / m * Math.PI * 2, rr = R * (i % 2 ? .9 : 1.02) * r.range(.97, 1.02); b += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`; }
    return `<path d="${b}Z" fill="#fff" stroke="${K}" stroke-width="1.1" stroke-linejoin="round"/><path d="${d}" stroke="${K}" stroke-width=".9"/>`;
  };
  A.palmeira = (r, cx, cy, R) => { // folhas de palmeira com folíolos
    const n = r.int(7, 9); let s = '';
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + r.range(-.15, .15), curva = r.range(-.35, .35), L = R * r.range(.85, 1);
      const P2 = [cx + Math.cos(a + curva) * L * .55, cy + Math.sin(a + curva) * L * .55], E = [cx + Math.cos(a) * L, cy + Math.sin(a) * L];
      s += `<path d="M${f1(cx)} ${f1(cy)}Q${f1(P2[0])} ${f1(P2[1])} ${f1(E[0])} ${f1(E[1])}" fill="none" stroke="${K}" stroke-width="1.4"/>`;
      let d = '';
      for (let t = .2; t < .96; t += .085) {
        const x = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * P2[0] + t * t * E[0], y = (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * P2[1] + t * t * E[1];
        const tx = 2 * (1 - t) * (P2[0] - cx) + 2 * t * (E[0] - P2[0]), ty = 2 * (1 - t) * (P2[1] - cy) + 2 * t * (E[1] - P2[1]), tl = Math.hypot(tx, ty);
        const l = R * .2 * Math.sin(t * Math.PI), nx = -ty / tl, ny = tx / tl;
        d += `M${f1(x)} ${f1(y)}l${f1((nx + tx / tl * .6) * l)} ${f1((ny + ty / tl * .6) * l)}M${f1(x)} ${f1(y)}l${f1((-nx + tx / tl * .6) * l)} ${f1((-ny + ty / tl * .6) * l)}`;
      }
      s += `<path d="${d}" stroke="${K}" stroke-width=".8"/>`;
    }
    return s + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="3.5" fill="${K}"/>`;
  };
  A.conifera = (r, cx, cy, R) => { // camadas de agulhas
    let s = '';
    [1, .68, .38].forEach((k, j) => {
      const n = 14 - j * 3; let p = '', d = '';
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + j * .2, dd = R * k * (i % 2 ? .8 : 1); p += `${f1(cx + Math.cos(a) * dd)},${f1(cy + Math.sin(a) * dd)} `; if (i % 2 === 0) d += `M${f1(cx + Math.cos(a) * dd * .7)} ${f1(cy + Math.sin(a) * dd * .7)}L${f1(cx + Math.cos(a) * dd)} ${f1(cy + Math.sin(a) * dd)}`; }
      s += `<polygon points="${p}" fill="#fff" stroke="${K}" stroke-width="${j ? .9 : 1.3}" stroke-linejoin="round"/><path d="${d}" stroke="${K}" stroke-width=".7"/>`;
    });
    return s + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="2.5" fill="${K}"/>`;
  };
  A.circulo = (r, cx, cy, R) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" fill="#fff" stroke="${K}" stroke-width="1.4"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R * .82)}" fill="none" stroke="${K}" stroke-width=".7"/><path d="M${f1(cx - 5)} ${f1(cy)}h10M${f1(cx)} ${f1(cy - 5)}v10" stroke="${K}" stroke-width="1.1"/>`;
  A.arbusto = (r, cx, cy, R) => { let s = ''; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + r(), d = R * .32; s += `<path d="${nuvem(r, cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * .5, 12)}" fill="#fff" stroke="${K}" stroke-width="1.1"/>`; } return s + `<path d="${nuvem(r, cx, cy, R * .3, 8)}" fill="#fff" stroke="${K}" stroke-width=".9"/>`; };
  A.bambu = (r, cx, cy, R) => { // touceira: colmos (círculos) com folhas finas
    let s = '', d = '';
    for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, L = R * r.range(.4, 1); d += `M${f1(cx + Math.cos(a) * L * .3)} ${f1(cy + Math.sin(a) * L * .3)}l${f1(Math.cos(a) * L * .7)} ${f1(Math.sin(a) * L * .7)}`; }
    s += `<path d="${d}" stroke="${K}" stroke-width=".8"/>`;
    for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, e = Math.sqrt(r()) * R * .32; s += `<circle cx="${f1(cx + Math.cos(a) * e)}" cy="${f1(cy + Math.sin(a) * e)}" r="${f1(r.range(2.5, 4))}" fill="#fff" stroke="${K}" stroke-width="1.2"/>`; }
    return s;
  };
  const ARVORES = [
    { id: 'raios', nome: 'Raios', pt: 'Pinheiro-guarda-chuva', f: A.raios },
    { id: 'raiosBorda', nome: 'Raios e laçadas', pt: 'Copa com borda', f: A.raiosBorda },
    { id: 'serrilhada', nome: 'Serrilhada', pt: 'Raios esparsos', f: A.serrilhada },
    { id: 'seixos', nome: 'Folhas soltas', pt: 'Copa leve', f: A.seixos },
    { id: 'galhos', nome: 'Galhos', pt: 'Sem folhas (inverno)', f: A.galhos },
    { id: 'palmeira', nome: 'Palmeira', pt: 'Folhas com folíolos', f: A.palmeira },
    { id: 'conifera', nome: 'Conífera', pt: 'Camadas de agulhas', f: A.conifera },
    { id: 'arbusto', nome: 'Arbusto', pt: 'Moita', f: A.arbusto },
    { id: 'bambu', nome: 'Bambu', pt: 'Touceira', f: A.bambu },
  ];

  /* ======================= TOPOGRAFIA ======================= */
  // Curvas de nível de verdade: monta um terreno (soma de montes) e traça os contornos (marching squares)
  const g2 = (x, y, cx, cy, sx, sy, rot = 0) => { const c = Math.cos(rot), s = Math.sin(rot), dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c; return Math.exp(-(u * u) / (2 * sx * sx) - (v * v) / (2 * sy * sy)); };
  const CAMPOS = {
    pico: r => { const cx = r.range(.42, .58), cy = r.range(.42, .58), sx = r.range(.16, .22), sy = r.range(.12, .18), rot = r.range(0, 3); return (x, y) => g2(x, y, cx, cy, sx, sy, rot); },
    duplo: r => { const a = r.range(.25, .35), b = r.range(.65, .75), h2 = r.range(.6, .8); return (x, y) => Math.max(g2(x, y, a, .5, .13, .15), h2 * g2(x, y, b, .5, .12, .12)) + .25 * g2(x, y, .5, .5, .35, .2); },
    sela: r => (x, y) => .95 * g2(x, y, .3, .5, .13, .14) + .95 * g2(x, y, .7, .5, .13, .14),
    crista: r => { const rot = r.range(-.5, .5); return (x, y) => g2(x, y, .5, .5, .34, .1, rot) * (1 + .25 * Math.sin(x * 12)); },
    ingreme: r => (x, y) => { const sx = x < .42 ? .07 : .3; return Math.exp(-((x - .42) ** 2) / (2 * sx * sx) - ((y - .5) ** 2) / (2 * .2 * .2)); },
    rampa: r => (x, y) => { const sx = x > .68 ? .06 : .32; return Math.exp(-((x - .68) ** 2) / (2 * sx * sx) - ((y - .5) ** 2) / (2 * .13 * .13)); },
    planalto: r => (x, y) => Math.min(1.5 * g2(x, y, .5, .5, .2, .16, r.range(0, 3) * 0), .9),
    depressao: r => (x, y) => 1 - g2(x, y, .5, .52, .18, .14),
    colinas: r => { const M = Array.from({ length: r.int(6, 9) }, () => [r.range(.15, .85), r.range(.15, .85), r.range(.06, .16), r.range(.06, .16), r.range(0, 3), r.range(.4, 1)]); return (x, y) => M.reduce((s, m) => s + m[5] * g2(x, y, m[0], m[1], m[2], m[3], m[4]), 0); },
    macico: r => { const n = r.int(4, 6), fase = r.range(0, 6.28), E = Array.from({ length: n }, (_, i) => { const a = fase + i / n * 6.28 + r.range(-.3, .3), d = r.range(.14, .22); return [.5 + Math.cos(a) * d, .5 + Math.sin(a) * d * .8, a]; }); return (x, y) => g2(x, y, .5, .5, .1, .09) + E.reduce((s, e) => s + .55 * g2(x, y, e[0], e[1], .13, .04, e[2]), 0); },
    vale: r => { const f1x = r.range(5, 8), f2x = r.range(5, 8), ph = r.range(0, 6); return (x, y) => { const env = Math.exp(-((x - .5) ** 2) / (2 * .32 * .32)); const c1 = .3 + .06 * Math.sin(x * f1x + ph), c2 = .7 + .06 * Math.sin(x * f2x + ph * 1.7); return env * (Math.exp(-((y - c1) ** 2) / (2 * .07 * .07)) + .85 * Math.exp(-((y - c2) ** 2) / (2 * .08 * .08))); }; },
    meandro: r => { const fr = r.range(6, 10), ph = r.range(0, 6); return (x, y) => { const env = Math.exp(-((x - .5) ** 2) / (2 * .3 * .3)); const c = .5 + .16 * Math.sin(x * fr + ph); return env * Math.exp(-((y - c) ** 2) / (2 * .08 * .08)) * (1 + .2 * Math.sin(x * 23)); }; },
    cratera: r => { const R = r.range(.2, .26); return (x, y) => { const d = Math.hypot((x - .5) / 1.15, y - .5); return Math.exp(-((d - R) ** 2) / (2 * .06 * .06)) * (1 + .25 * Math.sin(Math.atan2(y - .5, x - .5) * 3)) + .15 * Math.exp(-(d * d) / (2 * .05 * .05)); }; },
  };
  function topo(r, tipo, W, H, op = {}) {
    const f = CAMPOS[tipo](r), N = 72, M = Math.round(N * H / W), dx = W / N, dy = H / M;
    const v = []; for (let j = 0; j <= M; j++) { v[j] = []; for (let i = 0; i <= N; i++) v[j][i] = f(i / N, j / M); }
    let min = Infinity, max = -Infinity; v.forEach(l => l.forEach(z => { min = Math.min(min, z); max = Math.max(max, z); }));
    const niveis = op.niveis || 9, out = [];
    const ls = []; for (let k = 1; k <= niveis; k++) ls.push(min + (max - min) * k / (niveis + 1));
    ls.forEach((L, li) => {
      let d = '';
      const P = (i, j, i2, j2) => { const a = v[j][i], b = v[j2][i2], t = (L - a) / (b - a); return [(i + (i2 - i) * t) * dx, (j + (j2 - j) * t) * dy]; };
      for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) {
        const c = (v[j][i] > L ? 8 : 0) | (v[j][i + 1] > L ? 4 : 0) | (v[j + 1][i + 1] > L ? 2 : 0) | (v[j + 1][i] > L ? 1 : 0);
        if (c === 0 || c === 15) continue;
        const e = { t: () => P(i, j, i + 1, j), r: () => P(i + 1, j, i + 1, j + 1), b: () => P(i, j + 1, i + 1, j + 1), l: () => P(i, j, i, j + 1) };
        const seg = { 1: ['l', 'b'], 2: ['b', 'r'], 3: ['l', 'r'], 4: ['t', 'r'], 5: ['l', 't', 'b', 'r'], 6: ['t', 'b'], 7: ['l', 't'], 8: ['l', 't'], 9: ['t', 'b'], 10: ['t', 'r', 'l', 'b'], 11: ['t', 'r'], 12: ['l', 'r'], 13: ['b', 'r'], 14: ['l', 'b'] }[c];
        for (let s = 0; s < seg.length; s += 2) { const a = e[seg[s]](), b = e[seg[s + 1]](); d += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
          if (op.marcas && li === niveis - 1 && (i + j) % 3 === 0) { // marcas apontando para o fundo da depressão
            const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, gx = (v[j][i + 1] - v[j][i]), gy = (v[j + 1][i] - v[j][i]), gl = Math.hypot(gx, gy) || 1;
            d += `M${f1(mx)} ${f1(my)}l${f1(-gx / gl * 6)} ${f1(-gy / gl * 6)}`; } }
      }
      const mestra = (li + 1) % 4 === 0;
      out.push(`<path d="${d}" fill="none" stroke="${K}" stroke-width="${mestra ? 1.8 : 1}" stroke-linecap="round"/>`);
    });
    // topo do morro: cruz no ponto mais alto (exceto depressão)
    if (tipo !== 'depressao') { let si = 0, sj = 0, n = 0; v.forEach((l, j) => l.forEach((z, i) => { if (z >= max - (max - min) * .01) { si += i; sj += j; n++; } })); let bi = si / n, bj = sj / n; if (v[Math.round(bj)][Math.round(bi)] < max - (max - min) * .03) { v.forEach((l, j) => l.forEach((z, i) => { if (z === max) { bi = i; bj = j; } })); } out.push(`<path d="M${f1(bi * dx - 6)} ${f1(bj * dy)}h12M${f1(bi * dx)} ${f1(bj * dy - 6)}v12" stroke="${K}" stroke-width="1.4"/>`); }
    return out.join('');
  }
  const TOPOS = [
    { id: 'pico', nome: 'Morro', pt: 'Um pico', f: (r, W, H) => topo(r, 'pico', W, H) },
    { id: 'duplo', nome: 'Dois picos', pt: 'Um mais alto', f: (r, W, H) => topo(r, 'duplo', W, H) },
    { id: 'sela', nome: 'Sela', pt: 'Passagem entre morros', f: (r, W, H) => topo(r, 'sela', W, H) },
    { id: 'crista', nome: 'Crista', pt: 'Espinhaço alongado', f: (r, W, H) => topo(r, 'crista', W, H) },
    { id: 'ingreme', nome: 'Encosta íngreme', pt: 'Linhas juntas = subida forte', f: (r, W, H) => topo(r, 'ingreme', W, H) },
    { id: 'rampa', nome: 'Rampa', pt: 'Sobe devagar, cai de repente', f: (r, W, H) => topo(r, 'rampa', W, H) },
    { id: 'planalto', nome: 'Planalto', pt: 'Topo plano', f: (r, W, H) => topo(r, 'planalto', W, H) },
    { id: 'depressao', nome: 'Depressão', pt: 'Buraco (marcas para dentro)', f: (r, W, H) => topo(r, 'depressao', W, H, { marcas: true }) },
    { id: 'colinas', nome: 'Colinas', pt: 'Vários morrinhos', f: (r, W, H) => topo(r, 'colinas', W, H) },
    { id: 'macico', nome: 'Maciço', pt: 'Pico com contrafortes', f: (r, W, H) => topo(r, 'macico', W, H) },
    { id: 'vale', nome: 'Vale', pt: 'Entre duas serras', f: (r, W, H) => topo(r, 'vale', W, H) },
    { id: 'meandro', nome: 'Serra sinuosa', pt: 'Crista que serpenteia', f: (r, W, H) => topo(r, 'meandro', W, H) },
    { id: 'cratera', nome: 'Cratera', pt: 'Anel com fundo', f: (r, W, H) => topo(r, 'cratera', W, H) },
  ];

  /* ======================= HACHURAS ======================= */
  // Amostras retangulares. No mapa, usar só em manchas pequenas.
  const H = {};
  const clipRet = (W, Hh, inner) => { const id = 'bk' + (++CLIP); return `<clipPath id="${id}"><rect width="${W}" height="${Hh}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
  H.diagonal = (r, W, Hh) => hachura([[0, 0], [W, 0], [W, Hh], [0, Hh]], 'd', 9, 1.1);
  H.cruzada = (r, W, Hh) => hachura([[0, 0], [W, 0], [W, Hh], [0, Hh]], 'd', 7, .9) + `<g transform="matrix(-1 0 0 1 ${W} 0)">${hachura([[0, 0], [W, 0], [W, Hh], [0, Hh]], 'd', 7, .9)}</g>`;
  H.madeira = (r, W, Hh) => { let d = ''; for (let y = 4; y < Hh; y += 7) d += onda(0, y, W, y + r.range(-3, 3), r); const kx = r.range(W * .3, W * .7), ky = Hh / 2; let k = ''; for (let i = 1; i < 4; i++) k += `<ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="${i * 7}" ry="${i * 3}" fill="#fff" stroke="${K}" stroke-width=".9"/>`; return clipRet(W, Hh, `<path d="${d}" fill="none" stroke="${K}" stroke-width=".9"/>${k}`); };
  H.tabuas = (r, W, Hh) => { let d = ''; for (let y = 0; y <= Hh; y += 14) { d += `M0 ${y}H${W}`; for (let x = r.range(10, 60); x < W; x += r.range(50, 90)) d += `M${f1(x)} ${y}v14`; } for (let y = 4; y < Hh; y += 14) d += onda(4, y + 3, W - 4, y + 3, r).replace(/^M/, 'M'); return clipRet(W, Hh, `<path d="${d}" fill="none" stroke="${K}" stroke-width=".8"/>`); };
  H.solo = (r, W, Hh) => { let d = ''; for (let x = 2; x < W; x += 3.2) d += `M${f1(x)} 0V${Hh}`; return clipRet(W, Hh, `<path d="${d}" stroke="${K}" stroke-width=".8"/>`); };
  H.pedraAssentada = (r, W, Hh) => { // lajotas irregulares (grade torta)
    const cw = 30, ch = 24, nx = Math.ceil(W / cw) + 1, ny = Math.ceil(Hh / ch) + 1, V = [];
    for (let j = 0; j <= ny; j++) { V[j] = []; for (let i = 0; i <= nx; i++) V[j][i] = [i * cw + r.range(-9, 9) - 8, j * ch + r.range(-7, 7) - 6]; }
    let s = '';
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const q = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]], c = centro(q);
      const lados = []; q.forEach((p, k) => { const n = q[(k + 1) % 4]; lados.push(p); if (r() < .5) lados.push([(p[0] + n[0]) / 2 + r.range(-4, 4), (p[1] + n[1]) / 2 + r.range(-4, 4)]); });
      s += poly(lados.map(p => [c[0] + (p[0] - c[0]) * .88, c[1] + (p[1] - c[1]) * .88]), `fill="#fff" stroke="${K}" stroke-width="1.1" stroke-linejoin="round"`);
    }
    return clipRet(W, Hh, s);
  };
  H.pedraNatural = (r, W, Hh) => { // pedras de tamanhos variados com rejunte preto
    let s = `<rect width="${W}" height="${Hh}" fill="${K}"/>`;
    for (let y = 6, lin = 0; y < Hh + 14; y += r.range(15, 21), lin++) for (let x = (lin % 2) * 10 - 6; x < W + 14;) {
      const w = r.range(14, 26), h = r.range(10, 16), n = r.int(5, 7);
      s += `<path d="${suave(Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + r.range(-.2, .2), d = r.range(.82, 1); return [x + w / 2 + Math.cos(a) * w / 2 * d, y + Math.sin(a) * h / 2 * d]; }))}" fill="#fff"/>`;
      x += w + r.range(3, 6);
    }
    return clipRet(W, Hh, s);
  };
  H.concreto = (r, W, Hh) => { let d = '', t = ''; for (let i = 0; i < W * Hh / 60; i++) d += `M${f1(r.range(0, W))} ${f1(r.range(0, Hh))}h.1`; for (let i = 0; i < W * Hh / 600; i++) { const x = r.range(4, W - 4), y = r.range(4, Hh - 4), a = r.range(0, 6.28); t += `<polygon points="${pts([0, 1, 2].map(k => [x + Math.cos(a + k * 2.1) * 4, y + Math.sin(a + k * 2.1) * 4]))}" fill="none" stroke="${K}" stroke-width=".9"/>`; } return clipRet(W, Hh, `<path d="${d}" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>${t}`); };
  H.areia = (r, W, Hh) => { let d = ''; for (let i = 0; i < W * Hh / 28; i++) d += `M${f1(r.range(0, W))} ${f1(r.range(0, Hh))}h.1`; return clipRet(W, Hh, `<path d="${d}" stroke="${K}" stroke-width="1.5" stroke-linecap="round"/>`); };
  H.agua = (r, W, Hh) => { let s = ''; [[W * .25, Hh * .75], [W * .8, Hh * .25]].forEach(([cx, cy]) => { for (let k = 6; k < 90; k += 9) s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${k}" fill="none" stroke="${K}" stroke-width=".9" stroke-dasharray="${f1(r.range(5, 9))} ${f1(r.range(3, 5))}"/>`; }); return clipRet(W, Hh, s); };
  H.ondas = (r, W, Hh) => { let d = ''; for (let y = 6, i = 0; y < Hh; y += 10, i++) { d += `M${-(i % 2) * 10} ${y}`; for (let x = 0; x < W + 20; x += 20) d += ` q5 -4 10 0 t10 0`; } return clipRet(W, Hh, `<path d="${d}" fill="none" stroke="${K}" stroke-width=".9"/>`); };
  H.brita = (r, W, Hh) => { let s = ''; for (let x = 4; x < W; x += 22) { let y = 3; while (y < Hh) { const h = r.range(14, 26); s += `<rect x="${f1(x + r.range(-1, 1))}" y="${f1(y)}" width="${f1(r.range(15, 19))}" height="${f1(Math.min(h, Hh - y))}" rx="7" fill="#fff" stroke="${K}" stroke-width="1.1"/>`; y += h + 2; } } return clipRet(W, Hh, s); };
  H.terra = (r, W, Hh) => { // blocos de linhas alternando a direção
    let s = ''; const b = 30;
    for (let i = 0; i * b < W + b; i++) { const x0 = i * b, P = [[x0, 0], [x0 + b, 0], [x0 + b, Hh], [x0, Hh]]; s += hachura(P, i % 2 ? 'd' : 'v', 4, .8); }
    return clipRet(W, Hh, s);
  };
  H.grama = (r, W, Hh) => { let d = ''; for (let i = 0; i < W * Hh / 170; i++) { const x = r.range(0, W), y = r.range(8, Hh); d += `M${f1(x)} ${f1(y)}l-3 -7M${f1(x)} ${f1(y)}l0 -9M${f1(x)} ${f1(y)}l3 -7`; } return clipRet(W, Hh, `<path d="${d}" stroke="${K}" stroke-width="1" stroke-linecap="round"/>`); };
  const HACHURAS = [
    { id: 'diagonal', nome: 'Diagonal', pt: 'Parede, alvenaria', f: H.diagonal },
    { id: 'cruzada', nome: 'Cruzada', pt: 'Sombra forte', f: H.cruzada },
    { id: 'madeira', nome: 'Madeira', pt: 'Veio com nó', f: H.madeira },
    { id: 'tabuas', nome: 'Tábuas', pt: 'Assoalho, deque', f: H.tabuas },
    { id: 'solo', nome: 'Solo firme', pt: 'Corte de terreno', f: H.solo },
    { id: 'terra', nome: 'Terra', pt: 'Blocos alternados', f: H.terra },
    { id: 'pedraAssentada', nome: 'Pedra assentada', pt: 'Calçamento, pátio', f: H.pedraAssentada },
    { id: 'pedraNatural', nome: 'Pedra natural', pt: 'Muro de pedra', f: H.pedraNatural },
    { id: 'brita', nome: 'Brita', pt: 'Pedra britada', f: H.brita },
    { id: 'concreto', nome: 'Concreto', pt: 'Pontos e lascas', f: H.concreto },
    { id: 'areia', nome: 'Areia', pt: 'Pontilhado', f: H.areia },
    { id: 'grama', nome: 'Grama', pt: 'Tufos', f: H.grama },
    { id: 'agua', nome: 'Água parada', pt: 'Anéis tracejados', f: H.agua },
    { id: 'ondas', nome: 'Água corrente', pt: 'Ondas', f: H.ondas },
  ];

  /* ======================= MÓVEIS (ambientes) ======================= */
  // 64 px = 1 quadrado (1,5 m). Origem no canto de cima à esquerda do móvel.
  const C = 64, R = (x, y, w, h, rx = 0, sw = 1.8, fill = '#fff') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${fill}" stroke="${K}" stroke-width="${sw}"/>`;
  const Mv = {};
  Mv.futon = () => R(0, 0, 40, 86, 6) + R(6, 5, 28, 13, 5, 1.2) + line([3, 30], [37, 30], 1) + `<path d="M6 34 Q20 40 34 34" fill="none" stroke="${K}" stroke-width=".8"/>`;
  Mv.tatame45 = () => { const t = 38.4; return R(0, 0, t * 3, t * 3, 0, 2) + R(0, 0, t * 2, t, 0, 1) + R(t * 2, 0, t, t * 2, 0, 1) + R(t, t * 2, t * 2, t, 0, 1) + R(0, t, t, t * 2, 0, 1) + R(t, t, t, t, 0, 1); };
  Mv.tatame6 = () => { const t = 38.4; let s = R(0, 0, t * 4, t * 3, 0, 2); [[0, 0, 2, 1], [2, 0, 2, 1], [0, 1, 1, 2], [1, 1, 2, 1], [3, 1, 1, 2], [1, 2, 2, 1]].forEach(([x, y, w, h]) => { s += R(x * t, y * t, w * t, h * t, 0, 1); }); return s; };
  Mv.chabudai = () => R(30, 26, 56, 40, 6, 2) + [[6, 35], [90, 35], [47, 2], [47, 70]].map(([x, y]) => R(x, y, 20, 20, 4, 1.2)).join('');
  Mv.kamado = () => R(0, 0, 96, 42, 5, 2.2) + [26, 70].map(x => `<circle cx="${x}" cy="21" r="13" fill="#fff" stroke="${K}" stroke-width="1.6"/><circle cx="${x}" cy="21" r="5" fill="${K}"/>`).join('') + hachura([[2, 34], [94, 34], [94, 40], [2, 40]], 'v', 3, .7);
  Mv.bancada = () => R(0, 0, 120, 36, 0, 2) + `<ellipse cx="34" cy="18" rx="16" ry="10" fill="#fff" stroke="${K}" stroke-width="1.5"/><circle cx="34" cy="18" r="2" fill="${K}"/>` + R(66, 8, 44, 20, 3, 1);
  Mv.ofuro = () => R(0, 0, 76, 76, 10, 2.2) + R(8, 8, 60, 60, 7, 1.2) + `<path d="M16 30 q10 -5 20 0 t20 0 M16 42 q10 -5 20 0 t20 0" fill="none" stroke="${K}" stroke-width=".8"/>` + R(84, 50, 22, 22, 6, 1.4);
  Mv.tansu = () => R(0, 0, 58, 30, 0, 2) + line([29, 2], [29, 28], 1.1) + line([2, 15], [56, 15], 1.1) + [14, 43].map(x => `<circle cx="${x}" cy="8" r="1.6" fill="${K}"/><circle cx="${x}" cy="22" r="1.6" fill="${K}"/>`).join('');
  Mv.tokonoma = () => R(0, 0, 96, 36, 0, 2, '#fff') + hachura([[2, 2], [94, 2], [94, 34], [2, 34]], 'd', 6, .5) + R(36, 4, 24, 8, 0, 1.2) + `<circle cx="78" cy="22" r="7" fill="#fff" stroke="${K}" stroke-width="1.2"/>`;
  Mv.byobu = () => `<polyline points="0,20 24,4 48,20 72,4 96,20 120,4" fill="none" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><polyline points="0,20 24,4 48,20 72,4 96,20 120,4" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>`;
  Mv.irori = () => R(0, 0, 70, 70, 0, 2.4) + R(8, 8, 54, 54, 0, 1) + `<circle cx="35" cy="35" r="10" fill="#fff" stroke="${K}" stroke-width="1.6"/>` + (() => { let d = ''; for (let i = 0; i < 40; i++) d += `M${f1(10 + (i * 37) % 50)} ${f1(10 + (i * 53) % 50)}h.1`; return `<path d="${d}" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`; })() + line([35, 25], [35, 0], 1.4);
  Mv.andon = () => R(0, 0, 26, 26, 3, 1.8) + R(5, 5, 16, 16, 2, .9) + line([0, 0], [26, 26], .7) + line([26, 0], [0, 26], .7);
  Mv.shoji = () => { let s = R(0, 0, 96, 10, 0, 1.6); for (let x = 12; x < 96; x += 12) s += line([x, 0], [x, 10], .7); return s + R(48, 10, 48, 8, 0, 1.4) + line([4, 22], [44, 22], 1, `marker-end="url(#seta)"`); };
  Mv.porta = () => R(0, 0, 8, 64, 0, 1.6) + `<path d="M8 0 A64 64 0 0 1 72 64" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="4 4"/>` + line([8, 64], [72, 64], 2.4);
  Mv.escada = () => { let s = R(0, 0, 48, 128, 0, 2); for (let y = 16; y < 128; y += 16) s += line([0, y], [48, y], 1); return s + line([24, 120], [24, 14], 1.2, `marker-end="url(#seta)"`); };
  Mv.mesa = () => R(20, 26, 120, 50, 4, 2) + [34, 70, 106].map(x => R(x, 4, 20, 16, 4, 1.2) + R(x, 82, 20, 16, 4, 1.2)).join('');
  Mv.estante = () => { let s = R(0, 0, 128, 30, 0, 2); for (let x = 6; x < 124; x += 7) s += R(x, 4, 5, 22, 0, .7); return s; };
  Mv.pergaminhos = () => { let s = R(0, 0, 96, 34, 0, 2); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) s += `<circle cx="${10 + i * 15}" cy="${10 + j * 14}" r="6" fill="#fff" stroke="${K}" stroke-width="1"/><circle cx="${10 + i * 15}" cy="${10 + j * 14}" r="2" fill="none" stroke="${K}" stroke-width=".7"/>`; return s; };
  Mv.armas = () => { let s = R(0, 0, 112, 22, 0, 2); for (let i = 0; i < 5; i++) { const x = 12 + i * 22; s += `<path d="M${x} 3 L${x + 4} 11 L${x} 19 L${x - 4} 11Z" fill="#fff" stroke="${K}" stroke-width="1"/>`; } return s + line([4, 30], [108, 30], 2.4) + line([4, 36], [108, 36], 1.2); };
  Mv.bau = () => R(0, 0, 54, 34, 3, 2) + line([0, 12], [54, 12], 1.2) + R(22, 9, 10, 7, 1, 1);
  Mv.barril = () => `<circle cx="20" cy="20" r="19" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="20" cy="20" r="13" fill="none" stroke="${K}" stroke-width="1.1"/><circle cx="20" cy="20" r="2" fill="${K}"/>`;
  Mv.caixote = () => R(0, 0, 40, 40, 2, 2) + line([4, 4], [36, 36], 1.2) + line([36, 4], [4, 36], 1.2);
  Mv.balcao = () => R(0, 0, 160, 34, 2, 2.2) + line([4, 8], [156, 8], .9) + R(120, 12, 26, 16, 2, 1.2) + [20, 50, 80].map(x => `<circle cx="${x}" cy="46" r="9" fill="#fff" stroke="${K}" stroke-width="1.4"/>`).join('');
  Mv.carteira = () => R(0, 0, 46, 24, 2, 1.8) + R(13, 30, 20, 18, 4, 1.2);
  Mv.cama = () => R(0, 0, 50, 98, 4, 2) + R(7, 6, 36, 16, 5, 1.3) + R(2, 34, 46, 62, 3, 1.2) + line([2, 40], [48, 40], .9);
  Mv.quadro = () => R(0, 0, 128, 12, 0, 2) + hachura([[2, 2], [126, 2], [126, 10], [2, 10]], 'd', 4, .7);
  Mv.mesaEscritorio = () => R(0, 0, 92, 46, 3, 2) + R(8, 8, 22, 28, 0, .9) + R(34, 10, 18, 14, 0, .9) + `<circle cx="74" cy="16" r="5" fill="#fff" stroke="${K}" stroke-width="1"/>` + R(34, 54, 24, 22, 5, 1.4);
  Mv.banquinho = () => `<circle cx="10" cy="10" r="9" fill="#fff" stroke="${K}" stroke-width="1.6"/>`;
  Mv.prateleira = () => { let s = R(0, 0, 128, 22, 0, 2); for (let x = 6; x < 124; x += 13) s += R(x, 4, 9, 14, 2, .8); return s; };
  const MOVEIS = [
    { id: 'futon', nome: 'Futon', pt: 'Quarto · 0,9 × 2 m', f: Mv.futon, w: 40, h: 86 },
    { id: 'tatame45', nome: 'Tatame 4,5 jō', pt: 'Piso de sala pequena', f: Mv.tatame45, w: 116, h: 116 },
    { id: 'tatame6', nome: 'Tatame 6 jō', pt: 'Piso de sala', f: Mv.tatame6, w: 154, h: 116 },
    { id: 'chabudai', nome: 'Chabudai', pt: 'Mesa baixa e almofadas', f: Mv.chabudai, w: 112, h: 92 },
    { id: 'kamado', nome: 'Kamado', pt: 'Fogão de lenha', f: Mv.kamado, w: 96, h: 42 },
    { id: 'bancada', nome: 'Bancada', pt: 'Pia e tábua', f: Mv.bancada, w: 120, h: 36 },
    { id: 'irori', nome: 'Irori', pt: 'Lareira no piso', f: Mv.irori, w: 70, h: 70 },
    { id: 'ofuro', nome: 'Ofurô', pt: 'Banheira e banquinho', f: Mv.ofuro, w: 108, h: 76 },
    { id: 'tansu', nome: 'Tansu', pt: 'Cômoda', f: Mv.tansu, w: 58, h: 30 },
    { id: 'tokonoma', nome: 'Tokonoma', pt: 'Nicho com vaso', f: Mv.tokonoma, w: 96, h: 36 },
    { id: 'byobu', nome: 'Byōbu', pt: 'Biombo dobrável', f: Mv.byobu, w: 120, h: 24 },
    { id: 'andon', nome: 'Andon', pt: 'Luminária de papel', f: Mv.andon, w: 26, h: 26 },
    { id: 'shoji', nome: 'Shōji', pt: 'Porta de correr', f: Mv.shoji, w: 96, h: 26 },
    { id: 'porta', nome: 'Porta de abrir', pt: 'Com arco de giro', f: Mv.porta, w: 74, h: 66 },
    { id: 'escada', nome: 'Escada', pt: 'Seta = sobe', f: Mv.escada, w: 48, h: 128 },
    { id: 'mesa', nome: 'Mesa com bancos', pt: 'Refeitório, taverna', f: Mv.mesa, w: 160, h: 100 },
    { id: 'estante', nome: 'Estante', pt: 'Livros', f: Mv.estante, w: 128, h: 30 },
    { id: 'pergaminhos', nome: 'Pergaminhos', pt: 'Prateleira de rolos', f: Mv.pergaminhos, w: 96, h: 34 },
    { id: 'armas', nome: 'Arsenal', pt: 'Kunais e bancada', f: Mv.armas, w: 112, h: 38 },
    { id: 'balcao', nome: 'Balcão', pt: 'Loja, lámen, recepção', f: Mv.balcao, w: 160, h: 56 },
    { id: 'prateleira', nome: 'Prateleira', pt: 'Mercadoria', f: Mv.prateleira, w: 128, h: 22 },
    { id: 'mesaEscritorio', nome: 'Escrivaninha', pt: 'Com cadeira', f: Mv.mesaEscritorio, w: 92, h: 76 },
    { id: 'carteira', nome: 'Carteira', pt: 'Sala de aula', f: Mv.carteira, w: 46, h: 48 },
    { id: 'quadro', nome: 'Quadro', pt: 'Na parede', f: Mv.quadro, w: 128, h: 12 },
    { id: 'cama', nome: 'Leito', pt: 'Hospital', f: Mv.cama, w: 50, h: 98 },
    { id: 'banquinho', nome: 'Banquinho', pt: 'Balcão, bar', f: Mv.banquinho, w: 20, h: 20 },
    { id: 'bau', nome: 'Baú', pt: 'Cobertura baixa', f: Mv.bau, w: 54, h: 34 },
    { id: 'barril', nome: 'Barril', pt: 'Cobertura', f: Mv.barril, w: 40, h: 40 },
    { id: 'caixote', nome: 'Caixote', pt: 'Cobertura', f: Mv.caixote, w: 40, h: 40 },
  ];

  /* ======================= OBJETOS EXTERNOS ======================= */
  const O = {};
  O.toro = () => R(0, 0, 34, 34, 2, 2) + `<circle cx="17" cy="17" r="9" fill="#fff" stroke="${K}" stroke-width="1.5"/>` + line([0, 0], [34, 34], .7) + line([34, 0], [0, 34], .7) + `<circle cx="17" cy="17" r="2.5" fill="${K}"/>`;
  O.poco = () => `<circle cx="36" cy="36" r="30" fill="#fff" stroke="${K}" stroke-width="2.4"/><circle cx="36" cy="36" r="20" fill="#fff" stroke="${K}" stroke-width="1.2"/>` + hachura(Array.from({ length: 24 }, (_, i) => [36 + Math.cos(i / 24 * Math.PI * 2) * 19, 36 + Math.sin(i / 24 * Math.PI * 2) * 19]), 'h', 4, .6) + `<circle cx="36" cy="36" r="20" fill="none" stroke="${K}" stroke-width="1.2"/>` + R(0, 32, 72, 8, 0, 1.8);
  O.torii = () => R(0, 14, 150, 12, 0, 2) + R(12, 30, 126, 7, 0, 1.4) + `<circle cx="38" cy="33" r="9" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="112" cy="33" r="9" fill="#fff" stroke="${K}" stroke-width="2"/>` + line([0, 14], [-6, 10], 2) + line([150, 14], [156, 10], 2);
  O.ponte = () => { let s = `<path d="M0 0 Q80 -10 160 0 L160 46 Q80 36 0 46Z" fill="#fff" stroke="${K}" stroke-width="2"/>`; for (let x = 12; x < 160; x += 12) s += line([x, -2 + Math.abs(80 - x) / 80 * -6 + 6], [x, 42 - Math.abs(80 - x) / 80 * 6 + 2], .8); return s + `<path d="M0 4 Q80 -6 160 4 M0 42 Q80 32 160 42" fill="none" stroke="${K}" stroke-width="3"/>`; };
  O.cerca = () => { let s = line([0, 10], [180, 10], 1.2) + line([0, 16], [180, 16], 1.2); for (let x = 6; x < 180; x += 8) s += `<circle cx="${x}" cy="13" r="3.4" fill="#fff" stroke="${K}" stroke-width="1"/>`; return s; };
  O.banco = () => R(0, 0, 110, 26, 3, 2) + line([4, 9], [106, 9], .7) + line([4, 17], [106, 17], .7);
  O.alvo = () => [24, 16, 8].map((rr, i) => `<circle cx="26" cy="26" r="${rr}" fill="${i === 2 ? K : '#fff'}" stroke="${K}" stroke-width="${i ? 1.4 : 2.2}"/>`).join('');
  O.poste = () => `<circle cx="18" cy="18" r="16" fill="#fff" stroke="${K}" stroke-width="2.2"/><circle cx="18" cy="18" r="10" fill="none" stroke="${K}" stroke-width="1"/><circle cx="18" cy="18" r="4" fill="none" stroke="${K}" stroke-width=".8"/>` + line([2, 18], [-8, 18], 2) + line([34, 18], [44, 18], 2);
  O.tora = () => R(0, 0, 120, 26, 13, 2) + `<ellipse cx="106" cy="13" rx="7" ry="10" fill="#fff" stroke="${K}" stroke-width="1.4"/><ellipse cx="106" cy="13" rx="3" ry="5" fill="none" stroke="${K}" stroke-width=".8"/>` + line([12, 8], [92, 8], .8) + line([18, 17], [80, 17], .8);
  O.pedraMemorial = () => `<path d="M0 60 L6 10 Q40 -6 74 10 L80 60Z" fill="#fff" stroke="${K}" stroke-width="2.2"/>` + [22, 30, 38, 46].map(y => line([18, y], [62, y], .9)).join('');
  O.carroca = () => R(10, 0, 90, 56, 2, 2) + hachura([[12, 2], [98, 2], [98, 54], [12, 54]], 'h', 8, .8) + R(0, 4, 10, 48, 1, 1.6) + R(100, 4, 10, 48, 1, 1.6) + line([10, 28], [-30, 28], 2) + line([10, 20], [-30, 24], 1.2) + line([10, 36], [-30, 32], 1.2);
  const OBJETOS = [
    { id: 'toro', nome: 'Tōrō', pt: 'Lanterna de pedra', f: O.toro, w: 34, h: 34 },
    { id: 'poco', nome: 'Poço', pt: 'Com travessa', f: O.poco, w: 72, h: 72 },
    { id: 'torii', nome: 'Torii', pt: 'Portal de santuário', f: O.torii, w: 150, h: 42 },
    { id: 'ponte', nome: 'Ponte arqueada', pt: 'Sobre rio ou lago', f: O.ponte, w: 160, h: 46 },
    { id: 'cerca', nome: 'Cerca de bambu', pt: 'Meia cobertura', f: O.cerca, w: 180, h: 26 },
    { id: 'banco', nome: 'Banco', pt: 'Praça, jardim', f: O.banco, w: 110, h: 26 },
    { id: 'carroca', nome: 'Carroça', pt: 'Rua de vila', f: O.carroca, w: 140, h: 56 },
    { id: 'alvo', nome: 'Alvo', pt: 'Campo de treino', f: O.alvo, w: 52, h: 52 },
    { id: 'poste', nome: 'Poste de treino', pt: 'Toras de madeira', f: O.poste, w: 52, h: 36 },
    { id: 'tora', nome: 'Tora caída', pt: 'Cobertura', f: O.tora, w: 120, h: 26 },
    { id: 'pedraMemorial', nome: 'Pedra memorial', pt: 'Nomes gravados', f: O.pedraMemorial, w: 80, h: 60 },
  ];

  /* ======================= ÁGUA E PORTO ======================= */
  const casco = (w, h, bico = .28) => `M${w / 2} 0 Q${w} ${f1(h * bico)} ${w} ${f1(h * .55)} Q${w} ${h} ${w / 2} ${h} Q0 ${h} 0 ${f1(h * .55)} Q0 ${f1(h * bico)} ${w / 2} 0Z`;
  const Ag = {};
  Ag.barco = () => `<path d="${casco(34, 96)}" fill="#fff" stroke="${K}" stroke-width="2"/><path d="${casco(26, 86)}" transform="translate(4 5)" fill="none" stroke="${K}" stroke-width=".9"/>` + [34, 56, 76].map(y => line([4, y], [30, y], 1.6)).join('') + line([-16, 50], [50, 46], 1.4) + R(-20, 47, 8, 6, 1, 1) + R(46, 43, 8, 6, 1, 1);
  Ag.sampan = () => { let s = `<path d="${casco(46, 132, .22)}" fill="#fff" stroke="${K}" stroke-width="2"/>`; s += R(6, 46, 34, 44, 6, 1.6); for (let y = 50; y < 90; y += 5) s += line([7, y], [39, y], .7); return s + line([23, 112], [23, 140], 2) + `<path d="M17 140 L29 140 L27 152 L19 152Z" fill="#fff" stroke="${K}" stroke-width="1.4"/>`; };
  Ag.junco = () => { let s = `<path d="${casco(86, 230, .25)}" fill="#fff" stroke="${K}" stroke-width="2.4"/><path d="${casco(70, 210, .25)}" transform="translate(8 10)" fill="none" stroke="${K}" stroke-width="1"/>`; for (let y = 50; y < 210; y += 9) s += line([12, y], [74, y], .5); [70, 125, 175].forEach((y, i) => { const w = i === 1 ? 120 : 92; s += `<circle cx="43" cy="${y}" r="5" fill="${K}"/>` + R(43 - w / 2, y - 6, w, 12, 3, 1.6); for (let x = 43 - w / 2 + 10; x < 43 + w / 2; x += 10) s += line([x, y - 6], [x, y + 6], .7); }); return s + R(26, 196, 34, 22, 2, 1.4); };
  Ag.jangada = () => { let s = ''; for (let i = 0; i < 7; i++) s += R(i * 11, (i % 2) * 3, 10, 92 - (i % 2) * 4, 5, 1.4); return s + line([-2, 20], [78, 20], 2) + line([-2, 72], [78, 72], 2); };
  Ag.pier = () => { let s = R(0, 0, 64, 220, 0, 2); for (let y = 10; y < 220; y += 10) s += line([0, y], [64, y], .8); for (let y = 14; y < 220; y += 48) s += `<circle cx="-4" cy="${y}" r="6" fill="#fff" stroke="${K}" stroke-width="1.6"/><circle cx="68" cy="${y}" r="6" fill="#fff" stroke="${K}" stroke-width="1.6"/>`; return s; };
  Ag.cais = () => { let s = R(0, 0, 260, 60, 0, 2.4); for (let x = 0, j = 0; x < 260; x += 32, j++) for (let y = 0; y < 60; y += 15) s += R(x + ((y / 15) % 2) * 16 - 16, y, 32, 15, 0, .8); s = `<g>${s}</g>`; return `<clipPath id="cais${++CLIP}"><rect width="260" height="60"/></clipPath><g clip-path="url(#cais${CLIP})">${s}</g>` + R(0, 0, 260, 60, 0, 2.4).replace('fill="#fff"', 'fill="none"') + [30, 130, 230].map(x => `<circle cx="${x}" cy="54" r="7" fill="#fff" stroke="${K}" stroke-width="2"/>`).join(''); };
  Ag.boia = () => `<circle cx="14" cy="14" r="12" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="none" stroke="${K}" stroke-width="1.2"/>` + line([2, 14], [26, 14], .9) + line([14, 2], [14, 26], .9);
  const AGUA = [
    { id: 'barco', nome: 'Barco a remo', pt: 'Dois lugares', f: Ag.barco, w: 34, h: 96 },
    { id: 'sampan', nome: 'Sampan', pt: 'Com cobertura', f: Ag.sampan, w: 46, h: 152 },
    { id: 'junco', nome: 'Navio junco', pt: 'Três mastros', f: Ag.junco, w: 86, h: 230 },
    { id: 'jangada', nome: 'Jangada', pt: 'Toras amarradas', f: Ag.jangada, w: 76, h: 92 },
    { id: 'pier', nome: 'Píer', pt: 'Tábuas sobre estacas', f: Ag.pier, w: 64, h: 220 },
    { id: 'cais', nome: 'Cais de pedra', pt: 'Com cabeços', f: Ag.cais, w: 260, h: 60 },
    { id: 'boia', nome: 'Boia', pt: 'Amarração', f: Ag.boia, w: 28, h: 28 },
  ];

  /* ======================= MASMORRA ======================= */
  const Ms = {};
  Ms.coluna = () => R(0, 0, 44, 44, 0, 2) + `<circle cx="22" cy="22" r="15" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="22" cy="22" r="9" fill="none" stroke="${K}" stroke-width=".9"/>`;
  Ms.quebrada = (r = rng(3)) => R(0, 0, 44, 44, 0, 2) + `<path d="M7 22 A15 15 0 0 1 37 22 L30 26 L24 20 L16 28 Z" fill="#fff" stroke="${K}" stroke-width="2"/>` + P.cascalho(r, 30, 34, 12);
  Ms.escombros = (r = rng(5)) => P.facetada(r, 26, 24, 18) + P.facetada(r, 50, 36, 13) + P.cascalho(r, 36, 30, 26);
  Ms.alcapao = () => R(0, 0, 60, 60, 0, 2.2) + hachura([[3, 3], [57, 3], [57, 57], [3, 57]], 'd', 6, .7) + R(24, 2, 12, 6, 0, 1.2) + line([30, 8], [30, 52], 1.4);
  Ms.grade = () => { let s = R(0, 0, 70, 14, 0, 2); for (let x = 7; x < 70; x += 7) s += line([x, 0], [x, 14], 1.4); return s; };
  Ms.tocha = () => R(6, 12, 8, 10, 1, 1.4) + `<path d="M10 0 Q16 6 13 10 Q10 13 7 10 Q4 6 10 0Z" fill="#fff" stroke="${K}" stroke-width="1.4"/>`;
  Ms.altar = () => R(0, 0, 96, 48, 2, 2.2) + R(8, 8, 80, 32, 1, 1) + [16, 80].map(x => `<circle cx="${x}" cy="16" r="5" fill="#fff" stroke="${K}" stroke-width="1.4"/><circle cx="${x}" cy="16" r="1.5" fill="${K}"/>`).join('') + R(38, 14, 20, 20, 2, 1.4);
  Ms.estatua = () => `<polygon points="17,0 39,0 56,17 56,39 39,56 17,56 0,39 0,17" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="28" cy="26" r="11" fill="#fff" stroke="${K}" stroke-width="1.6"/><path d="M18 40 Q28 32 38 40" fill="none" stroke="${K}" stroke-width="1.4"/>`;
  Ms.sarcofago = () => R(0, 0, 52, 104, 10, 2.2) + R(7, 7, 38, 90, 7, 1) + line([26, 18], [26, 62], 1.6) + line([14, 32], [38, 32], 1.6);
  const MASMORRA = [
    { id: 'coluna', nome: 'Coluna', pt: 'Cobertura total', f: Ms.coluna, w: 44, h: 44 },
    { id: 'quebrada', nome: 'Coluna quebrada', pt: 'Meia cobertura', f: Ms.quebrada, w: 44, h: 48 },
    { id: 'escombros', nome: 'Escombros', pt: 'Terreno difícil', f: Ms.escombros, w: 66, h: 52 },
    { id: 'alcapao', nome: 'Alçapão', pt: 'Armadilha', f: Ms.alcapao, w: 60, h: 60 },
    { id: 'grade', nome: 'Grade', pt: 'Porta de ferro', f: Ms.grade, w: 70, h: 14 },
    { id: 'tocha', nome: 'Tocha', pt: 'Na parede', f: Ms.tocha, w: 20, h: 22 },
    { id: 'altar', nome: 'Altar', pt: 'Velas e oferenda', f: Ms.altar, w: 96, h: 48 },
    { id: 'estatua', nome: 'Estátua', pt: 'Pedestal octogonal', f: Ms.estatua, w: 56, h: 56 },
    { id: 'sarcofago', nome: 'Sarcófago', pt: 'Tampa de pedra', f: Ms.sarcofago, w: 52, h: 104 },
  ];

  /* ======================= PLANTAS (ambientes prontos) ======================= */
  // Cômodos em quadrados do grid: [tipo, x, y, w, h]. Portas e janelas são automáticas:
  // todo cômodo ganha uma porta (ligado à entrada) e janela em cada parede externa.
  const PLANTAS = [
    { id: 'casaP1', grupo: 'residencial', nome: 'Casa pequena · Sumire', porte: 'Pequena', w: 8, h: 6, entrada: [0, 'n'], c: [['sala', 0, 0, 5, 3], ['cozinha', 5, 0, 3, 3], ['quarto', 0, 3, 5, 3], ['banho', 5, 3, 3, 3]] },
    { id: 'casaP2', grupo: 'residencial', nome: 'Casa pequena · Kaede', porte: 'Pequena', w: 9, h: 7, entrada: [0, 'w'], c: [['corredor', 0, 2, 2, 3], ['sala', 2, 0, 4, 4], ['cozinha', 6, 0, 3, 4], ['quarto', 2, 4, 4, 3], ['banho', 6, 4, 3, 3]] },
    { id: 'casaM1', grupo: 'residencial', nome: 'Casa média · Hinoki', porte: 'Média', w: 11, h: 8, entrada: [0, 'n'], c: [['sala', 0, 0, 6, 4], ['cozinha', 6, 0, 5, 4], ['corredor', 0, 4, 11, 1], ['quarto', 0, 5, 4, 3], ['quarto', 4, 5, 4, 3], ['banho', 8, 5, 3, 3]] },
    { id: 'casaM2', grupo: 'residencial', nome: 'Casa média · Pátio', porte: 'Média', w: 12, h: 9, entrada: [0, 'w'], c: [['sala', 0, 0, 5, 5], ['jardim', 5, 0, 3, 5], ['cozinha', 8, 0, 4, 4], ['banho', 8, 4, 4, 2], ['quarto', 0, 5, 4, 4], ['quarto', 4, 5, 4, 4], ['deposito', 8, 6, 4, 3]] },
    { id: 'casaG1', grupo: 'residencial', nome: 'Casa grande · Corredor', porte: 'Grande', w: 15, h: 10, entrada: [0, 'n'], c: [['corredor', 6, 0, 3, 2], ['sala', 0, 0, 6, 5], ['cozinha', 9, 0, 6, 4], ['corredor', 6, 2, 3, 8], ['quarto', 0, 5, 6, 5], ['quarto', 9, 4, 6, 3], ['banho', 9, 7, 3, 3], ['deposito', 12, 7, 3, 3]] },
    { id: 'casaG2', grupo: 'residencial', nome: 'Casa grande · Jardim', porte: 'Grande', w: 16, h: 12, entrada: [0, 'n'], c: [['sala', 0, 0, 6, 5], ['jardim', 6, 0, 4, 6], ['cozinha', 10, 0, 6, 4], ['banho', 10, 4, 3, 2], ['deposito', 13, 4, 3, 2], ['quarto', 0, 5, 6, 4], ['sala', 6, 6, 4, 3], ['quarto', 10, 6, 6, 3], ['corredor', 0, 9, 16, 1], ['quarto', 0, 10, 6, 2], ['quarto', 6, 10, 5, 2], ['banho', 11, 10, 5, 2]] },
    { id: 'mansao', grupo: 'residencial', nome: 'Mansão do clã', porte: 'Mansão', w: 20, h: 14, entrada: [1, 'n'], c: [['quarto', 0, 0, 5, 6], ['sala', 5, 0, 10, 6], ['cozinha', 15, 0, 5, 4], ['deposito', 15, 4, 5, 2], ['corredor', 0, 6, 20, 2], ['quarto', 0, 8, 5, 6], ['jardim', 5, 8, 6, 6], ['escritorio', 11, 8, 4, 6], ['banho', 15, 8, 5, 3], ['quarto', 15, 11, 5, 3]] },
    { id: 'biblioteca', grupo: 'comercial', nome: 'Biblioteca', porte: 'Média', w: 14, h: 10, entrada: [0, 'w'], c: [['recepcao', 0, 0, 4, 4], ['acervo', 4, 0, 10, 7], ['leitura', 0, 4, 4, 6], ['deposito', 4, 7, 5, 3], ['escritorio', 9, 7, 5, 3]] },
    { id: 'prefeitura', grupo: 'comercial', nome: 'Sede do Kage', porte: 'Grande', w: 14, h: 12, entrada: [1, 'n'], c: [['escritorio', 0, 0, 4, 4], ['recepcao', 4, 0, 6, 4], ['acervo', 10, 0, 4, 4], ['corredor', 0, 4, 14, 2], ['reuniao', 0, 6, 8, 6], ['escritorio', 8, 6, 6, 3], ['banho', 8, 9, 3, 3], ['deposito', 11, 9, 3, 3]] },
    { id: 'escola', grupo: 'comercial', nome: 'Academia Ninja', porte: 'Grande', w: 16, h: 12, entrada: [1, 'n'], c: [['escritorio', 0, 0, 6, 3], ['recepcao', 6, 0, 4, 3], ['banho', 10, 0, 3, 3], ['deposito', 13, 0, 3, 3], ['corredor', 0, 3, 16, 2], ['aula', 0, 5, 8, 7], ['aula', 8, 5, 8, 7]] },
    { id: 'lamen', grupo: 'comercial', nome: 'Restaurante de lámen', porte: 'Pequena', w: 10, h: 7, entrada: [0, 's'], c: [['salao', 0, 0, 6, 7], ['cozinha', 6, 0, 4, 4], ['deposito', 6, 4, 4, 3]] },
    { id: 'mercado', grupo: 'comercial', nome: 'Loja de armas', porte: 'Pequena', w: 10, h: 8, entrada: [0, 's'], c: [['loja', 0, 0, 7, 8], ['deposito', 7, 0, 3, 5], ['escritorio', 7, 5, 3, 3]] },
    { id: 'hospital', grupo: 'comercial', nome: 'Hospital', porte: 'Grande', w: 14, h: 10, entrada: [0, 'w'], c: [['recepcao', 0, 0, 5, 4], ['corredor', 5, 0, 2, 10], ['enfermaria', 7, 0, 7, 6], ['enfermaria', 0, 4, 5, 6], ['escritorio', 7, 6, 4, 4], ['banho', 11, 6, 3, 4]] },
  ];

  return { K, rng, hachura, TELHADOS, PEDRAS, ARVORES, TOPOS, HACHURAS, MOVEIS, OBJETOS, AGUA, MASMORRA, PLANTAS, C };
})();
