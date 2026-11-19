export default {
  lesson: 'day-09-async-await-testing-pytest',
  minutes: 35,
  intro: 'Practise async def vs def, the event loop, asyncio.gather and testing with TestClient and pytest, and write real asyncio code and test functions.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'An endpoint is declared `async def` and inside it calls `time.sleep(5)` (or `requests.get(...)`). What happens?',
      options: ['Nothing special, FastAPI makes it async automatically', 'It blocks the event loop: no other request can be served for those 5 seconds', 'FastAPI runs it in a thread pool', 'It raises a SyntaxError'],
      answer: 1,
      explain: 'Inside `async def` everything runs **on the event loop**. A blocking call freezes the whole loop. Either use async libraries (`await asyncio.sleep`, `httpx.AsyncClient`) or declare the endpoint with plain `def`, which FastAPI runs in a thread pool.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'async helps most with I/O-bound work (waiting for DB, network, files)',
        'CPU-heavy work (image processing, big loops) does not get faster with async',
        'asyncio.gather runs several awaitables concurrently and returns their results in order',
        'You can use await inside a normal def function',
        'TestClient lets you test the app without running uvicorn',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Async = concurrency while **waiting**; it does not add CPU power (use processes/workers for that). `gather` returns results in the order you passed the awaitables. `await` is only allowed inside `async def`. `TestClient` calls the ASGI app directly.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the pytest test for `GET /health` which returns `{"status": "ok"}`:\n\n```\nclient = TestClient(app)\n\ndef test_health():\n    r = client.get(\'/health\')\n    assert r.status_code == 200\n    ______\n```',
      accept: ["assert r.json() == {'status': 'ok'}", 'assert r.json() == {"status": "ok"}', "assert r.json()['status'] == 'ok'", 'assert r.json()["status"] == "ok"'],
      explain: 'pytest uses plain `assert`; on failure it shows both sides. Test functions must start with `test_` and live in files named `test_*.py`. `r.json()` parses the body - comparing with `r.text` would compare a string to a dict.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Three "API calls" are simulated with `asyncio.sleep`. A counter records how many calls are running at the same moment. What does this program print?',
      code: `import asyncio

running = 0
peak = 0
finished = []

async def fetch(name, seconds):
    global running, peak
    running += 1
    peak = max(peak, running)
    await asyncio.sleep(seconds)
    running -= 1
    finished.append(name)
    return f'{name} done'

async def main():
    global peak
    results = await asyncio.gather(fetch('weather', 0.3), fetch('news', 0.1), fetch('stocks', 0.2))
    print(results)
    print(finished, peak)

    finished.clear()
    peak = 0
    for name, s in [('a', 0.2), ('b', 0.1)]:
        await fetch(name, s)
    print(finished, peak)

asyncio.run(main())`,
      expected: "['weather done', 'news done', 'stocks done']\n['news', 'stocks', 'weather'] 3\n['a', 'b'] 1",
      explain: '`gather` starts all three calls **at the same time** (peak 3 running), so they finish in order of their wait (news, stocks, weather) and the total time is only the longest wait - yet the results list keeps the order of the arguments. Awaiting one after another in a loop runs one call at a time (peak 1), so the waits add up.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Plan the timing of external API calls. `durations` is a list of call times in ms. Write `timing(durations, limit=None)` that returns a dict:\n- `sequential`: total time when each call is awaited one after another\n- `concurrent`: total time with `asyncio.gather` and **no limit** (all start together)\n- `limited`: total time when at most `limit` calls may run at the same time (like an `asyncio.Semaphore(limit)`): calls start in list order, each new call starts as soon as any running call finishes. If `limit` is `None`, `limited` equals `concurrent`. An empty list gives 0 for all three.',
      example: { title: 'tracking "workers" with a sorted list of finish times', code: "finish = [0, 0]           # 2 workers free at time 0\nt = min(finish)            # earliest free worker\nfinish[finish.index(t)] = t + 300\nprint(finish)              # [300, 0]" },
      starter: `def timing(durations, limit=None):
    # TODO
    return {'sequential': 0, 'concurrent': 0, 'limited': 0}
`,
      solution: `def timing(durations, limit=None):
    if not durations:
        return {'sequential': 0, 'concurrent': 0, 'limited': 0}
    sequential = sum(durations)
    concurrent = max(durations)
    if limit is None:
        limited = concurrent
    else:
        finish = [0] * limit
        for d in durations:
            t = min(finish)
            finish[finish.index(t)] = t + d
        limited = max(finish)
    return {'sequential': sequential, 'concurrent': concurrent, 'limited': limited}
`,
      tests: [
        { call: 'timing([300, 100, 200])', expect: { sequential: 600, concurrent: 300, limited: 300 } },
        { call: 'timing([300, 100, 200], limit=2)', expect: { sequential: 600, concurrent: 300, limited: 300 } },
        { call: 'timing([100, 100, 100, 100], limit=2)', expect: { sequential: 400, concurrent: 100, limited: 200 } },
        { call: 'timing([500, 100, 100, 100, 100], limit=1)', expect: { sequential: 900, concurrent: 500, limited: 900 } },
        { call: 'timing([])', expect: { sequential: 0, concurrent: 0, limited: 0 } },
      ],
      explain: 'Awaiting calls one by one costs the **sum** of their times; `asyncio.gather` overlaps the waiting, so it costs about the **longest** call. A semaphore limit (to respect a partner API\'s rate limit) sits in between. This is why an `async def` endpoint that calls 3 services with `httpx.AsyncClient` + `gather` answers much faster than 3 sequential `requests.get` calls.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write pytest-style test functions for the given `grade(marks)` function. Write **at least 3** functions named `test_...` that use `assert`. Then write `run_tests()` that calls every global function whose name starts with `test_` and returns the number of tests that passed (an `AssertionError` = failed).\n\nThe checker will also run your tests against a **broken** version of `grade` - at least one of your tests must catch the bug.',
      example: { title: 'a pytest test', code: "def test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0" },
      starter: `def grade(marks):
    if marks >= 75:
        return 'Distinction'
    if marks >= 60:
        return 'First Class'
    if marks >= 35:
        return 'Pass'
    return 'Fail'

# TODO: write test_ functions

def run_tests():
    # TODO
    return 0
`,
      solution: `def grade(marks):
    if marks >= 75:
        return 'Distinction'
    if marks >= 60:
        return 'First Class'
    if marks >= 35:
        return 'Pass'
    return 'Fail'

def test_distinction():
    assert grade(75) == 'Distinction'
    assert grade(99) == 'Distinction'

def test_first_class_and_pass():
    assert grade(60) == 'First Class'
    assert grade(74) == 'First Class'
    assert grade(35) == 'Pass'

def test_fail():
    assert grade(34) == 'Fail'
    assert grade(0) == 'Fail'

def run_tests():
    passed = 0
    for name, fn in list(globals().items()):
        if name.startswith('test_') and callable(fn):
            try:
                fn()
                passed += 1
            except AssertionError:
                pass
    return passed
`,
      tests: [
        { call: "len([n for n in globals() if n.startswith('test_')]) >= 3", expect: true, msg: 'Write at least 3 test_ functions' },
        { call: "run_tests() == len([n for n in globals() if n.startswith('test_')])", expect: true, msg: 'All your tests must pass for the correct grade()' },
        { call: "(lambda g: (globals().__setitem__('grade', lambda m: 'Distinction' if m > 75 else ('First Class' if m >= 60 else ('Pass' if m >= 35 else 'Fail'))), run_tests() < len([n for n in globals() if n.startswith('test_')]), globals().__setitem__('grade', g))[1])(grade)", expect: true, msg: 'Your tests must catch a bug at the boundary (grade(75) wrongly gives First Class)' },
      ],
      explain: 'Good tests check the **boundaries** (75, 60, 35 and the values just below), because off-by-one mistakes like `>` instead of `>=` hide there. pytest discovers `test_*` functions automatically, exactly like `run_tests` does here. For FastAPI you combine this with `TestClient` and `dependency_overrides`.',
    },
  ],
};
