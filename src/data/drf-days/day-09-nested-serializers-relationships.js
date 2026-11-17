export default {
  id: "day-09-nested-serializers-relationships",
  title: "Nested Serializers and Relationships",
  module: "Module 2: Auth & Advanced",
  day: 9,
  level: "Advanced",
  duration: "3 hours",
  summary: "Represent ForeignKey, reverse and ManyToMany relationships in your API. Use PrimaryKeyRelatedField, StringRelatedField, SlugRelatedField and HyperlinkedRelatedField, nest serializers for read, write nested data with custom create()/update(), and avoid N+1 queries with select_related and prefetch_related.",
  objectives: [
    "Choose the right relational field (PK, String, Slug, Hyperlinked) for a relationship",
    "Nest serializers for reading related objects, including reverse relations with many=True",
    "Accept an id for writing while returning a nested object for reading",
    "Implement writable nested serializers (order with order items) using transaction.atomic",
    "Optimise nested APIs with select_related, prefetch_related and Prefetch",
  ],
  theory: [
    {
      heading: "Relationships in an API",
      content: "Real data is connected: a Book belongs to an Author (ForeignKey), an Author has many Books (reverse FK), a Book has many Tags (ManyToMany), an Order has many OrderItems. The question is how to show these links in JSON. You can send just the id (light), a readable string, a URL, or the full nested object (heavy but convenient). Think of a family tree: you can write just a name, or attach the full profile of each relative. Choose based on what the client needs and how much data you can afford to send.",
      syntax: `{"id": 1, "title": "Clean Code", "author": 3}                         # PrimaryKeyRelatedField
{"id": 1, "title": "Clean Code", "author": "Robert Martin"}             # StringRelatedField
{"id": 1, "title": "Clean Code", "author": "robert-martin"}             # SlugRelatedField
{"id": 1, "title": "Clean Code", "author": "http://.../authors/3/"}     # HyperlinkedRelatedField
{"id": 1, "title": "Clean Code", "author": {"id": 3, "name": "Robert Martin"}}  # nested serializer`,
    },
    {
      heading: "Relational Fields",
      content: "ModelSerializer uses PrimaryKeyRelatedField for FK and M2M by default. You can override any relation with another field type.",
      points: [
        "PrimaryKeyRelatedField(queryset=Author.objects.all()): read/write by id (default)",
        "StringRelatedField(): uses __str__; always read-only",
        "SlugRelatedField(slug_field='name', queryset=...): read/write by a unique field like name or slug",
        "HyperlinkedRelatedField(view_name='author-detail', read_only=True): returns URL; needs request in context",
        "Add many=True for reverse FK and ManyToMany",
        "Writable related fields need a queryset (used to validate the id exists); read-only fields do not",
      ],
    },
    {
      heading: "Nested Serializers (Read)",
      content: "Use another serializer as a field to embed the related object. For reverse relations, the field name must match the related_name (or use source='book_set'). Nested serializers are read-only by default in practice: DRF refuses to save writable nested data unless you write create()/update() yourself. The depth = 1 Meta option nests automatically, but it includes ALL fields of the related model and is read-only — fine for prototypes, avoid in production.",
      syntax: `class AuthorMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name"]

class BookSerializer(serializers.ModelSerializer):
    author = AuthorMiniSerializer(read_only=True)                  # nested read
    author_id = serializers.PrimaryKeyRelatedField(                # id for write
        queryset=Author.objects.all(), source="author", write_only=True)

class AuthorDetailSerializer(serializers.ModelSerializer):
    books = BookMiniSerializer(many=True, read_only=True)          # reverse FK (related_name="books")
    book_count = serializers.IntegerField(read_only=True)          # from annotate()`,
    },
    {
      heading: "Writable Nested Serializers",
      content: "When a client sends an order with its items in one request, you must override create() (and update()) on the parent serializer: pop the nested list from validated_data, create the parent, then create each child. Wrap it in transaction.atomic() so a failure in any child rolls back everything — either the whole order is saved or nothing is. For update(), a common simple strategy is: update parent fields, delete existing children, recreate from the payload.",
      points: [
        "Pop nested data: items = validated_data.pop('items')",
        "Use bulk_create for many children",
        "Validate across parent and children in validate() (e.g. at least one item, stock available)",
        "Compute totals on the server, never trust a total sent by the client",
      ],
    },
    {
      heading: "The N+1 Problem in Nested APIs",
      content: "Serializing 50 books with a nested author makes 1 query for books + 50 queries for authors = 51 queries. That is the N+1 problem; it silently kills performance as data grows. Fix it in get_queryset: select_related for ForeignKey/OneToOne (SQL JOIN, one query) and prefetch_related for reverse FK and ManyToMany (one extra query per relation). Use Prefetch objects to filter or order prefetched rows, and annotate() for counts instead of len(obj.books.all()).",
      syntax: `Book.objects.select_related("author", "category").prefetch_related("tags")
Author.objects.prefetch_related(
    Prefetch("books", queryset=Book.objects.filter(in_stock=True).order_by("title"))
).annotate(book_count=Count("books"))`,
      tip: "Install django-debug-toolbar or log connection.queries in tests to count SQL queries. assertNumQueries in tests guards against N+1 regressions.",
    },
  ],
  examples: [
    {
      title: "Relational Fields Side by Side",
      scenario: "Model Author, Book and Tag, and compare how each relational field type represents them.",
      steps: [
        "Update books/models.py with Author, Tag and the new Book relations",
        "Run python manage.py makemigrations and migrate",
        "Write the serializers in books/serializers.py",
        "Test in python manage.py shell",
      ],
      code: `# books/models.py
class Author(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    country = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name="books")
    tags = models.ManyToManyField(Tag, blank=True, related_name="books")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    in_stock = models.BooleanField(default=True)


# books/serializers.py
class BookPKSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "author", "tags"]          # default: PKs


class BookStringSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    tags = serializers.StringRelatedField(many=True)

    class Meta:
        model = Book
        fields = ["id", "title", "author", "tags"]


class BookSlugSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(slug_field="slug", queryset=Author.objects.all())
    tags = serializers.SlugRelatedField(slug_field="name", many=True, queryset=Tag.objects.all())

    class Meta:
        model = Book
        fields = ["id", "title", "author", "tags"]


# shell
>>> b = Book.objects.get(pk=1)
>>> BookPKSerializer(b).data
>>> BookStringSerializer(b).data
>>> BookSlugSerializer(b).data
>>> s = BookSlugSerializer(data={"title": "The Clean Coder", "author": "robert-martin",
...                              "tags": ["programming", "career"], "price": "399"})
>>> s.is_valid(); s.errors`,
      result: `>>> BookPKSerializer(b).data
{'id': 1, 'title': 'Clean Code', 'author': 1, 'tags': [1, 3]}

>>> BookStringSerializer(b).data
{'id': 1, 'title': 'Clean Code', 'author': 'Robert Martin', 'tags': ['programming', 'best-practices']}

>>> BookSlugSerializer(b).data
{'id': 1, 'title': 'Clean Code', 'author': 'robert-martin', 'tags': ['programming', 'best-practices']}

>>> s.is_valid(); s.errors
False
{'tags': [ErrorDetail(string='Object with name=career does not exist.', code='does_not_exist')]}`,
      explanation: "PK is compact and default. StringRelatedField is human friendly but read-only. SlugRelatedField reads AND writes using a readable unique field and validates existence through the queryset. Note price is missing in BookSlugSerializer.fields, so it is ignored in input.",
    },
    {
      title: "Nested Read + ID Write, Reverse Relations and annotate",
      scenario: "The book list should show the author object and tag names, accept author_id/tag_ids when creating, and the author detail should list their books with a count.",
      steps: [
        "Write AuthorMiniSerializer, BookSerializer, AuthorDetailSerializer",
        "Write the ViewSets with optimised querysets",
        "Register authors and books in the router",
        "Test GET and POST in Postman",
      ],
      code: `# books/serializers.py
class AuthorMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name", "slug"]


class BookSerializer(serializers.ModelSerializer):
    author = AuthorMiniSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), source="author", write_only=True)
    tags = serializers.SlugRelatedField(slug_field="name", many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source="tags", many=True, write_only=True, required=False)

    class Meta:
        model = Book
        fields = ["id", "title", "price", "in_stock", "author", "author_id", "tags", "tag_ids"]


class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "price"]


class AuthorDetailSerializer(serializers.ModelSerializer):
    books = BookMiniSerializer(many=True, read_only=True)
    book_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Author
        fields = ["id", "name", "country", "book_count", "books"]


# books/views.py
from django.db.models import Count, Prefetch


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    queryset = Book.objects.select_related("author").prefetch_related("tags").order_by("id")


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuthorDetailSerializer
    queryset = (Author.objects
                .annotate(book_count=Count("books"))
                .prefetch_related(Prefetch("books", queryset=Book.objects.order_by("title")))
                .order_by("name"))

# curl
curl -X POST http://127.0.0.1:8000/api/books/ -H "Authorization: Bearer <token>" \\
     -H "Content-Type: application/json" \\
     -d '{"title":"The Clean Coder","price":"399","author_id":1,"tag_ids":[1,2]}'
curl http://127.0.0.1:8000/api/authors/1/`,
      result: `POST /api/books/ -> 201 Created
{
    "id": 7,
    "title": "The Clean Coder",
    "price": "399.00",
    "in_stock": true,
    "author": {"id": 1, "name": "Robert Martin", "slug": "robert-martin"},
    "tags": ["programming", "best-practices"]
}

GET /api/authors/1/ -> 200 OK
{
    "id": 1,
    "name": "Robert Martin",
    "country": "USA",
    "book_count": 2,
    "books": [
        {"id": 1, "title": "Clean Code", "price": "425.00"},
        {"id": 7, "title": "The Clean Coder", "price": "399.00"}
    ]
}`,
      explanation: "The read/write split pattern (nested read_only + *_id write_only with source) is the most common DRF interview answer for 'how to accept an id but return an object'. ModelSerializer's default create() handles the M2M from tag_ids because source='tags'. annotate + Prefetch keep the author endpoint at 2 queries no matter how many books exist.",
    },
    {
      title: "Writable Nested Serializer: Order with Items",
      scenario: "The checkout page sends one POST containing the order and its items. Validate stock, compute the total on the server and save everything atomically.",
      steps: [
        "python manage.py startapp orders and add it to INSTALLED_APPS",
        "Create Order and OrderItem models (add stock IntegerField to Book), then migrate",
        "Write OrderItemSerializer and OrderSerializer with create()",
        "Write OrderViewSet with IsAuthenticated and register at /api/orders/",
        "POST a valid order and an order with too much quantity",
      ],
      code: `# orders/models.py
from django.conf import settings
from django.db import models
from books.models import Book


class Order(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    address = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)


# orders/serializers.py
from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from books.models import Book
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title = serializers.ReadOnlyField(source="book.title")

    class Meta:
        model = OrderItem
        fields = ["book", "book_title", "quantity", "unit_price"]
        read_only_fields = ["unit_price"]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer = serializers.ReadOnlyField(source="customer.username")

    class Meta:
        model = Order
        fields = ["id", "customer", "address", "total", "created_at", "items"]
        read_only_fields = ["total", "created_at"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")
        for item in items:
            if item["quantity"] > item["book"].stock:
                raise serializers.ValidationError(
                    f"Only {item['book'].stock} copies of '{item['book'].title}' left.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        total = 0
        rows = []
        for item in items:
            book = item["book"]
            price = book.discount_price or book.price
            rows.append(OrderItem(order=order, book=book, quantity=item["quantity"], unit_price=price))
            total += price * item["quantity"]
            Book.objects.filter(pk=book.pk).update(stock=F("stock") - item["quantity"])
        OrderItem.objects.bulk_create(rows)
        order.total = total
        order.save(update_fields=["total"])
        return order


# orders/views.py
class OrderViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                   mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (Order.objects.filter(customer=self.request.user)
                .select_related("customer")
                .prefetch_related("items__book").order_by("-created_at"))

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

# curl
curl -X POST http://127.0.0.1:8000/api/orders/ -H "Authorization: Bearer <asha>" \\
     -H "Content-Type: application/json" \\
     -d '{"address":"12 MG Road, Pune","items":[{"book":1,"quantity":2},{"book":2,"quantity":1}]}'

curl -X POST http://127.0.0.1:8000/api/orders/ -H "Authorization: Bearer <asha>" \\
     -H "Content-Type: application/json" \\
     -d '{"address":"12 MG Road, Pune","items":[{"book":2,"quantity":50}]}'`,
      result: `POST /api/orders/ -> 201 Created
{
    "id": 1,
    "customer": "asha",
    "address": "12 MG Road, Pune",
    "total": "1649.00",
    "created_at": "2026-11-17T13:20:05.112Z",
    "items": [
        {"book": 1, "book_title": "Clean Code", "quantity": 2, "unit_price": "425.00"},
        {"book": 2, "book_title": "Fluent Python 2E", "quantity": 1, "unit_price": "799.00"}
    ]
}

POST /api/orders/ (quantity 50) -> 400 Bad Request
{"items": ["Only 9 copies of 'Fluent Python 2E' left."]}`,
      explanation: "Without a custom create(), DRF raises 'The .create() method does not support writable nested fields by default.' The server decides unit_price (discount price 799 for book 2) and total = 2*425 + 799 = 1649. transaction.atomic rolls back the order if any item fails. F('stock') - qty avoids race conditions when two users buy at once. prefetch_related('items__book') keeps the list at 3 queries.",
    },
    {
      title: "Pure Python Demo: Seeing the N+1 Problem",
      scenario: "Simulate a database that counts queries to see why nested serializers without select_related are slow.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
queries = []
conn.set_trace_callback(queries.append)

conn.executescript("""
CREATE TABLE author (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER);
INSERT INTO author VALUES (1, 'Robert Martin'), (2, 'Luciano Ramalho'), (3, 'Martin Fowler');
INSERT INTO book VALUES (1, 'Clean Code', 1), (2, 'Fluent Python', 2),
                        (3, 'Refactoring', 3), (4, 'The Clean Coder', 1);
""")


def serialize_naive():
    queries.clear()
    books = conn.execute("SELECT id, title, author_id FROM book").fetchall()
    data = []
    for bid, title, aid in books:
        name = conn.execute("SELECT name FROM author WHERE id = ?", (aid,)).fetchone()[0]
        data.append({"id": bid, "title": title, "author": {"id": aid, "name": name}})
    return data, len(queries)


def serialize_select_related():
    queries.clear()
    rows = conn.execute("""SELECT b.id, b.title, a.id, a.name
                           FROM book b JOIN author a ON a.id = b.author_id""").fetchall()
    data = [{"id": b, "title": t, "author": {"id": a, "name": n}} for b, t, a, n in rows]
    return data, len(queries)


data1, q1 = serialize_naive()
data2, q2 = serialize_select_related()
print(data1[0])
print("Same data:", data1 == data2)
print("Naive queries          :", q1)
print("select_related queries :", q2)`,
      python: {
        files: {
          "main.py": `import sqlite3

conn = sqlite3.connect(":memory:")
queries = []
conn.set_trace_callback(queries.append)

conn.executescript("""
CREATE TABLE author (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER);
INSERT INTO author VALUES (1, 'Robert Martin'), (2, 'Luciano Ramalho'), (3, 'Martin Fowler');
INSERT INTO book VALUES (1, 'Clean Code', 1), (2, 'Fluent Python', 2),
                        (3, 'Refactoring', 3), (4, 'The Clean Coder', 1);
""")


def serialize_naive():
    queries.clear()
    books = conn.execute("SELECT id, title, author_id FROM book").fetchall()
    data = []
    for bid, title, aid in books:
        name = conn.execute("SELECT name FROM author WHERE id = ?", (aid,)).fetchone()[0]
        data.append({"id": bid, "title": title, "author": {"id": aid, "name": name}})
    return data, len(queries)


def serialize_select_related():
    queries.clear()
    rows = conn.execute("""SELECT b.id, b.title, a.id, a.name
                           FROM book b JOIN author a ON a.id = b.author_id""").fetchall()
    data = [{"id": b, "title": t, "author": {"id": a, "name": n}} for b, t, a, n in rows]
    return data, len(queries)


data1, q1 = serialize_naive()
data2, q2 = serialize_select_related()
print(data1[0])
print("Same data:", data1 == data2)
print("Naive queries          :", q1)
print("select_related queries :", q2)
`,
        },
      },
      result: `{'id': 1, 'title': 'Clean Code', 'author': {'id': 1, 'name': 'Robert Martin'}}
Same data: True
Naive queries          : 5
select_related queries : 1`,
      explanation: "4 books -> 1 + 4 = 5 queries naive; with a JOIN (what select_related does) it is always 1 query. With 1,000 books the naive approach would make 1,001 queries.",
    },
  ],
  interview: [
    { q: "What is a nested serializer?", a: "A serializer used as a field inside another serializer to represent a related object (or list of objects with many=True) as embedded JSON instead of just an id.", level: "Easy" },
    { q: "Are nested serializers writable by default?", a: "No. DRF's default ModelSerializer.create()/update() raise an error for writable nested fields; you must override create()/update() to handle nested data explicitly.", level: "Medium" },
    { q: "How do you accept an id on write but return the nested object on read?", a: "Declare the nested serializer as read_only (author = AuthorSerializer(read_only=True)) and a separate PrimaryKeyRelatedField write_only field with source='author' (author_id). Alternatively override to_representation().", level: "Medium" },
    { q: "Difference between StringRelatedField and SlugRelatedField?", a: "StringRelatedField uses __str__ and is read-only. SlugRelatedField uses a specific unique field (slug_field) and can be writable with a queryset.", level: "Easy" },
    { q: "What does depth = 1 do in Meta?", a: "Automatically nests related objects one level deep using all their fields. It is read-only and can expose too many fields, so explicit nested serializers are preferred in production.", level: "Medium" },
    { q: "What is the N+1 query problem?", a: "Fetching N parent rows with one query and then running one extra query per row to fetch related data, giving N+1 queries. In DRF it often appears with nested serializers or source='fk.field'.", level: "Medium" },
    { q: "select_related vs prefetch_related?", a: "select_related uses an SQL JOIN for forward ForeignKey and OneToOne (single query). prefetch_related runs a separate query per relation and joins in Python; used for ManyToMany and reverse ForeignKey.", level: "Medium" },
    { q: "Why use transaction.atomic in a nested create()?", a: "So that the parent and all children are saved together; if creating any child fails, everything is rolled back and no half-saved order remains.", level: "Medium" },
    { q: "How do you show reverse relations (author -> books)?", a: "Use the related_name as the field name with many=True, e.g. books = BookSerializer(many=True, read_only=True), or source='book_set' if no related_name is set.", level: "Easy" },
    { q: "Why must writable related fields have a queryset?", a: "DRF uses the queryset to look up and validate that the submitted id/slug exists. Read-only related fields do not need one.", level: "Medium" },
    { q: "How would you handle updating nested items?", a: "Override update(): update parent fields, then either delete and recreate children, or match children by id to update existing, create new and delete missing ones — inside a transaction.", level: "Hard" },
    { q: "What does HyperlinkedRelatedField need to work?", a: "A view_name that matches a URL name (e.g. 'author-detail') and the request in serializer context to build absolute URLs. Generic views pass context automatically.", level: "Hard" },
  ],
  practice: [
    {
      task: "Show category name (not id) in the Book list, and accept category by name when creating.",
      hint: "SlugRelatedField(slug_field='name', queryset=Category.objects.all()).",
      solution: `class BookSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field="name", queryset=Category.objects.all())

    class Meta:
        model = Book
        fields = ["id", "title", "category"]`,
    },
    {
      task: "Create a CategorySerializer that lists its in-stock books (id, title) and a book_count, using one optimised queryset.",
      hint: "Prefetch with to_attr, annotate Count with filter.",
      solution: `class CategorySerializer(serializers.ModelSerializer):
    in_stock_books = BookMiniSerializer(many=True, read_only=True)
    book_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "book_count", "in_stock_books"]

queryset = Category.objects.annotate(
    book_count=Count("books", filter=Q(books__in_stock=True))
).prefetch_related(Prefetch("books", queryset=Book.objects.filter(in_stock=True),
                            to_attr="in_stock_books"))`,
    },
    {
      task: "Write update() for OrderSerializer that replaces all items.",
      hint: "Pop items, update address, delete old items, recreate, recompute total, atomic.",
      solution: `@transaction.atomic
def update(self, instance, validated_data):
    items = validated_data.pop("items", None)
    instance.address = validated_data.get("address", instance.address)
    if items is not None:
        instance.items.all().delete()
        total = 0
        for item in items:
            price = item["book"].price
            OrderItem.objects.create(order=instance, book=item["book"],
                                     quantity=item["quantity"], unit_price=price)
            total += price * item["quantity"]
        instance.total = total
    instance.save()
    return instance`,
    },
    {
      task: "Write a test asserting the book list makes at most 3 queries.",
      hint: "self.assertNumQueries in APITestCase.",
      solution: `from rest_framework.test import APITestCase


class BookQueryTest(APITestCase):
    def test_list_queries(self):
        # create authors/books/tags here...
        with self.assertNumQueries(3):   # count (pagination) + books + tags prefetch
            self.client.get("/api/books/")`,
    },
  ],
  quiz: [
    { question: "Default relational field used by ModelSerializer for a ForeignKey:", options: ["PrimaryKeyRelatedField", "StringRelatedField", "SlugRelatedField", "HyperlinkedRelatedField"], answer: 0, explanation: "ModelSerializer uses primary keys (HyperlinkedModelSerializer uses hyperlinks)." },
    { question: "Which is always read-only?", options: ["SlugRelatedField", "PrimaryKeyRelatedField", "StringRelatedField", "HyperlinkedRelatedField"], answer: 2, explanation: "StringRelatedField uses __str__ and cannot be written." },
    { question: "To optimise a ManyToMany field in a list view use:", options: ["select_related", "only()", "defer()", "prefetch_related"], answer: 3, explanation: "M2M and reverse FK need prefetch_related." },
    { question: "To save an Order with nested items you must:", options: ["set depth=2", "override create() in the serializer", "use HyperlinkedModelSerializer", "set many=True on the view"], answer: 1, explanation: "Writable nested data needs a custom create()/update()." },
    { question: "Field to accept author by id while author is nested read-only:", options: ["author_id = PrimaryKeyRelatedField(queryset=..., source='author', write_only=True)", "author_id = IntegerField(read_only=True)", "author = StringRelatedField()", "depth = 0"], answer: 0, explanation: "source='author' maps the write-only id field onto the author relation." },
  ],
};
