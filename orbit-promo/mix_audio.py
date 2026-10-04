import json,subprocess
from pathlib import Path
shots=json.loads(Path('storyboard.json').read_text());cmd=['ffmpeg','-v','error','-y']
for i in range(len(shots)):cmd+=['-i',f'public/audio/narration-{i:02}.wav']
filters=[];names=[]
for i,s in enumerate(shots):
 filters.append(f'[{i}:a]adelay={round((s["at"]+.10)*1000)}:all=1[v{i}]');names.append(f'[v{i}]')
filters.append(''.join(names)+f'amix=inputs={len(names)}:duration=longest:dropout_transition=0:normalize=0,apad=whole_dur=48,atrim=duration=48,loudnorm=I=-16:TP=-1.5:LRA=8[voice]')
subprocess.run(cmd+['-filter_complex',';'.join(filters),'-map','[voice]','-ar','44100','-ac','2','public/audio/voice-only.wav'],check=True)
