/// <reference types="vite/client" />

interface ThreeGameDiagnostics {
  frame: number;
  elapsed: number;
  score: number;
  targetScore: number;
  complete: boolean;
  player: {
    position: { x: number; y: number; z: number };
    speed: number;
  };
  renderer: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  canvas: {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    dpr: number;
  };
}

interface ThreeGameTestHooks {
  /** Re-seed the game RNG; all gameplay randomness must flow through it. */
  seed(value: number): void | Promise<void>;
  /** Acknowledge after setup/assets are ready; throw for unknown states. */
  setState(name: string): { state: string } | Promise<{ state: string }>;
  /** Stop simulation/state transitions immediately; keep rendering. Await optional synchronization. */
  setPausedForScreenshot(paused: boolean): void | Promise<void>;
  /** Stabilize ambient/idle visuals without requiring an unpaused simulation tick. */
  setReducedMotion(enabled: boolean): void | Promise<void>;
  /** Hide debug UI (lil-gui) before capturing. */
  hideDebugUi(hidden: boolean): void | Promise<void>;
}

interface Window {
  __THREE_GAME_DIAGNOSTICS__?: ThreeGameDiagnostics;
  __THREE_GAME_TEST_HOOKS__?: ThreeGameTestHooks;
  __OUTPOST_QA__?: {
    ready(): Promise<boolean>;
    missionBoard(): {phase:number;site:string;antenna:number;eventChoice:string;evidence:string;repairLinked:boolean;priorities:string[];completed:string[];resources:{power:number;water:number;data:number;safety:number}|null};
    boardPoint(kind:'base'|'site'|'source'|'antenna'|'classification'|'port',index?:number): {x:number;y:number};
    state(): Record<string, unknown>;
    language(): 'en'|'zh';
    guide(): {step:number;target:string|null};
    camera(): {x:number;y:number;z:number;baseZ:number;yaw:number;pitch:number};
    hoveredAction(): string|null;
    selectedAction(): string|null;
    targetMarker():{id:string;visible:boolean;x:number;y:number;z:number};
    bookClearance():{overlaps:string[];backGap:number};
    bookPosition():{x:number;y:number};
    siteMode():number;
    siteModePoint(index:number):{x:number;y:number};
    screenPosition(action: string): {x:number;y:number};
    setLanguage(language:'en'|'zh'):void;
    welcome(): {active:boolean;intro:boolean;step:number;focus:string|null;departing:boolean;quiz:boolean};
    lesson(): {id:string;reading:boolean;page:number;prediction:number|null;phase:string;questionIndex:number;finished:boolean};
    safetyOpen():boolean;
    metrics(): {calls:number;triangles:number;geometries:number;textures:number;pixelRatio:number};
    textScale():number;
    paperPosition(x:number,y:number): {x:number;y:number};
    screenPoint(kind:'map'|'telemetry'|'checklist',x:number,y:number): {x:number;y:number};
    assemblyBay():{active:boolean;transit:boolean;inspection:number};
    assemblyRotation(index:number):number;
    assemblyPreparation():boolean[];
    inspectionPoint(index:number):{x:number;y:number};
    assemblyPoint(kind:'part'|'socket'|'activate'|'passage',index:number):{x:number;y:number};
    workshop(): {mode:string|null;parts:boolean[]};
    scienceRoom():{active:boolean;moved:boolean;onTarget:boolean;power:number;aim:number};
    sciencePoint(kind:'dial'|'scan'):{x:number;y:number};
    communications():{active:boolean;aligned:boolean;value:number};
    communicationsPoint(kind:'dial'|'key'|'send'|'replay',index:number):{x:number;y:number};
    signal(): {active:boolean;cursor:number;solved:boolean};
    orbit(): {focused:boolean;angle:number;reward:boolean};
    orbitPoint(): {x:number;y:number};
    welcomePosition(target:'button'|'knob'|'switch'|'book'|'door'): {x:number;y:number};
  };
}
