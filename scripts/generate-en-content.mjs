import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const OUTPUT_FILE = path.resolve(ROOT, 'locales', 'contentEn.ts');
const require = createRequire(import.meta.url);
const TRANSLATE_API =
  'https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t';
const SEP = '\n[[[CGSEP]]]\n';
const MAX_ENCODED_QUERY_LENGTH = 3200;
const MAX_TRANSLATION_QUERY_LENGTH = 3000;

const NON_TRANSLATABLE_KEYS = new Set([
  'id',
  'slug',
  'publishedDate',
  'updatedDate',
  'updatedAt',
  'date',
  'readTime',
  'category',
  'level',
  'status',
  'license',
  'severity',
  'priority',
  'difficulty',
  'format',
  'ogImage',
  'officialUrl',
  'repoUrl',
  'url',
  'path',
  'link',
  'key',
  'query',
  'command',
  'cve',
  'cvss',
  'patchWindow',
]);

const PROTECTED_PATTERNS = [
  /```[\s\S]*?```/g, // fenced code blocks
  /`[^`\n]+`/g, // inline code
  /{{\s*[^}]+\s*}}/g, // template placeholders
  /https?:\/\/[^\s)]+/g, // urls
];

const getEncodedLength = (value) => encodeURIComponent(value).length;

const stripTypeImports = (source) =>
  source
    .replace(/^import type[^\n]*\n/gm, '')
    .replace(/^import \{[^\n]*\} from '[^']+';\n/gm, '');

const transpileAndLoad = (filePath, exportedNames) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const source = `${stripTypeImports(raw).replace(/export const /g, 'const ')}
module.exports = { ${exportedNames.join(', ')} };
`;
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const context = {
    module: { exports: {} },
    exports: {},
    require,
    console,
  };
  vm.createContext(context);
  vm.runInContext(transpiled, context, { timeout: 30_000 });
  return context.module.exports;
};

const shouldTranslate = (pathSegments, value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  const key = pathSegments[pathSegments.length - 1] ?? '';
  if (NON_TRANSLATABLE_KEYS.has(key)) return false;
  if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(trimmed)) return false;
  if (/^#[a-z0-9_-]+$/i.test(trimmed)) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  if (/^[A-Za-z0-9._/-]+$/.test(trimmed) && !/\s/.test(trimmed)) return false;

  // Keep technical enum-like values stable.
  if (trimmed.length <= 18 && /^[A-Z0-9 _&+-]+$/.test(trimmed)) return false;

  return true;
};

const protectText = (input) => {
  let text = input;
  const tokens = [];

  for (const pattern of PROTECTED_PATTERNS) {
    text = text.replace(pattern, (match) => {
      const token = `__CGTOKEN_${tokens.length}__`;
      tokens.push(match);
      return token;
    });
  }

  return { text, tokens };
};

const restoreText = (input, tokens) => {
  let restored = input;
  tokens.forEach((value, index) => {
    restored = restored.replaceAll(`__CGTOKEN_${index}__`, value);
  });
  return restored;
};

const requestTranslation = async (queryText) => {
  const params = new URLSearchParams({ q: queryText });
  const response = await fetch(`${TRANSLATE_API}&${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Translate API failed: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = payload?.[0]?.[0]?.[0];
  if (typeof translated !== 'string') {
    return queryText;
  }

  return translated;
};

const splitTextByEncodedLength = (input, maxEncodedLength) => {
  if (getEncodedLength(input) <= maxEncodedLength) {
    return [input];
  }

  const chunks = [];
  let cursor = 0;

  while (cursor < input.length) {
    let low = 1;
    let high = input.length - cursor;
    let bestLength = 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = input.slice(cursor, cursor + mid);
      if (getEncodedLength(candidate) <= maxEncodedLength) {
        bestLength = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    chunks.push(input.slice(cursor, cursor + bestLength));
    cursor += bestLength;
  }

  return chunks;
};

const translateSingleText = async (text) => {
  const { text: protectedText, tokens } = protectText(text);
  const protectedChunks = splitTextByEncodedLength(protectedText, MAX_TRANSLATION_QUERY_LENGTH);
  const translatedChunks = [];

  for (const chunk of protectedChunks) {
    translatedChunks.push(await requestTranslation(chunk));
  }

  return restoreText(translatedChunks.join(''), tokens);
};

const chunkByEncodedLength = (items) => {
  const chunks = [];
  let current = [];

  const encodedLength = (arr) => getEncodedLength(arr.join(SEP));

  for (const item of items) {
    if (current.length === 0) {
      current.push(item);
      continue;
    }

    const tentative = [...current, item];
    if (encodedLength(tentative) <= MAX_ENCODED_QUERY_LENGTH) {
      current = tentative;
    } else {
      chunks.push(current);
      current = [item];
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
};

const translateBatch = async (strings) => {
  const translatedMap = new Map();
  const chunks = chunkByEncodedLength(strings);

  for (const chunk of chunks) {
    const joined = chunk.join(SEP);
    const translatedJoined = await translateSingleText(joined);
    const split = translatedJoined.split(SEP);

    if (split.length !== chunk.length) {
      // Fallback for edge cases where separator was altered by translation.
      for (const value of chunk) {
        translatedMap.set(value, await translateSingleText(value));
      }
      continue;
    }

    chunk.forEach((sourceValue, index) => {
      translatedMap.set(sourceValue, split[index] ?? sourceValue);
    });
  }

  return translatedMap;
};

const collectTranslatableStrings = (input, pathSegments = [], collector = new Set()) => {
  if (Array.isArray(input)) {
    input.forEach((value, index) => {
      collectTranslatableStrings(value, pathSegments.concat(String(index)), collector);
    });
    return collector;
  }

  if (input && typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      collectTranslatableStrings(value, pathSegments.concat(key), collector);
    });
    return collector;
  }

  if (typeof input === 'string' && shouldTranslate(pathSegments, input)) {
    collector.add(input);
  }

  return collector;
};

const applyTranslations = (input, translationMap, pathSegments = []) => {
  if (Array.isArray(input)) {
    return input.map((value, index) =>
      applyTranslations(value, translationMap, pathSegments.concat(String(index))),
    );
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        applyTranslations(value, translationMap, pathSegments.concat(key)),
      ]),
    );
  }

  if (typeof input === 'string' && shouldTranslate(pathSegments, input)) {
    return translationMap.get(input) ?? input;
  }

  return input;
};

const run = async () => {
  const dataModule = transpileAndLoad(path.resolve(ROOT, 'data.ts'), [
    'analyses',
    'tools',
    'softwares',
    'playbooks',
    'templates',
    'projects',
    'blogPosts',
  ]);
  const guidesModule = transpileAndLoad(path.resolve(ROOT, 'guides.ts'), ['guides']);

  const sourceContent = {
    analyses: dataModule.analyses,
    tools: dataModule.tools,
    softwares: dataModule.softwares,
    playbooks: dataModule.playbooks,
    templates: dataModule.templates,
    projects: dataModule.projects,
    blogPosts: dataModule.blogPosts,
    guides: guidesModule.guides,
  };

  const candidates = [...collectTranslatableStrings(sourceContent)];
  console.log(`Found ${candidates.length} translatable strings.`);

  const translationMap = await translateBatch(candidates);
  const translated = applyTranslations(sourceContent, translationMap);

  const output = `/* auto-generated by scripts/generate-en-content.mjs */\n\nexport const contentEn = ${JSON.stringify(
    translated,
    null,
    2,
  )} as const;\n`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`Generated EN content file: ${OUTPUT_FILE}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
