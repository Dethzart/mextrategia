import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Manifesto from './components/Manifesto';
import Gallery from './components/Gallery';
import Status from './components/Status';
import {
  corporations,
  calculatePrice,
  calculateRate,
  calculateTotalDebt,
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

const routes = [
  { path: '/manifiesto', label: 'Manifiesto',  component: <Manifesto /> },
  { path: '/panel',      label: 'Panel',        component: <Dashboard /> },
  { path: '/galeria',    label: 'Galería',       component: <Gallery />   },
  { path: '/estado',     label: 'Estado',        component: <Status />    },
];

export default function App() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [time,         setTime]         = useState(new Date());
  const [headerHidden, setHeaderHidden] = useState(false);
  const menuRef     = useRef(null);
  const lastScrollY = useRef(0);

  const currentPath = location.pathname;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll al inicio al cambiar de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setHeaderHidden(false);
    lastScrollY.current = 0;
  }, [currentPath]);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 10)                       setHeaderHidden(false);
      else if (y > lastScrollY.current) setHeaderHidden(true);
      else                              setHeaderHidden(false);
      lastScrollY.current = y;
      if (y > 10) setMenuOpen(false);
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

  function goTo(path) { navigate(path); setMenuOpen(false); }

  return (
    <div className="app">

      {/* ── Ticker: siempre visible, fixed en la parte superior ── */}
      <TickerStrip />

      {/* ── Topbar: fixed debajo del ticker, se oculta al bajar ── */}
      <div className={`site-header${headerHidden ? ' site-header--hidden' : ''}`}>
        <div className="topbar">
          <div className="topbar-logo" onClick={() => goTo('/manifiesto')}>
            MEXTRATEGIA
          </div>

          {/* Desktop nav */}
          <nav className="topbar-nav desktop-nav">
            {routes.map(r => (
              <button
                key={r.path}
                className={currentPath === r.path ? 'active' : ''}
                onClick={() => goTo(r.path)}
              >
                {r.label}
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
                  {routes.map(r => (
                    <button
                      key={r.path}
                      className={currentPath === r.path ? 'active' : ''}
                      onClick={() => goTo(r.path)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Content ── */}
      <div className="main-content">
        <Routes>
          <Route path="/manifiesto" element={<Manifesto />} />
          <Route path="/panel"      element={<Dashboard />} />
          <Route path="/galeria"    element={<Gallery />}   />
          <Route path="/estado"     element={<Status />}    />
          <Route path="*"           element={<Navigate to="/manifiesto" replace />} />
        </Routes>
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
