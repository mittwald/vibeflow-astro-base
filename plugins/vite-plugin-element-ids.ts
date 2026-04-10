import { relative } from 'node:path';
import { readFileSync } from 'node:fs';

export interface ElementIdsOptions {
  enabled?: boolean;
}

const VISIBLE_TAGS = new Set([
  'div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'img',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'form', 'input', 'button', 'textarea', 'select', 'label',
  'figure', 'figcaption', 'blockquote', 'pre', 'code',
  'video', 'audio', 'canvas', 'details', 'summary', 'dialog',
]);

export default function elementIds(options: ElementIdsOptions = {}): any {
  let root = '';

  return {
    name: 'vite-plugin-element-ids',
    enforce: 'pre' as const,

    configResolved(config: { root: string }) {
      root = config.root;
    },

    transform(code: string, id: string) {
      if (process.env.PUBLIC_VISUAL_EDITOR !== 'true' && !options.enabled) {
        return null;
      }
      if (!id.endsWith('.astro')) return null;
      if (!code.includes('data-astro-source-loc')) return null;

      const filePath = relative(root, id).replace(/\\/g, '/');

      // Read the raw .astro source from disk for accurate opening line numbers.
      // Astro compiles .astro → JS in its load hook before our transform runs,
      // so the `code` we receive is compiled JS. But Astro annotates each tag
      // with data-astro-source-loc="closingLine:closingCol". We match these
      // against tags parsed from the raw source to recover the opening line.
      let raw: string;
      try {
        raw = readFileSync(id, 'utf-8');
      } catch {
        return null;
      }

      const rawStarts = buildLineStarts(raw);
      const rawTags = collectRawTags(raw, rawStarts);
      if (rawTags.length === 0) return null;

      const lookup = buildOpeningLineLookup(rawTags);
      return injectIds(code, lookup, filePath);
    },
  };
}

/* ── Types ──────────────────────────────────────────────────────────── */

interface RawTag {
  tagName: string;
  openingLine: number;
  closingLine: number;
}

/* ── Raw source parsing ────────────────────────────────────────────── */

/** Find char offset where the template begins (after frontmatter `---`). */
function findTemplateStart(src: string): number {
  if (!src.startsWith('---')) return 0;
  let i = 3;
  while (i < src.length && src[i] !== '\n') i++;
  i++;
  while (i < src.length) {
    if (src[i] === '-' && src.startsWith('---', i)) {
      i += 3;
      while (i < src.length && src[i] !== '\n') i++;
      return i < src.length ? i + 1 : i;
    }
    while (i < src.length && src[i] !== '\n') i++;
    i++;
  }
  return 0;
}

function buildLineStarts(src: string): number[] {
  const starts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\n') starts.push(i + 1);
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

/** Collect visible HTML tags from the raw .astro template with opening and closing lines. */
function collectRawTags(src: string, starts: number[]): RawTag[] {
  const tags: RawTag[] = [];
  let i = findTemplateStart(src);

  while (i < src.length) {
    // Skip HTML comments
    if (src[i] === '<' && src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      i = end !== -1 ? end + 3 : src.length;
      continue;
    }

    if (src[i] === '<' && i + 1 < src.length) {
      const next = src[i + 1];
      if (next >= 'a' && next <= 'z') {
        const parsed = parseRawTag(src, i);
        if (parsed) {
          // Skip <script>/<style> body
          if (parsed.tagName === 'script' || parsed.tagName === 'style') {
            const closer = `</${parsed.tagName}>`;
            const closeAt = src.indexOf(closer, parsed.tagEnd);
            i = closeAt !== -1 ? closeAt + closer.length : parsed.tagEnd;
            continue;
          }

          if (VISIBLE_TAGS.has(parsed.tagName)) {
            tags.push({
              tagName: parsed.tagName,
              openingLine: lineAt(starts, i),
              closingLine: lineAt(starts, parsed.tagEnd - 1), // line of `>`
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
  while (i < src.length && /[a-zA-Z0-9\-]/.test(src[i])) i++;
  const tagName = src.slice(nameStart, i);
  if (!tagName || tagName[0] < 'a' || tagName[0] > 'z') return null;

  let braceDepth = 0;
  let inDQ = false, inSQ = false, inBT = false;

  while (i < src.length) {
    const ch = src[i];
    if (inDQ) { if (ch === '"') inDQ = false; i++; continue; }
    if (inSQ) { if (ch === "'") inSQ = false; i++; continue; }
    if (inBT) { if (ch === '`') inBT = false; i++; continue; }
    if (braceDepth > 0) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
      else if (ch === '"') inDQ = true;
      else if (ch === "'") inSQ = true;
      else if (ch === '`') inBT = true;
      i++; continue;
    }
    if (ch === '"') { inDQ = true; i++; continue; }
    if (ch === "'") { inSQ = true; i++; continue; }
    if (ch === '`') { inBT = true; i++; continue; }
    if (ch === '{') { braceDepth++; i++; continue; }
    if (ch === '>') return { tagName, tagEnd: i + 1 };
    i++;
  }

  return null;
}

/* ── Opening-line lookup ───────────────────────────────────────────── */

/**
 * Build a map from `"closingLine:tagName:occurrence"` → `openingLine`.
 * This lets us match tags found via `data-astro-source-loc` (which records the
 * closing `>` line) back to their opening `<` line in the raw source.
 */
function buildOpeningLineLookup(tags: RawTag[]): Map<string, number> {
  const counts = new Map<string, number>();
  const lookup = new Map<string, number>();

  for (const t of tags) {
    const gk = `${t.closingLine}:${t.tagName}`;
    const occ = counts.get(gk) ?? 0;
    counts.set(gk, occ + 1);
    lookup.set(`${gk}:${occ}`, t.openingLine);
  }

  return lookup;
}

/* ── Compiled-output injection ─────────────────────────────────────── */

function injectIds(
  compiled: string,
  lookup: Map<string, number>,
  filePath: string,
): string {
  // Phase 1: find all data-astro-source-loc anchors and resolve opening lines
  const locRe = /data-astro-source-loc="(\d+):(\d+)"/g;
  const closingCounts = new Map<string, number>();

  interface Injection {
    insertAt: number;
    openingLine: number;
    tagName: string;
  }

  const injections: Injection[] = [];
  let m: RegExpExecArray | null;

  while ((m = locRe.exec(compiled)) !== null) {
    const closingLine = parseInt(m[1], 10);
    const tagName = findTagNameBefore(compiled, m.index);
    if (!tagName || !VISIBLE_TAGS.has(tagName)) continue;

    // Skip if data-element-id already present on this tag
    const regionBefore = compiled.slice(Math.max(0, m.index - 300), m.index);
    if (regionBefore.includes('data-element-id=')) continue;

    const gk = `${closingLine}:${tagName}`;
    const occ = closingCounts.get(gk) ?? 0;
    closingCounts.set(gk, occ + 1);

    const openingLine = lookup.get(`${gk}:${occ}`);
    if (openingLine === undefined) continue;

    injections.push({ insertAt: m.index, openingLine, tagName });
  }

  if (injections.length === 0) return compiled;

  // Phase 2: compute index suffixes for duplicate opening-line + tag combos
  const openTotals = new Map<string, number>();
  for (const inj of injections) {
    const k = `${inj.openingLine}:${inj.tagName}`;
    openTotals.set(k, (openTotals.get(k) || 0) + 1);
  }

  // Phase 3: build output
  const openIndices = new Map<string, number>();
  let out = '';
  let cursor = 0;

  for (const inj of injections) {
    const k = `${inj.openingLine}:${inj.tagName}`;
    const total = openTotals.get(k)!;
    const idx = openIndices.get(k) ?? 0;
    openIndices.set(k, idx + 1);

    let eid = `${filePath}:${inj.openingLine}:${inj.tagName}`;
    if (total > 1) eid += `:${idx}`;

    out += compiled.slice(cursor, inj.insertAt);
    out += `data-element-id="${eid}" `;
    cursor = inj.insertAt;
  }

  out += compiled.slice(cursor);
  return out;
}

/** Search backwards from `pos` to find the nearest `<tagname` in the compiled output. */
function findTagNameBefore(src: string, pos: number): string | null {
  const limit = Math.max(0, pos - 10000);
  for (let i = pos - 1; i >= limit; i--) {
    if (src[i] === '<' && i + 1 < src.length) {
      const next = src[i + 1];
      if (next >= 'a' && next <= 'z') {
        let j = i + 1;
        while (j < src.length && /[a-zA-Z0-9\-]/.test(src[j])) j++;
        return src.slice(i + 1, j);
      }
    }
  }
  return null;
}
