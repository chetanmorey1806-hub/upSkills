export default {
  lesson: 'day-026-interfaces-multiple-implementation',
  minutes: 18,
  intro: 'Practise interfaces: declaring contracts, implementing several interfaces in one class, explicit implementation, and interface vs abstract class.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the class header so `SmsNotification` implements the interface `INotification`:\n`class SmsNotification ______________`',
      example: { title: 'implementing an interface', code: 'class PdfReport : IReport\n{\n    public void Generate() { ... }\n}' },
      accept: [': INotification', ':INotification'],
      caseSensitive: true,
      explain: 'Implementing an interface uses the same `:` syntax as inheritance. Interface names start with `I` by convention. The class must then provide every member the interface declares.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Programming to an interface: what does this print?',
      example: { title: 'interface reference', code: 'INotification n = new EmailNotification();\nn.Send("Hi");' },
      code: `INotification[] channels = { new Email(), new Sms(), new WhatsApp() };
foreach (var ch in channels)
    ch.Send("Fee due on 5th");

interface INotification
{
    void Send(string message);
}
class Email : INotification
{
    public void Send(string message) => Console.WriteLine("Email: " + message);
}
class Sms : INotification
{
    public void Send(string message) => Console.WriteLine("SMS: " + message.ToUpper());
}
class WhatsApp : INotification
{
    public void Send(string message) => Console.WriteLine("WhatsApp: " + message.Length);
}`,
      expected: `Email: Fee due on 5th
SMS: FEE DUE ON 5TH
WhatsApp: 14`,
      explain: 'The array holds `INotification` references; each object runs its own `Send`. "Fee due on 5th" has 14 characters (spaces count). Code that depends on the interface does not care which channel it gets.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'One class, several interfaces: what does this print?',
      example: { title: 'multiple interfaces', code: 'class SmartWatch : IClock, IFitnessTracker { ... }' },
      code: `var phone = new SmartPhone();
ICamera cam = phone;
IPhone call = phone;
cam.Click();
call.Dial("9876543210");
Console.WriteLine(phone is ICamera);

interface ICamera { void Click(); }
interface IPhone { void Dial(string number); }

class SmartPhone : ICamera, IPhone
{
    public void Click() => Console.WriteLine("Photo taken");
    public void Dial(string number) => Console.WriteLine("Calling " + number.Substring(6));
}`,
      expected: `Photo taken
Calling 3210
True`,
      explain: 'A class can implement **many interfaces** (but inherit only one class). The same object can be viewed through any of them. `Substring(6)` takes everything from index 6 → "3210". `is` checks whether the object implements ICamera → True.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Interface vs abstract class: which statements are TRUE? (choose all that apply)',
      options: [
        'A class can implement many interfaces but inherit from only one class',
        'Interfaces cannot have instance fields',
        'Abstract classes can have constructors; interfaces cannot',
        'Interface members are private by default',
        'Since C# 8 an interface may have default method implementations',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Interface members are **public** by default (not private). Interfaces hold no instance state (fields) and have no constructors. C# 8 added **default interface methods**, but abstract classes are still the choice for shared state and constructor logic.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A class implements `IPrinter.Print()` **explicitly**: `void IPrinter.Print() { ... }`. How can you call it?',
      options: [
        'obj.Print() on a variable of the class type',
        'Only through an IPrinter reference, e.g. ((IPrinter)obj).Print()',
        'It can never be called',
        'Only from a static method',
      ],
      answer: 1,
      explain: 'Explicit implementations are hidden from the class\'s public surface; you must view the object as the interface. This is used when two interfaces have methods with the same name, or to keep a member out of the normal API.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A `Checkout` class receives an `IPaymentGateway` in its constructor instead of creating `new RazorpayGateway()` itself. What is the main benefit?',
      options: [
        'It runs faster',
        'Checkout is loosely coupled: any gateway (Razorpay, Paytm, a fake for testing) can be passed in without changing Checkout',
        'It avoids using interfaces',
        'It makes Checkout abstract',
      ],
      answer: 1,
      explain: 'Depending on an **interface** and receiving the implementation from outside (constructor injection) means you can swap gateways or use a mock in unit tests. ASP.NET Core\'s dependency injection is built on this idea.',
    },
  ],
};
