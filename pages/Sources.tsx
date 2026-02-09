import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldHeader, TechSeparator, Badge, Button } from '../components/UI';
import { ExternalLink, Calendar, BookOpen, ShieldCheck, Rss, ArrowUpRight } from 'lucide-react';
import { Seo } from '../components/Seo';

const Sources: React.FC = () => {
  const sources = [
    {
      id: 'anssi',
      name: 'ANSSI',
      fullName: "Agence nationale de la sécurité des systèmes d'information",
      logoUrl: '/assets/anssi.png',
      type: 'Gouvernemental',
      frequency: 'Continu',
      description:
        "L'autorité nationale française en matière de sécurité et de défense des systèmes d'information. Ses guides d'hygiène et certifications (SecNumCloud, PDIS) constituent la base réglementaire de nos playbooks conformes à la LPM et NIS2.",
      url: 'https://cyber.gouv.fr',
      links: [
        {
          label: "Guide d'hygiène informatique",
          url: 'https://cyber.gouv.fr/le-guide-dhygiene-informatique',
        },
        { label: 'État de la menace', url: 'https://cyber.gouv.fr/publications' },
        { label: 'CERT-FR Avis', url: 'https://www.cert.ssi.gouv.fr/' },
      ],
    },
    {
      id: 'nist',
      name: 'NIST',
      fullName: 'National Institute of Standards and Technology',
      logoUrl: '/assets/nist.png',
      type: 'Standard US',
      frequency: 'Majeur (Annuel)',
      description:
        "Agence de normalisation américaine. Le framework NIST CSF 2.0 (Identify, Protect, Detect, Respond, Recover) structure l'architecture de nos procédures opérationnelles et assure une couverture holistique du risque.",
      url: 'https://www.nist.gov/cyberframework',
      links: [
        { label: 'Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework' },
        {
          label: 'SP 800-61 Rev. 2 (Incident)',
          url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
        },
        { label: 'NVD (Vulnerabilities)', url: 'https://nvd.nist.gov/' },
      ],
    },
    {
      id: 'ocd',
      name: 'Orange Cyberdefense',
      fullName: 'Intelligence & Research',
      logoUrl: '/assets/orange-cyberdefense.png',
      type: 'Privé / Threat Intel',
      frequency: 'Trimestriel',
      description:
        "Leader européen des services de sécurité. Leurs rapports 'Security Navigator' fournissent des statistiques précises sur les tendances d'attaques (Ransomware, Cy-X) et la maturité des entreprises, alimentant nos études de cas.",
      url: 'https://www.orangecyberdefense.com/fr/security-navigator',
      links: [
        {
          label: 'Security Navigator 2026',
          url: 'https://www.orangecyberdefense.com/fr/security-navigator',
        },
        { label: 'Analyses CERT-OCD', url: 'https://cert.orangecyberdefense.com/' },
        {
          label: 'World Watch',
          url: 'https://www.orangecyberdefense.com/global/blog/security-navigator',
        },
      ],
    },
    {
      id: 'cisa',
      name: 'CISA',
      fullName: 'Cybersecurity and Infrastructure Security Agency',
      logoUrl: '/assets/cisa.png',
      type: 'Gouvernemental US',
      frequency: 'Continu',
      description:
        'Agence federale americaine de reference pour la defense cyber et la protection des infrastructures critiques. Le catalogue KEV et les alertes CISA servent de base concrete pour prioriser les correctifs critiques.',
      url: 'https://www.cisa.gov',
      links: [
        {
          label: 'Known Exploited Vulnerabilities (KEV)',
          url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        },
        {
          label: 'Cybersecurity Alerts & Advisories',
          url: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
        },
        {
          label: 'Binding Operational Directives',
          url: 'https://www.cisa.gov/binding-operational-directives',
        },
      ],
    },
  ];

  const watchList = [
    { name: 'The DFIR Report', url: 'https://thedfirreport.com/', tag: 'Technique' },
    {
      name: 'CISA KEV Catalog',
      url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
      tag: 'Vulnérabilités',
    },
    {
      name: 'Mandiant M-Trends',
      url: 'https://www.mandiant.com/resources/reports/m-trends',
      tag: 'Stratégique',
    },
    {
      name: 'Microsoft Security Blog',
      url: 'https://www.microsoft.com/en-us/security/blog/',
      tag: 'Cloud/Identity',
    },
    { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/', tag: 'Framework' },
    { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/', tag: 'News' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Sources et Referentiels Cyber"
        description="Referentiels ANSSI, NIST et threat intelligence utilises pour construire les analyses et playbooks Cyber Guide."
        path="/sources"
        image="/assets/og/sources.svg"
        keywords={['ANSSI', 'NIST', 'CISA', 'threat intelligence', 'sources cyber', 'veille cyber']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Sources Cyber Guide',
          url: 'https://cyber-guide.fr/sources',
        }}
      />
      <ShieldHeader
        title="Sources & Référentiels"
        subtitle="Veille Technique"
        meta={['Standards', 'Threat Intel', 'Cadre Légal']}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-4">
            Architecture de la Connaissance
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            La crédibilité de Cyber Guide repose sur une sélection rigoureuse de sources. Nous ne
            produisons pas de théorie : nous synthétisons les standards validés par l'industrie.
          </p>
        </div>

        <div className="mb-12 grid gap-4 rounded-sm border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
              Aller plus loin
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Ces references alimentent directement les guides piliers et les analyses
              operationnelles du site.
            </p>
          </div>
          <div className="flex items-center justify-start gap-4 md:justify-end">
            <Link to="/guides">
              <Button as="span" variant="secondary" size="sm" icon={ArrowUpRight}>
                Ouvrir les guides
              </Button>
            </Link>
            <Link
              to="/analyses"
              className="text-xs font-mono uppercase tracking-wide text-brand-steel hover:text-brand-navy transition-colors"
            >
              Voir aussi les analyses
            </Link>
          </div>
        </div>

        {/* SECTION 1: PILIERS MAJEURS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-white border border-slate-200 rounded-sm shadow-panel hover:shadow-panel-hover hover:border-brand-steel transition-all duration-300 group overflow-hidden flex flex-col"
            >
              {/* Header with big logo */}
              <div className="bg-slate-50/50 p-8 flex items-center justify-center border-b border-slate-100 h-48 relative">
                <div className="absolute top-4 right-4">
                  <Badge color="navy">{source.type}</Badge>
                </div>
                <div className="w-48 h-24 flex items-center justify-center bg-white p-4 rounded-sm shadow-sm">
                  <img
                    src={source.logoUrl}
                    alt={source.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    width={256}
                    height={128}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-display font-bold text-brand-navy mb-2">
                  {source.fullName}
                </h3>
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
                  <Calendar size={12} /> Maj: {source.frequency}
                </div>

                <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                  {source.description}
                </p>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-brand-navy uppercase tracking-widest flex items-center gap-2 mb-2">
                    <BookOpen size={12} /> Ressources Clés
                  </div>
                  {source.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-sm text-sm text-slate-700 hover:bg-brand-pale hover:text-brand-navy hover:border-brand-steel/30 transition-all group/link"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight
                        size={14}
                        className="text-slate-400 group-hover/link:text-brand-steel"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <TechSeparator />

        {/* SECTION 2: VEILLE RECOMMANDÉE */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-navy text-white rounded-sm">
              <Rss size={20} />
            </div>
            <h3 className="text-xl font-display font-bold text-brand-navy uppercase tracking-tight">
              Flux de Veille Recommandés
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchList.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-sm hover:border-brand-steel hover:shadow-md transition-all group"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-brand-navy group-hover:text-brand-steel transition-colors">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono mt-1">{item.tag}</span>
                </div>
                <ExternalLink
                  size={16}
                  className="text-slate-300 group-hover:text-brand-steel transition-colors"
                />
              </a>
            ))}
          </div>
        </div>

        {/* LEGAL DISCLAIMER */}
        <div className="mt-24 pt-8 border-t border-slate-200 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
            <ShieldCheck size={24} />
          </div>
          <p className="text-xs text-slate-500 font-mono max-w-2xl mx-auto leading-relaxed">
            <strong>NOTE DE TRANSPARENCE :</strong> Les marques et logos cités sur cette page
            (ANSSI, NIST, Orange Cyberdefense, CISA) sont la propriété exclusive de leurs détenteurs
            respectifs. Ils sont utilisés ici uniquement à titre informatif pour identifier les
            sources documentaires utilisées pour construire nos playbooks. Cyber Guide n'est pas
            affilié, sponsorisé ou partenaire officiel de ces entités.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sources;
