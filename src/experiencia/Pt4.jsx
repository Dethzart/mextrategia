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
      {/* Blurred wallpaper background */}
      <div className={styles.wallpaper} />
      <div className={styles.overlay} />

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusTime}>{time}</span>
        <div className={styles.statusIcons}>
          <span>▪▪▪▪</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* Clock */}
      <div className={styles.clockBlock}>
        <div className={styles.clockTime}>{time}</div>
        <div className={styles.clockDate}>{getClockDate()}</div>
      </div>

      {/* WhatsApp notification */}
      {showNotif && (
        <div className={styles.notifBanner} onClick={() => navigate('/pt2')}>
          <div className={styles.notifHeader}>
            <div className={styles.notifIcon}>
              <span className={styles.notifIconGlyph}>💬</span>
            </div>
            <span className={styles.notifApp}>WhatsApp</span>
            <span className={styles.notifDot} />
            <span className={styles.notifTime}>ahora</span>
          </div>
          <div className={styles.notifSender}>Dethz Sagrav</div>
          <div className={styles.notifPreview}>🎤 Nota de voz · 0:37</div>
        </div>
      )}

      {/* Swipe hint */}
      <div className={styles.swipeHint}>Desliza para desbloquear</div>
    </div>
  );
}
