// Microphone logic test with a fake recogniser that behaves like Android Chrome:
// sessions can end at once with no result, words arrive as interim then final results.
// node tests/mic.js /absolute/path/to/index.html
const {chromium}=require('playwright');
const FAKE=`(()=>{
  const plan=window.__plan=[];
  class Fake{constructor(){this.n=++Fake.count}
    start(){const step=plan.shift()||{end:true};window.__sessions=(window.__sessions||0)+1;
      setTimeout(()=>{
        if(step.error){this.onerror&&this.onerror({error:step.error});}
        for(const r of step.results||[]){const res=[{transcript:r.t}];res.isFinal=!!r.final;
          this.onresult&&this.onresult({resultIndex:0,results:[res]});}
        this.onend&&this.onend();
      },step.delay||30)}
    abort(){} stop(){}}
  Fake.count=0;window.webkitSpeechRecognition=Fake;window.SpeechRecognition=Fake;
})()`;
(async()=>{
  const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:400,height:800}})).newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  // serve over http (like github.io) so file-specific messages do not apply
  const html=require('fs').readFileSync(process.argv[2]);
  const srv=require('http').createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(html)});
  await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
  await p.addInitScript(FAKE);await p.goto('http://127.0.0.1:'+srv.address().port+'/');
  const log=(k,v)=>console.log(k.padEnd(40),v);
  const open=async()=>{await p.click('.bld[data-b="madrasa"]');await p.waitForSelector('.act');await p.click('.act:nth-child(1)');await p.waitForSelector('.act');await p.click('.act:nth-child(2)');await p.waitForSelector('#mic')};
  // The first surah in the menu is Al-Fatihah, ayah 1: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  // 1) Android style: an empty session, then partial words, then the rest, then silence
  await open();
  await p.evaluate(()=>{window.__sessions=0;__plan.push({end:true},{results:[{t:'بسم الله'}]},{results:[{t:'الرحمن الرحيم',final:true}]})});
  await p.click('#mic');await p.waitForFunction(()=>!document.querySelector('#mic.live'),null,{timeout:8000});
  log('early end then words: result',(await p.textContent('#res')).trim().slice(0,40));
  log('sessions used',await p.evaluate(()=>window.__sessions));
  log('next enabled',await p.$eval('#ok',e=>!e.disabled));
  // 2) nothing heard at all: keeps retrying, then reports with a diagnostic code
  await p.click('#sh-x');await open();
  await p.evaluate(()=>{window.__sessions=0});
  await p.click('#mic');await p.waitForTimeout(600);await p.click('#mic'); // tap again to stop
  await p.waitForFunction(()=>!document.querySelector('#mic.live'));
  log('silence then stop: message',(await p.textContent('#res')).trim().slice(0,30));
  log('retried more than once',await p.evaluate(()=>window.__sessions>1));
  // 3) permission error stops at once
  await p.evaluate(()=>{window.__sessions=0;__plan.length=0;__plan.push({error:'not-allowed'})});
  await p.click('#mic');await p.waitForFunction(()=>!document.querySelector('#mic.live'));
  log('not-allowed message',(await p.textContent('#res')).trim().slice(0,40));
  log('not-allowed sessions',await p.evaluate(()=>window.__sessions));
  // 3b) Chrome allows the mic but the speech service refuses: show the Android steps
  await p.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){}}]});__plan.length=0;__plan.push({error:'not-allowed'})});
  await p.click('#mic');await p.waitForFunction(()=>document.querySelector('#res').textContent.includes('mic: ok'));
  log('service refused message',(await p.textContent('#res')).trim().slice(0,60));
  log('shows Google app step',(await p.textContent('#res')).includes('Google'));
  // 4) wrong words: graded, not passed
  await p.evaluate(()=>{__plan.length=0;__plan.push({results:[{t:'قل هو',final:true}]})});
  await p.click('#mic');await p.waitForFunction(()=>!document.querySelector('#mic.live'),null,{timeout:8000});
  log('wrong words result',(await p.textContent('#res')).trim().slice(0,30));
  console.log('page errors:',errs);await b.close();srv.close();
  if(errs.length)process.exit(1);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
