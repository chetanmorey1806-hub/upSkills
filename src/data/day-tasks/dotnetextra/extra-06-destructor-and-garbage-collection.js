export default {
  lesson: 'extra-06-destructor-and-garbage-collection',
  minutes: 20,
  intro: 'Understand how the .NET garbage collector frees memory, what finalizers (destructors) do and why you should rarely rely on them.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'When does the .NET garbage collector free an object?',
      options: ['Immediately when the variable goes out of scope', 'At some later time after the object is no longer reachable from any root', 'When you call `delete obj;`', 'Only when the program ends'],
      answer: 1,
      explain: 'The GC is **non-deterministic**: it runs when memory pressure requires it and frees objects that no root (local variable, static field, CPU register) can reach. C# has no `delete` keyword, and leaving a scope only makes the object eligible for collection.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Write the declaration line of a **finalizer** (destructor) for class \`FileLogger\` (just the signature, no body):`,
      example: { title: 'finalizer of another class', code: `class Connection
{
    ~Connection() { Console.WriteLine("finalized"); }
}` },
      accept: ['~FileLogger()', '~FileLogger() { }', '~FileLogger(){}'],
      acceptRegex: ['^~\\s*FileLogger\\s*\\(\\s*\\)\\s*(\\{\\s*\\})?$'],
      caseSensitive: true,
      explain: 'A finalizer is written as `~ClassName()`: no access modifier, no return type, no parameters. Adding `public` or a parameter is a compile error. The compiler turns it into an override of `Object.Finalize()`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about finalizers are TRUE? Select all that apply.',
      options: ['You cannot call a finalizer directly', 'A class can have only one finalizer', 'Finalizers run at a predictable time, right after the last use', 'Objects with a finalizer survive at least one extra GC before their memory is freed', 'Structs can declare finalizers'],
      answers: [0, 1, 3],
      explain: 'Only the GC calls finalizers, one per class, at an unpredictable time. Finalizable objects are put on the finalization queue and need one more collection to be reclaimed, which is why they cost performance. Structs cannot have finalizers.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The GC uses generations 0, 1 and 2. Which objects are usually in **generation 2**?',
      options: ['Newly created temporary objects', 'Long-lived objects that survived earlier collections (e.g. caches, static data)', 'Only strings', 'Objects that have a finalizer'],
      answer: 1,
      explain: 'New objects start in Gen 0. Each time an object survives a collection it is promoted (Gen 0 → 1 → 2). Gen 2 holds long-lived data. Gen 0 is collected most often because most objects die young.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside \`Dispose()\`, after cleaning up, which call tells the GC **not** to run the finalizer for this object?
\`______(this);\``,
      example: { title: 'dispose pattern skeleton', code: `public void Dispose()
{
    Dispose(true);
    // tell the GC the finalizer is no longer needed
}` },
      accept: ['GC.SuppressFinalize', 'GC.SuppressFinalize(this);', 'GC.SuppressFinalize(this)', 'System.GC.SuppressFinalize'],
      caseSensitive: true,
      explain: '`GC.SuppressFinalize(this)` removes the object from the finalization queue because the resources are already released, so it can be collected in a single GC. Forgetting it keeps the costly finalizer running needlessly.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices are recommended? Select all that apply.',
      options: ['Release files, DB connections and sockets with `Dispose()`/`using`', 'Call `GC.Collect()` after every request to keep memory low', 'Add a finalizer only when the class directly owns an unmanaged handle', 'Set every local variable to `null` at the end of each method', 'Rely on the finalizer to close database connections'],
      answers: [0, 2],
      explain: 'Deterministic cleanup belongs in `Dispose()`. Finalizers are a safety net only for classes holding raw unmanaged handles. Forcing `GC.Collect()` hurts performance, nulling locals is pointless, and finalizers run too late to close connections reliably.',
    },
  ],
};
