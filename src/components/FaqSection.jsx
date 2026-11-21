import { useId, useRef, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import '../styles/landing-extra.css';

const scrollTo = (id, fallback) => (e) => {
  e.preventDefault();
  (document.getElementById(id) || (fallback && document.getElementById(fallback)))?.scrollIntoView({ behavior: 'smooth' });
};

// Honest answers about what the app really does. Keep them in sync with the features.
const FAQS = [
  ['What is NGU?',
    <>NGU is a learning platform with day-wise courses in Data Analytics (Excel, Power BI), Java, Python, .NET, MERN and web development, databases, AI and soft skills. Each course is a step-by-step plan: you learn one topic a day, practise it in the browser and test yourself.</>],
  ['How is each lesson structured?',
    <>Every lesson has simple theory, solved examples, interview questions and answers, hands-on practice and a short quiz. Many lessons also have a Day Task that is checked automatically and a video lesson.</>],
  ['Do I need to install any software?',
    <>No. The built-in IDEs and labs run in your browser: Java, Python, C# and web IDEs, MySQL Workbench and SSMS style SQL labs, and Excel formula, DAX and Power Query labs. You only need an up-to-date browser and an internet connection.</>],
  ['Can I use it on my mobile phone?',
    <>Yes. The site works on mobile, tablet and desktop. For longer coding practice a laptop or desktop with a bigger screen is more comfortable, but lessons, quizzes and tests work fine on a phone.</>],
  ['Is my progress saved?',
    <>Yes. Each student has their own account. Completed lessons, quiz scores, test results and projects are saved to your account, so sign in with the same account to continue where you left off.</>],
  ['Will I get a certificate?',
    <>Yes, when you complete a course: finish every lesson of the course and pass its Grand Test in the Test Series with 60% or more. The certificate then unlocks and you can print it or save it as a PDF.</>],
  ['How does the interview preparation work?',
    <>There is a test series with timed grand, course-wise and module-wise tests, mock technical and HR interviews where you type or speak your answer, coding-round problems, final projects with viva questions, and a soft skills lab for self-introduction, group discussion and email writing.</>],
  ['Which languages are the video lessons in?',
    <>Video lessons can be played in English, Hindi and Marathi. The written lesson content is in simple English.</>],
  ['Do you guarantee a job or placement?',
    <>No. We do not promise a job. NGU helps you learn the skills and prepare for technical and HR interview rounds; how you perform in interviews is up to your practice and effort.</>],
  ['How much does it cost?',
    <>Creating an account is free. Course packages and their prices are listed in the Packages section. <a href="#packages" className="lx-inline-link" onClick={scrollTo('packages', 'contact')}>See packages <ArrowRight size={14} /></a></>],
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);
  const base = useId();
  const btns = useRef([]);

  const onKey = (i) => (e) => {
    const last = FAQS.length - 1;
    const to = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    btns.current[to]?.focus();
  };

  return (
    <section id="faq" className="ld-section ld-alt lx-faq">
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow">FAQ</span>
          <h2>Frequently asked questions</h2>
          <p>Straight answers about how NGU works.</p>
        </div>
        <div className="lx-acc ld-rv" style={{ '--d': '80ms' }}>
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            const hid = `${base}-h${i}`; const pid = `${base}-p${i}`;
            return (
              <div key={q} className={`lx-acc-item ${isOpen ? 'open' : ''}`}>
                <h3 className="lx-acc-h">
                  <button
                    ref={(el) => { btns.current[i] = el; }}
                    id={hid} type="button" aria-expanded={isOpen} aria-controls={pid}
                    onClick={() => setOpen(isOpen ? -1 : i)} onKeyDown={onKey(i)}
                  >
                    <span>{q}</span><ChevronDown size={20} className="lx-acc-chev" aria-hidden="true" />
                  </button>
                </h3>
                <div id={pid} role="region" aria-labelledby={hid} className="lx-acc-panel" aria-hidden={!isOpen}>
                  <div className="lx-acc-inner"><p>{a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
