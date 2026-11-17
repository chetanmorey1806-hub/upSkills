export default {
  id: 'day-13-shell-seeding-fixtures',
  title: 'Django Shell and Data Seeding, Fixtures',
  module: 'Module 2: Models & Database',
  day: 13,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Work productively with the Django shell, fill the Student Portal with realistic test data using seed scripts and a seed management command, and save/restore/share data with fixtures (dumpdata and loaddata) - including moving data from SQLite to MySQL.`,
  objectives: [
    `Use python manage.py shell, shell -c and shell < script.py effectively`,
    `Write an idempotent seed script with get_or_create and random data`,
    `Create a simple seed management command with arguments`,
    `Create, load and export fixtures with loaddata and dumpdata (JSON/YAML options)`,
    `Migrate data between databases and seed reference data with a data migration`,
  ],
  theory: [
    {
      heading: `The Django shell`,
      content: `python manage.py shell opens a Python interactive console with Django already set up (settings loaded, apps ready), so you can import models and run ORM queries. A normal python console would fail with "ImproperlyConfigured: Requested setting INSTALLED_APPS, but settings are not configured".`,
      syntax: `python manage.py shell                       # interactive
python manage.py shell -c "from students.models import Student; print(Student.objects.count())"
python manage.py shell < seed.py             # run a script file (macOS/Linux/Git Bash/cmd)
Get-Content seed.py | python manage.py shell # Windows PowerShell
pip install ipython                          # shell automatically uses IPython (colours, autocomplete)`,
      points: [
        `Django 5.2+ auto-imports all models in the shell (no import lines needed); in 5.0/5.1 import them yourself.`,
        `PyCharm Professional: Tools > Python or Debug Console opens a Django-aware console. VS Code: use the integrated terminal.`,
        `Useful in the shell: Model._meta.get_fields(), print(qs.query), obj.__dict__, help(Student.objects.create).`,
      ],
    },
    {
      heading: `What is data seeding?`,
      content: `Seeding means filling the database with initial or sample data. Two kinds: reference data that the app needs to work (courses, subjects, states, roles) and demo/test data for development (hundreds of fake students). Seeding saves you from typing the same records in the admin after every database reset.`,
      points: [
        `Seed script (python manage.py shell < seed.py) - quick and simple.`,
        `Custom management command (python manage.py seed_students 50) - reusable, with arguments (full lesson on Day 26).`,
        `Fixtures (loaddata) - fixed JSON/YAML data such as courses.`,
        `Data migration (RunPython) - reference data created automatically when anyone runs migrate.`,
        `Libraries: Faker (realistic names/emails), factory_boy (test factories).`,
        `Make seeds idempotent - running twice must not create duplicates (use get_or_create / update_or_create).`,
      ],
    },
    {
      heading: `Fixtures: loaddata`,
      content: `A fixture is a file containing serialized data. Django looks for fixtures in every app's fixtures/ folder (and FIXTURE_DIRS). Each object has "model" (app_label.modelname), "pk" and "fields". ForeignKeys are stored as the related pk; ManyToMany as a list of pks.`,
      syntax: `students/fixtures/courses.json

python manage.py loaddata courses           # finds students/fixtures/courses.json
python manage.py loaddata courses subjects  # several files
python manage.py loaddata path/to/file.json`,
      tip: `loaddata writes objects by primary key: an existing row with the same pk is OVERWRITTEN, not duplicated. It bypasses save() (signals get raw=True) and does not run model validation.`,
    },
    {
      heading: `Fixtures: dumpdata`,
      content: `dumpdata exports database rows as fixtures - for backups, for sharing sample data with your team, or for moving data from SQLite to MySQL.`,
      syntax: `python manage.py dumpdata students --indent 2 > students_data.json
python manage.py dumpdata students.course --indent 2 -o students/fixtures/courses.json
python manage.py dumpdata --exclude contenttypes --exclude auth.permission --indent 2 -o full_backup.json
python manage.py dumpdata students --natural-foreign --natural-primary -o portal.json`,
      points: [
        `Use -o file.json instead of > on Windows PowerShell to avoid UTF-16 encoding problems.`,
        `Exclude contenttypes and auth.permission when moving between databases - they are recreated by migrate and would clash.`,
        `Formats: json (default), xml, jsonl, yaml (needs pip install pyyaml).`,
      ],
    },
    {
      heading: `Moving data from SQLite to MySQL`,
      content: `A common real task: you developed with SQLite and now switch to MySQL 8 (Day 7) but want to keep your data.`,
      points: [
        `1. With SQLite still active: python manage.py dumpdata --exclude contenttypes --exclude auth.permission --exclude admin.logentry --exclude sessions --indent 2 -o data.json`,
        `2. Change DATABASES to MySQL (or set DB_ENGINE=mysql in .env).`,
        `3. python manage.py migrate (creates empty tables in MySQL).`,
        `4. python manage.py loaddata data.json`,
        `5. Verify counts in the shell or MySQL Workbench.`,
      ],
    },
  ],
  examples: [
    {
      title: `Reference data fixture: courses and subjects`,
      scenario: `Every developer and server needs the same 3 courses and 4 subjects. Store them in a fixture and load with one command.`,
      steps: [
        `In VS Code / PyCharm create the folder students/fixtures/ and the file courses.json.`,
        `Run python manage.py loaddata courses.`,
        `Run it again - the count stays the same (pk-based overwrite).`,
        `Export the courses back with dumpdata to see the format Django writes.`,
      ],
      code: `// students/fixtures/courses.json
[
  {"model": "students.course", "pk": 1, "fields": {"code": "BCA", "name": "Bachelor of Computer Applications", "duration_years": 3}},
  {"model": "students.course", "pk": 2, "fields": {"code": "BSC", "name": "B.Sc Computer Science", "duration_years": 3}},
  {"model": "students.course", "pk": 3, "fields": {"code": "BCOM", "name": "Bachelor of Commerce", "duration_years": 3}},
  {"model": "students.subject", "pk": 1, "fields": {"name": "Python", "credits": 4}},
  {"model": "students.subject", "pk": 2, "fields": {"name": "Django", "credits": 4}},
  {"model": "students.subject", "pk": 3, "fields": {"name": "SQL", "credits": 3}},
  {"model": "students.subject", "pk": 4, "fields": {"name": "Accounts", "credits": 4}}
]

# Terminal
python manage.py loaddata courses
python manage.py loaddata courses
python manage.py dumpdata students.course --indent 2`,
      result: `Installed 7 object(s) from 1 fixture(s)
Installed 7 object(s) from 1 fixture(s)
[
{
  "model": "students.course",
  "pk": 1,
  "fields": {
    "code": "BCA",
    "name": "Bachelor of Computer Applications",
    "duration_years": 3
  }
},
{
  "model": "students.course",
  "pk": 2,
  ...
}
]`,
      explanation: `Loading twice still leaves 3 courses and 4 subjects because rows are matched by pk. Fixtures are ideal for small, fixed reference data that should be in version control.`,
    },
    {
      title: `Idempotent seed script with random demo students`,
      scenario: `Create 20 demo students with random names, courses, marks, subjects and profiles. Running the script twice must not create duplicates.`,
      steps: [
        `Create seed.py next to manage.py (VS Code: New File; PyCharm: right-click project > New > Python File).`,
        `Make sure courses are loaded (Example 1).`,
        `Run python manage.py shell < seed.py (PowerShell: Get-Content seed.py | python manage.py shell).`,
        `Run it again and compare.`,
      ],
      code: `# seed.py
import random
from decimal import Decimal
from students.models import Course, Subject, Student, StudentProfile

random.seed(42)            # same "random" data every time - reproducible
FIRST = ["Asha", "Ravi", "Meena", "Kiran", "Priya", "Arjun", "Sneha", "Vikram", "Divya", "Rahul"]
LAST = ["Verma", "Kumar", "Iyer", "Rao", "Nair", "Das", "Patel", "Singh"]
courses = list(Course.objects.all())
subjects = list(Subject.objects.all())

created = 0
for i in range(1, 21):
    roll = f"S{100 + i}"
    name = f"{random.choice(FIRST)} {random.choice(LAST)}"
    student, is_new = Student.objects.get_or_create(
        roll_no=roll,
        defaults={
            "name": name,
            "email": f"{roll.lower()}@college.in",
            "gender": random.choice(["M", "F"]),
            "course": random.choice(courses),
            "marks": random.randint(30, 100),
            "fee_paid": Decimal(random.choice([20000, 30000, 45000])),
        },
    )
    if is_new:
        student.subjects.set(random.sample(subjects, k=2))
        StudentProfile.objects.create(student=student, blood_group=random.choice(["A+", "B+", "O+", "AB+"]))
        created += 1

print(f"Created {created} students. Total now: {Student.objects.count()}")
for c in Course.objects.all():
    print(c.code, c.students.count())

# Terminal
python manage.py shell < seed.py
python manage.py shell < seed.py`,
      result: `Created 20 students. Total now: 20
BCA 10
BSC 3
BCOM 7
Created 0 students. Total now: 20
BCA 10
BSC 3
BCOM 7`,
      explanation: `get_or_create looks up by roll_no and only inserts when missing, so the second run creates nothing. random.seed(42) makes the generated data identical on every machine, which helps when the whole team discusses the same records. For real-looking data install Faker: fake.name(), fake.email().`,
    },
    {
      title: `Seed management command with arguments`,
      scenario: `Turn seeding into a proper command: python manage.py seed_students 5 [--clear]. (Management commands are covered in depth on Day 26.)`,
      steps: [
        `Create the folders students/management/commands/ with an empty __init__.py in management/ and in commands/.`,
        `Create students/management/commands/seed_students.py with the code below.`,
        `Run python manage.py seed_students 5, then python manage.py seed_students 3 --clear.`,
        `PyCharm: Run > Edit Configurations > + Python > script manage.py, parameters "seed_students 5" to run it with one click.`,
      ],
      code: `students/
\`-- management/
    |-- __init__.py
    \`-- commands/
        |-- __init__.py
        \`-- seed_students.py

# students/management/commands/seed_students.py
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from students.models import Course, Student, StudentProfile, Subject


class Command(BaseCommand):
    help = "Create random demo students for the Student Portal"

    def add_arguments(self, parser):
        parser.add_argument("count", type=int, help="How many students to create")
        parser.add_argument("--clear", action="store_true", help="Delete existing students first")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Student.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} rows"))
        courses = list(Course.objects.all())
        subjects = list(Subject.objects.all())
        if not courses:
            self.stderr.write(self.style.ERROR("No courses found. Run: python manage.py loaddata courses"))
            return
        start = Student.objects.count() + 1
        for i in range(start, start + options["count"]):
            roll = f"S{1000 + i}"
            student = Student.objects.create(
                roll_no=roll,
                name=f"Student {i}",
                email=f"{roll.lower()}@college.in",
                gender=random.choice(["M", "F"]),
                course=random.choice(courses),
                marks=random.randint(30, 100),
                fee_paid=Decimal(random.choice([20000, 30000, 45000])),
            )
            student.subjects.set(random.sample(subjects, k=min(2, len(subjects))))
            StudentProfile.objects.create(student=student)
        self.stdout.write(self.style.SUCCESS(f"Created {options['count']} students"))

# Terminal (after the 20 students from seed.py)
python manage.py seed_students 5
python manage.py seed_students 3 --clear
python manage.py help seed_students`,
      result: `Created 5 students
Deleted 100 rows
Created 3 students
usage: manage.py seed_students [-h] [--clear] [--version] [-v {0,1,2,3}]
                               ...
                               count`,
      explanation: `The command class gets argparse arguments through add_arguments. @transaction.atomic makes the whole seed all-or-nothing. "Deleted 100 rows" counts 25 students + 25 profiles + 50 subject links removed by CASCADE. self.style.SUCCESS/WARNING/ERROR colour the output.`,
    },
    {
      title: `Backup and SQLite -> MySQL data move with dumpdata/loaddata`,
      scenario: `Back up the Student Portal data and load it into the MySQL 8 database configured on Day 7.`,
      steps: [
        `With SQLite active (DB_ENGINE not set to mysql), run the dumpdata command.`,
        `Set DB_ENGINE=mysql in .env (Day 7) and run python manage.py migrate.`,
        `Run loaddata and verify the counts.`,
        `Open MySQL Workbench > student_portal_db > students_student > Select Rows to see the data.`,
      ],
      code: `# 1. Export from SQLite
python manage.py dumpdata --exclude contenttypes --exclude auth.permission \\
    --exclude admin.logentry --exclude sessions --indent 2 -o data.json

# 2. Switch to MySQL (.env: DB_ENGINE=mysql) and create tables
python manage.py migrate

# 3. Import into MySQL
python manage.py loaddata data.json

# 4. Verify
python manage.py shell -c "from students.models import Student, Course; print(Course.objects.count(), Student.objects.count())"

-- MySQL Workbench
SELECT c.code, COUNT(s.id) AS students
FROM students_course c LEFT JOIN students_student s ON s.course_id = c.id
GROUP BY c.code;`,
      result: `Installed 112 object(s) from 1 fixture(s)
3 20

code  | students
BCA   | 10
BCOM  | 7
BSC   | 3`,
      explanation: `The exact "Installed N object(s)" depends on what you have (courses, subjects, students, profiles, users, groups). Excluding contenttypes and permissions avoids IntegrityError because migrate already created those rows in MySQL with possibly different ids. Windows cmd uses ^ instead of \\ for line continuation - or write the command on one line.`,
    },
    {
      title: `Pure Python: how loaddata and dumpdata work`,
      scenario: `Model Django's fixture format with the json module to see why loading the same fixture twice does not duplicate rows.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Add a third student to the fixture text and run again.`,
      ],
      code: `import json

# A Django-style fixture: list of {"model", "pk", "fields"}
fixture_text = """
[
  {"model": "students.course", "pk": 1, "fields": {"code": "BCA", "name": "Computer Applications"}},
  {"model": "students.course", "pk": 2, "fields": {"code": "BSC", "name": "Computer Science"}},
  {"model": "students.student", "pk": 1, "fields": {"roll_no": "S101", "name": "Asha", "course": 1}},
  {"model": "students.student", "pk": 2, "fields": {"roll_no": "S102", "name": "Ravi", "course": 2}}
]
"""

database = {"students.course": {}, "students.student": {}}


def loaddata(text):
    objects = json.loads(text)
    for obj in objects:
        table = database[obj["model"]]
        table[obj["pk"]] = obj["fields"]          # insert OR overwrite by primary key
    print(f"Installed {len(objects)} object(s) from 1 fixture(s)")


def dumpdata(model):
    rows = [{"model": model, "pk": pk, "fields": f} for pk, f in database[model].items()]
    return json.dumps(rows, indent=2)


loaddata(fixture_text)
loaddata(fixture_text)                            # run twice: no duplicates
print("courses:", len(database["students.course"]), "students:", len(database["students.student"]))
database["students.student"][1]["name"] = "Asha Verma"
print(dumpdata("students.student"))`,
      python: {
        files: {
          'main.py': `import json

# A Django-style fixture: list of {"model", "pk", "fields"}
fixture_text = """
[
  {"model": "students.course", "pk": 1, "fields": {"code": "BCA", "name": "Computer Applications"}},
  {"model": "students.course", "pk": 2, "fields": {"code": "BSC", "name": "Computer Science"}},
  {"model": "students.student", "pk": 1, "fields": {"roll_no": "S101", "name": "Asha", "course": 1}},
  {"model": "students.student", "pk": 2, "fields": {"roll_no": "S102", "name": "Ravi", "course": 2}}
]
"""

database = {"students.course": {}, "students.student": {}}


def loaddata(text):
    objects = json.loads(text)
    for obj in objects:
        table = database[obj["model"]]
        table[obj["pk"]] = obj["fields"]          # insert OR overwrite by primary key
    print(f"Installed {len(objects)} object(s) from 1 fixture(s)")


def dumpdata(model):
    rows = [{"model": model, "pk": pk, "fields": f} for pk, f in database[model].items()]
    return json.dumps(rows, indent=2)


loaddata(fixture_text)
loaddata(fixture_text)                            # run twice: no duplicates
print("courses:", len(database["students.course"]), "students:", len(database["students.student"]))
database["students.student"][1]["name"] = "Asha Verma"
print(dumpdata("students.student"))
`,
        },
      },
      result: `Installed 4 object(s) from 1 fixture(s)
Installed 4 object(s) from 1 fixture(s)
courses: 2 students: 2
[
  {
    "model": "students.student",
    "pk": 1,
    "fields": {
      "roll_no": "S101",
      "name": "Asha Verma",
      "course": 1
    }
  },
  {
    "model": "students.student",
    "pk": 2,
    "fields": {
      "roll_no": "S102",
      "name": "Ravi",
      "course": 2
    }
  }
]`,
      explanation: `The table is keyed by pk, so loading again overwrites instead of inserting duplicates - the same reason Django's loaddata is safe to repeat for reference data. The ForeignKey "course": 1 is just the related pk, exactly like real Django fixtures.`,
    },
  ],
  interview: [
    { q: `What is python manage.py shell and how is it different from python?`, a: `It starts an interactive Python console with DJANGO_SETTINGS_MODULE set and django.setup() called, so models and settings work. Plain python has no Django configuration and model imports fail.`, level: 'Easy' },
    { q: `What is a fixture in Django?`, a: `A file (JSON, XML, YAML, JSONL) containing serialized model instances that can be loaded into the database with loaddata and created with dumpdata.`, level: 'Easy' },
    { q: `Where does loaddata look for fixtures?`, a: `In the fixtures/ directory of every installed app, in directories listed in FIXTURE_DIRS, and in literal paths given on the command line.`, level: 'Medium' },
    { q: `What happens if you load a fixture twice?`, a: `Objects with the same primary key are updated (overwritten), so no duplicates are created; but objects with different pks that violate unique constraints cause IntegrityError.`, level: 'Medium' },
    { q: `How do you move data from SQLite to MySQL?`, a: `dumpdata (excluding contenttypes, auth.permission, sessions, admin.logentry) from SQLite, switch DATABASES to MySQL, run migrate, then loaddata the JSON file.`, level: 'Medium' },
    { q: `What does --natural-foreign do in dumpdata?`, a: `It serializes foreign keys using natural keys (e.g. app_label + model for ContentType, username for User) instead of numeric ids, making fixtures portable between databases with different ids.`, level: 'Hard' },
    { q: `How do you make a seed script idempotent?`, a: `Use get_or_create/update_or_create keyed on a unique field (e.g. roll_no), check existence before creating, or clear data in a transaction before seeding.`, level: 'Medium' },
    { q: `Fixtures vs data migrations for reference data - which and why?`, a: `Data migrations (RunPython) run automatically with migrate in every environment and are versioned with schema changes - good for required reference data. Fixtures are manual - good for optional sample/test data.`, level: 'Hard' },
    { q: `Does loaddata call the model's save() method and signals?`, a: `It saves through the serializer's raw save: custom save() logic is not called, and pre_save/post_save signals are sent with raw=True so handlers can skip them.`, level: 'Hard' },
    { q: `How do you run a Python script inside the Django environment?`, a: `python manage.py shell < script.py, python manage.py shell -c "...", a custom management command, or a standalone script that sets DJANGO_SETTINGS_MODULE and calls django.setup().`, level: 'Medium' },
  ],
  practice: [
    { task: `Export only the Subject table to students/fixtures/subjects.json with indentation.`, hint: `dumpdata app.model -o`, solution: `python manage.py dumpdata students.subject --indent 2 -o students/fixtures/subjects.json` },
    { task: `Using shell -c, print the number of students per gender in one command.`, hint: `values + annotate`, solution: `python manage.py shell -c "from django.db.models import Count; from students.models import Student; print(list(Student.objects.values('gender').annotate(n=Count('id'))))"` },
    { task: `Write a data migration that creates the course MCA if it does not exist.`, hint: `makemigrations students --empty -n add_mca; RunPython with apps.get_model.`, solution: `from django.db import migrations\n\ndef add_mca(apps, schema_editor):\n    Course = apps.get_model("students", "Course")\n    Course.objects.get_or_create(code="MCA", defaults={"name": "Master of Computer Applications", "duration_years": 2})\n\ndef remove_mca(apps, schema_editor):\n    apps.get_model("students", "Course").objects.filter(code="MCA").delete()\n\nclass Migration(migrations.Migration):\n    dependencies = [("students", "0001_initial")]\n    operations = [migrations.RunPython(add_mca, remove_mca)]` },
    { task: `Modify seed.py to use Faker for realistic Indian names.`, hint: `pip install faker; Faker("en_IN")`, solution: `from faker import Faker\nfake = Faker("en_IN")\nname = fake.name()\nemail = fake.unique.email()\nphone = fake.phone_number()` },
  ],
  quiz: [
    { question: `Which command exports data as a fixture?`, options: [`python manage.py loaddata`, `python manage.py export`, `python manage.py dumpdata`, `python manage.py backup`], answer: 2, explanation: `dumpdata serializes database rows.` },
    { question: `By default, fixtures are searched in:`, options: [`<app>/fixtures/`, `<project>/static/`, `<app>/migrations/`, `<app>/templates/`], answer: 0, explanation: `Each app's fixtures directory is searched automatically.` },
    { question: `Loading the same fixture twice will:`, options: [`Always duplicate rows`, `Delete the table`, `Raise an error every time`, `Overwrite rows with the same primary key`], answer: 3, explanation: `Rows are written by pk.` },
    { question: `Which method makes a seed script safe to run many times?`, options: [`create()`, `get_or_create()`, `bulk_create()`, `delete()`], answer: 1, explanation: `get_or_create inserts only when the row does not exist.` },
    { question: `When moving data between databases you should usually exclude:`, options: [`contenttypes and auth.permission`, `your own app models`, `auth.user`, `nothing`], answer: 0, explanation: `They are recreated by migrate and their ids may clash.` },
  ],
};
