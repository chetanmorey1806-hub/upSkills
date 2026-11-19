export default {
  lesson: 'day-16-methods-overloading-pass-by-value',
  minutes: 22,
  intro: 'Write methods, predict which overload Java picks and prove that Java is always pass-by-value.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Pass-by-value: what does this program print?',
      example: {
        title: 'a copy of the value is passed',
        code: `static void add(int n) { n = n + 1; }
int k = 5; add(k); // k is still 5`,
      },
      code: `public class Main {
    static void change(int x) {
        x = 100;
    }
    static void change(int[] arr) {
        arr[0] = 100;
    }
    static void reassign(int[] arr) {
        arr = new int[]{7, 7};
    }
    public static void main(String[] args) {
        int a = 5;
        change(a);
        System.out.println(a);
        int[] nums = {1, 2};
        change(nums);
        System.out.println(nums[0]);
        reassign(nums);
        System.out.println(nums[0]);
    }
}`,
      expected: `5
100
100`,
      explain: 'Java **always passes a copy**. For an int the copy is the number, so `a` stays 5. For an array the copy is the **reference**: both point to the same array, so `arr[0] = 100` is visible outside. But `reassign` only points its own copy to a new array; the caller\'s `nums` is untouched.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Which overload is called? What does this program print?',
      example: {
        title: 'exact match wins',
        code: `static void p(int x) { ... }
static void p(double x) { ... }
p(5);   // calls p(int)`,
      },
      code: `public class Main {
    static void show(long x)    { System.out.println("long"); }
    static void show(Integer x) { System.out.println("Integer"); }
    static void show(Object x)  { System.out.println("Object"); }

    public static void main(String[] args) {
        show(5);
        show('A');
        show("hi");
        show(5.0);
    }
}`,
      expected: `long
long
Object
Object`,
      explain: 'Java tries, in order: exact match → **widening** → boxing → varargs. `5` is an int: widening to long is preferred over boxing to Integer. A char also widens to long. "hi" only fits Object. `5.0` cannot widen to long, so it is boxed to Double, which is an Object.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the method header so the method can be called with **any number** of int arguments: \`sum()\`, \`sum(4)\`, \`sum(1, 2, 3)\`.
\`static int sum(____) {\``,
      example: {
        title: 'varargs with Strings',
        code: `static void greet(String... names) {
    for (String n : names) System.out.println("Hi " + n);
}`,
      },
      accept: ['int... nums', 'int... numbers', 'int... n', 'int... values', 'int... a', 'int ... nums', 'int...nums'],
      acceptRegex: [
        '^int\\s*\\.\\s*\\.\\s*\\.\\s*nums\\s*[;{]?$',
        '^int\\s*\\.\\s*\\.\\s*\\.\\s*numbers\\s*[;{]?$',
        '^int\\s*\\.\\s*\\.\\s*\\.\\s*n\\s*[;{]?$',
        '^int\\s*\\.\\s*\\.\\s*\\.\\s*values\\s*[;{]?$',
        '^int\\s*\\.\\s*\\.\\s*\\.\\s*a\\s*[;{]?$',
        '^int\\s*\\.\\.\\.\\s*[A-Za-z_$][\\w$]*$',
      ],
      caseSensitive: true,
      explain: '**Varargs** `int... nums` lets the caller pass 0 or more ints; inside the method `nums` is an `int[]`. A method can have only one varargs parameter and it must be the **last** parameter.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which **return type** must this method have?
\`static ____ average(int a, int b) { return (a + b) / 2.0; }\``,
      example: { title: 'a method returning text', code: 'static String grade(int m) { return m >= 60 ? "First" : "Second"; }' },
      accept: ['double'],
      acceptRegex: ['^double\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`(a + b) / 2.0` is int / double → **double**. Declaring the method `int` would be a compile error ("possible lossy conversion"), and `void` cannot return a value.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which pair is a **valid overload** (both methods can exist in the same class)?',
      options: [
        'int area(int s) and double area(int s)',
        'int area(int s) and int area(int l, int b)',
        'void area(int s) and void area(int side)',
        'int area(int s) and static int area(int s)',
      ],
      answer: 1,
      explain: 'Overloads must differ in the **parameter list** (number, type or order). The return type, parameter names or the `static` keyword alone do not make a different signature, so those pairs are "already defined" compile errors.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is printed by `System.out.println(fact(4));` with `static int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }`?',
      options: ['4', '10', '24', 'StackOverflowError'],
      answer: 2,
      explain: 'fact(4) = 4 × fact(3) = 4 × 3 × fact(2) = 4 × 3 × 2 × fact(1) = **24**. The base case `n <= 1` stops the recursion; without it the calls would never end and cause StackOverflowError.',
    },
  ],
};
