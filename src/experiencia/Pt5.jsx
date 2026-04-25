import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pt5.module.css';

const AUDIO_SRC = '/acto1/voicenote.m4a';
const BAR_COUNT = 30;

const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const x = i / (BAR_COUNT - 1);
  return 0.2 + 0.8 * Math.abs(Math.sin(x * Math.PI * 4.5 + 0.8) * Math.cos(x * Math.PI * 2));
});

export default function Pt5() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [duration, setDuration]   = useState(0);
  const [randomHeights, setRandomHeights] = useState(BAR_HEIGHTS);

  useEffect(() => {
    if (!isPlaying) {
      setRandomHeights(BAR_HEIGHTS);
      return;
    }
    const t = setInterval(() => {
      setRandomHeights(BAR_HEIGHTS.map(h => h * (0.4 + Math.random() * 0.8)));
    }, 80);
    return () => clearInterval(t);
  }, [isPlaying]);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
      setTimeout(() => navigate('/pt6'), 1500);
    });
    return () => { audio.pause(); clearInterval(intervalRef.current); };
  }, [navigate]);

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
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="ESPECTRO" />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>ESPECTRO</div>
          <div className={styles.headerSub}>nota de voz</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.voiceBubble}>
          <button className={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className={styles.waveform}>
            {randomHeights.map((h, i) => (
              <div
                key={i}
                className={`${styles.bar} ${i / BAR_COUNT < progress ? styles.barPlayed : ''}`}
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>

          <div className={styles.timer}>
            {fmt(elapsed)}{duration > 0 && <span className={styles.timerTotal}> / {fmt(duration)}</span>}
          </div>
        </div>

        {!isPlaying && elapsed === 0 && (
          <div className={styles.hint}>toca para reproducir</div>
        )}
      </div>
    </div>
  );
}
