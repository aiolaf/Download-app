---
name: nina-email
description: Use this skill when the user wants to write, draft, design or generate a marketing email, newsletter, customer announcement, webinar invite, case-study send, product launch, cold outreach or any other branded email. The skill composes copy in Dutch B2B voice (or the brand voice declared in the repo), fills the MJML template at src/template.mjml via a data JSON, runs `node build.js` to produce bulletproof HTML, renders desktop + mobile PNG previews via `node scripts/preview.js`, and surfaces the final HTML so the user can copy-paste into their ESP or email client. Triggers include phrases like "schrijf een email over", "maak een nieuwsbrief", "email template voor", "send announcement about", "draft an email for [event]", "build a launch email", "write a customer email".
---

# NinA AI — Email builder skill

You are operating a working MJML + Handlebars email pipeline that lives
in this repo. Your job is to take a user brief (audience, goal, offer)
and **ship a finished email**: branded HTML the user can paste into
Mailchimp / Customer.io / Klaviyo / any ESP, plus a PNG preview so they
can see what they're sending.

## Prerequisites — verify before doing anything

Run these checks silently with the Bash tool (use `ls`, not `cat`):

1. `src/template.mjml` exists (the MJML source)
2. `build.js` exists at the repo root
3. `sample-data.json` exists (use as a template, NEVER overwrite)
4. `node_modules/mjml` and `node_modules/handlebars` are installed
   — if missing, run `npm install`

If any prerequisite is missing, tell the user once and stop.

## Workflow — what to do every time

### Step 1. Brief intake

If the user's request lacks detail, ask **one** clarifying question via
`AskUserQuestion` covering at most these axes:

- **Doel** (de gewenste actie): demo plannen · whitepaper downloaden ·
  webinar bezoeken · feature aanzetten · upgraden · contact opnemen
- **Doelgroep** (warme klant · prospect · trial · enterprise · etc.)
- **Tone** (Nederlands zakelijk default; vraag alleen door als de
  brand-voice afwijkt — Engels, formeler, speelser)

Then move on. **Do not** keep asking — write the email and let the
user iterate.

### Step 2. Decide which modules to enable

Map the user's goal to a sensible module preset. **Less is more — never
turn on all 27 modules.** Defaults per intent:

| Intent | Modules to enable |
|---|---|
| Case study / customer story | HEADER, HERO, STATS, STEPS, CONTENT, SPOTLIGHT, QUOTE, CTA, GUARANTEE, FAQ, SIGNATURE, FOOTER |
| Newsletter (recurring) | PROMO_STRIP, HEADER, HERO, ARTICLES, CTA, SIGNATURE, FOOTER |
| Product launch | SCARCITY, HEADER, HERO, VIDEO, STATS, SPOTLIGHT, CTA, FAQ, SIGNATURE, FOOTER |
| Webinar invite | PROMO_STRIP, HEADER, SCARCITY, HERO, EVENT, TEAM, CTA, GUARANTEE, FOOTER |
| Cold outreach / 1:1 | HEADER, HERO, QUOTE, GUARANTEE, CTA, SIGNATURE, FOOTER |
| Customer announcement | HEADER, HERO, CONTENT, SPOTLIGHT, CTA, FAQ, SIGNATURE, FOOTER |
| Re-engagement | HEADER, SCARCITY, HERO, GUARANTEE, CTA, SIGNATURE, FOOTER |

Set the corresponding `SHOW_*` keys true; leave the rest false.

### Step 3. Write the copy

**Voice rules — non-negotiable for NL B2B brands like NinA:**

- **"Je", niet "u"** (B2B norm sinds ±2015 in NL)
- **Concrete getallen met bron**, niet ronde marketing-cijfers.
  ❌ "300% ROI" → ✅ "68% tickets zonder mens · gemeten in Lumen's
  dashboard, mrt-apr 2026"
- **Geen superlatieven** — vermijd: revolutionair, ongekend, uniek,
  baanbrekend, dé beste. Top-marketeers laten cijfers het werk doen.
- **Self-deprecation als trust signal**: "Wat we eerlijk niet wisten
  vooraf…" werkt beter dan "Wat we briljant deden".
- **Scarcity met echte datum**, niet caps lock: ✅ "Nog 3 plekken ·
  sluit vrijdag 31 mei" — ❌ "ACT NOW!!!"
- **Friction reducers** in CTA-subtekst: "30 min · je hoeft niets
  voor te bereiden · we sturen vooraf een vragenlijst".
- **FAQ adresseert echte koop-blokkers**: prijs, vendor lock-in,
  veiligheid, wat als het misgaat. Niet "wat is jullie missie".
- **Subject + preheader = één coherente boodschap.** Lees ze samen,
  ze vormen de openings-zin in de inbox.
- **One email = one job.** Max 1-2 CTA's. Als er twee zijn: één
  primair (button) + één secundair (tekstlink).
- **Risk reversal** (GUARANTEE-module) waar twijfel het grootst is:
  "Niet tevreden na week 1? Geen factuur. Geen kleine letters."

**Sample-line targets** (audit-friendly):

| Veld | Sweet spot | Hard cap |
|---|---|---|
| EMAIL_TITLE | 30-50 chars | 70 |
| PREHEADER | 50-90 chars | 90 |
| HERO_TITLE | 30-80 chars | 100 |
| CTA_TEXT | 2-4 woorden | 28 chars |
| Reading time | < 3 min | 5 min |

### Step 4. Write the data file

Create a **new** JSON file (do not overwrite `sample-data.json`).
Suggested location: `data/<topic-slug>.json` — create the `data/`
folder if needed.

The variable names you can fill are **exactly** those in
`sample-data.json`. Use it as your reference / starting point:

```bash
# Read sample-data.json to copy the structure
cat sample-data.json | head -200
```

Only set values for the modules you've enabled in Step 2. Leave
unused modules' SHOW_* keys as `false` (or omit them — Handlebars
treats missing as falsy).

### Step 5. Build + preview

```bash
node build.js --data data/<topic-slug>.json
node scripts/preview.js
```

If puppeteer is not installed, the preview script will tell you.
Install it on demand: `npm install puppeteer --no-save`.

Outputs you should expect:
- `dist/template-filled.html` — the final HTML
- `dist/preview-desktop.png` — full-page screenshot at 600px
- `dist/preview-mobile.png` — full-page screenshot at 390px

### Step 6. Self-audit before declaring done

Mentally walk the same 10 checks the editor's Audit tab runs (see
`EMAIL-TEMPLATE.md` for the full list). At minimum confirm:

- Subject 30-50 chars (mobile-safe)
- Preheader 50-90 chars
- Exactly 1-2 CTAs across the whole email
- Alt-text on every image URL (`*_ALT` not empty when `*_URL` is set)
- `UNSUBSCRIBE_URL` present
- No spam-trigger words (GRATIS!!!, klik hier nu, $$$, etc.)

If something fails, fix it in the JSON and rebuild — don't ship a
warning-ridden email.

### Step 7. Deliver to the user

Use `SendUserFile` to send three things:

1. `dist/preview-desktop.png` — so they see it
2. `dist/preview-mobile.png` — so they see it stacked
3. `dist/template-filled.html` — what they paste into their ESP

In your text reply, give:

- A one-sentence summary ("Case study email over Lumen — 47 chars
  subject, 1 CTA, 2,8 min lezen")
- The actual `EMAIL_TITLE` value (so they know the subject line)
- One tip if relevant (e.g. "Stuur 'm vroeg op dinsdag — onze
  best-performing slot in NL B2B")

Do **not** dump the full HTML in the chat reply — it's already in
the file. Reference the path instead.

## How to paste the result into an email client

The HTML in `dist/template-filled.html` is bulletproof — full
`<!doctype html><html>` document with MSO/VML fallbacks and inline
styles. To use it:

- **Mailchimp** → Email design → Code your own → paste full HTML
- **Customer.io / Klaviyo** → HTML editor → paste full HTML
- **Gmail / Outlook for hand-sending** → Open `template-filled.html`
  in Chrome → Cmd+A, Cmd+C → paste into the compose window
  (formatted-paste preserves the styling)
- **HubSpot** → Custom email template → Source code view → paste

## When the user wants to iterate

If they ask "make the subject shorter" / "shorter CTA" / "swap the
testimonial", just edit the existing data JSON (not the MJML), rebuild,
re-preview, and re-deliver. Don't start from scratch.

## When the user wants a new module

If the brief needs something the 27 modules don't cover (e.g. a price
table, a survey), tell them honestly — and offer to add it to
`src/template.mjml` as a new opt-in module. Don't shoehorn copy into
an unrelated existing block.

## File reference

- `src/template.mjml` — the source. Edit only when adding modules.
- `sample-data.json` — variable name reference + working defaults.
- `build.js` — compiler. Flags: `--data`, `--minify`, `--watch`.
- `scripts/preview.js` — puppeteer screenshot generator.
- `editor.html` — visual editor for manual tweaks (Preview + Code +
  Audit tabs). Open in browser.
- `EMAIL-TEMPLATE.md` — full docs, module catalog, audit checklist.
