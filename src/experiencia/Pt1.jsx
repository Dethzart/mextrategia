import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt1.module.css';

export default function Pt1() {
  const navigate = useNavigate();
  const ringtoneRef = useRef(null);
  const audioRef    = useRef(null);
  const timerRef    = useRef(null);

  const [phase, setPhase]   = useState('ringing');
  const [choice, setChoice] = useState(null);
  const [callTime, setCallTime] = useState(0);

  // ── Ringtone (real MP3, loops during ringing) ──
  useEffect(() => {
    if (phase !== 'ringing') return;
    const audio = new Audio('/acto1/ringtone.mp3');
    ringtoneRef.current = audio;
    audio.loop   = true;
    audio.volume = 0.75;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [phase]);

  // ── Call timer ──
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
    audio.play().catch(() => { clearTimeout(hardTimer); clearTimeout(durationTimer); setTimeout(finish, 300); });
  }, []);

  const handleAnswer = useCallback(() => {
    setPhase('answered');
    setChoice('answered');
    playAudio('/acto1/Audio1A.mp3', () => {
      clearInterval(timerRef.current);
      navigate('/pt2');
    });
  }, [playAudio, navigate]);

  const handleIgnore = useCallback(() => {
    setPhase('ignoring');
    setChoice('ignored');
    setTimeout(() => {
      setPhase('ignored');
      playAudio('/acto1/Audio1B.mp3', () => navigate('/pt3'));
    }, 3000);
  }, [playAudio, navigate]);

  function fmt(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <div className={`${styles.root} ${styles[`phase_${phase}`] || ''} ${phase === 'ignored' ? styles.vibrating : ''}`}>

      {phase === 'ringing' && (
        <div className={styles.callUI}>
          <div className={styles.callTop}>
            <div className={styles.callStatus}>llamada entrante</div>
            <div className={styles.avatarWrap}>
              <div className={styles.ring1} />
              <div className={styles.ring2} />
              <div className={styles.ring3} />
              <div className={styles.avatar}>
                <img src="/acto1/espectro.png" alt="ESPECTRO" />
              </div>
            </div>
            <div className={styles.callerName}>ESPECTRO</div>
            <div className={styles.callerSub}>contacto desconocido</div>
          </div>

          <div className={styles.callActions}>
            <button className={styles.btnIgnore} onClick={handleIgnore}>
              <span className={styles.btnIcon}>✕</span>
              <span className={styles.btnLabel}>IGNORAR</span>
            </button>
            <button className={styles.btnAnswer} onClick={handleAnswer}>
              <span className={styles.btnIcon}>✆</span>
              <span className={styles.btnLabel}>CONTESTAR</span>
            </button>
          </div>
        </div>
      )}

      {phase === 'ignoring' && (
        <div className={styles.centerOverlay}>
          <span className={styles.statusText}>ignorando...</span>
        </div>
      )}

      {phase === 'ignored' && (
        <div className={styles.centerOverlay}>
          <div className={styles.missedIcon}>✕</div>
          <span className={styles.statusText}>llamada perdida</span>
        </div>
      )}

      {phase === 'answered' && (
        <div className={styles.activeCallUI}>
          <div className={styles.avatar}>
            <img src="/acto1/espectro.png" alt="ESPECTRO" />
          </div>
          <div className={styles.callerName}>ESPECTRO</div>
          <div className={styles.callTimer}>{fmt(callTime)}</div>
        </div>
      )}
    </div>
  );
}
