import assert from 'node:assert/strict';
import { getDataProvenance, getFlightPhysicsBaseline, getLifeSupportBaselines, getLunarSiteCandidates, getNASAImages, getSpaceWeatherEvents, loadMissionData, donkiTypes } from '../src/game/NASADataProvider.ts';
import { BASELINE_GAME_WATER_POINTS, siteProfiles } from '../src/game/SitePlanner.ts';

class MemoryStorage { map=new Map(); getItem(k){return this.map.get(k)??null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);} }
globalThis.localStorage=new MemoryStorage();
const realFetch=globalThis.fetch;
const record=(type)=>({eventID:`fixture-${type}`,startTime:'2026-11-12T10:00:00Z',eventTime:'2026-11-12T10:00:00Z',link:`https://ccmc.gsfc.nasa.gov/DONKI/view/${type}/1/1`});
try{
  globalThis.fetch=async input=>{if(String(input).startsWith('/'))return{ok:true,json:async()=>({schemaVersion:1,provenance:{mode:'EDUCATIONAL-FALLBACK',dataset:'empty test',sourceUrl:'',retrievedAt:'2026-11-13',recordId:'empty',limitations:'test'},records:[]})};const url=new URL(input);if(url.hostname==='ccmc.gsfc.nasa.gov'){const type=url.pathname.split('/').at(-1);return{ok:true,json:async()=>[record(type)]};}if(url.hostname==='images-api.nasa.gov')return{ok:true,json:async()=>({collection:{items:[{data:[{nasa_id:'PIA123',title:'Lunar surface',description:'Fixture description',date_created:'2026-01-01',center:'JPL',keywords:['Moon']}],links:[{rel:'preview',href:'https://images-assets.nasa.gov/image/PIA123/thumb.jpg'}]}]}})};throw new Error(`Unexpected URL ${url}`);};
  const data=await getSpaceWeatherEvents('2026-11-01','2026-11-13');assert.equal(data.status,'live');assert.equal(data.events.length,6);assert.deepEqual(new Set(data.events.map(e=>e.eventType)),new Set(donkiTypes));assert.ok(data.events.every(e=>e.kind==='nasa-live'&&e.observedAt&&e.sourceUrl?.startsWith('https://ccmc.gsfc.nasa.gov/')));assert.ok(data.events.every(e=>e.effects.power<0&&e.effects.health===undefined));
  const images=await getNASAImages('Moon');assert.equal(images.length,1);assert.equal(images[0].nasaId,'PIA123');assert.equal(images[0].center,'JPL');assert.ok(images[0].pageUrl.includes('PIA123'));
  const baselines=getLifeSupportBaselines();assert.equal(baselines.values.transitVehicle.totalWaterConsumption,3.2);assert.equal(BASELINE_GAME_WATER_POINTS,5);assert.deepEqual(siteProfiles.map(p=>p.waterUse),[6,5,5]);assert.equal(getLunarSiteCandidates().records.length,0);assert.equal(getDataProvenance().donki.types.length,6);const flight=getFlightPhysicsBaseline();assert.equal(flight.value,1.624);assert.equal(flight.unit,'m/s²');assert.ok(flight.disclosure.includes('not numerically integrated'));
  const cached=await loadMissionData();assert.equal(cached.isFallback,false);assert.ok(cached.events.length===6,'verified live cache should be available in story fallback');
  console.log('NASA data checks passed: six DONKI feeds normalize/cache, image metadata parses, BVAD baseline maps to mission points, no measured LOLA sites are fabricated.');
}finally{globalThis.fetch=realFetch;}
