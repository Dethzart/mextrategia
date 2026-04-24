import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';
import { playPop, playClick, playSwoosh } from '../lib/sfx';

const TEXT_MESSAGES = [
  { text: 'Escucha el audio.', delay: 1800 },
  { text: 'Es lo que te decía sobre las corporaciones.', delay: 3200 },
  { text: 'No podemos seguir permitiéndolo.', delay: 3500 },
  { text: 'Te acabo de mandar el acceso por correo.', delay: 2500 },
];

const AUDIO_SRC = '/acto1/Audio2VoiceNote.mp3';
const BAR_HEIGHTS = [
  0.15, 0.25, 0.5, 0.8, 0.6, 0.35, 0.45, 0.7, 1.0, 0.85,
  0.6, 0.4, 0.2, 0.25, 0.55, 0.75, 0.65, 0.3, 0.2, 0.6,
  0.9, 0.8, 0.5, 0.4, 0.2, 0.4, 0.3, 0.15
];

export default function Pt2() {
  const navigate = useNavigate();
  const [visible, setVisible]         = useState([]);
  const [typing, setTyping]           = useState(false);
  const [showVoice]                   = useState(true);
  const [showEmailNotif, setShowEmailNotif] = useState(false);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [randomHeights, setRandomHeights] = useState(BAR_HEIGHTS);
  const [elapsed, setElapsed]         = useState(0);
  const [duration, setDuration]       = useState(0);
  const audioRef    = useRef(null);
  const intervalRef = useRef(null);
  const bottomRef   = useRef(null);

  useThemeColor('#f0f2f5');

  useEffect(() => {
    if (!isPlaying) {
      setRandomHeights(BAR_HEIGHTS);
      return;
    }
    const t = setInterval(() => {
      setRandomHeights(BAR_HEIGHTS.map(h => h * (0.6 + Math.random() * 0.4)));
    }, 80);
    return () => clearInterval(t);
  }, [isPlaying]);

  // Sequence: text messages after voice note is visible
  useEffect(() => {
    let cancelled = false;
    async function run() {
      await wait(1500); // give time before typing
      for (const msg of TEXT_MESSAGES) {
        if (cancelled) return;
        setTyping(true);
        await wait(msg.delay);
        if (cancelled) return;
        setTyping(false);
        setVisible(v => [...v, msg.text]);
        playPop();
        await wait(500);
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
      setTimeout(() => {
        setShowEmailNotif(true);
        playSwoosh();
      }, 800);
    });
    return () => { audio.pause(); clearInterval(intervalRef.current); };
  }, [showVoice]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing, showVoice]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      clearInterval(intervalRef.current);
    };
  }, []);

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
        <div className={styles.emailNotif} onClick={() => navigate('/pt6')} style={{ cursor: 'pointer' }}>
          <div className={styles.emailNotifRow}>
            <div className={styles.emailNotifIcon}>&#9993;</div>
            <span className={styles.emailNotifApp}>Correo</span>
            <span className={styles.emailNotifTime}>ahora</span>
          </div>
          <div className={styles.emailNotifSender}>hola@mextrategia.art</div>
          <div className={styles.emailNotifPreview}>Acceso al Panel de Observación</div>
        </div>
      )}

      {/* WA Header */}
      <div className={styles.header}>
        <div className={styles.backArrow}>&#8249;</div>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
          </div>
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>Dethz Sagrav</div>
          <div className={styles.headerSub}>{typing ? 'escribiendo...' : 'en línea'}</div>
        </div>
        <div className={styles.headerIcons}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        <div className={styles.dateDivider}>AYER</div>
        
        <div className={styles.bubbleOld}>
          <span className={styles.bubbleText}>
            <a href="https://www.britannica.com/money/robber-baron" target="_blank" rel="noopener noreferrer" style={{ color: '#027eb5', textDecoration: 'none' }}>
              https://www.britannica.com/money/robber-baron
            </a>
          </span>
          <div className={styles.bubbleTime}>
            <span className={styles.bubbleTimeText}>10:45</span>
            <span className={`${styles.bubbleCheck} ${styles.bubbleCheckRead}`}>&#10003;&#10003;</span>
          </div>
        </div>

        <div className={styles.bubbleOld}>
          <span className={styles.bubbleText}>Lee eso. Es importante.</span>
          <div className={styles.bubbleTime}>
            <span className={styles.bubbleTimeText}>10:46</span>
            <span className={`${styles.bubbleCheck} ${styles.bubbleCheckRead}`}>&#10003;&#10003;</span>
          </div>
        </div>

        <div className={styles.dateDivider}>HOY</div>

        {/* Voice note bubble */}
        {showVoice && (
          <div className={styles.voiceBubbleOld} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className={styles.voicePlayBtn} onClick={() => { playClick(); togglePlay(); }}>
                {isPlaying ? '\u275A\u275A' : '\u25B6'}
              </button>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className={styles.voiceWaveform}>
                  {randomHeights.map((h, i) => (
                    <div
                      key={i}
                      className={`${styles.voiceBar} ${i / BAR_HEIGHTS.length <= progress ? styles.voiceBarPlayed : ''}`}
                      style={{ height: `${h * 100}%` }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div className={styles.voiceTimer}>
                    {fmt(elapsed)}{duration > 0 && ` / ${fmt(duration)}`}
                  </div>
                  <div className={styles.bubbleTime} style={{ marginTop: 0 }}>
                    <span className={styles.bubbleTimeText}>{getTime()}</span>
                    <span className={`${styles.bubbleCheck} ${styles.bubbleCheckRead}`}>&#10003;&#10003;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {visible.map((text, i) => (
          <div key={i} className={styles.bubble}>
            <span className={styles.bubbleText}>{text}</span>
            <div className={styles.bubbleTime}>
              <span className={styles.bubbleTimeText}>{getTime()}</span>
              <span className={`${styles.bubbleCheck} ${styles.bubbleCheckRead}`}>&#10003;&#10003;</span>
            </div>
          </div>
        ))}

        {typing && (
          <div className={styles.typingBubble}>
            <div className={styles.typingDots}><span /><span /><span /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat Input Bar */}
      <div className={styles.chatInputBar}>
        <div className={styles.chatInputPlus}>+</div>
        <div className={styles.chatInputArea}>Mensaje</div>
        <div className={styles.chatInputIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
        </div>
        <div className={styles.chatInputIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </div>
      </div>
    </div>
  );
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}
