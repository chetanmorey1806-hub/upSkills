import { useMemo, useRef, useState } from 'react';
import { Sparkles, Wand2, Send, Square, Copy, Trash2, CheckCircle2, XCircle, MessageSquare, Bot, User, Lightbulb } from 'lucide-react';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote, costOf } from '../ai/claudeClient.js';
import RichText from '../components/RichText.jsx';

export const AI_LOAD_KEY = 'xlpbi-ai-prompt-load';

const TEMPLATES = {
  'Professional email': { role: 'an experienced corporate communication coach', context: 'I am a fresher software developer. I missed yesterday\'s 10 AM team meeting because of a medical appointment.', task: 'Write an email to my manager apologising and asking for the meeting notes and action items.', format: 'Subject line + email body of 120–150 words', constraints: 'Polite, professional, not over-apologetic. No emojis.', examples: '', audience: 'my team manager' },
  'Explain a concept simply': { role: 'a patient teacher who explains technical topics to beginners', context: 'I am a first-year student with no programming background.', task: 'Explain what an API is.', format: '1) a one-line definition 2) a real-life analogy 3) a tiny example 4) three key points as bullets', constraints: 'Under 200 words. Avoid jargon or explain it.', examples: '', audience: 'a complete beginner' },
  'Resume bullet points': { role: 'a senior recruiter for IT companies', context: 'Project: Student Management System built with React, ASP.NET Core Web API and SQL Server. I built the login with JWT, CRUD pages and reports.', task: 'Write 4 strong resume bullet points for this project.', format: 'Bullet list. Each bullet starts with an action verb and mentions a technology and an outcome.', constraints: 'Max 25 words per bullet. Do not invent numbers – use [x]% placeholders where a metric would go.', examples: '', audience: 'recruiters scanning resumes' },
  'Study plan': { role: 'an expert study coach', context: 'I have 30 days before my placement interviews. I know basic Java and SQL. I can study 3 hours a day.', task: 'Create a day-wise study plan covering DSA, OOP, SQL and HR preparation.', format: 'A table with columns: Day, Topic, Practice task, Hours', constraints: 'Include revision days every 7th day and 2 mock interview days.', examples: '', audience: 'me' },
  'Summarize a text': { role: 'a careful analyst', context: 'Paste the article or notes here:\n<<PASTE TEXT>>', task: 'Summarize the text.', format: '5 bullet points + a one-sentence takeaway', constraints: 'Use only information from the text. If something is unclear, say so.', examples: '', audience: 'a busy manager' },
  'Code review': { role: 'a senior software engineer doing a code review', context: 'Language: Python\nCode:\n<<PASTE CODE>>', task: 'Review the code for bugs, readability and performance.', format: 'Sections: Bugs, Improvements, Improved code', constraints: 'Explain each issue in one line. Keep the improved code complete and runnable.', examples: '', audience: 'a junior developer' },
  'SQL query writer': { role: 'a SQL expert', context: 'Tables: employees(emp_id, name, dept_id, salary, hire_date), departments(dept_id, dept_name)', task: 'Write a query to find the top 3 highest-paid employees in each department.', format: 'SQL code block, then a 3-line explanation', constraints: 'Use MySQL 8 syntax with window functions.', examples: '', audience: 'a student learning SQL' },
  'Interview practice': { role: 'a technical interviewer for a .NET full stack role', context: 'I am preparing for my first job interview.', task: 'Ask me 5 interview questions one at a time on OOP and C#. After each of my answers, give feedback and a model answer, then ask the next question.', format: 'One question per message', constraints: 'Start with an easy question and increase difficulty.', examples: '', audience: 'a fresher' },
  'MCQ generator': { role: 'an examiner who writes high-quality multiple-choice questions', context: 'Topic: Excel lookup functions (VLOOKUP, XLOOKUP, INDEX-MATCH)', task: 'Create 5 MCQs.', format: 'For each: question, options A–D, correct answer, one-line explanation', constraints: 'Mix easy, medium and hard. Avoid "all of the above".', examples: '', audience: 'students' },
  'Data analysis helper': { role: 'a data analyst', context: 'Monthly sales (₹ lakh): Jan 12, Feb 15, Mar 11, Apr 18, May 21, Jun 19', task: 'Analyse the trend and give insights.', format: '1) trend summary 2) best and worst month with % change 3) three insights 4) one recommended chart type', constraints: 'Show your calculations briefly. Do not assume data that is not given.', examples: '', audience: 'a sales manager' },
  'Debug an error': { role: 'a helpful debugging expert', context: 'Error message:\n<<PASTE ERROR>>\nRelevant code:\n<<PASTE CODE>>', task: 'Find the cause of the error and fix it.', format: 'Cause (1–2 lines), Fix (code), Why it works (2 lines)', constraints: 'If more information is needed, ask for it instead of guessing.', examples: '', audience: 'a student' },
  'Social media post': { role: 'a LinkedIn content writer', context: 'I just completed a 45-day AI course and built an AI Study Buddy chatbot as my final project.', task: 'Write a LinkedIn post announcing it.', format: 'Hook line, 3 short paragraphs, 4 relevant hashtags', constraints: 'Humble, enthusiastic tone. Under 150 words.', examples: '', audience: 'recruiters and classmates' },
  'Translate & simplify': { role: 'a bilingual teacher (English and Marathi)', context: 'Text: "Machine learning lets computers learn patterns from data instead of following fixed rules."', task: 'Translate into simple Marathi and also give a simpler English version.', format: 'Marathi: … / Simple English: …', constraints: 'Use everyday words.', examples: '', audience: 'school students' },
  'Compare options': { role: 'a neutral technology advisor', context: 'I want to learn one backend technology for jobs in Pune.', task: 'Compare Java Spring Boot, .NET (ASP.NET Core) and Python Django.', format: 'A comparison table (learning curve, job demand, salary range in general terms, use cases) + a short recommendation', constraints: 'Be balanced; state that job markets change.', examples: '', audience: 'a fresher' },
  'Few-shot classifier': { role: 'a customer-support ticket classifier', context: 'Categories: Billing, Technical, Account, Other', task: 'Classify the ticket: "I was charged twice for my subscription this month."', format: 'Only the category name', constraints: 'Answer with exactly one category.', examples: 'Ticket: "App crashes when I upload a photo" → Technical\nTicket: "How do I change my email address?" → Account\nTicket: "Do you have an office in Mumbai?" → Other', audience: '' },
};

const FIELDS = [
  ['role', 'Role / persona', 'Who should the AI act as?  e.g. an experienced HR recruiter'],
  ['audience', 'Audience', 'Who is the answer for?  e.g. a fresher, a manager'],
  ['context', 'Context / input', 'Background, data or text the AI needs'],
  ['task', 'Task', 'What exactly should it do? Start with a verb: Write, Explain, Compare…'],
  ['format', 'Output format', 'e.g. a table, 5 bullets, JSON, an email with subject'],
  ['constraints', 'Constraints', 'Length, tone, what to avoid, rules'],
  ['examples', 'Examples (few-shot)', 'Optional: input → output examples to copy the pattern'],
];

function assemble(p) {
  const parts = [];
  if (p.role) parts.push(`You are ${p.role.replace(/^you are\s+/i, '')}.`);
  if (p.context) parts.push(`Context:\n${p.context}`);
  if (p.task) parts.push(`Task:\n${p.task}`);
  if (p.audience) parts.push(`Audience: ${p.audience}`);
  if (p.examples) parts.push(`Examples:\n${p.examples}`);
  if (p.format) parts.push(`Output format:\n${p.format}`);
  if (p.constraints) parts.push(`Constraints:\n${p.constraints}`);
  return parts.join('\n\n');
}

function analyse(p, text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const checks = [
    [!!p.role, 'Gives the AI a role or persona', 'Add a role, e.g. "You are an experienced recruiter".', 15],
    [/^\s*(write|explain|create|list|compare|summari[sz]e|classify|analy[sz]e|generate|translate|review|find|draft|suggest|convert|ask|rewrite|design|plan|build|fix|calculate)\b/i.test(p.task || ''), 'Task starts with a clear action verb', 'Start the task with a verb such as Write / Explain / Compare.', 15],
    [(p.context || '').split(/\s+/).filter(Boolean).length >= 8, 'Provides enough context (8+ words)', 'Add background: who you are, what the situation is, the data to use.', 20],
    [!!p.format, 'Specifies the output format', 'Say how the answer should look: table, bullets, JSON, word limit.', 15],
    [!!p.constraints, 'Adds constraints (length / tone / rules)', 'Add limits like "under 150 words", "formal tone", "no jargon".', 10],
    [!!p.audience, 'Defines the audience', 'Say who will read it (beginner, manager, recruiter…).', 10],
    [!/\b(something|stuff|things|good|nice|etc)\b/i.test(`${p.task} ${p.format}`), 'Avoids vague words', 'Replace vague words (something, stuff, good) with specifics.', 10],
    [words <= 400, 'Prompt is focused (≤ 400 words)', 'Very long prompts can bury the main task – trim or structure it.', 5],
  ];
  const score = checks.reduce((s, c) => s + (c[0] ? c[3] : 0), 0);
  return { checks, score, words };
}

export default function AiPromptLab() {
  const loaded = useMemo(() => { try { const x = JSON.parse(sessionStorage.getItem(AI_LOAD_KEY)); sessionStorage.removeItem(AI_LOAD_KEY); return x; } catch { return null; } }, []);
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-opus-5-5');
  const [effort, setEffort] = useState('medium');
  const [mode, setMode] = useState(loaded ? 'raw' : 'builder');
  const [p, setP] = useState(TEMPLATES['Explain a concept simply']);
  const [raw, setRaw] = useState(loaded?.user || '');
  const [system, setSystem] = useState(loaded?.system || '');
  const [title] = useState(loaded?.title || '');
  const [chat, setChat] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [usage, setUsage] = useState(null);
  const abortRef = useRef(null);
  const [follow, setFollow] = useState('');

  const built = assemble(p);
  const prompt = mode === 'builder' ? built : raw;
  const quality = analyse(mode === 'builder' ? p : { task: raw, context: raw, role: /you are/i.test(raw) ? 'x' : '', format: /(format|table|bullet|json|words|list)/i.test(raw) ? 'x' : '', constraints: /(under|max|limit|tone|avoid|only)/i.test(raw) ? 'x' : '', audience: /(for a|audience|beginner|manager|student)/i.test(raw) ? 'x' : '' }, prompt);

  const send = async (userText) => {
    if (!userText.trim()) return;
    if (!apiKey) { setErr('Add your API key above to run prompts here, or use "Open in Claude / ChatGPT".'); return; }
    setErr(''); setBusy(true);
    const history = [...chat, { role: 'user', content: userText }];
    setChat([...history, { role: 'assistant', content: '' }]);
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const { message } = await streamClaude({
        apiKey, model, effort, system, messages: history, signal: ctrl.signal,
        onText: (d) => setChat((c) => { const n = [...c]; n[n.length - 1] = { role: 'assistant', content: n[n.length - 1].content + d }; return n; }),
      });
      setUsage({ ...message.usage, model: message.model, cost: costOf(model, message.usage) });
      const note = stopNote(message);
      if (note) setErr(note);
    } catch (e) {
      setErr(describeError(e));
      setChat((c) => (c[c.length - 1]?.content ? c : c.slice(0, -1)));
    }
    setBusy(false);
  };
  const copy = (t) => navigator.clipboard?.writeText(t).catch(() => {});
  const openIn = (base) => window.open(base + encodeURIComponent((system ? system + '\n\n' : '') + prompt), '_blank');

  return (
    <div className="ai-page">
      <div className="page-head">
        <h1><Sparkles className="hicon" /> AI Prompt Lab</h1>
        <p className="muted">Build better prompts step by step, check their quality, then run them with Claude or open them in any AI chatbot. {title && <b>Loaded from lesson: {title}</b>}</p>
      </div>
      <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} />

      <div className="ai-grid">
        <section className="card">
          <div className="toolbar">
            <div className="seg light">
              <button className={mode === 'builder' ? 'on' : ''} onClick={() => setMode('builder')}><Wand2 size={14} /> Prompt builder</button>
              <button className={mode === 'raw' ? 'on' : ''} onClick={() => { if (!raw) setRaw(built); setMode('raw'); }}><MessageSquare size={14} /> Free-form prompt</button>
            </div>
            {mode === 'builder' && (
              <select value="" onChange={(e) => e.target.value && setP({ ...TEMPLATES[e.target.value] })}>
                <option value="">📚 Template library…</option>
                {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
              </select>
            )}
          </div>
          {mode === 'builder' ? (
            <div className="ai-fields">
              {FIELDS.map(([k, label, ph]) => (
                <label key={k}>{label}
                  <textarea className="input" rows={k === 'context' || k === 'examples' ? 3 : 2} placeholder={ph} value={p[k] || ''} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
                </label>
              ))}
            </div>
          ) : (
            <textarea className="input mono ai-raw" rows={14} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Write your prompt here…" />
          )}
          <details className="ai-system"><summary>System prompt (optional)</summary>
            <textarea className="input" rows={3} value={system} onChange={(e) => setSystem(e.target.value)} placeholder="Standing instructions for the whole chat, e.g. You are a friendly tutor. Always answer in simple English." />
          </details>
        </section>

        <section className="card">
          <h3>Prompt quality: <span className={`ai-score s${Math.floor(quality.score / 34)}`}>{quality.score}/100</span></h3>
          <div className="pbar"><div className="pbar-fill" style={{ width: `${quality.score}%` }} /></div>
          <ul className="ai-checks">
            {quality.checks.map(([ok, label, fix]) => (
              <li key={label} className={ok ? 'ok' : 'no'}>
                {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{label}{!ok && <small className="muted"> – {fix}</small>}</span>
              </li>
            ))}
          </ul>
          <h4>Final prompt <span className="muted small">({quality.words} words)</span></h4>
          <pre className="ai-preview">{prompt || '…'}</pre>
          <div className="row-btns">
            <button className="btn primary" disabled={busy || !prompt.trim()} onClick={() => { setChat([]); setUsage(null); send(prompt); }}><Send size={14} /> Run with Claude</button>
            <button className="btn" onClick={() => copy((system ? system + '\n\n' : '') + prompt)}><Copy size={14} /> Copy</button>
            <button className="btn" onClick={() => openIn('https://claude.ai/new?q=')}>Open in Claude.ai</button>
            <button className="btn" onClick={() => openIn('https://chatgpt.com/?q=')}>Open in ChatGPT</button>
          </div>
          <div className="tip"><Lightbulb size={14} /> Tip: change one thing at a time (role, format, examples) and compare the answers. That is how prompt engineers iterate.</div>
        </section>
      </div>

      <section className="card ai-chat">
        <div className="toolbar">
          <h3><Bot size={18} /> Conversation</h3>
          <div className="row-btns">
            {busy && <button className="btn small" onClick={() => abortRef.current?.abort()}><Square size={12} /> Stop</button>}
            <button className="btn small" onClick={() => { setChat([]); setUsage(null); setErr(''); }}><Trash2 size={12} /> Clear</button>
          </div>
        </div>
        {chat.length === 0 && <p className="muted">Click <b>Run with Claude</b> to see the answer here. Then ask follow-up questions to refine it.</p>}
        {chat.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            <div className="ai-avatar">{m.role === 'user' ? <User size={16} /> : <Bot size={16} />}</div>
            <div className="ai-bubble">{m.role === 'assistant' ? <RichText text={m.content || (busy ? '…' : '')} /> : <pre>{m.content}</pre>}
              {m.role === 'assistant' && m.content && <button className="link-btn" onClick={() => copy(m.content)}><Copy size={12} /> copy</button>}
            </div>
          </div>
        ))}
        {err && <div className="explain bad">{err}</div>}
        {usage && <div className="muted small">Tokens: {usage.input_tokens} in · {usage.output_tokens} out{usage.cost != null && ` · ≈ $${usage.cost.toFixed(4)}`} · model {usage.model}</div>}
        {chat.length > 0 && (
          <div className="ai-follow">
            <input className="input" value={follow} onChange={(e) => setFollow(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !busy) { send(follow); setFollow(''); } }} placeholder="Follow-up: e.g. Make it shorter / Give 2 more examples / Explain point 3" />
            <button className="btn primary" disabled={busy || !follow.trim()} onClick={() => { send(follow); setFollow(''); }}><Send size={14} /></button>
          </div>
        )}
      </section>
    </div>
  );
}
