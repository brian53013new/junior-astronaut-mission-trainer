/** Dialogue events have stable identity, lesson, trigger, priority and delivery state.
 * Presentation remains separate from the textbook and quiz content. */
export type DialogueTrigger='intro'|'wait'|'success'|'failure'|'idle'|'complete'|'reading'|'quiz';
export interface DialogueEvent {id:string;lesson:string;trigger:DialogueTrigger;priority:number;zh:string;en:string;}
export class DialogueState {
 private delivered=new Set<string>();private current:DialogueEvent|null=null;private currentDone=true;
 request(event:DialogueEvent,lang:'zh'|'en',force=false){const key=`${event.lesson}:${event.id}:${lang}`;if(!force&&this.delivered.has(key))return null;if(!force&&this.current&&!this.currentDone&&event.priority<this.current.priority)return null;this.current=event;this.currentDone=false;this.delivered.add(key);return lang==='zh'?event.zh:event.en;}
 complete(){this.currentDone=true;}
 reset(){this.delivered.clear();this.current=null;this.currentDone=true;}
 snapshot(){return [...this.delivered];}
 restore(value:unknown){if(Array.isArray(value))this.delivered=new Set(value.filter((x):x is string=>typeof x==='string').slice(-300));}
}
