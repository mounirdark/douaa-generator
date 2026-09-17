import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
fs.mkdirSync('artifacts', {recursive:true});
const chrome = await chromeLauncher.launch({chromePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',chromeFlags:['--headless','--no-sandbox']});
try {
 for (const [name,route] of [['accueil','/'],['istikhara','/priere-de-consultation/'],['recherche','/recherche/'],['mariage','/themes/mariage/'],['yunus','/douaas/yunus-21-87/']]) {
  const result=await lighthouse('http://127.0.0.1:8000'+route,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  fs.writeFileSync('artifacts/douaa-'+name+'-lighthouse.json',result.report);
  console.log(JSON.stringify({name,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,result.lhr.audits[k].displayValue])),failures:Object.values(result.lhr.audits).filter(v=>v.score!==null&&v.score<1).map(v=>({id:v.id,title:v.title,description:v.displayValue}))}));
 }
} finally {await chrome.kill();}
