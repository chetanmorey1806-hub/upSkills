import { Link, useSearchParams } from 'react-router-dom';
import { allTopics, tracks } from '../data/index.js';
import { Inline } from '../components/RichText.jsx';
import { searchAll } from '../searchIndex.js';

function snippet(text, q) {
  const s = String(text);
  const i = s.toLowerCase().indexOf(q);
  if (i < 0) return s.slice(0, 140);
  return (i > 40 ? '…' : '') + s.slice(Math.max(0, i - 40), i + 120) + '…';
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const raw = params.get('q') || '';
  const q = raw.toLowerCase();
  const results = [];
  if (q) {
    allTopics.forEach((t) => {
      const base = `/track/${t.track}/${t.id}`;
      if ((t.title + ' ' + t.summary).toLowerCase().includes(q))
        results.push({ to: base, where: 'Topic', title: t.title, text: t.summary, t });
      t.theory?.forEach((s) => {
        const txt = `${s.heading} ${s.content} ${(s.points || []).join(' ')} ${s.syntax || ''}`;
        if (txt.toLowerCase().includes(q)) results.push({ to: base + '?tab=theory', where: 'Theory', title: s.heading, text: snippet(txt, q), t });
      });
      t.examples?.forEach((e) => {
        const txt = `${e.title} ${e.scenario || ''} ${e.code || ''} ${(e.steps || []).join(' ')} ${e.explanation || ''}`;
        if (txt.toLowerCase().includes(q)) results.push({ to: base + '?tab=examples', where: 'Example', title: e.title, text: snippet(txt, q), t });
      });
      t.interview?.forEach((e) => {
        const txt = `${e.q} ${e.a}`;
        if (txt.toLowerCase().includes(q)) results.push({ to: base + '?tab=interview', where: 'Interview', title: e.q, text: snippet(e.a, q), t });
      });
    });
  }
  const quick = q ? searchAll(q, 30).filter((r) => r.type !== 'Lesson') : [];
  return (
    <div>
      <div className="page-head">
        <h1>🔎 Search: “{raw}”</h1>
        <p className="muted">{quick.length + results.length} results · tip: press Ctrl K anywhere for instant search</p>
      </div>
      {quick.length > 0 && (
        <section>
          <h2 className="section-title">Pages, tools, aptitude, errors &amp; projects</h2>
          <div className="sr-quick">{quick.map((r, i) => (
            <Link key={i} to={r.to} className="card sr-q"><span className="cp-ic">{r.icon}</span><span className="cp-txt"><b>{r.title}</b><span>{r.sub}</span></span><span className="cp-type">{r.type}</span></Link>
          ))}</div>
          {results.length > 0 && <h2 className="section-title">Inside lessons</h2>}
        </section>
      )}
      {results.slice(0, 200).map((r, i) => (
        <Link key={i} to={r.to} className="card search-hit">
          <div className="muted small">{tracks[r.t.track].icon} {r.t.title} · {r.where}</div>
          <h4><Inline text={r.title} /></h4>
          <p className="muted"><Inline text={r.text} /></p>
        </Link>
      ))}
    </div>
  );
}
