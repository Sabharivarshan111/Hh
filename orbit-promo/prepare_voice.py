import json,subprocess
from pathlib import Path
shots=json.loads(Path('storyboard.json').read_text());result=[]
for i,s in enumerate(shots):
 src=f'public/audio/voice-{i:02}.mp3';tmp=f'public/audio/trim-{i:02}.wav';out=f'public/audio/narration-{i:02}.wav'
 words=json.loads(Path(f'public/audio/voice-{i:02}-words.json').read_text());lo=max(0,words[0]['offset']/1e7-.10);hi=(words[-1]['offset']+words[-1]['duration'])/1e7+.12
 trim=f'atrim=start={lo}:end={hi},asetpts=PTS-STARTPTS'
 subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',trim,'-ar','44100',tmp],check=True)
 dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',tmp]));target=s['d']-.25;tempo=1
 if dur>target: raise RuntimeError(f'Voice clip {i} too long: {dur:.2f}s > {target:.2f}s; shorten the script, do not speed speech')
 subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af',f'atempo={tempo:.6f},loudnorm=I=-18:TP=-2:LRA=7','-ar','44100','-ac','1',out],check=True)
 Path(tmp).unlink();result.append({'index':i,'original_trimmed_duration':dur,'tempo':tempo,'duration':min(dur,target),'file':out,'text':s['voice']});print(i,round(dur,2),'tempo',round(tempo,2))
Path('voice-manifest.json').write_text(json.dumps(result,indent=2))
