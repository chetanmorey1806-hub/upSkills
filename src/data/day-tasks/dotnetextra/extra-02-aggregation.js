export default {
  lesson: 'extra-02-aggregation',
  minutes: 20,
  intro: 'Model "has-a" aggregation where a container holds parts that are created outside it and outlive it.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In **aggregation**, where are the part objects usually created?',
      options: ['Inside the container\'s constructor with `new`', 'Outside the container, then passed in or added', 'Only inside static methods', 'Parts are never objects'],
      answer: 1,
      explain: 'Aggregation is a weak "has-a": a `Department` has `Employee`s, but the employees are created elsewhere and **added**. Because the container did not create them, they survive when the container is gone. Creating parts inside the constructor is the mark of composition.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good examples of **aggregation**? Select all that apply.',
      options: ['Department has Employees', 'Playlist has Songs', 'Human has a Heart', 'Cricket Team has Players', 'Invoice has its own InvoiceLines created with it'],
      answers: [0, 1, 3],
      explain: 'Employees, songs and players exist on their own and can move to another department, playlist or team. A heart and invoice lines are created with their owner and die with it, which is composition.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'adding an existing object', code: `var e = new Employee("Asha");
dept.Add(e);   // dept only keeps a reference` },
      code: `var asha = new Employee("Asha");
var ravi = new Employee("Ravi");
var it = new Department("IT");
it.Staff.Add(asha);
it.Staff.Add(ravi);
Console.WriteLine(it.Staff.Count);

it = null;                        // department closed
var hr = new Department("HR");
hr.Staff.Add(asha);               // Asha moves to HR
Console.WriteLine(hr.Staff[0].Name);
Console.WriteLine(ravi.Name);

class Employee { public string Name; public Employee(string n) { Name = n; } }
class Department
{
    public string Title;
    public List<Employee> Staff = new();
    public Department(string t) { Title = t; }
}`,
      expected: `2
Asha
Ravi`,
      explain: 'The IT department holds 2 references. Setting `it = null` removes the department, but Asha and Ravi are still referenced by their own variables, so they live on. Asha can even join HR. Parts outliving the container is exactly what aggregation means.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the method so a playlist can **add an existing song** (aggregation, no \`new Song\` inside):
\`public void AddSong(Song song) { ______ }\``,
      example: { title: 'similar method', code: 'public void AddPlayer(Player p) { Players.Add(p); }' },
      accept: ['Songs.Add(song);', 'Songs.Add(song)', 'this.Songs.Add(song);', 'this.Songs.Add(song)', '_songs.Add(song);', '_songs.Add(song)'],
      caseSensitive: true,
      explain: 'The song object comes in from outside, so the container only stores the reference: `Songs.Add(song);`. Writing `Songs.Add(new Song(...))` would create the part inside, which is composition and also ignores the argument.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The same player is shared by two teams. What does this print?',
      example: { title: 'shared reference', text: 'Two lists can hold the **same** object. Changing it through one list is visible through the other.' },
      code: `var virat = new Player("Virat");
var india = new List<Player> { virat };
var rcb = new List<Player> { virat };

india[0].Runs += 50;
rcb[0].Runs += 30;
Console.WriteLine(virat.Runs);
rcb.Clear();
Console.WriteLine(india.Count);
Console.WriteLine(india[0].Runs);

class Player { public string Name; public int Runs; public Player(string n) { Name = n; } }`,
      expected: `80
1
80`,
      explain: 'Both lists hold a reference to the **same** `Player` object, so 50 + 30 = 80 runs. Clearing the RCB list only removes that list\'s reference; the player and India\'s list are untouched. Aggregated parts can be shared because the container does not own them.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a UML class diagram, aggregation is drawn with…',
      options: ['A filled (black) diamond at the container end', 'A hollow (white) diamond at the container end', 'A hollow triangle arrow', 'A dashed arrow'],
      answer: 1,
      explain: 'A **hollow diamond** marks aggregation (weak ownership). A filled diamond is composition, a hollow triangle is inheritance and a dashed arrow is dependency.',
    },
  ],
};
