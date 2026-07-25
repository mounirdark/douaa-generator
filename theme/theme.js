"use strict";

const themeElements = {
  header: document.getElementById("themeHeader"),
  icon: document.getElementById("themeIcon"),
  title: document.getElementById("themeTitle"),
  description: document.getElementById("themeDescription"),
  count: document.getElementById("themeCount"),
  list: document.getElementById("themeDuas"),
  loading: document.getElementById("themeLoading"),
  error: document.getElementById("themeError"),
  cta: document.getElementById("themeCta")
};

document.addEventListener("DOMContentLoaded", initializeThemePage);

async function initializeThemePage() {
  const themeId = new URLSearchParams(window.location.search).get("id");

  if (!themeId) {
    showError();
    return;
  }

  try {
    const response = await fetch("../data/duas.json?v=18", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const database = await response.json();
    const category = database.categories.find(
      (item) => item.id === themeId
    );

    if (!category) {
      showError();
      return;
    }

    const duas = database.duas.filter(
      (dua) =>
        Array.isArray(dua.categories) &&
        dua.categories.includes(themeId)
    );

    renderTheme(category, duas);
  } catch (error) {
    console.error("Erreur thème :", error);
    showError();
  }
}

function renderTheme(category, duas) {
  themeElements.icon.textContent = category.icon || "✦";
  themeElements.title.textContent = category.label;
  themeElements.description.textContent = category.description || "";
  themeElements.count.textContent =
    `${duas.length} ${duas.length > 1 ? "douaas" : "douaa"}`;

  updateThemeSeo(category, duas.length);

  themeElements.list.innerHTML = duas.length
    ? duas.map(createDuaCard).join("")
    : `
      <section class="panel empty-theme-panel">
        <h2>Aucune douaa disponible</h2>
        <p>Ce thème sera enrichi prochainement.</p>
      </section>
    `;

  themeElements.loading.classList.add("hidden");
  themeElements.header.classList.remove("hidden");
  themeElements.cta.classList.remove("hidden");
}


function updateThemeSeo(category, duaCount) {
  const title = `Douaas ${category.label} — Textes, sources et traductions`;
  const description =
    `Découvrez ${duaCount} ${duaCount > 1 ? "douaas" : "douaa"} pour le thème ${category.label}, avec texte arabe, traduction française et sources.`;
  const canonical =
    `https://douaagenerator.fr/theme/index.html?id=${encodeURIComponent(category.id)}`;

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
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": canonical,
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

function createDuaCard(dua) {
  const title = dua.title || buildFallbackTitle(dua);
  const explanation = dua.meaning || dua.context || "";

  return `
    <article class="theme-dua-card">
      <div class="theme-dua-heading">
        <div>
          <p class="step-label">${escapeHtml(dua.type || "Invocation")}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>

        <span class="theme-dua-source">
          ${escapeHtml(dua.source || "")}
        </span>
      </div>

      <p class="theme-dua-arabic" dir="rtl" lang="ar">
        ${escapeHtml(dua.arabic || "")}
      </p>

      <p class="theme-dua-french">
        ${escapeHtml(dua.french || "")}
      </p>

      ${
        explanation
          ? `<p class="theme-dua-explanation">${escapeHtml(explanation)}</p>`
          : ""
      }

      <a
        class="details-link"
        href="../douaa.html?id=${encodeURIComponent(dua.id)}"
      >
        Voir la fiche complète
        <span aria-hidden="true">→</span>
      </a>
    </article>
  `;
}

function buildFallbackTitle(dua) {
  const source = dua.source ? ` — ${dua.source}` : "";
  return `Invocation${source}`;
}

function showError() {
  themeElements.loading.classList.add("hidden");
  themeElements.header.classList.add("hidden");
  themeElements.error.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
