export default [
  {
    id: 'gr-path-exists',
    title: 'Find if a Path Exists',
    diff: 'Easy',
    pattern: 'Graphs',
    companies: ['Amazon', 'TCS', 'Infosys'],
    statement: 'An undirected graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges`, where `[u, v]` joins `u` and `v`. Return `true` if there is a path from `source` to `destination`, otherwise `false`.',
    examples: [
      { input: 'n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2', output: 'true' },
      { input: 'n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5', output: 'false', explain: '0 and 5 are in different components.' },
    ],
    constraints: ['1 <= n <= 2 * 10^5', '0 <= edges.length <= 2 * 10^5', 'No duplicate edges and no self loops.'],
    hints: ['Build an adjacency list first.', 'Run BFS or DFS from source and see if destination gets visited.'],
    approach: 'Turn the edge list into an adjacency list, adding each edge in both directions because the graph is undirected. Start a BFS from source with a visited array. Each time you pop a node, return true if it is the destination; otherwise push its unvisited neighbours. If the queue empties, the destination was never reached, so return false. Union-find also works: union every edge, then compare the roots of source and destination. Trying every possible path explicitly would be exponential.',
    complexity: 'Time O(n + e), Space O(n + e)',
    fn: { py: 'valid_path', js: 'validPath' },
    py: {
      starter: 'def valid_path(n, edges, source, destination):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def valid_path(n, edges, source, destination):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    seen = [False] * n
    seen[source] = True
    q = deque([source])
    while q:
        u = q.popleft()
        if u == destination:
            return True
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                q.append(v)
    return False
`,
    },
    js: {
      starter: 'function validPath(n, edges, source, destination) {\n  // write your code here\n}\n',
      solution: `function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const seen = new Array(n).fill(false);
  seen[source] = true;
  const q = [source];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    if (u === destination) return true;
    for (const v of adj[u]) if (!seen[v]) { seen[v] = true; q.push(v); }
  }
  return false;
}
`,
    },
    tests: [
      { args: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], expect: true },
      { args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], expect: false },
      { args: [1, [], 0, 0], expect: true },
      { args: [2, [], 0, 1], expect: false },
      { args: [4, [[0, 1], [2, 3]], 3, 2], expect: true },
      { args: [5, [[0, 4], [4, 3], [3, 2]], 0, 2], expect: true },
    ],
  },
  {
    id: 'gr-town-judge',
    title: 'Find the Town Judge',
    diff: 'Easy',
    pattern: 'Graphs',
    companies: ['Amazon', 'Wipro', 'Cognizant'],
    statement: 'There are `n` people labelled `1` to `n`. `trust[i] = [a, b]` means person `a` trusts person `b`. The town judge trusts nobody and is trusted by everyone else. Return the judge\'s label, or `-1` if no such person exists.',
    examples: [
      { input: 'n = 3, trust = [[1,3],[2,3]]', output: '3' },
      { input: 'n = 3, trust = [[1,3],[2,3],[3,1]]', output: '-1', explain: 'Person 3 trusts someone, so cannot be the judge.' },
    ],
    constraints: ['1 <= n <= 1000', '0 <= trust.length <= 10^4', 'All pairs are distinct and a != b.'],
    hints: ['Think of trust as directed edges and count degrees.', 'The judge has in-degree n - 1 and out-degree 0.'],
    approach: 'Treat each trust pair as a directed edge a -> b. Keep one score per person: add 1 when someone trusts them and subtract 1 when they trust someone. The judge is trusted by n - 1 people and trusts nobody, so their score is exactly n - 1, and no one else can reach that score. Scan the scores and return the person with n - 1, or -1 if none. Checking every candidate against every pair separately would be O(n * e).',
    complexity: 'Time O(n + e), Space O(n)',
    fn: { py: 'find_judge', js: 'findJudge' },
    py: {
      starter: 'def find_judge(n, trust):\n    # write your code here\n    pass\n',
      solution: `def find_judge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for p in range(1, n + 1):
        if score[p] == n - 1:
            return p
    return -1
`,
    },
    js: {
      starter: 'function findJudge(n, trust) {\n  // write your code here\n}\n',
      solution: `function findJudge(n, trust) {
  const score = new Array(n + 1).fill(0);
  for (const [a, b] of trust) { score[a]--; score[b]++; }
  for (let p = 1; p <= n; p++) if (score[p] === n - 1) return p;
  return -1;
}
`,
    },
    tests: [
      { args: [2, [[1, 2]]], expect: 2 },
      { args: [3, [[1, 3], [2, 3]]], expect: 3 },
      { args: [3, [[1, 3], [2, 3], [3, 1]]], expect: -1 },
      { args: [1, []], expect: 1 },
      { args: [4, [[1, 3], [1, 4], [2, 3], [2, 4], [4, 3]]], expect: 3 },
      { args: [3, [[1, 2], [2, 3]]], expect: -1 },
    ],
  },
  {
    id: 'gr-bfs-traversal',
    title: 'BFS Traversal of a Graph',
    diff: 'Easy',
    pattern: 'Graphs',
    companies: ['Amazon', 'TCS', 'Accenture', 'Infosys'],
    statement: 'A graph with nodes `0` to `n - 1` is given as an adjacency list `adj`, where `adj[u]` lists the neighbours of `u`. Starting from node `0`, return the order in which a breadth-first search visits the nodes. Visit neighbours in the order they appear in `adj[u]`, and never visit a node twice. Nodes not reachable from 0 are not included.',
    examples: [
      { input: 'adj = [[1,2,3],[],[4],[],[]]', output: '[0, 1, 2, 3, 4]' },
      { input: 'adj = [[3,1],[0,2],[1],[0,4],[3]]', output: '[0, 3, 1, 4, 2]' },
    ],
    constraints: ['1 <= n <= 10^4', 'The total size of all lists is at most 10^5.'],
    hints: ['Use a queue and a visited array.', 'Mark a node visited when you push it, not when you pop it, to avoid duplicates.'],
    approach: 'Put node 0 in a queue and mark it visited. Repeatedly pop the front node, append it to the result, and push every neighbour that is not yet visited, marking it right away. Marking on push guarantees each node enters the queue at most once. Because the queue is first-in first-out, nodes come out in order of their distance from 0, and ties follow the adjacency list order. There is no slower brute force here; the main mistake is forgetting the visited check, which can loop forever on cycles.',
    complexity: 'Time O(n + e), Space O(n)',
    fn: { py: 'bfs_of_graph', js: 'bfsOfGraph' },
    py: {
      starter: 'def bfs_of_graph(adj):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def bfs_of_graph(adj):
    seen = [False] * len(adj)
    seen[0] = True
    q = deque([0])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                q.append(v)
    return order
`,
    },
    js: {
      starter: 'function bfsOfGraph(adj) {\n  // write your code here\n}\n',
      solution: `function bfsOfGraph(adj) {
  const seen = new Array(adj.length).fill(false);
  seen[0] = true;
  const q = [0];
  for (let h = 0; h < q.length; h++) {
    for (const v of adj[q[h]]) if (!seen[v]) { seen[v] = true; q.push(v); }
  }
  return q;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [], [4], [], []]], expect: [0, 1, 2, 3, 4] },
      { args: [[[1, 2], [0, 3], [0, 3], [1, 2]]], expect: [0, 1, 2, 3] },
      { args: [[[]]], expect: [0] },
      { args: [[[2], [2, 3], [0, 1], [1]]], expect: [0, 2, 1, 3] },
      { args: [[[1], [0], [3], [2]]], expect: [0, 1] },
      { args: [[[3, 1], [0, 2], [1], [0, 4], [3]]], expect: [0, 3, 1, 4, 2] },
    ],
  },
  {
    id: 'gr-dfs-traversal',
    title: 'DFS Traversal of a Graph',
    diff: 'Easy',
    pattern: 'Graphs',
    companies: ['Amazon', 'TCS', 'Capgemini'],
    statement: 'A graph with nodes `0` to `n - 1` is given as an adjacency list `adj`. Return the order in which a recursive depth-first search starting at node `0` first visits the nodes. Explore neighbours in the order they appear in `adj[u]`, and skip nodes already visited. Nodes not reachable from 0 are not included.',
    examples: [
      { input: 'adj = [[2,3,1],[0],[0,4],[0],[2]]', output: '[0, 2, 4, 3, 1]', explain: '0 -> 2 -> 4, back to 0 -> 3, back to 0 -> 1.' },
      { input: 'adj = [[1,2],[0,3],[0,3],[1,2]]', output: '[0, 1, 3, 2]' },
    ],
    constraints: ['1 <= n <= 10^4', 'The total size of all lists is at most 10^5.'],
    hints: ['Visit a node, then fully explore its first unvisited neighbour before moving to the next.', 'To avoid deep recursion, use a stack and push neighbours in REVERSE order; mark a node when you pop it.'],
    approach: 'Recursive DFS visits a node, records it, then calls itself on each unvisited neighbour in order. To get the same order without recursion limits, use an explicit stack: push 0, and each time you pop a node that is not yet visited, mark it, record it, and push its neighbours in reverse order so the first neighbour is on top. Nodes may be pushed more than once, but the visited check on pop makes sure each is recorded only once, in exactly the recursive order. Every node and edge is handled a constant number of times.',
    complexity: 'Time O(n + e), Space O(n + e)',
    fn: { py: 'dfs_of_graph', js: 'dfsOfGraph' },
    py: {
      starter: 'def dfs_of_graph(adj):\n    # write your code here\n    pass\n',
      solution: `def dfs_of_graph(adj):
    seen = [False] * len(adj)
    order = []
    stack = [0]
    while stack:
        u = stack.pop()
        if seen[u]:
            continue
        seen[u] = True
        order.append(u)
        for v in reversed(adj[u]):
            if not seen[v]:
                stack.append(v)
    return order
`,
    },
    js: {
      starter: 'function dfsOfGraph(adj) {\n  // write your code here\n}\n',
      solution: `function dfsOfGraph(adj) {
  const seen = new Array(adj.length).fill(false);
  const order = [];
  const stack = [0];
  while (stack.length) {
    const u = stack.pop();
    if (seen[u]) continue;
    seen[u] = true;
    order.push(u);
    for (let i = adj[u].length - 1; i >= 0; i--) if (!seen[adj[u][i]]) stack.push(adj[u][i]);
  }
  return order;
}
`,
    },
    tests: [
      { args: [[[2, 3, 1], [0], [0, 4], [0], [2]]], expect: [0, 2, 4, 3, 1] },
      { args: [[[1, 2], [0, 3], [0, 3], [1, 2]]], expect: [0, 1, 3, 2] },
      { args: [[[]]], expect: [0] },
      { args: [[[1], [0], [3], [2]]], expect: [0, 1] },
      { args: [[[1, 2, 3], [], [4], [], []]], expect: [0, 1, 2, 4, 3] },
      { args: [[[3, 1], [0, 2], [1], [0, 4], [3]]], expect: [0, 3, 4, 1, 2] },
    ],
  },
  {
    id: 'gr-star-center',
    title: 'Center of a Star Graph',
    diff: 'Easy',
    pattern: 'Graphs',
    companies: ['Microsoft', 'Infosys', 'HCL'],
    statement: 'An undirected star graph has nodes labelled `1` to `n`: one centre node is joined to every other node, and there are no other edges. Given the `n - 1` edges, return the centre.',
    examples: [
      { input: 'edges = [[1,2],[2,3],[4,2]]', output: '2' },
      { input: 'edges = [[1,2],[5,1],[1,3],[1,4]]', output: '1' },
    ],
    constraints: ['3 <= n <= 10^5', 'edges.length == n - 1', 'The input is a valid star graph.'],
    hints: ['The centre appears in every edge.', 'You only need the first two edges.'],
    approach: 'The centre is an endpoint of every single edge, while every other node appears in exactly one edge. So the node shared by the first two edges must be the centre. Compare the endpoints of edge 0 with those of edge 1 and return the common one. Counting degrees of all nodes also works in O(n), but the two-edge check is O(1).',
    complexity: 'Time O(1), Space O(1)',
    fn: { py: 'find_center', js: 'findCenter' },
    py: {
      starter: 'def find_center(edges):\n    # write your code here\n    pass\n',
      solution: `def find_center(edges):
    a, b = edges[0]
    return a if a in edges[1] else b
`,
    },
    js: {
      starter: 'function findCenter(edges) {\n  // write your code here\n}\n',
      solution: `function findCenter(edges) {
  const [a, b] = edges[0];
  return edges[1].includes(a) ? a : b;
}
`,
    },
    tests: [
      { args: [[[1, 2], [2, 3], [4, 2]]], expect: 2 },
      { args: [[[1, 2], [5, 1], [1, 3], [1, 4]]], expect: 1 },
      { args: [[[3, 1], [3, 2]]], expect: 3 },
      { args: [[[7, 4], [4, 5], [4, 1], [4, 2], [4, 3], [4, 6]]], expect: 4 },
      { args: [[[1, 2], [2, 3]]], expect: 2 },
      { args: [[[3, 4], [4, 1], [2, 4]]], expect: 4 },
    ],
  },
  {
    id: 'gr-number-of-islands',
    title: 'Number of Islands',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: 'A 2D grid contains `1` for land and `0` for water. An island is a group of land cells connected **horizontally or vertically** (not diagonally). Return the number of islands.',
    examples: [
      { input: 'grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]', output: '3' },
      { input: 'grid = [[1,0,1],[0,1,0],[1,0,1]]', output: '5', explain: 'Diagonal neighbours do not join islands.' },
    ],
    constraints: ['1 <= rows, cols <= 300', 'grid[i][j] is 0 or 1'],
    hints: ['Each time you find unvisited land, you have found a new island.', 'Flood fill (BFS/DFS) from it to mark the whole island as visited.'],
    approach: 'Scan every cell. When you find a land cell that has not been visited, increase the island count and flood fill from it: use a BFS queue to visit every land cell reachable through up, down, left and right moves, marking each as visited. After the flood fill the whole island is marked, so it is never counted again. Each cell is visited a constant number of times. A BFS is used instead of recursion so very large islands do not overflow the call stack. Union-find over land cells is an alternative.',
    complexity: 'Time O(rows * cols), Space O(rows * cols)',
    fn: { py: 'num_islands', js: 'numIslands' },
    py: {
      starter: 'def num_islands(grid):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and not seen[r][c]:
                count += 1
                seen[r][c] = True
                q = deque([(r, c)])
                while q:
                    x, y = q.popleft()
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 1 and not seen[nx][ny]:
                            seen[nx][ny] = True
                            q.append((nx, ny))
    return count
`,
    },
    js: {
      starter: 'function numIslands(grid) {\n  // write your code here\n}\n',
      solution: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      count++;
      seen[r][c] = true;
      const q = [[r, c]];
      for (let h = 0; h < q.length; h++) {
        const [x, y] = q[h];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] === 1 && !seen[nx][ny]) {
            seen[nx][ny] = true;
            q.push([nx, ny]);
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
      { args: [[[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]]], expect: 3 },
      { args: [[[1, 1, 1, 1, 0], [1, 1, 0, 1, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0]]], expect: 1 },
      { args: [[[0]]], expect: 0 },
      { args: [[[1]]], expect: 1 },
      { args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expect: 5 },
      { args: [[[1, 1], [1, 1]]], expect: 1 },
      { args: [[[1, 0, 0, 1]]], expect: 2 },
    ],
  },
  {
    id: 'gr-connected-components',
    title: 'Count Connected Components',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'LinkedIn', 'TCS Digital'],
    statement: 'An undirected graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges`. Return the number of connected components. An isolated node counts as its own component.',
    examples: [
      { input: 'n = 5, edges = [[0,1],[1,2],[3,4]]', output: '2' },
      { input: 'n = 7, edges = [[0,6],[6,3],[2,5]]', output: '4', explain: '{0,3,6}, {2,5}, {1}, {4}' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= edges.length <= 10^5'],
    hints: ['Start with n separate components.', 'Each edge that joins two different components reduces the count by one (union-find).'],
    approach: 'Use a union-find (disjoint set) structure with one set per node, so there are n components at the start. For each edge, find the roots of both endpoints; if they differ, merge the sets and decrease the component count by one. Edges inside an existing component change nothing. Path compression and union by size keep each operation nearly constant time. Running BFS from every unvisited node and counting the starts gives the same answer in O(n + e).',
    complexity: 'Time O((n + e) * alpha(n)), Space O(n)',
    fn: { py: 'count_components', js: 'countComponents' },
    py: {
      starter: 'def count_components(n, edges):\n    # write your code here\n    pass\n',
      solution: `def count_components(n, edges):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    count = n
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            if size[ru] < size[rv]:
                ru, rv = rv, ru
            parent[rv] = ru
            size[ru] += size[rv]
            count -= 1
    return count
`,
    },
    js: {
      starter: 'function countComponents(n, edges) {\n  // write your code here\n}\n',
      solution: `function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  let count = n;
  for (const [u, v] of edges) {
    let ru = find(u), rv = find(v);
    if (ru === rv) continue;
    if (size[ru] < size[rv]) [ru, rv] = [rv, ru];
    parent[rv] = ru;
    size[ru] += size[rv];
    count--;
  }
  return count;
}
`,
    },
    tests: [
      { args: [5, [[0, 1], [1, 2], [3, 4]]], expect: 2 },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expect: 1 },
      { args: [4, []], expect: 4 },
      { args: [1, []], expect: 1 },
      { args: [6, [[0, 1], [2, 3], [4, 5], [1, 0]]], expect: 3 },
      { args: [7, [[0, 6], [6, 3], [2, 5]]], expect: 4 },
    ],
  },
  {
    id: 'gr-cycle-undirected',
    title: 'Detect Cycle in an Undirected Graph',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Microsoft', 'Samsung', 'Infosys SP'],
    statement: 'An undirected graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges` (no self loops, no repeated edges). Return `true` if the graph contains at least one cycle, otherwise `false`. The graph may be disconnected.',
    examples: [
      { input: 'n = 3, edges = [[0,1],[1,2],[2,0]]', output: 'true' },
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3]]', output: 'false' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= edges.length <= 10^5'],
    hints: ['If both ends of an edge are already connected, adding it closes a loop.', 'Union-find answers "already connected?" quickly.'],
    approach: 'Process the edges one by one with union-find. Before adding edge (u, v), find the roots of u and v. If they are the same, u and v are already connected by some path, so this edge closes a cycle and the answer is true. Otherwise merge the two sets. If every edge merges two different sets, the graph is a forest and the answer is false. DFS that tracks the parent of each node is the other classic approach; it also runs in O(n + e).',
    complexity: 'Time O((n + e) * alpha(n)), Space O(n)',
    fn: { py: 'has_cycle_undirected', js: 'hasCycleUndirected' },
    py: {
      starter: 'def has_cycle_undirected(n, edges):\n    # write your code here\n    pass\n',
      solution: `def has_cycle_undirected(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return True
        parent[ru] = rv
    return False
`,
    },
    js: {
      starter: 'function hasCycleUndirected(n, edges) {\n  // write your code here\n}\n',
      solution: `function hasCycleUndirected(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return true;
    parent[ru] = rv;
  }
  return false;
}
`,
    },
    tests: [
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: true },
      { args: [4, [[0, 1], [1, 2], [2, 3]]], expect: false },
      { args: [1, []], expect: false },
      { args: [5, [[0, 1], [2, 3], [3, 4], [4, 2]]], expect: true },
      { args: [4, [[0, 1], [0, 2], [0, 3]]], expect: false },
      { args: [6, [[0, 1], [1, 2], [3, 4], [4, 5], [5, 3]]], expect: true },
    ],
  },
  {
    id: 'gr-cycle-directed',
    title: 'Detect Cycle in a Directed Graph',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'TCS Digital'],
    statement: 'A directed graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges`, where `[u, v]` is an edge from `u` to `v`. Return `true` if the graph contains a directed cycle (a self loop counts), otherwise `false`.',
    examples: [
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3],[3,1]]', output: 'true', explain: '1 -> 2 -> 3 -> 1' },
      { input: 'n = 4, edges = [[0,1],[0,2],[1,3],[2,3]]', output: 'false' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= edges.length <= 10^5'],
    hints: ['A directed graph has a topological order exactly when it has no cycle.', "Kahn's algorithm: repeatedly remove nodes with in-degree 0 and count them."],
    approach: "Compute the in-degree of every node and put all nodes with in-degree 0 into a queue. Pop a node, count it, and decrease the in-degree of each node it points to; any node that drops to 0 joins the queue. Nodes on a cycle never reach in-degree 0 because each waits for another node on the same cycle. So if the number of removed nodes is less than n, a cycle exists. DFS with three colours (unvisited, on the current path, finished) is the other standard method; an edge into an 'on path' node signals a cycle.",
    complexity: 'Time O(n + e), Space O(n + e)',
    fn: { py: 'has_cycle_directed', js: 'hasCycleDirected' },
    py: {
      starter: 'def has_cycle_directed(n, edges):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def has_cycle_directed(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    removed = 0
    while q:
        u = q.popleft()
        removed += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return removed < n
`,
    },
    js: {
      starter: 'function hasCycleDirected(n, edges) {\n  // write your code here\n}\n',
      solution: `function hasCycleDirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  for (let h = 0; h < q.length; h++) {
    for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v);
  }
  return q.length < n;
}
`,
    },
    tests: [
      { args: [4, [[0, 1], [1, 2], [2, 3], [3, 1]]], expect: true },
      { args: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expect: false },
      { args: [1, [[0, 0]]], expect: true },
      { args: [3, []], expect: false },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: true },
      { args: [5, [[0, 1], [1, 2], [3, 4], [4, 3]]], expect: true },
      { args: [5, [[4, 3], [3, 2], [2, 1], [1, 0]]], expect: false },
    ],
  },
  {
    id: 'gr-course-order',
    title: 'Course Schedule Order (Topological Sort)',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Flipkart', 'Uber'],
    statement: 'There are `n` courses labelled `0` to `n - 1`. `prereq[i] = [a, b]` means course `b` must be taken before course `a`. Return an order in which all courses can be taken. When several courses are available at the same time, always take the **smallest-numbered** one first, so the answer is unique. If it is impossible (circular dependency), return an empty list.',
    examples: [
      { input: 'n = 4, prereq = [[1,0],[2,0],[3,1],[3,2]]', output: '[0, 1, 2, 3]' },
      { input: 'n = 2, prereq = [[1,0],[0,1]]', output: '[]', explain: 'Each course waits for the other.' },
    ],
    constraints: ['1 <= n <= 2000', '0 <= prereq.length <= 5000', 'All pairs are distinct.'],
    hints: ["Kahn's algorithm takes courses whose prerequisites are all done.", 'Replace the queue with a min-heap to always pick the smallest available course.'],
    approach: "Build edges b -> a and count the in-degree (number of unmet prerequisites) of every course. Push every course with in-degree 0 into a min-heap. Repeatedly pop the smallest course, add it to the order, and decrease the in-degree of the courses that depend on it, pushing any that reach 0. If the final order contains all n courses it is valid; otherwise a cycle blocked some courses and the answer is an empty list. The heap adds a log factor but makes the order deterministic. Trying permutations of courses would be O(n!).",
    complexity: 'Time O((n + e) log n), Space O(n + e)',
    fn: { py: 'find_order', js: 'findOrder' },
    py: {
      starter: 'def find_order(n, prereq):\n    # write your code here\n    pass\n',
      solution: `import heapq

def find_order(n, prereq):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in prereq:
        adj[b].append(a)
        indeg[a] += 1
    heap = [i for i in range(n) if indeg[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(heap, v)
    return order if len(order) == n else []
`,
    },
    js: {
      starter: 'function findOrder(n, prereq) {\n  // write your code here\n}\n',
      solution: `function findOrder(n, prereq) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [a, b] of prereq) { adj[b].push(a); indeg[a]++; }
  const heap = [];
  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l] < heap[m]) m = l;
        if (r < heap.length && heap[r] < heap[m]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  for (let i = 0; i < n; i++) if (indeg[i] === 0) push(i);
  const order = [];
  while (heap.length) {
    const u = pop();
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) push(v);
  }
  return order.length === n ? order : [];
}
`,
    },
    tests: [
      { args: [2, [[1, 0]]], expect: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expect: [0, 1, 2, 3] },
      { args: [1, []], expect: [0] },
      { args: [2, [[1, 0], [0, 1]]], expect: [] },
      { args: [3, []], expect: [0, 1, 2] },
      { args: [5, [[0, 4], [1, 4], [2, 0], [2, 1], [3, 2]]], expect: [4, 0, 1, 2, 3] },
      { args: [6, [[3, 5], [0, 5], [0, 4], [1, 4], [1, 3], [2, 3]]], expect: [4, 5, 0, 3, 1, 2] },
    ],
  },
  {
    id: 'gr-is-bipartite',
    title: 'Is the Graph Bipartite?',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Samsung'],
    statement: 'An undirected graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges`. Return `true` if the nodes can be split into two groups so that every edge connects nodes from different groups, otherwise `false`. The graph may be disconnected.',
    examples: [
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]', output: 'true', explain: 'Groups {0, 2} and {1, 3}.' },
      { input: 'n = 3, edges = [[0,1],[1,2],[2,0]]', output: 'false', explain: 'A triangle (odd cycle) cannot be 2-coloured.' },
    ],
    constraints: ['1 <= n <= 10^4', '0 <= edges.length <= 10^5'],
    hints: ['Try to colour the graph with two colours.', 'BFS from every uncoloured node; a neighbour must get the opposite colour. A clash means false.'],
    approach: 'Give every node a colour of -1 (uncoloured). For each uncoloured node, start a BFS and colour it 0. When visiting a node, every uncoloured neighbour gets the opposite colour and joins the queue; a neighbour that already has the same colour means an edge inside one group, so return false. Restarting from every uncoloured node handles disconnected graphs. If every component is coloured without a clash, return true. Trying all 2^n splits would be far too slow.',
    complexity: 'Time O(n + e), Space O(n + e)',
    fn: { py: 'is_bipartite', js: 'isBipartite' },
    py: {
      starter: 'def is_bipartite(n, edges):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def is_bipartite(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    color = [-1] * n
    for s in range(n):
        if color[s] != -1:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return False
    return True
`,
    },
    js: {
      starter: 'function isBipartite(n, edges) {\n  // write your code here\n}\n',
      solution: `function isBipartite(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const color = new Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue;
    color[s] = 0;
    const q = [s];
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      for (const v of adj[u]) {
        if (color[v] === -1) { color[v] = 1 - color[u]; q.push(v); }
        else if (color[v] === color[u]) return false;
      }
    }
  }
  return true;
}
`,
    },
    tests: [
      { args: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expect: true },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: false },
      { args: [1, []], expect: true },
      { args: [5, [[0, 1], [2, 3]]], expect: true },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expect: false },
      { args: [6, [[0, 3], [0, 4], [1, 3], [2, 5], [1, 5]]], expect: true },
    ],
  },
  {
    id: 'gr-rotting-oranges',
    title: 'Rotting Oranges',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Paytm'],
    statement: 'In a grid, `0` is an empty cell, `1` is a fresh orange and `2` is a rotten orange. Every minute, each fresh orange that is directly up, down, left or right of a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains, or `-1` if some orange can never rot.',
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
      { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explain: 'The bottom-left orange is cut off.' },
    ],
    constraints: ['1 <= rows, cols <= 10', 'grid[i][j] is 0, 1 or 2'],
    hints: ['All rotten oranges spread at the same time: that is a multi-source BFS.', 'Process the queue level by level; each level is one minute.'],
    approach: 'Put every initially rotten orange into a queue and count the fresh ones. Run BFS level by level: during one level, every rotten orange in the queue rots its fresh neighbours, which join the queue for the next level, and the fresh count goes down. Each completed level that rotted at least one orange adds one minute. When the queue is empty, return the minutes if no fresh oranges remain, otherwise -1. Simulating minute by minute with full grid scans would be O((rows * cols)^2).',
    complexity: 'Time O(rows * cols), Space O(rows * cols)',
    fn: { py: 'oranges_rotting', js: 'orangesRotting' },
    py: {
      starter: 'def oranges_rotting(grid):\n    # write your code here\n    pass\n',
      solution: `def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    g = [row[:] for row in grid]
    frontier = []
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if g[r][c] == 2:
                frontier.append((r, c))
            elif g[r][c] == 1:
                fresh += 1
    minutes = 0
    while frontier and fresh:
        nxt = []
        for x, y in frontier:
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < rows and 0 <= ny < cols and g[nx][ny] == 1:
                    g[nx][ny] = 2
                    fresh -= 1
                    nxt.append((nx, ny))
        frontier = nxt
        minutes += 1
    return minutes if fresh == 0 else -1
`,
    },
    js: {
      starter: 'function orangesRotting(grid) {\n  // write your code here\n}\n',
      solution: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  const g = grid.map((row) => row.slice());
  let frontier = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (g[r][c] === 2) frontier.push([r, c]);
      else if (g[r][c] === 1) fresh++;
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  while (frontier.length && fresh) {
    const next = [];
    for (const [x, y] of frontier) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && g[nx][ny] === 1) {
          g[nx][ny] = 2;
          fresh--;
          next.push([nx, ny]);
        }
      }
    }
    frontier = next;
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
      { args: [[[2, 1, 1, 1]]], expect: 3 },
      { args: [[[2, 1], [1, 2]]], expect: 1 },
    ],
  },
  {
    id: 'gr-shortest-path-unweighted',
    title: 'Shortest Distances in an Unweighted Graph',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Flipkart', 'Infosys SP'],
    statement: 'An undirected, unweighted graph has `n` nodes labelled `0` to `n - 1` and an edge list `edges`. Return a list `dist` of length `n` where `dist[i]` is the fewest edges on a path from `src` to node `i`, or `-1` if node `i` cannot be reached.',
    examples: [
      { input: 'n = 6, edges = [[0,1],[0,2],[1,3],[2,3],[3,4]], src = 0', output: '[0, 1, 1, 2, 3, -1]' },
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3],[3,0]], src = 2', output: '[2, 1, 0, 1]' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= edges.length <= 10^5', '0 <= src < n'],
    hints: ['When all edges have the same weight, BFS finds shortest paths.', 'A node gets its distance the first time BFS reaches it.'],
    approach: 'Initialise every distance to -1 and set dist[src] = 0. Run BFS from src: when you pop node u, each neighbour v that still has distance -1 gets dist[u] + 1 and is pushed. BFS processes nodes in increasing distance order, so the first time a node is reached is along a shortest path. Unreached nodes keep -1. Dijkstra would also work but its heap is unnecessary when every edge weighs 1.',
    complexity: 'Time O(n + e), Space O(n + e)',
    fn: { py: 'shortest_distances', js: 'shortestDistances' },
    py: {
      starter: 'def shortest_distances(n, edges, src):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def shortest_distances(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    dist[src] = 0
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist
`,
    },
    js: {
      starter: 'function shortestDistances(n, edges, src) {\n  // write your code here\n}\n',
      solution: `function shortestDistances(n, edges, src) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const dist = new Array(n).fill(-1);
  dist[src] = 0;
  const q = [src];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of adj[u]) if (dist[v] === -1) { dist[v] = dist[u] + 1; q.push(v); }
  }
  return dist;
}
`,
    },
    tests: [
      { args: [6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0], expect: [0, 1, 1, 2, 3, -1] },
      { args: [1, [], 0], expect: [0] },
      { args: [3, [], 1], expect: [-1, 0, -1] },
      { args: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2], expect: [2, 1, 0, 1] },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]], 0], expect: [0, 1, 2, 2, 1] },
      { args: [3, [[0, 1], [1, 2]], 2], expect: [2, 1, 0] },
    ],
  },
  {
    id: 'gr-redundant-connection',
    title: 'Redundant Connection',
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: 'A tree with nodes `1` to `n` had one extra edge added, so `edges` now has `n` edges and exactly one cycle. Return the edge that can be removed so the remaining graph is a tree. If several edges qualify, return the one that appears **last** in `edges`. Return it exactly as given.',
    examples: [
      { input: 'edges = [[1,2],[1,3],[2,3]]', output: '[2, 3]' },
      { input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]', output: '[1, 4]' },
    ],
    constraints: ['3 <= n <= 1000', 'edges.length == n', 'No repeated edges; the graph is connected.'],
    hints: ['Add edges one at a time with union-find.', 'The first edge whose endpoints are already connected is the answer.'],
    approach: 'Process the edges in order using union-find. For each edge, if its two endpoints already have the same root, they are already connected, so this edge closes the cycle; return it. Otherwise union them. Every edge on the cycle is a valid removal, and the edge that closes the cycle during this scan is the cycle edge that appears last in the input, which is exactly what is required. Trying to remove each edge and then testing connectivity would take O(n^2).',
    complexity: 'Time O(n * alpha(n)), Space O(n)',
    fn: { py: 'find_redundant_connection', js: 'findRedundantConnection' },
    py: {
      starter: 'def find_redundant_connection(edges):\n    # write your code here\n    pass\n',
      solution: `def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]
        parent[ru] = rv
    return []
`,
    },
    js: {
      starter: 'function findRedundantConnection(edges) {\n  // write your code here\n}\n',
      solution: `function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v];
    parent[ru] = rv;
  }
  return [];
}
`,
    },
    tests: [
      { args: [[[1, 2], [1, 3], [2, 3]]], expect: [2, 3] },
      { args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expect: [1, 4] },
      { args: [[[1, 2], [2, 3], [3, 1]]], expect: [3, 1] },
      { args: [[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]], expect: [2, 5] },
      { args: [[[1, 4], [3, 4], [1, 3], [1, 2], [4, 5]]], expect: [1, 3] },
      { args: [[[2, 1], [3, 1], [4, 2], [1, 4]]], expect: [1, 4] },
    ],
  },
  {
    id: 'gr-dijkstra',
    title: "Dijkstra's Shortest Paths",
    diff: 'Medium',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Uber', 'TCS Digital'],
    statement: 'A directed graph has `n` nodes labelled `0` to `n - 1`. Each edge `[u, v, w]` goes from `u` to `v` with a non-negative weight `w`. Return a list `dist` of length `n` where `dist[i]` is the smallest total weight of a path from `src` to `i`, or `-1` if `i` is unreachable.',
    examples: [
      { input: 'n = 4, edges = [[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]], src = 0', output: '[0, 3, 1, 4]', explain: '0 -> 2 -> 1 costs 3, then 1 -> 3 adds 1.' },
      { input: 'n = 3, edges = [[0,1,5]], src = 0', output: '[0, 5, -1]' },
    ],
    constraints: ['1 <= n <= 10^4', '0 <= edges.length <= 5 * 10^4', '0 <= w <= 10^4'],
    hints: ['Always settle the unsettled node with the smallest tentative distance.', 'A min-heap of (distance, node) does this efficiently; skip stale heap entries.'],
    approach: 'Set every distance to infinity except dist[src] = 0 and push (0, src) into a min-heap. Pop the entry with the smallest distance; if it is larger than the recorded distance for that node, it is stale and skipped. Otherwise relax each outgoing edge: if dist[u] + w beats dist[v], update it and push the new pair. With non-negative weights, the first time a node is popped its distance is final. Finally replace infinities with -1. Bellman-Ford solves the same problem in O(n * e), which is much slower.',
    complexity: 'Time O((n + e) log n), Space O(n + e)',
    fn: { py: 'dijkstra', js: 'dijkstra' },
    py: {
      starter: 'def dijkstra(n, edges, src):\n    # write your code here\n    pass\n',
      solution: `import heapq

def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return [d if d != INF else -1 for d in dist]
`,
    },
    js: {
      starter: 'function dijkstra(n, edges, src) {\n  // write your code here\n}\n',
      solution: `function dijkstra(n, edges, src) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w]);
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const heap = [[0, src]];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; push([dist[v], v]); }
    }
  }
  return dist.map((d) => (d === Infinity ? -1 : d));
}
`,
    },
    tests: [
      { args: [4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0], expect: [0, 3, 1, 4] },
      { args: [3, [[0, 1, 5]], 0], expect: [0, 5, -1] },
      { args: [1, [], 0], expect: [0] },
      { args: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 5]], 0], expect: [0, 1, 2] },
      { args: [5, [[0, 1, 10], [0, 4, 3], [4, 1, 4], [1, 2, 2], [4, 2, 8], [2, 3, 7], [4, 3, 2]], 0], expect: [0, 7, 9, 5, 3] },
      { args: [3, [[1, 0, 2], [1, 2, 3]], 1], expect: [2, 0, 3] },
      { args: [2, [[1, 0, 1]], 0], expect: [0, -1] },
    ],
  },
  {
    id: 'gr-cheapest-flights-k-stops',
    title: 'Cheapest Flights Within K Stops',
    diff: 'Hard',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'MakeMyTrip', 'Airbnb'],
    statement: 'There are `n` cities and a list of one-way `flights` where `[u, v, price]` is a flight from `u` to `v`. Return the cheapest price to travel from `src` to `dst` using **at most `k` stops** (intermediate cities). If no such route exists, return `-1`.',
    examples: [
      { input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', output: '700', explain: '0 -> 1 -> 3. The route via 2 needs 2 stops.' },
      { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0', output: '500' },
    ],
    constraints: ['1 <= n <= 100', '0 <= flights.length <= n * (n - 1) / 2', '0 <= k < n', 'src != dst'],
    hints: ['At most k stops means at most k + 1 flights.', 'Run Bellman-Ford for k + 1 rounds, relaxing from a COPY of the previous round\'s prices.'],
    approach: 'Keep an array price where price[c] is the cheapest cost to reach city c using at most r flights after round r. Start with price[src] = 0 and everything else infinity. Repeat k + 1 times: copy the array, and for every flight (u, v, p) update copy[v] with price[u] + p if that is cheaper. Reading from the old array and writing into the copy ensures each round adds at most one flight. After k + 1 rounds, price[dst] is the answer, or -1 if still infinity. Plain Dijkstra on cost alone can miss routes because it ignores the stop limit.',
    complexity: 'Time O(k * e), Space O(n)',
    fn: { py: 'find_cheapest_price', js: 'findCheapestPrice' },
    py: {
      starter: 'def find_cheapest_price(n, flights, src, dst, k):\n    # write your code here\n    pass\n',
      solution: `def find_cheapest_price(n, flights, src, dst, k):
    INF = float('inf')
    price = [INF] * n
    price[src] = 0
    for _ in range(k + 1):
        nxt = price[:]
        for u, v, p in flights:
            if price[u] + p < nxt[v]:
                nxt[v] = price[u] + p
        price = nxt
    return price[dst] if price[dst] != INF else -1
`,
    },
    js: {
      starter: 'function findCheapestPrice(n, flights, src, dst, k) {\n  // write your code here\n}\n',
      solution: `function findCheapestPrice(n, flights, src, dst, k) {
  let price = new Array(n).fill(Infinity);
  price[src] = 0;
  for (let r = 0; r <= k; r++) {
    const next = price.slice();
    for (const [u, v, p] of flights) if (price[u] + p < next[v]) next[v] = price[u] + p;
    price = next;
  }
  return price[dst] === Infinity ? -1 : price[dst];
}
`,
    },
    tests: [
      { args: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], expect: 700 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], expect: 200 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], expect: 500 },
      { args: [3, [[0, 1, 100]], 0, 2, 1], expect: -1 },
      { args: [4, [[0, 1, 1], [0, 2, 5], [1, 2, 1], [2, 3, 1]], 0, 3, 1], expect: 6 },
      { args: [4, [[0, 1, 1], [0, 2, 5], [1, 2, 1], [2, 3, 1]], 0, 3, 2], expect: 3 },
      { args: [2, [[0, 1, 5]], 1, 0, 1], expect: -1 },
    ],
  },
  {
    id: 'gr-word-ladder',
    title: 'Word Ladder',
    diff: 'Hard',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    statement: 'Given `beginWord`, `endWord` and a dictionary `wordList`, transform `beginWord` into `endWord` by changing **one letter at a time**, where every intermediate word (and `endWord`) must be in `wordList`. Return the number of words in the shortest transformation sequence, counting both ends, or `0` if no sequence exists.',
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explain: 'hit -> hot -> dot -> dog -> cog' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explain: '"cog" is not in the list.' },
    ],
    constraints: ['1 <= beginWord.length <= 10', 'All words have the same length and are lowercase.', '1 <= wordList.length <= 5000', 'beginWord != endWord'],
    hints: ['Words are nodes; an edge joins words that differ by one letter. Find the shortest path.', 'Generate neighbours by trying all 26 letters at each position and checking the word set.'],
    approach: 'Put the dictionary in a set; if endWord is missing, return 0. BFS from beginWord with level 1. For each word popped, try replacing every position with every letter a to z; if the new word is in the set, it is a neighbour. If it equals endWord, return level + 1. Otherwise remove it from the set (so it is never visited twice) and push it with level + 1. If BFS finishes, return 0. Comparing every pair of words to build edges costs O(N^2 * L), which is slow for 5000 words.',
    complexity: 'Time O(N * L * 26), Space O(N * L)',
    fn: { py: 'ladder_length', js: 'ladderLength' },
    py: {
      starter: 'def ladder_length(begin_word, end_word, word_list):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def ladder_length(begin_word, end_word, word_list):
    words = set(word_list)
    if end_word not in words:
        return 0
    words.discard(begin_word)
    q = deque([(begin_word, 1)])
    letters = 'abcdefghijklmnopqrstuvwxyz'
    while q:
        w, level = q.popleft()
        for i in range(len(w)):
            for ch in letters:
                cand = w[:i] + ch + w[i + 1:]
                if cand in words:
                    if cand == end_word:
                        return level + 1
                    words.remove(cand)
                    q.append((cand, level + 1))
    return 0
`,
    },
    js: {
      starter: 'function ladderLength(beginWord, endWord, wordList) {\n  // write your code here\n}\n',
      solution: `function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  words.delete(beginWord);
  const q = [[beginWord, 1]];
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  for (let h = 0; h < q.length; h++) {
    const [w, level] = q[h];
    for (let i = 0; i < w.length; i++) {
      for (const ch of letters) {
        const cand = w.slice(0, i) + ch + w.slice(i + 1);
        if (!words.has(cand)) continue;
        if (cand === endWord) return level + 1;
        words.delete(cand);
        q.push([cand, level + 1]);
      }
    }
  }
  return 0;
}
`,
    },
    tests: [
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expect: 5 },
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expect: 0 },
      { args: ['a', 'c', ['a', 'b', 'c']], expect: 2 },
      { args: ['hot', 'dog', ['hot', 'dog']], expect: 0 },
      { args: ['hot', 'dot', ['dot']], expect: 2 },
      { args: ['lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish']], expect: 2 },
      { args: ['red', 'tax', ['ted', 'tex', 'red', 'tax', 'tad', 'den', 'rex', 'pee']], expect: 4 },
    ],
  },
  {
    id: 'gr-alien-dictionary',
    title: 'Alien Dictionary',
    diff: 'Hard',
    pattern: 'Graphs',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: 'An alien language uses lowercase English letters in an unknown order. You are given `words`, sorted according to that order. Return a string of all the distinct letters in `words` in an order consistent with the list. When several letters could come next, choose the one that is **earliest in the normal English alphabet**, so the answer is unique. If the list is impossible (a contradiction, or a word listed before its own proper prefix), return `""`.',
    examples: [
      { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"' },
      { input: 'words = ["z","x","z"]', output: '""', explain: 'z < x and x < z is a contradiction.' },
      { input: 'words = ["abc","ab"]', output: '""', explain: 'A longer word cannot come before its own prefix.' },
    ],
    constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 100', 'Lowercase letters only.'],
    hints: ['Compare each adjacent pair of words: the first differing letter gives one ordering rule.', 'Topologically sort the letters with a min-heap to break ties alphabetically.'],
    approach: 'Collect every letter that appears. For each adjacent pair of words, find the first position where they differ; that gives an edge from the letter in the first word to the letter in the second. If there is no difference and the first word is longer, the input is invalid. Then run Kahn\'s topological sort over the letters, using a min-heap so the alphabetically smallest available letter is taken first. If not every letter gets output, there was a cycle, so return the empty string. Comparing all pairs of words instead of adjacent ones would add redundant edges and O(n^2) work.',
    complexity: 'Time O(C + U log U) where C is total characters and U distinct letters, Space O(U^2)',
    fn: { py: 'alien_order', js: 'alienOrder' },
    py: {
      starter: 'def alien_order(words):\n    # write your code here\n    pass\n',
      solution: `import heapq

def alien_order(words):
    letters = set(''.join(words))
    adj = {c: set() for c in letters}
    indeg = {c: 0 for c in letters}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in adj[x]:
                    adj[x].add(y)
                    indeg[y] += 1
                break
        else:
            if len(a) > len(b):
                return ''
    heap = [c for c in letters if indeg[c] == 0]
    heapq.heapify(heap)
    out = []
    while heap:
        c = heapq.heappop(heap)
        out.append(c)
        for d in adj[c]:
            indeg[d] -= 1
            if indeg[d] == 0:
                heapq.heappush(heap, d)
    return ''.join(out) if len(out) == len(letters) else ''
`,
    },
    js: {
      starter: 'function alienOrder(words) {\n  // write your code here\n}\n',
      solution: `function alienOrder(words) {
  const adj = new Map();
  const indeg = new Map();
  for (const w of words) for (const c of w) if (!adj.has(c)) { adj.set(c, new Set()); indeg.set(c, 0); }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    let found = false;
    for (let j = 0; j < Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j]).has(b[j])) { adj.get(a[j]).add(b[j]); indeg.set(b[j], indeg.get(b[j]) + 1); }
        found = true;
        break;
      }
    }
    if (!found && a.length > b.length) return '';
  }
  const avail = [...indeg.keys()].filter((c) => indeg.get(c) === 0);
  const out = [];
  while (avail.length) {
    avail.sort();
    const c = avail.shift();
    out.push(c);
    for (const d of adj.get(c)) {
      indeg.set(d, indeg.get(d) - 1);
      if (indeg.get(d) === 0) avail.push(d);
    }
  }
  return out.length === adj.size ? out.join('') : '';
}
`,
    },
    tests: [
      { args: [['wrt', 'wrf', 'er', 'ett', 'rftt']], expect: 'wertf' },
      { args: [['z', 'x']], expect: 'zx' },
      { args: [['z', 'x', 'z']], expect: '' },
      { args: [['abc', 'ab']], expect: '' },
      { args: [['ab', 'adc']], expect: 'abcd' },
      { args: [['baa', 'abcd', 'abca', 'cab', 'cad']], expect: 'bdac' },
      { args: [['x']], expect: 'x' },
    ],
  },
  {
    id: 'gr-critical-connections',
    title: 'Critical Connections (Bridges)',
    diff: 'Hard',
    pattern: 'Graphs',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: 'A connected undirected network has `n` servers labelled `0` to `n - 1` and a list of `connections`. A connection is **critical** if removing it disconnects some servers. Return all critical connections, each written as `[u, v]` with `u < v`, and the whole list sorted in ascending order.',
    examples: [
      { input: 'n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]', output: '[[1, 3]]' },
      { input: 'n = 5, connections = [[1,0],[2,0],[3,2],[4,2],[4,3]]', output: '[[0, 1], [0, 2]]' },
    ],
    constraints: ['2 <= n <= 10^5', 'n - 1 <= connections.length <= 10^5', 'No repeated connections.'],
    hints: ['An edge on a cycle is never critical.', "Tarjan's algorithm: track discovery time and the lowest discovery time reachable (low). Edge (p, c) is a bridge if low[c] > disc[p]."],
    approach: "Run a DFS and give each node a discovery time disc. Also compute low[u], the smallest discovery time reachable from u's subtree using at most one back edge. For a tree edge from parent p to child c, if low[c] > disc[p], the child's subtree has no other way back to p or above, so the edge is a bridge. Skip the edge you came in on (by edge id) when looking for back edges. The DFS is written with an explicit stack so deep graphs do not overflow. Normalise each bridge as [min, max] and sort. Removing each edge and testing connectivity would take O(e * (n + e)).",
    complexity: 'Time O(n + e) plus O(b log b) to sort b bridges, Space O(n + e)',
    fn: { py: 'critical_connections', js: 'criticalConnections' },
    py: {
      starter: 'def critical_connections(n, connections):\n    # write your code here\n    pass\n',
      solution: `def critical_connections(n, connections):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(connections):
        adj[u].append((v, i))
        adj[v].append((u, i))
    disc = [-1] * n
    low = [0] * n
    timer = 0
    res = []
    for s in range(n):
        if disc[s] != -1:
            continue
        disc[s] = low[s] = timer
        timer += 1
        stack = [[s, -1, 0]]
        while stack:
            top = stack[-1]
            u, pe, i = top
            if i < len(adj[u]):
                top[2] += 1
                v, eid = adj[u][i]
                if eid == pe:
                    continue
                if disc[v] == -1:
                    disc[v] = low[v] = timer
                    timer += 1
                    stack.append([v, eid, 0])
                else:
                    low[u] = min(low[u], disc[v])
            else:
                stack.pop()
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        res.append([min(p, u), max(p, u)])
    res.sort()
    return res
`,
    },
    js: {
      starter: 'function criticalConnections(n, connections) {\n  // write your code here\n}\n',
      solution: `function criticalConnections(n, connections) {
  const adj = Array.from({ length: n }, () => []);
  connections.forEach(([u, v], i) => { adj[u].push([v, i]); adj[v].push([u, i]); });
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  let timer = 0;
  const res = [];
  for (let s = 0; s < n; s++) {
    if (disc[s] !== -1) continue;
    disc[s] = low[s] = timer++;
    const stack = [[s, -1, 0]];
    while (stack.length) {
      const top = stack[stack.length - 1];
      const [u, pe, i] = top;
      if (i < adj[u].length) {
        top[2]++;
        const [v, eid] = adj[u][i];
        if (eid === pe) continue;
        if (disc[v] === -1) {
          disc[v] = low[v] = timer++;
          stack.push([v, eid, 0]);
        } else {
          low[u] = Math.min(low[u], disc[v]);
        }
      } else {
        stack.pop();
        if (stack.length) {
          const p = stack[stack.length - 1][0];
          low[p] = Math.min(low[p], low[u]);
          if (low[u] > disc[p]) res.push([Math.min(p, u), Math.max(p, u)]);
        }
      }
    }
  }
  res.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return res;
}
`,
    },
    tests: [
      { args: [4, [[0, 1], [1, 2], [2, 0], [1, 3]]], expect: [[1, 3]] },
      { args: [2, [[0, 1]]], expect: [[0, 1]] },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: [] },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expect: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      { args: [6, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 5], [5, 3]]], expect: [[1, 3]] },
      { args: [5, [[1, 0], [2, 0], [3, 2], [4, 2], [4, 3]]], expect: [[0, 1], [0, 2]] },
    ],
  },
  {
    id: 'gr-swim-rising-water',
    title: 'Swim in Rising Water',
    diff: 'Hard',
    pattern: 'Graphs',
    companies: ['Google', 'Amazon', 'Uber'],
    statement: 'An `n x n` grid gives the elevation of each cell. At time `t` the water level is `t`, and you can swim between two 4-directionally adjacent cells only if both elevations are at most `t` (swimming itself takes no time). Starting at the top-left cell, return the smallest time `t` at which you can reach the bottom-right cell.',
    examples: [
      { input: 'grid = [[0,2],[1,3]]', output: '3', explain: 'The target cell itself has height 3.' },
      { input: 'grid = [[0,8,7],[1,9,6],[2,3,4]]', output: '4', explain: 'Path 0 -> 1 -> 2 -> 3 -> 4.' },
    ],
    constraints: ['1 <= n <= 50', '0 <= grid[i][j] <= 2500'],
    hints: ['The cost of a path is the MAXIMUM cell on it, not the sum.', 'Use Dijkstra where the key is the highest elevation seen so far on the path.'],
    approach: 'The time needed for a path is the largest elevation on it, and we want the path that minimises that maximum. Run a Dijkstra-style search from the top-left cell where the key of a cell is max(key of the cell we came from, its own elevation). Always expand the cell with the smallest key from a min-heap, marking cells when they are popped. When the bottom-right cell is popped, its key is the answer. An alternative is binary search on t with a BFS check each time, costing O(n^2 log(maxHeight)). Trying all paths is exponential.',
    complexity: 'Time O(n^2 log n), Space O(n^2)',
    fn: { py: 'swim_in_water', js: 'swimInWater' },
    py: {
      starter: 'def swim_in_water(grid):\n    # write your code here\n    pass\n',
      solution: `import heapq

def swim_in_water(grid):
    n = len(grid)
    seen = [[False] * n for _ in range(n)]
    heap = [(grid[0][0], 0, 0)]
    while heap:
        t, r, c = heapq.heappop(heap)
        if seen[r][c]:
            continue
        seen[r][c] = True
        if r == n - 1 and c == n - 1:
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and not seen[nr][nc]:
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1
`,
    },
    js: {
      starter: 'function swimInWater(grid) {\n  // write your code here\n}\n',
      solution: `function swimInWater(grid) {
  const n = grid.length;
  const seen = Array.from({ length: n }, () => new Array(n).fill(false));
  const heap = [];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  push([grid[0][0], 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (heap.length) {
    const [t, r, c] = pop();
    if (seen[r][c]) continue;
    seen[r][c] = true;
    if (r === n - 1 && c === n - 1) return t;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc]) push([Math.max(t, grid[nr][nc]), nr, nc]);
    }
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[[0, 2], [1, 3]]], expect: 3 },
      { args: [[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]], expect: 16 },
      { args: [[[0]]], expect: 0 },
      { args: [[[3, 2], [0, 1]]], expect: 3 },
      { args: [[[0, 1], [2, 3]]], expect: 3 },
      { args: [[[0, 8, 7], [1, 9, 6], [2, 3, 4]]], expect: 4 },
      { args: [[[5, 1], [9, 2]]], expect: 5 },
    ],
  },
];
