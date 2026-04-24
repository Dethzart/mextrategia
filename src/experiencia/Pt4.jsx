import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt4.module.css';

function getClockTime() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Mexico_City',
  });
}

export default function Pt4() {
  const navigate = useNavigate();
  const [time, setTime] = useState(getClockTime);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(getClockTime()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowNotif(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.clockBlock}>
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long',
            timeZone: 'America/Mexico_City',
          })}
        </div>
      </div>

      {showNotif && (
        <div className={styles.notifBanner} onClick={() => navigate('/pt5')}>
          <div className={styles.notifRow}>
            <div className={styles.notifDot} />
            <div className={styles.notifAppName}>WhatsApp</div>
            <div className={styles.notifTs}>ahora</div>
          </div>
          <div className={styles.notifSender}>ESPECTRO</div>
          <div className={styles.notifPreview}>🎤 Nota de voz · 0:37</div>
        </div>
      )}
    </div>
  );
}
