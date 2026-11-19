export default {
  lesson: 'extra-01-association',
  minutes: 20,
  intro: 'Recognise association ("uses-a") between independent objects in C# and trace how the links change at runtime.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement best describes **association** between two classes?',
      options: [
        'One class inherits all members of the other class',
        'Two independent objects are linked ("uses-a"); each can exist without the other',
        'The child object is created and destroyed inside the parent',
        'Both classes must be declared in the same file',
      ],
      answer: 1,
      explain: 'Association is the loosest "has/uses" relationship: a `Driver` uses a `Car`, but both are created independently and live on their own. Inheritance is "is-a", and an object created and destroyed inside its owner is composition.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which pairs are typical examples of **association** (both objects exist independently)? Select all that apply.',
      options: ['Doctor ↔ Patient', 'Teacher ↔ Student', 'House → Room (rooms are built inside the house)', 'Customer ↔ Bank account manager', 'Car → Engine created in the Car constructor'],
      answers: [0, 1, 3],
      explain: 'A doctor treats many patients, a teacher teaches many students and a customer talks to a manager: all are independent objects that only know each other. Rooms created inside a house and an engine created in the car constructor depend on their owner for their lifetime, which is **composition**.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'association through a property', code: `var c = new Car("Alto");
d.AssignCar(c);   // the driver now refers to an existing car` },
      code: `var swift = new Car("Swift");
var ravi = new Driver("Ravi");
ravi.Drive();
ravi.CurrentCar = swift;
ravi.Drive();
ravi.CurrentCar = new Car("City");
ravi.Drive();
Console.WriteLine(swift.Model);

class Car { public string Model; public Car(string m) { Model = m; } }
class Driver
{
    public string Name;
    public Car? CurrentCar;
    public Driver(string n) { Name = n; }
    public void Drive() =>
        Console.WriteLine(CurrentCar == null ? $"{Name} walks" : $"{Name} drives {CurrentCar.Model}");
}`,
      expected: `Ravi walks
Ravi drives Swift
Ravi drives City
Swift`,
      explain: 'At first `CurrentCar` is null, so Ravi walks. The link then points to Swift, then to City. Changing the link does **not** destroy Swift: the car object still exists and prints its model. That independence is what makes it association.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the property so a \`Patient\` can be linked to a doctor later (it may be empty at first):
\`public ______ AssignedDoctor { get; set; }\``,
      example: { title: 'optional link', code: 'public Car? CurrentCar { get; set; }  // may be null until assigned' },
      accept: ['Doctor?', 'Doctor'],
      acceptRegex: ['^Doctor\\s*\\??$'],
      caseSensitive: true,
      explain: 'Association is just a **reference** to another independent object, so the property type is the other class: `Doctor?` (nullable because the patient may not have a doctor yet). The patient does not create the doctor with `new` inside itself.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Many-to-many association: what does this print?',
      example: { title: 'keeping both sides in sync', code: `teacher.Students.Add(s);
s.Teachers.Add(teacher);` },
      code: `var rao = new Teacher("Rao");
var meera = new Teacher("Meera");
var asha = new Student("Asha");
var ravi = new Student("Ravi");

Link(rao, asha);
Link(rao, ravi);
Link(meera, asha);

Console.WriteLine(rao.Students.Count);
Console.WriteLine(asha.Teachers.Count);
Console.WriteLine(ravi.Teachers[0].Name);
Console.WriteLine(meera.Students[0].Name);

static void Link(Teacher t, Student s) { t.Students.Add(s); s.Teachers.Add(t); }

class Teacher { public string Name; public List<Student> Students = new(); public Teacher(string n) { Name = n; } }
class Student { public string Name; public List<Teacher> Teachers = new(); public Student(string n) { Name = n; } }`,
      expected: `2
2
Rao
Asha`,
      explain: 'Rao is linked to Asha and Ravi (2 students). Asha is linked to Rao and Meera (2 teachers). Ravi only has Rao; Meera only has Asha. In a many-to-many association each side keeps a list of references, and the `Link` helper updates **both** lists so they never get out of sync.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An `Order` stores a reference to an existing `Customer`. The order is deleted. What should happen to the customer?',
      options: ['The customer is deleted too', 'Nothing: the customer still exists for other orders', 'The customer becomes null everywhere', 'The program throws an exception'],
      answer: 1,
      explain: 'Order → Customer is an association: the customer existed before the order and is shared by many orders. Removing one order only removes that link. Deleting the customer along with the order would be treating it like composition, a common design mistake.',
    },
  ],
};
