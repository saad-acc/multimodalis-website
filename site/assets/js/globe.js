/* Multimodalis hero globe — three.js r128 (self-hosted, MIT). Texture: assets/img/multimodalis-globe-world-fill.png */
(function() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || !window.THREE || window.matchMedia('(max-width: 768px)').matches) return;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ll2v(lat, lng, r) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  /* Route endpoints. Real coordinates of well-known ports / airports / hubs.
     hub:true = inland route endpoint: no label, no marker, not an air endpoint (keeps the globe uncluttered).
     Decorative only: no claim that Multimodalis runs these lanes. Corridor sources: land-routes-research-2026-10-12.md */
  const CITIES = [
    { name:'Rotterdam',   lat: 51.95, lng:   4.14 },
    { name:'Hamburg',     lat: 53.54, lng:   9.97 },
    { name:'Frankfurt',   lat: 50.03, lng:   8.57 },
    { name:'Duisburg',    lat: 51.43, lng:   6.76 },
    { name:'Chengdu',     lat: 30.66, lng: 104.07 },
    { name:'Singapore',   lat:  1.26, lng: 103.82 },
    { name:'Shanghai',    lat: 30.63, lng: 122.06 },
    { name:'Los Angeles', lat: 33.74, lng:-118.27 },
    { name:'New York',    lat: 40.64, lng: -73.78 },
    { name:'Chicago',     lat: 41.88, lng: -87.63 },
    { name:'Dubai',       lat: 25.25, lng:  55.36 },
    { name:'Milan',       lat: 45.46, lng:   9.19 },
    { name:'Istanbul',    lat: 41.01, lng:  28.98 },
    { name:'Warsaw',      lat: 52.23, lng:  21.01 },
    { name:'Santos',      lat:-23.96, lng: -46.33 },
    { name:'Tokyo',       lat: 35.55, lng: 139.78 },
    { name:'Hong Kong',   lat: 22.31, lng: 113.92 },
    { name:'Sydney',      lat:-33.86, lng: 151.21 },
    { name:'Perth',       lat:-32.05, lng: 115.74 }, // Fremantle port
    { name:'Durban',      lat:-29.87, lng:  31.03 },
    { name:'Lagos',       lat:  6.44, lng:   3.40 },
    { name:'Buenos Aires',lat:-34.60, lng: -58.37 },
    { name:'Houston',     lat: 29.73, lng: -95.27 },
    { name:'Vancouver',   lat: 49.29, lng:-123.11 },
    { name:'Auckland',    lat:-36.84, lng: 174.77 },
    { name:'Mexico City', lat: 19.43, lng: -99.13 }, // inland hub (MEX)
    { name:'Antofagasta', lat:-23.65, lng: -70.40 }, // port
    { name:'Cairo',       lat: 30.04, lng:  31.24 },
    { name:'Mombasa',     lat: -4.04, lng:  39.67 }, // port
    { name:'Lobito',      lat:-12.35, lng:  13.55 }, // port
    { name:'Moscow',      lat: 55.75, lng:  37.62 },
    { name:'Vladivostok', lat: 43.12, lng: 131.89 }, // port
    { name:'Mumbai',      lat: 18.95, lng:  72.95 }, // Nhava Sheva / JNPT
    { name:'Bandar Abbas',lat: 27.19, lng:  56.27 }, // port
    { name:'Halifax',     lat: 44.65, lng: -63.57 }, // port
    // unlabelled inland hubs
    { name:'Johannesburg',lat:-26.21, lng:  28.07, hub:true },
    { name:'Pretoria',    lat:-25.75, lng:  28.19, hub:true },
    { name:'Nairobi',     lat: -1.29, lng:  36.82, hub:true },
    { name:'Kolwezi',     lat:-10.72, lng:  25.47, hub:true },
    { name:'Delhi',       lat: 28.55, lng:  77.55, hub:true }, // Dadri
    { name:'Astrakhan',   lat: 46.35, lng:  48.04, hub:true },
    { name:'Laredo',      lat: 27.51, lng: -99.51, hub:true },
    { name:'Minneapolis', lat: 44.98, lng: -93.27, hub:true },
    { name:'Winnipeg',    lat: 49.90, lng: -97.14, hub:true },
    { name:'Rondonópolis',lat:-16.47, lng: -54.64, hub:true },
    { name:'São Paulo',   lat:-23.55, lng: -46.63, hub:true },
  ];
  const CITY = {}; CITIES.forEach(c => { CITY[c.name] = c; });

  /* Surface route pool. Waypoints keep sea lanes on water and road/rail on land. */
  const ROUTES = [
    // ── Sea
    { mode:'sea', path:['Rotterdam',[50.0,-1.5],[48.5,-6.5],[43.0,-10.0],[36.0,-6.5],[36.0,-5.4],[37.3,11.0],[33.0,25.0],[31.3,32.3],[27.5,33.9],[20.0,38.5],[12.6,43.4],[12.0,51.0],[8.0,60.0],[5.6,80.6],[6.0,95.0],'Singapore'] },
    { mode:'sea', path:['Shanghai',[33.0,140.0],[42.0,165.0],[44.0,-170.0],[40.0,-140.0],'Los Angeles'] },
    { mode:'sea', path:['Rotterdam',[50.0,-1.5],[49.5,-6.0],[41.5,-50.0],[40.3,-72.0],[40.6,-73.9]] },
    { mode:'sea', path:['Santos',[-20.0,-38.0],[-5.0,-33.0],[15.0,-27.0],[38.0,-14.0],[43.5,-10.5],[48.5,-6.5],[50.0,-1.5],'Rotterdam'] },
    { mode:'sea', path:['Singapore',[-6.0,105.8],[-12.0,110.0],[-22.0,112.0],[-30.0,113.6],'Perth'] },
    { mode:'sea', path:['Sydney',[-34.5,160.0],[-34.0,172.5],[-35.6,175.0],'Auckland'] },
    { mode:'sea', path:['Durban',[-35.0,26.0],[-36.0,18.0],[-25.0,12.0],[-10.0,8.0],[0.0,4.0],'Lagos'] },
    { mode:'sea', path:['Lagos',[4.0,0.0],[4.5,-8.0],[10.0,-18.0],[20.0,-19.0],[30.0,-14.0],[38.0,-12.0],[43.5,-10.5],[48.5,-6.5],[50.0,-1.5],'Rotterdam'] },
    { mode:'sea', path:['Buenos Aires',[-35.5,-55.0],[-30.0,-48.0],[-25.0,-45.0],'Santos'] },
    { mode:'sea', path:['Houston',[27.5,-94.0],[24.5,-86.0],[23.8,-82.0],[25.0,-79.8],[30.0,-78.0],[40.0,-50.0],[48.5,-6.5],[50.0,-1.5],'Rotterdam'] },
    { mode:'sea', path:['Vancouver',[48.3,-123.5],[48.5,-125.5],[50.0,-145.0],[48.0,-170.0],[42.0,160.0],[35.0,142.0],[33.0,140.0],'Shanghai'] },
    // ── Rail
    { mode:'rail', path:['Duisburg','Warsaw',[52.08,23.66],[53.90,27.56],'Moscow',[55.16,61.40],[51.17,71.45],[45.20,82.40],[43.83,87.62],[36.06,103.83],'Chengdu'] },
    { mode:'rail', path:['Hamburg',[52.37,9.73],[50.11,8.68],[48.14,11.58],[47.00,11.50],[45.44,10.99],'Milan'] },
    { mode:'rail', path:['Chicago',[39.10,-94.58],[35.08,-106.65],[35.20,-111.65],[34.90,-117.02],'Los Angeles'] },
    { mode:'rail', path:['Vancouver',[51.05,-114.07],[50.45,-104.61],'Winnipeg','Minneapolis','Chicago'] },
    // Trans-Australian: Sydney → Parkes → Broken Hill → Port Augusta → Kalgoorlie → Perth
    { mode:'rail', path:['Sydney',[-33.14,148.18],[-31.95,141.47],[-32.49,137.77],[-30.75,121.47],'Perth'] },
    // Rumo: Rondonópolis → Campo Grande area → Campinas → Santos
    { mode:'rail', path:['Rondonópolis',[-20.47,-54.62],[-22.91,-47.06],'Santos'] },
    // Natcor: Durban → Pietermaritzburg → Ladysmith → Johannesburg
    { mode:'rail', path:['Durban',[-29.60,30.38],[-28.56,29.78],'Johannesburg'] },
    // Mombasa–Nairobi SGR
    { mode:'rail', path:['Mombasa',[-3.40,38.56],'Nairobi'] },
    // Lobito Corridor (Benguela Railway)
    { mode:'rail', path:['Lobito',[-12.78,15.73],[-10.71,22.23],'Kolwezi'] },
    // Trans-Siberian
    { mode:'rail', path:['Moscow',[56.84,60.61],[55.03,82.92],[52.29,104.28],[48.48,135.07],'Vladivostok'] },
    // India Western DFC
    { mode:'rail', path:['Mumbai',[22.31,73.18],[23.02,72.57],[26.91,75.79],[28.19,76.62],'Delhi'] },
    // ── Road
    { mode:'road', path:['Rotterdam',[51.23,6.78],[50.94,6.96],'Frankfurt',[48.78,9.18],[47.56,7.59],[46.0,8.95],'Milan'] },
    { mode:'road', path:['Istanbul',[42.70,23.32],[44.43,26.10],[45.75,21.23],[47.50,19.04],[50.06,19.94],'Warsaw'] },
    { mode:'road', path:['Chicago',[41.50,-81.69],[40.44,-79.99],[40.27,-76.88],'New York'] },
    { mode:'road', path:['Houston',[32.78,-96.80],[36.15,-95.99],[38.63,-90.20],'Chicago'] },
    // Capricorn Bioceanic: Santos → Campo Grande → Porto Murtinho → Chaco → Pozo Hondo → Jujuy → Paso de Jama → Antofagasta
    { mode:'road', path:['Santos',[-20.47,-54.62],[-21.70,-57.88],[-22.03,-60.62],[-22.26,-62.67],[-24.19,-65.30],[-23.24,-67.03],'Antofagasta'] },
    // Mercosur BR-116: São Paulo → Curitiba → Porto Alegre → Uruguaiana → Rosario → Buenos Aires
    { mode:'road', path:['São Paulo',[-25.43,-49.27],[-30.03,-51.23],[-29.75,-57.09],[-32.95,-60.65],'Buenos Aires'] },
    // TAH 4: Cairo → Khartoum → Addis Ababa → Nairobi → Dodoma → Lusaka → Gaborone → Pretoria
    { mode:'road', path:['Cairo',[15.50,32.56],[8.98,38.76],'Nairobi',[-6.16,35.75],[-15.39,28.32],[-24.65,25.91],'Pretoria'] },
    // INSTC: Bandar Abbas → Tehran → Rasht → Astara → Baku → Makhachkala → Astrakhan
    { mode:'road', path:['Bandar Abbas',[35.69,51.39],[37.28,49.58],[38.43,48.87],[40.41,49.87],[42.98,47.50],'Astrakhan'] },
    // I-35: Laredo → San Antonio → Dallas → Oklahoma City → Kansas City → Des Moines → Minneapolis
    { mode:'road', path:['Laredo',[29.42,-98.49],[32.78,-96.80],[35.47,-97.52],[39.10,-94.58],[41.59,-93.62],'Minneapolis'] },
    // Trans-Canada (east): Winnipeg → Thunder Bay → Sudbury → Toronto → Montréal → Fredericton → Halifax
    { mode:'road', path:['Winnipeg',[48.38,-89.25],[46.49,-80.99],[43.65,-79.38],[45.50,-73.57],[45.96,-66.64],'Halifax'] },
    // Mexico: Mexico City → Querétaro → San Luis Potosí → Monterrey → Laredo (CPKC/NAFTA axis, road)
    { mode:'road', path:['Mexico City',[20.59,-100.39],[22.15,-100.98],[25.69,-100.32],'Laredo'] },
  ];

  /* Frequency: same number of concurrent surface trips as before the pool grew (21 looping routes at 1aaca14).
     Each slot picks a random not-currently-active route when its trip ends. */
  const SURFACE_SLOTS = 21;

  /* Brand mode colors (tokens.json color.brand.*). speed = radians of arc per second. */
  const MODE_CFG = {
    air:  { color: 0x037AE2, speed: 0.95, trail: 0.22 },
    sea:  { color: 0x0294AB, speed: 0.38, trail: 0.16 },
    rail: { color: 0xD11767, speed: 0.42, trail: 0.16 },
    road: { color: 0x455161, speed: 0.30, trail: 0.20 },
  };
  /* Air: AIR_SLOTS concurrent aircraft (same count/stagger as before), each trip picks a random
     A→B pair from CITIES; pairs < ~1500 km or near-antipodal (> ~17,800 km) are skipped. */
  const AIR_SLOTS = [0.3, 1.8, 3.0, 4.2, 5.6, 6.8];
  const AIR_MIN_ANG = 1500 / 6371, AIR_MAX_ANG = 2.8;
  const SURFACE_R = 1.008;   // just above the sphere (tessellation-safe, no z-fighting)
  const AIR_MAX_H = 0.26;    // highest air arc above surface; camera framing below keeps R+this inside the canvas

  /* ── Renderer + scene ── */
  const W = 540, H = 540;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  /* Frame a bounding sphere of radius R + AIR_MAX_H + margin so the highest
     air arc never leaves the (square) canvas: dist = r / sin(fov/2). */
  const FOV = 45;
  const FRAME_R = 1.0 + AIR_MAX_H + 0.06;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = FRAME_R / Math.sin(FOV / 2 * Math.PI / 180);
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);
  const globeSurface = new THREE.Group();
  globeSurface.renderOrder = 0;
  const globeOverlay = new THREE.Group();
  globeOverlay.renderOrder = 1;
  globeGroup.add(globeSurface);
  globeGroup.add(globeOverlay);
  const R = 1.0;

  function facingDot(worldPos) {
    return worldPos.clone().normalize().dot(camera.position.clone().normalize());
  }

  /* ── Globe: ocean base + land mask texture (globe-world-fill.png) ── */
  const sphereGeo = new THREE.SphereGeometry(R, 64, 32);

  globeSurface.add(new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({
    color: 0xCFE2F5,
    shininess: 14,
    specular: new THREE.Color(0x8AB6FF),
  })));

  function applyLandTexture(texture) {
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    /* Pacific-centered PNG vs ll2v: shift map 180° on the sphere */
    texture.wrapS = THREE.RepeatWrapping;
    texture.offset.x = 0.5;
    const land = new THREE.Mesh(sphereGeo, new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      color: 0x455161,
      depthWrite: true,
    }));
    land.renderOrder = 0;
    globeSurface.add(land);
  }

  const mapUrls = [canvas.dataset.map];
  (function loadMap(i) {
    if (i >= mapUrls.length) return;
    new THREE.TextureLoader().load(mapUrls[i], applyLandTexture, undefined, function() {
      loadMap(i + 1);
    });
  })(0);

  /* ── Atmosphere glow ── */
  const atmGeo = new THREE.SphereGeometry(R * 1.06, 32, 32);
  const atmMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide,
    uniforms: { c: { value: 0.35 }, p: { value: 5.0 } },
    vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float c,p; varying vec3 vNormal; void main(){ float i=pow(c-dot(vNormal,vec3(0,0,1)),p); gl_FragColor=vec4(0.12,0.39,0.80,1.0)*i; }`
  });
  globeSurface.add(new THREE.Mesh(atmGeo, atmMat));

  /* ── Grid lines ── */
  const gridMat = new THREE.LineBasicMaterial({ color: 0xCBD5E1, transparent: true, opacity: 0.62 });
  const RG = R + 0.001;
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    for (let lng = 0; lng <= 360; lng += 4) pts.push(ll2v(lat, lng - 180, RG));
    globeSurface.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  for (let lng = 0; lng < 360; lng += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) pts.push(ll2v(lat, lng, RG));
    globeSurface.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xFFFFFF, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(4, 3, 5);
  scene.add(sun);

  /* ── City markers (overlay — pulse halo only) ── */
  const pGeo = new THREE.SphereGeometry(0.036, 8, 8);
  const cityMeshes = [];
  CITIES.forEach((city, ci) => {
    if (city.hub) return;
    const pos = ll2v(city.lat, city.lng, R + 0.022);
    const pm = new THREE.MeshBasicMaterial({ color: 0x1F63CC, transparent: true, opacity: 0.30, depthTest: true });
    const pulse = new THREE.Mesh(pGeo, pm);
    pulse.position.copy(pos);
    pulse.renderOrder = 2;
    globeOverlay.add(pulse);
    cityMeshes.push({ pulse, pulseMat: pm, phase: ci * 0.52, pos });
  });

  /* ── Routes (overlay) ── */
  function toVec(p) {
    const c = typeof p === 'string' ? CITY[p] : { lat: p[0], lng: p[1] };
    return ll2v(c.lat, c.lng, 1).normalize();
  }
  function slerp(a, b, t) {
    const ang = a.angleTo(b);
    if (ang < 1e-6) return a.clone();
    const s = Math.sin(ang);
    return a.clone().multiplyScalar(Math.sin((1 - t) * ang) / s)
      .add(b.clone().multiplyScalar(Math.sin(t * ang) / s));
  }
  const STEP = 0.012; // ~0.7° per vertex
  function buildPoints(r) {
    const nodes = r.path.map(toVec);
    const pts = [];
    let len = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1], ang = a.angleTo(b);
      const n = Math.max(2, Math.ceil(ang / STEP));
      for (let k = (i ? 1 : 0); k <= n; k++) {
        const t = k / n, u = slerp(a, b, t);
        let rad = SURFACE_R;
        if (r.mode === 'air') rad += Math.min(AIR_MAX_H, 0.06 + ang * 0.16) * Math.sin(Math.PI * t);
        pts.push(u.multiplyScalar(rad));
      }
      len += ang;
    }
    return { pts, len };
  }
  /* Trail = tube whose fragment shader shows only [head - len, head] along the path (uv.x),
     alpha ramps 0.10 (tail) → 1.0 (head). No static base line, no head dot. */
  const RADIAL = 6;
  const TRAIL_R = 0.011, CASING_R = 0.0175;
  const trailVS = 'varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
  const trailFS = 'uniform vec3 uColor; uniform float uHead, uLen, uFade, uMax; varying float vU;' +
    'void main(){ float t = (vU - (uHead - uLen)) / uLen; if (t < 0.0 || t > 1.0) discard;' +
    ' gl_FragColor = vec4(uColor, mix(0.10, 1.0, t) * uMax * uFade); }';
  function trailMaterial(color, max) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uHead: { value: 0 }, uLen: { value: 0.2 }, uFade: { value: 0 }, uMax: { value: max } },
      vertexShader: trailVS, fragmentShader: trailFS, transparent: true, depthWrite: false, depthTest: true,
    });
  }
  function makeTrail(r) {
    const cfg = MODE_CFG[r.mode];
    const { pts, len } = buildPoints(r);
    const curve = new THREE.CatmullRomCurve3(pts);
    const segs = pts.length - 1;
    const geo = new THREE.TubeGeometry(curve, segs, TRAIL_R, RADIAL, false);
    const mat = trailMaterial(cfg.color, 1.0);
    const mesh = new THREE.Mesh(geo, mat); mesh.renderOrder = 4;
    // white casing only around the moving trail (readability of Road on dark land)
    const cgeo = new THREE.TubeGeometry(curve, segs, CASING_R, RADIAL, false);
    const cmat = trailMaterial(0xFFFFFF, 0.55);
    const casing = new THREE.Mesh(cgeo, cmat); casing.renderOrder = 3;
    return { mesh, casing, mats: [mat, cmat], cfg, len, duration: len / cfg.speed + 0.6 };
  }
  function disposeTrail(t) {
    globeOverlay.remove(t.mesh); globeOverlay.remove(t.casing);
    t.mesh.geometry.dispose(); t.casing.geometry.dispose(); t.mats.forEach(m => m.dispose());
  }

  const routes = [];
  const surfacePool = [];
  const AIR_POOL = CITIES.filter(c => !c.hub).map(c => c.name);
  if (!REDUCED) {   // reduced motion: no routes at all (static globe + city markers only)
    // all surface trails are built once and reused; slots only toggle them (no per-trip allocation)
    ROUTES.forEach(r => {
      const t = makeTrail(r);
      t.active = false; t.mesh.visible = t.casing.visible = false;
      globeOverlay.add(t.casing); globeOverlay.add(t.mesh);
      surfacePool.push(t);
    });
    for (let i = 0; i < SURFACE_SLOTS; i++) routes.push({ surface: true, delay: i * 0.35, cur: null, start: 0 });
    AIR_SLOTS.forEach(delay => routes.push({ air: true, delay, cur: null, start: delay }));
  }
  function newSurfaceTrip(rt, now) {
    if (rt.cur) { rt.cur.active = false; rt.cur.mesh.visible = rt.cur.casing.visible = false; }
    const free = surfacePool.filter(t => !t.active);
    const t = free[Math.floor(Math.random() * free.length)];
    t.active = true; t.mesh.visible = t.casing.visible = true;
    rt.cur = t; rt.start = now;
  }

  function randomAirPath() {
    for (let k = 0; k < 50; k++) {
      const a = AIR_POOL[Math.floor(Math.random() * AIR_POOL.length)], b = AIR_POOL[Math.floor(Math.random() * AIR_POOL.length)];
      if (a === b) continue;
      const ang = toVec(a).angleTo(toVec(b));
      if (ang >= AIR_MIN_ANG && ang <= AIR_MAX_ANG) return [a, b];
    }
    return ['Frankfurt', 'Shanghai'];
  }
  function newAirTrip(rt, now) {
    if (rt.cur) disposeTrail(rt.cur);
    rt.cur = makeTrail({ mode: 'air', path: randomAirPath() });
    globeOverlay.add(rt.cur.casing); globeOverlay.add(rt.cur.mesh);
    rt.start = now;
  }

  const GAP = 1.2;
  function setTrail(t, cycle) {
    const p = Math.min(cycle / t.duration, 1);
    const fade = cycle > t.duration ? Math.max(0, 1 - (cycle - t.duration) / GAP) : 1;
    t.mats.forEach(m => { m.uniforms.uHead.value = p; m.uniforms.uLen.value = t.cfg.trail; m.uniforms.uFade.value = fade; });
  }
  function updateRoute(rt, clock) {
    if (clock < rt.delay) return;
    if (!rt.cur || clock - rt.start > rt.cur.duration + GAP) (rt.air ? newAirTrip : newSurfaceTrip)(rt, clock);
    setTrail(rt.cur, clock - rt.start);
  }

  /* ── Mouse drag ── */
  let drag = false, prevM = {x:0,y:0}, vx = 0, vy = 0, autoRot = true;
  /* Debug/review: ?globe=lat,lng faces that point and holds the view (no auto-rotate). */
  let viewLock = false;
  const vq = new URLSearchParams(location.search).get('globe');
  if (vq && /^-?[\d.]+,-?[\d.]+$/.test(vq)) {
    const [vlat, vlng] = vq.split(',').map(Number);
    globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, vlat * Math.PI / 180));
    globeGroup.rotation.y = Math.PI / 2 - (vlng + 180) * Math.PI / 180;
    viewLock = true;
  }
  canvas.addEventListener('mousedown', e => { drag=true; autoRot=false; prevM={x:e.clientX,y:e.clientY}; vx=vy=0; });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    vx=(e.clientX-prevM.x)*0.004; vy=(e.clientY-prevM.y)*0.004;
    globeGroup.rotation.y+=vx; globeGroup.rotation.x+=vy;
    globeGroup.rotation.x=Math.max(-1.1,Math.min(1.1,globeGroup.rotation.x));
    prevM={x:e.clientX,y:e.clientY};
  });
  window.addEventListener('mouseup', () => { drag=false; });

  /* ── City labels ── */
  const labelsEl = document.getElementById('globe-labels');
  let labelW = W, labelH = H;
  function updateLabels() {
    if (!labelsEl) return;
    labelsEl.innerHTML = '';
    CITIES.forEach(city => {
      if (city.hub) return;
      const p3 = ll2v(city.lat, city.lng, R + 0.022);
      const wP = p3.clone().applyMatrix4(globeGroup.matrixWorld);
      const face = wP.clone().normalize().dot(camera.position.clone().normalize());
      if (face < 0.18) return;
      const sc = wP.project(camera);
      const x = (sc.x+1)/2*labelW, y = (1-(sc.y+1)/2)*labelH;
      const el = document.createElement('div');
      el.className = 'globe-city-label';
      el.style.cssText = `left:${x}px;top:${y}px;opacity:${Math.min(1,(face-0.18)/0.25)}`;
      el.innerHTML = `<span class="globe-city-name">${city.name}</span>`;
      labelsEl.appendChild(el);
    });
  }

  /* ── Animate ── */
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;
    if (!drag) {
      if (!autoRot && Math.abs(vx)<0.0002 && Math.abs(vy)<0.0002) autoRot=true;
      if (autoRot && !REDUCED && !viewLock) { globeGroup.rotation.y += 0.0016; }
      else { vx*=0.94; vy*=0.94; globeGroup.rotation.y+=vx; globeGroup.rotation.x+=vy; globeGroup.rotation.x=Math.max(-1.1,Math.min(1.1,globeGroup.rotation.x)); }
    }
    cityMeshes.forEach(c => {
      const wp = c.pos.clone().applyMatrix4(globeGroup.matrixWorld);
      const vis = facingDot(wp) > 0;
      c.pulse.visible = vis;
      if (vis) {
        const s = 1 + 0.5 * Math.sin(clock * 1.9 + c.phase);
        c.pulseMat.opacity = 0.12 + 0.16 * Math.abs(Math.sin(clock * 1.9 + c.phase));
        c.pulse.scale.setScalar(s);
      }
    });
    routes.forEach(rt => updateRoute(rt, clock));
    updateLabels();
    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize: keep drawing buffer, CSS size and camera aspect in sync (no stretching) ── */
  function onResize() {
    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    const w = wrapper.clientWidth, h = wrapper.clientHeight || w;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);      // CSS (100%/100%) controls display size
    camera.aspect = w / h;
    // if the box is ever taller than wide, widen vertical fov so the frame sphere still fits horizontally
    const halfH = Math.atan(Math.tan(FOV / 2 * Math.PI / 180) / Math.min(1, camera.aspect));
    camera.fov = 2 * halfH * 180 / Math.PI;
    camera.updateProjectionMatrix();
    labelW = w; labelH = h;
  }
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(canvas.parentElement);
  onResize();
})();
