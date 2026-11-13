/** LOLA measurements enter a clearly disclosed comparison score; all game effects remain educational rules. */
import { getLifeSupportBaselines } from './NASADataProvider.ts';
import lunarSites from '../data/nasa/lunar-sites.json' with { type: 'json' };
export type SiteId='sunlit'|'balanced'|'shadow';
export type SiteProfile={id:SiteId;powerUse:number;waterUse:number;scienceBonus:number;zh:string;en:string;zhTrade:string;enTrade:string;longitude:number;latitude:number;topographyM:number;slopeDeg:number;comparisonScore:number};
/** BVAD Table 4-20 transit-vehicle 3.2 kg/crew-day converted at 0.64 kg per game point. */
const waterReference=getLifeSupportBaselines();
export const BVAD_TRANSIT_WATER_KG_PER_CREW_DAY=waterReference.values.transitVehicle.totalWaterConsumption; // BVAD Rev.2 Table 4-20, printed p.72; NASA Transit Vehicle reference
export const GAME_WATER_POINT_KG=waterReference.gameConversion.kgPerWaterPoint; // selected educational display scale, not a NASA value
export const BASELINE_GAME_WATER_POINTS=Math.round(BVAD_TRANSIT_WATER_KG_PER_CREW_DAY/GAME_WATER_POINT_KG);
const candidates=lunarSites.records;
const minTopo=Math.min(...candidates.map(v=>v.topographyRelativeToMeanRadius)),maxTopo=Math.max(...candidates.map(v=>v.topographyRelativeToMeanRadius));
const siteWaterSurcharges=[1,0,0] as const; // invented resource scenario; not derived from LOLA
export const siteProfiles:readonly SiteProfile[]=candidates.map((candidate,index)=>{
 const slopePreference=Math.max(0,100-Math.min(30,candidate.slope)*100/30);
 const relativeTopoPreference=maxTopo===minTopo?50:(candidate.topographyRelativeToMeanRadius-minTopo)*100/(maxTopo-minTopo);
 const comparisonScore=Math.round(slopePreference*.7+relativeTopoPreference*.3);
 const scienceBonus=Math.round(relativeTopoPreference*.05);
 const names=[['LOLA 點位 0°E','LOLA 點位 90°E','LOLA 點位 180°E'],['LOLA POINT 0°E','LOLA POINT 90°E','LOLA POINT 180°E']];
 return{id:(['sunlit','balanced','shadow'] as SiteId[])[index],powerUse:3+Math.round((100-comparisonScore)/25),waterUse:BASELINE_GAME_WATER_POINTS+siteWaterSurcharges[index],scienceBonus,zh:names[0][index],en:names[1][index],zhTrade:`相對地形分數 ${comparisonScore}；分數與資源效果為教育模型`,enTrade:`Terrain comparison ${comparisonScore}; score and resource effects are educational`,longitude:candidate.longitude,latitude:candidate.latitude,topographyM:candidate.topographyRelativeToMeanRadius,slopeDeg:candidate.slope,comparisonScore};
});
export function siteIndex(value:number):0|1|2{return value<1/3?0:value>2/3?2:1;}
export function siteProfile(value:number):SiteProfile{return siteProfiles[siteIndex(value)];}
