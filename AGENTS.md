# AGENTS.md

This repository is a landing-page block library for an AI website builder. It is not a page-template repository.

## Primary default audience

Assume a normal local or regional business unless the user explicitly asks for a tech/startup/SaaS site.

Common defaults:

- trade businesses and craftsmen
- garden and landscaping businesses
- restaurants and cafes
- medical, therapy or consulting practices
- studios, salons, gyms and local services
- clubs, associations and small regional organizations

Do not default to dashboard sections, SaaS metrics, logo clouds, pricing tables or startup language unless the brief clearly points there.

## Block library, not templates

Never copy an existing page, screenshot or demo skeleton and only swap the content.

Every page must be newly composed from blocks:

1. Determine business type.
2. Determine design DNA in `src/design/identity.ts`.
3. Pick blocks from `src/landing/registry.ts`.
4. Compose a new section order.
5. Adapt spacing, surface rhythm, copy and CTA style to the business.
6. Run the design audit.

Forbidden as a default:

- always using Hero -> 3 Cards -> Services Bento -> Stats -> Testimonial -> Process -> CTA
- always using a topbar above the header
- always placing three equal cards directly after the hero
- copying the same section order as a previous generated page
- rewriting example text instead of creating business-specific content

A generated page must make at least three structural decisions that differ from the previous/default composition:

- different header strategy
- different hero strategy
- different middle-section order
- different service layout
- different proof/trust presentation
- different contact/CTA strategy

## Topbar rule

A topbar above the header is opt-in, not default.

Use `LocalInfoBar` only if at least two of these are true:

- opening hours are decision-relevant
- phone is the primary conversion path
- location or service area matters immediately
- the business has booking, reservation, appointment or emergency logic
- the business type is restaurant, hospitality, practice, urgent service or phone-first local service

Do not use a topbar just because a business is local.

If a topbar is not clearly useful, place contact information in one of these instead:

- header CTA
- sticky mobile CTA
- contact block
- footer

`config.design.showTopbar` must default to `false`.

## Mandatory: Design DNA before code

Before writing layout code, define the visual direction in `src/design/identity.ts` with these six decisions:

1. Archetype: `editorial`, `poster`, `split-product`, `local-service`, `portfolio`, `magazine`, `luxury-consulting`, or `event-campaign`.
2. Density: `airy`, `balanced`, or `compact`.
3. Typography role: `typographic-first`, `image-first`, `product-first`, or `proof-first`.
4. Container rhythm: for example `narrow -> wide -> full-bleed -> asymmetric -> narrow`.
5. Shape language: `sharp`, `subtle-rounded`, `soft`, `pill`, or `geometric`.
6. Image or motif strategy: real imagery, project images, abstract shapes, pattern system, icons, or pure typography.

All layout, color, type and section decisions must fit that identity.

## Composition rules

Use `src/landing/composition-rules.ts` before choosing blocks.

Good local-business structures include:

- Hero -> Services -> Contact
- Hero -> Location/Hours -> Offer -> Gallery -> Reservation
- Hero -> Problem cases -> Before/After -> Process -> Callback
- Hero -> Trust -> Services -> FAQ -> Appointment
- Hero -> Story -> References -> Contact

Not every local site needs all of these:

- topbar
- Bento
- Stats
- Testimonial
- Process
- CTA takeover

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

## Variation budget

Every generated homepage must contain at least 4 of these 8 traits:

- an asymmetric section
- a full-bleed color surface
- a narrow text section that is not the hero
- a deliberately wide or edge-to-edge section
- a non-card-based feature presentation
- a large typographic section without an image
- a recurring visual motif
- a section order that does not start with a centered hero

Record the selected traits in `src/design/identity.ts`.

## Header selection by business type

Choose the header by business type, not by generic aesthetics.

- Trade/garden/local service: simple local header, optional phone CTA, topbar only if phone/hours/area are critical.
- Restaurant/cafe: reservation, opening hours, address; topbar often useful.
- Practice/therapy: calm header, appointment CTA, phone secondary.
- Studio/salon/gym: booking CTA, prices/services, optional social link.
- Consulting/law/finance: sober header, contact/initial consultation, less CTA pressure.
- Club/association: events, membership, news.
- Hotel/pension: booking, availability, location, contact.

Avoid using the same Logo-left / Nav-center / CTA-right layout as the universal default.

## Mobile navigation

Mobile navigation must work independently from the desktop header.

Rules:

- render overlay/root-level UI with a portal or equivalent root-level strategy
- do not rely on a header stacking context
- use large touch targets (`min-h-12` or larger)
- include phone, primary CTA, service area/address and hours when relevant
- prefer fullscreen or bottom-sheet behavior for local businesses
- keep `client:media="(max-width: 767px)"` for React mobile navigation

## Component policy

The `src/components/landing/*` files are blocks, not page templates.

Blocks must be props-driven. Do not hardcode example business copy inside reusable blocks.

Allowed defaults are structural only, for example empty arrays or optional labels. Avoid complete sample sections that an agent can copy as a finished page.

## Tailwind class policy

Do not build dynamic Tailwind class names like `bg-${color}-500`.

Use complete class strings in maps:

```ts
const toneClasses = {
  primary: "bg-primary text-primary-foreground",
  soft: "bg-surface-tint text-foreground",
} as const;
```

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
- Keep submit timing consistent between docs and code.
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

If two or more checks fail, revise the design before finishing.

The audit checks for:

- old example skeleton reuse
- automatic topbar usage
- centered default hero signatures
- generic three-card proof strips
- repeated max-width containers
- excessive centered copy
- excessive card-like panels
- missing full-bleed or strong surfaces
- missing extended brand tokens
- repeated vertical rhythm

## Quality bar

A completed homepage should answer these questions clearly:

1. What is the business type?
2. What is the visual archetype?
3. Which blocks were selected from the registry?
4. Why is the topbar present or absent?
5. What makes this page structurally different from the last generated page?
6. Which tokens beyond `primary` carry the brand?
7. Did the design audit pass?
