import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

// Post-pandemic attendance recovery data (% of 2019 baseline, quarterly)
const ATTENDANCE = [
  { q: 'Q1 2020', pct: 0.92 }, { q: 'Q2 2020', pct: 0.04 },
  { q: 'Q3 2020', pct: 0.08 }, { q: 'Q4 2020', pct: 0.22 },
  { q: 'Q1 2021', pct: 0.18 }, { q: 'Q2 2021', pct: 0.31 },
  { q: 'Q3 2021', pct: 0.55 }, { q: 'Q4 2021', pct: 0.72 },
  { q: 'Q1 2022', pct: 0.68 }, { q: 'Q2 2022', pct: 0.74 },
  { q: 'Q3 2022', pct: 0.81 }, { q: 'Q4 2022', pct: 0.85 },
  { q: 'Q1 2023', pct: 0.79 }, { q: 'Q2 2023', pct: 0.83 },
  { q: 'Q3 2023', pct: 0.87 }, { q: 'Q4 2023', pct: 0.88 },
  { q: 'Q1 2024', pct: 0.82 }, { q: 'Q2 2024', pct: 0.85 },
  { q: 'Q3 2024', pct: 0.86 }, { q: 'Q4 2024', pct: 0.87 },
  { q: 'Q1 2025', pct: 0.84 }, { q: 'Q2 2025', pct: 0.85 },
];

function SeatsCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let rafId;
    let t = 0;

    function resize() {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    }
    window.addEventListener('resize', resize);
    resize();

    // Wave cycles through attendance history — never reaches 1.0
    const MAX_PCT = Math.max(...ATTENDANCE.map(d => d.pct)); // ~0.88

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      t += 0.004;

      const COLS      = 28;
      const ROWS      = 16;
      const cellW     = w / (COLS + 2);
      const cellH     = h / (ROWS + 2);
      const seatW     = cellW * 0.55;
      const seatH     = cellH * 0.45;
      const gap       = cellW * 0.10;

      // Current attendance from wave through historical data
      const waveIdx  = (t % ATTENDANCE.length);
      const idxA     = Math.floor(waveIdx) % ATTENDANCE.length;
      const idxB     = (idxA + 1) % ATTENDANCE.length;
      const blend    = waveIdx - Math.floor(waveIdx);
      const curPct   = ATTENDANCE[idxA].pct * (1 - blend) + ATTENDANCE[idxB].pct * blend;
      const filled   = Math.round(curPct * COLS * ROWS);

      const quarter = ATTENDANCE[idxA].q;

      // Determine which seats are filled using a wave front
      const seats = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          seats.push({ row, col, idx: row * COLS + col });
        }
      }

      // Fill seats from center outward with slight randomness
      const cx = COLS / 2;
      const cy = ROWS / 2;
      const scored = seats.map(s => ({
        ...s,
        score: Math.hypot(s.col - cx, s.row - cy) + Math.sin(s.idx * 2.3) * 0.5,
      })).sort((a, b) => a.score - b.score);

      for (const seat of scored) {
        const isFilled = seat.idx < filled;
        const x = cellW + seat.col * cellW + gap;
        const y = cellH + seat.row * cellH + gap;

        // Seat back
        const alpha = isFilled
          ? 0.85
          : 0.08 + 0.04 * Math.sin(t * 1.5 + seat.idx * 0.1);

        const red = isFilled ? 160 : 60;
        const grn = isFilled ? 30  : 40;
        const blu = isFilled ? 30  : 50;

        ctx.fillStyle = `rgba(${red},${grn},${blu},${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, seatW, seatH * 0.65, 2);
        ctx.fill();

        // Seat base
        ctx.fillStyle = `rgba(${red},${grn},${blu},${alpha * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(x, y + seatH * 0.68, seatW, seatH * 0.28, 1);
        ctx.fill();
      }

      // Quarter label
      ctx.fillStyle = 'rgba(201,168,76,0.35)';
      ctx.font = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${quarter} — ${Math.round(curPct * 100)}% AFORO`, w / 2, h - cellH * 0.4);

      // "Nunca completa" label when close to max
      if (curPct > 0.83) {
        ctx.fillStyle = `rgba(201,168,76,${0.15 + 0.1 * Math.sin(t * 3)})`;
        ctx.font = `${Math.max(8, w * 0.009)}px 'Courier New', monospace`;
        ctx.fillText('el aforo nunca se completa', w / 2, h - cellH * 0.15);
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="artwork-canvas" />;
}

const CAPTION = {
  title:       'Algoritmo de la Butaca',
  artist:      'MextrategIA',
  year:        '2025',
  medium:      'Intervención de dominio digital / Net-art especulativo',
  lot:         'LOT-CNP-001',
  description: 'Visualización generativa del aforo de Cinépolis desde el colapso pandémico ' +
               'de 2020 hasta la recuperación parcial de 2025. Cada butaca es un dato ' +
               'trimestral de asistencia. La sala nunca vuelve a llenarse: el 88% es ' +
               'el nuevo techo. El dominio cinepolis.ai permanece activo como testimonio ' +
               'del tiempo en que el entretenimiento físico aprendió su propio límite digital.',
};

export default function Cinepolis() {
  return (
    <ArtworkShell corpId="cinepolis" domain="cinepolis.ai" caption={CAPTION}>
      <SeatsCanvas />
    </ArtworkShell>
  );
}
