import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const BOOT_LINES = [
  '// INICIANDO CONEXIÓN...',
  '// ESPECTRO DETECTADO',
  '// PROTOCOLO ACTIVO',
];

export default function Landing() {
  const navigate = useNavigate();
  const [lineIndex, setLineIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (lineIndex < BOOT_LINES.length - 1) {
      const t = setTimeout(() => setLineIndex(i => i + 1), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, [lineIndex]);

  return (
    <div className={styles.root}>
      {/* CSS-only background: scanlines + radial glow */}
      <div className={styles.scanlines} />
      <div className={styles.glow} />
      <div className={styles.vignette} />

      <div className={styles.center}>
        <div className={styles.terminal}>
          {BOOT_LINES.slice(0, lineIndex + 1).map((line, i) => (
            <div
              key={i}
              className={`${styles.termLine} ${i < lineIndex ? styles.dimmed : styles.active}`}
            >
              {line}
            </div>
          ))}
        </div>

        {ready && (
          <div className={styles.cta}>
            <div className={styles.title}>ESPECTRO</div>
            <div className={styles.subtitle}>una intervención en el dominio digital</div>
            <button className={styles.btnStart} onClick={() => navigate('/pt1')}>
              [ INICIAR EXPERIENCIA ]
            </button>
          </div>
        )}
      </div>

      <div className={styles.watermark}>Espectro invisible para desafiar</div>
    </div>
  );
}
