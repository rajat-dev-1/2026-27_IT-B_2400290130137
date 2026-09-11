import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   CodeHealth AI — Hero Background Animation (1:1 Exact Match to Reference Video)
   Reference: https://cdn.collectui.com/amplify_video/2094429816816562176/vid/avc1/1440x1080/XW-P0oNGs3ubVaQK-optimized.mp4

   Motion & Visual Anatomy (Confirmed Frame-by-Frame from Video):
   1. The 3D torus mesh DOES NOT revolve around like a globe/turntable!
      It stays oriented facing the viewer with a gentle, hypnotic 3D floating hover.
   2. What MOVES dynamically is the COMBUSTION & ELECTRICAL ENERGY SURGE:
      The incandescent white-hot combustion flare circulates along the torus ring!
   3. As the combustion wave travels around the ring:
      - Wires within proximity ignite into blazing incandescent white-hot filaments and golden halos
      - Translucent triangular heat sheets burst with radiant fire
      - Trailing behind the combustion flare, golden bokeh beads and glowing ruby-red embers line the inner rim
      - Once the wave passes, wires and nodes cool back into crisp, dense dark charcoal/black
   4. The dark smoke forms a swirling, billowing vortex collar inside the inner central eye
   5. Clean studio lighting background with delicate concentric hairline guide rings
───────────────────────────────────────────────────────────────────────────── */

/* Procedural 3D wireframe torus with crystalline faceted topology */
function buildReferenceTorusMesh(nodeCount) {
  const pts = [];

  for (let i = 0; i < nodeCount; i++) {
    const u = (i / nodeCount) * Math.PI * 2; // Angle around the main ring
    const v = (i * 9.873) % (Math.PI * 2);  // Angle around the tube cross-section

    // Major radius (ring diameter from center) with faceted organic modulation
    const rMajor = 0.65 +
      0.065 * Math.sin(3 * u) +
      0.045 * Math.cos(5 * u) +
      0.025 * Math.sin(8 * u) +
      0.018 * Math.cos(13 * u);

    // Minor radius (tube thickness: keeps center eye open and outer boundary bounded)
    const rMinor = 0.28 +
      0.055 * Math.sin(2 * u + 3 * v) +
      0.035 * Math.cos(4 * v) +
      0.020 * Math.sin(7 * v);

    // 3D Cartesian coordinates
    let x = (rMajor + rMinor * Math.cos(v)) * Math.cos(u);
    let y = (rMajor + rMinor * Math.cos(v)) * Math.sin(u);
    let z = rMinor * Math.sin(v) * 1.30;

    // Organic crystalline displacement noise (creates the jagged faceted silhouette)
    const jaggedNoise = 0.042 * Math.sin(i * 13.7) + 0.025 * Math.cos(i * 7.9);
    x += jaggedNoise * Math.cos(i * 2.1);
    y += jaggedNoise * Math.sin(i * 2.1);
    z += jaggedNoise * Math.cos(i * 4.3);

    // 2D polar angle
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += Math.PI * 2;

    const distFromCenter = Math.sqrt(x * x + y * y);
    const isInnerRim = distFromCenter < 0.58;
    const isOuterRim = distFromCenter > 0.72;

    pts.push({
      x, y, z,
      baseX: x, baseY: y, baseZ: z,
      u, v,
      angle,
      isInnerRim,
      isOuterRim,
      distFromCenter,
      baseSize: 0.85 + (i % 4) * 0.40,
      flickerSpeed: 1.8 + (i % 9) * 0.35,
      flickerPhase: (i * 1.618) % (Math.PI * 2),
      dynamicHeat: 0,
      wakeIntensity: 0,
    });
  }

  // Interconnect nearby nodes into a dense, intricate geometric wireframe network
  const edges = [];
  const threshold = 0.315;
  const t2 = threshold * threshold;

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dz = pts[i].z - pts[j].z;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < t2) {
        edges.push({
          from: i,
          to: j,
          len: Math.sqrt(d2),
        });
      }
    }
  }

  edges.sort((a, b) => a.len - b.len);
  // High edge density matching the dense bird's-nest wire lattice
  const maxEdges = Math.min(edges.length, Math.floor(nodeCount * 6.5));
  const activeEdges = edges.slice(0, maxEdges);

  // Surface triangles for translucent burning flame facets
  const adj = Array.from({ length: pts.length }, () => new Set());
  for (const edge of activeEdges) {
    adj[edge.from].add(edge.to);
    adj[edge.to].add(edge.from);
  }

  const allTriangles = [];
  for (let i = 0; i < pts.length; i++) {
    const nbrs = Array.from(adj[i]);
    for (let j = 0; j < nbrs.length; j++) {
      const nj = nbrs[j];
      if (nj <= i) continue;
      for (let k = j + 1; k < nbrs.length; k++) {
        const nk = nbrs[k];
        if (nk <= nj) continue;
        if (adj[nj].has(nk)) {
          allTriangles.push({ p1: i, p2: nj, p3: nk });
        }
      }
    }
  }

  // Internal smoke patches: tightly hugging the inner rim vortex across 360 degrees
  const internalSmokePatches = [];
  const smokeCount = 48;
  for (let i = 0; i < smokeCount; i++) {
    const u = (i / smokeCount) * Math.PI * 2;
    const radOffset = 0.37 + 0.08 * Math.sin(i * 3.7);
    const alpha = (u >= 1.2 && u <= 4.8) ? 0.22 : 0.14;

    internalSmokePatches.push({
      baseU: u,
      radOffset,
      size: 0.062 + (i % 4) * 0.016,
      alpha,
      speed: 0.035 + (i % 3) * 0.012,
      phase: i * 0.75,
    });
  }

  return {
    pts,
    edges: activeEdges,
    triangles: allTriangles,
    internalSmokePatches,
  };
}

/* 3D perspective projection */
function projectPoint(px, py, pz, rx, ry, rz, radius, fov, cx, cy) {
  // Y-axis rotation
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  let x1 = px * cosY + pz * sinY;
  let z1 = -px * sinY + pz * cosY;

  // X-axis rotation
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  let y2 = py * cosX - z1 * sinX;
  let z2 = py * sinX + z1 * cosX;

  // Z-axis rotation
  const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
  let x3 = x1 * cosZ - y2 * sinZ;
  let y3 = x1 * sinZ + y2 * cosZ;

  const depth = z2 + fov;
  const s = radius / depth;
  return {
    sx: cx + x3 * s,
    sy: cy - y3 * s,
    z: z2,
    d: Math.max(0, Math.min(1, (z2 + 1.2) / 2.4)),
  };
}

export default function CanvasNeuralMesh({
  bgColor = '#EBE8E3',
  centerX = null,
  centerY = null,
  radiusScale = null,
}) {
  const canvasRef = useRef(null);

  const initData = useCallback((width) => {
    // 480 nodes on desktop for dense geometric network, 240 on mobile
    const count = width < 768 ? 240 : 480;
    return buildReferenceTorusMesh(count);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    let geo = initData(W);

    let time = 0;
    let lastTime = performance.now();
    let animId = null;
    let paused = false;
    let isIntersecting = true;

    // Viewport intersection observer: pauses when hero is off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);

    // Tab visibility handling
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    // Debounced resize observer
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newW = canvas.offsetWidth;
        const newH = canvas.offsetHeight;
        if (newW !== W || newH !== H) {
          W = newW;
          H = newH;
          canvas.width = W;
          canvas.height = H;
          geo = initData(W);
        }
      }, 90);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ─────────────────────────────────────────────────────────────────
       Main Render Loop: Matches Video Motion 1:1
       (Torus stays facing viewer; combustion energy circulates around ring)
    ───────────────────────────────────────────────────────────────── */
    function render(currentTimestamp) {
      if (!isIntersecting || paused || W === 0 || H === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const now = currentTimestamp || performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!prefersReduced) {
        time += dt;
      }

      // ── 1. Orientation: Mesh stays facing the viewer with hypnotic floating hover (NO turntable spin!) ──
      const rotX = 0.14 + (prefersReduced ? 0 : Math.sin(time * 0.35) * 0.022);
      const rotY = prefersReduced ? 0 : Math.cos(time * 0.28) * 0.028;
      const rotZ = -0.04 + (prefersReduced ? 0 : Math.sin(time * 0.22) * 0.018);

      // Responsive positioning: centered composition across desktop & tablet, positioned behind headline on mobile
      const isMobile = W < 768;
      const isPortraitTablet = W >= 768 && W < 1024 && H > W;
      const effectiveCX = centerX !== null ? centerX : 0.50;
      const effectiveCY = centerY !== null ? centerY : (isMobile ? 0.36 : (isPortraitTablet ? 0.48 : 0.50));
      const effectiveRadiusScale = radiusScale !== null ? radiusScale : (isMobile ? 0.44 : (isPortraitTablet ? 0.52 : 0.62));

      const meshCX = W * effectiveCX;
      const meshCY = H * effectiveCY;
      const breathe = prefersReduced ? 1.0 : (1.0 + 0.015 * Math.sin(time * 0.30));
      const radius = Math.min(W, H) * effectiveRadiusScale * breathe;
      const fov = 2.8;

      /* ── 2. Base Neutral Background Fill with Studio Lighting ── */
      const bgGrad = ctx.createRadialGradient(meshCX, meshCY, radius * 0.15, meshCX, meshCY, Math.max(W, H) * 0.95);
      bgGrad.addColorStop(0, '#EDEAE5');
      bgGrad.addColorStop(0.55, '#E5E2DC');
      bgGrad.addColorStop(1.0, '#DDD9D2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      /* ── 3. Architectural Concentric Guide Rings ── */
      ctx.lineWidth = 0.75;
      const guideScales = [0.48, 0.78, 1.10, 1.42];
      for (let i = 0; i < guideScales.length; i++) {
        const ringR = radius * guideScales[i];
        const alpha = (0.09 * (1 - i * 0.22)).toFixed(3);
        ctx.beginPath();
        ctx.arc(meshCX, meshCY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 105, 96, ${alpha})`;
        ctx.stroke();
      }

      /* ── 4. Calculate Dynamic Circulating Combustion Flares ── */
      // Primary combustion flare circulating counter-clockwise around the ring (~18s full cycle)
      // At t = 0, starts at ~4:30 (5.42 rad) matching the reference screenshot exactly!
      const f1Speed = prefersReduced ? 0 : 0.32; // rad/s
      const flare1Angle = (5.42 - time * f1Speed) % (Math.PI * 2);
      const f1u = (flare1Angle + Math.PI * 2) % (Math.PI * 2);
      const f1rMajor = 0.65 + 0.065 * Math.sin(3 * f1u) + 0.045 * Math.cos(5 * f1u);
      const f1rMinor = 0.28;
      const f1x = (f1rMajor + f1rMinor * Math.cos(0.4)) * Math.cos(f1u);
      const f1y = (f1rMajor + f1rMinor * Math.cos(0.4)) * Math.sin(f1u);
      const f1z = f1rMinor * Math.sin(0.4) * 1.30;

      // Secondary combustion flare follows with ~2.5 rad offset (~2:00 at t=0)
      const flare2Angle = (flare1Angle + 2.5) % (Math.PI * 2);
      const f2u = (flare2Angle + Math.PI * 2) % (Math.PI * 2);
      const f2rMajor = 0.65 + 0.065 * Math.sin(3 * f2u);
      const f2rMinor = 0.26;
      const f2x = (f2rMajor + f2rMinor * Math.cos(-0.4)) * Math.cos(f2u);
      const f2y = (f2rMajor + f2rMinor * Math.cos(-0.4)) * Math.sin(f2u);
      const f2z = f2rMinor * Math.sin(-0.4) * 1.30;

      /* ── 5. Dynamic Vertex Undulation & Heat Calculations ── */
      for (let i = 0; i < geo.pts.length; i++) {
        const p = geo.pts[i];

        // Organic vertex breathing/undulation
        const undulate = prefersReduced ? 0 : 0.014 * Math.sin(time * 1.8 + p.u * 3 + p.v * 2);
        p.x = p.baseX + (p.baseX / p.distFromCenter) * undulate;
        p.y = p.baseY + (p.baseY / p.distFromCenter) * undulate;
        p.z = p.baseZ + undulate;

        // Proximity to circulating flares
        const dx1 = p.x - f1x, dy1 = p.y - f1y, dz1 = p.z - f1z;
        const d1 = Math.sqrt(dx1 * dx1 * 1.6 + dy1 * dy1 * 1.6 + dz1 * dz1 * 1.4);

        const dx2 = p.x - f2x, dy2 = p.y - f2y, dz2 = p.z - f2z;
        const d2 = Math.sqrt(dx2 * dx2 * 1.6 + dy2 * dy2 * 1.6 + dz2 * dz2 * 1.4);

        const h1 = Math.max(0, 1 - d1 / 0.44);
        const h2 = Math.max(0, 1 - d2 / 0.32) * 0.75;
        p.dynamicHeat = Math.min(1.0, h1 + h2);

        // Trailing wake calculation for golden beads and embers behind flare 1
        // In counter-clockwise circulation, wake is where angle is slightly ahead in positive direction
        const angleDiff = (p.angle - f1u + Math.PI * 2) % (Math.PI * 2);
        const inWake = (angleDiff >= 0.10 && angleDiff <= 1.70) && p.isInnerRim;
        p.wakeIntensity = inWake ? Math.max(0, 1 - (angleDiff - 0.10) / 1.60) : 0;
      }

      /* ── 6. Project 3D Torus Vertices ── */
      const projs = geo.pts.map(p =>
        projectPoint(p.x, p.y, p.z, rotX, rotY, rotZ, radius, fov, meshCX, meshCY)
      );

      /* ── 7. Internal Volumetric Smoke (Swirling inside the inner tunnel vortex) ── */
      for (const smk of geo.internalSmokePatches) {
        // Smoke gently swirls around the inner rim
        const swirlU = (smk.baseU - time * smk.speed) % (Math.PI * 2);
        const sX = Math.cos(swirlU) * smk.radOffset;
        const sY = Math.sin(swirlU) * smk.radOffset;
        const sPr = projectPoint(sX, sY, 0, rotX, rotY, rotZ, radius, fov, meshCX, meshCY);
        const sR = radius * smk.size;

        const sg = ctx.createRadialGradient(sPr.sx, sPr.sy, 0, sPr.sx, sPr.sy, sR);
        sg.addColorStop(0, `rgba(12, 10, 8, ${smk.alpha.toFixed(2)})`);
        sg.addColorStop(0.50, `rgba(18, 15, 12, ${(smk.alpha * 0.55).toFixed(2)})`);
        sg.addColorStop(1.0, 'rgba(18, 15, 12, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(sPr.sx, sPr.sy, sR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 8. Radiant Wire Facets at Active Combustion Flares ── */
      for (let tIdx = 0; tIdx < geo.triangles.length; tIdx++) {
        const tri = geo.triangles[tIdx];
        const h1 = geo.pts[tri.p1].dynamicHeat;
        const h2 = geo.pts[tri.p2].dynamicHeat;
        const h3 = geo.pts[tri.p3].dynamicHeat;
        const avgHeat = (h1 + h2 + h3) / 3;

        if (avgHeat > 0.32) {
          const p1 = projs[tri.p1];
          const p2 = projs[tri.p2];
          const p3 = projs[tri.p3];

          const pulse = prefersReduced ? 1.0 : (0.85 + 0.15 * Math.sin(time * 3.0 + tIdx));
          const intensity = Math.min(1.0, avgHeat * pulse);

          const tg = ctx.createLinearGradient(p1.sx, p1.sy, (p2.sx + p3.sx) * 0.5, (p2.sy + p3.sy) * 0.5);
          tg.addColorStop(0, `rgba(255, 255, 245, ${(intensity * 0.90).toFixed(2)})`);
          tg.addColorStop(0.30, `rgba(255, 215, 75, ${(intensity * 0.80).toFixed(2)})`);
          tg.addColorStop(0.70, `rgba(240, 120, 25, ${(intensity * 0.45).toFixed(2)})`);
          tg.addColorStop(1.0, 'rgba(210, 60, 15, 0)');

          ctx.fillStyle = tg;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* ── 9. Render Mesh Wireframe Lines (Crisp Charcoal Black + Dynamic Incandescent Wires) ── */
      for (let eIdx = 0; eIdx < geo.edges.length; eIdx++) {
        const edge = geo.edges[eIdx];
        const pa = projs[edge.from];
        const pb = projs[edge.to];
        const avgD = (pa.d + pb.d) * 0.5;

        const heatA = geo.pts[edge.from].dynamicHeat;
        const heatB = geo.pts[edge.to].dynamicHeat;
        const edgeHeat = (heatA + heatB) * 0.5;

        if (edgeHeat > 0.32) {
          // Dynamic Combustion Zone: Incandescent glowing white-hot wires with golden halo!
          const flicker = prefersReduced ? 1.0 : (0.88 + 0.12 * Math.sin(time * 3.5 + edge.len * 16));

          // Outer golden glow halo
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.strokeStyle = `rgba(255, 185, 45, ${(0.80 + edgeHeat * 0.20).toFixed(2)})`;
          ctx.lineWidth = 3.8 + avgD * 1.6;
          ctx.stroke();

          // Intense white-hot core wire line
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.strokeStyle = `rgba(255, 255, 250, ${(0.96 * flicker).toFixed(2)})`;
          ctx.lineWidth = 1.9 + avgD * 0.9;
          ctx.stroke();
        } else if (edgeHeat > 0.16) {
          // Warm amber transition wires
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          const a = (0.35 + avgD * 0.45).toFixed(2);
          ctx.strokeStyle = `rgba(235, 125, 30, ${a})`;
          ctx.lineWidth = 0.90 + avgD * 0.60;
          ctx.stroke();
        } else {
          // Dense, crisp, high-contrast charcoal/black wireframe everywhere else!
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          const a = (0.42 + avgD * 0.52).toFixed(2);
          ctx.strokeStyle = `rgba(14, 11, 9, ${a})`;
          ctx.lineWidth = 0.75 + avgD * 0.65;
          ctx.stroke();
        }
      }

      /* ── 10. Render Active Combustion Blooms ── */
      // Primary combustion bloom
      const f1Pr = projectPoint(f1x, f1y, f1z, rotX, rotY, rotZ, radius, fov, meshCX, meshCY);
      const b1Pulse = prefersReduced ? 1.0 : (0.88 + 0.12 * Math.sin(time * 3.8));
      const b1R = 68 * (0.85 + f1Pr.d * 0.35) * b1Pulse;

      const bg1 = ctx.createRadialGradient(f1Pr.sx, f1Pr.sy, 0, f1Pr.sx, f1Pr.sy, b1R);
      bg1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      bg1.addColorStop(0.14, 'rgba(255, 248, 180, 0.95)');
      bg1.addColorStop(0.36, 'rgba(255, 185, 45, 0.70)');
      bg1.addColorStop(0.68, 'rgba(230, 95, 20, 0.25)');
      bg1.addColorStop(1.0, 'rgba(200, 50, 15, 0)');
      ctx.fillStyle = bg1;
      ctx.beginPath();
      ctx.arc(f1Pr.sx, f1Pr.sy, b1R, 0, Math.PI * 2);
      ctx.fill();

      // Sharp secondary white burst at knot center
      const core1R = b1R * 0.32;
      const cbg1 = ctx.createRadialGradient(f1Pr.sx, f1Pr.sy, 0, f1Pr.sx, f1Pr.sy, core1R);
      cbg1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      cbg1.addColorStop(0.5, 'rgba(255, 250, 210, 0.90)');
      cbg1.addColorStop(1.0, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = cbg1;
      ctx.beginPath();
      ctx.arc(f1Pr.sx, f1Pr.sy, core1R, 0, Math.PI * 2);
      ctx.fill();

      // Secondary combustion bloom
      const f2Pr = projectPoint(f2x, f2y, f2z, rotX, rotY, rotZ, radius, fov, meshCX, meshCY);
      const b2Pulse = prefersReduced ? 1.0 : (0.85 + 0.15 * Math.sin(time * 3.2 + 1.2));
      const b2R = 38 * (0.80 + f2Pr.d * 0.35) * b2Pulse;

      const bg2 = ctx.createRadialGradient(f2Pr.sx, f2Pr.sy, 0, f2Pr.sx, f2Pr.sy, b2R);
      bg2.addColorStop(0, 'rgba(255, 255, 250, 0.95)');
      bg2.addColorStop(0.25, 'rgba(255, 235, 120, 0.80)');
      bg2.addColorStop(0.60, 'rgba(255, 160, 35, 0.40)');
      bg2.addColorStop(1.0, 'rgba(220, 70, 15, 0)');
      ctx.fillStyle = bg2;
      ctx.beginPath();
      ctx.arc(f2Pr.sx, f2Pr.sy, b2R, 0, Math.PI * 2);
      ctx.fill();

      /* ── 11. Render Dynamic Golden Beads & Embers Trailing in Wake ── */
      for (let i = 0; i < projs.length; i++) {
        const pr = projs[i];
        const node = geo.pts[i];
        const r = node.baseSize * (0.75 + pr.d * 0.95);

        if (node.dynamicHeat > 0.45) {
          // White-hot knot vertices
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
          ctx.fill();
        } else if (node.wakeIntensity > 0.50) {
          // Golden orbs / luminous beads in immediate wake along inner rim
          const pulse = prefersReduced ? 1.0 : (0.78 + 0.22 * Math.sin(time * 2.4 + i));
          const orbR = (6.0 + (i % 5) * 2.0) * pulse * (0.75 + pr.d * 0.55);
          const alpha = Math.min(1.0, node.wakeIntensity * 1.2);

          const og = ctx.createRadialGradient(pr.sx, pr.sy, 0, pr.sx, pr.sy, orbR * 1.35);
          og.addColorStop(0, `rgba(255, 255, 230, ${alpha.toFixed(2)})`);
          og.addColorStop(0.35, `rgba(255, 210, 75, ${(alpha * 0.88).toFixed(2)})`);
          og.addColorStop(0.75, `rgba(240, 130, 25, ${(alpha * 0.35).toFixed(2)})`);
          og.addColorStop(1.0, 'rgba(240, 130, 25, 0)');
          ctx.fillStyle = og;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, orbR * 1.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 250, 215, ${(alpha * 0.95).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, orbR * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (node.wakeIntensity > 0.15) {
          // Tangerine & ruby red embers further back in the wake
          const pulse = prefersReduced ? 1.0 : (0.75 + 0.25 * Math.sin(time * 2.8 + i));
          const isRuby = node.wakeIntensity < 0.32;
          const haloR = (isRuby ? 4.8 : 6.0) * pulse;

          const hg = ctx.createRadialGradient(pr.sx, pr.sy, 0, pr.sx, pr.sy, haloR);
          if (isRuby) {
            hg.addColorStop(0, `rgba(235, 45, 25, ${(0.65 * pulse).toFixed(2)})`);
            hg.addColorStop(1, 'rgba(180, 20, 15, 0)');
          } else {
            hg.addColorStop(0, `rgba(255, 130, 25, ${(0.70 * pulse).toFixed(2)})`);
            hg.addColorStop(1, 'rgba(210, 60, 10, 0)');
          }
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, haloR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isRuby ? `rgba(255, 65, 35, ${(0.95 * pulse).toFixed(2)})` : `rgba(255, 175, 45, ${(0.98 * pulse).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, r * 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Crisp, high-contrast dark charcoal/black nodes everywhere else
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, r * 0.95, 0, Math.PI * 2);
          const alpha = (0.42 + pr.d * 0.55).toFixed(2);
          ctx.fillStyle = `rgba(12, 9, 7, ${alpha})`;
          ctx.fill();
        }
      }

      if (!prefersReduced) {
        animId = requestAnimationFrame(render);
      }
    }

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      observer.disconnect();
    };
  }, [bgColor, centerX, centerY, radiusScale, initData]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
      }}
    />
  );
}
