import TrackCards from '../components/TrackCards.jsx';

import Ico from '../components/Ico.jsx';
export default function Courses() {
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="📚" /> All courses</h1>
        <p className="muted">Day-wise courses with theory, solved examples, interview Q&amp;A, practice and quizzes. Pick a course and start from Day 1.</p>
      </div>
      <TrackCards />
    </div>
  );
}
