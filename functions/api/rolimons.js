export async function onRequestGet({ request }) {
  const upstream = await fetch("https://api.rolimons.com/games/v1/gamelist", {
    headers: { Accept: "application/json", "User-Agent": "RobloxGameExplorer/1.0" },
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: "Rolimon's API unavailable" }), {
      status: 502,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=300, s-maxage=900",
      "access-control-allow-origin": "*",
    },
  });
}
