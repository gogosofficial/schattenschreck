const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
export const COOKIE = "__Host-ss_session";
export const TTL = 8 * 3600; // Sitzung: 8 Stunden

const hmacKey = (secret) => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

async function pbkdf2(password, salt, iterations) {
  const k = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, k, 256));
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
function getUsers(env) {
  try { return JSON.parse(env.USERS || "{}"); } catch { return {}; }
}

export async function checkLogin(env, email, password) {
  const rec = getUsers(env)[email];
  // Auch bei unbekannter E-Mail wird gerechnet (gleiche Antwortzeit, kein Erraten gültiger Konten)
  const [, it, s, h] = (rec || "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA$AAAA").split("$");
  const hash = await pbkdf2(password, unb64u(s), parseInt(it, 10));
  return !!rec && safeEqual(hash, unb64u(h));
}

export async function makeSession(env, email) {
  const p = b64u(enc.encode(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + TTL })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET), enc.encode(p));
  return p + "." + b64u(sig);
}

export async function readSession(env, request) {
  const m = (request.headers.get("Cookie") || "").match(new RegExp(COOKIE + "=([^;]+)"));
  if (!m || !env.SESSION_SECRET) return null;
  const [p, s] = m[1].split(".");
  if (!p || !s) return null;
  try {
    if (!(await crypto.subtle.verify("HMAC", await hmacKey(env.SESSION_SECRET), unb64u(s), enc.encode(p)))) return null;
    const d = JSON.parse(new TextDecoder().decode(unb64u(p)));
    if (d.x < Date.now() / 1000) return null;
    return getUsers(env)[d.e] ? d.e : null; // Konto aus USERS gelöscht = sofort gesperrt
  } catch { return null; }
}

export const cookie = (v, maxAge) => `${COOKIE}=${v}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
