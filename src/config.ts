export type NavLink = {
  label: string;
  href: string;
};

export type HeaderVariant =
  | "plain"
  | "floating"
  | "split"
  | "transparent"
  | "local"
  | "centered"
  | "boxed";
export type FooterVariant =
  | "minimal"
  | "takeover"
  | "sitemap"
  | "contact-heavy";
export type FontRecipe =
  | "cleanSaas"
  | "editorial"
  | "boldStartup"
  | "localCraft";

export const config = {
  name: "Hofmann Gartenbau",
  tagline: "Gartenpflege und Außenanlagen in Musterstadt",
  description:
    "Garten- und Landschaftsbau für Privatgärten, Einfahrten und gepflegte Außenbereiche in Musterstadt und Umgebung.",
  // Keep in sync with astro.config.mjs site.
  site: "https://example.com",
  design: {
    header: "local" as HeaderVariant,
    footer: "contact-heavy" as FooterVariant,
    fontRecipe: "localCraft" as FontRecipe,
    visualMotif: "leaf-lines",
    logoIcon: "lucide:leaf",
  },
  business: {
    phone: "01234 567890",
    email: "info@example.com",
    address: "Musterstraße 12, 12345 Musterstadt",
    serviceArea: "Musterstadt + 30 km",
    hours: "Mo-Fr 8:00-17:00 Uhr",
  },
  navigation: {
    header: [
      { label: "Leistungen", href: "/#leistungen" },
      { label: "Ablauf", href: "/#ablauf" },
      { label: "Referenzen", href: "/#referenzen" },
      { label: "Kontakt", href: "/kontakt" },
    ],
    footer: [
      { label: "Leistungen", href: "/#leistungen" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    cta: { label: "Termin anfragen", href: "/kontakt" },
  },
  smtp: {
    host: "",
    // STARTTLS: Port 25/587 (secure: false), SSL: Port 465 (secure: true).
    port: 587,
    secure: false,
    user: "",
    pass: "",
    from: "",
    to: "",
  },
  erecht24: {
    apiKey: "",
  },
} as const;
