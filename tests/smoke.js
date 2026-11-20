// Smoke test: node tests/smoke.js /absolute/path/to/index.html (needs playwright). Set SHOTS=dir for screenshots.
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
  // riverside quarter: walk through the gate
  await p.click('.bld[data-b="gate"]');await p.waitForSelector('.bld[data-b="home"]');
  log('riverside places',await p.$$eval('.bld',a=>a.map(x=>x.dataset.b).join(',')));
  // home: dua of the day, practise with the listener checkboxes
  await p.click('.bld[data-b="home"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('#pr');log('dua of the day',(await p.textContent('.q')));await p.click('#pr');
  await p.waitForSelector('[data-ck]');for(const c of await p.$$('[data-ck]'))await c.click();await p.click('#ok');
  log('dua practised',(await p.textContent('#sh-b')).includes('practised'));await p.click('#sh-x');
  // which dua quiz
  await p.click('.bld[data-b="home"]');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');
  for(let i=0;i<5;i++){await p.waitForSelector('.ch');await p.click('.ch');await p.click('#nx');}
  log('dua quiz finished',(await p.textContent('#sh-b')).includes('/'));await p.click('#sh-x');
  // wudu order game: tap the steps in their true order
  await p.click('.bld[data-b="wudu"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('.step');const n=await p.$$eval('.step',a=>a.length);
  for(let i=0;i<n;i++)await p.click(`.step[data-i="${i}"]`);
  log('wudu steps done',(await p.textContent('#fb')).includes('complete'));await p.click('#home');
  // pillars order game
  await p.click('.bld[data-b="pillars"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('.step');for(let i=0;i<5;i++)await p.click(`.step[data-i="${i}"]`);
  log('pillars done',(await p.textContent('#fb')).includes('Masha'));await p.click('#home');
  // letter match: peek at every card, then click matching pairs
  await p.click('.bld[data-b="park"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('.mc');
  const L={};for(let i=0;i<12;i+=2){await p.click(`.mc[data-i="${i}"]`);await p.click(`.mc[data-i="${i+1}"]`);
    L[i]=await p.$eval(`.mc[data-i="${i}"]`,e=>e.textContent);L[i+1]=await p.$eval(`.mc[data-i="${i+1}"]`,e=>e.textContent);await p.waitForTimeout(1000);}
  const names=await p.evaluate(()=>Object.fromEntries(LETTERS));
  const left=[...Array(12).keys()].filter(i=>!(names[L[i]]&&false));
  for(const i of left){if(!names[L[i]])continue;const j=left.find(k=>L[k]===names[L[i]]);
    if(await p.$eval(`.mc[data-i="${i}"]`,e=>e.disabled))continue;await p.click(`.mc[data-i="${i}"]`);await p.click(`.mc[data-i="${j}"]`);await p.waitForTimeout(50);}
  log('letter match done',(await p.textContent('#fb')).includes('found them all'));await p.click('#home');
  // kind or not quiz
  await p.click('.bld[data-b="park"]');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');
  await p.waitForSelector('.ch');log('kind question',(await p.textContent('.q')));await p.click('#sh-x');
  // date harvest: a green date is refused, then pick every ripe one
  await p.click('.bld[data-b="orchard"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');
  await p.waitForSelector('.dt');
  const green=await p.$('.dt[aria-label="Green date"]');if(green)await green.click();
  log('green date refused',await p.$eval('#got',e=>e.textContent)==='0');
  while(await p.$('.dt[aria-label="Ripe date"]:not(.fall)')){await p.click('.dt[aria-label="Ripe date"]:not(.fall)');}
  await p.waitForSelector('#fb .fb');log('harvest done',(await p.textContent('#fb')).includes('picked'));await p.click('#home');
  // sums
  await p.click('.bld[data-b="orchard"]');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');
  for(let i=0;i<5;i++){await p.waitForSelector('.ch');await p.click('.ch');await p.click('#nx');}
  log('sums finished',(await p.textContent('#sh-b')).includes('/'));await p.click('#sh-x');
  await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-river.png'});
  // simple graphics, then back to the old town with the district buttons
  await p.click('[data-gfx="simple"]');log('simple graphics',await p.$eval('[data-gfx="simple"]',e=>e.getAttribute('aria-pressed')));
  await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-river-simple.png'});
  await p.click('[data-gfx="detailed"]');
  await p.click('[data-z="old"]');await p.waitForSelector('.bld[data-b="masjid"]');log('back in old town',true);
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
  await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-deeds.png'});
  await p.click('[data-tab="town"]');await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-town.png'});
  // parent view
  await p.click('[data-tab="parents"]');await p.waitForSelector('.stats');
  log('parent stats',await p.$$eval('.stat',a=>a.map(x=>x.textContent.replace(/\s+/g,' ').trim()).join(' | ')));
  log('today activities',(await p.textContent('.day')).replace(/\s+/g,' ').slice(0,120));
  log('fajr ticked today',await p.$eval('.tbl tbody tr td:nth-last-child(2)',e=>e.textContent));
  log('quiz rows',await p.$$eval('.card:nth-of-type(5) tbody tr',a=>a.length));
  await p.emulateMedia({media:'print'});await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-parents-print.png',fullPage:true});await p.emulateMedia({media:'screen'});
  await p.screenshot({path:(process.env.SHOTS||'.')+'/shot-parents.png',fullPage:true});
  console.log('page errors:',errs);
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
