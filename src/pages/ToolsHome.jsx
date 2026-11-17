import { Link } from 'react-router-dom';

const tools = [
  ['/tools/formula-lab', '🧮', 'Excel Formula Lab', 'A mini spreadsheet in your browser. Type real Excel formulas (SUM, IF, VLOOKUP, XLOOKUP, SUMIFS, TEXT functions…) and see results instantly. Includes guided challenges.'],
  ['/tools/dax-lab', '⚡', 'DAX Lab', 'Write DAX measures against a Sales star schema with a Date table and see them evaluated in a matrix with slicers. Supports CALCULATE, FILTER, ALL, SUMX, RELATED, LOOKUPVALUE and time intelligence (TOTALYTD, SAMEPERIODLASTYEAR, DATEADD). Download the CSVs to practise in Power BI Desktop.'],
  ['/tools/power-query-lab', '🧹', 'Power Query Lab', 'Clean a messy sales file step by step: promote headers, remove blanks and duplicates, fill down, split, replace, change types, custom columns, group by, merge, append and unpivot. See Applied Steps and the generated M code, and solve challenges.'],
  ['/tools/quiz', '🏆', 'Quiz Arena', 'Random mixed quiz from all topics. Pick track, number of questions and a timer to simulate a test.'],
  ['/tools/flashcards', '🃏', 'Interview Flashcards', 'Every interview question from every topic as flip cards. Filter by track, level or bookmarks.'],
  ['/tools/shortcuts', '⌨️', 'Shortcuts & Cheat Sheet', 'Essential Excel and Power BI keyboard shortcuts plus a formula and DAX cheat sheet, with search.'],
];

export default function ToolsHome() {
  return (
    <div>
      <div className="page-head">
        <h1>🛠 Practice tools</h1>
        <p className="muted">Practice right here in the browser, no installation needed.</p>
      </div>
      <div className="grid2">
        {tools.map(([to, icon, h, p]) => (
          <Link key={to} to={to} className="card tool-card">
            <div className="track-icon">{icon}</div>
            <h3>{h}</h3>
            <p className="muted">{p}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
