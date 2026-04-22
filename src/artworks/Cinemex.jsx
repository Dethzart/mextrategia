import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

const THEATER_HISTORY = [
  { year: '2015', count: 318 }, { year: '2016', count: 332 },
  { year: '2017', count: 341 }, { year: '2018', count: 349 },
  { year: '2019', count: 356 }, { year: '2020', count: 356 },
  { year: '2021', count: 340 }, { year: '2022', count: 298 },
  { year: '2023', count: 261 }, { year: '2024', count: 234 },
  { year: '2025', count: 218 },
];

const MAX_THEATERS = 356;

// Stable noise — no overflow
function srand(seed) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Build dot positions clustered around Mexican urban areas
// Normalized 0-1 space, then mapped to canvas
const CLUSTERS = [
  { cx: 0.52, cy: 0.48, weight: 0.35, spread: 0.10 }, // CDMX / centro
  { cx: 0.28, cy: 0.30, weight: 0.18, spread: 0.08 }, // Guadalajara
  { cx: 0.62, cy: 0.20, weight: 0.16, spread: 0.08 }, // Monterrey
  { cx: 0.44, cy: 0.58, weight: 0.08, spread: 0.06 }, // Puebla / Cuernavaca
  { cx: 0.72, cy: 0.58, weight: 0.07, spread: 0.07 }, // Veracruz / Xalapa
  { cx: 0.18, cy: 0.48, weight: 0.06, spread: 0.07 }, // Culiacán / Mazatlán
  { cx: 0.80, cy: 0.72, weight: 0.05, spread: 0.08 }, // Mérida / Campeche
  { cx: 0.35, cy: 0.68, weight: 0.05, spread: 0.09 }, // Oaxaca / Chiapas
];

function buildDots() {
  const dots = [];
  let clusterTotals = CLUSTERS.map(c => Math.round(c.weight * MAX_THEATERS));
  // Assign remaining to largest cluster
  const rem = MAX_THEATERS - clusterTotals.reduce((a, b) => a + b, 0);
  clusterTotals[0] += rem;

  let idx = 0;
  for (let ci = 0; ci < CLUSTERS.length; ci++) {
    const cl = CLUSTERS[ci];
    const n  = clusterTotals[ci];
    for (let i = 0; i < n; i++) {
      // Gaussian-ish distribution within cluster using Box-Muller
      const u1 = srand(idx * 3.1 + ci * 7.7 + 1);
      const u2 = srand(idx * 5.3 + ci * 3.1 + 2);
      const r  = Math.sqrt(-2 * Math.log(Math.max(0.001, u1)));
      const th = 2 * Math.PI * u2;
      const dx = r * Math.cos(th) * cl.spread;
      const dy = r * Math.sin(th) * cl.spread * 0.7; // slightly compressed Y
      dots.push({
        rx:    Math.max(0.03, Math.min(0.97, cl.cx + dx)),
        ry:    Math.max(0.05, Math.min(0.88, cl.cy + dy)),
        phase: srand(idx * 9.7) * Math.PI * 2,
        // Theaters in smaller clusters/periphery close first
        priority: ci + srand(idx * 4.1) * 0.8,
      });
      idx++;
    }
  }
  // Sort so high-priority (peripheral) dots close first
  dots.sort((a, b) => b.priority - a.priority);
  return dots;
}

const DOTS = buildDots();

function TheatersCanvas() {
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

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.004;

      // Cycle through years
      const N        = THEATER_HISTORY.length;
      const cyclePos = t % N;
      const idxA     = Math.floor(cyclePos) % N;
      const idxB     = (idxA + 1) % N;
      const blend    = cyclePos - Math.floor(cyclePos);
      const curCount = THEATER_HISTORY[idxA].count * (1 - blend) + THEATER_HISTORY[idxB].count * blend;
      const curYear  = THEATER_HISTORY[idxA].year;

      const activeCount  = Math.round(curCount);
      const closedCount  = MAX_THEATERS - activeCount;

      const padX = w * 0.05;
      const padY = h * 0.06;
      const usW  = w - padX * 2;
      const usH  = h - padY * 2;
      const dotR = Math.max(2, Math.min(w, h) * 0.006);

      // Is this a mass-extinction moment? (2021 → 2022 drop)
      const isExtinction = idxA === 6 && blend > 0.3; // 2021→2022

      for (let i = 0; i < MAX_THEATERS; i++) {
        const dot      = DOTS[i];
        const x        = padX + dot.rx * usW;
        const y        = padY + dot.ry * usH;
        const isActive = i < activeCount;

        if (isActive) {
          const pulse = 0.65 + 0.35 * Math.sin(t * 1.1 + dot.phase);

          // Glow — only for closer-to-active (not every dot to save GPU)
          if (dotR > 2) {
            const glow = ctx.createRadialGradient(x, y, 0, x, y, dotR * 5);
            glow.addColorStop(0, `rgba(201,168,76,${pulse * 0.35})`);
            glow.addColorStop(1, 'rgba(201,168,76,0)');
            ctx.beginPath();
            ctx.arc(x, y, dotR * 5, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(x, y, dotR * (0.85 + 0.15 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${0.75 + 0.25 * pulse})`;
          ctx.fill();

        } else {
          // Dead theater — ember color (dim red-orange) not invisible grey
          // Theaters that just closed recently flicker more
          const recencyFactor = Math.max(0, 1 - (closedCount - (MAX_THEATERS - activeCount - i)) * 0.03);
          const emberBase = isExtinction
            ? 0.25 + 0.20 * Math.sin(t * 3 + dot.phase) // flash during mass extinction
            : 0.06 + 0.04 * Math.sin(t * 0.4 + dot.phase * 1.5);

          const alpha = Math.max(0.04, emberBase * (0.5 + recencyFactor * 0.5));

          // Ember: warm red-orange
          ctx.beginPath();
          ctx.arc(x, y, dotR * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,60,20,${alpha})`;
          ctx.fill();

          // Tiny white-hot center for recently closed
          if (recencyFactor > 0.7 && isExtinction) {
            ctx.beginPath();
            ctx.arc(x, y, dotR * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,200,100,${alpha * 1.5})`;
            ctx.fill();
          }
        }
      }

      // Labels
      const labelY = h - padY * 0.5;
      ctx.textAlign = 'center';
      ctx.font      = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.fillStyle = 'rgba(201,168,76,0.42)';
      ctx.fillText(`${curYear} — ${activeCount} SALAS ACTIVAS`, w / 2, labelY);

      if (closedCount > 0) {
        const closedPct = Math.round((closedCount / MAX_THEATERS) * 100);
        const intensity = isExtinction
          ? 0.22 + 0.14 * Math.abs(Math.sin(t * 4))
          : 0.10 + 0.05 * Math.sin(t * 1.5);
        ctx.fillStyle = `rgba(180,60,20,${intensity})`;
        ctx.font      = `${Math.max(8, w * 0.009)}px 'Courier New', monospace`;
        ctx.fillText(`${closedCount} salas extintas — ${closedPct}% de la red`, w / 2, h - padY * 0.12);
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="artwork-canvas" />;
}

const CAPTION = {
  title:       'Extinción por Franquicia',
  artist:      'MextrategIA',
  year:        '2025',
  medium:      'Intervención de dominio digital / Net-art especulativo',
  lot:         'LOT-CMX-001',
  description: 'Cada punto de luz es una sala Cinemex. Los puntos dorados respiran — ' +
               'aún operan. Los puntos rojos permanecen: salas extintas que no desaparecen ' +
               'del mapa porque el territorio que ocuparon sigue ahí. ' +
               'La quiebra de 2021 encendió la extinción: 138 salas apagadas en cuatro años. ' +
               'El dominio cinemex.ai es el archivo de ese silencio.',
};

export default function Cinemex() {
  return (
    <ArtworkShell corpId="cinemex" domain="cinemex.ai" caption={CAPTION}>
      <TheatersCanvas />
    </ArtworkShell>
  );
}
