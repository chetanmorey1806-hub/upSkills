export default {
  id: 'day-24-angular-basics-components-binding-signals',
  title: 'Angular Basics: Angular CLI, Standalone Components, Templates, Data Binding, @if/@for Control Flow, Signals and Pipes',
  module: 'Module 6: TypeScript & Angular with .NET',
  day: 24,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Angular is the TypeScript front-end framework that many Indian service companies pair with ASP.NET Core. Create a project with the Angular CLI, build standalone components, display data with interpolation, connect the UI with property, event and two-way binding, render lists and conditions with the new @if/@for/@switch control flow, manage state with signals, and format values with pipes.',
  objectives: [
    'Create, run and build an Angular app and generate code with the Angular CLI',
    'Write standalone components with a selector, template, styles and imports',
    'Use interpolation, property binding, event binding, two-way binding and template reference variables',
    'Render conditions and lists with @if, @else, @for (track, $index, @empty) and @switch',
    'Manage component state with signal, computed and effect, pass data with input() and output(), and format values with built-in and custom pipes',
  ],
  theory: [
    {
      heading: 'What is Angular and why do .NET teams use it?',
      content:
        '**Angular** is a complete front-end framework from Google for building single-page applications (SPAs). The browser loads one page, and Angular swaps components in and out as the user navigates, calling your ASP.NET Core Web API for data.\n\nAngular is "batteries included": components, routing, forms, an HTTP client, dependency injection, testing and a CLI all come in one package with one official way of doing things. React is only a UI library where you choose routing, forms and state libraries yourself.\n\nWhy .NET developers feel at home:\n- It is written in and uses **TypeScript** (Days 22-23), with classes, interfaces, decorators and generics.\n- It has **dependency injection** with services, very similar to ASP.NET Core DI (`builder.Services.AddScoped`).\n- Decorators like `@Component` feel like C# attributes (`[ApiController]`).\n- Clear structure suits large enterprise teams (banking, insurance and ERP projects at TCS, Infosys, Accenture and product companies).\n\nVersions: "AngularJS" (1.x, 2010) is a different, dead framework. Modern Angular (2+) releases a major version every 6 months. Angular 17+ introduced the new control flow (`@if`, `@for`), standalone components by default (19+) and signals, which this lesson uses.',
      points: [
        'Angular = framework (routing, forms, HTTP, DI included); React = library',
        'Component = TypeScript class + HTML template + CSS',
        'Service = reusable logic or API calls, injected into components',
        'Angular CLI = generator, dev server, build and test runner',
      ],
    },
    {
      heading: 'Angular CLI and project structure',
      content:
        'The **Angular CLI** (`ng`) is the command-line tool for everything. Install it once with `npm install -g @angular/cli` (Node.js LTS required).\n\n- `ng new student-portal`: creates a new workspace, installs packages and sets up TypeScript, testing and the build. It asks about stylesheet format and SSR (server-side rendering); for learning choose CSS and no SSR.\n- `ng serve` (or `ng serve -o` to open the browser): starts the dev server on **http://localhost:4200** with live reload, like `dotnet watch`.\n- `ng generate component name` (`ng g c name`), `ng g service`, `ng g pipe`, `ng g interface`, `ng g guard`: create files with the right boilerplate.\n- `ng build`: optimised production bundle in `dist/<project>/browser`, which you can host on IIS, Azure Static Web Apps, nginx, or inside ASP.NET Core\'s wwwroot.\n- `ng test`: unit tests; `ng add <package>`: install and configure libraries (for example `ng add @angular/material`).\n\nImportant files:\n- `src/main.ts`: entry point, calls `bootstrapApplication(App, appConfig)`.\n- `src/app/app.config.ts`: application-wide providers (router, HttpClient, locale), similar to Program.cs service registration.\n- `src/app/app.ts` (+ `app.html`, `app.css`): the root component, rendered into `<app-root>` in `src/index.html`.\n- `src/app/app.routes.ts`: route definitions.\n- `angular.json` (workspace and build settings), `package.json` (npm packages and scripts), `tsconfig.json`.',
      tip: 'File naming changed in Angular 20: ng g c course-card now creates course-card.ts with class CourseCard. Older projects (and most tutorials) use course-card.component.ts and CourseCardComponent. Both work the same way.',
    },
    {
      heading: 'Standalone components and templates',
      content:
        'A **component** controls one piece of the screen. It is a TypeScript class decorated with `@Component`:\n- `selector`: the custom HTML tag, for example `app-course-card`, used as `<app-course-card />` in another template.\n- `template` (inline HTML) or `templateUrl` (separate .html file).\n- `styles` / `styleUrl`: CSS that is **scoped** to this component only (Angular rewrites selectors so `.card` here does not affect other components).\n- `imports`: the other components, directives and pipes this template uses.\n\n**Standalone** components (the default since Angular 19; in 17-18 you add `standalone: true`) list their own dependencies in `imports`, so you no longer need NgModules (`@NgModule` with declarations), which you will still see in older projects.\n\nThe class holds the data (properties) and behaviour (methods); the template displays them. When data changes, Angular\'s **change detection** updates the DOM automatically.\n\n**Interpolation** `{{ expression }}` shows a value as text: `{{ title }}`, `{{ fee * 2 }}`, `{{ feePerDay() }}`, `{{ seatsLeft < 5 ? \'hurry\' : \'\' }}`. Template expressions should be simple and fast, with no side effects (no assignments, no `new`, no API calls).',
      syntax: `@Component({
  selector: 'app-hello',
  template: '<h2>Hello {{ name }}, you have {{ courses.length }} courses</h2>',
})
export class Hello {
  name = 'Asha';
  courses = ['C#', 'Angular'];
}`,
    },
    {
      heading: 'Data binding: property, event and two-way',
      content:
        'Data binding connects the component class and the template:\n\n1. **Interpolation** `{{ value }}`: class -> text in the view.\n2. **Property binding** `[property]="expression"`: class -> DOM property or child component input. Examples: `<img [src]="photoUrl">`, `<button [disabled]="!isValid">`, `<app-cart-item [line]="l">`. Without brackets the value is treated as a plain string.\n3. **Event binding** `(event)="statement"`: view -> class. Examples: `(click)="save()"`, `(input)="onType($event)"`, `(keyup.enter)="search()"` (key filtering built in). `$event` is the DOM event (or the value a child component emits).\n4. **Two-way binding** `[(ngModel)]="studentName"`: both directions at once, for form inputs. It is "banana in a box" syntax: `[()]` = property binding + event binding. It requires `FormsModule` in the component\'s `imports`.\n\nSpecial bindings: `[class.active]="isActive"` toggles a CSS class, `[style.color]="color"` or `[style.width.px]="w"` sets a style, `[attr.aria-label]="label"` sets an HTML attribute that has no DOM property.\n\n**Template reference variables**: `<input #couponBox>` gives the template a name for the element, so `(click)="apply(couponBox.value)"` can read it without any class property.',
      points: [
        '{{ }} and [ ] : component -> view',
        '( ) : view -> component',
        '[( )] : both ways (FormsModule for ngModel; model() signals for custom components)',
      ],
      tip: 'Remember "[ ] goes in, ( ) comes out". Interviewers love asking the four binding types with one example each.',
    },
    {
      heading: 'Built-in control flow: @if, @for, @switch',
      content:
        'Angular 17 introduced a built-in **control flow** syntax in templates (no imports needed):\n\n- `@if (condition) { ... } @else if (other) { ... } @else { ... }`: shows or removes a block. You can store the value: `@if (user(); as u) { Hi {{ u.name }} }`.\n- `@for (item of items; track item.id) { ... } @empty { ... }`: repeats a block for each item. **track is required**: it tells Angular how to identify each item, so when the list changes it only updates, moves or removes the changed DOM rows instead of re-creating all of them (big performance win for long lists). Use a unique id; use `track $index` only for static lists. `@empty` shows when the list is empty.\n- Contextual variables inside @for: `$index`, `$first`, `$last`, `$even`, `$odd`, `$count`. Rename with `let i = $index`.\n- `@switch (value) { @case (\'A\') { ... } @default { ... } }`.\n- `@defer { <heavy-chart /> } @placeholder { ... }` lazily loads a block (advanced).\n\nOlder projects use **structural directives** `*ngIf`, `*ngFor` (with `trackBy`) and `[ngSwitch]`, which need `NgIf`/`NgFor` (or CommonModule) imports. They still work, and `ng generate @angular/core:control-flow` migrates them automatically.',
      syntax: `@for (s of students; track s.id; let i = $index) {
  <li>{{ i + 1 }}. {{ s.name }}</li>
} @empty {
  <li>No students</li>
}`,
    },
    {
      heading: 'Signals basics: signal, computed, effect, input and output',
      content:
        'A **signal** is a wrapper around a value that tells Angular when it changes, so Angular knows exactly which parts of the screen to update. Signals are the modern way to hold component state (and enable "zoneless" Angular).\n\n- `count = signal(0)` creates a **writable signal**. Read it by **calling** it: `count()` (also in templates: `{{ count() }}`). Change it with `count.set(5)` or `count.update(c => c + 1)`.\n- `total = computed(() => this.price() * this.qty())` creates a **read-only derived signal**. It recalculates only when a signal it reads changes, and caches the result (like a C# computed property that is smart about caching).\n- `effect(() => console.log(this.count()))` runs a **side effect** whenever the signals it reads change: logging, saving to localStorage, syncing with a non-Angular library. Do not use effects to set other signals; use computed for that.\n- Update arrays and objects **immutably**: `this.items.update(list => [...list, newItem])`, not `this.items().push(...)`, otherwise the signal does not know anything changed.\n\nSignal-based component communication:\n- `input()` / `input.required<T>()`: data from parent to child: `<app-cart-item [line]="l" />`, read as `this.line()` in the child.\n- `output<T>()`: events from child to parent: `this.remove.emit(id)` in the child, `(remove)="onRemove($event)"` in the parent.\n- `model()`: a two-way bindable input for custom components.\n\nOlder code uses `@Input()` and `@Output() x = new EventEmitter<T>()` decorators and RxJS `BehaviorSubject` for state; you will meet both in real projects.',
      syntax: `count = signal(0);
double = computed(() => this.count() * 2);
increment() { this.count.update((c) => c + 1); }
// template: {{ count() }} x 2 = {{ double() }}`,
    },
    {
      heading: 'Pipes: formatting values in templates',
      content:
        'A **pipe** transforms a value for display without changing the data: `{{ value | pipeName: arg1 : arg2 }}`. Pipes can be chained: `{{ paidOn | date: \'fullDate\' | uppercase }}`.\n\nBuilt-in pipes (import them from `@angular/common` into the standalone component):\n- `uppercase`, `lowercase`, `titlecase`\n- `currency: \'INR\'` (shows the rupee symbol), `number: \'1.1-2\'` (min integer digits . min-max fraction digits), `percent`\n- `date: \'dd MMM yyyy\'`, `date: \'shortDate\'`, `date: \'fullDate\'`\n- `slice: start : end` (arrays and strings), `json` (debugging), `keyvalue` (loop over an object)\n- `async`: subscribes to an Observable or Promise and shows its latest value\n\nNumber and date formats follow the app\'s **locale** (en-US by default: 1,25,000 is shown as 125,000). Register `en-IN` with `registerLocaleData` and provide `LOCALE_ID` for Indian formats.\n\n**Custom pipes**: `ng g pipe initials` creates a class with `@Pipe({ name: \'initials\' })` that implements `PipeTransform.transform(value, ...args)`. Pipes are **pure** by default: Angular re-runs them only when the input reference changes, which makes them faster than calling a method in the template. An impure pipe (`pure: false`) runs on every change detection, so use it rarely.',
    },
  ],
  examples: [
    {
      title: 'Create a project with the Angular CLI and your first standalone component',
      scenario:
        'Create a student portal, generate a CourseCard component that shows course details with interpolation (properties, a method call and a ternary), and display it from the root component.',
      steps: [
        'Install Node.js LTS, then run npm install -g @angular/cli and ng version',
        'ng new student-portal --style=css --ssr=false, then cd student-portal',
        'ng g c course-card and replace the generated .ts, .html and .css with the code',
        'Replace src/app/app.ts with the root component shown (delete the default content of app.html if your version uses templateUrl)',
        'Run ng serve -o and edit the fee in course-card.ts: the browser reloads automatically',
      ],
      code: `# ===== 1. Install Node.js LTS (nodejs.org), then the Angular CLI once =====
npm install -g @angular/cli
ng version

# ===== 2. Create and run a project =====
ng new student-portal --style=css --ssr=false
cd student-portal
ng serve -o                    # dev server on http://localhost:4200 with live reload

# ===== 3. Generate code with the CLI =====
ng generate component course-card      # short form: ng g c course-card
# CREATE src/app/course-card/course-card.ts
# CREATE src/app/course-card/course-card.html
# CREATE src/app/course-card/course-card.css
# CREATE src/app/course-card/course-card.spec.ts
# (Angular 17-19 name these course-card.component.ts and the class CourseCardComponent)
ng g service services/student          # @Injectable service for API calls
ng g pipe pipes/initials               # custom pipe
ng g interface models/student          # TypeScript interface
ng build                               # production build -> dist/student-portal/browser
ng test                                # unit tests

# ===== src/main.ts (generated: the app starts here) =====
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

# ===== src/app/course-card/course-card.ts =====
import { Component } from '@angular/core';

@Component({
  selector: 'app-course-card',          // used as <app-course-card /> in other templates
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
})                                      // standalone by default since Angular 19
export class CourseCard {               // (Angular 17-18: add standalone: true)
  title = '.NET Advanced: Enterprise Stack';
  trainer = 'Priya Sharma';
  durationDays = 30;
  fee = 14999;
  seatsLeft = 4;

  feePerDay(): number {
    return Math.round(this.fee / this.durationDays);
  }
}

# ===== src/app/course-card/course-card.html =====
<div class="card">
  <h2>{{ title }}</h2>
  <p>Trainer: {{ trainer }}</p>
  <p>{{ durationDays }} days, fee Rs. {{ fee }} (about Rs. {{ feePerDay() }} per day)</p>
  <p>Seats left: {{ seatsLeft }} {{ seatsLeft < 5 ? '- hurry!' : '' }}</p>
</div>

# ===== src/app/course-card/course-card.css =====
.card { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; max-width: 420px; }
h2 { margin-top: 0; color: #3b2fc9; }

# ===== src/app/app.ts (root component) =====
import { Component } from '@angular/core';
import { CourseCard } from './course-card/course-card';

@Component({
  selector: 'app-root',
  imports: [CourseCard],                 // standalone: import what the template uses
  template: \`
    <h1>{{ portalName }}</h1>
    <app-course-card />
  \`,
})
export class App {
  portalName = 'UpSkillr Student Portal';
}`,
      result: `Browser at http://localhost:4200:

UpSkillr Student Portal
.NET Advanced: Enterprise Stack
Trainer: Priya Sharma
30 days, fee Rs. 14999 (about Rs. 500 per day)
Seats left: 4 - hurry!`,
      explanation:
        'bootstrapApplication starts the root App component, which renders into <app-root> in index.html. App lists CourseCard in imports, so <app-course-card /> works in its template. Interpolation shows properties, the method result Math.round(14999 / 30) = 500 and the ternary text because 4 < 5. The styles in course-card.css only apply inside this component.',
    },
    {
      title: 'Property, event, two-way and class bindings: a fee calculator',
      scenario:
        'A course page asks for the student\'s name (two-way binding), shows a banner (property binding), and applies a coupon code with a button or the Enter key (event binding and a template reference variable). The Apply button stays disabled until a name is typed.',
      steps: [
        'ng g c fee-calculator',
        'Paste the .ts, .html and .css code',
        'Add FeeCalculator to the imports of App and put <app-fee-calculator /> in its template',
        'ng serve -o, type a name, then try the coupons "abc" and "fresher20"',
      ],
      code: `// ===== ng g c fee-calculator =====
// ===== src/app/fee-calculator/fee-calculator.ts =====
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';      // needed for [(ngModel)]

@Component({
  selector: 'app-fee-calculator',
  imports: [FormsModule],
  templateUrl: './fee-calculator.html',
  styleUrl: './fee-calculator.css',
})
export class FeeCalculator {
  studentName = '';
  baseFee = 14999;
  discountPercent = 0;
  message = '';
  bannerUrl = 'https://picsum.photos/seed/dotnet/400/120';

  applyCoupon(code: string): void {
    if (code.trim().toUpperCase() === 'FRESHER20') {
      this.discountPercent = 20;
      this.message = 'Coupon applied: 20% off';
    } else {
      this.discountPercent = 0;
      this.message = \`Invalid coupon "\${code}"\`;
    }
  }

  get finalFee(): number {
    return Math.round((this.baseFee * (100 - this.discountPercent)) / 100);
  }
}

// ===== src/app/fee-calculator/fee-calculator.html =====
<!-- property binding: [property]="expression" -->
<img [src]="bannerUrl" [alt]="'Course banner for ' + (studentName || 'guest')" width="400" />

<!-- two-way binding: [(ngModel)] = [ngModel] + (ngModelChange) -->
<label>Your name: <input [(ngModel)]="studentName" placeholder="Type your name" /></label>
<p>Hello, {{ studentName || 'guest' }}!</p>

<!-- #couponBox is a template reference variable pointing to the <input> element -->
<label>Coupon: <input #couponBox placeholder="FRESHER20" (keyup.enter)="applyCoupon(couponBox.value)" /></label>

<!-- event binding: (event)="statement" -->
<button (click)="applyCoupon(couponBox.value)" [disabled]="!studentName">Apply</button>

<!-- class and style bindings -->
<p [class.success]="discountPercent > 0" [class.error]="message && discountPercent === 0">{{ message }}</p>
<p [style.font-weight]="discountPercent > 0 ? 'bold' : 'normal'">Final fee: Rs. {{ finalFee }}</p>

// ===== src/app/fee-calculator/fee-calculator.css =====
.success { color: green; }
.error { color: crimson; }

// ===== Use it in src/app/app.ts =====
// imports: [FeeCalculator],  template: \`<app-fee-calculator />\``,
      result: `Initially: Hello, guest!  |  Apply button disabled  |  Final fee: Rs. 14999
Type "Asha"          -> Hello, Asha!  (Apply button enabled, img alt = "Course banner for Asha")
Coupon "abc" + Apply -> Invalid coupon "abc"   (red text)   Final fee: Rs. 14999
Coupon "fresher20" + Enter -> Coupon applied: 20% off (green)   Final fee: Rs. 11999 (bold)`,
      explanation:
        '[(ngModel)] keeps studentName and the input in sync (FormsModule is imported). [disabled]="!studentName" re-evaluates on every change. #couponBox lets the template pass the input\'s current value to applyCoupon, from both (click) and (keyup.enter). The coupon is compared after trim().toUpperCase(), so "fresher20" works. 14999 x 80 / 100 = 11999.2, rounded to 11999. [class.success] and [style.font-weight] switch styling from conditions.',
    },
    {
      title: '@if, @for with track and @empty, and @switch: a filterable student list',
      scenario:
        'Show students with a branch filter, number the rows, show a branch badge and a grade label, and show a friendly message when a branch has no students.',
      steps: [
        'ng g c student-list and paste the .ts and .html code',
        'Use <app-student-list /> in App (add StudentList to imports)',
        'ng serve -o and change the dropdown to CSE, then to CIVIL',
        'Open DevTools > Elements and watch: when filtering, rows for unchanged students are kept, thanks to track s.id',
      ],
      code: `// ===== ng g c student-list =====
// ===== src/app/student-list/student-list.ts =====
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  name: string;
  branch: 'CSE' | 'ECE' | 'MECH';
  cgpa: number;
}

@Component({
  selector: 'app-student-list',
  imports: [FormsModule],
  templateUrl: './student-list.html',
})
export class StudentList {
  branch = 'ALL';
  students: Student[] = [
    { id: 1, name: 'Asha', branch: 'CSE', cgpa: 8.7 },
    { id: 2, name: 'Rahul', branch: 'ECE', cgpa: 6.4 },
    { id: 3, name: 'Meena', branch: 'CSE', cgpa: 9.1 },
    { id: 4, name: 'Vikram', branch: 'MECH', cgpa: 5.6 },
  ];

  get filtered(): Student[] {
    return this.branch === 'ALL' ? this.students : this.students.filter((s) => s.branch === this.branch);
  }
}

// ===== src/app/student-list/student-list.html =====
<select [(ngModel)]="branch">
  <option value="ALL">All branches</option>
  <option value="CSE">CSE</option>
  <option value="ECE">ECE</option>
  <option value="MECH">MECH</option>
  <option value="CIVIL">CIVIL</option>
</select>

@if (filtered.length > 0) {
  <p>Showing {{ filtered.length }} of {{ students.length }} students</p>
}

<ul>
  @for (s of filtered; track s.id; let i = $index, last = $last) {
    <li [class.last]="last">
      {{ i + 1 }}. {{ s.name }}
      @switch (s.branch) {
        @case ('CSE') { <span class="badge">Computer</span> }
        @case ('ECE') { <span class="badge">Electronics</span> }
        @default { <span class="badge">Other</span> }
      }
      @if (s.cgpa >= 8.5) {
        - Distinction
      } @else if (s.cgpa >= 6) {
        - First class
      } @else {
        - Needs support
      }
    </li>
  } @empty {
    <li>No students in this branch.</li>
  }
</ul>

// ===== Old syntax you will still see in existing projects (Angular 2-16) =====
// <p *ngIf="filtered.length > 0; else none">...</p>
// <li *ngFor="let s of filtered; let i = index; trackBy: trackById">{{ i + 1 }}. {{ s.name }}</li>
// <ng-template #none>No students</ng-template>
// (needs NgIf / NgFor imported; migrate with: ng generate @angular/core:control-flow)`,
      result: `All branches:
Showing 4 of 4 students
1. Asha Computer - Distinction
2. Rahul Electronics - First class
3. Meena Computer - Distinction
4. Vikram Other - Needs support

CSE:
Showing 2 of 4 students
1. Asha Computer - Distinction
2. Meena Computer - Distinction

CIVIL:
No students in this branch.`,
      explanation:
        'The getter filtered recomputes when branch changes through [(ngModel)]. @if hides the "Showing" line when the list is empty, and @empty shows the message instead of an empty list. let i = $index gives 0-based positions, so the template prints i + 1. @switch shows "Other" for MECH through @default. The @if / @else if chain checks 8.5 first, then 6, so Rahul (6.4) is First class and Vikram (5.6) Needs support.',
    },
    {
      title: 'Signals: a shopping cart with computed totals, effect, input() and output()',
      scenario:
        'A stationery shop cart: the parent holds lines in a signal, derives item count, subtotal, delivery (free from Rs. 500) and total with computed, logs changes with an effect, and child CartItem components send "+" and "Remove" clicks up with output().',
      steps: [
        'Create src/app/cart/cart-item.ts and src/app/cart/cart.ts (or ng g c cart and ng g c cart/cart-item)',
        'Use <app-cart /> in App',
        'ng serve -o, press F12 > Console, click + on Notebook twice, then Remove on Pen pack',
        'The playground runs a tiny plain-JavaScript signal implementation with the same cart logic so you can see the reactions',
      ],
      code: `// ===== src/app/cart/cart-item.ts (child component) =====
import { Component, input, output } from '@angular/core';

export interface CartLine {
  id: number;
  name: string;
  price: number;
  qty: number;
}

@Component({
  selector: 'app-cart-item',
  template: \`
    <span>{{ line().name }} x {{ line().qty }} = Rs. {{ line().price * line().qty }}</span>
    <button (click)="increase.emit(line().id)">+</button>
    <button (click)="remove.emit(line().id)">Remove</button>
  \`,
})
export class CartItem {
  line = input.required<CartLine>();   // signal input: parent passes [line]="..."
  increase = output<number>();         // parent listens with (increase)="..."
  remove = output<number>();
}

// ===== src/app/cart/cart.ts (parent component) =====
import { Component, computed, effect, signal } from '@angular/core';
import { CartItem, CartLine } from './cart-item';

@Component({
  selector: 'app-cart',
  imports: [CartItem],
  template: \`
    <h2>Cart ({{ itemCount() }} items)</h2>
    @for (l of lines(); track l.id) {
      <app-cart-item [line]="l" (increase)="increase($event)" (remove)="remove($event)" />
    } @empty {
      <p>Your cart is empty.</p>
    }
    <p>Subtotal: Rs. {{ subtotal() }}</p>
    <p>Delivery: {{ delivery() === 0 ? 'FREE' : 'Rs. ' + delivery() }}</p>
    <h3>Total: Rs. {{ total() }}</h3>
  \`,
})
export class Cart {
  // writable signal holding the cart lines
  lines = signal<CartLine[]>([
    { id: 1, name: 'Notebook', price: 120, qty: 2 },
    { id: 2, name: 'Pen pack', price: 90, qty: 1 },
  ]);

  // computed signals: recalculated only when lines() changes, and cached
  itemCount = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.price * l.qty, 0));
  delivery = computed(() => (this.subtotal() >= 500 || this.subtotal() === 0 ? 0 : 40));
  total = computed(() => this.subtotal() + this.delivery());

  constructor() {
    // effect: side effect that re-runs when the signals it reads change
    effect(() => console.log(\`Cart changed: \${this.itemCount()} items, total \${this.total()}\`));
  }

  increase(id: number): void {
    // never mutate the array in place; give the signal a NEW array
    this.lines.update((ls) => ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)));
  }

  remove(id: number): void {
    this.lines.update((ls) => ls.filter((l) => l.id !== id));
  }
}`,
      playground: { html: '<p style="font-family:sans-serif">Angular cannot run here. This demo copies the idea of signals in plain JavaScript. Open the <b>Console</b> tab.</p>', js: `// The playground cannot run Angular. This is a TINY signal implementation in plain
// JavaScript that copies the idea, so you can watch computed values and effects react.
let activeEffect = null;

function signal(initial) {
  let value = initial;
  const subscribers = new Set();
  const read = () => {
    if (activeEffect) subscribers.add(activeEffect);   // remember who read me
    return value;
  };
  read.set = (next) => {
    value = next;
    [...subscribers].forEach((run) => run());           // notify readers
  };
  read.update = (fn) => read.set(fn(value));
  return read;
}

const computed = (fn) => () => fn();   // simplified: Angular also caches the value

function effect(fn) {
  const run = () => {
    activeEffect = run;
    fn();
    activeEffect = null;
  };
  run();
}

// ---- the same cart logic as the Angular component ----
const lines = signal([
  { id: 1, name: "Notebook", price: 120, qty: 2 },
  { id: 2, name: "Pen pack", price: 90, qty: 1 },
]);
const itemCount = computed(() => lines().reduce((n, l) => n + l.qty, 0));
const subtotal = computed(() => lines().reduce((sum, l) => sum + l.price * l.qty, 0));
const delivery = computed(() => (subtotal() >= 500 || subtotal() === 0 ? 0 : 40));
const total = computed(() => subtotal() + delivery());

effect(() => console.log(\`Cart changed: \${itemCount()} items, total \${total()}\`));

const increase = (id) => lines.update((ls) => ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)));
const remove = (id) => lines.update((ls) => ls.filter((l) => l.id !== id));

increase(1);
increase(1);
remove(2);
console.log(\`Delivery now: \${delivery() === 0 ? "FREE" : "Rs. " + delivery()}\`);` },
      result: `Cart changed: 3 items, total 370
Cart changed: 4 items, total 490
Cart changed: 5 items, total 570
Cart changed: 4 items, total 520
Delivery now: Rs. 40`,
      explanation:
        'Start: 2 x 120 + 90 = 330, below 500 so delivery is 40, total 370. Two "+" clicks on Notebook give qty 4: 480 + 90 = 570, which reaches 500, so delivery becomes FREE and total is 570. Removing Pen pack leaves 480: delivery 40 again, total 520. Every change uses update() with a new array, so all computed signals and the effect react; the template only re-renders what depends on them. In real Angular, effects run asynchronously and batch quick changes; the plain JS demo runs them immediately.',
    },
    {
      title: 'Built-in pipes, chaining and a custom initials pipe',
      scenario:
        'A fee receipt must show the student name in title case with initials, the course in capitals, the fee in rupees, the payment date in two formats, attendance as a percentage and CGPA with two decimals.',
      steps: [
        'ng g pipe pipes/initials and replace it with the InitialsPipe code',
        'ng g c receipt and paste the component code',
        'Use <app-receipt /> in App and run ng serve -o',
        'Optional: register the en-IN locale in app.config.ts and see 1,25,000 style grouping',
      ],
      code: `// ===== ng g pipe pipes/initials  ->  src/app/pipes/initials-pipe.ts =====
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials' })                 // pure by default: re-runs only when the input changes
export class InitialsPipe implements PipeTransform {
  transform(value: string, max = 2): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, max)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}

// ===== src/app/receipt/receipt.ts =====
import { Component } from '@angular/core';
import {
  CurrencyPipe, DatePipe, DecimalPipe, JsonPipe,
  PercentPipe, SlicePipe, TitleCasePipe, UpperCasePipe,
} from '@angular/common';
import { InitialsPipe } from '../pipes/initials-pipe';

@Component({
  selector: 'app-receipt',
  imports: [UpperCasePipe, TitleCasePipe, CurrencyPipe, DatePipe, DecimalPipe,
            PercentPipe, SlicePipe, JsonPipe, InitialsPipe],
  template: \`
    <p>{{ student.name | titlecase }} ({{ student.name | initials }})</p>
    <p>{{ student.course | uppercase }}</p>
    <p>Fee: {{ student.fee | currency: 'INR' }}</p>
    <p>Paid on: {{ student.paidOn | date: 'dd MMM yyyy' }} ({{ student.paidOn | date: 'EEEE' }})</p>
    <p>Full date: {{ student.paidOn | date: 'fullDate' | uppercase }}</p>
    <p>Attendance: {{ student.attendance | percent }}</p>
    <p>CGPA: {{ student.cgpa | number: '1.1-2' }}</p>
    <p>Top skills: {{ (skills | slice: 0 : 3).join(', ') }}</p>
    <pre>{{ { fee: student.fee, cgpa: student.cgpa } | json }}</pre>
  \`,
})
export class Receipt {
  student = {
    name: 'asha patil',
    course: 'angular basics',
    fee: 4999,
    paidOn: new Date(2026, 10, 20),      // months are 0-based: 10 = November
    attendance: 0.82,
    cgpa: 8.666,
  };
  skills = ['TypeScript', 'Angular', 'C#', 'SQL', 'Docker'];
}

// ===== Indian number format (1,25,000) for all pipes: src/app/app.config.ts =====
// import { LOCALE_ID } from '@angular/core';
// import { registerLocaleData } from '@angular/common';
// import localeEnIn from '@angular/common/locales/en-IN';
// registerLocaleData(localeEnIn);
// providers: [ { provide: LOCALE_ID, useValue: 'en-IN' }, ... ]`,
      result: `Asha Patil (AP)
ANGULAR BASICS
Fee: ₹4,999.00
Paid on: 20 Nov 2026 (Friday)
Full date: FRIDAY, NOVEMBER 20, 2026
Attendance: 82%
CGPA: 8.67
Top skills: TypeScript, Angular, C#
{
  "fee": 4999,
  "cgpa": 8.666
}`,
      explanation:
        'titlecase capitalises each word; the custom initials pipe takes the first letter of up to 2 words. currency: \'INR\' adds the rupee symbol and 2 decimals (en-US grouping by default). The date pipe uses Angular format letters: dd day, MMM short month, yyyy year, EEEE weekday name; 20 November 2026 is a Friday. fullDate is then piped into uppercase (chaining). percent multiplies by 100; number: \'1.1-2\' rounds 8.666 to 8.67. slice: 0 : 3 keeps the first three skills. The json pipe pretty-prints with 2-space indentation, handy for debugging.',
    },
  ],
  interview: [
    { q: 'What is Angular and how is it different from AngularJS and React?', a: 'Angular is a TypeScript-based, full SPA framework from Google with routing, forms, HTTP client, DI and CLI built in. AngularJS (1.x) is the older JavaScript framework with a completely different architecture (controllers, $scope) and is end-of-life. React is a UI library; routing, forms and state come from separate libraries.', level: 'Easy' },
    { q: 'What is a component? What does the @Component decorator contain?', a: 'A component is a class that controls a part of the UI, combined with a template and styles. @Component metadata includes selector (custom tag name), template or templateUrl, styles or styleUrl, and imports (for standalone components) plus optional settings like changeDetection.', level: 'Easy' },
    { q: 'What are standalone components? How are they different from NgModules?', a: 'Standalone components declare their own dependencies in the imports array and do not need to be declared in an NgModule. They are the default since Angular 19 and simplify apps (bootstrapApplication, lazy-loading components directly). NgModule-based apps group declarations, imports and providers in @NgModule classes.', level: 'Medium' },
    { q: 'Explain the four types of data binding with examples.', a: 'Interpolation {{ name }} (component to view text); property binding [src]="url" (component to DOM property or child input); event binding (click)="save()" (view to component); two-way binding [(ngModel)]="name" (both directions, needs FormsModule).', level: 'Easy' },
    { q: 'What is the difference between [value]="x" and value="x"?', a: '[value]="x" evaluates x as a TypeScript expression from the component and updates when it changes. value="x" sets the literal string "x" once.', level: 'Easy' },
    { q: 'Why is track required in @for, and what should you track?', a: 'track tells Angular how to identify each item so that when the array changes it can reuse, move or remove existing DOM elements instead of re-rendering everything. Track a stable unique key like item.id; $index only for static lists. It replaces trackBy from *ngFor.', level: 'Medium' },
    { q: 'What are $index, $first, $last, $even, $odd and $count in @for?', a: 'Implicit context variables: position (0-based), whether the item is first or last, whether its index is even or odd, and the total number of items. Alias them with let i = $index.', level: 'Easy' },
    { q: '@if vs *ngIf?', a: '@if is the built-in control flow (Angular 17+): no import needed, supports @else if/@else directly, better type narrowing and performance. *ngIf is a structural directive from CommonModule, needing ng-template for else. Both remove elements from the DOM rather than hiding them.', level: 'Medium' },
    { q: 'What is a signal? How do you read and change it?', a: 'A reactive value wrapper that notifies Angular when it changes. Create with signal(initial), read by calling it count(), write with set(value) or update(fn). Angular tracks which templates and computed signals read it and updates only those.', level: 'Medium' },
    { q: 'Difference between computed and effect?', a: 'computed creates a read-only derived value, lazily recalculated and cached when its dependencies change; use it for values shown in the UI. effect runs side-effect code (logging, localStorage, calling non-Angular APIs) whenever the signals it reads change; it should not be used to derive state.', level: 'Medium' },
    { q: 'Why must you update a signal array immutably?', a: 'A signal notifies when set/update gives it a new value. Mutating the existing array with push keeps the same reference, so computed signals and the view may not update. Use update(list => [...list, item]).', level: 'Hard' },
    { q: 'How do parent and child components communicate?', a: 'Parent to child with inputs: input() / input.required() (or @Input()), bound with [prop]="value". Child to parent with outputs: output<T>() (or @Output() EventEmitter) emitted with .emit(value) and handled with (event)="handler($event)". Unrelated components share a service (often holding signals).', level: 'Medium' },
    { q: 'What is a pipe? Pure vs impure pipes?', a: 'A pipe transforms a value in a template: {{ price | currency: \'INR\' }}. Pure pipes (default) run only when the input value or reference changes, so they are cheap. Impure pipes (pure: false) run on every change detection cycle, for example to react to array mutations; they can hurt performance.', level: 'Medium' },
    { q: 'Name five Angular CLI commands you use daily.', a: 'ng new (create workspace), ng serve (dev server on 4200), ng generate / ng g c|s|p (components, services, pipes), ng build (production build to dist), ng test (unit tests). Also ng add for libraries and ng update for version upgrades.', level: 'Easy' },
    { q: 'Why is calling a method in a template like {{ getTotal() }} discouraged in big lists?', a: 'Template methods run on every change detection cycle, which can be many times per second for every row. Prefer computed signals or pure pipes, which only recalculate when inputs change.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Counter component with a count signal, buttons for +1, -1 (not below 0) and Reset, and a computed message "Even" or "Odd".',
      hint: 'count = signal(0); parity = computed(() => this.count() % 2 === 0 ? "Even" : "Odd");',
      solution: `import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: \`
    <h2>{{ count() }} ({{ parity() }})</h2>
    <button (click)="inc()">+1</button>
    <button (click)="dec()" [disabled]="count() === 0">-1</button>
    <button (click)="count.set(0)">Reset</button>
  \`,
})
export class Counter {
  count = signal(0);
  parity = computed(() => (this.count() % 2 === 0 ? 'Even' : 'Odd'));
  inc() { this.count.update((c) => c + 1); }
  dec() { this.count.update((c) => Math.max(0, c - 1)); }
}`,
    },
    {
      task: 'Build a TodoList component: an input with [(ngModel)], an Add button (also Enter), a list rendered with @for (track by id) showing "No tasks yet" when empty, and a Done button that removes the task.',
      hint: 'Keep todos in a signal<{ id: number; text: string }[]> and update immutably.',
      solution: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Todo { id: number; text: string; }

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule],
  template: \`
    <input [(ngModel)]="newText" (keyup.enter)="add()" placeholder="New task" />
    <button (click)="add()" [disabled]="!newText.trim()">Add</button>
    <ul>
      @for (t of todos(); track t.id) {
        <li>{{ t.text }} <button (click)="done(t.id)">Done</button></li>
      } @empty {
        <li>No tasks yet</li>
      }
    </ul>
  \`,
})
export class TodoList {
  newText = '';
  private nextId = 1;
  todos = signal<Todo[]>([]);

  add() {
    const text = this.newText.trim();
    if (!text) return;
    this.todos.update((list) => [...list, { id: this.nextId++, text }]);
    this.newText = '';
  }

  done(id: number) {
    this.todos.update((list) => list.filter((t) => t.id !== id));
  }
}`,
    },
    {
      task: 'Create a reusable ProductCard child component with input.required<Product>() and an output addToCart that emits the product id. Use it from a parent with @for.',
      hint: 'In the parent: <app-product-card [product]="p" (addToCart)="onAdd($event)" />',
      solution: `// product-card.ts
import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface Product { id: number; name: string; price: number; }

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  template: \`
    <div class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ product().price | currency: 'INR' }}</p>
      <button (click)="addToCart.emit(product().id)">Add to cart</button>
    </div>
  \`,
})
export class ProductCard {
  product = input.required<Product>();
  addToCart = output<number>();
}

// parent template
// @for (p of products; track p.id) {
//   <app-product-card [product]="p" (addToCart)="onAdd($event)" />
// }`,
    },
    {
      task: 'Write a custom pipe "truncate" that shortens text to N characters and adds "..." (default N = 20). Use it as {{ description | truncate: 30 }}.',
      hint: 'transform(value: string, limit = 20): string',
      solution: `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 20): string {
    if (!value) return '';
    return value.length <= limit ? value : value.slice(0, limit).trimEnd() + '...';
  }
}
// import TruncatePipe into the component's imports array`,
    },
    {
      task: 'Convert this old template to the new control flow: <li *ngFor="let e of employees; let i = index; trackBy: byId">{{i+1}} {{e.name}} <span *ngIf="e.isManager; else staff">Manager</span></li><ng-template #staff>Staff</ng-template>',
      hint: 'Use @for with track e.id and @if/@else.',
      solution: `@for (e of employees; track e.id; let i = $index) {
  <li>
    {{ i + 1 }} {{ e.name }}
    @if (e.isManager) {
      <span>Manager</span>
    } @else {
      Staff
    }
  </li>
}`,
    },
  ],
  quiz: [
    {
      question: 'Which command starts the Angular development server on port 4200?',
      options: ['ng build', 'ng serve', 'ng new', 'npm run publish'],
      answer: 1,
      explanation: 'ng serve compiles in memory and serves the app with live reload; add -o to open the browser.',
    },
    {
      question: 'Which syntax is two-way binding?',
      options: ['[value]="name"', '(input)="name"', '[(ngModel)]="name"', '{{ name }}'],
      answer: 2,
      explanation: 'Banana in a box [( )] combines property and event binding; ngModel needs FormsModule.',
    },
    {
      question: 'In @for (s of students; track s.id), what is track used for?',
      options: [
        'To sort the list by id',
        'To identify items so Angular reuses DOM elements when the list changes',
        'To filter out duplicate students',
        'To log each student to the console',
      ],
      answer: 1,
      explanation: 'Tracking by a unique key lets Angular update only changed rows instead of re-creating the whole list.',
    },
    {
      question: 'Given count = signal(5), which line correctly increases it by 1?',
      options: ['this.count++', 'this.count = this.count + 1', 'this.count().update(1)', 'this.count.update(c => c + 1)'],
      answer: 3,
      explanation: 'Signals are changed with set() or update(); you read them by calling count().',
    },
    {
      question: 'What does {{ 0.82 | percent }} display?',
      options: ['82%', '0.82%', '82.00%', '8.2%'],
      answer: 0,
      explanation: 'The percent pipe multiplies by 100 and, by default, shows no decimal digits.',
    },
  ],
};
