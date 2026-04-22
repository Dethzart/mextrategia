import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  corporations,
  calculatePriceWithVotes,
  calculateRateWithVotes,
  calculateTotalDebtWithVotes,
  formatMXN,
  getElapsedTime,
} from '../data/corporations';

const UID_KEY   = 'mextrategia_uid_v1';
const HUMAN_KEY = 'mextrategia_human_v1';

function getUserId() {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) { uid = crypto.randomUUID(); localStorage.setItem(UID_KEY, uid); }
  return uid;
}
const isHumanSession = () => sessionStorage.getItem(HUMAN_KEY) === '1';

function makeChallenge() {
  const a = Math.floor(Math.random() * 15) + 3;
  const b = Math.floor(Math.random() * 10) + 2;
  return Math.random() > 0.5
    ? { q: `${a} + ${b}`, answer: a + b }
    : { q: `${a + b} − ${b}`, answer: a };
}

function ReviewStars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="review-stars" title={`${rating}/5`}>
      {'★'.repeat(full)}
      {half && <span className="review-star-half">★</span>}
      {'☆'.repeat(empty)}
      <span className="review-num">{rating.toFixed(1)}</span>
    </span>
  );
}

function ChallengeModal({ onVerified, onClose }) {
  const [ch,    setCh]    = useState(makeChallenge);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (parseInt(input, 10) === ch.answer) {
      sessionStorage.setItem(HUMAN_KEY, '1');
      onVerified();
    } else {
      setError(true); setCh(makeChallenge()); setInput('');
      setTimeout(() => setError(false), 2500);
    }
  }

  return (
    <div className="challenge-overlay">
      <div className="challenge-modal">
        <button className="challenge-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <div className="challenge-eyebrow">Verificación de presencia humana</div>
        <h2 className="challenge-title">La participación requiere presencia.</h2>
        <p className="challenge-desc">
          MextrategIA es una obra de participación ciudadana. Para emitir votos,
          verifica que eres humano.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="challenge-question-row">
            <span className="challenge-q-label">¿Cuánto es</span>
            <span className="challenge-q-value">{ch.q}</span>
            <span className="challenge-q-label">?</span>
          </div>
          <div className="challenge-input-row">
            <input
              type="number" className="challenge-input"
              value={input} onChange={e => setInput(e.target.value)}
              autoFocus placeholder="—" autoComplete="off"
            />
            <button type="submit" className="challenge-submit-btn">
              VERIFICAR Y CONTINUAR
            </button>
          </div>
          {error && <div className="challenge-error">Respuesta incorrecta &mdash; nuevo intento.</div>}
        </form>
        <p className="challenge-note">
          Esta verificación expira al cerrar la pesta&ntilde;a.
          Los votos persisten de forma permanente.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [now,           setNow]          = useState(Date.now());
  const [dbVotes,       setDbVotes]      = useState({});
  const [votedCorp,     setVotedCorp]    = useState(null);
  const [recentVote,    setRecentVote]   = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [humanOk,       setHumanOk]      = useState(isHumanSession);
  const [showChallenge, setShowChallenge]= useState(false);
  const [pendingAction, setPendingAction]= useState(null);
  const userId = useRef(getUserId());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const uid = userId.current;

    async function loadData() {
      const { data: votes } = await supabase.from('votes').select('corp_id, user_id');
      const counts = {};
      corporations.forEach(c => { counts[c.id] = 0; });
      votes?.forEach(v => { counts[v.corp_id] = (counts[v.corp_id] || 0) + 1; });
      setDbVotes(counts);
      const myVote = votes?.find(v => v.user_id === uid);
      setVotedCorp(myVote?.corp_id || null);
      setLoading(false);
    }

    loadData();

    const channel = supabase.channel('dashboard')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        async () => {
          const { data: votes } = await supabase.from('votes').select('corp_id');
          const counts = {};
          corporations.forEach(c => { counts[c.id] = 0; });
          votes?.forEach(v => { counts[v.corp_id] = (counts[v.corp_id] || 0) + 1; });
          setDbVotes(counts);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const getDB      = (corpId) => dbVotes[corpId] || 0;
  const elapsed    = getElapsedTime(now);
  const totalDebt  = calculateTotalDebtWithVotes(dbVotes, now);
  const totalVotes = corporations.reduce((s, c) => s + c.votes + getDB(c.id), 0);

  const sortedByPrice = [...corporations].sort(
    (a, b) =>
      calculatePriceWithVotes(b, getDB(b.id), now) -
      calculatePriceWithVotes(a, getDB(a.id), now)
  );

  const maxVotes = Math.max(...corporations.map(c => c.votes + getDB(c.id)), 1);

  function requireHuman(action) {
    if (humanOk) { execute(action); return; }
    setPendingAction(action);
    setShowChallenge(true);
  }
  function onVerified() {
    setHumanOk(true); setShowChallenge(false);
    if (pendingAction) { execute(pendingAction); setPendingAction(null); }
  }
  function execute(action) {
    if (action.type === 'vote') doVote(action.corpId);
  }

  async function doVote(corpId) {
    const uid      = userId.current;
    const removing = votedCorp === corpId;
    const prev     = votedCorp;

    setVotedCorp(removing ? null : corpId);
    setDbVotes(d => {
      const next = { ...d };
      if (removing) {
        next[corpId] = Math.max(0, (next[corpId] || 0) - 1);
      } else {
        if (prev) next[prev] = Math.max(0, (next[prev] || 0) - 1);
        next[corpId] = (next[corpId] || 0) + 1;
      }
      return next;
    });

    if (!removing) { setRecentVote(corpId); setTimeout(() => setRecentVote(null), 900); }

    if (removing) {
      await supabase.from('votes').delete().eq('user_id', uid);
    } else {
      await supabase.from('votes')
        .upsert({ user_id: uid, corp_id: corpId }, { onConflict: 'user_id' });
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <span>Cargando datos en tiempo real&hellip;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {showChallenge && (
        <ChallengeModal
          onVerified={onVerified}
          onClose={() => { setShowChallenge(false); setPendingAction(null); }}
        />
      )}

      {/* ── Global Counter ── */}
      <div className="global-counter">
        <div className="counter-block">
          <div className="counter-label">Tiempo Transcurrido</div>
          <div className="counter-value counter-time">
            {elapsed.days}d{' '}
            {String(elapsed.hours).padStart(2,'0')}:{String(elapsed.mins).padStart(2,'0')}:{String(elapsed.secs).padStart(2,'0')}
          </div>
        </div>
        <div className="counter-block">
          <div className="counter-label">Valor Total Acumulado</div>
          <div className="counter-value total">{formatMXN(totalDebt)}</div>
        </div>
        <div className="counter-block">
          <div className="counter-label">Dominios Intervenidos</div>
          <div className="counter-value counter-domains">{corporations.length}</div>
        </div>
        <div className="counter-block">
          <div className="counter-label">Votos Acumulados</div>
          <div className="counter-value counter-votes">{totalVotes.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Domain Tickers ── */}
      <div className="panel">
        <div className="panel-header">
          <span>Dominios Corporativos &mdash; Precio en Tiempo Real</span>
          <span className="live-dot" />
        </div>
        {sortedByPrice.map((corp, i) => {
          const price = calculatePriceWithVotes(corp, getDB(corp.id), now);
          const rate  = calculateRateWithVotes(corp, getDB(corp.id));
          return (
            <div className="domain-card" key={corp.id}>
              <div className="domain-info">
                <div className="domain-name">
                  <span className="domain-rank">#{i + 1}</span>
                  <a href={`https://${corp.domain}`} target="_blank" rel="noopener noreferrer" className="domain-link">
                    {corp.domain}
                  </a>
                </div>
                <div className="domain-sector">{corp.sector}</div>
              </div>
              <div className="domain-price-col">
                <div className="domain-price">{formatMXN(price)}</div>
                <div className="domain-rate">+{rate.toFixed(4)} MXN/seg</div>
                <div className="domain-cap">CAP: {(corp.capRatio*100).toFixed(0)}% &nbsp;F: {corp.ethicsFactor}</div>
                <div className="domain-reviews">
                  <span className="review-badge">Indeed <ReviewStars rating={corp.reviews.indeed} /></span>
                  <span className="review-badge">Glassdoor <ReviewStars rating={corp.reviews.glassdoor} /></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Ranking de Castigo ── */}
      <div className="panel ranking-panel">
        <div className="panel-header">
          <span>Ranking de Castigo &mdash; Votos</span>
          <span className="live-dot" />
        </div>

        <div className="ranking-description">
          Un voto por persona, a un solo dominio. Los votos amplifican F<sub>i</sub>&nbsp;=&nbsp;V&nbsp;&times;&nbsp;S.
        </div>

        <div className="ranking-list">
          {sortedByPrice.map((corp, i) => {
            const totalV       = corp.votes + getDB(corp.id);
            const isMyVote     = votedCorp === corp.id;
            const hasElsewhere = votedCorp !== null && !isMyVote;
            const justVoted    = recentVote === corp.id;
            const btnLabel     = justVoted ? 'EMITIDO' : isMyVote ? 'QUITAR' : hasElsewhere ? 'CAMBIAR' : 'VOTAR';
            const voteBarW     = Math.round((totalV / maxVotes) * 100);

            return (
              <div
                className={`ranking-item${isMyVote ? ' ranking-item--voted' : ''}`}
                key={corp.id}
              >
                <div className="ranking-item-top">
                  <div className="ranking-item-left">
                    <span className="ranking-num">#{i + 1}</span>
                    <div className="ranking-corp-info">
                      <a href={`https://${corp.domain}`} target="_blank" rel="noopener noreferrer" className="ranking-domain-link">
                        <span className="ranking-domain">{corp.domain}</span>
                      </a>
                      <span className="ranking-corp-name">{corp.name}</span>
                    </div>
                  </div>
                  <div className="ranking-item-right">
                    <div className="ranking-stats">
                      <span className="ranking-stat">
                        <span className="ranking-stat-label">Votos</span>
                        <span className="ranking-stat-value">{totalV.toLocaleString()}</span>
                      </span>
                    </div>
                    <button
                      className={`vote-btn${isMyVote ? ' vote-btn--active' : ''}${justVoted ? ' vote-btn--fired' : ''}`}
                      onClick={() => requireHuman({ type: 'vote', corpId: corp.id })}
                    >{btnLabel}</button>
                  </div>
                </div>

                <div className="ranking-bars">
                  <div className="ranking-bar-row">
                    <span className="ranking-bar-label">Votos</span>
                    <div className="ranking-bar-track">
                      <div
                        className={`ranking-bar-fill ranking-bar-fill--vote${isMyVote ? ' ranking-bar-fill--vote-active' : ''}`}
                        style={{ width: `${voteBarW}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ranking-footer">
          {votedCorp
            ? <>Tu voto: <strong className="ranking-voted-domain">{corporations.find(c=>c.id===votedCorp)?.domain}</strong> &mdash; haz clic en otro para cambiarlo.</>
            : 'Aún no has emitido tu voto.'}
        </div>
      </div>

      {/* ── Formula Panel ── */}
      <div className="panel formula-panel">
        <div className="panel-header"><span>Fórmula de Valoración</span></div>
        <div className="formula-display">
          P<sub>t</sub> = &Sigma;( 0.01 &times; CAP<sub>Act</sub>/CAP<sub>M&aacute;x</sub> &times; F<sub>factor</sub> &times; F<sub>i</sub> )
        </div>
        <div className="formula-vars">
          <div className="formula-var">
            <span className="formula-var-name">0.01 MXN/seg</span>
            <span className="formula-var-desc">Tasa base — acumulación por segundo de inacción</span>
          </div>
          <div className="formula-var">
            <span className="formula-var-name">CAP<sub>Act</sub>/CAP<sub>M&aacute;x</sub></span>
            <span className="formula-var-desc">Indicador bursátil vs. máximo histórico</span>
          </div>
          <div className="formula-var">
            <span className="formula-var-name">F<sub>factor</sub></span>
            <span className="formula-var-desc">Factor ético — calificaciones Indeed/Glassdoor</span>
          </div>
          <div className="formula-var">
            <span className="formula-var-name">F<sub>i</sub> = 1 + log<sub>10</sub>(1 + V/100)</span>
            <span className="formula-var-desc">Amplificador de votos — escala logarítmica</span>
          </div>
        </div>
        <div className="formula-rates">
          <div className="formula-rates-label">Tasas Individuales Activas</div>
          {corporations.map(corp => {
            const rate = calculateRateWithVotes(corp, getDB(corp.id));
            return (
              <div className="formula-rate-row" key={corp.id}>
                <span className="formula-rate-domain">{corp.domain}</span>
                <span className="formula-rate-value">+{rate.toFixed(4)}/s</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
