"use strict";

let database = null;
let currentDua = null;
let currentLanguage = "fr";

const detailElements = {
  panel: document.getElementById("detailPanel"),
  loading: document.getElementById("detailLoading"),
  error: document.getElementById("detailError"),
  type: document.getElementById("detailType"),
  title: document.getElementById("detailTitle"),
  source: document.getElementById("detailSource"),
  text: document.getElementById("detailText"),
  referenceSection: document.getElementById("referenceSection"),
  reference: document.getElementById("detailReference"),
  contextSection: document.getElementById("contextSection"),
  context: document.getElementById("detailContext"),
  meaningSection: document.getElementById("meaningSection"),
  meaning: document.getElementById("detailMeaning"),
  whenSection: document.getElementById("whenSection"),
  when: document.getElementById("detailWhen"),
  applicationSection: document.getElementById("applicationSection"),
  application: document.getElementById("detailApplication"),
  lessonsSection: document.getElementById("lessonsSection"),
  lessons: document.getElementById("detailLessons"),
  benefitsSection: document.getElementById("benefitsSection"),
  benefits: document.getElementById("detailBenefits"),
  mistakesSection: document.getElementById("mistakesSection"),
  mistakes: document.getElementById("detailMistakes"),
  relatedSection: document.getElementById("relatedSection"),
  related: document.getElementById("relatedDuas"),
  languageButtons: document.querySelectorAll("[data-detail-lang]"),
  shareButton: document.getElementById("shareDuaBtn"),
  shareMessage: document.getElementById("shareMessage"),
  backToThemeLink: document.getElementById("backToThemeLink")
};

document.addEventListener("DOMContentLoaded", initializeDetailPage);

async function initializeDetailPage() {
  bindDetailEvents();

  const duaId = document.body.dataset.duaId ||
    new URLSearchParams(window.location.search).get("id");

  if (!duaId) {
    showDetailError();
    return;
  }

  try {
    const response = await fetch("/data/duas.json?v=22", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    database = await response.json();
    currentDua = database.duas.find((dua) => dua.id === duaId);

    if (!currentDua) {
      showDetailError();
      return;
    }

    renderDetailPage();
    hideElement(detailElements.loading);
    showElement(detailElements.panel);
  } catch (error) {
    console.error("Impossible de charger la fiche :", error);
    showDetailError();
  }
}

function bindDetailEvents() {
  detailElements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDetailLanguage(button.dataset.detailLang);
    });
  });

  detailElements.shareButton.addEventListener("click", shareCurrentDua);
}

function renderDetailPage() {
  detailElements.type.textContent =
    [currentDua.type, currentDua.authenticity]
      .filter(Boolean)
      .join(" · ");

  detailElements.title.textContent =
    currentDua.title || "Invocation";

  detailElements.source.textContent =
    [currentDua.source, currentDua.referenceDetails]
      .filter(Boolean)
      .join(" — ");

  updateDuaSeo();

  renderOptionalParagraph(
    detailElements.referenceSection,
    detailElements.reference,
    currentDua.fullReferenceText
  );

  renderOptionalParagraph(
    detailElements.contextSection,
    detailElements.context,
    currentDua.context
  );

  renderOptionalParagraph(
    detailElements.meaningSection,
    detailElements.meaning,
    currentDua.meaning
  );

  renderOptionalList(
    detailElements.whenSection,
    detailElements.when,
    currentDua.whenToRead
  );

  renderOptionalList(
    detailElements.applicationSection,
    detailElements.application,
    currentDua.applicationToday
  );

  renderOptionalList(
    detailElements.lessonsSection,
    detailElements.lessons,
    currentDua.lessons
  );

  renderOptionalList(
    detailElements.benefitsSection,
    detailElements.benefits,
    currentDua.reportedBenefits || currentDua.benefits
  );

  renderOptionalList(
    detailElements.mistakesSection,
    detailElements.mistakes,
    currentDua.mistakesToAvoid
  );

  renderRelatedDuas();
  renderBackToThemeLink();
  setDetailLanguage("fr");
  document.getElementById("staticDuaSummary")?.remove();
}


function updateDuaSeo() {
  const title = `${detailElements.title.textContent} — Texte, traduction et source`;
  const descriptionSource =
    currentDua.meaning ||
    currentDua.context ||
    currentDua.french ||
    "Découvrez cette invocation, son texte, sa traduction et sa source.";
  const description = String(descriptionSource).replace(/\s+/g, " ").slice(0, 155);
  const staticSlug = document.body.dataset.duaSlug;
  const canonical = staticSlug || staticDetailIds.has(currentDua.id)
    ? `https://douaagenerator.fr/douaas/${encodeURIComponent(staticSlug || currentDua.id.replaceAll("_", "-"))}/`
    : `https://douaagenerator.fr/douaa.html?id=${encodeURIComponent(currentDua.id)}`;

  document.title = title;
  updateMeta("description", description);
  updatePropertyMeta("og:title", title);
  updatePropertyMeta("og:description", description);
  updatePropertyMeta("og:url", canonical);
  updateMeta("twitter:title", title);
  updateMeta("twitter:description", description);
  updateCanonical(canonical);

  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": detailElements.title.textContent,
    "description": description,
    "url": canonical,
    "inLanguage": ["fr", "ar"],
    "isPartOf": {
      "@type": "WebSite",
      "name": "Douaa Generator",
      "url": "https://douaagenerator.fr/"
    }
  });
}

function updateMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updatePropertyMeta(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateCanonical(url) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

function injectJsonLd(data) {
  const element = document.createElement("script");
  element.type = "application/ld+json";
  element.textContent = JSON.stringify(data);
  document.head.appendChild(element);
}

function setDetailLanguage(language) {
  if (!["fr", "ar", "ph"].includes(language)) {
    return;
  }

  currentLanguage = language;

  detailElements.languageButtons.forEach((button) => {
    const active = button.dataset.detailLang === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const languageKeys = {
    fr: "french",
    ar: "arabic",
    ph: "transliteration"
  };

  detailElements.text.textContent =
    currentDua[languageKeys[language]] || currentDua.french || "";

  detailElements.text.classList.toggle(
    "arabic-content",
    language === "ar"
  );

  detailElements.text.setAttribute(
    "dir",
    language === "ar" ? "rtl" : "ltr"
  );
}

function renderOptionalParagraph(section, target, value) {
  if (!value) {
    hideElement(section);
    return;
  }

  target.textContent = value;
  showElement(section);
}

function renderOptionalList(section, target, values) {
  if (!Array.isArray(values) || values.length === 0) {
    hideElement(section);
    return;
  }

  target.innerHTML = values
    .map((value) => `<li>${escapeHtml(value)}</li>`)
    .join("");

  showElement(section);
}

function renderRelatedDuas() {
  const ids = currentDua.relatedDuas;

  if (!Array.isArray(ids) || ids.length === 0) {
    hideElement(detailElements.relatedSection);
    return;
  }

  const related = ids
    .map((id) => database.duas.find((dua) => dua.id === id))
    .filter(Boolean);

  if (related.length === 0) {
    hideElement(detailElements.relatedSection);
    return;
  }

  detailElements.related.innerHTML = related
    .map(
      (dua) => `
        <a
          class="related-dua-card"
          href="${getDetailUrl(dua.id)}"
        >
          <span class="related-dua-type">
            ${escapeHtml(dua.type || "Douaa")}
          </span>

          <strong>
            ${escapeHtml(dua.title || buildFallbackTitle(dua))}
          </strong>

          <span>
            ${escapeHtml(dua.source || "")}
          </span>
        </a>
      `
    )
    .join("");

  showElement(detailElements.relatedSection);
}


function renderBackToThemeLink() {
  if (!detailElements.backToThemeLink) {
    return;
  }

  const categoryId = Array.isArray(currentDua.categories)
    ? currentDua.categories[0]
    : null;

  if (!categoryId) {
    detailElements.backToThemeLink.href = "/bibliotheque/";
    detailElements.backToThemeLink.textContent = "Retour à la bibliothèque";
    return;
  }

  const category = database.categories.find(
    (item) => item.id === categoryId
  );

  detailElements.backToThemeLink.href =
    `/themes/${encodeURIComponent(categoryId)}/`;

  detailElements.backToThemeLink.textContent = category
    ? `Retour au thème ${category.label}`
    : "Retour au thème";
}

function buildFallbackTitle(dua) {
  const categoryId = Array.isArray(dua.categories)
    ? dua.categories[0]
    : null;

  const category = database.categories.find(
    (item) => item.id === categoryId
  );

  return category
    ? `Douaa : ${category.label}`
    : "Découvrir cette invocation";
}

const staticDetailIds = new Set([
  "akhirah_2_201", "ayyub_21_83", "beneficial_rizq", "debt_anxiety",
  "deceased_general", "family_protection_general", "firm_heart",
  "gratitude_27_19", "guidance_3_8", "halal_sufficiency",
  "hasbunallah_3_173", "healing_prophetic", "knowledge_20_114",
  "musa_28_24", "musa_ease_20_25_28", "paradise_general",
  "parents_17_24", "patience_2_250", "protection_words", "quran_3_38",
  "quran_14_40", "quran_21_89", "quran_25_74", "quran_30_21_general",
  "repentance_adam_7_23", "sayyid_istighfar_meaning", "work_long_general",
  "yunus_21_87"
]);

function getDetailUrl(id) {
  return staticDetailIds.has(id)
    ? `/douaas/${id.replaceAll("_", "-")}/`
    : `/douaa.html?id=${encodeURIComponent(id)}`;
}

async function shareCurrentDua() {
  const shareData = {
    title: detailElements.title.textContent,
    text: `${detailElements.title.textContent} — ${currentDua.source || ""}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    showTemporaryMessage(detailElements.shareMessage);
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Partage impossible :", error);
    }
  }
}

function showDetailError() {
  hideElement(detailElements.loading);
  hideElement(detailElements.panel);
  showElement(detailElements.error);
}

function showTemporaryMessage(element) {
  showElement(element);

  window.setTimeout(() => {
    hideElement(element);
  }, 2200);
}

function showElement(element) {
  element.classList.remove("hidden");
}

function hideElement(element) {
  element.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
