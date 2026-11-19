export default {
  lesson: 'day-014-method-overloading-optional-named-arguments',
  minutes: 16,
  intro: 'Practise method overloading (same name, different parameters), optional parameters with defaults and named arguments.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which pair of methods is a **valid overload**?',
      options: [
        'int Area(int s) and double Area(int s)',
        'int Area(int s) and int Area(int l, int b)',
        'int Area(int side) and int Area(int length)',
        'void Area(int s) and static void Area(int s)',
      ],
      answer: 1,
      explain: 'Overloads must differ in their **parameter list** (number, types or order). The return type, parameter names or `static` alone are not enough, so options 1, 3 and 4 give "already defines a member" errors.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which overload is called each time? What does this print?',
      example: { title: 'the compiler picks the best match', code: 'static void P(int x) => Console.WriteLine("int");\nstatic void P(string x) => Console.WriteLine("string");\nP(10);    // int\nP("10");  // string' },
      code: `static void Show(int x) => Console.WriteLine("int " + x);
static void Show(double x) => Console.WriteLine("double " + x);
static void Show(string x) => Console.WriteLine("string " + x);

static void Main()
{
    Show(5);
    Show(2.5);
    Show("5");
    Show(7.0);
}`,
      expected: `int 5
double 2.5
string 5
double 7`,
      explain: 'The compiler picks the overload that matches the **argument type** exactly. `7.0` is a double literal, so `Show(double)` runs, and C# prints the double 7.0 as just `7`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Optional parameters and named arguments: what does this print?',
      example: { title: 'default values', code: 'static void Greet(string name, string msg = "Welcome")\n    => Console.WriteLine($"{msg}, {name}");\nGreet("Asha");               // Welcome, Asha\nGreet("Ravi", msg: "Hello"); // Hello, Ravi' },
      code: `static double Bill(double amount, double gst = 18, double discount = 0)
{
    return amount + amount * gst / 100 - discount;
}
static void Main()
{
    Console.WriteLine(Bill(1000));
    Console.WriteLine(Bill(1000, 5));
    Console.WriteLine(Bill(1000, discount: 100));
    Console.WriteLine(Bill(discount: 50, amount: 200, gst: 0));
}`,
      expected: `1180
1050
1080
150`,
      explain: 'Missing optional arguments use their default values (gst 18, discount 0). **Named arguments** let you skip `gst` and set only `discount`, and even pass arguments in any order. 1000 + 180 = 1180; 1000 + 50 = 1050; 1180 - 100 = 1080; 200 + 0 - 50 = 150.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Given `static void Register(string name, int age = 18, string city = "Pune")`, write the call that registers **"Meena"** with city **"Delhi"** and the default age, using a **named argument**.',
      example: { title: 'named argument syntax', code: 'SendSms("98xxxx", priority: "high");' },
      accept: ['Register("Meena", city: "Delhi");', 'Register(name: "Meena", city: "Delhi");', 'Register(city: "Delhi", name: "Meena");'],
      acceptRegex: ['^Register\\s*\\(\\s*(name\\s*:\\s*)?"Meena"\\s*,\\s*city\\s*:\\s*"Delhi"\\s*\\)\\s*;?$', '^Register\\s*\\(\\s*city\\s*:\\s*"Delhi"\\s*,\\s*name\\s*:\\s*"Meena"\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'The syntax is `parameterName: value`. Without the name, `Register("Meena", "Delhi")` would try to pass "Delhi" to `age` and fail to compile.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which rules about optional parameters are TRUE? (choose all that apply)',
      options: [
        'Optional parameters must come after all required parameters',
        'The default value must be a compile-time constant (like 18 or "Pune")',
        'You can use DateTime.Now as a default value',
        'Named arguments can be combined with positional arguments',
      ],
      answers: [0, 1, 3],
      explain: 'Required parameters come first, then optional ones. Defaults must be constants (`DateTime.Now` is computed at runtime, so it is not allowed; use `DateTime? date = null` and set it inside the method). Positional arguments followed by named ones are fine.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Method overloading is an example of which kind of polymorphism?',
      options: ['Runtime polymorphism', 'Compile-time (static) polymorphism', 'Encapsulation', 'Inheritance'],
      answer: 1,
      explain: 'The compiler decides which overload to call while **compiling**, based on the argument types, so it is **compile-time polymorphism**. Method overriding with `virtual`/`override` is runtime polymorphism.',
    },
  ],
};
