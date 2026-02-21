import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldHeader, BlueprintPanel, TechSeparator } from '../components/UI';
import { Database, Lock } from 'lucide-react';
import { Seo } from '../components/Seo';
import { getLocaleFromPathname } from '../utils/locale';

const About: React.FC = () => {
  const location = useLocation();
  const isEnglish = getLocaleFromPathname(location.pathname) === 'en';

  const copy = isEnglish
    ? {
        seoTitle: 'Mission and Ethics',
        seoDescription:
          'Cyber Guide explains its defensive framework, methodology, and transparency commitments.',
        seoKeywords: ['cyber guide', 'mission', 'cyber ethics', 'operational cybersecurity'],
        schemaName: 'Cyber Guide Mission',
        headerTitle: 'Mission & Ethics',
        headerSubtitle: 'About',
        headerMeta: ['Open platform', 'Defensive only'],
        missionLabel: 'MISSION',
        missionTitle: 'European Cyber Intelligence Platform',
        missionBody1:
          'CYBER GUIDE is not an agency and not a consulting firm. It is an operational resource platform for SMB and mid-market cybersecurity teams and IT decision makers.',
        missionBody2:
          'Our objective is to translate macro threat trends into concrete, measurable, and directly applicable action plans.',
        sourcesTitle: 'Sources and Data',
        sourcesBody:
          'Our analyses and tools rely on rigorous technical monitoring combining official standards (ANSSI, NIST) and major threat intelligence reports (Security Navigator, DBIR, M-Trends). We systematically cite sources to guarantee reliability.',
        ethicsTitle: 'Ethical Framework',
        ethicsBody:
          'CYBER GUIDE is strictly defensive. We do not publish attack tooling, exploits, or offensive methods. Triage tools are designed with confidentiality-by-default (local browser processing).',
        notePrefix: 'NOTE:',
        noteBody:
          'This platform is an operational information resource. Tools are provided as-is and must be validated against your internal procedures before production use.',
      }
    : {
        seoTitle: 'Mission et Éthique',
        seoDescription:
          'Cyber Guide détaille son cadre défensif, sa méthodologie et ses engagements de transparence.',
        seoKeywords: ['cyber guide', 'mission', 'éthique cyber', 'cybersécurité opérationnelle'],
        schemaName: 'Mission Cyber Guide',
        headerTitle: 'Mission & Éthique',
        headerSubtitle: 'À Propos',
        headerMeta: ['Plateforme ouverte', 'Défensif uniquement'],
        missionLabel: 'MISSION',
        missionTitle: "Plateforme d'Intelligence Cyber Européenne",
        missionBody1:
          "CYBER GUIDE n'est pas une agence, ni un cabinet de conseil. C'est une plateforme de ressources opérationnelles destinée aux équipes cybersécurité des PME/ETI et aux décideurs IT.",
        missionBody2:
          "Notre objectif est de traduire les tendances macro-économiques de la menace en plans d'action concrets, mesurables et directement applicables.",
        sourcesTitle: 'Sources & Données',
        sourcesBody:
          "Nos analyses et outils s'appuient sur une veille technique rigoureuse combinant les standards officiels (ANSSI, NIST) et les rapports de renseignement sur la menace majeurs (Security Navigator, DBIR, M-Trends). Nous citons systématiquement nos sources pour garantir la véracité des informations.",
        ethicsTitle: 'Cadre Éthique',
        ethicsBody:
          "CYBER GUIDE est strictement défensif. Nous ne publions aucun outil d'attaque (Red Team), exploit ou méthode offensive. Nos outils de triage sont conçus avec un principe de confidentialité (traitement local navigateur).",
        notePrefix: 'NOTE:',
        noteBody:
          'Cette plateforme est une ressource d\'information opérationnelle. Les outils sont fournis "en l\'état" et doivent être validés selon vos procédures internes avant usage en production.',
      };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/a-propos"
        image="/assets/og/about.svg"
        keywords={copy.seoKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: copy.schemaName,
          url: 'https://cyber-guide.fr/a-propos',
        }}
      />
      <ShieldHeader title={copy.headerTitle} subtitle={copy.headerSubtitle} meta={copy.headerMeta} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlueprintPanel className="mb-12" label={copy.missionLabel}>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">{copy.missionTitle}</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">{copy.missionBody1}</p>
          <p className="text-slate-600 leading-relaxed">{copy.missionBody2}</p>
        </BlueprintPanel>

        <TechSeparator />

        <div className="grid md:grid-cols-2 gap-8 my-12">
          <div className="bg-white p-8 shadow-panel border-t-4 border-t-brand-steel">
            <div className="bg-brand-pale w-12 h-12 flex items-center justify-center text-brand-navy mb-6 rounded-sm">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">{copy.sourcesTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{copy.sourcesBody}</p>
          </div>

          <div className="bg-white p-8 shadow-panel border-t-4 border-t-brand-gold">
            <div className="bg-brand-pale w-12 h-12 flex items-center justify-center text-brand-navy mb-6 rounded-sm">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">{copy.ethicsTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{copy.ethicsBody}</p>
          </div>
        </div>

        <div className="bg-slate-200 p-6 rounded-sm text-xs text-slate-500 font-mono">
          <strong>{copy.notePrefix}</strong> {copy.noteBody}
        </div>
      </div>
    </div>
  );
};

export default About;
