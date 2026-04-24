import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';
import missedStyles from './Pt3.module.css';

const MESSAGES = [
  { text: 'No importa que no hayas contestado.', delay: 2200 },
  { text: 'Ya quedó registrado.', delay: 3000 },
  { text: 'Te mandé algo de todas formas.', delay: 2800 },
];

export default function Pt3() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('missed');
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase('chat'), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'chat') return;
    let cancelled = false;
    async function run() {
      await wait(400);
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
  }, [phase, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing]);

  if (phase === 'missed') {
    return (
      <div className={missedStyles.root}>
        <div className={missedStyles.missedCard}>
          <div className={missedStyles.missedIcon}>✕</div>
          <div className={missedStyles.missedLabel}>Llamada perdida</div>
          <div className={missedStyles.missedCaller}>Dethz Sagrav</div>
          <div className={missedStyles.missedTime}>{getTime()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.backArrow}>‹</div>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="Dethz Sagrav" />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>Dethz Sagrav</div>
          <div className={styles.headerSub}>visto hoy</div>
        </div>
        <div className={styles.headerIcons}>
          <span>📹</span>
          <span>📞</span>
        </div>
      </div>

      <div className={styles.messages}>
        <div className={styles.systemMsg}>
          <span>✕ Llamada perdida · {getTime()}</span>
        </div>
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
