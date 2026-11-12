import { studyPaperClick } from './study-paper';
import { expect, test } from '@playwright/test';
import { curriculum } from '../src/game/Curriculum';
import { questionOrder } from '../src/game/QuestionOrder';

test('final alert and questions lead to the game certificate',async({page},info)=>{
 test.setTimeout(180_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:6,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:['recycle','science']}));
  const state={power:72,water:68,food:54,health:100,propellant:82,shielding:0,sol:3,cycle:3,planned:true,craftReady:true,commsReady:true,navReady:true,data:30,discoveries:1,eventOpen:true,paused:false,commandSpent:false,lastCommandAt:0};const settings={power:.5,craft:.5,science:.5,aim:.5,navigate:.5,plan:.5,analyze:.5};const activeEvent={id:'shadow-training',title:'eventDust',note:'noteDust',source:'sourceScenario',effects:{power:-12},kind:'education'};localStorage.setItem('outpost-mission-progress-v2',JSON.stringify({snapshot:{version:1,state,settings,commandCount:0,activeEvent}}));
 });
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 if(!mobile){await page.keyboard.press('a');await page.keyboard.press('a');await page.waitForTimeout(3000);}
 const cdp=mobile?await page.context().newCDPSession(page):null;
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:220,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(3000);}
 const point=()=>page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('shelter'));const tap=async()=>{const p=await point();if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(2000);};
 await tap();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:15000}).toBe('shelter');await page.waitForTimeout(4000);
 await tap();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.safetyOpen())).toBe(true);await tap();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);await page.waitForTimeout(5000);
 const lesson=()=>page.evaluate(()=>window.__OUTPOST_QA__!.lesson());const paper=async(x:number,y:number)=>{await studyPaperClick(page,mobile,x,y);await page.waitForTimeout(1500);};
 await expect.poll(async()=>(await lesson()).phase).toBe('reflection');await paper(300,350);await paper(800,710);await expect.poll(async()=>(await lesson()).phase).toBe('quiz');
 for(const q of curriculum.finale.questions){const slot=questionOrder(q.id).indexOf(q.correct);await paper(300,350+slot*96);await page.waitForTimeout(1000);await paper(800,710);}
 await expect.poll(async()=>(await lesson()).finished,{timeout:15000}).toBe(true);expect(errors).toEqual([]);
});
