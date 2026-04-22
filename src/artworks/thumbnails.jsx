import { useEffect, useRef } from 'react';

function useThumbCanvas(drawFn) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    let t = 0;
    let rafId;
    const loop = () => { t += 0.012; drawFn(ctx, canvas.width, canvas.height, t); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [drawFn]);
  return ref;
}

export function ThumbGenommaLab() {
  const draw = (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const N = 18, cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) * 0.3;
    for (let i = 0; i < N; i++) {
      const prog  = i / (N - 1);
      const angle = prog * Math.PI * 3 + t;
      const price = 42.5 - prog * 29;
      const gold  = 1 - prog * 0.7;
      const ax = cx + Math.cos(angle) * r * 0.55;
      const ay = cy + (prog - 0.5) * h * 0.75;
      const bx = cx + Math.cos(angle + Math.PI) * r * 0.55;
      const by = ay;
      const alpha = prog < 0.8 ? 1 : 1 - (prog - 0.8) / 0.2;
      if (i > 0) {
        const prev = i - 1;
        const pa   = (prev / (N - 1)) * Math.PI * 3 + t;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(pa) * r * 0.55, cy + (prev / (N - 1) - 0.5) * h * 0.75);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = `rgba(120,100,60,0.25)`; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(pa + Math.PI) * r * 0.55, cy + (prev / (N - 1) - 0.5) * h * 0.75);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(120,100,60,0.25)`; ctx.lineWidth = 0.8; ctx.stroke();
      }
      // rung
      if (prog < 0.75) {
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(201,168,76,${alpha * 0.3})`; ctx.lineWidth = 0.7; ctx.stroke();
      }
      for (const [nx, ny] of [[ax, ay], [bx, by]]) {
        const rd = Math.max(1.5, 3 * (1 - Math.abs(ny - cy) / (h * 0.45)));
        ctx.beginPath(); ctx.arc(nx, ny, rd, 0, Math.PI * 2);
        const r_ = Math.round(201 * gold + 58 * (1-gold));
        const g_ = Math.round(168 * gold + 68 * (1-gold));
        const b_ = Math.round(76  * gold + 88 * (1-gold));
        ctx.fillStyle = `rgba(${r_},${g_},${b_},${alpha * 0.9})`; ctx.fill();
      }
    }
  };
  const ref = useThumbCanvas(draw);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />;
}

export function ThumbCinepolis() {
  const draw = (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const COLS = 12, ROWS = 7;
    const cw = w / (COLS + 1), ch = h / (ROWS + 1);
    const pct = 0.55 + 0.33 * Math.abs(Math.sin(t * 0.3));
    const filled = Math.round(pct * COLS * ROWS);
    const seats = [];
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++)
        seats.push({ row, col, idx: row * COLS + col });
    const cx = COLS / 2, cy = ROWS / 2;
    seats.sort((a, b) => Math.hypot(a.col-cx,a.row-cy) - Math.hypot(b.col-cx,b.row-cy));
    for (const s of seats) {
      const x = cw * 0.5 + s.col * cw, y = ch * 0.5 + s.row * ch;
      const active = s.idx < filled;
      const alpha = active ? 0.85 : 0.08 + 0.04 * Math.sin(t + s.idx * 0.2);
      ctx.fillStyle = active ? `rgba(160,30,30,${alpha})` : `rgba(60,40,50,${alpha})`;
      ctx.beginPath(); ctx.roundRect(x, y, cw * 0.7, ch * 0.55, 1); ctx.fill();
    }
  };
  const ref = useThumbCanvas(draw);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />;
}

export function ThumbCinemex() {
  const draw = (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const rng = s => { let x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
    const TOTAL = 80, active = Math.round(TOTAL * (0.38 + 0.25 * Math.abs(Math.sin(t * 0.25))));
    for (let i = 0; i < TOTAL; i++) {
      const x = w * 0.08 + rng(i * 3 + 1) * w * 0.84;
      const y = h * 0.08 + rng(i * 3 + 2) * h * 0.84;
      const isActive = i < active;
      const r = Math.max(1.5, Math.min(w, h) * 0.018);
      if (isActive) {
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.5 + rng(i) * 6);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        glow.addColorStop(0, `rgba(201,168,76,${pulse * 0.35})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${pulse})`; ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80,60,50,0.06)`; ctx.fill();
      }
    }
  };
  const ref = useThumbCanvas(draw);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />;
}

export function ThumbTelmex() {
  const draw = (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const WAVES = 4;
    const intact = 0.42 + 0.2 * Math.abs(Math.sin(t * 0.2));
    const noise = (1 - intact) * 0.6;
    for (let wi = 0; wi < WAVES; wi++) {
      const baseY = h * (0.2 + wi * 0.18);
      const amp   = h * 0.065 * intact;
      const freq  = 0.025 + wi * 0.006;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const x  = (i / 80) * w;
        const px = i / 80;
        const s  = Math.sin(px * Math.PI * 2 * freq * w * 0.1 + t * (1 + wi * 0.2) + wi);
        const n  = (Math.sin(i * 17.3 + t * 5 + wi * 3) * 0.5 + 0.5 - 0.5) * h * noise * 0.18;
        const y  = baseY + s * amp + n;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const gold = Math.max(0, intact - wi * 0.07);
      ctx.strokeStyle = `rgba(${Math.round(60+141*gold)},${Math.round(50+118*gold)},${Math.round(40+36*gold)},${0.2+gold*0.6})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
  };
  const ref = useThumbCanvas(draw);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />;
}

export function ThumbInbursa() {
  const draw = (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const N = 60;
    const grav = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.15));
    for (let i = 0; i < N; i++) {
      const angle  = (i / N) * Math.PI * 2 + t * (0.08 + (i % 3) * 0.04);
      const orbit  = (0.15 + (i % 5) * 0.08) * Math.min(w, h) * 0.45 * (1 - grav * 0.3);
      const x = cx + Math.cos(angle) * orbit;
      const y = cy + Math.sin(angle) * orbit * 0.65;
      const dist = Math.hypot(x - cx, y - cy);
      const prox = 1 - Math.min(1, dist / (Math.min(w,h) * 0.4));
      const r = Math.max(1, 2 * prox + 0.5);
      const rr = Math.round(60 + prox * 141), gg = Math.round(50 + prox * 118), bb = Math.round(40 + prox * 36);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.3 + prox * 0.65})`; ctx.fill();
    }
    const coreR = Math.min(w, h) * 0.04 * (0.6 + grav * 0.4);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
    glow.addColorStop(0, `rgba(201,168,76,0.6)`); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,168,76,0.85)`; ctx.fill();
  };
  const ref = useThumbCanvas(draw);
  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />;
}
