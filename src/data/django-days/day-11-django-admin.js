export default {
  id: 'day-11-django-admin',
  title: 'Django Admin: Registering Models, Customizing ModelAdmin',
  module: 'Module 2: Models & Database',
  day: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Turn the Django admin into a complete back-office for the Student Portal: create a superuser, register Course, Subject, Student and StudentProfile, and customise lists, filters, search, editable columns, fieldsets, inlines, custom columns and bulk actions with ModelAdmin.`,
  objectives: [
    `Create a superuser and register models with admin.site.register and @admin.register`,
    `Customise the change list: list_display, list_filter, search_fields, list_editable, ordering, list_per_page, date_hierarchy`,
    `Customise the edit form: fields, fieldsets, readonly_fields, filter_horizontal, autocomplete_fields`,
    `Show related objects with TabularInline and StackedInline`,
    `Add computed columns with @admin.display and bulk operations with @admin.action`,
  ],
  theory: [
    {
      heading: `What is the Django admin?`,
      content: `django.contrib.admin is an automatic, model-driven interface for trusted staff to add, edit, delete and search data. It reads your models and builds forms, validation and lists for free. It is perfect for internal users (office staff, teachers) - it is NOT meant to be the public website for students.`,
      points: [
        `Requires: "django.contrib.admin" in INSTALLED_APPS and path("admin/", admin.site.urls) in urls.py (both present by default).`,
        `Login: python manage.py createsuperuser, then open /admin/.`,
        `Only users with is_staff=True can log in; is_superuser=True has every permission.`,
        `Each registered model gets add/change/delete/view permissions automatically.`,
      ],
    },
    {
      heading: `Registering models`,
      content: `A model does not appear in the admin until it is registered in the app's admin.py. Simple registration gives a default list showing __str__. For customisation create a ModelAdmin class.`,
      syntax: `# students/admin.py
from django.contrib import admin
from .models import Student, Course

admin.site.register(Course)            # default options

@admin.register(Student)               # decorator style (preferred)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("roll_no", "name", "course", "marks")`,
      tip: `Always define __str__ on models - it is what the admin shows in dropdowns, breadcrumbs and default lists.`,
    },
    {
      heading: `Customising the change list (the table page)`,
      content: `These ModelAdmin attributes control the list of records.`,
      points: [
        `list_display - columns: field names, related fields (shown via __str__), or methods.`,
        `list_display_links - which columns open the edit page.`,
        `list_filter - right sidebar filters (fields, FK, booleans, dates, choices).`,
        `search_fields - search box; supports relations like "course__code" and prefixes "^name" (startswith), "=roll_no" (exact).`,
        `list_editable - edit values directly in the list (cannot be the first/link column).`,
        `ordering, list_per_page, date_hierarchy ("created_at" drill-down by year/month/day).`,
        `list_select_related - reduce queries for FK columns (Day 12).`,
      ],
    },
    {
      heading: `Customising the add/edit form`,
      content: `Control which fields appear and how they are grouped.`,
      points: [
        `fields = ("roll_no", "name") - which fields and in which order. exclude = ("phone",) - hide fields.`,
        `fieldsets - groups with headings; "classes": ("collapse",) makes a group collapsible.`,
        `readonly_fields - shown but not editable (auto_now fields MUST be readonly to be displayed).`,
        `filter_horizontal / filter_vertical - a two-box selector for ManyToMany fields.`,
        `autocomplete_fields - a searchable dropdown for FK/M2M (the related admin needs search_fields).`,
        `raw_id_fields - just an id input with a lookup popup (for huge tables).`,
        `prepopulated_fields = {"slug": ("title",)} - auto-fill slugs.`,
      ],
    },
    {
      heading: `Inlines, custom columns and actions`,
      content: `Inlines edit related objects on the parent page: TabularInline shows compact rows, StackedInline shows full forms. A method in list_display creates a computed column; @admin.display sets its header and sort field. Actions are bulk operations in the "Action" dropdown applied to selected rows; the built-in one is "Delete selected".`,
      syntax: `class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    extra = 0

@admin.display(description="Result", ordering="marks")
def result_badge(self, obj):
    return format_html('<b style="color:{}">{}</b>', "green", obj.result)

@admin.action(description="Mark selected students as active")
def mark_active(self, request, queryset):
    queryset.update(is_active=True)`,
      tip: `Use format_html() - never plain f-strings with mark_safe - to build HTML in the admin, so values are escaped and safe from XSS.`,
    },
    {
      heading: `Branding the admin site`,
      content: `Change the header and title text on every admin page with three attributes, usually in any admin.py.`,
      syntax: `admin.site.site_header = "ABC College Administration"   # top banner + login page
admin.site.site_title = "Student Portal Admin"           # browser tab
admin.site.index_title = "Welcome to the Student Portal admin"`,
    },
  ],
  examples: [
    {
      title: `Complete admin.py for the Student Portal`,
      scenario: `Give the college office a powerful admin: course list with student counts and inline students, and a student list with filters, search, editable marks, a coloured Result column, grouped form, inline profile and bulk activate/deactivate actions.`,
      steps: [
        `Make sure the Day 10 models are migrated.`,
        `Replace students/admin.py with the code below (VS Code or PyCharm).`,
        `Run python manage.py createsuperuser if you have not created one for the current database.`,
        `Run python manage.py runserver and log in at http://127.0.0.1:8000/admin/.`,
        `Add 3 courses, 4 subjects and some students, then try search, filters, inline editing and the actions dropdown.`,
      ],
      code: `# students/admin.py
from django.contrib import admin, messages
from django.utils.html import format_html

from .models import Course, Student, StudentProfile, Subject

admin.site.site_header = "ABC College Administration"
admin.site.site_title = "Student Portal Admin"
admin.site.index_title = "Welcome to the Student Portal admin"


class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    extra = 0


class StudentInline(admin.TabularInline):
    model = Student
    fields = ("roll_no", "name", "marks", "is_active")
    extra = 0
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "duration_years", "student_count")
    search_fields = ("code", "name")          # required by autocomplete_fields below
    inlines = [StudentInline]

    @admin.display(description="Students")
    def student_count(self, obj):
        return obj.students.count()


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "credits")
    search_fields = ("name",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("roll_no", "name", "course", "marks", "result_badge", "is_active")
    list_display_links = ("roll_no", "name")
    list_filter = ("course", "gender", "is_active", "created_at")
    search_fields = ("roll_no", "name", "email", "course__code")
    list_editable = ("marks", "is_active")
    list_per_page = 20
    ordering = ("roll_no",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("course",)
    filter_horizontal = ("subjects",)
    inlines = [StudentProfileInline]
    actions = ["mark_active", "mark_inactive"]
    fieldsets = (
        ("Basic information", {"fields": ("roll_no", "name", "email", "gender", "date_of_birth", "phone")}),
        ("Academic", {"fields": ("course", "subjects", "marks", "fee_paid", "is_active")}),
        ("System", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Result", ordering="marks")
    def result_badge(self, obj):
        color = "green" if obj.marks >= 40 else "red"
        return format_html('<b style="color:{}">{}</b>', color, obj.result)

    @admin.action(description="Mark selected students as active")
    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} student(s) marked active.", messages.SUCCESS)

    @admin.action(description="Mark selected students as inactive")
    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} student(s) marked inactive.", messages.WARNING)


admin.site.register(StudentProfile)

# Terminal
python manage.py check
python manage.py runserver`,
      result: `System check identified no issues (0 silenced).

/admin/ shows "ABC College Administration" with sections STUDENTS: Courses, Student profiles, Students, Subjects.
/admin/students/student/ shows columns ROLL NUMBER | NAME | COURSE | MARKS (editable) | RESULT (green Pass / red Fail) | IS ACTIVE,
a search box, filters (By course, By gender, By is active, By created at), a date drill-down, and
Action dropdown: Delete selected students / Mark selected students as active / Mark selected students as inactive.
Selecting 2 rows + "Mark selected students as inactive" shows: "2 student(s) marked inactive."`,
      explanation: `Every attribute is declarative - Django builds the UI. autocomplete_fields needs search_fields on CourseAdmin (python manage.py check reports admin.E040 otherwise). created_at/updated_at are readonly because auto_now fields are not editable. format_html escapes values while allowing our own tags.`,
    },
    {
      title: `Admin permissions: a staff user for the office`,
      scenario: `Create a staff account for the office clerk who can view and edit students but cannot delete them or manage courses.`,
      steps: [
        `In /admin/ click Users > Add user. Username: clerk, set a password, Save.`,
        `On the next page tick "Staff status" (do NOT tick superuser).`,
        `In "User permissions" choose: students | student | Can view student, Can change student, Can add student. Save.`,
        `Log out and log in as clerk.`,
        `Alternatively do it from the shell as shown.`,
      ],
      code: `# python manage.py shell
from django.contrib.auth.models import User, Permission

clerk = User.objects.create_user("clerk", "clerk@college.in", "Clerk@12345")
clerk.is_staff = True
clerk.save()
perms = Permission.objects.filter(
    content_type__app_label="students",
    codename__in=["view_student", "change_student", "add_student"],
)
clerk.user_permissions.add(*perms)
print(sorted(p.codename for p in clerk.user_permissions.all()))`,
      result: `['add_student', 'change_student', 'view_student']

Logged in as clerk, the admin index shows only "Students" (no Courses/Subjects),
and the "Delete" button and "Delete selected" action are not available.`,
      explanation: `Django auto-creates add/change/delete/view permissions for each model. The admin hides any model or button the user has no permission for. Groups (Day 22) let you assign the same permissions to many users at once.`,
    },
    {
      title: `Overriding admin behaviour: queryset, save_model and readonly for non-superusers`,
      scenario: `Speed up the student list, automatically uppercase roll numbers when saving, and stop non-superusers from editing marks.`,
      steps: [
        `Add the three methods to StudentAdmin in students/admin.py.`,
        `Save, refresh /admin/students/student/ and add a student with roll number "s110".`,
        `Log in as clerk and open a student: marks is read-only.`,
      ],
      code: `@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    # ... everything from Example 1 ...
    list_select_related = ("course",)      # JOIN course in one query (see Day 12)

    def save_model(self, request, obj, form, change):
        obj.roll_no = obj.roll_no.upper()
        super().save_model(request, obj, form, change)

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            fields.append("marks")
        return fields

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs if request.user.is_superuser else qs.filter(is_active=True)`,
      result: `Saving "s110" stores "S110".
Superuser: marks editable, sees all students.
Clerk: marks shown as plain text, inactive students hidden from the list.`,
      explanation: `ModelAdmin has many hook methods: save_model, delete_model, get_queryset, get_readonly_fields, get_list_display, has_delete_permission and more. Overriding them lets the admin follow business rules without writing custom views.`,
    },
    {
      title: `Pure Python: how list_display and @admin.display work`,
      scenario: `Rebuild a tiny change list to see how the admin resolves each list_display entry (field vs method) and reads the column header from the decorator.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Add "course" to the data and list_display and run again.`,
      ],
      code: `def display(description):
    def decorator(func):
        func.short_description = description
        return func
    return decorator


class StudentAdmin:
    list_display = ("roll_no", "name", "marks", "result")
    search_fields = ("name", "roll_no")

    @display(description="Result")
    def result(self, obj):
        return "Pass" if obj["marks"] >= 40 else "Fail"

    def header(self, column):
        attr = getattr(self, column, None)
        return getattr(attr, "short_description", column.replace("_", " ").title())

    def cell(self, obj, column):
        attr = getattr(self, column, None)
        return attr(obj) if callable(attr) else obj[column]

    def changelist(self, rows, q=""):
        rows = [r for r in rows if any(q.lower() in str(r[f]).lower() for f in self.search_fields)]
        print(" | ".join(f"{self.header(c):<8}" for c in self.list_display).rstrip())
        for r in rows:
            print(" | ".join(f"{str(self.cell(r, c)):<8}" for c in self.list_display).rstrip())
        print(f"{len(rows)} student(s)")


STUDENTS = [
    {"roll_no": "S101", "name": "Asha", "marks": 92},
    {"roll_no": "S102", "name": "Ravi", "marks": 76},
    {"roll_no": "S103", "name": "Meena", "marks": 35},
]
admin = StudentAdmin()
admin.changelist(STUDENTS)
print()
admin.changelist(STUDENTS, q="ee")`,
      python: {
        files: {
          'main.py': `def display(description):
    def decorator(func):
        func.short_description = description
        return func
    return decorator


class StudentAdmin:
    list_display = ("roll_no", "name", "marks", "result")
    search_fields = ("name", "roll_no")

    @display(description="Result")
    def result(self, obj):
        return "Pass" if obj["marks"] >= 40 else "Fail"

    def header(self, column):
        attr = getattr(self, column, None)
        return getattr(attr, "short_description", column.replace("_", " ").title())

    def cell(self, obj, column):
        attr = getattr(self, column, None)
        return attr(obj) if callable(attr) else obj[column]

    def changelist(self, rows, q=""):
        rows = [r for r in rows if any(q.lower() in str(r[f]).lower() for f in self.search_fields)]
        print(" | ".join(f"{self.header(c):<8}" for c in self.list_display).rstrip())
        for r in rows:
            print(" | ".join(f"{str(self.cell(r, c)):<8}" for c in self.list_display).rstrip())
        print(f"{len(rows)} student(s)")


STUDENTS = [
    {"roll_no": "S101", "name": "Asha", "marks": 92},
    {"roll_no": "S102", "name": "Ravi", "marks": 76},
    {"roll_no": "S103", "name": "Meena", "marks": 35},
]
admin = StudentAdmin()
admin.changelist(STUDENTS)
print()
admin.changelist(STUDENTS, q="ee")
`,
        },
      },
      result: `Roll No  | Name     | Marks    | Result
S101     | Asha     | 92       | Pass
S102     | Ravi     | 76       | Pass
S103     | Meena    | 35       | Fail
3 student(s)

Roll No  | Name     | Marks    | Result
S103     | Meena    | 35       | Fail
1 student(s)`,
      explanation: `For each list_display entry the admin checks whether the ModelAdmin has a callable with that name (computed column) or else reads the model field. The decorator stores the header text as an attribute on the function - Django's @admin.display does the same (description, ordering, boolean). search_fields filters rows that contain the text in any listed field.`,
    },
  ],
  interview: [
    { q: `What is the Django admin and who should use it?`, a: `An automatically generated CRUD interface based on models, intended for trusted internal staff to manage data. It should not be used as the public-facing UI.`, level: 'Easy' },
    { q: `How do you register a model in the admin?`, a: `In app/admin.py: admin.site.register(Model) or admin.site.register(Model, ModelAdmin), or use the @admin.register(Model) decorator on a ModelAdmin subclass.`, level: 'Easy' },
    { q: `What is a ModelAdmin?`, a: `A class that customises how a model appears in the admin: list columns, filters, search, forms, inlines, actions, permissions and hook methods.`, level: 'Easy' },
    { q: `Difference between list_display and list_filter?`, a: `list_display defines the columns shown in the change list. list_filter adds a sidebar of filters to narrow the rows.`, level: 'Easy' },
    { q: `What is an inline? TabularInline vs StackedInline?`, a: `An inline lets you edit related objects (FK/OneToOne) on the parent's edit page. TabularInline shows them as compact table rows; StackedInline shows full stacked forms.`, level: 'Medium' },
    { q: `How do you add a custom bulk action?`, a: `Define a method (self, request, queryset) on the ModelAdmin decorated with @admin.action(description=...) and add its name to actions.`, level: 'Medium' },
    { q: `Why are auto_now / auto_now_add fields missing from the admin form?`, a: `They are non-editable (editable=False). To display them, add them to readonly_fields.`, level: 'Medium' },
    { q: `What does autocomplete_fields require?`, a: `The related model's ModelAdmin must define search_fields; otherwise system check error admin.E040 is raised.`, level: 'Hard' },
    { q: `What user flags are needed to log in to the admin?`, a: `is_active=True and is_staff=True. Superusers (is_superuser=True) have all permissions; other staff need explicit model permissions.`, level: 'Medium' },
    { q: `How do you restrict what rows a staff user sees in the admin?`, a: `Override get_queryset(self, request) and filter based on request.user. You can also override has_change_permission, has_delete_permission, etc.`, level: 'Hard' },
    { q: `Why use format_html in admin methods?`, a: `It escapes the arguments while marking the template as safe, preventing XSS when building HTML columns.`, level: 'Hard' },
  ],
  practice: [
    { task: `Register Subject with columns name and credits, a search box on name, and ordering by name.`, hint: `@admin.register + ModelAdmin`, solution: `@admin.register(Subject)\nclass SubjectAdmin(admin.ModelAdmin):\n    list_display = ("name", "credits")\n    search_fields = ("name",)\n    ordering = ("name",)` },
    { task: `Add a column "Email domain" to StudentAdmin showing the part after @.`, hint: `@admin.display method; add its name to list_display.`, solution: `@admin.display(description="Email domain")\ndef email_domain(self, obj):\n    return obj.email.split("@")[-1]\n\nlist_display = (..., "email_domain")` },
    { task: `Create an action that adds 5 grace marks to the selected students.`, hint: `F expression`, solution: `from django.db.models import F\n\n@admin.action(description="Add 5 grace marks")\ndef add_grace(self, request, queryset):\n    n = queryset.update(marks=F("marks") + 5)\n    self.message_user(request, f"Grace marks added for {n} students")\n\nactions = ["mark_active", "mark_inactive", "add_grace"]` },
    { task: `Prevent anyone from deleting a Course from the admin.`, hint: `has_delete_permission`, solution: `class CourseAdmin(admin.ModelAdmin):\n    def has_delete_permission(self, request, obj=None):\n        return False` },
  ],
  quiz: [
    { question: `Which command creates an admin login?`, options: [`python manage.py createadmin`, `python manage.py createsuperuser`, `django-admin adduser`, `python manage.py admin`], answer: 1, explanation: `createsuperuser creates a staff superuser.` },
    { question: `Which option makes a column editable directly in the list?`, options: [`readonly_fields`, `list_filter`, `fieldsets`, `list_editable`], answer: 3, explanation: `list_editable renders form inputs in the change list.` },
    { question: `Which inline shows related objects as compact rows?`, options: [`TabularInline`, `StackedInline`, `ListInline`, `RowInline`], answer: 0, explanation: `TabularInline uses a table layout.` },
    { question: `To display auto_now_add field created_at on the edit page you must:`, options: [`Add it to list_filter`, `Remove auto_now_add`, `Add it to readonly_fields`, `Add it to search_fields`], answer: 2, explanation: `Non-editable fields can only be shown as read-only.` },
    { question: `Which decorator gives a custom admin column a header and sort field?`, options: [`@admin.column`, `@admin.display`, `@admin.field`, `@property`], answer: 1, explanation: `@admin.display(description=..., ordering=...).` },
  ],
};
