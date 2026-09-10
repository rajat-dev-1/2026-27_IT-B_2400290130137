import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Contained Wireframe Clump with Dark Smoky Core & Rim-Mounted Shard Flares
   Reference-matched corrections (5 gaps addressed):
   Gap 1: Dark, soft-edged, cloud-like smoke fill in the hollow core
   Gap 2: Flares anchored to actual dense mesh knots (line-convergence scoring)
   Gap 3: Shard-based angular flare shapes with hard linear tapers, not soft rounds
   Gap 4: 40–80 fine ember-dust particles confined strictly inside the smoky core
   Gap 5: 3 flares with clear dominant/medium/small size hierarchy, scaled up
───────────────────────────────────────────────────────────────────────────── */

/* Procedural bounded wireframe clump geometry */
function buildContainedWireClumpGeo(nodeCount) {
  const pts = [];

  for (let i = 0; i < nodeCount; i++) {
    const t = (i / nodeCount) * Math.PI * 2;
    const p = Math.sin(i * 3.83) * Math.PI;

    const rMajor = 0.74 +
      0.18 * Math.sin(3 * t + 0.8) +
      0.10 * Math.cos(5 * t - 1.2) +
      0.06 * Math.sin(7 * t);

    const rMinor = 0.32 +
      0.14 * Math.sin(2 * t + 3 * p) +
      0.08 * Math.cos(4 * p);

    let x = (rMajor + rMinor * Math.cos(p)) * Math.cos(t);
    let y = (rMajor + rMinor * Math.cos(p)) * Math.sin(t);
    let z = rMinor * Math.sin(p) * 1.25;

    const noise = 0.05 * Math.sin(i * 9.7);
    x += noise * Math.cos(i * 2.1);
    y += noise * Math.sin(i * 2.1);
    z += noise * Math.cos(i * 3.7);

    pts.push({
      x, y, z,
      theta: t,
      baseSize: 0.8 + (i % 3) * 0.5,
      distFromCenter: Math.sqrt(x * x + y * y + z * z),
      edgeCount: 0, // will be populated after edge generation
    });
  }

  // Pre-calculate tangled edge network
  const edges = [];
  const threshold = 0.32;
  const t2 = threshold * threshold;

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dz = pts[i].z - pts[j].z;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < t2) {
        edges.push({ from: i, to: j, len: Math.sqrt(d2) });
      }
    }
  }

  edges.sort((a, b) => a.len - b.len);
  const maxEdges = Math.min(edges.length, Math.floor(nodeCount * 3.3));
  const activeEdges = edges.slice(0, maxEdges);

  // --- Gap 2: Score every node by edge convergence (density) ---
  // Count how many active edges touch each node
  for (const edge of activeEdges) {
    pts[edge.from].edgeCount++;
    pts[edge.to].edgeCount++;
  }

  // Score = edgeCount * distFromCenter (prefer dense OUTER knots)
  const scored = pts.map((p, i) => ({
    idx: i,
    score: p.edgeCount * p.distFromCenter,
    angle: Math.atan2(p.y, p.x),
  }));
  scored.sort((a, b) => b.score - a.score);

  // Pick 3 anchor knots that are angularly separated (at least 50° apart)
  const anchors = [];
  for (const candidate of scored) {
    if (anchors.length >= 3) break;
    let tooClose = false;
    for (const existing of anchors) {
      const dAngle = Math.abs(Math.atan2(
        Math.sin(candidate.angle - existing.angle),
        Math.cos(candidate.angle - existing.angle)
      ));
      if (dAngle < 0.87) { // ~50 degrees minimum separation
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      anchors.push(candidate);
    }
  }

  // Ensure we have 3 anchors (fallback to top-scored if needed)
  while (anchors.length < 3) {
    anchors.push(scored[anchors.length]);
  }

  // --- Gap 5: 3 flares with clear dominant/medium/small hierarchy ---
  // Shard definitions: irregular angles and lengths per flare (Gap 3)
  const rimFlares = [
    {
      anchorNodeIdx: anchors[0].idx,
      name: 'Dominant',
      baseRadius: 65, // Dominant: large, clearly prominent
      shards: [
        { angle: -0.55, length: 2.4, widthBase: 4.5, widthTip: 0.5 },
        { angle: -0.10, length: 3.1, widthBase: 5.0, widthTip: 0.3 },
        { angle: 0.35, length: 2.8, widthBase: 4.2, widthTip: 0.4 },
        { angle: 0.80, length: 1.9, widthBase: 3.6, widthTip: 0.6 },
        { angle: 1.25, length: 2.6, widthBase: 4.0, widthTip: 0.4 },
        { angle: 1.70, length: 3.3, widthBase: 5.2, widthTip: 0.3 },
        { angle: -1.10, length: 2.1, widthBase: 3.8, widthTip: 0.5 },
      ],
      flickerPhase: 0,
      flareChance: 0.04,
      flareIntensity: 1.0,
    },
    {
      anchorNodeIdx: anchors[1].idx,
      name: 'Medium',
      baseRadius: 42, // Medium: ~65% of dominant
      shards: [
        { angle: -0.40, length: 2.0, widthBase: 3.8, widthTip: 0.4 },
        { angle: 0.15, length: 2.6, widthBase: 4.2, widthTip: 0.3 },
        { angle: 0.70, length: 1.8, widthBase: 3.4, widthTip: 0.5 },
        { angle: 1.30, length: 2.3, widthBase: 3.6, widthTip: 0.4 },
        { angle: -0.95, length: 1.6, widthBase: 3.0, widthTip: 0.5 },
      ],
      flickerPhase: 2.3,
      flareChance: 0.03,
      flareIntensity: 1.0,
    },
    {
      anchorNodeIdx: anchors[2].idx,
      name: 'Small',
      baseRadius: 26, // Small accent: ~40% of dominant
      shards: [
        { angle: -0.30, length: 1.6, widthBase: 2.8, widthTip: 0.4 },
        { angle: 0.25, length: 2.0, widthBase: 3.2, widthTip: 0.3 },
        { angle: 0.85, length: 1.4, widthBase: 2.4, widthTip: 0.5 },
      ],
      flickerPhase: 4.6,
      flareChance: 0.02,
      flareIntensity: 1.0,
    },
  ];

  // --- Gap 4: Ember-dust particles confined inside the smoky core ---
  const emberCount = Math.max(40, Math.floor(nodeCount * 0.35));
  const emberDust = Array.from({ length: emberCount }, (_, i) => {
    const u = Math.random();
    const rad = 0.06 + Math.cbrt(u) * 0.30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // Color palette: mostly white/pale-gold, occasional dim red/orange
    const roll = Math.random();
    let color;
    if (roll < 0.45) {
      color = [255, 252, 235]; // near-white
    } else if (roll < 0.80) {
      color = [255, 218, 115]; // pale gold
    } else {
      color = [230, 100, 35];  // dim red/orange accent
    }

    return {
      x: rad * Math.sin(phi) * Math.cos(theta),
      y: rad * Math.sin(phi) * Math.sin(theta),
      z: rad * Math.cos(phi) * 0.9,
      vx: (Math.random() - 0.5) * 0.005,
      vy: (Math.random() - 0.5) * 0.005,
      vz: (Math.random() - 0.5) * 0.004,
      size: 1.0 + Math.random() * 1.4,
      baseAlpha: 0.25 + Math.random() * 0.40,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.6 + Math.random() * 1.0,
      color,
    };
  });

  // --- Gap 1: Smoke cloud blob seeds for irregular soft-edged core fill ---
  // Several overlapping displaced circles to create cloud-like edges
  const smokeBlobs = Array.from({ length: 6 }, (_, i) => ({
    offsetAngle: (i / 6) * Math.PI * 2 + i * 0.4,
    offsetDist: 0.04 + (i % 3) * 0.04,
    radiusFactor: 0.34 + (i % 2) * 0.08,
    alpha: 0.30 + (i % 3) * 0.08,
    driftSpeed: 0.02 + (i % 4) * 0.008,
    driftPhase: i * 1.1,
  }));

  return { pts, edges: activeEdges, rimFlares, emberDust, smokeBlobs };
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
  centerX = 0.52,
  centerY = 0.50,
  radiusScale = 0.74,
}) {
  const canvasRef = useRef(null);

  const initData = useCallback((width) => {
    const count = width < 768 ? 120 : 220;
    return buildContainedWireClumpGeo(count);
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

    let rotX = 0.16;
    let rotY = 0;
    let time = 0;
    let lastTime = performance.now();
    let animId = null;
    let paused = false;
    let isIntersecting = true;

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

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

    // Build a set of node indices adjacent to each flare anchor for warm-tint wires
    const flareNeighborSets = geo.rimFlares.map(rf => {
      const neighbors = new Set();
      neighbors.add(rf.anchorNodeIdx);
      for (const edge of geo.edges) {
        if (edge.from === rf.anchorNodeIdx) neighbors.add(edge.to);
        if (edge.to === rf.anchorNodeIdx) neighbors.add(edge.from);
      }
      return neighbors;
    });

    /* ─────────────────────────────────────────────────────────────────
       Main Render Loop
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
        rotY += dt * 0.066;
        rotX = 0.16 + Math.sin(time * 0.08) * 0.05;
      }

      const meshCX = W * centerX;
      const meshCY = H * centerY;
      const breathe = prefersReduced ? 1.0 : (1.0 + 0.02 * Math.sin(time * 0.28));
      const radius = Math.min(W, H) * radiusScale * breathe;
      const fov = 2.8;

      /* ── 0. Base Clean Neutral Background Fill ── */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      /* ── 1. Faint Cold Neutral-Grey Circular Framing Rings ── */
      ctx.lineWidth = 0.75;
      for (let i = 0; i < 3; i++) {
        const ringR = radius * (0.60 + i * 0.26);
        const alpha = (0.075 * (1 - i / 3.2)).toFixed(3);
        ctx.beginPath();
        ctx.arc(meshCX, meshCY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(130, 125, 115, ${alpha})`;
        ctx.stroke();
      }

      /* ── 2. Gap 1 FIX: Dark Smoky Core with Irregular Cloud-Like Edges ── */
      // Render multiple overlapping displaced soft-edged blobs to create
      // a drifting, cloud-like smoke fill, not a clean radial disc.
      for (const blob of geo.smokeBlobs) {
        // Slow internal drift/roiling over ~25s cycles
        const driftX = prefersReduced ? 0 : Math.sin(time * blob.driftSpeed + blob.driftPhase) * radius * 0.04;
        const driftY = prefersReduced ? 0 : Math.cos(time * blob.driftSpeed * 1.3 + blob.driftPhase) * radius * 0.035;
        const blobCX = meshCX + Math.cos(blob.offsetAngle) * blob.offsetDist * radius + driftX;
        const blobCY = meshCY + Math.sin(blob.offsetAngle) * blob.offsetDist * radius + driftY;
        const blobR = radius * blob.radiusFactor;

        const sg = ctx.createRadialGradient(blobCX, blobCY, 0, blobCX, blobCY, blobR);
        sg.addColorStop(0, `rgba(18, 16, 14, ${blob.alpha.toFixed(2)})`);
        sg.addColorStop(0.55, `rgba(24, 21, 18, ${(blob.alpha * 0.65).toFixed(2)})`);
        sg.addColorStop(0.85, `rgba(34, 30, 26, ${(blob.alpha * 0.15).toFixed(2)})`);
        sg.addColorStop(1.0, 'rgba(34, 30, 26, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(blobCX, blobCY, blobR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 3. Project all 3D mesh points ── */
      const projs = geo.pts.map(p =>
        projectPoint(p.x, p.y, p.z, rotX, rotY, radius, fov, meshCX, meshCY)
      );

      /* ── 4. Gap 4 FIX: Ember-Dust Particle Field Inside Smoky Core ── */
      for (const ember of geo.emberDust) {
        if (!prefersReduced) {
          ember.x += ember.vx * dt * 60;
          ember.y += ember.vy * dt * 60;
          ember.z += ember.vz * dt * 60;

          // Strictly bound inside interior cavity (radius 0.36)
          const dist = Math.sqrt(ember.x * ember.x + ember.y * ember.y + ember.z * ember.z);
          if (dist > 0.36) {
            const scale = 0.34 / dist;
            ember.x *= scale;
            ember.y *= scale;
            ember.z *= scale;
            ember.vx = -ember.vx * 0.85;
            ember.vy = -ember.vy * 0.85;
            ember.vz = -ember.vz * 0.85;
          }
        }

        const ePr = projectPoint(ember.x, ember.y, ember.z, rotX, rotY, radius, fov, meshCX, meshCY);
        const pulse = 0.72 + 0.28 * Math.sin(time * ember.pulseSpeed + ember.phase);
        const alpha = ember.baseAlpha * pulse * (0.45 + ePr.d * 0.55);

        if (alpha > 0.03) {
          const r = ember.size * (0.7 + ePr.d * 0.6);
          ctx.beginPath();
          ctx.arc(ePr.sx, ePr.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ember.color[0]}, ${ember.color[1]}, ${ember.color[2]}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      /* ── 5. Project & Update Rim-Mounted Flare Hotspots (Gap 2 + 5) ── */
      const projFlares = geo.rimFlares.map((rf, fIdx) => {
        const anchorPt = geo.pts[rf.anchorNodeIdx];
        const pr = projectPoint(anchorPt.x, anchorPt.y, anchorPt.z, rotX, rotY, radius, fov, meshCX, meshCY);

        if (!prefersReduced) {
          rf.flickerPhase += dt * (3.4 + fIdx * 0.8);
          if (Math.random() < rf.flareChance) {
            rf.flareIntensity = 1.25 + Math.random() * 0.4;
          } else {
            rf.flareIntensity += (1.0 - rf.flareIntensity) * 0.10;
          }
        }

        const flicker = (0.84 + 0.16 * Math.sin(rf.flickerPhase)) * rf.flareIntensity;
        const curRadius = rf.baseRadius * (0.85 + pr.d * 0.3) * flicker;

        return { ...rf, sx: pr.sx, sy: pr.sy, z: pr.z, d: pr.d, curRadius, flicker };
      });

      /* ── 6. Render Wireframe Lines (Gap 2 warm-tint at anchor knots) ── */
      for (let eIdx = 0; eIdx < geo.edges.length; eIdx++) {
        const edge = geo.edges[eIdx];
        const pa = projs[edge.from];
        const pb = projs[edge.to];
        const avgD = (pa.d + pb.d) * 0.5;

        // Check if edge touches a flare anchor or its immediate neighbors
        let warmTintFlare = null;
        let warmIntensity = 0;
        for (let fi = 0; fi < projFlares.length; fi++) {
          const neighbors = flareNeighborSets[fi];
          const touchesFrom = neighbors.has(edge.from);
          const touchesTo = neighbors.has(edge.to);
          if (touchesFrom || touchesTo) {
            // Direct anchor connection is hottest; neighbor is warm
            const directAnchor = (edge.from === projFlares[fi].anchorNodeIdx || edge.to === projFlares[fi].anchorNodeIdx);
            const intensity = directAnchor ? 1.0 : 0.55;
            if (intensity > warmIntensity) {
              warmIntensity = intensity;
              warmTintFlare = projFlares[fi];
            }
          }
        }

        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);

        if (warmTintFlare && warmIntensity > 0) {
          // Wire near the ignition point: warm amber/gold tint fading along the wire
          const alpha = Math.min(1.0, (0.40 + warmIntensity * 0.55) * warmTintFlare.flicker);
          const r = Math.round(255);
          const g = Math.round(190 + warmIntensity * 45);
          const b = Math.round(60 + warmIntensity * 70);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
          ctx.lineWidth = 0.7 + warmIntensity * 0.9;
        } else {
          // Standard cool dark charcoal wire
          const alpha = (0.08 + avgD * 0.36).toFixed(2);
          ctx.strokeStyle = `rgba(24, 20, 16, ${alpha})`;
          ctx.lineWidth = 0.45 + avgD * 0.45;
        }
        ctx.stroke();
      }

      /* ── 7. Render Mesh Knot Nodes ── */
      for (let i = 0; i < projs.length; i++) {
        const pr = projs[i];
        const node = geo.pts[i];
        const isAnchor = projFlares.some(rf => rf.anchorNodeIdx === i);

        ctx.beginPath();
        const r = node.baseSize * (0.6 + pr.d * 1.1);
        ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);

        if (isAnchor) {
          ctx.fillStyle = 'rgba(255, 250, 220, 1.0)';
        } else {
          const alpha = (0.16 + pr.d * 0.72).toFixed(2);
          ctx.fillStyle = `rgba(22, 18, 14, ${alpha})`;
        }
        ctx.fill();
      }

      /* ── 8. Gap 3+5 FIX: Shard-Based Angular Rim Flares with Size Hierarchy ── */
      for (const rf of projFlares) {
        // Small contained base glow underneath the shards (ignition point)
        const baseGlowR = rf.curRadius * 0.35;
        const bg = ctx.createRadialGradient(rf.sx, rf.sy, 0, rf.sx, rf.sy, baseGlowR);
        bg.addColorStop(0, `rgba(255, 255, 245, ${(0.92 * rf.flicker).toFixed(2)})`);
        bg.addColorStop(0.45, `rgba(255, 190, 50, ${(0.55 * rf.flicker).toFixed(2)})`);
        bg.addColorStop(1.0, 'rgba(235, 100, 20, 0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(rf.sx, rf.sy, baseGlowR, 0, Math.PI * 2);
        ctx.fill();

        // Angular shard geometry: irregular triangles radiating from anchor
        // Each shard has hard-edged linear taper (wide base → thin tip)
        const baseAngle = Math.atan2(rf.sy - meshCY, rf.sx - meshCX);

        for (const shard of rf.shards) {
          const angle = baseAngle + shard.angle + (time * 0.04);
          const len = rf.curRadius * shard.length;

          // Shard tip point
          const tipX = rf.sx + Math.cos(angle) * len;
          const tipY = rf.sy + Math.sin(angle) * len;

          // Base edge points (perpendicular to shard direction, wide at anchor)
          const perpAngle = angle + Math.PI / 2;
          const baseHW = shard.widthBase * rf.flicker;
          const tipHW = shard.widthTip * rf.flicker;

          const bx1 = rf.sx + Math.cos(perpAngle) * baseHW;
          const by1 = rf.sy + Math.sin(perpAngle) * baseHW;
          const bx2 = rf.sx - Math.cos(perpAngle) * baseHW;
          const by2 = rf.sy - Math.sin(perpAngle) * baseHW;

          // Tip edges (narrow)
          const tx1 = tipX + Math.cos(perpAngle) * tipHW;
          const ty1 = tipY + Math.sin(perpAngle) * tipHW;
          const tx2 = tipX - Math.cos(perpAngle) * tipHW;
          const ty2 = tipY - Math.sin(perpAngle) * tipHW;

          // Hard linear gradient along shard length (bright base → transparent tip)
          const lg = ctx.createLinearGradient(rf.sx, rf.sy, tipX, tipY);
          lg.addColorStop(0, `rgba(255, 255, 240, ${(0.92 * rf.flicker).toFixed(2)})`);
          lg.addColorStop(0.18, `rgba(255, 200, 60, ${(0.75 * rf.flicker).toFixed(2)})`);
          lg.addColorStop(0.55, `rgba(240, 110, 20, ${(0.30 * rf.flicker).toFixed(2)})`);
          lg.addColorStop(1.0, 'rgba(235, 90, 15, 0)');

          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.moveTo(bx1, by1);
          ctx.lineTo(tx1, ty1);
          ctx.lineTo(tx2, ty2);
          ctx.lineTo(bx2, by2);
          ctx.closePath();
          ctx.fill();
        }

        // Tiny, intense white-hot core exactly on the knot
        const coreR = Math.max(3, rf.curRadius * 0.14 * rf.flicker);
        const cg = ctx.createRadialGradient(rf.sx, rf.sy, 0, rf.sx, rf.sy, coreR);
        cg.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        cg.addColorStop(0.5, 'rgba(255, 248, 200, 0.95)');
        cg.addColorStop(1.0, 'rgba(255, 190, 50, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(rf.sx, rf.sy, coreR, 0, Math.PI * 2);
        ctx.fill();
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
