import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock3, Tag } from 'lucide-react';
import { Seo } from '../components/Seo';
import { Badge, Button, TechSeparator } from '../components/UI';
import { blogPosts } from '../data';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const articleUrl = `https://cyber-guide.fr/blog/${post.slug}`;

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
                name: 'Accueil',
                item: 'https://cyber-guide.fr/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
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
            to="/blog"
            className="mb-6 inline-flex items-center text-xs font-mono uppercase tracking-widest text-brand-light/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} className="mr-2" /> Retour au journal
          </Link>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge color="steel" className="!border-white/25 !bg-white/10 !text-white">
              {post.category}
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

          <TechSeparator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Derniere mise a jour: {post.updatedDate ?? post.publishedDate}
            </p>
            <Link to="/guides">
              <Button as="span" variant="secondary" size="sm" icon={ArrowRight}>
                Ouvrir les guides lies
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
