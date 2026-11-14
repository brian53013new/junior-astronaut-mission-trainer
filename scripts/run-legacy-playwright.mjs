import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(command, ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_INCLUDE_LEGACY: '1' },
});
child.on('error', error => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
