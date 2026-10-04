import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter
sr=44100
import json
from pathlib import Path
for name,duration,bpm,cuts in [('fast',24,144,[x['at'] for x in json.loads(Path('storyboard-fast.json').read_text())][1:])]:
 n=int(sr*duration);y=np.zeros(n);rng=np.random.default_rng(87);beat=60/bpm
 def add(z,start,amp=1):
  i=int(start*sr);end=min(n,i+len(z))
  if i>=0 and end>i:y[i:end]+=z[:end-i]*amp
 chords=[[146.83,174.61,220],[130.81,164.81,196],[110,130.81,164.81],[116.54,146.83,174.61]]
 for bar in range(int(duration/(beat*4))+1):
  st=bar*beat*4;ch=chords[bar%4];t=np.arange(int(sr*beat*4.5))/sr;env=np.minimum(t/.2,1)*np.exp(-t/(beat*5))*np.clip((t[-1]-t)/.45,0,1)
  z=sum(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*1.003*t) for f in ch)/3
  add(z*env,st,.14)
  for b in range(4):
   t=np.arange(int(sr*.32))/sr;z=np.sin(2*np.pi*(46*t+7*(1-np.exp(-t*35))))*np.exp(-t*20);add(z,st+b*beat,.35)
   t=np.arange(int(sr*.32))/sr;z=np.sin(2*np.pi*ch[0]/2*t)*np.minimum(t/.01,1)*np.exp(-t*8);add(z,st+b*beat+.12,.13)
   if b%2:
    t=np.arange(int(sr*.15))/sr;z=lfilter([1,-.9],[1],rng.normal(0,1,len(t)))*np.exp(-t*35);add(z,st+b*beat,.042)
  for b in range(8):
   t=np.arange(int(sr*.055))/sr;z=lfilter([1,-1],[1],rng.normal(0,1,len(t)))*np.exp(-t*95);add(z,st+b*beat/2,.012)
   if bar>0:
    t=np.arange(int(sr*.8))/sr;f=ch[[0,1,2,1,0,2,1,2][b]]*2;z=(np.sin(2*np.pi*f*t)+.18*np.sin(2*np.pi*f*2*t))*np.minimum(t/.009,1)*np.exp(-t*6);add(z,st+b*beat/2,.072)
 # Original opening earcon: short, bright notes with an early downbeat.
 for j,f in enumerate([659.25,783.99,987.77]):
  t=np.arange(int(sr*.3))/sr;add(np.sin(2*np.pi*f*t)*np.exp(-t*15),.08+j*.085,.075)
 for st in cuts:
  t=np.arange(int(sr*.5))/sr;noise=rng.normal(0,1,len(t));z=lfilter([.08],[1,-.92],noise)*np.sin(np.pi*t/.5)**2;add(z,st-.06,.28)
  t=np.arange(int(sr*.32))/sr;z=np.sin(2*np.pi*(55*t+3*(1-np.exp(-t*20))))*np.exp(-t*16);add(z,st+.3,.2)
 fade=np.clip(np.arange(n)/sr/.6,0,1)*np.clip((n-1-np.arange(n))/sr/1.5,0,1);y=np.tanh(y*fade*1.3);y=y/(max(abs(y)))*.86
 stereo=np.column_stack([y,np.roll(y,int(.004*sr))*.98]);wavfile.write('public/audio/fast-bed.wav',sr,(stereo*32767).astype(np.int16))

import subprocess
subprocess.run(["ffmpeg","-v","error","-y","-i","public/audio/fast-bed.wav","-af","loudnorm=I=-16:TP=-1.5:LRA=7","-ar","44100","-ac","2","public/audio/fast-music-only.wav"],check=True)
