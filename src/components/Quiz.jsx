import { useState } from 'react';
import { Inline } from './RichText.jsx';

// questions: [{question, options, answer, explanation, source?}]
export default function Quiz({ questions, onFinish, title }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === questions.length;

  const submit = () => {
    setSubmitted(true);
    onFinish && onFinish(score, questions.length);
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
