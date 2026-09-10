import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   CodeHealth AI — Hero Background Animation (Reference-Exact Recreation)
   Recreates the exact visual from the reference video:
   1. Bounded 3D spherical neural wireframe cage with organic harmonic perturbation
   2. Faint concentric circular framing rings in clean neutral grey
   3. Dark, cavernous charcoal smoke haze in the hollow interior
   4. Molten Incandescent Core: Burning mesh triangles / flame sheets and glowing
      filaments woven through the center-lower hemisphere
   5. Rich Constellation of Ember Nodes: 70+ visible red, orange, and gold glowing
      dots attached directly to wire vertices and edges
   6. Foreground dark charcoal wireframe physically crossing in front of the fire
   7. Fine drifting sparks and embers in 3D convective drift
   8. Completely contained within the spherical boundary; zero outward bloom
───────────────────────────────────────────────────────────────────────────── */

/* Procedural 3D spherical neural network with combustion core */
function buildReferenceSphericalMesh(nodeCount) {
  const pts = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // 1. Generate nodes on a spherical shell with multi-layer depth
  for (let i = 0; i < nodeCount; i++) {
    const y0 = 1 - (i / (nodeCount - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y0 * y0));
    const theta = (2 * Math.PI * i) / goldenRatio;

    // Layering: 70% outer shell, 30% mid-interior
    const layer = (i % 3 === 0) ? (0.52 + 0.20 * Math.random()) : (0.76 + 0.20 * Math.random());

    // Harmonic perturbation for organic, non-uniform silhouette
    const perturb = 1.0 +
      0.10 * Math.sin(3 * theta + 2.5 * y0) +
      0.06 * Math.cos(5 * theta - 3.0 * y0) +
      0.04 * Math.sin(7 * theta);

    const r = layer * perturb;
    const x = Math.cos(theta) * radiusAtY * r;
    const y = y0 * r;
    const z = Math.sin(theta) * radiusAtY * r * 1.10;

    // Distance to combustion center in the lower-mid quadrant (y ~ -0.08, z ~ 0.12)
    const dy = y - (-0.08);
    const dz = z - 0.12;
    const dist = Math.sqrt(x * x * 0.9 + dy * dy * 1.8 + dz * dz * 1.2);

    // Linear normalized heat: 1.0 at core, gracefully dropping to 0 at perimeter
    const fireHeat = Math.max(0, Math.min(1, (1.05 - dist) / (1.05 - 0.28)));

    pts.push({
      x, y, z,
      baseSize: 0.8 + (i % 3) * 0.45,
      distFromCenter: Math.sqrt(x * x + y * y + z * z),
      fireHeat,
      flickerSpeed: 1.6 + (i % 7) * 0.4,
      flickerPhase: (i * 1.618) % (Math.PI * 2),
      edgeCount: 0,
    });
  }

  // 2. Interconnect nearby nodes into tangled wireframe cage
  const edges = [];
  const threshold = 0.33;
  const t2 = threshold * threshold;

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dz = pts[i].z - pts[j].z;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < t2) {
        const avgHeat = (pts[i].fireHeat + pts[j].fireHeat) * 0.5;
        edges.push({
          from: i,
          to: j,
          len: Math.sqrt(d2),
          avgHeat,
        });
      }
    }
  }

  edges.sort((a, b) => a.len - b.len);
  const maxEdges = Math.min(edges.length, Math.floor(nodeCount * 3.4));
  const activeEdges = edges.slice(0, maxEdges);

  for (const edge of activeEdges) {
    pts[edge.from].edgeCount++;
    pts[edge.to].edgeCount++;
  }

  // 3. Find Ignited Triangles (Mesh facets in the combustion core)
  // These form the incandescent, glowing magma facets seen in the reference video
  const adj = Array.from({ length: pts.length }, () => new Set());
  for (const edge of activeEdges) {
    adj[edge.from].add(edge.to);
    adj[edge.to].add(edge.from);
  }

  const fireTriangles = [];
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].fireHeat < 0.42) continue;
    const nbrs = Array.from(adj[i]);
    for (let j = 0; j < nbrs.length; j++) {
      const nj = nbrs[j];
      if (nj <= i || pts[nj].fireHeat < 0.38) continue;
      for (let k = j + 1; k < nbrs.length; k++) {
        const nk = nbrs[k];
        if (nk <= nj || pts[nk].fireHeat < 0.38) continue;
        if (adj[nj].has(nk)) {
          const avgHeat = (pts[i].fireHeat + pts[nj].fireHeat + pts[nk].fireHeat) / 3;
          fireTriangles.push({
            p1: i, p2: nj, p3: nk,
            heat: avgHeat,
            flickerSpeed: 1.8 + (fireTriangles.length % 5) * 0.4,
            flickerPhase: fireTriangles.length * 0.7,
          });
        }
      }
    }
  }

  // Sort by heat and pick the most intense core triangles (20–25 facets)
  fireTriangles.sort((a, b) => b.heat - a.heat);
  const coreFlameTriangles = fireTriangles.slice(0, 24);

  // 4. Fine drifting embers & sparks in the combustion zone
  const sparkCount = Math.round(nodeCount < 150 ? 35 : 65);
  const driftingSparks = Array.from({ length: sparkCount }, (_, i) => {
    const t = (Math.random() * 2 - 1) * 0.55;
    const radY = (Math.random() - 0.5) * 0.34;
    const radZ = (Math.random() - 0.5) * 0.28;

    const roll = Math.random();
    let rgb;
    if (roll < 0.30) {
      rgb = [255, 248, 220]; // Warm white-gold
    } else if (roll < 0.65) {
      rgb = [255, 170, 45];  // Amber
    } else if (roll < 0.88) {
      rgb = [235, 85, 25];   // Deep orange
    } else {
      rgb = [200, 45, 15];   // Ruby red
    }

    return {
      x: t,
      y: -0.06 + radY,
      z: radZ,
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      vz: (Math.random() - 0.5) * 0.002,
      size: 1.0 + Math.random() * 1.5,
      baseAlpha: 0.35 + Math.random() * 0.55,
      flickerSpeed: 1.5 + Math.random() * 2.5,
      flickerPhase: Math.random() * Math.PI * 2,
      rgb,
    };
  });

  // 5. Dark smoke haze patches for the hollow core cavity
  const smokePatches = Array.from({ length: 8 }, (_, i) => ({
    offsetAngle: (i / 8) * Math.PI * 2 + i * 0.35,
    offsetDist: 0.05 + (i % 3) * 0.04,
    radiusFactor: 0.34 + (i % 3) * 0.09,
    alpha: 0.35 + (i % 3) * 0.08,
    driftSpeed: 0.02 + (i % 4) * 0.006,
    driftPhase: i * 1.2,
  }));

  return {
    pts,
    edges: activeEdges,
    coreFlameTriangles,
    driftingSparks,
    smokePatches,
  };
}

/* 3D perspective projection */
function projectPoint(px, py, pz, rx, ry, radius, fov, cx, cy) {
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x1 = px * cosY + pz * sinY;
  const z1 = -px * sinY + pz * cosY;

  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y2 = py * cosX - z1 * sinX;
  const z2 = py * sinX + z1 * cosX;

  const depth = z2 + fov;
  const s = radius / depth;
  return {
    sx: cx + x1 * s,
    sy: cy - y2 * s,
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
    const count = width < 768 ? 130 : 240;
    return buildReferenceSphericalMesh(count);
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

    let rotX = 0.14;
    let rotY = 0;
    let time = 0;
    let lastTime = performance.now();
    let animId = null;
    let paused = false;
    let isIntersecting = true;

    // Viewport intersection observer: pauses when hero is scrolled past
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
       Main Render Loop: Reference-Exact Layered Combustion
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
        // Slow cinematic 3D rotation: ~90s full revolution
        rotY += dt * 0.070;
        rotX = 0.14 + Math.sin(time * 0.07) * 0.04;
      }

      // Responsive positioning: comfortable clearance from text on desktop, below text on mobile
      const effectiveCX = centerX !== null ? centerX : (W < 768 ? 0.50 : (W < 1400 ? 0.65 : 0.62));
      const effectiveCY = centerY !== null ? centerY : (W < 768 ? 0.72 : 0.50);
      const effectiveRadiusScale = radiusScale !== null ? radiusScale : (W < 768 ? 0.50 : (W < 1400 ? 0.60 : 0.66));

      const meshCX = W * effectiveCX;
      const meshCY = H * effectiveCY;
      const breathe = prefersReduced ? 1.0 : (1.0 + 0.016 * Math.sin(time * 0.28));
      const radius = Math.min(W, H) * effectiveRadiusScale * breathe;
      const fov = 2.8;

      /* ── 0. Base Neutral Background Fill ── */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      /* ── 1. Clean Concentric Circular Framing Rings (Untinted Neutral Grey) ── */
      ctx.lineWidth = 0.80;
      for (let i = 0; i < 4; i++) {
        const ringR = radius * (0.55 + i * 0.22);
        const alpha = (0.075 * (1 - i / 4.2)).toFixed(3);
        ctx.beginPath();
        ctx.arc(meshCX, meshCY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(130, 125, 115, ${alpha})`;
        ctx.stroke();
      }

      /* ── 2. Dark Smoky Core (Hollow Interior Occlusion Plume) ── */
      for (const patch of geo.smokePatches) {
        const driftX = prefersReduced ? 0 : Math.sin(time * patch.driftSpeed + patch.driftPhase) * radius * 0.04;
        const driftY = prefersReduced ? 0 : Math.cos(time * patch.driftSpeed * 1.2 + patch.driftPhase) * radius * 0.035;
        const pCX = meshCX + Math.cos(patch.offsetAngle) * patch.offsetDist * radius + driftX;
        const pCY = meshCY + Math.sin(patch.offsetAngle) * patch.offsetDist * radius + driftY;
        const pR = radius * patch.radiusFactor;

        const sg = ctx.createRadialGradient(pCX, pCY, 0, pCX, pCY, pR);
        sg.addColorStop(0, `rgba(14, 12, 10, ${patch.alpha.toFixed(2)})`);
        sg.addColorStop(0.55, `rgba(22, 19, 16, ${(patch.alpha * 0.65).toFixed(2)})`);
        sg.addColorStop(0.85, `rgba(32, 28, 24, ${(patch.alpha * 0.15).toFixed(2)})`);
        sg.addColorStop(1.0, 'rgba(32, 28, 24, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 3. Project 3D Mesh Vertices ── */
      const projs = geo.pts.map(p =>
        projectPoint(p.x, p.y, p.z, rotX, rotY, radius, fov, meshCX, meshCY)
      );

      /* ── 4. Render Background Mesh Wires (z < 0) ── */
      // Thin wires on the far side of the sphere
      for (let eIdx = 0; eIdx < geo.edges.length; eIdx++) {
        const edge = geo.edges[eIdx];
        const pa = projs[edge.from];
        const pb = projs[edge.to];
        if (pa.z >= 0 && pb.z >= 0) continue; // Foreground handled later

        const avgD = (pa.d + pb.d) * 0.5;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);

        if (edge.avgHeat > 0.35) {
          const a = (0.12 + edge.avgHeat * 0.40 * avgD).toFixed(2);
          ctx.strokeStyle = `rgba(225, 110, 30, ${a})`;
          ctx.lineWidth = 0.60 + avgD * 0.40;
        } else {
          const a = (0.05 + avgD * 0.28).toFixed(2);
          ctx.strokeStyle = `rgba(24, 20, 16, ${a})`;
          ctx.lineWidth = 0.40 + avgD * 0.35;
        }
        ctx.stroke();
      }

      /* ── 5. Render Burning Flame Sheets / Ignited Triangles (Core Interior) ── */
      // Incandescent, glowing magma facets seen in the reference video
      for (const tri of geo.coreFlameTriangles) {
        const p1 = projs[tri.p1];
        const p2 = projs[tri.p2];
        const p3 = projs[tri.p3];

        const flicker = prefersReduced ? 1.0 : (0.80 + 0.20 * Math.sin(time * tri.flickerSpeed + tri.flickerPhase));
        const heat = tri.heat * flicker;
        const avgD = (p1.d + p2.d + p3.d) / 3;

        // Triangles are filled with a glowing radiant linear gradient
        const tg = ctx.createLinearGradient(p1.sx, p1.sy, (p2.sx + p3.sx) * 0.5, (p2.sy + p3.sy) * 0.5);
        const alphaCore = Math.min(1.0, (0.50 + heat * 0.50) * (0.75 + avgD * 0.25));

        tg.addColorStop(0, `rgba(255, 252, 235, ${(alphaCore * 0.95).toFixed(2)})`);
        tg.addColorStop(0.30, `rgba(255, 185, 45, ${(alphaCore * 0.85).toFixed(2)})`);
        tg.addColorStop(0.70, `rgba(235, 95, 20, ${(alphaCore * 0.55).toFixed(2)})`);
        tg.addColorStop(1.0, `rgba(180, 40, 15, ${(alphaCore * 0.20).toFixed(2)})`);

        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.closePath();
        ctx.fill();

        // Incandescent glowing wire edges along these flame triangles
        ctx.strokeStyle = `rgba(255, 245, 200, ${(alphaCore * 0.90).toFixed(2)})`;
        ctx.lineWidth = 1.3 + avgD * 0.6;
        ctx.stroke();
      }

      /* ── 6. Render Drifting Sparks / Embers (Interior Cavity) ── */
      for (const spark of geo.driftingSparks) {
        if (!prefersReduced) {
          spark.x += spark.vx * dt * 60;
          spark.y += spark.vy * dt * 60;
          spark.z += spark.vz * dt * 60;

          // Strictly constrain within sphere cavity (r < 0.62)
          const dist = Math.sqrt(spark.x * spark.x + spark.y * spark.y + spark.z * spark.z);
          if (dist > 0.60) {
            spark.vx = -spark.vx * 0.85;
            spark.vy = -spark.vy * 0.85;
            spark.vz = -spark.vz * 0.85;
          }
        }

        const spr = projectPoint(spark.x, spark.y, spark.z, rotX, rotY, radius, fov, meshCX, meshCY);
        const pulse = prefersReduced ? 1.0 : (0.70 + 0.30 * Math.sin(time * spark.flickerSpeed + spark.flickerPhase));
        const alpha = Math.min(1.0, spark.baseAlpha * pulse * (0.45 + spr.d * 0.55));

        if (alpha > 0.05) {
          const r = spark.size * (0.7 + spr.d * 0.6);
          ctx.beginPath();
          ctx.arc(spr.sx, spr.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${spark.rgb[0]}, ${spark.rgb[1]}, ${spark.rgb[2]}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      /* ── 7. Render Foreground Mesh Wires (z >= 0) ── */
      // These dark charcoal wires physically cross IN FRONT OF the flame core!
      for (let eIdx = 0; eIdx < geo.edges.length; eIdx++) {
        const edge = geo.edges[eIdx];
        const pa = projs[edge.from];
        const pb = projs[edge.to];
        if (pa.z < 0 && pb.z < 0) continue; // Already rendered in background pass

        const avgD = (pa.d + pb.d) * 0.5;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);

        if (edge.avgHeat > 0.25) {
          // Heated wire: transitions from warm amber near hot nodes into dark charcoal
          const p = pa.fireHeat > pb.fireHeat ? pa : pb;
          const o = pa.fireHeat > pb.fireHeat ? pb : pa;
          const grad = ctx.createLinearGradient(p.sx, p.sy, o.sx, o.sy);
          const heatAlpha = Math.min(1.0, (0.40 + edge.avgHeat * 0.55) * (0.8 + avgD * 0.3));

          grad.addColorStop(0, `rgba(255, 195, 60, ${heatAlpha.toFixed(2)})`);
          grad.addColorStop(0.35, `rgba(230, 105, 25, ${(heatAlpha * 0.75).toFixed(2)})`);
          grad.addColorStop(1.0, `rgba(24, 20, 16, ${(0.16 + avgD * 0.38).toFixed(2)})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.80 + avgD * 0.65;
        } else {
          // Cool dark wireframe cage
          const alpha = (0.14 + avgD * 0.44).toFixed(2);
          ctx.strokeStyle = `rgba(22, 18, 14, ${alpha})`;
          ctx.lineWidth = 0.52 + avgD * 0.50;
        }
        ctx.stroke();
      }

      /* ── 8. Render Glowing Constellation of Ember Nodes (Exact Reference Match!) ── */
      // 80+ glowing dots in ruby red, vibrant amber, gold, and warm white attached to vertices
      for (let i = 0; i < projs.length; i++) {
        const pr = projs[i];
        const node = geo.pts[i];
        const r = node.baseSize * (0.65 + pr.d * 1.05);

        if (node.fireHeat > 0.10) {
          // Burning ember node with rich glowing halo
          const pulse = prefersReduced ? 1.0 : (0.75 + 0.25 * Math.sin(time * node.flickerSpeed + node.flickerPhase));
          const heat = node.fireHeat * pulse;

          let coreColor, haloColor, haloRadius;

          if (heat > 0.60) {
            // White-hot / bright gold (near core)
            coreColor = `rgba(255, 252, 235, ${(0.98 * pr.d + 0.15).toFixed(2)})`;
            haloColor = 'rgba(255, 190, 45, 0.60)';
            haloRadius = r * 4.0;
          } else if (heat > 0.30) {
            // Vibrant amber / orange (mid zone)
            coreColor = `rgba(255, 165, 35, ${(0.92 * pr.d + 0.12).toFixed(2)})`;
            haloColor = 'rgba(240, 95, 20, 0.45)';
            haloRadius = r * 3.2;
          } else {
            // Deep ruby red (outer combustion perimeter)
            coreColor = `rgba(230, 50, 18, ${(0.88 * pr.d + 0.10).toFixed(2)})`;
            haloColor = 'rgba(195, 35, 12, 0.35)';
            haloRadius = r * 2.5;
          }

          // Soft ember halo
          const hg = ctx.createRadialGradient(pr.sx, pr.sy, 0, pr.sx, pr.sy, haloRadius);
          hg.addColorStop(0, haloColor);
          hg.addColorStop(1, 'rgba(200, 50, 15, 0)');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, haloRadius, 0, Math.PI * 2);
          ctx.fill();

          // Intense burning ember dot
          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, r * 1.30, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Cold charcoal node
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);
          const alpha = (0.16 + pr.d * 0.72).toFixed(2);
          ctx.fillStyle = `rgba(22, 18, 14, ${alpha})`;
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
