export default {
  id: 'day-10-model-relationships',
  title: 'Relationships: ForeignKey, OneToOne, ManyToMany, related_name',
  module: 'Module 2: Models & Database',
  day: 10,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Model real-world connections in the Student Portal: many students belong to one Course (ForeignKey), each student has one Profile (OneToOneField), and students take many Subjects (ManyToManyField). Learn on_delete options, related_name, forward and reverse access, querying across relations, and the through model.`,
  objectives: [
    `Choose the right relationship type: one-to-many, one-to-one, many-to-many`,
    `Define ForeignKey, OneToOneField and ManyToManyField with on_delete and related_name`,
    `Access related objects forwards (student.course) and backwards (course.students.all())`,
    `Add, remove, set and clear ManyToMany links and query across relations with __`,
    `Use a custom through model to store extra data on a many-to-many link`,
  ],
  theory: [
    {
      heading: `Three kinds of relationships`,
      content: `Real data is connected. In a college: one course has many students; one student has exactly one profile; one student studies many subjects and one subject has many students. Django provides one field for each case and creates the right columns, foreign keys and join tables automatically.`,
      points: [
        `One-to-Many -> ForeignKey on the "many" side: Student.course = ForeignKey(Course). Column course_id in the student table.`,
        `One-to-One -> OneToOneField: StudentProfile.student = OneToOneField(Student). A ForeignKey with UNIQUE.`,
        `Many-to-Many -> ManyToManyField on either side: Student.subjects = ManyToManyField(Subject). Django creates a hidden junction table students_student_subjects.`,
        `Analogy: ForeignKey = a student's ID card shows ONE department; OneToOne = one Aadhaar per person; ManyToMany = students and clubs - anyone can join many clubs.`,
      ],
    },
    {
      heading: `ForeignKey and on_delete`,
      content: `on_delete is required and decides what happens to students when their course is deleted.`,
      syntax: `class Student(models.Model):
    course = models.ForeignKey("Course", on_delete=models.PROTECT, related_name="students")`,
      points: [
        `CASCADE - delete the students too (use for "owned" data: profile, marks of a student).`,
        `PROTECT - refuse to delete the course while students exist (raises ProtectedError). Safe for master data.`,
        `SET_NULL - set course to NULL (needs null=True).`,
        `SET_DEFAULT - set to the field default (needs default=).`,
        `RESTRICT - like PROTECT but allows deletion if the related objects are also being deleted in the same CASCADE.`,
        `DO_NOTHING - do nothing in Django (database may raise an error).`,
      ],
      tip: `Use a string "Course" to refer to a model defined later in the same file, or "courses.Course" for another app.`,
    },
    {
      heading: `related_name and reverse access`,
      content: `Every relation works in both directions. Forward: student.course returns a Course object. Reverse: course.student_set.all() returns that course's students - "student_set" is the default name. related_name lets you choose a readable name: course.students.all(). For OneToOne the reverse is a single object: student.profile.`,
      syntax: `asha.course              # forward  -> <Course: BCA>
asha.course_id           # just the id, no extra query
bca.students.all()       # reverse (related_name="students")
bca.students.count()
asha.profile             # reverse one-to-one (related_name="profile")
asha.subjects.all()      # many-to-many forward
python.students.all()    # many-to-many reverse`,
    },
    {
      heading: `Working with ManyToMany`,
      content: `ManyToMany links are rows in the junction table, managed through the related manager.`,
      syntax: `asha.subjects.add(py, dj)        # INSERT links (no save() needed)
asha.subjects.remove(dj)         # delete one link
asha.subjects.set([py, sql])     # replace all links
asha.subjects.clear()            # remove all links
py.students.add(ravi)            # also works from the other side
asha.subjects.create(name="Java")   # create subject + link`,
      points: [
        `The student must be saved (have an id) before adding M2M links.`,
        `blank=True on ManyToManyField makes it optional in forms/admin (null has no effect on M2M).`,
        `Need extra data like enrolled_on or grade? Use through="Enrollment" (custom junction model).`,
      ],
    },
    {
      heading: `Querying across relationships`,
      content: `Use double underscores to follow relationships inside filter(), exclude(), values(), order_by() and annotate(). Django writes the JOINs.`,
      syntax: `Student.objects.filter(course__code="BCA")                 # forward FK
Student.objects.filter(subjects__name="Python")            # M2M
Course.objects.filter(students__marks__gte=80).distinct()  # reverse FK (use distinct)
StudentProfile.objects.filter(student__roll_no="S101")
Course.objects.annotate(n=Count("students"), avg=Avg("students__marks"))
Student.objects.order_by("course__name", "name")`,
      tip: `Reverse/M2M filters can return duplicates when several related rows match - add .distinct().`,
    },
    {
      heading: `Changing course from CharField to ForeignKey safely`,
      content: `On Day 7 course was a CharField holding "BCA". You cannot automatically convert text to a foreign key id. In a learning project the simplest way is to reset the database: delete db.sqlite3 (or DROP and CREATE the MySQL database) and the files 0001_*.py, 0002_*.py in students/migrations (keep __init__.py), then run makemigrations and migrate again. In a real project with data: add a new nullable FK field, write a data migration (RunPython) to fill it from the old text, then remove the old field.`,
    },
  ],
  examples: [
    {
      title: `Course, Subject, Student and StudentProfile models`,
      scenario: `Upgrade the Student Portal models to use proper relationships.`,
      steps: [
        `Open students/models.py and replace it with the code below.`,
        `Development reset: delete db.sqlite3 and students/migrations/0001_*.py, 0002_*.py (keep __init__.py). MySQL users: DROP DATABASE student_portal_db; CREATE DATABASE student_portal_db CHARACTER SET utf8mb4;`,
        `Run python manage.py makemigrations students and python manage.py migrate.`,
        `Run python manage.py createsuperuser again (the old DB is gone).`,
        `PyCharm: open the Database tool window to see the new tables students_course, students_subject, students_student_subjects, students_studentprofile.`,
      ],
      code: `# students/models.py
from django.db import models


class Course(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    duration_years = models.PositiveSmallIntegerField(default=3)

    def __str__(self):
        return self.code


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    credits = models.PositiveSmallIntegerField(default=4)

    def __str__(self):
        return self.name


class Student(models.Model):
    GENDER_CHOICES = [("M", "Male"), ("F", "Female"), ("O", "Other")]

    roll_no = models.CharField("Roll Number", max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default="M")
    date_of_birth = models.DateField(null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="students")
    subjects = models.ManyToManyField(Subject, related_name="students", blank=True)
    marks = models.PositiveIntegerField(default=0)
    fee_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["roll_no"]

    def __str__(self):
        return f"{self.roll_no} - {self.name}"

    @property
    def result(self):
        return "Pass" if self.marks >= 40 else "Fail"


class StudentProfile(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name="profile")
    father_name = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    blood_group = models.CharField(max_length=3, blank=True)

    def __str__(self):
        return f"Profile of {self.student.name}"

# Terminal
python manage.py makemigrations students
python manage.py migrate`,
      result: `Migrations for 'students':
  students/migrations/0001_initial.py
    + Create model Course
    + Create model Subject
    + Create model Student
    + Create model StudentProfile
...
  Applying students.0001_initial... OK`,
      explanation: `Course and Subject are created first because Student depends on them. The ForeignKey becomes a course_id column with a database foreign key; the ManyToManyField creates the junction table students_student_subjects; the OneToOneField becomes a unique student_id column in students_studentprofile.`,
    },
    {
      title: `Using relationships in the Django shell`,
      scenario: `Create courses, subjects, students and a profile, then navigate and query in both directions.`,
      steps: [
        `Run python manage.py shell in the VS Code / PyCharm terminal.`,
        `Paste the code block by block.`,
        `Compare with the result.`,
      ],
      code: `>>> from students.models import Course, Subject, Student, StudentProfile
>>> from django.db.models import Count, Avg, ProtectedError
>>> bca = Course.objects.create(code="BCA", name="Bachelor of Computer Applications")
>>> bsc = Course.objects.create(code="BSC", name="B.Sc Computer Science")
>>> bcom = Course.objects.create(code="BCOM", name="Bachelor of Commerce")
>>> py, dj, sq, ac = [Subject.objects.create(name=n) for n in ["Python", "Django", "SQL", "Accounts"]]
>>> asha = Student.objects.create(roll_no="S101", name="Asha Verma", email="asha@college.in", gender="F", course=bca, marks=92)
>>> ravi = Student.objects.create(roll_no="S102", name="Ravi Kumar", email="ravi@college.in", course=bsc, marks=76)
>>> meena = Student.objects.create(roll_no="S103", name="Meena Iyer", email="meena@college.in", gender="F", course=bca, marks=35)
>>> kiran = Student.objects.create(roll_no="S104", name="Kiran Rao", email="kiran@college.in", course=bcom, marks=81)

>>> print(asha.course, "|", asha.course.name, "|", asha.course_id)
>>> bca.students.all()
>>> asha.subjects.add(py, dj, sq); ravi.subjects.add(py, sq); kiran.subjects.add(ac)
>>> asha.subjects.all()
>>> py.students.all()
>>> StudentProfile.objects.create(student=asha, father_name="Mohan Verma", blood_group="B+")
>>> print(asha.profile.father_name, asha.profile.blood_group)
>>> ravi.profile
>>> hasattr(ravi, "profile")

>>> list(Student.objects.filter(subjects__name="Python").values_list("name", flat=True))
>>> list(Course.objects.filter(students__marks__gte=80).distinct().values_list("code", flat=True))
>>> for c in Course.objects.annotate(n=Count("students"), avg=Avg("students__marks")).order_by("code"):
...     print(c.code, c.n, c.avg)
>>> bca.delete()
>>> asha.subjects.remove(dj); asha.subjects.all()
>>> asha.delete()`,
      result: `BCA | Bachelor of Computer Applications | 1
<QuerySet [<Student: S101 - Asha Verma>, <Student: S103 - Meena Iyer>]>
<QuerySet [<Subject: Python>, <Subject: Django>, <Subject: SQL>]>
<QuerySet [<Student: S101 - Asha Verma>, <Student: S102 - Ravi Kumar>]>
Mohan Verma B+
students.models.Student.profile.RelatedObjectDoesNotExist: Student has no profile.
False
['Asha Verma', 'Ravi Kumar']
['BCA', 'BCOM']
BCA 2 63.5
BCOM 1 81.0
BSC 1 76.0
django.db.models.deletion.ProtectedError: ("Cannot delete some instances of model 'Course' because they are referenced through protected foreign keys: 'Student.course'.", ...)
<QuerySet [<Subject: Python>, <Subject: SQL>]>
(4, {'students.Student_subjects': 2, 'students.StudentProfile': 1, 'students.Student': 1})`,
      explanation: `asha.course_id needs no extra query; asha.course loads the Course. Reverse managers (bca.students, py.students) come from related_name. Accessing a missing one-to-one raises RelatedObjectDoesNotExist - check with hasattr(). PROTECT stopped the course deletion. Deleting Asha cascaded to her profile and her two remaining M2M link rows.`,
    },
    {
      title: `Custom through model: Enrollment with grade and date`,
      scenario: `The college wants to store the semester grade and enrollment date for each student-subject pair. A plain ManyToManyField cannot hold extra columns - use a through model.`,
      steps: [
        `Add the Enrollment model and change subjects to use through="Enrollment".`,
        `Run makemigrations and migrate (reset dev DB if Django asks about altering the M2M).`,
        `Create enrollments in the shell.`,
      ],
      code: `# students/models.py
class Enrollment(models.Model):
    student = models.ForeignKey("Student", on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    enrolled_on = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=2, blank=True)

    class Meta:
        unique_together = [("student", "subject")]

    def __str__(self):
        return f"{self.student.name} - {self.subject.name} ({self.grade or '-'})"

class Student(models.Model):
    ...
    subjects = models.ManyToManyField(Subject, through="Enrollment",
                                      related_name="students", blank=True)

# Shell
>>> Enrollment.objects.create(student=ravi, subject=py, grade="A")
>>> ravi.subjects.add(sq, through_defaults={"grade": "B"})
>>> for e in Enrollment.objects.filter(student=ravi).select_related("subject"):
...     print(e)
>>> Student.objects.filter(enrollment__grade="A").values_list("name", flat=True)`,
      result: `Ravi Kumar - Python (A)
Ravi Kumar - SQL (B)
<QuerySet ['Ravi Kumar']>`,
      explanation: `The through model is a normal model with two ForeignKeys plus your extra fields. add() still works but needs through_defaults for required extra fields. unique_together prevents enrolling the same student in the same subject twice.`,
    },
    {
      title: `Pure Python: the tables behind the three relationships (sqlite3)`,
      scenario: `See exactly which tables and columns Django creates for ForeignKey, OneToOne and ManyToMany, and the JOINs behind the related managers.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Match each printed line to its Django equivalent on the left.`,
      ],
      code: `import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE course (id INTEGER PRIMARY KEY, code TEXT UNIQUE);
CREATE TABLE subject (id INTEGER PRIMARY KEY, name TEXT UNIQUE);
CREATE TABLE student (
    id INTEGER PRIMARY KEY,
    name TEXT,
    course_id INTEGER NOT NULL REFERENCES course(id)        -- ForeignKey
);
CREATE TABLE profile (
    id INTEGER PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES student(id),      -- OneToOneField = FK + UNIQUE
    blood_group TEXT
);
CREATE TABLE student_subjects (                             -- ManyToManyField junction table
    id INTEGER PRIMARY KEY,
    student_id INTEGER REFERENCES student(id),
    subject_id INTEGER REFERENCES subject(id),
    UNIQUE (student_id, subject_id)
);
INSERT INTO course VALUES (1, 'BCA'), (2, 'BSC');
INSERT INTO subject VALUES (1, 'Python'), (2, 'Django'), (3, 'SQL');
INSERT INTO student VALUES (1, 'Asha', 1), (2, 'Ravi', 2), (3, 'Meena', 1);
INSERT INTO profile VALUES (1, 1, 'B+');
INSERT INTO student_subjects (student_id, subject_id) VALUES (1, 1), (1, 2), (1, 3), (2, 1), (2, 3);
""")

print("asha.course ->", db.execute(
    "SELECT c.code FROM student s JOIN course c ON c.id = s.course_id WHERE s.name = 'Asha'").fetchone()[0])
print("bca.students.all() ->", [r[0] for r in db.execute(
    "SELECT name FROM student WHERE course_id = 1 ORDER BY id")])
print("asha.subjects.all() ->", [r[0] for r in db.execute(
    "SELECT sub.name FROM subject sub JOIN student_subjects ss ON ss.subject_id = sub.id "
    "WHERE ss.student_id = 1 ORDER BY sub.id")])
print("python.students.all() ->", [r[0] for r in db.execute(
    "SELECT s.name FROM student s JOIN student_subjects ss ON ss.student_id = s.id "
    "WHERE ss.subject_id = 1 ORDER BY s.id")])
print("asha.profile.blood_group ->", db.execute(
    "SELECT blood_group FROM profile WHERE student_id = 1").fetchone()[0])
try:
    db.execute("INSERT INTO profile (student_id, blood_group) VALUES (1, 'O+')")
except sqlite3.IntegrityError as e:
    print("Second profile for Asha ->", e)`,
      python: {
        files: {
          'main.py': `import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE course (id INTEGER PRIMARY KEY, code TEXT UNIQUE);
CREATE TABLE subject (id INTEGER PRIMARY KEY, name TEXT UNIQUE);
CREATE TABLE student (
    id INTEGER PRIMARY KEY,
    name TEXT,
    course_id INTEGER NOT NULL REFERENCES course(id)        -- ForeignKey
);
CREATE TABLE profile (
    id INTEGER PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES student(id),      -- OneToOneField = FK + UNIQUE
    blood_group TEXT
);
CREATE TABLE student_subjects (                             -- ManyToManyField junction table
    id INTEGER PRIMARY KEY,
    student_id INTEGER REFERENCES student(id),
    subject_id INTEGER REFERENCES subject(id),
    UNIQUE (student_id, subject_id)
);
INSERT INTO course VALUES (1, 'BCA'), (2, 'BSC');
INSERT INTO subject VALUES (1, 'Python'), (2, 'Django'), (3, 'SQL');
INSERT INTO student VALUES (1, 'Asha', 1), (2, 'Ravi', 2), (3, 'Meena', 1);
INSERT INTO profile VALUES (1, 1, 'B+');
INSERT INTO student_subjects (student_id, subject_id) VALUES (1, 1), (1, 2), (1, 3), (2, 1), (2, 3);
""")

print("asha.course ->", db.execute(
    "SELECT c.code FROM student s JOIN course c ON c.id = s.course_id WHERE s.name = 'Asha'").fetchone()[0])
print("bca.students.all() ->", [r[0] for r in db.execute(
    "SELECT name FROM student WHERE course_id = 1 ORDER BY id")])
print("asha.subjects.all() ->", [r[0] for r in db.execute(
    "SELECT sub.name FROM subject sub JOIN student_subjects ss ON ss.subject_id = sub.id "
    "WHERE ss.student_id = 1 ORDER BY sub.id")])
print("python.students.all() ->", [r[0] for r in db.execute(
    "SELECT s.name FROM student s JOIN student_subjects ss ON ss.student_id = s.id "
    "WHERE ss.subject_id = 1 ORDER BY s.id")])
print("asha.profile.blood_group ->", db.execute(
    "SELECT blood_group FROM profile WHERE student_id = 1").fetchone()[0])
try:
    db.execute("INSERT INTO profile (student_id, blood_group) VALUES (1, 'O+')")
except sqlite3.IntegrityError as e:
    print("Second profile for Asha ->", e)
`,
        },
      },
      result: `asha.course -> BCA
bca.students.all() -> ['Asha', 'Meena']
asha.subjects.all() -> ['Python', 'Django', 'SQL']
python.students.all() -> ['Asha', 'Ravi']
asha.profile.blood_group -> B+
Second profile for Asha -> UNIQUE constraint failed: profile.student_id`,
      explanation: `ForeignKey = a course_id column. OneToOne = a UNIQUE student_id column, so a second profile is rejected. ManyToMany = a separate junction table with pairs of ids; both directions are JOINs through it. Django's related managers generate these exact JOINs for you.`,
    },
  ],
  interview: [
    { q: `Explain ForeignKey, OneToOneField and ManyToManyField with examples.`, a: `ForeignKey: many-to-one, e.g. many students in one course (course_id column). OneToOneField: one-to-one, e.g. a student and their profile (unique FK). ManyToManyField: many-to-many, e.g. students and subjects (junction table).`, level: 'Easy' },
    { q: `What is on_delete and list its options?`, a: `It defines what happens to rows referencing a deleted object: CASCADE, PROTECT, RESTRICT, SET_NULL (needs null=True), SET_DEFAULT, SET(value/callable), DO_NOTHING.`, level: 'Medium' },
    { q: `What is related_name?`, a: `The name of the reverse relation from the related model, e.g. related_name="students" lets you write course.students.all() instead of course.student_set.all(). It is also used in reverse lookups: Course.objects.filter(students__marks__gte=80).`, level: 'Easy' },
    { q: `What is the default reverse accessor without related_name?`, a: `<lowercase model name>_set for ForeignKey/M2M (course.student_set), and the lowercase model name for OneToOne (student.studentprofile).`, level: 'Medium' },
    { q: `How does Django implement ManyToManyField in the database?`, a: `With an intermediate (junction) table containing two foreign keys (e.g. student_id, subject_id) and a unique constraint on the pair; you can replace it with your own model via through=.`, level: 'Medium' },
    { q: `When would you use a through model?`, a: `When the relationship itself has data: enrollment date, grade, role in a project, quantity in an order.`, level: 'Medium' },
    { q: `CASCADE vs PROTECT - which would you use for Student.course?`, a: `PROTECT, because deleting a course should not silently delete all its students. CASCADE suits owned data like a profile or marks belonging to a student.`, level: 'Medium' },
    { q: `What is the difference between student.course and student.course_id?`, a: `course_id is the raw integer stored in the row (no query). course returns the related Course object, which triggers a query if not already cached/select_related.`, level: 'Medium' },
    { q: `What does asha.subjects.set([py, sql]) do?`, a: `Replaces the set of linked subjects: removes links not in the list and adds missing ones, leaving exactly Python and SQL.`, level: 'Easy' },
    { q: `Why use distinct() when filtering on reverse relations?`, a: `Joins to a "many" side can duplicate the parent row once per matching child; distinct() removes duplicates.`, level: 'Hard' },
    { q: `What error do you get when accessing a missing OneToOne reverse relation, and how do you check safely?`, a: `RelatedObjectDoesNotExist (a subclass of DoesNotExist and AttributeError). Check with hasattr(student, "profile") or use try/except.`, level: 'Hard' },
  ],
  practice: [
    { task: `Create a Teacher model with a ForeignKey to Course (related_name="teachers") and list all teachers of BCA.`, hint: `bca.teachers.all()`, solution: `class Teacher(models.Model):\n    name = models.CharField(max_length=100)\n    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name="teachers")\n\n# shell\nCourse.objects.get(code="BCA").teachers.all()` },
    { task: `List the names of students who take SQL and scored more than 70.`, hint: `subjects__name and marks__gt in one filter.`, solution: `Student.objects.filter(subjects__name="SQL", marks__gt=70).values_list("name", flat=True)` },
    { task: `Show each subject with the number of students taking it, most popular first.`, hint: `Subject.objects.annotate(Count("students"))`, solution: `from django.db.models import Count\nfor s in Subject.objects.annotate(n=Count("students")).order_by("-n"):\n    print(s.name, s.n)` },
    { task: `Create a profile for every student who does not have one.`, hint: `filter(profile__isnull=True)`, solution: `for st in Student.objects.filter(profile__isnull=True):\n    StudentProfile.objects.create(student=st)` },
  ],
  quiz: [
    { question: `Many students belong to one course. Which field do you use?`, options: [`ForeignKey on Student`, `ManyToManyField on Course`, `OneToOneField on Student`, `ForeignKey on Course`], answer: 0, explanation: `The ForeignKey goes on the "many" side.` },
    { question: `Which on_delete option prevents deleting a course that has students?`, options: [`CASCADE`, `SET_NULL`, `DO_NOTHING`, `PROTECT`], answer: 3, explanation: `PROTECT raises ProtectedError.` },
    { question: `With related_name="students", how do you get a course's students?`, options: [`course.student_set.all()`, `course.students.all()`, `Student.course.all()`, `course.get_students()`], answer: 1, explanation: `related_name replaces the default student_set.` },
    { question: `A ManyToManyField creates:`, options: [`A column in both tables`, `A JSON column`, `A separate junction table`, `Nothing in the database`], answer: 2, explanation: `Django creates an intermediate table with two foreign keys.` },
    { question: `SET_NULL requires the field to have:`, options: [`null=True`, `unique=True`, `default=0`, `blank=False`], answer: 0, explanation: `The column must accept NULL.` },
  ],
};
