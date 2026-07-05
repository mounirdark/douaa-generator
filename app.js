let DUAS = {};
let lastGenerated = "";

// load data
async function loadDuas() {
  const res = await fetch("./data/duas.json");
  DUAS = await res.json();
}

// get categories
function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('input[name="category"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// random
function random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// build UI card
function createCard(title, content, className = "") {
  return `
    <div class="doa-card ${className}">
      <div class="section-title">${title}</div>
      <div>${content}</div>
    </div>
  `;
}

// generate
function generate() {
  const cats = getSelectedCategories();

  if (cats.length === 0) {
    alert("Sélectionne au moins une catégorie");
    return;
  }

  let output = "";

  // HAMD
  output += createCard("🤲 Louange",
    "Louange à Allah, Seigneur des mondes."
  );

  // SALAWAT
  output += createCard("ﷺ Salawat",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّد"
  );

  // DOUAS
  cats.forEach(cat => {
    const dua = random(DUAS[cat]);

    output += createCard("🇫🇷 Français", dua.translation);
    output += createCard("🇸🇦 Arabe", `<div class="arabic">${dua.arabic}</div>`);
    output += createCard("🔤 Phonétique", dua.transliteration);
  });

  // ISTIGHFAR
  output += createCard("📿 Istighfar",
    "Astaghfirullaha wa atoubu ilayh"
  );

  // YAQIN
  output += createCard("❤️ Yaqîn",
    "Allah répond toujours aux invocations, au bon moment et de la meilleure manière."
  );

  lastGenerated = output;

  document.getElementById("output").innerHTML = output;
}

// copy
function copy() {
  navigator.clipboard.writeText(lastGenerated.replace(/<[^>]*>/g, ""));
  alert("Copié !");
}

// events
document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copy);
document.getElementById("regenBtn").addEventListener("click", generate);

loadDuas();
