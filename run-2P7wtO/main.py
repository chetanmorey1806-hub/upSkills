class FakeClock:
    now = 0

class TTLCache:
    def __init__(self):
        self.store = {}
    def get(self, key):
        item = self.store.get(key)
        if item and item[1] > FakeClock.now:
            return item[0]
        self.store.pop(key, None)
        return None
    def set(self, key, value, timeout):
        self.store[key] = (value, FakeClock.now + timeout)
    def get_or_set(self, key, func, timeout):
        value = self.get(key)
        if value is None:
            print(f"t={FakeClock.now}: MISS -> computing")
            value = func()
            self.set(key, value, timeout)
        else:
            print(f"t={FakeClock.now}: HIT")
        return value

db_calls = 0
def top_scorers():
    global db_calls
    db_calls += 1
    return ["Asha", "Meena"]

cache = TTLCache()
for t in [0, 10, 59, 60, 61]:
    FakeClock.now = t
    cache.get_or_set("top", top_scorers, timeout=60)
print("database calls:", db_calls)