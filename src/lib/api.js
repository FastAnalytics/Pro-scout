import { buildProposal } from "./proposal";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATA_URL = "/data/games.json";
const HISTORY_URL = "/data/history.json";
const ROLIMONS_URL = "https://api.rolimons.com/games/v1/gamelist";
const ROLIMONS_PROXY_URL = "/api/rolimons";
export const SOURCES = [
  { id: "rolimons", label: "Rolimon's game list", url: ROLIMONS_URL },
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
    const params = new URLSearchParams({ select, order, offset: String(offset), limit: String(pageSize) });
    const page = await loadJson(`${SUPABASE_URL}/rest/v1/${path}?${params}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
    });
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
function normalizeGame(game) {
  const thumbnailId = typeof game.thumbnail === "number" || /^\d+$/.test(String(game.thumbnail || "")) ? String(game.thumbnail) : "";
  const icon = game.icon || (typeof game.thumbnail === "string" && game.thumbnail.startsWith("http") ? game.thumbnail : (thumbnailId ? `https://tr.rbxcdn.com/${thumbnailId}/420/420/Image/Png` : ""));
  return { ...game, icon, thumbnail: game.thumbnail || icon, likes: Number(game.likes) || 0, dislikes: Number(game.dislikes) || 0, ratio: game.ratio ?? (game.visits ? (game.playing || 0) / game.visits : 0) };
}
async function enrichRobloxGames(games) {
  const enriched = games.map(normalizeGame);
  for (let offset = 0; offset < enriched.length; offset += 50) {
    const batch = enriched.slice(offset, offset + 50);
    const ids = batch.map((game) => game.universeId).filter(Boolean).join(",");
    if (!ids) continue;
    try {
      const [details, thumbnails] = await Promise.all([
        loadJson(`/api/roblox?universeIds=${ids}`),
      ]);
      const byId = new Map((details.games?.data || []).map((game) => [String(game.id), game]));
      const imageById = new Map((details.thumbnails?.data || []).map((image) => [String(image.targetId), image.imageUrl]));
      batch.forEach((game) => {
        const detail = byId.get(String(game.universeId));
        if (detail && Number(detail.id) > 0) Object.assign(game, {
          name: detail.name || game.name,
          description: detail.description || game.description,
          rootPlaceId: detail.rootPlaceId || game.rootPlaceId,
          playing: Number(detail.playing ?? game.playing) || game.playing || 0,
          visits: Number(detail.visits ?? game.visits) || game.visits || 0,
          favorites: Number(detail.favoritedCount ?? game.favorites) || game.favorites || 0,
          creatorName: detail.creator?.name || game.creatorName,
          maxPlayers: detail.maxPlayers || game.maxPlayers,
        });
        game.icon = imageById.get(String(game.universeId)) || game.icon;
        game.ratio = game.visits ? (game.playing || 0) / game.visits : 0;
      });
    } catch (error) {
      // Keep the Rolimon's record when Roblox enrichment is unavailable.
    }
  }
  return enriched;
}
function normalizeRolimons(payload) {
  const entries = Object.entries(payload?.games || payload || {});
  return entries.map(([universeId, value]) => {
    const [name, rootPlaceId, thumbnail, playing, visits, favorites, created, updated, genre] = Array.isArray(value) ? value : [];
    return normalizeGame({ universeId, name: name || `Roblox game ${universeId}`, rootPlaceId, thumbnail, playing: Number(playing) || 0, visits: Number(visits) || 0, favorites: Number(favorites) || 0, created, updated, genre });
  }).filter((game) => game.universeId);
}
async function loadRemoteGames() {
  const urls = [ROLIMONS_URL, ROLIMONS_PROXY_URL];
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("json")) throw new Error(`Rolimon's returned ${response.status}`);
      const games = normalizeRolimons(await response.json());
      if (games.length) return enrichRobloxGames(games);
      throw new Error("Rolimon's returned no games");
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Rolimon's feed unavailable");
}
async function loadGames() {
  if (gamesPromise) return gamesPromise;
  gamesPromise = (SUPABASE_URL && SUPABASE_KEY
    ? loadSupabaseRows(
      "games",
      "universe_id,root_place_id,name,description,creator_id,creator_name,creator_type,genre,max_players,created_at,updated_at,playing,visits,favorites,likes,dislikes,icon_url,is_active,last_refreshed_at",
      "visits.desc",
      1000,
    ).then((rows) => rows.filter((row) => row.is_active !== false).map((row) => normalizeGame({
      universeId: row.universe_id,
      rootPlaceId: row.root_place_id,
      name: row.name,
      description: row.description,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorType: row.creator_type,
      genre: row.genre,
      maxPlayers: row.max_players,
      created: row.created_at,
      updated: row.updated_at,
      playing: Number(row.playing) || 0,
      visits: Number(row.visits) || 0,
      favorites: Number(row.favorites) || 0,
      likes: Number(row.likes) || 0,
      dislikes: Number(row.dislikes) || 0,
      icon: row.icon_url || "",
      lastRefreshedAt: row.last_refreshed_at,
    })))
    : Promise.reject(new Error("Supabase catalog is not configured")))
    .catch(() => loadJson(DATA_URL).then((games) => games.map(normalizeGame)));
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
