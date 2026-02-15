export type SupportedLocale = 'fr' | 'en';

export const DEFAULT_LOCALE: SupportedLocale = 'fr';
export const ENGLISH_LOCALE_PREFIX = '/en';
export const LOCALE_STORAGE_KEY = 'cg_locale';

const ABSOLUTE_URL_PATTERN = /^[a-z]+:\/\//i;
const NON_LOCALIZED_PATH_PATTERN = /^(mailto:|tel:|#)/i;

const ensureLeadingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const splitPathQueryHash = (value: string): { pathname: string; suffix: string } => {
  const hashIndex = value.indexOf('#');
  const queryIndex = value.indexOf('?');
  const cutIndex =
    hashIndex === -1
      ? queryIndex
      : queryIndex === -1
        ? hashIndex
        : Math.min(hashIndex, queryIndex);

  if (cutIndex === -1) {
    return { pathname: value, suffix: '' };
  }

  return {
    pathname: value.slice(0, cutIndex),
    suffix: value.slice(cutIndex),
  };
};

export const normalizeLocale = (value?: string | null): SupportedLocale =>
  value?.toLowerCase() === 'en' ? 'en' : DEFAULT_LOCALE;

export const getLocaleFromPathname = (pathname: string): SupportedLocale => {
  const normalizedPath = ensureLeadingSlash(pathname);
  if (normalizedPath === ENGLISH_LOCALE_PREFIX || normalizedPath.startsWith('/en/')) {
    return 'en';
  }

  return DEFAULT_LOCALE;
};

export const stripLocalePrefix = (pathname: string): string => {
  const normalizedPath = ensureLeadingSlash(pathname);

  if (normalizedPath === ENGLISH_LOCALE_PREFIX || normalizedPath === '/fr') {
    return '/';
  }

  if (normalizedPath.startsWith('/en/')) {
    return normalizedPath.slice('/en'.length) || '/';
  }

  if (normalizedPath.startsWith('/fr/')) {
    return normalizedPath.slice('/fr'.length) || '/';
  }

  return normalizedPath;
};

export const buildLocalizedPath = (path: string, locale: SupportedLocale): string => {
  if (!path || ABSOLUTE_URL_PATTERN.test(path) || NON_LOCALIZED_PATH_PATTERN.test(path)) {
    return path;
  }

  const { pathname, suffix } = splitPathQueryHash(path);
  const normalizedPathname = stripLocalePrefix(ensureLeadingSlash(pathname));
  const localizedPathname =
    locale === 'en'
      ? normalizedPathname === '/'
        ? ENGLISH_LOCALE_PREFIX
        : `${ENGLISH_LOCALE_PREFIX}${normalizedPathname}`
      : normalizedPathname;

  return `${localizedPathname}${suffix}`;
};

export const switchLocalePath = (
  currentPathWithQueryAndHash: string,
  targetLocale: SupportedLocale,
): string => {
  return buildLocalizedPath(currentPathWithQueryAndHash, targetLocale);
};

export const getPathWithQueryHash = (locationLike: {
  pathname: string;
  search?: string;
  hash?: string;
}): string => {
  const search = locationLike.search ?? '';
  const hash = locationLike.hash ?? '';
  return `${locationLike.pathname}${search}${hash}`;
};

export const getStoredLocale = (): SupportedLocale => {
  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
};

export const setStoredLocale = (locale: SupportedLocale): void => {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures in restrictive browsing contexts.
  }
};
