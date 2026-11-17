# Excel 60-day syllabus: topic file spec

Two folders:
- `src/data/excel-days/` holds ONE file per day: `day-NN-<slug>.js` (NN = 01..60)
- `src/data/excel-extra/` holds ONE file per extra topic: `extra-NN-<slug>.js` (NN = 01..28)

Each file is a plain ES module with a default export object. NO imports, NO JSX, valid JS.
Prefer single-quoted strings with \n, or template literals (escape any backtick inside).

```js
export default {
  id: 'day-12-sum-average',          // = filename without .js
  title: 'SUM() and AVERAGE()',       // short title of the day's topics
  module: 'Module 2: Basic Formulas & Functions',   // exact module name from the syllabus below (extra files: 'Additional Job-Oriented Skills')
  day: 12,                            // day number (extra files: omit `day`, use `extraNo: 5`)
  level: 'Beginner',                  // Beginner | Intermediate | Advanced
  duration: '1.5 hours',
  summary: '1-2 sentences: what & why.',
  objectives: ['...', '...', '...'],  // 3-5 items
  theory: [                           // 4-7 sections. Explain EVERY sub-topic listed for the day, in simple language for a beginner student.
    {
      heading: 'What is SUM()?',
      content: 'Paragraphs separated by \n\n. Use `code` and **bold**. Lines starting with "- " become bullet lists, "1. " numbered lists.',
      syntax: '=SUM(number1, [number2], ...)',      // optional: for functions, ALWAYS give syntax and explain each argument in content/points
      points: ['optional bullets'],                    // optional
      tip: 'optional pro tip or common mistake',        // optional
    },
  ],
  examples: [                         // 3-6 SOLVED examples, step by step
    {
      title: 'Total marks of a student',
      scenario: 'The problem the student must solve.',
      table: { headers: ['A: Student', 'B: Maths', 'C: Science'], rows: [['Riya', '78', '85']] },  // sample data; first row of rows = Excel row 2
      steps: ['Click cell D2', 'Type =SUM(B2:C2)', 'Press Enter', 'Drag the fill handle down to D6'],  // REQUIRED: numbered solving steps
      code: '=SUM(B2:C2)',            // the formula / VBA / M code (omit for pure UI topics)
      result: '163',                  // the output the student should see
      explanation: 'Why it works and what to watch out for.',
    },
  ],
  interview: [                        // 6-10 Q&A, real interview style, level: Easy | Medium | Hard
    { q: '...', a: 'Detailed, correct answer.', level: 'Easy' },
  ],
  practice: [                         // 4-6 exercises with sample data inside `task`
    { task: '...', hint: '...', solution: 'Full solution: formula(s) and/or numbered steps.' },
  ],
  quiz: [                             // EXACTLY 5 MCQs
    { question: '...', options: ['a', 'b', 'c', 'd'], answer: 0, explanation: '...' },   // answer = 0-based index
  ],
};
```

Quality rules:
- Content in clear simple English for students, freshers, office staff, accountants and beginner data analysts.
- Use realistic Indian-context office examples (marks sheet, salary sheet, sales, inventory, attendance, invoices; ₹).
- Every formula must be CORRECT for Microsoft 365 Excel and the `result` must match the sample data exactly. Double-check arithmetic.
- For UI topics (ribbon, formatting, sorting...), give exact menu paths (e.g. Home > Alignment > Wrap Text) and keyboard shortcuts.
- Cover EVERY item listed for that day. Don't drift into later days' topics except a brief "coming up" mention.
- You may read existing richer content for reference in `src/data/excel/*.js` (older topic-wise files), but write fresh day-wise files.

Validation (run after writing; fix every failure):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=6&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```

## Syllabus

Module 1: Excel Basics (Day 1–10)
Day 1 Introduction to MS Excel, Uses of Excel, Features, Workbook, Worksheet, Rows, Columns, Cells
Day 2 Excel Interface, Ribbon, Formula Bar, Name Box, Sheet Tabs, Status Bar
Day 3 Creating, Opening, Saving, Closing Excel Files, File Extensions (.xlsx, .xls, .csv)
Day 4 Data Entry, Editing Data, Deleting Data, Copy, Cut, Paste
Day 5 Selecting Cells, Rows, Columns, Multiple Ranges, AutoFill
Day 6 Formatting Cells, Font, Font Size, Font Color, Bold, Italic, Underline
Day 7 Cell Alignment, Wrap Text, Merge & Center, Text Orientation
Day 8 Number Formatting, Currency, Percentage, Date, Time, Decimal
Day 9 Row Height, Column Width, Insert, Delete, Hide, Unhide
Day 10 Borders, Fill Colors, Format Painter, Basic Worksheet Practice

Module 2: Basic Formulas & Functions (Day 11–20)
Day 11 Introduction to Formulas, Formula Operators, Order of Operations
Day 12 SUM(), AVERAGE()
Day 13 MIN(), MAX(), COUNT()
Day 14 COUNTA(), COUNTBLANK(), PRODUCT()
Day 15 ROUND(), ROUNDUP(), ROUNDDOWN(), INT()
Day 16 MOD(), ABS(), SQRT(), POWER()
Day 17 Relative, Absolute, Mixed Cell References
Day 18 CONCAT(), CONCATENATE(), TEXTJOIN()
Day 19 LEFT(), RIGHT(), MID(), LEN()
Day 20 UPPER(), LOWER(), PROPER(), TRIM(), CLEAN()

Module 3: Logical & Conditional Functions (Day 21–28)
Day 21 IF() Function
Day 22 Nested IF()
Day 23 AND(), OR(), NOT()
Day 24 IF with AND / OR
Day 25 SUMIF(), SUMIFS()
Day 26 COUNTIF(), COUNTIFS()
Day 27 AVERAGEIF(), AVERAGEIFS()
Day 28 IFERROR(), IFNA(), Conditional Formula Practice

Module 4: Data Management & Sorting (Day 29–35)
Day 29 Sorting Data, Ascending, Descending, Custom Sort
Day 30 Filtering Data, AutoFilter, Advanced Filter
Day 31 Remove Duplicates, Find & Replace
Day 32 Text to Columns
Day 33 Flash Fill, Data Validation
Day 34 Drop-down Lists, Input Messages, Error Alerts
Day 35 Conditional Formatting, Duplicate Highlighting, Data Bars, Color Scales, Icon Sets

Module 5: Advanced Excel Functions (Day 36–43)
Day 36 VLOOKUP()
Day 37 HLOOKUP()
Day 38 XLOOKUP()
Day 39 INDEX() and MATCH()
Day 40 INDEX + MATCH Combination
Day 41 CHOOSE(), OFFSET(), INDIRECT()
Day 42 Date Functions: TODAY(), NOW(), DAY(), MONTH(), YEAR()
Day 43 EOMONTH(), DATEDIF(), NETWORKDAYS(), WORKDAY()

Module 6: Data Analysis & Reporting (Day 44–50)
Day 44 Excel Tables, Structured References
Day 45 Pivot Table Creation
Day 46 Pivot Table Grouping, Filtering, Sorting
Day 47 Pivot Charts, Slicers, Timelines
Day 48 Charts: Column, Bar, Line, Pie, Doughnut
Day 49 Advanced Charts, Combo Charts, Waterfall Charts
Day 50 Dashboard Creation, KPI Cards, Interactive Reports

Module 7: Advanced Excel Tools (Day 51–55)
Day 51 What-If Analysis, Goal Seek
Day 52 Scenario Manager, Data Tables
Day 53 Consolidate Data, Subtotal, Group & Ungroup
Day 54 Power Query, Import Data, Clean Data, Transform Data
Day 55 Power Pivot Basics, Data Model, Relationships, DAX Introduction

Module 8: Automation & Professional Skills (Day 56–60)
Day 56 Macro Recording, Macro Execution
Day 57 VBA Introduction, Variables, Procedures
Day 58 VBA Loops, Conditions, Buttons, Automation
Day 59 Sheet Protection, Workbook Protection, Print Settings, Page Layout
Day 60 Final Excel Project, Practical Test, Interview Questions  (make this one bigger: a full project brief with step-by-step solution, a practical test, and 20+ mixed interview Q&A across all modules)

Additional Job-Oriented Skills (module: 'Additional Job-Oriented Skills', extra-NN):
1 Excel Keyboard Shortcuts; 2 Freeze Panes; 3 Split Windows; 4 Named Ranges; 5 Hyperlinks; 6 Camera Tool; 7 Paste Special;
8 Transpose Data; 9 Custom Number Formats; 10 Dynamic Array Functions (overview, spill, #SPILL!); 11 UNIQUE(); 12 FILTER(); 13 SORT();
14 SORTBY(); 15 SEQUENCE(); 16 TEXTSPLIT(); 17 LET(); 18 LAMBDA(); 19 SUBTOTAL(); 20 AGGREGATE(); 21 RANK(); 22 LARGE() and SMALL();
23 Chart Formatting; 24 Excel Templates; 25 Importing CSV and TXT Files; 26 External Data Connections; 27 Power Query M Language Basics;
28 Excel + Power BI Integration
