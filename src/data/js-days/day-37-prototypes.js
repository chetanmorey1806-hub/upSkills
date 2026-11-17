const ex1 = `// Every object has a hidden link to another object: its prototype
const arr = [1, 2, 3];
const obj = { a: 1 };

console.log(Object.getPrototypeOf(arr) === Array.prototype);
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));      // end of the chain

// arr has no own "map" or "hasOwnProperty" - they are found up the chain
console.log('own map?', Object.hasOwn(arr, 'map'), '| can use map?', typeof arr.map);
console.log('own toString on obj?', Object.hasOwn(obj, 'toString'), '|', obj.toString());

// Property lookup walks the chain: own -> prototype -> prototype's prototype ...
const animal = { eats: true, describe() { return 'eats: ' + this.eats; } };
const rabbit = Object.create(animal);   // rabbit's prototype is animal
rabbit.jumps = true;

console.log(rabbit.jumps, rabbit.eats, rabbit.describe());
console.log(Object.keys(rabbit));       // only OWN keys
console.log('missing ->', rabbit.flies); // not found anywhere -> undefined`;

const ex2 = `// Constructor functions + prototype: how JS did "classes" before ES2015
function Person(name, age) {
  this.name = name;            // own properties (per instance)
  this.age = age;
}

// shared methods go on Person.prototype (stored ONCE)
Person.prototype.greet = function () {
  return 'Hi, I am ' + this.name;
};

const p1 = new Person('Asha', 25);
const p2 = new Person('Ravi', 30);

console.log(p1.greet(), '|', p2.greet());
console.log('shared method?', p1.greet === p2.greet);
console.log('p1.__proto__ === Person.prototype:', Object.getPrototypeOf(p1) === Person.prototype);
console.log('Person.prototype.constructor === Person:', Person.prototype.constructor === Person);

// Adding to the prototype later affects ALL existing instances
Person.prototype.birthday = function () { this.age++; return this.age; };
console.log('p2 birthday ->', p2.birthday());

// Shadowing: an own property hides the prototype one
p1.greet = function () { return 'Namaste!'; };
console.log(p1.greet(), '|', p2.greet());`;

const ex3 = `// Prototypal inheritance with constructor functions (the "old" extends)
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return this.name + ' makes a sound';
};

function Dog(name, breed) {
  Animal.call(this, name);          // like super(name)
  this.breed = breed;
}
// Link Dog.prototype -> Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;    // repair constructor reference
Dog.prototype.speak = function () {
  return Animal.prototype.speak.call(this) + ' (woof!)';   // like super.speak()
};

const d = new Dog('Rex', 'Lab');
console.log(d.speak());
console.log(d instanceof Dog, d instanceof Animal);
console.log('chain:', [
  Object.getPrototypeOf(d) === Dog.prototype,
  Object.getPrototypeOf(Dog.prototype) === Animal.prototype,
  Object.getPrototypeOf(Animal.prototype) === Object.prototype,
].join(' -> '));

// The same thing with class syntax - classes ARE prototypes underneath
class Cat extends Animal {
  speak() { return super.speak() + ' (meow)'; }
}
const c = new Cat('Tom');
console.log(c.speak());
console.log('class method lives on prototype:', Object.hasOwn(Cat.prototype, 'speak'));
console.log('Cat.prototype -> Animal.prototype:', Object.getPrototypeOf(Cat.prototype) === Animal.prototype);`;

const ex4 = `// Object.create, Object.setPrototypeOf and objects without a prototype
const vehicleProto = {
  start() { return this.brand + ' engine started'; },
  wheels: 4,
};

const car = Object.create(vehicleProto, {
  brand: { value: 'Tata', enumerable: true },
});
console.log(car.start(), '| wheels:', car.wheels);

const bike = { brand: 'Hero', wheels: 2 };
Object.setPrototypeOf(bike, vehicleProto);   // works, but slow - avoid in hot code
console.log(bike.start(), '| wheels (own, shadows proto):', bike.wheels);

// A "pure dictionary" with no prototype at all
const dict = Object.create(null);
dict.apple = 'a fruit';
console.log('toString in dict?', 'toString' in dict, '| in {}?', 'toString' in {});

// for...in also walks inherited ENUMERABLE keys - Object.keys does not
for (const key in car) console.log('for...in key:', key);
console.log('Object.keys:', Object.keys(car));`;

const ex5 = `// Extending built-in prototypes: how polyfills work (and why not to abuse it)
if (!Array.prototype.last) {
  Object.defineProperty(Array.prototype, 'last', {
    value: function () { return this[this.length - 1]; },
    enumerable: false,       // keep for...in loops clean
    configurable: true,
    writable: true,
  });
}
console.log([10, 20, 30].last());

// A simple polyfill-style implementation of map, to understand prototypes
Array.prototype.myMap = function (callback) {
  const out = [];
  for (let i = 0; i < this.length; i++) out.push(callback(this[i], i, this));
  return out;
};
console.log([1, 2, 3].myMap((n) => n * 10));

// Why it is risky: enumerable additions leak into for...in
for (const i in ['x']) console.log('for...in index/key:', i);
delete Array.prototype.myMap;   // clean up
console.log('after cleanup:', typeof [].myMap);`;

export default {
  id: 'day-37-prototypes',
  title: 'Prototypes and Prototypal Inheritance',
  module: 'Module 6: Advanced JavaScript',
  day: 37,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Prototypes are how JavaScript objects share behaviour: every object has a hidden link to another object it can borrow properties from. Classes (Day 36) are built on top of this mechanism, so understanding prototypes explains how inheritance really works.',
  objectives: [
    'Explain [[Prototype]], __proto__, Object.getPrototypeOf and the prototype chain',
    'Describe how property lookup walks the chain and how shadowing works',
    'Use constructor functions with .prototype to share methods',
    'Implement inheritance with Object.create and connect it to class syntax',
    'Know when extending built-in prototypes is acceptable (polyfills) and when it is harmful',
  ],
  theory: [
    {
      heading: 'What is a Prototype?',
      content:
        'Every JavaScript object has a hidden internal link called **[[Prototype]]** that points to another object (or `null`). That other object is its **prototype**.\n\nWhen you read a property that the object does not have, JavaScript automatically looks in its prototype, then in the prototype\'s prototype, and so on. This is called the **prototype chain**.\n\nAnalogy: you ask your parent for something; if they don\'t have it they ask grandparent, then great-grandparent, until someone has it or there is nobody left to ask (`null`) → `undefined`.\n\nThat is why `[1,2].map` works even though your array has no own `map` property – it is found on `Array.prototype`.',
      syntax: `const arr = [1, 2];
// arr --> Array.prototype --> Object.prototype --> null
Object.getPrototypeOf(arr) === Array.prototype; // true`,
    },
    {
      heading: '__proto__ vs prototype (the confusing part)',
      content:
        'Two different things with similar names:\n\n- **`obj.__proto__`** (better: `Object.getPrototypeOf(obj)`) – the actual prototype **of an object**: where lookups go next. Every object has one.\n- **`Fn.prototype`** – a property that exists on **functions** (and classes). It is the object that will become the `__proto__` of instances created with `new Fn()`.\n\nSo: `Object.getPrototypeOf(new Person()) === Person.prototype`.\n\nAlso, `Person.prototype.constructor === Person` points back to the function.',
      points: [
        'Use Object.getPrototypeOf / Object.setPrototypeOf instead of __proto__ in modern code',
        'Object.create(proto) makes a new object whose prototype is proto',
        'Arrow functions have no .prototype and cannot be used with new',
      ],
      tip: 'Interview one-liner: "prototype is a property of constructor functions; __proto__ is the property of every object that points to its constructor\'s prototype."',
    },
    {
      heading: 'Property Lookup, Own Properties and Shadowing',
      content:
        '**Reading** a property walks up the chain. **Writing** a property always creates/updates an **own** property on the object itself – it never modifies the prototype.\n\nIf an object has an own property with the same name as one on its prototype, the own one **shadows** (hides) the prototype one.\n\nChecking ownership:\n- `Object.hasOwn(obj, "key")` (modern) or `obj.hasOwnProperty("key")`\n- `"key" in obj` – true if found **anywhere** on the chain\n- `Object.keys(obj)` – own enumerable keys only\n- `for...in` – own **and inherited** enumerable keys',
    },
    {
      heading: 'Constructor Functions and Shared Methods',
      content:
        'Before `class`, we wrote a normal function and called it with `new`. Instance data goes on `this`; methods go on `Fn.prototype` so they are stored **once** and shared, instead of being recreated for every instance.\n\nBecause instances only **link** to the prototype, adding a method to the prototype later makes it instantly available to all existing instances.',
      syntax: `function Person(name) { this.name = name; }
Person.prototype.greet = function () { return 'Hi ' + this.name; };
const p = new Person('Asha');
p.greet(); // 'Hi Asha'`,
      tip: 'Do not define methods with arrow functions on the prototype – arrows do not get their own this, so this.name would be undefined.',
    },
    {
      heading: 'Prototypal Inheritance and Classes',
      content:
        'To make `Dog` inherit from `Animal` without classes:\n1. Call the parent constructor: `Animal.call(this, name)`\n2. Link prototypes: `Dog.prototype = Object.create(Animal.prototype)`\n3. Fix the constructor: `Dog.prototype.constructor = Dog`\n\n`class Dog extends Animal` does all of this for you. **Classes are syntactic sugar over prototypes** – class methods live on `Class.prototype`, and `extends` links the prototypes.\n\n`instanceof` works by checking whether `Fn.prototype` appears anywhere in the object\'s prototype chain.',
    },
    {
      heading: 'Object.create, null Prototypes and Built-in Prototypes',
      content:
        '- `Object.create(proto)` – create an object with a chosen prototype (simple inheritance without constructors)\n- `Object.create(null)` – an object with **no** prototype: a clean dictionary with no inherited keys like `toString`\n- `Object.setPrototypeOf(obj, proto)` – change the prototype later (works but is slow; avoid in performance-critical code)\n\nYou **can** add methods to built-in prototypes (`Array.prototype.last = ...`). This is called **monkey patching**. It is only acceptable for **polyfills** (adding a standard feature to old browsers). Otherwise it can clash with future JavaScript features or other libraries (the famous "smoosh" incident, where `Array.prototype.flatten` from an old library forced the standard to use the name `flat`).',
      tip: 'Coming next (Day 38): call, apply and bind – controlling this, which we used above with Animal.call(this, name).',
    },
  ],
  examples: [
    {
      title: 'Exploring the prototype chain',
      scenario: 'Find out where array methods come from and how lookup falls back to the prototype.',
      steps: [
        'Compare Object.getPrototypeOf(arr) with Array.prototype',
        'Follow the chain up to null',
        'Create rabbit with Object.create(animal) and read inherited properties',
        'Click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        "true\ntrue\nnull\nown map? false | can use map? function\nown toString on obj? false | [object Object]\ntrue true eats: true\n[ 'jumps' ]\nmissing -> undefined",
      explanation:
        'Arrays link to Array.prototype, which links to Object.prototype, whose prototype is null. rabbit only owns "jumps"; eats and describe are found on animal. Inside describe, this is rabbit (the object before the dot).',
    },
    {
      title: 'Constructor functions and Person.prototype',
      scenario: 'Create people with shared methods the pre-class way and observe shadowing.',
      steps: [
        'Write function Person(name, age) that sets this.name and this.age',
        'Add greet to Person.prototype',
        'Create two people, compare their greet methods',
        'Add birthday later, then shadow greet on p1 only. Click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        'Hi, I am Asha | Hi, I am Ravi\nshared method? true\np1.__proto__ === Person.prototype: true\nPerson.prototype.constructor === Person: true\np2 birthday -> 31\nNamaste! | Hi, I am Ravi',
      explanation:
        'Both instances share one greet function. Methods added to the prototype later are visible to existing instances. Assigning p1.greet creates an OWN property that shadows the prototype method only for p1.',
    },
    {
      title: 'Inheritance with Object.create vs class extends',
      scenario: 'Build Animal → Dog manually, then the same with class syntax, and compare the chains.',
      steps: [
        'Write Animal and Dog constructor functions',
        'Call Animal.call(this, name) inside Dog',
        'Link with Object.create and fix the constructor',
        'Write class Cat extends Animal and inspect its prototype, click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        'Rex makes a sound (woof!)\ntrue true\nchain: true -> true -> true\nTom makes a sound (meow)\nclass method lives on prototype: true\nCat.prototype -> Animal.prototype: true',
      explanation:
        'The manual version and class extends produce the same structure. A class can even extend a plain constructor function, which proves classes are built on prototypes.',
    },
    {
      title: 'Object.create, setPrototypeOf and null-prototype objects',
      scenario: 'Create objects with chosen prototypes, and a clean dictionary with none.',
      steps: [
        'Create car with Object.create(vehicleProto, descriptors)',
        'Re-link bike with Object.setPrototypeOf',
        'Create a dictionary with Object.create(null)',
        'Compare for...in and Object.keys, click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        "Tata engine started | wheels: 4\nHero engine started | wheels (own, shadows proto): 2\ntoString in dict? false | in {}? true\nfor...in key: brand\nfor...in key: start\nfor...in key: wheels\nObject.keys: [ 'brand' ]",
      explanation:
        'for...in visits inherited enumerable properties (start, wheels) too, while Object.keys only returns own keys. An Object.create(null) object has no toString at all.',
    },
    {
      title: 'Extending built-in prototypes (polyfill style)',
      scenario: 'Add a last() helper and a myMap implementation to arrays, and see the risk.',
      steps: [
        'Add last with Object.defineProperty and enumerable: false',
        'Add myMap with plain assignment (enumerable!)',
        'Loop an array with for...in to see the leak',
        'Delete myMap and click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result: '30\n[ 10, 20, 30 ]\nfor...in index/key: 0\nfor...in index/key: myMap\nafter cleanup: undefined',
      explanation:
        'Every array sees new prototype methods. A plainly assigned method is enumerable, so for...in loops pick it up ("myMap") – one reason to never use for...in on arrays and to avoid patching built-ins outside real polyfills.',
    },
  ],
  interview: [
    {
      q: 'What is the prototype chain?',
      a: 'The series of links from an object to its prototype, to that prototype\'s prototype, ending at null. Property lookups that fail on the object continue up this chain.',
      level: 'Easy',
    },
    {
      q: 'Difference between __proto__ and prototype?',
      a: '__proto__ (or Object.getPrototypeOf) is the actual prototype of any object. prototype is a property of constructor functions/classes; it becomes the __proto__ of instances created with new.',
      level: 'Medium',
    },
    {
      q: 'Are JavaScript classes real classes like in Java?',
      a: 'No. They are syntactic sugar over constructor functions and prototypal inheritance. Methods are placed on Class.prototype and extends links prototype objects.',
      level: 'Medium',
    },
    {
      q: 'How does instanceof work?',
      a: 'obj instanceof Fn checks whether Fn.prototype appears anywhere in obj\'s prototype chain.',
      level: 'Medium',
    },
    {
      q: 'What does Object.create(null) do and why use it?',
      a: 'Creates an object with no prototype, so it has no inherited properties like toString or hasOwnProperty. Useful as a pure key-value dictionary (or use Map).',
      level: 'Medium',
    },
    {
      q: 'Why put methods on the prototype instead of inside the constructor?',
      a: 'Methods on the prototype are stored once and shared by all instances. Methods defined inside the constructor are recreated per instance, using more memory.',
      level: 'Easy',
    },
    {
      q: 'What happens when you assign a property that exists on the prototype?',
      a: 'A new own property is created on the object, shadowing the prototype property. The prototype itself is not changed (unless the inherited property is a setter or read-only).',
      level: 'Medium',
    },
    {
      q: 'How do you implement inheritance without class syntax?',
      a: 'function Child(...a) { Parent.call(this, ...a); }\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;',
      level: 'Hard',
    },
    {
      q: 'Should you modify built-in prototypes?',
      a: 'Generally no (monkey patching can collide with future standards or other libraries). The accepted exception is polyfills that add a standard method only if it is missing.',
      level: 'Medium',
    },
    {
      q: 'Output?\nfunction F() {}\nF.prototype.x = 1;\nconst a = new F();\nF.prototype = { x: 2 };\nconst b = new F();\nconsole.log(a.x, b.x);',
      a: '1 2. a keeps a link to the ORIGINAL prototype object. Replacing F.prototype only affects instances created afterwards.',
      level: 'Hard',
    },
    {
      q: 'What is the end of every prototype chain?',
      a: 'null. Object.getPrototypeOf(Object.prototype) === null.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a constructor function Book(title, author) and add a describe() method on its prototype. Create two books and prove they share describe.',
      hint: 'book1.describe === book2.describe',
      solution: `function Book(title, author) {
  this.title = title;
  this.author = author;
}
Book.prototype.describe = function () {
  return this.title + ' by ' + this.author;
};
const b1 = new Book('Wings of Fire', 'A.P.J. Abdul Kalam');
const b2 = new Book('Godan', 'Premchand');
console.log(b1.describe(), b2.describe(), b1.describe === b2.describe);`,
    },
    {
      task: 'Using only Object.create, make a base object shape with area() { return 0 }, and a square object that inherits from it and overrides area using its side.',
      hint: 'const square = Object.create(shape); square.side = 4; square.area = function () {...}',
      solution: `const shape = { area() { return 0; }, describe() { return 'Area: ' + this.area(); } };
const square = Object.create(shape);
square.side = 4;
square.area = function () { return this.side ** 2; };
console.log(square.describe()); // Area: 16
console.log(Object.getPrototypeOf(square) === shape); // true`,
    },
    {
      task: 'Write a function getChain(obj) that returns an array of constructor names along the prototype chain, e.g. getChain([]) → ["Array", "Object"].',
      hint: 'Loop with Object.getPrototypeOf until null; read proto.constructor.name.',
      solution: `function getChain(obj) {
  const names = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    names.push(proto.constructor.name);
    proto = Object.getPrototypeOf(proto);
  }
  return names;
}
console.log(getChain([]));          // [ 'Array', 'Object' ]
class A {} class B extends A {}
console.log(getChain(new B()));     // [ 'B', 'A', 'Object' ]`,
    },
    {
      task: 'Implement Employee and Manager constructor functions (no class) where Manager inherits Employee and adds a team array and addMember().',
      hint: 'Employee.call(this, name); Manager.prototype = Object.create(Employee.prototype);',
      solution: `function Employee(name) { this.name = name; }
Employee.prototype.work = function () { return this.name + ' is working'; };

function Manager(name) {
  Employee.call(this, name);
  this.team = [];
}
Manager.prototype = Object.create(Employee.prototype);
Manager.prototype.constructor = Manager;
Manager.prototype.addMember = function (e) { this.team.push(e.name); return this; };

const m = new Manager('Meera');
m.addMember(new Employee('Ravi'));
console.log(m.work(), m.team, m instanceof Employee);`,
    },
  ],
  quiz: [
    {
      question: 'What does Object.getPrototypeOf([]) return?',
      options: ['Object.prototype', 'Array.prototype', 'null', 'Array'],
      answer: 1,
      explanation: 'Arrays link directly to Array.prototype.',
    },
    {
      question: 'Which object is at the end of every normal prototype chain before null?',
      options: ['Function.prototype', 'Array.prototype', 'Object.prototype', 'window'],
      answer: 2,
      explanation: 'Object.prototype\'s own prototype is null.',
    },
    {
      question: 'Which check returns true ONLY for own properties?',
      options: ['"key" in obj', 'obj.key !== undefined', 'for...in', 'Object.hasOwn(obj, "key")'],
      answer: 3,
      explanation: 'in and for...in include inherited properties.',
    },
    {
      question: 'Where are methods defined in a class body stored?',
      options: ['On ClassName.prototype', 'On every instance', 'On window', 'On the constructor function as static'],
      answer: 0,
      explanation: 'Normal methods are shared through the prototype.',
    },
    {
      question: 'Object.create(null) creates an object that...',
      options: ['Throws an error', 'Is identical to {}', 'Has no prototype at all', 'Inherits from Array'],
      answer: 2,
      explanation: 'It has no inherited properties, not even toString.',
    },
  ],
};
