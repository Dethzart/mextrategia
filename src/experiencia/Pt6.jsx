import { useState, useEffect } from 'react';
import styles from './Pt6.module.css';
import useThemeColor from '../lib/useThemeColor';

const PANEL_URL = 'https://www.mextrategia.art/panel';

const BODY_LINES = [
  'Lo que viviste no fue ficción.',
  'Es parte de una intervención activa sobre el dominio digital corporativo en México.',
  'En el panel puedes ver en tiempo real el precio acumulado de cada empresa: lo que su negligencia, sus prácticas laborales y su impacto colectivo cuestan.',
  'Un voto amplifica el precio. Tu presencia ya quedó registrada.',
];

export default function Pt6() {
  const [visible, setVisible] = useState(false);

  useThemeColor('#f2f2f7');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  function getTime() {
    return new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  return (
    <div className={styles.root}>
      {/* App bar */}
      <div className={styles.appBar}>
        <span className={styles.appBarBack}>‹</span>
        <span className={styles.appBarTitle}>Correo</span>
        <span className={styles.appBarAction}>···</span>
      </div>

      {/* Email card */}
      <div className={`${styles.emailCard} ${visible ? styles.emailCardVisible : ''}`}>
        {/* Sender row */}
        <div className={styles.senderRow}>
          <div className={styles.senderAvatar}>M</div>
          <div className={styles.senderInfo}>
            <div className={styles.senderName}>Mextrategia</div>
            <div className={styles.senderAddr}>hola@mextrategia.art</div>
          </div>
          <div className={styles.emailTime}>{getTime()}</div>
        </div>

        {/* Subject */}
        <div className={styles.subject}>Acceso al Panel de Observación</div>
        <div className={styles.toLine}>Para: tú</div>

        <div className={styles.divider} />

        {/* Body */}
        <div className={styles.body}>
          {BODY_LINES.map((line, i) => (
            <p key={i} className={styles.bodyPara}
               style={{ animationDelay: `${0.4 + i * 0.35}s` }}>
              {line}
            </p>
          ))}
        </div>

        {/* CTA */}
        <a
          href={PANEL_URL}
          className={styles.ctaBtn}
          style={{ animationDelay: '1.9s' }}
        >
          Acceder al Panel →
        </a>

        <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: 30, fontSize: 13, color: '#888', textDecoration: 'none', animation: 'fadeUp 0.5s ease both', animationDelay: '2.2s' }}>
          mextrategia.art
        </a>
      </div>
    </div>
  );
}
