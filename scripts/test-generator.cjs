const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000/');
    await page.getByRole('button', {name: 'Refuser', exact: true}).click();
    await page.locator('#generateBottomBtn').click();
    assert(await page.locator('#selectionError').isVisible());
    await page.locator('.category-option').nth(0).click();
    await page.locator('.category-option').nth(1).click();
    await page.locator('#generateBottomBtn').click();
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
    assert.equal(await page.locator('[data-dua-action="favorite"]').count(), 0);
    assert(await card.evaluate(element => {
      const navigation = element.querySelector('.dua-navigation');
      return element.lastElementChild === navigation && getComputedStyle(navigation).justifyContent === 'flex-end';
    }));
    await page.locator('[data-lang="ar"]').click();
    assert(await card.locator('.arabic-content').count());
    assert.equal(await page.locator('[data-dua-action="copy"]').count(), 0);
    async function checkFullCopy() {
      await page.locator('#copyBtn').click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      for (const text of await page.locator('.praise-card .card-content, .salawat-card .card-content, .dua-card .card-content, .closing-card .card-content').allInnerTexts()) {
        assert(copied.includes(text.trim()), 'Full copy must contain every currently displayed invocation');
      }
      assert(copied.includes('TAWAKKUL ET YAQÎN'));
    }
    await checkFullCopy();
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
    for (let i = 0; i < 6; i++) await card.getByRole('button', {name: 'Douaa suivante', exact: true}).click();
    assert.equal(await card.locator('.dua-counter').innerText(), `7 / ${total}`);
    await checkFullCopy();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const marriageText = copied.split('DOUAA : MARIAGE\n')[1].split('\n\n')[0];
    assert.equal(marriageText, (await content()).trim());
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
    console.log('PASS: unique cycle, previous, independent themes, bottom-right navigation without favorites, full copy in Arabic and French at 7/14, swipe, language persistence, mobile width, single result.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
