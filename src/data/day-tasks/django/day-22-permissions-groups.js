export default {
  lesson: 'day-22-permissions-groups',
  minutes: 30,
  intro: 'Practise model permissions and codenames, groups, custom permissions, PermissionRequiredMixin, UserPassesTestMixin and object-level rules, and write has_perm logic in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which permission string lets a user edit students in the `students` app?',
      options: ['students.edit_student', 'students.change_student', 'student.change', 'change_students.student'],
      answer: 1,
      explain: 'Django creates four permissions per model: `add_`, `change_`, `delete_`, `view_` + model name. The full string is `app_label.codename`: `students.change_student`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the model Meta to add a custom permission "Can publish results" with codename `publish_result`:\n\n```\nclass Result(models.Model):\n    ...\n    class Meta:\n        ______\n```',
      accept: ["permissions = [('publish_result', 'Can publish results')]", 'permissions = [("publish_result", "Can publish results")]', "permissions = (('publish_result', 'Can publish results'),)", 'permissions = (("publish_result", "Can publish results"),)'],
      explain: '`permissions` is a list of `(codename, human name)` tuples, created by `migrate`. Check it with `user.has_perm(\'results.publish_result\')` or `@permission_required(\'results.publish_result\')`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'A user gets all permissions of the groups they belong to',
        'Superusers pass every has_perm() check',
        'Inactive users (is_active=False) have no permissions',
        "In templates {% if perms.students.add_student %} hides the Add button for users without permission",
        'Hiding a button in the template is enough security',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Permissions = user permissions + group permissions; superusers have everything, inactive users nothing. Hiding UI is only cosmetic - the **view** must also check (`PermissionRequiredMixin`, `@permission_required`), otherwise users can type the URL directly.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `has_perm(user, perm, groups)` like Django\'s ModelBackend. `user` is a dict with `is_active`, `is_superuser`, `permissions` (list) and `groups` (list of names); `groups` maps group name → list of permission strings. Rules: inactive → False; active superuser → True; otherwise True if `perm` is in the user\'s own permissions or in any of their groups.',
      example: { title: 'collecting into a set', code: "perms = set(['a'])\nfor g in ['g1', 'g2']:\n    perms |= set(GROUPS.get(g, []))" },
      starter: `def has_perm(user, perm, groups):
    # TODO
    return False
`,
      solution: `def has_perm(user, perm, groups):
    if not user.get('is_active', True):
        return False
    if user.get('is_superuser'):
        return True
    perms = set(user.get('permissions', []))
    for g in user.get('groups', []):
        perms |= set(groups.get(g, []))
    return perm in perms
`,
      tests: [
        { call: "has_perm({'is_active': True, 'is_superuser': False, 'permissions': [], 'groups': ['Teachers']}, 'results.publish_result', {'Teachers': ['results.publish_result', 'students.view_student']})", expect: true },
        { call: "has_perm({'is_active': True, 'is_superuser': False, 'permissions': ['students.view_student'], 'groups': ['Office Staff']}, 'students.delete_student', {'Office Staff': ['fees.add_payment']})", expect: false },
        { call: "has_perm({'is_active': True, 'is_superuser': True, 'permissions': [], 'groups': []}, 'anything.at_all', {})", expect: true },
        { call: "has_perm({'is_active': False, 'is_superuser': True, 'permissions': ['students.view_student'], 'groups': []}, 'students.view_student', {})", expect: false },
        { call: "has_perm({'is_active': True, 'is_superuser': False, 'permissions': ['fees.add_payment'], 'groups': ['Ghost']}, 'fees.add_payment', {})", expect: true },
      ],
      explain: 'Assign permissions to **groups** (Teachers, Office Staff) and users to groups - managing 3 roles is much easier than 300 users. The order of checks matters: an inactive superuser must still be denied.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Object-level rule: teachers may edit only the results of **their own** classes, the principal may edit all. Write `editable_results(user, results)` (like `get_queryset()` in an UpdateView) returning the ids the user may edit, and `can_edit(user, result)` returning True/False. `user` = `{\'username\', \'role\', \'classes\': [...]}`; a result = `{\'id\', \'class_name\'}`.',
      example: { title: 'filtering the queryset by owner', code: "def get_queryset(self):\n    return Result.objects.filter(class_name__in=self.request.user.classes)" },
      starter: `def can_edit(user, result):
    # TODO
    return False

def editable_results(user, results):
    # TODO
    return []
`,
      solution: `def can_edit(user, result):
    if user.get('role') == 'principal':
        return True
    return user.get('role') == 'teacher' and result['class_name'] in user.get('classes', [])

def editable_results(user, results):
    return [r['id'] for r in results if can_edit(user, r)]
`,
      tests: [
        { call: "editable_results({'username': 'meena', 'role': 'teacher', 'classes': ['10A', '10B']}, [{'id': 1, 'class_name': '10A'}, {'id': 2, 'class_name': '9C'}, {'id': 3, 'class_name': '10B'}])", expect: [1, 3] },
        { call: "editable_results({'username': 'boss', 'role': 'principal', 'classes': []}, [{'id': 1, 'class_name': '10A'}, {'id': 2, 'class_name': '9C'}])", expect: [1, 2] },
        { call: "can_edit({'username': 'asha', 'role': 'student', 'classes': ['10A']}, {'id': 1, 'class_name': '10A'})", expect: false },
      ],
      explain: 'Model permissions answer "can this user change results **at all**?"; object rules answer "**this** result?". Filtering in `get_queryset()` makes other objects 404, and `UserPassesTestMixin.test_func()` can call `can_edit(self.request.user, self.get_object())`.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.core.management import call_command
from django.contrib.auth.models import User, Group, Permission

call_command('migrate', verbosity=0)
teachers = Group.objects.create(name='Teachers')
teachers.permissions.add(Permission.objects.get(codename='view_user'))
asha = User.objects.create_user('asha', password='x')
asha.groups.add(teachers)
asha = User.objects.get(pk=asha.pk)
print(asha.has_perm('auth.view_user'), asha.has_perm('auth.delete_user'))
print(sorted(asha.get_group_permissions()))
asha.is_active = False
print(asha.has_perm('auth.view_user'))`,
      expected: "True False\n['auth.view_user']\nFalse",
      explain: 'Asha inherits `view_user` from the Teachers group. We reload her from the database because permissions are **cached** on the user object after the first check. Inactive users always get False.',
    },
  ],
};
