let DUAS = {};
let lastData = null;
let currentLang = "fr";

// LOAD
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

// INTRO (NOMS D'ALLAH SIMPLIFIÉ)
function intro(cat) {
  return {
    fr: `Ô Allah, je me tourne vers Toi avec besoin et confiance.`,
    ar: `اللهم إني أتوجه إليك`,
    ph: `Allahumma inni atawajjahu ilayk`
  };
}

// SALAWAT (FORTEMENT MIS EN AVANT)
function salawat() {
  return {
    fr: "🌙 Prier sur le Prophète ﷺ est une cause d'acceptation des invocations.",
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّد ﷺ",
    ph: "Allahumma salli wa sallim 'ala Muhammad"
  };
}

// CLOSING DUAA (DOUA SANDWICH)
function closing() {
  return {
    fr: "Ô Allah, accepte cette invocation et fais qu'elle soit un bien pour moi dans cette vie et dans l'au-delà.",
    ar: "اللهم تقبل دعائي واجعل فيه الخير",
    ph: "Allahumma taqabbal du'ai"
  };
}

// BUILD CONTENT
function buildContent(cats) {
  let data = [];

  cats.forEach(cat => {
    const dua = random(DUAS[cat]);

    data.push({
      type: "intro",
      content: intro(cat)
    });

    data.push({
      type: "salawat",
      content: salawat()
    });

    data.push({
      type: "dua",
      content: {
        fr: dua.translation,
        ar: dua.arabic,
        ph: dua.transliteration
      }
    });

    data.push({
      type: "closing",
      content: closing()
    });
  });

  // ALWAYS FOOTER
  data.push({
    type: "footer",
    content: {
      fr: "📿 Multiplie l’istighfar : Astaghfirullaha wa atoubu ilayh\n❤️ Garde confiance en Allah (Yaqîn)",
      ar: "استغفر الله",
      ph: "Astaghfirullah"
    }
  });

  return data;
}

// RENDER
function render(lang) {
  currentLang = lang;

  const output = document.getElementById("output");

  let html = "";

  lastData.forEach(block => {
    const c = block.content[lang] || block.content.fr;

    if (block.type === "salawat") {
      html += `<div class="doa-card salawat">${c}</div>`;
    } else {
      html += `<div class="doa-card">${c}</div>`;
    }
  });

  output.innerHTML = html;

  // active button UI
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

  lastData = buildContent(cats);

  document.getElementById("langSwitcher").classList.remove("hidden");

  render("fr");
}

// EVENTS
document.getElementById("generateBtn").addEventListener("click", generate);

document.querySelectorAll("#langSwitcher button").forEach(btn => {
  btn.addEventListener("click", () => render(btn.dataset.lang));
});

loadDuas();
