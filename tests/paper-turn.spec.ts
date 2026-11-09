import {test,expect} from '@playwright/test';

test('dragging a page edge turns the learning paper in either direction',async({page},info)=>{
 test.setTimeout(60_000);await page.addInitScript(()=>localStorage.setItem('outpost-welcome-3d-v1','done'));await page.goto('/?qa=1');await page.locator('#lobby-start').click();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().quiz),{timeout:20000}).toBe(true);await page.waitForTimeout(1800);
 const pos=(x:number)=>page.evaluate(x=>window.__OUTPOST_QA__!.paperPosition(x,390),x);
 const mobile=info.project.name.includes('mobile');const cdp=mobile?await page.context().newCDPSession(page):null;
 async function turn(from:number,to:number){const a=await pos(from),b=await pos(to);if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:5});await page.mouse.up();}}
 await turn(950,350);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.lesson().page)).toBe(1);await page.waitForTimeout(500);await turn(70,650);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.lesson().page)).toBe(0);
});
