import { useState } from 'react';
import { Inline } from './RichText.jsx';
import { recordAnswers } from '../study.js';

// Deterministic option shuffle so the correct answer isn't always in the same position.
// Same question => same order every time. Questions whose order matters are left as-is.
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffleQuestion(q) {
  const text = `${q.options.join(' ')} ${q.explanation || ''}`;
  if (/\b(above|below)\b|both [a-d] and|option [a-d]\b|\([a-d]\)/i.test(text)) return q;
  let seed = hash(q.question);
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0; const j = seed % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, options: idx.map((i) => q.options[i]), answer: idx.indexOf(q.answer) };
}

// questions: [{question, options, answer, explanation, source?}]
// origin: { label, link, kind: 'quiz' | 'test' } – used by the Mistake Notebook / revision
export default function Quiz({ questions: rawQuestions, onFinish, title, origin }) {
  const questions = rawQuestions.map(shuffleQuestion);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === questions.length;

  const submit = () => {
    setSubmitted(true);
    try { recordAnswers(questions, answers, origin); } catch { /* never block the quiz */ }
    onFinish && onFinish(score, questions.length, questions.map((q, i) => answers[i] === q.answer));
  };
  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="quiz">
      {title && <h3>{title}</h3>}
      {questions.map((q, i) => (
        <div key={i} className="quiz-q card">
          <div className="quiz-num">Q{i + 1}{q.source && <span className="muted"> · {q.source}</span>}</div>
          <div className="quiz-text"><Inline text={q.question} /></div>
          {q.code && <pre className="quiz-code">{q.code}</pre>}
          <div className="quiz-opts">
            {q.options.map((o, j) => {
              let cls = 'opt';
              if (answers[i] === j) cls += ' picked';
              if (submitted && j === q.answer) cls += ' correct';
              if (submitted && answers[i] === j && j !== q.answer) cls += ' wrong';
              return (
                <button key={j} className={cls} disabled={submitted} onClick={() => setAnswers({ ...answers, [i]: j })}>
                  <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                  <Inline text={o} />
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <div className={`explain ${answers[i] === q.answer ? 'ok' : 'bad'}`}>
              {answers[i] === q.answer ? '✓ Correct. ' : '✗ Not quite. '}
              <Inline text={q.explanation} />
            </div>
          )}
        </div>
      ))}
      <div className="quiz-footer">
        {!submitted ? (
          <button className="btn primary" disabled={!allAnswered} onClick={submit}>
            {allAnswered ? 'Submit answers' : `Answer all (${Object.keys(answers).length}/${questions.length})`}
          </button>
        ) : (
          <>
            <div className="score">
              Score: <b>{score}/{questions.length}</b> ({Math.round((score / questions.length) * 100)}%)
              {score === questions.length ? ' 🎉 Perfect!' : score / questions.length >= 0.7 ? ' 👍 Good job' : ' 📖 Revise the theory and try again'}
            </div>
            <button className="btn" onClick={retry}>Retry</button>
          </>
        )}
      </div>
    </div>
  );
}
