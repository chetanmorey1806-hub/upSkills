// Code puzzles for practice: parsons (arrange lines), output (predict output), bug (find the wrong line).
// Python and JavaScript puzzles were verified by running them; Java puzzles were hand-traced.

export const PUZZLES = [
  {
    id: "py-parsons-sum-evens",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Loops",
    title: "Sum of even numbers",
    prompt: "Arrange the lines so the program prints the sum of even numbers from 1 to 10.",
    lines: [
      "total = 0",
      "for i in range(1, 11):",
      "    if i % 2 == 0:",
      "        total += i",
      "print(total)",
    ],
    output: "30",
    explanation: "First create total = 0, then loop from 1 to 10. Inside the loop, check if the number is even and add it. Print only after the loop ends: 2 + 4 + 6 + 8 + 10 = 30.",
  },
  {
    id: "py-parsons-swap",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Swap two variables",
    prompt: "Arrange the lines so the program swaps a and b and prints \"9 5\".",
    lines: [
      "a = 5",
      "b = a + 4",
      "a, b = b, a",
      "print(a, b)",
    ],
    output: "9 5",
    explanation: "a must exist before b = a + 4 can use it (b becomes 9). Then a, b = b, a swaps both values in one step, so we print 9 5.",
  },
  {
    id: "py-parsons-reverse-func",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Strings",
    title: "Reverse a string",
    prompt: "Arrange the lines to build a function that reverses a word, then print the reverse of \"python\".",
    lines: [
      "def reverse(s):",
      "    rev = \"\"",
      "    for ch in s:",
      "        rev = ch + rev",
      "    return rev",
      "print(reverse(\"python\"))",
    ],
    output: "nohtyp",
    explanation: "Start with an empty string. Adding each new character in FRONT of rev reverses the word. Return after the loop, and call the function outside it.",
  },
  {
    id: "py-parsons-grade",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Conditions",
    title: "Grade from marks",
    prompt: "Arrange the lines so the program prints the grade for 72 marks (80+ is A, 60+ is B, else C).",
    lines: [
      "marks = 72",
      "if marks >= 80:",
      "    print(\"A\")",
      "elif marks >= 60:",
      "    print(\"B\")",
      "else:",
      "    print(\"C\")",
    ],
    output: "B",
    explanation: "Conditions are checked from top to bottom: if, then elif, then else. 72 is not >= 80 but it is >= 60, so B is printed.",
  },
  {
    id: "py-parsons-count-vowels",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Strings",
    title: "Count vowels",
    prompt: "Arrange the lines so the function counts the vowels in \"education\".",
    lines: [
      "def count_vowels(s):",
      "    count = 0",
      "    for ch in s:",
      "        if ch in \"aeiou\":",
      "            count += 1",
      "    return count",
      "print(count_vowels(\"education\"))",
    ],
    output: "5",
    explanation: "The counter starts at 0, the loop checks every character, and count increases only for vowels. \"education\" has e, u, a, i, o = 5 vowels.",
  },
  {
    id: "py-parsons-max-list",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Lists/Arrays",
    title: "Largest number in a list",
    prompt: "Arrange the lines to find the largest number in the list without using max().",
    lines: [
      "nums = [4, 17, 9, 23, 11]",
      "biggest = nums[0]",
      "for n in nums:",
      "    if n > biggest:",
      "        biggest = n",
      "print(biggest)",
    ],
    output: "23",
    explanation: "Assume the first number is the biggest, then compare every number with it. Whenever a bigger number appears, update biggest. Print after the loop.",
  },
  {
    id: "py-parsons-word-freq",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Word frequency",
    prompt: "Arrange the lines to count how many times each word appears.",
    lines: [
      "words = [\"a\", \"b\", \"a\", \"c\", \"a\"]",
      "freq = {}",
      "for w in words:",
      "    freq[w] = freq.get(w, 0) + 1",
      "print(freq)",
    ],
    output: "{'a': 3, 'b': 1, 'c': 1}",
    explanation: "freq.get(w, 0) returns the current count (or 0 if the word is new). Adding 1 and storing it back counts every word. Dictionaries keep insertion order.",
  },
  {
    id: "py-parsons-factorial",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Recursion",
    title: "Factorial with recursion",
    prompt: "Arrange the lines to define a recursive factorial function and print 5!.",
    lines: [
      "def fact(n):",
      "    if n <= 1:",
      "        return 1",
      "    return n * fact(n - 1)",
      "print(fact(5))",
    ],
    output: "120",
    explanation: "Every recursive function needs a base case (n <= 1 returns 1) that stops the calls. Then n * fact(n - 1) breaks the problem into a smaller one: 5*4*3*2*1 = 120.",
  },
  {
    id: "py-parsons-student-class",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "OOP/Classes",
    title: "Student class",
    prompt: "Arrange the lines to create a Student class and check if Ravi passed (pass mark is 40).",
    lines: [
      "class Student:",
      "    def __init__(self, name, marks):",
      "        self.name = name",
      "        self.marks = marks",
      "    def is_pass(self):",
      "        return self.marks >= 40",
      "s = Student(\"Ravi\", 55)",
      "print(s.name, s.is_pass())",
    ],
    output: "Ravi True",
    explanation: "__init__ stores the data on self. is_pass is another method inside the class. The object is created only after the class is fully defined.",
  },
  {
    id: "py-parsons-try-except",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Exceptions",
    title: "Safe number conversion",
    prompt: "Arrange the lines so the program handles a bad number and always prints \"Done\".",
    lines: [
      "try:",
      "    x = int(\"12a\")",
      "    print(\"Number:\", x)",
      "except ValueError:",
      "    print(\"Not a valid number\")",
      "finally:",
      "    print(\"Done\")",
    ],
    output: "Not a valid number\nDone",
    explanation: "int(\"12a\") raises ValueError, so the line after it is skipped and the except block runs. The finally block always runs at the end.",
  },
  {
    id: "py-parsons-bubble-sort",
    type: "parsons",
    lang: "python",
    level: "Hard",
    topic: "Sorting & Searching",
    title: "Bubble sort",
    prompt: "Arrange the lines to sort the list in ascending order using bubble sort.",
    lines: [
      "nums = [5, 2, 9, 1]",
      "n = len(nums)",
      "for i in range(n):",
      "    for j in range(n - 1 - i):",
      "        if nums[j] > nums[j + 1]:",
      "            nums[j], nums[j + 1] = nums[j + 1], nums[j]",
      "print(nums)",
    ],
    output: "[1, 2, 5, 9]",
    explanation: "The outer loop runs n passes. The inner loop compares neighbours and swaps them if they are in the wrong order. After each pass the largest value \"bubbles\" to the end.",
  },
  {
    id: "py-parsons-fibonacci",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Loops",
    title: "Fibonacci list",
    prompt: "Arrange the lines to build the first 8 Fibonacci numbers.",
    lines: [
      "fib = [0, 1]",
      "while len(fib) < 8:",
      "    fib.append(fib[-1] + fib[-2])",
      "print(fib)",
    ],
    output: "[0, 1, 1, 2, 3, 5, 8, 13]",
    explanation: "Start with [0, 1]. Each new number is the sum of the last two (fib[-1] + fib[-2]). The while loop stops when the list has 8 numbers.",
  },
  {
    id: "py-parsons-list-comp",
    type: "parsons",
    lang: "python",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Squares of odd numbers",
    prompt: "Arrange the lines to make a list of squares of odd numbers and print it with their sum.",
    lines: [
      "nums = [1, 2, 3, 4, 5, 6]",
      "squares = [n * n for n in nums if n % 2 == 1]",
      "total = sum(squares)",
      "print(squares, total)",
    ],
    output: "[1, 9, 25] 35",
    explanation: "The list comprehension keeps only odd numbers (1, 3, 5) and squares them. sum() needs the list to exist first, and print comes last.",
  },
  {
    id: "py-parsons-default-arg",
    type: "parsons",
    lang: "python",
    level: "Easy",
    topic: "Functions",
    title: "Greeting with default value",
    prompt: "Arrange the lines so the function uses \"Hello\" when no greeting is given.",
    lines: [
      "def greet(name, greeting=\"Hello\"):",
      "    return greeting + \", \" + name + \"!\"",
      "print(greet(\"Asha\"))",
      "print(greet(\"Vikram\", \"Namaste\"))",
    ],
    output: "Hello, Asha!\nNamaste, Vikram!",
    explanation: "The function must be defined before it is called. The first call uses the default \"Hello\"; the second call passes \"Namaste\" which replaces the default.",
  },
  {
    id: "py-parsons-digit-sum",
    type: "parsons",
    lang: "python",
    level: "Hard",
    topic: "Recursion",
    title: "Sum of digits (recursive)",
    prompt: "Arrange the lines to add all digits of 4729 using recursion.",
    lines: [
      "def digit_sum(n):",
      "    if n < 10:",
      "        return n",
      "    return n % 10 + digit_sum(n // 10)",
      "print(digit_sum(4729))",
    ],
    output: "22",
    explanation: "n % 10 gives the last digit and n // 10 removes it. The base case is a single digit (n < 10). 9 + 2 + 7 + 4 = 22.",
  },
  {
    id: "js-parsons-sum-array",
    type: "parsons",
    lang: "javascript",
    level: "Easy",
    topic: "Lists/Arrays",
    title: "Total marks",
    prompt: "Arrange the lines to add all marks in the array and print the total.",
    lines: [
      "const marks = [45, 78, 62, 90];",
      "let total = 0;",
      "for (const m of marks) {",
      "  total += m;",
      "}",
      "console.log(total);",
    ],
    output: "275",
    explanation: "Create total before the loop. for...of gives each value of the array. Close the loop with } and print after it: 45 + 78 + 62 + 90 = 275.",
  },
  {
    id: "js-parsons-even-odd",
    type: "parsons",
    lang: "javascript",
    level: "Easy",
    topic: "Conditions",
    title: "Even or odd",
    prompt: "Arrange the lines to print whether 7 is Even or Odd.",
    lines: [
      "const n = 7;",
      "if (n % 2 === 0) {",
      "  console.log('Even');",
      "} else {",
      "  console.log('Odd');",
      "}",
    ],
    output: "Odd",
    explanation: "n % 2 gives the remainder after dividing by 2. 7 % 2 is 1, so the else block runs and prints Odd.",
  },
  {
    id: "js-parsons-reverse-word",
    type: "parsons",
    lang: "javascript",
    level: "Easy",
    topic: "Strings",
    title: "Reverse a word",
    prompt: "Arrange the lines to reverse the word \"hello\".",
    lines: [
      "const word = 'hello';",
      "const letters = word.split('');",
      "letters.reverse();",
      "const result = letters.join('');",
      "console.log(result);",
    ],
    output: "olleh",
    explanation: "split('') turns the string into an array of letters, reverse() flips the array, and join('') turns it back into a string.",
  },
  {
    id: "js-parsons-map-square",
    type: "parsons",
    lang: "javascript",
    level: "Easy",
    topic: "Functions",
    title: "Square every number",
    prompt: "Arrange the lines to square each number using an arrow function and map().",
    lines: [
      "const square = (x) => x * x;",
      "const nums = [1, 2, 3, 4];",
      "const result = nums.map(square);",
      "console.log(result.join(', '));",
    ],
    output: "1, 4, 9, 16",
    explanation: "The function and the array must exist before map() uses them. map() calls square on every item and returns a new array.",
  },
  {
    id: "js-parsons-object-total",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Total price from object",
    prompt: "Arrange the lines to add all prices stored in an object.",
    lines: [
      "const prices = { pen: 10, book: 50, bag: 300 };",
      "let total = 0;",
      "for (const item in prices) {",
      "  total += prices[item];",
      "}",
      "console.log('Total: ' + total);",
    ],
    output: "Total: 360",
    explanation: "for...in loops over the KEYS of an object (pen, book, bag). prices[item] gives the value for each key.",
  },
  {
    id: "js-parsons-counter-closure",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "Closures & Scope",
    title: "Counter with closure",
    prompt: "Arrange the lines to build a counter using a closure. The counter is called twice.",
    lines: [
      "function makeCounter() {",
      "  let count = 0;",
      "  return function () {",
      "    count++;",
      "    return count;",
      "  };",
      "}",
      "const counter = makeCounter();",
      "counter();",
      "console.log(counter());",
    ],
    output: "2",
    explanation: "The inner function \"remembers\" count even after makeCounter finishes - this is a closure. The first call makes count 1, the second call (inside console.log) makes it 2.",
  },
  {
    id: "js-parsons-async-wait",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "Async/Promises",
    title: "Wait with async/await",
    prompt: "Arrange the lines so the program prints \"Waiting...\" and then \"Done!\" after a short delay.",
    lines: [
      "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
      "async function main() {",
      "  console.log('Waiting...');",
      "  await wait(100);",
      "  console.log('Done!');",
      "}",
      "main();",
    ],
    output: "Waiting...\nDone!",
    explanation: "wait() returns a Promise that resolves after ms milliseconds. Inside an async function, await pauses until the Promise resolves. main() must be called after it is defined.",
  },
  {
    id: "js-parsons-json-try",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "Exceptions",
    title: "Handle bad JSON",
    prompt: "Arrange the lines so invalid JSON is handled and a final message is always printed.",
    lines: [
      "try {",
      "  const data = JSON.parse('{bad json}');",
      "  console.log(data);",
      "} catch (err) {",
      "  console.log('Invalid JSON');",
      "} finally {",
      "  console.log('Parsing finished');",
      "}",
    ],
    output: "Invalid JSON\nParsing finished",
    explanation: "JSON.parse throws an error for invalid text, so control jumps to catch. finally always runs, error or no error.",
  },
  {
    id: "js-parsons-rectangle-class",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "OOP/Classes",
    title: "Rectangle class",
    prompt: "Arrange the lines to create a Rectangle class and print the area of a 4 x 5 rectangle.",
    lines: [
      "class Rectangle {",
      "  constructor(w, h) {",
      "    this.w = w;",
      "    this.h = h;",
      "  }",
      "  area() { return this.w * this.h; }",
      "}",
      "const r = new Rectangle(4, 5);",
      "console.log(r.area());",
    ],
    output: "20",
    explanation: "The constructor saves width and height on this. area() is a method inside the class body. Objects are created with new only after the class is defined.",
  },
  {
    id: "js-parsons-average-adults",
    type: "parsons",
    lang: "javascript",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Average age of adults",
    prompt: "Arrange the lines to find the average age of people who are 18 or older.",
    lines: [
      "const ages = [12, 25, 17, 30, 15];",
      "const adults = ages.filter((a) => a >= 18);",
      "const sum = adults.reduce((acc, a) => acc + a, 0);",
      "const avg = sum / adults.length;",
      "console.log(avg);",
    ],
    output: "27.5",
    explanation: "filter keeps 25 and 30. reduce adds them to get 55. Dividing by the count (2) gives 27.5. Each line uses the result of the line before it.",
  },
  {
    id: "js-parsons-power-recursion",
    type: "parsons",
    lang: "javascript",
    level: "Hard",
    topic: "Recursion",
    title: "Power with recursion",
    prompt: "Arrange the lines to calculate 2 to the power 5 using recursion.",
    lines: [
      "function power(base, exp) {",
      "  if (exp === 0) {",
      "    return 1;",
      "  }",
      "  return base * power(base, exp - 1);",
      "}",
      "console.log(power(2, 5));",
    ],
    output: "32",
    explanation: "The base case is exp === 0 (anything to the power 0 is 1). Each call multiplies base once and reduces exp by 1: 2*2*2*2*2 = 32.",
  },
  {
    id: "js-parsons-sort-students",
    type: "parsons",
    lang: "javascript",
    level: "Hard",
    topic: "Sorting & Searching",
    title: "Rank students by marks",
    prompt: "Arrange the lines to sort students by marks (highest first) and print their names.",
    lines: [
      "const students = [{ name: 'Riya', marks: 82 }, { name: 'Aman', marks: 91 }, { name: 'Karan', marks: 76 }];",
      "students.sort((a, b) => b.marks - a.marks);",
      "const names = students.map((s) => s.name);",
      "console.log(names.join(' > '));",
    ],
    output: "Aman > Riya > Karan",
    explanation: "b.marks - a.marks sorts in descending order. The names must be taken AFTER sorting, otherwise they stay in the original order.",
  },
  {
    id: "java-parsons-print-loop",
    type: "parsons",
    lang: "java",
    level: "Easy",
    topic: "Loops",
    title: "Print three lines",
    prompt: "Arrange the lines to print \"Line 1\", \"Line 2\" and \"Line 3\" using a for loop.",
    lines: [
      "public class Main {",
      "    public static void main(String[] args) {",
      "        for (int i = 1; i <= 3; i++) {",
      "            System.out.println(\"Line \" + i);",
      "        }",
      "    }",
      "}",
    ],
    output: "Line 1\nLine 2\nLine 3",
    explanation: "Java code lives inside a class, and execution starts at main. The loop runs for i = 1, 2, 3. Each opening { needs its matching } in reverse order.",
  },
  {
    id: "java-parsons-max-array",
    type: "parsons",
    lang: "java",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Largest value in array",
    prompt: "Arrange the lines to print the largest number in the array.",
    lines: [
      "public class Main {",
      "    public static void main(String[] args) {",
      "        int[] nums = {3, 8, 1, 6};",
      "        int max = nums[0];",
      "        for (int n : nums) if (n > max) max = n;",
      "        System.out.println(max);",
      "    }",
      "}",
    ],
    output: "8",
    explanation: "Start with the first element as max, then the for-each loop updates max whenever a bigger number is found. Print after the loop.",
  },
  {
    id: "java-parsons-reverse-upper",
    type: "parsons",
    lang: "java",
    level: "Medium",
    topic: "Strings",
    title: "Reverse and uppercase",
    prompt: "Arrange the lines to reverse \"java\" and print it in capital letters.",
    lines: [
      "public class Main {",
      "    public static void main(String[] args) {",
      "        String name = \"java\";",
      "        StringBuilder sb = new StringBuilder(name);",
      "        sb.reverse();",
      "        System.out.println(sb.toString().toUpperCase());",
      "    }",
      "}",
    ],
    output: "AVAJ",
    explanation: "Strings in Java cannot change, so we use StringBuilder, which has reverse(). toString() converts it back to a String and toUpperCase() makes it AVAJ.",
  },
  {
    id: "sql-parsons-high-salary",
    type: "parsons",
    lang: "sql",
    level: "Easy",
    topic: "SQL Queries",
    title: "High salary employees",
    prompt: "Arrange the clauses to list employees earning more than 50000, highest salary first.",
    lines: [
      "SELECT name, salary",
      "FROM employees",
      "WHERE salary > 50000",
      "ORDER BY salary DESC;",
    ],
    output: "Names and salaries of employees earning more than 50000, highest salary first",
    explanation: "SQL clause order is fixed: SELECT, FROM, WHERE, ORDER BY. WHERE filters rows before they are sorted.",
  },
  {
    id: "sql-parsons-group-count",
    type: "parsons",
    lang: "sql",
    level: "Medium",
    topic: "SQL Queries",
    title: "Count per department",
    prompt: "Arrange the clauses to show departments that have more than 5 employees, biggest first.",
    lines: [
      "SELECT department, COUNT(*) AS total",
      "FROM employees",
      "GROUP BY department",
      "HAVING COUNT(*) > 5",
      "ORDER BY total DESC;",
    ],
    output: "Each department with more than 5 employees and its employee count, largest first",
    explanation: "GROUP BY makes one row per department. HAVING filters groups (WHERE cannot use COUNT). ORDER BY always comes last.",
  },
  {
    id: "sql-parsons-join",
    type: "parsons",
    lang: "sql",
    level: "Medium",
    topic: "SQL Queries",
    title: "Orders with customer names",
    prompt: "Arrange the clauses to show order id and customer name for orders above 1000.",
    lines: [
      "SELECT o.id, c.name",
      "FROM orders o",
      "JOIN customers c",
      "ON o.customer_id = c.id",
      "WHERE o.amount > 1000;",
    ],
    output: "Order ids with the customer name for every order whose amount is more than 1000",
    explanation: "JOIN comes right after FROM, and ON says how the two tables are connected. WHERE filters the joined rows.",
  },
  {
    id: "sql-parsons-top-three",
    type: "parsons",
    lang: "sql",
    level: "Easy",
    topic: "SQL Queries",
    title: "Top 3 students",
    prompt: "Arrange the clauses to show the 3 students with the highest marks.",
    lines: [
      "SELECT name, marks",
      "FROM students",
      "ORDER BY marks DESC",
      "LIMIT 3;",
    ],
    output: "Names and marks of the top 3 students",
    explanation: "Sort first with ORDER BY marks DESC, then LIMIT 3 keeps only the first three rows. LIMIT is the last clause.",
  },
  {
    id: "sql-parsons-subquery",
    type: "parsons",
    lang: "sql",
    level: "Hard",
    topic: "SQL Queries",
    title: "Above average salary",
    prompt: "Arrange the clauses to list employees whose salary is above the company average.",
    lines: [
      "SELECT name, salary",
      "FROM employees",
      "WHERE salary > (",
      "    SELECT AVG(salary)",
      "    FROM employees",
      ");",
    ],
    output: "Names and salaries of employees who earn more than the average salary",
    explanation: "The inner query (subquery) calculates the average salary. The outer WHERE compares each salary with that single value. The subquery sits inside brackets.",
  },
  {
    id: "py-out-division",
    type: "output",
    lang: "python",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Three kinds of division",
    code: `print(7 // 2, 7 / 2, 7 % 2)`,
    options: [
      "3 3.5 1",
      "3.5 3.5 1",
      "3 3 1",
      "3 3.5 0",
    ],
    answer: 0,
    explanation: "// is floor division (3), / is normal division and always gives a float (3.5), and % gives the remainder (1).",
  },
  {
    id: "py-out-slice",
    type: "output",
    lang: "python",
    level: "Easy",
    topic: "Strings",
    title: "String slicing",
    code: `s = "programming"
print(s[3:7])`,
    options: [
      "gram",
      "gra",
      "ogra",
      "gramm",
    ],
    answer: 0,
    explanation: "Slicing s[3:7] takes index 3 up to index 6 (the end index is NOT included). Index 3 is \"g\", so we get \"gram\".",
  },
  {
    id: "py-out-string-repeat",
    type: "output",
    lang: "python",
    level: "Easy",
    topic: "Strings",
    title: "Repeat a string",
    code: `print("ab" * 3 + "c")`,
    options: [
      "abababc",
      "ab3c",
      "abcabcabc",
      "TypeError",
    ],
    answer: 0,
    explanation: "A string multiplied by a number repeats it: \"ab\" * 3 is \"ababab\". Then + \"c\" joins one more character.",
  },
  {
    id: "py-out-list-alias",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Two names, one list",
    code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)`,
    options: [
      "[1, 2, 3]",
      "[1, 2, 3, 4]",
      "[4, 1, 2, 3]",
      "Error",
    ],
    answer: 1,
    explanation: "b = a does not copy the list. Both names point to the SAME list, so appending through b also changes a. Use a.copy() to make a real copy.",
  },
  {
    id: "py-out-mutable-default",
    type: "output",
    lang: "python",
    level: "Hard",
    topic: "Functions",
    title: "Mutable default argument",
    code: `def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item(1))
print(add_item(2))`,
    options: [
      "[1]\n[2]",
      "[1]\n[1, 2]",
      "[1, 2]\n[1, 2]",
      "[2]\n[1, 2]",
    ],
    answer: 1,
    explanation: "The default list is created only ONCE, when the function is defined. Every call without items shares that same list, so the second call sees [1] already inside.",
  },
  {
    id: "py-out-and-or",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Conditions",
    title: "and / or return values",
    code: `x = 0
print(x or "default", x and "yes")`,
    options: [
      "default 0",
      "True False",
      "default yes",
      "0 0",
    ],
    answer: 0,
    explanation: "\"or\" returns the first truthy value (\"default\" because 0 is falsy). \"and\" returns the first falsy value, which is 0 itself.",
  },
  {
    id: "py-out-for-else",
    type: "output",
    lang: "python",
    level: "Hard",
    topic: "Loops",
    title: "for loop with else",
    code: `for i in range(3):
    if i == 5:
        break
else:
    print("no break")
print(i)`,
    options: [
      "no break\n2",
      "2",
      "no break\n3",
      "no break",
    ],
    answer: 0,
    explanation: "The else of a for loop runs only if the loop finished without break. i never becomes 5, so \"no break\" is printed. After the loop, i keeps its last value, 2.",
  },
  {
    id: "py-out-dict-get",
    type: "output",
    lang: "python",
    level: "Easy",
    topic: "Dictionaries/Objects",
    title: "dict.get with default",
    code: `d = {"a": 1, "b": 2}
print(d.get("c", 0) + d["b"])`,
    options: [
      "2",
      "0",
      "KeyError",
      "3",
    ],
    answer: 0,
    explanation: "d.get(\"c\", 0) returns 0 because \"c\" is not a key (no error). d[\"b\"] is 2, so 0 + 2 = 2.",
  },
  {
    id: "py-out-dict-dup-key",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Duplicate keys",
    code: `d = {"x": 1, "y": 2, "x": 3}
print(len(d), d["x"])`,
    options: [
      "3 1",
      "2 3",
      "2 1",
      "3 3",
    ],
    answer: 1,
    explanation: "A dictionary cannot have duplicate keys. The later \"x\": 3 replaces the earlier value, so there are only 2 keys and d[\"x\"] is 3.",
  },
  {
    id: "py-out-recursive-sum",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Recursion",
    title: "Recursive sum",
    code: `def f(n):
    if n == 0:
        return 0
    return n + f(n - 1)

print(f(4))`,
    options: [
      "10",
      "4",
      "24",
      "0",
    ],
    answer: 0,
    explanation: "f(4) = 4 + f(3) = 4 + 3 + f(2) = ... = 4 + 3 + 2 + 1 + 0 = 10.",
  },
  {
    id: "py-out-class-variable",
    type: "output",
    lang: "python",
    level: "Hard",
    topic: "OOP/Classes",
    title: "Class variable counter",
    code: `class Counter:
    count = 0
    def __init__(self):
        Counter.count += 1

a = Counter()
b = Counter()
print(Counter.count, a.count)`,
    options: [
      "2 2",
      "2 1",
      "1 1",
      "2 0",
    ],
    answer: 0,
    explanation: "count belongs to the class, not to each object. Each new object increases the same shared value, so after two objects it is 2 - and a.count reads the same class variable.",
  },
  {
    id: "py-out-finally-return",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Exceptions",
    title: "finally with return",
    code: `def test():
    try:
        return "try"
    finally:
        print("finally")

print(test())`,
    options: [
      "finally\ntry",
      "try\nfinally",
      "try",
      "finally",
    ],
    answer: 0,
    explanation: "Even when try has a return, the finally block runs before the function actually returns. So \"finally\" is printed first, then print shows the returned \"try\".",
  },
  {
    id: "py-out-sorted-len",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Sorting & Searching",
    title: "Sort by length",
    code: `words = ["kiwi", "fig", "banana", "apple"]
print(sorted(words, key=len))`,
    options: [
      "['fig', 'kiwi', 'apple', 'banana']",
      "['apple', 'banana', 'fig', 'kiwi']",
      "['banana', 'apple', 'kiwi', 'fig']",
      "['fig', 'apple', 'kiwi', 'banana']",
    ],
    answer: 0,
    explanation: "key=len sorts by word length: fig(3), kiwi(4), apple(5), banana(6). It does not sort alphabetically.",
  },
  {
    id: "py-out-local-scope",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Functions",
    title: "Local vs global variable",
    code: `x = 10

def change():
    x = 20
    print(x)

change()
print(x)`,
    options: [
      "20\n10",
      "20\n20",
      "10\n10",
      "10\n20",
    ],
    answer: 0,
    explanation: "x = 20 inside the function creates a NEW local variable. The global x is not changed, so the second print shows 10. You would need \"global x\" to change it.",
  },
  {
    id: "py-out-reverse-step",
    type: "output",
    lang: "python",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Slice with negative step",
    code: `nums = [10, 20, 30, 40, 50, 60]
print(nums[::-2])`,
    options: [
      "[60, 40, 20]",
      "[50, 30, 10]",
      "[10, 30, 50]",
      "[60, 50, 40]",
    ],
    answer: 0,
    explanation: "A step of -2 starts from the last element and moves backwards two at a time: 60, 40, 20.",
  },
  {
    id: "py-out-while-triple",
    type: "output",
    lang: "python",
    level: "Easy",
    topic: "Loops",
    title: "While loop multiply",
    code: `n = 1
while n < 50:
    n = n * 3
print(n)`,
    options: [
      "81",
      "27",
      "50",
      "243",
    ],
    answer: 0,
    explanation: "n goes 1, 3, 9, 27, 81. When n is 27 the condition is still true, so it becomes 81. Now 81 < 50 is false and the loop stops.",
  },
  {
    id: "js-out-equality",
    type: "output",
    lang: "javascript",
    level: "Easy",
    topic: "Variables & Operators",
    title: "== vs ===",
    code: `console.log(5 == '5', 5 === '5');`,
    options: [
      "true false",
      "true true",
      "false false",
      "false true",
    ],
    answer: 0,
    explanation: "== converts types before comparing, so 5 == \"5\" is true. === checks value AND type, so a number and a string are not equal.",
  },
  {
    id: "js-out-plus-concat",
    type: "output",
    lang: "javascript",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Numbers and strings with +",
    code: `console.log(1 + 2 + '3' + 4);`,
    options: [
      "334",
      "10",
      "1234",
      "37",
    ],
    answer: 0,
    explanation: "+ works left to right. 1 + 2 = 3 (numbers). 3 + \"3\" becomes the string \"33\". Then \"33\" + 4 = \"334\".",
  },
  {
    id: "js-out-var-timeout",
    type: "output",
    lang: "javascript",
    level: "Hard",
    topic: "Closures & Scope",
    title: "var inside a loop with setTimeout",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    options: [
      "3\n3\n3",
      "0\n1\n2",
      "0\n0\n0",
      "1\n2\n3",
    ],
    answer: 0,
    explanation: "var has function scope, so there is only ONE i. The timeouts run after the loop ends, when i is already 3.",
  },
  {
    id: "js-out-let-timeout",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Closures & Scope",
    title: "let inside a loop with setTimeout",
    code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    options: [
      "0\n1\n2",
      "3\n3\n3",
      "1\n2\n3",
      "2\n1\n0",
    ],
    answer: 0,
    explanation: "let creates a new i for every loop iteration, so each callback remembers its own value: 0, 1, 2.",
  },
  {
    id: "js-out-event-loop",
    type: "output",
    lang: "javascript",
    level: "Hard",
    topic: "Async/Promises",
    title: "Event loop order",
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    options: [
      "A\nD\nC\nB",
      "A\nB\nC\nD",
      "A\nD\nB\nC",
      "A\nC\nD\nB",
    ],
    answer: 0,
    explanation: "Normal code runs first (A, D). Then Promise callbacks (microtasks) run - C. setTimeout callbacks (macrotasks) run last - B.",
  },
  {
    id: "js-out-async-await",
    type: "output",
    lang: "javascript",
    level: "Hard",
    topic: "Async/Promises",
    title: "What does await pause?",
    code: `async function run() {
  console.log(1);
  await null;
  console.log(2);
}
run();
console.log(3);`,
    options: [
      "1\n3\n2",
      "1\n2\n3",
      "3\n1\n2",
      "1\n3",
    ],
    answer: 0,
    explanation: "An async function runs normally until the first await. await pauses only this function, so the rest of the program prints 3 first, then 2 is printed.",
  },
  {
    id: "js-out-hoisting",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Closures & Scope",
    title: "var hoisting",
    code: `console.log(x);
var x = 5;
console.log(x);`,
    options: [
      "undefined\n5",
      "ReferenceError",
      "5\n5",
      "null\n5",
    ],
    answer: 0,
    explanation: "var declarations are hoisted (moved to the top) but the value is not. So x exists but is undefined at the first log.",
  },
  {
    id: "js-out-array-holes",
    type: "output",
    lang: "javascript",
    level: "Easy",
    topic: "Lists/Arrays",
    title: "Array length with a gap",
    code: `const arr = [1, 2, 3];
arr[5] = 6;
console.log(arr.length);`,
    options: [
      "6",
      "4",
      "3",
      "Error",
    ],
    answer: 0,
    explanation: "Assigning to index 5 makes the array grow. length is always the last index + 1, so it becomes 6 (indexes 3 and 4 are empty).",
  },
  {
    id: "js-out-object-reference",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Object reference",
    code: `const a = { score: 10 };
const b = a;
b.score = 50;
console.log(a.score);`,
    options: [
      "50",
      "10",
      "undefined",
      "TypeError",
    ],
    answer: 0,
    explanation: "Objects are stored by reference. a and b point to the same object, so changing b.score also changes a.score. const only stops re-assigning the variable, not changing the object.",
  },
  {
    id: "js-out-default-sort",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Sorting & Searching",
    title: "Default sort on numbers",
    code: `console.log([10, 1, 5, 100].sort().join(','));`,
    options: [
      "1,10,100,5",
      "1,5,10,100",
      "100,10,5,1",
      "10,1,5,100",
    ],
    answer: 0,
    explanation: "sort() without a compare function sorts as STRINGS. \"1\" < \"10\" < \"100\" < \"5\" in dictionary order. Use sort((a, b) => a - b) for numbers.",
  },
  {
    id: "js-out-typeof",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Variables & Operators",
    title: "typeof surprises",
    code: `console.log(typeof null, typeof [], typeof NaN);`,
    options: [
      "object object number",
      "null array NaN",
      "null object number",
      "object array number",
    ],
    answer: 0,
    explanation: "typeof null is \"object\" (an old JavaScript bug). Arrays are objects. NaN means \"Not a Number\" but its type is still number.",
  },
  {
    id: "js-out-two-counters",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Closures & Scope",
    title: "Two independent counters",
    code: `function outer() {
  let count = 0;
  return () => ++count;
}
const c1 = outer();
const c2 = outer();
c1();
c1();
console.log(c1(), c2());`,
    options: [
      "3 1",
      "3 4",
      "1 1",
      "2 1",
    ],
    answer: 0,
    explanation: "Each call to outer() creates a new count. c1 has been called 3 times (3) and c2 only once (1). They do not share the variable.",
  },
  {
    id: "js-out-catch-finally",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Exceptions",
    title: "try / catch / finally order",
    code: `function check() {
  try {
    throw new Error('Oops');
  } catch (e) {
    console.log('Caught: ' + e.message);
    return 'from catch';
  } finally {
    console.log('finally runs');
  }
}
console.log(check());`,
    options: [
      "Caught: Oops\nfinally runs\nfrom catch",
      "Caught: Oops\nfrom catch\nfinally runs",
      "finally runs\nCaught: Oops\nfrom catch",
      "Caught: Oops\nfrom catch",
    ],
    answer: 0,
    explanation: "The error is caught and logged. Before the return value leaves the function, finally runs. Then the returned value is printed.",
  },
  {
    id: "js-out-countdown",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "Recursion",
    title: "Recursive countdown",
    code: `function countDown(n) {
  if (n === 0) return 'Go!';
  return n + ' ' + countDown(n - 1);
}
console.log(countDown(3));`,
    options: [
      "3 2 1 Go!",
      "Go! 1 2 3",
      "3 2 1 0 Go!",
      "1 2 3 Go!",
    ],
    answer: 0,
    explanation: "countDown(3) = \"3 \" + countDown(2) = \"3 2 \" + countDown(1) ... and countDown(0) returns \"Go!\". So the result is \"3 2 1 Go!\".",
  },
  {
    id: "js-out-override",
    type: "output",
    lang: "javascript",
    level: "Medium",
    topic: "OOP/Classes",
    title: "Method overriding",
    code: `class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + ' makes a sound'; }
}
class Dog extends Animal {
  speak() { return this.name + ' barks'; }
}
const d = new Dog('Tommy');
console.log(d.speak());`,
    options: [
      "Tommy barks",
      "Tommy makes a sound",
      "undefined barks",
      "TypeError",
    ],
    answer: 0,
    explanation: "Dog gets the constructor from Animal, so name is set. Dog has its own speak(), which overrides the parent version.",
  },
  {
    id: "java-out-int-division",
    type: "output",
    lang: "java",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Integer division in Java",
    code: `public class Main {
    public static void main(String[] args) {
        int a = 7, b = 2;
        System.out.println(a / b);
        System.out.println((double) a / b);
    }
}`,
    options: [
      "3\n3.5",
      "3.5\n3.5",
      "3\n3.0",
      "3.5\n3",
    ],
    answer: 0,
    explanation: "int / int gives an int, so 7 / 2 is 3. Casting a to double first makes it 7.0 / 2 = 3.5.",
  },
  {
    id: "java-out-concat-order",
    type: "output",
    lang: "java",
    level: "Easy",
    topic: "Strings",
    title: "String concatenation order",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println(1 + 2 + "3" + 4 + 5);
    }
}`,
    options: [
      "3345",
      "12345",
      "339",
      "15",
    ],
    answer: 0,
    explanation: "Left to right: 1 + 2 = 3, then 3 + \"3\" = \"33\" (a String). After that everything is joined as text: \"334\", then \"3345\".",
  },
  {
    id: "java-out-increment",
    type: "output",
    lang: "java",
    level: "Medium",
    topic: "Variables & Operators",
    title: "x++ and ++x",
    code: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x++ + ++x;
        System.out.println(x + " " + y);
    }
}`,
    options: [
      "7 12",
      "7 11",
      "6 11",
      "7 13",
    ],
    answer: 0,
    explanation: "x++ uses 5 then makes x 6. ++x makes x 7 and uses 7. So y = 5 + 7 = 12 and x is 7.",
  },
  {
    id: "java-out-string-compare",
    type: "output",
    lang: "java",
    level: "Medium",
    topic: "Strings",
    title: "== vs equals() on Strings",
    code: `public class Main {
    public static void main(String[] args) {
        String s1 = "hello";
        String s2 = new String("hello");
        System.out.println(s1 == s2);
        System.out.println(s1.equals(s2));
    }
}`,
    options: [
      "false\ntrue",
      "true\ntrue",
      "true\nfalse",
      "false\nfalse",
    ],
    answer: 0,
    explanation: "== checks if both variables point to the same object. new String creates a different object, so it is false. equals() compares the text, so it is true.",
  },
  {
    id: "py-bug-range-end",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Loops",
    title: "Sum 1 to 5",
    prompt: "Print the sum of numbers from 1 to 5.",
    code: `total = 0
for i in range(1, 5):
    total += i
print(total)`,
    bugLine: 1,
    fix: "for i in range(1, 6):",
    expected: "15",
    explanation: "range(1, 5) stops BEFORE 5, so 5 is never added (result 10). The end value must be one more than the last number you want.",
  },
  {
    id: "py-bug-assign-in-if",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Conditions",
    title: "Check adult age",
    prompt: "Print a message when age is exactly 18.",
    code: `age = 18
if age = 18:
    print("Just became an adult")`,
    bugLine: 1,
    fix: "if age == 18:",
    expected: "Just became an adult",
    explanation: "= assigns a value, == compares values. Using = inside an if is a SyntaxError in Python.",
  },
  {
    id: "py-bug-return-indent",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Functions",
    title: "Sum of a list",
    prompt: "Return the sum of all numbers in the list.",
    code: `def total(nums):
    s = 0
    for n in nums:
        s += n
        return s

print(total([1, 2, 3, 4]))`,
    bugLine: 4,
    fix: "    return s",
    expected: "10",
    explanation: "The return is indented inside the loop, so the function returns after the first number (1). Move it out of the loop so it runs after all numbers are added.",
  },
  {
    id: "py-bug-missing-return",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Functions",
    title: "Square of a number",
    prompt: "The function should return the square of x.",
    code: `def square(x):
    x * x

print(square(6))`,
    bugLine: 1,
    fix: "    return x * x",
    expected: "36",
    explanation: "Calculating x * x without return throws the value away. A function with no return gives None.",
  },
  {
    id: "py-bug-mutable-default",
    type: "bug",
    lang: "python",
    level: "Hard",
    topic: "Functions",
    title: "Shared group list",
    prompt: "Each call should create a new group with only that student.",
    code: `def add_student(name, group=[]):
    group.append(name)
    return group

print(add_student("Asha"))
print(add_student("Ravi"))`,
    bugLine: 1,
    fix: "    group = group + [name]",
    expected: "['Asha']\n['Ravi']",
    explanation: "The default list is created only once and append() changes it, so Ravi joins Asha's list. group + [name] builds a NEW list instead. (The common fix is group=None and creating [] inside the function.)",
  },
  {
    id: "py-bug-floor-average",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Variables & Operators",
    title: "Average marks",
    prompt: "Print the average of the marks rounded to 2 decimal places.",
    code: `marks = [70, 85, 90]
avg = round(sum(marks) // len(marks), 2)
print("Average:", avg)`,
    bugLine: 1,
    fix: "avg = round(sum(marks) / len(marks), 2)",
    expected: "Average: 81.67",
    explanation: "// is floor division and cuts off the decimal part (81). Use / for real division to get 81.666..., which rounds to 81.67.",
  },
  {
    id: "py-bug-str-plus-int",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Strings",
    title: "Print age with text",
    prompt: "Print \"Age: 21\".",
    code: `age = 21
print("Age: " + age)`,
    bugLine: 1,
    fix: "print(\"Age: \" + str(age))",
    expected: "Age: 21",
    explanation: "Python cannot add a string and an int (TypeError). Convert the number with str() first, or use an f-string.",
  },
  {
    id: "py-bug-last-index",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Lists/Arrays",
    title: "Last fruit",
    prompt: "Print the last item of the list.",
    code: `fruits = ["apple", "mango", "banana"]
last = fruits[len(fruits)]
print(last)`,
    bugLine: 1,
    fix: "last = fruits[len(fruits) - 1]",
    expected: "banana",
    explanation: "Indexes start at 0, so the last index is len - 1. fruits[3] does not exist and gives IndexError. fruits[-1] also works.",
  },
  {
    id: "py-bug-dict-values",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Total stock",
    prompt: "Add up the stock count of all items.",
    code: `stock = {"pen": 10, "book": 4, "bag": 2}
total = 0
for item in stock:
    total += item
print(total)`,
    bugLine: 3,
    fix: "    total += stock[item]",
    expected: "16",
    explanation: "Looping over a dictionary gives its KEYS (strings). Adding a string to a number is a TypeError. Use stock[item] to get the value.",
  },
  {
    id: "py-bug-factorial-base",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Recursion",
    title: "Factorial base case",
    prompt: "Print 5! (which is 120).",
    code: `def fact(n):
    if n == 1:
        return 0
    return n * fact(n - 1)

print(fact(5))`,
    bugLine: 2,
    fix: "        return 1",
    expected: "120",
    explanation: "The base case returns 0, and anything multiplied by 0 is 0. 1! is 1, so the base case must return 1.",
  },
  {
    id: "py-bug-missing-self",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "OOP/Classes",
    title: "Bank deposit",
    prompt: "Depositing 50 into an account with 100 should make the balance 150.",
    code: `class BankAccount:
    def __init__(self, balance):
        self.balance = balance
    def deposit(self, amount):
        balance = self.balance + amount

account = BankAccount(100)
account.deposit(50)
print(account.balance)`,
    bugLine: 4,
    fix: "        self.balance = self.balance + amount",
    expected: "150",
    explanation: "Without self., balance is just a local variable that disappears when the method ends. Use self.balance to change the object.",
  },
  {
    id: "py-bug-wrong-except",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Exceptions",
    title: "Catch the right error",
    prompt: "Print \"Index not found\" instead of crashing when the index is too big.",
    code: `nums = [1, 2, 3]
try:
    print(nums[5])
except KeyError:
    print("Index not found")`,
    bugLine: 3,
    fix: "except IndexError:",
    expected: "Index not found",
    explanation: "A list with a bad index raises IndexError, not KeyError (KeyError is for dictionaries). The wrong except does not catch it, so the program crashes.",
  },
  {
    id: "py-bug-binary-search",
    type: "bug",
    lang: "python",
    level: "Hard",
    topic: "Sorting & Searching",
    title: "Binary search misses the last item",
    prompt: "Return the index of 19 in the sorted list.",
    code: `def search(arr, target):
    low, high = 0, len(arr) - 1
    while low < high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

print(search([3, 7, 11, 15, 19], 19))`,
    bugLine: 2,
    fix: "    while low <= high:",
    expected: "4",
    explanation: "When low == high there is still one element left to check. With < the loop stops too early and returns -1. Use <=.",
  },
  {
    id: "py-bug-palindrome-case",
    type: "bug",
    lang: "python",
    level: "Medium",
    topic: "Strings",
    title: "Palindrome ignoring case",
    prompt: "Check if the word is a palindrome, ignoring capital letters.",
    code: `word = "Madam"
if word == word[::-1]:
    print("Palindrome")
else:
    print("Not palindrome")`,
    bugLine: 1,
    fix: "if word.lower() == word[::-1].lower():",
    expected: "Palindrome",
    explanation: "\"Madam\" reversed is \"madaM\". Python compares case too, so they are not equal. Convert both sides to lower case before comparing.",
  },
  {
    id: "py-bug-remove-while-looping",
    type: "bug",
    lang: "python",
    level: "Hard",
    topic: "Lists/Arrays",
    title: "Remove even numbers",
    prompt: "Remove all even numbers from the list.",
    code: `nums = [2, 4, 5, 6, 7]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)`,
    bugLine: 1,
    fix: "for n in nums[:]:",
    expected: "[5, 7]",
    explanation: "Removing items from a list while looping over it shifts the items, so some are skipped (4 is never checked). Loop over a copy (nums[:]) instead.",
  },
  {
    id: "py-bug-find-min",
    type: "bug",
    lang: "python",
    level: "Easy",
    topic: "Sorting & Searching",
    title: "Smallest number",
    prompt: "Find the smallest number in the list.",
    code: `nums = [8, 3, 9, 1, 6]
smallest = nums[0]
for n in nums:
    if n > smallest:
        smallest = n
print(smallest)`,
    bugLine: 3,
    fix: "    if n < smallest:",
    expected: "1",
    explanation: "The comparison is reversed. With > the code finds the biggest number (9). To find the smallest, update when n < smallest.",
  },
  {
    id: "js-bug-string-number-compare",
    type: "bug",
    lang: "javascript",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Input matches target",
    prompt: "The user typed \"5\" (a string). Print \"Match\" because it equals the number 5.",
    code: `const userInput = '5';
const target = 5;
if (userInput === target) {
  console.log('Match');
} else {
  console.log('No match');
}`,
    bugLine: 2,
    fix: "if (Number(userInput) === target) {",
    expected: "Match",
    explanation: "=== also checks the type, and a string is never === a number. Convert the input with Number() first (better than switching to ==).",
  },
  {
    id: "js-bug-var-closure",
    type: "bug",
    lang: "javascript",
    level: "Hard",
    topic: "Closures & Scope",
    title: "Button labels",
    prompt: "Each function should return its own button number: Button 1, Button 2, Button 3.",
    code: `const buttons = [];
for (var i = 1; i <= 3; i++) {
  buttons.push(() => 'Button ' + i);
}
console.log(buttons.map((f) => f()).join(', '));`,
    bugLine: 1,
    fix: "for (let i = 1; i <= 3; i++) {",
    expected: "Button 1, Button 2, Button 3",
    explanation: "With var there is only one shared i, which is 4 when the functions run. let creates a fresh i for each iteration, so each function remembers its own number.",
  },
  {
    id: "js-bug-loop-lte",
    type: "bug",
    lang: "javascript",
    level: "Easy",
    topic: "Loops",
    title: "Sum of array",
    prompt: "Print the sum of all numbers in the array.",
    code: `const nums = [3, 6, 9];
let sum = 0;
for (let i = 0; i <= nums.length; i++) {
  sum += nums[i];
}
console.log(sum);`,
    bugLine: 2,
    fix: "for (let i = 0; i < nums.length; i++) {",
    expected: "18",
    explanation: "The last valid index is length - 1. With <= the loop reads nums[3], which is undefined, and number + undefined gives NaN.",
  },
  {
    id: "js-bug-arrow-braces",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Functions",
    title: "Double every number",
    prompt: "Print each number doubled: 2,4,6.",
    code: `const double = (n) => { n * 2 };
console.log([1, 2, 3].map(double).join(','));`,
    bugLine: 0,
    fix: "const double = (n) => n * 2;",
    expected: "2,4,6",
    explanation: "When an arrow function body has { }, you must write return. Without it the function returns undefined. Remove the braces for an automatic return.",
  },
  {
    id: "js-bug-assign-in-if",
    type: "bug",
    lang: "javascript",
    level: "Easy",
    topic: "Conditions",
    title: "Check user role",
    prompt: "The role is \"student\", so print \"Welcome, student\".",
    code: `let role = 'student';
if (role = 'admin') {
  console.log('Welcome, admin');
} else {
  console.log('Welcome, student');
}`,
    bugLine: 1,
    fix: "if (role === 'admin') {",
    expected: "Welcome, student",
    explanation: "role = 'admin' ASSIGNS the value (and a non-empty string is truthy), so the if is always true. Use === to compare.",
  },
  {
    id: "js-bug-const-reassign",
    type: "bug",
    lang: "javascript",
    level: "Easy",
    topic: "Variables & Operators",
    title: "Update the score",
    prompt: "Add 5 to the score and print 15.",
    code: `const score = 10;
score = score + 5;
console.log(score);`,
    bugLine: 0,
    fix: "let score = 10;",
    expected: "15",
    explanation: "A const variable cannot be re-assigned (TypeError: Assignment to constant variable). Use let when the value will change.",
  },
  {
    id: "js-bug-sort-numbers",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Sorting & Searching",
    title: "Sort prices",
    prompt: "Sort the prices from lowest to highest.",
    code: `const prices = [100, 25, 3, 40];
prices.sort();
console.log(prices.join(' '));`,
    bugLine: 1,
    fix: "prices.sort((a, b) => a - b);",
    expected: "3 25 40 100",
    explanation: "Default sort() compares values as strings, so \"100\" comes before \"25\". Give a compare function (a, b) => a - b for numbers.",
  },
  {
    id: "js-bug-missing-await",
    type: "bug",
    lang: "javascript",
    level: "Hard",
    topic: "Async/Promises",
    title: "Greet the user",
    prompt: "Wait for the user name and print \"Hello, Priya\".",
    code: `function getUser() {
  return new Promise((resolve) => setTimeout(() => resolve('Priya'), 50));
}
async function show() {
  const name = getUser();
  console.log('Hello, ' + name);
}
show();`,
    bugLine: 4,
    fix: "  const name = await getUser();",
    expected: "Hello, Priya",
    explanation: "getUser() returns a Promise, not the name. Without await you print \"[object Promise]\". await waits for the Promise to resolve and gives the real value.",
  },
  {
    id: "js-bug-arrow-this",
    type: "bug",
    lang: "javascript",
    level: "Hard",
    topic: "OOP/Classes",
    title: "Object method using this",
    prompt: "greet() should return \"Hi, Neha\".",
    code: `const user = {
  name: 'Neha',
  greet: () => {
    return 'Hi, ' + this.name;
  },
};
console.log(user.greet());`,
    bugLine: 2,
    fix: "  greet() {",
    expected: "Hi, Neha",
    explanation: "Arrow functions do not have their own this, so this.name is not the object's name. A normal method (greet() { ... }) gets this = user when called as user.greet().",
  },
  {
    id: "js-bug-for-of-object",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Dictionaries/Objects",
    title: "Total of all subjects",
    prompt: "Add the marks of all subjects and print 240.",
    code: `const marks = { maths: 80, science: 70, english: 90 };
let total = 0;
for (const subject of marks) {
  total += marks[subject];
}
console.log(total);`,
    bugLine: 2,
    fix: "for (const subject in marks) {",
    expected: "240",
    explanation: "for...of works on arrays and strings, not plain objects (TypeError: marks is not iterable). for...in loops over the keys of an object.",
  },
  {
    id: "js-bug-sum-base-case",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Recursion",
    title: "Sum from 1 to n",
    prompt: "sumTo(4) should return 1 + 2 + 3 + 4 = 10.",
    code: `function sumTo(n) {
  if (n === 1) return 0;
  return n + sumTo(n - 1);
}
console.log(sumTo(4));`,
    bugLine: 1,
    fix: "  if (n === 1) return 1;",
    expected: "10",
    explanation: "The base case returns the wrong value. The sum from 1 to 1 is 1, not 0, so the answer was 1 short (9).",
  },
  {
    id: "js-bug-string-immutable",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Strings",
    title: "Uppercase name",
    prompt: "Print the name in capital letters: RAHUL.",
    code: `let name = 'rahul';
name.toUpperCase();
console.log(name);`,
    bugLine: 1,
    fix: "name = name.toUpperCase();",
    expected: "RAHUL",
    explanation: "Strings cannot be changed in place. toUpperCase() returns a NEW string, so you must store the result back in the variable.",
  },
  {
    id: "js-bug-error-message",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Exceptions",
    title: "Show the error message",
    prompt: "Print exactly \"Error: Cannot divide by zero\".",
    code: `function divide(a, b) {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}
try {
  console.log(divide(10, 0));
} catch (err) {
  console.log('Error: ' + err);
}`,
    bugLine: 7,
    fix: "  console.log('Error: ' + err.message);",
    expected: "Error: Cannot divide by zero",
    explanation: "Converting the whole Error object to a string already adds \"Error: \" in front, so it printed twice. err.message gives only the message text.",
  },
  {
    id: "js-bug-indexof-zero",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Sorting & Searching",
    title: "Is Pune in the list?",
    prompt: "Print \"Pune found\" because Pune is in the array.",
    code: `const cities = ['Pune', 'Delhi', 'Mumbai'];
if (cities.indexOf('Pune')) {
  console.log('Pune found');
} else {
  console.log('Pune not found');
}`,
    bugLine: 1,
    fix: "if (cities.indexOf('Pune') !== -1) {",
    expected: "Pune found",
    explanation: "indexOf returns 0 for the first item, and 0 is falsy. \"Not found\" is -1, so compare with -1 (or use includes()).",
  },
  {
    id: "js-bug-array-copy",
    type: "bug",
    lang: "javascript",
    level: "Medium",
    topic: "Lists/Arrays",
    title: "Copy an array",
    prompt: "Adding to the copy should NOT change the original. Print \"3 4\".",
    code: `const original = [1, 2, 3];
const copy = original;
copy.push(4);
console.log(original.length, copy.length);`,
    bugLine: 1,
    fix: "const copy = [...original];",
    expected: "3 4",
    explanation: "copy = original only copies the reference, so both names point to one array. The spread operator [...original] creates a new array.",
  },
  {
    id: "java-bug-array-bounds",
    type: "bug",
    lang: "java",
    level: "Easy",
    topic: "Lists/Arrays",
    title: "Total marks in Java",
    prompt: "Print the sum of all marks (180).",
    code: `public class Main {
    public static void main(String[] args) {
        int[] marks = {50, 60, 70};
        int sum = 0;
        for (int i = 0; i <= marks.length; i++) {
            sum += marks[i];
        }
        System.out.println(sum);
    }
}`,
    bugLine: 4,
    fix: "        for (int i = 0; i < marks.length; i++) {",
    expected: "180",
    explanation: "Valid indexes are 0 to length - 1. With <= the loop tries marks[3] and Java throws ArrayIndexOutOfBoundsException.",
  },
  {
    id: "java-bug-string-equals",
    type: "bug",
    lang: "java",
    level: "Medium",
    topic: "Strings",
    title: "Check the answer",
    prompt: "Print \"Correct\" because both strings contain \"yes\".",
    code: `public class Main {
    public static void main(String[] args) {
        String a = new String("yes");
        String answer = "yes";
        if (a == answer) {
            System.out.println("Correct");
        } else {
            System.out.println("Wrong");
        }
    }
}`,
    bugLine: 4,
    fix: "        if (a.equals(answer)) {",
    expected: "Correct",
    explanation: "== compares object references, and new String makes a different object, so it prints Wrong. Use equals() to compare the text.",
  },
  {
    id: "java-bug-int-average",
    type: "bug",
    lang: "java",
    level: "Medium",
    topic: "Variables & Operators",
    title: "Average with decimals",
    prompt: "The total is 7 for 2 items. Print the exact average: 3.5.",
    code: `public class Main {
    public static void main(String[] args) {
        int total = 7;
        int count = 2;
        double avg = total / count;
        System.out.println(avg);
    }
}`,
    bugLine: 4,
    fix: "        double avg = (double) total / count;",
    expected: "3.5",
    explanation: "total / count is int division (3) BEFORE it is stored in the double, so you get 3.0. Cast one side to double first.",
  },
  {
    id: "java-bug-switch-break",
    type: "bug",
    lang: "java",
    level: "Medium",
    topic: "Conditions",
    title: "Day name with switch",
    prompt: "Print only \"Monday\" when day is 1.",
    code: `public class Main {
    public static void main(String[] args) {
        int day = 1;
        switch (day) {
            case 1: System.out.println("Monday");
            case 2: System.out.println("Tuesday"); break;
            default: System.out.println("Other day");
        }
    }
}`,
    bugLine: 4,
    fix: "            case 1: System.out.println(\"Monday\"); break;",
    expected: "Monday",
    explanation: "Without break, a switch \"falls through\" into the next case, so Tuesday is printed too. Add break at the end of each case.",
  },
];
