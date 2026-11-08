import type { DataProvenance, MissionState, ScenarioEvent } from './types';

type SnapshotRecord={id:string;kind:'NASA'|'education';titleKey:string;noteKey:string;sourceUrl:string;retrievedAt:string;effects:Partial<Pick<MissionState,'power'|'water'|'food'|'health'|'propellant'>>;mappingDisclosure:string};
type DataManifest={schemaVersion:number;provenance:DataProvenance;records:SnapshotRecord[]};
export type LoadedMissionData={events:ScenarioEvent[];provenance:DataProvenance;isFallback:boolean;warning?:'offline'|'invalid'|'empty'};

export const offlineEvents:ScenarioEvent[]=[
  {id:'shadow-training',title:'eventDust',note:'noteDust',source:'sourceScenario',effects:{power:-12},kind:'education'},
  {id:'crew-routine',title:'eventCrew',note:'noteCrew',source:'sourceScenario',effects:{water:-8,food:-6},kind:'education'},
  {id:'cold-shadow',title:'eventCold',note:'noteCold',source:'sourceScenario',effects:{power:-10},kind:'education'},
  {id:'filter-service',title:'eventFilter',note:'noteFilter',source:'sourceScenario',effects:{water:-9},kind:'education'},
  {id:'station-routine',title:'eventQuiet',note:'noteQuiet',source:'sourceScenario',effects:{power:-4,water:-4,food:-3},kind:'education'},
];
const fallbackProvenance:DataProvenance={mode:'EDUCATIONAL-FALLBACK',dataset:'Bundled teaching scenarios',sourceUrl:'',retrievedAt:'2026-11-04',recordId:'offline-training-v1',limitations:'Invented educational effects. Not NASA observations, radiation dose, a forecast, or a crew-safety prediction.'};
function officialUrl(input:unknown){if(typeof input!=='string')return false;try{const url=new URL(input);const nasaHost=url.hostname==='ccmc.gsfc.nasa.gov'||url.hostname.endsWith('.ccmc.gsfc.nasa.gov')||url.hostname==='api.nasa.gov';const hasKey=[...url.searchParams.keys()].some(key=>key.toLowerCase()==='api_key');return url.protocol==='https:'&&nasaHost&&!url.username&&!url.password&&!hasKey;}catch{return false;}}
function validate(input:unknown):input is DataManifest{
  if(!input||typeof input!=='object')return false;
  const v=input as Partial<DataManifest>;
  if(v.schemaVersion!==1||!v.provenance||!Array.isArray(v.records)||v.records.length>10)return false;
  const p=v.provenance;
  if((p.mode!=='NASA-SNAPSHOT'&&p.mode!=='EDUCATIONAL-FALLBACK')||typeof p.dataset!=='string'||!p.dataset||typeof p.retrievedAt!=='string'||!Number.isFinite(Date.parse(p.retrievedAt))||typeof p.recordId!=='string'||!p.recordId||typeof p.limitations!=='string'||!p.limitations)return false;
  if(p.mode==='NASA-SNAPSHOT'&&!officialUrl(p.sourceUrl))return false;
  const allowed=new Set(['power','water','food','health','propellant']);
  return v.records.every(r=>{
    if(!r||typeof r.id!=='string'||!r.id||typeof r.titleKey!=='string'||!r.titleKey||typeof r.noteKey!=='string'||!r.noteKey||typeof r.mappingDisclosure!=='string'||!r.mappingDisclosure||!r.effects||typeof r.effects!=='object')return false;
    if(!Object.entries(r.effects).every(([key,value])=>allowed.has(key)&&typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=100))return false;
    if(p.mode==='EDUCATIONAL-FALLBACK')return r.kind==='education';
    return r.kind==='NASA'&&officialUrl(r.sourceUrl)&&typeof r.retrievedAt==='string'&&Number.isFinite(Date.parse(r.retrievedAt));
  });
}

/** Loads a dated local snapshot first; the game never depends on a live NASA request. */
export async function loadMissionData():Promise<LoadedMissionData>{
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),2500);
  try{const response=await fetch(`${import.meta.env.BASE_URL}data/nasa-event-snapshot.json`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('snapshot missing');const payload:unknown=await response.json();if(!validate(payload))return fallback('invalid');if(payload.records.length===0)return fallback('empty');
    const events=payload.records.map(r=>({id:r.id,title:r.titleKey,note:r.noteKey,source:payload.provenance.dataset,sourceUrl:r.sourceUrl,retrievedAt:r.retrievedAt,mappingDisclosure:r.mappingDisclosure,effects:r.effects,kind:r.kind==='NASA'?'nasa-snapshot' as const:'education' as const}));return{events,provenance:payload.provenance,isFallback:payload.provenance.mode!=='NASA-SNAPSHOT'};
  }catch{return fallback('offline');}finally{clearTimeout(timeout);}
}
function fallback(warning:LoadedMissionData['warning']):LoadedMissionData{return{events:offlineEvents,provenance:fallbackProvenance,isFallback:true,warning};}
