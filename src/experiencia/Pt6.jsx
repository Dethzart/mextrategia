import { useState, useEffect } from 'react';
import styles from './Pt6.module.css';

const PANEL_URL = 'https://www.mextrategia.art/panel';

const BODY_LINES = [
  'Lo que viviste no fue ficción.',
  'Es parte de una intervención activa sobre el dominio digital corporativo en México.',
  'En el panel puedes ver en tiempo real el precio acumulado de cada empresa: lo que su negligencia, sus prácticas laborales y su impacto colectivo cuestan.',
  'Un voto amplifica el precio. Tu presencia ya quedó registrada.',
];

export default function Pt6() {
  const [visible, setVisible] = useState(false);

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
          <div className={styles.senderAvatar}>D</div>
          <div className={styles.senderInfo}>
            <div className={styles.senderName}>Dethz Sagrav</div>
            <div className={styles.senderAddr}>dethz@mextrategia.art</div>
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

        <div className={styles.signature}>
          — MextrategIA<br />
          <span className={styles.sigUrl}>mextrategia.art</span>
        </div>
      </div>
    </div>
  );
}
