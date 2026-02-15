import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BarChart3, Lock, FileText, BookOpen, Network, Activity } from 'lucide-react';
import { Button, BlueprintPanel, Badge, TechSeparator } from '../components/UI';
import { Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import { Seo } from '../components/Seo';
import { guides } from '../guides';
import { softwares } from '../data';
import { buildLocalizedPath, getLocaleFromPathname, type SupportedLocale } from '../utils/locale';

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

type PrioritizationKey = keyof ThreatFocus['radar'];

type RiskBand = {
  label: string;
  actionWindow: string;
  styleClassName: string;
};

type RiskDriver = {
  label: string;
  value: number;
};

const COST_FACTOR_BY_SEVERITY: Record<ThreatFocus['severity'], number> = {
  Critique: 1500,
  Élevée: 900,
  Moyenne: 450,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const computeOperationalRiskScore = (focus: ThreatFocus): number => {
  const weightedRisk =
    focus.radar.surface * 0.2 +
    focus.radar.exploitability * 0.25 +
    focus.radar.impact * 0.25 +
    focus.radar.patchPriority * 0.2 +
    (100 - focus.radar.detection) * 0.05 +
    (100 - focus.radar.remediationReadiness) * 0.05;

  return clamp(Math.round(weightedRisk), 1, 99);
};

const getRiskBand = (riskScore: number, locale: SupportedLocale): RiskBand => {
  const isEnglish = locale === 'en';

  if (riskScore >= 85) {
    return {
      label: isEnglish ? 'Critical level' : 'Niveau critique',
      actionWindow: isEnglish ? 'Immediate action (24h)' : 'Action immediate (24h)',
      styleClassName: 'text-red-700 bg-red-50 border-red-200',
    };
  }

  if (riskScore >= 70) {
    return {
      label: isEnglish ? 'High level' : 'Niveau eleve',
      actionWindow: isEnglish ? 'Priority action (72h)' : 'Action prioritaire (72h)',
      styleClassName: 'text-orange-700 bg-orange-50 border-orange-200',
    };
  }

  if (riskScore >= 55) {
    return {
      label: isEnglish ? 'Moderate level' : 'Niveau modere',
      actionWindow: isEnglish ? 'Planned action (7 days)' : 'Action planifiee (7 jours)',
      styleClassName: 'text-brand-steel bg-brand-pale/40 border-brand-steel/30',
    };
  }

  return {
    label: isEnglish ? 'Monitored level' : 'Niveau surveille',
    actionWindow: isEnglish ? 'Enhanced monitoring' : 'Suivi renforce',
    styleClassName: 'text-brand-navy bg-slate-50 border-slate-200',
  };
};

const computeFinancialRange = (
  riskScore: number,
  severity: ThreatFocus['severity'],
): { lower: number; upper: number } => {
  const baseCost = riskScore * COST_FACTOR_BY_SEVERITY[severity];
  return {
    lower: Math.round(baseCost * 0.75),
    upper: Math.round(baseCost * 1.55),
  };
};

const formatKiloEuro = (value: number, locale: SupportedLocale): string => {
  const kilo = Math.max(1, Math.round(value / 1000));
  const localeCode = locale === 'en' ? 'en-US' : 'fr-FR';
  return `${new Intl.NumberFormat(localeCode).format(kilo)} k€`;
};

const buildTopRiskDrivers = (focus: ThreatFocus, locale: SupportedLocale): RiskDriver[] => {
  const isEnglish = locale === 'en';
  const drivers: Array<{ label: string; value: number }> = [
    { label: isEnglish ? 'Internet exposure' : 'Exposition internet', value: focus.radar.surface },
    { label: isEnglish ? 'Exploitability' : 'Exploitabilite', value: focus.radar.exploitability },
    { label: isEnglish ? 'Business impact' : 'Impact metier', value: focus.radar.impact },
    {
      label: isEnglish ? 'Patch urgency' : 'Urgence de correction',
      value: focus.radar.patchPriority,
    },
    {
      label: isEnglish ? 'Detection coverage gap' : 'Couverture detection insuffisante',
      value: 100 - focus.radar.detection,
    },
    {
      label: isEnglish ? 'Remediation readiness gap' : 'Preparation remediation insuffisante',
      value: 100 - focus.radar.remediationReadiness,
    },
  ];

  return drivers.sort((left, right) => right.value - left.value).slice(0, 3);
};

const SEVERITY_BADGE_CLASSNAMES: Record<ThreatFocus['severity'], string> = {
  Critique: '!bg-red-500/20 !text-red-100 !border-red-300/30',
  Élevée: '!bg-orange-500/20 !text-orange-100 !border-orange-300/30',
  Moyenne: '!bg-blue-500/20 !text-blue-100 !border-blue-300/30',
};

const getSeverityLabel = (severity: ThreatFocus['severity'], locale: SupportedLocale): string => {
  if (locale === 'en') {
    if (severity === 'Critique') return 'CRITICAL';
    if (severity === 'Élevée') return 'HIGH';
    return 'MEDIUM';
  }

  return severity.toUpperCase();
};

const Home: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const localizedAbsolutePath = (path: string): string =>
    `https://cyber-guide.fr${buildLocalizedPath(path, locale)}`;

  const showcasedSoftwares = softwares.slice(0, 12);
  const now = new Date();
  const monthIndex = now.getMonth();
  const threatFocus = THREAT_FOCUS_CALENDAR[monthIndex];
  const riskScore = computeOperationalRiskScore(threatFocus);
  const riskBand = getRiskBand(riskScore, locale);
  const financialRange = computeFinancialRange(riskScore, threatFocus.severity);
  const topRiskDrivers = buildTopRiskDrivers(threatFocus, locale);
  const monthLabel = new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
  })
    .format(now)
    .replace(/^./, (char) => char.toUpperCase());
  const blueprintLabel = `THREAT_INDEX_${now.getFullYear()}`;
  const severityBadgeClassName = SEVERITY_BADGE_CLASSNAMES[threatFocus.severity];
  const copy = isEnglish
    ? {
        seoTitle: 'Cyber Guide - Operational cybersecurity',
        seoDescription:
          'Cyber Guide centralizes analyses, templates, and defensive tooling to structure operational cybersecurity for organizations.',
        inLanguage: 'en-US',
        heroTitleLead: 'The Craft of',
        heroTitleAccent: 'Operational Defense',
        heroDescription:
          'Analysis, triage, and procedure platform for operational cybersecurity teams. Structure your defense with templates aligned to reliable standards.',
        chips: ['Defensive only', 'Actionable guides', 'Standards-based'],
        analysesCta: 'Browse analyses',
        templatesCta: 'Open templates',
        guidesLink: 'Guides track',
        toolsLink: 'Triage tooling',
        vulnerabilityOfMonth: 'Vulnerability of the month',
        productLabel: 'Product',
        patchLabel: 'Patch',
        monthRiskIndex: 'Monthly risk index',
        quickRead: 'Quick read',
        scoreHint: 'The closer to 100, the higher the operational risk.',
        financialImpact: 'Estimated financial impact (24h-72h)',
        financialHint: 'Educational estimate for prioritization. Adapt to your business context.',
        factorLabel: 'Driver',
        priorityPatchBadge: 'PRIORITY PATCH',
        mainVector: 'Main vector',
        recommendedAction: 'Recommended operational action',
        editorialNote:
          'Monthly Cyber Guide editorial selection to orient operational prioritization.',
        monthlyCycle: 'MONTHLY CYCLE',
        activeMonitoring: 'ACTIVE MONITORING',
        strategicFiles: 'Strategic dossiers',
        openDossier: 'OPEN DOSSIER',
        viewAllDossiers: 'View all dossiers',
        card1Title: 'Email, MFA & Identity',
        card1Body: 'First line of defense. Analysis of MFA bypass and fatigue attack patterns.',
        card2Title: 'Active Directory Tiering',
        card2Body:
          'T0/T1/T2 segmentation and privilege hardening to block lateral movement attempts.',
        card3Title: 'Ransomware Readiness',
        card3Body:
          'Beyond backups: continuity, containment, and operational reconstruction planning.',
        operationalGuides: 'Operational guides',
        guidesIntro:
          'Complete tracks to move from analysis to execution: Active Directory, ransomware, and NIS2 readiness.',
        readGuide: 'Read guide',
        viewAllGuides: 'View all guides',
        softwareReferences: 'Reference software stack',
        softwareDescription:
          'Cyber Guide relies on recognized tools for detection, investigation, and remediation.',
        softwareCatalog: 'View full software catalog',
        monthVulnerabilityStat: 'Vulnerability of the month',
        patchWindowStat: 'Recommended patch window',
        attackVectorStat: 'Priority attack vector',
        sourceFootnote: 'Source: consolidated CVE/NVD and vendor monitoring by Cyber Guide',
      }
    : {
        seoTitle: 'Cyber Guide - Cybersécurité opérationnelle',
        seoDescription:
          'Cyber Guide centralise analyses, templates et outils défensifs pour structurer la cybersécurité opérationnelle des organisations françaises.',
        inLanguage: 'fr-FR',
        heroTitleLead: "L'Art de la Défense",
        heroTitleAccent: 'Opérationnelle',
        heroDescription:
          "Plateforme d'analyse, de triage et de procédures pour les équipes cybersécurité opérationnelle. Structurez votre défense avec des templates alignés sur les standards et référentiels fiables.",
        chips: ['Defensif uniquement', 'Guides actionnables', 'Basee sur standards'],
        analysesCta: 'Consulter les analyses',
        templatesCta: 'Ouvrir les templates',
        guidesLink: 'Parcours guides',
        toolsLink: 'Outils de triage',
        vulnerabilityOfMonth: 'Vulnérabilité du mois',
        productLabel: 'Produit',
        patchLabel: 'Patch',
        monthRiskIndex: 'Indice risque du mois',
        quickRead: 'Lecture rapide',
        scoreHint: 'Plus le score est proche de 100, plus le risque opérationnel est élevé.',
        financialImpact: 'Impact financier indicatif (24h-72h)',
        financialHint:
          'Estimation pédagogique pour prioriser. A adapter à votre contexte métier.',
        factorLabel: 'Facteur',
        priorityPatchBadge: 'PATCH PRIORITAIRE',
        mainVector: 'Vecteur principal',
        recommendedAction: 'Action operationnelle recommandee',
        editorialNote:
          'Sélection éditoriale mensuelle Cyber Guide pour orienter la priorisation sécurité.',
        monthlyCycle: 'CYCLE MENSUEL',
        activeMonitoring: 'VEILLE ACTIVE',
        strategicFiles: 'Dossiers Stratégiques',
        openDossier: 'ACCÉDER AU DOSSIER',
        viewAllDossiers: 'Voir tous les dossiers',
        card1Title: 'Email, MFA & Identité',
        card1Body:
          'La première ligne de défense. Analyse des contournements MFA et fatigue attaques.',
        card2Title: 'Active Directory Tiering',
        card2Body:
          'Segmentation T0/T1/T2 et durcissement des privilèges pour bloquer les mouvements latéraux.',
        card3Title: 'Preparation Ransomware',
        card3Body:
          'Au-dela des sauvegardes: plans de reprise, confinement et reconstruction operationnelle.',
        operationalGuides: 'Guides operationnels',
        guidesIntro:
          'Parcours complets pour passer de l analyse a l execution: Active Directory, ransomware et conformite NIS2.',
        readGuide: 'Lire le guide',
        viewAllGuides: 'Voir tous les guides',
        softwareReferences: 'Logiciels de reference',
        softwareDescription:
          "Cyber Guide s'appuie sur un ecosysteme d'outils reconnus pour la detection, l'investigation et la remediation.",
        softwareCatalog: 'Voir le catalogue logiciel complet',
        monthVulnerabilityStat: 'Vulnerabilite du mois',
        patchWindowStat: 'Fenetre de patch recommandee',
        attackVectorStat: 'Vecteur d attaque prioritaire',
        sourceFootnote: 'Source: CVE/NVD et veille editeur consolidees par Cyber Guide',
      };

  return (
    <>
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path={localizedPath('/')}
        image="/assets/og/home.svg"
        keywords={
          isEnglish
            ? [
                'operational cybersecurity',
                'cyber templates',
                'defensive cyber analysis',
                'threat intelligence',
                'nis2',
              ]
            : [
                'cybersecurite',
                'cybersecurite operationnelle',
                'templates cyber',
                'threat intelligence',
                'analyses cyber',
                'NIS2',
              ]
        }
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Cyber Guide',
            url: 'https://cyber-guide.fr',
            inLanguage: copy.inLanguage,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${localizedAbsolutePath('/analyses')}?q={search_term_string}`,
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
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                {/* H1 Focus Produit (Pas de répétition du nom) */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-8">
                  {copy.heroTitleLead} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-steel via-brand-light to-white">
                    {copy.heroTitleAccent}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-10 border-l-2 border-brand-steel pl-6">
                  {copy.heroDescription}
                </p>
                <div className="mb-8 flex flex-wrap gap-2">
                  {copy.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-brand-pale"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={localizedPath('/analyses')}>
                    <Button
                      as="span"
                      variant="primary"
                      size="lg"
                      icon={BarChart3}
                      className="shadow-[0_0_20px_rgba(47,94,166,0.3)]"
                    >
                      {copy.analysesCta}
                    </Button>
                  </Link>
                  <Link to={localizedPath('/templates')}>
                    <Button as="span" variant="secondary" size="lg" icon={BookOpen}>
                      {copy.templatesCta}
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <Link to={localizedPath('/guides')} className="hover:text-brand-light transition-colors">
                    {copy.guidesLink}
                  </Link>
                  <Link to={localizedPath('/outils')} className="hover:text-brand-light transition-colors">
                    {copy.toolsLink}
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
                              {copy.vulnerabilityOfMonth}
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
                                {copy.productLabel}: {threatFocus.product}
                              </span>
                              <span className="rounded-sm border border-white/15 bg-white/5 px-2 py-1">
                                {copy.patchLabel}: {threatFocus.patchWindow}
                              </span>
                            </div>
                          </div>
                          <Badge className={severityBadgeClassName}>
                            {getSeverityLabel(threatFocus.severity, locale)}
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-sm border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Activity size={11} className="text-brand-steel" />
                            {copy.monthRiskIndex}
                          </span>
                          <span>{threatFocus.cve}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1 rounded-sm border border-brand-navy/20 bg-brand-pale/30 px-2 py-2 text-center">
                            <p className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                              {isEnglish ? 'Score' : 'Score'}
                            </p>
                            <p className="mt-1 text-3xl font-display font-bold text-brand-navy">
                              {riskScore}
                            </p>
                            <p className="text-[10px] text-slate-500">/100</p>
                          </div>

                          <div
                            className={`col-span-2 rounded-sm border px-2 py-2 ${riskBand.styleClassName}`}
                          >
                            <p className="text-[10px] font-mono uppercase tracking-wide">
                              {copy.quickRead}
                            </p>
                            <p className="mt-1 text-sm font-bold">{riskBand.label}</p>
                            <p className="text-xs">{riskBand.actionWindow}</p>
                            <p className="mt-2 text-[10px] leading-relaxed">
                              {copy.scoreHint}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 rounded-sm border border-slate-200 bg-slate-50 px-2 py-2">
                          <p className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                            {copy.financialImpact}
                          </p>
                          <p className="mt-1 text-lg font-display font-bold text-brand-navy">
                            {formatKiloEuro(financialRange.lower, locale)} -{' '}
                            {formatKiloEuro(financialRange.upper, locale)}
                          </p>
                          <p className="text-[10px] leading-relaxed text-slate-500">
                            {copy.financialHint}
                          </p>
                        </div>

                        <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                          {topRiskDrivers.map((driver, index) => (
                            <li key={driver.label} className="flex items-start gap-2">
                              <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-brand-steel"></span>
                              <span>
                                {copy.factorLabel} {index + 1}: <strong>{driver.label}</strong> (
                                {driver.value}/100)
                              </span>
                            </li>
                          ))}
                        </ul>
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
                            <Badge color="alert">{copy.priorityPatchBadge}</Badge>
                          </div>
                        </div>
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                            {copy.mainVector}
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
                          {copy.recommendedAction}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-brand-navy">
                          {threatFocus.recommendedAction}
                        </p>
                        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                          {copy.editorialNote}
                        </p>
                      </div>

                      <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>{copy.monthlyCycle}</span>
                          <span className="flex items-center gap-2 text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {copy.activeMonitoring}
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
                {copy.strategicFiles}
              </h2>
              <div className="h-1 w-20 bg-brand-steel mx-auto"></div>
            </Reveal>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Identity */}
            <StaggerItem>
              <Link to={localizedPath('/analyses/identite-mfa-fatigue')} className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="SEC-OPS-01"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Lock size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    {copy.card1Title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {copy.card1Body}
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    {copy.openDossier}{' '}
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
              <Link to={localizedPath('/analyses/ad-tiering')} className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="STRAT-02"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold transition-colors duration-300 shadow-sm">
                    <Network size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    {copy.card2Title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {copy.card2Body}
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    {copy.openDossier}{' '}
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
              <Link to={localizedPath('/analyses/ransomware-readiness')} className="group h-full block">
                <BlueprintPanel
                  className="h-full hover:border-brand-steel transition-colors duration-300"
                  label="COMPLIANCE-03"
                >
                  <div className="mb-6 p-4 bg-brand-pale w-fit rounded-sm text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors duration-300 shadow-sm">
                    <FileText size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                    {copy.card3Title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {copy.card3Body}
                  </p>
                  <div className="mt-auto text-xs font-mono text-brand-steel flex items-center font-bold tracking-wide">
                    {copy.openDossier}{' '}
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
              <Link to={localizedPath('/analyses')}>
                <Button as="span" variant="ghost" icon={ArrowRight}>
                  {copy.viewAllDossiers}
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
              {copy.operationalGuides}
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-slate-600">
              {copy.guidesIntro}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                to={localizedPath(`/guides/${guide.slug}`)}
                className="group block"
              >
                <div className="h-full rounded-sm border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-brand-steel">
                  <div className="mb-2 text-xs font-mono uppercase tracking-widest text-brand-steel">
                    {guide.category}
                  </div>
                  <h3 className="mb-2 text-lg font-display font-bold text-brand-navy group-hover:text-brand-steel">
                    {guide.title}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">{guide.excerpt}</p>
                  <span className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel">
                    {copy.readGuide} <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to={localizedPath('/guides')}>
              <Button as="span" variant="ghost" icon={ArrowRight}>
                {copy.viewAllGuides}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-auto bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-display font-bold text-brand-navy">
              {copy.softwareReferences}
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-600">
              {copy.softwareDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {showcasedSoftwares.map((software) => (
              <Link
                key={software.id}
                to={localizedPath('/outils')}
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
            <Link to={localizedPath('/outils')}>
              <Button as="span" variant="ghost" size="sm" icon={ArrowRight}>
                {copy.softwareCatalog}
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
                {copy.monthVulnerabilityStat}
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
                {copy.patchWindowStat}
              </div>
            </StaggerItem>
            <StaggerItem className="pl-4">
              <div className="text-xl font-display font-bold text-brand-navy mb-2">
                {threatFocus.attackVector}
              </div>
              <div className="text-xs font-mono uppercase text-slate-500">
                {copy.attackVectorStat}
              </div>
            </StaggerItem>
          </StaggerContainer>
          <Reveal delay={0.5} width="100%">
            <div className="text-center mt-12 text-xs text-slate-400 italic">
              {copy.sourceFootnote}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Home;
