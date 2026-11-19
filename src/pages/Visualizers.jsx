import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Play, Pause, StepForward, StepBack, RotateCcw, Shuffle, Copy, Check } from 'lucide-react';
import '../visualizers.css';

import Ico from '../components/Ico.jsx';
/* =====================================================================
   Shared helpers: reduced-motion hook, step player, controls, narration
   ===================================================================== */

const DELAYS = [1600, 1100, 700, 420, 200];

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const m = window.matchMedia(query);
    const h = (e) => setReduced(e.matches);
    if (m.addEventListener) m.addEventListener('change', h);
    else if (m.addListener) m.addListener(h);
    return () => {
      if (m.removeEventListener) m.removeEventListener('change', h);
      else if (m.removeListener) m.removeListener(h);
    };
  }, []);
  return reduced;
}

/** Plays a list of precomputed frames. Every frame has at least `msg`. */
function usePlayer(init) {
  const reduced = useReducedMotion();
  const [st, setSt] = useState(() => ({ frames: typeof init === 'function' ? init() : init, i: 0 }));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const last = st.frames.length - 1;
  const i = Math.min(st.i, last);

  useEffect(() => {
    if (!playing) return undefined;
    if (i >= last) { setPlaying(false); return undefined; }
    if (reduced) {
      setSt((s) => ({ ...s, i: s.frames.length - 1 }));
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setSt((s) => ({ ...s, i: Math.min(s.i + 1, s.frames.length - 1) })), DELAYS[speed - 1]);
    return () => clearTimeout(t);
  }, [playing, i, last, reduced, speed]);

  const go = useCallback((fn) => setSt((s) => ({ ...s, i: Math.max(0, Math.min(fn(s.i), s.frames.length - 1)) })), []);
  const load = useCallback((frames, opts = {}) => {
    setSt({ frames, i: opts.start ?? 0 });
    setPlaying(!!opts.autoplay);
  }, []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = () => {
    if (playing) { setPlaying(false); return; }
    if (i >= last) go(() => 0);
    setPlaying(true);
  };
  const step = () => { setPlaying(false); go((x) => x + 1); };
  const back = () => { setPlaying(false); go((x) => x - 1); };
  const reset = () => { setPlaying(false); go(() => 0); };

  return { frames: st.frames, frame: st.frames[i], i, last, playing, speed, setSpeed, reduced, load, pause, toggle, step, back, reset };
}

function Controls({ p, children }) {
  return (
    <div className="vz-controls">
      <div className="row-btns vz-play">
        <button type="button" className="btn primary small" onClick={p.toggle} disabled={p.last === 0}>
          {p.playing ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play</>}
        </button>
        <button type="button" className="btn small" onClick={p.back} disabled={p.i === 0}><StepBack size={15} /> Back</button>
        <button type="button" className="btn small" onClick={p.step} disabled={p.i >= p.last}><StepForward size={15} /> Step ▶</button>
        <button type="button" className="btn small" onClick={p.reset} disabled={p.i === 0 && !p.playing}><RotateCcw size={15} /> Reset</button>
        <label className="vz-speed small muted">
          Speed
          <input type="range" min="1" max="5" value={p.speed} onChange={(e) => p.setSpeed(Number(e.target.value))} aria-label="Animation speed" />
          <b>{p.speed}x</b>
        </label>
        <span className="vz-count small muted">Step {p.i + 1} / {p.last + 1}</span>
      </div>
      {children && <div className="quiz-settings vz-inputs">{children}</div>}
    </div>
  );
}

function Narration({ msg, tone }) {
  return (
    <div className={`vz-narr ${tone || ''}`} aria-live="polite">
      <span className="vz-narr-label">What is happening</span>
      <div>{msg}</div>
    </div>
  );
}

function KeyCard({ title = 'Key points & complexity', points, children }) {
  return (
    <div className="card vz-keys">
      <h3>{title}</h3>
      {points && <ul className="vz-points">{points.map((t) => <li key={t}>{t}</li>)}</ul>}
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange, label }) {
  return (
    <div className="chips vz-chipgroup" role="group" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.v : o;
        const l = typeof o === 'object' ? o.l : o;
        return (
          <button type="button" key={v} className={`chip${value === v ? ' active' : ''}`} onClick={() => onChange(v)}>{l}</button>
        );
      })}
    </div>
  );
}

const toInt = (s) => {
  const n = Number.parseInt(String(s).trim(), 10);
  return Number.isFinite(n) ? n : null;
};

/* =====================================================================
   1. Sorting
   ===================================================================== */

const SORTS = [
  { v: 'bubble', l: 'Bubble', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  { v: 'selection', l: 'Selection', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'No' },
  { v: 'insertion', l: 'Insertion', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  { v: 'merge', l: 'Merge', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
  { v: 'quick', l: 'Quick', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'No' },
];

const SORT_NOTES = {
  bubble: ['Repeatedly swaps neighbours that are out of order.', 'After pass k, the k largest values are in place.', 'Stops early if a pass makes no swaps (best case O(n)).'],
  selection: ['Finds the minimum of the unsorted part and swaps it to the front.', 'Always n(n-1)/2 comparisons, but at most n-1 swaps.', 'Not stable: a long-distance swap can reorder equal keys.'],
  insertion: ['Grows a sorted left part one element at a time.', 'Great for small or nearly-sorted data (used inside Timsort).', 'Each element shifts left until a smaller value is met.'],
  merge: ['Divide: split in halves until size 1. Conquer: merge sorted halves.', 'Guaranteed O(n log n); needs O(n) extra memory in the usual version.', 'This demo merges in place by moving elements, so "swaps" counts moves.'],
  quick: ['Pick a pivot (here: last element) and partition around it (Lomuto).', 'The pivot lands in its final position after each partition.', 'Worst case O(n²) on already-sorted input with a bad pivot choice.'],
};

function sortFrames(algo, values) {
  const a = values.map((v, id) => ({ v, id }));
  const n = a.length;
  const frames = [];
  const sorted = new Set();
  let comps = 0;
  let swaps = 0;
  const snap = (msg, extra = {}) => frames.push({ arr: a.slice(), comps, swaps, sorted: [...sorted], cmp: [], swp: [], msg, ...extra });
  const sw = (x, y) => { const t = a[x]; a[x] = a[y]; a[y] = t; swaps += 1; };
  const name = SORTS.find((s) => s.v === algo).l;
  snap(`${name} sort on ${n} values. Press Play or Step ▶ to begin.`);

  if (algo === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        comps += 1;
        const big = a[j].v > a[j + 1].v;
        snap(`Pass ${i + 1}: comparing ${a[j].v} and ${a[j + 1].v} → ${big ? 'swap' : 'no swap'}`, { cmp: [j, j + 1] });
        if (big) {
          sw(j, j + 1);
          swapped = true;
          snap(`Swapped: ${a[j].v} now comes before ${a[j + 1].v}`, { swp: [j, j + 1] });
        }
      }
      sorted.add(n - 1 - i);
      if (!swapped) {
        for (let k = 0; k < n; k++) sorted.add(k);
        snap(`No swaps in pass ${i + 1} → the array is already sorted (early exit)`);
        break;
      }
      snap(`End of pass ${i + 1}: ${a[n - 1 - i].v} has bubbled to its final place`);
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      snap(`Pass ${i + 1}: assume ${a[i].v} (index ${i}) is the minimum`, { cmp: [i], min: i });
      for (let j = i + 1; j < n; j++) {
        comps += 1;
        const less = a[j].v < a[m].v;
        snap(`Comparing ${a[j].v} with current minimum ${a[m].v} → ${less ? 'new minimum' : 'keep'}`, { cmp: [j, m], min: m });
        if (less) m = j;
      }
      if (m !== i) {
        sw(i, m);
        sorted.add(i);
        snap(`Swap the minimum ${a[i].v} into position ${i}`, { swp: [i, m] });
      } else {
        sorted.add(i);
        snap(`${a[i].v} is already the minimum – it stays at position ${i}`);
      }
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n; i++) {
      snap(`Pick ${a[i].v} and insert it into the sorted left part [0..${i - 1}]`, { cmp: [i], prefix: i });
      let j = i;
      while (j > 0) {
        comps += 1;
        const gt = a[j - 1].v > a[j].v;
        snap(`Is ${a[j - 1].v} > ${a[j].v}? ${gt ? 'yes → shift it right' : 'no → stop, position found'}`, { cmp: [j - 1, j], prefix: i });
        if (!gt) break;
        sw(j - 1, j);
        snap(`${a[j - 1].v} moves one step left`, { swp: [j - 1, j], prefix: i });
        j -= 1;
      }
    }
  } else if (algo === 'merge') {
    const merge = (lo, mid, hi) => {
      snap(`Merge sorted halves [${lo}..${mid}] and [${mid + 1}..${hi}]`, { range: [lo, hi] });
      let i = lo;
      let m = mid;
      let j = mid + 1;
      while (i <= m && j <= hi) {
        comps += 1;
        const takeRight = a[j].v < a[i].v;
        snap(`Comparing ${a[i].v} and ${a[j].v} → take ${takeRight ? a[j].v : a[i].v}`, { cmp: [i, j], range: [lo, hi] });
        if (takeRight) {
          const x = a[j];
          for (let k = j; k > i; k--) a[k] = a[k - 1];
          a[i] = x;
          swaps += 1;
          snap(`Move ${x.v} into position ${i}`, { swp: [i], range: [lo, hi] });
          m += 1;
          j += 1;
        }
        i += 1;
      }
    };
    const ms = (lo, hi) => {
      if (hi <= lo) return;
      const mid = (lo + hi) >> 1;
      snap(`Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}]`, { range: [lo, hi] });
      ms(lo, mid);
      ms(mid + 1, hi);
      merge(lo, mid, hi);
    };
    ms(0, n - 1);
  } else if (algo === 'quick') {
    const qs = (lo, hi) => {
      if (lo > hi) return;
      if (lo === hi) { sorted.add(lo); snap(`${a[lo].v} is alone in its part → already in its final place`); return; }
      const p = a[hi].v;
      snap(`Partition [${lo}..${hi}] using pivot ${p} (last element)`, { pivot: hi, range: [lo, hi] });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        comps += 1;
        const lt = a[j].v < p;
        snap(`Is ${a[j].v} < pivot ${p}? ${lt ? 'yes → it belongs on the left side' : 'no → leave it'}`, { cmp: [j, hi], pivot: hi, range: [lo, hi] });
        if (lt) {
          if (i !== j) {
            sw(i, j);
            snap(`Swap ${a[j].v} and ${a[i].v} to grow the "< pivot" zone`, { swp: [i, j], pivot: hi, range: [lo, hi] });
          }
          i += 1;
        }
      }
      if (i !== hi) sw(i, hi);
      sorted.add(i);
      snap(`Place pivot ${p} at index ${i} – its final position`, { swp: i !== hi ? [i, hi] : [], range: [lo, hi] });
      qs(lo, i - 1);
      qs(i + 1, hi);
    };
    qs(0, n - 1);
  }
  for (let k = 0; k < n; k++) sorted.add(k);
  snap(`Done! Sorted with ${comps} comparisons and ${swaps} ${algo === 'merge' ? 'moves' : 'swaps'}.`);
  return frames;
}

const randomArray = (len = 10) => Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 60));
const DEFAULT_SORT = [5, 3, 8, 1, 9, 2, 7, 4];

function SortingDemo() {
  const [algo, setAlgo] = useState('bubble');
  const [values, setValues] = useState(DEFAULT_SORT);
  const [text, setText] = useState(DEFAULT_SORT.join(','));
  const [err, setErr] = useState('');
  const p = usePlayer(() => sortFrames('bubble', DEFAULT_SORT));
  const f = p.frame;

  const rebuild = (al, vals) => { p.load(sortFrames(al, vals)); };
  const chooseAlgo = (al) => { setAlgo(al); rebuild(al, values); };
  const randomize = () => {
    const v = randomArray(10);
    setValues(v); setText(v.join(',')); setErr(''); rebuild(algo, v);
  };
  const applyCustom = (e) => {
    e.preventDefault();
    const parts = text.split(/[\s,]+/).filter(Boolean);
    const nums = parts.map(toInt);
    if (nums.some((x) => x === null)) { setErr('Use whole numbers separated by commas, e.g. 5,3,8,1'); return; }
    if (nums.length < 2 || nums.length > 16) { setErr('Enter between 2 and 16 numbers.'); return; }
    if (nums.some((x) => x < 1 || x > 99)) { setErr('Values must be between 1 and 99.'); return; }
    setErr(''); setValues(nums); rebuild(algo, nums);
  };

  const n = f.arr.length;
  const max = Math.max(...f.arr.map((x) => x.v), 1);
  const w = 100 / n;
  const pos = {};
  f.arr.forEach((x, idx) => { pos[x.id] = idx; });
  const byId = [...f.arr].sort((x, y) => x.id - y.id);
  const sortedSet = new Set(f.sorted);
  const cls = (idx) => {
    if (f.swp.includes(idx)) return 'swap';
    if (f.pivot === idx) return 'pivot';
    if (f.cmp.includes(idx)) return 'cmp';
    if (f.min === idx) return 'min';
    if (sortedSet.has(idx)) return 'done';
    if (f.range && (idx < f.range[0] || idx > f.range[1])) return 'dim';
    if (f.prefix !== undefined && idx < f.prefix) return 'prefix';
    return '';
  };

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <ChipGroup label="Algorithm" options={SORTS} value={algo} onChange={chooseAlgo} />
          <button type="button" className="btn small" onClick={randomize}><Shuffle size={15} /> Random array</button>
          <form className="vz-inline-form" onSubmit={applyCustom}>
            <input className="input vz-input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Custom array" placeholder="5,3,8,1" />
            <button type="submit" className="btn small">Use</button>
          </form>
        </Controls>
        {err && <div className="vz-err small">{err}</div>}
        <div className="vz-counters">
          <span>Comparisons <b>{f.comps}</b></span>
          <span>{algo === 'merge' ? 'Moves' : 'Swaps'} <b>{f.swaps}</b></span>
          <span className="vz-legend"><i className="cmp" />comparing <i className="swap" />swapping <i className="done" />sorted{algo === 'quick' && <><i className="pivot" />pivot</>}</span>
        </div>
        <div className="vz-scroll">
          <div className="vz-bars" role="img" aria-label={`Array: ${f.arr.map((x) => x.v).join(', ')}`}>
            {byId.map((x) => {
              const idx = pos[x.id];
              return (
                <div
                  key={x.id}
                  className={`vz-bar ${cls(idx)}`}
                  style={{ left: `calc(${idx * w}% + 2px)`, width: `calc(${w}% - 4px)`, height: `${14 + (x.v / max) * 78}%` }}
                >
                  <span>{x.v}</span>
                </div>
              );
            })}
          </div>
        </div>
        <Narration msg={f.msg} />
      </div>
      <KeyCard points={SORT_NOTES[algo]}>
        <div className="vz-scroll">
          <table className="vz-table">
            <thead><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr></thead>
            <tbody>
              {SORTS.map((s) => (
                <tr key={s.v} className={s.v === algo ? 'hl' : ''}>
                  <td>{s.l}</td><td>{s.best}</td><td>{s.avg}</td><td>{s.worst}</td><td>{s.space}</td><td>{s.stable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   2. Linked List
   ===================================================================== */

let llUid = 100;
const mkNode = (v) => { llUid += 1; return { id: llUid, v }; };
const LL_MAX = 10;

function llFrames(base, op, v, pos) {
  const n = base.length;
  const F = (nodes, msg, extra = {}) => ({ nodes, msg, cur: -1, mark: {}, ...extra });
  const done = (nodes, msg, extra) => F(nodes, msg, extra);

  if ((op === 'head' || op === 'tail' || op === 'pos') && n >= LL_MAX) {
    return [F(base, `List is full for this demo (max ${LL_MAX} nodes). Delete something first.`, { tone: 'bad' })];
  }
  if (op === 'head' || (op === 'pos' && pos === 0) || (op === 'tail' && n === 0)) {
    const node = mkNode(v);
    return [
      F(base, `Create a new node(${v}) in memory`, { pending: node }),
      F(base, `new.next = head ${n ? `(node ${base[0].v})` : '(NULL)'}`, { pending: node, linkHint: true }),
      done([node, ...base], `head = new → ${v} is the new head. Inserting at the head is O(1).`, { mark: { [node.id]: 'new' } }),
    ];
  }
  if (op === 'tail' || op === 'pos') {
    const target = op === 'tail' ? n : pos;
    if (target < 0 || target > n) return [F(base, `Position ${pos} is out of range (valid: 0..${n}).`, { tone: 'bad' })];
    const node = mkNode(v);
    const frames = [F(base, `Create node(${v}); start with curr = head`, { pending: node, cur: 0 })];
    for (let k = 0; k < target; k++) {
      const atEnd = k === target - 1;
      frames.push(F(base, atEnd
        ? `curr = ${base[k].v} is node #${k} – the one before position ${target}. Stop here.`
        : `curr = ${base[k].v}; not there yet → curr = curr.next`, { pending: node, cur: k }));
    }
    frames.push(F(base, `new.next = curr.next (${target < n ? base[target].v : 'NULL'}), then curr.next = new`, { pending: node, cur: target - 1, linkHint: true }));
    const nodes = [...base.slice(0, target), node, ...base.slice(target)];
    frames.push(done(nodes, `Inserted ${v} at position ${target}. Walking there cost O(n) steps.`, { mark: { [node.id]: 'new' } }));
    return frames;
  }
  if (op === 'delete' || op === 'search') {
    if (n === 0) return [F(base, 'The list is empty (head = NULL).', { tone: 'bad' })];
    const frames = [F(base, `${op === 'delete' ? 'Delete' : 'Search for'} ${v}: start with curr = head`, { cur: 0 })];
    for (let k = 0; k < n; k++) {
      const node = base[k];
      if (node.v === v) {
        if (op === 'search') {
          frames.push(F(base, `curr = ${node.v} = ${v} → found at index ${k} after ${k + 1} comparison${k ? 's' : ''}.`, { cur: k, mark: { [node.id]: 'found' }, tone: 'ok' }));
          return frames;
        }
        frames.push(F(base, k === 0
          ? `Found ${v} at the head → head = head.next`
          : `Found ${v}. prev (${base[k - 1].v}).next = curr.next (${k + 1 < n ? base[k + 1].v : 'NULL'})`, { cur: k, mark: { [node.id]: 'del' } }));
        frames.push(done(base.filter((x) => x.id !== node.id), `Node ${v} unlinked and freed. List now has ${n - 1} node${n - 1 === 1 ? '' : 's'}.`, { tone: 'ok' }));
        return frames;
      }
      frames.push(F(base, `curr = ${node.v} ≠ ${v} → ${k + 1 < n ? 'move to curr.next' : 'curr.next is NULL'}`, { cur: k }));
    }
    frames.push(F(base, `Reached NULL – ${v} is not in the list (${n} comparisons, O(n)).`, { tone: 'bad' }));
    return frames;
  }
  return [F(base, 'Unknown operation')];
}

const LL_START = [12, 7, 25, 3].map(mkNode);

function LinkedListDemo() {
  const p = usePlayer(() => [{ nodes: LL_START, msg: 'A singly linked list: each node stores a value and a pointer to the next node.', cur: -1, mark: {} }]);
  const [val, setVal] = useState('42');
  const [pos, setPos] = useState('1');
  const f = p.frame;
  const base = p.frames[p.last].nodes;

  const run = (op) => {
    const v = toInt(val);
    if (v === null) { p.load([{ nodes: base, msg: 'Please enter a whole number value.', cur: -1, mark: {}, tone: 'bad' }]); return; }
    const ps = toInt(pos);
    if (op === 'pos' && ps === null) { p.load([{ nodes: base, msg: 'Please enter a position (0 = head).', cur: -1, mark: {}, tone: 'bad' }]); return; }
    p.load(llFrames(base, op, v, ps ?? 0), { autoplay: true });
  };

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <label>Value <input className="input vz-input vz-num" type="number" value={val} onChange={(e) => setVal(e.target.value)} /></label>
          <label>Position <input className="input vz-input vz-num" type="number" min="0" value={pos} onChange={(e) => setPos(e.target.value)} /></label>
          <div className="row-btns">
            <button type="button" className="btn small" onClick={() => run('head')}>Insert head</button>
            <button type="button" className="btn small" onClick={() => run('tail')}>Insert tail</button>
            <button type="button" className="btn small" onClick={() => run('pos')}>Insert at position</button>
            <button type="button" className="btn small" onClick={() => run('delete')}>Delete value</button>
            <button type="button" className="btn small" onClick={() => run('search')}>Search</button>
            <button type="button" className="btn small" onClick={() => p.load([{ nodes: LL_START, msg: 'List restored to 12 → 7 → 25 → 3.', cur: -1, mark: {} }])}>Reset list</button>
          </div>
        </Controls>
        <div className="vz-scroll">
          <div className="vz-ll-wrap">
            {f.pending && (
              <div className="vz-ll-pending">
                <span className="small muted">new node</span>
                <div className="vz-ll-node new"><div className="vz-ll-val">{f.pending.v}</div><div className="vz-ll-next">{f.linkHint ? '→' : '•'}</div></div>
              </div>
            )}
            <div className="vz-ll">
              {f.nodes.length === 0 && <div className="vz-null">head → NULL</div>}
              {f.nodes.map((node, k) => (
                <Fragment key={node.id}>
                  <div className={`vz-ll-node ${f.mark[node.id] || ''}${f.cur === k ? ' cur' : ''}`}>
                    {k === 0 && <span className="vz-tag top">HEAD</span>}
                    <div className="vz-ll-val">{node.v}</div>
                    <div className="vz-ll-next">•</div>
                    {f.cur === k && <span className="vz-tag bottom">curr</span>}
                  </div>
                  <div className="vz-arrow" aria-hidden="true">→</div>
                </Fragment>
              ))}
              {f.nodes.length > 0 && <div className="vz-null">NULL</div>}
            </div>
          </div>
        </div>
        <Narration msg={f.msg} tone={f.tone} />
      </div>
      <KeyCard points={[
        'Nodes live anywhere in memory; only the next pointers keep them in order.',
        'Insert/delete at head: O(1). Access, search, insert at tail (without a tail pointer): O(n).',
        'No random access: list[5] means walking 5 pointers from head.',
        'Extra memory: one pointer per node (two in a doubly linked list).',
      ]}>
        <table className="vz-table"><tbody>
          <tr><td>Access by index</td><td>O(n)</td></tr>
          <tr><td>Search</td><td>O(n)</td></tr>
          <tr><td>Insert / delete at head</td><td>O(1)</td></tr>
          <tr><td>Insert at position k</td><td>O(k) walk + O(1) relink</td></tr>
          <tr><td>Space</td><td>O(n)</td></tr>
        </tbody></table>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   3. Stack & Queue
   ===================================================================== */

const CAP = 8;
let sqUid = 0;
const mkItem = (v) => { sqUid += 1; return { id: sqUid, v }; };

function sqFrames(mode, data, op, v) {
  const key = mode;
  const list = data[key];
  const F = (arr, msg, extra = {}) => ({ data: { ...data, [key]: arr }, msg, ...extra });
  const isStack = mode === 'stack';
  if (op === 'add') {
    if (list.length >= CAP) {
      return [F(list, `${isStack ? 'Stack Overflow' : 'Queue is full'}! Capacity ${CAP} reached – cannot ${isStack ? 'push' : 'enqueue'} ${v}.`, { tone: 'bad', shake: true })];
    }
    const it = mkItem(v);
    return [
      F(list, `${isStack ? `push(${v})` : `enqueue(${v})`}: size ${list.length} < capacity ${CAP} → room available`),
      F([...list, it], isStack ? `${v} is placed on TOP (size ${list.length + 1}/${CAP}). O(1)` : `${v} joins at the REAR (size ${list.length + 1}/${CAP}). O(1)`, { hl: it.id }),
    ];
  }
  if (list.length === 0) {
    return [F(list, `${isStack ? 'Stack' : 'Queue'} Underflow! It is empty – nothing to ${op === 'peek' ? 'peek at' : isStack ? 'pop' : 'dequeue'}.`, { tone: 'bad', shake: true })];
  }
  const target = isStack ? list[list.length - 1] : list[0];
  if (op === 'peek') {
    return [F(list, `${isStack ? 'peek()' : 'front()'} → ${target.v}. It is only read, not removed. O(1)`, { hl: target.id })];
  }
  const rest = isStack ? list.slice(0, -1) : list.slice(1);
  const nxt = rest.length ? (isStack ? rest[rest.length - 1].v : rest[0].v) : null;
  return [
    F(list, `${isStack ? 'pop()' : 'dequeue()'}: the ${isStack ? 'top' : 'front'} element is ${target.v}`, { hl: target.id, out: target.id }),
    F(rest, `Removed ${target.v}. ${nxt === null ? 'Now empty.' : `New ${isStack ? 'top' : 'front'} is ${nxt}.`} (size ${rest.length}/${CAP})`),
  ];
}

const SQ_START = { stack: [mkItem(4), mkItem(9), mkItem(2)], queue: [mkItem(5), mkItem(1), mkItem(8)] };

function StackQueueDemo() {
  const [mode, setMode] = useState('stack');
  const [val, setVal] = useState('10');
  const p = usePlayer(() => [{ data: SQ_START, msg: 'Stack = LIFO (last in, first out). Queue = FIFO (first in, first out). Capacity is 8.' }]);
  const f = p.frame;
  const base = p.frames[p.last].data;
  const isStack = mode === 'stack';

  const run = (op) => {
    let v = toInt(val);
    if (op === 'add' && v === null) { p.load([{ data: base, msg: 'Please enter a whole number.', tone: 'bad' }]); return; }
    if (v === null) v = 0;
    p.load(sqFrames(mode, base, op, v), { autoplay: true });
    if (op === 'add') setVal(String(v + 1));
  };
  const switchMode = (m) => {
    setMode(m);
    p.load([{ data: base, msg: m === 'stack' ? 'Stack: push/pop/peek all happen at the TOP.' : 'Queue: enqueue at the REAR, dequeue from the FRONT.' }]);
  };

  const list = f.data[mode];
  const slots = Array.from({ length: CAP }, (_, k) => list[k] || null);

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <ChipGroup label="Structure" options={[{ v: 'stack', l: 'Stack (LIFO)' }, { v: 'queue', l: 'Queue (FIFO)' }]} value={mode} onChange={switchMode} />
          <label>Value <input className="input vz-input vz-num" type="number" value={val} onChange={(e) => setVal(e.target.value)} /></label>
          <div className="row-btns">
            <button type="button" className="btn small" onClick={() => run('add')}>{isStack ? 'Push' : 'Enqueue'}</button>
            <button type="button" className="btn small" onClick={() => run('remove')}>{isStack ? 'Pop' : 'Dequeue'}</button>
            <button type="button" className="btn small" onClick={() => run('peek')}>{isStack ? 'Peek' : 'Front'}</button>
          </div>
        </Controls>
        <div className="vz-scroll">
          {isStack ? (
            <div className={`vz-stack${f.shake ? ' shake' : ''}`}>
              {slots.map((it, k) => (
                <div key={it ? it.id : `e${k}`} className={`vz-slot${it ? ' filled' : ''}${it && f.hl === it.id ? ' hl' : ''}${it && f.out === it.id ? ' out' : ''}`}>
                  {it ? it.v : ''}
                  {it && k === list.length - 1 && <span className="vz-side-tag">← top</span>}
                </div>
              ))}
              <div className="vz-stack-base small muted">bottom · size {list.length}/{CAP}</div>
            </div>
          ) : (
            <div className={`vz-queue${f.shake ? ' shake' : ''}`}>
              {slots.map((it, k) => (
                <div key={it ? it.id : `e${k}`} className={`vz-slot${it ? ' filled' : ''}${it && f.hl === it.id ? ' hl' : ''}${it && f.out === it.id ? ' out' : ''}`}>
                  {it ? it.v : ''}
                  {it && k === 0 && <span className="vz-tag top">FRONT</span>}
                  {it && k === list.length - 1 && <span className="vz-tag bottom">REAR</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <Narration msg={f.msg} tone={f.tone} />
      </div>
      <KeyCard points={isStack ? [
        'LIFO: the last item pushed is the first popped – like a pile of plates.',
        'push, pop, peek are all O(1).',
        'Used for: function call stack, undo/redo, matching brackets, DFS.',
        'Pushing onto a full fixed-size stack = overflow; popping an empty one = underflow.',
      ] : [
        'FIFO: the first item enqueued is the first dequeued – like a ticket line.',
        'enqueue, dequeue, front are O(1) (circular buffer or linked list).',
        'Used for: BFS, task scheduling, print queues, message queues.',
        'An array-based queue that shifts elements on dequeue would be O(n) – use a circular buffer.',
      ]}
      />
    </div>
  );
}

/* =====================================================================
   4. Binary Search Tree
   ===================================================================== */

const bstInsert = (n, v) => {
  if (!n) return { v, l: null, r: null };
  if (v < n.v) return { ...n, l: bstInsert(n.l, v) };
  if (v > n.v) return { ...n, r: bstInsert(n.r, v) };
  return n;
};
const bstMin = (n) => (n.l ? bstMin(n.l) : n);
const bstDelete = (n, v) => {
  if (!n) return null;
  if (v < n.v) return { ...n, l: bstDelete(n.l, v) };
  if (v > n.v) return { ...n, r: bstDelete(n.r, v) };
  if (!n.l) return n.r;
  if (!n.r) return n.l;
  const s = bstMin(n.r);
  return { v: s.v, l: n.l, r: bstDelete(n.r, s.v) };
};
const bstCount = (n) => (n ? 1 + bstCount(n.l) + bstCount(n.r) : 0);

function bstLayout(root) {
  const nodes = [];
  const edges = [];
  let x = 0;
  let depth = 0;
  const walk = (n, d, parent) => {
    if (!n) return;
    walk(n.l, d + 1, n);
    const me = { v: n.v, x: x++, y: d };
    nodes.push(me);
    depth = Math.max(depth, d);
    walk(n.r, d + 1, n);
    if (parent) edges.push([parent.v, n.v]);
  };
  walk(root, 0, null);
  return { nodes, edges, depth };
}

const TRAV = {
  inorder: { l: 'Inorder', rule: 'Left → Node → Right (gives sorted order)' },
  preorder: { l: 'Preorder', rule: 'Node → Left → Right (copying a tree)' },
  postorder: { l: 'Postorder', rule: 'Left → Right → Node (deleting a tree)' },
  level: { l: 'Level-order', rule: 'Breadth-first, row by row using a queue' },
};

function bstFrames(root, op, v) {
  const F = (tree, msg, extra = {}) => ({ root: tree, msg, path: [], visited: [], ...extra });
  if (op === 'insert' || op === 'search' || op === 'delete') {
    if (op === 'insert' && bstCount(root) >= 15) return [F(root, 'This demo keeps at most 15 nodes – delete one first.', { tone: 'bad' })];
    const frames = [];
    const path = [];
    let n = root;
    let parent = null;
    if (!n) {
      if (op === 'insert') return [F(bstInsert(null, v), `Tree was empty → ${v} becomes the root.`, { cur: v, tone: 'ok' })];
      return [F(root, 'The tree is empty.', { tone: 'bad' })];
    }
    while (n) {
      path.push(n.v);
      if (v === n.v) break;
      frames.push(F(root, `Compare ${v} with ${n.v} → ${v} ${v < n.v ? '<' : '>'} ${n.v}, go ${v < n.v ? 'LEFT' : 'RIGHT'}`, { path: [...path], cur: n.v }));
      parent = n;
      n = v < n.v ? n.l : n.r;
    }
    if (op === 'insert') {
      if (n) { frames.push(F(root, `${v} already exists – BSTs here keep unique keys, nothing inserted.`, { path: [...path], cur: v, tone: 'bad' })); return frames; }
      const t = bstInsert(root, v);
      frames.push(F(t, `Empty spot found → insert ${v} as the ${v < parent.v ? 'left' : 'right'} child of ${parent.v}. Cost: O(height).`, { path: [...path, v], cur: v, isNew: v, tone: 'ok' }));
      return frames;
    }
    if (!n) { frames.push(F(root, `Reached an empty link – ${v} is not in the tree.`, { path: [...path], tone: 'bad' })); return frames; }
    if (op === 'search') {
      frames.push(F(root, `Compare ${v} with ${n.v} → equal. Found after visiting ${path.length} node${path.length > 1 ? 's' : ''}!`, { path: [...path], cur: v, found: v, tone: 'ok' }));
      return frames;
    }
    // delete
    if (!n.l && !n.r) {
      frames.push(F(root, `Found ${v}. Case 1 – it is a leaf, simply remove it.`, { path: [...path], cur: v, del: v }));
    } else if (!n.l || !n.r) {
      const child = (n.l || n.r).v;
      frames.push(F(root, `Found ${v}. Case 2 – one child (${child}): link the parent directly to ${child}.`, { path: [...path], cur: v, del: v }));
    } else {
      frames.push(F(root, `Found ${v}. Case 3 – two children: find the inorder successor (smallest value in the right subtree).`, { path: [...path], cur: v, del: v }));
      const sp = [...path];
      let s = n.r;
      while (s) {
        sp.push(s.v);
        frames.push(F(root, s.l ? `At ${s.v}: has a left child → keep going left` : `${s.v} has no left child → it is the successor`, { path: sp.slice(), cur: s.v, del: v }));
        s = s.l;
      }
      const succ = bstMin(n.r).v;
      frames.push(F(root, `Copy ${succ} into the node of ${v}, then delete the old ${succ} node (it has at most one child).`, { path: sp.slice(), cur: succ, del: v }));
    }
    frames.push(F(bstDelete(root, v), `${v} deleted. The BST ordering property still holds.`, { tone: 'ok' }));
    return frames;
  }
  // traversals
  if (!root) return [F(root, 'The tree is empty – nothing to traverse.', { tone: 'bad' })];
  const order = [];
  const pre = (n) => { if (n) { order.push(n.v); pre(n.l); pre(n.r); } };
  const ino = (n) => { if (n) { ino(n.l); order.push(n.v); ino(n.r); } };
  const post = (n) => { if (n) { post(n.l); post(n.r); order.push(n.v); } };
  if (op === 'preorder') pre(root);
  else if (op === 'inorder') ino(root);
  else if (op === 'postorder') post(root);
  else {
    const q = [root];
    while (q.length) { const x = q.shift(); order.push(x.v); if (x.l) q.push(x.l); if (x.r) q.push(x.r); }
  }
  const frames = [F(root, `${TRAV[op].l} traversal: ${TRAV[op].rule}.`, { trav: op })];
  order.forEach((x, k) => {
    frames.push(F(root, `Visit ${x} (${k + 1}/${order.length})`, { cur: x, visited: order.slice(0, k + 1), trav: op }));
  });
  frames.push(F(root, `${TRAV[op].l} result: ${order.join(', ')}`, { visited: order, trav: op, tone: 'ok' }));
  return frames;
}

const BST_START = [50, 30, 70, 20, 40, 60, 80].reduce((t, v) => bstInsert(t, v), null);

function BSTDemo() {
  const p = usePlayer(() => [{ root: BST_START, msg: 'Binary Search Tree: everything in the left subtree is smaller, everything in the right is larger.', path: [], visited: [] }]);
  const [val, setVal] = useState('65');
  const f = p.frame;
  const base = p.frames[p.last].root;

  const run = (op) => {
    let v = 0;
    if (op === 'insert' || op === 'search' || op === 'delete') {
      v = toInt(val);
      if (v === null || v < 0 || v > 999) { p.load([{ root: base, msg: 'Enter a whole number between 0 and 999.', path: [], visited: [], tone: 'bad' }]); return; }
    }
    p.load(bstFrames(base, op, v), { autoplay: true });
  };

  const { nodes, edges, depth } = bstLayout(f.root);
  const GX = 52;
  const GY = 66;
  const width = Math.max(nodes.length, 1) * GX + 20;
  const height = (depth + 1) * GY + 20;
  const at = {};
  nodes.forEach((nd) => { at[nd.v] = { x: 10 + nd.x * GX + GX / 2, y: 30 + nd.y * GY }; });
  const pathSet = new Set(f.path);
  const visSet = new Set(f.visited);

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <label>Value <input className="input vz-input vz-num" type="number" value={val} onChange={(e) => setVal(e.target.value)} /></label>
          <div className="row-btns">
            <button type="button" className="btn small" onClick={() => run('insert')}>Insert</button>
            <button type="button" className="btn small" onClick={() => run('search')}>Search</button>
            <button type="button" className="btn small" onClick={() => run('delete')}>Delete</button>
          </div>
          <div className="row-btns">
            {Object.keys(TRAV).map((k) => <button type="button" key={k} className="btn small" onClick={() => run(k)}>{TRAV[k].l}</button>)}
            <button type="button" className="btn small" onClick={() => p.load([{ root: BST_START, msg: 'Tree restored.', path: [], visited: [] }])}>Reset tree</button>
          </div>
        </Controls>
        <div className="vz-scroll">
          {f.root ? (
            <svg className="vz-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Binary search tree">
              {edges.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={at[a].x} y1={at[a].y} x2={at[b].x} y2={at[b].y} className={`vz-edge${pathSet.has(a) && pathSet.has(b) ? ' on' : ''}`} />
              ))}
              {nodes.map((nd) => {
                const c = at[nd.v];
                let cls = '';
                if (f.del === nd.v) cls = 'del';
                else if (f.found === nd.v || f.isNew === nd.v) cls = 'found';
                else if (f.cur === nd.v) cls = 'cur';
                else if (visSet.has(nd.v)) cls = 'visited';
                else if (pathSet.has(nd.v)) cls = 'path';
                return (
                  <g key={nd.v} className={`vz-tnode ${cls}`} style={{ transform: `translate(${c.x}px, ${c.y}px)` }}>
                    <circle r="19" />
                    <text dy="5" textAnchor="middle">{nd.v}</text>
                  </g>
                );
              })}
            </svg>
          ) : <div className="vz-null">root → NULL (empty tree)</div>}
        </div>
        <div className="vz-seq">
          <span className="small muted">Visited:</span>
          {f.visited.length === 0 && <span className="small muted">–</span>}
          {f.visited.map((x, k) => <span key={`${x}-${k}`} className="vz-seq-item">{x}</span>)}
        </div>
        <Narration msg={f.msg} tone={f.tone} />
      </div>
      <KeyCard points={[
        'Search / insert / delete cost O(h), where h is the tree height.',
        'Balanced tree: h ≈ log₂ n → O(log n). Inserting sorted data makes a "linked list": O(n).',
        'Inorder traversal of a BST always yields the values in sorted order.',
        'Delete with two children: replace with the inorder successor (or predecessor).',
        'Self-balancing variants: AVL, Red-Black trees (used by TreeMap, std::map).',
      ]}>
        <table className="vz-table"><tbody>
          {Object.entries(TRAV).map(([k, t]) => <tr key={k} className={f.trav === k ? 'hl' : ''}><td>{t.l}</td><td>{t.rule}</td></tr>)}
        </tbody></table>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   5. Recursion Tree
   ===================================================================== */

function recFrames(kind, n) {
  const fname = kind === 'fact' ? 'fact' : 'fib';
  const nodes = [];
  const events = [];
  const rec = (k, parent) => {
    const id = nodes.length;
    nodes.push({ id, k, parent, children: [] });
    if (parent !== null) nodes[parent].children.push(id);
    events.push({ type: 'call', id });
    let val;
    if (kind === 'fact') val = k <= 1 ? 1 : k * rec(k - 1, id);
    else val = k <= 1 ? k : rec(k - 1, id) + rec(k - 2, id);
    nodes[id].val = val;
    events.push({ type: 'ret', id });
    return val;
  };
  rec(n, null);
  let leaf = 0;
  let maxDepth = 0;
  const lay = (id, d) => {
    const nd = nodes[id];
    nd.depth = d;
    maxDepth = Math.max(maxDepth, d);
    if (!nd.children.length) { nd.x = leaf; leaf += 1; return; }
    nd.children.forEach((c) => lay(c, d + 1));
    nd.x = (nodes[nd.children[0]].x + nodes[nd.children[nd.children.length - 1]].x) / 2;
  };
  lay(0, 0);

  const frames = [{ shown: [], ret: {}, stack: [], active: null, msg: `Ready to compute ${fname}(${n}). Each Step shows one call or one return.` }];
  let shown = [];
  let ret = {};
  let stack = [];
  const finished = new Set();
  const repeat = {};
  events.forEach((ev) => {
    const nd = nodes[ev.id];
    let msg;
    if (ev.type === 'call') {
      shown = [...shown, nd.id];
      stack = [...stack, nd.id];
      const isBase = nd.k <= 1;
      if (kind === 'fib' && finished.has(nd.k)) repeat[nd.id] = true;
      msg = `Call ${fname}(${nd.k}) → pushed on the call stack (depth ${stack.length}). `;
      msg += isBase ? 'Base case reached!' : kind === 'fact' ? `Needs ${fname}(${nd.k - 1}) first.` : `Needs fib(${nd.k - 1}) + fib(${nd.k - 2}).`;
      if (repeat[nd.id]) msg += ` fib(${nd.k}) was already computed before – repeated work!`;
    } else {
      ret = { ...ret, [nd.id]: nd.val };
      stack = stack.slice(0, -1);
      finished.add(nd.k);
      const ch = nd.children.map((c) => nodes[c].val);
      if (!nd.children.length) msg = `${fname}(${nd.k}) is a base case → returns ${nd.val}`;
      else if (kind === 'fact') msg = `${fname}(${nd.k}) = ${nd.k} × ${ch[0]} = ${nd.val} → return value bubbles up, frame popped`;
      else msg = `fib(${nd.k}) = ${ch[0]} + ${ch[1]} = ${nd.val} → return value bubbles up, frame popped`;
    }
    frames.push({ shown, ret, stack, active: nd.id, msg, repeat: { ...repeat } });
  });
  frames[frames.length - 1].msg += ` ✔ Final answer: ${fname}(${n}) = ${nodes[0].val} using ${nodes.length} call${nodes.length === 1 ? "" : "s"}.`;
  return { frames, nodes, leaves: leaf, maxDepth };
}

function RecursionDemo() {
  const [kind, setKind] = useState('fib');
  const [n, setN] = useState(4);
  const [model, setModel] = useState(() => recFrames('fib', 4));
  const p = usePlayer(() => model.frames);
  const f = p.frame;

  const rebuild = (k, num) => {
    const m = recFrames(k, num);
    setModel(m);
    p.load(m.frames);
  };

  const { nodes, leaves, maxDepth } = model;
  const GX = 74;
  const GY = 62;
  const width = Math.max(leaves, 1) * GX + 20;
  const height = (maxDepth + 1) * GY + 30;
  const pos = (nd) => ({ x: 10 + nd.x * GX + GX / 2, y: 26 + nd.depth * GY });
  const shownSet = new Set(f.shown || []);
  const stackSet = new Set(f.stack || []);
  const fname = kind === 'fact' ? 'fact' : 'fib';

  const counts = {};
  nodes.forEach((nd) => { counts[nd.k] = (counts[nd.k] || 0) + 1; });

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <ChipGroup label="Function" options={[{ v: 'fact', l: 'factorial(n)' }, { v: 'fib', l: 'fibonacci(n)' }]} value={kind} onChange={(k) => { setKind(k); rebuild(k, n); }} />
          <span className="small muted">n =</span>
          <ChipGroup label="n" options={[1, 2, 3, 4, 5, 6]} value={n} onChange={(x) => { setN(x); rebuild(kind, x); }} />
        </Controls>
        <div className="vz-rec">
          <div className="vz-scroll vz-rec-tree">
            <svg className="vz-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Recursion call tree">
              {nodes.filter((nd) => nd.parent !== null && shownSet.has(nd.id)).map((nd) => {
                const a = pos(nodes[nd.parent]);
                const b = pos(nd);
                const r = f.ret[nd.id];
                return (
                  <g key={`e${nd.id}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`vz-edge${r !== undefined ? ' on' : ''}`} />
                    {r !== undefined && (
                      <text className="vz-ret-badge" x={(a.x + b.x) / 2 + 6} y={(a.y + b.y) / 2}>↑{r}</text>
                    )}
                  </g>
                );
              })}
              {nodes.filter((nd) => shownSet.has(nd.id)).map((nd) => {
                const c = pos(nd);
                const r = f.ret[nd.id];
                let cls = r !== undefined ? 'returned' : stackSet.has(nd.id) ? 'onstack' : '';
                if (f.active === nd.id) cls += ' cur';
                if (f.repeat && f.repeat[nd.id]) cls += ' repeat';
                return (
                  <g key={nd.id} className={`vz-rnode ${cls}`} transform={`translate(${c.x}, ${c.y})`}>
                    <rect x="-32" y="-15" width="64" height="30" rx="9" />
                    <text dy="1" textAnchor="middle">{fname}({nd.k})</text>
                    {r !== undefined && <text className="vz-rval" dy="12" textAnchor="middle">= {r}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="vz-callstack">
            <div className="small muted">Call stack (top ↓)</div>
            {(f.stack || []).length === 0 && <div className="vz-stack-empty small muted">empty</div>}
            {[...(f.stack || [])].reverse().map((id, k) => (
              <div key={id} className={`vz-frame${k === 0 ? ' top' : ''}`}>{fname}({nodes[id].k})</div>
            ))}
          </div>
        </div>
        <Narration msg={f.msg} tone={f.repeat && f.repeat[f.active] && !(f.active in f.ret) ? 'warn' : ''} />
      </div>
      <KeyCard points={kind === 'fact' ? [
        'factorial(n) = n × factorial(n-1), base case factorial(0 or 1) = 1.',
        'One call per level → n calls: O(n) time, O(n) stack space.',
        'Every call waits on the stack until the one below it returns.',
        'Without a base case the stack grows until a Stack Overflow error.',
      ] : [
        'fib(n) = fib(n-1) + fib(n-2), base cases fib(0)=0 and fib(1)=1.',
        'Naive recursion makes ~2ⁿ calls: O(2ⁿ) time, but only O(n) stack depth.',
        'Orange dashed boxes are repeated sub-problems – the same work done again.',
        'Memoization (cache each fib(k) the first time) cuts it to O(n) calls.',
      ]}>
        {kind === 'fib' && (
          <table className="vz-table">
            <thead><tr><th>Call</th><th>Times computed</th></tr></thead>
            <tbody>
              {Object.keys(counts).map(Number).sort((a, b) => b - a).map((k) => (
                <tr key={k} className={counts[k] > 1 ? 'warn' : ''}><td>fib({k})</td><td>{counts[k]}{counts[k] > 1 ? ' – memo would make this 1' : ''}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   6. SQL JOINs
   ===================================================================== */

const STUDENTS = [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }, { id: 3, name: 'Neha' }, { id: 4, name: 'Kiran' }];
const ENROLL = [{ sid: 1, course: 'React' }, { sid: 2, course: 'Node' }, { sid: 2, course: 'SQL' }, { sid: 5, course: 'Python' }];
const JOINS = {
  INNER: 'Only rows that match on both sides.',
  LEFT: 'All students; course columns are NULL where there is no match.',
  RIGHT: 'All enrollments; student columns are NULL where there is no match.',
  FULL: 'Everything from both sides; NULLs fill the gaps.',
  CROSS: 'Every student paired with every enrollment (Cartesian product, no ON).',
};

function joinSql(type) {
  const head = 'SELECT s.id, s.name, e.student_id, e.course\nFROM Students s\n';
  if (type === 'CROSS') return `${head}CROSS JOIN Enrollments e;`;
  const kw = type === 'INNER' ? 'INNER JOIN' : `${type} OUTER JOIN`;
  let sql = `${head}${kw} Enrollments e\n  ON s.id = e.student_id;`;
  if (type === 'FULL') sql += '\n\n-- MySQL has no FULL JOIN: use\n-- LEFT JOIN ... UNION ... RIGHT JOIN';
  return sql;
}

function joinFrames(type) {
  const res = [];
  const matchedR = new Set();
  const frames = [{ res: [], l: null, r: null, msg: `${type} JOIN – ${JOINS[type]} Press Play to scan the row pairs.` }];
  STUDENTS.forEach((s, li) => {
    let any = false;
    ENROLL.forEach((e, ri) => {
      const m = type === 'CROSS' || s.id === e.sid;
      if (m) { res.push({ s, e }); any = true; matchedR.add(ri); }
      frames.push({
        res: res.slice(), l: li, r: ri, match: m, added: m ? res.length - 1 : -1,
        msg: type === 'CROSS'
          ? `Pair ${s.name} with ${e.course} – no condition, every pair is kept`
          : `Compare s.id = ${s.id} with e.student_id = ${e.sid} → ${m ? `match ✓ add (${s.name}, ${e.course})` : 'no match'}`,
      });
    });
    if (!any && (type === 'LEFT' || type === 'FULL')) {
      res.push({ s, e: null });
      frames.push({ res: res.slice(), l: li, r: null, match: true, added: res.length - 1, msg: `${s.name} matched nothing → kept anyway, e.* columns become NULL` });
    }
  });
  if (type === 'RIGHT' || type === 'FULL') {
    ENROLL.forEach((e, ri) => {
      if (!matchedR.has(ri)) {
        res.push({ s: null, e });
        frames.push({ res: res.slice(), l: null, r: ri, match: true, added: res.length - 1, msg: `${e.course} (student_id ${e.sid}) has no matching student → kept, s.* columns become NULL` });
      }
    });
  }
  frames.push({ res: res.slice(), l: null, r: null, msg: `Done: ${type} JOIN returned ${res.length} row${res.length === 1 ? '' : 's'}.` });
  return frames;
}

function Venn({ type }) {
  const left = type === 'LEFT' || type === 'FULL' || type === 'CROSS';
  const right = type === 'RIGHT' || type === 'FULL' || type === 'CROSS';
  return (
    <svg className="vz-venn" viewBox="0 0 240 150" role="img" aria-label={`${type} join Venn diagram`}>
      <defs><clipPath id="vz-venn-clip"><circle cx="95" cy="72" r="56" /></clipPath></defs>
      <circle cx="95" cy="72" r="56" className={`vz-venn-c${left ? ' on' : ''}`} />
      <circle cx="145" cy="72" r="56" className={`vz-venn-c${right ? ' on' : ''}`} />
      <circle cx="145" cy="72" r="56" clipPath="url(#vz-venn-clip)" className="vz-venn-c on mid" />
      <circle cx="95" cy="72" r="56" className="vz-venn-o" />
      <circle cx="145" cy="72" r="56" className="vz-venn-o" />
      <text x="62" y="76" textAnchor="middle">Students</text>
      <text x="180" y="76" textAnchor="middle">Enroll.</text>
      <text x="120" y="144" textAnchor="middle" className="vz-venn-cap">{type === 'CROSS' ? '4 × 4 = 16 pairs' : `${type} JOIN`}</text>
    </svg>
  );
}

function SqlJoinDemo() {
  const [type, setType] = useState('INNER');
  const p = usePlayer(() => joinFrames('INNER'));
  const f = p.frame;
  const choose = (t) => { setType(t); p.load(joinFrames(t)); };
  const pairCls = (isActive) => (isActive ? (f.match ? ' match' : ' nomatch') : '');
  const nul = <span className="vz-nullv">NULL</span>;

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <ChipGroup label="Join type" options={Object.keys(JOINS)} value={type} onChange={choose} />
        </Controls>
        <div className="vz-join-grid">
          <div>
            <div className="vz-cap">Students s</div>
            <table className="vz-table vz-data">
              <thead><tr><th>id</th><th>name</th></tr></thead>
              <tbody>{STUDENTS.map((s, k) => <tr key={s.id} className={pairCls(f.l === k)}><td>{s.id}</td><td>{s.name}</td></tr>)}</tbody>
            </table>
          </div>
          <div>
            <div className="vz-cap">Enrollments e</div>
            <table className="vz-table vz-data">
              <thead><tr><th>student_id</th><th>course</th></tr></thead>
              <tbody>{ENROLL.map((e, k) => <tr key={`${e.sid}-${e.course}`} className={pairCls(f.r === k)}><td>{e.sid}</td><td>{e.course}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="vz-venn-box"><Venn type={type} /></div>
        </div>
        <Narration msg={f.msg} tone={f.l !== null && f.r !== null && f.l !== undefined ? (f.match ? 'ok' : '') : ''} />
        <div className="vz-join-out">
          <div>
            <div className="vz-cap">Query</div>
            <pre className="vz-code">{joinSql(type)}</pre>
          </div>
          <div className="vz-scroll">
            <div className="vz-cap">Result ({f.res.length} rows)</div>
            <table className="vz-table vz-data">
              <thead><tr><th>s.id</th><th>s.name</th><th>e.student_id</th><th>e.course</th></tr></thead>
              <tbody>
                {f.res.length === 0 && <tr><td colSpan="4" className="muted">(no rows yet)</td></tr>}
                {f.res.map((row, k) => (
                  <tr key={`${row.s ? row.s.id : 'n'}-${row.e ? row.e.course : 'n'}`} className={`vz-rowin${f.added === k ? ' new' : ''}`}>
                    <td>{row.s ? row.s.id : nul}</td><td>{row.s ? row.s.name : nul}</td>
                    <td>{row.e ? row.e.sid : nul}</td><td>{row.e ? row.e.course : nul}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <KeyCard points={[
        'INNER: intersection only. Neha, Kiran and Python (student 5) disappear.',
        'LEFT keeps every left row; RIGHT keeps every right row; FULL keeps both.',
        'Missing side → NULL. Filter "WHERE e.student_id IS NULL" to find students with no course.',
        'CROSS JOIN = rows(A) × rows(B). Forgetting ON in old-style joins causes this by accident.',
        'Joining on an indexed key makes lookups O(log n) instead of scanning every pair.',
      ]}>
        <table className="vz-table"><tbody>
          {Object.entries(JOINS).map(([k, d]) => <tr key={k} className={k === type ? 'hl' : ''}><td>{k}</td><td>{d}</td></tr>)}
        </tbody></table>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   7. Flexbox & Grid Playground
   ===================================================================== */

const FLEX_BASE = { mode: 'flex', direction: 'row', justify: 'flex-start', align: 'stretch', wrap: 'nowrap', gap: 8, cols: 'repeat(3, 1fr)', justifyItems: 'stretch', width: 100 };
const TOUR = [
  { cfg: { ...FLEX_BASE }, msg: 'display: flex – children line up along the main axis (a row, left → right).' },
  { cfg: { ...FLEX_BASE, justify: 'center' }, msg: 'justify-content: center – items are packed in the middle of the main axis.' },
  { cfg: { ...FLEX_BASE, justify: 'space-between' }, msg: 'justify-content: space-between – first and last touch the edges, equal gaps between.' },
  { cfg: { ...FLEX_BASE, justify: 'space-evenly' }, msg: 'justify-content: space-evenly – every gap (including edges) is equal.' },
  { cfg: { ...FLEX_BASE, justify: 'space-evenly', align: 'center' }, msg: 'align-items: center – items are centred on the cross axis (vertically here).' },
  { cfg: { ...FLEX_BASE, justify: 'space-evenly', align: 'flex-end' }, msg: 'align-items: flex-end – items sit on the bottom of the cross axis.' },
  { cfg: { ...FLEX_BASE, direction: 'column', align: 'center' }, msg: 'flex-direction: column – main axis is now vertical, so align-items centres horizontally.' },
  { cfg: { ...FLEX_BASE, width: 55, gap: 12 }, msg: 'Narrow container + nowrap: items shrink and squeeze onto one line.' },
  { cfg: { ...FLEX_BASE, width: 55, gap: 12, wrap: 'wrap' }, msg: 'flex-wrap: wrap – items move to a new line instead of shrinking.' },
  { cfg: { ...FLEX_BASE, mode: 'grid', cols: 'repeat(3, 1fr)' }, msg: 'display: grid with 3 equal columns (1fr = one share of free space).' },
  { cfg: { ...FLEX_BASE, mode: 'grid', cols: '1fr 2fr' }, msg: 'grid-template-columns: 1fr 2fr – second column is twice as wide.' },
  { cfg: { ...FLEX_BASE, mode: 'grid', cols: '80px 1fr 80px', gap: 16 }, msg: 'Fixed side columns, flexible middle: a classic sidebar layout.' },
  { cfg: { ...FLEX_BASE, mode: 'grid', cols: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 12 }, msg: 'repeat(auto-fit, minmax(90px, 1fr)) – responsive columns with zero media queries.' },
  { cfg: { ...FLEX_BASE, mode: 'grid', cols: 'repeat(3, 1fr)', justifyItems: 'center', align: 'center' }, msg: 'justify-items / align-items: center – each item is centred inside its own cell.' },
];
const FLEX_OPTS = {
  direction: ['row', 'row-reverse', 'column', 'column-reverse'],
  justify: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  align: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
  wrap: ['nowrap', 'wrap', 'wrap-reverse'],
  cols: ['repeat(3, 1fr)', '1fr 2fr', '80px 1fr 80px', 'repeat(auto-fit, minmax(90px, 1fr))', 'repeat(5, 1fr)'],
  justifyItems: ['stretch', 'start', 'center', 'end'],
  gridAlign: ['stretch', 'start', 'center', 'end'],
};
const BOX_H = [44, 74, 54, 92, 62];

function cssFor(c) {
  if (c.mode === 'grid') {
    return `.container {\n  display: grid;\n  grid-template-columns: ${c.cols};\n  justify-items: ${c.justifyItems};\n  align-items: ${({ 'flex-start': 'start', 'flex-end': 'end' }[c.align] || c.align)};\n  gap: ${c.gap}px;\n}`;
  }
  return `.container {\n  display: flex;\n  flex-direction: ${c.direction};\n  justify-content: ${c.justify};\n  align-items: ${({ start: 'flex-start', end: 'flex-end' }[c.align] || c.align)};\n  flex-wrap: ${c.wrap};\n  gap: ${c.gap}px;\n}`;
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <label className="vz-sel">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function FlexGridDemo() {
  const p = usePlayer(TOUR);
  const [override, setOverride] = useState(null);
  const [copied, setCopied] = useState(false);
  const cfg = override || p.frame.cfg;
  const boxRefs = useRef([]);
  const prev = useRef([]);
  const reduced = p.reduced;

  // FLIP animation: boxes glide from their old position to the new one
  useLayoutEffect(() => {
    const els = boxRefs.current;
    const next = els.map((el) => (el ? { x: el.offsetLeft, y: el.offsetTop } : null));
    els.forEach((el, k) => {
      const old = prev.current[k];
      const now = next[k];
      if (!el || !old || !now || reduced || typeof el.animate !== 'function') return;
      const dx = old.x - now.x;
      const dy = old.y - now.y;
      if (dx || dy) {
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], { duration: 450, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }
    });
    prev.current = next;
  }, [cfg, reduced]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const set = (k, v) => { p.pause(); setOverride({ ...cfg, [k]: v }); };
  const wrapP = {
    ...p,
    toggle: () => { setOverride(null); p.toggle(); },
    step: () => { setOverride(null); p.step(); },
    back: () => { setOverride(null); p.back(); },
    reset: () => { setOverride(null); p.reset(); },
  };
  const code = cssFor(cfg);
  const copy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => setCopied(true), () => setCopied(false));
      }
    } catch { /* clipboard unavailable */ }
  };

  const isGrid = cfg.mode === 'grid';
  const containerStyle = isGrid
    ? { display: 'grid', gridTemplateColumns: cfg.cols, justifyItems: cfg.justifyItems, alignItems: cfg.align === 'flex-start' ? 'start' : cfg.align === 'flex-end' ? 'end' : cfg.align === 'baseline' ? 'baseline' : cfg.align, gap: `${cfg.gap}px`, width: `${cfg.width}%` }
    : { display: 'flex', flexDirection: cfg.direction, justifyContent: cfg.justify, alignItems: { start: 'flex-start', end: 'flex-end' }[cfg.align] || cfg.align, flexWrap: cfg.wrap, gap: `${cfg.gap}px`, width: `${cfg.width}%` };
  const stretch = cfg.align === 'stretch';
  const column = !isGrid && cfg.direction.startsWith('column');
  const boxStyle = (h, k) => {
    if (isGrid) return { height: stretch ? undefined : Math.round(h * 0.8), minHeight: 40, width: cfg.justifyItems === 'stretch' ? undefined : 56 };
    if (column) return { height: 40, width: stretch ? undefined : 70 + k * 12 };
    return { height: stretch ? undefined : h, minHeight: 40, minWidth: 60 };
  };
  const flexAlign = { start: 'flex-start', end: 'flex-end' }[cfg.align] || cfg.align;

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={wrapP}>
          <ChipGroup label="Layout mode" options={[{ v: 'flex', l: 'Flexbox' }, { v: 'grid', l: 'Grid' }]} value={cfg.mode} onChange={(m) => set('mode', m)} />
          {!isGrid && <SelectRow label="flex-direction" value={cfg.direction} options={FLEX_OPTS.direction} onChange={(v) => set('direction', v)} />}
          {!isGrid && <SelectRow label="justify-content" value={cfg.justify} options={FLEX_OPTS.justify} onChange={(v) => set('justify', v)} />}
          {!isGrid && <SelectRow label="flex-wrap" value={cfg.wrap} options={FLEX_OPTS.wrap} onChange={(v) => set('wrap', v)} />}
          {isGrid && <SelectRow label="grid-template-columns" value={cfg.cols} options={FLEX_OPTS.cols} onChange={(v) => set('cols', v)} />}
          {isGrid && <SelectRow label="justify-items" value={cfg.justifyItems} options={FLEX_OPTS.justifyItems} onChange={(v) => set('justifyItems', v)} />}
          <SelectRow label="align-items" value={isGrid ? ({ 'flex-start': 'start', 'flex-end': 'end', baseline: 'start' }[cfg.align] || cfg.align) : flexAlign} options={isGrid ? FLEX_OPTS.gridAlign : FLEX_OPTS.align} onChange={(v) => set('align', v)} />
          <label className="vz-sel"><span>gap: {cfg.gap}px</span><input type="range" min="0" max="32" value={cfg.gap} onChange={(e) => set('gap', Number(e.target.value))} /></label>
          <label className="vz-sel"><span>container width: {cfg.width}%</span><input type="range" min="35" max="100" value={cfg.width} onChange={(e) => set('width', Number(e.target.value))} /></label>
        </Controls>
        <div className="vz-play-area">
          <div className={`vz-flexbox${column ? ' col' : ''}`} style={containerStyle}>
            {BOX_H.map((h, k) => (
              <div
                key={k}
                ref={(el) => { boxRefs.current[k] = el; }}
                className="vz-fbox"
                style={boxStyle(h, k)}
              >
                {k + 1}
              </div>
            ))}
          </div>
        </div>
        <Narration msg={override ? `Custom layout – you are exploring freely. Press Step ▶ / Play to continue the guided tour.` : p.frame.msg} />
        <div className="vz-codebox">
          <pre className="vz-code">{code}</pre>
          <button type="button" className="btn small vz-copy" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy CSS</>}</button>
        </div>
      </div>
      <KeyCard points={[
        'Flexbox = one-dimensional (a row OR a column). Grid = two-dimensional (rows AND columns).',
        'justify-content works on the main axis, align-items on the cross axis. Changing flex-direction swaps them.',
        'gap replaces margin hacks for spacing between items in both flex and grid.',
        'fr units share leftover space; minmax() + auto-fit gives responsive grids.',
        'Rule of thumb: Flexbox for components (navbars, buttons), Grid for page layout.',
      ]} />
    </div>
  );
}

/* =====================================================================
   8. Git Branching
   ===================================================================== */

const LANE_COLORS = ['#6366f1', '#16a34a', '#d97706', '#db2777', '#0891b2', '#9333ea', '#dc2626'];
const hashOf = (n) => ((Math.imul(n + 7, 2654435761) & 0xfffffff) >>> 0).toString(16).padStart(7, '0');

function gitInit() {
  const c = { id: hashOf(0), parents: [], lane: 0, msg: 'Initial commit', order: 0 };
  return { commits: { [c.id]: c }, branches: { main: c.id }, lanes: { main: 0 }, head: 'main', n: 1 };
}
function ancestors(repo, id) {
  const set = new Set();
  const st = [id];
  while (st.length) {
    const x = st.pop();
    if (!x || set.has(x)) continue;
    set.add(x);
    repo.commits[x].parents.forEach((pp) => st.push(pp));
  }
  return set;
}
function addCommit(repo, parents, msg, lane) {
  const id = hashOf(repo.n);
  const c = { id, parents, lane, msg, order: repo.n };
  return { repo: { ...repo, commits: { ...repo.commits, [id]: c }, n: repo.n + 1 }, id };
}

function GitDemo() {
  const p = usePlayer(() => [{ repo: gitInit(), cmd: 'git init && git commit -m "Initial commit"', msg: 'A new repository with one commit on main. HEAD points to the branch you are on.' }]);
  const [bname, setBname] = useState('feature');
  const [target, setTarget] = useState('');
  const f = p.frame;
  const repo = f.repo;
  const others = Object.keys(repo.branches).filter((b) => b !== repo.head);
  const tgt = others.includes(target) ? target : others[0] || '';

  const push = (next, cmd, msg, tone) => {
    const frames = [...p.frames.slice(0, p.i + 1), { repo: next || repo, cmd: next ? cmd : null, msg, tone }];
    p.load(frames, { start: frames.length - 1 });
  };

  const commit = () => {
    const tip = repo.branches[repo.head];
    const label = `C${repo.n}`;
    const { repo: r, id } = addCommit(repo, [tip], label, repo.lanes[repo.head]);
    push({ ...r, branches: { ...r.branches, [repo.head]: id } }, `git commit -m "${label}"`, `New commit ${id} on ${repo.head}. Its parent is ${tip}; the branch pointer moves forward.`);
  };
  const branch = () => {
    const name = bname.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,19}$/.test(name)) { push(null, null, 'Branch names: letters, digits, . _ / - (max 20 chars), no spaces.', 'bad'); return; }
    if (repo.branches[name]) { push(null, null, `fatal: a branch named '${name}' already exists.`, 'bad'); return; }
    const lane = Math.max(...Object.values(repo.lanes)) + 1;
    push({ ...repo, branches: { ...repo.branches, [name]: repo.branches[repo.head] }, lanes: { ...repo.lanes, [name]: lane } },
      `git branch ${name}`, `Created branch ${name} pointing at the same commit as ${repo.head}. A branch is just a movable label! Checkout to work on it.`);
    setTarget(name);
    const m = name.match(/^(.*?)(\d+)$/);
    setBname(m ? `${m[1]}${Number(m[2]) + 1}` : `${name}-2`);
  };
  const checkout = () => {
    if (!tgt) { push(null, null, 'No other branch to switch to – create one first.', 'bad'); return; }
    push({ ...repo, head: tgt }, `git checkout ${tgt}`, `HEAD now points to ${tgt}. New commits will be added to ${tgt}.`);
  };
  const merge = () => {
    if (!tgt) { push(null, null, 'Nothing to merge – create another branch first.', 'bad'); return; }
    const a = repo.branches[repo.head];
    const b = repo.branches[tgt];
    if (ancestors(repo, a).has(b)) { push(null, null, `Already up to date: ${tgt} has nothing that ${repo.head} doesn't.`, 'bad'); return; }
    if (ancestors(repo, b).has(a)) {
      push({ ...repo, branches: { ...repo.branches, [repo.head]: b } }, `git merge ${tgt}`, `Fast-forward: ${repo.head} had no new commits, so its pointer simply moves to ${b}.`);
      return;
    }
    const { repo: r, id } = addCommit(repo, [a, b], `Merge ${tgt}`, repo.lanes[repo.head]);
    push({ ...r, branches: { ...r.branches, [repo.head]: id } }, `git merge ${tgt}`, `Three-way merge: new merge commit ${id} has two parents (${a} and ${b}).`);
  };
  const rebase = () => {
    if (!tgt) { push(null, null, 'Nothing to rebase onto – create another branch first.', 'bad'); return; }
    const a = repo.branches[repo.head];
    const b = repo.branches[tgt];
    const ancA = ancestors(repo, a);
    const ancB = ancestors(repo, b);
    if (ancB.has(a)) {
      push({ ...repo, branches: { ...repo.branches, [repo.head]: b } }, `git rebase ${tgt}`, `${repo.head} had no own commits → fast-forwarded to ${tgt}.`);
      return;
    }
    if (ancA.has(b)) { push(null, null, `Current branch ${repo.head} is up to date with ${tgt}.`, 'bad'); return; }
    const replay = Object.values(repo.commits).filter((c) => ancA.has(c.id) && !ancB.has(c.id) && c.parents.length < 2).sort((x, y) => x.order - y.order);
    let r = repo;
    let tip = b;
    replay.forEach((c) => {
      const out = addCommit(r, [tip], `${c.msg}'`, repo.lanes[repo.head]);
      r = out.repo;
      tip = out.id;
    });
    push({ ...r, branches: { ...r.branches, [repo.head]: tip } }, `git rebase ${tgt}`,
      `Replayed ${replay.length} commit${replay.length === 1 ? '' : 's'} of ${repo.head} on top of ${tgt} as new commits (marked '). History is now linear; old commits are abandoned.`);
  };

  // layout
  const reach = new Set();
  Object.values(repo.branches).forEach((id) => ancestors(repo, id).forEach((x) => reach.add(x)));
  const visible = Object.values(repo.commits).filter((c) => reach.has(c.id)).sort((x, y) => x.order - y.order);
  const col = {};
  visible.forEach((c, k) => { col[c.id] = k; });
  const usedLanes = [...new Set(visible.map((c) => c.lane).concat(Object.values(repo.lanes)))].sort((x, y) => x - y);
  const row = {};
  usedLanes.forEach((l, k) => { row[l] = k; });
  const labelsAt = {};
  Object.entries(repo.branches).forEach(([b, id]) => { (labelsAt[id] = labelsAt[id] || []).push(b); });
  const maxLabels = Math.max(1, ...Object.values(labelsAt).map((l) => l.length));
  const top = 24 + maxLabels * 20;
  const GX = 74;
  const GY = 70;
  const P = (c) => ({ x: 40 + col[c.id] * GX, y: top + row[c.lane] * GY });
  const width = 80 + visible.length * GX + 40;
  const height = top + usedLanes.length * GY;
  const log = p.frames.slice(0, p.i + 1).filter((x) => x.cmd);

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <div className="row-btns">
            <button type="button" className="btn small" onClick={commit}>Commit</button>
            <input className="input vz-input vz-bname" value={bname} onChange={(e) => setBname(e.target.value)} aria-label="New branch name" />
            <button type="button" className="btn small" onClick={branch}>Create branch</button>
          </div>
          <div className="row-btns">
            <select value={tgt} onChange={(e) => setTarget(e.target.value)} aria-label="Target branch" disabled={!others.length}>
              {others.length === 0 && <option value="">(no other branch)</option>}
              {others.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <button type="button" className="btn small" onClick={checkout}>Checkout</button>
            <button type="button" className="btn small" onClick={merge}>Merge into {repo.head}</button>
            <button type="button" className="btn small" onClick={rebase}>Rebase {repo.head} onto it</button>
            <button type="button" className="btn small" onClick={() => p.load([{ repo: gitInit(), cmd: 'git init && git commit -m "Initial commit"', msg: 'Fresh repository.' }])}>New repo</button>
          </div>
        </Controls>
        <div className="vz-scroll">
          <svg className="vz-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Git commit graph">
            {visible.map((c) => c.parents.filter((pp) => reach.has(pp)).map((pp) => {
              const a = P(repo.commits[pp]);
              const b = P(c);
              const d = a.y === b.y ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;
              return <path key={`${pp}-${c.id}`} d={d} className="vz-gedge" style={{ stroke: LANE_COLORS[c.lane % LANE_COLORS.length] }} />;
            }))}
            {visible.map((c) => {
              const pt = P(c);
              const isHead = repo.branches[repo.head] === c.id;
              return (
                <g key={c.id} className="vz-gnode" transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle r={c.parents.length > 1 ? 13 : 11} style={{ fill: LANE_COLORS[c.lane % LANE_COLORS.length] }} className={isHead ? 'head' : ''} />
                  <text className="vz-ghash" y="28" textAnchor="middle">{c.id}</text>
                  <text className="vz-gmsg" y="41" textAnchor="middle">{c.msg}</text>
                  {(labelsAt[c.id] || []).map((b, k) => {
                    const txt = b === repo.head ? `HEAD → ${b}` : b;
                    const w = txt.length * 7 + 14;
                    return (
                      <g key={b} transform={`translate(0, ${-24 - k * 20})`} className={`vz-glabel${b === repo.head ? ' head' : ''}`}>
                        <rect x={-w / 2} y="-10" width={w} height="17" rx="8" />
                        <text y="3" textAnchor="middle">{txt}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <Narration msg={f.msg} tone={f.tone} />
        <div className="vz-cap">Command log</div>
        <pre className="vz-code vz-log">{log.map((x) => `$ ${x.cmd}`).join('\n')}</pre>
      </div>
      <KeyCard points={[
        'A commit is a snapshot with a pointer to its parent(s); a branch is just a label on a commit.',
        'HEAD tells Git which branch you are on – new commits move that branch forward.',
        'Fast-forward merge: target is ahead in a straight line, only the label moves.',
        'Three-way merge creates a merge commit with two parents.',
        'Rebase rewrites commits on top of another branch: linear history, new hashes. Never rebase commits already pushed and shared.',
      ]}>
        <table className="vz-table"><tbody>
          <tr><td>git switch -c x</td><td>create + checkout in one step</td></tr>
          <tr><td>git log --oneline --graph</td><td>draw this graph in the terminal</td></tr>
          <tr><td>git merge --no-ff x</td><td>always create a merge commit</td></tr>
        </tbody></table>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   9. HTTP Request Lifecycle
   ===================================================================== */

const STATIONS = [
  { icon: '🌐', l: 'Browser' },
  { icon: '📖', l: 'DNS' },
  { icon: '🖥️', l: 'Web server' },
  { icon: '⚙️', l: 'API / app' },
  { icon: '🗄️', l: 'Database' },
];
const STATUS_TEXT = { 200: 'OK', 201: 'Created', 400: 'Bad Request', 404: 'Not Found', 500: 'Internal Server Error' };

function httpFrames(method, status) {
  const isGet = method === 'GET';
  const url = isGet ? '/api/students/42' : '/api/students';
  const ok = status < 300;
  const body = '{ "name": "Neha", "course": "SQL" }';
  const reqText = isGet
    ? `GET ${url} HTTP/1.1\nHost: school.dev\nAccept: application/json\nAuthorization: Bearer eyJhbGci...`
    : `POST ${url} HTTP/1.1\nHost: school.dev\nContent-Type: application/json\nAuthorization: Bearer eyJhbGci...\n\n${body}`;
  const json = {
    200: isGet ? '{ "id": 42, "name": "Asha", "course": "React" }' : '{ "id": 43, "name": "Neha", "course": "SQL" }',
    201: '{ "id": 43, "name": "Neha", "course": "SQL" }',
    400: '{ "error": "name is required" }',
    404: isGet ? '{ "error": "Student 42 not found" }' : '{ "error": "Course SQL does not exist" }',
    500: '{ "error": "Internal Server Error" }',
  }[status];
  const resText = `HTTP/1.1 ${status} ${STATUS_TEXT[status]}\nContent-Type: application/json${status === 201 ? '\nLocation: /api/students/43' : ''}\n\n${json}`;
  const sql = isGet ? 'SELECT * FROM students WHERE id = 42;' : "INSERT INTO students (name, course)\nVALUES ('Neha', 'SQL');";

  const frames = [
    { at: 0, dir: 'req', title: 'User action', msg: isGet ? 'You open school.dev/students/42 – the page needs student data, so the browser prepares a GET request.' : 'You submit the "Add student" form – the browser prepares a POST request with a JSON body.' },
    { at: 1, dir: 'req', title: 'DNS lookup', msg: 'DNS lookup: "school.dev" → 203.0.113.10 (browser cache → OS cache → resolver → authoritative server).', detail: 'Q: A school.dev ?\nA: school.dev  203.0.113.10  TTL 300' },
    { at: 2, dir: 'req', title: 'TCP handshake', msg: 'TCP 3-way handshake with 203.0.113.10:443 → SYN, SYN-ACK, ACK. A reliable connection is open.', detail: 'Client → SYN\nServer → SYN-ACK\nClient → ACK' },
    { at: 2, dir: 'req', title: 'TLS handshake', msg: 'TLS handshake: server sends its certificate, both sides agree on keys → HTTPS traffic is now encrypted.', detail: 'ClientHello → ServerHello + certificate\nKey exchange → Finished (encrypted)' },
    { at: 2, dir: 'req', title: 'HTTP request', msg: `The HTTP request arrives: method ${method}, path, headers${isGet ? '' : ' and a JSON body'}. The web server / reverse proxy forwards it to the app.`, detail: reqText },
  ];
  if (status === 400) {
    frames.push({ at: 3, dir: 'req', title: 'Validation', msg: 'API router → controller. Validation fails ("name" missing or invalid) → stop early, the database is never touched.', detail: 'if (!req.body.name) return res.status(400)...', tone: 'bad' });
  } else {
    frames.push({ at: 3, dir: 'req', title: 'API logic', msg: `Router matches ${method} ${isGet ? '/api/students/:id' : '/api/students'} → controller checks auth, validates input, calls the database.`, detail: isGet ? 'router.get("/api/students/:id", getStudent)' : 'router.post("/api/students", createStudent)' });
    let dbMsg;
    let tone;
    if (status === 500) { dbMsg = 'Database error: connection timed out → the app throws an exception.'; tone = 'bad'; }
    else if (status === 404) { dbMsg = isGet ? 'Query runs but returns 0 rows – there is no student 42.' : 'Foreign-key lookup finds no course called SQL.'; tone = 'bad'; }
    else dbMsg = isGet ? 'Query returns 1 row (Asha).' : 'Row inserted, new id = 43.';
    frames.push({ at: 4, dir: 'req', title: 'Database', msg: `Database runs the query. ${dbMsg}`, detail: sql, tone });
    frames.push({ at: 3, dir: 'res', title: 'Build response', msg: `Back in the API: it turns the result into JSON and picks status ${status} ${STATUS_TEXT[status]}.`, detail: `res.status(${status}).json(...)` });
  }
  frames.push({ at: 2, dir: 'res', title: 'Response sent', msg: `The response travels back through the server: status line, headers, JSON body.`, detail: resText });
  let render;
  if (status === 200) render = isGet ? 'Browser parses JSON and renders Asha\'s profile card. ' : 'Works, but a POST that creates something should normally return 201 Created.';
  else if (status === 201) render = isGet ? '201 is unusual for GET (nothing was created) – the browser still treats it as success.' : 'Browser shows "Student added " and can follow the Location header.';
  else if (status === 400) render = 'Browser shows the error next to the form field so the user can fix the input (client\'s fault).';
  else if (status === 404) render = 'Browser shows a "Not found" message – the resource does not exist (client asked for something missing).';
  else render = 'Browser shows "Something went wrong, please try again" – a server-side bug, the client did nothing wrong.';
  frames.push({ at: 0, dir: 'res', title: 'Render', msg: `Status ${status} arrives. ${render}`, detail: resText, tone: ok ? 'ok' : 'bad' });
  return frames.map((x) => ({ ...x, status }));
}

function HttpDemo() {
  const [method, setMethod] = useState('GET');
  const [status, setStatus] = useState(200);
  const p = usePlayer(() => httpFrames('GET', 200));
  const f = p.frame;
  const rebuild = (m, s) => p.load(httpFrames(m, s));
  const visited = new Set(p.frames.slice(0, p.i + 1).map((x) => x.at));
  const pktCls = f.dir === 'req' ? 'req' : f.status < 300 ? 'ok' : 'bad';

  return (
    <div className="vz-demo">
      <div className="card vz-stage">
        <Controls p={p}>
          <ChipGroup label="Method" options={['GET', 'POST']} value={method} onChange={(m) => { setMethod(m); rebuild(m, status); }} />
          <span className="small muted">Response status:</span>
          <ChipGroup label="Status" options={[200, 201, 400, 404, 500]} value={status} onChange={(s) => { setStatus(s); rebuild(method, s); }} />
        </Controls>
        <div className="vz-scroll">
          <div className="vz-http">
            <div className="vz-http-line" />
            {STATIONS.map((s, k) => (
              <div key={s.l} className={`vz-station${f.at === k ? ' on' : ''}${visited.has(k) ? ' seen' : ''}`} style={{ left: `${(k + 0.5) * 20}%` }}>
                <div className="vz-st-icon"><Ico e={s.icon} /></div>
                <div className="vz-st-label">{s.l}</div>
              </div>
            ))}
            <div className={`vz-packet ${pktCls}`} style={{ left: `${(f.at + 0.5) * 20}%` }} aria-hidden="true">
              {f.dir === 'req' ? method : f.status}
            </div>
          </div>
        </div>
        <div className="vz-steps-line">
          {p.frames.map((x, k) => (
            <span key={`${x.title}-${k}`} className={`vz-pill${k === p.i ? ' on' : ''}${k < p.i ? ' done' : ''}`}>{k + 1}. {x.title}</span>
          ))}
        </div>
        <Narration msg={f.msg} tone={f.tone} />
        {f.detail && <pre className="vz-code">{f.detail}</pre>}
      </div>
      <KeyCard points={[
        'DNS turns a name into an IP; results are cached (TTL) so later requests skip it.',
        'TCP gives reliable delivery; TLS adds encryption (the "S" in HTTPS). Connections are reused (keep-alive).',
        'GET reads data (safe, no body); POST creates data (has a body, not idempotent).',
        '2xx success · 3xx redirect · 4xx client error · 5xx server error.',
        'A 400 never reaches the DB – validate early to save work.',
      ]}>
        <table className="vz-table"><tbody>
          {Object.entries(STATUS_TEXT).map(([c, t]) => <tr key={c} className={Number(c) === status ? 'hl' : ''}><td>{c}</td><td>{t}</td></tr>)}
        </tbody></table>
      </KeyCard>
    </div>
  );
}

/* =====================================================================
   Page
   ===================================================================== */

const DEMOS = [
  { k: 'sort', icon: '📊', l: 'Sorting', C: SortingDemo },
  { k: 'list', icon: '🔗', l: 'Linked List', C: LinkedListDemo },
  { k: 'stack', icon: '🥞', l: 'Stack & Queue', C: StackQueueDemo },
  { k: 'bst', icon: '🌳', l: 'Binary Search Tree', C: BSTDemo },
  { k: 'rec', icon: '🔁', l: 'Recursion Tree', C: RecursionDemo },
  { k: 'join', icon: '🧩', l: 'SQL JOINs', C: SqlJoinDemo },
  { k: 'flex', icon: '📐', l: 'Flexbox & Grid', C: FlexGridDemo },
  { k: 'git', icon: '🌿', l: 'Git Branching', C: GitDemo },
  { k: 'http', icon: '📡', l: 'HTTP Lifecycle', C: HttpDemo },
];

export default function Visualizers() {
  const [tab, setTab] = useState('sort');
  const demo = DEMOS.find((d) => d.k === tab) || DEMOS[0];
  const Demo = demo.C;
  return (
    <div className="vz-page">
      <div className="page-head">
        <h1><Ico e="🎞" /> DSA &amp; Concept Visualizer</h1>
        <p className="muted">Watch algorithms, data structures and web concepts run step by step – play, pause, step and tweak the inputs.</p>
      </div>
      <div className="tabs" role="tablist" aria-label="Visualizer demos">
        {DEMOS.map((d) => (
          <button type="button" key={d.k} role="tab" aria-selected={tab === d.k} className={`tab${tab === d.k ? ' active' : ''}`} onClick={() => setTab(d.k)}>
            <Ico e={d.icon} /> {d.l}
          </button>
        ))}
      </div>
      <Demo key={demo.k} />
    </div>
  );
}
