export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  checklist?: string[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuidePillar {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  updatedDate: string;
  keywords: string[];
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  relatedAnalyses: string[];
  relatedPlaybooks: string[];
  relatedLinks: Array<{
    label: string;
    path: string;
  }>;
}

export const guides: GuidePillar[] = [
  {
    slug: 'securite-active-directory',
    title: 'Guide Securite Active Directory',
    excerpt:
      'Plan defensif concret pour reduire les mouvements lateraux, proteger Tier 0 et renforcer la resilience AD.',
    category: 'Identity & Infrastructure',
    readTime: '12 min',
    updatedDate: '2026-02-08',
    keywords: [
      'active directory security',
      'tiering ad',
      'hardening ad',
      'securite windows',
      'tier 0',
    ],
    intro:
      'Active Directory reste la cible principale des attaques de rancon. Ce guide synthese les controles qui produisent un impact rapide et mesurable, sans bloquer l exploitation quotidienne.',
    sections: [
      {
        id: 'fondations',
        title: '1. Fondations de confiance',
        paragraphs: [
          'Commencez par reduire la surface d administration: comptes separes, MFA fort et postes d administration dedies.',
          'Le modele Tier 0, Tier 1 et Tier 2 doit etre applique techniquement via des OU, GPO et restrictions de connexion explicites.',
        ],
        checklist: [
          'Limiter les comptes Domain Admin a un nombre tres restreint',
          'Activer LAPS sur postes et serveurs',
          'Bloquer les connexions privilegiees sur postes utilisateurs',
        ],
      },
      {
        id: 'detection',
        title: '2. Detection et containment',
        paragraphs: [
          'Une defense AD efficace combine prevention et detection. Surveillez les indicateurs de DCSync, ajout de comptes privilegies et delegations suspectes.',
          'Definissez des playbooks de containment pour revoquer rapidement sessions, secrets et tickets Kerberos.',
        ],
        checklist: [
          'Alerter sur creation ou modification des groupes admin critiques',
          'Surveiller les authentifications anormales et impossible travel',
          'Tester un reset controle de credentials privilegies',
        ],
      },
      {
        id: 'gouvernance',
        title: '3. Gouvernance continue',
        paragraphs: [
          'La robustesse AD n est pas un projet one-shot. Programmez des revues d acces trimestrielles et des exercices de restauration.',
          'Mesurez la maturite avec des indicateurs simples: nombre de comptes privilegies, couverture MFA, delai moyen de remediations critiques.',
        ],
        checklist: [
          'Mettre en place une revue trimestrielle des droits admin',
          'Executer un test de restauration AD annuel',
          'Tracer un plan de remediation priorise sur 90 jours',
        ],
      },
    ],
    faq: [
      {
        question: 'Quel est le premier controle a deployer sur un AD faible ?',
        answer:
          'La separation des comptes admin et user, combinee a MFA fort, produit le meilleur ratio effort/impact.',
      },
      {
        question: 'Peut-on securiser AD sans refondre toute l infra ?',
        answer:
          'Oui. Un plan en vagues successives (Tiering, LAPS, restrictions de logon, alertes critiques) permet une progression rapide.',
      },
    ],
    relatedAnalyses: ['ad-tiering', 'identite-mfa-fatigue'],
    relatedPlaybooks: ['pb-006', 'pb-008', 'pb-014'],
    relatedLinks: [
      { label: 'Explorer les outils defensifs', path: '/outils' },
      { label: 'Voir les sources et standards', path: '/sources' },
    ],
  },
  {
    slug: 'reponse-ransomware-pme',
    title: 'Guide Reponse Ransomware PME',
    excerpt:
      'Playbook de preparation et de reponse pour reduire le temps de crise, proteger les sauvegardes et restaurer plus vite.',
    category: 'Incident Response',
    readTime: '11 min',
    updatedDate: '2026-01-28',
    keywords: [
      'ransomware readiness',
      'incident response ransomware',
      'backup immutability',
      'plan de crise cyber',
      'pme cyber resilience',
    ],
    intro:
      'La difference entre une crise maitrisee et un arret prolonge repose sur la preparation. Ce guide priorise les actions qui diminuent le risque de propagation et accelerent la reprise.',
    sections: [
      {
        id: 'preparation',
        title: '1. Preparation avant incident',
        paragraphs: [
          'Documentez les roles de crise, les canaux de communication hors bande et la liste des actifs critiques.',
          'Les sauvegardes doivent etre immuables ou hors ligne, avec des tests de restauration reguliers en environnement isole.',
        ],
        checklist: [
          'Maintenir un annuaire de crise hors bande',
          'Verifier l immutabilite des sauvegardes critiques',
          'Exercer un scenario ransomware au moins 2 fois par an',
        ],
      },
      {
        id: 'containment',
        title: '2. Containment et investigation',
        paragraphs: [
          'A la detection, isolez les systemes touches sans detruire les preuves utiles. La priorite est d arreter la propagation laterale.',
          'Conservez les journaux, identifiez le patient zero et activez les playbooks de communication management/ops.',
        ],
        checklist: [
          'Isoler les endpoints suspects via EDR ou segmentation reseau',
          'Capturer les artefacts critiques (notes, logs, IOC)',
          'Notifier rapidement les parties prenantes internes',
        ],
      },
      {
        id: 'reconstruction',
        title: '3. Reconstruction et retour a la normale',
        paragraphs: [
          'Favorisez le rebuild maitrise plutot que le nettoyage partiel. Validez les acces et secrets avant remise en production.',
          'Formalisez le post-mortem: cause racine, delai de detection, actions correctives et calendrier de suivi.',
        ],
        checklist: [
          'Reinitialiser les comptes et secrets sensibles',
          'Restaurer depuis des sauvegardes verifiees',
          'Suivre un plan de remediations post-incident sous 30 jours',
        ],
      },
    ],
    faq: [
      {
        question: 'Faut-il payer une rancon pour redemarrer vite ?',
        answer:
          'Le paiement ne garantit ni decryption ni non-divulgation. La meilleure strategie reste preparation, containment et restauration controlee.',
      },
      {
        question: 'Quel KPI suivre apres crise ?',
        answer:
          'Le MTTR, la couverture des sauvegardes teste, et le taux de remediations closes dans les 30 jours.',
      },
    ],
    relatedAnalyses: ['ransomware-readiness', 'identite-mfa-fatigue'],
    relatedPlaybooks: ['pb-001', 'pb-003', 'pb-011'],
    relatedLinks: [
      { label: 'Consulter tous les playbooks', path: '/playbooks' },
      { label: 'Voir les retours terrain du blog', path: '/blog' },
    ],
  },
  {
    slug: 'conformite-nis2-feuille-de-route',
    title: 'Guide Conformite NIS2',
    excerpt:
      'Feuille de route pragmatique pour aligner gouvernance, gestion de risque et obligations de notification NIS2.',
    category: 'Governance & Compliance',
    readTime: '10 min',
    updatedDate: '2026-02-03',
    keywords: [
      'nis2 compliance',
      'cyber governance',
      'risk management cyber',
      'incident notification',
      'security program roadmap',
    ],
    intro:
      'NIS2 impose une demarche continue: gouvernance, mesures techniques et reporting. Ce guide propose un chemin incremental, adapte a une equipe securite operationnelle.',
    sections: [
      {
        id: 'gouvernance',
        title: '1. Gouvernance et perimetre',
        paragraphs: [
          'Identifiez les actifs essentiels, les dependances fournisseurs et les responsables de decision.',
          'Le niveau direction doit valider les priorites, budgets et arbitrages de risque.',
        ],
        checklist: [
          'Cartographier les services essentiels',
          'Nommer les responsables cyber par domaine',
          'Definir une politique de gestion des risques cyber',
        ],
      },
      {
        id: 'mesures',
        title: '2. Mesures de securite minimales',
        paragraphs: [
          'Priorisez MFA, gestion des vulnerabilites, segmentation, sauvegardes et supervision continue.',
          'Chaque controle doit avoir un proprietaire, un niveau de couverture et une cible d amelioration trimestrielle.',
        ],
        checklist: [
          'Mettre a jour un plan de patch management base risque',
          'Durcir les acces privilegies et les tiers',
          'Tracer la couverture de journalisation et d alerting',
        ],
      },
      {
        id: 'notification',
        title: '3. Notification incident et preuve',
        paragraphs: [
          'Preparer a froid les workflows de notification reduit fortement les erreurs en situation de crise.',
          'Conservez les preuves techniques et de gouvernance pour demonstrer la diligence et l amelioration continue.',
        ],
        checklist: [
          'Formaliser un workflow de notification incident',
          'Conserver les preuves de tests/exercices',
          'Mettre en place une revue semestrielle de conformite',
        ],
      },
    ],
    faq: [
      {
        question: 'NIS2 concerne-t-il uniquement les grandes entreprises ?',
        answer:
          'Non. Le perimetre depend du secteur, du role dans la chaine de valeur et du niveau de criticite des services.',
      },
      {
        question: 'Par quoi commencer pour etre credibles rapidement ?',
        answer:
          'Par un inventaire fiable, un plan de risque priorise, et des controles de base mesurables (MFA, backups, vuln management).',
      },
    ],
    relatedAnalyses: ['ransomware-readiness', 'ad-tiering'],
    relatedPlaybooks: ['pb-007', 'pb-012', 'pb-015'],
    relatedLinks: [
      { label: 'Voir la base de sources officielles', path: '/sources' },
      { label: 'Contacter Cyber Guide', path: '/contact' },
    ],
  },
];

export const getGuideBySlug = (slug: string) => guides.find((guide) => guide.slug === slug);
