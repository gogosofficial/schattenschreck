# Schattenschreck – Hinweise für Claude Code

Statische Website (Cloudflare Pages) in `public/`, Pages Functions in `functions/`.

## Logos & Favicons
- **Logos liegen immer in `public/images/brand/`** (SVG und PNG, transparent und `-dunkel`). Übersicht: `public/images/brand/README.md`.
- Standard-Logo auf Seiten: `/images/brand/logo-quer.svg` (`width="2567" height="464"`).
- Favicons/App-Icons liegen im Root von `public/`: `favicon.ico`, `favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `site.webmanifest`.
- Head-Block für jede neue Seite:
  ```html
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  ```
- Alles davon wird erzeugt mit `python3 tools/brand/build.py` (braucht `pip install potracer pillow numpy`) aus den Originalen in `tools/brand/quellen/`. Neues Logo = Original dort ersetzen und Skript erneut ausführen.
- Markenfarben: Rot `#96121c`, Weiß `#e6e6e6`, Hintergrund `#0c0a0b`.
