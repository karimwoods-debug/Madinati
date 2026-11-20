// Smoke test: node tests/smoke.js /absolute/path/to/index.html (needs playwright)
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:800}});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2]);
  const log=(k,v)=>console.log(k.padEnd(34),v);
  log('overlay hidden at load',await p.$eval('#ov',e=>getComputedStyle(e).display==='none'));
  // open masjid
  await p.click('.bld[data-b="masjid"]');await p.waitForSelector('#ov:not([hidden])');
  log('masjid menu items',await p.$$eval('.act',a=>a.length));
  // dzikir check quiz: answer all
  await p.click('.act:nth-child(4)');
  for(let i=0;i<5;i++){await p.waitForSelector('.ch');const q=await p.$eval('.q',e=>e.textContent);await p.click('.ch');await p.click('#nx');}
  log('quiz finished',(await p.textContent('#sh-b')).includes('/'));
  await p.click('#sh-x');
  log('closed',await p.$eval('#ov',e=>getComputedStyle(e).display==='none'));
  // dzikir counter: tap through first step quickly with delays
  await p.click('.bld[data-b="masjid"]');await p.waitForSelector('.act');await p.click('.act:nth-child(3)');
  await p.waitForSelector('#tap');await p.click('#tap');await p.waitForTimeout(400);await p.click('#tap');
  log('dzikir count after 2 taps',await p.textContent('#tap'));
  await p.click('#sh-x');
  // madrasa -> recite -> mic unsupported falls back
  await p.click('.bld[data-b="madrasa"]');await p.waitForSelector('.act');
  log('madrasa menu items',await p.$$eval('.act',a=>a.length));
  await p.click('.act:nth-child(1)');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');
  await p.waitForSelector('#mic');await p.click('#mic');await p.waitForTimeout(600);
  log('mic fallback message',(await p.textContent('#res')).slice(0,60));
  for(const c of await p.$$('[data-ck]'))await c.click();
  log('listener confirm enabled',await p.$eval('#ok',e=>!e.disabled));
  await p.click('#sh-x');
  // memory check
  await p.click('.bld[data-b="madrasa"]');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');
  await p.waitForSelector('#rev');await p.click('#rev');await p.click('#lk');
  log('memory next enabled',await p.$eval('#ok',e=>!e.disabled));
  await p.click('#sh-x');
  // hifz quiz
  await p.click('.bld[data-b="madrasa"]');await p.waitForSelector('.act');await p.click('.act:nth-child(3)');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('.ch');log('hifz question',(await p.textContent('.q')));
  await p.click('#sh-x');
  // wardrobe try-on
  await p.click('[data-tab="wardrobe"]');await p.click('[data-w="carry"]');
  await p.click('[data-k="hand"][data-v="lantern"]');
  log('trying-on bar',(await p.textContent('.tryrow')).replace(/\s+/g,' ').slice(0,70));
  log('coins unchanged',await p.textContent('#coins'));
  await p.click('[data-rm="hand"]');log('try-on removed',await p.$$eval('.tryrow',a=>a.length)===0);
  await p.click('[data-w="head"]');await p.click('[data-k="gender"]').catch(()=>{});
  await p.click('[data-w="body"]');await p.click('[data-k="gender"][data-v="boy"]');await p.click('[data-w="head"]');
  await p.click('[data-k="hat"][data-v="ghutra"]');log('boy ghutra try-on',await p.$$eval('.tryrow',a=>a.length)===1);
  await p.click('[data-tab="deeds"]');await p.click('[data-d="fajr"]');log('coins after deed',await p.textContent('#coins'));
  await p.screenshot({path:'shot-deeds.png'});
  await p.click('[data-tab="town"]');await p.screenshot({path:'shot-town.png'});
  console.log('page errors:',errs);
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
