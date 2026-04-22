import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

// Telmex fixed-line subscriptions (millions) 2000–2025
const LINES_DATA = [
  { year: '2000', lines: 12.3 }, { year: '2001', lines: 13.1 },
  { year: '2002', lines: 13.7 }, { year: '2003', lines: 14.9 },
  { year: '2004', lines: 15.9 }, { year: '2005', lines: 18.0 },
  { year: '2006', lines: 19.2 }, { year: '2007', lines: 19.7 },
  { year: '2008', lines: 19.8 }, { year: '2009', lines: 19.4 },
  { year: '2010', lines: 19.0 }, { year: '2011', lines: 17.7 },
  { year: '2012', lines: 17.3 }, { year: '2013', lines: 16.8 },
  { year: '2014', lines: 16.0 }, { year: '2015', lines: 15.1 },
  { year: '2016', lines: 14.5 }, { year: '2017', lines: 13.9 },
  { year: '2018', lines: 13.2 }, { year: '2019', lines: 12.5 },
  { year: '2020', lines: 11.8 }, { year: '2021', lines: 11.0 },
  { year: '2022', lines: 10.2 }, { year: '2023', lines: 9.5  },
  { year: '2024', lines: 8.9  }, { year: '2025', lines: 8.3  },
];

const LINES_MAX = Math.max(...LINES_DATA.map(d => d.lines));
const N = LINES_DATA.length;

function SignalCanvas() {
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
      t += 0.008;

      const WAVES    = 5;
      const padX     = w * 0.06;
      const padY     = h * 0.12;
      const usableH  = h - padY * 2;
      const waveH    = usableH / WAVES;

      // Current data position (cycles through years)
      const cyclePos = t % N;
      const idxA     = Math.floor(cyclePos) % N;
      const idxB     = (idxA + 1) % N;
      const blend    = cyclePos - Math.floor(cyclePos);
      const curLines = LINES_DATA[idxA].lines * (1 - blend) + LINES_DATA[idxB].lines * blend;
      const curYear  = LINES_DATA[idxA].year;

      // Degradation: noise increases as lines drop
      const intactRatio    = curLines / LINES_MAX;
      const noiseAmplitude = (1 - intactRatio) * 0.85;
      const freqDrift      = 1 + (1 - intactRatio) * 3.5;

      for (let wi = 0; wi < WAVES; wi++) {
        const baseY      = padY + wi * waveH + waveH * 0.5;
        const amplitude  = waveH * 0.32 * intactRatio;
        const freq       = (0.018 + wi * 0.004) * freqDrift;
        const phaseShift = wi * 1.1 + t * (0.6 + wi * 0.08);

        // Signal quality varies per wave
        const waveIntact = Math.max(0, intactRatio - wi * 0.04);
        const waveNoise  = noiseAmplitude + wi * 0.06;

        ctx.beginPath();
        const steps = Math.floor(w / 2);
        for (let i = 0; i <= steps; i++) {
          const x   = padX + (i / steps) * (w - padX * 2);
          const px  = i / steps;

          // Clean sine component
          const sine    = Math.sin(px * Math.PI * 2 * freq * (w / 100) + phaseShift) * amplitude;

          // Noise injection — increases with degradation
          const seed    = (i + wi * 1000 + Math.floor(t * 8)) * 6364136223846793005;
          const pseudo  = ((seed ^ (seed >> 33)) * 1442695040888963407) / 2 ** 53;
          const noise   = (pseudo * 2 - 1) * waveH * waveNoise * 0.22;

          // Dropout segments — signal goes flat/random at high degradation
          const dropout = waveNoise > 0.4 && Math.sin(px * 17 + t + wi) > 0.7 - waveNoise * 0.5;
          const y       = baseY + (dropout ? noise * 0.6 : sine + noise * 0.3);

          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        const alpha     = 0.15 + waveIntact * 0.65;
        const goldRatio = waveIntact;
        const r = Math.round(201 * goldRatio + 40 * (1 - goldRatio));
        const g = Math.round(168 * goldRatio + 40 * (1 - goldRatio));
        const b = Math.round(76  * goldRatio + 60 * (1 - goldRatio));
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 1.2 * (0.5 + waveIntact * 0.5);
        ctx.stroke();
      }

      // Year and lines label
      ctx.fillStyle = 'rgba(201,168,76,0.38)';
      ctx.font      = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${curYear} — ${curLines.toFixed(1)}M LÍNEAS FIJAS`,
        w / 2,
        h - padY * 0.45,
      );

      // Signal degradation label
      if (intactRatio < 0.85) {
        const lostPct = Math.round((1 - intactRatio) * 100);
        ctx.fillStyle = `rgba(201,168,76,${0.08 + 0.07 * Math.sin(t * 2.5)})`;
        ctx.font      = `${Math.max(8, w * 0.009)}px 'Courier New', monospace`;
        ctx.fillText(`señal degradada ${lostPct}%`, w / 2, h - padY * 0.12);
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="artwork-canvas" />;
}

const CAPTION = {
  title:       'Señal Degradada',
  artist:      'MextrategIA',
  year:        '2025',
  medium:      'Intervención de dominio digital / Net-art especulativo',
  lot:         'LOT-TLX-001',
  description: 'Cinco ondas de señal representan la red de líneas fijas de Telmex desde su ' +
               'pico de 19.8 millones en 2008. Conforme las líneas disminuyen, la señal se ' +
               'corrompe: el ruido reemplaza la frecuencia, los segmentos colapsan en silencio ' +
               'estático. En 2025, más de 11 millones de líneas han desaparecido. La onda ' +
               'nunca recupera su forma original. El dominio telmex.ai testimonia el costo ' +
               'de mantener infraestructura analógica en un mundo que migró sin esperar.',
};

export default function Telmex() {
  return (
    <ArtworkShell corpId="telmex" domain="telmex.ai" caption={CAPTION}>
      <SignalCanvas />
    </ArtworkShell>
  );
}
