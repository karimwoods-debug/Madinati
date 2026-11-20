# Madinati

A single-file web game for children aged 6-12. The player walks an avatar around a small town, learns Islamic basics, and earns coins and stars. Everything is in `index.html` (HTML, CSS and JavaScript, no build step, no dependencies).

## Rules that must not change
- Clothing is modest only. Girls wear a jilbab and khimar, boys wear a thobe with a head covering. There is no other clothing option.
- Avatars have no faces.
- No music and no sound of any kind.
- No chat with strangers, no ads, no tracking. Progress is stored in `localStorage` only.
- Quiz and Arabic content must be reviewed by a teacher or scholar before children use it. Do not add content from memory without flagging it for review.

## How the file is organised (search for these comment banners)
- Data constants near the top of the script: `COLORS`, `SHOES`, `HAND`, `BACK`, `BADGE`, `TRIM`, `PATTERN`, `HATS`, `HLEN`, `GLOVES`, `VEIL`, `DECKS` (quiz decks), `SURAHS` (Arabic ayat for recitation and hifz), `DZIKIR`.
- `S`: saved game state (name, outfit choices, coins, stars, owned items, daily deeds, recitation counts). Saved under the `madinati-v1` key. Old saves are migrated near where `S` is created.
- `avatar(s)`: draws the avatar as SVG from the state. Girl and boy are separate branches.
- Wardrobe: `renderWardrobe`, `pick`, `buy`, `tryBar`. Tapping a locked item previews it in `trial` without charging. `OWN` maps each setting to its item list and ownership prefix.
- Town: `renderTown`, `goPlace`, `openPlace`. Each building opens a bottom sheet menu.
- Activities: `quiz`, `letterQuiz`, `orderGame`, `market`, `dzikirCounter`, `hifzQuiz`, `reciteMenu`/`recite`, `memMenu`/`memCheck`.
- Speech checking: `listen`, `grade`, `alignWords`, `errMsg`. Uses the browser's Web Speech API with `ar-SA`. Words are compared after stripping diacritics, with a 75 percent pass mark. It cannot judge tajweed. A parent or teacher checkbox path always works as a fallback.
- Rewards: `reward(id,coins,stars)` pays once per activity per day.

## Known limits
- The microphone check needs a normal https page (or localhost). Chrome refuses it for a file opened from the device (`file://` or `content://`) and inside embedded frames. It also needs an internet connection.
- The `[hidden]{display:none!important}` rule is required. Without it the closed bottom sheet covers the whole screen.
- Fonts (Fredoka, Nunito, Amiri) come from Google Fonts. Offline, the page falls back to system fonts.

## Testing
`tests/smoke.js` clicks through the town, quizzes, dzikir counter, recitation fallback, wardrobe try-on and daily deeds in headless Chromium and reports page errors. Run it with `node tests/smoke.js $PWD/index.html` (needs Playwright).

## Ideas not built yet
Wudu steps, dua of the day, a parent view of what a child has learned, more surahs, a printable progress sheet, offline support (service worker) and an installable app. Also the original idea of syncing progress between devices.
