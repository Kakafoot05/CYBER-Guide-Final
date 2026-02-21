import type { SupportedLocale } from './locale';

export type JournalEntryMeta = {
  objective: string;
  immediateActions: string[];
  relatedAnalyses: string[];
  relatedTemplates: string[];
  relatedPlaybooks: string[];
};

const JOURNAL_META_FR: Record<string, JournalEntryMeta> = {
  'post-mortem-phishing-2025': {
    objective:
      "Transformer un retour d'incident phishing en plan d'action concret pour limiter la compromission email.",
    immediateActions: [
      'Bloquer les domaines et URLs malveillants sur la passerelle mail/web.',
      'Purger les messages similaires dans les boites impactees et lancer une communication utilisateurs.',
      'Revoquer les sessions suspectes et auditer les regles de transfert externes.',
    ],
    relatedAnalyses: ['identite-mfa-fatigue'],
    relatedTemplates: ['tpl-001', 'tpl-003', 'tpl-004'],
    relatedPlaybooks: ['pb-004', 'pb-002'],
  },
  'checklist-triage-soc-15-min': {
    objective:
      "Standardiser la qualification SOC en 15 minutes pour reduire le bruit et mieux escalader les vrais incidents.",
    immediateActions: [
      'Valider le contexte minimal (actif, compte, horodatage, source).',
      'Chercher un pivot rapide (IOC connu, repetition multi-actifs, anomalie compte).',
      "Statuer avec trace explicite: cloture motivee, surveillance active ou escalation IR.",
    ],
    relatedAnalyses: ['cicd-secrets-exposition', 'ad-tiering'],
    relatedTemplates: ['tpl-001', 'tpl-008', 'tpl-007'],
    relatedPlaybooks: ['pb-003', 'pb-011', 'pb-015'],
  },
  'nis2-par-ou-commencer-petite-equipe': {
    objective:
      'Passer de la theorie NIS2 a un plan priorise en 90 jours, pilotable par une petite equipe.',
    immediateActions: [
      'Cartographier les actifs essentiels et les dependances tierces critiques.',
      'Definir une procedure de notification incident et les roles de crise.',
      'Tracer les decisions et la preuve de mise en oeuvre pour les revues de gouvernance.',
    ],
    relatedAnalyses: ['nis2-notification-gouvernance'],
    relatedTemplates: ['tpl-005', 'tpl-012', 'tpl-014', 'tpl-018'],
    relatedPlaybooks: ['pb-015', 'pb-012'],
  },
  'mfa-fatigue-signaux-precoces': {
    objective:
      "Identifier les signaux IAM faibles avant compromission et activer des controles d'authentification resistants au phishing.",
    immediateActions: [
      'Activer Number Matching et renforcer les politiques MFA sur populations sensibles.',
      "Corréler echec MFA, impossible travel et creation de regles mailbox suspectes.",
      'Prevoir une procedure de revocation globale des sessions et tokens OAuth.',
    ],
    relatedAnalyses: ['identite-mfa-fatigue'],
    relatedTemplates: ['tpl-001', 'tpl-013', 'tpl-009'],
    relatedPlaybooks: ['pb-014', 'pb-002'],
  },
};

const JOURNAL_META_EN: Record<string, JournalEntryMeta> = {
  'post-mortem-phishing-2025': {
    objective:
      'Turn a phishing incident post-mortem into an actionable mitigation plan to reduce email compromise.',
    immediateActions: [
      'Block malicious domains and URLs on email and web gateways.',
      'Purge similar messages from impacted mailboxes and notify users.',
      'Revoke suspicious sessions and audit external forwarding rules.',
    ],
    relatedAnalyses: ['identite-mfa-fatigue'],
    relatedTemplates: ['tpl-001', 'tpl-003', 'tpl-004'],
    relatedPlaybooks: ['pb-004', 'pb-002'],
  },
  'checklist-triage-soc-15-min': {
    objective:
      'Standardize 15-minute SOC qualification to cut alert noise and escalate true incidents faster.',
    immediateActions: [
      'Validate minimum context (asset, account, timestamp, detection source).',
      'Find one fast pivot (known IOC, multi-asset repetition, account anomaly).',
      'Record a clear decision: justified closure, active monitoring, or IR escalation.',
    ],
    relatedAnalyses: ['cicd-secrets-exposition', 'ad-tiering'],
    relatedTemplates: ['tpl-001', 'tpl-008', 'tpl-007'],
    relatedPlaybooks: ['pb-003', 'pb-011', 'pb-015'],
  },
  'nis2-par-ou-commencer-petite-equipe': {
    objective:
      'Move from NIS2 theory to a 90-day prioritized plan that a small team can execute.',
    immediateActions: [
      'Map essential assets and critical third-party dependencies.',
      'Define incident notification procedure and crisis roles.',
      'Track decisions and execution evidence for governance reviews.',
    ],
    relatedAnalyses: ['nis2-notification-gouvernance'],
    relatedTemplates: ['tpl-005', 'tpl-012', 'tpl-014', 'tpl-018'],
    relatedPlaybooks: ['pb-015', 'pb-012'],
  },
  'mfa-fatigue-signaux-precoces': {
    objective:
      'Detect weak IAM signals before takeover and enforce phishing-resistant authentication controls.',
    immediateActions: [
      'Enable Number Matching and tighten MFA policies for sensitive populations.',
      'Correlate MFA failures, impossible travel, and suspicious mailbox rule creation.',
      'Maintain a global revocation procedure for sessions and OAuth tokens.',
    ],
    relatedAnalyses: ['identite-mfa-fatigue'],
    relatedTemplates: ['tpl-001', 'tpl-013', 'tpl-009'],
    relatedPlaybooks: ['pb-014', 'pb-002'],
  },
};

export const getJournalEntryMeta = (
  slug: string,
  locale: SupportedLocale,
): JournalEntryMeta | null => {
  const source = locale === 'en' ? JOURNAL_META_EN : JOURNAL_META_FR;
  return source[slug] ?? null;
};
