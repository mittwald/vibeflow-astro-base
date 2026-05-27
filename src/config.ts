/**
 * Zentrale Site-Konfiguration.
 *
 * Hier werden alle projektspezifischen Einstellungen gepflegt,
 * z.B. API-Keys, Tracking-IDs oder Feature-Flags:
 *
 * - erecht24.apiKey: API-Key für eRecht24 Impressum/Datenschutz
 * - navigation: Header- und Footer-Links
 * - analytics.googleId: Google Analytics Measurement ID (z.B. "G-XXXXXXXXXX")
 * - analytics.matomoUrl / analytics.matomoSiteId: Matomo-Tracking
 * - smtp: SMTP-Zugangsdaten für Kontaktformular (nodemailer)
 */

/**
 * Ein Navigationslink (Header oder Footer).
 *
 * - Einfacher Link: `{ label, href }`
 * - Dropdown (Hover-Menü mit Unterlinks): `{ label, items: [...] }`
 *   Der `label`-Eintrag öffnet dann das Menü; `href` ist optional
 *   (z.B. für eine Übersichtsseite).
 */
export interface NavLink {
  label: string;
  href?: string;
  items?: { label: string; href: string }[];
}

export const config = {
  name: "Seitenname",
  tagline: "Ihr Tagline",
  // Keep in sync with astro.config.mjs
  site: "https://example.com",
  navigation: {
    header: [
      { label: "Startseite", href: "/" },
      {
        label: "Produkte",
        items: [
          { label: "Analytics", href: "/analytics" },
          { label: "Automation", href: "/automation" },
          { label: "Integrationen", href: "/integrationen" },
        ],
      },
    ] as NavLink[],
    footer: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ] as NavLink[],
  },
  smtp: {
    host: "",
    // STARTTLS: Port 25/587 (secure: false), SSL: Port 465 (secure: true)
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
};
