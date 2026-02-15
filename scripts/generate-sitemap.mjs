import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_SITE_URL = 'https://cyber-guide.fr';
const ROOT = process.cwd();

const dataFile = resolve(ROOT, 'data.ts');
const guidesFile = resolve(ROOT, 'guides.ts');
const sitemapFile = resolve(ROOT, 'public', 'sitemap.xml');

const normalizeSiteUrl = (value) => {
  if (!value) return DEFAULT_SITE_URL;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
};

const extractSection = (content, startMarker, endMarker) => {
  const start = content.indexOf(startMarker);
  if (start === -1) return '';
  if (!endMarker) return content.slice(start);

  const end = content.indexOf(endMarker, start);
  return end === -1 ? content.slice(start) : content.slice(start, end);
};

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const maxDate = (dates, fallback) => {
  const valid = dates.filter((item) => isIsoDate(item));
  if (valid.length === 0) return fallback;
  return valid.sort().at(-1);
};

const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);
const today = new Date().toISOString().slice(0, 10);

const dataContent = readFileSync(dataFile, 'utf8');
const guidesContent = readFileSync(guidesFile, 'utf8');

const analysisSeoSection = extractSection(
  dataContent,
  'const analysisSeoProfiles',
  'const analysisExpertProfiles',
);
const guidesSection = extractSection(
  guidesContent,
  'export const guides',
  'export const getGuideBySlug',
);
const blogSection = extractSection(dataContent, 'export const blogPosts');
const templatesSection = extractSection(
  dataContent,
  'export const templates',
  'export const projects',
);

const analysisEntries = [
  ...analysisSeoSection.matchAll(
    /'([^']+)':\s*{[\s\S]*?publishedDate:\s*'([^']+)'[\s\S]*?updatedDate:\s*'([^']+)'/g,
  ),
].map((match) => ({
  slug: match[1],
  lastmod: isIsoDate(match[3]) ? match[3] : isIsoDate(match[2]) ? match[2] : today,
}));

const guideEntries = [
  ...guidesSection.matchAll(/slug:\s*'([^']+)'[\s\S]*?updatedDate:\s*'([^']+)'/g),
].map((match) => ({
  slug: match[1],
  lastmod: isIsoDate(match[2]) ? match[2] : today,
}));

const blogEntries = [
  ...blogSection.matchAll(
    /slug:\s*'([^']+)'[\s\S]*?publishedDate:\s*'([^']+)'(?:[\s\S]*?updatedDate:\s*'([^']+)')?/g,
  ),
].map((match) => ({
  slug: match[1],
  lastmod: isIsoDate(match[3]) ? match[3] : isIsoDate(match[2]) ? match[2] : today,
}));

const templateEntries = [
  ...templatesSection.matchAll(/id:\s*'([^']+)'[\s\S]*?updatedAt:\s*'([^']+)'/g),
]
  .map((match) => ({
    id: match[1],
    lastmod: isIsoDate(match[2]) ? match[2] : today,
  }))
  .filter((entry, index, all) => all.findIndex((item) => item.id === entry.id) === index);

const analysesLastmod = maxDate(
  analysisEntries.map((item) => item.lastmod),
  today,
);
const guidesLastmod = maxDate(
  guideEntries.map((item) => item.lastmod),
  today,
);
const blogLastmod = maxDate(
  blogEntries.map((item) => item.lastmod),
  today,
);
const templatesLastmod = maxDate(
  templateEntries.map((item) => item.lastmod),
  today,
);
const siteLastmod = maxDate([analysesLastmod, guidesLastmod, blogLastmod, templatesLastmod], today);

const staticEntries = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: siteLastmod },
  { path: '/analyses', changefreq: 'weekly', priority: '0.9', lastmod: analysesLastmod },
  { path: '/guides', changefreq: 'weekly', priority: '0.9', lastmod: guidesLastmod },
  { path: '/outils', changefreq: 'weekly', priority: '0.8', lastmod: siteLastmod },
  { path: '/templates', changefreq: 'weekly', priority: '0.8', lastmod: templatesLastmod },
  { path: '/projets', changefreq: 'weekly', priority: '0.8', lastmod: analysesLastmod },
  { path: '/sources', changefreq: 'weekly', priority: '0.7', lastmod: siteLastmod },
  { path: '/blog', changefreq: 'weekly', priority: '0.7', lastmod: blogLastmod },
  { path: '/a-propos', changefreq: 'monthly', priority: '0.6', lastmod: siteLastmod },
  { path: '/contact', changefreq: 'monthly', priority: '0.6', lastmod: siteLastmod },
];

const dynamicEntries = [
  ...analysisEntries.map((entry) => ({
    path: `/analyses/${entry.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: entry.lastmod,
  })),
  ...guideEntries.map((entry) => ({
    path: `/guides/${entry.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: entry.lastmod,
  })),
  ...blogEntries.map((entry) => ({
    path: `/blog/${entry.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: entry.lastmod,
  })),
  ...templateEntries.map((entry) => ({
    path: `/templates/${entry.id}`,
    changefreq: 'monthly',
    priority: '0.75',
    lastmod: entry.lastmod,
  })),
];

const toEnglishPath = (path) => (path === '/' ? '/en' : `/en${path}`);

const localizedEntries = [...staticEntries, ...dynamicEntries].flatMap((entry) => [
  entry,
  {
    ...entry,
    path: toEnglishPath(entry.path),
    // Keep EN URLs indexable but slightly below FR canonical market priority.
    priority: String(Math.max(0.1, Number.parseFloat(entry.priority) - 0.05).toFixed(2)),
  },
]);

const entries = localizedEntries.filter((entry, index, all) => {
  return all.findIndex((candidate) => candidate.path === entry.path) === index;
});

const toXmlEntry = (entry) => {
  return [
    '  <url>',
    `    <loc>${siteUrl}${entry.path}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ].join('\n');
};

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(toXmlEntry),
  '</urlset>',
  '',
].join('\n');

writeFileSync(sitemapFile, xml, 'utf8');
console.log(`Sitemap generated: ${entries.length} URLs -> ${sitemapFile}`);
