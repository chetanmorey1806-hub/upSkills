export default {
  lesson: 'extra-16-memory-management-gc-weakref',
  minutes: 25,
  intro: 'Understand names and references, is vs ==, reference counting, cycles and the garbage collector, and weak references.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `a = [1, 2, 3]
b = a
c = a[:]
print(a == c, a is c)
print(a is b)
b.append(4)
print(a)
x = 5
y = x
x += 1
print(x, y)`,
      expected: 'True False\nTrue\n[1, 2, 3, 4]\n6 5',
      explain: '`a[:]` makes a NEW list with equal content, so `==` is True but `is` is False. `b = a` copies only the reference, so appending through `b` changes `a`. Integers are immutable: `x += 1` rebinds `x` to a new object and `y` still refers to 5.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Two objects reference each other (`a.friend = b`, `b.friend = a`) and you `del a, b`. What frees them?',
      options: ['Reference counting, immediately', 'The cyclic garbage collector (gc module)', 'Nothing - Python leaks them forever', 'Only restarting the program'],
      answer: 1,
      explain: 'Each object still has a reference count of 1 (from the other one), so refcounting alone cannot free them. CPython\'s generational **garbage collector** finds unreachable cycles and frees them. You can trigger it with `gc.collect()`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which comparison is correct and Pythonic?',
      options: ['`if name is "Asha":`', '`if count is 1000:`', '`if value is None:`', '`if items is []:`'],
      answer: 2,
      explain: '`is` checks identity (same object). `None` is a singleton, so `is None` is right. For strings, numbers and lists use `==`: small-int caching and string interning make `is` *sometimes* work, which hides bugs (and Python warns "is with a literal").',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Build an image cache that does not keep images alive on its own. Write class `ImageCache` using `weakref.WeakValueDictionary`:\n- `put(key, image)` stores it\n- `get(key)` returns the image or `None`\n- `size()` returns how many entries are still alive\n\nA simple class `Image` is given (plain objects like `str` cannot be weakly referenced).',
      example: { title: 'weak references', code: 'import weakref\nclass Node: pass\nn = Node()\nr = weakref.ref(n)\nprint(r() is n)   # True\ndel n\nprint(r())        # None (object was freed)' },
      starter: 'import weakref\n\nclass Image:\n    def __init__(self, name):\n        self.name = name\n\nclass ImageCache:\n    def __init__(self):\n        self._data = {}\n    # TODO: put, get, size\n',
      solution: 'import weakref\n\nclass Image:\n    def __init__(self, name):\n        self.name = name\n\nclass ImageCache:\n    def __init__(self):\n        self._data = weakref.WeakValueDictionary()\n    def put(self, key, image):\n        self._data[key] = image\n    def get(self, key):\n        return self._data.get(key)\n    def size(self):\n        return len(self._data)\n',
      tests: [
        { call: '(lambda c, img: (c.put("logo", img), c.get("logo").name, c.size())[1:])(ImageCache(), Image("logo.png"))', expect: ['logo.png', 1] },
        { call: '(lambda c: (c.put("tmp", Image("t.png")), __import__("gc").collect(), c.size(), c.get("tmp"))[2:])(ImageCache())', expect: [0, null], msg: 'An image with no other references must disappear from the cache' },
      ],
      explain: 'A `WeakValueDictionary` does not increase the reference count of its values. When the last normal reference to an image goes away, the entry disappears automatically, so the cache can never cause a memory leak. A normal dict would keep every image alive forever.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `same_and_equal(a, b)` that returns a tuple `(a == b, a is b)`. Then write `independent_copy(grid)` that returns a copy of a 2D list where changing the copy never changes the original (use `copy.deepcopy`).',
      example: { title: 'shallow vs deep copy', code: 'import copy\nrows = [[1, 2], [3, 4]]\nshallow = rows.copy()      # inner lists shared\ndeep = copy.deepcopy(rows) # inner lists copied' },
      starter: 'import copy\n\ndef same_and_equal(a, b):\n    return None\n\ndef independent_copy(grid):\n    return grid.copy()\n',
      solution: 'import copy\n\ndef same_and_equal(a, b):\n    return (a == b, a is b)\n\ndef independent_copy(grid):\n    return copy.deepcopy(grid)\n',
      tests: [
        { call: 'same_and_equal([1, 2], [1, 2])', expect: [true, false] },
        { call: '(lambda x: same_and_equal(x, x))({"a": 1})', expect: [true, true] },
        { call: '(lambda g: (independent_copy(g)[0].append(99), g)[1])([[1, 2], [3]])', expect: [[1, 2], [3]], msg: 'Changing the copy must not change the original' },
      ],
      explain: '`list.copy()` / `[:]` are **shallow**: the outer list is new but the inner lists are shared, so `copy[0].append(99)` changes the original too. `deepcopy` copies nested objects recursively.',
    },
  ],
};
