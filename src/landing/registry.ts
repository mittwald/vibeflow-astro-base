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

export type BlockKind =
  | "chrome"
  | "header"
  | "hero"
  | "proof"
  | "services"
  | "process"
  | "testimonial"
  | "content"
  | "contact"
  | "cta"
  | "footer";

export interface LandingBlockMeta {
  id: string;
  kind: BlockKind;
  component: string;
  fits: BusinessType[];
  avoidFor?: BusinessType[];
  goodWhen: string[];
  avoidWhen?: string[];
  visualRole:
    | "quiet"
    | "strong"
    | "editorial"
    | "image-led"
    | "proof-led"
    | "conversion-led";
  density: "compact" | "balanced" | "spacious";
  topbarPolicy?: "never" | "optional" | "recommended";
  canRepeat?: boolean;
}

export const landingBlocks = [
  {
    id: "local-info-bar",
    kind: "chrome",
    component: "@/components/landing/chrome/LocalInfoBar.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "hospitality", "local-service"],
    goodWhen: [
      "Phone, opening hours or location are immediately conversion-relevant.",
      "The business is appointment, reservation or emergency driven.",
    ],
    avoidWhen: ["The information can live in the contact block or footer without hurting conversion."],
    visualRole: "conversion-led",
    density: "compact",
    topbarPolicy: "optional",
  },
  {
    id: "sticky-mobile-cta",
    kind: "chrome",
    component: "@/components/landing/chrome/StickyMobileCta.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "hospitality", "local-service"],
    goodWhen: ["Mobile conversion should stay one tap away."],
    visualRole: "conversion-led",
    density: "compact",
    topbarPolicy: "never",
  },

  {
    id: "header-local-minimal",
    kind: "header",
    component: "@/components/landing/headers/HeaderLocalMinimal.astro",
    fits: ["trade", "garden", "practice", "studio", "consulting", "local-service"],
    goodWhen: ["The business should feel clear and serious without too much chrome."],
    visualRole: "quiet",
    density: "balanced",
    topbarPolicy: "optional",
  },
  {
    id: "header-trade-service",
    kind: "header",
    component: "@/components/landing/headers/HeaderTradeService.astro",
    fits: ["trade", "garden", "local-service"],
    goodWhen: ["Service area, phone and quote request are important."],
    visualRole: "conversion-led",
    density: "compact",
    topbarPolicy: "optional",
  },
  {
    id: "header-restaurant-reservation",
    kind: "header",
    component: "@/components/landing/headers/HeaderRestaurant.astro",
    fits: ["restaurant", "hospitality"],
    goodWhen: ["Reservation, menu, opening hours or address are key."],
    visualRole: "conversion-led",
    density: "compact",
    topbarPolicy: "recommended",
  },
  {
    id: "header-practice-appointment",
    kind: "header",
    component: "@/components/landing/headers/HeaderPractice.astro",
    fits: ["practice", "consulting"],
    goodWhen: ["The page should feel calm and appointment-led."],
    visualRole: "quiet",
    density: "balanced",
    topbarPolicy: "optional",
  },
  {
    id: "header-studio-booking",
    kind: "header",
    component: "@/components/landing/headers/HeaderStudio.astro",
    fits: ["studio", "portfolio"],
    goodWhen: ["The brand should feel personal and booking-led."],
    visualRole: "editorial",
    density: "balanced",
    topbarPolicy: "never",
  },

  {
    id: "hero-local-problem-split",
    kind: "hero",
    component: "@/components/landing/heroes/HeroLocalProblemSplit.astro",
    fits: ["trade", "garden", "local-service"],
    goodWhen: ["Visitors have a concrete problem and need clear help."],
    visualRole: "image-led",
    density: "spacious",
  },
  {
    id: "hero-editorial-service",
    kind: "hero",
    component: "@/components/landing/heroes/HeroEditorialService.astro",
    fits: ["practice", "consulting", "studio", "portfolio"],
    goodWhen: ["The brand needs warmth, trust and a more refined opening."],
    visualRole: "editorial",
    density: "spacious",
  },
  {
    id: "hero-poster-local",
    kind: "hero",
    component: "@/components/landing/heroes/HeroPosterLocal.astro",
    fits: ["restaurant", "studio", "club", "hospitality"],
    goodWhen: ["A strong motif, photo, campaign or seasonal offer leads the page."],
    visualRole: "strong",
    density: "spacious",
  },
  {
    id: "hero-quiet-trust",
    kind: "hero",
    component: "@/components/landing/heroes/HeroQuietTrust.astro",
    fits: ["practice", "consulting", "local-service"],
    goodWhen: ["Trust and clarity are more important than visual volume."],
    visualRole: "quiet",
    density: "balanced",
  },
  {
    id: "hero-map-area",
    kind: "hero",
    component: "@/components/landing/heroes/HeroMapArea.astro",
    fits: ["trade", "garden", "restaurant", "hospitality", "local-service"],
    goodWhen: ["Location, service area or catchment area should be clear above the fold."],
    visualRole: "proof-led",
    density: "balanced",
  },

  {
    id: "proof-local-strip",
    kind: "proof",
    component: "@/components/landing/proof/ProofLocalStrip.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "local-service"],
    goodWhen: ["Local reliability should be shown quickly without a full stats dashboard."],
    visualRole: "proof-led",
    density: "compact",
  },
  {
    id: "proof-numbers-band",
    kind: "proof",
    component: "@/components/landing/proof/ProofNumbersBand.astro",
    fits: ["trade", "garden", "practice", "studio", "consulting", "local-service"],
    goodWhen: ["Real numbers are available and credible."],
    visualRole: "proof-led",
    density: "balanced",
  },
  {
    id: "proof-before-after",
    kind: "proof",
    component: "@/components/landing/proof/ProofBeforeAfter.astro",
    fits: ["trade", "garden", "studio", "local-service"],
    goodWhen: ["Visible transformation is central to trust."],
    visualRole: "image-led",
    density: "spacious",
  },

  {
    id: "services-offset-bento",
    kind: "services",
    component: "@/components/landing/services/ServicesOffsetBento.astro",
    fits: ["trade", "garden", "studio", "local-service"],
    goodWhen: ["Services have different priorities and should not be equally weighted."],
    visualRole: "strong",
    density: "balanced",
  },
  {
    id: "services-plain-list",
    kind: "services",
    component: "@/components/landing/services/ServicesPlainList.astro",
    fits: ["trade", "garden", "practice", "consulting", "local-service"],
    goodWhen: ["Clarity and scanability are more important than decoration."],
    visualRole: "quiet",
    density: "compact",
  },
  {
    id: "services-alternating-rows",
    kind: "services",
    component: "@/components/landing/services/ServicesAlternatingRows.astro",
    fits: ["trade", "garden", "practice", "studio", "local-service"],
    goodWhen: ["Each service needs a bit more explanation and proof."],
    visualRole: "editorial",
    density: "spacious",
  },
  {
    id: "services-price-board",
    kind: "services",
    component: "@/components/landing/services/ServicesPriceBoard.astro",
    fits: ["restaurant", "practice", "studio", "local-service"],
    goodWhen: ["Packages, menus, treatments or fixed offers matter."],
    visualRole: "proof-led",
    density: "balanced",
  },

  {
    id: "process-simple-steps",
    kind: "process",
    component: "@/components/landing/process/ProcessSimpleSteps.astro",
    fits: ["trade", "garden", "practice", "studio", "local-service"],
    goodWhen: ["Visitors need reassurance about what happens next."],
    visualRole: "quiet",
    density: "balanced",
  },
  {
    id: "process-timeline",
    kind: "process",
    component: "@/components/landing/process/ProcessTimeline.astro",
    fits: ["trade", "garden", "consulting", "local-service"],
    goodWhen: ["The work has clear phases and dependencies."],
    visualRole: "editorial",
    density: "spacious",
  },

  {
    id: "story-split",
    kind: "content",
    component: "@/components/landing/content/StorySplit.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "consulting", "local-service"],
    goodWhen: ["The business owner, philosophy or local history should carry trust."],
    visualRole: "editorial",
    density: "balanced",
  },
  {
    id: "opening-hours-block",
    kind: "content",
    component: "@/components/landing/content/OpeningHoursBlock.astro",
    fits: ["restaurant", "practice", "studio", "hospitality", "local-service"],
    goodWhen: ["Opening hours are searched for often."],
    visualRole: "quiet",
    density: "compact",
  },
  {
    id: "area-map-text",
    kind: "content",
    component: "@/components/landing/content/AreaMapText.astro",
    fits: ["trade", "garden", "restaurant", "hospitality", "local-service"],
    goodWhen: ["Location or service area should be reinforced."],
    visualRole: "proof-led",
    density: "balanced",
  },

  {
    id: "contact-split-local",
    kind: "contact",
    component: "@/components/landing/contact/ContactSplitLocal.astro",
    fits: ["trade", "garden", "practice", "studio", "local-service"],
    goodWhen: ["Contact paths, address, phone and form need equal clarity."],
    visualRole: "conversion-led",
    density: "balanced",
  },
  {
    id: "contact-phone-first",
    kind: "contact",
    component: "@/components/landing/contact/ContactPhoneFirst.astro",
    fits: ["trade", "garden", "restaurant", "practice", "local-service"],
    goodWhen: ["Calling is easier than filling out a form."],
    visualRole: "conversion-led",
    density: "compact",
  },

  {
    id: "cta-boxed",
    kind: "cta",
    component: "@/components/landing/cta/CtaBoxed.astro",
    fits: ["trade", "garden", "practice", "studio", "consulting", "local-service"],
    goodWhen: ["The page needs a calm final action."],
    visualRole: "conversion-led",
    density: "balanced",
  },
  {
    id: "cta-full-bleed",
    kind: "cta",
    component: "@/components/landing/cta/CtaFullBleed.astro",
    fits: ["trade", "garden", "restaurant", "studio", "hospitality", "local-service"],
    goodWhen: ["The final action should feel like a visual endpoint."],
    visualRole: "strong",
    density: "spacious",
  },
  {
    id: "proof-quote-card",
    kind: "testimonial",
    component: "@/components/landing/proof/ProofQuoteCard.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "consulting", "local-service"],
    goodWhen: ["A specific, credible quote is stronger than generic rating cards."],
    visualRole: "proof-led",
    density: "balanced",
  },
  {
    id: "services-checklist",
    kind: "services",
    component: "@/components/landing/services/ServicesChecklist.astro",
    fits: ["trade", "garden", "practice", "local-service"],
    goodWhen: ["Visitors need a quick scan of included tasks or cases."],
    visualRole: "quiet",
    density: "compact",
  },
  {
    id: "process-checklist",
    kind: "process",
    component: "@/components/landing/process/ProcessChecklist.astro",
    fits: ["trade", "garden", "practice", "studio", "local-service"],
    goodWhen: ["The process should feel low-risk and simple."],
    visualRole: "quiet",
    density: "compact",
  },
  {
    id: "faq-accordion",
    kind: "content",
    component: "@/components/landing/content/FAQAccordion.astro",
    fits: ["trade", "garden", "restaurant", "practice", "studio", "consulting", "hospitality", "local-service"],
    goodWhen: ["Common objections or practical questions need short answers."],
    visualRole: "quiet",
    density: "compact",
  },
  {
    id: "contact-map-card",
    kind: "contact",
    component: "@/components/landing/contact/ContactMapCard.astro",
    fits: ["restaurant", "practice", "studio", "hospitality", "local-service"],
    goodWhen: ["Address and arrival are central to conversion."],
    visualRole: "proof-led",
    density: "balanced",
  },
  {
    id: "cta-phone-first",
    kind: "cta",
    component: "@/components/landing/cta/CtaPhoneFirst.astro",
    fits: ["trade", "garden", "practice", "local-service"],
    goodWhen: ["The simplest next action is to call."],
    visualRole: "conversion-led",
    density: "compact",
  },

] satisfies readonly LandingBlockMeta[];

export function blocksForBusinessType(businessType: BusinessType) {
  return (landingBlocks as readonly LandingBlockMeta[]).filter(
    (block) => block.fits.includes(businessType) && !block.avoidFor?.includes(businessType),
  );
}

export function blocksByKind(kind: BlockKind) {
  return landingBlocks.filter((block) => block.kind === kind);
}
