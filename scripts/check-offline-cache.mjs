import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const handlers=new Map(),stores=new Map();let offline=false,serverError=false,claimed=false,skipped=false;
const keyOf=key=>typeof key==='string'?new URL(key,'https://example.test').pathname:new URL(key.url).pathname;
const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return{
    async put(key,value){store.set(keyOf(key),value.clone());},
    async match(key){const value=store.get(keyOf(key));return value?.clone();}
  };},
  async keys(){return [...stores.keys()];},
  async delete(name){return stores.delete(name);}
};
const self={location:{origin:'https://example.test'},clients:{async claim(){claimed=true;}},async skipWaiting(){skipped=true;},addEventListener(name,handler){handlers.set(name,handler);}};
const fetch=async input=>{if(offline)throw new Error('offline');const path=keyOf(input);if(path==='/')return new Response('<script type="module" src="/assets/app.js"></script><link href="/assets/app.css" rel="stylesheet">');if(path==='/data/nasa-event-snapshot.json')return serverError?new Response('',{status:503}):new Response('{"records":[]}');return new Response('asset');};
const source=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');
vm.runInNewContext(source,{self,caches,fetch,URL,Response});
let pending;handlers.get('install')({waitUntil(value){pending=value;}});await pending;
assert.equal(skipped,true);
handlers.get('activate')({waitUntil(value){pending=value;}});await pending;assert.equal(claimed,true);
async function request(path,mode='cors'){let response;handlers.get('fetch')({request:{method:'GET',url:`https://example.test${path}`,mode},respondWith(value){response=value;}});return response;}
serverError=true;assert.equal(await (await request('/data/nasa-event-snapshot.json')).text(),'{"records":[]}');
offline=true;
assert.match(await (await request('/','navigate')).text(),/app\.js/);
assert.equal(await (await request('/assets/app.js')).text(),'asset');
assert.equal(await (await request('/data/nasa-event-snapshot.json')).text(),'{"records":[]}');
console.log('Offline cache logic passed: shell, build asset, and saved snapshot remain available after a simulated network failure.');
