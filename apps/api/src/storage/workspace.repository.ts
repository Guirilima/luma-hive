import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {
  Workspace,
  WorkspaceEnvelope,
  Run,
  RunEvent,
  timestamp,
  uuid,
} from '../../../../packages/domain/src/models';
import { normalizeWorkspace } from '../../../../packages/domain/src/workspace';
import { HttpError } from '../shared/errors';
export class WorkspaceRepository {
  private db: Database.Database | null = null;
  readonly file: string;
  constructor(private readonly directory: string) {
    this.file = path.join(directory, 'luma.db');
    if (fs.existsSync(this.file)) this.open();
  }
  private open(): Database.Database {
    if (this.db) return this.db;
    fs.mkdirSync(this.directory, { recursive: true });
    const db = (this.db = new Database(this.file));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    db.exec(`CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1),rev TEXT NOT NULL,saved_at TEXT NOT NULL,data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS snapshots(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,label TEXT NOT NULL,data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,started_at TEXT NOT NULL,status TEXT NOT NULL,data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS run_events(run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,seq INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(run_id,seq));
      CREATE INDEX IF NOT EXISTS runs_project ON runs(project_id,started_at);
      PRAGMA user_version=1;`);
    // A terminated process cannot remain marked as running after a server restart.
    for (const row of db.prepare("SELECT data FROM runs WHERE status='running'").all() as {
      data: string;
    }[]) {
      const run = JSON.parse(row.data) as Run;
      run.status = 'failed';
      run.endedAt = timestamp();
      run.result = {
        seq: 0,
        at: run.endedAt,
        type: 'result',
        error: true,
        text: 'Server restarted before this run completed',
      };
      this.updateRun(run);
    }
    const workspace = this.read();
    if (workspace.workspace?.projects.some((p) => p.features.some((f) => f.status === 'running')))
      this.save(
        normalizeWorkspace(workspace.workspace, true),
        workspace.rev,
        false,
        'Recovery after interrupted execution',
      );
    return db;
  }
  read(): WorkspaceEnvelope {
    const row = this.db?.prepare('SELECT rev,saved_at,data FROM workspace WHERE id=1').get() as
      { rev: string; saved_at: string; data: string } | undefined;
    return {
      ok: true,
      exists: !!row,
      workspace: row ? JSON.parse(row.data) : null,
      rev: row?.rev || '',
      savedAt: row?.saved_at || '',
      path: this.file,
    };
  }
  save(input: unknown, base: string, create = false, label = 'Before update'): WorkspaceEnvelope {
    const workspace = normalizeWorkspace(input, create),
      current = this.read();
    if (create && current.exists) throw new HttpError(409, 'Workspace already exists');
    if (!create && !current.exists) throw new HttpError(409, 'Create a workspace first');
    if (!create && base !== current.rev)
      throw new HttpError(
        409,
        'Workspace changed in another tab. Reload or export your local copy.',
      );
    const db = this.open(),
      rev = uuid('rev'),
      at = timestamp();
    db.transaction(() => {
      if (current.workspace)
        db.prepare('INSERT INTO snapshots VALUES(?,?,?,?)').run(
          uuid('snapshot'),
          at,
          label,
          JSON.stringify(current.workspace),
        );
      db.prepare(
        'INSERT INTO workspace VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET rev=excluded.rev,saved_at=excluded.saved_at,data=excluded.data',
      ).run(rev, at, JSON.stringify(workspace));
      db.prepare(
        'DELETE FROM snapshots WHERE id NOT IN (SELECT id FROM snapshots ORDER BY created_at DESC LIMIT 30)',
      ).run();
    })();
    return { ok: true, exists: true, workspace, rev, savedAt: at, path: this.file };
  }
  snapshots(): { id: string; createdAt: string; label: string }[] {
    return (this.db
      ?.prepare('SELECT id,created_at AS createdAt,label FROM snapshots ORDER BY created_at DESC')
      .all() || []) as { id: string; createdAt: string; label: string }[];
  }
  snapshot(id: string): Workspace | null {
    const row = this.db?.prepare('SELECT data FROM snapshots WHERE id=?').get(id) as
      { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  }
  insertRun(run: Run): void {
    this.open()
      .prepare('INSERT INTO runs VALUES(?,?,?,?,?)')
      .run(run.id, run.projectId, run.startedAt, run.status, JSON.stringify(run));
  }
  updateRun(run: Run): void {
    this.db
      ?.prepare('UPDATE runs SET status=?,data=? WHERE id=?')
      .run(run.status, JSON.stringify(run), run.id);
  }
  event(id: string, event: RunEvent): void {
    this.db
      ?.prepare('INSERT OR IGNORE INTO run_events VALUES(?,?,?)')
      .run(id, event.seq, JSON.stringify(event));
  }
  run(id: string): Run | null {
    const row = this.db?.prepare('SELECT data FROM runs WHERE id=?').get(id) as
      { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  }
  events(id: string, after = 0): RunEvent[] {
    return (
      this.db
        ?.prepare('SELECT data FROM run_events WHERE run_id=? AND seq>? ORDER BY seq')
        .all(id, after) || []
    ).map((row) => JSON.parse((row as { data: string }).data));
  }
  usageRuns(since: number): Run[] {
    return (
      this.db
        ?.prepare(
          'SELECT data FROM runs WHERE started_at >= ? AND started_at <= ? ORDER BY started_at',
        )
        .all(new Date(since).toISOString(), new Date().toISOString()) || []
    ).map((row) => JSON.parse((row as { data: string }).data) as Run);
  }
  runs(projectId = ''): Run[] {
    return (
      this.db
        ?.prepare(
          "SELECT data FROM runs WHERE (?='' OR project_id=?) ORDER BY started_at DESC LIMIT 300",
        )
        .all(projectId, projectId) || []
    ).map((row) => JSON.parse((row as { data: string }).data));
  }
  close(): void {
    this.db?.close();
    this.db = null;
  }
}
