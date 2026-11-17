class View:
    http_method_names = ["get", "post", "put", "delete"]

    @classmethod
    def as_view(cls):
        def view(request):
            self = cls()              # new object per request
            self.request = request
            return self.dispatch(request)
        return view

    def dispatch(self, request):
        method = request["method"].lower()
        handler = getattr(self, method, None)
        if method not in self.http_method_names or handler is None:
            return "405 Method Not Allowed"
        return handler(request)


class StudentView(View):
    def get(self, request):
        return "200 List of students"

    def post(self, request):
        return "201 Student created: " + request["data"]


view = StudentView.as_view()
print(view({"method": "GET"}))
print(view({"method": "POST", "data": "Asha"}))
print(view({"method": "DELETE"}))