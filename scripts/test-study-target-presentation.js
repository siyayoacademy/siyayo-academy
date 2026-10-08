const assert=require('node:assert/strict'),fs=require('node:fs');
const {highlight}=require('../js/study-target-presentation');
const seeds=require('../data/learning/experience-seeds.json').items;
const plain=html=>html.replace(/<strong class="study-target-word">(.*?)<\/strong>/g,'$1');
for(const experience of seeds)for(const q of experience.thinkingMind)for(const language of ['en','es','pt']){
 const text=q.question[language],target=q.questionWordLabel[language],out=highlight(text,target);
 assert.equal(plain(out),text,'corpus text must be preserved');
 if(text.toLocaleLowerCase().includes(target.toLocaleLowerCase()))assert.ok(out.includes('study-target-word'));
}
assert.equal(highlight('Somewhat somewhere whoís WHO?','WHO'),'Somewhat somewhere whoís <strong class="study-target-word">WHO</strong>?');
assert.equal(highlight('How much water?','HOW MUCH'),'<strong class="study-target-word">How much</strong> water?');
assert.equal(highlight('¿Por qué? Porque sí.','POR QUÉ'),'¿<strong class="study-target-word">Por qué</strong>? Porque sí.');
assert.equal(highlight('Queijo e pão','e'),'Queijo <strong class="study-target-word">e</strong> pão');
assert.equal(highlight('What <img src=x> & "?"','WHAT'),'<strong class="study-target-word">What</strong> &lt;img src=x&gt; &amp; &quot;?&quot;');
assert.equal(highlight('What?',null),'What?');
assert.equal(highlight('How much?','HOW MANY'),'How much?');
assert.equal(highlight('A+B?','A+B'),'<strong class="study-target-word">A+B</strong>?');
for(const [word,dimension] of [['what','object-answer'],['why','reason-answer']]){
 const source=fs.readFileSync('js/verb-explorer-'+word+'-assessment-live.js','utf8');
 assert.ok(source.includes("if(spec.dimension==='"+dimension+"'&&targetPresentation)"),'function-identification tests must stay neutral');
 assert.ok(source.includes("item.questionWord==='"+word+"'"),'probe target belongs to its own word, not current exploration');
}
console.log('PASS: canonical EN/ES/PT labels, compound QWords, Unicode boundaries, escaping and neutral function probes.');
