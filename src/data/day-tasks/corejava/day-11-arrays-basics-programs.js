export default {
  lesson: 'day-11-arrays-basics-programs',
  minutes: 22,
  intro: 'Create, traverse and copy arrays, use java.util.Arrays and predict alias-vs-copy results.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Complete the line that creates an array for the marks of **5 students** (all start at 0):
\`int[] marks = ____;\``,
      example: {
        title: 'creating arrays',
        code: `double[] prices = new double[3];      // 0.0, 0.0, 0.0
String[] names = {"Asha", "Ravi"};    // initialised directly`,
      },
      accept: ['new int[5]', 'new int[]{0, 0, 0, 0, 0}', '{0, 0, 0, 0, 0}'],
      acceptRegex: [
        '^new\\s+int\\s*\\[\\s*5\\s*\\]\\s*[;{]?$',
        '^new\\s+int\\s*\\[\\s*\\]\\s*\\{\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\}\\s*[;{]?$',
        '^\\{\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\}\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`new int[5]` reserves 5 int slots, each with the default value 0. The size is fixed once the array is created. Indexes go from 0 to 4.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the expression that reads the **last element** of any array `marks`, whatever its size.',
      example: { title: 'first element', code: 'int first = marks[0];' },
      accept: ['marks[marks.length - 1]', 'marks[marks.length-1]'],
      acceptRegex: ['^marks\\s*\\[\\s*marks\\s*\\.\\s*length\\s*-\\s*1\\s*\\]\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Indexes start at 0, so the last index is `length - 1`. `length` is a **field** of arrays (no brackets), unlike `String.length()` which is a method. `marks[marks.length]` throws `ArrayIndexOutOfBoundsException`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Alias vs copy: what does this program print?',
      example: {
        title: 'two names for one array',
        code: `int[] x = {1, 2};
int[] y = x;   // same array!
y[0] = 9;
// x[0] is now 9`,
      },
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {5, 3, 9, 1};
        int[] b = a;
        b[0] = 50;
        int[] c = Arrays.copyOf(a, 6);
        Arrays.sort(a);
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.toString(c));
        System.out.println(b[0]);
        System.out.println(c.length);
    }
}`,
      expected: `[1, 3, 9, 50]
[50, 3, 9, 1, 0, 0]
1
6`,
      explain: '`b = a` copies the **reference**, so b and a are the same array: changing b[0] changes a. `Arrays.copyOf(a, 6)` makes a **new** array (taken before sorting) and pads the extra slots with 0. Sorting a also "sorts b" because they are one array, so b[0] is 1.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Class test analysis: what does this program print?',
      example: {
        title: 'finding the maximum',
        code: `int max = arr[0];
for (int x : arr) if (x > max) max = x;`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int[] marks = {72, 88, 65, 88, 91};
        int sum = 0, max = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int m : marks) {
            sum += m;
            if (m > max) {
                second = max;
                max = m;
            } else if (m > second && m != max) {
                second = m;
            }
        }
        System.out.println("Sum: " + sum);
        System.out.println("Average: " + sum / marks.length);
        System.out.println("Highest: " + max);
        System.out.println("Second: " + second);
    }
}`,
      expected: `Sum: 404
Average: 80
Highest: 91
Second: 88`,
      explain: 'Sum = 404 and `sum / marks.length` is int division: 404 / 5 = 80 (not 80.8). For the second largest, when a new max arrives the old max becomes second; the `m != max` check ignores the duplicate 88 correctly, so the answer is 88.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`int[] a = new int[5];` What happens at runtime when the code reads `a[5]`?',
      options: ['It returns 0', 'It returns null', 'It throws ArrayIndexOutOfBoundsException', 'The array grows to size 6'],
      answer: 2,
      explain: 'Valid indexes are 0 to 4. Java checks every array access and throws **ArrayIndexOutOfBoundsException** for index 5. Arrays never grow; use an `ArrayList` when you need a resizable list.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which array declarations **compile**? (choose all that apply)',
      options: [
        'int[] a = new int[3];',
        'int a[] = {1, 2, 3};',
        'int[] a = new int[];',
        'int[] a = new int[]{1, 2, 3};',
        'int[3] a;',
        'String[] s = new String[2];',
      ],
      answers: [0, 1, 3, 5],
      explain: 'Both `int[] a` and `int a[]` are legal (the first is preferred). `new int[]` needs either a size or an initializer list. The size never goes on the left side, so `int[3] a;` is wrong.',
    },
  ],
};
