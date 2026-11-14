import { expect, test } from '@playwright/test';

test('flight lesson calculates and saves Earth/Moon weight using the cited gravity reference',async({page,isMobile})=>{
 test.skip(!isMobile,'The HTML study sheet is the compact touch presentation.');
 await page.addInitScript(()=>{
  localStorage.setItem('outpost-welcome-3d-v1','done');
  localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:2,awaiting:false,finished:false,reading:true,readingPage:0,questionIndex:0,feedbackChoice:null,reflectionComplete:true,reflectionChoice:null,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
 });
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();const sheet=page.locator('#reading-panel');await expect(sheet).toBeVisible();await expect(sheet).toContainText('1.624 m/s²');await expect(sheet).toContainText(/does not calculate a real trajectory|沒有使用此數值計算真實軌跡/);
 const mass=sheet.getByRole('slider',{name:/Object mass|物體質量/});await mass.press('End');await expect(sheet).toContainText(/980\.7 N/);await expect(sheet).toContainText(/162\.4 N/);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('outpost-flight-gravity-practice-v1')!));expect(saved.massKg).toBe(100);expect(saved.sourceUrl).toContain('science.nasa.gov');expect(saved.lunarGravity).toBe(1.624);
 const source=sheet.locator('a[href="https://science.nasa.gov/moon/by-the-numbers/"]');await expect(source).toHaveAttribute('href','https://science.nasa.gov/moon/by-the-numbers/');
});
