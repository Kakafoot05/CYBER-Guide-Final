import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Lock, FileText, BookOpen, Network, Activity } from 'lucide-react';
import { Button, BlueprintPanel, Badge, TechSeparator } from '../components/UI';
import { Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import { Seo } from '../components/Seo';
import { guides } from '../guides';
import { softwares } from '../data';

type ThreatFocus = {
  cve: string;
  title: string;
  product: string;
  severity: 'Critique' | 'Élevée' | 'Moyenne';
  cvss: string;
  attackVector: string;
  patchWindow: string;
  summary: string;
  recommendedAction: string;
  radar: {
    surface: number;
    exploitability: number;
    impact: number;
    detection: number;
    patchPriority: number;
    remediationReadiness: number;
  };
};

const THREAT_FOCUS_CALENDAR: ThreatFocus[] = [
  {
    cve: 'CVE-2024-21887',
    title: 'Bypass authentification sur passerelle VPN',
    product: 'Ivanti Connect Secure',
    severity: 'Critique',
    cvss: '9.1',
    attackVector: 'Accès distant pré-auth',
    patchWindow: '< 72h',
    summary: "Focus du mois sur les équipements d'accès distant et leur surface Internet.",
    recommendedAction:
      "Patcher en priorité, isoler l'interface d'administration et vérifier les comptes ajoutés récemment.",
    radar: {
      surface: 86,
      exploitability: 83,
      impact: 80,
      detection: 62,
      patchPriority: 92,
      remediationReadiness: 71,
    },
  },
  {
    cve: 'CVE-2024-3400',
    title: 'Exécution de code sur firewall',
    product: 'Palo Alto PAN-OS',
    severity: 'Critique',
    cvss: '10.0',
    attackVector: 'Interface management web',
    patchWindow: '< 48h',
    summary: 'Failles edge critiques: priorité aux firewalls exposés et aux accès admin.',
    recommendedAction:
      "Appliquer le correctif éditeur et restreindre l'accès management à un segment d'administration dédié.",
    radar: {
      surface: 90,
      exploitability: 88,
      impact: 89,
      detection: 67,
      patchPriority: 95,
      remediationReadiness: 74,
    },
  },
  {
    cve: 'CVE-2024-1709',
    title: 'Auth bypass + RCE sur outil remote support',
    product: 'ConnectWise ScreenConnect',
    severity: 'Critique',
    cvss: '10.0',
    attackVector: 'Portail web exposé',
    patchWindow: '< 72h',
    summary:
      'Les outils de support distant restent des cibles majeures pour la compromission initiale.',
    recommendedAction:
      'Mettre à jour le serveur, auditer les comptes administrateurs et imposer MFA sur le portail.',
    radar: {
      surface: 82,
      exploitability: 84,
      impact: 86,
      detection: 65,
      patchPriority: 91,
      remediationReadiness: 73,
    },
  },
  {
    cve: 'CVE-2024-21762',
    title: 'RCE sur VPN SSL',
    product: 'Fortinet FortiOS / FortiProxy',
    severity: 'Critique',
    cvss: '9.6',
    attackVector: 'SSL VPN public',
    patchWindow: '< 72h',
    summary: "Le périmètre VPN est suivi en continu car il concentre les tentatives d'intrusion.",
    recommendedAction:
      "Corriger les appliances concernées, renforcer les ACL d'accès VPN et surveiller les connexions anormales.",
    radar: {
      surface: 88,
      exploitability: 84,
      impact: 82,
      detection: 64,
      patchPriority: 93,
      remediationReadiness: 72,
    },
  },
  {
    cve: 'CVE-2024-27198',
    title: 'Bypass authentification serveur CI/CD',
    product: 'JetBrains TeamCity',
    severity: 'Élevée',
    cvss: '9.8',
    attackVector: 'Console web CI/CD',
    patchWindow: '< 5 jours',
    summary: 'Ce mois met le focus sur les plateformes de build et la chaîne logicielle.',
    recommendedAction:
      "Mettre à jour TeamCity, invalider les tokens d'accès et revoir les droits des comptes de service.",
    radar: {
      surface: 77,
      exploitability: 79,
      impact: 84,
      detection: 68,
      patchPriority: 88,
      remediationReadiness: 75,
    },
  },
  {
    cve: 'CVE-2024-24919',
    title: 'Lecture de fichiers sensibles sur gateway',
    product: 'Check Point Security Gateway',
    severity: 'Élevée',
    cvss: '8.6',
    attackVector: 'Portail VPN / remote access',
    patchWindow: '< 5 jours',
    summary: "Surveillance des gateways: priorité à l'hygiène de configuration des accès distants.",
    recommendedAction:
      "Déployer le hotfix, vérifier l'intégrité des certificats et contrôler les logs d'accès externes.",
    radar: {
      surface: 78,
      exploitability: 76,
      impact: 72,
      detection: 66,
      patchPriority: 85,
      remediationReadiness: 76,
    },
  },
  {
    cve: 'CVE-2024-6387',
    title: 'Race condition OpenSSH (regreSSHion)',
    product: 'OpenSSH',
    severity: 'Élevée',
    cvss: '8.1',
    attackVector: 'Service SSH exposé',
    patchWindow: '< 7 jours',
    summary: "L'axe du mois couvre les accès Linux exposés et la robustesse des bastions.",
    recommendedAction:
      "Appliquer les mises à jour SSH, réduire l'exposition Internet directe et imposer une authentification forte.",
    radar: {
      surface: 74,
      exploitability: 69,
      impact: 77,
      detection: 71,
      patchPriority: 82,
      remediationReadiness: 79,
    },
  },
  {
    cve: 'CVE-2024-3273',
    title: 'Backdoor via crédentials codés en dur',
    product: 'NAS D-Link (gammes affectées)',
    severity: 'Élevée',
    cvss: '8.8',
    attackVector: 'Équipement edge web',
    patchWindow: '< 5 jours',
    summary: 'Le focus porte sur les équipements non managés qui échappent souvent au patch cycle.',
    recommendedAction:
      'Identifier les modèles concernés, segmenter ces actifs et planifier remplacement ou correctif constructeur.',
    radar: {
      surface: 81,
      exploitability: 78,
      impact: 70,
      detection: 58,
      patchPriority: 84,
      remediationReadiness: 60,
    },
  },
  {
    cve: 'CVE-2024-40711',
    title: 'RCE sur plateforme de sauvegarde',
    product: 'Veeam Backup & Replication',
    severity: 'Critique',
    cvss: '9.8',
    attackVector: 'Console backup management',
    patchWindow: '< 72h',
    summary:
      'Les infrastructures de sauvegarde restent prioritaires pour la résilience ransomware.',
    recommendedAction:
      'Patcher immédiatement, durcir les comptes de service et isoler le plan de management backup.',
    radar: {
      surface: 75,
      exploitability: 80,
      impact: 90,
      detection: 69,
      patchPriority: 93,
      remediationReadiness: 70,
    },
  },
  {
    cve: 'CVE-2023-4966',
    title: 'Vol de session sur portail applicatif',
    product: 'Citrix NetScaler',
    severity: 'Critique',
    cvss: '9.4',
    attackVector: 'Gateway / ADC exposé',
    patchWindow: '< 72h',
    summary: "Le mois cible les risques de détournement de session sur les couches d'accès.",
    recommendedAction:
      'Patcher ADC, invalider toutes les sessions actives et renforcer la journalisation côté reverse proxy.',
    radar: {
      surface: 84,
      exploitability: 82,
      impact: 86,
      detection: 61,
      patchPriority: 92,
      remediationReadiness: 73,
    },
  },
  {
    cve: 'CVE-2023-20198',
    title: 'Création de compte admin non autorisé',
    product: 'Cisco IOS XE',
    severity: 'Critique',
    cvss: '10.0',
    attackVector: 'Interface web admin',
    patchWindow: '< 72h',
    summary: "Focus sur l'intégrité des équipements réseau en bordure de SI.",
    recommendedAction:
      'Appliquer les versions corrigées, rechercher les comptes inconnus et réinitialiser les secrets réseau.',
    radar: {
      surface: 87,
      exploitability: 85,
      impact: 88,
      detection: 63,
      patchPriority: 94,
      remediationReadiness: 72,
    },
  },
  {
    cve: 'CVE-2024-4577',
    title: 'Injection sur interpréteur PHP-CGI',
    product: 'Serveurs PHP sous Windows',
    severity: 'Élevée',
    cvss: '9.8',
    attackVector: 'Application web exposée',
    patchWindow: '< 5 jours',
    summary:
      'Le focus clôture annuellement sur la surface applicative internet et les stacks legacy.',
    recommendedAction:
      'Mettre à jour PHP, déployer WAF en mode blocage et vérifier les webshells sur les hôtes concernés.',
    radar: {
      surface: 79,
      exploitability: 81,
      impact: 76,
      detection: 66,
      patchPriority: 86,
      remediationReadiness: 74,
    },
  },
];

type RadarKey = keyof ThreatFocus['radar'];

const RADAR_AXES: { key: RadarKey; label: string; valueClassName: string }[] = [
  { key: 'surface', label: 'Surface', valueClassName: 'text-brand-navy' },
  { key: 'exploitability', label: 'Exploitabilité', valueClassName: 'text-brand-navy' },
  { key: 'impact', label: 'Impact métier', valueClassName: 'text-brand-navy' },
  { key: 'detection', label: 'Détection', valueClassName: 'text-brand-steel' },
  { key: 'patchPriority', label: 'Priorité patch', valueClassName: 'text-brand-gold' },
  { key: 'remediationReadiness', label: 'Remédiation', valueClassName: 'text-brand-steel' },
];

const RADAR_CENTER = 90;
const RADAR_MAX_RADIUS = 68;
const RADAR_LEVELS = [1, 0.75, 0.5, 0.25];

const toRadarPoint = (index: number, scale: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / RADAR_AXES.length;
  const x = RADAR_CENTER + Math.cos(angle) * RADAR_MAX_RADIUS * scale;
  const y = RADAR_CENTER + Math.sin(angle) * RADAR_MAX_RADIUS * scale;
  return { x, y };
};

const buildRadarPolygon = (scales: number[]) =>
  scales
    .map((scale, index) => {
      const point = toRadarPoint(index, scale);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(' ');

const SEVERITY_BADGE_CLASSNAMES: Record<ThreatFocus['severity'], string> = {
  Critique: '!bg-red-500/20 !text-red-100 !border-red-300/30',
  Élevée: '!bg-orange-500/20 !text-orange-100 !border-orange-300/30',
  Moyenne: '!bg-blue-500/20 !text-blue-100 !border-blue-300/30',
};

const Home: React.FC = () => {
  const showcasedSoftwares = softwares.slice(0, 12);
  const now = new Date();
  const monthIndex = now.getMonth();
  const threatFocus = THREAT_FOCUS_CALENDAR[monthIndex];
  const radarScales = RADAR_AXES.map((axis) => threatFocus.radar[axis.key] / 100);
  const radarPolygonPoints = buildRadarPolygon(radarScales);
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(now)
    .replace(/^./, (char) => char.toUpperCase());
  const blueprintLabel = `THREAT_INDEX_${now.getFullYear()}`;
  const severityBadgeClassName = SEVERITY_BADGE_CLASSNAMES[threatFocus.severity];

  return (
    <>
      <Seo
        title="Cyber Guide - Plateforme Blue Team"
        description="Cyber Guide centralise analyses, templates et outils defensifs pour accelerer la maturite cyber des equipes Blue Team."
        path="/"
        image="/assets/og/home.svg"
        keywords={[
          'cybersecurite',
          'blue team',
          'templates cyber',
          'threat intelligence',
          'analyses cyber',
          'NIS2',
        ]}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Cyber Guide',
            url: 'https://cyber-guide.fr',
            inLanguage: 'fr-FR',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://cyber-guide.fr/analyses?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Cyber Guide',
            url: 'https://cyber-guide.fr',
            logo: 'https://cyber-guide.fr/assets/cyberguide-icon-512.png',
            sameAs: ['https://cyber.gouv.fr', 'https://www.nist.gov/cyberframework'],
          },
        ]}
      />
      {/* HERO SECTION - BRAND FOCUS */}
      <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 bg-brand-navy overflow-hidden">
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-brand-steel/10 via-brand-steel/5 to-transparent pointer-events-none"></div>
        <div className="absolute -left-20 top-1/4 w-96 h-96 bg-brand-steel/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col items-start">
              <Reveal>
                {/* --- BRAND HERO LOCKUP --- */}
                {/* Logo wordmark principal */}
                <div className="mb-10 relative group">
                  <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <img
                    src="/assets/cyberguide-logo-adapted.png"
                    alt="Cyber Guide - Security Intelligence"
                    className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain relative z-10 brightness-110 contrast-125 saturate-110 drop-shadow-[0_0_26px_rgba(142,182,240,0.4)]"
                    width={888}
                    height={290}
                    decoding="async"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                {/* H1 Focus Produit (Pas de répétition du nom) */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-8">
                  L'Art de la Défense <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-steel via-brand-light to-white">
                    Opérationnelle
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-10 border-l-2 border-brand-steel pl-6">
                  Plateforme d'analyse, outils de triage et référentiels pour les équipes Blue Team.
                  Structurez votre défense avec des templates opérationnels validés par les
                  standards.
                </p>
                <div className="mb-8 flex flex-wrap gap-2">
                  {['Defensif uniquement', 'Guides actionnables', 'Basee sur standards'].map(
                    (chip) => (
                      <span
                        key={chip}
                        className="rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-brand-pale"
                      >
                        {chip}
                      </span>
                    ),
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/analyses">
                    <Button
                      as="span"
                      variant="primary"
                      size="lg"
                      icon={BarChart3}
                      className="shadow-[0_0_20px_rgba(47,94,166,0.3)]"
                    >
                      Consulter les analyses
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button as="span" variant="secondary" size="lg" icon={BookOpen}>
                      Ouvrir les templates
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <Link to="/guides" className="hover:text-brand-light transition-colors">
                    Parcours guides
                  </Link>
                  <Link to="/outils" className="hover:text-brand-light transition-colors">
                    Outils de triage
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right Side: Abstract Data Viz Panel */}
            <div className="hidden lg:col-span-5 lg:block relative h-full min-h-[400px]">
              <Reveal delay={0.4} className="h-full w-full">
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-steel/20 to-transparent rounded-sm blur-sm transform translate-x-2 translate-y-2"></div>
                  <BlueprintPanel
                    className="text-brand-navy h-full relative z-10 border-brand-steel/30"
                    label={blueprintLabel}
                  >
                    <div className="space-y-4 py-2">
                      <div className="rounded-sm border border-brand-navy/20 bg-gradient-to-br from-brand-navy to-[#163767] p-4 text-white shadow-ambient-xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-light">
                              Vulnérabilité du mois
                            </div>
                            <div className="mt-1 text-[11px] font-mono uppercase tracking-wide text-brand-pale">
                              {monthLabel}
                            </div>
                            <div className="mt-2 text-xl font-display font-bold">
                              {threatFocus.cve}
                            </div>
                            <div className="text-sm font-medium text-brand-pale">
                              {threatFocus.title}
                            </div>
                            <div className="mt-2 text-[11px] leading-relaxed text-brand-pale">
                              {threatFocus.summary}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-brand-pale">
                              <span className="rounded-sm border border-white/15 bg-white/5 px-2 py-1">
                                Produit: {threatFocus.product}
                              </span>
                              <span className="rounded-sm border border-white/15 bg-white/5 px-2 py-1">
                                Patch: {threatFocus.patchWindow}
                              </span>
                            </div>
                          </div>
                          <Badge className={severityBadgeClassName}>
                            {threatFocus.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-sm border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Activity size={11} className="text-brand-steel" />
                            Radar de priorisation
                          </span>
                          <span>{threatFocus.cve}</span>
                        </div>

                        <div className="grid grid-cols-[1.2fr_1fr] gap-3 items-center">
                          <svg viewBox="0 0 180 180" className="w-full h-[170px]">
                            {RADAR_LEVELS.map((level) => (
                              <polygon
                                key={level}
                                points={buildRadarPolygon(RADAR_AXES.map(() => level))}
                                fill="none"
                                stroke="#dbe4f1"
                                strokeWidth="1"
                              />
                            ))}

                            {RADAR_AXES.map((_, index) => {
                              const axisPoint = toRadarPoint(index, 1);
                              return (
                                <line
                                  key={`axis-${index}`}
                                  x1={RADAR_CENTER}
                                  y1={RADAR_CENTER}
                                  x2={axisPoint.x}
                                  y2={axisPoint.y}
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            <polygon
                              points={radarPolygonPoints}
                              fill="rgba(47,94,166,0.20)"
                              stroke="#2F5EA6"
                              strokeWidth="2"
                            />

                            {radarScales.map((scale, index) => {
                              const point = toRadarPoint(index, scale);
                              return (
                                <circle
                                  key={`point-${index}`}
                                  cx={point.x}
                                  cy={point.y}
                                  r="2.5"
                                  fill="#2F5EA6"
                                />
                              );
                            })}
                          </svg>

                          <div className="space-y-1.5 text-[11px]">
                            {RADAR_AXES.map((axis) => (
                              <div
                                key={axis.key}
                                className="flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50 px-2 py-1"
                              >
                                <span className="text-slate-500">{axis.label}</span>
                                <strong className={axis.valueClassName}>
                                  {threatFocus.radar[axis.key]}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                          Indice interne (0-100) pour prioriser patching et mesures compensatoires.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                            CVSS (NVD)
                          </div>
                          <div className="mt-1 text-3xl font-display font-bold text-brand-navy">
                            {threatFocus.cvss}
                          </div>
                          <div className="mt-2">
                            <Badge color="alert">PATCH PRIORITAIRE</Badge>
                          </div>
                        </div>
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                            Vecteur principal
                          </div>
                          <div className="mt-1 text-sm font-display font-bold leading-snug text-brand-gold">
                            {threatFocus.attackVector}
                          </div>
                          <div className="mt-2">
                            <Badge color="gold">{threatFocus.patchWindow}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-sm border border-slate-200 bg-white p-3">
                        <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                          Action Blue Team recommandée
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-brand-navy">
                          {threatFocus.recommendedAction}
                        </p>
                        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                          Sélection éditoriale mensuelle Cyber Guide pour orienter la priorisation
                          sécurité.
                        </p>
                      </div>

                      <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>CYCLE MENSUEL</span>
                          <span className="flex items-center gap-2 text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            VEILLE ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </BlueprintPanel>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGIC PILLARS */}
      <section className="section-auto py-24 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal width="100%">
              <h2 className="text-3xl font-display font-bold text-brand-navy mb-4">
                Dossiers Stratégiques
              </h2>
              <div className="h-1 w-20 bg-brand-steel mx-auto"></div>
            </Reveal>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Identity */}
            <StaggerItem>
              <Link to="/analyses/identite-mfa-fatigue" className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="SEC-OPS-01"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Lock size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    Email, MFA & Identité
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    La première ligne de défense. Analyse des contournements MFA et fatigue
                    attaques.
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    ACCÉDER AU DOSSIER{' '}
                    <ArrowRight
                      size={14}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </BlueprintPanel>
              </Link>
            </StaggerItem>

            {/* Card 2: Assurance */}
            <StaggerItem>
              <Link to="/analyses/ad-tiering" className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="STRAT-02"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold transition-colors duration-300 shadow-sm">
                    <Network size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    Active Directory Tiering
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Segmentation T0/T1/T2 et durcissement des privilèges pour bloquer les mouvements
                    latéraux.
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    ACCÉDER AU DOSSIER{' '}
                    <ArrowRight
                      size={14}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </BlueprintPanel>
              </Link>
            </StaggerItem>

            {/* Card 3: NIS2 */}
            <StaggerItem>
              <Link to="/analyses/ransomware-readiness" className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="COMPLIANCE-03"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors duration-300 shadow-sm">
                    <FileText size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    Preparation Ransomware
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Au-dela des sauvegardes: plans de reprise, confinement et reconstruction
                    operationnelle.
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    ACCÉDER AU DOSSIER{' '}
                    <ArrowRight
                      size={14}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </BlueprintPanel>
              </Link>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-12 text-center">
            <Reveal delay={0.4} width="100%">
              <Link to="/analyses">
                <Button as="span" variant="ghost" icon={ArrowRight}>
                  Voir tous les dossiers
                </Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-auto border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-display font-bold text-brand-navy">
              Guides operationnels
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-slate-600">
              Parcours complets pour passer de l analyse a l execution: Active Directory, ransomware
              et conformite NIS2.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.slug} to={`/guides/${guide.slug}`} className="group block">
                <div className="h-full rounded-sm border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-brand-steel">
                  <div className="mb-2 text-xs font-mono uppercase tracking-widest text-brand-steel">
                    {guide.category}
                  </div>
                  <h3 className="mb-2 text-lg font-display font-bold text-brand-navy group-hover:text-brand-steel">
                    {guide.title}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">{guide.excerpt}</p>
                  <span className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel">
                    Lire le guide <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/guides">
              <Button as="span" variant="ghost" icon={ArrowRight}>
                Voir tous les guides
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-auto bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-display font-bold text-brand-navy">
              Logiciels de reference
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-600">
              Cyber Guide s'appuie sur un ecosysteme d'outils reconnus pour la detection,
              l'investigation et la remediation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {showcasedSoftwares.map((software) => (
              <Link
                key={software.id}
                to="/outils"
                className="group rounded-sm border border-slate-200 bg-white p-3 transition-colors hover:border-brand-steel"
              >
                <div className="mb-2 flex h-10 items-center justify-center rounded-sm border border-slate-100 bg-slate-50 p-1">
                  {software.logoPath ? (
                    <img
                      src={software.logoPath}
                      alt={`Logo ${software.name}`}
                      className="max-h-full max-w-full object-contain"
                      width={28}
                      height={28}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-600">
                      {software.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="text-center text-[11px] font-medium text-slate-600 group-hover:text-brand-navy">
                  {software.name}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link to="/outils">
              <Button as="span" variant="ghost" size="sm" icon={ArrowRight}>
                Voir le catalogue logiciel complet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TechSeparator />

      {/* STATS STRIP */}
      <section className="section-auto py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <StaggerItem className="pl-4">
              <div className="text-2xl font-display font-bold text-brand-navy mb-2">
                {threatFocus.cve}
              </div>
              <div className="text-xs font-mono uppercase text-slate-500">
                Vulnerabilite du mois
              </div>
            </StaggerItem>
            <StaggerItem className="pl-4">
              <div className="text-4xl font-display font-bold text-brand-navy mb-2">
                {threatFocus.cvss}
              </div>
              <div className="text-xs font-mono uppercase text-slate-500">Score CVSS (NVD)</div>
            </StaggerItem>
            <StaggerItem className="pl-4">
              <div className="text-4xl font-display font-bold text-brand-navy mb-2">
                {threatFocus.patchWindow}
              </div>
              <div className="text-xs font-mono uppercase text-slate-500">
                Fenetre de patch recommandee
              </div>
            </StaggerItem>
            <StaggerItem className="pl-4">
              <div className="text-xl font-display font-bold text-brand-navy mb-2">
                {threatFocus.attackVector}
              </div>
              <div className="text-xs font-mono uppercase text-slate-500">
                Vecteur d attaque prioritaire
              </div>
            </StaggerItem>
          </StaggerContainer>
          <Reveal delay={0.5} width="100%">
            <div className="text-center mt-12 text-xs text-slate-400 italic">
              Source: CVE/NVD et veille editeur consolidees par Cyber Guide
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Home;
