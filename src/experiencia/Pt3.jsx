import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';
import missedStyles from './Pt3.module.css';

// Narrativa: path de quien IGNORÓ la llamada
const MESSAGES = [
  { text: 'No importa que no hayas contestado.', delay: 2200 },
  { text: 'Ya quedó registrado.', delay: 3000 },
  { text: 'Ignorar no borra el registro.', delay: 3200 },
  { text: 'Te mandé algo de todas formas.', delay: 2800 },
];

export default function Pt3() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('missed'); // 'missed' | 'chat'
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  // Show missed call screen 3s, then switch to chat
  useEffect(() => {
    const t = setTimeout(() => setPhase('chat'), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'chat') return;
    let cancelled = false;
    async function run() {
      await wait(500);
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
  }, [phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible, typing]);

  if (phase === 'missed') {
    return (
      <div className={missedStyles.root}>
        <div className={missedStyles.missedCard}>
          <div className={missedStyles.missedIcon}>✆</div>
          <div className={missedStyles.missedLabel}>Llamada perdida</div>
          <div className={missedStyles.missedCaller}>ESPECTRO</div>
          <div className={missedStyles.missedTime}>{getTime()}</div>
        </div>
        <div className={missedStyles.watermark}>Espectro invisible para desafiar</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img src="/acto1/espectro.png" alt="ESPECTRO" />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>ESPECTRO</div>
          <div className={styles.headerSub}>visto hoy</div>
        </div>
      </div>

      <div className={styles.messages}>
        {/* Missed call system message */}
        <div className={styles.systemMsg}>
          <span>✆ Llamada perdida · {getTime()}</span>
        </div>

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
