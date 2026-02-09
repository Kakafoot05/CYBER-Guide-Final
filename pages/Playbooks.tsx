import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ShieldHeader,
  Button,
  Badge,
  Drawer,
  TechSeparator,
  type BadgeColor,
} from '../components/UI';
import { analyses, playbooks } from '../data';
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

type SortOption = 'severity_desc' | 'title_asc' | 'id_asc';

type RunState = {
  startedAt: string;
  checkedSteps: Record<string, boolean>;
  notesGlobal: string;
  notesByStep: Record<string, string>;
  updatedAt: string;
};

const SEVERITY_ORDER: Record<Playbook['severity'], number> = {
  Critique: 4,
  Élevée: 3,
  Moyenne: 2,
  Faible: 1,
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'severity_desc', label: 'Severite (Critique > Faible)' },
  { value: 'title_asc', label: 'Titre (A->Z)' },
  { value: 'id_asc', label: 'Reference (pb-001...)' },
];

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

const formatTimestamp = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const buildPlaybookExportMarkdown = (
  playbook: Playbook,
  runState: RunState,
  relatedAnalyses: Analysis[],
): string => {
  const lines: string[] = [];
  const difficulty = playbook.difficulty ?? '—';
  const estimatedTime = playbook.estimatedTime ?? '—';

  lines.push(`# Rapport d'execution - ${playbook.title}`);
  lines.push('');
  lines.push('## Meta');
  lines.push(`- ID: ${playbook.id}`);
  lines.push(`- Titre: ${playbook.title}`);
  lines.push(`- Severite: ${playbook.severity}`);
  lines.push(`- Categorie: ${playbook.category}`);
  lines.push(`- Temps estime: ${estimatedTime}`);
  lines.push(`- Difficulte: ${difficulty}`);
  lines.push(`- Demarre le: ${runState.startedAt}`);
  lines.push(`- Derniere mise a jour: ${runState.updatedAt}`);

  if (playbook.operationalBrief) {
    lines.push('');
    lines.push('## Brief operationnel');
    lines.push(`- Contexte: ${playbook.operationalBrief.context}`);
    lines.push(`- Objectif: ${playbook.operationalBrief.objective}`);
    lines.push(`- Risque metier: ${playbook.operationalBrief.businessRisk}`);
    lines.push('- Verifications cles:');
    for (const item of playbook.operationalBrief.keyChecks) {
      lines.push(`  - ${item}`);
    }
    lines.push('- Criteres d escalade:');
    for (const item of playbook.operationalBrief.escalationSignals) {
      lines.push(`  - ${item}`);
    }
    lines.push('- Coordination:');
    for (const item of playbook.operationalBrief.handoffTo) {
      lines.push(`  - ${item}`);
    }
  }

  lines.push('');
  lines.push('## Declencheurs');
  for (const trigger of playbook.triggers) {
    lines.push(`- ${trigger}`);
  }

  lines.push('');
  lines.push('## Pre-requis');
  for (const prerequisite of playbook.prerequisites) {
    lines.push(`- ${prerequisite}`);
  }

  lines.push('');
  lines.push('## Notes incident (global)');
  lines.push(runState.notesGlobal.trim() || 'Aucune note globale.');

  lines.push('');
  lines.push('## Etapes');
  playbook.steps.forEach((step, index) => {
    const checked = runState.checkedSteps[step.id] ? 'x' : ' ';
    lines.push('');
    lines.push(`### [${checked}] Etape ${index + 1} - ${step.title}`);
    lines.push(step.description);

    if (step.command) {
      lines.push('Commande:');
      lines.push('```');
      lines.push(step.command);
      lines.push('```');
    }

    if (step.warning) {
      lines.push(`Avertissement: ${step.warning}`);
    }

    const note = runState.notesByStep[step.id]?.trim();
    lines.push(`Note etape: ${note || 'Aucune note.'}`);
  });

  lines.push('');
  lines.push('## Artifacts');
  for (const artifact of playbook.artifacts) {
    lines.push(`- ${artifact}`);
  }

  lines.push('');
  lines.push('## Definition of Done');
  for (const item of playbook.definitionOfDone) {
    lines.push(`- [ ] ${item}`);
  }

  if (relatedAnalyses.length > 0) {
    lines.push('');
    lines.push('## Analyses liees');
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: routePlaybookIdParam } = useParams<{ id?: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeDifficulty, setActiveDifficulty] = useState('Tous');
  const [activeSeverity, setActiveSeverity] = useState('Tous');
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
    [selectedPlaybook],
  );

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(playbooks.map((playbook) => playbook.category)))],
    [],
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

    return ['Tous', ...ordered.filter((value) => values.has(value)), ...extra];
  }, []);

  const searchIndexByPlaybookId = useMemo(() => {
    const index = new Map<string, string>();
    for (const playbook of playbooks) {
      index.set(playbook.id, buildSearchIndex(playbook));
    }
    return index;
  }, []);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());

  const filteredPlaybooks = useMemo(() => {
    const visiblePlaybooks = playbooks.filter((playbook) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        searchIndexByPlaybookId.get(playbook.id)?.includes(normalizedSearchTerm) === true;

      const playbookDifficulty = playbook.difficulty ?? '—';
      const matchesCategory = activeCategory === 'Tous' || playbook.category === activeCategory;
      const matchesDifficulty =
        activeDifficulty === 'Tous' || playbookDifficulty === activeDifficulty;
      const matchesSeverity = activeSeverity === 'Tous' || playbook.severity === activeSeverity;
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
        return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
      }

      return comparePlaybookId(left.id, right.id);
    });

    return visiblePlaybooks;
  }, [
    normalizedSearchTerm,
    searchIndexByPlaybookId,
    activeCategory,
    activeDifficulty,
    activeSeverity,
    withCommandsOnly,
    sortOption,
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
    navigate(legacyPlaybook ? `/playbooks/${legacyPlaybook.id}` : '/playbooks', { replace: true });
  }, [routePlaybookId, legacyPlaybookId, navigate]);

  useEffect(() => {
    if (!routePlaybookId) {
      return;
    }

    if (!selectedPlaybook) {
      navigate('/playbooks', { replace: true });
    }
  }, [routePlaybookId, selectedPlaybook, navigate]);

  const showToast = (message: string) => {
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1600);
  };

  const copyToClipboard = async (text: string, successMessage = 'Copie ✅') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      showToast('Copie impossible');
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
    navigate(`/playbooks/${playbook.id}`);
  };

  const closePlaybook = () => {
    setIsRunMode(false);
    setGeneratedExport('');
    navigate('/playbooks');
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
    showToast('Suivi reinitialise');
  };

  const getExportContent = (): string => {
    if (!selectedPlaybook || !activeRunState) {
      return '';
    }

    return (
      generatedExport ||
      buildPlaybookExportMarkdown(selectedPlaybook, activeRunState, relatedAnalyses)
    );
  };

  const generateExport = () => {
    if (!selectedPlaybook || !activeRunState) {
      return;
    }

    const markdown = buildPlaybookExportMarkdown(selectedPlaybook, activeRunState, relatedAnalyses);
    setGeneratedExport(markdown);
    showToast('Export genere ✅');
  };

  const copyExport = async () => {
    const content = getExportContent();
    if (!content) {
      return;
    }

    await copyToClipboard(content, 'Export copie ✅');
  };

  const downloadExportFile = () => {
    const content = getExportContent();
    if (!content || !selectedPlaybook) {
      return;
    }

    downloadMarkdown(`${selectedPlaybook.id}-execution.md`, content);
    showToast('Fichier .md telecharge ✅');
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
              name: 'Accueil',
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
          inLanguage: 'fr-FR',
          url: `https://cyber-guide.fr/playbooks/${selectedPlaybook.id}`,
          about: `${selectedPlaybook.category} - severite ${selectedPlaybook.severity}`,
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
        inLanguage: 'fr-FR',
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
            ? `${selectedPlaybook.title} | Playbook opérationnel`
            : 'Playbooks opérationnels'
        }
        description={
          selectedPlaybook
            ? selectedPlaybook.description
            : 'Procedures operationnelles cyber pour reponse a incident, hardening et gouvernance.'
        }
        path={selectedPlaybook ? `/playbooks/${selectedPlaybook.id}` : '/playbooks'}
        image="/assets/og/playbooks.svg"
        keywords={[
          'playbook cyber',
          'incident response',
          'cybersecurite operationnelle',
          'hardening',
          'gouvernance',
        ]}
        type={selectedPlaybook ? 'article' : 'website'}
        schema={playbooksSeoSchema}
      />

      <div className="print:hidden">
        <ShieldHeader
          title="Procedures & Playbooks"
          subtitle="Operations"
          meta={[`${playbooks.length} Referentiels`, 'Actionnable', 'Cyber operationnelle']}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:w-full print:max-w-none print:px-0">
        {!isDetailRoute && (
          <div className="flex flex-col gap-6 mb-12 print:hidden bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy font-bold uppercase text-xs tracking-widest border-b border-slate-100 pb-2 mb-2">
              <Filter size={14} /> Bibliotheque Operationnelle
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Recherche full-text (titre, etapes, artefacts, commandes...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-brand-steel focus:bg-white transition-colors text-sm"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Categorie</label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Difficulte</label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeDifficulty}
                  onChange={(event) => setActiveDifficulty(event.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Severite</label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={activeSeverity}
                  onChange={(event) => setActiveSeverity(event.target.value)}
                >
                  {['Tous', 'Critique', 'Élevée', 'Moyenne', 'Faible'].map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Tri</label>
                <select
                  className="bg-slate-50 border border-slate-200 text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-steel"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                Avec commandes uniquement
              </label>

              <div className="text-xs text-slate-400 font-mono">
                {filteredPlaybooks.length} playbooks disponibles
              </div>
            </div>
          </div>
        )}

        {!isDetailRoute && (
          <div className="mb-10 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 print:hidden md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                Parcours recommande
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Besoin d un cadre complet avant execution ? Commencez par les guides piliers puis
                ouvrez les playbooks relies.
              </p>
            </div>
            <div className="flex items-center justify-start gap-4 md:justify-end">
              <Link to="/guides">
                <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                  Ouvrir les guides
                </Button>
              </Link>
              <Link
                to="/analyses"
                className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
              >
                Voir aussi les analyses
              </Link>
            </div>
          </div>
        )}

        {!isDetailRoute &&
          (filteredPlaybooks.length === 0 ? (
            <div className="rounded-sm border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 print:hidden">
              Aucun playbook ne correspond a ces filtres.
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
                    aria-label={`Ouvrir le playbook ${playbook.title}`}
                  >
                    <div
                      className={`h-1 w-full ${getSeverityStripeClass(playbook.severity)}`}
                    ></div>

                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge color={getSeverityColor(playbook.severity)}>
                          {playbook.severity}
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
                          <Gauge size={10} /> {difficulty}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                          {playbook.steps.length} Etapes
                        </span>
                        <div className="flex items-center gap-1 text-brand-steel font-bold text-xs uppercase group-hover:translate-x-1 transition-transform">
                          Ouvrir <ArrowRight size={14} />
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
                  REF: {selectedPlaybook.id} | SEVERITE: {selectedPlaybook.severity} | CYBER GUIDE
                </p>
              </div>

              {selectedPlaybook.operationalBrief && (
                <section className="playbook-print-summary hidden print:block border border-black p-3 text-[11px] leading-relaxed">
                  <p className="playbook-copy">
                    <strong>Contexte:</strong> {selectedPlaybook.operationalBrief.context}
                  </p>
                  <p className="playbook-copy mt-1">
                    <strong>Objectif:</strong> {selectedPlaybook.operationalBrief.objective}
                  </p>
                  <p className="playbook-copy mt-1">
                    <strong>Risque metier:</strong> {selectedPlaybook.operationalBrief.businessRisk}
                  </p>
                </section>
              )}

              <section className="hidden print:grid grid-cols-2 gap-2 text-[11px] border border-black p-2">
                <p>
                  <strong>Categorie:</strong> {selectedPlaybook.category}
                </p>
                <p>
                  <strong>Difficulte:</strong> {selectedPlaybook.difficulty ?? '—'}
                </p>
                <p>
                  <strong>Temps estime:</strong> {selectedPlaybook.estimatedTime ?? '—'}
                </p>
                <p>
                  <strong>Etapes:</strong> {selectedPlaybook.steps.length}
                </p>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={closePlaybook}>
                  Retour a la liste
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={isRunMode ? 'primary' : 'outline'}
                    size="sm"
                    icon={PlayCircle}
                    onClick={() => setIsRunMode((previous) => !previous)}
                  >
                    {isRunMode ? 'Mode execution actif' : 'Mode execution'}
                  </Button>
                  <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
                    Imprimer
                  </Button>
                </div>
              </div>

              <div className="print:hidden">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge color={getSeverityColor(selectedPlaybook.severity)}>
                    Severite: {selectedPlaybook.severity}
                  </Badge>
                  <Badge color="navy">{selectedPlaybook.category}</Badge>
                  <Badge color="mono">{selectedPlaybook.difficulty ?? '—'}</Badge>
                  <Badge color="mono">Temps estime: {selectedPlaybook.estimatedTime ?? '—'}</Badge>
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
                        Carnet operationnel
                      </h3>
                      <span className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 print:border-black print:text-black">
                        Format guide terrain
                      </span>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] print:grid-cols-1">
                    <aside className="border-b border-slate-200 bg-brand-navy px-5 py-5 text-brand-pale lg:border-b-0 lg:border-r lg:border-r-white/10 print:hidden">
                      <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-light">
                        Sommaire
                      </p>
                      <ol className="space-y-2 text-xs">
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 01 - Contexte
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 02 - Objectif
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 03 - Risque metier
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 04 - Verifications cles
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 05 - Criteres d escalade
                        </li>
                        <li className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
                          Chapitre 06 - Coordination
                        </li>
                      </ol>
                    </aside>

                    <div className="space-y-4 p-5">
                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          Chapitre 01
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Contexte
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.context}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          Chapitre 02
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Objectif
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.objective}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          Chapitre 03
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Risque metier
                        </h4>
                        <p className="playbook-copy text-base leading-relaxed text-slate-700 print:text-black">
                          {selectedPlaybook.operationalBrief.businessRisk}
                        </p>
                      </article>

                      <article className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 print:border-black print:bg-white">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 print:text-black">
                          Chapitre 04
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Verifications cles
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
                          Chapitre 05
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Criteres d escalade
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
                          Chapitre 06
                        </p>
                        <h4 className="mb-2 text-base font-bold uppercase tracking-wide text-brand-navy print:text-black">
                          Coordination
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
                    <Link2 size={14} className="text-brand-steel" /> Analyses liees
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {relatedAnalyses.map((analysis) => (
                      <Link
                        key={analysis.slug}
                        to={`/analyses/${analysis.slug}`}
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
                      Mode execution incident
                    </h3>
                    <Badge color="steel">
                      {completedStepsCount}/{selectedPlaybook.steps.length} etapes
                    </Badge>
                  </div>

                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-steel transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="mb-4 grid gap-2 text-xs font-mono text-slate-500 sm:grid-cols-2">
                    <span>Debut: {formatTimestamp(activeRunState.startedAt)}</span>
                    <span>Derniere MAJ: {formatTimestamp(activeRunState.updatedAt)}</span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                      Notes d incident
                    </label>
                    <textarea
                      className="playbook-input min-h-[96px] w-full max-w-full rounded-sm border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 outline-none focus:border-brand-steel"
                      placeholder="Contexte, hypotheses, decisions, escalades..."
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
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm" icon={Copy} onClick={copyExport}>
                      Copier l export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={downloadExportFile}
                    >
                      Telecharger .md
                    </Button>
                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetRunState}>
                      Reinitialiser
                    </Button>
                  </div>

                  {generatedExport && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                        Apercu export Markdown
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
                    Declencheurs
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
                    <Shield size={14} className="text-brand-steel print:hidden" /> Pre-requis
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
                  <CheckSquare className="text-brand-steel print:hidden" /> Procedure Operationnelle
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
                                {isChecked ? 'Termine' : 'A faire'}
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
                              <span className="playbook-copy">ATTENTION: {step.warning}</span>
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
                                    copyToClipboard(step.command ?? '', 'Commande copiee ✅')
                                  }
                                  className="inline-flex items-center gap-1 rounded-sm border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300 transition-colors hover:border-brand-steel hover:text-white"
                                  aria-label={`Copier la commande de l'etape ${index + 1}`}
                                >
                                  <Copy size={12} /> Copier
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
                                Note etape
                              </label>
                              <textarea
                                className="playbook-input min-h-[74px] w-full max-w-full rounded-sm border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 outline-none focus:border-brand-steel focus:bg-white"
                                value={activeRunState.notesByStep[step.id] ?? ''}
                                onChange={(event) => updateStepNotes(step.id, event.target.value)}
                                placeholder="Observations, artefacts trouves, decisions prises..."
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
                  Preuves a collecter (Artifacts)
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
                      <MessageSquare className="text-brand-gold print:hidden" /> Templates de
                      communication
                    </h3>
                    <div className="grid gap-4">
                      {selectedPlaybook.messageTemplates.map((template, index) => (
                        <div
                          key={`${template.audience}-${index}`}
                          className="bg-white border border-slate-200 rounded-sm p-4 print:border-black"
                        >
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <Badge color="gold" className="print:border-black print:text-black">
                              Pour: {template.audience}
                            </Badge>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  `Sujet: ${template.subject}\n\n${template.body}`,
                                  'Template copie ✅',
                                )
                              }
                              className="text-slate-400 hover:text-brand-steel print:hidden"
                              title="Copier"
                              aria-label={`Copier le template ${template.audience}`}
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-slate-800 mb-2">
                            Sujet: {template.subject}
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
                  <CheckSquare size={16} className="print:hidden" /> Definition of Done (Cloture)
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
                  Imprimer le Playbook
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
