import React from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock3, Link2, ListChecks, Tag } from 'lucide-react';
import { Seo } from '../components/Seo';
import { Badge, Button, TechSeparator } from '../components/UI';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import { getLocalizedContent } from '../utils/contentLocale';
import { getJournalEntryMeta } from '../utils/journalMeta';
import { localizeBlogCategory } from '../utils/labels';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { blogPosts, analyses, templates, playbooks } = React.useMemo(
    () => getLocalizedContent(locale),
    [locale],
  );
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return <Navigate to={localizedPath('/blog')} replace />;
  }

  const articleUrl = `https://cyber-guide.fr/blog/${post.slug}`;
  const copy = isEnglish
    ? {
        breadcrumbHome: 'Home',
        breadcrumbJournal: 'Journal',
        backToBlog: 'Back to journal',
        lastUpdate: 'Last update',
        openGuides: 'Open related guides',
        operationalGoal: 'Operational goal',
        immediateActions: 'Immediate actions',
        relatedResources: 'Related resources',
        relatedAnalyses: 'Related analyses',
        relatedTemplates: 'Related templates',
        relatedPlaybooks: 'Related playbooks',
        noRelatedResources: 'No linked operational resource for this note.',
      }
    : {
        breadcrumbHome: 'Accueil',
        breadcrumbJournal: 'Journal',
        backToBlog: 'Retour au journal',
        lastUpdate: 'Dernière mise à jour',
        openGuides: 'Ouvrir les guides liés',
        operationalGoal: 'But opérationnel',
        immediateActions: 'Actions immédiates',
        relatedResources: 'Ressources associées',
        relatedAnalyses: 'Analyses liées',
        relatedTemplates: 'Templates liés',
        relatedPlaybooks: 'Playbooks liés',
        noRelatedResources: 'Aucune ressource opérationnelle liée pour cette note.',
      };
  const journalMeta = getJournalEntryMeta(post.slug, locale);
  const analysesBySlug = new Map(analyses.map((analysis) => [analysis.slug, analysis]));
  const templatesById = new Map(templates.map((template) => [template.id.toLowerCase(), template]));
  const playbooksById = new Map(playbooks.map((playbook) => [playbook.id.toLowerCase(), playbook]));
  const linkedAnalyses = journalMeta?.relatedAnalyses
    .map((analysisSlug) => analysesBySlug.get(analysisSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const linkedTemplates = journalMeta?.relatedTemplates
    .map((templateId) => templatesById.get(templateId.toLowerCase()))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const linkedPlaybooks = journalMeta?.relatedPlaybooks
    .map((playbookId) => playbooksById.get(playbookId.toLowerCase()))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image="/assets/og/blog-detail.svg"
        type="article"
        publishedTime={post.publishedDate}
        modifiedTime={post.updatedDate ?? post.publishedDate}
        keywords={[...post.tags, post.category]}
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
                name: copy.breadcrumbJournal,
                item: 'https://cyber-guide.fr/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: articleUrl,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedDate,
            dateModified: post.updatedDate ?? post.publishedDate,
            articleSection: post.category,
            keywords: post.tags.join(', '),
            url: articleUrl,
            author: {
              '@type': 'Organization',
              name: 'Cyber Guide',
            },
          },
        ]}
      />

      <div className="border-b border-brand-steel/20 bg-brand-navy pb-12 pt-24 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            to={localizedPath('/blog')}
            className="mb-6 inline-flex items-center text-xs font-mono uppercase tracking-widest text-brand-light/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} className="mr-2" /> {copy.backToBlog}
          </Link>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge color="steel" className="!border-white/25 !bg-white/10 !text-white">
              {localizeBlogCategory(post.category, locale)}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-brand-light">
              <Calendar size={12} /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-brand-light">
              <Clock3 size={12} /> {post.readTime}
            </span>
          </div>
          <h1 className="max-w-4xl text-3xl font-display font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-brand-pale">{post.excerpt}</p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-sm border border-slate-200 bg-white p-7 shadow-panel">
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-slate-500"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          <div className="space-y-5">
            {post.content.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-slate-700 md:text-base">
                {paragraph}
              </p>
            ))}
          </div>

          {journalMeta && (
            <section className="mt-8 rounded-sm border border-brand-steel/25 bg-slate-50 p-5">
              <h2 className="text-lg font-display font-bold text-brand-navy">{copy.operationalGoal}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{journalMeta.objective}</p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-navy">
                    <ListChecks size={12} className="text-brand-steel" />
                    {copy.immediateActions}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {journalMeta.immediateActions.map((action) => (
                      <li key={action} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-steel flex-shrink-0"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-navy">
                    <Link2 size={12} className="text-brand-steel" />
                    {copy.relatedResources}
                  </div>
                  <div className="space-y-3">
                    {linkedAnalyses && linkedAnalyses.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {copy.relatedAnalyses}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {linkedAnalyses.map((analysis) => (
                            <Link
                              key={analysis.slug}
                              to={localizedPath(`/analyses/${analysis.slug}`)}
                              className="inline-flex rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {analysis.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkedTemplates && linkedTemplates.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {copy.relatedTemplates}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {linkedTemplates.map((template) => (
                            <Link
                              key={template.id}
                              to={localizedPath(`/templates/${template.id}`)}
                              className="inline-flex rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {template.id.toUpperCase()}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkedPlaybooks && linkedPlaybooks.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {copy.relatedPlaybooks}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {linkedPlaybooks.map((playbook) => (
                            <Link
                              key={playbook.id}
                              to={localizedPath(`/playbooks/${playbook.id}`)}
                              className="inline-flex rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {playbook.id.toUpperCase()}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!linkedAnalyses || linkedAnalyses.length === 0) &&
                      (!linkedTemplates || linkedTemplates.length === 0) &&
                      (!linkedPlaybooks || linkedPlaybooks.length === 0) && (
                        <p className="text-sm text-slate-500">{copy.noRelatedResources}</p>
                      )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <TechSeparator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              {copy.lastUpdate}: {post.updatedDate ?? post.publishedDate}
            </p>
            <Link to={localizedPath('/guides')}>
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                {copy.openGuides}
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
