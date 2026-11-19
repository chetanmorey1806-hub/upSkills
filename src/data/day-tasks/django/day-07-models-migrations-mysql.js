export default {
  lesson: 'day-07-models-migrations-mysql',
  minutes: 35,
  intro: 'Practise model fields and options, null vs blank, makemigrations/migrate and MySQL configuration, and write the SQL a migration creates.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `null=True` and `blank=True`?',
      options: ['They are the same', 'null is about the DATABASE (column can store NULL); blank is about VALIDATION (forms/admin may leave it empty)', 'blank is about the database, null about forms', 'null is only for numbers'],
      answer: 1,
      explain: '`null=True` → the column allows NULL. `blank=True` → forms and the admin accept an empty value. For optional text fields use `blank=True` only (store an empty string); for optional numbers/dates/FKs use both.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the field so each student\'s email must be different from every other student\'s:\n\n```\nclass Student(models.Model):\n    name = models.CharField(max_length=100)\n    email = ______\n```',
      accept: ['models.EmailField(unique=True)', 'models.EmailField(max_length=254, unique=True)', 'models.EmailField(unique=True, max_length=254)'],
      explain: '`EmailField` validates the format (in forms/admin) and `unique=True` adds a UNIQUE index in the database, so duplicates raise `IntegrityError` even if someone bypasses the form.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about migrations are TRUE? (choose all that apply)',
      options: [
        'makemigrations creates migration files from model changes; migrate applies them to the database',
        'Migration files should be committed to Git',
        'showmigrations lists which migrations are applied ([X])',
        'sqlmigrate students 0001 shows the SQL a migration will run',
        'After changing a model you only need to restart runserver',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Model change → `makemigrations` (writes `0002_....py`) → `migrate` (runs SQL). Migration files are part of your code so every teammate and server gets the same schema. Restarting the server does not change the database.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'This model\n```\nclass Student(models.Model):\n    name = models.CharField(max_length=100)\n    roll_no = models.CharField(max_length=20, unique=True)\n    marks = models.IntegerField(default=0)\n    city = models.CharField(max_length=50, blank=True)\n```\nbecomes the table `students_student`. Write the **CREATE TABLE** (SQLite) that migrate would run, then insert two students: `(\'Asha\', \'CS001\', 82, \'Pune\')` and `(\'Ravi\', \'CS002\', 67, \'\')`, and finally select `name, roll_no, marks` ordered by `id`.',
      example: { title: 'CREATE TABLE with constraints', code: "CREATE TABLE shop_product (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title VARCHAR(100) NOT NULL,\n  sku VARCHAR(20) NOT NULL UNIQUE,\n  stock INTEGER NOT NULL DEFAULT 0\n);" },
      setup: '-- the database is empty: you create the table\nSELECT 1;',
      starter: '-- CREATE TABLE students_student (...);\n-- INSERT ...\n-- SELECT ...\n',
      solution: `CREATE TABLE students_student (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  roll_no VARCHAR(20) NOT NULL UNIQUE,
  marks INTEGER NOT NULL DEFAULT 0,
  city VARCHAR(50) NOT NULL
);
INSERT INTO students_student (name, roll_no, marks, city) VALUES ('Asha', 'CS001', 82, 'Pune'), ('Ravi', 'CS002', 67, '');
SELECT name, roll_no, marks FROM students_student ORDER BY id;`,
      ordered: true,
      explain: 'Django adds an auto-increment `id` primary key, names the table `<app>_<model>`, makes every column **NOT NULL** unless `null=True`, and adds UNIQUE for `unique=True`. `blank=True` has no effect on the schema - that is why Ravi\'s empty city is stored as `\'\'`. Check with `python manage.py sqlmigrate students 0001`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `diff_models(old, new)` - the core of `makemigrations`. `old` and `new` are dicts `{field_name: field_definition_string}`. Return a list of operations (sorted by field name within each group, groups in this order):\n1. `\'AddField <name>\'` for fields only in `new`\n2. `\'RemoveField <name>\'` for fields only in `old`\n3. `\'AlterField <name>\'` for fields in both with a different definition\n\nNo differences → `[]` ("No changes detected").',
      example: { title: 'set operations on dict keys', code: "a = {'x': 1, 'y': 2}\nb = {'y': 3, 'z': 4}\nprint(sorted(b.keys() - a.keys()), sorted(a.keys() & b.keys()))   # ['z'] ['y']" },
      starter: `def diff_models(old, new):
    ops = []
    # TODO
    return ops
`,
      solution: `def diff_models(old, new):
    ops = []
    for name in sorted(new.keys() - old.keys()):
        ops.append(f'AddField {name}')
    for name in sorted(old.keys() - new.keys()):
        ops.append(f'RemoveField {name}')
    for name in sorted(old.keys() & new.keys()):
        if old[name] != new[name]:
            ops.append(f'AlterField {name}')
    return ops
`,
      tests: [
        { call: "diff_models({'name': 'CharField(100)', 'marks': 'IntegerField()'}, {'name': 'CharField(150)', 'marks': 'IntegerField()', 'phone': 'CharField(10, blank=True)', 'city': 'CharField(50)'})", expect: ['AddField city', 'AddField phone', 'AlterField name'] },
        { call: "diff_models({'name': 'CharField(100)', 'age': 'IntegerField()'}, {'name': 'CharField(100)'})", expect: ['RemoveField age'] },
        { call: "diff_models({'name': 'CharField(100)'}, {'name': 'CharField(100)'})", expect: [] },
      ],
      explain: 'Django compares the current models with the state recorded in existing migration files and writes operations like `AddField`, `RemoveField`, `AlterField`. Adding a NOT NULL field to a table with rows makes Django ask for a **default** - give one (`default=0`) or allow `null=True`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `mysql_settings(env)` that builds `DATABASES[\'default\']` for MySQL from environment variables (dict `env`): `ENGINE` = `\'django.db.backends.mysql\'`, `NAME` from `DB_NAME`, `USER` from `DB_USER`, `PASSWORD` from `DB_PASSWORD`, `HOST` from `DB_HOST` (default `\'localhost\'`), `PORT` from `DB_PORT` (default `\'3306\'`), `OPTIONS` = `{\'charset\': \'utf8mb4\'}`. If `DB_NAME`, `DB_USER` or `DB_PASSWORD` is missing return `\'error: missing <KEY>\'` for the first missing one.',
      example: { title: 'required vs optional env values', code: "for key in ('A', 'B'):\n    if not env.get(key):\n        return f'error: missing {key}'\nport = env.get('PORT', '8000')" },
      starter: `def mysql_settings(env):
    # TODO
    return {}
`,
      solution: `def mysql_settings(env):
    for key in ('DB_NAME', 'DB_USER', 'DB_PASSWORD'):
        if not env.get(key):
            return f'error: missing {key}'
    return {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env['DB_NAME'],
        'USER': env['DB_USER'],
        'PASSWORD': env['DB_PASSWORD'],
        'HOST': env.get('DB_HOST', 'localhost'),
        'PORT': env.get('DB_PORT', '3306'),
        'OPTIONS': {'charset': 'utf8mb4'},
    }
`,
      tests: [
        { call: "mysql_settings({'DB_NAME': 'student_portal', 'DB_USER': 'portal', 'DB_PASSWORD': 'S3cret!'})", expect: { ENGINE: 'django.db.backends.mysql', NAME: 'student_portal', USER: 'portal', PASSWORD: 'S3cret!', HOST: 'localhost', PORT: '3306', OPTIONS: { charset: 'utf8mb4' } } },
        { call: "mysql_settings({'DB_NAME': 'sp', 'DB_USER': 'u', 'DB_PASSWORD': 'p', 'DB_HOST': 'db.internal', 'DB_PORT': '3307'})['HOST']", expect: 'db.internal' },
        { call: "mysql_settings({'DB_NAME': 'sp', 'DB_PASSWORD': 'p'})", expect: 'error: missing DB_USER' },
      ],
      explain: 'Keep database passwords out of settings.py and Git - read them from the environment. `utf8mb4` lets MySQL store every Unicode character (Hindi/Marathi names, emoji); plain `utf8` in MySQL is only 3 bytes and fails on some characters. Remember `pip install mysqlclient`.',
    },
  ],
};
