import React from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, HelpCircle, Link2 } from 'lucide-react';
import { Button, ShieldHeader, TechSeparator } from '../components/UI';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import { getLocalizedContent } from '../utils/contentLocale';

const GuideDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { analyses, playbooks, guides } = React.useMemo(() => getLocalizedContent(locale), [locale]);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const guide = guides.find((item) => item.slug === (slug ?? ''));

  const copy = isEnglish
    ? {
        breadcrumbHome: 'Home',
        breadcrumbGuides: 'Guides',
        guideSubtitle: 'Pillar Guide',
        updatedMeta: 'UPDATED',
        backToGuides: 'Back to guides',
        overview: 'Overview',
        actionableChecklist: 'Actionable checklist',
        operationalFaq: 'Operational FAQ',
        applyTitle: 'Apply this guide in practice',
        applyBody:
          'Use linked analyses and playbooks to convert this framework into a concrete execution plan.',
        openAnalyses: 'Open analyses',
        openPlaybooks: 'Open playbooks',
        tableOfContents: 'Table of contents',
        linkedAnalyses: 'Linked analyses',
        linkedPlaybooks: 'Linked playbooks',
        usefulLinks: 'Useful links',
      }
    : {
        breadcrumbHome: 'Accueil',
        breadcrumbGuides: 'Guides',
        guideSubtitle: 'Guide Pilier',
        updatedMeta: 'MÀJ',
        backToGuides: 'Retour aux guides',
        overview: "Vue d'ensemble",
        actionableChecklist: 'Checklist actionnable',
        operationalFaq: 'FAQ opérationnelle',
        applyTitle: 'Appliquer ce guide en pratique',
        applyBody:
          "Utilisez les analyses et playbooks liés pour convertir ce cadre en plan d'exécution concret.",
        openAnalyses: 'Ouvrir les analyses',
        openPlaybooks: 'Ouvrir les playbooks',
        tableOfContents: 'Sommaire',
        linkedAnalyses: 'Analyses liées',
        linkedPlaybooks: 'Playbooks liés',
        usefulLinks: 'Liens utiles',
      };

  if (!guide) {
    return <Navigate to={localizedPath('/guides')} replace />;
  }

  const relatedAnalyses = analyses.filter((analysis) =>
    guide.relatedAnalyses.includes(analysis.slug),
  );
  const relatedPlaybooks = playbooks.filter((playbook) =>
    guide.relatedPlaybooks.includes(playbook.id),
  );
  const guideUrl = `https://cyber-guide.fr/guides/${guide.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Seo
        title={guide.title}
        description={guide.excerpt}
        path={`/guides/${guide.slug}`}
        image="/assets/og/guide-detail.svg"
        type="article"
        publishedTime={guide.updatedDate}
        modifiedTime={guide.updatedDate}
        keywords={guide.keywords}
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
                name: copy.breadcrumbGuides,
                item: 'https://cyber-guide.fr/guides',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: guide.title,
                item: guideUrl,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: guide.title,
            description: guide.excerpt,
            url: guideUrl,
            datePublished: guide.updatedDate,
            dateModified: guide.updatedDate,
            author: {
              '@type': 'Organization',
              name: 'Cyber Guide',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: guide.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]}
      />

      <ShieldHeader
        title={guide.title}
        subtitle={copy.guideSubtitle}
        meta={[guide.category, `${copy.updatedMeta} ${guide.updatedDate}`, guide.readTime]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to={localizedPath('/guides')}
          className="mb-8 inline-flex items-center text-xs font-mono uppercase tracking-widest text-slate-500 transition-colors hover:text-brand-steel"
        >
          <ArrowLeft size={13} className="mr-2" /> {copy.backToGuides}
        </Link>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="rounded-sm border border-slate-200 bg-white p-7 shadow-panel">
              <h1 className="mb-4 text-2xl font-display font-bold text-brand-navy">{copy.overview}</h1>
              <p className="text-sm leading-relaxed text-slate-700">{guide.intro}</p>
            </section>

            {guide.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-sm border border-slate-200 bg-white p-7 shadow-panel"
              >
                <h2 className="mb-4 text-xl font-display font-bold text-brand-navy">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.checklist && section.checklist.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                      <CheckCircle2 size={14} className="text-brand-steel" />
                      {copy.actionableChecklist}
                    </h3>
                    <ul className="space-y-2">
                      {section.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand-steel" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}

            <section className="rounded-sm border border-slate-200 bg-white p-7 shadow-panel">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-display font-bold text-brand-navy">
                <HelpCircle size={20} className="text-brand-steel" />
                {copy.operationalFaq}
              </h2>
              <div className="space-y-5">
                {guide.faq.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-sm border border-slate-100 bg-slate-50 p-4"
                  >
                    <h3 className="mb-2 text-sm font-bold text-brand-navy">{item.question}</h3>
                    <p className="text-sm text-slate-700">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <TechSeparator />

            <section className="rounded-sm border border-brand-steel/20 bg-brand-pale/35 p-7">
              <h2 className="mb-3 text-lg font-display font-bold text-brand-navy">{copy.applyTitle}</h2>
              <p className="mb-5 text-sm text-slate-700">{copy.applyBody}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={localizedPath('/analyses')}>
                  <Button as="span" variant="primary" size="sm" icon={ArrowRight}>
                    {copy.openAnalyses}
                  </Button>
                </Link>
                <Link to={localizedPath('/playbooks')}>
                  <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                    {copy.openPlaybooks}
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-navy">
                  {copy.tableOfContents}
                </h2>
                <ul className="space-y-2 text-sm">
                  {guide.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        className="text-slate-600 transition-colors hover:text-brand-steel"
                        href={`#${section.id}`}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                  <BookOpen size={14} className="text-brand-steel" />
                  {copy.linkedAnalyses}
                </h2>
                <div className="space-y-2">
                  {relatedAnalyses.map((analysis) => (
                    <Link
                      key={analysis.slug}
                      to={localizedPath(`/analyses/${analysis.slug}`)}
                      className="block rounded-sm border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand-steel/40 hover:text-brand-navy"
                    >
                      {analysis.title}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                  <BookOpen size={14} className="text-brand-steel" />
                  {copy.linkedPlaybooks}
                </h2>
                <div className="space-y-2">
                  {relatedPlaybooks.map((playbook) => (
                    <Link
                      key={playbook.id}
                      to={localizedPath(`/playbooks/${playbook.id}`)}
                      className="block rounded-sm border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand-steel/40 hover:text-brand-navy"
                    >
                      {playbook.title}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
                  <Link2 size={14} className="text-brand-steel" />
                  {copy.usefulLinks}
                </h2>
                <div className="space-y-2">
                  {guide.relatedLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={localizedPath(item.path)}
                      className="block rounded-sm border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand-steel/40 hover:text-brand-navy"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GuideDetail;
