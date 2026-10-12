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

  /* Route endpoints (labelled). Real coordinates of well-known ports / airports / rail hubs.
     Decorative only: no claim that Multimodalis runs these lanes. */
  const CITIES = [
    { name:'Rotterdam',   lat: 51.95, lng:   4.14 }, // 0  port
    { name:'Hamburg',     lat: 53.54, lng:   9.97 }, // 1  port / rail hub
    { name:'Frankfurt',   lat: 50.03, lng:   8.57 }, // 2  FRA airport
    { name:'Duisburg',    lat: 51.43, lng:   6.76 }, // 3  inland port / rail hub
    { name:'Chengdu',     lat: 30.66, lng: 104.07 }, // 4  rail hub
    { name:'Singapore',   lat:  1.26, lng: 103.82 }, // 5  port
    { name:'Shanghai',    lat: 30.63, lng: 122.06 }, // 6  Yangshan port
    { name:'Los Angeles', lat: 33.74, lng:-118.27 }, // 7  port of LA
    { name:'New York',    lat: 40.64, lng: -73.78 }, // 8  JFK
    { name:'Chicago',     lat: 41.88, lng: -87.63 }, // 9  rail hub
    { name:'Dubai',       lat: 25.25, lng:  55.36 }, // 10 DXB
    { name:'Milan',       lat: 45.46, lng:   9.19 }, // 11
    { name:'Istanbul',    lat: 41.01, lng:  28.98 }, // 12
    { name:'Warsaw',      lat: 52.23, lng:  21.01 }, // 13
    { name:'Santos',      lat:-23.96, lng: -46.33 }, // 14 port
    { name:'Tokyo',       lat: 35.55, lng: 139.78 }, // 15 HND
    { name:'Hong Kong',   lat: 22.31, lng: 113.92 }, // 16 HKG
  ];

  /* Surface routes use unlabelled waypoints so sea lanes stay on water and
     road/rail lanes stay on land. Air routes are a single arc. */
  const ROUTES = [
    // Sea — Rotterdam → Singapore via Channel, Gibraltar, Suez, Bab-el-Mandeb, Sri Lanka
    { mode:'sea', path:[0,[50.0,-1.5],[48.5,-6.5],[43.0,-10.0],[36.0,-6.5],[36.0,-5.4],[37.3,11.0],[33.0,25.0],[31.3,32.3],[27.5,33.9],[20.0,38.5],[12.6,43.4],[12.0,51.0],[8.0,60.0],[5.6,80.6],[6.0,95.0],5], delay:0.0 },
    // Sea — Shanghai → Los Angeles (North Pacific)
    { mode:'sea', path:[6,[33.0,140.0],[42.0,165.0],[44.0,-170.0],[40.0,-140.0],7], delay:2.2 },
    // Sea — Rotterdam → New York (via Channel, North Atlantic)
    { mode:'sea', path:[0,[50.0,-1.5],[49.5,-6.0],[41.5,-50.0],[40.3,-72.0],[40.6,-73.9]], delay:4.0 },
    // Sea — Santos → Rotterdam
    { mode:'sea', path:[14,[-20.0,-38.0],[-5.0,-33.0],[15.0,-27.0],[38.0,-14.0],[43.5,-10.5],[48.5,-6.5],[50.0,-1.5],0], delay:6.0 },
    // Rail — Duisburg → Chengdu (Europe–China land bridge, indicative)
    { mode:'rail', path:[3,13,[52.08,23.66],[53.90,27.56],[55.75,37.62],[55.16,61.40],[51.17,71.45],[45.20,82.40],[43.83,87.62],[36.06,103.83],4], delay:0.6 },
    // Rail — Hamburg → Milan (via Munich, Brenner, Verona)
    { mode:'rail', path:[1,[52.37,9.73],[50.11,8.68],[48.14,11.58],[47.00,11.50],[45.44,10.99],11], delay:2.8 },
    // Rail — Chicago → Los Angeles
    { mode:'rail', path:[9,[39.10,-94.58],[35.08,-106.65],[35.20,-111.65],[34.90,-117.02],7], delay:4.6 },
    // Road — Rotterdam → Frankfurt → Milan
    { mode:'road', path:[0,[51.23,6.78],[50.94,6.96],2,[48.78,9.18],[47.56,7.59],[46.0,8.95],11], delay:1.2 },
    // Road — Istanbul → Warsaw (via Sofia, Bucharest, Budapest, Kraków)
    { mode:'road', path:[12,[42.70,23.32],[44.43,26.10],[45.75,21.23],[47.50,19.04],[50.06,19.94],13], delay:3.4 },
    // Road — Chicago → New York
    { mode:'road', path:[9,[41.50,-81.69],[40.44,-79.99],[40.27,-76.88],8], delay:5.2 },
    // Air
    { mode:'air', path:[2,6],  delay:0.3 },
    { mode:'air', path:[2,8],  delay:1.8 },
    { mode:'air', path:[10,5], delay:3.0 },
    { mode:'air', path:[16,7], delay:4.2 },
    { mode:'air', path:[15,9], delay:5.6 },
    { mode:'air', path:[2,10], delay:6.8 },
  ];

  /* Brand mode colors (tokens.json color.brand.*). speed = radians of arc per second. */
  const MODE_CFG = {
    air:  { color: 0x037AE2, speed: 0.95, trail: 0.22 },
    sea:  { color: 0x0294AB, speed: 0.38, trail: 0.16 },
    rail: { color: 0xD11767, speed: 0.42, trail: 0.16 },
    road: { color: 0x455161, speed: 0.30, trail: 0.20 },
  };
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
    const c = typeof p === 'number' ? CITIES[p] : { lat: p[0], lng: p[1] };
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
  const headGeo = new THREE.SphereGeometry(0.024, 12, 10);
  const RADIAL = 6, IDX_PER_SEG = RADIAL * 6;
  function tube(curve, segs, radius) {
    return new THREE.TubeGeometry(curve, segs, radius, RADIAL, false);
  }
  function buildRoute(r) {
    const cfg = MODE_CFG[r.mode];
    const { pts, len } = buildPoints(r);
    const curve = new THREE.CatmullRomCurve3(pts);
    const segs = pts.length - 1;
    // faint full lane (light casing + colored core) — WebGL ignores line widths, so use thin tubes
    const casing = new THREE.Mesh(tube(curve, segs, 0.0104),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: REDUCED ? 0.8 : 0.45, depthWrite: false }));
    casing.renderOrder = 2;
    globeOverlay.add(casing);
    const baseMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: REDUCED ? 0.9 : 0.45, depthWrite: false });
    const base = new THREE.Mesh(tube(curve, segs, 0.0056), baseMat);
    base.renderOrder = 2;
    globeOverlay.add(base);
    const route = { pts, n: pts.length, segs, cfg, delay: r.delay, duration: len / cfg.speed + 0.6 };
    if (REDUCED) return route;
    // travelling comet: brighter, thicker tube revealed with an index draw range + head dot
    const trailMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 1, depthWrite: false });
    const trail = new THREE.Mesh(tube(curve, segs, 0.011), trailMat);
    trail.renderOrder = 3;
    trail.geometry.setDrawRange(0, 0);
    globeOverlay.add(trail);
    const headMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.renderOrder = 3;
    head.visible = false;
    globeOverlay.add(head);
    Object.assign(route, { trail, trailMat, head, headMat });
    return route;
  }
  const routes = ROUTES.map(buildRoute);

  function updateRoute(rt, clock) {
    if (REDUCED) return;
    const elapsed = clock - rt.delay;
    if (elapsed < 0) { rt.head.visible = false; rt.trail.geometry.setDrawRange(0, 0); return; }
    const cycle = elapsed % (rt.duration + 1.2);
    const p = Math.min(cycle / rt.duration, 1);           // head progress 0..1
    const trailN = Math.max(3, Math.round(rt.cfg.trail * rt.segs));
    const headIdx = Math.round(p * rt.segs);
    const tailIdx = Math.max(0, headIdx - trailN);
    rt.trail.geometry.setDrawRange(tailIdx * IDX_PER_SEG, (headIdx - tailIdx) * IDX_PER_SEG);
    const fade = cycle > rt.duration ? Math.max(0, 1 - (cycle - rt.duration) / 1.2) : 1;
    rt.trailMat.opacity = 0.95 * fade;
    rt.head.visible = p < 1;
    rt.head.position.copy(rt.pts[headIdx]);
  }

  /* ── Mouse drag ── */
  let drag = false, prevM = {x:0,y:0}, vx = 0, vy = 0, autoRot = true;
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
      if (autoRot && !REDUCED) { globeGroup.rotation.y += 0.0016; }
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
