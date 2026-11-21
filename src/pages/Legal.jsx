import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import siteInfo from '../data/siteInfo.js';
import '../styles/landing-extra.css';

const contactLine = () => {
  const bits = [siteInfo.email && `email ${siteInfo.email}`, siteInfo.phone && `call ${siteInfo.phone}`].filter(Boolean);
  return bits.length ? `, or ${bits.join(' or ')}` : '';
};

const PRIVACY = [
  ['What we collect', [
    'Account details you enter when you register: your name, username, email (optional) and a password. Passwords are never stored in plain text.',
    'Your learning activity: lessons completed, quiz and test scores, notes, projects and similar progress, so you can continue where you left off.',
    'Details you send us through the enquiry form (name, mobile number, optional email, course and message) and reviews you choose to submit.',
  ]],
  ['How we use it', [
    'To run your account and show your own progress, tests and certificates.',
    'To reply to your enquiry about courses.',
    'To show reviews on the website, only after the admin has approved them. Only your name, course, rating and review text are shown.',
    'We do not sell your personal information.',
  ]],
  ['Where it is stored', [
    'Depending on how this site is set up, your data is stored in your browser (local storage) and/or in our online database. Data stored only in your browser stays on that device.',
  ]],
  ['Your choices', [
    `You can ask us to correct or delete your account, enquiries or reviews. Use the contact form on the home page${contactLine()}.`,
  ]],
];

const TERMS = [
  ['Using UpSkillr', [
    'UpSkillr provides day-wise lessons, practice labs, tests and projects for learning. Use it for your own learning only.',
    'Keep your password private. You are responsible for activity on your account.',
  ]],
  ['Content', [
    'Course material, lessons, tests and code on this site belong to UpSkillr. Do not copy, resell or republish them without permission.',
    'Certificates are issued by the app when you complete a course and pass its grand test. They show your result on UpSkillr; they are not a university degree.',
  ]],
  ['No job guarantee', [
    'UpSkillr helps you learn and prepare for interviews. We do not guarantee a job, placement or salary.',
  ]],
  ['Reviews and enquiries', [
    'Reviews must be honest and about your own experience. The admin may decline or remove any review.',
  ]],
  ['Changes', [
    'We may update these terms and the courses from time to time. Continuing to use the site means you accept the current terms.',
  ]],
];

export default function Legal({ kind = 'privacy' }) {
  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? 'Privacy policy' : 'Terms of use';
  const body = isPrivacy ? PRIVACY : TERMS;
  useEffect(() => { document.title = `${title} – UpSkillr`; }, [title]);
  return (
    <div className="lx-legal">
      <header className="lx-legal-top">
        <div className="ld-wrap lx-legal-bar">
          <Link to="/" className="brand"><Logo size={28} /><span className="brand-name">Up<b>Skillr</b></span></Link>
          <Link to="/" className="btn small"><ArrowLeft size={15} /> Back to home</Link>
        </div>
      </header>
      <main className="ld-wrap lx-legal-main">
        <h1>{title}</h1>
        <p className="lx-note">This page explains, in plain language, {isPrivacy ? 'what information UpSkillr keeps and why' : 'the rules for using UpSkillr'}.</p>
        {body.map(([h, items]) => (
          <section key={h}>
            <h2>{h}</h2>
            <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        ))}
        <p className="lx-legal-links">
          {isPrivacy ? <Link to="/terms">Read the terms of use</Link> : <Link to="/privacy">Read the privacy policy</Link>}
        </p>
      </main>
      <footer className="lx-legal-foot">© {new Date().getFullYear()} UpSkillr · Developed by ER. Chetan D Morey</footer>
    </div>
  );
}
