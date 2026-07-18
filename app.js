"use strict";

let database = null;
let currentGeneration = null;
let currentLanguage = "fr";

const elements = {
  categoriesGrid: document.getElementById("categoriesGrid"),
  selectionCount: document.getElementById("selectionCount"),
  selectionError: document.getElementById("selectionError"),
  generateBtn: document.getElementById("generateBtn"),
  loadingMessage: document.getElementById("loadingMessage"),
  resultSection: document.getElementById("resultSection"),
  output: document.getElementById("output"),
  languageButtons: document.querySelectorAll(".language-button"),
  copyBtn: document.getElementById("copyBtn"),
  regenerateBtn: document.getElementById("regenerateBtn"),
  copyMessage: document.getElementById("copyMessage")
};

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  bindStaticEvents();

  try {
    const response = await fetch("./data/duas.json?v=10", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Impossible de charger duas.json : erreur ${response.status}`
      );
    }

    database = await response.json();
    validateDatabase(database);
    renderCategories();

    elements.generateBtn.disabled = false;
    elements.loadingMessage.textContent =
      "Bibliothèque chargée. Sélectionnez vos intentions.";
  } catch (error) {
    console.error(error);

    elements.loadingMessage.textContent =
      "La bibliothèque n’a pas pu être chargée. Vérifiez le fichier data/duas.json.";

    elements.loadingMessage.classList.add("message-error");
  }
}

function validateDatabase(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Le format du fichier JSON est invalide.");
  }

  const requiredArrays = [
    "categories",
    "praises",
    "salawat",
    "closings",
    "duas"
  ];

  requiredArrays.forEach((key) => {
    if (!Array.isArray(data[key])) {
      throw new Error(`La propriété "${key}" doit être un tableau.`);
    }
  });
}

function bindStaticEvents() {
  elements.generateBtn.addEventListener("click", generateInvocation);

  elements.regenerateBtn.addEventListener("click", generateInvocation);

  elements.copyBtn.addEventListener("click", copyInvocation);

  elements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });
}

function renderCategories() {
  elements.categoriesGrid.innerHTML = database.categories
    .map(
      (category) => `
        <label class="category-option">
          <input
            type="checkbox"
            name="category"
            value="${escapeHtml(category.id)}"
          >

          <span class="category-icon" aria-hidden="true">
            ${escapeHtml(category.icon)}
          </span>

          <span class="category-text">
            <span class="category-title">
              ${escapeHtml(category.label)}
            </span>

            <span class="category-description">
              ${escapeHtml(category.description)}
            </span>
          </span>
        </label>
      `
    )
    .join("");

  document
    .querySelectorAll('input[name="category"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", handleCategoryChange);
    });
}

function handleCategoryChange(event) {
  const option = event.target.closest(".category-option");

  option.classList.toggle("selected", event.target.checked);

  updateSelectionCount();

  if (getSelectedCategoryIds().length > 0) {
    hideElement(elements.selectionError);
  }
}

function updateSelectionCount() {
  const count = getSelectedCategoryIds().length;

  elements.selectionCount.textContent =
    count === 0
      ? "0 sélection"
      : count === 1
        ? "1 sélection"
        : `${count} sélections`;
}

function getSelectedCategoryIds() {
  return Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map((checkbox) => checkbox.value);
}

function generateInvocation() {
  if (!database) {
    return;
  }

  const categoryIds = getSelectedCategoryIds();

  if (categoryIds.length === 0) {
    showElement(elements.selectionError);
    elements.selectionError.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  const chosenDuas = categoryIds
    .map((categoryId) => {
      const category = database.categories.find(
        (item) => item.id === categoryId
      );

      const possibleDuas = database.duas.filter((dua) =>
        dua.categories.includes(categoryId)
      );

      const selectedDua = pickRandom(possibleDuas);

      if (!category || !selectedDua) {
        return null;
      }

      return {
        category,
        dua: selectedDua
      };
    })
    .filter(Boolean);

  const chosenPraise = chooseContextualPraise(categoryIds);
  const chosenSalawat = pickRandom(database.salawat);
  const chosenClosing = pickRandom(database.closings);

  currentGeneration = {
    praise: chosenPraise,
    salawat: chosenSalawat,
    selectedDuas: chosenDuas,
    closing: chosenClosing
  };

  setLanguage("fr");
  showElement(elements.resultSection);

  elements.resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function chooseContextualPraise(categoryIds) {
  const scoredPraises = database.praises.map((praise) => {
    const matches = praise.preferredCategories.filter((categoryId) =>
      categoryIds.includes(categoryId)
    ).length;

    return {
      praise,
      score: matches
    };
  });

  const bestScore = Math.max(...scoredPraises.map((item) => item.score));

  const candidates =
    bestScore > 0
      ? scoredPraises
          .filter((item) => item.score === bestScore)
          .map((item) => item.praise)
      : database.praises;

  return pickRandom(candidates);
}

function setLanguage(language) {
  if (!["fr", "ar", "ph"].includes(language)) {
    return;
  }

  currentLanguage = language;

  elements.languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === language;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderInvocation();
}

function renderInvocation() {
  if (!currentGeneration) {
    return;
  }

  const blocks = [];

  blocks.push(
    createInvocationCard({
      title: "Louange",
      content: getLocalizedText(
        currentGeneration.praise,
        currentLanguage
      ),
      source: currentGeneration.praise.source,
      language: currentLanguage,
      className: "praise-card",
      index: 0
    })
  );

  blocks.push(
    createInvocationCard({
      title: "Prière sur le Prophète ﷺ",
      content: getLocalizedText(
        currentGeneration.salawat,
        currentLanguage
      ),
      source: currentGeneration.salawat.source,
      language: currentLanguage,
      className: "salawat-card",
      index: 1
    })
  );

  currentGeneration.selectedDuas.forEach((selection, index) => {
    blocks.push(
      createInvocationCard({
        title: `Douaa : ${selection.category.label}`,
        content: getLocalizedText(selection.dua, currentLanguage),
        source: selection.dua.source,
        language: currentLanguage,
        className: "dua-card",
        index: index + 2
      })
    );
  });

  blocks.push(
    createInvocationCard({
      title: "Clôture de la douaa",
      content: getLocalizedText(
        currentGeneration.closing,
        currentLanguage
      ),
      source: currentGeneration.closing.source,
      language: currentLanguage,
      className: "closing-card",
      index: currentGeneration.selectedDuas.length + 2
    })
  );

  blocks.push(createTawakkulCard());

  elements.output.innerHTML = blocks.join("");
}

function createInvocationCard({
  title,
  content,
  source,
  language,
  className,
  index
}) {
  const directionClass =
    language === "ar" ? "arabic-content" : "";

  return `
    <article
      class="invocation-card ${escapeHtml(className)}"
      style="animation-delay: ${index * 65}ms"
    >
      <h3 class="card-title">${escapeHtml(title)}</h3>

      <div class="card-content ${directionClass}">
        ${formatText(content)}
      </div>

      ${
        source
          ? `
            <small class="card-source">
              Source : ${escapeHtml(source)}
            </small>
          `
          : ""
      }
    </article>
  `;
}

function createTawakkulCard() {
  return `
    <article
      class="invocation-card tawakkul-card"
      style="animation-delay: 420ms"
    >
      <h3 class="card-title">
        Tawakkul et Yaqîn
      </h3>

      <div class="card-content tawakkul-content">
        <p>
          Multipliez l’istighfar, accomplissez les causes licites
          et placez votre confiance en Allah.
        </p>

        <div class="dhikr">
          Astaghfirullāha wa atūbu ilayh
          <br>
          <small>
            Je demande pardon à Allah et je me repens auprès de Lui.
          </small>
        </div>

        <p>
          Invoquez avec un cœur fermement convaincu qu’Allah vous entend
          et qu’Il répondra de la manière la plus juste, au meilleur moment.
        </p>

        <p>
          Ne perdez pas espoir : aucune invocation sincère n’est oubliée
          auprès d’Allah.
        </p>
      </div>
    </article>
  `;
}

async function copyInvocation() {
  if (!currentGeneration) {
    return;
  }

  const text = buildPlainTextInvocation();

  try {
    await navigator.clipboard.writeText(text);
    showTemporaryMessage(elements.copyMessage);
  } catch (error) {
    console.error(error);

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    showTemporaryMessage(elements.copyMessage);
  }
}

function buildPlainTextInvocation() {
  const lines = [];

  lines.push("LOUANGE");
  lines.push(
    getLocalizedText(currentGeneration.praise, currentLanguage)
  );
  lines.push("");

  lines.push("PRIÈRE SUR LE PROPHÈTE ﷺ");
  lines.push(
    getLocalizedText(currentGeneration.salawat, currentLanguage)
  );
  lines.push("");

  currentGeneration.selectedDuas.forEach((selection) => {
    lines.push(`DOUAA : ${selection.category.label.toUpperCase()}`);
    lines.push(getLocalizedText(selection.dua, currentLanguage));
    lines.push("");
  });

  lines.push("CLÔTURE DE LA DOUAA");
  lines.push(
    getLocalizedText(currentGeneration.closing, currentLanguage)
  );
  lines.push("");

  lines.push("TAWAKKUL ET YAQÎN");
lines.push(
  "Multipliez l’istighfar, accomplissez les causes licites et placez votre confiance en Allah."
);
lines.push(
  "Invoquez avec la ferme conviction qu’Allah vous entend et qu’aucune invocation sincère n’est oubliée auprès de Lui."
);

  return lines.join("\n");
}

function getLocalizedText(item, language) {
  const languageKeys = {
    fr: "french",
    ar: "arabic",
    ph: "transliteration"
  };

  return item[languageKeys[language]] || item.french || "";
}

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

function formatText(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showElement(element) {
  element.classList.remove("hidden");
}

function hideElement(element) {
  element.classList.add("hidden");
}

function showTemporaryMessage(element) {
  showElement(element);

  window.setTimeout(() => {
    hideElement(element);
  }, 2200);
}
