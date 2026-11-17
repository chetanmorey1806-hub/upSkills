export default {
  id: "day-02-serializers-modelserializers-validation",
  title: "Serializers and ModelSerializers, Validation",
  module: "Module 1: DRF Basics",
  day: 2,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn how DRF serializers convert model instances to JSON and validate incoming JSON before saving. Build a Serializer by hand, then the shorter ModelSerializer, and add field-level, object-level and validator-based validation.",
  objectives: [
    "Explain serialization and deserialization and the role of a DRF serializer",
    "Write a plain Serializer with create() and update() methods",
    "Use ModelSerializer with fields, exclude, read_only_fields and extra_kwargs",
    "Validate data with validate_<field>(), validate() and reusable validators (UniqueValidator)",
    "Use is_valid(), errors, validated_data, save() and partial=True correctly",
  ],
  theory: [
    {
      heading: "What is a Serializer?",
      content: "A serializer is a translator standing between your Django models and the outside world. On the way OUT (serialization), it turns a model instance or QuerySet into Python primitives (dict, list, str, int) that DRF renders as JSON. On the way IN (deserialization), it takes JSON data from the client, checks every field (type, length, required, custom rules) and, if valid, creates or updates a model instance. Think of an airport security check: luggage (data) is checked before it is allowed onto the plane (database). A DRF serializer works much like a Django Form, but for JSON.",
      points: [
        "Serialization: instance -> serializer.data -> JSON response",
        "Deserialization: request JSON -> serializer(data=...) -> is_valid() -> validated_data -> save()",
        "Two styles: serializers.Serializer (write every field) and serializers.ModelSerializer (fields auto-generated from the model)",
      ],
    },
    {
      heading: "The Serializer Workflow (must memorise)",
      content: "Every serializer usage follows one of three patterns. Reading: pass an instance (or many=True for a QuerySet) and read .data. Creating: pass data=, call is_valid(), then save() which calls create(). Updating: pass both instance and data, call is_valid(), then save() which calls update(). Accessing .data before calling is_valid() on input data raises an AssertionError.",
      syntax: `# READ one / many
s = BookSerializer(book)                     ; s.data
s = BookSerializer(Book.objects.all(), many=True) ; s.data

# CREATE
s = BookSerializer(data=request.data)
if s.is_valid():
    s.save()          # calls create(validated_data)
else:
    s.errors          # dict of field -> list of messages

# UPDATE (full) / PARTIAL UPDATE
s = BookSerializer(book, data=request.data)               # PUT
s = BookSerializer(book, data=request.data, partial=True) # PATCH
s.is_valid(raise_exception=True)   # auto 400 response inside DRF views
s.save()                            # calls update(instance, validated_data)`,
      tip: "is_valid(raise_exception=True) is the cleanest style in views: DRF converts the ValidationError into a 400 response with the errors dict automatically.",
    },
    {
      heading: "Serializer Fields and Core Arguments",
      content: "Serializer fields look like model fields: CharField, IntegerField, DecimalField, BooleanField, DateField, DateTimeField, EmailField, URLField, ChoiceField, ListField, SerializerMethodField and more. Every field accepts core arguments that control how it behaves.",
      points: [
        "read_only=True: shown in output, ignored in input (e.g. id, created_at)",
        "write_only=True: accepted in input, never shown in output (e.g. password)",
        "required=False: field may be missing in input",
        "allow_null=True / allow_blank=True: accept null / empty string",
        "default=value: used when the field is missing",
        "source='author.name': read the value from another attribute or dotted path",
        "max_length, min_length, min_value, max_value: built-in checks",
        "SerializerMethodField(): read-only value computed by get_<field_name>(self, obj)",
      ],
    },
    {
      heading: "ModelSerializer: Less Code",
      content: "ModelSerializer looks at your model and auto-creates fields, validators (like unique) and default create() / update() methods. You only write a Meta class with model and fields. Use fields = '__all__' for quick demos, but in real projects list fields explicitly so a new sensitive column (like is_staff) is never leaked by accident.",
      syntax: `class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "author", "price", "isbn"]   # or "__all__"
        # exclude = ["created_at"]          # alternative to fields
        read_only_fields = ["id"]
        extra_kwargs = {"isbn": {"required": False}}`,
      tip: "print(repr(BookSerializer())) in python manage.py shell shows exactly which fields and validators ModelSerializer generated. Great for debugging.",
    },
    {
      heading: "Three Levels of Validation",
      content: "DRF runs validation in this order: (1) field-level built-in checks (type, max_length, required), plus any validators=[...] on a field; (2) your validate_<field_name>(self, value) methods, one per field, which must return the (possibly cleaned) value or raise serializers.ValidationError; (3) the object-level validate(self, attrs) method which sees all fields together, for rules like 'end_date must be after start_date'. Errors from validate() appear under the key non_field_errors.",
      points: [
        "Field-level: def validate_price(self, value): ... return value",
        "Object-level: def validate(self, attrs): ... return attrs",
        "Reusable: validators=[UniqueValidator(queryset=Book.objects.all())] or a plain function",
        "Raise serializers.ValidationError('message') — never return False",
        "Forgetting to return value/attrs is the #1 mistake: the field becomes None",
      ],
    },
    {
      heading: "Common Mistakes",
      content: "Freshers often hit the same issues on Day 2. Learn them now to save hours of debugging.",
      points: [
        "Calling serializer.data before is_valid() when you passed data= (AssertionError)",
        "Forgetting many=True for a QuerySet ('QuerySet' object has no attribute 'title')",
        "Forgetting to return value in validate_<field>",
        "Using fields='__all__' and exposing a password hash",
        "Sending PATCH without partial=True so missing required fields give 400",
        "Passing the request object as data instead of request.data",
      ],
    },
  ],
  examples: [
    {
      title: "A Plain Serializer with create() and update()",
      scenario: "Understand what ModelSerializer hides by writing a Book serializer by hand and using it in the Django shell.",
      steps: [
        "Open VS Code / PyCharm in the library_api project from Day 1",
        "Create books/serializers.py and paste the code",
        "Run python manage.py shell",
        "Type the shell commands shown below line by line",
      ],
      code: `# books/models.py
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# python manage.py makemigrations && python manage.py migrate


# books/serializers.py
from rest_framework import serializers
from .models import Book


class BookPlainSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=200)
    author = serializers.CharField(max_length=100)
    isbn = serializers.CharField(max_length=13)
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    in_stock = serializers.BooleanField(default=True)

    def create(self, validated_data):
        return Book.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance


# python manage.py shell
>>> from books.serializers import BookPlainSerializer
>>> s = BookPlainSerializer(data={"title": "Clean Code", "author": "Robert Martin",
...                               "isbn": "9780132350884", "price": "450"})
>>> s.is_valid()
True
>>> book = s.save()
>>> BookPlainSerializer(book).data
>>> bad = BookPlainSerializer(data={"title": "", "price": "abc"})
>>> bad.is_valid()
False
>>> bad.errors`,
      result: `>>> BookPlainSerializer(book).data
{'id': 1, 'title': 'Clean Code', 'author': 'Robert Martin', 'isbn': '9780132350884', 'price': '450.00', 'in_stock': True}

>>> bad.errors
{'title': [ErrorDetail(string='This field may not be blank.', code='blank')],
 'author': [ErrorDetail(string='This field is required.', code='required')],
 'isbn': [ErrorDetail(string='This field is required.', code='required')],
 'price': [ErrorDetail(string='A valid number is required.', code='invalid')]}`,
      explanation: "save() decides between create() and update() based on whether an instance was passed. Errors are collected for ALL fields at once, so the client can fix everything in one go. Notice price comes back as the string '450.00' — DRF renders Decimal as string by default (COERCE_DECIMAL_TO_STRING) to avoid float rounding.",
    },
    {
      title: "ModelSerializer with Field and Object Validation",
      scenario: "The library has rules: price must be positive, title cannot contain 'test', ISBN must be unique and 13 digits, and discount price must be lower than price.",
      steps: [
        "Add a discount_price field to Book (null=True, blank=True) and migrate",
        "Replace books/serializers.py with the ModelSerializer below",
        "Create the API view in books/views.py and the URL",
        "Send the POST requests in Postman or curl and observe 201 and 400 responses",
      ],
      code: `# books/models.py (add)
    discount_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)


# books/serializers.py
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Book


def isbn_13_digits(value):
    if not (value.isdigit() and len(value) == 13):
        raise serializers.ValidationError("ISBN must be exactly 13 digits.")


class BookSerializer(serializers.ModelSerializer):
    isbn = serializers.CharField(
        validators=[isbn_13_digits,
                    UniqueValidator(queryset=Book.objects.all(), message="ISBN already exists.")]
    )
    is_expensive = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ["id", "title", "author", "isbn", "price",
                  "discount_price", "in_stock", "is_expensive", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_is_expensive(self, obj):
        return obj.price > 500

    # field-level
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_title(self, value):
        if "test" in value.lower():
            raise serializers.ValidationError("Title cannot contain the word 'test'.")
        return value.strip().title()

    # object-level
    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        discount = attrs.get("discount_price")
        if discount is not None and price is not None and discount >= price:
            raise serializers.ValidationError("Discount price must be less than price.")
        return attrs


# books/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Book
from .serializers import BookSerializer


@api_view(["GET", "POST"])
def book_list(request):
    if request.method == "GET":
        serializer = BookSerializer(Book.objects.all(), many=True)
        return Response(serializer.data)
    serializer = BookSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# books/urls.py
path("books/", views.book_list, name="book-list"),


# ---- curl ----
curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" \\
  -d '{"title":"fluent python","author":"Luciano Ramalho","isbn":"9781492056355","price":"899.50","discount_price":"799"}'

curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" \\
  -d '{"title":"My test book","author":"X","isbn":"123","price":"-5"}'

curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" \\
  -d '{"title":"Atomic Habits","author":"James Clear","isbn":"9780735211292","price":"500","discount_price":"600"}'`,
      result: `1) HTTP 201 Created
{
    "id": 2,
    "title": "Fluent Python",
    "author": "Luciano Ramalho",
    "isbn": "9781492056355",
    "price": "899.50",
    "discount_price": "799.00",
    "in_stock": true,
    "is_expensive": true,
    "created_at": "2026-11-17T10:15:22.418Z"
}

2) HTTP 400 Bad Request
{
    "title": ["Title cannot contain the word 'test'."],
    "isbn": ["ISBN must be exactly 13 digits."],
    "price": ["Price must be greater than zero."]
}

3) HTTP 400 Bad Request
{
    "non_field_errors": ["Discount price must be less than price."]
}`,
      explanation: "validate_title also cleans the value (strip + title case) — whatever you return is stored in validated_data. Object-level errors appear under non_field_errors. validate() runs only if all field-level checks passed. self.instance is used so the rule also works for PATCH where price may not be sent.",
    },
    {
      title: "Partial Update, write_only Password and source",
      scenario: "Build a Member serializer for library members where the password is accepted but never returned, and the username is shown from the related User.",
      steps: [
        "Create a Member model with a OneToOne to django.contrib.auth User",
        "Write MemberSerializer and RegisterSerializer in books/serializers.py",
        "Test in python manage.py shell or via a view",
      ],
      code: `# books/models.py
from django.conf import settings


class Member(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=50, blank=True)


# books/serializers.py
from django.contrib.auth.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)   # hashes the password


class MemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Member
        fields = ["id", "username", "phone", "city"]


# shell
>>> s = RegisterSerializer(data={"username": "asha", "email": "asha@mail.com",
...                              "password": "secret123", "confirm_password": "secret123"})
>>> s.is_valid(); u = s.save(); s.data
>>> m = Member.objects.create(user=u, phone="9876543210", city="Pune")
>>> s2 = MemberSerializer(m, data={"city": "Mumbai"}, partial=True)
>>> s2.is_valid(); s2.save(); s2.data`,
      result: `>>> s.data
{'id': 1, 'username': 'asha', 'email': 'asha@mail.com'}

>>> s2.data
{'id': 1, 'username': 'asha', 'phone': '9876543210', 'city': 'Mumbai'}`,
      explanation: "write_only fields are never included in .data, so the password is safe. Raising ValidationError with a dict attaches the error to a specific field instead of non_field_errors. create_user() hashes the password — using User.objects.create() would store plain text, a serious bug. partial=True lets PATCH send only city.",
    },
    {
      title: "Pure Python Demo: A Mini Serializer with Validation",
      scenario: "See how is_valid(), errors and validated_data work internally by writing a tiny serializer with only the standard library.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `class ValidationError(Exception):
    pass


class MiniBookSerializer:
    required = ["title", "price"]

    def __init__(self, data):
        self.initial_data = data
        self.errors = {}
        self.validated_data = {}

    def validate_price(self, value):
        value = float(value)
        if value <= 0:
            raise ValidationError("Price must be greater than zero.")
        return value

    def validate_title(self, value):
        if not value.strip():
            raise ValidationError("This field may not be blank.")
        return value.strip().title()

    def is_valid(self):
        for field in self.required:
            if field not in self.initial_data:
                self.errors[field] = ["This field is required."]
                continue
            method = getattr(self, f"validate_{field}")
            try:
                self.validated_data[field] = method(self.initial_data[field])
            except (ValidationError, ValueError) as e:
                self.errors[field] = [str(e)]
        return not self.errors


for payload in [{"title": "  clean code ", "price": "450"},
                {"title": "", "price": "-1"},
                {"price": "abc"}]:
    s = MiniBookSerializer(payload)
    if s.is_valid():
        print("VALID  ", s.validated_data)
    else:
        print("INVALID", s.errors)`,
      python: {
        files: {
          "main.py": `class ValidationError(Exception):
    pass


class MiniBookSerializer:
    required = ["title", "price"]

    def __init__(self, data):
        self.initial_data = data
        self.errors = {}
        self.validated_data = {}

    def validate_price(self, value):
        value = float(value)
        if value <= 0:
            raise ValidationError("Price must be greater than zero.")
        return value

    def validate_title(self, value):
        if not value.strip():
            raise ValidationError("This field may not be blank.")
        return value.strip().title()

    def is_valid(self):
        for field in self.required:
            if field not in self.initial_data:
                self.errors[field] = ["This field is required."]
                continue
            method = getattr(self, f"validate_{field}")
            try:
                self.validated_data[field] = method(self.initial_data[field])
            except (ValidationError, ValueError) as e:
                self.errors[field] = [str(e)]
        return not self.errors


for payload in [{"title": "  clean code ", "price": "450"},
                {"title": "", "price": "-1"},
                {"price": "abc"}]:
    s = MiniBookSerializer(payload)
    if s.is_valid():
        print("VALID  ", s.validated_data)
    else:
        print("INVALID", s.errors)
`,
        },
      },
      result: `VALID   {'title': 'Clean Code', 'price': 450.0}
INVALID {'title': ['This field may not be blank.'], 'price': ['Price must be greater than zero.']}
INVALID {'title': ['This field is required.'], 'price': ["could not convert string to float: 'abc'"]}`,
      explanation: "This mirrors DRF: each field is checked, validate_<field> methods are discovered by name with getattr, all errors are collected in a dict, and only clean values go into validated_data.",
    },
  ],
  interview: [
    { q: "What is a serializer in DRF?", a: "A class that converts complex data like model instances and QuerySets into Python primitives that can be rendered as JSON (serialization), and parses and validates incoming data to create or update objects (deserialization).", level: "Easy" },
    { q: "Difference between Serializer and ModelSerializer?", a: "Serializer requires you to declare every field and write create()/update(). ModelSerializer auto-generates fields and validators from the model and provides default create() and update() implementations.", level: "Easy" },
    { q: "What is the order of validation in a DRF serializer?", a: "First field deserialization and field validators (type, required, max_length, validators=[]), then each validate_<field>() method, then the object-level validate(attrs). Model-level unique_together validators run as part of serializer validators.", level: "Medium" },
    { q: "What happens if you forget to return value in validate_price?", a: "The method returns None, so validated_data['price'] becomes None and saving will either fail with an IntegrityError or store null. Always return the value.", level: "Medium" },
    { q: "Difference between read_only and write_only?", a: "read_only fields appear in output but are ignored in input (id, created_at). write_only fields are accepted in input but never appear in output (password).", level: "Easy" },
    { q: "Why is fields = '__all__' discouraged in production?", a: "Any new model field, including sensitive ones, will be exposed automatically. Explicit field lists make the API contract stable and secure.", level: "Medium" },
    { q: "What is SerializerMethodField?", a: "A read-only field whose value comes from a method named get_<field_name>(self, obj). Used for computed values like full_name or is_expensive.", level: "Easy" },
    { q: "How do you perform a partial update with a serializer?", a: "Pass partial=True: Serializer(instance, data=request.data, partial=True). Required fields that are missing are then not reported as errors.", level: "Easy" },
    { q: "What does is_valid(raise_exception=True) do?", a: "If validation fails it raises serializers.ValidationError; DRF's exception handler turns it into a 400 Bad Request response with serializer.errors as the body.", level: "Medium" },
    { q: "Where do errors raised in validate() appear?", a: "Under the key non_field_errors (configurable with NON_FIELD_ERRORS_KEY), unless you raise ValidationError with a dict that maps to specific fields.", level: "Medium" },
    { q: "Why does DRF return DecimalField values as strings?", a: "Because COERCE_DECIMAL_TO_STRING is True by default, to avoid floating point precision loss in JSON. You can set coerce_to_string=False on the field or globally.", level: "Hard" },
    { q: "How does the source argument work?", a: "source tells the field which attribute to read, e.g. source='user.username' follows the relation, or source='get_full_name' calls a method. source='*' passes the whole object.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a StudentSerializer (ModelSerializer) for a Student model with name, email, age. Age must be between 16 and 60.",
      hint: "Use validate_age or extra_kwargs with min_value/max_value.",
      solution: `class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "email", "age"]

    def validate_age(self, value):
        if not 16 <= value <= 60:
            raise serializers.ValidationError("Age must be between 16 and 60.")
        return value`,
    },
    {
      task: "Add a read-only field full_name to an Employee serializer built from first_name and last_name.",
      hint: "SerializerMethodField + get_full_name.",
      solution: `class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ["id", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"`,
    },
    {
      task: "Write an Event serializer that rejects data where end_date is before start_date.",
      hint: "Object-level validate(self, attrs).",
      solution: `class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "name", "start_date", "end_date"]

    def validate(self, attrs):
        if attrs["end_date"] < attrs["start_date"]:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        return attrs`,
    },
    {
      task: "Make the email field of a Contact serializer unique (case-insensitive) with a friendly message.",
      hint: "validate_email + queryset filter email__iexact; exclude self.instance when updating.",
      solution: `def validate_email(self, value):
    qs = Contact.objects.filter(email__iexact=value)
    if self.instance:
        qs = qs.exclude(pk=self.instance.pk)
    if qs.exists():
        raise serializers.ValidationError("This email is already registered.")
    return value.lower()`,
    },
    {
      task: "Write the shell code to update only the price of book id 1 to 499 using BookSerializer.",
      hint: "Instance + data + partial=True.",
      solution: `book = Book.objects.get(pk=1)
s = BookSerializer(book, data={"price": "499"}, partial=True)
s.is_valid(raise_exception=True)
s.save()
print(s.data["price"])   # '499.00'`,
    },
  ],
  quiz: [
    { question: "Which argument is required to serialize a QuerySet?", options: ["partial=True", "many=True", "list=True", "multiple=True"], answer: 1, explanation: "many=True wraps the serializer in a ListSerializer." },
    { question: "Which method name performs field-level validation for 'price'?", options: ["clean_price", "check_price", "validate_price", "price_validator"], answer: 2, explanation: "DRF calls validate_<field_name>; clean_<field> is the Django Forms convention." },
    { question: "A password field should be declared as:", options: ["write_only=True", "read_only=True", "required=False", "allow_null=True"], answer: 0, explanation: "write_only accepts it in input but never returns it." },
    { question: "Errors raised in validate(self, attrs) without a dict appear under:", options: ["detail", "errors", "__all__", "non_field_errors"], answer: 3, explanation: "Object-level errors use the NON_FIELD_ERRORS_KEY, default non_field_errors." },
    { question: "serializer.save() calls update() when:", options: ["partial=True is passed", "an instance was passed to the serializer", "the request method is PUT", "validated_data has an id"], answer: 1, explanation: "save() checks self.instance: present -> update(), absent -> create()." },
  ],
};
