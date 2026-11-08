/** Fictional teaching sites: categories inspired by NASA LRO educator kit, not measurements. */
export type SiteId='sunlit'|'balanced'|'shadow';
export type SiteProfile={id:SiteId;powerUse:number;waterUse:number;scienceBonus:number;zh:string;en:string;zhTrade:string;enTrade:string};
export const siteProfiles:readonly SiteProfile[]=[
 {id:'sunlit',powerUse:4,waterUse:6,scienceBonus:0,zh:'明亮山脊',en:'SUNLIT RIDGE',zhTrade:'電力較省；取水較難',enTrade:'Less power use; harder water access'},
 {id:'balanced',powerUse:5,waterUse:5,scienceBonus:0,zh:'均衡邊緣',en:'BALANCED RIM',zhTrade:'日照與水需求較均衡',enTrade:'Balanced power and water needs'},
 {id:'shadow',powerUse:6,waterUse:5,scienceBonus:5,zh:'陰影邊緣',en:'SHADOW EDGE',zhTrade:'觀測機會多；電力需求較高',enTrade:'More science; higher power use'}
];
export function siteIndex(value:number):0|1|2{return value<1/3?0:value>2/3?2:1;}
export function siteProfile(value:number):SiteProfile{return siteProfiles[siteIndex(value)];}
