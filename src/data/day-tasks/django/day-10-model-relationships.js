export default {
  lesson: 'day-10-model-relationships',
  minutes: 35,
  intro: 'Practise ForeignKey, OneToOneField, ManyToManyField, on_delete, related_name and queries across relations, with SQL JOINs and plain-Python relationship logic.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Many students belong to one course. Where does the `ForeignKey` go?',
      options: ['On Course: students = ForeignKey(Student)', 'On Student: course = ForeignKey(Course, on_delete=...)', 'On both models', 'A ManyToManyField on Course'],
      answer: 1,
      explain: 'The foreign key always lives on the **"many" side**: each Student row stores one `course_id`. Django then gives you the reverse access `course.student_set.all()` (or `course.students.all()` with `related_name=\'students\'`).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the field so deleting a course is **blocked** while students are still enrolled in it, and `course.students.all()` works:\n\n```\nclass Student(models.Model):\n    course = models.ForeignKey(Course, ______)\n```',
      accept: ["on_delete=models.PROTECT, related_name='students'", 'on_delete=models.PROTECT, related_name="students"', "related_name='students', on_delete=models.PROTECT", 'related_name="students", on_delete=models.PROTECT'],
      explain: '`PROTECT` raises `ProtectedError` if related students exist. Other options: `CASCADE` (delete the students too - dangerous here), `SET_NULL` (needs `null=True`), `RESTRICT`, `SET_DEFAULT`. `related_name` names the reverse manager.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'student.subjects.add(math, physics) creates rows in the hidden join table',
        'OneToOneField is like a ForeignKey with unique=True (e.g. Student ↔ StudentProfile)',
        "Student.objects.filter(course__name='BCA') queries across the relation with __",
        'A through= model lets you store extra data on a ManyToMany link (e.g. enrolled_on, grade)',
        'ManyToManyField needs on_delete',
      ],
      answers: [0, 1, 2, 3],
      explain: 'M2M uses a join table (`add`, `remove`, `set`, `clear`). OneToOne = unique FK, with reverse access `student.profile`. Double underscores follow relations in lookups. `on_delete` is required for ForeignKey and OneToOneField, not for ManyToManyField.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Write the SQL for\n```\nStudent.objects.filter(course__name=\'BCA\').values(\'name\', \'course__name\').order_by(\'name\')\n```\n(columns `name` and `course_name`).',
      example: { title: 'JOIN across a ForeignKey', code: "SELECT e.name, d.title AS dept\nFROM hr_employee e\nINNER JOIN hr_department d ON e.department_id = d.id\nWHERE d.title = 'Sales'\nORDER BY e.name;" },
      setup: `CREATE TABLE students_course (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT, course_id INTEGER REFERENCES students_course(id));
INSERT INTO students_course VALUES (1, 'BCA'), (2, 'BSc IT'), (3, 'MCA');
INSERT INTO students_student VALUES (1, 'Ravi', 1), (2, 'Asha', 1), (3, 'Meera', 2), (4, 'Dev', 1), (5, 'Zoya', 3);`,
      starter: 'SELECT name FROM students_student;',
      solution: "SELECT s.name, c.name AS course_name FROM students_student s JOIN students_course c ON s.course_id = c.id WHERE c.name = 'BCA' ORDER BY s.name;",
      ordered: true,
      explain: '`course__name` makes Django JOIN `students_course` on `course_id = id` and filter on its column. The FK column in the table is always `<field>_id`.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Students take many subjects (M2M join table `students_student_subjects`). Write the SQL for\n```\nSubject.objects.annotate(n=Count(\'students\')).filter(n__gte=2).order_by(\'-n\', \'title\')\n```\nreturning `title` and `n`.',
      example: { title: 'counting through a join table + HAVING', code: "SELECT t.name, COUNT(pt.post_id) AS n\nFROM blog_tag t\nJOIN blog_post_tags pt ON pt.tag_id = t.id\nGROUP BY t.id\nHAVING COUNT(pt.post_id) >= 3;" },
      setup: `CREATE TABLE students_subject (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE students_student_subjects (id INTEGER PRIMARY KEY, student_id INTEGER, subject_id INTEGER);
INSERT INTO students_subject VALUES (1, 'Maths'), (2, 'Physics'), (3, 'Python'), (4, 'English');
INSERT INTO students_student VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Meera');
INSERT INTO students_student_subjects (student_id, subject_id) VALUES (1, 1), (1, 3), (2, 3), (3, 3), (2, 1), (3, 2);`,
      starter: 'SELECT title FROM students_subject;',
      solution: 'SELECT sub.title, COUNT(ss.student_id) AS n FROM students_subject sub JOIN students_student_subjects ss ON ss.subject_id = sub.id GROUP BY sub.id HAVING COUNT(ss.student_id) >= 2 ORDER BY n DESC, sub.title;',
      ordered: true,
      explain: 'Django creates the join table `<app>_<model>_<field>` with two FKs. `annotate(Count(...))` → GROUP BY + COUNT, and a filter on the annotation becomes **HAVING** (WHERE cannot see aggregates).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Simulate `on_delete`. Write `delete_course(course_id, courses, students, rule)` where `courses` is a dict `{id: name}` and `students` a list of dicts with `course_id`:\n- `\'CASCADE\'`: delete the course and its students\n- `\'PROTECT\'`: if any student references it return `\'ProtectedError\'` and change nothing\n- `\'SET_NULL\'`: delete the course, set those students\' `course_id` to `None`\n\nOtherwise (no error) return `(sorted remaining course ids, [remaining student names in order])`. Work on copies: do not change the inputs when returning the error.',
      example: { title: 'filtering a list of dicts', code: "rows = [r for r in rows if r['dept'] != 3]" },
      starter: `def delete_course(course_id, courses, students, rule):
    # TODO
    return None
`,
      solution: `def delete_course(course_id, courses, students, rule):
    linked = [s for s in students if s['course_id'] == course_id]
    if rule == 'PROTECT' and linked:
        return 'ProtectedError'
    remaining_courses = sorted(c for c in courses if c != course_id)
    if rule == 'CASCADE':
        rest = [s for s in students if s['course_id'] != course_id]
    else:
        rest = [dict(s, course_id=None) if s['course_id'] == course_id else s for s in students]
    return (remaining_courses, [s['name'] for s in rest])
`,
      tests: [
        { call: "delete_course(1, {1: 'BCA', 2: 'MCA'}, [{'name': 'Asha', 'course_id': 1}, {'name': 'Ravi', 'course_id': 2}, {'name': 'Dev', 'course_id': 1}], 'CASCADE')", expect: [[2], ['Ravi']] },
        { call: "delete_course(1, {1: 'BCA', 2: 'MCA'}, [{'name': 'Asha', 'course_id': 1}], 'PROTECT')", expect: 'ProtectedError' },
        { call: "delete_course(3, {1: 'BCA', 3: 'Old'}, [{'name': 'Asha', 'course_id': 1}], 'PROTECT')", expect: [[1], ['Asha']] },
        { call: "delete_course(1, {1: 'BCA', 2: 'MCA'}, [{'name': 'Asha', 'course_id': 1}, {'name': 'Ravi', 'course_id': 2}], 'SET_NULL')", expect: [[2], ['Asha', 'Ravi']] },
      ],
      explain: 'Choose `on_delete` by business meaning: order items should CASCADE with their order, but students must not silently disappear when a course is removed - PROTECT (or SET_NULL with `null=True`) is safer. CASCADE on the wrong FK is a classic data-loss bug.',
    },
  ],
};
