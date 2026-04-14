import { useState, useEffect, useRef } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Manifesto from './components/Manifesto';
import Gallery from './components/Gallery';
import Status from './components/Status';
import {
  corporations,
  calculatePrice,
  calculateRate,
  formatMXN,
} from './data/corporations';

function TickerStrip() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const items = corporations.map(corp => ({
    domain: corp.domain,
    price:  formatMXN(calculatePrice(corp, now)),
    rate:   `+${calculateRate(corp).toFixed(4)}/s`,
  }));
  const doubled = [...items, ...items];

  return (
    <div className="ticker-strip">
      <div className="ticker-scroll">
        {doubled.map((item, i) => (
          <div className="ticker-item" key={i}>
            <span className="ticker-domain">{item.domain}</span>
            <span className="ticker-price">{item.price}</span>
            <span className="ticker-change">{item.rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const viewLabels = {
  manifesto: 'Manifiesto',
  dashboard: 'Panel',
  gallery:   'Galería',
  status:    'Estado',
};

export default function App() {
  const [view,         setView]         = useState('manifesto');
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [time,         setTime]         = useState(new Date());
  const [headerHidden, setHeaderHidden] = useState(false);
  const menuRef    = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 10)              setHeaderHidden(false);
      else if (y > lastScrollY.current) setHeaderHidden(true);
      else                     setHeaderHidden(false);
      lastScrollY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOut(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [menuOpen]);

  function navigate(v) { setView(v); setMenuOpen(false); }

  const showTicker = view !== 'dashboard';

  return (
    <div className="app">

      {/* ── Sticky Header ── */}
      <div className={`site-header${headerHidden ? ' site-header--hidden' : ''}${!showTicker ? ' site-header--no-ticker' : ''}`}>
        <div className="topbar">
          <div className="topbar-logo" onClick={() => navigate('manifesto')}>
            MEXTRATEGIA
          </div>

          {/* Desktop nav */}
          <nav className="topbar-nav desktop-nav">
            {Object.entries(viewLabels).map(([key, label]) => (
              <button
                key={key}
                className={view === key ? 'active' : ''}
                onClick={() => setView(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="topbar-right">
            <div className="topbar-clock">
              {time.toLocaleTimeString('es-MX', { hour12: false })} MXC
            </div>
            <div className="hamburger-wrapper" ref={menuRef}>
              <button
                className={`hamburger${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú de navegación"
              >
                <span /><span /><span />
              </button>
              {menuOpen && (
                <div className="mobile-menu">
                  {Object.entries(viewLabels).map(([key, label]) => (
                    <button
                      key={key}
                      className={view === key ? 'active' : ''}
                      onClick={() => navigate(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showTicker && <TickerStrip />}
      </div>

      {/* ── Content ── */}
      <div className={`main-content${!showTicker ? ' main-content--no-ticker' : ''}`}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'manifesto' && <Manifesto />}
        {view === 'gallery'   && <Gallery />}
        {view === 'status'    && <Status />}
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <div className="footer-left">
          <span><span className="status-dot" />LIVE</span>
          <span className="footer-domain">mextrategia.art</span>
        </div>
        <span className="footer-copy">&copy; 2025 MextrategIA</span>
      </footer>
    </div>
  );
}
