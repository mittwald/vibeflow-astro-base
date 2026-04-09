// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import { config } from "./src/config.ts";

// https://astro.build/config
export default defineConfig({
  site: config.site,
  output: "static",
  adapter: node({ mode: "standalone" }),

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
    plugins: [tailwindcss()],
  },

  integrations: [react(), icon(), sitemap(), favicons()],
});