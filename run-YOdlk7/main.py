import math

students = [f"STU{n:03d}" for n in range(1, 24)]   # 23 students
per_page = 5
num_pages = math.ceil(len(students) / per_page)

def get_page(number):
    try:
        number = int(number)
    except (TypeError, ValueError):
        number = 1
    number = max(1, min(number, num_pages))
    start = (number - 1) * per_page
    return number, students[start:start + per_page]

print("Total pages:", num_pages)
for value in [1, "3", "abc", 99]:
    n, items = get_page(value)
    print(f"page {value!r} -> {n}: {items}")