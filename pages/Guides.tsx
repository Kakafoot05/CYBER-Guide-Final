import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Clock4, LibraryBig } from 'lucide-react';
import { BlueprintPanel, ShieldHeader, Badge } from '../components/UI';
import { Seo } from '../components/Seo';
import { guides } from '../guides';

const Guides: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Seo
        title="Guides Piliers Cyber"
        description="Guides strategiques de cybersécurité opérationnelle: Active Directory, reponse ransomware et conformite NIS2."
        path="/guides"
        image="/assets/og/guides.svg"
        keywords={[
          'guide cyber',
          'guide cyber operationnel',
          'active directory security',
          'ransomware response',
          'nis2 roadmap',
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Guides Cyber Guide',
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

      <ShieldHeader
        title="Guides Piliers"
        subtitle="Base Methodologique"
        meta={[`${guides.length} guides`, 'Parcours operationnels', 'Defense operationnelle']}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
            <LibraryBig size={14} /> Objectif des guides
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Ces guides consolidés ciblent les sujets qui apportent le plus de valeur en production:
            identite/infrastructure, reponse incident et gouvernance. Chaque guide relie analyses,
            playbooks et outillage pour accelerer le passage a l execution.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link key={guide.slug} to={`/guides/${guide.slug}`} className="group">
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
                    Maj {guide.updatedDate}
                  </div>
                  <span className="flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel">
                    Ouvrir{' '}
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
