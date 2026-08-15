import { extname, resolve, sep } from 'node:path';

const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
});

export function resolveRequestPath(root, requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.split('?')[0]);
  } catch {
    throw new Error('Malformed URL');
  }
  const segments = pathname.replaceAll('\\', '/').split('/').filter(Boolean);
  if (segments.includes('..')) {
    throw new Error('Path traversal');
  }
  const candidate = resolve(root, segments.length === 0 ? 'index.html' : segments.join(sep));
  const normalizedRoot = resolve(root);
  if (candidate !== normalizedRoot && !candidate.startsWith(`${normalizedRoot}${sep}`)) {
    throw new Error('Path traversal');
  }
  return candidate;
}

export function mimeFor(filePath) {
  return MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}
