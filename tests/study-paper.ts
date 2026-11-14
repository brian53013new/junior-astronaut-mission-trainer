import type {Page} from '@playwright/test';

/** Use the touch-readable sheet on narrow screens and the physical 3D paper elsewhere. */
export async function studyPaperClick(page:Page,mobile:boolean,x:number,y:number){
 const panel=page.locator('#reading-panel');
 if(mobile&&await panel.isVisible()){
  if(x>=700){await panel.locator('.reading-navigation .reading-primary').last().click();return;}
  const choices=panel.locator('.reading-choice');
  const count=await choices.count();
  if(count){const index=Math.max(0,Math.min(count-1,Math.floor((y-350)/96)));await choices.nth(index).click();return;}
 }
 const point=await page.evaluate(([a,b])=>window.__OUTPOST_QA__!.paperPosition(a,b),[x,y]);
 if(mobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
}
