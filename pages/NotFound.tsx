import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button, ShieldHeader } from '../components/UI';
import { Seo } from '../components/Seo';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Seo
        title="Page introuvable"
        description="La page demandee est introuvable. Revenez sur les analyses ou l'accueil Cyber Guide."
        path="/404"
        image="/assets/og/home.svg"
        noindex
      />
      <ShieldHeader
        title="404"
        subtitle="Page introuvable"
        meta={['Route inconnue', 'Vérifiez le lien']}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-slate-200 bg-white p-10 text-center shadow-panel">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="mb-3 text-3xl font-display font-bold text-brand-navy">
            Cette page n&apos;existe pas
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">
            Le lien est invalide ou la ressource a été déplacée. Retournez à l&apos;accueil ou
            consultez les analyses disponibles.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button as="span" variant="secondary" icon={ArrowLeft}>
                Retour accueil
              </Button>
            </Link>
            <Link to="/analyses">
              <Button as="span" variant="primary">
                Voir les analyses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
