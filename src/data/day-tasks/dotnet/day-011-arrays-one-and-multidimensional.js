export default {
  lesson: 'day-011-arrays-one-and-multidimensional',
  minutes: 18,
  intro: 'Practise one-dimensional arrays, 2D (rectangular) arrays, jagged arrays and the Array helper methods.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Declare an `int` array named `marks` that can hold **5** numbers (all start at 0). Write the full statement.',
      example: { title: 'array of 3 strings', code: 'string[] names = new string[3];' },
      accept: ['int[] marks = new int[5];'],
      acceptRegex: ['^(int\\[\\]|var)\\s+marks\\s*=\\s*new\\s+int\\s*\\[\\s*5\\s*\\]\\s*;?$'],
      explain: '`new int[5]` creates an array of 5 elements with indexes **0 to 4**. Numeric elements default to 0, bool to false and reference types (like string) to null. The size is fixed once created.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      example: { title: 'reading an array', code: 'int[] a = { 5, 10, 15 };\nConsole.WriteLine(a.Length);        // 3\nConsole.WriteLine(a[a.Length - 1]);  // 15' },
      code: `int[] sales = { 120, 80, 150, 95 };
int total = 0;
int max = sales[0];
foreach (int s in sales)
{
    total += s;
    if (s > max) max = s;
}
Console.WriteLine(sales.Length);
Console.WriteLine(total);
Console.WriteLine(max);
Console.WriteLine(total / sales.Length);`,
      expected: `4
445
150
111`,
      explain: '`Length` is 4. The sum is 120 + 80 + 150 + 95 = 445 and the largest is 150. 445 / 4 is **integer division** → 111 (not 111.25).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`int[] a = new int[3]; a[3] = 7;` What happens?',
      options: ['a[3] becomes 7 and the array grows', 'Compile error', 'IndexOutOfRangeException at runtime', 'Nothing, the line is ignored'],
      answer: 2,
      explain: 'Valid indexes are 0, 1, 2. Index 3 is outside the array, so the CLR throws **IndexOutOfRangeException** at runtime. Arrays never grow; use `List<T>` if you need that.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A 2D array of marks (rows = students, columns = subjects). What does this print?',
      example: { title: 'rectangular array', code: 'int[,] grid = new int[2, 3];\nConsole.WriteLine(grid.GetLength(0)); // 2 rows\nConsole.WriteLine(grid.GetLength(1)); // 3 columns' },
      code: `int[,] marks = {
    { 70, 85, 90 },
    { 60, 75, 55 }
};
Console.WriteLine(marks[1, 2]);
Console.WriteLine(marks.Length);
for (int r = 0; r < marks.GetLength(0); r++)
{
    int sum = 0;
    for (int c = 0; c < marks.GetLength(1); c++)
        sum += marks[r, c];
    Console.WriteLine($"Student {r + 1}: {sum}");
}`,
      expected: `55
6
Student 1: 245
Student 2: 190`,
      explain: '`marks[1, 2]` is row 1, column 2 (both zero-based) → 55. For a 2D array `Length` is the **total** number of elements (2 × 3 = 6); use `GetLength(0)` for rows and `GetLength(1)` for columns.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Jagged array + Array methods: what does this print?',
      example: { title: 'Array.Sort and Array.IndexOf', code: 'int[] n = { 3, 1, 2 };\nArray.Sort(n);              // n is now 1, 2, 3\nConsole.WriteLine(Array.IndexOf(n, 3)); // 2' },
      code: `int[][] batches = new int[2][];
batches[0] = new int[] { 1, 2, 3 };
batches[1] = new int[] { 4, 5 };
Console.WriteLine(batches[1].Length);

int[] fees = { 500, 200, 900, 100 };
Array.Sort(fees);
Console.WriteLine(string.Join(",", fees));
Array.Reverse(fees);
Console.WriteLine(fees[0]);`,
      expected: `2
100,200,500,900
900`,
      explain: 'A **jagged** array is an array of arrays, so each row can have a different length (row 1 has 2). `Array.Sort` sorts ascending in place, `Array.Reverse` flips it, so the first element becomes 900.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about C# arrays are TRUE? (choose all that apply)',
      options: [
        'Array indexes start at 0',
        'An array\'s size can be changed with arr.Length = 10',
        'Arrays are reference types',
        'int[,] is a rectangular (2D) array and int[][] is a jagged array',
        'A new string[3] contains three empty strings ""',
      ],
      answers: [0, 2, 3],
      explain: 'Indexes start at 0, arrays are reference types (stored on the heap) and `[,]` vs `[][]` is rectangular vs jagged. `Length` is read-only (size is fixed) and a new `string[3]` contains three **null** values, not empty strings.',
    },
  ],
};
