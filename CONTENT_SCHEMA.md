# Topic file schema

Each topic is ONE file: `src/data/<excel|powerbi>/NN-topic-id.js` (NN = 2-digit order, e.g. 01, 02).
It must be a plain ES module with a default export object. Use template literals / normal strings only.
NO imports, NO JSX. Must be valid JavaScript (check with `node --check` style: run `node -e "import('./file.js').then(m=>console.log(m.default.title))"`).

```js
export default {
  id: 'lookup-functions',            // unique kebab-case
  title: 'Lookup Functions (VLOOKUP, XLOOKUP, INDEX-MATCH)',
  level: 'Intermediate',             // 'Beginner' | 'Intermediate' | 'Advanced'
  day: 8,                            // suggested study day in the roadmap
  duration: '3 hours',               // suggested study time
  summary: 'One or two sentences on what this topic is and why it matters.',
  objectives: ['What the student will be able to do', '...'],   // 3-6 items
  theory: [                          // 5-9 sections, thorough, beginner-friendly
    {
      heading: 'What is VLOOKUP?',
      content: 'Paragraphs of explanation. Separate paragraphs with \n\n. Inline code with `backticks`. **bold** allowed.',
      points: ['optional bullet', 'optional bullet'],     // optional
      syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',  // optional
      tip: 'optional pro tip / common mistake',            // optional
    },
  ],
  examples: [                        // 4-7 worked examples
    {
      title: 'Find price of a product',
      scenario: 'What problem we are solving.',
      table: { headers: ['A: Product', 'B: Price'], rows: [['Pen', '10'], ['Book', '50']] },  // optional sample data
      code: '=VLOOKUP("Book", A2:B3, 2, FALSE)',   // formula / DAX / M / VBA / steps
      result: '50',                                 // optional
      explanation: 'Step-by-step why it works.',
    },
  ],
  interview: [                       // 10-15 real interview questions, mix of easy/medium/hard
    { q: 'Difference between VLOOKUP and XLOOKUP?', a: 'Detailed, accurate answer (can use \n\n and `code`).', level: 'Medium' },
  ],
  practice: [                        // 5-8 hands-on exercises
    { task: 'Exercise description incl. any sample data', hint: 'hint', solution: 'full solution with formula/steps' },
  ],
  quiz: [                            // exactly 6 MCQs
    { question: '...', options: ['a', 'b', 'c', 'd'], answer: 1, explanation: 'why' },   // answer = 0-based index
  ],
};
```

Rules:
- Accuracy matters: formulas/DAX/M must be correct for current Microsoft 365 Excel / Power BI Desktop.
- Write for students preparing for jobs/interviews: clear, practical, real business examples (sales, employees, inventory).
- Escape backticks inside template literals, or prefer single-quoted strings with \n. Avoid unescaped quotes breaking strings.
