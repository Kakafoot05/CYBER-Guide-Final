import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookMarked, Clock4, LibraryBig } from 'lucide-react';
import { BlueprintPanel, ShieldHeader, Badge } from '../components/UI';
import { Seo } from '../components/Seo';
import { getLocalizedContent } from '../utils/contentLocale';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';

const Guides: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const { guides } = React.useMemo(() => getLocalizedContent(locale), [locale]);
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);

  const copy = isEnglish
    ? {
        seoTitle: 'Cyber Pillar Guides',
        seoDescription:
          'Strategic operational cybersecurity guides: Active Directory, ransomware response, and NIS2 compliance.',
        seoKeywords: [
          'cyber guide',
          'operational cyber guide',
          'active directory security',
          'ransomware response',
          'nis2 roadmap',
        ],
        schemaName: 'Cyber Guide Guides',
        headerTitle: 'Pillar Guides',
        headerSubtitle: 'Methodology Base',
        headerMeta: [`${guides.length} guides`, 'Operational journeys', 'Operational defense'],
        objectiveTitle: 'Guide objective',
        objectiveBody:
          'These consolidated guides target topics with the highest production value: identity/infrastructure, incident response, and governance. Each guide links analyses, playbooks, and tooling to accelerate execution.',
        updatedLabel: 'Updated',
        openLabel: 'Open',
      }
    : {
        seoTitle: 'Guides Piliers Cyber',
        seoDescription:
          'Guides stratégiques de cybersécurité opérationnelle : Active Directory, réponse ransomware et conformité NIS2.',
        seoKeywords: [
          'guide cyber',
          'guide cyber opérationnel',
          'active directory security',
          'ransomware response',
          'nis2 roadmap',
        ],
        schemaName: 'Guides Cyber Guide',
        headerTitle: 'Guides Piliers',
        headerSubtitle: 'Base Méthodologique',
        headerMeta: [`${guides.length} guides`, 'Parcours opérationnels', 'Défense opérationnelle'],
        objectiveTitle: 'Objectif des guides',
        objectiveBody:
          "Ces guides consolidés ciblent les sujets qui apportent le plus de valeur en production : identité/infrastructure, réponse incident et gouvernance. Chaque guide relie analyses, playbooks et outillage pour accélérer le passage à l'exécution.",
        updatedLabel: 'MàJ',
        openLabel: 'Ouvrir',
      };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/guides"
        image="/assets/og/guides.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.schemaName,
          url: 'https://cyber-guide.fr/guides',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: guides.map((guide, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: guide.title,
              url: `https://cyber-guide.fr/guides/${guide.slug}`,
            })),
          },
        }}
      />

      <ShieldHeader title={copy.headerTitle} subtitle={copy.headerSubtitle} meta={copy.headerMeta} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
            <LibraryBig size={14} /> {copy.objectiveTitle}
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{copy.objectiveBody}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link key={guide.slug} to={localizedPath(`/guides/${guide.slug}`)} className="group">
              <BlueprintPanel className="h-full border-slate-200 transition-colors hover:border-brand-steel">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <Badge color="steel">{guide.category}</Badge>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Clock4 size={11} />
                    {guide.readTime}
                  </div>
                </div>

                <h2 className="mb-3 text-xl font-display font-bold text-brand-navy transition-colors group-hover:text-brand-steel">
                  {guide.title}
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">{guide.excerpt}</p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <BookMarked size={11} />
                    {copy.updatedLabel} {guide.updatedDate}
                  </div>
                  <span className="flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel">
                    {copy.openLabel}{' '}
                    <ArrowRight
                      size={14}
                      className="ml-1 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </BlueprintPanel>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guides;

