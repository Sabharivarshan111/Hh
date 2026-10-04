# ORBIT MBBS · TNMGR + KUHS promo

Two separate edits: 48s narrated presentation (Edge Jenny, no background music); 36s music-only reel at 120 BPM, plus a silent derivative for adding an Instagram song.

## Run

```bash
cd orbit-promo
npm ci --legacy-peer-deps
python3 extract_assets.py
python3 -m pip install edge-tts numpy scipy
python3 prepare_voice.py
python3 mix_audio.py
python3 create_beat_music.py
npx remotion browser ensure
mkdir -p ../../output
NODE_OPTIONS=--require=./network-shim.cjs node render-final.mjs
NODE_OPTIONS=--require=./network-shim.cjs node render-final.mjs --voice
```

The asset archive is split into ordered parts in `asset-parts/`; the extraction script restores 41 app captures, brand assets, voice recordings and word boundaries. Source assets are captured from the app's native React Native components rendered through a web preview (390×844 at 3×), not an emulator recording. Some feature screens use illustrative fixtures. No app UI was recreated for the promo. The original app repository is not included here.

To regenerate the speech, run `python3 voice.py` before preparing it. The chosen voice is `en-US-JennyNeural`, -5% rate, native pitch. Speech is never sped up in post-processing. Spoken acronyms are replaced by ordinary phrases; ACEV and university names remain visible. Three audition clips are included in the assets. Voice preference and pronunciation should be judged by listening; word boundaries only verify that the requested text was returned.

All animation uses Remotion frame values. Reading phone scale stays below 1, screenshots use contain, and captions are below the phone stage. Opaque 0.25s wipes prevent old text and phones ghosting through incoming scenes. Flashcards use a short perspective close/reveal at mid-shot. The 36s cut is substantially slower than the rejected 24s version. See `BEAT_MAP.md` for Instagram music placement. Different song tempos need retiming.

College figures are 60 TNMGR list entries and 35 KUHS entries in the referenced 2026 documents, not product users or endorsements. See `research/COLLEGE_COUNTS.md`. Old references and frame evidence are retained for provenance; the active compositions are ORBIT-Voice-Only and ORBIT-Beat-NoVoice.

## Verification

See `FINAL_AUDIT.md` and `final-verification.json` for current export checks. Existing `verification.json` and `COMPETITOR_AUDIT.md` document earlier revisions, not the current export. No claim of guaranteed virality, legal clearance, or objective superiority is made.
