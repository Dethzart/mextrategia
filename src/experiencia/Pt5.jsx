export default function Pt5() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', monospace", color: '#fff', gap: 16
    }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#00FF41' }}>ACTO 3 — VOICE NOTE</div>
      <div style={{ fontSize: 22, letterSpacing: '0.15em' }}>// EN CONSTRUCCIÓN</div>
      <div style={{
        position: 'absolute', bottom: 18, left: 16,
        fontSize: 9, letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase'
      }}>Espectro invisible para desafiar</div>
    </div>
  );
}
