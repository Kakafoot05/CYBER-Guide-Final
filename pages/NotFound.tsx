import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button, ShieldHeader } from '../components/UI';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';

const NotFound: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy =
    locale === 'en'
      ? {
          title: 'Page not found',
          description:
            'The requested page is unavailable. Go back to Cyber Guide home or browse analyses.',
          subtitle: 'Page not found',
          meta: ['Unknown route', 'Check URL'],
          heading: 'This page does not exist',
          body: 'The link is invalid or the resource was moved. Return to home or browse available analyses.',
          backHome: 'Back to home',
          viewAnalyses: 'View analyses',
        }
      : {
          title: 'Page introuvable',
          description:
            "La page demandee est introuvable. Revenez sur les analyses ou l'accueil Cyber Guide.",
          subtitle: 'Page introuvable',
          meta: ['Route inconnue', 'Verifiez le lien'],
          heading: "Cette page n'existe pas",
          body: "Le lien est invalide ou la ressource a ete deplacee. Retournez a l'accueil ou consultez les analyses disponibles.",
          backHome: 'Retour accueil',
          viewAnalyses: 'Voir les analyses',
        };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Seo
        title={copy.title}
        description={copy.description}
        path="/404"
        image="/assets/og/home.svg"
        noindex
      />
      <ShieldHeader title="404" subtitle={copy.subtitle} meta={copy.meta} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-slate-200 bg-white p-10 text-center shadow-panel">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="mb-3 text-3xl font-display font-bold text-brand-navy">{copy.heading}</h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">{copy.body}</p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={buildLocalizedPath('/', locale)}>
              <Button as="span" variant="secondary" icon={ArrowLeft}>
                {copy.backHome}
              </Button>
            </Link>
            <Link to={buildLocalizedPath('/analyses', locale)}>
              <Button as="span" variant="primary">
                {copy.viewAnalyses}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
