// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import elementIds from "./plugins/vite-plugin-element-ids";
// Keep in sync with config.site in src/config.ts
const site = "https://example.com";

// https://astro.build/config
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
  ],

  vite: {
    plugins: [
      elementIds({ enabled: process.env.PUBLIC_VISUAL_EDITOR === "true" }),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ["lucide-react", "react", "react-dom", "react-dom/client"],
    },
    server: {
      allowedHosts: [".preview.sitedraft.de"],
    },
  },

  devToolbar: {
    enabled: false,
  },

  integrations: [react(), icon(), sitemap(), favicons()],
});
