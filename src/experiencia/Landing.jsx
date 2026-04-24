import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Precarga silenciosa de audios pesados para asegurar respuesta instantánea
    const assets = [
      '/acto1/ringtone.mp3',
      '/acto1/Audio1A.mp3',
      '/acto1/Audio1B.mp3',
      '/acto1/Audio2VoiceNote.mp3'
    ];
    assets.forEach(src => {
      const a = new Audio();
      a.preload = 'auto';
      a.src = src;
    });
  }, []);

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
