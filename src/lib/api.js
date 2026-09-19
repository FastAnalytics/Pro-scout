import { buildProposal } from "./proposal";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATA_URL = "/data/games.json";
const HISTORY_URL = "/data/history.json";
export const SOURCES = [
  { id: "rolimons", label: "Rolimon's game list", url: "https://api.rolimons.com/games/v1/gamelist" },
  { id: "roblox", label: "Roblox public Games API", url: "https://games.roblox.com/v1/games" },
];
export const DISCOVERY_KEYWORDS = ["obby", "simulator", "sim", "tower", "tycoon", "cash grab", "survival", "horror", "roleplay", "anime", "clicker", "idle", "murder", "escape", "pvp", "battle", "racing", "adventure", "story", "defense", "fighting", "fps", "rpg", "pets", "farm", "build", "parkour", "prison", "zombie", "dungeon", "boxing", "football", "fashion", "restaurant", "school", "city", "bedwars", "battlegrounds", "rng", "collect", "merge", "doors", "challenge", "meme", "arcade"];
export const DEVEX = { usdPerRobux: 0.0035, robuxPerUsd: 1 / 0.0035, minimumRobux: 30000, minimumUsd: 105, note: "Roblox DevEx: 100,000 Robux = $350 USD." };

let gamesPromise = null;
let historyPromise = null;
async function loadJson(url, options) { const res = await fetch(url, options); if (!res.ok) throw new Error(`${res.status} ${res.statusText}`); return res.json(); }
async function loadSupabaseRows(path, select, order, pageSize = 1000) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await loadJson(`${SUPABASE_URL}/rest/v1/${path}?select=${select}&order=${order}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${offset}-${offset + pageSize - 1}`,
        Prefer: "count=exact",
      },
    });
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
function normalizeGame(game) { return { ...game, ratio: game.ratio ?? (game.visits ? (game.playing || 0) / game.visits : 0) }; }
async function loadGames() {
  if (gamesPromise) return gamesPromise;
  gamesPromise = SUPABASE_URL && SUPABASE_KEY
    ? loadSupabaseRows("games", "*", "playing.desc").catch(() => loadJson(DATA_URL)).then((games) => games.map(normalizeGame))
    : loadJson(DATA_URL).then((games) => games.map(normalizeGame));
  return gamesPromise;
}
async function loadHistory() {
  if (historyPromise) return historyPromise;
  historyPromise = SUPABASE_URL && SUPABASE_KEY
    ? loadSupabaseRows("game_snapshots", "universe_id,playing,captured_at", "captured_at.asc").then((rows) => rows.reduce((acc, row) => { (acc[row.universe_id] ||= []).push([row.captured_at, row.playing]); return acc; }, {})).catch(() => loadJson(HISTORY_URL))
    : loadJson(HISTORY_URL);
  return historyPromise;
}
const SORTERS = { ratio: (g) => g.ratio || 0, playing: (g) => g.playing || 0, visits: (g) => g.visits || 0, favorites: (g) => g.favorites || 0, newest: (g) => new Date(g.created || 0).getTime() };
function applyFilters(games, params) { const q = String(params.q || "").trim().toLowerCase(); const minCCU = Number(params.minCCU || 0), maxCCU = Number(params.maxCCU || 0), minVisits = Number(params.minVisits || 0), maxVisits = Number(params.maxVisits || 0); return games.filter((g) => { const haystack = `${g.name || ""} ${g.description || ""}`.toLowerCase(); if (q && !haystack.includes(q)) return false; if (minCCU && (g.playing || 0) < minCCU) return false; if (maxCCU && (g.playing || 0) > maxCCU) return false; if (minVisits && (g.visits || 0) < minVisits) return false; if (maxVisits && (g.visits || 0) > maxVisits) return false; if (params.genre && g.genre !== params.genre) return false; return !params.hasDiscord || !!g.discord; }); }
export const api = {
  sources: async () => ({ sources: SOURCES, keywords: DISCOVERY_KEYWORDS }),
  stats: async () => { const games = await loadGames(); const total = games.length; const sum = games.reduce((a, g) => a + (g.playing || 0), 0); return { totalGames: total, highCCU: games.filter((g) => (g.playing || 0) >= 100).length, hiddenGems: games.filter((g) => (g.visits || 0) < 5000000 && (g.playing || 0) >= 100).length, avgCCU: total ? Math.round(sum / total) : 0, topRatio: games.reduce((a, g) => Math.max(a, g.ratio || 0), 0) }; },
  games: async (params = {}) => { const games = await loadGames(); const page = Math.max(1, Number(params.page || 1)); const pageSize = Math.max(1, Number(params.pageSize || 24)); const key = SORTERS[params.sort] || SORTERS.ratio; const dir = params.order === "asc" ? 1 : -1; const matches = applyFilters(games, params).sort((a, b) => (key(a) - key(b)) * dir); const start = (page - 1) * pageSize; return { total: matches.length, page, pageSize, items: matches.slice(start, start + pageSize) }; },
  game: async (universeId) => { const games = await loadGames(); const game = games.find((g) => String(g.universeId) === String(universeId)); if (!game) throw new Error("Game not found"); return game; },
  history: async (universeId, range = "7d") => { const history = await loadHistory(); const points = (history[String(universeId)] || []).map(([ts, playing]) => ({ ts, playing })); if (!points.length) return { points, range }; const days = range === "24h" ? 1 : range === "30d" ? 30 : 7; const cutoff = new Date(points.at(-1).ts).getTime() - days * 86400000; return { points: points.filter((p) => new Date(p.ts).getTime() >= cutoff), range }; },
  genres: async () => { const games = await loadGames(); return { genres: [...new Set(games.map((g) => g.genre).filter(Boolean))].sort() }; },
  devex: async () => DEVEX,
  proposal: async (universeId, focus) => { const game = await api.game(universeId); return { proposal: buildProposal(game, focus), game }; },
};
export function formatNumber(n) { if (n == null) return "-"; if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"; if (n >= 1000) return (n / 1000).toFixed(1) + "K"; return String(n); }
export function robuxToUsd(robux, rate = DEVEX.usdPerRobux) { return (robux * rate).toFixed(2); }
export function parseBound(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : 0; }
