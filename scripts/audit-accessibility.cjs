require('node:fs').mkdirSync('artifacts', {recursive:true});
const {chromium} = require('playwright');
const {default:AxeBuilder} = require('@axe-core/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();
 const failures=[];
 page.on('pageerror',err=>failures.push(err.message));
 for(const route of ['/', '/priere-de-consultation/','/recherche/','/confidentialite/','/cgu/','/404.html','/themes/mariage/','/douaas/yunus-21-87/','/bibliotheque/','/guide-des-douaas/','/a-propos/','/favoris/']) {
  for(const width of [360,1280]) {
   await page.setViewportSize({width,height:900});
   await page.goto('http://localhost:8000'+route);
   await page.waitForTimeout(600);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   if (overflow || results.violations.length) failures.push(`${route} at ${width}px: overflow=${overflow}, violations=${results.violations.length}`);
   console.log(JSON.stringify({route,width,overflow,violations:results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,8)}))}));
  }
 }
 await page.goto('http://localhost:8000/');
 await page.getByRole('button',{name:'Refuser',exact:true}).click();
 await page.locator('.category-option').first().click();
 await page.locator('#generateBtn').click();
 console.log('generation',await page.locator('#resultSection').isVisible());
 await page.screenshot({path:'artifacts/douaa-desktop.png',fullPage:true});
 await page.setViewportSize({width:360,height:800});
 await page.goto('http://localhost:8000/priere-de-consultation/');
 await page.screenshot({path:'artifacts/douaa-mobile.png',fullPage:true});
 console.log('errors',failures);
 await browser.close();
 if (failures.length) process.exitCode = 1;
})();
