import type { Analysis, Tool, Project, Playbook, BlogPost, Software, CyberTemplate } from './types';

// --- ANALYSES (Base de connaissances enrichie) ---
const baseAnalyses: Omit<Analysis, 'publishedDate' | 'updatedDate' | 'ogImage' | 'expertFormat'>[] =
  [
    {
      id: 'a1',
      slug: 'identite-mfa-fatigue',
      title: 'MFA Fatigue & Session Hijacking',
      subtitle: "L'échec du MFA basique face aux attaques d'usurpation de session",
      category: 'Identity',
      level: 'Intermédiaire',
      date: 'Oct 2025',
      readTime: '11 min',
      tags: ['MFA', 'OAuth', 'AiTM', 'Session'],
      keyMetrics: [
        {
          label: 'Hausse attaques MFA fatigue',
          value: '+400%',
          benchmark: '12 mois',
          source: 'Mandiant M-Trends 2024',
          insight: "La pression utilisateur devient un vecteur d'entrée initial prioritaire.",
        },
        {
          label: 'Comptes compromis sans malware',
          value: '62%',
          benchmark: 'Incidents identity ciblés',
          source: 'Microsoft Incident Response',
          insight: 'Le contournement passe souvent par le facteur humain et les sessions web.',
        },
        {
          label: 'Temps vers première règle mailbox',
          value: '11 min',
          benchmark: 'Médiane observée',
          source: 'Retours terrain SOC',
          insight: "L'attaquant monétise vite via forwarding, fraude et persistance mail.",
        },
        {
          label: 'Risque sans Number Matching',
          value: 'x3.4',
          benchmark: 'Comparatif populations MFA',
          source: 'Synthèse SOC + éditeurs IAM',
          insight: 'Le challenge contextuel réduit fortement les validations impulsives.',
        },
      ],
      constats: [
        {
          text: 'Les attaques par MFA fatigue augmentent sur les comptes à forte exposition métier (finance, RH, support).',
          source: 'Mandiant M-Trends 2024',
        },
        {
          text: 'Le vol de cookies de session (AiTM / infostealer) contourne un MFA correctement déployé.',
          source: 'Microsoft DART / Entra ID',
        },
        {
          text: 'Les règles de forwarding et les consentements OAuth abusifs servent de persistance discrète.',
          source: 'ANSSI + Microsoft Security',
        },
      ],
      painPoints: [
        'Validation MFA par lassitude utilisateur en dehors des heures de travail.',
        'Postes compromis exfiltrant tokens navigateur et refresh tokens.',
        'Absence de vue consolidée sur sessions, appareils et consentements OAuth.',
        'Révocation incomplète des sessions après reset mot de passe.',
      ],
      recommendations: [
        'Activer Number Matching + géolocalisation contextuelle sur 100% des comptes.',
        'Forcer FIDO2 / phishing-resistant MFA pour les comptes à privilèges.',
        'Limiter durée de session web et imposer re-auth sur actions sensibles.',
        'Mettre en place un runbook de révocation globale sessions + tokens OAuth.',
      ],
      proofs: [
        {
          text: 'Des campagnes MFA fatigue ont permis des compromissions médiatisées sur des organisations majeures.',
          source: 'Analyses publiques incidents (Uber, Okta, etc.)',
        },
        {
          text: 'Les kits AiTM industrialisent la capture de session après étape MFA validée.',
          source: 'Threat intelligence éditeurs sécurité',
        },
      ],
      threatSignals: [
        'Rafales de prompts MFA refusés puis validés sur une courte fenêtre.',
        "Connexion réussie depuis un user-agent jamais vu pour l'utilisateur.",
        "Création de règle mailbox 'forward/delete' dans les 30 min après login.",
        'Consentement OAuth à une application non approuvée.',
        'Session active simultanée sur deux zones géographiques incompatibles.',
      ],
      discoveryQuestions: [
        'Le Number Matching est-il forcé pour tous les comptes externes ?',
        "Disposez-vous d'alertes corrélées MFA + impossible travel + création règle inbox ?",
        'Les tokens sont-ils révoqués à chaque incident de compromission ?',
        'Les comptes admin utilisent-ils un facteur MFA résistant au phishing ?',
      ],
      checklist: [
        'Activer Number Matching et désactiver push legacy.',
        "Bloquer l'enrôlement MFA hors contexte de confiance.",
        'Réduire la durée de vie des sessions navigateur critiques.',
        'Auditer hebdomadairement règles inbox + consentements OAuth.',
        'Tester trimestriellement la procédure de révocation globale.',
      ],
      linkedPlaybooks: ['pb-002', 'pb-014'],
      navigatorPages: ['p.23', 'p.49', 'p.52'],
    },
    {
      id: 'a2',
      slug: 'ad-tiering',
      title: 'Modèle de Tiering Active Directory',
      subtitle: 'Segmentation des privilèges pour stopper la latéralisation',
      category: 'Infrastructure',
      level: 'Avancé',
      date: 'Sep 2025',
      readTime: '14 min',
      tags: ['Active Directory', 'Tiering', 'Privilèges', 'LAPS'],
      keyMetrics: [
        {
          label: 'Incidents ransomware avec AD impliqué',
          value: '9/10',
          benchmark: 'Cas majeurs',
          source: 'ANSSI - État de la menace',
          insight: "Le contrôle de l'AD reste l'objectif principal de l'attaquant.",
        },
        {
          label: 'Comptes admin sans séparation d’usage',
          value: '57%',
          benchmark: 'Parcs audités',
          source: 'Retours audit AD / SOC',
          insight: 'La même identité sert encore admin + bureautique dans de nombreux SI.',
        },
        {
          label: 'Persistance moyenne avant détection',
          value: '16 jours',
          benchmark: 'Intrusions AD',
          source: 'M-Trends + retours terrain',
          insight: 'Sans télémétrie dédiée AD, les signaux restent faibles trop longtemps.',
        },
        {
          label: 'Réduction risque mouvement latéral',
          value: '-45%',
          benchmark: 'Après tiering T0/T1/T2',
          source: 'Programmes hardening AD',
          insight: 'La séparation de plan admin a un effet immédiat sur la propagation.',
        },
      ],
      constats: [
        {
          text: "La compromission d'un compte privilégié reste le pivot le plus rentable pour l'attaquant.",
          source: 'ANSSI / CISA advisory AD hardening',
        },
        {
          text: 'Des chemins de délégation historiques exposent souvent Tier 0 via des droits indirects.',
          source: 'Audits AD / outils BloodHound & PingCastle',
        },
        {
          text: 'Les comptes de service non gouvernés conservent des secrets à forte valeur offensive.',
          source: 'NIST SP 800-63 + retours IR',
        },
      ],
      painPoints: [
        'Domain Admin utilisé pour opérations de support quotidien.',
        'Comptes de service sans rotation ni coffre de secrets.',
        'Absence de bastion/PAW dédié au Tier 0.',
        'Supervision incomplète des événements critiques AD (DCSync, GPO, groupes admin).',
      ],
      recommendations: [
        'Appliquer strictement Tier 0 / Tier 1 / Tier 2 avec OU dédiées.',
        'Isoler les opérations Tier 0 via PAW + MFA fort.',
        'Déployer LAPS/gMSA pour éliminer les secrets statiques.',
        'Activer détections AD natives: DCSync, membership admin, délégations critiques.',
      ],
      proofs: [
        {
          text: 'Mimikatz, Rubeus et DCSync restent des techniques récurrentes lors des compromissions AD.',
          source: 'MITRE ATT&CK / retours DFIR',
        },
        {
          text: 'Les incidents à fort impact montrent une élévation rapide vers Domain Admin avant chiffrement.',
          source: 'Rapports IR publics 2024-2025',
        },
      ],
      threatSignals: [
        'Ajout d’un compte dans Domain Admins en horaire atypique.',
        'Appels DCSync depuis un hôte non autorisé.',
        'Connexions admin Tier 0 depuis poste bureautique.',
        'Création ou modification de GPO critique hors fenêtre de changement.',
        'Échec répété Kerberos suivi d’authentification NTLM réussie.',
      ],
      discoveryQuestions: [
        'Combien de comptes Tier 0 existent réellement et sont-ils nominatifs ?',
        'Avez-vous une matrice explicite des droits de délégation AD ?',
        'Les comptes de service critiques sont-ils passés en gMSA ?',
        'Le SOC reçoit-il les événements AD sensibles en temps réel ?',
      ],
      checklist: [
        "Auditer les membres de 'Domain Admins' et groupes équivalents.",
        'Déployer LAPS/gMSA sur périmètre prioritaire.',
        'Interdire logon admin privilégié sur postes utilisateurs.',
        'Activer supervision DCSync / changements GPO / nouveaux trusts.',
        'Exécuter un test de latéralisation simulée après durcissement.',
      ],
      linkedPlaybooks: ['pb-006', 'pb-013'],
      navigatorPages: ['p.30', 'p.31', 'p.35'],
    },
    {
      id: 'a3',
      slug: 'ransomware-readiness',
      title: 'Ransomware : êtes-vous réellement prêt ?',
      subtitle: 'Au-delà des sauvegardes: confinement, reprise et gouvernance de crise',
      category: 'Opérationnel',
      level: 'Débutant',
      date: 'Oct 2025',
      readTime: '12 min',
      tags: ['Ransomware', 'Backup', 'BIA', 'Crise'],
      keyMetrics: [
        {
          label: 'Part des incidents avec extorsion double',
          value: '73%',
          benchmark: 'Campagnes récentes',
          source: 'CISA + rapports IR',
          insight: 'La fuite de données accompagne souvent le chiffrement.',
        },
        {
          label: 'Backups également impactés',
          value: '70%',
          benchmark: 'Organisations touchées',
          source: 'Veeam Ransomware Trends',
          insight: 'Le backup non isolé ne protège pas la continuité.',
        },
        {
          label: 'Rétablissement opérationnel médian',
          value: '21 jours',
          benchmark: 'MTTR crise',
          source: 'Coveware / retours assureurs',
          insight: 'La reprise métier est principalement un sujet organisationnel.',
        },
        {
          label: 'Exercices de restauration complets annuels',
          value: '<35%',
          benchmark: 'Entreprises observées',
          source: 'Synthèse audits continuité',
          insight: 'Beaucoup de plans existent sur papier sans validation technique.',
        },
      ],
      constats: [
        {
          text: 'Les opérateurs ciblent en priorité hyperviseurs, AD et serveurs de sauvegarde.',
          source: 'ANSSI + retours CERT',
        },
        {
          text: 'Une organisation sans plan de priorisation métier subit une reprise lente et coûteuse.',
          source: 'Retours post-mortem crise',
        },
        {
          text: 'Le délai de confinement initial conditionne fortement le coût total de la crise.',
          source: 'M-Trends / DFIR',
        },
      ],
      painPoints: [
        'Sauvegardes accessibles depuis le même plan AD que la production.',
        'Absence de runbook de reconstruction des services essentiels.',
        'Dépendances applicatives critiques non documentées.',
        'Canaux de communication de crise indisponibles hors SI principal.',
      ],
      recommendations: [
        'Isoler les backups avec immutabilité et contrôle d’accès séparé.',
        'Formaliser un ordre de reprise orienté BIA (services essentiels en premier).',
        'Préparer un annuaire de crise hors bande et rôles nominativement attribués.',
        'Tester en exercice la restauration complète de scénarios critiques.',
      ],
      proofs: [
        {
          text: 'Des incidents récents montrent la suppression ou corruption des sauvegardes avant chiffrement final.',
          source: 'Rapports publics ransomware',
        },
        {
          text: "Les organisations ayant des exercices de reprise fréquents réduisent significativement le temps d'arrêt.",
          source: 'Benchmarks continuité activité',
        },
      ],
      threatSignals: [
        'Arrêt massif de services de sauvegarde ou désactivation jobs.',
        'Suppression anormale snapshots / shadow copies.',
        "Création d'archives volumineuses vers destinations externes.",
        'Mouvements latéraux SMB/RDP entre segments normalement isolés.',
        'Hausse brutale des erreurs de chiffrement fichiers sur partages.',
      ],
      discoveryQuestions: [
        'Votre plan de reprise définit-il un ordre métier validé par la direction ?',
        'Les sauvegardes critiques sont-elles inaccessibles avec un compte AD compromis ?',
        'Quel est le dernier test réel de restauration bout-en-bout ?',
        'Avez-vous un canal de crise opérationnel sans dépendre de M365 interne ?',
      ],
      checklist: [
        "Valider l'immuabilité / isolement des sauvegardes critiques.",
        'Tester la restauration d’un service prioritaire avec mesure du RTO réel.',
        'Documenter les dépendances applicatives essentielles.',
        'Préparer un kit de crise hors ligne (contacts, procédures, décisions).',
        'Exécuter un exercice de confinement en conditions réalistes.',
      ],
      linkedPlaybooks: ['pb-001', 'pb-011'],
      navigatorPages: ['p.12', 'p.15', 'p.18'],
    },
    {
      id: 'a4',
      slug: 'cicd-secrets-exposition',
      title: 'Chaîne CI/CD : secrets exposés et risque supply chain',
      subtitle: 'Dépôts, pipelines et artefacts: où se jouent les compromissions discrètes',
      category: 'Cloud',
      level: 'Avancé',
      date: 'Jan 2026',
      readTime: '11 min',
      tags: ['CI/CD', 'Supply Chain', 'Secrets', 'Git'],
      keyMetrics: [
        {
          label: 'Repos avec secret exposé au moins une fois',
          value: '1 sur 10',
          benchmark: 'Audits internes + OSS',
          source: 'GitGuardian State of Secrets Sprawl',
          insight: 'La fuite de secret est un incident fréquent, pas un cas exceptionnel.',
        },
        {
          label: 'Temps médian de révocation secret',
          value: '4 jours',
          benchmark: 'Programmes observés',
          source: 'Retours SOC / DevSecOps',
          insight: 'Le délai de rotation reste trop long face à l’automatisation attaquante.',
        },
        {
          label: 'Incidents supply chain impliquant CI',
          value: '38%',
          benchmark: 'Périmètres cloud',
          source: 'ENISA Threat Landscape',
          insight: "Les pipelines sont devenus un pivot d'accès à forte valeur.",
        },
        {
          label: 'Build runners durcis avec identité courte durée',
          value: '<30%',
          benchmark: 'Parcs analysés',
          source: 'Benchmarks DevSecOps',
          insight: 'Les identités longues durées restent trop présentes dans les jobs CI.',
        },
      ],
      constats: [
        {
          text: 'Les secrets en clair dans Git restent un vecteur direct de compromission cloud.',
          source: 'GitGuardian / AWS Security',
        },
        {
          text: 'La compromission d’un runner CI permet souvent un accès transversal aux environnements.',
          source: 'Retours IR cloud',
        },
        {
          text: "La signature d'artefacts et la provenance logicielle sont encore peu déployées.",
          source: 'SLSA / NIST SSDF',
        },
      ],
      painPoints: [
        'Rotation manuelle des clés API après exposition.',
        'Permissions pipelines trop larges sur cloud et registry.',
        'Faible traçabilité des jobs lancés hors pipeline standard.',
        'Absence de politique unifiée sur secrets managers et tokens.',
      ],
      recommendations: [
        'Passer aux identités fédérées courtes durées pour jobs CI.',
        'Scanner secrets en pre-commit, CI et historique Git.',
        'Signer artefacts et imposer validation provenance en déploiement.',
        'Segmenter runners par criticité et restreindre accès cloud minimal.',
      ],
      proofs: [
        {
          text: "Des incidents publics montrent qu'un token CI exposé suffit à pousser du code malveillant en chaîne.",
          source: 'Post-mortem supply chain publics',
        },
        {
          text: 'La rotation rapide des secrets réduit significativement la fenêtre d’exploitation.',
          source: 'Retours programmes cloud matures',
        },
      ],
      threatSignals: [
        'Création de token CI à privilège élevé hors procédure.',
        'Job pipeline exécuté depuis branche inattendue ou fork non approuvé.',
        'Poussée d’artefact non signé vers registre production.',
        'Accès cloud via clé statique liée à un runner partagé.',
        'Lecture massive de variables de pipeline sensibles.',
      ],
      discoveryQuestions: [
        'Quel est votre délai réel entre détection secret et révocation effective ?',
        'Les runners CI utilisent-ils des identités temporaires plutôt que clés statiques ?',
        "Avez-vous un contrôle bloquant sur la signature d'artefacts ?",
        'Le SOC corrèle-t-il événements Git, CI et cloud sur une même timeline ?',
      ],
      checklist: [
        'Activer scans secrets pre-commit + CI + historique.',
        'Supprimer clés longues durées des pipelines prioritaires.',
        'Mettre en place signature des artefacts critiques.',
        'Restreindre permissions runners par projet et environnement.',
        'Exercer le playbook de rotation de secrets compromis.',
      ],
      linkedPlaybooks: ['pb-009', 'pb-007'],
      navigatorPages: ['p.40', 'p.41', 'p.44'],
    },
    {
      id: 'a5',
      slug: 'vulnerabilites-edge-priorisation',
      title: 'Vulnérabilités Edge : prioriser avant exploitation',
      subtitle: "VPN, firewalls, gateways: la fenêtre d'attaque est de plus en plus courte",
      category: 'Risque Émergent',
      level: 'Intermédiaire',
      date: 'Feb 2026',
      readTime: '9 min',
      tags: ['KEV', 'Patch Management', 'VPN', 'Firewall'],
      keyMetrics: [
        {
          label: 'Failles KEV massivement exploitées',
          value: 'Top priorité',
          benchmark: 'Périmètre exposé',
          source: 'CISA KEV Catalog',
          insight: 'Une CVE KEV sur équipement edge doit être traitée comme incident actif.',
        },
        {
          label: 'Délai entre publication et exploitation',
          value: '<7 jours',
          benchmark: 'Cas edge récents',
          source: 'CISA / éditeurs / CERT',
          insight: 'La fenêtre de patching opérationnelle se réduit fortement.',
        },
        {
          label: 'Actifs edge avec version obsolète',
          value: '31%',
          benchmark: 'Parcs observés',
          source: 'Audits de vulnérabilité',
          insight: 'Le shadow IT réseau ralentit la réduction de surface réelle.',
        },
        {
          label: 'Réduction risque après filtrage management',
          value: '-52%',
          benchmark: 'Programmes durcis',
          source: 'Retours SOC',
          insight: "L'isolement de l'interface admin apporte un gain immédiat.",
        },
      ],
      constats: [
        {
          text: 'Les équipements edge concentrent une forte part des compromissions initiales ciblées.',
          source: 'CISA advisories / retours SOC',
        },
        {
          text: "Les interfaces d'administration exposées restent un anti-pattern récurrent.",
          source: 'ANSSI / NIST hardening guidance',
        },
        {
          text: 'Le patching sans inventaire fiable laisse des angles morts critiques.',
          source: 'Retours audit vulnérabilité',
        },
      ],
      painPoints: [
        'Inventaire incomplet des appliances exposées sur Internet.',
        'Cycle patch trop lent par dépendance change management.',
        'Absence de mesures compensatoires quand patch indisponible.',
        'Journalisation edge insuffisante pour détecter exploitation précoce.',
      ],
      recommendations: [
        'Traiter KEV edge comme incident avec SLA <72h.',
        "Isoler interfaces d'administration (VPN admin dédié + ACL strictes).",
        'Déployer mesures compensatoires (WAF, filtrage IP, désactivation services).',
        'Mettre en place un tableau de bord patching edge orienté exposition réelle.',
      ],
      proofs: [
        {
          text: 'Des campagnes d’exploitation opportunistes ciblent rapidement les failles VPN/firewall publiées.',
          source: 'CERT-FR / CISA / analyses CTI',
        },
        {
          text: "La réduction d'exposition management diminue fortement les tentatives utiles.",
          source: 'Retours SOC périmétriques',
        },
      ],
      threatSignals: [
        'Tentatives répétées sur URI management web non habituelles.',
        'Pic de scans ciblant une version vulnérable spécifique.',
        'Création de comptes admin locaux inconnus sur appliance.',
        'Modification non planifiée de règles NAT / VPN / ACL.',
        'Processus système anormaux sur équipement réseau managé.',
      ],
      discoveryQuestions: [
        'Avez-vous un inventaire à jour des appliances exposées Internet ?',
        'Quel SLA patch appliquez-vous pour les CVE présentes dans KEV ?',
        'Disposez-vous de mesures compensatoires prêtes si patch indisponible ?',
        'Le SOC reçoit-il les logs admin edge en quasi temps réel ?',
      ],
      checklist: [
        'Lister les actifs edge exposés et version logicielle exacte.',
        'Prioriser patching des CVE KEV avec SLA court.',
        'Restreindre immédiatement accès interfaces admin.',
        'Activer collecte logs edge dans SIEM avec alertes dédiées.',
        'Tester plan de rollback patch sur périmètre critique.',
      ],
      linkedPlaybooks: ['pb-007', 'pb-003'],
      navigatorPages: ['p.54', 'p.55', 'p.58'],
    },
    {
      id: 'a6',
      slug: 'nis2-notification-gouvernance',
      title: 'NIS2 : notification incident et gouvernance exécutable',
      subtitle: 'Passer de la conformité papier à une capacité de réponse démontrable',
      category: 'Conformité',
      level: 'Stratégique',
      date: 'Feb 2026',
      readTime: '13 min',
      tags: ['NIS2', 'Gouvernance', 'Notification', 'Crise'],
      keyMetrics: [
        {
          label: 'Alerte initiale exigée',
          value: '24h',
          benchmark: 'Après détection significative',
          source: 'Cadre NIS2',
          insight: 'Le délai est organisationnel avant d’être technique.',
        },
        {
          label: 'Rapport incident intermédiaire',
          value: '72h',
          benchmark: 'Fenêtre réglementaire',
          source: 'Cadre NIS2',
          insight: 'Il faut une chaîne de collecte de faits prête dès le J0.',
        },
        {
          label: 'Entreprises avec RACI incident formalisé',
          value: '<50%',
          benchmark: 'Audits gouvernance',
          source: 'Retours missions conformité',
          insight: 'Le pilotage échoue souvent par manque de responsabilités claires.',
        },
        {
          label: 'Exercices de crise avec direction',
          value: '1/an',
          benchmark: 'Minimum recommandé',
          source: 'ANSSI / bonnes pratiques',
          insight: 'Sans exercice, la notification rapide est rarement tenable.',
        },
      ],
      constats: [
        {
          text: "La contrainte temporelle NIS2 exige un circuit d'escalade décisionnelle explicitement défini.",
          source: 'Cadre NIS2 + pratiques régulateurs',
        },
        {
          text: "Les organisations qui notifient vite disposent d'un journal de preuves déjà structuré.",
          source: 'Retours gestion de crise',
        },
        {
          text: 'Les dépendances fournisseur rendent la qualification incident plus complexe en 24h.',
          source: 'ENISA / incidents supply chain',
        },
      ],
      painPoints: [
        'Rôles flous entre IT, RSSI, juridique et direction.',
        'Inventaire des actifs essentiels incomplet ou non maintenu.',
        'Faible traçabilité de la chronologie décisionnelle.',
        'Dépendances tierces non cartographiées pour notification rapide.',
      ],
      recommendations: [
        'Mettre en place un RACI incident validé par la direction.',
        'Préparer des templates de notification (24h / 72h / final).',
        'Maintenir un registre des actifs essentiels et des dépendances tierces.',
        'Organiser des exercices semestriels incluant juridique et communication.',
      ],
      proofs: [
        {
          text: 'Les audits conformité pointent régulièrement la faiblesse de la preuve de décision en crise.',
          source: 'Retours audits NIS2',
        },
        {
          text: "Un processus de notification pré-écrit réduit fortement la latence d'escalade.",
          source: 'Programmes cyber matures',
        },
      ],
      threatSignals: [
        "Incident qualifié critique sans responsable notification désigné dans l'heure.",
        'Absence de timeline consolidée technique + métier après J0.',
        'Incapacité à produire périmètre impacté initial en moins de 4h.',
        'Dépendance fournisseur critique non documentée au moment de la crise.',
        'Décisions de crise non horodatées et non attribuées.',
      ],
      discoveryQuestions: [
        'Qui signe la notification initiale si la direction est indisponible ?',
        'Disposez-vous d’un modèle de rapport 24h prêt à compléter ?',
        'Votre inventaire couvre-t-il explicitement les actifs essentiels NIS2 ?',
        'Quand a eu lieu le dernier exercice de crise inter-métiers ?',
      ],
      checklist: [
        'Valider RACI incident et suppléances.',
        'Préparer templates notification réglementaire.',
        'Mettre à jour registre actifs essentiels + fournisseurs critiques.',
        'Instrumenter journal horodaté de décisions de crise.',
        'Planifier exercice direction/juridique/technique tous les 6 mois.',
      ],
      linkedPlaybooks: ['pb-015', 'pb-012'],
      navigatorPages: ['p.60', 'p.62', 'p.65'],
    },
  ];

const analysisSeoProfiles: Record<
  string,
  { publishedDate: string; updatedDate: string; ogImage: string }
> = {
  'identite-mfa-fatigue': {
    publishedDate: '2025-10-10',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
  'ad-tiering': {
    publishedDate: '2025-09-18',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
  'ransomware-readiness': {
    publishedDate: '2025-10-22',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
  'cicd-secrets-exposition': {
    publishedDate: '2026-01-16',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
  'vulnerabilites-edge-priorisation': {
    publishedDate: '2026-02-01',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
  'nis2-notification-gouvernance': {
    publishedDate: '2026-02-03',
    updatedDate: '2026-02-06',
    ogImage: '/assets/og/analysis-detail.svg',
  },
};

const analysisExpertProfiles: Record<string, Analysis['expertFormat']> = {
  'identite-mfa-fatigue': {
    context:
      'Campagne de phishing et MFA fatigue ciblee sur comptes metier a forte valeur (finance, RH, support).',
    attackChain: [
      'Reconnaissance des utilisateurs exposes via OSINT et adresses publiques.',
      'Phishing AiTM pour recuperer identifiants primaires et amorcer les prompts MFA.',
      'Rafale de validations MFA push jusqu a acceptation par fatigue utilisateur.',
      'Detournement de session web et creation de regles de forwarding inbox.',
      'Persistance via consentement OAuth malveillant et reutilisation de token.',
    ],
    mitreMapping: [
      { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
      {
        id: 'T1621',
        name: 'Multi-Factor Authentication Request Generation',
        tactic: 'Credential Access',
      },
      {
        id: 'T1550.004',
        name: 'Use Alternate Authentication Material: Web Session Cookie',
        tactic: 'Defense Evasion',
      },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access' },
      { id: 'T1114.003', name: 'Email Collection: Email Forwarding Rule', tactic: 'Collection' },
      { id: 'T1528', name: 'Steal Application Access Token', tactic: 'Credential Access' },
    ],
    iocs: [
      { type: 'Domain', value: 'microsoft-login-secure[.]com', note: 'Domaine AiTM defange.' },
      {
        type: 'URL',
        value: 'https://login-office365-verify[.]com/auth',
        note: 'URL de collecte credential.',
      },
      {
        type: 'UserAgent',
        value: 'python-requests/2.31',
        note: 'Agent atypique apres validation MFA.',
      },
      {
        type: 'Email',
        value: 'security-verify@notice-update[.]com',
        note: 'Expediteur de la vague phishing.',
      },
      {
        type: 'IP',
        value: '185.225.74[.]29',
        note: 'IP recurrente dans les connexions anormales.',
      },
    ],
    detections: [
      {
        title: 'Burst MFA fatigue suivi de connexion reussie',
        platform: 'KQL',
        query:
          "SigninLogs | summarize prompts=count() by UserPrincipalName, ResultType, bin(TimeGenerated, 5m) | where prompts >= 5 and ResultType in ('0','500121')",
        rationale: 'Repere une sequence refus multiples puis succes sur fenetre courte.',
      },
      {
        title: 'Creation de forwarding inbox suspect',
        platform: 'KQL',
        query:
          "OfficeActivity | where Operation in ('New-InboxRule','Set-InboxRule') | where Parameters has_any ('ForwardTo','RedirectTo','DeleteMessage')",
        rationale: 'Detecte la persistance post-compromission la plus frequente sur M365.',
      },
      {
        title: 'OAuth consent non approuve',
        platform: 'Sigma',
        query:
          'title: Suspicious OAuth Consent; logsource: product: m365; detection: selection.operation: Consent to application',
        rationale: 'Alerte sur prise de controle durable via application tierce.',
      },
    ],
    remediation: [
      'Imposer Number Matching et MFA resistant phishing (FIDO2/WebAuthn) sur comptes sensibles.',
      'Revoquer sessions, refresh tokens et consentements OAuth lors de tout incident identite.',
      'Bloquer forwarding externe automatique par politique transport.',
      'Mettre en quarantaine les devices et navigateurs lies a la session compromise.',
    ],
    limits: [
      'Les IOCs campagne changent vite et servent surtout au triage court terme.',
      "Les detections push MFA peuvent produire des faux positifs en cas d'erreur utilisateur legitime.",
      "La qualite des logs OAuth varie selon les licences et l'etendue de l'instrumentation IAM.",
    ],
  },
  'ad-tiering': {
    context:
      'Exposition AD structurelle: absence de tiering strict, comptes privilegies hybrides et controle faible des chemins de delegation.',
    attackChain: [
      'Compromission initiale d un poste utilisateur via phishing ou malware.',
      'Collecte d identifiants et enumeration des chemins de privileges AD.',
      'Elevation via Kerberoasting ou delegation excessive.',
      'DCSync puis ajout dans groupes admin critiques.',
      'Preparation du chiffrement avec GPO malveillantes et mouvement lateral SMB/RDP.',
    ],
    mitreMapping: [
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
      {
        id: 'T1558.003',
        name: 'Steal or Forge Kerberos Tickets: Kerberoasting',
        tactic: 'Credential Access',
      },
      { id: 'T1003.006', name: 'OS Credential Dumping: DCSync', tactic: 'Credential Access' },
      { id: 'T1098', name: 'Account Manipulation', tactic: 'Persistence' },
      {
        id: 'T1484.001',
        name: 'Domain Policy Modification: Group Policy Modification',
        tactic: 'Privilege Escalation',
      },
      {
        id: 'T1021.002',
        name: 'Remote Services: SMB/Windows Admin Shares',
        tactic: 'Lateral Movement',
      },
    ],
    iocs: [
      {
        type: 'Process',
        value: 'mimikatz.exe lsadump::dcsync',
        note: 'Commande DCSync classique.',
      },
      { type: 'Process', value: 'rubeus.exe kerberoast', note: 'Collecte hash SPN pour cracking.' },
      { type: 'UserAgent', value: 'BloodHound/SharpHound', note: 'Enumeration des privileges AD.' },
      { type: 'IP', value: '10.20.14.37', note: 'Hote bureautique avec requetes replication.' },
      {
        type: 'Registry',
        value: 'HKLM\\System\\CurrentControlSet\\Services\\NTDS\\Parameters',
        note: 'Modification sensible AD DS.',
      },
    ],
    detections: [
      {
        title: 'DCSync depuis hote non autorise',
        platform: 'Sigma',
        query:
          'title: Suspicious DCSync; logsource: product: windows, service: security; detection: EventID: 4662 and AccessMask: 0x100',
        rationale: 'Repere la replication AD hors controleur de domaine.',
      },
      {
        title: 'Ajout groupe privilegie hors fenetre',
        platform: 'KQL',
        query:
          "SecurityEvent | where EventID in (4728,4732,4756) | where TargetUserName has_any ('Domain Admins','Enterprise Admins')",
        rationale: 'Surveille les changements de privilege les plus critiques.',
      },
      {
        title: 'Kerberoasting massif',
        platform: 'KQL',
        query:
          'SecurityEvent | where EventID == 4769 | summarize spn_count=dcount(ServiceName) by Account, bin(TimeGenerated, 15m) | where spn_count > 20',
        rationale: 'Identifie une collecte anormale de tickets de service.',
      },
    ],
    remediation: [
      'Appliquer tiering T0/T1/T2 avec comptes separes et PAW dedies.',
      'Migrer comptes de service critiques vers gMSA et rotation automatisee.',
      'Durcir ACL AD et supprimer delegations historiques non justifiees.',
      'Mettre en place un plan de reset coordonne des secrets privilegies.',
    ],
    limits: [
      'Le tiering requiert coordination IAM, infra et support pour eviter la dette operationnelle.',
      'Une couverture AD incomplete des journaux reduit la detection des techniques stealth.',
      'Les simulations AD peuvent differer des techniques observees en incident reel.',
    ],
  },
  'ransomware-readiness': {
    context:
      'Evaluation de preparation ransomware avec focus sur confinement initial, protection backup et capacite de reconstruction.',
    attackChain: [
      'Acces initial via compte compromis ou service distant expose.',
      'Elevation privilege puis cartographie AD, hyperviseurs et sauvegardes.',
      'Exfiltration selective des donnees sensibles pour double extorsion.',
      'Desactivation defenses et suppression snapshots/shadow copies.',
      'Chiffrement massif puis pression financiere et communication de crise.',
    ],
    mitreMapping: [
      { id: 'T1133', name: 'External Remote Services', tactic: 'Initial Access' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
      { id: 'T1567', name: 'Exfiltration Over Web Service', tactic: 'Exfiltration' },
      { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
      {
        id: 'T1021.001',
        name: 'Remote Services: Remote Desktop Protocol',
        tactic: 'Lateral Movement',
      },
    ],
    iocs: [
      {
        type: 'Process',
        value: 'vssadmin delete shadows /all /quiet',
        note: 'Suppression restauration systeme.',
      },
      {
        type: 'Domain',
        value: 'mega-upload-sync[.]net',
        note: 'Destination exfiltration suspecte.',
      },
      {
        type: 'IP',
        value: '91.214.124[.]103',
        note: 'Serveur C2 observe sur intrusion similaire.',
      },
    ],
    detections: [
      {
        title: 'Shadow copies supprimees',
        platform: 'Sigma',
        query:
          "title: Shadow Copy Deletion; logsource: product: windows; detection: CommandLine|contains: 'vssadmin delete shadows'",
        rationale: 'Signal fort pre-chiffrement.',
      },
      {
        title: 'Pic extension fichiers chiffrees',
        platform: 'KQL',
        query:
          "DeviceFileEvents | where ActionType == 'FileRenamed' | summarize count() by DeviceName, bin(TimeGenerated, 5m) | where count_ > 2000",
        rationale: 'Repere un chiffrement massif.',
      },
    ],
    remediation: [
      'Isoler immediatement segments infectes et comptes a privilege suspect.',
      'Basculer sur sauvegardes immuables/hors ligne verifiees avant reprise.',
      'Rebuilder systemes critiques au lieu de nettoyer partiellement.',
      'Executer post-mortem sous 72h avec plan de remediations priorise.',
    ],
    limits: [
      "Les modeles d'attaque varient selon l'affilie ransomware et le secteur cible.",
      'Les signaux de chiffrement peuvent arriver tard si la telemetrie endpoint est partielle.',
      'Les delais de reprise dependent fortement des dependances metier hors perimetre IT.',
    ],
  },
  'cicd-secrets-exposition': {
    context:
      'Risque supply chain issu de secrets exposes dans Git et de pipelines CI/CD avec identites longues durees.',
    attackChain: [
      'Fuite de secret dans commit ou variable pipeline non protegee.',
      'Recuperation du token et acces au projet CI/CD.',
      'Execution job malveillant sur runner partage.',
      'Publication artefact compromis vers registry interne.',
      'Propagation en production via pipeline deploiement automatique.',
    ],
    mitreMapping: [
      {
        id: 'T1552.001',
        name: 'Unsecured Credentials: Credentials In Files',
        tactic: 'Credential Access',
      },
      { id: 'T1528', name: 'Steal Application Access Token', tactic: 'Credential Access' },
      {
        id: 'T1195.001',
        name: 'Supply Chain Compromise: Compromise Software Dependencies and Development Tools',
        tactic: 'Initial Access',
      },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Persistence' },
      {
        id: 'T1059.004',
        name: 'Command and Scripting Interpreter: Unix Shell',
        tactic: 'Execution',
      },
      { id: 'T1610', name: 'Deploy Container', tactic: 'Execution' },
    ],
    iocs: [
      {
        type: 'Domain',
        value: 'pkg-mirror-cache[.]io',
        note: 'Registry de packages non approuve.',
      },
      {
        type: 'Hash',
        value: '9e1a52a3f2bc4d7f0d9388cc47c2a44b',
        note: 'Digest artefact non signe.',
      },
      { type: 'IP', value: '45.155.205[.]66', note: 'Runner cloud inconnu a verifier.' },
    ],
    detections: [
      {
        title: 'Token pipeline cree hors changement approuve',
        platform: 'Sigma',
        query:
          "title: CI Token Created Unexpectedly; logsource: product: github; detection: action: 'oauth_authorization.create'",
        rationale: 'Signale un acces persistant dans la chaine build.',
      },
      {
        title: 'Execution job depuis branche non autorisee',
        platform: 'KQL',
        query:
          "CIActivity | where EventType == 'workflow_run' and Branch !in ('main','release') | summarize count() by Repository, Actor, bin(TimeGenerated, 30m)",
        rationale: 'Repere une deviation du flux de build officiel.',
      },
    ],
    remediation: [
      'Supprimer secrets statiques des pipelines et migrer vers identites federes courtes durees.',
      'Imposer scans secrets pre-commit, CI et historique Git.',
      'Signer artefacts et bloquer deploiement sans preuve de provenance.',
      'Isoler runners par criticite avec privileges minimaux.',
    ],
    limits: [
      'Les journaux CI varient fortement selon GitHub/GitLab/Azure DevOps.',
      'Les detections supply chain exigent correlation entre logs dev et telemetrie cloud.',
      'Le scanning de secrets peut generer du bruit sans gouvernance de faux positifs.',
    ],
  },
  'vulnerabilites-edge-priorisation': {
    context:
      'Pilotage patch edge (VPN, firewall, gateway) sur base exposition internet et menace exploitee KEV.',
    attackChain: [
      'Scan internet cible sur version vulnerable exposee.',
      'Exploitation pre-auth de service edge public.',
      'Creation de compte admin local ou web shell appliance.',
      'Pivot vers reseau interne via tunnels VPN et ACL mal segmentees.',
      'Escalade laterale vers services identite et donnees critiques.',
    ],
    mitreMapping: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
      { id: 'T1133', name: 'External Remote Services', tactic: 'Initial Access' },
      { id: 'T1505.003', name: 'Server Software Component: Web Shell', tactic: 'Persistence' },
      { id: 'T1098', name: 'Account Manipulation', tactic: 'Persistence' },
      { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
    ],
    iocs: [
      {
        type: 'URL',
        value: '/dana-na/auth/url_admin/welcome.cgi',
        note: 'Chemin vise sur certains VPN.',
      },
      { type: 'URL', value: '/remote/logincheck', note: 'Endpoint d exploitation recurrent.' },
      { type: 'IP', value: '193.142.146[.]14', note: 'Source de scan/exploitation repetee.' },
    ],
    detections: [
      {
        title: 'Exploitation endpoint management web',
        platform: 'KQL',
        query:
          "CommonSecurityLog | where RequestURL has_any ('/dana-na/','/remote/logincheck','/ssl-vpn/') | summarize hits=count() by SourceIP, RequestURL, bin(TimeGenerated, 5m) | where hits > 20",
        rationale: 'Capture les rafales d exploitation sur interfaces exposees.',
      },
      {
        title: 'Creation compte admin locale appliance',
        platform: 'Sigma',
        query:
          "title: Local Admin Created On Network Appliance; logsource: product: linux; detection: CommandLine|contains: 'useradd' and CommandLine|contains: 'admin'",
        rationale: 'Indicateur post-exploitation frequent sur equipements edge.',
      },
    ],
    remediation: [
      'Traiter CVE KEV edge sous SLA incident (<72h) avec ownership explicite.',
      'Couper exposition management internet et imposer acces admin via segment dedie.',
      'Appliquer mesures compensatoires immediates si patch indisponible (WAF, ACL, desactivation).',
      'Verifier comptes locaux et configurations apres chaque remediation.',
    ],
    limits: [
      'Les IOCs edge sont souvent specifiques a un constructeur/version.',
      'Les logs natifs appliance peuvent etre pauvres sans export syslog detaille.',
      'Un patch sans inventaire expose complet laisse un risque residuel cache.',
    ],
  },
  'nis2-notification-gouvernance': {
    context:
      'Scenario de crise cyber necessitant qualification rapide, notification reglementaire et gouvernance demonstrable NIS2.',
    attackChain: [
      'Compromission initiale sur service critique avec impact potentiel essentiel.',
      'Propagation laterale et degradation de la disponibilite metier.',
      'Qualification technique et metier de la gravite en cellule de crise.',
      'Notification initiale sous 24h puis rapport intermediaire sous 72h.',
      'Cloture avec rapport final, plan de correction et preuves de diligences.',
    ],
    mitreMapping: [
      {
        id: 'T1566.001',
        name: 'Phishing: Spearphishing Attachment',
        tactic: 'Initial Access',
      },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Persistence' },
      { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
      { id: 'T1567', name: 'Exfiltration Over Web Service', tactic: 'Exfiltration' },
    ],
    iocs: [
      {
        type: 'Email',
        value: 'invoice-update@secure-docs[.]co',
        note: 'Leurre initial plausible.',
      },
      { type: 'Domain', value: 'fileshare-sync-pro[.]com', note: 'Point de sortie exfiltration.' },
      { type: 'IP', value: '104.234.182[.]71', note: 'IP associee aux connexions suspectes.' },
    ],
    detections: [
      {
        title: 'Incident critique sans owner notification',
        platform: 'KQL',
        query:
          "IncidentTimeline | where Severity == 'High' and isempty(NotificationOwner) | project IncidentId, TimeGenerated, Service",
        rationale: 'Controle de capacite NIS2 sur la premiere heure de crise.',
      },
      {
        title: 'Exfiltration volumique vers service web externe',
        platform: 'KQL',
        query:
          "ProxyLogs | where BytesSent > 500000000 and DestinationDomain !endswith '.corp.local' | summarize total_bytes=sum(BytesSent) by User, DestinationDomain, bin(TimeGenerated, 1h)",
        rationale: 'Aide a qualifier impact et obligations de notification.',
      },
    ],
    remediation: [
      'Valider RACI incident avec suppleance et autorite de notification explicite.',
      'Industrialiser templates de notification 24h/72h/final avec checklist de preuves.',
      'Synchroniser equipe technique, juridique et communication via runbook commun.',
      'Mesurer delais de qualification et de notification lors des exercices semestriels.',
    ],
    limits: [
      'Les obligations exactes varient selon transposition nationale NIS2.',
      'La qualification impact metier depend de la qualite des cartographies service/fournisseur.',
      'La reconstitution timeline peut etre incomplete si la retention de logs est insuffisante.',
    ],
  },
};

const DEFAULT_ANALYSIS_UPDATED_DATE = '2026-02-06';
const DEFAULT_ANALYSIS_OG_IMAGE = '/assets/og/analysis-detail.svg';

export const analyses: Analysis[] = baseAnalyses.map((analysis) => {
  const seoProfile = analysisSeoProfiles[analysis.slug] ?? {
    publishedDate: DEFAULT_ANALYSIS_UPDATED_DATE,
    updatedDate: DEFAULT_ANALYSIS_UPDATED_DATE,
    ogImage: DEFAULT_ANALYSIS_OG_IMAGE,
  };

  const expertFormat = analysisExpertProfiles[analysis.slug];
  if (!expertFormat) {
    throw new Error(`Missing expert profile for analysis slug: ${analysis.slug}`);
  }

  return {
    ...analysis,
    publishedDate: seoProfile.publishedDate,
    updatedDate: seoProfile.updatedDate,
    ogImage: seoProfile.ogImage,
    expertFormat,
  };
});

// --- OUTILS INTERNES (Modules) ---
export const tools: Tool[] = [
  {
    id: 't1',
    name: 'Incident Report Builder',
    description:
      "Générateur de rapports d'incident structurés basé sur les standards DFIR. Timeline, TTPs MITRE et calcul de sévérité automatique.",
    category: 'Reporting',
    status: 'Démo Live',
    features: ['Mapping MITRE ATT&CK', 'Visualisation Chronologique', 'Export PDF/Markdown'],
  },
  {
    id: 't2',
    name: 'Log Investigator',
    description:
      "Moteur d'analyse de logs côté client (Confidentialité totale). Détection de motifs d'attaque (Force brute, Spraying) sans envoi de données.",
    category: 'Investigation',
    status: 'Prototype',
    features: ['Parsing EVTX/JSON', 'Règles Sigma-lite', 'Traitement Local'],
  },
  {
    id: 't3',
    name: 'Phishing Triage SAFE',
    description:
      "Bac à sable d'analyse statique d'emails. Neutralisation des liens (Defanging), analyse des en-têtes SPF/DKIM/DMARC et prévisualisation sécurisée.",
    category: 'Triage',
    status: 'Prototype',
    features: ['Analyse Headers', 'Neutralisation Liens', 'Prévisualisation Sécurisée'],
  },
];

// --- LOGICIELS EXTERNES ---
export const softwares: Software[] = [
  {
    id: 'soft-01',
    name: 'Wireshark',
    vendor: 'Wireshark Foundation',
    category: 'Network Forensics',
    description: "Analyseur de protocoles de reference pour l'inspection approfondie de paquets.",
    useCases: ['Analyse forensique PCAP', 'Troubleshooting reseau', "Detection d'exfiltration"],
    platforms: ['Windows', 'Linux', 'macOS'],
    license: 'Open Source',
    logoPath: '/assets/software/wireshark.svg',
    officialUrl: 'https://www.wireshark.org',
    repoUrl: 'https://gitlab.com/wireshark/wireshark',
    tags: ['pcap', 'traffic', 'sniffer'],
  },
  {
    id: 'soft-02',
    name: 'Splunk Enterprise Security',
    vendor: 'Splunk',
    category: 'SIEM',
    description:
      'Plateforme SIEM mature pour la collecte, la correlation et la priorisation des alertes SOC.',
    useCases: ['Detection SIEM', 'Threat hunting', 'Tableaux de bord executifs'],
    platforms: ['Web'],
    license: 'Paid',
    logoPath: '/assets/software/splunk.svg',
    officialUrl: 'https://www.splunk.com',
    tags: ['siem', 'soc', 'logs'],
  },
  {
    id: 'soft-03',
    name: 'Elastic Security',
    vendor: 'Elastic',
    category: 'SIEM',
    description:
      'Suite de detection et investigation basee sur Elasticsearch et integree aux workflows SOC.',
    useCases: ['Detection endpoint + logs', 'Timeline investigation', 'Detection rules'],
    platforms: ['Web'],
    license: 'Freemium',
    logoPath: '/assets/software/elastic.svg',
    officialUrl: 'https://www.elastic.co/security',
    repoUrl: 'https://github.com/elastic/elasticsearch',
    tags: ['siem', 'edr', 'detection'],
  },
  {
    id: 'soft-04',
    name: 'OpenSearch',
    vendor: 'OpenSearch Project',
    category: 'SIEM',
    description:
      'Moteur open source de recherche et analytics, adapte aux pipelines de logs de securite.',
    useCases: ['Indexation massive de logs', 'Detection via requetes', 'Dashboards SOC'],
    platforms: ['Linux', 'Web'],
    license: 'Open Source',
    logoPath: '/assets/software/opensearch.svg',
    officialUrl: 'https://opensearch.org',
    repoUrl: 'https://github.com/opensearch-project/OpenSearch',
    tags: ['logs', 'search', 'analytics'],
  },
  {
    id: 'soft-05',
    name: 'Graylog',
    vendor: 'Graylog',
    category: 'Log Management',
    description:
      'Plateforme centralisee de journaux pour normaliser, filtrer et investiguer rapidement.',
    useCases: ['Centralisation logs', 'Alerting', 'Investigation incident'],
    platforms: ['Linux', 'Web'],
    license: 'Freemium',
    logoPath: '/assets/software/graylog.svg',
    officialUrl: 'https://graylog.org',
    repoUrl: 'https://github.com/Graylog2/graylog2-server',
    tags: ['log-management', 'alerts', 'soc'],
  },
  {
    id: 'soft-06',
    name: 'Kibana',
    vendor: 'Elastic',
    category: 'Visualization',
    description:
      "Interface d'analyse et de visualisation pour piloter les investigations et rapports securite.",
    useCases: ['Dashboards SOC', 'Exploration de donnees', 'Reporting metrique'],
    platforms: ['Web'],
    license: 'Freemium',
    logoPath: '/assets/software/kibana.svg',
    officialUrl: 'https://www.elastic.co/kibana',
    repoUrl: 'https://github.com/elastic/kibana',
    tags: ['dashboard', 'visualization', 'elastic'],
  },
  {
    id: 'soft-07',
    name: 'Grafana',
    vendor: 'Grafana Labs',
    category: 'Monitoring',
    description:
      'Plateforme de dashboards et alerting tres utile pour la supervision securite et disponibilite.',
    useCases: ['Observabilite SOC', 'Alerting temps reel', 'SLO securite'],
    platforms: ['Web'],
    license: 'Freemium',
    logoPath: '/assets/software/grafana.svg',
    officialUrl: 'https://grafana.com',
    repoUrl: 'https://github.com/grafana/grafana',
    tags: ['monitoring', 'dashboards', 'alerts'],
  },
  {
    id: 'soft-08',
    name: 'OpenVPN',
    vendor: 'OpenVPN',
    category: 'Remote Access',
    description:
      "Solution VPN robuste pour securiser l'acces distant et segmenter les flux d'administration.",
    useCases: ['Acces distant securise', 'Bastion admin', 'Segmentation des flux'],
    platforms: ['Windows', 'Linux', 'macOS'],
    license: 'Open Source',
    logoPath: '/assets/software/openvpn.svg',
    officialUrl: 'https://openvpn.net',
    repoUrl: 'https://github.com/OpenVPN/openvpn',
    tags: ['vpn', 'remote-access', 'encryption'],
  },
  {
    id: 'soft-09',
    name: 'FortiGate',
    vendor: 'Fortinet',
    category: 'Perimeter',
    description:
      'Pare-feu nouvelle generation pour filtrage, segmentation et reduction de surface exposee.',
    useCases: ['Filtrage perimetrique', 'Segmentation reseau', 'Inspection trafic'],
    platforms: ['Web'],
    license: 'Paid',
    logoPath: '/assets/software/fortinet.svg',
    officialUrl: 'https://www.fortinet.com/products/next-generation-firewall',
    tags: ['ngfw', 'firewall', 'perimeter'],
  },
  {
    id: 'soft-10',
    name: 'Palo Alto NGFW',
    vendor: 'Palo Alto Networks',
    category: 'Perimeter',
    description: 'NGFW oriente prevention avancee, controle applicatif et politique zero trust.',
    useCases: ['Zero Trust edge', 'Filtrage applicatif', 'Prevention menaces'],
    platforms: ['Web'],
    license: 'Paid',
    logoPath: '/assets/software/paloaltonetworks.svg',
    officialUrl: 'https://www.paloaltonetworks.com/network-security',
    tags: ['ngfw', 'zero-trust', 'prevention'],
  },
  {
    id: 'soft-11',
    name: 'Okta',
    vendor: 'Okta',
    category: 'Identity',
    description:
      "Plateforme IAM pour renforcer l'authentification et piloter les politiques d'acces.",
    useCases: ['SSO', 'MFA', 'Gouvernance identite'],
    platforms: ['Web'],
    license: 'Paid',
    logoPath: '/assets/software/okta.svg',
    officialUrl: 'https://www.okta.com',
    tags: ['iam', 'sso', 'mfa'],
  },
  {
    id: 'soft-12',
    name: 'Cloudflare',
    vendor: 'Cloudflare',
    category: 'Perimeter',
    description:
      'Services edge de protection DNS/WAF/CDN utiles pour renforcer la resilience perimetrique.',
    useCases: ['Protection DDoS', 'WAF edge', 'DNS securise'],
    platforms: ['Web'],
    license: 'Freemium',
    logoPath: '/assets/software/cloudflare.svg',
    officialUrl: 'https://www.cloudflare.com',
    tags: ['waf', 'dns', 'ddos'],
  },
  {
    id: 'soft-13',
    name: 'Bitwarden',
    vendor: 'Bitwarden',
    category: 'Identity',
    description:
      'Gestionnaire de mots de passe open core pour reduire les secrets faibles ou reutilises.',
    useCases: ['Vault equipe', 'Partage securise', 'Politique mots de passe'],
    platforms: ['Windows', 'Linux', 'macOS', 'Web'],
    license: 'Freemium',
    logoPath: '/assets/software/bitwarden.svg',
    officialUrl: 'https://bitwarden.com',
    repoUrl: 'https://github.com/bitwarden/clients',
    tags: ['password-manager', 'vault', 'identity'],
  },
  {
    id: 'soft-14',
    name: 'KeePassXC',
    vendor: 'KeePassXC Team',
    category: 'Identity',
    description: 'Gestionnaire de secrets local open source, utile pour postes admin hors cloud.',
    useCases: ['Stockage local de secrets', 'Comptes privilegies', 'Mode hors ligne'],
    platforms: ['Windows', 'Linux', 'macOS'],
    license: 'Open Source',
    logoPath: '/assets/software/keepassxc.svg',
    officialUrl: 'https://keepassxc.org',
    repoUrl: 'https://github.com/keepassxreboot/keepassxc',
    tags: ['password-manager', 'offline', 'privileged-access'],
  },
];
// --- PLAYBOOKS (Procédures Opérationnelles - TOTAL 15) ---
const basePlaybooks: Playbook[] = [
  // 1. RANSOMWARE
  {
    id: 'pb-001',
    title: 'Réponse Ransomware (Défensif)',
    description: "Procédure d'urgence en cas de chiffrement actif ou demande de rançon.",
    category: 'Réponse Incident',
    severity: 'Critique',
    pages: 5,
    format: 'Web/PDF',
    estimatedTime: '4h - 48h',
    difficulty: 'Difficile',
    triggers: [
      'Fichiers avec extension anormale',
      'Note de rançon sur bureau',
      'Services critiques inaccessibles simultanément',
    ],
    prerequisites: [
      'Accès Admin Domaine (secours/break-glass)',
      'Accès Console Hyperviseur',
      'Numéro CSIRT/Assurance',
    ],
    steps: [
      {
        id: 's1',
        title: 'Isolement Réseau (Containment)',
        description:
          'Couper les ponts pour empêcher la propagation latérale. Ne pas éteindre les machines (perte RAM).',
        command: 'Disconnect-NetworkAdapter -Confirm:$false',
        warning:
          "SI chiffrement actif visible à l'écran : Hibernate/Suspendre la VM pour figer l'état.",
      },
      {
        id: 's2',
        title: 'Identification du Périmètre',
        description:
          "Lister les systèmes touchés. Vérifier l'état des sauvegardes (les déconnecter physiquement si possible).",
      },
      {
        id: 's3',
        title: 'Collecte de Preuves (Forensics Light)',
        description: 'Photographier les écrans. Dumper la RAM du Patient 0 si identifié.',
        command: '.\\winpmem.exe -o mem.raw',
      },
      {
        id: 's4',
        title: 'Communication de Crise',
        description:
          "Activer la cellule de crise. Notifier l'assureur AVANT toute action destructive.",
      },
    ],
    artifacts: [
      'Note de rançon (txt/html)',
      'Logs Firewall (Mouvements latéraux)',
      'Dump RAM Patient 0',
    ],
    messageTemplates: [
      {
        audience: 'Utilisateurs',
        subject: 'URGENT : Arrêt des systèmes informatiques',
        body: "Une anomalie majeure affecte notre réseau. Par mesure de précaution, coupez votre connexion Wi-Fi/Câble immédiatement. N'éteignez pas votre poste. Attendez les instructions.",
      },
      {
        audience: 'Management',
        subject: 'CRITIQUE : Incident Ransomware détecté',
        body: "Chiffrement détecté sur X serveurs. Plan de réponse activé. Cellule de crise convoquée salle [X] à [Heure]. Impact business en cours d'évaluation.",
      },
    ],
    definitionOfDone: [
      'Propagation stoppée',
      'Sauvegardes sécurisées',
      'Assureur notifié',
      "Vecteur d'entrée identifié (ou bloqué)",
    ],
  },

  // 2. COMPROMISSION EMAIL (BEC)
  {
    id: 'pb-002',
    title: 'Compromission Compte M365 (BEC)',
    description: "Gestion d'un compte compromis utilisé pour fraude ou exfiltration.",
    category: 'Réponse Incident',
    severity: 'Élevée',
    pages: 4,
    format: 'Web/PDF',
    estimatedTime: '2h',
    difficulty: 'Moyen',
    triggers: [
      "Alerte 'Impossible Travel'",
      'Règles de transfert suspectes',
      'Plaintes clients (Spam)',
    ],
    prerequisites: ['Accès Admin Exchange Online', 'PowerShell AzureAD'],
    steps: [
      {
        id: 's1',
        title: 'Killage de Session',
        description: 'Réinitialiser le mot de passe et révoquer les tokens.',
        command: 'Revoke-AzureADUserAllRefreshToken -ObjectId <UserGUID>',
      },
      {
        id: 's2',
        title: 'Vérification MFA & Devices',
        description:
          "Vérifier si un nouvel appareil MFA a été enrôlé par l'attaquant. Le supprimer.",
      },
      {
        id: 's3',
        title: 'Audit des Règles Inbox',
        description: "L'attaquant cache souvent ses traces via des règles 'Delete' ou 'Forward'.",
        command: 'Get-InboxRule -Mailbox <User> | Select Name, ForwardTo',
      },
    ],
    artifacts: [
      "IP de l'attaquant (Logs Sign-in)",
      'Règles malveillantes (Export)',
      'Liste mails exfiltrés',
    ],
    messageTemplates: [
      {
        audience: 'Utilisateurs',
        subject: 'Sécurité : Réinitialisation de votre compte',
        body: 'Une activité inhabituelle a été détectée. Votre compte a été verrouillé. Veuillez contacter le support pour réinitialiser vos accès.',
      },
    ],
    definitionOfDone: [
      'Compte sécurisé (MFA + Reset)',
      'Règles nettoyées',
      'Périmètre de fuite de données évalué',
    ],
  },

  // 3. MALWARE ENDPOINT
  {
    id: 'pb-003',
    title: 'Malware / C2 sur Endpoint',
    description: "Traitement d'une alerte EDR ou comportement suspect sur un poste.",
    category: 'Investigation',
    severity: 'Moyenne',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: '1h',
    difficulty: 'Moyen',
    triggers: [
      'Alerte EDR (High/Critical)',
      'Ralentissement extrême',
      'Connexions C2 (Cobalt Strike)',
    ],
    prerequisites: ['Accès Console EDR', 'Outils Sysinternals'],
    steps: [
      {
        id: 's1',
        title: 'Isolation Logique',
        description: "Isoler via l'EDR ('Network Isolation'). Si échec, débrancher câble réseau.",
      },
      {
        id: 's2',
        title: 'Collecte Triage',
        description: 'Récupérer la liste des processus et connexions actives.',
        command: 'Get-Process | Sort-Object StartTime',
      },
      {
        id: 's3',
        title: 'Remédiation',
        description: "Ne pas nettoyer. Réimager le poste (Rebuild). C'est la seule méthode sûre.",
      },
    ],
    artifacts: ['Hash du fichier malveillant', 'Domaine/IP C2', 'Nom du processus père'],
    messageTemplates: [
      {
        audience: 'IT / Ops',
        subject: 'Incident : Poste [Hostname] isolé',
        body: 'Le poste a été isolé suite à une détection malware. Ne pas reconnecter au réseau. Récupération pour analyse en cours.',
      },
    ],
    definitionOfDone: ['Poste isolé', 'IOCs extraits', 'Poste réimaginé'],
  },

  // 4. PHISHING ANALYSIS
  {
    id: 'pb-004',
    title: 'Triage & Analyse Phishing',
    description: 'Qualifier et neutraliser une campagne de phishing signalée.',
    category: 'Investigation',
    severity: 'Faible',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: '30 min',
    difficulty: 'Facile',
    triggers: ['Signalement utilisateur', "Bouton 'Report Phishing'"],
    prerequisites: ['Sandbox (UrlScan/VT)', 'Accès Logs Mail'],
    steps: [
      {
        id: 's1',
        title: 'Analyse Header & Liens',
        description:
          "Vérifier SPF/DKIM. Analyser l'URL dans une sandbox (ne jamais cliquer depuis son poste).",
        warning: "Attention aux liens qui identifient l'utilisateur (id=...).",
      },
      {
        id: 's2',
        title: 'Search & Purge',
        description: 'Chercher le mail dans toutes les autres boîtes et le supprimer.',
        command: 'Get-MessageTrace -SenderAddress <bad@evil.com>',
      },
      {
        id: 's3',
        title: 'Blocage',
        description: "Bloquer l'émetteur et le domaine URL sur la passerelle web.",
      },
    ],
    artifacts: ['En-têtes complets', 'URL malveillante', 'Capture écran Sandbox'],
    messageTemplates: [],
    definitionOfDone: ['Campagne identifiée', 'Mails purgés', 'Domaine bloqué'],
  },

  // 5. DATA LEAK (DLP)
  {
    id: 'pb-005',
    title: 'Suspicion Exfiltration (DLP)',
    description: 'Réaction suite à un upload massif ou envoi de données sensibles.',
    category: 'Réponse Incident',
    severity: 'Élevée',
    pages: 4,
    format: 'Web/PDF',
    estimatedTime: '4h',
    difficulty: 'Difficile',
    triggers: ['Alerte DLP (Volume)', 'Upload vers Mega/Dropbox', 'Copie USB massive'],
    prerequisites: ['Logs Proxy/Firewall', 'Logs Audit Fichiers'],
    steps: [
      {
        id: 's1',
        title: 'Qualification de la Donnée',
        description: 'Est-ce des PII (RGPD) ? De la propriété intellectuelle ? Du secret défense ?',
      },
      {
        id: 's2',
        title: 'Blocage Vecteur',
        description: "Couper l'accès internet du poste source ou bloquer le compte utilisateur.",
      },
      {
        id: 's3',
        title: 'Préservation Légale',
        description: "Ne pas contacter l'employé sans avis RH/Juridique. Sauvegarder les logs.",
      },
    ],
    artifacts: ['Liste fichiers exfiltrés', 'Volume total', 'Heure début/fin'],
    messageTemplates: [
      {
        audience: 'Management',
        subject: 'Confidentiel : Suspicion fuite de données',
        body: "Détection d'un transfert de X Go vers [Service] depuis le poste de [User]. Investigation en cours. Confidentialité requise.",
      },
    ],
    definitionOfDone: ['Exfiltration stoppée', 'Nature des données qualifiée', 'Juridique notifié'],
  },

  // 6. AD COMPROMISE
  {
    id: 'pb-006',
    title: 'Compromission Contrôleur de Domaine',
    description: "Procédure critique : perte de confiance dans l'Active Directory.",
    category: 'Réponse Incident',
    severity: 'Critique',
    pages: 6,
    format: 'Web/PDF',
    estimatedTime: '2-5 jours',
    difficulty: 'Expert',
    triggers: ['Golden Ticket détecté', 'Nouveau Domain Admin inconnu', 'DCSync détecté'],
    prerequisites: ['Compte Break Glass', 'Expertise AD'],
    steps: [
      {
        id: 's1',
        title: 'Isolation Totale',
        description: 'Couper les communications Internet des DC. Le domaine est mort.',
      },
      {
        id: 's2',
        title: 'Double Reset KRBTGT',
        description:
          'Invalider tous les tickets Kerberos (Golden Tickets) en changeant le mot de passe KRBTGT deux fois.',
        command: 'Reset-ComputerMachinePassword',
      },
      {
        id: 's3',
        title: 'Plan de Reconstruction',
        description: "Préparer une nouvelle forêt. Nettoyer un AD compromis 'Root' est risqué.",
      },
    ],
    artifacts: ['NTDS.dit exfiltré ?', 'Logs Security DC', 'Prefetch files'],
    definitionOfDone: ['KRBTGT réinitialisé 2x', 'Admins audités', 'Plan de reconstruction validé'],
  },

  // 7. CRITICAL VULN
  {
    id: 'pb-007',
    title: "Patching d'Urgence (0-Day)",
    description: 'Gérer une vulnérabilité critique publique (ex: Log4J, Exchange).',
    category: 'Hardening',
    severity: 'Élevée',
    pages: 2,
    format: 'Web/PDF',
    estimatedTime: '24h',
    difficulty: 'Moyen',
    triggers: [
      'Bulletin CERT-FR',
      'Scan vulnérabilité critique',
      'Preuve de concept (PoC) publique',
    ],
    prerequisites: ['Scanner Vuln', 'CMDB'],
    steps: [
      {
        id: 's1',
        title: 'Identification Surface',
        description: 'Lister les actifs exposés Internet concernés. Priorité absolue.',
      },
      {
        id: 's2',
        title: 'Workaround',
        description: "Appliquer les contournements (WAF, Regle FW) si le patch n'est pas prêt.",
      },
      {
        id: 's3',
        title: 'Patch & Verify',
        description: 'Patcher et RE-SCANNER pour confirmer.',
      },
    ],
    artifacts: ['Rapport de scan avant/après'],
    messageTemplates: [],
    definitionOfDone: ['Actifs exposés patchés', 'Scan de vérification OK'],
  },

  // 8. ACCESS REVIEW
  {
    id: 'pb-008',
    title: 'Revue des Comptes à Privilèges',
    description: 'Procédure récurrente de nettoyage des accès admins.',
    category: 'Gouvernance',
    severity: 'Faible',
    pages: 2,
    format: 'Web/PDF',
    estimatedTime: '4h',
    difficulty: 'Facile',
    triggers: ['Trimestriel', 'Audit'],
    prerequisites: ['Liste utilisateurs AD'],
    steps: [
      {
        id: 's1',
        title: 'Export & Analyse',
        description: "Lister membres 'Domain Admins', 'Enterprise Admins'.",
      },
      {
        id: 's2',
        title: 'Justification',
        description: 'Tout compte non justifié ou générique doit être désactivé.',
      },
    ],
    artifacts: ['Fichier Excel revue signé'],
    definitionOfDone: ['Liste admins validée', 'Comptes inutiles supprimés'],
  },

  // 9. SECRETS ROTATION (NEW)
  {
    id: 'pb-009',
    title: 'Rotation Secrets & API Keys',
    description:
      "Réaction suite à la découverte d'une clé API ou mot de passe dans du code (Github).",
    category: 'Réponse Incident',
    severity: 'Élevée',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: '2h',
    difficulty: 'Moyen',
    triggers: ['Alerte GitGuardian', 'Clé AWS committée', 'Mot de passe en clair dans script'],
    prerequisites: ['Accès Provider (AWS/Azure)', 'Accès Repo Code'],
    steps: [
      {
        id: 's1',
        title: 'Révocation Immédiate',
        description: 'Invalider la clé compromise dans la console du fournisseur. Ne pas attendre.',
      },
      {
        id: 's2',
        title: "Audit d'Usage",
        description:
          'Vérifier les logs : la clé a-t-elle été utilisée par une IP inconnue entre le commit et la révocation ?',
      },
      {
        id: 's3',
        title: 'Rotation & Nettoyage',
        description:
          "Générer nouvelle clé. Réécrire l'historique Git (BFG Repo-Cleaner) pour supprimer la trace.",
      },
    ],
    artifacts: ["Logs d'utilisation de la clé", 'Commit ID compromis'],
    definitionOfDone: [
      'Clé révoquée',
      "Absence d'activité suspecte confirmée",
      'Historique Git nettoyé',
    ],
  },

  // 10. SUSPICION EXFILTRATION (NEW)
  {
    id: 'pb-010',
    title: 'Checklist Suspicion Fuite',
    description: "Liste de vérification rapide lors d'un doute sur une fuite de données.",
    category: 'Investigation',
    severity: 'Moyenne',
    pages: 2,
    format: 'Web/PDF',
    estimatedTime: '1h',
    difficulty: 'Facile',
    triggers: ['Rumeur', "Lanceur d'alerte", 'Données trouvées sur le dark web'],
    prerequisites: ['Accès Logs', 'Outil OSINT'],
    steps: [
      {
        id: 's1',
        title: 'Vérification Échantillon',
        description: "Les données 'fruitées' sont-elles réelles ? Obtenir un échantillon.",
      },
      {
        id: 's2',
        title: 'Recherche Interne',
        description:
          "Chercher le nom des fichiers de l'échantillon dans les logs d'accès fichiers.",
      },
    ],
    artifacts: ['Échantillon de données'],
    definitionOfDone: ['Fuite confirmée ou infirmée', 'Vecteur identifié si avéré'],
  },

  // 11. BACKUP RESTORATION TEST (NEW)
  {
    id: 'pb-011',
    title: 'Test de Restauration Sauvegardes',
    description: 'Procédure pour valider que les backups sont utilisables (à faire mensuellement).',
    category: 'Gouvernance',
    severity: 'Faible',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: '4h',
    difficulty: 'Moyen',
    triggers: ['Mensuel', 'Changement infrastructure'],
    prerequisites: ['Accès Console Backup', 'Environnement de test isolé'],
    steps: [
      {
        id: 's1',
        title: 'Sélection Aléatoire',
        description: 'Choisir 1 VM critique + 5 fichiers utilisateurs au hasard.',
      },
      {
        id: 's2',
        title: 'Restauration',
        description: 'Restaurer dans un VLAN isolé (Sandbox). Ne pas écraser la prod.',
      },
      {
        id: 's3',
        title: 'Validation Intégrité',
        description: "La VM boot-elle ? Les fichiers s'ouvrent-ils ?",
      },
    ],
    artifacts: ['Rapport de test'],
    definitionOfDone: ['VM démarrée', 'Rapport RTO (Temps réel constaté)'],
  },

  // 12. VENDOR INCIDENT (NEW)
  {
    id: 'pb-012',
    title: 'Incident chez un Fournisseur',
    description: 'Que faire quand un sous-traitant critique se fait pirater.',
    category: 'Gouvernance',
    severity: 'Élevée',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: '2h',
    difficulty: 'Moyen',
    triggers: ['Notification fournisseur', 'Presse'],
    prerequisites: ['Liste contrats', 'Matrice des flux'],
    steps: [
      {
        id: 's1',
        title: 'Couper les Ponts',
        description: 'Désactiver les comptes du fournisseur. Couper les VPNs Site-à-Site.',
      },
      {
        id: 's2',
        title: 'Audit Rétrospectif',
        description:
          "Vérifier si l'attaquant a pivoté depuis le fournisseur vers nous via les accès partagés.",
      },
    ],
    artifacts: ['Logs connexions fournisseur'],
    messageTemplates: [
      {
        audience: 'Fournisseur',
        subject: 'Suspension des accès suite à incident',
        body: "Suite à votre notification d'incident, nous avons suspendu préventivement vos accès. Merci de nous fournir un rapport d'investigation avant réouverture.",
      },
    ],
    definitionOfDone: ['Accès coupés', 'Absence de pivot confirmée'],
  },

  // 13. LOST LAPTOP (NEW)
  {
    id: 'pb-013',
    title: 'Perte / Vol Laptop',
    description: "Procédure standard pour limiter l'impact de la perte d'un terminal.",
    category: 'Réponse Incident',
    severity: 'Moyenne',
    pages: 2,
    format: 'Web/PDF',
    estimatedTime: '30 min',
    difficulty: 'Facile',
    triggers: ['Déclaration utilisateur'],
    prerequisites: ['MDM (Intune)', 'Bitlocker'],
    steps: [
      {
        id: 's1',
        title: 'Remote Wipe',
        description: "Lancer l'effacement à distance via le MDM.",
      },
      {
        id: 's2',
        title: 'Reset User Password',
        description: "Changer le mot de passe AD/M365 de l'utilisateur.",
      },
      {
        id: 's3',
        title: 'Vérification Chiffrement',
        description: "Confirmer dans l'inventaire que le disque était chiffré (Bitlocker).",
      },
    ],
    artifacts: ['Preuve commande Wipe', 'État conformité Bitlocker'],
    definitionOfDone: ['Wipe lancé', 'Accès révoqués', 'Risque données évalué'],
  },

  // 14. MFA ROLLOUT (NEW)
  {
    id: 'pb-014',
    title: 'Déploiement MFA (Plan 7J)',
    description: 'Checklist pour déployer le MFA sans bloquer la production.',
    category: 'Hardening',
    severity: 'Moyenne',
    pages: 4,
    format: 'Web/PDF',
    estimatedTime: '1 semaine',
    difficulty: 'Moyen',
    triggers: ['Projet Sécurité'],
    prerequisites: ['Licences P1/P2', 'Campagne comm'],
    steps: [
      {
        id: 's1',
        title: 'J-7 : Communication',
        description: 'Prévenir les utilisateurs. Fournir des guides PDF.',
      },
      {
        id: 's2',
        title: "J-0 : Activation 'Soft'",
        description: "Activer en mode 'Enregistrement obligatoire' mais sans bloquer l'accès.",
      },
      {
        id: 's3',
        title: 'J+7 : Enforcement',
        description: 'Activer le blocage si pas de MFA.',
      },
    ],
    artifacts: ['Statistiques enrôlement'],
    definitionOfDone: ['100% utilisateurs enrôlés', 'Legacy Auth bloqué'],
  },

  // 15. NIS2 PREP (NEW)
  {
    id: 'pb-015',
    title: 'Préparation NIS2 (Checklist)',
    description: 'Les premières étapes pour initier la conformité NIS2.',
    category: 'Gouvernance',
    severity: 'Moyenne',
    pages: 3,
    format: 'Web/PDF',
    estimatedTime: 'Continu',
    difficulty: 'Stratégique',
    triggers: ['Stratégie', 'Audit'],
    prerequisites: ['Direction impliquée'],
    steps: [
      {
        id: 's1',
        title: 'Inventaire Actifs',
        description: 'Lister les systèmes essentiels (OES).',
      },
      {
        id: 's2',
        title: 'Notification Incident',
        description: 'Mettre en place la procédure de signalement ANSSI (<24h).',
      },
      {
        id: 's3',
        title: 'Hygiène de base',
        description: 'MFA partout, Sauvegardes offline, Patching.',
      },
    ],
    artifacts: ['Registre des actifs', 'Procédure notification'],
    definitionOfDone: ['Périmètre défini', 'Processus incident écrit'],
  },
];

const playbookOperationalBriefs: Record<string, NonNullable<Playbook['operationalBrief']>> = {
  'pb-001': {
    context:
      'Suspicion de chiffrement en cours ou revendication de rançon avec indisponibilité simultanée de plusieurs services critiques.',
    objective:
      "Stopper la propagation, préserver les preuves et rétablir les services prioritaires selon l'ordre d'impact métier.",
    businessRisk:
      "Arrêt d'activité, indisponibilité clients, perte de données opérationnelles, exposition réglementaire et réputationnelle.",
    keyChecks: [
      'Le chiffrement est-il actif en temps réel sur les partages réseau ?',
      'Les sauvegardes immuables/offline sont-elles intactes et datées ?',
      'Des comptes à privilèges sont-ils utilisés de manière anormale ?',
    ],
    escalationSignals: [
      'Propagation sur plusieurs segments en moins de 30 minutes.',
      'Sauvegardes de production également chiffrées ou indisponibles.',
      'Système critique métier indisponible au-delà du RTO défini.',
    ],
    handoffTo: [
      'Cellule de crise',
      'DSI/Infra',
      'Juridique & DPO',
      'Assureur cyber',
      'Prestataire DFIR',
    ],
  },
  'pb-002': {
    context:
      "Compte Microsoft 365 suspecté compromis (fraude financière, exfiltration mail, abus d'identité interne/externe).",
    objective:
      "Retirer immédiatement l'accès attaquant, limiter l'impact de la fraude et documenter la portée des messages/actions malveillants.",
    businessRisk:
      'Fraude au virement, perte de confiance client, fuite de données mail et rebond vers d’autres comptes internes.',
    keyChecks: [
      'Présence de connexions impossibles (Impossible Travel / IP à risque).',
      'Règles de forwarding/suppression créées récemment.',
      'Nouveaux facteurs MFA ou appareils non reconnus.',
    ],
    escalationSignals: [
      'Tentative de fraude financière validée par un tiers.',
      'Compromission d’un compte à privilèges ou VIP.',
      'Propagation vers d’autres boîtes via campagnes internes.',
    ],
    handoffTo: ['Equipe IAM', 'Equipe Messagerie', 'Finance/Comptabilité', 'SOC Niveau 2'],
  },
  'pb-003': {
    context:
      'Détection EDR d’un comportement malware/C2 sur endpoint avec risque de persistance ou de mouvement latéral.',
    objective:
      'Isoler rapidement l’hôte, confirmer le scénario d’attaque et décider remédiation (rebuild) sans dégrader la chaîne de preuve.',
    businessRisk:
      'Compromission de poste utilisateur, vol de credentials, pivot interne vers serveurs et interruption locale de production.',
    keyChecks: [
      'Processus parent/enfant atypiques (LOLBins, PowerShell encodé).',
      'Connexions réseau sortantes vers IOC connus/C2.',
      'Création de tâche planifiée, service ou persistence registry.',
    ],
    escalationSignals: [
      'Même IOC détecté sur plusieurs hôtes.',
      'Présence de credential dumping ou LSASS access.',
      'Endpoint lié à un compte admin ou serveur sensible.',
    ],
    handoffTo: ['SOC Hunt', 'Equipe Poste de travail', 'DFIR'],
  },
  'pb-004': {
    context:
      'Signalement de phishing utilisateur ou alerte passerelle mail nécessitant qualification rapide et purge globale.',
    objective:
      'Qualifier la menace, neutraliser la campagne, bloquer les indicateurs et réduire le risque de clic secondaire.',
    businessRisk:
      'Vol d’identifiants, compromission de comptes, exécution de malware via pièces jointes et dégradation de la confiance interne.',
    keyChecks: [
      'Authenticité de l’expéditeur (SPF, DKIM, DMARC).',
      'URL redirection/obfuscation et domaine ressemblant.',
      'Nombre de boîtes touchées et taux de clic potentiel.',
    ],
    escalationSignals: [
      'Phishing ciblant finance, direction ou admins.',
      'Preuve de saisie d’identifiants sur page clonée.',
      'Pièce jointe active (macro/script) ouverte en interne.',
    ],
    handoffTo: ['SOC Mail', 'Equipe Sensibilisation', 'IT Support'],
  },
  'pb-005': {
    context:
      'Alerte DLP ou observation d’un transfert massif de données hors périmètre autorisé (cloud personnel, USB, messagerie).',
    objective:
      'Confirmer la nature des données, interrompre le vecteur de fuite et préserver les preuves pour volet légal/RH.',
    businessRisk:
      'Perte de propriété intellectuelle, fuite de données personnelles, sanction réglementaire et litiges contractuels.',
    keyChecks: [
      'Classification des données exfiltrées (PII, secret industriel, contrats).',
      'Canal exact de sortie (web, mail, USB, sync cloud).',
      'Volumétrie et fenêtre temporelle du transfert.',
    ],
    escalationSignals: [
      'Données sensibles confirmées sur source externe.',
      'Utilisateur à privilèges ou accès critique impliqué.',
      'Indicateurs de préméditation (compression/chiffrement préalable).',
    ],
    handoffTo: ['SOC', 'Juridique', 'RH', 'DPO'],
  },
  'pb-006': {
    context:
      'Perte de confiance Active Directory (Golden Ticket, DCSync, abus Domain Admin) avec risque structurel sur tout le SI.',
    objective:
      'Contenir le domaine, invalider les tickets persistants et enclencher un plan de rétablissement AD sûr et piloté.',
    businessRisk:
      'Compromission durable de l’identité, accès total aux actifs, impossibilité de confiance sur les authentifications.',
    keyChecks: [
      'Présence d’événements DCSync, création admin suspecte, délégations anormales.',
      'Intégrité des DC, GPO et comptes de service critiques.',
      'Etat des sauvegardes AD et capacité de restauration isolée.',
    ],
    escalationSignals: [
      'Compromission de plusieurs DC ou tier-0 élargi.',
      'KRBTGT non contrôlé et authentifications anormales persistantes.',
      'Impact sur applications cœur métier dépendantes AD.',
    ],
    handoffTo: ['Equipe AD Tier-0', 'SOC senior', 'DSI', 'Prestataire IR spécialisé AD'],
  },
  'pb-007': {
    context:
      'Publication d’une vulnérabilité critique exploitable (0-day ou n-day critique) affectant des actifs exposés.',
    objective:
      'Identifier rapidement la surface exposée, appliquer mesures compensatoires, patcher puis vérifier la remédiation.',
    businessRisk:
      'Compromission distante de services exposés, indisponibilité applicative et compromission latérale depuis l’edge.',
    keyChecks: [
      'Inventaire des versions vulnérables réellement en production.',
      'Présence d’assets exposés Internet et non protégés.',
      'Indicateurs d’exploitation dans logs WAF/Proxy/EDR.',
    ],
    escalationSignals: [
      'PoC weaponized observée dans la nature.',
      'Actif critique non patchable dans la fenêtre cible.',
      'Détection de tentative d’exploitation interne/externe.',
    ],
    handoffTo: ['Equipe Vuln Management', 'Ops applicatifs', 'SOC Monitoring'],
  },
  'pb-008': {
    context:
      'Revue périodique des privilèges pour réduire la surface d’attaque identitaire et préparer audits internes/externe.',
    objective:
      'Nettoyer les comptes à privilèges non justifiés et rétablir le principe du moindre privilège.',
    businessRisk:
      'Accumulation de privilèges dormants, comptes orphelins exploitables et élévation de privilèges facilitée.',
    keyChecks: [
      'Comptes admin sans propriétaire métier identifié.',
      'Comptes génériques partagés sans journalisation nominative.',
      'Anomalies de dernière connexion ou inactivité prolongée.',
    ],
    escalationSignals: [
      'Comptes tier-0 non conformes non supprimables immédiatement.',
      'Refus métier de retirer un privilège sans justification formelle.',
      'Découverte de comptes admin oubliés après départ collaborateur.',
    ],
    handoffTo: ['IAM', 'Responsables applicatifs', 'Audit interne'],
  },
  'pb-009': {
    context:
      'Secret exposé dans un dépôt code ou un canal public (API key, token, mot de passe), potentiellement déjà collecté.',
    objective:
      'Révoquer immédiatement le secret, vérifier les usages suspects puis réémettre proprement avec rotation complète.',
    businessRisk:
      'Usage frauduleux des APIs, fuite de données cloud, coûts imprévus et compromission de chaîne CI/CD.',
    keyChecks: [
      'Type de secret, portée des permissions et environnement concerné.',
      'Fenêtre d’exposition entre commit/publication et révocation.',
      'Logs d’usage avec IP, user-agent et actions administratives.',
    ],
    escalationSignals: [
      'Actions critiques exécutées avec le secret compromis.',
      'Exposition de secrets de production non segmentés.',
      'Fuite répétée sur plusieurs repositories.',
    ],
    handoffTo: ['DevSecOps', 'Cloud Platform Team', 'SOC'],
  },
  'pb-010': {
    context:
      'Suspicion de fuite de données sans preuve solide, nécessitant une qualification rapide et structurée avant annonce.',
    objective:
      'Confirmer ou infirmer la fuite sur éléments vérifiables et cadrer immédiatement le périmètre d’investigation.',
    businessRisk:
      'Mauvaise décision de communication, sous-estimation d’un incident réel, perte de temps SOC sur hypothèses non fondées.',
    keyChecks: [
      'Validité et fraîcheur de l’échantillon exposé.',
      'Correspondance interne des identifiants/fichiers publiés.',
      'Existence de traces d’accès/export cohérentes.',
    ],
    escalationSignals: [
      'Échantillon contient des données sensibles récentes et exactes.',
      'Preuve de publication sur place de marché cyber.',
      'Fuite liée à un système réglementé ou critique.',
    ],
    handoffTo: ['SOC', 'Juridique', 'Communication de crise'],
  },
  'pb-011': {
    context:
      'Exercice périodique pour prouver que les sauvegardes sont restaurables dans le délai attendu (RTO/RPO).',
    objective:
      'Valider techniquement la restauration et produire une preuve mesurable de résilience opérationnelle.',
    businessRisk:
      'Faux sentiment de sécurité, restauration impossible en crise réelle et non-conformité sur plans de continuité.',
    keyChecks: [
      'Echantillon représentatif (VM critique + données métiers).',
      'Mesure réelle des temps de restauration vs objectifs.',
      'Intégrité fonctionnelle après restauration.',
    ],
    escalationSignals: [
      'RTO dépassé sur service critique.',
      'Backup corrompu ou incomplet sur plusieurs points.',
      'Dépendances applicatives non restaurables en chaîne.',
    ],
    handoffTo: ['Backup Team', 'Ops applicatifs', 'Gestion des risques'],
  },
  'pb-012': {
    context:
      'Incident déclaré chez un fournisseur connecté au SI interne (VPN, comptes fédérés, échanges de données).',
    objective:
      'Réduire immédiatement le risque de rebond, vérifier les traces de pivot et conditionner la reprise des accès.',
    businessRisk:
      'Compromission indirecte via tiers, interruption de la supply chain et responsabilité contractuelle.',
    keyChecks: [
      'Inventaire précis des accès tiers actifs (VPN, API, comptes).',
      'Historique des connexions fournisseur avant/après incident.',
      'Flux applicatifs critiques dépendants du fournisseur.',
    ],
    escalationSignals: [
      'Preuve d’abus d’accès tiers vers actifs internes.',
      'Fournisseur incapable de fournir plan de remédiation crédible.',
      'Impact simultané chez plusieurs sous-traitants liés.',
    ],
    handoffTo: ['Third-Party Risk', 'SOC', 'Juridique Achats', 'RSSI'],
  },
  'pb-013': {
    context:
      "Perte ou vol d'un poste portable avec potentiel accès aux données locales, sessions actives et secrets navigateur.",
    objective:
      'Révoquer rapidement les accès, déclencher le wipe à distance et confirmer le niveau de protection du terminal.',
    businessRisk:
      'Accès non autorisé aux applications SaaS, exposition de données locales et fraude via session persistante.',
    keyChecks: [
      'Etat chiffrement disque et conformité MDM du terminal.',
      'Comptes actifs et sessions ouvertes associées à l’utilisateur.',
      'Dernière géolocalisation / dernière remontée du device.',
    ],
    escalationSignals: [
      'Terminal non chiffré ou hors politique MDM.',
      'Compte privilégié utilisé sur l’équipement perdu.',
      'Signalement de tentative de connexion post-perte.',
    ],
    handoffTo: ['IT Support', 'IAM', 'SOC', 'RH si contexte sensible'],
  },
  'pb-014': {
    context:
      'Programme de déploiement MFA progressif pour réduire le risque de compromission compte sans bloquer la production.',
    objective:
      'Augmenter le taux d’enrôlement de manière contrôlée, traiter exceptions et activer enforcement sans rupture métier.',
    businessRisk:
      'Blocage utilisateurs en masse, dette d’exceptions, contournements faibles et adoption incomplète.',
    keyChecks: [
      'Population cible priorisée (admins, VIP, métiers exposés).',
      'Canaux MFA autorisés et niveau de sécurité des facteurs.',
      'Tableau de bord d’enrôlement et tickets de blocage.',
    ],
    escalationSignals: [
      'Taux d’enrôlement insuffisant avant date d’enforcement.',
      'Augmentation des incidents de connexion non traités.',
      'Maintien d’authentification legacy sur périmètre critique.',
    ],
    handoffTo: ['IAM', 'Service Desk', 'Communication interne'],
  },
  'pb-015': {
    context:
      'Démarrage de conformité NIS2 pour structurer gouvernance, gestion des risques et dispositif de réponse incident.',
    objective:
      'Poser un socle exécutable en 90 jours: périmètre OES, rôles, mesures minimales et preuves de pilotage.',
    businessRisk:
      'Non-conformité, décisions sécurité non traçables, faiblesse du dispositif incident et exposition aux sanctions.',
    keyChecks: [
      'Inventaire des actifs essentiels et dépendances tierces.',
      'Existence d’une procédure de notification incident opérationnelle.',
      'Suivi des mesures minimales (MFA, patching, sauvegardes testées).',
    ],
    escalationSignals: [
      'Absence de sponsor direction ou de gouvernance formalisée.',
      'Ecarts critiques non traités sur actifs essentiels.',
      'Incapacité à démontrer les décisions et preuves d’exécution.',
    ],
    handoffTo: ['RSSI', 'Direction générale', 'Juristes conformité', 'Responsables métiers'],
  },
};

export const playbooks: Playbook[] = basePlaybooks.map((playbook) => ({
  ...playbook,
  operationalBrief: playbookOperationalBriefs[playbook.id] ?? playbook.operationalBrief,
}));

const templateReferenceBase: NonNullable<CyberTemplate['references']> = [
  {
    name: 'NIST SP 800-61 (Computer Security Incident Handling Guide)',
    note: 'Cadre de gestion d incident',
  },
  { name: 'NIST CSF', note: 'Gouvernance et pilotage des fonctions cyber' },
  { name: 'ISO/IEC 27001 (contrôles)', note: 'Mesures organisationnelles et techniques' },
  { name: 'ANSSI (guides hygiène / IR)', note: 'Bonnes pratiques opérationnelles' },
  { name: 'CIS Controls', note: 'Priorisation des contrôles défensifs' },
];

export const templates: CyberTemplate[] = [
  {
    id: 'tpl-001',
    title: 'Déclaration d’incident (message interne - déclenchement cellule)',
    description:
      "Message de déclenchement pour ouvrir officiellement une cellule d'incident et synchroniser les équipes.",
    category: 'Incident Response',
    priority: 'Critique',
    audiences: ['IT / Ops', 'SOC / CERT', 'Management'],
    tags: ['incident', 'cellule de crise', 'communication interne', 'soc'],
    variables: [
      { key: 'company_name', label: "Nom de l'entreprise", example: 'ACME SA', required: true },
      { key: 'incident_type', label: "Type d'incident", example: 'Ransomware', required: true },
      {
        key: 'detected_at',
        label: 'Date/heure de détection',
        example: '2026-02-07 09:12 CET',
        required: true,
      },
      { key: 'severity', label: 'Sévérité', example: 'Critique', required: true },
      {
        key: 'impacted_services',
        label: 'Services impactés',
        example: 'ERP, messagerie, VPN',
        required: true,
      },
      {
        key: 'bridge_link',
        label: 'Lien bridge de crise',
        example: 'https://meet.exemple.com/incident-bridge',
        required: true,
        type: 'url',
      },
      { key: 'incident_manager', label: 'Incident Manager', example: 'M. Dupont', required: true },
      {
        key: 'next_update_at',
        label: 'Prochaine mise à jour',
        example: '2026-02-07 10:00 CET',
        required: true,
      },
    ],
    content: `# Déclaration d’incident — {{incident_type}}
**Organisation :** {{company_name}}  
**Date/heure de détection :** {{detected_at}}  
**Sévérité :** {{severity}}  
**Services impactés :** {{impacted_services}}

## Résumé
Un incident de sécurité de type **{{incident_type}}** est en cours d’investigation.  
Mesures immédiates en cours : confinement, collecte des preuves, stabilisation des services critiques.

## Actions requises (immédiat)
- Rejoindre le bridge : {{bridge_link}}
- Ne pas supprimer de fichiers/logs ni redémarrer les systèmes sans validation IR
- Centraliser toute information (captures, logs, IOC) auprès de l’Incident Manager

## Rôles
- **Incident Manager :** {{incident_manager}}
- **Prochaine mise à jour :** {{next_update_at}}

## Consignes
- Toute communication externe est gelée jusqu’à validation (Juridique/Comms).
- Priorité : sécurité des preuves + continuité d’activité.`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ["Usage interne. Adapter aux procédures de gestion de crise de l'organisation."],
  },
  {
    id: 'tpl-002',
    title: 'SITREP (rapport de situation) — Direction / COMEX',
    description: 'Modèle de point de situation décisionnel pour management et direction de crise.',
    category: 'Communication',
    priority: 'Élevée',
    audiences: ['Management', 'Juridique'],
    tags: ['sitrep', 'comex', 'management', 'pilotage de crise'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'incident_id',
        label: 'Identifiant incident',
        example: 'IR-2026-014',
        required: true,
      },
      {
        key: 'incident_type',
        label: "Type d'incident",
        example: 'Compromission M365',
        required: true,
      },
      {
        key: 'status',
        label: 'Statut',
        example: 'Confiné, investigation en cours',
        required: true,
      },
      {
        key: 'timeline',
        label: 'Chronologie',
        example: '- 09:12 détection\n- 09:30 confinement',
        required: true,
        type: 'textarea',
      },
      {
        key: 'scope',
        label: 'Périmètre',
        example: '18 boîtes mail, 2 applications internes',
        required: true,
        type: 'textarea',
      },
      {
        key: 'business_impact',
        label: 'Impact business',
        example: 'Risque de fraude et perturbation support client',
        required: true,
        type: 'textarea',
      },
      {
        key: 'actions_done',
        label: 'Actions réalisées',
        example: 'Reset MFA, révocation sessions, blocage IOC',
        required: true,
        type: 'textarea',
      },
      {
        key: 'risks',
        label: 'Risques et hypothèses',
        example: 'Exfiltration potentielle à confirmer',
        required: true,
        type: 'textarea',
      },
      {
        key: 'decisions_needed',
        label: 'Décisions attendues',
        example: 'Validation communication client à H+4',
        required: true,
        type: 'textarea',
      },
      {
        key: 'next_update_at',
        label: 'Prochaine mise à jour',
        example: '2026-02-07 12:00 CET',
        required: true,
      },
    ],
    content: `# SITREP — {{company_name}} — {{incident_id}}
**Type :** {{incident_type}}  
**Statut :** {{status}}  
**Prochaine mise à jour :** {{next_update_at}}

## 1) Chronologie (facts)
{{timeline}}

## 2) Périmètre / exposition
{{scope}}

## 3) Impact business (actuel)
{{business_impact}}

## 4) Actions réalisées
{{actions_done}}

## 5) Risques & hypothèses (à confirmer)
{{risks}}

## 6) Décisions attendues
{{decisions_needed}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Document décisionnel. Ne pas diffuser hors cercle de gestion de crise.'],
  },
  {
    id: 'tpl-003',
    title: 'Message utilisateurs — consignes immédiates (phishing / compromission email)',
    description:
      'Template court pour diffuser des consignes immédiates aux utilisateurs lors d’un risque email.',
    category: 'Communication',
    priority: 'Moyenne',
    audiences: ['Utilisateurs'],
    tags: ['sensibilisation', 'phishing', 'communication interne'],
    variables: [
      { key: 'company_name', label: "Nom de l'entreprise", example: 'ACME SA', required: true },
      {
        key: 'incident_type',
        label: "Type d'incident",
        example: 'Campagne de phishing',
        required: true,
      },
      {
        key: 'do_list',
        label: 'À faire',
        example: '- Signaler via bouton Report Phishing\n- Changer le mot de passe',
        required: true,
        type: 'textarea',
      },
      {
        key: 'dont_list',
        label: 'À ne pas faire',
        example: '- Ne pas cliquer sur les liens du message suspect',
        required: true,
        type: 'textarea',
      },
      {
        key: 'support_contact',
        label: 'Contact support',
        example: 'soc@acme.fr / x1234',
        required: true,
      },
    ],
    content: `# Information sécurité — {{company_name}}
Nous avons identifié un risque lié à **{{incident_type}}**.

## À faire immédiatement
{{do_list}}

## À ne pas faire
{{dont_list}}

## Besoin d’aide ?
Contact : **{{support_contact}}**`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Message à envoyer via canal officiel (mail interne / Teams / intranet).'],
  },
  {
    id: 'tpl-004',
    title: 'Notification client — incident de sécurité (sans confirmation de fuite)',
    description:
      'Message client initial pour informer sans sur-spéculer pendant la phase d’investigation.',
    category: 'Communication',
    priority: 'Élevée',
    audiences: ['Clients', 'Externe'],
    tags: ['notification client', 'communication externe', 'incident'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'incident_type',
        label: "Type d'incident",
        example: 'Indisponibilité partielle SI',
        required: true,
      },
      {
        key: 'detected_at',
        label: 'Date de détection',
        example: '2026-02-07',
        required: true,
        type: 'date',
      },
      {
        key: 'customer_impact',
        label: 'Impact client',
        example: 'Aucune preuve de fuite confirmée à ce stade',
        required: true,
        type: 'textarea',
      },
      {
        key: 'actions_taken',
        label: 'Actions engagées',
        example: 'Confinement, investigation DFIR, surveillance renforcée',
        required: true,
        type: 'textarea',
      },
      {
        key: 'customer_actions',
        label: 'Actions recommandées',
        example: 'Vigilance phishing et rotation mot de passe par précaution',
        required: true,
        type: 'textarea',
      },
      {
        key: 'contact_point',
        label: 'Point de contact',
        example: 'security@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Information importante — incident de sécurité
Bonjour,  
{{company_name}} a détecté le {{detected_at}} un incident de sécurité de type **{{incident_type}}**.

## Ce que nous savons à ce stade
{{customer_impact}}

## Ce que nous faisons
{{actions_taken}}

## Ce que nous vous recommandons
{{customer_actions}}

## Contact
{{contact_point}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Modèle générique. Valider avec Juridique/Communication avant diffusion.'],
  },
  {
    id: 'tpl-005',
    title: 'Notification d’une violation de données — squelette GDPR/CNIL (à compléter)',
    description:
      'Squelette de dossier de notification d’une violation de données personnelles à adapter avec le juridique.',
    category: 'Compliance',
    priority: 'Critique',
    audiences: ['Juridique', 'Management'],
    tags: ['gdpr', 'cnil', 'data breach', 'notification'],
    regulations: ['GDPR'],
    variables: [
      {
        key: 'company_name',
        label: 'Responsable de traitement',
        example: 'ACME SA',
        required: true,
      },
      { key: 'dpo_name', label: 'Nom DPO', example: 'Mme Martin', required: true },
      {
        key: 'dpo_contact',
        label: 'Contact DPO',
        example: 'dpo@acme.fr',
        required: true,
        type: 'email',
      },
      {
        key: 'breach_date',
        label: 'Date de la violation',
        example: '2026-02-06',
        required: true,
        type: 'date',
      },
      {
        key: 'detection_date',
        label: 'Date de détection',
        example: '2026-02-07',
        required: true,
        type: 'date',
      },
      {
        key: 'nature_of_breach',
        label: 'Nature de la violation',
        example: 'Exposition de boîtes mail suite à compromission compte admin',
        required: true,
        type: 'textarea',
      },
      {
        key: 'data_categories',
        label: 'Catégories de données',
        example: 'Identité, email, historique de commandes',
        required: true,
        type: 'textarea',
      },
      {
        key: 'data_subjects',
        label: 'Personnes concernées',
        example: 'Clients UE B2C',
        required: true,
        type: 'textarea',
      },
      {
        key: 'approx_records',
        label: "Volume d'enregistrements",
        example: '12500',
        required: true,
        type: 'number',
      },
      {
        key: 'likely_consequences',
        label: 'Conséquences probables',
        example: 'Risque phishing ciblé et usurpation identité',
        required: true,
        type: 'textarea',
      },
      {
        key: 'measures_taken',
        label: 'Mesures prises',
        example: 'Confinement, réinitialisation sessions, blocage IOC',
        required: true,
        type: 'textarea',
      },
      {
        key: 'measures_planned',
        label: 'Mesures planifiées',
        example: 'Rotation complète secrets, revue accès, notification clients',
        required: true,
        type: 'textarea',
      },
      {
        key: 'cross_border',
        label: 'Caractère transfrontalier',
        example: 'Oui (FR, BE, ES)',
        required: true,
      },
      {
        key: 'contact_for_authority',
        label: 'Contact autorité',
        example: 'legal@acme.fr / +33...',
        required: true,
      },
    ],
    content: `# Violation de données — Dossier de notification (à compléter)
**Responsable de traitement :** {{company_name}}  
**DPO :** {{dpo_name}} — {{dpo_contact}}  
**Date violation (estimée) :** {{breach_date}}  
**Date de détection :** {{detection_date}}

## 1) Nature de la violation
{{nature_of_breach}}

## 2) Catégories de données concernées
{{data_categories}}

## 3) Personnes concernées
{{data_subjects}}

## 4) Estimation volumétrie
- Enregistrements : {{approx_records}}
- Caractère transfrontalier : {{cross_border}}

## 5) Conséquences probables
{{likely_consequences}}

## 6) Mesures prises
{{measures_taken}}

## 7) Mesures planifiées
{{measures_planned}}

## 8) Point de contact autorité
{{contact_for_authority}}`,
    references: [
      ...templateReferenceBase,
      { name: 'RGPD / GDPR', note: 'Notification de violation de données (articles applicables)' },
      { name: 'CNIL', note: 'Recommandations et téléservice de notification' },
    ],
    updatedAt: '2026-02-07',
    disclaimers: [
      'Ce modèle n’est pas un avis juridique. Les délais et exigences peuvent varier selon le contexte. Validation Juridique obligatoire.',
    ],
  },
  {
    id: 'tpl-006',
    title: 'Holding statement presse (déclaration provisoire)',
    description:
      'Déclaration publique transitoire pour communiquer rapidement sans compromettre l’enquête.',
    category: 'Communication',
    priority: 'Moyenne',
    audiences: ['Externe', 'Management', 'Juridique'],
    tags: ['presse', 'holding statement', 'crise'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'incident_type',
        label: "Type d'incident",
        example: 'Incident de cybersécurité',
        required: true,
      },
      {
        key: 'detected_at',
        label: 'Date de détection',
        example: '2026-02-07',
        required: true,
        type: 'date',
      },
      {
        key: 'current_status',
        label: 'Statut actuel',
        example: 'Investigations en cours, périmètre en cours de confirmation',
        required: true,
        type: 'textarea',
      },
      {
        key: 'customer_commitment',
        label: 'Engagement client',
        example: 'Information progressive et mesures de protection renforcées',
        required: true,
        type: 'textarea',
      },
      {
        key: 'contact_email',
        label: 'Contact presse',
        example: 'press@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Déclaration provisoire — {{company_name}}
{{company_name}} a identifié le {{detected_at}} un incident de sécurité impliquant **{{incident_type}}**.  
Nos équipes ont immédiatement engagé des mesures de confinement et d’investigation.

À ce stade : **{{current_status}}**.  
Nous restons mobilisés pour protéger nos clients et nos opérations : **{{customer_commitment}}**.

Contact presse : {{contact_email}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['À faire valider par Juridique/Comms. Ne pas spéculer.'],
  },
  {
    id: 'tpl-007',
    title: 'Chaîne de conservation des preuves (Chain of Custody) — formulaire',
    description:
      'Formulaire de traçabilité des preuves numériques pour préserver intégrité et recevabilité.',
    category: 'Incident Response',
    priority: 'Élevée',
    audiences: ['SOC / CERT', 'IT / Ops'],
    tags: ['dfir', 'forensics', 'chain of custody', 'preuve'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      { key: 'case_id', label: 'Case ID', example: 'DFIR-2026-0032', required: true },
    ],
    content: `# Chain of Custody — {{company_name}}
**Case ID :** {{case_id}}

## Tableau de suivi
| Date/Heure | Preuve (ID) | Description | Source | Collecteur | Hash (SHA256) | Stockage | Transfert à | Motif |
|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |

## Notes
- Utiliser des horodatages cohérents (UTC si possible).
- Documenter toute manipulation (copie, analyse, transfert).`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Modèle DFIR. Adapter aux procédures internes.'],
  },
  {
    id: 'tpl-008',
    title: 'Rapport post-incident (PIR / Lessons Learned)',
    description:
      "Structure de retour d'expérience pour transformer un incident en plan d'amélioration concret.",
    category: 'GRC',
    priority: 'Moyenne',
    audiences: ['Management', 'IT / Ops', 'SOC / CERT'],
    tags: ['post mortem', 'pir', 'lessons learned', 'amélioration continue'],
    variables: [
      { key: 'incident_id', label: 'Incident ID', example: 'IR-2026-014', required: true },
      {
        key: 'incident_type',
        label: "Type d'incident",
        example: 'Compromission endpoint',
        required: true,
      },
      {
        key: 'timeline',
        label: 'Chronologie',
        example: '- Détection\n- Confinement\n- Rétablissement',
        required: true,
        type: 'textarea',
      },
      {
        key: 'root_cause',
        label: 'Cause racine',
        example: 'Absence MFA sur compte externe',
        required: true,
        type: 'textarea',
      },
      {
        key: 'impact',
        label: 'Impact',
        example: 'Interruption du service support pendant 2h',
        required: true,
        type: 'textarea',
      },
      {
        key: 'what_worked',
        label: 'Ce qui a fonctionné',
        example: 'Détection SOC rapide et containment automatisé',
        required: true,
        type: 'textarea',
      },
      {
        key: 'what_failed',
        label: "Points d'échec",
        example: 'Escalade juridique tardive',
        required: true,
        type: 'textarea',
      },
      {
        key: 'corrective_actions',
        label: 'Actions correctives',
        example: 'Durcissement accès admin et revue PAM',
        required: true,
        type: 'textarea',
      },
      {
        key: 'preventive_actions',
        label: 'Actions préventives',
        example: 'Programme de simulation phishing + MFA résistant',
        required: true,
        type: 'textarea',
      },
      {
        key: 'owners_deadlines',
        label: 'Owners & deadlines',
        example: 'RSSI: 30j / IT Ops: 14j',
        required: true,
        type: 'textarea',
      },
    ],
    content: `# Post-Incident Report — {{incident_id}} — {{incident_type}}

## 1) Chronologie
{{timeline}}

## 2) Cause racine (root cause)
{{root_cause}}

## 3) Impact
{{impact}}

## 4) Ce qui a bien fonctionné
{{what_worked}}

## 5) Points d’échec / frictions
{{what_failed}}

## 6) Actions correctives (court terme)
{{corrective_actions}}

## 7) Actions préventives (long terme)
{{preventive_actions}}

## 8) Plan d’action (owners & deadlines)
{{owners_deadlines}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Document d’amélioration continue. Partager en interne selon classification.'],
  },
  {
    id: 'tpl-009',
    title: 'Politique mots de passe & MFA (version synthèse)',
    description:
      'Version condensée de politique d’authentification pour communication interne et onboarding.',
    category: 'Policy',
    priority: 'Moyenne',
    audiences: ['Utilisateurs', 'RH', 'IT / Ops'],
    tags: ['policy', 'mfa', 'password', 'iam'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'mfa_scope',
        label: 'Périmètre MFA',
        example: 'Tous les comptes SaaS et VPN',
        required: true,
        type: 'textarea',
      },
      {
        key: 'password_rules',
        label: 'Règles mots de passe',
        example: 'Longueur minimale 14, passphrase, blocage mot de passe compromis',
        required: true,
        type: 'textarea',
      },
      {
        key: 'password_manager',
        label: 'Gestionnaire recommandé',
        example: 'Bitwarden Entreprise',
        required: true,
      },
      {
        key: 'exceptions_process',
        label: 'Process exceptions',
        example: 'Formulaire risk acceptance + approbation RSSI',
        required: true,
      },
    ],
    content: `# Politique — Mots de passe & MFA — {{company_name}}

## Objectif
Réduire le risque de compromission de comptes via exigences MFA et bonnes pratiques d’authentification.

## MFA (obligatoire)
**Périmètre :** {{mfa_scope}}

## Bonnes pratiques mots de passe
{{password_rules}}

## Gestionnaire de mots de passe (recommandé)
{{password_manager}}

## Exceptions
Toute exception doit être justifiée et documentée via : {{exceptions_process}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: [
      'Modèle synthèse. La politique détaillée doit inclure rôles, audits, et cycle de revue.',
    ],
  },
  {
    id: 'tpl-010',
    title: 'Questionnaire sécurité fournisseur (version light)',
    description:
      'Questionnaire initial de due diligence cyber pour qualification d’un fournisseur.',
    category: 'Vendor',
    priority: 'Moyenne',
    audiences: ['Fournisseur', 'Juridique', 'IT / Ops'],
    tags: ['third-party risk', 'vendor', 'questionnaire', 'due diligence'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'vendor_name',
        label: 'Fournisseur',
        example: 'VendorCloud SAS',
        required: true,
      },
      {
        key: 'service_desc',
        label: 'Service concerné',
        example: 'CRM cloud externalisé',
        required: true,
      },
      {
        key: 'hosting_region',
        label: 'Région/Pays hébergement',
        example: 'France / UE',
        required: true,
      },
      {
        key: 'security_contact',
        label: 'Contact sécurité fournisseur',
        example: 'security@vendorcloud.com',
        required: true,
        type: 'email',
      },
    ],
    content: `# Questionnaire Sécurité Fournisseur — {{company_name}} → {{vendor_name}}
**Service :** {{service_desc}}  
**Région d’hébergement / pays :** {{hosting_region}}  
**Contact sécurité :** {{security_contact}}

## 1) Gouvernance & conformité
- Avez-vous un SMSI (ISO 27001) ou équivalent ? Préciser le périmètre.
- Disposez-vous d’une politique de gestion des vulnérabilités (SLA correctifs) ?
- Avez-vous un programme de sensibilisation sécurité ?

## 2) Contrôles techniques
- MFA obligatoire pour accès admin ? Oui/Non. Détails.
- Chiffrement au repos et en transit ? Détails.
- Journaux de sécurité disponibles (auth, admin, accès données) ? Rétention ?

## 3) Opérations & incidents
- Décrivez votre processus de gestion d’incident (détection, escalade, communication).
- Délais d’information client en cas d’incident impactant la confidentialité/intégrité/disponibilité.

## 4) Données & sous-traitants
- Sous-traitants impliqués ? Liste + localisation.
- Conditions d’effacement / restitution des données en fin de contrat.`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: [
      'Modèle de présélection. Pour services critiques, utiliser un questionnaire étendu + annexes contractuelles.',
    ],
  },
  {
    id: 'tpl-011',
    title: 'Demande d’accès / élévation de privilèges (formulaire)',
    description: "Formulaire standardisé pour cadrer, approuver et tracer toute élévation d'accès.",
    category: 'GRC',
    priority: 'Élevée',
    audiences: ['IT / Ops', 'Management', 'Juridique'],
    tags: ['privileged access', 'iam', 'formulaire', 'gouvernance'],
    regulations: ['NIS2'],
    variables: [
      { key: 'requester_name', label: 'Demandeur', example: 'S. Bernard', required: true },
      {
        key: 'requester_role',
        label: 'Rôle du demandeur',
        example: 'Admin applicatif',
        required: true,
      },
      {
        key: 'target_system',
        label: 'Système cible',
        example: 'ERP-PROD',
        required: true,
      },
      {
        key: 'requested_privilege',
        label: 'Privilège demandé',
        example: 'Admin lecture/écriture temporaire',
        required: true,
        type: 'textarea',
      },
      {
        key: 'business_justification',
        label: 'Justification métier',
        example: 'Correctif critique de clôture financière',
        required: true,
        type: 'textarea',
      },
      {
        key: 'start_date',
        label: 'Début',
        example: '2026-02-08',
        required: true,
        type: 'date',
      },
      {
        key: 'end_date',
        label: 'Fin',
        example: '2026-02-10',
        required: true,
        type: 'date',
      },
      {
        key: 'approver_name',
        label: 'Approbateur métier',
        example: 'Directeur Finance',
        required: true,
      },
      {
        key: 'security_reviewer',
        label: 'Relecteur sécurité',
        example: 'RSSI Adjoint',
        required: true,
      },
      {
        key: 'ticket_id',
        label: 'Ticket de traçabilité',
        example: 'CHG-2026-9912',
        required: true,
      },
    ],
    content: `# Demande d’accès / élévation de privilèges

## 1) Identité demandeur
- Nom : {{requester_name}}
- Rôle : {{requester_role}}
- Ticket : {{ticket_id}}

## 2) Périmètre de la demande
- Système cible : {{target_system}}
- Privilège demandé : {{requested_privilege}}
- Période autorisée : {{start_date}} → {{end_date}}

## 3) Justification
{{business_justification}}

## 4) Contrôles obligatoires
- Principe du moindre privilège appliqué
- Traçabilité des actions activée
- Accès expirant automatiquement à la date de fin

## 5) Validation
- Approbateur métier : {{approver_name}}
- Validation sécurité : {{security_reviewer}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Toute élévation d’accès doit être temporaire, traçable et révoquée à échéance.'],
  },
  {
    id: 'tpl-012',
    title: 'Demande d’exception sécurité (risk acceptance)',
    description:
      "Modèle d'acceptation de risque pour gérer une exception sécurité documentée et limitée dans le temps.",
    category: 'GRC',
    priority: 'Élevée',
    audiences: ['Management', 'Juridique', 'IT / Ops'],
    tags: ['risk acceptance', 'exception', 'gouvernance'],
    regulations: ['NIS2', 'ISO 27001'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'exception_id',
        label: 'Identifiant exception',
        example: 'RA-2026-017',
        required: true,
      },
      {
        key: 'control_name',
        label: 'Contrôle concerné',
        example: 'MFA administrateur',
        required: true,
      },
      {
        key: 'scope',
        label: 'Périmètre',
        example: '2 comptes service legacy',
        required: true,
        type: 'textarea',
      },
      {
        key: 'reason',
        label: 'Motif',
        example: 'Incompatibilité technique éditeur temporaire',
        required: true,
        type: 'textarea',
      },
      {
        key: 'risk_assessment',
        label: 'Évaluation du risque',
        example: 'Risque d’élévation non autorisée, impact élevé',
        required: true,
        type: 'textarea',
      },
      {
        key: 'compensating_controls',
        label: 'Mesures compensatoires',
        example: 'Surveillance renforcée + bastion + rotation mots de passe hebdo',
        required: true,
        type: 'textarea',
      },
      {
        key: 'owner_name',
        label: 'Owner du risque',
        example: 'Responsable Production',
        required: true,
      },
      {
        key: 'expiry_date',
        label: "Date d'expiration",
        example: '2026-04-30',
        required: true,
        type: 'date',
      },
      {
        key: 'approver_name',
        label: 'Approbateur final',
        example: 'DSI',
        required: true,
      },
    ],
    content: `# Demande d’exception sécurité — {{exception_id}}
**Organisation :** {{company_name}}

## Contrôle concerné
{{control_name}}

## Périmètre
{{scope}}

## Motif
{{reason}}

## Évaluation du risque
{{risk_assessment}}

## Mesures compensatoires
{{compensating_controls}}

## Gouvernance
- Owner du risque : {{owner_name}}
- Date d’expiration : {{expiry_date}}
- Approbateur final : {{approver_name}}

## Décision
- [ ] Acceptée
- [ ] Refusée
- [ ] À réviser`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Toute exception doit avoir une durée limitée, un owner et une date de revue.'],
  },
  {
    id: 'tpl-013',
    title: 'Plan de communication incident (matrice qui/quoi/quand)',
    description:
      'Matrice de communication opérationnelle pour organiser messages, canaux et validations pendant la crise.',
    category: 'Communication',
    priority: 'Élevée',
    audiences: ['Management', 'Juridique', 'Externe'],
    tags: ['communication de crise', 'matrice', 'incident'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      { key: 'incident_id', label: 'Incident ID', example: 'IR-2026-014', required: true },
      {
        key: 'trigger_event',
        label: 'Événement déclencheur',
        example: 'Compromission confirmée système critique',
        required: true,
      },
      {
        key: 'spokesperson',
        label: 'Porte-parole',
        example: 'Directeur Communication',
        required: true,
      },
      {
        key: 'communication_channel',
        label: 'Canaux officiels',
        example: 'Email interne, intranet, site statut, communiqué presse',
        required: true,
        type: 'textarea',
      },
      {
        key: 'approval_chain',
        label: "Chaîne d'approbation",
        example: 'RSSI -> Juridique -> Direction',
        required: true,
      },
      {
        key: 'cadence',
        label: 'Cadence de mise à jour',
        example: 'Interne: 2h / Externe: 6h',
        required: true,
      },
      {
        key: 'stakeholders_internal',
        label: 'Parties prenantes internes',
        example: 'DSI, SOC, COMEX, RH',
        required: true,
        type: 'textarea',
      },
      {
        key: 'stakeholders_external',
        label: 'Parties prenantes externes',
        example: 'Clients, partenaires, autorités, presse',
        required: true,
        type: 'textarea',
      },
      {
        key: 'escalation_contact',
        label: 'Contact escalade',
        example: 'crisis@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Plan de communication incident — {{incident_id}}
**Organisation :** {{company_name}}  
**Déclencheur :** {{trigger_event}}

## Gouvernance communication
- Porte-parole : {{spokesperson}}
- Chaîne d’approbation : {{approval_chain}}
- Cadence : {{cadence}}
- Contact escalade : {{escalation_contact}}

## Canaux officiels
{{communication_channel}}

## Matrice qui / quoi / quand
| Audience | Message clé | Canal | Fréquence | Owner |
|---|---|---|---|---|
| Interne | Statut opérationnel + consignes | Email / Teams / Intranet | {{cadence}} | Incident Manager |
| Externe | Informations validées et factuelles | Site statut / email / presse | {{cadence}} | Communication |

## Parties prenantes internes
{{stakeholders_internal}}

## Parties prenantes externes
{{stakeholders_external}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Toute communication externe doit être validée juridiquement avant diffusion.'],
  },
  {
    id: 'tpl-014',
    title: 'Registre de risques (ligne type + scoring)',
    description:
      'Modèle de ligne de registre de risques cyber avec scoring simple impact/probabilité.',
    category: 'GRC',
    priority: 'Moyenne',
    audiences: ['Management', 'IT / Ops', 'Juridique'],
    tags: ['risk register', 'grc', 'scoring'],
    regulations: ['NIS2'],
    variables: [
      { key: 'risk_id', label: 'Risk ID', example: 'RISK-2026-034', required: true },
      {
        key: 'asset_process',
        label: 'Actif / processus',
        example: 'Plateforme e-commerce',
        required: true,
      },
      {
        key: 'threat_scenario',
        label: 'Scénario de menace',
        example: 'Exfiltration de données via compte compromis',
        required: true,
        type: 'textarea',
      },
      {
        key: 'vulnerability',
        label: 'Vulnérabilité exploitée',
        example: 'MFA non imposé sur comptes tiers',
        required: true,
        type: 'textarea',
      },
      {
        key: 'impact_score',
        label: 'Impact (1-5)',
        example: '5',
        required: true,
        type: 'number',
      },
      {
        key: 'likelihood_score',
        label: 'Probabilité (1-5)',
        example: '4',
        required: true,
        type: 'number',
      },
      {
        key: 'inherent_risk',
        label: 'Risque inhérent',
        example: '20 - Critique',
        required: true,
      },
      {
        key: 'controls_in_place',
        label: 'Contrôles en place',
        example: 'EDR, SIEM, RBAC',
        required: true,
        type: 'textarea',
      },
      {
        key: 'residual_risk',
        label: 'Risque résiduel',
        example: '12 - Élevé',
        required: true,
      },
      {
        key: 'owner',
        label: 'Owner',
        example: 'Responsable sécurité applicative',
        required: true,
      },
      {
        key: 'review_date',
        label: 'Date de revue',
        example: '2026-03-15',
        required: true,
        type: 'date',
      },
    ],
    content: `# Registre de risques — {{risk_id}}

## Ligne de risque
- Actif / processus : {{asset_process}}
- Scénario : {{threat_scenario}}
- Vulnérabilité : {{vulnerability}}

## Scoring
- Impact (1-5) : {{impact_score}}
- Probabilité (1-5) : {{likelihood_score}}
- Risque inhérent : {{inherent_risk}}

## Contrôles actuels
{{controls_in_place}}

## Résiduel et pilotage
- Risque résiduel : {{residual_risk}}
- Owner : {{owner}}
- Date de revue : {{review_date}}

## Décision
- [ ] Accepter
- [ ] Réduire
- [ ] Transférer
- [ ] Éviter`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
  },
  {
    id: 'tpl-015',
    title: 'Procédure sauvegardes & restauration (plan synthèse)',
    description:
      'Plan synthétique de sauvegarde/restauration pour prouver résilience et objectifs RTO/RPO.',
    category: 'Technical',
    priority: 'Élevée',
    audiences: ['IT / Ops', 'SOC / CERT'],
    tags: ['backup', 'restore', 'rto', 'rpo', 'resilience'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'critical_scope',
        label: 'Périmètre critique',
        example: 'ERP, AD, CRM, fichiers partagés',
        required: true,
        type: 'textarea',
      },
      {
        key: 'backup_frequency',
        label: 'Fréquence sauvegarde',
        example: 'Journalier + snapshots horaires',
        required: true,
      },
      {
        key: 'retention_policy',
        label: 'Rétention',
        example: '35 jours + archives mensuelles 12 mois',
        required: true,
      },
      {
        key: 'immutable_storage',
        label: 'Stockage immuable',
        example: 'Bucket object-lock + coffre hors domaine',
        required: true,
      },
      { key: 'rto_target', label: 'RTO cible', example: '8h', required: true },
      { key: 'rpo_target', label: 'RPO cible', example: '1h', required: true },
      {
        key: 'restoration_test_frequency',
        label: 'Fréquence tests',
        example: 'Mensuelle',
        required: true,
      },
      {
        key: 'recovery_owner',
        label: 'Owner reprise',
        example: 'Responsable Production',
        required: true,
      },
      {
        key: 'escalation_path',
        label: 'Escalade',
        example: 'N1 Ops -> N2 Infra -> Incident Manager',
        required: true,
        type: 'textarea',
      },
    ],
    content: `# Procédure sauvegardes & restauration — {{company_name}}

## Périmètre critique
{{critical_scope}}

## Politique de sauvegarde
- Fréquence : {{backup_frequency}}
- Rétention : {{retention_policy}}
- Stockage immuable / isolé : {{immutable_storage}}

## Objectifs de reprise
- RTO : {{rto_target}}
- RPO : {{rpo_target}}

## Exécution restauration
1. Valider le point de restauration
2. Isoler la cible de restauration
3. Restaurer en environnement de contrôle
4. Vérifier intégrité et cohérence applicative
5. Basculer en production après validation

## Gouvernance
- Fréquence des tests : {{restoration_test_frequency}}
- Responsable : {{recovery_owner}}
- Escalade : {{escalation_path}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
  },
  {
    id: 'tpl-016',
    title: 'Politique usage acceptable (Acceptable Use Policy) — synthèse',
    description:
      "Version synthétique d'AUP pour cadrer usages autorisés/interdits des ressources numériques.",
    category: 'Policy',
    priority: 'Moyenne',
    audiences: ['Utilisateurs', 'RH', 'IT / Ops'],
    tags: ['aup', 'policy', 'sensibilisation'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'allowed_usage',
        label: 'Usages autorisés',
        example: 'Usage professionnel, outils validés, stockage approuvé',
        required: true,
        type: 'textarea',
      },
      {
        key: 'prohibited_usage',
        label: 'Usages interdits',
        example: 'Partage d’identifiants, shadow IT, stockage non approuvé',
        required: true,
        type: 'textarea',
      },
      {
        key: 'monitoring_notice',
        label: 'Information de supervision',
        example: 'Les activités peuvent être journalisées selon cadre légal',
        required: true,
        type: 'textarea',
      },
      {
        key: 'sanctions_process',
        label: 'Gestion des manquements',
        example: 'Procédure RH + actions disciplinaires graduées',
        required: true,
        type: 'textarea',
      },
      {
        key: 'support_contact',
        label: 'Contact support',
        example: 'support@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Politique d’usage acceptable — {{company_name}}

## 1) Objet
Cette politique définit les règles minimales d’usage des ressources informatiques de l’organisation.

## 2) Usages autorisés
{{allowed_usage}}

## 3) Usages interdits
{{prohibited_usage}}

## 4) Supervision et traçabilité
{{monitoring_notice}}

## 5) Manquements
{{sanctions_process}}

## 6) Assistance
Contact : {{support_contact}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
  },
  {
    id: 'tpl-017',
    title: 'Politique télétravail / BYOD — synthèse',
    description:
      'Cadre synthétique pour sécuriser les usages télétravail et équipements personnels.',
    category: 'Policy',
    priority: 'Moyenne',
    audiences: ['Utilisateurs', 'RH', 'IT / Ops'],
    tags: ['teletravail', 'byod', 'policy', 'endpoint'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'eligible_population',
        label: 'Population concernée',
        example: 'Tous collaborateurs hors environnements sensibles',
        required: true,
        type: 'textarea',
      },
      {
        key: 'mandatory_controls',
        label: 'Contrôles obligatoires',
        example: 'EDR, chiffrement disque, MFA, patching auto',
        required: true,
        type: 'textarea',
      },
      {
        key: 'byod_requirements',
        label: 'Exigences BYOD',
        example: 'MDM obligatoire, séparation pro/perso, version OS supportée',
        required: true,
        type: 'textarea',
      },
      {
        key: 'vpn_requirements',
        label: 'Exigences VPN',
        example: 'VPN + MFA requis sur réseaux non fiables',
        required: true,
        type: 'textarea',
      },
      {
        key: 'incident_reporting',
        label: 'Signalement incident',
        example: 'Perte/vol appareil à déclarer < 30 min',
        required: true,
        type: 'textarea',
      },
      {
        key: 'exceptions_process',
        label: 'Gestion des exceptions',
        example: 'Validation RSSI + RH + date d’expiration',
        required: true,
      },
    ],
    content: `# Politique Télétravail / BYOD — {{company_name}}

## Périmètre
{{eligible_population}}

## Contrôles techniques obligatoires
{{mandatory_controls}}

## Exigences spécifiques BYOD
{{byod_requirements}}

## Connectivité distante
{{vpn_requirements}}

## Gestion des incidents
{{incident_reporting}}

## Exceptions
{{exceptions_process}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
  },
  {
    id: 'tpl-018',
    title: 'Politique classification des données — synthèse',
    description:
      'Modèle de politique de classification pour harmoniser protection, partage et rétention des données.',
    category: 'Compliance',
    priority: 'Élevée',
    audiences: ['Management', 'Juridique', 'Utilisateurs', 'RH'],
    tags: ['classification', 'données', 'gdpr', 'nis2'],
    regulations: ['GDPR', 'NIS2'],
    variables: [
      { key: 'company_name', label: 'Organisation', example: 'ACME SA', required: true },
      {
        key: 'classification_levels',
        label: 'Niveaux de classification',
        example: 'Public / Interne / Confidentiel / Très Sensible',
        required: true,
        type: 'textarea',
      },
      {
        key: 'handling_rules',
        label: 'Règles de manipulation',
        example: 'Chiffrement obligatoire dès niveau Confidentiel',
        required: true,
        type: 'textarea',
      },
      {
        key: 'labeling_rules',
        label: 'Règles de marquage',
        example: 'Label en en-tête document et métadonnées',
        required: true,
        type: 'textarea',
      },
      {
        key: 'sharing_rules',
        label: 'Règles de partage',
        example: 'Partage externe soumis à validation owner + juridique',
        required: true,
        type: 'textarea',
      },
      {
        key: 'retention_rules',
        label: 'Règles de conservation',
        example: 'Conservation selon obligations légales et besoin métier',
        required: true,
        type: 'textarea',
      },
      {
        key: 'owner_roles',
        label: 'Rôles propriétaires',
        example: 'Data Owner, Data Steward, IT Custodian',
        required: true,
        type: 'textarea',
      },
      {
        key: 'escalation_contact',
        label: 'Contact escalade',
        example: 'governance@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Politique de classification des données — {{company_name}}

## 1) Niveaux
{{classification_levels}}

## 2) Règles de manipulation
{{handling_rules}}

## 3) Marquage
{{labeling_rules}}

## 4) Partage interne/externe
{{sharing_rules}}

## 5) Conservation / destruction
{{retention_rules}}

## 6) Rôles et responsabilités
{{owner_roles}}

## 7) Escalade
{{escalation_contact}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: [
      'Ce modèle n’est pas un avis juridique. Adapter les obligations de conservation et de notification au cadre réglementaire applicable.',
    ],
  },
  {
    id: 'tpl-019',
    title: 'Plan d’exercice Tabletop (scénario + objectifs + évaluation)',
    description:
      'Trame d’exercice de crise cyber pour tester coordination, décision et communication.',
    category: 'Incident Response',
    priority: 'Moyenne',
    audiences: ['Management', 'SOC / CERT', 'IT / Ops', 'Juridique'],
    tags: ['tabletop', 'exercice', 'crise', 'amélioration continue'],
    variables: [
      {
        key: 'exercise_name',
        label: "Nom de l'exercice",
        example: 'TTX-Ransomware-Q2',
        required: true,
      },
      {
        key: 'exercise_date',
        label: 'Date',
        example: '2026-04-11',
        required: true,
        type: 'date',
      },
      {
        key: 'scenario_summary',
        label: 'Scénario',
        example: 'Ransomware + extorsion sur filiale européenne',
        required: true,
        type: 'textarea',
      },
      {
        key: 'objectives',
        label: 'Objectifs',
        example: 'Tester escalade, communication, décisions juridiques',
        required: true,
        type: 'textarea',
      },
      {
        key: 'participants',
        label: 'Participants',
        example: 'SOC, DSI, Juridique, Communication, Direction',
        required: true,
        type: 'textarea',
      },
      {
        key: 'injects',
        label: 'Injects',
        example: 'Fuite supposée, pression média, indisponibilité ERP',
        required: true,
        type: 'textarea',
      },
      {
        key: 'success_criteria',
        label: 'Critères de succès',
        example: 'Décisions clés prises en < 30 min',
        required: true,
        type: 'textarea',
      },
      {
        key: 'evaluator_team',
        label: "Équipe d'évaluation",
        example: 'Audit interne + RSSI',
        required: true,
      },
      {
        key: 'report_deadline',
        label: 'Deadline rapport',
        example: '2026-04-25',
        required: true,
        type: 'date',
      },
    ],
    content: `# Plan d’exercice Tabletop — {{exercise_name}}
**Date :** {{exercise_date}}

## Scénario
{{scenario_summary}}

## Objectifs
{{objectives}}

## Participants
{{participants}}

## Injects prévus
{{injects}}

## Critères d’évaluation
{{success_criteria}}

## Gouvernance
- Équipe d’évaluation : {{evaluator_team}}
- Date de remise du rapport : {{report_deadline}}

## Livrables attendus
- Chronologie de décision
- Écarts identifiés
- Plan d’actions avec owners et échéances`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
  },
  {
    id: 'tpl-020',
    title: 'Demande d’informations à un fournisseur après incident (mail)',
    description:
      "Email type pour solliciter rapidement un fournisseur après incident impactant l'écosystème.",
    category: 'Vendor',
    priority: 'Élevée',
    audiences: ['Fournisseur', 'Juridique', 'IT / Ops'],
    tags: ['fournisseur', 'incident tiers', 'third-party risk', 'mail'],
    variables: [
      {
        key: 'vendor_name',
        label: 'Nom fournisseur',
        example: 'VendorCloud SAS',
        required: true,
      },
      {
        key: 'company_name',
        label: 'Votre organisation',
        example: 'ACME SA',
        required: true,
      },
      {
        key: 'incident_reference',
        label: 'Référence incident',
        example: 'TPRM-2026-011',
        required: true,
      },
      {
        key: 'requested_facts',
        label: 'Faits demandés',
        example: 'Chronologie, IOCs, actifs concernés, statut confinement',
        required: true,
        type: 'textarea',
      },
      {
        key: 'impacted_data',
        label: 'Données potentiellement impactées',
        example: 'Clients UE, journaux applicatifs, métadonnées support',
        required: true,
        type: 'textarea',
      },
      {
        key: 'containment_actions',
        label: 'Actions de confinement attendues',
        example: 'Rotation secrets, suspension accès exposés, forensics',
        required: true,
        type: 'textarea',
      },
      {
        key: 'expected_deadline',
        label: 'Deadline réponse',
        example: '2026-02-08 12:00 CET',
        required: true,
      },
      {
        key: 'legal_basis',
        label: 'Base contractuelle',
        example: 'Clause notification incident du DPA / MSA',
        required: true,
      },
      {
        key: 'contact_point',
        label: 'Point de contact',
        example: 'third-party-risk@acme.fr',
        required: true,
        type: 'email',
      },
    ],
    content: `# Objet : Demande d’informations incident — {{incident_reference}}

Bonjour {{vendor_name}},

Suite à un incident de sécurité potentiellement lié à vos services, {{company_name}} vous demande un point de situation formel.

## Informations demandées
{{requested_facts}}

## Données potentiellement concernées
{{impacted_data}}

## Mesures attendues côté fournisseur
{{containment_actions}}

## Délai de réponse attendu
{{expected_deadline}}

## Référence contractuelle
{{legal_basis}}

Merci d’adresser votre réponse à : {{contact_point}}`,
    references: templateReferenceBase,
    updatedAt: '2026-02-07',
    disclaimers: ['Modèle de coordination tiers. Adapter aux clauses contractuelles en vigueur.'],
  },
];

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Wazuh (SIEM/XDR Open Source)',
    context: 'SOC Engineering',
    objective:
      'Plateforme open source de detection, supervision et reponse securite pour centraliser les evenements endpoint/cloud et accelerer le triage SOC.',
    technologies: ['Wazuh', 'Elastic', 'Agent', 'MITRE ATT&CK'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 14 648 stars, 2 143 forks, 2 848 issues ouvertes.',
    link: 'https://github.com/wazuh/wazuh',
    takeaways: [
      'Tres adapte pour une base SOC blue team avec visibilite endpoint + cloud.',
      'Permet de mapper detections et alertes sur MITRE ATT&CK.',
      "Projet mature avec une communaute active et une cadence d'evolution elevee.",
    ],
  },
  {
    id: 'p2',
    title: 'Security Onion (NSM Distribution)',
    context: 'Network Investigation',
    objective:
      'Distribution orientee SOC pour la detection reseau : NIDS, PCAP, enrichissement et investigation centralisee sur une meme pile.',
    technologies: ['Security Onion', 'Suricata', 'Zeek', 'Elastic'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 4 331 stars, 611 forks, 68 issues ouvertes.',
    link: 'https://github.com/Security-Onion-Solutions/securityonion',
    takeaways: [
      'Reference solide pour une capacite NDR/NSM en environnement on-prem.',
      'Integre nativement Suricata, Zeek et outils de chasse reseau.',
      'Permet de monter rapidement un lab defensif realiste.',
    ],
  },
  {
    id: 'p3',
    title: 'Velociraptor (DFIR & Threat Hunting)',
    context: 'Threat Hunting',
    objective:
      'Framework de reponse incident et de chasse endpoint pour collecter des preuves, lancer des requetes VQL et investiguer a grande echelle.',
    technologies: ['Velociraptor', 'VQL', 'DFIR', 'YARA'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 3 743 stars, 589 forks, 78 issues ouvertes.',
    link: 'https://github.com/Velocidex/velociraptor',
    takeaways: [
      'Excellente brique pour les enquetes forensiques et la collecte live.',
      'Pertinent pour industrialiser la chasse hypotheses -> artefacts.',
      'Se combine bien avec un SIEM pour prioriser les investigations.',
    ],
  },
  {
    id: 'p4',
    title: 'OpenCTI (Threat Intelligence Platform)',
    context: 'Cloud Threat Intel',
    objective:
      'Plateforme CTI open source pour consolider sources de renseignement, modeliser menaces en STIX et partager des indicateurs exploitables.',
    technologies: ['OpenCTI', 'STIX 2.1', 'TAXII', 'GraphQL'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 8 166 stars, 1 209 forks, 1 741 issues ouvertes.',
    link: 'https://github.com/OpenCTI-Platform/opencti',
    takeaways: [
      'Convient pour passer d une veille passive a une intelligence actionnable.',
      'Utile pour corréler campagnes, IOCs, TTPs et actifs internes exposes.',
      'S integre avec des flux externes et des processus SOC internes.',
    ],
  },
  {
    id: 'p5',
    title: 'Sigma Rules (Detection as Code)',
    context: 'Detection Engineering',
    objective:
      'Standardiser les regles de detection dans un format portable pour les convertir vers plusieurs SIEM/EDR et accelerer le cycle detection -> production.',
    technologies: ['Sigma', 'YAML', 'SIEM', 'Detection as Code'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 10 098 stars, 2 531 forks, 85 issues ouvertes.',
    link: 'https://github.com/SigmaHQ/sigma',
    takeaways: [
      'Reference de fait pour versionner et partager des detections defensives.',
      'Permet des pipelines CI de validation de regles avant deploiement.',
      'Brique cle pour reduire le drift entre plateformes de detection.',
    ],
  },
  {
    id: 'p6',
    title: 'Suricata (IDS/IPS Engine)',
    context: 'Network Detection',
    objective:
      "Moteur IDS/IPS haute performance pour detection reseau, inspection protocolaire et production d'evenements structures EVE JSON.",
    technologies: ['Suricata', 'IDS/IPS', 'EVE JSON', 'Lua'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 5 985 stars, 1 659 forks, 58 issues ouvertes.',
    link: 'https://github.com/OISF/suricata',
    takeaways: [
      'Pilier reseau pour detecter TTPs et comportements anormaux en perimetre.',
      'S integre nativement avec SIEM et plateformes NSM.',
      'Tres pertinent pour la detection precoce des chaines d intrusion.',
    ],
  },
  {
    id: 'p7',
    title: 'MITRE CALDERA (Adversary Emulation)',
    context: 'Adversary Simulation',
    objective:
      'Plateforme de simulation d attaques basee ATT&CK pour valider les controles defensifs, tester les detections et mesurer la couverture SOC.',
    technologies: ['MITRE CALDERA', 'ATT&CK', 'Python', 'Agents'],
    result:
      'Donnees verifiables (GitHub, 06/02/2026) : 6 729 stars, 1 282 forks, 62 issues ouvertes.',
    link: 'https://github.com/mitre/caldera',
    takeaways: [
      'Permet des exercices repetables pour verifier la detection et la reponse.',
      'Utile pour identifier les trous de couverture ATT&CK prioritaires.',
      'Excellent support pour une demarche purple team orientee preuves.',
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'log-001',
    slug: 'post-mortem-phishing-2025',
    title: 'Analyse Post-Mortem : Campagne de Phishing 2025',
    excerpt:
      "Retour d'expérience sur la campagne de phishing ciblant le secteur financier. TTPs, indicateurs de compromission et contre-mesures.",
    date: '12 Oct 2025',
    publishedDate: '2025-10-12',
    updatedDate: '2025-10-14',
    readTime: '5 min',
    category: 'Incident',
    tags: ['phishing', 'post-mortem', 'blue team', 'email security'],
    content: [
      "Cette campagne a ciblé des équipes finance et RH avec des emails imitant des workflows de validation interne. Les messages combinaient urgence opérationnelle et pièces jointes pseudo-administratives pour pousser l'utilisateur à agir rapidement.",
      "L'analyse des en-têtes montre des chaînes de relais incohérentes, des domaines proches du domaine légitime et des tentatives répétées de contournement DMARC via des sous-domaines peu surveillés. Le scénario principal reposait sur la collecte d'identifiants puis la persistance via règles de boîte mail.",
      'Côté détection, les signaux les plus utiles ont été la corrélation entre clic sur URL suspecte, authentification atypique dans la même fenêtre temporelle et création de règles de transfert externes. Les alertes isolées étaient faibles, mais la corrélation multi-sources a donné une forte confiance.',
      'Les contre-mesures priorisées: durcissement anti-phishing des passerelles mail, blocage automatique des règles de forwarding externes, contrôle MFA renforcé sur populations sensibles et simulation ciblée trimestrielle pour les métiers les plus exposés.',
    ],
  },
  {
    id: 'log-002',
    slug: 'checklist-triage-soc-15-min',
    title: 'Checklist de triage SOC: 15 minutes pour qualifier une alerte',
    excerpt:
      "Méthode opérationnelle pour passer d'une alerte brute à une décision claire: faux positif, surveillance renforcée ou escalation.",
    date: '06 Nov 2025',
    publishedDate: '2025-11-06',
    updatedDate: '2025-11-06',
    readTime: '6 min',
    category: 'SOC',
    tags: ['soc', 'triage', 'incident response', 'playbook'],
    content: [
      "L'objectif d'un triage court est de produire une décision exploitable, pas une investigation complète. En 15 minutes, l'analyste doit répondre à trois questions: l'alerte est-elle crédible, le périmètre est-il limité, et faut-il escalader immédiatement.",
      'La première phase consiste à valider le contexte minimal: hôte, compte, horodatage, source de détection, et historique des événements proches. Une alerte isolée sans contexte fiable doit être enrichie avant toute conclusion.',
      "La deuxième phase consiste à chercher les pivots rapides: répétition sur d'autres actifs, alignement avec un IOC connu, activité anormale du compte dans la même période. Cette étape transforme une alerte brute en hypothèse opérationnelle.",
      "La troisième phase est la décision: clôture motivée (faux positif), surveillance active avec seuil explicite, ou escalation vers investigation approfondie. Cette discipline réduit le bruit et protège la capacité d'analyse sur les vrais incidents.",
    ],
  },
  {
    id: 'log-003',
    slug: 'nis2-par-ou-commencer-petite-equipe',
    title: "NIS2 en pratique: par où commencer quand l'équipe est petite",
    excerpt:
      "Plan en 90 jours pour structurer gouvernance, gestion de risque et notification incident sans immobiliser l'exploitation.",
    date: '02 Dec 2025',
    publishedDate: '2025-12-02',
    updatedDate: '2025-12-10',
    readTime: '7 min',
    category: 'Gouvernance',
    tags: ['nis2', 'gouvernance', 'conformite', 'roadmap'],
    content: [
      'Pour une petite équipe sécurité, le piège classique est de vouloir tout traiter en parallèle. La bonne approche NIS2 est de séquencer: inventaire des services essentiels, responsabilités claires, puis mesures minimales pilotées par le risque.',
      "La première brique en 30 jours est la cartographie: actifs critiques, dépendances tierces, propriétaires métier et seuils d'impact. Sans cette base, il est impossible de prioriser patching, journalisation et réponse incident.",
      'La deuxième brique est opérationnelle: MFA sur accès sensibles, procédure de gestion des vulnérabilités, sauvegardes vérifiées, et canal de notification incident. Ces mesures apportent de la conformité utile, pas uniquement documentaire.',
      "La troisième brique est la preuve: journal de décision, traces d'exercices, revue périodique des écarts. C'est cette capacité à démontrer l'amélioration continue qui rend la démarche crédible face aux obligations NIS2.",
    ],
  },
  {
    id: 'log-004',
    slug: 'mfa-fatigue-signaux-precoces',
    title: 'MFA fatigue: indicateurs précoces avant compromission',
    excerpt:
      'Signaux faibles à surveiller côté IAM et authentification pour détecter la pression MFA avant la prise de compte.',
    date: '14 Jan 2026',
    publishedDate: '2026-01-14',
    updatedDate: '2026-01-20',
    readTime: '5 min',
    category: 'Identity',
    tags: ['identity', 'mfa', 'detection', 'account takeover'],
    content: [
      'Les attaques par MFA fatigue reposent rarement sur un seul événement. Elles produisent une séquence: rafale de prompts, tentatives sur des horaires atypiques, puis connexion validée depuis un contexte inhabituel.',
      "Le signal clé n'est pas uniquement le volume de refus MFA, mais la combinaison avec les événements de pré-authentification et les changements de posture du compte: nouveaux appareils, nouveaux user-agents, géolocalisations incohérentes.",
      "Une détection efficace associe des règles simples: seuil d'échecs MFA par fenêtre courte, corrélation avec impossible travel, et alerte renforcée si le compte possède des privilèges sensibles ou des accès à des systèmes critiques.",
      "Les actions défensives immédiates sont connues: number matching obligatoire, limitation des canaux MFA faibles, réduction de durée de session et procédure standardisée de reset de facteurs d'authentification en cas de suspicion.",
    ],
  },
];
