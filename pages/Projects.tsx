import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldHeader, BlueprintPanel, Badge, Button, Drawer, TechBadge } from '../components/UI';
import { getLocalizedContent } from '../utils/contentLocale';
import {
  FolderOpen,
  ArrowRight,
  ChevronRight,
  Layers,
  ShieldAlert,
  CheckCircle2,
  ListChecks,
  Cpu,
  ShieldCheck,
  ScanLine,
  Network,
  Lock,
  Server,
  Target,
  Workflow,
  LineChart,
  FileText,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type { Project } from '../types';
import { Seo } from '../components/Seo';
import { getLocaleFromPathname } from '../utils/locale';

type ProjectBriefing = {
  summary: string;
  primaryUse: string;
  operationalValue: string;
  workflow: string[];
};

type MetricCard = {
  label: string;
  value: string;
};

type ParsedProjectMetrics = {
  stars: number;
  forks: number;
  issues: number;
};

const toMetricValue = (input: string): string => input.replace(/\s+/g, ' ').trim();
const formatProjectNumber = (value: number, locale: 'fr' | 'en'): string =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-FR').format(value);

const parseProjectMetrics = (result: string): ParsedProjectMetrics | null => {
  const match = result.match(
    /([\d\s]+)\s*stars,\s*([\d\s]+)\s*forks,\s*([\d\s]+)\s*(issues ouvertes|open issues)/i,
  );
  if (!match) return null;

  const toNumber = (raw: string) => Number.parseInt(raw.replace(/\s+/g, ''), 10);
  const stars = toNumber(match[1]);
  const forks = toNumber(match[2]);
  const issues = toNumber(match[3]);
  if ([stars, forks, issues].some((value) => Number.isNaN(value))) return null;

  return { stars, forks, issues };
};

const getProjectMetrics = (result: string, locale: 'fr' | 'en'): MetricCard[] => {
  const parsed = parseProjectMetrics(result);
  if (!parsed) return [];

  return [
    { label: 'GitHub Stars', value: toMetricValue(formatProjectNumber(parsed.stars, locale)) },
    { label: 'Forks', value: toMetricValue(formatProjectNumber(parsed.forks, locale)) },
    {
      label: locale === 'en' ? 'Open issues' : 'Issues ouvertes',
      value: toMetricValue(formatProjectNumber(parsed.issues, locale)),
    },
  ];
};

const getProjectBriefing = (project: Project, locale: 'fr' | 'en'): ProjectBriefing => {
  const workflow =
    locale === 'en'
      ? [
          'Frame scope, stakeholders and risk threshold',
          'Execute actions and collect evidence',
          'Review KPIs and update procedures',
        ]
      : [
          'Cadrer le périmètre, les acteurs et le seuil de risque',
          'Exécuter les actions et collecter les preuves',
          'Mesurer les KPI et mettre à jour les procédures',
        ];

  return {
    summary: project.objective,
    primaryUse: project.context,
    operationalValue:
      project.takeaways?.[0] ??
      (locale === 'en'
        ? 'Strengthens operational defensive cybersecurity capabilities.'
        : 'Renforce les capacités défensives en cybersécurité opérationnelle.'),
    workflow,
  };
};

const Projects: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { projects } = useMemo(() => getLocalizedContent(locale), [locale]);

  const copy = isEnglish
    ? {
        allFilterToken: 'All',
        filterAll: 'All operations',
        systemStatus: 'SYSTEM STATUS: ONLINE',
        seoTitle: 'Cyber Projects and Operations',
        seoDescription:
          'Documented operational case studies: cyber crisis simulation, incident response plan, secure cloud deployment, and remediation governance.',
        seoKeywords: [
          'cyber projects',
          'cyber case studies',
          'incident response plan',
          'operational cybersecurity',
        ],
        schemaName: 'Cyber Guide Projects',
        headerTitle: 'Projects & Operations',
        headerSubtitle: 'Case studies',
        headerMeta: [`${projects.length} files`, 'Case studies', 'Field guide'],
        portfolioTitle: 'Global portfolio summary',
        portfolioBody:
          'This section provides documented operational case studies designed for execution: crisis simulation, response coordination, hardening, and measurable improvement loops.',
        projectsAnalyzed: 'Analyzed files',
        coveredContexts: 'Covered contexts',
        trackedTechnologies: 'Tracked technologies',
        cumulativeAdoption: 'Action points',
        snapshot: 'Documented sources',
        sourceVerified: 'Documented file',
        openFile: 'Open file',
        drawerTitle: 'DETAILS',
        verifiedCase: 'Operational case study',
        syntheticPresentation: 'Synthetic presentation',
        whatItDoes: 'Primary objective',
        operationalValue: 'Operational value',
        projectScope: 'Project scope',
        actionPlan: 'Operational action plan',
        operationalCycle: 'Typical operational cycle',
        keyPoints: 'Key points for execution',
        verifiableData: 'Documented outcome',
        technologiesUsed: 'Technologies and methods',
        projectUpdated: 'Updated',
        sourcePack: 'Reference sources',
        sourceItems: 'official sources',
        sourceUnavailable: 'Source unavailable',
        noPublicSource: 'No public source is available for this file.',
        openReference: 'Open reference source',
        completed: 'COMPLETED',
        pipelineSteps: [
          'Detect and qualify the incident',
          'Contain and coordinate response',
          'Align legal, management and communication',
          'Remediate and improve controls',
        ],
      }
    : {
        allFilterToken: 'Tous',
        filterAll: 'Toutes les opérations',
        systemStatus: 'STATUT SYSTÈME : EN LIGNE',
        seoTitle: 'Projets et Opérations Cyber',
        seoDescription:
          'Études de cas opérationnelles documentées : simulation de crise cyber, plan de réponse à incident, déploiement cloud sécurisé et gouvernance de remédiation.',
        seoKeywords: [
          'projets cyber',
          'étude de cas cyber',
          'plan de réponse incident',
          'cybersécurité opérationnelle',
        ],
        schemaName: 'Projets Cyber Guide',
        headerTitle: 'Projets & Opérations',
        headerSubtitle: 'Études de cas',
        headerMeta: [`${projects.length} dossiers`, 'Études de cas', 'Guide terrain'],
        portfolioTitle: 'Synthèse globale du portefeuille',
        portfolioBody:
          'Cette section présente des études de cas opérationnelles directement activables : simulation de crise, plan de réponse incident, déploiement cloud sécurisé et pilotage de remédiation.',
        projectsAnalyzed: 'Dossiers analysés',
        coveredContexts: 'Contextes couverts',
        trackedTechnologies: 'Technologies suivies',
        cumulativeAdoption: "Points d'action",
        snapshot: 'Sources documentées',
        sourceVerified: 'Dossier documenté',
        openFile: 'Ouvrir le dossier',
        drawerTitle: 'Détails',
        verifiedCase: 'Étude de cas opérationnelle',
        syntheticPresentation: 'Présentation synthétique',
        whatItDoes: 'Objectif principal',
        operationalValue: 'Valeur opérationnelle',
        projectScope: 'Portée projet',
        actionPlan: "Plan d'actions",
        operationalCycle: 'Cycle opérationnel type',
        keyPoints: "Points clés d'exécution",
        verifiableData: 'Résultat documenté',
        technologiesUsed: 'Technologies et méthodes',
        projectUpdated: 'Mise à jour',
        sourcePack: 'Sources de référence',
        sourceItems: 'sources officielles',
        sourceUnavailable: 'Source non disponible',
        noPublicSource: "Aucun lien public n'est fourni pour ce dossier.",
        openReference: 'Consulter la source de référence',
        completed: 'TERMINÉ',
        pipelineSteps: [
          "Détecter et qualifier l'incident",
          'Contenir et coordonner la réponse',
          'Aligner juridique, direction et communication',
          'Remédier et améliorer les contrôles',
        ],
      };

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState(copy.allFilterToken);

  const selectedBriefing = selectedProject ? getProjectBriefing(selectedProject, locale) : null;
  const selectedMetrics = selectedProject ? getProjectMetrics(selectedProject.result, locale) : [];

  const categories = useMemo(() => {
    const allContexts = projects.map((project) => project.context);
    return [copy.allFilterToken, ...Array.from(new Set(allContexts))];
  }, [projects, copy.allFilterToken]);

  const filteredProjects =
    filter === copy.allFilterToken ? projects : projects.filter((project) => project.context === filter);

  const globalPortfolio = useMemo(() => {
    const stats = projects.reduce(
      (accumulator, project) => {
        project.technologies.forEach((tech) => accumulator.technologies.add(tech));
        accumulator.contexts.add(project.context);
        accumulator.actionPoints += project.takeaways?.length ?? 0;
        project.sources?.forEach((source) => accumulator.sources.add(source.url));
        if (project.link && project.link !== '#') {
          accumulator.sources.add(project.link);
        }
        return accumulator;
      },
      {
        technologies: new Set<string>(),
        contexts: new Set<string>(),
        actionPoints: 0,
        sources: new Set<string>(),
      },
    );

    return {
      projectCount: projects.length,
      contextCount: stats.contexts.size,
      technologyCount: stats.technologies.size,
      actionPoints: stats.actionPoints,
      documentedSources: stats.sources.size,
    };
  }, [projects]);

  const formatMetric = (value: number): string =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-FR').format(value);

  const formatUpdatedDate = (value?: string): string => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getProjectIcon = (context: string) => {
    const lower = context.toLowerCase();
    if (lower.includes('crise')) return Workflow;
    if (lower.includes('incident')) return ShieldAlert;
    if (lower.includes('cloud')) return Server;
    if (lower.includes('identity') || lower.includes('ad')) return Lock;
    if (lower.includes('audit') || lower.includes('assurance')) return Target;
    if (lower.includes('sensibilisation')) return ScanLine;
    if (lower.includes('reseau') || lower.includes('réseau') || lower.includes('network')) return Network;
    return FolderOpen;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/projets"
        image="/assets/og/projects.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.schemaName,
          url: `https://cyber-guide.fr${isEnglish ? '/en/projects' : '/projets'}`,
        }}
      />
      <ShieldHeader title={copy.headerTitle} subtitle={copy.headerSubtitle} meta={copy.headerMeta} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wide text-slate-500">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`border-b-2 pb-1 transition-colors ${
                  filter === category
                    ? 'border-brand-navy font-bold text-brand-navy'
                    : 'border-transparent hover:text-brand-navy'
                }`}
              >
                {category === copy.allFilterToken ? copy.filterAll : category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-sm bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-400">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success"></div>
            {copy.systemStatus}
          </div>
        </div>

        <section className="mb-10 rounded-sm border border-brand-steel/20 bg-gradient-to-br from-brand-pale/45 via-white to-slate-50 p-6 shadow-panel md:p-7">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-brand-navy text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-navy">{copy.portfolioTitle}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.portfolioBody}</p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {copy.projectsAnalyzed}
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.projectCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {copy.coveredContexts}
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.contextCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {copy.trackedTechnologies}
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.technologyCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {copy.cumulativeAdoption}
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {formatMetric(globalPortfolio.actionPoints)}
              </div>
              <div className="text-[11px] text-slate-500">
                {copy.snapshot}: {formatMetric(globalPortfolio.documentedSources)}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {copy.pipelineSteps.map((step, index) => (
              <div
                key={step}
                className="relative rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
              >
                {index < 3 && (
                  <ChevronRight
                    size={16}
                    className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-brand-steel md:block"
                  />
                )}
                {step}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          {filteredProjects.map((project, index) => {
            const ProjectIcon = getProjectIcon(project.context);
            const briefing = getProjectBriefing(project, locale);

            return (
              <div
                key={`${project.id}-${filter}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-steel"
                  aria-label={`${copy.openFile} ${project.title}`}
                >
                  <BlueprintPanel
                    className="group relative overflow-hidden bg-white transition-all duration-500 ease-out hover:scale-[1.01] hover:border-brand-steel hover:shadow-2xl hover:shadow-brand-steel/20"
                    label={`DOSSIER: ${project.id.toUpperCase()}`}
                  >
                    <div className="absolute right-0 top-0 z-20 h-full w-1.5 translate-x-full bg-gradient-to-b from-brand-steel to-brand-light shadow-[0_0_20px_rgba(47,94,166,0.5)] transition-transform duration-300 ease-out group-hover:translate-x-0"></div>
                    <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-transparent to-brand-steel/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                    <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm border border-brand-navy/10 bg-brand-pale/50 text-brand-navy shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-navy group-hover:text-white group-hover:shadow-brand-steel/20">
                        <ProjectIcon size={28} strokeWidth={1.5} />
                      </div>

                      <div className="flex-grow space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-display font-bold text-brand-navy transition-colors group-hover:text-brand-steel">
                            {project.title}
                          </h3>
                          <Badge
                            color="steel"
                            className="transition-all duration-300 group-hover:border-brand-steel group-hover:bg-brand-steel group-hover:text-white group-hover:shadow-sm"
                          >
                            {project.context}
                          </Badge>
                          <span className="hidden h-px w-8 bg-slate-200 md:inline-block"></span>
                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            {copy.sourceVerified}
                          </span>
                        </div>
                        <p className="line-clamp-2 max-w-3xl text-sm font-sans leading-relaxed text-slate-600">
                          {briefing.summary}
                        </p>
                        <p className="line-clamp-1 max-w-3xl text-xs font-sans text-slate-500">
                          {briefing.primaryUse}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-brand-steel">
                          <LineChart size={12} />
                          <span className="line-clamp-1">{briefing.operationalValue}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <Calendar size={12} />
                          <span>
                            {copy.projectUpdated}: {formatUpdatedDate(project.updatedDate)}
                          </span>
                          {project.sources && project.sources.length > 0 && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>
                                {project.sources.length} {copy.sourceItems}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="min-w-[150px] flex-shrink-0">
                        <div className="flex -space-x-2 justify-end">
                          {project.technologies.slice(0, 3).map((technology, techIndex) => (
                            <div
                              key={`${project.id}-${technology}-${techIndex}`}
                              className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-bold uppercase text-slate-500 shadow-sm"
                              title={technology}
                            >
                              {technology.substring(0, 2)}
                            </div>
                          ))}
                          {project.technologies.length > 3 && (
                            <div className="z-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                              +{project.technologies.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex translate-x-2 items-center justify-end text-xs font-bold uppercase tracking-wide text-brand-steel opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          {copy.openFile} <ArrowRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </BlueprintPanel>
                </button>
              </div>
            );
          })}
        </div>

        <Drawer
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject ? `REF-OP: ${selectedProject.id.toUpperCase()}` : copy.drawerTitle}
        >
          {selectedProject && (
            <div className="flex h-full flex-col space-y-8">
              <div className="flex items-center gap-3 rounded-sm border border-brand-steel/20 bg-brand-pale/40 p-3">
                <ShieldCheck className="text-brand-steel" size={18} />
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-navy">
                  {copy.verifiedCase}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-brand-navy">
                  {selectedProject.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge color="navy">{selectedProject.context}</Badge>
                  <Badge color="success">{copy.completed}</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {copy.projectUpdated}: {formatUpdatedDate(selectedProject.updatedDate)}
                </div>
              </div>

              <div className="space-y-4 rounded-sm border border-brand-steel/20 bg-gradient-to-br from-brand-pale/45 via-white to-brand-pale/20 p-5">
                <div className="flex items-center gap-3 text-brand-navy">
                  <Layers className="text-brand-steel" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {copy.syntheticPresentation}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selectedBriefing?.summary ?? selectedProject.objective}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <Target size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        {copy.whatItDoes}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {selectedBriefing?.primaryUse ?? selectedProject.context}
                    </p>
                  </div>
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <LineChart size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        {copy.operationalValue}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {selectedBriefing?.operationalValue ??
                        selectedProject.takeaways?.[0] ??
                        (isEnglish
                          ? 'Strengthens operational cyber maturity.'
                          : 'Renforce la maturité cyber opérationnelle.')}
                    </p>
                  </div>
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <FileText size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        {copy.projectScope}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {selectedProject.scope ?? selectedProject.objective}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-3 text-brand-navy">
                  <Workflow className="text-brand-steel" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {copy.operationalCycle}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {(selectedBriefing?.workflow ?? []).map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="relative flex items-start gap-3 rounded-sm border border-slate-200 bg-white p-3"
                    >
                      {index < (selectedBriefing?.workflow.length ?? 0) - 1 && (
                        <ChevronRight
                          size={16}
                          className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-brand-steel md:block"
                        />
                      )}
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pale text-[10px] font-bold text-brand-navy">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProject.keyActions && selectedProject.keyActions.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-3 text-brand-navy">
                    <ShieldCheck className="text-brand-steel" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{copy.actionPlan}</span>
                  </div>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {selectedProject.keyActions.map((action, index) => (
                      <li
                        key={`${selectedProject.id}-action-${index}`}
                        className="rounded-sm border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700"
                      >
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-navy">
                          {index + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.takeaways && (
                <div>
                  <div className="mb-4 flex items-center gap-3 text-brand-navy">
                    <ListChecks className="text-brand-gold" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{copy.keyPoints}</span>
                  </div>
                  <ul className="space-y-3">
                    {selectedProject.takeaways.map((takeaway, index) => (
                      <li key={`${selectedProject.id}-takeaway-${index}`} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gold"></span>
                        <span className="leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center gap-3 text-brand-navy">
                  <CheckCircle2 className="text-slate-400" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {copy.verifiableData}
                  </span>
                </div>
                <div className="border-l-2 border-slate-200 py-1 pl-4">
                  <p className="text-sm italic leading-relaxed text-slate-600">"{selectedProject.result}"</p>
                </div>
                {selectedMetrics.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {selectedMetrics.map((metric) => (
                      <div key={metric.label} className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                          {metric.label}
                        </div>
                        <div className="mt-1 text-lg font-display font-bold text-brand-navy">
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-400">
                  <Cpu size={14} />
                  <span className="text-xs font-mono uppercase tracking-widest">
                    {copy.technologiesUsed}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {selectedProject.technologies.map((technology) => (
                    <TechBadge key={`${selectedProject.id}-${technology}`} tech={technology} />
                  ))}
                </div>
              </div>

              {selectedProject.sources && selectedProject.sources.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-500">
                    <ExternalLink size={14} />
                    <span className="text-xs font-mono uppercase tracking-widest">{copy.sourcePack}</span>
                  </div>
                  <div className="space-y-3">
                    {selectedProject.sources.map((source, index) => (
                      <a
                        key={`${selectedProject.id}-source-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-sm border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-steel/40 hover:bg-brand-pale/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-brand-navy">{source.name}</div>
                            {source.note && <div className="mt-1 text-xs text-slate-600">{source.note}</div>}
                          </div>
                          <ExternalLink size={14} className="mt-1 flex-shrink-0 text-slate-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 mt-auto border-t border-slate-100 bg-white pb-4 pt-8">
                {selectedProject.link && selectedProject.link !== '#' ? (
                  <a href={selectedProject.link} target="_blank" rel="noreferrer" className="group block w-full">
                    <Button variant="primary" className="flex w-full justify-between" size="lg">
                      <span>{copy.openReference}</span>
                      <ExternalLink
                        size={18}
                        className="opacity-70 transition-opacity group-hover:opacity-100"
                      />
                    </Button>
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-sm border border-slate-200 bg-slate-100 p-4 text-center">
                    <ShieldAlert size={24} className="text-slate-400" />
                    <span className="text-xs font-mono font-bold uppercase text-slate-500">
                      {copy.sourceUnavailable}
                    </span>
                    <span className="max-w-xs text-[10px] text-slate-400">{copy.noPublicSource}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default Projects;
