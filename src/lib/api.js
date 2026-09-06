import { buildProposal } from "./proposal";

const DATA_URL = "/data/games.json";
const HISTORY_URL = "/data/history.json";

export const DEVEX = {
  usdPerRobux: 0.0035,
  robuxPerUsd: 1 / 0.0035,
  minimumRobux: 30000,
  minimumUsd: 105,
  note: "Roblox DevEx: 100,000 Robux = $350 USD. Rate is set by Roblox.",
};

let gamesPromise = null;
let historyPromise = null;

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function loadGames() {
  if (!gamesPromise) gamesPromise = loadJson(DATA_URL);
  return gamesPromise;
}

function loadHistory() {
  if (!historyPromise) historyPromise = loadJson(HISTORY_URL);
  return historyPromise;
}

const SORTERS = {
  ratio: (g) => g.ratio || 0,
  playing: (g) => g.playing || 0,
  visits: (g) => g.visits || 0,
  favorites: (g) => g.favorites || 0,
  newest: (g) => new Date(g.created || 0).getTime(),
};

function applyFilters(games, params) {
  const q = String(params.q || "").trim().toLowerCase();
  const minCCU = Number(params.minCCU || 0);
  const maxCCU = Number(params.maxCCU || 0);
  const minVisits = Number(params.minVisits || 0);
  const maxVisits = Number(params.maxVisits || 0);
  const genre = params.genre || "";

  return games.filter((g) => {
    if (q && !String(g.name || "").toLowerCase().includes(q)) return false;
    if (minCCU && (g.playing || 0) < minCCU) return false;
    if (maxCCU && (g.playing || 0) > maxCCU) return false;
    if (minVisits && (g.visits || 0) < minVisits) return false;
    if (maxVisits && (g.visits || 0) > maxVisits) return false;
    if (genre && g.genre !== genre) return false;
    if (params.hasDiscord && !g.discord) return false;
    return true;
  });
}

export const api = {
  stats: async () => {
    const games = await loadGames();
    const total = games.length;
    const sum = games.reduce((acc, g) => acc + (g.playing || 0), 0);
    return {
      totalGames: total,
      highCCU: games.filter((g) => (g.playing || 0) >= 100).length,
      hiddenGems: games.filter((g) => (g.visits || 0) < 500000).length,
      avgCCU: total ? Math.round(sum / total) : 0,
      topRatio: games.reduce((acc, g) => Math.max(acc, g.ratio || 0), 0),
    };
  },

  games: async (params = {}) => {
    const games = await loadGames();
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.max(1, Number(params.pageSize || 24));
    const key = SORTERS[params.sort] || SORTERS.ratio;
    const dir = params.order === "asc" ? 1 : -1;

    const matches = applyFilters(games, params).sort((a, b) => (key(a) - key(b)) * dir);
    const start = (page - 1) * pageSize;

    return {
      total: matches.length,
      page,
      pageSize,
      items: matches.slice(start, start + pageSize),
    };
  },

  game: async (universeId) => {
    const games = await loadGames();
    const game = games.find((g) => String(g.universeId) === String(universeId));
    if (!game) throw new Error("Game not found");
    return game;
  },

  history: async (universeId, range = "7d") => {
    const history = await loadHistory();
    const points = (history[String(universeId)] || []).map(([ts, playing]) => ({ ts, playing }));
    if (!points.length) return { points, range };
    const days = range === "24h" ? 1 : range === "30d" ? 30 : 7;
    // Snapshot data: window the range against the newest sample, not wall clock.
    const newest = new Date(points[points.length - 1].ts).getTime();
    const cutoff = newest - days * 24 * 60 * 60 * 1000;
    return { points: points.filter((p) => new Date(p.ts).getTime() >= cutoff), range };
  },

  genres: async () => {
    const games = await loadGames();
    const genres = [...new Set(games.map((g) => g.genre).filter(Boolean))].sort();
    return { genres };
  },

  devex: async () => DEVEX,

  proposal: async (universeId, focus) => {
    const game = await api.game(universeId);
    return { proposal: buildProposal(game, focus), game };
  },
};

export function formatNumber(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function robuxToUsd(robux, rate = DEVEX.usdPerRobux) {
  return (robux * rate).toFixed(2);
}
