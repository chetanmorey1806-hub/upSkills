export default {
  lesson: 'day-05-viewsets-and-routers',
  minutes: 30,
  intro: 'Practise ViewSets, routers, generated URL names and @action, and write the URL table a router generates in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'With `router.register(\'books\', BookViewSet)` and a `ModelViewSet`, which action runs for `PATCH /books/7/`?',
      options: ['update', 'partial_update', 'retrieve', 'destroy'],
      answer: 1,
      explain: 'ViewSets use action names instead of HTTP methods: list/create on `/books/`, retrieve (GET), update (PUT), **partial_update (PATCH)** and destroy (DELETE) on `/books/{pk}/`. The router maps methods to actions for you.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the decorator for an extra endpoint `POST /books/{pk}/publish/` on the ViewSet:\n\n```\n______\ndef publish(self, request, pk=None):\n    book = self.get_object()\n    ...\n```',
      accept: ["@action(detail=True, methods=['post'])", '@action(detail=True, methods=["post"])', "@action(methods=['post'], detail=True)", '@action(methods=["post"], detail=True)', "@action(detail=True, methods=['POST'])", '@action(detail=True, methods=["POST"])'],
      explain: '`detail=True` puts the action on a single object URL (`/books/{pk}/publish/`); `detail=False` puts it on the collection (`/books/recent/`). The default method is GET, so `methods=[\'post\']` is needed. The router picks the action up automatically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'ReadOnlyModelViewSet provides only list and retrieve',
        'DefaultRouter also creates an API root view at / listing all registered endpoints',
        'The generated URL names are <basename>-list and <basename>-detail',
        'A ViewSet must be added to urls.py with path() for every action',
        'basename is required when the ViewSet has no queryset attribute',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Routers generate the URL patterns from the ViewSet, so you do not write `path()` per action. Names are `book-list`, `book-detail` (used by `reverse` and hyperlinked serializers). The basename comes from `queryset.model` - if you only define `get_queryset()`, pass `basename=` yourself. DefaultRouter = SimpleRouter + API root + format suffixes.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.routers import SimpleRouter

class BookViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])
    def retrieve(self, request, pk=None):
        return Response({})
    def destroy(self, request, pk=None):
        return Response(status=204)

router = SimpleRouter()
router.register('books', BookViewSet, basename='book')
for url in router.urls:
    print(url.name, sorted(url.callback.actions.items()))`,
      expected: "book-list [('get', 'list')]\nbook-detail [('delete', 'destroy'), ('get', 'retrieve')]",
      explain: 'The router only maps the actions that the ViewSet actually defines: `list` → GET on `book-list`; `retrieve` and `destroy` → GET and DELETE on `book-detail`. Since there is no `create` or `update`, POST/PUT/PATCH would get 405.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `router_urls(prefix, basename, actions, extra=())` that returns the list of routes a SimpleRouter would generate, as tuples `(url, name, {method: action})`:\n- list route `^{prefix}/$` named `{basename}-list` with `get→list`, `post→create` (only those actions that exist in `actions`)\n- detail route `^{prefix}/{pk}/$` named `{basename}-detail` with `get→retrieve`, `put→update`, `patch→partial_update`, `delete→destroy`\n- every `extra` item `(name, detail, method)` (from `@action`) adds `^{prefix}/{pk}/{name}/$` (detail) or `^{prefix}/{name}/$` (not detail) named `{basename}-{name}` with `{method: name}`\n\nSkip routes with no methods. Order: list, detail, then extras.',
      example: { title: 'keeping only methods whose action exists', code: "MAP = {'get': 'list', 'post': 'create'}\nactions = {'list'}\nprint({m: a for m, a in MAP.items() if a in actions})   # {'get': 'list'}" },
      starter: `def router_urls(prefix, basename, actions, extra=()):
    routes = []
    # TODO
    return routes
`,
      solution: `LIST = {'get': 'list', 'post': 'create'}
DETAIL = {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}

def router_urls(prefix, basename, actions, extra=()):
    routes = []
    m = {k: v for k, v in LIST.items() if v in actions}
    if m:
        routes.append((f'^{prefix}/$', f'{basename}-list', m))
    m = {k: v for k, v in DETAIL.items() if v in actions}
    if m:
        routes.append((f'^{prefix}/{{pk}}/$', f'{basename}-detail', m))
    for name, detail, method in extra:
        url = f'^{prefix}/{{pk}}/{name}/$' if detail else f'^{prefix}/{name}/$'
        routes.append((url, f'{basename}-{name}', {method: name}))
    return routes
`,
      tests: [
        { call: "router_urls('books', 'book', {'list', 'create', 'retrieve', 'update', 'partial_update', 'destroy'})", expect: [['^books/$', 'book-list', { get: 'list', post: 'create' }], ['^books/{pk}/$', 'book-detail', { get: 'retrieve', put: 'update', patch: 'partial_update', delete: 'destroy' }]] },
        { call: "router_urls('courses', 'course', {'list', 'retrieve'})", expect: [['^courses/$', 'course-list', { get: 'list' }], ['^courses/{pk}/$', 'course-detail', { get: 'retrieve' }]] },
        { call: "router_urls('books', 'book', {'list'}, [('publish', True, 'post'), ('recent', False, 'get')])", expect: [['^books/$', 'book-list', { get: 'list' }], ['^books/{pk}/publish/$', 'book-publish', { post: 'publish' }], ['^books/recent/$', 'book-recent', { get: 'recent' }]] },
      ],
      explain: 'This is the whole trick of routers: two URL patterns per ViewSet plus one per `@action`, each with a method→action map that `as_view(actions)` uses. Read-only ViewSets therefore get only GET routes, and extra actions are named `basename-action_name` (`url_path`/`url_name` can change these).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'ViewSets often choose a different serializer per action. Write `get_serializer_name(action)` returning `\'BookListSerializer\'` for `list`, `\'BookWriteSerializer\'` for `create`, `update` and `partial_update`, and `\'BookDetailSerializer\'` for everything else (retrieve, custom actions, None).',
      example: { title: 'a ViewSet hook', code: "def get_serializer_class(self):\n    if self.action == 'list':\n        return BookListSerializer\n    return BookDetailSerializer" },
      starter: `def get_serializer_name(action):
    # TODO
    return ''
`,
      solution: `def get_serializer_name(action):
    if action == 'list':
        return 'BookListSerializer'
    if action in ('create', 'update', 'partial_update'):
        return 'BookWriteSerializer'
    return 'BookDetailSerializer'
`,
      tests: [
        { call: "get_serializer_name('list')", expect: 'BookListSerializer' },
        { call: "[get_serializer_name(a) for a in ['create', 'update', 'partial_update']]", expect: ['BookWriteSerializer', 'BookWriteSerializer', 'BookWriteSerializer'] },
        { call: "get_serializer_name('retrieve')", expect: 'BookDetailSerializer' },
        { call: "get_serializer_name('publish')", expect: 'BookDetailSerializer' },
        { call: 'get_serializer_name(None)', expect: 'BookDetailSerializer', msg: 'self.action can be None (e.g. OPTIONS or the browsable API form)' },
      ],
      explain: 'Inside a ViewSet `self.action` tells you which action runs, so `get_serializer_class()` / `get_permissions()` / `get_queryset()` can differ per action: a light serializer for lists, a detailed one for one object, and a write serializer that accepts ids. Always handle the default case - `self.action` may be `None`.',
    },
  ],
};
