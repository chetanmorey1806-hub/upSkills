export default {
  lesson: 'day-30-professional-developer-toolkit',
  minutes: 22,
  intro: 'Practise the daily professional toolkit: IntelliJ debugging, code quality, pull-request reviews, Postman scripts and Scrum with Jira.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The debugger is paused on `double total = cart.calculateTotal();`. You want to go **inside** `calculateTotal()` to see what it does. Which action?',
      options: ['Step Over (F8)', 'Step Into (F7)', 'Resume (F9)', 'Step Out (Shift+F8)'],
      answer: 1,
      explain: '**Step Into** enters the called method. Step Over runs the whole line and stops on the next line; Step Out finishes the current method and returns to the caller; Resume runs until the next breakpoint.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A **conditional breakpoint** with condition `i == 3` is set on the marked line. When the debugger pauses for the first time, what value does the Variables panel show for `sum`?',
      example: { title: 'when does it pause?', text: 'A breakpoint pauses BEFORE the marked line runs.' },
      code: `int sum = 0;
for (int i = 1; i <= 5; i++) {
    sum += i * i;          // <- breakpoint, condition: i == 3
}
System.out.println(sum);`,
      expected: '5',
      explain: 'It pauses when i is 3, **before** `sum += 9` runs. Only i = 1 and i = 2 have been added: 1 + 4 = **5**. Conditional breakpoints save you from pressing Resume many times inside loops.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A bug appears only for students who failed. Write the **condition** for a conditional breakpoint inside `for (Student s : students)` that pauses only when the student\'s marks (getter `getMarks()`) are below 35.',
      example: { title: 'another condition', code: 's.getCity().equals("Pune")' },
      accept: ['s.getMarks() < 35', 's.getMarks()<35', '35 > s.getMarks()'],
      explain: 'The condition is any boolean Java expression evaluated in the current scope: `s.getMarks() < 35`. Right-click the breakpoint (red dot) to add it. Evaluate Expression (Alt+F8) lets you test such expressions while paused.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In the Postman **Tests** tab of the login request, save the returned JWT (`{ "token": "..." }`) into the environment variable `token` so other requests can use `{{token}}`:\n```\n???\n```',
      example: { title: 'reading a variable in a script', code: 'const t = pm.environment.get("token");' },
      accept: ['pm.environment.set("token", pm.response.json().token);', 'pm.environment.set("token", pm.response.json().token)', "pm.environment.set('token', pm.response.json().token);", 'pm.collectionVariables.set("token", pm.response.json().token);'],
      explain: '`pm.environment.set("token", pm.response.json().token)` chains requests: login once, and every request with `Authorization: Bearer {{token}}` works. Combined with tests and the Collection Runner (or Newman in CI), this becomes automated API testing.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good **code review / pull request** practices? (choose all that apply)',
      options: [
        'Keep PRs small and focused, with a clear description and linked Jira ticket',
        'Make sure the build, tests and SonarLint/SonarQube checks pass before asking for review',
        'Comment on the code, not the person, and explain the reason for a suggestion',
        'Approve without reading because the author is senior',
        'Reply to every comment and push fixes before merging',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Small PRs get faster, better reviews. Automated checks catch the boring issues so reviewers can focus on design and logic. Respectful, explained feedback improves the team; rubber-stamp approvals let bugs through.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a Scrum team using Jira, what happens in the **Daily Stand-up**?',
      options: [
        'The manager assigns all tasks for the month',
        'A short (about 15 minute) meeting where each member says what they did, what they will do next and any blockers',
        'The team demos the product to the client',
        'The team writes the full technical design',
      ],
      answer: 1,
      explain: 'The stand-up is a quick daily sync about progress and **blockers**. Sprint Planning chooses work for the sprint, the Sprint Review demos it, the Retrospective improves the process. In Jira tickets move To Do → In Progress → In Review → Done.',
    },
  ],
};
