export const sectionBlueprints = {
  heroes: ["HeroLocalService", "HeroEditorial", "HeroPoster", "HeroSplitVisual"],
  proof: ["LocalTrustStrip", "ProofBand", "QuoteTakeover"],
  features: ["ServiceMosaic", "FeatureRail", "FeatureBento"],
  process: ["ProcessTimeline"],
  cta: ["CtaFooterTakeover"],
} as const;

export const recommendedHomeRhythms = [
  ["HeroLocalService", "LocalTrustStrip", "ServiceMosaic", "ProofBand", "ProcessTimeline", "CtaFooterTakeover"],
  ["HeroEditorial", "ServiceMosaic", "QuoteTakeover", "ProofBand", "CtaFooterTakeover"],
  ["HeroPoster", "ProofBand", "FeatureRail", "ProcessTimeline", "CtaFooterTakeover"],
] as const;
