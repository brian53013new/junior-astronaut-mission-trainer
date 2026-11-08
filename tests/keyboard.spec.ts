import { expect, test } from '@playwright/test';

test('A and arrow keys move laterally in the welcome room and study room', async ({page},info) => {
  test.skip(info.project.name.includes('mobile'), 'Physical keyboard navigation is checked on desktop.');
  test.setTimeout(90_000);
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);
  await page.waitForTimeout(2500);
  const cameraX=()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().x);
  const initial=await cameraX();
  await page.keyboard.press('ArrowRight');
  await expect.poll(cameraX,{timeout:15000}).toBeGreaterThan(initial+.25);
  await page.keyboard.press('a');
  await expect.poll(cameraX,{timeout:15000}).toBeLessThan(initial+.2);
  await page.reload();
  await page.evaluate(()=>localStorage.setItem('outpost-welcome-3d-v1','done'));
  await page.reload();await page.locator('#lobby-start').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().quiz),{timeout:20000}).toBe(true);
  await page.waitForTimeout(1500);const study=await cameraX();
  await page.keyboard.press('d');await expect.poll(cameraX,{timeout:15000}).toBeGreaterThan(study+.12);
  await page.keyboard.press('ArrowLeft');await expect.poll(cameraX,{timeout:15000}).toBeLessThan(study+.1);
});

test('A and D pan the main control desk after leaving a focused device', async ({page},info) => {
  test.skip(info.project.name.includes('mobile'), 'Physical keyboard navigation is checked on desktop.');
  test.setTimeout(90_000);
  await page.addInitScript(()=>{
    localStorage.setItem('outpost-welcome-3d-v1','done');
    localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
  });
  await page.goto('/?qa=1');await page.locator('#lobby-start').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(false);
  await page.waitForTimeout(3500);
  const p=await page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('power'));
  await page.mouse.move(p.x,p.y);await page.waitForTimeout(1500);await page.mouse.click(p.x,p.y);
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:10000}).toBe('power');
  await page.waitForTimeout(2500);
  await page.keyboard.press('d');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction())).toBeNull();
  await page.waitForTimeout(2000);
  const cameraX=()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().x);const before=await cameraX();
  await page.keyboard.press('d');await expect.poll(cameraX,{timeout:15000}).toBeGreaterThan(Math.max(before+.25,1));
  const afterRight=await cameraX();await page.keyboard.press('ArrowLeft');await expect.poll(cameraX,{timeout:15000}).toBeLessThan(afterRight-.25);
});
