import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE student (name TEXT, marks INT)")
con.executemany("INSERT INTO student VALUES (?, ?)", [("Asha", 91), ("Ravi", 78), ("Meena", 85)])

user_input = "x' OR '1'='1"

unsafe_sql = f"SELECT name FROM student WHERE name = '{user_input}'"
print("Unsafe:", con.execute(unsafe_sql).fetchall())

safe = con.execute("SELECT name FROM student WHERE name = ?", (user_input,)).fetchall()
print("Safe:", safe)

print("Normal:", con.execute("SELECT name FROM student WHERE name = ?", ("Ravi",)).fetchall())