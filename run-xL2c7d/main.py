def view(request):
    print("  -> view runs for", request["path"])
    return {"status": 200, "headers": []}

def make_middleware(name, block=False):
    def factory(get_response):
        def middleware(request):
            print(f"{name}: before")
            if block and request["path"].startswith("/blocked"):
                print(f"{name}: short-circuit")
                return {"status": 403, "headers": [name]}
            response = get_response(request)
            response["headers"].append(name)
            print(f"{name}: after")
            return response
        return middleware
    return factory

MIDDLEWARE = [make_middleware("Security"), make_middleware("Session"), make_middleware("Auth", block=True)]

handler = view
for mw in reversed(MIDDLEWARE):      # Django builds the chain from the bottom up
    handler = mw(handler)

print(handler({"path": "/students/"}))
print(handler({"path": "/blocked/"}))