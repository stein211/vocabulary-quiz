# vocabulary-quiz

An interactive story-based English vocabulary learning game.

## Vocabulary Quest
A story-driven English vocabulary game with German hints. Version 0.1.0.

## Run
Open `index.html` in a browser; no dependencies or installation required. Alternatively run `python3 -m http.server 8000` and visit http://localhost:8000.

## Develop
- `src/chapters.js`: chapter text, questions, German hints, answers.
- `src/game.js`: scoring, validation, progress and rendering.
- `src/style.css`: visual design.
- `tests/game.test.js`: tests (`node --test`).

Progress is stored in the browser, not on a server. First-try answers earn 10 XP; assisted answers earn 5 XP. The original 25-question story is adapted from the chat prototype, with no external images or textbook photos included.

## Roadmap
Mistake review, additional stories, vocabulary import, and optional audio pronunciation.

## Pocket Edition (0.2)
Game Boy-inspired shell and LCD palette, original canvas pixel scenes for all five chapters,
chapter route, keyboard-friendly answer controls and a completion screen. Use **PALETTE**
to switch between green and amber; the choice is saved locally. Existing v1 progress stays compatible.
The decorative D-pad and A/B shell buttons are ornamental; use the labeled controls inside the screen.
`src/scene.js` owns the pixel artwork. No build step or image assets are needed.
The optional Google Fonts typeface falls back to the device's monospace font when offline.
