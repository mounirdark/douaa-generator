# Vérification du site — 15 septembre 2026

Les modifications sont présentes dans le dépôt local ; elles n’ont pas été publiées.

## Résultat par demande

| Demande | Résultat |
| --- | --- |
| Confidentialité et CGU | Pages `/confidentialite/` et `/cgu/` créées, liens dans tous les pieds de page. Identité légale, contact et durée de conservation dans GA4 à compléter avant publication. |
| Clés API hors du navigateur | Aucun secret ni appel à une API privée trouvé. Le générateur lit les fichiers JSON publics. L’identifiant GA4 est public. Aucun serveur supplémentaire nécessaire au fonctionnement actuel. |
| HTTPS | Le domaine public redirige déjà HTTP vers HTTPS avec un statut 301 ; HTTPS répond 200. Vérification réelle avec `curl -I`. Une redirection navigateur limitée au domaine de production complète cette configuration. |
| Consentement | Refuser et accepter ont la même apparence. Aucun chargement GA avant accord. Choix conservé 183 jours, retrait accessible, suppression des cookies GA, synchronisation du retrait entre onglets. |
| Métadonnées | Titres et descriptions conservés, métadonnées de partage complétées sur toutes les pages applicatives. |
| Image sociale | Source SVG éditable, JPEG 1200 × 630 optimisé à environ 33 Ko, métadonnées Open Graph et Twitter, descriptions alternatives. |
| Favicon | SVG, ICO 32 × 32 et icône Apple 180 × 180. |
| Sitemap / robots | Sitemap régénéré : 93 URL canoniques de pages statiques. `robots.txt` autorise l’exploration et indique le sitemap. Les favoris, pages dynamiques, recherche et 404 sont exclus du sitemap. |
| Images / alternatives | Aucun élément HTML `img` préexistant. Les illustrations sont décoratives, en CSS et masquées aux technologies d’assistance. Les nouveaux visuels sociaux disposent d’alternatives textuelles. |
| Compression | JPEG social compressé ; SVG léger. CSS et JS minifiés, cache navigateur réactivé sur les fichiers JSON et URL de la base partagée unifiée. |
| Vitesse | Mesures Lighthouse mobiles locales ci-dessous. |
| Contrastes / responsive | Couleurs de texte renforcées, numéros de conseils lisibles, focus clavier visible, décorations de l’accueil contenues, adaptation du bandeau et des champs aux petits écrans. |
| 404 | `404.html` personnalisée avec retour au générateur, liens absolus et `noindex`. GitHub Pages utilise ce fichier lors du déploiement. |
| Liens | Aucun lien interne ni fragment cassé parmi les 99 fichiers HTML examinés. Ce contrôle ne valide pas toutes les destinations externes. |
| Formulaires | Recherche obligatoire, 2 à 120 caractères après retrait des espaces ; longueur limitée aussi pour les recherches provenant de l’URL. La génération exige au moins une intention. |
| Anti-spam | Aucun formulaire d’envoi, compte, commentaire, email ou endpoint d’écriture : pas de canal de spam applicatif identifié. Aucun CAPTCHA artificiel ajouté à la recherche locale. Pour un futur formulaire d’envoi : validation, limitation de débit et anti-spam côté serveur nécessaires. |
| Analytics | Identifiant GA4 existant conservé. Le code n’envoie qu’une visite générique ; événements de recherche, intentions et fiches désactivés. Paramètres de la propriété distante à contrôler ci-dessous. |
| Appel à l’action | Un seul bouton principal sur l’accueil : « Générer mon invocation », placé avant les choix. Le bouton de nouvelle génération devient secondaire. |

## Mesures Lighthouse finales

Chrome headless, Lighthouse mobile, serveur HTTP local Python, consentement non accordé, le 15 septembre 2026. Ces résultats sont des mesures de laboratoire, pas des données de visiteurs en production.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | Blocage JS | Décalage visuel (CLS) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Accueil | 96 | 100 | 100 | 100 | 2,2 s | 0 ms | 0 |
| Prière de consultation | 99 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Recherche | 98 | 100 | 100 | 100 | 2,2 s | 0 ms | 0 |

Les pistes restantes relevées par Lighthouse concernent principalement le CSS partagé inutilisé sur certaines pages, les ressources bloquant le rendu et les en-têtes de cache/compression du serveur local. Les en-têtes réels dépendent de l’hébergement. Aucun score ne garantit à lui seul l’accessibilité complète.

## Contrôles exécutés

- Audit statique : 99 fichiers HTML, 93 URL de sitemap, titres, descriptions, images sociales, liens internes et ancres : succès.
- Axe WCAG A/AA sur 12 pages représentatives, à 360 et 1 280 px : aucune violation détectée ; aucun débordement horizontal. Pages : accueil, Istikhara, recherche, confidentialité, CGU, 404, mariage, fiche Yunus, bibliothèque, guide, à propos, favoris.
- Parcours navigateur : génération, erreur sans sélection, recherche, validation des espaces seuls, échappement des résultats : succès.
- Consentement avec script GA simulé : première visite, refus, persistance, accord, données minimisées, retrait, suppression des cookies, nouvel accord, retrait inter-onglets, choix expiré et ancien format : succès.
- Vérification de syntaxe JavaScript et des différences Git : succès pour les fichiers de cette intervention. La modification préexistante de `README-CMS-STATIQUE.txt` a été conservée.
- Dépendances de développement verrouillées dans `package-lock.json` ; audit npm sans vulnérabilité signalée lors de l’installation.

## Informations et réglages encore nécessaires

1. **Éditeur** : renseigner une identité juridique exacte et un contact effectif dans les deux pages juridiques. Ces informations n’ont pas été inventées. Les pages restent des textes à compléter, pas une attestation de conformité.
2. **Propriété GA4** : vérifier l’accès et la réception des visites dans la console, désactiver la mesure améliorée (recherches, formulaires, clics et historique), conserver Google Signals désactivé et fixer la conservation des données à la durée choisie, à indiquer dans la politique. La configuration distante et les données déjà stockées n’ont pas pu être examinées ici. Le test automatisé simule le chargement GA ; il ne prouve pas la réception par Google.
3. **Après publication** : vérifier la vraie réponse 404 de l’hébergeur, l’image de partage et les mesures de chargement sur le domaine public. Le déploiement n’a pas été effectué.

## Références consultées

- Le bandeau propose acceptation et refus avec la même simplicité, selon les [explications de la CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/quels-changements-pour-les-internautes).
- La durée de mémorisation d’environ six mois suit la [recommandation de la CNIL](https://www.cnil.fr/fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs).
- La configuration HTTPS relève de l’hébergement ; voir la [documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

Les commandes de reproduction et les sources des assets sont documentées dans `README.md`.

## Complément SEO — 16 septembre 2026

### Changements livrés

- 61 fiches et 25 thèmes prérendus depuis les JSON et les fonctions de rendu existantes. Le HTML contient désormais le contenu principal, les explications, les références et les liens associés. Sur les fiches, l’arabe et la phonétique sont également présents avant JavaScript.
- Les pages statiques ne téléchargent plus les bases JSON à la consultation. Les boutons des fiches lisent leur objet de données embarqué ; les thèmes conservent la copie et utilisent des FAQ HTML natives.
- Les anciennes URL `/douaa.html?id=…` et `/theme/?id=…` continuent à fonctionner. Les titres et descriptions éditorialisés des routes statiques sont conservés ; les scripts ne les remplacent plus au chargement.
- Données structurées Article/CollectionPage et fil d’Ariane générées dans le HTML, sans auteur ou qualification inventés.
- Liens contextuels ajoutés autour de guidance, Istikhara, mariage, couple, famille et stress. Les fiches renvoient à leurs thèmes, à la méthode éditoriale et au signalement d’erreur. Les références coraniques reconnues au format `Coran chapitre:verset` disposent d’un lien de consultation.
- Cinq liens `/themes/undefined/`, auparavant produits par JavaScript sur la page Protection, corrigés dans les données sources.
- Guide Istikhara enrichi : lecture depuis un support, prononciation, sources directes sur le rêve et avis attribué sur la répétition. Les sources liées ne sont pas présentées comme des relecteurs du site. Données structurées FAQ synchronisées avec les réponses visibles.
- Guide PDF téléchargeable dans `assets/guide-istikhara.pdf`, bouton d’impression et style papier. Les réponses sont ouvertes à l’impression puis leur état initial est rétabli.
- Attribution éditoriale clarifiée ; absence de relecteur indépendant identifié explicitée ; signalement possible via le compte Instagram déjà lié au site.
- Analyseur local d’export Search Console CSV (français/anglais), documenté dans le README. Aucun résultat de trafic réel n’a été inventé ou déduit des tests synthétiques.

### Validation

- 86 pages vérifiées dans Chrome avec JavaScript désactivé : textes, arabe, phonétique, contexte, liens et FAQ accessibles.
- Avec JavaScript et requêtes JSON bloquées : langues, favoris et FAQ fonctionnent. Anciennes routes dynamiques également vérifiées.
- 99 fichiers HTML et 93 URL de sitemap : liens internes et métadonnées valides.
- Audit Axe sur 12 pages à 360 et 1 280 px : aucune violation détectée ni débordement horizontal après correction du contraste des références de FAQ.
- Génération HTML reproductible : aucune différence sur les 86 fichiers lors du second build.
- PDF ouvert avec PDFKit et rendu contrôlé visuellement ; textes arabe, français et phonétique présents.
- Analyseur CSV contrôlé avec des données synthétiques : anglais, français, virgule décimale, exclusion des volumes faibles, erreur explicite pour un mauvais type d’export.

| Page | Performance mobile | Accessibilité | Bonnes pratiques | SEO | LCP | Blocage JS | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Istikhara | 99 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Mariage | 98 | 100 | 100 | 100 | 1,8 s | 0 ms | 0 |
| Fiche Younous | 100 | 100 | 100 | 100 | 1,5 s | 0 ms | 0 |

Mesures Lighthouse de laboratoire sur serveur local, sans consentement Analytics. Les rapports JSON sont dans `artifacts/` ; les performances réelles sur le domaine restent à mesurer après déploiement. Aucun score ne garantit un classement dans Google.

### Dépendances encore externes

- Export réel Search Console pour sélectionner les pages selon leurs impressions et requêtes. Commande : `npm run seo:search-console -- /chemin/Pages.csv --output artifacts/opportunites-seo.md`.
- Enregistrement audio vérifié avec autorisation d’utilisation ; aucun audio synthétique ou sans licence ajouté.
- Identité/contact juridiques de l’éditeur et éventuels relecteurs qualifiés réellement identifiés.
- Publication : les changements demeurent locaux.

Sources éditoriales consultées et liées dans le guide : [Bukhari 1166](https://sunnah.com/bukhari:1166), [Dar al-Ifta sur le résultat de l’Istikhara](https://www.dar-alifta.org/en/fatwa/details/7938/how-to-recognize-the-result-of-istikhara-prayer), [Islam Q&A sur le support écrit](https://islamqa.info/en/answers/164729), [SeekersGuidance sur la répétition](https://seekersguidance.org/answers/hanafi-fiqh/can-i-perform-the-prayer-of-seeking-guidance-salat-al-istikhara-more-than-once/).
