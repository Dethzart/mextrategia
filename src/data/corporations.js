// ═══════════════════════════════════════════════════
// MextrategIA — Corporate Data & Price Engine
// ═══════════════════════════════════════════════════

// Project launch timestamp — 14 de abril 2025, 00:00:00 hora Ciudad de México (UTC-5)
export const PROJECT_EPOCH = new Date('2025-04-14T00:00:00-05:00').getTime();

export const corporations = [
  {
    id: 'genommalab',
    domain: 'genommalab.ai',
    name: 'Genomma Lab',
    sector: 'Farmac\u00e9utico',
    capRatio: 0.34,
    ethicsFactor: 2.8,
    sentiment: 0.72,
    votes: 1847,
    reviews: { indeed: 2.9, glassdoor: 2.6 },
  },
  {
    id: 'cinepolis',
    domain: 'cinepolis.ai',
    name: 'Cin\u00e9polis',
    sector: 'Entretenimiento',
    capRatio: 0.58,
    ethicsFactor: 2.1,
    sentiment: 0.65,
    votes: 2341,
    reviews: { indeed: 3.4, glassdoor: 3.1 },
  },
  {
    id: 'cinemex',
    domain: 'cinemex.ai',
    name: 'Cinemex',
    sector: 'Entretenimiento',
    capRatio: 0.42,
    ethicsFactor: 3.2,
    sentiment: 0.81,
    votes: 1562,
    reviews: { indeed: 2.5, glassdoor: 2.3 },
  },
  {
    id: 'telmex',
    domain: 'telmex.ai',
    name: 'Telmex',
    sector: 'Telecomunicaciones',
    capRatio: 0.29,
    ethicsFactor: 3.8,
    sentiment: 0.91,
    votes: 4210,
    reviews: { indeed: 2.1, glassdoor: 2.0 },
  },
  {
    id: 'inbursa',
    domain: 'inbursa.ai',
    name: 'Inbursa',
    sector: 'Finanzas',
    capRatio: 0.47,
    ethicsFactor: 2.5,
    sentiment: 0.68,
    votes: 1923,
    reviews: { indeed: 3.0, glassdoor: 2.8 },
  },
];

// Base rate: 0.01 MXN per second
const BASE_RATE = 0.01;

/**
 * F\u00f3rmula de Valoraci\u00f3n:
 * Pt = \u03a3 ( 0.01 \u00d7 CAP_Act/CAP_M\u00e1x \u00d7 F_factor \u00d7 F_i )
 * where F_i = votes \u00d7 sentiment
 */
export function calculatePrice(corp, now = Date.now()) {
  const elapsedSeconds = (now - PROJECT_EPOCH) / 1000;
  const Fi = (corp.votes / 1000) * corp.sentiment;
  const ratePerSecond = BASE_RATE * corp.capRatio * corp.ethicsFactor * Fi;
  return elapsedSeconds * ratePerSecond;
}

export function calculateRate(corp) {
  const Fi = (corp.votes / 1000) * corp.sentiment;
  return BASE_RATE * corp.capRatio * corp.ethicsFactor * Fi;
}

export function calculateTotalDebt(now = Date.now()) {
  return corporations.reduce((sum, corp) => sum + calculatePrice(corp, now), 0);
}

export function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// sentimentOverride: valor calculado desde comentarios; si es null usa corp.sentiment
export function calculatePriceWithVotes(corp, extraVotes = 0, sentimentOverride = null, now = Date.now()) {
  const S = sentimentOverride !== null ? sentimentOverride : corp.sentiment;
  const elapsedSeconds = (now - PROJECT_EPOCH) / 1000;
  const Fi = ((corp.votes + extraVotes) / 1000) * S;
  const ratePerSecond = BASE_RATE * corp.capRatio * corp.ethicsFactor * Fi;
  return elapsedSeconds * ratePerSecond;
}

export function calculateRateWithVotes(corp, extraVotes = 0, sentimentOverride = null) {
  const S = sentimentOverride !== null ? sentimentOverride : corp.sentiment;
  const Fi = ((corp.votes + extraVotes) / 1000) * S;
  return BASE_RATE * corp.capRatio * corp.ethicsFactor * Fi;
}

// sentimentMap: { [corpId]: number } con S calculado desde comentarios
export function calculateTotalDebtWithVotes(localVotes = {}, sentimentMap = {}, now = Date.now()) {
  return corporations.reduce(
    (sum, corp) => sum + calculatePriceWithVotes(
      corp,
      localVotes[corp.id] || 0,
      sentimentMap[corp.id] ?? null,
      now
    ),
    0
  );
}

export function formatCompact(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function getElapsedTime(now = Date.now()) {
  const seconds = Math.floor((now - PROJECT_EPOCH) / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, mins, secs };
}
