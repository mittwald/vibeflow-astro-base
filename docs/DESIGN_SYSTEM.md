# Design system notes

## Default audience

The first example design is intentionally a local-service website, not a Tech SaaS website. Most generated customer sites are expected to be for normal businesses: trades, practices, restaurants, studios, shops, agencies, clubs and local services.

Use SaaS/product/dashboard language only when the brief calls for it.

## Design DNA

The main control file is `src/design/identity.ts`. It stores the choices that should guide the whole page:

- archetype,
- mood,
- density,
- typography role,
- container rhythm,
- shape language,
- visual motif,
- image strategy,
- avoid list.

This gives the AI builder persistent state. Later edits should preserve or intentionally change that state instead of drifting back to defaults.

## Section rhythm

The homepage should not be a stack of identical sections. Use sequences like:

```txt
local header -> asymmetric hero -> trust strip -> service mosaic -> narrow process -> full-bleed CTA
```

Examples are defined in `src/design/section-blueprints.ts`.

## Headers

Available header variants:

- `local`: top contact bar plus practical navigation; good for trades, services and practices.
- `centered`: brand-led navigation; good for restaurants, studios, boutiques and local brands.
- `boxed`: contained, card-like header; good for premium local services.
- `plain`: simple sticky header.
- `floating`: more startup-like; use sparingly for local businesses.
- `split`: SaaS/product-like.
- `transparent`: visual hero or photography-led sites.

## Tokens

Use these beyond the basic shadcn-style tokens:

- `bg-primary-soft`, `text-primary-soft-foreground`
- `bg-accent-2`, `text-accent-2-foreground`
- `bg-surface-tint`
- `bg-surface-strong`, `text-surface-strong-foreground`
- `border-grid-line`

## Fonts

The active font recipe is controlled by `config.design.fontRecipe`.

```ts
fontRecipe: "localCraft"
```

The selected value becomes a `data-font-recipe` attribute on `<html>`, and `global.css` maps it to `--font-display`.

## Audit

Run:

```bash
pnpm design:audit
```

The audit is intentionally heuristic. It should not replace human taste; it should catch the most common AI defaults before they ship.
