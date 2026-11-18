import { useEffect, useMemo, useRef, useState } from 'react';
import { Rocket, LayoutTemplate, ScrollText, Database, FlaskConical, Download, Send, Bot, User, CheckCircle2, XCircle, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote } from '../ai/claudeClient.js';
import { buildIndex, chunkText } from '../ai/textSearch.js';
import { buildStandaloneHtml, buildReport } from '../ai/exportApp.js';
import RichText from '../components/RichText.jsx';

const STORE = 'xlpbi-ai-app-project-v1';

const TEMPLATES = {
  study: { name: 'Study Buddy', tagline: 'Your friendly tutor for any subject', color: '#4f46e5', users: 'College students preparing for exams', problem: 'Students get stuck on concepts late at night when no teacher is available.', features: 'Explains concepts simply with analogies\nCreates practice questions\nChecks answers and gives hints', system: 'You are Study Buddy, a patient tutor for college students.\n- Explain concepts in simple English with a real-life analogy and a small example.\n- When the student asks for practice, give 3 questions one at a time and wait for their answer.\n- Give hints before full answers. Encourage the student.\n- If you are not sure about something, say so.\n- Keep answers under 200 words unless asked for more.', welcome: "Hi! I'm Study Buddy 📚 What topic shall we learn today?", starters: ['Explain OOP with an example', 'Give me 3 SQL practice questions', 'What is overfitting in ML?'], kb: '' },
  resume: { name: 'Resume Reviewer', tagline: 'Get instant feedback on your resume', color: '#0891b2', users: 'Freshers applying for their first job', problem: 'Freshers do not know what recruiters look for and get rejected without feedback.', features: 'Reviews resume text section by section\nRewrites weak bullet points\nGives an ATS-friendliness score', system: 'You are a senior IT recruiter reviewing fresher resumes.\nWhen the user pastes a resume:\n1. Give an overall score out of 10 with one-line reason.\n2. List 3 strengths and 3 improvements.\n3. Rewrite the 3 weakest bullet points using action verb + technology + outcome.\nNever invent experience or numbers; use [x] placeholders. Be kind and specific.', welcome: 'Paste your resume text (remove phone/address) and I will review it.', starters: ['How should a fresher resume be structured?', 'Rewrite: "Did a project on Java"'], kb: '' },
  support: { name: 'College Help Desk', tagline: 'Answers about fees, timings, hostel and placements', color: '#16a34a', users: 'Students and parents visiting the college website', problem: 'The office gets the same questions every day and answers are slow.', features: 'Answers from the official college information (RAG)\nSays "I don\'t know" when information is missing\nPolite, short answers', system: 'You are the help desk assistant for ABC College.\n- Answer ONLY using the reference information provided with the question.\n- If the answer is not in the reference information, say: "I don\'t have that information. Please contact the office at office@abc.edu."\n- Keep answers short (2-4 sentences) and polite.', welcome: 'Hello! Ask me about fees, timings, attendance, hostel or placements.', starters: ['What is the hostel fee?', 'How much attendance is needed?', 'When do companies visit for placements?'], kb: `College timings are 9:00 AM to 4:30 PM, Monday to Saturday. The library stays open until 7 PM on weekdays.\n\nThe annual fee for the B.Sc. Computer Science course is 85,000 rupees, payable in two instalments in July and January. Late payment attracts a fine of 500 rupees per week.\n\nStudents need at least 75 percent attendance in every subject to be allowed to sit the final examinations. Medical leave must be supported by a doctor's certificate within 7 days.\n\nThe placement cell conducts aptitude training every Saturday from August. Companies like TCS, Infosys and Persistent visit the campus between October and February.\n\nHostel rooms are available for both boys and girls. The hostel fee is 60,000 rupees per year including mess. Apply through the student portal before 30 June.` },
  interview: { name: 'Interview Coach', tagline: 'Practice technical interviews with feedback', color: '#d97706', users: 'Students preparing for placement interviews', problem: 'Students lack a safe place to practise answering interview questions aloud.', features: 'Asks questions one at a time\nScores answers out of 10 with feedback\nGives a model answer', system: 'You are a friendly technical interviewer.\nAsk which role and topic the student wants (e.g. Java, SQL, React, HR).\nThen ask ONE question at a time. After each answer: score it out of 10, give 2 lines of feedback and a short model answer, then ask the next question. Increase difficulty gradually. After 5 questions give an overall summary.', welcome: "Hi! I'll be your mock interviewer 🎯 Which role and topic should we practise?", starters: ['Java developer, OOP questions', 'SQL interview practice', 'HR round practice'], kb: '' },
  recipe: { name: 'Healthy Recipe Helper', tagline: 'Recipes from what is in your kitchen', color: '#dc2626', users: 'Hostel students and young professionals', problem: 'People waste food and eat unhealthy because they don\'t know what to cook with available ingredients.', features: 'Suggests recipes from listed ingredients\nGives step-by-step instructions\nShows approximate cooking time', system: 'You are a home-cooking assistant for busy students in India.\nWhen the user lists ingredients, suggest 2 simple, healthy recipes using mostly those ingredients.\nFor each: name, time needed, ingredients, numbered steps (max 8).\nMention allergens if present. Do not give medical advice.', welcome: 'Tell me what ingredients you have and I\'ll suggest a recipe 🍳', starters: ['I have rice, onion, tomato and eggs', 'Quick high-protein breakfast?'], kb: '' },
  custom: { name: 'My AI Assistant', tagline: 'Describe what your assistant does', color: '#7c3aed', users: '', problem: '', features: '', system: 'You are a helpful assistant that …', welcome: 'Hi! How can I help you today?', starters: ['', '', ''], kb: '' },
};

const blank = () => ({ ...TEMPLATES.study, template: 'study', useKb: false, topK: 3, student: '', limits: '', future: '', learned: '' });
const STEPS = [['template', 'Choose & plan', LayoutTemplate], ['instructions', 'Instructions', ScrollText], ['knowledge', 'Knowledge base', Database], ['test', 'Test', FlaskConical], ['export', 'Export & report', Download]];

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AiAppBuilder() {
  const [p, setP] = useState(() => { try { return JSON.parse(localStorage.getItem(STORE))?.project || blank(); } catch { return blank(); } });
  const [tests, setTests] = useState(() => { try { return JSON.parse(localStorage.getItem(STORE))?.tests || [{ q: '', expected: '', verdict: '', note: '' }]; } catch { return [{ q: '', expected: '', verdict: '', note: '' }]; } });
  const [step, setStep] = useState('template');
  const [apiKey, setKey] = useApiKey();
  const [chat, setChat] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [lastHits, setLastHits] = useState([]);
  const [input, setInput] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ project: p, tests })); } catch { /* ignore */ } }, [p, tests]);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const chunks = useMemo(() => (p.kb ? chunkText(p.kb, 60) : []), [p.kb]);
  const index = useMemo(() => (chunks.length ? buildIndex(chunks) : null), [chunks]);

  const progress = [!!p.name && !!p.problem, p.system.length > 60, true, tests.some((t) => t.verdict), false];

  const ask = async (question, record) => {
    if (!question.trim()) return null;
    if (!apiKey) { setErr('Add your API key above to test your app.'); return null; }
    setErr(''); setBusy(true);
    let content = question; let hits = [];
    if (p.useKb && index) {
      hits = index.search(question, p.topK).filter((h) => h.score > 0);
      if (hits.length) content = `Use this reference information when it is relevant:\n${hits.map((h, i) => `[${i + 1}] ${h.text}`).join('\n')}\n\nQuestion: ${question}`;
    }
    setLastHits(hits);
    const history = [...chat.map((m) => ({ role: m.role, content: m.sent || m.content })), { role: 'user', content }];
    setChat((c) => [...c, { role: 'user', content: question, sent: content }, { role: 'assistant', content: '' }]);
    let out = '';
    try {
      const { message } = await streamClaude({ apiKey, model: 'claude-opus-5-5', effort: 'low', system: p.system, messages: history,
        onText: (d) => { out += d; setChat((c) => { const n = [...c]; n[n.length - 1] = { role: 'assistant', content: out }; return n; }); } });
      const note = stopNote(message); if (note) setErr(note);
    } catch (e) { setErr(describeError(e)); setChat((c) => c.slice(0, -2)); }
    setBusy(false);
    if (record) record(out);
    return out;
  };

  const runTest = async (i) => {
    setChat([]);
    const t = tests[i];
    await ask(t.q, (out) => setTests((ts) => ts.map((x, j) => (j === i ? { ...x, answer: out } : x))));
  };

  const loadFiles = (e) => {
    const files = [...(e.target.files || [])];
    Promise.all(files.map((f) => f.text().then((t) => `# ${f.name}\n${t}`))).then((texts) => set('kb', [p.kb, ...texts].filter(Boolean).join('\n\n')));
    e.target.value = '';
  };

  const sysChecks = [
    [/you are/i.test(p.system), 'Defines who the assistant is (role)'],
    [/(only|never|don't|do not|avoid)/i.test(p.system), 'Has rules / boundaries'],
    [/(format|bullet|steps|under \d+|words|table|short)/i.test(p.system), 'Specifies answer style or length'],
    [/(not sure|don't know|do not know|say so|contact)/i.test(p.system), 'Says what to do when it does not know'],
  ];

  return (
    <div className="ai-page">
      <div className="page-head">
        <h1><Rocket className="hicon" /> AI App Builder <span className="muted small">(final project)</span></h1>
        <p className="muted">Build your own AI chatbot app in 5 steps: plan it, write its instructions, give it knowledge (RAG), test it, then export a working app and your project report.</p>
      </div>

      <div className="ab-steps">
        {STEPS.map(([k, label, Icon], i) => (
          <button key={k} className={`ab-step ${step === k ? 'on' : ''} ${progress[i] ? 'done' : ''}`} onClick={() => setStep(k)}>
            <span className="ab-num">{progress[i] ? <CheckCircle2 size={16} /> : i + 1}</span><Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {step === 'template' && (
        <div className="card">
          <h3>1. Choose a template and plan your app</h3>
          <div className="ab-templates">
            {Object.entries(TEMPLATES).map(([k, t]) => (
              <button key={k} className={`ab-tpl ${p.template === k ? 'on' : ''}`} style={{ borderTopColor: t.color }}
                onClick={() => { if (p.template !== k && !window.confirm(`Load the "${t.name}" template? Your current instructions will be replaced.`)) return; setP({ ...blank(), ...t, template: k, useKb: !!t.kb, student: p.student }); setChat([]); }}>
                <b>{t.name}</b><span>{t.tagline}</span>
              </button>
            ))}
          </div>
          <div className="ab-form">
            <label>App name<input className="input" value={p.name} onChange={(e) => set('name', e.target.value)} /></label>
            <label>Tagline<input className="input" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} /></label>
            <label>Brand colour<input type="color" value={p.color} onChange={(e) => set('color', e.target.value)} /></label>
            <label>Your name (for the report)<input className="input" value={p.student} onChange={(e) => set('student', e.target.value)} /></label>
            <label className="wide">Problem it solves<textarea className="input" rows={2} value={p.problem} onChange={(e) => set('problem', e.target.value)} /></label>
            <label className="wide">Target users<textarea className="input" rows={2} value={p.users} onChange={(e) => set('users', e.target.value)} /></label>
            <label className="wide">Key features (one per line)<textarea className="input" rows={3} value={p.features} onChange={(e) => set('features', e.target.value)} /></label>
          </div>
          <button className="btn primary" onClick={() => setStep('instructions')}>Next: instructions →</button>
        </div>
      )}

      {step === 'instructions' && (
        <div className="card">
          <h3>2. Write your app's instructions (system prompt)</h3>
          <p className="muted small">The system prompt is the "job description" of your AI. It defines its role, rules, answer style and what to do when it doesn't know something.</p>
          <textarea className="input mono" rows={10} value={p.system} onChange={(e) => set('system', e.target.value)} />
          <ul className="ai-checks">{sysChecks.map(([ok, l]) => <li key={l} className={ok ? 'ok' : 'no'}>{ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}<span>{l}</span></li>)}</ul>
          <label>Welcome message<input className="input" value={p.welcome} onChange={(e) => set('welcome', e.target.value)} /></label>
          <label>Starter questions (shown as buttons)</label>
          {p.starters.map((s, i) => <input key={i} className="input" value={s} onChange={(e) => set('starters', p.starters.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Starter question ${i + 1}`} />)}
          <button className="btn small" onClick={() => set('starters', [...p.starters, ''])}><Plus size={12} /> Add starter</button>
          <div className="row-btns"><button className="btn primary" onClick={() => setStep('knowledge')}>Next: knowledge base →</button></div>
        </div>
      )}

      {step === 'knowledge' && (
        <div className="card">
          <h3>3. Knowledge base (RAG, optional)</h3>
          <p className="muted small">Give your app your own information: FAQs, notes, policies, product details. For each question the app retrieves the most relevant chunks and sends them to Claude with the question, so answers are grounded in YOUR data.</p>
          <label className="check"><input type="checkbox" checked={p.useKb} onChange={(e) => set('useKb', e.target.checked)} /> Use knowledge base</label>
          <textarea className="input" rows={12} value={p.kb} onChange={(e) => set('kb', e.target.value)} placeholder="Paste text here (separate topics with a blank line), or upload .txt / .md files" />
          <div className="row-btns">
            <button className="btn small" onClick={() => fileRef.current?.click()}><Upload size={12} /> Upload .txt / .md</button>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv" multiple hidden onChange={loadFiles} />
            <label className="small">Chunks retrieved per question (top-k): <select value={p.topK} onChange={(e) => set('topK', Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></label>
            <span className="muted small">{chunks.length} chunks · {p.kb.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <div className="row-btns"><button className="btn primary" onClick={() => setStep('test')}>Next: test your app →</button></div>
        </div>
      )}

      {step === 'test' && (
        <div className="ab-test">
          <ApiKeyBox apiKey={apiKey} setKey={setKey} compact />
          <div className="ai-grid">
            <div className="card ab-preview" style={{ '--app': p.color }}>
              <div className="ab-apphead"><b>{p.name}</b><span>{p.tagline}</span></div>
              <div className="ai-msg assistant"><div className="ai-avatar"><Bot size={16} /></div><div className="ai-bubble">{p.welcome}</div></div>
              {chat.map((m, i) => (
                <div key={i} className={`ai-msg ${m.role}`}><div className="ai-avatar">{m.role === 'user' ? <User size={16} /> : <Bot size={16} />}</div>
                  <div className="ai-bubble">{m.role === 'assistant' ? <RichText text={m.content || '…'} /> : m.content}</div></div>
              ))}
              {err && <div className="explain bad">{err}</div>}
              <div className="chips">{p.starters.filter(Boolean).map((s) => <button key={s} className="chip" disabled={busy} onClick={() => ask(s)}>{s}</button>)}</div>
              <div className="ai-follow">
                <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !busy) { ask(input); setInput(''); } }} placeholder="Ask your app something…" />
                <button className="btn primary" disabled={busy} onClick={() => { ask(input); setInput(''); }}><Send size={14} /></button>
                <button className="btn" onClick={() => { setChat([]); setLastHits([]); }}>New chat</button>
              </div>
              {p.useKb && lastHits.length > 0 && (
                <details className="ab-hits"><summary>Retrieved knowledge for the last question ({lastHits.length})</summary>
                  {lastHits.map((h, i) => <div key={i} className="ai-hit"><span className="ai-sim">score {h.score.toFixed(3)}</span><p>{h.text}</p></div>)}</details>
              )}
            </div>
            <div className="card">
              <h3>Test cases</h3>
              <p className="muted small">Professional AI apps are tested with planned questions: normal ones, tricky ones, and questions the app should refuse or say "I don't know" to. Run each, then mark Pass or Fail.</p>
              {tests.map((t, i) => (
                <div key={i} className="ab-tc">
                  <input className="input" placeholder={`Test question ${i + 1}`} value={t.q} onChange={(e) => setTests(tests.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                  <input className="input" placeholder="Expected behaviour (e.g. says hostel fee is 60,000)" value={t.expected} onChange={(e) => setTests(tests.map((x, j) => (j === i ? { ...x, expected: e.target.value } : x)))} />
                  <div className="row-btns">
                    <button className="btn small" disabled={busy || !t.q} onClick={() => runTest(i)}><Send size={12} /> Run</button>
                    <button className={`btn small ${t.verdict === 'pass' ? 'success' : ''}`} onClick={() => setTests(tests.map((x, j) => (j === i ? { ...x, verdict: 'pass' } : x)))}><CheckCircle2 size={12} /> Pass</button>
                    <button className={`btn small ${t.verdict === 'fail' ? 'danger-btn' : ''}`} onClick={() => setTests(tests.map((x, j) => (j === i ? { ...x, verdict: 'fail' } : x)))}><XCircle size={12} /> Fail</button>
                    <input className="input small-in" placeholder="Notes" value={t.note} onChange={(e) => setTests(tests.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
                    {tests.length > 1 && <button className="link-btn danger" onClick={() => setTests(tests.filter((_, j) => j !== i))}><Trash2 size={12} /></button>}
                  </div>
                </div>
              ))}
              <button className="btn small" onClick={() => setTests([...tests, { q: '', expected: '', verdict: '', note: '' }])}><Plus size={12} /> Add test case</button>
              <div className="muted small">Passed {tests.filter((t) => t.verdict === 'pass').length} / {tests.length}. Fix the instructions or knowledge base when a test fails, then re-run it.</div>
            </div>
          </div>
        </div>
      )}

      {step === 'export' && (
        <div className="card">
          <h3>5. Export your app and project report</h3>
          <div className="ab-form">
            <label className="wide">Limitations & responsible AI<textarea className="input" rows={2} value={p.limits} onChange={(e) => set('limits', e.target.value)} placeholder="e.g. It can be wrong; users should not share personal data; answers need human review for important decisions." /></label>
            <label className="wide">Future improvements<textarea className="input" rows={2} value={p.future} onChange={(e) => set('future', e.target.value)} /></label>
            <label className="wide">What I learned<textarea className="input" rows={2} value={p.learned} onChange={(e) => set('learned', e.target.value)} /></label>
          </div>
          <div className="ab-exports">
            <button className="btn primary" onClick={() => download(`${p.name.replace(/\W+/g, '-').toLowerCase() || 'my-ai-app'}.html`, buildStandaloneHtml(p), 'text/html')}><Download size={14} /> Download app (.html)</button>
            <button className="btn" onClick={() => download('project-report.md', buildReport(p, tests), 'text/markdown')}><FileText size={14} /> Download project report (.md)</button>
            <button className="btn" onClick={() => download('ai-app-project.json', JSON.stringify({ project: p, tests }, null, 2), 'application/json')}><Download size={14} /> Save project file (.json)</button>
            <label className="btn"><Upload size={14} /> Open project file<input type="file" accept=".json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then((t) => { try { const d = JSON.parse(t); setP({ ...blank(), ...d.project }); setTests(d.tests || []); } catch { window.alert('Not a valid project file'); } }); e.target.value = ''; }} /></label>
          </div>
          <ul className="muted small">
            <li>The downloaded <b>.html</b> app is a complete chatbot: open it in any browser, paste an API key, and it works. You can host it free on GitHub Pages or Netlify.</li>
            <li>The <b>project report</b> (Markdown) contains your problem statement, design, system prompt, test results and reflections. Open it in VS Code or paste into Word/Google Docs.</li>
            <li>Present: live demo → problem → how it works (prompt + RAG) → test results → limitations → next steps.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
