import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div className={styles.center}>
        <div className={styles.cta}>
          <div className={styles.logo}>MEXTRATEGIA</div>
          <div className={styles.subtitle}>Intervención en el dominio digital</div>
          <button className={styles.btnStart} onClick={() => navigate('/pt1')}>
            INICIAR
          </button>
        </div>
      </div>
      <div className={styles.watermark}>DETHZ SAGRAV</div>
    </div>
  );
}
