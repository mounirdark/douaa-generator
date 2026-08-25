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
  const themeId = document.body.dataset.themeId ||
    new URLSearchParams(window.location.search).get("id");

  if (!themeId) {
    showError();
    return;
  }

  try {
    const [duaResponse, contentResponse, reminderResponse] = await Promise.all([
      fetch("/data/duas.json?v=22", { cache: "no-store" }),
      fetch("/data/themes.json?v=22", { cache: "no-store" }),
      fetch("/data/theme-reminders.json?v=24", { cache: "no-store" })
    ]);

    if (!duaResponse.ok) {
      throw new Error(`Erreur HTTP ${duaResponse.status}`);
    }

    const database = await duaResponse.json();
    const themeContent = contentResponse.ok ? await contentResponse.json() : {};
    const themeReminders = reminderResponse.ok ? await reminderResponse.json() : {};
    const category = database.categories.find((item) => item.id === themeId);

    if (!category) {
      showError();
      return;
    }

    const duas = database.duas.filter(
      (dua) => Array.isArray(dua.categories) && dua.categories.includes(themeId)
    );

    const reminder = themeReminders[themeId] || null;
    const content = themeContent[themeId]
      ? { ...themeContent[themeId], id: themeId, reminder }
      : null;

    renderTheme(category, duas, content, database.duas, reminder);
  } catch (error) {
    console.error("Erreur thème :", error);
    showError();
  }
}

function renderTheme(category, duas, content, allDuas = [], reminder = null) {
  const verifiedDuas = duas.filter(isVerifiedDua);
  themeElements.icon.textContent = category.icon || "✦";
  themeElements.title.textContent = content?.pageTitle || category.label;
  themeElements.description.textContent = content?.summary || category.description || "";

  const displayedCount = content?.duaGroups
    ? getRichThemeDuaIds(content, allDuas).length
    : verifiedDuas.length;

  themeElements.count.textContent =
    `${displayedCount} ${displayedCount > 1 ? "douaas" : "douaa"}`;

  updateThemeSeo(category, displayedCount, content);

  themeElements.list.innerHTML = content
    ? createRichThemePage(content, allDuas)
    : verifiedDuas.length
      ? `${verifiedDuas.map(createDuaCard).join("")}${createReminderSection(reminder)}`
      : `
        <section class="panel empty-theme-panel">
          <h2>Aucune douaa disponible</h2>
          <p>Ce thème sera enrichi prochainement.</p>
        </section>
      `;

  bindFaqButtons();
  bindCopyButtons();

  document.getElementById("staticThemeSummary")?.remove();

  themeElements.loading.classList.add("hidden");
  themeElements.header.classList.remove("hidden");
  themeElements.cta.classList.remove("hidden");
}

function createRichThemePage(content, allDuas) {
  const labels = content.labels || {};
  const duaMap = new Map(allDuas.map((dua) => [dua.id, dua]));
  const groupedIds = new Set((content.duaGroups || []).flatMap((group) => group.duaIds || []));
  const verifiedGroupedCount = [...groupedIds]
    .map((id) => duaMap.get(id))
    .filter((dua) => dua && isVerifiedDua(dua)).length;
  const supplementalDuas = allDuas
    .filter((dua) => dua.categories?.includes(content.id) && !groupedIds.has(dua.id) && isVerifiedDua(dua))
    .slice(0, Math.max(0, 10 - verifiedGroupedCount));
  const quickLinks = content.reminder
    ? [...(content.quickLinks || []), { label: "Rappel bienveillant", target: "rappel-bienveillant" }]
    : content.quickLinks || [];

  return `
    ${createQuickNavigation(quickLinks)}

    ${content.introduction ? `
      <section class="panel theme-introduction">
        <p class="eyebrow">${escapeHtml(labels.introductionEyebrow || "Comprendre le thème")}</p>
        <h2>${escapeHtml(content.introduction.title || "Introduction")}</h2>
        ${(content.introduction.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
    ` : ""}

    <section id="douaas" class="rich-theme-section">
      <div class="rich-section-heading">
        <p class="eyebrow">${escapeHtml(labels.duasEyebrow || "Réponse directe à votre recherche")}</p>
        <h2>${escapeHtml(labels.duasTitle || "🤲 Les douaas")}</h2>
        ${content.duaIntroduction ? `<p>${escapeHtml(content.duaIntroduction)}</p>` : ""}
      </div>
      ${(content.duaGroups || []).map((group) => createDuaGroup(group, duaMap, content.id)).join("")}
      ${supplementalDuas.length ? createDuaGroup({
        id: "douaas-complementaires",
        icon: "✦",
        title: "D’autres invocations authentiques pour ce thème",
        description: "Ces invocations coraniques ou prophétiques complètent la sélection. Leur sens général est pertinent pour ce thème, sans prétendre qu’elles lui sont exclusivement réservées.",
        duaIds: supplementalDuas.map((dua) => dua.id)
      }, duaMap, content.id) : ""}
    </section>

    ${createTextSection("coran", labels.quranEyebrow || "Pour approfondir", labels.quranTitle || "📖 Ce que dit le Coran", content.quran || [])}
    ${createTextSection("sunna", labels.sunnahEyebrow || "Pour approfondir", labels.sunnahTitle || "🕌 Ce que dit la Sunna", content.sunnah || [])}
    ${createReminderSection(content.reminder)}
    ${createAdviceSection(content.advice || [], labels)}
    ${createFaqSection(content.faq || [], labels)}
    ${createRelatedSection(content.related || [], labels)}
  `;
}

function getRichThemeDuaIds(content, allDuas) {
  const groupedIds = new Set((content.duaGroups || []).flatMap((group) => group.duaIds || []));
  const duaMap = new Map(allDuas.map((dua) => [dua.id, dua]));
  const verifiedGroupedCount = [...groupedIds]
    .map((id) => duaMap.get(id))
    .filter((dua) => dua && isVerifiedDua(dua)).length;
  allDuas
    .filter((dua) => dua.categories?.includes(content.id) && !groupedIds.has(dua.id) && isVerifiedDua(dua))
    .slice(0, Math.max(0, 10 - verifiedGroupedCount))
    .forEach((dua) => groupedIds.add(dua.id));
  return [...groupedIds];
}

function isVerifiedDua(dua) {
  return !/(formulation générale|inspiré du coran)/i.test(dua.source || "");
}

function createReminderSection(reminder) {
  if (!reminder?.paragraphs?.length) return "";

  return `
    <section id="rappel-bienveillant" class="panel gentle-reminder-section">
      <div class="gentle-reminder-heading">
        <span aria-hidden="true">☾</span>
        <div>
          <p class="eyebrow">Un rappel bienveillant</p>
          <h2>${escapeHtml(reminder.title)}</h2>
        </div>
      </div>
      <div class="gentle-reminder-copy">
        ${reminder.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
      <div class="gentle-reminder-action">
        <p class="step-label">Un pas simple aujourd’hui</p>
        <p>${escapeHtml(reminder.action)}</p>
      </div>
      <p class="teaching-source"><strong>Références :</strong> ${escapeHtml(reminder.source)}</p>
    </section>
  `;
}

function createQuickNavigation(links) {
  if (!links.length) return "";

  return `
    <nav class="theme-quick-nav" aria-label="Accès rapide au contenu">
      <p>Vous cherchez une information précise ?</p>
      <div class="theme-quick-links">
        ${links.map((link) => `
          <a href="#${escapeHtml(link.target)}">${escapeHtml(link.label)}</a>
        `).join("")}
      </div>
    </nav>
  `;
}

function createDuaGroup(group, duaMap, themeId) {
  const duas = (group.duaIds || []).map((id) => duaMap.get(id)).filter(Boolean);
  if (!duas.length) return "";

  return `
    <section id="${escapeHtml(group.id)}" class="dua-situation-group">
      <div class="dua-situation-heading">
        <span aria-hidden="true">${escapeHtml(group.icon || "🤲")}</span>
        <div>
          <h3>${escapeHtml(group.title)}</h3>
          ${group.description ? `<p>${escapeHtml(group.description)}</p>` : ""}
        </div>
      </div>
      <div class="marriage-dua-grid">
        ${duas.map((dua) => createInlineDuaCard(dua, themeId)).join("")}
      </div>
    </section>
  `;
}

function createInlineDuaCard(dua, themeId) {
  const note = dua.themeNotes?.[themeId] || dua.context || "";
  const copyText = [dua.arabic, dua.transliteration, dua.french, dua.source]
    .filter(Boolean)
    .join("\n\n");

  return `
    <article class="theme-dua-card rich-dua-card">
      <div class="theme-dua-heading">
        <div>
          <p class="step-label">${escapeHtml(dua.type || "Invocation")}</p>
          <h4>${escapeHtml(dua.title || "Invocation")}</h4>
        </div>
        <button class="copy-dua-button" type="button" data-copy="${escapeAttribute(copyText)}" aria-label="Copier cette douaa">
          Copier
        </button>
      </div>

      ${note ? `<p class="dua-context-note">${escapeHtml(note)}</p>` : ""}
      ${dua.arabic ? `<p class="theme-dua-arabic" dir="rtl" lang="ar">${escapeHtml(dua.arabic)}</p>` : ""}
      ${dua.transliteration ? `<p class="theme-dua-transliteration"><strong>Phonétique :</strong> ${escapeHtml(dua.transliteration)}</p>` : ""}
      ${dua.french ? `<p class="theme-dua-french"><strong>Traduction :</strong> ${escapeHtml(dua.french)}</p>` : ""}
      ${dua.source ? `<p class="theme-dua-source"><strong>Source :</strong> ${escapeHtml(dua.source)}</p>` : ""}
      <a class="details-link" href="${getDuaUrl(dua.id)}">Voir la fiche complète <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function createTextSection(id, eyebrow, title, items) {
  if (!items.length) return "";
  return `
    <section id="${id}" class="rich-theme-section">
      <div class="rich-section-heading">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <div class="teaching-grid">
        ${items.map((item) => `
          <article class="teaching-card">
            <h3>${escapeHtml(item.title)}</h3>
            ${item.quote ? `<blockquote>${escapeHtml(item.quote)}</blockquote>` : ""}
            <p>${escapeHtml(item.explanation)}</p>
            <p class="teaching-source">${escapeHtml(item.source)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function createAdviceSection(items, labels = {}) {
  if (!items.length) return "";
  return `
    <section id="conseils" class="rich-theme-section">
      <div class="rich-section-heading">
        <p class="eyebrow">${escapeHtml(labels.adviceEyebrow || "Mettre les enseignements en pratique")}</p>
        <h2>${escapeHtml(labels.adviceTitle || "💡 Conseils pratiques")}</h2>
        <p>${escapeHtml(labels.adviceIntroduction || "Ces conseils sont une synthèse pratique des textes cités sur cette page. Ils ne remplacent pas l’accompagnement d’une personne compétente lorsqu’une situation est complexe.")}</p>
      </div>
      <div class="advice-list">
        ${items.map((item, index) => `
          <article class="advice-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.text)}</p>
              <p class="teaching-source">${escapeHtml(item.source)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function createFaqSection(items, labels = {}) {
  if (!items.length) return "";
  return `
    <section id="faq" class="rich-theme-section">
      <div class="rich-section-heading">
        <p class="eyebrow">${escapeHtml(labels.faqEyebrow || "Questions fréquentes")}</p>
        <h2>${escapeHtml(labels.faqTitle || "❓ Questions fréquentes")}</h2>
        ${labels.faqIntroduction ? `<p>${escapeHtml(labels.faqIntroduction)}</p>` : ""}
      </div>
      <div class="faq-list">
        ${items.map((item, index) => `
          <article class="faq-item">
            <button type="button" aria-expanded="${index === 0 ? "true" : "false"}">
              <span>${escapeHtml(item.question)}</span>
              <span class="faq-symbol" aria-hidden="true">+</span>
            </button>
            <div class="faq-answer${index === 0 ? " open" : ""}">
              <p>${escapeHtml(item.answer)}</p>
              ${item.source ? `<p class="teaching-source">${escapeHtml(item.source)}</p>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function createRelatedSection(items, labels = {}) {
  if (!items.length) return "";
  return `
    <section id="voir-aussi" class="panel related-themes-panel">
      <p class="eyebrow">${escapeHtml(labels.relatedEyebrow || "Continuer votre lecture")}</p>
      <h2>${escapeHtml(labels.relatedTitle || "📚 Voir aussi")}</h2>
      <div class="related-theme-links">
        ${items.map((item) => `
          <a href="/themes/${encodeURIComponent(item.id)}/">${escapeHtml(item.label)} <span aria-hidden="true">→</span></a>
        `).join("")}
      </div>
    </section>
  `;
}

function bindFaqButtons() {
  document.querySelectorAll(".faq-item > button").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      answer?.classList.toggle("open", !isOpen);
    });
  });
}

function bindCopyButtons() {
  document.querySelectorAll(".copy-dua-button").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy || "");
        const original = button.textContent;
        button.textContent = "Copiée ✓";
        setTimeout(() => { button.textContent = original; }, 1600);
      } catch (error) {
        console.error("Copie impossible :", error);
      }
    });
  });
}

function updateThemeSeo(category, duaCount, content) {
  const title = content?.seoTitle || `Douaas ${category.label} — Textes, sources et traductions`;
  const description = content?.seoDescription ||
    `Découvrez ${duaCount} ${duaCount > 1 ? "douaas" : "douaa"} pour le thème ${category.label}, avec texte arabe, traduction française et sources.`;
  const canonical = `https://douaagenerator.fr/themes/${encodeURIComponent(category.id)}/`;

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

  if (content?.faq?.length) {
    injectJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": content.faq.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }
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
        <span class="theme-dua-source">${escapeHtml(dua.source || "")}</span>
      </div>
      <p class="theme-dua-arabic" dir="rtl" lang="ar">${escapeHtml(dua.arabic || "")}</p>
      <p class="theme-dua-french">${escapeHtml(dua.french || "")}</p>
      ${explanation ? `<p class="theme-dua-explanation">${escapeHtml(explanation)}</p>` : ""}
      <a class="details-link" href="${getDuaUrl(dua.id)}">
        Voir la fiche complète <span aria-hidden="true">→</span>
      </a>
    </article>
  `;
}

const staticDuaIds = new Set([
  "akhirah_2_201", "ayyub_21_83", "beneficial_rizq", "debt_anxiety",
  "deceased_general", "family_protection_general", "firm_heart",
  "gratitude_27_19", "guidance_3_8", "halal_sufficiency",
  "hasbunallah_3_173", "healing_prophetic", "knowledge_20_114",
  "musa_28_24", "musa_ease_20_25_28", "paradise_general",
  "parents_17_24", "patience_2_250", "protection_words", "quran_3_38",
  "quran_14_40", "quran_21_89", "quran_25_74", "quran_30_21_general",
  "repentance_adam_7_23", "sayyid_istighfar_meaning", "work_long_general",
  "yunus_21_87",
  "quran_2_286_burden", "quran_3_16_forgiveness", "quran_3_147_steadfastness",
  "quran_14_41_family_forgiveness", "quran_18_10_right_guidance", "quran_23_97_98_whispers",
  "quran_40_7_9_family_paradise", "quran_46_15_righteous_descendants", "quran_59_10_no_resentment",
  "quran_66_8_complete_light", "quran_71_28_believers_forgiveness", "prophetic_religion_world_hereafter",
  "prophetic_guidance_piety_chastity", "prophetic_wronged_self", "prophetic_pardon_afuw",
  "prophetic_help_worship", "prophetic_love_allah", "prophetic_distress_tawhid",
  "prophetic_distress_allah_rabbi", "prophetic_calamity_reward", "prophetic_refuge_wrongdoing",
  "prophetic_funeral_all_muslims", "prophetic_graveyard_greeting", "prophetic_deceased_reward",
  "prophetic_healing_ruqya", "prophetic_healing_seven_times", "prophetic_spouse_goodness",
  "prophetic_before_intimacy", "prophetic_all_good", "prophetic_bad_character_refuge",
  "prophetic_refuge_poverty", "prophetic_refuge_severe_trial", "prophetic_useless_knowledge"
]);

function getDuaUrl(id) {
  return staticDuaIds.has(id)
    ? `/douaas/${id.replaceAll("_", "-")}/`
    : `/douaa.html?id=${encodeURIComponent(id)}`;
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

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}
