export default {
  lesson: 'day-12-comparable-vs-comparator',
  minutes: 22,
  intro: 'Sort custom objects with Comparable (natural order) and Comparator chains (comparing, thenComparing, reversed).',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Comparator chain: what does this program print?',
      example: { title: 'one key', code: 'list.sort(Comparator.comparing(Emp::name));' },
      code: `import java.util.*;

record Emp(String name, String dept, int salary) {}

public class Main {
    public static void main(String[] args) {
        List<Emp> list = new ArrayList<>(List.of(
            new Emp("Asha", "IT", 70000),
            new Emp("Ravi", "HR", 50000),
            new Emp("Om", "IT", 90000),
            new Emp("Meena", "HR", 50000),
            new Emp("Kiran", "Sales", 60000)));

        list.sort(Comparator.comparing(Emp::dept)
                .thenComparing(Emp::salary, Comparator.reverseOrder())
                .thenComparing(Emp::name));
        for (Emp e : list) System.out.print(e.name() + " ");
        System.out.println();

        list.sort(Comparator.comparingInt(Emp::salary).reversed());
        System.out.println(list.get(0).name() + " " + list.get(list.size() - 1).name());
    }
}`,
      expected: `Meena Ravi Om Asha Kiran 
Om Ravi`,
      explain: 'First by department (HR < IT < Sales), then salary **descending**, then name to break ties: Meena and Ravi both earn 50000 in HR, so the name decides (Meena first). The second sort by salary descending is **stable**: equal salaries keep their previous order (Meena, Ravi), so Om is first and Ravi is last.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Comparable natural order: what does this program print?',
      example: {
        title: 'compareTo contract',
        text: 'Return a negative number if this comes first, 0 if equal, positive if this comes after.',
      },
      code: `import java.util.*;

class Student implements Comparable<Student> {
    String name;
    int marks;
    Student(String name, int marks) { this.name = name; this.marks = marks; }

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.marks, other.marks);
    }
    @Override
    public String toString() { return name + "(" + marks + ")"; }
}

public class Main {
    public static void main(String[] args) {
        List<Student> list = new ArrayList<>(List.of(
            new Student("Ravi", 72), new Student("Asha", 91), new Student("Om", 55)));
        Collections.sort(list);
        System.out.println(list);
        list.sort(Comparator.comparing((Student s) -> s.name).reversed());
        System.out.println(list);
        System.out.println(Collections.max(list).name);
    }
}`,
      expected: `[Om(55), Ravi(72), Asha(91)]
[Ravi(72), Om(55), Asha(91)]
Asha`,
      explain: '`Collections.sort(list)` uses the class\'s natural order from `compareTo` (marks ascending). A Comparator gives a different order without touching the class: names reversed → Ravi, Om, Asha. `Collections.max` still uses the natural order, so the top scorer Asha is returned.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the method header (no body) that a class `Product implements Comparable<Product>` must provide.',
      example: { title: 'Comparator\'s method for comparison', code: 'public int compare(Product a, Product b)' },
      accept: [
        'public int compareTo(Product other)',
        'public int compareTo(Product o)',
        'public int compareTo(Product p)',
        '@Override public int compareTo(Product other)',
        '@Override public int compareTo(Product o)',
      ],
      acceptRegex: [
        '^public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+other\\s*\\)\\s*[;{]?$',
        '^public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+o\\s*\\)\\s*[;{]?$',
        '^public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+p\\s*\\)\\s*[;{]?$',
        '^@\\s*Override\\s+public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+other\\s*\\)\\s*[;{]?$',
        '^@\\s*Override\\s+public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+o\\s*\\)\\s*[;{]?$',
        '^(@Override\\s+)?public\\s+int\\s+compareTo\\s*\\(\\s*Product\\s+[A-Za-z_$][\\w$]*\\s*\\)$',
      ],
      caseSensitive: true,
      explain: 'Comparable (java.lang) has one method `int compareTo(T other)`, defining the **natural order** inside the class. Comparator (java.util) has `int compare(T a, T b)` and lives outside the class.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a Comparator that sorts \`Student\` objects by \`getName()\` alphabetically, using a method reference:
\`Comparator<Student> byName = ____;\``,
      example: { title: 'by an int field', code: 'Comparator<Student> byMarks = Comparator.comparingInt(Student::getMarks);' },
      accept: ['Comparator.comparing(Student::getName)'],
      acceptRegex: ['^Comparator\\s*\\.\\s*comparing\\s*\\(\\s*Student\\s*:\\s*:\\s*getName\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Comparator.comparing(keyExtractor)` builds a comparator from a key. Chain `.reversed()` for descending order and `.thenComparing(...)` for tie-breakers.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why is `return a.salary - b.salary;` a risky compare() implementation?',
      options: [
        'It is too slow',
        'The subtraction can overflow for large or negative values and give the wrong sign',
        'It sorts in reverse',
        'compare must return a boolean',
      ],
      answer: 1,
      explain: 'With values near Integer.MIN_VALUE/MAX_VALUE, `a - b` overflows and flips sign, breaking the sort. Use `Integer.compare(a.salary, b.salary)` or `Comparator.comparingInt(...)`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Comparable vs Comparator: which statements are TRUE? (choose all that apply)',
      options: [
        'Comparable is implemented by the class itself',
        'A class can have only one natural order but many Comparators',
        'Comparator is in java.lang',
        'String and Integer implement Comparable',
        'TreeSet can take a Comparator in its constructor',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Comparable (java.lang) is inside the class and gives one natural order; Comparator (java.util) is external and you can create as many as you like. Sorted collections like TreeSet/TreeMap accept a Comparator.',
    },
  ],
};
