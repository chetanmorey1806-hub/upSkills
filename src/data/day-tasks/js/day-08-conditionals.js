export default {
  lesson: 'day-08-conditionals',
  minutes: 25,
  intro: 'Write if/else chains in the right order, use guard clauses and switch with grouped cases.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'What is printed? (watch the order of the conditions)',
      code: `const marks = 95;
if (marks >= 40) {
  console.log("Pass");
} else if (marks >= 90) {
  console.log("Distinction");
} else {
  console.log("Fail");
}`,
      expected: 'Pass',
      explain: 'An else-if chain stops at the **first** true condition. 95 >= 40 is true, so "Distinction" is never reached. Always put the most specific (highest) condition first.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed? (switch without break)',
      code: `const day = 2;
switch (day) {
  case 1:
    console.log("Mon");
  case 2:
    console.log("Tue");
  case 3:
    console.log("Wed");
    break;
  default:
    console.log("Other");
}`,
      expected: 'Tue\nWed',
      explain: 'switch jumps to `case 2` and then **falls through** to the next cases until it meets a `break`. That is why "Wed" also prints. Forgetting `break` is the classic switch bug.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What kind of comparison does `switch` use to match cases?',
      options: ['== (loose)', '=== (strict)', '> (greater than)', 'It converts everything to strings'],
      answer: 1,
      explain: 'switch uses **strict** equality (`===`). So `switch ("2") { case 2: ... }` does NOT match because a string is not a number.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Grade calculator. Write `getGrade(marks)` that returns:\n- `"A"` for 90 and above\n- `"B"` for 75-89\n- `"C"` for 50-74\n- `"F"` below 50\n- `"Invalid"` if marks is below 0 or above 100 (check this first as a **guard clause**)',
      example: { title: 'guard clause + else if', code: 'function ticket(age) {\n  if (age < 0) return "Invalid";\n  if (age < 5) return "Free";\n  else if (age < 60) return "Full";\n  return "Senior";\n}' },
      starter: 'function getGrade(marks) {\n  // TODO\n}',
      solution: 'function getGrade(marks) {\n  if (marks < 0 || marks > 100) return "Invalid";\n  if (marks >= 90) return "A";\n  else if (marks >= 75) return "B";\n  else if (marks >= 50) return "C";\n  return "F";\n}',
      tests: [
        { call: 'getGrade(95)', expect: 'A' },
        { call: 'getGrade(90)', expect: 'A' },
        { call: 'getGrade(75)', expect: 'B' },
        { call: 'getGrade(60)', expect: 'C' },
        { call: 'getGrade(49)', expect: 'F' },
        { call: 'getGrade(105)', expect: 'Invalid' },
        { call: 'getGrade(-3)', expect: 'Invalid' },
      ],
      explain: 'A guard clause handles bad input early and returns, so the rest of the code stays flat. Then check from highest to lowest so each `>=` is reached only when the higher ones failed. Using `>` instead of `>=` would make exactly 90 a "B".',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `dayType(day)` using a **switch** with grouped cases. `day` is a lowercase short name like `"mon"`.\n- `"sat"` and `"sun"` → `"Weekend"`\n- `"mon"` to `"fri"` → `"Weekday"`\n- anything else → `"Invalid day"`',
      example: { title: 'grouped cases', code: 'switch (fruit) {\n  case "mango":\n  case "banana":\n    return "Sweet";\n  default:\n    return "Unknown";\n}' },
      starter: 'function dayType(day) {\n  switch (day) {\n    // TODO\n  }\n}',
      solution: 'function dayType(day) {\n  switch (day) {\n    case "sat":\n    case "sun":\n      return "Weekend";\n    case "mon":\n    case "tue":\n    case "wed":\n    case "thu":\n    case "fri":\n      return "Weekday";\n    default:\n      return "Invalid day";\n  }\n}',
      tests: [
        { call: 'dayType("sat")', expect: 'Weekend' },
        { call: 'dayType("sun")', expect: 'Weekend' },
        { call: 'dayType("wed")', expect: 'Weekday' },
        { call: 'dayType("fri")', expect: 'Weekday' },
        { call: 'dayType("xyz")', expect: 'Invalid day' },
      ],
      explain: 'Stacking several `case` labels on top of each other makes them share one block. `return` exits the function, so no `break` is needed after it. `default` catches every unmatched value.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Cinema ticket price. Write `ticketPrice(age, isStudent)`:\n- under 5 → `0`\n- age 60 or more → `100`\n- students (any other age) → `150`\n- everyone else → `250`',
      example: { title: 'combining conditions', code: 'if (age >= 18 && hasLicence) {\n  return "Can drive";\n}' },
      starter: 'function ticketPrice(age, isStudent) {\n  // TODO\n}',
      solution: 'function ticketPrice(age, isStudent) {\n  if (age < 5) return 0;\n  if (age >= 60) return 100;\n  if (isStudent) return 150;\n  return 250;\n}',
      tests: [
        { call: 'ticketPrice(3, false)', expect: 0 },
        { call: 'ticketPrice(65, true)', expect: 100 },
        { call: 'ticketPrice(20, true)', expect: 150 },
        { call: 'ticketPrice(30, false)', expect: 250 },
      ],
      explain: 'Order matters: the age rules are checked before the student rule, so a 65-year-old student pays the senior price. Early `return`s keep the logic easy to read instead of nesting if inside if.',
    },
  ],
};
