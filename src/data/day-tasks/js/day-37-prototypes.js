export default {
  lesson: 'day-37-prototypes',
  minutes: 35,
  intro: 'Explore the prototype chain, share methods with constructor functions, inherit with Object.create and write a safe polyfill.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `obj.__proto__` and `Func.prototype`?',
      options: ['They are always the same object', '__proto__ is the object an instance inherits from; Func.prototype is the object that will become the __proto__ of instances created with new Func()', 'prototype exists on every object, __proto__ only on functions', '__proto__ is for classes, prototype for arrays'],
      answer: 1,
      explain: 'Every object has a hidden link `[[Prototype]]` (read it with `Object.getPrototypeOf(obj)` or the old `__proto__`). Functions also have a `.prototype` property, which `new` uses as the `[[Prototype]]` of the new object. So `new Person().__proto__ === Person.prototype`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Property lookup and shadowing. What is printed?',
      code: `const animal = { sound: "generic", legs: 4 };
const dog = Object.create(animal);
dog.sound = "woof";
console.log(dog.sound);
console.log(dog.legs);
console.log(dog.hasOwnProperty("legs"));
delete dog.sound;
console.log(dog.sound);
console.log(Object.getPrototypeOf(dog) === animal);`,
      expected: 'woof\n4\nfalse\ngeneric\ntrue',
      explain: 'Lookup first checks the object itself, then walks up the chain. `dog.sound` **shadows** the prototype\'s value; deleting the own property reveals the inherited one again. `legs` is inherited, so it is not an own property.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Constructor function. Write `function Person(name, city)` that stores both properties, and add a **shared** method `greet()` on `Person.prototype` that returns `"Namaste, I am <name> from <city>"`.',
      example: { title: 'methods on the prototype', code: 'function Car(model) {\n  this.model = model;\n}\nCar.prototype.drive = function () {\n  return this.model + " is driving";\n};' },
      starter: 'function Person(name, city) {\n  // TODO\n}\n// TODO: Person.prototype.greet = ...\n',
      solution: 'function Person(name, city) {\n  this.name = name;\n  this.city = city;\n}\nPerson.prototype.greet = function () {\n  return `Namaste, I am ${this.name} from ${this.city}`;\n};',
      tests: [
        { call: 'new Person("Asha", "Pune").greet()', expect: 'Namaste, I am Asha from Pune' },
        { call: 'new Person("A", "B").greet === new Person("C", "D").greet', expect: true, msg: 'greet is shared through the prototype, not copied per object' },
        { call: 'Object.keys(new Person("A", "B"))', expect: ['name', 'city'], msg: 'Only name and city are own properties' },
      ],
      explain: 'Defining `this.greet = function...` inside the constructor would create a new function for **every** object. Putting it on `Person.prototype` stores it once and all instances find it through the chain. Use a regular function (not an arrow) so `this` works.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Prototypal inheritance without classes. `Person` is given. Write `function Teacher(name, city, subject)` that calls `Person.call(this, name, city)` and stores `subject`. Link the prototypes with `Teacher.prototype = Object.create(Person.prototype)` (and fix `constructor`), then add `Teacher.prototype.teach()` returning `"<name> teaches <subject>"`.',
      example: { title: 'Object.create for inheritance', code: 'function Dog(name) { Animal.call(this, name); }\nDog.prototype = Object.create(Animal.prototype);\nDog.prototype.constructor = Dog;' },
      starter: 'function Person(name, city) {\n  this.name = name;\n  this.city = city;\n}\nPerson.prototype.greet = function () {\n  return `Namaste, I am ${this.name} from ${this.city}`;\n};\n\nfunction Teacher(name, city, subject) {\n  // TODO\n}\n// TODO: link prototypes and add teach()\n',
      solution: 'function Person(name, city) {\n  this.name = name;\n  this.city = city;\n}\nPerson.prototype.greet = function () {\n  return `Namaste, I am ${this.name} from ${this.city}`;\n};\n\nfunction Teacher(name, city, subject) {\n  Person.call(this, name, city);\n  this.subject = subject;\n}\nTeacher.prototype = Object.create(Person.prototype);\nTeacher.prototype.constructor = Teacher;\nTeacher.prototype.teach = function () {\n  return `${this.name} teaches ${this.subject}`;\n};',
      tests: [
        { call: 'new Teacher("Meena", "Nagpur", "Maths").teach()', expect: 'Meena teaches Maths' },
        { call: 'new Teacher("Meena", "Nagpur", "Maths").greet()', expect: 'Namaste, I am Meena from Nagpur', msg: 'Teachers inherit greet() from Person' },
        { call: 'new Teacher("A", "B", "C") instanceof Person', expect: true },
        { call: 'new Teacher("A", "B", "C").constructor === Teacher', expect: true, msg: 'constructor points back to Teacher' },
      ],
      explain: 'This is exactly what `class Teacher extends Person` does behind the scenes: `Person.call(this, ...)` is like `super(...)`, and `Object.create(Person.prototype)` builds the chain Teacher.prototype → Person.prototype → Object.prototype.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Polyfill style. Add a method `sum()` to `Array.prototype` **only if it does not already exist**, which returns the total of the array\'s numbers. (In real projects only add polyfills for standard methods, never your own names; this is practice.)',
      example: { title: 'feature-check before adding', code: 'if (!String.prototype.shout) {\n  String.prototype.shout = function () {\n    return this.toUpperCase() + "!";\n  };\n}' },
      starter: '// TODO: Array.prototype.sum\n',
      solution: 'if (!Array.prototype.sum) {\n  Array.prototype.sum = function () {\n    return this.reduce((total, n) => total + n, 0);\n  };\n}',
      tests: [
        { call: '[10, 20, 30].sum()', expect: 60 },
        { call: '[].sum()', expect: 0 },
      ],
      explain: 'Inside a prototype method, `this` is the array it was called on, so a regular `function` is required (an arrow would not get the array). The `if` check avoids overwriting a native implementation. Adding non-standard methods to built-ins is risky because a future JavaScript version might add the same name with different behaviour.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Classes use prototypes too. What is printed?',
      code: `class Shape {
  area() { return 0; }
}
class Square extends Shape {
  constructor(s) { super(); this.s = s; }
  area() { return this.s * this.s; }
}
const sq = new Square(3);
console.log(typeof Square);
console.log(Object.getPrototypeOf(sq) === Square.prototype);
console.log(Object.getPrototypeOf(Square.prototype) === Shape.prototype);
console.log(sq.hasOwnProperty("area"));`,
      expected: 'function\ntrue\ntrue\nfalse',
      explain: 'A class is a special **function**; its methods live on `Class.prototype`, and `extends` links `Square.prototype` to `Shape.prototype`. Methods are therefore inherited, not own properties of each instance.',
    },
  ],
};
