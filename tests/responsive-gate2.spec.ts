import { expect, test } from '@playwright/test';

const viewports=[{width:375,height:812},{width:768,height:1024},{width:1024,height:768}];
for(const viewport of viewports){
 test(`Gate 2 responsive settings persist at ${viewport.width}x${viewport.height}`,async({page})=>{
  test.setTimeout(60_000);await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.setItem('outpost-welcome-3d-v1','done'));
  await page.goto('/?qa=1');await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>Boolean(window.__OUTPOST_QA__))).toBe(true);await page.evaluate(()=>window.__OUTPOST_QA__!.ready());
  await page.locator('.settings-gear').click();const scale=page.locator('[data-input="text"]');await scale.selectOption('large');await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-text-scale').trim())).toBe('1.5');await scale.selectOption('xlarge');await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-text-scale').trim())).toBe('2');
  await page.locator('[data-action="language"]').click();const savedLanguage=await page.evaluate(()=>localStorage.getItem('outpost-language'));expect(savedLanguage).toBeTruthy();expect(await page.locator('#game-canvas').evaluate(el=>{const r=el.getBoundingClientRect();return{width:r.width,height:r.height}})).toEqual({width:viewport.width,height:viewport.height});
  await page.reload();await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>Boolean(window.__OUTPOST_QA__))).toBe(true);await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await expect(page.locator('html')).toHaveAttribute('lang',savedLanguage==='zh'?'zh-Hant':'en');await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-text-scale').trim())).toBe('2');
 });
}
