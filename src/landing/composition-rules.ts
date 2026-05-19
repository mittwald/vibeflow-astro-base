import type { BusinessType } from "./registry";

export interface CompositionRule {
  businessType: BusinessType;
  recommendedSections: string[];
  avoidSections: string[];
  topbar: "avoid" | "optional" | "recommended";
  notes: string[];
}

export const compositionRules = [
  {
    businessType: "trade",
    recommendedSections: [
      "hero-local-problem-split",
      "services-offset-bento",
      "proof-local-strip",
      "process-simple-steps",
      "contact-phone-first",
    ],
    avoidSections: ["logo-cloud", "pricing-saas-table", "three-feature-cards", "hero-saas-dashboard"],
    topbar: "optional",
    notes: [
      "Phone and quote request matter, but the topbar is not automatic.",
      "Use concrete service language and visible proof of clean work.",
    ],
  },
  {
    businessType: "garden",
    recommendedSections: [
      "hero-local-problem-split",
      "proof-before-after",
      "services-alternating-rows",
      "area-map-text",
      "contact-split-local",
    ],
    avoidSections: ["dashboard-preview", "generic-stats", "three-feature-cards"],
    topbar: "optional",
    notes: ["Project images and seasonal work often matter more than abstract icons."],
  },
  {
    businessType: "restaurant",
    recommendedSections: [
      "hero-poster-local",
      "services-price-board",
      "opening-hours-block",
      "proof-local-strip",
      "cta-full-bleed",
    ],
    avoidSections: ["process-three-steps", "bento-saas-features", "generic-stats"],
    topbar: "recommended",
    notes: ["Opening hours, location and reservation often deserve above-the-fold visibility."],
  },
  {
    businessType: "practice",
    recommendedSections: [
      "hero-quiet-trust",
      "services-plain-list",
      "process-simple-steps",
      "opening-hours-block",
      "contact-split-local",
    ],
    avoidSections: ["loud-poster-hero", "aggressive-sales-cta", "too-many-stats"],
    topbar: "optional",
    notes: ["Use calm spacing, direct appointment language and trust-first copy."],
  },
  {
    businessType: "studio",
    recommendedSections: [
      "hero-editorial-service",
      "services-price-board",
      "proof-before-after",
      "story-split",
      "cta-boxed",
    ],
    avoidSections: ["corporate-proof-grid", "technical-dashboard", "three-feature-cards"],
    topbar: "avoid",
    notes: ["Booking or portfolio often matters more than a dense contact topbar."],
  },
  {
    businessType: "consulting",
    recommendedSections: [
      "hero-editorial-service",
      "story-split",
      "services-plain-list",
      "process-timeline",
      "cta-boxed",
    ],
    avoidSections: ["generic-local-topbar", "restaurant-hours-strip", "repair-proof-cards"],
    topbar: "avoid",
    notes: ["Use expertise and clarity instead of loud conversion chrome."],
  },
] satisfies readonly CompositionRule[];

export function ruleForBusinessType(businessType: BusinessType) {
  return compositionRules.find((rule) => rule.businessType === businessType);
}
