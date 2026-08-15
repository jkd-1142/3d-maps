import { describe, expect, it } from 'vitest';
import { resolveRequestPath, mimeFor } from '../../tools/server-core.mjs';

describe('S16 static server path and MIME policy', () => {
  it('resolves safe paths inside root and blocks traversal', () => {
    const root = 'C:\\project';
    expect(resolveRequestPath(root, '/')).toBe('C:\\project\\index.html');
    expect(resolveRequestPath(root, '/src/main.js?x=1')).toBe('C:\\project\\src\\main.js');
    expect(() => resolveRequestPath(root, '/../secret.txt')).toThrow('Path traversal');
    expect(() => resolveRequestPath(root, '/%2e%2e/secret.txt')).toThrow('Path traversal');
    expect(() => resolveRequestPath(root, '/%E0%A4%A')).toThrow('Malformed URL');
  });

  it('returns exact MIME values', () => {
    expect(mimeFor('index.html')).toBe('text/html; charset=utf-8');
    expect(mimeFor('main.js')).toBe('text/javascript; charset=utf-8');
    expect(mimeFor('shape.json')).toBe('application/json; charset=utf-8');
    expect(mimeFor('unknown.bin')).toBe('application/octet-stream');
  });
});
