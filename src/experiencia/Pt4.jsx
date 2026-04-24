import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt4.module.css';

function getClockTime() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Mexico_City',
  });
}

function getClockDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
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
      <div className={styles.wallpaper} />
      <div className={styles.overlay} />

      {/* Clock */}
      <div className={styles.clockBlock}>
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>{getClockDate()}</div>
      </div>

      {/* WhatsApp notification */}
      {showNotif && (
        <div className={styles.notifBanner} onClick={() => navigate('/pt2')}>
          <div className={styles.notifHeader}>
            <div className={styles.notifIcon}>WA</div>
            <span className={styles.notifApp}>WhatsApp</span>
            <span className={styles.notifDot} />
            <span className={styles.notifTime}>ahora</span>
          </div>
          <div className={styles.notifSender}>Dethz Sagrav</div>
          <div className={styles.notifPreview}>&#9654; Nota de voz · 0:37</div>
        </div>
      )}

      <div className={styles.swipeHint}>Desliza para desbloquear</div>
    </div>
  );
}
