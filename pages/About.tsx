import React from 'react';
import { ShieldHeader, BlueprintPanel, TechSeparator } from '../components/UI';
import { Database, Lock } from 'lucide-react';
import { Seo } from '../components/Seo';

const About: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Mission et Ethique"
        description="Cyber Guide detaille son cadre defensif, sa methodologie et ses engagements de transparence."
        path="/a-propos"
        image="/assets/og/about.svg"
        keywords={['cyber guide', 'mission', 'ethique cyber', 'blue team']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'Mission Cyber Guide',
          url: 'https://cyber-guide.fr/a-propos',
        }}
      />
      <ShieldHeader
        title="Mission & Éthique"
        subtitle="À Propos"
        meta={['Plateforme ouverte', 'Defensif uniquement']}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MISSION STATEMENT */}
        <BlueprintPanel className="mb-12" label="MISSION">
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">
            Plateforme d'Intelligence Cyber Européenne
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            CYBER GUIDE n'est pas une agence, ni un cabinet de conseil. C'est une plateforme de
            ressources opérationnelles destinée aux équipes de défense (Blue Teams) et aux décideurs
            IT des PME et ETI.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Notre objectif est de traduire les tendances macro-économiques de la menace en plans
            d'action concrets, mesurables et directement applicables.
          </p>
        </BlueprintPanel>

        <TechSeparator />

        {/* DATA SOURCE */}
        <div className="grid md:grid-cols-2 gap-8 my-12">
          <div className="bg-white p-8 shadow-panel border-t-4 border-t-brand-steel">
            <div className="bg-brand-pale w-12 h-12 flex items-center justify-center text-brand-navy mb-6 rounded-sm">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Sources & Données</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nos analyses et outils s'appuient sur une veille technique rigoureuse combinant les
              standards officiels (ANSSI, NIST) et les rapports de renseignement sur la menace
              majeurs (Security Navigator, DBIR, M-Trends). Nous citons systématiquement nos sources
              pour garantir la véracité des informations.
            </p>
          </div>

          <div className="bg-white p-8 shadow-panel border-t-4 border-t-brand-gold">
            <div className="bg-brand-pale w-12 h-12 flex items-center justify-center text-brand-navy mb-6 rounded-sm">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Cadre Éthique</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              CYBER GUIDE est strictement défensif. Nous ne publions aucun outil d'attaque (Red
              Team), exploit ou méthode offensive. Nos outils de triage sont conçus avec un principe
              de confidentialite (traitement local navigateur).
            </p>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="bg-slate-200 p-6 rounded-sm text-xs text-slate-500 font-mono">
          <strong>NOTE:</strong> Cette plateforme est un projet de démonstration et d'information.
          Les outils sont fournis "en l'état" pour des environnements de test. CYBER GUIDE ne peut
          être tenu responsable de l'utilisation des données.
        </div>
      </div>
    </div>
  );
};

export default About;
