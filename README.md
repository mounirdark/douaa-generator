# Douaa Generator

Douaa Generator est un site statique en français permettant de découvrir et de composer des invocations adaptées aux besoins du quotidien. Il réunit un générateur, une bibliothèque thématique, des fiches détaillées et des guides pédagogiques.

Site public : [douaagenerator.fr](https://douaagenerator.fr/)

## Fonctionnalités

- Génération d’une invocation à partir de plusieurs intentions.
- Affichage en français, arabe et phonétique.
- Bibliothèque organisée par thèmes.
- Fiches détaillées avec traduction, contexte et source.
- Favoris conservés localement dans le navigateur, sans création de compte.
- Copie et partage des invocations depuis chaque fiche.
- Guides pédagogiques, dont la prière de consultation (Istikhara).
- Pages statiques optimisées pour le référencement naturel.
- Interface responsive, accessible au clavier et sans inscription.

## Lancer le site localement

Le site charge ses données avec `fetch`. Il faut donc utiliser un serveur local plutôt que d’ouvrir directement `index.html`.

```bash
cd /chemin/vers/douaa-generator
python3 -m http.server 8000
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000).

Pour arrêter le serveur : `Ctrl+C`.

## Structure du projet

```text
douaa-generator/
├── index.html                    # Générateur
├── app.js                        # Logique du générateur
├── style.css                     # Styles partagés
├── data/
│   ├── duas.json                 # Bibliothèque principale
│   ├── themes.json               # Contenus thématiques enrichis
│   └── theme-content.json        # Données éditoriales complémentaires
├── bibliotheque/                 # Index des thèmes
├── themes/                       # Pages statiques des thèmes
├── douaas/                       # Fiches statiques des invocations
├── guide-des-douaas/             # Guide général
├── priere-de-consultation/       # Guide SEO sur l’Istikhara
├── a-propos/                     # Mission et politique éditoriale
├── favoris/                      # Favoris enregistrés sur l’appareil
├── sitemap.xml                   # URL destinées aux moteurs de recherche
└── robots.txt                    # Directives d’exploration
```

## Gestion des contenus

La source principale est [`data/duas.json`](data/duas.json). Chaque invocation peut contenir notamment :

- un identifiant unique ;
- ses catégories et situations ;
- le texte français ;
- le texte arabe ;
- la translittération ;
- la source et le type de texte ;
- le contexte, les enseignements et les erreurs à éviter.

Lorsqu’une invocation est ajoutée ou corrigée, vérifier les pages qui utilisent son identifiant et conserver la même distinction éditoriale entre :

1. verset du Coran ;
2. invocation rapportée dans la Sunna ;
3. formulation personnelle ou générale.

Une formulation générale ne doit jamais être présentée comme un verset ou une parole prophétique.

Les favoris utilisent uniquement le stockage local du navigateur (`localStorage`). Ils ne sont ni synchronisés entre les appareils ni transmis à un serveur.

Google Analytics utilise l’identifiant `G-54ZYPQCDM3`. Le script partagé `analytics.js` attend le consentement explicite du visiteur avant de charger la balise. Il émet une visite générique, sans chemin de page, terme de recherche ni intention choisie. Les événements métier sont désactivés. Le choix expire après 183 jours et peut être retiré via le bouton « Cookies ».

## Référencement naturel

Le site utilise des URL statiques et canoniques :

```text
/themes/protection/
/douaas/yunus-21-87/
/priere-de-consultation/
```

Pour toute nouvelle page indexable :

1. choisir une URL courte et descriptive ;
2. rédiger un titre et une meta-description uniques ;
3. ajouter une URL canonique absolue ;
4. ajouter les métadonnées Open Graph et Twitter ;
5. relier la page depuis un contenu pertinent ;
6. ajouter la page dans `sitemap.xml` avec sa date de modification ;
7. vérifier que le contenu répond à une intention de recherche précise.

Éviter de placer dans le sitemap les anciennes URL dynamiques contenant `?id=` lorsqu’une page statique équivalente existe.

## Google Search Console

Le domaine est validé avec le fichier HTML fourni par Google. Après un déploiement :

1. vérifier que `https://douaagenerator.fr/sitemap.xml` est accessible ;
2. soumettre le sitemap dans Search Console ;
3. inspecter les pages prioritaires ;
4. demander leur indexation une seule fois ;
5. attendre les données d’impressions et de clics avant de modifier les titres.

L’état « Détectée, actuellement non indexée » peut être normal pour de nouvelles URL. Il indique que Google connaît la page mais ne l’a pas encore explorée.

## Vérifications avant publication

```bash
git diff --check
node --check app.js
node --check douaa.js
node --check theme/theme.js
node --check guide-des-douaas/guide.js
xmllint --noout sitemap.xml
```

Vérifier également :

- l’affichage mobile ;
- les liens internes ;
- les textes arabe, phonétique et français ;
- la cohérence entre le sitemap et les URL canoniques ;
- les références religieuses affichées.

## Déploiement

Les fichiers publiés sont statiques et versionnés. Après une modification des données ou des scripts de rendu, exécuter `npm run build` pour régénérer les pages. Le site est publié depuis la branche `main`. Le fichier `CNAME` associe le déploiement au domaine `douaagenerator.fr`.

Après chaque mise à jour :

```bash
git add -A
git commit -m "Description de la modification"
git push origin main
```

## Limites et responsabilité éditoriale

Douaa Generator est un outil pédagogique et non une autorité religieuse. Les contenus doivent être vérifiés avec soin, mais ils ne remplacent pas l’avis d’une personne qualifiée pour une question religieuse précise ou une situation personnelle complexe.

## Maintenance, qualité et confidentialité

Voir [le rapport de vérification](AUDIT-SITE.md) pour les résultats, les limites et les informations juridiques à compléter.

Le site publié reste entièrement statique. Les dépendances npm servent uniquement au développement :

```bash
npm ci
npm run build
npm run test:static
```

`build` exécute `build:assets` (minification JS/CSS et génération des images) puis `build:pages` (prérendu des 61 fiches et 25 thèmes, et PDF Istikhara). Cette seconde étape utilise Chrome et un serveur temporaire limité à 127.0.0.1, sans service externe. Définir `CHROME_PATH` si Chrome n’est pas installé au chemin macOS par défaut. Les SVG sont les sources vectorielles éditables ; les illustrations de l’accueil restent en CSS.

Pour les tests navigateur, démarrer `python3 -m http.server 8000` dans un autre terminal, puis lancer :

```bash
npm run test:browser
npm run audit:accessibility
npm run audit:performance
```

Les scripts utilisent Chrome installé sur macOS par défaut. Sur une autre machine, définir `CHROME_PATH` avec le chemin du navigateur. Les captures et rapports sont écrits dans `artifacts/` (ignoré par Git). Les tests de consentement simulent le script Analytics sans transmettre de statistiques.

Le générateur `scripts/generate-new-dua-pages.mjs` inclut les métadonnées sociales, favicons, liens juridiques et contrôles de recherche. Mettre à jour le sitemap après l’ajout de pages ; `test:static` détecte les écarts.

Aucune clé API privée n’est nécessaire. L’identifiant GA4 `G-54ZYPQCDM3` est un identifiant public, pas un secret. Tout futur service nécessitant une clé privée devra être appelé depuis un serveur, avec secret dans l’environnement, validation et limitation de débit côté serveur.

## Contenus HTML complets et SEO

- Les routes `douaas/*/` et `themes/*/` contiennent leur contenu complet avant l’exécution de JavaScript. Le prérendu emploie les mêmes fonctions de rendu que les anciennes routes dynamiques, à partir des JSON de `data/`.
- Les fiches embarquent uniquement leur propre objet de données pour les langues, la copie et les favoris. Les thèmes n’ont plus besoin de télécharger les JSON à la lecture. Le mode sans JavaScript conserve les textes, les liens et les FAQ natives.
- Ne pas modifier manuellement les sections générées de ces 86 pages : modifier les données ou les fonctions de rendu, puis lancer `npm run build`. Les titres, descriptions et URL canoniques déjà éditorialisés dans les fichiers HTML sont conservés.
- Les liens contextuels et les liens vers la méthode éditoriale sont produits dans `scripts/prerender.cjs`. Les résumés statiques d’origine sont remplacés par le contenu complet, sans double version visible.
- Le guide Istikhara reste rédigé dans `priere-de-consultation/index.html`. Son PDF `assets/guide-istikhara.pdf` est régénéré pendant le build avec le style d’impression et les réponses ouvertes. L’impression navigateur fonctionne aussi via le bouton prévu.
- `npm run test:seo`, avec le serveur local sur le port 8000, vérifie toutes les pages sans JavaScript et les fonctions interactives avec l’accès aux JSON bloqué. `SITE_URL` permet un autre serveur de test.

### Exploiter un export Search Console

Dans Search Console, ouvrir **Performances → Résultats de recherche**, choisir une période explicite (par exemple les trois derniers mois), puis exporter le tableau **Pages** ou **Requêtes** en CSV. Ne pas utiliser le tableau par date. L’outil accepte les en-têtes français et anglais.

```bash
npm run seo:search-console -- /chemin/Pages.csv --output artifacts/opportunites-seo.md
```

Le rapport classe des pistes à examiner selon les impressions, la position moyenne et le taux de clics. Les seuils sont exploratoires ; ils ne constituent ni une prévision de trafic ni une preuve de concurrence entre pages. Consigner les changements et comparer des périodes de durée égale, en tenant compte de la saisonnalité. L’outil ne transmet rien à un service externe.

L’accès Search Console, une identité juridique et des relecteurs réellement identifiés restent à fournir. Aucun auteur, diplôme ou contrôle religieux indépendant n’a été inventé. L’audio reste à intégrer à partir d’un enregistrement vérifié et autorisé ; aucune récitation synthétique ou sans licence n’a été ajoutée.
