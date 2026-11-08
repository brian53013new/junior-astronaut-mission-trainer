import { expect, test } from '@playwright/test';

test('physical welcome controls lead to the first lesson', async ({page}, testInfo) => {
  test.setTimeout(180_000);
  const errors:string[]=[];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);
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
  await paperClick(800,710);await expect.poll(async()=>(await lesson()).reading).toBe(false);
  expect(errors).toEqual([]);
});
