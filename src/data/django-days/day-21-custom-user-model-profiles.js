export default {
  id: 'day-21-custom-user-model-profiles',
  title: 'Custom User Model, Profiles',
  module: 'Module 4: Authentication & Security',
  day: 21,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Replace Django\'s default User with a custom user model (email login, role field), register it in the admin, and attach a one-to-one Profile created automatically with a signal. This is the recommended way to start every real project.',
  objectives: [
    'Explain why a custom user model should be created at the start of a project',
    'Create a custom user with AbstractUser and with AbstractBaseUser + PermissionsMixin',
    'Write a custom UserManager with create_user and create_superuser',
    'Reference the user correctly with settings.AUTH_USER_MODEL and get_user_model()',
    'Build a Profile model (OneToOne) with auto creation and an edit page',
  ],
  theory: [
    {
      heading: 'Why a custom user model?',
      content: 'The built-in auth.User has username, email, first_name, last_name, password and flags. Real projects often need login by email, a phone number or a role (student, teacher, admin). Changing AUTH_USER_MODEL after the first migration is very hard because many tables already point to auth_user. So Django\'s official advice: ALWAYS create a custom user model when starting a new project, even if it is identical to the default for now.',
      points: [
        'Set AUTH_USER_MODEL = "accounts.User" BEFORE the first python manage.py migrate',
        'If you already migrated in development: delete db and migrations, then recreate (dev only)',
        'Never import User directly in other apps; use settings.AUTH_USER_MODEL in models and get_user_model() in code',
      ],
    },
    {
      heading: 'AbstractUser vs AbstractBaseUser',
      content: 'AbstractUser is the full default user (username, names, email, is_staff, groups, permissions) that you can extend with extra fields. It is the easy, safe choice. AbstractBaseUser gives only password, last_login and is_active helpers; you define all fields, USERNAME_FIELD and a manager yourself. Add PermissionsMixin to get is_superuser, groups and user_permissions.',
      points: [
        'AbstractUser -> add fields like role, phone; keep username login',
        'AbstractUser + USERNAME_FIELD = "email" -> email login with little code (set username = None and a manager)',
        'AbstractBaseUser + PermissionsMixin -> full control, more code',
      ],
    },
    {
      heading: 'Custom manager',
      content: 'When you change the login field, you need a manager that knows how to create users and superusers. create_user normalizes the email and calls set_password(); create_superuser sets is_staff and is_superuser to True. createsuperuser command uses these methods.',
      syntax: `class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user`,
    },
    {
      heading: 'Profile model: OneToOneField',
      content: 'Keep the user table small (login data) and put extra personal information in a Profile model linked by OneToOneField. Each user has exactly one profile, accessed as user.profile. Create the profile automatically with a post_save signal so it always exists.',
      syntax: `class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)`,
      tip: 'Custom user fields vs profile: put fields you need on every request (role, email) on the user; put optional, large or app-specific data in the profile.',
    },
    {
      heading: 'Forms and admin for the custom user',
      content: 'UserCreationForm and UserChangeForm are bound to the default User. Subclass them and set Meta.model = User (your model). In admin.py register your model with a subclass of UserAdmin so passwords are hashed and the change-password link works. If you removed username, update ordering, list_display, fieldsets and add_fieldsets.',
    },
  ],
  examples: [
    {
      title: 'Custom user with email login and role (AbstractUser)',
      scenario: 'The Student Portal must log users in by email and know whether they are a student, teacher or office staff.',
      steps: [
        'Start a fresh project or reset the dev database (delete db.sqlite3 or drop the MySQL schema and old migrations)',
        'VS Code / PyCharm terminal: python manage.py startapp accounts (if not created on Day 20)',
        'Write accounts/managers.py and accounts/models.py',
        'In portal/settings.py set AUTH_USER_MODEL = "accounts.User" before migrating',
        'Run python manage.py makemigrations accounts, python manage.py migrate, python manage.py createsuperuser',
        'PyCharm tip: Tools > Run manage.py Task... gives auto-complete for these commands',
      ],
      code: `# accounts/managers.py
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        TEACHER = "TEACHER", "Teacher"
        STAFF = "STAFF", "Office Staff"
        ADMIN = "ADMIN", "Admin"

    username = None                                  # remove username
    email = models.EmailField("email address", unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    phone = models.CharField(max_length=15, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []                             # asked by createsuperuser besides email/password

    objects = UserManager()

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    def __str__(self):
        return self.email


# portal/settings.py
AUTH_USER_MODEL = "accounts.User"

# Linking other models to the user (students/models.py)
from django.conf import settings

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                null=True, blank=True, related_name="student")
    ...

# Terminal
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
# Email address: admin@portal.com
# Password: ********`,
      result: 'Migrations create table accounts_user (no username column). createsuperuser asks only for Email address and Password. Logging into /admin/ uses the email.',
      explanation: 'Because USERNAME_FIELD = "email", authenticate(request, username="admin@portal.com", password=...) works: the keyword is still "username" but it is matched against the email field.',
    },
    {
      title: 'Forms and admin for the custom user',
      scenario: 'Admins must add users with a role from /admin/, and the signup page must use the new model.',
      steps: [
        'Create accounts/forms.py with CustomUserCreationForm and CustomUserChangeForm',
        'Register the model in accounts/admin.py using a UserAdmin subclass',
        'Update SignUpView from Day 20 to use CustomUserCreationForm',
        'Run the server and add a teacher from /admin/accounts/user/add/',
      ],
      code: `# accounts/forms.py
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "phone")


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "phone", "role")


# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ("email", "first_name", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "role", "password1", "password2", "is_staff", "is_active"),
        }),
    )


# accounts/views.py
class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    template_name = "accounts/signup.html"
    success_url = reverse_lazy("students:home")

    def form_valid(self, form):
        response = super().form_valid(form)
        login(self.request, self.object, backend="django.contrib.auth.backends.ModelBackend")
        return response`,
      result: 'Admin user list shows columns Email, First name, Role, Staff status, Active, with a Role filter on the right. Signup creates a user with role STUDENT by default.',
      explanation: 'The default UserAdmin refers to username; overriding ordering, fieldsets and add_fieldsets avoids FieldError. When several backends are configured, login() needs the backend argument.',
    },
    {
      title: 'Profile with automatic creation and edit page',
      scenario: 'Every user gets a profile with bio, date of birth, address and avatar that they can edit at /accounts/profile/.',
      steps: [
        'Add Profile to accounts/models.py and run makemigrations + migrate',
        'Create accounts/signals.py and connect it in accounts/apps.py ready()',
        'Create ProfileForm and a ProfileUpdateView that edits request.user.profile',
        'Create templates/accounts/profile_form.html and test at /accounts/profile/',
        'For existing users, create profiles once in the shell (see bottom of code)',
      ],
      code: `# accounts/models.py
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


# accounts/signals.py
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


# accounts/apps.py
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        from . import signals  # noqa: F401  (registers the receivers)


# accounts/forms.py
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["bio", "date_of_birth", "address", "avatar"]
        widgets = {"date_of_birth": forms.DateInput(attrs={"type": "date"})}


# accounts/views.py
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import UpdateView


class ProfileUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    form_class = ProfileForm
    template_name = "accounts/profile_form.html"
    success_url = reverse_lazy("profile")
    success_message = "Profile updated."

    def get_object(self, queryset=None):
        return self.request.user.profile        # always the logged-in user's profile


# accounts/urls.py
path("profile/", ProfileUpdateView.as_view(), name="profile"),

<!-- templates/accounts/profile_form.html -->
{% extends "base.html" %}
{% block content %}
  <h2>{{ user.get_full_name|default:user.email }}</h2>
  {% if user.profile.avatar %}<img src="{{ user.profile.avatar.url }}" width="120">{% endif %}
  <form method="post" enctype="multipart/form-data">
    {% csrf_token %}{{ form.as_p }}<button>Save</button>
  </form>
{% endblock %}

# One-time fix for users created before the signal existed
python manage.py shell
>>> from accounts.models import User, Profile
>>> for u in User.objects.filter(profile__isnull=True):
...     Profile.objects.create(user=u)`,
      result: 'Creating user ravi@portal.com automatically creates his Profile row. /accounts/profile/ shows his form; saving shows "Profile updated." Ravi can never edit another user\'s profile because get_object() ignores the URL.',
      explanation: 'get_object() returning request.user.profile is the safest pattern for "my profile" pages: there is no pk in the URL to tamper with.',
    },
  ],
  interview: [
    { q: 'Why should you set a custom user model at the start of a project?', a: 'Many tables (admin log, permissions, your FKs) reference the user table from the first migration. Swapping AUTH_USER_MODEL later requires complex manual data and schema migrations.', level: 'Medium' },
    { q: 'AbstractUser vs AbstractBaseUser?', a: 'AbstractUser includes all default user fields and permissions; you add more. AbstractBaseUser provides only password and last_login logic; you define every field, USERNAME_FIELD and a manager, and usually add PermissionsMixin.', level: 'Medium' },
    { q: 'What is USERNAME_FIELD?', a: 'The field used as the unique identifier for login, e.g. "email". It must be unique.', level: 'Easy' },
    { q: 'What is REQUIRED_FIELDS?', a: 'Extra fields createsuperuser prompts for. It must not include USERNAME_FIELD or password.', level: 'Medium' },
    { q: 'How should other models reference the user?', a: 'ForeignKey(settings.AUTH_USER_MODEL, ...) in models, and get_user_model() in runtime code, never a direct import of auth.User.', level: 'Easy' },
    { q: 'Why do we need a custom manager?', a: 'createsuperuser and create_user must know which field identifies the user and must hash the password and set staff flags correctly.', level: 'Medium' },
    { q: 'What is the role of PermissionsMixin?', a: 'It adds is_superuser, groups, user_permissions and methods like has_perm() to a model based on AbstractBaseUser.', level: 'Medium' },
    { q: 'User fields vs Profile model — how to decide?', a: 'Auth-related and frequently used data (email, role) goes on the user; optional or app-specific data (bio, address, avatar) goes in a OneToOne profile to keep the user table lean.', level: 'Medium' },
    { q: 'How is a profile created automatically?', a: 'A post_save receiver on AUTH_USER_MODEL creates Profile when created=True; the receiver module is imported in AppConfig.ready().', level: 'Easy' },
    { q: 'How do you switch to a custom user model in an existing production project?', a: 'Hard: create the model with db_table="auth_user" or migrate data manually, fake initial migrations and fix FKs. Best avoided by starting with a custom model.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a property full_name on the custom User returning "First Last" or the email.',
      hint: 'Use get_full_name().',
      solution: `@property
def full_name(self):
    return self.get_full_name() or self.email`,
    },
    {
      task: 'Create a helper is_student() check that a view can use with UserPassesTestMixin.',
      hint: 'Compare role.',
      solution: `class StudentOnlyMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.role == "STUDENT"`,
    },
    {
      task: 'Write a shell command to create a teacher user.',
      hint: 'Use get_user_model().objects.create_user.',
      solution: `from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_user("meena@portal.com", "Meena@123", role="TEACHER", first_name="Meena")`,
    },
    {
      task: 'Show the user role in the navbar of base.html.',
      hint: 'Use get_role_display.',
      solution: `{% if user.is_authenticated %}{{ user.email }} ({{ user.get_role_display }}){% endif %}`,
    },
    {
      task: 'Add an inline Profile editor to the User admin page.',
      hint: 'StackedInline with can_delete False.',
      solution: `class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [ProfileInline]
    ...`,
    },
  ],
  quiz: [
    { question: 'Which setting points Django to your custom user model?', options: ['USER_MODEL', 'CUSTOM_USER', 'AUTH_USER_MODEL', 'AUTH_MODEL'], answer: 2, explanation: 'AUTH_USER_MODEL = "app_label.ModelName".' },
    { question: 'Which class gives you the full default user that you can extend?', options: ['AbstractUser', 'AbstractBaseUser', 'BaseUserManager', 'PermissionsMixin'], answer: 0, explanation: 'AbstractUser includes all default fields.' },
    { question: 'To log in with email you set:', options: ['LOGIN_FIELD = "email"', 'USERNAME_FIELD = "email"', 'EMAIL_LOGIN = True', 'REQUIRED_FIELDS = ["email"]'], answer: 1, explanation: 'USERNAME_FIELD names the identifying field.' },
    { question: 'In another app\'s model, a FK to the user should use:', options: ['from django.contrib.auth.models import User', '"auth.User"', 'get_user_model() at class level always', 'settings.AUTH_USER_MODEL'], answer: 3, explanation: 'The setting string works even before the model is loaded.' },
    { question: 'Each user has exactly one profile. Which field fits?', options: ['ForeignKey', 'ManyToManyField', 'OneToOneField', 'GenericForeignKey'], answer: 2, explanation: 'OneToOneField enforces a unique one-to-one link.' },
  ],
};
