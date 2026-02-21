import React from 'react';
import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import { Badge, TechSeparator, Button, type BadgeColor } from '../components/UI';
import { getLocalizedContent } from '../utils/contentLocale';
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  BarChart3,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import {
  localizeAnalysisCategory,
  localizeAnalysisLevel,
  localizePlaybookCategory,
  localizePlaybookSeverity,
} from '../utils/labels';

const AnalysisDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { analyses, playbooks } = React.useMemo(() => getLocalizedContent(locale), [locale]);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const copy = isEnglish
    ? {
        breadcrumbHome: 'Home',
        backToLibrary: 'Back to library',
        published: 'Published',
        updated: 'Updated',
        summary: 'Summary',
        keyFigures: 'Key figures',
        context: 'Context',
        attackChain: 'Attack chain',
        detections: 'Detections',
        remediation: 'Remediation',
        source: 'Source',
        prioritizedIocs: 'Priority IOCs',
        indicator: 'Indicator',
        prioritizedRemediation: 'Prioritized remediation',
        limits: 'Limits',
        watchSignals: 'Signals to watch',
        quickDiagnosis: 'Quick diagnosis',
        contactTeam: 'Contact team',
        opsChecklist: 'Ops checklist',
        linkedPlaybooks: 'Linked playbooks',
        linkedGuide: 'Related pillar guide',
        linkedGuideBody: 'Follow the long-format path to structure a complete defensive plan.',
        openGuide: 'Open guide',
        reportKeyPages: 'REPORT KEY PAGES',
      }
    : {
        breadcrumbHome: 'Accueil',
        backToLibrary: 'Retour à la bibliothèque',
        published: 'Publié',
        updated: 'MàJ',
        summary: 'Sommaire',
        keyFigures: 'Chiffres clés',
        context: 'Contexte',
        attackChain: "Chaîne d'attaque",
        detections: 'Détections',
        remediation: 'Remédiation',
        source: 'Source',
        prioritizedIocs: 'IOCs prioritaires',
        indicator: 'Indicateur',
        prioritizedRemediation: 'Remédiation priorisée',
        limits: 'Limites',
        watchSignals: 'Signaux à surveiller',
        quickDiagnosis: 'Diagnostic rapide',
        contactTeam: "Contacter l'équipe",
        linkedPlaybooks: 'Playbooks liés',
        linkedGuide: 'Guide pilier associé',
        linkedGuideBody: 'Suivez le parcours long format pour structurer un plan défensif complet.',
        openGuide: 'Ouvrir le guide',
        reportKeyPages: 'PAGES CLÉS DU RAPPORT',
      };
  const analysis = analyses.find((a) => a.slug === slug);

  if (!analysis) {
    return <Navigate to={localizedPath('/analyses')} replace />;
  }

  const linkedPlaybooks = playbooks.filter((playbook) =>
    analysis.linkedPlaybooks?.includes(playbook.id),
  );

  const getPlaybookSeverityColor = (severity: string): BadgeColor => {
    const normalized = severity.toLowerCase();
    if (normalized.includes('crit')) return 'alert';
    if (normalized.includes('elev')) return 'gold';
    if (normalized.includes('moy')) return 'steel';
    return 'navy';
  };

  const relatedGuideSlug =
    analysis.slug.includes('ad') ||
    analysis.slug.includes('identite') ||
    analysis.slug.includes('mfa')
      ? 'securite-active-directory'
      : analysis.slug.includes('ransomware')
        ? 'reponse-ransomware-pme'
        : 'conformite-nis2-feuille-de-route';

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={analysis.title}
        description={analysis.subtitle}
        path={`/analyses/${analysis.slug}`}
        type="article"
        image={analysis.ogImage}
        publishedTime={analysis.publishedDate}
        modifiedTime={analysis.updatedDate ?? analysis.publishedDate}
        keywords={[
          ...analysis.tags,
          localizeAnalysisCategory(analysis.category, locale),
          localizeAnalysisLevel(analysis.level, locale),
        ]}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: copy.breadcrumbHome,
                item: 'https://cyber-guide.fr/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Analyses',
                item: 'https://cyber-guide.fr/analyses',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: analysis.title,
                item: `https://cyber-guide.fr/analyses/${analysis.slug}`,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: analysis.title,
            description: analysis.subtitle,
            keywords: analysis.tags.join(', '),
            datePublished: analysis.publishedDate,
            dateModified: analysis.updatedDate ?? analysis.publishedDate,
            author: {
              '@type': 'Organization',
              name: 'Cyber Guide',
            },
            url: `https://cyber-guide.fr/analyses/${analysis.slug}`,
          },
        ]}
      />
      <div className="bg-brand-navy text-white pt-24 pb-12 border-b border-brand-steel/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={localizedPath('/analyses')}
            className="inline-flex items-center text-brand-light/70 hover:text-white text-xs font-mono uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={14} className="mr-2" /> {copy.backToLibrary}
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge color="steel" className="bg-white/10 text-white border-white/20">
              {localizeAnalysisCategory(analysis.category, locale)}
            </Badge>
            <span className="text-brand-light font-mono text-xs py-1">
              {copy.published}: {analysis.publishedDate} | {copy.updated}:{' '}
              {analysis.updatedDate ?? analysis.publishedDate}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            {analysis.title}
          </h1>
          <p className="text-xl text-brand-pale font-light max-w-2xl">{analysis.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR - SUMMARY */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white p-4 shadow-sm border border-slate-200 rounded-sm">
                <h4 className="font-bold text-brand-navy uppercase text-xs tracking-widest mb-4 border-b border-slate-100 pb-2">
                  {copy.summary}
                </h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    <a href="#kpis" className="hover:text-brand-steel flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {copy.keyFigures}
                    </a>
                  </li>
                  <li>
                    <a href="#contexte" className="hover:text-brand-steel flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {copy.context}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#attack-chain"
                      className="hover:text-brand-steel flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {copy.attackChain}
                    </a>
                  </li>
                  <li>
                    <a href="#mitre" className="hover:text-brand-steel flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> MITRE ATT&CK
                    </a>
                  </li>
                  <li>
                    <a
                      href="#detections"
                      className="hover:text-brand-steel flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {copy.detections}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#remediation"
                      className="hover:text-brand-steel flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {copy.remediation}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-6 space-y-12 pt-8">
            {/* 1. KPI */}
            <section id="kpis">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <BarChart3 className="text-brand-steel" /> {copy.keyFigures}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.keyMetrics.map((metric) => (
                  <div
                    key={`${metric.label}-${metric.value}`}
                    className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm"
                  >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-3xl font-display font-bold text-brand-navy">
                      {metric.value}
                    </p>
                    {metric.benchmark && (
                      <p className="mt-1 text-xs font-mono text-brand-steel">{metric.benchmark}</p>
                    )}
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{metric.insight}</p>
                    <p className="mt-3 text-[10px] font-mono uppercase tracking-wide text-slate-400">
                      {copy.source}: {metric.source}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <TechSeparator />

            <section
              id="contexte"
              className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-4 flex items-center gap-3">
                <Activity className="text-brand-steel" /> {copy.context}
              </h2>
              <p className="text-slate-700 leading-relaxed">{analysis.expertFormat.context}</p>
            </section>

            <section id="attack-chain">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <ArrowRight className="text-brand-steel" /> {copy.attackChain}
              </h2>
              <div className="space-y-3">
                {analysis.expertFormat.attackChain.map((step, i) => (
                  <div
                    key={`${step}-${i}`}
                    className="rounded-sm border border-slate-200 bg-white p-4 flex items-start gap-3"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-pale text-xs font-bold text-brand-navy">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="mitre">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <ListChecks className="text-brand-steel" /> Mapping MITRE ATT&CK
              </h2>
              <div className="space-y-3">
                {analysis.expertFormat.mitreMapping.map((item) => (
                  <div
                    key={`${item.id}-${item.name}`}
                    className="grid gap-2 rounded-sm border border-slate-200 bg-white p-4 md:grid-cols-[110px_1fr_170px]"
                  >
                    <span className="text-xs font-mono text-brand-steel font-bold">{item.id}</span>
                    <span className="text-sm text-slate-700">{item.name}</span>
                    <span className="text-xs font-mono uppercase text-slate-500">
                      {item.tactic}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section id="iocs">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <AlertTriangle className="text-brand-steel" /> {copy.prioritizedIocs}
              </h2>
              <div className="space-y-3">
                {analysis.expertFormat.iocs.map((ioc, i) => (
                  <div
                    key={`${ioc.type}-${ioc.value}-${i}`}
                    className="rounded-sm border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Badge color="mono">{ioc.type}</Badge>
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                        {copy.indicator}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-brand-navy break-all">{ioc.value}</p>
                    {ioc.note && <p className="mt-2 text-sm text-slate-600">{ioc.note}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section id="detections">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <BarChart3 className="text-brand-steel" /> {copy.detections} (Sigma / KQL)
              </h2>
              <div className="space-y-4">
                {analysis.expertFormat.detections.map((detection, i) => (
                  <div
                    key={`${detection.title}-${i}`}
                    className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-brand-navy">{detection.title}</h3>
                      <Badge color={detection.platform === 'KQL' ? 'steel' : 'gold'}>
                        {detection.platform}
                      </Badge>
                    </div>
                    <pre className="overflow-x-auto rounded-sm border border-slate-100 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                      <code>{detection.query}</code>
                    </pre>
                    {detection.rationale && (
                      <p className="mt-3 text-sm text-slate-600">{detection.rationale}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section id="remediation">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">
                {copy.prioritizedRemediation}
              </h2>
              <div className="space-y-3">
                {analysis.expertFormat.remediation.map((item, i) => (
                  <div
                    key={`${item}-${i}`}
                    className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-sm"
                  >
                    <div className="mt-1 p-1 bg-emerald-50 text-emerald-600 rounded-full">
                      <CheckCircle size={16} />
                    </div>
                    <p className="text-slate-800 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="limites" className="rounded-sm border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-display font-bold text-brand-navy mb-4">{copy.limits}</h2>
              <ul className="space-y-3">
                {analysis.expertFormat.limits.map((limit, i) => (
                  <li
                    key={`${limit}-${i}`}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-alert" />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* RIGHT COLUMN - TOOLS */}
          <div className="lg:col-span-3 space-y-6 pt-8">
            {analysis.threatSignals.length > 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
                <h3 className="font-display font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-brand-steel" /> {copy.watchSignals}
                </h3>
                <ul className="space-y-3">
                  {analysis.threatSignals.map((signal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-brand-alert rounded-full flex-shrink-0"></div>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DIAGNOSTIC */}
            <div className="bg-brand-navy text-white p-6 rounded-sm shadow-lg">
              <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider">
                {copy.quickDiagnosis}
              </h3>
              <ul className="space-y-4 mb-6">
                {analysis.discoveryQuestions.slice(0, 3).map((q, i) => (
                  <li
                    key={i}
                    className="text-sm text-brand-pale border-b border-white/10 pb-3 last:border-0 leading-snug"
                  >
                    {q}
                  </li>
                ))}
              </ul>
              <Link to={localizedPath('/contact')}>
                <Button as="span" variant="tech" className="w-full justify-center">
                  {copy.contactTeam}
                </Button>
              </Link>
            </div>

            {/* CHECKLIST */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
              <h3 className="font-display font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <ListChecks size={16} /> {copy.opsChecklist}
              </h3>
              <ul className="space-y-3">
                {analysis.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-steel rounded-full flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {linkedPlaybooks.length > 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
                <h3 className="font-display font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider">
                  {copy.linkedPlaybooks}
                </h3>
                <div className="space-y-3">
                  {linkedPlaybooks.map((playbook) => (
                    <Link
                      key={playbook.id}
                      to={localizedPath(`/playbooks/${playbook.id}`)}
                      className="block rounded-sm border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-brand-steel/40 hover:text-brand-navy transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{playbook.title}</span>
                        <Badge color={getPlaybookSeverityColor(playbook.severity)}>
                          {localizePlaybookSeverity(playbook.severity, locale)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge color="mono">
                          {localizePlaybookCategory(playbook.category, locale)}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                          {playbook.id}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-brand-pale/30 border border-brand-steel/20 p-6 rounded-sm shadow-sm">
              <h3 className="font-display font-bold text-brand-navy mb-2 text-sm uppercase tracking-wider">
                {copy.linkedGuide}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {copy.linkedGuideBody}
              </p>
              <Link
                to={localizedPath(`/guides/${relatedGuideSlug}`)}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel hover:text-brand-navy"
              >
                {copy.openGuide} <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* PAGES REF */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-center">
              <span className="text-xs text-slate-400 font-mono block mb-2">
                {copy.reportKeyPages}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {analysis.navigatorPages.map((page) => (
                  <span
                    key={page}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-sm text-xs font-mono text-slate-600 font-bold"
                  >
                    {page}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;
