export default {
  lesson: 'day-11-django-admin',
  minutes: 30,
  intro: 'Practise createsuperuser, admin registration and ModelAdmin options (list_display, list_filter, search_fields, inlines, actions), and write the change-list logic in plain Python.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Write the command that creates an admin login for the Django admin site:',
      accept: ['python manage.py createsuperuser', 'py manage.py createsuperuser', 'python3 manage.py createsuperuser'],
      explain: '`createsuperuser` creates a user with `is_staff=True` and `is_superuser=True`. Only staff users can log in at `/admin/`; superusers have every permission.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which ModelAdmin option adds a **sidebar** to filter students by course and city?',
      options: ["search_fields = ['course', 'city']", "list_filter = ['course', 'city']", "list_display = ['course', 'city']", "ordering = ['course', 'city']"],
      answer: 1,
      explain: '`list_filter` builds the right-hand filter sidebar. `list_display` chooses the table columns, `search_fields` powers the search box, `ordering` sets the default sort.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '@admin.register(Student) above a ModelAdmin class registers the model',
        'list_editable fields must also be in list_display (and not the first, linked column)',
        'TabularInline lets you edit related rows (e.g. a course\'s students) on the parent page',
        'search_fields = ["course__name"] searches across a ForeignKey',
        'The admin is meant to be the public website for students',
      ],
      answers: [0, 1, 2, 3],
      explain: 'The admin is an internal **back-office** for trusted staff, not the public UI. Registration with the decorator or `admin.site.register(Student, StudentAdmin)`; editable columns must be displayed; inlines show children; `__` follows relations in search.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `change_list(rows, search=\'\', filters=None, ordering=None, page=1, per_page=2)` - what the admin change list does with `?q=`, sidebar filters, column sorting and `list_per_page`. Return `{\'count\': n, \'rows\': [names]}`:\n- `search`: case-insensitive substring in **name or roll_no**\n- `filters`: dict of exact matches, e.g. `{\'city\': \'Pune\'}`\n- `ordering`: field name, `-` prefix for descending; default by `id`\n- `count` before paginating',
      example: { title: 'search across several fields', code: "q = 'cs00'\nhit = any(q.lower() in str(row[f]).lower() for f in ('name', 'roll_no'))" },
      starter: `def change_list(rows, search='', filters=None, ordering=None, page=1, per_page=2):
    # TODO
    return {'count': 0, 'rows': []}
`,
      solution: `def change_list(rows, search='', filters=None, ordering=None, page=1, per_page=2):
    result = list(rows)
    if search:
        s = search.lower()
        result = [r for r in result if s in r['name'].lower() or s in r['roll_no'].lower()]
    for field, value in (filters or {}).items():
        result = [r for r in result if r[field] == value]
    field = (ordering or 'id').lstrip('-')
    result.sort(key=lambda r: r[field], reverse=bool(ordering) and ordering.startswith('-'))
    start = (page - 1) * per_page
    return {'count': len(result), 'rows': [r['name'] for r in result[start:start + per_page]]}
`,
      tests: [
        { call: "change_list([{'id': 1, 'name': 'Asha', 'roll_no': 'CS001', 'city': 'Pune', 'marks': 82}, {'id': 2, 'name': 'Ravi', 'roll_no': 'IT002', 'city': 'Mumbai', 'marks': 67}, {'id': 3, 'name': 'Meera', 'roll_no': 'CS003', 'city': 'Pune', 'marks': 91}, {'id': 4, 'name': 'Dev', 'roll_no': 'CS004', 'city': 'Pune', 'marks': 58}])", expect: { count: 4, rows: ['Asha', 'Ravi'] } },
        { call: "change_list([{'id': 1, 'name': 'Asha', 'roll_no': 'CS001', 'city': 'Pune', 'marks': 82}, {'id': 2, 'name': 'Ravi', 'roll_no': 'IT002', 'city': 'Mumbai', 'marks': 67}, {'id': 3, 'name': 'Meera', 'roll_no': 'CS003', 'city': 'Pune', 'marks': 91}, {'id': 4, 'name': 'Dev', 'roll_no': 'CS004', 'city': 'Pune', 'marks': 58}], search='cs', ordering='-marks')", expect: { count: 3, rows: ['Meera', 'Asha'] } },
        { call: "change_list([{'id': 1, 'name': 'Asha', 'roll_no': 'CS001', 'city': 'Pune', 'marks': 82}, {'id': 2, 'name': 'Ravi', 'roll_no': 'IT002', 'city': 'Mumbai', 'marks': 67}, {'id': 3, 'name': 'Meera', 'roll_no': 'CS003', 'city': 'Pune', 'marks': 91}, {'id': 4, 'name': 'Dev', 'roll_no': 'CS004', 'city': 'Pune', 'marks': 58}], filters={'city': 'Pune'}, ordering='name', page=2)", expect: { count: 3, rows: ['Meera'] } },
        { call: "change_list([{'id': 1, 'name': 'Asha', 'roll_no': 'CS001', 'city': 'Pune', 'marks': 82}], search='zzz')", expect: { count: 0, rows: [] } },
      ],
      explain: 'The admin change list applies search (`search_fields`, OR across fields), sidebar filters (`list_filter`, AND), ordering (click a column) and then pagination (`list_per_page`). The "4 students" counter is computed after search and filters.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Admin **actions** and **computed columns**. Write:\n- `grade_column(student)` - like an `@admin.display(description=\'Grade\')` method: `\'A\'` for marks >= 75, `\'B\'` for >= 60, `\'C\'` for >= 35, else `\'F\'`\n- `mark_inactive(queryset)` - an action that sets `is_active = False` on every row in the list and returns the message `f\'{n} student(s) marked inactive.\'` where n counts only rows that **changed**',
      example: { title: 'an admin action', code: "@admin.action(description='Mark selected as paid')\ndef mark_paid(modeladmin, request, queryset):\n    n = queryset.update(paid=True)\n    modeladmin.message_user(request, f'{n} fee(s) marked paid.')" },
      starter: `def grade_column(student):
    # TODO
    return ''

def mark_inactive(queryset):
    # TODO
    return ''
`,
      solution: `def grade_column(student):
    m = student['marks']
    if m >= 75:
        return 'A'
    if m >= 60:
        return 'B'
    if m >= 35:
        return 'C'
    return 'F'

def mark_inactive(queryset):
    n = 0
    for row in queryset:
        if row.get('is_active', True):
            row['is_active'] = False
            n += 1
    return f'{n} student(s) marked inactive.'
`,
      tests: [
        { call: "[grade_column({'marks': m}) for m in (91, 75, 60, 59, 35, 20)]", expect: ['A', 'A', 'B', 'C', 'C', 'F'] },
        { call: "(lambda qs: (mark_inactive(qs), [r['is_active'] for r in qs]))([{'is_active': True}, {'is_active': False}, {'is_active': True}])", expect: ['2 student(s) marked inactive.', [false, false, false]] },
      ],
      explain: 'Computed columns (`list_display = [\'name\', \'grade\']` with a `grade` method) show derived data without storing it. Actions run on the **selected** rows; real code usually does `queryset.update(...)` (one SQL query) and reports the count with `message_user`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.contrib import admin
from django.contrib.auth.models import Group

class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'member_count']
    search_fields = ['name']
    list_per_page = 25

    @admin.display(description='Members')
    def member_count(self, obj):
        return 0

site = admin.AdminSite(name='portal_admin')
site.register(Group, GroupAdmin)
print(site.is_registered(Group))
ma = site._registry[Group]
print(ma.list_display, ma.list_per_page)
print(ma.member_count.short_description)`,
      expected: "True\n['name', 'member_count'] 25\nMembers",
      explain: 'Registering stores a ModelAdmin instance in the site\'s registry. `@admin.display(description=...)` sets the column header (`short_description`) for a computed column. Registering the same model twice on one site raises `AlreadyRegistered`.',
    },
  ],
};
