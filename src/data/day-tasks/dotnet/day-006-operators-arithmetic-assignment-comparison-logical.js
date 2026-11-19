export default {
  lesson: 'day-006-operators-arithmetic-assignment-comparison-logical',
  minutes: 15,
  intro: 'Practise C# arithmetic (with integer division), assignment, increment, comparison and logical operators.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Integer vs decimal division: what does this print?',
      example: { title: 'int / int', code: 'Console.WriteLine(7 / 2);   // 3\nConsole.WriteLine(7 % 2);   // 1\nConsole.WriteLine(7 / 2.0); // 3.5' },
      code: `int total = 17;
int people = 5;
Console.WriteLine(total / people);
Console.WriteLine(total % people);
Console.WriteLine(total / 5.0);
Console.WriteLine((double)total / people);`,
      expected: `3
2
3.4
3.4`,
      explain: 'When both operands are `int`, `/` does **integer division** (17 / 5 = 3, the remainder 2 is lost; `%` gives that remainder). If either side is a double (`5.0` or a cast), the result is 3.4. A common bug is `(double)(total / people)` which casts too late and gives 3.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Prefix vs postfix increment: what does this print?',
      example: { title: 'x++ vs ++x', code: 'int a = 1;\nConsole.WriteLine(a++); // 1 (use, then add)\nConsole.WriteLine(++a); // 3 (add, then use)' },
      code: `int x = 5;
int y = x++;
int z = ++x;
x += 10;
Console.WriteLine(y);
Console.WriteLine(z);
Console.WriteLine(x);`,
      expected: `5
7
17`,
      explain: '`y = x++` stores the old value 5 and then x becomes 6. `z = ++x` first increments to 7 and stores 7. `x += 10` means `x = x + 10` → 17.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the **compound assignment** that means `balance = balance - withdrawal;`',
      example: { title: 'compound operators', code: 'score += 5;   // score = score + 5\nprice *= 2;   // price = price * 2' },
      accept: ['balance -= withdrawal;', 'balance -= withdrawal'],
      acceptRegex: ['^balance\\s*-=\\s*withdrawal\\s*;?$'],
      explain: '`-=` subtracts and assigns in one step. Similar: `+=`, `*=`, `/=`, `%=`. Writing `balance =- withdrawal` is a classic typo: it assigns the negative value!',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Given `int age = 20; bool hasId = false;` which expressions are **true**? (choose all that apply)',
      options: ['age >= 18 && hasId', 'age >= 18 || hasId', '!hasId', 'age != 20', 'age > 18 && !hasId'],
      answers: [1, 2, 4],
      explain: '`&&` needs both sides true, `||` needs at least one, `!` flips a bool. `age >= 18 && hasId` is false because hasId is false; `age != 20` is false because age is 20.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In `if (list != null && list.Count > 0)`, why does the program NOT crash when `list` is null?',
      options: [
        '`&&` short-circuits: if the left side is false, the right side is not evaluated',
        'C# automatically ignores null objects',
        '`Count` returns 0 for null',
        'It does crash with NullReferenceException',
      ],
      answer: 0,
      explain: '`&&` and `||` are **short-circuit** operators. With `&&`, a false left side already decides the result, so `list.Count` is never touched. The non-short-circuit `&` would evaluate both sides and throw.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the value of `10 + 2 * 3 - 4 / 2`?',
      options: ['16', '14', '34', '13'],
      answer: 1,
      explain: '`*` and `/` run before `+` and `-`: 2 * 3 = 6, 4 / 2 = 2, so 10 + 6 - 2 = **14**. Use parentheses when you want a different order.',
    },
  ],
};
