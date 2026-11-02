import { readSession } from "../lib/auth.js";

/* ====== HIER ANPASSEN ====================================================== */
const EVENT = "Sonntag, 31.10.2027 · Einlass 18:00–20:00 Uhr · Wardersee";

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
const NOTFALL = "Notruf 112 · Team-Kontakt: gogosofficialgroup@gmail.com";
/* ========================================================================== */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function onRequestGet({ request, env }) {
  const email = await readSession(env, request);
  if (!email) return new Response(null, { status: 302, headers: { Location: "/login.html", "Cache-Control": "no-store" } });

  const a = ASSIGN[email] || DEFAULT;
  const zones = ZONES.map((z) => {
    const me = z.id === a.zone ? " me" : "";
    return `<g><rect class="zone${me}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="4"/><text class="zt${me}" x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 5}">${esc(z.name)}</text></g>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#090909">
<title>Dashboard — Schattenschreck</title><link rel="stylesheet" href="/ss.css"></head>
<body data-user="${esc(email)}">
<header class="header"><div class="container header-inner">
<img class="logo" src="https://i.imgur.com/Cl27hzM.png" alt="Schattenschreck" width="130" height="44">
<div class="head-right"><span>${esc(email)}</span><button class="secondary-button" id="logout" type="button">Logout</button></div>
</div></header>
<main class="container">
<section class="hero"><div class="label">Team-Dashboard</div><h1 class="title">Willkommen, Erschrecker</h1><p>${esc(EVENT)}</p></section>
<div class="grid">
<section class="card"><h2>Dein Posten</h2><div class="post"><b>${esc(a.post)}</b><br>Schicht: ${esc(a.slot)}</div></section>
<section class="card"><h2>Deine Aufgaben</h2><ul class="tasks">${a.tasks.map((t, i) => `<li><label><input type="checkbox" data-id="${i}"><span>${esc(t)}</span></label></li>`).join("")}</ul></section>
<section class="card wide"><h2>Standort im Garten</h2>
<svg class="map" viewBox="0 0 600 360" role="img" aria-label="Gartenplan, dein Posten ist rot markiert">${zones}</svg></section>
<section class="card"><h2>Regeln</h2><ul>${RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></section>
<section class="card"><h2>Notfall</h2><p>${esc(NOTFALL)}</p></section>
</div></main>
<script src="/dash.js"></script></body></html>`;

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