import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ShieldHeader,
  Button,
  Badge,
  Drawer,
  TechSeparator,
  type BadgeColor,
} from '../components/UI';
import { templates } from '../data';
import type { CyberTemplate, TemplateAudience, TemplatePriority, TemplateVariable } from '../types';
import {
  Search,
  Filter,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Copy,
  Download,
  Wand2,
  RefreshCcw,
  AlertTriangle,
  FileText,
  Tags,
  Printer,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname, stripLocalePrefix } from '../utils/locale';

type SortOption = 'priority_desc' | 'title_asc' | 'updated_desc';
type TemplateValues = Record<string, string>;
type PreviewMode = 'visual' | 'document' | 'markdown';
type CollectionMode = 'essentials' | 'all';

type VisualPreviewSection = {
  title: string;
  lines: string[];
};

type VisualPreview = {
  headline: string;
  sections: VisualPreviewSection[];
};

const EMPTY_VALUES: TemplateValues = {};
const ESSENTIAL_TEMPLATE_IDS = [
  'tpl-001',
  'tpl-002',
  'tpl-003',
  'tpl-004',
  'tpl-005',
  'tpl-007',
  'tpl-008',
  'tpl-010',
  'tpl-013',
  'tpl-019',
] as const;
const PRIORITY_ORDER: Record<TemplatePriority, number> = {
  Critique: 4,
  Élevée: 3,
  Moyenne: 2,
  Faible: 1,
};

const SORT_OPTION_VALUES: SortOption[] = ['priority_desc', 'title_asc', 'updated_desc'];

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value: string): string =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (isoDate: string, locale: 'fr' | 'en'): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    dateStyle: 'long',
  }).format(parsed);
};

const formatDateTime = (isoDate: string, locale: 'fr' | 'en'): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(parsed);
};

const getPriorityColor = (priority: TemplatePriority): BadgeColor => {
  if (priority === 'Critique') return 'alert';
  if (priority === 'Élevée') return 'gold';
  if (priority === 'Moyenne') return 'steel';
  return 'navy';
};

const getPriorityStripeClass = (priority: TemplatePriority): string => {
  if (priority === 'Critique') return 'bg-red-500';
  if (priority === 'Élevée') return 'bg-brand-gold';
  if (priority === 'Moyenne') return 'bg-brand-steel';
  return 'bg-brand-navy';
};

const hasComplianceRegulation = (template: CyberTemplate): boolean =>
  (template.regulations ?? []).some((regulation) => {
    const normalized = normalizeText(regulation);
    return normalized === 'gdpr' || normalized === 'nis2';
  });

const buildTemplateSearchIndex = (template: CyberTemplate): string =>
  normalizeText(
    [
      template.id,
      template.title,
      template.description,
      template.category,
      template.priority,
      template.tags.join(' '),
      template.content,
      template.audiences.join(' '),
      (template.regulations ?? []).join(' '),
    ].join(' '),
  );

const buildEmptyValues = (template: CyberTemplate): TemplateValues =>
  Object.fromEntries(template.variables.map((item) => [item.key, '']));

const renderTemplatePreview = (template: CyberTemplate, values: TemplateValues): string => {
  let rendered = template.content;

  for (const variable of template.variables) {
    const replacement = values[variable.key]?.trim();
    const safePattern = new RegExp(`{{\\s*${escapeRegex(variable.key)}\\s*}}`, 'g');
    rendered = rendered.replace(
      safePattern,
      replacement && replacement.length > 0 ? replacement : `{{${variable.key}}}`,
    );
  }

  return rendered;
};

const buildVisualPreview = (renderedMarkdown: string): VisualPreview => {
  const lines = renderedMarkdown.split('\n');
  let headline = 'Template';
  const sections: VisualPreviewSection[] = [];
  let currentSection: VisualPreviewSection = { title: 'Résumé', lines: [] };

  const pushCurrentSection = () => {
    if (currentSection.lines.length === 0) {
      return;
    }
    sections.push(currentSection);
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }

    if (line.startsWith('# ')) {
      headline = line.replace(/^#\s+/, '');
      continue;
    }

    if (line.startsWith('## ')) {
      pushCurrentSection();
      currentSection = {
        title: line.replace(/^##\s+/, ''),
        lines: [],
      };
      continue;
    }

    currentSection.lines.push(line);
  }

  pushCurrentSection();

  if (sections.length === 0) {
    sections.push({ title: 'Résumé', lines: [renderedMarkdown.trim()] });
  }

  return { headline, sections };
};

const summarizeSection = (lines: string[]): string => {
  const candidate = lines.find((line) => !line.startsWith('|')) ?? lines[0] ?? '';
  return candidate
    .replace(/^[-*]\s+/, '')
    .replace(/\*\*/g, '')
    .slice(0, 180)
    .trim();
};

const renderInlineMarkdown = (value: string): React.ReactNode[] => {
  const normalized = value.replace(/\\\*/g, '*');
  const boldPattern = /\*\*(.+?)\*\*/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null = null;

  while ((match = boldPattern.exec(normalized)) !== null) {
    const plainChunk = normalized.slice(cursor, match.index).replace(/\*\*/g, '');
    if (plainChunk.length > 0) {
      nodes.push(<React.Fragment key={`text-${cursor}`}>{plainChunk}</React.Fragment>);
    }
    nodes.push(<strong key={`strong-${match.index}`}>{match[1]}</strong>);
    cursor = match.index + match[0].length;
  }

  const tailChunk = normalized.slice(cursor).replace(/\*\*/g, '');
  if (tailChunk.length > 0 || nodes.length === 0) {
    nodes.push(<React.Fragment key={`tail-${cursor}`}>{tailChunk}</React.Fragment>);
  }

  return nodes;
};

const downloadMarkdown = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
};

const getInputType = (variable: TemplateVariable): React.HTMLInputTypeAttribute => {
  // Keep native strict validation only where it does not block free operational drafting.
  if (variable.type === 'email') return 'email';
  if (variable.type === 'url') return 'url';
  return 'text';
};

const getInputMode = (
  variable: TemplateVariable,
): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
  if (variable.type === 'number' || variable.type === 'date') return 'numeric';
  if (variable.type === 'email') return 'email';
  if (variable.type === 'url') return 'url';
  return 'text';
};

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const normalizedPath = stripLocalePrefix(location.pathname);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const localizedAbsolutePath = (path: string): string =>
    `https://cyber-guide.fr${buildLocalizedPath(path, locale)}`;
  const { id: routeTemplateIdParam } = useParams<{ id?: string }>();

  const routeTemplateId = routeTemplateIdParam?.toLowerCase() ?? null;
  const copy = isEnglish
    ? {
        all: 'All',
        title: 'Templates',
        subtitle: 'Enterprise Ops',
        metaCustom: 'Customizable',
        searchPlaceholder: 'Search (content, tags, audience...)',
        priorityAll: 'Priority: All',
        audiencePrefix: 'Audience',
        sortPrefix: 'Sort',
        collectionPremium: 'Premium collection',
        collectionAll: 'All',
        withCompliance: 'With GDPR/NIS2',
        templateCountLabel: 'templates',
        noTemplate: 'No template matches current filters.',
        updatedShort: 'Updated',
        openTemplate: 'Open',
        openTemplateAria: 'Open template',
        drawerTitleSuffix: 'Enterprise template',
        drawerBack: 'Back to library',
        variables: 'Variables',
        prefill: 'Prefill examples',
        reset: 'Reset',
        preview: 'Rendered preview',
        previewVisual: 'Visual preview',
        previewDocument: 'Professional report',
        missingVariables: 'Missing variables',
        fillLabel: 'Complete:',
        renderedTitle: 'Rendered title',
        printReady: 'Print ready ✅',
        printFailed: 'Cannot prepare print',
        printOpenFailed: 'Cannot open print preview',
        generatedAt: 'Generated on',
        priority: 'Priority',
        updatedOn: 'Updated',
        sections: 'Sections',
        required: 'Required',
        references: 'References',
        frameworkReferences: 'Framework references',
        frameworkFallback: 'Add relevant standards here (NIST, ISO, ANSSI, CIS).',
        limitsValidation: 'Limits and validation',
        limitsFallback:
          'This template must be validated by the relevant business functions before distribution.',
        approvalBlock: 'Internal approval block',
        approvalNote: 'Complete this block before internal publication or external sending.',
        draftedBy: 'Drafted by (SOC / IR)',
        validatedBy: 'Validated by (CISO / Legal)',
        managementApproval: 'Management approval',
        signatureMeta: 'Name, title, date',
        signatureApproval: 'Signature and classification',
        targetAudience: 'Target audience',
        reportDate: 'Generated',
        printReport: 'Print report',
        copyRendered: 'Copy rendered',
        downloadMd: 'Download .md',
        copyRaw: 'Copy raw',
        copied: 'Copied ✅',
        copiedRendered: 'Rendered copied ✅',
        copiedRaw: 'Raw copied ✅',
        copyFailed: 'Copy failed',
        downloadSuccess: 'Downloaded .md ✅',
        previewEmptySection: 'Complete this section for your context.',
        seoCollectionTitle: 'Enterprise cybersecurity templates',
        seoCollectionDescription:
          'Library of enterprise-oriented cybersecurity templates, customizable and exportable as Markdown.',
        sortPriority: 'Priority descending',
        sortTitle: 'Title A→Z',
        sortUpdated: 'Updated (recent first)',
      }
    : {
        all: 'Tous',
        title: 'Templates',
        subtitle: 'Ops Entreprise',
        metaCustom: 'Personnalisables',
        searchPlaceholder: 'Rechercher (contenu, tags, audience...)',
        priorityAll: 'Priorité: Toutes',
        audiencePrefix: 'Audience',
        sortPrefix: 'Tri',
        collectionPremium: 'Collection Premium',
        collectionAll: 'Tous',
        withCompliance: 'Avec GDPR/NIS2',
        templateCountLabel: 'templates',
        noTemplate: 'Aucun template ne correspond aux filtres actuels.',
        updatedShort: 'MAJ',
        openTemplate: 'Ouvrir',
        openTemplateAria: 'Ouvrir le template',
        drawerTitleSuffix: 'Template entreprise',
        drawerBack: 'Retour bibliothèque',
        variables: 'Variables',
        prefill: 'Préremplir exemples',
        reset: 'Reset',
        preview: 'Preview rendu',
        previewVisual: 'Aperçu visuel',
        previewDocument: 'Rapport Pro',
        missingVariables: 'Variables manquantes',
        fillLabel: 'Compléter:',
        renderedTitle: 'Titre rendu',
        printReady: 'Impression prête ✅',
        printFailed: 'Impossible de préparer l impression',
        printOpenFailed: 'Impossible d ouvrir l aperçu impression',
        generatedAt: 'Généré le',
        priority: 'Priorité',
        updatedOn: 'Mise à jour',
        sections: 'Rubriques',
        required: 'Obligatoires',
        references: 'Références',
        frameworkReferences: 'Références de cadrage',
        frameworkFallback: 'Ajouter ici les standards applicables (NIST, ISO, ANSSI, CIS).',
        limitsValidation: 'Limites et validation',
        limitsFallback:
          'Ce template doit être validé par les fonctions concernées avant diffusion.',
        approvalBlock: 'Bloc approbation interne',
        approvalNote: 'Compléter ce bloc avant publication interne ou envoi externe.',
        draftedBy: 'Rédigé par (SOC / IR)',
        validatedBy: 'Validé par (RSSI / Juridique)',
        managementApproval: 'Approbation Direction',
        signatureMeta: 'Nom, fonction, date',
        signatureApproval: 'Signature et classification',
        targetAudience: 'Audience cible',
        reportDate: 'Généré',
        printReport: 'Imprimer rapport',
        copyRendered: 'Copier rendu',
        downloadMd: 'Télécharger .md',
        copyRaw: 'Copier brut',
        copied: 'Copié ✅',
        copiedRendered: 'Copié rendu ✅',
        copiedRaw: 'Copié brut ✅',
        copyFailed: 'Copie impossible',
        downloadSuccess: 'Fichier .md téléchargé ✅',
        previewEmptySection: 'Compléter cette rubrique selon votre contexte.',
        seoCollectionTitle: 'Templates cybersécurité entreprise',
        seoCollectionDescription:
          'Bibliothèque de templates cybersécurité orientés entreprise, personnalisables et exportables en Markdown.',
        sortPriority: 'Priorité décroissante',
        sortTitle: 'Titre A→Z',
        sortUpdated: 'Mis à jour (récent)',
      };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activePriority, setActivePriority] = useState('Tous');
  const [activeAudience, setActiveAudience] = useState('Tous');
  const [withComplianceOnly, setWithComplianceOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('priority_desc');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('document');
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('essentials');

  const [valuesByTemplateId, setValuesByTemplateId] = useState<Record<string, TemplateValues>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const documentPreviewRef = useRef<HTMLDivElement | null>(null);

  const selectedTemplate =
    routeTemplateId !== null
      ? (templates.find((template) => template.id.toLowerCase() === routeTemplateId) ?? null)
      : null;

  useEffect(() => {
    if (!normalizedPath.startsWith('/playbooks')) {
      return;
    }

    if (routeTemplateId) {
      navigate(localizedPath(`/templates/${routeTemplateId}`), { replace: true });
      return;
    }

    navigate(localizedPath('/templates'), { replace: true });
  }, [normalizedPath, routeTemplateId, navigate, localizedPath]);

  useEffect(() => {
    if (!routeTemplateId || selectedTemplate) {
      return;
    }

    navigate(localizedPath('/templates'), { replace: true });
  }, [routeTemplateId, selectedTemplate, navigate, localizedPath]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(templates.map((template) => template.category))).sort()],
    [],
  );

  const audiences = useMemo(
    () => [
      'Tous',
      ...Array.from(new Set(templates.flatMap((template) => template.audiences))).sort(),
    ],
    [],
  );

  const searchIndexByTemplateId = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of templates) {
      map.set(template.id, buildTemplateSearchIndex(template));
    }
    return map;
  }, []);

  const baseCollection = useMemo(() => {
    if (collectionMode === 'all') {
      return templates;
    }
    return templates.filter((template) =>
      ESSENTIAL_TEMPLATE_IDS.includes(template.id as (typeof ESSENTIAL_TEMPLATE_IDS)[number]),
    );
  }, [collectionMode]);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());

  const filteredTemplates = useMemo(() => {
    const visible = baseCollection.filter((template) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        searchIndexByTemplateId.get(template.id)?.includes(normalizedSearchTerm) === true;
      const matchesCategory = activeCategory === 'Tous' || template.category === activeCategory;
      const matchesPriority = activePriority === 'Tous' || template.priority === activePriority;
      const matchesAudience =
        activeAudience === 'Tous' ||
        template.audiences.includes(activeAudience as TemplateAudience);
      const matchesCompliance = !withComplianceOnly || hasComplianceRegulation(template);

      return (
        matchesSearch && matchesCategory && matchesPriority && matchesAudience && matchesCompliance
      );
    });

    visible.sort((left, right) => {
      if (sortOption === 'priority_desc') {
        const delta = PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];
        if (delta !== 0) return delta;
      }

      if (sortOption === 'updated_desc') {
        const leftDate = Date.parse(left.updatedAt);
        const rightDate = Date.parse(right.updatedAt);
        const safeLeftDate = Number.isNaN(leftDate) ? 0 : leftDate;
        const safeRightDate = Number.isNaN(rightDate) ? 0 : rightDate;
        if (safeRightDate !== safeLeftDate) return safeRightDate - safeLeftDate;
      }

      return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
    });

    return visible;
  }, [
    normalizedSearchTerm,
    searchIndexByTemplateId,
    activeCategory,
    activePriority,
    activeAudience,
    withComplianceOnly,
    sortOption,
    baseCollection,
  ]);

  const selectedValues = useMemo(() => {
    if (!selectedTemplate) {
      return EMPTY_VALUES;
    }

    return valuesByTemplateId[selectedTemplate.id] ?? buildEmptyValues(selectedTemplate);
  }, [selectedTemplate, valuesByTemplateId]);

  const missingRequiredVariables = useMemo(() => {
    if (!selectedTemplate) {
      return [] as TemplateVariable[];
    }

    return selectedTemplate.variables.filter(
      (variable) => variable.required && !(selectedValues[variable.key] ?? '').trim(),
    );
  }, [selectedTemplate, selectedValues]);

  const renderedPreview = useMemo(() => {
    if (!selectedTemplate) {
      return '';
    }

    return renderTemplatePreview(selectedTemplate, selectedValues);
  }, [selectedTemplate, selectedValues]);

  const visualPreview = useMemo(() => buildVisualPreview(renderedPreview), [renderedPreview]);
  const documentStats = useMemo(() => {
    if (!selectedTemplate) {
      return {
        sections: 0,
        variables: 0,
        requiredVariables: 0,
        references: 0,
      };
    }

    return {
      sections: visualPreview.sections.length,
      variables: selectedTemplate.variables.length,
      requiredVariables: selectedTemplate.variables.filter((variable) => Boolean(variable.required))
        .length,
      references: selectedTemplate.references?.length ?? 0,
    };
  }, [selectedTemplate, visualPreview]);

  const documentHighlights = useMemo(() => {
    if (!selectedTemplate) {
      return [] as Array<{ title: string; value: string }>;
    }

    return visualPreview.sections.slice(0, 3).map((section) => ({
      title: section.title,
      value: summarizeSection(section.lines) || copy.previewEmptySection,
    }));
  }, [selectedTemplate, visualPreview, copy.previewEmptySection]);

  const reportGeneratedAt = useMemo(
    () => formatDateTime(new Date().toISOString(), locale),
    [locale],
  );
  const reportLogoUrl = useMemo(() => `${window.location.origin}/assets/FaviconFinal.png`, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1500);
  };

  const copyToClipboard = async (value: string, successMessage = copy.copied) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(successMessage);
    } catch {
      showToast(copy.copyFailed);
    }
  };

  const updateVariableValue = (key: string, value: string) => {
    if (!selectedTemplate) {
      return;
    }

    setValuesByTemplateId((previousState) => ({
      ...previousState,
      [selectedTemplate.id]: {
        ...(previousState[selectedTemplate.id] ?? buildEmptyValues(selectedTemplate)),
        [key]: value,
      },
    }));
  };

  const prefillExamples = () => {
    if (!selectedTemplate) {
      return;
    }

    const prefilled: TemplateValues = {};
    for (const variable of selectedTemplate.variables) {
      prefilled[variable.key] = variable.example;
    }

    setValuesByTemplateId((previousState) => ({
      ...previousState,
      [selectedTemplate.id]: prefilled,
    }));
  };

  const resetValues = () => {
    if (!selectedTemplate) {
      return;
    }

    setValuesByTemplateId((previousState) => ({
      ...previousState,
      [selectedTemplate.id]: buildEmptyValues(selectedTemplate),
    }));
  };

  const openTemplate = (template: CyberTemplate) => {
    setPreviewMode('document');
    navigate(localizedPath(`/templates/${template.id}`));
  };

  const closeTemplate = () => {
    navigate(localizedPath('/templates'));
  };

  const downloadRenderedTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    const filename = `${selectedTemplate.id}-${slugify(selectedTemplate.title)}.md`;
    downloadMarkdown(filename, renderedPreview);
    showToast(copy.downloadSuccess);
  };

  const printDocumentPreview = () => {
    if (!selectedTemplate || !documentPreviewRef.current) {
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('aria-hidden', 'true');
    printFrame.tabIndex = -1;
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';
    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument = frameWindow?.document;
    if (!frameWindow || !frameDocument) {
      printFrame.remove();
      showToast(copy.printOpenFailed);
      return;
    }

    const printableHtml = documentPreviewRef.current.innerHTML;
    const docTitle = escapeHtml(`${selectedTemplate.id.toUpperCase()} - ${selectedTemplate.title}`);
    const cleanupFrame = () => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    };

    try {
      frameDocument.open();
      frameDocument.write(`<!doctype html>
<html lang="${isEnglish ? 'en' : 'fr'}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${docTitle}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 20px;
        background: #e8edf5;
        color: #0f172a;
        font-family: "Segoe UI", Arial, sans-serif;
      }
      .cg-report {
        max-width: 940px;
        margin: 0 auto;
      }
      .cg-report-page {
        margin: 0 auto 18px;
      }
      .cg-document-sheet {
        max-width: 920px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #d7deea;
        box-shadow: 0 22px 46px rgba(15, 23, 42, 0.14);
        border-radius: 8px;
        overflow: hidden;
      }
      .cg-cover {
        padding: 24px 28px 20px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(180deg, #f8fbff 0%, #ffffff 72%);
      }
      .cg-cover-top {
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .cg-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .cg-logo-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid #173f72;
        border-radius: 8px;
        background: linear-gradient(160deg, #0f2a4d 0%, #183f73 100%);
      }
      .cg-cover-main {
        display: grid;
        grid-template-columns: 1fr minmax(170px, 220px);
        gap: 16px;
        align-items: start;
      }
      .cg-cover-date {
        margin: 0;
        color: #64748b;
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-ref {
        margin: 0 0 8px;
        color: #4b6485;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-description {
        margin: 10px 0 0;
        color: #334155;
        font-size: 14px;
        line-height: 1.6;
      }
      .cg-priority-panel {
        border: 1px solid #c7d2df;
        border-radius: 6px;
        background: #ffffff;
        padding: 12px;
      }
      .cg-priority-label {
        margin: 0;
        color: #64748b;
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-priority-value {
        margin: 6px 0 4px;
        color: #0b2344;
        font-size: 20px;
        line-height: 1.2;
        font-weight: 800;
      }
      .cg-priority-meta {
        margin: 0;
        color: #4b6485;
        font-size: 12px;
      }
      .cg-chip-row {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cg-chip {
        border: 1px solid #d5deea;
        border-radius: 999px;
        background: #ffffff;
        padding: 4px 10px;
        color: #264266;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .cg-content {
        padding: 20px 28px 28px;
      }
      .cg-page-header {
        padding: 14px 22px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: #ffffff;
      }
      .cg-page-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cg-logo {
        width: 20px;
        height: 20px;
        object-fit: contain;
        border-radius: 4px;
      }
      .cg-page-title {
        margin: 0;
        color: #3f587a;
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-page-subtitle {
        margin: 2px 0 0;
        color: #102744;
        font-size: 13px;
        font-weight: 700;
      }
      .cg-page-counter {
        color: #516a8c;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .cg-summary-grid {
        margin-bottom: 14px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .cg-summary-card {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #f8fbff;
        padding: 12px;
      }
      .cg-summary-title {
        margin: 0 0 8px;
        color: #4b6485;
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-summary-value {
        margin: 0;
        color: #1f2f46;
        font-size: 13px;
        line-height: 1.55;
      }
      .cg-metrics {
        margin-bottom: 14px;
        border-bottom: 1px solid #e5e7eb;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        padding-bottom: 12px;
      }
      .cg-kicker {
        margin: 0;
        color: #4b6485;
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cg-title {
        margin: 0;
        color: #0b2344;
        font-size: 30px;
        line-height: 1.16;
      }
      .cg-metric {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;
        background: #ffffff;
      }
      .cg-metric-label {
        margin: 0;
        color: #4b6485;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
      }
      .cg-metric-value {
        margin: 6px 0 0;
        color: #0b2344;
        font-size: 22px;
        line-height: 1.05;
        font-weight: 800;
      }
      .cg-section-stack {
        display: grid;
        gap: 12px;
      }
      .cg-section {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 14px;
        background: #ffffff;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .cg-section-head {
        margin: 0 0 10px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .cg-section-index {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        border: 1px solid #d3dbe7;
        color: #375f96;
        background: #f5f9ff;
        font-size: 11px;
        font-weight: 700;
      }
      .cg-section-title {
        margin: 2px 0 0;
        color: #0b2344;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 800;
      }
      .cg-line {
        margin: 0 0 8px 0;
        color: #334155;
        font-size: 14px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }
      .cg-bullet {
        position: relative;
        padding-left: 14px;
      }
      .cg-bullet::before {
        content: "";
        position: absolute;
        left: 0;
        top: 10px;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #2f5ca8;
      }
      .cg-table-line {
        margin: 0 0 8px 0;
        font-family: Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 12px;
        color: #475569;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 6px 8px;
        overflow-wrap: anywhere;
      }
      .cg-reference-box {
        margin-top: 12px;
        border: 1px solid #d5deea;
        border-radius: 6px;
        background: #f8fbff;
        padding: 12px;
      }
      .cg-reference-title {
        margin: 0 0 8px;
        color: #21487c;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 800;
      }
      .cg-reference-list {
        margin: 0;
        padding-left: 18px;
      }
      .cg-reference-list li {
        margin-bottom: 6px;
        color: #334155;
        font-size: 13px;
        line-height: 1.5;
      }
      .cg-disclaimer-box {
        margin-top: 10px;
        border: 1px solid #f2d7a5;
        border-radius: 6px;
        background: #fff8eb;
        padding: 12px;
      }
      .cg-disclaimer-title {
        margin: 0 0 8px;
        color: #8a4b00;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 800;
      }
      .cg-disclaimer-list {
        margin: 0;
        padding-left: 18px;
      }
      .cg-disclaimer-list li {
        margin-bottom: 6px;
        color: #7c4700;
        font-size: 13px;
        line-height: 1.5;
      }
      .cg-governance-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .cg-approval-box {
        margin-top: 12px;
        border: 1px solid #d5deea;
        border-radius: 6px;
        background: #ffffff;
        padding: 14px;
      }
      .cg-approval-title {
        margin: 0 0 8px;
        color: #0f2a4d;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 800;
      }
      .cg-approval-note {
        margin: 0;
        color: #475569;
        font-size: 13px;
        line-height: 1.5;
      }
      .cg-signature-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .cg-signature-card {
        border: 1px solid #dce5ef;
        border-radius: 6px;
        padding: 10px;
        background: #f9fcff;
      }
      .cg-signature-label {
        margin: 0;
        color: #4a6384;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .cg-signature-line {
        margin-top: 28px;
        border-top: 1px solid #9aabc0;
      }
      .cg-signature-note {
        margin-top: 6px;
        color: #64748b;
        font-size: 11px;
      }
      .cg-footer {
        margin-top: 12px;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 11px;
        color: #64748b;
      }
      @page {
        size: A4;
        margin: 10mm;
      }
      @media (max-width: 900px) {
        .cg-cover {
          padding: 18px;
        }
        .cg-content {
          padding: 16px 18px 20px;
        }
        .cg-page-header {
          padding: 12px 16px;
        }
        .cg-cover-main {
          grid-template-columns: 1fr;
        }
        .cg-logo-wrap {
          width: 30px;
          height: 30px;
        }
        .cg-metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .cg-summary-grid {
          grid-template-columns: 1fr;
        }
        .cg-governance-grid {
          grid-template-columns: 1fr;
        }
        .cg-signature-grid {
          grid-template-columns: 1fr;
        }
      }
      @media print {
        body {
          background: #ffffff;
          padding: 0;
        }
        .cg-report {
          max-width: none;
        }
        .cg-report-page {
          margin: 0;
          break-after: page;
          page-break-after: always;
        }
        .cg-report-page:last-child {
          break-after: auto;
          page-break-after: auto;
        }
        .cg-document-sheet {
          max-width: none;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>${printableHtml}</body>
</html>`);
      frameDocument.close();

      let printTriggered = false;
      const triggerPrint = () => {
        if (printTriggered) {
          return;
        }
        printTriggered = true;
        frameWindow.focus();
        frameWindow.print();
      };

      frameWindow.addEventListener('afterprint', () => window.setTimeout(cleanupFrame, 200), {
        once: true,
      });
      window.setTimeout(triggerPrint, 220);
      window.setTimeout(cleanupFrame, 15000);
      showToast(copy.printReady);
    } catch {
      cleanupFrame();
      showToast(copy.printFailed);
    }
  };

  const templateSeoSchema = selectedTemplate
    ? {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: selectedTemplate.title,
        description: selectedTemplate.description,
        dateModified: selectedTemplate.updatedAt,
        keywords: selectedTemplate.tags.join(', '),
        url: localizedAbsolutePath(`/templates/${selectedTemplate.id}`),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: copy.seoCollectionTitle,
        url: localizedAbsolutePath('/templates'),
      };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Seo
        title={
          selectedTemplate
            ? `${selectedTemplate.title} (Template)`
            : copy.seoCollectionTitle
        }
        description={
          selectedTemplate ? selectedTemplate.description : copy.seoCollectionDescription
        }
        path={selectedTemplate ? localizedPath(`/templates/${selectedTemplate.id}`) : localizedPath('/templates')}
        image="/assets/og/playbooks.svg"
        keywords={
          selectedTemplate
            ? [...selectedTemplate.tags, selectedTemplate.category, selectedTemplate.priority]
            : isEnglish
              ? ['cybersecurity templates', 'incident response', 'policy', 'grc', 'vendor security']
              : ['templates cybersécurité', 'incident response', 'policy', 'grc', 'vendor security']
        }
        schema={templateSeoSchema}
      />

      <ShieldHeader
        title={copy.title}
        subtitle={copy.subtitle}
        meta={[copy.metaCustom, 'Offline', 'Export .md']}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <label className="relative lg:col-span-2">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel focus:bg-white"
              />
            </label>

            <label className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel focus:bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'Tous' ? copy.all : category}
                  </option>
                ))}
              </select>
            </label>

            <select
              value={activePriority}
              onChange={(event) => setActivePriority(event.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel focus:bg-white"
            >
              <option value="Tous">{copy.priorityAll}</option>
              <option value="Critique">Critique</option>
              <option value="Élevée">Élevée</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Faible">Faible</option>
            </select>

            <select
              value={activeAudience}
              onChange={(event) => setActiveAudience(event.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel focus:bg-white"
            >
              {audiences.map((audience) => (
                <option key={audience} value={audience}>
                  {copy.audiencePrefix}: {audience === 'Tous' ? copy.all : audience}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel focus:bg-white"
            >
              {SORT_OPTION_VALUES.map((optionValue) => (
                <option key={optionValue} value={optionValue}>
                  {copy.sortPrefix}:{' '}
                  {optionValue === 'priority_desc'
                    ? copy.sortPriority
                    : optionValue === 'title_asc'
                      ? copy.sortTitle
                      : copy.sortUpdated}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-sm border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setCollectionMode('essentials')}
                className={`rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  collectionMode === 'essentials'
                    ? 'bg-brand-navy text-white'
                    : 'text-slate-600 hover:text-brand-navy'
                }`}
              >
                {copy.collectionPremium} ({ESSENTIAL_TEMPLATE_IDS.length})
              </button>
              <button
                type="button"
                onClick={() => setCollectionMode('all')}
                className={`rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  collectionMode === 'all'
                    ? 'bg-brand-navy text-white'
                    : 'text-slate-600 hover:text-brand-navy'
                }`}
              >
                {copy.collectionAll} ({templates.length})
              </button>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600">
              <input
                type="checkbox"
                checked={withComplianceOnly}
                onChange={(event) => setWithComplianceOnly(event.target.checked)}
                className="h-4 w-4 rounded-sm border-slate-300 text-brand-steel focus:ring-brand-steel"
              />
              {copy.withCompliance}
            </label>
            <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
              {filteredTemplates.length} {copy.templateCountLabel} (
              {collectionMode === 'essentials' ? copy.collectionPremium : copy.collectionAll})
            </span>
          </div>
        </section>

        {filteredTemplates.length === 0 ? (
          <section className="rounded-sm border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {copy.noTemplate}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => {
              const shownAudiences = template.audiences.slice(0, 2);
              const hiddenAudienceCount = template.audiences.length - shownAudiences.length;

              return (
                <article
                  key={template.id}
                  className="group overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-steel/50 hover:shadow-md"
                >
                  <div className={`h-1 ${getPriorityStripeClass(template.priority)}`}></div>
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge color={getPriorityColor(template.priority)}>
                          {template.priority}
                        </Badge>
                        <Badge color="mono">{template.category}</Badge>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{template.id}</span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold leading-tight text-brand-navy">
                      {template.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                      {template.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {shownAudiences.map((audience) => (
                        <Badge key={audience} color="steel" className="normal-case">
                          {audience}
                        </Badge>
                      ))}
                      {hiddenAudienceCount > 0 && (
                        <Badge color="mono">+{hiddenAudienceCount}</Badge>
                      )}
                    </div>

                    <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {copy.updatedShort} {formatDate(template.updatedAt, locale)}
                    </div>

                    <button
                      type="button"
                      onClick={() => openTemplate(template)}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-steel transition-colors hover:text-brand-navy"
                      aria-label={`${copy.openTemplateAria} ${template.title}`}
                    >
                      {copy.openTemplate} <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <Drawer
          isOpen={Boolean(selectedTemplate)}
          onClose={closeTemplate}
          size="xl"
          title={
            selectedTemplate
              ? `${selectedTemplate.id.toUpperCase()} — ${copy.drawerTitleSuffix}`
              : copy.title
          }
        >
          {selectedTemplate && (
            <div className="space-y-6">
              {toastMessage && (
                <div className="sticky top-0 z-10 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-mono text-emerald-800">
                  {toastMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={closeTemplate}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-brand-navy"
                >
                  <ArrowLeft size={14} /> {copy.drawerBack}
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} /> {formatDate(selectedTemplate.updatedAt, locale)}
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-3xl font-bold leading-tight text-brand-navy">
                  {selectedTemplate.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selectedTemplate.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge color={getPriorityColor(selectedTemplate.priority)}>
                    {selectedTemplate.priority}
                  </Badge>
                  <Badge color="mono">{selectedTemplate.category}</Badge>
                  {selectedTemplate.audiences.map((audience) => (
                    <Badge key={audience} color="steel" className="normal-case">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                  <FileText size={14} className="text-brand-steel" /> {copy.variables}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedTemplate.variables.map((variable) => (
                    <label key={variable.key} className="min-w-0 space-y-1 text-xs text-slate-600">
                      <span className="font-bold uppercase tracking-wide text-slate-500">
                        {variable.label}
                      </span>
                      {variable.type === 'textarea' ? (
                        <textarea
                          value={selectedValues[variable.key] ?? ''}
                          onChange={(event) =>
                            updateVariableValue(variable.key, event.target.value)
                          }
                          onKeyDown={(event) => event.stopPropagation()}
                          placeholder={`Ex: ${variable.example}`}
                          wrap="soft"
                          spellCheck={false}
                          className="min-h-[88px] w-full max-w-full resize-y overflow-auto rounded-sm border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-colors [overflow-wrap:anywhere] break-words focus:border-brand-steel"
                        />
                      ) : (
                        <input
                          type={getInputType(variable)}
                          inputMode={getInputMode(variable)}
                          value={selectedValues[variable.key] ?? ''}
                          onChange={(event) =>
                            updateVariableValue(variable.key, event.target.value)
                          }
                          onKeyDown={(event) => event.stopPropagation()}
                          placeholder={`Ex: ${variable.example}`}
                          spellCheck={false}
                          autoComplete="off"
                          className="w-full min-w-0 rounded-sm border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-steel"
                        />
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" icon={Wand2} onClick={prefillExamples}>
                    {copy.prefill}
                  </Button>
                  <Button variant="outline" size="sm" icon={RefreshCcw} onClick={resetValues}>
                    {copy.reset}
                  </Button>
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                    <Tags size={14} className="text-brand-steel" /> {copy.preview}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-sm border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('visual')}
                        className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          previewMode === 'visual'
                            ? 'bg-brand-navy text-white'
                            : 'text-slate-600 hover:text-brand-navy'
                        }`}
                      >
                        {copy.previewVisual}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('document')}
                        className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          previewMode === 'document'
                            ? 'bg-brand-navy text-white'
                            : 'text-slate-600 hover:text-brand-navy'
                        }`}
                      >
                        {copy.previewDocument}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('markdown')}
                        className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          previewMode === 'markdown'
                            ? 'bg-brand-navy text-white'
                            : 'text-slate-600 hover:text-brand-navy'
                        }`}
                      >
                        Markdown
                      </button>
                    </div>
                    {missingRequiredVariables.length > 0 && (
                      <Badge color="alert">
                        {copy.missingVariables} ({missingRequiredVariables.length})
                      </Badge>
                    )}
                  </div>
                </div>

                {missingRequiredVariables.length > 0 && (
                  <div className="mb-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <div className="mb-1 inline-flex items-center gap-1 font-bold uppercase tracking-wide">
                      <AlertTriangle size={12} /> {copy.fillLabel}
                    </div>
                    {missingRequiredVariables.map((variable) => variable.label).join(', ')}
                  </div>
                )}

                {previewMode === 'visual' ? (
                  <div className="space-y-4">
                    <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        {copy.renderedTitle}
                      </p>
                      <h4 className="mt-2 text-lg font-bold leading-tight text-brand-navy [overflow-wrap:anywhere]">
                        {visualPreview.headline}
                      </h4>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      {visualPreview.sections.map((section, sectionIndex) => (
                        <article
                          key={`${section.title}-${sectionIndex}`}
                          className="rounded-sm border border-slate-200 bg-white p-4"
                        >
                          <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-navy">
                            {section.title}
                          </h5>
                          <div className="space-y-2 text-sm leading-relaxed text-slate-700">
                            {section.lines.map((line, lineIndex) => {
                              if (line.startsWith('- ') || line.startsWith('* ')) {
                                return (
                                  <div
                                    key={`${line}-${lineIndex}`}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-steel"></span>
                                    <span className="[overflow-wrap:anywhere] break-words">
                                      {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                                    </span>
                                  </div>
                                );
                              }

                              if (line.startsWith('|')) {
                                return (
                                  <p
                                    key={`${line}-${lineIndex}`}
                                    className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600 [overflow-wrap:anywhere]"
                                  >
                                    {line}
                                  </p>
                                );
                              }

                              return (
                                <p
                                  key={`${line}-${lineIndex}`}
                                  className="[overflow-wrap:anywhere] break-words"
                                >
                                  {renderInlineMarkdown(line)}
                                </p>
                              );
                            })}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : previewMode === 'document' ? (
                  <div className="rounded-sm border border-slate-200 bg-slate-100 p-4">
                    <div
                      ref={documentPreviewRef}
                      className="cg-report mx-auto w-full max-w-[940px]"
                    >
                      <section className="cg-document-sheet overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.14)]">
                        <header className="cg-cover border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-5">
                          <div className="cg-cover-top mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="cg-brand">
                              <span
                                className="cg-logo-wrap"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '56px',
                                  height: '56px',
                                  padding: '8px',
                                  border: '1px solid #c8d4e4',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  background: '#ffffff',
                                }}
                              >
                                <img
                                  src={reportLogoUrl}
                                  alt=""
                                  aria-hidden="true"
                                  width={192}
                                  height={192}
                                  className="cg-logo"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block',
                                    imageRendering: 'auto',
                                  }}
                                />
                              </span>
                              <p className="cg-kicker text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
                                CYBER GUIDE • RAPPORT TEMPLATE
                              </p>
                            </div>
                            <p className="cg-cover-date text-[10px] font-mono uppercase tracking-[0.08em] text-slate-500">
                              {copy.generatedAt} {reportGeneratedAt}
                            </p>
                          </div>

                          <div className="cg-cover-main grid gap-4 md:grid-cols-[1fr_220px]">
                            <div>
                              <p className="cg-ref mb-2 text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500">
                                {selectedTemplate.id.toUpperCase()} • {selectedTemplate.category}
                              </p>
                              <h4 className="cg-title text-3xl font-bold leading-tight text-brand-navy [overflow-wrap:anywhere]">
                                {visualPreview.headline}
                              </h4>
                              <p className="cg-description mt-3 text-sm leading-relaxed text-slate-700">
                                {selectedTemplate.description}
                              </p>
                            </div>
                            <div className="cg-priority-panel rounded-sm border border-slate-200 bg-white p-3">
                              <p className="cg-priority-label text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500">
                                {copy.priority}
                              </p>
                              <p className="cg-priority-value mt-1 text-2xl font-bold text-brand-navy">
                                {selectedTemplate.priority}
                              </p>
                              <p className="cg-priority-meta text-xs text-slate-600">
                                {copy.updatedOn}: {formatDate(selectedTemplate.updatedAt, locale)}
                              </p>
                            </div>
                          </div>

                          <div className="cg-chip-row mt-3 flex flex-wrap gap-2">
                            <span className="cg-chip rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-navy">
                              {selectedTemplate.category}
                            </span>
                            {selectedTemplate.audiences.slice(0, 3).map((audience) => (
                              <span
                                key={`doc-audience-${audience}`}
                                className="cg-chip rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-700"
                              >
                                {audience}
                              </span>
                            ))}
                            {selectedTemplate.audiences.length > 3 && (
                              <span className="cg-chip rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                +{selectedTemplate.audiences.length - 3}
                              </span>
                            )}
                          </div>
                        </header>

                        <div className="cg-content space-y-4 px-6 py-5">
                          <div className="cg-summary-grid grid gap-3 md:grid-cols-3">
                            {documentHighlights.map((item) => (
                              <article
                                key={`doc-highlight-${item.title}`}
                                className="cg-summary-card rounded-sm border border-slate-200 bg-slate-50 p-3"
                              >
                                <p className="cg-summary-title mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                  {item.title}
                                </p>
                                <p className="cg-summary-value text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                                  {item.value}
                                </p>
                              </article>
                            ))}
                          </div>

                          <div className="cg-metrics grid gap-3 border-b border-slate-200 pb-3 md:grid-cols-4">
                            <article className="cg-metric">
                              <p className="cg-metric-label">{copy.sections}</p>
                              <p className="cg-metric-value">{documentStats.sections}</p>
                            </article>
                            <article className="cg-metric">
                              <p className="cg-metric-label">{copy.variables}</p>
                              <p className="cg-metric-value">{documentStats.variables}</p>
                            </article>
                            <article className="cg-metric">
                              <p className="cg-metric-label">{copy.required}</p>
                              <p className="cg-metric-value">{documentStats.requiredVariables}</p>
                            </article>
                            <article className="cg-metric">
                              <p className="cg-metric-label">{copy.references}</p>
                              <p className="cg-metric-value">{documentStats.references}</p>
                            </article>
                          </div>

                          <div className="cg-section-stack space-y-3">
                            {visualPreview.sections.map((section, sectionIndex) => (
                              <article
                                key={`doc-${section.title}-${sectionIndex}`}
                                className="cg-section rounded-sm border border-slate-200 bg-white p-4"
                              >
                                <div className="cg-section-head mb-3 flex items-start gap-2">
                                  <span className="cg-section-index inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-brand-steel">
                                    {sectionIndex + 1}
                                  </span>
                                  <h5 className="cg-section-title pt-0.5 text-xs font-bold uppercase tracking-[0.08em] text-brand-navy">
                                    {section.title}
                                  </h5>
                                </div>

                                <div className="space-y-2">
                                  {section.lines.map((line, lineIndex) => {
                                    if (line.startsWith('- ') || line.startsWith('* ')) {
                                      return (
                                        <p
                                          key={`doc-line-${sectionIndex}-${lineIndex}-${line}`}
                                          className="cg-line cg-bullet text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]"
                                        >
                                          {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                                        </p>
                                      );
                                    }

                                    if (line.startsWith('|')) {
                                      return (
                                        <p
                                          key={`doc-table-${sectionIndex}-${lineIndex}-${line}`}
                                          className="cg-table-line rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600 [overflow-wrap:anywhere]"
                                        >
                                          {line}
                                        </p>
                                      );
                                    }

                                    return (
                                      <p
                                        key={`doc-text-${sectionIndex}-${lineIndex}-${line}`}
                                        className="cg-line text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]"
                                      >
                                        {renderInlineMarkdown(line)}
                                      </p>
                                    );
                                  })}
                                </div>
                              </article>
                            ))}
                          </div>

                          <div className="cg-governance-grid grid gap-3 md:grid-cols-2">
                            <section className="cg-reference-box rounded-sm border border-slate-200 bg-slate-50 p-4">
                              <h5 className="cg-reference-title mb-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-navy">
                                {copy.frameworkReferences}
                              </h5>
                              {selectedTemplate.references &&
                              selectedTemplate.references.length > 0 ? (
                                <ul className="cg-reference-list space-y-1 text-sm text-slate-700">
                                  {selectedTemplate.references.map((reference) => (
                                    <li key={`doc-ref-${reference.name}-${reference.note ?? ''}`}>
                                      <span className="font-semibold">{reference.name}</span>
                                      {reference.note ? ` — ${reference.note}` : ''}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-600">
                                  {copy.frameworkFallback}
                                </p>
                              )}
                            </section>

                            <section className="cg-disclaimer-box rounded-sm border border-amber-200 bg-amber-50 p-4">
                              <h5 className="cg-disclaimer-title mb-2 text-xs font-bold uppercase tracking-[0.1em] text-amber-900">
                                {copy.limitsValidation}
                              </h5>
                              {selectedTemplate.disclaimers &&
                              selectedTemplate.disclaimers.length > 0 ? (
                                <ul className="cg-disclaimer-list space-y-1 text-sm text-amber-900">
                                  {selectedTemplate.disclaimers.map((disclaimer) => (
                                    <li key={`doc-disclaimer-${disclaimer}`}>{disclaimer}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-amber-900">
                                  {copy.limitsFallback}
                                </p>
                              )}
                            </section>
                          </div>

                          <section className="cg-approval-box rounded-sm border border-slate-200 bg-white p-4">
                            <h5 className="cg-approval-title mb-2 text-xs font-bold uppercase tracking-[0.08em] text-brand-navy">
                              {copy.approvalBlock}
                            </h5>
                            <p className="cg-approval-note text-sm text-slate-600">
                              {copy.approvalNote}
                            </p>

                            <div className="cg-signature-grid mt-3 grid gap-3 md:grid-cols-3">
                              <article className="cg-signature-card rounded-sm border border-slate-200 bg-slate-50 p-3">
                                <p className="cg-signature-label text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                  {copy.draftedBy}
                                </p>
                                <div className="cg-signature-line mt-7 border-t border-slate-300"></div>
                                <p className="cg-signature-note mt-1 text-[11px] text-slate-500">
                                  {copy.signatureMeta}
                                </p>
                              </article>
                              <article className="cg-signature-card rounded-sm border border-slate-200 bg-slate-50 p-3">
                                <p className="cg-signature-label text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                  {copy.validatedBy}
                                </p>
                                <div className="cg-signature-line mt-7 border-t border-slate-300"></div>
                                <p className="cg-signature-note mt-1 text-[11px] text-slate-500">
                                  {copy.signatureMeta}
                                </p>
                              </article>
                              <article className="cg-signature-card rounded-sm border border-slate-200 bg-slate-50 p-3">
                                <p className="cg-signature-label text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                  {copy.managementApproval}
                                </p>
                                <div className="cg-signature-line mt-7 border-t border-slate-300"></div>
                                <p className="cg-signature-note mt-1 text-[11px] text-slate-500">
                                  {copy.signatureApproval}
                                </p>
                              </article>
                            </div>
                          </section>

                          <footer className="cg-footer">
                            <span>
                              {selectedTemplate.id.toUpperCase()} • {selectedTemplate.category}
                            </span>
                            <span>
                              {copy.targetAudience}: {selectedTemplate.audiences.join(' / ')} •{' '}
                              {reportGeneratedAt}
                            </span>
                          </footer>
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <pre className="max-h-[420px] overflow-auto rounded-sm border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-brand-light [overflow-wrap:anywhere] whitespace-pre-wrap">
                    {renderedPreview}
                  </pre>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {previewMode === 'document' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Printer}
                      onClick={printDocumentPreview}
                    >
                      {copy.printReport}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Copy}
                    onClick={() => copyToClipboard(renderedPreview, copy.copiedRendered)}
                  >
                    {copy.copyRendered}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={downloadRenderedTemplate}
                  >
                    {copy.downloadMd}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Copy}
                    onClick={() => copyToClipboard(selectedTemplate.content, copy.copiedRaw)}
                  >
                    {copy.copyRaw}
                  </Button>
                </div>
              </section>

              {selectedTemplate.tags.length > 0 && (
                <section className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                    {isEnglish ? 'Tags' : 'Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} color="mono">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {selectedTemplate.references && selectedTemplate.references.length > 0 && (
                <section className="rounded-sm border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-navy">
                    {copy.references}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {selectedTemplate.references.map((reference) => (
                      <li key={`${reference.name}-${reference.note ?? ''}`}>
                        <span className="font-medium">{reference.name}</span>
                        {reference.note ? ` — ${reference.note}` : ''}
                        {reference.url ? (
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-brand-steel hover:text-brand-navy"
                          >
                            {isEnglish ? '(link)' : '(lien)'}
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selectedTemplate.disclaimers && selectedTemplate.disclaimers.length > 0 && (
                <section className="rounded-sm border border-amber-200 bg-amber-50 p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-900">
                    {copy.limitsValidation}
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-900">
                    {selectedTemplate.disclaimers.map((disclaimer) => (
                      <li key={disclaimer} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-700"></span>
                        <span>{disclaimer}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </Drawer>

        <div className="mt-8">
          <TechSeparator />
        </div>
      </div>
    </div>
  );
};

export default Templates;
