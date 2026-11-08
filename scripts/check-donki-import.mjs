import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const taskDir=await mkdtemp(join(tmpdir(),'outpost-donki-test-'));
try{
  await mkdir(join(taskDir,'scripts'),{recursive:true});
  await mkdir(join(taskDir,'public','data'),{recursive:true});
  await copyFile(new URL('./fetch-donki-snapshot.mjs',import.meta.url),join(taskDir,'scripts','fetch-donki-snapshot.mjs'));
  await writeFile(join(taskDir,'mock.mjs'),`globalThis.fetch=async()=>({ok:true,json:async()=>process.env.OUTPOST_MOCK_MODE==='empty'?[]:[{eventID:'example-SEP',eventTime:'2026-11-13T12:00:00Z',link:'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/SEP/1/1?api_key=fake-test-key'},{eventID:'bad',eventTime:'2026-11-13T12:00:00Z',link:'https://example.test/not-nasa'}]});`);
  const snapshot=join(taskDir,'public','data','nasa-event-snapshot.json');
  const run=mode=>spawnSync(process.execPath,['--import',join(taskDir,'mock.mjs'),join(taskDir,'scripts','fetch-donki-snapshot.mjs'),'2026-11-13','2026-11-14'],{encoding:'utf8',env:{...process.env,NASA_API_KEY:'fake-test-key',OUTPOST_MOCK_MODE:mode}});
  const ok=run('ok');assert.equal(ok.status,0,ok.stderr);
  const saved=await readFile(snapshot,'utf8'),manifest=JSON.parse(saved);
  assert.equal(manifest.records.length,1);
  assert.equal(manifest.records[0].sourceUrl,'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/1/1');
  assert.equal(saved.includes('fake-test-key'),false);
  assert.equal(ok.stdout.includes('fake-test-key'),false);
  const empty=run('empty');assert.notEqual(empty.status,0);
  assert.equal(await readFile(snapshot,'utf8'),saved,'An empty response must not overwrite the saved snapshot');
  console.log('DONKI import checks passed: old official links are normalized, keys are excluded, and empty responses preserve the snapshot.');
}finally{await rm(taskDir,{recursive:true,force:true});}
