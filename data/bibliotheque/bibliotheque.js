"use strict";

const libraryElements = {
  grid: document.getElementById("libraryGrid"),
  count: document.getElementById("libraryCount"),
  loading: document.getElementById("libraryLoading"),
  error: document.getElementById("libraryError")
};

document.addEventListener("DOMContentLoaded", initializeLibrary);

async function initializeLibrary() {
  try {
    const response = await fetch("../data/duas.json?v=17", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const database = await response.json();

    if (!Array.isArray(database.categories) || !Array.isArray(database.duas)) {
      throw new Error("Le format du fichier JSON est invalide.");
    }

    renderLibrary(database.categories, database.duas);
    libraryElements.loading.classList.add("hidden");
  } catch (error) {
    console.error("Erreur bibliothèque :", error);
    libraryElements.loading.classList.add("hidden");
    libraryElements.error.classList.remove("hidden");
  }
}

function renderLibrary(categories, duas) {
  libraryElements.count.textContent =
    `${categories.length} ${categories.length > 1 ? "thèmes" : "thème"}`;

  libraryElements.grid.innerHTML = categories
    .map((category) => {
      const duaCount = duas.filter((dua) =>
        Array.isArray(dua.categories) &&
        dua.categories.includes(category.id)
      ).length;

      return `
        <a
          class="library-card"
          href="../theme/index.html?id=${encodeURIComponent(category.id)}"
        >
          <span class="library-card-icon" aria-hidden="true">
            ${escapeHtml(category.icon || "✦")}
          </span>

          <span class="library-card-content">
            <strong>${escapeHtml(category.label)}</strong>
            <span>${escapeHtml(category.description || "")}</span>
          </span>

          <span class="library-card-count">
            ${duaCount} ${duaCount > 1 ? "douaas" : "douaa"}
          </span>
        </a>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
