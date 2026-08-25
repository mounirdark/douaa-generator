"use strict";

const essentialIds = [
  "linvocation_complete_de_listikhara",
  "yunus_21_87",
  "musa_28_24",
  "musa_ease_20_25_28",
  "ayyub_21_83",
  "quran_25_74",
  "quran_3_38",
  "quran_14_40",
  "quran_2_201",
  "debt_anxiety",
  "healing_prophetic",
  "halal_sufficiency",
  "beneficial_rizq",
  "knowledge_20_114",
  "hasbunallah_3_173",
  "sayyid_istighfar",
  "travel_dua",
  "protection_children",
  "morning_evening_protection",
  "parents_17_24"
];

const grid = document.getElementById("essentialDuasGrid");
const loading = document.getElementById("essentialDuasLoading");

document.addEventListener("DOMContentLoaded", loadEssentialDuas);

async function loadEssentialDuas() {
  try {
    const response = await fetch("../data/duas.json?v=20", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const database = await response.json();
    const selected = essentialIds
      .map((id) => database.duas.find((dua) => dua.id === id))
      .filter(Boolean);

    const fallback = database.duas.filter(
      (dua) => !selected.some((item) => item.id === dua.id)
    );

    const finalSelection = [...selected, ...fallback].slice(0, 20);

    grid.innerHTML = finalSelection
      .map((dua) => createEssentialCard(dua, database.categories))
      .join("");

    loading.classList.add("hidden");
  } catch (error) {
    console.error("Impossible de charger les douaas essentielles :", error);
    loading.textContent =
      "La sélection n’a pas pu être chargée pour le moment.";
  }
}

function createEssentialCard(dua, categories) {
  const categoryId = Array.isArray(dua.categories)
    ? dua.categories[0]
    : null;

  const category = categories.find((item) => item.id === categoryId);
  const title = dua.title ||
    (category ? `Douaa : ${category.label}` : "Invocation essentielle");

  const use = Array.isArray(dua.whenToRead) && dua.whenToRead.length
    ? dua.whenToRead[0]
    : dua.meaning || dua.context || "Découvrir le texte et son explication.";

  const href = dua.id === "linvocation_complete_de_listikhara"
    ? "../priere-de-consultation/"
    : getEssentialUrl(dua.id);

  return `
    <a
      class="essential-dua-card"
      href="${href}"
    >
      <span class="essential-number">✦</span>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(use)}</span>
      <small>${escapeHtml(dua.source || dua.referenceDetails || "")}</small>
    </a>
  `;
}

const staticEssentialIds = new Set([
  "ayyub_21_83", "beneficial_rizq", "debt_anxiety", "guidance_3_8",
  "halal_sufficiency", "hasbunallah_3_173", "healing_prophetic",
  "knowledge_20_114", "musa_28_24", "musa_ease_20_25_28",
  "parents_17_24", "protection_words", "quran_3_38", "quran_14_40",
  "quran_25_74", "yunus_21_87",
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

function getEssentialUrl(id) {
  return staticEssentialIds.has(id)
    ? `../douaas/${id.replaceAll("_", "-")}/`
    : `../douaa.html?id=${encodeURIComponent(id)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
