export default {
  lesson: 'day-02-serializers-modelserializers-validation',
  minutes: 35,
  intro: 'Practise the serializer workflow (is_valid, errors, validated_data, save), ModelSerializer options and the three levels of validation, then write that validation in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a view, what must you call **before** reading `serializer.validated_data` or calling `serializer.save()`?',
      options: ['serializer.data', 'serializer.is_valid()', 'serializer.create()', 'serializer.errors'],
      answer: 1,
      explain: 'The workflow is: `s = BookSerializer(data=request.data)` → `s.is_valid()` (or `is_valid(raise_exception=True)`) → `s.save()`. Accessing `validated_data` or calling `save()` before `is_valid()` raises an AssertionError.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the ModelSerializer so it exposes `id`, `title`, `price` and `created_at`, with `id` and `created_at` read-only:\n\n```\nclass BookSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Book\n        fields = [\'id\', \'title\', \'price\', \'created_at\']\n        ______\n```',
      accept: ["read_only_fields = ['id', 'created_at']", 'read_only_fields = ["id", "created_at"]', "read_only_fields = ['created_at', 'id']", "read_only_fields = ('id', 'created_at')", 'read_only_fields = ("id", "created_at")', "read_only_fields = ['created_at']"],
      explain: '`read_only_fields` are included in the output but ignored on input, so clients cannot set them. (The auto `id` primary key is read-only already, so listing only `created_at` also works.) Prefer an explicit `fields` list over `\'__all__\'` so new model fields - like `is_staff` - are never exposed by accident.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about serializer validation are TRUE? (choose all that apply)',
      options: [
        'validate_price(self, value) checks one field and must return the (possibly changed) value',
        'validate(self, attrs) is for rules that need several fields, e.g. discount < price',
        'Raising serializers.ValidationError adds the message to serializer.errors',
        'Field-level validators run after validate()',
        'BookSerializer(book, data=request.data, partial=True) is used for PATCH',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Order: field types/arguments → `validate_<field>` → object-level `validate(attrs)`. Both must **return** the value/attrs (forgetting `return` makes the field `None`). `partial=True` makes missing fields optional for PATCH updates.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework import serializers

class EnrollSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=20)
    age = serializers.IntegerField(min_value=16)
    fee = serializers.IntegerField()
    discount = serializers.IntegerField(default=0)

    def validate_name(self, value):
        return value.title()

    def validate(self, attrs):
        if attrs['discount'] > attrs['fee']:
            raise serializers.ValidationError('discount cannot exceed fee')
        return attrs

s = EnrollSerializer(data={'name': 'asha patil', 'age': '19', 'fee': 5000})
print(s.is_valid(), dict(s.validated_data))
s = EnrollSerializer(data={'name': 'ravi', 'age': 14, 'fee': 5000})
print(s.is_valid(), list(s.errors))
s = EnrollSerializer(data={'name': 'meera', 'age': 20, 'fee': 100, 'discount': 500})
print(s.is_valid(), s.errors['non_field_errors'][0])`,
      expected: "True {'name': 'Asha Patil', 'age': 19, 'fee': 5000, 'discount': 0}\nFalse ['age']\nFalse discount cannot exceed fee",
      explain: '`"19"` is converted to 19, `validate_name` title-cases the value and the default fills `discount`. Age 14 fails `min_value`, so the error is under `age` (and `validate()` never runs). Errors from `validate()` go under **`non_field_errors`**.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `validate_product(data, existing_skus)` doing what a ProductSerializer would. Return `(is_valid, result)` - `result` is `validated_data` if valid, otherwise an errors dict `{field: [messages]}`:\n- `name`: required, max 50 chars → `\'This field is required.\'` / `\'Ensure this field has no more than 50 characters.\'`\n- `sku`: required, must be upper-cased, must not be in `existing_skus` → `\'product with this sku already exists.\'`\n- `price`: required number > 0 → `\'Price must be positive.\'`\n- `mrp`: optional number (default = price); object rule: price must be <= mrp → error under `\'non_field_errors\'`: `\'Price cannot be more than MRP.\'` (only checked when the fields are valid)',
      example: { title: 'errors as lists per field', code: "errors = {}\nerrors.setdefault('name', []).append('This field is required.')\nprint(errors)   # {'name': ['This field is required.']}" },
      starter: `def validate_product(data, existing_skus):
    errors = {}
    # TODO
    return (not errors, errors)
`,
      solution: `def validate_product(data, existing_skus):
    errors, clean = {}, {}
    name = str(data.get('name', '')).strip()
    if not name:
        errors['name'] = ['This field is required.']
    elif len(name) > 50:
        errors['name'] = ['Ensure this field has no more than 50 characters.']
    else:
        clean['name'] = name
    sku = str(data.get('sku', '')).strip().upper()
    if not sku:
        errors['sku'] = ['This field is required.']
    elif sku in existing_skus:
        errors['sku'] = ['product with this sku already exists.']
    else:
        clean['sku'] = sku
    price = data.get('price')
    if price is None:
        errors['price'] = ['This field is required.']
    elif not isinstance(price, (int, float)) or price <= 0:
        errors['price'] = ['Price must be positive.']
    else:
        clean['price'] = price
    if errors:
        return (False, errors)
    clean['mrp'] = data.get('mrp', price)
    if clean['price'] > clean['mrp']:
        return (False, {'non_field_errors': ['Price cannot be more than MRP.']})
    return (True, clean)
`,
      tests: [
        { call: "validate_product({'name': 'Notebook', 'sku': 'nb-100', 'price': 45, 'mrp': 50}, {'PEN-1'})", expect: [true, { name: 'Notebook', sku: 'NB-100', price: 45, mrp: 50 }] },
        { call: "validate_product({'name': 'Pen', 'sku': 'pen-1', 'price': 10}, {'PEN-1'})", expect: [false, { sku: ['product with this sku already exists.'] }] },
        { call: "validate_product({'sku': 'x1', 'price': -5}, set())", expect: [false, { name: ['This field is required.'], price: ['Price must be positive.'] }] },
        { call: "validate_product({'name': 'Bag', 'sku': 'bag', 'price': 900, 'mrp': 700}, set())", expect: [false, { non_field_errors: ['Price cannot be more than MRP.'] }] },
        { call: "validate_product({'name': 'Bag', 'sku': 'bag', 'price': 700}, set())[1]['mrp']", expect: 700 },
      ],
      explain: 'DRF errors are **lists per field** because a field can fail several rules. The unique SKU check is what `UniqueValidator` (added automatically by ModelSerializer for `unique=True`) does. Cross-field rules run only after every field is valid, exactly like `validate(self, attrs)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `serialize(obj, fields, read_only=(), data=None, partial=False)` that mimics both directions of a serializer:\n- if `data` is `None`: **output** - return `{f: obj[f] for f in fields}`\n- otherwise: **update** - copy `obj`, apply the keys from `data` that are in `fields` but NOT in `read_only`, and return the new dict. When `partial` is False, every writable field must be present in `data`; if some are missing return `{\'missing\': [sorted field names]}`.',
      example: { title: 'dict comprehension with a filter', code: "data = {'a': 1, 'b': 2, 'c': 3}\nprint({k: v for k, v in data.items() if k in ('a', 'c')})" },
      starter: `def serialize(obj, fields, read_only=(), data=None, partial=False):
    # TODO
    return obj
`,
      solution: `def serialize(obj, fields, read_only=(), data=None, partial=False):
    if data is None:
        return {f: obj[f] for f in fields}
    writable = [f for f in fields if f not in read_only]
    if not partial:
        missing = sorted(f for f in writable if f not in data)
        if missing:
            return {'missing': missing}
    new = dict(obj)
    for f in writable:
        if f in data:
            new[f] = data[f]
    return new
`,
      tests: [
        { call: "serialize({'id': 1, 'title': 'Godaan', 'price': 250, 'secret': 'x'}, ['id', 'title', 'price'])", expect: { id: 1, title: 'Godaan', price: 250 } },
        { call: "serialize({'id': 1, 'title': 'Godaan', 'price': 250}, ['id', 'title', 'price'], ['id'], {'id': 99, 'title': 'Gaban', 'price': 300})", expect: { id: 1, title: 'Gaban', price: 300 } },
        { call: "serialize({'id': 1, 'title': 'Godaan', 'price': 250}, ['id', 'title', 'price'], ['id'], {'price': 199})", expect: { missing: ['title'] } },
        { call: "serialize({'id': 1, 'title': 'Godaan', 'price': 250}, ['id', 'title', 'price'], ['id'], {'price': 199}, partial=True)", expect: { id: 1, title: 'Godaan', price: 199 } },
      ],
      explain: 'Output uses `fields` to hide everything else (`secret`). On input, read-only fields like `id` are silently ignored, PUT (partial=False) requires all writable fields and PATCH (partial=True) accepts any subset. This is the core of `serializer.data` vs `serializer.save()`.',
    },
  ],
};
