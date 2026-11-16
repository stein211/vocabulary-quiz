const {test}=require('node:test');const assert=require('node:assert/strict');const {matches,reward}=require('../src/game.js');const chapters=require('../src/chapters.js');
test('25 complete questions',()=>{assert.equal(chapters.flatMap(c=>c[2]).length,25);assert.ok(chapters.every(c=>c[2].every(q=>q.length===3&&q.every(Boolean))));});
test('answer matching',()=>{assert.ok(matches('  Never give up! ','Never give up!'));assert.ok(matches('apologize','apologise'));assert.ok(!matches('trust','tease'));});
test('scoring',()=>{assert.equal(reward({assisted:false}),10);assert.equal(reward({assisted:true}),5);});
