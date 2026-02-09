import React, { useState, useMemo } from 'react';
import { ShieldHeader, BlueprintPanel, Badge, Button, Drawer, TechBadge } from '../components/UI';
import { projects } from '../data';
import {
  Github,
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
  Radar,
} from 'lucide-react';
import type { Project } from '../types';
import { Seo } from '../components/Seo';

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

const PROJECT_BRIEFINGS: Record<string, ProjectBriefing> = {
  p1: {
    summary:
      'Wazuh centralise la telemetrie endpoint, cloud et log management pour piloter la detection et la reponse SOC.',
    primaryUse: 'SIEM/XDR open source pour supervision continue',
    operationalValue: 'Reduit le temps de triage et standardise les alertes critiques',
    workflow: [
      'Collecter les evenements endpoint et cloud en temps reel',
      'Correlier avec regles de detection et mapping ATT&CK',
      'Escalader les incidents priorises vers les playbooks',
    ],
  },
  p2: {
    summary:
      'Security Onion assemble un stack complet NSM (Suricata, Zeek, PCAP, Elastic) pour investigation reseau approfondie.',
    primaryUse: 'NDR/NSM pour detection et chasse reseau',
    operationalValue: 'Offre une visibilite forte sur flux, protocoles et anomalies',
    workflow: [
      'Capturer flux reseau et evenements NIDS',
      'Enrichir et indexer les traces pour investigation',
      'Qualifier rapidement les signaux en incident ou faux positif',
    ],
  },
  p3: {
    summary:
      'Velociraptor permet la collecte forensique a grande echelle et la chasse endpoint avec requetes VQL ciblant des artefacts precis.',
    primaryUse: 'DFIR et threat hunting endpoint',
    operationalValue: 'Accellere la collecte de preuves lors des investigations critiques',
    workflow: [
      'Definir des hypotheses de chasse sur postes/serveurs',
      'Executer des collections VQL sur le parc cible',
      'Confirmer ou infirmer rapidement la compromission',
    ],
  },
  p4: {
    summary:
      'OpenCTI structure le renseignement menace en graphes STIX/TAXII pour relier campagnes, TTPs, IOCs et actifs internes.',
    primaryUse: 'Plateforme CTI pour intelligence actionnable',
    operationalValue: 'Ameliore la priorisation des menaces selon le contexte metier',
    workflow: [
      'Importer des flux CTI fiables et normalises',
      'Relier IOCs, acteurs et techniques a vos actifs',
      'Diffuser les priorites de detection vers SOC et IR',
    ],
  },
  p5: {
    summary:
      'Sigma est un standard Detection-as-Code qui permet de versionner des regles et de les convertir vers plusieurs SIEM/EDR.',
    primaryUse: 'Industrialisation des detections defensives',
    operationalValue: 'Limite le drift entre plateformes et fiabilise le cycle de detection',
    workflow: [
      'Ecrire des regles Sigma lisibles et reutilisables',
      'Valider les regles via pipeline CI avant deploiement',
      'Convertir vers la plateforme SIEM/EDR ciblee',
    ],
  },
  p6: {
    summary:
      'Suricata inspecte le trafic reseau en profondeur (IDS/IPS) et produit des evenements structures utiles au SOC.',
    primaryUse: 'Detection reseau haute performance',
    operationalValue: 'Detecte rapidement comportements anormaux et chaines d intrusion',
    workflow: [
      'Inspecter les flux reseau et signatures actives',
      'Generer des evenements EVE JSON exploitables',
      'Correlier avec SIEM pour prioriser la reponse',
    ],
  },
  p7: {
    summary:
      'MITRE CALDERA simule des adversaires bases ATT&CK pour tester la couverture detection/reponse de facon mesurable.',
    primaryUse: 'Adversary emulation pour validation defensive',
    operationalValue: 'Identifie les gaps de couverture avant un incident reel',
    workflow: [
      'Lancer des scenarios ATT&CK representatifs',
      'Mesurer ce que detecte (ou manque) le SOC',
      'Corriger les gaps via regles, hardening et playbooks',
    ],
  },
};

const toMetricValue = (input: string): string => input.replace(/\s+/g, ' ').trim();
const formatProjectNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

const parseProjectMetrics = (result: string): ParsedProjectMetrics | null => {
  const match = result.match(
    /([\d\s]+)\s*stars,\s*([\d\s]+)\s*forks,\s*([\d\s]+)\s*issues ouvertes/i,
  );
  if (!match) return null;

  const toNumber = (raw: string) => Number.parseInt(raw.replace(/\s+/g, ''), 10);
  const stars = toNumber(match[1]);
  const forks = toNumber(match[2]);
  const issues = toNumber(match[3]);
  if ([stars, forks, issues].some((value) => Number.isNaN(value))) return null;

  return { stars, forks, issues };
};

const getProjectMetrics = (result: string): MetricCard[] => {
  const parsed = parseProjectMetrics(result);
  if (!parsed) return [];

  return [
    { label: 'GitHub Stars', value: toMetricValue(formatProjectNumber(parsed.stars)) },
    { label: 'Forks', value: toMetricValue(formatProjectNumber(parsed.forks)) },
    { label: 'Issues ouvertes', value: toMetricValue(formatProjectNumber(parsed.issues)) },
  ];
};

const getProjectBriefing = (project: Project): ProjectBriefing =>
  PROJECT_BRIEFINGS[project.id] ?? {
    summary: project.objective,
    primaryUse: project.context,
    operationalValue:
      project.takeaways?.[0] ?? 'Renforce les capacites defensives en cybersécurité operationnelle.',
    workflow: [
      'Qualifier le besoin operationnel',
      'Deployer le projet sur le perimetre prioritaire',
      'Mesurer impact et ajuster les procedures SOC',
    ],
  };

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState('Tous');
  const selectedBriefing = selectedProject ? getProjectBriefing(selectedProject) : null;
  const selectedMetrics = selectedProject ? getProjectMetrics(selectedProject.result) : [];

  // Derive unique contexts for filters
  const categories = useMemo(() => {
    const allContexts = projects.map((p) => p.context);
    return ['Tous', ...Array.from(new Set(allContexts))];
  }, []);

  const filteredProjects =
    filter === 'Tous' ? projects : projects.filter((p) => p.context === filter);
  const globalPortfolio = useMemo(() => {
    const stats = projects.reduce(
      (accumulator, project) => {
        const parsed = parseProjectMetrics(project.result);
        if (parsed) {
          accumulator.totalStars += parsed.stars;
          accumulator.totalForks += parsed.forks;
          accumulator.totalIssues += parsed.issues;
        }

        project.technologies.forEach((tech) => accumulator.technologies.add(tech));
        accumulator.contexts.add(project.context);
        return accumulator;
      },
      {
        totalStars: 0,
        totalForks: 0,
        totalIssues: 0,
        technologies: new Set<string>(),
        contexts: new Set<string>(),
      },
    );

    return {
      projectCount: projects.length,
      contextCount: stats.contexts.size,
      technologyCount: stats.technologies.size,
      totalStars: stats.totalStars,
      totalForks: stats.totalForks,
      totalIssues: stats.totalIssues,
    };
  }, []);
  const formatMetric = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const getProjectIcon = (context: string) => {
    const lower = context.toLowerCase();
    if (lower.includes('hunting') || lower.includes('investigation')) return ScanLine;
    if (lower.includes('ad') || lower.includes('active directory') || lower.includes('network'))
      return Network;
    if (lower.includes('hardening') || lower.includes('sécurisation')) return ShieldCheck;
    if (lower.includes('cloud')) return Server;
    if (lower.includes('identity') || lower.includes('iam')) return Lock;
    return FolderOpen;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Projets et Operations Cyber"
        description="Retours d'experience et operations de cybersécurité: threat hunting, durcissement AD et actions defensives."
        path="/projets"
        image="/assets/og/projects.svg"
        keywords={['projets cyber', 'threat hunting', 'active directory', 'cybersecurite operationnelle']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Projets Cyber Guide',
          url: 'https://cyber-guide.fr/projets',
        }}
      />
      <ShieldHeader
        title="Projets & Opérations"
        subtitle="Portfolio"
        meta={[`${projects.length} Dossiers`, 'Open Source', 'Recherche']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CONTROL PANEL */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wide text-slate-500">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`transition-colors pb-1 border-b-2 ${
                  filter === cat
                    ? 'text-brand-navy border-brand-navy font-bold'
                    : 'border-transparent hover:text-brand-navy'
                }`}
              >
                {cat === 'Tous' ? 'Toutes les opérations' : cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-sm">
            <div className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse"></div>
            STATUT SYSTEME : EN LIGNE
          </div>
        </div>

        <section className="mb-10 rounded-sm border border-brand-steel/20 bg-gradient-to-br from-brand-pale/45 via-white to-slate-50 p-6 md:p-7 shadow-panel">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-sm bg-brand-navy text-white flex items-center justify-center flex-shrink-0">
              <Radar size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-navy">
                Synthese globale du portefeuille
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
                Cette section projets presente les briques open source qui structurent un dispositif
                cyber defensif coherent: collecte de telemetrie, detection, investigation, threat
                intelligence et validation de la couverture SOC.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-5">
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Projets analyses
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.projectCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Contextes couverts
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.contextCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Technologies suivies
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {globalPortfolio.technologyCount}
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Adoption OSS cumulee
              </div>
              <div className="mt-1 text-2xl font-display font-bold text-brand-navy">
                {formatMetric(globalPortfolio.totalStars)}
              </div>
              <div className="text-[11px] text-slate-500">stars GitHub (snapshot)</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              'Collecte: Wazuh + Security Onion + Suricata',
              'Detection: Sigma rules + SIEM correlations',
              'Investigation: Velociraptor + workflow DFIR',
              'Validation: OpenCTI + MITRE CALDERA',
            ].map((step, index) => (
              <div
                key={step}
                className="relative rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
              >
                {index < 3 && (
                  <ChevronRight
                    size={16}
                    className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-brand-steel"
                  />
                )}
                {step}
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS LIST */}
        <div className="grid gap-6">
          {filteredProjects.map((project, index) => {
            const ProjectIcon = getProjectIcon(project.context);
            const briefing = getProjectBriefing(project);

            return (
              <div
                key={`${project.id}-${filter}`} // Force re-render for animation on filter change
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-steel"
                  aria-label={`Ouvrir le dossier ${project.title}`}
                >
                  <BlueprintPanel
                    className="relative overflow-hidden bg-white transition-all duration-500 ease-out hover:scale-[1.01] hover:border-brand-steel hover:shadow-2xl hover:shadow-brand-steel/20 group"
                    label={`DOSSIER: ${project.id.toUpperCase()}`}
                  >
                    {/* Visual Status Indicator on hover (Right Side) */}
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-brand-steel to-brand-light shadow-[0_0_20px_rgba(47,94,166,0.5)] transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-20"></div>

                    {/* Subtle Hover Background Tint */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-steel/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                      <div className="w-16 h-16 bg-brand-pale/50 rounded-sm flex-shrink-0 flex items-center justify-center text-brand-navy border border-brand-navy/10 group-hover:bg-brand-navy group-hover:text-white transition-all duration-300 shadow-inner group-hover:scale-110 group-hover:shadow-brand-steel/20">
                        <ProjectIcon size={28} strokeWidth={1.5} />
                      </div>

                      <div className="flex-grow space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-brand-steel transition-colors">
                            {project.title}
                          </h3>
                          <Badge
                            color="steel"
                            className="transition-all duration-300 group-hover:bg-brand-steel group-hover:text-white group-hover:border-brand-steel group-hover:shadow-sm"
                          >
                            {project.context}
                          </Badge>
                          <span className="hidden md:inline-block h-px w-8 bg-slate-200"></span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            Source verifiable
                          </span>
                        </div>
                        <p className="text-slate-600 font-sans text-sm max-w-3xl line-clamp-2 leading-relaxed">
                          {briefing.summary}
                        </p>
                        <p className="text-slate-500 font-sans text-xs max-w-3xl line-clamp-1">
                          {briefing.primaryUse}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-brand-steel">
                          <LineChart size={12} />
                          <span className="line-clamp-1">{briefing.operationalValue}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 min-w-[150px] flex-shrink-0">
                        <div className="flex -space-x-2">
                          {project.technologies.slice(0, 3).map((t, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase shadow-sm z-10"
                              title={t}
                            >
                              {t.substring(0, 2)}
                            </div>
                          ))}
                          {project.technologies.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-0">
                              +{project.technologies.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-brand-steel text-xs font-bold uppercase tracking-wide opacity-0 transform translate-x-2 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          Ouvrir le dossier <ArrowRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </BlueprintPanel>
                </button>
              </div>
            );
          })}
        </div>

        {/* PROJECT DETAILS DRAWER */}
        <Drawer
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject ? `REF-OP: ${selectedProject.id.toUpperCase()}` : 'Détails'}
        >
          {selectedProject && (
            <div className="space-y-8 h-full flex flex-col">
              <div className="bg-brand-pale/40 border border-brand-steel/20 p-3 flex items-center gap-3 rounded-sm">
                <ShieldCheck className="text-brand-steel" size={18} />
                <div className="text-[10px] font-mono text-brand-navy uppercase tracking-widest font-bold">
                  Projet open source verifie
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-brand-navy uppercase tracking-tight">
                  {selectedProject.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge color="navy">{selectedProject.context}</Badge>
                  <Badge color="success">TERMINÉ</Badge>
                </div>
              </div>

              <div className="rounded-sm border border-brand-steel/20 bg-gradient-to-br from-brand-pale/45 via-white to-brand-pale/20 p-5 space-y-4">
                <div className="flex items-center gap-3 text-brand-navy">
                  <Layers className="text-brand-steel" size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Presentation synthetique
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedBriefing?.summary ?? selectedProject.objective}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <Target size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        Ce que ca fait
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedBriefing?.primaryUse ?? selectedProject.context}
                    </p>
                  </div>
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <LineChart size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        Valeur operationnelle
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedBriefing?.operationalValue ??
                        selectedProject.takeaways?.[0] ??
                        'Renforce la maturite cyber operationnelle.'}
                    </p>
                  </div>
                  <div className="rounded-sm border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-brand-navy">
                      <FileText size={14} className="text-brand-steel" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        Portee projet
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedProject.objective}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4 text-brand-navy">
                  <Workflow className="text-brand-steel" size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Cycle operationnel type
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {(selectedBriefing?.workflow ?? []).map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="relative rounded-sm border border-slate-200 bg-white p-3 flex items-start gap-3"
                    >
                      {index < (selectedBriefing?.workflow.length ?? 0) - 1 && (
                        <ChevronRight
                          size={16}
                          className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-brand-steel"
                        />
                      )}
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pale text-[10px] font-bold text-brand-navy">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProject.takeaways && (
                <div>
                  <div className="flex items-center gap-3 mb-4 text-brand-navy">
                    <ListChecks className="text-brand-gold" size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">
                      Points cles pour Cyber Guide
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {selectedProject.takeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-brand-gold rounded-full flex-shrink-0"></span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4 text-brand-navy">
                  <CheckCircle2 className="text-slate-400" size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs text-slate-500">
                    Donnees verifiables
                  </span>
                </div>
                <div className="pl-4 border-l-2 border-slate-200 py-1">
                  <p className="text-slate-600 leading-relaxed text-sm italic">
                    "{selectedProject.result}"
                  </p>
                </div>
                {selectedMetrics.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {selectedMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2"
                      >
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
                <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-100 pb-2">
                  <Cpu size={14} />
                  <span className="text-xs font-mono uppercase tracking-widest">
                    Technologies utilisees
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {selectedProject.technologies.map((t) => (
                    <TechBadge key={t} tech={t} />
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-auto sticky bottom-0 bg-white pb-4 border-t border-slate-100">
                {selectedProject.link && selectedProject.link !== '#' ? (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full block group"
                  >
                    <Button variant="primary" className="w-full flex justify-between" size="lg">
                      <span>Consulter la source GitHub</span>
                      <Github
                        size={18}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </Button>
                  </a>
                ) : (
                  <div className="p-4 bg-slate-100 border border-slate-200 text-center rounded-sm flex flex-col items-center gap-2">
                    <ShieldAlert size={24} className="text-slate-400" />
                    <span className="text-xs font-mono text-slate-500 uppercase font-bold">
                      Source non disponible
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-xs">
                      Aucun lien public n est fourni pour ce projet.
                    </span>
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
