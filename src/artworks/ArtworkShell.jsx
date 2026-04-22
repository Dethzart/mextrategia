import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { corporations, calculatePriceWithVotes, calculateRateWithVotes, formatMXN } from '../data/corporations';

function useDomainPrice(corpId) {
  const [now,     setNow]     = useState(Date.now());
  const [dbVotes, setDbVotes] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('votes').select('id').eq('corp_id', corpId);
      setDbVotes(data?.length ?? 0);
    }
    load();
    const channel = supabase.channel(`artwork-${corpId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [corpId]);

  const corp  = corporations.find(c => c.id === corpId);
  const price = corp ? calculatePriceWithVotes(corp, dbVotes, now) : 0;
  const rate  = corp ? calculateRateWithVotes(corp, dbVotes)       : 0;
  return { price, rate };
}

export default function ArtworkShell({ corpId, domain, children, caption }) {
  const { price, rate } = useDomainPrice(corpId);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="artwork-root">
      {/* ── Banner ── */}
      <div className="artwork-banner">
        <a
          className="artwork-banner-back"
          href="https://mextrategia.art"
          target="_blank"
          rel="noopener noreferrer"
        >
          ← MEX
        </a>

        <span className="artwork-banner-domain">{domain.toUpperCase()}</span>
        <span className="artwork-banner-sep">—</span>
        <span className="artwork-banner-label">VALOR</span>
        <span className="artwork-banner-price">{formatMXN(price)}</span>
        <span className="artwork-banner-sep hide-mobile">—</span>
        <span className="artwork-banner-rate">+{rate.toFixed(4)} MXN/SEG</span>

        <span className="artwork-banner-spacer" />

        <span className="artwork-banner-live">
          <span className="artwork-banner-dot" />
          LIVE
        </span>
      </div>

      {/* ── Canvas ── */}
      <div className="artwork-canvas-area">
        {children}
      </div>

      {/* ── Caption ── */}
      {caption && (
        <div className={`artwork-caption${collapsed ? ' is-collapsed' : ''}`}>
          <div className="artwork-caption-inner">
            <button
              className="artwork-caption-toggle"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Mostrar descripción' : 'Ocultar descripción'}
            >
              <span className="artwork-caption-toggle-arrow">▲</span>
              {collapsed ? 'VER OBRA' : 'OCULTAR'}
            </button>

            <div className="artwork-caption-title">{caption.title}</div>
            <div className="artwork-caption-artist">
              {caption.artist}, {caption.year} — {caption.medium}
            </div>
            <div className="artwork-caption-lot">{caption.lot} — {domain}</div>
            <p className="artwork-caption-desc">{caption.description}</p>
            <a
              className="artwork-caption-link"
              href="https://mextrategia.art"
              target="_blank"
              rel="noopener noreferrer"
            >
              mextrategia.art
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
