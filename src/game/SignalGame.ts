/** Practice a fictional four-pulse communications sequence; this is not a NASA encoding. */
export class SignalGame {
 readonly sequence=[0,2,1,3] as const;cursor=0;mistakes=0;started=performance.now();solved=false;
 replay(now=performance.now()){this.cursor=0;this.solved=false;this.started=now;}
 accept(key:number,now=performance.now()):'wait'|'wrong'|'correct'|'complete'{if(now-this.started<4500)return 'wait';if(this.solved)return 'complete';if(key!==this.sequence[this.cursor]){this.cursor=0;this.mistakes++;return 'wrong';}this.cursor++;if(this.cursor===this.sequence.length){this.solved=true;return 'complete';}return 'correct';}
}
