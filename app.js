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
    fr: "Louange à Allah, Seigneur des mondes, le Tout Miséricordieux, le Très Miséricordieux.",
    ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    ph: "Alhamdulillahi Rabbil 'alamin"
  };
}

// SALAWAT (MISE EN AVANT)
function getSalawat() {
  return {
    fr: "🌙 Prier sur le Prophète ﷺ est une cause d’acceptation des invocations.",
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ",
    ph: "Allahumma salli wa sallim 'ala Muhammad"
  };
}

// CLOTURE (DOUA SANDWICH)
function getClosing() {
  return {
    fr: "Ô Allah, accepte cette invocation, pardonne-nous et accorde-nous le bien ici-bas et dans l’au-delà.",
    ar: "اللهم تقبل دعاءنا واغفر لنا",
    ph: "Allahumma taqabbal du'ana"
  };
}

// ISTIGHFAR + YAQIN
function getFooter() {
  return {
    fr: "📿 Multiplie l’istighfar : Astaghfirullaha wa atoubu ilayh\n❤️ Aie une confiance totale en Allah (Yaqîn)\nChaque invocation est entendue et répondue de la meilleure manière.",
    ar: "استغفر الله وأتوكل على الله",
    ph: "Astaghfirullah wa atawakkal 'ala Allah"
  };
}

// BUILD STRUCTURE
function build(cats) {
  let blocks = [];

  // 1. LOUANGE
  blocks.push({ title: "🤲 Louange", content: getLouange() });

  // 2. SALAWAT
  blocks.push({ title: "🌙 Prière sur le Prophète ﷺ", content: getSalawat() });

  // 3. DOUAS (catégories dynamiques)
  cats.forEach((cat, index) => {
    const dua = random(DUAS[cat]);

    blocks.push({
      title: `📂 Douaa ${cat.toUpperCase()}`,
      content: {
        fr: dua.translation,
        ar: dua.arabic,
        ph: dua.transliteration
      }
    });
  });

  // 4. CLOTURE
  blocks.push({ title: "🕊️ Clôture de douaa", content: getClosing() });

  // 5. FOOTER
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

  // UI active button
  document.querySelectorAll("#langSwitcher button").forEach(b => {
    b.classList.remove("active");
    if (b.dataset.lang === lang) b.classList.add("active");
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
