import type { Action, MissionState } from './types';

/** Choose the next actionable step; event decisions and the sol clock take priority. */
export function tutorialTarget(state:MissionState,powerDemonstrated:boolean,scienceCost=9):Action {
  if(state.paused)return 'pause';
  if(state.eventOpen)return state.power<10||(!state.navReady&&state.sol>=9&&state.power<40)?'continue':'shelter';
  if(state.commandSpent)return 'advance';
  if(state.navReady&&state.power>=scienceCost&&state.propellant>=4&&state.discoveries<3)return 'science';
  if(state.water<3&&state.power>=6)return 'recycle';
  // Preserve enough charge for navigation, the next event, and the first scan.
  if(state.commsReady&&!state.navReady&&state.water>=3&&(state.power<18||(state.sol%3===2&&state.power<35)))return 'power';
  if(state.navReady&&state.power<scienceCost&&state.water>=3)return 'power';
  if(!state.navReady&&state.power<15&&state.water>=3)return 'power';
  if(!powerDemonstrated&&state.power<89&&state.water>=3)return 'power';
  if(!state.planned)return 'plan';
  if(!state.craftReady)return 'craft';
  if(!state.commsReady)return 'comms';
  if(!state.navReady)return 'navigate';
  return 'science';
}
