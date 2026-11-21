import { Link } from 'react-router-dom';
import { projects } from '../data/projects.js';
import { readProject, projectProgress, projectScore } from '../projectStore.js';
import ProgressBar from '../components/ProgressBar.jsx';

import Ico from '../components/Ico.jsx';
export const CUSTOM_PROJECT = {
  id: 'custom',
  icon: '💡',
  level: 'Any level',
  hours: 'You decide',
  title: 'Your Own Project Idea',
  summary: 'Build anything you like (quiz game, hospital system, weather app logic, chatbot ...). Write your own milestones, code it in the browser and submit it for a self-review score.',
  skills: ['Planning', 'Problem solving', 'Everything you learned'],
  files: { 'main.py': '# My project\n# Describe your project here, then start coding.\n\ndef main():\n    print("Hello from my project!")\n\n\nif __name__ == "__main__":\n    main()\n' },
  tests: null,
  milestones: [],
  rubric: projects[0].rubric,
};

const steps = [
  ['📋', 'Read the brief', 'Understand the story, the requirements and the milestones.'],
  ['💻', 'Code in the browser', 'Starter files open in a real Python editor. Run your code with sample input.'],
  ['✅', 'Run the tests', 'Automated tests check every function and tell you exactly what is wrong.'],
  ['🏁', 'Submit & get scored', 'Score = tests + milestones + self-review. Download your code and certificate for your portfolio.'],
];

export default function Projects() {
  const all = [...projects, CUSTOM_PROJECT];
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🏁" /> Python Final Projects</h1>
        <p className="muted">Build a complete Python project inside NGU: real starter code, automated tests that run in your browser, milestones, hints and a final score you can show in interviews.</p>
      </div>

      <div className="steps proj-steps">
        {steps.map(([ic, h, p]) => (
          <div key={h} className="card step">
            <div className="track-icon"><Ico e={ic} /></div>
            <h4>{h}</h4>
            <p className="muted small">{p}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Choose your project</h2>
      <div className="grid3">
        {all.map((p) => {
          const st = readProject(p.id);
          const pr = projectProgress(p, st);
          const started = pr.tasksDone > 0 || pr.testsTotal > 0 || !!st.files;
          const pct = p.tests ? (pr.testsTotal ? pr.passed / pr.testsTotal : 0) : (pr.tasks ? pr.tasksDone / pr.tasks : 0);
          return (
            <Link key={p.id} to={`/tools/python-projects/${p.id}`} className="card track-card proj-card">
              <div className="proj-card-top">
                <span className="track-icon"><Ico e={p.icon} /></span>
                {pr.submitted ? <span className="badge ok">✓ Submitted · {projectScore(p, st)}/100</span>
                  : started ? <span className="badge">In progress</span> : null}
              </div>
              <h3>{p.title}</h3>
              <p className="muted small">{p.summary}</p>
              <div className="meta">
                <span className={`lvl lvl-${p.level}`}>{p.level}</span>
                <span><Ico e="⏱" /> {p.hours}</span>
                {p.tests && <span><Ico e="✅" /> automated tests</span>}
              </div>
              <div className="chips">{p.skills.slice(0, 4).map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <ProgressBar value={pct} />
              <div className="muted small">
                {p.tests ? (pr.testsTotal ? `${pr.passed}/${pr.testsTotal} tests passing` : 'Not started') : `${pr.tasksDone}/${pr.tasks} milestones done`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
