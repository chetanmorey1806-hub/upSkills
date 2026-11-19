export default {
  lesson: 'day-13-heaps-priority-queues',
  minutes: 40,
  intro: 'Use heaps with heapq: the min-heap property and array layout, max-heap tricks, (priority, tiebreaker, item) tuples, top-k, kth largest, merging sorted lists and a running median.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import heapq
h = [7, 2, 9, 4, 1]
heapq.heapify(h)
print(h[0])
heapq.heappush(h, 0)
print(heapq.heappop(h), heapq.heappop(h))
print(heapq.nlargest(2, [5, 1, 8, 3]), heapq.nsmallest(2, [5, 1, 8, 3]))`,
      expected: '1\n0 1\n[8, 5] [1, 3]',
      explain: '`heapq` is a **min-heap**: `h[0]` is always the smallest and `heappop` removes the smallest. The rest of the list is NOT fully sorted, only heap-ordered. `nlargest`/`nsmallest` return sorted lists.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the array representation of a heap, what are the indexes of the children of the node at index i?',
      options: ['i + 1 and i + 2', '2i + 1 and 2i + 2', 'i // 2 and i // 2 + 1', '2i and 2i - 1'],
      answer: 1,
      explain: 'A complete binary tree is stored level by level: children of i are at 2i+1 and 2i+2, and the parent is at (i-1)//2. No pointers are needed, which is why heaps are stored in plain lists.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Kth largest element.** Write `kth_largest(nums, k)` in O(n log k): keep a min-heap of size k (push each number, pop when the heap grows beyond k). The answer is the heap\'s top.',
      example: { title: 'bounded heap', code: 'heapq.heappush(h, x)\nif len(h) > k:\n    heapq.heappop(h)   # drop the smallest' },
      starter: 'import heapq\n\ndef kth_largest(nums, k):\n    # TODO\n    return None\n',
      solution: 'import heapq\n\ndef kth_largest(nums, k):\n    h = []\n    for x in nums:\n        heapq.heappush(h, x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return h[0]\n',
      tests: [
        { call: 'kth_largest([3, 2, 1, 5, 6, 4], 2)', expect: 5 },
        { call: 'kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)', expect: 4 },
        { call: 'kth_largest([7], 1)', expect: 7 },
        { call: 'kth_largest([-1, -5, -3], 3)', expect: -5 },
      ],
      explain: 'The min-heap holds the k largest values seen so far; its smallest element is therefore the kth largest. Sorting everything is O(n log n); the heap is O(n log k) and only needs O(k) memory, which suits streams.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Top K frequent words.** Write `top_k_words(words, k)` that returns the k most frequent words, ordered by frequency (high to low), and alphabetically for equal frequency. Use `Counter` and `heapq.nsmallest` with a key like `(-count, word)`.',
      example: { title: 'simulating a max-heap', code: '# heapq is a min-heap; negate the priority\nheapq.heappush(h, (-score, name))' },
      starter: 'import heapq\nfrom collections import Counter\n\ndef top_k_words(words, k):\n    # TODO\n    return []\n',
      solution: 'import heapq\nfrom collections import Counter\n\ndef top_k_words(words, k):\n    counts = Counter(words)\n    return heapq.nsmallest(k, counts, key=lambda w: (-counts[w], w))\n',
      tests: [
        { call: 'top_k_words(["i", "love", "python", "i", "love", "coding"], 2)', expect: ['i', 'love'] },
        { call: 'top_k_words(["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], 4)', expect: ['the', 'is', 'sunny', 'day'] },
        { call: 'top_k_words(["b", "a", "c"], 2)', expect: ['a', 'b'], msg: 'Ties are broken alphabetically' },
      ],
      explain: 'Negating the count turns "largest count first" into "smallest key first", which a min-heap understands, while the word itself breaks ties alphabetically. This (priority, tiebreaker) tuple idea is common with heapq.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Merge K sorted lists.** Write `merge_k(lists)` that merges k sorted Python lists into one sorted list in O(N log k). Push `(value, list_index, element_index)` for the first element of each list, then repeatedly pop the smallest and push the next element from the same list.',
      example: { title: 'why a tiebreaker?', code: '# (5, 0, 2) vs (5, 1, 0): equal values are compared\n# by list_index next, so heapq never compares\n# un-orderable objects' },
      starter: 'import heapq\n\ndef merge_k(lists):\n    # TODO\n    return []\n',
      solution: 'import heapq\n\ndef merge_k(lists):\n    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]\n    heapq.heapify(h)\n    out = []\n    while h:\n        val, i, j = heapq.heappop(h)\n        out.append(val)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(h, (lists[i][j + 1], i, j + 1))\n    return out\n',
      tests: [
        { call: 'merge_k([[1, 4, 5], [1, 3, 4], [2, 6]])', expect: [1, 1, 2, 3, 4, 4, 5, 6] },
        { call: 'merge_k([])', expect: [] },
        { call: 'merge_k([[], [], [3]])', expect: [3] },
        { call: 'merge_k([[5], [1, 2, 9], [0, 10]])', expect: [0, 1, 2, 5, 9, 10] },
      ],
      explain: 'The heap always holds at most one "current" element per list (k items), so every push/pop is O(log k) and N elements give O(N log k). Skip empty lists when building the heap, or `lst[0]` raises IndexError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Running median.** Write `running_median(nums)` that returns the median after each number is added (as a float). Use two heaps: a max-heap (store negatives) for the lower half and a min-heap for the upper half, keeping their sizes balanced.',
      example: { title: 'two heaps', code: 'low = []    # max-heap via negatives\nhigh = []   # min-heap\nheapq.heappush(low, -x)\nheapq.heappush(high, -heapq.heappop(low))  # move the biggest of low' },
      starter: 'import heapq\n\ndef running_median(nums):\n    # TODO\n    return []\n',
      solution: 'import heapq\n\ndef running_median(nums):\n    low, high, out = [], [], []\n    for x in nums:\n        heapq.heappush(low, -x)\n        heapq.heappush(high, -heapq.heappop(low))\n        if len(high) > len(low):\n            heapq.heappush(low, -heapq.heappop(high))\n        if len(low) > len(high):\n            out.append(float(-low[0]))\n        else:\n            out.append((-low[0] + high[0]) / 2)\n    return out\n',
      tests: [
        { call: '[str(m) for m in running_median([5, 15, 1, 3])]', expect: ['5.0', '10.0', '5.0', '4.0'] },
        { call: '[str(m) for m in running_median([2, 3, 4])]', expect: ['2.0', '2.5', '3.0'] },
        { call: '[str(m) for m in running_median([-1, -2, -3, -4, -5])]', expect: ['-1.0', '-1.5', '-2.0', '-2.5', '-3.0'] },
        { call: 'running_median([])', expect: [] },
      ],
      explain: 'The lower half\'s maximum and the upper half\'s minimum are the middle values, readable in O(1) from the heap tops; each insert is O(log n). Re-sorting the list after every insert would be O(n log n) per step.',
    },
  ],
};
