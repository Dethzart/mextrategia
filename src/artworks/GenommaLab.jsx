import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

// ── LABB quarterly closing prices Q1 2013 → Q1 2026 ──
const LABB_DATA = [
  { quarter: 'Q1 2013', price: 42.50 }, { quarter: 'Q2 2013', price: 44.80 },
  { quarter: 'Q3 2013', price: 40.10 }, { quarter: 'Q4 2013', price: 36.20 },
  { quarter: 'Q1 2014', price: 34.90 }, { quarter: 'Q2 2014', price: 33.40 },
  { quarter: 'Q3 2014', price: 30.60 }, { quarter: 'Q4 2014', price: 28.80 },
  { quarter: 'Q1 2015', price: 27.30 }, { quarter: 'Q2 2015', price: 26.10 },
  { quarter: 'Q3 2015', price: 24.70 }, { quarter: 'Q4 2015', price: 23.50 },
  { quarter: 'Q1 2016', price: 22.90 }, { quarter: 'Q2 2016', price: 24.30 },
  { quarter: 'Q3 2016', price: 23.10 }, { quarter: 'Q4 2016', price: 21.80 },
  { quarter: 'Q1 2017', price: 20.40 }, { quarter: 'Q2 2017', price: 19.70 },
  { quarter: 'Q3 2017', price: 18.90 }, { quarter: 'Q4 2017', price: 18.20 },
  { quarter: 'Q1 2018', price: 17.60 }, { quarter: 'Q2 2018', price: 16.80 },
  { quarter: 'Q3 2018', price: 16.10 }, { quarter: 'Q4 2018', price: 15.40 },
  { quarter: 'Q1 2019', price: 15.80 }, { quarter: 'Q2 2019', price: 16.50 },
  { quarter: 'Q3 2019', price: 15.90 }, { quarter: 'Q4 2019', price: 15.10 },
  { quarter: 'Q1 2020', price: 13.20 }, { quarter: 'Q2 2020', price: 14.60 },
  { quarter: 'Q3 2020', price: 15.80 }, { quarter: 'Q4 2020', price: 16.30 },
  { quarter: 'Q1 2021', price: 16.90 }, { quarter: 'Q2 2021', price: 17.40 },
  { quarter: 'Q3 2021', price: 16.80 }, { quarter: 'Q4 2021', price: 15.90 },
  { quarter: 'Q1 2022', price: 15.20 }, { quarter: 'Q2 2022', price: 14.10 },
  { quarter: 'Q3 2022', price: 13.70 }, { quarter: 'Q4 2022', price: 14.30 },
  { quarter: 'Q1 2023', price: 14.80 }, { quarter: 'Q2 2023', price: 15.50 },
  { quarter: 'Q3 2023', price: 15.10 }, { quarter: 'Q4 2023', price: 14.60 },
  { quarter: 'Q1 2024', price: 14.20 }, { quarter: 'Q2 2024', price: 13.90 },
  { quarter: 'Q3 2024', price: 13.40 }, { quarter: 'Q4 2024', price: 13.80 },
  { quarter: 'Q1 2025', price: 14.10 }, { quarter: 'Q2 2025', price: 13.60 },
  { quarter: 'Q3 2025', price: 13.20 }, { quarter: 'Q4 2025', price: 13.50 },
  { quarter: 'Q1 2026', price: 14.10 },
];

const PRICE_MAX  = Math.max(...LABB_DATA.map(d => d.price));
const PRICE_MIN  = Math.min(...LABB_DATA.map(d => d.price));
const N          = LABB_DATA.length;
const TURNS      = 2.5;
const FADE_START = 0.80;
const RUNG_END   = 0.75;
const FOV_DIST   = 900;
const ROT_SPEED  = (2 * Math.PI) / (60 * 60);

function lerp(a, b, t) { return a + (b - a) * t; }

function nodeColor(price, alpha = 1) {
  const t = 1 - (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);
  const r = Math.round(lerp(201, 58, t));
  const g = Math.round(lerp(168, 68, t));
  const b = Math.round(lerp(76,  88, t));
  return `rgba(${r},${g},${b},${alpha})`;
}

function project(x3, y3, z3, w, h) {
  const scale = FOV_DIST / (FOV_DIST + z3);
  return { x: w / 2 + x3 * scale, y: h / 2 + y3 * scale, z: z3, scale };
}

function buildNodes(rotY, w, h) {
  const helixRadius = Math.min(w, h) * 0.09;
  const helixHeight = Math.min(w, h) * 0.72;
  return LABB_DATA.map((data, i) => {
    const t     = i / (N - 1);
    const ang   = t * TURNS * 2 * Math.PI + rotY;
    const y     = (t - 0.5) * helixHeight;
    const alpha = t >= FADE_START ? 1 - (t - FADE_START) / (1 - FADE_START) : 1;
    return {
      t, alpha, data,
      a: { x: Math.cos(ang) * helixRadius,            y, z: Math.sin(ang) * helixRadius },
      b: { x: Math.cos(ang + Math.PI) * helixRadius,  y, z: Math.sin(ang + Math.PI) * helixRadius },
      hasRung: t <= RUNG_END,
    };
  });
}

function HelixCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let rotY     = 0;
    let rafId;

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
      rotY += ROT_SPEED;

      const nodes  = buildNodes(rotY, w, h);
      const sorted = [...nodes].sort((a, b) => (a.a.z + a.b.z) / 2 - (b.a.z + b.b.z) / 2);

      // Rungs
      for (const node of nodes) {
        if (!node.hasRung) continue;
        const pA  = project(node.a.x, node.a.y, node.a.z, w, h);
        const pB  = project(node.b.x, node.b.y, node.b.z, w, h);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.strokeStyle = nodeColor(node.data.price, node.alpha * 0.35);
        ctx.lineWidth   = 0.8 * pA.scale;
        ctx.stroke();
      }

      // Backbone strands
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        nodes.forEach((node, ni) => {
          const pt = s === 0 ? node.a : node.b;
          const p  = project(pt.x, pt.y, pt.z, w, h);
          ni === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = 'rgba(120,100,60,0.3)';
        ctx.lineWidth   = 1.2;
        ctx.stroke();
      }

      // Nodes
      for (const node of sorted) {
        for (const strand of [node.a, node.b]) {
          const p    = project(strand.x, strand.y, strand.z, w, h);
          const r    = Math.max(2, 4 * p.scale);
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
          glow.addColorStop(0, nodeColor(node.data.price, node.alpha * 0.5));
          glow.addColorStop(1, nodeColor(node.data.price, 0));
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor(node.data.price, node.alpha); ctx.fill();
        }
      }

      // Year labels
      nodes.filter((_, i) => i === 0 || (i % 4 === 0 && i < N - 1) || i === N - 1)
        .forEach(node => {
          if (node.alpha < 0.15) return;
          const pA = project(node.a.x, node.a.y, node.a.z, w, h);
          const yr = node.data.quarter.split(' ')[1];
          ctx.fillStyle = `rgba(201,168,76,${node.alpha * 0.45})`;
          ctx.font      = `${Math.max(8, 10 * pA.scale)}px 'Courier New', monospace`;
          ctx.fillText(yr, pA.x + 8 * pA.scale, pA.y);
        });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="artwork-canvas" />;
}

const CAPTION = {
  title:       'Genoma de la Inercia',
  artist:      'MextrategIA',
  year:        '2025',
  medium:      'Intervención de dominio digital / Net-art especulativo',
  lot:         'LOT-GNM-001',
  description: 'Secuencia generativa extraída de los registros bursátiles de Genomma Lab ' +
               'desde su pico de capitalización en 2013. Cada nodo representa un trimestre ' +
               'de deterioro acumulado. La secuencia nunca completa la hélice. ' +
               'El dominio genommalab.ai —apropiado como gesto artístico— permanece activo ' +
               'como archivo del tiempo perdido y del fracaso estratégico ante la transición digital.',
};

export default function GenommaLab() {
  return (
    <ArtworkShell corpId="genommalab" domain="genommalab.ai" caption={CAPTION}>
      <HelixCanvas />
    </ArtworkShell>
  );
}
