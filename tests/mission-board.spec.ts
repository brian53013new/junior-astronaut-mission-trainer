import { expect, test } from '@playwright/test';
import { finishProbe } from './finish-probe';

async function attachEvidence(page:any,id:string){await page.getByTestId(`evidence-${id}`).locator('.evidence-pick').click();await page.getByTestId('attach-selected-evidence').click();}

test('fresh visitor enters the saved mission table and starts the real 3D probe task', async ({ page }) => {
  test.setTimeout(100_000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();
  await expect(page.locator('#mission-board')).toBeVisible({timeout:20_000});
  await expect(page.getByRole('heading',{name:'Lunar Mission Table'})).toBeVisible();
  await attachEvidence(page,'craft-reference');
  await page.getByRole('button',{name:/Enter Engineering lab/}).click();
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().active),{timeout:15_000}).toBe(true);
  await expect(page.locator('#mission-board')).toBeHidden();
  expect(errors).toEqual([]);
});

test('mission table stays readable at 100%, 150% and 200% across target viewports',async({page})=>{
  const sizes=[{width:375,height:812},{width:768,height:1024},{width:1024,height:768}];
  await page.setViewportSize(sizes[0]);await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('#mission-board')).toBeVisible({timeout:20_000});
  for(const [scale,option] of [['normal','Normal'],['large','Large'],['xlarge','Extra large']]){
    await page.locator('.board-system button').first().click();await expect(page.locator('#settings-panel')).toBeVisible();await page.locator('#settings-panel [data-input="text"]').selectOption(scale);await page.locator('#settings-panel [data-action="close"]').click();
    for(const size of sizes){await page.setViewportSize(size);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${size.width}×${size.height}, ${option}`).toBe(true);}
    await expect(page.getByRole('button',{name:/Enter Engineering lab/})).toBeVisible();
  }
});

test('site and lunar-weight decisions update the current board round', async ({ page }) => {
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:1,completed:['assembly'],site:'',module:'',mass:20,power:50,water:70,food:80,science:0,data:0,observation:'',repair:'',choices:[],records:[{round:'assembly',action:'assembled',result:'assembled',at:new Date().toISOString()}],certificate:false}));});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('#mission-board')).toBeVisible({timeout:20_000});
  await expect(page.locator('[data-testid=current-round]')).toContainText('Lunar site planning');await attachEvidence(page,'lola');
  await page.getByTestId('candidate-0e').click();await page.getByTestId('confirm-site').click();
  await expect(page.locator('[data-testid=current-round]')).toContainText('Gravity and payload');await attachEvidence(page,'gravity');
  await page.locator('[data-testid=flight-mass]').evaluate((el)=>{const input=el as HTMLInputElement;input.value='40';input.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.getByTestId('gravity-result')).toContainText('Moon 65.0 N');
  await page.getByTestId('save-flight-choice').click();
  await expect(page.locator('[data-testid=current-round]')).toContainText('Communications and event context');
});

test('fresh-storage journey records all six 3D learning turns, finale and certificate',async({page})=>{
  test.setTimeout(300_000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');});
  await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('#mission-board')).toBeVisible({timeout:20_000});
  const drag3d=async(from:()=>Promise<{x:number;y:number}>,to:()=>Promise<{x:number;y:number}>)=>{const a=await from(),b=await to();await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();};
  await attachEvidence(page,'craft-reference');await page.getByRole('button',{name:/Enter Engineering lab/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().active),{timeout:15_000}).toBe(true);await page.waitForTimeout(6000);
  for(let i=0;i<3;i++){const inspect=await page.evaluate(index=>window.__OUTPOST_QA__!.inspectionPoint(index),i);await page.mouse.click(inspect.x,inspect.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().inspection)).toBe(i);}
  for(let i=0;i<3;i++)await drag3d(()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('part',index),i),()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('socket',index),i));
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().parts.every(Boolean))).toBe(true);
  await finishProbe(page,false);
  for(let i=0;i<3;i++)await drag3d(()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('part',index),i),()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('socket',index),i));
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().parts.every(Boolean))).toBe(true);
  let p=await page.evaluate(()=>window.__OUTPOST_QA__!.assemblyPoint('activate',0));await page.mouse.click(p.x,p.y);await expect(page.locator('[data-testid=current-round]')).toContainText('Lunar site planning',{timeout:30_000});
  await attachEvidence(page,'lola');await page.getByTestId('candidate-0e').click();await page.getByTestId('confirm-site').click();await expect(page.locator('[data-testid=current-round]')).toContainText('Gravity and payload');await attachEvidence(page,'gravity');
  await page.locator('[data-testid=flight-mass]').evaluate(el=>{const input=el as HTMLInputElement;input.value='35';input.dispatchEvent(new Event('input',{bubbles:true}));});await page.getByTestId('save-flight-choice').click();await expect(page.locator('[data-testid=current-round]')).toContainText('Communications and event context');await attachEvidence(page,'donki');
  await page.getByRole('button',{name:/Enter Communications station/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().active),{timeout:15_000}).toBe(true);await page.waitForTimeout(2500);
  p=await page.evaluate(()=>window.__OUTPOST_QA__!.communicationsPoint('dial',0));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+54,p.y,{steps:5});await page.mouse.up();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().aligned)).toBe(true);await page.waitForTimeout(5000);
  for(const i of [0,2,1,3]){p=await page.evaluate(index=>window.__OUTPOST_QA__!.communicationsPoint('key',index),i);await page.mouse.click(p.x,p.y);await page.waitForTimeout(400);}await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().solved)).toBe(true);p=await page.evaluate(()=>window.__OUTPOST_QA__!.communicationsPoint('send',0));await page.mouse.click(p.x,p.y);await expect(page.locator('#mission-board')).toBeVisible();await expect(page.locator('[data-testid=current-round]')).toContainText('Observation, inference');await attachEvidence(page,'images-api');
  await page.getByRole('radio',{name:'Inference'}).check();await page.getByRole('button',{name:/Take evidence into the 3D observatory/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().active),{timeout:15_000}).toBe(true);await page.waitForTimeout(2500);
  const initialAim=await page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().aim);p=await page.evaluate(()=>window.__OUTPOST_QA__!.sciencePoint('dial'));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+65,p.y+(initialAim-.8)*160,{steps:5});await page.mouse.up();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().moved)).toBe(true);p=await page.evaluate(()=>window.__OUTPOST_QA__!.sciencePoint('scan'));await page.mouse.click(p.x,p.y);await expect(page.locator('[data-testid=current-round]')).toContainText('Repair and life support',{timeout:20_000});await attachEvidence(page,'bvad');
  await page.getByRole('button',{name:/Enter Repair station/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().active),{timeout:15_000}).toBe(true);await page.waitForTimeout(2500);for(let i=0;i<3;i++)await drag3d(()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('part',index),i),()=>page.evaluate(index=>window.__OUTPOST_QA__!.assemblyPoint('socket',index),i));await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().parts.every(Boolean))).toBe(true);p=await page.evaluate(()=>window.__OUTPOST_QA__!.assemblyPoint('activate',0));await page.mouse.click(p.x,p.y);await expect(page.locator('[data-testid=current-round]')).toContainText('FINALE · INTEGRATED MISSION',{timeout:30_000});
  await page.getByRole('checkbox',{name:'Reserve power for life support'}).check();await page.getByRole('checkbox',{name:'Prioritize water recovery'}).check();await page.getByRole('button',{name:'Complete mission and save learning record'}).click();await expect(page.getByRole('heading',{name:'Lunar Outpost Training Record'})).toBeVisible();await page.getByRole('button',{name:'View certificate'}).click();await expect(page.getByRole('heading',{name:'Junior Astronaut Certificate'})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('outpost-mission-board-v1')||'{}'));expect(saved.completed).toHaveLength(7);expect(saved.records).toHaveLength(7);expect(saved.certificate).toBe(true);expect(errors).toEqual([]);
});

test('communications station transmits and advances the mission table',async({page})=>{
 await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:3,completed:['assembly','site','flight'],site:'0E',module:'',mass:20,power:50,priority:'science',water:70,food:80,science:0,data:0,observation:'',repair:'',choices:[],records:[{round:'assembly',action:'build',result:'ok',at:new Date().toISOString()},{round:'site',action:'site',result:'ok',at:new Date().toISOString()},{round:'flight',action:'weight',result:'ok',at:new Date().toISOString()}],certificate:false}));});
 await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('#mission-board')).toBeVisible();await attachEvidence(page,'donki');await page.getByRole('button',{name:/Enter Communications station/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().active)).toBe(true);await page.waitForTimeout(2500);
 let p=await page.evaluate(()=>window.__OUTPOST_QA__!.communicationsPoint('dial',0));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+54,p.y,{steps:5});await page.mouse.up();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().aligned)).toBe(true);await page.waitForTimeout(5000);
 for(const i of [0,2,1,3]){p=await page.evaluate(index=>window.__OUTPOST_QA__!.communicationsPoint('key',index),i);await page.mouse.click(p.x,p.y);await page.waitForTimeout(400);}
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().solved)).toBe(true);p=await page.evaluate(()=>window.__OUTPOST_QA__!.communicationsPoint('send',0));await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().active)).toBe(false);await expect(page.locator('#mission-board')).toBeVisible();await expect(page.locator('[data-testid=current-round]')).toContainText('Observation, inference');
});

test('science evidence choice is rendered in the observation round',async({page})=>{
 await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:4,completed:['assembly','site','flight','signal'],site:'0E',module:'',mass:20,power:50,priority:'science',water:70,food:80,science:0,data:0,observation:'',repair:'',choices:[],records:[],certificate:false}));});
 await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await expect(page.locator('[data-testid=current-round]')).toContainText('Observation, inference');await attachEvidence(page,'images-api');
 await expect(page.locator('.observation-options input[type=radio]')).toHaveCount(3);await expect(page.getByRole('radio',{name:'More evidence needed'})).toBeVisible();
});


test('science station can scan an observed target and advance the course',async({page})=>{
 await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:4,completed:['assembly','site','flight','signal'],site:'0E',module:'',mass:20,power:50,priority:'science',water:70,food:80,science:0,data:0,observation:'',repair:'',choices:[],records:[],certificate:false}));});
 await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();await attachEvidence(page,'images-api');await page.getByRole('radio',{name:'Inference'}).check();await page.getByRole('button',{name:/Take evidence into the 3D observatory/}).click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().active)).toBe(true);await page.waitForTimeout(3000);const initialAim=await page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().aim);let p=await page.evaluate(()=>window.__OUTPOST_QA__!.sciencePoint('dial'));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+65,p.y+(initialAim-.8)*160,{steps:5});await page.mouse.up();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom().moved)).toBe(true);const state=await page.evaluate(()=>window.__OUTPOST_QA__!.scienceRoom());expect(state.onTarget,JSON.stringify(state)).toBe(true);p=await page.evaluate(()=>window.__OUTPOST_QA__!.sciencePoint('scan'));await page.mouse.click(p.x,p.y);await expect(page.locator('[data-testid=current-round]')).toContainText('Repair and life support',{timeout:10_000});
});

test('finale requires and accepts two explicit resource choices',async({page})=>{
 await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('outpost-language','en');localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-mission-board-v1',JSON.stringify({round:6,completed:['assembly','plan','flight','signal','explore','repair'],site:'0E',module:'',mass:20,power:50,priority:'science',water:70,food:80,science:5,data:10,observation:'need',repair:'fixed',choices:[],records:[],certificate:false}));});
 await page.goto('/?boardQa=1');await page.locator('#lobby-start').click();const finish=page.getByRole('button',{name:'Complete mission and save learning record'});await expect(finish).toBeDisabled();await page.getByRole('checkbox',{name:'Reserve power for life support'}).check();await page.getByRole('checkbox',{name:'Prioritize water recovery'}).check();await expect(finish).toBeEnabled();await finish.click();await expect(page.getByRole('heading',{name:'Lunar Outpost Training Record'})).toBeVisible();await page.getByRole('button',{name:'View certificate'}).click();await expect(page.getByRole('heading',{name:'Junior Astronaut Certificate'})).toBeVisible();
});
