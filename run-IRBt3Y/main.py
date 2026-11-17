ALLOWED = {"jpg", "jpeg", "png", "pdf"}
MAX_BYTES = 2 * 1024 * 1024

def validate(name, size):
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED:
        return f"{name}: rejected (extension '{ext}' not allowed)"
    if size > MAX_BYTES:
        return f"{name}: rejected ({size / 1024 / 1024:.1f} MB > 2 MB)"
    return f"{name}: accepted"

uploads = [("asha.JPG", 350_000), ("notes.txt", 1200), ("scan.pdf", 5_500_000), ("README", 10)]
for name, size in uploads:
    print(validate(name, size))