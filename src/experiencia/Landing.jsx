import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const BOOT_LINES = [
  '// INICIANDO CONEXIÓN...',
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
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, [lineIndex]);

  return (
    <div className={styles.root}>
      <div className={styles.center}>
        <div className={styles.terminal}>
          {BOOT_LINES.slice(0, lineIndex + 1).map((line, i) => (
            <div key={i} className={i < lineIndex ? styles.dimmed : styles.active}>
              {line}
            </div>
          ))}
        </div>

        {ready && (
          <div className={styles.cta}>
            <div className={styles.title}>MEXTRATEGIA</div>
            <div className={styles.subtitle}>intervención en el dominio digital</div>
            <button className={styles.btnStart} onClick={() => navigate('/pt1')}>
              INICIAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
