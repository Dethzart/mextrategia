import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt1.module.css';

function useRingtone(active) {
  useEffect(() => {
    if (!active) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    function burst(t, dur) {
      [440, 480].forEach(freq => {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.03);
        g.gain.setValueAtTime(0.18, t + dur - 0.05);
        g.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      });
    }

    function schedule() {
      const now = ctx.currentTime + 0.05;
      for (let i = 0; i < 20; i++) {
        const b = now + i * 4.0;
        burst(b, 0.4);
        burst(b + 0.5, 0.4);
      }
    }

    if (ctx.state === 'running') {
      schedule();
    } else {
      ctx.resume().then(schedule);
      const unlock = () => { ctx.resume().then(schedule); };
      document.addEventListener('click',      unlock, { once: true });
      document.addEventListener('touchstart', unlock, { once: true });
    }

    return () => { ctx.close().catch(() => {}); };
  }, [active]);
}

export default function Pt1() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const [phase, setPhase]               = useState('ringing');
  const [choice, setChoice]             = useState(null);
  const [callTime, setCallTime]         = useState(0);
  const [showEndMessage, setShowEndMessage] = useState(false);

  useRingtone(phase === 'ringing');

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
    setChoice('answered');
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

  const phaseClass = styles[`phase_${phase}`] || '';

  return (
    <div className={`${styles.root} ${phaseClass} ${phase === 'ignored' ? styles.vibrating : ''}`}>
      <div className={styles.scanlines} />
      <div className={styles.bgGlow} />

      {/* ── RINGING ── */}
      {phase === 'ringing' && (
        <div className={styles.callUI}>
          <div className={styles.callTop}>
            <div className={styles.callStatus}>// llamada entrante</div>
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

      {/* ── IGNORING (transition) ── */}
      {phase === 'ignoring' && (
        <div className={styles.centerOverlay}>
          <span className={styles.statusText}>// ignorando llamada...</span>
        </div>
      )}

      {/* ── IGNORED (playing audio) ── */}
      {phase === 'ignored' && !showEndMessage && (
        <div className={styles.centerOverlay}>
          <div className={styles.missedIcon}>✕</div>
          <span className={styles.statusText}>// llamada perdida</span>
        </div>
      )}

      {/* ── ANSWERED (call in progress) ── */}
      {phase === 'answered' && !showEndMessage && (
        <div className={styles.activeCallUI}>
          <div className={styles.avatar} style={{ width: 72, height: 72 }}>
            <img src="/acto1/espectro.png" alt="ESPECTRO" />
          </div>
          <div className={styles.callerName}>ESPECTRO</div>
          <div className={styles.callConnected}>// conectado</div>
          <div className={styles.callTimer}>{fmt(callTime)}</div>
        </div>
      )}

      {/* ── END ── */}
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
