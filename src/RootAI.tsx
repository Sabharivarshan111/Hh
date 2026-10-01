import React from 'react';
import {Composition} from 'remotion';
import {CardiacCycleAI} from './CardiacCycleAI';

export const RemotionRootAI: React.FC = () => (
  <Composition
    id="CardiacCycle"
    component={CardiacCycleAI}
    durationInFrames={1800}
    fps={30}
    width={1080}
    height={1920}
  />
);
