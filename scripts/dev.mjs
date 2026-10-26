import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'watch', 'apps/api/src/main.ts'], {
    stdio: 'inherit',
    windowsHide: true,
  }),
  spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'serve'], {
    stdio: 'inherit',
    windowsHide: true,
  }),
];
console.log('Development: http://127.0.0.1:4200 (API: 4318)');
let shuttingDown = false;
const stop = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
};
for (const child of children)
  child.on('exit', (code) => {
    if (!shuttingDown) {
      process.exitCode = code || 0;
      stop();
    }
  });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
