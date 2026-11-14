import { expect, test, type Page } from '@playwright/test';

async function beginFreshMission(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('board-e2e-initialized')) return;
    localStorage.clear();
    localStorage.setItem('outpost-language', 'en');
    sessionStorage.setItem('board-e2e-initialized', 'yes');
  });
  await page.goto('/');
  await expect(page.locator('#lobby-start')).toBeVisible();
  await page.locator('#lobby-start').evaluate((element: HTMLElement) => element.click());
  await expect(page.locator('#mission-board')).toBeVisible();
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'site');
  await page.evaluate(() => window.__OUTPOST_QA__!.ready());
}

async function boardPoint(page: Page, kind: 'base' | 'site' | 'antenna' | 'classification' | 'port', index = 0) {
  return page.evaluate(({target, targetIndex}: {target:'base' | 'site' | 'antenna' | 'classification' | 'port';targetIndex:number}) => window.__OUTPOST_QA__!.boardPoint(target, targetIndex), {target:kind,targetIndex:index});
}

async function dragBoardObject(page: Page, from: {x:number;y:number}, to: {x:number;y:number}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

async function clickBoardMesh(page: Page, kind: 'classification' | 'port', index: number) {
  const point = await boardPoint(page, kind, index);
  await page.mouse.click(point.x, point.y);
}

async function clickBoardAction(page: Page, id: string) {
  await page.locator(`[data-testid="${id}"]`).evaluate((element: HTMLElement) => element.click());
}

test('fresh save completes the five-turn physical board and restores its certificate', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await beginFreshMission(page);

  // The player moves the habitat token to a real 3D candidate pad.
  await dragBoardObject(page, await boardPoint(page, 'base'), await boardPoint(page, 'site', 0));
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().site)).not.toBe('');
  await clickBoardAction(page, 'confirm-site');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'event');

  // The antenna is a real gimbal. Drag it through the target area, then choose a disclosed game response.
  const antenna = await boardPoint(page, 'antenna');
  await dragBoardObject(page, antenna, { x: antenna.x + 190, y: antenna.y });
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().antenna)).toBeGreaterThanOrEqual(.52);
  await clickBoardAction(page, 'event-protect');
  await clickBoardAction(page, 'confirm-event');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'evidence');

  // Classify the actual 3D evidence tile, then connect the two physical repair ports.
  await clickBoardMesh(page, 'classification', 1);
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().evidence)).toBe('infer');
  await clickBoardAction(page, 'confirm-evidence');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'repair');
  await clickBoardMesh(page, 'port', 0);
  await clickBoardMesh(page, 'port', 1);
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().repairLinked)).toBe(true);
  await clickBoardAction(page, 'confirm-repair');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'finale');

  await clickBoardAction(page, 'priority-energy');
  await clickBoardAction(page, 'priority-water');
  await clickBoardAction(page, 'complete-mission');
  await expect(page.getByTestId('mission-certificate')).toBeVisible();
  await clickBoardAction(page, 'view-certificate');
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().completed)).toEqual(['site','event','evidence','repair','finale']);
  expect(errors).toEqual([]);

  await page.evaluate(() => sessionStorage.setItem('board-e2e-initialized', 'yes'));
  await page.reload();
  await page.locator('#lobby-start').evaluate((element: HTMLElement) => element.click());
  await expect(page.getByTestId('mission-certificate')).toBeVisible();
  await expect(page.locator('[data-testid="mission-record-title"]')).toContainText('complete');
});

test('board remains within phone, tablet and landscape viewports and retains language', async ({ page }) => {
  await beginFreshMission(page);
  for (const viewport of [{width:375,height:812},{width:768,height:1024},{width:1024,height:768}]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('[data-testid="current-task"]')).toBeVisible();
  }
  const beforeText = await page.locator('.physical-board-step h2').textContent();
  await page.getByTestId('board-language-toggle').evaluate((element: HTMLElement) => element.click());
  const afterText = await page.locator('.physical-board-step h2').textContent();
  expect(afterText).not.toBe(beforeText);
  await page.reload();
  await page.locator('#lobby-start').evaluate((element: HTMLElement) => element.click());
  await expect(page.locator('.physical-board-step h2')).toHaveText(afterText!);
});
