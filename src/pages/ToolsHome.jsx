import { Link } from 'react-router-dom';
import {
  Sparkles, Brain, Network, Rocket, Compass, Code2, Coffee, Cpu, Terminal, Database, Server, Table2,
  Calculator, Zap, Filter, Trophy, Layers, Keyboard, ClipboardCheck, Hammer, MessageCircle,
} from 'lucide-react';

const GROUPS = [
  ['Artificial Intelligence', [
    ['/tools/ai-lab', Sparkles, 'AI Prompt Lab', 'Build prompts with a guided builder, get a quality score, use 15 templates, and run them with Claude (your API key) or open them in Claude.ai / ChatGPT.'],
    ['/tools/ai-app-builder', Rocket, 'AI App Builder (final project)', 'Create your own AI chatbot: template, system prompt, knowledge base (RAG), test cases, then download a working app and your project report.'],
    ['/tools/ai-concepts', Brain, 'AI Concepts Lab', 'See tokens and cost, next-word probabilities (temperature / top-p) and semantic search / RAG, step by step.'],
    ['/tools/ml-playground', Network, 'ML Playground', 'Click to add data points and watch KNN, logistic regression, k-means and linear regression learn, with accuracy and a confusion matrix.'],
    ['/tools/ai-tools', Compass, 'AI Tools Directory', '60+ AI tools: what each is, where it is used in jobs, how to use it step by step, example prompts, tips and limitations.'],
  ]],
  ['Java career & placement', [
    ['/tools/java-interview', ClipboardCheck, 'Java Interview Test Series', 'Timed grand, course-wise and module-wise tests, mock technical & HR interviews (type or speak, AI feedback), a coding round and your score history.'],
    ['/tools/java-projects', Hammer, 'Final Project Studio', '8 Java final projects from console apps to Spring Boot microservices: milestones, DB design, APIs, starter code, viva Q&A and a downloadable project report.'],
    ['/tools/soft-skills', MessageCircle, 'Soft Skills Lab', 'Self-introduction builder, speaking practice with filler-word and speed analysis, HR answers, STAR stories, group discussion and email writing.'],
  ]],
  ['Code editors & IDEs', [
    ['/tools/playground', Code2, 'Web Code Editor (VS Code style)', 'HTML / CSS / JavaScript and React with live preview and console.'],
    ['/tools/python-ide', Terminal, 'Python IDE (PyCharm style)', 'Runs real Python 3.12 in your browser: input(), multiple files, numpy, pandas, scikit-learn.'],
    ['/tools/java-ide', Coffee, 'Java IDE (IntelliJ / Eclipse style)', 'Project tree, multiple classes, expected output, copy/download to your IDE.'],
    ['/tools/csharp-ide', Cpu, 'C# IDE (Visual Studio style)', 'Solution Explorer, multiple .cs files, expected output, .csproj, run in Visual Studio.'],
  ]],
  ['Databases', [
    ['/tools/mysql-workbench', Database, 'MySQL Workbench Lab', 'Navigator, query tabs, Result Grid, Action Output; MySQL syntax; sample college & ecommerce DBs.'],
    ['/tools/ssms-lab', Server, 'SSMS Lab (SQL Server)', 'Object Explorer, T-SQL (TOP, IDENTITY, GO, GETDATE…), Results & Messages; StudentDB & EmployeeDB.'],
    ['/tools/sql-lab', Table2, 'SQL Lab (SQLite)', 'Quick SQL practice on a sample company database with result grids.'],
  ]],
  ['Data analytics', [
    ['/tools/formula-lab', Calculator, 'Excel Formula Lab', 'A mini spreadsheet with 80+ Excel functions and 15 challenges.'],
    ['/tools/dax-lab', Zap, 'DAX Lab', 'DAX measures on a star schema with a Date table, time intelligence and CSV downloads.'],
    ['/tools/power-query-lab', Filter, 'Power Query Lab', 'Clean messy data step by step and see the generated M code.'],
  ]],
  ['Revision', [
    ['/tools/quiz', Trophy, 'Quiz Arena', 'Random timed quizzes from any course.'],
    ['/tools/flashcards', Layers, 'Interview Flashcards', 'Every interview question as flip cards; star the hard ones.'],
    ['/tools/shortcuts', Keyboard, 'Shortcuts & Cheat Sheet', 'Excel, Power BI and DAX shortcuts and formulas.'],
  ]],
];

export default function ToolsHome() {
  return (
    <div>
      <div className="page-head">
        <h1>Practice tools</h1>
        <p className="muted">Learn by doing: every tool runs in your browser. Lesson examples open here with one click.</p>
      </div>
      {GROUPS.map(([g, tools]) => (
        <section key={g}>
          <h2 className="section-title">{g}</h2>
          <div className="grid3">
            {tools.map(([to, Icon, h, p]) => (
              <Link key={to} to={to} className="card tool-card">
                <div className="tool-icon"><Icon size={22} strokeWidth={1.8} /></div>
                <h3>{h}</h3>
                <p className="muted small">{p}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
