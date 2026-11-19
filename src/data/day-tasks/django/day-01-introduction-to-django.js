export default {
  lesson: 'day-01-introduction-to-django',
  minutes: 25,
  intro: 'Check what Django is, how MVT and the request-response cycle work, and how Django compares with Flask; then write the request flow in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In Django\'s **MVT** architecture, which part contains the Python function that receives the request and decides what to return?',
      options: ['Model', 'View', 'Template', 'URLconf'],
      answer: 1,
      explain: 'The **View** handles the request: it reads data through the **Model**, fills a **Template** with it and returns a response. The URLconf only maps a URL to a view. Django\'s "View" plays the role of the "Controller" in MVC.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why is Django called "batteries included"? Which of these come built in? (choose all that apply)',
      options: ['An ORM for the database', 'An automatic admin panel', 'User authentication', 'A React frontend', 'Forms and validation', 'Protection against CSRF and SQL injection'],
      answers: [0, 1, 2, 4, 5],
      explain: 'Django ships with ORM, migrations, admin, auth, forms, templates, sessions and security protections. The frontend (React, Vue) is not part of Django - you either use Django templates or connect a separate frontend through an API (DRF).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A team must build a large college ERP with an admin back-office, user roles and many database tables, quickly. Which framework is the better default choice?',
      options: ['Flask, because it is smaller', 'Django, because admin, auth, ORM and structure come built in', 'Neither, Python cannot build websites', 'Only plain HTML'],
      answer: 1,
      explain: 'For big, database-heavy projects Django saves weeks: admin, auth, permissions, ORM and migrations are ready. Flask is great for small apps, microservices and when you want to pick every component yourself.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.http import HttpResponse
from django.test import RequestFactory

def home(request):
    return HttpResponse('Welcome to Student Portal')

def student_count(request):
    return HttpResponse(f'Method: {request.method}, path: {request.path}')

rf = RequestFactory()
r = home(rf.get('/'))
print(r.status_code, r.content.decode())
print(student_count(rf.get('/students/count/')).content.decode())
print(r['Content-Type'])`,
      expected: '200 Welcome to Student Portal\nMethod: GET, path: /students/count/\ntext/html; charset=utf-8',
      explain: 'A view is just a function that takes an `HttpRequest` and returns an `HttpResponse`. The response body is bytes (`content`), status defaults to 200 and the default content type is HTML with UTF-8.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Simulate the Django request-response cycle. Write `handle(path, urlpatterns, students)`:\n- `urlpatterns` is a list of `(route, view_function)`; find the first `route` equal to `path`\n- call the view with `students` (the "Model" data) - it returns a dict `{\'template\': str, \'context\': dict}`\n- "render": replace every `{{ key }}` in the template with `str(context[key])` and return `(200, html)`\n- no match → `(404, \'Page not found\')`',
      example: { title: 'replacing placeholders', code: "html = 'Hi {{ name }}'\nfor k, v in {'name': 'Asha'}.items():\n    html = html.replace('{{ ' + k + ' }}', str(v))\nprint(html)   # Hi Asha" },
      starter: `def student_list(students):
    return {'template': '<h1>{{ count }} students</h1><p>{{ names }}</p>',
            'context': {'count': len(students), 'names': ', '.join(students)}}

def about(students):
    return {'template': '<h1>About {{ portal }}</h1>', 'context': {'portal': 'Student Portal'}}

urlpatterns = [('/students/', student_list), ('/about/', about)]

def handle(path, urlpatterns, students):
    # TODO: URLconf -> View -> Template
    return (404, 'Page not found')
`,
      solution: `def student_list(students):
    return {'template': '<h1>{{ count }} students</h1><p>{{ names }}</p>',
            'context': {'count': len(students), 'names': ', '.join(students)}}

def about(students):
    return {'template': '<h1>About {{ portal }}</h1>', 'context': {'portal': 'Student Portal'}}

urlpatterns = [('/students/', student_list), ('/about/', about)]

def handle(path, urlpatterns, students):
    for route, view in urlpatterns:
        if route == path:
            result = view(students)
            html = result['template']
            for key, value in result['context'].items():
                html = html.replace('{{ ' + key + ' }}', str(value))
            return (200, html)
    return (404, 'Page not found')
`,
      tests: [
        { call: "handle('/students/', urlpatterns, ['Asha', 'Ravi'])", expect: [200, '<h1>2 students</h1><p>Asha, Ravi</p>'] },
        { call: "handle('/about/', urlpatterns, [])", expect: [200, '<h1>About Student Portal</h1>'] },
        { call: "handle('/fees/', urlpatterns, [])", expect: [404, 'Page not found'] },
      ],
      explain: 'That is the whole Django cycle in miniature: **URLconf** finds the view → the **view** gets data (Model) → the **template** is rendered with a context → an HTTP response goes back. Django tries `urlpatterns` top to bottom and stops at the first match; no match means 404.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Django splits a **project** into reusable **apps**. Write `group_features(features)` that receives a list of `(feature, app)` tuples and returns a dict `{app: [features]}` with the apps sorted alphabetically and each feature list in the original order.',
      example: { title: 'grouping into lists', code: "groups = {}\nfor name, dept in [('Asha', 'CSE'), ('Ravi', 'IT')]:\n    groups.setdefault(dept, []).append(name)" },
      starter: `def group_features(features):
    # TODO
    return {}
`,
      solution: `def group_features(features):
    groups = {}
    for feature, app in features:
        groups.setdefault(app, []).append(feature)
    return {app: groups[app] for app in sorted(groups)}
`,
      tests: [
        { call: "group_features([('student list', 'students'), ('login', 'accounts'), ('add student', 'students'), ('fee receipt', 'fees'), ('logout', 'accounts')])", expect: { accounts: ['login', 'logout'], fees: ['fee receipt'], students: ['student list', 'add student'] } },
        { call: 'list(group_features([("a", "z"), ("b", "m")]))', expect: ['m', 'z'] },
        { call: 'group_features([])', expect: {} },
      ],
      explain: 'A Django **project** (student_portal) is the whole website with settings; an **app** (students, accounts, fees) is one feature area with its own models, views, urls and templates. Grouping related features keeps each app small and reusable.',
    },
  ],
};
