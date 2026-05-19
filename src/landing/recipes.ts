import type { BusinessType } from "./registry";

export interface LandingRecipe {
  id: string;
  businessType: BusinessType;
  intent: string;
  blocks: string[];
  topbar: boolean;
}

export const landingRecipes = [
  {
    id: "trade-phone-first",
    businessType: "trade",
    intent: "Fast local quote request with clear services and phone path.",
    blocks: [
      "header-trade-service",
      "hero-local-problem-split",
      "services-offset-bento",
      "proof-local-strip",
      "process-simple-steps",
      "contact-phone-first",
    ],
    topbar: false,
  },
  {
    id: "restaurant-reservation",
    businessType: "restaurant",
    intent: "Reservation-first page with hours, location and menu highlights.",
    blocks: [
      "header-restaurant-reservation",
      "hero-poster-local",
      "services-price-board",
      "opening-hours-block",
      "proof-local-strip",
      "cta-full-bleed",
    ],
    topbar: true,
  },
  {
    id: "practice-calm-appointment",
    businessType: "practice",
    intent: "Calm trust-first appointment page.",
    blocks: [
      "header-practice-appointment",
      "hero-quiet-trust",
      "services-plain-list",
      "process-simple-steps",
      "contact-split-local",
    ],
    topbar: false,
  },
] satisfies readonly LandingRecipe[];
