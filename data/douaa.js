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

  const duaId = new URLSearchParams(window.location.search).get("id");

  if (!duaId) {
    showDetailError();
    return;
  }

  try {
    const response = await fetch("./data/duas.json?v=17", {
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

  document.title = `${detailElements.title.textContent} — Douaa Generator`;

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
          href="./douaa.html?id=${encodeURIComponent(dua.id)}"
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
    detailElements.backToThemeLink.href = "./bibliotheque/index.html";
    detailElements.backToThemeLink.textContent = "Retour à la bibliothèque";
    return;
  }

  const category = database.categories.find(
    (item) => item.id === categoryId
  );

  detailElements.backToThemeLink.href =
    `./theme/index.html?id=${encodeURIComponent(categoryId)}`;

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
