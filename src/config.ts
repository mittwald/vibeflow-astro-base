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
export const config = {
  name: "vibeflow",
  tagline: "dein AI-Website-Builder",
  site: "https://example.com",
  navigation: {
    header: [
      { label: "Startseite", href: "/" },
    ],
    footer: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
  },
  smtp: {
    host: "",
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
