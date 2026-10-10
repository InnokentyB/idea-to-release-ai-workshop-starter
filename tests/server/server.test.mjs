import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

async function startServer(t) {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'pipe' });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  t.after(() => child.kill());
  const origin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    try {
      if ((await fetch(`${origin}/health`)).ok) return origin;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Server failed to start: ${logs}`);
}

test('malformed encoded paths receive 400 and do not crash the release server', async t => {
  const origin = await startServer(t);
  const response = await fetch(`${origin}/%E0%A4%A`);
  assert.equal(response.status, 400);
  assert.equal((await fetch(`${origin}/health`)).status, 200);
});

test('directory requests cannot crash the server; SPA routes and assets stay available', async t => {
  const origin = await startServer(t);
  const response = await fetch(`${origin}/assets/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(await response.text(), /<div id="root"><\/div>/);
  assert.equal((await fetch(`${origin}/health`)).status, 200);
});

test('encoded traversal never serves repository files', async t => {
  const origin = await startServer(t);
  const response = await fetch(`${origin}/..%2F..%2Fpackage.json`);
  assert.ok(response.status === 400 || response.status === 404 || response.status === 200);
  assert.match(response.headers.get('content-type'), /text\/html|text\/plain/);
  assert.doesNotMatch(await response.text(), /"dependencies"/);
  assert.equal((await fetch(`${origin}/health`)).status, 200);
});

test('public server supports HEAD and rejects writes without affecting health', async t => {
  const origin = await startServer(t);
  const head = await fetch(origin, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.match(head.headers.get('content-type'), /text\/html/);
  const write = await fetch(origin, { method: 'POST', body: 'no write endpoint' });
  assert.equal(write.status, 405);
  assert.equal(write.headers.get('allow'), 'GET, HEAD');
  assert.equal((await fetch(`${origin}/health`)).status, 200);
});
