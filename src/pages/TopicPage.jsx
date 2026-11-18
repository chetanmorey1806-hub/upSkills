import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { openInPlayground } from '../components/playgroundRuntime.js';
import { useState } from 'react';
import { tracks, findTopic, topicKey, topicLabel, isPbi, isWeb, isJava, isPython, isMySQL, isDotnet, isAI, isSoft } from '../data/index.js';
import { AI_LOAD_KEY } from './AiPromptLab.jsx';
import { ExternalLink, Sparkles } from 'lucide-react';
import { CS_LOAD_KEY } from './CSharpIDE.jsx';
import { SSMS_LOAD_KEY } from './MySQLWorkbench.jsx';
import { MYSQL_LOAD_KEY } from './MySQLWorkbench.jsx';
import { PY_LOAD_KEY } from './PythonIDE.jsx';
import { SQL_LOAD_KEY } from './SqlLab.jsx';
import { JAVA_LOAD_KEY } from './JavaIDE.jsx';
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
  if (/^\s*(def |from |import |print\(|#|class |for |if |with )/.test(s) && /\n/.test(s)) return true;
  if (/^\s*(using |namespace |Console\.|var |int |string |static |interface |abstract |sealed |\[|dotnet |Add-Migration)/.test(s) && /\n/.test(s)) return true;
  if (/^\s*(public |class |import java|package |@|<\?xml|<dependency|spring\.|SELECT |CREATE |INSERT )/.test(s)) return true;
  if (/^\s*(<[a-zA-Z!]|[.#]?[a-z-]+\s*\{|const |let |function |import |export |document\.|console\.)/.test(s)) return true;
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
  const navigate = useNavigate();

  if (!found) return <p>Topic not found. <Link to="/">Go home</Link></p>;
  const { topic: t, index, list } = found;
  const tr = tracks[track];
  const key = topicKey(track, t.id);
  const prev = list[index - 1];
  const next = list[index + 1];
  const practiceDone = new Set(p.practice[key] || []);
  const web = isWeb(track);
  const java = isJava(track);
  const py = isPython(track);
  const my = isMySQL(track);
  const dn = isDotnet(track);
  const ai = isAI(track);
  const soft = isSoft(track);
  const openAi = (payload) => { try { sessionStorage.setItem(AI_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/ai-lab'); };
  const aiLab = /Machine Learning Hands-on/i.test(t.module || '') ? ['/tools/ml-playground', 'ML Playground']
    : /Final Project|Careers/i.test(`${t.module} ${t.title}`) ? ['/tools/ai-app-builder', 'AI App Builder']
    : /Generative AI|Foundations/i.test(t.module || '') ? ['/tools/ai-concepts', 'AI Concepts Lab']
    : /Productivity/i.test(t.module || '') ? ['/tools/ai-tools', 'AI Tools Directory'] : ['/tools/ai-lab', 'AI Prompt Lab'];
  const dnMod = `${t.module || ''} ${t.title}`;
  const dnSql = dn && /SQL Server/i.test(dnMod);
  const dnWeb = dn && /Frontend|React/i.test(t.module || '');
  const isExcel = !isPbi(track) && !web && !java && !py && !my && !dn && !ai && !soft;
  const openCs = (payload) => { try { sessionStorage.setItem(CS_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/csharp-ide'); };
  const openSsms = (payload) => { try { sessionStorage.setItem(SSMS_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/ssms-lab'); };
  const openWb = (payload) => { try { sessionStorage.setItem(MYSQL_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/mysql-workbench'); };
  const openPy = (payload) => { try { sessionStorage.setItem(PY_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/python-ide'); };
  const openSql = (payload) => { try { sessionStorage.setItem(SQL_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/sql-lab'); };
  const openJava = (payload) => { try { sessionStorage.setItem(JAVA_LOAD_KEY, JSON.stringify(payload)); } catch { /* ignore */ } navigate('/tools/java-ide'); };
  const codeLabel = soft ? 'Sample answer / Template' : ai ? 'Prompt / Code' : dn ? (dnSql ? 'T-SQL / Code' : dnWeb ? 'Code' : 'C# / Code') : my ? 'MySQL' : py ? (track === 'sql' ? 'SQL' : 'Python / Code') : java ? 'Java / Code' : web ? (track === 'react' ? 'JSX' : track === 'css' ? 'CSS' : track === 'js' ? 'JavaScript' : 'Code') : isExcel ? 'Formula / Code' : 'DAX / M';
  const pqTopic = !isExcel && /power query|\bM\b|m language|dataflow/i.test(`${t.module || ''} ${t.title}`);
  const lab = soft ? ['/tools/soft-skills', 'Soft Skills Lab'] : ai ? aiLab : dnSql ? ['/tools/ssms-lab', 'SSMS Lab'] : dnWeb ? ['/tools/playground', 'Code Playground'] : dn ? ['/tools/csharp-ide', 'C# IDE'] : my ? ['/tools/mysql-workbench', 'MySQL Workbench Lab'] : track === 'sql' ? ['/tools/sql-lab', 'SQL Lab'] : py ? ['/tools/python-ide', 'Python IDE'] : java ? ['/tools/java-ide', 'Java IDE'] : web ? ['/tools/playground', 'Code Playground'] : isExcel ? ['/tools/formula-lab', 'Formula Lab'] : pqTopic ? ['/tools/power-query-lab', 'Power Query Lab'] : ['/tools/dax-lab', 'DAX Lab'];

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
          {tr.unit === 'Day' && t.day && <span>📅 Day {t.day}</span>}
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

      <div className="practice-cta">
        <span>🧪 Practise this topic hands-on:</span>
        <Link className="btn small" to={lab[0]}>Open {lab[1]} →</Link>
        <Link className="btn small" to={`/track/${track}/${t.id}?tab=quiz`} onClick={() => setTab('quiz')}>Take the quiz</Link>
      </div>

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
          {t.tools?.length > 0 && (
            <section className="card">
              <h3>AI tools used in this lesson</h3>
              <div className="lesson-tools">
                {t.tools.map((x) => (
                  <a key={x.name} className="lesson-tool" href={x.url} target="_blank" rel="noreferrer">
                    <b>{x.name} <ExternalLink size={12} /></b><span className="muted small">{x.use}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
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
              {ex.prompt && (
                <button className="btn small primary try-btn" onClick={() => openAi({ system: ex.prompt.system || '', user: ex.prompt.user || '', title: ex.title })}>
                  <Sparkles size={14} /> Run in AI Prompt Lab
                </button>
              )}
              {ex.csharp?.files && (
                <button className="btn small primary try-btn" onClick={() => openCs({ files: ex.csharp.files, stdin: ex.csharp.stdin || '', expected: ex.result || '', title: `${t.title}: ${ex.title}` })}>
                  🟣 Open in C# IDE
                </button>
              )}
              {ex.tsql && (
                <button className="btn small primary try-btn" onClick={() => openSsms({ script: ex.tsql, expected: ex.result || '', title: ex.title })}>
                  🗄️ Open in SSMS Lab
                </button>
              )}
              {ex.mysql && (
                <button className="btn small primary try-btn" onClick={() => openWb({ script: ex.mysql, expected: ex.result || '', title: ex.title })}>
                  🐬 Open in Workbench Lab
                </button>
              )}
              {ex.python?.files && (
                <button className="btn small primary try-btn" onClick={() => openPy({ files: ex.python.files, stdin: ex.python.stdin || '', expected: ex.result || '', title: `${t.title}: ${ex.title}` })}>
                  🐍 Run in Python IDE
                </button>
              )}
              {ex.sql?.query && (
                <button className="btn small primary try-btn" onClick={() => openSql({ setup: ex.sql.setup || '', query: ex.sql.query, expected: ex.result || '', title: ex.title })}>
                  🗄️ Run in SQL Lab
                </button>
              )}
              {ex.java?.files && (
                <button className="btn small primary try-btn" onClick={() => openJava({ files: ex.java.files, stdin: ex.java.stdin || '', expected: ex.result || '', title: `${t.title}: ${ex.title}` })}>
                  ☕ Open in Java IDE
                </button>
              )}
              {ex.playground && (
                <button className="btn small primary try-btn" onClick={() => openInPlayground(navigate, ex.playground, `${t.title}: ${ex.title}`)}>
                  ▶ Try it in Code Playground
                </button>
              )}
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
            Do these exercises in {soft ? 'real life (practise aloud, with a friend or in front of a mirror)' : ai ? 'Claude / ChatGPT / Gemini and the in-app AI labs' : dnSql ? 'SQL Server Management Studio' : dn ? 'Visual Studio' : my ? 'MySQL Workbench' : track === 'sql' ? 'MySQL Workbench' : py ? 'VS Code / PyCharm' : java ? 'IntelliJ IDEA / Eclipse' : web ? 'VS Code' : isExcel ? 'real Excel' : 'real Power BI Desktop'} or in the built-in <Link to={lab[0]}>{lab[1]}</Link>
            {!isExcel && <> (the DAX Lab has a download button for the practice CSV files)</>}.
            Try first, then use the hint, then check the solution. Tick an exercise once you've solved it.
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
              {ai && (
                <button className="btn small" onClick={() => openAi({ user: String(ex.task), system: '', title: `Exercise ${i + 1}` })}>
                  ✍ Practise in AI Prompt Lab
                </button>
              )}
              {dn && !dnWeb && (
                <button className="btn small" onClick={() => (dnSql
                  ? openSsms({ script: '-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\n-- Tip: load StudentDB / EmployeeDB from Object Explorer first\n\n', expected: '', title: `Exercise ${i + 1}` })
                  : openCs({ files: { 'Program.cs': '// Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\n\nConsole.WriteLine("Start here");\n' }, expected: '', title: `Exercise ${i + 1}` }))}>
                  ✍ Solve in {dnSql ? 'SSMS Lab' : 'C# IDE'}
                </button>
              )}
              {(dnWeb) && (
                <button className="btn small" onClick={() => openInPlayground(navigate, /React/i.test(t.module || '') ? { jsx: '// Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + '\nconst { useState } = React;\n\nfunction App() {\n  return <div>Start here</div>;\n}\n' } : { html: '<!-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + ' -->\n' }, `Exercise ${i + 1}`)}>
                  ✍ Solve in Code Playground
                </button>
              )}
              {my && (
                <button className="btn small" onClick={() => openWb({ script: '-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\n-- Tip: load a sample DB from the Navigator first (college / ecommerce)\n\n', expected: '', title: `Exercise ${i + 1}` })}>
                  ✍ Solve in Workbench Lab
                </button>
              )}
              {py && track !== 'sql' && (
                <button className="btn small" onClick={() => openPy({ files: { 'main.py': '# Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\n\n' }, expected: '', title: `Exercise ${i + 1}` })}>
                  ✍ Solve in Python IDE
                </button>
              )}
              {track === 'sql' && (
                <button className="btn small" onClick={() => openSql({ setup: (t.examples.find((e) => e.sql?.setup) || {}).sql?.setup || '', query: '-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\n', expected: '', title: `Exercise ${i + 1}` })}>
                  ✍ Solve in SQL Lab
                </button>
              )}
              {java && (
                <button className="btn small" onClick={() => openJava({ files: { 'Main.java': '// Exercise: ' + String(ex.task).split('\n')[0].slice(0, 150) + '\npublic class Main {\n    public static void main(String[] args) {\n        // write your code here\n    }\n}\n' }, expected: '', title: `Exercise ${i + 1}` })}>
                  ✍ Solve in Java IDE
                </button>
              )}
              {web && (
                <button className="btn small" onClick={() => openInPlayground(navigate, track === 'react' ? { jsx: '// Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + '\nconst { useState } = React;\n\nfunction App() {\n  return <div>Start here</div>;\n}\n' } : track === 'js' ? { html: '', js: '// Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + '\n' } : track === 'css' ? { html: '<!-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + ' -->\n', css: '' } : { html: '<!-- Exercise: ' + String(ex.task).split('\n')[0].slice(0, 120) + ' -->\n' }, `Exercise ${i + 1}`)}>
                  ✍ Solve in Code Playground
                </button>
              )}
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
