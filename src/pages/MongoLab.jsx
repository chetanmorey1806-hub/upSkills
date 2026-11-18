import { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { createShell, shellFromDatasets, formatValue } from '../engine/mongoShell.js';
import { runChallenge } from '../engine/mongoChallenge.js';
import { DATASETS } from '../data/mongoDatasets.js';
import { CHALLENGES, CHALLENGE_LEVELS, CHEATSHEET } from '../data/mongoChallenges.js';

export const MONGO_LOAD_KEY = 'upskillr-mongo-load';
const STORE = 'upskillr-mongo-lab-v1';
const readStore = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
const saveStore = (patch) => { try { localStorage.setItem(STORE, JSON.stringify({ ...readStore(), ...patch })); } catch { /* ignore */ } };

const START = `// MongoDB shell (mongosh) in your browser. Press Ctrl+Enter or ▶ Run.
show collections

db.products.find({ price: { $gt: 50000 } }, { name: 1, price: 1, _id: 0 })
  .sort({ price: -1 })
`;

function makeShell(snapshot, dataset) {
  if (snapshot?.dbs) return createShell(snapshot, snapshot.current);
  return shellFromDatasets(DATASETS, dataset || 'shop');
}

function DocsTable({ docs }) {
  const cols = useMemo(() => [...new Set(docs.flatMap((d) => (d && typeof d === 'object' ? Object.keys(d) : [])))], [docs]);
  if (!docs.length) return <div className="pg-muted">No documents.</div>;
  const cell = (v) => (v === undefined ? '' : v !== null && typeof v === 'object' && !(v instanceof Date) ? formatValue(v) : formatValue(v));
  return (
    <div className="table-wrap tall">
      <table className="wb-grid">
        <thead><tr><th className="rn">#</th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{docs.map((d, i) => <tr key={i}><td className="rn">{i + 1}</td>{cols.map((c) => <td key={c} className={typeof d[c] === 'number' ? 'num' : ''}>{cell(d[c])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function MongoLab() {
  const initial = useMemo(() => {
    const st = readStore();
    let load = null;
    try { load = JSON.parse(sessionStorage.getItem(MONGO_LOAD_KEY)); sessionStorage.removeItem(MONGO_LOAD_KEY); } catch { /* ignore */ }
    if (load?.query) return { code: load.query, dataset: load.dataset || 'shop', title: load.title, expected: load.expected, fresh: true, st };
    return { code: st.code || START, dataset: st.dataset || 'shop', st };
  }, []);

  const shellRef = useRef(null);
  if (!shellRef.current) shellRef.current = initial.fresh ? shellFromDatasets(DATASETS, initial.dataset) : makeShell(initial.st.snapshot, initial.dataset);
  const [code, setCode] = useState(initial.code);
  const [log, setLog] = useState([]);
  const [panel, setPanel] = useState(initial.expected ? 'expected' : 'output');
  const [, force] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [chId, setChId] = useState(initial.st.challenge || CHALLENGES[0].id);
  const [chResult, setChResult] = useState(null);
  const [solved, setSolved] = useState(initial.st.solved || {});
  const [showSol, setShowSol] = useState(false);
  const outRef = useRef(null);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { saveStore({ code }); }, [code]);
  useEffect(() => { outRef.current?.scrollTo(0, outRef.current.scrollHeight); }, [log]);

  const sh = shellRef.current;
  const current = sh.state.current;
  const collections = Object.entries(sh.state.dbs[current] || {});
  const lastDocs = [...log].reverse().find((r) => r.kind === 'docs');
  const ch = CHALLENGES.find((c) => c.id === chId) || CHALLENGES[0];

  const persist = () => { saveStore({ snapshot: sh.snapshot(), dataset: sh.state.current }); force((n) => n + 1); };
  const run = (src = code) => {
    const sel = src.trim();
    if (!sel) return;
    const res = sh.run(sel);
    setLog((l) => [...l, { kind: 'sep', text: `── ${new Date().toLocaleTimeString()} ──` }, ...res].slice(-300));
    if (panel !== 'output' && panel !== 'table') setPanel('output');
    persist();
  };
  const switchDb = (name) => { run(`use ${name}`); };
  const reset = () => {
    if (!window.confirm('Reset all sample databases to their original data? Your inserts/updates will be lost.')) return;
    shellRef.current = shellFromDatasets(DATASETS, current in DATASETS ? current : 'shop');
    setLog([{ kind: 'info', text: 'All sample databases were reset.' }]);
    persist();
  };
  const check = () => {
    const r = runChallenge(ch, code);
    setChResult(r);
    if (r.ok) { const s = { ...solved, [ch.id]: true }; setSolved(s); saveStore({ solved: s }); }
  };
  const pickChallenge = (id) => {
    const c = CHALLENGES.find((x) => x.id === id);
    setChId(id); setChResult(null); setShowSol(false); setPanel('challenge'); saveStore({ challenge: id });
    if (c && c.dataset !== sh.state.current) switchDb(c.dataset);
    setPanel('challenge');
  };
  const onMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selText = editor.getModel().getValueInRange(editor.getSelection());
      run(selText.trim() ? selText : editor.getValue());
    });
  };
  const solvedCount = Object.keys(solved).filter((k) => CHALLENGES.some((c) => c.id === k)).length;

  return (
    <div className="jide mongo-lab">
      <div className="jide-top">
        <div className="jide-title">
          <span className="jide-logo mongo">🍃</span>
          <b>MongoDB Shell Lab</b>
          <span className="jide-sub">mongosh in your browser · db: <b>{current}</b>{initial.title ? ` · ${initial.title}` : ''}</span>
        </div>
        <div className="jide-actions">
          <select value={current in DATASETS ? current : ''} onChange={(e) => switchDb(e.target.value)}>
            {!(current in DATASETS) && <option value="">{current}</option>}
            {Object.entries(DATASETS).map(([k, d]) => <option key={k} value={k}>🗄 {k} ({d.title})</option>)}
          </select>
          <button className="btn small primary" onClick={() => run()} title="Ctrl+Enter (runs the selection if you selected text)">▶ Run</button>
          <button className="btn small" onClick={() => setLog([])}>🧹 Clear</button>
          <button className="btn small" onClick={reset}>↺ Reset data</button>
        </div>
      </div>

      <div className="jide-body mongo-body">
        <aside className="jide-tree">
          <div className="jide-tree-head"><span>Databases</span></div>
          {Object.keys(sh.state.dbs).map((dbn) => (
            <div key={dbn}>
              <div className={`jide-node mongo-db ${dbn === current ? 'on' : ''}`} onClick={() => dbn !== current && switchDb(dbn)}>{dbn === current ? '▾' : '▸'} 🗄 {dbn}</div>
              {dbn === current && collections.map(([c, docs]) => (
                <div key={c} className="jide-file" onClick={() => { const q = `db.${c}.find().limit(5)`; setCode((x) => `${x.trimEnd()}\n\n${q}\n`); run(q); }} title={`Click to run db.${c}.find().limit(5)`}>
                  <span>📄 {c}</span><span className="muted small">{docs.length}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="jide-help">
            <b>Sample data</b><br />{DATASETS[current]?.about || 'Your own database'}<br /><br />
            Ctrl+Enter: run all (or the selected lines)<br />
            <code>use shop</code> · <code>show collections</code><br />
            Data is saved in your browser.
          </div>
        </aside>

        <section className="jide-editor">
          <div className="pg-tabs"><button className="pg-tab on">🍃 query.mongodb.js</button></div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} />
            ) : (
              <Editor language="javascript" path="query.mongodb.js" theme="vs-dark" value={code} onMount={onMount} onChange={(v) => setCode(v ?? '')}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />
            )}
          </div>
        </section>

        <section className="jide-bottom">
          <div className="jide-ptabs">
            {[['output', '▶ Shell output'], ['table', `▦ Table${lastDocs ? ` (${lastDocs.docs.length})` : ''}`], ['challenge', `🎯 Challenges ${solvedCount}/${CHALLENGES.length}`], ['cheat', '📋 Cheat sheet'], ...(initial.expected ? [['expected', '📋 Expected']] : [])].map(([k, l]) => (
              <button key={k} className={panel === k ? 'on' : ''} onClick={() => setPanel(k)}>{l}</button>
            ))}
          </div>
          <div className="jide-pbody" ref={outRef}>
            {panel === 'output' && (log.length ? (
              <pre className="jide-out mongo-out">{log.map((r, i) => (
                <div key={i} className={`mo-${r.kind}`}>
                  {r.input && <div className="mo-in">{current}&gt; {r.input.length > 160 ? `${r.input.slice(0, 160)}…` : r.input}</div>}
                  {r.text}
                </div>
              ))}</pre>
            ) : <div className="pg-muted">Write a query and press ▶ Run (Ctrl+Enter). Try: <code>db.products.find()</code></div>)}
            {panel === 'table' && (lastDocs ? <DocsTable docs={lastDocs.docs} /> : <div className="pg-muted">Run a find() or aggregate() to see documents as a table.</div>)}
            {panel === 'expected' && <pre className="jide-out">{initial.expected}</pre>}
            {panel === 'cheat' && (
              <div className="mongo-cheat">{CHEATSHEET.map(([k, q]) => (
                <button key={k} className="wb-snip" onClick={() => setCode((x) => `${x.trimEnd()}\n\n${q}\n`)}><b>{k}</b> <code>{q}</code></button>
              ))}</div>
            )}
            {panel === 'challenge' && (
              <div className="mongo-ch">
                <div className="mongo-ch-top">
                  <select value={ch.id} onChange={(e) => pickChallenge(e.target.value)}>
                    {CHALLENGE_LEVELS.map((lv) => (
                      <optgroup key={lv} label={lv}>{CHALLENGES.filter((c) => c.level === lv).map((c) => <option key={c.id} value={c.id}>{solved[c.id] ? '✅ ' : ''}{c.title}</option>)}</optgroup>
                    ))}
                  </select>
                  <span className="muted small">db: {ch.dataset}</span>
                </div>
                <p className="mongo-task"><b>Task:</b> {ch.task}</p>
                <div className="row-btns">
                  <button className="btn small primary" onClick={check}>✔ Check my answer</button>
                  <button className="btn small" onClick={() => setShowSol((s) => !s)}>{showSol ? 'Hide' : '💡 Hint / solution'}</button>
                  <button className="btn small" onClick={() => { const i = CHALLENGES.findIndex((c) => c.id === ch.id); pickChallenge(CHALLENGES[(i + 1) % CHALLENGES.length].id); }}>Next ⏭</button>
                </div>
                <p className="muted small">Your editor code runs on a fresh copy of the <b>{ch.dataset}</b> data. The last query's result is compared with the expected result.</p>
                {chResult && (
                  <div className={`mongo-verdict ${chResult.ok ? 'ok' : 'bad'}`}>
                    <b>{chResult.ok ? '✅ Correct!' : '❌ Not yet'}</b> {!chResult.ok && chResult.message}
                    {!chResult.ok && chResult.expected && (
                      <div className="mongo-cmp">
                        <div><span className="muted small">Your result</span><pre>{chResult.got || '(none)'}</pre></div>
                        <div><span className="muted small">Expected</span><pre>{chResult.expected}</pre></div>
                      </div>
                    )}
                  </div>
                )}
                {showSol && <div className="mongo-sol"><div><b>Hint:</b> {ch.hint}</div><pre>{ch.solution}</pre><button className="btn small" onClick={() => setCode(ch.solution)}>Copy to editor</button></div>}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
