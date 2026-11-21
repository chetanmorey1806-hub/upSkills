// Interview Coach, part 2:
//  6. Versant / communication test practice
//  7. GD topic bank 2026
//  8. Common English mistakes
//  9. Interview day kit (questions to ask, checklists, follow-up emails)
// 10. First job skills (stand-up, chat, Jira, status updates ...)
// Every tool ends with timed tests that use the normal Day Task engine (track "coach").
import { useEffect, useMemo, useState } from 'react';
import {
  Headphones, Users, SpellCheck, CalendarCheck, BriefcaseBusiness, Play, Eye, Keyboard, Mail, ClipboardList, Bug, Undo2, Shuffle, CheckCircle2, XCircle,
  Lightbulb, ArrowRight, Search, Star, Download, Timer, RotateCcw, MessageSquare,
} from 'lucide-react';
import { CoachNav, shuffle, similarity, SpeakBtn, MicBox, Empty, SpeakingDrill } from './InterviewCoach.jsx';
import DayTask from '../components/DayTask.jsx';
import { useStudy } from '../study.js';
import { speak, stopSpeaking } from '../components/useSpeech.js';
import { downloadFile } from '../components/careerUtils.js';

const mod = (g) => Object.values(g)[0] || {};
const V = mod(import.meta.glob('../data/coach/versant.js', { eager: true }));
const G = mod(import.meta.glob('../data/coach/gd.js', { eager: true }));
const E = mod(import.meta.glob('../data/coach/englishMistakes.js', { eager: true }));
const D = mod(import.meta.glob('../data/coach/interviewDay.js', { eager: true }));
const J = mod(import.meta.glob('../data/coach/firstJob.js', { eager: true }));
const TEST_FILES = import.meta.glob('../data/day-tasks/coach/*.js');
const hasTest = (id) => !!TEST_FILES[`../data/day-tasks/coach/${id}.js`];

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const pct = (x) => Math.round(x * 100);

function Tabs({ tabs, cur, set }) {
  return <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={`tab ${cur === k ? 'active' : ''}`} onClick={() => set(k)}>{l}</button>)}</div>;
}

function Head({ icon: I, title, children }) {
  return <div className="page-head"><h1><I size={28} className="ico" /> {title}</h1><p className="muted">{children}</p></div>;
}

// Timed tests: the same Day Task engine as the courses (timer, submit, correct / wrong with explanations).
function CoachTests({ ids }) {
  const list = ids.filter(hasTest);
  const [cur, setCur] = useState(list[0]);
  if (!list.length) return <Empty what="test" />;
  return (
    <div>
      {list.length > 1 && <div className="ic-nav">{list.map((id, k) => <button key={id} className={`chip ${cur === id ? 'active' : ''}`} onClick={() => setCur(id)}>Test {k + 1}</button>)}</div>}
      <DayTask key={cur} track="coach" lesson={{ id: cur, title: `Test ${list.indexOf(cur) + 1}` }} />
    </div>
  );
}

function Verdict({ score, good = 0.8, ok = 0.5 }) {
  const v = score >= good ? 'good' : score >= ok ? 'close' : 'again';
  return (
    <div className={`ic-result ${v}`}>
      <b>{v === 'good' ? <><CheckCircle2 size={16} /> {pct(score)}% match. Excellent.</> : v === 'close' ? <><Lightbulb size={16} /> {pct(score)}% match. Close, compare with the original.</> : <><XCircle size={16} /> {pct(score)}% match. Listen again and try once more.</>}</b>
    </div>
  );
}

/* ================================ 6. Versant ================================ */
export function VersantPractice() {
  const parts = V.VERSANT_PARTS || [];
  const [tab, setTab] = useState('reading');
  const info = parts.find((p) => p.id === tab);
  const tabs = [...parts.map((p) => [p.id, p.name]), ['test', 'Full tests']];
  return (
    <div className="ic-page">
      <Head icon={Headphones} title="Versant / Communication Test">Many companies (Accenture, Capgemini, TCS for some roles and BPO / support roles) check spoken and written English with a Versant-style test. Practise every part here: speaking, listening, sentence building, typing and email writing.</Head>
      <CoachNav />
      {!parts.length ? <Empty what="Versant" /> : (
        <>
          <Tabs tabs={tabs} cur={tab} set={(k) => { stopSpeaking(); setTab(k); }} />
          {info && <div className="card ic-partinfo"><b>{info.name}:</b> {info.how}{info.tips?.length > 0 && <ul className="small">{info.tips.map((t) => <li key={t}>{t}</li>)}</ul>}</div>}
          {tab === 'reading' && <SayItBack items={V.READING} mode="read" />}
          {tab === 'repeat' && <SayItBack items={V.REPEAT} mode="repeat" />}
          {tab === 'builds' && <SentenceBuilds items={V.SENTENCE_BUILDS} />}
          {tab === 'conversations' && <Conversations items={V.CONVERSATIONS} />}
          {tab === 'completion' && <Completion items={V.SENTENCE_COMPLETION} />}
          {tab === 'dictation' && <Dictation items={V.DICTATION} />}
          {tab === 'passage' && <PassageRecon items={V.PASSAGES} />}
          {tab === 'typing' && <TypingTest items={V.TYPING} />}
          {tab === 'email' && <EmailWriting items={V.EMAILS} />}
          {tab === 'test' && <CoachTests ids={['versant-1', 'versant-2']} />}
        </>
      )}
    </div>
  );
}

function useDeck(items) {
  const deck = useMemo(() => shuffle(items || []), [items]);
  const [i, setI] = useState(0);
  return [deck[i % Math.max(1, deck.length)], () => setI((x) => x + 1), (i % Math.max(1, deck.length)) + 1, deck.length];
}

function SayItBack({ items, mode }) {
  const [s, next, n, total] = useDeck(items);
  const [ans, setAns] = useState('');
  const [res, setRes] = useState(null);
  const [shown, setShown] = useState(mode === 'read');
  useEffect(() => { setAns(''); setRes(null); setShown(mode === 'read'); }, [s, mode]);
  if (!s) return null;
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      {mode === 'read' ? <p className="ic-src big">{s}</p> : (
        <div className="row-btns">
          <button className="btn primary" onClick={() => speak(s, 0.95)}><Play size={15} /> Play sentence</button>
          <button className="btn small" onClick={() => setShown((v) => !v)}><Eye size={14} /> {shown ? 'Hide' : 'Show'} text</button>
        </div>
      )}
      {mode === 'repeat' && shown && <p className="ic-src">{s}</p>}
      <p className="muted small">{mode === 'read' ? 'Read the sentence aloud clearly (press Speak), or type it to check your reading.' : 'Listen once, then say the same sentence (press Speak) or type what you heard.'}</p>
      <MicBox value={ans} onChange={setAns} rows={2} />
      <div className="row-btns">
        <button className="btn primary" disabled={!ans.trim()} onClick={() => { setRes(similarity(ans, [s])); setShown(true); }}>Check</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {res != null && <Verdict score={res} />}
    </div>
  );
}

function SentenceBuilds({ items }) {
  const [s, next, n, total] = useDeck(items);
  const [order, setOrder] = useState([]);
  const [res, setRes] = useState(null);
  const pool = useMemo(() => (s ? shuffle(s.parts.map((p, k) => ({ p, k }))) : []), [s]);
  useEffect(() => { setOrder([]); setRes(null); }, [s]);
  if (!s) return null;
  const built = order.map((k) => s.parts[k]).join(' ');
  const check = () => setRes(norm(built) === norm(s.answer));
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      <p className="muted small">Tap the phrases in the right order to make a correct sentence.</p>
      <div className="ic-build">{built || <span className="muted">Your sentence appears here</span>}</div>
      <div className="ic-chips">{pool.map(({ p, k }) => <button key={k} className="chip" disabled={order.includes(k) || res != null} onClick={() => setOrder((o) => [...o, k])}>{p}</button>)}</div>
      <div className="row-btns">
        <button className="btn primary" disabled={order.length !== s.parts.length || res != null} onClick={check}>Check</button>
        <button className="btn small" disabled={!order.length || res != null} onClick={() => setOrder((o) => o.slice(0, -1))}><Undo2 size={14} /> Undo</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {res != null && <div className={`ic-result ${res ? 'good' : 'again'}`}><b>{res ? <><CheckCircle2 size={16} /> Correct.</> : <><XCircle size={16} /> Not quite.</>}</b><div>Correct sentence: <b>{s.answer}</b> <SpeakBtn text={s.answer} /></div></div>}
    </div>
  );
}

function Conversations({ items }) {
  const [c, next, n, total] = useDeck(items);
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [c]);
  if (!c) return null;
  const play = () => speak(c.dialog.map(([who, t]) => `${who}: ${t}`).join(' ... ') + ` ... Question: ${c.q}`, 0.95);
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      <div className="row-btns"><button className="btn primary" onClick={play}><Play size={15} /> Play conversation</button></div>
      <p className="ic-sit-q">{c.q}</p>
      <div className="ic-opts">{c.options.map((o, k) => <button key={o} className={`ic-opt ${pick != null ? (k === c.answer ? 's2' : k === pick ? 's0 picked' : '') : ''}`} disabled={pick != null} onClick={() => setPick(k)}><span>{o}</span></button>)}</div>
      {pick != null && (
        <div className={`ic-result ${pick === c.answer ? 'good' : 'again'}`}>
          <b>{pick === c.answer ? <><CheckCircle2 size={16} /> Correct.</> : <><XCircle size={16} /> Wrong. Read the conversation below.</>}</b>
          <div className="ic-dialog">{c.dialog.map(([who, t], k) => <p key={k}><b>{who}:</b> {t}</p>)}</div>
          <button className="btn" onClick={next}>Next <ArrowRight size={14} /></button>
        </div>
      )}
    </div>
  );
}

function Completion({ items }) {
  const [c, next, n, total] = useDeck(items);
  const [ans, setAns] = useState('');
  const [res, setRes] = useState(null);
  useEffect(() => { setAns(''); setRes(null); }, [c]);
  if (!c) return null;
  const [a, b] = c.s.split('___');
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      <p className="muted small">Type ONE word that completes the sentence.</p>
      <p className="ic-src big">{a}<input className="input ic-blank" value={ans} onChange={(e) => setAns(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ans.trim() && setRes(c.accept.map(norm).includes(norm(ans)))} disabled={res != null} />{b}</p>
      <div className="row-btns">
        <button className="btn primary" disabled={!ans.trim() || res != null} onClick={() => setRes(c.accept.map(norm).includes(norm(ans)))}>Check</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {res != null && <div className={`ic-result ${res ? 'good' : 'again'}`}><b>{res ? <><CheckCircle2 size={16} /> Correct.</> : <><XCircle size={16} /> Not accepted.</>}</b><div>Good answers: <b>{c.accept.join(', ')}</b></div></div>}
    </div>
  );
}

function Dictation({ items }) {
  const [s, next, n, total] = useDeck(items);
  const [ans, setAns] = useState('');
  const [res, setRes] = useState(null);
  useEffect(() => { setAns(''); setRes(null); }, [s]);
  if (!s) return null;
  const target = norm(s).split(' ');
  const got = new Set(norm(ans).split(' '));
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      <div className="row-btns"><button className="btn primary" onClick={() => speak(s, 0.9)}><Play size={15} /> Play sentence</button><span className="muted small">Listen, then type exactly what you hear (spelling counts).</span></div>
      <textarea className="input" rows={2} value={ans} onChange={(e) => setAns(e.target.value)} disabled={res != null} />
      <div className="row-btns">
        <button className="btn primary" disabled={!ans.trim() || res != null} onClick={() => setRes(target.filter((w) => got.has(w)).length / target.length)}>Check</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {res != null && (
        <>
          <Verdict score={res} good={0.95} ok={0.7} />
          <p className="ic-diff">{s.split(/\s+/).map((w, k) => <span key={k} className={got.has(norm(w)) ? 'ok' : 'miss'}>{w} </span>)}</p>
        </>
      )}
    </div>
  );
}

function PassageRecon({ items }) {
  const [p, next, n, total] = useDeck(items);
  const [phase, setPhase] = useState('read');
  const [left, setLeft] = useState(30);
  const [ans, setAns] = useState('');
  useEffect(() => { setPhase('read'); setLeft(30); setAns(''); }, [p]);
  useEffect(() => {
    if (phase !== 'read') return undefined;
    const id = setInterval(() => setLeft((s) => { if (s <= 1) { setPhase('write'); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [phase, p]);
  if (!p) return null;
  const sim = similarity(ans, [p.text]);
  const kp = (p.keyPoints || []).map((k) => ({ k, hit: similarity(ans, [k]) >= 0.5 }));
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span>{phase === 'read' && <span className="ic-clock"><Timer size={14} /> {left}s</span>}</div>
      {phase === 'read' ? (
        <>
          <p className="muted small">Read the passage. It disappears after 30 seconds, then rewrite it in your own words.</p>
          <p className="ic-passage">{p.text}</p>
          <button className="btn small" onClick={() => setPhase('write')}>I am ready</button>
        </>
      ) : (
        <>
          <p className="muted small">Rewrite the passage from memory. Keep the meaning: who, what happened and the result.</p>
          <textarea className="input" rows={4} value={ans} onChange={(e) => setAns(e.target.value)} disabled={phase === 'done'} />
          <div className="row-btns">
            <button className="btn primary" disabled={!ans.trim() || phase === 'done'} onClick={() => setPhase('done')}>Check</button>
            <button className="btn" onClick={next}><Shuffle size={14} /> Next passage</button>
          </div>
        </>
      )}
      {phase === 'done' && (
        <>
          <Verdict score={sim} good={0.6} ok={0.4} />
          {kp.length > 0 && <ul className="small ic-kp">{kp.map(({ k, hit }) => <li key={k} className={hit ? 'ok' : 'miss'}>{hit ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {k}</li>)}</ul>}
          <p className="ic-passage muted">{p.text}</p>
        </>
      )}
    </div>
  );
}

function TypingTest({ items }) {
  const [t, next] = useDeck(items);
  const [txt, setTxt] = useState('');
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(null);
  useEffect(() => { setTxt(''); setStart(null); setDone(null); }, [t]);
  if (!t) return null;
  const finish = () => {
    const mins = Math.max(1 / 60, (Date.now() - (start || Date.now())) / 60000);
    const tw = t.split(/\s+/); const aw = txt.trim().split(/\s+/);
    const correct = aw.filter((w, k) => w === tw[k]).length;
    setDone({ wpm: Math.round(aw.length / mins), acc: Math.round((correct / Math.max(1, aw.length)) * 100), secs: Math.round(mins * 60) });
  };
  return (
    <div className="card ic-practice">
      <p className="muted small">Type the paragraph exactly (capitals and punctuation count). The timer starts with your first key. Target: 35+ words per minute with 90%+ accuracy.</p>
      <p className="ic-passage ic-typing-src">{t}</p>
      <textarea className="input" rows={5} value={txt} disabled={!!done} onChange={(e) => { if (!start) setStart(Date.now()); setTxt(e.target.value); }} spellCheck={false} />
      <div className="row-btns">
        <button className="btn primary" disabled={!txt.trim() || !!done} onClick={finish}><Keyboard size={15} /> Finish</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> New paragraph</button>
      </div>
      {done && (
        <div className="ic-report">
          <div className="ic-report-stats">
            <div><b className={done.wpm < 35 ? 'warn' : ''}>{done.wpm}</b><span>Words / min</span></div>
            <div><b className={done.acc < 90 ? 'warn' : ''}>{done.acc}%</b><span>Accuracy</span></div>
            <div><b>{done.secs}s</b><span>Time</span></div>
          </div>
          <p className="small">{done.acc < 90 ? 'Slow down a little: accuracy matters more than speed.' : done.wpm < 35 ? 'Good accuracy. Practise daily to build speed.' : 'Great speed and accuracy.'}</p>
        </div>
      )}
    </div>
  );
}

function EmailWriting({ items }) {
  const [e, next, n, total] = useDeck(items);
  const [txt, setTxt] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => { setTxt(''); setShow(false); }, [e]);
  if (!e) return null;
  const wc = (txt.trim().match(/\S+/g) || []).length;
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="muted small">{n} / {total}</span></div>
      <p><b>Situation:</b> {e.situation}</p>
      <p className="small"><b>Your email must:</b></p>
      <ul className="small">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <textarea className="input" rows={7} value={txt} placeholder={'Subject: ...\n\nDear ...,\n\n...\n\nRegards,\n...'} onChange={(ev) => setTxt(ev.target.value)} />
      <div className="row-btns">
        <span className={`small ${wc && (wc < 50 || wc > 140) ? 'ic-warn' : 'muted'}`}>{wc} words (aim for 70-110)</span>
        <button className="btn primary" disabled={!txt.trim()} onClick={() => setShow(true)}>Compare with a model email</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {show && (
        <div className="ic-model">
          <div className="ic-card-head"><b>Model email</b></div>
          <p className="ic-pre">{e.sample}</p>
          <p className="small muted">Check yourself: did you cover every point above, use a clear subject, a polite greeting and a closing?</p>
        </div>
      )}
    </div>
  );
}

/* ================================ 7. GD topics ================================ */
export function GDTopics() {
  const topics = G.GD_TOPICS || [];
  const [tab, setTab] = useState('bank');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [pr, setPr] = useState(null);
  const list = topics.filter((t) => (cat === 'all' || t.cat === cat) && (!q.trim() || t.t.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <div className="ic-page">
      <Head icon={Users} title="GD Topics 2026">Group discussion is a common elimination round. Learn {topics.length || 100}+ current topics with points for and against, a strong opening and a balanced conclusion, plus the phrases to enter, agree, disagree and conclude politely.</Head>
      <CoachNav />
      {!topics.length ? <Empty what="GD" /> : (
        <>
          <Tabs tabs={[['bank', 'Topic bank'], ['practice', 'Speak on a topic'], ['phrases', 'GD phrases & rules'], ['test', 'Test']]} cur={tab} set={setTab} />
          {tab === 'bank' && (
            <>
              <div className="ic-toolbar">
                <select className="input ic-sel" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories ({topics.length})</option>{(G.GD_CATEGORIES || []).map((c) => <option key={c}>{c}</option>)}</select>
                <label className="ic-search"><Search size={15} /><input className="input" placeholder="Search topics" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>
              {list.map((t) => (
                <div key={t.id} className="ic-q">
                  <button className="ic-q-head" onClick={() => setOpen(open === t.id ? null : t.id)}><span>{t.t}</span><span className="badge">{t.cat}</span></button>
                  {open === t.id && <GDTopicBody t={t} />}
                </div>
              ))}
            </>
          )}
          {tab === 'practice' && (
            <div className="card ic-jam">
              <button className="btn primary" onClick={() => setPr(topics[Math.floor(Math.random() * topics.length)])}><Shuffle size={15} /> {pr ? 'Another topic' : 'Give me a GD topic'}</button>
              {pr && (
                <>
                  <span className="badge">{pr.cat}</span>
                  <h2 className="ic-jam-topic">{pr.t}</h2>
                  <p className="muted">Speak for 2 minutes: an opening, two points (one for, one against), an example and a conclusion.</p>
                  <SpeakingDrill key={pr.id} target={120} label="Start 2-minute practice" />
                  <details className="ic-hints"><summary>Show the points</summary><GDTopicBody t={pr} /></details>
                </>
              )}
            </div>
          )}
          {tab === 'phrases' && (
            <div className="ic-two">
              {Object.entries(G.GD_PHRASES || {}).map(([k, arr]) => (
                <div key={k} className="card"><h3>{{ initiate: 'To start the GD', agree: 'To agree', disagree: 'To disagree politely', add: 'To add a point', interrupt: 'To enter the discussion', bringBack: 'To bring the group back on topic', conclude: 'To conclude' }[k] || k}</h3><ul className="small">{arr.map((x) => <li key={x}>{x} <button className="link-btn" onClick={() => speak(x)}><Play size={11} /></button></li>)}</ul></div>
              ))}
              {G.GD_TIPS && <div className="card"><h3>Do</h3><ul className="small">{G.GD_TIPS.do.map((x) => <li key={x}>{x}</li>)}</ul></div>}
              {G.GD_TIPS && <div className="card"><h3>Don't</h3><ul className="small">{G.GD_TIPS.dont.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            </div>
          )}
          {tab === 'test' && <CoachTests ids={['gd-1']} />}
        </>
      )}
    </div>
  );
}

function GDTopicBody({ t }) {
  return (
    <div className="ic-q-body">
      <div className="ic-model"><div className="ic-card-head"><b>Opening line</b><SpeakBtn text={t.start} /></div><p>{t.start}</p></div>
      <div className="ic-two">
        <div><b className="ic-for">For</b><ul className="small">{t.for.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><b className="ic-against">Against</b><ul className="small">{t.against.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      {t.examples?.length > 0 && <p className="small"><b>Examples you can quote:</b> {t.examples.join(' ')}</p>}
      <div className="ic-model"><div className="ic-card-head"><b>Conclusion</b><SpeakBtn text={t.conclude} /></div><p>{t.conclude}</p></div>
    </div>
  );
}

/* ================================ 8. English mistakes ================================ */
export function EnglishMistakes() {
  const all = E.MISTAKES || [];
  const [tab, setTab] = useState('learn');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [learned, setLearned] = useStudy('upskillr-coach-english', {});
  const list = all.filter((m) => (cat === 'all' || m.cat === cat) && (!q.trim() || `${m.wrong} ${m.right}`.toLowerCase().includes(q.trim().toLowerCase())));
  const n = Object.values(learned).filter(Boolean).length;
  return (
    <div className="ic-page">
      <Head icon={SpellCheck} title="Common English Mistakes">The mistakes interviewers notice first, like "Myself Rahul", "I am having 2 years experience" and "Please do the needful". Learn the correct English, then test yourself.</Head>
      <CoachNav />
      {!all.length ? <Empty what="English mistakes" /> : (
        <>
          <div className="ic-stats"><div className="card"><b>{all.length}</b><span>Common mistakes</span></div><div className="card"><b>{(E.MISTAKE_CATEGORIES || []).length}</b><span>Categories</span></div><div className="card"><b>{n}</b><span>Learned</span></div></div>
          <Tabs tabs={[['learn', 'Learn'], ['quiz', 'Quick quiz'], ['test', 'Tests']]} cur={tab} set={setTab} />
          {tab === 'learn' && (
            <>
              <div className="ic-toolbar">
                <select className="input ic-sel" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{(E.MISTAKE_CATEGORIES || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <label className="ic-search"><Search size={15} /><input className="input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>
              <div className="ic-phrases">
                {list.map((m) => (
                  <div key={m.id} className={`card ic-phrase ${learned[m.id] ? 'done' : ''}`}>
                    <div className="ic-wrong"><XCircle size={14} /> <s>{m.wrong}</s></div>
                    <div className="ic-en"><CheckCircle2 size={16} className="ico t-ok" /> <b>{m.right}</b></div>
                    <div className="ic-tip"><Lightbulb size={14} /> {m.why}</div>
                    <div className="row-btns"><SpeakBtn text={m.right} /><button className={`btn small ${learned[m.id] ? 'ok' : ''}`} onClick={() => setLearned((x) => ({ ...x, [m.id]: !x[m.id] }))}><Star size={14} /> {learned[m.id] ? 'Learned' : 'Mark learned'}</button></div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'quiz' && <MistakeQuiz all={all} />}
          {tab === 'test' && <CoachTests ids={['english-1', 'english-2', 'english-3']} />}
        </>
      )}
    </div>
  );
}

function MistakeQuiz({ all }) {
  const [round, setRound] = useState(0);
  const qs = useMemo(() => shuffle(all).slice(0, 10).map((m) => ({ m, opts: shuffle([{ t: m.right, ok: true }, { t: m.wrong, ok: false }]) })), [all, round]);
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length === qs.length;
  const score = qs.filter((x, k) => ans[k] != null && x.opts[ans[k]].ok).length;
  return (
    <div className="ic-quiz">
      <p className="muted">Pick the correct sentence. 10 questions.</p>
      {qs.map((x, k) => (
        <div key={x.m.id} className="card ic-practice">
          <b>{k + 1}. Which is correct?</b>
          <div className="ic-opts">{x.opts.map((o, j) => <button key={j} className={`ic-opt ${ans[k] != null ? (o.ok ? 's2' : j === ans[k] ? 's0 picked' : '') : ''}`} disabled={ans[k] != null} onClick={() => setAns((a) => ({ ...a, [k]: j }))}><span>{o.t}</span></button>)}</div>
          {ans[k] != null && <div className="ic-tip"><Lightbulb size={14} /> {x.m.why}</div>}
        </div>
      ))}
      {done && <div className="card ic-result good"><b>Score: {score} / {qs.length}</b><button className="btn primary" onClick={() => { setAns({}); setRound((r) => r + 1); }}><RotateCcw size={14} /> New quiz</button></div>}
    </div>
  );
}

/* ================================ 9. Interview day kit ================================ */
export function InterviewDayKit() {
  const [tab, setTab] = useState('ask');
  const qs = D.QUESTIONS_TO_ASK || [];
  return (
    <div className="ic-page">
      <Head icon={CalendarCheck} title="Interview Day Kit">Everything for the day itself: smart questions to ask the interviewer, checklists for documents, dress and online interviews, and ready email templates for after the interview.</Head>
      <CoachNav />
      {!qs.length ? <Empty what="interview day" /> : (
        <>
          <Tabs tabs={[['ask', 'Questions to ask'], ['check', 'Checklists'], ['email', 'Email writer'], ['test', 'Test']]} cur={tab} set={setTab} />
          {tab === 'ask' && <AskQuestions />}
          {tab === 'check' && <Checklists />}
          {tab === 'email' && <EmailWriter />}
          {tab === 'test' && <CoachTests ids={['interview-day-1']} />}
        </>
      )}
    </div>
  );
}

function AskQuestions() {
  const [round, setRound] = useState('all');
  const qs = (D.QUESTIONS_TO_ASK || []).filter((x) => round === 'all' || x.round === round || x.round === 'Any');
  return (
    <>
      <p className="muted">At the end, "Do you have any questions for us?" is a chance to show interest. Ask 1-2 of these. Never say "No questions".</p>
      <div className="ic-nav">{['all', 'HR', 'Technical', 'Managerial'].map((r) => <button key={r} className={`chip ${round === r ? 'active' : ''}`} onClick={() => setRound(r)}>{r === 'all' ? 'All rounds' : `${r} round`}</button>)}</div>
      {qs.map((x) => <div key={x.q} className="card ic-askq"><div className="ic-card-head"><b>{x.q}</b><SpeakBtn text={x.q} /></div><p className="small muted">{x.round !== 'Any' ? `${x.round} round. ` : ''}{x.why}</p></div>)}
      {(D.AVOID_ASKING || []).length > 0 && (
        <div className="card">
          <h3>Avoid asking these (or ask them later)</h3>
          {D.AVOID_ASKING.map((x) => <div key={x.q} className="ic-avoid"><div className="ic-wrong"><XCircle size={14} /> {x.q}</div><p className="small">{x.why}{x.instead && <> <b>Instead:</b> {x.instead}</>}</p></div>)}
        </div>
      )}
    </>
  );
}

function Checklists() {
  const [st, setSt] = useStudy('upskillr-coach-checklists', {});
  return (
    <div className="ic-two">
      {(D.CHECKLISTS || []).map((c) => {
        const done = c.items.filter((_, k) => st[`${c.id}-${k}`]).length;
        return (
          <div key={c.id} className="card ic-check">
            <div className="ic-card-head"><h3><ClipboardList size={17} className="ico" /> {c.name}</h3><span className={`badge ${done === c.items.length ? 'ok' : ''}`}>{done}/{c.items.length}</span></div>
            {c.items.map((it, k) => <label key={it} className="check"><input type="checkbox" checked={!!st[`${c.id}-${k}`]} onChange={(e) => setSt((x) => ({ ...x, [`${c.id}-${k}`]: e.target.checked }))} /> {it}</label>)}
            {done > 0 && <button className="link-btn small" onClick={() => setSt((x) => { const y = { ...x }; c.items.forEach((_, k) => delete y[`${c.id}-${k}`]); return y; })}>Reset</button>}
          </div>
        );
      })}
    </div>
  );
}

function EmailWriter() {
  const tpls = D.EMAIL_TEMPLATES || [];
  const [id, setId] = useState(tpls[0]?.id);
  const [vals, setVals] = useStudy('upskillr-coach-emails', {});
  const t = tpls.find((x) => x.id === id) || tpls[0];
  if (!t) return null;
  const v = { me: '', ...(vals[t.id] || {}) };
  const fillIn = (s) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] || `[${(t.fields.find((f) => f.key === k)?.label) || (k === 'me' ? 'Your name' : k)}]`);
  const subject = fillIn(t.subject); const body = fillIn(t.body);
  const set = (k, x) => setVals((all) => ({ ...all, [t.id]: { ...(all[t.id] || {}), [k]: x } }));
  return (
    <div className="ic-email">
      <div className="ic-toolbar"><select className="input ic-sel" value={t.id} onChange={(e) => setId(e.target.value)}>{tpls.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><span className="muted small">When: {t.when}</span></div>
      <div className="ic-two">
        <div className="card ic-form">
          {t.fields.map((f) => <label key={f.key} className="field">{f.label}<input className="input" value={v[f.key] || ''} placeholder={f.ph} onChange={(e) => set(f.key, e.target.value)} /></label>)}
          <label className="field">Your name<input className="input" value={v.me || ''} placeholder="Your full name" onChange={(e) => set('me', e.target.value)} /></label>
        </div>
        <div className="card ic-mailprev">
          <div className="ic-card-head"><b><Mail size={15} className="ico" /> Preview</b><button className="btn small" onClick={() => downloadFile(`${t.id}-email.txt`, `Subject: ${subject}\n\n${body}\n`, 'text/plain')}><Download size={14} /> Download</button></div>
          <p className="small"><b>Subject:</b> {subject}</p>
          <p className="ic-pre">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================ 10. First job skills ================================ */
export function FirstJobSkills() {
  const mods = J.FIRST_JOB_MODULES || [];
  const [cur, setCur] = useState(mods[0]?.id);
  const [tab, setTab] = useState('learn');
  const m = mods.find((x) => x.id === cur) || mods[0];
  return (
    <div className="ic-page">
      <Head icon={BriefcaseBusiness} title="First Job Skills">What nobody teaches in college: how to speak in a stand-up, write on Teams or Slack, raise a Jira ticket, update your manager and ask for help. These skills decide how fast you get trusted in your first job.</Head>
      <CoachNav />
      {!mods.length ? <Empty what="first job" /> : (
        <>
          <Tabs tabs={[['learn', 'Learn'], ['standup', 'Stand-up builder'], ['bug', 'Bug ticket builder'], ['test', 'Tests']]} cur={tab} set={setTab} />
          {tab === 'learn' && (
            <>
              <div className="ic-nav">{mods.map((x) => <button key={x.id} className={`chip ${cur === x.id ? 'active' : ''}`} onClick={() => setCur(x.id)}>{x.name}</button>)}</div>
              {m && <FirstJobModule key={m.id} m={m} />}
            </>
          )}
          {tab === 'standup' && <StandupBuilder />}
          {tab === 'bug' && <BugBuilder />}
          {tab === 'test' && <CoachTests ids={['first-job-1', 'first-job-2']} />}
        </>
      )}
    </div>
  );
}

function FirstJobModule({ m }) {
  return (
    <div className="ic-fj">
      <div className="card">
        <h2>{m.name}</h2>
        <p>{m.intro}</p>
        <ul>{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
        {m.template && <div className="ic-model"><b>Template</b><p className="ic-pre">{m.template}</p></div>}
      </div>
      {(m.good?.length > 0 || m.bad?.length > 0) && (
        <div className="ic-two">
          {m.good?.length > 0 && <div className="card"><h3 className="ic-for"><CheckCircle2 size={16} /> Good</h3>{m.good.map((x) => <p key={x} className="ic-pre small">{x}</p>)}</div>}
          {m.bad?.length > 0 && <div className="card"><h3 className="ic-against"><XCircle size={16} /> Poor</h3>{m.bad.map((x) => <p key={x} className="ic-pre small">{x}</p>)}</div>}
        </div>
      )}
      {m.exercises?.length > 0 && <div className="card"><h3><MessageSquare size={17} className="ico" /> Rewrite it better</h3>{m.exercises.map((x, k) => <RewriteExercise key={k} x={x} n={k + 1} />)}</div>}
    </div>
  );
}

function RewriteExercise({ x, n }) {
  const [txt, setTxt] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="ic-rewrite">
      <p className="small"><b>{n}.</b> Improve this:</p>
      <div className="ic-wrong ic-pre">{x.bad}</div>
      <textarea className="input" rows={3} value={txt} placeholder="Write a better version…" onChange={(e) => setTxt(e.target.value)} />
      <button className="btn small" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'} a better version</button>
      {show && <div className="ic-model"><p className="ic-pre">{x.better}</p><p className="small muted">{x.why}</p></div>}
    </div>
  );
}

function StandupBuilder() {
  const [v, setV] = useStudy('upskillr-coach-standup', { y: '', t: '', b: '' });
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const all = `${v.y} ${v.t} ${v.b}`;
  const checks = [
    [/\b([A-Z]{2,}-\d+|#\d+|ticket|story|bug|task|pr|pull request)\b/i.test(all), 'Mention the ticket / task you worked on (e.g. "LMS-142")'],
    [v.y.trim().split(/\s+/).length >= 5, '"Yesterday" says what you actually finished'],
    [v.t.trim().split(/\s+/).length >= 5, '"Today" has a clear plan'],
    [v.b.trim().length > 0, 'Blockers stated clearly (write "No blockers" if none)'],
    [(all.match(/\S+/g) || []).length <= 80, 'Short: the whole update fits in about 30-45 seconds'],
    [!/\b(doing|working on)\s+(it|things|stuff)\b/i.test(all), 'Specific, not vague ("working on stuff")'],
  ];
  const text = `Yesterday: ${v.y || '...'}\nToday: ${v.t || '...'}\nBlockers: ${v.b || '...'}`;
  return (
    <div className="ic-two">
      <div className="card ic-form">
        <label className="field">Yesterday I completed<textarea className="input" rows={2} value={v.y} placeholder="Finished the login API for LMS-142 and raised a PR" onChange={set('y')} /></label>
        <label className="field">Today I will<textarea className="input" rows={2} value={v.t} placeholder="Fix the review comments and start the forgot-password screen (LMS-150)" onChange={set('t')} /></label>
        <label className="field">Blockers<input className="input" value={v.b} placeholder="Waiting for SMTP credentials from DevOps" onChange={set('b')} /></label>
      </div>
      <div className="card">
        <div className="ic-card-head"><b>Your stand-up</b><SpeakBtn text={text.replace(/\n/g, '. ')} /></div>
        <p className="ic-pre">{text}</p>
        <ul className="ic-kp small">{checks.map(([ok, msg]) => <li key={msg} className={ok ? 'ok' : 'miss'}>{ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {msg}</li>)}</ul>
      </div>
    </div>
  );
}

function BugBuilder() {
  const [v, setV] = useStudy('upskillr-coach-bug', { title: '', steps: '', expected: '', actual: '', env: '', sev: 'Medium' });
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const steps = String(v.steps || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const checks = [
    [v.title.trim().split(/\s+/).length >= 5 && !/^(bug|issue|error|not working)$/i.test(v.title.trim()), 'Title says WHAT fails and WHERE (5+ words)'],
    [steps.length >= 2, 'At least 2 numbered steps to reproduce'],
    [v.expected.trim().length > 5, 'Expected result is written'],
    [v.actual.trim().length > 5, 'Actual result is written (with the error message if any)'],
    [v.env.trim().length > 3, 'Environment: browser / device / build / test or prod'],
    [v.expected.trim() && v.actual.trim() && norm(v.expected) !== norm(v.actual), 'Expected and actual are different'],
  ];
  const ticket = `Title: ${v.title || '...'}\nSeverity: ${v.sev}\nEnvironment: ${v.env || '...'}\n\nSteps to reproduce:\n${steps.map((s, k) => `${k + 1}. ${s.replace(/^\d+[.)]\s*/, '')}`).join('\n') || '1. ...'}\n\nExpected result: ${v.expected || '...'}\nActual result: ${v.actual || '...'}`;
  const ok = checks.filter((c) => c[0]).length;
  return (
    <div className="ic-two">
      <div className="card ic-form">
        <label className="field">Title<input className="input" value={v.title} placeholder="Login fails with 500 error when email has uppercase letters" onChange={set('title')} /></label>
        <label className="field">Steps to reproduce (one per line)<textarea className="input" rows={4} value={v.steps} placeholder={'Open the login page\nEnter Asha@Test.com and a valid password\nClick Login'} onChange={set('steps')} /></label>
        <label className="field">Expected result<input className="input" value={v.expected} placeholder="User is logged in and sees the dashboard" onChange={set('expected')} /></label>
        <label className="field">Actual result<input className="input" value={v.actual} placeholder="Error page: 500 Internal Server Error" onChange={set('actual')} /></label>
        <div className="ic-two">
          <label className="field">Environment<input className="input" value={v.env} placeholder="Chrome 130, QA build 2.4.1" onChange={set('env')} /></label>
          <label className="field">Severity<select className="input" value={v.sev} onChange={set('sev')}>{['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
      </div>
      <div className="card">
        <div className="ic-card-head"><b><Bug size={15} className="ico" /> Ticket preview</b><span className={`badge ${ok === checks.length ? 'ok' : ''}`}>{ok}/{checks.length} checks</span></div>
        <p className="ic-pre">{ticket}</p>
        <ul className="ic-kp small">{checks.map(([c, msg]) => <li key={msg} className={c ? 'ok' : 'miss'}>{c ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {msg}</li>)}</ul>
        <button className="btn small" onClick={() => downloadFile('bug-ticket.txt', ticket, 'text/plain')}><Download size={14} /> Download</button>
      </div>
    </div>
  );
}

