export default {
  id: 'day-22-permissions-groups',
  title: 'Permissions, Groups, Authorization',
  module: 'Module 4: Authentication & Security',
  day: 22,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Control who can do what in the Student Portal using Django\'s model permissions, custom permissions, groups (Teachers, Office Staff), PermissionRequiredMixin, UserPassesTestMixin and object-level checks.',
  objectives: [
    'Understand default add/change/delete/view permissions and their codenames',
    'Create custom permissions in Meta and assign them to groups and users',
    'Protect views with @permission_required, PermissionRequiredMixin and UserPassesTestMixin',
    'Check permissions in templates with the perms variable',
    'Implement object-level rules (owner-only editing) with get_queryset()',
  ],
  theory: [
    {
      heading: 'Built-in model permissions',
      content: 'For every model, after migrate Django creates four permissions: add_<model>, change_<model>, delete_<model> and view_<model>. The full name used in code is "<app_label>.<codename>", for example "students.change_student". Superusers (is_superuser=True) automatically have ALL permissions. Inactive users have none.',
      points: [
        'user.has_perm("students.add_student") -> True/False',
        'user.has_perms(["students.add_student", "students.view_student"])',
        'user.get_all_permissions() -> set of strings',
        'Permissions are cached on the user object per request; re-fetch the user after changing them',
      ],
    },
    {
      heading: 'Groups: roles made easy',
      content: 'A Group is a named bag of permissions, like a job role. Instead of giving 12 permissions to every teacher one by one, create a "Teachers" group with those permissions and add teachers to the group. Change the group once and all members are updated. It is like giving a staff ID card that opens the same set of doors for everyone in that role.',
      syntax: `from django.contrib.auth.models import Group, Permission

teachers, _ = Group.objects.get_or_create(name="Teachers")
perm = Permission.objects.get(codename="change_student", content_type__app_label="students")
teachers.permissions.add(perm)
user.groups.add(teachers)`,
    },
    {
      heading: 'Custom permissions',
      content: 'Some actions are not simple add/change/delete, for example "publish results" or "export marks". Declare them in the model Meta.permissions; migrate creates them.',
      syntax: `class Result(models.Model):
    ...
    class Meta:
        permissions = [
            ("publish_result", "Can publish results"),
            ("export_result", "Can export results to CSV"),
        ]`,
    },
    {
      heading: 'Protecting views',
      content: 'Function views use @permission_required("app.codename", raise_exception=True). Class views use PermissionRequiredMixin with permission_required. For custom logic (role field, owner check) use @user_passes_test or UserPassesTestMixin with test_func(). With raise_exception=True a logged-in user without permission gets 403 Forbidden instead of being redirected to login.',
      syntax: `class StudentDeleteView(PermissionRequiredMixin, DeleteView):
    permission_required = "students.delete_student"
    raise_exception = True`,
      tip: 'Authentication first, authorization second: an anonymous user should go to login, a logged-in user without permission should see 403.',
    },
    {
      heading: 'Templates and object-level permissions',
      content: 'In templates the perms variable lets you hide buttons: {% if perms.students.change_student %}. Hiding a button is only UX; the view must still check. Django\'s built-in permissions are model-level (all students or none). For "a teacher can edit only students of their own course" filter the queryset by the user or use a package like django-guardian for per-object permissions.',
      points: [
        '{% if perms.students %} -> user has any permission in the app',
        'Object level: override get_queryset() to limit to own objects -> others get 404',
        'Or check in test_func(): return self.get_object().owner == self.request.user',
      ],
    },
  ],
  examples: [
    {
      title: 'Create groups and permissions with a data migration',
      scenario: 'The portal needs two roles: Teachers (view and change students, publish results) and Office Staff (full student CRUD). Groups should be created automatically on every environment.',
      steps: [
        'Add the Result model with custom permissions to students/models.py',
        'Run python manage.py makemigrations students and migrate',
        'Create an empty migration: python manage.py makemigrations students --empty -n create_groups',
        'Fill the migration with the RunPython code below and run python manage.py migrate',
        'Open /admin/auth/group/ to see the groups (VS Code: browser; PyCharm: built-in HTTP preview)',
      ],
      code: `# students/models.py
class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="results")
    subject = models.CharField(max_length=50)
    marks = models.PositiveSmallIntegerField()
    is_published = models.BooleanField(default=False)
    entered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        permissions = [
            ("publish_result", "Can publish results"),
            ("export_result", "Can export results to CSV"),
        ]


# students/migrations/0007_create_groups.py
from django.db import migrations
from django.contrib.auth.management import create_permissions

ROLES = {
    "Teachers": ["view_student", "change_student", "view_result", "add_result",
                 "change_result", "publish_result"],
    "Office Staff": ["view_student", "add_student", "change_student", "delete_student",
                     "view_course", "add_course", "change_course", "export_result"],
}


def create_groups(apps, schema_editor):
    # make sure permissions exist even on a fresh database
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    for name, codenames in ROLES.items():
        group, _ = Group.objects.get_or_create(name=name)
        perms = Permission.objects.filter(content_type__app_label="students", codename__in=codenames)
        group.permissions.set(perms)


def remove_groups(apps, schema_editor):
    apps.get_model("auth", "Group").objects.filter(name__in=ROLES).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("students", "0006_result"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]
    operations = [migrations.RunPython(create_groups, remove_groups)]


# Assign a user to a group (shell or admin)
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> from django.contrib.auth.models import Group
>>> meena = get_user_model().objects.get(email="meena@portal.com")
>>> meena.groups.add(Group.objects.get(name="Teachers"))
>>> meena = get_user_model().objects.get(pk=meena.pk)   # reload to clear perm cache
>>> meena.has_perm("students.publish_result"), meena.has_perm("students.delete_student")
(True, False)`,
      result: 'Groups "Teachers" and "Office Staff" exist with their permissions. meena.has_perm("students.publish_result") -> True, meena.has_perm("students.delete_student") -> False.',
      explanation: 'A data migration makes roles reproducible on dev, test and production. Reloading the user is required because Django caches permissions on the user object.',
    },
    {
      title: 'Protect views with permissions and roles',
      scenario: 'Only Office Staff may delete students; only Teachers may publish results; only staff-role users may open the staff dashboard.',
      steps: [
        'Open students/views.py',
        'Add PermissionRequiredMixin to StudentDeleteView and StudentCreateView',
        'Write publish_result FBV with @permission_required',
        'Write StaffDashboardView with UserPassesTestMixin',
        'Log in as a teacher and as office staff to compare 403 vs success',
      ],
      code: `# students/views.py
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.mixins import (LoginRequiredMixin, PermissionRequiredMixin,
                                        UserPassesTestMixin)
from django.views.decorators.http import require_POST


class StudentCreateView(LoginRequiredMixin, PermissionRequiredMixin, SuccessMessageMixin, CreateView):
    model = Student
    form_class = StudentForm
    permission_required = "students.add_student"
    success_message = "%(name)s added."


class StudentDeleteView(LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    model = Student
    permission_required = "students.delete_student"
    raise_exception = True                      # logged-in but no perm -> 403
    success_url = reverse_lazy("students:list")


@login_required
@permission_required("students.publish_result", raise_exception=True)
@require_POST
def publish_result(request, pk):
    result = get_object_or_404(Result, pk=pk)
    result.is_published = True
    result.save(update_fields=["is_published"])
    messages.success(request, f"Result for {result.student} published.")
    return redirect("students:detail", pk=result.student_id)


class StaffDashboardView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = "students/staff_dashboard.html"

    def test_func(self):
        user = self.request.user
        return user.is_superuser or user.groups.filter(name="Office Staff").exists()

<!-- templates/403.html  (shown when PermissionDenied is raised and DEBUG=False) -->
{% extends "base.html" %}
{% block content %}<h2>Access denied</h2><p>You do not have permission to do this.</p>{% endblock %}`,
      result: 'Teacher POST /students/4/delete/ -> 403 Forbidden. Office Staff -> student deleted and redirected. Anonymous user -> 302 to /accounts/login/?next=/students/4/delete/.',
      explanation: 'Mixin order: LoginRequiredMixin first (send anonymous users to login), then PermissionRequiredMixin. Decorator order works top-down in the same way.',
    },
    {
      title: 'Hide buttons with perms and owner-only editing',
      scenario: 'Teachers may edit only the results they entered, and the Edit/Delete buttons appear only for users who have permission.',
      steps: [
        'Update student_detail.html with {% if perms... %} checks',
        'Create ResultUpdateView that filters queryset by entered_by',
        'Test with two teacher accounts',
      ],
      code: `<!-- templates/students/student_detail.html -->
<h2>{{ student.name }}</h2>
{% if perms.students.change_student %}
  <a href="{% url 'students:update' student.pk %}">Edit</a>
{% endif %}
{% if perms.students.delete_student %}
  <a href="{% url 'students:delete' student.pk %}">Delete</a>
{% endif %}

<table>
{% for r in student.results.all %}
  <tr>
    <td>{{ r.subject }}</td><td>{{ r.marks }}</td>
    <td>
      {% if r.entered_by == user %}<a href="{% url 'students:result_edit' r.pk %}">Edit</a>{% endif %}
      {% if perms.students.publish_result and not r.is_published %}
        <form method="post" action="{% url 'students:publish_result' r.pk %}">
          {% csrf_token %}<button>Publish</button>
        </form>
      {% endif %}
    </td>
  </tr>
{% endfor %}
</table>

# students/views.py
class ResultUpdateView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    model = Result
    fields = ["subject", "marks"]
    permission_required = "students.change_result"

    def get_queryset(self):
        # object-level rule: only my own results (superuser sees all)
        qs = super().get_queryset()
        if self.request.user.is_superuser:
            return qs
        return qs.filter(entered_by=self.request.user)

    def get_success_url(self):
        return reverse("students:detail", args=[self.object.student_id])`,
      result: 'Teacher Meena sees Edit only on her own results. If she types /results/9/edit/ for a result entered by another teacher she gets 404 Not Found.',
      explanation: 'Template checks improve the UI; the get_queryset() filter is the real security. Returning 404 instead of 403 also hides that the record exists.',
    },
    {
      title: 'Pure Python demo: role-based access control',
      scenario: 'Model the idea of users, groups and permission strings in plain Python.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `GROUPS = {
    "Teachers": {"students.view_student", "students.change_student", "students.publish_result"},
    "Office Staff": {"students.view_student", "students.add_student", "students.delete_student"},
}

class User:
    def __init__(self, name, groups=(), extra=(), is_superuser=False):
        self.name, self.groups, self.extra = name, set(groups), set(extra)
        self.is_superuser = is_superuser

    def get_all_permissions(self):
        perms = set(self.extra)
        for g in self.groups:
            perms |= GROUPS[g]
        return perms

    def has_perm(self, perm):
        return self.is_superuser or perm in self.get_all_permissions()

meena = User("Meena", groups=["Teachers"])
ravi = User("Ravi", groups=["Office Staff"], extra=["students.export_result"])
admin = User("Admin", is_superuser=True)

for perm in ["students.publish_result", "students.delete_student", "students.export_result"]:
    print(perm, "->", [u.name for u in (meena, ravi, admin) if u.has_perm(perm)])`,
      python: {
        files: {
          'main.py': `GROUPS = {
    "Teachers": {"students.view_student", "students.change_student", "students.publish_result"},
    "Office Staff": {"students.view_student", "students.add_student", "students.delete_student"},
}

class User:
    def __init__(self, name, groups=(), extra=(), is_superuser=False):
        self.name, self.groups, self.extra = name, set(groups), set(extra)
        self.is_superuser = is_superuser

    def get_all_permissions(self):
        perms = set(self.extra)
        for g in self.groups:
            perms |= GROUPS[g]
        return perms

    def has_perm(self, perm):
        return self.is_superuser or perm in self.get_all_permissions()

meena = User("Meena", groups=["Teachers"])
ravi = User("Ravi", groups=["Office Staff"], extra=["students.export_result"])
admin = User("Admin", is_superuser=True)

for perm in ["students.publish_result", "students.delete_student", "students.export_result"]:
    print(perm, "->", [u.name for u in (meena, ravi, admin) if u.has_perm(perm)])`,
        },
      },
      result: `students.publish_result -> ['Meena', 'Admin']
students.delete_student -> ['Ravi', 'Admin']
students.export_result -> ['Ravi', 'Admin']`,
      explanation: 'A user\'s permissions are the union of direct permissions and all group permissions, and superusers pass every check, exactly like Django\'s ModelBackend.',
    },
  ],
  interview: [
    { q: 'What default permissions does Django create for each model?', a: 'add, change, delete and view (codenames like add_student) created by the post_migrate signal.', level: 'Easy' },
    { q: 'What is the format of a permission string for has_perm()?', a: '"<app_label>.<codename>", e.g. "students.change_student".', level: 'Easy' },
    { q: 'What is a Group?', a: 'A named collection of permissions. Users in the group inherit all its permissions, which makes role management easy.', level: 'Easy' },
    { q: 'How do you add a custom permission?', a: 'Add Meta.permissions = [("codename", "Description")] to a model and run makemigrations/migrate.', level: 'Easy' },
    { q: 'PermissionRequiredMixin vs UserPassesTestMixin?', a: 'PermissionRequiredMixin checks permission strings. UserPassesTestMixin runs any custom test_func() returning True/False, e.g. role or ownership checks.', level: 'Medium' },
    { q: 'What does raise_exception=True do?', a: 'Raises PermissionDenied (403) instead of redirecting to the login page when the check fails.', level: 'Medium' },
    { q: 'Why might has_perm() still return False right after adding a permission?', a: 'Permissions are cached on the user instance (_perm_cache). Re-fetch the user from the database.', level: 'Hard' },
    { q: 'Does Django support object-level permissions?', a: 'The API (has_perm(perm, obj)) exists, but ModelBackend returns no object permissions. Use queryset filtering, custom backends, or django-guardian.', level: 'Hard' },
    { q: 'Is hiding a button with {% if perms %} enough security?', a: 'No. It only affects the UI. The view must enforce the permission because users can send requests directly.', level: 'Medium' },
    { q: 'Do superusers need permissions assigned?', a: 'No, has_perm() always returns True for active superusers.', level: 'Easy' },
    { q: 'How do you create groups in every environment consistently?', a: 'Use a data migration with RunPython or a custom management command that is run during deployment.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Allow only users with students.export_result to download a CSV.',
      hint: '@permission_required with raise_exception.',
      solution: `@permission_required("students.export_result", raise_exception=True)
def export_results(request):
    import csv
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="results.csv"'
    writer = csv.writer(response)
    writer.writerow(["Roll", "Subject", "Marks"])
    for r in Result.objects.select_related("student"):
        writer.writerow([r.student.roll_no, r.subject, r.marks])
    return response`,
    },
    {
      task: 'Require two permissions in a CBV.',
      hint: 'permission_required accepts a tuple.',
      solution: `class ResultPublishAllView(PermissionRequiredMixin, View):
    permission_required = ("students.change_result", "students.publish_result")`,
    },
    {
      task: 'Print all permissions of a user in the shell.',
      hint: 'get_all_permissions().',
      solution: `>>> u = get_user_model().objects.get(email="meena@portal.com")
>>> sorted(u.get_all_permissions())`,
    },
    {
      task: 'Make a mixin TeacherRequiredMixin based on the role field from Day 21.',
      hint: 'UserPassesTestMixin.',
      solution: `class TeacherRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.role == "TEACHER"`,
    },
  ],
  quiz: [
    { question: 'Which permission is NOT created automatically?', options: ['add_student', 'view_student', 'publish_student', 'delete_student'], answer: 2, explanation: 'Only add, change, delete and view are automatic.' },
    { question: 'A logged-in user without permission should receive:', options: ['403 Forbidden', '200 OK', '404 always', '500 error'], answer: 0, explanation: 'With raise_exception=True, PermissionDenied gives 403.' },
    { question: 'Which template variable checks permissions?', options: ['user.perms', 'permissions', 'can', 'perms'], answer: 3, explanation: 'The auth context processor adds perms.' },
    { question: 'Where do you declare custom permissions?', options: ['settings.py', 'Model Meta.permissions', 'admin.py', 'urls.py'], answer: 1, explanation: 'Meta.permissions list of (codename, name).' },
    { question: 'Best way to let teachers edit only their own results:', options: ['Hide the edit button', 'Use a bigger group', 'Filter get_queryset() by the user', 'Use DEBUG=False'], answer: 2, explanation: 'Queryset filtering enforces object-level access on the server.' },
  ],
};
