import React from 'react';
import {Composition} from 'remotion';
import {CardiacCycle} from './CardiacCycle';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CardiacCycle"
      component={CardiacCycle}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
