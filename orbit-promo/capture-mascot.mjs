import {chromium} from 'playwright-core';import fs from 'node:fs/promises';import http from 'node:http';import path from 'node:path';
const root=path.resolve('preview-build');const target='public/screens';await fs.mkdir(target,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const p=path.join(root,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname));const b=await fs.readFile(p);res.setHeader('content-type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(b)}catch{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(5199,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/orbit-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']});const errors=[];const records=[];
for(const university of ['tnmgr','kuhs']){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:5199')?r.continue():r.abort());
 await context.addInitScript(u=>{localStorage.setItem('orbit-profile-v1',JSON.stringify({display_name:'Sabari',year:'final',university:u}));},university);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const shots=[['askai','screen=askai']];
 for(const [name,q] of shots){await page.goto('http://127.0.0.1:5199/?'+q);await page.waitForTimeout(1500);await page.screenshot({path:`${target}/${university}-${name}.png`});records.push({university,name,query:q,text:(await page.locator('body').innerText()).slice(0,2000)});await fs.writeFile(target+'/mascot-capture-records.json',JSON.stringify({records,errors},null,2));console.log('captured',university,name);}
await context.close();
}
await fs.writeFile(target+'/mascot-capture-records.json',JSON.stringify({records,errors},null,2));await browser.close();server.close();console.log('errors',errors);
