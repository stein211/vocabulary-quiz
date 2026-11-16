const {test}=require('node:test');
const assert=require('node:assert/strict');
const chapters=require('../src/chapters.js');
const {CHARACTERS,characterSVG}=require('../src/characters.js');
const {makeBank,matches,encodeChallenge,decodeChallenge,verdict}=require('../src/game.js');
const ids=CHARACTERS.map(c=>c.id), all=chapters.flatMap(c=>c[2]);

test('every question has word tiles that can build the answer',()=>{
 all.forEach((q,step)=>{
  const bank=makeBank(chapters,step);
  assert.deepEqual(makeBank(chapters,step),bank,'tiles stay the same after a reload');
  if(q[0].includes('___')){assert.equal(bank.length,5);assert.equal(new Set(bank).size,5);assert.ok(bank.includes(q[2]));}
  else{const pool=bank.slice();for(const w of q[2].split(' ')){const i=pool.indexOf(w);assert.ok(i>-1,w);pool.splice(i,1);}assert.ok(matches(q[2].split(' ').join(' '),q[2]));}
 });
});
test('every buddy draws in every mood',()=>{
 assert.ok(ids.length>=8);
 for(const id of ids)for(const m of ['happy','yay','oh']){const svg=characterSVG(id,m);assert.match(svg,/^<svg/);assert.ok(svg.length>500,id+' '+m);}
});
test('challenge links round-trip, including names with umlauts',()=>{
 const code=encodeChallenge({name:'Jürgen 🦊',avatar:'fox',xp:230,perfect:21});
 assert.match(code,/^[A-Za-z0-9_-]+$/);
 assert.deepEqual(decodeChallenge(code,ids),{name:'Jürgen 🦊',avatar:'fox',xp:230,perfect:21});
});
test('broken or tampered challenge links are ignored',()=>{
 assert.equal(decodeChallenge('not-a-code',ids),null);
 assert.equal(decodeChallenge(encodeChallenge({name:'Mia',avatar:'dragon',xp:10,perfect:1}),ids),null);
 assert.equal(decodeChallenge(encodeChallenge({name:'Mia',avatar:'cat',xp:9999,perfect:1}),ids),null);
 assert.equal(decodeChallenge(encodeChallenge({name:'   ',avatar:'cat',xp:10,perfect:1}),ids),null);
 assert.equal(decodeChallenge(encodeChallenge({name:'<b>Mia</b>',avatar:'cat',xp:10,perfect:1}),ids).name,'bMia/b');
});
test('who wins: XP first, then first-try answers',()=>{
 assert.equal(verdict({xp:240,perfect:20},{xp:230,perfect:25}),'win');
 assert.equal(verdict({xp:230,perfect:20},{xp:230,perfect:22}),'lose');
 assert.equal(verdict({xp:230,perfect:22},{xp:230,perfect:22}),'draw');
});
