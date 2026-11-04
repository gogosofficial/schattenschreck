// POST /api/newsletter: Newsletter-Anmeldung per Double-Opt-In über Brevo.
// Alle Zugangsdaten und IDs kommen ausschließlich aus Umgebungsvariablen:
//   BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID

const BREVO_DOI_URL = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NO_STORE = { "Cache-Control": "no-store" };

const reply = (body, status = 200) => Response.json(body, { status, headers: NO_STORE });

export async function onRequestPost({ request, env }) {
  // CSRF-Schutz: nur Anfragen von der eigenen Seite
  if (request.headers.get("Origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });

  let b;
  try { b = await request.json(); } catch { return reply({ ok: false, error: "bad_request" }, 400); }
  if (!b || typeof b !== "object") return reply({ ok: false, error: "bad_request" }, 400);

  // Honeypot: Menschen sehen dieses Feld nicht. Bots bekommen eine scheinbare Erfolgsmeldung.
  if (String(b.website || "").trim() !== "") return reply({ ok: true });

  const email = String(b.email || "").trim().toLowerCase();
  // Steuerzeichen entfernen, Leerraum zusammenfassen
  const name = String(b.name || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();

  if (b.consent !== true) return reply({ ok: false, error: "consent" }, 400);
  if (!name || name.length > 50 || /https?:|www\.|[<>{}]/i.test(name)) return reply({ ok: false, error: "invalid_name" }, 400);
  if (email.length > 254 || !EMAIL_RE.test(email)) return reply({ ok: false, error: "invalid_email" }, 400);

  const apiKey = env.BREVO_API_KEY;
  const listId = Number.parseInt(env.BREVO_LIST_ID, 10);
  const templateId = Number.parseInt(env.BREVO_DOI_TEMPLATE_ID, 10);
  if (!apiKey || !Number.isInteger(listId) || !Number.isInteger(templateId)) {
    console.error("Newsletter: BREVO_API_KEY, BREVO_LIST_ID oder BREVO_DOI_TEMPLATE_ID fehlt oder ist ungültig.");
    return reply({ ok: false, error: "config" }, 500);
  }

  let res;
  try {
    res = await fetch(BREVO_DOI_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        attributes: { VORNAME: name },
        includeListIds: [listId],
        templateId,
        redirectionUrl: new URL("/newsletter-danke.html", request.url).href,
      }),
    });
  } catch (err) {
    console.error("Newsletter: Brevo nicht erreichbar", err);
    return reply({ ok: false, error: "upstream" }, 502);
  }

  // 201 = Bestätigungsmail verschickt, 204 = Kontakt existierte bereits (wird aktualisiert)
  if (res.ok) return reply({ ok: true });

  const detail = await res.text().catch(() => "");
  console.error("Newsletter: Brevo-Fehler", res.status, detail.slice(0, 500));
  if (res.status === 400 && /email/i.test(detail)) return reply({ ok: false, error: "invalid_email" }, 400);
  return reply({ ok: false, error: "upstream" }, 502);
}
