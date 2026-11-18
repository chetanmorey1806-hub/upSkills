export default {
  id: "extra-16-memory-management-gc-weakref",
  title: "Memory Management: Reference Counting, Garbage Collection, weakref, is vs ==, Interning",
  module: "Module 3: Advanced OOP & Internals",
  extraNo: 16,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Understand how CPython manages memory: names are references to objects, reference counting frees most objects immediately, the cyclic garbage collector cleans up reference cycles, weak references let you point to objects without keeping them alive, and identity (is) differs from equality (==). Also covers small-integer caching, string interning, mutable vs immutable behaviour, copying, and tools to find memory leaks.",
  objectives: [
    "Explain names, objects and references, and the difference between is and ==",
    "Describe reference counting and when an object is freed",
    "Explain reference cycles and how the generational garbage collector handles them",
    "Use weakref.ref, WeakValueDictionary and weakref.finalize",
    "Explain small integer caching and string interning, and measure memory with sys and tracemalloc",
  ],
  theory: [
    {
      heading: "Names, Objects and References",
      content: `In Python, variables are **names bound to objects**, not boxes containing values. \`a = [1, 2]\` creates a list object and binds the name \`a\` to it. \`b = a\` does NOT copy the list - it binds a second name to the same object. Every object has an **identity** (\`id(obj)\`, its memory address in CPython), a **type**, and a **value**.

This explains classic surprises: modifying a list through \`b\` is visible through \`a\`; passing a list to a function lets the function modify the caller's list ("call by object reference"); and the mutable default argument bug. Immutable objects (int, str, tuple, frozenset) cannot change, so operations create new objects.`,
      points: [
        "`b = a` -> same object; `b = a.copy()` / `list(a)` / `a[:]` -> shallow copy",
        "`copy.deepcopy(a)` copies nested objects too",
        "`x += 1` on an int rebinds x to a new object; `lst += [1]` mutates the list in place",
      ],
    },
    {
      heading: "is vs ==",
      content: `\`==\` compares **values** by calling \`__eq__\`. \`is\` compares **identity** - whether both names refer to the very same object (same id). Two different lists with the same content are \`==\` but not \`is\`.

Use \`is\` only for singletons: \`None\`, \`True\`, \`False\`, \`Ellipsis\`, sentinel objects, and enum members. Use \`==\` for everything else. Never write \`if x is 5\` or \`if name is "admin"\` - it may work by accident due to caching, and Python 3.8+ emits a SyntaxWarning for \`is\` with a literal.`,
      syntax: `a = [1, 2]; b = [1, 2]; c = a
a == b    # True  (same value)
a is b    # False (different objects)
a is c    # True  (same object)
x is None # correct way to test for None
`,
    },
    {
      heading: "Reference Counting",
      content: `CPython's main memory management technique is **reference counting**. Every object stores a counter of how many references point to it: names, list elements, dict values, attributes, function arguments on the call stack. The count goes up when a new reference is created and down when a name is reassigned, deleted with \`del\`, goes out of scope, or a container drops it. When the count reaches **zero**, the object is freed immediately (and its \`__del__\` runs if defined).

\`sys.getrefcount(obj)\` shows the count (it is one higher than expected because the argument itself is a temporary reference). Since Python 3.12, some objects like None, True and small ints are **immortal** (PEP 683) - their counts never change and they are never freed.`,
      tip: "`del x` deletes the NAME x, not the object. The object is freed only when its last reference disappears.",
    },
    {
      heading: "Reference Cycles and the Garbage Collector",
      content: `Reference counting cannot free **cycles**: if object A refers to B and B refers back to A (or an object refers to itself, e.g. a parent with children that point to the parent), their counts never reach zero even when nothing else uses them. CPython adds a **cyclic garbage collector** (\`gc\` module) that periodically finds groups of container objects only reachable from each other and frees them.

It is **generational**: new objects start in generation 0; objects surviving a collection move to older generations, which are scanned less often (most objects die young). \`gc.collect()\` forces a collection and returns the number of unreachable objects found; \`gc.get_threshold()\`, \`gc.get_count()\`, \`gc.disable()\` and \`gc.freeze()\` give control. Only container objects (lists, dicts, class instances...) are tracked - ints and strings cannot form cycles.`,
      points: [
        "Most objects are freed instantly by refcounting; gc handles only cycles",
        "Objects with __del__ in cycles are collectable since Python 3.4 (PEP 442)",
        "Some apps (e.g. Instagram) tune or freeze gc for performance",
      ],
    },
    {
      heading: "Weak References",
      content: `A **weak reference** points to an object without increasing its reference count, so it does not keep the object alive. \`weakref.ref(obj)\` returns a callable; calling it returns the object, or \`None\` once the object has been freed. Higher-level tools: \`WeakValueDictionary\` (values disappear when the objects die - ideal for caches), \`WeakKeyDictionary\` (attach extra data to objects without leaking them), \`WeakSet\`, and \`weakref.finalize(obj, func)\` (a safer alternative to \`__del__\` for cleanup).

Not every object supports weak references: int, str, tuple, list and dict instances do not (subclasses of list/dict can), and classes with \`__slots__\` need \`'__weakref__'\` in their slots.`,
    },
    {
      heading: "Interning, Caching and Memory Tools",
      content: `CPython caches **small integers from -5 to 256**: every use of 100 returns the same object, so \`a = 100; b = 100; a is b\` is True, but for 1000 it may be False (it can also be True when both values are constants in the same compiled code block). **String interning** stores one copy of certain strings: identifiers and short strings that look like identifiers are interned automatically; \`sys.intern(s)\` interns manually, which can save memory and speed up dictionary lookups when the same strings repeat millions of times. These are implementation details - never rely on them for correctness.

Tools: \`sys.getsizeof(obj)\` (shallow size in bytes), \`tracemalloc\` (find which lines allocate memory), \`gc.get_objects()\`, and third-party \`memory_profiler\`, \`objgraph\`, \`pympler\`. CPython's allocator pymalloc manages small objects (<= 512 bytes) in pools for speed.`,
    },
  ],
  examples: [
    {
      title: "Names, References, is vs ==",
      scenario: "A junior developer is confused why changing one list changed another. Let us look at identities.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import copy

cart_a = ["pen", "book"]
cart_b = cart_a
cart_b.append("bag")
print(cart_a, cart_a is cart_b)

cart_c = cart_a.copy()
cart_c.append("lamp")
print(cart_a, cart_c, cart_a == cart_c, cart_a is cart_c)

x = [1, 2, 3]
y = [1, 2, 3]
print(x == y, x is y, id(x) == id(y))

def add_item(cart, item):
    cart.append(item)

add_item(cart_a, "pencil")
print(cart_a)

n = 10
m = n
n += 1
print(n, m)

nested = [[1, 2], [3, 4]]
shallow = copy.copy(nested)
deep = copy.deepcopy(nested)
nested[0].append(99)
print(shallow[0], deep[0])

value = None
print(value is None, value == None)
`,
      python: {
        files: {
          "main.py": `import copy

cart_a = ["pen", "book"]
cart_b = cart_a
cart_b.append("bag")
print(cart_a, cart_a is cart_b)

cart_c = cart_a.copy()
cart_c.append("lamp")
print(cart_a, cart_c, cart_a == cart_c, cart_a is cart_c)

x = [1, 2, 3]
y = [1, 2, 3]
print(x == y, x is y, id(x) == id(y))

def add_item(cart, item):
    cart.append(item)

add_item(cart_a, "pencil")
print(cart_a)

n = 10
m = n
n += 1
print(n, m)

nested = [[1, 2], [3, 4]]
shallow = copy.copy(nested)
deep = copy.deepcopy(nested)
nested[0].append(99)
print(shallow[0], deep[0])

value = None
print(value is None, value == None)
`,
        },
      },
      result: `['pen', 'book', 'bag'] True
['pen', 'book', 'bag'] ['pen', 'book', 'bag', 'lamp'] False False
True False False
['pen', 'book', 'bag', 'pencil']
11 10
[1, 2, 99] [1, 2]
True True`,
      explanation: "cart_b is another name for the same list, so the append shows in both. copy() creates a new list. Functions receive a reference to the same list and can mutate it. Ints are immutable: n += 1 makes a new object and m keeps 10. A shallow copy shares inner lists; deepcopy does not.",
    },
    {
      title: "Watching Reference Counts",
      scenario: "Observe how the reference count changes as names and containers refer to an object.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

class Report:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f"  Report {self.name!r} freed")

r = Report("Q1")
base = sys.getrefcount(r)
print("baseline (includes temporary arg):", base)

r2 = r
print("after r2 = r:", sys.getrefcount(r) - base, "extra")
reports = [r, r]
print("after list with 2 refs:", sys.getrefcount(r) - base, "extra")

del reports
print("after del list:", sys.getrefcount(r) - base, "extra")
del r2

print("deleting last name r ...")
del r
print("object is gone right away (no gc needed)")

def make():
    temp = Report("temp")
    return len(temp.name)
print("function returned", make())

print("None immortal in 3.12+:", sys.getrefcount(None) > 1_000_000)
`,
      python: {
        files: {
          "main.py": `import sys

class Report:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f"  Report {self.name!r} freed")

r = Report("Q1")
base = sys.getrefcount(r)
print("baseline (includes temporary arg):", base)

r2 = r
print("after r2 = r:", sys.getrefcount(r) - base, "extra")
reports = [r, r]
print("after list with 2 refs:", sys.getrefcount(r) - base, "extra")

del reports
print("after del list:", sys.getrefcount(r) - base, "extra")
del r2

print("deleting last name r ...")
del r
print("object is gone right away (no gc needed)")

def make():
    temp = Report("temp")
    return len(temp.name)
print("function returned", make())

print("None immortal in 3.12+:", sys.getrefcount(None) > 1_000_000)
`,
        },
      },
      result: `baseline (includes temporary arg): 2
after r2 = r: 1 extra
after list with 2 refs: 3 extra
after del list: 1 extra
deleting last name r ...
  Report 'Q1' freed
object is gone right away (no gc needed)
  Report 'temp' freed
function returned 4
None immortal in 3.12+: True`,
      explanation: "Each new name or container slot increases the count; del and leaving a function scope decrease it. When the last reference to r disappears, CPython frees it immediately and __del__ runs at once. In 3.12, None is immortal and reports a huge fixed reference count.",
    },
    {
      title: "Reference Cycles and the gc Module",
      scenario: "A tree structure where children point to their parent creates cycles. Show that refcounting alone cannot free them and how gc helps.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.parent = None
        self.children = []
    def add(self, child):
        child.parent = self
        self.children.append(child)

gc.collect()
gc.disable()

root = Node("root")
for i in range(3):
    root.add(Node(f"child{i}"))

del root
print("unreachable cycle still in memory:", any(isinstance(o, Node) for o in gc.get_objects()))

found = gc.collect()
print("gc.collect() found unreachable objects:", found > 0)
print("Nodes left:", sum(isinstance(o, Node) for o in gc.get_objects()))
gc.enable()

print("generations thresholds:", gc.get_threshold())
print("tracked list?", gc.is_tracked([]), "| tracked int?", gc.is_tracked(42))
`,
      python: {
        files: {
          "main.py": `import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.parent = None
        self.children = []
    def add(self, child):
        child.parent = self
        self.children.append(child)

gc.collect()
gc.disable()

root = Node("root")
for i in range(3):
    root.add(Node(f"child{i}"))

del root
print("unreachable cycle still in memory:", any(isinstance(o, Node) for o in gc.get_objects()))

found = gc.collect()
print("gc.collect() found unreachable objects:", found > 0)
print("Nodes left:", sum(isinstance(o, Node) for o in gc.get_objects()))
gc.enable()

print("generations thresholds:", gc.get_threshold())
print("tracked list?", gc.is_tracked([]), "| tracked int?", gc.is_tracked(42))
`,
        },
      },
      result: `unreachable cycle still in memory: True
gc.collect() found unreachable objects: True
Nodes left: 0
generations thresholds: (700, 10, 10)
tracked list? True | tracked int? False`,
      explanation: "Each child refers to the parent and the parent's list refers to the children, so counts never reach zero after del root. With automatic gc disabled, the Node objects remain. gc.collect() detects the unreachable cycle and frees it. Only containers are tracked by gc. (Threshold values differ between Python versions.)",
    },
    {
      title: "Weak References and Caches",
      scenario: "An image viewer caches loaded images but must not keep them alive when no part of the app uses them anymore.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import weakref

class Image:
    def __init__(self, path):
        self.path = path
    def __repr__(self):
        return f"Image({self.path!r})"

img = Image("logo.png")
ref = weakref.ref(img)
print("deref:", ref(), "| alive:", ref() is not None)
del img
print("after del:", ref())

cache = weakref.WeakValueDictionary()
a = Image("a.png")
b = Image("b.png")
cache["a"] = a
cache["b"] = b
print(sorted(cache.keys()))
del a
print(sorted(cache.keys()))

extra = weakref.WeakKeyDictionary()
b_meta = b
extra[b_meta] = {"views": 10}
print(extra[b])

weakref.finalize(b, print, "finalize: cleaning up temp files for b.png")
del b, b_meta
print("end of program part")

try:
    weakref.ref([1, 2])
except TypeError as e:
    print("TypeError:", e)
`,
      python: {
        files: {
          "main.py": `import weakref

class Image:
    def __init__(self, path):
        self.path = path
    def __repr__(self):
        return f"Image({self.path!r})"

img = Image("logo.png")
ref = weakref.ref(img)
print("deref:", ref(), "| alive:", ref() is not None)
del img
print("after del:", ref())

cache = weakref.WeakValueDictionary()
a = Image("a.png")
b = Image("b.png")
cache["a"] = a
cache["b"] = b
print(sorted(cache.keys()))
del a
print(sorted(cache.keys()))

extra = weakref.WeakKeyDictionary()
b_meta = b
extra[b_meta] = {"views": 10}
print(extra[b])

weakref.finalize(b, print, "finalize: cleaning up temp files for b.png")
del b, b_meta
print("end of program part")

try:
    weakref.ref([1, 2])
except TypeError as e:
    print("TypeError:", e)
`,
        },
      },
      result: `deref: Image('logo.png') | alive: True
after del: None
['a', 'b']
['b']
{'views': 10}
finalize: cleaning up temp files for b.png
end of program part
TypeError: cannot create weak reference to 'list' object`,
      explanation: "A weakref does not keep the object alive; after del it returns None. WeakValueDictionary entries vanish when the value object dies, perfect for caches. WeakKeyDictionary attaches data to objects without leaking them. finalize runs a callback when the object is collected. Plain lists cannot be weakly referenced.",
    },
    {
      title: "Small Integer Cache, String Interning and Sizes",
      scenario: "Explain an interview puzzle: why does `a is b` give different answers for different numbers and strings?",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

a = int("100")
b = int("100")
print("100:", a is b, a == b)
c = int("1000")
d = int("1000")
print("1000:", c is d, c == d)

s1 = "hello_world"
s2 = "hello_" + "world"
print("identifier-like literals:", s1 is s2)
s3 = "".join(["hello", " ", "there!"])
s4 = "".join(["hello", " ", "there!"])
print("runtime strings:", s3 is s4, s3 == s4)
s5, s6 = sys.intern(s3), sys.intern(s4)
print("after sys.intern:", s5 is s6)

for obj in [0, 2**100, "", "abc", [], [1, 2, 3], (), {}, set()]:
    print(f"{obj!r:>35} -> {sys.getsizeof(obj)} bytes")

outer = [list(range(1000))]
print("shallow size of outer list:", sys.getsizeof(outer), "| inner:", sys.getsizeof(outer[0]))
`,
      python: {
        files: {
          "main.py": `import sys

a = int("100")
b = int("100")
print("100:", a is b, a == b)
c = int("1000")
d = int("1000")
print("1000:", c is d, c == d)

s1 = "hello_world"
s2 = "hello_" + "world"
print("identifier-like literals:", s1 is s2)
s3 = "".join(["hello", " ", "there!"])
s4 = "".join(["hello", " ", "there!"])
print("runtime strings:", s3 is s4, s3 == s4)
s5, s6 = sys.intern(s3), sys.intern(s4)
print("after sys.intern:", s5 is s6)

for obj in [0, 2**100, "", "abc", [], [1, 2, 3], (), {}, set()]:
    print(f"{obj!r:>35} -> {sys.getsizeof(obj)} bytes")

outer = [list(range(1000))]
print("shallow size of outer list:", sys.getsizeof(outer), "| inner:", sys.getsizeof(outer[0]))
`,
        },
      },
      result: `100: True True
1000: False True
identifier-like literals: True
runtime strings: False True
after sys.intern: True
                                  0 -> 28 bytes
    1267650600228229401496703205376 -> 40 bytes
                                 '' -> 41 bytes
                              'abc' -> 44 bytes
                                 [] -> 56 bytes
                          [1, 2, 3] -> 88 bytes
                                 () -> 40 bytes
                                 {} -> 64 bytes
                              set() -> 216 bytes
shallow size of outer list: 64 | inner: 8056`,
      explanation: "Values -5..256 are cached, so two 100s are the same object, while 1000 created at runtime gives two objects. Constant expressions like 'hello_' + 'world' are folded and interned at compile time; strings built at runtime are not, unless you sys.intern them. getsizeof is shallow: it does not include objects referenced inside containers. (Sizes are for 64-bit CPython 3.12.)",
    },
  ],
  interview: [
    {
      q: "What is the difference between `is` and `==`?",
      a: "`==` checks value equality via __eq__; `is` checks identity, i.e. whether both operands are the same object in memory (same id). Use `is` for None/True/False/sentinels and `==` for comparing values.",
      level: "Easy",
    },
    {
      q: "Why does `a = 256; b = 256; a is b` give True but it may be False for 257?",
      a: "CPython pre-creates and caches small integers from -5 to 256, so all uses share one object. Larger ints are created separately at runtime (though constants in the same code block may be shared by the compiler). It is an implementation detail; never use `is` to compare numbers.",
      level: "Medium",
    },
    {
      q: "How does Python manage memory?",
      a: "CPython uses a private heap managed by the interpreter, with the pymalloc allocator for small objects. Objects are freed primarily through reference counting (immediately when the count hits zero), and a generational cyclic garbage collector frees groups of objects that reference each other but are unreachable.",
      level: "Medium",
    },
    {
      q: "What is reference counting and what is its weakness?",
      a: "Each object keeps a count of references to it; when it drops to zero the object is freed immediately. It is simple and deterministic, but it cannot free reference cycles and adds overhead to every assignment (and complicates multi-threading, one reason for the GIL).",
      level: "Medium",
    },
    {
      q: "How does the garbage collector detect cycles?",
      a: "For tracked container objects, gc copies each object's refcount and subtracts references coming from other objects in the same generation. Objects whose remaining count is zero are only referenced from inside the group; if they are not reachable from objects with external references, they are unreachable garbage and get freed.",
      level: "Hard",
    },
    {
      q: "What are the generations in Python's gc?",
      a: "There are three generations (0, 1, 2). New objects start in gen 0; survivors of a collection are promoted. Younger generations are collected more often because most objects die young. Thresholds (gc.get_threshold()) control how often each generation is scanned. (Newer versions such as 3.14 rework this into an incremental collector, but the idea of young and old objects remains.)",
      level: "Hard",
    },
    {
      q: "What does `del x` do?",
      a: "It removes the name x from the current namespace and decreases the referenced object's refcount by one. The object is freed only if that was the last reference. It does not directly destroy the object.",
      level: "Easy",
    },
    {
      q: "What is a weak reference and when would you use it?",
      a: "A reference that does not increase the target's refcount, so it does not keep the object alive. Used for caches (WeakValueDictionary), observer/callback lists, parent pointers in trees to avoid cycles, and attaching metadata to objects (WeakKeyDictionary) without memory leaks.",
      level: "Medium",
    },
    {
      q: "Why is __del__ discouraged for cleanup?",
      a: "It runs only when the object is collected, which may be delayed (cycles, other interpreters like PyPy) or happen during interpreter shutdown when modules are partially torn down; exceptions in it are ignored. Prefer context managers (with) for deterministic cleanup or weakref.finalize.",
      level: "Hard",
    },
    {
      q: "Can Python programs have memory leaks?",
      a: "Yes: objects kept alive by growing global lists/dicts/caches, unbounded lru_cache, closures or listeners holding references, reference cycles with gc disabled, and C extensions that leak. Diagnose with tracemalloc snapshots, gc.get_objects, objgraph or memory profilers.",
      level: "Medium",
    },
    {
      q: "What is string interning?",
      a: "Keeping a single shared copy of equal strings. CPython automatically interns identifiers and many compile-time string constants; sys.intern() interns strings at runtime. It saves memory and makes dict lookups faster (identity check first). It is an optimisation, not something to rely on.",
      level: "Medium",
    },
    {
      q: "What are immortal objects in Python 3.12?",
      a: "PEP 683 made some objects (None, True, False, small ints, some interned strings and static types) immortal: their reference counts are fixed at a special value and never change, so they are never deallocated. This avoids cache-line writes and helps with multi-interpreter and free-threading work.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Demonstrate the difference between assignment, shallow copy and deep copy for a dict of lists {'IT': ['Asha'], 'HR': ['Ravi']}: add a name to 'IT' in the original and print all three versions.",
      hint: "alias = d; shallow = d.copy(); deep = copy.deepcopy(d)",
      solution: `import copy

d = {"IT": ["Asha"], "HR": ["Ravi"]}
alias = d
shallow = d.copy()
deep = copy.deepcopy(d)
d["IT"].append("John")
print("alias  :", alias)
print("shallow:", shallow)
print("deep   :", deep)
`,
    },
    {
      task: "Write a class with __del__ that prints when it is freed. Create an instance, assign it to two names and a list, then remove the references one by one, printing a message after each step to see exactly when it is freed.",
      hint: "The object is freed only after the last reference is gone.",
      solution: `class Temp:
    def __del__(self):
        print("  Temp freed")

t = Temp()
alias = t
holder = [t]
del t
print("deleted t")
del alias
print("deleted alias")
holder.clear()
print("cleared list")
`,
    },
    {
      task: "Create two objects that refer to each other (a.partner = b, b.partner = a). Delete both names, then show with gc.collect() that the cycle is collected. Disable automatic gc during the test.",
      hint: "gc.disable(); ...; print(gc.collect() > 0); gc.enable()",
      solution: `import gc

class Person:
    def __init__(self, name):
        self.name = name
        self.partner = None

gc.collect()
gc.disable()
a, b = Person("A"), Person("B")
a.partner, b.partner = b, a
del a, b
print("Persons alive:", sum(isinstance(o, Person) for o in gc.get_objects()))
print("collected:", gc.collect() > 0)
print("Persons alive:", sum(isinstance(o, Person) for o in gc.get_objects()))
gc.enable()
`,
    },
    {
      task: "Implement an observer list using weakref.WeakSet: a Publisher keeps subscribers weakly, so subscribers deleted elsewhere are automatically removed. Publish a message before and after deleting one subscriber.",
      hint: "self.subscribers = weakref.WeakSet(); for s in list(self.subscribers): s.notify(msg)",
      solution: `import weakref

class Subscriber:
    def __init__(self, name):
        self.name = name
    def notify(self, msg):
        print(f"{self.name} got: {msg}")

class Publisher:
    def __init__(self):
        self.subscribers = weakref.WeakSet()
    def subscribe(self, s):
        self.subscribers.add(s)
    def publish(self, msg):
        for s in sorted(self.subscribers, key=lambda s: s.name):
            s.notify(msg)

pub = Publisher()
asha, ravi = Subscriber("Asha"), Subscriber("Ravi")
pub.subscribe(asha)
pub.subscribe(ravi)
pub.publish("Sale starts!")
del ravi
pub.publish("Sale ends!")
`,
    },
  ],
  quiz: [
    {
      question: "a = [1]; b = [1]. What is `a is b`?",
      options: [
        "True",
        "False",
        "Error",
        "Depends on the list size",
      ],
      answer: 1,
      explanation: "Two list literals create two different objects, though they are equal.",
    },
    {
      question: "When does CPython free an object with no cycles?",
      options: [
        "At program end",
        "When gc.collect() runs",
        "Immediately when its reference count reaches zero",
        "Every 700 allocations",
      ],
      answer: 2,
      explanation: "Reference counting frees objects as soon as the count hits zero.",
    },
    {
      question: "What does the cyclic garbage collector handle?",
      options: [
        "All objects",
        "Only reference cycles among container objects",
        "Only strings",
        "Only objects with __del__",
      ],
      answer: 1,
      explanation: "Refcounting handles most objects; gc finds unreachable cycles.",
    },
    {
      question: "Calling a weakref.ref after its object is freed returns...",
      options: [
        "The object",
        "None",
        "Raises ReferenceError",
        "A copy",
      ],
      answer: 1,
      explanation: "A dead weak reference returns None when called.",
    },
    {
      question: "What is the correct way to check for None?",
      options: [
        "x == None",
        "x is None",
        "x.isNone()",
        "type(x) == None",
      ],
      answer: 1,
      explanation: "None is a singleton; PEP 8 recommends `is None`.",
    },
    {
      question: "Which integers does CPython cache?",
      options: [
        "0 to 100",
        "-5 to 256",
        "-128 to 127",
        "All integers",
      ],
      answer: 1,
      explanation: "Small integers -5 to 256 are preallocated and shared.",
    },
  ],
};
