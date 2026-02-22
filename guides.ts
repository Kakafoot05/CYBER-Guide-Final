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
    title: 'Guide Sécurité Active Directory',
    excerpt:
      'Plan défensif concret pour réduire les mouvements latéraux, protéger Tier 0 et renforcer la résilience AD.',
    category: 'Identity & Infrastructure',
    readTime: '12 min',
    updatedDate: '2026-02-08',
    keywords: [
      'active directory security',
      'tiering ad',
      'hardening ad',
      'sécurité windows',
      'tier 0',
    ],
    intro:
      "Active Directory reste la cible principale des attaques de rançon. Ce guide synthétise les contrôles qui produisent un impact rapide et mesurable, sans bloquer l'exploitation quotidienne.",
    sections: [
      {
        id: 'fondations',
        title: '1. Fondations de confiance',
        paragraphs: [
          "Commencez par réduire la surface d'administration : comptes séparés, MFA fort et postes d'administration dédiés.",
          'Le modèle Tier 0, Tier 1 et Tier 2 doit être appliqué techniquement via des OU, GPO et restrictions de connexion explicites.',
        ],
        checklist: [
          'Limiter les comptes Domain Admin à un nombre très restreint',
          'Activer LAPS sur postes et serveurs',
          'Bloquer les connexions privilégiées sur postes utilisateurs',
        ],
      },
      {
        id: 'detection',
        title: '2. Détection et containment',
        paragraphs: [
          'Une défense AD efficace combine prévention et détection. Surveillez les indicateurs de DCSync, ajout de comptes privilégiés et délégations suspectes.',
          'Définissez des playbooks de containment pour révoquer rapidement sessions, secrets et tickets Kerberos.',
        ],
        checklist: [
          'Alerter sur création ou modification des groupes admin critiques',
          'Surveiller les authentifications anormales et impossible travel',
          'Tester un reset contrôlé de credentials privilégiés',
        ],
      },
      {
        id: 'gouvernance',
        title: '3. Gouvernance continue',
        paragraphs: [
          "La robustesse AD n'est pas un projet one-shot. Programmez des revues d'accès trimestrielles et des exercices de restauration.",
          'Mesurez la maturité avec des indicateurs simples : nombre de comptes privilégiés, couverture MFA, délai moyen de remédiations critiques.',
        ],
        checklist: [
          'Mettre en place une revue trimestrielle des droits admin',
          'Exécuter un test de restauration AD annuel',
          'Tracer un plan de remédiation priorisé sur 90 jours',
        ],
      },
    ],
    faq: [
      {
        question: 'Quel est le premier contrôle à déployer sur un AD faible ?',
        answer:
          'La séparation des comptes admin et user, combinée à MFA fort, produit le meilleur ratio effort/impact.',
      },
      {
        question: "Peut-on sécuriser AD sans refondre toute l'infra ?",
        answer:
          'Oui. Un plan en vagues successives (Tiering, LAPS, restrictions de logon, alertes critiques) permet une progression rapide.',
      },
    ],
    relatedAnalyses: ['ad-tiering', 'identite-mfa-fatigue'],
    relatedPlaybooks: ['pb-006', 'pb-008', 'pb-014'],
    relatedLinks: [
      { label: 'Explorer les outils défensifs', path: '/outils' },
      { label: 'Voir les sources et standards', path: '/sources' },
    ],
  },
  {
    slug: 'reponse-ransomware-pme',
    title: 'Guide Réponse Ransomware PME',
    excerpt:
      'Playbook de préparation et de réponse pour réduire le temps de crise, protéger les sauvegardes et restaurer plus vite.',
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
      'La différence entre une crise maîtrisée et un arrêt prolongé repose sur la préparation. Ce guide priorise les actions qui diminuent le risque de propagation et accélèrent la reprise.',
    sections: [
      {
        id: 'preparation',
        title: '1. Préparation avant incident',
        paragraphs: [
          'Documentez les rôles de crise, les canaux de communication hors bande et la liste des actifs critiques.',
          'Les sauvegardes doivent être immuables ou hors ligne, avec des tests de restauration réguliers en environnement isolé.',
        ],
        checklist: [
          'Maintenir un annuaire de crise hors bande',
          "Vérifier l'immutabilité des sauvegardes critiques",
          'Exercer un scénario ransomware au moins 2 fois par an',
        ],
      },
      {
        id: 'containment',
        title: '2. Containment et investigation',
        paragraphs: [
          "À la détection, isolez les systèmes touchés sans détruire les preuves utiles. La priorité est d'arrêter la propagation latérale.",
          'Conservez les journaux, identifiez le patient zéro et activez les playbooks de communication management/ops.',
        ],
        checklist: [
          'Isoler les endpoints suspects via EDR ou segmentation réseau',
          'Capturer les artefacts critiques (notes, logs, IOC)',
          'Notifier rapidement les parties prenantes internes',
        ],
      },
      {
        id: 'reconstruction',
        title: '3. Reconstruction et retour à la normale',
        paragraphs: [
          'Favorisez le rebuild maîtrisé plutôt que le nettoyage partiel. Validez les accès et secrets avant remise en production.',
          'Formalisez le post-mortem : cause racine, délai de détection, actions correctives et calendrier de suivi.',
        ],
        checklist: [
          'Réinitialiser les comptes et secrets sensibles',
          'Restaurer depuis des sauvegardes vérifiées',
          'Suivre un plan de remédiations post-incident sous 30 jours',
        ],
      },
    ],
    faq: [
      {
        question: 'Faut-il payer une rançon pour redémarrer vite ?',
        answer:
          'Le paiement ne garantit ni décryption ni non-divulgation. La meilleure stratégie reste préparation, containment et restauration contrôlée.',
      },
      {
        question: 'Quel KPI suivre après crise ?',
        answer:
          'Le MTTR, la couverture des sauvegardes testées, et le taux de remédiations closes dans les 30 jours.',
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
    title: 'Guide Conformité NIS2',
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
      'NIS2 impose une démarche continue : gouvernance, mesures techniques et reporting. Ce guide propose un chemin incrémental, adapté à une équipe sécurité opérationnelle.',
    sections: [
      {
        id: 'gouvernance',
        title: '1. Gouvernance et périmètre',
        paragraphs: [
          'Identifiez les actifs essentiels, les dépendances fournisseurs et les responsables de décision.',
          'Le niveau direction doit valider les priorités, budgets et arbitrages de risque.',
        ],
        checklist: [
          'Cartographier les services essentiels',
          'Nommer les responsables cyber par domaine',
          'Définir une politique de gestion des risques cyber',
        ],
      },
      {
        id: 'mesures',
        title: '2. Mesures de sécurité minimales',
        paragraphs: [
          'Priorisez MFA, gestion des vulnérabilités, segmentation, sauvegardes et supervision continue.',
          "Chaque contrôle doit avoir un propriétaire, un niveau de couverture et une cible d'amélioration trimestrielle.",
        ],
        checklist: [
          'Mettre à jour un plan de patch management basé risque',
          'Durcir les accès privilégiés et les tiers',
          "Tracer la couverture de journalisation et d'alerting",
        ],
      },
      {
        id: 'notification',
        title: '3. Notification incident et preuve',
        paragraphs: [
          'Préparer à froid les workflows de notification réduit fortement les erreurs en situation de crise.',
          "Conservez les preuves techniques et de gouvernance pour démontrer la diligence et l'amélioration continue.",
        ],
        checklist: [
          'Formaliser un workflow de notification incident',
          'Conserver les preuves de tests/exercices',
          'Mettre en place une revue semestrielle de conformité',
        ],
      },
    ],
    faq: [
      {
        question: 'NIS2 concerne-t-il uniquement les grandes entreprises ?',
        answer:
          'Non. Le périmètre dépend du secteur, du rôle dans la chaîne de valeur et du niveau de criticité des services.',
      },
      {
        question: 'Par quoi commencer pour être crédibles rapidement ?',
        answer:
          'Par un inventaire fiable, un plan de risque priorisé, et des contrôles de base mesurables (MFA, backups, vuln management).',
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
