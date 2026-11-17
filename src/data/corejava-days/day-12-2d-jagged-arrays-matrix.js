const j = String.raw;

const ex1 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] empty = new int[2][3];                 // 2 rows, 3 columns, all 0
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6}
        };

        System.out.println("empty  = " + Arrays.deepToString(empty));
        System.out.println("matrix = " + Arrays.deepToString(matrix));
        System.out.println("rows = " + matrix.length + ", columns = " + matrix[0].length);
        System.out.println("matrix[1][2] = " + matrix[1][2]);

        matrix[0][1] = 20;                             // update one cell
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                System.out.print(matrix[r][c]);
                if (c < matrix[r].length - 1) System.out.print(" ");
            }
            System.out.println();
        }

        for (int[] row : matrix) {                     // for-each version
            System.out.println(Arrays.toString(row));
        }
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        int rows = 5;
        int[][] pascal = new int[rows][];              // jagged: columns not fixed

        for (int r = 0; r < rows; r++) {
            pascal[r] = new int[r + 1];                // row r has r + 1 elements
            pascal[r][0] = 1;
            pascal[r][r] = 1;
            for (int c = 1; c < r; c++) {
                pascal[r][c] = pascal[r - 1][c - 1] + pascal[r - 1][c];
            }
        }

        for (int[] row : pascal) {
            for (int c = 0; c < row.length; c++) {
                System.out.print(row[c]);
                if (c < row.length - 1) System.out.print(" ");
            }
            System.out.println();
        }
        System.out.println("Length of last row: " + pascal[rows - 1].length);
    }
}`;

const ex3 = j`public class Main {
    static void print(String title, int[][] m) {
        System.out.println(title);
        for (int[] row : m) {
            for (int value : row) {
                System.out.printf("%4d", value);
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3, 4}};
        int[][] b = {{5, 6}, {7, 8}};
        int n = a.length;

        int[][] sum = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n; k++) {
                sum[i][k] = a[i][k] + b[i][k];
            }
        }

        int[][] product = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n; k++) {
                for (int x = 0; x < n; x++) {
                    product[i][k] += a[i][x] * b[x][k];
                }
            }
        }

        print("A + B:", sum);
        print("A x B:", product);
    }
}`;

const ex4 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int n = m.length;

        int[][] t = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n; k++) {
                t[k][i] = m[i][k];
            }
        }
        System.out.println("Transpose: " + Arrays.deepToString(t));

        int primary = 0, secondary = 0;
        for (int i = 0; i < n; i++) {
            primary += m[i][i];
            secondary += m[i][n - 1 - i];
        }
        System.out.println("Primary diagonal sum = " + primary);
        System.out.println("Secondary diagonal sum = " + secondary);

        for (int i = 0; i < n; i++) {
            int rowSum = 0, colSum = 0;
            for (int k = 0; k < n; k++) {
                rowSum += m[i][k];
                colSum += m[k][i];
            }
            System.out.println("Row " + i + " sum = " + rowSum + ", Column " + i + " sum = " + colSum);
        }
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        String[] students = {"Asha", "Ravi", "Meena"};
        String[] subjects = {"Java", "SQL", "Web"};
        int[][] marks = {
            {80, 75, 90},
            {65, 88, 70},
            {92, 85, 78}
        };

        System.out.printf("%-8s%6s%6s%6s%7s%n", "Name", subjects[0], subjects[1], subjects[2], "Total");
        int topIndex = 0;
        int topTotal = -1;
        for (int s = 0; s < students.length; s++) {
            int total = 0;
            System.out.printf("%-8s", students[s]);
            for (int sub = 0; sub < subjects.length; sub++) {
                System.out.printf("%6d", marks[s][sub]);
                total += marks[s][sub];
            }
            System.out.printf("%7d%n", total);
            if (total > topTotal) {
                topTotal = total;
                topIndex = s;
            }
        }
        System.out.println("Topper: " + students[topIndex] + " with " + topTotal);
    }
}`;

export default {
  id: 'day-12-2d-jagged-arrays-matrix',
  title: '2D Arrays, Jagged Arrays, Matrix Programs',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 12,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Work with tables of data using two-dimensional arrays, build jagged arrays whose rows have different lengths, and write the classic matrix programs: addition, multiplication, transpose and diagonal sums.',
  objectives: [
    'Declare, create and initialise 2D arrays and access cells with [row][column]',
    'Traverse 2D arrays with nested for and for-each loops',
    'Create jagged arrays and explain how Java stores 2D arrays as arrays of arrays',
    'Write matrix addition, multiplication, transpose and diagonal programs',
    'Use Arrays.deepToString to print multidimensional arrays',
  ],
  theory: [
    {
      heading: 'What is a 2D Array?',
      content: j`A 2D array stores data in rows and columns, like an Excel sheet, a cinema seating chart or a chess board.

int[][] seats = new int[3][4];    // 3 rows, 4 columns

            col 0  col 1  col 2  col 3
   row 0  [   0  ,   0  ,   0  ,   0  ]
   row 1  [   0  ,   0  ,   0  ,   0  ]
   row 2  [   0  ,   0  ,   0  ,   0  ]

Access: seats[row][column]. seats[1][2] is row 1, column 2.
Number of rows: seats.length (3)
Number of columns in row r: seats[r].length (4)`,
      syntax: j`int[][] a = new int[rows][cols];
int[][] b = { {1, 2, 3}, {4, 5, 6} };
int c[][] = new int[2][2];   // also valid
int[] d[] = new int[2][2];   // valid but confusing`,
    },
    {
      heading: 'How Java Stores 2D Arrays: Array of Arrays',
      content: j`Java has no true rectangular matrix. A 2D array is an array whose elements are references to 1D arrays:

matrix ---> [ ref0 , ref1 ]
               |       |
               v       v
            [1,2,3] [4,5,6]

Consequences:
- Each row is a separate object, so rows can have different lengths (jagged arrays).
- matrix[0] is itself a 1D array, so you can pass a single row to a method or use Arrays.toString(matrix[0]).
- Arrays.toString(matrix) prints row references; use Arrays.deepToString(matrix).
- You can swap entire rows by swapping references.`,
    },
    {
      heading: 'Jagged (Ragged) Arrays',
      content: j`A jagged array has rows of different lengths. Create the outer array first, leaving the column size empty, then create each row separately:

int[][] jag = new int[3][];   // only rows are fixed
jag[0] = new int[1];
jag[1] = new int[3];
jag[2] = new int[2];

Or with literals:
int[][] jag = { {1}, {2, 3, 4}, {5, 6} };

Real-world uses: marks of students who took different numbers of tests, Pascal's triangle, seats per row in a theatre with curved rows - saving memory compared to a full rectangle.

Always use jag[r].length for the inner loop, never a fixed column count. new int[][3] is invalid: the first dimension must be given.`,
    },
    {
      heading: 'Traversing 2D Arrays',
      content: j`Outer loop over rows, inner loop over columns of that row:

for (int r = 0; r < m.length; r++) {
    for (int c = 0; c < m[r].length; c++) {
        System.out.print(m[r][c] + " ");
    }
    System.out.println();
}

for-each version:
for (int[] row : m) {
    for (int value : row) {
        System.out.print(value + " ");
    }
    System.out.println();
}

Column-wise traversal (for rectangular arrays): swap the loops - outer over columns, inner over rows, read m[r][c].`,
    },
    {
      heading: 'Matrix Operations',
      content: j`Addition (same dimensions):  C[i][j] = A[i][j] + B[i][j]

Multiplication (A is m x n, B is n x p, result m x p):
C[i][j] = sum over x of A[i][x] * B[x][j]
Rule: columns of A must equal rows of B. It needs three nested loops: O(n^3).

Transpose: rows become columns. T[j][i] = M[i][j]. A 2 x 3 matrix becomes 3 x 2.

Diagonals of a square n x n matrix:
- Primary diagonal: M[i][i]       (top-left to bottom-right)
- Secondary diagonal: M[i][n-1-i] (top-right to bottom-left)

Identity matrix: 1 on the primary diagonal, 0 elsewhere.
Symmetric matrix: equals its transpose.`,
      tip: 'For multiplication, remember "row of A times column of B". Write out C[0][0] by hand once and the loop structure becomes clear.',
    },
  ],
  examples: [
    {
      title: 'Creating, accessing and printing a 2D array',
      scenario: 'Create a 2 x 3 matrix, read and update cells, and print it in three different ways.',
      steps: [
        'Create class Main and import java.util.Arrays',
        'Write the nested loop that prints a space only between values',
        'Run and compare deepToString with the loop output',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `empty  = [[0, 0, 0], [0, 0, 0]]
matrix = [[1, 2, 3], [4, 5, 6]]
rows = 2, columns = 3
matrix[1][2] = 6
1 20 3
4 5 6
[1, 20, 3]
[4, 5, 6]`,
      explanation: 'new int[2][3] fills every cell with 0. matrix.length is the row count, matrix[0].length the column count. matrix[1][2] is row 1, column 2 = 6. After matrix[0][1] = 20 the first row is 1 20 3. Each row is a 1D array, so Arrays.toString(row) works.',
    },
    {
      title: 'Jagged array: Pascal\'s triangle',
      scenario: 'Build Pascal\'s triangle where row r has r + 1 numbers, using a jagged array.',
      steps: [
        'Create the outer array with new int[rows][]',
        'Inside the loop create each row with new int[r + 1]',
        'Each inner value is the sum of the two values above it; run',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
Length of last row: 5`,
      explanation: 'Every row starts and ends with 1. Row 3, column 1 = row 2 col 0 + row 2 col 1 = 1 + 2 = 3. Row 4, column 2 = 3 + 3 = 6. Rows have lengths 1 to 5, which is exactly what a jagged array is for.',
    },
    {
      title: 'Matrix addition and multiplication',
      scenario: 'Add and multiply two 2 x 2 matrices and print them aligned.',
      steps: [
        'Write a helper method print that prints each value with printf("%4d")',
        'Use two loops for addition and three loops for multiplication',
        'Run and verify the product by hand',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `A + B:
   6   8
  10  12
A x B:
  19  22
  43  50`,
      explanation: 'Sum: 1+5=6, 2+6=8, 3+7=10, 4+8=12. Product: C[0][0] = 1*5 + 2*7 = 19, C[0][1] = 1*6 + 2*8 = 22, C[1][0] = 3*5 + 4*7 = 43, C[1][1] = 3*6 + 4*8 = 50. %4d right-aligns each number in 4 characters.',
    },
    {
      title: 'Transpose, diagonals, row and column sums',
      scenario: 'Analyse a 3 x 3 matrix completely.',
      steps: [
        'Fill the transpose with t[k][i] = m[i][k]',
        'Add m[i][i] and m[i][n-1-i] for the diagonals',
        'Compute row and column sums together in one nested loop and run',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Transpose: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
Primary diagonal sum = 15
Secondary diagonal sum = 15
Row 0 sum = 6, Column 0 sum = 12
Row 1 sum = 15, Column 1 sum = 15
Row 2 sum = 24, Column 2 sum = 18`,
      explanation: 'Rows become columns in the transpose. Primary: 1 + 5 + 9 = 15. Secondary: 3 + 5 + 7 = 15. Row sums: 6, 15, 24. Column sums: 1+4+7 = 12, 2+5+8 = 15, 3+6+9 = 18.',
    },
    {
      title: 'Student marks table and topper',
      scenario: 'A class teacher stores 3 students x 3 subjects marks and wants totals and the topper.',
      steps: [
        'Keep student names and subject names in 1D arrays, marks in a 2D array',
        'Print a formatted table with printf widths',
        'Track the highest total and its index; run',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Name      Java   SQL   Web  Total
Asha        80    75    90    245
Ravi        65    88    70    223
Meena       92    85    78    255
Topper: Meena with 255`,
      explanation: 'Each row of marks belongs to one student. Totals: 80+75+90 = 245, 65+88+70 = 223, 92+85+78 = 255. %-8s left-aligns names in 8 characters, %6d and %7d right-align the numbers. The highest total 255 belongs to Meena.',
    },
  ],
  interview: [
    { q: 'How is a 2D array stored in Java?', a: 'As an array of references to 1D arrays (array of arrays). Each row is a separate object, which allows jagged arrays.', level: 'Medium' },
    { q: 'What is a jagged array?', a: 'A 2D array whose rows have different lengths, e.g. new int[3][] followed by creating each row with its own size.', level: 'Easy' },
    { q: 'Is new int[][5] valid?', a: 'No. The first (leftmost) dimension must be specified. new int[5][] is valid.', level: 'Medium' },
    { q: 'How do you get the number of rows and columns?', a: 'Rows: arr.length. Columns of row r: arr[r].length.', level: 'Easy' },
    { q: 'What is the output: int[][] a = {{1,2},{3,4,5}}; System.out.println(a[1].length);', a: '3. Row 1 has three elements.', level: 'Easy' },
    { q: 'What is the condition for multiplying two matrices?', a: 'Number of columns of the first matrix must equal number of rows of the second. Result is rows(A) x cols(B).', level: 'Easy' },
    { q: 'What is the time complexity of naive matrix multiplication?', a: 'O(n^3) for two n x n matrices.', level: 'Medium' },
    { q: 'How do you print a 2D array in one line?', a: 'System.out.println(Arrays.deepToString(arr));', level: 'Easy' },
    { q: 'What is the default value of int[][] a = new int[2][2]; a[1][1]?', a: '0.', level: 'Easy' },
    { q: 'What does int[][] a = new int[2][]; System.out.println(a[0]); print?', a: 'null. The rows are not created yet; accessing a[0][0] would throw NullPointerException.', level: 'Hard' },
    { q: 'How do you check whether a square matrix is symmetric?', a: 'Check m[i][j] == m[j][i] for all i, j (it equals its transpose).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Print the identity matrix of size 4.',
      hint: 'Print 1 when row == column, else 0.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int n = 4;
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n; k++) {
                System.out.print((i == k ? 1 : 0) + " ");
            }
            System.out.println();
        }
    }
}`,
    },
    {
      task: 'Find the largest element in a 2D array and its position.',
      hint: 'Track max, maxRow and maxCol while traversing.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[][] m = {{3, 17, 8}, {21, 4, 9}, {6, 15, 11}};
        int max = m[0][0], row = 0, col = 0;
        for (int i = 0; i < m.length; i++) {
            for (int k = 0; k < m[i].length; k++) {
                if (m[i][k] > max) {
                    max = m[i][k];
                    row = i;
                    col = k;
                }
            }
        }
        System.out.println("Max " + max + " at [" + row + "][" + col + "]");
    }
}`,
    },
    {
      task: 'Check whether a square matrix is symmetric.',
      hint: 'Compare m[i][k] with m[k][i].',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 7, 3}, {7, 4, 5}, {3, 5, 6}};
        boolean symmetric = true;
        for (int i = 0; i < m.length && symmetric; i++) {
            for (int k = 0; k < m.length; k++) {
                if (m[i][k] != m[k][i]) {
                    symmetric = false;
                    break;
                }
            }
        }
        System.out.println("Symmetric? " + symmetric);
    }
}`,
    },
    {
      task: 'Read a 2 x 3 matrix from the user and print it with each row sum.',
      hint: 'Nested loop with sc.nextInt(), then another nested loop to print.',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[][] m = new int[2][3];
        System.out.println("Enter 6 numbers:");
        for (int i = 0; i < 2; i++) {
            for (int k = 0; k < 3; k++) {
                m[i][k] = sc.nextInt();
            }
        }
        for (int[] row : m) {
            int sum = 0;
            for (int v : row) {
                System.out.print(v + " ");
                sum += v;
            }
            System.out.println("| sum = " + sum);
        }
    }
}`,
    },
    {
      task: 'Print a matrix in spiral order: {{1,2,3},{4,5,6},{7,8,9}} -> 1 2 3 6 9 8 7 4 5.',
      hint: 'Maintain top, bottom, left, right boundaries and shrink them after each side.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) System.out.print(m[top][c] + " ");
            top++;
            for (int r = top; r <= bottom; r++) System.out.print(m[r][right] + " ");
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) System.out.print(m[bottom][c] + " ");
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) System.out.print(m[r][left] + " ");
                left++;
            }
        }
        System.out.println();
    }
}`,
    },
  ],
  quiz: [
    { question: 'For int[][] a = new int[4][6], what is a.length?', options: ['6', '24', '4', '10'], answer: 2, explanation: 'a.length gives the number of rows.' },
    { question: 'Which creates a jagged array correctly?', options: ['int[][] a = new int[][3];', 'int[][] a = new int[3][];', 'int[][] a = new int[];', 'int a = new int[3][];'], answer: 1, explanation: 'Only the first dimension is required.' },
    { question: 'Which element is on the secondary diagonal of a 3 x 3 matrix m?', options: ['m[1][2]', 'm[0][0]', 'm[2][1]', 'm[0][2]'], answer: 3, explanation: 'Secondary diagonal is m[i][n-1-i]: m[0][2], m[1][1], m[2][0].' },
    { question: 'Matrix A is 2 x 3 and B is 3 x 4. What is the size of A x B?', options: ['2 x 4', '3 x 3', '4 x 2', 'Not possible'], answer: 0, explanation: 'Result is rows(A) x cols(B) = 2 x 4.' },
    { question: 'What prints? int[][] a = {{1, 2}, {3, 4}}; System.out.println(a[1][0] + a[0][1]);', options: ['3', '5', '7', '4'], answer: 1, explanation: 'a[1][0] = 3 and a[0][1] = 2, total 5.' },
  ],
};
