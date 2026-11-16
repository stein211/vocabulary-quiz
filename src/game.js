'use strict';
/* ---------- Pure game logic (also used by the tests) ---------- */
const TOTAL = 25, MAX_XP = 250;
const normalize = s => s.toLowerCase().replace(/[.!?,]/g, '').replace(/[’']/g, "'").trim().replace(/\s+/g, ' ');
const matches = (input, answer) => normalize(input) === normalize(answer) || (answer === 'apologise' && normalize(input) === 'apologize');
const reward = state => state.assisted ? 5 : 10;
const isGap = q => q[0].includes('___');

// A small deterministic shuffle, so the tiles stay in the same order after a reload.
function shuffle(list, seed) {
  const a = list.slice(); let s = (seed * 7919 + 17) % 2147483647 || 1;
  for (let i = a.length - 1; i > 0; i--) { s = s * 48271 % 2147483647; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Word tiles for a question: the answer plus a few wrong ones from elsewhere in the story.
function makeBank(chapters, step) {
  const all = chapters.flatMap(c => c[2]), q = all[step], answer = q[2];
  if (!isGap(q)) {
    const words = answer.split(' ');
    const extras = ['always', 'you', 'do', 'not', 'will', 'did', 'it'].filter(w => !words.some(x => normalize(x) === w));
    return shuffle(words.concat(shuffle(extras, step).slice(0, 3)), step + 7);
  }
  const pool = [...new Set(all.filter(x => isGap(x) && x[2] !== answer).map(x => x[2]))];
  return shuffle([answer].concat(shuffle(pool, step).slice(0, 4)), step + 3);
}

// Challenge links carry a nickname, buddy and score. Nothing is stored on a server.
function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text); let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(code) {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
const cleanName = s => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
function encodeChallenge(p) { return toBase64Url(JSON.stringify({ v: 1, n: cleanName(p.name), a: p.avatar, x: p.xp, p: p.perfect })); }
function decodeChallenge(code, avatarIds) {
  try {
    const o = JSON.parse(fromBase64Url(String(code)));
    const name = cleanName(o.n);
    const ok = o.v === 1 && name && avatarIds.includes(o.a) && Number.isInteger(o.x) && o.x >= 0 && o.x <= MAX_XP && Number.isInteger(o.p) && o.p >= 0 && o.p <= TOTAL;
    return ok ? { name, avatar: o.a, xp: o.x, perfect: o.p } : null;
  } catch { return null; }
}
function verdict(me, them) {
  if (me.xp !== them.xp) return me.xp > them.xp ? 'win' : 'lose';
  if (me.perfect !== them.perfect) return me.perfect > them.perfect ? 'win' : 'lose';
  return 'draw';
}

if (typeof module !== 'undefined') module.exports = { normalize, matches, reward, shuffle, makeBank, encodeChallenge, decodeChallenge, verdict, TOTAL, MAX_XP };

/* ---------- The game in the browser ---------- */
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const KEY = 'vocabulary-quest-v2', OLD_KEY = 'vocabulary-quest-v1';
  const questions = chapters.flatMap(c => c[2]);
  const ids = CHARACTERS.map(c => c.id);
  const chapterColors = [['#3cc46e', '#2a9a53'], ['#7b5cff', '#5b3fd6'], ['#ff5a6a', '#d83a4b'], ['#3fa9f5', '#2280c7'], ['#ffb020', '#d98c00']];
  const praise = ['Great job!', 'Brilliant!', 'You got it!', 'Super!', 'Well done!', 'Nice work!'];
  const fresh = () => ({ v: 2, step: 0, xp: 0, perfect: 0, combo: 0, assisted: false, solved: false, hint: 0, log: [], picked: [], typing: false, name: '', avatar: '', challenge: null });

  let state = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.v === 2 && Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= TOTAL) state = Object.assign(fresh(), saved);
    else {
      const old = JSON.parse(localStorage.getItem(OLD_KEY)); // keep progress from the first version
      if (old && Number.isInteger(old.step) && old.step >= 0 && old.step <= TOTAL) Object.assign(state, { step: old.step, xp: old.xp || 0, solved: !!old.solved, assisted: !!old.assisted });
    }
  } catch {}
  if (!ids.includes(state.avatar)) state.avatar = '';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  // A challenge link opens the game with ?c=...
  try {
    const url = new URL(location.href), code = url.searchParams.get('c');
    if (code) {
      const ch = decodeChallenge(code, ids);
      if (ch) { state.challenge = ch; save(); }
      url.searchParams.delete('c'); history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  } catch {}

  const buddy = (mood, id = state.avatar) => characterSVG(id || 'fox', mood);
  const charName = id => (CHARACTERS.find(c => c.id === id) || {}).name || '';
  const show = view => {
    ['welcome', 'home', 'lesson', 'reward', 'finish'].forEach(v => { $(v).hidden = v !== view; });
    document.body.dataset.view = view; window.scrollTo(0, 0);
  };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

  /* --- Welcome --- */
  let editing = false, chosen = '';
  function renderWelcome() {
    chosen = state.avatar || chosen;
    $('characters').replaceChildren(...CHARACTERS.map(c => {
      const b = el('button', 'char'); b.type = 'button'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(c.id === chosen)); b.style.setProperty('--c', c.color);
      b.innerHTML = buddy('happy', c.id); b.append(el('span', '', c.name));
      b.onclick = () => { chosen = c.id; renderWelcome(); };
      return b;
    }));
    $('name').value = $('name').value || state.name;
    $('start').textContent = editing ? 'Save' : chosen ? 'Start the mystery' : 'Choose a buddy to start';
    $('start').disabled = !chosen;
    const ch = state.challenge;
    $('invite').hidden = !ch || editing;
    if (ch && !editing) {
      $('invite').replaceChildren();
      const pic = el('div', 'invite-avatar'); pic.innerHTML = buddy('yay', ch.avatar);
      const txt = el('div'); txt.append(el('b', '', ch.name + ' challenges you!'), el('span', '', ' ' + ch.name + ' scored ' + ch.xp + ' XP. Play the story and try to beat it.'));
      $('invite').append(pic, txt);
    }
  }
  $('start').onclick = () => {
    const name = cleanName($('name').value);
    $('name-error').hidden = !!name;
    if (!name || !chosen) { if (!name) $('name').focus(); return; }
    state.name = name; state.avatar = chosen; save(); editing = false; route();
  };
  $('name').addEventListener('keydown', e => { if (e.key === 'Enter') $('start').click(); });

  /* --- Home: the story path --- */
  const offsets = [0, -64, -96, -64, 0];
  function renderHome() {
    $('me').innerHTML = buddy('happy'); $('me').append(el('span', '', state.name));
    $('xp-stat').textContent = state.xp; $('clue-stat').textContent = Math.floor(state.step / 5) + '/5'; $('combo-stat').textContent = state.combo;
    const ch = state.challenge;
    $('challenge-bar').hidden = !ch;
    if (ch) {
      $('challenge-bar').replaceChildren();
      const pic = el('div', 'bar-avatar'); pic.innerHTML = buddy('happy', ch.avatar);
      $('challenge-bar').append(pic, el('p', '', ch.name + ' scored ' + ch.xp + ' XP. Can you beat it?'));
    }
    const path = $('path'); path.replaceChildren();
    chapters.forEach((c, ci) => {
      const unlocked = state.step >= ci * 5, done = state.step >= ci * 5 + 5;
      const sec = el('section', 'chapter' + (unlocked ? '' : ' locked'));
      sec.style.setProperty('--cc', chapterColors[ci][0]); sec.style.setProperty('--cd', chapterColors[ci][1]);
      const banner = el('div', 'chapter-banner');
      const cv = el('canvas'); cv.width = 640; cv.height = 280; banner.append(cv);
      const t = el('div', 'chapter-title'); t.append(el('small', '', 'Chapter ' + (ci + 1)), el('b', '', c[0]));
      banner.append(t); sec.append(banner);
      const nodes = el('div', 'nodes');
      for (let qi = 0; qi < 5; qi++) {
        const s = ci * 5 + qi, wrap = el('div', 'node-wrap');
        wrap.style.setProperty('--x', ((ci % 2 ? -1 : 1) * offsets[qi]) + 'px');
        const now = s === state.step;
        const b = el('button', 'node ' + (s < state.step ? 'done' : now ? 'now' : 'lock'));
        b.type = 'button';
        b.textContent = s < state.step ? (state.log[s] === 5 ? '✓' : '★') : now ? '' : String(qi + 1);
        b.setAttribute('aria-label', 'Chapter ' + (ci + 1) + ', question ' + (qi + 1) + (s < state.step ? ', done' : now ? ', play now' : ', locked'));
        if (now) {
          b.innerHTML = '<span aria-hidden="true">▶</span>'; b.onclick = openLesson;
          wrap.append(el('span', 'start-tip', state.step === 0 ? 'Start' : 'Next'));
          const me = el('div', 'path-buddy'); me.innerHTML = buddy('happy'); wrap.append(me);
        } else b.disabled = true;
        wrap.append(b); nodes.append(wrap);
      }
      sec.append(nodes);
      const folder = el('button', 'folder' + (done ? ' open' : ''));
      folder.type = 'button'; folder.disabled = !done;
      folder.append(el('span', '', done ? 'Clue ' + (ci + 1) : '🔒'));
      folder.setAttribute('aria-label', done ? 'Open clue ' + (ci + 1) : 'Clue ' + (ci + 1) + ' is locked');
      if (done) folder.onclick = () => openReward(ci);
      sec.append(folder);
      path.append(sec);
      drawWorld(ci, done, cv);
    });
    if (state.step >= TOTAL) {
      const end = el('button', 'btn trophy', '🏆 See your result'); end.type = 'button'; end.onclick = () => { renderFinish(); show('finish'); };
      path.append(end);
    }
  }
  $('me').onclick = () => { editing = true; chosen = state.avatar; $('name').value = state.name; renderWelcome(); show('welcome'); };
  $('reset').onclick = () => {
    if (!confirm('Start the story again? Your XP goes back to 0.')) return;
    const keep = { name: state.name, avatar: state.avatar, challenge: state.challenge, typing: state.typing };
    state = Object.assign(fresh(), keep); save(); route();
  };

  /* --- Lesson --- */
  const current = () => questions[state.step];
  let typed = '';
  function openLesson() { typed = ''; renderLesson(); show('lesson'); }
  function answerText() { return state.typing ? typed : state.picked.join(' '); }

  function renderLesson() {
    const q = current(), ci = Math.floor(state.step / 5), gap = isGap(q), bank = makeBank(chapters, state.step);
    document.body.style.setProperty('--cc', chapterColors[ci][0]);
    $('bar').style.width = ((state.step % 5) + (state.solved ? 1 : 0)) / 5 * 100 + '%';
    $('lesson-combo').textContent = state.combo;
    $('task').textContent = gap ? 'Fill in the gap' : 'Translate into English';
    $('coach').innerHTML = buddy(state.solved ? 'yay' : 'happy');
    $('story').textContent = chapters[ci][1];

    // The sentence, with the gap (or answer line) where tiles or typing go.
    const sentence = $('sentence'); sentence.replaceChildren(); sentence.className = 'sentence' + (gap ? '' : ' line');
    const slot = el('span', 'slot' + (state.solved ? ' right' : ''));
    if (state.typing && !state.solved) {
      const input = el('input', 'type-in'); input.id = 'answer';
      input.autocomplete = 'off'; input.spellcheck = false; input.setAttribute('autocapitalize', 'off'); input.setAttribute('aria-label', 'Your answer in English');
      input.placeholder = gap ? '' : 'Type in English';
      input.value = typed; input.size = Math.max(8, typed.length + 1);
      input.oninput = () => { typed = input.value; input.size = Math.max(8, typed.length + 1); $('check').disabled = !typed.trim(); };
      input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); check(); } };
      slot.append(input);
    } else {
      const words = state.solved ? (gap ? [q[2]] : q[2].split(' ')) : state.picked;
      words.forEach((w, i) => {
        const t = el('button', 'tile placed', w); t.type = 'button';
        if (state.solved) t.disabled = true; else t.onclick = () => { state.picked.splice(i, 1); save(); renderLesson(); };
        slot.append(t);
      });
    }
    if (gap) {
      const [before, after = ''] = q[0].split('___');
      sentence.append(before, slot, after.replace(/^\s+(?=[.!?,])/, ''));
    } else {
      sentence.append(el('span', 'prompt', q[0].replace(/^Translate:\s*/, '')), slot);
    }

    // Word tiles
    const bankEl = $('bank'); bankEl.replaceChildren(); bankEl.hidden = state.typing || state.solved;
    const used = state.picked.slice();
    bank.forEach(w => {
      const t = el('button', 'tile', w); t.type = 'button';
      const k = used.indexOf(w); if (k > -1) { used.splice(k, 1); t.classList.add('used'); t.disabled = true; t.setAttribute('aria-hidden', 'true'); }
      t.onclick = () => { if (gap) state.picked = [w]; else state.picked.push(w); save(); renderLesson(); };
      bankEl.append(t);
    });
    $('mode').hidden = state.solved;
    $('mode').textContent = state.typing ? '🧩 Use word tiles instead' : '⌨️ Type it instead';

    // Hints
    $('hint-text').hidden = !state.hint || state.solved;
    if (state.hint === 1) $('hint-text').textContent = gap ? 'Auf Deutsch: ' + q[1] : 'It starts with: ' + q[2].split(' ')[0];
    if (state.hint >= 2) $('hint-text').textContent = 'Answer: ' + q[2];
    $('hint').textContent = state.hint ? 'Show answer' : 'Hint';
    $('hint').disabled = state.hint >= 2 || state.solved;
    $('check').disabled = !answerText().trim() || state.solved;
    $('check').hidden = state.solved;

    // Feedback sheet (also restored after a reload)
    if (state.solved) showSheet('right', state.log[state.step]); else if (!sheetWrong) $('sheet').hidden = true;
    if (state.typing && !state.solved && $('sheet').hidden) setTimeout(() => $('answer') && $('answer').focus(), 0);
  }

  let sheetWrong = false;
  function showSheet(kind, xp) {
    const q = current(), sheet = $('sheet');
    sheet.hidden = false; sheet.dataset.kind = kind;
    $('sheet-avatar').innerHTML = buddy(kind === 'right' ? 'yay' : 'oh');
    if (kind === 'right') {
      $('sheet-title').textContent = praise[state.step % praise.length] + ' +' + xp + ' XP';
      $('sheet-text').textContent = isGap(q) ? q[2] + ' = ' + q[1] : 'You translated it!';
      $('sheet-btn').textContent = 'Continue';
    } else {
      $('sheet-title').textContent = 'Not quite';
      $('sheet-text').textContent = state.hint ? 'Have another go.' : 'Have another go. Tap Hint if you are stuck.';
      $('sheet-btn').textContent = 'Try again';
    }
    $('sheet-btn').focus();
  }

  function check() {
    if (state.solved || !answerText().trim()) return;
    if (matches(answerText(), current()[2])) {
      const xp = reward(state);
      state.xp += xp; state.log[state.step] = xp; state.solved = true;
      if (state.assisted) state.combo = 0; else { state.perfect++; state.combo++; }
      sheetWrong = false; save(); renderLesson();
    } else {
      state.assisted = true; state.combo = 0; sheetWrong = true; save();
      $('lesson-combo').textContent = 0;
      showSheet('wrong');
    }
  }
  $('check').onclick = check;
  $('hint').onclick = () => { state.hint = Math.min(2, state.hint + 1); state.assisted = true; save(); renderLesson(); };
  $('mode').onclick = () => { state.typing = !state.typing; typed = state.typing ? state.picked.join(' ') : ''; save(); renderLesson(); };
  $('close').onclick = () => { sheetWrong = false; route(); };
  $('sheet-btn').onclick = () => {
    if (!state.solved) { // try again
      sheetWrong = false; state.picked = []; typed = ''; save(); $('sheet').hidden = true; renderLesson(); return;
    }
    const finishedChapter = state.step % 5 === 4 ? Math.floor(state.step / 5) : -1;
    Object.assign(state, { step: state.step + 1, solved: false, assisted: false, hint: 0, picked: [] });
    typed = ''; save(); $('sheet').hidden = true;
    if (finishedChapter > -1) openReward(finishedChapter, true); else renderLesson();
  };

  /* --- Clue reward --- */
  let afterReward = 'home';
  function openReward(ci, isNew = false) {
    afterReward = isNew && state.step >= TOTAL ? 'finish' : 'home';
    $('reward-title').textContent = isNew ? 'Clue found!' : 'Clue ' + (ci + 1);
    $('reward-sub').textContent = 'Chapter ' + (ci + 1) + ': ' + chapters[ci][0];
    $('case-tab').textContent = 'CLUE ' + (ci + 1) + ' OF 5';
    $('clue-caption').textContent = ['Friday, after school', 'Friday evening', 'The crash, 9:47 pm', 'The video', 'The next day'][ci];
    $('clue-note').textContent = clues[ci];
    $('clue-words').textContent = 'New words: ' + chapters[ci][2].map(q => q[2]).join(' · ');
    const log = state.log.slice(ci * 5, ci * 5 + 5);
    $('reward-xp').textContent = '⭐ ' + log.reduce((a, b) => a + (b || 0), 0);
    $('reward-perfect').textContent = '🎯 ' + log.filter(x => x === 10).length + '/5';
    $('reward-btn').textContent = afterReward === 'finish' ? 'See your result' : 'Back to the map';
    show('reward'); drawWorld(ci, true, $('clue-scene'));
  }
  $('reward-btn').onclick = () => { if (afterReward === 'finish') { renderFinish(); show('finish'); } else { renderHome(); show('home'); } };

  /* --- Finish and challenge --- */
  function renderFinish() {
    $('finish-avatar').innerHTML = buddy('yay');
    $('final-xp').textContent = '⭐ ' + state.xp; $('final-perfect').textContent = '🎯 ' + state.perfect + '/25';
    const ch = state.challenge, vs = $('versus');
    vs.hidden = !ch; $('share').textContent = ch ? 'Send your score back' : 'Challenge a friend';
    if (ch) {
      const me = { xp: state.xp, perfect: state.perfect }, r = verdict(me, ch);
      const side = (id, name, xp, win) => { const d = el('div', 'vs-side' + (win ? ' win' : '')); const a = el('div', 'vs-avatar'); a.innerHTML = buddy(win ? 'yay' : 'happy', id); d.append(a, el('b', '', name), el('span', '', xp + ' XP')); return d; };
      vs.replaceChildren(side(state.avatar, state.name + ' (you)', state.xp, r === 'win'), el('span', 'vs', 'VS'), side(ch.avatar, ch.name, ch.xp, r === 'lose'));
      vs.append(el('p', 'verdict', r === 'win' ? 'You win! 🎉' : r === 'lose' ? ch.name + ' wins this time. Play again to beat them!' : "It's a draw! 🤝"));
    }
    $('share-box').hidden = true;
  }
  $('share').onclick = async () => {
    const code = encodeChallenge({ name: state.name, avatar: state.avatar, xp: state.xp, perfect: state.perfect });
    const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('c', code);
    const link = url.toString();
    const text = state.name + ' solved the Vocabulary Quest mystery with ' + state.xp + ' XP. Can you beat it?';
    if (navigator.share) {
      try { await navigator.share({ title: 'Vocabulary Quest challenge', text, url: link }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    $('share-box').hidden = false; $('share-link').value = link;
    try { await navigator.clipboard.writeText(text + ' ' + link); $('share-note').textContent = 'Link copied! Paste it into a message to your friend.'; }
    catch { $('share-note').textContent = 'Copy this link and send it to your friend:'; }
    $('share-link').select();
  };
  $('to-map').onclick = () => { renderHome(); show('home'); };
  $('again').onclick = () => {
    if (!confirm('Play the whole story again? Your XP goes back to 0.')) return;
    const keep = { name: state.name, avatar: state.avatar, challenge: state.challenge, typing: state.typing };
    state = Object.assign(fresh(), keep); save(); route();
  };

  function route() {
    if (!state.name || !state.avatar || editing) { renderWelcome(); show('welcome'); return; }
    if (state.step >= TOTAL) { renderFinish(); show('finish'); return; }
    renderHome(); show('home');
    const now = document.querySelector('.node.now');
    if (now && now.scrollIntoView) now.scrollIntoView({ block: 'center' });
  }
  route();
}
