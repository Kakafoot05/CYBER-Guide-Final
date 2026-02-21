import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ShieldHeader,
  Button,
  Badge,
  Drawer,
  TechSeparator,
  type BadgeColor,
} from '../components/UI';
import type { Analysis, Playbook } from '../types';
import {
  Search,
  AlertTriangle,
  Shield,
  CheckSquare,
  Terminal,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Printer,
  Copy,
  MessageSquare,
  Clock,
  Gauge,
  Filter,
  PlayCircle,
  RotateCcw,
  Download,
  ClipboardCheck,
  Link2,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import { getLocalizedContent } from '../utils/contentLocale';
import {
  localizePlaybookCategory,
  localizePlaybookDifficulty,
  localizePlaybookSeverity,
} from '../utils/labels';

type SortOption = 'severity_desc' | 'title_asc' | 'id_asc';

type RunState = {
  startedAt: string;
  checkedSteps: Record<string, boolean>;
  notesGlobal: string;
  notesByStep: Record<string, string>;
  updatedAt: string;
};

const ALL_FILTER_VALUE = 'Tous';

const SEVERITY_ORDER: Record<Playbook['severity'], number> = {
  Critique: 4,
  Élevée: 3,
  Moyenne: 2,
  Faible: 1,
};

const SORT_OPTIONS: SortOption[] = ['severity_desc', 'title_asc', 'id_asc'];

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const nowIso = (): string => new Date().toISOString();

const getRunStorageKey = (playbookId: string): string => `cg_playbook_run_${playbookId}`;

const getSeverityColor = (severity: string): BadgeColor => {
  const normalized = severity.toLowerCase();

  if (normalized.includes('crit')) return 'alert';
  if (normalized.includes('elev')) return 'gold';
  if (normalized.includes('moy')) return 'steel';

  return 'navy';
};

const getSeverityStripeClass = (severity: string): string => {
  const color = getSeverityColor(severity);

  if (color === 'alert') return 'bg-red-500';
  if (color === 'gold') return 'bg-brand-gold';
  if (color === 'steel') return 'bg-brand-steel';
  return 'bg-brand-navy';
};

const extractPlaybookOrder = (id: string): number => {
  const match = id.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
};

const comparePlaybookId = (a: string, b: string): number => {
  const delta = extractPlaybookOrder(a) - extractPlaybookOrder(b);
  if (delta !== 0) return delta;
  return a.localeCompare(b, 'fr', { sensitivity: 'base' });
};

const buildSearchIndex = (playbook: Playbook): string => {
  const operationalBriefText = playbook.operationalBrief
    ? [
        playbook.operationalBrief.context,
        playbook.operationalBrief.objective,
        playbook.operationalBrief.businessRisk,
        playbook.operationalBrief.keyChecks.join(' '),
        playbook.operationalBrief.escalationSignals.join(' '),
        playbook.operationalBrief.handoffTo.join(' '),
      ].join(' ')
    : '';

  const stepsText = playbook.steps
    .map((step) => `${step.title} ${step.description} ${step.command ?? ''}`)
    .join(' ');

  return normalizeText(
    [
      playbook.id,
      playbook.title,
      playbook.description,
      playbook.category,
      playbook.severity,
      playbook.difficulty ?? '',
      playbook.estimatedTime ?? '',
      playbook.triggers.join(' '),
      playbook.prerequisites.join(' '),
      playbook.artifacts.join(' '),
      operationalBriefText,
      stepsText,
    ].join(' '),
  );
};

const buildInitialRunState = (playbook: Playbook): RunState => {
  const checkedSteps: Record<string, boolean> = {};
  const notesByStep: Record<string, string> = {};

  for (const step of playbook.steps) {
    checkedSteps[step.id] = false;
    notesByStep[step.id] = '';
  }

  const timestamp = nowIso();

  return {
    startedAt: timestamp,
    checkedSteps,
    notesGlobal: '',
    notesByStep,
    updatedAt: timestamp,
  };
};

const hydrateRunState = (playbook: Playbook, rawState: string | null): RunState => {
  const fallback = buildInitialRunState(playbook);
  if (!rawState) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawState) as Partial<RunState>;
    const checkedSteps: Record<string, boolean> = {};
    const notesByStep: Record<string, string> = {};

    for (const step of playbook.steps) {
      checkedSteps[step.id] = Boolean(parsed.checkedSteps?.[step.id]);
      notesByStep[step.id] =
        typeof parsed.notesByStep?.[step.id] === 'string' ? parsed.notesByStep[step.id] : '';
    }

    return {
      startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : fallback.startedAt,
      checkedSteps,
      notesGlobal: typeof parsed.notesGlobal === 'string' ? parsed.notesGlobal : '',
      notesByStep,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
};

const formatTimestamp = (isoDate: string, locale: 'fr-FR' | 'en-US'): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

type PlaybookExportCopy = {
  executionReportTitle: string;
  meta: string;
  title: string;
  severity: string;
  category: string;
  estimatedTime: string;
  difficulty: string;
  startedAt: string;
  updatedAt: string;
  operationalBrief: string;
  context: string;
  objective: string;
  businessRisk: string;
  keyChecks: string;
  escalationCriteria: string;
  coordination: string;
  triggers: string;
  prerequisites: string;
  incidentNotes: string;
  noGlobalNote: string;
  steps: string;
  step: string;
  command: string;
  warning: string;
  stepNote: string;
  noStepNote: string;
  artifacts: string;
  definitionOfDone: string;
  linkedAnalyses: string;
};

const buildPlaybookExportMarkdown = (
  playbook: Playbook,
  runState: RunState,
  relatedAnalyses: Analysis[],
  copy: PlaybookExportCopy,
): string => {
  const lines: string[] = [];
  const difficulty = playbook.difficulty ?? '—';
  const estimatedTime = playbook.estimatedTime ?? '—';

  lines.push(`# ${copy.executionReportTitle} - ${playbook.title}`);
  lines.push('');
  lines.push(`## ${copy.meta}`);
  lines.push(`- ID: ${playbook.id}`);
  lines.push(`- ${copy.title}: ${playbook.title}`);
  lines.push(`- ${copy.severity}: ${playbook.severity}`);
  lines.push(`- ${copy.category}: ${playbook.category}`);
  lines.push(`- ${copy.estimatedTime}: ${estimatedTime}`);
  lines.push(`- ${copy.difficulty}: ${difficulty}`);
  lines.push(`- ${copy.startedAt}: ${runState.startedAt}`);
  lines.push(`- ${copy.updatedAt}: ${runState.updatedAt}`);

  if (playbook.operationalBrief) {
    lines.push('');
    lines.push(`## ${copy.operationalBrief}`);
    lines.push(`- ${copy.context}: ${playbook.operationalBrief.context}`);
    lines.push(`- ${copy.objective}: ${playbook.operationalBrief.objective}`);
    lines.push(`- ${copy.businessRisk}: ${playbook.operationalBrief.businessRisk}`);
    lines.push(`- ${copy.keyChecks}:`);
    for (const item of playbook.operationalBrief.keyChecks) {
      lines.push(`  - ${item}`);
    }
    lines.push(`- ${copy.escalationCriteria}:`);
    for (const item of playbook.operationalBrief.escalationSignals) {
      lines.push(`  - ${item}`);
    }
    lines.push(`- ${copy.coordination}:`);
    for (const item of playbook.operationalBrief.handoffTo) {
      lines.push(`  - ${item}`);
    }
  }

  lines.push('');
  lines.push(`## ${copy.triggers}`);
  for (const trigger of playbook.triggers) {
    lines.push(`- ${trigger}`);
  }

  lines.push('');
  lines.push(`## ${copy.prerequisites}`);
  for (const prerequisite of playbook.prerequisites) {
    lines.push(`- ${prerequisite}`);
  }

  lines.push('');
  lines.push(`## ${copy.incidentNotes}`);
  lines.push(runState.notesGlobal.trim() || copy.noGlobalNote);

  lines.push('');
  lines.push(`## ${copy.steps}`);
  playbook.steps.forEach((step, index) => {
    const checked = runState.checkedSteps[step.id] ? 'x' : ' ';
    lines.push('');
    lines.push(`### [${checked}] ${copy.step} ${index + 1} - ${step.title}`);
    lines.push(step.description);

    if (step.command) {
      lines.push(`${copy.command}:`);
      lines.push('```');
      lines.push(step.command);
      lines.push('```');
    }

    if (step.warning) {
      lines.push(`${copy.warning}: ${step.warning}`);
    }

    const note = runState.notesByStep[step.id]?.trim();
    lines.push(`${copy.stepNote}: ${note || copy.noStepNote}`);
  });

  lines.push('');
  lines.push(`## ${copy.artifacts}`);
  for (const artifact of playbook.artifacts) {
    lines.push(`- ${artifact}`);
  }

  lines.push('');
  lines.push(`## ${copy.definitionOfDone}`);
  for (const item of playbook.definitionOfDone) {
    lines.push(`- [ ] ${item}`);
  }

  if (relatedAnalyses.length > 0) {
    lines.push('');
    lines.push(`## ${copy.linkedAnalyses}`);
    for (const analysis of relatedAnalyses) {
      lines.push(`- ${analysis.title} (/analyses/${analysis.slug})`);
    }
  }

  return lines.join('\n');
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

// /playbooks and /playbooks/:id intentionally share one component for deep-link + list continuity.
const Playbooks: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const uiLocale = isEnglish ? 'en-US' : 'fr-FR';
  const { analyses, playbooks } = useMemo(() => getLocalizedContent(locale), [locale]);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: routePlaybookIdParam } = useParams<{ id?: string }>();

  const copy = isEnglish
    ? {
        pageTitle: 'Procedures and Playbooks',
        pageSubtitle: 'Operational response and containment workflows',
        pageMeta: ['IR', 'SOC', 'Crisis management'],
        searchLabel: 'Search',
        searchPlaceholder: 'Search by title, trigger, artifact, command...',
        category: 'Category',
        difficulty: 'Difficulty',
        severity: 'Severity',
        all: 'All',
        withCommandsOnly: 'With commands only',
        availablePlaybooks: 'playbooks available',
        sortLabel: 'Sort',
        sortSeverity: 'Severity (Critical > Low)',
        sortTitle: 'Title (A->Z)',
        sortId: 'Reference (pb-001...)',
        recommendedPath: 'Recommended path',
        recommendedBody:
          'Need a complete framework before execution? Start with pillar guides, then open linked playbooks.',
        openGuides: 'Open guides',
        seeAnalyses: 'See analyses too',
        noResults: 'No playbook matches these filters.',
        openPlaybookAria: 'Open playbook',
        steps: 'Steps',
        open: 'Open',
        printHeaderRef: 'REF',
        printHeaderSeverity: 'SEVERITY',
        context: 'Context',
        objective: 'Objective',
        businessRisk: 'Business risk',
        backToList: 'Back to list',
        runMode: 'Execution mode',
        runModeActive: 'Execution mode enabled',
        print: 'Print',
        estimatedTime: 'Estimated time',
        operationalNotebook: 'Operational notebook',
        fieldGuideFormat: 'Field guide format',
        summary: 'Summary',
        chapter: 'Chapter',
        keyChecks: 'Key checks',
        escalationCriteria: 'Escalation criteria',
        linkedAnalyses: 'Linked analyses',
        runModeIncident: 'Incident run mode',
        completed: 'Completed',
        startedAt: 'Started at',
        updatedAt: 'Last update',
        notesPlaceholder: 'Context, assumptions, decisions, escalations...',
        copyExport: 'Copy export',
        downloadMd: 'Download .md',
        reset: 'Reset',
        resetDone: 'Execution state reset',
        exportGenerated: 'Export generated ✅',
        exportCopied: 'Export copied ✅',
        downloadSuccess: '.md file downloaded ✅',
        toastCopyOk: 'Copied ✅',
        toastCopyFailed: 'Copy failed',
        triggerSection: 'Triggers',
        prerequisitesSection: 'Prerequisites',
        commandCopied: 'Command copied ✅',
        copyCommandAria: 'Copy command for step',
        copyCommand: 'Copy',
        stepNote: 'Step note',
        artifactsToCollect: 'Artifacts to collect',
        messageTemplates: 'Communication templates',
        templateCopied: 'Template copied ✅',
        definitionOfDone: 'Definition of done (closure)',
        printPlaybook: 'Print playbook',
        export: {
          executionReportTitle: 'Execution report',
          meta: 'Metadata',
          title: 'Title',
          severity: 'Severity',
          category: 'Category',
          estimatedTime: 'Estimated time',
          difficulty: 'Difficulty',
          startedAt: 'Started at',
          updatedAt: 'Last updated',
          operationalBrief: 'Operational brief',
          context: 'Context',
          objective: 'Objective',
          businessRisk: 'Business risk',
          keyChecks: 'Key checks',
          escalationCriteria: 'Escalation criteria',
          coordination: 'Coordination',
          triggers: 'Triggers',
          prerequisites: 'Prerequisites',
          incidentNotes: 'Incident notes (global)',
          noGlobalNote: 'No global note.',
          steps: 'Steps',
          step: 'Step',
          command: 'Command',
          warning: 'Warning',
          stepNote: 'Step note',
          noStepNote: 'No note.',
          artifacts: 'Artifacts',
          definitionOfDone: 'Definition of done',
          linkedAnalyses: 'Linked analyses',
        } satisfies PlaybookExportCopy,
      }
    : {
        pageTitle: 'Procédures & Playbooks',
        pageSubtitle: 'Réponse opérationnelle et confinement',
        pageMeta: ['IR', 'SOC', 'Gestion de crise'],
        searchLabel: 'Recherche',
        searchPlaceholder: 'Rechercher par titre, déclencheur, artefact, commande...',
        category: 'Catégorie',
        difficulty: 'Difficulté',
        severity: 'Sévérité',
        all: 'Tous',
        withCommandsOnly: 'Avec commandes uniquement',
        availablePlaybooks: 'playbooks disponibles',
        sortLabel: 'Tri',
        sortSeverity: 'Sévérité (Critique > Faible)',
        sortTitle: 'Titre (A->Z)',
        sortId: 'Référence (pb-001...)',
        recommendedPath: 'Parcours recommandé',
        recommendedBody:
          "Besoin d'un cadre complet avant exécution ? Commencez par les guides piliers puis ouvrez les playbooks liés.",
        openGuides: 'Ouvrir les guides',
        seeAnalyses: 'Voir aussi les analyses',
        noResults: 'Aucun playbook ne correspond à ces filtres.',
        openPlaybookAria: 'Ouvrir le playbook',
        steps: 'Étapes',
        open: 'Ouvrir',
        printHeaderRef: 'REF',
        printHeaderSeverity: 'SÉVÉRITÉ',
        context: 'Contexte',
        objective: 'Objectif',
        businessRisk: 'Risque métier',
        backToList: 'Retour à la liste',
        runMode: 'Mode exécution',
        runModeActive: 'Mode exécution actif',
        print: 'Imprimer',
        estimatedTime: 'Temps estimé',
        operationalNotebook: 'Carnet opérationnel',
        fieldGuideFormat: 'Format guide terrain',
        summary: 'Sommaire',
        chapter: 'Chapitre',
        keyChecks: 'Vérifications clés',
        escalationCriteria: "Critères d'escalade",
        linkedAnalyses: 'Analyses liées',
        runModeIncident: 'Mode exécution incident',
        completed: 'Complété',
        startedAt: 'Démarré',
        updatedAt: 'Dernière MÀJ',
        notesPlaceholder: 'Contexte, hypothèses, décisions, escalades...',
        copyExport: "Copier l'export",
        downloadMd: 'Télécharger .md',
        reset: 'Réinitialiser',
        resetDone: 'État exécution réinitialisé',
        exportGenerated: 'Export généré ✅',
        exportCopied: 'Export copié ✅',
        downloadSuccess: 'Fichier .md téléchargé ✅',
        toastCopyOk: 'Copie ✅',
        toastCopyFailed: 'Copie impossible',
        triggerSection: 'Déclencheurs',
        prerequisitesSection: 'Pré-requis',
        commandCopied: 'Commande copiée ✅',
        copyCommandAria: "Copier la commande de l'étape",
        copyCommand: 'Copier',
        stepNote: 'Note étape',
        artifactsToCollect: 'Preuves à collecter (Artifacts)',
        messageTemplates: 'Templates de communication',
        templateCopied: 'Template copié ✅',
        definitionOfDone: 'Definition of Done (Clôture)',
        printPlaybook: 'Imprimer le Playbook',
        export: {
          executionReportTitle: "Rapport d'exécution",
          meta: 'Meta',
          title: 'Titre',
          severity: 'Sévérité',
          category: 'Catégorie',
          estimatedTime: 'Temps estimé',
          difficulty: 'Difficulté',
          startedAt: 'Démarré le',
          updatedAt: 'Dernière mise à jour',
          operationalBrief: 'Brief opérationnel',
          context: 'Contexte',
          objective: 'Objectif',
          businessRisk: 'Risque métier',
          keyChecks: 'Vérifications clés',
          escalationCriteria: "Critères d'escalade",
          coordination: 'Coordination',
          triggers: 'Déclencheurs',
          prerequisites: 'Pré-requis',
          incidentNotes: 'Notes incident (global)',
          noGlobalNote: 'Aucune note globale.',
          steps: 'Étapes',
          step: 'Étape',
          command: 'Commande',
          warning: 'Avertissement',
          stepNote: 'Note étape',
          noStepNote: 'Aucune note.',
          artifacts: 'Artifacts',
          definitionOfDone: 'Definition of Done',
          linkedAnalyses: 'Analyses liées',
        } satisfies PlaybookExportCopy,
      };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER_VALUE);
  const [activeDifficulty, setActiveDifficulty] = useState(ALL_FILTER_VALUE);
  const [activeSeverity, setActiveSeverity] = useState(ALL_FILTER_VALUE);
  const [withCommandsOnly, setWithCommandsOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('severity_desc');

  const [isRunMode, setIsRunMode] = useState(false);
  const [runStateByPlaybookId, setRunStateByPlaybookId] = useState<Record<string, RunState>>({});
  const [generatedExport, setGeneratedExport] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const routePlaybookId = routePlaybookIdParam?.toLowerCase() ?? null;
  const legacyPlaybookId = searchParams.get('pid')?.toLowerCase() ?? null;
  const activePlaybookId = routePlaybookId ?? legacyPlaybookId;
  const isDetailRoute = routePlaybookId !== null;

  const selectedPlaybook =
    activePlaybookId !== null
      ? (playbooks.find((item) => item.id.toLowerCase() === activePlaybookId) ?? null)
      : null;

  const activeRunState = useMemo(() => {
    if (!selectedPlaybook) {
      return null;
    }

    const cachedRunState = runStateByPlaybookId[selectedPlaybook.id];
    if (cachedRunState) {
      return cachedRunState;
    }

    try {
      const rawState = window.localStorage.getItem(getRunStorageKey(selectedPlaybook.id));
      return hydrateRunState(selectedPlaybook, rawState);
    } catch {
      return buildInitialRunState(selectedPlaybook);
    }
  }, [selectedPlaybook, runStateByPlaybookId]);

  const relatedAnalyses = useMemo(
    () =>
      selectedPlaybook
        ? analyses.filter((analysis) => analysis.linkedPlaybooks?.includes(selectedPlaybook.id))
        : [],
    [selectedPlaybook, analyses],
  );

  const categories = useMemo(
    () => [ALL_FILTER_VALUE, ...Array.from(new Set(playbooks.map((playbook) => playbook.category)))],
    [playbooks],
  );

  const difficulties = useMemo(() => {
    const values = new Set<string>();
    for (const playbook of playbooks) {
      values.add(playbook.difficulty ?? '—');
    }

    const ordered = ['Facile', 'Moyen', 'Difficile', 'Expert', 'Stratégique', '—'];
    const extra = Array.from(values)
      .filter((value) => !ordered.includes(value))
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    return [ALL_FILTER_VALUE, ...ordered.filter((value) => values.has(value)), ...extra];
  }, [playbooks]);

  const searchIndexByPlaybookId = useMemo(() => {
    const index = new Map<string, string>();
    for (const playbook of playbooks) {
      index.set(playbook.id, buildSearchIndex(playbook));
    }
    return index;
  }, [playbooks]);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());

  const filteredPlaybooks = useMemo(() => {
    const visiblePlaybooks = playbooks.filter((playbook) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        searchIndexByPlaybookId.get(playbook.id)?.includes(normalizedSearchTerm) === true;

      const playbookDifficulty = playbook.difficulty ?? '—';
      const matchesCategory =
        activeCategory === ALL_FILTER_VALUE || playbook.category === activeCategory;
      const matchesDifficulty =
        activeDifficulty === ALL_FILTER_VALUE || playbookDifficulty === activeDifficulty;
      const matchesSeverity =
        activeSeverity === ALL_FILTER_VALUE || playbook.severity === activeSeverity;
      const matchesCommands =
        !withCommandsOnly || playbook.steps.some((step) => Boolean(step.command?.trim()));

      return (
        matchesSearch && matchesCategory && matchesDifficulty && matchesSeverity && matchesCommands
      );
    });

    visiblePlaybooks.sort((left, right) => {
      if (sortOption === 'severity_desc') {
        const severityDelta = SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity];
        if (severityDelta !== 0) return severityDelta;
        return comparePlaybookId(left.id, right.id);
      }

      if (sortOption === 'title_asc') {
        return left.title.localeCompare(right.title, uiLocale, { sensitivity: 'base' });
      }

      return comparePlaybookId(left.id, right.id);
    });

    return visiblePlaybooks;
  }, [
    playbooks,
    normalizedSearchTerm,
    searchIndexByPlaybookId,
    activeCategory,
    activeDifficulty,
    activeSeverity,
    withCommandsOnly,
    sortOption,
    uiLocale,
  ]);

  const completedStepsCount = useMemo(() => {
    if (!selectedPlaybook || !activeRunState) {
      return 0;
    }

    return selectedPlaybook.steps.reduce(
      (count, step) => count + (activeRunState.checkedSteps[step.id] ? 1 : 0),
      0,
    );
  }, [selectedPlaybook, activeRunState]);

  const progressPercentage = useMemo(() => {
    if (!selectedPlaybook || selectedPlaybook.steps.length === 0) {
      return 0;
    }

    return Math.round((completedStepsCount / selectedPlaybook.steps.length) * 100);
  }, [selectedPlaybook, completedStepsCount]);

  useEffect(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, [toastMessage]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (routePlaybookId || !legacyPlaybookId) {
      return;
    }

    const legacyPlaybook = playbooks.find((item) => item.id.toLowerCase() === legacyPlaybookId);
    navigate(
      legacyPlaybook
        ? buildLocalizedPath(`/playbooks/${legacyPlaybook.id}`, locale)
        : buildLocalizedPath('/playbooks', locale),
      { replace: true },
    );
  }, [routePlaybookId, legacyPlaybookId, navigate, locale, playbooks]);

  useEffect(() => {
    if (!routePlaybookId) {
      return;
    }

    if (!selectedPlaybook) {
      navigate(buildLocalizedPath('/playbooks', locale), { replace: true });
    }
  }, [routePlaybookId, selectedPlaybook, navigate, locale]);

  const showToast = (message: string) => {
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1600);
  };

  const copyToClipboard = async (text: string, successMessage = copy.toastCopyOk) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      showToast(copy.toastCopyFailed);
    }
  };

  const handlePrint = () => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';
    window.print();
    window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
    }, 250);
  };

  const openPlaybook = (playbook: Playbook) => {
    setIsRunMode(false);
    setGeneratedExport('');
    navigate(localizedPath(`/playbooks/${playbook.id}`));
  };

  const closePlaybook = () => {
    setIsRunMode(false);
    setGeneratedExport('');
    navigate(localizedPath('/playbooks'));
  };

  const persistRunState = (playbookId: string, nextState: RunState) => {
    try {
      window.localStorage.setItem(getRunStorageKey(playbookId), JSON.stringify(nextState));
    } catch {
      // Ignore storage errors and keep in-memory state.
    }
  };

  const updateRunState = (updater: (previousState: RunState) => RunState) => {
    if (!selectedPlaybook || !activeRunState) {
      return;
    }

    const nextState = updater(activeRunState);
    setRunStateByPlaybookId((previousState) => ({
      ...previousState,
      [selectedPlaybook.id]: nextState,
    }));
    persistRunState(selectedPlaybook.id, nextState);
  };

  const toggleStep = (stepId: string) => {
    updateRunState((previousState) => ({
      ...previousState,
      checkedSteps: {
        ...previousState.checkedSteps,
        [stepId]: !previousState.checkedSteps[stepId],
      },
      updatedAt: nowIso(),
    }));
  };

  const updateGlobalNotes = (value: string) => {
    updateRunState((previousState) => ({
      ...previousState,
      notesGlobal: value,
      updatedAt: nowIso(),
    }));
  };

  const updateStepNotes = (stepId: string, value: string) => {
    updateRunState((previousState) => ({
      ...previousState,
      notesByStep: {
        ...previousState.notesByStep,
        [stepId]: value,
      },
      updatedAt: nowIso(),
    }));
  };

  const resetRunState = () => {
    if (!selectedPlaybook) {
      return;
    }

    try {
      window.localStorage.removeItem(getRunStorageKey(selectedPlaybook.id));
    } catch {
      // Ignore storage failures and still reset in-memory state.
    }

    const nextState = buildInitialRunState(selectedPlaybook);
    setRunStateByPlaybookId((previousState) => ({
      ...previousState,
      [selectedPlaybook.id]: nextState,
    }));
    setGeneratedExport('');
    showToast(copy.resetDone);
  };

  const getExportContent = (): string => {
    if (!selectedPlaybook || !activeRunState) {
      return '';
    }

    return (
      generatedExport ||
      buildPlaybookExportMarkdown(selectedPlaybook, activeRunState, relatedAnalyses, copy.export)
    );
  };

  const generateExport = () => {
    if (!selectedPlaybook || !activeRunState) {
      return;
    }

    const markdown = buildPlaybookExportMarkdown(
      selectedPlaybook,
      activeRunState,
      relatedAnalyses,
      copy.export,
    );
    setGeneratedExport(markdown);
    showToast(copy.exportGenerated);
  };

  const copyExport = async () => {
    const content = getExportContent();
    if (!content) {
      return;
    }

    await copyToClipboard(content, copy.exportCopied);
  };

  const downloadExportFile = () => {
    const content = getExportContent();
    if (!content || !selectedPlaybook) {
      return;
    }

    downloadMarkdown(`${selectedPlaybook.id}-execution.md`, content);
    showToast(copy.downloadSuccess);
  };

  const playbooksSeoSchema = selectedPlaybook
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: isEnglish ? 'Home' : 'Accueil',
              item: 'https://cyber-guide.fr/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Playbooks',
              item: 'https://cyber-guide.fr/playbooks',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: selectedPlaybook.title,
              item: `https://cyber-guide.fr/playbooks/${selectedPlaybook.id}`,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: selectedPlaybook.title,
          description: selectedPlaybook.description,
          inLanguage: isEnglish ? 'en-US' : 'fr-FR',
          url: `https://cyber-guide.fr/playbooks/${selectedPlaybook.id}`,
          about: `${selectedPlaybook.category} - ${copy.severity.toLowerCase()} ${selectedPlaybook.severity}`,
          supply: selectedPlaybook.artifacts.map((artifact) => ({
            '@type': 'HowToSupply',
            name: artifact,
          })),
          tool: selectedPlaybook.prerequisites.map((tool) => ({
            '@type': 'HowToTool',
            name: tool,
          })),
          step: selectedPlaybook.steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.description,
          })),
        },
      ]
    : {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Playbooks Cyber Guide',
        url: 'https://cyber-guide.fr/playbooks',
        inLanguage: isEnglish ? 'en-US' : 'fr-FR',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: playbooks.map((playbook, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: playbook.title,
            url: `https://cyber-guide.fr/playbooks/${playbook.id}`,
          })),
        },
      };

  return (
    <div className="bg-slate-50 min-h-screen pb-32 print:bg-white print:pb-0 print:min-h-0">
      <Seo
        title={
          selectedPlaybook
            ? `${selectedPlaybook.title} | ${copy.pageTitle}`
            : copy.pageTitle
        }
        description={
          selectedPlaybook
            ? selectedPlaybook.description
            : isEnglish
              ? 'Operational cybersecurity procedures for incident response, hardening, and governance.'
              : 'Procédures opérationnelles cyber pour réponse à incident, hardening et gouvernance.'
        }
        path={selectedPlaybook ? `/playbooks/${selectedPlaybook.id}` : '/playbooks'}
        image="/assets/og/playbooks.svg"
        keywords={[
          isEnglish ? 'cyber playbook' : 'playbook cyber',
          'incident response',
          isEnglish ? 'operational cybersecurity' : 'cybersécurité opérationnelle',
          'hardening',
          'gouvernance',
        ]}
        type={selectedPlaybook ? 'article' : 'website'}
        schema={playbooksSeoSchema}
      />

      <div className="print:hidden">
        <ShieldHeader
          title={copy.pageTitle}
          subtitle={copy.pageSubtitle}
          meta={[
            `${playbooks.length} ${isEnglish ? 'references' : 'référentiels'}`,
            ...copy.pageMeta.slice(0, 2),
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:w-full print:max-w-none print:px-0">
        {!isDetailRoute && (
          <div className="flex flex-col gap-6 mb-12 print:hidden bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy font-bold uppercase text-xs tracking-widest border-b border-slate-100 pb-2 mb-2">
              <Filter size={14} /> {isEnglish ? 'Operational library' : 'Bibliothèque opérationnelle'}
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={copy.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-brand-steel focus:bg-white transition-colors text-sm"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">
                  {copy.category}
                </label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === ALL_FILTER_VALUE
                        ? copy.all
                        : localizePlaybookCategory(category, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">
                  {copy.difficulty}
                </label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeDifficulty}
                  onChange={(event) => setActiveDifficulty(event.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === ALL_FILTER_VALUE
                        ? copy.all
                        : localizePlaybookDifficulty(difficulty, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">
                  {copy.severity}
                </label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeSeverity}
                  onChange={(event) => setActiveSeverity(event.target.value)}
                >
                  {[ALL_FILTER_VALUE, 'Critique', 'Élevée', 'Moyenne', 'Faible'].map((severity) => (
                    <option key={severity} value={severity}>
                      {severity === ALL_FILTER_VALUE
                        ? copy.all
                        : localizePlaybookSeverity(severity, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">
                  {copy.sortLabel}
                </label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'severity_desc'
                        ? copy.sortSeverity
                        : option === 'title_asc'
                          ? copy.sortTitle
                          : copy.sortId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wide">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border-slate-300 text-brand-steel focus:ring-brand-steel"
                  checked={withCommandsOnly}
                  onChange={(event) => setWithCommandsOnly(event.target.checked)}
                />
                {copy.withCommandsOnly}
              </label>

              <div className="text-xs text-slate-400 font-mono">
                {filteredPlaybooks.length} {copy.availablePlaybooks}
              </div>
            </div>
          </div>
        )}

        {!isDetailRoute && (
          <div className="mb-10 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 print:hidden md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                {copy.recommendedPath}
              </p>
              <p className="mt-2 text-sm text-slate-600">{copy.recommendedBody}</p>
            </div>
            <div className="flex items-center justify-start gap-4 md:justify-end">
              <Link to={localizedPath('/guides')}>
                <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                  {copy.openGuides}
                </Button>
              </Link>
              <Link
                to={localizedPath('/analyses')}
                className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
              >
                {copy.seeAnalyses}
              </Link>
            </div>
          </div>
        )}

        {!isDetailRoute &&
          (filteredPlaybooks.length === 0 ? (
            <div className="rounded-sm border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 print:hidden">
              {copy.noResults}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
              {filteredPlaybooks.map((playbook) => {
                const estimatedTime = playbook.estimatedTime ?? '—';
                const difficulty = playbook.difficulty ?? '—';

                return (
                  <button
                    key={playbook.id}
                    type="button"
                    onClick={() => openPlaybook(playbook)}
                    className="group relative flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-white text-left shadow-panel transition-all duration-300 hover:border-brand-steel hover:shadow-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-steel"
                    aria-label={`${copy.openPlaybookAria} ${playbook.title}`}
                  >
                    <div
                      className={`h-1 w-full ${getSeverityStripeClass(playbook.severity)}`}
                    ></div>

                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge color={getSeverityColor(playbook.severity)}>
                          {localizePlaybookSeverity(playbook.severity, locale)}
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-400">{playbook.id}</span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-brand-navy leading-tight mb-2 group-hover:text-brand-steel transition-colors">
                        {playbook.title}
                      </h3>

                      <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed flex-grow">
                        {playbook.description}
                      </p>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-sm">
                          <Clock size={10} /> {estimatedTime}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-sm">
                          <Gauge size={10} /> {localizePlaybookDifficulty(difficulty, locale)}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                          {playbook.steps.length} {copy.steps}
                        </span>
                        <div className="flex items-center gap-1 text-brand-steel font-bold text-xs uppercase group-hover:translate-x-1 transition-transform">
                          {copy.open} <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

        <Drawer
          isOpen={Boolean(selectedPlaybook)}
          onClose={closePlaybook}
          title={selectedPlaybook ? `PLAYBOOK: ${selectedPlaybook.id}` : ''}
          size="xl"
          variant={isDetailRoute ? 'inline' : 'overlay'}
        >
          {selectedPlaybook && (
            <div className="playbook-print space-y-6 pb-10 print:p-0 print:space-y-2 print:pb-0">
              <div className="hidden print:block mb-4 border-b-2 border-black pb-3">
                <h1 className="text-3xl font-bold uppercase">{selectedPlaybook.title}</h1>
                <p className="text-sm font-mono mt-2">
                  {copy.printHeaderRef}: {selectedPlaybook.id} | {copy.printHeaderSeverity}:{' '}
                  {localizePlaybookSeverity(selectedPlaybook.severity, locale)} | CYBER GUIDE
                </p>
              </div>

              {selectedPlaybook.operationalBrief && (
                <section className="playbook-print-summary hidden print:block border border-black p-3 text-[11px] leading-relaxed">
                  <p className="playbook-copy">
                    <strong>{copy.context}:</strong> {selectedPlaybook.operationalBrief.context}
                  </p>
                  <p className="playbook-copy mt-1">
                    <strong>{copy.objective}:</strong> {selectedPlaybook.operationalBrief.objective}
                  </p>
                  <p className="playbook-copy mt-1">
                    <strong>{copy.businessRisk}:</strong>{' '}
                    {selectedPlaybook.operationalBrief.businessRisk}
                  </p>
                </section>
              )}

              <section className="hidden print:grid grid-cols-2 gap-2 text-[11px] border border-black p-2">
                <p>
                  <strong>{copy.category}:</strong>{' '}
                  {localizePlaybookCategory(selectedPlaybook.category, locale)}
                </p>
                <p>
                  <strong>{copy.difficulty}:</strong>{' '}
                  {localizePlaybookDifficulty(selectedPlaybook.difficulty ?? '—', locale)}
                </p>
                <p>
                  <strong>{copy.estimatedTime}:</strong> {selectedPlaybook.estimatedTime ?? '—'}
                </p>
                <p>
                  <strong>{copy.steps}:</strong> {selectedPlaybook.steps.length}
                </p>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={closePlaybook}>
                  {copy.backToList}
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={isRunMode ? 'primary' : 'outline'}
                    size="sm"
                    icon={PlayCircle}
                    onClick={() => setIsRunMode((previous) => !previous)}
                  >
                    {isRunMode ? copy.runModeActive : copy.runMode}
                  </Button>
                  <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
                    {copy.print}
                  </Button>
                </div>
              </div>

              <div className="print:hidden">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge color={getSeverityColor(selectedPlaybook.severity)}>
                    {copy.severity}: {localizePlaybookSeverity(selectedPlaybook.severity, locale)}
                  </Badge>
                  <Badge color="navy">
                    {localizePlaybookCategory(selectedPlaybook.category, locale)}
                  </Badge>
                  <Badge color="mono">
                    {localizePlaybookDifficulty(selectedPlaybook.difficulty ?? '—', locale)}
                  </Badge>
                  <Badge color="mono">
                    {copy.estimatedTime}: {selectedPlaybook.estimatedTime ?? '—'}
                  </Badge>
                </div>
                <h2 className="text-3xl font-display font-bold text-brand-navy mb-4">
                  {selectedPlaybook.title}
                </h2>
                <p className="playbook-copy text-slate-600 text-lg leading-relaxed">
                  {selectedPlaybook.description}
                </p>
              </div>

              {selectedPlaybook.operationalBrief && (
                <section className="print:hidden overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm print:border-black print:shadow-none">
                  <div className="border-b border-slate-200 bg-gradient-to-r from-brand-pale/50 via-white to-brand-pale/30 px-6 py-4 print:bg-white print:border-black">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy print:text-black">
                        {copy.operationalNotebook}
                      </h3>
                      <span className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 print:border-black print:text-black">
                        {copy.fieldGuideFormat}
                      </span>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] print:grid-cols-1">
                    <aside className="border-b border-slate-200 bg-brand-navy px-5 py-5 text-brand-pale lg:border-b-0 lg:border-r lg:border-r-white/10 print:hidden">
                      <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-light">
                        {copy.summary}
                      </p>
                      <ol className="space-y-2 text-xs">
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 01 - {copy.context}
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 02 - {copy.objective}
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 03 - {copy.businessRisk}
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 04 - {copy.keyChecks}
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 05 - {copy.escalationCriteria}
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          {copy.chapter} 06 - {copy.export.coordination}
                        </li>
                      </ol>
                    </aside>

                    <div className="space-y-4 p-5">
                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 01
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.context}
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.context}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 02
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.objective}
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.objective}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 03
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.businessRisk}
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.businessRisk}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 04
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.keyChecks}
                        </h4>
                        <ul className="space-y-2 text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.keyChecks.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-steel print:bg-black"></span>
                              <span className="min-w-0 playbook-copy">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 05
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.escalationCriteria}
                        </h4>
                        <ul className="space-y-2 text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.escalationSignals.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-alert print:bg-black"></span>
                              <span className="min-w-0 playbook-copy">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          {copy.chapter} 06
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          {copy.export.coordination}
                        </h4>
                        <ul className="space-y-2 text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.handoffTo.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold print:bg-black"></span>
                              <span className="min-w-0 playbook-copy">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  </div>
                </section>
              )}

              {relatedAnalyses.length > 0 && (
                <section className="print:hidden rounded-sm border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                    <Link2 size={14} className="text-brand-steel" /> {copy.linkedAnalyses}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {relatedAnalyses.map((analysis) => (
                      <Link
                        key={analysis.slug}
                        to={localizedPath(`/analyses/${analysis.slug}`)}
                        className="rounded-sm border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand-steel/40 hover:text-brand-navy"
                      >
                        {analysis.title}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {isRunMode && activeRunState && (
                <section className="playbook-run-panel print:hidden rounded-sm border border-brand-steel/30 bg-brand-pale/20 p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy">
                      {copy.runModeIncident}
                    </h3>
                    <Badge color="steel">
                      {completedStepsCount}/{selectedPlaybook.steps.length} {copy.steps}
                    </Badge>
                  </div>

                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-steel transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="mb-4 grid gap-2 text-xs font-mono text-slate-500 sm:grid-cols-2">
                    <span>
                      {copy.startedAt}: {formatTimestamp(activeRunState.startedAt, uiLocale)}
                    </span>
                    <span>
                      {copy.updatedAt}: {formatTimestamp(activeRunState.updatedAt, uiLocale)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                      {copy.export.incidentNotes}
                    </label>
                    <textarea
                      className="playbook-input min-h-[96px] w-full max-w-full rounded-sm border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 outline-none focus:border-brand-steel"
                      placeholder={copy.notesPlaceholder}
                      value={activeRunState.notesGlobal}
                      onChange={(event) => updateGlobalNotes(event.target.value)}
                      wrap="soft"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ClipboardCheck}
                      onClick={generateExport}
                    >
                      {isEnglish ? 'Export' : 'Exporter'}
                    </Button>
                    <Button variant="outline" size="sm" icon={Copy} onClick={copyExport}>
                      {copy.copyExport}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={downloadExportFile}
                    >
                      {copy.downloadMd}
                    </Button>
                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetRunState}>
                      {copy.reset}
                    </Button>
                  </div>

                  {generatedExport && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                        {isEnglish ? 'Markdown preview' : 'Aperçu export Markdown'}
                      </label>
                      <textarea
                        readOnly
                        value={generatedExport}
                        className="min-h-[180px] w-full rounded-sm border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700"
                      />
                    </div>
                  )}
                </section>
              )}

              <div className="print:hidden">
                <TechSeparator />
              </div>

              <div className="playbook-print-grid grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-3 print:mb-3">
                <div className="playbook-section bg-slate-50 p-4 rounded-sm border border-slate-200 print:bg-white print:border-black">
                  <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-3 flex items-center gap-2 print:text-black">
                    <AlertOctagon size={14} className="text-brand-alert print:hidden" />
                    {copy.triggerSection}
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlaybook.triggers.map((trigger) => (
                      <li
                        key={trigger}
                        className="text-sm text-slate-700 flex items-start gap-2 print:text-black"
                      >
                        <span className="text-brand-alert print:text-black">•</span>{' '}
                        <span className="min-w-0 playbook-copy">{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="playbook-section bg-slate-50 p-4 rounded-sm border border-slate-200 print:bg-white print:border-black">
                  <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-3 flex items-center gap-2 print:text-black">
                    <Shield size={14} className="text-brand-steel print:hidden" />{' '}
                    {copy.prerequisitesSection}
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlaybook.prerequisites.map((prerequisite) => (
                      <li
                        key={prerequisite}
                        className="text-sm text-slate-700 flex items-start gap-2 print:text-black"
                      >
                        <span className="text-brand-steel print:text-black">•</span>{' '}
                        <span className="min-w-0 playbook-copy">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2 print:text-black print:text-lg print:border-b print:border-black print:pb-2">
                  <CheckSquare className="text-brand-steel print:hidden" />{' '}
                  {isEnglish ? 'Operational procedure' : 'Procédure opérationnelle'}
                </h3>
                <div className="space-y-6 print:space-y-4">
                  {selectedPlaybook.steps.map((step, index) => {
                    const isChecked = Boolean(activeRunState?.checkedSteps[step.id]);

                    return (
                      <div
                        key={step.id}
                        className="playbook-step relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0 print:border-l-black print:pb-2"
                      >
                        <div className="playbook-step-index absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white print:bg-black print:text-white print:ring-0">
                          {index + 1}
                        </div>

                        <div className="playbook-step-card bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-black print:p-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h4 className="font-bold text-brand-navy text-lg mb-2 print:text-black">
                              {step.title}
                            </h4>

                            {isRunMode && activeRunState && (
                              <label className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono text-slate-600">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded-sm border-slate-300 text-brand-steel focus:ring-brand-steel"
                                  checked={isChecked}
                                  onChange={() => toggleStep(step.id)}
                                />
                                {isChecked
                                  ? isEnglish
                                    ? 'Done'
                                    : 'Terminé'
                                  : isEnglish
                                    ? 'To do'
                                    : 'À faire'}
                              </label>
                            )}
                          </div>

                          <p className="playbook-copy text-slate-600 text-sm mb-4 leading-relaxed print:text-black">
                            {step.description}
                          </p>

                          {step.warning && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-800 flex items-start gap-3 print:bg-white print:border-black print:text-black print:font-bold">
                              <AlertTriangle
                                size={18}
                                className="flex-shrink-0 mt-0.5 print:hidden"
                              />
                              <span className="playbook-copy">
                                {copy.export.warning.toUpperCase()}: {step.warning}
                              </span>
                            </div>
                          )}

                          {step.command && (
                            <div className="bg-slate-900 rounded-sm p-3 font-mono text-xs text-brand-light overflow-x-auto border border-slate-700 flex flex-col gap-1 print:bg-gray-100 print:text-black print:border-gray-300">
                              <div className="flex items-center justify-between gap-3 print:hidden">
                                <span className="text-slate-500 select-none uppercase text-[10px] font-bold flex items-center gap-1">
                                  <Terminal size={10} /> Shell / KQL
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(step.command ?? '', copy.commandCopied)
                                  }
                                  className="inline-flex items-center gap-1 rounded-sm border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300 transition-colors hover:border-brand-steel hover:text-white"
                                  aria-label={`${copy.copyCommandAria} ${index + 1}`}
                                >
                                  <Copy size={12} /> {copy.copyCommand}
                                </button>
                              </div>
                              <code className="playbook-code text-white print:text-black">
                                {step.command}
                              </code>
                            </div>
                          )}

                          {isRunMode && activeRunState && (
                            <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 print:hidden">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {copy.stepNote}
                              </label>
                              <textarea
                                className="playbook-input min-h-[74px] w-full max-w-full rounded-sm border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 outline-none focus:border-brand-steel focus:bg-white"
                                value={activeRunState.notesByStep[step.id] ?? ''}
                                onChange={(event) => updateStepNotes(step.id, event.target.value)}
                                placeholder={
                                  isEnglish
                                    ? 'Observations, found artifacts, decisions taken...'
                                    : 'Observations, artefacts trouves, decisions prises...'
                                }
                                wrap="soft"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="playbook-section bg-brand-pale/30 p-4 border border-brand-steel/20 rounded-sm print:bg-white print:border-black print:mt-4">
                <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-2 print:text-black">
                  {copy.artifactsToCollect}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlaybook.artifacts.map((artifact) => (
                    <Badge
                      key={artifact}
                      color="mono"
                      className="bg-white print:border-black print:text-black break-words [overflow-wrap:anywhere]"
                    >
                      {artifact}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedPlaybook.messageTemplates &&
                selectedPlaybook.messageTemplates.length > 0 && (
                  <div className="print:hidden">
                    <h3 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2 print:text-black print:mt-6 print:border-b print:border-black">
                      <MessageSquare className="text-brand-gold print:hidden" />{' '}
                      {copy.messageTemplates}
                    </h3>
                    <div className="grid gap-4">
                      {selectedPlaybook.messageTemplates.map((template, index) => (
                        <div
                          key={`${template.audience}-${index}`}
                          className="bg-white border border-slate-200 rounded-sm p-4 print:border-black"
                        >
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <Badge color="gold" className="print:border-black print:text-black">
                              {isEnglish ? 'For' : 'Pour'}: {template.audience}
                            </Badge>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  `${isEnglish ? 'Subject' : 'Sujet'}: ${template.subject}\n\n${template.body}`,
                                  copy.templateCopied,
                                )
                              }
                              className="text-slate-400 hover:text-brand-steel print:hidden"
                              title={copy.copyCommand}
                              aria-label={`${copy.copyCommand} ${template.audience}`}
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-slate-800 mb-2">
                            {isEnglish ? 'Subject' : 'Sujet'}: {template.subject}
                          </div>
                          <div className="p-3 bg-slate-50 text-sm text-slate-600 font-mono border-l-2 border-slate-300 whitespace-pre-wrap print:bg-white print:text-black print:border-black">
                            {template.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="playbook-section bg-emerald-50 border border-emerald-200 p-6 rounded-sm print:bg-white print:border-black print:mt-3">
                <h4 className="font-bold text-emerald-800 uppercase text-xs tracking-wider mb-4 flex items-center gap-2 print:text-black">
                  <CheckSquare size={16} className="print:hidden" /> {copy.definitionOfDone}
                </h4>
                <ul className="grid md:grid-cols-2 gap-3">
                  {selectedPlaybook.definitionOfDone.map((item) => (
                    <li
                      key={item}
                      className="playbook-copy flex items-center gap-2 text-sm text-emerald-900 print:text-black"
                    >
                      <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center print:border-black">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full print:bg-black"></div>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center pt-8 print:hidden">
                <Button variant="outline" icon={Printer} onClick={handlePrint}>
                  {copy.printPlaybook}
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[70] rounded-sm border border-brand-steel/40 bg-brand-navy px-3 py-2 text-xs font-mono text-white shadow-lg print:hidden"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Playbooks;
