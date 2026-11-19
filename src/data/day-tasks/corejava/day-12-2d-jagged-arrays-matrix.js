export default {
  lesson: 'day-12-2d-jagged-arrays-matrix',
  minutes: 22,
  intro: 'Work with 2D and jagged arrays: rows, columns, diagonals, transpose and deepToString.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Create a 2D int array with **3 rows and 4 columns**:
\`int[][] seats = ____;\``,
      example: { title: 'a 2 × 2 table of doubles', code: 'double[][] sales = new double[2][2];' },
      accept: ['new int[3][4]'],
      acceptRegex: ['^new\\s+int\\s*\\[\\s*3\\s*\\]\\s*\\[\\s*4\\s*\\]\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`new int[rows][columns]` → `new int[3][4]` gives 3 rows, each an array of 4 ints set to 0. Swapping the numbers gives 4 rows of 3 columns.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Inside a nested loop over \`int[][] m\`, complete the inner loop condition so it works for **any row length** (including jagged arrays):
\`for (int i = 0; i < m.length; i++)\`
\`  for (int j = 0; j < ____; j++)\``,
      example: { title: 'number of rows', code: 'int rows = m.length;' },
      accept: ['m[i].length'],
      acceptRegex: ['^m\\s*\\[\\s*i\\s*\\]\\s*\\.\\s*length\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`m.length` is the number of **rows**; `m[i].length` is the number of columns in row i. Using `m[0].length` works only for rectangular arrays and breaks on jagged ones.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Matrix programs: what does this print?',
      example: {
        title: 'printing a 2D array',
        code: `int[][] g = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepToString(g)); // [[1, 2], [3, 4]]`,
      },
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        int diag = 0, anti = 0;
        int n = m.length;
        int[][] t = new int[n][n];
        for (int i = 0; i < n; i++) {
            diag += m[i][i];
            anti += m[i][n - 1 - i];
            for (int j = 0; j < n; j++) t[j][i] = m[i][j];
        }
        System.out.println(m[1][2]);
        System.out.println(diag + " " + anti);
        System.out.println(Arrays.deepToString(t));
    }
}`,
      expected: `6
15 15
[[1, 4, 7], [2, 5, 8], [3, 6, 9]]`,
      explain: '`m[1][2]` is row 1, column 2 → 6. Main diagonal = 1 + 5 + 9 = 15, anti-diagonal = 3 + 5 + 7 = 15. The transpose swaps rows and columns (`t[j][i] = m[i][j]`), so the first row becomes 1, 4, 7.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Jagged array: what does this print?',
      example: {
        title: 'rows of different length',
        code: `int[][] j = new int[2][];
j[0] = new int[3];
j[1] = new int[1];`,
      },
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] j = new int[3][];
        j[0] = new int[2];
        j[1] = new int[]{1, 2, 3};
        j[2] = new int[1];
        j[2][0] = 9;
        System.out.println(j[0].length + " " + j[1].length + " " + j[2].length);
        System.out.println(j[0][1]);
        System.out.println(Arrays.deepToString(j));
    }
}`,
      expected: `2 3 1
0
[[0, 0], [1, 2, 3], [9]]`,
      explain: 'Java stores a 2D array as an **array of arrays**, so each row can have its own length (2, 3 and 1). New int rows are filled with 0, so `j[0][1]` is 0. `Arrays.deepToString` prints nested arrays; plain `toString` would print addresses like `[[I@1b6d3586`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Matrix A is 2 × 3 and matrix B is 3 × 4. Can you multiply A × B, and what is the result size?',
      options: ['No, the sizes must be equal', 'Yes, the result is 2 × 4', 'Yes, the result is 3 × 3', 'Yes, the result is 3 × 4'],
      answer: 1,
      explain: 'Multiplication needs **columns of A = rows of B** (3 = 3). The result has the rows of A and the columns of B: 2 × 4. Matrix addition, in contrast, needs both matrices to have exactly the same size.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`int[][] grid = new int[4][5];` What is `grid.length`?',
      options: ['4', '5', '20', '9'],
      answer: 0,
      explain: '`grid.length` is the number of **rows** (4). Each row `grid[i]` has length 5, and the total number of cells is 4 × 5 = 20.',
    },
  ],
};
