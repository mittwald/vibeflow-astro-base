import { createHash } from "node:crypto";
import path from "node:path";
import { parse } from "@babel/parser";
import generateModule from "@babel/generator";
import traverseModule from "@babel/traverse";
import * as t from "@babel/types";

const traverse = traverseModule.default ?? traverseModule;
const generate = generateModule.default ?? generateModule;

const DATA_ATTRIBUTES = ["data-vf-id", "data-element-id"];
const JSX_EXTENSIONS = /\.(jsx|tsx)$/;
const ASTRO_EXTENSION = /\.astro$/;
const SKIP_ASTRO_TAGS = new Set([
  "html",
  "head",
  "body",
  "title",
  "meta",
  "link",
  "script",
  "style",
  "slot",
  "template",
]);

function normalizeFile(id) {
  return id.split("?")[0];
}

function isSourceFile(file) {
  const normalized = file.replace(/\\/g, "/");
  return normalized.includes("/src/") && !normalized.includes("/node_modules/");
}

function makeStableId(root, file, line, column, tagName) {
  const relativeFile = path.relative(root, file).replace(/\\/g, "/");
  const source = `${relativeFile}:${line}:${column}:${tagName}`;
  const hash = createHash("sha1").update(source).digest("hex").slice(0, 12);
  return `vf-${hash}`;
}

function hasDataAttribute(attributes) {
  return DATA_ATTRIBUTES.some((name) => new RegExp(`\\b${name}\\s*=`).test(attributes));
}

function getLineColumnFromOffset(source, offset) {
  const before = source.slice(0, offset);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function splitAstroFrontmatter(code) {
  if (!code.startsWith("---")) {
    return { frontmatter: "", body: code, bodyOffset: 0 };
  }

  const close = code.indexOf("\n---", 3);
  if (close === -1) {
    return { frontmatter: "", body: code, bodyOffset: 0 };
  }

  const end = code.indexOf("\n", close + 4);
  if (end === -1) {
    return { frontmatter: code, body: "", bodyOffset: code.length };
  }

  return {
    frontmatter: code.slice(0, end + 1),
    body: code.slice(end + 1),
    bodyOffset: end + 1,
  };
}

function transformAstro(code, file, root) {
  const { frontmatter, body, bodyOffset } = splitAstroFrontmatter(code);
  const tagPattern = /<([A-Za-z][\w:.-]*)(\s[^<>]*?)?(\/?)>/g;
  let changed = false;

  const transformedBody = body.replace(tagPattern, (match, tagName, rawAttributes = "", selfClosing = "", offset) => {
    if (tagName[0] !== tagName[0].toLowerCase()) return match;
    if (tagName.includes(":")) return match;
    if (SKIP_ASTRO_TAGS.has(tagName)) return match;
    if (hasDataAttribute(rawAttributes)) return match;

    const { line, column } = getLineColumnFromOffset(code, bodyOffset + offset);
    const id = makeStableId(root, file, line, column, tagName);
    const injected = DATA_ATTRIBUTES.map((name) => `${name}="${id}"`).join(" ");
    changed = true;

    return `<${tagName}${rawAttributes} ${injected}${selfClosing}>`;
  });

  return changed ? `${frontmatter}${transformedBody}` : null;
}

function getJsxTagName(name) {
  if (t.isJSXIdentifier(name)) return name.name;
  return null;
}

function getJsxAttributeName(attribute) {
  if (!t.isJSXAttribute(attribute)) return null;
  if (t.isJSXIdentifier(attribute.name)) return attribute.name.name;
  if (t.isJSXNamespacedName(attribute.name)) {
    return `${attribute.name.namespace.name}:${attribute.name.name.name}`;
  }
  return null;
}

function transformJsx(code, file, root) {
  const ast = parse(code, {
    sourceType: "module",
    sourceFilename: file,
    plugins: ["jsx", "typescript"],
  });

  let changed = false;

  traverse(ast, {
    JSXOpeningElement(pathRef) {
      const tagName = getJsxTagName(pathRef.node.name);
      if (!tagName || tagName[0] !== tagName[0].toLowerCase()) return;

      const existing = new Set(pathRef.node.attributes.map(getJsxAttributeName).filter(Boolean));
      const missing = DATA_ATTRIBUTES.filter((name) => !existing.has(name));
      if (missing.length === 0) return;

      const loc = pathRef.node.loc?.start ?? { line: 1, column: 0 };
      const id = makeStableId(root, file, loc.line, loc.column + 1, tagName);
      for (const name of missing) {
        pathRef.node.attributes.push(t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(id)));
      }
      changed = true;
    },
  });

  if (!changed) return null;

  return generate(
    ast,
    {
      retainLines: true,
      sourceMaps: true,
      sourceFileName: file,
    },
    code,
  );
}

export default function elementIds({ enabled = false } = {}) {
  let root = process.cwd();

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: "vibeflow-element-ids",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    transform(code, id) {
      const file = normalizeFile(id);

      if (!enabled || !isSourceFile(file)) {
        return null;
      }

      if (JSX_EXTENSIONS.test(file)) {
        return transformJsx(code, file, root);
      }

      if (ASTRO_EXTENSION.test(file)) {
        const transformed = transformAstro(code, file, root);
        return transformed ? { code: transformed, map: null } : null;
      }

      return null;
    },
  };

  return plugin;
}
