const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000/');
    await page.getByRole('button', {name: 'Refuser', exact: true}).click();
    await page.locator('.category-option').nth(0).click();
    await page.locator('.category-option').nth(1).click();
    await page.locator('#generateBtn').click();
    const card = page.locator('.dua-card').first();
    const content = () => card.locator('.card-content').innerText();
    const original = await content();
    const other = await page.locator('.dua-card').nth(1).innerText();
    const total = Number((await card.locator('.dua-counter').innerText()).split('/')[1]);
    const seen = new Set([original]);
    for (let i = 1; i < total; i++) {
      await card.getByRole('button', {name: 'Douaa suivante', exact: true}).click();
      const text = await content(); assert(!seen.has(text)); seen.add(text);
    }
    await card.getByRole('button', {name: 'Douaa suivante', exact: true}).click();
    assert.equal(await content(), original);
    await card.getByRole('button', {name: 'Douaa précédente', exact: true}).click();
    assert((await card.locator('.dua-counter').innerText()).startsWith(String(total)));
    assert.equal(await page.locator('.dua-card').nth(1).innerText(), other);
    await card.getByRole('button', {name: '☆ Favori', exact: true}).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('douaaGeneratorFavorites')));
    assert.equal(saved.length, 1);
    assert.equal(await card.locator('.details-link').getAttribute('href'), saved[0].url);
    await page.locator('[data-lang="ar"]').click();
    assert(await card.locator('.arabic-content').count());
    await card.getByRole('button', {name: 'Copier cette douaa', exact: true}).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), (await content()).trim());
    await card.locator('.card-content').evaluate(target => {
      const start = new Touch({identifier: 1, target, clientX: 300, clientY: 200});
      const end = new Touch({identifier: 1, target, clientX: 100, clientY: 205});
      target.dispatchEvent(new TouchEvent('touchstart', {bubbles: true, touches: [start]}));
      target.dispatchEvent(new TouchEvent('touchend', {bubbles: true, changedTouches: [end]}));
    });
    assert((await card.locator('.dua-counter').innerText()).startsWith('1 /'));
    await page.locator('[data-lang="fr"]').click();
    assert.equal(await content(), original);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    // A theme with a single available text needs no navigation.
    await page.route('**/data/duas.json*', async route => {
      const data = require('../data/duas.json');
      data.duas = [data.duas.find(dua => dua.categories.includes(data.categories[0].id))];
      await route.fulfill({json:data});
    });
    await page.reload();
    await page.locator('.category-option').first().click();
    await page.locator('#generateBtn').click();
    assert.equal(await page.locator('.dua-navigation').count(), 0);
    console.log('PASS: unique cycle, previous, independent themes, favorites, Arabic copy, swipe, language persistence, mobile width, single result.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
