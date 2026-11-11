import { expect, test } from '@playwright/test';

test('zoom is available by default and an explicit preference persists',async({page})=>{
 test.setTimeout(60_000);
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);await page.locator('#intro-skip').click();await page.waitForTimeout(1200);
 await page.locator('.settings-gear').click();const zoom=page.locator('[data-input="zoom"]');await expect(zoom).toBeChecked();
 await zoom.uncheck();expect(await page.evaluate(()=>localStorage.getItem('outpost-zoom-enabled'))).toBe('false');
 await page.reload();await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);await page.locator('#intro-skip').click();await page.waitForTimeout(1200);
 await page.locator('.settings-gear').click();await expect(page.locator('[data-input="zoom"]')).not.toBeChecked();
});


test('text scale reaches 200 percent, updates the readable 3D text systems, and persists',async({page})=>{
 test.setTimeout(60_000);
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);await page.locator('#intro-skip').click();await page.waitForTimeout(1200);
 await page.locator('.settings-gear').click();await page.locator('[data-input="text"]').selectOption('xlarge');
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.textScale())).toBe(2);
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-text-scale').trim())).toBe('2');
 await page.reload();await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);
 await page.locator('#intro-skip').click();await page.waitForTimeout(1200);await page.locator('.settings-gear').click();
 await expect(page.locator('[data-input="text"]')).toHaveValue('xlarge');
});
