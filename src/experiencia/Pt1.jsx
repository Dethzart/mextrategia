import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt1.module.css';
import { playClick } from '../lib/sfx';
import useThemeColor from '../lib/useThemeColor';

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
  const [speakerActive, setSpeakerActive] = useState(false);
  const [hasRejected, setHasRejected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useThemeColor('#0e1215');

  // Cleanup audios on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.src = '';
      }
    };
  }, []);

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
    if (phase !== 'answered' || isPaused) return;
    timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, isPaused]);

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
    setSpeakerActive(true);
    const audioFile = hasRejected ? '/acto1/Audio1B.mp3' : '/acto1/Audio1A.mp3';
    playAudio(audioFile, () => {
      clearInterval(timerRef.current);
      navigate('/pt4');
    });
  }, [playAudio, navigate, hasRejected]);

  const handleIgnore = useCallback(() => {
    setPhase('ignoring');
    playClick();
    setHasRejected(true);
    setTimeout(() => {
      setPhase('ignored');
      setTimeout(() => {
        setPhase('ringing');
      }, 3000);
    }, 1500);
  }, []);

  const handleHangup = useCallback(() => {
    playClick();
    if (audioRef.current) audioRef.current.pause();
    clearInterval(timerRef.current);
    setPhase('ignoring');
    setTimeout(() => {
      setPhase('ringing');
      setCallTime(0);
      setSpeakerActive(false);
    }, 3000);
  }, []);

  function fmt(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <div className={`${styles.root} ${phase === 'ignored' ? styles.vibrating : ''}`}>
      {/* Blurred photo background */}
      <div className={styles.photoBg} />
      <div className={`${styles.overlay} ${styles[`overlay_${phase}`] || ''}`} />


      {/* ── RINGING ── */}
      {phase === 'ringing' && (
        <>
          <div className={styles.callerInfo}>
            <div className={styles.callerLabel}>Llamada entrante</div>
            <div style={{ position: 'relative' }}>
              <div className={styles.ringsWrap}>
                <div className={styles.ring1} />
                <div className={styles.ring2} />
                <div className={styles.ring3} />
              </div>
              <div className={styles.avatar}>
                <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
              </div>
            </div>
            <div className={styles.callerName}>Dethz Sagrav</div>
            <div className={styles.callerSub}>móvil</div>
          </div>

          <div className={styles.actions}>
            <div className={styles.actionBtn}>
              <button className={styles.btnDecline} onClick={handleIgnore}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
              </button>
              <span className={styles.actionLabel}>Rechazar</span>
            </div>
            <div className={styles.actionBtn}>
              <button className={styles.btnAccept} onClick={handleAnswer}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </button>
              <span className={styles.actionLabel}>Aceptar</span>
            </div>
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
            <div className={styles.activeBtn} onClick={() => {
              if (!audioRef.current) return;
              if (isPaused) { audioRef.current.play(); setIsPaused(false); }
              else { audioRef.current.pause(); setIsPaused(true); }
            }}>
              <div className={`${styles.activeBtnIcon} ${isPaused ? styles.activeBtnIconOn : ''}`}>
                {isPaused ? '▶' : '❚❚'}
              </div>
              <span>{isPaused ? 'reanudar' : 'pausa'}</span>
            </div>
            <div className={styles.activeBtn} onClick={() => setSpeakerActive(!speakerActive)}>
              <div className={`${styles.activeBtnIcon} ${speakerActive ? styles.activeBtnIconOn : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </div>
              <span>altavoz</span>
            </div>
            <div className={styles.activeBtn} onClick={handleHangup}>
              <button className={styles.btnEnd}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
              </button>
              <span>colgar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
