import { test, expect } from '@playwright/test';

test('touch release activates the welcome control without a synthesized click', async ({ page }, info) => {
  test.skip(!info.project.name.includes('mobile'), 'Exercises touch input.');
  test.setTimeout(90000);
  await page.goto('/?qa=1');
  await page.locator('#lobby-start').click();
  await page.locator('#intro-skip').click();
  await page.waitForTimeout(1500);
  await page.locator('#welcome-move [aria-label="ArrowUp"]').click();
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.welcome().step)).toBe(1);
  await page.waitForTimeout(3500);
  const dispatchTap = async () => {
    const p = await page.evaluate(() => window.__OUTPOST_QA__!.welcomePosition('button'));
    await page.evaluate(({x,y}) => {
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
      const opts = { bubbles:true, pointerId:41, pointerType:'touch', isPrimary:true, clientX:x, clientY:y, button:0 };
      canvas.dispatchEvent(new PointerEvent('pointerdown', opts));
      canvas.dispatchEvent(new PointerEvent('pointerup', opts));
    }, p);
  };
  await dispatchTap();
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.welcome().focus)).toBe('button');
  const p = await page.evaluate(() => window.__OUTPOST_QA__!.welcomePosition('button'));
  await page.locator('#game-canvas').dispatchEvent('click', {clientX:p.x,clientY:p.y});
  expect((await page.evaluate(() => window.__OUTPOST_QA__!.welcome())).step).toBe(1);
  await page.waitForTimeout(2000);
  await dispatchTap();
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.welcome().step)).toBe(2);
  expect(await page.locator('#dialogue').evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
});
