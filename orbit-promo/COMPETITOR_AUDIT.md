# ORBIT common promo — competitor review and final audit

The new promo provides stronger visible product demonstration than the supplied Cortex advertisement. It shows real ORBIT interfaces for both TNMGR and KUHS, rather than relying mainly on an illustrated story. That is an editorial assessment, not a measured conversion result or proof that ORBIT is the better medical app overall. Cortex's shorter illustrated advertisement retains advantages in simplicity and social-proof presentation.

## What was examined

- Uploaded reference: `1000506629.mp4`, 720 × 1280, 30 fps, approximately 29.7 seconds including audio. All 886 decoded video frames were processed for motion changes. Consecutive-frame sheets were visually inspected around six transition and count-up sequences.
- Public Cortex site and the supplied login/pricing URL. The landing page is client-rendered. Indexed public landing copy and the site's published JavaScript bundle were read. No Cortex account was created and no purchase was made. Authenticated learning tools and actual pricing checkout were not tested.
- Current ORBIT native app source: `Sabharivarshan111/gmck`, commit `e1ac95f5b1be66eaa782dd5ef59d9802483bab70`.
- Fresh screenshots of the real React Native components, rendered through the repository's react-native-web preview harness. These are source-rendered previews, not Android device or emulator captures. Device text metrics, gestures and shadows were not verified.

## Reference video, shot by shot

Times are approximate visual boundaries; frame deltas and source timing are included in the source package.

| Time | Reference content | Animation mechanism | ORBIT decision |
|---|---|---|---|
| 0–1.53 s | Student greeting | Small line-character motion, phrase reveal | Open with ORBIT's new animated open-book mascot and a concise study hook |
| 1.53–3.83 s | Future of medical education | Abrupt orange palette cut, sun drawing, accumulating caption | Introduce the universities early and demonstrate the product |
| 3.83–5.83 s | Cortex and Pulse introduction | Phone illustration and speech bubble | Name ACEV AI beside an actual Ask AI screen |
| 5.83–8.83 s | Made in India / built for students | India-map illustration, stamp and text additions | Use original “Made in India. Built by a medical student.” branding with ORBIT's own character |
| 8.83–12.87 s | Ask Pulse, verified, gold-medalist claim | Alternating dark/orange cuts, checkmark and medal | Demonstrate actual question search and worked-note interfaces; do not adopt their verification claim |
| 12.87–14.93 s | Master the Chapter / one question | Character pose change, segmented dots and caption | Show real chapter questions, MCQ cards and flashcard recall |
| 14.93–17.90 s | MBBS and future exams | Exam-name bubbles drawn around the student | Keep the message focused on the demonstrated TNMGR/KUHS university workflow |
| 17.90–20.70 s | Students and colleges | Large count-up, repeated doodle figures and college symbols | Use dated university MBBS college-list counts, clearly separated from ORBIT adoption |
| 20.70–23.97 s | Fast-growing-company claim | Rising bar chart and dark shape wipe | Show attendance, progress and focus tools; avoid an unsupported growth claim |
| 23.97–29.53 s | Doctor transformation and URL close | Stethoscope/badge additions, caption close and fade | Close with the original ORBIT logo, open-book mascot and Google Play action |

The reference's dominant rhythm comes from hard palette cuts, progressive text and small illustrative movements. It is not primarily an app-screen zoom video. The new cut combines that concise storytelling idea with the app close-ups and camera movement requested earlier, without copying its student drawing, orange palette, wording or audio.

## Claims checked

| Claim | Evidence and treatment |
|---|---|
| Cortex: 3,700+ students and 600+ colleges | Stated on its public landing copy and shown in the uploaded ad. These are Cortex's self-reported claims; they were not independently verified. They are not used as ORBIT numbers. |
| Cortex: gold-medalist checks / fast-growing-company positioning | Presented by the competitor. No independent verification obtained; not used in the ORBIT film. |
| ORBIT: TNMGR and KUHS | Both banks exist in the checked source and were captured separately. This does not represent university endorsement. |
| ORBIT: first through final year | Both banks expose the four year choices. All four study years remain demonstrated in the gallery. The current number sequence instead describes listed university MBBS colleges. |
| ORBIT: ACEV AI | The current Ask AI screen calls the assistant ACEV. The revised film uses a new open-book mascot, including an isolated avatar substitution in the Ask AI source preview. Its name is spoken as separate letters to avoid ambiguous TTS pronunciation. |
| ORBIT: Made in India / built by a medical student | Owner context, in-app creator credit and the public Play listing identify the Indian developer and student-built product. |
| ORBIT: user/college totals | No current verified unique-user or college-adoption evidence was obtained. No invented social-proof total is shown. |
| ORBIT: no ads / free forever / guaranteed results | Not claimed. The checkout and live Play build were outside this video task's validation scope. |

## Creative comparison

| Criterion | Assessment |
|---|---|
| Real product demonstration | New ORBIT cut is stronger: 18 distinct app views/crops across the story, with both university banks visible. The competitor clip is mostly illustrations. |
| Mascot authenticity | The revised mascot is newly generated from an open-book brief. It replaces the earlier native circle in the film and Ask AI preview. This design revision is not shipped to the installed app and is not legal clearance. |
| Motion variety | ORBIT includes large push-ins, pullbacks, tilted devices, horizontal screen handoffs, paired screens, flashcard state changes and a four-year gallery. The competitor's concise palette cuts remain effective. |
| Readability | Main captions are one or two lines. The clipped phone stage and separate caption panel prevent promotional text from covering the phone display. Macro framing exposes the actual questions and choices. Small UI detail is not expected to be readable in every wide shot. |
| Pacing | Cortex is faster at roughly 30 seconds. ORBIT takes 48 seconds to give more screens readable time. The longer cut is a tradeoff, not a guaranteed improvement in retention. |
| Social proof | Cortex has stronger visible adoption claims. ORBIT uses coverage facts because a current adoption census was not available. |
| Product superiority | Not established. Both apps would need hands-on comparisons of answer accuracy, curriculum coverage, response reliability, device performance and user outcomes. Those cannot be inferred from advertisements. |

## Corrections made during the audit

- Replaced the circular character with a teal open-book companion, a coral bookmark, stethoscope and orbit ring. Removed the previous derivative animation engine.
- Captured TNMGR and KUHS separately rather than relabelling one screenshot.
- Captured flashcard front and revealed-answer states through the actual control.
- Rejected an unused KUHS topic-path capture that displayed “Topic not found.” It does not appear in the film or delivered screenshot set.
- Cropped the MCQ preview's developer-only reaction strip out of the video. Question text and choices remain the original screenshot pixels.
- Marked attendance values as illustrative data in the video. They use the existing repository preview fixture, not actual user statistics.
- Rerecorded shorter lines with the American English Andrew neural voice with a slightly slower generated pace. Every clip fits with post-processing tempo 1.0; no accelerated speech is used.
- Created a new 48-second music bed with transition sweeps at the new shot boundaries, instead of reusing a mismatched 45-second track.
- Balanced and normalized the finished narration/music mix; the final file has a complete soundtrack through the close.

## Verification and limits

The master is 1080 × 1920, 60 fps, 48 seconds, H.264 with AAC stereo audio. The full video was decoded successfully. Representative frames and dense transition sheets were inspected for the opening, university handoff, MCQ crop, coverage-number transition and closing action. All narration clips fit their scenes. The soundtrack was decoded and checked for clipping; exact measured levels are recorded in `verification.json` in the source package.

No AI-generated app interface is used. Existing app preview fixtures provide the worked-note, MCQ, flashcard and personal-note examples. These demonstrate the existing renderers and are not evidence of a fresh live AI response. The source checkout was inspected; the currently installed Google Play build and native device behaviour were not validated.

## Public sources

- Cortex landing page: https://cortexmbbs.com/
- Supplied login/pricing route: https://cortexmbbs.com/login?next=%2Fpricing
- Cortex published client bundle reviewed: https://cortexmbbs.com/assets/index-D_VcPGPK.js
- ORBIT Play listing: https://play.google.com/store/apps/details?id=com.aistudio.mbbsqbank.aycxvd
- ORBIT repository: https://github.com/Sabharivarshan111/gmck
- Remotion frame-driven animation guidance: https://github.com/remotion-dev/skills/tree/main/skills/remotion-markup

Research and creative review: 2 October 2026. Public competitor claims may change.

## Icon audit and visibility revision

A later audit found subject emoji rendered as missing-glyph boxes in the original screenshots. The screenshot host lacked an emoji fallback font; SVG outline controls were present. Noto Color Emoji v2.047 was installed, and the app views were recaptured at the same 1170 × 2532 resolution. All 14 defined subject emoji and the fallback book pass font glyph coverage checks.

The university shot now presents enlarged TNMGR and KUHS subject screens sequentially through a smooth slide and crossfade. The footage uses actual source-rendered app content; icons are not painted onto screenshots. See `research/icon-coverage.json` and the bundled font licence. This corrects the earlier missed screenshot defect.

## Final two-cut revision — 3 October 2026

- Voice-only: narration only, with no music or effects.
- Music Cut: a separate visual edit with reordered narration, an original 128 BPM score, opening chime and transition accents. Music is ducked under speech. This supports an immediate hook but cannot establish virality or retention outcomes.
- Caption correction: complete phone frames fit within a stage ending at y=1200. Promotional captions, university names and progress labels sit below the phone footprint. Native screenshot text is preserved.
- Counts: 60 institutions in TNMGR's official 2026–27 MBBS affiliate list; 35 KUHS MBBS institutions in KEAM 2026 Annexure III(1), from 14 government and 21 self-financing entries. These are list-based affiliation counts, not ORBIT users, recommendations, endorsements or a current-permission census.

Count methodology and primary sources are included in `research/COLLEGE_COUNTS.md`. The unsupported “recommended by students from N colleges” claim is not used.

Reels creative reference: Meta recommends vertical 9:16 footage with audio and key messages in a safe area. This revision raises feature captions and uses an immediate visual/spoken hook. Platform placement previews and actual audience-retention testing were not performed. https://www.facebook.com/business/ads/facebook-instagram-reels-ads

## Distinct visual edit revision
The music version is a separate 15-shot edit, rather than a soundtrack replacement: three-screen opening, ACEV AI at 2.95 seconds, AI notes at 6.55, recall at 9.65, practice at 12.75; university reveal at 34.45, sourced college counts at 37.55, India at 40.65. Captions are rewritten and phone entrances shortened to 0.42 seconds with a readable hold. Narration remains unaccelerated. Both edit timelines total 48 seconds. Representative frames reviewed show promotional captions clear of the phone stage.

### Why the cuts differ
Cut A lets a first-time viewer follow university selection, questions, answers, practice and study tools in sequence. Its quiet narration-only track gives the UI room to be read. Cut B prioritises product proof: visible native screens at the opening and AI before the longer workflow. Recall precedes MCQs; the university reveal comes after the feature demonstrations. Faster entrances add energy while captions remain in a separate stage. Both use the same verified assets and accurate affiliation scope. This is an editorial hypothesis for audience engagement, not evidence of superior conversion; compare retention and click-through after publication.

## Screenshot-directed full-screen repair
The supplied gallery screenshot shows the MCQ phone clipping at the top and bottom plus a neighbouring screen fragment at the right. The former phone’s 1307-pixel height exceeded the 1090-pixel stage, then zooms enlarged it again. Replaced with 480×1040 full-viewport phones, contain-fit screenshot sizing, smaller bounded poses and no image crop or fade mask. Scene backgrounds now remain opaque and exit flights are removed to prevent screen fragments from earlier scenes. The MCQ preview-only diagnostic row is hidden at capture; native cards remain unchanged. New captures have no page errors.

Voice: en-US-AndrewNeural, rate -18%, pitch -2 Hz. Andrew was selected for a warm, confident US presentation voice over the more passionate Guy and expressive Ava alternatives in the live voice catalogue. No Apple presenter’s voice is cloned. Word-boundary metadata verifies the complete script of each clip; recorded speech is not accelerated to fit. Voice quality and audience preference remain subjective.

Primary voice reference: https://learn.microsoft.com/azure/ai-services/speech-service/language-support — catalogue/style support. Transition reference: https://www.remotion.dev/docs/transitioning.

Final generation pace is -18%, selected after the initial -6% pass to leave more space between words. All 15 clips pass full-word metadata checks and fit their allotted scenes with post-processing tempo 1.0. The longest clip is approximately 2.73 seconds. Both edits preserve their 48-second duration.

The final transition review also caught partially sliced lettering during the old overflow-masked caption entrance. Replaced it with whole-line opacity and a 14-pixel drift (22 pixels for hero type), keeping glyphs intact at every animation frame.

## Fast no-voice variant correction
User clarified the second variant must contain no voiceover. Added a separate 24-second edit with 13 scenes, most 100 frames long and a 240-frame final CTA, 60 fps. New original music is 144 BPM: each 100-frame shot equals four beats. Entrances use 0.22 seconds and a 0.12-second blur-to-sharp accent. All 14 reviewed representative frames keep whole-phone framing and separate captions. There is no narration asset in the FastPromo component or fast music synthesis. The original 48-second scored/voiced edit is retained as historical source but is not the newly requested deliverable.

Narrated revision remains pending: prior word-boundary and timing checks did not certify spoken pronunciation. The next script replaces spoken letter strings with full words or natural alternatives. ElevenLabs is a confirmed launch-video provider (Ramp), while the exact preset is not publicly disclosed. No ElevenLabs-generation tool is connected. No replacement narrated MP4 is claimed here.
