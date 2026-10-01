import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {storyboard} from './storyboard';

type Flow = 'fill' | 'eject' | 'none';

type Phase = {
  n: number;
  title: string;
  subtitle: string;
  duration: string;
  accent: string;
  tile: number;
  avOpen: boolean;
  slOpen: boolean;
  flow: Flow;
  speed: number;
  atria: string;
  ventricles: string;
  pressure: string;
  volume: string;
  ecg: string;
  sound: string;
};

const phases: Phase[] = [
  {n:1,title:'ATRIAL SYSTOLE',subtitle:'Final 20–30% of ventricular filling',duration:'0.1 s',accent:'#ff4fb8',tile:1,avOpen:true,slOpen:false,flow:'fill',speed:1.25,atria:'CONTRACTING',ventricles:'RELAXED',pressure:'Slight ↑',volume:'Final ↑',ecg:'P wave / PR segment',sound:'S4 may occur'},
  {n:2,title:'ISOVOLUMETRIC CONTRACTION',subtitle:'Pressure rises while volume stays constant',duration:'0.05–0.1 s',accent:'#ffb020',tile:2,avOpen:false,slOpen:false,flow:'none',speed:0,atria:'RELAXED',ventricles:'CONTRACTING',pressure:'Rapid ↑↑',volume:'UNCHANGED',ecg:'Just after QRS',sound:'S1 — AV valves close'},
  {n:3,title:'RAPID EJECTION',subtitle:'Blood exits both ventricles quickly',duration:'0.1 s',accent:'#28e68e',tile:3,avOpen:false,slOpen:true,flow:'eject',speed:1.85,atria:'RELAXED',ventricles:'STRONG CONTRACTION',pressure:'HIGH',volume:'Rapid ↓',ecg:'ST segment',sound:'—'},
  {n:4,title:'REDUCED EJECTION',subtitle:'Ejection continues, but more slowly',duration:'0.1 s',accent:'#7ee46a',tile:4,avOpen:false,slOpen:true,flow:'eject',speed:0.75,atria:'RELAXED',ventricles:'WEAKER CONTRACTION',pressure:'Starts ↓',volume:'Slow ↓',ecg:'T wave begins',sound:'—'},
  {n:5,title:'ISOVOLUMETRIC RELAXATION',subtitle:'All valves closed as pressure falls',duration:'0.1 s',accent:'#55a7ff',tile:5,avOpen:false,slOpen:false,flow:'none',speed:0,atria:'RELAXED',ventricles:'RELAXING',pressure:'Rapid ↓↓',volume:'UNCHANGED',ecg:'End of T wave',sound:'S2 — semilunar valves close'},
  {n:6,title:'RAPID FILLING',subtitle:'Blood rushes from atria into ventricles',duration:'0.1 s',accent:'#44c8ff',tile:6,avOpen:true,slOpen:false,flow:'fill',speed:1.75,atria:'RELAXED',ventricles:'RELAXED',pressure:'LOW',volume:'Rapid ↑',ecg:'TP segment',sound:'S3 may occur'},
  {n:7,title:'REDUCED FILLING / DIASTASIS',subtitle:'Slow passive ventricular filling',duration:'0.2–0.3 s',accent:'#3fa6ff',tile:7,avOpen:true,slOpen:false,flow:'fill',speed:0.45,atria:'RELAXED',ventricles:'RELAXED',pressure:'Minimal change',volume:'Slow ↑',ecg:'TP segment',sound:'—'},
];

const clamp = (v:number,a=0,b=1)=>Math.min(b,Math.max(a,v));

const GeneratedTile: React.FC<{tile:number; zoom?:number; style?:React.CSSProperties}> = ({tile,zoom=1,style}) => {
  const map = [
    [0,0],[1,0],[2,0],[3,0],
    [0,1],[1,1],[2,1],[3,1]
  ];
  const [col,row] = map[tile];
  return <div style={{
    backgroundImage:'url('+storyboard+')',
    backgroundRepeat:'no-repeat',
    backgroundSize:'400% 200%',
    backgroundPosition:(col*33.333)+'% '+(row*100)+'%',
    transform:'scale('+zoom+')',
    transformOrigin:'50% 50%',
    ...style,
  }}/>;
};

const Valve: React.FC<{x:number;y:number;open:boolean;label:string;frame:number;accent:string}> = ({x,y,open,label,frame,accent}) => {
  const beat = Math.pow(Math.max(0,Math.sin(frame/30*Math.PI*2*1.15)),8);
  const c = open ? '#35e58f' : '#ff465d';
  return <g>
    <circle cx={x} cy={y} r={31+beat*8} fill={c} opacity={0.12+beat*0.18}/>
    <circle cx={x} cy={y} r="19" fill="#06111e" stroke={c} strokeWidth="5"/>
    {open
      ? <path d={'M '+(x-11)+' '+(y+5)+' L '+x+' '+(y-8)+' L '+(x+11)+' '+(y+5)} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"/>
      : <>
          <path d={'M '+(x-10)+' '+(y-10)+' L '+(x+10)+' '+(y+10)} stroke={c} strokeWidth="5" strokeLinecap="round"/>
          <path d={'M '+(x+10)+' '+(y-10)+' L '+(x-10)+' '+(y+10)} stroke={c} strokeWidth="5" strokeLinecap="round"/>
        </>
    }
    <text x={x} y={y+47} textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff">{label}</text>
  </g>;
};

const FlowParticles: React.FC<{frame:number;flow:Flow;speed:number}> = ({frame,flow,speed}) => {
  if(flow==='none') return null;
  const paths = flow==='fill'
    ? [{x1:270,y1:150,x2:295,y2:440,c:'#3cb9ff'},{x1:500,y1:150,x2:485,y2:440,c:'#ff5870'}]
    : [{x1:295,y1:440,x2:245,y2:85,c:'#3cb9ff'},{x1:485,y1:440,x2:525,y2:75,c:'#ff5870'}];
  return <>
    {paths.flatMap((p,pi)=>Array.from({length:12}).map((_,i)=>{
      const t=((frame*0.018*speed)+i/12+pi*.17)%1;
      const s=t*t*(3-2*t);
      const x=p.x1+(p.x2-p.x1)*s+Math.sin((t+i)*8)*7;
      const y=p.y1+(p.y2-p.y1)*s;
      return <circle key={pi+'-'+i} cx={x} cy={y} r={7+3*Math.sin(Math.PI*t)} fill={p.c} opacity={0.3+0.7*Math.sin(Math.PI*t)}/>;
    }))}
  </>;
};

const HeartOverlay:React.FC<{phase:Phase;frame:number}> = ({phase,frame}) => {
  const pulse=(Math.sin(frame/30*Math.PI*2*1.15)+1)/2;
  const squeeze=phase.ventricles.includes('CONTRACT') ? .92+pulse*.055 : .985+pulse*.018;
  return <div style={{position:'absolute',inset:0,transform:'scale('+squeeze+')',transformOrigin:'50% 56%'}}>
    <svg viewBox="0 0 768 600" style={{width:'100%',height:'100%'}}>
      <defs>
        <radialGradient id={'g'+phase.n}>
          <stop offset="0%" stopColor={phase.accent} stopOpacity={phase.ventricles.includes('CONTRACT') ? 0.25 : 0.11}/>
          <stop offset="100%" stopColor={phase.accent} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="385" cy="365" rx="228" ry="188" fill={'url(#g'+phase.n+')'}/>
      <FlowParticles frame={frame} flow={phase.flow} speed={phase.speed}/>
      <Valve x={345} y={270} open={phase.avOpen} label="TRICUSPID" frame={frame} accent={phase.accent}/>
      <Valve x={460} y={270} open={phase.avOpen} label="MITRAL" frame={frame} accent={phase.accent}/>
      <Valve x={330} y={155} open={phase.slOpen} label="PULMONARY" frame={frame} accent={phase.accent}/>
      <Valve x={485} y={145} open={phase.slOpen} label="AORTIC" frame={frame} accent={phase.accent}/>
    </svg>
  </div>;
};

const ECG:React.FC<{frame:number;phase:Phase}> = ({frame,phase}) => {
  const x=40+(frame%210)/209*900;
  const soundPhase=phase.n===2||phase.n===5||phase.n===6;
  const burst=soundPhase ? Math.pow(Math.max(0,Math.sin(frame/30*Math.PI*2*1.25)),12) : 0;
  return <div style={{height:220,borderRadius:28,overflow:'hidden',background:'#071421',border:'1px solid rgba(255,255,255,.12)',position:'relative'}}>
    <svg viewBox="0 0 980 220" style={{width:'100%',height:'100%'}}>
      {Array.from({length:14}).map((_,i)=><line key={'v'+i} x1={i*75} y1="0" x2={i*75} y2="220" stroke="#21415d" opacity=".35"/>)}
      {Array.from({length:6}).map((_,i)=><line key={'h'+i} x1="0" y1={i*44} x2="980" y2={i*44} stroke="#21415d" opacity=".35"/>)}
      <path d="M20 128 L110 128 Q140 128 158 98 Q175 128 210 128 L260 128 L282 145 L303 42 L326 166 L346 128 L520 128 Q575 128 625 84 Q675 118 750 128 L960 128"
        fill="none" stroke="#e5f2ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1={x} y1="10" x2={x} y2="210" stroke={phase.accent} strokeWidth="5"/>
      <circle cx={x} cy="30" r={6+burst*20} fill={phase.accent} opacity={.75}/>
    </svg>
    <div style={{position:'absolute',top:18,left:22,fontSize:24,fontWeight:950}}>ECG</div>
    <div style={{position:'absolute',top:18,right:22,fontSize:22,fontWeight:850,color:'#9ad8ff'}}>{phase.sound}</div>
  </div>;
};

const Status:React.FC<{label:string;open:boolean}> = ({label,open}) =>
  <div style={{padding:'16px 18px',borderRadius:18,background:'rgba(7,17,31,.8)',border:'1px solid rgba(255,255,255,.12)',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:21,fontWeight:900}}>
    <span>{label}</span><span style={{padding:'7px 12px',borderRadius:10,background:open?'#16b875':'#ef334e'}}>{open?'OPEN':'CLOSED'}</span>
  </div>;

const PhaseScene:React.FC<{phase:Phase}> = ({phase}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:16,stiffness:120}});
  const progress=clamp(frame/209);
  const zoom=1.02+progress*.035;
  return <AbsoluteFill style={{background:'radial-gradient(circle at 50% 28%,#17304f 0%,#07111f 58%,#02050b 100%)',color:'#fff',fontFamily:'Inter,Arial,sans-serif',padding:'70px 54px 50px'}}>
    <div style={{opacity:s,transform:'translateY('+((1-s)*45)+'px)'}}>
      <div style={{display:'flex',gap:20,alignItems:'center'}}>
        <div style={{width:84,height:84,borderRadius:44,background:phase.accent,color:'#06111e',display:'grid',placeItems:'center',fontSize:43,fontWeight:1000,boxShadow:'0 0 44px '+phase.accent+'66'}}>{phase.n}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:50,fontWeight:1000,letterSpacing:-1.7,lineHeight:1}}>{phase.title}</div>
          <div style={{fontSize:25,color:'#a8c3d8',fontWeight:750,marginTop:10}}>{phase.subtitle} • {phase.duration}</div>
        </div>
      </div>
      <div style={{height:9,marginTop:28,borderRadius:9,background:'#18304a',overflow:'hidden'}}>
        <div style={{height:'100%',width:(progress*100)+'%',background:phase.accent,boxShadow:'0 0 18px '+phase.accent}}/>
      </div>
    </div>

    <div style={{position:'relative',height:840,marginTop:34,borderRadius:40,overflow:'hidden',border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 28px 90px rgba(0,0,0,.38)'}}>
      <GeneratedTile tile={phase.tile} zoom={zoom} style={{position:'absolute',inset:0,filter:'saturate(1.12) contrast(1.04) brightness(.86)'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(2,8,16,.03),rgba(2,8,16,.1) 55%,rgba(2,8,16,.58))'}}/>
      <HeartOverlay phase={phase} frame={frame}/>
      <div style={{position:'absolute',left:24,right:24,bottom:22,display:'flex',gap:12,background:'rgba(3,9,17,.72)',backdropFilter:'blur(10px)',padding:16,borderRadius:18}}>
        <div style={{flex:1,fontSize:20,color:'#9ab7cd',fontWeight:900}}>ATRIA<br/><span style={{color:'#fff',fontSize:25}}>{phase.atria}</span></div>
        <div style={{flex:1,fontSize:20,color:'#9ab7cd',fontWeight:900}}>VENTRICLES<br/><span style={{color:'#fff',fontSize:25}}>{phase.ventricles}</span></div>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:26}}>
      <Status label="Mitral + Tricuspid" open={phase.avOpen}/>
      <Status label="Aortic + Pulmonary" open={phase.slOpen}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
      <div style={{padding:'18px 20px',borderRadius:20,background:'rgba(7,17,31,.8)',border:'1px solid rgba(255,255,255,.12)'}}>
        <div style={{fontSize:18,color:'#8faabd',fontWeight:900}}>VENTRICULAR PRESSURE</div>
        <div style={{fontSize:32,fontWeight:1000,color:phase.accent,marginTop:5}}>{phase.pressure}</div>
      </div>
      <div style={{padding:'18px 20px',borderRadius:20,background:'rgba(7,17,31,.8)',border:'1px solid rgba(255,255,255,.12)'}}>
        <div style={{fontSize:18,color:'#8faabd',fontWeight:900}}>VENTRICULAR VOLUME</div>
        <div style={{fontSize:32,fontWeight:1000,color:phase.accent,marginTop:5}}>{phase.volume}</div>
      </div>
    </div>

    <div style={{marginTop:18}}><ECG frame={frame} phase={phase}/></div>
    <div style={{marginTop:16,display:'flex',justifyContent:'space-between',fontSize:22,fontWeight:850}}>
      <span style={{color:'#89a7be'}}>Electrical event</span><span>{phase.ecg}</span>
    </div>
  </AbsoluteFill>;
};

const Intro:React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:14,stiffness:95}});
  const rot=interpolate(frame,[0,120],[0,22],{easing:Easing.inOut(Easing.cubic)});
  return <AbsoluteFill style={{background:'radial-gradient(circle at 50% 32%,#163c63 0%,#07111f 58%,#02050b 100%)',color:'#fff',fontFamily:'Inter,Arial,sans-serif',padding:'80px 54px'}}>
    <div style={{fontSize:26,fontWeight:950,letterSpacing:4,color:'#55c8ff'}}>ORBIT MBBS • PHYSIOLOGY</div>
    <div style={{marginTop:22,fontSize:88,fontWeight:1000,lineHeight:.93,letterSpacing:-4,opacity:s,transform:'translateY('+((1-s)*40)+'px)'}}>THE<br/><span style={{color:'#ff5367'}}>CARDIAC</span><br/>CYCLE</div>
    <div style={{marginTop:24,fontSize:30,lineHeight:1.35,color:'#b7d2e5'}}>One heartbeat. Seven mechanical phases. Follow chambers, valves, blood flow, ECG, pressure and volume together.</div>
    <div style={{position:'relative',height:930,marginTop:42,borderRadius:42,overflow:'hidden',border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 35px 100px rgba(0,0,0,.45)'}}>
      <GeneratedTile tile={0} zoom={1.05+s*.05} style={{position:'absolute',inset:0,filter:'saturate(1.12) contrast(1.05) brightness(.82)'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 25%,rgba(2,7,14,.68))'}}/>
      <div style={{position:'absolute',left:184,top:248,width:455,height:455,borderRadius:240,border:'28px solid #32c8ff',borderTopColor:'#ff4fb8',borderRightColor:'#ff556b',transform:'rotate('+rot+'deg)',boxShadow:'0 0 60px rgba(50,200,255,.35)'}}/>
      <div style={{position:'absolute',left:250,top:390,width:320,textAlign:'center',fontSize:74,fontWeight:1000,textShadow:'0 8px 30px #000'}}>0.8<span style={{fontSize:31,display:'block',marginTop:-5}}>seconds</span></div>
    </div>
    <div style={{display:'flex',gap:10,marginTop:34}}>{phases.map((p,i)=><div key={p.n} style={{height:16,flex:1,borderRadius:10,background:p.accent,opacity:.58+.42*Math.sin((frame+i*4)/13)**2}}/>)}</div>
  </AbsoluteFill>;
};

const Recap:React.FC = () => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:'linear-gradient(180deg,#07111f,#02050b)',color:'#fff',fontFamily:'Inter,Arial,sans-serif',padding:'68px 48px'}}>
    <div style={{fontSize:62,fontWeight:1000,letterSpacing:-2}}>ONE CYCLE • <span style={{color:'#55c8ff'}}>0.8 s</span></div>
    <div style={{fontSize:27,color:'#a5c1d7',marginTop:8}}>At about 75 beats/min</div>
    <div style={{display:'grid',gap:13,marginTop:36}}>
      {phases.map((p,i)=>{
        const a=clamp((frame-i*11)/30);
        const x=interpolate(a,[0,1],[80,0]);
        return <div key={p.n} style={{height:158,borderRadius:28,overflow:'hidden',display:'flex',background:'rgba(10,22,38,.88)',border:'1px solid rgba(255,255,255,.1)',opacity:a,transform:'translateX('+x+'px)'}}>
          <div style={{width:170,position:'relative',overflow:'hidden'}}><GeneratedTile tile={p.tile} zoom={1.15} style={{position:'absolute',inset:0,filter:'brightness(.8) saturate(1.1)'}}/></div>
          <div style={{width:80,display:'grid',placeItems:'center',fontSize:38,fontWeight:1000,color:'#06111e',background:p.accent}}>{p.n}</div>
          <div style={{flex:1,padding:'20px 24px'}}><div style={{fontSize:29,fontWeight:950}}>{p.title}</div><div style={{fontSize:21,color:'#9ebbd1',marginTop:6}}>{p.subtitle}</div><div style={{fontSize:19,color:p.accent,fontWeight:900,marginTop:8}}>{p.duration}</div></div>
        </div>;
      })}
    </div>
    <div style={{marginTop:30,borderRadius:28,padding:'24px 28px',background:'rgba(17,43,68,.8)',border:'1px solid rgba(84,199,255,.25)',fontSize:27,fontWeight:900,lineHeight:1.5}}>
      S1 = AV valves close • S2 = semilunar valves close<br/>Systole ≈ 0.3 s • Diastole ≈ 0.5 s
    </div>
  </AbsoluteFill>;
};

export const CardiacCycleAI:React.FC = () => <AbsoluteFill>
  <Sequence from={0} durationInFrames={120}><Intro/></Sequence>
  {phases.map((p,i)=><Sequence key={p.n} from={120+i*210} durationInFrames={210}><PhaseScene phase={p}/></Sequence>)}
  <Sequence from={1590} durationInFrames={210}><Recap/></Sequence>
</AbsoluteFill>;
