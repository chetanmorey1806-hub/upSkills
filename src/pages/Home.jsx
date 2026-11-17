import { Link } from 'react-router-dom';
import TrackCards from '../components/TrackCards.jsx';

const steps = [
  ['1', 'Follow the roadmap', 'Study topics in order, one per day. Each builds on the previous one.'],
  ['2', 'Read theory + examples', 'Understand the concept, then walk through worked examples with sample data.'],
  ['3', 'Practice hands-on', 'Do the exercises in the built-in Code Playground, Formula Lab, DAX Lab and Power Query Lab, or in real tools.'],
  ['4', 'Test yourself', 'Take the topic quiz, then the mixed Quiz Arena for revision.'],
  ['5', 'Prepare interviews', 'Revise interview Q&A with flashcards; bookmark the tough ones.'],
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1>Master <span className="hl-excel">Excel</span>, <span className="hl-pbi">Power BI</span>, <span className="hl-web">Web Development</span>, <span className="hl-java">Java</span> &amp; <span className="hl-py">Python Full Stack</span> step by step</h1>
        <p>
          Complete preparation for students: theory with clear explanations, worked examples,
          interview questions with answers, hands-on practice and built-in practice tools.
        </p>
        <div className="hero-actions">
          <Link to="/roadmap" className="btn primary">Start the roadmap →</Link>
          <Link to="/courses" className="btn">Browse courses</Link>
          <Link to="/tools/playground" className="btn">💻 Open code editor</Link>
        </div>
      </section>

      <TrackCards />

      <section>
        <h2 className="section-title">How to prepare</h2>
        <div className="steps">
          {steps.map(([n, h, p]) => (
            <div key={n} className="card step">
              <div className="step-n">{n}</div>
              <h4>{h}</h4>
              <p className="muted">{p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
