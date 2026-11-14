import { expect, test } from '@playwright/test';

test('mobile study sheet uses the saved lesson and remains usable at 200% text', async ({page, isMobile}) => {
  test.skip(!isMobile, 'The accessible sheet is the compact/touch presentation.');
  test.setTimeout(60_000);
  await page.addInitScript(()=>{
    localStorage.setItem('outpost-welcome-3d-v1','done');
    localStorage.setItem('outpost-text-size','xlarge');
    localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:0,awaiting:false,finished:false,reading:true,readingPage:0,questionIndex:0,feedbackChoice:null,reflectionComplete:true,reflectionChoice:null,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
  });
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  const sheet=page.locator('#reading-panel');
  await expect(sheet).toBeVisible({timeout:15_000});
  await expect(sheet).toContainText(/打造探測器|Build a probe/);
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.textScale())).toBe(2);
  const subtitlePadding=await page.locator('#dialogue').evaluate(el=>parseFloat(getComputedStyle(el).paddingLeft));
  expect(subtitlePadding).toBeGreaterThanOrEqual(68);
  const layout=await sheet.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth,rect:el.getBoundingClientRect().toJSON(),viewport:innerWidth}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.client+1);
  expect(layout.rect.left).toBeGreaterThanOrEqual(0);
  expect(layout.rect.right).toBeLessThanOrEqual(layout.viewport+1);
  await sheet.locator('.reading-primary').click();
  await expect(sheet).toContainText(/教材 2 \/ 4|TEXTBOOK 2 \/ 4/);
  expect(await page.evaluate(()=>window.__OUTPOST_QA__!.lesson().page)).toBe(1);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('outpost-learning-journey-v2')!).readingPage)).toBe(1);
  await sheet.getByRole('button',{name:/Back to cabin|返回艙內/}).click();
  await expect(sheet).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz)).toBe(false);
});
