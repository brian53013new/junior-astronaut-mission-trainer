import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const taskDir=await mkdtemp(join(tmpdir(),'outpost-donki-test-'));
try{
  await mkdir(join(taskDir,'scripts'),{recursive:true}); await mkdir(join(taskDir,'public','data'),{recursive:true});
  await copyFile(new URL('./fetch-donki-snapshot.mjs',import.meta.url),join(taskDir,'scripts','fetch-donki-snapshot.mjs'));
  const fetchMock=`globalThis.fetch=async(input)=>{const url=new URL(input);const type=url.pathname.split('/').at(-1);if(process.env.OUTPOST_MOCK_MODE==='http-error'&&type==='IPS')return{ok:false,status:503};if(process.env.OUTPOST_MOCK_MODE==='http-error-all')return{ok:false,status:503};const item={eventID:'sample-'+type,startTime:'2026-11-13T12:00:00Z',eventTime:'2026-11-13T12:00:00Z',link:'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/'+type+'/1/1'};return{ok:true,status:200,text:async()=>JSON.stringify(process.env.OUTPOST_MOCK_MODE==='empty'?[]:[item])};};`;
  await writeFile(join(taskDir,'mock.mjs'),fetchMock);
  const file=join(taskDir,'public','data','nasa-event-snapshot.json');
  const run=mode=>spawnSync(process.execPath,['--import',join(taskDir,'mock.mjs'),join(taskDir,'scripts','fetch-donki-snapshot.mjs'),'2026-11-13','2026-11-14'],{encoding:'utf8',env:{...process.env,OUTPOST_MOCK_MODE:mode}});
  const ok=run('ok');assert.equal(ok.status,0,ok.stderr);const saved=await readFile(file,'utf8'),manifest=JSON.parse(saved);
  assert.equal(manifest.records.length,6);assert.deepEqual(new Set(manifest.records.map(r=>r.eventType)),new Set(['CME','FLR','GST','SEP','IPS','HSS']));assert.equal(manifest.rawResponses.length,6);assert.ok(manifest.rawResponses.every(r=>/^[a-f0-9]{64}$/.test(r.sha256)&&r.httpStatus===200&&JSON.parse(r.rawBody).length===1&&!r.requestUrl.includes('api_key')));assert.equal(manifest.records[0].sourceUrl.includes('api_key'),false);assert.equal(saved.includes('api_key'),false);assert.equal(ok.stdout.includes('api_key'),false);
  const emptyInitial=run('empty');assert.notEqual(emptyInitial.status,0);assert.equal(await readFile(file,'utf8'),saved,'empty response must not replace verified snapshot');
  const partial=run('http-error');assert.equal(partial.status,0,partial.stderr);const partialBody=await readFile(file,'utf8'),partialManifest=JSON.parse(partialBody);assert.equal(partialManifest.records.length,5);assert.deepEqual(partialManifest.failedTypes,['IPS']);assert.equal(partialManifest.queryAudit.feeds.find(f=>f.eventType==='IPS').httpStatus,503);assert.equal(partialManifest.rawResponses.length,5);
  const empty=run('empty');assert.notEqual(empty.status,0);assert.equal(await readFile(file,'utf8'),partialBody,'empty response must not replace a prior partial snapshot');
  const failed=run('http-error-all');assert.notEqual(failed.status,0);assert.equal(await readFile(file,'utf8'),partialBody,'all HTTP failures must preserve the prior snapshot');
  console.log('DONKI importer checks passed: raw response bodies and hashes persist, partial HTTP failure is retained, empty/all-failed feeds preserve prior snapshot, and no key is saved.');
}finally{await rm(taskDir,{recursive:true,force:true});}
