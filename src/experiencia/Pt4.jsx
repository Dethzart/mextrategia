import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt4.module.css';
import { playPop } from '../lib/sfx';
import useThemeColor from '../lib/useThemeColor';

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
  const [voiceDuration, setVoiceDuration] = useState('0:00');

  useThemeColor('#0e1215');

  useEffect(() => {
    const t = setInterval(() => setTime(getClockTime()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const a = new Audio('/acto1/voicenote.m4a');
    a.addEventListener('loadedmetadata', () => {
      if (isFinite(a.duration)) {
        const m = Math.floor(a.duration / 60);
        const s = Math.floor(a.duration % 60);
        setVoiceDuration(`${m}:${s.toString().padStart(2, '0')}`);
      }
    });

    const t = setTimeout(() => {
      setShowNotif(true);
      playPop();
    }, 1400);
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
          <div className={styles.notifPreview}>&#9654; Nota de voz · {voiceDuration}</div>
        </div>
      )}

      <div className={styles.swipeHint}>Desliza para desbloquear</div>
    </div>
  );
}
