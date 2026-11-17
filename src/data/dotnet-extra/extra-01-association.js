const driverCar = `using System;

class Car
{
    public string Model { get; }
    public Car(string model) { Model = model; }
}

class Driver
{
    public string Name { get; }
    public Car? CurrentCar { get; private set; }   // association: a Driver "uses" a Car

    public Driver(string name) { Name = name; }

    public void AssignCar(Car car)
    {
        CurrentCar = car;
        Console.WriteLine($"{Name} is now driving {car.Model}");
    }

    public void Drive()
    {
        if (CurrentCar == null)
            Console.WriteLine($"{Name} has no car to drive");
        else
            Console.WriteLine($"{Name} drives the {CurrentCar.Model}");
    }
}

class Program
{
    static void Main()
    {
        Car swift = new Car("Swift");      // created independently
        Car city = new Car("City");        // created independently
        Driver ravi = new Driver("Ravi");  // created independently

        ravi.Drive();
        ravi.AssignCar(swift);
        ravi.Drive();
        ravi.AssignCar(city);              // the link can change at any time
        ravi.Drive();

        ravi = null!;                      // the driver object is no longer used
        Console.WriteLine($"Driver gone, cars still exist: {swift.Model}, {city.Model}");
    }
}
`;

const teacherStudent = `using System;
using System.Collections.Generic;

class Teacher
{
    public string Name { get; }
    public List<Student> Students { get; } = new List<Student>();
    public Teacher(string name) { Name = name; }

    public void AddStudent(Student s)
    {
        if (!Students.Contains(s))
        {
            Students.Add(s);
            s.AddTeacher(this);      // keep BOTH sides of the link in sync
        }
    }
}

class Student
{
    public string Name { get; }
    public List<Teacher> Teachers { get; } = new List<Teacher>();
    public Student(string name) { Name = name; }

    public void AddTeacher(Teacher t)
    {
        if (!Teachers.Contains(t))
        {
            Teachers.Add(t);
            t.AddStudent(this);
        }
    }
}

class Program
{
    static void Main()
    {
        var rao = new Teacher("Mr. Rao");
        var meera = new Teacher("Ms. Meera");
        var asha = new Student("Asha");
        var ravi = new Student("Ravi");

        rao.AddStudent(asha);
        rao.AddStudent(ravi);
        meera.AddStudent(asha);

        foreach (var t in new[] { rao, meera })
            Console.WriteLine($"{t.Name} -> {string.Join(", ", t.Students.ConvertAll(s => s.Name))}");

        foreach (var s in new[] { asha, ravi })
            Console.WriteLine($"{s.Name} -> {string.Join(", ", s.Teachers.ConvertAll(t => t.Name))}");
    }
}
`;

const customerOrder = `using System;
using System.Collections.Generic;
using System.Linq;

class Customer
{
    public int Id { get; }
    public string Name { get; }
    public Customer(int id, string name) { Id = id; Name = name; }
}

class Order
{
    public int OrderNo { get; }
    public int Amount { get; }
    public Customer PlacedBy { get; }   // many orders -> one customer (unidirectional)

    public Order(int no, int amount, Customer by)
    {
        OrderNo = no;
        Amount = amount;
        PlacedBy = by;
    }
}

class Program
{
    static void Main()
    {
        var kiran = new Customer(1, "Kiran");
        var neha = new Customer(2, "Neha");

        var orders = new List<Order>
        {
            new Order(101, 500, kiran),
            new Order(102, 1200, neha),
            new Order(103, 300, kiran)
        };

        foreach (var o in orders)
            Console.WriteLine($"Order {o.OrderNo}: {o.Amount} by {o.PlacedBy.Name}");

        int kiranTotal = orders.Where(o => o.PlacedBy == kiran).Sum(o => o.Amount);
        Console.WriteLine($"Total for {kiran.Name}: {kiranTotal}");
    }
}
`;

const appointment = `using System;
using System.Collections.Generic;

class Doctor
{
    public string Name { get; }
    public Doctor(string name) { Name = name; }
}

class Patient
{
    public string Name { get; }
    public Patient(string name) { Name = name; }
}

// "Association class": the link itself carries data (the time slot)
class Appointment
{
    public Doctor Doctor { get; }
    public Patient Patient { get; }
    public string Slot { get; }

    public Appointment(Doctor d, Patient p, string slot)
    {
        Doctor = d;
        Patient = p;
        Slot = slot;
    }

    public override string ToString() => $"{Slot}: {Patient.Name} with {Doctor.Name}";
}

class Program
{
    static void Main()
    {
        var drSen = new Doctor("Dr. Sen");
        var drIyer = new Doctor("Dr. Iyer");
        var amit = new Patient("Amit");
        var priya = new Patient("Priya");

        var schedule = new List<Appointment>
        {
            new Appointment(drSen, amit, "10:00"),
            new Appointment(drSen, priya, "10:30"),
            new Appointment(drIyer, amit, "11:00")
        };

        foreach (var a in schedule)
            Console.WriteLine(a);

        int amitVisits = schedule.FindAll(a => a.Patient == amit).Count;
        Console.WriteLine($"Amit has {amitVisits} appointments");
    }
}
`;

export default {
  id: 'extra-01-association',
  title: 'Association (Has-a / Uses-a Relationship Between Objects)',
  module: 'Extra: OOP Concepts',
  extraNo: 1,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Objects in real applications never live alone: a Driver drives a Car, a Teacher teaches Students, an Order belongs to a Customer. Association is the general name for "these two objects know about each other" while each one has its own independent life. Learn one-to-one, one-to-many and many-to-many associations, unidirectional vs bidirectional links, association classes, and how this maps to C# fields, properties and collections.`,
  objectives: [
    'Define association and explain it with real-world analogies and UML wording',
    'Implement one-to-one, one-to-many and many-to-many associations in C#',
    'Differentiate unidirectional and bidirectional associations and keep both sides in sync',
    'Model a link that carries its own data using an association class',
    'Place association correctly among Dependency, Aggregation and Composition',
  ],
  theory: [
    {
      heading: 'What is Association?',
      content: `**Association** is a relationship where one object **holds a reference to** (knows about) another object, and **both objects have their own independent lifetime**. Neither object owns the other. Creating or destroying one does not create or destroy the other.

Real-world analogies:
- A **Driver** and a **Car**: Ravi drives a Swift today and a City tomorrow. If Ravi changes his job, the cars still exist.
- A **Teacher** and a **Student**: a teacher teaches many students and a student learns from many teachers. Both existed before they met.
- A **Doctor** and a **Patient**: they are linked by appointments, but neither is "part of" the other.

In C# an association is simply a **field or property whose type is another class** (or a collection of that class), where the object is **created outside** and **passed in or assigned later**.`,
      syntax: `class Car { public string Model { get; set; } = ""; }

class Driver
{
    public Car? CurrentCar { get; set; }   // association: Driver -> Car
}`,
      points: [
        'Association = "knows about / uses / is linked to" with independent lifetimes',
        'Implemented with a reference field/property or a collection of references',
        'The linked object is created outside the class and handed to it',
        'The link can usually be changed or removed at run time',
      ],
    },
    {
      heading: 'UML wording and the relationship family',
      content: `In a UML class diagram, association is drawn as a **plain solid line** between two classes (with an arrow head if it is one-way). In words we read it as: "Driver **drives** Car (0..1)", "Teacher **teaches** Student (1..* to 0..*)".

Association is the **parent idea** of two stronger relationships you will study next:

| Relationship | UML symbol (in words) | Ownership | Lifetime |
|---|---|---|---|
| Dependency | dashed arrow | none, temporary use | not stored |
| **Association** | solid line | none | independent |
| Aggregation | solid line with hollow diamond at the whole | weak "has-a" | part survives the whole |
| Composition | solid line with filled diamond at the whole | strong "owns-a" | part dies with the whole |

So: **every aggregation and composition is an association**, but a plain association has no "whole/part" meaning at all.`,
      points: [
        'Plain association: two peers that know each other (Driver - Car)',
        'Aggregation: a whole that groups independent parts (Team - Player)',
        'Composition: a whole that creates and owns its parts (House - Room)',
        'Dependency: only temporary use inside a method (Printer uses Document)',
      ],
      tip: 'Interview shortcut: "Association is a has-a relationship where both objects can exist independently and there is no owner."',
    },
    {
      heading: 'Multiplicity: one-to-one, one-to-many, many-to-many',
      content: `**Multiplicity** (cardinality) says how many objects take part on each side of the link.

- **One-to-one (1..1 or 0..1)**: a Driver currently drives at most one Car -> a single reference property \`Car? CurrentCar\`.
- **One-to-many (1..*)**: one Customer places many Orders -> either the Customer has \`List<Order>\` or each Order has \`Customer PlacedBy\` (or both).
- **Many-to-many (*..*)**: Teachers and Students -> each side holds a \`List<>\` of the other, or a separate link class (Enrollment) is used.

This is exactly how database tables are designed (Module 4) and how EF Core navigation properties work (Day 82): a foreign key is an association stored in a table.`,
      syntax: `class Customer { public List<Order> Orders { get; } = new(); }   // 1 -> many
class Order    { public Customer PlacedBy { get; set; } = null!; } // many -> 1
class Teacher  { public List<Student> Students { get; } = new(); } // many <-> many
class Student  { public List<Teacher> Teachers { get; } = new(); }`,
    },
    {
      heading: 'Unidirectional vs bidirectional association',
      content: `**Unidirectional**: only one side knows the other. An Order knows its Customer, but the Customer class has no list of orders. Simple and loosely coupled; prefer this when you only navigate in one direction.

**Bidirectional**: both sides hold references to each other (Teacher has Students, Student has Teachers). Navigation is easy in both directions, but you must **keep both sides in sync**: when you add a student to a teacher, the teacher must also be added to the student. A common technique is that each Add method updates the other side and uses a \`Contains\` check to stop infinite recursion.`,
      points: [
        'Unidirectional: one arrow in UML, one reference in code, lower coupling',
        'Bidirectional: line without arrows, references on both sides, must stay consistent',
        'Avoid infinite loops in sync code by checking whether the link already exists',
        'EF Core calls these navigation properties and fixes up both sides automatically',
      ],
    },
    {
      heading: 'Association class (link with its own data)',
      content: `Sometimes the **link itself has information**. A Doctor and a Patient are associated through an **Appointment** that has a date and a time slot. A Student and a Course are associated through an **Enrollment** that has a grade.

In UML this is an **association class** (a class attached to the association line with a dashed line). In C# you create a separate class that holds references to both sides plus the extra data. In databases this becomes a **junction table** (StudentCourse with StudentId, CourseId, Grade).`,
      syntax: `class Enrollment
{
    public Student Student { get; }
    public Course Course { get; }
    public string Grade { get; set; }
}`,
      tip: 'If you find yourself wanting to store "extra data about a link", create an association class instead of adding parallel lists.',
    },
    {
      heading: 'Good practices',
      content: `- Use **constructor parameters** when the link is mandatory (an Order must have a Customer) and **methods/properties** when it is optional or changeable (a Driver may or may not have a Car).
- Use \`private set\` or methods (AssignCar) so the link changes in a controlled way.
- Mark optional links as nullable (\`Car?\`) and check for null before using them.
- Prefer unidirectional links unless you really navigate both ways.
- Compare associated objects by reference (\`==\` on classes) or by an Id when they come from a database.`,
    },
  ],
  examples: [
    {
      title: 'One-to-one association: Driver and Car',
      scenario: 'A cab company app: a driver is assigned a car for the shift. The car and the driver exist independently and the assignment can change at any time.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#), click Next',
        'Name it AssociationDemo, choose .NET 8 or .NET 10, click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
        'Put a breakpoint (F9) on ravi.AssignCar(city) and press F5, then hover over ravi.CurrentCar to watch the link change',
      ],
      code: driverCar,
      csharp: { files: { 'Program.cs': driverCar }, stdin: '' },
      result: `Ravi has no car to drive
Ravi is now driving Swift
Ravi drives the Swift
Ravi is now driving City
Ravi drives the City
Driver gone, cars still exist: Swift, City`,
      explanation: `Driver holds a reference (CurrentCar) to a Car object that was created outside the Driver class. That reference is the association. The link starts as null (0..1 multiplicity), is set to swift, then changed to city. Setting ravi to null does not affect the cars because the Driver never owned them: independent lifetimes is the key property of association.`,
    },
    {
      title: 'Bidirectional many-to-many association: Teacher and Student',
      scenario: 'A college ERP must show "which students does this teacher teach" and "which teachers does this student have" from both sides.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it TeacherStudentAssociation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Use F11 (Step Into) on rao.AddStudent(asha) to watch AddStudent call AddTeacher and stop on the Contains check',
      ],
      code: teacherStudent,
      csharp: { files: { 'Program.cs': teacherStudent }, stdin: '' },
      result: `Mr. Rao -> Asha, Ravi
Ms. Meera -> Asha
Asha -> Mr. Rao, Ms. Meera
Ravi -> Mr. Rao`,
      explanation: `Trace of rao.AddStudent(asha): Rao's list does not contain Asha, so she is added and asha.AddTeacher(rao) runs. Asha's list does not contain Rao, so he is added and rao.AddStudent(asha) runs again - this time Contains returns true and nothing happens, ending the recursion. Both sides are now in sync. The same happens for Ravi and for Meera-Asha. ConvertAll turns each List of objects into a List of names for string.Join.`,
    },
    {
      title: 'Unidirectional many-to-one association: Order and Customer',
      scenario: 'An online shop stores orders. Each order must know who placed it, but the Customer class is kept simple and does not hold a list of orders.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OrderCustomerAssociation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: customerOrder,
      csharp: { files: { 'Program.cs': customerOrder }, stdin: '' },
      result: `Order 101: 500 by Kiran
Order 102: 1200 by Neha
Order 103: 300 by Kiran
Total for Kiran: 800`,
      explanation: `Each Order receives its Customer in the constructor (a mandatory link) and stores it in a get-only property. Two orders point to the SAME kiran object, so o.PlacedBy == kiran is a reference comparison that is true for orders 101 and 103: 500 + 300 = 800. Only Order knows about Customer, so this is a unidirectional association - exactly like a foreign key column CustomerId in an Orders table.`,
    },
    {
      title: 'Association class: Doctor, Patient and Appointment',
      scenario: 'A clinic booking system where the link between a doctor and a patient carries its own data: the time slot.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ClinicAssociation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: appointment,
      csharp: { files: { 'Program.cs': appointment }, stdin: '' },
      result: `10:00: Amit with Dr. Sen
10:30: Priya with Dr. Sen
11:00: Amit with Dr. Iyer
Amit has 2 appointments`,
      explanation: `Doctor and Patient are completely independent classes. The Appointment class is the association class: it references one Doctor and one Patient and adds the Slot. Console.WriteLine(a) calls the overridden ToString. FindAll returns the appointments whose Patient reference is amit (two of them), giving a many-to-many relationship between doctors and patients modelled through a link class - the same idea as a junction table in SQL Server.`,
    },
  ],
  interview: [
    { q: 'What is association in OOP?', a: 'A relationship in which one object holds a reference to another object and both have independent lifetimes. Neither owns the other; e.g. Driver and Car, Teacher and Student.', level: 'Easy' },
    { q: 'How is association implemented in C#?', a: 'By a field or property whose type is another class (single reference for one-to-one / many-to-one) or a collection such as List<T> (one-to-many / many-to-many). The referenced object is created outside and passed in through a constructor, property or method.', level: 'Easy' },
    { q: 'What is the difference between association, aggregation and composition?', a: 'Association is the general "knows about" link with no ownership. Aggregation is a special association with a whole-part meaning where the part can live without the whole (Team-Player). Composition is a strong whole-part association where the whole creates and owns the parts and they die with it (House-Room).', level: 'Medium' },
    { q: 'What is the difference between unidirectional and bidirectional association?', a: 'In unidirectional association only one class holds a reference to the other (Order -> Customer). In bidirectional association both classes hold references to each other (Teacher <-> Student), which makes navigation easy but requires keeping both sides consistent.', level: 'Medium' },
    { q: 'What is multiplicity (cardinality) in association?', a: 'It specifies how many objects take part on each side: 1..1 / 0..1 (one-to-one), 1..* (one-to-many) and *..* (many-to-many). It decides whether you use a single reference or a collection.', level: 'Easy' },
    { q: 'How is association drawn in a UML class diagram?', a: 'As a solid line between the two classes, optionally with an arrow for direction, role names and multiplicity numbers at the ends. Aggregation adds a hollow diamond and composition a filled diamond at the whole side.', level: 'Easy' },
    { q: 'What is an association class? Give an example.', a: 'A class that represents the link itself when the link has its own data. Example: Enrollment between Student and Course with a Grade, or Appointment between Doctor and Patient with a time slot. In SQL it becomes a junction table.', level: 'Medium' },
    { q: 'How do you avoid infinite recursion when syncing a bidirectional association?', a: 'Check whether the link already exists before adding (if (!Students.Contains(s))), so the second call from the other side does nothing. Another approach is to have one side own the sync logic and use internal methods on the other side.', level: 'Hard' },
    { q: 'Is association the same as dependency?', a: 'No. Dependency is a temporary use: the object is only received as a method parameter or created as a local variable and is not stored. Association stores the reference in a field/property, so the link lasts beyond a single method call.', level: 'Medium' },
    { q: 'Output (assume Car.Model has a public setter)? var c = new Car("Swift"); var d1 = new Driver("A"); var d2 = new Driver("B"); d1.AssignCar(c); d2.AssignCar(c); c.Model = "Dzire"; Console.WriteLine(d1.CurrentCar.Model + " " + d2.CurrentCar.Model);', a: 'It prints "Dzire Dzire". Both drivers reference the same Car object; changing the model through c is seen through both references because Car is a reference type.', level: 'Medium' },
    { q: 'How does association map to a relational database and EF Core?', a: 'A many-to-one association becomes a foreign key column (Orders.CustomerId). Many-to-many becomes a junction table. In EF Core the references are navigation properties (public Customer Customer { get; set; } and public List<Order> Orders { get; set; }).', level: 'Medium' },
    { q: 'When should a mandatory association be set through the constructor?', a: 'When the object is invalid without the link (an Order must have a Customer). Taking it in the constructor guarantees the object is never created in an invalid state; optional links can be set later through a property or method.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create Bank and Customer classes. A Customer can have accounts in many banks and a Bank has many customers. Write a bidirectional association with AddCustomer/AddBank that stays in sync, then print both sides.',
      hint: 'Copy the Teacher/Student pattern: List on both sides and a Contains check before adding.',
      solution: `class Bank
{
    public string Name { get; }
    public List<Customer> Customers { get; } = new();
    public Bank(string n) { Name = n; }
    public void AddCustomer(Customer c)
    {
        if (Customers.Contains(c)) return;
        Customers.Add(c);
        c.AddBank(this);
    }
}

class Customer
{
    public string Name { get; }
    public List<Bank> Banks { get; } = new();
    public Customer(string n) { Name = n; }
    public void AddBank(Bank b)
    {
        if (Banks.Contains(b)) return;
        Banks.Add(b);
        b.AddCustomer(this);
    }
}`,
    },
    {
      task: 'Model a Library where a Member can borrow at most one Book at a time (0..1). Write Borrow(Book) and Return() methods and print messages when a member tries to borrow while already holding a book.',
      hint: 'Use a nullable property Book? Borrowed { get; private set; } and check it before assigning.',
      solution: `class Book { public string Title { get; } public Book(string t) { Title = t; } }

class Member
{
    public string Name { get; }
    public Book? Borrowed { get; private set; }
    public Member(string n) { Name = n; }

    public void Borrow(Book b)
    {
        if (Borrowed != null) { Console.WriteLine($"{Name} must return {Borrowed.Title} first"); return; }
        Borrowed = b;
        Console.WriteLine($"{Name} borrowed {b.Title}");
    }

    public void Return()
    {
        if (Borrowed == null) return;
        Console.WriteLine($"{Name} returned {Borrowed.Title}");
        Borrowed = null;
    }
}`,
    },
    {
      task: 'Create Student, Course and an Enrollment association class with a Marks property. Add 4 enrollments and print the average marks of each course.',
      hint: 'Keep a List<Enrollment>; use LINQ GroupBy(e => e.Course.Title) and Average.',
      solution: `class Student { public string Name { get; } public Student(string n) { Name = n; } }
class Course  { public string Title { get; } public Course(string t) { Title = t; } }
class Enrollment
{
    public Student Student { get; } public Course Course { get; } public int Marks { get; }
    public Enrollment(Student s, Course c, int m) { Student = s; Course = c; Marks = m; }
}

// in Main
var list = new List<Enrollment> { /* 4 enrollments */ };
foreach (var g in list.GroupBy(e => e.Course.Title))
    Console.WriteLine($"{g.Key}: {g.Sum(e => e.Marks) / g.Count()}");`,
    },
    {
      task: 'Write an Employee class with a Manager property of type Employee? (self-association). Build a small chain CEO -> Manager -> Developer and print the reporting chain of the developer.',
      hint: 'Loop: var e = dev; while (e != null) { print e.Name; e = e.Manager; }',
      solution: `class Employee
{
    public string Name { get; }
    public Employee? Manager { get; set; }
    public Employee(string n) { Name = n; }
}

var ceo = new Employee("Kavya");
var mgr = new Employee("Rohit") { Manager = ceo };
var dev = new Employee("Sam") { Manager = mgr };

for (Employee? e = dev; e != null; e = e.Manager)
    Console.WriteLine(e.Name);
// Sam, Rohit, Kavya`,
    },
  ],
  quiz: [
    {
      question: 'Which statement best describes association?',
      options: ['One class inherits from another', 'Two objects are linked and both have independent lifetimes', 'A class creates and owns its parts', 'A method temporarily uses a parameter'],
      answer: 1,
      explanation: 'Association is a link between objects with no ownership; each object can exist without the other.',
    },
    {
      question: 'Teacher has List<Student> and Student has List<Teacher>. This is a...',
      options: ['Unidirectional one-to-one association', 'Composition', 'Bidirectional many-to-many association', 'Dependency'],
      answer: 2,
      explanation: 'Both sides reference collections of the other, so it is bidirectional and many-to-many.',
    },
    {
      question: 'In a UML class diagram, a plain association is drawn as...',
      options: ['A solid line between the classes', 'A dashed arrow', 'A line with a filled diamond', 'A hollow triangle arrow'],
      answer: 0,
      explanation: 'Solid line = association, dashed arrow = dependency, filled diamond = composition, hollow triangle = inheritance.',
    },
    {
      question: 'Where should you store extra data about a link, such as the grade of a student in a course?',
      options: ['In a static field of Student', 'In a parallel List<int> in Course', 'In a local variable', 'In an association class such as Enrollment'],
      answer: 3,
      explanation: 'An association class holds references to both sides plus the data that belongs to the link.',
    },
    {
      question: 'An Order class has "public Customer PlacedBy { get; }" and Customer has no reference back. What kind of association is this?',
      options: ['Bidirectional many-to-many', 'Unidirectional many-to-one', 'Composition', 'Inheritance'],
      answer: 1,
      explanation: 'Many orders point to one customer, and only Order knows the Customer: unidirectional many-to-one.',
    },
  ],
};
