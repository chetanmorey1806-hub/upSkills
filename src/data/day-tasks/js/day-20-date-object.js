export default {
  lesson: 'day-20-date-object',
  minutes: 30,
  intro: 'Create dates, read and change their parts, calculate differences and format dates like DD-MM-YYYY.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What date does `new Date(2025, 1, 10)` create?',
      options: ['1 October 2025', '10 January 2025', '10 February 2025', '2 October 2025'],
      answer: 2,
      explain: 'Months are **0-based** in JavaScript: 0 = January, 1 = February … 11 = December. So `(2025, 1, 10)` is **10 February 2025**. Days of the month (`getDate`) are 1-based as normal.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const d = new Date(2025, 0, 26); // Republic Day
console.log(d.getFullYear());
console.log(d.getMonth());
console.log(d.getDate());
console.log(d.getDay());`,
      expected: '2025\n0\n26\n0',
      explain: '`getMonth()` returns 0 for January. `getDate()` is the day of the month (26). `getDay()` is the **weekday**, 0 = Sunday … 6 = Saturday; 26 Jan 2025 was a Sunday. Mixing up getDate and getDay is a classic bug.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Dates overflow automatically. What is printed?',
      code: `const due = new Date(2025, 0, 30);
due.setDate(due.getDate() + 5);
console.log(due.getMonth() + 1, due.getDate());`,
      expected: '2 4',
      explain: '30 January + 5 days = 4 February. `setDate` with a value beyond the month length rolls over into the next month for you. Note `setDate` **changes** the original Date object.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `formatDMY(date)` that returns the date as **DD-MM-YYYY** with leading zeros, e.g. `new Date(2025, 2, 5)` → `"05-03-2025"`.',
      example: { title: 'padding parts', code: 'String(7).padStart(2, "0"); // "07"' },
      starter: 'function formatDMY(date) {\n  // TODO\n}',
      solution: 'function formatDMY(date) {\n  const dd = String(date.getDate()).padStart(2, "0");\n  const mm = String(date.getMonth() + 1).padStart(2, "0");\n  return `${dd}-${mm}-${date.getFullYear()}`;\n}',
      tests: [
        { call: 'formatDMY(new Date(2025, 2, 5))', expect: '05-03-2025' },
        { call: 'formatDMY(new Date(2024, 11, 25))', expect: '25-12-2024' },
      ],
      explain: 'Add 1 to `getMonth()` because it is 0-based, and pad day and month to two digits. Forgetting the `+ 1` makes every date show the previous month.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `daysBetween(a, b)` that returns the number of whole days from date `a` to date `b` (both created with `new Date(y, m, d)`). Use `getTime()` (milliseconds) and `Math.round`.',
      example: { title: 'milliseconds in a day', code: 'const ONE_DAY = 1000 * 60 * 60 * 24; // 86400000\nconst diffMs = later - earlier; // subtracting dates gives ms' },
      starter: 'function daysBetween(a, b) {\n  // TODO\n}',
      solution: 'function daysBetween(a, b) {\n  const ONE_DAY = 1000 * 60 * 60 * 24;\n  return Math.round((b.getTime() - a.getTime()) / ONE_DAY);\n}',
      tests: [
        { call: 'daysBetween(new Date(2025, 0, 1), new Date(2025, 0, 31))', expect: 30 },
        { call: 'daysBetween(new Date(2025, 1, 20), new Date(2025, 2, 5))', expect: 13 },
        { call: 'daysBetween(new Date(2024, 0, 1), new Date(2025, 0, 1))', expect: 366, msg: '2024 is a leap year' },
      ],
      explain: 'A Date is really a number of milliseconds, so subtracting two dates gives milliseconds; divide by 86,400,000 for days. `Math.round` protects you from daylight-saving hours in some countries making the result 29.96.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Age calculator. Write `ageOn(birth, today)` that returns the person\'s age in **complete years** on the date `today`. Subtract the years, then subtract 1 more if the birthday has not come yet this year.',
      example: { title: 'comparing month and day', code: 'const beforeBirthday =\n  today.getMonth() < birth.getMonth() ||\n  (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());' },
      starter: 'function ageOn(birth, today) {\n  // TODO\n}',
      solution: 'function ageOn(birth, today) {\n  let age = today.getFullYear() - birth.getFullYear();\n  const m = today.getMonth() - birth.getMonth();\n  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;\n  return age;\n}',
      tests: [
        { call: 'ageOn(new Date(2000, 5, 15), new Date(2025, 5, 15))', expect: 25, msg: 'On the birthday' },
        { call: 'ageOn(new Date(2000, 5, 15), new Date(2025, 5, 14))', expect: 24, msg: 'One day before the birthday' },
        { call: 'ageOn(new Date(2000, 5, 15), new Date(2025, 0, 1))', expect: 24 },
        { call: 'ageOn(new Date(2000, 5, 15), new Date(2025, 11, 31))', expect: 25 },
      ],
      explain: 'Only subtracting the years is wrong for anyone whose birthday is later in the year. Compare month first, and the day only when the months are equal.',
    },
  ],
};
