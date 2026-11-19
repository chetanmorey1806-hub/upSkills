export default {
  lesson: 'extra-13-nested-classes',
  minutes: 20,
  intro: 'Declare classes inside classes, control their visibility and access the outer class\'s private members.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the **default** access modifier of a nested class declared without one?',
      options: ['public', 'internal', 'private', 'protected'],
      answer: 2,
      explain: 'Members of a class, including nested types, are `private` by default. A top-level class defaults to `internal`. So `class Node` inside `LinkedList` is invisible outside unless you mark it `public`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `\`Bank\` has a **public** nested class \`Account\`. Create one from outside:
\`var acc = new ______();\``,
      example: { title: 'referring to a nested type', code: 'var item = new Order.Line();  // Outer.Inner' },
      accept: ['Bank.Account'],
      caseSensitive: true,
      explain: 'Outside the outer class you refer to a nested type through its container: `Bank.Account`. Writing just `Account` only works inside `Bank`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'nested class reads private static member', code: `class Outer
{
    private static int secret = 7;
    public class Inner { public int Get() => secret; }
}` },
      code: `var o = new Order(1200);
var v = new Order.Validator();
Console.WriteLine(v.IsValid(o));
Console.WriteLine(v.IsValid(new Order(0)));
Console.WriteLine(Order.Validator.Limit);

class Order
{
    private int _amount;
    public Order(int amount) { _amount = amount; }

    public class Validator
    {
        public const int Limit = 50000;
        public bool IsValid(Order o) => o._amount > 0 && o._amount <= Limit;
    }
}`,
      expected: `True
False
50000`,
      explain: 'A nested class can read **private** members of an instance of its outer class (`o._amount`), because it is a member of `Order`. 1200 is valid, 0 is not. The const is reached as `Order.Validator.Limit`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE about nested classes in C#? Select all that apply.',
      options: ['A nested class automatically has a reference to an outer object (like Java inner classes)', 'A nested class can access private members of the outer class', 'A nested class can be marked `private` to hide a helper type', 'An object of the outer class always contains an object of the nested class', 'Nested types can themselves be generic'],
      answers: [1, 2, 4],
      explain: 'C# nested classes are like Java **static** nested classes: there is no hidden outer `this`, so you must pass an outer object in to use its instance members. Creating an outer object does not create a nested object. They can be private (hidden helpers) and generic.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A private nested `Node` class used by a simple stack. What does this print?',
      example: { title: 'private helper type', code: `class Queue
{
    private class Node { public int Val; public Node? Next; }
}` },
      code: `var s = new IntStack();
s.Push(10);
s.Push(20);
s.Push(30);
Console.WriteLine(s.Pop());
Console.WriteLine(s.Pop());
s.Push(40);
Console.WriteLine(s.Count);
Console.WriteLine(s.Pop());

class IntStack
{
    private class Node { public int Val; public Node? Next; }
    private Node? _top;
    public int Count { get; private set; }
    public void Push(int v) { _top = new Node { Val = v, Next = _top }; Count++; }
    public int Pop() { var v = _top!.Val; _top = _top.Next; Count--; return v; }
}`,
      expected: `30
20
2
40`,
      explain: 'Stack = last in, first out. Pop gives 30, then 20. Pushing 40 leaves 10 and 40: Count = 2. The next Pop returns 40. `Node` is a private nested class, so users of `IntStack` cannot see or misuse it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When is a nested class a good design choice?',
      options: ['Whenever a class is longer than 100 lines', 'When the type is only meaningful to (and used by) its outer class, e.g. a linked list `Node`', 'To make all classes share the same namespace', 'To get multiple inheritance'],
      answer: 1,
      explain: 'Nest a type when it is an implementation detail of one class (Node, Enumerator, Builder). If other parts of the app use it, a normal top-level class is clearer.',
    },
  ],
};
