export default {
  lesson: 'day-13-shell-seeding-fixtures',
  minutes: 30,
  intro: 'Practise the Django shell, idempotent seed scripts with get_or_create, and fixtures with dumpdata/loaddata, and build fixture JSON and seed logic in plain Python.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Write the command that exports all data of the `students` app into `students.json` with readable indentation:',
      accept: ['python manage.py dumpdata students --indent 2 > students.json', 'python manage.py dumpdata students --indent 2 -o students.json', 'python manage.py dumpdata students --indent=2 > students.json', 'python manage.py dumpdata students --indent 2 --output students.json', 'python manage.py dumpdata students --indent 4 > students.json', 'python manage.py dumpdata students --indent=4 -o students.json'],
      explain: '`dumpdata <app>` serialises rows as JSON; `--indent 2` makes it readable; `-o`/`--output` or `>` writes to a file. Load it again with `python manage.py loaddata students.json` (the file is searched in each app\'s `fixtures/` folder too).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Your seed script runs `Course.objects.create(name=\'BCA\')`. What happens when you run the script a second time?',
      options: ['Nothing, Django skips existing rows', 'A duplicate BCA row is created (or IntegrityError if name is unique)', 'The first row is updated', 'The table is emptied first'],
      answer: 1,
      explain: '`create()` always inserts. An **idempotent** seed script (safe to run many times) uses `get_or_create(name=\'BCA\')` or `update_or_create(...)`, so a second run changes nothing.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'A fixture row looks like {"model": "students.course", "pk": 1, "fields": {...}}',
        'loaddata overwrites rows that have the same primary key',
        'python manage.py shell -c "from students.models import Course; print(Course.objects.count())" runs one command',
        'dumpdata --natural-foreign helps move data between databases where ids differ (e.g. contenttypes)',
        'Fixtures are the recommended way to store user passwords in Git',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Fixtures are JSON/YAML lists of `model`, `pk`, `fields`; loading them saves each object with that pk (update or insert). Use `--natural-foreign --exclude contenttypes --exclude auth.permission` when migrating SQLite → MySQL. Never commit real user data or passwords.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `to_fixture(model_label, rows)` that converts a list of dicts (each with an `id`) into Django fixture format: a list of `{\'model\': model_label, \'pk\': row[\'id\'], \'fields\': {all other keys}}`, sorted by `pk`.',
      example: { title: 'removing one key', code: "row = {'id': 3, 'name': 'BCA'}\nfields = {k: v for k, v in row.items() if k != 'id'}" },
      starter: `def to_fixture(model_label, rows):
    # TODO
    return []
`,
      solution: `def to_fixture(model_label, rows):
    out = []
    for row in sorted(rows, key=lambda r: r['id']):
        out.append({'model': model_label, 'pk': row['id'], 'fields': {k: v for k, v in row.items() if k != 'id'}})
    return out
`,
      tests: [
        { call: "to_fixture('students.course', [{'id': 2, 'name': 'MCA', 'fees': 90000}, {'id': 1, 'name': 'BCA', 'fees': 60000}])", expect: [{ model: 'students.course', pk: 1, fields: { name: 'BCA', fees: 60000 } }, { model: 'students.course', pk: 2, fields: { name: 'MCA', fees: 90000 } }] },
        { call: "to_fixture('students.student', [{'id': 7, 'name': 'Asha', 'course': 1}])[0]['fields']", expect: { name: 'Asha', course: 1 } },
        { call: "to_fixture('x.y', [])", expect: [] },
      ],
      explain: 'This is the exact format `dumpdata` writes and `loaddata` reads. Foreign keys are stored as the related **pk** (`"course": 1`), which is why ids must match between databases - or you use natural keys.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write an idempotent `seed(db, courses)` like a seed management command. `db` is a dict `{name: {\'fees\': ...}}` (the table). For each `(name, fees)` in `courses` do `update_or_create`: create missing courses, update fees that changed, leave equal ones alone. Return a dict `{\'created\': n, \'updated\': n, \'unchanged\': n}`.',
      example: { title: 'update_or_create in Django', code: "obj, created = Course.objects.update_or_create(\n    name='BCA', defaults={'fees': 60000})" },
      starter: `def seed(db, courses):
    stats = {'created': 0, 'updated': 0, 'unchanged': 0}
    # TODO
    return stats
`,
      solution: `def seed(db, courses):
    stats = {'created': 0, 'updated': 0, 'unchanged': 0}
    for name, fees in courses:
        if name not in db:
            db[name] = {'fees': fees}
            stats['created'] += 1
        elif db[name]['fees'] != fees:
            db[name]['fees'] = fees
            stats['updated'] += 1
        else:
            stats['unchanged'] += 1
    return stats
`,
      tests: [
        { call: "seed({}, [('BCA', 60000), ('MCA', 90000)])", expect: { created: 2, updated: 0, unchanged: 0 } },
        { call: "(lambda db: (seed(db, [('BCA', 60000), ('MCA', 90000)]), seed(db, [('BCA', 60000), ('MCA', 90000)]))[1])({})", expect: { created: 0, updated: 0, unchanged: 2 }, msg: 'Running the seed twice must not create duplicates' },
        { call: "(lambda db: (seed(db, [('BCA', 65000), ('BBA', 55000)]), db)[1])({'BCA': {'fees': 60000}})", expect: { BCA: { fees: 65000 }, BBA: { fees: 55000 } } },
      ],
      explain: 'Seed scripts run on every developer machine and CI, often several times. Using `get_or_create`/`update_or_create` (lookup on a unique field + `defaults`) keeps them **idempotent**. Reporting created/updated counts (`self.stdout.write(...)` in a command) makes runs easy to check.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Django\'s serializer turns model instances into fixture JSON. What does this program print? (runs inside a configured Django project; the tables were just created)',
      code: `import json
from django.core import serializers
from django.core.management import call_command
from django.contrib.auth.models import Group

call_command('migrate', 'auth', verbosity=0)
Group.objects.create(name='Teachers')
Group.objects.create(name='Office Staff')
data = json.loads(serializers.serialize('json', Group.objects.order_by('id'), fields=['name']))
print(len(data))
print(data[0]['model'], data[0]['pk'], data[0]['fields'])`,
      expected: "2\nauth.group 1 {'name': 'Teachers'}",
      explain: '`serializers.serialize(\'json\', queryset)` produces the same `[{model, pk, fields}]` structure that `dumpdata` writes. The `model` label is `app_label.modelname` in lower case.',
    },
  ],
};
