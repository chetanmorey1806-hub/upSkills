import { Check, X, Minus } from 'lucide-react';
import '../styles/landing-extra.css';

// [feature, typical video course: true | false | 'partial', typical note, UpSkillr note]
// Only list features the app really has.
const ROWS = [
  ['Day-wise lessons', 'partial', 'Long videos, you decide the pace', 'One topic a day with theory, examples and practice'],
  ['Built-in IDEs and labs', false, 'Install the tools yourself', 'Java, Python, C#, web, SQL, Excel, DAX and Power Query in the browser'],
  ['Interview Q&A per topic', false, 'Rarely included', 'Interview questions with answers in every lesson'],
  ['Test series', 'partial', 'A few quizzes at most', 'Timed grand, course-wise and module-wise tests with score history'],
  ['Final projects', 'partial', 'Follow-along demo project', 'Guided projects with milestones, viva Q&A and a report'],
  ['Soft skills training', false, 'Not part of the course', 'Self-intro, HR answers, group discussion and email practice'],
  ['Video lessons in Marathi, Hindi and English', 'partial', 'Usually one language', 'Choose English, Hindi or Marathi'],
  ['Progress dashboard', 'partial', 'Basic watched / not watched', 'Lessons, quiz scores, tests, streak and readiness'],
];

function Mark({ v }) {
  if (v === true) return <span className="lx-mark yes"><Check size={16} strokeWidth={3} aria-hidden="true" /><span className="lx-sr">Yes</span></span>;
  if (v === 'partial') return <span className="lx-mark part"><Minus size={16} strokeWidth={3} aria-hidden="true" /><span className="lx-sr">Partly</span></span>;
  return <span className="lx-mark no"><X size={16} strokeWidth={3} aria-hidden="true" /><span className="lx-sr">No</span></span>;
}

export default function WhyUpSkillr() {
  return (
    <section id="why" className="ld-section lx-why">
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow">Why UpSkillr</span>
          <h2>More than a video course</h2>
          <p>How learning on UpSkillr compares with a typical recorded video course.</p>
        </div>
        <div className="lx-cmp ld-rv" style={{ '--d': '80ms' }} role="table" aria-label="Typical video course compared with UpSkillr">
          <div className="lx-cmp-row lx-cmp-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">Typical video course</span>
            <span role="columnheader" className="lx-cmp-us">UpSkillr</span>
          </div>
          {ROWS.map(([feat, other, otherNote, usNote]) => (
            <div key={feat} className="lx-cmp-row" role="row">
              <b role="rowheader">{feat}</b>
              <span role="cell" className="lx-cmp-other" data-label="Typical video course"><Mark v={other} /><small>{otherNote}</small></span>
              <span role="cell" className="lx-cmp-us" data-label="UpSkillr"><Mark v /><small>{usNote}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
