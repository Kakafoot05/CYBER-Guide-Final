import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Handshake,
  ShieldCheck,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import { BlueprintPanel, Button, ShieldHeader, TechSeparator } from '../components/UI';
import { Seo } from '../components/Seo';
import { getLocalizedContent } from '../utils/contentLocale';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';

const About: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const { analyses, guides, templates, projects } = getLocalizedContent(locale);

  const copy = isEnglish
    ? {
        seoTitle: 'About Cyber Guide',
        seoDescription:
          'Mission, method, and community approach behind Cyber Guide operational cybersecurity content.',
        seoKeywords: ['cyber guide', 'about', 'operational cybersecurity', 'cyber method'],
        schemaName: 'About Cyber Guide',
        headerTitle: 'About Cyber Guide',
        headerSubtitle: 'Mission',
        headerMeta: ['Practical', 'Community', 'Source-based'],
        introLabel: 'WHY CYBER GUIDE',
        introTitle: 'A practical cybersecurity guide built for field decisions.',
        introBody:
          'Cyber Guide helps teams move from uncertainty to action with clear analyses, usable templates, and documented project cases.',
        introBodySecondary:
          'The goal is to make reliable cybersecurity knowledge easier to apply in real operational contexts.',
        openAnalyses: 'Open analyses',
        openTemplates: 'Open templates',
        pillarsTitle: 'Editorial pillars',
        pillars: [
          {
            title: 'Verified sources',
            body: 'No weak sourcing. Priority to institutional and technical primary references.',
          },
          {
            title: 'Operational framing',
            body: 'Every piece is shaped for decisions: context, impact, actions, expected result.',
          },
          {
            title: 'Reusable delivery',
            body: 'Designed to be reused in runbooks, meetings, and incident communication.',
          },
        ],
        statsTitle: 'Live library snapshot',
        stats: [
          { label: 'Analyses', value: analyses.length },
          { label: 'Templates', value: templates.length },
          { label: 'Guides', value: guides.length },
          { label: 'Case studies', value: projects.length },
        ],
        methodTitle: 'How we build content',
        methodSteps: [
          {
            title: 'Collect trusted sources',
            body: 'Official institutions, standards, and verified vendor documentation.',
          },
          {
            title: 'Translate into operations',
            body: 'Concrete structure: context, risks, actions, and expected outcomes.',
          },
          {
            title: 'Keep it actionable',
            body: 'Fast reading, clear decisions, and material that can be reused by teams.',
          },
        ],
        valueTitle: 'What this gives your team',
        audienceTitle: 'Who this is for',
        audienceCards: [
          {
            title: 'SOC / IR teams',
            body: 'Faster triage and cleaner escalation with ready-to-use structures.',
          },
          {
            title: 'IT and management',
            body: 'A shared decision framework for priorities, risks, and communication.',
          },
          {
            title: 'Project leaders',
            body: 'Documented cases to benchmark security programs and implementation choices.',
          },
        ],
        valueCards: [
          {
            title: 'Faster prioritization',
            body: 'Focus on what matters first, with less noise and more clarity.',
          },
          {
            title: 'Stronger execution',
            body: 'Operational templates and workflows that support real incident handling.',
          },
          {
            title: 'Shared language',
            body: 'Clear framing for IT, management, and security teams to align decisions.',
          },
        ],
        communityTitle: 'Community contribution',
        communityBody:
          'If you have a strong project case with measurable impact and reliable sources, submit it. The best cases can be highlighted on Cyber Guide.',
        communityCta: 'Submit a project case',
        notePrefix: 'NOTE:',
        noteBody:
          'Cyber Guide provides operational information. Validate decisions against your internal governance, legal constraints, and business context.',
      }
    : {
        seoTitle: 'À propos de Cyber Guide',
        seoDescription:
          'Mission, méthode et approche communautaire de Cyber Guide pour la cybersécurité opérationnelle.',
        seoKeywords: ['cyber guide', 'à propos', 'cybersécurité opérationnelle', 'méthode cyber'],
        schemaName: 'À propos Cyber Guide',
        headerTitle: 'À propos de Cyber Guide',
        headerSubtitle: 'Mission',
        headerMeta: ['Pratique', 'Communautaire', 'Sourcé'],
        introLabel: 'POURQUOI CYBER GUIDE',
        introTitle: 'Un guide cybersécurité pratique pour décider sur le terrain.',
        introBody:
          "Cyber Guide aide les équipes à passer de l'incertitude à l'action avec des analyses claires, des templates utilisables et des études de cas documentées.",
        introBodySecondary:
          "L'objectif est de rendre la connaissance cyber fiable plus simple à appliquer dans des contextes opérationnels réels.",
        openAnalyses: 'Ouvrir les analyses',
        openTemplates: 'Ouvrir les templates',
        pillarsTitle: 'Piliers éditoriaux',
        pillars: [
          {
            title: 'Sources vérifiées',
            body: 'Pas de sourcing faible. Priorité aux références institutionnelles et techniques primaires.',
          },
          {
            title: 'Cadrage opérationnel',
            body: 'Chaque contenu est structuré pour décider : contexte, impact, actions, résultat attendu.',
          },
          {
            title: 'Livrables réutilisables',
            body: 'Pensé pour être repris dans les runbooks, comités et communications incident.',
          },
        ],
        statsTitle: 'Vue rapide de la bibliothèque',
        stats: [
          { label: 'Analyses', value: analyses.length },
          { label: 'Templates', value: templates.length },
          { label: 'Guides', value: guides.length },
          { label: 'Études de cas', value: projects.length },
        ],
        methodTitle: 'Comment le contenu est construit',
        methodSteps: [
          {
            title: 'Collecte de sources fiables',
            body: 'Institutions officielles, standards, et documentation éditeur vérifiée.',
          },
          {
            title: 'Traduction en opérationnel',
            body: "Structure concrète: contexte, risques, actions, et résultats attendus.",
          },
          {
            title: 'Orientation action',
            body: 'Lecture rapide, décisions claires et matière réutilisable par les équipes.',
          },
        ],
        valueTitle: "Ce que cela apporte à l'équipe",
        audienceTitle: 'Pour qui',
        audienceCards: [
          {
            title: 'Équipes SOC / IR',
            body: "Un triage plus rapide et une escalade plus propre avec des structures prêtes à l'emploi.",
          },
          {
            title: 'IT et management',
            body: 'Un cadre commun pour prioriser les risques et aligner les décisions.',
          },
          {
            title: 'Responsables projet',
            body: 'Des cas documentés pour comparer les programmes sécurité et les choix de mise en œuvre.',
          },
        ],
        valueCards: [
          {
            title: 'Priorisation plus rapide',
            body: 'Se concentrer sur les sujets qui comptent, avec moins de bruit.',
          },
          {
            title: 'Exécution plus solide',
            body: "Des templates et workflows qui soutiennent la gestion d'incident réelle.",
          },
          {
            title: 'Langage partagé',
            body: 'Un cadre commun pour aligner IT, management et sécurité.',
          },
        ],
        communityTitle: 'Contribution communautaire',
        communityBody:
          "Si vous avez un cas projet solide avec impact mesurable et sources fiables, proposez-le. Les meilleurs cas peuvent être mis en avant sur Cyber Guide.",
        communityCta: 'Proposer une étude de cas',
        notePrefix: 'NOTE:',
        noteBody:
          'Cyber Guide fournit une information opérationnelle. Validez chaque décision selon votre gouvernance interne, vos contraintes légales et votre contexte métier.',
      };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-pale/35 via-brand-pale/10 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-steel/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-brand-light/10 blur-3xl" />
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/a-propos"
        image="/assets/og/about.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: copy.schemaName,
          url: 'https://cyber-guide.fr/a-propos',
        }}
      />

      <ShieldHeader title={copy.headerTitle} subtitle={copy.headerSubtitle} meta={copy.headerMeta} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <BlueprintPanel label={copy.introLabel} className="h-full">
            <h2 className="text-3xl font-display font-bold text-brand-navy">{copy.introTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">{copy.introBody}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.introBodySecondary}</p>

            <div className="mt-6">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.26em] text-brand-steel">
                {copy.pillarsTitle}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {copy.pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-sm border border-brand-steel/20 bg-brand-pale/30 p-3 shadow-sm"
                  >
                    <div className="text-xs font-display font-bold text-brand-navy">{pillar.title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={localizedPath('/analyses')}>
                <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                  {copy.openAnalyses}
                </Button>
              </Link>
              <Link to={localizedPath('/templates')}>
                <Button as="span" variant="outline" size="sm" icon={ArrowRight}>
                  {copy.openTemplates}
                </Button>
              </Link>
            </div>
          </BlueprintPanel>

          <BlueprintPanel title={copy.statsTitle} label="LIVE_DATA" className="h-full">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {copy.stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-2xl font-display font-bold text-brand-navy">{item.value}</div>
                </div>
              ))}
            </div>
          </BlueprintPanel>
        </section>

        <TechSeparator />

        <section className="my-12 rounded-sm border border-slate-200 bg-white/85 p-6 shadow-panel backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-steel" />
            <h3 className="text-xl font-display font-bold text-brand-navy">{copy.audienceTitle}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[ShieldCheck, Building2, Handshake].map((Icon, index) => {
              const audience = copy.audienceCards[index];
              return (
                <div
                  key={audience.title}
                  className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-brand-pale text-brand-navy">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-lg font-display font-bold text-brand-navy">{audience.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{audience.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="my-12">
          <div className="mb-6 flex items-center gap-2">
            <Workflow size={18} className="text-brand-steel" />
            <h3 className="text-xl font-display font-bold text-brand-navy">{copy.methodTitle}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.methodSteps.map((step, index) => (
              <div key={step.title} className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-pale text-xs font-bold text-brand-navy">
                  {index + 1}
                </div>
                <h4 className="text-lg font-display font-bold text-brand-navy">{step.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-12">
          <div className="mb-6 flex items-center gap-2">
            <Target size={18} className="text-brand-steel" />
            <h3 className="text-xl font-display font-bold text-brand-navy">{copy.valueTitle}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[Database, CheckCircle2, Users].map((Icon, index) => {
              const card = copy.valueCards[index];
              return (
                <div key={card.title} className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-brand-pale text-brand-navy">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-lg font-display font-bold text-brand-navy">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="my-12 rounded-sm border border-brand-steel/35 bg-gradient-to-br from-brand-pale/45 via-white to-slate-50 p-6 shadow-panel">
          <h3 className="text-2xl font-display font-bold text-brand-navy">{copy.communityTitle}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-700">{copy.communityBody}</p>
          <div className="mt-5">
            <Link to={localizedPath('/contact?topic=project')}>
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                {copy.communityCta}
              </Button>
            </Link>
          </div>
        </section>

        <div className="rounded-sm border border-slate-200 bg-slate-100 p-5 text-xs leading-relaxed text-slate-600">
          <strong>{copy.notePrefix}</strong> {copy.noteBody}
        </div>
      </div>
    </div>
  );
};

export default About;
