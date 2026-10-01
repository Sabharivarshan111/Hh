import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type FlowMode = 'fill' | 'eject' | 'none';

type Phase = {
  n:number;
  title:string;
  subtitle:string;
  duration:string;
  accent:string;
  avOpen:boolean;
  slOpen:boolean;
  atria:'CONTRACTING'|'RELAXED';
  ventricles:'CONTRACTING'|'RELAXING'|'RELAXED';
  pressure:string;
  volume:string;
  flow:FlowMode;
  flowSpeed:number;
};

const phases:Phase[] = [
  {n:1,title:'ATRIAL SYSTOLE',subtitle:'Final 20–30% of ventricular filling',duration:'0.1 s',accent:'#ff45bc',avOpen:true,slOpen:false,atria:'CONTRACTING',ventricles:'RELAXED',pressure:'Slight ↑',volume:'Final ↑',flow:'fill',flowSpeed:1.35},
  {n:2,title:'ISOVOLUMETRIC CONTRACTION',subtitle:'Pressure rises • volume unchanged',duration:'0.05–0.1 s',accent:'#ffb21e',avOpen:false,slOpen:false,atria:'RELAXED',ventricles:'CONTRACTING',pressure:'Rapid ↑↑',volume:'Unchanged',flow:'none',flowSpeed:0},
  {n:3,title:'RAPID EJECTION',subtitle:'Blood leaves both ventricles rapidly',duration:'0.1 s',accent:'#2de19a',avOpen:false,slOpen:true,atria:'RELAXED',ventricles:'CONTRACTING',pressure:'High',volume:'Rapid ↓',flow:'eject',flowSpeed:1.85},
  {n:4,title:'REDUCED EJECTION',subtitle:'Ejection continues at a slower rate',duration:'0.1 s',accent:'#76e169',avOpen:false,slOpen:true,atria:'RELAXED',ventricles:'CONTRACTING',pressure:'Starts ↓',volume:'Slow ↓',flow:'eject',flowSpeed:.8},
  {n:5,title:'ISOVOLUMETRIC RELAXATION',subtitle:'Pressure falls • volume unchanged',duration:'0.1 s',accent:'#4da4ff',avOpen:false,slOpen:false,atria:'RELAXED',ventricles:'RELAXING',pressure:'Rapid ↓↓',volume:'Unchanged',flow:'none',flowSpeed:0},
  {n:6,title:'RAPID FILLING',subtitle:'Blood rushes from atria to ventricles',duration:'0.1 s',accent:'#3dc8ff',avOpen:true,slOpen:false,atria:'RELAXED',ventricles:'RELAXED',pressure:'Low',volume:'Rapid ↑',flow:'fill',flowSpeed:1.75},
  {n:7,title:'REDUCED FILLING / DIASTASIS',subtitle:'Slow passive ventricular filling',duration:'0.2–0.3 s',accent:'#8c5cff',avOpen:true,slOpen:false,atria:'RELAXED',ventricles:'RELAXED',pressure:'Minimal change',volume:'Slow ↑',flow:'fill',flowSpeed:.48},
];

const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));

const blend=(a:number,b:number,t:number)=>a+(b-a)*t;

const Particle:React.FC<{x:number;y:number;r:number;color:string;opacity:number}> = ({x,y,r,color,opacity}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r*2.1} fill={color} opacity=".15"/>
    <circle cx={x} cy={y} r={r} fill={color}/>
    <circle cx={x-r*.3} cy={y-r*.35} r={r*.32} fill="#fff" opacity=".8"/>
  </g>
);

const quad=(p0:[number,number],p1:[number,number],p2:[number,number],t:number)=>{
  const u=1-t;
  return [
    u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],
    u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]
  ] as [number,number];
};

const FlowParticles:React.FC<{frame:number;mode:FlowMode;speed:number}> = ({frame,mode,speed})=>{
  if(mode==='none') return null;
  const fills=[
    {p0:[260,210] as [number,number],p1:[275,390] as [number,number],p2:[335,575] as [number,number],c:'#33bfff'},
    {p0:[515,210] as [number,number],p1:[515,390] as [number,number],p2:[500,575] as [number,number],c:'#ff4e6d'},
  ];
  const ejects=[
    {p0:[335,575] as [number,number],p1:[300,385] as [number,number],p2:[300,105] as [number,number],c:'#33bfff'},
    {p0:[500,575] as [number,number],p1:[530,365] as [number,number],p2:[500,85] as [number,number],c:'#ff4e55'},
  ];
  const paths=mode==='fill'?fills:ejects;
  return <>
    {paths.map((p,pi)=>Array.from({length:14}).map((_,i)=>{
      const t=((frame*.019*speed)+(i/14)+pi*.17)%1;
      const q=quad(p.p0,p.p1,p.p2,t);
      const pulse=Math.sin(Math.PI*t);
      return <Particle key={pi+'-'+i} x={q[0]} y={q[1]} r={5+4*pulse} color={p.c} opacity={.15+.85*pulse}/>;
    }))}
  </>;
};

const Valve:React.FC<{x:number;y:number;open:boolean;kind:'AV'|'SL'}> = ({x,y,open,kind})=>{
  const c=open?'#31df8b':'#ff4057';
  return <g>
    <circle cx={x} cy={y} r="26" fill={c} opacity=".12"/>
    <circle cx={x} cy={y} r="20" fill="#071321" stroke={c} strokeWidth="4"/>
    {open ? <>
      <path d={`M ${x-12} ${y+5} Q ${x-3} ${y-12} ${x} ${y-4}`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d={`M ${x+12} ${y+5} Q ${x+3} ${y-12} ${x} ${y-4}`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round"/>
    </> : <>
      <path d={`M ${x-12} ${y-7} Q ${x} ${y+6} ${x+12} ${y-7}`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d={`M ${x-12} ${y+7} Q ${x} ${y-6} ${x+12} ${y+7}`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round"/>
    </>}
    <text x={x} y={y+45} textAnchor="middle" fill="#d8e8f7" fontSize="14" fontWeight="900">{kind}</text>
  </g>
};

const Heart:React.FC<{phase:Phase;frame:number}> = ({phase,frame})=>{
  const atrialBeat=(Math.sin(frame/30*Math.PI*2*1.15)+1)/2;
  const ventBeat=(Math.sin(frame/30*Math.PI*2*1.15+1.3)+1)/2;
  const atrialScale=phase.atria==='CONTRACTING'?.93+.07*atrialBeat:1;
  const ventScale=phase.ventricles==='CONTRACTING'?.92+.08*ventBeat:phase.ventricles==='RELAXING'?.96+.04*(1-ventBeat):1;
  const glow=phase.accent;
  return <svg viewBox="0 0 760 820" width="100%" height="100%">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff9b83"/>
        <stop offset="45%" stopColor="#e85e51"/>
        <stop offset="100%" stopColor="#8e2633"/>
      </linearGradient>
      <radialGradient id="rv" cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#3868c6"/>
        <stop offset="100%" stopColor="#172d66"/>
      </radialGradient>
      <radialGradient id="lv" cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#c7434d"/>
        <stop offset="100%" stopColor="#601a2d"/>
      </radialGradient>
      <linearGradient id="vein" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5dc8ff"/><stop offset="100%" stopColor="#1e4fa5"/>
      </linearGradient>
      <linearGradient id="artery" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff8a73"/><stop offset="100%" stopColor="#ad2735"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>

    <ellipse cx="380" cy="405" rx="290" ry="320" fill={glow} opacity=".08" filter="url(#soft)"/>

    <path d="M380 104 C280 40 165 110 125 245 C83 392 130 604 278 735 C335 786 433 800 510 753 C661 662 702 441 650 268 C606 119 488 50 380 104Z" fill="url(#wall)" stroke="#ffad92" strokeWidth="8"/>

    <path d="M220 235 C160 190 160 96 205 50 L253 50 C220 125 246 189 275 239Z" fill="url(#vein)" stroke="#74d7ff" strokeWidth="6"/>
    <path d="M238 624 C196 689 185 772 215 808 L265 808 C245 741 256 680 278 618Z" fill="url(#vein)" stroke="#74d7ff" strokeWidth="6"/>

    <path d="M425 190 C410 102 430 44 492 22 C564 -3 623 38 632 95 C637 127 616 149 585 140 C574 112 555 99 532 104 C500 112 493 145 505 193Z" fill="url(#artery)" stroke="#ff9d89" strokeWidth="7"/>
    <path d="M362 198 C340 110 353 63 403 48 C454 33 495 66 503 112 C508 141 490 161 464 161 C448 130 427 119 405 127 C378 137 374 165 383 201Z" fill="url(#vein)" stroke="#74d7ff" strokeWidth="7"/>

    <g transform={`translate(270 300) scale(${atrialScale}) translate(-270 -300)`}>
      <path d="M148 235 C177 178 248 165 300 210 C326 234 334 281 318 329 C299 386 229 397 184 366 C145 339 127 278 148 235Z" fill="url(#rv)" stroke="#f7a295" strokeWidth="7"/>
    </g>
    <g transform={`translate(510 300) scale(${atrialScale}) translate(-510 -300)`}>
      <path d="M454 215 C505 169 582 186 610 245 C633 294 608 361 566 382 C516 407 452 379 438 329 C425 281 431 236 454 215Z" fill="url(#lv)" stroke="#f7a295" strokeWidth="7"/>
    </g>

    <g transform={`translate(320 520) scale(${ventScale}) translate(-320 -520)`}>
      <path d="M180 386 C222 359 300 369 345 417 C390 464 394 607 337 690 C304 738 247 722 208 666 C166 606 140 472 180 386Z" fill="url(#rv)" stroke="#ffb09c" strokeWidth="9"/>
    </g>
    <g transform={`translate(510 520) scale(${ventScale}) translate(-510 -520)`}>
      <path d="M423 382 C464 353 553 356 598 414 C644 473 619 628 558 709 C520 760 462 737 431 679 C394 611 383 421 423 382Z" fill="url(#lv)" stroke="#ffb09c" strokeWidth="10"/>
    </g>

    <path d="M389 373 C402 456 410 559 402 678" stroke="#ffbaa4" strokeWidth="20" strokeLinecap="round" opacity=".9"/>

    <Valve x={350} y={368} open={phase.avOpen} kind="AV"/>
    <Valve x={447} y={368} open={phase.avOpen} kind="AV"/>
    <Valve x={378} y={210} open={phase.slOpen} kind="SL"/>
    <Valve x={500} y={202} open={phase.slOpen} kind="SL"/>

    <FlowParticles frame={frame} mode={phase.flow} speed={phase.flowSpeed}/>

    <text x="228" y="286" fill="#fff" fontSize="35" fontWeight="950">RA</text>
    <text x="517" y="286" fill="#fff" fontSize="35" fontWeight="950">LA</text>
    <text x="282" y="560" fill="#fff" fontSize="35" fontWeight="950">RV</text>
    <text x="506" y="560" fill="#fff" fontSize="35" fontWeight="950">LV</text>
  </svg>;
};

const ValveRow:React.FC<{label:string;open:boolean}> = ({label,open}) => <div style={{
  background:'rgba(6,16,30,.82)',border:'1px solid rgba(255,255,255,.12)',borderRadius:18,
  padding:'15px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
  fontSize:21,fontWeight:900
}}>
  <span>{label}</span>
  <span style={{background:open?'#19bd78':'#ef4056',padding:'7px 13px',borderRadius:11,color:'#fff'}}>{open?'OPEN':'CLOSED'}</span>
</div>;

const Metric:React.FC<{label:string;value:string;color:string}> = ({label,value,color}) => <div style={{
  background:'rgba(7,18,34,.82)',border:'1px solid rgba(255,255,255,.12)',borderRadius:22,padding:'18px 20px'
}}>
  <div style={{fontSize:18,fontWeight:900,color:'#8eacc3',letterSpacing:.4}}>{label}</div>
  <div style={{fontSize:34,fontWeight:1000,color,marginTop:5}}>{value}</div>
</div>;

const PhaseScene:React.FC<{phase:Phase}> = ({phase})=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const enter=spring({frame,fps,config:{damping:18,stiffness:110}});
  const progress=clamp(frame/209);
  return <AbsoluteFill style={{
    background:'radial-gradient(circle at 50% 22%,#15304d 0%,#081321 52%,#02070d 100%)',
    color:'#fff',fontFamily:'Arial, Helvetica, sans-serif',padding:'62px 52px 48px'
  }}>
    <div style={{opacity:enter,transform:`translateY(${(1-enter)*38}px)`}}>
      <div style={{fontSize:21,fontWeight:900,color:'#45c7ff',letterSpacing:5}}>ORBIT MBBS</div>
      <div style={{display:'flex',gap:18,alignItems:'center',marginTop:18}}>
        <div style={{width:82,height:82,borderRadius:44,display:'grid',placeItems:'center',background:phase.accent,color:'#07111d',fontSize:42,fontWeight:1000,boxShadow:`0 0 35px ${phase.accent}66`}}>{phase.n}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:48,fontWeight:1000,lineHeight:1.02,letterSpacing:-1.5}}>{phase.title}</div>
          <div style={{fontSize:24,color:'#abc6d9',fontWeight:750,marginTop:8}}>{phase.subtitle}</div>
        </div>
        <div style={{fontSize:26,fontWeight:950,padding:'12px 17px',borderRadius:18,border:`2px solid ${phase.accent}`,color:phase.accent}}>{phase.duration}</div>
      </div>
      <div style={{height:9,borderRadius:9,background:'#18344c',marginTop:24,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${progress*100}%`,background:phase.accent,boxShadow:`0 0 20px ${phase.accent}`}}/>
      </div>
    </div>

    <div style={{
      height:980,marginTop:30,borderRadius:42,background:'linear-gradient(180deg,rgba(12,28,48,.98),rgba(4,10,18,.98))',
      border:'1px solid rgba(255,255,255,.13)',overflow:'hidden',boxShadow:'0 30px 90px rgba(0,0,0,.42)',position:'relative'
    }}>
      <div style={{position:'absolute',left:44,right:44,top:24,bottom:110}}>
        <Heart phase={phase} frame={frame}/>
      </div>
      <div style={{position:'absolute',left:26,right:26,bottom:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{background:'rgba(2,8,15,.74)',padding:'16px 18px',borderRadius:18,border:'1px solid rgba(255,255,255,.1)'}}>
          <div style={{fontSize:18,color:'#9ab5c9',fontWeight:900}}>ATRIA</div>
          <div style={{fontSize:28,color:phase.atria==='CONTRACTING'?'#ff52c6':'#d9ebf8',fontWeight:1000,marginTop:4}}>{phase.atria}</div>
        </div>
        <div style={{background:'rgba(2,8,15,.74)',padding:'16px 18px',borderRadius:18,border:'1px solid rgba(255,255,255,.1)'}}>
          <div style={{fontSize:18,color:'#9ab5c9',fontWeight:900}}>VENTRICLES</div>
          <div style={{fontSize:28,color:phase.ventricles!=='RELAXED'?'#43cbff':'#d9ebf8',fontWeight:1000,marginTop:4}}>{phase.ventricles}</div>
        </div>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13,marginTop:22}}>
      <ValveRow label="Mitral + Tricuspid" open={phase.avOpen}/>
      <ValveRow label="Aortic + Pulmonary" open={phase.slOpen}/>
      <Metric label="VENTRICULAR PRESSURE" value={phase.pressure} color={phase.accent}/>
      <Metric label="VENTRICULAR VOLUME" value={phase.volume} color={phase.accent}/>
    </div>
  </AbsoluteFill>;
};

const IntroHeart:React.FC<{frame:number}> = ({frame})=>{
  const phase=phases[0];
  const scale=.97+.03*((Math.sin(frame/30*Math.PI*2)+1)/2);
  return <div style={{transform:`scale(${scale})`,width:'100%',height:'100%'}}><Heart phase={phase} frame={frame}/></div>;
};

const Intro:React.FC = ()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:16,stiffness:95}});
  const spin=interpolate(frame,[0,120],[0,30]);
  return <AbsoluteFill style={{background:'radial-gradient(circle at 50% 30%,#183553 0%,#07111f 55%,#02060c 100%)',color:'#fff',fontFamily:'Arial, Helvetica, sans-serif',padding:'72px 52px'}}>
    <div style={{fontSize:22,fontWeight:900,color:'#45c7ff',letterSpacing:5}}>ORBIT MBBS</div>
    <div style={{fontSize:86,fontWeight:1000,lineHeight:.9,letterSpacing:-3,marginTop:24,opacity:s,transform:`translateY(${(1-s)*36}px)`}}>THE<br/><span style={{color:'#ff4f64'}}>CARDIAC</span><br/>CYCLE</div>
    <div style={{fontSize:28,color:'#abc6d9',fontWeight:700,marginTop:26}}>One heartbeat • Seven mechanical phases</div>

    <div style={{height:980,marginTop:36,borderRadius:44,background:'linear-gradient(180deg,#0d2238,#06101d)',border:'1px solid rgba(255,255,255,.13)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:'50px 80px 120px 80px'}}><IntroHeart frame={frame}/></div>
      <div style={{position:'absolute',left:334,top:348,width:300,height:300,borderRadius:170,border:'24px solid #36c7ff',borderTopColor:'#ff4fb8',borderRightColor:'#ff5268',transform:`rotate(${spin}deg)`,boxShadow:'0 0 50px rgba(54,199,255,.34)'}}/>
      <div style={{position:'absolute',left:366,top:426,width:236,textAlign:'center',fontSize:70,fontWeight:1000,textShadow:'0 5px 28px #000'}}>0.8<div style={{fontSize:30,marginTop:-3}}>seconds</div></div>
    </div>

    <div style={{display:'flex',gap:10,marginTop:28}}>
      {phases.map((p,i)=><div key={p.n} style={{height:14,flex:1,borderRadius:10,background:p.accent,opacity:.72+.28*Math.sin((frame+i*5)/12)**2}}/>)}
    </div>
  </AbsoluteFill>;
};

const Recap:React.FC = ()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:'linear-gradient(180deg,#081522,#02060b)',color:'#fff',fontFamily:'Arial, Helvetica, sans-serif',padding:'68px 52px'}}>
    <div style={{fontSize:22,fontWeight:900,color:'#45c7ff',letterSpacing:5}}>ORBIT MBBS</div>
    <div style={{fontSize:62,fontWeight:1000,marginTop:20}}>THE CARDIAC CYCLE</div>
    <div style={{fontSize:27,color:'#a8c4d8',marginTop:6}}>One complete cycle ≈ 0.8 s at 75 bpm</div>
    <div style={{marginTop:34,display:'grid',gap:14}}>
      {phases.map((p,i)=>{
        const a=clamp((frame-i*10)/28);
        return <div key={p.n} style={{height:154,borderRadius:24,background:'rgba(10,24,40,.9)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',overflow:'hidden',opacity:a,transform:`translateX(${(1-a)*60}px)`}}>
          <div style={{width:86,alignSelf:'stretch',display:'grid',placeItems:'center',background:p.accent,color:'#06111d',fontSize:40,fontWeight:1000}}>{p.n}</div>
          <div style={{flex:1,padding:'18px 22px'}}>
            <div style={{fontSize:29,fontWeight:1000}}>{p.title}</div>
            <div style={{fontSize:21,color:'#9fbacf',marginTop:5}}>{p.subtitle}</div>
          </div>
          <div style={{fontSize:22,fontWeight:950,color:p.accent,paddingRight:24}}>{p.duration}</div>
        </div>;
      })}
    </div>
    <div style={{marginTop:26,padding:'24px 26px',borderRadius:24,background:'rgba(17,43,67,.8)',border:'1px solid rgba(69,199,255,.22)',fontSize:28,fontWeight:900,lineHeight:1.45}}>
      Ventricular systole ≈ 0.3 s<br/>Ventricular diastole ≈ 0.5 s
    </div>
  </AbsoluteFill>;
};

export const CardiacCycleCrisp:React.FC = ()=>(
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}><Intro/></Sequence>
    {phases.map((p,i)=><Sequence key={p.n} from={120+i*210} durationInFrames={210}><PhaseScene phase={p}/></Sequence>)}
    <Sequence from={1590} durationInFrames={210}><Recap/></Sequence>
  </AbsoluteFill>
);
