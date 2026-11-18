// Checks a MongoDB Lab challenge: runs the student's code and the reference solution on fresh copies of the dataset.
import { shellFromDatasets, canonical } from './mongoShell.js';
import { DATASETS } from '../data/mongoDatasets.js';

// The value to compare: the last docs/value output of a run (prints and info lines are ignored).
function lastOutput(results) {
  const err = results.find((r) => r.kind === 'error');
  if (err) return { error: err.text };
  const outs = results.filter((r) => r.kind === 'docs' || r.kind === 'value');
  const last = outs[outs.length - 1];
  if (!last) return { error: 'Your code produced no result. Make sure the last line is the query whose result should be checked.' };
  return { value: last.kind === 'docs' ? last.docs : last.value, text: last.text };
}

export function runChallenge(ch, code) {
  const mine = shellFromDatasets(DATASETS, ch.dataset);
  const ref = shellFromDatasets(DATASETS, ch.dataset);
  let a = lastOutput(mine.run(code));
  let b = lastOutput(ref.run(ch.solution));
  if (ch.check && !a.error) { a = lastOutput(mine.run(ch.check)); b = lastOutput(ref.run(ch.check)); }
  if (a.error) return { ok: false, message: a.error };
  if (b.error) return { ok: false, message: `Reference solution failed: ${b.error}` };
  // Generated ObjectIds differ between runs: ignore them.
  const norm = (v) => canonical(v, !!ch.ordered).replace(/"[0-9a-f]{24}"/g, '"<ObjectId>"');
  const ok = norm(a.value) === norm(b.value);
  return { ok, got: a.text, expected: b.text, message: ok ? 'Correct!' : ch.check ? 'The data after your code is different from the expected result.' : 'Your result is different from the expected result.' };
}
