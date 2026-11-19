export default {
  lesson: 'day-09-nested-serializers-relationships',
  minutes: 35,
  intro: 'Practise relational fields, nested read serializers, writable nested serializers and the N+1 problem, and build nested JSON from flat rows in Python and SQL.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A `Book` has `author = ForeignKey(Author)`. Which field shows the author\'s `name` instead of its id, and also accepts a name when writing?',
      options: ['PrimaryKeyRelatedField', 'StringRelatedField', "SlugRelatedField(slug_field='name', queryset=Author.objects.all())", 'HyperlinkedRelatedField'],
      answer: 2,
      explain: '**SlugRelatedField** uses any unique field (here `name`) for both reading and writing (needs `queryset` for writes). `StringRelatedField` uses `__str__` and is **read-only**. PrimaryKeyRelatedField uses ids, HyperlinkedRelatedField uses URLs.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line in `AuthorSerializer` that nests the author\'s books (reverse FK with `related_name=\'books\'`) as full objects, read-only:\n\n```\nclass AuthorSerializer(serializers.ModelSerializer):\n    books = ______\n    class Meta:\n        model = Author\n        fields = [\'id\', \'name\', \'books\']\n```',
      accept: ['BookSerializer(many=True, read_only=True)', 'BookSerializer(read_only=True, many=True)'],
      explain: 'A nested serializer for a "many" side needs `many=True`. Nested serializers are read-only by default in practice - writing nested data requires overriding `create()`/`update()`. The field name must match the `related_name` (`books`), otherwise use `source=`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Listing 50 books with a nested author without select_related("author") runs 51 queries',
        'prefetch_related is used for reverse FK and ManyToMany relations',
        'A common pattern: author_id = PrimaryKeyRelatedField(source="author", write_only=True, queryset=...) for writes + nested author for reads',
        'Writable nested serializers work automatically with ModelSerializer',
        'An order with order items should be created inside transaction.atomic()',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Nested data on a list = classic **N+1** (1 + 50). `select_related` (JOIN) fixes FK/OneToOne, `prefetch_related` fixes reverse/M2M. DRF raises an error for writable nested fields unless you write `create()`; wrapping the order + items in `transaction.atomic()` means either all rows are saved or none.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'The database returns **flat** rows from a JOIN. Write `nest_orders(rows)` that builds the nested JSON an `OrderSerializer` with `items = OrderItemSerializer(many=True)` returns. Each row: `{\'order_id\', \'customer\', \'book\', \'qty\', \'price\'}`. Output: a list of `{\'id\', \'customer\', \'items\': [{\'book\', \'qty\', \'price\'}], \'total\'}` in order of first appearance, where `total` = sum of qty × price.',
      example: { title: 'grouping rows by a key', code: "groups = {}\nfor r in rows:\n    g = groups.setdefault(r['city'], {'city': r['city'], 'people': []})\n    g['people'].append(r['name'])\nresult = list(groups.values())" },
      starter: `def nest_orders(rows):
    # TODO
    return []
`,
      solution: `def nest_orders(rows):
    orders = {}
    for r in rows:
        o = orders.setdefault(r['order_id'], {'id': r['order_id'], 'customer': r['customer'], 'items': [], 'total': 0})
        o['items'].append({'book': r['book'], 'qty': r['qty'], 'price': r['price']})
        o['total'] += r['qty'] * r['price']
    return list(orders.values())
`,
      tests: [
        { call: "nest_orders([{'order_id': 101, 'customer': 'asha', 'book': 'Godaan', 'qty': 1, 'price': 250}, {'order_id': 101, 'customer': 'asha', 'book': 'Gaban', 'qty': 2, 'price': 180}, {'order_id': 102, 'customer': 'ravi', 'book': 'The Guide', 'qty': 1, 'price': 220}])", expect: [{ id: 101, customer: 'asha', items: [{ book: 'Godaan', qty: 1, price: 250 }, { book: 'Gaban', qty: 2, price: 180 }], total: 610 }, { id: 102, customer: 'ravi', items: [{ book: 'The Guide', qty: 1, price: 220 }], total: 220 }] },
        { call: 'nest_orders([])', expect: [] },
      ],
      explain: 'This is what nested serializers + `prefetch_related(\'items\')` produce: one query for orders, one for all items, joined in Python - instead of one query per order. Computing `total` server-side (a `SerializerMethodField`) means the client never has to trust its own maths.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write the `create()` logic of a writable nested `OrderSerializer`. `create_order(data, stock, orders)`:\n- `data` = `{\'customer\': str, \'items\': [{\'book\': str, \'qty\': int}]}`; `stock` = `{book: qty_available}`; `orders` = list of saved orders\n- validate first: at least one item (`\'error: order needs items\'`), every book exists in `stock` and has enough quantity (`f\'error: not enough stock for {book}\'`)\n- only if ALL items are valid ("atomic"): reduce `stock`, append `{\'id\': len(orders) + 1, \'customer\', \'items\'}` to `orders` and return it\n- on error nothing may change',
      example: { title: 'validate everything before changing anything', code: "for item in cart:\n    if item['qty'] > stock[item['sku']]:\n        return 'error'\nfor item in cart:          # second loop: now it is safe to change\n    stock[item['sku']] -= item['qty']" },
      starter: `def create_order(data, stock, orders):
    # TODO
    return None
`,
      solution: `def create_order(data, stock, orders):
    items = data.get('items') or []
    if not items:
        return 'error: order needs items'
    need = {}
    for it in items:
        need[it['book']] = need.get(it['book'], 0) + it['qty']
    for book, qty in need.items():
        if stock.get(book, 0) < qty:
            return f'error: not enough stock for {book}'
    for book, qty in need.items():
        stock[book] -= qty
    order = {'id': len(orders) + 1, 'customer': data['customer'], 'items': items}
    orders.append(order)
    return order
`,
      tests: [
        { call: "(lambda s, o: (create_order({'customer': 'asha', 'items': [{'book': 'Godaan', 'qty': 2}]}, s, o), s, len(o)))({'Godaan': 5, 'Gaban': 1}, [])", expect: [{ id: 1, customer: 'asha', items: [{ book: 'Godaan', qty: 2 }] }, { Godaan: 3, Gaban: 1 }, 1] },
        { call: "(lambda s, o: (create_order({'customer': 'ravi', 'items': [{'book': 'Godaan', 'qty': 1}, {'book': 'Gaban', 'qty': 3}]}, s, o), s, len(o)))({'Godaan': 5, 'Gaban': 1}, [])", expect: ['error: not enough stock for Gaban', { Godaan: 5, Gaban: 1 }, 0], msg: 'A failing item must leave stock and orders unchanged (atomic)' },
        { call: "create_order({'customer': 'x', 'items': []}, {}, [])", expect: 'error: order needs items' },
        { call: "create_order({'customer': 'x', 'items': [{'book': 'Unknown', 'qty': 1}]}, {'Godaan': 1}, [])", expect: 'error: not enough stock for Unknown' },
        { call: "(lambda s: create_order({'customer': 'm', 'items': [{'book': 'Gaban', 'qty': 1}, {'book': 'Gaban', 'qty': 1}]}, s, []))({'Gaban': 1})", expect: 'error: not enough stock for Gaban', msg: 'The same book twice must be counted together' },
      ],
      explain: 'In DRF you validate in `validate()` and then, in `create()`, pop `items` from `validated_data`, create the Order and each OrderItem inside `with transaction.atomic():` - if anything fails, the database rolls back so you never get an order with half its items or wrong stock.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: '`select_related(\'author\')` turns "1 query for books + 1 per author" into a single JOIN. Write that query: each book `title` with its `author` name (column alias `author`), only books priced above 200, ordered by `title`.',
      example: { title: 'JOIN with an alias', code: 'SELECT p.name, c.name AS category\nFROM product p\nJOIN category c ON c.id = p.category_id\nORDER BY p.name;' },
      setup: `CREATE TABLE author (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, price INTEGER, author_id INTEGER REFERENCES author(id));
INSERT INTO author VALUES (1, 'Premchand'), (2, 'R K Narayan'), (3, 'A P J Abdul Kalam');
INSERT INTO book VALUES (1, 'Godaan', 250, 1), (2, 'Gaban', 180, 1), (3, 'The Guide', 220, 2), (4, 'Wings of Fire', 300, 3), (5, 'Malgudi Days', 199, 2);`,
      starter: 'SELECT title FROM book WHERE price > 200;',
      solution: 'SELECT b.title, a.name AS author FROM book b JOIN author a ON a.id = b.author_id WHERE b.price > 200 ORDER BY b.title;',
      ordered: true,
      explain: 'One JOIN returns each book with its author, so the nested `author` field needs no extra queries. Use `select_related` for FK/OneToOne (JOIN) and `prefetch_related` for reverse/M2M (a second `IN (...)` query).',
    },
  ],
};
