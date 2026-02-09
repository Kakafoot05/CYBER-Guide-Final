import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './UI';
import { PageTransition } from './Motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
    { name: 'Analyses', path: '/analyses' },
    { name: 'Guides', path: '/guides' },
    { name: 'Projets', path: '/projets' },
    { name: 'Outils', path: '/outils' },
    { name: 'Templates', path: '/templates' },
    { name: 'A Propos', path: '/a-propos' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-navy selection:bg-brand-steel selection:text-white overflow-x-hidden">
      <a
        href="#main-content"
        className="absolute left-4 top-2 z-[60] -translate-y-16 rounded-sm border border-white/30 bg-brand-navy px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-transform focus:translate-y-0"
      >
        Aller au contenu
      </a>
      {/* NAVBAR PREMIUM */}
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border-b ${
          isScrolled
            ? 'bg-brand-navy/98 backdrop-blur-xl border-white/20 py-3 shadow-[0_18px_42px_-22px_rgba(3,13,34,0.9)]'
            : 'bg-gradient-to-r from-brand-navy via-[#10274a] to-brand-navy border-white/5 py-4 lg:py-5'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* LOGO WORDMARK */}
            <Link
              to="/"
              className="group relative z-50 focus:outline-none flex items-center"
              aria-label="Retour Accueil"
            >
              <div
                className={`
                relative flex items-center justify-start transition-all duration-300 ease-out
                ${isScrolled ? 'h-8' : 'h-10 md:h-12'}
              `}
              >
                <img
                  src="/assets/cyberguide-logo-adapted.png"
                  alt="Cyber Guide"
                  className="h-full w-auto object-contain brightness-110 contrast-125 saturate-110 drop-shadow-[0_0_20px_rgba(142,182,240,0.36)] group-hover:drop-shadow-glow transition-all duration-300"
                  width={888}
                  height={290}
                  decoding="async"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-colors uppercase tracking-wide group ${
                    location.pathname.startsWith(link.path)
                      ? 'text-white'
                      : 'text-brand-pale/90 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {location.pathname.startsWith(link.path) && (
                    <div className="absolute bottom-1 left-3 right-3 h-px bg-brand-gold shadow-[0_0_8px_rgba(198,161,91,0.8)]"></div>
                  )}
                  <span className="absolute inset-0 bg-white/5 rounded-sm scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 -z-0"></span>
                </Link>
              ))}
              <div className="pl-6 ml-2 border-l border-white/10">
                <span className="mr-4 hidden xl:inline-flex rounded-sm border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-brand-light">
                  Edition 2026
                </span>
                <Link to="/contact">
                  <Button
                    as="span"
                    variant="outline"
                    size="sm"
                    className="!border-brand-steel !text-white hover:!bg-brand-steel hover:!text-white hover:!shadow-glow transition-all duration-300"
                  >
                    Contact
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
                  to={link.path}
                  className="text-lg font-display font-medium text-white hover:text-brand-gold py-3 pl-4 transition-all border-l-2 border-transparent hover:border-brand-gold hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" className="pt-4 px-4" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Contact
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
                Mission
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Plateforme d'analyse et d'outillage defensif pour les equipes cyber operationnelles.
                Priorite: parcours actionnables, standards fiables et execution en conditions
                reelles.
              </p>
              <div className="text-xs text-slate-500 font-mono">© 2026 CYBER GUIDE.</div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3">
              <h4 className="text-white font-display font-bold uppercase tracking-wider text-sm mb-4">
                Navigation
              </h4>
              <div className="grid grid-cols-2 gap-x-4">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to="/analyses"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Analyses
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/outils"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Outils
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/guides"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/templates"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Templates
                    </Link>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to="/sources"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Sources
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/a-propos"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      A Propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-brand-gold transition-colors block py-1"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* SOURCES GRID PREMIUM (A1) */}
            <div className="md:col-span-5">
              <div className="flex justify-between items-end mb-6">
                <h4 className="text-white font-display font-bold uppercase tracking-wider text-sm">
                  Sources & Referentiels
                </h4>
                <Link
                  to="/sources"
                  className="text-[10px] text-brand-steel font-bold uppercase hover:text-white transition-colors flex items-center gap-1 group"
                >
                  Voir details{' '}
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
              <ShieldCheck size={14} /> STRICTEMENT DEFENSIF // CYBER OPERATIONNELLE
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/blog"
                className="text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-white transition-colors"
              >
                Journal
              </Link>
              <Link
                to="/contact"
                className="text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
