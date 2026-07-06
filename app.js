let DUAS = {};
let lastRendered = [];
let currentLang = "fr";

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

// LOUANGE
function getLouange() {
  return {
    fr: "Il n’y a de divinité digne d’être adorée qu’Allah, le Très Grand, le Très Clément. Il n’y a de divinité digne d’être adorée qu’Allah, Seigneur du Trône immense. Il n’y a de divinité digne d’être adorée qu’Allah, Seigneur des cieux, Seigneur de la terre et Seigneur du Noble Trône.",
    ar: "لا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    ph: "Lâ ilâha illallâhu al-'Azîmu al-Halîm, Lâ ilâha illallâhu Rabbu al-'Arshi al-'Azîm, Lâ ilâha illallâhu Rabbu as-samâwâti wa Rabbu al-ardi wa Rabbu al-'Arshi al-Karîm."
  };
}

// SALAWAT (NEUTRE, SANS STYLE SPÉCIAL)
function getSalawat() {
  return {
    fr: "Ô Allah, prie sur Muhammad et sur la famille de Muhammad comme Tu as prié sur Ibrahim et sur la famille d'Ibrahim. Tu es certes Digne de louange et de glorification.",
    
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    
    ph: "Allahumma salli 'ala Muhammad wa 'ala ali Muhammad kama sallayta 'ala Ibrahim wa 'ala ali Ibrahim innaka hamidun majid"
  };
}

// CLOTURE
function getClosing() {
  return {
    fr: "Ô Allah, accepte cette invocation et accorde-nous le bien ici-bas et dans l’au-delà.",
    ar: "اللهم تقبل دعاءنا",
    ph: "Allahumma taqabbal du'ana"
  };
}

// ISTIGHFAR + YAQIN
function getFooter() {
  return {
    fr: "📿 Multiplie l’istighfar : Astaghfirullaha wa atoubu ilayh\n❤️ Aie confiance en Allah (Yaqîn)",
    ar: "استغفر الله",
    ph: "Astaghfirullah"
  };
}

// BUILD
function build(cats) {
  let blocks = [];

  // LOUANGE
  blocks.push({ title: "🤲 Louange", content: getLouange() });

  // SALAWAT
  blocks.push({ title: "🌙 Prière sur le Prophète ﷺ", content: getSalawat() });

  // DOUAS
  cats.forEach(cat => {
    const dua = random(DUAS[cat]);

    blocks.push({
      title: `📂 Douaa : ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
      content: {
        fr: dua.translation,
        ar: dua.arabic,
        ph: dua.transliteration
      }
    });
  });

  // CLOTURE
  blocks.push({ title: "🕊️ Clôture de douaa", content: getClosing() });

  // FOOTER
  blocks.push({ title: "📿 Istighfar / Yaqîn", content: getFooter() });

  return blocks;
}

// RENDER
function render(lang) {
  currentLang = lang;

  const output = document.getElementById("output");
  let html = "";

  lastRendered.forEach(block => {
    const text = block.content[lang] || block.content.fr;

    html += `
      <div class="doa-card">
        <div class="section-title">${block.title}</div>
        <div>${text.replace(/\n/g, "<br>")}</div>
      </div>
    `;
  });

  output.innerHTML = html;

  // UI langue active
  document.querySelectorAll("#langSwitcher button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.lang === lang) btn.classList.add("active");
  });
}

// GENERATE
function generate() {
  const cats = getSelectedCategories();

  if (cats.length === 0) {
    alert("Sélectionne au moins une catégorie");
    return;
  }

  lastRendered = build(cats);

  document.getElementById("langSwitcher").classList.remove("hidden");

  render("fr");
}

// EVENTS
document.getElementById("generateBtn").addEventListener("click", generate);

document.querySelectorAll("#langSwitcher button").forEach(btn => {
  btn.addEventListener("click", () => render(btn.dataset.lang));
});

loadDuas();
