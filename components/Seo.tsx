import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  buildLocalizedPath,
  getLocaleFromPathname,
  stripLocalePrefix,
  type SupportedLocale,
} from '../utils/locale';

type SeoSchema = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  noindex?: boolean;
  schema?: SeoSchema | SeoSchema[];
  publishedTime?: string;
  modifiedTime?: string;
}

const SITE_NAME = 'Cyber Guide';
const DEFAULT_IMAGE = '/assets/cyberguide-brand.jpg';
const DEFAULT_SITE_URL = 'https://cyber-guide.fr';

const getSiteUrl = (): string => {
  const envUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (!envUrl) return DEFAULT_SITE_URL;

  try {
    return new URL(envUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
};

const toAbsoluteUrl = (value: string, siteUrl: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

const getHtmlLang = (locale: SupportedLocale): string => (locale === 'en' ? 'en' : 'fr');
const getSchemaLanguage = (locale: SupportedLocale): string => (locale === 'en' ? 'en' : 'fr-FR');
const getOpenGraphLocale = (locale: SupportedLocale): string => (locale === 'en' ? 'en_US' : 'fr_FR');

const shouldLocalizePath = (pathname: string): boolean => {
  if (!pathname.startsWith('/')) {
    return false;
  }

  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon-final.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/site.webmanifest'
  ) {
    return false;
  }

  return !/\.[a-z0-9]+$/i.test(pathname);
};

const localizeInternalAbsoluteUrl = (
  value: string,
  siteUrl: string,
  locale: SupportedLocale,
): string => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    return value;
  }

  if (parsedUrl.origin !== siteUrl || !shouldLocalizePath(parsedUrl.pathname)) {
    return value;
  }

  parsedUrl.pathname = buildLocalizedPath(stripLocalePrefix(parsedUrl.pathname), locale);
  return parsedUrl.toString();
};

const localizeSchemaValue = (
  value: unknown,
  siteUrl: string,
  locale: SupportedLocale,
): unknown => {
  if (typeof value === 'string') {
    return localizeInternalAbsoluteUrl(value, siteUrl, locale);
  }

  if (Array.isArray(value)) {
    return value.map((item) => localizeSchemaValue(item, siteUrl, locale));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        localizeSchemaValue(nestedValue, siteUrl, locale),
      ]),
    );
  }

  return value;
};

const buildDefaultSchema = ({
  canonicalUrl,
  description,
  title,
  type,
  imageUrl,
  publishedTime,
  modifiedTime,
  locale,
  siteUrl,
}: {
  canonicalUrl: string;
  description: string;
  title: string;
  type: 'website' | 'article';
  imageUrl: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale: SupportedLocale;
  siteUrl: string;
}): SeoSchema => {
  if (type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: [imageUrl],
      mainEntityOfPage: canonicalUrl,
      inLanguage: getSchemaLanguage(locale),
      datePublished: publishedTime,
      dateModified: modifiedTime ?? publishedTime,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: toAbsoluteUrl('/assets/cyberguide-icon-512.png', siteUrl),
        },
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: getSchemaLanguage(locale),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
  };
};

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  keywords = [],
  type = 'website',
  noindex = false,
  schema,
  publishedTime,
  modifiedTime,
}) => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const siteUrl = getSiteUrl();
  const normalizedPath = stripLocalePrefix(path);
  const canonicalPath = buildLocalizedPath(normalizedPath, locale);
  const canonicalUrl = toAbsoluteUrl(canonicalPath, siteUrl);
  const frenchUrl = toAbsoluteUrl(buildLocalizedPath(normalizedPath, 'fr'), siteUrl);
  const englishUrl = toAbsoluteUrl(buildLocalizedPath(normalizedPath, 'en'), siteUrl);
  const imageUrl = toAbsoluteUrl(image, siteUrl);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  const providedSchemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const resolvedSchemas = [
    buildDefaultSchema({
      canonicalUrl,
      description,
      title,
      type,
      imageUrl,
      publishedTime,
      modifiedTime,
      locale,
      siteUrl,
    }),
    ...providedSchemas.map((item) => localizeSchemaValue(item, siteUrl, locale) as SeoSchema),
  ];

  return (
    <Helmet prioritizeSeoTags>
      <html lang={getHtmlLang(locale)} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr-FR" href={frenchUrl} />
      <link rel="alternate" hrefLang="en" href={englishUrl} />
      <link rel="alternate" hrefLang="x-default" href={frenchUrl} />

      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={getOpenGraphLocale(locale)} />
      <meta property="og:locale:alternate" content={locale === 'en' ? 'fr_FR' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {resolvedSchemas.map((item, index) => (
        <script key={`seo-schema-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};
