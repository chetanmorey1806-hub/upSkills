export default {
  id: 'day-07-models-migrations-mysql',
  title: 'Models, Fields, Migrations (makemigrations, migrate), MySQL Configuration',
  module: 'Module 2: Models & Database',
  day: 7,
  level: 'Beginner',
  duration: '3 hours',
  summary: `Define the Student model for the Student Portal, learn the most important field types and options, create and apply migrations with makemigrations and migrate, and switch the project from SQLite to MySQL 8 using mysqlclient.`,
  objectives: [
    `Write a Django model class with the right field types and options`,
    `Explain null vs blank, default, unique, choices, auto_now and auto_now_add`,
    `Run makemigrations, migrate, showmigrations and sqlmigrate and understand migration files`,
    `Configure MySQL 8 with mysqlclient (and environment variables) instead of SQLite`,
    `Fix common migration and MySQL connection errors`,
  ],
  theory: [
    {
      heading: `What is a model?`,
      content: `A model is a Python class that subclasses django.db.models.Model. Each model maps to one database table; each class attribute (field) maps to one column; each object (instance) is one row. Django adds an auto-increment primary key "id" automatically (BigAutoField because of DEFAULT_AUTO_FIELD). The table name is <app_label>_<model_name in lowercase>, e.g. students_student.`,
      syntax: `from django.db import models

class Student(models.Model):          # table: students_student
    name = models.CharField(max_length=100)   # column: name varchar(100) NOT NULL
    marks = models.IntegerField(default=0)    # column: marks integer NOT NULL

    def __str__(self):                 # how the object is displayed (admin, shell)
        return self.name`,
      tip: `Analogy: the model is the blueprint of a register book - column headings are fields, each filled line is an object.`,
    },
    {
      heading: `Common field types`,
      content: `Pick the field type that matches the data. Django uses it for the column type, validation and the form widget.`,
      points: [
        `CharField(max_length=100) - short text (max_length is required). TextField() - long text (address, bio).`,
        `IntegerField, PositiveIntegerField, SmallIntegerField, BigIntegerField - whole numbers.`,
        `DecimalField(max_digits=8, decimal_places=2) - money (exact). FloatField - approximate decimals.`,
        `BooleanField(default=True) - True/False.`,
        `DateField, TimeField, DateTimeField - dates and times; DurationField for timedeltas.`,
        `EmailField, URLField, SlugField - CharFields with validation.`,
        `FileField(upload_to="docs/"), ImageField(upload_to="photos/") - store a file path (Pillow needed for ImageField).`,
        `UUIDField, JSONField, GenericIPAddressField.`,
        `Relationship fields ForeignKey, OneToOneField, ManyToManyField - Day 10.`,
      ],
    },
    {
      heading: `Field options and Meta`,
      content: `Options change behaviour of a field. The inner class Meta changes behaviour of the whole model.`,
      points: [
        `null=True - the DATABASE column can store NULL. blank=True - FORMS/validation allow empty value. For text fields prefer blank=True only (store ""), for dates/numbers use null=True, blank=True.`,
        `default=0 - value used when none is given (can be a callable like timezone.now).`,
        `unique=True - no duplicate values (creates a unique index).`,
        `choices=[("M", "Male"), ("F", "Female")] - restricts values; display with get_gender_display().`,
        `verbose_name="Roll Number", help_text="..." - labels in admin/forms.`,
        `db_index=True - add an index for faster filtering.`,
        `auto_now_add=True - set once on create; auto_now=True - updated on every save().`,
        `class Meta: ordering = ["roll_no"], db_table = "student", verbose_name_plural = "students", constraints/indexes.`,
      ],
    },
    {
      heading: `Migrations: makemigrations and migrate`,
      content: `Migrations are Django's version control for the database schema. makemigrations compares your models with the last migration files and WRITES a new Python migration file (no DB change yet). migrate READS migration files and APPLIES them to the database, recording each in the django_migrations table. Commit migration files to Git so every developer and server gets the same schema.`,
      syntax: `python manage.py makemigrations            # create migration files for changed models
python manage.py makemigrations students   # only for one app
python manage.py migrate                   # apply all pending migrations
python manage.py showmigrations            # [X] applied, [ ] pending
python manage.py sqlmigrate students 0001  # show the SQL a migration will run
python manage.py migrate students 0001     # roll back/forward to a specific migration`,
      tip: `Workflow to remember: change models.py -> makemigrations -> migrate. Adding a NOT NULL field to a table that already has rows? Django asks for a one-off default - give one, or add default=/null=True to the field.`,
    },
    {
      heading: `Configuring MySQL 8 with mysqlclient`,
      content: `SQLite is a single file - perfect for learning. Real projects use a server database like MySQL or PostgreSQL. Django's MySQL backend needs a driver; mysqlclient is the officially recommended one (C-based, fastest). PyMySQL is a pure-Python alternative.`,
      points: [
        `1. Install MySQL Server 8 and MySQL Workbench (dev.mysql.com/downloads) - note the root password.`,
        `2. Create the database with utf8mb4: CREATE DATABASE student_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
        `3. Create a user: CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'Portal@123'; GRANT ALL PRIVILEGES ON student_portal_db.* TO 'portal_user'@'localhost'; FLUSH PRIVILEGES;`,
        `4. pip install mysqlclient (Windows: wheel installs directly; Ubuntu: sudo apt install python3-dev default-libmysqlclient-dev build-essential pkg-config first; macOS: brew install mysql pkg-config).`,
        `5. Change DATABASES in settings.py (ENGINE django.db.backends.mysql).`,
        `6. python manage.py migrate - all tables are created in MySQL.`,
        `If mysqlclient will not install: pip install pymysql and add "import pymysql; pymysql.install_as_MySQLdb()" in student_portal/__init__.py.`,
      ],
      syntax: `DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "student_portal_db",
        "USER": "portal_user",
        "PASSWORD": "Portal@123",
        "HOST": "127.0.0.1",
        "PORT": "3306",
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}`,
    },
    {
      heading: `Common errors and fixes`,
      content: `These errors appear in almost every first MySQL setup.`,
      points: [
        `"Did you install mysqlclient?" - the driver is missing in the ACTIVE venv: pip install mysqlclient.`,
        `(1045, "Access denied for user") - wrong USER/PASSWORD or missing GRANT.`,
        `(1049, "Unknown database") - create the database first; Django does not create it.`,
        `(2003, "Can't connect to MySQL server on '127.0.0.1'") - MySQL service is not running or wrong PORT.`,
        `"No changes detected" - app not in INSTALLED_APPS, or models file not saved.`,
        `"no such table: students_student" - you ran makemigrations but forgot migrate.`,
        `Never delete migration files that are already applied on a shared/production database.`,
      ],
    },
  ],
  examples: [
    {
      title: `The Student model and its first migration (SQLite)`,
      scenario: `Create the real Student table for the Student Portal.`,
      steps: [
        `Open students/models.py in VS Code or PyCharm and paste the model.`,
        `Terminal: python manage.py makemigrations students.`,
        `Open students/migrations/0001_initial.py to see the generated file.`,
        `Terminal: python manage.py sqlmigrate students 0001 (optional - see SQL).`,
        `Terminal: python manage.py migrate.`,
        `PyCharm Professional: open the Database tool window > + > Data Source > SQLite > select db.sqlite3 to browse the table. VS Code: install the "SQLite Viewer" extension and click db.sqlite3.`,
      ],
      code: `# students/models.py
from django.db import models


class Student(models.Model):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    ]

    roll_no = models.CharField("Roll Number", max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default="M")
    date_of_birth = models.DateField(null=True, blank=True)
    course = models.CharField(max_length=50)          # becomes a ForeignKey on Day 10
    marks = models.PositiveIntegerField(default=0)
    fee_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["roll_no"]
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self):
        return f"{self.roll_no} - {self.name}"

    @property
    def result(self):
        return "Pass" if self.marks >= 40 else "Fail"

# Terminal
python manage.py makemigrations students
python manage.py migrate`,
      result: `Migrations for 'students':
  students/migrations/0001_initial.py
    + Create model Student

Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, students
Running migrations:
  Applying students.0001_initial... OK`,
      explanation: `makemigrations wrote 0001_initial.py describing a CreateModel operation; migrate executed it and created the table students_student with an automatic id column. roll_no and email get unique indexes; date_of_birth allows NULL; created_at is filled automatically.`,
    },
    {
      title: `Switch the Student Portal to MySQL 8 (mysqlclient + environment variables)`,
      scenario: `Move from SQLite to MySQL without hard-coding the password in settings.py.`,
      steps: [
        `Open MySQL Workbench (or mysql -u root -p in a terminal) and run the SQL below.`,
        `In the VS Code / PyCharm terminal (venv active): pip install mysqlclient python-dotenv.`,
        `Create a .env file next to manage.py and add it to .gitignore.`,
        `Update settings.py as below.`,
        `Run python manage.py migrate - Django creates all tables in MySQL.`,
        `Refresh the schema in Workbench and see students_student, auth_user, django_migrations, etc.`,
        `PyCharm Professional: Database tool window > + > Data Source > MySQL to browse the tables.`,
      ],
      code: `-- MySQL Workbench / mysql shell
CREATE DATABASE student_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'Portal@123';
GRANT ALL PRIVILEGES ON student_portal_db.* TO 'portal_user'@'localhost';
FLUSH PRIVILEGES;

# Terminal
pip install mysqlclient python-dotenv
pip freeze > requirements.txt

# .env  (never commit this file)
DB_ENGINE=mysql
DB_NAME=student_portal_db
DB_USER=portal_user
DB_PASSWORD=Portal@123
DB_HOST=127.0.0.1
DB_PORT=3306

# student_portal/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

if os.getenv("DB_ENGINE") == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": os.getenv("DB_HOST", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
else:  # beginners / quick start
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Terminal
python manage.py migrate
python manage.py createsuperuser   # new database = new admin user`,
      result: `Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, students
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
  Applying sessions.0001_initial... OK
  Applying students.0001_initial... OK

mysql> SHOW TABLES;  -> auth_group, auth_user, django_migrations, django_session, students_student, ...`,
      explanation: `The same models and migrations work on any database - only DATABASES changes. Setting DB_ENGINE=sqlite (or removing it) in .env switches back to SQLite. Data does not move automatically; use dumpdata/loaddata (Day 13) to copy data between databases.`,
    },
    {
      title: `Changing a model: add a field and create a second migration`,
      scenario: `The college now wants each student's phone number and section. Add the fields safely to an existing table.`,
      steps: [
        `Add the two fields to Student in students/models.py.`,
        `Run python manage.py makemigrations students.`,
        `Run python manage.py showmigrations students, then migrate.`,
      ],
      code: `# students/models.py (inside Student)
    phone = models.CharField(max_length=15, blank=True)          # empty string allowed
    section = models.CharField(max_length=1, default="A")        # existing rows get "A"

# Terminal
python manage.py makemigrations students
python manage.py showmigrations students
python manage.py migrate students

# students/migrations/0002_student_phone_student_section.py (generated)
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("students", "0001_initial")]
    operations = [
        migrations.AddField(
            model_name="student",
            name="phone",
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name="student",
            name="section",
            field=models.CharField(default="A", max_length=1),
        ),
    ]`,
      result: `Migrations for 'students':
  students/migrations/0002_student_phone_student_section.py
    + Add field phone to student
    + Add field section to student

students
 [X] 0001_initial
 [ ] 0002_student_phone_student_section

Running migrations:
  Applying students.0002_student_phone_student_section... OK`,
      explanation: `Each migration depends on the previous one, forming a chain. Because phone has blank=True (and CharField default ""), and section has default="A", Django can fill existing rows without asking questions.`,
    },
    {
      title: `Pure Python: the SQL behind a model (sqlite3)`,
      scenario: `Run the CREATE TABLE that Django generates for a simplified Student model, insert rows and see how null, default and unique behave - using only the standard library.`,
      steps: [
        `Create main.py in VS Code / PyCharm.`,
        `Run python main.py.`,
        `Compare the SQL with python manage.py sqlmigrate students 0001.`,
      ],
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
CREATE TABLE "students_student" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roll_no" varchar(20) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "date_of_birth" date NULL,
    "marks" integer unsigned NOT NULL DEFAULT 0 CHECK ("marks" >= 0)
)""")
conn.execute("INSERT INTO students_student (roll_no, name) VALUES ('S101', 'Asha')")
conn.execute("INSERT INTO students_student (roll_no, name, marks) VALUES ('S102', 'Ravi', 76)")
for row in conn.execute("SELECT * FROM students_student"):
    print(row)

for sql in ["INSERT INTO students_student (roll_no, name) VALUES ('S101', 'Copy')",
            "INSERT INTO students_student (roll_no, name, marks) VALUES ('S103', 'X', -5)",
            "INSERT INTO students_student (roll_no) VALUES ('S104')"]:
    try:
        conn.execute(sql)
    except sqlite3.IntegrityError as e:
        print("IntegrityError:", e)`,
      python: {
        files: {
          'main.py': `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
CREATE TABLE "students_student" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roll_no" varchar(20) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "date_of_birth" date NULL,
    "marks" integer unsigned NOT NULL DEFAULT 0 CHECK ("marks" >= 0)
)""")
conn.execute("INSERT INTO students_student (roll_no, name) VALUES ('S101', 'Asha')")
conn.execute("INSERT INTO students_student (roll_no, name, marks) VALUES ('S102', 'Ravi', 76)")
for row in conn.execute("SELECT * FROM students_student"):
    print(row)

for sql in ["INSERT INTO students_student (roll_no, name) VALUES ('S101', 'Copy')",
            "INSERT INTO students_student (roll_no, name, marks) VALUES ('S103', 'X', -5)",
            "INSERT INTO students_student (roll_no) VALUES ('S104')"]:
    try:
        conn.execute(sql)
    except sqlite3.IntegrityError as e:
        print("IntegrityError:", e)
`,
        },
      },
      result: `(1, 'S101', 'Asha', None, 0)
(2, 'S102', 'Ravi', None, 76)
IntegrityError: UNIQUE constraint failed: students_student.roll_no
IntegrityError: CHECK constraint failed: marks
IntegrityError: NOT NULL constraint failed: students_student.name`,
      explanation: `unique=True becomes UNIQUE, PositiveIntegerField becomes a CHECK (marks >= 0), null=True becomes NULL, and fields without null=True are NOT NULL. Note: Django applies "default" in Python when creating objects; here we put DEFAULT in SQL just to simulate it. In Django you would see these same errors as django.db.IntegrityError.`,
    },
  ],
  interview: [
    { q: `What is a Django model?`, a: `A Python class inheriting from models.Model that defines the structure of a database table. Each attribute is a field (column) and each instance is a row. The ORM uses it to generate SQL.`, level: 'Easy' },
    { q: `Difference between null=True and blank=True?`, a: `null=True is database-level: the column may store NULL. blank=True is validation-level: forms/admin allow an empty value. For CharField/TextField use blank=True and avoid null=True so there is only one "empty" value ("").`, level: 'Medium' },
    { q: `Difference between makemigrations and migrate?`, a: `makemigrations detects model changes and writes migration files. migrate applies unapplied migration files to the database and records them in django_migrations.`, level: 'Easy' },
    { q: `auto_now vs auto_now_add?`, a: `auto_now_add sets the field once when the object is created (created_at). auto_now updates it every time save() is called (updated_at). Both make the field non-editable in forms.`, level: 'Easy' },
    { q: `Why use DecimalField instead of FloatField for fees?`, a: `DecimalField stores exact decimal values (Python Decimal), avoiding floating point rounding errors like 0.1 + 0.2 = 0.30000000000000004 - essential for money.`, level: 'Medium' },
    { q: `How do you connect Django to MySQL?`, a: `Install MySQL and create a database, pip install mysqlclient, set DATABASES ENGINE to django.db.backends.mysql with NAME, USER, PASSWORD, HOST, PORT (and charset utf8mb4), then run migrate.`, level: 'Easy' },
    { q: `What is the django_migrations table?`, a: `A table Django uses to record which migrations (app + name) have been applied, so migrate knows what is pending.`, level: 'Medium' },
    { q: `What does sqlmigrate do?`, a: `It prints the SQL statements a given migration would execute for the current database backend, without running them.`, level: 'Medium' },
    { q: `What is the default table name for model Student in app students, and how do you change it?`, a: `students_student. Change it with class Meta: db_table = "student".`, level: 'Easy' },
    { q: `How do you add a non-nullable field to a table with existing rows?`, a: `Provide default=..., or make it null=True, or answer the makemigrations prompt with a one-off default. For complex cases, add as nullable, populate with a data migration (RunPython), then make it non-nullable.`, level: 'Hard' },
    { q: `mysqlclient vs PyMySQL?`, a: `mysqlclient is a C extension, faster and officially recommended by Django. PyMySQL is pure Python (easy install, slower) and needs pymysql.install_as_MySQLdb() to work with Django's MySQL backend.`, level: 'Hard' },
    { q: `What does get_FOO_display() do?`, a: `For a field with choices, get_<field>_display() returns the human-readable label, e.g. student.get_gender_display() returns "Female" for "F".`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a Teacher model in a new app staff with name, email (unique), subject, salary (Decimal), joined_on (date) and is_hod (bool, default False). Migrate it.`, hint: `startapp staff, add to INSTALLED_APPS, makemigrations, migrate.`, solution: `from django.db import models\n\nclass Teacher(models.Model):\n    name = models.CharField(max_length=100)\n    email = models.EmailField(unique=True)\n    subject = models.CharField(max_length=50)\n    salary = models.DecimalField(max_digits=10, decimal_places=2)\n    joined_on = models.DateField()\n    is_hod = models.BooleanField(default=False)\n\n    def __str__(self):\n        return self.name\n\n# python manage.py makemigrations staff && python manage.py migrate` },
    { task: `Add a choices field category to Student with values GEN, OBC, SC, ST (default GEN).`, hint: `list of tuples + max_length=3.`, solution: `CATEGORY_CHOICES = [("GEN", "General"), ("OBC", "OBC"), ("SC", "SC"), ("ST", "ST")]\ncategory = models.CharField(max_length=3, choices=CATEGORY_CHOICES, default="GEN")` },
    { task: `Show the SQL for your second migration and roll the database back to 0001.`, hint: `sqlmigrate, then migrate app 0001.`, solution: `python manage.py sqlmigrate students 0002\npython manage.py migrate students 0001   # unapplies 0002\npython manage.py migrate                 # re-apply` },
    { task: `Configure the project to use PyMySQL instead of mysqlclient.`, hint: `install_as_MySQLdb in the project package __init__.py.`, solution: `pip install pymysql\n# student_portal/__init__.py\nimport pymysql\npymysql.install_as_MySQLdb()\n# DATABASES stays ENGINE "django.db.backends.mysql"` },
  ],
  quiz: [
    { question: `Which command creates migration files?`, options: [`python manage.py migrate`, `python manage.py makemigrations`, `python manage.py syncdb`, `python manage.py sqlmigrate`], answer: 1, explanation: `makemigrations writes the files; migrate applies them.` },
    { question: `Which option allows NULL in the database column?`, options: [`blank=True`, `default=None`, `null=True`, `empty=True`], answer: 2, explanation: `null controls the database; blank controls validation.` },
    { question: `Which field is best for storing fees like 45000.50?`, options: [`DecimalField`, `FloatField`, `CharField`, `IntegerField`], answer: 0, explanation: `DecimalField stores exact decimal values.` },
    { question: `ENGINE value for MySQL in DATABASES?`, options: [`mysql.connector`, `django.db.mysql`, `django.mysql.backend`, `django.db.backends.mysql`], answer: 3, explanation: `The built-in backend is django.db.backends.mysql.` },
    { question: `A field with auto_now=True is updated:`, options: [`Only when created`, `Never`, `On every save()`, `Only by migrations`], answer: 2, explanation: `auto_now updates the timestamp every time the object is saved.` },
  ],
};
