import { expect, test } from '@playwright/test';

test('repair lesson matches circuits and progresses to reflection',async({page},info)=>{
 test.setTimeout(160_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:5,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const cdp=mobile?await page.context().newCDPSession(page):null;
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(3000);}
 const point=(x:number,y:number)=>page.evaluate(([a,b])=>window.__OUTPOST_QA__!.screenPoint('telemetry',a,b),[x,y]);
 const tap=async(x:number,y:number)=>{const p=await point(x,y);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(2000);};
 await tap(320,200);await page.waitForTimeout(mobile?12000:5000);await tap(550,22);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().mode),{timeout:10000}).toBe('repair');
 for(let i=0;i<3;i++){
  const a=await point(130,98+i*60),b=await point(500,98+[2,0,1][i]*60);
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();}
  await expect.poll(()=>page.evaluate(index=>window.__OUTPOST_QA__!.workshop().parts[index],i),{timeout:10000}).toBe(true);
 }
 await tap(315,334);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
 const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.water).toBe(65);expect(state.power).toBe(84);expect(errors).toEqual([]);
});
