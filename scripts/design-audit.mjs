import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scanDirs = ["src/pages", "src/components/sections"];
const exts = new Set([".astro", ".tsx", ".ts", ".jsx", ".js"]);

async function walk(dir) {
  const abs = path.join(root, dir);
  const entries = await readdir(abs, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(child)));
    if (entry.isFile() && exts.has(path.extname(entry.name))) files.push(child);
  }

  return files;
}

function count(source, pattern) {
  return (source.match(pattern) ?? []).length;
}

function result(level, label, detail) {
  return { level, label, detail };
}

const files = (await Promise.all(scanDirs.map(walk))).flat();
const sources = await Promise.all(
  files.map(async (file) => ({ file, source: await readFile(path.join(root, file), "utf8") })),
);

const all = sources.map((item) => item.source).join("\n");
const indexSource = sources.find((item) => item.file.endsWith("src/pages/index.astro"))?.source ?? "";
const firstHeroSlice = indexSource.slice(0, 1600);

const checks = [];

const centeredHero = /max-w-3xl[\s\S]{0,220}text-center|text-center[\s\S]{0,220}max-w-3xl/.test(firstHeroSlice);
checks.push(
  centeredHero
    ? result("fail", "Hero matches centered default pattern", "Avoid mx-auto max-w-3xl plus text-center in the opening hero.")
    : result("pass", "Opening hero avoids centered default signature", "No max-w-3xl text-center hero pattern found."),
);

const maxW7 = count(all, /(?:mx-auto\s+max-w-7xl|max-w-7xl\s+mx-auto)/g);
checks.push(
  maxW7 > 2
    ? result("warn", "Repeated max-w-7xl containers", `${maxW7} repeated max-w-7xl containers found.`)
    : result("pass", "Container widths are not overly repetitive", `${maxW7} repeated max-w-7xl containers found.`),
);

const textCenter = count(all, /text-center/g);
checks.push(
  textCenter > 7
    ? result("warn", "Too much centered text", `${textCenter} text-center utilities found.`)
    : result("pass", "Centered text usage is restrained", `${textCenter} text-center utilities found.`),
);

const cardLike = count(all, /bg-card[\s\S]{0,80}(?:border|shadow)|(?:border|shadow)[\s\S]{0,80}bg-card/g);
checks.push(
  cardLike > 6
    ? result("warn", "Too many card-like panels", `${cardLike} card-like surface patterns found.`)
    : result("pass", "Card-like panels are limited", `${cardLike} card-like surface patterns found.`),
);

const hasFullBleed = /full-bleed|w-screen|bg-surface-strong/.test(all);
checks.push(
  hasFullBleed
    ? result("pass", "Contains full-bleed or strong surface", "A layout-breaking surface exists.")
    : result("fail", "No full-bleed or strong surface", "Add a full-bleed color section or strong visual surface."),
);

const hasAccent = /accent-2|primary-soft|surface-tint|surface-strong/.test(all);
checks.push(
  hasAccent
    ? result("pass", "Uses extended brand tokens", "Found tokens beyond primary.")
    : result("fail", "No extended brand tokens found", "Use primary-soft, accent-2, surface-tint or surface-strong."),
);

const hasMotif = /VisualMotif|GradientField|DeviceFrame|SmartImage/.test(all);
checks.push(
  hasMotif
    ? result("pass", "Contains visual motif primitives", "Visual motif component is used.")
    : result("fail", "No visual motif found", "Add VisualMotif, GradientField, DeviceFrame or project imagery."),
);

const spacing = ["py-16", "py-20", "py-24", "py-28", "py-32"].map((token) => [token, count(all, new RegExp(token, "g"))]);
const repeatedSpacing = spacing.find(([, amount]) => amount > 8);
checks.push(
  repeatedSpacing
    ? result("warn", "Repeated vertical rhythm", `${repeatedSpacing[0]} appears ${repeatedSpacing[1]} times.`)
    : result("pass", "Vertical rhythm has variation", spacing.map(([token, amount]) => `${token}:${amount}`).join(", ")),
);

const failCount = checks.filter((check) => check.level === "fail").length;
const warnCount = checks.filter((check) => check.level === "warn").length;

console.log("Design Audit");
console.log("============");
for (const check of checks) {
  const label = check.level.toUpperCase().padEnd(4, " ");
  console.log(`${label} ${check.label}`);
  console.log(`     ${check.detail}`);
}

console.log("");
console.log(`Summary: ${failCount} fail, ${warnCount} warn, ${checks.length - failCount - warnCount} pass`);

if (failCount >= 2) {
  process.exitCode = 1;
}
