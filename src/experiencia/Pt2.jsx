import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

const MESSAGES = [
  { text: 'Sabía que lo contestarías.', delay: 1800 },
  { text: 'Lo que escuchaste no fue un accidente.', delay: 3200 },
  { text: 'Llevo tiempo observando este dominio.', delay: 3500 },
  { text: 'Te mandé algo.', delay: 2500 },
];

export default function Pt2() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const msg of MESSAGES) {
        if (cancelled) return;
        setTyping(true);
        await wait(msg.delay);
        if (cancelled) return;
        setTyping(false);
        setVisible(v => [...v, msg.text]);
        await wait(500);
      }
      if (!cancelled) {
        await wait(2000);
        if (!cancelled) navigate('/pt5');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.backArrow}>‹</div>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>Dethz Sagrav</div>
          <div className={styles.headerSub}>en línea</div>
        </div>
        <div className={styles.headerIcons}>
          <span>📹</span>
          <span>📞</span>
        </div>
      </div>

      <div className={styles.messages}>
        {visible.map((text, i) => (
          <div key={i} className={styles.bubble}>
            <span className={styles.bubbleText}>{text}</span>
            <div className={styles.bubbleTime}>
              <span className={styles.bubbleTimeText}>{getTime()}</span>
              <span className={styles.bubbleCheck}>✓✓</span>
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
    </div>
  );
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}
