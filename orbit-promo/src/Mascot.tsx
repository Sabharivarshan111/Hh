import React from 'react';
import {Img,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
/** New ORBIT book companion. Frame-driven motion; no inherited blob engine. */
export function Mascot({size=320,state='idle'}:{size?:number;color?:string;state?:string}) {
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const intensity=state==='thinking'?.65:1;
 const lift=Math.sin(t*2.8)*size*.018*intensity;
 const tilt=Math.sin(t*2.1)*2.4*intensity;
 return <div style={{width:size,height:size,transform:`translateY(${lift}px) rotate(${tilt}deg)`,transformOrigin:'50% 75%'}}><Img src={staticFile('orbit-study-mascot.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>;
}
