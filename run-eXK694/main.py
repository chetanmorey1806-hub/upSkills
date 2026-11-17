import os

os.environ.update({
    "DJANGO_DEBUG": "False",
    "DJANGO_ALLOWED_HOSTS": "portal.example.com, www.portal.example.com",
    "GUNICORN_WORKERS": "5",
})

def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}

def env_list(name, default=""):
    return [x.strip() for x in os.getenv(name, default).split(",") if x.strip()]

def env_int(name, default):
    return int(os.getenv(name, default))

DEBUG = env_bool("DJANGO_DEBUG")
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
WORKERS = env_int("GUNICORN_WORKERS", 3)
CPU = 2
print("DEBUG:", DEBUG)
print("ALLOWED_HOSTS:", ALLOWED_HOSTS)
print("Workers:", WORKERS, "| recommended:", 2 * CPU + 1)
print("SECRET_KEY set:", "DJANGO_SECRET_KEY" in os.environ)