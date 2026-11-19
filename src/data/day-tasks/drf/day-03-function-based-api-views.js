export default {
  lesson: 'day-03-function-based-api-views',
  minutes: 30,
  intro: 'Practise @api_view CRUD views, request.data vs request.query_params, Response and status constants, and write the dispatch logic of a function-based API view.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a DRF view, where is the parsed JSON body of a POST/PUT/PATCH request?',
      options: ['request.POST', 'request.body', 'request.data', 'request.query_params'],
      answer: 2,
      explain: '`request.data` holds the parsed body for JSON, form and multipart requests (DRF picks the parser from the `Content-Type`). Django\'s `request.POST` only handles form data, `request.body` is raw bytes, and `query_params` is the `?a=b` part.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the return line after a book was created successfully:\n\n```\nserializer = BookSerializer(data=request.data)\nif serializer.is_valid():\n    serializer.save()\n    return ______\nreturn Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)\n```',
      accept: ['Response(serializer.data, status=status.HTTP_201_CREATED)', 'Response(serializer.data, status=201)', 'Response(serializer.data, 201)', 'Response(serializer.data, status.HTTP_201_CREATED)'],
      explain: 'Return the **serialized** new object (`serializer.data`, which now includes its id) with **201 Created**. The `status` module constants (`HTTP_201_CREATED`) make code self-explaining. Returning `request.data` would echo unvalidated input and miss the id.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'get_object_or_404(Book, pk=pk) returns a 404 response automatically when the book does not exist',
        'A successful DELETE usually returns 204 No Content with no body',
        'DRF chooses JSON or the browsable HTML page through content negotiation (Accept header / ?format=)',
        'request.query_params.get("page") returns an int',
        'format_suffix_patterns lets /books.json return JSON',
      ],
      answers: [0, 1, 2, 4],
      explain: '`get_object_or_404` raises `Http404`, which DRF turns into `{"detail": "Not found."}` with status 404. Renderers produce JSON or the browsable API depending on content negotiation, and format suffixes add `.json` URLs. Query params are always **strings** - convert them yourself.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

BOOKS = {1: {'id': 1, 'title': 'Godaan'}}

@api_view(['GET', 'PUT', 'DELETE'])
def book_detail(request, pk):
    book = BOOKS.get(pk)
    if book is None:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PUT':
        book['title'] = request.data.get('title', book['title'])
        return Response(book)
    if request.method == 'DELETE':
        del BOOKS[pk]
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(book)

f = APIRequestFactory()
print(book_detail(f.put('/books/1/', {'title': 'Gaban'}, format='json'), pk=1).data)
r = book_detail(f.delete('/books/1/'), pk=1)
print(r.status_code, r.data)
r = book_detail(f.get('/books/1/'), pk=1)
print(r.status_code, r.data)`,
      expected: "{'id': 1, 'title': 'Gaban'}\n204 None\n404 {'detail': 'Not found.'}",
      explain: 'PUT reads the JSON body from `request.data`. DELETE returns **204** with no body (`data` is None). After the delete the book is gone, so the next GET gets **404**. One function handles retrieve, update and destroy by checking `request.method`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write the logic of a function-based list/create view without DRF. `book_list(method, query, body, books)`:\n- `GET`: optional `query[\'search\']` (case-insensitive substring of title) and `query[\'max_price\']` (a **string**, convert to int; if not a number return `(400, {\'max_price\': \'Enter a whole number.\'})`). Return `(200, [titles])`\n- `POST`: `body` must have a non-empty `title` and an int `price` > 0, else `(400, {\'detail\': \'title and positive price required\'})`. On success append `{\'id\': next_id, \'title\', \'price\'}` to `books` and return `(201, new_book)` (next id = max id + 1, or 1)\n- other methods → `(405, {\'detail\': f\'Method "{method}" not allowed.\'})`',
      example: { title: 'converting a query param safely', code: "page = query.get('page', '1')\nif not page.isdigit():\n    return (400, {'page': 'Enter a whole number.'})\npage = int(page)" },
      starter: `def book_list(method, query, body, books):
    # TODO
    return (200, [])
`,
      solution: `def book_list(method, query, body, books):
    if method == 'GET':
        rows = books
        search = query.get('search')
        if search:
            rows = [b for b in rows if search.lower() in b['title'].lower()]
        if 'max_price' in query:
            mp = query['max_price']
            if not mp.isdigit():
                return (400, {'max_price': 'Enter a whole number.'})
            rows = [b for b in rows if b['price'] <= int(mp)]
        return (200, [b['title'] for b in rows])
    if method == 'POST':
        title = (body or {}).get('title')
        price = (body or {}).get('price')
        if not title or not isinstance(price, int) or isinstance(price, bool) or price <= 0:
            return (400, {'detail': 'title and positive price required'})
        new = {'id': max((b['id'] for b in books), default=0) + 1, 'title': title, 'price': price}
        books.append(new)
        return (201, new)
    return (405, {'detail': f'Method "{method}" not allowed.'})
`,
      tests: [
        { call: "book_list('GET', {}, None, [{'id': 1, 'title': 'Godaan', 'price': 250}, {'id': 2, 'title': 'Gaban', 'price': 180}])", expect: [200, ['Godaan', 'Gaban']] },
        { call: "book_list('GET', {'search': 'GOD', 'max_price': '300'}, None, [{'id': 1, 'title': 'Godaan', 'price': 250}, {'id': 2, 'title': 'Gaban', 'price': 180}])", expect: [200, ['Godaan']] },
        { call: "book_list('GET', {'max_price': 'cheap'}, None, [])", expect: [400, { max_price: 'Enter a whole number.' }] },
        { call: "book_list('POST', {}, {'title': 'Nirmala', 'price': 150}, [{'id': 1, 'title': 'Godaan', 'price': 250}, {'id': 4, 'title': 'Gaban', 'price': 180}])", expect: [201, { id: 5, title: 'Nirmala', price: 150 }] },
        { call: "book_list('POST', {}, {'title': '', 'price': 150}, [])", expect: [400, { detail: 'title and positive price required' }] },
        { call: "book_list('DELETE', {}, None, [])", expect: [405, { detail: 'Method "DELETE" not allowed.' }] },
      ],
      explain: 'Read filters from `query_params` (GET) and new data from `request.data` (POST). Query values are strings - validate before `int()` or a bad value crashes with 500 instead of a helpful 400. The 405 message matches DRF\'s own wording.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `negotiate(accept, url_format=None)` - a simplified DRF content negotiation that picks a renderer:\n- if `url_format` is given (`?format=json` or `.json` suffix): return it if it is `\'json\'` or `\'api\'`, else `\'404\'`\n- else if `\'text/html\'` is in the `accept` header → `\'api\'` (the browsable API)\n- else if `accept` contains `\'application/json\'` or `\'*/*\'` or is empty → `\'json\'`\n- otherwise → `\'406\'` (Not Acceptable)',
      example: { title: 'checking a header', code: "accept = 'text/html,application/xhtml+xml'\nprint('text/html' in accept)   # True" },
      starter: `def negotiate(accept, url_format=None):
    # TODO
    return 'json'
`,
      solution: `def negotiate(accept, url_format=None):
    if url_format:
        return url_format if url_format in ('json', 'api') else '404'
    if 'text/html' in accept:
        return 'api'
    if not accept or 'application/json' in accept or '*/*' in accept:
        return 'json'
    return '406'
`,
      tests: [
        { call: "negotiate('text/html,application/xhtml+xml')", expect: 'api' },
        { call: "negotiate('application/json')", expect: 'json' },
        { call: "negotiate('*/*')", expect: 'json' },
        { call: "negotiate('')", expect: 'json' },
        { call: "negotiate('application/xml')", expect: '406' },
        { call: "negotiate('text/html', 'json')", expect: 'json', msg: 'An explicit format wins over the Accept header' },
        { call: "negotiate('*/*', 'xml')", expect: '404' },
      ],
      explain: 'That is why the same URL shows the HTML browsable API in Chrome (which sends `Accept: text/html`) but JSON in Postman/curl/axios. An explicit `?format=` or `.json` suffix overrides the header; an unsupported Accept gives **406 Not Acceptable**.',
    },
  ],
};
