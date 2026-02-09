import React from 'react';
import { Helmet } from 'react-helmet-async';

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

const buildDefaultSchema = ({
  canonicalUrl,
  description,
  title,
  type,
  imageUrl,
  publishedTime,
  modifiedTime,
}: {
  canonicalUrl: string;
  description: string;
  title: string;
  type: 'website' | 'article';
  imageUrl: string;
  publishedTime?: string;
  modifiedTime?: string;
}): SeoSchema => {
  if (type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: [imageUrl],
      mainEntityOfPage: canonicalUrl,
      inLanguage: 'fr-FR',
      datePublished: publishedTime,
      dateModified: modifiedTime ?? publishedTime,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: toAbsoluteUrl('/assets/cyberguide-icon-512.png', getSiteUrl()),
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
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getSiteUrl(),
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
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(path, siteUrl);
  const imageUrl = toAbsoluteUrl(image, siteUrl);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
  const resolvedSchemas = [
    buildDefaultSchema({
      canonicalUrl,
      description,
      title,
      type,
      imageUrl,
      publishedTime,
      modifiedTime,
    }),
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
  ];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr-FR" href={canonicalUrl} />

      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="fr_FR" />

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
