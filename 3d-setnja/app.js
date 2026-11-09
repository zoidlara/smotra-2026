// Smotra 2026 · 3D šetnja kroz 1. kat. Podaci: stands.js (nazivi, boje) i layout.js (raspored).
(function () {
  const L = window.RASPORED, STANDS = window.STANDOVI || [];
  const S = L.pxPoMetru, H = L.visinaKata;
  const OX = 660, OY = 550;                         // središte skice -> ishodište
  const wx = (px) => (px - OX) / S, wz = (py) => (py - OY) / S;
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
  function inkFor(hex) { const c = new THREE.Color(hex); return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) > 0.62 ? '#0d3c8c' : '#ffffff'; }
  const lam = (o) => { const m = new THREE.MeshLambertMaterial(o); if (o.color !== undefined) m.color.convertSRGBToLinear(); return m; };

  // ---------- kolizija ----------
  const segs = [];
  const addSeg = (ax, az, bx, bz) => segs.push([ax, az, bx, bz]);
  const addRect = (x0, z0, x1, z1) => { addSeg(x0, z0, x1, z0); addSeg(x1, z0, x1, z1); addSeg(x1, z1, x0, z1); addSeg(x0, z1, x0, z0); };

  // ---------- pod, strop, zidovi ----------
  const poly = L.obod.map(([x, y]) => [wx(x), wz(y)]);
  const [ax0, ay0, ax1, ay1] = L.atrij;
  const atr = [wx(ax0), wz(ay0), wx(ax1), wz(ay1)];
  function shapeWithHole() {
    const sh = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const hole = new THREE.Path([[atr[0], atr[1]], [atr[2], atr[1]], [atr[2], atr[3]], [atr[0], atr[3]]].map(([x, z]) => new THREE.Vector2(x, -z)));
    sh.holes.push(hole); return sh;
  }
  const floorTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#e9e4dc'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(120,110,95,.18)'; g.lineWidth = 2; g.strokeRect(0, 0, 256, 256);
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(110,100,90,' + (Math.random() * .12) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.6, 0.6); t.encoding = THREE.sRGBEncoding; return t; })();
  const floor = new THREE.Mesh(new THREE.ShapeGeometry(shapeWithHole()), lam({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.ShapeGeometry(shapeWithHole()), lam({ color: 0xf4f4f2, side: THREE.BackSide }));
  ceil.rotation.x = -Math.PI / 2; ceil.position.y = H; scene.add(ceil);
  // prizemlje ispod atrija
  const lower = new THREE.Mesh(new THREE.PlaneGeometry(atr[2] - atr[0] + 4, atr[3] - atr[1] + 4), lam({ color: 0xcfc8bd }));
  lower.rotation.x = -Math.PI / 2; lower.position.set((atr[0] + atr[2]) / 2, -4.2, (atr[1] + atr[3]) / 2); scene.add(lower);
  const lowLbl = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.6), new THREE.MeshBasicMaterial({ map: textTex(['PRIZEMLJE · ATRIJ'], '#cfc8bd', '#8a7f70', 1024, 200, 110) }));
  lowLbl.rotation.x = -Math.PI / 2; lowLbl.position.set(lower.position.x, -4.19, lower.position.z + 2); scene.add(lowLbl);
  // zidovi atrija (ispod poda)
  const wallMat = lam({ color: 0xf2f0ec });
  function wallBox(ax, az, bx, bz, y0, y1, t, mat) {
    const len = Math.hypot(bx - ax, bz - az); const m = new THREE.Mesh(new THREE.BoxGeometry(len, y1 - y0, t), mat || wallMat);
    m.position.set((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); scene.add(m); return m;
  }
  const A = [[atr[0], atr[1]], [atr[2], atr[1]], [atr[2], atr[3]], [atr[0], atr[3]]];
  const glass = lam({ color: 0xbfe3f0, transparent: true, opacity: 0.28 });
  const rail = lam({ color: 0x8d949c });
  for (let i = 0; i < 4; i++) {
    const [p, q] = [A[i], A[(i + 1) % 4]];
    wallBox(p[0], p[1], q[0], q[1], -4.2, 0, 0.3, lam({ color: 0xe2ddd5 }));
    wallBox(p[0], p[1], q[0], q[1], 0, 1.0, 0.03, glass);
    wallBox(p[0], p[1], q[0], q[1], 1.0, 1.06, 0.07, rail);
    addSeg(p[0], p[1], q[0], q[1]);
  }
  // obodni zidovi
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; wallBox(p[0], p[1], q[0], q[1], 0, H, 0.04); addSeg(p[0], p[1], q[0], q[1]); }
  // amfiteatar natpis
  const amph = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.55), new THREE.MeshBasicMaterial({ map: textTex(['AMFITEATAR'], '#f2f0ec', '#5b6b80', 1200, 110, 80) }));
  amph.position.set(wx(574), 3.15, wz(436) + 0.14); scene.add(amph);
  L.blokovi.forEach(([x0, y0, x1, y1]) => { const b = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) / S, H, (y1 - y0) / S), wallMat); b.position.set(wx((x0 + x1) / 2), H / 2, wz((y0 + y1) / 2)); scene.add(b); addRect(wx(x0), wz(y0), wx(x1), wz(y1)); });
  L.stupovi.forEach(([x, y]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, H, 24), wallMat); c.position.set(wx(x), H / 2, wz(y)); scene.add(c); addRect(wx(x) - .4, wz(y) - .4, wx(x) + .4, wz(y) + .4); });

  // ---------- štandovi ----------
  const metal = lam({ color: 0xb4b9bf });
  const white = lam({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
  const standList = [];
  function plane(w, h, mat) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); }
  function buildStand(info, pos) {
    const g = new THREE.Group();
    const [dx, dz] = DIRS[pos.smjer] || DIRS.N;
    const rot = Math.atan2(dx, dz);
    const cx = wx(pos.x), cz = wz(pos.y);
    g.position.set(cx, 0, cz); g.rotation.y = rot;
    const col = info.boja || '#9aa3ad';
    const colMat = () => lam({ color: col });
    const put = (mesh, x, y, z, ry) => { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; };
    const PH = 2.355, PY = 0.02 + PH / 2;
    function panel(key, w, x, z, ry) {
      const m = put(plane(w, PH, colMat()), x, PY, z, ry);
      loadTex(info.broj, key, (t) => { m.material = lam({ map: t }); });
    }
    // nosive stijenke (bijele, s vanjske strane)
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
    // aluminijski okvir
    [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1], [-1.5, 0.52], [-1.5, 0.055], [-0.495, -1], [0.485, -1], [1.5, 0]].forEach(([x, z]) => put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.76, 0.035), metal), x, 1.38, z));
    put(new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.035, 0.035), metal), 0, 2.41, -1);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 2.0), metal), -1.5, 2.41, 0);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 2.0), metal), 1.5, 2.41, 0);
    // friz s natpisom (11) i logom (12) nad ulazom
    put(new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.37, 0.03), white), 0, 2.585, 1);
    const ink = inkFor(col);
    const words = info.naziv.toUpperCase().split(' '); const lines = []; let cur = '';
    words.forEach((w) => { if ((cur + ' ' + w).trim().length > 26) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }); lines.push(cur.trim());
    const f11 = put(plane(1.952, 0.335, lam({ map: textTex(lines.slice(0, 3), col, ink, 1952, 335, lines.length > 2 ? 70 : 92) })), -0.5, 2.585, 1.03);
    const f12 = put(plane(0.962, 0.335, lam({ map: textTex([String(info.broj)], col, ink, 962, 335, 160) })), 1.0, 2.585, 1.03);
    loadTex(info.broj, '11', (t) => { f11.material = lam({ map: t }); });
    loadTex(info.broj, '12', (t) => { f12.material = lam({ map: t }); });
    // pult 9 (prednja) / 10 (bočna), ispred ploče 7
    const pm = [colMat(), colMat(), white, white, colMat(), colMat()];
    const pult = put(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.855, 0.455), pm), -1.0, 0.4275, 0.75);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.025, 0.475), white), -1.0, 0.8675, 0.75);
    loadTex(info.broj, '09', (t) => { pm[4] = lam({ map: t }); pult.material = pm.slice(); });
    loadTex(info.broj, '10', (t) => { pm[0] = lam({ map: t }); pult.material = pm.slice(); });
    // tepih
    const carpet = put(plane(3.0, 2.0, lam({ color: 0x8e959d })), 0, 0.004, 0); carpet.rotation.x = -Math.PI / 2;
    // obojeni krov, vidi se samo u pogledu odozgo
    const roof = put(plane(3.0, 2.0, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).convertSRGBToLinear(), transparent: true, opacity: 0.85 })), 0, 2.9, 0); roof.rotation.x = -Math.PI / 2; roof.visible = false;
    // broj iznad štanda
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex([String(info.broj)], col, ink, 128, 128, 84), depthTest: true }));
    badge.position.set(0, 3.05, 0.9); badge.scale.set(0.38, 0.38, 1); g.add(badge);
    scene.add(g);
    // kolizija (lokalno -> svijet)
    const c = Math.cos(rot), s = Math.sin(rot);
    const T = (x, z) => [cx + x * c + z * s, cz - x * s + z * c];
    const seg = (a, b) => { const p = T(a[0], a[1]), q = T(b[0], b[1]); addSeg(p[0], p[1], q[0], q[1]); };
    seg([-1.5, 1], [-1.5, -1]); seg([-1.5, -1], [1.5, -1]); seg([1.5, -1], [1.5, 1]);
    seg([-0.525, 0.52], [-0.525, 0.98]); seg([-0.525, 0.98], [-1.5, 0.98]); seg([-0.525, 0.52], [-1.5, 0.52]);
    standList.push({ info, cx, cz, dx, dz, group: g, badge, roof, rect: [-1.5, -1, 3, 2], ox: cx, oz: cz, far: 3.4 });
  }

  // Veliki štandovi od 8 ploča po 950 mm (bez pulta i friza):
  //   tip "U8"   = U oblik: 2 ploče lijevo (01–02, od ulaza prema natrag), 4 straga (03–06), 2 desno (07–08, od natrag prema ulazu)
  //   tip "zid8" = jedan ravni zid, ploče 01–08 s lijeva na desno
  function buildLong(info, pos) {
    const g = new THREE.Group();
    const [dx, dz] = DIRS[pos.smjer] || DIRS.N;
    const rot = Math.atan2(dx, dz);
    const cx = wx(pos.x), cz = wz(pos.y);
    g.position.set(cx, 0, cz); g.rotation.y = rot;
    const col = info.boja || '#9aa3ad';
    const put = (mesh, x, y, z, ry) => { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; };
    const PW = 0.95, GAP = 0.02, PH = 2.355, PY = 0.02 + PH / 2, z0 = -1;
    const U = info.tip === 'U8', nB = U ? 4 : 8, nS = U ? 2 : 0;
    const W = nB * PW + (nB + 1) * GAP, D = U ? nS * PW + (nS + 1) * GAP : 0;
    const panel = (n, x, z, ry) => {
      const m = put(plane(PW, PH, lam({ color: col })), x, PY, z, ry);
      loadTex(info.broj, String(n).padStart(2, '0'), (t) => { m.material = lam({ map: t }); });
    };
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
    const roof = put(plane(W, Math.max(cd, 0.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).convertSRGBToLinear(), transparent: true, opacity: 0.85 })), 0, 2.9, z0 + Math.max(cd, 0.4) / 2);
    roof.rotation.x = -Math.PI / 2; roof.visible = false;
    if (info.napomena) {
      const nb = put(plane(3.2, 0.32, new THREE.MeshBasicMaterial({ map: textTex(['⚠ ' + info.napomena], '#fff4c2', '#7a5200', 2000, 200, 92) })), 0, 2.62, z0 + 0.06);
      const nb2 = put(plane(3.2, 0.32, new THREE.MeshBasicMaterial({ map: textTex(['⚠ ' + info.napomena], '#fff4c2', '#7a5200', 2000, 200, 92) })), 0, 2.62, z0 - 0.06, Math.PI); nb2.visible = true;
    }
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex([String(info.broj)], col, inkFor(col), 128, 128, 84), depthTest: true }));
    badge.position.set(0, 3.05, z0 + 0.3); badge.scale.set(0.38, 0.38, 1); g.add(badge);
    scene.add(g);
    const c = Math.cos(rot), s = Math.sin(rot);
    const T = (x, z) => [cx + x * c + z * s, cz - x * s + z * c];
    const seg = (a, b) => { const p = T(a[0], a[1]), q = T(b[0], b[1]); addSeg(p[0], p[1], q[0], q[1]); };
    seg([-W / 2, z0], [W / 2, z0]);
    if (U) { seg([-W / 2, z0 + D], [-W / 2, z0]); seg([W / 2, z0], [W / 2, z0 + D]); }
    const fc = T(0, z0 + Math.max(D, 1.2) / 2);
    standList.push({ info, cx: fc[0], cz: fc[1], dx, dz, group: g, badge, roof, rect: [-W / 2, z0, W, Math.max(D, 0.25)], ox: cx, oz: cz, far: info.pogled || (U ? 4.2 : 2.3) });
  }
  STANDS.forEach((info) => { const pos = L.standovi[info.broj]; if (!pos) return; if (info.tip === 'U8' || info.tip === 'zid8') buildLong(info, pos); else buildStand(info, pos); });

  // ---------- kretanje ----------
  const player = { x: wx(L.start.x), z: wz(L.start.y), yaw: 0, pitch: -0.05 };
  { const d = DIRS[L.start.gleda] || DIRS.N; player.yaw = Math.atan2(-d[0], -d[1]); }
  function collide() {
    for (let k = 0; k < 3; k++) for (const [ax, az, bx, bz] of segs) {
      const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1;
      let t = ((player.x - ax) * vx + (player.z - az) * vz) / l2; t = Math.max(0, Math.min(1, t));
      const px = ax + vx * t, pz = az + vz * t, ddx = player.x - px, ddz = player.z - pz, d = Math.hypot(ddx, ddz);
      if (d < R && d > 1e-6) { player.x = px + ddx / d * R; player.z = pz + ddz / d * R; }
    }
  }
  const keys = {};
  addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'KeyM') toggleView(); });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  const stick = { x: 0, y: 0 };
  const look = (dx, dy, k) => { player.yaw -= dx * k; player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - dy * k)); };

  let started = false, topView = false;
  const help = document.getElementById('help'), cross = document.getElementById('cross');
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) document.body.classList.add('touch');
  document.querySelectorAll(isTouch ? '.desk' : '.mob').forEach((e) => e.style.display = 'none');
  function lockPointer() { if (isTouch || topView) return; try { const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
  document.getElementById('go').onclick = () => { help.style.display = 'none'; started = true; lockPointer(); };
  document.addEventListener('pointerlockchange', () => { cross.style.display = document.pointerLockElement === canvas ? 'block' : 'none'; });

  // miš: pointer lock ili povlačenje
  let drag = null;
  canvas.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) look(e.movementX, e.movementY, 0.0024);
  });
  // dodir i povlačenje (bez pointer locka)
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
    if (e.pointerType === 'mouse' && !isTouch) { if (document.pointerLockElement !== canvas) { lockPointer(); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; } return; }
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
  standList.slice().sort((a, b) => a.info.broj - b.info.broj).forEach((s) => { const o = document.createElement('option'); o.value = s.info.broj; o.textContent = s.info.broj + ' · ' + s.info.naziv; jump.appendChild(o); });
  function goTo(s) {
    player.x = s.cx + s.dx * s.far; player.z = s.cz + s.dz * s.far; player.yaw = Math.atan2(s.dx, s.dz); player.pitch = 0.08;
    collide(); if (topView) toggleView(); help.style.display = 'none'; started = true;
  }
  jump.onchange = () => { const s = standList.find((t) => String(t.info.broj) === jump.value); if (s) goTo(s); jump.value = ''; jump.blur(); };

  // ---------- pogled odozgo ----------
  const btnView = document.getElementById('btnView');
  function toggleView() {
    topView = !topView; ceil.visible = !topView; btnView.textContent = topView ? 'Hodaj' : 'Pogled odozgo';
    standList.forEach((s) => { const k = topView ? 1.6 : 0.38; s.badge.scale.set(k, k, 1); s.badge.position.y = topView ? 4 : 3.05; s.roof.visible = topView; });
    if (topView && document.pointerLockElement) document.exitPointerLock();
    if (topView) { help.style.display = 'none'; started = true; }
  }
  btnView.onclick = toggleView;
  const ray = new THREE.Raycaster();
  function pickStand(e) {
    const v = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(v, topCam); const p = ray.ray.origin; // ortho: točka na podu
    let best = null, bd = 2.6; standList.forEach((s) => { const d = Math.hypot(s.cx - p.x, s.cz - p.z); if (d < bd) { bd = d; best = s; } });
    if (best) goTo(best);
  }

  // ---------- mini tlocrt ----------
  const map = document.getElementById('map'), mg = map.getContext('2d');
  const bx0 = 140, by0 = 200, bx1 = 1180, by1 = 895;
  function mapXf() { const w = map.clientWidth, h = map.clientHeight, k = Math.min(w / (bx1 - bx0), h / (by1 - by0)); return { k, ox: (w - (bx1 - bx0) * k) / 2, oy: (h - (by1 - by0) * k) / 2, w, h }; }
  function drawMap() {
    const dpr = Math.min(devicePixelRatio || 1, 2), f = mapXf();
    if (map.width !== f.w * dpr) { map.width = f.w * dpr; map.height = f.h * dpr; }
    mg.setTransform(dpr, 0, 0, dpr, 0, 0); mg.clearRect(0, 0, f.w, f.h);
    const P = (x, y) => [f.ox + (x - bx0) * f.k, f.oy + (y - by0) * f.k];
    mg.beginPath(); L.obod.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? mg.lineTo(a, b) : mg.moveTo(a, b); }); mg.closePath();
    mg.fillStyle = 'rgba(233,228,220,.95)'; mg.fill(); mg.strokeStyle = '#7a8594'; mg.lineWidth = 1; mg.stroke();
    { const [a, b] = P(ax0, ay0), [c, d] = P(ax1, ay1); mg.fillStyle = 'rgba(150,160,175,.45)'; mg.fillRect(a, b, c - a, d - b); }
    standList.forEach((s) => {
      const [oa, ob] = P(s.ox * S + OX, s.oz * S + OY), [a, b] = P(s.cx * S + OX, s.cz * S + OY), r = s.rect;
      mg.save(); mg.translate(oa, ob); mg.rotate(-Math.atan2(s.dx, s.dz)); mg.fillStyle = s.info.boja; mg.fillRect(r[0] * S * f.k, r[1] * S * f.k, r[2] * S * f.k, r[3] * S * f.k); mg.restore();
      if (f.w > 180) { mg.fillStyle = inkFor(s.info.boja); mg.font = '700 9px system-ui'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText(s.info.broj, a, b); }
    });
    const [a, b] = P(player.x * S + OX, player.z * S + OY);
    mg.save(); mg.translate(a, b); mg.rotate(-player.yaw); mg.beginPath(); mg.moveTo(0, -8); mg.lineTo(5, 5); mg.lineTo(-5, 5); mg.closePath();
    mg.fillStyle = '#e0242b'; mg.fill(); mg.restore();
  }
  map.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); const f = mapXf(), r = map.getBoundingClientRect();
    const px = (e.clientX - r.left - f.ox) / f.k + bx0, py = (e.clientY - r.top - f.oy) / f.k + by0;
    const x = wx(px), z = wz(py);
    if (!inside(x, z) || (x > atr[0] && x < atr[2] && z > atr[1] && z < atr[3])) return;
    player.x = x; player.z = z; collide(); if (topView) toggleView(); help.style.display = 'none'; started = true;
  });
  function inside(x, z) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }

  // ---------- info o štandu ----------
  const infoEl = document.getElementById('info'); let lastInfo = null;
  function updateInfo() {
    let best = null, bs = 1e9;
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
    standList.forEach((s) => { const vx = s.cx - player.x, vz = s.cz - player.z, d = Math.hypot(vx, vz); if (d > 5.5) return; const dot = (vx * fx + vz * fz) / (d || 1); const sc = d - dot * 2; if ((dot > 0.3 || d < 1.8) && sc < bs) { bs = sc; best = s; } });
    if (topView) best = null;
    if (best === lastInfo) return; lastInfo = best;
    if (!best) { infoEl.style.display = 'none'; return; }
    infoEl.style.display = 'block';
    infoEl.innerHTML = `<span class="num" style="background:${best.info.boja};color:${inkFor(best.info.boja)}">${best.info.broj}</span><b></b>`;
    infoEl.querySelector('b').textContent = best.info.naziv; if (best.info.napomena) { const i = document.createElement('div'); i.style.cssText = 'font-size:12px;color:#a06a00;margin-top:2px'; i.textContent = '⚠ ' + best.info.napomena; infoEl.appendChild(i); }
  }

  // ---------- petlja ----------
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 85 : 70; cam.updateProjectionMatrix();
    const pw = (bx1 - bx0) / S + 2, ph = (by1 - by0) / S + 2, a = w / h; let hw = pw / 2, hh = ph / 2; if (hw / hh > a) hh = hw / a; else hw = hh * a;
    topCam.left = -hw; topCam.right = hw; topCam.top = hh; topCam.bottom = -hh; topCam.updateProjectionMatrix();
    topCam.position.set(wx((bx0 + bx1) / 2), 80, wz((by0 + by1) / 2)); topCam.lookAt(topCam.position.x, 0, topCam.position.z);
  }
  addEventListener('resize', resize); resize();
  let last = performance.now();
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
      if (f || s) collide();
      cam.position.set(player.x, EYE, player.z); cam.rotation.y = player.yaw; cam.rotation.x = player.pitch;
    }
    renderer.render(scene, topView ? topCam : cam);
    drawMap(); updateInfo();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
