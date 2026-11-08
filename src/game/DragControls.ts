export type DragAction='power'|'craft'|'science'|'navigate'|'plan'|'analyze'|'skip'|'advance';
export type DragState={action:DragAction;pointerId:number;startX:number;startY:number;initial:number;value:number;initialAim:number;aim:number;moved:boolean;changed:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));

export function beginDrag(action:DragAction,x:number,y:number,value:number,aim:number,pointerId=0):DragState{
  return {action,pointerId,startX:x,startY:y,initial:value,value,initialAim:aim,aim,moved:false,changed:false};
}
export function moveDrag(d:DragState,x:number,y:number):DragState{
  const dx=x-d.startX,dy=y-d.startY;
  return {...d,value:clamp(d.initial+dx/180),aim:d.action==='science'?clamp(d.initialAim-dy/160):d.initialAim,moved:d.moved||Math.hypot(dx,dy)>8,changed:d.changed||(d.action==='science'?Math.hypot(dx,dy)>8:Math.abs(dx)>8)};
}
