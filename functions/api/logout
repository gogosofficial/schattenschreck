import { cookie } from "../../lib/auth.js";

export async function onRequestPost({ request }) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie("", 0), "Cache-Control": "no-store" } });
}
