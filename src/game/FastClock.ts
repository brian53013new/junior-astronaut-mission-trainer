/** Advance at most one sol per tick; a pending event or a finished mission stops acceleration. */
export function stepFastClock(now:number,nextAt:number,paused:boolean,eventOpen:boolean,finished:boolean){
  if(eventOpen||finished)return {enabled:false,nextAt,advance:false};
  if(paused)return {enabled:true,nextAt:now+10000,advance:false};
  if(now>=nextAt)return {enabled:true,nextAt:now+10000,advance:true};
  return {enabled:true,nextAt,advance:false};
}
