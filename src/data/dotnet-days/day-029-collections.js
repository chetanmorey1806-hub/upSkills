const ex1 = `using System;
using System.Collections;
using System.Collections.Generic;

// ---- ArrayList: old, non-generic, stores everything as object ----
ArrayList mixed = new ArrayList();
mixed.Add("Asha");
mixed.Add(21);
mixed.Add(true);
Console.WriteLine("ArrayList count: " + mixed.Count);
foreach (object item in mixed)
{
    Console.WriteLine($"  {item} ({item.GetType().Name})");
}
int age = (int)mixed[1];   // cast needed (unboxing)
Console.WriteLine("Age next year: " + (age + 1));

// ---- List<T>: modern, type-safe ----
List<string> names = new List<string> { "Ravi", "Asha" };
names.Add("Meena");
names.Insert(0, "John");
Console.WriteLine("List: " + string.Join(", ", names));
names.Remove("Ravi");
names.Sort();
Console.WriteLine("Sorted: " + string.Join(", ", names));
Console.WriteLine("Count: " + names.Count);
Console.WriteLine("Contains Meena? " + names.Contains("Meena"));
Console.WriteLine("Index of John: " + names.IndexOf("John"));
Console.WriteLine("First: " + names[0]);`;

const ex2 = `using System;
using System.Collections.Generic;

Dictionary<int, string> students = new Dictionary<int, string>();
students.Add(101, "Asha");
students.Add(102, "Ravi");
students[103] = "Meena";        // indexer adds a new key
students[102] = "Ravi Kumar";   // indexer updates an existing key

Console.WriteLine("Total students: " + students.Count);
Console.WriteLine("Roll 102: " + students[102]);

if (students.TryGetValue(105, out string? name))
    Console.WriteLine("Found: " + name);
else
    Console.WriteLine("Roll 105 not found");

Console.WriteLine("Has 101? " + students.ContainsKey(101));
Console.WriteLine("Has value Meena? " + students.ContainsValue("Meena"));

students.Remove(101);

bool added = students.TryAdd(102, "Duplicate");   // key exists -> false
Console.WriteLine("TryAdd 102 again: " + added);

// Dictionary order is NOT guaranteed, so copy into a SortedDictionary to print by key
var sorted = new SortedDictionary<int, string>(students);
foreach (KeyValuePair<int, string> pair in sorted)
{
    Console.WriteLine($"{pair.Key} => {pair.Value}");
}`;

const ex3 = `using System;
using System.Collections.Generic;
using System.Linq;

HashSet<string> courses = new HashSet<string>();
Console.WriteLine(courses.Add("CSharp"));   // True
Console.WriteLine(courses.Add("SQL"));      // True
Console.WriteLine(courses.Add("CSharp"));   // False - duplicate ignored
Console.WriteLine("Unique courses: " + courses.Count);

HashSet<string> batchA = new HashSet<string> { "Asha", "Ravi", "Meena" };
HashSet<string> batchB = new HashSet<string> { "Ravi", "John" };

var both = new HashSet<string>(batchA);
both.IntersectWith(batchB);
Console.WriteLine("In both batches: " + string.Join(", ", both.OrderBy(n => n)));

var all = new HashSet<string>(batchA);
all.UnionWith(batchB);
Console.WriteLine("All students: " + string.Join(", ", all.OrderBy(n => n)));

var onlyA = new HashSet<string>(batchA);
onlyA.ExceptWith(batchB);
Console.WriteLine("Only in A: " + string.Join(", ", onlyA.OrderBy(n => n)));
Console.WriteLine("Contains John? " + batchB.Contains("John"));`;

const ex4 = `using System;
using System.Collections.Generic;

// Queue = First In, First Out (ticket counter)
Queue<string> tickets = new Queue<string>();
tickets.Enqueue("Asha");
tickets.Enqueue("Ravi");
tickets.Enqueue("Meena");
Console.WriteLine("Next in line: " + tickets.Peek());
while (tickets.Count > 0)
{
    string person = tickets.Dequeue();
    Console.WriteLine("Serving " + person + " | left: " + tickets.Count);
}

// Stack = Last In, First Out (undo history)
Stack<string> history = new Stack<string>();
history.Push("Typed: Hello");
history.Push("Typed: World");
history.Push("Bold applied");
Console.WriteLine("Top action: " + history.Peek());
Console.WriteLine("Stack (top first): " + string.Join(" | ", history));
Console.WriteLine("Undo -> " + history.Pop());
Console.WriteLine("Undo -> " + history.Pop());
Console.WriteLine("Remaining: " + history.Count);`;

const ex5 = `using System;
using System.Collections.Generic;

List<Student> students = new List<Student>
{
    new Student(1, "Asha", 88),
    new Student(2, "Ravi", 45),
    new Student(3, "Meena", 72),
};
students.Add(new Student(4, "John", 30));

Console.WriteLine("All students:");
foreach (Student s in students)
    Console.WriteLine("  " + s);

Student? found = students.Find(s => s.Name == "Meena");
Console.WriteLine("Found: " + found);

List<Student> passed = students.FindAll(s => s.Marks >= 40);
Console.WriteLine("Passed count: " + passed.Count);

students.RemoveAll(s => s.Marks < 35);
Console.WriteLine("After removing below 35: " + students.Count);

students.Sort((a, b) => b.Marks.CompareTo(a.Marks));   // highest first
Console.WriteLine("Topper: " + students[0].Name);

Dictionary<int, Student> byRoll = new Dictionary<int, Student>();
foreach (Student s in students) byRoll[s.Roll] = s;
Console.WriteLine("Roll 3 lookup: " + byRoll[3].Name);

class Student
{
    public int Roll { get; }
    public string Name { get; }
    public int Marks { get; }

    public Student(int roll, string name, int marks)
    {
        Roll = roll; Name = name; Marks = marks;
    }

    public override string ToString() => $"{Roll}. {Name} - {Marks}";
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging (F5 to debug, F9 to set a breakpoint)',
];

export default {
  id: 'day-029-collections',
  title: 'Collections: ArrayList, List, Dictionary, HashSet, Queue, Stack',
  module: 'Module 3: Advanced C# Programming',
  day: 29,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Arrays have a fixed size. Collections grow and shrink at runtime. Today you learn the non-generic ArrayList and the modern generic collections List<T>, Dictionary<TKey,TValue>, HashSet<T>, Queue<T> and Stack<T>, and build a Student collection.',
  objectives: [
    'Explain why collections are needed when arrays have a fixed size',
    'Compare ArrayList (non-generic) with List<T> (generic, type-safe)',
    'Store and look up key/value data with Dictionary and avoid KeyNotFoundException',
    'Use HashSet for unique items and Queue/Stack for FIFO/LIFO processing',
    'Build a Student collection with add, search, filter, remove and sort',
  ],
  theory: [
    {
      heading: 'Why collections? Array vs collection',
      content: 'An array (int[] marks = new int[5]) has a fixed length decided when it is created. In real programs you rarely know how many students, orders or products will come. A collection is a class that stores a group of objects and can grow or shrink automatically. .NET collections live in two namespaces: System.Collections (old, non-generic, store object) and System.Collections.Generic (modern, generic, type-safe). Always prefer the generic ones.',
      points: [
        'System.Collections: ArrayList, Hashtable, Queue, Stack (non-generic, store object)',
        'System.Collections.Generic: List<T>, Dictionary<TKey,TValue>, HashSet<T>, Queue<T>, Stack<T>, SortedDictionary, LinkedList<T>',
        'Count property gives the number of items (arrays use Length)',
        'All collections can be looped with foreach',
      ],
      tip: 'Analogy: an array is a train with a fixed number of coaches; a List is a bus where people can keep getting on and off.',
    },
    {
      heading: 'ArrayList vs List<T>',
      content: 'ArrayList stores every item as object. You can put an int, a string and a bool into the same ArrayList, but reading needs a cast and value types get boxed (wrapped in an object) and unboxed. A wrong cast fails only at runtime with InvalidCastException. List<T> fixes this: the type T is decided once, the compiler checks it, and no boxing happens for value types.',
      syntax: `ArrayList list = new ArrayList();
list.Add(10); list.Add("ten");          // compiles, but mixed types
int x = (int)list[0];                   // cast required

List<int> marks = new List<int> { 70, 85 };
marks.Add(90);                          // only int allowed
marks.Insert(0, 60);                    // insert at index
marks.Remove(85);                       // remove by value
marks.RemoveAt(0);                      // remove by index
bool has = marks.Contains(90);
int idx = marks.IndexOf(90);
marks.Sort();  marks.Reverse();  marks.Clear();`,
      points: [
        'List<T> methods: Add, AddRange, Insert, Remove, RemoveAt, RemoveAll, Contains, IndexOf, Find, FindAll, Sort, Reverse, Clear, ToArray',
        'Capacity grows automatically (doubles) when Count reaches Capacity',
        'Reading list[i] with an invalid index throws ArgumentOutOfRangeException',
      ],
    },
    {
      heading: 'Dictionary<TKey, TValue>',
      content: 'A Dictionary stores key/value pairs, like a phone book (name -> number) or roll number -> student. Lookup by key is very fast (hash based, close to O(1)). Keys must be unique and not null. Reading a missing key with dict[key] throws KeyNotFoundException, so use TryGetValue or ContainsKey. Add throws ArgumentException for a duplicate key, while the indexer dict[key] = value adds or overwrites. The order in which a Dictionary returns items is NOT guaranteed; use SortedDictionary or sort the keys when order matters.',
      syntax: `var d = new Dictionary<int, string>();
d.Add(1, "Asha");             // throws if key 1 already exists
d[2] = "Ravi";                // add or update
if (d.TryGetValue(3, out string? n)) { /* found */ }
d.ContainsKey(1); d.ContainsValue("Ravi");
d.Remove(1);  d.TryAdd(2, "X");   // TryAdd returns false if key exists
foreach (KeyValuePair<int, string> kv in d) Console.WriteLine(kv.Key + " " + kv.Value);`,
    },
    {
      heading: 'HashSet<T> - unique items and set operations',
      content: 'HashSet stores only unique values. Add returns true if the item was added and false if it was already present. Contains is very fast. It also supports mathematical set operations: UnionWith (all), IntersectWith (common), ExceptWith (difference). Like Dictionary, a HashSet has no guaranteed order.',
      points: [
        'Use it to remove duplicates: new HashSet<string>(listWithDuplicates)',
        'Use it to check membership quickly (e.g. already registered emails)',
        'SortedSet<T> keeps items sorted if you need ordering',
      ],
    },
    {
      heading: 'Queue<T> (FIFO) and Stack<T> (LIFO)',
      content: 'Queue works like a ticket counter: the first person to join is the first served (First In, First Out). Enqueue adds at the back, Dequeue removes from the front, Peek looks at the front without removing. Stack works like a pile of plates or the Undo button: the last item added is the first removed (Last In, First Out). Push adds on top, Pop removes the top, Peek reads the top. Dequeue/Pop on an empty collection throws InvalidOperationException, so check Count or use TryDequeue/TryPop.',
      syntax: `Queue<string> q = new Queue<string>();
q.Enqueue("A"); q.Enqueue("B");
string first = q.Dequeue();   // "A"

Stack<string> s = new Stack<string>();
s.Push("A"); s.Push("B");
string top = s.Pop();         // "B"`,
    },
    {
      heading: 'Choosing the right collection',
      content: 'Pick a collection based on how you will use the data, not by habit.',
      points: [
        'Ordered list with index access, duplicates allowed -> List<T>',
        'Look up by a unique key (id, email, code) -> Dictionary<TKey,TValue>',
        'Only unique values / fast "does it exist?" -> HashSet<T>',
        'Process in arrival order (jobs, print queue, requests) -> Queue<T>',
        'Undo/redo, back button, expression evaluation -> Stack<T>',
        'Never use ArrayList/Hashtable in new code; they exist for old .NET 1.x code',
      ],
      tip: 'Do not modify a List or Dictionary inside a foreach over the same collection. It throws InvalidOperationException ("Collection was modified"). Use RemoveAll or loop over a copy.',
    },
  ],
  examples: [
    {
      title: 'ArrayList vs List<T>',
      scenario: 'See why the old ArrayList needs casts and why List<string> is safer and easier.',
      steps: steps('CollectionsDemo'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `ArrayList count: 3
  Asha (String)
  21 (Int32)
  True (Boolean)
Age next year: 22
List: John, Ravi, Asha, Meena
Sorted: Asha, John, Meena
Count: 3
Contains Meena? True
Index of John: 1
First: Asha`,
      explanation: 'ArrayList accepts any type, so GetType() shows three different types and reading item 1 needs the cast (int). The List starts as Ravi, Asha; Add puts Meena at the end and Insert(0, ...) puts John at the front. After Remove("Ravi") and Sort() the list is Asha, John, Meena, so IndexOf("John") is 1 and names[0] is Asha.',
    },
    {
      title: 'Dictionary: roll number to student name',
      scenario: 'Store students by roll number, update a name, safely look up a missing roll and print in key order.',
      steps: steps('DictionaryDemo'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Total students: 3
Roll 102: Ravi Kumar
Roll 105 not found
Has 101? True
Has value Meena? True
TryAdd 102 again: False
102 => Ravi Kumar
103 => Meena`,
      explanation: 'students[102] = "Ravi Kumar" overwrote the old value, so Count stays 3. TryGetValue returned false for 105 instead of throwing KeyNotFoundException. After Remove(101) only 102 and 103 remain. Printing through SortedDictionary guarantees ascending key order; a plain Dictionary does not promise any order.',
    },
    {
      title: 'HashSet: unique courses and batch comparison',
      scenario: 'Prevent duplicate course codes and compare two student batches using set operations.',
      steps: steps('HashSetDemo'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `True
True
False
Unique courses: 2
In both batches: Ravi
All students: Asha, John, Meena, Ravi
Only in A: Asha, Meena
Contains John? True`,
      explanation: 'The second Add("CSharp") returns False and the set still has 2 items. IntersectWith keeps common items, UnionWith merges, ExceptWith removes items found in the other set. Each operation changes the set it is called on, so we copy batchA first. OrderBy is used before printing because HashSet order is not guaranteed.',
    },
    {
      title: 'Queue for a ticket counter, Stack for Undo',
      scenario: 'Serve customers in arrival order and undo editor actions in reverse order.',
      steps: steps('QueueStackDemo'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Next in line: Asha
Serving Asha | left: 2
Serving Ravi | left: 1
Serving Meena | left: 0
Top action: Bold applied
Stack (top first): Bold applied | Typed: World | Typed: Hello
Undo -> Bold applied
Undo -> Typed: World
Remaining: 1`,
      explanation: 'The queue returns people in the order they joined (FIFO). Enumerating a Stack starts from the top, so string.Join shows the last pushed item first. Each Pop removes the top item (LIFO), leaving only "Typed: Hello".',
    },
    {
      title: 'Mini project: Student collection',
      scenario: 'Manage a List<Student>: add, print, find, filter, remove failed students, sort by marks and index by roll number.',
      steps: steps('StudentCollection'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `All students:
  1. Asha - 88
  2. Ravi - 45
  3. Meena - 72
  4. John - 30
Found: 3. Meena - 72
Passed count: 3
After removing below 35: 3
Topper: Asha
Roll 3 lookup: Meena`,
      explanation: 'Find returns the first match (or null), FindAll returns a new List with all matches, RemoveAll deletes every match and is safe (unlike removing inside foreach). Sort with a comparison lambda b.Marks.CompareTo(a.Marks) sorts in descending order, so the topper is at index 0. The Dictionary gives instant lookup by roll number.',
    },
  ],
  interview: [
    { q: 'What is the difference between an array and a List<T>?', a: 'An array has a fixed length set at creation (Length). A List<T> grows and shrinks dynamically (Count), and offers methods like Add, Insert, Remove, Find and Sort. Internally a List uses an array and creates a bigger one when full.', level: 'Easy' },
    { q: 'Why is List<T> preferred over ArrayList?', a: 'List<T> is type-safe (checked at compile time), needs no casting, and avoids boxing/unboxing for value types, so it is faster. ArrayList stores object, so errors appear only at runtime as InvalidCastException.', level: 'Easy' },
    { q: 'What happens when you read a missing key with dict[key]?', a: 'It throws KeyNotFoundException. Use TryGetValue(key, out value) or ContainsKey(key) first.', level: 'Easy' },
    { q: 'Difference between dict.Add(k, v) and dict[k] = v?', a: 'Add throws ArgumentException if the key already exists. The indexer adds a new key or silently overwrites the existing value. TryAdd returns false instead of throwing.', level: 'Medium' },
    { q: 'Is the iteration order of Dictionary or HashSet guaranteed?', a: 'No. It often looks like insertion order, but after removals and re-adds it can change and the documentation does not promise any order. Use SortedDictionary/SortedSet or OrderBy when order matters.', level: 'Medium' },
    { q: 'What is the output? var s = new HashSet<int>{1,2,2,3}; Console.WriteLine(s.Count);', a: '3. The duplicate 2 is ignored by the collection initializer (it calls Add, which returns false).', level: 'Easy' },
    { q: 'What is the output? var st = new Stack<int>(); st.Push(1); st.Push(2); st.Push(3); Console.WriteLine(st.Pop() + st.Peek());', a: '5. Pop returns 3 (and removes it), then Peek returns 2 without removing it. 3 + 2 = 5.', level: 'Medium' },
    { q: 'What is the output? var q = new Queue<string>(); q.Enqueue("A"); q.Enqueue("B"); q.Dequeue(); Console.WriteLine(q.Peek() + q.Count);', a: 'B1. Dequeue removed A, Peek reads B and Count is 1.', level: 'Medium' },
    { q: 'What happens if you call Remove on a List inside foreach over the same list?', a: 'An InvalidOperationException "Collection was modified; enumeration operation may not execute" is thrown at the next iteration. Use RemoveAll, a reverse for loop, or loop over a copy (ToList()).', level: 'Medium' },
    { q: 'What is the time complexity of List.Contains vs HashSet.Contains?', a: 'List.Contains is O(n) because it checks items one by one. HashSet.Contains is O(1) on average because it uses hash codes. For large lookups use HashSet or Dictionary.', level: 'Hard' },
    { q: 'What is Capacity in List<T>?', a: 'Capacity is the size of the internal array. Count is how many items are actually stored. When Count reaches Capacity, the List allocates a larger array (usually double) and copies items. You can pass an initial capacity to avoid repeated resizing.', level: 'Hard' },
    { q: 'When would you use a Queue in a real application?', a: 'For first-come-first-served processing: print jobs, order processing, background job queues, BFS traversal, message handling.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a List<int> of marks {45, 78, 90, 33, 66}. Print the count, the highest mark, then remove all marks below 40 and print the remaining marks in ascending order.',
      hint: 'Use Count, a loop (or Max()), RemoveAll and Sort.',
      solution: `using System;
using System.Collections.Generic;

List<int> marks = new List<int> { 45, 78, 90, 33, 66 };
Console.WriteLine("Count: " + marks.Count);          // 5
int max = marks[0];
foreach (int m in marks) if (m > max) max = m;
Console.WriteLine("Highest: " + max);                // 90
marks.RemoveAll(m => m < 40);
marks.Sort();
Console.WriteLine(string.Join(", ", marks));         // 45, 66, 78, 90`,
    },
    {
      task: 'Count word frequency in the sentence "red blue red green blue red" using a Dictionary<string,int> and print words in alphabetical order.',
      hint: 'Split on space; if the key exists increment, else set to 1. Print using a SortedDictionary.',
      solution: `using System;
using System.Collections.Generic;

string text = "red blue red green blue red";
var counts = new Dictionary<string, int>();
foreach (string w in text.Split(' '))
{
    if (counts.ContainsKey(w)) counts[w]++;
    else counts[w] = 1;
}
foreach (var kv in new SortedDictionary<string, int>(counts))
    Console.WriteLine(kv.Key + ": " + kv.Value);
// blue: 2
// green: 1
// red: 3`,
    },
    {
      task: 'Remove duplicate email addresses from a list and print how many unique emails exist.',
      hint: 'Pass the list to the HashSet constructor. Use StringComparer.OrdinalIgnoreCase to ignore case.',
      solution: `using System;
using System.Collections.Generic;

var emails = new List<string> { "a@x.com", "b@x.com", "A@x.com", "c@x.com", "b@x.com" };
var unique = new HashSet<string>(emails, StringComparer.OrdinalIgnoreCase);
Console.WriteLine("Unique: " + unique.Count);   // 3`,
    },
    {
      task: 'Check whether brackets in "(a+[b*c])" are balanced using a Stack<char>.',
      hint: 'Push opening brackets; on a closing bracket, Pop and check it matches. At the end the stack must be empty.',
      solution: `using System;
using System.Collections.Generic;

string expr = "(a+[b*c])";
var stack = new Stack<char>();
bool ok = true;
foreach (char ch in expr)
{
    if (ch == '(' || ch == '[') stack.Push(ch);
    else if (ch == ')' || ch == ']')
    {
        if (stack.Count == 0) { ok = false; break; }
        char open = stack.Pop();
        if ((ch == ')' && open != '(') || (ch == ']' && open != '[')) { ok = false; break; }
    }
}
if (stack.Count != 0) ok = false;
Console.WriteLine(ok ? "Balanced" : "Not balanced");   // Balanced`,
    },
    {
      task: 'Simulate a hospital token queue: enqueue 4 patient names, serve 2, then print who is next and how many are waiting.',
      hint: 'Enqueue, Dequeue twice, Peek and Count.',
      solution: `using System;
using System.Collections.Generic;

var q = new Queue<string>(new[] { "P1", "P2", "P3", "P4" });
Console.WriteLine("Served " + q.Dequeue());   // Served P1
Console.WriteLine("Served " + q.Dequeue());   // Served P2
Console.WriteLine("Next: " + q.Peek());       // Next: P3
Console.WriteLine("Waiting: " + q.Count);     // Waiting: 2`,
    },
  ],
  quiz: [
    { question: 'Which namespace contains List<T> and Dictionary<TKey,TValue>?', options: ['System.Collections', 'System.Collections.Generic', 'System.Linq', 'System.Data'], answer: 1, explanation: 'Generic collections are in System.Collections.Generic. System.Collections has the old non-generic ArrayList and Hashtable.' },
    { question: 'Which collection follows Last In, First Out?', options: ['Queue<T>', 'List<T>', 'HashSet<T>', 'Stack<T>'], answer: 3, explanation: 'Stack<T> is LIFO: Push adds to the top and Pop removes from the top.' },
    { question: 'What does HashSet<T>.Add return when the item already exists?', options: ['false', 'It throws an exception', 'true', 'The index of the item'], answer: 0, explanation: 'Add returns false and does not add the duplicate.' },
    { question: 'Which call safely reads a value from a Dictionary without throwing if the key is missing?', options: ['dict[key]', 'dict.Add(key, value)', 'dict.TryGetValue(key, out var v)', 'dict.Remove(key)'], answer: 2, explanation: 'TryGetValue returns false when the key is missing. dict[key] would throw KeyNotFoundException.' },
    { question: 'Why is ArrayList slower than List<int> for numbers?', options: ['It cannot grow', 'It boxes each int into an object', 'It sorts automatically', 'It uses a linked list'], answer: 1, explanation: 'ArrayList stores object, so each int is boxed on Add and must be unboxed with a cast on read.' },
  ],
};
