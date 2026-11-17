const STEPS = [
  'IntelliJ: File > New > Java Class > name it Main (Eclipse: File > New > Class, Name = Main, tick "public static void main")',
  'Type the code (all classes can stay in Main.java; only Main is public)',
  'Click Run ▶ (IntelliJ Shift+F10 / Eclipse Ctrl+F11) and compare the console with the expected output',
];

const ex1 = `public class Main {
    // no parameters, no return value
    static void line() {
        System.out.println("----------");
    }

    // one parameter, no return value
    static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // two parameters, returns an int
    static int add(int a, int b) {
        return a + b;
    }

    // array parameter, returns a double
    static double average(int[] marks) {
        int sum = 0;
        for (int m : marks) {
            sum += m;
        }
        return (double) sum / marks.length;
    }

    // returns a boolean
    static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        line();
        greet("Asha");
        int total = add(15, 27);
        System.out.println("Sum = " + total);
        System.out.println("Average = " + average(new int[]{80, 75, 91}));
        System.out.println("Is 14 even? " + isEven(14));
        System.out.println("Is 7 even? " + isEven(7));
        line();
    }
}`;

const ex2 = `class Calculator {
    int add(int a, int b) {
        System.out.print("add(int,int) -> ");
        return a + b;
    }

    int add(int a, int b, int c) {
        System.out.print("add(int,int,int) -> ");
        return a + b + c;
    }

    double add(double a, double b) {
        System.out.print("add(double,double) -> ");
        return a + b;
    }

    String add(String a, String b) {
        System.out.print("add(String,String) -> ");
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator c = new Calculator();
        System.out.println(c.add(2, 3));
        System.out.println(c.add(1, 2, 3));
        System.out.println(c.add(2.5, 3.5));
        System.out.println(c.add("Java", "17"));
        System.out.println(c.add(5, 2.5));   // int 5 is widened to double
    }
}`;

const ex3 = `public class Main {
    static void show(int x)     { System.out.println("int: " + x); }
    static void show(long x)    { System.out.println("long: " + x); }
    static void show(double x)  { System.out.println("double: " + x); }
    static void show(Integer x) { System.out.println("Integer: " + x); }
    static void show(Object x)  { System.out.println("Object: " + x); }

    public static void main(String[] args) {
        byte b = 10;
        show(b);        // byte -> int (nearest widening)
        show('A');      // char -> int, prints 65
        show(10L);      // exact match long
        show(3.5f);     // float -> double
        show("hi");     // String IS-A Object
        Integer boxed = 7;
        show(boxed);    // exact match Integer
    }
}`;

const ex4 = `class Box {
    int value;
    Box(int value) {
        this.value = value;
    }
}

public class Main {
    static void changePrimitive(int x) {
        x = 100;                 // changes only the local copy
    }

    static void changeObject(Box b) {
        b.value = 100;           // copy of reference still points to the same object
    }

    static void reassign(Box b) {
        b = new Box(999);        // local copy now points to a NEW object
        b.value = 500;
    }

    static void swap(int a, int b) {
        int t = a;
        a = b;
        b = t;
    }

    public static void main(String[] args) {
        int n = 10;
        changePrimitive(n);
        System.out.println("n after changePrimitive: " + n);

        Box box = new Box(10);
        changeObject(box);
        System.out.println("box.value after changeObject: " + box.value);

        reassign(box);
        System.out.println("box.value after reassign: " + box.value);

        int p = 1, q = 2;
        swap(p, q);
        System.out.println("p=" + p + ", q=" + q);
    }
}`;

const ex5 = `public class Main {
    // varargs: zero or more ints, treated as an int[] inside
    static int sum(int... nums) {
        int s = 0;
        for (int n : nums) {
            s += n;
        }
        return s;
    }

    // recursion: a method calling itself
    static int factorial(int n) {
        if (n <= 1) {
            return 1;            // base case
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println("sum() = " + sum());
        System.out.println("sum(5) = " + sum(5));
        System.out.println("sum(1,2,3,4) = " + sum(1, 2, 3, 4));
        System.out.println("5! = " + factorial(5));
    }
}`;

const pr1 = `public class Main {
    static int max(int a, int b) { return a > b ? a : b; }
    static int max(int a, int b, int c) { return max(max(a, b), c); }
    static double max(double a, double b) { return a > b ? a : b; }

    public static void main(String[] args) {
        System.out.println(max(4, 9));        // 9
        System.out.println(max(4, 9, 6));     // 9
        System.out.println(max(2.5, 1.5));    // 2.5
    }
}`;

const pr2 = `public class Main {
    static double area(double radius) { return Math.PI * radius * radius; }
    static int area(int length, int breadth) { return length * breadth; }
    static double area(double base, double height, boolean triangle) { return 0.5 * base * height; }

    public static void main(String[] args) {
        System.out.printf("Circle: %.2f%n", area(2.0));        // 12.57
        System.out.println("Rectangle: " + area(4, 5));        // 20
        System.out.println("Triangle: " + area(6.0, 4.0, true)); // 12.0
    }
}`;

const pr3 = `public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 20; i++) {
            if (isPrime(i)) System.out.print(i + " ");
        }
        System.out.println();   // 2 3 5 7 11 13 17 19
    }
}`;

const pr4 = `public class Main {
    static void doubleAll(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            arr[i] = arr[i] * 2;
        }
    }

    public static void main(String[] args) {
        int[] data = {1, 2, 3};
        doubleAll(data);
        for (int d : data) System.out.print(d + " ");   // 2 4 6
        System.out.println();
        // The array object is shared: the method received a copy of the REFERENCE.
    }
}`;

export default {
  id: 'day-16-methods-overloading-pass-by-value',
  title: 'Methods, Parameters, Return Types, Method Overloading and Pass-by-Value',
  module: 'Module 3: Object-Oriented Programming',
  day: 16,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn how to write reusable methods with parameters and return types, how Java picks the right overloaded method, and why Java is always pass-by-value (even for objects).',
  objectives: [
    'Write methods with different parameter lists and return types',
    'Overload methods correctly and predict which overload Java calls',
    'Explain pass-by-value for primitives and object references',
    'Use varargs and simple recursion',
  ],
  theory: [
    {
      heading: 'What is a Method?',
      content:
        'A method is a named block of code that does one job. Think of it like a coffee machine: you put inputs in (water, beans = parameters), press a button (call the method) and get an output (coffee = return value). Writing logic once in a method and calling it many times avoids copy-paste and makes code easier to test and change.',
      syntax: `accessModifier [static] returnType methodName(type param1, type param2) {
    // body
    return value;   // only if returnType is not void
}`,
      points: [
        'Method signature = method name + parameter list (types, order, count). Return type is NOT part of the signature.',
        'void means the method returns nothing.',
        'static methods can be called without an object (Main.add(2,3) or just add(2,3) inside Main).',
        'Instance (non-static) methods need an object: calc.add(2,3).',
        'Naming: camelCase verbs such as calculateTotal(), isValid(), getName().',
      ],
    },
    {
      heading: 'Parameters vs Arguments and Return Types',
      content:
        'Parameters are the variables in the method definition; arguments are the actual values you pass when calling. Diagram: add(int a, int b)  <-- parameters;  add(15, 27)  <-- arguments. The return statement sends a value back to the caller and immediately exits the method. The returned value must be compatible with the declared return type (an int can be returned from a double method because of widening).',
      points: [
        'A method can return only ONE value; to return many, return an array or an object.',
        'Every code path of a non-void method must return a value, otherwise compile error "missing return statement".',
        'Code written directly after return in the same block is "unreachable statement" (compile error).',
      ],
      tip: 'Keep methods small: one method = one task. If you need the word "and" to describe it, split it.',
    },
    {
      heading: 'Method Overloading (Compile-time Polymorphism)',
      content:
        'Overloading means same method name, different parameter list in the same class. Real life: a "print" button that works for a photo, a PDF or a text file. The compiler chooses which version to call by looking at the argument types at compile time, so overloading is also called static binding or compile-time polymorphism.',
      points: [
        'Allowed: different number of parameters, different types, different order of types.',
        'NOT allowed: changing only the return type or only parameter names (compile error: method already defined).',
        'Overload resolution order: 1) exact match / widening of primitives, 2) boxing/unboxing, 3) varargs.',
        'Among candidates, the most specific one wins: show(null) with show(String) and show(Object) calls show(String).',
        'If two candidates are equally specific, the call is ambiguous (compile error).',
      ],
      syntax: `void print(int x)
void print(double x)
void print(String s)
void print(int x, int y)`,
    },
    {
      heading: 'Type Promotion in Overloading',
      content:
        'If no exact match exists, Java widens primitives step by step: byte -> short -> int -> long -> float -> double, and char -> int. It picks the closest widening. Example: with show(int) and show(long), calling show(b) where b is a byte calls show(int). Widening always beats boxing, and boxing beats varargs.',
      points: [
        'show(\'A\') with show(int) available prints 65 (the Unicode value).',
        'A long argument will never be narrowed to int automatically.',
        'Integer argument with show(Integer) and show(Object): exact Integer wins.',
      ],
    },
    {
      heading: 'Pass-by-Value: The Golden Rule',
      content:
        'Java is ALWAYS pass-by-value. The method receives a COPY of what the variable holds. For a primitive, the variable holds the value, so the method gets a copy of the number and changes do not affect the caller. For an object, the variable holds a reference (like a house address written on paper). The method gets a photocopy of the address: it can walk to the same house and repaint it (change fields), but if it writes a new address on its photocopy (b = new Box()), the caller\'s paper does not change.',
      points: [
        'Modifying fields through a reference parameter IS visible to the caller.',
        'Reassigning the parameter to a new object is NOT visible to the caller.',
        'This is why a classic swap(int a, int b) method cannot swap the caller\'s variables.',
        'Strings are immutable, so s = s + "x" inside a method never changes the caller\'s String.',
      ],
      tip: 'Interview line: "Java passes object references by value." Never say Java is pass-by-reference.',
    },
    {
      heading: 'Varargs and Recursion',
      content:
        'Varargs (type... name) lets a method accept zero or more arguments; inside the method it behaves like an array. Only one varargs parameter is allowed and it must be the last one. Recursion is a method calling itself; it always needs a base case, otherwise you get StackOverflowError. Picture recursion as a stack of plates: each call puts a plate on top, and plates are removed (returned) in reverse order.',
      syntax: `static int sum(int... nums) { ... }      // sum(), sum(1), sum(1,2,3)
static int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }`,
    },
  ],
  examples: [
    {
      title: 'Methods with Different Parameters and Return Types',
      scenario: 'A school app needs small reusable helpers: greet a student, add marks, find the average and check even numbers.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `----------
Hello, Asha!
Sum = 42
Average = 82.0
Is 14 even? true
Is 7 even? false
----------`,
      explanation:
        'line() and greet() are void methods. add() returns 42. average() sums 80+75+91 = 246 and divides by 3 after casting to double, giving 82.0. isEven() returns a boolean that is concatenated into the output.',
    },
    {
      title: 'Method Overloading in a Calculator',
      scenario: 'One method name add() should work for 2 ints, 3 ints, 2 doubles and 2 Strings.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `add(int,int) -> 5
add(int,int,int) -> 6
add(double,double) -> 6.0
add(String,String) -> Java17
add(double,double) -> 7.5`,
      explanation:
        'The argument c.add(...) is evaluated before println runs, so the method\'s print appears first on the same line, then println prints the result. For add(5, 2.5) there is no (int,double) version, so 5 is widened to 5.0 and add(double,double) is called.',
    },
    {
      title: 'Which Overload Gets Called? (Type Promotion)',
      scenario: 'A classic interview trick: predict the overload chosen for byte, char, long, float and String arguments.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `int: 10
int: 65
long: 10
double: 3.5
Object: hi
Integer: 7`,
      explanation:
        'byte has no exact match, nearest widening is int. char widens to int so \'A\' prints 65. 10L exactly matches long. 3.5f widens to double. String has no exact match but String IS-A Object. boxed is an Integer, exact match for show(Integer).',
    },
    {
      title: 'Pass-by-Value with Primitives and Objects',
      scenario: 'Prove that Java copies values: primitives are untouched, object fields can change, but reassignment is invisible to the caller.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `n after changePrimitive: 10
box.value after changeObject: 100
box.value after reassign: 100
p=1, q=2`,
      explanation:
        'changePrimitive changes its own copy of 10. changeObject uses the copied reference to reach the SAME Box, so value becomes 100. reassign points its local copy to a new Box(999) and sets that new object to 500; the caller\'s box still points to the old object with 100. swap only swaps local copies.',
    },
    {
      title: 'Varargs and Recursion',
      scenario: 'A billing helper must add any number of item prices, and a math helper computes factorial recursively.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `sum() = 0
sum(5) = 5
sum(1,2,3,4) = 10
5! = 120`,
      explanation:
        'With no arguments, nums is an empty array so the sum is 0. factorial(5) = 5*4*3*2*1 = 120; the recursion stops at the base case n <= 1.',
    },
  ],
  interview: [
    {
      q: 'What is method overloading? Is it compile-time or runtime polymorphism?',
      a: 'Defining multiple methods with the same name but different parameter lists (number, type or order) in the same class. The compiler decides which one to call based on argument types, so it is compile-time (static) polymorphism.',
      level: 'Easy',
    },
    {
      q: 'Can we overload methods by changing only the return type?',
      a: 'No. int get() and double get() in the same class give a compile error "method get() is already defined", because the return type is not part of the method signature and the compiler could not decide which to call for a statement like get();',
      level: 'Easy',
    },
    {
      q: 'Is Java pass-by-value or pass-by-reference?',
      a: 'Always pass-by-value. For objects, the value that is copied is the reference. So a method can modify the object\'s state through the copied reference, but reassigning the parameter does not affect the caller\'s variable.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nstatic void m(String s) { System.out.println("String"); }\nstatic void m(Object o) { System.out.println("Object"); }\npublic static void main(String[] a) { m(null); }',
      a: 'Output: String. null fits both, and Java chooses the most specific type. String is a subclass of Object, so m(String) is more specific. If you add m(Integer i) too, m(null) becomes ambiguous (compile error) because String and Integer are unrelated.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nstatic void m(long x) { System.out.println("long"); }\nstatic void m(Integer x) { System.out.println("Integer"); }\nstatic void m(int... x) { System.out.println("varargs"); }\npublic static void main(String[] a) { m(5); }',
      a: 'Output: long. Overload resolution tries widening first (int -> long), then boxing (int -> Integer), then varargs. Widening wins.',
      level: 'Hard',
    },
    {
      q: 'What is the output?\nstatic void change(StringBuilder sb) { sb.append("World"); sb = new StringBuilder("New"); }\npublic static void main(String[] a) { StringBuilder s = new StringBuilder("Hello"); change(s); System.out.println(s); }',
      a: 'Output: HelloWorld. append modifies the shared object. Assigning a new StringBuilder only changes the local copy of the reference.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nstatic void inc(int x) { x++; }\npublic static void main(String[] a) { int x = 5; inc(x); inc(x); System.out.println(x); }',
      a: 'Output: 5. Each call gets a copy of 5 and increments only the copy.',
      level: 'Easy',
    },
    {
      q: 'Can we overload the main() method?',
      a: 'Yes. You can write main(int x) or main(String s) etc. But the JVM only starts the program from public static void main(String[] args). Other versions run only if you call them yourself.',
      level: 'Easy',
    },
    {
      q: 'What are varargs? What are the rules?',
      a: 'Variable-length arguments written as type... name; the method receives an array. Only one varargs parameter per method and it must be the last parameter. Varargs has the lowest priority in overload resolution.',
      level: 'Medium',
    },
    {
      q: 'Will this compile? static void m(Integer a, long b) {} and static void m(long a, Integer b) {} called as m(1, 1);',
      a: 'No. Both need boxing for one argument and widening for the other; neither is more specific, so the compiler reports "reference to m is ambiguous".',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write overloaded max() methods for two ints, three ints and two doubles.',
      hint: 'Reuse the 2-int version inside the 3-int version.',
      solution: pr1,
    },
    {
      task: 'Write overloaded area() methods for a circle, a rectangle and a triangle.',
      hint: 'Parameter lists must differ: (double), (int,int), (double,double,boolean).',
      solution: pr2,
    },
    {
      task: 'Write a boolean isPrime(int n) method and use it to print all primes from 1 to 20.',
      hint: 'Loop i from 2 while i*i <= n.',
      solution: pr3,
    },
    {
      task: 'Write a method that doubles every element of an int array and prove that the caller sees the change.',
      hint: 'The array reference is copied, but both copies point to the same array object.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which of these is part of a method signature in Java?',
      options: ['Return type', 'Method name and parameter types', 'Access modifier', 'Thrown exceptions'],
      answer: 1,
      explanation: 'Signature = method name + parameter list. Return type, modifiers and throws clause are not part of it.',
    },
    {
      question: 'What does show(\'A\') print if only show(int x) { System.out.println(x); } exists?',
      options: ['A', 'Compile error', '65', '97'],
      answer: 2,
      explanation: 'char is widened to int; the code of \'A\' is 65.',
    },
    {
      question: 'Which priority does Java follow in overload resolution?',
      options: [
        'Widening > Boxing > Varargs',
        'Boxing > Widening > Varargs',
        'Varargs > Boxing > Widening',
        'Random choice',
      ],
      answer: 0,
      explanation: 'Exact match/widening first, then boxing/unboxing, and varargs last.',
    },
    {
      question: 'A method sets its object parameter to a new object. What does the caller see?',
      options: ['The new object', 'null', 'A compile error', 'The original object, unchanged by that reassignment'],
      answer: 3,
      explanation: 'Only the local copy of the reference changes; the caller\'s variable still points to the old object.',
    },
    {
      question: 'Where must a varargs parameter appear?',
      options: ['First', 'Anywhere', 'Last', 'It must be the only parameter'],
      answer: 2,
      explanation: 'Varargs must be the last parameter and only one is allowed.',
    },
  ],
};
