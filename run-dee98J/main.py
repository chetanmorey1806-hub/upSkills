import math
import re
import unicodedata

def slugify(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value.lower())
    return re.sub(r"[-\s]+", "-", value).strip("-_")

def reading_time(text, wpm=200):
    return max(1, math.ceil(len(text.split()) / wpm))

titles = ["Django Tips for Freshers!", "  Semester   Exam -- Timetable ", "Café & Résumé 2026"]
for t in titles:
    print(repr(t), "->", slugify(t))

body = "word " * 450
print("450 words ->", reading_time(body), "min read")
print("short post ->", reading_time("Hello campus"), "min read")