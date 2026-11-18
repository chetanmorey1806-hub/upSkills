export default {
  id: "day-14-graphs-bfs-dfs-topological-dijkstra",
  title: "Graphs: Representation, BFS, DFS, Topological Sort and Dijkstra",
  module: "Module 4: Trees, Heaps & Graphs",
  day: 14,
  level: "Advanced",
  duration: "4 hours",
  summary: "Learn graph vocabulary and how to represent graphs in Python with adjacency lists, then master BFS (shortest path in unweighted graphs), DFS (connected components, cycle detection, grid islands), topological sort for dependencies, and Dijkstra's algorithm with heapq for weighted shortest paths.",
  objectives: [
    "Describe directed/undirected, weighted/unweighted, cyclic/acyclic graphs",
    "Represent graphs with adjacency lists (dict of lists) and adjacency matrices",
    "Implement BFS and DFS with a visited set and analyse O(V + E) complexity",
    "Solve grid problems (number of islands) and detect cycles",
    "Apply topological sort (Kahn's algorithm) and Dijkstra's shortest path",
  ],
  theory: [
    {
      heading: "What is a Graph?",
      content: `A graph G = (V, E) is a set of **vertices** (nodes) connected by **edges**. Graphs model relationships: cities and roads (Google Maps), people and friendships (LinkedIn), web pages and links, course prerequisites, computer networks.

Trees are a special kind of graph (connected, no cycles). General graphs can have cycles, can be disconnected and have no root.`,
      points: [
        "Undirected: edge goes both ways (friendship). Directed: one-way (Instagram follow)",
        "Weighted: edges have costs (distance, time). Unweighted: all edges cost the same",
        "Cyclic vs acyclic; a Directed Acyclic Graph is called a DAG",
        "Degree: number of edges at a vertex (in-degree / out-degree for directed graphs)",
        "Connected component: a group of vertices all reachable from each other",
      ],
    },
    {
      heading: "Representing Graphs in Python",
      content: `**Adjacency list:** for each vertex, store a list of its neighbours. In Python use a dict of lists (defaultdict(list)). Space O(V + E). Best for sparse graphs, which is most real and interview graphs.

**Adjacency matrix:** a V x V 2D list where matrix[u][v] = 1 (or weight) if there is an edge. O(1) edge check but O(V^2) space. Good for dense graphs or small V.

**Edge list:** a list of (u, v, w) tuples; used as input format and in Kruskal's algorithm.

**Implicit graph:** grids, where each cell's neighbours are up/down/left/right, so no explicit structure is built.`,
      syntax: `from collections import defaultdict
edges = [(0, 1), (0, 2), (1, 3)]
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)      # omit for a directed graph

weighted = defaultdict(list)
weighted["A"].append(("B", 4))   # (neighbour, weight)
`,
    },
    {
      heading: "Breadth-First Search (BFS)",
      content: `BFS explores the graph level by level from a source using a queue. Because it reaches vertices in order of their number of edges from the source, BFS finds the **shortest path in an unweighted graph**. Mark vertices visited when you ENQUEUE them, so a vertex is never added twice.

Time O(V + E): each vertex is enqueued once and each edge is checked once (twice for undirected). Space O(V).`,
      syntax: `from collections import deque
def bfs(graph, start):
    visited = {start}
    q = deque([start])
    while q:
        node = q.popleft()
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                q.append(nb)
`,
    },
    {
      heading: "Depth-First Search (DFS)",
      content: `DFS goes as deep as possible along one path before backtracking, using recursion or an explicit stack. Uses: counting connected components, flood fill / islands in a grid, detecting cycles, finding paths, topological sort and checking bipartiteness. Time O(V + E), space O(V) for visited plus recursion depth.

**Cycle detection:** in an undirected graph, a visited neighbour that is not the parent means a cycle. In a directed graph, use three colours (unvisited, visiting, done): reaching a 'visiting' vertex means a back edge, i.e. a cycle.`,
      tip: "For large grids or long paths, recursive DFS can exceed Python's recursion limit; use an explicit stack or BFS.",
    },
    {
      heading: "Topological Sort",
      content: `A topological order of a DAG lists vertices so that every edge u -> v has u before v. Example: you must finish 'Python Basics' before 'DSA' before 'Interview Prep'.

**Kahn's algorithm (BFS):** compute in-degrees; push all vertices with in-degree 0 into a queue; repeatedly pop one, add it to the order, and decrement the in-degree of its neighbours, pushing any that reach 0. If the order contains fewer than V vertices, the graph has a cycle (no valid order). O(V + E).

The DFS method appends each vertex after visiting all its descendants (post-order) and reverses the list at the end.`,
    },
    {
      heading: "Dijkstra's Shortest Path (Intro)",
      content: `For weighted graphs with **non-negative** weights, Dijkstra's algorithm finds the shortest distance from a source to every vertex. It always expands the closest unfinished vertex, using a min-heap of (distance, vertex). When popping, skip stale entries whose distance is larger than the best known. For each neighbour, if dist[u] + w improves dist[v], update and push.

Time O((V + E) log V) with heapq. Negative edge weights break Dijkstra; use Bellman-Ford (O(V * E)) instead. For unweighted graphs, plain BFS is enough.`,
      points: [
        "BFS / DFS / connected components / Kahn: O(V + E)",
        "Dijkstra with a binary heap: O((V + E) log V)",
        "Adjacency matrix BFS: O(V^2)",
        "Grid of R x C cells: V = R*C, E is about 4*R*C, so O(R * C)",
      ],
    },
  ],
  examples: [
    {
      title: "Build a Graph: Adjacency List and Matrix",
      scenario: "Represent a small network of metro stations both ways and query neighbours and degrees.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import defaultdict

stations = ["Andheri", "Bandra", "Dadar", "Kurla"]
routes = [("Andheri", "Bandra"), ("Bandra", "Dadar"), ("Dadar", "Kurla"), ("Andheri", "Kurla")]

adj = defaultdict(list)
for u, v in routes:
    adj[u].append(v)
    adj[v].append(u)
for s in stations:
    print(f"{s:8} -> {adj[s]} (degree {len(adj[s])})")

index = {s: i for i, s in enumerate(stations)}
matrix = [[0] * len(stations) for _ in stations]
for u, v in routes:
    matrix[index[u]][index[v]] = matrix[index[v]][index[u]] = 1
for s, row in zip(stations, matrix):
    print(f"{s:8} {row}")
print("Bandra-Kurla direct?", bool(matrix[index["Bandra"]][index["Kurla"]]))
`,
      python: {
        files: {
          "main.py": `from collections import defaultdict

stations = ["Andheri", "Bandra", "Dadar", "Kurla"]
routes = [("Andheri", "Bandra"), ("Bandra", "Dadar"), ("Dadar", "Kurla"), ("Andheri", "Kurla")]

adj = defaultdict(list)
for u, v in routes:
    adj[u].append(v)
    adj[v].append(u)
for s in stations:
    print(f"{s:8} -> {adj[s]} (degree {len(adj[s])})")

index = {s: i for i, s in enumerate(stations)}
matrix = [[0] * len(stations) for _ in stations]
for u, v in routes:
    matrix[index[u]][index[v]] = matrix[index[v]][index[u]] = 1
for s, row in zip(stations, matrix):
    print(f"{s:8} {row}")
print("Bandra-Kurla direct?", bool(matrix[index["Bandra"]][index["Kurla"]]))
`,
        },
      },
      result: `Andheri  -> ['Bandra', 'Kurla'] (degree 2)
Bandra   -> ['Andheri', 'Dadar'] (degree 2)
Dadar    -> ['Bandra', 'Kurla'] (degree 2)
Kurla    -> ['Dadar', 'Andheri'] (degree 2)
Andheri  [0, 1, 0, 1]
Bandra   [1, 0, 1, 0]
Dadar    [0, 1, 0, 1]
Kurla    [1, 0, 1, 0]
Bandra-Kurla direct? False`,
      explanation: "The adjacency list stores only existing edges (O(V + E) space), ideal for sparse graphs. The matrix uses O(V^2) space but answers 'is there an edge?' in O(1). For an undirected graph each edge is stored in both directions.",
    },
    {
      title: "BFS Shortest Path in an Unweighted Graph",
      scenario: "Find the minimum number of connections between two people in a friend network and print the path.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

friends = {
    "Asha": ["Ravi", "Meena"],
    "Ravi": ["Asha", "Kiran"],
    "Meena": ["Asha", "Kiran", "Zoya"],
    "Kiran": ["Ravi", "Meena", "Arjun"],
    "Zoya": ["Meena", "Arjun"],
    "Arjun": ["Kiran", "Zoya"],
    "Dev": [],
}

def shortest_path(graph, start, goal):
    parent = {start: None}
    q = deque([start])
    while q:
        node = q.popleft()
        if node == goal:
            path = []
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]
        for nb in graph[node]:
            if nb not in parent:        # parent dict doubles as visited set
                parent[nb] = node
                q.append(nb)
    return None

print(shortest_path(friends, "Asha", "Arjun"))
print(shortest_path(friends, "Ravi", "Zoya"))
print(shortest_path(friends, "Asha", "Dev"))
`,
      python: {
        files: {
          "main.py": `from collections import deque

friends = {
    "Asha": ["Ravi", "Meena"],
    "Ravi": ["Asha", "Kiran"],
    "Meena": ["Asha", "Kiran", "Zoya"],
    "Kiran": ["Ravi", "Meena", "Arjun"],
    "Zoya": ["Meena", "Arjun"],
    "Arjun": ["Kiran", "Zoya"],
    "Dev": [],
}

def shortest_path(graph, start, goal):
    parent = {start: None}
    q = deque([start])
    while q:
        node = q.popleft()
        if node == goal:
            path = []
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]
        for nb in graph[node]:
            if nb not in parent:        # parent dict doubles as visited set
                parent[nb] = node
                q.append(nb)
    return None

print(shortest_path(friends, "Asha", "Arjun"))
print(shortest_path(friends, "Ravi", "Zoya"))
print(shortest_path(friends, "Asha", "Dev"))
`,
        },
      },
      result: `['Asha', 'Ravi', 'Kiran', 'Arjun']
['Ravi', 'Asha', 'Meena', 'Zoya']
None`,
      explanation: "BFS reaches every person in order of distance, so the first time we pop the goal we have a shortest path. Storing each node's parent lets us rebuild the path backwards. Dev is unreachable, so None is returned. O(V + E).",
    },
    {
      title: "DFS: Number of Islands in a Grid",
      scenario: "LeetCode 200: count groups of connected land cells ('1') in a map, moving up/down/left/right.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def dfs(r, c):
        stack = [(r, c)]                 # iterative to avoid recursion limits
        seen.add((r, c))
        size = 0
        while stack:
            cr, cc = stack.pop()
            size += 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = cr + dr, cc + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1" and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return size

    sizes = []
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                sizes.append(dfs(r, c))
    return len(sizes), sizes

grid = [
    "11000",
    "11010",
    "00100",
    "00011",
]
print(num_islands(grid))
`,
      python: {
        files: {
          "main.py": `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def dfs(r, c):
        stack = [(r, c)]                 # iterative to avoid recursion limits
        seen.add((r, c))
        size = 0
        while stack:
            cr, cc = stack.pop()
            size += 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = cr + dr, cc + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1" and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return size

    sizes = []
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                sizes.append(dfs(r, c))
    return len(sizes), sizes

grid = [
    "11000",
    "11010",
    "00100",
    "00011",
]
print(num_islands(grid))
`,
        },
      },
      result: "(4, [4, 1, 1, 2])",
      explanation: "Each unvisited land cell starts a new island, and DFS marks all land connected to it. Every cell is visited once and checks 4 neighbours: O(R * C) time and space. The grid is an implicit graph; no adjacency list is built.",
    },
    {
      title: "Topological Sort with Kahn's Algorithm",
      scenario: "LeetCode 207/210: order courses so every prerequisite comes first, and detect impossible (cyclic) plans.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import defaultdict, deque

def course_order(courses, prereqs):
    graph = defaultdict(list)
    indegree = {c: 0 for c in courses}
    for course, pre in prereqs:          # pre -> course
        graph[pre].append(course)
        indegree[course] += 1
    q = deque(c for c in courses if indegree[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in graph[c]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return order if len(order) == len(courses) else "cycle: impossible"

courses = ["Python", "OOP", "DSA", "SQL", "Django", "Interview"]
prereqs = [("OOP", "Python"), ("DSA", "Python"), ("Django", "OOP"),
           ("Django", "SQL"), ("Interview", "DSA"), ("Interview", "Django")]
print(course_order(courses, prereqs))
print(course_order(["A", "B", "C"], [("B", "A"), ("C", "B"), ("A", "C")]))
`,
      python: {
        files: {
          "main.py": `from collections import defaultdict, deque

def course_order(courses, prereqs):
    graph = defaultdict(list)
    indegree = {c: 0 for c in courses}
    for course, pre in prereqs:          # pre -> course
        graph[pre].append(course)
        indegree[course] += 1
    q = deque(c for c in courses if indegree[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in graph[c]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return order if len(order) == len(courses) else "cycle: impossible"

courses = ["Python", "OOP", "DSA", "SQL", "Django", "Interview"]
prereqs = [("OOP", "Python"), ("DSA", "Python"), ("Django", "OOP"),
           ("Django", "SQL"), ("Interview", "DSA"), ("Interview", "Django")]
print(course_order(courses, prereqs))
print(course_order(["A", "B", "C"], [("B", "A"), ("C", "B"), ("A", "C")]))
`,
        },
      },
      result: `['Python', 'SQL', 'OOP', 'DSA', 'Django', 'Interview']
cycle: impossible`,
      explanation: "Courses with no prerequisites start in the queue. Finishing a course reduces the in-degree of the courses that depend on it. If a cycle exists (A needs C, C needs B, B needs A), no course ever reaches in-degree 0, so the order is incomplete. O(V + E).",
    },
    {
      title: "Dijkstra's Algorithm with heapq",
      scenario: "Find the shortest travel time (in minutes) from a warehouse to every delivery area.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import heapq

def dijkstra(graph, source):
    dist = {node: float("inf") for node in graph}
    dist[source] = 0
    parent = {source: None}
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                      # stale entry
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (dist[v], v))
    return dist, parent

def path_to(parent, node):
    path = []
    while node is not None:
        path.append(node)
        node = parent[node]
    return " -> ".join(reversed(path))

city = {
    "Warehouse": [("A", 4), ("B", 1)],
    "A": [("C", 1)],
    "B": [("A", 2), ("C", 5)],
    "C": [("D", 3)],
    "D": [],
}
dist, parent = dijkstra(city, "Warehouse")
print(dist)
print(path_to(parent, "D"))
`,
      python: {
        files: {
          "main.py": `import heapq

def dijkstra(graph, source):
    dist = {node: float("inf") for node in graph}
    dist[source] = 0
    parent = {source: None}
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                      # stale entry
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (dist[v], v))
    return dist, parent

def path_to(parent, node):
    path = []
    while node is not None:
        path.append(node)
        node = parent[node]
    return " -> ".join(reversed(path))

city = {
    "Warehouse": [("A", 4), ("B", 1)],
    "A": [("C", 1)],
    "B": [("A", 2), ("C", 5)],
    "C": [("D", 3)],
    "D": [],
}
dist, parent = dijkstra(city, "Warehouse")
print(dist)
print(path_to(parent, "D"))
`,
        },
      },
      result: `{'Warehouse': 0, 'A': 3, 'B': 1, 'C': 4, 'D': 7}
Warehouse -> B -> A -> C -> D`,
      explanation: "The direct road to A costs 4, but going via B costs 1 + 2 = 3, so Dijkstra updates A and pushes it again; the old (4, A) entry is skipped as stale. Each edge relaxation may push to the heap: O((V + E) log V). Works only because all weights are non-negative.",
    },
  ],
  interview: [
    {
      q: "Adjacency list vs adjacency matrix: when do you use each?",
      a: "Adjacency list: O(V + E) space, iterate neighbours in O(degree); best for sparse graphs (most real graphs). Adjacency matrix: O(V^2) space, O(1) edge lookup; best for dense graphs or when V is small and you need fast edge checks.",
      level: "Easy",
    },
    {
      q: "What is the time complexity of BFS and DFS?",
      a: "O(V + E) with an adjacency list: every vertex is visited once and every edge examined once (twice for undirected). With an adjacency matrix it is O(V^2) because finding neighbours scans a whole row.",
      level: "Easy",
    },
    {
      q: "Why does BFS find the shortest path in an unweighted graph but DFS does not?",
      a: "BFS processes vertices in increasing order of distance (number of edges) from the source, so the first time it reaches a vertex is via a shortest path. DFS follows one branch deeply and may reach a vertex through a long path first.",
      level: "Medium",
    },
    {
      q: "Why mark a node as visited when enqueuing in BFS rather than when dequeuing?",
      a: "If you mark on dequeue, the same node can be enqueued multiple times by different neighbours before it is processed, wasting time and memory (and in some problems giving wrong counts). Marking on enqueue guarantees each node enters the queue once.",
      level: "Medium",
    },
    {
      q: "How do you detect a cycle in a directed graph?",
      a: "DFS with three states: 0 = unvisited, 1 = in the current recursion path, 2 = finished. If DFS reaches a neighbour in state 1, there is a back edge and therefore a cycle. Alternatively, run Kahn's algorithm: if the topological order has fewer than V vertices, there is a cycle. Both O(V + E).",
      level: "Medium",
    },
    {
      q: "How do you detect a cycle in an undirected graph?",
      a: "DFS/BFS tracking the parent: if you find a visited neighbour that is not the vertex you came from, there is a cycle. Union-Find also works: if an edge connects two vertices already in the same set, it creates a cycle.",
      level: "Medium",
    },
    {
      q: "What is topological sort and where is it used?",
      a: "A linear ordering of a DAG's vertices such that for every edge u -> v, u comes before v. Used for build systems and package installs (pip dependency resolution), course scheduling, task pipelines (Airflow DAGs), spreadsheet formula recalculation. Only possible if the graph has no cycles.",
      level: "Easy",
    },
    {
      q: "Why doesn't Dijkstra work with negative edge weights?",
      a: "Dijkstra assumes that once a vertex is popped with the smallest distance, that distance is final, because adding non-negative edges can only increase it. A negative edge discovered later could make a shorter path to an already-finalised vertex. Use Bellman-Ford (O(V * E)), which also detects negative cycles.",
      level: "Hard",
    },
    {
      q: "What is the complexity of Dijkstra with heapq and why do we skip stale entries?",
      a: "O((V + E) log V). heapq has no decrease-key, so we push a new (distance, vertex) entry whenever a distance improves. Old entries remain in the heap; when popped with a distance larger than dist[vertex], they are skipped. The heap can hold O(E) entries, and log E = O(log V).",
      level: "Hard",
    },
    {
      q: "How would you check if a graph is bipartite?",
      a: "Try to 2-colour it with BFS or DFS: colour the start 0, neighbours 1, their neighbours 0, and so on. If you ever find an edge connecting two vertices with the same colour, the graph is not bipartite. Run from every uncoloured vertex to handle disconnected graphs. O(V + E).",
      level: "Medium",
    },
    {
      q: "How do you solve 'Rotting Oranges' (LeetCode 994)?",
      a: "Multi-source BFS: push all rotten oranges into the queue at time 0, then process level by level, rotting adjacent fresh oranges and counting minutes. If fresh oranges remain at the end, return -1. O(R * C).",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Find if Path Exists in Graph (LeetCode 1971): n=6, edges=[[0,1],[0,2],[3,5],[5,4],[4,3]], source=0, destination=5 -> False.",
      hint: "BFS or DFS from source with a visited set.",
      solution: `from collections import defaultdict, deque

def valid_path(n, edges, source, destination):
    # Time O(V + E), Space O(V + E)
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    seen, q = {source}, deque([source])
    while q:
        node = q.popleft()
        if node == destination:
            return True
        for nb in graph[node]:
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    return False

print(valid_path(3, [[0, 1], [1, 2], [2, 0]], 0, 2))                    # True
print(valid_path(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5))    # False
`,
    },
    {
      task: "Number of Connected Components (LeetCode 323): n=5, edges=[[0,1],[1,2],[3,4]] -> 2.",
      hint: "Start a DFS from every unvisited node and count starts. (Union-Find also works.)",
      solution: `from collections import defaultdict

def count_components(n, edges):
    # Time O(V + E), Space O(V + E)
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    seen = set()
    count = 0
    for start in range(n):
        if start in seen:
            continue
        count += 1
        stack = [start]
        seen.add(start)
        while stack:
            node = stack.pop()
            for nb in graph[node]:
                if nb not in seen:
                    seen.add(nb)
                    stack.append(nb)
    return count

print(count_components(5, [[0, 1], [1, 2], [3, 4]]))  # 2
`,
    },
    {
      task: "Rotting Oranges (LeetCode 994): 2 = rotten, 1 = fresh, 0 = empty. Return minutes until no fresh orange remains, or -1.",
      hint: "Multi-source BFS starting from all rotten oranges.",
      solution: `from collections import deque

def oranges_rotting(grid):
    # Time O(R * C), Space O(R * C)
    rows, cols = len(grid), len(grid[0])
    q, fresh = deque(), 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1

print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))  # 4
print(oranges_rotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]))  # -1
`,
    },
    {
      task: "Course Schedule (LeetCode 207): numCourses=2, prerequisites=[[1,0],[0,1]] -> False.",
      hint: "Kahn's algorithm: can you process all courses?",
      solution: `from collections import defaultdict, deque

def can_finish(num_courses, prerequisites):
    # Time O(V + E), Space O(V + E)
    graph = defaultdict(list)
    indegree = [0] * num_courses
    for course, pre in prerequisites:
        graph[pre].append(course)
        indegree[course] += 1
    q = deque(i for i in range(num_courses) if indegree[i] == 0)
    done = 0
    while q:
        c = q.popleft()
        done += 1
        for nxt in graph[c]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return done == num_courses

print(can_finish(2, [[1, 0]]))          # True
print(can_finish(2, [[1, 0], [0, 1]]))  # False
`,
    },
    {
      task: "Network Delay Time (LeetCode 743): times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2 -> 2. Return the time for all nodes to receive a signal from k, or -1.",
      hint: "Dijkstra from k; answer is the maximum distance.",
      solution: `import heapq
from collections import defaultdict

def network_delay_time(times, n, k):
    # Time O((V + E) log V), Space O(V + E)
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist:
            continue
        dist[u] = d
        for v, w in graph[u]:
            if v not in dist:
                heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1

print(network_delay_time([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))  # 2
print(network_delay_time([[1, 2, 1]], 2, 2))                        # -1
`,
    },
  ],
  quiz: [
    {
      question: "Space complexity of an adjacency list for a graph with V vertices and E edges?",
      options: [
        "O(V)",
        "O(E)",
        "O(V + E)",
        "O(V^2)",
      ],
      answer: 2,
      explanation: "One entry per vertex plus one per edge (two for undirected).",
    },
    {
      question: "Which traversal finds the shortest path in an unweighted graph?",
      options: [
        "DFS",
        "BFS",
        "Inorder",
        "Topological sort",
      ],
      answer: 1,
      explanation: "BFS explores in order of distance from the source.",
    },
    {
      question: "Which data structure does Dijkstra's algorithm typically use?",
      options: [
        "Stack",
        "FIFO queue",
        "Min-heap (priority queue)",
        "Hash set only",
      ],
      answer: 2,
      explanation: "It repeatedly extracts the vertex with the smallest tentative distance.",
    },
    {
      question: "Topological sort is possible only for:",
      options: [
        "Undirected graphs",
        "Directed acyclic graphs",
        "Weighted graphs",
        "Complete graphs",
      ],
      answer: 1,
      explanation: "A cycle makes it impossible to put every u before v.",
    },
    {
      question: "In Kahn's algorithm, if the output has fewer vertices than the graph, then:",
      options: [
        "The graph is disconnected",
        "The graph has a cycle",
        "The graph is weighted",
        "The algorithm has a bug",
      ],
      answer: 1,
      explanation: "Vertices in a cycle never reach in-degree 0.",
    },
    {
      question: "Dijkstra's algorithm fails when the graph has:",
      options: [
        "Cycles",
        "Negative edge weights",
        "More than 1000 vertices",
        "Undirected edges",
      ],
      answer: 1,
      explanation: "It assumes a popped distance is final, which negative edges can violate.",
    },
  ],
};
