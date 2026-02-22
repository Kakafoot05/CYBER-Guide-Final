import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { getLocalizedContent } from '../utils/contentLocale';
import {
  Search,
  Monitor,
  Github,
  ExternalLink,
  ArrowRight,
  Printer,
} from 'lucide-react';
import type { Software } from '../types';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import { localizeSoftwareLicense } from '../utils/labels';

type SoftwareLicense = Software['license'];
type LicenseFilter = 'All' | SoftwareLicense;

type BudgetStackPlan = {
  id: string;
  title: string;
  budgetRange: string;
  targetTeam: string;
  fit: string;
  objective: string;
  softwareIds: string[];
  deliverables: string[];
  limitations: string[];
};

const getBudgetStackPlans = (locale: 'fr' | 'en'): BudgetStackPlan[] => {
  if (locale === 'en') {
    return [
      {
        id: 'starter',
        title: 'Starter defensive baseline',
        budgetRange: '0EUR - 400EUR / month',
        targetTeam: 'IT team (1-3 people)',
        fit: 'Small companies up to 150 users',
        objective: 'Secure identity, remote access, and basic security visibility.',
        softwareIds: ['soft-12', 'soft-13', 'soft-08', 'soft-05'],
        deliverables: [
          'Admin MFA and shared secret vault in production use.',
          'Centralized logs for VPN, email, and privileged authentication.',
          'Weekly vulnerability and internet-exposure review.',
        ],
        limitations: [
          'No 24/7 SOC coverage.',
          'Detection depth remains moderate without SIEM tuning ownership.',
        ],
      },
      {
        id: 'growth',
        title: 'Growth stack for SOC operations',
        budgetRange: '400EUR - 2,500EUR / month',
        targetTeam: 'IT + SecOps (3-8 people)',
        fit: 'Growing organizations and multi-site operations',
        objective: 'Build proactive detection and structured incident response operations.',
        softwareIds: ['soft-03', 'soft-07', 'soft-09', 'soft-11', 'soft-13'],
        deliverables: [
          'Operational detections on identity, endpoint, and perimeter events.',
          'Weekly security dashboard for management and IT.',
          'Monthly tabletop simulation with remediation tracking.',
        ],
        limitations: [
          'Requires dedicated ownership for detection tuning and false positives.',
          'Needs clear escalation workflow to perform during crisis.',
        ],
      },
      {
        id: 'soc-plus',
        title: 'SOC+ enterprise stack',
        budgetRange: '2,500EUR+ / month',
        targetTeam: 'Dedicated SOC / CERT',
        fit: 'Critical services, regulated sectors, high internet exposure',
        objective: 'Reduce detection and containment time on critical assets.',
        softwareIds: ['soft-02', 'soft-10', 'soft-11', 'soft-12', 'soft-01'],
        deliverables: [
          'Continuous monitoring with high-priority playbooks.',
          'Formal incident reporting for leadership and compliance.',
          'Service-level objectives on detection and containment times.',
        ],
        limitations: [
          'Tool value depends on process discipline and analyst maturity.',
          'Budget must include training, IR exercises, and governance.',
        ],
      },
    ];
  }

  return [
    {
      id: 'starter',
      title: 'Socle defensif Starter',
      budgetRange: '0EUR - 400EUR / mois',
      targetTeam: 'Equipe IT (1-3 personnes)',
      fit: 'PME jusqu a 150 utilisateurs',
      objective: 'Securiser identite, acces distant et visibilite securite de base.',
      softwareIds: ['soft-12', 'soft-13', 'soft-08', 'soft-05'],
      deliverables: [
        'MFA admin active et coffre de secrets partage en production.',
        'Centralisation logs VPN, email et authentification privilegiee.',
        'Revue hebdomadaire des vulnerabilites et services exposes.',
      ],
      limitations: [
        'Pas de couverture SOC 24/7.',
        'Detection limitee sans ressource dediee au tuning.',
      ],
    },
    {
      id: 'growth',
      title: 'Stack Croissance orientee SOC',
      budgetRange: '400EUR - 2 500EUR / mois',
      targetTeam: 'IT + SecOps (3-8 personnes)',
      fit: 'Organisations en croissance et multi-sites',
      objective: 'Passer a une detection proactive et une reponse incident structuree.',
      softwareIds: ['soft-03', 'soft-07', 'soft-09', 'soft-11', 'soft-13'],
      deliverables: [
        'Regles de detection operationnelles identite, endpoint et perimetre.',
        'Tableau de bord securite hebdomadaire pour direction et IT.',
        'Exercice de crise mensuel avec suivi des remediations.',
      ],
      limitations: [
        'Necessite un responsable dedie au tuning et faux positifs.',
        'Demande un workflow escalation/communication bien defini.',
      ],
    },
    {
      id: 'soc-plus',
      title: 'Stack Entreprise SOC+',
      budgetRange: '2 500EUR+ / mois',
      targetTeam: 'SOC / CERT dedie',
      fit: 'Services critiques, secteurs regules, forte exposition internet',
      objective: 'Reduire les temps de detection et confinement sur actifs critiques.',
      softwareIds: ['soft-02', 'soft-10', 'soft-11', 'soft-12', 'soft-01'],
      deliverables: [
        'Surveillance continue avec playbooks haute priorite.',
        'Reporting incident formalise pour direction et conformite.',
        'Objectifs de performance detection et confinement.',
      ],
      limitations: [
        'La valeur outil depend fortement de la discipline process.',
        'Le budget doit couvrir formation, exercices IR et gouvernance.',
      ],
    },
  ];
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// --- SECTION STACK ECOSYSTEM ---
const STACK_GROUPS = [
  {
    id: 'siem',
    title: {
      fr: 'SIEM & Logs',
      en: 'SIEM & Logs',
    },
    focus: {
      fr: 'Détection, corrélation, investigation',
      en: 'Detection, correlation, investigation',
    },
    members: ['Splunk Enterprise Security', 'Elastic Security', 'OpenSearch', 'Graylog'],
  },
  {
    id: 'perimeter',
    title: {
      fr: 'Périmètre',
      en: 'Perimeter',
    },
    focus: {
      fr: 'Filtrage, edge, accès distant',
      en: 'Filtering, edge, remote access',
    },
    members: ['FortiGate', 'Palo Alto NGFW', 'Cloudflare', 'OpenVPN'],
  },
  {
    id: 'identity',
    title: {
      fr: 'Identité',
      en: 'Identity',
    },
    focus: {
      fr: 'MFA, IAM, secrets',
      en: 'MFA, IAM, secrets',
    },
    members: ['Okta', 'Bitwarden', 'KeePassXC'],
  },
  {
    id: 'visibility',
    title: {
      fr: 'Visibilité',
      en: 'Visibility',
    },
    focus: {
      fr: 'Réseau et observabilité',
      en: 'Network and observability',
    },
    members: ['Wireshark', 'Grafana', 'Kibana'],
  },
] as const;

const StackEcosystem: React.FC<{ softwares: Software[]; locale: 'fr' | 'en' }> = ({
  softwares,
  locale,
}) => {
  const isEnglish = locale === 'en';
  const copy = isEnglish
    ? {
        title: 'Software ecosystem',
        body:
          'Selection of tools used in operational cybersecurity workflows: prevention, detection, investigation, and remediation.',
      }
    : {
        title: 'Écosystème logiciels',
        body:
          "Sélection d'outils utilisés dans des parcours de cybersécurité opérationnelle : prévention, détection, investigation et remédiation.",
      };
  const softwareByName = useMemo(
    () => new Map(softwares.map((software) => [software.name, software] as const)),
    [softwares],
  );

  return (
    <div className="mb-16 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-navy">
          {copy.title}
        </h3>
        <p className="mx-auto max-w-3xl text-sm text-slate-600">
          {copy.body}
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
                {group.title[locale]}
              </h4>
              <p className="mt-1 text-xs text-slate-500">{group.focus[locale]}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {group.members.map((member) => {
                const software = softwareByName.get(member);
                if (!software) return null;

                return (
                  <div
                    key={software.id}
                    className="group flex items-center gap-2 rounded-sm border border-slate-100 bg-slate-50 p-2 transition-colors hover:border-brand-steel/40 hover:bg-brand-pale/20"
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
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-slate-700">{software.name}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {localizeSoftwareLicense(software.license, locale)}
                      </p>
                    </div>
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

const BudgetStackSection: React.FC<{
  softwares: Software[];
  locale: 'fr' | 'en';
  localizedPath: (path: string) => string;
}> = ({ softwares, locale, localizedPath }) => {
  const isEnglish = locale === 'en';
  const copy = isEnglish
    ? {
        title: 'Recommended stack by budget',
        subtitle:
          'Concrete stack packs aligned to budget, team size, and operational objective.',
        budget: 'Monthly budget',
        team: 'Target team',
        fit: 'Best fit',
        objective: 'Operational objective',
        softwares: 'Recommended software',
        deliverables: 'Minimum deliverables',
        limits: 'Practical limits',
        compareLabel: 'Compare',
        compareHint: 'Select 2 stacks for side-by-side comparison.',
        compareTitle: 'Stack comparison',
        compareEmpty: 'Select two stacks to display comparison.',
        sharedTools: 'Common software',
        onlyInStack: 'Specific to this stack',
        exportComparisonPdf: 'Export comparison PDF',
        exportDisabled: 'Select 2 stacks first',
        exportReady: 'Print dialog opened ✅',
        exportFailed: 'Cannot prepare PDF export',
        openTemplates: 'Open incident templates',
        openGuides: 'Open guide tracks',
      }
    : {
        title: 'Stack recommandee par budget',
        subtitle:
          'Packs concrets alignes sur budget, taille equipe et objectif operationnel.',
        budget: 'Budget mensuel',
        team: 'Equipe cible',
        fit: 'Adapte a',
        objective: 'Objectif operationnel',
        softwares: 'Logiciels recommandes',
        deliverables: 'Livrables minimum',
        limits: 'Limites pratiques',
        compareLabel: 'Comparer',
        compareHint: 'Selectionnez 2 stacks pour un comparatif cote a cote.',
        compareTitle: 'Comparatif des stacks',
        compareEmpty: 'Selectionnez deux stacks pour afficher le comparatif.',
        sharedTools: 'Logiciels communs',
        onlyInStack: 'Specifique a cette stack',
        exportComparisonPdf: 'Exporter comparatif PDF',
        exportDisabled: 'Selectionnez 2 stacks',
        exportReady: 'Fenetre impression ouverte ✅',
        exportFailed: "Impossible de preparer l'export PDF",
        openTemplates: 'Ouvrir les templates incident',
        openGuides: 'Ouvrir les parcours guides',
      };

  const stackPlans = useMemo(() => getBudgetStackPlans(locale), [locale]);
  const softwareById = useMemo(
    () => new Map(softwares.map((software) => [software.id, software] as const)),
    [softwares],
  );
  const [comparisonSelection, setComparisonSelection] = useState<string[]>(() =>
    stackPlans.slice(0, 2).map((plan) => plan.id),
  );
  const [comparisonToast, setComparisonToast] = useState<string | null>(null);

  React.useEffect(() => {
    setComparisonSelection((currentSelection) => {
      const validSelection = currentSelection.filter((id) =>
        stackPlans.some((plan) => plan.id === id),
      );

      if (validSelection.length >= 2) {
        return validSelection.slice(0, 2);
      }

      const fallbackIds = stackPlans
        .map((plan) => plan.id)
        .filter((id) => !validSelection.includes(id));

      return [...validSelection, ...fallbackIds].slice(0, 2);
    });
  }, [stackPlans]);

  const togglePlanSelection = (planId: string) => {
    setComparisonSelection((currentSelection) => {
      if (currentSelection.includes(planId)) {
        return currentSelection.filter((id) => id !== planId);
      }

      if (currentSelection.length < 2) {
        return [...currentSelection, planId];
      }

      return [currentSelection[1], planId];
    });
  };

  const selectedPlans = comparisonSelection
    .map((id) => stackPlans.find((plan) => plan.id === id))
    .filter((plan): plan is BudgetStackPlan => Boolean(plan));

  const sharedSoftwareIds =
    selectedPlans.length === 2
      ? selectedPlans[0].softwareIds.filter((softwareId) =>
          selectedPlans[1].softwareIds.includes(softwareId),
        )
      : [];

  const showComparisonToast = (message: string) => {
    setComparisonToast(message);
    window.setTimeout(() => setComparisonToast((current) => (current === message ? null : current)), 2200);
  };

  const exportComparisonPdf = () => {
    if (selectedPlans.length < 2) {
      showComparisonToast(copy.exportDisabled);
      return;
    }

    const comparisonDate = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date());

    const toSoftwareNames = (softwareIds: string[]): string[] =>
      softwareIds
        .map((softwareId) => softwareById.get(softwareId)?.name)
        .filter((name): name is string => Boolean(name));

    const planA = selectedPlans[0];
    const planB = selectedPlans[1];
    const specificA = toSoftwareNames(planA.softwareIds.filter((id) => !sharedSoftwareIds.includes(id)));
    const specificB = toSoftwareNames(planB.softwareIds.filter((id) => !sharedSoftwareIds.includes(id)));
    const shared = toSoftwareNames(sharedSoftwareIds);

    const listToHtml = (items: string[], emptyFallback = '-') =>
      items.length === 0
        ? `<li>${escapeHtml(emptyFallback)}</li>`
        : items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

    const printableHtml = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(copy.compareTitle)} - Cyber Guide</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; }
      .sheet { max-width: 980px; margin: 16px auto; background: #ffffff; border: 1px solid #d8dee8; }
      .header { padding: 24px; border-bottom: 1px solid #e5e7eb; }
      .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: .2em; color: #64748b; font-weight: 700; }
      .title { margin: 6px 0 2px; font-size: 32px; line-height: 1.1; color: #0b2a5a; font-weight: 800; }
      .meta { font-size: 12px; color: #475569; }
      .grid { display: grid; gap: 14px; grid-template-columns: repeat(2,minmax(0,1fr)); padding: 20px 24px; }
      .card { border: 1px solid #d8dee8; background: #ffffff; padding: 14px; }
      .card h3 { margin: 0 0 8px; font-size: 20px; color: #0b2a5a; }
      .kv { margin: 8px 0; font-size: 13px; }
      .kv strong { color: #334155; text-transform: uppercase; letter-spacing: .08em; font-size: 10px; margin-right: 6px; }
      .section { border: 1px solid #d8dee8; margin: 0 24px 12px; padding: 14px; background: #f8fafc; }
      .section h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: #334155; }
      ul { margin: 0; padding-left: 18px; }
      li { margin: 4px 0; font-size: 13px; line-height: 1.45; }
      .footer { padding: 12px 24px 20px; font-size: 11px; color: #64748b; }
      @page { size: A4; margin: 10mm; }
      @media print {
        body { background: #fff; }
        .sheet { border: 0; margin: 0; max-width: none; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div class="eyebrow">Cyber Guide - Software strategy</div>
        <div class="title">${escapeHtml(copy.compareTitle)}</div>
        <div class="meta">${escapeHtml(comparisonDate)}</div>
      </div>
      <div class="grid">
        <div class="card">
          <h3>${escapeHtml(planA.title)}</h3>
          <div class="kv"><strong>${escapeHtml(copy.budget)}</strong> ${escapeHtml(planA.budgetRange)}</div>
          <div class="kv"><strong>${escapeHtml(copy.team)}</strong> ${escapeHtml(planA.targetTeam)}</div>
          <div class="kv"><strong>${escapeHtml(copy.fit)}</strong> ${escapeHtml(planA.fit)}</div>
          <div class="kv"><strong>${escapeHtml(copy.objective)}</strong> ${escapeHtml(planA.objective)}</div>
        </div>
        <div class="card">
          <h3>${escapeHtml(planB.title)}</h3>
          <div class="kv"><strong>${escapeHtml(copy.budget)}</strong> ${escapeHtml(planB.budgetRange)}</div>
          <div class="kv"><strong>${escapeHtml(copy.team)}</strong> ${escapeHtml(planB.targetTeam)}</div>
          <div class="kv"><strong>${escapeHtml(copy.fit)}</strong> ${escapeHtml(planB.fit)}</div>
          <div class="kv"><strong>${escapeHtml(copy.objective)}</strong> ${escapeHtml(planB.objective)}</div>
        </div>
      </div>
      <div class="section">
        <h4>${escapeHtml(copy.sharedTools)}</h4>
        <ul>${listToHtml(shared)}</ul>
      </div>
      <div class="grid">
        <div class="section" style="margin:0;">
          <h4>${escapeHtml(planA.title)} - ${escapeHtml(copy.onlyInStack)}</h4>
          <ul>${listToHtml(specificA)}</ul>
        </div>
        <div class="section" style="margin:0;">
          <h4>${escapeHtml(planB.title)} - ${escapeHtml(copy.onlyInStack)}</h4>
          <ul>${listToHtml(specificB)}</ul>
        </div>
      </div>
      <div class="grid">
        <div class="section" style="margin:0;">
          <h4>${escapeHtml(planA.title)} - ${escapeHtml(copy.deliverables)}</h4>
          <ul>${listToHtml(planA.deliverables)}</ul>
        </div>
        <div class="section" style="margin:0;">
          <h4>${escapeHtml(planB.title)} - ${escapeHtml(copy.deliverables)}</h4>
          <ul>${listToHtml(planB.deliverables)}</ul>
        </div>
      </div>
      <div class="footer">cyber-guide.fr</div>
    </div>
  </body>
</html>`;

    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(frame);

    const cleanup = () => {
      if (frame.parentNode) {
        frame.parentNode.removeChild(frame);
      }
    };

    try {
      const frameWindow = frame.contentWindow;
      if (!frameWindow) {
        cleanup();
        showComparisonToast(copy.exportFailed);
        return;
      }
      const frameDocument = frameWindow.document;
      frameDocument.open();
      frameDocument.write(printableHtml);
      frameDocument.close();

      let printTriggered = false;
      const triggerPrint = () => {
        if (printTriggered) return;
        printTriggered = true;
        frameWindow.focus();
        frameWindow.print();
      };

      frameWindow.addEventListener('afterprint', () => window.setTimeout(cleanup, 200), {
        once: true,
      });
      window.setTimeout(triggerPrint, 220);
      window.setTimeout(cleanup, 15000);
      showComparisonToast(copy.exportReady);
    } catch {
      cleanup();
      showComparisonToast(copy.exportFailed);
    }
  };

  return (
    <div className="mb-12 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-navy">
          {copy.title}
        </h3>
        <p className="mx-auto max-w-3xl text-sm text-slate-600">{copy.subtitle}</p>
        <p className="mx-auto mt-2 max-w-3xl text-[11px] font-mono uppercase tracking-wide text-slate-500">
          {copy.compareHint}
        </p>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-brand-steel"></div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {stackPlans.map((plan) => (
          <BlueprintPanel key={plan.id} className="h-full border-slate-200" label={`STACK_${plan.id.toUpperCase()}`}>
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-lg font-display font-bold text-brand-navy">{plan.title}</h4>
                    <button
                      type="button"
                      onClick={() => togglePlanSelection(plan.id)}
                      className={`rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                        comparisonSelection.includes(plan.id)
                          ? 'border-brand-steel bg-brand-navy text-white'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-steel hover:text-brand-navy'
                      }`}
                    >
                      {copy.compareLabel}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{plan.objective}</p>
                </div>

            <div className="grid gap-2 rounded-sm border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono uppercase tracking-wider text-slate-500">{copy.budget}</span>
                <span className="text-right font-semibold text-brand-navy">{plan.budgetRange}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono uppercase tracking-wider text-slate-500">{copy.team}</span>
                <span className="text-right font-semibold text-brand-navy">{plan.targetTeam}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono uppercase tracking-wider text-slate-500">{copy.fit}</span>
                <span className="text-right font-semibold text-brand-navy">{plan.fit}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {copy.softwares}
              </p>
              <div className="mt-2 space-y-2">
                {plan.softwareIds.map((softwareId) => {
                  const software = softwareById.get(softwareId);
                  if (!software) return null;

                  return (
                    <a
                      key={`${plan.id}-${software.id}`}
                      href={software.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 rounded-sm border border-slate-200 bg-white p-2 transition-colors hover:border-brand-steel"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-slate-100 bg-slate-50 p-1">
                        {software.logoPath ? (
                          <img
                            src={software.logoPath}
                            alt={`Logo ${software.name}`}
                            className="max-h-full max-w-full object-contain"
                            width={20}
                            height={20}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600">
                            {software.name.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-brand-navy">{software.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[10px] text-slate-500">{software.category}</p>
                          <Badge color="mono" className="!px-1.5 !py-0 text-[8px]">
                            {localizeSoftwareLicense(software.license, locale)}
                          </Badge>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {copy.deliverables}
              </p>
              <ul className="mt-2 space-y-2 text-xs text-slate-700">
                {plan.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-steel"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {copy.limits}
              </p>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                {plan.limitations.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-gold"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlueprintPanel>
        ))}
      </div>

      <div className="mt-8">
        <BlueprintPanel title={copy.compareTitle} label="COMPARE_2_STACKS">
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={exportComparisonPdf}
              disabled={selectedPlans.length < 2}
            >
              {copy.exportComparisonPdf}
            </Button>
          </div>

          {selectedPlans.length < 2 ? (
            <p className="rounded-sm border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              {copy.compareEmpty}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {selectedPlans.map((plan) => {
                  const specificSoftwareIds = plan.softwareIds.filter(
                    (softwareId) => !sharedSoftwareIds.includes(softwareId),
                  );

                  return (
                    <div key={`compare-${plan.id}`} className="rounded-sm border border-slate-200 bg-white p-4">
                      <h4 className="text-lg font-display font-bold text-brand-navy">{plan.title}</h4>
                      <div className="mt-3 grid gap-2 rounded-sm border border-slate-200 bg-slate-50 p-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono uppercase tracking-wider text-slate-500">
                            {copy.budget}
                          </span>
                          <span className="text-right font-semibold text-brand-navy">{plan.budgetRange}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono uppercase tracking-wider text-slate-500">
                            {copy.team}
                          </span>
                          <span className="text-right font-semibold text-brand-navy">{plan.targetTeam}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono uppercase tracking-wider text-slate-500">
                            {copy.fit}
                          </span>
                          <span className="text-right font-semibold text-brand-navy">{plan.fit}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          {copy.onlyInStack}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {specificSoftwareIds.map((softwareId) => {
                            const software = softwareById.get(softwareId);
                            if (!software) return null;
                            return (
                              <li key={`${plan.id}-specific-${softwareId}`} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-steel"></span>
                                <span>{software.name}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          {copy.deliverables}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {plan.deliverables.slice(0, 3).map((item) => (
                            <li key={`${plan.id}-deliverable-${item}`} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-steel"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {copy.sharedTools}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sharedSoftwareIds.length === 0 ? (
                    <span className="text-xs text-slate-500">-</span>
                  ) : (
                    sharedSoftwareIds.map((softwareId) => {
                      const software = softwareById.get(softwareId);
                      if (!software) return null;
                      return (
                        <span
                          key={`shared-${softwareId}`}
                          className="rounded-sm border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-brand-navy"
                        >
                          {software.name}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {comparisonToast ? (
            <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-brand-navy">
              {comparisonToast}
            </div>
          ) : null}
        </BlueprintPanel>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 text-center sm:flex-row">
        <Link to={localizedPath('/templates')}>
          <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
            {copy.openTemplates}
          </Button>
        </Link>
        <Link to={localizedPath('/guides')}>
          <Button as="span" variant="outline" size="sm" icon={ArrowRight}>
            {copy.openGuides}
          </Button>
        </Link>
      </div>
    </div>
  );
};

// --- COMPOSANT : CARTE LOGICIEL ---
const SoftwareCard: React.FC<{ software: Software; onClick: () => void; locale: 'fr' | 'en' }> = ({
  software,
  onClick,
  locale,
}) => {
  const isEnglish = locale === 'en';
  const copy = isEnglish
    ? {
        openSoftwareAria: 'Open software details',
        vendor: 'Vendor',
        useCase: 'Use case',
        viewDetails: 'View details',
      }
    : {
        openSoftwareAria: 'Ouvrir les détails du logiciel',
        vendor: 'Éditeur',
        useCase: "Cas d'usage",
        viewDetails: 'Voir détails',
      };
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
      aria-label={`${copy.openSoftwareAria} ${software.name}`}
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
            {localizeSoftwareLicense(software.license, locale)}
          </Badge>
        </div>

        {software.vendor && (
          <p className="mb-2 text-[10px] font-mono uppercase tracking-wide text-slate-400">
            {copy.vendor}: {software.vendor}
          </p>
        )}

        <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed flex-grow">
          {software.description}
        </p>

        {software.useCases.length > 0 && (
          <p className="mb-4 text-xs text-slate-500">
            {copy.useCase}: <span className="font-medium text-slate-600">{software.useCases[0]}</span>
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-1.5">
          {software.platforms.slice(0, 2).map((platform) => (
            <span
              key={`${software.id}-${platform}`}
              className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide text-slate-500"
            >
              {platform}
            </span>
          ))}
          {software.platforms.length > 2 && (
            <span className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide text-slate-500">
              +{software.platforms.length - 2}
            </span>
          )}
        </div>

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

        <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-brand-steel group-hover:underline">
            {copy.viewDetails}
          </span>
          <ArrowRight size={14} className="text-brand-steel transition-transform group-hover:translate-x-1" />
        </div>
      </BlueprintPanel>
    </button>
  );
};

// --- PAGE PRINCIPALE ---
const Tools: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { softwares } = useMemo(() => getLocalizedContent(locale), [locale]);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const copy = isEnglish
    ? {
        seoTitle: 'Cyber Tools and Operational Software',
        seoDescription:
          'Catalog of defensive tools and operational cybersecurity software for triage, investigation, and incident response.',
        seoKeywords: ['cyber tools', 'operational cybersecurity', 'DFIR', 'triage', 'investigation'],
        schemaName: 'Cyber Guide Toolbox',
        headerTitle: 'Toolbox',
        headerSubtitle: 'Technical',
        headerMeta: ['Local processing', 'Confidentiality', 'DFIR'],
        meshTitle: 'Operational mapping',
        meshBody:
          'Use guides to frame priorities, templates to standardize communication, and this toolbox to execute.',
        openGuides: 'Open guides',
        seeTemplates: 'See templates too',
        catalog: 'Catalog',
        referenceSoftware: 'reference software',
        openSourceNote: 'auditable and modular',
        proprietary: 'Proprietary',
        proprietaryNote: 'structured vendor support',
        domains: 'Domains',
        domainsNote: 'SIEM, IAM, network, observability',
        search: 'Search',
        searchPlaceholder: 'Name, vendor, use case, tag...',
        category: 'Category',
        all: 'All',
        license: 'License',
        platform: 'Platform',
        selectedSoftware: 'selected software',
        resetFilters: 'Reset filters',
        emptyState: 'No software matches current filters.',
        drawerTitlePrefix: 'SOFTWARE',
        compatibility: 'Compatibility',
        useCases: 'Priority use cases',
        officialSite: 'Official site',
        sourceCode: 'Source code',
      }
    : {
        seoTitle: 'Outils Cyber et Logiciels Opérationnels',
        seoDescription:
          "Catalogue d'outils défensifs et logiciels cyber opérationnels pour le triage, l'investigation et la réponse à incident.",
        seoKeywords: [
          'outils cyber',
          'cybersécurité opérationnelle',
          'DFIR',
          'triage',
          'investigation',
        ],
        schemaName: 'Boîte à outils Cyber Guide',
        headerTitle: 'Boîte à outils',
        headerSubtitle: 'Technique',
        headerMeta: ['Traitement local', 'Confidentialité', 'DFIR'],
        meshTitle: 'Maillage opérationnel',
        meshBody:
          'Utilisez les guides pour cadrer les priorités, les templates pour standardiser la communication, et cette boîte à outils pour exécuter.',
        openGuides: 'Ouvrir les guides',
        seeTemplates: 'Voir aussi les templates',
        catalog: 'Catalogue',
        referenceSoftware: 'logiciels référencés',
        openSourceNote: 'auditables et modulaires',
        proprietary: 'Propriétaires',
        proprietaryNote: 'support éditeur structuré',
        domains: 'Domaines',
        domainsNote: 'SIEM, IAM, Réseau, observabilité',
        search: 'Recherche',
        searchPlaceholder: 'Nom, éditeur, cas d’usage, tag...',
        category: 'Catégorie',
        all: 'Toutes',
        license: 'Licence',
        platform: 'Plateforme',
        selectedSoftware: 'logiciels sélectionnés',
        resetFilters: 'Réinitialiser les filtres',
        emptyState: 'Aucun logiciel ne correspond aux filtres actuels.',
        drawerTitlePrefix: 'LOGICIEL',
        compatibility: 'Compatibilité',
        useCases: "Cas d'usage prioritaires",
        officialSite: 'Site Officiel',
        sourceCode: 'Code Source',
      };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [licenseFilter, setLicenseFilter] = useState<LicenseFilter>('All');
  const [platformFilter, setPlatformFilter] = useState<'All' | Software['platforms'][number]>('All');
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(softwares.map((s) => s.category))).sort()],
    [softwares],
  );

  const platforms = useMemo(
    () => ['All', ...Array.from(new Set(softwares.flatMap((s) => s.platforms))).sort()],
    [softwares],
  );

  const softwareMetrics = useMemo(
    () => ({
      total: softwares.length,
      openSource: softwares.filter((s) => s.license === 'Open Source').length,
      proprietary: softwares.filter((s) => s.license === 'Paid').length,
      categories: new Set(softwares.map((s) => s.category)).size,
    }),
    [softwares],
  );

  const filteredSoftwares = softwares.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.useCases.some((useCase) => useCase.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesLicense = licenseFilter === 'All' || s.license === licenseFilter;
    const matchesPlatform = platformFilter === 'All' || s.platforms.includes(platformFilter);

    return matchesSearch && matchesCategory && matchesLicense && matchesPlatform;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/outils"
        image="/assets/og/tools.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.schemaName,
          url: `https://cyber-guide.fr${localizedPath('/outils')}`,
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
        title={copy.headerTitle}
        subtitle={copy.headerSubtitle}
        meta={copy.headerMeta}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
              {copy.meshTitle}
            </p>
            <p className="mt-2 text-sm text-slate-600">{copy.meshBody}</p>
          </div>
          <div className="flex items-center justify-start gap-4 md:justify-end">
            <Link to={localizedPath('/guides')}>
                <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                {copy.openGuides}
                </Button>
              </Link>
            <Link
              to={localizedPath('/templates')}
              className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
            >
              {copy.seeTemplates}
            </Link>
          </div>
        </div>

        <StackEcosystem softwares={softwares} locale={locale} />
        <BudgetStackSection softwares={softwares} locale={locale} localizedPath={localizedPath} />

        <div className="animate-fade-in-up">
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{copy.catalog}</p>
                <p className="mt-1 text-2xl font-bold text-brand-navy">{softwareMetrics.total}</p>
                <p className="text-xs text-slate-500">{copy.referenceSoftware}</p>
              </article>
              <article className="rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Open Source
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{softwareMetrics.openSource}</p>
                <p className="text-xs text-slate-500">{copy.openSourceNote}</p>
              </article>
              <article className="rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  {copy.proprietary}
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-navy">{softwareMetrics.proprietary}</p>
                <p className="text-xs text-slate-500">{copy.proprietaryNote}</p>
              </article>
              <article className="rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{copy.domains}</p>
                <p className="mt-1 text-2xl font-bold text-brand-steel">{softwareMetrics.categories}</p>
                <p className="text-xs text-slate-500">{copy.domainsNote}</p>
              </article>
            </div>

            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm mb-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative w-full md:col-span-2 xl:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                    {copy.search}
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder={copy.searchPlaceholder}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                    {copy.category}
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none bg-white"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === 'All' ? copy.all : c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                    {copy.license}
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none bg-white"
                    value={licenseFilter}
                    onChange={(e) => setLicenseFilter(e.target.value as LicenseFilter)}
                  >
                    <option value="All">{copy.all}</option>
                    <option value="Open Source">{localizeSoftwareLicense('Open Source', locale)}</option>
                    <option value="Paid">{localizeSoftwareLicense('Paid', locale)}</option>
                    <option value="Freemium">{localizeSoftwareLicense('Freemium', locale)}</option>
                    <option value="Free">{localizeSoftwareLicense('Free', locale)}</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1 block">
                    {copy.platform}
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:border-brand-steel outline-none bg-white"
                    value={platformFilter}
                    onChange={(e) =>
                      setPlatformFilter(e.target.value as 'All' | Software['platforms'][number])
                    }
                  >
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform === 'All' ? copy.all : platform}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
                  {filteredSoftwares.length} {copy.selectedSoftware}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setLicenseFilter('All');
                    setPlatformFilter('All');
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-steel hover:text-brand-navy"
                >
                  {copy.resetFilters}
                </button>
              </div>
            </div>

            {filteredSoftwares.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                {copy.emptyState}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSoftwares.map((soft) => (
                  <SoftwareCard
                    key={soft.id}
                    software={soft}
                    onClick={() => setSelectedSoftware(soft)}
                    locale={locale}
                  />
                ))}
              </div>
            )}
        </div>

        {/* SOFTWARE DETAILS DRAWER */}
        <Drawer
          isOpen={!!selectedSoftware}
          onClose={() => setSelectedSoftware(null)}
          title={selectedSoftware ? `${copy.drawerTitlePrefix}: ${selectedSoftware.id.toUpperCase()}` : ''}
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
                    <Badge color="mono" className="ml-2">
                      {localizeSoftwareLicense(selectedSoftware.license, locale)}
                    </Badge>
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
                  <Monitor size={14} className="text-brand-steel" /> {copy.compatibility}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedSoftware.platforms.map((p) => (
                    <TechBadge key={p} tech={p} />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-brand-navy uppercase text-xs tracking-wider mb-4">
                  {copy.useCases}
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
                    {copy.officialSite}
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
                      {copy.sourceCode}
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
