// Build the existing static routes from the same renderers used by legacy dynamic routes.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const database = JSON.parse(fs.readFileSync(path.join(root, 'data/duas.json'), 'utf8'));
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const contexts = {
  guidance: '<p>Pour une décision concrète, consultez les <a href="/priere-de-consultation/">étapes et l’invocation de la prière d’Istikhara</a>.</p>',
  stress: '<p>Pour approfondir le sens d’une invocation dans l’épreuve, lisez la <a href="/douaas/yunus-21-87/">douaa de Younous : texte, traduction et contexte</a>.</p>',
  mariage: '<p>Pour un projet de mariage, découvrez le <a href="/priere-de-consultation/">guide de l’Istikhara</a>, puis les <a href="/themes/couple/">invocations pour le couple</a> et les <a href="/themes/famille/">invocations pour la famille</a>.</p>',
  couple: '<p>Retrouvez aussi les <a href="/themes/famille/">invocations pour la famille</a> et le <a href="/douaas/quran-25-74/">verset 25:74 sur les époux et la descendance</a>.</p>'
};
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon'};
const server = http.createServer((req,res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.endsWith('/')) name += 'index.html';
    // Build from source so a stale minified bundle can never generate stale HTML.
    name = name.replace(/\.min\.(js|css)$/, '.$1');
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(fs.readFileSync(file));
  } catch {res.writeHead(400);res.end();}
});
(async () => {
  let browser;
  try {
    await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const context = await browser.newContext();
    await context.addInitScript(() => {window.__BUILD_PRERENDER__ = true;});
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('/analytics.')) return route.fulfill({contentType:'text/javascript',body:''});
      return url.startsWith(origin + '/') ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const outputs = [];
    for (const family of (process.argv.includes('--pdf-only') ? [] : ['douaas','themes'])) {
      const dirs = fs.readdirSync(path.join(root,family)).filter(name => fs.existsSync(path.join(root,family,name,'index.html'))).sort();
      for (const slug of dirs) {
        const file = path.join(root,family,slug,'index.html');
        const source = fs.readFileSync(file,'utf8');
        await page.goto(`${origin}/${family}/${slug}/`);
        // Rendering is synchronous after JSON resolves; waiting for loading to hide detects completion.
        await page.waitForFunction(kind => {
          const prefix = kind === 'douaas' ? 'detail' : 'theme';
          return document.getElementById(prefix+'Loading')?.classList.contains('hidden') &&
            document.getElementById(prefix+'Error')?.classList.contains('hidden') &&
            (kind === 'douaas' ? !!document.getElementById('detailText')?.textContent : !!document.getElementById('themeDuas')?.textContent);
        }, family);
        const id = await page.getAttribute('body',family === 'douaas' ? 'data-dua-id' : 'data-theme-id');
        const dua = family === 'douaas' ? database.duas.find(d => d.id === id) : null;
        if (family === 'douaas' && !dua) throw Error(`Unknown dua ${id}`);
        const categories = dua ? (dua.categories || []).map(id => database.categories.find(c => c.id === id)).filter(Boolean) : [];
        const links = dua
          ? `<p>Explorer les thèmes : ${categories.map(c => `<a href="/themes/${escape(c.id)}/">${escape(c.label)}</a>`).join(' · ')}.</p>`
          : contexts[id] || '';
        let refs = '';
        const quran = dua?.source?.match(/Coran\s+(\d+):(\d+)/i);
        if (quran) refs = `<p><a href="https://quran.com/${quran[1]}/${quran[2]}">Consulter le verset ${quran[1]}:${quran[2]} sur Quran.com</a>.</p>`;
        const extra = `<section id="editorialLinks" class="panel editorial-links"><h2>Pour poursuivre la lecture</h2>${links}${refs}<p><a href="/a-propos/#politique-editoriale">Sources, traductions et méthode éditoriale</a> · <a href="/a-propos/#signaler-erreur">Signaler une erreur</a></p></section>`;
        const main = await page.evaluate(({dua,extra}) => {
          document.querySelectorAll('#duaData, #readingLanguages, #editorialLinks').forEach(e => e.remove());
          if (dua) {
            const section = document.createElement('section');section.id='readingLanguages';section.className='detail-section reading-languages';
            for (const [title,text,lang] of [['Texte arabe',dua.arabic,'ar'],['Phonétique',dua.transliteration,'fr']]) {
              if (!text) continue;
              const h=document.createElement('h2');h.textContent=title;
              const p=document.createElement('p');p.textContent=text;p.lang=lang;
              if(lang==='ar')p.dir='rtl';
              section.append(h,p);
            }
            document.querySelector('.detail-main-text').after(section);
            const data=document.createElement('script');data.id='duaData';data.type='application/json';data.textContent=JSON.stringify(dua).replace(/</g,'\\u003c');
            document.querySelector('main').append(data);
          }
          document.querySelector('main').insertAdjacentHTML('beforeend',extra);
          return document.querySelector('main').outerHTML;
        },{dua,extra});
        const title = await page.locator('h1').first().innerText();
        const canonical = `https://douaagenerator.fr/${family}/${slug}/`;
        const schema = {'@context':'https://schema.org','@graph':[
          {'@type':dua?'Article':'CollectionPage',name:title,...(dua?{headline:title}:{}),url:canonical,inLanguage:dua?['fr','ar']:'fr',isPartOf:{'@type':'WebSite',name:'Douaa Generator',url:'https://douaagenerator.fr/'}},
          {'@type':'BreadcrumbList',itemListElement:[{name:'Accueil',item:'https://douaagenerator.fr/'},{name:'Bibliothèque',item:'https://douaagenerator.fr/bibliotheque/'},{name:title,item:canonical}].map((v,i)=>({'@type':'ListItem',position:i+1,...v}))}
        ]};
        let output = source.replace(/<main\b[\s\S]*?<\/main>/,()=>main)
          .replace(/\sdata-prerendered="[^"]*"/g,'')
          .replace(/<body\b/,'<body data-prerendered="true"')
          .replace(/\s*<script id="prerenderSchema"[^>]*>[\s\S]*?<\/script>/g,'')
          .replace('</head>',()=>`  <script id="prerenderSchema" type="application/ld+json">${json(schema)}</script>\n</head>`);
        outputs.push([file,output.replace(/[ \t]+$/gm, "")]);
      }
      console.log(`Prepared ${dirs.length} ${family} pages.`);
    }
    if(errors.length)throw Error(errors.join('\n'));
    // No page is written until every route rendered successfully.
    for(const [file,output] of outputs)fs.writeFileSync(file,output);
    await page.goto(`${origin}/priere-de-consultation/`);
    await page.locator('details').evaluateAll(items => items.forEach(item => { item.open = true; }));
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(root,'assets/guide-istikhara.pdf'),format:'A4',preferCSSPageSize:true,printBackground:false,displayHeaderFooter:true,
      headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center">douaagenerator.fr/priere-de-consultation/ · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'});
    console.log(`Wrote ${outputs.length} complete static pages and the printable Istikhara PDF.`);
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
