"use strict";

document.addEventListener("DOMContentLoaded", loadDuaDetails);

async function loadDuaDetails() {
  const container = document.getElementById("duaDetails");
  const params = new URLSearchParams(window.location.search);
  const duaId = params.get("id");

  if (!duaId) {
    showError(container, "Aucune invocation n’a été sélectionnée.");
    return;
  }

  try {
    const response = await fetch("./data/duas.json?v=11", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const database = await response.json();

    const dua = database.duas.find((item) => item.id === duaId);

    if (!dua) {
      showError(container, "Cette invocation est introuvable.");
      return;
    }

    renderDuaDetails(container, dua);
  } catch (error) {
    console.error(error);

    showError(
      container,
      "La fiche n’a pas pu être chargée. Réessayez dans quelques instants."
    );
  }
}

function renderDuaDetails(container, dua) {
  const title = dua.title || "À propos de cette douaa";
  const whenToRead = Array.isArray(dua.whenToRead)
    ? dua.whenToRead
    : [];
  const lessons = Array.isArray(dua.lessons)
    ? dua.lessons
    : [];

  document.title = `${title} | Douaa Generator`;

  container.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">
        ${escapeHtml(dua.type || "Invocation")}
      </p>

      <h1>${escapeHtml(title)}</h1>

      <p class="detail-source">
        Source : ${escapeHtml(dua.source || "Non renseignée")}
      </p>
    </header>

    <article class="detail-text-card">
      <h2>En français</h2>
      <p>${formatText(dua.french)}</p>
    </article>

    <article class="detail-text-card">
      <h2>En arabe</h2>

      <p class="arabic-content">
        ${formatText(dua.arabic)}
      </p>
    </article>

    <article class="detail-text-card">
      <h2>Phonétique</h2>
      <p>${formatText(dua.transliteration)}</p>
    </article>

    ${
      dua.context
        ? `
          <article class="detail-section">
            <h2>Contexte et histoire</h2>
            <p>${formatText(dua.context)}</p>
          </article>
        `
        : ""
    }

    ${
      dua.meaning
        ? `
          <article class="detail-section">
            <h2>Sens de l’invocation</h2>
            <p>${formatText(dua.meaning)}</p>
          </article>
        `
        : ""
    }

    ${
      whenToRead.length > 0
        ? `
          <article class="detail-section">
            <h2>Quand réciter cette douaa ?</h2>

            <ul>
              ${whenToRead
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
        `
        : ""
    }

    ${
      lessons.length > 0
        ? `
          <article class="detail-section">
            <h2>Enseignements à retenir</h2>

            <ul>
              ${lessons
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
        `
        : ""
    }

    <a class="primary-button detail-return-button" href="./index.html">
      Générer une invocation personnalisée
    </a>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div class="message message-error">
      ${escapeHtml(message)}
    </div>

    <a class="primary-button detail-return-button" href="./index.html">
      Retour au générateur
    </a>
  `;
}

function formatText(value) {
  return escapeHtml(value || "").replace(/\n/g, "<br>");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
