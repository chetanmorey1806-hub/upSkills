export default {
  id: 'extra-06-data-profiling',
  title: 'Data Profiling in Power Query',
  module: 'Extra: Power Query',
  extraNo: 6,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Data profiling means checking the health of your data before you build a report: how many values are valid, empty or errors, how many distinct values exist, and what the min, max and average look like. Power Query gives you Column quality, Column distribution, Column profile and the Table.Profile function.',
  objectives: [
    'Turn on Column quality, Column distribution and Column profile from the View tab',
    'Read Valid, Error and Empty percentages',
    'Explain the difference between distinct and unique counts',
    'Switch profiling from the top 1000 rows to the entire data set',
    'Create a profile table with Table.Profile',
  ],
  theory: [
    {
      heading: 'Why profile data?',
      content: 'A doctor checks your pulse and blood pressure before prescribing medicine. Data profiling is the health check-up of your data before you build visuals.\n\nProfiling answers questions like:\n- Are there empty CustomerIDs that will break the relationship?\n- Is ProductID really unique in the Product table (needed for a one-to-many relationship)?\n- Are there negative quantities or a SalesAmount of 9,999,999 that looks like a typo?\n- Did a type change create errors?\n\nAll three profiling tools are on the **View** tab of Power Query Editor under **Data Preview**.',
    },
    {
      heading: 'Column quality',
      content: 'Tick **View > Column quality**. Under each column header you see three percentages:\n\n- **Valid** (green): values that are not errors and not empty.\n- **Error** (red): cells containing errors.\n- **Empty** (grey): null or empty values.\n\nHover over the bar to see counts and quick actions such as Remove Errors or Remove Empty.',
      tip: 'Empty text "" counts as Empty for text columns. A space " " is Valid, so trim text first.',
    },
    {
      heading: 'Column distribution',
      content: 'Tick **View > Column distribution**. A small bar chart appears under each header with two numbers:\n\n- **Distinct**: how many different values exist.\n- **Unique**: how many values appear exactly once.\n\nExample: City values Pune, Mumbai, Pune, Nagpur, Nashik, Pune. Distinct = 4 (Pune, Mumbai, Nagpur, Nashik). Unique = 3 (Mumbai, Nagpur and Nashik appear once; Pune appears three times).\n\nFor a primary key column such as Product[ProductID], distinct and unique should both equal the row count.',
    },
    {
      heading: 'Column profile',
      content: 'Tick **View > Column profile** and select a column. A panel at the bottom shows:\n\n- **Column statistics**: Count, Error, Empty, Distinct, Unique, Empty string, Min, Max; for numbers also Average, Standard deviation, Zero, NaN, Even, Odd; for text it shows lengths.\n- **Value distribution**: a bar chart of how often each value appears. You can right-click a bar to filter (Equals / Does Not Equal) or use the **Group by** option for text (e.g. by text length) and numbers (e.g. sign or parity).\n\nUse it to spot outliers (Max SalesAmount far above the rest) and spelling variants (Pune, pune, PUNE).',
    },
    {
      heading: 'Top 1000 rows vs entire data set; Table.Profile',
      content: 'By default profiling uses only the **first 1000 rows** for speed. The status bar shows "Column profiling based on top 1000 rows". Click it and choose **Column profiling based on entire data set** to scan all rows. This can be slow on large sources, so switch back afterwards.\n\nFor a profile you can keep or even load into a report, use the M function **Table.Profile**. It returns one row per column with Min, Max, Average, StandardDeviation, Count, NullCount and DistinctCount.',
      syntax: 'Table.Profile(table as table, optional additionalAggregates as nullable list) as table',
      points: [
        'Profiling tools are only for viewing; they add no Applied Steps',
        'Quick actions from the profile bars (Remove Errors, Keep Duplicates) do add steps',
        'Check the entire data set before final decisions',
      ],
    },
  ],
  examples: [
    {
      title: 'Check Customer data quality',
      scenario: 'The Customer table has 10 rows. One CustomerID is empty and one City cell has an error after a bad transformation.',
      table: {
        headers: ['Column', 'Valid', 'Error', 'Empty'],
        rows: [['CustomerID', '90%', '0%', '10%'], ['City', '90%', '10%', '0%'], ['Segment', '100%', '0%', '0%']],
      },
      steps: [
        'Home > Transform data, select the Customer query',
        'View > tick Column quality',
        'Hover over the CustomerID quality bar and read the counts (9 valid, 1 empty)',
        'Use the bar menu > Remove Empty on CustomerID',
        'Hover over City and choose Remove Errors (or investigate with Keep Errors first)',
      ],
      code: `#"Filtered Rows" = Table.SelectRows(#"Changed Type", each [CustomerID] <> null and [CustomerID] <> ""),
#"Removed Errors" = Table.RemoveRowsWithErrors(#"Filtered Rows", {"City"})`,
      result: 'After both steps the 8 remaining rows show 100% Valid in all three columns.',
      explanation: 'Column quality showed the empty key and the error immediately. Removing the empty key prevents a blank row appearing in slicers due to an unmatched relationship.',
    },
    {
      title: 'Verify a primary key with Column distribution',
      scenario: 'Before creating the relationship Product[ProductID] to Sales[ProductID], confirm ProductID is unique in Product.',
      table: {
        headers: ['ProductID values', 'Distinct', 'Unique', 'Rows'],
        rows: [['101, 102, 103, 104, 102', 4, 3, 5]],
      },
      steps: [
        'Select the Product query > View > tick Column distribution',
        'Read ProductID: 4 distinct, 3 unique for 5 rows, so 102 is duplicated',
        'Select ProductID > Home > Keep Rows > Keep Duplicates to see both 102 rows, decide which is correct, then delete that step',
        'Select ProductID > Home > Remove Rows > Remove Duplicates',
        'Confirm distinct = unique = row count (4)',
      ],
      code: `#"Removed Duplicates" = Table.Distinct(#"Changed Type", {"ProductID"})`,
      result: 'ProductID now has 4 distinct and 4 unique values in 4 rows; the one-to-many relationship can be created.',
      explanation: 'A key column must have distinct = unique = row count. If not, Power BI cannot create a one-to-many relationship from that column (it would offer many-to-many).',
    },
    {
      title: 'Find outliers with Column profile on the entire data set',
      scenario: 'A SalesAmount of 9,999,999 was typed by mistake somewhere after row 1000.',
      table: {
        headers: ['Statistic', 'Top 1000 rows', 'Entire data set'],
        rows: [['Count', 1000, 5000], ['Min', 450, 450], ['Max', 165000, 9999999]],
      },
      steps: [
        'Select the Sales query > View > tick Column profile',
        'Select the SalesAmount column; read Min and Max in Column statistics',
        'Click "Column profiling based on top 1000 rows" in the status bar > choose entire data set',
        'Max now shows 9,999,999; filter SalesAmount > 1000000 to locate the row',
        'Fix or remove the row, then switch profiling back to top 1000 rows',
      ],
      result: 'The outlier is visible only when profiling the entire data set.',
      explanation: 'The default 1000-row sample can miss problems. Always profile the full data at least once for key columns.',
    },
    {
      title: 'Create a profile table with Table.Profile',
      scenario: 'Your manager wants a data quality page in the report showing null and distinct counts for every Sales column.',
      table: {
        headers: ['Column', 'Min', 'Max', 'Count', 'NullCount', 'DistinctCount'],
        rows: [['OrderID', 1001, 6000, 5000, 0, 5000], ['Quantity', 1, 20, 5000, 12, 20]],
      },
      steps: [
        'Right-click the Sales query > Reference; rename the new query Sales_Profile',
        'Click fx and replace the formula with = Table.Profile(Sales)',
        'Remove columns you do not need (keep Column, Min, Max, Count, NullCount, DistinctCount)',
        'Close & Apply and show Sales_Profile in a table visual',
      ],
      code: `let
    Source = Sales,
    Profile = Table.Profile(Source),
    Kept = Table.SelectColumns(Profile, {"Column", "Min", "Max", "Count", "NullCount", "DistinctCount"})
in
    Kept`,
      result: 'One row per Sales column with its statistics, refreshed every time the model refreshes (sample values shown).',
      explanation: 'Table.Profile scans the whole table, so it is not limited to 1000 rows. Loading it gives a simple, refreshable data quality report.',
    },
  ],
  interview: [
    { q: 'What data profiling tools are available in Power Query?', a: 'Column quality (Valid/Error/Empty %), Column distribution (distinct and unique counts with a mini chart) and Column profile (detailed statistics and value distribution), all on the View tab. The Table.Profile function gives a profile as a table.', level: 'Easy' },
    { q: 'What is the difference between distinct and unique?', a: 'Distinct counts different values; unique counts values that appear exactly once. Values A, A, B, C: distinct 3, unique 2.', level: 'Easy' },
    { q: 'Why might profiling show 0 errors, but refresh still loads errors?', a: 'Profiling defaults to the top 1000 rows. Errors further down are not counted. Switch to "Column profiling based on entire data set" in the status bar.', level: 'Medium' },
    { q: 'How do you check that a column can be the "one" side of a relationship?', a: 'Use Column distribution or Column profile: distinct and unique must equal the row count and there must be no empty values. Otherwise remove duplicates or fix data first.', level: 'Medium' },
    { q: 'Do profiling tools change the data?', a: 'No, they only display information. Quick actions you choose from them (Remove Errors, Remove Empty, Keep Duplicates) add Applied Steps.', level: 'Easy' },
    { q: 'Scenario: The City slicer shows Pune, pune and PUNE. How would profiling help and how do you fix it?', a: 'Column profile value distribution shows the variants and their counts. Fix with Transform > Format > Capitalize Each Word (Text.Proper) after Trim, or a Replace Values step; then the distinct count drops to the expected 4 cities.', level: 'Medium' },
    { q: 'How can you share data quality metrics with business users?', a: 'Create a query using Table.Profile (referencing the main table), load it, and build a data quality page; or use Dataflows/Fabric with similar logic so profiling runs on refresh.', level: 'Hard' },
  ],
  practice: [
    { task: 'Turn on all three profiling options and write down the Valid, Error and Empty % of every column in the Sales query.', hint: 'View tab > Data Preview group.', solution: 'Tick Column quality, Column distribution and Column profile. Read the bars under each header; switch to entire data set for final numbers.' },
    { task: 'For the Customer[City] column, report distinct and unique counts for values Pune, Mumbai, Pune, Nashik, Nagpur, Mumbai, Pune.', hint: 'Unique = appears exactly once.', solution: 'Distinct = 4 (Pune, Mumbai, Nashik, Nagpur). Unique = 2 (Nashik, Nagpur).' },
    { task: 'Build a profile query for the Product table that shows only Column, NullCount and DistinctCount.', hint: 'Table.Profile then Table.SelectColumns.', solution: 'let\n    Profile = Table.Profile(Product),\n    Kept = Table.SelectColumns(Profile, {"Column", "NullCount", "DistinctCount"})\nin\n    Kept' },
    { task: 'Use Column profile value distribution to filter Sales to only rows where Quantity equals its most frequent value.', hint: 'Right-click the tallest bar.', solution: 'Select Quantity, in the Column profile Value distribution right-click the tallest bar > Equals. This adds a Filtered Rows step; delete it after checking.' },
  ],
  quiz: [
    { question: 'Which tab holds Column quality, Column distribution and Column profile?', options: ['Home', 'Transform', 'View', 'Add Column'], answer: 2, explanation: 'They are on the View tab in the Data Preview group.' },
    { question: 'Values: 5, 5, 7, 8, 8, 9. Distinct and unique counts are:', options: ['4 and 2', '6 and 4', '4 and 4', '2 and 4'], answer: 0, explanation: 'Distinct values: 5, 7, 8, 9 (4). Values appearing once: 7 and 9 (2).' },
    { question: 'By default, profiling is based on:', options: ['The entire data set', 'The top 1000 rows', 'The top 100 rows', 'A random 10% sample'], answer: 1, explanation: 'Click the status bar text to switch to the entire data set.' },
    { question: 'What does the grey part of the Column quality bar represent?', options: ['Errors', 'Valid values', 'Empty values', 'Duplicates'], answer: 2, explanation: 'Green = valid, red = error, grey = empty.' },
    { question: 'Which M function returns statistics such as Min, Max, NullCount and DistinctCount for every column?', options: ['Table.Stats', 'Table.Profile', 'Table.Describe', 'Table.Schema'], answer: 1, explanation: 'Table.Profile returns one row per column with statistics. Table.Schema returns column metadata like types.' },
  ],
};
