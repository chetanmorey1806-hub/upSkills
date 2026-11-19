export default {
  lesson: 'day-27-classes-objects',
  minutes: 30,
  intro: 'Define classes with __init__ and self, create objects, and use instance vs class variables correctly (including the mutable class variable trap).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In `def add_marks(self, m):`, what is `self`?',
      options: [
        'A keyword that must always be written as self',
        'The object (instance) on which the method was called',
        'The class itself',
        'A copy of the object',
      ],
      answer: 1,
      explain: '`s1.add_marks(90)` is turned into `Student.add_marks(s1, 90)`, so `self` **is** `s1`: the same object, not a copy. "self" is only a strong convention; any name works, but always use self.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Instance vs class variables. What is printed?',
      code: `class Student:
    school = "UpSkillr"
    count = 0
    def __init__(self, name):
        self.name = name
        Student.count += 1

a = Student("Asha")
b = Student("Ravi")
b.school = "IIT"
print(a.school, b.school, Student.school)
print(Student.count, a.count)
print(a.__dict__)`,
      expected: "UpSkillr IIT UpSkillr\n2 2\n{'name': 'Asha'}",
      explain: '`b.school = "IIT"` creates a new **instance** variable on b that hides the class variable; a and the class still see "UpSkillr". `Student.count` is shared and was incremented twice. `__dict__` shows only the instance’s own attributes.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which special method runs automatically when you create an object like `Student("Asha")` and sets up its attributes?',
      accept: ['__init__', '__init__()', 'init'],
      explain: '`__init__` is the initialiser: Python creates the object, then calls `__init__(self, ...)` with your arguments. It must not return a value.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Create a class `Student` with:\n- `__init__(self, name, marks)` storing `name` and `marks` (a list of ints)\n- `average()` → average rounded to 2\n- `result()` → `"Pass"` if every mark is ≥ 35, else `"Fail"`\n- `add_mark(m)` → appends a mark',
      example: { title: 'a small class', code: 'class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n\n    def is_long(self):\n        return self.pages > 300\n\nb = Book("Python 101", 420)\nprint(b.is_long())' },
      starter: `class Student:
    def __init__(self, name, marks):
        pass  # TODO

    def average(self):
        pass  # TODO

    def result(self):
        pass  # TODO

    def add_mark(self, m):
        pass  # TODO
`,
      solution: `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def average(self):
        return round(sum(self.marks) / len(self.marks), 2)

    def result(self):
        return "Pass" if all(m >= 35 for m in self.marks) else "Fail"

    def add_mark(self, m):
        self.marks.append(m)
`,
      tests: [
        { call: 'Student("Asha", [78, 85, 90]).name', expect: 'Asha' },
        { call: 'Student("Asha", [78, 85, 90]).average()', expect: 84.33 },
        { call: 'Student("Ravi", [60, 30, 90]).result()', expect: 'Fail' },
        { call: '(lambda s: (s.add_mark(100), s.marks, s.result())[1:])(Student("Neha", [40]))', expect: [[40, 100], 'Pass'], msg: 'add_mark must append to this student’s marks' },
      ],
      explain: 'Attributes must be stored on `self` in `__init__` (`self.marks = marks`), otherwise they vanish when `__init__` ends. Methods then read them via `self.`. Forgetting `self` as the first parameter gives "takes 0 positional arguments but 1 was given".',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Create a class `Employee` with a **class variable** `company = "UpSkillr"` and a class variable `headcount` that counts how many employees were created. Each employee has instance variables `name` and `salary`.',
      example: { title: 'class variable shared by all objects', code: 'class Car:\n    wheels = 4\n    made = 0\n    def __init__(self, model):\n        self.model = model\n        Car.made += 1' },
      starter: `class Employee:
    # TODO: class variables
    def __init__(self, name, salary):
        pass  # TODO
`,
      solution: `class Employee:
    company = "UpSkillr"
    headcount = 0

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
        Employee.headcount += 1
`,
      tests: [
        { call: 'Employee.company', expect: 'UpSkillr' },
        { call: '(lambda before: (Employee("A", 1), Employee("B", 2), Employee.headcount - before)[2])(Employee.headcount)', expect: 2, msg: 'creating 2 employees must increase Employee.headcount by 2' },
        { call: 'Employee("Asha", 55000).salary', expect: 55000 },
        { call: "'company' not in Employee('X', 1).__dict__", expect: true, msg: 'company must be a class variable, not set on each object' },
      ],
      explain: 'Increment through the **class** (`Employee.headcount += 1`). Writing `self.headcount += 1` reads the class value but then creates an instance variable on that one object, so the shared counter never changes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Fix the **mutable class variable trap**: every `Team` currently shares the same `members` list, so adding to one team adds to all. Each team must have its own list.',
      example: { title: 'per-object list', code: 'class Cart:\n    def __init__(self):\n        self.items = []   # new list for each cart' },
      starter: `class Team:
    members = []

    def __init__(self, name):
        self.name = name

    def add(self, person):
        self.members.append(person)
`,
      solution: `class Team:
    def __init__(self, name):
        self.name = name
        self.members = []

    def add(self, person):
        self.members.append(person)
`,
      tests: [
        { call: '(lambda a, b: (a.add("Asha"), b.add("Ravi"), [a.members, b.members])[2])(Team("Red"), Team("Blue"))', expect: [['Asha'], ['Ravi']], msg: 'each team must have its own members list' },
      ],
      explain: 'A list defined in the class body is created **once** and shared by all objects; `append` changes that shared list. Creating it in `__init__` with `self.members = []` gives each object its own list.',
    },
  ],
};
