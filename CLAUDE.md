# Madinati

A single-file web game for children aged 6-12. The player walks an avatar around a small town, learns Islamic basics, and earns coins and stars. Everything is in `index.html` (HTML, CSS and JavaScript, no build step, no dependencies).

## Rules that must not change
- Clothing is modest only. Girls wear a jilbab and khimar, boys wear a thobe with a head covering. There is no other clothing option.
- Avatars have no faces.
- No music. Sound effects and the narrator are optional and **off by default** (Sound card on the Town tab). Effects are short single sounds, never melodies or jingles.
- The narrator (browser text-to-speech) speaks English only. It must never read Arabic script, or the transliteration of Qur'an, duas or dhikr, because a synthetic voice teaches the wrong pronunciation. `speakable()` strips Arabic script as a safety net, but callers must not pass these texts at all.
- No chat with strangers, no ads, no tracking. Progress is stored in `localStorage` only.
- Quiz and Arabic content must be reviewed by a teacher or scholar before children use it. Do not add content from memory without flagging it for review.

## How the file is organised (search for these comment banners)
- Data constants near the top of the script: `COLORS`, `SHOES`, `HAND`, `BACK`, `BADGE`, `TRIM`, `PATTERN`, `HATS`, `HLEN`, `GLOVES`, `VEIL`, `DECKS` (quiz decks), `SURAHS` (Arabic ayat for recitation and hifz), `DZIKIR`, `DUAS`, `WUDU_STEPS`, `PILLARS`, `LETTERS` (all 28), `ZONES` (the two districts and where the avatar stands at each place).
- `S`: saved game state (name, outfit choices, coins, stars, owned items, daily deeds, recitation counts, `gfx` graphics setting, `zone` current district, plus `hist`, `best`, `mem` and `since` for the parent view). Saved under the `madinati-v1` key. Old saves are migrated near where `S` is created.
- `avatar(s)`: draws the avatar as SVG from the state. Girl and boy are separate branches. With Detailed graphics it adds shading, folds and a ground shadow, but never a face.
- Graphics: `GFX()` is true unless the player picked Simple on the Town tab. Every drawing function takes a `D` flag and adds extra layers (shading, windows, trees, lamps, moving clouds and water) on top of the simple shapes, so both modes share one set of art. Colours are CSS variables, so light and dark mode both work. Animations stop under `prefers-reduced-motion`.
- Wardrobe: `renderWardrobe`, `pick`, `buy`, `tryBar`. Tapping a locked item previews it in `trial` without charging. `OWN` maps each setting to its item list and ownership prefix.
- Town: `renderTown`, `goPlace`, `openPlace`. Each building opens a bottom sheet menu. Art is in `artOld` (Old Town: Masjid, Madrasa, Library, Garden of Adab, Sadaqah Market) and `artRiver` (Riverside Quarter: My Home, Wudu Fountain, Play Park, Pillars Hall, Date Orchard). The `gate` place in each district walks the avatar to the other one, and so do the district buttons above the map.
- Activities: `quiz`, `letterQuiz`, `orderSteps` (used by `orderGame`, `wuduGame`, `pillarsGame`), `market`, `dzikirCounter`, `hifzQuiz`, `reciteMenu`/`recite` (also practises duas), `memMenu`/`memCheck`, `duaCard`/`duaList`/`duaQuiz`, `matchGame` (letter memory pairs), `harvest` (tap the ripe dates), `mathQuiz` (sharing sums, made fresh each round).
- Sound: `sfx(name)` plays a Web Audio effect from `SFX`, and `say(...)` narrates through `speechSynthesis`. Both do nothing unless `S.sound` is `fx` (effects) or `all` (effects and narrator). `toast()` also narrates. `readBtn()` adds a Read aloud button when the narrator is on. `stopAudio()` stops narration and listening when a sheet opens or closes.
- Speech checking: `listen`, `micButton`, `grade`, `alignWords`, `errMsg`. `listen` does not open the microphone itself first, because on Android that can end recognition at once. It restarts sessions that Android ends early, gathers interim and final words, and finishes once every word is heard, after 2.5 seconds of silence, when the button is tapped again, or after 25 seconds. Error messages end with a small diagnostic line (code and session log) to help with bug reports. Uses the browser's Web Speech API with `ar-SA`. Words are compared after stripping diacritics, with a 75 percent pass mark. It cannot judge tajweed. A parent or teacher checkbox path always works as a fallback.
- Rewards: `reward(id,coins,stars)` pays once per activity per day. It also calls `track(id)`, which logs every finished activity, practice rounds included.
- Parent view: the Parents tab, `renderParents`. Read only. It shows totals, the last 7 days, the prayers ticked in Daily deeds, Qur'an recitation and memory counts, quiz best and last scores, and duas practised. `S.hist` keeps one entry per day (finished activity ids with counts, and the deeds ticked) for 60 days. `S.best` holds quiz scores, `S.mem` holds from-memory counts and `S.since` is when history started. History only begins once a save has this version. A print button with `@media print` styles makes the printable progress sheet.
- `REVIEW.md` lists content added from general knowledge that still needs a teacher or scholar to check it. Matching `REVIEW:` comments mark it in the code.

## Known limits
- The microphone check needs a normal https page (or localhost). Chrome refuses it for a file opened from the device (`file://` or `content://`) and inside embedded frames. It also needs an internet connection.
- The `[hidden]{display:none!important}` rule is required. Without it the closed bottom sheet covers the whole screen.
- Fonts (Fredoka, Nunito, Amiri) come from Google Fonts. Offline, the page falls back to system fonts.

## Testing
`tests/smoke.js` clicks through both districts, the quizzes, dzikir counter, recitation and dua fallback, the order games, letter match, date harvest, the graphics switch, wardrobe try-on, daily deeds, the parent view and the sound settings (including that the narrator never speaks Arabic) in headless Chromium and reports page errors. Run it with `node tests/smoke.js $PWD/index.html` (needs Playwright). Set `SHOTS=<dir>` to choose where its screenshots are saved. `tests/mic.js` tests the listening logic with a fake recogniser that behaves like Android Chrome: `node tests/mic.js $PWD/index.html`. It cannot replace testing on a real phone.

## Ideas not built yet
More surahs, offline support (service worker) and an installable app. Also the original idea of syncing progress between devices.
