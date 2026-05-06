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

### Border-Radius

- Always give cards, buttons, inputs, sheets, panels, and similar surfaces an explicit Tailwind `rounded-*` class — even when the current design is sharp-cornered.
- Never hardcode `rounded-none` and never omit the class because the value happens to be 0 right now.
- The actual radius is controlled globally by the `--radius` CSS variable in `src/styles/global.css`. Keeping the classes in place lets the whole site flip between sharp and soft corners by changing one variable.
- Stick to the shadcn scale: small inline elements `rounded-sm` / `rounded-md`, cards and panels `rounded-lg` / `rounded-xl`, prominent hero or feature surfaces `rounded-2xl` / `rounded-3xl`.

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
- **Erlaubte Icon-Sets: nur `lucide` und `hugeicons`** — keine anderen Icon-Librarys verwenden.
- Icons ausschließlich über `@iconify-json` Pakete einbinden. Vorinstalliert: `@iconify-json/lucide` und `@iconify-json/hugeicons`.
- Syntax: `<Icon name="lucide:search" />`, `<Icon name="hugeicons:star" />`
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

### Bilder

- Für lokale Bilder (im `src/`-Verzeichnis): Immer `import { Image } from 'astro:assets'` verwenden, nicht rohes `<img>`. Astro optimiert die Bilder automatisch (WebP/AVIF, responsive srcset, lazy loading).
- Syntax: `<Image src={import("../assets/hero.jpg")} alt="Beschreibung" width={1200} height={630} />`
- Für Bilder in `public/`: Normales `<img>` ist okay, aber `loading="lazy"` und `decoding="async"` setzen (außer beim Hero-Bild above the fold).
- Für externe Bilder (URLs): `<img>` mit `loading="lazy"` und expliziten `width`/`height` Attributen um Layout Shifts zu vermeiden.
- Jedes `<img>` und `<Image>` braucht ein aussagekräftiges `alt`-Attribut. Dekorative Bilder: `alt=""`.

### Scroll-Animationen

- `ScrollReveal` (`src/components/ScrollReveal.astro`) ist optional — nicht jede Seite braucht Animationen.
- Nutze es sparsam: Hero-Bereich braucht keine Animation (ist sofort sichtbar), Sektionen unterhalb des Folds können dezent reinfahren.
- Maximal 2-3 verschiedene Animationstypen pro Seite, sonst wirkt es unruhig.
- Staffelung über `delay` nur bei Elementen die gleichzeitig sichtbar werden (z.B. Feature-Karten in einer Reihe), nicht bei Elementen die untereinander stehen.
- Respektiert `prefers-reduced-motion` automatisch.
- Verwendung:

```astro
<ScrollReveal animation="fade-up">
  <section class="py-20">
    <h2>Features</h2>
  </section>
</ScrollReveal>

<!-- Mit Staffelung -->
<div class="grid grid-cols-3 gap-8">
  <ScrollReveal animation="fade-up" delay={0}>
    <div>Feature 1</div>
  </ScrollReveal>
  <ScrollReveal animation="fade-up" delay={100}>
    <div>Feature 2</div>
  </ScrollReveal>
  <ScrollReveal animation="fade-up" delay={200}>
    <div>Feature 3</div>
  </ScrollReveal>
</div>
```

### OG-Image

- RootLayout unterstützt `ogImage` und `ogType` Props.
- OG/Twitter-Image-Tags werden nur gerendert wenn `ogImage` explizit gesetzt ist. Ohne `ogImage` wird kein Bild-Tag ausgegeben.
- Jedes Projekt sollte, wenn es sich anbietet, ein eigenes OG-Image erstellen (1200×630px) und als `ogImage`-Prop an RootLayout übergeben: `<RootLayout ogImage="/og.png">`
- Für Unterseiten mit eigenem OG-Image: den Pfad pro Seite setzen.

## Design-Prinzipien

### Visuelle Identität pro Projekt

Jedes Projekt bekommt eine eigene visuelle Persönlichkeit. Bevor du Code schreibst, entscheide dich für einen Gestaltungsansatz: Ist die Seite luftig und elegant? Kompakt und direkt? Verspielt? Editorial? Bold und plakatartig?

Leite daraus konkrete Entscheidungen ab: Wie groß ist die Typografie? Wie viel Whitespace? Wie dicht stehen Elemente beieinander? Welche Farben dominieren?

### Anti-Patterns — vermeide diese AI-typischen Muster

- **Nicht das Standard-Layout kopieren**: Nicht jede Seite braucht das Muster "zentrierter Hero → 3er-Karten-Grid → Testimonials → CTA". Das ist das Standardlayout das jeder AI-Builder ausspuckt. Brich bewusst davon ab.
- **Nicht jede Sektion braucht zentrierten Titel mit Untertitel darunter.** Titel können links stehen, können übergroß sein, können in die nächste Sektion reinragen, können fehlen.
- **Nicht jede Aufzählung muss ein gleichmäßiges Grid sein.** Nutze auch: gestaffelte Layouts, eine einzelne große Karte neben zwei kleinen, horizontale Scrollbereiche, oder einfach gut gesetzte Fließtext-Absätze.
- **Vermeide generische Stockfoto-Beschreibungen.** Wenn Bilder gebraucht werden, nutze Platzhalter-Services oder beschreibe dem Kunden was dort hin soll.
- **Vermeide den "AI-Look"**: Übermäßiger Einsatz von Schatten, abgerundete Karten mit Border und gleich große Icons in einem Grid.
- **Vermeide einheitliche Container-Breiten**: Nicht jede Sektion in `max-w-7xl mx-auto` packen. Manche Sektionen dürfen volle Breite nutzen, manche bewusst schmaler sein (`max-w-2xl`, `max-w-4xl`). Der Wechsel der Container-Breiten erzeugt visuellen Rhythmus.

### Gestaltungsregeln

- **Kontrast durch Abwechslung**: Wechsle zwischen Sektionen mit viel Whitespace und kompakteren Bereichen. Zwischen hellen und farbigen Hintergründen. Zwischen großer und normaler Typografie. Der Wechsel erzeugt Spannung.
- **Weniger ist oft besser**: Eine Landing Page mit 4 starken Sektionen schlägt eine mit 8 generischen. Nicht jede mögliche Information muss auf die Startseite.
- **Typografie als Gestaltungselement**: Übergroße Headlines (`text-5xl` bis `text-8xl`), bewusst gesetzte `leading-tight`/`tracking-tight` Kombinationen, oder ein einzelner Satz der eine ganze Viewport-Höhe einnimmt — Typografie kann das stärkste visuelle Element der Seite sein.
- **Farbflächen statt Karten**: Statt alles in `bg-card rounded-lg border shadow` Karten zu packen, nutze farbige Sektions-Hintergründe (`bg-primary`, `bg-muted`, eine Custom-Farbe aus dem Theme), volle Breite, mit Content darin. Das wirkt erwachsener als Karten-Layouts.
- **Bewusster Einsatz von `bg-primary`**: Die Primärfarbe nicht nur für Buttons nutzen, sondern auch für ganze Sektionen, große Flächen, oder typografische Akzente. Das verankert die Markenfarbe in der Seite.

### Responsive-Strategie

- Mobile ist nicht "Desktop kleiner machen". Überlege bei jeder Sektion: Was ändert sich auf Mobile tatsächlich? Große Headlines werden kleiner, aber nicht winzig. Mehrspaltige Layouts stacken, aber vielleicht nicht alle — manche Inhalte können auf Mobile einfach entfallen oder anders dargestellt werden.
- Nutze die volle Breite des Tailwind Breakpoint-Systems: `sm:`, `md:`, `lg:`, `xl:` — nicht nur `md:` für den einen Breakpoint.

### Komponenten-Einsatz

- shadcn/ui-Komponenten sind Werkzeuge, nicht Bausteine. Nutze sie für interaktive Elemente (Accordion für FAQs, Sheet für Mobile-Nav, Button für CTAs), aber bau Sektions-Layouts in reinem HTML + Tailwind. Eine Landing Page die hauptsächlich aus shadcn-Cards und -Badges besteht sieht aus wie ein Dashboard, nicht wie eine Marketing-Seite.
- Vermeide Dashboard-UI-Komponenten auf Landing Pages: Table, Command, Combobox, Calendar, Resizable, Menubar haben auf einer Landing Page nichts verloren.

## Deployment

Docker-based with nginx reverse proxy. See `docker/README.md` for details. Auto-rebuilds on git push to the watched branch.
