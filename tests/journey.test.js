const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const chapters=require('../src/chapters.js');
// A minimal DOM adapter exercises the real event handlers and storage contract.
function boot(storage=new Map()) {
 const nodes=new Map();
 const element=()=>({value:'',textContent:'',hidden:false,disabled:false,dataset:{},children:[],handlers:{},setAttribute(k,v){this[k]=v;},removeAttribute(k){if(k==='data-tone')delete this.dataset.tone;},append(...els){this.children.push(...els);},replaceChildren(...els){this.children=els;},addEventListener(k,fn){this.handlers[k]=fn;},focus(){this.focused=true;}});
 const $=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const classes=new Set();let scenes=[];
 const context={chapters,document:{getElementById:$,createElement:element,body:{classList:{toggle(name,force){const enabled=force===undefined?!classes.has(name):force;if(enabled)classes.add(name);else classes.delete(name);return enabled;}}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},drawWorld:(...args)=>scenes.push(args),confirm:()=>true};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/game.js'),'utf8'),context);
 return {$,storage,classes,scenes,submit(answer){$('answer').value=answer;$('form').handlers.submit({preventDefault(){}});}};
}
test('complete adventure preserves scoring, saved answers, chapter scenes, palette and restart',()=>{
 let game=boot();game.submit('wrong');assert.equal(game.$('feedback').dataset.tone,'error');game.$('hint').onclick();assert.match(game.$('feedback').textContent,/sich treffen/);game.submit('hang out');assert.equal(game.$('xp').textContent,'5 / 250 XP');
 game=boot(game.storage);assert.equal(game.$('next').hidden,false);assert.equal(game.$('answer').disabled,true);game.submit('hang out');assert.equal(game.$('xp').textContent,'5 / 250 XP');game.$('next').onclick();
 for(const question of chapters.flatMap(c=>c[2]).slice(1)){game.submit(question[2]);assert.equal(game.$('next').hidden,false);game.$('next').onclick();}
 assert.equal(game.$('finish').hidden,false);assert.equal(game.$('game').hidden,true);assert.match(game.$('result').textContent,/245/);assert.equal(game.$('completed').textContent,'25/25');assert.deepEqual([...new Set(game.scenes.map(s=>s[0]))],[0,1,2,3,4]);
 game.$('palette').onclick();game=boot(game.storage);assert.ok(game.classes.has('board'));game.$('reset').onclick();assert.equal(game.$('xp').textContent,'0 / 250 XP');assert.equal(game.$('finish').hidden,true);
});
