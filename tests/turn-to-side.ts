import type { Page } from '@playwright/test';
export async function turnToSide(page:Page,mobile:boolean,side:'left'|'right',angle=1.55){
 if(mobile){const c=await page.context().newCDPSession(page),w=page.viewportSize()!.width;const delta=angle/.004/2;for(let i=0;i<2;i++){const a=w*.5+(side==='right'?delta/2:-delta/2),b=w*.5+(side==='right'?-delta/2:delta/2);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}}else for(let i=0;i<Math.round(angle/.32);i++)await page.keyboard.press(side==='left'?'ArrowLeft':'ArrowRight');await page.waitForTimeout(3000);
}
