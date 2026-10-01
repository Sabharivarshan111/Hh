import React from 'react';
import {Composition} from 'remotion';
import {CardiacCycleMaster} from './CardiacCycleMaster';

export const RemotionRootMaster: React.FC = () => (
  <Composition
    id="CardiacCycleMaster"
    component={CardiacCycleMaster}
    durationInFrames={1800}
    fps={30}
    width={1080}
    height={1920}
  />
);
