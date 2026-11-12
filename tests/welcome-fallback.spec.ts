import {expect,test} from '@playwright/test';

test('text welcome alternative resumes the same saved 3D tutorial step',async({page})=>{
 test.setTimeout(60_000);
 await page.goto('/?qa=1');
 await page.locator('.lobby-help summary').click();
 await page.locator('#lobby-text-tutorial').click();
 const card=page.locator('#welcome-flow');await expect(card).toBeVisible();await expect(card).toContainText(/移動及轉動|Move or turn/);
 await card.locator('.welcome-primary').click();await expect(card).toContainText(/尋找目標|Find a target/);
 await card.locator('.welcome-quiet').last().click();await expect(card).toContainText(/選取與特寫|Select and inspect/);
 expect(await page.evaluate(()=>localStorage.getItem('outpost-welcome-3d-step'))).toBe('2');
 await card.locator('.welcome-footer .welcome-quiet').first().click();
 await expect(card).toBeHidden();
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().active)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().step)).toBe(2);
});
