import { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Play, RotateCcw, StepForward, Shuffle } from 'lucide-react';

const W = 520, H = 400;
const CLS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];
const rnd = (s) => { let x = s; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

function preset(name) {
  const r = rnd(Date.now() % 1000 + 7);
  const pts = [];
  if (name === 'blobs') { for (let i = 0; i < 30; i++) { pts.push({ x: 0.3 + gauss(r) * 0.08, y: 0.35 + gauss(r) * 0.08, c: 0 }); pts.push({ x: 0.68 + gauss(r) * 0.08, y: 0.65 + gauss(r) * 0.08, c: 1 }); } }
  if (name === 'xor') { for (let i = 0; i < 60; i++) { const x = r(), y = r(); pts.push({ x, y, c: (x > 0.5) !== (y > 0.5) ? 1 : 0 }); } }
  if (name === 'circle') { for (let i = 0; i < 80; i++) { const x = r(), y = r(); pts.push({ x, y, c: Math.hypot(x - 0.5, y - 0.5) < 0.25 ? 0 : 1 }); } }
  if (name === 'clusters') { [[0.25, 0.3], [0.7, 0.3], [0.5, 0.72]].forEach(([cx, cy]) => { for (let i = 0; i < 25; i++) pts.push({ x: cx + gauss(r) * 0.06, y: cy + gauss(r) * 0.06, c: 0 }); }); }
  if (name === 'trend') { for (let i = 0; i < 40; i++) { const x = r(); pts.push({ x, y: Math.min(0.98, Math.max(0.02, 0.15 + 0.7 * x + gauss(r) * 0.06)), c: 0 }); } }
  return pts.map((p) => ({ ...p, x: Math.min(0.99, Math.max(0.01, p.x)), y: Math.min(0.99, Math.max(0.01, p.y)) }));
}

const knnPredict = (pts, x, y, k) => {
  const d = pts.map((p) => [Math.hypot(p.x - x, p.y - y), p.c]).sort((a, b) => a[0] - b[0]).slice(0, k);
  const votes = {}; d.forEach(([, c]) => { votes[c] = (votes[c] || 0) + 1; });
  return Number(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]);
};
const sig = (z) => 1 / (1 + Math.exp(-z));

export default function MlPlayground() {
  const cv = useRef(null);
  const [algo, setAlgo] = useState('knn');
  const [pts, setPts] = useState(() => preset('blobs'));
  const [cls, setCls] = useState(0);
  const [k, setK] = useState(5);
  const [lr, setLr] = useState({ w: [0, 0, 0], epoch: 0, loss: null });
  const [rate, setRate] = useState(1.0);
  const [km, setKm] = useState({ k: 3, cents: null, iter: 0, assign: [] });
  const [running, setRunning] = useState(false);

  const isCls = algo === 'knn' || algo === 'logreg';
  const loadPreset = (n) => { setPts(preset(n)); setLr({ w: [0, 0, 0], epoch: 0, loss: null }); setKm((m) => ({ ...m, cents: null, iter: 0, assign: [] })); };

  // ---------- training helpers ----------
  const logregStep = useCallback((st, steps = 20) => {
    let [w0, w1, b] = st.w; let loss = 0;
    const data = pts.filter((p) => p.c <= 1);
    for (let s = 0; s < steps; s++) {
      let g0 = 0, g1 = 0, gb = 0; loss = 0;
      data.forEach((p) => { const z = w0 * (p.x - 0.5) * 4 + w1 * (p.y - 0.5) * 4 + b; const h = sig(z); const e = h - p.c; g0 += e * (p.x - 0.5) * 4; g1 += e * (p.y - 0.5) * 4; gb += e; loss += -(p.c * Math.log(h + 1e-9) + (1 - p.c) * Math.log(1 - h + 1e-9)); });
      const n = data.length || 1; w0 -= rate * g0 / n; w1 -= rate * g1 / n; b -= rate * gb / n; loss /= n;
    }
    return { w: [w0, w1, b], epoch: st.epoch + steps, loss };
  }, [pts, rate]);

  const kmStep = useCallback((st) => {
    let cents = st.cents;
    if (!cents) { const r = rnd(42); cents = Array.from({ length: st.k }, () => pts[Math.floor(r() * pts.length)] || { x: r(), y: r() }).map((p) => ({ x: p.x, y: p.y })); }
    const assign = pts.map((p) => cents.map((c, i) => [Math.hypot(p.x - c.x, p.y - c.y), i]).sort((a, b) => a[0] - b[0])[0][1]);
    const next = cents.map((c, i) => { const mine = pts.filter((_, j) => assign[j] === i); return mine.length ? { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length } : c; });
    const inertia = pts.reduce((s, p, j) => s + (p.x - next[assign[j]].x) ** 2 + (p.y - next[assign[j]].y) ** 2, 0);
    return { ...st, cents: next, assign, iter: st.iter + 1, inertia };
  }, [pts]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      if (algo === 'logreg') setLr((s) => (s.epoch > 3000 ? (setRunning(false), s) : logregStep(s, 25)));
      if (algo === 'kmeans') setKm((s) => { const n = kmStep(s); if (s.assign.length && n.assign.every((a, i) => a === s.assign[i])) setRunning(false); return n; });
    }, 120);
    return () => clearInterval(id);
  }, [running, algo, logregStep, kmStep]);

  // linear regression (closed form)
  const reg = (() => {
    if (pts.length < 2) return null;
    const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
    const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0), sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const m = sxx ? sxy / sxx : 0, c = my - m * mx;
    const mse = pts.reduce((s, p) => s + (p.y - (m * p.x + c)) ** 2, 0) / n;
    const sst = pts.reduce((s, p) => s + (p.y - my) ** 2, 0);
    return { m, c, mse, r2: sst ? 1 - (mse * n) / sst : 0 };
  })();

  const predict = (x, y) => (algo === 'knn' ? knnPredict(pts, x, y, Math.min(k, pts.length)) : sig(lr.w[0] * (x - 0.5) * 4 + lr.w[1] * (y - 0.5) * 4 + lr.w[2]) > 0.5 ? 1 : 0);
  const acc = isCls && pts.length && (algo === 'knn' || lr.epoch) ? pts.filter((p) => predict(p.x, p.y) === p.c).length / pts.length : null;
  const cm = isCls && acc != null ? [[0, 0], [0, 0]] : null;
  if (cm) pts.forEach((p) => { if (p.c <= 1) cm[p.c][predict(p.x, p.y)] += 1; });

  // ---------- draw ----------
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const g = c.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    if (isCls && pts.some((p) => p.c === 0) && pts.some((p) => p.c === 1) && (algo === 'knn' || lr.epoch)) {
      const S = 10;
      for (let i = 0; i < W; i += S) for (let j = 0; j < H; j += S) { const pc = predict((i + S / 2) / W, 1 - (j + S / 2) / H); g.fillStyle = pc ? 'rgba(220,38,38,0.13)' : 'rgba(37,99,235,0.13)'; g.fillRect(i, j, S, S); }
    }
    g.strokeStyle = '#e5e7eb'; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo((i * W) / 10, 0); g.lineTo((i * W) / 10, H); g.moveTo(0, (i * H) / 10); g.lineTo(W, (i * H) / 10); g.stroke(); }
    if (algo === 'linreg' && reg) { g.strokeStyle = '#d97706'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, H - reg.c * H); g.lineTo(W, H - (reg.m + reg.c) * H); g.stroke(); g.lineWidth = 1;
      g.strokeStyle = 'rgba(217,119,6,0.4)'; pts.forEach((p) => { g.beginPath(); g.moveTo(p.x * W, H - p.y * H); g.lineTo(p.x * W, H - (reg.m * p.x + reg.c) * H); g.stroke(); }); }
    pts.forEach((p, i) => {
      const col = algo === 'kmeans' ? (km.assign.length ? CLS[km.assign[i] % CLS.length] : '#6b7280') : algo === 'linreg' ? '#374151' : CLS[p.c];
      g.fillStyle = col; g.beginPath(); g.arc(p.x * W, H - p.y * H, 5, 0, 2 * Math.PI); g.fill(); g.strokeStyle = '#fff'; g.stroke();
    });
    if (algo === 'kmeans' && km.cents) km.cents.forEach((ct, i) => { g.fillStyle = CLS[i % CLS.length]; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.rect(ct.x * W - 8, H - ct.y * H - 8, 16, 16); g.fill(); g.stroke(); g.lineWidth = 1; });
  });

  const onClick = (e) => {
    const r = cv.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    setPts((ps) => [...ps, { x, y, c: isCls ? cls : 0 }]);
    setKm((m) => ({ ...m, cents: null, iter: 0, assign: [] }));
  };

  const ALGOS = [['knn', 'K-Nearest Neighbours'], ['logreg', 'Logistic Regression'], ['kmeans', 'K-Means Clustering'], ['linreg', 'Linear Regression']];
  return (
    <div className="ai-page">
      <div className="page-head">
        <h1><Network className="hicon" /> ML Playground</h1>
        <p className="muted">See machine learning work. Click on the canvas to add data points, choose an algorithm and watch it learn.</p>
      </div>
      <div className="chips">{ALGOS.map(([a, l]) => <button key={a} className={`chip ${algo === a ? 'active' : ''}`} onClick={() => { setAlgo(a); setRunning(false); if (a === 'kmeans') loadPreset('clusters'); if (a === 'linreg') loadPreset('trend'); if (a === 'knn' || a === 'logreg') loadPreset('blobs'); }}>{l}</button>)}</div>
      <div className="ml-layout">
        <div className="card">
          <canvas ref={cv} width={W} height={H} className="ml-canvas" onClick={onClick} />
          <div className="row-btns">
            {isCls && <>Add points of class: {[0, 1].map((c) => <button key={c} className={`btn small ${cls === c ? 'primary' : ''}`} onClick={() => setCls(c)} style={{ borderColor: CLS[c] }}>● Class {c === 0 ? 'A (blue)' : 'B (red)'}</button>)}</>}
            <select value="" onChange={(e) => e.target.value && loadPreset(e.target.value)}>
              <option value="">Dataset…</option>
              {isCls && <><option value="blobs">Two groups (easy)</option><option value="xor">XOR (hard for straight lines)</option><option value="circle">Circle inside ring</option></>}
              {algo === 'kmeans' && <option value="clusters">Three clusters</option>}
              {algo === 'linreg' && <option value="trend">Linear trend</option>}
            </select>
            <button className="btn small" onClick={() => { setPts([]); setLr({ w: [0, 0, 0], epoch: 0, loss: null }); setKm((m) => ({ ...m, cents: null, iter: 0, assign: [] })); }}><RotateCcw size={12} /> Clear</button>
            <span className="muted small">{pts.length} points</span>
          </div>
        </div>
        <div className="card">
          {algo === 'knn' && (<>
            <h3>K-Nearest Neighbours</h3>
            <p className="muted small">A new point gets the class most common among its <b>k</b> nearest training points. The shaded background shows what the model predicts everywhere.</p>
            <label>k = {k} <input type="range" min="1" max="25" value={k} onChange={(e) => setK(Number(e.target.value))} /></label>
            <p className="muted small">Small k: wiggly boundary that can overfit. Large k: smoother boundary that can underfit.</p>
          </>)}
          {algo === 'logreg' && (<>
            <h3>Logistic Regression</h3>
            <p className="muted small">Learns a straight-line boundary with <b>gradient descent</b>: each step nudges the weights to reduce the log-loss.</p>
            <label>Learning rate {rate.toFixed(1)} <input type="range" min="0.1" max="5" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label>
            <div className="row-btns">
              <button className="btn primary" onClick={() => setRunning(!running)}><Play size={14} /> {running ? 'Pause' : 'Train'}</button>
              <button className="btn" onClick={() => setLr((s) => logregStep(s, 25))}><StepForward size={14} /> 25 steps</button>
              <button className="btn" onClick={() => setLr({ w: [0, 0, 0], epoch: 0, loss: null })}><Shuffle size={14} /> Reset</button>
            </div>
            <div className="muted small">Steps: {lr.epoch} · loss: {lr.loss == null ? '–' : lr.loss.toFixed(4)} · w = [{lr.w.map((v) => v.toFixed(2)).join(', ')}]</div>
            <p className="muted small">Try the XOR dataset: a single straight line can't separate it. That's why we need non-linear models such as KNN, trees or neural networks.</p>
          </>)}
          {algo === 'kmeans' && (<>
            <h3>K-Means Clustering</h3>
            <p className="muted small">Unsupervised: no labels. Repeat: 1) assign each point to the nearest centroid (square), 2) move each centroid to the mean of its points, until nothing changes.</p>
            <label>k = {km.k} <input type="range" min="2" max="5" value={km.k} onChange={(e) => setKm({ k: Number(e.target.value), cents: null, iter: 0, assign: [] })} /></label>
            <div className="row-btns">
              <button className="btn primary" onClick={() => setKm((s) => kmStep(s))}><StepForward size={14} /> One step</button>
              <button className="btn" onClick={() => setRunning(!running)}><Play size={14} /> {running ? 'Pause' : 'Run'}</button>
              <button className="btn" onClick={() => setKm((m) => ({ ...m, cents: null, iter: 0, assign: [] }))}><Shuffle size={14} /> Reset</button>
            </div>
            <div className="muted small">Iterations: {km.iter}{km.inertia != null && ` · inertia (within-cluster spread): ${km.inertia.toFixed(4)}`}</div>
          </>)}
          {algo === 'linreg' && reg && (<>
            <h3>Linear Regression</h3>
            <p className="muted small">Finds the line <b>y = m·x + c</b> that minimises the squared vertical errors (orange dashes). Click to add points and watch the line refit.</p>
            <table className="data-table"><tbody>
              <tr><td>slope m</td><td>{reg.m.toFixed(3)}</td></tr><tr><td>intercept c</td><td>{reg.c.toFixed(3)}</td></tr>
              <tr><td>MSE</td><td>{reg.mse.toFixed(5)}</td></tr><tr><td>R²</td><td>{reg.r2.toFixed(3)}</td></tr>
            </tbody></table>
            <p className="muted small">Add an extreme point (an outlier) and see how much it pulls the line.</p>
          </>)}
          {acc != null && (<>
            <h4>Evaluation (on training points)</h4>
            <div className="muted">Accuracy: <b>{(acc * 100).toFixed(1)}%</b></div>
            <table className="data-table ml-cm"><thead><tr><th>actual ↓ / predicted →</th><th>A</th><th>B</th></tr></thead>
              <tbody><tr><th>A</th><td className="ok">{cm[0][0]}</td><td className="bad">{cm[0][1]}</td></tr><tr><th>B</th><td className="bad">{cm[1][0]}</td><td className="ok">{cm[1][1]}</td></tr></tbody></table>
            <p className="muted small">In real projects, measure accuracy on a separate <b>test set</b>, not the training data.</p>
          </>)}
        </div>
      </div>
    </div>
  );
}
