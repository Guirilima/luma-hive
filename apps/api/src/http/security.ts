import crypto from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { HttpError } from '../shared/errors';
export const token = crypto.randomBytes(32).toString('hex');
export function checkRequest(request: IncomingMessage, port: number, url: URL): void {
  const host = request.headers.host || '';
  if (
    !new Set([`127.0.0.1:${port}`, `localhost:${port}`, `127.0.0.1:4200`, `localhost:4200`]).has(
      host,
    )
  )
    throw new HttpError(421, 'Invalid host');
  const origin = request.headers.origin;
  if (
    origin &&
    !new Set([
      `http://127.0.0.1:${port}`,
      `http://localhost:${port}`,
      'http://127.0.0.1:4200',
      'http://localhost:4200',
    ]).has(origin)
  )
    throw new HttpError(403, 'Invalid origin');
  if (
    url.pathname.startsWith('/api/') &&
    url.pathname !== '/api/session' &&
    request.headers['x-luma-token'] !== token &&
    url.searchParams.get('token') !== token
  )
    throw new HttpError(401, 'Session expired; reload the page');
}
