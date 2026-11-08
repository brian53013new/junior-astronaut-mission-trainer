import assert from 'node:assert/strict';
import { Journey, lessons } from '../src/game/Journey.ts';
import { curriculum } from '../src/game/Curriculum.ts';
import { activities } from '../src/game/LearningActivities.ts';
import { DialogueState } from '../src/game/DialogueState.ts';
import { devices } from '../src/game/DeviceCatalog.ts';
const j=new Journey();
for(const [i,lesson] of lessons.entries()){
 assert.equal(j.index,i);assert.equal(j.phase,'reading');const data=curriculum[lesson.id];assert.equal(data.pages.length,4);assert.equal(data.questions.length,3);
 j.openQuestion();const mid=new Journey();assert.equal(mid.restore(j.snapshot()),true);assert.equal(mid.readingPage,1);assert.equal(mid.phase,'reading');
 if(lesson.id==='explore'){assert.equal(j.openQuestion(),false);j.setClue(0,0);j.setClue(1,1);}if(lesson.id==='repair'){assert.equal(j.openQuestion(),false);j.setClue(0,0);}
 assert.equal(j.openQuestion(),true);assert.equal(j.readingPage,2);assert.equal(j.openQuestion(),false);assert.equal(j.setPrediction(1),true);const predicted=new Journey();assert.equal(predicted.restore(j.snapshot()),true);assert.equal(predicted.prediction,1);assert.equal(j.openQuestion(),true);assert.equal(j.phase,'operation');
 if(lesson.id==='finale'){assert.equal(j.observe('recycle'),false);assert.equal(j.observe('science'),false);assert.equal(j.observe('shelter'),true);}else assert.equal(j.observe(lesson.action),true);
 assert.equal(j.reflectionPending,true);assert.equal(j.answer(0),'invalid');const correct=activities[lesson.id].correct;assert.equal(j.chooseReflection((correct+1)%3),true);assert.equal(j.finishReflection(),false);assert.equal(j.chooseReflection(correct),true);if(lesson.id==='plan'){assert.equal(j.finishReflection(),false);j.setPlanReflection('reason',0);j.setPlanReflection('caution',1);}j.saveReflectionNote('我的理由');const saved=new Journey();assert.equal(saved.restore(j.snapshot()),true);assert.equal(saved.reflectionChoice,correct);assert.equal(saved.records.at(-1).reflectionNote,'我的理由');assert.equal(j.finishReflection(),true);
 for(const [n,q] of data.questions.entries()){
  assert.equal(j.questionIndex,n);assert.equal(j.question.id,q.id);const wrong=(q.correct+1)%3;assert.equal(j.answer(wrong),'wrong');assert.equal(j.phase,'review');assert.equal(j.answer(q.correct),'feedback');assert.equal(j.answer(q.correct),'invalid');
  const resumed=new Journey();assert.equal(resumed.restore(j.snapshot()),true);assert.equal(resumed.feedbackChoice,q.correct);assert.equal(resumed.questionIndex,n);
  const result=j.nextQuestion();assert.equal(result,n<2?'next':i===lessons.length-1?'finished':'correct');
 }
}
assert.equal(j.finished,true);assert.equal(j.records.length,lessons.length);assert.ok(j.records.every(r=>r.completed&&r.attempts===3));assert.equal(Object.keys(devices).length,15);
const d=new DialogueState(),e={id:'intro',lesson:'assembly',trigger:'intro',priority:1,zh:'你好',en:'Hello'};
assert.equal(d.request(e,'zh'),'你好');assert.equal(d.request(e,'zh'),null);d.complete();const saved=d.snapshot(),copy=new DialogueState();copy.restore(saved);assert.equal(copy.request(e,'zh'),null);assert.equal(copy.request(e,'en'),'Hello');
console.log('Curriculum checks passed: 7 courses, predictions, reflection, 21 questions, retries, save/resume and dialogue deduplication.');
