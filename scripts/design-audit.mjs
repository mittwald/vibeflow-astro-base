import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const includeDirs = ["src", "scripts"];
const sourceExtensions = new Set([".astro", ".tsx", ".jsx", ".ts", ".js", ".mjs"]);
const ignoreParts = new Set(["node_modules", "dist", ".astro", ".git"]);

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (ignoreParts.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walk(filePath));
      continue;
    }
    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(filePath);
    }
  }

  return files;
}

const files = includeDirs.flatMap((dir) => walk(path.join(root, dir)));
const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const indexPath = path.join(root, "src/pages/index.astro");
const indexSource = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
const isCompositionCanvas = indexSource.includes('data-vibeflow-page="composition-canvas"');
const hasLandingSections = /data-section="(hero|services|proof|process|content|contact|cta|testimonial)"/.test(indexSource);

const results = [];

function check({ name, pass, warn, fail, ok, skip }) {
  if (skip) {
    results.push({ level: "SKIP", name, message: skip });
    return;
  }

  if (pass === true) {
    results.push({ level: "PASS", name, message: ok });
    return;
  }

  if (warn) {
    results.push({ level: "WARN", name, message: warn });
    return;
  }

  results.push({ level: "FAIL", name, message: fail });
}

function count(pattern, haystack = indexSource) {
  return [...haystack.matchAll(pattern)].length;
}

function hasSectionOrder(names) {
  const positions = names.map((name) => indexSource.indexOf(`data-block-family="${name}"`));
  if (positions.some((position) => position === -1)) {
    return false;
  }
  return positions.every((position, index) => index === 0 || position > positions[index - 1]);
}

function distinctBlockFamilies() {
  const matches = indexSource.matchAll(/data-block-family="([^"]+)"/g);
  return new Set([...matches].map((match) => match[1]));
}

const maxW7xlCount = count(/(?:mx-auto\s+max-w-7xl|max-w-7xl\s+mx-auto)/g);
const textCenterCount = count(/\btext-center\b/g);
const cardLikeCount = count(/(?:bg-card|rounded-(?:2xl|3xl|4xl)|shadow(?:-|\b))/g);
const pyRhythm = ["py-16", "py-20", "py-24", "py-28", "py-32"].map((token) => [token, count(new RegExp(`\\b${token}\\b`, "g"))]);
const dominantSpacing = Math.max(...pyRhythm.map(([, value]) => value), 0);
const blockFamilies = distinctBlockFamilies();

check({
  name: "Composition canvas replaces fixed example homepage",
  pass: isCompositionCanvas || hasLandingSections,
  fail: "src/pages/index.astro is neither a neutral composition canvas nor a generated landing page.",
  ok: isCompositionCanvas
    ? "Neutral composition canvas found. No fixed example homepage to copy."
    : "Generated landing sections found.",
});

check({
  name: "Does not reuse old example skeleton",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no generated section order yet." : undefined,
  pass: !hasSectionOrder([
    "hero-local-problem-split",
    "proof-local-strip",
    "services-offset-bento",
    "proof-numbers-band",
    "proof-quote-card",
    "process-simple-steps",
    "cta-boxed",
  ]),
  warn: "Page follows the old example skeleton. Recompose using different blocks or a different order.",
  ok: "Page structure does not match the old example skeleton.",
});

check({
  name: "Topbar is opt-in",
  pass:
    !/<LocalInfoBar\b|import\s+LocalInfoBar/.test(indexSource) &&
    !/showTopbar=\{true\}|showTopbar={true}|showTopbar:\s*true/.test(indexSource) &&
    !/showTopbar:\s*true/.test(fs.existsSync(path.join(root, "src/config.ts")) ? fs.readFileSync(path.join(root, "src/config.ts"), "utf8") : ""),
  warn: "Topbar detected in generated page/config. Confirm it is selected intentionally, not inherited from a default header.",
  ok: "No automatic topbar usage detected.",
});

check({
  name: "Avoids default centered hero signature",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no hero yet." : undefined,
  pass: !/max-w-3xl[\s\S]{0,180}text-center|text-center[\s\S]{0,180}max-w-3xl/.test(indexSource),
  fail: "Opening hero matches centered default signature.",
  ok: "No max-w-3xl text-center hero pattern found.",
});

check({
  name: "Avoids generic three-card proof strip",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no proof cards yet." : undefined,
  pass: !/grid-cols-3[\s\S]{0,1400}(Breites Leistungsspektrum|Bewertungen aus der Region|Klare Absprachen|Zuverlaessig|Schnell|Einfach)/i.test(indexSource),
  warn: "Generic three-card proof strip detected. Use a more specific proof layout or remove it.",
  ok: "No generic three-card proof strip detected.",
});

check({
  name: "Uses multiple block families when generated",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas intentionally has no block families yet." : undefined,
  pass: blockFamilies.size >= 5,
  warn: `Only ${blockFamilies.size} block families detected. Use a broader block mix instead of one example.`,
  ok: `${blockFamilies.size} block families detected.`,
});

check({
  name: "Container widths are not overly repetitive",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no containers yet." : undefined,
  pass: maxW7xlCount <= 2,
  warn: `${maxW7xlCount} repeated max-w-7xl containers found. Vary narrow, wide and full-bleed sections.`,
  ok: `${maxW7xlCount} repeated max-w-7xl containers found.`,
});

check({
  name: "Centered text usage is restrained",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no text layout yet." : undefined,
  pass: textCenterCount <= 2,
  warn: `${textCenterCount} text-center utilities found. Avoid centering every section heading.`,
  ok: `${textCenterCount} text-center utilities found.`,
});

check({
  name: "Card-like panels are limited",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no card panels yet." : undefined,
  pass: cardLikeCount <= 12,
  warn: `${cardLikeCount} card-like surface patterns found. Do not solve every section with cards.`,
  ok: `${cardLikeCount} card-like surface patterns found.`,
});

check({
  name: "Contains full-bleed or strong surface when generated",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no visual surfaces yet." : undefined,
  pass: /full-bleed|bg-surface-strong|bg-primary\b|bg-surface-tint/.test(indexSource),
  fail: "No full-bleed or strong surface found.",
  ok: "A layout-breaking surface exists.",
});

check({
  name: "Uses extended brand tokens",
  pass: /primary-soft|accent-2|surface-tint|surface-strong|grid-line|spotlight/.test(source),
  fail: "No extended brand tokens found.",
  ok: "Found tokens beyond primary.",
});

check({
  name: "Sticky navigation has anchor offset support",
  pass: /scroll-mt-(24|28|32|36)|scroll-margin-top/.test(source),
  warn: "Sticky header exists, but section anchors may scroll underneath it.",
  ok: "Anchor offset support found.",
});

check({
  name: "Vertical rhythm has variation",
  skip: isCompositionCanvas && !hasLandingSections ? "Base canvas has no section rhythm yet." : undefined,
  pass: dominantSpacing <= 4,
  warn: `Vertical spacing is repetitive: ${pyRhythm.map(([token, value]) => `${token}:${value}`).join(", ")}`,
  ok: pyRhythm.map(([token, value]) => `${token}:${value}`).join(", "),
});

const failCount = results.filter((result) => result.level === "FAIL").length;
const warnCount = results.filter((result) => result.level === "WARN").length;
const passCount = results.filter((result) => result.level === "PASS").length;
const skipCount = results.filter((result) => result.level === "SKIP").length;

console.log("Design Audit");
console.log("============");
for (const result of results) {
  console.log(`${result.level} ${result.name}`);
  console.log(`     ${result.message}`);
}
console.log("");
console.log(`Summary: ${failCount} fail, ${warnCount} warn, ${passCount} pass, ${skipCount} skip`);

if (failCount >= 2) {
  process.exitCode = 1;
}
