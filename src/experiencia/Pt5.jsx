import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt5.module.css';

const AUDIO_SRC = '/acto1/Audio2VoiceNote.mp3';
const BAR_COUNT = 28;

export default function Pt5() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setDone(true);
      clearInterval(intervalRef.current);
    });
    return () => {
      audio.pause();
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
      intervalRef.current = setInterval(() => {
        setElapsed(audio.currentTime);
      }, 250);
    }
  }, [isPlaying]);

  function fmt(s) {
    const t = Math.floor(s);
    return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`;
  }

  // Fake waveform heights — gives it a natural voice shape
  const barHeights = Array.from({ length: BAR_COUNT }, (_, i) => {
    const x = i / (BAR_COUNT - 1);
    return 0.3 + 0.7 * Math.abs(Math.sin(x * Math.PI * 4.5 + 0.8) * Math.cos(x * Math.PI * 2));
  });

  const progress = duration > 0 ? elapsed / duration : 0;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="ESPECTRO" />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>ESPECTRO</div>
          <div className={styles.headerSub}>nota de voz</div>
        </div>
      </div>

      <div className={styles.messages}>
        <div className={styles.voiceBubble}>
          <button className={styles.playBtn} onClick={togglePlay} aria-label="play/pause">
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className={styles.waveform}>
            {barHeights.map((h, i) => {
              const played = i / BAR_COUNT < progress;
              return (
                <div
                  key={i}
                  className={`${styles.bar} ${played ? styles.barPlayed : ''} ${isPlaying ? styles.barAnimating : ''}`}
                  style={{
                    height: `${h * 100}%`,
                    animationDelay: `${(i % 5) * 0.12}s`,
                  }}
                />
              );
            })}
          </div>

          <div className={styles.timer}>
            <span>{fmt(elapsed)}</span>
            {duration > 0 && <span className={styles.timerTotal}> / {fmt(duration)}</span>}
          </div>
        </div>

        <div className={styles.tapHint}>
          {!isPlaying && !done && <span>// toca para reproducir</span>}
          {isPlaying && <span>// reproduciendo...</span>}
        </div>
      </div>

      {done && (
        <div className={styles.footer}>
          <div className={styles.doneText}>// nota recibida</div>
          <button className={styles.btnContinue} onClick={() => navigate('/panel')}>
            [ VER PANEL → ]
          </button>
        </div>
      )}

      <div className={styles.watermark}>Espectro invisible para desafiar</div>
    </div>
  );
}
