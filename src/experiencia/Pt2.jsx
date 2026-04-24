import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

// Narrativa: path de quien CONTESTÓ la llamada
const MESSAGES = [
  { text: '¿Por qué contestaste?', delay: 1800 },
  { text: 'Todos contestan al final.', delay: 3200 },
  { text: 'Lo que escuchaste no fue un accidente.', delay: 3500 },
  { text: 'Te mandé algo.', delay: 2500 },
];

export default function Pt2() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (let i = 0; i < MESSAGES.length; i++) {
        if (cancelled) return;
        setTyping(true);
        await wait(MESSAGES[i].delay);
        if (cancelled) return;
        setTyping(false);
        setVisible(v => [...v, MESSAGES[i].text]);
        await wait(600);
      }
      if (!cancelled) setDone(true);
    }
    run();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="ESPECTRO" />
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>ESPECTRO</div>
          <div className={styles.headerSub}>en línea</div>
        </div>
      </div>

      <div className={styles.messages}>
        {visible.map((text, i) => (
          <div key={i} className={styles.bubble}>
            <span className={styles.bubbleText}>{text}</span>
            <span className={styles.bubbleTime}>{getTime()}</span>
          </div>
        ))}
        {typing && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {done && (
        <div className={styles.footer}>
          <button className={styles.btnContinue} onClick={() => navigate('/pt4')}>
            [ ABRIR NOTIFICACIÓN → ]
          </button>
        </div>
      )}

      <div className={styles.watermark}>Espectro invisible para desafiar</div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className={styles.bubble}>
      <div className={styles.typingDots}>
        <span /><span /><span />
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}
