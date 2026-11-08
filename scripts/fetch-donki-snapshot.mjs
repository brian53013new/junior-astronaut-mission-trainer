#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

const [startDate,endDate]=process.argv.slice(2);
const apiKey=process.env.NASA_API_KEY;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
if(!apiKey){console.error('Set NASA_API_KEY in the local shell environment; the key is never written to the snapshot.');process.exit(2);}
if(!datePattern.test(startDate??'')||!datePattern.test(endDate??'')||startDate>endDate){console.error('Usage: NASA_API_KEY=… node scripts/fetch-donki-snapshot.mjs YYYY-MM-DD YYYY-MM-DD');process.exit(2);}

const endpoint=new URL('https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP');
endpoint.searchParams.set('startDate',startDate);
endpoint.searchParams.set('endDate',endDate);
endpoint.searchParams.set('api_key',apiKey);
const response=await fetch(endpoint,{headers:{accept:'application/json'},signal:AbortSignal.timeout(15000)});
if(!response.ok){console.error(`DONKI request failed with HTTP ${response.status}; the offline snapshot was left unchanged.`);process.exit(1);}
const data=await response.json();
if(!Array.isArray(data)){console.error('DONKI returned an unexpected payload; the offline snapshot was left unchanged.');process.exit(1);}
function canonicalEventLink(input){
  if(typeof input!=='string')return null;
  try{const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password)return null;if(url.hostname==='kauai.ccmc.gsfc.nasa.gov'&&url.pathname.startsWith('/DONKI/'))url.hostname='ccmc.gsfc.nasa.gov';if(url.hostname!=='ccmc.gsfc.nasa.gov'&&!url.hostname.endsWith('.ccmc.gsfc.nasa.gov'))return null;for(const key of [...url.searchParams.keys()])if(key.toLowerCase()==='api_key')url.searchParams.delete(key);return url.toString();}catch{return null;}
}
const events=data.flatMap(item=>{const sourceUrl=canonicalEventLink(item?.link);const eventDate=typeof item?.eventTime==='string'?item.eventTime.slice(0,10):'';return item&&typeof item.eventID==='string'&&item.eventID&&Number.isFinite(Date.parse(item.eventTime))&&eventDate>=startDate&&eventDate<=endDate&&sourceUrl?[{...item,sourceUrl}]:[];});
if(events.length===0){console.error('No verifiable SEP records were returned; the offline snapshot was left unchanged.');process.exit(1);}
const retrievedAt=new Date().toISOString();
const requestUrl=`https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=${startDate}&endDate=${endDate}`;
const records=events.slice(0,10).map(item=>({
  id:item.eventID,
  kind:'NASA',
  titleKey:`SEP observation · ${item.eventTime.slice(0,10)}`,
  noteKey:'nasaMapping',
  sourceUrl:item.sourceUrl,
  retrievedAt,
  effects:{},
  mappingDisclosure:'This DONKI SEP record supplies event context only. It is not a lunar surface dose, crew exposure, safety warning, or forecast. The shelter action cost and any crew-condition change are invented educational rules.'
}));
const manifest={schemaVersion:1,provenance:{mode:'NASA-SNAPSHOT',dataset:'NASA CCMC DONKI · Solar Energetic Particle events',sourceUrl:requestUrl,retrievedAt,recordId:`donki-sep-${startDate}-${endDate}`,limitations:'Historical/observed space-weather event context only. No lunar surface crew dose, mission safety prediction, or NASA-certified gameplay coefficient.'},records};
await writeFile(new URL('../public/data/nasa-event-snapshot.json',import.meta.url),`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Saved ${records.length} dated DONKI SEP event(s) for the offline training snapshot. No API key was saved.`);
