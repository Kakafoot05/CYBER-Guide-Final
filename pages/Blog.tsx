import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldHeader, BlueprintPanel, Button } from '../components/UI';
import { ArrowRight, Link2, ListChecks } from 'lucide-react';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';
import { getLocalizedContent } from '../utils/contentLocale';
import { getJournalEntryMeta } from '../utils/journalMeta';
import { localizeBlogCategory } from '../utils/labels';

const Blog: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { blogPosts, analyses, templates, playbooks } = React.useMemo(
    () => getLocalizedContent(locale),
    [locale],
  );
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);
  const analysesBySlug = React.useMemo(
    () => new Map(analyses.map((analysis) => [analysis.slug, analysis])),
    [analyses],
  );
  const templatesById = React.useMemo(
    () => new Map(templates.map((template) => [template.id.toLowerCase(), template])),
    [templates],
  );
  const playbooksById = React.useMemo(
    () => new Map(playbooks.map((playbook) => [playbook.id.toLowerCase(), playbook])),
    [playbooks],
  );

  const copy = isEnglish
    ? {
        seoTitle: 'Cyber Journal and Field Feedback',
        seoDescription:
          'Cyber Guide technical journal: incident analyses, field feedback, and defensive research notes.',
        seoKeywords: ['cyber blog', 'field feedback', 'incident response', 'operational cybersecurity'],
        schemaName: 'Cyber Guide Journal',
        headerTitle: 'Field Journal',
        headerSubtitle: 'Operational Feedback',
        headerMeta: ['Observations', 'Technical notes', 'Sharing'],
        entryLabel: 'JOURNAL ENTRY',
        readLabel: 'read',
        cta: 'Read full note',
        endLabel: 'End of journal',
        purposeTitle: 'Why this journal matters',
        purposeBody:
          'This section converts real field observations into immediate actions for French operational cybersecurity teams.',
        purposePillars: [
          'Signal weak indicators early',
          'Drive fast incident decisions',
          'Bridge to templates and runbooks',
        ],
        usageTitle: 'How to use it during operations',
        usageSteps: [
          'Start from immediate actions and validate your first 30 minutes.',
          'Open linked analyses to understand attack patterns and key indicators.',
          'Use linked templates and playbooks to standardize execution.',
        ],
        openAnalyses: 'Open analyses',
        openTemplates: 'Open templates',
        immediateActions: 'Immediate actions',
        noImmediateActions: 'No immediate action defined for this note.',
        relatedResources: 'Related resources',
        relatedAnalysis: 'Analysis',
        relatedTemplate: 'Template',
        relatedPlaybook: 'Playbook',
      }
    : {
        seoTitle: "Blog et Retours d'Expérience",
        seoDescription:
          "Journal technique Cyber Guide : analyses d'incident, retours terrain et notes de recherche défensive.",
        seoKeywords: ['blog cyber', "retour d'expérience", 'incident response', 'cybersécurité opérationnelle'],
        schemaName: 'Journal Cyber Guide',
        headerTitle: 'Journal de Terrain',
        headerSubtitle: "Retours d'Expérience",
        headerMeta: ['Observations', 'Notes techniques', 'Partage'],
        entryLabel: 'ENTRÉE JOURNAL',
        readLabel: 'lecture',
        cta: 'Lire la note complète',
        endLabel: 'Fin du journal',
        purposeTitle: 'Pourquoi ce journal est utile',
        purposeBody:
          'Cette section transforme des observations terrain en actions immédiates pour les équipes de cybersécurité opérationnelle.',
        purposePillars: [
          'Détecter les signaux faibles rapidement',
          'Accélérer la décision en incident',
          'Relier directement aux templates et playbooks',
        ],
        usageTitle: "Comment l'utiliser en situation opérationnelle",
        usageSteps: [
          'Commencer par les actions immédiates pour cadrer les 30 premières minutes.',
          "Ouvrir les analyses liées pour comprendre la chaîne d'attaque et les indicateurs.",
          'Exécuter via les templates et playbooks associés pour standardiser la réponse.',
        ],
        openAnalyses: 'Ouvrir les analyses',
        openTemplates: 'Ouvrir les templates',
        immediateActions: 'Actions immédiates',
        noImmediateActions: 'Aucune action immédiate définie pour cette note.',
        relatedResources: 'Ressources associées',
        relatedAnalysis: 'Analyse',
        relatedTemplate: 'Template',
        relatedPlaybook: 'Playbook',
      };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/blog"
        image="/assets/og/blog.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: copy.schemaName,
          url: 'https://cyber-guide.fr/blog',
          blogPost: blogPosts.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: `https://cyber-guide.fr/blog/${post.slug}`,
            datePublished: post.publishedDate,
          })),
        }}
      />
      <ShieldHeader title={copy.headerTitle} subtitle={copy.headerSubtitle} meta={copy.headerMeta} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-sm border border-brand-steel/20 bg-white p-6 shadow-panel">
          <h2 className="text-xl font-display font-bold text-brand-navy">{copy.purposeTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.purposeBody}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {copy.purposePillars.map((item) => (
              <div
                key={item}
                className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-sm border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-brand-navy">
              {copy.usageTitle}
            </div>
            <ol className="space-y-2 text-sm text-slate-600">
              {copy.usageSteps.map((step, stepIndex) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-steel/40 bg-white text-[10px] font-bold text-brand-navy">
                    {stepIndex + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to={localizedPath('/analyses')}>
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                {copy.openAnalyses}
              </Button>
            </Link>
            <Link to={localizedPath('/templates')}>
              <Button as="span" variant="ghost" size="sm" icon={ArrowRight}>
                {copy.openTemplates}
              </Button>
            </Link>
          </div>
        </section>

        <div className="relative border-l-2 border-brand-steel/20 ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
          {blogPosts.map((post, idx) => {
            const journalMeta = getJournalEntryMeta(post.slug, locale);
            const relatedAnalysis = journalMeta?.relatedAnalyses
              .map((slug) => analysesBySlug.get(slug))
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .slice(0, 1);
            const relatedTemplate = journalMeta?.relatedTemplates
              .map((id) => templatesById.get(id.toLowerCase()))
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .slice(0, 1);
            const relatedPlaybook = journalMeta?.relatedPlaybooks
              .map((id) => playbooksById.get(id.toLowerCase()))
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .slice(0, 1);

            return (
              <div key={post.id} className="relative group">
                <div className="absolute -left-[41px] md:-left-[59px] top-6 w-5 h-5 bg-slate-50 border-4 border-brand-steel/50 rounded-full group-hover:border-brand-navy group-hover:scale-110 transition-all"></div>

                <BlueprintPanel
                  className="hover:-translate-y-1 transition-transform duration-300 hover:border-brand-steel"
                  label={`${copy.entryLabel}: #${idx + 1}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-32 flex-shrink-0 flex flex-col md:items-end md:text-right border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                      <span className="font-mono text-3xl font-bold text-slate-200 leading-none mb-1 group-hover:text-brand-steel/30 transition-colors">
                        {post.date.split(' ')[0]}
                      </span>
                      <span className="font-display font-bold text-brand-navy uppercase text-sm">
                        {post.date.split(' ').slice(1).join(' ')}
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        {post.readTime} {copy.readLabel}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 bg-brand-navy/5 text-brand-navy text-[10px] font-bold uppercase tracking-wide rounded-sm border border-brand-navy/10">
                          {localizeBlogCategory(post.category, locale)}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-600 leading-relaxed font-sans mb-4">{post.excerpt}</p>

                      <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-navy">
                          <ListChecks size={12} className="text-brand-steel" />
                          {copy.immediateActions}
                        </div>
                        {journalMeta?.immediateActions.length ? (
                          <ul className="space-y-1.5 text-sm text-slate-600">
                            {journalMeta.immediateActions.slice(0, 2).map((action) => (
                              <li key={action} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-steel flex-shrink-0"></span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">{copy.noImmediateActions}</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          <Link2 size={12} className="text-brand-steel" />
                          {copy.relatedResources}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {relatedAnalysis?.map((analysis) => (
                            <Link
                              key={analysis.slug}
                              to={localizedPath(`/analyses/${analysis.slug}`)}
                              className="inline-flex items-center rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {copy.relatedAnalysis}: {analysis.title}
                            </Link>
                          ))}
                          {relatedTemplate?.map((template) => (
                            <Link
                              key={template.id}
                              to={localizedPath(`/templates/${template.id}`)}
                              className="inline-flex items-center rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {copy.relatedTemplate}: {template.id.toUpperCase()}
                            </Link>
                          ))}
                          {relatedPlaybook?.map((playbook) => (
                            <Link
                              key={playbook.id}
                              to={localizedPath(`/playbooks/${playbook.id}`)}
                              className="inline-flex items-center rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-brand-steel hover:text-brand-navy"
                            >
                              {copy.relatedPlaybook}: {playbook.id.toUpperCase()}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5">
                        <Link
                          to={localizedPath(`/blog/${post.slug}`)}
                          className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel"
                        >
                          {copy.cta} <ArrowRight size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </BlueprintPanel>
              </div>
            );
          })}
        </div>

        <div className="mt-12 ml-4 md:ml-8 pl-8 md:pl-12 flex items-center gap-4 opacity-30">
          <div className="w-2 h-2 bg-brand-navy rounded-full"></div>
          <div className="h-px bg-brand-navy flex-grow"></div>
          <span className="font-mono text-xs uppercase">{copy.endLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default Blog;
