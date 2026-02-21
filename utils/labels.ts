import type { SupportedLocale } from './locale';

const ANALYSIS_CATEGORY_EN: Record<string, string> = {
  'Strategique': 'Strategic',
  'Operationnel': 'Operational',
  'Conformite': 'Compliance',
  'Risque Emergent': 'Emerging Risk',
};

const ANALYSIS_LEVEL_EN: Record<string, string> = {
  Debutant: 'Beginner',
  Intermediaire: 'Intermediate',
  Avance: 'Advanced',
  Strategique: 'Strategic',
};

const PLAYBOOK_SEVERITY_EN: Record<string, string> = {
  Critique: 'Critical',
  Elevee: 'High',
  Moyenne: 'Medium',
  Faible: 'Low',
};

const PLAYBOOK_CATEGORY_EN: Record<string, string> = {
  'Reponse Incident': 'Incident Response',
  Investigation: 'Investigation',
  Forensics: 'Forensics',
  Hardening: 'Hardening',
  Audit: 'Audit',
  Gouvernance: 'Governance',
};

const PLAYBOOK_DIFFICULTY_EN: Record<string, string> = {
  Facile: 'Easy',
  Moyen: 'Medium',
  Difficile: 'Hard',
  Expert: 'Expert',
  Strategique: 'Strategic',
  '—': '—',
};

const TEMPLATE_PRIORITY_EN: Record<string, string> = {
  Critique: 'Critical',
  Elevee: 'High',
  Moyenne: 'Medium',
  Faible: 'Low',
};

const TEMPLATE_AUDIENCE_EN: Record<string, string> = {
  'IT / Ops': 'IT / Ops',
  'IT/Ops': 'IT / Ops',
  'SOC / CERT': 'SOC / CERT',
  'SOC/CERT': 'SOC / CERT',
  Management: 'Management',
  Juridique: 'Legal',
  RH: 'HR',
  Utilisateurs: 'Users',
  Clients: 'Clients',
  Fournisseur: 'Vendor',
  Externe: 'External',
};

const TOOL_STATUS_EN: Record<string, string> = {
  Pilote: 'Operational Pilot',
  Prototype: 'Prototype',
  Production: 'Production',
};

const SOFTWARE_LICENSE_EN: Record<string, string> = {
  'Open Source': 'Open Source',
  Free: 'Free',
  Paid: 'Proprietary',
  Freemium: 'Freemium',
};

const BLOG_CATEGORY_EN: Record<string, string> = {
  Incident: 'Incident',
  SOC: 'SOC',
  Gouvernance: 'Governance',
  Identity: 'Identity',
};

const normalizeLabel = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const localizeWithMap = (
  value: string,
  locale: SupportedLocale,
  englishMap: Record<string, string>,
): string => {
  if (locale !== 'en') {
    return value;
  }

  const key = normalizeLabel(value);
  return englishMap[key] ?? value;
};

export const localizeAnalysisCategory = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, ANALYSIS_CATEGORY_EN);

export const localizeAnalysisLevel = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, ANALYSIS_LEVEL_EN);

export const localizePlaybookSeverity = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, PLAYBOOK_SEVERITY_EN);

export const localizePlaybookCategory = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, PLAYBOOK_CATEGORY_EN);

export const localizePlaybookDifficulty = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, PLAYBOOK_DIFFICULTY_EN);

export const localizeTemplatePriority = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, TEMPLATE_PRIORITY_EN);

export const localizeTemplateAudience = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, TEMPLATE_AUDIENCE_EN);

export const localizeToolStatus = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, TOOL_STATUS_EN);

export const localizeSoftwareLicense = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, SOFTWARE_LICENSE_EN);

export const localizeBlogCategory = (value: string, locale: SupportedLocale): string =>
  localizeWithMap(value, locale, BLOG_CATEGORY_EN);
