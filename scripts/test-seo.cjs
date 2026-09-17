const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root=path.resolve(__dirname,'..');
const base=process.env.SITE_URL || 'http://127.0.0.1:8000';
const database=JSON.parse(fs.readFileSync(path.join(root,'data/duas.json'),'utf8'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  let count=0;
  for(const family of ['douaas','themes']) {
   for(const slug of fs.readdirSync(path.join(root,family)).sort()) {
    if(!fs.existsSync(path.join(root,family,slug,'index.html')))continue;
    await page.goto(`${base}/${family}/${slug}/`);
    assert.equal(await page.getAttribute('body','data-prerendered'),'true');
    assert((await page.locator('h1').innerText()).trim());
    if(family==='douaas') {
     const id=await page.getAttribute('body','data-dua-id');
     const dua=database.duas.find(d=>d.id===id);
     assert.equal(await page.locator('#detailText').innerText(),dua.french);
     if(dua.arabic)assert((await page.locator('#readingLanguages').innerText()).includes(dua.arabic));
     if(dua.transliteration)assert((await page.locator('#readingLanguages').innerText()).includes(dua.transliteration));
     if(dua.context)assert.equal(await page.locator('#detailContext').innerText(),dua.context);
     assert(await page.locator('#detailPanel').isVisible());
    } else {
     assert(await page.locator('#themeHeader').isVisible());
     assert((await page.locator('#themeDuas').innerText()).length>200);
     const faq=page.locator('details.faq-item').last();
     if(await faq.count()) {await faq.locator('summary').click();assert(await faq.locator('.faq-answer').isVisible());}
    }
    assert(await page.locator('#editorialLinks a').count());
    count++;
   }
  }
  await context.close();
  const live=await browser.newContext();
  // Public Analytics is never contacted by this test.
  await live.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const p=await live.newPage();const failures=[];const dataRequests=[];
  p.on('pageerror',e=>failures.push(e.message));
  p.on('request',r=>{if(r.url().includes('/data/'))dataRequests.push(r.url());});
  await live.route('**/data/**',r=>r.abort());
  await p.goto(`${base}/douaas/yunus-21-87/`);
  await p.getByRole('button',{name:'Refuser',exact:true}).click();
  await p.locator('[data-detail-lang="ar"]').click();
  assert.equal(await p.locator('#detailText').getAttribute('dir'),'rtl');
  await p.locator('#favoriteDuaBtn').click();assert.equal(await p.locator('#favoriteDuaBtn').getAttribute('aria-pressed'),'true');
  await p.reload();assert.equal(await p.locator('#favoriteDuaBtn').getAttribute('aria-pressed'),'true');
  await p.goto(`${base}/themes/protection/`);
  assert.equal(await p.locator('a[href*="undefined"]').count(),0);
  const faq=p.locator('details.faq-item').last();if(await faq.count()){await faq.locator('summary').click();assert(await faq.locator('.faq-answer').isVisible());}
  assert.equal(dataRequests.length,0,'Static pages should not fetch the database');
  await live.unroute('**/data/**');
  await p.goto(`${base}/douaa.html?id=yunus_21_87`);await p.locator('#detailPanel').waitFor({state:'visible'});
  assert((await p.locator('#detailText').innerText()).length>20);
  await p.goto(`${base}/theme/?id=stress`);await p.locator('#themeHeader').waitFor({state:'visible'});
  assert((await p.locator('#themeDuas').innerText()).length>200);
  await p.goto(`${base}/priere-de-consultation/`);
  assert(await p.locator('[data-print]').isVisible());
  const closedBefore = await p.locator('details:not([open])').count();
  await p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  assert.equal(await p.locator('details:not([open])').count(), 0);
  await p.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  assert.equal(await p.locator('details:not([open])').count(), closedBefore);
  const response=await p.request.get(`${base}/assets/guide-istikhara.pdf`);assert(response.ok());assert((await response.body()).subarray(0,5).toString()==='%PDF-');
  assert.deepEqual(failures,[]);
  console.log(`PASS: ${count} pages readable without JavaScript; languages, favorites, native FAQ, no JSON requests, legacy routes and printable PDF.`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
