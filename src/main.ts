import './styles.css';
import { Game } from './game/Game';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}

const game = new Game(canvas);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
    // The bundled teaching scenarios still work when offline caching is unavailable.
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.dispose();
  });
}
