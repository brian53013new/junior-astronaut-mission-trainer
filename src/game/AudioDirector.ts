type SoundGroup='music'|'effects'|'voice';
type Phase='lobby'|'guide'|'mission'|'alert'|'quiz'|'success';
type Instrument='piano'|'organ'|'strings'|'pulse';

/**
 * Original, synthesized score. No samples, third-party compositions or network.
 * The same four-note idea is developed over four different chord progressions.
 * Audio begins only after a player gesture; existing volume groups remain separate.
 */
export class AudioDirector {
 course=0;
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private duck:GainNode|null=null;
 private buses:Partial<Record<SoundGroup,GainNode>>={};
 private next=0;
 private beat=0;
 private activePhase:Phase='lobby';
 private speaking=false;
 volume=.35;
 muted=false;
 levels:Record<SoundGroup,number>={music:.55,effects:.6,voice:.7};

 get phase(){return this.activePhase;}
 set phase(value:Phase){
  if(value===this.activePhase)return;
  this.activePhase=value;this.beat=0;this.next=0;
  const bus=this.buses.music;
  if(bus&&this.ctx){
   const t=this.ctx.currentTime;
   // Avoid a click when the harmony changes by fading down, then returning.
   bus.gain.cancelScheduledValues(t);
   bus.gain.setValueAtTime(Math.max(.001,bus.gain.value),t);
   bus.gain.setTargetAtTime(.001,t,.16);
   bus.gain.setTargetAtTime(this.levels.music,t+.42,.42);
  }
 }
 unlock(){
  try{
   if(!this.ctx){
    this.ctx=new AudioContext();
    this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:this.volume;this.master.connect(this.ctx.destination);
    this.duck=this.ctx.createGain();this.duck.gain.value=this.speaking?.32:1;this.duck.connect(this.master);
    for(const k of ['music','effects','voice'] as const){
     const b=this.ctx.createGain();b.gain.value=this.levels[k];b.connect(k==='music'?this.duck:this.master);this.buses[k]=b;
    }
    // Gentle cabin air: low, steady, and on the effects fader.
    const hum=this.ctx.createOscillator(),g=this.ctx.createGain();hum.frequency.value=54;hum.type='sine';g.gain.value=.009;hum.connect(g);g.connect(this.buses.effects!);hum.start();
   }
   void this.ctx.resume();
  }catch{/* Audio restrictions never block game input. */}
 }
 get ready(){return !!this.ctx&&this.ctx.state==='running';}
 setVolume(n:number){this.volume=Math.max(0,Math.min(1,n));this.sync();}
 setLevel(group:SoundGroup,value:number){this.levels[group]=Math.max(0,Math.min(1,value));const b=this.buses[group];if(b&&this.ctx)b.gain.setTargetAtTime(this.levels[group],this.ctx.currentTime,.08);}
 toggle(){this.muted=!this.muted;this.sync();}
 private sync(){if(this.ctx&&this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume,this.ctx.currentTime,.08);}
 tone(freq:number,duration:number,type:OscillatorType='sine',gain=.08,delay=0,group:SoundGroup='effects'){
  const destination=this.buses[group];if(!this.ctx||!destination||this.ctx.state!=='running'||this.muted||gain<=0||duration<=.03)return;
  const t=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),env=this.ctx.createGain();
  osc.type=type;osc.frequency.value=freq;env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(gain,t+.025);env.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(env);env.connect(destination);osc.start(t);osc.stop(t+duration+.02);
 }
 cue(kind:'talk'|'success'|'error'|'click'|'door'){
  if(kind==='success'){[523,659,784].forEach((f,i)=>this.tone(f,.22,'sine',.055,i*.1));}
  else if(kind==='error'){this.tone(230,.19,'triangle',.045);this.tone(180,.22,'triangle',.035,.13);}
  else if(kind==='door'){this.tone(160,.42,'sine',.035);this.tone(240,.36,'sine',.025,.15);}
  else if(kind==='talk')this.tone(620,.065,'sine',.035,0,'voice');
  else this.tone(380,.065,'triangle',.04);
 }
 private note(midi:number,duration:number,instrument:Instrument,volume:number,delay=0){
  const ctx=this.ctx,destination=this.buses.music;
  if(!ctx||!destination||ctx.state!=='running'||this.muted||volume<=0)return;
  const t=ctx.currentTime+delay,f=440*Math.pow(2,(midi-69)/12),env=ctx.createGain(),filter=ctx.createBiquadFilter();
  filter.type='lowpass';filter.frequency.value=instrument==='piano'?2100:instrument==='pulse'?420:1300;filter.Q.value=.3;
  const attack=instrument==='strings'?.32:instrument==='organ'?.22:.018;
  const peak=t+Math.min(attack,duration*.32),end=t+duration;
  env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(volume,peak);
  if(instrument==='piano')env.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*.36),t+Math.max(.04,duration*.35));
  env.gain.exponentialRampToValueAtTime(.0001,end);
  filter.connect(env);env.connect(destination);
  const make=(wave:OscillatorType,ratio:number,level:number,detune=0)=>{
   const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=wave;osc.frequency.value=f*ratio;osc.detune.value=detune;g.gain.value=level;osc.connect(g);g.connect(filter);osc.start(t);osc.stop(end+.02);
  };
  if(instrument==='organ'){make('sine',1,.7);make('sine',2,.18);make('sine',3,.06);}
  else if(instrument==='strings'){make('triangle',1,.48,-5);make('triangle',1,.48,5);}
  else if(instrument==='piano'){make('triangle',1,.7);make('sine',2,.2);make('sine',3,.06);}
  else make('sine',1,.8);
 }
 tick(now:number,speaking=false){
  // Duck the entire currently sounding score, not merely newly scheduled notes.
  if(this.speaking!==speaking){this.speaking=speaking;if(this.duck&&this.ctx)this.duck.gain.setTargetAtTime(speaking?.30:1,this.ctx.currentTime,speaking?.12:.65);}
  if(!this.ready||this.muted||now<this.next)return;
  const phase=this.phase;
  const stepDuration=phase==='alert'?.29:phase==='quiz'?.43:phase==='success'?.34:.38;
  this.next=now+stepDuration*1000;
  const n=this.beat++,step=n%32,bar=Math.floor(step/8),cycle=Math.floor(n/32)%4;
  // MIDI roots, with a small modal turn in the second half of each phrase.
  const roots:Record<Phase,readonly number[]>={lobby:[50,46,53,48],guide:[55,52,48,50],mission:[48,45,53,50],alert:[45,41,48,43],quiz:[48,53,45,50],success:[48,55,57,53]};
  const root=roots[phase][bar];
  const thirds=[3,3,4,3];const third=thirds[bar];
  // Shared rising idea; rests leave room for NOVA and allow real phrases.
  const melody=[0,-1,4,7,-1,9,7,4,2,-1,5,9,-1,7,5,2,0,4,7,-1,11,9,7,4,2,5,9,7,5,-1,2,-1];
  const offset=melody[step];
  if(step%8===0){
   const sustain=stepDuration*7.5;
   const intensity=phase==='alert'?.008:phase==='quiz'?.007:.009;
   this.note(root-12,sustain,'organ',intensity);
   this.note(root,sustain,'strings',intensity*.70);
   this.note(root+third,sustain,'strings',intensity*.45);
   this.note(root+7,sustain,'organ',intensity*.45);
  }
  // Light broken chords; sparse during reading and richer during exploration.
  if(step%2===1&&(phase!=='quiz'||step%4===1)){
   const arp=[0,7,12,third+12,7,12,third,7][Math.floor(step/2)%8];
   this.note(root+arp+12,stepDuration*1.25,'piano',phase==='alert'?.007:.008);
  }
  if(offset>=0&&((phase!=='quiz'&&phase!=='lobby')||step%2===0)){
   const octave=phase==='alert'?0:12;
   const twist=cycle===3&&step===28?2:0;
   this.note(root+octave+offset+twist,stepDuration*(step%4===0?2.1:1.2),'piano',phase==='quiz'?.009:.013);
  }
  if(step%4===0&&phase!=='quiz')this.note(root-24,stepDuration*1.6,'pulse',phase==='alert'?.016:.009);
 }
}
