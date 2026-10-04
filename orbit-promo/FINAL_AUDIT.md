# ORBIT final video audit · 4 October 2026

Delivered edits: 48s voice-only presentation, 36s original-score reel with no narration, and a silent 36s derivative for Instagram music. All are 1080×1920, 60fps, H.264. The 24s cut is superseded.

## What changed

- Music shot durations now range from 2–4 seconds, usually 2.5–3; university banks get a 4-second shot with a swap at 4.5s. The CTA gets 3 seconds.
- Every primary beat lands on the 120 BPM grid. Motion settles before the reading hold; the soundtrack uses original synth percussion and restrained transition accents, with no commercial track embedded.
- Opaque 15-frame wipes replace crossfades that showed the previous headline behind the incoming phone. Full phones, contain-fit captures, limited scale and rotation, and captions below the phone stage preserve visibility. Partial clipping during a deliberate wipe/entrance is not a reading hold.
- Native flashcard captures close/reopen with a short perspective reveal. University screens have a controlled lateral swap. Mascot entrances use a damped spring; orbital highlights and short tracking sweeps support motion without replacing app UI.
- “Now for KUHS, too” and “Tailored to TNMGR + KUHS” replace generic university messaging.
- Edge Jenny replaces Andrew: American English, -5% generation rate, native pitch. “Multiple-choice questions” and “AI study companion” replace awkward spelled acronyms. Speech clips have padding ahead/after WordBoundary timings, with no post-processing speedup. No background music or sound effects are in the narrated edit.

## Checks and evidence

Every rendered frame was decoded and sampled for luminance: 2,160 music frames + 2,880 narrated frames; no decoding errors or near-black frames. Visual review covered 156 timestamp samples at entrances, holds, scene boundaries, university swaps and flashcard flips. This is visual sampling plus full-frame technical analysis, not a claim that every frame was individually watched by a human.

| Check | Voice-only | Music-only |
|---|---:|---:|
| Video length | 48.000s | 36.000s (container 36.011s) |
| Frames | 2,880 | 2,160 |
| Visual samples | 83 | 73 |
| Resolution / FPS | 1080×1920 / 60 | 1080×1920 / 60 |
| Decode errors / blank frames | 0 / 0 | 0 / 0 |
| Audio loudness | -16.29 LUFS | -16.01 LUFS |
| True peak | -4.48 dBTP | -1.89 dBTP |

All 15 speech clips returned the complete scripted text according to word-boundary metadata and fit their scene without speedup. That check confirms text completeness and timing; it does not prove perfect pronunciation or a human preference for this voice. Three Edge audition recordings are retained in the source for listening comparison.

## Reference analysis

The retained competitor evidence contains 886 frames at 30fps (29.53s), consecutive-frame strips, and frame-difference measurements. Its useful principles are short phrase builds, high contrast, directional changes, an evolving mascot, a proof beat, and a final availability card. It devotes substantially less time to detailed app screens than this edit. The new video applies those pacing principles to native captures without copying its text, mascot or brand styling. The source retains the earlier detailed comparison in COMPETITOR_AUDIT.md. There is no objective claim that this edit is better or will go viral.

## Accuracy and provenance

App screens come from the app's React Native components in a web preview (390×844, 3× capture), not an emulator. Some AI/attendance/notes/flashcard content is illustrative fixture data. Subject icons are present in the captures; the earlier icon audit verifies 14 subject glyphs and a fallback. The new mascot is the teal open book; no legal clearance is implied.

60 and 35 are dated college-list counts from the TNMGR 2026–27 list and the KEAM 2026 prospectus, respectively. On-screen labels explicitly say listed MBBS colleges and not ORBIT users. These are not endorsements, adoption totals, or proof every listed college currently has admission permission. See research/COLLEGE_COUNTS.md for source URLs and counting scope.

## Instagram song placement

Use the silent derivative to add a song. Align the song’s first downbeat to 00:00 for 120 BPM tracks; see the supplied BEAT_MAP.md. A different BPM or lyric placement requires retiming and previewing against the actual song. No arbitrary song can be guaranteed to match in advance.

## Remotion skill source

Official remotion-dev/skills, pinned commit 0b5db9daae40f42c73544d1cc0a8c733bd530eaa, included under skills/remotion-best-practices. The review used its guidance on frame-driven animation, easing, timelines, asset placement and transition overlap. The custom scene wipes retain explicit existing timestamps. No random plugins were needed for the final export.
