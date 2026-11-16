'use strict';
const normalize = s => s.toLowerCase().replace(/[.!?]/g,'').trim().replace(/\s+/g,' ');
const matches = (input, answer) => normalize(input) === normalize(answer) || (answer === 'apologise' && normalize(input) === 'apologize');
const reward = state => state.assisted ? 5 : 10;
if(typeof module !== 'undefined') module.exports={normalize,matches,reward};
if(typeof document !== 'undefined') {
 const $=id=>document.getElementById(id), key='vocabulary-quest-v1';
 const fresh=()=>({step:0,xp:0,assisted:false,solved:false});
 let state=fresh(); try {const saved=JSON.parse(localStorage.getItem(key)); if(saved && Number.isInteger(saved.step)&&saved.step>=0&&saved.step<=25) state=saved;}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
 const current=()=>chapters[Math.floor(state.step/5)][2][state.step%5];
 function render(){
 $('xp').textContent=state.xp+' / 250 XP'; $('progress').value=state.step;
 $('levels').textContent=chapters.map((_,i)=>(state.step>=(i+1)*5?'✓':Math.floor(state.step/5)===i?'▶':'🔒')+' Level '+(i+1)).join('   ');
 $('game').hidden=state.step===25; $('finish').hidden=state.step!==25;
 if(state.step===25){$('result').textContent='You earned '+state.xp+' XP!';return;}
 const c=chapters[Math.floor(state.step/5)]; $('counter').textContent='CHAPTER '+(Math.floor(state.step/5)+1)+' · QUESTION '+(state.step%5+1)+'/5'; $('chapter').textContent=c[0]; $('story').textContent=c[1]; $('question').textContent=current()[0];
 $('answer').value=state.solved?current()[2]:''; $('feedback').textContent=state.solved?'Correct! Continue the story.':''; $('answer').disabled=state.solved; $('check').disabled=state.solved; $('next').hidden=!state.solved; $('hint').hidden=state.solved; $('reveal').hidden=state.solved;
 }
 $('form').addEventListener('submit',e=>{e.preventDefault();if(state.solved||!$('answer').value.trim())return;if(matches($('answer').value,current()[2])){const xp=reward(state);state.xp+=xp;state.solved=true;save();render();$('feedback').textContent='Excellent! +'+xp+' XP';}else{state.assisted=true;save();$('feedback').textContent='Not quite! Try again.';}});
 $('hint').onclick=()=>{state.assisted=true;save();$('feedback').textContent='🇩🇪 '+current()[1];};
 $('reveal').onclick=()=>{state.assisted=true;save();$('feedback').textContent='Answer: '+current()[2];};
 $('next').onclick=()=>{if(!state.solved)return;state.step++;state.solved=false;state.assisted=false;save();render();if(state.step<25)$('answer').focus();};
 $('reset').onclick=()=>{if(confirm('Restart and clear your progress?')){state=fresh();save();render();}};render();
}
