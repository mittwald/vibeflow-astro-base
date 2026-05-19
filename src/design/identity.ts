export type DesignArchetype =
  | "editorial"
  | "poster"
  | "split-product"
  | "local-service"
  | "portfolio"
  | "magazine"
  | "luxury-consulting"
  | "event-campaign";

export type DesignDensity = "airy" | "balanced" | "compact";
export type TypographyRole = "typographic-first" | "image-first" | "product-first" | "proof-first";
export type ShapeLanguage = "sharp" | "subtle-rounded" | "soft" | "pill" | "geometric";

export const designIdentity = {
  archetype: "local-service" satisfies DesignArchetype,
  mood: ["nahbar", "zuverlaessig", "handwerklich", "ruhig"],
  density: "balanced" satisfies DesignDensity,
  typography: "proof-first" satisfies TypographyRole,
  containerRhythm: ["local-header", "asymmetric-hero", "narrow-proof", "wide-service-mosaic", "full-bleed-cta"],
  shape: "soft" satisfies ShapeLanguage,
  visualMotif: "leaf-lines and warm outdoor surfaces",
  imageStrategy: "real local work imagery when available; otherwise tactile service cards and organic line motifs",
  avoid: [
    "tech SaaS hero",
    "centered max-w-3xl hero",
    "three equal feature cards as the main concept",
    "generic star reviews",
    "dashboard screenshots when the customer is a local service business",
    "same max-width in every section",
  ],
} as const;

export const variationBudget = {
  minimumRequired: 4,
  selected: [
    "asymmetric-section",
    "full-bleed-surface",
    "non-card-feature-layout",
    "large-typographic-section",
    "recurring-visual-motif",
    "local-business-header",
  ],
} as const;
