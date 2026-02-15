import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './UI';
import { PageTransition } from './Motion';
import {
  buildLocalizedPath,
  getLocaleFromPathname,
  getPathWithQueryHash,
  setStoredLocale,
  stripLocalePrefix,
  switchLocalePath,
  type SupportedLocale,
} from '../utils/locale';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPathname(location.pathname);
  const normalizedPath = stripLocalePrefix(location.pathname);

  const copy =
    locale === 'en'
      ? {
          skipToContent: 'Skip to content',
          logoAriaLabel: 'Back to home',
          nav: {
            analyses: 'Analyses',
            guides: 'Guides',
            projects: 'Projects',
            tools: 'Tools',
            templates: 'Templates',
            about: 'About',
          },
          edition: 'Edition 2026',
          contact: 'Contact',
          mission: 'Mission',
          missionDescription:
            'Defensive analysis and tooling platform for operational cyber teams. Priority: actionable workflows, reliable standards, and real-world execution.',
          copyright: '© 2026 CYBER GUIDE.',
          navigation: 'Navigation',
          sources: 'Sources & Frameworks',
          viewDetails: 'View details',
          strictDefensive: 'STRICTLY DEFENSIVE // OPERATIONAL CYBERSECURITY',
          journal: 'Journal',
          languageSwitcherAria: 'Change language',
        }
      : {
          skipToContent: 'Aller au contenu',
          logoAriaLabel: 'Retour Accueil',
          nav: {
            analyses: 'Analyses',
            guides: 'Guides',
            projects: 'Projets',
            tools: 'Outils',
            templates: 'Templates',
            about: 'A Propos',
          },
          edition: 'Edition 2026',
          contact: 'Contact',
          mission: 'Mission',
          missionDescription:
            "Plateforme d'analyse et d'outillage defensif pour les equipes cyber operationnelles. Priorite: parcours actionnables, standards fiables et execution en conditions reelles.",
          copyright: '© 2026 CYBER GUIDE.',
          navigation: 'Navigation',
          sources: 'Sources & Referentiels',
          viewDetails: 'Voir details',
          strictDefensive: 'STRICTEMENT DEFENSIF // CYBER OPERATIONNELLE',
          journal: 'Journal',
          languageSwitcherAria: 'Changer de langue',
        };

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const nextIsScrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev === nextIsScrolled ? prev : nextIsScrolled));
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: copy.nav.analyses, path: '/analyses' },
    { name: copy.nav.guides, path: '/guides' },
    { name: copy.nav.projects, path: '/projets' },
    { name: copy.nav.tools, path: '/outils' },
    { name: copy.nav.templates, path: '/templates' },
    { name: copy.nav.about, path: '/a-propos' },
  ];

  const isRouteActive = (path: string): boolean => {
    if (path === '/') {
      return normalizedPath === '/';
    }

    return normalizedPath === path || normalizedPath.startsWith(`${path}/`);
  };

  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);

  const handleLanguageSwitch = (nextLocale: SupportedLocale) => {
    const currentPath = getPathWithQueryHash(location);
    setStoredLocale(nextLocale);
    const targetPath = switchLocalePath(currentPath, nextLocale);
    if (targetPath !== currentPath) {
      navigate(targetPath);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-navy selection:bg-brand-steel selection:text-white overflow-x-hidden">
      <a
        href="#main-content"
        className="absolute left-4 top-2 z-[60] -translate-y-16 rounded-sm border border-white/30 bg-brand-navy px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-transform focus:translate-y-0"
      >
        {copy.skipToContent}
      </a>
      {/* NAVBAR PREMIUM */}
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border-b ${
          isScrolled
            ? 'bg-brand-navy/98 backdrop-blur-xl border-white/20 py-3.5 shadow-[0_18px_42px_-22px_rgba(3,13,34,0.9)]'
            : 'bg-gradient-to-r from-brand-navy via-[#10274a] to-brand-navy border-white/5 py-3.5'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[56px] items-center justify-between md:min-h-[64px]">
            {/* LOGO WORDMARK */}
            <Link
              to={localizedPath('/')}
              className="group relative z-50 focus:outline-none flex items-center"
              aria-label={copy.logoAriaLabel}
            >
              <div className="relative flex h-9 items-center justify-start transition-all duration-300 ease-out md:h-10">
                <img
                  src="/assets/cyberguide-logo-adapted.png"
                  alt="Cyber Guide"
                  className="h-full w-auto object-contain brightness-110 contrast-125 saturate-110 drop-shadow-[0_0_20px_rgba(142,182,240,0.36)] group-hover:drop-shadow-glow transition-all duration-300"
                  width={888}
                  height={290}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={localizedPath(link.path)}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-colors uppercase tracking-wide group ${
                    isRouteActive(link.path)
                      ? 'text-white'
                      : 'text-brand-pale/90 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isRouteActive(link.path) && (
                    <div className="absolute bottom-1 left-3 right-3 h-px bg-brand-gold shadow-[0_0_8px_rgba(198,161,91,0.8)]"></div>
                  )}
                  <span className="absolute inset-0 bg-white/5 rounded-sm scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 -z-0"></span>
                </Link>
              ))}
              <div className="pl-6 ml-2 border-l border-white/10">
                <span className="mr-4 hidden xl:inline-flex rounded-sm border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-brand-light">
                  {copy.edition}
                </span>
                <span
                  className="mr-3 inline-flex overflow-hidden rounded-sm border border-white/20 text-[10px] font-mono uppercase"
                  aria-label={copy.languageSwitcherAria}
                >
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('fr')}
                    className={`px-2 py-1 transition-colors ${
                      locale === 'fr'
                        ? 'bg-white text-brand-navy'
                        : 'bg-transparent text-brand-light hover:bg-white/10'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-2 py-1 transition-colors ${
                      locale === 'en'
                        ? 'bg-white text-brand-navy'
                        : 'bg-transparent text-brand-light hover:bg-white/10'
                    }`}
                  >
                    EN
                  </button>
                </span>
                <Link to={localizedPath('/contact')}>
                  <Button
                    as="span"
                    variant="outline"
                    size="sm"
                    className="!border-brand-steel !text-white hover:!bg-brand-steel hover:!text-white hover:!shadow-glow transition-all duration-300"
                  >
                    {copy.contact}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-main-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-main-menu"
            className="md:hidden absolute top-full left-0 w-full bg-brand-navy border-b border-white/10 shadow-2xl animate-slide-in-right"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={localizedPath(link.path)}
                  className="text-lg font-display font-medium text-white hover:text-brand-gold py-3 pl-4 transition-all border-l-2 border-transparent hover:border-brand-gold hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="px-4 pt-2">
                <div className="inline-flex overflow-hidden rounded-sm border border-white/20 text-[10px] font-mono uppercase">
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('fr')}
                    className={`px-3 py-1.5 transition-colors ${
                      locale === 'fr'
                        ? 'bg-white text-brand-navy'
                        : 'bg-transparent text-brand-light hover:bg-white/10'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-3 py-1.5 transition-colors ${
                      locale === 'en'
                        ? 'bg-white text-brand-navy'
                        : 'bg-transparent text-brand-light hover:bg-white/10'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
              <Link
                to={localizedPath('/contact')}
                className="pt-4 px-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="primary" className="w-full justify-center">
                  {copy.contact}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-grow pt-[88px] md:pt-[104px] print:pt-0">
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>

      {/* FOOTER PREMIUM REVISITED */}
      <footer className="bg-brand-navy text-slate-300 pt-16 pb-8 border-t border-white/10 relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 mb-16">
            {/* Brand & Mission */}
            <div className="md:col-span-4 pr-8">
              <h3 className="text-white font-display font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-brand-gold"></div>
                {copy.mission}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {copy.missionDescription}
              </p>
              <div className="text-xs text-slate-500 font-mono">{copy.copyright}</div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3">
              <h4 className="text-white font-display font-bold uppercase tracking-wider text-sm mb-4">
                {copy.navigation}
              </h4>
              <div className="grid grid-cols-2 gap-x-4">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to={localizedPath('/analyses')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.nav.analyses}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={localizedPath('/outils')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.nav.tools}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={localizedPath('/guides')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.nav.guides}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={localizedPath('/templates')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.nav.templates}
                    </Link>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to={localizedPath('/sources')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Sources
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={localizedPath('/a-propos')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.nav.about}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={localizedPath('/contact')}
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      {copy.contact}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* SOURCES GRID PREMIUM (A1) */}
            <div className="md:col-span-5">
              <div className="flex justify-between items-end mb-6">
                <h4 className="text-white font-display font-bold uppercase tracking-wider text-sm">
                  {copy.sources}
                </h4>
                <Link
                  to={localizedPath('/sources')}
                  className="text-[10px] text-brand-steel font-bold uppercase hover:text-white transition-colors flex items-center gap-1 group"
                >
                  {copy.viewDetails}{' '}
                  <ArrowRight
                    size={10}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Grid of larger cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card ANSSI */}
                <a
                  href="https://cyber.gouv.fr"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-sm hover:border-brand-steel hover:bg-white/10 hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-16 h-12 bg-white rounded-sm flex items-center justify-center p-2 mb-3 shadow-sm">
                    <img
                      src="/assets/anssi.png"
                      alt="ANSSI"
                      className="max-w-full max-h-full object-contain"
                      width={128}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white group-hover:text-brand-gold transition-colors">
                      ANSSI
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">Referentiel FR</div>
                  </div>
                </a>

                {/* Card NIST */}
                <a
                  href="https://www.nist.gov"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-sm hover:border-brand-steel hover:bg-white/10 hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-16 h-12 bg-white rounded-sm flex items-center justify-center p-2 mb-3 shadow-sm">
                    <img
                      src="/assets/nist.png"
                      alt="NIST"
                      className="max-w-full max-h-full object-contain"
                      width={128}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white group-hover:text-brand-gold transition-colors">
                      NIST
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">Framework CSF</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500 font-mono tracking-wide flex items-center gap-2">
              <ShieldCheck size={14} /> {copy.strictDefensive}
            </div>
            <div className="flex items-center gap-6">
              <Link
                to={localizedPath('/blog')}
                className="text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-white transition-colors"
              >
                {copy.journal}
              </Link>
              <Link
                to={localizedPath('/contact')}
                className="text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-white transition-colors"
              >
                {copy.contact}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
