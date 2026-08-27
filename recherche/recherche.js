"use strict";

const searchElements = {
  form: document.getElementById("globalSearchForm"),
  input: document.getElementById("globalSearchInput"),
  results: document.getElementById("searchResults"),
  status: document.getElementById("searchStatus"),
  loading: document.getElementById("searchLoading"),
  error: document.getElementById("searchError"),
  suggestions: document.querySelectorAll("[data-search-suggestion]")
};

let searchDatabase = null;

const staticDuaIds = new Set([
  "akhirah_2_201", "ayyub_21_83", "beneficial_rizq", "debt_anxiety",
  "deceased_general", "family_protection_general", "firm_heart",
  "gratitude_27_19", "guidance_3_8", "halal_sufficiency",
  "hasbunallah_3_173", "healing_prophetic", "knowledge_20_114",
  "musa_28_24", "musa_ease_20_25_28", "paradise_general",
  "parents_17_24", "patience_2_250", "protection_words", "quran_3_38",
  "quran_14_40", "quran_21_89", "quran_25_74", "quran_30_21_general",
  "repentance_adam_7_23", "sayyid_istighfar_meaning", "work_long_general",
  "yunus_21_87", "quran_2_286_burden", "quran_3_16_forgiveness",
  "quran_3_147_steadfastness", "quran_14_41_family_forgiveness",
  "quran_18_10_right_guidance", "quran_23_97_98_whispers",
  "quran_40_7_9_family_paradise", "quran_46_15_righteous_descendants",
  "quran_59_10_no_resentment", "quran_66_8_complete_light",
  "quran_71_28_believers_forgiveness", "prophetic_religion_world_hereafter",
  "prophetic_guidance_piety_chastity", "prophetic_wronged_self",
  "prophetic_pardon_afuw", "prophetic_help_worship", "prophetic_love_allah",
  "prophetic_distress_tawhid", "prophetic_distress_allah_rabbi",
  "prophetic_calamity_reward", "prophetic_refuge_wrongdoing",
  "prophetic_funeral_all_muslims", "prophetic_graveyard_greeting",
  "prophetic_deceased_reward", "prophetic_healing_ruqya",
  "prophetic_healing_seven_times", "prophetic_spouse_goodness",
  "prophetic_before_intimacy", "prophetic_all_good",
  "prophetic_bad_character_refuge", "prophetic_refuge_poverty",
  "prophetic_refuge_severe_trial", "prophetic_useless_knowledge"
]);

document.addEventListener("DOMContentLoaded", initializeSearch);

async function initializeSearch() {
  bindSearchEvents();

  try {
    const response = await fetch("/data/duas.json?v=25", { cache: "no-store" });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    searchDatabase = await response.json();
    searchElements.loading.classList.add("hidden");

    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    if (initialQuery) {
      searchElements.input.value = initialQuery;
      performSearch(initialQuery);
    } else {
      searchElements.status.textContent = `${searchDatabase.duas.length} douaas`;
    }
  } catch (error) {
    console.error("Erreur de recherche :", error);
    searchElements.loading.classList.add("hidden");
    searchElements.error.classList.remove("hidden");
    searchElements.status.textContent = "Indisponible";
  }
}

function bindSearchEvents() {
  searchElements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch(searchElements.input.value, true);
  });

  searchElements.input.addEventListener("input", () => {
    const query = searchElements.input.value.trim();
    if (query.length >= 2 || query.length === 0) performSearch(query);
  });

  searchElements.suggestions.forEach((button) => {
    button.addEventListener("click", () => {
      searchElements.input.value = button.dataset.searchSuggestion || "";
      performSearch(searchElements.input.value, true);
      searchElements.input.focus();
    });
  });
}

function performSearch(rawQuery, updateHistory = false) {
  if (!searchDatabase) return;
  const query = rawQuery.trim();

  if (updateHistory) {
    const url = query ? `/recherche/?q=${encodeURIComponent(query)}` : "/recherche/";
    window.history.replaceState({}, "", url);
  }

  if (!query) {
    searchElements.status.textContent = `${searchDatabase.duas.length} douaas`;
    searchElements.results.innerHTML = createThemeOverview();
    return;
  }

  const normalizedQuery = normalizeText(query);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const categoriesById = new Map(searchDatabase.categories.map((category) => [category.id, category]));

  const duaResults = searchDatabase.duas
    .map((dua) => ({ dua, score: scoreDua(dua, terms, categoriesById) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.dua.title || "").localeCompare(b.dua.title || "", "fr"));

  const themeResults = searchDatabase.categories.filter((category) =>
    terms.every((term) => normalizeText(`${category.label} ${category.description} ${category.id}`).includes(term))
  );

  const total = duaResults.length + themeResults.length;
  searchElements.status.textContent = `${total} ${total > 1 ? "résultats" : "résultat"}`;

  if (updateHistory) {
    window.trackEvent?.("search", {
      search_term: query,
      result_count: total
    });
  }

  if (!total) {
    searchElements.results.innerHTML = `
      <article class="panel search-empty-card">
        <h3>Aucun résultat pour « ${escapeHtml(query)} »</h3>
        <p>Essayez un mot plus court, un thème comme « protection » ou une partie de la phonétique sans accent.</p>
      </article>`;
    return;
  }

  searchElements.results.innerHTML = `
    ${themeResults.length ? `<div class="search-theme-results">${themeResults.map(createThemeResult).join("")}</div>` : ""}
    <div class="search-dua-results">${duaResults.map(({ dua }) => createDuaResult(dua, categoriesById)).join("")}</div>
  `;
}

function scoreDua(dua, terms, categoriesById) {
  const title = normalizeText(dua.title || "");
  const categories = (dua.categories || []).map((id) => {
    const category = categoriesById.get(id);
    return `${id} ${category?.label || ""} ${category?.description || ""}`;
  }).join(" ");
  const fields = normalizeText([
    dua.french, dua.transliteration, dua.arabic, dua.source, dua.context,
    dua.meaning, dua.type, categories
  ].flat().filter(Boolean).join(" "));

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 8;
    else if (normalizeText(categories).includes(term)) score += 5;
    else if (fields.includes(term)) score += 2;
    else return 0;
  }
  return score;
}

function createThemeOverview() {
  return `
    <div class="search-theme-results">
      ${searchDatabase.categories.map(createThemeResult).join("")}
    </div>`;
}

function createThemeResult(category) {
  return `
    <a class="search-theme-card" href="/themes/${encodeURIComponent(category.id)}/">
      <span aria-hidden="true">${escapeHtml(category.icon || "✦")}</span>
      <span><strong>${escapeHtml(category.label)}</strong><small>${escapeHtml(category.description || "")}</small></span>
    </a>`;
}

function createDuaResult(dua, categoriesById) {
  const categories = (dua.categories || []).map((id) => categoriesById.get(id)).filter(Boolean);
  const excerpt = dua.french || dua.context || "Consulter le texte et sa référence.";
  return `
    <article class="panel search-dua-card">
      <div class="search-dua-meta">
        <span>${escapeHtml(dua.type || "Invocation")}</span>
        <small>${escapeHtml(dua.source || "")}</small>
      </div>
      <h3><a href="${getDuaUrl(dua.id)}">${escapeHtml(dua.title || "Découvrir cette invocation")}</a></h3>
      <p>${escapeHtml(excerpt)}</p>
      <div class="search-result-themes">
        ${categories.slice(0, 5).map((category) => `<a href="/themes/${encodeURIComponent(category.id)}/">${escapeHtml(category.label)}</a>`).join("")}
      </div>
      <a class="details-link" href="${getDuaUrl(dua.id)}">Voir la fiche complète <span aria-hidden="true">→</span></a>
    </article>`;
}

function getDuaUrl(id) {
  return staticDuaIds.has(id)
    ? `/douaas/${id.replaceAll("_", "-")}/`
    : `/douaa.html?id=${encodeURIComponent(id)}`;
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
