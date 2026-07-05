let DUAS = {};
let lastGenerated = "";

// NOMS D'ALLAH SELON BESOIN
const ALLAH_NAMES = {
  mariage: "Ya Wadud (Le Tout Aimant), Ya Latif (Le Subtil Bienveillant)",
  famille: "Ya Rahman (Le Très Miséricordieux), Ya Rahim",
  travail: "Ya Razzaq (Le Pourvoyeur), Ya Fattah (Celui qui ouvre)",
  argent: "Ya Razzaq, Ya Ghani (Le Riche absolu)",
  patience: "Ya Sabur (Le Patient), Ya Hakim (Le Sage)"
};

// LOAD DATA
async function loadDuas() {
  const res = await fetch("./data/duas.json");
  DUAS = await res.json();
}

// GET CATEGORIES
function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('input[name="category"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// RANDOM
function random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// CARD UI
function createCard(title, content) {
  return `
    <div class="doa-card">
      <div class="section-title">${title}</div>
      <div>${content}</div>
    </div>
  `;
}

// INTRO SPIRITUELLE
function buildIntro(cat) {
  return `
Ô ${ALLAH_NAMES[cat]},

Je me tourne vers Toi avec humilité et besoin.
Toi qui entends toute chose et réponds aux invocations sincères.
`;
}

// SALAWAT PREMIUM
function buildSalawat() {
  return `
<div class="salawat">
اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ
</div>

Les prières sur le Prophète ﷺ sont une cause d’acceptation des invocations.
`;
}

// GENERATION
function generate() {
  const cats = getSelectedCategories();

  if (cats.length === 0) {
    alert("Sélectionne au moins une catégorie");
    return;
  }

  let output = "";

  cats.forEach(cat => {
    const dua = random(DUAS[cat]);

    // 1. INTRO (NOMS D'ALLAH)
    output += createCard("🕋 Invocation d'ouverture", buildIntro(cat));

    // 2. LOUANGE
    output += createCard("🤲 Louange", "Louange à Allah, Seigneur des mondes.");

    // 3. SALAWAT (IMPORTANT)
    output += createCard("🌙 Salawat", buildSalawat());

    // 4. FRANÇAIS
    output += createCard("🇫🇷 Français", dua.translation);

    // 5. ARABE
    output += createCard("🇸🇦 Arabe", `<div class="arabic">${dua.arabic}</div>`);

    // 6. PHONETIQUE
    output += createCard("🔤 Phonétique", dua.transliteration);
  });

  // 7. ISTIGHFAR
  output += createCard("📿 Istighfar", "Astaghfirullaha wa atoubu ilayh");

  // 8. YAQIN
  output += createCard("❤️ Yaqîn",
    "Allah répond toujours aux invocations : au bon moment, de la meilleure manière."
  );

  lastGenerated = output;
  document.getElementById("output").innerHTML = output;
}

// COPY
function copy() {
  navigator.clipboard.writeText(lastGenerated.replace(/<[^>]*>/g, ""));
  alert("Dou’a copiée !");
}

// EVENTS
document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copy);
document.getElementById("regenBtn").addEventListener("click", generate);

// INIT
loadDuas();
