import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldHeader, BlueprintPanel } from '../components/UI';
import { blogPosts } from '../data';
import { ArrowRight } from 'lucide-react';
import { Seo } from '../components/Seo';

const Blog: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Blog et Retours d'Experience"
        description="Journal technique Cyber Guide: analyses d'incident, retours terrain et notes de recherche defensive."
        path="/blog"
        image="/assets/og/blog.svg"
        keywords={['blog cyber', 'retour d experience', 'incident response', 'cybersecurite operationnelle']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Blog Cyber Guide',
          url: 'https://cyber-guide.fr/blog',
          blogPost: blogPosts.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: `https://cyber-guide.fr/blog/${post.slug}`,
            datePublished: post.publishedDate,
          })),
        }}
      />
      <ShieldHeader
        title="Journal de Terrain"
        subtitle="Retours d'Experience"
        meta={['Observations', 'Notes techniques', 'Partage']}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TIMELINE CONTAINER */}
        <div className="relative border-l-2 border-brand-steel/20 ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
          {blogPosts.map((post, idx) => (
            <div key={post.id} className="relative group">
              {/* Timeline Node */}
              <div className="absolute -left-[41px] md:-left-[59px] top-6 w-5 h-5 bg-slate-50 border-4 border-brand-steel/50 rounded-full group-hover:border-brand-navy group-hover:scale-110 transition-all"></div>

              <Link to={`/blog/${post.slug}`} className="block">
                <BlueprintPanel
                  className="hover:-translate-y-1 transition-transform duration-300 hover:border-brand-steel"
                  label={`ENTREE JOURNAL: #${idx + 1}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Column */}
                    <div className="md:w-32 flex-shrink-0 flex flex-col md:items-end md:text-right border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                      <span className="font-mono text-3xl font-bold text-slate-200 leading-none mb-1 group-hover:text-brand-steel/30 transition-colors">
                        {post.date.split(' ')[0]}
                      </span>
                      <span className="font-display font-bold text-brand-navy uppercase text-sm">
                        {post.date.split(' ').slice(1).join(' ')}
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        {post.readTime} read
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 bg-brand-navy/5 text-brand-navy text-[10px] font-bold uppercase tracking-wide rounded-sm border border-brand-navy/10">
                          {post.category}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-steel transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-600 leading-relaxed font-sans mb-6">
                        {post.excerpt}
                      </p>

                      <div className="inline-flex items-center text-xs font-bold uppercase tracking-wide text-brand-steel">
                        Lire la note complete <ArrowRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </BlueprintPanel>
              </Link>
            </div>
          ))}
        </div>

        {/* End of Log Marker */}
        <div className="mt-12 ml-4 md:ml-8 pl-8 md:pl-12 flex items-center gap-4 opacity-30">
          <div className="w-2 h-2 bg-brand-navy rounded-full"></div>
          <div className="h-px bg-brand-navy flex-grow"></div>
          <span className="font-mono text-xs uppercase">Fin du journal</span>
        </div>
      </div>
    </div>
  );
};

export default Blog;
