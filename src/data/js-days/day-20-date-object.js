export default {
  id: 'day-20-date-object',
  title: 'Date Object and Working with Dates',
  module: 'Module 3: Objects & Data Structures',
  day: 20,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'The Date object represents a single moment in time. Today you learn how to create dates, read and change their parts, do date arithmetic (age, days between, adding days), and format dates for users with toLocaleDateString and Intl.',
  objectives: [
    'Create dates with new Date(), timestamps, ISO strings and (year, monthIndex, day) arguments',
    'Read parts with getFullYear, getMonth (0-based!), getDate, getDay, getHours and set them with setX methods',
    'Calculate differences between dates using milliseconds',
    'Format dates with toISOString, toLocaleDateString and Intl.DateTimeFormat options',
    'Avoid common bugs: 0-based months, mutation, local time vs UTC',
  ],
  theory: [
    {
      heading: 'What is a Date?',
      content: "Internally a Date is just a **number**: the milliseconds since **1 January 1970 00:00:00 UTC** (called the **Unix epoch**). That number is called a **timestamp**.\n\nEverything else (year, month, weekday, formatted text) is calculated from that number, either in **local time** (the user's time zone) or **UTC** (universal time).\n\nAnalogy: the timestamp is like the total number of seconds on a stopwatch that started in 1970. Asking for the year or month is just converting that count into a calendar view.",
      syntax: `Date.now();            // current timestamp, e.g. 1731830400000
new Date();            // current date and time object
new Date(0);           // 1970-01-01T00:00:00.000Z (epoch)
new Date().getTime();  // timestamp of a Date object`,
    },
    {
      heading: 'Creating Dates',
      content: "There are four common ways:\n\n1. `new Date()` - now\n2. `new Date(milliseconds)` - from a timestamp\n3. `new Date('2024-03-15')` - from an **ISO string** (date-only ISO strings are treated as **UTC**; strings with a time but no `Z` are local)\n4. `new Date(year, monthIndex, day, hours, minutes, seconds)` - in **local time**\n\n**Months are 0-based**: January = 0, December = 11. Days of the month are 1-based. This is the #1 Date bug.\n\nAn invalid input gives an **Invalid Date**; `getTime()` returns `NaN`.",
      syntax: `new Date(2024, 0, 15);            // 15 January 2024, local time
new Date(2024, 11, 25, 18, 30);   // 25 December 2024, 6:30 PM
new Date('2024-01-15T10:00:00Z'); // ISO, Z = UTC
new Date(Date.UTC(2024, 0, 15));  // midnight UTC
isNaN(new Date('hello'));         // true -> Invalid Date`,
      tip: 'Avoid non-standard strings like "15/01/2024": different browsers may parse them differently. Use ISO format (YYYY-MM-DD) or numeric arguments.',
    },
    {
      heading: 'Getting and Setting Parts',
      content: "**Getters** (local time):\n- `getFullYear()` - 4-digit year\n- `getMonth()` - 0 to 11\n- `getDate()` - day of month, 1 to 31\n- `getDay()` - day of week, 0 (Sunday) to 6 (Saturday)\n- `getHours()`, `getMinutes()`, `getSeconds()`, `getMilliseconds()`\n\nEach has a UTC version: `getUTCFullYear()`, `getUTCHours()` and so on.\n\n**Setters** (`setFullYear`, `setMonth`, `setDate`, `setHours`...) **change the Date object in place** (they mutate). They also auto-correct overflow: `setDate(32)` in January rolls over to 1 February. That makes adding days easy.",
      syntax: `const d = new Date(2024, 0, 31);
d.getMonth();  // 0 (January)
d.getDay();    // 3 (Wednesday)
d.setDate(d.getDate() + 1); // 1 February 2024 (rolls over)
d.setMonth(11);             // December`,
      tip: 'Setters mutate. If you need the original, copy first: `const copy = new Date(original);`',
    },
    {
      heading: 'Date Arithmetic',
      content: "Subtracting two Dates converts them to numbers, giving the **difference in milliseconds**. Divide to convert:\n\n- seconds = ms / 1000\n- minutes = ms / (1000 * 60)\n- hours = ms / (1000 * 60 * 60)\n- days = ms / (1000 * 60 * 60 * 24)\n\nTo add time, either use setters (`setDate(getDate() + 7)`) or add milliseconds to the timestamp. To compare dates use `<`, `>` or compare `getTime()` values; never use `===` on two Date objects (they are different objects).",
      syntax: `const DAY = 24 * 60 * 60 * 1000;
const start = new Date(2024, 0, 1);
const end = new Date(2024, 2, 1);
Math.round((end - start) / DAY);   // 60 days (2024 is a leap year)
start < end;                       // true
start.getTime() === new Date(2024, 0, 1).getTime(); // true`,
    },
    {
      heading: 'Formatting Dates',
      content: "- `toISOString()` - `\"2024-01-15T00:00:00.000Z\"`, always UTC; best for storing/sending to APIs\n- `toString()` - long, browser-specific text\n- `toLocaleDateString(locale, options)` - human-friendly date in a language/region\n- `toLocaleTimeString(locale, options)` - human-friendly time\n- `Intl.DateTimeFormat(locale, options).format(date)` - reusable formatter (faster for many dates)\n\nUseful options: `weekday: 'long'`, `year: 'numeric'`, `month: 'long' | 'short' | '2-digit'`, `day: 'numeric' | '2-digit'`, `timeZone: 'UTC'`.\n\nFor manual formats like DD/MM/YYYY, read the parts and use `String(n).padStart(2, '0')`.",
      syntax: `const d = new Date(2024, 0, 15);
d.toLocaleDateString('en-IN');                 // '15/1/2024'
d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
// 'Monday, January 15, 2024'
const dd = String(d.getDate()).padStart(2, '0');
const mm = String(d.getMonth() + 1).padStart(2, '0');
dd + '/' + mm + '/' + d.getFullYear();         // '15/01/2024'`,
      tip: 'For heavy date work (time zones, recurring dates) teams use libraries like date-fns or Day.js; the new Temporal API is also coming to browsers.',
    },
  ],
  examples: [
    {
      title: 'Reading Date Parts (and the 0-based Month Trap)',
      scenario: 'Show the day, month name and weekday of Republic Day 2024 (26 January 2024).',
      steps: [
        'Create the date with new Date(2024, 0, 26)',
        'Read getFullYear, getMonth, getDate, getDay',
        'Map month and weekday numbers to names using arrays',
        'Show what happens if you wrongly pass 1 for January',
        'Run it',
      ],
      code: `const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const rd = new Date(2024, 0, 26);
console.log(rd.getFullYear(), rd.getMonth(), rd.getDate(), rd.getDay());
console.log(days[rd.getDay()] + ', ' + rd.getDate() + ' ' + months[rd.getMonth()]);

const wrong = new Date(2024, 1, 26); // 1 = February!
console.log(months[wrong.getMonth()]);`,
      playground: {
        js: `const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const rd = new Date(2024, 0, 26);
console.log(rd.getFullYear(), rd.getMonth(), rd.getDate(), rd.getDay());
console.log(days[rd.getDay()] + ', ' + rd.getDate() + ' ' + months[rd.getMonth()]);

const wrong = new Date(2024, 1, 26);
console.log(months[wrong.getMonth()]);`,
      },
      result: `2024 0 26 5
Friday, 26 Jan
Feb`,
      explanation: 'getMonth() returns 0 for January and getDay() returns 5 for Friday. Arrays indexed from 0 map neatly to names. Passing 1 as the month creates a February date, a very common bug.',
    },
    {
      title: 'Days Between Two Dates and Age Calculator',
      scenario: 'Count days left until an exam, and calculate a person\'s age on a given date (birthday may not have happened yet that year).',
      steps: [
        'Create today (fixed for repeatable output) and exam date',
        'Subtract and divide by milliseconds per day',
        'Write getAge(birth, onDate) that subtracts 1 if birthday not reached',
        'Test both functions',
        'Run it',
      ],
      code: `const DAY = 1000 * 60 * 60 * 24;
const today = new Date(2024, 2, 1);   // 1 Mar 2024
const exam = new Date(2024, 3, 15);   // 15 Apr 2024
console.log('Days left: ' + Math.round((exam - today) / DAY));

function getAge(birth, onDate = new Date()) {
  let age = onDate.getFullYear() - birth.getFullYear();
  const hadBirthday =
    onDate.getMonth() > birth.getMonth() ||
    (onDate.getMonth() === birth.getMonth() && onDate.getDate() >= birth.getDate());
  if (!hadBirthday) age--;
  return age;
}
console.log(getAge(new Date(2000, 5, 10), new Date(2024, 5, 9)));
console.log(getAge(new Date(2000, 5, 10), new Date(2024, 5, 10)));`,
      playground: {
        js: `const DAY = 1000 * 60 * 60 * 24;
const today = new Date(2024, 2, 1);
const exam = new Date(2024, 3, 15);
console.log('Days left: ' + Math.round((exam - today) / DAY));

function getAge(birth, onDate = new Date()) {
  let age = onDate.getFullYear() - birth.getFullYear();
  const hadBirthday =
    onDate.getMonth() > birth.getMonth() ||
    (onDate.getMonth() === birth.getMonth() && onDate.getDate() >= birth.getDate());
  if (!hadBirthday) age--;
  return age;
}
console.log(getAge(new Date(2000, 5, 10), new Date(2024, 5, 9)));
console.log(getAge(new Date(2000, 5, 10), new Date(2024, 5, 10)));
console.log('Your age today: ' + getAge(new Date(2000, 5, 10)));`,
      },
      result: `Days left: 45
23
24
Your age today: 26   (this last line uses the real current date; 26 when run on 17 Nov 2026)`,
      explanation: 'exam - today gives milliseconds; dividing by DAY gives 45 (30 remaining days of March + 15 of April). Math.round protects against 1-hour daylight-saving differences. The age function subtracts one year if the birthday has not happened yet in that year. The last line uses the real current date, so its value depends on when you run it.',
    },
    {
      title: 'Adding Days with Overflow (Due Date)',
      scenario: 'A library book is issued on 25 January 2024 for 14 days. Find the due date without mutating the issue date.',
      steps: [
        'Create issueDate',
        'Copy it with new Date(issueDate)',
        'Use setDate(getDate() + 14) to add days (rolls into February)',
        'Format both with toLocaleDateString',
        'Run it',
      ],
      code: `function addDays(date, n) {
  const copy = new Date(date);      // do not mutate the original
  copy.setDate(copy.getDate() + n); // overflow rolls over months/years
  return copy;
}
const issueDate = new Date(2024, 0, 25);
const due = addDays(issueDate, 14);
const opts = { day: 'numeric', month: 'short', year: 'numeric' };
console.log('Issued: ' + issueDate.toLocaleDateString('en-GB', opts));
console.log('Due:    ' + due.toLocaleDateString('en-GB', opts));
console.log(addDays(new Date(2024, 11, 31), 1).getFullYear());`,
      playground: {
        js: `function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}
const issueDate = new Date(2024, 0, 25);
const due = addDays(issueDate, 14);
const opts = { day: 'numeric', month: 'short', year: 'numeric' };
console.log('Issued: ' + issueDate.toLocaleDateString('en-GB', opts));
console.log('Due: ' + due.toLocaleDateString('en-GB', opts));
console.log(addDays(new Date(2024, 11, 31), 1).getFullYear());`,
      },
      result: `Issued: 25 Jan 2024
Due: 8 Feb 2024
2025`,
      explanation: '25 + 14 = 39, which does not exist in January (31 days), so JavaScript rolls over to 8 February. Adding 1 day to 31 December rolls to 1 January of the next year. Copying first keeps issueDate unchanged.',
    },
    {
      title: 'Formatting: ISO, Locale and Custom DD-MM-YYYY',
      scenario: 'Show one moment in formats needed by an API, a US user, an Indian user and an invoice.',
      steps: [
        'Create a fixed UTC moment',
        'Print toISOString (for APIs)',
        'Use toLocaleDateString with timeZone UTC for US and IN',
        'Build DD-MM-YYYY with padStart',
        'Run it',
      ],
      code: `const moment = new Date(Date.UTC(2024, 6, 5, 9, 30));
console.log(moment.toISOString());

const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
console.log(moment.toLocaleDateString('en-US', opts));
console.log(moment.toLocaleDateString('en-IN', opts));

const pad = n => String(n).padStart(2, '0');
console.log(pad(moment.getUTCDate()) + '-' + pad(moment.getUTCMonth() + 1) + '-' + moment.getUTCFullYear());`,
      playground: {
        js: `const moment = new Date(Date.UTC(2024, 6, 5, 9, 30));
console.log(moment.toISOString());

const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
console.log(moment.toLocaleDateString('en-US', opts));
console.log(moment.toLocaleDateString('en-IN', opts));

const pad = n => String(n).padStart(2, '0');
console.log(pad(moment.getUTCDate()) + '-' + pad(moment.getUTCMonth() + 1) + '-' + moment.getUTCFullYear());`,
      },
      result: `2024-07-05T09:30:00.000Z
Friday, July 5, 2024
Friday, 5 July 2024
05-07-2024`,
      explanation: 'toISOString is always UTC and sortable, ideal for databases and APIs. toLocaleDateString formats the same moment in each locale\'s style; timeZone: "UTC" makes the output the same for every student regardless of their time zone. padStart adds leading zeros, and +1 fixes the 0-based month.',
    },
  ],
  interview: [
    { q: 'How does JavaScript store a Date internally?', a: 'As a number: milliseconds since the Unix epoch (1 Jan 1970 00:00:00 UTC). getTime() or Date.now() returns that timestamp.', level: 'Easy' },
    { q: 'What is the output?\nconst d = new Date(2024, 1, 10);\nconsole.log(d.getMonth(), d.getDate());', a: '1 10. Month index 1 is February; getMonth returns the 0-based index 1, getDate returns the day of month 10.', level: 'Easy' },
    { q: 'Difference between getDate() and getDay()?', a: 'getDate() returns the day of the month (1-31). getDay() returns the day of the week (0 = Sunday ... 6 = Saturday).', level: 'Easy' },
    { q: 'What is the output?\nconst d = new Date(2024, 0, 31);\nd.setDate(d.getDate() + 1);\nconsole.log(d.getMonth(), d.getDate());', a: '1 1. 31 + 1 = 32 overflows January, so the date rolls over to 1 February (month index 1).', level: 'Medium' },
    { q: 'What is the output?\nconst a = new Date(2024, 0, 1);\nconst b = new Date(2024, 0, 1);\nconsole.log(a === b, a.getTime() === b.getTime(), a <= b);', a: 'false true true. === compares object references (different objects). Comparing timestamps is correct. Relational operators convert Dates to numbers.', level: 'Medium' },
    { q: 'How do you calculate the number of days between two dates?', a: 'Subtract them to get milliseconds and divide by 1000*60*60*24. Use Math.round (or work in UTC) to avoid daylight saving errors: Math.round((d2 - d1) / 86400000).', level: 'Medium' },
    { q: 'How do you detect an invalid date?', a: 'isNaN(date) or Number.isNaN(date.getTime()) returns true for an Invalid Date, e.g. new Date("hello").', level: 'Medium' },
    { q: 'Why is new Date("2024-03-15") sometimes shown as 14 March?', a: 'Date-only ISO strings are parsed as UTC midnight. In a time zone behind UTC (e.g. USA), local time is still 14 March evening, so local getters/toString show the 14th. Use new Date(2024, 2, 15) for a local date or use UTC methods.', level: 'Hard' },
    { q: 'Which method should you use to send a date to a server?', a: 'toISOString() (or JSON.stringify which uses it). It returns a standard UTC string like 2024-07-05T09:30:00.000Z that every language can parse.', level: 'Easy' },
    { q: 'What is the output?\nconsole.log(new Date(0).toISOString());\nconsole.log(typeof Date.now());', a: '1970-01-01T00:00:00.000Z then number. Timestamp 0 is the epoch; Date.now() returns a number, not a Date object.', level: 'Easy' },
    { q: 'Do Date setters return a new Date?', a: 'No. setDate, setMonth etc. mutate the existing Date and return the new timestamp (a number). Copy with new Date(original) first if you need to keep the original.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Print today\'s date in the format "Today is Monday, 15/01/2024" (use the real current date).',
      hint: 'Use a weekday names array, getDay, and padStart for day and month.',
      solution: `const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const now = new Date();
const pad = n => String(n).padStart(2, '0');
console.log('Today is ' + names[now.getDay()] + ', ' + pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear());`,
    },
    {
      task: 'Write daysUntilNewYear(fromDate) that returns how many days are left until the next 1 January.',
      hint: 'Create new Date(fromDate.getFullYear() + 1, 0, 1) and subtract.',
      solution: `function daysUntilNewYear(fromDate = new Date()) {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const ny = new Date(fromDate.getFullYear() + 1, 0, 1);
  return Math.round((ny - start) / 86400000);
}
console.log(daysUntilNewYear(new Date(2024, 11, 25))); // 7`,
    },
    {
      task: 'Write isWeekend(date) that returns true for Saturday or Sunday.',
      hint: 'getDay() is 0 for Sunday and 6 for Saturday.',
      solution: `function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
console.log(isWeekend(new Date(2024, 0, 13))); // true (Saturday)
console.log(isWeekend(new Date(2024, 0, 15))); // false (Monday)`,
    },
    {
      task: 'Write daysInMonth(year, monthIndex) that returns how many days a month has (handles leap years).',
      hint: 'Day 0 of the NEXT month is the last day of this month: new Date(year, monthIndex + 1, 0).getDate().',
      solution: `function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
console.log(daysInMonth(2024, 1)); // 29 (leap year February)
console.log(daysInMonth(2023, 1)); // 28
console.log(daysInMonth(2024, 3)); // 30 (April)`,
    },
    {
      task: 'Write timeAgo(past, now) that returns "just now" (< 60s), "X minutes ago", "X hours ago" or "X days ago".',
      hint: 'Compute the difference in seconds and check thresholds from smallest to largest.',
      solution: `function timeAgo(past, now = new Date()) {
  const sec = Math.floor((now - past) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + ' minutes ago';
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return hrs + ' hours ago';
  return Math.floor(hrs / 24) + ' days ago';
}
const now = new Date(2024, 0, 10, 12, 0);
console.log(timeAgo(new Date(2024, 0, 10, 11, 45), now)); // 15 minutes ago
console.log(timeAgo(new Date(2024, 0, 8, 12, 0), now));   // 2 days ago`,
    },
  ],
  quiz: [
    { question: 'What does `new Date(2024, 11, 25).getMonth()` return?', options: ['12', '11', '25', '0'], answer: 1, explanation: 'Months are 0-based, so December is 11.' },
    { question: 'What does getDay() return?', options: ['Day of the month 1-31', 'Number of days since epoch', 'Day of the week 0-6', 'Day of the year'], answer: 2, explanation: 'getDay returns 0 (Sunday) to 6 (Saturday).' },
    { question: 'What is `date2 - date1` for two Date objects?', options: ['Difference in milliseconds', 'Difference in days', 'NaN', 'A new Date'], answer: 0, explanation: 'Subtraction converts Dates to timestamps (ms).' },
    { question: 'Which format is best for storing dates in a database or API?', options: ['toString()', 'toLocaleDateString()', '"DD/MM/YYYY" strings', 'toISOString()'], answer: 3, explanation: 'ISO 8601 in UTC is standard, unambiguous and sortable.' },
    { question: 'What does `new Date(2024, 0, 32)` represent?', options: ['Invalid Date', '1 February 2024', '32 January 2024', 'It throws an error'], answer: 1, explanation: 'Out-of-range days roll over into the next month.' },
  ],
};
