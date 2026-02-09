export interface Citation {
  text: string;
  source: string; // ex: "p.23 - Extrait..."
  url?: string;
}

export interface AnalysisMetric {
  label: string;
  value: string;
  benchmark?: string;
  source: string;
  insight: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
}

export interface IndicatorOfCompromise {
  type: 'IP' | 'Domain' | 'URL' | 'Hash' | 'Email' | 'UserAgent' | 'Registry' | 'Process';
  value: string;
  note?: string;
}

export interface DetectionRule {
  title: string;
  platform: 'Sigma' | 'KQL';
  query: string;
  rationale?: string;
}

export interface AnalysisExpertFormat {
  context: string;
  attackChain: string[];
  mitreMapping: MitreTechnique[];
  iocs: IndicatorOfCompromise[];
  detections: DetectionRule[];
  remediation: string[];
  limits: string[];
}

export interface Analysis {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category:
    | 'Stratégique'
    | 'Opérationnel'
    | 'Conformité'
    | 'Risque Émergent'
    | 'Identity'
    | 'Infrastructure'
    | 'Cloud';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Stratégique';
  date: string;
  publishedDate: string; // ISO-8601 date (YYYY-MM-DD)
  updatedDate?: string; // ISO-8601 date (YYYY-MM-DD)
  readTime: string;
  tags: string[];
  ogImage?: string;

  // Structure stricte basée sur le rapport
  keyMetrics: AnalysisMetric[];
  constats: Citation[];
  painPoints: string[];
  recommendations: string[];
  proofs: Citation[];
  threatSignals: string[];
  discoveryQuestions: string[];
  checklist: string[];
  expertFormat: AnalysisExpertFormat;
  linkedPlaybooks?: string[]; // IDs of related playbooks
  navigatorPages: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'Investigation' | 'Reporting' | 'Triage' | 'Hardening';
  status: 'Démo Live' | 'Prototype' | 'Production';
  features: string[];
}

export interface Software {
  id: string;
  name: string;
  vendor?: string;
  category: string; // ex: SIEM, Network, DFIR...
  description: string;
  useCases: string[];
  platforms: ('Windows' | 'Linux' | 'macOS' | 'Web')[];
  license: 'Open Source' | 'Free' | 'Paid' | 'Freemium';
  logoPath?: string;
  officialUrl: string;
  repoUrl?: string;
  tags?: string[];
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  context: string;
  objective: string;
  technologies: string[];
  result: string;
  link?: string;
  takeaways?: string[];
}

// Structure détaillée pour un playbook opérationnel
export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  command?: string; // Commande CLI optionnelle (PowerShell, Bash, KQL)
  warning?: string; // Mise en garde critique
}

export interface MessageTemplate {
  audience: 'IT / Ops' | 'Management' | 'Utilisateurs' | 'Externe' | 'Fournisseur';
  subject: string;
  body: string;
}

export interface PlaybookOperationalBrief {
  context: string;
  objective: string;
  businessRisk: string;
  keyChecks: string[];
  escalationSignals: string[];
  handoffTo: string[];
}

export interface Playbook {
  id: string;
  title: string;
  description: string; // Description courte
  category:
    | 'Réponse Incident'
    | 'Investigation'
    | 'Forensics'
    | 'Hardening'
    | 'Audit'
    | 'Gouvernance';
  severity: 'Critique' | 'Élevée' | 'Moyenne' | 'Faible';
  pages: number; // Gardé pour legacy, mais moins pertinent
  format: string; // Gardé pour legacy

  // Nouveau contenu riche
  triggers: string[]; // Quand déclencher ce playbook
  prerequisites: string[]; // Outils/Accès nécessaires
  steps: PlaybookStep[]; // Les étapes concrètes
  artifacts: string[]; // Ce qu'il faut collecter
  messageTemplates?: MessageTemplate[]; // Templates de communication
  definitionOfDone: string[]; // Quand fermer l'incident
  operationalBrief?: PlaybookOperationalBrief;
  estimatedTime?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Difficile' | 'Expert' | 'Stratégique';
}

export interface TemplateVariable {
  key: string; // ex: "company_name"
  label: string; // ex: "Nom de l'entreprise"
  example: string; // ex: "ACME SA"
  required?: boolean;
  type?: 'text' | 'textarea' | 'date' | 'email' | 'url' | 'number';
}

export interface TemplateReference {
  name: string; // ex: "NIST SP 800-61 r2"
  note?: string; // ex: "Checklist IR"
  url?: string;
}

export type TemplateCategory =
  | 'Incident Response'
  | 'Communication'
  | 'Policy'
  | 'GRC'
  | 'Vendor'
  | 'Compliance'
  | 'Technical';

export type TemplateAudience =
  | 'IT / Ops'
  | 'SOC / CERT'
  | 'Management'
  | 'Juridique'
  | 'RH'
  | 'Utilisateurs'
  | 'Clients'
  | 'Fournisseur'
  | 'Externe';

export type TemplatePriority = 'Critique' | 'Élevée' | 'Moyenne' | 'Faible';

export interface CyberTemplate {
  id: string; // tpl-001...
  title: string;
  description: string;
  category: TemplateCategory;
  priority: TemplatePriority;
  audiences: TemplateAudience[];
  tags: string[];
  regulations?: string[];
  variables: TemplateVariable[];
  content: string; // Markdown avec placeholders {{var}}
  references?: TemplateReference[];
  updatedAt: string; // ISO date (YYYY-MM-DD)
  disclaimers?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  publishedDate: string; // ISO-8601 date (YYYY-MM-DD)
  updatedDate?: string; // ISO-8601 date (YYYY-MM-DD)
  readTime: string;
  category: string;
  tags: string[];
  content: string[];
}
