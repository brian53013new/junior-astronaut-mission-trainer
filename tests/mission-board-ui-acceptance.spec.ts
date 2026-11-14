import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import type { Page } from '@playwright/test';

async function attachEvidence(page:Page,id:string){await page.locator(`[data-testid="evidence-${id}"] .evidence-pick`).click();await page.getByTestId('attach-selected-evidence').click();}

async function openBoard(page:Page){
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('#mission-board')).toBeVisible({timeout:20_000});
}

test('evidence can be dragged to the active mission node and unlocks the 3D task',async({page})=>{
  await openBoard(page);
  const tile=page.locator('[data-testid="evidence-craft-reference"] .evidence-pick');
  await tile.dragTo(page.locator('[data-testid="mission-node-assembly"]'));
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem('outpost-mission-board-v1')||'{}')).attached.assembly).toBe('craft-reference');
  await expect(page.getByRole('button',{name:/Enter Engineering lab/})).toBeEnabled();
  await expect(page.locator('[data-testid="mission-node-assembly"]')).toContainText('Ready');
});

test('keyboard node navigation and return dock',async({page})=>{
  await openBoard(page);
  test.skip(test.info().project.name==='mobile-chrome','Keyboard node navigation is covered on the desktop profile.');
  const active=page.getByTestId('mission-node-assembly');await active.focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('mission-node-plan')).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#mission-board')).toBeHidden();
  await page.getByTestId('mission-board-dock').click();await expect(page.locator('#mission-board')).toBeVisible();
});


test('touch selection and attach fallback works on a phone profile',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chrome','Runs in the mobile Chromium emulation project.');
  await openBoard(page);await page.locator('[data-testid="evidence-craft-reference"] .evidence-pick').tap();
  await page.getByTestId('attach-selected-evidence').tap();
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem('outpost-mission-board-v1')||'{}')).attached.assembly).toBe('craft-reference');
  await expect(page.getByRole('button',{name:/Enter Engineering lab/})).toBeEnabled();
});

test('observation answer gives a retry explanation before opening the observatory',async({page})=>{
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:4,completed:['assembly','plan','flight','signal'],attached:{assembly:'craft-reference',plan:'lola',flight:'gravity',signal:'donki'},records:[]}));});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await attachEvidence(page,'images-api');
  const proceed=page.getByRole('button',{name:/Take evidence into the 3D observatory/});
  await page.getByRole('radio',{name:'Observed evidence'}).check();await expect(proceed).toBeDisabled();await expect(page.getByRole('status')).toContainText('Try again');
  await page.getByRole('radio',{name:'Inference'}).check();await expect(proceed).toBeEnabled();await expect(page.getByRole('status')).toContainText('Correct');
});

for(const [name,viewport] of [
  ['desktop-1280x720',{width:1280,height:720}],
  ['phone-portrait-375x812',{width:375,height:812}],
  ['tablet-768x1024',{width:768,height:1024}],
  ['tablet-landscape-1024x768',{width:1024,height:768}],
] as const){
  test(`capture ${name} and verify mission table has no horizontal overflow`,async({page})=>{
    await page.setViewportSize(viewport);await openBoard(page);await page.evaluate(()=>document.fonts.ready);
    const metrics=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth,board:document.querySelector<HTMLElement>('#mission-board')!.clientWidth,boardScroll:document.querySelector<HTMLElement>('#mission-board')!.scrollWidth}));
    expect(metrics.doc,JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.boardScroll,JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.board+2);
    await mkdir('docs/ui-evidence',{recursive:true});await page.screenshot({path:`docs/ui-evidence/${name}.png`,fullPage:true,animations:'disabled'});
  });
}
