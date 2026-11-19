export default {
  lesson: 'extra-20-func-action-predicate',
  minutes: 20,
  intro: 'Use the built-in generic delegates Func, Action and Predicate instead of declaring your own.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In `Func<int, string, bool>`, what is the **return** type?',
      options: ['int', 'string', 'bool', 'void'],
      answer: 2,
      explain: 'The **last** type argument of `Func` is always the return type. `Func<int, string, bool>` takes an int and a string and returns a bool.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match each built-in delegate correctly. Which statements are TRUE?',
      options: ['`Action<T>` returns void', '`Predicate<T>` takes one T and returns bool', '`Func<T>` with one type argument takes one parameter and returns void', '`Func<TResult>` takes no parameters and returns TResult', '`Action` can return a value with `Action<TResult>`'],
      answers: [0, 1, 3],
      explain: '`Action` = no return value; `Func<..., TResult>` = returns the last type; `Predicate<T>` = `bool` test of one T (used by `List.FindAll`, `RemoveAll`). `Func<T>` has zero parameters and returns T.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare the delegate type for a method that takes a \`decimal\` price and an \`int\` qty and returns the \`decimal\` total:
\`______ total = (price, qty) => price * qty;\``,
      example: { title: 'Func with two inputs', code: 'Func<string, int, string> repeat = (s, n) => string.Concat(Enumerable.Repeat(s, n));' },
      accept: ['Func<decimal, int, decimal>', 'Func<decimal,int,decimal>'],
      acceptRegex: ['^Func\\s*<\\s*decimal\\s*,\\s*int\\s*,\\s*decimal\\s*>$'],
      caseSensitive: true,
      explain: 'Inputs first, return type last: `Func<decimal, int, decimal>`. Writing the return type first is the typical mistake.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'Action and Predicate', code: `Action<string> hello = n => Console.WriteLine($"Hi {n}");
Predicate<int> isAdult = age => age >= 18;` },
      code: `Func<int, int, int> max = (a, b) => a > b ? a : b;
Action<string, int> repeat = (s, n) => Console.WriteLine(string.Concat(Enumerable.Repeat(s, n)));
Predicate<string> isShort = s => s.Length <= 4;

Console.WriteLine(max(17, 42));
repeat("ab", 3);
Console.WriteLine(isShort("Pune"));
Console.WriteLine(isShort("Mumbai"));`,
      expected: `42
ababab
True
False`,
      explain: '`max` returns the larger value, 42. `repeat` is an Action, so it prints but returns nothing: "ab" three times. "Pune" has 4 letters (≤ 4 → True); "Mumbai" has 6 → False.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`Predicate<T>` with `List<T>` methods. What does this print?',
      example: { title: 'List methods that take a Predicate', code: `list.Find(x => x > 10);
list.FindAll(x => x > 10);
list.RemoveAll(x => x < 0);` },
      code: `var ages = new List<int> { 12, 25, 17, 40, 8, 19 };
Predicate<int> adult = a => a >= 18;
Console.WriteLine(ages.Find(adult));
Console.WriteLine(ages.FindAll(adult).Count);
int removed = ages.RemoveAll(a => a < 10);
Console.WriteLine(removed);
Console.WriteLine(string.Join(",", ages));
Console.WriteLine(ages.Exists(a => a > 50));`,
      expected: `25
3
1
12,25,17,40,19
False`,
      explain: '`Find` returns the **first** match: 25. `FindAll` returns 25, 40, 19 → 3. `RemoveAll` deletes the 8 and returns how many were removed (1). No age is above 50, so `Exists` is False.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Passing a `Func` into a method. What does this print?',
      example: { title: 'higher-order method', code: 'static int Apply(int x, Func<int, int> f) => f(x);' },
      code: `Func<int, int> twice = x => x * 2;
Func<int, int> plusFive = x => x + 5;
Console.WriteLine(Compose(3, twice, plusFive));
Console.WriteLine(Compose(3, plusFive, twice));

static int Compose(int v, Func<int, int> first, Func<int, int> second) => second(first(v));`,
      expected: `11
16`,
      explain: 'First call: twice(3) = 6, then plusFive → 11. Second call: plusFive(3) = 8, then twice → 16. The order in which functions are applied changes the result.',
    },
  ],
};
