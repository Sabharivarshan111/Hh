import asyncio,ssl,edge_tts
import edge_tts.communicate
from pathlib import Path
edge_tts.communicate._SSL_CTX=ssl.create_default_context()
async def main():
 Path('public/audio/auditions').mkdir(exist_ok=True)
 for voice in ['en-US-JennyNeural','en-US-AriaNeural','en-US-GuyNeural']:
  await edge_tts.Communicate('Too many tabs? Meet Orbit. Now for Kerala, too. Practise multiple-choice questions. Meet your AI study companion.',voice=voice,rate='-5%').save(f'public/audio/auditions/{voice}.mp3')
  print(voice,flush=True)
asyncio.run(main())
