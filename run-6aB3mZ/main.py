URLS = {}

def reverse(name):
    return URLS[name]          # fails if URLs are not loaded yet

class Lazy:
    def __init__(self, func, *args):
        self.func, self.args = func, args
    def __str__(self):
        return self.func(*self.args)

def reverse_lazy(name):
    return Lazy(reverse, name)

# class body runs at import time, before URLs exist
try:
    eager = reverse("students:list")
except KeyError:
    print("reverse() failed: URLs not loaded yet")

success_url = reverse_lazy("students:list")
print("lazy object created")

URLS["students:list"] = "/students/"     # URLconf loads later
print("redirect to", str(success_url))