export default {
  lesson: 'day-21-custom-user-model-profiles',
  minutes: 30,
  intro: 'Practise custom user models (AbstractUser vs AbstractBaseUser), AUTH_USER_MODEL, get_user_model(), custom managers and Profile models, and write a user manager in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'When should you create a custom user model?',
      options: ['Only when the project is finished', 'At the very start of the project, before the first migrate', 'Never, the default User is always enough', 'After going to production'],
      answer: 1,
      explain: 'Django recommends a custom user model **for every new project**, created before the first `migrate`. Switching later is painful because many tables (admin log, auth groups, your FKs) already point to `auth_user`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the setting that tells Django to use `User` from the `accounts` app:\n\n```\n______ = \'accounts.User\'\n```',
      accept: ['AUTH_USER_MODEL'],
      caseSensitive: true,
      explain: '`AUTH_USER_MODEL = \'accounts.User\'` (app_label.ModelName). In models refer to it with `settings.AUTH_USER_MODEL` (e.g. `ForeignKey(settings.AUTH_USER_MODEL, ...)`), and in other code with `get_user_model()` - never import `django.contrib.auth.models.User` directly.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'AbstractUser keeps username, first_name, is_staff etc. and lets you add fields like role or phone',
        'AbstractBaseUser + PermissionsMixin gives full control (e.g. email login) but you write the fields and a manager',
        'USERNAME_FIELD = "email" makes email the login field (it must be unique)',
        'create_user() must call set_password() so the password is hashed',
        'A Profile model usually uses ForeignKey(User) so a user can have many profiles',
      ],
      answers: [0, 1, 2, 3],
      explain: 'AbstractUser = "default user + my fields". AbstractBaseUser = "only password + last_login, I define the rest". The manager must hash passwords with `set_password`. A profile is **one per user**, so it uses `OneToOneField(settings.AUTH_USER_MODEL, ...)`, often created by a `post_save` signal.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write a `UserManager` for an email-login user, working on a dict `self.users` keyed by email:\n- `normalize_email(email)` lower-cases the **domain** part only (`Asha@GMAIL.com` → `Asha@gmail.com`)\n- `create_user(email, password, **extra)` → error string `\'error: email required\'` if empty; `\'error: email exists\'` if already present; else store and return `{\'email\', \'password\': \'hashed:\' + password[::-1], \'is_staff\': False, \'is_superuser\': False, **extra}`\n- `create_superuser(email, password)` → like create_user with `is_staff=True, is_superuser=True`',
      example: { title: 'Django\'s create_superuser', code: "def create_superuser(self, email, password=None, **extra):\n    extra.setdefault('is_staff', True)\n    extra.setdefault('is_superuser', True)\n    return self.create_user(email, password, **extra)" },
      starter: `class UserManager:
    def __init__(self):
        self.users = {}

    def normalize_email(self, email):
        return email

    # TODO: create_user, create_superuser
`,
      solution: `class UserManager:
    def __init__(self):
        self.users = {}

    def normalize_email(self, email):
        local, sep, domain = email.strip().rpartition('@')
        return f'{local}@{domain.lower()}' if sep else email.strip()

    def create_user(self, email, password, **extra):
        if not email:
            return 'error: email required'
        email = self.normalize_email(email)
        if email in self.users:
            return 'error: email exists'
        user = {'email': email, 'password': 'hashed:' + password[::-1], 'is_staff': False, 'is_superuser': False, **extra}
        self.users[email] = user
        return user

    def create_superuser(self, email, password):
        return self.create_user(email, password, is_staff=True, is_superuser=True)
`,
      tests: [
        { call: "UserManager().normalize_email('Asha.Patil@GMAIL.COM')", expect: 'Asha.Patil@gmail.com' },
        { call: "UserManager().create_user('asha@Portal.IN', 'pw1', role='student')", expect: { email: 'asha@portal.in', password: 'hashed:1wp', is_staff: false, is_superuser: false, role: 'student' } },
        { call: "(lambda m: (m.create_user('ravi@x.in', 'a'), m.create_user('ravi@X.IN', 'b'))[1])(UserManager())", expect: 'error: email exists' },
        { call: "UserManager().create_user('', 'pw')", expect: 'error: email required' },
        { call: "(lambda u: [u['is_staff'], u['is_superuser']])(UserManager().create_superuser('admin@portal.in', 'Adm!n123'))", expect: [true, true] },
      ],
      explain: 'Django\'s `BaseUserManager.normalize_email` lower-cases only the domain (the local part can be case-sensitive in theory). `create_superuser` reuses `create_user` with staff flags. The real manager calls `user.set_password(password)` - never store the raw value.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project that still uses the default user model)',
      code: `from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser, AbstractBaseUser

User = get_user_model()
print(settings.AUTH_USER_MODEL, User.__name__)
print(User.USERNAME_FIELD, issubclass(User, AbstractUser), issubclass(User, AbstractBaseUser))
print(sorted(f.name for f in AbstractBaseUser._meta.fields))`,
      expected: "auth.User User\nusername True True\n['last_login', 'password']",
      explain: '`get_user_model()` returns whatever `AUTH_USER_MODEL` points to (default `auth.User`). The default User extends AbstractUser, which extends AbstractBaseUser. AbstractBaseUser only provides `password` and `last_login` - everything else is yours to define.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Profiles are created automatically by a `post_save` signal. Write `on_user_saved(user, created, profiles)` that creates `profiles[user[\'email\']] = {\'user\': email, \'bio\': \'\', \'photo\': None}` only when `created` is True **and** no profile exists yet. Return `\'created\'` or `\'skipped\'`.',
      example: { title: 'the real signal', code: "@receiver(post_save, sender=settings.AUTH_USER_MODEL)\ndef create_profile(sender, instance, created, **kwargs):\n    if created:\n        Profile.objects.get_or_create(user=instance)" },
      starter: `def on_user_saved(user, created, profiles):
    # TODO
    return 'skipped'
`,
      solution: `def on_user_saved(user, created, profiles):
    email = user['email']
    if created and email not in profiles:
        profiles[email] = {'user': email, 'bio': '', 'photo': None}
        return 'created'
    return 'skipped'
`,
      tests: [
        { call: "(lambda p: (on_user_saved({'email': 'asha@x.in'}, True, p), p))({})", expect: ['created', { 'asha@x.in': { user: 'asha@x.in', bio: '', photo: null } }] },
        { call: "on_user_saved({'email': 'asha@x.in'}, False, {})", expect: 'skipped', msg: 'Updating an existing user must not create a profile' },
        { call: "on_user_saved({'email': 'asha@x.in'}, True, {'asha@x.in': {'bio': 'hi'}})", expect: 'skipped' },
      ],
      explain: '`post_save` fires on **every** save, so check `created` - otherwise each profile edit would try to create another profile (IntegrityError on the OneToOne). `get_or_create` makes it safe even if a profile already exists (e.g. created by a fixture).',
    },
  ],
};
