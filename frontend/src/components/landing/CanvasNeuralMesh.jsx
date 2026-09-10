import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────
   High-performance canvas 3D wireframe neural mesh.
   Key performance decisions:
   - Only 120 points (not 210)
   - Edges pre-sorted by distance — only closest ~400 edges drawn
   - No per-frame sort (use depth approximation)
   - Single ctx.save/restore eliminated — use direct color state
   - deltaTime capped to avoid spiral-of-death on slow machines
   - ResizeObserver debounced
──────────────────────────────────────────────────────────────────── */

/* Fibonacci sphere */
function fibSphere(n) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    const noise = 0.06 * Math.sin(i * 11.3) * Math.cos(i * 7.9);
    pts.push([r * Math.cos(a) * (1 + noise), y, r * Math.sin(a) * (1 + noise)]);
  }
  return pts;
}

/* Build edges, limit to closest N */
function buildEdges(pts, threshold, maxEdges) {
  const all = [];
  const t2 = threshold * threshold;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      const dz = pts[i][2] - pts[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < t2) all.push([i, j, Math.sqrt(d2)]);
    }
  }
  all.sort((a, b) => a[2] - b[2]);
  return all.slice(0, maxEdges);
}

/* Inline rotation + projection — no intermediate array allocation */
function projectInline(px, py, pz, rx, ry, radius, fov, cx, cy) {
  // Rotate Y
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x1 = px * cosY + pz * sinY;
  const z1 = -px * sinY + pz * cosY;
  // Rotate X
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y2 = py * cosX - z1 * sinX;
  const z2 = py * sinX + z1 * cosX;
  // Perspective
  const depth = z2 + fov;
  const s = radius / depth;
  return { sx: cx + x1 * s, sy: cy - y2 * s, z: z2, d: (z2 + 1) * 0.5 };
}

export default function CanvasNeuralMesh({ bgColor = '#EBE8E3' }) {
  const canvasRef = useRef(null);

  const initGeo = useCallback(() => {
    const N = 120;           // Reduced from 210
    const pts = fibSphere(N);
    const edges = buildEdges(pts, 0.55, 380); // cap at 380 edges
    const particles = Array.from({ length: 30 }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.random() * Math.PI,
      r: 0.06 + Math.random() * 0.35,
      speed: 0.003 + Math.random() * 0.01,
      size: 1 + Math.random() * 2.2,
      alpha: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
    return { pts, edges, particles };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha:false = faster compositing
    if (!ctx) return;

    const geo = initGeo();
    let rotX = 0.18, rotY = 0, time = 0;
    let lastTime = performance.now();
    let animId = null;
    let W = 0, H = 0;
    let paused = false;

    /* Resize — debounced */
    let resizeTimer = null;
    const doResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(doResize, 80); };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    doResize();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Pause when tab hidden — frees CPU entirely */
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    /* Use setTimeout(16) instead of rAF — yields to browser scheduler between frames */
    function render() {
      if (paused || W === 0 || H === 0) { animId = setTimeout(render, 33); return; }

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!prefersReduced) {
        time += dt;
        rotY += dt * 0.22;               // ~0.22 rad/s
        rotX = 0.18 + Math.sin(time * 0.07) * 0.09;
      }

      /* Layout */
      const meshCX = W * 0.64;
      const meshCY = H * 0.54;
      const radius = Math.min(W, H) * 0.64;
      const fov = 2.6;

      /* ── 1. BG fill ── */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      /* ── 2. Concentric rings (batch) ── */
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        const ringR = radius * (0.3 + i * 0.22);
        const alpha = (0.13 * (1 - i / 4)).toFixed(2);
        ctx.beginPath();
        ctx.arc(meshCX, meshCY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140,130,112,${alpha})`;
        ctx.stroke();
      }

      /* ── 3. Outer ambient halo ── */
      {
        const g = ctx.createRadialGradient(meshCX, meshCY, 0, meshCX, meshCY, radius * 0.8);
        g.addColorStop(0, 'rgba(255,185,55,0.13)');
        g.addColorStop(0.5, 'rgba(255,120,28,0.06)');
        g.addColorStop(1, 'rgba(210,80,20,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── 4. Project all points (reuse array) ── */
      const projs = geo.pts.map(([px, py, pz]) =>
        projectInline(px, py, pz, rotX, rotY, radius, fov, meshCX, meshCY)
      );

      /* ── 5. Draw edges (no per-frame sort) ── */
      for (const [i, j, len] of geo.edges) {
        const pa = projs[i], pb = projs[j];
        const avgD = (pa.d + pb.d) * 0.5;
        const isHl = len < 0.28 && avgD > 0.6;
        if (isHl) {
          ctx.strokeStyle = `rgba(170,120,30,${(0.25 + avgD * 0.5).toFixed(2)})`;
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = `rgba(30,24,14,${(0.04 + avgD * 0.24).toFixed(2)})`;
          ctx.lineWidth = 0.5;
        }
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      /* ── 6. Nodes ── */
      for (const pr of projs) {
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 0.5 + pr.d * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(24,18,8,${(0.12 + pr.d * 0.68).toFixed(2)})`;
        ctx.fill();
      }

      /* ── 7. Particles ── */
      for (const p of geo.particles) {
        p.theta += p.speed * dt * 60;   // frame-rate independent
        const pulse = 0.72 + 0.28 * Math.sin(time * 1.9 + p.phase);
        const dist = p.r * radius * pulse;
        const px = meshCX + Math.sin(p.phi) * Math.cos(p.theta) * dist;
        const py = meshCY + Math.sin(p.phi) * Math.sin(p.theta) * dist * 0.65;
        const pr2 = p.size * 4.5 * pulse;
        const g2 = ctx.createRadialGradient(px, py, 0, px, py, pr2);
        g2.addColorStop(0, `rgba(255,235,100,${(p.alpha * pulse).toFixed(2)})`);
        g2.addColorStop(0.35, `rgba(255,165,35,${(p.alpha * pulse * 0.5).toFixed(2)})`);
        g2.addColorStop(1, 'rgba(255,100,20,0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(px, py, pr2, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 8. Core inner glow ── */
      {
        const gp = 0.24 + 0.07 * Math.sin(time * 1.1);
        const g3 = ctx.createRadialGradient(meshCX, meshCY, 0, meshCX, meshCY, radius * 0.28);
        g3.addColorStop(0, `rgba(255,218,65,${gp.toFixed(2)})`);
        g3.addColorStop(0.45, `rgba(255,145,28,${(gp * 0.5).toFixed(2)})`);
        g3.addColorStop(1, 'rgba(255,90,18,0)');
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, W, H);
      }

      animId = setTimeout(render, 33); // ~30fps, yields to browser scheduler
    }

    animId = setTimeout(render, 33);

    return () => {
      clearTimeout(animId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  }, [bgColor, initGeo]);


  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}
