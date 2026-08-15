import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mimeFor, resolveRequestPath } from './server-core.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '4173', 10);

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  let filePath;
  try {
    filePath = resolveRequestPath(root, request.url ?? '/');
  } catch (error) {
    const malformed = error instanceof Error && error.message === 'Malformed URL';
    response.writeHead(malformed ? 400 : 403).end(malformed ? 'Malformed URL' : 'Forbidden');
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      throw new Error('Not a file');
    }
    response.writeHead(200, {
      'Content-Type': mimeFor(filePath),
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      response.end();
    } else {
      createReadStream(filePath).pipe(response);
    }
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — Không tìm thấy');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Taiwan 3D Map: http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
