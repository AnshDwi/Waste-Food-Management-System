import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import http from 'node:http';

const port = 5173;
const root = join(process.cwd(), 'dist');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const sendFile = (res, filePath) => {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] ?? 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  });
  createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const requestPath = req.url?.split('?')[0] ?? '/';
  const normalized = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(root, normalized === '/' ? 'index.html' : normalized);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (!existsSync(filePath)) {
    filePath = join(root, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('dist not found');
    return;
  }

  sendFile(res, filePath);
});

server.listen(port, () => {
  console.log(`web preview listening on port ${port}`);
});
