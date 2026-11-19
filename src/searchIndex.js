// One search index for the whole app: pages & tools, courses, lessons, aptitude, errors,
// puzzles, coding problems, projects and company kits. Built once, on first use.
import { tracks, trackOrder, allTopics } from './data/index.js';
import { APTITUDE } from './data/aptitude.js';
import { codingProblems, javaProjects } from './data/javaCareer.js';
import { WEB_PROJECTS } from './data/webProjects.js';
import { projects as pyProjects } from './data/projects.js';
import { MERN_PROJECTS } from './data/mernProjects.js';
import { COMPANIES } from './pages/PlacementTools.jsx';

const pick = (mods, name) => { for (const m of Object.values(mods)) if (m[name]) return m[name]; return []; };
const ERRORS = pick(import.meta.glob('./data/errorDictionary.js', { eager: true }), 'ERRORS');
const PUZZLES = pick(import.meta.glob('./data/codePuzzles.js', { eager: true }), 'PUZZLES');

// [path, title, description, extra keywords]
export const PAGES = [
  ['/today', "Today's plan", 'What to study today: lesson, revision, challenge, test', 'today plan daily todo'],
  ['/dashboard', 'Dashboard', 'Progress, streak, charts, readiness', 'progress stats'],
  ['/courses', 'All courses', 'Every course and learning path', 'syllabus'],
  ['/roadmap', 'Roadmap', 'Day-by-day study plan', 'plan schedule'],
  ['/videos', 'Video lessons', 'Watch lessons', 'youtube watch'],
  ['/study', 'Study Hub', 'Revision, mistakes, planner, notes, XP', 'study'],
  ['/study/revision', 'Smart Revision', 'Spaced repetition: 1, 3, 7, 30 days', 'revise flashcards srs memory'],
  ['/study/mistakes', 'Mistake Notebook', 'Questions you got wrong', 'wrong answers errors practice'],
  ['/study/notes', 'My Notes', 'Lesson notes and highlights, PDF', 'highlight notes pdf'],
  ['/study/planner', 'Planner & Focus Timer', 'Daily goals, weekly plan, Pomodoro, reminders, calendar', 'pomodoro timer goals calendar reminder'],
  ['/study/challenge', 'Daily Coding Challenge', 'One coding problem every day', 'daily problem dsa'],
  ['/study/diagnostic', 'Diagnostic Test & Path', 'Find where to start in a course', 'placement test level'],
  ['/study/achievements', 'XP & Badges', 'Levels, badges, XP', 'gamification level badge'],
  ['/study/report', 'Weekly Report', 'Progress report PDF for parents/teachers', 'report parents pdf'],
  ['/study/certificates', 'Certificates', 'Course completion certificates', 'certificate'],
  ['/study/resume', 'Resume Builder', 'ATS-friendly resume', 'cv resume ats'],
  ['/study/portfolio', 'Portfolio Website', 'Generate a portfolio website', 'website github pages'],
  ['/career/applications', 'Application Tracker', 'Track jobs & internships you applied to', 'jobs internship apply interview tracker'],
  ['/career/offers', 'Offer Comparison', 'Compare offers: CTC, in-hand salary, bond', 'salary ctc package in-hand offer letter'],
  ['/career/experiences', 'Interview Journal', 'Write down interview experiences and share them', 'interview experience questions asked'],
  ['/practice/aptitude', 'Aptitude & Reasoning', 'Quant, logical, verbal with timed tests', 'aptitude quant reasoning verbal maths'],
  ['/practice/companies', 'Company-wise Kits', 'TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini', 'company placement pattern'],
  ['/practice/video-interview', 'Video Mock Interview', 'Record yourself answering', 'camera webcam interview'],
  ['/tools/java-interview', 'Java Interview Prep', 'Test series, mock interview, coding round', 'interview'],
  ['/tools/test-series', 'Test Series', 'Tests for every course', 'mcq exam test'],
  ['/tools/soft-skills', 'Soft Skills Lab', 'Self intro, GD, HR answers, email', 'communication english'],
  ['/tools/quiz', 'Quiz Arena', 'Random quizzes', 'quiz'],
  ['/tools/quiz-battle', 'Quiz Battle vs Bot', 'Timed quiz game', 'game battle'],
  ['/tools/flashcards', 'Flashcards', 'Interview Q&A cards', 'cards'],
  ['/tools/code-visualizer', 'Code Visualizer', 'Run Python step by step', 'debug trace python tutor'],
  ['/tools/visualizers', 'DSA & Concept Visualizer', 'Sorting, linked list, BST, joins, git, http', 'animation algorithm data structure'],
  ['/tools/code-puzzles', 'Code Puzzles', 'Arrange lines, predict output, find the bug', 'parsons output bug'],
  ['/tools/explain-error', 'Explain my Error', 'Meaning and fix of an error message', 'exception error fix debug'],
  ['/tools/ai-code-review', 'AI Code Review', 'Feedback on your code', 'review ai'],
  ['/tools/playground', 'Web Playground', 'HTML, CSS, JS, React editor', 'html css javascript react editor'],
  ['/tools/python-ide', 'Python IDE', 'Run Python in the browser', 'python'],
  ['/tools/java-ide', 'Java IDE', 'Java editor with expected output', 'java'],
  ['/tools/csharp-ide', 'C# IDE', 'C# editor', 'csharp dotnet'],
  ['/tools/mysql-workbench', 'MySQL Workbench Lab', 'Run SQL on sample databases', 'sql mysql database'],
  ['/tools/ssms-lab', 'SSMS Lab', 'SQL Server practice', 'tsql sql server'],
  ['/tools/sql-lab', 'SQL Lab', 'SQLite practice', 'sql'],
  ['/tools/mongo-lab', 'MongoDB Lab', 'MongoDB shell', 'mongo nosql'],
  ['/tools/api-lab', 'API Lab', 'Express API simulator', 'node express rest api'],
  ['/tools/ai-lab', 'AI Prompt Lab', 'Write and test prompts', 'prompt chatgpt claude'],
  ['/tools/ai-app-builder', 'AI App Builder', 'Build an AI chatbot', 'chatbot rag'],
  ['/tools/formula-lab', 'Excel Formula Lab', 'Practise Excel formulas', 'excel vlookup'],
  ['/tools/dax-lab', 'DAX Lab', 'Power BI DAX measures', 'power bi dax'],
  ['/tools/web-projects', 'Web Dev Projects', 'Build web projects with automated checks', 'project portfolio'],
  ['/tools/python-projects', 'Python Projects', 'Final projects with tests', 'project'],
  ['/tools/mern-projects', 'MERN Projects', 'Express API projects', 'project mern'],
  ['/tools/java-projects', 'Java Projects', 'Final Project Studio', 'project java'],
];

let cache = null;
export function searchIndex() {
  if (cache) return cache;
  const e = [];
  PAGES.forEach(([to, title, sub, kw]) => e.push({ type: 'Page', icon: '🧭', title, sub, to, text: `${title} ${sub} ${kw}` }));
  trackOrder.forEach((k) => { const t = tracks[k]; if (t?.topics?.length) e.push({ type: 'Course', icon: t.icon || '📘', title: t.name, sub: t.tagline, to: `/track/${k}`, text: `${t.name} ${t.short} ${t.tagline}` }); });
  allTopics.forEach((t) => e.push({ type: 'Lesson', icon: '📖', title: t.title, sub: `${tracks[t.track]?.short} · ${t.module || ''}`, to: `/track/${t.track}/${t.id}`, text: `${t.title} ${t.summary || ''} ${tracks[t.track]?.short}` }));
  APTITUDE.forEach((t) => e.push({ type: 'Aptitude', icon: t.icon || '🧮', title: t.title, sub: t.section, to: `/practice/aptitude/${t.id}`, text: `${t.title} ${t.summary} ${t.section} aptitude` }));
  COMPANIES.forEach((c) => e.push({ type: 'Company', icon: '🏢', title: `${c.name} prep kit`, sub: c.about, to: `/practice/companies/${c.id}`, text: `${c.name} placement company ${c.about}` }));
  ERRORS.forEach((x) => e.push({ type: 'Error', icon: '🩺', title: x.title, sub: `${x.lang} · ${x.meaning.en}`, to: `/tools/explain-error?q=${encodeURIComponent(x.title)}`, text: `${x.title} ${x.lang} ${x.meaning.en} error exception` }));
  PUZZLES.forEach((x) => e.push({ type: 'Puzzle', icon: '🧩', title: x.title, sub: `${x.lang} · ${x.topic} · ${x.level}`, to: '/tools/code-puzzles', text: `${x.title} ${x.topic} ${x.lang} puzzle` }));
  codingProblems.forEach((x) => e.push({ type: 'Coding problem', icon: '💻', title: x.title, sub: `${x.topic} · ${x.level}`, to: '/tools/java-interview', text: `${x.title} ${x.topic} coding program` }));
  WEB_PROJECTS.forEach((p) => e.push({ type: 'Project', icon: p.icon, title: p.title, sub: `Web · ${p.track}`, to: `/tools/web-projects/${p.id}`, text: `${p.title} ${p.summary} project` }));
  pyProjects.forEach((p) => e.push({ type: 'Project', icon: p.icon || '🐍', title: p.title, sub: 'Python project', to: `/tools/python-projects/${p.id}`, text: `${p.title} ${p.summary || ''} python project` }));
  MERN_PROJECTS.forEach((p) => e.push({ type: 'Project', icon: p.icon, title: p.title, sub: 'MERN project', to: `/tools/mern-projects/${p.id}`, text: `${p.title} ${p.summary || ''} mern project` }));
  javaProjects.forEach((p) => e.push({ type: 'Project', icon: '☕', title: p.title, sub: 'Java project', to: `/tools/java-projects/${p.id}`, text: `${p.title} ${p.summary} java project` }));
  e.forEach((x) => { x.lc = x.text.toLowerCase(); x.lt = x.title.toLowerCase(); });
  cache = e;
  return e;
}

// Ranked search: every word must appear; title matches and starts-with rank higher.
const TYPE_RANK = { Page: 0, Course: 1, Lesson: 2, Aptitude: 2, Company: 2, Project: 3, Error: 3, 'Coding problem': 4, Puzzle: 5 };
export function searchAll(q, limit = 50) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return searchIndex()
    .filter((x) => words.every((w) => x.lc.includes(w)))
    .map((x) => {
      let s = 0;
      if (x.lt === words.join(' ')) s += 100;
      if (x.lt.startsWith(words[0])) s += 30;
      words.forEach((w) => { if (x.lt.includes(w)) s += 15; });
      s -= (TYPE_RANK[x.type] ?? 5) * 4;
      return { ...x, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
}
