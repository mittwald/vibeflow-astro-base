export type NavLink = {
  label: string;
  href: string;
};

export type BusinessType =
  | "trade"
  | "garden"
  | "restaurant"
  | "practice"
  | "studio"
  | "consulting"
  | "hospitality"
  | "club"
  | "local-service"
  | "portfolio";

export type HeaderVariant =
  | "local-minimal"
  | "trade-service"
  | "restaurant-reservation"
  | "practice-appointment"
  | "studio-booking"
  | "heritage"
  | "compact-logo-cta"
  | "plain"
  | "floating"
  | "split"
  | "transparent"
  | "local"
  | "centered"
  | "boxed";

export type FooterVariant = "minimal" | "takeover" | "sitemap" | "contact-heavy";
export type FontRecipe = "cleanSaas" | "editorial" | "boldStartup" | "localCraft";

export const config = {
  name: "Vibeflow Site",
  tagline: "Individuell generierte Website",
  description: "Eine Landingpage, die aus frei kombinierbaren Blocks erzeugt wird.",
  // Keep in sync with astro.config.mjs site.
  site: "https://example.com",
  design: {
    businessType: "local-service" as BusinessType,
    header: "local-minimal" as HeaderVariant,
    footer: "contact-heavy" as FooterVariant,
    showTopbar: false,
    fontRecipe: "localCraft" as FontRecipe,
    visualMotif: "custom-block-composition",
    logoIcon: "lucide:sparkles",
  },
  business: {
    phone: "" as string,
    email: "" as string,
    address: "" as string,
    serviceArea: "" as string,
    hours: "" as string,
  },
  navigation: {
    header: [
      { label: "Leistungen", href: "/#leistungen" },
      { label: "Referenzen", href: "/#referenzen" },
      { label: "Kontakt", href: "/kontakt" },
    ] satisfies NavLink[],
    footer: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ] satisfies NavLink[],
    cta: { label: "Kontakt aufnehmen", href: "/kontakt" } satisfies NavLink,
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
