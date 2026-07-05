let DUAS = {};

// Charger les données
async function loadDuas() {
  const res = await fetch("./data/duas.json");
  DUAS = await res.json();
}

function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('input[name="category"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// tirer une dou'a aléatoire dans une catégorie
function getRandomDua(category) {
  const list = DUAS[category];
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

// Mélange simple pour éviter répétition
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Construction du texte
function generateDua(selectedCategories) {
  let result = "";

  // 1. HAMD
  result += "🤲 Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux\n";
  result += "Louange à Allah, Seigneur des mondes, Maître des cieux et de la terre.\n\n";

  // 2. SALAWAT (IMPORTANT AJOUT)
  result += "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ\n";
  result += "Ô Allah, envoie Tes bénédictions et Ta paix sur le Prophète Muhammad ﷺ\n\n";

  // 3. DOUAS
  const shuffled = selectedCategories.sort(() => Math.random() - 0.5);

  shuffled.forEach(cat => {
    const dua = getRandomDua(cat);
    if (!dua) return;

    // FRANÇAIS
    result += "🇫🇷 " + (cat.toUpperCase()) + "\n";
    result += dua.translation + "\n\n";

    // ARABE
    result += "🇸🇦 Arabe :\n";
    result += dua.arabic + "\n\n";

    // PHONÉTIQUE
    result += "🔤 Phonétique :\n";
    result += dua.transliteration + "\n\n";

    result += "------------------------\n\n";
  });

  // 4. ISTIGHFAR (OBLIGATOIRE)
  result += "📿 ISTIGHFAR\n\n";
  result += "Astaghfirullaha wa atoubu ilayh\n\n";
  result += "Le Prophète ﷺ a dit : Celui qui demande pardon fréquemment, Allah lui ouvre des issues.\n\n";

  result += "------------------------\n\n";

  // 5. YAQÎN
  result += "❤️ YAQÎN (CERTITUDE EN ALLAH)\n\n";
  result += "Invoque Allah avec certitude.\n";
  result += "Allah répond toujours : soit immédiatement, soit plus tard, soit par une protection.\n";
  result += "Ne désespère jamais de Sa miséricorde.\n";

  return result;
}

// Affichage
function displayDua(text) {
  const output = document.getElementById("output");
  output.innerText = text;
}

// Event principal
document.getElementById("generateBtn").addEventListener("click", () => {
  const selected = getSelectedCategories();

  if (selected.length === 0) {
    alert("Sélectionne au moins une catégorie.");
    return;
  }

  const dua = generateDua(selected);
  displayDua(dua);
});

// Init
loadDuas();
