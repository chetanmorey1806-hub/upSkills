export default {
  lesson: 'day-072-dependency-injection-service-lifetimes',
  minutes: 32,
  intro: 'Register services in the DI container, inject them through constructors and choose the right lifetime: Transient, Scoped or Singleton.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which lifetime gives **one instance per HTTP request**, shared by every class that asks for it during that request?',
      options: ['Transient', 'Scoped', 'Singleton', 'Static'],
      answer: 1,
      explain: '**Scoped** = one per request (scope). **Transient** = a new object every time it is injected. **Singleton** = one object for the whole app lifetime. `DbContext` is registered as Scoped by `AddDbContext`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Register `StudentService` as the implementation of `IStudentService` with a **scoped** lifetime:\n`builder.Services.______;`',
      example: { title: 'a singleton registration', code: 'builder.Services.AddSingleton<IClock, SystemClock>();' },
      accept: ['AddScoped<IStudentService, StudentService>()', 'AddScoped<IStudentService,StudentService>()'],
      acceptRegex: ['^AddScoped<\\s*IStudentService\\s*,\\s*StudentService\\s*>\\(\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'The first type is what consumers ask for (the interface), the second is what the container creates. Controllers then depend on `IStudentService` only, so you can swap in a fake in unit tests.',
    },
    {
      type: 'output',
      mins: 6,
      q: 'Each service gets `Id = ++counter` (a separate static counter per class) when it is **created**. During **one** request, a controller and a helper class both inject all three services. Then a **second** request does the same. What does the second request print for the controller line?',
      example: { title: 'counting creations', code: 'public class OpLogger { static int c; public int Id { get; } = ++c; }' },
      code: `builder.Services.AddTransient<TransientOp>();
builder.Services.AddScoped<ScopedOp>();
builder.Services.AddSingleton<SingletonOp>();

// in each request: controller is created first, then the helper
// controller prints:
Console.WriteLine($"T={t.Id} S={s.Id} G={g.Id}");`,
      expected: 'T=3 S=2 G=1',
      explain: 'Request 1 creates Transient #1 (controller) and #2 (helper), Scoped #1 (shared) and Singleton #1. Request 2: Transient #3 for the controller (new every injection), Scoped #2 (new request = new scope), Singleton still #1.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A **Singleton** service has a constructor parameter of a **Scoped** `AppDbContext`. What is the problem?',
      options: [
        'No problem, DI handles it',
        'Captive dependency: the singleton keeps one DbContext forever, shared across all requests and threads (ASP.NET Core throws in Development)',
        'The DbContext becomes transient',
        'The app becomes slower but correct',
      ],
      answer: 1,
      explain: 'A longer-lived service must not hold a shorter-lived one. The DbContext is not thread-safe and would be reused by every request. Scope validation in Development throws "Cannot consume scoped service from singleton".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are benefits of constructor injection? (choose all that apply)',
      options: ['Classes depend on interfaces, not concrete classes (loose coupling)', 'Easy unit testing with fake/mock implementations', 'The container manages object creation and disposal', 'Dependencies are visible in the constructor', 'It removes the need for interfaces in every case'],
      answers: [0, 1, 2, 3],
      explain: 'DI gives loose coupling, testability, lifetime management and explicit dependencies. You *can* inject concrete classes, but interfaces are what make swapping (e.g. a mock in tests) possible - DI does not make them pointless.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 10,
      q: '**Build a tiny DI container.** Write `createContainer()` returning `{ register(name, factory, lifetime), createScope() }`. `createScope()` returns `{ get(name) }`:\n- `"transient"` → call the factory on every `get`\n- `"scoped"` → one instance per scope\n- `"singleton"` → one instance for the whole container',
      example: { title: 'caching with a Map', code: 'const cache = new Map();\nif (!cache.has(key)) cache.set(key, create());\nreturn cache.get(key);' },
      starter: 'function createContainer() {\n  // TODO\n}\n',
      solution: 'function createContainer() {\n  const regs = new Map();\n  const singletons = new Map();\n  return {\n    register(name, factory, lifetime) { regs.set(name, { factory, lifetime }); },\n    createScope() {\n      const scoped = new Map();\n      return {\n        get(name) {\n          const { factory, lifetime } = regs.get(name);\n          if (lifetime === "transient") return factory();\n          const cache = lifetime === "singleton" ? singletons : scoped;\n          if (!cache.has(name)) cache.set(name, factory());\n          return cache.get(name);\n        },\n      };\n    },\n  };\n}\n',
      tests: [
        { call: '(() => { let n = 0; const c = createContainer(); c.register("t", () => ++n, "transient"); const s = c.createScope(); return [s.get("t"), s.get("t")]; })()', expect: [1, 2], msg: 'Transient must create a new instance on every get' },
        { call: '(() => { let n = 0; const c = createContainer(); c.register("s", () => ++n, "scoped"); const a = c.createScope(); const b = c.createScope(); return [a.get("s"), a.get("s"), b.get("s")]; })()', expect: [1, 1, 2], msg: 'Scoped must be shared inside a scope and new in another scope' },
        { call: '(() => { let n = 0; const c = createContainer(); c.register("g", () => ++n, "singleton"); return [c.createScope().get("g"), c.createScope().get("g")]; })()', expect: [1, 1], msg: 'Singleton must be the same in every scope' },
      ],
      explain: 'This is the core of `IServiceProvider`: registrations map a type to a factory and a lifetime, ASP.NET Core creates a **scope per request**, and the root provider holds singletons. Picking the wrong cache is exactly the lifetime bug you would create in C#.',
    },
  ],
};
