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
- `src/characters.js`: the animal buddies.
- `tests/`: tests (`node --test`).

Progress is stored in the browser, not on a server. First-try answers earn 10 XP; assisted answers earn 5 XP. The original 25-question story is adapted from the chat prototype, with no external images or textbook photos included.

## Roadmap
Mistake review, additional stories, vocabulary import, and optional audio pronunciation.

## Quest Edition (0.4)
A playful, app-style version of the game.

- **Choose a buddy.** Penguin, cat, dog, owl, lion, tiger, horse, bunny or fox, plus a nickname.
- **Story path.** The 25 questions are stepping stones through five illustrated chapters.
  Finishing a chapter unlocks a clue card for Emma's case file.
- **Tap or type.** Fill each gap with word tiles, or switch to typing to practise spelling.
  Hint first shows the German word, then the answer. 10 XP on the first try, 5 XP with help.
- **Challenge a friend.** At the end, *Challenge a friend* shares a link with your nickname,
  buddy and score. Your friend plays the story and sees who won, then can send their score back.
  The score lives only in the link: there is no server, no account and nothing stored online.
  Links can be edited by a clever player, so this is for friendly competition only.

### Sharing the game
Challenge links only work when the game is online. With GitHub Pages turned on
(Settings → Pages → Deploy from branch → `main`, folder `/`), the game lives at
https://stein211.github.io/vocabulary-quiz/ and challenge links point there.

### Online leaderboard (optional)
Tap 🏆 on the map to create a named group or join one with a code like `WORD-4821`, then use
*Invite friends* to share a link. The leaderboard shows each player's buddy, nickname,
questions finished, XP and playing time, and updates while friends play. Playing time only
counts while a question is on screen and someone is actually playing.

The scores are kept in a free [Supabase](https://supabase.com) project. To switch it on:
1. Create a Supabase project, open **SQL Editor**, paste `supabase/setup.sql` and click **Run**.
2. Copy the **Project URL** and the **Publishable key** (Project Settings → API Keys) into `src/config.js`.

Only a random player id, nickname, buddy, group code, progress, XP and time are stored. The
game can't read or change the table directly, only through three checked functions, and each
device can only change or remove its own entry (*Leave group* deletes it). With `src/config.js`
left empty, the game works exactly as before without a leaderboard.

Fonts (Fredoka, Special Elite) are bundled in `fonts/` with their licences, so it works offline.
