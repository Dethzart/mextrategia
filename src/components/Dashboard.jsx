import { useState, useEffect } from 'react';
import {
  corporations,
  calculatePriceWithVotes,
  calculateRateWithVotes,
  calculateTotalDebtWithVotes,
  formatMXN,
  getElapsedTime,
} from '../data/corporations';

// ── Storage keys ──────────────────────────────────────
const VOTE_KEY       = 'mextrategia_vote_v2';
const COMMENTS_KEY   = 'mextrategia_comments_v2';
const MY_COMMENT_KEY = 'mextrategia_my_comment_v1'; // { id, corpId } — 1 total
const MY_LIKE_KEY    = 'mextrategia_my_like_v1';    // commentId number — 1 total
const HUMAN_KEY      = 'mextrategia_human_v1';      // sessionStorage

// ── Loaders ───────────────────────────────────────────
const load = (key, fallback, parse = true) => {
  try { const v = localStorage.getItem(key); return v ? (parse ? JSON.parse(v) : v) : fallback; }
  catch { return fallback; }
};
const isHumanSession = () => sessionStorage.getItem(HUMAN_KEY) === '1';

// ── Sentimiento dinámico ──────────────────────────────
// neg: +0.02/comentario, +0.003/like_neg
// pos: -0.015/comentario, -0.002/like_pos
// S con piso 0.1 y techo 1.0
function getSentiment(corp, comments) {
  const neg      = comments.filter(c => c.corpId === corp.id && c.type === 'negativo');
  const pos      = comments.filter(c => c.corpId === corp.id && c.type === 'positivo');
  const likesNeg = neg.reduce((s, c) => s + (c.likes || 0), 0);
  const likesPos = pos.reduce((s, c) => s + (c.likes || 0), 0);
  const delta    = neg.length * 0.02  + likesNeg * 0.003
                 - pos.length * 0.015 - likesPos * 0.002;
  return Math.min(1, Math.max(0.1, corp.sentiment + delta));
}

// ── Challenge math ────────────────────────────────────
function makeChallenge() {
  const a = Math.floor(Math.random() * 15) + 3;
  const b = Math.floor(Math.random() * 10) + 2;
  return Math.random() > 0.5
    ? { q: `${a} + ${b}`, answer: a + b }
    : { q: `${a + b} − ${b}`, answer: a };
}

// ── Helpers ───────────────────────────────────────────
const toExtraVotes = vc => vc ? { [vc]: 1 } : {};

function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60)    return 'hace un momento';
  if (d < 3600)  return `hace ${Math.floor(d / 60)} min`;
  if (d < 86400) return `hace ${Math.floor(d / 3600)} h`;
  return `hace ${Math.floor(d / 86400)} d`;
}

function ReviewStars({ rating }) {
  const full = Math.floor(rating), half = rating - full >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="review-stars" title={`${rating}/5`}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
      <span className="review-num">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Human Verification Modal ──────────────────────────
function ChallengeModal({ onVerified }) {
  const [ch,    setCh]    = useState(makeChallenge);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (parseInt(input, 10) === ch.answer) {
      sessionStorage.setItem(HUMAN_KEY, '1');
      onVerified();
    } else {
      setError(true);
      setCh(makeChallenge());
      setInput('');
      setTimeout(() => setError(false), 2500);
    }
  }

  return (
    <div className="challenge-overlay">
      <div className="challenge-modal">
        <div className="challenge-eyebrow">Verificación de presencia humana</div>
        <h2 className="challenge-title">La participación requiere presencia.</h2>
        <p className="challenge-desc">
          MextrategIA es una obra de participación ciudadana. Para emitir votos,
          comentarios o likes, verifica que eres humano.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="challenge-question-row">
            <span className="challenge-q-label">¿Cuánto es</span>
            <span className="challenge-q-value">{ch.q}</span>
            <span className="challenge-q-label">?</span>
          </div>
          <div className="challenge-input-row">
            <input
              type="number"
              className="challenge-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              placeholder="—"
              autoComplete="off"
            />
            <button type="submit" className="challenge-submit-btn">
              VERIFICAR Y CONTINUAR
            </button>
          </div>
          {error && (
            <div className="challenge-error">
              Respuesta incorrecta &mdash; nuevo intento.
            </div>
          )}
        </form>
        <p className="challenge-note">
          Esta verificación expira al cerrar la pesta&ntilde;a.
          Los datos (votos, comentarios, likes) persisten de forma permanente.
        </p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [now,          setNow]         = useState(Date.now());
  const [votedCorp,    setVotedCorp]   = useState(() => load(VOTE_KEY, null, false));
  const [recentVote,   setRecentVote]  = useState(null);
  const [comments,     setComments]    = useState(() => load(COMMENTS_KEY, []));
  const [myComment,    setMyComment]   = useState(() => load(MY_COMMENT_KEY, null));
  const [myLike,       setMyLike]      = useState(() => load(MY_LIKE_KEY, null));
  const [humanOk,      setHumanOk]     = useState(isHumanSession);
  const [showChallenge,setShowChallenge] = useState(false);
  const [pendingAction,setPendingAction] = useState(null);
  const [commentText,  setCommentText] = useState('');
  const [commentCorp,  setCommentCorp] = useState(corporations[0].id);
  const [commentType,  setCommentType] = useState('negativo');
  const [honeypot,     setHoneypot]    = useState(''); // anti-bot

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  // ── Sentiment & price inputs ──────────────────────
  const sentimentMap = {};
  corporations.forEach(c => { sentimentMap[c.id] = getSentiment(c, comments); });

  const extraVotes = toExtraVotes(votedCorp);
  const elapsed    = getElapsedTime(now);
  const totalDebt  = calculateTotalDebtWithVotes(extraVotes, sentimentMap, now);
  const totalVotes = corporations.reduce((s, c) => s + c.votes + (extraVotes[c.id] || 0), 0);

  // Sorted by current price (highest = most punished)
  const sortedByPrice = [...corporations].sort(
    (a, b) =>
      calculatePriceWithVotes(b, extraVotes[b.id]||0, sentimentMap[b.id], now) -
      calculatePriceWithVotes(a, extraVotes[a.id]||0, sentimentMap[a.id], now)
  );

  const maxVotes = Math.max(...corporations.map(c => c.votes + (extraVotes[c.id] || 0)), 1);
  const maxS     = 1.0; // S is clamped to 1.0

  // ── Human gate ────────────────────────────────────
  function requireHuman(action) {
    if (humanOk) { execute(action); return; }
    setPendingAction(action);
    setShowChallenge(true);
  }

  function onVerified() {
    setHumanOk(true);
    setShowChallenge(false);
    if (pendingAction) { execute(pendingAction); setPendingAction(null); }
  }

  function execute(action) {
    if (action.type === 'vote')    doVote(action.corpId);
    if (action.type === 'comment') doComment(action);
    if (action.type === 'like')    doLike(action.commentId);
  }

  // ── Actions ───────────────────────────────────────
  function doVote(corpId) {
    const next = votedCorp === corpId ? null : corpId;
    setVotedCorp(next);
    if (next) localStorage.setItem(VOTE_KEY, next);
    else      localStorage.removeItem(VOTE_KEY);
    if (next) { setRecentVote(corpId); setTimeout(() => setRecentVote(null), 900); }
  }

  function doComment({ text, corpId, sentiment }) {
    const type = sentiment;
    if (myComment || !text.trim() || honeypot) return;
    const entry = { id: Date.now(), corpId, text: text.trim(), timestamp: Date.now(), likes: 0, type };
    const updated = [entry, ...comments].slice(0, 100);
    setComments(updated);
    setMyComment({ id: entry.id, corpId });
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
      localStorage.setItem(MY_COMMENT_KEY, JSON.stringify({ id: entry.id, corpId }));
    } catch {}
    setCommentText('');
  }

  function doLike(commentId) {
    if (myLike !== null) return;
    const updated = comments.map(c =>
      c.id !== commentId ? c : { ...c, likes: (c.likes || 0) + 1 }
    );
    setComments(updated);
    setMyLike(commentId);
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
      localStorage.setItem(MY_LIKE_KEY, JSON.stringify(commentId));
    } catch {}
  }

  // ── Render ────────────────────────────────────────
  return (
    <div className="dashboard">

      {showChallenge && <ChallengeModal onVerified={onVerified} />}

      {/* ── Global Counter ── */}
      <div className="global-counter">
        <div className="counter-block">
          <div className="counter-label">Tiempo Transcurrido</div>
          <div className="counter-value counter-time">
            {String(elapsed.days).padStart(3,'0')}d{' '}
            {String(elapsed.hours).padStart(2,'0')}:{String(elapsed.mins).padStart(2,'0')}:
            {String(elapsed.secs).padStart(2,'0')}
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
          const S     = sentimentMap[corp.id];
          const extra = extraVotes[corp.id] || 0;
          const price = calculatePriceWithVotes(corp, extra, S, now);
          const rate  = calculateRateWithVotes(corp, extra, S);
          return (
            <div className="domain-card" key={corp.id}>
              <div className="domain-info">
                <div className="domain-name">
                  <span className="domain-rank">#{i + 1}</span>
                  {corp.domain}
                </div>
                <div className="domain-sector">{corp.sector}</div>
                <div className="domain-reviews">
                  <span className="review-badge">Indeed <ReviewStars rating={corp.reviews.indeed} /></span>
                  <span className="review-badge">Glassdoor <ReviewStars rating={corp.reviews.glassdoor} /></span>
                </div>
              </div>
              <div className="domain-price-col">
                <div className="domain-price">{formatMXN(price)}</div>
                <div className="domain-rate">+{rate.toFixed(4)} MXN/seg</div>
                <div className="domain-cap">CAP: {(corp.capRatio*100).toFixed(0)}% &nbsp;F: {corp.ethicsFactor} &nbsp;S: {S.toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Ranking de Castigo + Análisis de Sentimiento (merged) ── */}
      <div className="panel ranking-panel">
        <div className="panel-header">
          <span>Ranking de Castigo &mdash; Votos y Sentimiento</span>
          <span className="live-dot" />
        </div>

        <div className="ranking-description">
          Un voto por persona, a un solo dominio. Los votos amplifican F<sub>i</sub>&nbsp;=&nbsp;V&nbsp;&times;&nbsp;S.
          El sentimiento (S) evoluciona con los comentarios públicos.
        </div>

        <div className="ranking-list">
          {sortedByPrice.map((corp, i) => {
            const S          = sentimentMap[corp.id];
            const totalV     = corp.votes + (extraVotes[corp.id] || 0);
            const neg        = comments.filter(c => c.corpId === corp.id && c.type === 'negativo');
            const pos        = comments.filter(c => c.corpId === corp.id && c.type === 'positivo');
            const likesNeg   = neg.reduce((s,c) => s+(c.likes||0), 0);
            const likesPos   = pos.reduce((s,c) => s+(c.likes||0), 0);
            const isMyVote   = votedCorp === corp.id;
            const hasElsewhere = votedCorp !== null && !isMyVote;
            const justVoted  = recentVote === corp.id;
            const btnLabel   = justVoted ? 'EMITIDO' : isMyVote ? 'QUITAR' : hasElsewhere ? 'CAMBIAR' : 'VOTAR';
            const voteBarW   = Math.round((totalV / maxVotes) * 100);
            const sBarW      = Math.round((S / maxS) * 100);

            return (
              <div
                className={`ranking-item${isMyVote ? ' ranking-item--voted' : ''}`}
                key={corp.id}
              >
                <div className="ranking-item-top">
                  <div className="ranking-item-left">
                    <span className="ranking-num">#{i + 1}</span>
                    <div className="ranking-corp-info">
                      <span className="ranking-domain">{corp.domain}</span>
                      <span className="ranking-corp-name">{corp.name}</span>
                    </div>
                  </div>
                  <div className="ranking-item-right">
                    <div className="ranking-stats">
                      <span className="ranking-stat">
                        <span className="ranking-stat-label">Votos</span>
                        <span className="ranking-stat-value">{totalV.toLocaleString()}</span>
                      </span>
                      <span className="ranking-stat">
                        <span className="ranking-stat-label">S</span>
                        <span className="ranking-stat-value">{S.toFixed(3)}</span>
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
                  <div className="ranking-bar-row">
                    <span className="ranking-bar-label">S</span>
                    <div className="ranking-bar-track">
                      <div
                        className="ranking-bar-fill ranking-bar-fill--s"
                        style={{ width: `${sBarW}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ranking-sentiment-detail">
                  <span className="ranking-neg">
                    neg {neg.length} ({likesNeg} likes)
                  </span>
                  <span className="ranking-pos">
                    pos {pos.length} ({likesPos} likes)
                  </span>
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

      {/* ── Comments Panel ── */}
      <div className="panel comments-panel">
        <div className="panel-header">
          <span>Comentarios P&uacute;blicos &mdash; 1 comentario &middot; 1 like por persona</span>
          <span className="live-dot" />
        </div>

        {/* Form */}
        {myComment ? (
          <div className="comment-done-notice">
            Ya publicaste tu comentario sobre{' '}
            <strong className="comment-done-domain">
              {corporations.find(c=>c.id===myComment.corpId)?.domain}
            </strong>.
            Solo se permite un comentario por persona.
          </div>
        ) : (
          <form
            className="comment-form"
            onSubmit={e => {
              e.preventDefault();
              if (honeypot) return;
              requireHuman({ type:'comment', text:commentText, corpId:commentCorp, sentiment:commentType });
            }}
          >
            {/* Honeypot — invisible para humanos, trampa para bots */}
            <input
              type="text"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
              style={{ position:'absolute', left:'-9999px', opacity:0, height:0 }}
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
            />

            <div className="comment-form-top">
              <select
                className="comment-select"
                value={commentCorp}
                onChange={e => setCommentCorp(e.target.value)}
              >
                {corporations.map(c => (
                  <option key={c.id} value={c.id}>{c.domain}</option>
                ))}
              </select>
            </div>

            <div className="comment-type-toggle">
              <button type="button"
                className={`type-btn type-btn--neg${commentType==='negativo' ? ' type-btn--active' : ''}`}
                onClick={() => setCommentType('negativo')}
              >NEGATIVO</button>
              <button type="button"
                className={`type-btn type-btn--pos${commentType==='positivo' ? ' type-btn--active' : ''}`}
                onClick={() => setCommentType('positivo')}
              >POSITIVO</button>
              <span className="comment-type-note">
                {commentType === 'negativo' ? 'Sube S y el precio' : 'Baja S y el precio'}
              </span>
            </div>

            <textarea
              className="comment-textarea"
              placeholder="Escribe tu evaluación de esta empresa..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <div className="comment-form-footer">
              <span className="comment-char-count">{commentText.length}/300</span>
              <button type="submit" className="comment-submit">PUBLICAR</button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="comment-list">
          {comments.length === 0 ? (
            <div className="comment-empty">Aún no hay comentarios. Sé el primero en evaluar.</div>
          ) : (
            comments.map(c => {
              const corp      = corporations.find(x => x.id === c.corpId);
              const isNeg     = c.type === 'negativo';
              const isMyLike  = myLike === c.id;
              const canLike   = myLike === null;
              return (
                <div className={`comment-item comment-item--${c.type}`} key={c.id}>
                  <div className="comment-item-header">
                    <div className="comment-item-left">
                      <span className={`comment-type-badge comment-type-badge--${c.type}`}>
                        {isNeg ? 'neg' : 'pos'}
                      </span>
                      <span className="comment-corp">{corp?.domain}</span>
                    </div>
                    <span className="comment-time">{timeAgo(c.timestamp)}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                  <div className="comment-actions">
                    <button
                      className={`comment-like-btn${isMyLike ? ' comment-like-btn--active' : ''}`}
                      onClick={() => canLike && requireHuman({ type:'like', commentId:c.id })}
                      disabled={isMyLike || (!canLike && !isMyLike)}
                      title={isMyLike ? 'Tu like' : canLike ? 'Dar like' : 'Ya diste tu like a otro comentario'}
                    >
                      {isMyLike ? '♥' : '♡'} {c.likes || 0}
                    </button>
                    <span className={`comment-affects-s comment-affects-s--${c.type}`}>
                      {isNeg ? '+S' : '−S'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
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
            <span className="formula-var-name">F<sub>i</sub> = V &times; S</span>
            <span className="formula-var-desc">Votos × sentimiento (neg sube, pos baja)</span>
          </div>
        </div>
        <div className="formula-rates">
          <div className="formula-rates-label">Tasas Individuales Activas</div>
          {corporations.map(corp => {
            const rate = calculateRateWithVotes(corp, extraVotes[corp.id]||0, sentimentMap[corp.id]);
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
