import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const database = JSON.parse(fs.readFileSync(path.join(root, "data/duas.json"), "utf8"));

const newDuaIds = [
  "quran_2_286_burden",
  "quran_3_16_forgiveness",
  "quran_3_147_steadfastness",
  "quran_14_41_family_forgiveness",
  "quran_18_10_right_guidance",
  "quran_23_97_98_whispers",
  "quran_40_7_9_family_paradise",
  "quran_46_15_righteous_descendants",
  "quran_59_10_no_resentment",
  "quran_66_8_complete_light",
  "quran_71_28_believers_forgiveness",
  "prophetic_religion_world_hereafter",
  "prophetic_guidance_piety_chastity",
  "prophetic_wronged_self",
  "prophetic_pardon_afuw",
  "prophetic_help_worship",
  "prophetic_love_allah",
  "prophetic_distress_tawhid",
  "prophetic_distress_allah_rabbi",
  "prophetic_calamity_reward",
  "prophetic_refuge_wrongdoing",
  "prophetic_funeral_all_muslims",
  "prophetic_graveyard_greeting",
  "prophetic_deceased_reward",
  "prophetic_healing_ruqya",
  "prophetic_healing_seven_times",
  "prophetic_spouse_goodness",
  "prophetic_before_intimacy",
  "prophetic_all_good",
  "prophetic_bad_character_refuge",
  "prophetic_refuge_poverty",
  "prophetic_refuge_severe_trial",
  "prophetic_useless_knowledge"
];

const categoryMap = new Map(database.categories.map((category) => [category.id, category]));
const duaMap = new Map(database.duas.map((dua) => [dua.id, dua]));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function descriptionFor(dua) {
  const description = `Découvrez ${dua.title.toLowerCase()}, avec le texte arabe, la phonétique, la traduction française, le contexte et la source : ${dua.source}`;
  return description.length <= 158 ? description : `${description.slice(0, 154).trim()}…`;
}

function buildPage(dua) {
  const slug = dua.id.replaceAll("_", "-");
  const url = `https://douaagenerator.fr/douaas/${slug}/`;
  const title = `${dua.title} — Douaa Generator`;
  const description = descriptionFor(dua);
  const themes = (dua.categories || []).map((id) => categoryMap.get(id)).filter(Boolean);
  const themeLinks = themes.map((theme) =>
    `<a href="/themes/${encodeURIComponent(theme.id)}/">${escapeHtml(theme.label)}</a>`
  ).join(" · ");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/style.min.css?v=25">

  <link rel="canonical" href="${url}">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Douaa Generator">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
</head>

<body data-dua-id="${escapeHtml(dua.id)}" data-dua-slug="${slug}">
  <div class="page-background"></div>

  <header class="site-header">
    <nav class="site-nav" aria-label="Navigation principale">
      <a class="site-brand" href="/">
        <span class="site-brand-symbol" aria-hidden="true">☾</span>
        <span>Douaa Generator</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mainNavigation">☰</button>
      <ul id="mainNavigation" class="site-nav-links">
        <li><a class="site-nav-link" href="/">Générateur</a></li>
        <li><a class="site-nav-link" href="/bibliotheque/">Bibliothèque</a></li>
        <li><a class="site-nav-link" href="/recherche/">Rechercher</a></li>
        <li><a class="site-nav-link" href="/guide-des-douaas/">Guide des douaas</a></li>
        <li><a class="site-nav-link" href="/a-propos/">À propos</a></li>
      </ul>
    </nav>
  </header>

  <main class="container detail-page">
    <a class="back-link" href="/bibliotheque/"><span aria-hidden="true">←</span> Retour à la bibliothèque</a>

    <section id="detailPanel" class="detail-panel hidden">
      <header class="detail-header">
        <p id="detailType" class="eyebrow"></p>
        <h1 id="detailTitle"></h1>
        <p id="detailSource" class="detail-source"></p>
      </header>
      <div class="detail-language-switcher language-switcher" aria-label="Choisir la langue">
        <button class="language-button active" type="button" data-detail-lang="fr" aria-pressed="true">Français</button>
        <button class="language-button" type="button" data-detail-lang="ar" aria-pressed="false">العربية</button>
        <button class="language-button" type="button" data-detail-lang="ph" aria-pressed="false">Phonétique</button>
      </div>
      <article class="detail-text-card detail-main-text"><h2>Texte de l’invocation</h2><p id="detailText"></p></article>
      <section id="referenceSection" class="detail-section hidden"><h2>Référence et origine</h2><p id="detailReference"></p></section>
      <section id="contextSection" class="detail-section hidden"><h2>Contexte</h2><p id="detailContext"></p></section>
      <section id="meaningSection" class="detail-section hidden"><h2>Comprendre cette douaa</h2><p id="detailMeaning"></p></section>
      <section id="whenSection" class="detail-section hidden"><h2>Quand la réciter ?</h2><ul id="detailWhen"></ul></section>
      <section id="applicationSection" class="detail-section detail-highlight-section hidden"><h2>Comment l’appliquer aujourd’hui ?</h2><ul id="detailApplication"></ul></section>
      <section id="lessonsSection" class="detail-section hidden"><h2>Enseignements à retenir</h2><ul id="detailLessons"></ul></section>
      <section id="benefitsSection" class="detail-section hidden"><h2>Ce qu’elle peut nous apporter</h2><ul id="detailBenefits"></ul></section>
      <section id="mistakesSection" class="detail-section detail-warning-section hidden"><h2>Erreurs fréquentes à éviter</h2><ul id="detailMistakes"></ul></section>
      <section id="relatedSection" class="detail-section hidden"><h2>Douaas similaires</h2><div id="relatedDuas" class="related-duas-grid"></div></section>
      <nav class="detail-navigation" aria-label="Navigation de la fiche">
        <a id="backToThemeLink" class="secondary-button" href="/bibliotheque/">Retour au thème</a>
        <a class="secondary-button" href="/recherche/">Rechercher une douaa</a>
      </nav>
      <div class="detail-actions">
        <button id="shareDuaBtn" class="secondary-button" type="button">Partager cette douaa</button>
        <a class="primary-button compact detail-return-button" href="/">Générer une autre invocation</a>
      </div>
      <p id="shareMessage" class="message message-success hidden" role="status">Le lien a été copié.</p>
    </section>

    <section id="staticDuaSummary" class="detail-panel static-seo-content">
      <p class="eyebrow">${escapeHtml(dua.type)}</p>
      <h2>${escapeHtml(dua.title)}</h2>
      <p class="detail-static-arabic" lang="ar" dir="rtl">${escapeHtml(dua.arabic)}</p>
      <p><strong>Phonétique :</strong> ${escapeHtml(dua.transliteration)}</p>
      <p><strong>Traduction :</strong> ${escapeHtml(dua.french)}</p>
      <p class="detail-source"><strong>Source :</strong> ${escapeHtml(dua.source)}</p>
      <h3>Contexte et utilisation</h3>
      <p>${escapeHtml(dua.context)}</p>
      <p>Cette invocation peut être récitée avec attention et compréhension, sans lui attribuer une promesse ou un nombre de répétitions qui ne figure pas dans sa source. L’invocation accompagne les démarches licites et la confiance placée en Allah.</p>
      <p><strong>Thèmes associés :</strong> ${themeLinks}</p>
    </section>

    <section id="detailLoading" class="detail-panel detail-state-panel"><p>Chargement de la douaa…</p></section>
    <section id="detailError" class="detail-panel detail-state-panel hidden" role="alert">
      <h2>Douaa introuvable</h2><p>Cette fiche n’existe pas ou n’est pas encore disponible.</p>
      <a class="primary-button compact detail-return-button" href="/">Retour au générateur</a>
    </section>
  </main>

  <script src="/menu.min.js?v=25"></script>
  <script src="/douaa.min.js?v=25"></script>
</body>
</html>
`;
}

for (const id of newDuaIds) {
  const dua = duaMap.get(id);
  if (!dua) throw new Error(`Douaa absente de data/duas.json : ${id}`);
  const directory = path.join(root, "douaas", id.replaceAll("_", "-"));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), buildPage(dua));
}

console.log(`${newDuaIds.length} pages statiques générées.`);
