const marksCode = `// Day 11 - Example 1: Student marks array - total, average, highest, lowest
using System.Globalization;

int[] marks = { 78, 92, 65, 88, 70 };

int total = 0;
int highest = marks[0];
int lowest = marks[0];

for (int i = 0; i < marks.Length; i++)
{
    Console.WriteLine($"Subject {i + 1}: {marks[i]}");
    total += marks[i];
    if (marks[i] > highest) highest = marks[i];
    if (marks[i] < lowest) lowest = marks[i];
}

double average = (double)total / marks.Length;

Console.WriteLine($"Total   : {total}");
Console.WriteLine("Average : " + average.ToString("0.00", CultureInfo.InvariantCulture));
Console.WriteLine($"Highest : {highest}");
Console.WriteLine($"Lowest  : {lowest}");
`;

const builtInCode = `// Day 11 - Example 2: foreach and built-in Array methods
int[] numbers = { 42, 7, 19, 3, 25 };

Console.Write("foreach : ");
foreach (int n in numbers)
{
    Console.Write(n + " ");
}
Console.WriteLine();

Console.WriteLine("Original: " + string.Join(", ", numbers));
Console.WriteLine($"Length  : {numbers.Length}");
Console.WriteLine($"Max/Min : {numbers.Max()} / {numbers.Min()}");   // LINQ helpers
Console.WriteLine($"Sum     : {numbers.Sum()}");

Array.Sort(numbers);
Console.WriteLine("Sorted  : " + string.Join(", ", numbers));

Array.Reverse(numbers);
Console.WriteLine("Reversed: " + string.Join(", ", numbers));

Console.WriteLine($"IndexOf(19) = {Array.IndexOf(numbers, 19)}");
Console.WriteLine($"IndexOf(100) = {Array.IndexOf(numbers, 100)}");

int[] copy = new int[3];
Array.Copy(numbers, copy, 3);        // copy the first 3 elements
Console.WriteLine("Copy(3) : " + string.Join(", ", copy));
`;

const bubbleCode = `// Day 11 - Example 3: Sort an array manually (Bubble Sort) and find max without built-ins
int[] arr = { 5, 1, 4, 2, 8 };
int n = arr.Length;

for (int i = 0; i < n - 1; i++)
{
    for (int j = 0; j < n - 1 - i; j++)
    {
        if (arr[j] > arr[j + 1])
        {
            int temp = arr[j];        // swap using a temporary variable
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
    Console.WriteLine($"Pass {i + 1}: " + string.Join(" ", arr));
}

int max = arr[0];
int maxIndex = 0;
for (int i = 1; i < n; i++)
{
    if (arr[i] > max)
    {
        max = arr[i];
        maxIndex = i;
    }
}
Console.WriteLine($"Maximum = {max} at index {maxIndex}");
`;

const twoDCode = `// Day 11 - Example 4: 2D (rectangular) array - marks of 3 students in 3 subjects
string[] names = { "Asha", "Ravi", "Meena" };
int[,] marks =
{
    { 80, 75, 90 },   // Asha
    { 60, 70, 65 },   // Ravi
    { 95, 85, 88 }    // Meena
};

int rows = marks.GetLength(0);   // 3 students
int cols = marks.GetLength(1);   // 3 subjects
Console.WriteLine($"Rows = {rows}, Columns = {cols}, Total cells = {marks.Length}");

int topTotal = 0;
string topper = "";

for (int i = 0; i < rows; i++)
{
    int total = 0;
    Console.Write($"{names[i]}: ");
    for (int j = 0; j < cols; j++)
    {
        Console.Write($"{marks[i, j]} ");
        total += marks[i, j];
    }
    Console.WriteLine($"| Total = {total}");

    if (total > topTotal)
    {
        topTotal = total;
        topper = names[i];
    }
}
Console.WriteLine($"Topper: {topper} with {topTotal} marks");
`;

const jaggedCode = `// Day 11 - Example 5: Jagged array (array of arrays) and index errors
int[][] scores = new int[3][];
scores[0] = new int[] { 10, 20 };
scores[1] = new int[] { 30, 40, 50 };
scores[2] = new int[] { 60 };

for (int i = 0; i < scores.Length; i++)
{
    Console.WriteLine($"Row {i} ({scores[i].Length} items): " + string.Join(" ", scores[i]));
}

Console.WriteLine($"scores[1][2] = {scores[1][2]}");

int[] small = new int[3];            // default values are 0
Console.WriteLine("Default values: " + string.Join(", ", small));

try
{
    small[3] = 99;                   // valid indexes are 0, 1, 2
}
catch (IndexOutOfRangeException)
{
    Console.WriteLine("Error: index 3 is outside the array (valid 0 to 2)");
}
`;

export default {
  id: 'day-011-arrays-one-and-multidimensional',
  title: 'Arrays: One-dimensional and Multidimensional',
  module: 'Module 1: C# Programming Fundamentals',
  day: 11,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Store many values of the same type in a single variable using arrays. Work with student marks, find the maximum, sort an array (manually and with Array.Sort), and use 2D and jagged arrays for table-like data.`,
  objectives: [
    'Declare, initialize and access one-dimensional arrays using zero-based indexes',
    'Traverse arrays with for and foreach and compute total, average, max and min',
    'Use Array.Sort, Array.Reverse, Array.IndexOf, Array.Copy and write a bubble sort',
    'Work with rectangular (2D) arrays and jagged arrays and avoid IndexOutOfRangeException',
  ],
  theory: [
    {
      heading: 'What is an array?',
      content: `An array is a fixed-size collection of elements of the SAME data type stored in continuous memory under one name. Instead of int m1, m2, m3, m4, m5 you write int[] marks = new int[5]. Analogy: a row of numbered lockers in a school - one locker row (the array), each locker has a number (index) starting from 0. Arrays are reference types: the variable holds a reference to the array object on the heap. Once created, the size of an array cannot change (use List<T> on Day 29 for a growing collection).`,
      syntax: `int[] marks = new int[5];                 // 5 elements, all 0
int[] marks2 = new int[] { 78, 92, 65 };    // size from values
int[] marks3 = { 78, 92, 65 };              // short form
string[] names = new string[3];             // all null
int[] marks4 = [78, 92, 65];                // C# 12 collection expression`,
      points: [
        'Index starts at 0, last index is Length - 1',
        'Default values: 0 for numbers, false for bool, null for string/objects',
        'marks.Length gives the number of elements',
      ],
    },
    {
      heading: 'Accessing and traversing arrays: for vs foreach',
      content: `Use arr[index] to read or write an element. A for loop gives you the index (useful for "Subject 1", for modifying elements or for comparing neighbours). A foreach loop gives you each value directly and is simpler and safer, but the loop variable is read-only - you cannot assign to it. Accessing an index outside 0..Length-1 throws System.IndexOutOfRangeException at runtime.`,
      syntax: `for (int i = 0; i < marks.Length; i++)
    Console.WriteLine(marks[i]);

foreach (int m in marks)
    Console.WriteLine(m);`,
      tip: 'Type "foreach" and press Tab twice in Visual Studio for a foreach snippet.',
    },
    {
      heading: 'Built-in Array methods',
      content: `The System.Array class provides ready-made static methods. Array.Sort(arr) sorts in ascending order (in place). Array.Reverse(arr) reverses the order. Array.IndexOf(arr, value) returns the index or -1 if not found. Array.Copy(source, dest, count) copies elements. Array.Resize(ref arr, newSize) creates a new array of a different size. string.Join(", ", arr) is a quick way to print an array. With using System.Linq (included by implicit usings in new projects) you also get arr.Max(), arr.Min(), arr.Sum(), arr.Average().`,
      points: [
        'Sort descending: Array.Sort(arr); Array.Reverse(arr);',
        'Array.Exists(arr, x => x > 90) checks a condition',
        'Arrays are reference types: int[] b = a; makes b point to the SAME array',
      ],
    },
    {
      heading: 'Sorting by hand: Bubble Sort',
      content: `Interviewers often ask you to sort WITHOUT Array.Sort. Bubble sort compares each pair of neighbours and swaps them if they are in the wrong order. After pass 1 the largest value has "bubbled" to the end; after pass 2 the second largest is in place, and so on. n elements need at most n - 1 passes. To swap two values you need a temporary variable (or the tuple swap (a, b) = (b, a)).`,
      syntax: `for (int i = 0; i < n - 1; i++)
    for (int j = 0; j < n - 1 - i; j++)
        if (arr[j] > arr[j + 1])
        {
            int temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
        }`,
    },
    {
      heading: 'Multidimensional (rectangular) arrays',
      content: `A 2D array stores data in rows and columns like an Excel sheet or a marks register: int[,] marks = new int[3, 4] has 3 rows and 4 columns. Access an element with marks[row, col]. GetLength(0) returns the number of rows and GetLength(1) the number of columns; Length returns the total number of cells (rows x columns). Use nested loops: outer for rows, inner for columns. A 3D array is int[,,].`,
      syntax: `int[,] m = new int[2, 3];
int[,] grid = { { 1, 2, 3 }, { 4, 5, 6 } };
Console.WriteLine(grid[1, 2]);   // 6
grid.GetLength(0)   // 2 rows
grid.GetLength(1)   // 3 columns`,
    },
    {
      heading: 'Jagged arrays',
      content: `A jagged array is an "array of arrays" where each row can have a different length - like students who took different numbers of tests. Declare it with int[][]; create the outer array first, then each inner array. Access with scores[row][col]. Rectangular arrays use one comma inside one pair of brackets [i, j]; jagged arrays use two pairs of brackets [i][j].`,
      syntax: `int[][] jag = new int[2][];
jag[0] = new int[] { 1, 2, 3 };
jag[1] = new int[] { 4 };
Console.WriteLine(jag[0][2]);   // 3`,
      tip: 'When in doubt: same number of columns in every row -> int[,]; different lengths -> int[][].',
    },
  ],
  examples: [
    {
      title: 'Student marks array: total, average, highest, lowest',
      scenario: 'A class teacher stores the marks of one student in 5 subjects and needs a mini report.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StudentMarksArray',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: marksCode,
      csharp: { files: { 'Program.cs': marksCode }, stdin: '' },
      result: `Subject 1: 78
Subject 2: 92
Subject 3: 65
Subject 4: 88
Subject 5: 70
Total   : 393
Average : 78.60
Highest : 92
Lowest  : 65`,
      explanation: `highest and lowest start with the FIRST element (not 0) so the logic also works for negative numbers. The cast (double)total avoids integer division: 393 / 5 would give 78, but 393.0 / 5 = 78.6. ToString("0.00", CultureInfo.InvariantCulture) always prints a dot with 2 decimals regardless of the computer's regional settings.`,
    },
    {
      title: 'foreach and built-in Array methods',
      scenario: 'Quickly sort, reverse, search and copy an array of numbers using the Array class.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ArrayMethods',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: builtInCode,
      csharp: { files: { 'Program.cs': builtInCode }, stdin: '' },
      result: `foreach : 42 7 19 3 25
Original: 42, 7, 19, 3, 25
Length  : 5
Max/Min : 42 / 3
Sum     : 96
Sorted  : 3, 7, 19, 25, 42
Reversed: 42, 25, 19, 7, 3
IndexOf(19) = 2
IndexOf(100) = -1
Copy(3) : 42, 25, 19`,
      explanation: `Array.Sort and Array.Reverse change the original array (in place). Sorting then reversing gives descending order. IndexOf returns -1 when the value is missing. Max, Min and Sum come from LINQ (System.Linq is an implicit using in .NET 6+ console projects). The first line ends with a space because each number is printed followed by " ".`,
    },
    {
      title: 'Bubble sort and maximum without built-in methods',
      scenario: 'Student practical programs: sort an array and find the maximum element - the way interviewers expect you to write it by hand.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BubbleSortDemo',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on the swap line and press F5; use F10 and the Locals window to watch arr change',
        'Press Ctrl+F5 for the final output',
      ],
      code: bubbleCode,
      csharp: { files: { 'Program.cs': bubbleCode }, stdin: '' },
      result: `Pass 1: 1 4 2 5 8
Pass 2: 1 2 4 5 8
Pass 3: 1 2 4 5 8
Pass 4: 1 2 4 5 8
Maximum = 8 at index 4`,
      explanation: `Pass 1: (5,1) swap -> 1 5 4 2 8; (5,4) swap -> 1 4 5 2 8; (5,2) swap -> 1 4 2 5 8; (5,8) no swap. The largest value 8 is at the end. Pass 2 swaps (4,2) and the array is sorted; passes 3 and 4 make no swaps (an optimized version stops early using a bool swapped flag). The max loop starts at index 1 because index 0 is already stored in max.`,
    },
    {
      title: '2D array: marks register of 3 students',
      scenario: 'Store marks of 3 students in 3 subjects in a table, print each row with its total and find the topper.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MarksRegister2D',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: twoDCode,
      csharp: { files: { 'Program.cs': twoDCode }, stdin: '' },
      result: `Rows = 3, Columns = 3, Total cells = 9
Asha: 80 75 90 | Total = 245
Ravi: 60 70 65 | Total = 195
Meena: 95 85 88 | Total = 268
Topper: Meena with 268 marks`,
      explanation: `marks[i, j] means row i (student), column j (subject). GetLength(0) and GetLength(1) give the size of each dimension and Length gives 3 x 3 = 9. A parallel array names[] holds the student names at the same row index. Totals: 80+75+90 = 245, 60+70+65 = 195, 95+85+88 = 268.`,
    },
    {
      title: 'Jagged arrays, default values and IndexOutOfRangeException',
      scenario: 'Store a different number of test scores per row and see what happens when an invalid index is used.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it JaggedArrayDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: jaggedCode,
      csharp: { files: { 'Program.cs': jaggedCode }, stdin: '' },
      result: `Row 0 (2 items): 10 20
Row 1 (3 items): 30 40 50
Row 2 (1 items): 60
scores[1][2] = 50
Default values: 0, 0, 0
Error: index 3 is outside the array (valid 0 to 2)`,
      explanation: `scores.Length is the number of rows (3) while scores[i].Length is the length of each row. new int[3] fills the array with 0. Writing small[3] throws IndexOutOfRangeException; the try/catch (covered fully on Day 31) prevents the program from crashing.`,
    },
  ],
  interview: [
    { q: 'What is an array? Is it a value type or a reference type?', a: 'A fixed-size, zero-indexed collection of elements of one type. Arrays are reference types (derived from System.Array) and live on the heap, even if the elements are value types like int.', level: 'Easy' },
    { q: 'What is the index of the first and the last element of an array?', a: 'First is 0, last is Length - 1.', level: 'Easy' },
    { q: 'What is the output? int[] a = { 1, 2, 3 }; int[] b = a; b[0] = 100; Console.WriteLine(a[0]);', a: '100 - b and a refer to the same array object, so changing b changes a. Use a.Clone() or Array.Copy for an independent copy.', level: 'Medium' },
    { q: 'What is the output? int[] arr = new int[4]; Console.WriteLine(arr[2] + arr.Length);', a: '4 - default element value is 0, Length is 4, 0 + 4 = 4.', level: 'Easy' },
    { q: 'Difference between int[,] and int[][]?', a: 'int[,] is a rectangular multidimensional array (all rows same length, accessed as a[i, j]). int[][] is a jagged array - an array of arrays where each row can have a different length (accessed a[i][j]).', level: 'Medium' },
    { q: 'What is the output? int[,] g = new int[2, 5]; Console.WriteLine(g.Length + " " + g.GetLength(1));', a: '10 5 - Length is the total number of cells, GetLength(1) is the number of columns.', level: 'Medium' },
    { q: 'What happens when you access arr[arr.Length]?', a: 'A System.IndexOutOfRangeException is thrown at runtime because the last valid index is Length - 1.', level: 'Easy' },
    { q: 'Can you modify the loop variable inside foreach over an array?', a: 'No. The foreach iteration variable is read-only; assigning to it gives compile error CS1656. Use a for loop with index to modify elements.', level: 'Medium' },
    { q: 'How do you sort an array in descending order?', a: 'Array.Sort(arr); Array.Reverse(arr); or Array.Sort(arr, (x, y) => y.CompareTo(x)); or with LINQ arr.OrderByDescending(x => x).ToArray().', level: 'Medium' },
    { q: 'Explain bubble sort and its complexity.', a: 'Repeatedly compares neighbouring elements and swaps them if out of order; after each pass the largest remaining value reaches its final position. Worst/average case O(n squared), best case O(n) with an early-exit swapped flag.', level: 'Hard' },
    { q: 'What is the output? int[] x = { 5, 3, 9 }; Array.Sort(x); Console.WriteLine(Array.IndexOf(x, 9));', a: '2 - after sorting the array is 3, 5, 9, so 9 is at index 2.', level: 'Medium' },
    { q: 'Can the size of an array change after it is created?', a: 'No. Array.Resize actually creates a NEW array and copies the elements. For dynamic size use List<T>.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Student practical program: Find the maximum element in an array without using Max(). Use { 12, 45, 7, 89, 34 }.',
      hint: 'Start with max = arr[0] and compare every other element.',
      solution: `int[] arr = { 12, 45, 7, 89, 34 };
int max = arr[0];
for (int i = 1; i < arr.Length; i++)
{
    if (arr[i] > max) max = arr[i];
}
Console.WriteLine($"Maximum = {max}");
// Output: Maximum = 89`,
    },
    {
      task: 'Student practical program: Sort an array in ascending and descending order. First use bubble sort, then verify with Array.Sort.',
      hint: 'Bubble sort with nested loops; for descending change > to <.',
      solution: `int[] arr = { 29, 4, 17, 8, 1 };
for (int i = 0; i < arr.Length - 1; i++)
    for (int j = 0; j < arr.Length - 1 - i; j++)
        if (arr[j] > arr[j + 1])
        {
            int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
        }
Console.WriteLine("Ascending : " + string.Join(" ", arr));   // 1 4 8 17 29

int[] arr2 = { 29, 4, 17, 8, 1 };
Array.Sort(arr2);
Array.Reverse(arr2);
Console.WriteLine("Descending: " + string.Join(" ", arr2));  // 29 17 8 4 1`,
    },
    {
      task: 'Read 5 marks from the user into an array and print the total, average and the count of subjects passed (marks >= 35).',
      hint: 'Fill the array with a for loop and int.Parse(Console.ReadLine()).',
      solution: `int[] marks = new int[5];
for (int i = 0; i < marks.Length; i++)
{
    Console.Write($"Enter marks {i + 1}: ");
    marks[i] = int.Parse(Console.ReadLine() ?? "0");
}
int total = 0, passed = 0;
foreach (int m in marks)
{
    total += m;
    if (m >= 35) passed++;
}
Console.WriteLine($"Total = {total}, Average = {total / 5.0}, Passed = {passed}");`,
    },
    {
      task: 'Count the even and odd numbers in { 3, 8, 15, 22, 7, 10 } and print the sum of the even numbers.',
      hint: 'Use foreach and n % 2 == 0.',
      solution: `int[] nums = { 3, 8, 15, 22, 7, 10 };
int even = 0, odd = 0, evenSum = 0;
foreach (int n in nums)
{
    if (n % 2 == 0) { even++; evenSum += n; }
    else odd++;
}
Console.WriteLine($"Even = {even}, Odd = {odd}, Sum of even = {evenSum}");
// Output: Even = 3, Odd = 3, Sum of even = 40`,
    },
    {
      task: 'Linear search: ask the user for a number and print its position in { 10, 25, 30, 45, 50 } or "Not found".',
      hint: 'Loop with an index; use a found flag and break.',
      solution: `int[] data = { 10, 25, 30, 45, 50 };
Console.Write("Search for: ");
int key = int.Parse(Console.ReadLine() ?? "0");
int pos = -1;
for (int i = 0; i < data.Length; i++)
{
    if (data[i] == key) { pos = i; break; }
}
Console.WriteLine(pos >= 0 ? $"Found at index {pos}" : "Not found");
// 45 -> Found at index 3`,
    },
    {
      task: 'Add two 2x2 matrices { {1,2},{3,4} } and { {5,6},{7,8} } and print the result matrix.',
      hint: 'result[i, j] = a[i, j] + b[i, j] with nested loops.',
      solution: `int[,] a = { { 1, 2 }, { 3, 4 } };
int[,] b = { { 5, 6 }, { 7, 8 } };
int[,] sum = new int[2, 2];
for (int i = 0; i < 2; i++)
{
    for (int j = 0; j < 2; j++)
    {
        sum[i, j] = a[i, j] + b[i, j];
        Console.Write(sum[i, j] + " ");
    }
    Console.WriteLine();
}
// 6 8
// 10 12`,
    },
  ],
  quiz: [
    {
      question: 'What is the last valid index of int[] a = new int[6]?',
      options: ['6', '5', '0', '7'],
      answer: 1,
      explanation: 'Indexes run from 0 to Length - 1, so 0 to 5.',
    },
    {
      question: 'What is the default value of each element in new string[3]?',
      options: ['"" (empty string)', '"0"', 'null', 'A compile error'],
      answer: 2,
      explanation: 'string is a reference type, so its default is null.',
    },
    {
      question: 'For int[,] t = new int[4, 3], what does t.GetLength(0) return?',
      options: ['4', '3', '12', '7'],
      answer: 0,
      explanation: 'GetLength(0) is the size of the first dimension (rows) = 4.',
    },
    {
      question: 'Which code sorts an int array named nums in descending order?',
      options: ['Array.Reverse(nums);', 'Array.Sort(nums, true);', 'nums.SortDesc();', 'Array.Sort(nums); Array.Reverse(nums);'],
      answer: 3,
      explanation: 'Sort ascending first, then reverse.',
    },
    {
      question: 'Which declaration creates a jagged array?',
      options: ['int[,] a = new int[2, 3];', 'int a[][] = new int[2];', 'int[][] a = new int[2][];', 'int[2][] a;'],
      answer: 2,
      explanation: 'A jagged array uses two pairs of brackets in the type: int[][] and the outer size is given when creating it.',
    },
  ],
};
