"use strict";

const FAVORITES_STORAGE_KEY = "douaaGeneratorFavorites";
const elements = {
  grid: document.getElementById("favoritesGrid"),
  empty: document.getElementById("favoritesEmpty"),
  error: document.getElementById("favoritesError"),
  count: document.getElementById("favoritesCount"),
  clearButton: document.getElementById("clearFavoritesBtn")
};

document.addEventListener("DOMContentLoaded", initializeFavorites);

async function initializeFavorites() {
  elements.clearButton.addEventListener("click", clearFavorites);

  try {
    const response = await fetch("../data/duas.json?v=22", { cache: "no-store" });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const database = await response.json();
    renderFavorites(database.duas || []);
  } catch (error) {
    console.error("Chargement des favoris impossible :", error);
    elements.count.textContent = "Indisponible";
    elements.error.classList.remove("hidden");
  }
}

function readFavorites() {
  try {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.warn("Favoris illisibles :", error);
    return [];
  }
}

function renderFavorites(duas) {
  const savedFavorites = readFavorites();
  const duaMap = new Map(duas.map((dua) => [dua.id, dua]));
  const favorites = savedFavorites
    .map((favorite) => {
      const record = typeof favorite === "string" ? { id: favorite } : favorite;
      const dua = duaMap.get(record.id);
      return dua ? { dua, url: record.url || `../douaa.html?id=${encodeURIComponent(record.id)}` } : null;
    })
    .filter(Boolean);

  elements.count.textContent = `${favorites.length} ${favorites.length > 1 ? "favoris" : "favori"}`;
  elements.grid.classList.toggle("hidden", favorites.length === 0);
  elements.empty.classList.toggle("hidden", favorites.length !== 0);
  elements.clearButton.classList.toggle("hidden", favorites.length === 0);
  elements.grid.innerHTML = favorites.map(({ dua, url }) => `
    <a class="favorite-dua-card" href="${escapeHtml(url)}">
      <span class="related-dua-type">${escapeHtml(dua.type || "Invocation")}</span>
      <strong>${escapeHtml(dua.title || "Douaa")}</strong>
      <span>${escapeHtml(dua.french || "")}</span>
      <small>${escapeHtml(dua.source || "")}</small>
    </a>
  `).join("");
}

function clearFavorites() {
  if (!window.confirm("Effacer toutes les douaas enregistrées dans vos favoris ?")) return;
  localStorage.removeItem(FAVORITES_STORAGE_KEY);
  window.location.reload();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
