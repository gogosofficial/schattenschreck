import { checkLogin, makeSession, cookie, TTL } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  // CSRF-Schutz: nur Anfragen von der eigenen Seite
  if (request.headers.get("Origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let b;
  try { b = await request.json(); } catch { return new Response("Bad Request", { status: 400 }); }
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  const password = String(b.password || "").slice(0, 200);

  if (!(await checkLogin(env, email, password))) {
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie(await makeSession(env, email), TTL), "Cache-Control": "no-store" } });
}
