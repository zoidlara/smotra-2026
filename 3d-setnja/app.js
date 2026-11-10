// Smotra 2026 · 3D šetnja: prizemlje i 1. kat. Podaci: stands.js (nazivi, boje, vrsta) i layout.js (raspored).
(function () {
  const L = window.RASPORED, STANDS = window.STANDOVI || [];
  const S = L.pxPoMetru, H = L.visinaKata;
  const P0 = L.prizemlje, ST = L.stubiste;
  const FL0 = -4.2, GC = -0.35;                     // pod prizemlja, strop prizemlja
  const OX = 660, OY = 550;                         // središte skice 1. kata -> ishodište
  const wx = (px) => (px - OX) / S, wz = (py) => (py - OY) / S;
  const k0 = S / P0.pxPoMetru, AL = P0.poravnanje;  // tlocrt prizemlja -> pikseli skice 1. kata
  const g2x = (gx) => AL.x + (gx - AL.gx) * k0, g2y = (gy) => AL.y + (gy - AL.gy) * k0;
  const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0], SE: [Math.SQRT1_2, Math.SQRT1_2], SW: [-Math.SQRT1_2, Math.SQRT1_2], NE: [Math.SQRT1_2, -Math.SQRT1_2], NW: [-Math.SQRT1_2, -Math.SQRT1_2] };
  const EYE = 1.65, R = 0.28;

  // ---------- renderer / scena ----------
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe4ea');
  const cam = new THREE.PerspectiveCamera(70, 1, 0.1, 150);
  cam.rotation.order = 'YXZ';
  const topCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  topCam.position.set(0, 80, 0); topCam.up.set(0, 0, -1); topCam.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9c2b8, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.35); sun.position.set(-20, 30, 12); scene.add(sun);

  const grpF = new THREE.Group(), grpG = new THREE.Group(), grpS = new THREE.Group();
  scene.add(grpF, grpG, grpS);
  // trenutni kat dok se gradi: grupa, oznaka za koliziju ('f' 1. kat, 'g' prizemlje), visina poda
  let cur = { grp: grpF, tag: 'f', y: 0 };
  const add = (m) => { cur.grp.add(m); return m; };

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function loadTex(num, key, ok, fail) {
    const base = 'stands/' + String(num).padStart(2, '0') + '/' + key;
    const exts = ['.jpg', '.png'];
    (function next(i) {
      if (i >= exts.length) return fail && fail();
      loader.load(base + exts[i] + '?v=' + (window.VERZIJA || ''), (t) => { t.encoding = THREE.sRGBEncoding; t.anisotropy = maxAniso; ok(t); }, undefined, () => next(i + 1));
    })(0);
  }
  function textTex(lines, bg, fg, w, h, size) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + size + 'px system-ui, -apple-system, Segoe UI, sans-serif';
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function wrapName(name, max) {
    const words = name.toUpperCase().split(' '); const lines = []; let c = '';
    words.forEach((w) => { if ((c + ' ' + w).trim().length > max) { lines.push(c.trim()); c = w; } else c += ' ' + w; }); lines.push(c.trim());
    return lines;
  }
  function inkFor(hex) { const c = new THREE.Color(hex); return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) > 0.62 ? '#0d3c8c' : '#ffffff'; }
  const lam = (o) => { const m = new THREE.MeshLambertMaterial(o); if (o.color !== undefined) m.color.convertSRGBToLinear(); return m; };

  // ---------- kolizija ----------
  // svaki segment ima oznake katova na kojima vrijedi: f (1. kat), g (prizemlje), s (stubište)
  const segs = [];
  const addSeg = (ax, az, bx, bz, tags) => segs.push([ax, az, bx, bz, tags || cur.tag]);
  const addRect = (x0, z0, x1, z1, tags) => { addSeg(x0, z0, x1, z0, tags); addSeg(x1, z0, x1, z1, tags); addSeg(x1, z1, x0, z1, tags); addSeg(x0, z1, x0, z0, tags); };
  const segP = (a, b, c, d, tags) => addSeg(wx(a), wz(b), wx(c), wz(d), tags);  // u pikselima skice 1. kata

  // ---------- materijali i pomoćne funkcije ----------
  const floorTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#e9e4dc'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(120,110,95,.18)'; g.lineWidth = 2; g.strokeRect(0, 0, 256, 256);
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(110,100,90,' + (Math.random() * .12) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.6, 0.6); t.encoding = THREE.sRGBEncoding; return t; })();
  const wallMat = lam({ color: 0xf2f0ec });
  const glass = lam({ color: 0xbfe3f0, transparent: true, opacity: 0.28 });
  const rail = lam({ color: 0x8d949c });
  const stone = lam({ color: 0xd9d3c9 });
  function wallBox(ax, az, bx, bz, y0, y1, t, mat) {
    const len = Math.hypot(bx - ax, bz - az); const m = new THREE.Mesh(new THREE.BoxGeometry(len, y1 - y0, t), mat || wallMat);
    m.position.set((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); return add(m);
  }
  const wallP = (a, b, c, d, y0, y1, t, mat) => wallBox(wx(a), wz(b), wx(c), wz(d), y0, y1, t, mat);
  function railFlat(a, b, c, d, y) { wallP(a, b, c, d, y, y + 1.0, 0.03, glass); wallP(a, b, c, d, y + 1.0, y + 1.06, 0.07, rail); }
  function railSlope(a, b, ay, c, d, by) {
    const ax = wx(a), az = wz(b), bx = wx(c), bz = wz(d), hl = Math.hypot(bx - ax, bz - az), len = Math.hypot(hl, by - ay);
    const mk = (h, t, mat, off) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, t), mat); m.rotation.order = 'YZX';
      m.rotation.y = -Math.atan2(bz - az, bx - ax); m.rotation.z = Math.atan2(by - ay, hl); m.position.set((ax + bx) / 2, (ay + by) / 2 + off, (az + bz) / 2); add(m); };
    mk(1.0, 0.03, glass, 0.5); mk(0.06, 0.07, rail, 1.03);
  }
  function shapeOf(pts, holes) {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    (holes || []).forEach((h) => sh.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z)))));
    return sh;
  }
  function flat(pts, holes, y, mat) { const m = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(pts, holes)), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; return add(m); }
  function sign(text, w, h, x, y, z, ry, bg, fg) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: textTex([text], bg || '#f2f0ec', fg || '#5b6b80', Math.round(200 * w), Math.round(200 * h), Math.round(140 * h)) }));
    m.position.set(x, y, z); m.rotation.y = ry || 0; return add(m);
  }

  // ---------- 1. KAT ----------
  const poly = L.obod.map(([x, y]) => [wx(x), wz(y)]);
  const [ax0, ay0, ax1, ay1] = L.atrij;
  const [pjx0, pjy0, pjx1, pjy1] = ST.pojas, [v0, v1] = ST.vrh, [o0, o1] = ST.odmoriste, [kx0, ky0, kx1, ky1] = ST.krak;
  // otvor u podu 1. kata: atrij + stubište (bez dva mala podesta na vrhu bočnih krakova)
  const holePx = [[v0, pjy0], [v1, pjy0], [v1, pjy1], [ax1, pjy1], [ax1, ay1], [ax0, ay1], [ax0, pjy1], [v0, pjy1]];
  const hole = holePx.map(([x, y]) => [wx(x), wz(y)]);
  flat(poly, [hole], 0, lam({ map: floorTex }));
  const ceil = flat(poly, [hole], H, lam({ color: 0xf4f4f2, side: THREE.BackSide }));
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; wallBox(p[0], p[1], q[0], q[1], 0, H, 0.04); addSeg(p[0], p[1], q[0], q[1]); }
  // rub ploče oko otvora
  for (let i = 0; i < holePx.length; i++) { const p = holePx[i], q = holePx[(i + 1) % holePx.length]; wallP(p[0], p[1], q[0], q[1], -0.4, 0, 0.3, lam({ color: 0xe2ddd5 })); }
  // ograda oko atrija
  [[ax0, pjy1, ax0, ay1], [ax0, ay1, ax1, ay1], [ax1, ay1, ax1, pjy1]].forEach(([a, b, c, d]) => { railFlat(a, b, c, d, 0); segP(a, b, c, d, 'f'); });
  const amph = sign('AMFITEATAR', 6, 0.55, wx(574), 3.15, wz(436) + 0.14); amph.material.map = textTex(['AMFITEATAR'], '#f2f0ec', '#5b6b80', 1200, 110, 80);
  L.blokovi.forEach(([x0, y0, x1, y1]) => { const b = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) / S, H, (y1 - y0) / S), wallMat); b.position.set(wx((x0 + x1) / 2), H / 2, wz((y0 + y1) / 2)); add(b); addRect(wx(x0), wz(y0), wx(x1), wz(y1)); });
  L.stupovi.forEach(([x, y]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, H, 24), wallMat); c.position.set(wx(x), H / 2, wz(y)); add(c); addRect(wx(x) - .4, wz(y) - .4, wx(x) + .4, wz(y) + .4); });

  // ---------- STUBIŠTE ----------
  cur = { grp: grpS, tag: 's', y: 0 };
  function stepBox(xa, ya, xb, yb, top) { const b = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xb - xa) / S, top - FL0, Math.abs(yb - ya) / S), stone); b.position.set(wx((xa + xb) / 2), (top + FL0) / 2, wz((ya + yb) / 2)); add(b); }
  const NS = 12, half = -FL0 / 2, rise = half / NS;
  for (let i = 0; i < NS; i++) { const dy = (ky1 - ky0) / NS; stepBox(kx0, ky1 - (i + 1) * dy, kx1, ky1 - i * dy, FL0 + (i + 1) * rise); }
  stepBox(o0, pjy0, o1, pjy1, -half);
  for (let i = 0; i < NS; i++) {
    const dl = (o0 - v0) / NS, dr = (v1 - o1) / NS, top = -half + (i + 1) * rise;
    stepBox(o0 - (i + 1) * dl, pjy0, o0 - i * dl, pjy1, top);
    stepBox(o1 + i * dr, pjy0, o1 + (i + 1) * dr, pjy1, top);
  }
  wallP(pjx0, pjy0, pjx1, pjy0, FL0, 1.06, 0.2);                 // zid uz stražnje strane štandova 7–11
  railFlat(pjx0, pjy1, v0, pjy1, 0); railFlat(v1, pjy1, pjx1, pjy1, 0);
  railFlat(o0, pjy1, kx0, pjy1, -half); railFlat(kx1, pjy1, o1, pjy1, -half);
  railSlope(v0, pjy1, 0, o0, pjy1, -half); railSlope(o1, pjy1, -half, v1, pjy1, 0);
  railSlope(kx0, ky0, -half, kx0, ky1, FL0); railSlope(kx1, ky0, -half, kx1, ky1, FL0);
  segP(pjx0, pjy0, pjx1, pjy0, 'fs');
  segP(pjx0, pjy1, kx0, pjy1, 's'); segP(kx1, pjy1, pjx1, pjy1, 's');
  segP(kx0, ky0, kx0, ky1, 'gs'); segP(kx1, ky0, kx1, ky1, 'gs');
  // visina poda na stubištu (u pikselima skice 1. kata); null = nije na stubištu
  function elev(px, py) {
    if (px >= kx0 && px <= kx1 && py > pjy1 && py <= ky1) return -half - half * (py - ky0) / (ky1 - ky0);
    if (px >= pjx0 && px <= pjx1 && py >= pjy0 && py <= pjy1) {
      if (px < v0 || px > v1) return 0;
      if (px < o0) return -half * (px - v0) / (o0 - v0);
      if (px <= o1) return -half;
      return -half * (v1 - px) / (v1 - o1);
    }
    return null;
  }

  // ---------- PRIZEMLJE ----------
  cur = { grp: grpG, tag: 'g', y: FL0 };
  const gpx = P0.obod.map(([x, y]) => [g2x(x), g2y(y)]);
  const gpoly = gpx.map(([x, y]) => [wx(x), wz(y)]);
  flat(gpoly, [], FL0, lam({ map: floorTex }));
  const gCeil = flat(gpoly, [hole], GC, lam({ color: 0xf4f4f2, side: THREE.BackSide }));
  for (let i = 0; i < gpoly.length; i++) {
    if (i === P0.otvor) continue;
    const p = gpoly[i], q = gpoly[(i + 1) % gpoly.length]; wallBox(p[0], p[1], q[0], q[1], FL0, GC, 0.04); addSeg(p[0], p[1], q[0], q[1]);
  }
  P0.stupovi.forEach(([gx, gy]) => { const x = wx(g2x(gx)), z = wz(g2y(gy)); const c = new THREE.Mesh(new THREE.BoxGeometry(0.85, H - FL0, 0.85), wallMat); c.position.set(x, (H + FL0) / 2, z); add(c); addRect(x - .45, z - .45, x + .45, z + .45); });
  // natpis nad ulazom (vjetrobran)
  sign('ULAZ', 2.4, 0.5, wx(g2x(855)), FL0 + 2.7, wz(g2y(785)) - 0.05, Math.PI);
  sign('STUBIŠTE  ·  1. KAT →', 3.6, 0.42, wx(g2x(420)), FL0 + 2.6, wz(g2y(150)) + 0.04, 0, '#ffffff', '#295DB3');
  sign('← STUBIŠTE  ·  1. KAT', 3.6, 0.42, wx(g2x(1330)), FL0 + 2.6, wz(g2y(150)) + 0.04, 0, '#ffffff', '#295DB3');
  if (P0.stol) { const t = P0.stol, m = new THREE.Mesh(new THREE.BoxGeometry(t.sirina, 0.75, t.dubina), lam({ color: 0xffffff })); m.position.set(wx(g2x(t.x)), FL0 + 0.375, wz(g2y(t.y))); add(m);
    addRect(m.position.x - t.sirina / 2, m.position.z - t.dubina / 2, m.position.x + t.sirina / 2, m.position.z + t.dubina / 2); }
  if (P0.polukrug) { const pk = P0.polukrug, r = pk.r / P0.pxPoMetru; const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.06, r, 72, 1, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color('#1f5fd6').convertSRGBToLinear(), side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(wx(g2x(pk.x)), FL0 + 0.006, wz(g2y(pk.y))); add(m); }

  // ---------- štandovi ----------
  const metal = lam({ color: 0xb4b9bf });
  const white = lam({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
  const standList = [];
  function plane(w, h, mat) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); }
  // zajednički početak svakog štanda: grupa na mjestu, rotacija, kolizija u lokalnim koordinatama
  function start(info, pos) {
    const g = new THREE.Group();
    const [dx, dz] = DIRS[pos.smjer] || DIRS.N;
    const rot = Math.atan2(dx, dz);
    const cx = wx(pos.x), cz = wz(pos.y);
    g.position.set(cx, cur.y, cz); g.rotation.y = rot;
    const col = info.boja || '#9aa3ad';
    const put = (mesh, x, y, z, ry) => { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; };
    const c = Math.cos(rot), s = Math.sin(rot);
    const T = (x, z) => [cx + x * c + z * s, cz - x * s + z * c];
    const seg = (a, b) => { const p = T(a[0], a[1]), q = T(b[0], b[1]); addSeg(p[0], p[1], q[0], q[1]); };
    const box = (x0, z0, x1, z1) => { seg([x0, z0], [x1, z0]); seg([x1, z0], [x1, z1]); seg([x1, z1], [x0, z1]); seg([x0, z1], [x0, z0]); };
    const roofAndBadge = (rx, rz, rw, rd, by, bz) => {
      const roof = put(plane(rw, rd, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).convertSRGBToLinear(), transparent: true, opacity: 0.85 })), rx, 2.9, rz); roof.rotation.x = -Math.PI / 2; roof.visible = false;
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex([String(info.broj)], col, inkFor(col), 128, 128, 84), depthTest: true }));
      badge.position.set(0, by, bz); badge.scale.set(0.38, 0.38, 1); badge.userData.y = by; g.add(badge);
      return { roof, badge };
    };
    return { g, dx, dz, rot, cx, cz, col, put, seg, box, T, roofAndBadge };
  }
  function finish(st, info, extra) {
    add(st.g);
    standList.push(Object.assign({ info, cx: st.cx, cz: st.cz, dx: st.dx, dz: st.dz, group: st.g, ox: st.cx, oz: st.cz, level: cur.tag, baseY: cur.y, far: 3.4 }, extra));
  }

  // klasični štand 3 × 2 m (ploče 01–08, pult 09/10, natpis 11/12)
  function buildStand(info, pos) {
    const st = start(info, pos), { put, col } = st;
    const colMat = () => lam({ color: col });
    const PH = 2.355, PY = 0.02 + PH / 2;
    function panel(key, w, x, z, ry) {
      const m = put(plane(w, PH, colMat()), x, PY, z, ry);
      loadTex(info.broj, key, (t) => { m.material = lam({ map: t }); });
    }
    put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 2.0), white), -1.5, 1.2, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 2.0), white), 1.5, 1.2, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 0.03), white), 0, 1.2, -1);
    // ploče, po skici: lijevo 7-8-1 (od ulaza prema natrag), straga 2-3-4, desno 5-6
    const LI = -1.5 + 0.035, RI = 1.5 - 0.035, BI = -1 + 0.035;
    panel('07', 0.455, LI, 0.7525, Math.PI / 2);
    panel('08', 0.455, LI, 0.2875, Math.PI / 2);
    panel('01', 0.95, LI, -0.425, Math.PI / 2);
    panel('02', 0.95, -0.97, BI, 0);
    panel('03', 0.95, 0, BI, 0);
    panel('04', 0.95, 0.97, BI, 0);
    panel('05', 0.95, RI, -0.495, -Math.PI / 2);
    panel('06', 0.95, RI, 0.495, -Math.PI / 2);
    [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1], [-1.5, 0.52], [-1.5, 0.055], [-0.495, -1], [0.485, -1], [1.5, 0]].forEach(([x, z]) => put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.76, 0.035), metal), x, 1.38, z));
    put(new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.035, 0.035), metal), 0, 2.41, -1);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 2.0), metal), -1.5, 2.41, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 2.0), metal), 1.5, 2.41, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.37, 0.03), white), 0, 2.585, 1);
    const ink = inkFor(col), lines = wrapName(info.naziv, 26);
    const f11 = put(plane(1.952, 0.335, lam({ map: textTex(lines.slice(0, 3), col, ink, 1952, 335, lines.length > 2 ? 70 : 92) })), -0.5, 2.585, 1.03);
    const f12 = put(plane(0.962, 0.335, lam({ map: textTex([String(info.broj)], col, ink, 962, 335, 160) })), 1.0, 2.585, 1.03);
    loadTex(info.broj, '11', (t) => { f11.material = lam({ map: t }); });
    loadTex(info.broj, '12', (t) => { f12.material = lam({ map: t }); });
    if (!info.bezPulta) {
      const pm = [colMat(), colMat(), white, white, colMat(), colMat()];
      const pult = put(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.855, 0.455), pm), -1.0, 0.4275, 0.75);
      put(new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.025, 0.475), white), -1.0, 0.8675, 0.75);
      loadTex(info.broj, '09', (t) => { pm[4] = lam({ map: t }); pult.material = pm.slice(); });
      loadTex(info.broj, '10', (t) => { pm[0] = lam({ map: t }); pult.material = pm.slice(); });
    }
    const carpet = put(plane(3.0, 2.0, lam({ color: 0x8e959d })), 0, 0.004, 0); carpet.rotation.x = -Math.PI / 2;
    const rb = st.roofAndBadge(0, 0, 3.0, 2.0, 3.05, 0.9);
    st.seg([-1.5, 1], [-1.5, -1]); st.seg([-1.5, -1], [1.5, -1]); st.seg([1.5, -1], [1.5, 1]);
    if (!info.bezPulta) st.box(-1.5, 0.52, -0.525, 0.98);
    finish(st, info, Object.assign(rb, { rect: [-1.5, -1, 3, 2] }));
  }

  // partnerski štand 2 × 2 m: 01 lijevo, 02–03 straga, 04 desno, 11 natpis, 09 pult
  function build2x2(info, pos) {
    const st = start(info, pos), { put, col } = st;
    const PH = 2.355, PY = 0.02 + PH / 2;
    const panel = (key, w, x, z, ry) => { const m = put(plane(w, PH, lam({ color: col })), x, PY, z, ry); loadTex(info.broj, key, (t) => { m.material = lam({ map: t }); }); };
    put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 2.0), white), -1, 1.2, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 2.0), white), 1, 1.2, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 0.03), white), 0, 1.2, -1);
    panel('01', 1.9, -1 + 0.035, 0, Math.PI / 2);
    panel('02', 0.95, -0.485, -1 + 0.035, 0); panel('03', 0.95, 0.485, -1 + 0.035, 0);
    panel('04', 1.9, 1 - 0.035, 0, -Math.PI / 2);
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1]].forEach(([x, z]) => put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.76, 0.035), metal), x, 1.38, z));
    put(new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.37, 0.03), white), 0, 2.585, 1);
    const lines = wrapName(info.naziv, 22);
    const f11 = put(plane(1.96, 0.335, lam({ map: textTex(lines.slice(0, 2), col, inkFor(col), 1960, 335, 92) })), 0, 2.585, 1.03);
    loadTex(info.broj, '11', (t) => { f11.material = lam({ map: t }); });
    const pm = [lam({ color: col }), lam({ color: col }), white, white, lam({ color: col }), lam({ color: col })];
    const pult = put(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.855, 0.455), pm), -0.5, 0.4275, 0.75);
    loadTex(info.broj, '09', (t) => { pm[4] = lam({ map: t }); pult.material = pm.slice(); });
    const carpet = put(plane(2.0, 2.0, lam({ color: 0x8e959d })), 0, 0.004, 0); carpet.rotation.x = -Math.PI / 2;
    const rb = st.roofAndBadge(0, 0, 2.0, 2.0, 3.05, 0.9);
    st.seg([-1, 1], [-1, -1]); st.seg([-1, -1], [1, -1]); st.seg([1, -1], [1, 1]); st.box(-0.975, 0.52, -0.025, 0.98);
    finish(st, info, Object.assign(rb, { rect: [-1, -1, 2, 2], far: 3 }));
  }

  // samostalni pult s frizom: 09 prednja, 10 lijeva bočna, 10d desna bočna, 12 friz
  function buildPult(info, pos) {
    const st = start(info, pos), { put, col } = st;
    const ink = inkFor(col);
    const pm = [lam({ color: col }), lam({ color: col }), white, white, lam({ map: textTex(wrapName(info.naziv, 16).slice(0, 3), col, ink, 950, 855, 92) }), white];
    const pult = put(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.855, 0.455), pm), 0, 0.4275, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.025, 0.475), white), 0, 0.8675, 0);
    const upd = () => { pult.material = pm.slice(); };
    loadTex(info.broj, '09', (t) => { pm[4] = lam({ map: t }); upd(); });
    loadTex(info.broj, '10', (t) => { pm[1] = lam({ map: t }); upd(); loadTex(info.broj, '10d', () => {}, () => { pm[0] = lam({ map: t }); upd(); }); });
    loadTex(info.broj, '10d', (t) => { pm[0] = lam({ map: t }); upd(); });
    [-0.44, 0.44].forEach((x) => put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.0, 0.03), metal), x, 1.0 + 0.855 / 2, -0.2));
    put(new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.36, 0.03), white), 0, 2.2, -0.2);
    const fr = put(plane(0.962, 0.335, lam({ map: textTex(wrapName(info.naziv, 18).slice(0, 2), col, ink, 962, 335, 70) })), 0, 2.2, -0.18);
    loadTex(info.broj, '12', (t) => { fr.material = lam({ map: t }); });
    const rb = st.roofAndBadge(0, 0, 0.95, 0.455, 2.65, -0.2);
    st.box(-0.475, -0.23, 0.475, 0.23);
    finish(st, info, Object.assign(rb, { rect: [-0.475, -0.23, 0.95, 0.46], far: 2.4 }));
  }

  // kutak za slikavanje: pozadina 3 m (01) i kauč ispred
  function buildFoto(info, pos) {
    const st = start(info, pos), { put, col } = st;
    put(new THREE.Mesh(new THREE.BoxGeometry(3.04, 2.4, 0.04), white), 0, 1.2, -0.47);
    const bg = put(plane(2.95, 2.355, lam({ map: textTex(wrapName(info.naziv, 14), col, inkFor(col), 1180, 942, 110) })), 0, 1.2, -0.445);
    loadTex(info.broj, '01', (t) => { bg.material = lam({ map: t }); });
    const sofa = lam({ color: 0x3f6fb6 });
    put(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 0.85), sofa), 0, 0.21, 0.02);
    put(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.18), sofa), 0, 0.64, -0.32);
    [-0.95, 0.95].forEach((x) => put(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.85), sofa), x, 0.31, 0.02));
    const rb = st.roofAndBadge(0, 0, 3.0, 0.95, 2.75, -0.4);
    st.seg([-1.5, -0.47], [1.5, -0.47]); st.box(-1.05, -0.4, 1.05, 0.46);
    finish(st, info, Object.assign(rb, { rect: [-1.5, -0.47, 3, 0.95], far: 3 }));
  }

  // veliki štandovi od 8 ploča po 950 mm: "U8" (U oblik) i "zid8" (ravni zid)
  function buildLong(info, pos) {
    const st = start(info, pos), { put, col } = st;
    const PW = 0.95, GAP = 0.02, PH = 2.355, PY = 0.02 + PH / 2, z0 = -1;
    const U = info.tip === 'U8', nB = U ? 4 : 8, nS = U ? 2 : 0;
    const W = nB * PW + (nB + 1) * GAP, D = U ? nS * PW + (nS + 1) * GAP : 0;
    const panel = (n, x, z, ry) => { const m = put(plane(PW, PH, lam({ color: col })), x, PY, z, ry); loadTex(info.broj, String(n).padStart(2, '0'), (t) => { m.material = lam({ map: t }); }); };
    const post = (x, z) => put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.45, 0.035), metal), x, 1.225, z);
    put(new THREE.Mesh(new THREE.BoxGeometry(W, 2.4, 0.03), white), 0, 1.2, z0 - 0.02);
    for (let k = 0; k < nB; k++) panel(nS + k + 1, -W / 2 + GAP + PW / 2 + k * (PW + GAP), z0 + 0.04, 0);
    for (let k = 0; k <= nB; k++) post(-W / 2 + GAP / 2 + k * (PW + GAP), z0 + 0.04);
    if (U) {
      put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, D), white), -W / 2 - 0.02, 1.2, z0 + D / 2);
      put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, D), white), W / 2 + 0.02, 1.2, z0 + D / 2);
      for (let j = 0; j < nS; j++) {
        panel(j + 1, -W / 2 + 0.012, z0 + D - GAP - PW / 2 - j * (PW + GAP), Math.PI / 2);
        panel(nS + nB + j + 1, W / 2 - 0.012, z0 + GAP + PW / 2 + j * (PW + GAP), -Math.PI / 2);
      }
      for (let j = 1; j <= nS; j++) { post(-W / 2, z0 + GAP / 2 + j * (PW + GAP)); post(W / 2, z0 + GAP / 2 + j * (PW + GAP)); }
    }
    const cd = U ? D : 1.2;
    const carpet = put(plane(W, cd, lam({ color: 0x8e959d })), 0, 0.004, z0 + cd / 2); carpet.rotation.x = -Math.PI / 2;
    if (info.napomena) {
      put(plane(3.2, 0.32, new THREE.MeshBasicMaterial({ map: textTex(['⚠ ' + info.napomena], '#fff4c2', '#7a5200', 2000, 200, 92) })), 0, 2.62, z0 + 0.06);
      put(plane(3.2, 0.32, new THREE.MeshBasicMaterial({ map: textTex(['⚠ ' + info.napomena], '#fff4c2', '#7a5200', 2000, 200, 92) })), 0, 2.62, z0 - 0.06, Math.PI);
    }
    const rb = st.roofAndBadge(0, z0 + Math.max(cd, 0.4) / 2, W, Math.max(cd, 0.4), 3.05, z0 + 0.3);
    st.seg([-W / 2, z0], [W / 2, z0]);
    if (U) { st.seg([-W / 2, z0 + D], [-W / 2, z0]); st.seg([W / 2, z0], [W / 2, z0 + D]); }
    const fc = st.T(0, z0 + Math.max(D, 1.2) / 2);
    finish(st, info, Object.assign(rb, { cx: fc[0], cz: fc[1], rect: [-W / 2, z0, W, Math.max(D, 0.25)], far: info.pogled || (U ? 4.2 : 2.3) }));
  }
  const BUILD = { U8: buildLong, zid8: buildLong, pult: buildPult, '2x2': build2x2, foto: buildFoto };
  function buildAny(info, pos) { (BUILD[info.tip] || buildStand)(info, pos); }
  cur = { grp: grpF, tag: 'f', y: 0 };
  STANDS.forEach((info) => { const pos = L.standovi[info.broj]; if (pos) buildAny(info, pos); });
  cur = { grp: grpG, tag: 'g', y: FL0 };
  STANDS.forEach((info) => { const p = P0.standovi[info.broj]; if (p && !L.standovi[info.broj]) buildAny(info, { x: g2x(p.x), y: g2y(p.y), smjer: p.smjer }); });

  // ---------- kretanje ----------
  const player = { x: 0, z: 0, y: 0, mode: 'f', yaw: 0, pitch: -0.05 };
  function place(px, py, kat, gleda) {
    player.x = wx(px); player.z = wz(py); player.mode = kat === 0 ? 'g' : 'f'; player.y = kat === 0 ? FL0 : 0;
    const d = DIRS[gleda] || DIRS.N; player.yaw = Math.atan2(-d[0], -d[1]); player.pitch = -0.05;
  }
  if (L.start.kat === 0) place(g2x(L.start.x), g2y(L.start.y), 0, L.start.gleda); else place(L.start.x, L.start.y, 1, L.start.gleda);
  function collide() {
    const m = player.mode;
    for (let k = 0; k < 3; k++) for (const [ax, az, bx, bz, tags] of segs) {
      if (tags.indexOf(m) < 0) continue;
      const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1;
      let t = ((player.x - ax) * vx + (player.z - az) * vz) / l2; t = Math.max(0, Math.min(1, t));
      const px = ax + vx * t, pz = az + vz * t, ddx = player.x - px, ddz = player.z - pz, d = Math.hypot(ddx, ddz);
      if (d < R && d > 1e-6) { player.x = px + ddx / d * R; player.z = pz + ddz / d * R; }
    }
  }
  function updateLevel() {
    const e = elev(player.x * S + OX, player.z * S + OY);
    if (e !== null) { player.mode = 's'; player.y = e; }
    else { player.mode = player.y > -half ? 'f' : 'g'; player.y = player.mode === 'f' ? 0 : FL0; }
  }
  const floorOf = () => (player.mode === 'g' || (player.mode === 's' && player.y < -half) ? 'g' : 'f');

  const keys = {};
  addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'KeyM') toggleView(); });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  const stick = { x: 0, y: 0 };
  const look = (dx, dy, k) => { player.yaw -= dx * k; player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - dy * k)); };

  let started = false, topView = false, topFloor = 'f';
  const help = document.getElementById('help'), cross = document.getElementById('cross');
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) document.body.classList.add('touch');
  document.querySelectorAll(isTouch ? '.desk' : '.mob').forEach((e) => e.style.display = 'none');
  function lockPointer() { if (isTouch || topView) return; try { const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
  document.getElementById('go').onclick = () => { help.style.display = 'none'; started = true; lockPointer(); };
  document.addEventListener('pointerlockchange', () => { cross.style.display = document.pointerLockElement === canvas ? 'block' : 'none'; });

  let drag = null;
  canvas.addEventListener('mousemove', (e) => { if (document.pointerLockElement === canvas) look(e.movementX, e.movementY, 0.0024); });
  const stickEl = document.getElementById('stick'), knob = stickEl.firstElementChild;
  let stickId = null;
  function stickMove(e) {
    const r = stickEl.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 35}px, ${y * 35}px)`;
  }
  stickEl.addEventListener('pointerdown', (e) => { stickId = e.pointerId; stickEl.setPointerCapture(e.pointerId); stickMove(e); if (!started) { help.style.display = 'none'; started = true; } });
  stickEl.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickMove(e); });
  const stickEnd = (e) => { if (e.pointerId === stickId) { stickId = null; stick.x = stick.y = 0; knob.style.transform = ''; } };
  stickEl.addEventListener('pointerup', stickEnd); stickEl.addEventListener('pointercancel', stickEnd);

  canvas.addEventListener('pointerdown', (e) => {
    if (topView) { pickStand(e); return; }
    if (!started) return;
    if (e.pointerType === 'mouse' && !isTouch) { if (document.pointerLockElement !== canvas) { lockPointer(); drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; } return; }
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || document.pointerLockElement === canvas) return;
    look(e.clientX - drag.x, e.clientY - drag.y, e.pointerType === 'mouse' ? 0.004 : 0.006); drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  addEventListener('mouseup', () => { drag = null; });

  // ---------- skok do štanda ----------
  const jump = document.getElementById('jump');
  [['g', 'Prizemlje'], ['f', '1. kat']].forEach(([lv, label]) => {
    const og = document.createElement('optgroup'); og.label = label;
    standList.filter((s) => s.level === lv).sort((a, b) => a.info.broj - b.info.broj).forEach((s) => { const o = document.createElement('option'); o.value = s.info.broj; o.textContent = s.info.broj + ' · ' + s.info.naziv; og.appendChild(o); });
    jump.appendChild(og);
  });
  function arrive() { collide(); if (topView) toggleView(); help.style.display = 'none'; started = true; }
  function goTo(s) {
    player.x = s.cx + s.dx * s.far; player.z = s.cz + s.dz * s.far; player.yaw = Math.atan2(s.dx, s.dz); player.pitch = 0.08;
    player.mode = s.level; player.y = s.baseY; arrive();
  }
  jump.onchange = () => { const s = standList.find((t) => String(t.info.broj) === jump.value); if (s) goTo(s); jump.value = ''; jump.blur(); };

  // ---------- katovi i pogled odozgo ----------
  const btnView = document.getElementById('btnView'), btnFloor = document.getElementById('btnFloor');
  function shownFloor() { return topView ? topFloor : floorOf(); }
  function refreshFloorBtn() { if (btnFloor) btnFloor.textContent = shownFloor() === 'g' ? 'Idi na 1. kat' : 'Idi u prizemlje'; }
  function applyVisibility() {
    const hideF = topView && topFloor === 'g';
    grpF.visible = !hideF; ceil.visible = !topView; gCeil.visible = !topView;
    standList.forEach((s) => { const k = topView ? (topFloor === 'g' ? 1.0 : 1.6) : 0.38; s.badge.scale.set(k, k, 1); s.badge.position.y = topView ? 4 : s.badge.userData.y; s.roof.visible = topView && s.level === topFloor; s.badge.visible = !topView || s.level === topFloor; });
    refreshFloorBtn(); fitTop();
  }
  function toggleView() {
    topView = !topView; btnView.textContent = topView ? 'Hodaj' : 'Pogled odozgo';
    if (topView) { topFloor = floorOf(); if (document.pointerLockElement) document.exitPointerLock(); help.style.display = 'none'; started = true; }
    applyVisibility();
  }
  btnView.onclick = toggleView;
  if (btnFloor) btnFloor.onclick = () => {
    if (topView) { topFloor = topFloor === 'g' ? 'f' : 'g'; applyVisibility(); return; }
    if (floorOf() === 'g') place(575, 515, 1, 'N'); else place(g2x(857), g2y(735), 0, 'N');
    arrive(); refreshFloorBtn();
  };
  const ray = new THREE.Raycaster();
  function pickStand(e) {
    const v = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(v, topCam); const p = ray.ray.origin;
    let best = null, bd = 2.6; standList.forEach((s) => { if (s.level !== topFloor) return; const d = Math.hypot(s.cx - p.x, s.cz - p.z); if (d < bd) { bd = d; best = s; } });
    if (best) goTo(best);
  }

  // ---------- mini tlocrt ----------
  const map = document.getElementById('map'), mg = map.getContext('2d');
  const BOUNDS = { f: [140, 200, 1180, 910], g: (() => { const xs = gpx.map((p) => p[0]), ys = gpx.map((p) => p[1]); return [Math.min(...xs) - 12, Math.min(...ys) - 70, Math.max(...xs) + 12, Math.max(...ys) + 12]; })() };
  let bx0, by0, bx1, by1;
  function setBounds() { [bx0, by0, bx1, by1] = BOUNDS[shownFloor()]; }
  function mapXf() { setBounds(); const w = map.clientWidth, h = map.clientHeight, k = Math.min(w / (bx1 - bx0), h / (by1 - by0)); return { k, ox: (w - (bx1 - bx0) * k) / 2, oy: (h - (by1 - by0) * k) / 2, w, h }; }
  function drawMap() {
    const dpr = Math.min(devicePixelRatio || 1, 2), f = mapXf(), fl = shownFloor();
    if (map.width !== f.w * dpr) { map.width = f.w * dpr; map.height = f.h * dpr; }
    mg.setTransform(dpr, 0, 0, dpr, 0, 0); mg.clearRect(0, 0, f.w, f.h);
    const P = (x, y) => [f.ox + (x - bx0) * f.k, f.oy + (y - by0) * f.k];
    const path = (pts) => { mg.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? mg.lineTo(a, b) : mg.moveTo(a, b); }); mg.closePath(); };
    path(fl === 'g' ? gpx : L.obod); mg.fillStyle = 'rgba(233,228,220,.95)'; mg.fill(); mg.strokeStyle = '#7a8594'; mg.lineWidth = 1; mg.stroke();
    if (fl === 'f') { path(holePx); mg.fillStyle = 'rgba(150,160,175,.45)'; mg.fill(); }
    mg.fillStyle = 'rgba(160,150,135,.6)';
    path([[kx0, ky0], [kx1, ky0], [kx1, ky1], [kx0, ky1]]); mg.fill(); path([[v0, pjy0], [v1, pjy0], [v1, pjy1], [v0, pjy1]]); mg.fill();
    standList.forEach((s) => {
      if (s.level !== fl) return;
      const [oa, ob] = P(s.ox * S + OX, s.oz * S + OY), [a, b] = P(s.cx * S + OX, s.cz * S + OY), r = s.rect;
      mg.save(); mg.translate(oa, ob); mg.rotate(-Math.atan2(s.dx, s.dz)); mg.fillStyle = s.info.boja; mg.fillRect(r[0] * S * f.k, r[1] * S * f.k, r[2] * S * f.k, Math.max(r[3] * S * f.k, 2)); mg.restore();
      if (f.w > 180) { mg.fillStyle = '#13233a'; mg.font = '700 9px system-ui'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText(s.info.broj, a, b); }
    });
    mg.fillStyle = '#13233a'; mg.font = '700 10px system-ui'; mg.textAlign = 'left'; mg.textBaseline = 'top'; mg.fillText(fl === 'g' ? 'PRIZEMLJE' : '1. KAT', 6, 5);
    if (!topView) {
      const [a, b] = P(player.x * S + OX, player.z * S + OY);
      mg.save(); mg.translate(a, b); mg.rotate(-player.yaw); mg.beginPath(); mg.moveTo(0, -8); mg.lineTo(5, 5); mg.lineTo(-5, 5); mg.closePath();
      mg.fillStyle = '#e0242b'; mg.fill(); mg.restore();
    }
  }
  function inside(x, z, pl) { let c = false; for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) { const [xi, zi] = pl[i], [xj, zj] = pl[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
  map.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); const f = mapXf(), r = map.getBoundingClientRect(), fl = shownFloor();
    const px = (e.clientX - r.left - f.ox) / f.k + bx0, py = (e.clientY - r.top - f.oy) / f.k + by0;
    const x = wx(px), z = wz(py);
    if (elev(px, py) !== null) return;
    if (fl === 'g') { if (!inside(x, z, gpoly)) return; player.mode = 'g'; player.y = FL0; }
    else { if (!inside(x, z, poly) || inside(x, z, hole)) return; player.mode = 'f'; player.y = 0; }
    player.x = x; player.z = z; arrive(); refreshFloorBtn();
  });

  // ---------- info o štandu ----------
  const infoEl = document.getElementById('info'); let lastInfo = null;
  function updateInfo() {
    let best = null, bs = 1e9;
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
    standList.forEach((s) => { if (Math.abs(s.baseY - player.y) > 1.5) return; const vx = s.cx - player.x, vz = s.cz - player.z, d = Math.hypot(vx, vz); if (d > 5.5) return; const dot = (vx * fx + vz * fz) / (d || 1); const sc = d - dot * 2; if ((dot > 0.3 || d < 1.8) && sc < bs) { bs = sc; best = s; } });
    if (topView) best = null;
    if (best === lastInfo) return; lastInfo = best;
    if (!best) { infoEl.style.display = 'none'; return; }
    infoEl.style.display = 'block';
    infoEl.innerHTML = `<span class="num" style="background:${best.info.boja};color:${inkFor(best.info.boja)}">${best.info.broj}</span><b></b>`;
    infoEl.querySelector('b').textContent = best.info.naziv;
    if (best.info.napomena) { const i = document.createElement('div'); i.style.cssText = 'font-size:12px;color:#a06a00;margin-top:2px'; i.textContent = '⚠ ' + best.info.napomena; infoEl.appendChild(i); }
  }

  // ---------- petlja ----------
  function fitTop() {
    setBounds(); const w = innerWidth, h = innerHeight;
    const pw = (bx1 - bx0) / S + 2, ph = (by1 - by0) / S + 2, a = w / h; let hw = pw / 2, hh = ph / 2; if (hw / hh > a) hh = hw / a; else hw = hh * a;
    topCam.left = -hw; topCam.right = hw; topCam.top = hh; topCam.bottom = -hh; topCam.updateProjectionMatrix();
    topCam.position.set(wx((bx0 + bx1) / 2), 80, wz((by0 + by1) / 2)); topCam.lookAt(topCam.position.x, 0, topCam.position.z);
  }
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 85 : 70; cam.updateProjectionMatrix(); fitTop(); }
  addEventListener('resize', resize); resize(); applyVisibility();
  let last = performance.now(), lastFloor = floorOf();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!topView) {
      let f = 0, s = 0;
      if (keys.KeyW || keys.ArrowUp) f += 1; if (keys.KeyS || keys.ArrowDown) f -= 1;
      if (keys.KeyD) s += 1; if (keys.KeyA) s -= 1;
      if (keys.ArrowLeft) player.yaw += 1.8 * dt; if (keys.ArrowRight) player.yaw -= 1.8 * dt;
      f -= stick.y; s += stick.x;
      const m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; }
      const sp = (keys.ShiftLeft || keys.ShiftRight ? 4.2 : 2.2) * dt;
      const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
      player.x += (-sy * f + cy * s) * sp; player.z += (-cy * f - sy * s) * sp;
      if (f || s) { collide(); updateLevel(); }
      cam.position.set(player.x, player.y + EYE, player.z); cam.rotation.y = player.yaw; cam.rotation.x = player.pitch;
      const fl = floorOf(); if (fl !== lastFloor) { lastFloor = fl; refreshFloorBtn(); }
    }
    renderer.render(scene, topView ? topCam : cam);
    drawMap(); updateInfo();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__smotra = { player, standList, elev };   // za provjeru
})();
