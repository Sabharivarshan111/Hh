import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Phase = {
  n: number;
  title: string;
  short: string;
  duration: string;
  accent: string;
  asset: string;
  atria: string;
  ventricles: string;
  pressure: string;
  volume: string;
  avOpen: boolean;
  slOpen: boolean;
  flow: 'fill' | 'eject' | 'none';
  speed: number;
  sound: string;
  ecg: string;
};

const phases: Phase[] = [
  {
    n: 1, title: 'ATRIAL SYSTOLE', short: 'Final ventricular filling', duration: '0.1 s',
    accent: '#ff4fb8', asset: 'phase1.jpg', atria: 'CONTRACTING', ventricles: 'RELAXED',
    pressure: 'Slight ↑', volume: 'Final 20–30% ↑', avOpen: true, slOpen: false,
    flow: 'fill', speed: 1.25, sound: 'S4 (may occur)', ecg: 'P wave / PR segment'
  },
  {
    n: 2, title: 'ISOVOLUMETRIC CONTRACTION', short: 'Pressure rises • volume unchanged', duration: '0.05–0.1 s',
    accent: '#ffb020', asset: 'phase2.jpg', atria: 'RELAXED', ventricles: 'CONTRACTING',
    pressure: 'Rapid ↑↑', volume: 'UNCHANGED', avOpen: false, slOpen: false,
    flow: 'none', speed: 0, sound: 'S1 — AV valves close', ecg: 'Just after QRS'
  },
  {
    n: 3, title: 'RAPID EJECTION', short: 'Blood leaves both ventricles quickly', duration: '0.1 s',
    accent: '#27e68f', asset: 'phase3.jpg', atria: 'RELAXED', ventricles: 'STRONG CONTRACTION',
    pressure: 'HIGH', volume: 'Rapid ↓', avOpen: false, slOpen: true,
    flow: 'eject', speed: 1.8, sound: '—', ecg: 'ST segment'
  },
  {
    n: 4, title: 'REDUCED EJECTION', short: 'Ejection continues at a lower rate', duration: '0.1 s',
    accent: '#7ee46a', asset: 'phase4.jpg', atria: 'RELAXED', ventricles: 'WEAKER CONTRACTION',
    pressure: 'Starts ↓', volume: 'Slow ↓', avOpen: false, slOpen: true,
    flow: 'eject', speed: 0.8, sound: '—', ecg: 'T wave begins'
  },
  {
    n: 5, title: 'ISOVOLUMETRIC RELAXATION', short: 'All valves closed • pressure falls', duration: '0.1 s',
    accent: '#55a7ff', asset: 'phase5.jpg', atria: 'RELAXED', ventricles: 'RELAXING',
    pressure: 'Rapid ↓↓', volume: 'UNCHANGED', avOpen: false, slOpen: false,
    flow: 'none', speed: 0, sound: 'S2 — semilunar valves close', ecg: 'End of T wave'
  },
  {
    n: 6, title: 'RAPID FILLING', short: 'Blood rushes into the ventricles', duration: '0.1 s',
    accent: '#44c8ff', asset: 'phase6.jpg', atria: 'RELAXED', ventricles: 'RELAXED',
    pressure: 'LOW', volume: 'Rapid ↑', avOpen: true, slOpen: false,
    flow: 'fill', speed: 1.7, sound: 'S3 may occur', ecg: 'TP segment'
  },
  {
    n: 7, title: 'REDUCED FILLING / DIASTASIS', short: 'Slow passive filling', duration: '0.2–0.3 s',
    accent: '#3fa6ff', asset: 'phase7.jpg', atria: 'RELAXED', ventricles: 'RELAXED',
    pressure: 'Minimal change', volume: 'Slow ↑', avOpen: true, slOpen: false,
    flow: 'fill', speed: 0.45, sound: '—', ecg: 'TP segment'
  },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const Valve: React.FC<{x:number;y:number;open:boolean;label:string;accent:string;beat:number}> = ({x,y,open,label,accent,beat}) => {
  const glow = open ? accent : '#ff445b';
  const r = 17 + beat * 5;
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill={glow} opacity={0.12 + beat * 0.16}/>
      <circle cx={x} cy={y} r={r} fill="#07111f" stroke={glow} strokeWidth={5}/>
      {open ? (
        <>
          <path d={`M ${x-10} ${y} L ${x} ${y-10} L ${x+10} ${y}`} fill="none" stroke={glow} strokeWidth={5} strokeLinecap="round"/>
          <path d={`M ${x-10} ${y+8} L ${x} ${y-2} L ${x+10} ${y+8}`} fill="none" stroke={glow} strokeWidth={5} strokeLinecap="round" opacity={0.7}/>
        </>
      ) : (
        <>
          <path d={`M ${x-10} ${y-10} L ${x+10} ${y+10}`} stroke={glow} strokeWidth={5} strokeLinecap="round"/>
          <path d={`M ${x+10} ${y-10} L ${x-10} ${y+10}`} stroke={glow} strokeWidth={5} strokeLinecap="round"/>
        </>
      )}
      <text x={x} y={y+39} textAnchor="middle" fontSize={15} fontWeight={800} fill="#dce9ff">{label}</text>
    </g>
  );
};

const FlowParticles: React.FC<{frame:number; mode:Phase['flow']; speed:number; accent:string}> = ({frame, mode, speed, accent}) => {
  if (mode === 'none') return null;
  const fillPaths = [
    {x1:265,y1:160,x2:280,y2:420,c:'#38bdf8'},
    {x1:500,y1:160,x2:500,y2:420,c:'#ff586d'},
  ];
  const ejectPaths = [
    {x1:285,y1:430,x2:245,y2:95,c:'#38bdf8'},
    {x1:500,y1:430,x2:520,y2:80,c:'#ff586d'},
  ];
  const paths = mode === 'fill' ? fillPaths : ejectPaths;
  return (
    <>
      {paths.flatMap((p, pi) => Array.from({length: 11}).map((_, i) => {
        const t = ((frame * 0.018 * speed) + i / 11 + pi * 0.13) % 1;
        const eased = t * t * (3 - 2 * t);
        const x = p.x1 + (p.x2 - p.x1) * eased + Math.sin((t+i)*9) * 8;
        const y = p.y1 + (p.y2 - p.y1) * eased;
        const scale = 0.65 + 0.45 * Math.sin(Math.PI * t);
        return (
          <g key={`${pi}-${i}`} opacity={0.35 + 0.65 * Math.sin(Math.PI*t)}>
            <circle cx={x} cy={y} r={9*scale} fill={p.c}/>
            <circle cx={x-3} cy={y-3} r={3*scale} fill="#ffffff" opacity={0.75}/>
          </g>
        );
      }))}
      <path d={mode === 'fill' ? 'M265 165 Q270 260 280 425' : 'M285 430 Q260 250 245 90'} stroke={accent} strokeWidth={5} opacity={0.22} fill="none"/>
      <path d={mode === 'fill' ? 'M500 165 Q500 260 500 425' : 'M500 430 Q510 240 520 78'} stroke={accent} strokeWidth={5} opacity={0.22} fill="none"/>
    </>
  );
};

const HeartOverlay: React.FC<{phase:Phase; localFrame:number}> = ({phase, localFrame}) => {
  const pulse = (Math.sin(localFrame / 30 * Math.PI * 2 * 1.25) + 1) / 2;
  const squeeze = phase.ventricles.includes('CONTRACT') ? 0.92 + pulse*0.06 : 0.98 + pulse*0.02;
  const valveBeat = Math.pow(Math.max(0, Math.sin(localFrame/30*Math.PI*2*1.2)), 8);
  return (
    <div style={{
      position:'absolute', inset:0, transform:`scale(${squeeze})`,
      transformOrigin:'50% 54%', transition:'none'
    }}>
      <svg viewBox="0 0 768 600" style={{width:'100%',height:'100%',filter:'drop-shadow(0 0 18px rgba(0,0,0,.45))'}}>
        <defs>
          <radialGradient id="ventGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={phase.accent} stopOpacity={phase.ventricles.includes('CONTRACT') ? 0.22 + pulse*0.18 : 0.08}/>
            <stop offset="100%" stopColor={phase.accent} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="388" cy="365" rx="230" ry="190" fill="url(#ventGlow)"/>
        <FlowParticles frame={localFrame} mode={phase.flow} speed={phase.speed} accent={phase.accent}/>
        <Valve x={350} y={270} open={phase.avOpen} label="TRICUSPID" accent="#33d89c" beat={valveBeat}/>
        <Valve x={455} y={270} open={phase.avOpen} label="MITRAL" accent="#33d89c" beat={valveBeat}/>
        <Valve x={335} y={155} open={phase.slOpen} label="PULMONARY" accent="#33d89c" beat={valveBeat}/>
        <Valve x={475} y={145} open={phase.slOpen} label="AORTIC" accent="#33d89c" beat={valveBeat}/>
      </svg>
    </div>
  );
};

const StatusPill: React.FC<{label:string; open:boolean}> = ({label,open}) => (
  <div style={{
    display:'flex', alignItems:'center', justifyContent:'space-between',
    background:'rgba(8,16,32,.76)', border:'1px solid rgba(255,255,255,.12)',
    borderRadius:18, padding:'14px 16px', fontSize:22, fontWeight:800
  }}>
    <span>{label}</span>
    <span style={{
      color:'#fff', padding:'7px 12px', borderRadius:12,
      background:open ? '#16b875' : '#ef334e',
      boxShadow:`0 0 18px ${open ? 'rgba(22,184,117,.35)' : 'rgba(239,51,78,.35)'}`
    }}>{open ? 'OPEN' : 'CLOSED'}</span>
  </div>
);

const ECG: React.FC<{localFrame:number; accent:string; phaseIndex:number; sound:string}> = ({localFrame,accent,phaseIndex,sound}) => {
  const x = 38 + ((localFrame % 210) / 209) * 904;
  const marker = phaseIndex === 1 || phaseIndex === 4 || phaseIndex === 5;
  const boom = marker ? Math.pow(Math.max(0, Math.sin(localFrame/30*Math.PI*2*1.4)), 14) : 0;
  return (
    <div style={{
      position:'relative', height:210, borderRadius:26, overflow:'hidden',
      background:'linear-gradient(180deg,rgba(7,15,30,.96),rgba(13,28,48,.96))',
      border:'1px solid rgba(255,255,255,.12)', boxShadow:'0 18px 60px rgba(0,0,0,.26)'
    }}>
      <svg viewBox="0 0 980 210" style={{width:'100%',height:'100%'}}>
        {Array.from({length:14}).map((_,i)=><line key={'v'+i} x1={i*75} y1="0" x2={i*75} y2="210" stroke="#21415d" strokeWidth="1" opacity=".32"/>)}
        {Array.from({length:6}).map((_,i)=><line key={'h'+i} x1="0" y1={i*42} x2="980" y2={i*42} stroke="#21415d" strokeWidth="1" opacity=".32"/>)}
        <path
          d="M20 120 L110 120 Q140 120 155 92 Q170 120 205 120 L260 120 L282 138 L302 38 L325 158 L345 120 L520 120 Q575 120 625 78 Q675 112 750 120 L960 120"
          fill="none" stroke="#d9ecff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
        />
        <line x1={x} y1="12" x2={x} y2="198" stroke={accent} strokeWidth="5"/>
        <circle cx={x} cy="32" r={10+boom*18} fill={accent} opacity={0.65}/>
        <circle cx={x} cy="32" r={5} fill="#fff"/>
      </svg>
      <div style={{position:'absolute',left:24,top:20,fontSize:24,fontWeight:900,letterSpacing:1}}>ECG</div>
      <div style={{position:'absolute',right:24,top:20,fontSize:22,color:'#9dd7ff',fontWeight:800}}>{sound}</div>
    </div>
  );
};

const PhaseScene: React.FC<{phase:Phase; phaseIndex:number}> = ({phase,phaseIndex}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({fps, frame, config:{damping:16, stiffness:120}});
  const y = interpolate(intro,[0,1],[65,0]);
  const opacity = interpolate(intro,[0,1],[0,1]);
  const progress = clamp(frame / 209);
  const breathe = 1 + Math.sin(frame/30*Math.PI*2*0.18)*0.012;
  const openPulse = 0.55 + 0.45*Math.sin(frame/30*Math.PI*2*1.2);
  return (
    <AbsoluteFill style={{
      color:'#f4f9ff', background:'radial-gradient(circle at 50% 28%,#17304f 0%,#07111f 58%,#030710 100%)',
      fontFamily:'Inter, Arial, sans-serif', padding:'70px 54px 54px'
    }}>
      <div style={{opacity, transform:`translateY(${y}px)`}}>
        <div style={{display:'flex',alignItems:'center',gap:22}}>
          <div style={{
            width:86,height:86,borderRadius:43,display:'grid',placeItems:'center',
            fontSize:44,fontWeight:950,background:phase.accent,color:'#04111e',
            boxShadow:`0 0 42px ${phase.accent}66`
          }}>{phase.n}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:51,fontWeight:950,letterSpacing:-1.5,lineHeight:1.02}}>{phase.title}</div>
            <div style={{fontSize:25,color:'#a9c6dd',fontWeight:700,marginTop:9}}>{phase.short} • {phase.duration}</div>
          </div>
        </div>
        <div style={{height:9,borderRadius:8,background:'#172c43',marginTop:28,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress*100}%`,background:phase.accent,boxShadow:`0 0 22px ${phase.accent}`}}/>
        </div>
      </div>

      <div style={{
        position:'relative', marginTop:34, height:840, borderRadius:38, overflow:'hidden',
        border:'1px solid rgba(255,255,255,.13)', background:'#06101d',
        boxShadow:'0 28px 90px rgba(0,0,0,.38)',
        transform:`scale(${breathe})`
      }}>
        <Img
          src={staticFile(phase.asset)}
          style={{
            width:'100%',height:'100%',objectFit:'cover',
            filter:'saturate(1.08) contrast(1.05) brightness(.9)',
            transform:`scale(${1.03 + progress*0.035}) translateY(${-progress*6}px)`
          }}
        />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(2,8,16,.06),rgba(2,8,16,.08) 52%,rgba(2,8,16,.55))'}}/>
        <HeartOverlay phase={phase} localFrame={frame}/>
        <div style={{
          position:'absolute',left:26,bottom:24,right:26,display:'flex',gap:14,
          background:'rgba(4,10,19,.72)',backdropFilter:'blur(12px)',padding:16,borderRadius:20
        }}>
          <div style={{flex:1,fontWeight:900,fontSize:22,color:'#a9c6dd'}}>Atria<br/><span style={{color:'#fff',fontSize:25}}>{phase.atria}</span></div>
          <div style={{flex:1,fontWeight:900,fontSize:22,color:'#a9c6dd'}}>Ventricles<br/><span style={{color:'#fff',fontSize:25}}>{phase.ventricles}</span></div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:28}}>
        <StatusPill label="Mitral + Tricuspid" open={phase.avOpen}/>
        <StatusPill label="Aortic + Pulmonary" open={phase.slOpen}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
        <div style={{background:'rgba(8,16,32,.76)',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,padding:'18px 20px'}}>
          <div style={{fontSize:19,color:'#8da9c0',fontWeight:800}}>VENTRICULAR PRESSURE</div>
          <div style={{fontSize:31,fontWeight:950,color:phase.accent,marginTop:4}}>{phase.pressure}</div>
        </div>
        <div style={{background:'rgba(8,16,32,.76)',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,padding:'18px 20px'}}>
          <div style={{fontSize:19,color:'#8da9c0',fontWeight:800}}>VENTRICULAR VOLUME</div>
          <div style={{fontSize:31,fontWeight:950,color:phase.accent,marginTop:4}}>{phase.volume}</div>
        </div>
      </div>

      <div style={{marginTop:18}}>
        <ECG localFrame={frame} accent={phase.accent} phaseIndex={phaseIndex} sound={phase.sound}/>
      </div>

      <div style={{marginTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:22,fontWeight:800}}>
        <span style={{color:'#91acc3'}}>Electrical event</span>
        <span style={{color:'#fff'}}>{phase.ecg}</span>
      </div>

      <div style={{
        position:'absolute',left:0,right:0,bottom:0,height:8,
        background:`linear-gradient(90deg,${phase.accent},transparent)`,
        opacity:0.55 + openPulse*0.2
      }}/>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame,fps,config:{damping:14,stiffness:95}});
  const rot = interpolate(frame,[0,120],[0,18],{easing:Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{
      background:'radial-gradient(circle at 50% 35%,#163c63 0%,#07111f 58%,#02050b 100%)',
      color:'#fff',fontFamily:'Inter,Arial,sans-serif',padding:'80px 54px'
    }}>
      <div style={{fontSize:26,fontWeight:900,letterSpacing:4,color:'#59c9ff'}}>ORBIT MBBS • PHYSIOLOGY</div>
      <div style={{
        marginTop:22,fontSize:88,fontWeight:1000,lineHeight:.93,letterSpacing:-4,
        transform:`translateY(${(1-s)*35}px)`,opacity:s
      }}>THE<br/><span style={{color:'#ff4f60'}}>CARDIAC</span><br/>CYCLE</div>
      <div style={{marginTop:24,fontSize:30,lineHeight:1.35,color:'#b8d4e8',maxWidth:880}}>
        One heartbeat. Seven mechanical phases. Watch the valves, blood flow, ECG, pressure and volume move together.
      </div>
      <div style={{
        position:'relative',height:930,marginTop:42,borderRadius:42,overflow:'hidden',
        border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 35px 100px rgba(0,0,0,.45)'
      }}>
        <Img src={staticFile('phase0.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'saturate(1.12) contrast(1.05) brightness(.82)',transform:`scale(${1.05+s*.05})`}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 30%,rgba(2,7,14,.64))'}}/>
        <div style={{
          position:'absolute',left:185,top:255,width:450,height:450,borderRadius:250,
          border:'28px solid #2fc3ff',borderTopColor:'#ff4fb8',borderRightColor:'#ff5268',
          transform:`rotate(${rot}deg)`,boxShadow:'0 0 60px rgba(47,195,255,.35)'
        }}/>
        <div style={{
          position:'absolute',left:255,top:385,width:310,textAlign:'center',
          fontSize:72,fontWeight:1000,textShadow:'0 6px 35px #000'
        }}>0.8<span style={{fontSize:31,display:'block',marginTop:-4}}>seconds</span></div>
      </div>
      <div style={{display:'flex',gap:12,marginTop:34}}>
        {phases.map((p,i)=><div key={p.n} style={{height:16,flex:1,borderRadius:10,background:p.accent,opacity:0.55+0.45*Math.sin((frame+i*3)/13)**2}}/>)}
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background:'linear-gradient(180deg,#07111f,#02050b)',color:'#fff',
      fontFamily:'Inter,Arial,sans-serif',padding:'68px 48px'
    }}>
      <div style={{fontSize:62,fontWeight:1000,letterSpacing:-2}}>ONE CYCLE • <span style={{color:'#54c7ff'}}>0.8 s</span></div>
      <div style={{fontSize:27,color:'#a5c1d7',marginTop:8}}>At about 75 beats/min</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:13,marginTop:36}}>
        {phases.map((p,i)=>{
          const appear = clamp((frame-i*11)/30);
          const x = interpolate(appear,[0,1],[80,0]);
          return (
            <div key={p.n} style={{
              height:158,borderRadius:28,overflow:'hidden',display:'flex',alignItems:'stretch',
              border:'1px solid rgba(255,255,255,.1)',background:'rgba(10,22,38,.88)',
              transform:`translateX(${x}px)`,opacity:appear
            }}>
              <div style={{width:172,position:'relative',overflow:'hidden'}}>
                <Img src={staticFile(p.asset)} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(.8) saturate(1.1)',transform:'scale(1.08)'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(10,22,38,.65))'}}/>
              </div>
              <div style={{width:80,display:'grid',placeItems:'center',fontSize:38,fontWeight:1000,color:'#06111e',background:p.accent}}>{p.n}</div>
              <div style={{flex:1,padding:'20px 24px'}}>
                <div style={{fontSize:29,fontWeight:950}}>{p.title}</div>
                <div style={{fontSize:21,color:'#9ebbd1',marginTop:6}}>{p.short}</div>
                <div style={{fontSize:19,color:p.accent,fontWeight:900,marginTop:8}}>{p.duration}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop:30,borderRadius:28,padding:'24px 28px',
        background:'rgba(17,43,68,.8)',border:'1px solid rgba(84,199,255,.25)',
        fontSize:27,fontWeight:900,lineHeight:1.5
      }}>
        S1 = AV valves close • S2 = semilunar valves close<br/>
        Systole ≈ 0.3 s • Diastole ≈ 0.5 s
      </div>
    </AbsoluteFill>
  );
};

export const CardiacCycle: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}><Intro/></Sequence>
      {phases.map((phase,i)=>(
        <Sequence key={phase.n} from={120+i*210} durationInFrames={210}>
          <PhaseScene phase={phase} phaseIndex={i}/>
        </Sequence>
      ))}
      <Sequence from={1590} durationInFrames={210}><Recap/></Sequence>
    </AbsoluteFill>
  );
};
