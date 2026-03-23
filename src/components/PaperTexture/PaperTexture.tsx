import { useEffect, useRef } from 'react';
import styles from './PaperTexture.module.css';

interface Props {
  seed: number;
  foxing?: boolean;
}

function makePRNG(seed: number) {
  let s = (seed % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawGrain(canvas: HTMLCanvasElement, seed: number) {
  const W = canvas.offsetWidth  || 360;
  const H = canvas.offsetHeight || 500;
  if (W === 0 || H === 0) return;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rng = makePRNG(seed);
  const imgData = ctx.createImageData(W, H);
  const d = imgData.data;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      // Multi-frequency noise (fine + medium)
      const fine   = (rng() - 0.5) * 30;
      const medium = (rng() - 0.5) * 15;

      // Warm/cool color variation across the page
      const warmShift = Math.sin(px * 0.008 + py * 0.005) * 8;
      const coolShift = Math.cos(px * 0.006 - py * 0.009) * 5;

      // Edge darkening — max 25 units at the very edges
      const edgeX = Math.min(px, W - px) / (W * 0.15);
      const edgeY = Math.min(py, H - py) / (H * 0.12);
      const ef = Math.min(1, Math.min(edgeX, edgeY));
      const edgeDark = (1 - ef) * 25;

      const base = 225;
      const r = Math.min(255, Math.max(0, base + fine + warmShift - edgeDark + 5));
      const g = Math.min(255, Math.max(0, base + fine + coolShift - edgeDark));
      const b = Math.min(255, Math.max(0, base + fine - warmShift * 0.5 - edgeDark - 8));

      // Alpha — more visible than before
      const alpha = 45 + Math.abs(fine) * 0.8;

      const i = (py * W + px) * 4;
      d[i]     = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = Math.min(255, alpha);

      // consume medium rng so sequence stays consistent
      void medium;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Watercolor splotches — 8, alternating warm/cool
  const count = 8;
  for (let i = 0; i < count; i++) {
    const cx  = rng() * W;
    const cy  = rng() * H;
    const r   = 30 + rng() * 80;
    const warm = rng() > 0.5;
    const opa = warm ? 0.04 + rng() * 0.04 : 0.03 + rng() * 0.03;
    const color = warm ? `190,170,140` : `170,165,155`;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   `rgba(${color},${opa})`);
    grad.addColorStop(1,   `rgba(200,190,170,0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Tiny speckles — 200, higher alpha
  for (let i = 0; i < 200; i++) {
    const sx = rng() * W;
    const sy = rng() * H;
    const sz = 0.5 + rng() * 1.5;
    ctx.fillStyle = `rgba(150,130,100,${0.08 + rng() * 0.12})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sz, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFibers(canvas: HTMLCanvasElement, seed: number) {
  const W = canvas.offsetWidth  || 360;
  const H = canvas.offsetHeight || 500;
  if (W === 0 || H === 0) return;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rng = makePRNG(seed + 9999);
  ctx.clearRect(0, 0, W, H);

  // 120 thin fibers — mostly horizontal, some vertical, higher alpha
  for (let i = 0; i < 120; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const len = 8 + rng() * 25;
    const angle = (rng() - 0.5) * 0.6 + (rng() > 0.7 ? Math.PI / 2 : 0);
    const alpha = 0.03 + rng() * 0.06;
    ctx.strokeStyle = rng() > 0.3
      ? `rgba(180,165,140,${alpha})`
      : `rgba(160,150,135,${alpha})`;
    ctx.lineWidth = 0.3 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // 15 thicker curved strands
  for (let i = 0; i < 15; i++) {
    const x0 = rng() * W;
    const y0 = rng() * H;
    const len = 15 + rng() * 40;
    const angle = (rng() - 0.5) * 0.4;
    const x1 = x0 + Math.cos(angle) * len;
    const y1 = y0 + Math.sin(angle) * len;
    const cpx = (x0 + x1) / 2 + (rng() - 0.5) * 8;
    const cpy = (y0 + y1) / 2 + (rng() - 0.5) * 8;
    ctx.strokeStyle = `rgba(170,155,130,${0.04 + rng() * 0.04})`;
    ctx.lineWidth = 0.6 + rng() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cpx, cpy, x1, y1);
    ctx.stroke();
  }
}

export default function PaperTexture({ seed, foxing = false }: Props) {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const fiberRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const grain = grainRef.current;
    const fiber = fiberRef.current;
    if (!grain || !fiber) return;
    const raf = requestAnimationFrame(() => {
      drawGrain(grain, seed);
      drawFibers(fiber, seed);
    });
    return () => cancelAnimationFrame(raf);
  }, [seed]);

  // Foxing: max 1 spot per page
  const foxingSpot = foxing ? (() => {
    const r = makePRNG(seed + 77777);
    return {
      left: 5  + r() * 70,
      top:  60 + r() * 30,
      size: 70 + r() * 30,
    };
  })() : null;

  return (
    <div className={styles.root}>
      <canvas ref={grainRef} className={styles.grainCanvas} />
      <canvas ref={fiberRef} className={styles.fiberCanvas} />
      <div className={styles.vignette} />
      {foxingSpot && (
        <div
          className={styles.foxing}
          style={{
            left:   `${foxingSpot.left}%`,
            top:    `${foxingSpot.top}%`,
            width:  `${foxingSpot.size}px`,
            height: `${foxingSpot.size * 0.88}px`,
            background: `radial-gradient(circle, rgba(170,140,100,0.15) 0%, rgba(170,140,100,0.05) 40%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
