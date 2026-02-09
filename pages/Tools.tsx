import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldHeader,
  BlueprintPanel,
  Button,
  Badge,
  Drawer,
  TechSeparator,
  TechBadge,
  type BadgeColor,
} from '../components/UI';
import { tools, softwares } from '../data';
import {
  IncidentReportIcon,
  LogInvestigatorIcon,
  PhishingTriageIcon,
  GenericToolIcon,
} from '../components/icons/VendorLogos';
import {
  Play,
  RotateCcw,
  Activity,
  FileJson,
  Table as TableIcon,
  AlertTriangle,
  Clock,
  Terminal,
  Search,
  Monitor,
  Github,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { Tool, Software } from '../types';
import { Seo } from '../components/Seo';

// MAPPING ID -> ICONE CUSTOM
type LogoComponent = React.ComponentType<{ className?: string; size?: number }>;

const TOOL_LOGOS: Record<string, LogoComponent> = {
  t1: IncidentReportIcon,
  t2: LogInvestigatorIcon,
  t3: PhishingTriageIcon,
};

// --- SECTION STACK ECOSYSTEM ---
const STACK_GROUPS = [
  {
    id: 'siem',
    title: 'SIEM & Logs',
    focus: 'Detection, correlation, investigation',
    members: ['Splunk Enterprise Security', 'Elastic Security', 'OpenSearch', 'Graylog'],
  },
  {
    id: 'perimeter',
    title: 'Perimetre',
    focus: 'Filtrage, edge, acces distant',
    members: ['FortiGate', 'Palo Alto NGFW', 'Cloudflare', 'OpenVPN'],
  },
  {
    id: 'identity',
    title: 'Identite',
    focus: 'MFA, IAM, secrets',
    members: ['Okta', 'Bitwarden', 'KeePassXC'],
  },
  {
    id: 'visibility',
    title: 'Visibilite',
    focus: 'Reseau et observabilite',
    members: ['Wireshark', 'Grafana', 'Kibana'],
  },
] as const;

const StackEcosystem: React.FC = () => {
  const softwareByName = useMemo(
    () => new Map(softwares.map((software) => [software.name, software] as const)),
    [],
  );

  return (
    <div className="mb-16 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-navy">
          Ecosysteme logiciels
        </h3>
        <p className="mx-auto max-w-3xl text-sm text-slate-600">
          Selection d'outils utilises dans des parcours cybersécurité operationnelle: prevention,
          detection, investigation et remediations.
        </p>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-brand-steel"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {STACK_GROUPS.map((group) => (
          <div
            key={group.id}
            className="rounded-sm border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-brand-steel hover:shadow-md"
          >
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-navy">
                {group.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500">{group.focus}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {group.members.map((member) => {
                const software = softwareByName.get(member);
                if (!software) return null;

                return (
                  <div
                    key={software.id}
                    className="flex items-center gap-2 rounded-sm border border-slate-100 bg-slate-50 p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-slate-200 bg-white p-1">
                      {software.logoPath ? (
                        <img
                          src={software.logoPath}
                          alt={`Logo ${software.name}`}
                          className="h-5 w-5 object-contain"
                          width={20}
                          height={20}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600">
                          {software.name.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{software.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToolDemo: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleRun = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsRunning(true);
    setHasRun(false);
    timeoutRef.current = window.setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      timeoutRef.current = null;
    }, 1500);
  };

  const handleReset = () => {
    setHasRun(false);
    setIsRunning(false);
  };

  const ToolLogo = TOOL_LOGOS[tool.id] ?? GenericToolIcon;

  return (
    <BlueprintPanel
      className="mb-12 group hover:border-brand-steel transition-colors duration-300"
      label={`MODULE: ${tool.id}`}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Description Side */}
        <div>
          {/* TOOL HEADER WITH CUSTOM LOGO */}
          <div className="flex items-start gap-5 mb-6">
            <div className="p-3 bg-brand-navy text-white rounded-sm shadow-md group-hover:bg-brand-steel transition-colors duration-300 flex-shrink-0">
              <ToolLogo size={48} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-display font-bold text-brand-navy">{tool.name}</h3>
                <Badge
                  color={tool.status.toLowerCase().includes('demo') ? 'success' : 'mono'}
                  className="hidden sm:inline-flex"
                >
                  {tool.status}
                </Badge>
              </div>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-wide">
                Cellule {tool.category}
              </p>
            </div>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed text-sm lg:text-base border-l-2 border-slate-100 pl-4">
            {tool.description}
          </p>

          <div className="mb-8">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={14} className="text-brand-steel" /> Capacites
            </h4>
            <div className="flex flex-wrap gap-2">
              {tool.features.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-sm border border-slate-200 font-medium font-mono"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              icon={Play}
              variant="primary"
              className="shadow-lg shadow-brand-steel/10"
            >
              {isRunning ? 'Simulation en cours...' : 'Lancer le module'}
            </Button>
            {hasRun && (
              <Button onClick={handleReset} variant="ghost" icon={RotateCcw}>
                Reinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Visualisation Side */}
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-1 min-h-[350px] flex flex-col relative overflow-hidden shadow-inner">
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Terminal size={12} className="text-brand-steel" />
              <span>FLUX_RESULTATS</span>
            </div>
            <div className="flex gap-2">
              <FileJson size={14} className="text-slate-300" />
              <TableIcon size={14} className="text-slate-300" />
            </div>
          </div>

          <div className="p-4 flex-grow font-mono text-sm overflow-auto relative bg-slate-50/50">
            {/* IDLE STATE */}
            {!isRunning && !hasRun && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                <ToolLogo size={64} className="text-slate-300 mb-4 opacity-50" />
                <p className="text-xs uppercase tracking-widest">En attente de donnees...</p>
              </div>
            )}

            {/* LOADING STATE */}
            {isRunning && (
              <div className="space-y-3 animate-pulse pt-4">
                <div className="flex items-center gap-2 text-xs text-brand-steel font-bold">
                  <Activity size={12} className="animate-spin" /> TRAITEMENT...
                </div>
                <div className="h-1.5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-1.5 bg-slate-200 rounded w-1/2"></div>
                <div className="h-1.5 bg-slate-200 rounded w-5/6"></div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="h-20 bg-slate-100 rounded border border-slate-200"></div>
                </div>
              </div>
            )}

            {/* FINISHED STATE */}
            {hasRun && (
              <div className="animate-fade-in-up">
                {tool.id === 't1' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-sm">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">
                            Incident
                          </div>
                          <div className="font-bold text-brand-navy">IR-2026-X89</div>
                        </div>
                        <Badge color="alert">CRITIQUE</Badge>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Clock size={10} /> Chronologie
                          </div>
                          <div className="border-l-2 border-slate-200 ml-1.5 pl-3 space-y-3">
                            <div className="relative">
                              <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                              <div className="text-[10px] text-slate-400">10:42 UTC</div>
                              <div className="text-xs text-slate-700">Acces initial (phishing)</div>
                            </div>
                            <div className="relative">
                              <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                              <div className="text-[10px] text-slate-400">10:45 UTC</div>
                              <div className="text-xs text-slate-700 font-bold">
                                Execution PowerShell
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tool.id === 't2' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow bg-slate-900 rounded-sm overflow-hidden text-[10px] font-mono leading-relaxed shadow-inner border border-slate-700 p-2 text-slate-300">
                      <div className="opacity-50">Logon Success | User: SYSTEM</div>
                      <div className="text-red-400 font-bold my-1">
                        {'>>>'} ALERT: Brute Force Detect (Count: 52)
                      </div>
                      <div className="opacity-50">Logon Failed | User: Admin</div>
                    </div>
                    <div className="mt-2 p-2 bg-white border border-slate-200 text-xs text-slate-600 rounded-sm">
                      <strong>Analyse:</strong> motif d'attaque confirme.
                    </div>
                  </div>
                )}

                {tool.id === 't3' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-sm flex items-start gap-3">
                      <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block text-xs uppercase tracking-wide mb-1">
                          Verdict : malveillant
                        </strong>
                        <span className="text-xs">Phishing detecte avec forte confiance.</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                      <span>Moteur: heuristiques statiques</span>
                      <span className="font-bold text-brand-navy">Score de risque: 98/100</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BlueprintPanel>
  );
};

// --- COMPOSANT : CARTE LOGICIEL ---
const SoftwareCard: React.FC<{ software: Software; onClick: () => void }> = ({
  software,
  onClick,
}) => {
  const getLicenseColor = (lic: string): BadgeColor => {
    if (lic === 'Open Source') return 'success';
    if (lic === 'Paid') return 'navy';
    if (lic === 'Free') return 'steel';
    return 'mono';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-steel"
      aria-label={`Ouvrir les détails du logiciel ${software.name}`}
    >
      <BlueprintPanel className="h-full flex flex-col hover:border-brand-steel transition-colors group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-navy font-bold font-display shadow-sm group-hover:bg-brand-pale group-hover:text-brand-steel transition-colors p-1">
              {software.logoPath ? (
                <img
                  src={software.logoPath}
                  alt={`Logo ${software.name}`}
                  className="max-h-full max-w-full object-contain"
                  width={24}
                  height={24}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                software.name.substring(0, 2)
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-brand-navy leading-none">
                {software.name}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {software.category}
              </span>
            </div>
          </div>
          <Badge color={getLicenseColor(software.license)} className="text-[9px]">
            {software.license}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {software.description}
        </p>

        {software.useCases.length > 0 && (
          <p className="mb-4 text-xs text-slate-500">
            Cas d'usage: <span className="font-medium text-slate-600">{software.useCases[0]}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-6">
          {software.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-[9px] text-slate-400 rounded-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 mt-auto flex gap-2">
          <span className="text-xs font-bold text-brand-steel group-hover:underline">
            Voir details
          </span>
        </div>
      </BlueprintPanel>
    </button>
  );
};

// --- PAGE PRINCIPALE ---
const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demos' | 'directory'>('demos');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(softwares.map((s) => s.category))).sort()],
    [],
  );

  const filteredSoftwares = softwares.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.useCases.some((useCase) => useCase.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Outils Cyber et Logiciels Operationnels"
        description="Catalogue d'outils defensifs: demos interactives, triage, investigation et selection de logiciels cyber."
        path="/outils"
        image="/assets/og/tools.svg"
        keywords={['outils cyber', 'cybersecurite operationnelle', 'DFIR', 'triage', 'investigation']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Boite a outils Cyber Guide',
          url: 'https://cyber-guide.fr/outils',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: softwares.map((software, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: software.name,
              url: software.officialUrl,
            })),
          },
        }}
      />
      <ShieldHeader
        title="Boite a outils"
        subtitle="Technique"
        meta={['Traitement local', 'Confidentialite', 'DFIR']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TABS SWITCHER */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-sm border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setActiveTab('demos')}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
                activeTab === 'demos'
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'text-slate-500 hover:text-brand-navy hover:bg-slate-50'
              }`}
            >
              <Activity size={14} /> Demos interactives
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
                activeTab === 'directory'
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'text-slate-500 hover:text-brand-navy hover:bg-slate-50'
              }`}
            >
              <Layers size={14} /> Logiciels & Outils
            </button>
          </div>
        </div>

        <div className="mb-10 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
              Maillage operationnel
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Associez ces outils a un guide pilier pour cadrer les priorites puis a un template
              pour execution.
            </p>
          </div>
          <div className="flex items-center justify-start gap-4 md:justify-end">
            <Link to="/guides">
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                Ouvrir les guides
              </Button>
            </Link>
            <Link
              to="/templates"
              className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
            >
              Voir aussi les templates
            </Link>
          </div>
        </div>

        {/* VIEW 1: MODULES INTERNES */}
        {activeTab === 'demos' && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            {/* NEW STACK SECTION */}
            <StackEcosystem />

            {tools.map((tool) => (
              <ToolDemo key={tool.id} tool={tool} />
            ))}

            <div className="mt-12 p-8 bg-brand-pale/30 border border-brand-steel/10 rounded-sm text-center">
              <h4 className="text-brand-navy font-display font-bold mb-2">Plus d'outils a venir</h4>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Nos modules de tri et d'analyse sont en developpement constant. Les outils de type
                "cote client" garantissent que vos donnees ne quittent jamais votre navigateur.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGICIELS EXTERNES */}
        {activeTab === 'directory' && (
          <div className="animate-fade-in-up">
            {/* SEARCH & FILTERS - Simplified */}
            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow relative w-full">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                  Recherche
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Nom, tag..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                  Categorie
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none bg-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'Toutes' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSoftwares.map((soft) => (
                <SoftwareCard
                  key={soft.id}
                  software={soft}
                  onClick={() => setSelectedSoftware(soft)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SOFTWARE DETAILS DRAWER */}
        <Drawer
          isOpen={!!selectedSoftware}
          onClose={() => setSelectedSoftware(null)}
          title={selectedSoftware ? `LOGICIEL: ${selectedSoftware.id.toUpperCase()}` : ''}
        >
          {selectedSoftware && (
            <div className="space-y-8 pb-12">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-slate-200 bg-white p-2">
                    {selectedSoftware.logoPath ? (
                      <img
                        src={selectedSoftware.logoPath}
                        alt={`Logo ${selectedSoftware.name}`}
                        className="max-h-full max-w-full object-contain"
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-600">
                        {selectedSoftware.name.substring(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <Badge color="navy">{selectedSoftware.category}</Badge>
                    {selectedSoftware.vendor && (
                      <p className="mt-1 text-[11px] font-mono uppercase text-slate-400">
                        {selectedSoftware.vendor}
                      </p>
                    )}
                  </div>
                </div>
                <h2 className="text-3xl font-display font-bold text-brand-navy mt-2 mb-4">
                  {selectedSoftware.name}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {selectedSoftware.description}
                </p>
              </div>
              <TechSeparator />

              <div>
                <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <Monitor size={14} className="text-brand-steel" /> Compatibilite
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedSoftware.platforms.map((p) => (
                    <TechBadge key={p} tech={p} />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-4">
                  Cas d'usage prioritaires
                </h4>
                <ul className="space-y-2">
                  {selectedSoftware.useCases.map((useCase) => (
                    <li key={useCase} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand-steel" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-8 flex gap-4 sticky bottom-0 bg-white pb-4 border-t border-slate-100">
                <a
                  href={selectedSoftware.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    size="lg"
                    icon={ExternalLink}
                  >
                    Site Officiel
                  </Button>
                </a>
                {selectedSoftware.repoUrl && (
                  <a
                    href={selectedSoftware.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      size="lg"
                      icon={Github}
                    >
                      Code Source
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default Tools;
