const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.ADMIN_SECRET) return json({ error: "Server integration is not configured" }, 503);
  if (request.headers.get("authorization") !== `Bearer ${env.ADMIN_SECRET}`) return json({ error: "Unauthorized" }, 401);
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.universeIds) ? [...new Set(body.universeIds.map(String).filter((id) => /^\d+$/.test(id)))] : [];
  if (!ids.length || ids.length > 5000) return json({ error: "universeIds must contain 1-5000 numeric IDs" }, 400);
  const rows = ids.map((universe_id) => ({ universe_id, is_active: true }));
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/games?on_conflict=universe_id`, { method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
  if (!response.ok) return json({ error: await response.text() }, 502);
  return json({ imported: ids.length });
}
