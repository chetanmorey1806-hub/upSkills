export default {
  lesson: 'day-24-angular-basics-components-binding-signals',
  minutes: 25,
  intro: 'Use the Angular CLI, pick the right binding syntax, predict what @if/@for templates render, reason about signals and computed values, and format output with pipes.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Write the Angular CLI command that generates a new component named **student-card** (full or short form).',
      example: { title: 'Generating a service', code: 'ng generate service services/student\nng g s services/student' },
      accept: ['ng generate component student-card', 'ng g c student-card', 'ng g component student-card', 'ng generate c student-card'],
      explain: '`ng generate component` (short `ng g c`) creates the .ts, .html, .css and .spec.ts files with the @Component boilerplate. In Angular 20+ the file is student-card.ts with class StudentCard; older versions create student-card.component.ts with StudentCardComponent.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The Save button must be disabled while the component property `isSaving` is true. Which template code is correct?',
      options: [
        '<button disabled="isSaving">Save</button>',
        '<button [disabled]="isSaving">Save</button>',
        '<button (disabled)="isSaving">Save</button>',
        '<button {{disabled}}="isSaving">Save</button>',
      ],
      answer: 1,
      explain: '**Property binding** `[disabled]="isSaving"` evaluates the expression and updates the DOM property whenever it changes. Without brackets, `disabled="isSaving"` is a plain attribute string, and any disabled attribute disables the button permanently. Parentheses are for events, not properties.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The component has `items = [{ id: 1, name: \'Pen\', stock: 0 }, { id: 2, name: \'Book\', stock: 5 }, { id: 3, name: \'Bag\', stock: 2 }]`. Write the text this template renders, one paragraph per line.',
      example: { title: '$index starts at 0', code: '@for (x of [\'a\', \'b\']; track x; let i = $index) {\n  <p>{{ i }}-{{ x }}</p>\n}\n<!-- 0-a, 1-b -->' },
      code: `@for (p of items; track p.id; let i = $index) {
  @if (p.stock > 0) {
    <p>{{ i + 1 }}. {{ p.name }} ({{ p.stock }})</p>
  } @else {
    <p>{{ i + 1 }}. {{ p.name }} - sold out</p>
  }
} @empty {
  <p>No products</p>
}`,
      expected: `1. Pen - sold out
2. Book (5)
3. Bag (2)`,
      explain: 'The loop runs once per item in order; `i + 1` turns the 0-based $index into 1, 2, 3. Pen has stock 0, so the @else branch renders "sold out". @empty is used only when the array has no items. `track p.id` lets Angular reuse rows when the list changes.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is logged? (`signal` and `computed` come from @angular/core.)',
      example: { title: 'Reading and writing a signal', code: 'const n = signal(1);\nn.set(5);\nn.update(v => v * 2);\nconsole.log(n());   // 10' },
      code: `const price = signal(100);
const qty = signal(2);
const total = computed(() => price() * qty());

console.log(total());
qty.set(3);
console.log(total());
price.update((p) => p - 20);
console.log(total());`,
      expected: `200
300
240`,
      explain: '100 x 2 = 200. After qty.set(3): 100 x 3 = 300. After update(p => p - 20) the price is 80: 80 x 3 = 240. computed tracks the signals it reads and recalculates only when one of them changed; between changes it returns the cached value.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about Angular signals are **true**? Select all that apply.',
      options: [
        'You read a signal by calling it, for example count() in the template',
        'computed signals are read-only and recalculate when the signals they read change',
        'this.items().push(newItem) is the recommended way to add to a signal array',
        'effect() is meant for side effects such as logging or saving to localStorage',
        'input.required<T>() creates a signal input the parent must bind, for example [line]="l"',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Mutating the array inside a signal (push) keeps the same reference, so Angular is not notified; use `items.update(list => [...list, newItem])`. The other statements describe signals correctly: call to read, computed for derived values, effect for side effects, input() for parent-to-child data.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The app uses the default en-US locale. Write what each line renders, one per line.',
      example: { title: 'Pipe syntax', code: '{{ value | pipeName: arg1 : arg2 }}\n{{ value | pipeA | pipeB }}   <!-- chaining -->' },
      code: `{{ 'priya sharma' | titlecase }}
{{ 0.456 | percent }}
{{ 8.6667 | number: '1.1-1' }}
{{ 'angular' | uppercase | slice: 0 : 3 }}`,
      expected: `Priya Sharma
46%
8.7
ANG`,
      explain: 'titlecase capitalises each word. percent multiplies by 100 and shows no decimals by default (45.6 rounds to 46). number: \'1.1-1\' means at least 1 integer digit and exactly 1 fraction digit, so 8.6667 becomes 8.7. Pipes chain left to right: uppercase first, then slice keeps characters 0 to 2.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A standalone component\'s template uses `<input [(ngModel)]="studentName" />`, but Angular reports **"Can\'t bind to \'ngModel\' since it isn\'t a known property of \'input\'"**. What is missing?',
      options: [
        'HttpClientModule in app.config.ts',
        'FormsModule in the component\'s imports array',
        'A @for block around the input',
        'The studentName property must be a signal',
      ],
      answer: 1,
      explain: 'ngModel is a directive from **FormsModule**. Standalone components must list what their template uses in `imports: [FormsModule]`. This error message is one of the most common ones beginners see.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which built-in pipe turns `\'asha patil\'` into `Asha Patil`?\n```html\n{{ student.name | ______ }}\n```',
      example: { title: 'Other text pipes', code: "{{ 'hello' | uppercase }}   <!-- HELLO -->\n{{ 'HELLO' | lowercase }}   <!-- hello -->" },
      accept: ['titlecase', 'TitleCasePipe'],
      explain: '`titlecase` capitalises the first letter of every word. In a standalone component import TitleCasePipe from @angular/common. Pipes only change how a value is displayed; the property itself stays "asha patil".',
    },
  ],
};
