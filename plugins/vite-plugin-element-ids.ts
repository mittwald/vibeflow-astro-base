import { relative } from "node:path";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { parse as babelParse } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";

const traverse = ((_traverse as unknown as { default?: typeof _traverse })
  .default ?? _traverse) as typeof _traverse;

export interface ElementIdsOptions {
  enabled?: boolean;
}

const VISIBLE_TAGS = new Set([
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "nav",
  "aside",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "table",
  "tr",
  "td",
  "th",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "label",
  "figure",
  "figcaption",
  "blockquote",
  "pre",
  "code",
  "video",
  "audio",
  "canvas",
  "details",
  "summary",
  "dialog",
]);

export default function elementIds(options: ElementIdsOptions = {}): Plugin {
  let root = "";

  return {
    name: "vite-plugin-element-ids",
    enforce: "pre" as const,

    configResolved(config: { root: string }) {
      root = config.root;
    },

    transform(code: string, id: string) {
      if (process.env.PUBLIC_VISUAL_EDITOR !== "true" && !options.enabled) {
        return null;
      }
      if (id.includes("?")) return null;
      if (id.includes("/node_modules/")) return null;

      const filePath = relative(root, id).replace(/\\/g, "/");

      if (id.endsWith(".astro")) {
        return transformAstro(code, id, filePath);
      }
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        return transformJsx(code, filePath);
      }
      return null;
    },
  };
}

/* ── .astro branch ─────────────────────────────────────────────────── */

function transformAstro(
  code: string,
  id: string,
  filePath: string,
): string | null {
  // Read the raw .astro source from disk for accurate line numbers.
  // Astro compiles .astro → JS in its transform hook before ours runs,
  // so `code` is compiled JS — but the HTML tags are preserved verbatim
  // inside $$render template literals. We match compiled tags to raw
  // source tags by per-tag-type sequential order.
  let raw: string;
  try {
    raw = readFileSync(id, "utf-8");
  } catch {
    return null;
  }

  const rawStarts = buildLineStarts(raw);
  const rawTags = collectRawTags(raw, rawStarts);
  if (rawTags.length === 0) return null;

  return injectIdsAstro(code, rawTags, filePath);
}

/* ── .tsx/.jsx branch ──────────────────────────────────────────────── */

interface JsxHit {
  insertAt: number;
  line: number;
  tagName: string;
}

function transformJsx(code: string, filePath: string): string | null {
  let ast;
  try {
    ast = babelParse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      errorRecovery: true,
    });
  } catch {
    return null;
  }

  const hits: JsxHit[] = [];

  traverse(ast, {
    JSXOpeningElement(path) {
      const nameNode = path.node.name;
      if (!t.isJSXIdentifier(nameNode)) return;
      const tagName = nameNode.name;
      const first = tagName.charCodeAt(0);
      if (first < 97 || first > 122) return; // not a-z
      if (!VISIBLE_TAGS.has(tagName)) return;

      const hasExisting = path.node.attributes.some(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          a.name.name === "data-element-id",
      );
      if (hasExisting) return;

      const line = path.node.loc?.start.line;
      const insertAt = nameNode.end;
      if (line == null || insertAt == null) return;

      hits.push({ insertAt, line, tagName });
    },
  });

  if (hits.length === 0) return null;

  // Disambiguate multiple tags of the same type on the same source line.
  const totals = new Map<string, number>();
  for (const h of hits) {
    const k = `${h.line}:${h.tagName}`;
    totals.set(k, (totals.get(k) ?? 0) + 1);
  }

  hits.sort((a, b) => a.insertAt - b.insertAt);

  const indices = new Map<string, number>();
  let out = "";
  let cursor = 0;
  for (const h of hits) {
    const k = `${h.line}:${h.tagName}`;
    const total = totals.get(k)!;
    const idx = indices.get(k) ?? 0;
    indices.set(k, idx + 1);

    let eid = `${filePath}:${h.line}:${h.tagName}`;
    if (total > 1) eid += `:${idx}`;

    out += code.slice(cursor, h.insertAt);
    out += ` data-element-id="${eid}"`;
    cursor = h.insertAt;
  }
  out += code.slice(cursor);
  return out;
}

/* ── .astro: raw source parsing ────────────────────────────────────── */

interface RawTag {
  tagName: string;
  openingLine: number;
}

/** Find char offset where the template begins (after frontmatter `---`). */
function findTemplateStart(src: string): number {
  if (!src.startsWith("---")) return 0;
  let i = 3;
  while (i < src.length && src[i] !== "\n") i++;
  i++;
  while (i < src.length) {
    if (src[i] === "-" && src.startsWith("---", i)) {
      i += 3;
      while (i < src.length && src[i] !== "\n") i++;
      return i < src.length ? i + 1 : i;
    }
    while (i < src.length && src[i] !== "\n") i++;
    i++;
  }
  return 0;
}

function buildLineStarts(src: string): number[] {
  const starts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function lineAt(starts: number[], offset: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/** Collect visible HTML tags from the raw .astro template with opening line numbers. */
function collectRawTags(src: string, starts: number[]): RawTag[] {
  const tags: RawTag[] = [];
  let i = findTemplateStart(src);

  while (i < src.length) {
    // Skip HTML comments
    if (src[i] === "<" && src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      i = end !== -1 ? end + 3 : src.length;
      continue;
    }

    if (src[i] === "<" && i + 1 < src.length) {
      const next = src[i + 1];
      if (next >= "a" && next <= "z") {
        const parsed = parseRawTag(src, i);
        if (parsed) {
          // Skip <script>/<style> body
          if (parsed.tagName === "script" || parsed.tagName === "style") {
            const closer = `</${parsed.tagName}>`;
            const closeAt = src.indexOf(closer, parsed.tagEnd);
            i = closeAt !== -1 ? closeAt + closer.length : parsed.tagEnd;
            continue;
          }

          if (VISIBLE_TAGS.has(parsed.tagName)) {
            tags.push({
              tagName: parsed.tagName,
              openingLine: lineAt(starts, i),
            });
          }

          i = parsed.tagEnd;
          continue;
        }
      }
    }

    i++;
  }

  return tags;
}

interface ParsedRawTag {
  tagName: string;
  tagEnd: number;
}

/** Parse an opening HTML tag starting at `<`. Handles quotes, braces, template literals. */
function parseRawTag(src: string, start: number): ParsedRawTag | null {
  let i = start + 1;
  const nameStart = i;
  while (i < src.length && /[a-zA-Z0-9-]/.test(src[i])) i++;
  const tagName = src.slice(nameStart, i);
  if (!tagName || tagName[0] < "a" || tagName[0] > "z") return null;

  let braceDepth = 0;
  let inDQ = false,
    inSQ = false,
    inBT = false;

  while (i < src.length) {
    const ch = src[i];
    if (inDQ) {
      if (ch === '"') inDQ = false;
      i++;
      continue;
    }
    if (inSQ) {
      if (ch === "'") inSQ = false;
      i++;
      continue;
    }
    if (inBT) {
      if (ch === "`") inBT = false;
      i++;
      continue;
    }
    if (braceDepth > 0) {
      if (ch === "{") braceDepth++;
      else if (ch === "}") braceDepth--;
      else if (ch === '"') inDQ = true;
      else if (ch === "'") inSQ = true;
      else if (ch === "`") inBT = true;
      i++;
      continue;
    }
    if (ch === '"') {
      inDQ = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSQ = true;
      i++;
      continue;
    }
    if (ch === "`") {
      inBT = true;
      i++;
      continue;
    }
    if (ch === "{") {
      braceDepth++;
      i++;
      continue;
    }
    if (ch === ">") return { tagName, tagEnd: i + 1 };
    i++;
  }

  return null;
}

/* ── .astro: compiled-output injection ─────────────────────────────── */

/**
 * Find visible HTML opening tags in the compiled Astro JS output and inject
 * data-element-id attributes. Tags are matched to raw source by per-tag-type
 * sequential order — this works because Astro preserves HTML tags verbatim
 * inside $$render template literals and maintains source order.
 */
function injectIdsAstro(
  compiled: string,
  rawTags: RawTag[],
  filePath: string,
): string | null {
  // Phase 1: find all visible HTML opening tags in the compiled output
  const tagRe = /<([a-z][a-z0-9]*)/g;

  interface CompiledTag {
    tagName: string;
    insertAt: number; // position right after `<tagname`
  }

  const compiledTags: CompiledTag[] = [];
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(compiled)) !== null) {
    const tagName = m[1];
    if (!VISIBLE_TAGS.has(tagName)) continue;

    // Skip if data-element-id is already present on this tag
    const closeAngle = compiled.indexOf(">", m.index);
    if (closeAngle !== -1) {
      const tagRegion = compiled.slice(m.index, closeAngle);
      if (tagRegion.includes("data-element-id=")) continue;
    }

    compiledTags.push({
      tagName,
      insertAt: m.index + 1 + tagName.length,
    });
  }

  if (compiledTags.length === 0) return null;

  // Phase 2: build per-tag-type queues from raw source (opening lines in order)
  const rawQueues = new Map<string, number[]>();
  for (const tag of rawTags) {
    if (!rawQueues.has(tag.tagName)) rawQueues.set(tag.tagName, []);
    rawQueues.get(tag.tagName)!.push(tag.openingLine);
  }
  const queueIndex = new Map<string, number>();

  // Phase 3: pair compiled tags with raw opening lines
  interface PairedTag {
    insertAt: number;
    openingLine: number;
    tagName: string;
  }

  const paired: PairedTag[] = [];

  for (const ct of compiledTags) {
    const queue = rawQueues.get(ct.tagName);
    if (!queue) continue;
    const idx = queueIndex.get(ct.tagName) ?? 0;
    if (idx >= queue.length) continue;

    paired.push({
      insertAt: ct.insertAt,
      openingLine: queue[idx],
      tagName: ct.tagName,
    });
    queueIndex.set(ct.tagName, idx + 1);
  }

  if (paired.length === 0) return null;

  // Phase 4: compute index suffixes for duplicate openingLine+tagName combos
  const totals = new Map<string, number>();
  for (const p of paired) {
    const k = `${p.openingLine}:${p.tagName}`;
    totals.set(k, (totals.get(k) || 0) + 1);
  }

  // Phase 5: build output with injected data-element-id attributes
  const indices = new Map<string, number>();
  let out = "";
  let cursor = 0;

  for (const p of paired) {
    const k = `${p.openingLine}:${p.tagName}`;
    const total = totals.get(k)!;
    const idx = indices.get(k) ?? 0;
    indices.set(k, idx + 1);

    let eid = `${filePath}:${p.openingLine}:${p.tagName}`;
    if (total > 1) eid += `:${idx}`;

    out += compiled.slice(cursor, p.insertAt);
    out += ` data-element-id="${eid}"`;
    cursor = p.insertAt;
  }

  out += compiled.slice(cursor);
  return out;
}
