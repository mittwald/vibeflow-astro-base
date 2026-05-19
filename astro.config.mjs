// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import elementIds from "./plugins/vite-plugin-element-ids.js";

// Keep in sync with config.site in src/config.ts.
const site = "https://example.com";

export default defineConfig({
  site,
  output: "static",
  adapter: node({ mode: "standalone" }),
  security: {
    checkOrigin: true,
    allowedDomains: [{ hostname: new URL(site).hostname, protocol: "https" }],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["100 900"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-space-grotesk",
      weights: ["300 700"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      weights: ["300 900"],
      fallbacks: ["serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      weights: ["200 800"],
      fallbacks: ["sans-serif"],
    },
  ],
  vite: {
    plugins: [
      elementIds({ enabled: process.env.PUBLIC_VISUAL_EDITOR === "true" }),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "lucide-react",
        "radix-ui",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "cmdk",
        "embla-carousel-react",
        "react-day-picker",
        "react-resizable-panels",
        "vaul",
      ],
    },
    server: {
      allowedHosts: [".preview.sitedraft.de"],
      watch: {
        ignored: ["**/.pnpm-store/**", "**/.git/**"],
      },
      hmr: process.env.PREVIEW_DOMAIN
        ? {
            protocol: "wss",
            host: process.env.PREVIEW_DOMAIN,
            clientPort: 443,
          }
        : undefined,
    },
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), icon(), sitemap(), favicons()],
});
