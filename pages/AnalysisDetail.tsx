import React from 'react';
import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import { Badge, TechSeparator, Button, type BadgeColor } from '../components/UI';
import { analyses, playbooks } from '../data';
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

const AnalysisDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
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
        keywords={[...analysis.tags, analysis.category, analysis.level]}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
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
            <ArrowLeft size={14} className="mr-2" /> Retour à la bibliothèque
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge color="steel" className="bg-white/10 text-white border-white/20">
              {analysis.category}
            </Badge>
            <span className="text-brand-light font-mono text-xs py-1">
              Publie : {analysis.publishedDate} | Maj :{' '}
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
                  Sommaire
                </h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    <a href="#kpis" className="hover:text-brand-steel flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> Chiffres cles
                    </a>
                  </li>
                  <li>
                    <a href="#contexte" className="hover:text-brand-steel flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> Contexte
                    </a>
                  </li>
                  <li>
                    <a
                      href="#attack-chain"
                      className="hover:text-brand-steel flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> Chaine attaque
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
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> Detections
                    </a>
                  </li>
                  <li>
                    <a
                      href="#remediation"
                      className="hover:text-brand-steel flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div> Remediation
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
                <BarChart3 className="text-brand-steel" /> Chiffres cles
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
                      Source: {metric.source}
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
                <Activity className="text-brand-steel" /> Contexte
              </h2>
              <p className="text-slate-700 leading-relaxed">{analysis.expertFormat.context}</p>
            </section>

            <section id="attack-chain">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                <ArrowRight className="text-brand-steel" /> Chaine d attaque
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
                <AlertTriangle className="text-brand-steel" /> IOCs prioritaires
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
                        Indicator
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
                <BarChart3 className="text-brand-steel" /> Detections (Sigma / KQL)
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
                Remediation priorisee
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
              <h2 className="text-xl font-display font-bold text-brand-navy mb-4">Limites</h2>
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
                  <Activity size={16} className="text-brand-steel" /> Signaux a surveiller
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
                Diagnostic Rapide
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
                  Contacter l'équipe
                </Button>
              </Link>
            </div>

            {/* CHECKLIST */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
              <h3 className="font-display font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <ListChecks size={16} /> Checklist Ops
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
                  Playbooks lies
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
                          {playbook.severity}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge color="mono">{playbook.category}</Badge>
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
                Guide pilier associe
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Suivez le parcours long format pour structurer un plan defensif complet.
              </p>
              <Link
                to={localizedPath(`/guides/${relatedGuideSlug}`)}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel hover:text-brand-navy"
              >
                Ouvrir le guide <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* PAGES REF */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-center">
              <span className="text-xs text-slate-400 font-mono block mb-2">
                PAGES CLÉS DU RAPPORT
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
