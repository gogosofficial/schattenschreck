# Schattenschreck

Webseite zum Horror-Event **Schattenschreck** (31.10.2027, Wardersee) mit geschütztem Team-Bereich für Live-Erschrecker. Gehostet auf **Cloudflare Pages** (statische Dateien aus `public/` plus Pages Functions aus `functions/`).

## Ordnerstruktur

```
schattenschreck/
├── public/                     Statische Dateien (Build-Ausgabeverzeichnis für Cloudflare Pages)
│   ├── index.html              Öffentliche Startseite (Intro, Countdown, Infos, Galerie, FAQ, Impressum, Datenschutz)
│   ├── login.html              Team-Login
│   ├── _redirects              Leitet alte Asset-Pfade (/ss.css, /login.js, /dash.js) auf die neuen um
│   ├── css/
│   │   ├── main.css            Styles der öffentlichen Startseite
│   │   └── app.css             Styles für Login und Dashboard (gleiche Farben & Schriften)
│   └── js/
│       ├── intro-preflight.js  Läuft im <head> vor dem ersten Paint: entscheidet, ob das Intro gezeigt wird
│       ├── main.js             Startseite: Intro, Menü, Countdown, FAQ, Galerie, Modals, Cookie-Banner (GTM)
│       ├── login.js            Login-Formular: Validierung, Passwort anzeigen, Fehlermeldungen
│       └── dashboard.js        Dashboard: Abmelden, Aufgaben-Fortschritt, Bereichsnavigation
├── functions/                  Cloudflare Pages Functions (serverseitig)
│   ├── dashboard.js            GET /dashboard: prüft die Sitzung und rendert das Dashboard (Posten, Aufgaben, Karte, Regeln)
│   └── api/
│       ├── login.js            POST /api/login: prüft E-Mail + Passwort, setzt Sitzungs-Cookie
│       └── logout.js           POST /api/logout: löscht das Sitzungs-Cookie
├── lib/
│   └── auth.js                 Gemeinsame Auth-Logik: PBKDF2-Passwortprüfung, signierte Sitzungen (HMAC)
└── tools/
    └── hash.mjs                Lokales Hilfsskript: erzeugt Passwort-Hashes für die USERS-Variable
```

Bilder (Logos, Galerie) liegen extern bei imgur bzw. postimg und sind in der Datenschutzerklärung genannt. Wenn sie später lokal gehostet werden, gehören sie nach `public/images/`. Dann auch die Datenschutzerklärung anpassen.

## Konfiguration in Cloudflare

| Variable         | Inhalt |
|------------------|--------|
| `USERS`          | JSON-Objekt `{ "email": "pbkdf2$…", … }`. Eine Zeile pro Person erzeugt `tools/hash.mjs`. |
| `SESSION_SECRET` | Langer, zufälliger Geheimwert zum Signieren der Sitzungen. |

Neues Teammitglied anlegen:

```bash
node tools/hash.mjs max@mail.de "Wunschpasswort"
```

Die ausgegebene Zeile in `USERS` einfügen. Wer aus `USERS` entfernt wird, ist sofort gesperrt.

## Dashboard-Inhalte pflegen

Alle Inhalte stehen oben in `functions/dashboard.js` im Block **HIER ANPASSEN**:

- `EVENT`, `EVENT_START`, `EVENT_END`: Eventtext und Zeiten für die Statusanzeige „Noch X Tage“
- `ZONES`: Bereiche der Gartenkarte
- `ASSIGN`: Posten, Schicht und Aufgaben pro E-Mail-Adresse (kleingeschrieben)
- `RULES`, `NOTRUF`, `TEAM_MAIL`: Regeln und Notfallkontakte

Das Abhaken von Aufgaben wird nur im Browser gespeichert (localStorage), nicht auf dem Server.

## Lokal testen

```bash
npx wrangler pages dev public
```

Für den Login lokal eine Datei `.dev.vars` anlegen (nicht committen):

```
SESSION_SECRET=irgendein-langer-testwert
USERS={"beispiel@mail.de":"pbkdf2$100000$…"}
```
