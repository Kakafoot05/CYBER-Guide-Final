# Cyber Guide - Tuto complet de deploiement + SEO

Ce guide couvre:

- Deploiement recommande (sans VPS): Cloudflare Pages
- Deploiement alternatif (avec VPS): OVHcloud + Nginx
- Checklist SEO pour la mise en ligne et la croissance

## 1) Preparation locale (obligatoire)

1. Installer Node.js 20+ et npm.
2. A la racine du projet:

```bash
npm install
```

3. Configurer l'environnement:

```bash
cp .env.example .env.local
```

Variables conseillees:

```bash
VITE_SITE_URL=https://cyber-guide.fr
VITE_USE_HASH_ROUTER=false
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/<id>
```

4. Verifier qualite + build:

```bash
npm run quality
```

5. Verifier localement le build:

```bash
npm run preview
```

## 2) Deploiement recommande (sans VPS): Cloudflare Pages

Pourquoi: site Vite statique => plus simple, plus robuste, tres bon CDN edge, cout bas.

### Etape A - Pousser le code sur GitHub

```bash
git add .
git commit -m "Deploy prep"
git push origin main
```

### Etape B - Creer le projet Pages

1. Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages.
2. Importer le repo GitHub.
3. Parametres build:

- Framework preset: `React (Vite)` (ou equivalent)
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

4. Deploy.

### Etape C - Brancher le domaine `cyber-guide.fr`

1. Pages -> ton projet -> Custom domains -> Set up a domain.
2. Ajouter:

- `cyber-guide.fr`
- `www.cyber-guide.fr` (recommande)

3. Suivre les enregistrements DNS proposes (A/CNAME selon ton setup).
4. Activer redirection canonique:

- `www` -> apex (`cyber-guide.fr`) ou inverse (choisis 1 canonical unique).

### Etape D - Variables d'environnement dans Cloudflare

Project Settings -> Environment variables (Production + Preview):

- `VITE_SITE_URL=https://cyber-guide.fr`
- `VITE_USE_HASH_ROUTER=false`
- `VITE_FORMSPREE_ENDPOINT=...` (si formulaire en prod)

Puis redeployer.

## 3) Deploiement alternatif (avec VPS): OVHcloud + Nginx

## Choix VPS

Pour ce projet statique, prends au minimum:

- `VPS-1` pour debut/traffic modere
- `VPS-2` si tu veux plus de marge CPU/RAM + 1 Gbit/s

### Etape A - Provisionner le serveur Ubuntu

1. Creer le VPS (Ubuntu 22.04 LTS ou 24.04 LTS).
2. Se connecter en SSH:

```bash
ssh ubuntu@IP_DU_VPS
```

3. Mettre a jour:

```bash
sudo apt update && sudo apt upgrade -y
```

4. Installer Nginx:

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Etape B - Uploader le build

Sur ta machine locale:

```bash
npm run build
```

Copier le `dist` vers le VPS:

```bash
scp -r dist/* ubuntu@IP_DU_VPS:/var/www/cyber-guide/
```

Sur le VPS:

```bash
sudo mkdir -p /var/www/cyber-guide
sudo chown -R www-data:www-data /var/www/cyber-guide
```

### Etape C - Config Nginx (SPA)

Creer `/etc/nginx/sites-available/cyber-guide`:

```nginx
server {
    listen 80;
    server_name cyber-guide.fr www.cyber-guide.fr;
    root /var/www/cyber-guide;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location = /robots.txt { try_files $uri =404; }
    location = /sitemap.xml { try_files $uri =404; }
}
```

Activer:

```bash
sudo ln -s /etc/nginx/sites-available/cyber-guide /etc/nginx/sites-enabled/cyber-guide
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Etape D - DNS domaine

Chez ton registrar:

- `A` record apex `cyber-guide.fr` -> `IP_DU_VPS`
- `CNAME` `www` -> `cyber-guide.fr`

### Etape E - HTTPS

Installer Certbot et certificat:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cyber-guide.fr -d www.cyber-guide.fr
```

Verifier renouvellement auto:

```bash
sudo certbot renew --dry-run
```

## 4) Checklist SEO de lancement (priorite haute)

### A. Indexation et technique

1. Ouvrir Google Search Console (propriete `https://cyber-guide.fr`).
2. Soumettre `https://cyber-guide.fr/sitemap.xml`.
3. Verifier que `robots.txt` est accessible.
4. Verifier canonical, title, meta description des pages principales.
5. Forcer 1 domaine canonique (`www` ou non-www) avec redirection 301.

### B. Performance et UX (Core Web Vitals)

1. Mesurer PageSpeed Insights (mobile en priorite).
2. Cibles:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

3. Actions rapides:

- compresser images hero/OG (WebP/AVIF)
- garder JS minimal sur home
- fixer dimensions de toutes les images

### C. Contenu qui rank

1. Chaque page doit avoir:

- un `h1` unique
- un angle "probleme -> action cybersécurité operationnelle"
- un maillage interne vers Guides/Playbooks/Analyses

2. Ajouter 1 analyse neuve par semaine (fraicheur + autorite thematique).
3. Ajouter des sections "IOCs", "Detection (Sigma/KQL)", "Remediation" sur les contenus experts.

### D. Donnees structurees

1. Garder JSON-LD valide sur les pages importantes.
2. Tester avec Rich Results Test.
3. Corriger toute erreur Search Console "Enhancements".

## 5) Routine hebdomadaire (croissance SEO)

1. Publier 1 contenu expert (analyse ou guide).
2. Ameliorer 1 page existante (mise a jour date + enrichissement).
3. Ajouter 3-5 liens internes pertinents.
4. Verifier Search Console:

- pages indexees
- requetes en hausse
- erreurs CWV/coverage

## 6) Routine mensuelle (qualite + conversion)

1. Audit Lighthouse sur Home + 3 pages strategiques.
2. Revoir titles/metas des pages a fortes impressions mais CTR faible.
3. Mettre a jour sitemap/lastmod apres grosses revisions.
4. Verifier favicon, OG image et snippets partages reseaux.

## 7) Definition du succes (KPI)

30 jours:

- pages indexees stables
- aucune erreur critique GSC
- CWV majoritairement "Good"

90 jours:

- hausse des impressions SEO
- hausse du CTR moyen
- hausse du trafic organique sur pages guides/analyses
