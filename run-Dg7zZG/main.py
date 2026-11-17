import hashlib, base64, hmac

def make_password(raw, salt, iterations=1000):
    dk = hashlib.pbkdf2_hmac("sha256", raw.encode(), salt.encode(), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${base64.b64encode(dk).decode()}"

def check_password(raw, encoded):
    algo, iterations, salt, _ = encoded.split("$")
    return hmac.compare_digest(make_password(raw, salt, int(iterations)), encoded)

h1 = make_password("S3cret!pass", "saltA")
h2 = make_password("S3cret!pass", "saltB")
print(h1 == h2)
print(h1.split("$")[:3])
print(check_password("S3cret!pass", h1))
print(check_password("wrong", h1))