# Agent Instructions

## Project Overview

This is an Astro 6 site base for AI-generated marketing websites. It uses React, Tailwind CSS 4, shadcn-style primitives, Astro Font API, semantic theme tokens and a design audit step.

The goal is not to generate another generic landing page. The goal is to generate a page with a clear visual identity, deliberate section rhythm and a recognizable motif.

## Tech Stack

- Framework: Astro 6 with `@astrojs/node` adapter.
- UI: React 19 for interactive islands.
- Styling: Tailwind CSS 4 via Vite plugin, CSS theme variables, `tw-animate-css`.
- Fonts: Google Fonts via Astro Font API in `astro.config.mjs`, applied with `<Font />` in `RootLayout.astro`.
- Icons: `astro-icon` in `.astro` files, `lucide-react` in React components.
- SEO: Meta tags in `RootLayout.astro`, `@astrojs/sitemap`, dynamic `robots.txt`.
- Forms: React contact form with valibot validation, honeypot and time-based spam protection.

## Core Files

- `src/design/identity.ts`: persistent visual direction for the project.
- `src/design/font-recipes.ts`: supported font pairings and their mood.
- `src/design/allowed-ui.ts`: shadcn-style component allowlist for marketing sites.
- `src/design/section-blueprints.ts`: available page rhythms. The first rhythm is local-service oriented.
- `src/styles/global.css`: Tailwind v4 theme variables and brand tokens.
- `scripts/design-audit.mjs`: checks for common AI landing-page sameness.


## Default audience bias

Assume many generated sites are for normal local businesses first: trades, practices, restaurants, studios, agencies, clubs, real estate offices, local service providers and small shops. Do not default to a Tech SaaS, dashboard, startup, AI tool or product-led layout unless the brief points there.

For local-business sites, prioritize:

- clear service area, phone number, opening hours and contact CTA,
- proof of reliability instead of generic star ratings,
- real work imagery or tactile visual motifs,
- readable sections over dashboard-like UI,
- header variants with contact information, not only SaaS navigation.

The first example homepage in this repository intentionally uses a local-service archetype. Treat it as the default audience anchor, not as a fixed template.

## Mandatory: Design DNA before code

Before writing layout code, define the visual direction in `src/design/identity.ts` with these six decisions:

1. Archetype: `editorial`, `poster`, `split-product`, `local-service`, `portfolio`, `magazine`, `luxury-consulting`, or `event-campaign`.
2. Density: `airy`, `balanced`, or `compact`.
3. Typography role: `typographic-first`, `image-first`, `product-first`, or `proof-first`.
4. Container rhythm: for example `narrow -> wide -> full-bleed -> asymmetric -> narrow`.
5. Shape language: `sharp`, `subtle-rounded`, `soft`, `pill`, or `geometric`.
6. Image or motif strategy: real imagery, product screens, abstract shapes, pattern system, icons, or pure typography.

All layout, color, type and section decisions must fit that identity. Do not leave `identity.ts` generic after generating a customer site.

## Forbidden default signatures

Avoid these combinations unless the user explicitly asks for them:

- Hero pattern: `mx-auto max-w-3xl ... text-center`.
- More than two sections using `max-w-7xl mx-auto` or `mx-auto max-w-7xl`.
- Default sequence: Hero -> 3 feature cards -> Testimonials -> CTA.
- Feature list as an equal 3-column grid with icon, title and short text.
- Every section using centered `h2` plus centered subtitle.
- More than two obvious `bg-card rounded-* border shadow` card panels on a marketing page.
- Generic trust line with five stars and `100+ Bewertungen`.
- All sections using the same vertical rhythm, such as only `py-16` or only `py-20`.

## Variation Budget

Every homepage must contain at least 4 of these 8 traits:

- An asymmetric section.
- A full-bleed color surface.
- A narrow text section (`max-w-2xl`, `max-w-3xl`, or smaller) that is not the hero.
- A deliberately wide or edge-to-edge section.
- A non-card-based feature presentation.
- A large typographic section without an image.
- A recurring visual motif.
- A section order that does not start with a centered hero.

Record the selected traits in `src/design/identity.ts`.

## Layout principles

- Use section composition, not page templates.
- Prefer strong section rhythm over a stack of similar containers.
- Use `full-bleed` when a surface should break out of the page frame.
- Mix narrow, wide, full-bleed and asymmetric containers intentionally.
- Do not solve every layout with cards.
- Avoid copy-paste repetition of the same section scaffold.
- Do not use a Bento grid as decoration. Use a Bento/Mosaic only when it helps explain different content sizes or priorities.
- For non-tech businesses, prefer a service mosaic, proof strip or process section over product screenshots and metric dashboards.

## Design tokens

Use semantic tokens from `global.css`:

- Core shadcn-style tokens: `background`, `foreground`, `primary`, `muted`, `border`, `card`, etc.
- Brand extension tokens: `primary-soft`, `accent-2`, `surface-tint`, `surface-strong`, `grid-line`, `spotlight`.

Rules:

- Use at least two tokens beyond `primary` on every homepage.
- `primary` must not be used only for buttons.
- Prefer token changes over one-off arbitrary colors.
- Keep contrast readable.

## Fonts

The project includes four font recipes:

- `cleanSaas`: Inter for body and headings.
- `editorial`: Inter body, Fraunces headings.
- `boldStartup`: Inter body, Space Grotesk headings.
- `localCraft`: Inter body, Bricolage Grotesque headings.

Set the active recipe in `config.design.fontRecipe`. Do not default to Inter-only unless the brand direction truly calls for it.

## shadcn-style component policy

Allowed by default for marketing pages:

- `Button`, `Input`, `Textarea`, `Label`, `Dialog`, `Sheet`, `Accordion`.

Use sparingly and only with a reason:

- `Card`, `Badge`, `Tabs`, `Carousel`, `Tooltip`.

Avoid by default on normal landing pages:

- `Table`, `Command`, `Calendar`, `Resizable`, `Menubar`, `ContextMenu`, `Combobox`.

shadcn-style components are primitives, not a marketing section library. Build sections in HTML plus Tailwind. Use interactive primitives only where the UX needs them.

## Visual motif requirement

Every homepage needs one visual motif:

- real project image,
- product or UI screenshot,
- typographic key visual,
- abstract shape or pattern system,
- icon or line motif.

Use `src/components/visual/*` as starting points. Do not use generic stock-photo concepts like smiling people at laptops unless the user specifically requests them.

## Header and footer variants

Set variants in `src/config.ts`:

- `config.design.header`: `plain`, `floating`, `split`, `transparent`, `local`, `centered`, or `boxed`.
- `config.design.footer`: `minimal`, `takeover`, `sitemap`, or `contact-heavy`.

Use variants to make the global frame match the visual identity. For local businesses, prefer `local`, `centered`, or `boxed` before `floating`. Do not leave every project on the same header/footer shape.

## Images

- Local images inside `src/`: use Astro assets (`Image` or `Picture`) when imported statically.
- Images in `public/`: use regular `<img>` with `loading`, `decoding`, `width`, `height`, and useful `alt`.
- External images: use explicit width/height and lazy loading unless above the fold.
- Decorative visuals must use `alt=""` or `aria-hidden="true"`.

## Forms

- `/kontakt` uses `ContactForm.tsx` with `client:load`.
- The API route is `src/pages/api/contact.ts` and has `prerender = false`.
- Spam protection: honeypot field `_gotcha` plus time-based check.
- Minimum submit time is 5 seconds and must stay consistent between docs and code.
- Do not silently submit if SMTP is not configured.

## Client hydration

Only hydrate components that need client JavaScript.

- Mobile navigation should use `client:media="(max-width: 767px)"`.
- Contact form uses `client:load` because the form needs immediate interaction.
- Prefer static Astro components for layout sections.

## Design audit

Run after generating or heavily changing a homepage:

```bash
pnpm design:audit
```

If two or more checks fail, revise the design before finishing. Treat audit failures as design feedback, not as mere lint errors.

The audit checks for:

- centered default hero signatures,
- excessive repeated max-width containers,
- too many centered headings,
- too many card-like panels,
- missing full-bleed surface,
- missing secondary accent tokens,
- missing visual motif,
- repeated vertical spacing.

## Quality bar

A completed homepage should be able to answer these questions clearly:

1. What is the visual archetype?
2. What makes the page visually different from a default SaaS landing page?
3. Where is the recurring motif?
4. Which sections break the container rhythm?
5. Which tokens beyond `primary` carry the brand?
6. Did the design audit pass?
