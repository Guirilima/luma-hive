import { spawn, execFile, ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
const exec = promisify(execFile);
export async function resolveExecutable(request: string): Promise<string | null> {
  let file: string | undefined;
  if (path.isAbsolute(request) || /[\\/]/.test(request)) {
    file = fs.existsSync(request) ? path.resolve(request) : undefined;
  } else {
    try {
      const { stdout } = await exec(
        process.platform === 'win32' ? 'where.exe' : 'which',
        [request],
        { windowsHide: true, timeout: 5000 },
      );
      const files = stdout.trim().split(/\r?\n/).filter(Boolean);
      file = files.find((f) => /\.(exe|cmd|bat)$/i.test(f)) || files[0];
    } catch {}
  }

  if (!file && process.platform === 'win32') {
    const localAppData = process.env['LOCALAPPDATA'] || '';
    const appData = process.env['APPDATA'] || '';

    const candidates: Record<string, string[]> = {
      codex: [
        path.join(
          localAppData,
          'Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Roaming/npm/node_modules/@openai/codex/bin/codex.js',
        ),
        path.join(
          localAppData,
          'Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Roaming/npm/codex.cmd',
        ),
        path.join(appData, 'npm/node_modules/@openai/codex/bin/codex.js'),
        path.join(appData, 'npm/codex.cmd'),
      ],
      devin: [
        path.join(
          localAppData,
          'Programs/Devin/resources/app/extensions/windsurf/devin/bin/devin.exe',
        ),
        path.join(localAppData, 'Programs/Devin/bin/devin-desktop.cmd'),
        path.join(localAppData, 'Programs/Devin/devin.exe'),
      ],
      agy: [
        path.join(
          localAppData,
          'Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Local/agy/bin/agy.exe',
        ),
        path.join(appData, 'Antigravity/bin/agy-node.cmd'),
        path.join(localAppData, 'agy/bin/agy.exe'),
      ],
      antigravity: [
        path.join(
          localAppData,
          'Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Local/agy/bin/agy.exe',
        ),
        path.join(appData, 'Antigravity/bin/agy-node.cmd'),
        path.join(localAppData, 'agy/bin/agy.exe'),
      ],
    };

    const list = candidates[request.toLowerCase()] || [];
    for (const cand of list) {
      if (fs.existsSync(cand)) {
        file = cand;
        break;
      }
    }
  }

  if (file && /codex\.(cmd|bat)$/i.test(file)) {
    const js = path.join(path.dirname(file), 'node_modules/@openai/codex/bin/codex.js');
    if (fs.existsSync(js)) file = js;
  }
  return file || null;
}
export function launch(
  executable: string,
  args: string[],
  cwd?: string,
): ChildProcessWithoutNullStreams {
  const options = {
    cwd,
    windowsHide: true,
    env: {
      ...process.env,
      GIT_CEILING_DIRECTORIES: cwd ? path.dirname(cwd) : process.env['GIT_CEILING_DIRECTORIES'],
    },
    stdio: 'pipe' as const,
    detached: process.platform !== 'win32',
  };
  if (/\.[cm]?js$/i.test(executable))
    return spawn(process.execPath, [executable, ...args], options);
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(executable)) {
    // Complex values stay in files/stdin. Never allow cmd metacharacters in a shim argument.
    for (const arg of [executable, ...args])
      if (/["%&|<>^!\r\n]/.test(arg))
        throw Error('Unsafe batch argument; configure the executable or JS launcher directly');
    const line = [executable, ...args].map((arg) => '"' + arg + '"').join(' ');
    return spawn(process.env['ComSpec'] || 'cmd.exe', ['/d', '/s', '/c', '"' + line + '"'], {
      ...options,
      windowsVerbatimArguments: true,
    });
  }
  return spawn(executable, args, options);
}
export function stopProcess(child: ChildProcessWithoutNullStreams): void {
  if (!child.pid) return;
  if (process.platform === 'win32')
    execFile(
      'taskkill.exe',
      ['/pid', String(child.pid), '/t', '/f'],
      { windowsHide: true },
      () => {},
    );
  else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill();
    }
  }
}
export function capture(
  executable: string,
  args: string[],
  timeoutMs = 20000,
  cwd?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = launch(executable, args, cwd);
    let out = '',
      err = '',
      settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stopProcess(child);
      error ? reject(error) : resolve(out);
    };
    const timer = setTimeout(() => finish(Error('CLI response timed out')), timeoutMs);
    child.stdin.on('error', () => {});
    child.stdin.end();
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      out += chunk;
      if (out.length > 4 * 1024 * 1024) finish(Error('CLI response too large'));
    });
    child.stderr.on('data', (chunk) => {
      err = (err + String(chunk)).slice(-300);
    });
    child.on('error', (error) => finish(error));
    child.on('close', (code) =>
      finish(
        code === 0
          ? undefined
          : Error(
              `CLI exited with code ${code}${/not logged in|unauthenticated|unauthorized/i.test(err + out) ? ' (authentication required)' : ''}`,
            ),
      ),
    );
  });
}

/** Conservative retry guard. Never terminate a process based on a recycled PID. */
export async function recordedProcessAlive(pid: number, startedAt: string): Promise<boolean> {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
  } catch (e) {
    return (e as NodeJS.ErrnoException).code !== 'ESRCH';
  }
  if (process.platform !== 'win32') return true;
  try {
    const command = `$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}';if($p){$p.CreationDate.ToUniversalTime().ToString('o')}`;
    const { stdout } = await exec(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', command],
      { windowsHide: true, timeout: 8000 },
    );
    if (!stdout.trim()) return false;
    const created = Date.parse(stdout.trim());
    return !Number.isFinite(created) || Math.abs(created - Date.parse(startedAt)) < 15000;
  } catch {
    return true;
  }
}
