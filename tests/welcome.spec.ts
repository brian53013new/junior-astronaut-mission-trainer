import { expect, test } from '@playwright/test';
import { curriculum } from '../src/game/Curriculum';
import { questionOrder } from '../src/game/QuestionOrder';

test('physical welcome controls lead to the first lesson', async ({page}, testInfo) => {
  test.setTimeout(300_000);
  const errors:string[]=[];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);
  await page.locator('#intro-skip').click();
  await page.waitForTimeout(1200); // Let the lobby transition finish before moving the view.
  const mobile=testInfo.project.name.includes('mobile');
  const cdp=mobile?await page.context().newCDPSession(page):null;
  const drag=async(x:number,y:number,dx:number)=>{
    if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else {await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y,{steps:8});await page.mouse.up();}
  };
  if(mobile)await page.locator('#welcome-move [aria-label="ArrowUp"]').click();else await page.mouse.move(700,360);
  const state=()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome());
  const position=(name:'button'|'knob'|'switch'|'book'|'door')=>page.evaluate(n=>window.__OUTPOST_QA__!.welcomePosition(n),name);
  const click=async(name:'button'|'knob'|'switch'|'book'|'door')=>{
    await page.waitForTimeout(2500);
    await expect.poll(async()=>{const p=await position(name);return p.x>15&&p.x<page.viewportSize()!.width-15&&p.y>15&&p.y<page.viewportSize()!.height-15;},{timeout:20000}).toBe(true);
    await page.waitForTimeout(1200);const p=await position(name);
    expect(p.x,`${name} must be within the viewport`).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(page.viewportSize()!.width);
    if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
    await page.waitForTimeout(1000);
  };
  await expect.poll(async()=>(await state()).step).toBe(1);
  await click('button');await click('button');
  await expect.poll(async()=>(await state()).step).toBe(2);
  await click('knob');await page.waitForTimeout(2500);const knob=await position('knob');await drag(knob.x,knob.y,90);
  await expect.poll(async()=>(await state()).step).toBe(3);
  await click('switch');await click('switch');await expect.poll(async()=>(await state()).step).toBe(4);
  await click('book');await click('book');await expect.poll(async()=>(await state()).step).toBe(5);
  await page.locator('#zoom-controls button').first().click();await expect.poll(async()=>(await state()).step).toBe(6);
  await click('door');await click('door');await expect.poll(async()=>(await state()).quiz,{timeout:15000}).toBe(true);
  const lesson=()=>page.evaluate(()=>window.__OUTPOST_QA__!.lesson());
  expect((await lesson()).id).toBe('assembly');
  const paperClick=async(x:number,y:number)=>{await page.waitForTimeout(2500);const p=await page.evaluate(([a,b])=>window.__OUTPOST_QA__!.paperPosition(a,b),[x,y]);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);};
  await paperClick(800,710);await expect.poll(async()=>(await lesson()).page).toBe(1);
  await paperClick(800,710);await expect.poll(async()=>(await lesson()).page).toBe(2);
  await paperClick(300,360);await expect.poll(async()=>(await lesson()).prediction).not.toBeNull();
  const prediction=(await lesson()).prediction;
  await paperClick(800,710);await expect.poll(async()=>(await lesson()).reading).toBe(false);await expect.poll(async()=>(await state()).quiz,{timeout:15000}).toBe(false);await page.waitForTimeout(5000);
  const screen=(x:number,y:number)=>page.evaluate(([a,b])=>window.__OUTPOST_QA__!.screenPoint('map',a,b),[x,y]);
  const screenTap=async(x:number,y:number)=>{const p=await screen(x,y);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(1800);};
  await screenTap(320,200);await page.waitForTimeout(5000);await screenTap(468,22);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().mode)).toBe('assembly');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().active)).toBe(true);await page.waitForTimeout(2500);for(let i=0;i<3;i++){const a=await page.evaluate(i=>window.__OUTPOST_QA__!.assemblyPoint('part',i),i),b=await page.evaluate(i=>window.__OUTPOST_QA__!.assemblyPoint('socket',i),i);if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();}await expect.poll(()=>page.evaluate(index=>window.__OUTPOST_QA__!.workshop().parts[index],i)).toBe(true);}
  {const p=await page.evaluate(()=>window.__OUTPOST_QA__!.assemblyPoint('activate',0));if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);}await expect.poll(async()=>(await state()).quiz,{timeout:15000}).toBe(true);await page.waitForTimeout(4500);expect((await lesson()).prediction).toBe(prediction);
  await paperClick(300,350);await paperClick(800,710);
  const first=curriculum.assembly.questions[0];const wrong=questionOrder(first.id).findIndex(answer=>answer!==first.correct);await paperClick(300,350+wrong*96);await expect.poll(async()=>(await lesson()).phase).toBe('review');await paperClick(800,710);
  for(const q of curriculum.assembly.questions){const slot=questionOrder(q.id).indexOf(q.correct);await paperClick(300,350+slot*96);await paperClick(800,710);}
  await expect.poll(async()=>(await lesson()).id,{timeout:15000}).toBe('plan');await page.reload();await page.locator('#lobby-start').click();await expect.poll(async()=>(await lesson()).id,{timeout:15000}).toBe('plan');
  expect(errors).toEqual([]);
});
