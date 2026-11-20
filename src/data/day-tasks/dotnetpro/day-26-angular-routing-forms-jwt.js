export default {
  lesson: 'day-26-angular-routing-forms-jwt',
  minutes: 25,
  intro: 'Practise Angular route matching, lazy loading, reactive form validation, the JWT interceptor and route guards against a .NET API.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Given these routes, which component is shown for each URL? Write one component name per line (for a redirect, write the component you finally see).\n1. `/students/new`\n2. `/students/7`\n3. `/students/7/edit`\n4. `/home`',
      example: { title: 'Matching rule', text: 'The router checks routes from top to bottom and uses the FIRST route whose path matches the whole URL.' },
      code: `export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentFormComponent },
  { path: 'students/:id', component: StudentDetailComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];`,
      expected: `StudentFormComponent
StudentDetailComponent
NotFoundComponent
HomeComponent`,
      explain: '`students/new` matches its own route because it is listed BEFORE `students/:id`. If the order were reversed, "new" would be treated as an id. `students/7` fills the `:id` parameter. `students/7/edit` has an extra segment that no route covers, so the wildcard `**` catches it. `/home` redirects to `\'\'`, which shows HomeComponent.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Lazy load the whole admin area (a separate routes file) only when the TPO first opens /admin:
\`\`\`
{ path: 'admin', canActivate: [authGuard],
  ______: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) }
\`\`\``,
      example: { title: 'Lazy loading ONE component', code: `{ path: 'students', loadComponent: () => import('./students/student-list.component').then(m => m.StudentListComponent) }` },
      accept: ['loadChildren'],
      caseSensitive: true,
      explain: '`loadChildren` loads a Routes array from another file as a separate chunk. `loadComponent` is for a single standalone component. `children` would define child routes eagerly, so they would be in the main bundle.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The user has typed the values shown. What do the four `console.log` lines print?',
      example: { title: 'Validator facts', text: 'Validators.email and Validators.pattern do NOT report an error for an empty value; only Validators.required does. Error keys are lowercase: required, minlength, maxlength, min, max, email, pattern.' },
      code: `form = this.fb.nonNullable.group({
  name:  ['Ra', [Validators.required, Validators.minLength(3)]],
  email: ['',   [Validators.email]],
  cgpa:  [11,   [Validators.min(0), Validators.max(10)]]
});

console.log(this.form.controls.name.valid);
console.log(this.form.controls.email.valid);
console.log(Object.keys(this.form.controls.cgpa.errors ?? {}).join(','));
console.log(this.form.status);`,
      expected: `false
true
max
INVALID`,
      explain: '"Ra" has 2 characters, so minLength(3) fails and name is invalid. The empty email is VALID because there is no `required` validator, and `email` skips empty values. CGPA 11 fails only `max(10)`, so the error map has just the key `max`. One invalid control makes the whole group INVALID.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside the functional auth interceptor, add the Bearer token. HttpRequest is immutable, so complete the line:
\`\`\`
const authReq = req.______({ setHeaders: { Authorization: 'Bearer ' + token } });
return next(authReq);
\`\`\``,
      example: { title: 'Registering it', code: 'provideHttpClient(withInterceptors([authInterceptor]))' },
      accept: ['clone'],
      caseSensitive: true,
      explain: '`req.clone({...})` creates a modified copy. You cannot change `req.headers` in place, because `headers.set()` returns a NEW HttpHeaders object, so the original request would go out without the token. Always pass the clone to `next()`.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which return values are valid for a `CanActivateFn` guard? Select all that apply.',
      options: [
        '`true`',
        '`false`',
        '`router.createUrlTree([\'/login\'])`',
        'An Observable or Promise that resolves to true / false / UrlTree',
        '`\'/login\'` (a plain string)',
      ],
      answers: [0, 1, 2, 3],
      explain: 'A guard can return a boolean, a UrlTree (redirect), or an Observable/Promise of those for async checks (for example, calling the API). A plain string is not a valid result. Returning a UrlTree is the clean way to redirect anonymous users to /login.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Asha (role Student) has a valid JWT and calls `DELETE /api/students/3`, which is marked `[Authorize(Roles = "Admin")]`. Which status code does the .NET API return?',
      options: ['200 OK', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      answer: 2,
      explain: '401 means "who are you?" (no token, or an invalid or expired token). Asha IS authenticated, but she lacks the Admin role, so the answer is 403 Forbidden. The interceptor should log out only on 401, not on 403.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The Angular `roleGuard` hides /admin from students. Is the placement data now secure?',
      options: [
        'Yes, guards run before the API is called',
        'No. Guards only run in the browser and can be bypassed. The API must enforce `[Authorize(Roles = "Admin")]`',
        'Yes, if the guard is lazy loaded',
        'No, guards only work with template-driven forms',
      ],
      answer: 1,
      explain: 'Anyone can call the API with Postman or edit the JavaScript in DevTools. Guards improve the user experience. Security is enforced on the server with authentication and authorization attributes or policies.',
    },
  ],
};
