# Agent Instructions

## Project Overview

This is an Astro 6 site with React, Tailwind CSS 4, and shadcn/ui (Base Luma style). It uses hybrid rendering: pages are pre-rendered by default, with SSR opt-in per page.

## Tech Stack

- **Framework**: Astro 6 with `@astrojs/node` adapter (standalone mode)
- **UI**: React 19, shadcn/ui v4 (Base Luma style, neutral base color)
- **Styling**: Tailwind CSS 4 via Vite plugin, `tw-animate-css`
- **Fonts**: Google Fonts via Astro Font API (configured in `astro.config.mjs`, applied via `<Font />` in RootLayout)
- **Icons**: astro-icon (Iconify-Sets, rendert zur Buildzeit als reines SVG). shadcn-Komponenten nutzen intern lucide-react.
- **SEO**: Meta-Tags (title, description, canonical) im RootLayout, `@astrojs/sitemap`, dynamische `robots.txt`
- **Favicons**: `astro-favicons` generiert aus `public/favicon.svg` alle Varianten (ICO, Apple Touch, Manifest)
- **Kontaktformular**: React-Komponente mit valibot-Validierung, Honeypot, Time-Based Spam-Schutz, nodemailer (SMTP)
- **Language**: TypeScript (strict), TSX for components

## Project Structure

```
src/
  config.ts             # Zentrale Site-Konfiguration (Name, URL, Navigation, API-Keys)
  components/
    RootLayout.astro    # Root HTML layout mit Header, Footer, Font, SEO-Meta
    Header.astro        # Responsive Header mit Desktop-Nav und mobilem Menü
    Footer.astro        # Footer mit Copyright und Links
    MobileNav.tsx       # Mobile Navigation (shadcn Sheet, von rechts)
    ContactForm.tsx     # Kontaktformular (React, valibot, Honeypot, Time-Based)
    ui/                 # shadcn/ui components
  lib/
    utils.ts            # cn() utility for class merging
    erecht24.ts         # eRecht24 API client (Impressum/Datenschutz)
  pages/
    *.astro             # Astro pages (pre-rendered by default)
    404.astro           # 404-Fehlerseite
    kontakt.astro       # Kontaktseite mit Formular
    impressum.astro     # Impressum (eRecht24 API oder Fallback)
    datenschutz.astro   # Datenschutzerklärung (eRecht24 API oder Fallback)
    robots.txt.ts       # Dynamische robots.txt mit Sitemap-Link
    api/contact.ts      # API-Endpoint für Kontaktformular (SSR)
  styles/
    global.css          # Tailwind imports, theme variables
public/
  favicon.svg           # Quell-Favicon (wird von astro-favicons zu allen Formaten generiert)
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
- Use semantic color tokens: `bg-background`, `text-foreground`, `bg-primary`, etc.

### Site-Konfiguration

- Zentrale Einstellungen in `src/config.ts` (Name, URL, Navigation, API-Keys)
- `config.name`: Seitenname, wird in Header, Footer, Mobile Nav und Seitentiteln verwendet
- `config.tagline`: Tagline, wird auf der Startseite angezeigt
- `config.site`: URL der Seite — **WICHTIG: muss auch in `astro.config.mjs` (Zeile 10) identisch gepflegt werden** (Astro kann `config.ts` nicht importieren wegen Vite-Init). `allowedDomains` in `astro.config.mjs` leitet sich automatisch aus der dortigen URL ab.
- `config.navigation.header` / `config.navigation.footer`: Nav-Links als `{ label, href }[]`
- `config.smtp`: SMTP-Zugangsdaten für Kontaktformular. Default-Host: `mail.agenturserver.de`. STARTTLS: Port 25/587 (`secure: false`), SSL: Port 465 (`secure: true`). Default ist STARTTLS auf Port 587.
- `config.erecht24.apiKey`: API-Key für eRecht24 Impressum/Datenschutz — ohne Key werden Platzhalter ausgeliefert

### SEO

- RootLayout akzeptiert `title` und `description` Props
- Canonical URL wird automatisch aus `config.site` + Pfad generiert
- Sitemap wird beim Build von `@astrojs/sitemap` erzeugt
- robots.txt wird dynamisch generiert mit Sitemap-Link
- Favicons werden von `astro-favicons` aus `public/favicon.svg` generiert

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
- `astro-icon` kann NICHT in React-Komponenten verwendet werden, nur in `.astro`-Dateien
- shadcn/ui-Komponenten nutzen intern `lucide-react` — das nicht entfernen

### Kontaktformular

- `/kontakt` mit React-Komponente `ContactForm.tsx` (`client:load`)
- API-Endpoint `src/pages/api/contact.ts` (SSR, `prerender = false`)
- Validierung serverseitig mit valibot (Vorname, Nachname, E-Mail, Nachricht Pflicht; Telefon optional)
- Spam-Schutz: Honeypot-Feld (`_gotcha`) + Time-Based Check (min. 5s zwischen Laden und Absenden)
- SMTP-Versand via nodemailer, Konfiguration in `config.smtp`
- Ohne SMTP-Config → Fehlermeldung "SMTP ist nicht konfiguriert"

### Rechtliche Seiten

- `/impressum` und `/datenschutz` werden über eRecht24 API befüllt (wenn `config.erecht24.apiKey` gesetzt)
- Ohne API-Key: Platzhalter-Texte (Mustermann-Daten)
- Mit API-Key aber API-Fehler: Build bricht ab (kein stilles Fallback auf falsche Daten)

### Linting & Formatting

- **ESLint**: `pnpm lint` (check), `pnpm lint:fix` (auto-fix)
- **Prettier**: `pnpm format` (write), `pnpm format:check` (check)
- Config: `eslint.config.mjs`, `.prettierrc.mjs`
- Prettier plugins: `prettier-plugin-astro`, `prettier-plugin-tailwindcss` (Tailwind class sorting)
- ESLint plugins: `typescript-eslint`, `eslint-plugin-astro`, `@eslint-react/eslint-plugin`
- `eslint-config-prettier` deaktiviert ESLint-Regeln die mit Prettier kollidieren
- shadcn/ui-Komponenten (`src/components/ui/`) haben gelockerte Lint-Regeln (generierter Code)

### Path Aliases

- `@/*` maps to `./src/*` (e.g., `import { Button } from "@/components/ui/button"`)

## Deployment

Docker-based with nginx reverse proxy. See `docker/README.md` for details. Auto-rebuilds on git push to the watched branch.
