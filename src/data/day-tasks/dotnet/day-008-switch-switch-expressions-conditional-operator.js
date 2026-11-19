export default {
  lesson: 'day-008-switch-switch-expressions-conditional-operator',
  minutes: 16,
  intro: 'Practise the switch statement, modern switch expressions and the ternary conditional operator ?:.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'switch statement with grouped cases: what does this print?',
      example: { title: 'grouped cases', code: 'switch (ch)\n{\n    case \'a\':\n    case \'e\':\n        Console.WriteLine("vowel");\n        break;\n    default:\n        Console.WriteLine("other");\n        break;\n}' },
      code: `int[] days = { 1, 6, 7, 9 };
foreach (int d in days)
{
    switch (d)
    {
        case 6:
        case 7:
            Console.WriteLine("Weekend");
            break;
        case 1:
            Console.WriteLine("Monday");
            break;
        default:
            Console.WriteLine("Invalid");
            break;
    }
}`,
      expected: `Monday
Weekend
Weekend
Invalid`,
      explain: 'Empty case labels can be **stacked** (`case 6: case 7:`) so both share one block. Values that match no case go to `default`. Each non-empty section must end with `break` (or return/throw).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens if a non-empty `case` section in C# has **no `break`**, e.g. `case 1: Console.WriteLine("One"); case 2: ...`?',
      options: ['It falls through to case 2 like in C/Java', 'Compile error: control cannot fall through from one case label to another', 'It runs case 1 only', 'It goes to default'],
      answer: 1,
      explain: 'C# forbids implicit fall-through. Each non-empty section must end with `break`, `return`, `throw` or `goto case`. This avoids the classic C/Java bug of forgetting a break.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the **ternary** expression so `result` is "Pass" when `marks >= 35`, otherwise "Fail":\n`string result = __________;`\n(write only the right-hand side)',
      example: { title: 'ternary operator', code: 'string type = age >= 18 ? "Adult" : "Minor";' },
      accept: ['marks >= 35 ? "Pass" : "Fail"', '(marks >= 35) ? "Pass" : "Fail"'],
      acceptRegex: ['^\\(?\\s*marks\\s*>=\\s*35\\s*\\)?\\s*\\?\\s*"Pass"\\s*:\\s*"Fail"\\s*;?$', '^\\(?\\s*marks\\s*<\\s*35\\s*\\)?\\s*\\?\\s*"Fail"\\s*:\\s*"Pass"\\s*;?$'],
      caseSensitive: true,
      explain: '`condition ? valueIfTrue : valueIfFalse` is an **expression** that returns one value, perfect for simple either/or assignments. Both values must be of compatible types.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Switch **expression** (C# 8+): what does this print?',
      example: { title: 'switch expression', code: 'string size = n switch\n{\n    < 10 => "small",\n    < 100 => "medium",\n    _ => "large"\n};' },
      code: `string[] codes = { "MH", "KA", "DL", "GJ" };
foreach (var code in codes)
{
    string state = code switch
    {
        "MH" => "Maharashtra",
        "KA" => "Karnataka",
        "DL" => "Delhi",
        _ => "Unknown"
    };
    Console.WriteLine($"{code}: {state}");
}`,
      expected: `MH: Maharashtra
KA: Karnataka
DL: Delhi
GJ: Unknown`,
      explain: 'A switch expression returns a value: each arm is `pattern => result`, arms are separated by commas and `_` is the **discard** (catch-all) pattern. "GJ" matches nothing else, so it gets "Unknown".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In a switch expression, which symbol is used as the "default / anything else" arm? (just the symbol)',
      example: { title: 'last arm', code: 'var fee = type switch\n{\n    "student" => 100,\n    ? => 250\n};' },
      accept: ['_'],
      explain: 'The **discard pattern `_`** matches any value, so it plays the role of `default`. Without it, an unmatched value throws `SwitchExpressionException` at runtime (and the compiler warns you).',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Relational patterns in a switch expression (C# 9): what does this print?',
      example: { title: 'patterns with and', code: 'string slab = income switch\n{\n    <= 300000 => "Nil",\n    > 300000 and <= 700000 => "5%",\n    _ => "Higher"\n};' },
      code: `int[] temps = { 8, 22, 41 };
foreach (int t in temps)
{
    string feel = t switch
    {
        < 15 => "Cold",
        >= 15 and < 35 => "Pleasant",
        _ => "Hot"
    };
    Console.Write(feel + " ");
}`,
      expected: 'Cold Pleasant Hot',
      explain: 'Relational patterns (`<`, `>=`) can be combined with `and`/`or`. Arms are tested top to bottom. `Console.Write` keeps everything on one line (the trailing space is trimmed when graded).',
    },
  ],
};
