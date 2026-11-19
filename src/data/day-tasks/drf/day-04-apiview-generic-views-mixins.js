export default {
  lesson: 'day-04-apiview-generic-views-mixins',
  minutes: 30,
  intro: 'Practise APIView, GenericAPIView attributes, mixins and concrete generic views, and rebuild the mixin idea in plain Python classes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which concrete generic view gives you GET (retrieve), PUT, PATCH and DELETE for `/books/<pk>/`?',
      options: ['ListCreateAPIView', 'RetrieveUpdateDestroyAPIView', 'APIView', 'CreateAPIView'],
      answer: 1,
      explain: '**RetrieveUpdateDestroyAPIView** = GenericAPIView + Retrieve/Update/Destroy mixins (detail URL). **ListCreateAPIView** covers GET list + POST on the collection URL. With `queryset` and `serializer_class`, these two classes give a full CRUD API.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the hook so the logged-in user is saved as the book\'s `owner` when a book is created via `ListCreateAPIView`:\n\n```\ndef perform_create(self, serializer):\n    ______\n```',
      accept: ['serializer.save(owner=self.request.user)'],
      explain: '`perform_create` is called by `CreateModelMixin.create()` after validation. Passing extra keyword arguments to `save()` adds values that do not come from the client - the client must never be able to choose the owner.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about GenericAPIView are TRUE? (choose all that apply)',
      options: [
        'get_queryset() can be overridden to return only the current user\'s objects',
        'lookup_field = "slug" makes the detail URL use <slug:slug> instead of <int:pk>',
        'ListModelMixin provides the list() method, which you call from get()',
        'APIView automatically provides list/create without any code',
        'get_object() uses get_queryset() + lookup_field and raises 404 if missing',
      ],
      answers: [0, 1, 2, 4],
      explain: 'GenericAPIView stores common behaviour as attributes (`queryset`, `serializer_class`, `lookup_field`) and methods (`get_queryset`, `get_object`, `get_serializer`). Mixins add actions (`list`, `create`, `retrieve`...) that you wire to HTTP methods. Plain `APIView` gives no CRUD - you write each method.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

class CounterView(APIView):
    total = 0

    def get(self, request):
        return Response({'total': CounterView.total})

    def post(self, request):
        CounterView.total += int(request.data.get('by', 1))
        return Response({'total': CounterView.total}, status=201)

view = CounterView.as_view()
f = APIRequestFactory()
print(view(f.post('/c/', {'by': 5}, format='json')).data)
print(view(f.post('/c/', {}, format='json')).status_code)
print(view(f.get('/c/')).data)
print(view(f.delete('/c/')).status_code)`,
      expected: "{'total': 5}\n201\n{'total': 6}\n405",
      explain: '`as_view()` creates the view function; `dispatch()` calls the method named after the HTTP verb (`get`, `post`). There is no `delete` method on the class, so DRF returns **405**. The empty POST uses the default `by=1`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Rebuild the generic-view idea in plain Python. The starter has a `GenericView` base with `queryset` (a list of dicts) and `get_queryset()`. Write two **mixins**:\n- `ListMixin.list(self)` → `(200, self.get_queryset())`\n- `RetrieveMixin.retrieve(self, pk)` → `(200, obj)` for the object in `self.get_queryset()` whose `self.lookup_field` equals `pk`, or `(404, {\'detail\': \'Not found.\'})`\n\nThen write `MyBooks(ListMixin, RetrieveMixin, GenericView)` whose `get_queryset()` returns only books with `owner == self.user`.',
      example: { title: 'a mixin uses methods of the class it is mixed into', code: "class GreetMixin:\n    def greet(self):\n        return f'Hi {self.name}'   # name comes from the other class\n\nclass Student(GreetMixin):\n    def __init__(self, name):\n        self.name = name" },
      starter: `BOOKS = [
    {'id': 1, 'slug': 'godaan', 'title': 'Godaan', 'owner': 'asha'},
    {'id': 2, 'slug': 'gaban', 'title': 'Gaban', 'owner': 'ravi'},
    {'id': 3, 'slug': 'nirmala', 'title': 'Nirmala', 'owner': 'asha'},
]

class GenericView:
    queryset = BOOKS
    lookup_field = 'id'

    def __init__(self, user=None):
        self.user = user

    def get_queryset(self):
        return list(self.queryset)

# TODO: ListMixin, RetrieveMixin, MyBooks
`,
      solution: `BOOKS = [
    {'id': 1, 'slug': 'godaan', 'title': 'Godaan', 'owner': 'asha'},
    {'id': 2, 'slug': 'gaban', 'title': 'Gaban', 'owner': 'ravi'},
    {'id': 3, 'slug': 'nirmala', 'title': 'Nirmala', 'owner': 'asha'},
]

class GenericView:
    queryset = BOOKS
    lookup_field = 'id'

    def __init__(self, user=None):
        self.user = user

    def get_queryset(self):
        return list(self.queryset)

class ListMixin:
    def list(self):
        return (200, self.get_queryset())

class RetrieveMixin:
    def retrieve(self, pk):
        for obj in self.get_queryset():
            if obj[self.lookup_field] == pk:
                return (200, obj)
        return (404, {'detail': 'Not found.'})

class MyBooks(ListMixin, RetrieveMixin, GenericView):
    def get_queryset(self):
        return [b for b in self.queryset if b['owner'] == self.user]
`,
      tests: [
        { call: "[b['title'] for b in MyBooks('asha').list()[1]]", expect: ['Godaan', 'Nirmala'] },
        { call: "MyBooks('asha').retrieve(3)", expect: [200, { id: 3, slug: 'nirmala', title: 'Nirmala', owner: 'asha' }] },
        { call: "MyBooks('asha').retrieve(2)", expect: [404, { detail: 'Not found.' }], msg: 'Another user\'s book must be "not found" (filtered by get_queryset)' },
        { call: "(lambda V: V('ravi').retrieve('gaban'))(type('BySlug', (MyBooks,), {'lookup_field': 'slug'}))", expect: [200, { id: 2, slug: 'gaban', title: 'Gaban', owner: 'ravi' }], msg: 'retrieve() must use self.lookup_field' },
        { call: "(lambda V: V().list())(type('All', (ListMixin, GenericView), {}))[0]", expect: 200 },
      ],
      explain: 'Mixins only call `self.get_queryset()` and `self.lookup_field`, so overriding **one** method in the view changes list and retrieve together - that is why DRF security for "only my objects" belongs in `get_queryset()`. Note MRO order: mixins first, base view last.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `allowed_methods(view_class_name)` that returns the sorted list of HTTP methods each DRF concrete generic view supports:\n`ListAPIView`, `CreateAPIView`, `RetrieveAPIView`, `DestroyAPIView`, `UpdateAPIView`, `ListCreateAPIView`, `RetrieveUpdateAPIView`, `RetrieveDestroyAPIView`, `RetrieveUpdateDestroyAPIView`. Unknown names → `[]`. (Use GET, POST, PUT, PATCH, DELETE only.)',
      example: { title: 'building a list from parts of a name', code: "name = 'ListCreateAPIView'\nprint('List' in name, 'Create' in name)   # True True" },
      starter: `def allowed_methods(view_class_name):
    # TODO
    return []
`,
      solution: `PARTS = {'List': ['GET'], 'Retrieve': ['GET'], 'Create': ['POST'], 'Update': ['PUT', 'PATCH'], 'Destroy': ['DELETE']}
KNOWN = {'ListAPIView', 'CreateAPIView', 'RetrieveAPIView', 'DestroyAPIView', 'UpdateAPIView',
         'ListCreateAPIView', 'RetrieveUpdateAPIView', 'RetrieveDestroyAPIView', 'RetrieveUpdateDestroyAPIView'}

def allowed_methods(view_class_name):
    if view_class_name not in KNOWN:
        return []
    methods = set()
    for part, ms in PARTS.items():
        if part in view_class_name:
            methods.update(ms)
    return sorted(methods)
`,
      tests: [
        { call: "allowed_methods('ListCreateAPIView')", expect: ['GET', 'POST'] },
        { call: "allowed_methods('RetrieveUpdateDestroyAPIView')", expect: ['DELETE', 'GET', 'PATCH', 'PUT'] },
        { call: "allowed_methods('UpdateAPIView')", expect: ['PATCH', 'PUT'] },
        { call: "allowed_methods('CreateAPIView')", expect: ['POST'] },
        { call: "allowed_methods('ListUpdateAPIView')", expect: [] },
      ],
      explain: 'The class names are literally the list of mixins they combine: List/Retrieve → GET, Create → POST, Update → PUT + PATCH, Destroy → DELETE. List* views go on the collection URL, Retrieve* views on the detail URL. There is no "ListUpdate" view in DRF.',
    },
  ],
};
