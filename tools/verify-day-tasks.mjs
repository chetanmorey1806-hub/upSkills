// Dev tool: grade every Day Task model answer with the real in-app grader.
// usage: node tools/verify-day-tasks.mjs <trackKey> [id1,id2]   (needs `npx vite --port 5199` running)
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [track, only] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9500 + Math.floor(Math.random() * 400);
const dir = mkdtempSync(join(tmpdir(), 'verify-chrome-'));
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
let list; for (let i = 0; i < 80; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {};
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: `http://localhost:5199/#/dev/verify-tasks/${track}${only ? `?only=${only}` : ''}` });
let report = null;
for (let i = 0; i < 1200 && !report; i++) {
  await sleep(1000);
  const r = await send('Runtime.evaluate', { expression: `(()=>{try{const o=JSON.parse(document.getElementById('verify-out')?.textContent||'null'); return o&&o.status==='done'?JSON.stringify(o.report):null}catch{return null}})()`, returnByValue: true });
  if (r.result?.result?.value) report = JSON.parse(r.result.result.value);
}
ws.close(); chrome.kill();
if (!report) { console.log('TIMEOUT: verifier did not finish'); process.exit(2); }
console.log(`track ${report.track}: ${report.files} files, ${report.tasks} tasks, ${report.passed} model answers pass`);
for (const e of report.errors) console.log(`✗ ${e.lesson}${e.task ? ` #${e.task}` : ''}: ${e.msg}`);
console.log(report.ok && report.files ? 'ALL OK' : report.files ? 'FAILED' : 'NO FILES');
process.exit(report.ok ? 0 : 1);
