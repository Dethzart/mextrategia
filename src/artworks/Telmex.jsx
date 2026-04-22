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

    // Stable noise — valid float RNG without JS overflow
    function noise1d(x) {
      const s = Math.sin(x * 127.1) * 43758.5453;
      return s - Math.floor(s);
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.006;

      const WAVES   = 5;
      const padX    = w * 0.06;
      const padY    = h * 0.10;
      const usableH = h - padY * 2;
      const waveH   = usableH / WAVES;

      // Cycle through years
      const cyclePos = t % N;
      const idxA     = Math.floor(cyclePos) % N;
      const idxB     = (idxA + 1) % N;
      const blend    = cyclePos - Math.floor(cyclePos);
      const curLines = LINES_DATA[idxA].lines * (1 - blend) + LINES_DATA[idxB].lines * blend;
      const curYear  = LINES_DATA[idxA].year;

      const intactRatio = curLines / LINES_MAX;          // 0.42–1.0
      const corruption  = 1 - intactRatio;               // 0–0.58
      const freqDrift   = 1 + corruption * 2.5;

      for (let wi = 0; wi < WAVES; wi++) {
        const baseY      = padY + wi * waveH + waveH * 0.5;
        // Minimum amplitude floor — always visible, grows toward peak
        const amplitude  = waveH * (0.18 + 0.22 * intactRatio);
        const freq       = (0.016 + wi * 0.005) * freqDrift;
        const phaseShift = wi * 1.3 + t * (0.55 + wi * 0.09);

        // Each wave degrades slightly more than the previous
        const waveCorrupt = Math.min(1, corruption + wi * 0.06);
        const waveIntact  = 1 - waveCorrupt;

        const steps = Math.min(Math.floor(w / 1.5), 600);
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
          const px = i / steps;
          const x  = padX + px * (w - padX * 2);

          // Base sine
          const sine = Math.sin(px * Math.PI * 2 * freq * (w / 80) + phaseShift) * amplitude;

          // Two layers of noise — deterministic so no flicker
          const n1 = (noise1d(px * 31.7 + wi * 5.1 + Math.floor(t * 4) * 0.17) * 2 - 1);
          const n2 = (noise1d(px * 73.1 + wi * 9.3 + Math.floor(t * 7) * 0.11) * 2 - 1);
          const noiseAmt = waveH * waveCorrupt * (n1 * 0.28 + n2 * 0.12);

          // Dropout: random horizontal segments clipped to baseY — CRT style
          const dropThresh = 0.55 + waveIntact * 0.45;
          const dropout    = noise1d(px * 11.3 + wi * 2.7 + Math.floor(t * 3) * 0.13) > dropThresh;
          const y          = baseY + (dropout ? noiseAmt * 0.5 : sine + noiseAmt * 0.35);

          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        // Color: gold at peak, shifts to grey-green static at full corruption
        const r = Math.round(201 * waveIntact + 50 * waveCorrupt);
        const g = Math.round(168 * waveIntact + 80 * waveCorrupt);
        const b = Math.round(76  * waveIntact + 60 * waveCorrupt);
        // Alpha has a higher floor so wave is always legible
        const alpha = 0.30 + waveIntact * 0.55;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 1 + waveIntact * 0.8;
        ctx.stroke();
      }

      // Year / lines label
      ctx.fillStyle = 'rgba(201,168,76,0.40)';
      ctx.font      = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${curYear} — ${curLines.toFixed(1)}M LÍNEAS FIJAS`, w / 2, h - padY * 0.5);

      // Degradation label
      if (intactRatio < 0.95) {
        const lostPct = Math.round(corruption * 100);
        ctx.fillStyle = `rgba(201,168,76,${0.12 + 0.10 * Math.sin(t * 2.5)})`;
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
