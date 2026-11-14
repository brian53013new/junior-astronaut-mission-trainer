#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(process.argv[2]??'');
if(!process.argv[2]){console.error('Usage: node scripts/import-user-nasa-package.mjs /path/to/nasa-package');process.exit(2);}
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pub=path.join(project,'public/data/nasa');
const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const manifest=await json('source-manifest.json');
const checks=(await readFile(path.join(root,'checksums.sha256'),'utf8')).split(/\r?\n/).filter(Boolean);
for(const line of checks){const [,rel]=line.trim().split(/\s+\*?/);const actual=sha(await readFile(path.join(root,rel)));if(actual!==line.trim().split(/\s+\*?/)[0])throw new Error(`SHA-256 mismatch: ${rel}`);}
if(!manifest?.donki?.obtained?.length||!manifest.imagesApi?.file||manifest.lola?.regions?.length<3)throw new Error('Package manifest is missing a required data section.');
for(const rel of ['source-manifest.json','checksums.sha256'])await copyFile(path.join(root,rel),path.join(pub,`user-package-${rel}`));
for(const folder of ['donki','images-api','lola']){const dir=path.join(pub,'raw',folder);await mkdir(dir,{recursive:true});for(const entry of await (await import('node:fs/promises')).readdir(path.join(root,'raw',folder))){if(entry==='README.md')continue;await copyFile(path.join(root,'raw',folder,entry),path.join(dir,entry));}}

const types=['CME','FLR','GST','SEP','IPS','HSS'];
const obtained=new Map(manifest.donki.obtained.map(v=>[v.type,v]));
const sourceFiles=[];
const all=[];
const failedTypes=[];
for(const type of types){
 const entry=obtained.get(type);
 if(!entry){failedTypes.push(type);continue;}
 const rawBody=await readFile(path.join(root,entry.file),'utf8');
 const data=JSON.parse(rawBody);if(!Array.isArray(data))throw new Error(`${type} response is not a JSON array`);
 const basename=path.basename(entry.file);const requestUrl=`https://api.nasa.gov/DONKI/${type}?startDate=${manifest.donki.dateRange.startDate}&endDate=${manifest.donki.dateRange.endDate}`;
 sourceFiles.push({eventType:type,requestUrl,retrievedAtUTC:manifest.createdAtUTC,httpStatus:entry.httpStatus,rawBody,sha256:sha(rawBody),rawFile:`/data/nasa/raw/donki/${basename}`,recordCount:data.length});
 const idKey={CME:'activityID',FLR:'flrID',GST:'gstID',SEP:'sepID',IPS:'activityID',HSS:'hssID'}[type];
 for(const item of data){
  const id=item?.[idKey],time=item?.startTime??item?.eventTime??item?.time21_5;
  const date=typeof time==='string'&&Number.isFinite(Date.parse(time))?new Date(time).toISOString():'';
  let url=item?.link;
  if(typeof url==='string'){const u=new URL(url);if(u.protocol!=='https:'||!/(^|\.)ccmc\.gsfc\.nasa\.gov$/.test(u.hostname))throw new Error(`Non-official DONKI event link in ${type}`);url=u.toString();}
  if(typeof id!=='string'||!date||!url)continue;
  const effects={CME:-5,FLR:-3,GST:-5,SEP:-4,IPS:-3,HSS:-5};
  all.push({id:`${type}:${id}`,kind:'NASA',titleKey:`${type} · ${date.slice(0,10)}`,noteKey:'nasaMapping',sourceUrl:url,retrievedAt:manifest.createdAtUTC,observedAt:date,eventType:type,effects:{power:effects[type]},mappingDisclosure:`${type} NASA DONKI event context. The ${Math.abs(effects[type])}-point power adjustment is an invented educational rule, not an observed impact, radiation dose, forecast, or safety advice.`});
 }
}
for(const type of types)if(!obtained.has(type)&&!failedTypes.includes(type))failedTypes.push(type);
if(!sourceFiles.length||!all.length)throw new Error('No validated DONKI records were found; no snapshot written.');
// Retain at least one validated event per non-empty feed before filling the 60-record game cap.
const selected=[];for(const type of types){const event=all.find(e=>e.eventType===type);if(event)selected.push(event);}
for(const event of [...all].sort((a,b)=>b.observedAt.localeCompare(a.observedAt)))if(selected.length<60&&!selected.some(x=>x.id===event.id))selected.push(event);
const retrievedAt=manifest.createdAtUTC;
const snapshot={schemaVersion:1,provenance:{mode:'NASA-SNAPSHOT',dataset:`NASA DONKI user-supplied verified snapshot · ${sourceFiles.map(r=>r.eventType).join(', ')}`,sourceUrl:`https://api.nasa.gov/DONKI/[${sourceFiles.map(r=>r.eventType).join('|')}]?startDate=${manifest.donki.dateRange.startDate}&endDate=${manifest.donki.dateRange.endDate}`,retrievedAt,recordId:`donki-user-package-${manifest.createdAtUTC}`,limitations:`User-supplied official API response package. Successful feeds: ${sourceFiles.map(r=>r.eventType).join(', ')}; unavailable feeds: ${failedTypes.join(', ')||'none'}. Effects are educational rules, not NASA hazard coefficients, radiation dose, forecast, or safety advice.`,rawSnapshotSha256:sha(JSON.stringify(sourceFiles))},records:selected,rawResponses:sourceFiles,failedTypes,queryAudit:{startDate:manifest.donki.dateRange.startDate,endDate:manifest.donki.dateRange.endDate,startedAtUTC:retrievedAt,completedAtUTC:retrievedAt,feeds:types.map(type=>{const r=sourceFiles.find(x=>x.eventType===type);return r?{eventType:type,httpStatus:r.httpStatus,requestStartedAtUTC:retrievedAt,rawBodySha256:r.sha256,recordCount:r.recordCount}:{eventType:type,httpStatus:manifest.donki.notObtained.find(x=>x.type===type)?.reason?.includes('503')?503:null,error:'Not obtained in the supplied source package.'};})}};
await writeFile(path.join(project,'public/data/nasa-event-snapshot.json'),`${JSON.stringify(snapshot,null,2)}\n`);

const imageRaw=await readFile(path.join(root,manifest.imagesApi.file),'utf8');const imagePayload=JSON.parse(imageRaw);if(!Array.isArray(imagePayload?.collection?.items))throw new Error('Images API response has no collection items.');
const queryUrl=manifest.imagesApi.queryUrl;const images=imagePayload.collection.items.flatMap(item=>{const d=item.data?.[0];if(!d?.nasa_id||!d?.title)return[];return[{nasaId:d.nasa_id,title:d.title,description:d.description??'',dateCreated:d.date_created??'',center:d.center??'',pageUrl:`https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,thumbnailUrl:item.links?.find(l=>l.rel==='preview')?.href,keywords:d.keywords??[],queryUrl,retrievedAtUTC:manifest.createdAtUTC,sourceType:'NASA Images and Video Library API',apiResponseFile:`/data/nasa/raw/images-api/${path.basename(manifest.imagesApi.file)}`}];});
await writeFile(path.join(pub,'image-catalog.json'),`${JSON.stringify({catalogSource:'NASA Image and Video Library API',apiDocumentation:manifest.imagesApi.documentation,apiEndpoint:'https://images-api.nasa.gov/search',queryUrl,checkedAtUTC:manifest.createdAtUTC,httpStatus:manifest.imagesApi.httpStatus,verificationStatus:'user-supplied-raw-api-response-hash-verified',rawResponseFile:`/data/nasa/raw/images-api/${path.basename(manifest.imagesApi.file)}`,rawResponseSha256:sha(imageRaw),items:[...images,{nasaId:'PIA13720',title:'South Pole Illumination Map',officialPage:'https://science.nasa.gov/photojournal/south-pole-illumination-map/',description:'Static NASA Science Photojournal asset; not a NASA Images API query result.',credit:'NASA / GSFC / Arizona State University',retrievedAtUTC:'2026-11-13T01:59:51Z',bundledLocalAsset:'/data/lro-south-pole.jpg',sourceType:'NASA Science Photojournal; static, not Images API'}]},null,2)}\n`);

const derived=await json('derived/lola-candidate-points.json');
if(derived.candidates?.length<3)throw new Error('LOLA package has fewer than three derived candidates.');
const candidates=await Promise.all(derived.candidates.map(async c=>{const region=manifest.lola.regions.find(r=>r.id===c.id);if(!region)throw new Error(`No product manifest for ${c.id}`);const raw=JSON.parse(await readFile(path.join(root,region.queryFile),'utf8'));const label=await readFile(path.join(root,region.labelFile),'utf8');if(!raw.GDSResults||!label.includes('NAME                = "TOPOGRAPHY"')||!label.includes('UNIT                = "METER"'))throw new Error(`LOLA product label validation failed for ${c.id}`);return{id:c.id,name:c.name,longitude:c.longitudeDegEast,latitude:c.latitudeDegNorth,topographyRelativeToMeanRadius:c.topographyRelativeToMeanRadiusM,topographyUnit:'m relative to 1737.4 km lunar mean radius',slope:c.estimatedLocalSlopeDeg,slopeUnit:'degree',slopeStatus:'derived-local-estimate-not-official-LOLA-field',slopeMethod:c.slopeMethod,observedUTC:c.observedUTC,shotNumber:c.shotNumber,productName:'LOLA RDR selected topography output',productVersion:'PDS3 label; generated 2026-11-13 (no archive release number stated in supplied label)',processingLevel:'RDR',rawCsv:`/data/nasa/raw/lola/${path.basename(region.csvFile)}`,rawLabel:`/data/nasa/raw/lola/${path.basename(region.labelFile)}`,queryUrl:c.productCitation.queryUrl,sourceUrl:manifest.lola.pdsPage,queryPointCount:region.pointCount,selectionMethod:'Raw observation nearest the query-window center; representative point, not a NASA-designated landing site.',limitations:'Topography is relative to the stated mean radius. The displayed slope is derived locally from sparse valid observations, not an official NASA slope field; game suitability scores are educational abstractions, not landing safety advice.'};}));
await writeFile(path.join(pub,'lunar-sites.json'),`${JSON.stringify({dataset:'NASA PDS Geosciences Node LOLA RDR GDS selected topography',sourceName:'LRO Lunar Orbiter Laser Altimeter',sourceUrl:manifest.lola.pdsPage,queryTool:manifest.lola.queryTool,checkedAtUTC:manifest.createdAtUTC,verificationStatus:'user-supplied-raw-PDS-query-CSV-and-label-hashes-verified',records:candidates,gameMapping:'Measured LOLA relative topography and package-derived local slope feed a clearly labeled educational comparison score. They do not imply real landing safety, light, ice, or communications conditions.'},null,2)}\n`);
console.log(`Imported ${selected.length} validated DONKI events from ${sourceFiles.length} successful feeds; ${images.length} NASA Images API records; ${candidates.length} LOLA RDR candidates. Raw bodies, products, package manifest and checksum list were retained.`);
