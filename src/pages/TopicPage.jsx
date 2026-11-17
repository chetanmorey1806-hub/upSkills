import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { tracks, findTopic, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import RichText, { Inline } from '../components/RichText.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DataTable from '../components/DataTable.jsx';
import Quiz from '../components/Quiz.jsx';

const TABS = [
  ['theory', '📘 Theory'],
  ['examples', '🧪 Examples'],
  ['interview', '💬 Interview Q&A'],
  ['practice', '🛠 Practice'],
  ['quiz', '🏆 Quiz'],
];

function Reveal({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reveal">
      <button className="link-btn" onClick={() => setOpen(!open)}>{open ? '▾ Hide' : '▸ Show'} {label}</button>
      {open && <div className="reveal-body">{children}</div>}
    </div>
  );
}

function looksLikeCode(s) {
  return /^\s*(=|let\b|Sub\b|Function\b|[A-Za-z ]+\s*=\s*[A-Z]|EVALUATE|VAR\b|Dim\b|'|\/\/)/.test(s) && !/^\s*\d+\./.test(s);
}

function SolutionText({ text }) {
  // Show as code if it looks like a formula / code, else rich text
  if (looksLikeCode(text)) return <CodeBlock code={text} label="Solution" />;
  return <RichText text={text} />;
}

export default function TopicPage() {
  const { track, id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'theory';
  const found = findTopic(track, id);
  const p = useProgress();
  const [qaFilter, setQaFilter] = useState('All');
  const [openAll, setOpenAll] = useState(false);

  if (!found) return <p>Topic not found. <Link to="/">Go home</Link></p>;
  const { topic: t, index, list } = found;
  const tr = tracks[track];
  const key = topicKey(track, t.id);
  const prev = list[index - 1];
  const next = list[index + 1];
  const practiceDone = new Set(p.practice[key] || []);
  const codeLabel = track === 'powerbi' ? 'DAX / M' : 'Formula / Code';
  const isExcel = track !== 'powerbi';

  const setTab = (k) => setParams({ tab: k }, { replace: true });

  return (
    <div className="topic">
      <div className="crumbs">
        <Link to={`/track/${track}`}>{tr.name}</Link>{t.module && <> › {t.module}</>} › {topicLabel(track, t, index)}
      </div>
      <div className="page-head" style={{ borderLeftColor: tr.color }}>
        <h1>{t.title}</h1>
        <p className="muted">{t.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${t.level}`}>{t.level}</span>
          {track === 'excel' && t.day && <span>📅 Day {t.day}</span>}
          {t.module && <span>📦 {t.module}</span>}
          {t.duration && <span>⏱ {t.duration}</span>}
          {p.quiz[key] != null && <span>🏆 Best quiz: {p.quiz[key]}/{t.quiz.length}</span>}
        </div>
        <button className={`btn ${p.done[key] ? 'success' : 'primary'}`} onClick={() => p.toggleDone(key)}>
          {p.done[key] ? '✓ Completed (click to undo)' : 'Mark topic as completed'}
        </button>
      </div>

      {t.objectives?.length > 0 && (
        <div className="card objectives">
          <h4>🎯 After this topic you will be able to:</h4>
          <ul>{t.objectives.map((o, i) => <li key={i}><Inline text={o} /></li>)}</ul>
        </div>
      )}

      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {l}
            <span className="count">
              {k === 'theory' ? t.theory?.length : k === 'examples' ? t.examples?.length : k === 'interview' ? t.interview?.length : k === 'practice' ? t.practice?.length : t.quiz?.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'theory' && (
        <div>
          <div className="card toc">
            <b>Contents:</b>{' '}
            {t.theory.map((s, i) => (
              <a key={i} href={`#sec-${i}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth' }); }}>
                {i + 1}. {s.heading}
              </a>
            ))}
          </div>
          {t.theory.map((s, i) => (
            <section key={i} id={`sec-${i}`} className="card theory">
              <h2>{i + 1}. {s.heading}</h2>
              <RichText text={s.content} />
              {s.syntax && <CodeBlock code={s.syntax} label="Syntax" />}
              {s.points?.length > 0 && <ul className="points">{s.points.map((pt, j) => <li key={j}><Inline text={pt} /></li>)}</ul>}
              {s.tip && <div className="tip">💡 <Inline text={s.tip} /></div>}
            </section>
          ))}
          <div className="center"><button className="btn primary" onClick={() => setTab('examples')}>Next: Worked examples →</button></div>
        </div>
      )}

      {tab === 'examples' && (
        <div>
          {t.examples.map((ex, i) => (
            <section key={i} className="card example">
              <h3>Example {i + 1}: {ex.title}</h3>
              {ex.scenario && <div className="scenario"><b>Scenario:</b> <Inline text={ex.scenario} /></div>}
              <DataTable table={ex.table} excelStyle={isExcel} />
              {ex.steps?.length > 0 && (
                <div className="steps-box">
                  <b>🪜 Step-by-step solution</b>
                  <ol>{ex.steps.map((st, j) => <li key={j}><Inline text={st} /></li>)}</ol>
                </div>
              )}
              <CodeBlock code={ex.code} label={codeLabel} />
              {ex.result && <div className="result"><b>Result:</b> <Inline text={ex.result} /></div>}
              {ex.explanation && <div className="explanation"><b>Explanation</b><RichText text={ex.explanation} /></div>}
            </section>
          ))}
          <div className="center"><button className="btn primary" onClick={() => setTab('interview')}>Next: Interview Q&amp;A →</button></div>
        </div>
      )}

      {tab === 'interview' && (
        <div>
          <div className="toolbar">
            <div className="chips">
              {['All', 'Easy', 'Medium', 'Hard'].map((l) => (
                <button key={l} className={`chip ${qaFilter === l ? 'active' : ''}`} onClick={() => setQaFilter(l)}>{l}</button>
              ))}
            </div>
            <button className="btn small" onClick={() => setOpenAll(!openAll)}>{openAll ? 'Collapse all' : 'Expand all'}</button>
          </div>
          {t.interview
            .map((qa, i) => ({ ...qa, i }))
            .filter((qa) => qaFilter === 'All' || qa.level === qaFilter)
            .map((qa) => {
              const qid = `${key}#${qa.i}`;
              return (
                <details key={qa.i + String(openAll)} className="card qa" open={openAll}>
                  <summary>
                    <span className="qa-q">Q{qa.i + 1}. <Inline text={qa.q} /></span>
                    {qa.level && <span className={`lvl lvl-${qa.level}`}>{qa.level}</span>}
                    <button
                      className={`star ${p.bookmarks[qid] ? 'on' : ''}`}
                      title="Bookmark for revision"
                      onClick={(e) => { e.preventDefault(); p.toggleBookmark(qid); }}
                    >★</button>
                  </summary>
                  <div className="qa-a"><RichText text={qa.a} /></div>
                </details>
              );
            })}
        </div>
      )}

      {tab === 'practice' && (
        <div>
          <div className="card info">
            Do these exercises in real {isExcel ? 'Excel (or the built-in ' : 'Power BI Desktop (or the built-in '}
            <Link to={isExcel ? '/tools/formula-lab' : '/tools/dax-lab'}>{isExcel ? 'Formula Lab' : 'DAX Lab'}</Link>
            ). Try first, then use the hint, then check the solution. Tick an exercise once you've solved it.
          </div>
          {t.practice.map((ex, i) => (
            <section key={i} className={`card practice ${practiceDone.has(i) ? 'is-done' : ''}`}>
              <div className="practice-head">
                <h3>Exercise {i + 1}</h3>
                <label className="check">
                  <input type="checkbox" checked={practiceDone.has(i)} onChange={() => p.togglePractice(key, i)} /> Solved
                </label>
              </div>
              <RichText text={ex.task} />
              {ex.hint && <Reveal label="hint"><div className="tip">💡 <Inline text={ex.hint} /></div></Reveal>}
              {ex.solution && <Reveal label="solution"><SolutionText text={ex.solution} /></Reveal>}
            </section>
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        <Quiz key={key} questions={t.quiz} onFinish={(s) => p.setQuiz(key, s)} />
      )}

      <div className="pager">
        {prev ? <Link className="btn" to={`/track/${track}/${prev.id}`}>← {topicLabel(track, prev, index - 1)}: {prev.title}</Link> : <span />}
        {next ? <Link className="btn primary" to={`/track/${track}/${next.id}`}>{topicLabel(track, next, index + 1)}: {next.title} →</Link> : <Link className="btn primary" to="/tools/quiz">Take the mixed quiz →</Link>}
      </div>
    </div>
  );
}
