export default [
  {
    id: 'hp-last-stone-weight',
    title: 'Last Stone Weight',
    diff: 'Easy',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Infosys', 'Wipro'],
    statement: 'You have stones with weights `stones[i]`. Each turn, take the two heaviest stones x <= y and smash them: if x == y both are destroyed, otherwise only a stone of weight y - x remains. Repeat until at most one stone is left. Return its weight, or 0 if no stone remains.',
    examples: [
      { input: 'stones = [2, 7, 4, 1, 8, 1]', output: '1', explain: '8,7 -> 1; 4,2 -> 2; 2,1 -> 1; 1,1 -> 0; one stone of weight 1 is left.' },
      { input: 'stones = [10, 4, 2, 10]', output: '2' },
    ],
    constraints: ['1 <= stones.length <= 1000', '1 <= stones[i] <= 1000'],
    hints: ['You repeatedly need the two largest values.', 'A max-heap gives the largest value in O(log n).'],
    approach: 'Put all stones into a max-heap (in Python, push negated weights into heapq). While at least two stones remain, pop the two heaviest; if they differ, push their difference back. When the loop ends, the heap holds zero or one stone, so return its weight or 0. Each smash costs O(log n) and there are at most n smashes. Sorting the array again after every smash would cost O(n^2 log n).',
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'last_stone_weight', js: 'lastStoneWeight' },
    py: {
      starter: 'def last_stone_weight(stones):\n    # write your code here\n    pass\n',
      solution: `import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        y = -heapq.heappop(heap)
        x = -heapq.heappop(heap)
        if y != x:
            heapq.heappush(heap, -(y - x))
    return -heap[0] if heap else 0
`,
    },
    js: {
      starter: 'function lastStoneWeight(stones) {\n  // write your code here\n}\n',
      solution: `function lastStoneWeight(stones) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a > b);
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const y = heap.pop(), x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size() ? heap.peek() : 0;
}
`,
    },
    tests: [
      { args: [[2, 7, 4, 1, 8, 1]], expect: 1 },
      { args: [[1]], expect: 1 },
      { args: [[2, 2]], expect: 0 },
      { args: [[10, 4, 2, 10]], expect: 2 },
      { args: [[3, 7, 8]], expect: 2 },
      { args: [[5, 5, 5]], expect: 5 },
      { args: [[9, 3, 2, 10]], expect: 0 },
    ],
  },
  {
    id: 'hp-kth-largest-stream',
    title: 'Kth Largest Element in a Stream',
    diff: 'Easy',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Microsoft', 'TCS Digital'],
    statement: 'You start with the numbers `nums` and then receive the numbers in `adds` one at a time. After each new number arrives, record the `k`-th largest number seen so far (counting duplicates). Return the list of recorded values. It is guaranteed that at least `k` numbers are present whenever a value is recorded.',
    examples: [
      { input: 'k = 3, nums = [4, 5, 8, 2], adds = [3, 5, 10, 9, 4]', output: '[4, 5, 5, 8, 8]' },
      { input: 'k = 1, nums = [], adds = [-3, -2, -4, 0, 4]', output: '[-3, -2, -2, 0, 4]' },
    ],
    constraints: ['1 <= k <= 10^4', '0 <= nums.length <= 10^4', '1 <= adds.length <= 10^4', '-10^4 <= values <= 10^4'],
    hints: ['You only care about the k largest numbers.', 'Keep a min-heap of size k; its top is the k-th largest.'],
    approach: 'Keep a min-heap that holds the k largest numbers seen so far. Push every number; whenever the heap grows beyond k, pop its smallest element, because that number can never be the k-th largest again. After each add, the top of the heap is the smallest of the k largest numbers, which is exactly the k-th largest. Each operation costs O(log k). Sorting all numbers after every addition would cost O(n log n) per add.',
    complexity: 'Time O((n + m) log k), Space O(k)',
    fn: { py: 'kth_largest_stream', js: 'kthLargestStream' },
    py: {
      starter: 'def kth_largest_stream(k, nums, adds):\n    # write your code here\n    pass\n',
      solution: `import heapq

def kth_largest_stream(k, nums, adds):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    out = []
    for x in adds:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
        out.append(heap[0])
    return out
`,
    },
    js: {
      starter: 'function kthLargestStream(k, nums, adds) {\n  // write your code here\n}\n',
      solution: `function kthLargestStream(k, nums, adds) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a < b);
  const add = (x) => {
    heap.push(x);
    if (heap.size() > k) heap.pop();
  };
  nums.forEach(add);
  const out = [];
  for (const x of adds) {
    add(x);
    out.push(heap.peek());
  }
  return out;
}
`,
    },
    tests: [
      { args: [3, [4, 5, 8, 2], [3, 5, 10, 9, 4]], expect: [4, 5, 5, 8, 8] },
      { args: [1, [], [-3, -2, -4, 0, 4]], expect: [-3, -2, -2, 0, 4] },
      { args: [2, [0], [-1, 1, -2, -4, 3]], expect: [-1, 0, 0, 0, 1] },
      { args: [1, [5], [1]], expect: [5] },
      { args: [2, [1, 2, 3], [0]], expect: [2] },
      { args: [3, [5, 5], [5, 1]], expect: [5, 5] },
    ],
  },
  {
    id: 'hp-kth-largest-element',
    title: 'Kth Largest Element in an Array',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Infosys SP'],
    statement: 'Given an integer array `nums` and an integer `k`, return the `k`-th largest element in sorted order (duplicates count separately, so in `[3, 3, 1]` the 2nd largest is 3).',
    examples: [
      { input: 'nums = [3, 2, 1, 5, 6, 4], k = 2', output: '5' },
      { input: 'nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4', output: '4' },
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Sorting works in O(n log n). Can you do better when k is small?', 'Keep a min-heap of the k largest numbers seen so far.'],
    approach: 'Scan the array while maintaining a min-heap of size at most k. Push each number, and if the heap now has more than k elements, pop the smallest. At every moment the heap contains the k largest numbers seen so far, with the smallest of them on top. After the scan, the top is the k-th largest overall. This costs O(n log k), which beats a full sort when k is small. Quickselect achieves average O(n) but has an O(n^2) worst case.',
    complexity: 'Time O(n log k), Space O(k)',
    fn: { py: 'find_kth_largest', js: 'findKthLargest' },
    py: {
      starter: 'def find_kth_largest(nums, k):\n    # write your code here\n    pass\n',
      solution: `import heapq

def find_kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
`,
    },
    js: {
      starter: 'function findKthLargest(nums, k) {\n  // write your code here\n}\n',
      solution: `function findKthLargest(nums, k) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a < b);
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek();
}
`,
    },
    tests: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expect: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expect: 4 },
      { args: [[1], 1], expect: 1 },
      { args: [[7, 7, 7], 2], expect: 7 },
      { args: [[-1, -5, 3], 3], expect: -5 },
      { args: [[9, 8, 7, 6, 5], 5], expect: 5 },
    ],
  },
  {
    id: 'hp-top-k-frequent',
    title: 'Top K Frequent Elements',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Google', 'Meta', 'Flipkart'],
    statement: 'Given an integer array `nums` and an integer `k`, return the `k` numbers that occur most often. Order the answer by frequency, highest first; when two numbers have the same frequency, the smaller number comes first.',
    examples: [
      { input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' },
      { input: 'nums = [3, 3, 1, 1, 2, 2, 2], k = 2', output: '[2, 1]', explain: '2 appears three times; 1 and 3 tie with two, and 1 is smaller.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= number of distinct values'],
    hints: ['Count frequencies with a hash map first.', 'Keep a heap of size k whose top is the "weakest" candidate (lowest count, or larger value on ties).'],
    approach: 'Count how often each number appears with a hash map. Then go through the distinct numbers keeping a min-heap of size k, where the top is the weakest candidate: the lowest frequency, and on equal frequency the larger value. Push each number and pop the top whenever the heap exceeds k. The heap then holds exactly the k strongest numbers; sort those k by (frequency descending, value ascending) for the output. This is O(n + d log k) for d distinct values. Sorting all distinct values costs O(d log d).',
    complexity: 'Time O(n + d log k), Space O(n)',
    fn: { py: 'top_k_frequent', js: 'topKFrequent' },
    py: {
      starter: 'def top_k_frequent(nums, k):\n    # write your code here\n    pass\n',
      solution: `import heapq
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    heap = []
    for val, c in count.items():
        heapq.heappush(heap, (c, -val))
        if len(heap) > k:
            heapq.heappop(heap)
    heap.sort(key=lambda t: (-t[0], -t[1]))
    return [-v for _, v in heap]
`,
    },
    js: {
      starter: 'function topKFrequent(nums, k) {\n  // write your code here\n}\n',
      solution: `function topKFrequent(nums, k) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const weaker = (a, b) => a[1] < b[1] || (a[1] === b[1] && a[0] > b[0]);
  const heap = makeHeap(weaker);
  for (const entry of count) {
    heap.push(entry);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (heap.size()) out.push(heap.pop()[0]);
  return out.reverse();
}
`,
    },
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expect: [1, 2] },
      { args: [[1], 1], expect: [1] },
      { args: [[4, 4, 5, 5, 6], 2], expect: [4, 5] },
      { args: [[3, 3, 1, 1, 2, 2, 2], 2], expect: [2, 1] },
      { args: [[5, -1, -1, 5, 7], 3], expect: [-1, 5, 7] },
      { args: [[1, 2, 3, 4], 2], expect: [1, 2] },
    ],
  },
  {
    id: 'hp-k-closest-points',
    title: 'K Closest Points to the Origin',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Meta', 'Uber', 'Microsoft'],
    statement: 'Given a list of points `[x, y]` on a plane and an integer `k`, return the `k` points closest to the origin (Euclidean distance). Return them sorted by distance; break ties by smaller `x`, then by smaller `y`.',
    examples: [
      { input: 'points = [[3,3],[5,-1],[-2,4]], k = 2', output: '[[3, 3], [-2, 4]]', explain: 'Squared distances are 18, 26 and 20.' },
      { input: 'points = [[0,1],[1,0]], k = 2', output: '[[0, 1], [1, 0]]' },
    ],
    constraints: ['1 <= k <= points.length <= 10^4', '-10^4 <= x, y <= 10^4'],
    hints: ['Compare squared distances; no square roots needed.', 'Keep a MAX-heap of size k so the farthest candidate can be dropped quickly.'],
    approach: 'Use squared distance x^2 + y^2 as the key, which keeps everything in integers. Maintain a max-heap of at most k points keyed by (distance, x, y): push every point and, if the heap holds more than k, remove the largest key. The k points left are the closest, using the same tie-breaking as the output. Finally sort those k points by (distance, x, y). This costs O(n log k). Sorting all n points is O(n log n), which is slower when k is small.',
    complexity: 'Time O(n log k + k log k), Space O(k)',
    fn: { py: 'k_closest', js: 'kClosest' },
    py: {
      starter: 'def k_closest(points, k):\n    # write your code here\n    pass\n',
      solution: `import heapq

def k_closest(points, k):
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), -x, -y))
        if len(heap) > k:
            heapq.heappop(heap)
    best = sorted((-d, -x, -y) for d, x, y in heap)
    return [[x, y] for _, x, y in best]
`,
    },
    js: {
      starter: 'function kClosest(points, k) {\n  // write your code here\n}\n',
      solution: `function kClosest(points, k) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const heap = makeHeap((a, b) => cmp(a, b) > 0);
  for (const [x, y] of points) {
    heap.push([x * x + y * y, x, y]);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (heap.size()) out.push(heap.pop());
  return out.reverse().map(([, x, y]) => [x, y]);
}
`,
    },
    tests: [
      { args: [[[1, 3], [-2, 2]], 1], expect: [[-2, 2]] },
      { args: [[[3, 3], [5, -1], [-2, 4]], 2], expect: [[3, 3], [-2, 4]] },
      { args: [[[0, 1], [1, 0]], 2], expect: [[0, 1], [1, 0]] },
      { args: [[[1, 1]], 1], expect: [[1, 1]] },
      { args: [[[2, 2], [-2, -2], [1, 0]], 2], expect: [[1, 0], [-2, -2]] },
      { args: [[[5, 5], [0, 0], [1, -1], [-1, 1]], 3], expect: [[0, 0], [-1, 1], [1, -1]] },
    ],
  },
  {
    id: 'hp-sort-k-sorted',
    title: 'Sort a Nearly Sorted (K-Sorted) Array',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Microsoft', 'TCS Digital'],
    statement: 'Every element of `nums` is at most `k` positions away from where it would be in sorted order. Return the array sorted in ascending order, using the `k` property to beat a normal sort.',
    examples: [
      { input: 'nums = [6, 5, 3, 2, 8, 10, 9], k = 3', output: '[2, 3, 5, 6, 8, 9, 10]' },
      { input: 'nums = [2, 1, 4, 3, 6, 5], k = 1', output: '[1, 2, 3, 4, 5, 6]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '0 <= k < nums.length'],
    hints: ['The smallest element must be among the first k + 1 elements.', 'Slide a min-heap of size k + 1 over the array.'],
    approach: 'The element that belongs at position i must currently sit within positions i..i+k, so it is always inside a window of k + 1 elements. Push elements into a min-heap; as soon as it holds k + 1 elements, pop the minimum and append it to the output, because nothing later can be smaller. When the input runs out, pop the remaining elements in order. Each push and pop costs O(log k), giving O(n log k). A regular sort ignores the k property and costs O(n log n).',
    complexity: 'Time O(n log k), Space O(k)',
    fn: { py: 'sort_k_sorted', js: 'sortKSorted' },
    py: {
      starter: 'def sort_k_sorted(nums, k):\n    # write your code here\n    pass\n',
      solution: `import heapq

def sort_k_sorted(nums, k):
    heap, out = [], []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            out.append(heapq.heappop(heap))
    while heap:
        out.append(heapq.heappop(heap))
    return out
`,
    },
    js: {
      starter: 'function sortKSorted(nums, k) {\n  // write your code here\n}\n',
      solution: `function sortKSorted(nums, k) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a < b);
  const out = [];
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) out.push(heap.pop());
  }
  while (heap.size()) out.push(heap.pop());
  return out;
}
`,
    },
    tests: [
      { args: [[6, 5, 3, 2, 8, 10, 9], 3], expect: [2, 3, 5, 6, 8, 9, 10] },
      { args: [[10, 9, 8, 7, 4, 70, 60, 50], 4], expect: [4, 7, 8, 9, 10, 50, 60, 70] },
      { args: [[1], 0], expect: [1] },
      { args: [[2, 1, 4, 3, 6, 5], 1], expect: [1, 2, 3, 4, 5, 6] },
      { args: [[1, 2, 3], 2], expect: [1, 2, 3] },
      { args: [[3, 1, 2], 2], expect: [1, 2, 3] },
    ],
  },
  {
    id: 'hp-merge-k-sorted-arrays',
    title: 'Merge K Sorted Arrays',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Google', 'Microsoft', 'Walmart'],
    statement: 'You are given `lists`, a list of arrays that are each sorted in ascending order (some may be empty). Merge them into one sorted array and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1, 1, 2, 3, 4, 4, 5, 6]' },
      { input: 'lists = [[5,10],[1,2,3],[]]', output: '[1, 2, 3, 5, 10]' },
    ],
    constraints: ['0 <= lists.length <= 10^4', '0 <= total elements <= 10^5'],
    hints: ['The next output element is the smallest among the current heads of all arrays.', 'Keep one (value, list index, element index) entry per array in a min-heap.'],
    approach: 'Push the first element of every non-empty array into a min-heap as (value, array index, position). Repeatedly pop the smallest entry, append its value to the result, and push the next element from the same array if there is one. The heap never holds more than k entries, so each step costs O(log k), and there are N steps in total for N elements. Concatenating everything and sorting costs O(N log N); merging the arrays one by one costs O(N * k).',
    complexity: 'Time O(N log k), Space O(k) besides the output',
    fn: { py: 'merge_k_sorted', js: 'mergeKSorted' },
    py: {
      starter: 'def merge_k_sorted(lists):\n    # write your code here\n    pass\n',
      solution: `import heapq

def merge_k_sorted(lists):
    heap = [(arr[0], i, 0) for i, arr in enumerate(lists) if arr]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out
`,
    },
    js: {
      starter: 'function mergeKSorted(lists) {\n  // write your code here\n}\n',
      solution: `function mergeKSorted(lists) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  lists.forEach((arr, i) => { if (arr.length) heap.push([arr[0], i, 0]); });
  const out = [];
  while (heap.size()) {
    const [val, i, j] = heap.pop();
    out.push(val);
    if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}
`,
    },
    tests: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expect: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expect: [] },
      { args: [[[]]], expect: [] },
      { args: [[[1], [0]]], expect: [0, 1] },
      { args: [[[5, 10], [1, 2, 3], []]], expect: [1, 2, 3, 5, 10] },
      { args: [[[-3, -1], [-2], [0, 0]]], expect: [-3, -2, -1, 0, 0] },
    ],
  },
  {
    id: 'hp-connect-ropes',
    title: 'Minimum Cost to Connect Ropes',
    diff: 'Medium',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Flipkart', 'Infosys SP', 'TCS Digital'],
    statement: 'You have ropes of lengths `ropes[i]`. Joining two ropes of lengths a and b costs a + b and produces one rope of length a + b. Return the minimum total cost to join all ropes into one. A single rope costs 0.',
    examples: [
      { input: 'ropes = [4, 3, 2, 6]', output: '29', explain: '2+3 = 5, 4+5 = 9, 6+9 = 15; total 5 + 9 + 15 = 29.' },
      { input: 'ropes = [5]', output: '0' },
    ],
    constraints: ['1 <= ropes.length <= 10^4', '1 <= ropes[i] <= 1000'],
    hints: ['Long ropes created early get paid for again in every later join.', 'Always join the two shortest ropes (greedy, like Huffman coding).'],
    approach: 'Every rope length is paid once for each join it takes part in, so short ropes should be joined first and long ones as late as possible. Put all lengths in a min-heap. While more than one rope remains, pop the two shortest, add their sum to the cost, and push the sum back as a new rope. When one rope remains, the accumulated cost is the minimum. This greedy choice is the same idea as building a Huffman tree. Re-sorting the whole list after every join would be O(n^2 log n).',
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'connect_ropes', js: 'connectRopes' },
    py: {
      starter: 'def connect_ropes(ropes):\n    # write your code here\n    pass\n',
      solution: `import heapq

def connect_ropes(ropes):
    heap = list(ropes)
    heapq.heapify(heap)
    cost = 0
    while len(heap) > 1:
        s = heapq.heappop(heap) + heapq.heappop(heap)
        cost += s
        heapq.heappush(heap, s)
    return cost
`,
    },
    js: {
      starter: 'function connectRopes(ropes) {\n  // write your code here\n}\n',
      solution: `function connectRopes(ropes) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const heap = makeHeap((a, b) => a < b);
  for (const r of ropes) heap.push(r);
  let cost = 0;
  while (heap.size() > 1) {
    const s = heap.pop() + heap.pop();
    cost += s;
    heap.push(s);
  }
  return cost;
}
`,
    },
    tests: [
      { args: [[4, 3, 2, 6]], expect: 29 },
      { args: [[1, 2, 3, 4, 5]], expect: 33 },
      { args: [[5]], expect: 0 },
      { args: [[1, 1]], expect: 2 },
      { args: [[2, 2, 3, 3]], expect: 20 },
      { args: [[8, 4, 6, 12]], expect: 58 },
    ],
  },
  {
    id: 'hp-running-median',
    title: 'Median of a Data Stream',
    diff: 'Hard',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs'],
    statement: 'Numbers arrive one by one from `nums`. After each number arrives, record the median of all numbers seen so far: the middle value for an odd count, or the average of the two middle values for an even count (this may be a .5 value such as 7.5). Return the list of medians.',
    examples: [
      { input: 'nums = [5, 15, 1, 3]', output: '[5, 10, 5, 4]' },
      { input: 'nums = [1, 2, 3, 4]', output: '[1, 1.5, 2, 2.5]' },
    ],
    constraints: ['1 <= nums.length <= 5 * 10^4', '-10^5 <= nums[i] <= 10^5'],
    hints: ['Split the numbers into a lower half and an upper half.', 'Use a max-heap for the lower half and a min-heap for the upper half, and keep their sizes balanced.'],
    approach: 'Keep the smaller half of the numbers in a max-heap (low) and the larger half in a min-heap (high), with low allowed to hold at most one extra element. To add x, push it into low, then move low\'s maximum into high so every element of low stays <= every element of high. If high is now bigger than low, move its minimum back to low. The median is the top of low when the count is odd, or the average of both tops when it is even. Each insertion is O(log n). Re-sorting after every insertion would be O(n log n) per number.',
    complexity: 'Time O(n log n) overall, O(1) per median query, Space O(n)',
    fn: { py: 'running_median', js: 'runningMedian' },
    py: {
      starter: 'def running_median(nums):\n    # write your code here\n    pass\n',
      solution: `import heapq

def running_median(nums):
    low, high, out = [], [], []
    for x in nums:
        heapq.heappush(low, -x)
        heapq.heappush(high, -heapq.heappop(low))
        if len(high) > len(low):
            heapq.heappush(low, -heapq.heappop(high))
        if len(low) > len(high):
            out.append(-low[0])
        else:
            m = (-low[0] + high[0]) / 2
            out.append(int(m) if m == int(m) else m)
    return out
`,
    },
    js: {
      starter: 'function runningMedian(nums) {\n  // write your code here\n}\n',
      solution: `function runningMedian(nums) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const low = makeHeap((a, b) => a > b);
  const high = makeHeap((a, b) => a < b);
  const out = [];
  for (const x of nums) {
    low.push(x);
    high.push(low.pop());
    if (high.size() > low.size()) low.push(high.pop());
    out.push(low.size() > high.size() ? low.peek() : (low.peek() + high.peek()) / 2);
  }
  return out;
}
`,
    },
    tests: [
      { args: [[5, 15, 1, 3]], expect: [5, 10, 5, 4] },
      { args: [[1, 2, 3, 4]], expect: [1, 1.5, 2, 2.5] },
      { args: [[7]], expect: [7] },
      { args: [[2, 2, 2]], expect: [2, 2, 2] },
      { args: [[5, 10, -1, 20, 3]], expect: [5, 7.5, 5, 7.5, 5] },
      { args: [[10, 9, 8, 7, 6]], expect: [10, 9.5, 9, 8.5, 8] },
    ],
  },
  {
    id: 'hp-ipo-max-capital',
    title: 'IPO: Maximise Capital',
    diff: 'Hard',
    pattern: 'Heap & Priority Queue',
    companies: ['Amazon', 'Google', 'Goldman Sachs'],
    statement: 'You start with capital `w` and may finish at most `k` distinct projects, one after another. Project `i` needs at least `capital[i]` to start and adds a pure profit of `profits[i]` to your capital when done (the required capital is not spent). Return the maximum capital you can have at the end.',
    examples: [
      { input: 'k = 2, w = 0, profits = [1, 2, 3], capital = [0, 1, 1]', output: '4', explain: 'Do project 0 (capital 1), then project 2 (capital 4).' },
      { input: 'k = 1, w = 0, profits = [1, 2, 3], capital = [1, 1, 2]', output: '0', explain: 'Nothing is affordable.' },
    ],
    constraints: ['1 <= k <= 10^5', '0 <= w <= 10^9', '1 <= profits.length == capital.length <= 10^5'],
    hints: ['At any moment, among the projects you can afford, taking the most profitable is never worse.', 'Sort projects by required capital; unlock them into a max-heap of profits as your capital grows.'],
    approach: 'Sort the projects by required capital. Keep a pointer into this list and a max-heap of profits of the projects you can currently afford. For each of the k rounds, move every project whose requirement is at most w from the list into the heap, then pop the largest profit and add it to w. If the heap is empty, no project is affordable and capital can no longer grow, so stop. Choosing the most profitable affordable project is safe because profits only increase capital, which can only unlock more projects. Scanning all projects in every round would be O(k * n).',
    complexity: 'Time O(n log n + k log n), Space O(n)',
    fn: { py: 'find_maximized_capital', js: 'findMaximizedCapital' },
    py: {
      starter: 'def find_maximized_capital(k, w, profits, capital):\n    # write your code here\n    pass\n',
      solution: `import heapq

def find_maximized_capital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    heap, i = [], 0
    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(heap, -projects[i][1])
            i += 1
        if not heap:
            break
        w -= heapq.heappop(heap)
    return w
`,
    },
    js: {
      starter: 'function findMaximizedCapital(k, w, profits, capital) {\n  // write your code here\n}\n',
      solution: `function findMaximizedCapital(k, w, profits, capital) {
  const makeHeap = (less) => {
    const a = [];
    return {
      size: () => a.length,
      peek: () => a[0],
      push(x) {
        a.push(x);
        let i = a.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (!less(a[i], a[p])) break;
          [a[i], a[p]] = [a[p], a[i]];
          i = p;
        }
      },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last;
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i;
            if (l < a.length && less(a[l], a[m])) m = l;
            if (r < a.length && less(a[r], a[m])) m = r;
            if (m === i) break;
            [a[i], a[m]] = [a[m], a[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const projects = capital.map((c, i) => [c, profits[i]]).sort((a, b) => a[0] - b[0]);
  const heap = makeHeap((a, b) => a > b);
  let i = 0;
  for (let r = 0; r < k; r++) {
    while (i < projects.length && projects[i][0] <= w) heap.push(projects[i++][1]);
    if (!heap.size()) break;
    w += heap.pop();
  }
  return w;
}
`,
    },
    tests: [
      { args: [2, 0, [1, 2, 3], [0, 1, 1]], expect: 4 },
      { args: [3, 0, [1, 2, 3], [0, 1, 2]], expect: 6 },
      { args: [1, 0, [1, 2, 3], [1, 1, 2]], expect: 0 },
      { args: [2, 1, [1, 2, 3], [1, 1, 2]], expect: 6 },
      { args: [10, 0, [1], [0]], expect: 1 },
      { args: [1, 5, [3, 10], [6, 5]], expect: 15 },
    ],
  },
  {
    id: 'bt-single-number',
    title: 'Single Number',
    diff: 'Easy',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'TCS', 'Infosys', 'Wipro'],
    statement: 'In the array `nums`, every value appears exactly twice except one value that appears once. Return that value. Use constant extra space.',
    examples: [
      { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
      { input: 'nums = [-1, -1, -2]', output: '-2' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4'],
    hints: ['What is x XOR x? What is x XOR 0?', 'XOR all numbers together.'],
    approach: 'XOR has three useful properties: x ^ x = 0, x ^ 0 = x, and the order of operations does not matter. If you XOR every number in the array, each pair cancels itself out to 0, leaving only the number that appears once. This needs one pass and a single variable. A hash map of counts also works but uses O(n) extra space, and sorting first costs O(n log n).',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'single_number', js: 'singleNumber' },
    py: {
      starter: 'def single_number(nums):\n    # write your code here\n    pass\n',
      solution: `def single_number(nums):
    x = 0
    for v in nums:
        x ^= v
    return x
`,
    },
    js: {
      starter: 'function singleNumber(nums) {\n  // write your code here\n}\n',
      solution: `function singleNumber(nums) {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}
`,
    },
    tests: [
      { args: [[2, 2, 1]], expect: 1 },
      { args: [[4, 1, 2, 1, 2]], expect: 4 },
      { args: [[1]], expect: 1 },
      { args: [[-1, -1, -2]], expect: -2 },
      { args: [[0, 7, 7]], expect: 0 },
      { args: [[9, 3, 9, 5, 3]], expect: 5 },
    ],
  },
  {
    id: 'bt-count-set-bits',
    title: 'Count Set Bits (Hamming Weight)',
    diff: 'Easy',
    pattern: 'Bit Manipulation',
    companies: ['Microsoft', 'Apple', 'TCS', 'Cognizant'],
    statement: 'Given a non-negative integer `n`, return how many `1` bits its binary representation has.',
    examples: [
      { input: 'n = 11', output: '3', explain: '11 is 1011 in binary.' },
      { input: 'n = 128', output: '1', explain: '10000000' },
    ],
    constraints: ['0 <= n <= 2^31 - 1'],
    hints: ['You could check each of the 31 bits.', 'n & (n - 1) clears the lowest set bit. How many times can you do that?'],
    approach: "Subtracting 1 from n flips its lowest set bit to 0 and all the zeros below it to 1, so n & (n - 1) removes exactly the lowest set bit. Repeat this until n becomes 0 and count the steps; the count equals the number of 1 bits. This is Brian Kernighan's trick, and it loops only once per set bit. Checking every bit position with a shift loops 31 times regardless of the value.",
    complexity: 'Time O(number of set bits), Space O(1)',
    fn: { py: 'hamming_weight', js: 'hammingWeight' },
    py: {
      starter: 'def hamming_weight(n):\n    # write your code here\n    pass\n',
      solution: `def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count
`,
    },
    js: {
      starter: 'function hammingWeight(n) {\n  // write your code here\n}\n',
      solution: `function hammingWeight(n) {
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}
`,
    },
    tests: [
      { args: [11], expect: 3 },
      { args: [128], expect: 1 },
      { args: [0], expect: 0 },
      { args: [2147483645], expect: 30 },
      { args: [7], expect: 3 },
      { args: [255], expect: 8 },
      { args: [1], expect: 1 },
    ],
  },
  {
    id: 'bt-power-of-two',
    title: 'Power of Two',
    diff: 'Easy',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'Infosys', 'Accenture'],
    statement: 'Given an integer `n`, return `true` if it is a power of two (1, 2, 4, 8, ...), otherwise `false`.',
    examples: [
      { input: 'n = 16', output: 'true' },
      { input: 'n = 6', output: 'false' },
    ],
    constraints: ['-2^31 <= n <= 2^31 - 1'],
    hints: ['A power of two has exactly one 1 bit.', 'For positive n, n & (n - 1) removes the only set bit.'],
    approach: 'In binary, a power of two looks like 1 followed by zeros, so it has exactly one set bit. For a positive n, n & (n - 1) clears the lowest set bit; the result is 0 only if that was the only set bit. Zero and negative numbers are never powers of two, so check n > 0 first. Repeatedly dividing by 2 also works but takes O(log n) steps.',
    complexity: 'Time O(1), Space O(1)',
    fn: { py: 'is_power_of_two', js: 'isPowerOfTwo' },
    py: {
      starter: 'def is_power_of_two(n):\n    # write your code here\n    pass\n',
      solution: `def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0
`,
    },
    js: {
      starter: 'function isPowerOfTwo(n) {\n  // write your code here\n}\n',
      solution: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
`,
    },
    tests: [
      { args: [1], expect: true },
      { args: [16], expect: true },
      { args: [3], expect: false },
      { args: [0], expect: false },
      { args: [-8], expect: false },
      { args: [1073741824], expect: true },
      { args: [6], expect: false },
    ],
  },
  {
    id: 'bt-missing-number',
    title: 'Missing Number',
    diff: 'Easy',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Capgemini'],
    statement: 'The array `nums` holds `n` distinct numbers taken from the range `0` to `n`, so exactly one number of that range is missing. Return the missing number using constant extra space.',
    examples: [
      { input: 'nums = [3, 0, 1]', output: '2' },
      { input: 'nums = [0, 1]', output: '2' },
    ],
    constraints: ['1 <= n <= 10^4', 'All numbers are distinct and in [0, n].'],
    hints: ['XOR all indices 0..n together with all the values.', 'Every present number cancels with its index; only the missing one is left.'],
    approach: 'Start with x = n, then for every index i XOR in both i and nums[i]. Across the whole loop you have XORed every number from 0 to n once, plus every array value once. Each number that is present appears twice and cancels to 0, so x ends up as the missing number. The sum formula n(n+1)/2 minus the array sum also works in O(1) space. Sorting first would cost O(n log n), and a boolean array would cost O(n) space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'missing_number', js: 'missingNumber' },
    py: {
      starter: 'def missing_number(nums):\n    # write your code here\n    pass\n',
      solution: `def missing_number(nums):
    x = len(nums)
    for i, v in enumerate(nums):
        x ^= i ^ v
    return x
`,
    },
    js: {
      starter: 'function missingNumber(nums) {\n  // write your code here\n}\n',
      solution: `function missingNumber(nums) {
  let x = nums.length;
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}
`,
    },
    tests: [
      { args: [[3, 0, 1]], expect: 2 },
      { args: [[0, 1]], expect: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expect: 8 },
      { args: [[0]], expect: 1 },
      { args: [[1]], expect: 0 },
      { args: [[1, 2]], expect: 0 },
    ],
  },
  {
    id: 'bt-counting-bits',
    title: 'Counting Bits for 0..n',
    diff: 'Easy',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'Adobe', 'Infosys SP'],
    statement: 'Given a non-negative integer `n`, return a list `ans` of length `n + 1` where `ans[i]` is the number of `1` bits in the binary form of `i`.',
    examples: [
      { input: 'n = 2', output: '[0, 1, 1]' },
      { input: 'n = 5', output: '[0, 1, 1, 2, 1, 2]' },
    ],
    constraints: ['0 <= n <= 10^5', 'Aim for one pass without counting each number bit by bit.'],
    hints: ['Shifting i right by one drops its last bit.', 'ans[i] = ans[i >> 1] + (i & 1).'],
    approach: 'The number i >> 1 is i without its last bit, and it is smaller than i, so its answer is already known. The count for i is therefore ans[i >> 1] plus 1 if the last bit of i is set (i & 1). Filling the list from 0 to n uses this rule in O(1) per number. Counting bits of each number separately costs O(log i) per number, O(n log n) in total.',
    complexity: 'Time O(n), Space O(n) for the output',
    fn: { py: 'count_bits', js: 'countBits' },
    py: {
      starter: 'def count_bits(n):\n    # write your code here\n    pass\n',
      solution: `def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans
`,
    },
    js: {
      starter: 'function countBits(n) {\n  // write your code here\n}\n',
      solution: `function countBits(n) {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
  return ans;
}
`,
    },
    tests: [
      { args: [2], expect: [0, 1, 1] },
      { args: [5], expect: [0, 1, 1, 2, 1, 2] },
      { args: [0], expect: [0] },
      { args: [1], expect: [0, 1] },
      { args: [8], expect: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
      { args: [3], expect: [0, 1, 1, 2] },
    ],
  },
  {
    id: 'bt-single-number-thrice',
    title: 'Single Number Among Triples',
    diff: 'Medium',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'Google', 'TCS Digital'],
    statement: 'In the array `nums`, every value appears exactly **three** times except one value that appears exactly once. Return that value in linear time and constant extra space.',
    examples: [
      { input: 'nums = [2, 2, 3, 2]', output: '3' },
      { input: 'nums = [0, 1, 0, 1, 0, 1, 99]', output: '99' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: ['Look at one bit position: the count of numbers with that bit set, modulo 3, is the bit of the answer.', 'Track the counts mod 3 for all bits at once with two masks, ones and twos.'],
    approach: 'For any bit position, the numbers appearing three times contribute a multiple of 3 to the count of set bits, so the count modulo 3 is the answer\'s bit. Two bitmasks track that count for every bit at once: ones holds bits seen 1 time (mod 3) and twos holds bits seen 2 times. For each x, update ones = (ones ^ x) & ~twos and then twos = (twos ^ x) & ~ones; a bit seen a third time is cleared from both. After the loop, ones is the single number. Counting each of the 32 bit positions separately also works in O(32n); a hash map needs O(n) space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'single_number_thrice', js: 'singleNumberThrice' },
    py: {
      starter: 'def single_number_thrice(nums):\n    # write your code here\n    pass\n',
      solution: `def single_number_thrice(nums):
    ones = twos = 0
    for x in nums:
        ones = (ones ^ x) & ~twos
        twos = (twos ^ x) & ~ones
    return ones
`,
    },
    js: {
      starter: 'function singleNumberThrice(nums) {\n  // write your code here\n}\n',
      solution: `function singleNumberThrice(nums) {
  let ones = 0, twos = 0;
  for (const x of nums) {
    ones = (ones ^ x) & ~twos;
    twos = (twos ^ x) & ~ones;
  }
  return ones;
}
`,
    },
    tests: [
      { args: [[2, 2, 3, 2]], expect: 3 },
      { args: [[0, 1, 0, 1, 0, 1, 99]], expect: 99 },
      { args: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], expect: -4 },
      { args: [[5]], expect: 5 },
      { args: [[7, 7, 7, 8]], expect: 8 },
      { args: [[-1, 3, 3, 3]], expect: -1 },
    ],
  },
  {
    id: 'bt-two-single-numbers',
    title: 'Two Non-Repeating Numbers',
    diff: 'Medium',
    pattern: 'Bit Manipulation',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Infosys SP'],
    statement: 'In the array `nums`, exactly two values appear once and every other value appears exactly twice. Return the two single values as a list sorted in ascending order, using constant extra space.',
    examples: [
      { input: 'nums = [1, 2, 1, 3, 2, 5]', output: '[3, 5]' },
      { input: 'nums = [-1, 0]', output: '[-1, 0]' },
    ],
    constraints: ['2 <= nums.length <= 3 * 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: ['XOR of everything gives a ^ b, which is non-zero since a != b.', 'Pick any set bit of a ^ b; it splits the numbers into two groups, each holding one of the answers.'],
    approach: 'XOR all numbers: the pairs cancel and you get x = a ^ b, where a and b are the two singles. Because a != b, x has at least one set bit; isolate the lowest one with x & -x. That bit is set in exactly one of a and b, so split all numbers by whether they have this bit and XOR each group separately. Pairs always land in the same group and cancel, leaving a in one group and b in the other. Return them in ascending order. A hash map of counts would need O(n) space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'two_single_numbers', js: 'twoSingleNumbers' },
    py: {
      starter: 'def two_single_numbers(nums):\n    # write your code here\n    pass\n',
      solution: `def two_single_numbers(nums):
    x = 0
    for v in nums:
        x ^= v
    low = x & -x
    a = b = 0
    for v in nums:
        if v & low:
            a ^= v
        else:
            b ^= v
    return sorted([a, b])
`,
    },
    js: {
      starter: 'function twoSingleNumbers(nums) {\n  // write your code here\n}\n',
      solution: `function twoSingleNumbers(nums) {
  let x = 0;
  for (const v of nums) x ^= v;
  const low = x & -x;
  let a = 0, b = 0;
  for (const v of nums) {
    if (v & low) a ^= v;
    else b ^= v;
  }
  return a < b ? [a, b] : [b, a];
}
`,
    },
    tests: [
      { args: [[1, 2, 1, 3, 2, 5]], expect: [3, 5] },
      { args: [[-1, 0]], expect: [-1, 0] },
      { args: [[0, 1]], expect: [0, 1] },
      { args: [[2, 1, 3, 2]], expect: [1, 3] },
      { args: [[4, 4, 7, 9, 10, 10]], expect: [7, 9] },
      { args: [[-3, 5, 5, 6]], expect: [-3, 6] },
    ],
  },
  {
    id: 'bt-maximum-xor-pair',
    title: 'Maximum XOR of Two Numbers',
    diff: 'Hard',
    pattern: 'Bit Manipulation',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: 'Given an array of non-negative integers `nums`, return the largest value of `nums[i] XOR nums[j]` over all pairs with `0 <= i <= j < n` (so a single-element array gives 0).',
    examples: [
      { input: 'nums = [3, 10, 5, 25, 2, 8]', output: '28', explain: '5 XOR 25 = 28.' },
      { input: 'nums = [8, 10, 2]', output: '10', explain: '8 XOR 2 = 10.' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^5', '0 <= nums[i] <= 2^31 - 1'],
    hints: ['Build the answer greedily from the highest bit down.', 'For each bit, guess that the answer has it set and check with a set of prefixes: a ^ b = guess means a ^ guess = b.'],
    approach: 'Decide the answer one bit at a time from bit 30 down to bit 0. Keep a mask of the bits handled so far and the best answer found. At each step, collect the prefixes (num & mask) of all numbers in a set and propose candidate = best with the current bit turned on. The candidate is reachable if some two prefixes XOR to it, which is true when prefix ^ candidate is also in the set for some prefix. If so, keep the candidate. After 31 steps, best is the maximum XOR. Checking all pairs is O(n^2); a binary trie gives the same O(31n) bound.',
    complexity: 'Time O(31 * n), Space O(n)',
    fn: { py: 'find_maximum_xor', js: 'findMaximumXOR' },
    py: {
      starter: 'def find_maximum_xor(nums):\n    # write your code here\n    pass\n',
      solution: `def find_maximum_xor(nums):
    best = mask = 0
    for bit in range(30, -1, -1):
        mask |= 1 << bit
        prefixes = {v & mask for v in nums}
        cand = best | (1 << bit)
        if any(p ^ cand in prefixes for p in prefixes):
            best = cand
    return best
`,
    },
    js: {
      starter: 'function findMaximumXOR(nums) {\n  // write your code here\n}\n',
      solution: `function findMaximumXOR(nums) {
  let best = 0, mask = 0;
  for (let bit = 30; bit >= 0; bit--) {
    mask |= 1 << bit;
    const prefixes = new Set(nums.map((v) => v & mask));
    const cand = best | (1 << bit);
    for (const p of prefixes) {
      if (prefixes.has(p ^ cand)) { best = cand; break; }
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[3, 10, 5, 25, 2, 8]], expect: 28 },
      { args: [[0]], expect: 0 },
      { args: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]], expect: 127 },
      { args: [[1, 2]], expect: 3 },
      { args: [[8, 10, 2]], expect: 10 },
      { args: [[5, 5]], expect: 0 },
    ],
  },
];
