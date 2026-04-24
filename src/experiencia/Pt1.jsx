import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt1.module.css';

function useClockTime() {
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setT(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }))
    , 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Pt1() {
  const navigate     = useNavigate();
  const ringtoneRef  = useRef(null);
  const audioRef     = useRef(null);
  const timerRef     = useRef(null);
  const clockTime    = useClockTime();

  const [phase, setPhase]       = useState('ringing');
  const [callTime, setCallTime] = useState(0);

  // Ringtone — loops during ringing
  useEffect(() => {
    if (phase !== 'ringing') return;
    const audio = new Audio('/acto1/ringtone.mp3');
    ringtoneRef.current = audio;
    audio.loop   = true;
    audio.volume = 0.75;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [phase]);

  // Call timer
  useEffect(() => {
    if (phase !== 'answered') return;
    timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const playAudio = useCallback((src, onEnd) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    let done = false;
    let durationTimer;
    const hardTimer = setTimeout(() => finish(), 30000);
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(hardTimer);
      clearTimeout(durationTimer);
      onEnd();
    }
    audio.onended = finish;
    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(hardTimer);
      durationTimer = setTimeout(finish, (audio.duration + 1) * 1000);
    });
    audio.play().catch(() => {
      clearTimeout(hardTimer);
      clearTimeout(durationTimer);
      setTimeout(finish, 300);
    });
  }, []);

  const handleAnswer = useCallback(() => {
    setPhase('answered');
    playAudio('/acto1/Audio1A.mp3', () => {
      clearInterval(timerRef.current);
      navigate('/pt4');
    });
  }, [playAudio, navigate]);

  const handleIgnore = useCallback(() => {
    setPhase('ignoring');
    setTimeout(() => {
      setPhase('ignored');
      playAudio('/acto1/Audio1B.mp3', () => navigate('/pt4'));
    }, 3000);
  }, [playAudio, navigate]);

  function fmt(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <div className={`${styles.root} ${phase === 'ignored' ? styles.vibrating : ''}`}>
      {/* Blurred photo background */}
      <div className={styles.photoBg} />
      <div className={`${styles.overlay} ${styles[`overlay_${phase}`] || ''}`} />

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusTime}>{clockTime}</span>
      </div>

      {/* ── RINGING ── */}
      {phase === 'ringing' && (
        <>
          <div className={styles.callerInfo}>
            <div className={styles.callerLabel}>Llamada entrante</div>
            <div className={styles.avatar}>
              <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
            </div>
            <div className={styles.callerName}>Dethz Sagrav</div>
            <div className={styles.callerSub}>móvil</div>
          </div>

          <div className={styles.actions}>
            <div className={styles.actionBtn}>
              <button className={styles.btnDecline} onClick={handleIgnore}>
                <span>✕</span>
              </button>
              <span className={styles.actionLabel}>Rechazar</span>
            </div>
            <div className={styles.actionBtn}>
              <button className={styles.btnAccept} onClick={handleAnswer}>
                <span>✆</span>
              </button>
              <span className={styles.actionLabel}>Aceptar</span>
            </div>
          </div>

          {/* Ripple rings behind avatar */}
          <div className={styles.ringsWrap}>
            <div className={styles.ring1} />
            <div className={styles.ring2} />
            <div className={styles.ring3} />
          </div>
        </>
      )}

      {/* ── IGNORING ── */}
      {phase === 'ignoring' && (
        <div className={styles.centerMsg}>
          <div className={styles.avatar}><img src="/acto1/espectro.png" alt="" /></div>
          <div className={styles.callerName}>Dethz Sagrav</div>
          <div className={styles.callerSub}>Rechazando...</div>
        </div>
      )}

      {/* ── IGNORED (audio playing) ── */}
      {phase === 'ignored' && (
        <div className={styles.centerMsg}>
          <div className={styles.avatar}><img src="/acto1/espectro.png" alt="" /></div>
          <div className={styles.callerName}>Dethz Sagrav</div>
          <div className={styles.callerSub}>Llamada perdida</div>
        </div>
      )}

      {/* ── ANSWERED ── */}
      {phase === 'answered' && (
        <div className={styles.activeCall}>
          <div className={styles.callerLabel}>En llamada</div>
          <div className={styles.avatar}><img src="/acto1/espectro.png" alt="" /></div>
          <div className={styles.callerName}>Dethz Sagrav</div>
          <div className={styles.callTimer}>{fmt(callTime)}</div>

          <div className={styles.activeActions}>
            <div className={styles.activeBtn}>
              <div className={styles.activeBtnIcon}>&#9646;&#9646;</div>
              <span>silencio</span>
            </div>
            <div className={styles.activeBtn}>
              <div className={styles.activeBtnIcon}>&#9654;</div>
              <span>altavoz</span>
            </div>
            <div className={styles.activeBtn} onClick={() => navigate('/pt4')}>
              <button className={styles.btnEnd}>✕</button>
              <span>colgar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
