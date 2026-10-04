import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {CommonPromo,BeatPromo} from './Film';
import './style.css';
registerRoot(()=> <>
 <Composition id="ORBIT-Voice-Only" component={CommonPromo} defaultProps={{music:false}} width={1080} height={1920} fps={60} durationInFrames={2880}/>
 <Composition id="ORBIT-Beat-NoVoice" component={BeatPromo} width={1080} height={1920} fps={60} durationInFrames={2160}/>
 <Composition id="ORBIT-Beat-Silent" component={BeatPromo} defaultProps={{silent:true}} width={1080} height={1920} fps={60} durationInFrames={2160}/>
</>);
