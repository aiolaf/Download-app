# NinA AI — Flagship email template

Een MJML-gebaseerde, donkere, premium agency email template. Premium
modules van het kaliber dat je in mails van **Stripe, Linear, Notion,
H&M, KPMG, PwC, NYT en The Information** ziet — maar dan in jouw merk.
Mobile-first, dark-mode aware, en getest in alle gangbare clients.

## Bestanden

| Pad | Wat het is |
|---|---|
| `src/template.mjml` | MJML source met 20 modulaire blokken |
| `build.js` | Node script: compileert MJML + (optioneel) merget data |
| `dist/template.html` | Bulletproof gecompileerde HTML met `{{placeholders}}` intact — upload naar je ESP |
| `dist/template.js` | Auto-gegenereerde JS bundle voor de browser-editor |
| `dist/template-filled.html` | Volledige preview met sample data, opent direct in browser |
| `dist/vendor.handlebars.min.js` | Gevendoorde Handlebars voor offline editor |
| `sample-data.json` | Dummy content die alle modules toont |
| `editor.html` | Visuele in-browser editor — vul velden in, live preview + code |

## Snel starten

```bash
# 1. install (eenmalig)
npm install

# 2. compile + render sample data
node build.js --data sample-data.json
# of: npm run build:email:sample

# 3. open editor.html in je browser (file:// werkt prima)
#    → vul velden in, switch tussen Preview en Code, klik Copy HTML
```

## De 20 modulaire blokken

Elk blok is opt-in via `SHOW_*` flag. Volgorde in de email:

| # | Module | Toggle | Wat het is |
|---|---|---|---|
| 1 | Header | `SHOW_HEADER` | Logo links, optionele tagline rechts |
| 2 | Press bar | `SHOW_PRESS_BAR` | "Featured in" + 3–5 media logo's |
| 3 | Hero | `SHOW_HERO` | Eyebrow label + (gradient) H1 + groet + intro + optionele image |
| 4 | Stats | `SHOW_STATS` | 3-up KPI row (huge numbers + labels) |
| 5 | Manifesto | `SHOW_MANIFESTO` | Oversized gradient pull-quote met attributie |
| 6 | Content | `SHOW_CONTENT` | Numbered editorial paragraphs (repeatable) |
| 7 | Case study | `SHOW_CASE_STUDY` | Cover image + metric pills + CTA link |
| 8 | Quote | `SHOW_QUOTE` | Klassiek testimonial blok met paars accent |
| 9 | CTA | `SHOW_CTA` | Bulletproof primary button (VML voor Outlook) |
| 10 | Articles | `SHOW_ARTICLES` | 3-column newsletter roundup |
| 11 | Services | `SHOW_SERVICES` | 2×2 service grid met icons |
| 12 | Team | `SHOW_TEAM` | Team spotlight met ronde avatars |
| 13 | Event | `SHOW_EVENT` | Webinar/talk card met datum-pijl + RSVP |
| 14 | Logo wall | `SHOW_LOGO_WALL` | "Trusted by" client logo strip |
| 15 | Image | `SHOW_IMAGE` | Full-width image + caption |
| 16 | Two-column | `SHOW_TWO_COLUMN` | Twee features naast elkaar (stackt mobile) |
| 17 | Divider | `SHOW_DIVIDER` | Dunne lijn |
| 18 | Signature | `SHOW_SIGNATURE` | Foto + naam + rol + optionele handgeschreven sig |
| 19 | Footer links | `SHOW_FOOTER_LINKS` | Multi-column nav (Diensten / Bedrijf / Resources) |
| 20 | Footer | `SHOW_FOOTER` | Bedrijf, adres, socials, unsubscribe, copyright |

## Editor — workflow

`editor.html` is een complete in-browser editor:
- **Live preview** rechts (desktop + mobile switch)
- **Code tab** met copy-button
- **Download .html** voor offline gebruik
- **Load sample** om alles direct gevuld te zien
- **Persist** naar localStorage (refresh-safe)
- Elke section heeft een **toggle** om hem aan/uit te zetten in de mail
- Arrays (content blocks, stats, articles, services, team, links, logo's)
  zijn vrij toe te voegen of te verwijderen

## Repeatable arrays — JSON formaat

Wanneer je niet de editor maar JSON gebruikt:

```jsonc
"CONTENT_BLOCKS": [
  { "HEADING": "...", "BODY": "..." }
],
"STATS": [
  { "VALUE": "312%", "LABEL": "ROI binnen 6mnd" }
],
"PRESS_LOGOS": [
  { "URL": "...", "ALT": "Forbes", "HREF": "" }
],
"ARTICLES": [
  { "IMAGE_URL": "...", "IMAGE_ALT": "...",
    "TAG": "INSIGHT · 6 MIN", "HEADING": "...",
    "EXCERPT": "...", "URL": "..." }
],
"SERVICES": [   // max 4 — rendert als 2×2 grid
  { "ICON_URL": "...", "ICON_ALT": "...",
    "TITLE": "...", "BODY": "..." }
],
"TEAM": [
  { "PHOTO_URL": "...", "ALT": "...",
    "NAME": "...", "ROLE": "...", "LINK_URL": "..." }
],
"LOGO_WALL": [
  { "URL": "...", "ALT": "..." }
],
"CASE_STUDY_METRICS": [
  { "VALUE": "40u", "LABEL": "Bespaard per week" }
],
"FOOTER_LINK_GROUPS": [   // max 3 kolommen
  { "TITLE": "DIENSTEN",
    "LINKS": [ { "TEXT": "AI Strategy", "URL": "..." } ]
  }
]
```

## Brand kleuren

| Token | Hex | Gebruik |
|---|---|---|
| Achtergrond | `#0c0e18` | body |
| Kaart | `#151828` | content cards, hero, services |
| Primair accent | `#9952e0` | knoppen, links, badges |
| Licht paars | `#bf80ff` | eyebrows, hover, accent text |
| Hoofdtekst | `#f2f2f2` | body copy |
| Muted tekst | `#a6a6a6` | captions, footer |
| Border | `#33374d` | dividers |
| Goud accent | `#fde68b` | manifesto label, event pill, gradient eind |

De gradient (paars → goud) wordt gebruikt op de hero titel, manifesto
en op number-badges in content blocks. Werkt in Apple Mail, iOS Mail,
Gmail web. Outlook desktop valt netjes terug op vlakke `color`.

## Personalisatie (merge tags)

Je kunt ESP merge tags zoals `{{FIRST_NAME}}`, `%%TOKEN%%` of
`{{FNAME}}` direct in elk text-veld zetten. De Handlebars-compile
laat dubbele tags die niet matchen met je data ongemoeid (`noEscape`
is uit, dus gewone HTML-escaping). Voor merge tags die conflicteren
met Handlebars-syntax kun je op string-niveau `[[FIRST_NAME]]` of
`%%TOKEN%%` gebruiken — die negeert Handlebars volledig.

## Email-client compatibiliteit

- [x] Gmail (web, iOS, Android) — clipt boven 102KB, design is intact
- [x] Apple Mail (macOS + iOS) — gradient text rendert
- [x] Outlook Windows (2016/2019/365) — VML buttons + mso fallbacks,
      vlakke kleur ipv gradient, geen border-radius (rechte hoeken)
- [x] Outlook Mac
- [x] Outlook web / Outlook.com — `[data-ogsc]` dark-mode hardening
- [x] Yahoo Mail
- [x] Mobile breakpoint @ 480px (typografie, padding, kolommen stacken)

## Een eigen blok toevoegen

1. Open `src/template.mjml`, plak een nieuwe `<mj-section>` op de
   gewenste positie, wikkel hem in `<mj-raw>{{#if SHOW_X}}</mj-raw>` …
   `<mj-raw>{{/if}}</mj-raw>`.
2. Voeg het blok toe in het `SCHEMA` array van `editor.html`.
3. Voeg sample-content toe aan `sample-data.json`.
4. Run `node build.js --data sample-data.json` — klaar.

## Bekende keuzes

- **Geen webfonts**: bewust niet geladen. We vertrouwen op system
  Inter (macOS Sequoia, Windows 11) → systeem-stack fallback.
- **Gradient text**: niet ondersteund in Outlook desktop. Dat is OK —
  we vallen terug op de vlakke `color` die in MJML staat ingesteld.
- **`border-radius`**: Outlook desktop negeert dit. Knoppen en cards
  zijn dus rechthoekig in Outlook. Bewuste trade-off.
- **Image hosting**: alle `*_URL` velden zijn placeholder URLs
  (`via.placeholder.com`) in de sample data. Vervang door je eigen
  CDN/asset host voor productie.
- **Filled output ~140KB**: ruim onder Outlook's 200KB-limiet. Gmail
  clipt boven 102KB met "View entire message" link, design blijft
  perfect. Voor critical-path emails kun je modules uitschakelen.
