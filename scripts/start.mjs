import { existsSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
if (
  process.env.LUMA_SKIP_BUILD !== '1' ||
  !existsSync('dist/web/browser/index.html') ||
  !existsSync('dist/api/apps/api/src/main.js')
) {
  const web = spawnSync(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build'], {
    stdio: 'inherit',
    windowsHide: true,
  });
  if (web.status !== 0) process.exit(web.status || 1);
  const api = spawnSync(
    process.execPath,
    ['node_modules/typescript/bin/tsc', '-p', 'apps/api/tsconfig.json'],
    { stdio: 'inherit', windowsHide: true },
  );
  if (api.status !== 0) process.exit(api.status || 1);
}
const child = spawn(process.execPath, ['dist/api/apps/api/src/main.js'], {
  stdio: 'inherit',
  windowsHide: true,
});
child.on('exit', (code) => (process.exitCode = code || 0));
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
