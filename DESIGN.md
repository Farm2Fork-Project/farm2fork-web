---
name: Farm2Fork
description: A calm, legible green marketplace that connects Pakistani farmers directly to buyers, with a plain editorial paper-and-ink public front door.
colors:
  primary: "#236B44"
  primary-dark: "#174B31"
  primary-soft: "#E4F1DD"
  secondary-blue: "#2E6F8E"
  secondary-blue-soft: "#E3F0F5"
  accent-yellow: "#F0B429"
  accent-yellow-soft: "#FFF1C2"
  success: "#2F7D4D"
  error: "#C8463A"
  error-text: "#9d2f25"
  error-wash: "#fdf0ee"
  ink: "#1F2E24"
  ink-muted: "#6B776C"
  canvas: "#F6F8F1"
  surface-light: "#FAFBF8"
  surface-medium: "#E7EDE0"
  surface-strong: "#D4E0CB"
  white: "#FFFFFF"
  sidebar-navy: "#1B2B3A"
  landing-paper: "#fbfbfa"
  landing-ink: "#1c1c1c"
  landing-green: "#386c51"
  landing-green-dark: "#294f3b"
  landing-sand: "#a58a50"
typography:
  display:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(28px, 3vw, 36px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  display-hero:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(50px, 4.7vw, 66px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Young Serif, Iowan Old Style, Georgia, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-ui:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.5px"
  urdu:
    fontFamily: "Noto Nastaliq Urdu, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
  page-gutter: "16px"
  page-max: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  checkout-panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
  pickup-summary:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
  pickup-summary-icon:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    size: "44px"
  category-chip-icon:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.primary-dark}"
    size: "68px"
  auth-error:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
---

# Design System: Farm2Fork

## Overview

**Creative North Star: "The Market Ledger"**

Farm2Fork is one product in two shells: the Flutter app and this web app share role colours, badge meanings and token values (the `:root` block is deliberately kept in sync with the mobile `AppColors`, `AppSpacing` and `AppRadius`). The system is calm, green and legible. Surfaces are pale green-tinted paper, text is deep green-black, and the single saturated voice is a forest green (#236B44). Density may rise on web; the mood does not get louder.

Type does the personality work. Headings use Young Serif, a single-weight display serif, set large and tight; everything operational uses Atkinson Hyperlegible Next, chosen for legibility on mid-range screens in bright light. Urdu switches the whole document to a self-hosted Nastaliq face under `[dir="rtl"]`. The public landing page is the editorial extension of the same world: near-white paper, near-black ink, a softer green and a sand accent, with drawn icons in place of numerals.

This pass extends the incumbent green theme; it did not replace it.

**Key Characteristics:**
- Forest green (#236B44) is the only saturated accent in the app shell; yellow and blue are semantic.
- Display serif for page and section titles, hyperlegible sans for all else, Nastaliq for Urdu.
- Pill buttons, large rounded cards (16px), 12px fields.
- Soft ambient shadows only; borders in pale green-grey do most of the separating.
- One custom icon family: round-capped 1.75px outline with an off-register tint fill.
- One shared page gutter and container for every portal.

## Colors

A tinted-neutral green system: every neutral leans toward the brand hue, and warm sand appears only on the public landing page.

### Primary
- **Field Green** (#236B44, `--primary-green`): primary buttons, active tab text, focus borders, links, the leaf mark. Hover and logo ink use **Deep Furrow** (#174B31). **Sprout Wash** (#E4F1DD) is the soft fill for selected states, icon tiles and hover on outlined buttons.

### Secondary
- **River Blue** (#2E6F8E, soft #E3F0F5): informational badges and transporter-flavoured accents.
- **Harvest Yellow** (#F0B429, soft #FFF1C2): pending and warning badges (dark ink text on it).

### Neutral
- **Ink** (#1F2E24): text. **Muted Ink** (#6B776C): secondary text, placeholder, icon strokes in fields.
- **Canvas** (#F6F8F1): page background. **Surface Light** (#FAFBF8): panels and hover fills. **Surface Medium** (#E7EDE0): hairline borders (`--border-light`). **Surface Strong** (#D4E0CB): field borders (`--border-color`).
- **Error** (#C8463A) for destructive buttons and red badges; inline error messages use the softer trio of wash #fdf0ee, border #f1c9c4, text #9d2f25.
- **Navy Rail** (#1B2B3A): admin sidebar only.

### Landing palette
The public page scopes its own variables (`.market-landing`). The final scoped layer wins: **Paper** (#fbfbfa), **Print Ink** (#1c1c1c), **Landing Green** (#386c51, dark #294f3b), **Sand** (#a58a50). An older, warmer set (#f5f0e5 paper, #155c3c green, #b85d38 clay) is still in the file under the winning layer; the build uses the newer values.

### Named Rules
**The One Green Rule.** In the app shell, green is the only brand accent. Blue and yellow carry meaning (info, pending), never decoration.

**The Defined Token Rule.** Colour comes from a named token. `--border-light`, `--border-color` and `--text-main` exist as aliases of Surface Medium, Surface Strong and Ink; do not reference a custom property that is not defined.

## Typography

**Display Font:** Young Serif (`--font-display`, falls back to Iowan Old Style, Georgia, serif)
**Body Font:** Atkinson Hyperlegible Next (`--font-primary`, variable, falls back to system-ui)
**Urdu Font:** Noto Nastaliq Urdu, self-hosted from `app/fonts` (`--font-urdu`)

All three load through `next/font` in `app/layout.tsx` into `--font-sans-loaded`, `--font-display-loaded` and `--font-urdu-loaded`, then are exposed as the tokens above.

**Character:** a warm, slightly old-fashioned serif headline over a plain, open-lettered sans. Reads as a trustworthy market stall, not a fintech dashboard.

### Hierarchy
- **Hero** (400, clamp(50px, 4.7vw, 66px), 1.08, -0.035em): landing hero and landing section titles only.
- **Page title** (400, clamp(28px, 3vw, 36px), 1.15, -0.01em): `.page-title`, `.page-header h1`, marketplace section title.
- **Panel title** (400, 24px, 1.2): `.checkout-panel h3`; the top bar wordmark is the same face at 24px.
- **Body** (400, 16px, 1.5): page default. UI text and descriptions 15px; page-header lede 16px muted.
- **Label** (600, 14px): field labels, tab links, category names, buttons (14px, 700).
- **Caption** (700, 12px, 0.5px tracking, uppercase): badges. 12px is the floor.
- **Urdu** (15px body, line-height 1.8): applied to the whole document and to headings under `[dir="rtl"]`, letter-spacing reset to normal.

Sizes are written as `calc(Npx * var(--font-scale, 1))` so the user text-scale setting applies.

### Named Rules
**The One Weight Rule.** Young Serif is loaded at 400 only. Never bold, italicise or ask for another weight; the browser would synthesise it. Emphasis inside a serif heading is colour, not style.

**The Legible Floor Rule.** Nothing is set below 12px; secondary text is 13px or more; body is 15 to 16px.

## Layout

One page gutter and one container. `--page-gutter` is 16px, 24px from 640px and 40px from 1024px; `--page-max` is 1280px. The sticky `.topbar` (72px tall) and `.app-content` use the same values, so a portal's header and page share a left edge. `.app-content` pads 24px (`--sp-xxl`) top and 56px bottom.

Spacing uses the `--sp-*` scale: 4, 8, 12, 16, 20, 24, 32. Product grids use `repeat(auto-fill, minmax(min(100%, 240px), 1fr))`. The marketplace puts title first, tools second, results third; its sidebar column exists only when a sidebar renders.

Shared top bar (buyer, farmer, transporter, financial): logo, tabs and account on one row. Below 1100px the account text collapses to the avatar. Below 760px the tabs move to a second 48px row that scrolls horizontally, with the logo and avatar row at 60px. The mobile drawer button is hidden because the tab row replaces it. Checkout address grids go single-column at 640px. The landing header has its own wider container (about 1180px).

## Elevation & Depth

Mostly flat with tonal layering. Cards sit on the canvas by a 1px pale green border plus a barely-there shadow; hover deepens it slightly.

- **Card rest** (`0 2px 8px rgba(0,0,0,0.04)`), hover (`0 8px 16px rgba(0,0,0,0.06)`).
- **Top bar** (`0 4px 30px rgba(0,0,0,0.02)` with 12px backdrop blur on a 78% white fill).
- **Focus ring** (`0 0 0 3px rgba(35,107,68,0.16)` with a green border).
- Primary-action lift on some heroes uses a green-tinted shadow (`0 6px 20px rgba(35,107,68,0.3)`).

**The Border-First Rule.** Separation comes from a 1px or 1.5px green-grey border; shadows stay under 8% black.

## Shapes

Soft and round. Radii: 6px (`--radius-sm`), 8px, 12px (fields), 16px (cards, panels), pill (buttons, edit chips, badges). Icon tiles use 14px (pickup) or a full circle (landing steps and category tiles). Borders are 1px for containers and 1.5px for fields and outlined chips.

### Icons
A custom set in `components/icons` (`art.ts` holds path data on a 24px grid; `index.tsx` exports the `Ic*` components). Every icon is a round-capped, round-joined 1.75px outline in `currentColor`, with an optional closed tint shape drawn 1.1 units down and right of the line, like a misregistered print. Tint colour and strength are overridable with `--icon-tint` and `--icon-tint-opacity` (default 0.16). Default size is 1em. The set includes drawn crop pictograms (wheat, rice, mango, maize, cotton, sugarcane, carrot, milk), a woven-basket cart, a leaf-in-pin map marker and a rupee coin.

**The One Icon Hand Rule.** New icons are added to `art.ts` in this outline-plus-tint construction. Do not mix in a second style.

## Components

### Buttons
- **Shape:** full pill (999px), minimum height 40px, 14px bold; large variant pads 12px 24px.
- **Primary / success:** Field Green on white text; hover Deep Furrow. **Secondary / outline:** white or transparent with a 1px Surface Medium border; hover Surface Light. **Danger:** transparent, Error border and text. **Dark:** Ink fill.
- Landing CTAs (`.market-primary`) are 48px tall with a 6px radius, a different shape from the app shell.

### Fields
- 48px tall, 1.5px Surface Strong border, 12px radius, white fill, 15px text. Hover border goes to Sprout Wash; focus is a green border plus the 3px ring. Selects use a drawn chevron and 42px right padding; the search field has an inline magnifier at 16px left.
- The same style applies to `.checkout-panel` inputs and selects.
- **Error:** `.auth-error` is a 14px, 600-weight message in a pale red wash with a hairline red border and 8px radius, 16px below its field.

### Cards / Containers
- **Card:** white, 1px Surface Medium border, 16px radius, 20px padding, ambient shadow.
- **Checkout panel:** white, 16px radius, 24px padding, 16px grid gap; the title is Young Serif 24px, helper text 15px muted. Submit button aligns start, 46px tall.
- **Pickup summary:** a compact saved-location row: 44px green-soft icon tile (14px radius), strong 16px line over a single-line ellipsised 15px muted line, and a pill "Edit" button (44px, 1.5px border, green text). A status line spans the full row in green.

### Chips and badges
- **Category chip:** 68px round tile, Surface Medium border, 6% green tint fill, 30px drawn icon in Deep Furrow, 14px name beneath, min width 88px.
- **Badge:** pill, 12px uppercase bold, solid green, yellow, red or blue.

### Navigation
- Top bar tabs: 14px 600, muted ink, 8px radius, 8px 16px padding. Hover tints green 4%; active is green text on an 8% green wash with a 12% green border. The wordmark is Young Serif.

### Landing steps (signature)
The "how it works" steps use a 52px circle with a drawn icon (green on a 8% green wash) instead of numerals; the old numeral is hidden. Section headings use the hero serif; the route diagrams are drawn, not photographic.

### Sign-in, sign-up and account (added with the auth redesign)
- **Auth pages (`.af-*`, `app/auth.css`)** are the landing page's paper-and-ink look on real routes: Young Serif headings, 48px fields with the app's field shape, full-pill buttons, one calm form column and, from 960px, a photo panel (`/landing/farmer-market-hero.png`) with one honest line. One decision or one short step per screen; the progress bar is segments plus "Step 2 of 3". Errors sit under their field (text, not colour alone), the form-level message is a pale wash box, and focus moves to the step heading when the step changes.
- **Account (`.ac-*`, `app/account.css`)** uses the app shell tokens (canvas background, white 16px cards, forest green) so it reads as part of the signed-in product. The edit page has a sticky save bar; the profile photo is cropped inline, not in a dialog.
- **Inline confirm (`.ic-*`)** replaces confirmation dialogs for short decisions: the button becomes "Are you sure?  Cancel | Confirm" in place, focus lands on Cancel, Escape cancels. `.btn-danger-solid` is the one solid red button.
- **Avatar** is the photo from the API or a green-soft circle with initials.

### Motion (`app/motion.css`)
Landing and the buyer product page share one motion language: things arrive once, fast out and long settle (ease-out-quart), and then rest. The hero stages headline, lede, actions and photo in a 0.9s cascade; sections and cards reveal on scroll through `data-reveal` + `lib/react/use-reveal.ts` (hidden state exists only after the client adds `.motion-ready`, so server HTML, crawlers and reduced-motion visitors get the finished page). Only opacity and the individual `translate`/`scale`/`rotate` properties animate, so reveals compose with hover transforms. Scroll-driven effects (hero photo drift, header edge) are progressive enhancement behind `@supports (animation-timeline: scroll())`. The only loops are a slow light behind the closing call to action and a quiet ring on the final trace stop.

### Product page (`.pdp-*`, `app/product.css`)
The buyer product page answers "can I trust this and who made it" on one screen: gallery and a sticky buy panel (price, quantity, add to cart, three assurances), a four-tile proof strip, the ledger journey rendered inline from `/trace/products/:id` (with a dashed "next step" placeholder for unsold produce), an About/How-buying side column, a sage-tinted farm panel (owner, location, member since, listings, delivered orders, acres, crops with drawn crop icons, certifications) from the public `/farmers/:id/public` endpoint, then "More from this farm" and "More <category> from other farms" rows built from the shared `ProductCard`. Each data block loads and fails on its own, so a failed journey or farm lookup never hides the product. Product title and price run larger than the page-title step (up to 42px/44px) on purpose. On phones the buy button scrolls out of view, so a slim fixed bar takes over.

## Do's and Don'ts

### Do:
- **Do** take colour, spacing and radii from the `:root` tokens, and extend `app/globals.css` before reaching for Tailwind utilities.
- **Do** use `--font-display` for page and panel titles at weight 400, and `--font-primary` for everything else.
- **Do** keep text at 12px minimum, secondary text at 13px or more, body at 15 to 16px.
- **Do** use `--page-gutter` and `--page-max` for any new page-level container.
- **Do** build new fields to the one field style: 48px, 1.5px Surface Strong border, 12px radius, 3px green focus ring.
- **Do** draw new icons in the shared outline-plus-tint construction and pass `--icon-tint` for context colour.
- **Do** provide the Urdu face and RTL behaviour for buyer, farmer and transporter text.

### Don't:
- **Don't** bold, italicise or substitute another weight for Young Serif.
- **Don't** reference a custom property that is not defined in `:root`.
- **Don't** add a second saturated accent to the app shell or use blue and yellow decoratively.
- **Don't** make the landing page a generic SaaS template; keep the paper-and-ink editorial identity.
- **Don't** invent testimonials, logos or metrics; placeholder numbers are debt, not content.

## Known debt (recorded, not canonized)

- `app/globals.css` still holds duplicated legacy blocks for the landing page and the tokens; later layers win, so edit the final layer and expect older copies to be dead.
- Admin and financial screens are not restyled and still import some icons from `lucide-react`; they remain on the older look (navy sidebar, 800-weight sans titles).
- Some farmer screens (`FarmerListings.tsx`, `FarmerDashboard.tsx`, `FarmerSignup2.tsx`, `FarmFeed.tsx`) use Tailwind utility classes and inline styles instead of tokens, including 11px text.
- The farm banner shows placeholder rating (4.8) and sales data.
- Not inherited as house style: the uppercase tracked kickers on landing section headings and auth headings, the hard offset shadow (`3px 3px 0`) on landing primary buttons, and the 11px inline farmer labels. These are defects the build carries.
