import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt4.module.css';

function getClockTime() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Mexico_City'
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
    const t = setTimeout(() => setShowNotif(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.root} onClick={() => showNotif && navigate('/pt5')}>
      {/* Lock screen */}
      <div className={styles.lockScreen}>
        <div className={styles.clockBlock}>
          <div className={styles.clockTime}>{time}</div>
          <div className={styles.clockDate}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month: 'long',
              timeZone: 'America/Mexico_City'
            })}
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {showNotif && (
        <div className={styles.notifBanner}>
          <div className={styles.notifApp}>
            <div className={styles.notifIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.85L.057 23.292a.75.75 0 00.91.91l5.442-1.475A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.826 9.826 0 01-5.016-1.373l-.36-.213-3.23.876.876-3.23-.213-.36A9.826 9.826 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" fill="#25D366"/>
              </svg>
            </div>
            <div className={styles.notifMeta}>
              <span className={styles.notifAppName}>WhatsApp</span>
              <span className={styles.notifTimestamp}>ahora</span>
            </div>
          </div>
          <div className={styles.notifSender}>ESPECTRO</div>
          <div className={styles.notifPreview}>
            <span className={styles.notifMic}>🎤</span>
            <span>Nota de voz · 0:37</span>
          </div>
        </div>
      )}

      {showNotif && (
        <div className={styles.tapHint}>toca para abrir</div>
      )}

      <div className={styles.watermark}>Espectro invisible para desafiar</div>
    </div>
  );
}
