export default {
  lesson: 'day-30-inheritance',
  minutes: 30,
  intro: 'Reuse code with single, multilevel and multiple inheritance, extend methods with super(), and read the MRO.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'The diamond problem. What is printed?',
      code: `class A:
    def hello(self):
        return "A"
class B(A):
    def hello(self):
        return "B" + super().hello()
class C(A):
    def hello(self):
        return "C" + super().hello()
class D(B, C):
    pass

print(D().hello())
print([k.__name__ for k in D.__mro__])`,
      expected: "BCA\n['D', 'B', 'C', 'A', 'object']",
      explain: 'Python uses the **MRO** (C3 linearization): D → B → C → A → object. `super()` means "next class in the MRO", not "my parent", so B’s super() goes to **C**, then C’s to A: "BCA". A is visited only once.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`class Manager(Employee)`. Which is True for `m = Manager(...)`?',
      options: [
        'isinstance(m, Employee) is False',
        'issubclass(Employee, Manager) is True',
        'isinstance(m, Employee) is True',
        'type(m) is Employee',
      ],
      answer: 2,
      explain: 'A Manager **is an** Employee, so `isinstance(m, Employee)` is True (and `issubclass(Manager, Employee)` too). `type(m)` is exactly Manager; that is why `isinstance` is preferred over `type(...) ==` checks.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Single inheritance with `super()`. Given `Employee`, create `Manager(Employee)`:\n- `__init__(self, name, salary, team_size)` calls `super().__init__(name, salary)` and stores `team_size`\n- override `annual_pay()` to return the parent’s annual pay **plus** a bonus of 10000 per team member (reuse the parent with super())',
      example: { title: 'extending a parent method', code: 'class Animal:\n    def sound(self):\n        return "..."\n\nclass Dog(Animal):\n    def sound(self):\n        return super().sound() + " Woof"' },
      starter: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def annual_pay(self):
        return self.salary * 12

class Manager(Employee):
    pass  # TODO
`,
      solution: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def annual_pay(self):
        return self.salary * 12

class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)
        self.team_size = team_size

    def annual_pay(self):
        return super().annual_pay() + 10000 * self.team_size
`,
      tests: [
        { call: '(lambda m: [m.name, m.salary, m.team_size])(Manager("Asha", 90000, 5))', expect: ['Asha', 90000, 5] },
        { call: 'Manager("Asha", 90000, 5).annual_pay()', expect: 1130000 },
        { call: 'Employee("Ravi", 40000).annual_pay()', expect: 480000 },
        { call: 'issubclass(Manager, Employee)', expect: true },
      ],
      explain: 'If the child defines `__init__` but forgets `super().__init__(...)`, `name` and `salary` are never set (AttributeError later). Calling `super().annual_pay()` reuses the parent logic instead of copying `self.salary * 12`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Multilevel inheritance: `Vehicle → Car → ElectricCar`.\n- `Vehicle(brand)` with `describe()` → `"Brand: <brand>"`\n- `Car(brand, seats)` adds seats; `describe()` → parent text + `", Seats: <seats>"`\n- `ElectricCar(brand, seats, battery_kwh)`; `describe()` → parent text + `", Battery: <battery_kwh> kWh"`\n\n`ElectricCar("Tata", 5, 40).describe()` → `"Brand: Tata, Seats: 5, Battery: 40 kWh"`',
      example: { title: 'each level adds a little', code: 'class A:\n    def info(self):\n        return "A"\nclass B(A):\n    def info(self):\n        return super().info() + "B"' },
      starter: `class Vehicle:
    pass  # TODO

class Car(Vehicle):
    pass  # TODO

class ElectricCar(Car):
    pass  # TODO
`,
      solution: `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def describe(self):
        return f"Brand: {self.brand}"

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand)
        self.seats = seats

    def describe(self):
        return super().describe() + f", Seats: {self.seats}"

class ElectricCar(Car):
    def __init__(self, brand, seats, battery_kwh):
        super().__init__(brand, seats)
        self.battery_kwh = battery_kwh

    def describe(self):
        return super().describe() + f", Battery: {self.battery_kwh} kWh"
`,
      tests: [
        { call: 'Vehicle("Bajaj").describe()', expect: 'Brand: Bajaj' },
        { call: 'Car("Maruti", 4).describe()', expect: 'Brand: Maruti, Seats: 4' },
        { call: 'ElectricCar("Tata", 5, 40).describe()', expect: 'Brand: Tata, Seats: 5, Battery: 40 kWh' },
        { call: 'isinstance(ElectricCar("Tata", 5, 40), Vehicle)', expect: true },
      ],
      explain: 'Each class handles only its **own** new attribute and delegates the rest to `super()`. If Car’s describe changes, ElectricCar automatically picks up the change. Copy-pasting the parent text into every class is the mistake inheritance is meant to avoid.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Mixin. Write a `DictMixin` class with a method `to_dict()` that returns a **copy** of the object’s attributes (`vars(self)` / `self.__dict__`). Then make `Student(DictMixin)` with `name` and `roll`, and `Course(DictMixin)` with `title` and `fee`.',
      example: { title: 'a mixin adds one feature', code: 'class ShoutMixin:\n    def shout(self):\n        return str(self).upper()\n\nclass Msg(ShoutMixin):\n    def __str__(self):\n        return "hello"' },
      starter: `class DictMixin:
    pass  # TODO

class Student:
    def __init__(self, name, roll):
        self.name = name
        self.roll = roll

class Course:
    def __init__(self, title, fee):
        self.title = title
        self.fee = fee
`,
      solution: `class DictMixin:
    def to_dict(self):
        return dict(vars(self))

class Student(DictMixin):
    def __init__(self, name, roll):
        self.name = name
        self.roll = roll

class Course(DictMixin):
    def __init__(self, title, fee):
        self.title = title
        self.fee = fee
`,
      tests: [
        { call: 'Student("Asha", 101).to_dict()', expect: { name: 'Asha', roll: 101 } },
        { call: 'Course("Python", 4999).to_dict()', expect: { title: 'Python', fee: 4999 } },
        { call: '(lambda s: (s.to_dict().update(name="X"), s.name)[1])(Student("Asha", 1))', expect: 'Asha', msg: 'to_dict must return a copy (changing it must not change the object)' },
      ],
      explain: 'A mixin is a small class that adds one reusable feature to unrelated classes via multiple inheritance. Return `dict(vars(self))` (a copy); returning `self.__dict__` directly lets callers modify the object by accident.',
    },
  ],
};
