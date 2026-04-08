# Agent Instructions

## Project Overview

This is an Astro 6 site with React, Tailwind CSS 4, and shadcn/ui (Base Luma style). It uses hybrid rendering: pages are pre-rendered by default, with SSR opt-in per page.

## Tech Stack

- **Framework**: Astro 6 with `@astrojs/node` adapter (standalone mode)
- **UI**: React 19, shadcn/ui v4 (Base Luma style, neutral base color)
- **Styling**: Tailwind CSS 4 via Vite plugin, `tw-animate-css`
- **Font**: Inter Variable
- **Icons**: Lucide React
- **Language**: TypeScript (strict), TSX for components

## Project Structure

```
src/
  components/
    RootLayout.astro    # Root HTML layout with TooltipProvider
    ui/                 # shadcn/ui components
  lib/
    utils.ts            # cn() utility for class merging
  pages/
    *.astro             # Astro pages (pre-rendered by default)
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

### Path Aliases

- `@/*` maps to `./src/*` (e.g., `import { Button } from "@/components/ui/button"`)

## Deployment

Docker-based with nginx reverse proxy. See `docker/README.md` for details. Auto-rebuilds on git push to the watched branch.
