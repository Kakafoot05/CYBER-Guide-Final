import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, Filter, FolderOpen } from 'lucide-react';
import { Badge, Button, type BadgeColor, ShieldHeader } from '../components/UI';
import { analyses } from '../data';
import { Seo } from '../components/Seo';

type LevelStyle = {
  badgeColor: BadgeColor;
  stripeClass: string;
  pillClass: string;
};

const getLevelStyle = (level: string): LevelStyle => {
  const normalizedLevel = level.toLowerCase();

  if (normalizedLevel.includes('strat')) {
    return {
      badgeColor: 'alert',
      stripeClass: 'bg-red-500',
      pillClass: 'bg-red-500/10 text-red-700',
    };
  }

  if (normalizedLevel.includes('avanc')) {
    return {
      badgeColor: 'gold',
      stripeClass: 'bg-brand-gold',
      pillClass: 'bg-brand-gold/10 text-brand-gold',
    };
  }

  if (normalizedLevel.includes('inter')) {
    return {
      badgeColor: 'steel',
      stripeClass: 'bg-brand-steel',
      pillClass: 'bg-brand-steel/10 text-brand-steel',
    };
  }

  return {
    badgeColor: 'navy',
    stripeClass: 'bg-brand-navy',
    pillClass: 'bg-brand-navy/10 text-brand-navy',
  };
};

const Analyses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [levelFilter, setLevelFilter] = useState('Tous');
  const searchQuery = searchParams.get('q')?.trim() ?? '';

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(analyses.map((item) => item.category)))],
    [],
  );
  const levels = useMemo(
    () => ['Tous', ...Array.from(new Set(analyses.map((item) => item.level)))],
    [],
  );

  const filteredAnalyses = analyses.filter((analysis) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchCategory = categoryFilter === 'Tous' || analysis.category === categoryFilter;
    const matchLevel = levelFilter === 'Tous' || analysis.level === levelFilter;
    const matchSearch =
      normalizedQuery.length === 0 ||
      analysis.title.toLowerCase().includes(normalizedQuery) ||
      analysis.subtitle.toLowerCase().includes(normalizedQuery) ||
      analysis.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    return matchCategory && matchLevel && matchSearch;
  });

  const updateSearchQuery = (nextQuery: string) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = nextQuery.trim();
    if (trimmed.length > 0) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Seo
        title="Analyses Cyber Defensives"
        description="Bibliotheque d'analyses Blue Team: identity, AD, ransomware, conformite et posture defensive."
        path="/analyses"
        image="/assets/og/analyses.svg"
        keywords={[
          'analyse cyber',
          'threat intelligence',
          'blue team',
          'ransomware',
          'active directory',
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: "Dossiers d'analyse Cyber Guide",
          url: 'https://cyber-guide.fr/analyses',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: analyses.map((analysis, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://cyber-guide.fr/analyses/${analysis.slug}`,
              name: analysis.title,
            })),
          },
        }}
      />
      <ShieldHeader
        title="Dossiers d'Analyse"
        subtitle="Bibliotheque"
        meta={[`${analyses.length} Dossiers`, 'Renseignement menace', 'Analyses defensives']}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy">
            <Filter size={14} /> Filtres
          </div>

          <div className="mb-5">
            <label
              htmlFor="analysis-search"
              className="mb-2 block text-xs font-mono text-slate-500"
            >
              RECHERCHE
            </label>
            <input
              id="analysis-search"
              type="search"
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              placeholder="Ex: MFA, ransomware, NIS2, AD tiering"
              className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-steel focus:outline-none focus:ring-2 focus:ring-brand-steel/20"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-mono text-slate-500">CATEGORIE</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                      categoryFilter === category
                        ? 'border-brand-navy bg-brand-navy text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-brand-steel hover:text-brand-navy'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-mono text-slate-500">
                NIVEAU TECHNIQUE
              </label>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setLevelFilter(level)}
                    className={`rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                      levelFilter === level
                        ? 'border-brand-steel bg-brand-steel text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-brand-steel hover:text-brand-navy'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 text-xs font-mono text-slate-400">
          {filteredAnalyses.length} resultat(s) trouve(s)
        </div>

        <div className="mb-8 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
              Parcours recommande
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Pour chaque analyse, un guide pilier donne la vision long terme et les templates
              fournissent les actions immediates.
            </p>
          </div>
          <div className="flex items-center justify-start gap-4 md:justify-end">
            <Link to="/guides">
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                Ouvrir les guides
              </Button>
            </Link>
            <Link
              to="/templates"
              className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
            >
              Voir aussi les templates
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnalyses.map((analysis) => {
            const levelStyle = getLevelStyle(analysis.level);

            return (
              <Link key={analysis.id} to={`/analyses/${analysis.slug}`} className="group h-full">
                <div className="relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-panel transition-all duration-300 hover:shadow-panel-hover">
                  <div className={`h-1 w-full ${levelStyle.stripeClass}`} />

                  <div className="flex flex-grow flex-col p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <Badge color="mono" className="text-[9px]">
                        {analysis.category}
                      </Badge>
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${levelStyle.pillClass}`}
                      >
                        {analysis.level}
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-display font-bold text-brand-navy transition-colors group-hover:text-brand-steel">
                      {analysis.title}
                    </h3>

                    {analysis.keyMetrics[0] && (
                      <div className="mb-4 rounded-sm border border-brand-steel/20 bg-brand-pale/40 px-3 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
                          Chiffre cle
                        </p>
                        <p className="text-sm font-bold text-brand-navy">
                          {analysis.keyMetrics[0].value} - {analysis.keyMetrics[0].label}
                        </p>
                      </div>
                    )}

                    <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
                      {analysis.subtitle}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {analysis.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock size={14} className="mr-1" />
                        {analysis.readTime}
                      </div>
                      <span className="flex items-center text-xs font-bold uppercase tracking-wider text-brand-steel transition-transform group-hover:translate-x-1">
                        Consulter <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredAnalyses.length === 0 && (
          <div className="rounded-sm border border-slate-200 bg-white py-24 text-center">
            <FolderOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Aucune analyse ne correspond a vos filtres.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('Tous');
                setLevelFilter('Tous');
                updateSearchQuery('');
              }}
              className="mt-2 text-sm font-bold text-brand-steel hover:underline"
            >
              Reinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyses;
