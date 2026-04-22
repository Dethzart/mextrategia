import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

// Cinemex theater count history — closures after 2021 bankruptcy filing
const THEATER_HISTORY = [
  { year: '2015', count: 318 }, { year: '2016', count: 332 },
  { year: '2017', count: 341 }, { year: '2018', count: 349 },
  { year: '2019', count: 356 }, { year: '2020', count: 356 },
  { year: '2021', count: 340 }, { year: '2022', count: 298 },
  { year: '2023', count: 261 }, { year: '2024', count: 234 },
  { year: '2025', count: 218 },
];

const MAX_THEATERS = Math.max(...THEATER_HISTORY.map(d => d.count)); // 356

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

    // Stable pseudo-random positions for each dot
    const rng = (seed) => {
      let s = seed * 9301 + 49297;
      s = (s * 233280 + 49297) % 233280;
      return s / 233280;
    };

    const TOTAL_DOTS = MAX_THEATERS;
    const dots = Array.from({ length: TOTAL_DOTS }, (_, i) => ({
      rx: rng(i * 3 + 1),
      ry: rng(i * 3 + 2),
      phase: rng(i * 3 + 3) * Math.PI * 2,
    }));

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.003;

      // Interpolate through theater history
      const cyclePos  = t % THEATER_HISTORY.length;
      const idxA      = Math.floor(cyclePos) % THEATER_HISTORY.length;
      const idxB      = (idxA + 1) % THEATER_HISTORY.length;
      const blend     = cyclePos - Math.floor(cyclePos);
      const curCount  = THEATER_HISTORY[idxA].count * (1 - blend) + THEATER_HISTORY[idxB].count * blend;
      const curYear   = THEATER_HISTORY[idxA].year;

      const activeCount = Math.round(curCount);
      const closedCount = TOTAL_DOTS - activeCount;

      // Layout: dots in a grid-like scattered arrangement
      const margin = Math.min(w, h) * 0.08;
      const usableW = w - margin * 2;
      const usableH = h - margin * 2;

      const dotR = Math.max(2.5, Math.min(w, h) * 0.007);

      for (let i = 0; i < TOTAL_DOTS; i++) {
        const dot = dots[i];
        const x   = margin + dot.rx * usableW;
        const y   = margin + dot.ry * usableH * 0.82;
        const isActive = i < activeCount;

        if (isActive) {
          // Active theater — bright warm dot
          const pulse = 0.7 + 0.3 * Math.sin(t * 1.2 + dot.phase);
          const glow  = ctx.createRadialGradient(x, y, 0, x, y, dotR * 4);
          glow.addColorStop(0, `rgba(201,168,76,${pulse * 0.45})`);
          glow.addColorStop(1, 'rgba(201,168,76,0)');
          ctx.beginPath();
          ctx.arc(x, y, dotR * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${pulse})`;
          ctx.fill();
        } else {
          // Closed theater — dim ghost dot with faint flicker
          const flicker = 0.04 + 0.03 * Math.sin(t * 0.5 + dot.phase * 2);
          ctx.beginPath();
          ctx.arc(x, y, dotR * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(120,100,80,${flicker})`;
          ctx.fill();
        }
      }

      // Year and count label
      ctx.fillStyle = 'rgba(201,168,76,0.4)';
      ctx.font      = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${curYear} — ${activeCount} SALAS ACTIVAS`, w / 2, h - margin * 0.5);

      // Extinction notice when past 2021 peak
      if (activeCount < 350) {
        const closedPct = Math.round((closedCount / TOTAL_DOTS) * 100);
        ctx.fillStyle = `rgba(201,168,76,${0.1 + 0.06 * Math.sin(t * 2)})`;
        ctx.font      = `${Math.max(8, w * 0.009)}px 'Courier New', monospace`;
        ctx.fillText(`${closedPct}% de la red, en silencio`, w / 2, h - margin * 0.18);
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
  description: 'Cada punto de luz es una sala Cinemex que existió. Desde el pico de 356 ' +
               'ubicaciones en 2019, la quiebra de 2021 inició una extinción silenciosa: ' +
               'más de 130 puntos se apagaron para siempre. Los puntos oscuros no desaparecen —' +
               'permanecen como testigos del territorio perdido. El dominio cinemex.ai ' +
               'registra el momento en que una franquicia aprendió que el espacio físico ' +
               'no es suficiente estrategia digital.',
};

export default function Cinemex() {
  return (
    <ArtworkShell corpId="cinemex" domain="cinemex.ai" caption={CAPTION}>
      <TheatersCanvas />
    </ArtworkShell>
  );
}
