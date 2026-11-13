/** Three location categories are fictional teaching scenarios, not LOLA/PDS measurements. */
import { getLifeSupportBaselines } from './NASADataProvider.ts';
export type SiteId='sunlit'|'balanced'|'shadow';
export type SiteProfile={id:SiteId;powerUse:number;waterUse:number;scienceBonus:number;zh:string;en:string;zhTrade:string;enTrade:string};
/** BVAD Table 4-20 transit-vehicle 3.2 kg/crew-day converted at 0.64 kg per game point. */
const waterReference=getLifeSupportBaselines();
export const BVAD_TRANSIT_WATER_KG_PER_CREW_DAY=waterReference.values.transitVehicle.totalWaterConsumption; // BVAD Rev.2 Table 4-20, printed p.72; NASA Transit Vehicle reference
export const GAME_WATER_POINT_KG=waterReference.gameConversion.kgPerWaterPoint; // selected educational display scale, not a NASA value
export const BASELINE_GAME_WATER_POINTS=Math.round(BVAD_TRANSIT_WATER_KG_PER_CREW_DAY/GAME_WATER_POINT_KG);
const siteWaterSurcharges={sunlit:1,balanced:0,shadow:0} as const; // invented site-choice modifiers; no lunar measurements imported
export const siteProfiles:readonly SiteProfile[]=[
 {id:'sunlit',powerUse:4,waterUse:BASELINE_GAME_WATER_POINTS+siteWaterSurcharges.sunlit,scienceBonus:0,zh:'明亮山脊',en:'SUNLIT RIDGE',zhTrade:'電力較省；取水較難（遊戲模擬）',enTrade:'Less power use; harder water access (simulation)'},
 {id:'balanced',powerUse:5,waterUse:BASELINE_GAME_WATER_POINTS+siteWaterSurcharges.balanced,scienceBonus:0,zh:'均衡邊緣',en:'BALANCED RIM',zhTrade:'日照與水需求較均衡（遊戲模擬）',enTrade:'Balanced power and water needs (simulation)'},
 {id:'shadow',powerUse:6,waterUse:BASELINE_GAME_WATER_POINTS+siteWaterSurcharges.shadow,scienceBonus:5,zh:'陰影邊緣',en:'SHADOW EDGE',zhTrade:'觀測機會多；電力需求較高（遊戲模擬）',enTrade:'More science; higher power use (simulation)'}
];
export function siteIndex(value:number):0|1|2{return value<1/3?0:value>2/3?2:1;}
export function siteProfile(value:number):SiteProfile{return siteProfiles[siteIndex(value)];}
