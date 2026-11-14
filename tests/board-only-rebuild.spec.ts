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
  await expect(page.locator('#lobby .lobby-actions button')).toHaveCount(5);
  await expect(page.locator('#welcome-flow, #welcome-room, #course-selector, #lesson-selector, #welcome-move, #welcome-text-mode, #intro-skip')).toHaveCount(0);
  await page.locator('#lobby-start').evaluate((element: HTMLElement) => element.click());
  await expect(page.locator('#mission-board')).toBeVisible();
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'site');
  await page.evaluate(() => window.__OUTPOST_QA__!.ready());
}

async function boardPoint(page: Page, kind: 'base' | 'site' | 'source' | 'antenna' | 'classification' | 'port' | 'screen', index = 0) {
  return page.evaluate(({target, targetIndex}: {target:'base' | 'site' | 'source' | 'antenna' | 'classification' | 'port' | 'screen';targetIndex:number}) => window.__OUTPOST_QA__!.boardPoint(target, targetIndex), {target:kind,targetIndex:index});
}

async function dragBoardObject(page: Page, from: {x:number;y:number}, to: {x:number;y:number}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

async function clickBoardMesh(page: Page, kind: 'source' | 'classification' | 'port', index: number) {
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
  await expect(page.locator('.board-tutorial-callout')).toBeVisible();
  await expect(page.locator('.physical-board-task')).not.toContainText('°');
  await dragBoardObject(page, await boardPoint(page, 'base'), await boardPoint(page, 'site', 0));
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().site)).not.toBe('');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '1');
  await clickBoardMesh(page, 'source', 0);
  await expect(page.locator('.source-drawer')).toBeVisible();
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '1');
  await page.getByTestId('source-find-clue').click();
  await expect(page.locator('.source-detail a')).toBeVisible();
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '2');
  await page.locator('.source-close').evaluate((element: HTMLElement) => element.click());
  const tutorialAntenna = await boardPoint(page, 'antenna');
  await dragBoardObject(page, tutorialAntenna, {x:tutorialAntenna.x+190,y:tutorialAntenna.y});
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '3');
  await clickBoardAction(page, 'confirm-site');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-done', 'true');
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

test('board remains within phone, tablet and landscape viewports and retains language', async ({ page }, testInfo) => {
  await beginFreshMission(page);
  await page.getByTestId('skip-board-tutorial').evaluate((element: HTMLElement) => element.click());
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-done', 'true');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'site');
  await page.getByTestId('replay-board-tutorial').evaluate((element: HTMLElement) => element.click());
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '0');
  await expect(page.locator('.board-tutorial-callout')).toBeVisible();
  const headerBottom=await page.locator('.physical-board-head nav').evaluate((element:HTMLElement)=>element.getBoundingClientRect().bottom);
  const guideTop=await page.locator('.physical-board-step').evaluate((element:HTMLElement)=>element.getBoundingClientRect().top);
  expect(headerBottom).toBeLessThanOrEqual(guideTop);
  const boardBeforeFocus = await page.evaluate(() => window.__OUTPOST_QA__!.missionBoard());
  const viewport = page.viewportSize()!;
  if(testInfo.project.name==='desktop-chrome'){
    await page.mouse.move(viewport.width * .08, viewport.height * .5);
    expect(await page.evaluate(({x,y})=>window.__OUTPOST_QA__!.boardHitKind(x,y),{x:viewport.width*.08,y:viewport.height*.5})).toBeNull();
    await expect.poll(() => page.evaluate(() => Math.abs(window.__OUTPOST_QA__!.missionBoard().parallax.yaw))).toBeGreaterThan(.005);
    await expect.poll(() => page.evaluate(() => Math.abs(window.__OUTPOST_QA__!.missionBoard().parallax.yaw))).toBeLessThanOrEqual(.071);
  }
  const focusPoint = await boardPoint(page, 'screen');
  expect(await page.evaluate(({x,y}) => window.__OUTPOST_QA__!.boardHitKind(x,y),focusPoint)).toBe('screen');
  const overviewCamera=await page.evaluate(()=>window.__OUTPOST_QA__!.camera());
  if(testInfo.project.name==='mobile-chrome')await page.touchscreen.tap(focusPoint.x,focusPoint.y);
  else await page.mouse.click(focusPoint.x, focusPoint.y);
  await expect(page.locator('#mission-board')).toHaveAttribute('data-sources-open', 'true');
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().cameraMode)).toBe('focus-screen');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().y)).toBeLessThan(overviewCamera.y-.1);
  const focusCamera=await page.evaluate(()=>window.__OUTPOST_QA__!.camera());
  await page.locator('.source-close').evaluate((element: HTMLElement) => element.click());
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().cameraMode)).toBe('overview');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().y)).toBeGreaterThan(focusCamera.y+.1);
  const boardAfterFocus = await page.evaluate(() => window.__OUTPOST_QA__!.missionBoard());
  expect(boardAfterFocus.phase).toBe(boardBeforeFocus.phase);
  expect(boardAfterFocus.site).toBe(boardBeforeFocus.site);
  expect(boardAfterFocus.resources).toEqual(boardBeforeFocus.resources);
  await page.getByTestId('focus-board-screen').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-sources-open', 'true');
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__OUTPOST_QA__!.missionBoard().cameraMode)).toBe('overview');
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

test('reduced motion disables board parallax while screen focus remains available', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await beginFreshMission(page);
  const viewport=page.viewportSize()!;
  await page.mouse.move(viewport.width*.9,viewport.height*.15);
  await page.waitForTimeout(250);
  const parallax=await page.evaluate(()=>window.__OUTPOST_QA__!.missionBoard().parallax);
  expect(Math.abs(parallax.yaw)).toBeLessThan(.001);
  expect(Math.abs(parallax.pitch)).toBeLessThan(.001);
  await page.getByTestId('focus-board-screen').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-sources-open','true');
  await page.keyboard.press('Escape');
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.missionBoard().cameraMode)).toBe('overview');
});


test('lobby replay restarts only the guide and preserves saved mission state', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('outpost-language', 'en');
    localStorage.setItem('outpost-mission-board-v2', JSON.stringify({
      version: 2, phase: 1, site: 'candidate-1', selectedSiteIndex: 0, antenna: 0.2,
      eventChoice: '', evidence: '', repairLinked: false, priorities: [], completed: ['site'],
      records: [{phase:'site', choice:'candidate-1', result:'saved', source:'lola', at:'2026-11-14T00:00:00.000Z'}],
      tutorialDone: true, tutorialStep: 4, certificate: false,
      resources: {power:68, water:64, data:8, safety:100}
    }));
  });
  await page.goto('/');
  await page.locator('#lobby-replay-tutorial').click();
  await expect(page.locator('#mission-board')).toBeVisible();
  await expect(page.locator('#mission-board')).toHaveAttribute('data-phase', 'event');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-step', '0');
  await expect(page.locator('#mission-board')).toHaveAttribute('data-tutorial-done', 'false');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('outpost-mission-board-v2')!));
  expect(saved.site).toBe('candidate-1');
  expect(saved.completed).toEqual(['site']);
  expect(saved.records).toHaveLength(1);
});
