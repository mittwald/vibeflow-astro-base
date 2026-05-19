export const fontRecipes = {
  cleanSaas: {
    sans: "Inter",
    heading: "Inter",
    className: "cleanSaas",
    mood: "neutral, modern, utilitarian",
  },
  editorial: {
    sans: "Inter",
    heading: "Fraunces",
    className: "editorial",
    mood: "editorial, warm, premium",
  },
  boldStartup: {
    sans: "Inter",
    heading: "Space Grotesk",
    className: "boldStartup",
    mood: "bold, technical, energetic",
  },
  localCraft: {
    sans: "Inter",
    heading: "Bricolage Grotesque",
    className: "localCraft",
    mood: "approachable, handmade, friendly",
  },
} as const;

export type FontRecipeName = keyof typeof fontRecipes;
