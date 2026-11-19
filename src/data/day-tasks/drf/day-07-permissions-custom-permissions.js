export default {
  lesson: 'day-07-permissions-custom-permissions',
  minutes: 30,
  intro: 'Practise built-in permission classes, custom has_permission / has_object_permission, combining permissions and per-action permissions, and write the permission logic in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which built-in permission lets anyone **read** (GET/HEAD/OPTIONS) but only logged-in users **write**?',
      options: ['AllowAny', 'IsAuthenticated', 'IsAuthenticatedOrReadOnly', 'IsAdminUser'],
      answer: 2,
      explain: '**IsAuthenticatedOrReadOnly** allows SAFE_METHODS for everyone and other methods only for authenticated users - perfect for a public book catalogue where only members can post reviews. `IsAdminUser` checks `user.is_staff`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the object-level check of `IsOwnerOrReadOnly`:\n\n```\nclass IsOwnerOrReadOnly(permissions.BasePermission):\n    def has_object_permission(self, request, view, obj):\n        if request.method in permissions.SAFE_METHODS:\n            return True\n        return ______\n```',
      accept: ['obj.owner == request.user', 'request.user == obj.owner', 'obj.owner_id == request.user.id', 'obj.user == request.user', 'request.user == obj.user'],
      explain: 'Reads are allowed to all; writes only when the object\'s owner is the requesting user. Note: `has_object_permission` runs only when the view calls `get_object()` (retrieve/update/destroy) - **not** for list views, so filter lists in `get_queryset()`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'permission_classes = [IsAuthenticated & IsOwner] requires both',
        'permission_classes = [A, B] (a list) means A OR B',
        '~IsAdminUser means "not an admin"',
        'get_permissions() can return different permissions for list/create/destroy',
        'If has_permission returns False for an anonymous user (with Token/JWT auth), DRF returns 401',
      ],
      answers: [0, 2, 3, 4],
      explain: 'A **list** of permission classes means **all** must pass (AND). Operators `&`, `|`, `~` build combined permissions. `get_permissions()` checks `self.action` to vary per action. Denied + not authenticated → 401 (if the auth class has a `WWW-Authenticate` header); denied + authenticated → 403.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `check(method, user, obj=None, role_needed=None)` that runs the DRF permission flow and returns the status code (`200`, `401` or `403`). `user` is `None` (anonymous) or a dict like `{\'id\': 1, \'is_staff\': False, \'role\': \'student\'}`; `obj` (optional) is a dict with `owner_id`.\n1. **has_permission** (IsAuthenticatedOrReadOnly): safe methods (`GET`, `HEAD`, `OPTIONS`) always pass; unsafe methods need a user, else `401`\n2. if `role_needed` and the user\'s role differs (and they are not staff) → `403` (for unsafe methods only)\n3. **has_object_permission** (IsOwnerOrReadOnly + admin override): if `obj` is given and the method is unsafe, only the owner or staff may continue, else `403`',
      example: { title: 'safe methods', code: "SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')\nprint('PATCH' in SAFE_METHODS)   # False" },
      starter: `SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')

def check(method, user, obj=None, role_needed=None):
    # TODO
    return 200
`,
      solution: `SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')

def check(method, user, obj=None, role_needed=None):
    if method in SAFE_METHODS:
        return 200
    if user is None:
        return 401
    staff = user.get('is_staff', False)
    if role_needed and user.get('role') != role_needed and not staff:
        return 403
    if obj is not None and obj['owner_id'] != user['id'] and not staff:
        return 403
    return 200
`,
      tests: [
        { call: "check('GET', None, {'owner_id': 1})", expect: 200 },
        { call: "check('POST', None)", expect: 401 },
        { call: "check('POST', {'id': 2, 'role': 'student'})", expect: 200 },
        { call: "check('DELETE', {'id': 2, 'role': 'student'}, {'owner_id': 1})", expect: 403 },
        { call: "check('PATCH', {'id': 1, 'role': 'student'}, {'owner_id': 1})", expect: 200 },
        { call: "check('DELETE', {'id': 9, 'is_staff': True, 'role': 'admin'}, {'owner_id': 1})", expect: 200 },
        { call: "check('POST', {'id': 3, 'role': 'student'}, None, 'teacher')", expect: 403 },
        { call: "check('POST', {'id': 4, 'role': 'teacher'}, None, 'teacher')", expect: 200 },
      ],
      explain: 'DRF first runs `has_permission` for every request (view level), then `has_object_permission` when `get_object()` loads an object. Anonymous + denied → 401 ("log in"), logged in + denied → 403 ("not allowed"). Safe methods short-circuit for read-only APIs.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `permissions_for(action)` - the body of a ViewSet\'s `get_permissions()` returning permission class **names**:\n- `list`, `retrieve` → `[\'AllowAny\']`\n- `create` → `[\'IsAuthenticated\']`\n- `update`, `partial_update` → `[\'IsAuthenticated\', \'IsOwner\']`\n- `destroy` → `[\'IsAdminUser\']`\n- anything else → `[\'IsAuthenticated\']` (safe default)',
      example: { title: 'get_permissions in a ViewSet', code: "def get_permissions(self):\n    if self.action == 'list':\n        return [AllowAny()]\n    return [IsAuthenticated()]" },
      starter: `def permissions_for(action):
    # TODO
    return []
`,
      solution: `def permissions_for(action):
    if action in ('list', 'retrieve'):
        return ['AllowAny']
    if action == 'create':
        return ['IsAuthenticated']
    if action in ('update', 'partial_update'):
        return ['IsAuthenticated', 'IsOwner']
    if action == 'destroy':
        return ['IsAdminUser']
    return ['IsAuthenticated']
`,
      tests: [
        { call: "permissions_for('list')", expect: ['AllowAny'] },
        { call: "permissions_for('retrieve')", expect: ['AllowAny'] },
        { call: "permissions_for('create')", expect: ['IsAuthenticated'] },
        { call: "permissions_for('partial_update')", expect: ['IsAuthenticated', 'IsOwner'] },
        { call: "permissions_for('destroy')", expect: ['IsAdminUser'] },
        { call: "permissions_for('publish')", expect: ['IsAuthenticated'], msg: 'Unknown/custom actions must fall back to a safe default' },
      ],
      explain: 'Real code returns **instances**: `return [IsAuthenticated(), IsOwner()]`. Defaulting to the restrictive option means a new `@action` you forget to list is protected, not public - "secure by default".',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from types import SimpleNamespace
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

perm = IsOwnerOrReadOnly()
book = SimpleNamespace(owner='asha')
for method, user in [('GET', 'ravi'), ('PUT', 'ravi'), ('DELETE', 'asha')]:
    req = SimpleNamespace(method=method, user=user)
    print(method, user, perm.has_permission(req, None), perm.has_object_permission(req, None, book))
combined = (permissions.IsAuthenticated | permissions.IsAdminUser)()
print(type(combined).__name__)`,
      expected: 'GET ravi True True\nPUT ravi True False\nDELETE asha True True\nOR',
      explain: '`BasePermission.has_permission` returns True by default, so only the object check decides here: anyone may GET, only the owner may PUT/DELETE. Combining classes with `|` creates an `OR` permission object (`&` → `AND`, `~` → `NOT`).',
    },
  ],
};
