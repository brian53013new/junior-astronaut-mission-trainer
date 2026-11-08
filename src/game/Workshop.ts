/** Two independent teaching puzzles. Coordinates are in the in-world monitor texture. */
export type WorkshopKind='assembly'|'repair';
export type WorkshopPart=0|1|2;
export class Workshop {
  readonly assembly:boolean[]=[false,false,false];
  readonly repair:boolean[]=[false,false,false];
  private readonly targetOrder:Record<WorkshopKind,readonly number[]>={assembly:[0,1,2],repair:[2,0,1]};
  parts(kind:WorkshopKind){return this[kind];}
  complete(kind:WorkshopKind){return this[kind].every(Boolean);}
  sourceAt(x:number,y:number):WorkshopPart|null{for(let i=0;i<3;i++)if(x>=28&&x<=245&&y>=76+i*60&&y<=121+i*60)return i as WorkshopPart;return null;}
  targetAt(x:number,y:number):WorkshopPart|null{for(let i=0;i<3;i++)if(x>=375&&x<=612&&y>=76+i*60&&y<=121+i*60)return i as WorkshopPart;return null;}
  place(kind:WorkshopKind,part:WorkshopPart,target:WorkshopPart){if(this[kind][part]||this.targetOrder[kind][part]!==target)return false;this[kind][part]=true;return true;}
}
