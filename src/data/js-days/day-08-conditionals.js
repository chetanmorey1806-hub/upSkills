export default {
  id: 'day-08-conditionals',
  title: 'Conditionals: if/else, else if, switch',
  module: 'Module 1: JavaScript Basics',
  day: 8,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Programs must make decisions: show a discount, block a login, pick a grade. Learn if, if/else, else if chains, nested conditions, guard clauses and the switch statement, including fall-through and when to choose each.',
  objectives: [
    'Write if, if/else and else if chains with correct ordering',
    'Combine conditions with &&, || and use truthy/falsy checks safely',
    'Use guard clauses (early exits) to avoid deep nesting',
    'Write switch statements with break, default and grouped cases',
    'Choose between if/else, switch, ternary and lookup objects',
  ],
  theory: [
    {
      heading: 'if and if/else',
      content: 'An `if` statement runs a block of code **only when a condition is true**.\n\nAnalogy: "**If** it is raining, take an umbrella. **Else**, wear sunglasses." Exactly one of the two actions happens.\n\n- The condition goes in round brackets `( )`.\n- The code to run goes in curly braces `{ }`.\n- The condition does not have to be a boolean; it is converted using **truthy/falsy** rules (Day 5).',
      syntax: `const age = 17;
if (age >= 18) {
  console.log("You can vote");
} else {
  console.log("Too young to vote");
}`,
      tip: 'Always use braces, even for one line. if (x) doSomething(); works, but adding a second line later without braces is a classic bug.',
    },
    {
      heading: 'else if chains',
      content: 'When there are **more than two** possibilities, chain conditions with `else if`. JavaScript checks them **from top to bottom** and runs only the **first** block whose condition is true. The final `else` catches everything else.\n\n**Order matters!** Put the most specific / highest condition first. If you check `marks >= 40` before `marks >= 90`, a 95 would get the lower grade because the first true condition wins.',
      syntax: `const marks = 82;
if (marks >= 90) {
  console.log("A");
} else if (marks >= 75) {
  console.log("B");   // this runs
} else if (marks >= 40) {
  console.log("C");
} else {
  console.log("Fail");
}`,
    },
    {
      heading: 'Nested conditions and guard clauses',
      content: 'You can put an `if` inside another `if` (nesting). But deep nesting ("arrow code") is hard to read.\n\nA **guard clause** checks for the bad/special cases **first** and exits early (with `return` inside a function, Day 10). The main logic then stays flat.\n\nOften you can also **combine** nested ifs using `&&`.',
      syntax: `// Nested
if (user) {
  if (user.isActive) {
    console.log("Welcome");
  }
}

// Flattened with &&
if (user && user.isActive) {
  console.log("Welcome");
}

// Guard clauses inside a function
function checkout(cart) {
  if (cart.length === 0) return "Cart is empty";
  if (!cart.paid) return "Please pay first";
  return "Order placed";
}`,
    },
    {
      heading: 'The switch statement',
      content: '`switch` compares **one value** against many possible **exact matches**. It is cleaner than a long else if chain when you test the same variable for equality.\n\nHow it works:\n1. The expression in `switch ( )` is evaluated once.\n2. It is compared with each `case` using **strict equality (===)**.\n3. When a case matches, code runs **from that case downward** until a `break`.\n4. `default` runs if no case matches (like else).\n\n**Fall-through:** if you forget `break`, execution continues into the next case. Sometimes this is used on purpose to **group cases** that share code.',
      syntax: `const day = "sat";
switch (day) {
  case "sat":
  case "sun":
    console.log("Weekend");
    break;
  case "fri":
    console.log("Almost weekend");
    break;
  default:
    console.log("Weekday");
}`,
      tip: 'switch uses ===, so switch ("1") never matches case 1. Convert input to the right type first.',
    },
    {
      heading: 'Choosing the right tool',
      content: '- **if / else if**: ranges and complex conditions (`marks >= 75`, `a && b`).\n- **switch**: one variable compared with many fixed values (menu options, status codes, day names).\n- **Ternary**: choosing between two **values** in one line (Day 4).\n- **Lookup object**: mapping keys to values without any branching:\n\n`const prices = { tea: 10, coffee: 20 };`\n`const price = prices[item] ?? 0;`\n\nCommon mistakes:\n- Using `=` instead of `===` inside if: `if (x = 5)` assigns 5 and is always truthy.\n- Wrong order in else if chains.\n- Forgetting `break` in switch.\n- Writing `if (score)` when 0 is a valid score (0 is falsy).\n\nComing next (Day 9): loops, to repeat code.',
    },
  ],
  examples: [
    {
      title: 'Grade calculator with else if',
      scenario: 'A school portal converts marks into grades. Test several marks including the boundaries.',
      steps: [
        'Put test marks in an array',
        'For each mark, use an else if chain from highest to lowest',
        'Handle invalid marks (below 0 or above 100) first as a guard',
        'Click Run',
      ],
      code: `const allMarks = [95, 90, 76, 40, 12, 105];
for (const marks of allMarks) {
  let grade;
  if (marks < 0 || marks > 100) {
    grade = "Invalid";
  } else if (marks >= 90) {
    grade = "A+";
  } else if (marks >= 75) {
    grade = "A";
  } else if (marks >= 40) {
    grade = "Pass";
  } else {
    grade = "Fail";
  }
  console.log(marks, "->", grade);
}`,
      playground: {
        js: `const allMarks = [95, 90, 76, 40, 12, 105];
for (const marks of allMarks) {
  let grade;
  if (marks < 0 || marks > 100) {
    grade = "Invalid";
  } else if (marks >= 90) {
    grade = "A+";
  } else if (marks >= 75) {
    grade = "A";
  } else if (marks >= 40) {
    grade = "Pass";
  } else {
    grade = "Fail";
  }
  console.log(marks, "->", grade);
}`,
      },
      result: `95 -> A+
90 -> A+
76 -> A
40 -> Pass
12 -> Fail
105 -> Invalid`,
      explanation: 'The invalid check runs first so 105 never reaches the grading rules. Then conditions go from highest to lowest, and only the first true branch runs. Boundary values (90, 40) use >= so they belong to the higher grade.',
    },
    {
      title: 'Ticket price with nested conditions and logical operators',
      scenario: 'A cinema charges by age, with a weekend surcharge and a student discount. Compute the price for different customers.',
      steps: [
        'Write a function ticketPrice(age, isWeekend, isStudent) (functions are covered on Day 10; read it as a reusable block)',
        'Use else if for the base price by age',
        'Use separate ifs for the surcharge and discount',
        'Call it for several customers and log the results',
      ],
      code: `function ticketPrice(age, isWeekend, isStudent) {
  let price;
  if (age < 5) {
    price = 0;
  } else if (age < 18) {
    price = 120;
  } else if (age >= 60) {
    price = 100;
  } else {
    price = 200;
  }
  if (isWeekend && price > 0) price += 50;
  if (isStudent && age >= 18 && age < 60) price -= 40;
  return price;
}
console.log(ticketPrice(3, true, false));
console.log(ticketPrice(15, false, true));
console.log(ticketPrice(22, true, true));
console.log(ticketPrice(65, true, false));`,
      playground: {
        js: `function ticketPrice(age, isWeekend, isStudent) {
  let price;
  if (age < 5) {
    price = 0;
  } else if (age < 18) {
    price = 120;
  } else if (age >= 60) {
    price = 100;
  } else {
    price = 200;
  }
  if (isWeekend && price > 0) price += 50;
  if (isStudent && age >= 18 && age < 60) price -= 40;
  return price;
}
console.log(ticketPrice(3, true, false));
console.log(ticketPrice(15, false, true));
console.log(ticketPrice(22, true, true));
console.log(ticketPrice(65, true, false));`,
      },
      result: `0
120
210
150`,
      explanation: 'Age 3: free, and the weekend surcharge is skipped because price > 0 is false. Age 15: child price 120; student discount applies only to adults. Age 22 on a weekend as a student: 200 + 50 - 40 = 210. Age 65 on a weekend: 100 + 50 = 150. Independent rules use separate if statements, not else if.',
    },
    {
      title: 'switch with grouped cases and default',
      scenario: 'A food delivery app shows a message for each order status. Some statuses share the same message.',
      steps: [
        'Loop over a list of statuses',
        'Use switch with case, break and default',
        'Group "shipped" and "out_for_delivery" together using fall-through',
        'Click Run',
      ],
      code: `const statuses = ["placed", "shipped", "out_for_delivery", "delivered", "lost"];
for (const status of statuses) {
  let msg;
  switch (status) {
    case "placed":
      msg = "We received your order";
      break;
    case "shipped":
    case "out_for_delivery":
      msg = "Your food is on the way";
      break;
    case "delivered":
      msg = "Enjoy your meal!";
      break;
    default:
      msg = "Unknown status, contact support";
  }
  console.log(status + ": " + msg);
}`,
      playground: {
        js: `const statuses = ["placed", "shipped", "out_for_delivery", "delivered", "lost"];
for (const status of statuses) {
  let msg;
  switch (status) {
    case "placed":
      msg = "We received your order";
      break;
    case "shipped":
    case "out_for_delivery":
      msg = "Your food is on the way";
      break;
    case "delivered":
      msg = "Enjoy your meal!";
      break;
    default:
      msg = "Unknown status, contact support";
  }
  console.log(status + ": " + msg);
}`,
      },
      result: `placed: We received your order
shipped: Your food is on the way
out_for_delivery: Your food is on the way
delivered: Enjoy your meal!
lost: Unknown status, contact support`,
      explanation: '"shipped" has no code and no break, so it falls through into "out_for_delivery" and shares its message. Each other case ends with break so execution stops. "lost" matches nothing, so default runs.',
    },
    {
      title: 'Forgotten break and switch(true)',
      scenario: 'See the bug a missing break causes, and a pattern sometimes used for ranges: switch (true).',
      steps: [
        'Write a switch with a missing break and run it',
        'Write switch (true) where each case is a condition',
        'Compare the outputs',
      ],
      code: `const level = 2;
switch (level) {
  case 1:
    console.log("Level 1 perks");
  case 2:
    console.log("Level 2 perks");
  case 3:
    console.log("Level 3 perks");
    break;
  default:
    console.log("No perks");
}

const temp = 31;
switch (true) {
  case temp >= 35:
    console.log("Very hot");
    break;
  case temp >= 25:
    console.log("Warm");
    break;
  default:
    console.log("Cool");
}`,
      playground: {
        js: `const level = 2;
switch (level) {
  case 1:
    console.log("Level 1 perks");
  case 2:
    console.log("Level 2 perks");
  case 3:
    console.log("Level 3 perks");
    break;
  default:
    console.log("No perks");
}

const temp = 31;
switch (true) {
  case temp >= 35:
    console.log("Very hot");
    break;
  case temp >= 25:
    console.log("Warm");
    break;
  default:
    console.log("Cool");
}`,
      },
      result: `Level 2 perks
Level 3 perks
Warm`,
      explanation: 'level 2 matches case 2, but there is no break, so execution falls through into case 3 and only stops at its break. In switch (true), each case expression is evaluated and compared with true; the first true one runs. It works, but an else if chain is usually clearer for ranges.',
    },
  ],
  interview: [
    { q: 'What is the difference between if/else and switch?', a: 'if/else can test any condition (ranges, combined logic). switch compares a single expression with multiple values using strict equality and is cleaner for many exact-value cases. switch needs break to avoid fall-through.', level: 'Easy' },
    { q: 'What is fall-through in a switch statement?', a: 'When a matching case has no break, execution continues into the following case(s) until a break or the end of the switch. It can be used intentionally to group cases, but forgetting break is a common bug.', level: 'Easy' },
    { q: 'Does switch use == or ===?', a: 'Strict equality (===). So switch ("5") does not match case 5.', level: 'Medium' },
    { q: 'What is a guard clause?', a: 'An early check at the start of a function that handles invalid or special cases and returns immediately. It avoids deep nesting and keeps the main logic flat and readable.', level: 'Medium' },
    { q: 'Why does the order of else if conditions matter?', a: 'Conditions are checked top to bottom and only the first true branch runs. If a broad condition (marks >= 40) comes before a narrow one (marks >= 90), the narrow branch is never reached.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconst x = 0;\nif (x) {\n  console.log("truthy");\n} else {\n  console.log("falsy");\n}', a: 'falsy. 0 is a falsy value.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nlet n = 10;\nif (n = 5) {\n  console.log("five", n);\n}', a: 'five 5. n = 5 is an assignment, not a comparison. It sets n to 5 and the expression\'s value 5 is truthy, so the block runs. Use === to compare.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nswitch (3) {\n  case 1: console.log("one");\n  case 3: console.log("three");\n  case 4: console.log("four");\n  default: console.log("default");\n}', a: 'It prints:\nthree\nfour\ndefault\nCase 3 matches and there are no breaks, so it falls through all remaining cases including default.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst v = "2";\nswitch (v) {\n  case 2: console.log("number"); break;\n  case "2": console.log("string"); break;\n}', a: 'string. switch compares with ===, so "2" matches only case "2".', level: 'Medium' },
    { q: 'How can you replace a long switch that maps values to values?', a: 'With a lookup object (or Map): const labels = { A: "Excellent", B: "Good" }; const label = labels[grade] ?? "Unknown";. It is shorter, data-driven and easy to extend.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write code that prints whether a number is positive, negative or zero. Test with 7, -3 and 0.',
      hint: 'Use if / else if / else.',
      solution: `for (const n of [7, -3, 0]) {
  if (n > 0) {
    console.log(n, "is positive");
  } else if (n < 0) {
    console.log(n, "is negative");
  } else {
    console.log(n, "is zero");
  }
}`,
    },
    {
      task: 'FizzBuzz for a single number: print "FizzBuzz" if divisible by 3 and 5, "Fizz" if by 3, "Buzz" if by 5, else the number. Test 15, 9, 10, 7.',
      hint: 'Check the combined case (15) first.',
      solution: `for (const n of [15, 9, 10, 7]) {
  if (n % 15 === 0) console.log("FizzBuzz");
  else if (n % 3 === 0) console.log("Fizz");
  else if (n % 5 === 0) console.log("Buzz");
  else console.log(n);
}`,
    },
    {
      task: 'Using switch, print the number of days in a month given a month number 1-12 (ignore leap years). Group months with 31 days and months with 30 days.',
      hint: 'case 1: case 3: case 5: ... share one block.',
      solution: `const month = 4;
let days;
switch (month) {
  case 1: case 3: case 5: case 7: case 8: case 10: case 12:
    days = 31;
    break;
  case 4: case 6: case 9: case 11:
    days = 30;
    break;
  case 2:
    days = 28;
    break;
  default:
    days = "Invalid month";
}
console.log(days); // 30`,
    },
    {
      task: 'Write a function getBmiCategory(bmi) that returns "Underweight" (< 18.5), "Normal" (< 25), "Overweight" (< 30) or "Obese". Use guard clauses for invalid input (not a number or <= 0).',
      hint: 'Return early in each branch.',
      solution: `function getBmiCategory(bmi) {
  if (typeof bmi !== "number" || Number.isNaN(bmi) || bmi <= 0) return "Invalid";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
console.log(getBmiCategory(22.4)); // Normal
console.log(getBmiCategory(-1));   // Invalid`,
    },
    {
      task: 'Rewrite this switch as a lookup object: switch(code){case "IN": name="India"; break; case "US": name="United States"; break; default: name="Unknown";}',
      hint: 'const countries = { IN: "India", US: "United States" };',
      solution: `const countries = { IN: "India", US: "United States" };
const code = "IN";
const name = countries[code] ?? "Unknown";
console.log(name); // India`,
    },
  ],
  quiz: [
    { question: 'In an else if chain, how many blocks run at most?', options: ['All true ones', 'Exactly two', 'Only the first true one', 'The last true one'], answer: 2, explanation: 'Once a condition is true its block runs and the rest of the chain is skipped.' },
    { question: 'What happens if you forget break in a switch case?', options: ['SyntaxError', 'Execution falls through to the next case', 'The switch restarts', 'default runs only'], answer: 1, explanation: 'Without break, code continues into the next case.' },
    { question: 'Which keyword handles "no case matched" in a switch?', options: ['default', 'else', 'otherwise', 'finally'], answer: 0, explanation: 'default runs when no case matches.' },
    { question: 'const s = "10"; switch (s) { case 10: ... } Will case 10 match?', options: ['Yes, values are equal', 'Only in strict mode', 'It throws a TypeError', 'No, switch uses strict equality'], answer: 3, explanation: '"10" === 10 is false.' },
    { question: 'What is wrong with if (age = 18)?', options: ['Nothing', 'It assigns 18 instead of comparing', 'It throws SyntaxError', 'It compares loosely'], answer: 1, explanation: 'A single = is assignment; the condition is always truthy.' },
  ],
};
