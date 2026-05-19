import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("sitemap-index.xml", site ?? "https://example.com");
  return new Response(`User-agent: *
Allow: /
Sitemap: ${sitemap}
`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
