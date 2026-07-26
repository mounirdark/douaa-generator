DOUAA GENERATOR — CMS STATIQUE
==============================

Cette version centralise désormais le contenu afin d’éviter les duplications.

1. data/duas.json
-----------------
Une invocation n’est enregistrée qu’une seule fois dans la liste "duas".
Son champ "categories" détermine les thèmes auxquels elle appartient.
Son champ facultatif "situations" permet de la classer plus précisément.

2. data/themes.json
-------------------
Ce fichier contient le contenu éditorial des pages enrichies :
- introduction ;
- groupes de douaas ;
- versets ;
- hadiths ;
- conseils ;
- FAQ ;
- thèmes associés ;
- SEO.

Les groupes n’embarquent plus une copie complète des invocations.
Ils utilisent seulement "duaIds", par exemple :

"duaIds": ["musa_28_24", "quran_25_74"]

Le moteur récupère automatiquement les textes correspondants dans duas.json.
Une correction faite dans duas.json est donc répercutée partout.

3. Créer une nouvelle page enrichie
------------------------------------
- Vérifier que le thème existe dans "categories" de data/duas.json.
- Ajouter les invocations dans "duas" de data/duas.json.
- Copier la structure de data/theme-template.json dans data/themes.json.
- Remplacer "identifiant-du-theme" par l’identifiant exact de la catégorie.
- Ajouter les identifiants des invocations dans les groupes "duaIds".

La page reste accessible avec l’URL GitHub Pages sûre :
/theme/index.html?id=identifiant-du-theme

4. Compatibilité
----------------
Aucun changement de routage n’a été effectué.
Les pages simples continuent d’afficher automatiquement les douaas selon leur catégorie.
Seuls les thèmes présents dans data/themes.json utilisent la présentation enrichie.

5. Ancien fichier
-----------------
data/theme-content.json est conservé uniquement comme sauvegarde de la version précédente.
Le site lit désormais data/themes.json.
