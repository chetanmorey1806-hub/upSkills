export default {
  lesson: 'day-24-final-object-methods',
  minutes: 22,
  intro: 'Use final on variables, methods and classes, and override toString(), equals() and hashCode() correctly.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'equals, hashCode and toString: what does this program print?',
      example: { title: 'toString is called automatically', code: 'System.out.println(student); // same as student.toString()' },
      code: `import java.util.HashSet;
import java.util.Set;

class Student {
    int roll;
    String name;
    Student(int roll, String name) { this.roll = roll; this.name = name; }

    @Override
    public String toString() { return roll + ":" + name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        return roll == ((Student) o).roll;
    }

    @Override
    public int hashCode() { return Integer.hashCode(roll); }
}

public class Main {
    public static void main(String[] args) {
        Student a = new Student(1, "Asha");
        Student b = new Student(1, "Asha P");
        System.out.println(a);
        System.out.println(a == b);
        System.out.println(a.equals(b));
        Set<Student> set = new HashSet<>();
        set.add(a);
        set.add(b);
        System.out.println(set.size());
    }
}`,
      expected: `1:Asha
false
true
1`,
      explain: 'println calls the overridden `toString()`. `==` compares references (two different objects → false), while our `equals` says students with the same roll are equal. Because `hashCode` is consistent with equals, the HashSet treats b as a duplicate of a, so its size is 1.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'final references: what does this program print?',
      example: {
        title: 'final locks the variable, not the object',
        code: `final List<String> list = new ArrayList<>();
list.add("ok");          // allowed
// list = new ArrayList<>(); // compile error`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        final int[] scores = {1, 2, 3};
        scores[0] = 10;
        System.out.println(scores[0]);

        final StringBuilder sb = new StringBuilder("Hi");
        sb.append("!");
        System.out.println(sb);

        final int limit;
        limit = 50;
        System.out.println(limit + scores.length);
    }
}`,
      expected: `10
Hi!
53`,
      explain: 'A `final` reference cannot point to another object, but the **object itself can still change**: the array element and the StringBuilder are modified. A final local variable may be assigned once later ("blank final"). 50 + 3 = 53.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the exact method header (without the body) for overriding `toString` in your class.',
      example: {
        title: 'header of equals',
        code: `@Override
public boolean equals(Object o)`,
      },
      accept: ['public String toString()', '@Override public String toString()'],
      acceptRegex: ['^public\\s+String\\s+toString\\s*\\(\\s*\\)\\s*[;{]?$', '^@\\s*Override\\s+public\\s+String\\s+toString\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'It must be `public String toString()`: same name, no parameters, returns String, and public (an override cannot reduce visibility from public). Without overriding it, printing an object shows something like `Student@1b6d3586`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which keyword stops a class from being extended (like \`String\`)?
\`public ____ class Constants { }\``,
      example: { title: 'a method that cannot be overridden', code: 'public final void calculateInterest() { ... }' },
      accept: ['final'],
      acceptRegex: ['^final\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'A `final` class cannot have subclasses (String, Integer, LocalDate are final). A final method cannot be overridden and a final variable cannot be reassigned.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which statement follows the **equals–hashCode contract**?',
      options: [
        'If two objects have the same hashCode, they must be equal',
        'If two objects are equal by equals(), they must have the same hashCode',
        'hashCode must be unique for every object',
        'Overriding equals alone is enough for HashMap',
      ],
      answer: 1,
      explain: 'Equal objects **must** return the same hash code. The reverse is not required: different objects may collide on the same hash code. Overriding equals without hashCode breaks HashSet/HashMap lookups.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which class is the **root** of every class in Java (every class extends it directly or indirectly)?',
      options: ['java.lang.Class', 'java.lang.Object', 'java.lang.System', 'java.lang.Base'],
      answer: 1,
      explain: 'Every class implicitly extends **java.lang.Object**, which provides toString(), equals(), hashCode(), getClass(), clone(), finalize() (deprecated) and wait()/notify().',
    },
  ],
};
