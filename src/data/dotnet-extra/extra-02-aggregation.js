const departmentEmployees = `using System;
using System.Collections.Generic;

class Employee
{
    public string Name { get; }
    public Employee(string name) { Name = name; }
}

class Department
{
    public string Title { get; }
    private readonly List<Employee> _members = new List<Employee>();

    public Department(string title) { Title = title; }

    // Aggregation: the part is created OUTSIDE and only added to the whole
    public void Add(Employee e) => _members.Add(e);

    public void Show()
    {
        Console.WriteLine($"{Title} ({_members.Count} members)");
        foreach (var e in _members)
            Console.WriteLine($" - {e.Name}");
    }
}

class Program
{
    static void Main()
    {
        var anil = new Employee("Anil");
        var sara = new Employee("Sara");

        var it = new Department("IT");
        it.Add(anil);
        it.Add(sara);
        it.Show();

        it = null!;   // the department is closed / no longer used
        Console.WriteLine($"Still employed elsewhere: {anil.Name}, {sara.Name}");
    }
}
`;

const teamPlayer = `using System;
using System.Collections.Generic;

class Player
{
    public string Name { get; }
    public int Goals { get; set; }
    public Player(string name) { Name = name; }
}

class Team
{
    public string Name { get; }
    public List<Player> Squad { get; } = new List<Player>();
    public Team(string name) { Name = name; }
}

class Program
{
    static void Main()
    {
        var sunil = new Player("Sunil");
        var club = new Team("Bengaluru FC");
        var national = new Team("India");

        club.Squad.Add(sunil);
        national.Squad.Add(sunil);      // the SAME part is shared by two wholes

        club.Squad[0].Goals += 2;       // scores 2 for the club
        national.Squad[0].Goals += 1;   // scores 1 for the country

        Console.WriteLine($"{sunil.Name} total goals: {sunil.Goals}");
        Console.WriteLine($"Same object? {ReferenceEquals(club.Squad[0], national.Squad[0])}");

        club.Squad.Remove(sunil);       // leaves the club, still plays for India
        Console.WriteLine($"Club squad: {club.Squad.Count}, National squad: {national.Squad.Count}");
    }
}
`;

const playlistSongs = `using System;
using System.Collections.Generic;

class Song
{
    public string Title { get; }
    public int Seconds { get; }
    public Song(string title, int seconds) { Title = title; Seconds = seconds; }
}

class Playlist
{
    public string Name { get; }
    private readonly List<Song> _songs = new List<Song>();

    public Playlist(string name) { Name = name; }

    public void Add(Song s) => _songs.Add(s);

    public int TotalSeconds()
    {
        int total = 0;
        foreach (var s in _songs) total += s.Seconds;
        return total;
    }

    public void Clear() => _songs.Clear();
}

class Program
{
    static void Main()
    {
        var library = new List<Song>
        {
            new Song("Kesariya", 268),
            new Song("Tum Hi Ho", 262),
            new Song("Jai Ho", 320)
        };

        var gym = new Playlist("Gym Mix");
        gym.Add(library[0]);
        gym.Add(library[2]);

        int t = gym.TotalSeconds();
        Console.WriteLine($"{gym.Name}: {t / 60} min {t % 60} sec");

        gym.Clear();
        Console.WriteLine($"Playlist emptied, library still has {library.Count} songs");
    }
}
`;

const courseStudents = `using System;
using System.Collections.Generic;

class Student
{
    public int RollNo { get; }
    public string Name { get; }
    public Student(int rollNo, string name) { RollNo = rollNo; Name = name; }
}

class Course
{
    public string Title { get; }
    private readonly List<Student> _students;

    // Aggregation through the constructor: an existing list of students is handed in
    public Course(string title, IEnumerable<Student> students)
    {
        Title = title;
        _students = new List<Student>(students);   // copy the references, not the students
    }

    public void Drop(int rollNo) => _students.RemoveAll(s => s.RollNo == rollNo);

    public void Print()
    {
        Console.Write($"{Title}: ");
        Console.WriteLine(string.Join(", ", _students.ConvertAll(s => s.Name)));
    }
}

class Program
{
    static void Main()
    {
        var batch = new List<Student>
        {
            new Student(1, "Asha"),
            new Student(2, "Ravi"),
            new Student(3, "Meera")
        };

        var csharp = new Course("C#", batch);
        var sql = new Course("SQL", batch);

        csharp.Drop(2);
        csharp.Print();
        sql.Print();
        Console.WriteLine($"Students in the batch: {batch.Count}");
    }
}
`;

export default {
  id: 'extra-02-aggregation',
  title: 'Aggregation (Weak Has-a, Whole-Part with Independent Parts)',
  module: 'Extra: OOP Concepts',
  extraNo: 2,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Aggregation is a special kind of association with a whole-part meaning where the parts can live on their own: a Department has Employees, a Team has Players, a Playlist has Songs. Delete the department and the employees still exist. Learn how to recognise aggregation, how it looks in UML (hollow diamond), how to code it in C# by passing existing objects in, and how it differs from composition.`,
  objectives: [
    'Define aggregation as a weak whole-part relationship with independent lifetimes',
    'Describe aggregation in UML terms (hollow diamond at the whole side)',
    'Implement aggregation in C# by injecting existing objects through methods or constructors',
    'Show that one part can be shared by many wholes and survives when the whole is gone',
    'Choose correctly between association, aggregation and composition in design questions',
  ],
  theory: [
    {
      heading: 'What is Aggregation?',
      content: `**Aggregation** is a "**has-a**" relationship where one object (the **whole** or container) groups other objects (the **parts**), but **does not own their lifetime**. Parts are created outside, can be shared, and continue to exist when the whole is destroyed.

Real-world analogies:
- **Department and Professors**: if the Physics department is closed, the professors still exist and can join another department.
- **Cricket Team and Players**: a player can play for an IPL team and for India at the same time.
- **Playlist and Songs**: deleting your "Gym Mix" playlist does not delete the songs from your music library.
- **Car and Driver's sunglasses** kept in the car: the car "has" them, but they are not part of the car.

Aggregation is a **specialised association**: it is still a link between independent objects, but now with a clear "whole contains part" meaning.`,
      points: [
        'Whole-part relationship ("has-a"), but weak',
        'Parts are created outside the whole and passed in',
        'A part may belong to several wholes at once',
        'Destroying the whole does not destroy the parts',
      ],
    },
    {
      heading: 'UML wording',
      content: `In a UML class diagram aggregation is drawn as a **solid line with a hollow (empty) diamond at the whole's end**.

Read it in words like: "Department **aggregates** 0..* Employees" or "Team **has** 11..* Players (shared)". The hollow diamond means "this is a container of independent things". Compare:

- **Hollow diamond** (aggregation): Department <>---- Employee
- **Filled diamond** (composition): House <#>---- Room
- **Plain line** (association): Driver ----- Car

Many teams use plain association lines instead of hollow diamonds because the difference is mostly about meaning and lifetime, not code. In interviews, however, you must know the symbol and the lifetime rule.`,
      tip: 'Memory trick: the hollow diamond is "empty" - the whole can be emptied without killing anything.',
    },
    {
      heading: 'How aggregation looks in C#',
      content: `C# has no special keyword for aggregation. You express it through **how objects are created and passed**:

1. The **part objects are created outside** the whole (in Main, a service, or loaded from a database).
2. The whole receives them through a **method** (Add, Assign), a **property** or the **constructor** and stores the **references** in a field or collection.
3. The whole **never creates or disposes** the parts.

Because classes are reference types, the whole only stores a **reference** (address). Two wholes can store references to the same part object, and changes through one are visible through the other.`,
      syntax: `class Department
{
    private readonly List<Employee> _members = new();
    public void Add(Employee e) => _members.Add(e);   // part comes from outside
}

var anil = new Employee("Anil");      // created independently
var it = new Department("IT");
it.Add(anil);                         // aggregated`,
    },
    {
      heading: 'Aggregation vs Composition (the key interview question)',
      content: `| Point | Aggregation | Composition |
|---|---|---|
| Strength | Weak has-a | Strong owns-a ("part-of") |
| Who creates the part | Outside code | The whole, inside itself |
| Sharing | Part can belong to many wholes | Part belongs to exactly one whole |
| Lifetime | Part survives the whole | Part dies with the whole |
| UML | Hollow diamond | Filled diamond |
| Example | Team - Player, Library - Member | House - Room, Order - OrderLine |

Quick test: **"If I delete the whole, does deleting the part also make sense?"** Yes -> composition. No -> aggregation.`,
      points: [
        'Deleting a Team does not delete its Players -> aggregation',
        'Deleting an Invoice should delete its InvoiceLines -> composition',
        'In databases: aggregation is often an optional FK (SET NULL), composition a cascade delete',
      ],
    },
    {
      heading: 'Copying references and protecting the collection',
      content: `When a whole receives a list of parts in its constructor, decide whether it should **share the caller's list** or **copy the references** into its own list. Copying with \`new List<Student>(students)\` means removing a student from the Course does not remove them from the caller's batch list, but the Student objects themselves are still shared (no deep copy).

Expose the collection as **IReadOnlyList<T>** or through methods (Add, Remove) so outside code cannot break the whole's rules.`,
      syntax: `public Course(string title, IEnumerable<Student> students)
{
    _students = new List<Student>(students);   // new list, same Student objects
}
public IReadOnlyList<Student> Students => _students;`,
      tip: 'A shallow copy of a list copies references, not objects. That is exactly the right behaviour for aggregation.',
    },
  ],
  examples: [
    {
      title: 'Department aggregates Employees',
      scenario: 'An HR system where a department groups employees. When a department is closed the employees are not fired; they are moved elsewhere.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it AggregationDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run',
      ],
      code: departmentEmployees,
      csharp: { files: { 'Program.cs': departmentEmployees }, stdin: '' },
      result: `IT (2 members)
 - Anil
 - Sara
Still employed elsewhere: Anil, Sara`,
      explanation: `anil and sara are created in Main, outside the Department. The Department only stores references to them in a private list. After it = null the Department object is unreachable and will be garbage collected, but anil and sara are still referenced by Main, so they keep living. That independent lifetime of the parts is what makes this aggregation and not composition.`,
    },
    {
      title: 'One part shared by two wholes: Player in Club and National team',
      scenario: 'A sports stats app where a footballer plays for his club and his country. Goals scored for either team update the same player record.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it TeamAggregation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: press F9 on the Console.WriteLine line, run with F5 and add sunil, club.Squad and national.Squad to the Watch window',
      ],
      code: teamPlayer,
      csharp: { files: { 'Program.cs': teamPlayer }, stdin: '' },
      result: `Sunil total goals: 3
Same object? True
Club squad: 0, National squad: 1`,
      explanation: `Both Team objects hold a reference to the single sunil object, so club.Squad[0] and national.Squad[0] are the same object (ReferenceEquals is True). Goals 0 + 2 + 1 = 3. Removing sunil from the club list removes only the reference in that list; the national team still references him and the Player object is unaffected.`,
    },
    {
      title: 'Playlist aggregates Songs from a library',
      scenario: 'A music app: playlists pick songs from the main library. Clearing or deleting a playlist must never delete songs from the library.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PlaylistAggregation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: playlistSongs,
      csharp: { files: { 'Program.cs': playlistSongs }, stdin: '' },
      result: `Gym Mix: 9 min 48 sec
Playlist emptied, library still has 3 songs`,
      explanation: `The playlist holds Kesariya (268 s) and Jai Ho (320 s): 268 + 320 = 588 seconds. 588 / 60 = 9 (integer division) and 588 % 60 = 48. Clear() empties only the playlist's own list of references; the library list still has all 3 Song objects.`,
    },
    {
      title: 'Aggregation through the constructor: Course and Students',
      scenario: 'A training institute creates two courses for the same batch of students. Dropping a student from one course must not affect the batch or the other course.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it CourseAggregation',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: courseStudents,
      csharp: { files: { 'Program.cs': courseStudents }, stdin: '' },
      result: `C#: Asha, Meera
SQL: Asha, Ravi, Meera
Students in the batch: 3`,
      explanation: `Each Course copies the references from batch into its own new List, so the three Student objects are shared but the lists are separate. csharp.Drop(2) removes Ravi only from the C# course list. The SQL course and the original batch list still contain all three students.`,
    },
  ],
  interview: [
    { q: 'What is aggregation?', a: 'A weak whole-part (has-a) relationship where the whole contains references to parts that are created outside it and can live independently of it. Example: Department and Employees.', level: 'Easy' },
    { q: 'How is aggregation different from composition?', a: 'In aggregation the parts are created outside, can be shared, and survive when the whole is destroyed. In composition the whole creates and exclusively owns the parts, and they are destroyed with the whole.', level: 'Easy' },
    { q: 'How is aggregation shown in UML?', a: 'A solid line with a hollow (unfilled) diamond on the side of the whole/container class. Composition uses a filled diamond.', level: 'Easy' },
    { q: 'Is aggregation a type of association?', a: 'Yes. Aggregation is a specialised association that adds whole-part meaning. Composition is an even stronger specialisation.', level: 'Easy' },
    { q: 'Is there an "aggregation" keyword in C#?', a: 'No. Aggregation is expressed by design: the containing class stores references to objects that it receives from outside (via constructor, property or method) and does not control their lifetime.', level: 'Medium' },
    { q: 'Give three real-world examples of aggregation.', a: 'Team-Player (a player can move teams), Library-Member, Playlist-Song, Department-Professor, Car-Passenger. In each case the part makes sense on its own.', level: 'Easy' },
    { q: 'Can a part be shared by more than one whole in aggregation?', a: 'Yes. Because only references are stored, the same object can be in several containers (a player in a club and a national team). That is not allowed in composition.', level: 'Medium' },
    { q: 'Output? var p = new Player("A"); var t1 = new Team("X"); var t2 = new Team("Y"); t1.Squad.Add(p); t2.Squad.Add(p); t1.Squad.Clear(); Console.WriteLine(t2.Squad.Count + " " + p.Name);', a: 'It prints "1 A". Clearing t1 removes only t1\'s references; t2 still holds the player and the Player object still exists.', level: 'Medium' },
    { q: 'If a whole receives a List<T> in its constructor, should it store it directly or copy it?', a: 'Usually copy it into its own list (new List<T>(items)) so outside code cannot change the whole\'s collection behind its back. The copy is shallow: the parts are still the same shared objects, which is correct for aggregation.', level: 'Hard' },
    { q: 'How would you map aggregation to SQL Server tables?', a: 'Usually as a nullable foreign key in the part table (Employees.DepartmentId NULL) with ON DELETE SET NULL or NO ACTION, so deleting the department does not delete employees. Composition would typically use ON DELETE CASCADE.', level: 'Hard' },
    { q: 'Why should a container expose its parts as IReadOnlyList<T> instead of List<T>?', a: 'To keep encapsulation: callers can read the parts but must go through methods like Add/Remove that can enforce rules (no duplicates, maximum size, logging).', level: 'Medium' },
    { q: 'A Car has an Engine and a Driver. Which is aggregation and which is composition?', a: 'Engine is usually composition (created with and part of the car, scrapped with it). Driver is aggregation or plain association (the driver exists independently and can drive other cars).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Library class that aggregates Member objects. Add AddMember, RemoveMember and Print methods. Show that after removing a member from the library the Member object can still be used.',
      hint: 'Create members in Main, add them, remove one, then print the removed member\'s name from the Main variable.',
      solution: `class Member { public string Name { get; } public Member(string n) { Name = n; } }

class Library
{
    private readonly List<Member> _members = new();
    public void AddMember(Member m) => _members.Add(m);
    public void RemoveMember(Member m) => _members.Remove(m);
    public void Print() => Console.WriteLine(string.Join(", ", _members.ConvertAll(m => m.Name)));
}

var a = new Member("Asha"); var b = new Member("Ravi");
var lib = new Library(); lib.AddMember(a); lib.AddMember(b);
lib.RemoveMember(b); lib.Print();                 // Asha
Console.WriteLine($"{b.Name} still exists");     // Ravi still exists`,
    },
    {
      task: 'Model a Classroom that aggregates up to 3 Students. Add returns false when full. Expose Students as IReadOnlyList<Student>.',
      hint: 'Check _students.Count >= 3 before adding.',
      solution: `class Classroom
{
    private readonly List<Student> _students = new();
    public IReadOnlyList<Student> Students => _students;
    public bool Add(Student s)
    {
        if (_students.Count >= 3 || _students.Contains(s)) return false;
        _students.Add(s);
        return true;
    }
}`,
    },
    {
      task: 'Create a Project class that aggregates Employees. One employee works on two projects. Increase his HoursWorked from both projects and print the total.',
      hint: 'Same idea as the Player shared by two Teams.',
      solution: `class Employee { public string Name { get; } public int HoursWorked { get; set; } public Employee(string n) { Name = n; } }
class Project { public string Name { get; } public List<Employee> Team { get; } = new(); public Project(string n) { Name = n; } }

var dev = new Employee("Sam");
var p1 = new Project("ERP"); var p2 = new Project("CRM");
p1.Team.Add(dev); p2.Team.Add(dev);
p1.Team[0].HoursWorked += 6; p2.Team[0].HoursWorked += 3;
Console.WriteLine(dev.HoursWorked);   // 9`,
    },
    {
      task: 'For each pair, write whether it is association, aggregation or composition and why: (a) Person-Address book entry, (b) Book-Page, (c) Company-Employee, (d) Doctor-Patient, (e) Body-Heart.',
      hint: 'Ask: is there a whole-part meaning? Does the part die with the whole?',
      solution: `(a) Aggregation/association - a contact exists without your address book.
(b) Composition - pages are part of the book and are destroyed with it.
(c) Aggregation - employees exist before and after working for the company.
(d) Association - peers linked by appointments, no whole-part.
(e) Composition - the heart is part of the body and shares its lifetime.`,
    },
  ],
  quiz: [
    {
      question: 'In aggregation, what happens to the parts when the whole object is destroyed?',
      options: ['They are destroyed too', 'They throw an exception', 'They continue to exist', 'They become static'],
      answer: 2,
      explanation: 'Aggregated parts have independent lifetimes, so they survive the whole.',
    },
    {
      question: 'Which UML symbol represents aggregation?',
      options: ['Hollow diamond at the whole side', 'Filled diamond at the whole side', 'Dashed arrow', 'Hollow triangle'],
      answer: 0,
      explanation: 'Hollow diamond = aggregation; filled diamond = composition.',
    },
    {
      question: 'Which of these is the BEST example of aggregation?',
      options: ['House and its Rooms', 'Invoice and its InvoiceLines', 'Human and Heart', 'Team and Players'],
      answer: 3,
      explanation: 'Players exist independently and can join other teams; the other three are composition.',
    },
    {
      question: 'How are parts usually supplied to the whole in aggregation in C#?',
      options: ['The whole creates them with new in its constructor', 'They are created outside and passed in through a constructor, property or method', 'Through inheritance', 'Using the sealed keyword'],
      answer: 1,
      explanation: 'Creating parts inside the whole is composition; aggregation receives existing objects.',
    },
    {
      question: 'Two Course objects copy references from the same student list. A student is dropped from one course. What happens?',
      options: ['The student object is deleted', 'Only that course\'s list loses the reference; the other course and the student are unchanged', 'Both courses lose the student', 'Compile-time error'],
      answer: 1,
      explanation: 'Each course has its own list of references; removing from one list affects only that list.',
    },
  ],
};
