# Agent Instructions

## Project Overview

This is an Astro 6 site with React, Tailwind CSS 4, and shadcn/ui (Base Luma style). It uses hybrid rendering: pages are pre-rendered by default, with SSR opt-in per page.

## Tech Stack

- **Framework**: Astro 6 with `@astrojs/node` adapter (standalone mode)
- **UI**: React 19, shadcn/ui v4 (Base Luma style, neutral base color)
- **Styling**: Tailwind CSS 4 via Vite plugin, `tw-animate-css`
- **Fonts**: Google Fonts via Astro Font API (configured in `astro.config.mjs`, applied via `<Font />` in RootLayout)
- **Icons**: astro-icon (Iconify-Sets, rendert zur Buildzeit als reines SVG). shadcn-Komponenten nutzen intern lucide-react.
- **Language**: TypeScript (strict), TSX for components

## Project Structure

```
src/
  config.ts             # Zentrale Site-Konfiguration (API-Keys, Tracking-IDs, etc.)
  components/
    RootLayout.astro    # Root HTML layout with TooltipProvider and <Font />
    ui/                 # shadcn/ui components
  lib/
    utils.ts            # cn() utility for class merging
    erecht24.ts         # eRecht24 API client (Impressum/Datenschutz)
  pages/
    *.astro             # Astro pages (pre-rendered by default)
    impressum.astro     # Impressum (eRecht24 API oder Fallback)
    datenschutz.astro   # Datenschutzerklärung (eRecht24 API oder Fallback)
  styles/
    global.css          # Tailwind imports, theme variables, dark mode
```

## Conventions

### Pages

- Astro pages live in `src/pages/` as `.astro` files
- Pages are **pre-rendered (static) by default**
- For SSR pages (forms, dynamic content), add `export const prerender = false` in the frontmatter
- Use `RootLayout` as the wrapping component for all pages
- Language is German (`lang="de"`)

### Components

- Interactive components are React TSX in `src/components/`
- Use shadcn/ui components from `src/components/ui/`
- Install new shadcn components with: `pnpm dlx shadcn@latest add <component>`
- Use the `cn()` utility from `@/lib/utils` for conditional classes

### Styling

- Use Tailwind utility classes, not custom CSS
- Theme colors are defined as CSS custom properties in `src/styles/global.css`
- Dark mode uses the `.dark` class strategy (`@custom-variant dark (&:is(.dark *))`)
- Use semantic color tokens: `bg-background`, `text-foreground`, `bg-primary`, etc.

### Site-Konfiguration

- Zentrale Einstellungen in `src/config.ts` (API-Keys, Tracking-IDs, Feature-Flags)
- eRecht24 API-Key dort setzen für Impressum/Datenschutz — ohne Key werden Platzhalter ausgeliefert
- Weitere Config-Werte (z.B. Analytics, SMTP) hier ergänzen

### Fonts

- Google Fonts über Astros eingebaute Font API (`astro.config.mjs` → `fonts`-Array)
- `<Font cssVariable="--font-inter" />` im `<head>` von RootLayout einbinden
- In `global.css` via `@theme inline` die Tailwind-Variable setzen: `--font-sans: var(--font-inter), sans-serif`
- Neue Fonts: im `fonts`-Array in `astro.config.mjs` ergänzen, `<Font />` im Layout hinzufügen

### Icons

- `astro-icon` für Astro-Seiten: `import { Icon } from "astro-icon/components"`
- Rendert zur Buildzeit als inline SVG — kein Client-JS, kein Laden
- Syntax: `<Icon name="lucide:search" />`, `<Icon name="mdi:home" />`
- Vorinstalliertes Icon-Set: `@iconify-json/lucide`
- Weitere Sets per `pnpm add @iconify-json/<set>` hinzufügen
- shadcn/ui-Komponenten nutzen intern `lucide-react` — das nicht entfernen

### Rechtliche Seiten

- `/impressum` und `/datenschutz` werden über eRecht24 API befüllt (wenn `config.erecht24.apiKey` gesetzt)
- Ohne API-Key: Platzhalter-Texte (Mustermann-Daten)
- Mit API-Key aber API-Fehler: Build bricht ab (kein stilles Fallback auf falsche Daten)

### Path Aliases

- `@/*` maps to `./src/*` (e.g., `import { Button } from "@/components/ui/button"`)

## Deployment

Docker-based with nginx reverse proxy. See `docker/README.md` for details. Auto-rebuilds on git push to the watched branch.
