import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

const TEXT_MESSAGES = [
  { text: 'Sabía que lo contestarías.', delay: 1800 },
  { text: 'Lo que escuchaste no fue un accidente.', delay: 3200 },
  { text: 'Llevo tiempo observando este dominio.', delay: 3500 },
  { text: 'Te mandé algo.', delay: 2500 },
];

const AUDIO_SRC = '/acto1/Audio2VoiceNote.mp3';
const BAR_COUNT = 28;
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const x = i / (BAR_COUNT - 1);
  return 0.2 + 0.8 * Math.abs(Math.sin(x * Math.PI * 4.5 + 0.8) * Math.cos(x * Math.PI * 2));
});

export default function Pt2() {
  const navigate = useNavigate();
  const [visible, setVisible]         = useState([]);
  const [typing, setTyping]           = useState(false);
  const [showVoice, setShowVoice]     = useState(false);
  const [showEmailNotif, setShowEmailNotif] = useState(false);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [duration, setDuration]       = useState(0);
  const audioRef    = useRef(null);
  const intervalRef = useRef(null);
  const bottomRef   = useRef(null);

  // Sequence: text messages → voice note bubble
  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const msg of TEXT_MESSAGES) {
        if (cancelled) return;
        setTyping(true);
        await wait(msg.delay);
        if (cancelled) return;
        setTyping(false);
        setVisible(v => [...v, msg.text]);
        await wait(500);
      }
      if (!cancelled) {
        await wait(1000);
        if (!cancelled) setShowVoice(true);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  // Setup audio when voice bubble appears
  useEffect(() => {
    if (!showVoice) return;
    const audio = new Audio(AUDIO_SRC);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
      setTimeout(() => setShowEmailNotif(true), 800);
      setTimeout(() => navigate('/pt6'), 3800);
    });
    return () => { audio.pause(); clearInterval(intervalRef.current); };
  }, [showVoice, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing, showVoice]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
      intervalRef.current = setInterval(() => setElapsed(audio.currentTime), 250);
    }
  }, [isPlaying]);

  function fmt(s) {
    const t = Math.floor(s);
    return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? elapsed / duration : 0;

  return (
    <div className={styles.root}>

      {/* Email notification slides in from top after voice note ends */}
      {showEmailNotif && (
        <div className={styles.emailNotif}>
          <div className={styles.emailNotifRow}>
            <div className={styles.emailNotifIcon}>&#9993;</div>
            <span className={styles.emailNotifApp}>Correo</span>
            <span className={styles.emailNotifTime}>ahora</span>
          </div>
          <div className={styles.emailNotifSender}>Dethz Sagrav</div>
          <div className={styles.emailNotifPreview}>Acceso al Panel de Observación</div>
        </div>
      )}

      {/* WA Header */}
      <div className={styles.header}>
        <div className={styles.backArrow}>&#8249;</div>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>Dethz Sagrav</div>
          <div className={styles.headerSub}>en línea</div>
        </div>
        <div className={styles.headerIcons}>
          <span>&#9654;</span>
          <span>&#9990;</span>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {visible.map((text, i) => (
          <div key={i} className={styles.bubble}>
            <span className={styles.bubbleText}>{text}</span>
            <div className={styles.bubbleTime}>
              <span className={styles.bubbleTimeText}>{getTime()}</span>
              <span className={styles.bubbleCheck}>&#10003;&#10003;</span>
            </div>
          </div>
        ))}

        {typing && (
          <div className={styles.typingBubble}>
            <div className={styles.typingDots}><span /><span /><span /></div>
          </div>
        )}

        {/* Voice note bubble */}
        {showVoice && (
          <div className={styles.voiceBubble}>
            <button className={styles.voicePlayBtn} onClick={togglePlay}>
              {isPlaying ? '\u275A\u275A' : '\u25B6'}
            </button>
            <div className={styles.voiceWaveform}>
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={[
                    styles.voiceBar,
                    i / BAR_COUNT < progress ? styles.voiceBarPlayed : '',
                    isPlaying ? styles.voiceBarLive : '',
                  ].join(' ')}
                  style={{ height: `${h * 100}%`, animationDelay: `${(i % 6) * 0.1}s` }}
                />
              ))}
            </div>
            <div className={styles.voiceTimer}>
              {fmt(elapsed)}
              {duration > 0 && <span className={styles.voiceTimerTotal}> / {fmt(duration)}</span>}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}
