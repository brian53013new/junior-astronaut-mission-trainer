import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const taskDir=await mkdtemp(join(tmpdir(),'outpost-donki-test-'));
try{
  await mkdir(join(taskDir,'scripts'),{recursive:true}); await mkdir(join(taskDir,'public','data'),{recursive:true});
  await copyFile(new URL('./fetch-donki-snapshot.mjs',import.meta.url),join(taskDir,'scripts','fetch-donki-snapshot.mjs'));
  const fetchMock=`globalThis.fetch=async(input)=>{const url=new URL(input);const type=url.pathname.split('/').at(-1);if(process.env.OUTPOST_MOCK_MODE==='http-error'&&type==='IPS')return{ok:false,status:503};const item={eventID:'sample-'+type,startTime:'2026-11-13T12:00:00Z',eventTime:'2026-11-13T12:00:00Z',link:'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/'+type+'/1/1?api_key=fake-test-key'};return{ok:true,json:async()=>process.env.OUTPOST_MOCK_MODE==='empty'?[]:[item]};};`;
  await writeFile(join(taskDir,'mock.mjs'),fetchMock);
  const file=join(taskDir,'public','data','nasa-event-snapshot.json');
  const run=mode=>spawnSync(process.execPath,['--import',join(taskDir,'mock.mjs'),join(taskDir,'scripts','fetch-donki-snapshot.mjs'),'2026-11-13','2026-11-14'],{encoding:'utf8',env:{...process.env,OUTPOST_MOCK_MODE:mode}});
  const ok=run('ok');assert.equal(ok.status,0,ok.stderr);const saved=await readFile(file,'utf8'),manifest=JSON.parse(saved);
  assert.equal(manifest.records.length,6);assert.deepEqual(new Set(manifest.records.map(r=>r.eventType)),new Set(['CME','FLR','GST','SEP','IPS','HSS']));assert.equal(manifest.records[0].sourceUrl.includes('fake-test-key'),false);assert.equal(saved.includes('fake-test-key'),false);assert.equal(ok.stdout.includes('fake-test-key'),false);
  const empty=run('empty');assert.notEqual(empty.status,0);assert.equal(await readFile(file,'utf8'),saved,'empty response must not replace verified snapshot');
  const failed=run('http-error');assert.notEqual(failed.status,0);assert.equal(await readFile(file,'utf8'),saved,'partial HTTP failure must not replace verified snapshot');
  console.log('DONKI importer checks passed: six categories normalize, invalid/empty/partial responses preserve the prior snapshot, no key is required or saved.');
}finally{await rm(taskDir,{recursive:true,force:true});}
