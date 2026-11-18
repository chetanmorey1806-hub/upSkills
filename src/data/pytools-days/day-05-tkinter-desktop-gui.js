export default {
  id: "day-05-tkinter-desktop-gui",
  title: "Desktop GUI Apps with Tkinter: Widgets, Layout, Events and Projects",
  module: "Module 2: Data & Apps",
  day: 5,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Build real desktop applications with Tkinter, Python's built-in GUI toolkit. Learn widgets, the grid/pack layout managers, event handling, variables and message boxes, then build a calculator and a to-do app.",
  objectives: [
    "Create a window and understand the Tkinter event loop (mainloop)",
    "Use common widgets: Label, Entry, Button, Listbox, Checkbutton, Combobox and Text",
    "Arrange widgets with pack and grid without mixing them in the same container",
    "Handle button commands, keyboard events and bind() callbacks",
    "Build and package a calculator and a to-do list app",
  ],
  theory: [
    {
      heading: "What is Tkinter?",
      content: "**Tkinter** is the standard GUI (Graphical User Interface) library that ships with Python. It wraps the Tcl/Tk toolkit and works on Windows, macOS and Linux. You do not need pip install on Windows/macOS; on Ubuntu you may need `sudo apt install python3-tk`.\n\nTkinter is great for internal tools: a billing screen for a small shop, a file renamer, a CSV-to-Excel converter, a student record app. For modern-looking apps companies may choose PyQt/PySide6, Kivy or a web UI, but Tkinter concepts (widgets, layouts, events) transfer to all of them.",
      points: [
        "import tkinter as tk - classic widgets",
        "from tkinter import ttk - themed widgets that look native (ttk.Button, ttk.Combobox, ttk.Treeview)",
        "from tkinter import messagebox, filedialog - ready-made dialogs",
        "Check your install with: python -m tkinter (a small test window opens)",
      ],
    },
    {
      heading: "The Window and the Event Loop",
      content: "Every Tkinter app has one root window created with `tk.Tk()`. You add widgets to it and finally call `root.mainloop()`. mainloop() is an infinite loop that waits for **events** (clicks, key presses, window resize) and calls your functions. Code written after mainloop() runs only after the window closes.\n\nThis is **event-driven programming**: your program does not run top to bottom; it reacts to user actions.",
      syntax: `import tkinter as tk

root = tk.Tk()
root.title("My First App")
root.geometry("400x300")        # width x height
root.resizable(False, False)

tk.Label(root, text="Hello, Tkinter!", font=("Arial", 16)).pack(pady=20)

root.mainloop()
`,
      tip: "Never put a long loop or time.sleep() inside a callback - it freezes the window. Use root.after(ms, func) for timers and threads for slow work.",
    },
    {
      heading: "Common Widgets",
      content: "A **widget** is any element on screen. Each widget takes the parent as the first argument and options like text, width, font, bg, fg.",
      points: [
        "Label - shows text or an image",
        "Entry - single-line text input; read with entry.get(), clear with entry.delete(0, tk.END)",
        "Button - runs a function with command=func (pass the function, do not call it)",
        "Text - multi-line text area; read with text.get(\"1.0\", tk.END)",
        "Listbox - list of items; insert(tk.END, item), curselection(), delete(index)",
        "Checkbutton / Radiobutton - booleans and single choice, linked to a variable",
        "ttk.Combobox - dropdown; ttk.Treeview - table view",
        "Frame - container used to group widgets",
      ],
    },
    {
      heading: "Layout Managers: pack, grid and place",
      content: "Widgets are invisible until you place them with a geometry manager.\n\n**pack()** stacks widgets top-to-bottom or side-by-side (`side=tk.LEFT`); good for simple layouts and toolbars. **grid()** places widgets in rows and columns (`row=0, column=1, sticky=\"ew\", padx=5`); best for forms and calculators. **place()** uses exact x/y coordinates - avoid it except for special cases because it does not adapt to resizing.\n\nRule: inside one container, use only one of pack or grid. Mixing them in the same parent makes Tkinter hang or raise an error. Use Frames to combine: a Frame packed in root can use grid inside it.",
      syntax: `tk.Label(root, text="Name").grid(row=0, column=0, sticky="w", padx=5, pady=5)
tk.Entry(root).grid(row=0, column=1, sticky="ew")
root.columnconfigure(1, weight=1)   # column 1 stretches when window grows
`,
    },
    {
      heading: "Events, Callbacks and Control Variables",
      content: "Buttons use `command=func`. If you need arguments, use a lambda: `command=lambda: press(\"7\")`. For other events use `widget.bind(\"<Event>\", handler)`; the handler receives an event object. Common events: `<Return>` (Enter key), `<Button-1>` (left click), `<KeyRelease>`, `<Double-Button-1>`.\n\n**Control variables** (`StringVar`, `IntVar`, `BooleanVar`, `DoubleVar`) connect a widget and Python data: when the variable changes, the widget updates automatically.",
      syntax: `name_var = tk.StringVar()
entry = tk.Entry(root, textvariable=name_var)
entry.bind("<Return>", lambda event: greet())

def greet():
    label.config(text=f"Hello {name_var.get()}")
`,
      tip: "A classic bug: command=save() calls save immediately when the window is built. Write command=save without parentheses.",
    },
    {
      heading: "Dialogs, Classes and Packaging",
      content: "`messagebox.showinfo`, `showerror`, `askyesno` give popups. `filedialog.askopenfilename()` lets the user pick a file. For bigger apps, write the GUI as a **class** (e.g. `class TodoApp:`) so widgets are attributes and callbacks are methods - easier to test and maintain.\n\nTo share the app with non-programmers, convert it to an .exe with **PyInstaller**: `pip install pyinstaller` then `pyinstaller --onefile --windowed app.py`. The executable appears in the dist folder. `--windowed` hides the black console window.",
      points: [
        "Store data in JSON or sqlite3 so it survives restarts",
        "Use try/except around int()/float() conversions and show messagebox.showerror",
        "Separate logic (pure functions) from GUI code so logic can be unit tested",
      ],
    },
  ],
  examples: [
    {
      title: "Greeting Form with Entry, Button and Enter Key",
      scenario: "A reception desk app asks the visitor's name and shows a welcome message when they click the button or press Enter.",
      steps: [
        "Check Tkinter: python -m tkinter (Ubuntu: sudo apt install python3-tk if missing)",
        "Create greet.py and paste the code",
        "Run: python greet.py",
        "Type a name and press Enter or click Greet",
      ],
      code: `import tkinter as tk
from tkinter import messagebox

def greet(event=None):
    name = name_var.get().strip()
    if not name:
        messagebox.showwarning("Missing", "Please enter your name")
        return
    result.config(text=f"Welcome, {name}!", fg="green")
    name_var.set("")

root = tk.Tk()
root.title("Reception")
root.geometry("320x160")

name_var = tk.StringVar()
tk.Label(root, text="Your name:").grid(row=0, column=0, padx=10, pady=10, sticky="w")
entry = tk.Entry(root, textvariable=name_var, width=20)
entry.grid(row=0, column=1, padx=10)
entry.bind("<Return>", greet)
entry.focus()

tk.Button(root, text="Greet", command=greet).grid(row=1, column=0, columnspan=2, pady=5)
result = tk.Label(root, text="", font=("Arial", 12))
result.grid(row=2, column=0, columnspan=2)

root.mainloop()
`,
      result: `A 320x160 window titled "Reception" opens. Typing "Asha" and pressing Enter shows "Welcome, Asha!" in green and clears the entry. Clicking Greet with an empty box shows a "Missing" warning popup.`,
      explanation: "greet(event=None) works for both the Button (no argument) and the bind() call (passes an event). StringVar links the entry to Python; set(\"\") clears it. grid with columnspan=2 centres the button under both columns.",
    },
    {
      title: "Calculator App with grid Layout",
      scenario: "Build a simple calculator - a classic fresher project and interview demo.",
      steps: [
        "Create calculator.py and paste the code",
        "Run: python calculator.py",
        "Click 12 + 7 * 2 then = and verify the answer 26",
        "Try dividing by zero to see the error handling",
      ],
      code: `import tkinter as tk

class Calculator:
    def __init__(self, root):
        self.root = root
        root.title("Calculator")
        self.expr = tk.StringVar()
        display = tk.Entry(root, textvariable=self.expr, font=("Arial", 20),
                           justify="right", bd=8)
        display.grid(row=0, column=0, columnspan=4, sticky="nsew")

        buttons = [
            "7", "8", "9", "/",
            "4", "5", "6", "*",
            "1", "2", "3", "-",
            "C", "0", "=", "+",
        ]
        for i, label in enumerate(buttons):
            row, col = divmod(i, 4)
            tk.Button(root, text=label, width=5, height=2, font=("Arial", 14),
                      command=lambda l=label: self.on_click(l)
                      ).grid(row=row + 1, column=col, sticky="nsew")
        for c in range(4):
            root.columnconfigure(c, weight=1)
        root.bind("<Return>", lambda e: self.on_click("="))

    def on_click(self, key):
        if key == "C":
            self.expr.set("")
        elif key == "=":
            self.expr.set(self.evaluate(self.expr.get()))
        else:
            self.expr.set(self.expr.get() + key)

    @staticmethod
    def evaluate(text):
        allowed = set("0123456789+-*/. ")
        if not text or not set(text) <= allowed:
            return "Error"
        try:
            return str(eval(text, {"__builtins__": {}}))
        except (ZeroDivisionError, SyntaxError):
            return "Error"

if __name__ == "__main__":
    root = tk.Tk()
    Calculator(root)
    root.mainloop()
`,
      result: `A 4x4 calculator window appears. Pressing 1 2 + 7 * 2 = shows 26. Pressing 5 / 0 = shows Error. C clears the display.`,
      explanation: "divmod(i, 4) converts the button index into a row and column. The lambda uses a default argument l=label - without it every button would use the last value of label (late binding). eval is only allowed after checking the text contains digits and operators, and builtins are removed, which keeps it safe for this app. evaluate() is a static method with no GUI code, so it can be unit tested.",
    },
    {
      title: "To-Do App with Listbox and JSON Storage",
      scenario: "A student wants a desktop to-do list that remembers tasks after closing the app.",
      steps: [
        "Create todo.py and paste the code",
        "Run: python todo.py",
        "Add tasks, double-click a task to delete it, close and reopen the app",
        "A tasks.json file is created next to the script",
      ],
      code: `import json
import tkinter as tk
from pathlib import Path
from tkinter import messagebox

DATA = Path(__file__).with_name("tasks.json")

class TodoApp:
    def __init__(self, root):
        root.title("My To-Do")
        top = tk.Frame(root)
        top.pack(fill="x", padx=10, pady=10)
        self.task_var = tk.StringVar()
        entry = tk.Entry(top, textvariable=self.task_var)
        entry.pack(side="left", fill="x", expand=True)
        entry.bind("<Return>", lambda e: self.add())
        tk.Button(top, text="Add", command=self.add).pack(side="left", padx=5)

        self.listbox = tk.Listbox(root, height=10)
        self.listbox.pack(fill="both", expand=True, padx=10)
        self.listbox.bind("<Double-Button-1>", lambda e: self.delete())
        tk.Button(root, text="Delete selected", command=self.delete).pack(pady=8)

        for task in self.load():
            self.listbox.insert(tk.END, task)

    def add(self):
        task = self.task_var.get().strip()
        if task:
            self.listbox.insert(tk.END, task)
            self.task_var.set("")
            self.save()

    def delete(self):
        selected = self.listbox.curselection()
        if not selected:
            messagebox.showinfo("Info", "Select a task first")
            return
        self.listbox.delete(selected[0])
        self.save()

    def load(self):
        return json.loads(DATA.read_text()) if DATA.exists() else []

    def save(self):
        DATA.write_text(json.dumps(list(self.listbox.get(0, tk.END)), indent=2))

root = tk.Tk()
TodoApp(root)
root.mainloop()
`,
      result: `A window with an entry, Add button and list appears. Adding "Revise SQL joins" and "Practice pytest" shows both in the list and creates tasks.json containing ["Revise SQL joins", "Practice pytest"]. After restarting the app the tasks are still there.`,
      explanation: "A Frame packed at the top holds the entry and button side by side, while the root uses pack for the rest - no mixing within one container. listbox.get(0, tk.END) returns all items as a tuple, saved as JSON after every change. curselection() returns the selected index tuple.",
    },
    {
      title: "Form with Combobox, Checkbutton and Treeview Table",
      scenario: "An HR intern builds an employee entry form that shows records in a table.",
      steps: [
        "Create employees.py and paste the code",
        "Run: python employees.py",
        "Fill the form, choose a department and click Save",
        "Convert to an exe later with: pip install pyinstaller then pyinstaller --onefile --windowed employees.py",
      ],
      code: `import tkinter as tk
from tkinter import ttk, messagebox

root = tk.Tk()
root.title("Employees")

name_var = tk.StringVar()
dept_var = tk.StringVar(value="IT")
remote_var = tk.BooleanVar()

form = ttk.Frame(root, padding=10)
form.pack(fill="x")
ttk.Label(form, text="Name").grid(row=0, column=0, sticky="w")
ttk.Entry(form, textvariable=name_var).grid(row=0, column=1, sticky="ew")
ttk.Label(form, text="Dept").grid(row=1, column=0, sticky="w")
ttk.Combobox(form, textvariable=dept_var, values=["IT", "HR", "Sales"],
             state="readonly").grid(row=1, column=1, sticky="ew")
ttk.Checkbutton(form, text="Remote", variable=remote_var).grid(row=2, column=1, sticky="w")
form.columnconfigure(1, weight=1)

tree = ttk.Treeview(root, columns=("name", "dept", "remote"), show="headings", height=6)
for col in ("name", "dept", "remote"):
    tree.heading(col, text=col.title())
tree.pack(fill="both", expand=True, padx=10, pady=10)

def save():
    if not name_var.get().strip():
        messagebox.showerror("Error", "Name is required")
        return
    tree.insert("", tk.END, values=(name_var.get(), dept_var.get(),
                                    "Yes" if remote_var.get() else "No"))
    name_var.set("")
    remote_var.set(False)

ttk.Button(form, text="Save", command=save).grid(row=3, column=1, sticky="e", pady=5)
root.mainloop()
`,
      result: `Saving "Ravi", Sales, Remote checked adds a row "Ravi | Sales | Yes" to the table. Clicking Save with an empty name shows an error popup.`,
      explanation: "ttk widgets use the native OS theme. The Combobox with state=\"readonly\" prevents typing invalid departments. BooleanVar holds the checkbox state. Treeview with show=\"headings\" acts like a table; insert(\"\", END, values=...) adds a row.",
    },
  ],
  interview: [
    { q: "What is Tkinter and does it need installation?", a: "Tkinter is Python's standard GUI library, a wrapper around Tcl/Tk. It ships with the official Windows/macOS installers; some Linux distros need the python3-tk package. Test it with python -m tkinter.", level: "Easy" },
    { q: "What does mainloop() do?", a: "It starts the event loop: it keeps the window open, waits for events like clicks and key presses, and dispatches them to the bound callbacks. It blocks until the window is closed.", level: "Easy" },
    { q: "Difference between pack, grid and place?", a: "pack stacks widgets in a direction, grid arranges them in rows and columns (best for forms), place uses absolute coordinates. Do not mix pack and grid in the same parent container; use Frames to combine them.", level: "Easy" },
    { q: "Why does command=func() run the function immediately?", a: "Because the parentheses call func while building the button and pass its return value (often None) as the command. Pass the function object: command=func, or use lambda: func(arg) when arguments are needed.", level: "Medium" },
    { q: "Explain the lambda late-binding bug when creating buttons in a loop.", a: "lambda: press(label) looks up label when clicked, by which time the loop finished, so every button uses the last label. Fix by binding the current value as a default argument: lambda l=label: press(l), or use functools.partial(press, label).", level: "Hard" },
    { q: "What are StringVar and IntVar?", a: "Tkinter control variables that hold a value and notify linked widgets when it changes. Use .get() and .set(). They connect Entry/Label/Checkbutton widgets to Python data and support trace_add for change callbacks.", level: "Medium" },
    { q: "How do you keep a Tkinter GUI from freezing during a long task?", a: "Never block the main thread. Run the work in a threading.Thread and send results back to the GUI thread (e.g. via a queue polled with root.after), or split work into small chunks scheduled with root.after. Tkinter widgets should only be updated from the main thread.", level: "Hard" },
    { q: "What is bind() and what does the handler receive?", a: "widget.bind(\"<Event>\", handler) attaches a handler for an event pattern such as <Return>, <Button-1> or <KeyRelease>. The handler receives an Event object with details like event.x, event.y, event.keysym and event.widget.", level: "Medium" },
    { q: "Difference between tk and ttk widgets?", a: "tk widgets are the classic ones styled via options like bg/fg. ttk (themed Tk) widgets follow the native OS look and are styled with ttk.Style; ttk also adds widgets like Combobox, Treeview, Notebook and Progressbar.", level: "Medium" },
    { q: "How would you distribute a Tkinter app to users without Python?", a: "Use PyInstaller: pyinstaller --onefile --windowed app.py creates a standalone executable in dist/. Build on each target OS separately; include data files with --add-data. Alternatives: cx_Freeze, Nuitka, briefcase.", level: "Medium" },
    { q: "How do you structure a larger Tkinter application?", a: "Use classes (one per window or frame), keep business logic in separate modules with pure functions, store data in sqlite3/JSON, and keep callbacks thin. This makes logic unit-testable without opening windows.", level: "Medium" },
    { q: "When would you not choose Tkinter?", a: "When you need a modern polished UI, complex widgets, web access from anywhere, or mobile support. Choose PySide6/PyQt for rich desktop apps, Kivy for touch/mobile, or a web framework/Streamlit when users should access via a browser.", level: "Easy" },
  ],
  practice: [
    {
      task: "Build a temperature converter: an Entry for Celsius, a Convert button and a Label showing Fahrenheit. Show an error popup if the input is not a number.",
      hint: "F = C * 9/5 + 32. Wrap float() in try/except ValueError.",
      solution: `import tkinter as tk
from tkinter import messagebox

def convert():
    try:
        c = float(entry.get())
    except ValueError:
        messagebox.showerror("Error", "Enter a number")
        return
    result.config(text=f"{c * 9 / 5 + 32:.1f} F")

root = tk.Tk()
root.title("Converter")
entry = tk.Entry(root)
entry.pack(padx=10, pady=5)
tk.Button(root, text="Convert", command=convert).pack()
result = tk.Label(root, text="")
result.pack(pady=5)
root.mainloop()
`,
    },
    {
      task: "Create a login window with Username and Password entries (password hidden) and a Login button. If username is admin and password is 1234 show \"Login successful\", else show an error.",
      hint: "Use Entry(show=\"*\") and grid for the form.",
      solution: `import tkinter as tk
from tkinter import messagebox

def login():
    if user.get() == "admin" and pwd.get() == "1234":
        messagebox.showinfo("Success", "Login successful")
    else:
        messagebox.showerror("Failed", "Invalid credentials")

root = tk.Tk()
root.title("Login")
tk.Label(root, text="Username").grid(row=0, column=0, padx=5, pady=5)
user = tk.Entry(root)
user.grid(row=0, column=1)
tk.Label(root, text="Password").grid(row=1, column=0, padx=5, pady=5)
pwd = tk.Entry(root, show="*")
pwd.grid(row=1, column=1)
tk.Button(root, text="Login", command=login).grid(row=2, column=1, sticky="e", pady=5)
root.mainloop()
`,
    },
    {
      task: "Make a digital clock label that updates every second without freezing the window.",
      hint: "Use time.strftime and root.after(1000, tick) instead of a while loop.",
      solution: `import time
import tkinter as tk

root = tk.Tk()
root.title("Clock")
label = tk.Label(root, font=("Consolas", 32))
label.pack(padx=20, pady=20)

def tick():
    label.config(text=time.strftime("%H:%M:%S"))
    root.after(1000, tick)

tick()
root.mainloop()
`,
    },
    {
      task: "Extend the To-Do app to store tasks in a sqlite3 database file instead of JSON (table tasks with id and title).",
      hint: "Create the table in __init__, INSERT in add(), DELETE by title in delete(), SELECT in load().",
      solution: `import sqlite3

class TaskStore:
    def __init__(self, path="tasks.db"):
        self.conn = sqlite3.connect(path)
        self.conn.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT)")

    def all(self):
        return [r[0] for r in self.conn.execute("SELECT title FROM tasks ORDER BY id")]

    def add(self, title):
        with self.conn:
            self.conn.execute("INSERT INTO tasks (title) VALUES (?)", (title,))

    def delete(self, title):
        with self.conn:
            self.conn.execute("DELETE FROM tasks WHERE title = ?", (title,))

# In TodoApp: self.store = TaskStore(); load with self.store.all();
# in add(): self.store.add(task); in delete():
#   title = self.listbox.get(selected[0]); self.store.delete(title)
`,
    },
  ],
  quiz: [
    { question: "Which call starts the Tkinter event loop?", options: ["root.run()", "root.start()", "root.mainloop()", "tk.loop()"], answer: 2, explanation: "mainloop() waits for and dispatches events until the window closes." },
    { question: "Which layout manager is best for a form with labels and entries in rows?", options: ["place", "grid", "pack", "flex"], answer: 1, explanation: "grid arranges widgets in rows and columns, ideal for forms and calculators." },
    { question: "How do you read text from an Entry widget named e?", options: ["e.text", "e.value()", "e.get()", "e.read()"], answer: 2, explanation: "Entry.get() returns the current string." },
    { question: "What is the correct way to run update() when a button is clicked?", options: ["command=update()", "command=update", "onclick=update", "command='update'"], answer: 1, explanation: "Pass the function object; parentheses would call it immediately." },
    { question: "Which method schedules a function to run after 1 second without freezing the GUI?", options: ["time.sleep(1)", "root.after(1000, func)", "root.wait(1)", "root.delay(func, 1)"], answer: 1, explanation: "after(ms, func) schedules func in the event loop; sleep blocks it." },
    { question: "Which command builds a single-file Windows executable without a console window?", options: ["pip build app.py", "python -m tkinter app.py", "pyinstaller --onefile --windowed app.py", "tk compile app.py"], answer: 2, explanation: "PyInstaller with --onefile bundles one exe and --windowed hides the console." },
  ],
};
