import type { Action } from './types';
export interface DeviceEducation {id:Action;lesson:string;range:string;zh:string;en:string;}
/** Every ID is an actual ConsoleRoom control; values are game settings, not flight measurements. */
export const devices:Record<Action,DeviceEducation>={
plan:{id:'plan',lesson:'plan',range:'3',zh:'選擇基地位置；日照與補給之間需要取捨。',en:'Choose a base site; balance sunlight and supplies.'},
craft:{id:'craft',lesson:'flight',range:'0–100%',zh:'拖動測試桿；測試需要電力與燃料。',en:'Drag the checkout lever; a test uses power and fuel.'},
power:{id:'power',lesson:'plan',range:'0–100%',zh:'拖動滑桿；遊戲中增加電力會消耗部分水。',en:'Drag the slider; in this game, added power costs some water.'},
comms:{id:'comms',lesson:'signal',range:'on/off',zh:'啟用通訊。真正的無線電訊號需要傳播時間。',en:'Enable communications. Real radio signals take time to travel.'},
navigate:{id:'navigate',lesson:'flight',range:'0–100%',zh:'拖動路線標記；這是教育用簡化模型。',en:'Drag the route marker; this is an educational simplification.'},
science:{id:'science',lesson:'explore',range:'0–100%',zh:'左右拖曳調整強度，上下拖曳瞄準，使用電力觀察。',en:'Drag sideways for strength and vertically to aim; observations use power.'},
analyze:{id:'analyze',lesson:'explore',range:'0–100%',zh:'拖曳比較標記尋找較強的模擬訊號。',en:'Drag the marker to compare simulated signals.'},
recycle:{id:'recycle',lesson:'finale',range:'0–100',zh:'按下以用電回收水；回收不會憑空製造水。',en:'Press to recycle water using power; recycling does not create water.'},
grow:{id:'grow',lesson:'finale',range:'0–100',zh:'種植消耗水與電，換取模擬食物。',en:'Growing uses water and power for simulated food.'},
event:{id:'event',lesson:'repair',range:'status',zh:'查看環境警報；事件是教學情境，不是真實預報。',en:'Inspect alerts; events are teaching scenarios, not real forecasts.'},
pause:{id:'pause',lesson:'flight',range:'on/off',zh:'暫停或恢復遊戲時鐘。',en:'Pause or resume the game clock.'},
advance:{id:'advance',lesson:'flight',range:'0–100',zh:'將旋鈕拖到100並放開，推進一個模擬日；這不控制真實時間。',en:'Drag to 100 and release to advance one simulated day; real time is unchanged.'},
skip:{id:'skip',lesson:'flight',range:'on/off',zh:'切換遊戲時間加速；遇到事件時停止。',en:'Toggle faster game time; it stops at events.'},
shelter:{id:'shelter',lesson:'finale',range:'on/off',zh:'先打開安全蓋，再操作避難桿；遮蔽消耗電力。',en:'Open the guard, then shelter the crew; it costs power.'},
continue:{id:'continue',lesson:'finale',range:'on/off',zh:'選擇持續作業會保留電力，也可能增加乘員風險。',en:'Continuing saves power but may increase crew risk.'}
};
