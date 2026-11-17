# Power BI 45-day syllabus: topic file spec

Two folders:
- `src/data/powerbi-days/` holds ONE file per day: `day-NN-<slug>.js` (NN = 01..45)
- `src/data/powerbi-extra/` holds ONE file per extra topic: `extra-NN-<slug>.js` (NN = 01..44)

Each file is a plain ES module with a default export object. NO imports, NO JSX, valid JS.

```js
export default {
  id: 'day-23-calculate-filter-all',   // = filename without .js
  title: 'CALCULATE(), FILTER(), ALL(), ALLEXCEPT()',
  module: 'Module 4: DAX – Data Analysis Expressions',  // exact module name below (extras: their group name, e.g. 'Extra: DAX')
  day: 23,                              // extras: omit `day`, use `extraNo: 14`
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  duration: '2 hours',
  summary: '1-2 sentences: what & why.',
  objectives: ['...'],                  // 3-5
  theory: [                             // 4-7 sections; explain EVERY sub-topic listed for the day, simple language, real analogies
    { heading, content /* paragraphs split by \n\n, `code`, **bold**, "- " bullets, "1. " numbered */, syntax /* optional, DAX/M syntax */, points /* optional */, tip /* optional */ },
  ],
  examples: [                           // 3-6 SOLVED examples
    {
      title, scenario,
      table: { headers: [...], rows: [[...]] },   // optional: sample data OR the expected visual output (e.g. a matrix result)
      steps: ['Home > Transform data', 'Select column ...', ...],   // REQUIRED: numbered steps the student follows in Power BI Desktop
      code: 'Total Sales = SUM(Sales[SalesAmount])',              // DAX measure / M code (omit for pure UI topics)
      result: 'What the student should see',
      explanation: 'Why it works.',
    },
  ],
  interview: [ { q, a, level: 'Easy' | 'Medium' | 'Hard' } ],   // 6-10, real interview style, include scenario questions
  practice: [ { task, hint, solution } ],                       // 4-6 hands-on exercises
  quiz: [ { question, options: [4 items], answer: 0-3, explanation } ],   // EXACTLY 5
};
```

## Shared practice dataset (USE IT for DAX / modeling / visual examples)
The app ships a practice model that students can download as CSV and that the in-app **DAX Lab** evaluates live:
- `Sales` (fact): OrderID, OrderDate (date), Year, Month, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost
- `Product` (dim): ProductID, Product, Category (Electronics / Accessories / Furniture), Price
- `Customer` (dim): CustomerID, Customer, City (Pune / Mumbai / Nagpur / Nashik), Segment (Corporate / Retail)
- `Date` (dim, marked as date table, 2023-01-01..2024-12-31): Date, Year, MonthNo, Month (Jan..Dec), Quarter (Q1..Q4), YearMonth (2024-03)
- Relationships (all 1-to-many, single direction): Product[ProductID] → Sales[ProductID], Customer[CustomerID] → Sales[CustomerID], Date[Date] → Sales[OrderDate]
Write DAX against these exact names so students can paste measures into the DAX Lab. Where a topic needs something else
(e.g. inactive ShipDate relationship, Budget table, Employee table for RLS) say clearly it is an extra table the student creates.
DAX Lab supports: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTROWS, DISTINCTCOUNT, SUMX/AVERAGEX/MINX/MAXX/COUNTX, CONCATENATEX, RANKX, TOPN,
CALCULATE, FILTER, ALL, ALLEXCEPT, ALLSELECTED, REMOVEFILTERS, KEEPFILTERS, VALUES, DISTINCT, SELECTEDVALUE, HASONEVALUE, ISFILTERED,
RELATED, RELATEDTABLE, LOOKUPVALUE, DIVIDE, IF, SWITCH (incl. SWITCH(TRUE())), AND, OR, NOT, IN, BLANK, ISBLANK, COALESCE, ROUND, FORMAT,
VAR/RETURN, TOTALYTD/TOTALQTD/TOTALMTD, DATESYTD/DATESQTD/DATESMTD, SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, PREVIOUSMONTH, PREVIOUSYEAR, DATESINPERIOD.
For Power Query days, the app has a **Power Query Lab** (messy sales export; steps: remove columns/rows, promote headers, change type, rename,
replace values, trim/clean/capitalize, split/merge columns, filter, sort, fill down/up, unpivot, group by, conditional & custom columns, merge with a lookup table)
that shows generated M code. In practice tasks you may say "Try this in the Power Query Lab".

## Quality rules
- Simple clear English for students and freshers; exact menu paths (e.g. Home > Transform data, Modeling > New measure, Model view drag-and-drop).
- All DAX and M must be correct for current Power BI Desktop. Use current names (semantic model = dataset; Fabric where relevant).
- Every example needs `steps`. Results must be consistent with the sample data you show.

Validation (run after writing; fix every failure):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=6&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```
You may read older topic-wise Power BI content in `src/data/powerbi/*.js` for reference, but write fresh files.

## Syllabus (45 days)
Module 1: Introduction to Power BI (Day 1–5)
Day 1 Introduction to Data Analytics, What is Power BI, Features, Uses, Power BI Architecture
Day 2 Power BI Desktop Installation, Interface, Ribbon, Report View, Data View, Model View
Day 3 Power BI Service, Power BI Mobile, Power BI Desktop vs Service
Day 4 Power BI Components, Workspaces, Reports, Dashboards, Datasets/Semantic Models
Day 5 Import Excel, CSV, Text Files, JSON Files and Basic Data Connections
Module 2: Power Query – Data Cleaning (Day 6–12)
Day 6 Introduction to Power Query Editor, Query Navigation
Day 7 Remove Rows, Remove Columns, Keep Rows, Remove Duplicates
Day 8 Change Data Types, Rename Columns, Replace Values
Day 9 Split Columns, Merge Columns, Extract Text
Day 10 Filter Rows, Sort Data, Fill Up, Fill Down
Day 11 Append Queries, Merge Queries, Join Types
Day 12 Pivot Columns, Unpivot Columns, Group By, Conditional Columns, Custom Columns
Module 3: Data Modeling (Day 13–17)
Day 13 Introduction to Data Modeling, Tables and Relationships
Day 14 One-to-One, One-to-Many, Many-to-Many Relationships
Day 15 Primary Key, Foreign Key, Cardinality, Cross Filter Direction
Day 16 Star Schema, Snowflake Schema, Fact Tables, Dimension Tables
Day 17 Date Table, Active and Inactive Relationships, Model Optimization
Module 4: DAX – Data Analysis Expressions (Day 18–27)
Day 18 Introduction to DAX, DAX Syntax, Operators
Day 19 Calculated Columns vs Measures
Day 20 SUM(), AVERAGE(), MIN(), MAX(), COUNT()
Day 21 COUNTROWS(), DISTINCTCOUNT(), COUNTA()
Day 22 IF(), SWITCH(), AND(), OR(), NOT()
Day 23 CALCULATE(), FILTER(), ALL(), ALLEXCEPT()
Day 24 SUMX(), AVERAGEX(), COUNTX(), MINX(), MAXX()
Day 25 RELATED(), RELATEDTABLE(), LOOKUPVALUE()
Day 26 DIVIDE(), FORMAT(), SELECTEDVALUE(), COALESCE()
Day 27 Time Intelligence: TOTALYTD(), TOTALMTD(), TOTALQTD(), SAMEPERIODLASTYEAR(), DATEADD()
Module 5: Data Visualization (Day 28–33)
Day 28 Introduction to Visualization, Charts and Visual Selection
Day 29 Bar Chart, Column Chart, Line Chart, Area Chart
Day 30 Pie Chart, Donut Chart, Treemap, Funnel Chart
Day 31 Table, Matrix, Card, KPI, Gauge, Multi-row Card
Day 32 Slicers, Filters, Drill Down, Drill Through, Tooltips
Day 33 Conditional Formatting, Bookmarks, Buttons, Page Navigation
Module 6: Advanced Power BI (Day 34–38)
Day 34 Advanced DAX, Evaluation Context, Row Context, Filter Context
Day 35 Variables (VAR), Context Transition, Dynamic Measures
Day 36 What-if Parameters, Field Parameters, Dynamic Titles
Day 37 Row-Level Security (RLS), Object-Level Security (OLS) Basics
Day 38 Performance Analyzer, DAX Optimization, Model Performance
Module 7: Power BI Service & Deployment (Day 39–41)
Day 39 Publish Reports, Power BI Workspaces, Apps
Day 40 Scheduled Refresh, Gateway, Data Source Credentials
Day 41 Sharing Reports, Permissions, Subscriptions, Export Reports
Module 8: AI Features & Advanced Integration (Day 42–45)
Day 42 Q&A Visual, Key Influencers, Decomposition Tree, Smart Narrative
Day 43 AI Visuals, Anomaly Detection, Forecasting
Day 44 Power BI with Excel, SQL Server, MySQL and Power Query
Day 45 Final Dashboard Project, Interview Questions, Practical Assessment (make it bigger: full project brief with step-by-step build, practical assessment with answers, 20+ interview Q&A across all modules)

## Extra topics (module = group name in quotes)
'Extra: Power Query': 1 M Language Introduction; 2 Custom Functions; 3 Parameters; 4 Query Dependencies; 5 Error Handling; 6 Data Profiling; 7 Fuzzy Matching; 8 Incremental Refresh Concepts
'Extra: DAX': 9 ISBLANK(); 10 ISFILTERED(); 11 HASONEVALUE(); 12 VALUES(); 13 DISTINCT(); 14 RANKX(); 15 TOPN(); 16 CONCATENATEX(); 17 REMOVEFILTERS(); 18 KEEPFILTERS(); 19 USERELATIONSHIP(); 20 CROSSFILTER(); 21 DATESYTD(); 22 DATESMTD(); 23 DATESQTD(); 24 DATEADD(); 25 PARALLELPERIOD()
'Extra: Visualization & Reporting': 26 Custom Visuals; 27 Decomposition Tree; 28 Paginated Reports; 29 Report Page Tooltips; 30 Mobile Layout; 31 Custom Themes; 32 Drill Through Pages; 33 Sync Slicers; 34 Dynamic Visual Titles
'Extra: Advanced & Administration': 35 Composite Models; 36 DirectQuery; 37 Import Mode; 38 Direct Lake Concepts; 39 Dataflows; 40 Semantic Models; 41 Deployment Pipelines; 42 Workspace Roles; 43 XMLA Endpoint Concepts; 44 Power BI Embedded Basics
