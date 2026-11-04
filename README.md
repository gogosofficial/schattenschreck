# Schattenschreck

Webseite zum Horror-Event **Schattenschreck** (31.10.2027, Wardersee) mit geschütztem Team-Bereich für Live-Erschrecker. Gehostet auf **Cloudflare Pages** (statische Dateien aus `public/` plus Pages Functions aus `functions/`).

## Ordnerstruktur

```
schattenschreck/
├── public/                     Statische Dateien (Build-Ausgabeverzeichnis für Cloudflare Pages)
│   ├── index.html              Öffentliche Startseite (Intro, Countdown, Infos, Galerie, FAQ, Impressum, Datenschutz)
│   ├── login.html              Team-Login
│   ├── newsletter-danke.html   Zielseite nach dem Klick auf den Bestätigungslink („Anmeldung bestätigt“)
│   ├── _redirects              Leitet alte Asset-Pfade (/ss.css, /login.js, /dash.js) auf die neuen um
│   ├── css/
│   │   ├── main.css            Styles der öffentlichen Startseite
│   │   └── app.css             Styles für Login und Dashboard (gleiche Farben & Schriften)
│   └── js/
│       ├── intro-preflight.js  Läuft im <head> vor dem ersten Paint: entscheidet, ob das Intro gezeigt wird
│       ├── main.js             Startseite: Intro, Menü, Countdown, Newsletter-Formular, FAQ, Galerie, Modals, Cookie-Banner (GTM)
│       ├── login.js            Login-Formular: Validierung, Passwort anzeigen, Fehlermeldungen
│       └── dashboard.js        Dashboard: Abmelden, Aufgaben-Fortschritt, Bereichsnavigation
├── functions/                  Cloudflare Pages Functions (serverseitig)
│   ├── dashboard.js            GET /dashboard: prüft die Sitzung und rendert das Dashboard (Posten, Aufgaben, Karte, Regeln)
│   └── api/
│       ├── login.js            POST /api/login: prüft E-Mail + Passwort, setzt Sitzungs-Cookie
│       ├── logout.js           POST /api/logout: löscht das Sitzungs-Cookie
│       └── newsletter.js       POST /api/newsletter: prüft die Eingaben, startet Brevo-Double-Opt-In
├── lib/
│   └── auth.js                 Gemeinsame Auth-Logik: PBKDF2-Passwortprüfung, signierte Sitzungen (HMAC)
├── email-templates/            E-Mail-Vorlagen zum Einfügen in Brevo (werden nicht ausgeliefert)
│   ├── doi-bestaetigung.html   Double-Opt-In-Bestätigungsmail (Link: {{ doubleoptin }})
│   └── willkommen.html         Willkommensmail nach der Bestätigung (Anrede: {{ contact.VORNAME }})
└── tools/
    └── hash.mjs                Lokales Hilfsskript: erzeugt Passwort-Hashes für die USERS-Variable
```

Bilder (Logos, Galerie) liegen extern bei imgur bzw. postimg und sind in der Datenschutzerklärung genannt. Wenn sie später lokal gehostet werden, gehören sie nach `public/images/`. Dann auch die Datenschutzerklärung anpassen.

## Konfiguration in Cloudflare

| Variable         | Inhalt |
|------------------|--------|
| `USERS`          | JSON-Objekt `{ "email": "pbkdf2$…", … }`. Eine Zeile pro Person erzeugt `tools/hash.mjs`. |
| `SESSION_SECRET` | Langer, zufälliger Geheimwert zum Signieren der Sitzungen. |
| `BREVO_API_KEY`  | API-Schlüssel aus Brevo (*SMTP & API → API-Schlüssel*). Als **verschlüsselte** Variable (Secret) anlegen. |
| `BREVO_LIST_ID`  | Nummer der Brevo-Liste, in die bestätigte Kontakte kommen (nur die Zahl, z. B. `3`). |
| `BREVO_DOI_TEMPLATE_ID` | Nummer der Double-Opt-In-Vorlage in Brevo (nur die Zahl). |

Alle Variablen unter *Cloudflare Dashboard → Workers & Pages → schattenschreck → Einstellungen → Variablen und Geheimnisse* für **Production** (und bei Bedarf Preview) eintragen und danach neu deployen. Schlüssel und IDs stehen nie im Code.

Neues Teammitglied anlegen:

```bash
node tools/hash.mjs max@mail.de "Wunschpasswort"
```

Die ausgegebene Zeile in `USERS` einfügen. Wer aus `USERS` entfernt wird, ist sofort gesperrt.

## Newsletter (Brevo)

Das Formular auf der Startseite (zwischen Galerie und FAQ) schickt Vorname, E-Mail und Einwilligung an `/api/newsletter`. Die Function prüft Herkunft (Origin), Eingaben und das versteckte Honeypot-Feld und ruft dann `POST https://api.brevo.com/v3/contacts/doubleOptinConfirmation` auf. Brevo verschickt die Bestätigungsmail; erst nach dem Klick landet der Kontakt in der Liste und wird auf `/newsletter-danke.html` (gleiche Domain wie die Anfrage) weitergeleitet.

Einmalig in Brevo einrichten:

1. **Kontaktattribut** `VORNAME` (Typ Text) anlegen, falls es noch nicht existiert.
2. **Liste** anlegen (z. B. „Schattenschreck Newsletter“). Ihre ID kommt in `BREVO_LIST_ID`.
3. **Bestätigungsvorlage**: neue E-Mail-Vorlage, Inhalt von `email-templates/doi-bestaetigung.html` per *Eigenen Code einfügen* übernehmen, Betreff z. B. „Bitte bestätige deine Anmeldung“, Absender verifizieren, aktivieren. Die Vorlage muss den Platzhalter `{{ doubleoptin }}` enthalten und als Double-Opt-In-Vorlage markiert sein (Tag `optin`). Ihre ID kommt in `BREVO_DOI_TEMPLATE_ID`.
4. **Willkommensmail**: `email-templates/willkommen.html` als zweite Vorlage anlegen und über eine Automation verschicken (*Automations → Kontakt wird zu Liste hinzugefügt → E-Mail senden*). Abmeldelink: `{{ unsubscribe }}`.
5. Empfehlung: in Brevo die eigene Domain authentifizieren (SPF/DKIM), damit die Mails nicht im Spam landen.

Hinweis: Wird der Abschnitt in der Datenschutzerklärung (Punkt 8) geändert, etwa weil das Öffnungs-/Klick-Tracking in Brevo abgeschaltet wird, den Text entsprechend anpassen.

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
BREVO_API_KEY=dein-brevo-testschluessel
BREVO_LIST_ID=3
BREVO_DOI_TEMPLATE_ID=7
```

Achtung: Mit echtem API-Schlüssel verschickt auch der lokale Test echte Bestätigungsmails.
