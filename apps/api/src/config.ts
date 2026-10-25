import path from 'node:path';
export const root = path.resolve(process.env['LUMA_ROOT'] || process.cwd());
export const config = {
  root,
  host: '127.0.0.1',
  port: Number(process.env['LUMA_PORT']) || 4318,
  dataDir: path.resolve(process.env['LUMA_DATA_DIR'] || path.join(root, 'data')),
  projectsDir: path.resolve(process.env['LUMA_PROJECTS_DIR'] || path.join(root, 'projects')),
  webDir: path.join(root, 'dist/web/browser'),
};
