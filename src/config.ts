/**
 * Zentrale Site-Konfiguration.
 *
 * Hier werden alle projektspezifischen Einstellungen gepflegt,
 * z.B. API-Keys, Tracking-IDs oder Feature-Flags:
 *
 * - erecht24.apiKey: API-Key für eRecht24 Impressum/Datenschutz
 * - analytics.googleId: Google Analytics Measurement ID (z.B. "G-XXXXXXXXXX")
 * - analytics.matomoUrl / analytics.matomoSiteId: Matomo-Tracking
 * - smtp: SMTP-Zugangsdaten für Kontaktformular (nodemailer)
 */
export const config = {
  erecht24: {
    apiKey: "",
  },
};
