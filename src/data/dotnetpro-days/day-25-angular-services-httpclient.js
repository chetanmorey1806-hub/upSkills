const apiCode = `// ===== PlacementApi (ASP.NET Core 8/10 Web API) =====
// dotnet new webapi -n PlacementApi --use-controllers
// cd PlacementApi && dotnet run   -> https://localhost:7001/swagger

// ----- Models/Student.cs -----
namespace PlacementApi.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Branch { get; set; } = "";
    public decimal Cgpa { get; set; }
}

// ----- Controllers/StudentsController.cs -----
using Microsoft.AspNetCore.Mvc;
using PlacementApi.Models;

namespace PlacementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    // in-memory list to keep the focus on Angular (Day 2-5 used EF Core / Dapper)
    private static readonly List<Student> Students =
    [
        new() { Id = 1, Name = "Asha Patil",  Branch = "CSE", Cgpa = 8.4m },
        new() { Id = 2, Name = "Ravi Kumar",  Branch = "IT",  Cgpa = 7.1m },
        new() { Id = 3, Name = "Neha Sharma", Branch = "ECE", Cgpa = 6.8m }
    ];

    [HttpGet]
    public ActionResult<IEnumerable<Student>> GetAll() => Ok(Students);

    [HttpGet("{id:int}")]
    public ActionResult<Student> Get(int id)
    {
        var s = Students.FirstOrDefault(x => x.Id == id);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPost]
    public ActionResult<Student> Create(Student student)
    {
        student.Id = Students.Count == 0 ? 1 : Students.Max(x => x.Id) + 1;
        Students.Add(student);
        return CreatedAtAction(nameof(Get), new { id = student.Id }, student);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, Student student)
    {
        if (id != student.Id) return BadRequest("Route id and body id differ");
        var existing = Students.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.Name = student.Name;
        existing.Branch = student.Branch;
        existing.Cgpa = student.Cgpa;
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var removed = Students.RemoveAll(x => x.Id == id);
        return removed == 0 ? NotFound() : NoContent();
    }
}

// ----- Program.cs -----
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 1) register a named CORS policy - allow ONLY the Angular dev server
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? ["http://localhost:4200"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()          // Content-Type, Authorization ...
              .AllowAnyMethod());        // GET, POST, PUT, DELETE, OPTIONS
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AngularClient");     // 2) after UseRouting (implicit) and BEFORE UseAuthorization / MapControllers
app.UseAuthorization();
app.MapControllers();
app.Run();

// ----- appsettings.json -----
// {
//   "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] },
//   "Logging": { "LogLevel": { "Default": "Information" } },
//   "AllowedHosts": "*"
// }`;

const setupCode = `# ===== 1. Install the Angular CLI and create the app =====
npm install -g @angular/cli
ng version
ng new placement-ui --style=css --ssr=false     # standalone components are the default
cd placement-ui

# ===== 2. Generate environments, model, service and components =====
ng generate environments                  # creates src/environments/environment.ts + environment.development.ts
ng generate interface models/student
ng generate service services/student      # (ng g s services/student)
ng generate component students/student-list
ng serve -o                               # http://localhost:4200

// ===== src/environments/environment.development.ts (used by ng serve) =====
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api'
};

// ===== src/environments/environment.ts (used by ng build - production) =====
export const environment = {
  production: true,
  apiUrl: 'https://placement-api.azurewebsites.net/api'
};

// angular.json (added by "ng generate environments") swaps the files for the development configuration:
// "fileReplacements": [
//   { "replace": "src/environments/environment.ts",
//     "with": "src/environments/environment.development.ts" }
// ]

// ===== src/app/app.config.ts =====
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch())        // makes HttpClient injectable everywhere
  ]
};

// ===== src/app/models/student.ts =====
export interface Student {
  id: number;
  name: string;
  branch: string;
  cgpa: number;
}

// ===== src/app/services/student.service.ts =====
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Student } from '../models/student';

@Injectable({ providedIn: 'root' })       // ONE shared instance (singleton) for the whole app
export class StudentService {
  private http = inject(HttpClient);       // same as constructor(private http: HttpClient) {}
  private baseUrl = environment.apiUrl + '/students';

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  getEligible(minCgpa: number): Observable<Student[]> {
    const params = new HttpParams().set('minCgpa', minCgpa);   // ?minCgpa=7
    return this.http.get<Student[]>(this.baseUrl, { params }).pipe(
      map(list => list.filter(s => s.cgpa >= minCgpa)),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(this.baseUrl + '/' + id).pipe(catchError(this.handleError));
  }

  create(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student).pipe(catchError(this.handleError));
  }

  update(student: Student): Observable<void> {
    return this.http.put<void>(this.baseUrl + '/' + student.id, student).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + id).pipe(catchError(this.handleError));
  }

  // arrow function so "this" is not lost when passed to catchError
  private handleError = (err: HttpErrorResponse) => {
    let message = 'Something went wrong. Please try again.';
    if (err.status === 0) message = 'Cannot reach the server (is the API running? CORS?)';
    else if (err.status === 404) message = 'Student not found';
    else if (err.status === 400) message = 'Invalid data sent to the server';
    console.error('API error', err.status, err.message);
    return throwError(() => new Error(message));
  };
}`;

const listCode = `// ===== src/app/students/student-list/student-list.component.ts =====
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);

  students: Student[] = [];
  loading = false;
  error = '';
  newStudent = { name: '', branch: 'CSE', cgpa: 7 };
  editing: Student | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.studentService.getAll()
      .pipe(finalize(() => this.loading = false))     // runs on success AND on error
      .subscribe({
        next: data => this.students = data,
        error: (e: Error) => this.error = e.message
      });
  }

  add(): void {
    this.studentService.create(this.newStudent).subscribe({
      next: created => {
        this.students = [...this.students, created];
        this.newStudent = { name: '', branch: 'CSE', cgpa: 7 };
      },
      error: (e: Error) => this.error = e.message
    });
  }

  startEdit(s: Student): void {
    this.editing = { ...s };                          // copy, so Cancel does not change the table
  }

  saveEdit(): void {
    if (!this.editing) return;
    const changed = this.editing;
    this.studentService.update(changed).subscribe({
      next: () => {
        this.students = this.students.map(s => s.id === changed.id ? changed : s);
        this.editing = null;
      },
      error: (e: Error) => this.error = e.message
    });
  }

  remove(s: Student): void {
    if (!confirm('Delete ' + s.name + '?')) return;
    this.studentService.delete(s.id).subscribe({
      next: () => this.students = this.students.filter(x => x.id !== s.id),
      error: (e: Error) => this.error = e.message
    });
  }
}

<!-- ===== src/app/students/student-list/student-list.component.html ===== -->
<h2>Placement Students</h2>

@if (loading) { <p>Loading students...</p> }
@if (error) { <p class="error">{{ error }}</p> }

<form (ngSubmit)="add()">
  <input name="name" [(ngModel)]="newStudent.name" placeholder="Name" required />
  <select name="branch" [(ngModel)]="newStudent.branch">
    <option>CSE</option><option>IT</option><option>ECE</option>
  </select>
  <input name="cgpa" type="number" step="0.1" [(ngModel)]="newStudent.cgpa" />
  <button type="submit" [disabled]="!newStudent.name">Add</button>
</form>

<table>
  <tr><th>Id</th><th>Name</th><th>Branch</th><th>CGPA</th><th></th></tr>
  @for (s of students; track s.id) {
    <tr>
      <td>{{ s.id }}</td>
      <td>{{ s.name }}</td>
      <td>{{ s.branch }}</td>
      <td>{{ s.cgpa }}</td>
      <td>
        <button (click)="startEdit(s)">Edit</button>
        <button (click)="remove(s)">Delete</button>
      </td>
    </tr>
  } @empty {
    <tr><td colspan="5">No students yet</td></tr>
  }
</table>

@if (editing) {
  <div class="edit-box">
    <h3>Edit {{ editing.name }}</h3>
    <input name="ename" [(ngModel)]="editing.name" />
    <input name="ecgpa" type="number" [(ngModel)]="editing.cgpa" />
    <button (click)="saveEdit()">Save</button>
    <button (click)="editing = null">Cancel</button>
  </div>
}

// ===== src/app/app.component.ts (root) =====
import { Component } from '@angular/core';
import { StudentListComponent } from './students/student-list/student-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StudentListComponent],
  template: '<app-student-list />'
})
export class AppComponent {}`;

const rxjsCode = `// ===== RxJS basics you will use with HttpClient =====
import { of, throwError, Observable } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';

// 1) An Observable is LAZY: nothing happens until subscribe()
const marks$ = of(45, 72, 88, 30, 95);       // emits 5 values, then completes

marks$.pipe(
  filter(m => m >= 40),                      // keep pass marks
  map(m => m >= 75 ? 'Distinction ' + m : 'Pass ' + m),
  tap(text => console.log('[tap]', text))   // side effect only (logging)
).subscribe({
  next: v => console.log('next:', v),
  complete: () => console.log('complete')
});

// 2) catchError replaces an error with a fallback value
const api$: Observable<number[]> = throwError(() => new Error('HTTP 500'));

api$.pipe(
  map(list => list.length),
  catchError(err => {
    console.log('caught:', err.message);
    return of(0);                            // fallback -> stream continues and completes
  })
).subscribe({
  next: count => console.log('count:', count),
  error: () => console.log('never printed'),
  complete: () => console.log('done')
});

// 3) HttpClient observables emit ONE value then complete, so they clean up themselves.
//    Long-lived streams (interval, valueChanges, router events) must be unsubscribed:
//    - use the async pipe in the template:  @for (s of students$ | async; track s.id) { ... }
//    - or takeUntilDestroyed() from @angular/core/rxjs-interop`;

const asyncPipeCode = `// ===== Same list with the async pipe (no manual subscribe) =====
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';

@Component({
  selector: 'app-eligible-students',
  standalone: true,
  imports: [AsyncPipe],
  template: \`
    <h3>Eligible for TCS drive (CGPA 7+)</h3>
    @if (eligible$ | async; as list) {
      <ul>
        @for (s of list; track s.id) { <li>{{ s.name }} - {{ s.cgpa }}</li> }
      </ul>
      <p>Total: {{ list.length }}</p>
    } @else {
      <p>Loading...</p>
    }
  \`
})
export class EligibleStudentsComponent {
  private service = inject(StudentService);
  // the async pipe subscribes when the view shows and unsubscribes when it is destroyed
  eligible$: Observable<Student[]> = this.service.getEligible(7).pipe(catchError(() => of([])));
}`;

const proxyCode = `// ===== Option B: avoid CORS in development with the Angular dev-server proxy =====
// src/proxy.conf.json
{
  "/api": {
    "target": "https://localhost:7001",
    "secure": false,
    "changeOrigin": true
  }
}

// angular.json -> projects.placement-ui.architect.serve.options
// "proxyConfig": "src/proxy.conf.json"

// environment.development.ts
// apiUrl: '/api'        <- same origin as http://localhost:4200, the dev server forwards it

// ===== What the browser does for a cross-origin PUT with JSON =====
// 1) Preflight
// OPTIONS https://localhost:7001/api/students/2
// Origin: http://localhost:4200
// Access-Control-Request-Method: PUT
// Access-Control-Request-Headers: content-type
//
// 2) API answers (because of UseCors("AngularClient"))
// 204 No Content
// Access-Control-Allow-Origin: http://localhost:4200
// Access-Control-Allow-Methods: PUT
// Access-Control-Allow-Headers: content-type
//
// 3) Only now the real PUT is sent.`;

export default {
  id: 'day-25-angular-services-httpclient',
  title: 'Angular Services, DI and HttpClient: Calling an ASP.NET Core Web API',
  module: 'Module 6: TypeScript & Angular with .NET',
  day: 25,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Connect an Angular app to an ASP.NET Core Web API. You will write injectable services, register HttpClient with provideHttpClient, do full CRUD calls and handle results with RxJS observables (subscribe, pipe, map, catchError). You will also keep the API URL in environment files and fix CORS on the .NET side.',
  objectives: [
    'Create an Angular project with the ng CLI and generate services, components and environments',
    'Use dependency injection (inject() and constructor injection) and explain providedIn: root',
    'Call GET, POST, PUT and DELETE endpoints of a .NET Web API with a typed HttpClient service',
    'Use observables: subscribe, pipe, map, filter, tap, catchError, finalize and the async pipe',
    'Configure CORS correctly in ASP.NET Core and explain the browser preflight request',
  ],
  theory: [
    {
      heading: 'Angular + ASP.NET Core: how the pieces fit',
      content:
        'In most Indian service companies (TCS, Infosys, Capgemini, LTIMindtree) the common "Angular + .NET" stack has two separate apps. The Angular app is a Single Page Application. It is built with TypeScript, compiled to JavaScript and runs in the browser on http://localhost:4200 during development. The ASP.NET Core Web API runs on its own port (for example https://localhost:7001). It returns only JSON. Angular calls the API with HttpClient, gets JSON back and shows it with components. Both apps are deployed separately: Angular as static files (Azure Static Web Apps, nginx, Blob Storage) and the API on App Service or a container.',
      points: [
        'Component = a TypeScript class + an HTML template + CSS. It shows data and handles clicks',
        'Service = a class that holds logic shared between components: API calls, state, helpers',
        'Angular 17+ uses standalone components (no NgModule needed) and the new control flow (@if, @for)',
        'The app starts at main.ts: bootstrapApplication(AppComponent, appConfig). Global providers live in app.config.ts',
        'Angular 20+ CLI names files app.ts / student-list.ts (no ".component" suffix). The code is the same. This lesson uses the classic names',
      ],
      syntax: `npm install -g @angular/cli
ng new placement-ui --style=css --ssr=false
ng generate service services/student     # ng g s
ng generate component students/student-list   # ng g c
ng serve -o`,
      tip: 'Keep the API and the UI in one Git repo with two folders (api/ and ui/). It makes the Docker compose and CI/CD setup on Days 27-29 easier.',
    },
    {
      heading: 'Services and Dependency Injection in Angular',
      content:
        'Angular has a dependency injection (DI) container, just like ASP.NET Core\'s builder.Services. A class marked with @Injectable({ providedIn: \'root\' }) is registered in the root injector. The whole app gets ONE shared instance, like AddSingleton in .NET. A component asks for a service in one of two ways: the inject() function (modern style) or a constructor parameter (classic style). Angular creates the service the first time it is needed. If you list a service in a component\'s providers array, that component and its children get their own new instance. This is called hierarchical injection.',
      points: [
        'providedIn: \'root\' = app-wide singleton and tree-shakable (removed from the bundle if never used)',
        'private http = inject(HttpClient) works in field initialisers, constructors and functional guards/interceptors',
        'constructor(private http: HttpClient) {} is the older but still valid style. Interviewers ask about both',
        'Component-level providers: [StudentService] creates a NEW instance for that component subtree',
        'Use InjectionToken for non-class values: export const API_URL = new InjectionToken<string>(\'API_URL\')',
        '.NET mapping: providedIn root ~ AddSingleton; component providers ~ a scoped child container',
      ],
      syntax: `@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
}

// classic constructor injection
export class StudentListComponent {
  constructor(private studentService: StudentService) {}
}`,
    },
    {
      heading: 'HttpClient and provideHttpClient',
      content:
        'HttpClient is Angular\'s service for HTTP calls. In standalone apps you enable it once with provideHttpClient() in app.config.ts. Older NgModule apps imported HttpClientModule instead, which is now deprecated. withFetch() makes it use the browser fetch API. withInterceptors([...]) adds interceptors (Day 26). Every HttpClient method returns an Observable and is generic, so http.get<Student[]>(url) gives you typed data. The JSON body is parsed for you. A request is NOT sent until something subscribes.',
      points: [
        'get<T>(url, { params, headers }) - read. Use HttpParams for query strings (?minCgpa=7)',
        'post<T>(url, body) - create. ASP.NET Core returns 201 Created with the new object',
        'put<T>(url, body) - full update. The API returns 204 No Content',
        'delete<T>(url) - delete. The API returns 204 or 404',
        'Errors (4xx/5xx, network) arrive as HttpErrorResponse. status 0 means the request never reached the server or was blocked (often CORS)',
        'Property names: System.Text.Json sends camelCase (cgpa, branch) by default, so the TypeScript interface uses camelCase too',
      ],
      syntax: `// app.config.ts
providers: [ provideHttpClient(withFetch()) ]

// service
this.http.get<Student[]>(this.baseUrl);
this.http.post<Student>(this.baseUrl, body);
this.http.put<void>(this.baseUrl + '/' + id, body);
this.http.delete<void>(this.baseUrl + '/' + id);`,
      tip: 'If you forget provideHttpClient() you get "NullInjectorError: No provider for HttpClient!". This is one of the most common Angular interview and debugging questions.',
    },
    {
      heading: 'Observables basics: subscribe, pipe, map, catchError',
      content:
        'An Observable is a stream of values over time. Think of a YouTube channel: nothing reaches you until you subscribe. Then you get each new video (next), maybe a problem (error), or the channel ends (complete). An HttpClient observable emits exactly one value (the response) and then completes. pipe() chains operators. Each operator takes a stream and returns a new one. A Promise runs at once and gives one value. An Observable is lazy, can give many values, can be cancelled (unsubscribe) and has rich operators.',
      points: [
        'subscribe({ next, error, complete }) starts the stream. Without subscribe, HttpClient sends NO request',
        'map(fn) changes each value, e.g. list => list.filter(s => s.cgpa >= 7)',
        'filter(fn) lets only matching values through. tap(fn) runs a side effect such as logging without changing values',
        'catchError(err => of(fallback)) recovers with a fallback. catchError(err => throwError(() => new Error(msg))) re-throws a friendly error',
        'finalize(() => loading = false) runs after complete OR error, which is ideal for spinners',
        'Unsubscribe from long-lived streams: async pipe, takeUntilDestroyed(), or keep the Subscription and call unsubscribe() in ngOnDestroy',
        'switchMap cancels the previous request when a new one starts (search boxes). Learn it next after map',
      ],
      syntax: `this.service.getAll().pipe(
  map(list => list.filter(s => s.cgpa >= 7)),
  catchError(() => of([]))
).subscribe({
  next: data => this.students = data,
  error: err => this.error = err.message,
  complete: () => console.log('done')
});`,
    },
    {
      heading: 'Environment files: one build per environment',
      content:
        'The API URL is different on your laptop (https://localhost:7001/api) and in production (https://placement-api.azurewebsites.net/api). Do not hard-code it inside services. Run ng generate environments. It creates src/environments/environment.ts (production values) and environment.development.ts (dev values), and adds a fileReplacements entry to angular.json. ng serve uses the development configuration, so the dev file replaces the main one. ng build uses production by default. Your code always imports from \'../environments/environment\' and gets the right values.',
      points: [
        'Never put secrets (DB passwords, JWT signing keys) in environment files. They are shipped to every browser and anyone can read them',
        'Only public config belongs there: apiUrl, feature flags, Application Insights connection string',
        'ng build --configuration development builds with the dev file. ng build alone builds production into dist/placement-ui/browser',
        'For "build once, deploy many" (Docker, K8s) some teams load /assets/config.json at startup instead of environment files',
      ],
      syntax: `// environment.development.ts
export const environment = { production: false, apiUrl: 'https://localhost:7001/api' };

// usage
import { environment } from '../../environments/environment';
private baseUrl = environment.apiUrl + '/students';`,
    },
    {
      heading: 'CORS setup on the ASP.NET Core side',
      content:
        'Browsers follow the Same-Origin Policy. A page from http://localhost:4200 may not read responses from https://localhost:7001, because the scheme, host or port is different, so it is a different origin. The API must allow it with CORS (Cross-Origin Resource Sharing) headers. For requests such as PUT/DELETE or a JSON POST, the browser first sends an OPTIONS "preflight" request. The real request is sent only if the API answers with the right Access-Control-Allow-* headers. CORS is enforced by the browser only. Postman and server-to-server calls ignore it, which is why "it works in Postman but not in Angular" is a classic CORS symptom.',
      points: [
        'builder.Services.AddCors(o => o.AddPolicy("AngularClient", p => p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()))',
        'app.UseCors("AngularClient") goes after UseRouting and before UseAuthentication/UseAuthorization and the endpoints',
        'The origin must match exactly: no trailing slash ("http://localhost:4200/" fails), and the scheme and port must be correct',
        'AllowAnyOrigin() cannot be combined with AllowCredentials() (cookies). Use explicit origins in production',
        'Read allowed origins from appsettings.json so production can add https://placement.azurestaticapps.net without a code change',
        'The browser console shows "has been blocked by CORS policy" and HttpErrorResponse.status is 0',
        'In development you can avoid CORS with proxy.conf.json, but production still needs a proper CORS policy (or the same domain)',
      ],
      syntax: `builder.Services.AddCors(options =>
    options.AddPolicy("AngularClient", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()));
...
app.UseCors("AngularClient");`,
      tip: 'CORS is not security for your API. Any non-browser client can still call it. Protect the API with authentication (JWT, Day 26) and authorization.',
    },
  ],
  examples: [
    {
      title: 'Placement API with CRUD endpoints and a CORS policy',
      scenario:
        'Your college placement cell needs an API listing students who can sit for campus drives. Build a StudentsController with GET/POST/PUT/DELETE and allow the Angular dev server through CORS.',
      steps: [
        'Visual Studio: File > New > Project > ASP.NET Core Web API, name it PlacementApi, keep "Use controllers" ticked (or run dotnet new webapi -n PlacementApi --use-controllers)',
        'Add Models/Student.cs and Controllers/StudentsController.cs from the code',
        'Replace Program.cs, add the "Cors" section to appsettings.json',
        'Check Properties/launchSettings.json for the https port (this lesson uses 7001)',
        'Press Ctrl+F5 and test GET /api/students in Swagger',
      ],
      code: apiCode,
      result: `GET https://localhost:7001/api/students  -> 200 OK
[
  { "id": 1, "name": "Asha Patil",  "branch": "CSE", "cgpa": 8.4 },
  { "id": 2, "name": "Ravi Kumar",  "branch": "IT",  "cgpa": 7.1 },
  { "id": 3, "name": "Neha Sharma", "branch": "ECE", "cgpa": 6.8 }
]

POST /api/students  { "name": "Imran Khan", "branch": "CSE", "cgpa": 7.9 }
-> 201 Created, Location: https://localhost:7001/api/students/4
   { "id": 4, "name": "Imran Khan", "branch": "CSE", "cgpa": 7.9 }

PUT /api/students/9 (unknown id)  -> 404 Not Found
DELETE /api/students/3            -> 204 No Content`,
      explanation:
        'The controller is a normal [ApiController]. The important part for Angular is in Program.cs: AddCors registers a named policy that trusts only http://localhost:4200, and UseCors("AngularClient") applies it. JSON is sent in camelCase (id, name, branch, cgpa), so the TypeScript interface uses the same names. Reading the origins from configuration lets production add its real domain with an environment variable such as Cors__AllowedOrigins__0.',
    },
    {
      title: 'Angular project, environments and a typed StudentService',
      scenario:
        'Create the placement-ui Angular app, store the API URL in environment files, enable HttpClient and write one service that does all the CRUD calls with proper error handling.',
      steps: [
        'Install Node.js LTS, then run: npm install -g @angular/cli',
        'ng new placement-ui --style=css --ssr=false and cd placement-ui',
        'ng generate environments, then put apiUrl in both files',
        'Add provideHttpClient(withFetch()) to app.config.ts',
        'ng g interface models/student and ng g s services/student, then paste the code',
      ],
      code: setupCode,
      result: `PS> ng generate environments
CREATE src/environments/environment.ts (31 bytes)
CREATE src/environments/environment.development.ts (31 bytes)
UPDATE angular.json (3021 bytes)

PS> ng g s services/student
CREATE src/app/services/student.service.spec.ts (377 bytes)
CREATE src/app/services/student.service.ts (145 bytes)

PS> ng serve -o
Application bundle generation complete.
  Local:   http://localhost:4200/`,
      explanation:
        'The service is the only place that knows URLs and HTTP verbs, so components stay simple and testable. providedIn: \'root\' gives one shared instance. inject(HttpClient) works only because provideHttpClient() was added in app.config.ts. handleError turns an HttpErrorResponse into a friendly message: status 0 means the network failed or CORS blocked the call. It is written as an arrow function so "this" still points to the service when catchError calls it.',
    },
    {
      title: 'StudentListComponent: list, add, edit and delete with subscribe',
      scenario:
        'The placement officer wants one screen that loads all students, shows a loading message, adds a student, edits CGPA and deletes a student. Each change must call the .NET API.',
      steps: [
        'ng g c students/student-list',
        'Paste the TypeScript and HTML code. Import FormsModule for [(ngModel)]',
        'Use <app-student-list /> in app.component.ts and add it to imports',
        'Start the API (Ctrl+F5) and the UI (ng serve), then open http://localhost:4200',
        'Open DevTools > Network to watch the GET, POST, OPTIONS (preflight), PUT and DELETE calls',
      ],
      code: listCode,
      result: `Placement Students
[Name______] [CSE v] [7] [Add]

Id | Name        | Branch | CGPA |
1  | Asha Patil  | CSE    | 8.4  | [Edit] [Delete]
2  | Ravi Kumar  | IT     | 7.1  | [Edit] [Delete]
3  | Neha Sharma | ECE    | 6.8  | [Edit] [Delete]

DevTools > Network:
students        GET     200  fetch
students        OPTIONS 204  preflight   (before POST with JSON)
students        POST    201  fetch
2               OPTIONS 204  preflight
2               PUT     204  fetch
3               DELETE  204  fetch

If the API is stopped: "Cannot reach the server (is the API running? CORS?)"`,
      explanation:
        'ngOnInit runs once after the component is created, which is the right place for the first load. Each service call returns an observable, and nothing is sent until subscribe() is called. finalize() turns off the loading flag on both success and error. After POST/PUT/DELETE the local array is replaced with a new one (spread, map, filter) instead of reloading the whole list. This is faster, and Angular change detection notices the new reference. @for needs track s.id so Angular can reuse table rows.',
    },
    {
      title: 'RxJS operators step by step: filter, map, tap, catchError',
      scenario:
        'Before writing more API code, the trainer shows how operators change a stream, using the marks of 5 students and an API call that fails with HTTP 500.',
      steps: [
        'In the Angular project, temporarily paste the code into app.component.ts ngOnInit (or a Node project with npm i rxjs)',
        'Run ng serve and open the browser console (F12)',
        'Read the output in order and match each line to an operator',
      ],
      code: rxjsCode,
      result: `[tap] Pass 45
next: Pass 45
[tap] Pass 72
next: Pass 72
[tap] Distinction 88
next: Distinction 88
[tap] Distinction 95
next: Distinction 95
complete
caught: HTTP 500
count: 0
done`,
      explanation:
        'of() emits values one at a time, and each value goes through the whole pipe before the next one starts, so tap and next lines alternate. 30 is removed by filter, so it never reaches map. After the last value, complete is called. In the second stream the error skips map, catchError logs it and returns of(0), so subscribe receives next(0) and then complete. The error callback is never called because the error was handled.',
    },
    {
      title: 'async pipe and dev proxy: less code, fewer CORS problems',
      scenario:
        'Show only students eligible for a TCS drive (CGPA 7+) without writing subscribe, and learn the dev-proxy alternative to CORS.',
      steps: [
        'ng g c students/eligible-students and paste the component',
        'Add EligibleStudentsComponent to the imports of AppComponent and place <app-eligible-students />',
        'Optional: create src/proxy.conf.json, set "proxyConfig" in angular.json and change apiUrl to /api',
        'Restart ng serve (a proxy change needs a restart)',
      ],
      code: asyncPipeCode + '\n\n' + proxyCode,
      result: `Eligible for TCS drive (CGPA 7+)
- Asha Patil - 8.4
- Ravi Kumar - 7.1
Total: 2

With the proxy: Network tab shows GET http://localhost:4200/api/students 200 (no OPTIONS request, same origin)`,
      explanation:
        'The async pipe subscribes for you and unsubscribes when the component is destroyed, so it never leaks. "as list" stores the value so it is used twice without a second HTTP call. The proxy makes the browser think the API has the same origin as the UI, so no CORS is needed in development. Production still needs real CORS on the API, or the UI and API served under one domain.',
    },
  ],
  interview: [
    { q: 'What is a service in Angular and why do we use it?', a: 'A service is a class (usually @Injectable) that holds logic or data shared across components, such as HTTP calls, state or helpers. It keeps components thin, avoids duplicate code and can be mocked in unit tests.', level: 'Easy' },
    { q: 'What does providedIn: \'root\' mean?', a: 'The service is registered in the root injector, so the whole app shares one singleton instance. It is also tree-shakable: if nothing injects it, it is removed from the bundle.', level: 'Easy' },
    { q: 'inject() function vs constructor injection?', a: 'Both get a dependency from the DI container. Constructor injection is the classic style. inject() (Angular 14+) can be used in field initialisers and in functional guards, interceptors and resolvers that have no constructor. It also works well with inheritance. Both must run in an injection context.', level: 'Medium' },
    { q: 'You get "NullInjectorError: No provider for HttpClient!". How do you fix it?', a: 'Register HttpClient. In a standalone app add provideHttpClient() to the providers in app.config.ts. In an old NgModule app import HttpClientModule (deprecated) or use provideHttpClient in the module providers.', level: 'Easy' },
    { q: 'Why does this.http.get(url) send no request?', a: 'HttpClient returns a cold, lazy Observable. The request is sent only when something subscribes, either with .subscribe() or the async pipe. Every new subscription sends a new request.', level: 'Medium' },
    { q: 'Observable vs Promise?', a: 'A Promise is eager, gives one value and cannot be cancelled. An Observable is lazy, can give zero or many values, can be cancelled with unsubscribe, and has operators (map, filter, retry, switchMap). HttpClient uses Observables, and firstValueFrom() turns one into a Promise.', level: 'Medium' },
    { q: 'What do pipe, map and catchError do?', a: 'pipe chains operators into a new observable. map changes each emitted value. catchError catches an error in the stream and either returns a fallback observable (of([])) or re-throws with throwError(() => err).', level: 'Easy' },
    { q: 'Do you need to unsubscribe from HttpClient calls?', a: 'Usually not, because they emit once and complete. Unsubscribing still cancels a slow in-flight request when the user leaves the page. Always unsubscribe from long-lived streams (interval, valueChanges, store selects) with the async pipe, takeUntilDestroyed() or ngOnDestroy.', level: 'Medium' },
    { q: 'What is CORS and why does the call work in Postman but fail in Angular?', a: 'CORS lets a server tell the browser which other origins may read its responses. Browsers enforce the Same-Origin Policy, while Postman is not a browser and ignores CORS. The fix is on the API: AddCors with WithOrigins("http://localhost:4200") and app.UseCors(...).', level: 'Easy' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before a "non-simple" cross-origin request (PUT/DELETE, JSON content type, Authorization header). It asks if the method and headers are allowed. If the server replies with matching Access-Control-Allow-* headers, the real request follows.', level: 'Medium' },
    { q: 'Where must app.UseCors be placed in Program.cs?', a: 'After UseRouting (implicit in minimal hosting) and before UseAuthentication, UseAuthorization and the endpoint mapping. Otherwise preflight requests can be rejected by auth, or CORS headers are missing.', level: 'Medium' },
    { q: 'Can you use AllowAnyOrigin with AllowCredentials?', a: 'No. ASP.NET Core throws an error because sending cookies to any origin is insecure and the CORS spec does not allow a wildcard with credentials. List the exact origins with WithOrigins(...) or use SetIsOriginAllowed carefully.', level: 'Hard' },
    { q: 'How do environment files work in Angular?', a: 'ng generate environments creates environment.ts (production) and environment.development.ts, plus a fileReplacements entry in angular.json. At build time the right file replaces the import. Code always imports environment.ts. They are bundled into public JS, so no secrets.', level: 'Medium' },
    { q: 'Your C# model property is "Cgpa" but Angular reads "cgpa". Why does it still work?', a: 'System.Text.Json in ASP.NET Core uses camelCase naming by default for web, so Cgpa is sent as "cgpa". The TypeScript interface must use camelCase too. Changing JsonNamingPolicy changes this.', level: 'Medium' },
    { q: 'How do you send query parameters and custom headers with HttpClient?', a: 'Pass options: http.get<T>(url, { params: new HttpParams().set(\'page\', 2), headers: new HttpHeaders({ \'X-Client\': \'placement-ui\' }) }). HttpParams and HttpHeaders are immutable, so set() returns a new instance.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a CompaniesController (Id, Name, Package in LPA, MinCgpa) to the API and an Angular CompanyService with getAll() and create(). Show the companies in a table.',
      hint: 'Copy the Student pattern: model + controller + interface + service + component. Remember the CORS policy already covers the new controller.',
      solution: `// C#
public class Company { public int Id { get; set; } public string Name { get; set; } = ""; public decimal PackageLpa { get; set; } public decimal MinCgpa { get; set; } }

// TS
export interface Company { id: number; name: string; packageLpa: number; minCgpa: number; }

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/companies';
  getAll() { return this.http.get<Company[]>(this.url); }
  create(c: Omit<Company, 'id'>) { return this.http.post<Company>(this.url, c); }
}

// component template
@for (c of companies; track c.id) { <tr><td>{{ c.name }}</td><td>{{ c.packageLpa }} LPA</td><td>{{ c.minCgpa }}</td></tr> }`,
    },
    {
      task: 'Stop the API and load the student list. Then make the error message say "Server is down" for status 0 and "Server error" for status 500 or more.',
      hint: 'Check err.status inside handleError.',
      solution: `private handleError = (err: HttpErrorResponse) => {
  const message = err.status === 0 ? 'Server is down'
                : err.status >= 500 ? 'Server error'
                : err.status === 404 ? 'Not found'
                : 'Request failed';
  return throwError(() => new Error(message));
};`,
    },
    {
      task: 'Break CORS on purpose: change WithOrigins to "http://localhost:4200/" (with a trailing slash). Note the browser error, then fix it. Next move the allowed origin into appsettings.json.',
      hint: 'Origins are compared exactly. Use builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>().',
      solution: `Browser console: Access to fetch at 'https://localhost:7001/api/students' from origin 'http://localhost:4200' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
Fix: "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }  (no trailing slash)
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!;
policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();`,
    },
    {
      task: 'Add a search box that calls GET /api/students?branch=CSE and shows the result with the async pipe.',
      hint: 'In the API add [FromQuery] string? branch. In Angular use HttpParams and assign the observable to a students$ field when the user clicks Search.',
      solution: `// API
[HttpGet]
public ActionResult<IEnumerable<Student>> GetAll([FromQuery] string? branch) =>
    Ok(string.IsNullOrEmpty(branch) ? Students : Students.Where(s => s.Branch == branch));

// service
search(branch: string) {
  return this.http.get<Student[]>(this.baseUrl, { params: new HttpParams().set('branch', branch) });
}

// component
branch = 'CSE';
students$ = this.service.search(this.branch);
search() { this.students$ = this.service.search(this.branch); }

// template
<input [(ngModel)]="branch" /> <button (click)="search()">Search</button>
@for (s of (students$ | async) ?? []; track s.id) { <li>{{ s.name }}</li> }`,
    },
    {
      task: 'Write a pipe chain that turns the API list into the average CGPA as a string with 2 decimals, falling back to "0.00" on error.',
      hint: 'map(list => ...) then catchError(() => of(\'0.00\')).',
      solution: `avg$ = this.service.getAll().pipe(
  map(list => list.length ? list.reduce((t, s) => t + s.cgpa, 0) / list.length : 0),
  map(avg => avg.toFixed(2)),
  catchError(() => of('0.00'))
);
// for 8.4, 7.1, 6.8 -> "7.43"`,
    },
  ],
  quiz: [
    {
      question: 'Which line enables HttpClient in a standalone Angular app?',
      options: ['imports: [HttpClient] in the component', 'providers: [provideHttpClient()] in app.config.ts', 'new HttpClient() inside the service', 'npm install @angular/http'],
      answer: 1,
      explanation: 'provideHttpClient() registers HttpClient and related services in the root injector. You never create HttpClient with new.',
    },
    {
      question: 'A component calls this.service.getAll() but never subscribes. What happens?',
      options: ['The request is sent and the result is ignored', 'An error is thrown', 'No HTTP request is sent at all', 'The request is sent twice'],
      answer: 2,
      explanation: 'HttpClient observables are cold and lazy. Only subscribe() or the async pipe starts the request.',
    },
    {
      question: 'Angular on http://localhost:4200 calls an API on https://localhost:7001. The console shows "blocked by CORS policy". Where is the fix?',
      options: ['In the Angular service: add a CORS header to the request', 'In the ASP.NET Core API: AddCors + UseCors with the Angular origin', 'In the browser settings', 'In environment.ts'],
      answer: 1,
      explanation: 'The server decides which origins may read its responses by sending Access-Control-Allow-Origin. Client-side headers cannot fix CORS.',
    },
    {
      question: 'What does catchError(() => of([])) do in a pipe?',
      options: ['Re-throws the error to subscribe\'s error callback', 'Retries the request forever', 'Replaces the error with an empty array so next([]) and complete are called', 'Stops the app'],
      answer: 2,
      explanation: 'Returning an observable from catchError recovers the stream. The subscriber gets the fallback value instead of an error.',
    },
    {
      question: 'What should NEVER be stored in Angular environment files?',
      options: ['The API base URL', 'A production flag', 'A feature toggle', 'The SQL Server password or JWT signing key'],
      answer: 3,
      explanation: 'Environment values are compiled into JavaScript that every user downloads. Secrets belong only on the server (appsettings, Key Vault).',
    },
  ],
};
