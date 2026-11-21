export default [
  {
    id: 'mx-transpose',
    title: 'Transpose of a Matrix',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant'],
    statement: "Given an `m x n` matrix, return its transpose: the `n x m` matrix whose row `i` is column `i` of the original (so `result[j][i] = matrix[i][j]`).",
    examples: [
      { input: 'matrix = [[1, 2, 3], [4, 5, 6]]', output: '[[1, 4], [2, 5], [3, 6]]' },
      { input: 'matrix = [[5]]', output: '[[5]]' },
    ],
    constraints: ['1 <= m, n <= 1000', '-10^9 <= matrix[i][j] <= 10^9'],
    hints: ['The result has n rows and m columns.', 'Copy matrix[i][j] into result[j][i].'],
    approach: "Create an `n x m` result matrix. Loop over every cell `(i, j)` of the input and write its value to `result[j][i]`. Each element is copied exactly once, so the work is proportional to the number of cells. For a square matrix you could swap `matrix[i][j]` with `matrix[j][i]` above the diagonal in place, but a rectangular matrix changes shape, so a new matrix is required. There is no faster method since every element must move.",
    complexity: 'Time O(m n), Space O(m n) for the output',
    fn: { py: 'transpose', js: 'transpose' },
    py: {
      starter: 'def transpose(matrix):\n    # write your code here\n    pass\n',
      solution: `def transpose(matrix):
    m, n = len(matrix), len(matrix[0])
    res = [[0] * m for _ in range(n)]
    for i in range(m):
        for j in range(n):
            res[j][i] = matrix[i][j]
    return res
`,
    },
    js: {
      starter: 'function transpose(matrix) {\n  // write your code here\n}\n',
      solution: `function transpose(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const res = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) res[j][i] = matrix[i][j];
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] },
      { args: [[[1, 2, 3], [4, 5, 6]]], expect: [[1, 4], [2, 5], [3, 6]] },
      { args: [[[5]]], expect: [[5]] },
      { args: [[[1], [2], [3]]], expect: [[1, 2, 3]] },
      { args: [[[1, 2]]], expect: [[1], [2]] },
      { args: [[[-1, 0], [0, -1]]], expect: [[-1, 0], [0, -1]] },
    ],
  },
  {
    id: 'mx-matrix-multiplication',
    title: 'Matrix Multiplication',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['TCS', 'Accenture', 'Capgemini', 'Samsung'],
    statement: "Given an `m x k` matrix `a` and a `k x n` matrix `b`, return their product `a * b`, an `m x n` matrix where `result[i][j]` is the sum of `a[i][t] * b[t][j]` over all `t`.",
    examples: [
      { input: 'a = [[1, 2], [3, 4]], b = [[5, 6], [7, 8]]', output: '[[19, 22], [43, 50]]', explain: '19 = 1*5 + 2*7, 22 = 1*6 + 2*8, and so on.' },
      { input: 'a = [[1, 2, 3]], b = [[4], [5], [6]]', output: '[[32]]' },
    ],
    constraints: ['1 <= m, k, n <= 100', '-100 <= a[i][j], b[i][j] <= 100'],
    hints: ['Row i of a meets column j of b.', 'Use three nested loops: i over rows of a, j over columns of b, t over the shared dimension.'],
    approach: "The entry in row `i` and column `j` of the product is the dot product of row `i` of `a` with column `j` of `b`. Create an `m x n` result filled with zeros. For each `i`, each `t`, and each `j`, add `a[i][t] * b[t][j]` to `result[i][j]`. Ordering the loops as i, t, j reads both matrices row by row, which is friendlier to memory caches than i, j, t, but both are O(m k n). Faster algorithms like Strassen's exist but are never expected in placement rounds.",
    complexity: 'Time O(m k n), Space O(m n)',
    fn: { py: 'multiply_matrices', js: 'multiplyMatrices' },
    py: {
      starter: 'def multiply_matrices(a, b):\n    # write your code here\n    pass\n',
      solution: `def multiply_matrices(a, b):
    m, k, n = len(a), len(b), len(b[0])
    res = [[0] * n for _ in range(m)]
    for i in range(m):
        for t in range(k):
            x = a[i][t]
            if x:
                row = b[t]
                for j in range(n):
                    res[i][j] += x * row[j]
    return res
`,
    },
    js: {
      starter: 'function multiplyMatrices(a, b) {\n  // write your code here\n}\n',
      solution: `function multiplyMatrices(a, b) {
  const m = a.length, k = b.length, n = b[0].length;
  const res = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let t = 0; t < k; t++) {
      const x = a[i][t];
      if (x === 0) continue;
      for (let j = 0; j < n; j++) res[i][j] += x * b[t][j];
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expect: [[19, 22], [43, 50]] },
      { args: [[[1, 0], [0, 1]], [[9, 8], [7, 6]]], expect: [[9, 8], [7, 6]] },
      { args: [[[1, 2, 3]], [[4], [5], [6]]], expect: [[32]] },
      { args: [[[4], [5], [6]], [[1, 2, 3]]], expect: [[4, 8, 12], [5, 10, 15], [6, 12, 18]] },
      { args: [[[2]], [[3]]], expect: [[6]] },
      { args: [[[1, 0, 2], [-1, 3, 1]], [[3, 1], [2, 1], [1, 0]]], expect: [[5, 1], [4, 2]] },
      { args: [[[0, 0], [0, 0]], [[1, 2], [3, 4]]], expect: [[0, 0], [0, 0]] },
    ],
  },
  {
    id: 'mx-row-with-max-ones',
    title: 'Row with Maximum 1s',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'TCS', 'Paytm', 'Infosys'],
    statement: "Every row of the binary matrix `mat` is sorted, so all its `0`s come before its `1`s. Return the index of the row that contains the most `1`s. If several rows tie, return the smallest index. If the matrix has no `1` at all, return `-1`.",
    examples: [
      { input: 'mat = [[0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 1, 1], [0, 0, 0, 0]]', output: '2' },
      { input: 'mat = [[0, 0], [0, 0]]', output: '-1' },
    ],
    constraints: ['1 <= m, n <= 1000', 'mat[i][j] is 0 or 1', 'Each row is sorted in non-decreasing order'],
    hints: ['Counting every row costs O(m n); binary search per row costs O(m log n).', 'Start at the top-right corner. Move left while you see 1s, and move down otherwise.'],
    approach: "Start at the top-right cell with `col = n - 1`. For each row from top to bottom, while `col >= 0` and `mat[r][col]` is 1, move `col` one step left and remember `r` as the best row so far. Moving left means this row has more 1s than any earlier row. If the current cell is 0, this row cannot beat the best one, so just go to the next row. The pointer moves left at most n times and down m times, giving O(m + n). Ties keep the earlier row because a later row only wins if it pushes the pointer further left. Binary searching each row is O(m log n), and counting is O(m n).",
    complexity: 'Time O(m + n), Space O(1)',
    fn: { py: 'row_with_max_ones', js: 'rowWithMaxOnes' },
    py: {
      starter: 'def row_with_max_ones(mat):\n    # write your code here\n    pass\n',
      solution: `def row_with_max_ones(mat):
    col = len(mat[0]) - 1
    best = -1
    for r in range(len(mat)):
        while col >= 0 and mat[r][col] == 1:
            col -= 1
            best = r
    return best
`,
    },
    js: {
      starter: 'function rowWithMaxOnes(mat) {\n  // write your code here\n}\n',
      solution: `function rowWithMaxOnes(mat) {
  let col = mat[0].length - 1, best = -1;
  for (let r = 0; r < mat.length; r++) {
    while (col >= 0 && mat[r][col] === 1) { col--; best = r; }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[[0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 1, 1], [0, 0, 0, 0]]], expect: 2 },
      { args: [[[0, 0], [1, 1]]], expect: 1 },
      { args: [[[0, 0], [0, 0]]], expect: -1 },
      { args: [[[1]]], expect: 0 },
      { args: [[[0, 1], [0, 1], [0, 1]]], expect: 0 },
      { args: [[[0, 0, 1], [0, 1, 1], [0, 1, 1]]], expect: 1 },
    ],
  },
  {
    id: 'mx-diagonal-sum',
    title: 'Matrix Diagonal Sum',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['TCS', 'Wipro', 'Adobe'],
    statement: "Given a square matrix `mat`, return the sum of the elements on its primary diagonal (top-left to bottom-right) and its secondary diagonal (top-right to bottom-left). If the size is odd, the centre element belongs to both diagonals but is counted only **once**.",
    examples: [
      { input: 'mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '25', explain: '1 + 5 + 9 + 3 + 7; the centre 5 is counted once.' },
      { input: 'mat = [[1, 2], [3, 4]]', output: '10' },
    ],
    constraints: ['1 <= n <= 100', '1 <= mat[i][j] <= 100'],
    hints: ['Row i has primary element mat[i][i] and secondary element mat[i][n-1-i].', 'They are the same cell only when i == n - 1 - i.'],
    approach: "Loop over the rows once. Row `i` contributes `mat[i][i]` from the primary diagonal and `mat[i][n-1-i]` from the secondary diagonal. When `i == n - 1 - i`, which happens only in the middle row of an odd-sized matrix, both refer to the same cell, so add it only once. This touches 2n cells, giving linear time in n. Scanning the whole matrix and testing each cell would be O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'diagonal_sum', js: 'diagonalSum' },
    py: {
      starter: 'def diagonal_sum(mat):\n    # write your code here\n    pass\n',
      solution: `def diagonal_sum(mat):
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i]
        if i != n - 1 - i:
            total += mat[i][n - 1 - i]
    return total
`,
    },
    js: {
      starter: 'function diagonalSum(mat) {\n  // write your code here\n}\n',
      solution: `function diagonalSum(mat) {
  const n = mat.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += mat[i][i];
    if (i !== n - 1 - i) total += mat[i][n - 1 - i];
  }
  return total;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: 25 },
      { args: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]], expect: 8 },
      { args: [[[5]]], expect: 5 },
      { args: [[[1, 2], [3, 4]]], expect: 10 },
      { args: [[[7, 3, 1, 9], [3, 4, 6, 9], [6, 9, 6, 6], [9, 5, 8, 5]]], expect: 55 },
      { args: [[[2, 1, 1], [1, 2, 1], [1, 1, 2]]], expect: 8 },
    ],
  },
  {
    id: 'mx-lucky-numbers',
    title: 'Lucky Numbers in a Matrix',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Oracle', 'Cognizant'],
    statement: "A **lucky number** in a matrix of distinct integers is an element that is the smallest in its row and the largest in its column. Return all lucky numbers in ascending order.",
    examples: [
      { input: 'matrix = [[3, 7, 8], [9, 11, 13], [15, 16, 17]]', output: '[15]', explain: '15 is the minimum of its row and the maximum of its column.' },
      { input: 'matrix = [[3, 6], [7, 1], [5, 2], [4, 8]]', output: '[]' },
    ],
    constraints: ['1 <= m, n <= 50', '1 <= matrix[i][j] <= 10^5', 'All elements are distinct'],
    hints: ['Precompute the minimum of every row and the maximum of every column.', 'A value is lucky exactly when it equals both its row minimum and its column maximum.'],
    approach: "Compute `rowMin[i]` for every row and `colMax[j]` for every column in one pass each. Then scan the matrix: a cell is lucky if its value equals both `rowMin[i]` and `colMax[j]`. Collect those values and sort them. In fact a matrix with distinct values has at most one lucky number, but the general scan is just as simple. The total work is linear in the number of cells. Checking each cell against its whole row and column separately is O(m n (m + n)).",
    complexity: 'Time O(m n), Space O(m + n)',
    fn: { py: 'lucky_numbers', js: 'luckyNumbers' },
    py: {
      starter: 'def lucky_numbers(matrix):\n    # write your code here\n    pass\n',
      solution: `def lucky_numbers(matrix):
    row_min = [min(row) for row in matrix]
    col_max = [max(col) for col in zip(*matrix)]
    res = []
    for i, row in enumerate(matrix):
        for j, v in enumerate(row):
            if v == row_min[i] and v == col_max[j]:
                res.append(v)
    return sorted(res)
`,
    },
    js: {
      starter: 'function luckyNumbers(matrix) {\n  // write your code here\n}\n',
      solution: `function luckyNumbers(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const rowMin = matrix.map((row) => Math.min(...row));
  const colMax = new Array(n).fill(-Infinity);
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) colMax[j] = Math.max(colMax[j], matrix[i][j]);
  const res = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === rowMin[i] && matrix[i][j] === colMax[j]) res.push(matrix[i][j]);
    }
  }
  return res.sort((a, b) => a - b);
}
`,
    },
    tests: [
      { args: [[[3, 7, 8], [9, 11, 13], [15, 16, 17]]], expect: [15] },
      { args: [[[1, 10, 4, 2], [9, 3, 8, 7], [15, 16, 17, 12]]], expect: [12] },
      { args: [[[7, 8], [1, 2]]], expect: [7] },
      { args: [[[1]]], expect: [1] },
      { args: [[[3, 6], [7, 1], [5, 2], [4, 8]]], expect: [] },
      { args: [[[5, 9], [6, 10]]], expect: [6] },
    ],
  },
  {
    id: 'mx-toeplitz-matrix',
    title: 'Toeplitz Matrix',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Facebook', 'Infosys'],
    statement: "A matrix is **Toeplitz** if every diagonal running from top-left to bottom-right contains equal elements. Given an `m x n` matrix, return `true` if it is Toeplitz.",
    examples: [
      { input: 'matrix = [[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]', output: 'true' },
      { input: 'matrix = [[1, 2], [2, 2]]', output: 'false', explain: 'The main diagonal has 1 and 2.' },
    ],
    constraints: ['1 <= m, n <= 20', '0 <= matrix[i][j] <= 99'],
    hints: ['Two cells are on the same diagonal when they are one step down and one step right of each other.', 'Compare each cell with its top-left neighbour.'],
    approach: "Every cell `(i, j)` with `i > 0` and `j > 0` lies on the same diagonal as `(i-1, j-1)`. The matrix is Toeplitz exactly when each such cell equals its top-left neighbour, because equality then chains along the whole diagonal. So scan all cells from the second row and second column onward and return false on the first mismatch. This reads each cell once. Collecting each diagonal into a list first works too but uses extra memory.",
    complexity: 'Time O(m n), Space O(1)',
    fn: { py: 'is_toeplitz', js: 'isToeplitz' },
    py: {
      starter: 'def is_toeplitz(matrix):\n    # write your code here\n    pass\n',
      solution: `def is_toeplitz(matrix):
    for i in range(1, len(matrix)):
        for j in range(1, len(matrix[0])):
            if matrix[i][j] != matrix[i - 1][j - 1]:
                return False
    return True
`,
    },
    js: {
      starter: 'function isToeplitz(matrix) {\n  // write your code here\n}\n',
      solution: `function isToeplitz(matrix) {
  for (let i = 1; i < matrix.length; i++) {
    for (let j = 1; j < matrix[0].length; j++) {
      if (matrix[i][j] !== matrix[i - 1][j - 1]) return false;
    }
  }
  return true;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]], expect: true },
      { args: [[[1, 2], [2, 2]]], expect: false },
      { args: [[[7]]], expect: true },
      { args: [[[1, 2, 3]]], expect: true },
      { args: [[[1], [2]]], expect: true },
      { args: [[[1, 2], [3, 1], [4, 3]]], expect: true },
      { args: [[[1, 2, 3], [4, 1, 9]]], expect: false },
    ],
  },
  {
    id: 'mx-reshape-matrix',
    title: 'Reshape a Matrix',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Mathworks', 'Accenture'],
    statement: "Given an `m x n` matrix `mat` and target dimensions `r` and `c`, return a new `r x c` matrix filled with the same elements in row-major order (row by row, left to right). If `r * c` is not equal to `m * n`, the reshape is impossible, so return the original matrix.",
    examples: [
      { input: 'mat = [[1, 2], [3, 4]], r = 1, c = 4', output: '[[1, 2, 3, 4]]' },
      { input: 'mat = [[1, 2], [3, 4]], r = 2, c = 4', output: '[[1, 2], [3, 4]]', explain: '8 cells are needed but only 4 exist.' },
    ],
    constraints: ['1 <= m, n <= 100', '1 <= r, c <= 300'],
    hints: ['Number the cells 0 to m*n - 1 in row-major order.', 'Cell k is at (k // n, k % n) in the old matrix and at (k // c, k % c) in the new one.'],
    approach: "First check that `r * c == m * n`; otherwise return the input unchanged. Then think of both matrices as the same flat list of `m * n` values read row by row. For each index `k`, the value lives at `(k // n, k % n)` in the original matrix and must go to `(k // c, k % c)` in the result. One loop over `k` fills the new matrix. Flattening into a temporary list and slicing it into rows of length `c` is an equivalent approach.",
    complexity: 'Time O(m n), Space O(m n) for the output',
    fn: { py: 'matrix_reshape', js: 'matrixReshape' },
    py: {
      starter: 'def matrix_reshape(mat, r, c):\n    # write your code here\n    pass\n',
      solution: `def matrix_reshape(mat, r, c):
    m, n = len(mat), len(mat[0])
    if m * n != r * c:
        return mat
    res = [[0] * c for _ in range(r)]
    for k in range(m * n):
        res[k // c][k % c] = mat[k // n][k % n]
    return res
`,
    },
    js: {
      starter: 'function matrixReshape(mat, r, c) {\n  // write your code here\n}\n',
      solution: `function matrixReshape(mat, r, c) {
  const m = mat.length, n = mat[0].length;
  if (m * n !== r * c) return mat;
  const res = Array.from({ length: r }, () => new Array(c).fill(0));
  for (let k = 0; k < m * n; k++) {
    res[Math.floor(k / c)][k % c] = mat[Math.floor(k / n)][k % n];
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2], [3, 4]], 1, 4], expect: [[1, 2, 3, 4]] },
      { args: [[[1, 2], [3, 4]], 2, 4], expect: [[1, 2], [3, 4]] },
      { args: [[[1, 2, 3, 4]], 2, 2], expect: [[1, 2], [3, 4]] },
      { args: [[[1, 2, 3], [4, 5, 6]], 3, 2], expect: [[1, 2], [3, 4], [5, 6]] },
      { args: [[[1]], 1, 1], expect: [[1]] },
      { args: [[[1, 2, 3], [4, 5, 6]], 6, 1], expect: [[1], [2], [3], [4], [5], [6]] },
    ],
  },
  {
    id: 'mx-count-negatives',
    title: 'Count Negatives in a Sorted Matrix',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Apple', 'Infosys'],
    statement: "The matrix `grid` is sorted in non-increasing order both along every row and down every column. Return how many of its numbers are negative. Aim for O(m + n).",
    examples: [
      { input: 'grid = [[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]', output: '8' },
      { input: 'grid = [[3, 2], [1, 0]]', output: '0' },
    ],
    constraints: ['1 <= m, n <= 100', '-100 <= grid[i][j] <= 100'],
    hints: ['In each row the negatives form a suffix.', 'Going down the rows, the column where negatives start can only move left, so one pointer can be reused for all rows.'],
    approach: "Because columns are sorted too, the position where negatives start in each row never moves right as we go down. Keep a pointer `col` starting at `n` (meaning no negatives yet) at the top row. For each row, move `col` left while `col > 0` and `grid[r][col - 1] < 0`; then this row has `n - col` negatives. Add that to the total and continue with the next row without resetting `col`. The pointer moves left at most n times overall and we visit m rows, so the time is O(m + n). Counting every cell is O(m n), and binary search per row is O(m log n).",
    complexity: 'Time O(m + n), Space O(1)',
    fn: { py: 'count_negatives', js: 'countNegatives' },
    py: {
      starter: 'def count_negatives(grid):\n    # write your code here\n    pass\n',
      solution: `def count_negatives(grid):
    n = len(grid[0])
    col = n
    total = 0
    for row in grid:
        while col > 0 and row[col - 1] < 0:
            col -= 1
        total += n - col
    return total
`,
    },
    js: {
      starter: 'function countNegatives(grid) {\n  // write your code here\n}\n',
      solution: `function countNegatives(grid) {
  const n = grid[0].length;
  let col = n, total = 0;
  for (const row of grid) {
    while (col > 0 && row[col - 1] < 0) col--;
    total += n - col;
  }
  return total;
}
`,
    },
    tests: [
      { args: [[[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]], expect: 8 },
      { args: [[[3, 2], [1, 0]]], expect: 0 },
      { args: [[[-1]]], expect: 1 },
      { args: [[[5, 1, 0], [-5, -5, -5]]], expect: 3 },
      { args: [[[1, -1], [-1, -1]]], expect: 3 },
      { args: [[[0]]], expect: 0 },
    ],
  },
  {
    id: 'mx-flip-and-invert',
    title: 'Flip and Invert a Binary Image',
    diff: 'Easy',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Wipro', 'Microsoft'],
    statement: "Given a binary matrix `image`, first flip every row horizontally (reverse it), then invert every value (`0` becomes `1` and `1` becomes `0`). Return the resulting matrix.",
    examples: [
      { input: 'image = [[1, 1, 0], [1, 0, 1], [0, 0, 0]]', output: '[[1, 0, 0], [0, 1, 0], [1, 1, 1]]' },
      { input: 'image = [[0, 0, 1]]', output: '[[0, 1, 1]]' },
    ],
    constraints: ['1 <= n, m <= 20', 'image[i][j] is 0 or 1'],
    hints: ['Do both steps in one pass with two pointers from the ends of each row.', 'Swap row[i] and row[j] and invert both at the same time; the middle element is just inverted.'],
    approach: "Process each row with two pointers `i` at the start and `j` at the end. Swap the two values and invert both at the same time, using `1 - x` or `x ^ 1`. Move the pointers inward until they cross. If the row has odd length, the middle element is swapped with itself and inverted once, which is correct. Every element is touched once. Doing the reverse and the invert as two separate passes is also linear, just with twice as many steps.",
    complexity: 'Time O(m n), Space O(1)',
    fn: { py: 'flip_and_invert_image', js: 'flipAndInvertImage' },
    py: {
      starter: 'def flip_and_invert_image(image):\n    # write your code here\n    pass\n',
      solution: `def flip_and_invert_image(image):
    for row in image:
        i, j = 0, len(row) - 1
        while i <= j:
            row[i], row[j] = 1 - row[j], 1 - row[i]
            i += 1
            j -= 1
    return image
`,
    },
    js: {
      starter: 'function flipAndInvertImage(image) {\n  // write your code here\n}\n',
      solution: `function flipAndInvertImage(image) {
  for (const row of image) {
    let i = 0, j = row.length - 1;
    while (i <= j) {
      const a = row[i], b = row[j];
      row[i] = 1 - b;
      row[j] = 1 - a;
      i++; j--;
    }
  }
  return image;
}
`,
    },
    tests: [
      { args: [[[1, 1, 0], [1, 0, 1], [0, 0, 0]]], expect: [[1, 0, 0], [0, 1, 0], [1, 1, 1]] },
      { args: [[[1, 1, 0, 0], [1, 0, 0, 1], [0, 1, 1, 1], [1, 0, 1, 0]]], expect: [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 1], [1, 0, 1, 0]] },
      { args: [[[0]]], expect: [[1]] },
      { args: [[[1]]], expect: [[0]] },
      { args: [[[1, 0]]], expect: [[1, 0]] },
      { args: [[[0, 0, 1]]], expect: [[0, 1, 1]] },
    ],
  },
  {
    id: 'mx-spiral-order',
    title: 'Spiral Order Traversal',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Infosys'],
    statement: "Given an `m x n` matrix, return all of its elements in spiral order: start at the top-left, go right along the top row, down the right column, left along the bottom row, up the left column, and repeat inward.",
    examples: [
      { input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[1, 2, 3, 6, 9, 8, 7, 4, 5]' },
      { input: 'matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]', output: '[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]' },
    ],
    constraints: ['1 <= m, n <= 10', '-100 <= matrix[i][j] <= 100'],
    hints: ['Keep four boundaries: top, bottom, left and right.', 'After walking a side, move its boundary inward. Check the boundaries again before the bottom row and left column so single rows or columns are not repeated.'],
    approach: "Maintain `top`, `bottom`, `left` and `right` boundaries of the part not yet visited. Walk the top row from `left` to `right`, then increase `top`. Walk the right column from `top` to `bottom`, then decrease `right`. If `top <= bottom`, walk the bottom row from `right` to `left` and decrease `bottom`. If `left <= right`, walk the left column from `bottom` to `top` and increase `left`. Repeat while `top <= bottom` and `left <= right`. The two extra checks prevent a single remaining row or column from being output twice. Each element is visited exactly once.",
    complexity: 'Time O(m n), Space O(1) besides the output',
    fn: { py: 'spiral_order', js: 'spiralOrder' },
    py: {
      starter: 'def spiral_order(matrix):\n    # write your code here\n    pass\n',
      solution: `def spiral_order(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):
            res.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                res.append(matrix[i][left])
            left += 1
    return res
`,
    },
    js: {
      starter: 'function spiralOrder(matrix) {\n  // write your code here\n}\n',
      solution: `function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
      left++;
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expect: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[1]]], expect: [1] },
      { args: [[[1, 2, 3]]], expect: [1, 2, 3] },
      { args: [[[1], [2], [3]]], expect: [1, 2, 3] },
      { args: [[[1, 2], [3, 4]]], expect: [1, 2, 4, 3] },
      { args: [[[1, 2, 3], [4, 5, 6]]], expect: [1, 2, 3, 6, 5, 4] },
      { args: [[[1, 2], [3, 4], [5, 6]]], expect: [1, 2, 4, 6, 5, 3] },
    ],
  },
  {
    id: 'mx-rotate-image',
    title: 'Rotate Matrix 90 Degrees Clockwise',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Wipro'],
    statement: "Given an `n x n` matrix, rotate it 90 degrees clockwise **in place** (without allocating another matrix) and return it.",
    examples: [
      { input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[[7, 4, 1], [8, 5, 2], [9, 6, 3]]' },
      { input: 'matrix = [[1, 2], [3, 4]]', output: '[[3, 1], [4, 2]]' },
    ],
    constraints: ['1 <= n <= 20', '-1000 <= matrix[i][j] <= 1000'],
    hints: ['A clockwise rotation equals a transpose followed by reversing every row.', 'Transpose in place by swapping matrix[i][j] with matrix[j][i] for j > i.'],
    approach: "A 90-degree clockwise rotation sends the element at `(i, j)` to `(j, n-1-i)`. You can get there in two simple in-place steps. First transpose the matrix by swapping `matrix[i][j]` and `matrix[j][i]` for every pair with `j > i`; this sends `(i, j)` to `(j, i)`. Then reverse each row, which sends `(j, i)` to `(j, n-1-i)`. Both steps touch each element a constant number of times and use O(1) extra space. Copying into a new rotated matrix is equally fast but uses O(n^2) extra memory, which the problem forbids.",
    complexity: 'Time O(n^2), Space O(1)',
    fn: { py: 'rotate', js: 'rotate' },
    py: {
      starter: 'def rotate(matrix):\n    # write your code here\n    pass\n',
      solution: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix
`,
    },
    js: {
      starter: 'function rotate(matrix) {\n  // write your code here\n}\n',
      solution: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (const row of matrix) row.reverse();
  return matrix;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expect: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[1]]], expect: [[1]] },
      { args: [[[1, 2], [3, 4]]], expect: [[3, 1], [4, 2]] },
      { args: [[[0, 0], [0, 1]]], expect: [[0, 0], [1, 0]] },
      { args: [[[1, 1], [2, 2]]], expect: [[2, 1], [2, 1]] },
    ],
  },
  {
    id: 'mx-set-matrix-zeroes',
    title: 'Set Matrix Zeroes',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Oracle', 'Infosys'],
    statement: "Given an `m x n` integer matrix, if a cell is `0`, set its entire row and its entire column to `0`. Only zeros present in the **original** matrix trigger this. Do it in place with O(1) extra space and return the matrix.",
    examples: [
      { input: 'matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]', output: '[[1, 0, 1], [0, 0, 0], [1, 0, 1]]' },
      { input: 'matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]', output: '[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]' },
    ],
    constraints: ['1 <= m, n <= 200', '-2^31 <= matrix[i][j] <= 2^31 - 1'],
    hints: ['Using separate row and column marker arrays is O(m + n) space.', 'Store the markers in the first row and first column instead, and remember separately whether the first row and first column themselves need clearing.'],
    approach: "First record whether the first row and the first column originally contain a zero, using two booleans. Then scan the rest of the matrix; when `matrix[i][j]` is 0, mark its row by setting `matrix[i][0] = 0` and its column by setting `matrix[0][j] = 0`. Next, for every cell outside the first row and column, set it to 0 if its row marker or column marker is 0. Finally, clear the first row and/or first column if the booleans say so. Doing the first row and column last prevents the markers from wiping out information too early. The simpler method with two marker arrays is also O(m n) time but O(m + n) space.",
    complexity: 'Time O(m n), Space O(1)',
    fn: { py: 'set_zeroes', js: 'setZeroes' },
    py: {
      starter: 'def set_zeroes(matrix):\n    # write your code here\n    pass\n',
      solution: `def set_zeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row = any(matrix[0][j] == 0 for j in range(n))
    first_col = any(matrix[i][0] == 0 for i in range(m))
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if first_row:
        for j in range(n):
            matrix[0][j] = 0
    if first_col:
        for i in range(m):
            matrix[i][0] = 0
    return matrix
`,
    },
    js: {
      starter: 'function setZeroes(matrix) {\n  // write your code here\n}\n',
      solution: `function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const firstRow = matrix[0].some((v) => v === 0);
  const firstCol = matrix.some((row) => row[0] === 0);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
    }
  }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
    }
  }
  if (firstRow) for (let j = 0; j < n; j++) matrix[0][j] = 0;
  if (firstCol) for (let i = 0; i < m; i++) matrix[i][0] = 0;
  return matrix;
}
`,
    },
    tests: [
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expect: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expect: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { args: [[[1]]], expect: [[1]] },
      { args: [[[0]]], expect: [[0]] },
      { args: [[[1, 0]]], expect: [[0, 0]] },
      { args: [[[1], [0]]], expect: [[0], [0]] },
      { args: [[[1, 2], [3, 4]]], expect: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: 'mx-search-sorted-matrix',
    title: 'Search in a Row and Column Sorted Matrix',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Paytm', 'Goldman Sachs'],
    statement: "In the `m x n` matrix `matrix`, every row is sorted in ascending order from left to right and every column is sorted in ascending order from top to bottom. Return `true` if `target` is present in the matrix, otherwise `false`.",
    examples: [
      { input: 'matrix = [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target = 5', output: 'true' },
      { input: 'same matrix, target = 20', output: 'false' },
    ],
    constraints: ['1 <= m, n <= 300', '-10^9 <= matrix[i][j], target <= 10^9'],
    hints: ['Look at the top-right corner: everything to its left is smaller and everything below it is larger.', 'If the corner is bigger than the target, drop its column; if smaller, drop its row.'],
    approach: "Start at the top-right cell. If it equals the target, we are done. If it is larger than the target, every value below it in that column is even larger, so the whole column can be discarded: move left. If it is smaller, every value to its left in that row is even smaller, so the row can be discarded: move down. Each step removes a row or a column, so after at most m + n steps we either find the target or walk off the matrix. Binary searching every row costs O(m log n), and a full scan costs O(m n).",
    complexity: 'Time O(m + n), Space O(1)',
    fn: { py: 'search_matrix', js: 'searchMatrix' },
    py: {
      starter: 'def search_matrix(matrix, target):\n    # write your code here\n    pass\n',
      solution: `def search_matrix(matrix, target):
    r, c = 0, len(matrix[0]) - 1
    while r < len(matrix) and c >= 0:
        v = matrix[r][c]
        if v == target:
            return True
        if v > target:
            c -= 1
        else:
            r += 1
    return False
`,
    },
    js: {
      starter: 'function searchMatrix(matrix, target) {\n  // write your code here\n}\n',
      solution: `function searchMatrix(matrix, target) {
  let r = 0, c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    const v = matrix[r][c];
    if (v === target) return true;
    if (v > target) c--;
    else r++;
  }
  return false;
}
`,
    },
    tests: [
      { args: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 5], expect: true },
      { args: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 20], expect: false },
      { args: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 30], expect: true },
      { args: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 1], expect: true },
      { args: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 0], expect: false },
      { args: [[[-5]], -5], expect: true },
      { args: [[[1, 3]], 2], expect: false },
    ],
  },
  {
    id: 'mx-number-of-islands',
    title: 'Number of Islands',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: "Given a grid of `\"1\"` (land) and `\"0\"` (water), count the islands. An island is a group of land cells connected horizontally or vertically (not diagonally). Everything outside the grid is water.",
    examples: [
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
      { input: 'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]', output: '5', explain: 'Diagonal neighbours do not connect.' },
    ],
    constraints: ['1 <= m, n <= 300', 'grid[i][j] is "0" or "1"'],
    hints: ['Each time you find unvisited land, you have found a new island.', 'Flood-fill from it (DFS or BFS) and mark every connected land cell as visited.'],
    approach: "Scan every cell. When you reach a land cell that has not been visited, increase the island count and flood-fill from it: use a stack (or queue) to visit all land cells connected through the four directions, marking each one visited, for example by turning it into \"0\". Once the fill ends, that whole island is marked and will not be counted again. Every cell is pushed at most once, so the total work is linear in the grid size. An explicit stack avoids recursion-depth problems on large islands. Union-Find is an alternative with similar complexity.",
    complexity: 'Time O(m n), Space O(m n) in the worst case for the stack',
    fn: { py: 'num_islands', js: 'numIslands' },
    py: {
      starter: 'def num_islands(grid):\n    # write your code here\n    pass\n',
      solution: `def num_islands(grid):
    m, n = len(grid), len(grid[0])
    count = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] != '1':
                continue
            count += 1
            grid[i][j] = '0'
            stack = [(i, j)]
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                        grid[nr][nc] = '0'
                        stack.append((nr, nc))
    return count
`,
    },
    js: {
      starter: 'function numIslands(grid) {\n  // write your code here\n}\n',
      solution: `function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  let count = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] !== '1') continue;
      count++;
      grid[i][j] = '0';
      const stack = [[i, j]];
      while (stack.length) {
        const [r, c] = stack.pop();
        for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
          if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] === '1') {
            grid[nr][nc] = '0';
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return count;
}
`,
    },
    tests: [
      { args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], expect: 1 },
      { args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], expect: 3 },
      { args: [[['0']]], expect: 0 },
      { args: [[['1']]], expect: 1 },
      { args: [[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], expect: 5 },
      { args: [[['1', '1'], ['1', '1']]], expect: 1 },
      { args: [[['1', '0', '1', '0', '1']]], expect: 3 },
    ],
  },
  {
    id: 'mx-game-of-life',
    title: 'Game of Life (Next State)',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Amazon', 'Dropbox', 'Microsoft'],
    statement: "In Conway's Game of Life each cell of `board` is alive (`1`) or dead (`0`) and has up to 8 neighbours (horizontal, vertical, diagonal). All cells update **simultaneously**: a live cell with fewer than 2 or more than 3 live neighbours dies; a live cell with 2 or 3 live neighbours lives; a dead cell with exactly 3 live neighbours becomes alive. Return the board after one step, computed in place.",
    examples: [
      { input: 'board = [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]', output: '[[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]' },
      { input: 'board = [[1, 1], [1, 0]]', output: '[[1, 1], [1, 1]]' },
    ],
    constraints: ['1 <= m, n <= 25', 'board[i][j] is 0 or 1'],
    hints: ['If you overwrite cells immediately, later cells see the wrong neighbour states.', 'Store the new state in a second bit: keep the old state in bit 0 and write the new state into bit 1, then shift right at the end.'],
    approach: "Because all updates happen at once, each cell's new state must be computed from the old states of its neighbours. To do this in place, use the second bit of each cell: bit 0 holds the old state and bit 1 will hold the new state. For every cell, count live neighbours by reading only bit 0 (`value & 1`). If the cell should be alive next, set bit 1 with `board[i][j] |= 2`. After all cells are processed, shift every cell right by one bit to keep only the new state. Each cell looks at 8 neighbours, so the time is O(m n). Copying the board first is simpler but uses O(m n) extra memory.",
    complexity: 'Time O(m n), Space O(1)',
    fn: { py: 'game_of_life', js: 'gameOfLife' },
    py: {
      starter: 'def game_of_life(board):\n    # write your code here\n    pass\n',
      solution: `def game_of_life(board):
    m, n = len(board), len(board[0])
    for i in range(m):
        for j in range(n):
            live = 0
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    if (di or dj) and 0 <= i + di < m and 0 <= j + dj < n:
                        live += board[i + di][j + dj] & 1
            if board[i][j] & 1:
                if live in (2, 3):
                    board[i][j] |= 2
            elif live == 3:
                board[i][j] |= 2
    for i in range(m):
        for j in range(n):
            board[i][j] >>= 1
    return board
`,
    },
    js: {
      starter: 'function gameOfLife(board) {\n  // write your code here\n}\n',
      solution: `function gameOfLife(board) {
  const m = board.length, n = board[0].length;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let live = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if ((di || dj) && i + di >= 0 && i + di < m && j + dj >= 0 && j + dj < n) live += board[i + di][j + dj] & 1;
        }
      }
      if (board[i][j] & 1) { if (live === 2 || live === 3) board[i][j] |= 2; }
      else if (live === 3) board[i][j] |= 2;
    }
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) board[i][j] >>= 1;
  return board;
}
`,
    },
    tests: [
      { args: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], expect: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { args: [[[1, 1], [1, 0]]], expect: [[1, 1], [1, 1]] },
      { args: [[[1]]], expect: [[0]] },
      { args: [[[0]]], expect: [[0]] },
      { args: [[[0, 0, 0], [1, 1, 1], [0, 0, 0]]], expect: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] },
      { args: [[[1, 1], [1, 1]]], expect: [[1, 1], [1, 1]] },
    ],
  },
  {
    id: 'mx-rotting-oranges',
    title: 'Rotting Oranges',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Swiggy', 'Zomato'],
    statement: "In the grid, `0` is an empty cell, `1` is a fresh orange and `2` is a rotten orange. Every minute, each fresh orange that is horizontally or vertically next to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains, or `-1` if some fresh orange can never rot.",
    examples: [
      { input: 'grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]', output: '4' },
      { input: 'grid = [[2, 1, 1], [0, 1, 1], [1, 0, 1]]', output: '-1', explain: 'The bottom-left orange is never next to a rotten one.' },
    ],
    constraints: ['1 <= m, n <= 10', 'grid[i][j] is 0, 1 or 2'],
    hints: ['All rotten oranges spread at the same time: this is a multi-source BFS.', 'Process the queue one level (minute) at a time and count remaining fresh oranges.'],
    approach: "Put every initially rotten orange into a queue and count the fresh oranges. Then run BFS level by level, where one level is one minute. For each rotten orange in the current level, rot its fresh neighbours, decrease the fresh count and add them to the next level. Count the minutes for which at least one new orange rotted. When the queue is empty, return the minute count if no fresh oranges remain, otherwise -1. Starting the BFS from all sources at once gives the correct simultaneous spread, and each cell is processed once. Simulating minute by minute with full grid scans is O((m n)^2).",
    complexity: 'Time O(m n), Space O(m n)',
    fn: { py: 'oranges_rotting', js: 'orangesRotting' },
    py: {
      starter: 'def oranges_rotting(grid):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def oranges_rotting(grid):
    m, n = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 2:
                q.append((i, j))
            elif grid[i][j] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
`,
    },
    js: {
      starter: 'function orangesRotting(grid) {\n  // write your code here\n}\n',
      solution: `function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 2) queue.push([i, j]);
      else if (grid[i][j] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
`,
    },
    tests: [
      { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expect: 4 },
      { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expect: -1 },
      { args: [[[0, 2]]], expect: 0 },
      { args: [[[0]]], expect: 0 },
      { args: [[[1]]], expect: -1 },
      { args: [[[2, 2], [1, 1]]], expect: 1 },
      { args: [[[2, 1, 1, 1, 1]]], expect: 4 },
    ],
  },
  {
    id: 'mx-diagonal-traverse',
    title: 'Diagonal Zigzag Traversal',
    diff: 'Medium',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Facebook', 'Amazon'],
    statement: "Given an `m x n` matrix, return its elements in zigzag diagonal order. Diagonals are numbered by `d = row + col`. Diagonal 0 is the top-left cell. Even-numbered diagonals are read going **up and to the right** (from the bottom-left end), odd-numbered diagonals going **down and to the left** (from the top-right end).",
    examples: [
      { input: 'mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[1, 2, 4, 7, 5, 3, 6, 8, 9]' },
      { input: 'mat = [[1, 2, 3, 4], [5, 6, 7, 8]]', output: '[1, 2, 5, 6, 3, 4, 7, 8]' },
    ],
    constraints: ['1 <= m, n <= 100', '-10^5 <= mat[i][j] <= 10^5'],
    hints: ['All cells with the same row + col lie on one diagonal.', 'For diagonal d the row runs from max(0, d - n + 1) to min(d, m - 1); reverse that order on even d.'],
    approach: "There are `m + n - 1` diagonals, indexed by `d = r + c`. For diagonal `d`, the valid rows go from `max(0, d - n + 1)` to `min(d, m - 1)`, and the column is `d - r`. Walking rows in increasing order goes down and to the left, which is the order we need for odd `d`. For even `d` walk the rows in decreasing order instead, which goes up and to the right. Appending the cells in this order visits every element exactly once. Simulating the bouncing pointer with direction changes at the borders is also O(m n) but has many edge cases.",
    complexity: 'Time O(m n), Space O(1) besides the output',
    fn: { py: 'find_diagonal_order', js: 'findDiagonalOrder' },
    py: {
      starter: 'def find_diagonal_order(mat):\n    # write your code here\n    pass\n',
      solution: `def find_diagonal_order(mat):
    m, n = len(mat), len(mat[0])
    res = []
    for d in range(m + n - 1):
        lo, hi = max(0, d - n + 1), min(d, m - 1)
        rows = range(lo, hi + 1) if d % 2 else range(hi, lo - 1, -1)
        for r in rows:
            res.append(mat[r][d - r])
    return res
`,
    },
    js: {
      starter: 'function findDiagonalOrder(mat) {\n  // write your code here\n}\n',
      solution: `function findDiagonalOrder(mat) {
  const m = mat.length, n = mat[0].length;
  const res = [];
  for (let d = 0; d < m + n - 1; d++) {
    const lo = Math.max(0, d - n + 1), hi = Math.min(d, m - 1);
    if (d % 2 === 1) for (let r = lo; r <= hi; r++) res.push(mat[r][d - r]);
    else for (let r = hi; r >= lo; r--) res.push(mat[r][d - r]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [1, 2, 4, 7, 5, 3, 6, 8, 9] },
      { args: [[[1, 2], [3, 4]]], expect: [1, 2, 3, 4] },
      { args: [[[1]]], expect: [1] },
      { args: [[[1, 2, 3]]], expect: [1, 2, 3] },
      { args: [[[1], [2], [3]]], expect: [1, 2, 3] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8]]], expect: [1, 2, 5, 6, 3, 4, 7, 8] },
    ],
  },
  {
    id: 'mx-maximal-rectangle',
    title: 'Maximal Rectangle of 1s',
    diff: 'Hard',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Amazon', 'Microsoft', 'Directi'],
    statement: "Given a binary matrix of characters `\"0\"` and `\"1\"`, return the area of the largest axis-aligned rectangle that contains only `\"1\"`s.",
    examples: [
      { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '6', explain: 'Rows 1-2, columns 2-4.' },
      { input: 'matrix = [["0","1"],["1","0"]]', output: '1' },
    ],
    constraints: ['1 <= rows, cols <= 200', 'matrix[i][j] is "0" or "1"'],
    hints: ['For each row, compute for every column the height of the run of 1s ending at that row.', 'Each row then becomes a "largest rectangle in a histogram" problem, solvable with a monotonic stack.'],
    approach: "Process the matrix row by row while keeping `heights[j]`, the number of consecutive 1s ending at the current row in column `j` (reset to 0 on a '0'). Any all-ones rectangle has a bottom row, and for that row it is a rectangle under the histogram `heights`. So the answer is the maximum, over all rows, of the largest rectangle in that histogram. Solve the histogram problem with an increasing stack of indices: when a bar lower than the stack top arrives, pop the top and compute the rectangle that uses its height, whose width spans from the new stack top to the current index. A sentinel bar of height 0 at the end flushes the stack. Each row costs O(cols), so the total is O(rows * cols). Trying every rectangle is O(rows^2 cols^2) or worse.",
    complexity: 'Time O(rows * cols), Space O(cols)',
    fn: { py: 'maximal_rectangle', js: 'maximalRectangle' },
    py: {
      starter: 'def maximal_rectangle(matrix):\n    # write your code here\n    pass\n',
      solution: `def maximal_rectangle(matrix):
    cols = len(matrix[0])
    heights = [0] * (cols + 1)
    best = 0
    for row in matrix:
        for j in range(cols):
            heights[j] = heights[j] + 1 if row[j] == '1' else 0
        stack = []
        for j in range(cols + 1):
            while stack and heights[stack[-1]] > heights[j]:
                h = heights[stack.pop()]
                left = stack[-1] if stack else -1
                best = max(best, h * (j - left - 1))
            stack.append(j)
    return best
`,
    },
    js: {
      starter: 'function maximalRectangle(matrix) {\n  // write your code here\n}\n',
      solution: `function maximalRectangle(matrix) {
  const cols = matrix[0].length;
  const heights = new Array(cols + 1).fill(0);
  let best = 0;
  for (const row of matrix) {
    for (let j = 0; j < cols; j++) heights[j] = row[j] === '1' ? heights[j] + 1 : 0;
    const stack = [];
    for (let j = 0; j <= cols; j++) {
      while (stack.length && heights[stack[stack.length - 1]] > heights[j]) {
        const h = heights[stack.pop()];
        const left = stack.length ? stack[stack.length - 1] : -1;
        best = Math.max(best, h * (j - left - 1));
      }
      stack.push(j);
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], expect: 6 },
      { args: [[['0']]], expect: 0 },
      { args: [[['1']]], expect: 1 },
      { args: [[['1', '1'], ['1', '1']]], expect: 4 },
      { args: [[['0', '1'], ['1', '0']]], expect: 1 },
      { args: [[['1', '1', '1', '0'], ['1', '1', '1', '1'], ['0', '1', '1', '1']]], expect: 6 },
      { args: [[['1', '1', '1', '1', '1']]], expect: 5 },
    ],
  },
  {
    id: 'mx-longest-increasing-path',
    title: 'Longest Increasing Path in a Matrix',
    diff: 'Hard',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Google', 'Amazon', 'Uber', 'Bloomberg'],
    statement: "Given an `m x n` integer matrix, return the length (number of cells) of the longest path in which each step moves to a horizontally or vertically adjacent cell with a **strictly larger** value.",
    examples: [
      { input: 'matrix = [[9, 9, 4], [6, 6, 8], [2, 1, 1]]', output: '4', explain: 'The path 1 → 2 → 6 → 9.' },
      { input: 'matrix = [[3, 4, 5], [3, 2, 6], [2, 2, 1]]', output: '4', explain: 'The path 3 → 4 → 5 → 6.' },
    ],
    constraints: ['1 <= m, n <= 200', '0 <= matrix[i][j] <= 2^31 - 1'],
    hints: ['Strictly increasing paths can never form a cycle, so the cells form a DAG.', 'Either memoise a DFS, or peel the DAG layer by layer starting from cells that have no smaller neighbour (topological BFS).'],
    approach: "Draw an edge from each cell to every neighbour with a larger value. Since values strictly increase along edges, the graph has no cycles, and the answer is the longest path in this DAG. One clean way is a topological BFS: compute for every cell its in-degree, the number of smaller neighbours. Start with all cells of in-degree 0 as the first layer. Repeatedly remove the current layer, decrementing the in-degree of each larger neighbour and adding it to the next layer when it reaches 0. The number of layers processed is the length of the longest path. Each cell and edge is handled once, so the time is O(m n), and the iterative BFS avoids deep recursion. A memoised DFS has the same complexity, while plain DFS without memoisation is exponential.",
    complexity: 'Time O(m n), Space O(m n)',
    fn: { py: 'longest_increasing_path', js: 'longestIncreasingPath' },
    py: {
      starter: 'def longest_increasing_path(matrix):\n    # write your code here\n    pass\n',
      solution: `def longest_increasing_path(matrix):
    m, n = len(matrix), len(matrix[0])
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    indeg = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            for di, dj in dirs:
                a, b = i + di, j + dj
                if 0 <= a < m and 0 <= b < n and matrix[a][b] < matrix[i][j]:
                    indeg[i][j] += 1
    layer = [(i, j) for i in range(m) for j in range(n) if indeg[i][j] == 0]
    length = 0
    while layer:
        length += 1
        nxt = []
        for i, j in layer:
            for di, dj in dirs:
                a, b = i + di, j + dj
                if 0 <= a < m and 0 <= b < n and matrix[a][b] > matrix[i][j]:
                    indeg[a][b] -= 1
                    if indeg[a][b] == 0:
                        nxt.append((a, b))
        layer = nxt
    return length
`,
    },
    js: {
      starter: 'function longestIncreasingPath(matrix) {\n  // write your code here\n}\n',
      solution: `function longestIncreasingPath(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const indeg = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (const [di, dj] of dirs) {
        const a = i + di, b = j + dj;
        if (a >= 0 && b >= 0 && a < m && b < n && matrix[a][b] < matrix[i][j]) indeg[i][j]++;
      }
    }
  }
  let layer = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (indeg[i][j] === 0) layer.push([i, j]);
  let length = 0;
  while (layer.length) {
    length++;
    const next = [];
    for (const [i, j] of layer) {
      for (const [di, dj] of dirs) {
        const a = i + di, b = j + dj;
        if (a >= 0 && b >= 0 && a < m && b < n && matrix[a][b] > matrix[i][j]) {
          if (--indeg[a][b] === 0) next.push([a, b]);
        }
      }
    }
    layer = next;
  }
  return length;
}
`,
    },
    tests: [
      { args: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], expect: 4 },
      { args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], expect: 4 },
      { args: [[[1]]], expect: 1 },
      { args: [[[1, 2], [4, 3]]], expect: 4 },
      { args: [[[7, 7], [7, 7]]], expect: 1 },
      { args: [[[1, 2, 3], [6, 5, 4], [7, 8, 9]]], expect: 9 },
    ],
  },
  {
    id: 'mx-dungeon-game',
    title: 'Dungeon Game (Minimum Initial Health)',
    diff: 'Hard',
    pattern: 'Matrix & 2D Arrays',
    companies: ['Amazon', 'Microsoft', 'Google'],
    statement: "A knight starts at the top-left cell of the grid `dungeon` and must reach the bottom-right cell, moving only **right** or **down**. Entering a cell (including the first and last) adds its value to the knight's health; negative values are damage. If health ever drops to 0 or below, the knight dies. Return the minimum positive initial health that lets the knight reach the bottom-right cell alive.",
    examples: [
      { input: 'dungeon = [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]', output: '7', explain: 'Path right, right, down, down: 7 → 5 → 2 → 5 → 6 → 1.' },
      { input: 'dungeon = [[0]]', output: '1', explain: 'Health must always be at least 1.' },
    ],
    constraints: ['1 <= m, n <= 200', '-1000 <= dungeon[i][j] <= 1000'],
    hints: ['Going forward does not work, because a big reward later cannot fix an earlier death.', 'Work backwards: need[i][j] = max(1, min(need of the cell below, need of the cell to the right) - dungeon[i][j]).'],
    approach: "Define `need[i][j]` as the minimum health the knight must have when entering cell `(i, j)` to survive to the end. At the princess cell, `need = max(1, 1 - dungeon[m-1][n-1])`. For any other cell, the knight will continue to whichever of the right or lower neighbour needs less health, so `need[i][j] = max(1, min(need[i+1][j], need[i][j+1]) - dungeon[i][j])`; the `max(1, ...)` enforces that health is always positive. Fill the table from the bottom-right corner back to the top-left, treating cells outside the grid as needing infinity. The answer is `need[0][0]`. A forward DP fails because it must track both current health and the minimum seen so far, and those two goals conflict. Trying all paths is exponential.",
    complexity: 'Time O(m n), Space O(n)',
    fn: { py: 'calculate_minimum_hp', js: 'calculateMinimumHP' },
    py: {
      starter: 'def calculate_minimum_hp(dungeon):\n    # write your code here\n    pass\n',
      solution: `def calculate_minimum_hp(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    inf = float('inf')
    need = [inf] * (n + 1)
    need[n - 1] = 1
    for i in range(m - 1, -1, -1):
        nxt = [inf] * (n + 1)
        for j in range(n - 1, -1, -1):
            best = min(need[j], nxt[j + 1])
            if i == m - 1 and j == n - 1:
                best = 1
            nxt[j] = max(1, best - dungeon[i][j])
        need = nxt
    return need[0]
`,
    },
    js: {
      starter: 'function calculateMinimumHP(dungeon) {\n  // write your code here\n}\n',
      solution: `function calculateMinimumHP(dungeon) {
  const m = dungeon.length, n = dungeon[0].length;
  let need = new Array(n + 1).fill(Infinity);
  need[n - 1] = 1;
  for (let i = m - 1; i >= 0; i--) {
    const nxt = new Array(n + 1).fill(Infinity);
    for (let j = n - 1; j >= 0; j--) {
      let best = Math.min(need[j], nxt[j + 1]);
      if (i === m - 1 && j === n - 1) best = 1;
      nxt[j] = Math.max(1, best - dungeon[i][j]);
    }
    need = nxt;
  }
  return need[0];
}
`,
    },
    tests: [
      { args: [[[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]], expect: 7 },
      { args: [[[0]]], expect: 1 },
      { args: [[[100]]], expect: 1 },
      { args: [[[-5]]], expect: 6 },
      { args: [[[1, -3, 3], [0, -2, 0], [-3, -3, -3]]], expect: 3 },
      { args: [[[0, 0, 0], [1, 1, -1]]], expect: 1 },
      { args: [[[-3, 5]]], expect: 4 },
      { args: [[[2], [1]]], expect: 1 },
    ],
  },
];
