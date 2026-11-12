import { expect, test } from '@playwright/test';

test('zoom is available by default and an explicit preference persists',async({page})=>{
 test.setTimeout(60_000);
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);await page.locator('#intro-skip').click();await page.waitForTimeout(1200);
 await page.locator('.settings-gear').click();await page.locator('[data-action="project-info"]').click();await expect(page.locator('#project-info')).toBeVisible();await expect(page.locator('#project-info')).toContainText(/目前沒有載入 NASA|No NASA space-weather event is loaded/);await expect(page.locator('#project-info')).toContainText(/NASA LRO/);await page.locator('#project-info [data-close]').click();
 await page.locator('.settings-gear').click();const zoom=page.locator('[data-input="zoom"]');await expect(zoom).toBeChecked();
 await zoom.uncheck();expect(await page.evaluate(()=>localStorage.getItem('outpost-zoom-enabled'))).toBe('false');
 await page.evaluate(()=>{localStorage.removeItem('outpost-welcome-3d-v1');localStorage.removeItem('outpost-welcome-3d-step');localStorage.removeItem('outpost-learning-journey-v2');});await page.reload();await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.welcome().active)).toBe(true);await page.locator('#intro-skip').click();await page.waitForTimeout(1200);
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
