import { useMemo, useState } from 'react';
import { allTopics, trackOrder, tracks, topicKey } from '../data/index.js';
import { useProgress } from '../progress.js';
import RichText, { Inline } from '../components/RichText.jsx';

import Ico from '../components/Ico.jsx';
export default function Flashcards() {
  const p = useProgress();
  const [track, setTrack] = useState('both');
  const [level, setLevel] = useState('All');
  const [onlyStar, setOnlyStar] = useState(false);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  const cards = useMemo(() => {
    let c = allTopics
      .filter((t) => track === 'both' || t.track === track)
      .flatMap((t) => (t.interview || []).map((qa, j) => ({ ...qa, qid: `${topicKey(t.track, t.id)}#${j}`, src: `${tracks[t.track].short} · ${t.title}` })))
      .filter((c2) => level === 'All' || c2.level === level)
      .filter((c2) => !onlyStar || p.bookmarks[c2.qid]);
    if (shuffled) c = [...c].sort(() => Math.random() - 0.5);
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, level, onlyStar, shuffled, onlyStar && p.bookmarks]);

  const card = cards[Math.min(i, cards.length - 1)];
  const go = (d) => { setFlip(false); setI((x) => Math.max(0, Math.min(cards.length - 1, x + d))); };
  const reset = (fn) => (e) => { fn(e); setI(0); setFlip(false); };

  return (
    <div>
      <div className="page-head">
        <h1> Interview flashcards</h1>
        <p className="muted">Read the question, answer it out loud as you would in an interview, then flip the card to compare. Star the questions you find hard.</p>
        <div className="quiz-settings">
          <label>Track <select value={track} onChange={reset((e) => setTrack(e.target.value))}><option value="both">All courses</option>{trackOrder.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>
          <label>Level <select value={level} onChange={reset((e) => setLevel(e.target.value))}>{['All', 'Easy', 'Medium', 'Hard'].map((l) => <option key={l}>{l}</option>)}</select></label>
          <label className="check"><input type="checkbox" checked={onlyStar} onChange={reset((e) => setOnlyStar(e.target.checked))} /> Only starred</label>
          <label className="check"><input type="checkbox" checked={shuffled} onChange={reset((e) => setShuffled(e.target.checked))} /> Shuffle</label>
        </div>
      </div>
      {!card ? (
        <p className="muted">No cards match these filters.</p>
      ) : (
        <>
          <div className="fc-count muted">Card {Math.min(i, cards.length - 1) + 1} of {cards.length} · {card.src}</div>
          <div className={`flashcard ${flip ? 'flipped' : ''}`} onClick={() => setFlip(!flip)}>
            {!flip ? (
              <div className="fc-front">
                <div className="fc-label">Question {card.level && <span className={`lvl lvl-${card.level}`}>{card.level}</span>}</div>
                <h2><Inline text={card.q} /></h2>
                <div className="muted small">Click to reveal the answer</div>
              </div>
            ) : (
              <div className="fc-back">
                <div className="fc-label">Answer</div>
                <RichText text={card.a} />
              </div>
            )}
          </div>
          <div className="row-btns center">
            <button className="btn" onClick={() => go(-1)}>← Prev</button>
            <button className={`btn ${p.bookmarks[card.qid] ? 'star-on' : ''}`} onClick={() => p.toggleBookmark(card.qid)}>{p.bookmarks[card.qid] ? '★ Starred' : '☆ Star'}</button>
            <button className="btn primary" onClick={() => go(1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
