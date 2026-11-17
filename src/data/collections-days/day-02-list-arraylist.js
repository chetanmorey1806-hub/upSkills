const ex1 = `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ravi");
        names.add("Sita");
        names.add("Amit");
        names.add(1, "Neha");              // insert at index 1
        System.out.println(names);
        System.out.println("Index 2: " + names.get(2));

        names.set(0, "Ravi Kumar");        // replace
        System.out.println(names);

        names.remove("Sita");              // remove by value
        System.out.println(names);

        names.add("Neha");                 // duplicates allowed
        System.out.println("indexOf Neha: " + names.indexOf("Neha"));
        System.out.println("lastIndexOf Neha: " + names.lastIndexOf("Neha"));
        System.out.println("Size: " + names.size());
    }
}`;

const ex2 = `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> marks = new ArrayList<>(List.of(78, 92, 65, 88));

        // 1. classic for loop with index
        int total = 0;
        for (int i = 0; i < marks.size(); i++) {
            total += marks.get(i);
        }
        System.out.println("Total: " + total);
        double avg = (double) total / marks.size();
        System.out.println("Average: " + avg);

        // 2. for-each loop
        List<Integer> high = new ArrayList<>();
        for (int m : marks) {
            if (m > 80) high.add(m);
        }
        System.out.println("Above 80: " + high);

        // 3. forEach with lambda
        marks.forEach(m -> System.out.println("Mark -> " + m));
    }
}`;

const ex3 = `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(10, 20, 30, 40, 50, 60));

        nums.remove(1);                       // index 1 -> removes 20
        System.out.println("remove(1): " + nums);

        nums.remove(Integer.valueOf(50));     // value 50
        System.out.println("remove(value 50): " + nums);

        System.out.println("subList(1,3): " + nums.subList(1, 3));

        nums.removeIf(n -> n > 35);
        System.out.println("removeIf > 35: " + nums);

        nums.addAll(List.of(5, 25));
        System.out.println("after addAll: " + nums);

        nums.sort(null);                      // natural order
        System.out.println("ascending: " + nums);

        nums.sort(Comparator.reverseOrder());
        System.out.println("descending: " + nums);
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.List;

class Student {
    String name;
    int marks;

    Student(String name, int marks) {
        this.name = name;
        this.marks = marks;
    }

    @Override
    public String toString() {
        return name + "(" + marks + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        List<Student> list = new ArrayList<>();
        list.add(new Student("Asha", 85));
        list.add(new Student("Bala", 92));
        list.add(new Student("Chirag", 78));
        System.out.println(list);

        Student top = list.get(0);
        for (Student s : list) {
            if (s.marks > top.marks) top = s;
        }
        System.out.println("Topper: " + top.name);

        list.removeIf(s -> s.marks < 80);
        System.out.println("80 and above: " + list);
    }
}`;

export default {
  id: 'day-02-list-arraylist',
  title: 'List Interface and ArrayList',
  module: 'Module 1: Collections Basics & Lists',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn the List interface and its most used implementation, ArrayList: how it stores data internally, how it grows, and all the everyday methods for adding, reading, updating, removing and traversing elements.',
  objectives: [
    'Describe the features of the List interface',
    'Explain how ArrayList works internally (dynamic array, capacity, growth)',
    'Use add, get, set, remove, indexOf, contains, subList, removeIf and sort',
    'Traverse a list in three ways and store custom objects',
    'Avoid the remove(int) vs remove(Object) trap',
  ],
  theory: [
    {
      heading: 'List interface',
      content:
        'A List is an ordered collection - like a numbered queue of people where each person has a position (index) starting at 0. Lists allow duplicate elements and multiple nulls, and you can access any element directly by its index.',
      points: [
        'Insertion order is preserved',
        'Duplicates and null are allowed',
        'Index-based methods: get(i), set(i, e), add(i, e), remove(i), indexOf(o), lastIndexOf(o), subList(from, to)',
        'Implementations: ArrayList, LinkedList, Vector, Stack, CopyOnWriteArrayList',
      ],
    },
    {
      heading: 'How ArrayList works internally',
      content:
        'ArrayList is a resizable array. Inside, it keeps an Object[] called elementData. When you create new ArrayList<>(), the array is empty; on the first add() it gets a default capacity of 10. When the array is full and you add one more element, Java creates a new, bigger array (about 1.5 times the old size: newCapacity = old + old/2) and copies all elements into it. Imagine moving to a bigger cupboard when the old one is full.',
      syntax: `capacity 10 -> full -> new array of 15 -> full -> 22 -> 33 ...
size()     = number of elements actually stored
capacity   = length of the internal array (hidden)`,
      points: [
        'get(i) and set(i, e) are O(1) - direct jump to the slot',
        'add(e) at the end is amortized O(1)',
        'add(i, e) / remove(i) in the middle are O(n) because elements shift',
        'contains / indexOf are O(n) - linear search',
        'new ArrayList<>(1000) pre-sizes the array when you know the count, avoiding repeated copying',
      ],
    },
    {
      heading: 'Creating lists - three common ways',
      content:
        'new ArrayList<>() gives a fully modifiable list. List.of(a, b, c) (Java 9+) gives an unmodifiable list - any add/remove/set throws UnsupportedOperationException and nulls are not allowed. Arrays.asList(a, b, c) gives a fixed-size list backed by the array - set() works but add()/remove() throw UnsupportedOperationException.',
      syntax: `List<String> a = new ArrayList<>();               // modifiable
List<String> b = List.of("x", "y");               // unmodifiable
List<String> c = Arrays.asList("x", "y");         // fixed size
List<String> d = new ArrayList<>(List.of("x"));   // modifiable copy`,
      tip: 'When you need a quick list that you will still change later, wrap it: new ArrayList<>(List.of(...)).',
    },
    {
      heading: 'remove(int index) vs remove(Object o)',
      content:
        'For List<Integer>, list.remove(1) calls remove(int index) and removes the element at position 1. list.remove(Integer.valueOf(1)) calls remove(Object) and removes the first element equal to 1. This is a very popular interview "what is the output" question.',
    },
    {
      heading: 'Traversing a List',
      content:
        'You can loop using a classic for loop with get(i), the enhanced for-each loop, an Iterator, or forEach(lambda). For ArrayList all are fast. Use an Iterator or removeIf if you need to delete elements while looping (covered on Day 5).',
      syntax: `for (int i = 0; i < list.size(); i++) list.get(i);
for (String s : list) { ... }
list.forEach(s -> System.out.println(s));
list.removeIf(s -> s.isEmpty());`,
    },
    {
      heading: 'Common mistakes',
      content: 'Watch out for these ArrayList pitfalls.',
      points: [
        'IndexOutOfBoundsException: get(size()) or add(i, e) with i > size()',
        'Calling add on List.of(...) or Arrays.asList(...) -> UnsupportedOperationException',
        'Removing inside a for-each loop -> ConcurrentModificationException',
        'Forgetting to override toString() for custom objects -> prints Student@1b6d3586',
        'ArrayList is not thread-safe; use Collections.synchronizedList or CopyOnWriteArrayList for threads',
      ],
    },
  ],
  examples: [
    {
      title: 'ArrayList CRUD operations',
      scenario: 'Maintain a list of employee names: add, insert at a position, read, update, delete and search.',
      steps: ['In IntelliJ: right-click src > New > Java Class > Main', 'Type the code', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `[Ravi, Neha, Sita, Amit]
Index 2: Sita
[Ravi Kumar, Neha, Sita, Amit]
[Ravi Kumar, Neha, Amit]
indexOf Neha: 1
lastIndexOf Neha: 3
Size: 4`,
      explanation:
        'add(1, "Neha") shifts Sita and Amit one place right. set(0, ...) replaces without changing size. After adding a second "Neha" at the end, indexOf gives the first position (1) and lastIndexOf the last (3).',
    },
    {
      title: 'Three ways to traverse and compute results',
      scenario: 'Compute total and average of marks, collect marks above 80, and print every mark.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Total: 323
Average: 80.75
Above 80: [92, 88]
Mark -> 78
Mark -> 92
Mark -> 65
Mark -> 88`,
      explanation:
        '78 + 92 + 65 + 88 = 323; 323 / 4 = 80.75 (we cast to double to avoid integer division). The for-each loop auto-unboxes Integer to int. forEach runs the lambda once per element in order.',
    },
    {
      title: 'remove(index) vs remove(value), subList, removeIf and sort',
      scenario: 'Practice the trickiest ArrayList methods on a list of numbers.',
      steps: ['Create class Main', 'Type the code', 'Run ▶ and trace each line'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `remove(1): [10, 30, 40, 50, 60]
remove(value 50): [10, 30, 40, 60]
subList(1,3): [30, 40]
removeIf > 35: [10, 30]
after addAll: [10, 30, 5, 25]
ascending: [5, 10, 25, 30]
descending: [30, 25, 10, 5]`,
      explanation:
        'remove(1) removed index 1 (20). remove(Integer.valueOf(50)) removed the value 50. subList(1,3) returns indexes 1 and 2 (end is exclusive). removeIf deletes 40 and 60. sort(null) uses natural order; Comparator.reverseOrder() sorts descending.',
    },
    {
      title: 'ArrayList of custom objects',
      scenario: 'Store Student objects, find the topper and remove students below 80.',
      steps: ['Create Main.java with both classes (Student is not public)', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `[Asha(85), Bala(92), Chirag(78)]
Topper: Bala
80 and above: [Asha(85), Bala(92)]`,
      explanation:
        'Printing the list calls toString() on each Student. The loop keeps the student with the highest marks. removeIf removes Chirag (78 < 80).',
    },
  ],
  interview: [
    { q: 'What is ArrayList and how does it grow?', a: 'ArrayList is a resizable-array implementation of List. It stores elements in an internal Object[]. Default capacity is 10 (allocated on first add). When full, it grows to about 1.5x (old + old >> 1) and copies elements using Arrays.copyOf.', level: 'Medium' },
    { q: 'Difference between size and capacity of an ArrayList?', a: 'size() is the number of elements actually stored. Capacity is the length of the internal array, which is usually larger and not visible directly.', level: 'Easy' },
    { q: 'What is the output? List<Integer> l = new ArrayList<>(List.of(1,2,3)); l.remove(1); System.out.println(l);', a: '[1, 3] - remove(int) removes by index, so element at index 1 (value 2) is removed.', level: 'Medium' },
    { q: 'What is the time complexity of get(), add() and remove(index) in ArrayList?', a: 'get/set: O(1). add at end: amortized O(1). add/remove in the middle: O(n) due to shifting. contains/indexOf: O(n).', level: 'Medium' },
    { q: 'What happens if you call add() on a list created with List.of()?', a: 'UnsupportedOperationException, because List.of returns an immutable list.', level: 'Easy' },
    { q: 'Difference between Arrays.asList() and List.of()?', a: 'Arrays.asList returns a fixed-size list backed by the array: set() works and writes through to the array, add/remove fail, nulls allowed. List.of returns a fully immutable list: set/add/remove all fail and nulls are not allowed.', level: 'Hard' },
    { q: 'Is ArrayList synchronized?', a: 'No. For thread safety use Collections.synchronizedList(new ArrayList<>()) or CopyOnWriteArrayList (good for read-heavy use).', level: 'Easy' },
    { q: 'What is the output? List<String> l = new ArrayList<>(); l.add("A"); l.add(0,"B"); l.add(1,"C"); System.out.println(l);', a: '[B, C, A]. "A" at 0; inserting B at 0 gives [B, A]; inserting C at 1 gives [B, C, A].', level: 'Medium' },
    { q: 'How do you convert an ArrayList to an array?', a: 'list.toArray(new String[0]) or in Java 11+ list.toArray(String[]::new).', level: 'Easy' },
    { q: 'What does subList return and what is the risk?', a: 'A view of the portion [from, to) backed by the original list. Changes through the view affect the original. Structurally modifying the original afterwards makes the view throw ConcurrentModificationException.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Read 5 integers into an ArrayList and print only the even numbers and their count.',
      hint: 'Use a for-each loop and n % 2 == 0.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(12, 7, 30, 15, 8));
        List<Integer> evens = new ArrayList<>();
        for (int n : nums) {
            if (n % 2 == 0) evens.add(n);
        }
        System.out.println("Evens: " + evens);       // [12, 30, 8]
        System.out.println("Count: " + evens.size()); // 3
    }
}`,
    },
    {
      task: 'Write a method that returns the second largest element of an ArrayList<Integer> without sorting.',
      hint: 'Track largest and second largest in one pass.',
      solution: `import java.util.*;

public class Main {
    static int secondLargest(List<Integer> list) {
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int n : list) {
            if (n > first) { second = first; first = n; }
            else if (n > second && n != first) second = n;
        }
        return second;
    }
    public static void main(String[] args) {
        System.out.println(secondLargest(List.of(4, 9, 2, 7, 9))); // 7
    }
}`,
    },
    {
      task: 'Reverse an ArrayList manually (without Collections.reverse).',
      hint: 'Swap list.get(i) and list.get(size-1-i) for i < size/2 using set().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("a", "b", "c", "d"));
        int n = l.size();
        for (int i = 0; i < n / 2; i++) {
            String tmp = l.get(i);
            l.set(i, l.get(n - 1 - i));
            l.set(n - 1 - i, tmp);
        }
        System.out.println(l); // [d, c, b, a]
    }
}`,
    },
    {
      task: 'Create a shopping cart: an ArrayList of Item(name, price). Print the total bill and the most expensive item.',
      hint: 'Create an Item class with toString; loop to sum and find max.',
      solution: `import java.util.*;

class Item {
    String name; double price;
    Item(String n, double p) { name = n; price = p; }
}

public class Main {
    public static void main(String[] args) {
        List<Item> cart = new ArrayList<>();
        cart.add(new Item("Pen", 20));
        cart.add(new Item("Book", 150));
        cart.add(new Item("Bag", 700));
        double total = 0;
        Item max = cart.get(0);
        for (Item i : cart) {
            total += i.price;
            if (i.price > max.price) max = i;
        }
        System.out.println("Total: " + total);        // Total: 870.0
        System.out.println("Costliest: " + max.name); // Costliest: Bag
    }
}`,
    },
  ],
  quiz: [
    { question: 'Default capacity of an ArrayList (after first add) is:', options: ['8', '16', '10', '12'], answer: 2, explanation: 'ArrayList allocates an array of 10 on the first add when created with the no-arg constructor.' },
    { question: 'Output of: List<Integer> l = new ArrayList<>(List.of(5,6,7)); l.remove(Integer.valueOf(6)); System.out.println(l);', options: ['[5, 7]', '[5, 6]', '[6, 7]', 'Exception'], answer: 0, explanation: 'remove(Object) removes the value 6.' },
    { question: 'Which operation is slowest in an ArrayList of 1 million elements?', options: ['get(500000)', 'add(e) at end', 'set(10, e)', 'add(0, e)'], answer: 3, explanation: 'Inserting at index 0 shifts every element: O(n).' },
    { question: 'Calling add() on List.of("a","b") throws:', options: ['IllegalStateException', 'NullPointerException', 'IndexOutOfBoundsException', 'UnsupportedOperationException'], answer: 3, explanation: 'List.of returns an immutable list.' },
    { question: 'subList(1, 4) on [a, b, c, d, e] returns:', options: ['[a, b, c, d]', '[b, c, d]', '[b, c, d, e]', '[c, d]'], answer: 1, explanation: 'Start index inclusive, end index exclusive: indexes 1, 2, 3.' },
  ],
};
