import {
  analyses as analysesFr,
  blogPosts as blogPostsFr,
  playbooks as playbooksFr,
  projects as projectsFr,
  softwares as softwaresFr,
  templates as templatesFr,
  tools as toolsFr,
} from '../data';
import { guides as guidesFr, type GuidePillar } from '../guides';
import { contentEn } from '../locales/contentEn';
import type { Analysis, BlogPost, CyberTemplate, Playbook, Project, Software, Tool } from '../types';
import type { SupportedLocale } from './locale';

type LocalizedCollections = {
  analyses: Analysis[];
  tools: Tool[];
  softwares: Software[];
  playbooks: Playbook[];
  templates: CyberTemplate[];
  projects: Project[];
  blogPosts: BlogPost[];
  guides: GuidePillar[];
};

type LocalizedRawCollections = Partial<
  Record<keyof LocalizedCollections, Array<Record<string, unknown>>>
>;

const cloneCollection = <T extends object>(collection: readonly T[]): T[] =>
  collection.map((item) => ({ ...(item as object) } as T));

const mergeLocalizedCollection = <T extends object>(
  frenchCollection: readonly T[],
  englishCollection: readonly Record<string, unknown>[] | undefined,
  key: Extract<keyof T, string>,
): T[] => {
  if (!englishCollection || englishCollection.length === 0) {
    return cloneCollection(frenchCollection);
  }

  const englishByKey = new Map<string, Record<string, unknown>>();

  for (const englishItem of englishCollection) {
    const rawKey = englishItem[key];
    if (typeof rawKey === 'string' && rawKey.trim().length > 0) {
      englishByKey.set(rawKey.toLowerCase(), englishItem);
    }
  }

  return frenchCollection.map((frenchItem) => {
    const frenchKey = frenchItem[key as keyof T];

    if (typeof frenchKey !== 'string' || frenchKey.trim().length === 0) {
      return { ...(frenchItem as object) } as T;
    }

    const englishItem = englishByKey.get(frenchKey.toLowerCase());

    if (!englishItem) {
      return { ...(frenchItem as object) } as T;
    }

    return {
      ...(frenchItem as object),
      ...(englishItem as Partial<T>),
    } as T;
  });
};

const contentFr: LocalizedCollections = {
  analyses: cloneCollection(analysesFr),
  tools: cloneCollection(toolsFr),
  softwares: cloneCollection(softwaresFr),
  playbooks: cloneCollection(playbooksFr),
  templates: cloneCollection(templatesFr),
  projects: cloneCollection(projectsFr),
  blogPosts: cloneCollection(blogPostsFr),
  guides: cloneCollection(guidesFr),
};

const contentEnRaw = contentEn as unknown as LocalizedRawCollections;

const contentEnLocalized: LocalizedCollections = {
  analyses: mergeLocalizedCollection(contentFr.analyses, contentEnRaw.analyses, 'slug'),
  tools: mergeLocalizedCollection(contentFr.tools, contentEnRaw.tools, 'id'),
  softwares: mergeLocalizedCollection(contentFr.softwares, contentEnRaw.softwares, 'id'),
  playbooks: mergeLocalizedCollection(contentFr.playbooks, contentEnRaw.playbooks, 'id'),
  templates: mergeLocalizedCollection(contentFr.templates, contentEnRaw.templates, 'id'),
  projects: mergeLocalizedCollection(contentFr.projects, contentEnRaw.projects, 'id'),
  blogPosts: mergeLocalizedCollection(contentFr.blogPosts, contentEnRaw.blogPosts, 'slug'),
  guides: mergeLocalizedCollection(contentFr.guides, contentEnRaw.guides, 'slug'),
};

export const getLocalizedContent = (locale: SupportedLocale): LocalizedCollections =>
  locale === 'en' ? contentEnLocalized : contentFr;

export const getLocalizedGuideBySlug = (
  slug: string,
  locale: SupportedLocale,
): GuidePillar | undefined => getLocalizedContent(locale).guides.find((guide) => guide.slug === slug);
