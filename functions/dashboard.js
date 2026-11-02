import { readSession } from "../lib/auth.js";

/* ====== HIER ANPASSEN ====================================================== */
const EVENT = "Sonntag, 31.10.2027 · Einlass 18:00–20:00 Uhr · Wardersee";
// Für die Statusanzeige „Noch X Tage“ (gleiches Datum wie auf der Webseite)
const EVENT_START = "2027-10-31T18:00:00+01:00";
const EVENT_END = "2027-10-31T23:00:00+01:00";

// Zonen im Garten (x, y, Breite, Höhe auf einer 600×360-Karte)
const ZONES = [
  { id: "eingang", name: "Eingang", x: 20, y: 140, w: 110, h: 80 },
  { id: "weg", name: "Hauptweg", x: 150, y: 150, w: 200, h: 60 },
  { id: "huette", name: "Gartenhütte", x: 380, y: 30, w: 190, h: 110 },
  { id: "wiese", name: "Wiese", x: 380, y: 170, w: 190, h: 150 },
  { id: "hecke", name: "Hecke", x: 150, y: 30, w: 200, h: 90 },
  { id: "schuppen", name: "Schuppen", x: 150, y: 240, w: 200, h: 90 },
];

// Pro Erschrecker (E-Mail kleingeschrieben): Posten, Zeit, Aufgaben
const ASSIGN = {
  "beispiel@mail.de": {
    zone: "huette", post: "Gartenhütte", slot: "18:00–22:00 Uhr",
    tasks: ["Kostüm und Maske testen", "Posten 17:00 Uhr beziehen", "Funk/Handy-Check mit Team"],
  },
};
const DEFAULT = { zone: "", post: "Wird noch zugeteilt", slot: "folgt", tasks: ["Posten beim Team erfragen"] };

const RULES = [
  "Nie Besucher anfassen, festhalten oder verfolgen. Abstand halten.",
  "Stoppt ein Besucher oder ruft „Stopp“: sofort aus der Rolle gehen.",
  "Keine Kinder gezielt erschrecken, Altersgrenzen des Teams beachten.",
  "Keine echten Waffen, Feuer oder Gegenstände werfen.",
  "Kein Alkohol und keine Drogen vor und während des Events.",
  "Auf Stolperfallen achten und Posten sauber und gut gesichert halten.",
  "Im Notfall: Rolle beenden, Licht an, Team informieren.",
];
const NOTRUF = "112";
const TEAM_MAIL = "gogosofficialgroup@gmail.com";
/* ========================================================================== */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function eventStatus(now = Date.now()) {
  const start = Date.parse(EVENT_START), end = Date.parse(EVENT_END);
  if (now >= end) return { text: "Event vorbei", tone: "muted" };
  if (now >= start) return { text: "Event läuft", tone: "live" };
  // Kalendertage in deutscher Zeit (Europe/Berlin) zählen
  const day = (t) => new Date(t).toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
  const days = Math.round((Date.parse(day(start)) - Date.parse(day(now))) / 86400000);
  if (days <= 0) return { text: "Heute ist Event", tone: "live" };
  if (days === 1) return { text: "Morgen ist Event", tone: "live" };
  return { text: `Noch ${days} Tage`, tone: "" };
}

export async function onRequestGet({ request, env }) {
  const email = await readSession(env, request);
  if (!email) return new Response(null, { status: 302, headers: { Location: "/login.html", "Cache-Control": "no-store" } });

  const a = ASSIGN[email] || DEFAULT;
  const myZone = ZONES.find((z) => z.id === a.zone);
  const status = eventStatus();

  const zones = ZONES.map((z) => {
    const me = z.id === a.zone ? " me" : "";
    return `<g><title>${esc(z.name)}${me ? " (dein Posten)" : ""}</title><rect class="zone${me}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="4"/><text class="zt${me}" x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 5}">${esc(z.name)}</text></g>`;
  }).join("");
  const mapLabel = myZone ? `Gartenplan. Dein Posten ist rot markiert: ${myZone.name}.` : "Gartenplan. Dein Posten ist noch nicht eingetragen.";

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#090909"><meta name="color-scheme" content="dark">
<title>Dashboard — Schattenschreck</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Oswald:wght@500;600&display=swap">
<link rel="stylesheet" href="/css/app.css"></head>
<body data-user="${esc(email)}">
<a class="skip-link" href="#main">Zum Inhalt springen</a>
<header class="header"><div class="container header-inner">
<img class="logo" src="https://i.imgur.com/Cl27hzM.png" alt="Schattenschreck" width="130" height="44">
<div class="head-right"><span class="head-user" title="${esc(email)}"><span class="sr-only">Angemeldet als </span>${esc(email)}</span><button class="secondary-button" id="logout" type="button">Abmelden</button></div>
</div>
<nav class="dash-nav" aria-label="Dashboard-Bereiche"><div class="container dash-nav-inner">
<a href="#posten">Posten</a><a href="#aufgaben">Aufgaben</a><a href="#karte">Karte</a><a href="#regeln">Regeln</a><a href="#notfall" class="dash-nav-alert">Notfall</a>
</div></nav></header>
<main class="container" id="main" tabindex="-1">
<p class="dash-msg" id="dashMsg" role="alert" hidden></p>
<section class="hero"><div class="label">Team-Dashboard</div><h1 class="title">Willkommen, Erschrecker</h1><p class="hero-sub">${esc(EVENT)}</p>
<ul class="status-row" aria-label="Status auf einen Blick">
<li class="status ${status.tone ? "is-" + status.tone : ""}"><span class="status-k">Event</span><span class="status-v">${esc(status.text)}</span></li>
<li class="status ${myZone ? "is-ok" : "is-warn"}"><span class="status-k">Posten</span><span class="status-v">${myZone ? "Zugeteilt" : "Noch offen"}</span></li>
<li class="status" id="taskStatus"><span class="status-k">Aufgaben</span><span class="status-v" id="taskStatusV">${a.tasks.length} offen</span></li>
</ul></section>
<div class="grid">
<section class="card" id="posten" aria-labelledby="h-posten"><h2 id="h-posten">Dein Posten</h2>
<dl class="post"><div><dt>Posten</dt><dd>${esc(a.post)}</dd></div><div><dt>Schicht</dt><dd>${esc(a.slot)}</dd></div></dl>
${myZone ? "" : `<p class="card-note">Sobald dein Posten feststeht, erscheint er hier und auf der Karte. Bei Fragen: <a href="mailto:${esc(TEAM_MAIL)}">${esc(TEAM_MAIL)}</a></p>`}
</section>
<section class="card" id="aufgaben" aria-labelledby="h-aufgaben"><div class="card-head"><h2 id="h-aufgaben">Deine Aufgaben</h2><span class="card-count" id="taskCount" aria-hidden="true"></span></div>
<progress class="task-progress" id="taskProgress" max="${a.tasks.length}" value="0" aria-label="Erledigte Aufgaben"></progress>
<ul class="tasks">${a.tasks.map((t, i) => `<li><label><input type="checkbox" data-id="${i}"><span>${esc(t)}</span></label></li>`).join("")}</ul>
<div class="card-foot"><p class="card-note">Abhaken wird nur auf diesem Gerät gespeichert.</p><button class="text-button" id="taskReset" type="button">Zurücksetzen</button></div>
<p class="sr-only" id="taskLive" aria-live="polite"></p>
</section>
<section class="card wide" id="karte" aria-labelledby="h-karte"><div class="card-head"><h2 id="h-karte">Standort im Garten</h2>
<p class="legend"><span class="legend-swatch" aria-hidden="true"></span>Dein Posten</p></div>
<div class="map-wrap"><svg class="map" viewBox="0 0 600 360" role="img" aria-label="${esc(mapLabel)}">${zones}</svg></div></section>
<section class="card" id="regeln" aria-labelledby="h-regeln"><h2 id="h-regeln">Regeln</h2><ul class="rules">${RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></section>
<section class="card card-alert" id="notfall" aria-labelledby="h-notfall"><h2 id="h-notfall">Notfall</h2>
<p>Bei Verletzungen oder Gefahr sofort den Notruf wählen, danach das Team informieren.</p>
<div class="alert-actions">
<a class="primary-button" href="tel:${esc(NOTRUF)}">Notruf ${esc(NOTRUF)} anrufen</a>
<a class="secondary-button" href="mailto:${esc(TEAM_MAIL)}">Team per E-Mail</a>
</div>
<p class="card-note">Team-Kontakt: <a href="mailto:${esc(TEAM_MAIL)}">${esc(TEAM_MAIL)}</a></p>
</section>
</div></main>
<script src="/js/dashboard.js"></script></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https://i.imgur.com; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    },
  });
}
