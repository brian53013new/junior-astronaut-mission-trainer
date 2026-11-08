import { expect, test, type Page } from '@playwright/test';

type State = { power:number;water:number;food:number;health:number;sol:number;eventOpen:boolean;paused:boolean;commandSpent:boolean;commandCount:number };

async function qa(page:Page){await page.goto('/?qa=1');await expect(page.locator('#game-canvas')).toBeVisible();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());}
async function state(page:Page){return page.evaluate(()=>window.__OUTPOST_QA__!.state() as State);}
async function aimDesk(page:Page,action:string){
  // Let the view return from the previous focus, then aim using the live camera projection.
  await page.mouse.move(0,0);await page.waitForTimeout(500);
  let p=await page.evaluate((a)=>window.__OUTPOST_QA__!.screenPosition(a),action);
  let pointed:string|null=null;for(let i=0;i<12;i++){await page.mouse.move(p.x,p.y);await page.waitForTimeout(100);pointed=await page.evaluate(()=>window.__OUTPOST_QA__!.hoveredAction());if(pointed===action)break;p=await page.evaluate((a)=>window.__OUTPOST_QA__!.screenPosition(a),action);}
  expect(pointed,`pointer should target ${action}`).toBe(action);
  return p;
}
async function clickDesk(page:Page,action:string){
  const p=await aimDesk(page,action);await page.mouse.click(p.x,p.y);await page.waitForTimeout(160);
}
async function dragDesk(page:Page,action:string,dx=36,dy=0,restore=false){
  const p=await aimDesk(page,action);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y+dy,{steps:4});if(restore)await page.mouse.move(p.x,p.y,{steps:4});await page.mouse.up();await page.waitForTimeout(300);
}

test('tutorial reaches an observation, bounded focus returns, and replay preserves the mission',async({page},testInfo)=>{
  test.skip(testInfo.project.name.includes('mobile'),'Full walkthrough is covered on desktop; mobile controls have their own test.');
  test.setTimeout(600_000);
  await qa(page);
  await aimDesk(page,'power');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.guide().step),{timeout:20_000}).toBe(2);
  await page.waitForTimeout(2000);
  const first=await page.evaluate(()=>window.__OUTPOST_QA__!.camera());
  await page.waitForTimeout(2500);
  const second=await page.evaluate(()=>window.__OUTPOST_QA__!.camera());
  expect(Math.abs(second.z-first.z)).toBeLessThan(.08);
  expect(second.z).toBeGreaterThanOrEqual(second.baseZ-.61);
  await page.keyboard.press('Escape');await page.waitForTimeout(1800);
  const restored=await page.evaluate(()=>window.__OUTPOST_QA__!.camera());
  expect(Math.abs(restored.z-restored.baseZ)).toBeLessThan(.2);
  let resumeChecked=false;
  for(let i=0;i<32;i++){
    const guide=await page.evaluate(()=>window.__OUTPOST_QA__!.guide());
    if(guide.step>=5)break;
    expect(guide.target).not.toBeNull();
    const target=guide.target!;
    if(['power','plan','craft','navigate','science'].includes(target))await dragDesk(page,target,12,0,true);
    else await clickDesk(page,target);
    if(target==='power'&&!resumeChecked){const beforeReload=await state(page);await page.reload();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());const afterReload=await state(page);expect(afterReload.power).toBe(beforeReload.power);expect(afterReload.water).toBe(beforeReload.water);expect(afterReload.sol).toBe(beforeReload.sol);expect(afterReload.commandSpent).toBe(beforeReload.commandSpent);expect((await page.evaluate(()=>window.__OUTPOST_QA__!.guide())).step).toBe(2);resumeChecked=true;}
  }
  expect((await page.evaluate(()=>window.__OUTPOST_QA__!.guide())).step).toBe(5);
  expect((await page.evaluate(()=>window.__OUTPOST_QA__!.state())).discoveries).toBe(1);
  const before=await state(page);
  await page.locator('#tour-replay').click();
  await expect(page.locator('#coach')).toBeVisible();
  await page.locator('#coach-skip').click();
  expect(await state(page)).toEqual(before);
});

test('3D console operates mission systems once per sol and advances an event',async({page})=>{
  test.setTimeout(180_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await qa(page);
  await dragDesk(page,'power');
  let s=await state(page);expect(s.power).toBe(92);expect(s.water).toBe(65);expect(s.commandSpent).toBe(true);
  const powerPoint=await page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('power'));await page.mouse.click(powerPoint.x,powerPoint.y);s=await state(page);expect(s.power).toBe(92);expect(s.water).toBe(65);expect(s.commandCount).toBe(1);
  await clickDesk(page,'advance');expect((await state(page)).sol).toBe(2);
  await clickDesk(page,'advance');expect((await state(page)).eventOpen).toBe(true);
  expect((await state(page)).sol).toBe(3);
  await clickDesk(page,'continue');s=await state(page);expect(s.eventOpen).toBe(false);expect(s.health).toBe(88);
  expect(errors).toEqual([]);
});

test('language switches completely and mobile layout stays within viewport',async({page},testInfo)=>{
  test.setTimeout(90_000);
  await qa(page);
  const toggle=page.locator('#language-toggle');await expect(toggle).toHaveText('繁中');
  await toggle.click();await expect(toggle).toHaveText('English');await expect(page.locator('.flight-panel .eyebrow').first()).toHaveText('今日任務簡報');
  expect(await page.evaluate(()=>window.__OUTPOST_QA__!.language())).toBe('zh');
  if(testInfo.project.name.includes('mobile')){
    const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.clientHeight,canvas:document.querySelector('canvas')!.getBoundingClientRect().toJSON()}));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);expect(dimensions.canvas.width).toBe(dimensions.width);expect(dimensions.canvas.height).toBe(dimensions.height);
    await dragDesk(page,'power');const s=await state(page);expect(s.power).toBe(92);expect(s.water).toBe(65);
  }
});
