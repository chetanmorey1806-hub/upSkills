export default {
  lesson: 'day-12-full-stack-project-interview',
  minutes: 40,
  intro: 'Revise DRF through the BookNest bookstore: API contract, business rules, APITestCase tests and the interview questions you will be asked.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview question: what is the difference between `serializer.data` and `serializer.validated_data`?',
      options: ['They are the same', 'validated_data is the cleaned INPUT after is_valid(); data is the OUTPUT representation (to_representation)', 'data is only available before is_valid()', 'validated_data contains the JSON string'],
      answer: 1,
      explain: '`validated_data` = clean Python values from the client, used by `save()`. `data` = what the API sends back (read-only fields included, write-only excluded). Returning `validated_data` in a response would miss the `id` and computed fields.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'BookNest checklist. Which belong in a production-ready DRF backend? (choose all that apply)',
      options: [
        'DEBUG = False and SECRET_KEY from an environment variable',
        'Explicit fields in serializers instead of "__all__"',
        'Querysets filtered by request.user for user-owned data (orders, cart)',
        'CORS_ALLOW_ALL_ORIGINS = True',
        'Pagination on list endpoints and select_related/prefetch_related on nested ones',
        'APITestCase tests for auth, permissions and business rules',
      ],
      answers: [0, 1, 2, 4, 5],
      explain: 'Allow-all CORS should be replaced with your real frontend origin. Everything else is standard: secrets from env, explicit fields (no accidental leaks), per-user querysets, pagination + query optimisation, and automated tests.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the APITestCase line that logs in a user for the test client without a real token request:\n\n```\nclass OrderTests(APITestCase):\n    def setUp(self):\n        self.user = User.objects.create_user(\'asha\', password=\'Secret@123\')\n        ______\n```',
      accept: ['self.client.force_authenticate(user=self.user)', 'self.client.force_authenticate(self.user)'],
      explain: '`force_authenticate` makes every request of the test client authenticated as that user, so tests focus on business logic instead of the login flow. Use `self.client.force_authenticate(user=None)` to test the anonymous (401) case.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: 'BookNest\'s checkout rule. Write `checkout(cart, books, coupon=None)` that returns either an error string or a summary dict:\n- `cart` = `[{\'book_id\', \'qty\'}]`, `books` = `{id: {\'title\', \'price\', \'stock\'}}`\n- empty cart → `\'error: cart is empty\'`; unknown book → `f\'error: book {id} not found\'`; qty < 1 or qty > stock → `f\'error: invalid quantity for {title}\'`\n- `subtotal` = Σ price × qty; coupon `\'FIRST10\'` = 10% off, `\'FLAT100\'` = ₹100 off only if subtotal >= 500; unknown coupon → `\'error: invalid coupon\'`\n- `shipping` = 0 if (subtotal − discount) >= 499 else 40\n- return `{\'subtotal\', \'discount\', \'shipping\', \'total\'}` (discount rounded to 2 decimals, total = subtotal − discount + shipping)',
      example: { title: 'a business rule in a serializer validate()', code: "def validate(self, attrs):\n    if attrs['qty'] > attrs['book'].stock:\n        raise serializers.ValidationError('Not enough stock')\n    return attrs" },
      starter: `def checkout(cart, books, coupon=None):
    # TODO
    return {}
`,
      solution: `def checkout(cart, books, coupon=None):
    if not cart:
        return 'error: cart is empty'
    subtotal = 0
    for item in cart:
        book = books.get(item['book_id'])
        if book is None:
            return f"error: book {item['book_id']} not found"
        if item['qty'] < 1 or item['qty'] > book['stock']:
            return f"error: invalid quantity for {book['title']}"
        subtotal += book['price'] * item['qty']
    if coupon is None:
        discount = 0
    elif coupon == 'FIRST10':
        discount = round(subtotal * 0.10, 2)
    elif coupon == 'FLAT100':
        discount = 100 if subtotal >= 500 else 0
    else:
        return 'error: invalid coupon'
    shipping = 0 if subtotal - discount >= 499 else 40
    return {'subtotal': subtotal, 'discount': discount, 'shipping': shipping, 'total': subtotal - discount + shipping}
`,
      tests: [
        { call: "checkout([{'book_id': 1, 'qty': 2}], {1: {'title': 'Godaan', 'price': 250, 'stock': 5}})", expect: { subtotal: 500, discount: 0, shipping: 0, total: 500 } },
        { call: "checkout([{'book_id': 1, 'qty': 1}, {'book_id': 2, 'qty': 1}], {1: {'title': 'Godaan', 'price': 250, 'stock': 5}, 2: {'title': 'Gaban', 'price': 185, 'stock': 2}}, 'FIRST10')", expect: { subtotal: 435, discount: 43.5, shipping: 40, total: 431.5 } },
        { call: "checkout([{'book_id': 1, 'qty': 3}], {1: {'title': 'Godaan', 'price': 250, 'stock': 5}}, 'FLAT100')", expect: { subtotal: 750, discount: 100, shipping: 0, total: 650 } },
        { call: "checkout([{'book_id': 1, 'qty': 6}], {1: {'title': 'Godaan', 'price': 250, 'stock': 5}})", expect: 'error: invalid quantity for Godaan' },
        { call: "checkout([{'book_id': 9, 'qty': 1}], {})", expect: 'error: book 9 not found' },
        { call: "checkout([], {})", expect: 'error: cart is empty' },
        { call: "checkout([{'book_id': 1, 'qty': 1}], {1: {'title': 'Godaan', 'price': 250, 'stock': 5}}, 'FREE')", expect: 'error: invalid coupon' },
      ],
      explain: 'Prices, stock and discounts are always computed on the **server** from the database - never trust totals sent by React. In BookNest this logic lives in the order serializer\'s `validate()`/`create()` (or a service function) and is covered by APITestCase tests for every rule.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'The admin dashboard endpoint `/api/reports/top-books/` returns each book `title` with `sold` (total quantity in order items) and `revenue` (Σ qty × price), only for **paid** orders, best sellers first (by `sold` desc, then `title`). Books never sold must not appear.',
      example: { title: 'JOIN three tables and aggregate', code: "SELECT p.name, SUM(oi.qty) AS units\nFROM order_item oi\nJOIN product p ON p.id = oi.product_id\nJOIN orders o ON o.id = oi.order_id\nWHERE o.status = 'delivered'\nGROUP BY p.id\nORDER BY units DESC;" },
      setup: `CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, price INTEGER);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, status TEXT);
CREATE TABLE order_item (id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id), book_id INTEGER REFERENCES book(id), qty INTEGER, price INTEGER);
INSERT INTO book VALUES (1, 'Godaan', 250), (2, 'Gaban', 180), (3, 'The Guide', 220), (4, 'Wings of Fire', 300);
INSERT INTO orders VALUES (1, 'asha', 'paid'), (2, 'ravi', 'paid'), (3, 'meera', 'cancelled'), (4, 'dev', 'paid');
INSERT INTO order_item VALUES (1, 1, 1, 2, 250), (2, 1, 2, 1, 180), (3, 2, 1, 1, 240), (4, 3, 3, 5, 220), (5, 4, 4, 1, 300), (6, 4, 2, 2, 180);`,
      starter: 'SELECT title FROM book;',
      solution: "SELECT b.title, SUM(oi.qty) AS sold, SUM(oi.qty * oi.price) AS revenue FROM order_item oi JOIN orders o ON o.id = oi.order_id JOIN book b ON b.id = oi.book_id WHERE o.status = 'paid' GROUP BY b.id ORDER BY sold DESC, b.title;",
      ordered: true,
      explain: 'Revenue uses the **price stored on the order item** (the price at purchase time, 240 vs 250 today) - that is why order items copy the price. The cancelled order is excluded with WHERE before grouping. In Django: `OrderItem.objects.filter(order__status=\'paid\').values(\'book__title\').annotate(sold=Sum(\'qty\'), revenue=Sum(F(\'qty\') * F(\'price\')))`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework import serializers

class OrderItemSerializer(serializers.Serializer):
    book = serializers.CharField()
    qty = serializers.IntegerField(min_value=1)
    price = serializers.IntegerField()
    line_total = serializers.SerializerMethodField()

    def get_line_total(self, obj):
        return obj['qty'] * obj['price']

class OrderSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    items = OrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        return sum(i['qty'] * i['price'] for i in obj['items'])

order = {'id': 7, 'items': [{'book': 'Godaan', 'qty': 2, 'price': 250}, {'book': 'Gaban', 'qty': 1, 'price': 180}]}
data = OrderSerializer(order).data
print(data['id'], data['total'])
print([i['line_total'] for i in data['items']])
s = OrderSerializer(data={'items': [{'book': 'Godaan', 'qty': 0, 'price': 250}]})
print(s.is_valid(), list(s.errors['items'][0]))`,
      expected: '7 680\n[500, 180]\nFalse [\'qty\']',
      explain: '`SerializerMethodField` calls `get_<name>()` to compute read-only values (line totals, order total). Errors of nested serializers are nested too: `errors["items"][0]["qty"]` points to the exact item and field - perfect for showing the error next to the right row in React.',
    },
  ],
};
