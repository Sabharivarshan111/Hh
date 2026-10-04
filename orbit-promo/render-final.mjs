import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import fs from 'node:fs';
const root=process.env.ORBIT_OUTPUT||'../../output';
const browserExecutable=process.env.ORBIT_BROWSER||process.cwd()+'/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl=await bundle({entryPoint:'src/index.tsx'});
const modes=process.argv.includes('--voice')?[['ORBIT-Voice-Only','ORBIT_TNMGR_KUHS_VoiceOnly_48s']]:[['ORBIT-Beat-NoVoice','ORBIT_TNMGR_KUHS_MusicOnly_36s']];
for(const [id,name] of modes){
 const composition=await selectComposition({serveUrl,id,browserExecutable});
 if(process.argv.includes('--stills')){
 const shots=JSON.parse(fs.readFileSync(id==='ORBIT-Voice-Only'?'storyboard.json':'storyboard-beat.json','utf8'));
 const frames=[...new Set(shots.flatMap((s,i)=>[Math.round((s.at+.1)*60),Math.round((s.at+.3)*60),Math.round((s.at+.8)*60),Math.round((s.at+(s.slot||s.d)/2)*60)]))];
 fs.mkdirSync(root+'/frames/'+id,{recursive:true});
 for(const frame of frames)await renderStill({serveUrl,composition,browserExecutable,frame,scale:.25,output:root+'/frames/'+id+'/'+frame+'.png'});
 }else{let last=-1;await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',crf:18,pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'192k',outputLocation:root+'/'+name+'.mp4',concurrency:6,onProgress:({progress})=>{const p=Math.floor(progress*10);if(last!==p){last=p;console.log(name,p*10+'%')}}});}
}
