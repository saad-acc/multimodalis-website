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

  const CITIES = [
    { name:'Frankfurt',  lat: 50.1, lng:  8.7  }, // 0
    { name:'Dubai',      lat: 25.2, lng: 55.3  }, // 1
    { name:'Shanghai',   lat: 31.2, lng:121.5  }, // 2
    { name:'Singapore',  lat:  1.3, lng:103.8  }, // 3
    { name:'Chicago',    lat: 41.9, lng:-87.6  }, // 4
    { name:'São Paulo',  lat:-23.5, lng:-46.6  }, // 5
    { name:'Mumbai',     lat: 19.1, lng: 72.9  }, // 6
    { name:'Nairobi',    lat: -1.3, lng: 36.8  }, // 7
    { name:'Tokyo',      lat: 35.7, lng:139.7  }, // 8
    { name:'London',     lat: 51.5, lng: -0.1  }, // 9
    { name:'New York',   lat: 40.7, lng:-74.0  }, // 10
    { name:'Hong Kong',  lat: 22.3, lng:114.2  }, // 11
    { name:'Rotterdam',  lat: 51.9, lng:  4.5  }, // 12
    { name:'Los Angeles',lat: 34.0, lng:-118.2 }, // 13
    { name:'Hamburg',    lat: 53.5, lng: 10.0  }, // 14
    { name:'Warsaw',     lat: 52.2, lng: 21.0  }, // 15
    { name:'Chengdu',    lat: 30.6, lng:104.1  }, // 16
    { name:'Istanbul',   lat: 41.0, lng: 29.0  }, // 17
  ];

  const ROUTES = [
    { mode:'air',   from: 0, to: 2,  delay: 0.0 },
    { mode:'air',   from: 9, to:10,  delay: 1.2 },
    { mode:'air',   from: 1, to: 3,  delay: 2.4 },
    { mode:'air',   from:10, to:13,  delay: 0.6 },
    { mode:'air',   from: 2, to: 8,  delay: 3.1 },
    { mode:'air',   from: 0, to: 1,  delay: 4.2 },
    { mode:'air',   from: 3, to:11,  delay: 5.0 },
    { mode:'ocean', from:12, to:13,  delay: 0.8 },
    { mode:'ocean', from: 9, to: 5,  delay: 2.0 },
    { mode:'ocean', from: 2, to:13,  delay: 3.5 },
    { mode:'ocean', from:12, to:10,  delay: 5.5 },
    { mode:'ocean', from: 3, to: 6,  delay: 7.0 },
    { mode:'ocean', from: 7, to:12,  delay: 1.5 },
    { mode:'rail',  from:14, to:16,  delay: 0.3 },
    { mode:'rail',  from: 0, to:17,  delay: 1.8 },
    { mode:'rail',  from:15, to: 2,  delay: 3.0 },
    { mode:'rail',  from:17, to: 1,  delay: 4.5 },
    { mode:'road',  from: 9, to: 0,  delay: 0.5 },
    { mode:'road',  from: 0, to:14,  delay: 1.4 },
    { mode:'road',  from:17, to:15,  delay: 2.6 },
    { mode:'road',  from: 4, to:10,  delay: 3.8 },
  ];

  const MODE_CFG = {
    air:   { color: 0x037AE2, height: 0.38, duration: 2.8, trailLen: 22 },
    ocean: { color: 0x0294AB, height: 0.48, duration: 6.0, trailLen: 18 },
    rail:  { color: 0xD11767, height: 0.14, duration: 4.0, trailLen: 14 },
    road:  { color: 0x455161, height: 0.05, duration: 2.2, trailLen: 10 },
  };

  /* ── Renderer + scene ── */
  const W = 540, H = 540;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.65;
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

  /* ── Route arcs (overlay — above world map) ── */
  function buildRoute(r) {
    const cfg   = MODE_CFG[r.mode];
    const from  = CITIES[r.from], to = CITIES[r.to];
    const start = ll2v(from.lat, from.lng, R + 0.012);
    const end   = ll2v(to.lat,   to.lng,   R + 0.012);
    const mid   = start.clone().add(end).normalize().multiplyScalar(R + cfg.height);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts   = curve.getPoints(120);
    const geo   = new THREE.BufferGeometry().setFromPoints(pts);
    const mat   = new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0, depthTest: true });
    const line  = new THREE.Line(geo, mat);
    line.renderOrder = 2;
    globeOverlay.add(line);
    return { line, pts, mat, cfg,
             delay: r.delay, duration: cfg.duration + (Math.random()-0.5)*0.6 };
  }

  const arcs = ROUTES.map(buildRoute);

  /* ── Arc animation (front face only) ── */
  function updateArc(arc, clock) {
    if (REDUCED) { clock = arc.delay + arc.duration * 0.5; }
    const elapsed = clock - arc.delay;
    if (elapsed < 0) { arc.mat.opacity = 0; return; }
    const cycle    = elapsed % (arc.duration + 0.8);
    const progress = Math.min(cycle / arc.duration, 1);
    const total    = arc.pts.length;
    const headIdx  = Math.floor(progress * (total - 1));
    const tailIdx  = Math.max(0, headIdx - arc.cfg.trailLen);
    const raw = arc.pts.slice(tailIdx, headIdx + 1);
    const visible = raw.filter(pt => {
      const wp = pt.clone().applyMatrix4(globeGroup.matrixWorld);
      return facingDot(wp) > -0.05;
    });
    if (visible.length >= 2) {
      arc.line.geometry.setFromPoints(visible);
      arc.line.geometry.attributes.position.needsUpdate = true;
    } else {
      arc.line.geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      arc.line.geometry.attributes.position.needsUpdate = true;
    }
    const fadeIn  = Math.min(progress / 0.12, 1);
    const fadeOut = Math.max(0, 1 - (progress - 0.88) / 0.12);
    arc.mat.opacity = visible.length >= 2 ? 0.80 * Math.min(fadeIn, fadeOut) : 0;
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
    arcs.forEach(arc => updateArc(arc, clock));
    updateLabels();
    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ── */
  function onResize() {
    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    const sz = wrapper.offsetWidth;
    renderer.setSize(sz, sz);
    labelW = sz; labelH = sz;
  }
  window.addEventListener('resize', onResize);
  onResize();
})();
