import { expect, test } from '@playwright/test';
import { MissionEngine } from '../src/game/MissionEngine';
import { offlineEvents } from '../src/game/NASADataProvider';

test('mission clock, action cooldown, daily resources, skip, and event resolution are bounded',()=>{
  const game=new MissionEngine(()=>offlineEvents[0]);
  expect(game.execute('power',1000).ok).toBe(true);
  expect(game.state.power).toBe(90);
  expect(game.state.water).toBe(65);
  expect(game.execute('power',1100).message).toBe('cooldown');
  expect(game.state.power).toBe(90);
  expect(game.commandCount).toBe(1);

  expect(game.execute('advance',2000).ok).toBe(true);
  expect(game.state.sol).toBe(2);
  expect(game.state.power).toBe(85);
  expect(game.execute('pause',2500).message).toBe('pauseDone');
  expect(game.execute('advance',3000).message).toBe('clockPaused');
  expect(game.state.sol).toBe(2);
  expect(game.execute('pause',3500).message).toBe('resumeDone');

  const skipped=game.execute('skip',4100);
  expect(skipped.timeAdvanced).toBe(1);
  expect(game.state.sol).toBe(3);
  expect(game.state.eventOpen).toBe(true);
  expect(game.execute('shelter',4700).ok).toBe(true);
  expect(game.state.eventOpen).toBe(false);
  expect(game.state.shielding).toBe(15);
  expect(game.state.health).toBe(100);
  expect(game.commandCount).toBe(2);
});
