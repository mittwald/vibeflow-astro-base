export const marketingUiAllowlist = [
  "button",
  "sheet",
  "accordion",
  "dialog",
  "input",
  "textarea",
  "label",
] as const;

export const marketingUiUseSparingly = ["card", "badge", "tabs", "carousel", "tooltip"] as const;

export const marketingUiAvoidByDefault = [
  "table",
  "command",
  "calendar",
  "resizable",
  "menubar",
  "context-menu",
  "combobox",
] as const;
