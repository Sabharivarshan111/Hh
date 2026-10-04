import asyncio,json,edge_tts,ssl,sys,re
import edge_tts.communicate
edge_tts.communicate._SSL_CTX=ssl.create_default_context()
from pathlib import Path
async def main():
 shots=json.loads(Path('storyboard.json').read_text());chosen={int(x) for x in sys.argv[1:]} if len(sys.argv)>1 else set(range(len(shots)));sem=asyncio.Semaphore(3)
 async def one(i,s):
  async with sem:
   path=Path(f'public/audio/voice-{i:02}.mp3');temp=path.with_suffix('.tmp');words=[]
   try:
    with temp.open('wb') as f:
     async for chunk in edge_tts.Communicate(s['voice'],voice='en-US-JennyNeural',rate='-5%',pitch='+0Hz',boundary='WordBoundary').stream():
      if chunk['type']=='audio':f.write(chunk['data'])
      elif chunk['type']=='WordBoundary':words.append({k:chunk[k] for k in ['offset','duration','text']})
    norm=lambda x:re.sub('[^a-z0-9]','',x.lower())
    assert norm(''.join(x['text'] for x in words))==norm(s['voice']),f'Incomplete spoken text: {words}'
    temp.replace(path);Path(f'public/audio/voice-{i:02}-words.json').write_text(json.dumps(words,indent=2));print('verified voice',i,flush=True)
   except Exception as e:raise RuntimeError(f'Voice clip {i} failed') from e
 await asyncio.gather(*(one(i,s) for i,s in enumerate(shots) if i in chosen))
asyncio.run(main())
