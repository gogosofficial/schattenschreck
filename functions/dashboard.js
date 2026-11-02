import { readSession } from "../lib/auth.js";

/* ====== HIER ANPASSEN ====================================================== */
const EVENT = "Sonntag, 31.10.2027 · Einlass 18:00–20:00 Uhr · Wardersee";
const EVENT_DAY = "2027-10-31";
const EVENT_TZ = "+01:00"; // Winterzeit (die Sommerzeit endet in der Nacht davor)
const LOCATION = { lat: 53.972628, lng: 10.386452, short: "https://maps.app.goo.gl/SzYQAq4B51YjXpFw6" };
const NOTFALL_MAIL = "gogosofficialgroup@gmail.com";

// [Uhrzeit, Titel, Text] – Start/Ende des Countdowns: Einlass 18:00 / Schichtende 22:00
const START = "18:00", END = "22:00";
const SCHEDULE = [
  ["16:30", "Ankommen & Rundgang", "Treffpunkt am Eingang, Gelände und Stolperfallen gemeinsam prüfen"],
  ["17:00", "Posten beziehen", "Kostüm, Maske, Licht und Handy testen"],
  ["17:45", "Team-Briefing", "Regeln, Codewörter und Ablauf kurz durchgehen"],
  ["18:00", "Einlass startet", "Ab jetzt bist du in der Rolle, sobald Besucher in Sicht sind"],
  ["20:00", "Letzter Einlass", "Danach kommen keine neuen Gruppen mehr"],
  ["22:00", "Schichtende", "Rolle beenden, Licht an, Posten sichern"],
  ["22:30", "Abbau & Feedback", "Requisiten einsammeln, kurze Runde zum Abschluss"],
];

// Zonen im Garten (x, y, Breite, Höhe auf einer 600×360-Karte)
const ZONES = [
  { id: "eingang", name: "Eingang", x: 20, y: 140, w: 110, h: 80 },
  { id: "weg", name: "Hauptweg", x: 150, y: 150, w: 200, h: 60 },
  { id: "huette", name: "Gartenhütte", x: 380, y: 30, w: 190, h: 110 },
  { id: "wiese", name: "Wiese", x: 380, y: 170, w: 190, h: 150 },
  { id: "hecke", name: "Hecke", x: 150, y: 30, w: 200, h: 90 },
  { id: "schuppen", name: "Schuppen", x: 150, y: 240, w: 200, h: 90 },
];

// Pro Erschrecker (E-Mail kleingeschrieben). role/idea sind optional.
const ASSIGN = {
  "beispiel@mail.de": {
    zone: "huette", post: "Gartenhütte", slot: "18:00–22:00 Uhr",
    role: "Der Hausmeister", idea: "Hinter der Tür warten, erst klopfen, dann langsam öffnen.",
    tasks: ["Kostüm und Maske testen", "Posten 17:00 Uhr beziehen", "Funk/Handy-Check mit Team"],
  },
};
const DEFAULT = { zone: "", post: "Wird noch zugeteilt", slot: "folgt", role: "", idea: "", tasks: ["Posten beim Team erfragen"] };

// Besucher lesen: Ampel
const SIGNALS = [
  { c: "green", t: "Grün: weitermachen", s: "Lacht, ruft, geht neugierig weiter.", a: "Du darfst voll in die Rolle." },
  { c: "amber", t: "Gelb: runterfahren", s: "Zögert, klammert sich an andere, weicht langsam zurück.", a: "Abstand vergrößern, leiser werden, nicht weiter zuspitzen." },
  { c: "red", t: "Rot: sofort stoppen", s: "Sagt „Stopp“, weint, atmet schnell, hebt abwehrend die Hände.", a: "Aus der Rolle gehen, Licht an, ruhig ansprechen, Team holen." },
];

// Regeln, logisch gruppiert (von „wichtigste Regel“ bis „Selbstschutz“)
const RULE_GROUPS = [
  { title: "Die Goldene Regel: Stopp heißt Stopp", open: true, items: [
    "Sagt ein Besucher „Stopp“, hebt die Hände oder weicht zurück, gehst du sofort aus der Rolle. Ohne Diskussion, ohne letzten Schreck.",
    "Wirkt jemand panisch oder weint, gilt dasselbe, auch ohne ausgesprochenes Stopp.",
  ] },
  { title: "Besucher & Abstand", items: [
    "Nie Besucher anfassen, festhalten oder verfolgen.",
    "Abstand halten, mindestens eine Armlänge. Du erschreckst mit Auftritt, Geräusch und Licht, nicht mit Körperkontakt.",
    "Nie direkt in die Augen leuchten.",
  ] },
  { title: "Kinder & Altersgrenzen", items: [
    "Keine Kinder gezielt erschrecken.",
    "Altersgrenzen des Teams beachten. Bei Familien lieber eine Stufe zu sanft als zu hart.",
  ] },
  { title: "Requisiten & Ausrüstung", items: [
    "Keine echten Waffen und kein Feuer.",
    "Nichts nach Besuchern werfen, weder Requisiten noch andere Gegenstände.",
    "Requisiten sind ungefährlich: weich, stumpf, ohne Spitzen. Die Maske sitzt fest und lässt freie Sicht.",
  ] },
  { title: "Posten & Sicherheit", items: [
    "Posten rechtzeitig vor Einlass beziehen und Ausrüstung testen.",
    "Stolperfallen entfernen oder markieren, Posten sauber und gut gesichert halten.",
    "Posten nur nach Absprache verlassen. Pausen vorher melden.",
  ] },
  { title: "Fit & nüchtern", items: [
    "Kein Alkohol und keine Drogen vor und während des Events.",
    "Regelmäßig trinken und Pausen nutzen. Bei Unwohlsein sofort beim Team melden.",
  ] },
];

const NOTFALL_STEPS = [
  "Rolle sofort beenden.",
  "Licht an (Notlicht-Button unten) und die Stelle sichern.",
  "Person ruhig ansprechen und nicht allein lassen.",
  "Team informieren, Codewort „Licht“.",
  "Bei Verletzung oder Gefahr 112 rufen und den Standort durchgeben.",
];

const CODES = [
  ["Nebel", "Eine Besuchergruppe kommt auf dich zu. Posten bereit machen."],
  ["Ruhe", "Besucher sind überfordert. Intensität runter."],
  ["Licht", "Notfall. Rolle beenden, Licht an, Team kommt."],
  ["Feierabend", "Event beendet. Posten abbauen."],
];

const TEAM = [
  { name: "Orga vor Ort", info: "Fragen zu Posten, Ablauf und Technik", tel: "" },
];

const GEAR = [
  { id: "kostuem", t: "Kostüm komplett, inklusive Ersatzteil und Sicherheitsnadeln" },
  { id: "maske", t: "Maske sitzt und lässt freie Sicht" },
  { id: "licht", t: "Taschen- oder Stirnlampe mit Ersatzbatterien" },
  { id: "handy", t: "Handy geladen, Powerbank dabei" },
  { id: "warm", t: "Warme Schichten unter dem Kostüm" },
  { id: "schuhe", t: "Feste, rutschfeste Schuhe" },
  { id: "wasser", t: "Wasser und ein Snack" },
  { id: "schminke", t: "Schminke und Make-up-Entferner" },
];

const TIPS = [
  "Timing schlägt Lautstärke. Warte, bis die Gruppe sich unsicher umschaut.",
  "Stille wirkt stärker als Lärm: lange Pausen, langsame Bewegung, ein einzelnes Geräusch.",
  "Licht von unten oder von der Seite wirkt unheimlich. In die Augen leuchten ist tabu.",
  "Schone deine Stimme: kurze Laute, Flüstern, Atmen. Wer nach einer Stunde heiser ist, fällt aus.",
  "Ende Oktober wird es kalt und feucht. Wärme hält dich länger in der Rolle.",
];
/* ========================================================================== */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const at = (t) => `${EVENT_DAY}T${t}:00${EVENT_TZ}`;
const COORDS = `${LOCATION.lat}, ${LOCATION.lng}`;
const ROUTE = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;

export async function onRequestGet({ request, env }) {
  const email = await readSession(env, request);
  if (!email) return new Response(null, { status: 302, headers: { Location: "/login.html", "Cache-Control": "no-store" } });

  const a = { ...DEFAULT, ...(ASSIGN[email] || {}) };
  const zones = ZONES.map((z) => {
    const me = z.id === a.zone ? " me" : "";
    const cx = z.x + z.w / 2, cy = z.y + z.h / 2;
    return `<g><rect class="zone${me}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="4"/><text class="zt${me}" x="${cx}" y="${cy + 6}">${esc(z.name)}</text>${me ? `<text class="zt you" x="${cx}" y="${cy - 14}">Du</text>` : ""}</g>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#090909">
<title>Dashboard — Schattenschreck</title><link rel="stylesheet" href="/ss.css"><link rel="stylesheet" href="/dash-plus.css"></head>
<body data-user="${esc(email)}">
<header class="header"><div class="container header-inner">
<img class="logo" src="https://i.imgur.com/Cl27hzM.png" alt="Schattenschreck" width="130" height="44">
<div class="head-right"><span>${esc(email)}</span><button class="secondary-button" id="logout" type="button">Logout</button></div>
</div></header>
<main class="container">
<section class="hero"><div class="label">Team-Dashboard</div><h1 class="title">Willkommen, Erschrecker</h1><p>${esc(EVENT)}</p>
<div class="dp-count" id="dpCountdown" data-start="${esc(at(START))}" data-end="${esc(at(END))}" role="timer" aria-live="off">
<div class="dp-units"><div><b data-u="d">0</b><span>Tage</span></div><div><b data-u="h">00</b><span>Std</span></div><div><b data-u="m">00</b><span>Min</span></div><div><b data-u="s">00</b><span>Sek</span></div></div>
<p class="dp-countmsg" id="dpCountMsg">bis zum Einlass</p></div></section>

<nav class="dp-chips" aria-label="Abschnitte"><a href="#posten">Posten</a><a href="#ablauf">Ablauf</a><a href="#karte">Gelände</a><a href="#regeln">Regeln</a><a href="#notfall">Notfall</a><a href="#ausruestung">Ausrüstung</a><a href="#tipps">Tipps</a></nav>

<section class="dp-section" id="posten"><h2 class="dp-h2">Deine Schicht</h2><div class="dp-grid">
<div class="dp-card"><h3>Dein Posten</h3><p class="dp-big">${esc(a.post)}</p><p class="dp-mute">Schicht: ${esc(a.slot)}</p>
${a.role ? `<p><b>Rolle:</b> ${esc(a.role)}</p>` : ""}${a.idea ? `<p><b>Auftritt:</b> ${esc(a.idea)}</p>` : ""}</div>
<div class="dp-card"><h3>Deine Aufgaben</h3><ul class="tasks">${a.tasks.map((t, i) => `<li><label><input type="checkbox" data-id="${i}"><span>${esc(t)}</span></label></li>`).join("")}</ul></div>
</div></section>

<section class="dp-section" id="ablauf"><h2 class="dp-h2">Ablauf am Eventtag</h2><div class="dp-card">
<ol class="dp-timeline" id="dpTimeline">${SCHEDULE.map(([t, h, s]) => `<li data-at="${esc(at(t))}"><time>${esc(t)} Uhr</time><div><b>${esc(h)}</b><span>${esc(s)}</span></div></li>`).join("")}</ol></div></section>

<section class="dp-section" id="karte"><h2 class="dp-h2">Gelände & Anfahrt</h2><div class="dp-grid">
<div class="dp-card dp-wide"><div class="dp-mapbox" id="dpMapBox" data-lat="${LOCATION.lat}" data-lng="${LOCATION.lng}">
<div class="dp-mapgate"><p>Die Karte kommt von Google Maps und lädt erst nach deinem Klick.</p><button type="button" class="dp-btn dp-btn-red" data-maptype="k">Satellitenbild laden</button> <button type="button" class="dp-btn" data-maptype="m">Kartenansicht laden</button></div></div></div>
<div class="dp-card"><h3>Postenplan</h3>
<svg class="map dp-plan" viewBox="0 0 600 360" role="img" aria-label="Gartenplan, dein Posten ist rot markiert">${zones}</svg>
<p class="dp-mute">Schematische Skizze, nicht maßstabsgetreu.</p></div>
<div class="dp-card"><h3>Anfahrt</h3><p class="dp-mute">Koordinaten</p><p class="dp-big">${esc(COORDS)}</p>
<p class="dp-actions"><a class="dp-btn dp-btn-red" href="${esc(ROUTE)}" target="_blank" rel="noopener noreferrer">Route starten</a> <a class="dp-btn" href="${esc(LOCATION.short)}" target="_blank" rel="noopener noreferrer">In Google Maps öffnen</a> <button type="button" class="dp-btn" data-copy="${esc(COORDS)}">Koordinaten kopieren</button></p></div>
</div></section>

<section class="dp-section" id="regeln"><h2 class="dp-h2">Regeln</h2>
<div class="dp-ampel">${SIGNALS.map((s) => `<div class="dp-sig ${s.c}"><b>${esc(s.t)}</b><p>${esc(s.s)}</p><p><strong>${esc(s.a)}</strong></p></div>`).join("")}</div>
${RULE_GROUPS.map((g) => `<details class="dp-rule"${g.open ? " open" : ""}><summary>${esc(g.title)}</summary><ul>${g.items.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></details>`).join("")}</section>

<section class="dp-section" id="notfall"><h2 class="dp-h2">Notfall</h2><div class="dp-grid">
<div class="dp-card dp-alert"><h3>Ablauf</h3><ol class="dp-steps">${NOTFALL_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
<p class="dp-actions"><a class="dp-btn dp-btn-red" href="tel:112">Notruf 112</a> <button type="button" class="dp-btn" data-copy="${esc(COORDS)}">Standort kopieren</button></p>
<p class="dp-mute">Standort für den Notruf: Wardersee, ${esc(COORDS)}</p></div>
<div class="dp-card"><h3>Codewörter</h3><dl class="dp-codes">${CODES.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
<h3>Kontakt</h3>${TEAM.map((t) => `<p><b>${esc(t.name)}</b>: ${esc(t.info)}${t.tel ? ` · <a href="tel:${esc(t.tel)}">${esc(t.tel)}</a>` : ""}</p>`).join("")}
<p><a href="mailto:${esc(NOTFALL_MAIL)}">${esc(NOTFALL_MAIL)}</a></p></div>
</div></section>

<section class="dp-section" id="ausruestung"><h2 class="dp-h2">Ausrüstung</h2><div class="dp-card">
<p class="dp-mute"><span id="dpGearCount">0</span> von ${GEAR.length} eingepackt</p><progress id="dpGearBar" max="${GEAR.length}" value="0"></progress>
<ul class="dp-gear">${GEAR.map((g) => `<li><button type="button" class="dp-check" role="checkbox" aria-checked="false" data-gear="${esc(g.id)}"><span class="dp-box" aria-hidden="true"></span><span>${esc(g.t)}</span></button></li>`).join("")}</ul></div></section>

<section class="dp-section" id="tipps"><h2 class="dp-h2">Tipps fürs Erschrecken</h2><div class="dp-card"><ul class="dp-tips">${TIPS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div></section>
<div class="dp-spacer"></div>
</main>

<div class="dp-bar" role="region" aria-label="Schnellzugriff"><button type="button" class="dp-btn" data-light="white">Notlicht</button><button type="button" class="dp-btn" data-light="red">Rotlicht</button><a class="dp-btn dp-btn-red" href="tel:112">Notruf 112</a></div>
<div class="dp-light" id="dpLight" hidden><button type="button" class="dp-light-hit">Tippen zum Schließen</button></div>
<script src="/dash.js"></script><script src="/dash-plus.js"></script></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https://i.imgur.com; script-src 'self'; connect-src 'self'; frame-src https://www.google.com; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    },
  });
}
