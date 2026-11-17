import { Link } from 'react-router-dom';

const tools = [
  ['/tools/csharp-ide', '🟣', 'C# IDE (Visual Studio style)', 'Visual Studio–like editor for C#: menu bar, Solution Explorer with Program.cs and extra classes (Add > Class), C# syntax highlighting and IntelliSense-style suggestions, Output / Error List panes, expected output from each lesson, .csproj and copy/download to run in Visual Studio (Ctrl+F5).'],
  ['/tools/ssms-lab', '🗄️', 'SSMS Lab (SQL Server style)', 'SQL Server Management Studio–style T-SQL practice: Object Explorer, New Query, ▶ Execute (F5), Results and Messages ("(3 rows affected)", Msg 208 …). Supports TOP, IDENTITY, GO, GETDATE, DATEADD/DATEDIFF, CONVERT, OFFSET-FETCH, SELECT INTO #temp, CTEs, window functions, views and transactions. Sample StudentDB and EmployeeDB.'],
  ['/tools/mysql-workbench', '🐬', 'MySQL Workbench Lab', 'A MySQL Workbench–style practice tool: Navigator with schemas/tables/columns, query tabs, ⚡ execute all (Ctrl+Shift+Enter) or current statement (Ctrl+Enter), Result Grid and Action Output. Understands MySQL syntax (CREATE DATABASE, USE, SHOW TABLES, DESCRIBE, AUTO_INCREMENT, DATE_FORMAT, IF, CONCAT…). Sample college & ecommerce databases; your databases are saved in the browser.'],
  ['/tools/python-ide', '🐍', 'Python IDE (PyCharm style)', 'Write and RUN real Python 3.12 in your browser (Pyodide): multiple .py files with imports, input() support, output console, Stop button, compare with the expected output, numpy/pandas auto-loaded.'],
  ['/tools/sql-lab', '🗄️', 'SQL Lab (Workbench style)', 'Run SQL queries in your browser on a ready sample company database (employees, departments, customers, products, orders). Result grids, setup editor, practice queries incl. joins and window functions.'],
  ['/tools/java-ide', '☕', 'Java IDE (IntelliJ / Eclipse style)', 'Java editor with a project tree, multiple class files, syntax highlighting, IntelliJ (dark) and Eclipse (light) themes, expected output from each lesson, program-input notes, and copy/download to run in your IDE.'],
  ['/tools/playground', '💻', 'Code Playground (VS Code style)', 'Real VS Code editor (Monaco) with index.html, style.css and script.js tabs, live preview, console panel, React (JSX) mode, templates, Ctrl+Enter to run and download as index.html. Every HTML/CSS/JS/React example opens here with one click.'],
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
