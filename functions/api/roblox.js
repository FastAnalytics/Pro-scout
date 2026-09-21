export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const gamesBase = env?.ROBLOX_GAMES_BASE || "https://games.roblox.com";
  const thumbsBase = env?.ROBLOX_THUMBS_BASE || "https://thumbnails.roblox.com";
  const ids = url.searchParams.get("universeIds") || "";
  if (!/^\d+(,\d+)*$/.test(ids) || ids.length > 500) {
    return new Response(JSON.stringify({ error: "universeIds must be a comma-separated list" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  const [games, thumbnails] = await Promise.all([
    fetch(`${gamesBase}/v1/games?universeIds=${ids}`, { headers: { Accept: "application/json" } }),
    fetch(`${thumbsBase}/v1/games/icons?universeIds=${ids}&size=420x420&format=Png&returnPolicy=PlaceHolder&isCircular=false`, { headers: { Accept: "application/json" } }),
  ]);
  if (!games.ok || !thumbnails.ok) return new Response(JSON.stringify({ error: "Roblox API unavailable" }), { status: 502, headers: { "content-type": "application/json" } });
  return new Response(JSON.stringify({ games: await games.json(), thumbnails: await thumbnails.json() }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60, s-maxage=300", "access-control-allow-origin": "*" },
  });
}
