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

Google Analytics utilise l’identifiant `G-54ZYPQCDM3`. Le script partagé `analytics.js` attend le consentement explicite du visiteur avant de charger la balise et mesure les consultations, recherches, générations, favoris, copies et partages.

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

Le projet ne nécessite aucune compilation. Il est publié comme site statique depuis la branche `main`. Le fichier `CNAME` associe le déploiement au domaine `douaagenerator.fr`.

Après chaque mise à jour :

```bash
git add -A
git commit -m "Description de la modification"
git push origin main
```

## Limites et responsabilité éditoriale

Douaa Generator est un outil pédagogique et non une autorité religieuse. Les contenus doivent être vérifiés avec soin, mais ils ne remplacent pas l’avis d’une personne qualifiée pour une question religieuse précise ou une situation personnelle complexe.
