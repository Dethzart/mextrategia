import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Manifesto from './components/Manifesto';
import Gallery from './components/Gallery';
import Status from './components/Status';
import Pt1 from './experiencia/Pt1';
import Pt2 from './experiencia/Pt2';
import Pt3 from './experiencia/Pt3';
import Pt4 from './experiencia/Pt4';
import Pt5 from './experiencia/Pt5';
import { supabase } from './lib/supabase';
import {
  corporations,
  calculatePriceWithVotes,
  calculateRateWithVotes,
  formatMXN,
} from './data/corporations';

function TickerStrip({ dbVotes, now }) {
  const items = corporations.map(corp => ({
    domain: corp.domain,
    price:  formatMXN(calculatePriceWithVotes(corp, dbVotes[corp.id] || 0, now)),
    rate:   `+${calculateRateWithVotes(corp, dbVotes[corp.id] || 0).toFixed(4)}/s`,
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

function getMXOffset() {
  try {
    const s = new Date().toLocaleString('en', { timeZone: 'America/Mexico_City', timeZoneName: 'shortOffset' });
    const m = s.match(/GMT([+-]\d+)/);
    if (m) return 'UTC' + m[1].replace('-', '−');
  } catch (_) {}
  return 'UTC−6';
}
const MX_OFFSET = getMXOffset();

const routes = [
  // { path: '/manifiesto', label: 'Manifiesto', component: <Manifesto /> }, // V2
  { path: '/panel',   label: 'Panel',   },
  { path: '/galeria', label: 'Galería', },
  // { path: '/estado', label: 'Estado', }, // V2
];

export default function App() {
  const navigate     = useNavigate();
  const location     = useLocation();

  // Experiencia fullscreen — sin shell
  if (location.pathname.startsWith('/pt')) {
    return (
      <Routes>
        <Route path="/pt1" element={<Pt1 />} />
        <Route path="/pt2" element={<Pt2 />} />
        <Route path="/pt3" element={<Pt3 />} />
        <Route path="/pt4" element={<Pt4 />} />
        <Route path="/pt5" element={<Pt5 />} />
      </Routes>
    );
  }

  const [now,          setNow]          = useState(Date.now());
  const [dbVotes,      setDbVotes]      = useState({});
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [time,         setTime]         = useState(new Date());
  const [headerHidden, setHeaderHidden] = useState(false);
  const menuRef     = useRef(null);
  const lastScrollY = useRef(0);

  const currentPath = location.pathname;

  // Ticker clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // Topbar clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Votes — fuente única de verdad para ticker y dashboard
  useEffect(() => {
    async function loadVotes() {
      const { data: votes } = await supabase.from('votes').select('corp_id');
      const counts = {};
      corporations.forEach(c => { counts[c.id] = 0; });
      votes?.forEach(v => { counts[v.corp_id] = (counts[v.corp_id] || 0) + 1; });
      setDbVotes(counts);
    }
    loadVotes();

    const channel = supabase.channel('app-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, async () => {
        const { data: votes } = await supabase.from('votes').select('corp_id');
        const counts = {};
        corporations.forEach(c => { counts[c.id] = 0; });
        votes?.forEach(v => { counts[v.corp_id] = (counts[v.corp_id] || 0) + 1; });
        setDbVotes(counts);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

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

      <TickerStrip dbVotes={dbVotes} now={now} />

      <div className={`site-header${headerHidden ? ' site-header--hidden' : ''}`}>
        <div className="topbar">
          <div className="topbar-logo" onClick={() => goTo('/panel')}>
            MEXTRATEGIA
          </div>

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
              {time.toLocaleTimeString('es-MX', { hour12: false, timeZone: 'America/Mexico_City' })}
              <span className="topbar-tz">{MX_OFFSET}</span>
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

      <div className="main-content">
        <Routes>
          <Route path="/manifiesto" element={<Manifesto />} />
          <Route path="/panel"      element={<Dashboard dbVotes={dbVotes} setDbVotes={setDbVotes} />} />
          <Route path="/galeria"    element={<Gallery />} />
          <Route path="/estado"     element={<Status />} />
          <Route path="*"           element={<Navigate to="/panel" replace />} />
        </Routes>
      </div>

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
