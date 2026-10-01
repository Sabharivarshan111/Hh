import React from 'react';
import {Composition} from 'remotion';
import {CardiacCycleCrisp} from './CardiacCycleCrisp';

export const RemotionRootCrisp:React.FC = () => (
  <Composition
    id="CardiacCycleCrisp"
    component={CardiacCycleCrisp}
    durationInFrames={1800}
    fps={30}
    width={1080}
    height={1920}
  />
);
