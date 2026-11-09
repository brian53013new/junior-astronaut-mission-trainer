import { expect, test } from '@playwright/test';

test('NOVA introduces herself before the controls and can be skipped', async ({page}) => {
  test.setTimeout(60_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  await expect(page.locator('#intro-skip')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().intro)).toBe(true);
  await page.waitForTimeout(1500);
  await expect(page.locator('#dialogue-copy')).toContainText(/NOVA/,{timeout:5000});
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().step)).toBe(0);
  await page.locator('#intro-skip').click();
  await expect(page.locator('#intro-skip')).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().intro)).toBe(false);
  expect(errors).toEqual([]);
});

test('returning players can replay the welcome without erasing saved progress', async ({page})=>{
  test.setTimeout(60_000);
  await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-welcome-3d-step','4');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
  await page.goto('/?qa=1');await page.locator('#lobby-replay').click();
  await expect(page.locator('#intro-skip')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('outpost-welcome-3d-v1'))).toBe('done');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('outpost-learning-journey-v2')!).index)).toBe(1);
  await page.locator('#intro-skip').click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().step)).toBe(0);
});

test('introduction continues automatically into practice',async ({page})=>{
  test.setTimeout(60_000);await page.goto('/?qa=1');await page.locator('#lobby-start').click();
  await expect(page.locator('#intro-skip')).toBeVisible();
  await expect(page.locator('#dialogue-copy')).toContainText(/lunar base|月球基地/,{timeout:15000});
  await expect(page.locator('#intro-skip')).toBeHidden({timeout:15000});
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().step)).toBe(0);
});
