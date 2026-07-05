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
  result += "🤲 Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux\n\n";
  result += "Louange à Allah, Seigneur des mondes, Créateur des cieux et de la terre.\n\n";

  // 2. SALAWAT
  result += "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ\n\n";

  // 3. DOUAS
  selectedCategories = shuffle(selectedCategories);

  selectedCategories.forEach(cat => {
    const dua = getRandomDua(cat);
    if (!dua) return;

    result += `📿 (${cat.toUpperCase()})\n\n`;
    result += `${dua.arabic}\n\n`;
    result += `${dua.transliteration}\n\n`;
    result += `${dua.translation}\n\n`;
    result += `Source : ${dua.source}\n\n`;
    result += "-----------------------------\n\n";
  });

  // 4. ISTIGHFAR (OBLIGATOIRE)
  result += "📿 ISTIGHFAR\n\n";
  result += "Astaghfirullaha wa atoubu ilayh\n\n";
  result += "Le Prophète ﷺ a dit : \"Celui qui demande pardon à Allah fréquemment, Allah lui ouvre des issues à chaque difficulté.\"\n\n";

  result += "-----------------------------\n\n";

  // 5. YAQÎN (FOI ET CERTITUDE)
  result += "❤️ YAQÎN (CONFIANCE EN ALLAH)\n\n";
  result += "Invoque Allah avec certitude. Rien n’est perdu auprès de Lui.\n";
  result += "Chaque dou’a est entendue : soit exaucée immédiatement, soit protégée, soit réservée pour l’au-delà.\n\n";
  result += "Ne cesse jamais d’invoquer, même si la réponse tarde.\n";

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
