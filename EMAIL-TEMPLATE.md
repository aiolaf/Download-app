# NinA AI — herbruikbare email template

Een MJML-gebaseerde, donkere, premium email template (denk Stripe / Linear /
Notion) voor NinA AI Agency. Mobile-first, dark-mode aware, en getest in
de gangbare clients: Gmail, Apple Mail, Outlook (Win/Mac/Web/.com),
Yahoo en iOS/Android.

## Bestanden

| Pad | Wat het is |
|---|---|
| `src/template.mjml` | MJML source met alle modulaire blokken en `{{placeholders}}` |
| `build.js` | Node-script dat MJML compileert en optioneel Handlebars data invult |
| `dist/template.html` | Gecompileerde bulletproof HTML met `{{placeholders}}` intact — dit upload je naar je ESP/CRM |
| `dist/template-filled.html` | Volledig ingevulde voorbeeldmail (alleen bij gebruik van `--data`) |
| `sample-data.json` | Voorbeeld-data met dummy content voor lokale preview |

## Builden

```bash
# 1. dependencies (eenmalig)
npm install

# 2. alleen compileren — placeholders blijven staan
node build.js
# of via npm:
npm run build:email

# 3. compileren + sample data invullen — open in browser om te previewen
node build.js --data sample-data.json
# of:
npm run build:email:sample
```

Na stap 3 opent `dist/template-filled.html` netjes in elke browser. Sleep
hem ook gerust in een test-tool zoals Litmus of Email on Acid voor
client-screenshots.

## Modulaire blokken

Elk blok is onafhankelijk aan/uit te zetten via `SHOW_*` flags in je
data file:

| Flag | Blok |
|---|---|
| `SHOW_HEADER` | Logo + optionele tagline |
| `SHOW_HERO` | Grote H1 + intro + optionele hero-afbeelding |
| `SHOW_CONTENT` | Herhaalbare H2 + paragraaf blokken (zie `CONTENT_BLOCKS`) |
| `SHOW_QUOTE` | Quote/highlight blok met paars accent |
| `SHOW_CTA` | Bulletproof button (VML fallback inbegrepen) |
| `SHOW_IMAGE` | Full-width afbeelding met optionele caption |
| `SHOW_DIVIDER` | Dunne lijn (#33374d) |
| `SHOW_TWO_COLUMN` | Twee features naast elkaar, stackt < 480px |
| `SHOW_FOOTER` | Brand, adres, socials, unsubscribe, copyright |

Zet een flag op `false` en het blok wordt uit de HTML weggelaten.

## Alle placeholders

### Header / meta
| Variabele | Voorbeeld | Verplicht |
|---|---|---|
| `EMAIL_TITLE` | `"Welkom bij NinA AI"` | ja (HTML `<title>`) |
| `PREHEADER` | `"Een nieuw tijdperk van AI..."` (≤ 90 tekens) | ja |
| `LOGO_URL` | `"https://nina-ai.nl/logo.png"` | indien `SHOW_HEADER` |
| `LOGO_ALT` | `"NinA AI logo"` | indien `SHOW_HEADER` |
| `LOGO_HREF` | `"https://nina-ai.nl"` | indien `SHOW_HEADER` |
| `TAGLINE` | `"AI AGENCY · AMSTERDAM"` | optioneel |

### Hero
| Variabele | Voorbeeld |
|---|---|
| `HERO_TITLE` | `"AI die voor jouw business werkt."` |
| `HERO_BODY` | `"Wij bouwen op maat gemaakte..."` |
| `HERO_IMAGE_URL` | `"https://.../hero.png"` (leeg = verbergen) |
| `HERO_IMAGE_ALT` | `"Screenshot van de NinA dashboard"` |

### Content (herhaalbaar)
`CONTENT_BLOCKS` is een **array**. Elk item heeft `HEADING` en `BODY`.
`BODY` ondersteunt onbescaaped HTML (triple-stash `{{{...}}}`) zodat je
links en `<strong>` tags mag gebruiken.

```json
"CONTENT_BLOCKS": [
  { "HEADING": "Waarom NinA?", "BODY": "We combineren <strong>strategie</strong>..." },
  { "HEADING": "Wat krijg je?", "BODY": "Een dedicated AI-agent..." }
]
```

### Quote
| Variabele | Voorbeeld |
|---|---|
| `QUOTE_TEXT` | `"Binnen zes weken bespaarde..."` |
| `QUOTE_AUTHOR` | `"Mark de Vries, COO bij Lumen B.V."` (optioneel) |

### CTA
| Variabele | Voorbeeld |
|---|---|
| `CTA_TEXT` | `"Plan een strategiegesprek"` |
| `CTA_URL` | `"https://nina-ai.nl/contact"` |
| `CTA_SUBTEXT` | `"30 minuten · gratis"` (optioneel) |

### Image
| Variabele | Voorbeeld |
|---|---|
| `IMAGE_URL` | `"https://.../feature.png"` |
| `IMAGE_ALT` | `"Beschrijving van de afbeelding"` (verplicht) |
| `IMAGE_CAPTION` | `"Onderschrift"` (optioneel) |

### Two-column
| Variabele | Voorbeeld |
|---|---|
| `COL1_IMAGE_URL` / `COL2_IMAGE_URL` | URL of `""` om te verbergen |
| `COL1_IMAGE_ALT` / `COL2_IMAGE_ALT` | alt-text |
| `COL1_TITLE` / `COL2_TITLE` | `"Snel live"` |
| `COL1_BODY` / `COL2_BODY` | paragraaf tekst |

### Footer
| Variabele | Voorbeeld |
|---|---|
| `FOOTER_COMPANY` | `"NinA AI"` |
| `FOOTER_ADDRESS` | `"Herengracht 100, 1015 BS Amsterdam"` |
| `LINKEDIN_URL` | `"https://linkedin.com/company/nina-ai"` |
| `TIKTOK_URL` | `"https://tiktok.com/@nina.ai"` |
| `UNSUBSCRIBE_URL` | `"https://nina-ai.nl/unsubscribe?token=%%TOKEN%%"` |
| `COPYRIGHT_YEAR` | `"2026"` |

## Brand kleuren (vastgelegd in `src/template.mjml`)

| Token | Hex | Gebruik |
|---|---|---|
| Achtergrond | `#0c0e18` | body |
| Kaart | `#151828` | content cards, hero |
| Primair accent | `#9952e0` | knoppen, links |
| Licht paars | `#bf80ff` | hover/secondary |
| Hoofdtekst | `#f2f2f2` | body copy |
| Muted tekst | `#a6a6a6` | captions, footer |
| Border | `#33374d` | dividers |
| Goud accent | `#fde68b` | optionele highlight (nog niet in default modules) |

Wil je het goud accent ergens gebruiken? Override de relevante MJML
class of voeg een nieuw blok toe met `color="#fde68b"`.

## Een nieuw blok toevoegen

1. Open `src/template.mjml`.
2. Plak een nieuw `<mj-section>` op de plek waar je hem wilt hebben.
3. Wikkel hem desgewenst in `<mj-raw>{{#if SHOW_MIJN_BLOK}}</mj-raw>`
   ... `<mj-raw>{{/if}}</mj-raw>` zodat hij optioneel wordt.
4. Voeg nieuwe placeholders toe in `{{HANDLEBARS}}` syntax.
5. Run `node build.js --data sample-data.json` en check het resultaat.

## Email-client compatibiliteit (checklist)

- [x] Gmail (web, iOS, Android)
- [x] Apple Mail (macOS + iOS)
- [x] Outlook Windows (2016/2019/365) — VML buttons + mso fallbacks
- [x] Outlook Mac
- [x] Outlook web / Outlook.com — `[data-ogsc]` dark-mode hardening
- [x] Yahoo Mail
- [x] Mobile breakpoint @ 480px

## Bekende dingen

- **Webfonts**: bewust niet geladen. We vallen terug op Inter (indien
  lokaal geïnstalleerd, bv. macOS Sequoia/Windows 11) → systeem-stack.
- **Donker thema in Gmail Android**: Gmail kan kleuren licht
  inverteren. Door `meta name="color-scheme"` + `!important` op de body
  background houden we het donker in 95% van de gevallen.
- **Outlook desktop**: rendert geen `border-radius` op knoppen. De VML
  fallback gebruikt rechte hoeken — bewuste trade-off, accepteer 'm.
