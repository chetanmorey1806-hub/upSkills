const routesCode = `# ===== CLI steps =====
ng g c pages/home
ng g c pages/not-found
ng g c students/student-detail
ng g c auth/login
ng g c admin/dashboard

// ===== src/app/app.routes.ts =====
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Placement Portal' },
  { path: 'login', component: LoginComponent, title: 'Login' },

  // lazy load ONE standalone component (separate JS chunk, downloaded on first visit)
  {
    path: 'students',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./students/student-list/student-list.component').then(m => m.StudentListComponent)
  },
  {
    path: 'students/:id',                         // route parameter
    canActivate: [authGuard],
    loadComponent: () =>
      import('./students/student-detail/student-detail.component').then(m => m.StudentDetailComponent)
  },

  // lazy load a whole group of child routes (admin area) - only for Admin role
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }       // wildcard: ALWAYS last
];

// ===== src/app/admin/admin.routes.ts =====
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },          // /admin
  { path: 'drives', loadComponent: () => import('./drives/drives.component').then(m => m.DrivesComponent) } // /admin/drives
];

// ===== src/app/app.component.ts =====
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth = inject(AuthService);
}

<!-- ===== src/app/app.component.html ===== -->
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
  <a routerLink="/students" routerLinkActive="active">Students</a>
  @if (auth.isAdmin()) { <a routerLink="/admin">Admin</a> }
  @if (auth.isLoggedIn()) {
    <span>Hi {{ auth.userName() }}</span> <button (click)="auth.logout()">Logout</button>
  } @else {
    <a routerLink="/login">Login</a>
  }
</nav>
<main>
  <router-outlet />          <!-- the routed component is rendered here -->
</main>`;

const detailCode = `// ===== src/app/students/student-detail/student-detail.component.ts =====
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink],
  template: \`
    @if (student) {
      <h2>{{ student.name }}</h2>
      <p>Branch: {{ student.branch }} | CGPA: {{ student.cgpa }}</p>
      <p>Viewing tab: {{ tab }}</p>
      <a [routerLink]="['/students', student.id + 1]">Next student</a>
    } @else if (error) {
      <p class="error">{{ error }}</p>
    } @else {
      <p>Loading...</p>
    }
    <button (click)="back()">Back to list</button>
  \`
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(StudentService);

  student: Student | null = null;
  error = '';
  tab = 'profile';

  ngOnInit(): void {
    // paramMap is an observable: it fires again when only the :id changes (same component reused)
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.student = null;
      this.service.getById(id).subscribe({
        next: s => this.student = s,
        error: (e: Error) => this.error = e.message
      });
    });
    // query string: /students/2?tab=offers
    this.tab = this.route.snapshot.queryParamMap.get('tab') ?? 'profile';
  }

  back(): void {
    this.router.navigate(['/students']);            // navigate from code
  }
}

<!-- Linking to it from the list (student-list.component.html) -->
<td><a [routerLink]="['/students', s.id]" [queryParams]="{ tab: 'offers' }">{{ s.name }}</a></td>

// Alternative (Angular 16+): bind route params straight to @Input
// app.config.ts: provideRouter(routes, withComponentInputBinding())
// component:     @Input() id!: string;`;

const formCode = `// ===== src/app/students/student-form/student-form.component.ts =====
// ng g c students/student-form
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';

// custom validator: college email must end with @gcoe.ac.in
export function collegeEmail(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '') as string;
  return value === '' || value.endsWith('@gcoe.ac.in') ? null : { collegeEmail: true };
}

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './student-form.component.html'
})
export class StudentFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(StudentService);
  private router = inject(Router);
  serverError = '';

  form = this.fb.nonNullable.group({
    name:   ['', [Validators.required, Validators.minLength(3)]],
    email:  ['', [Validators.required, Validators.email, collegeEmail]],
    branch: ['CSE', Validators.required],
    cgpa:   [7, [Validators.required, Validators.min(0), Validators.max(10)]],
    mobile: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]   // Indian mobile
  });

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();          // show all errors at once
      return;
    }
    const { name, branch, cgpa } = this.form.getRawValue();
    this.service.create({ name, branch, cgpa }).subscribe({
      next: () => this.router.navigate(['/students']),
      error: (e: Error) => this.serverError = e.message
    });
  }
}

<!-- ===== student-form.component.html ===== -->
<form [formGroup]="form" (ngSubmit)="submit()" novalidate>
  <label>Name <input formControlName="name" /></label>
  @if (f.name.touched && f.name.errors?.['required']) { <small>Name is required</small> }
  @if (f.name.touched && f.name.errors?.['minlength']) { <small>At least 3 letters</small> }

  <label>Email <input formControlName="email" /></label>
  @if (f.email.touched && f.email.errors?.['email']) { <small>Enter a valid email</small> }
  @if (f.email.touched && f.email.errors?.['collegeEmail']) { <small>Use your @gcoe.ac.in email</small> }

  <label>Branch
    <select formControlName="branch"><option>CSE</option><option>IT</option><option>ECE</option></select>
  </label>

  <label>CGPA <input type="number" step="0.1" formControlName="cgpa" /></label>
  @if (f.cgpa.touched && (f.cgpa.errors?.['min'] || f.cgpa.errors?.['max'])) { <small>CGPA must be 0 to 10</small> }

  <label>Mobile <input formControlName="mobile" /></label>
  @if (f.mobile.touched && f.mobile.errors?.['pattern']) { <small>10 digits starting with 6-9</small> }

  <button type="submit" [disabled]="form.pending">Save</button>
  <p>Form status: {{ form.status }}</p>
  @if (serverError) { <p class="error">{{ serverError }}</p> }
</form>`;

const apiAuthCode = `// ===== .NET side: login endpoint that issues a JWT =====
// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

// ----- appsettings.json -----
// "Jwt": { "Issuer": "PlacementApi", "Audience": "PlacementUi", "Key": "put-a-32+char-secret-in-user-secrets-or-key-vault" }

// ----- Program.cs (additions) -----
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();
...
app.UseCors("AngularClient");
app.UseAuthentication();
app.UseAuthorization();

// ----- Controllers/AuthController.cs -----
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Name, string Role, DateTime ExpiresAtUtc);

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration config) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login(LoginRequest req)
    {
        // demo users - in real projects use ASP.NET Core Identity + hashed passwords
        (string Name, string Role)? user = req switch
        {
            { Email: "officer@gcoe.ac.in", Password: "Officer@123" } => ("Placement Officer", "Admin"),
            { Email: "asha@gcoe.ac.in",    Password: "Asha@123" }    => ("Asha Patil", "Student"),
            _ => null
        };
        if (user is null) return Unauthorized(new { message = "Invalid email or password" });

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Value.Name),
            new Claim(ClaimTypes.Email, req.Email),
            new Claim(ClaimTypes.Role, user.Value.Role)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var expires = DateTime.UtcNow.AddHours(1);
        var token = new JwtSecurityToken(config["Jwt:Issuer"], config["Jwt:Audience"], claims,
            expires: expires, signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return Ok(new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token), user.Value.Name, user.Value.Role, expires));
    }
}

// protect the students API
[Authorize]                                   // any logged-in user
[ApiController, Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]              // only the placement officer
    public IActionResult Delete(int id) { /* ... */ return NoContent(); }
}`;

const authCode = `// ===== src/app/auth/auth.service.ts =====
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse { token: string; name: string; role: string; expiresAtUtc: string; }

const TOKEN_KEY = 'placement_token';
const USER_KEY = 'placement_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private user = signal<LoginResponse | null>(this.readUser());

  isLoggedIn = computed(() => {
    const u = this.user();
    return !!u && new Date(u.expiresAtUtc).getTime() > Date.now();
  });
  isAdmin = computed(() => this.isLoggedIn() && this.user()?.role === 'Admin');
  userName = computed(() => this.user()?.name ?? '');

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.apiUrl + '/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
        this.user.set(res);
      })
    );
  }

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  hasRole(role: string): boolean { return this.isLoggedIn() && this.user()?.role === role; }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private readUser(): LoginResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as LoginResponse : null;
  }
}

// ===== src/app/auth/auth.interceptor.ts =====   (ng g interceptor auth/auth)
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  // add the token only for OUR API, never to third-party URLs
  const isApiCall = req.url.startsWith(environment.apiUrl);
  const authReq = token && isApiCall
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })   // requests are immutable -> clone
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) auth.logout();      // token expired / invalid -> back to login
      return throwError(() => err);
    })
  );
};

// ===== src/app/app.config.ts =====
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
providers: [
  provideRouter(routes, withComponentInputBinding()),
  provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
]

// ===== src/app/auth/auth.guard.ts =====   (ng g guard auth/auth  -> choose CanActivate)
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  // remember where the user wanted to go
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// ===== src/app/auth/role.guard.ts =====
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const needed = route.data['role'] as string;
  return auth.hasRole(needed) ? true : router.createUrlTree(['/']);
};

// ===== src/app/auth/login/login.component.ts =====
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`
    <h2>Placement Portal Login</h2>
    <form [formGroup]="form" (ngSubmit)="login()">
      <input formControlName="email" placeholder="College email" />
      <input formControlName="password" type="password" placeholder="Password" />
      <button [disabled]="form.invalid || busy">{{ busy ? 'Signing in...' : 'Login' }}</button>
    </form>
    @if (error) { <p class="error">{{ error }}</p> }
  \`
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  busy = false;
  error = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  login(): void {
    this.busy = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/students';
        this.router.navigateByUrl(returnUrl);
      },
      error: (e: HttpErrorResponse) => {
        this.busy = false;
        this.error = e.status === 401 ? 'Invalid email or password' : 'Server not reachable';
      }
    });
  }
}`;

export default {
  id: 'day-26-angular-routing-forms-jwt',
  title: 'Angular Routing, Reactive Forms and JWT Login with a .NET API',
  module: 'Module 6: TypeScript & Angular with .NET',
  day: 26,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Turn the placement UI into a real multi-page app. You will define routes with routerLink, route parameters and lazy loading, and build reactive forms with built-in and custom validators. Then you will log in against an ASP.NET Core JWT API, attach the Bearer token with an HTTP interceptor and protect pages with route guards.',
  objectives: [
    'Configure routes, routerLink, routerLinkActive, wildcard and redirect routes, and navigate from code',
    'Read route parameters and query parameters with ActivatedRoute (and component input binding)',
    'Lazy load components and route groups with loadComponent and loadChildren',
    'Build reactive forms with FormBuilder, built-in validators, a custom validator and error messages',
    'Implement JWT login against .NET, a functional HTTP interceptor and authGuard / roleGuard',
  ],
  theory: [
    {
      heading: 'Angular routing basics',
      content:
        'An SPA has one real HTML page. The router changes which component is shown in <router-outlet> when the URL changes, and it does not reload the page. Routes are an array of { path, component } objects passed to provideRouter(routes) in app.config.ts. Use routerLink instead of href, because href reloads the whole app and loses its state. routerLinkActive adds a CSS class to the link of the current page. To navigate from TypeScript (after saving a form or after login), inject Router and call navigate([\'/students\']) or navigateByUrl(\'/students\').',
      points: [
        'path: \'\' is the home page. path: \'**\' is the wildcard (404) route and must be LAST, because routes are matched top to bottom and the first match wins',
        '{ path: \'home\', redirectTo: \'\', pathMatch: \'full\' } redirects one URL to another',
        'title: \'Login\' sets the browser tab title automatically',
        '[routerLinkActiveOptions]="{ exact: true }" stops the Home link from being active on every page',
        'When deployed, the web server must send index.html for unknown paths (nginx try_files, staticwebapp.config.json navigationFallback). Otherwise refreshing /students gives a 404',
      ],
      syntax: `export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'students', component: StudentListComponent },
  { path: '**', component: NotFoundComponent }
];
<a routerLink="/students" routerLinkActive="active">Students</a>
<router-outlet />`,
    },
    {
      heading: 'Route parameters, query parameters and lazy loading',
      content:
        'A route parameter is a part of the path, such as students/:id. The value is read from ActivatedRoute: route.snapshot.paramMap.get(\'id\') reads it once, and route.paramMap.subscribe(...) updates when only the id changes and Angular reuses the same component (the "Next student" link). Query parameters (?tab=offers) are optional extras read with queryParamMap. With withComponentInputBinding() the router can also put params straight into @Input() properties. Lazy loading splits the app into chunks. loadComponent loads one standalone component, and loadChildren loads a whole route file (for example the admin area) only when the user first visits it, so the first page loads faster.',
      points: [
        'Link with params: [routerLink]="[\'/students\', s.id]" and [queryParams]="{ tab: \'offers\' }"',
        'Code: this.router.navigate([\'/students\', 5], { queryParams: { tab: \'offers\' } })',
        'Params are always strings, so convert them: Number(params.get(\'id\'))',
        'loadComponent: () => import(\'./x.component\').then(m => m.XComponent)',
        'loadChildren: () => import(\'./admin/admin.routes\').then(m => m.ADMIN_ROUTES)',
        'ng build output lists "Lazy chunk files", which proves lazy loading works',
      ],
      tip: 'Interview line: "Eager routes go into the main bundle. Lazy routes are separate chunks downloaded on demand. Use lazy loading for big, rarely used areas like admin and reports."',
    },
    {
      heading: 'Reactive forms and validators',
      content:
        'Angular has two form styles. Template-driven forms (ngModel) are quick for small forms. Reactive forms build the form model in TypeScript with FormGroup, FormControl and FormBuilder, so they are typed, easy to unit test and good for complex validation. Most enterprise projects use reactive forms. Validators are functions. The built-in ones are required, minLength, maxLength, min, max, email and pattern. A custom validator is a function (control) => ValidationErrors | null, where null means valid. Each control tracks value, status (VALID/INVALID/PENDING), touched and dirty, so you show errors only after the user has touched a field.',
      points: [
        'imports: [ReactiveFormsModule], then <form [formGroup]="form"> and <input formControlName="name">',
        'fb.nonNullable.group({...}) gives typed controls that reset to their initial values instead of null',
        'form.invalid, form.markAllAsTouched(), form.getRawValue() and form.reset() are used all the time',
        'Error keys: required, minlength, maxlength, min, max, email, pattern (all lowercase for minlength/maxlength)',
        'Cross-field validators (password = confirm password) are set on the FormGroup: fb.group({...}, { validators: matchPasswords })',
        'Always validate again on the .NET side with DataAnnotations or FluentValidation, because the client can be bypassed',
      ],
      syntax: `form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  cgpa:  [7, [Validators.min(0), Validators.max(10)]]
});
@if (form.controls.email.touched && form.controls.email.errors?.['email']) { <small>Invalid email</small> }`,
    },
    {
      heading: 'JWT login flow between Angular and ASP.NET Core',
      content:
        'Step 1: the login form POSTs { email, password } to /api/auth/login. Step 2: the .NET API checks the user (ASP.NET Core Identity in real apps) and returns a signed JWT that contains claims (name, email, role) and an expiry time. Step 3: Angular stores the token (localStorage or memory) and sends it with every API call in the header Authorization: Bearer <token>. Step 4: AddJwtBearer on the API validates the signature, issuer, audience and expiry, and fills User with the claims. [Authorize] and [Authorize(Roles = "Admin")] then allow or block the call (401 if not logged in, 403 if the role is wrong).',
      points: [
        'A JWT is header.payload.signature in Base64Url. The payload is only encoded, NOT encrypted, so never put passwords in it',
        'Angular can decode the payload to show the name/role, but only the server can trust it, because only the server knows the signing key',
        'localStorage is simple but readable by XSS. httpOnly cookies are safer against XSS but need CSRF protection',
        'Short-lived access tokens (15-60 min) plus refresh tokens are the production pattern',
        'Middleware order on the API: UseCors -> UseAuthentication -> UseAuthorization -> MapControllers',
      ],
    },
    {
      heading: 'HTTP interceptors: add the Bearer token once',
      content:
        'An interceptor sits between HttpClient and the network. Every request passes through it, and every response comes back through it. Modern Angular uses functional interceptors (HttpInterceptorFn) registered with provideHttpClient(withInterceptors([authInterceptor])). HttpRequest objects are immutable, so you call req.clone({ setHeaders: { Authorization: \'Bearer \' + token } }) and pass the clone to next(). The same place is good for global 401 handling (log out), loading spinners, retry and logging. Interceptors run in the order they are listed for requests, and in reverse order for responses.',
      points: [
        'Signature: (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>>',
        'Only attach the token to your own API URL, never to third-party domains',
        'Class-based interceptors (implements HttpInterceptor + HTTP_INTERCEPTORS multi provider) still work with withInterceptorsFromDi(). Older projects use them',
        'Because the Authorization header is not "simple", the browser sends a CORS preflight. AllowAnyHeader() or WithHeaders("Authorization", "Content-Type") must cover it',
      ],
      syntax: `export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  return next(token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req);
};
provideHttpClient(withInterceptors([authInterceptor]))`,
    },
    {
      heading: 'Route guards: protect pages in the UI',
      content:
        'A guard decides whether navigation may happen. Modern guards are functions such as CanActivateFn and CanMatchFn. A guard returns true (allow), false (block), or a UrlTree (redirect, for example to /login?returnUrl=/students). canActivate runs before entering a route. canActivateChild covers child routes. canMatch can even stop a lazy chunk from being downloaded. canDeactivate asks "You have unsaved changes, leave?". Remember that guards only improve the user experience. Real security is the [Authorize] attribute on the .NET API, because anyone can edit JavaScript in the browser.',
      points: [
        'authGuard: logged in? else redirect to /login with returnUrl',
        'roleGuard: reads route.data[\'role\'] and checks the user role',
        'Return router.createUrlTree([...]) instead of calling navigate() inside a guard. It is cleaner and avoids navigation races',
        'Generate one with: ng g guard auth/auth (choose CanActivate)',
      ],
      syntax: `{ path: 'admin', canActivate: [authGuard, roleGuard], data: { role: 'Admin' },
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) }`,
    },
  ],
  examples: [
    {
      title: 'Routes, navigation menu and a lazy-loaded admin area',
      scenario:
        'The placement portal needs Home, Login, Students, Student detail, an Admin area for the placement officer, and a friendly 404 page.',
      steps: [
        'Generate the components with the ng g c commands shown',
        'Write app.routes.ts and admin/admin.routes.ts',
        'Add RouterOutlet, RouterLink and RouterLinkActive to AppComponent imports and paste the nav HTML',
        'Run ng build and look for "Lazy chunk files" in the output',
        'ng serve, then click the links and also type /xyz in the address bar',
      ],
      code: routesCode,
      result: `PS> ng build
Initial chunk files   | Names         |  Raw size
main-HK3J2W.js        | main          | 212.40 kB
styles-5INURTSO.css   | styles        |   0 bytes

Lazy chunk files      | Names                    |  Raw size
chunk-Q7XK2A.js       | student-list-component   |  14.21 kB
chunk-M2PLV3.js       | student-detail-component |   4.10 kB
chunk-ZC8R1D.js       | admin-routes             |   6.85 kB

Browser: /          -> Home (Home link highlighted)
         /students  -> redirected to /login?returnUrl=%2Fstudents (not logged in)
         /xyz       -> "Page not found"`,
      explanation:
        'The router matches top to bottom, so the wildcard comes last. The student pages and the admin routes are not in main.js. They are separate chunks downloaded on the first visit, which keeps the first load small. The exact chunk names and sizes differ on every machine. The guards (written in example 4) redirect anonymous users to /login and keep the original URL in returnUrl.',
    },
    {
      title: 'Student detail page with route params and query params',
      scenario:
        'Clicking a student name in the list opens /students/2?tab=offers and loads that student from the API. A "Next student" link must reload data even though the same component is reused.',
      steps: [
        'ng g c students/student-detail and paste the component',
        'In the list template, change the name cell to the routerLink shown',
        'Open /students, click "Ravi Kumar", then click "Next student"',
        'Watch the Network tab: one GET /api/students/{id} per click',
      ],
      code: detailCode,
      result: `URL: http://localhost:4200/students/2?tab=offers

Ravi Kumar
Branch: IT | CGPA: 7.1
Viewing tab: offers
Next student          [Back to list]

Click "Next student" -> URL /students/3, page shows Neha Sharma (ECE, 6.8)
Network: GET https://localhost:7001/api/students/2 200, then GET .../students/3 200`,
      explanation:
        'paramMap is an observable. When only :id changes, Angular keeps the same component instance, so ngOnInit does not run again, but paramMap emits the new id. Code that used route.snapshot.paramMap would stay stuck on student 2. The query parameter is read from the snapshot because it only matters on the first load here. Route params are strings, so Number() converts them before calling the API.',
    },
    {
      title: 'Reactive registration form with built-in and custom validators',
      scenario:
        'Students register for the placement drive. Name must have at least 3 letters, email must be valid and end with @gcoe.ac.in, CGPA must be 0-10 and the mobile number must be a valid Indian number.',
      steps: [
        'ng g c students/student-form and add { path: \'students/new\', loadComponent: ... } ABOVE students/:id',
        'Paste the TS and HTML. Import ReactiveFormsModule',
        'Click Save with an empty form, then type invalid values to see each message',
        'Fill valid data and save. The app navigates back to /students',
      ],
      code: formCode,
      result: `Click Save on empty form (markAllAsTouched):
  Name is required
  Form status: INVALID
  (empty email and mobile only have the "required" error; this template shows
   messages for email/collegeEmail/pattern, so add required messages for them too)

Typing:
  name "Ra"                  -> At least 3 letters
  email "ravi@gmail.com"     -> Use your @gcoe.ac.in email
  cgpa 11                    -> CGPA must be 0 to 10
  mobile "5123456789"        -> 10 digits starting with 6-9

Valid: Ravi Kumar / ravi@gcoe.ac.in / IT / 7.1 / 9876543210
  Form status: VALID -> POST /api/students 201 -> navigated to /students`,
      explanation:
        'Each control has a list of validators. The template reads control.errors to pick the message, and shows it only when touched is true, so a fresh form is not full of red text. Validators.pattern does not run on an empty value (required handles that), which is why the mobile pattern message is not shown for an empty field. collegeEmail returns null when valid and an error object otherwise, which is the contract of every validator. Place students/new above students/:id, or "new" will be treated as an id.',
    },
    {
      title: 'JWT login against .NET, interceptor and guards',
      scenario:
        'The placement officer logs in, gets a JWT from the .NET API, and every later request carries Authorization: Bearer <token>. Students cannot open /admin, and anonymous users are sent to the login page.',
      steps: [
        'API: dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer, add the Program.cs code and AuthController',
        'Store the key safely: dotnet user-secrets init, then dotnet user-secrets set "Jwt:Key" "<32+ random chars>"',
        'Angular: ng g s auth/auth, ng g interceptor auth/auth, ng g guard auth/auth, ng g guard auth/role, ng g c auth/login',
        'Register withInterceptors([authInterceptor]) in app.config.ts',
        'Log in as officer@gcoe.ac.in / Officer@123, then check a request header in the Network tab',
      ],
      code: apiAuthCode + '\n\n' + authCode,
      result: `POST https://localhost:7001/api/auth/login
{ "email": "officer@gcoe.ac.in", "password": "Officer@123" }
-> 200 OK
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8v...",
  "name": "Placement Officer", "role": "Admin", "expiresAtUtc": "2026-11-20T11:30:00Z" }

GET https://localhost:7001/api/students
Request headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...   -> 200 OK

Wrong password                -> 401, UI shows "Invalid email or password"
asha@gcoe.ac.in opens /admin  -> roleGuard redirects to /
asha calls DELETE /api/students/3 -> 403 Forbidden (API role check)
Token expired                 -> API 401 -> interceptor calls logout() -> /login`,
      explanation:
        'The AuthService keeps the session in localStorage and exposes signals, so the nav bar updates at once. The interceptor clones every request to our API and adds the Bearer header, so no service has to remember to do it. On a 401 it logs out globally. The guards stop the UI from showing pages the user should not see. The real protection is [Authorize] / [Authorize(Roles = "Admin")] on the API, which is why Asha still gets 403 even if she bypasses the Angular guard. The expiry time in the result depends on when you log in.',
    },
  ],
  interview: [
    { q: 'What is the difference between routerLink and href in Angular?', a: 'href makes the browser load the page again from the server, so the whole SPA restarts and loses its state. routerLink tells the Angular router to change the URL and swap the component inside router-outlet without a reload.', level: 'Easy' },
    { q: 'Why must the wildcard route ** be the last route?', a: 'The router checks routes in order and uses the first match. ** matches everything, so any route after it would never be reached.', level: 'Easy' },
    { q: 'snapshot.paramMap vs paramMap observable?', a: 'snapshot gives the value once, when the component is created. The paramMap observable emits again whenever the parameter changes while the same component instance is reused, for example when going from /students/2 to /students/3.', level: 'Medium' },
    { q: 'What is lazy loading and how do you do it with standalone components?', a: 'Lazy loading downloads code for a route only when it is first visited, making the initial bundle smaller. Use loadComponent: () => import(...).then(m => m.Cmp) for one component, or loadChildren: () => import(\'./admin.routes\').then(m => m.ADMIN_ROUTES) for a group.', level: 'Medium' },
    { q: 'Template-driven vs reactive forms?', a: 'Template-driven forms use ngModel and directives in HTML. They are simple and good for small forms. Reactive forms define FormGroup/FormControl in TypeScript. They are typed, testable, easy to change dynamically and better for complex validation. Enterprise apps mostly use reactive forms.', level: 'Medium' },
    { q: 'How do you write a custom validator?', a: 'Write a function (control: AbstractControl) => ValidationErrors | null. Return null if valid, or an object like { collegeEmail: true } if invalid. Add it to the control\'s validators array. For cross-field checks, put it on the FormGroup.', level: 'Medium' },
    { q: 'What do touched, dirty and pristine mean?', a: 'touched: the control lost focus at least once. dirty: the user changed the value. pristine: the value was never changed. Error messages are usually shown when touched (or dirty) to avoid errors on a fresh form.', level: 'Easy' },
    { q: 'Explain the JWT login flow between Angular and ASP.NET Core.', a: 'Angular posts the credentials to /api/auth/login. The API validates them and returns a signed JWT with claims and an expiry. Angular stores it and the interceptor adds Authorization: Bearer <token> to API calls. AddJwtBearer validates the token on each request, and [Authorize] checks the user and roles.', level: 'Medium' },
    { q: 'What is an HTTP interceptor and why clone the request?', a: 'An interceptor is a function or class that every HttpClient request and response passes through. It is used for auth headers, error handling, logging and spinners. HttpRequest is immutable, so you call req.clone({ setHeaders: {...} }) and pass the clone to next().', level: 'Medium' },
    { q: 'How do you register a functional interceptor?', a: 'provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor])) in app.config.ts. Class interceptors need withInterceptorsFromDi() plus an HTTP_INTERCEPTORS multi provider.', level: 'Medium' },
    { q: 'Is a route guard enough to secure admin data?', a: 'No. Guards run in the browser and can be bypassed by editing JavaScript or calling the API directly. They only improve the user experience. Security must be enforced on the server with [Authorize], roles or policies.', level: 'Easy' },
    { q: 'canActivate vs canMatch vs canDeactivate?', a: 'canActivate decides if a matched route may be entered. canMatch decides if the route may match at all, so with lazy routes the chunk is not even downloaded and the next matching route is tried. canDeactivate decides if the user may leave, for example when a form has unsaved changes.', level: 'Hard' },
    { q: 'API returns 401 vs 403 - what is the difference?', a: '401 Unauthorized means not authenticated: no token, or the token is invalid or expired. The interceptor should log out or refresh. 403 Forbidden means authenticated but not allowed, for example a Student calling an Admin endpoint.', level: 'Easy' },
    { q: 'Where should you store the JWT in the browser?', a: 'localStorage is simple and survives refresh, but JavaScript (and therefore XSS) can read it. Memory is safer but is lost on refresh. An httpOnly secure cookie cannot be read by JS but needs CSRF protection. Many teams use a short-lived access token in memory plus a refresh token in an httpOnly cookie.', level: 'Hard' },
    { q: 'Why does refreshing /students on the deployed site give a 404, and how do you fix it?', a: 'The web server looks for a real /students file, which does not exist. Configure a fallback to index.html (nginx try_files $uri /index.html, Azure Static Web Apps navigationFallback, IIS URL rewrite) so Angular can handle the route.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a "Companies" page at /companies and a detail page at /companies/:id, both lazy loaded, with a nav link that is highlighted when active.',
      hint: 'Use loadComponent for both. Use [routerLink]="[\'/companies\', c.id]" in the list.',
      solution: `{ path: 'companies', loadComponent: () => import('./companies/company-list.component').then(m => m.CompanyListComponent) },
{ path: 'companies/:id', loadComponent: () => import('./companies/company-detail.component').then(m => m.CompanyDetailComponent) },

<a routerLink="/companies" routerLinkActive="active">Companies</a>

// detail component
private route = inject(ActivatedRoute);
id = Number(this.route.snapshot.paramMap.get('id'));`,
    },
    {
      task: 'Create a change-password form with password (min 8 chars, must contain a digit) and confirmPassword. Show "Passwords do not match" using a FormGroup-level validator.',
      hint: 'A group validator receives the FormGroup. Read group.get(\'password\')?.value.',
      solution: `export const matchPasswords: ValidatorFn = (group: AbstractControl) => {
  const p = group.get('password')?.value;
  const c = group.get('confirmPassword')?.value;
  return p === c ? null : { mismatch: true };
};

form = this.fb.nonNullable.group({
  password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('.*[0-9].*')]],
  confirmPassword: ['', Validators.required]
}, { validators: matchPasswords });

@if (form.errors?.['mismatch'] && form.controls.confirmPassword.touched) { <small>Passwords do not match</small> }`,
    },
    {
      task: 'Write a loggingInterceptor that prints "GET /api/students -> 200 in 35 ms" for each request and register it before authInterceptor.',
      hint: 'Use Date.now() before next(req), then tap with HttpResponse / finalize.',
      solution: `export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse)
        console.log(req.method + ' ' + req.url + ' -> ' + event.status + ' in ' + (Date.now() - start) + ' ms');
    })
  );
};
provideHttpClient(withInterceptors([loggingInterceptor, authInterceptor]))`,
    },
    {
      task: 'Add a canDeactivate guard to the student form: if the form is dirty and not saved, ask "Discard changes?".',
      hint: 'CanDeactivateFn<StudentFormComponent> receives the component instance.',
      solution: `export const unsavedGuard: CanDeactivateFn<StudentFormComponent> = (component) =>
  component.form.dirty && !component.saved ? confirm('Discard changes?') : true;

{ path: 'students/new', loadComponent: ..., canDeactivate: [unsavedGuard] }
// in the component: saved = false; set saved = true before navigating after a successful POST`,
    },
    {
      task: 'On the .NET side, add a policy "CanManageDrives" that needs role Admin OR the claim "dept" = "TPO", and use it on a DrivesController.',
      hint: 'AddAuthorization(o => o.AddPolicy(..., p => p.RequireAssertion(ctx => ...))).',
      solution: `builder.Services.AddAuthorization(o =>
    o.AddPolicy("CanManageDrives", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") || ctx.User.HasClaim("dept", "TPO"))));

[Authorize(Policy = "CanManageDrives")]
[ApiController, Route("api/drives")]
public class DrivesController : ControllerBase { ... }`,
    },
  ],
  quiz: [
    {
      question: 'Which property lazy loads a group of child routes from another file?',
      options: ['component', 'loadChildren', 'redirectTo', 'children'],
      answer: 1,
      explanation: 'loadChildren: () => import(\'./admin/admin.routes\').then(m => m.ADMIN_ROUTES) downloads that chunk only on first visit. children defines child routes eagerly.',
    },
    {
      question: 'What does a custom validator return when the value is VALID?',
      options: ['true', 'an empty string', 'null', '{ valid: true }'],
      answer: 2,
      explanation: 'null means "no errors". Any object (e.g. { collegeEmail: true }) is an error map.',
    },
    {
      question: 'Inside an HTTP interceptor, how do you add the Authorization header?',
      options: ['req.headers.set(\'Authorization\', ...) and return req', 'req.clone({ setHeaders: { Authorization: \'Bearer \' + token } })', 'document.cookie = token', 'localStorage.setItem(\'Authorization\', token)'],
      answer: 1,
      explanation: 'HttpRequest is immutable, so headers.set returns a new object and does not change req. clone with setHeaders creates the modified request.',
    },
    {
      question: 'A guard should send anonymous users to the login page. What is the best thing to return?',
      options: ['false', 'router.createUrlTree([\'/login\'], { queryParams: { returnUrl: state.url } })', 'throw new Error()', 'window.location.href = \'/login\''],
      answer: 1,
      explanation: 'Returning a UrlTree cancels the current navigation and redirects cleanly, keeping the original URL for after login.',
    },
    {
      question: 'A Student-role user calls an API action marked [Authorize(Roles = "Admin")] with a valid token. What status does the API return?',
      options: ['200', '401', '404', '403'],
      answer: 3,
      explanation: 'The user is authenticated (valid token), so it is not 401, but the user lacks the role, so the API returns 403 Forbidden.',
    },
  ],
};
