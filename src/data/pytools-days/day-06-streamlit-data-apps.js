export default {
  id: "day-06-streamlit-data-apps",
  title: "Data Apps with Streamlit: Widgets, Charts, Caching and Deployment",
  module: "Module 2: Data & Apps",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Turn Python scripts into interactive web dashboards with Streamlit - no HTML, CSS or JavaScript needed. Learn the rerun model, widgets, layout, charts, session state, caching and free deployment on Streamlit Community Cloud.",
  objectives: [
    "Explain how Streamlit reruns a script on every interaction",
    "Use input widgets, layouts (sidebar, columns, tabs) and forms",
    "Display pandas DataFrames, metrics and charts",
    "Speed up apps with st.cache_data and st.cache_resource and keep state with st.session_state",
    "Deploy a Streamlit app from GitHub to Streamlit Community Cloud with secrets",
  ],
  theory: [
    {
      heading: "What is Streamlit?",
      content: "**Streamlit** is an open-source Python library that turns a plain `.py` script into a web app. Data analysts and ML engineers use it to build dashboards, model demos, internal tools and AI chat apps in hours instead of weeks. It is now owned by Snowflake and is very popular in data science interviews and portfolios.\n\nYou write normal Python; calls like `st.title()`, `st.slider()` and `st.line_chart()` render UI elements in the browser. Run with `streamlit run app.py` and it opens at http://localhost:8501.",
      syntax: `python -m venv venv
venv\\Scripts\\activate          # Windows  (Linux/Mac: source venv/bin/activate)
pip install streamlit pandas
streamlit hello                 # demo app to confirm install
streamlit run app.py            # run your own app
`,
    },
    {
      heading: "The Execution Model: Top-to-Bottom Reruns",
      content: "This is the most important concept. Every time a user changes a widget (moves a slider, clicks a button), Streamlit **reruns your whole script from top to bottom**. Widget functions simply return the current value: `age = st.slider(\"Age\", 18, 60)` gives an int.\n\nConsequences: normal variables reset on every rerun, expensive operations (loading a 1 GB CSV, a model) would run again and again - so we use **caching** and **session state**. A `st.button` returns True only during the single rerun right after it is clicked.",
      points: [
        "Saving the file shows \"Source file changed\" - click Rerun or enable Always rerun",
        "st.write() is a magic function: prints text, numbers, DataFrames, dicts, charts",
        "Writing a variable alone on a line also displays it (Streamlit magic)",
      ],
    },
    {
      heading: "Widgets and Layout",
      content: "Input widgets: `st.text_input`, `st.number_input`, `st.slider`, `st.selectbox`, `st.multiselect`, `st.checkbox`, `st.radio`, `st.date_input`, `st.file_uploader`, `st.button`, `st.download_button`. Output: `st.title`, `st.header`, `st.markdown`, `st.metric`, `st.dataframe`, `st.success`/`st.error`/`st.warning`.\n\nLayout: `st.sidebar` for filters, `st.columns(3)` for side-by-side elements, `st.tabs([...])` for tabbed pages, `st.expander` for collapsible sections, `st.container`. Use the `with` statement to place elements inside them.",
      syntax: `with st.sidebar:
    city = st.selectbox("City", ["Pune", "Mumbai", "Delhi"])
col1, col2 = st.columns(2)
col1.metric("Revenue", "Rs 4.2 L", "+12%")
col2.metric("Orders", 320, "-5")
tab1, tab2 = st.tabs(["Chart", "Data"])
`,
      tip: "Give widgets a unique key=\"...\" when two widgets have the same label, otherwise Streamlit raises DuplicateWidgetID.",
    },
    {
      heading: "Data and Charts",
      content: "Streamlit works naturally with **pandas**. `st.dataframe(df)` shows an interactive, sortable table; `st.data_editor(df)` lets users edit it. Built-in charts: `st.line_chart`, `st.bar_chart`, `st.area_chart`, `st.scatter_chart` and `st.map` (needs lat/lon columns). For more control use `st.plotly_chart(fig)`, `st.altair_chart` or `st.pyplot(fig)` for Matplotlib.",
      points: [
        "st.bar_chart(df, x=\"month\", y=\"sales\") - pick columns directly",
        "st.file_uploader returns a file-like object you can pass to pd.read_csv",
        "st.download_button(\"Download CSV\", df.to_csv(index=False), \"report.csv\")",
      ],
    },
    {
      heading: "Caching and Session State",
      content: "**st.cache_data** caches the return value of functions that produce data (reading CSVs, API calls, SQL queries). Streamlit hashes the arguments; same arguments return a stored copy instantly. Use `ttl=600` to expire after 10 minutes.\n\n**st.cache_resource** caches global resources that should be created once and shared, such as a database connection, an ML model or an LLM client. It does not copy the object.\n\n**st.session_state** is a dictionary-like store that survives reruns for one browser session - use it for counters, login status, a shopping cart or chat history.",
      syntax: `@st.cache_data(ttl=600)
def load_sales(path):
    return pd.read_csv(path)

@st.cache_resource
def get_model():
    return joblib.load("model.pkl")

if "count" not in st.session_state:
    st.session_state.count = 0
`,
      tip: "Interview line: cache_data = serializable data (copied per call); cache_resource = unserializable shared objects like connections and models.",
    },
    {
      heading: "Multipage Apps, Forms and Secrets",
      content: "Put extra pages in a `pages/` folder (e.g. `pages/1_Reports.py`) and Streamlit builds a sidebar menu automatically; the newer `st.navigation` + `st.Page` API gives more control. `st.form` groups widgets so the app reruns only when the submit button is pressed - useful for long forms.\n\nSecrets (API keys, DB passwords) go in `.streamlit/secrets.toml` locally (add it to .gitignore) and are read with `st.secrets[\"DB_URL\"]`. On Streamlit Cloud you paste them in the app settings.",
    },
    {
      heading: "Deploying to Streamlit Community Cloud",
      content: "Streamlit Community Cloud hosts public apps for free from a GitHub repository. Steps: (1) push your project with `app.py` and `requirements.txt` to GitHub; (2) sign in at share.streamlit.io with GitHub; (3) click Create app, choose repo, branch and main file; (4) optionally pick the Python version and add secrets in Advanced settings; (5) Deploy. You get a URL like `https://your-app.streamlit.app`, and every git push redeploys automatically.",
      points: [
        "requirements.txt must list streamlit, pandas and every other import",
        "Apps sleep after inactivity on the free tier and wake up on the next visit",
        "Other options: Docker on Render/Railway, Hugging Face Spaces, or a VM with streamlit run app.py --server.port 8501 behind Nginx",
      ],
    },
  ],
  examples: [
    {
      title: "First App: BMI Calculator with Widgets",
      scenario: "A gym wants a quick web page where members enter height and weight and see their BMI.",
      steps: [
        "Create a folder, a virtual environment and run: pip install streamlit",
        "Save the code as app.py",
        "Run: streamlit run app.py - the browser opens at http://localhost:8501",
        "Move the sliders and notice the page updates instantly (each change reruns the script)",
      ],
      code: `import streamlit as st

st.set_page_config(page_title="BMI Calculator", page_icon="💪")
st.title("BMI Calculator")

name = st.text_input("Your name", "Guest")
height_cm = st.slider("Height (cm)", 120, 220, 170)
weight = st.number_input("Weight (kg)", min_value=30.0, max_value=200.0, value=65.0, step=0.5)

bmi = weight / (height_cm / 100) ** 2
st.metric("Your BMI", f"{bmi:.1f}")

if bmi < 18.5:
    st.warning(f"{name}, you are underweight.")
elif bmi < 25:
    st.success(f"{name}, you are in the healthy range.")
else:
    st.error(f"{name}, you are above the healthy range.")
`,
      result: `With defaults (170 cm, 65 kg) the page shows "Your BMI 22.5" and a green message "Guest, you are in the healthy range." Changing weight to 90 shows BMI 31.1 with a red message.`,
      explanation: "Each widget returns its current value. When any value changes, the script reruns from the top, recomputes bmi and redraws the metric and message. No callbacks or HTML are needed.",
    },
    {
      title: "Sales Dashboard with Sidebar Filters, Metrics and Charts",
      scenario: "A retail manager uploads a monthly sales CSV and wants filters by region, KPIs and charts.",
      steps: [
        "pip install streamlit pandas",
        "Create sales.csv with columns: date,region,product,amount (a few rows is enough)",
        "Save the code as dashboard.py and run: streamlit run dashboard.py",
        "Upload the CSV or let it use the sample data, then use the sidebar filters",
      ],
      code: `import pandas as pd
import streamlit as st

st.set_page_config(page_title="Sales Dashboard", layout="wide")

@st.cache_data
def load_data(file):
    if file is None:
        return pd.DataFrame({
            "date": pd.date_range("2025-01-01", periods=6, freq="MS"),
            "region": ["North", "South", "North", "West", "South", "West"],
            "product": ["Laptop", "Phone", "Phone", "Laptop", "Tablet", "Phone"],
            "amount": [52000, 18000, 21000, 61000, 15000, 19500],
        })
    return pd.read_csv(file, parse_dates=["date"])

uploaded = st.sidebar.file_uploader("Upload sales CSV", type="csv")
df = load_data(uploaded)

regions = st.sidebar.multiselect("Region", sorted(df["region"].unique()),
                                 default=sorted(df["region"].unique()))
filtered = df[df["region"].isin(regions)]

st.title("Sales Dashboard")
c1, c2, c3 = st.columns(3)
c1.metric("Total Sales", f"Rs {filtered['amount'].sum():,}")
c2.metric("Orders", len(filtered))
c3.metric("Avg Order", f"Rs {filtered['amount'].mean():,.0f}" if len(filtered) else "-")

tab1, tab2 = st.tabs(["Charts", "Data"])
with tab1:
    st.subheader("Sales by Region")
    st.bar_chart(filtered.groupby("region")["amount"].sum())
    st.subheader("Monthly Trend")
    st.line_chart(filtered.set_index("date")["amount"])
with tab2:
    st.dataframe(filtered, use_container_width=True)
    st.download_button("Download CSV", filtered.to_csv(index=False), "filtered_sales.csv")
`,
      result: `With sample data and all regions selected: Total Sales Rs 186,500, Orders 6, Avg Order Rs 31,083. The Charts tab shows a bar chart (North 73000, South 33000, West 80500) and a monthly line chart. Removing West from the filter updates all KPIs and charts instantly.`,
      explanation: "load_data is cached, so the CSV is parsed only once per file even though the script reruns on every filter change. The sidebar holds inputs, columns show KPIs side by side, and tabs separate charts from raw data. groupby().sum() returns a Series that st.bar_chart plots directly.",
    },
    {
      title: "Session State: Counter and Shopping Cart",
      scenario: "Show why normal variables reset on rerun and how st.session_state keeps a cart across clicks.",
      steps: [
        "Save as cart.py and run: streamlit run cart.py",
        "Click the Add buttons several times and watch the cart total",
        "Refresh the browser tab - session state resets because it is a new session",
      ],
      code: `import streamlit as st

PRICES = {"Pen": 10, "Notebook": 50, "Bag": 800}

if "cart" not in st.session_state:
    st.session_state.cart = {}

st.title("Mini Shop")
for item, price in PRICES.items():
    col1, col2 = st.columns([3, 1])
    col1.write(f"**{item}** - Rs {price}")
    if col2.button("Add", key=f"add_{item}"):
        st.session_state.cart[item] = st.session_state.cart.get(item, 0) + 1

st.subheader("Cart")
total = 0
for item, qty in st.session_state.cart.items():
    st.write(f"{item} x {qty} = Rs {PRICES[item] * qty}")
    total += PRICES[item] * qty
st.metric("Total", f"Rs {total}")

if st.button("Clear cart"):
    st.session_state.cart = {}
    st.rerun()
`,
      result: `Clicking Add for Pen twice and Bag once shows "Pen x 2 = Rs 20", "Bag x 1 = Rs 800" and Total Rs 820. Clear cart empties it. Without session_state the cart would reset to empty after every click.`,
      explanation: "The dictionary is created only once per session thanks to the 'not in' check. Each button needs a unique key because labels repeat. st.rerun() immediately reruns the script so the cleared cart is shown at once.",
    },
    {
      title: "Deploy to Streamlit Community Cloud",
      scenario: "Publish the sales dashboard so a recruiter can open it with a link from your resume.",
      steps: [
        "Create requirements.txt listing the packages (see code)",
        "Add .streamlit/secrets.toml to .gitignore if you use secrets",
        "git init, git add ., git commit -m \"Add sales dashboard\", then push to a public GitHub repo",
        "Open https://share.streamlit.io, sign in with GitHub, click Create app",
        "Select repo, branch main and main file dashboard.py; add secrets under Advanced settings; click Deploy",
      ],
      code: `# Project structure
sales-dashboard/
├── dashboard.py
├── requirements.txt
├── .gitignore
└── .streamlit/
    ├── config.toml        # optional theme
    └── secrets.toml       # local only, never commit

# requirements.txt
streamlit>=1.40
pandas>=2.2

# .streamlit/secrets.toml (local)
DB_URL = "postgresql://user:password@host:5432/sales"

# read a secret inside the app
import streamlit as st
db_url = st.secrets["DB_URL"]

# terminal
git init
git add .
git commit -m "Add sales dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/sales-dashboard.git
git push -u origin main
`,
      result: `After a few minutes of building, the app is live at a URL like https://sales-dashboard-<name>.streamlit.app. Every new git push to main redeploys the app automatically.`,
      explanation: "Community Cloud installs packages from requirements.txt and runs the main file you choose. Secrets entered in the dashboard are exposed to the app as st.secrets exactly like the local secrets.toml, so the same code works locally and in the cloud without committing passwords.",
    },
  ],
  interview: [
    { q: "What is Streamlit and who uses it?", a: "An open-source Python framework that turns scripts into interactive web apps without front-end code. Data scientists, analysts and ML engineers use it for dashboards, model demos, internal tools and LLM chat apps.", level: "Easy" },
    { q: "Explain Streamlit's execution model.", a: "On every widget interaction the entire script reruns from top to bottom. Widget calls return their current values, and the UI is redrawn. State that must survive reruns goes in st.session_state; expensive work is cached.", level: "Medium" },
    { q: "Difference between st.cache_data and st.cache_resource?", a: "cache_data caches serializable return values (DataFrames, lists, API JSON) and returns a copy per call, keyed on arguments; supports ttl and max_entries. cache_resource caches a single shared object like a DB connection or ML model without copying; all sessions share it, so it must be thread-safe.", level: "Medium" },
    { q: "What is st.session_state used for?", a: "To persist values across reruns within one user's browser session: counters, login flags, form steps, shopping carts, chat history. It behaves like a dict and is separate for each user/tab.", level: "Easy" },
    { q: "Why does a st.button return True only once?", a: "Because button state is not stored: it is True only in the rerun triggered by the click. In the next rerun it is False again. To remember a click, store a flag in st.session_state or use a callback (on_click).", level: "Medium" },
    { q: "How do you stop the app rerunning on every keystroke in a long form?", a: "Wrap the inputs in st.form(\"name\") with st.form_submit_button. Values are sent together and the app reruns only on submit.", level: "Medium" },
    { q: "How do you manage secrets in Streamlit?", a: "Store them in .streamlit/secrets.toml locally (git-ignored) and access via st.secrets[\"KEY\"]. On Community Cloud paste the same TOML in app settings. Environment variables also work with os.environ.", level: "Easy" },
    { q: "How do you create a multipage Streamlit app?", a: "Add Python files in a pages/ directory next to the main script - Streamlit creates a navigation menu automatically. Alternatively define pages with st.Page and st.navigation for custom navigation and titles.", level: "Medium" },
    { q: "Streamlit vs Flask/Django - when would you choose each?", a: "Streamlit for fast data dashboards and ML demos by Python-only teams with limited UI customization. Flask/Django (or FastAPI + React) for full web products needing custom UI, authentication flows, REST APIs, fine-grained routing and high traffic.", level: "Medium" },
    { q: "What are the limitations of Streamlit?", a: "Whole-script rerun model can be inefficient for complex apps, limited layout/styling control, each session holds server memory, no built-in user database or complex auth (though st.login supports OIDC), and it is not ideal for high-traffic public websites or REST APIs.", level: "Hard" },
    { q: "How would you make a slow Streamlit dashboard faster?", a: "Cache data loading with st.cache_data (with ttl), cache connections/models with st.cache_resource, push aggregation to SQL, load only needed columns, use st.form to batch inputs, use st.fragment to rerun only part of the page, and avoid recomputing in loops.", level: "Hard" },
    { q: "How do you deploy a Streamlit app?", a: "Easiest: push to GitHub with requirements.txt and deploy via Streamlit Community Cloud. Other options: Docker container on Render/Railway/AWS, Hugging Face Spaces, or a VM running streamlit run app.py --server.port 8501 --server.address 0.0.0.0 behind Nginx with WebSocket support.", level: "Medium" },
  ],
  practice: [
    {
      task: "Build a Streamlit EMI calculator: inputs for loan amount, annual interest rate and tenure in years; show monthly EMI, total payment and total interest using st.metric in three columns.",
      hint: "EMI = P * r * (1+r)^n / ((1+r)^n - 1), where r = annual_rate/12/100 and n = years*12.",
      solution: `import streamlit as st

st.title("EMI Calculator")
p = st.number_input("Loan amount (Rs)", 10000, 10_000_000, 500000, step=10000)
rate = st.slider("Interest rate (% per year)", 5.0, 20.0, 9.0, 0.1)
years = st.slider("Tenure (years)", 1, 30, 5)

r = rate / 12 / 100
n = years * 12
emi = p * r * (1 + r) ** n / ((1 + r) ** n - 1)
total = emi * n

c1, c2, c3 = st.columns(3)
c1.metric("Monthly EMI", f"Rs {emi:,.0f}")
c2.metric("Total Payment", f"Rs {total:,.0f}")
c3.metric("Total Interest", f"Rs {total - p:,.0f}")
`,
    },
    {
      task: "Create an app with a file_uploader for a CSV; show the number of rows and columns, the first 10 rows, and a selectbox to choose a numeric column whose histogram-like value counts are drawn with st.bar_chart.",
      hint: "Use df.select_dtypes(\"number\").columns for the options and df[col].value_counts().sort_index().",
      solution: `import pandas as pd
import streamlit as st

st.title("CSV Explorer")
file = st.file_uploader("Upload CSV", type="csv")
if file is None:
    st.info("Please upload a CSV file")
    st.stop()

df = pd.read_csv(file)
st.write(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
st.dataframe(df.head(10))

numeric = df.select_dtypes("number").columns
if len(numeric):
    col = st.selectbox("Numeric column", numeric)
    st.bar_chart(df[col].value_counts().sort_index())
`,
    },
    {
      task: "Write a cached function that simulates a slow API (time.sleep(3)) and returns a list of exchange rates. Show that the second run is instant and add a button to clear the cache.",
      hint: "Use @st.cache_data(ttl=300) and load_rates.clear().",
      solution: `import time
import streamlit as st

@st.cache_data(ttl=300)
def load_rates():
    time.sleep(3)  # pretend this is a slow API call
    return {"USD": 84.2, "EUR": 91.5, "GBP": 107.3}

start = time.perf_counter()
rates = load_rates()
st.write(rates)
st.caption(f"Loaded in {time.perf_counter() - start:.2f} s")

if st.button("Refresh rates"):
    load_rates.clear()
    st.rerun()
`,
    },
    {
      task: "Build a simple to-do app in Streamlit using st.session_state: a text_input and Add button, a list of tasks each with a checkbox; checked tasks are shown with strikethrough.",
      hint: "Store a list of dicts {\"title\":..., \"done\":...}; use key=f\"done_{i}\" for checkboxes and markdown ~~text~~ for strikethrough.",
      solution: `import streamlit as st

if "todos" not in st.session_state:
    st.session_state.todos = []

st.title("To-Do")
with st.form("add", clear_on_submit=True):
    title = st.text_input("New task")
    if st.form_submit_button("Add") and title.strip():
        st.session_state.todos.append({"title": title.strip(), "done": False})

for i, todo in enumerate(st.session_state.todos):
    todo["done"] = st.checkbox(
        f"~~{todo['title']}~~" if todo["done"] else todo["title"],
        value=todo["done"], key=f"done_{i}")
`,
    },
  ],
  quiz: [
    { question: "Which command runs a Streamlit app saved as app.py?", options: ["python app.py", "streamlit run app.py", "flask run app.py", "st app.py"], answer: 1, explanation: "streamlit run starts the server, by default on port 8501." },
    { question: "What happens when a user moves a slider?", options: ["Only the slider callback runs", "The whole script reruns top to bottom", "The page reloads from the server cache", "Nothing until a submit button is clicked"], answer: 1, explanation: "Streamlit reruns the entire script on every interaction (except inside forms until submitted)." },
    { question: "Which decorator should cache a database connection object?", options: ["@st.cache_data", "@st.cache_resource", "@functools.cache", "@st.session_state"], answer: 1, explanation: "cache_resource is for shared, unserializable resources like connections and models." },
    { question: "Where should a Streamlit app read its API key from?", options: ["Hard-coded string", "requirements.txt", "st.secrets", "st.session_state"], answer: 2, explanation: "st.secrets reads .streamlit/secrets.toml locally or the secrets set in Streamlit Cloud." },
    { question: "Which file must list packages for Streamlit Community Cloud?", options: ["setup.cfg", "requirements.txt", "Dockerfile", "secrets.toml"], answer: 1, explanation: "Community Cloud installs dependencies from requirements.txt (or pyproject/environment files)." },
    { question: "How do you place a widget in the left sidebar?", options: ["st.left.selectbox()", "st.sidebar.selectbox()", "st.panel.selectbox()", "st.selectbox(side='left')"], answer: 1, explanation: "Prefix with st.sidebar or use 'with st.sidebar:'." },
  ],
};
