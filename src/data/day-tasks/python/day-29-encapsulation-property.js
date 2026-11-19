export default {
  lesson: 'day-29-encapsulation-property',
  minutes: 30,
  intro: 'Hide and protect data with _protected and __private names and validate it with @property getters and setters.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does a single leading underscore, like `self._salary`, mean in Python?',
      options: [
        'Python blocks all access from outside the class',
        'It is a convention: "internal, please do not use from outside" (access is still possible)',
        'It makes the attribute read-only',
        'It is a syntax error',
      ],
      answer: 1,
      explain: '`_name` is only a **convention** for "protected/internal". Python does not stop access. A double underscore `__name` triggers name mangling, which makes accidental access and clashes harder.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Name mangling. What is printed?',
      code: `class Account:
    def __init__(self):
        self.owner = "Asha"
        self._branch = "Pune"
        self.__pin = 1234

acc = Account()
print(acc.owner, acc._branch)
try:
    print(acc.__pin)
except AttributeError:
    print("no __pin")
print(acc._Account__pin)`,
      expected: 'Asha Pune\nno __pin\n1234',
      explain: 'Inside the class, `__pin` is renamed to `_Account__pin`. So `acc.__pin` fails from outside, but the mangled name still works: it is protection against **accidents**, not security.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Create a class `Product(name, price)` where `price` is a **property** with validation:\n- the getter returns the price\n- the setter raises `ValueError` if the new price is negative\n- the check must also run in `__init__` (assign through `self.price = price`)',
      example: { title: '@property with setter', code: 'class Person:\n    def __init__(self, age):\n        self.age = age          # goes through the setter\n\n    @property\n    def age(self):\n        return self._age\n\n    @age.setter\n    def age(self, value):\n        if value < 0:\n            raise ValueError("age cannot be negative")\n        self._age = value' },
      starter: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    # TODO: price property + setter
`,
      solution: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price cannot be negative")
        self._price = value
`,
      tests: [
        { call: 'Product("Pen", 10).price', expect: 10 },
        { call: '(lambda p: (setattr(p, "price", 25), p.price)[1])(Product("Pen", 10))', expect: 25 },
        { call: `exec("try:\\n    Product('Pen', 10).price = -5\\n    _r = 'no error'\\nexcept ValueError:\\n    _r = 'ValueError'") or _r`, expect: 'ValueError', msg: 'setting a negative price must raise ValueError' },
        { call: `exec("try:\\n    Product('Pen', -1)\\n    _r = 'no error'\\nexcept ValueError:\\n    _r = 'ValueError'") or _r`, expect: 'ValueError', msg: 'Product("Pen", -1) must raise ValueError (validate in __init__ too)' },
      ],
      explain: 'The property stores the real value in `self._price`. Storing it in `self.price` inside the setter would call the setter again → RecursionError. Because `__init__` assigns `self.price`, the same validation runs on creation.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Create a class `Rectangle(width, height)` with **read-only computed properties** `area` and `perimeter` (no setters). Changing `width` must update `area` automatically.',
      example: { title: 'computed property', code: 'class Circle:\n    def __init__(self, r):\n        self.r = r\n\n    @property\n    def diameter(self):\n        return 2 * self.r' },
      starter: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    # TODO: area and perimeter properties
`,
      solution: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

    @property
    def perimeter(self):
        return 2 * (self.width + self.height)
`,
      tests: [
        { call: 'Rectangle(4, 5).area', expect: 20, msg: 'area is used without brackets: r.area' },
        { call: 'Rectangle(4, 5).perimeter', expect: 18 },
        { call: '(lambda r: (setattr(r, "width", 10), r.area)[1])(Rectangle(4, 5))', expect: 50, msg: 'area must be recalculated after width changes' },
        { call: `exec("try:\\n    Rectangle(1, 1).area = 99\\n    _r = 'writable'\\nexcept AttributeError:\\n    _r = 'read-only'") or _r`, expect: 'read-only', msg: 'area must be read-only (a property without a setter)' },
      ],
      explain: 'A property without a setter is read-only (assigning raises AttributeError). Computing the value on every access keeps it in sync; storing `self.area = w * h` in `__init__` would go stale when width changes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Create `Wallet(owner)` with a **private** balance `self.__balance = 0`, a `deposit(amount)` method that only accepts positive amounts (ignore others), and a read-only property `balance`.',
      example: { title: 'private attribute + read-only view', code: 'class Counter:\n    def __init__(self):\n        self.__n = 0\n    def hit(self):\n        self.__n += 1\n    @property\n    def n(self):\n        return self.__n' },
      starter: `class Wallet:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0   # TODO: make it private + read-only property

    def deposit(self, amount):
        self.balance += amount
`,
      solution: `class Wallet:
    def __init__(self, owner):
        self.owner = owner
        self.__balance = 0

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    @property
    def balance(self):
        return self.__balance
`,
      tests: [
        { call: '(lambda w: (w.deposit(500), w.deposit(-100), w.balance)[2])(Wallet("Asha"))', expect: 500 },
        { call: "'_Wallet__balance' in Wallet('Ravi').__dict__", expect: true, msg: 'store the balance in a private attribute self.__balance' },
        { call: `exec("try:\\n    Wallet('X').balance = 1000000\\n    _r = 'writable'\\nexcept AttributeError:\\n    _r = 'read-only'") or _r`, expect: 'read-only', msg: 'balance must not be settable from outside' },
      ],
      explain: 'Outside code can only change the balance through `deposit`, which enforces the rule. `self.__balance` is stored as `_Wallet__balance` (name mangling). The property gives read access without a setter.',
    },
  ],
};
