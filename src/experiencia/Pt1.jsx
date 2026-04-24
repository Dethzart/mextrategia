import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt1.module.css';

export default function Pt1() {
  const navigate = useNavigate();
  const activeAudioRef = useRef(null);
  const timerRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState('/acto1/Video1.mp4');
  const [videoLoop, setVideoLoop] = useState(true);

  const [phase, setPhase] = useState('ringing');
  // 'ringing' | 'ignoring' | 'answered' | 'ignored' | 'ended'
  const [choice, setChoice] = useState(null); // 'answered' | 'ignored'
  const [callTime, setCallTime] = useState(0);
  const [showEndMessage, setShowEndMessage] = useState(false);

  useEffect(() => {
    if (phase !== 'answered') return;
    timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const playAudio = useCallback((src, onEnd) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    const audio = new Audio(src);
    activeAudioRef.current = audio;

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
    setChoice('answered');
    setVideoSrc('/acto1/Video2contesta.mp4');
    setVideoLoop(false);
    playAudio('/acto1/Audio1A.mp3', () => {
      clearInterval(timerRef.current);
      setPhase('ended');
      setShowEndMessage(true);
    });
  }, [playAudio]);

  const handleIgnore = useCallback(() => {
    setPhase('ignoring');
    setChoice('ignored');
    setTimeout(() => {
      setPhase('ignored');
      setVideoSrc('/acto1/Video3nocontesta.mp4');
      setVideoLoop(false);
      playAudio('/acto1/Audio1B.mp3', () => {
        setPhase('ended');
        setShowEndMessage(true);
      });
    }, 3000);
  }, [playAudio]);

  const handleContinue = useCallback(() => {
    navigate(choice === 'answered' ? '/pt2' : '/pt3');
  }, [navigate, choice]);

  function fmt(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <div className={`${styles.root} ${phase === 'ignored' ? styles.vibrating : ''}`}>
      <video
        key={videoSrc}
        className={styles.bgVideo}
        src={videoSrc}
        autoPlay
        muted
        loop={videoLoop}
        playsInline
      />

      {phase === 'ringing' && (
        <div className={styles.callUI}>
          <div className={styles.callTop}>
            <div className={styles.callStatus}>// llamada entrante</div>
            <div className={styles.avatar}>
              <img src="/acto1/espectro.png" alt="ESPECTRO" />
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
          <span className={styles.statusText}>// ignorando llamada...</span>
        </div>
      )}

      {phase === 'answered' && !showEndMessage && (
        <div className={styles.activeCallUI}>
          <div className={styles.callerName}>ESPECTRO</div>
          <div className={styles.callTimer}>{fmt(callTime)}</div>
        </div>
      )}

      {showEndMessage && (
        <div className={styles.endOverlay}>
          <div className={styles.endText}>// mensaje recibido</div>
          <button className={styles.btnContinue} onClick={handleContinue}>
            [ CONTINUAR → ]
          </button>
        </div>
      )}

      <div className={styles.watermark}>Espectro invisible para desafiar</div>
    </div>
  );
}
