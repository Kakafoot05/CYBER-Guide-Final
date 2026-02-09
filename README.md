# Cyber Guide

Plateforme front-end orientee cybersécurité operationnelle: analyses, playbooks et outils defensifs.

## Stack

- React 18 + TypeScript
- Vite 7
- Tailwind CSS
- Framer Motion
- React Router

## Prerequis

- Node.js 20+ (recommande)
- npm 10+

## Installation

```bash
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` puis ajuster:

```bash
VITE_SITE_URL=https://cyber-guide.fr
VITE_USE_HASH_ROUTER=false
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/<id>
```

- `VITE_SITE_URL`: URL publique du site, utilisee pour canonical/OG/schema/sitemap.
- `VITE_USE_HASH_ROUTER`: `false` recommande pour le SEO. Utiliser `true` si hebergeur sans rewrite SPA.
- `VITE_FORMSPREE_ENDPOINT`: optionnel. Sans valeur, le formulaire Contact bascule sur `mailto:`.

## Scripts

- `npm run dev`: lance le serveur de developpement.
- `npm run typecheck`: verification TypeScript.
- `npm run lint`: verification ESLint.
- `npm run lint:fix`: correction automatique ESLint.
- `npm run test`: mode watch Vitest.
- `npm run test:run`: tests + couverture.
- `npm run format`: formatage Prettier.
- `npm run format:check`: verification formatage Prettier.
- `npm run sitemap`: generation automatique de `public/sitemap.xml`.
- `npm run build`: typecheck + build production + generation sitemap.
- `npm run quality`: lint + tests + build.
- `npm run preview`: previsualisation du build.

## Structure du contenu

- `data.ts`: base des analyses, playbooks, projets et logiciels.
- `guides.ts`: base des guides piliers SEO (hub + pages detail).
- `pages/`: pages applicatives.
- `components/`: layout, UI et animations.
- `public/assets/`: logos et images statiques.

## Deploiement

- Le routeur utilise `BrowserRouter` par defaut pour des URLs SEO propres.
- Les rewrites SPA sont preconfigurees pour:
- `public/_redirects` (Netlify)
- `vercel.json` (Vercel)
- Si ton hebergeur ne supporte pas les rewrites, active `VITE_USE_HASH_ROUTER=true`.

## SEO

- SEO dynamique par page via `components/Seo.tsx` (title, description, canonical, Open Graph, Twitter).
- Donnees structurees JSON-LD injectees par page.
- Hub `guides` + pages piliers long format reliees au reste du site.
- Maillage interne renforce (analyses <-> guides <-> playbooks <-> outils).
- `public/robots.txt` fourni.
- `public/sitemap.xml` est regénéré automatiquement via `npm run sitemap`.

## Performance (CWV)

- Navbar optimisee avec listener `scroll` passif + `requestAnimationFrame`.
- Suppression du layout shift du contenu principal au scroll.
- Images critiques/secondaires explicites (dimensions + lazy loading quand pertinent).
- Preload du logo principal dans `index.html`.
