import subprocess,sys
# Regenerate the AI scene with the same current voice and script.
subprocess.run([sys.executable,'voice.py','7'],check=True)
