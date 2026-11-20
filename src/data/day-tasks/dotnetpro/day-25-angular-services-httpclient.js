export default {
  lesson: 'day-25-angular-services-httpclient',
  minutes: 25,
  intro: 'Practise Angular services, HttpClient setup, RxJS operators, environment files and CORS on the ASP.NET Core API.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'The placement UI shows a blank page and the console says **NullInjectorError: No provider for HttpClient!**. The app uses standalone components. What is the fix?',
      options: [
        'Add `HttpClient` to the component `imports` array',
        'Add `provideHttpClient()` to the `providers` in `app.config.ts`',
        'Create it with `new HttpClient()` inside the service',
        'Install the `@angular/http` package',
      ],
      answer: 1,
      explain: 'HttpClient is a service, so it must be registered with the DI container once. In standalone apps that is `provideHttpClient()` in `app.config.ts` (older NgModule apps imported HttpClientModule). Components list other components/directives in `imports`, not services. Never create HttpClient with `new`, because it needs its own dependencies.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete \`app.config.ts\` so that every service can inject HttpClient (use the fetch API backend if you like):
\`\`\`
export const appConfig: ApplicationConfig = {
  providers: [ provideRouter(routes), ______ ]
};
\`\`\``,
      example: { title: 'Where the providers live', code: `// main.ts
bootstrapApplication(AppComponent, appConfig);` },
      accept: ['provideHttpClient()', 'provideHttpClient(withFetch())', 'provideHttpClient(withInterceptors([]))', 'provideHttpClient(withFetch(), withInterceptors([]))'],
      acceptRegex: ['^provideHttpClient\\(.*\\)$'],
      caseSensitive: true,
      explain: '`provideHttpClient(...)` registers HttpClient in the root injector. Optional features go inside it: `withFetch()`, `withInterceptors([...])`. A common mistake is writing `HttpClientModule` here: it is a deprecated NgModule and is not a provider function.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this RxJS code print in the browser console? Write each line.',
      example: { title: 'How a pipe works', text: 'Each emitted value goes through every operator before the next value starts. filter drops values, map changes them.', code: `of(1, 2, 3).pipe(map(n => n * 2)).subscribe(v => console.log(v));
// 2
// 4
// 6` },
      code: `import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const marks$ = of(45, 82, 67, 91, 38);

marks$.pipe(
  filter(m => m >= 60),
  map((m, i) => i + ':' + (m >= 80 ? 'A' : 'B'))
).subscribe({
  next: v => console.log(v),
  complete: () => console.log('done')
});`,
      expected: `0:A
1:B
2:A
done`,
      explain: 'filter lets only 82, 67 and 91 through. The index `i` in map counts the values that REACH map (0, 1, 2), not the position in the original list. 82 -> A, 67 -> B, 91 -> A. After the last value, `of` completes, so `done` is printed. A common mistake is to use indexes 1, 2, 3 from the original list.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The API call fails. What is printed, in order?',
      example: { title: 'Recover vs re-throw', code: `catchError(() => of([]))                         // recover: next([]) then complete
catchError(e => throwError(() => new Error('x')))   // re-throw: error callback` },
      code: `import { of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const api$ = throwError(() => new Error('500'));

api$.pipe(
  map((list: any[]) => list.length),
  catchError(err => {
    console.log('caught ' + err.message);
    return of(-1);
  })
).subscribe({
  next: v => console.log('next ' + v),
  error: e => console.log('error ' + e.message),
  complete: () => console.log('complete')
});
console.log('after subscribe');`,
      expected: `caught 500
next -1
complete
after subscribe`,
      explain: 'The error skips `map` and reaches `catchError`, which logs it and returns `of(-1)`. The stream is now recovered, so the subscriber gets `next -1` and then `complete`, and the error callback never runs. `throwError` and `of` are synchronous, so all of this happens inside `subscribe()`, before `after subscribe`. (A real HttpClient call is asynchronous, so there `after subscribe` would print first.)',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The Angular app on http://localhost:4200 is blocked by CORS. Complete the ASP.NET Core policy so that ONLY the Angular dev server is allowed:
\`\`\`
builder.Services.AddCors(o => o.AddPolicy("AngularClient", policy =>
    policy.______("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
\`\`\``,
      example: { title: 'Do not forget the middleware', code: 'app.UseCors("AngularClient");   // before UseAuthorization and MapControllers' },
      accept: ['WithOrigins'],
      caseSensitive: true,
      explain: '`WithOrigins(...)` lists the exact allowed origins (scheme + host + port, no trailing slash). `AllowAnyOrigin()` would allow every website and cannot be combined with credentials. The policy only takes effect when `app.UseCors("AngularClient")` is in the pipeline.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about CORS between Angular and ASP.NET Core are TRUE? Select all that apply.',
      options: [
        'CORS is enforced by the browser, so Postman calls work even without a CORS policy',
        'The fix for a CORS error is to add an `Access-Control-Allow-Origin` header to the Angular request',
        'A PUT with a JSON body triggers an OPTIONS preflight request first',
        '`"http://localhost:4200/"` (with a trailing slash) in WithOrigins does not match the browser origin',
        'CORS protects the API from attackers who use curl',
      ],
      answers: [0, 2, 3],
      explain: 'CORS headers must come from the SERVER, because the browser decides based on the response. Non-simple requests (PUT/DELETE, JSON, Authorization header) are preflighted with OPTIONS. Origins are compared exactly, so a trailing slash breaks the match. CORS is not API security: curl and Postman ignore it. Use authentication and authorization for that.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A teammate wants to put the SQL Server connection string in `environment.ts` "so Angular can read it". What do you say?',
      options: [
        'Fine, environment files are encrypted at build time',
        'Fine, but only in environment.development.ts',
        'No: environment files are bundled into JavaScript that every user downloads. Keep secrets on the server only',
        'No: environment files can only contain booleans',
      ],
      answer: 2,
      explain: 'Everything in environment files ends up in the public JS bundle. Anyone can open DevTools and read it. Only public settings (apiUrl, feature flags) belong there. Database passwords and JWT keys stay in the API (appsettings, user secrets, Key Vault).',
    },
  ],
};
