import { useEffect, useRef } from 'react';
import ArtworkShell from './ArtworkShell';

// Inbursa net income (MXN billions) 2010–2025
const INCOME_DATA = [
  { year: '2010', income: 4.2  }, { year: '2011', income: 5.1  },
  { year: '2012', income: 6.3  }, { year: '2013', income: 7.8  },
  { year: '2014', income: 8.9  }, { year: '2015', income: 10.4 },
  { year: '2016', income: 11.7 }, { year: '2017', income: 13.2 },
  { year: '2018', income: 14.8 }, { year: '2019', income: 16.1 },
  { year: '2020', income: 12.3 }, { year: '2021', income: 18.4 },
  { year: '2022', income: 21.9 }, { year: '2023', income: 25.3 },
  { year: '2024', income: 27.8 }, { year: '2025', income: 30.1 },
];

const INCOME_MAX = Math.max(...INCOME_DATA.map(d => d.income));
const N = INCOME_DATA.length;

function GravityCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let rafId;
    let t = 0;

    function resize() {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      initParticles(canvas.width, canvas.height);
    }

    const PARTICLE_COUNT = 280;
    let particles = [];

    const rng = (seed) => {
      let s = (seed * 9301 + 49297) % 233280;
      return s / 233280;
    };

    function initParticles(w, h) {
      particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = rng(i * 3) * Math.PI * 2;
        const dist  = 0.1 + rng(i * 3 + 1) * 0.45;
        const r     = Math.min(w, h) * 0.42;
        return {
          x:     w / 2 + Math.cos(angle) * r * dist,
          y:     h / 2 + Math.sin(angle) * r * dist,
          vx:    (rng(i * 3 + 2) - 0.5) * 0.4,
          vy:    (rng(i * 3 + 1) - 0.5) * 0.4,
          mass:  0.3 + rng(i) * 0.7,
          phase: rng(i * 7) * Math.PI * 2,
          layer: Math.floor(rng(i * 11) * 4), // 0=outer, 3=inner
        };
      });
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.006;

      // Current data position
      const cyclePos   = t % N;
      const idxA       = Math.floor(cyclePos) % N;
      const idxB       = (idxA + 1) % N;
      const blend      = cyclePos - Math.floor(cyclePos);
      const curIncome  = INCOME_DATA[idxA].income * (1 - blend) + INCOME_DATA[idxB].income * blend;
      const curYear    = INCOME_DATA[idxA].year;

      // Gravity strength grows with income — more capital, stronger pull
      const gravStrength = (curIncome / INCOME_MAX) * 0.018;
      const cx = w / 2;
      const cy = h / 2;

      // Update and draw particles
      for (const p of particles) {
        const dx  = cx - p.x;
        const dy  = cy - p.y;
        const d   = Math.sqrt(dx * dx + dy * dy);

        // Gravity pull toward center
        const force = gravStrength * p.mass / Math.max(1, d * 0.005);
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;

        // Orbital tangent — keeps particles circling, not collapsing
        const tangX = -dy / d;
        const tangY =  dx / d;
        const orbitSpeed = 0.008 * (1 + p.layer * 0.5);
        p.vx += tangX * orbitSpeed;
        p.vy += tangY * orbitSpeed;

        // Damping
        p.vx *= 0.988;
        p.vy *= 0.988;

        p.x += p.vx;
        p.y += p.vy;

        // Clamp within canvas
        if (p.x < 0 || p.x > w) { p.vx *= -0.5; p.x = Math.max(0, Math.min(w, p.x)); }
        if (p.y < 0 || p.y > h) { p.vy *= -0.5; p.y = Math.max(0, Math.min(h, p.y)); }

        // Distance from center for color/size
        const distFromCenter = Math.hypot(p.x - cx, p.y - cy);
        const maxR           = Math.min(w, h) * 0.45;
        const proximity      = 1 - Math.min(1, distFromCenter / maxR);

        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + p.phase);
        const alpha = (0.25 + proximity * 0.65) * (0.6 + pulse * 0.4);
        const radius = Math.max(1, (1.5 + proximity * 2.5) * (0.7 + p.mass * 0.5));

        // Color: outer = dim grey-brown, inner = gold
        const r_ = Math.round(60 + proximity * 141);
        const g_ = Math.round(50 + proximity * 118);
        const b_ = Math.round(40 + proximity * 36);

        // Glow for inner particles
        if (proximity > 0.5) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5);
          glow.addColorStop(0, `rgba(${r_},${g_},${b_},${alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r_},${g_},${b_},${alpha})`;
        ctx.fill();
      }

      // Central attractor glow
      const coreR   = Math.min(w, h) * 0.04 * (curIncome / INCOME_MAX);
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 4);
      coreGlow.addColorStop(0, `rgba(201,168,76,${0.4 + 0.2 * Math.sin(t * 2)})`);
      coreGlow.addColorStop(0.4, `rgba(201,168,76,0.08)`);
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 4, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${0.7 + 0.3 * Math.sin(t * 2)})`;
      ctx.fill();

      // Year and income label
      const padY = Math.min(w, h) * 0.06;
      ctx.fillStyle = 'rgba(201,168,76,0.38)';
      ctx.font      = `${Math.max(10, w * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${curYear} — $${curIncome.toFixed(1)}B MXN UTILIDAD NETA`, cx, h - padY * 0.6);

      ctx.fillStyle = `rgba(201,168,76,${0.08 + 0.05 * Math.sin(t * 1.8)})`;
      ctx.font      = `${Math.max(8, w * 0.009)}px 'Courier New', monospace`;
      ctx.fillText('el capital no se distribuye — se concentra', cx, h - padY * 0.15);

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="artwork-canvas" />;
}

const CAPTION = {
  title:       'Rendimiento Concentrado',
  artist:      'MextrategIA',
  year:        '2025',
  medium:      'Intervención de dominio digital / Net-art especulativo',
  lot:         'LOT-INB-001',
  description: '280 partículas orbitan un núcleo de gravedad financiera que crece con la ' +
               'utilidad neta de Inbursa: de $4.2B en 2010 a $30.1B en 2025. La atracción ' +
               'aumenta cada año, acercando el capital al centro y alejando a los participantes ' +
               'periféricos. La física del modelo reproduce la física del negocio. ' +
               'El dominio inbursa.ai registra la paradoja: más tecnología financiera, ' +
               'menos distribución del rendimiento.',
};

export default function Inbursa() {
  return (
    <ArtworkShell corpId="inbursa" domain="inbursa.ai" caption={CAPTION}>
      <GravityCanvas />
    </ArtworkShell>
  );
}
