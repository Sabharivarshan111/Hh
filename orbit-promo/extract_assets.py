from pathlib import Path
import io,zipfile
parts=sorted(Path('asset-parts').glob('assets.zip.*'))
assert parts, 'Missing asset archive parts'
with zipfile.ZipFile(io.BytesIO(b''.join(p.read_bytes() for p in parts))) as z:z.extractall('.')
print('Restored native captures, brand assets and Edge TTS recordings.')
