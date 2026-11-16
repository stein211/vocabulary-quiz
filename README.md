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
- `src/scene.js`: chapter illustrations.
- `tests/game.test.js`: tests (`node --test`).

Progress is stored in the browser, not on a server. First-try answers earn 10 XP; assisted answers earn 5 XP. The original 25-question story is adapted from the chat prototype, with no external images or textbook photos included.

## Roadmap
Mistake review, additional stories, vocabulary import, and optional audio pronunciation.

## Exercise Book Edition (0.3)
The game now looks like a school exercise book: royal-blue ink on ruled paper, a red margin,
and a yellow highlighter. You write each answer straight into the blank in the sentence, and
feedback appears underneath like a note from the teacher. Every chapter has its own illustrated
scene, from Friday afternoon outside school to the park the next day.

- **Switch to chalkboard** changes to a dark theme; the choice is saved locally.
- `src/scene.js` draws the chapter illustrations on a canvas. No image assets or build step.
- `fonts/` holds the two typefaces, Bricolage Grotesque and Caveat, so the game works offline.
  Both are under the SIL Open Font License (see the licence files in that folder).
- Progress saved by earlier versions stays compatible.
