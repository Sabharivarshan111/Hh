import json
from pathlib import Path
out=json.loads(Path("storyboard-music.json").read_text())
# Use the same natural-speed recorded clips at the second edit's own timings.
import subprocess
cmd=['ffmpeg','-v','error','-y'];fs=[];names=[]
for i,x in enumerate(out):
 cmd+=['-i',f'public/audio/narration-{x["sourceIndex"]:02}.wav'];fs.append(f'[{i}:a]adelay={round((x["at"]+.1)*1000)}:all=1[v{i}]');names.append(f'[v{i}]')
fs.append(''.join(names)+f'amix=inputs={len(out)}:normalize=0,apad=whole_dur=48,atrim=duration=48,loudnorm=I=-16:TP=-1.5:LRA=8[voice]')
subprocess.run(cmd+['-filter_complex',';'.join(fs),'-map','[voice]','-ar','44100','-ac','2','public/audio/music-voice.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','public/audio/music-voice.wav','-i','public/audio/bed-new.wav','-filter_complex','[0:a]asplit=2[v][key];[1:a]volume=.25,afade=t=in:st=0:d=0.15,afade=t=out:st=46.4:d=1.6[bed];[bed][key]sidechaincompress=threshold=.025:ratio=6:attack=8:release=220[duck];[v][duck]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=8,atrim=duration=48[mix]','-map','[mix]','-ar','44100','-ac','2','public/audio/music-mix.wav'],check=True)
print('Distinct cut timeline:',[(x['at'],x['kind']) for x in out])
