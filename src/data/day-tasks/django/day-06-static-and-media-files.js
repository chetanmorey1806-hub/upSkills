export default {
  lesson: 'day-06-static-and-media-files',
  minutes: 25,
  intro: 'Practise static vs media files, STATIC_URL / STATICFILES_DIRS / STATIC_ROOT / MEDIA_URL / MEDIA_ROOT, {% static %} and collectstatic, and write the path logic in plain Python.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **media** files (not static files)? (choose all that apply)',
      options: ['A student\'s uploaded profile photo', 'The site logo in static/images/logo.png', 'An uploaded fee receipt PDF', 'Bootstrap CSS', 'Assignment files uploaded by teachers'],
      answers: [0, 2, 4],
      explain: '**Static** files are part of your code (CSS, JS, logos) and change only when you deploy. **Media** files are uploaded by users at runtime and live in `MEDIA_ROOT`. Mixing them up leads to user uploads being overwritten or committed to Git.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the template so the CSS file `static/css/style.css` is linked correctly:\n\n```\n{% load static %}\n<link rel="stylesheet" href="______">\n```',
      accept: ["{% static 'css/style.css' %}", '{% static "css/style.css" %}'],
      explain: '`{% static \'css/style.css\' %}` prefixes the path with `STATIC_URL` (e.g. `/static/css/style.css`) and in production can add a hash for caching. `{% load static %}` must appear in **every** template that uses it (even if base.html loads it).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `python manage.py collectstatic` do?',
      options: ['Deletes unused CSS', 'Copies static files from every app and STATICFILES_DIRS into STATIC_ROOT so the web server can serve them', 'Uploads media files to the cloud', 'Minifies JavaScript'],
      answer: 1,
      explain: 'In production Django does not serve static files itself. `collectstatic` gathers them into **one** folder (`STATIC_ROOT`) that Nginx or WhiteNoise serves. `STATIC_ROOT` must not be one of the `STATICFILES_DIRS`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project with `STATIC_URL = \'/static/\'`)',
      code: `from django.conf import settings
from django.template import Template, Context
from django.templatetags.static import static

settings.STATIC_URL = '/static/'
print(static('css/style.css'))
print(static('images/logo.png'))
t = Template("{% load static %}<img src=\\"{% static 'img/' %}{{ file }}\\" alt=\\"{{ alt }}\\">")
print(t.render(Context({'file': 'asha.jpg', 'alt': 'Asha'})))`,
      expected: '/static/css/style.css\n/static/images/logo.png\n<img src="/static/img/asha.jpg" alt="Asha">',
      explain: '`static()` (and the `{% static %}` tag) joins `STATIC_URL` with the relative path. You can combine the tag with a variable after it, as shown with `img/` + `{{ file }}`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `file_url(kind, relative_path, settings)` that returns the public URL of a file: `kind` is `\'static\'` or `\'media\'`; use `settings[\'STATIC_URL\']` or `settings[\'MEDIA_URL\']`. Make sure there is **exactly one** `/` between the URL prefix and the path (prefixes may or may not end with `/`, paths may or may not start with `/`). Unknown kind → `None`.',
      example: { title: 'joining without double slashes', code: "prefix, path = '/media/', '/photos/a.jpg'\nprint(prefix.rstrip('/') + '/' + path.lstrip('/'))   # /media/photos/a.jpg" },
      starter: `def file_url(kind, relative_path, settings):
    # TODO
    return None
`,
      solution: `def file_url(kind, relative_path, settings):
    key = {'static': 'STATIC_URL', 'media': 'MEDIA_URL'}.get(kind)
    if key is None:
        return None
    return settings[key].rstrip('/') + '/' + relative_path.lstrip('/')
`,
      tests: [
        { call: "file_url('static', 'css/style.css', {'STATIC_URL': '/static/', 'MEDIA_URL': '/media/'})", expect: '/static/css/style.css' },
        { call: "file_url('media', '/students/photos/asha.jpg', {'STATIC_URL': '/static/', 'MEDIA_URL': '/media/'})", expect: '/media/students/photos/asha.jpg' },
        { call: "file_url('media', 'receipts/r1.pdf', {'STATIC_URL': 'static', 'MEDIA_URL': 'https://cdn.portal.in/media'})", expect: 'https://cdn.portal.in/media/receipts/r1.pdf' },
        { call: "file_url('docs', 'x', {'STATIC_URL': '/static/', 'MEDIA_URL': '/media/'})", expect: null },
      ],
      explain: 'Templates use `{% static %}` and `{{ student.photo.url }}` instead of hard-coded paths, so moving files to a CDN only means changing `STATIC_URL`/`MEDIA_URL` in settings. Both URLs must end with `/` in Django settings.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `collectstatic(sources)` - a mini version of the command. `sources` is a list of `(location, [relative file paths])` in the order Django searches (STATICFILES_DIRS first, then each app\'s `static/` folder). Return a dict `{relative_path: location}` of what ends up in STATIC_ROOT: when two locations have the same relative path, the **first** one wins.',
      example: { title: 'keep the first value', code: "seen = {}\nfor name, city in [('asha', 'Pune'), ('asha', 'Delhi')]:\n    seen.setdefault(name, city)\nprint(seen)   # {'asha': 'Pune'}" },
      starter: `def collectstatic(sources):
    # TODO
    return {}
`,
      solution: `def collectstatic(sources):
    collected = {}
    for location, files in sources:
        for f in files:
            collected.setdefault(f, location)
    return collected
`,
      tests: [
        { call: "collectstatic([('static/', ['css/style.css', 'img/logo.png']), ('students/static/', ['students/list.js']), ('fees/static/', ['css/style.css'])])", expect: { 'css/style.css': 'static/', 'img/logo.png': 'static/', 'students/list.js': 'students/static/' } },
        { call: 'collectstatic([])', expect: {} },
      ],
      explain: 'Because the first match wins, two apps that both ship `css/style.css` clash silently. That is why app static files are **namespaced** in a sub-folder named after the app (`students/static/students/list.js`), exactly like templates.',
    },
  ],
};
