export default {
  id: "day-16-structured-output-json-tables",
  title: "Structured Output: JSON, Tables, Bullet Formats and Templates",
  module: "Module 3: Prompt Engineering",
  day: 16,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn to make AI output predictable and machine-readable: Markdown tables you can paste into Excel, JSON that code can parse, consistent bullet formats and fill-in templates - plus the Claude API's structured outputs feature.",
  objectives: [
    "Request Markdown tables, CSV and bullet formats that paste cleanly into Excel/Word",
    "Write prompts that return valid JSON with a fixed schema",
    "Use templates with placeholders to get identical structure every time",
    "Validate structured output in code and handle bad output",
    "Know how API structured outputs (output_config.format) guarantee schema-valid JSON"
  ],
  theory: [
    {
      heading: "Why structure matters",
      content: "Free-form paragraphs are fine for reading, but at work AI output usually goes somewhere: an Excel sheet, a Power BI dataset, a database, an email template or another program. If the format changes every time, someone has to clean it manually. Structured output means the AI always returns the same shape - same columns, same keys, same order. Analogy: a bank form with fixed boxes is easy to process; a handwritten letter is not.",
      points: [
        "Tables -> paste into Excel / Word / reports",
        "CSV -> save as .csv and import into Excel or Power BI",
        "JSON -> read by Python, JavaScript, APIs, databases",
        "Templates -> consistent documents (meeting minutes, bug reports, product cards)"
      ]
    },
    {
      heading: "Tables and CSV",
      content: "Ask for a Markdown table with exact column names and order. Markdown tables render nicely in chat apps and can be copied into Excel. For bigger data, ask for CSV: one header row, comma separated, no extra text. Specify number formats (no currency symbols, no thousand separators) so Excel treats them as numbers.",
      syntax: `Return a Markdown table with columns exactly:
| Employee | Department | Salary | Grade |
Salary as plain number (no Rs, no commas). No text before or after the table.`,
      tip: "If a value may contain commas (like addresses), ask for values to be wrapped in double quotes in CSV, or use a table instead."
    },
    {
      heading: "JSON output",
      content: "JSON (JavaScript Object Notation) is a text format of key-value pairs that almost every programming language can read. To get reliable JSON from a prompt: show the exact schema (keys, types, allowed values), say 'Return only valid JSON, no Markdown fences, no explanation', and state how to represent missing values (null). In code, always parse it with json.loads (Python) or JSON.parse (JavaScript) inside try/except and handle failures.",
      syntax: `Return only valid JSON matching this schema:
{
  "name": string,
  "email": string or null,
  "skills": [string],
  "experience_years": number,
  "level": "Fresher" | "Junior" | "Senior"
}`,
      points: [
        "Use double quotes for keys and strings (JSON rule)",
        "Fix allowed values with enums: \"Fresher\" | \"Junior\" | \"Senior\"",
        "Specify null for missing data instead of empty strings or guesses",
        "Keep key names in snake_case or camelCase consistently"
      ]
    },
    {
      heading: "API structured outputs: guaranteed schema",
      content: "Prompt-only JSON is usually correct but not guaranteed. The Claude API offers structured outputs: you pass a JSON Schema in output_config.format, and the response is constrained to match it. In the Python SDK you can also use client.messages.parse() with a Pydantic model and get a typed object back. OpenAI and Gemini have similar 'JSON mode / response schema' features. Use this for production apps; use prompt-based JSON for quick tasks in a chat window.",
      syntax: `response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract the candidate details: ..."}],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "experience_years": {"type": "number"}
                },
                "required": ["name", "experience_years"],
                "additionalProperties": False
            }
        }
    },
)`
    },
    {
      heading: "Bullet formats and templates",
      content: "For human-readable but consistent output, give a template with headings and placeholders in square brackets. The model fills it exactly. This is perfect for meeting minutes, daily status reports, bug reports, product listings and lesson plans. Also specify bullet rules: number of bullets, max words per bullet, starting each bullet with a verb, etc.",
      syntax: `Fill this template exactly. Keep the headings.

## Daily Status - [Date]
**Done:** [max 3 bullets, start with a verb]
**Planned:** [max 3 bullets]
**Blockers:** [bullets or "None"]`
    },
    {
      heading: "Common problems and fixes",
      content: "Structured prompts fail in predictable ways. Know the fixes.",
      points: [
        "Extra text like 'Here is your JSON:' -> say 'Return only JSON' and/or use API structured outputs",
        "Markdown code fences around JSON -> say 'no code fences' or strip them in code",
        "Missing keys -> mark all keys as required and say 'use null if unknown'",
        "Wrong types ('5 years' instead of 5) -> state the type and give an example",
        "Inconsistent labels -> list allowed values (enum)",
        "Long lists cut off -> increase max_tokens or ask for data in batches"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Resume screening into JSON",
      scenario: "An HR team receives hundreds of resumes. They want key details as JSON so a script can load them into an Excel tracker. The BAD prompt returns a nice paragraph that code cannot use.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run the BAD prompt: you get a paragraph summary",
        "Run the GOOD prompt below with the same resume text",
        "Copy the JSON and paste it into a JSON validator (or the Python IDE example below) to confirm it parses",
        "Optional: run it in AI Prompt Lab and save it as a template named 'Resume to JSON'"
      ],
      code: `BAD PROMPT:
Summarise this resume.

GOOD PROMPT:
Extract candidate details from the resume in <resume> tags.
Return ONLY valid JSON (no code fences, no explanation) with this schema:
{
  "name": string,
  "email": string or null,
  "phone": string or null,
  "skills": [string],
  "experience_years": number,
  "level": "Fresher" | "Junior" | "Senior",
  "last_company": string or null
}
Rules: level = Fresher if experience_years < 1, Junior if 1-4, Senior if > 4.
Use null when a field is not in the resume. Do not guess.

<resume>
Rohit Patil | rohit.patil@example.com
Data Analyst at Infotech Solutions, Pune (Jul 2023 - present)
Intern at DataWave (Jan 2023 - Jun 2023)
Skills: Excel, Power BI, SQL, Python (pandas)
B.Sc. Statistics, 2022
</resume>`,
      prompt: {
        system: "You are a resume parser. Return ONLY valid JSON matching the given schema. No code fences, no explanations. Use null for missing fields; never guess.",
        user: "Schema:\n{\n  \"name\": string,\n  \"email\": string or null,\n  \"phone\": string or null,\n  \"skills\": [string],\n  \"experience_years\": number,\n  \"level\": \"Fresher\" | \"Junior\" | \"Senior\",\n  \"last_company\": string or null\n}\nRules: level = Fresher if experience_years < 1, Junior if 1-4, Senior if > 4. Today is November 2026.\n\n<resume>\nRohit Patil | rohit.patil@example.com\nData Analyst at Infotech Solutions, Pune (Jul 2023 - present)\nIntern at DataWave (Jan 2023 - Jun 2023)\nSkills: Excel, Power BI, SQL, Python (pandas)\nB.Sc. Statistics, 2022\n</resume>"
      },
      result: `{
  "name": "Rohit Patil",
  "email": "rohit.patil@example.com",
  "phone": null,
  "skills": ["Excel", "Power BI", "SQL", "Python (pandas)"],
  "experience_years": 3.3,
  "level": "Junior",
  "last_company": "Infotech Solutions"
}`,
      explanation: "The schema fixes key names and types, the enum fixes level labels, and the null rule stops the model from inventing a phone number. Giving today's date lets it compute experience (Jul 2023 to Nov 2026 is about 3.3 years). Whether the internship counts is a business decision - write it into the rules if it matters."
    },
    {
      title: "Validating AI JSON output in Python",
      scenario: "Before loading AI-generated JSON into a database, a developer validates it: does it parse, are required keys present, are types and enum values correct? This standard-library script checks two sample outputs - one good, one broken.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read which output passes and which fails and why",
        "Paste a real JSON answer from Claude into good_output and run again"
      ],
      code: `import json

REQUIRED = {"name": str, "skills": list, "experience_years": (int, float), "level": str}
LEVELS = {"Fresher", "Junior", "Senior"}

def validate(raw):
    text = raw.strip()
    if text.startswith("\`\`\`"):            # strip code fences if the model added them
        text = text.strip("\`").removeprefix("json").strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return False, "Invalid JSON: " + e.msg
    for key, typ in REQUIRED.items():
        if key not in data:
            return False, "Missing key: " + key
        if not isinstance(data[key], typ):
            return False, "Wrong type for " + key
    if data["level"] not in LEVELS:
        return False, "Bad level: " + data["level"]
    return True, data

good_output = '{"name": "Rohit Patil", "skills": ["Excel", "SQL"], "experience_years": 3.3, "level": "Junior"}'
bad_output = 'Here is the JSON: {"name": "Asha", "experience_years": "2 years", "level": "Mid"}'

for label, raw in [("good", good_output), ("bad", bad_output)]:
    ok, info = validate(raw)
    print(label, "->", "PASS" if ok else "FAIL", "|", info if not ok else info["name"])`,
      python: {
        files: {
          "main.py": `import json

REQUIRED = {"name": str, "skills": list, "experience_years": (int, float), "level": str}
LEVELS = {"Fresher", "Junior", "Senior"}

def validate(raw):
    text = raw.strip()
    if text.startswith("\`\`\`"):            # strip code fences if the model added them
        text = text.strip("\`").removeprefix("json").strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return False, "Invalid JSON: " + e.msg
    for key, typ in REQUIRED.items():
        if key not in data:
            return False, "Missing key: " + key
        if not isinstance(data[key], typ):
            return False, "Wrong type for " + key
    if data["level"] not in LEVELS:
        return False, "Bad level: " + data["level"]
    return True, data

good_output = '{"name": "Rohit Patil", "skills": ["Excel", "SQL"], "experience_years": 3.3, "level": "Junior"}'
bad_output = 'Here is the JSON: {"name": "Asha", "experience_years": "2 years", "level": "Mid"}'

for label, raw in [("good", good_output), ("bad", bad_output)]:
    ok, info = validate(raw)
    print(label, "->", "PASS" if ok else "FAIL", "|", info if not ok else info["name"])
`
        },
        stdin: ""
      },
      prompt: {
        system: "You are a resume parser. Return ONLY valid JSON with keys name (string), skills (array of strings), experience_years (number) and level (one of Fresher, Junior, Senior). No code fences, no explanations.",
        user: "Resume: Asha Kulkarni. Junior QA Engineer at TestPro since Nov 2024 (2 years as of Nov 2026). Skills: Selenium, SQL, Jira."
      },
      result: `good -> PASS | Rohit Patil
bad -> FAIL | Invalid JSON: Expecting value`,
      explanation: "The bad output fails because of the extra 'Here is the JSON:' text, which is exactly why prompts say 'Return ONLY JSON'. Even if you fixed that, it would still fail on 'experience_years' being a string and 'Mid' not being an allowed level. In production, validate every response and retry or flag failures - or use API structured outputs to guarantee the schema."
    },
    {
      title: "Table output for Excel: comparing laptops",
      scenario: "A procurement executive needs a comparison of 3 laptop quotes in a table she can paste into Excel and sort.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt with the three quotes",
        "Click the copy button on the answer, paste into Excel cell A1",
        "If columns land in one cell, use Data > Text to Columns with '|' as delimiter, or ask for CSV instead"
      ],
      code: `Convert the 3 vendor quotes below into a Markdown table with columns exactly:
Vendor | Model | RAM_GB | SSD_GB | Warranty_Years | Price
Numbers only in numeric columns (no Rs, no commas, no units).
Sort by Price ascending. No text before or after the table.

<quotes>
A) TechWorld: Dell Inspiron 15, 16GB RAM, 512GB SSD, 1 yr warranty, Rs 58,990
B) CompuMart: HP 250 G10, 8GB, 512GB SSD, 3 years onsite warranty, 49,500/-
C) LaptopHub: Lenovo IdeaPad Slim 3, 16 GB RAM, 1TB SSD, warranty 2 yrs, price Rs. 61,200
</quotes>`,
      prompt: {
        system: "You convert messy text into clean tables. Numbers only in numeric columns. Output only the table.",
        user: "Convert the 3 vendor quotes below into a Markdown table with columns exactly:\nVendor | Model | RAM_GB | SSD_GB | Warranty_Years | Price\nSort by Price ascending. No text before or after the table.\n\n<quotes>\nA) TechWorld: Dell Inspiron 15, 16GB RAM, 512GB SSD, 1 yr warranty, Rs 58,990\nB) CompuMart: HP 250 G10, 8GB, 512GB SSD, 3 years onsite warranty, 49,500/-\nC) LaptopHub: Lenovo IdeaPad Slim 3, 16 GB RAM, 1TB SSD, warranty 2 yrs, price Rs. 61,200\n</quotes>"
      },
      result: `| Vendor    | Model                | RAM_GB | SSD_GB | Warranty_Years | Price |
|-----------|----------------------|--------|--------|----------------|-------|
| CompuMart | HP 250 G10           | 8      | 512    | 3              | 49500 |
| TechWorld | Dell Inspiron 15     | 16     | 512    | 1              | 58990 |
| LaptopHub | Lenovo IdeaPad Slim 3| 16     | 1024   | 2              | 61200 |`,
      explanation: "Fixed column names, 'numbers only' and the sort rule turn three differently written quotes into a clean, sortable dataset. Notice the model converted 1TB to 1024 GB - check unit conversions like this, because some people use 1000."
    },
    {
      title: "Template output: standard bug report",
      scenario: "A QA tester describes a bug in messy words. The team wants every bug report in the same Jira-ready template.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) - or save the template as a Claude Project instruction",
        "Paste the template prompt and the tester's notes",
        "Copy the filled template into Jira / Azure DevOps",
        "Reuse: next time paste only new notes into the same Project"
      ],
      code: `Rewrite the tester's notes into this template. Keep headings exactly.
If information is missing write "Not provided".

**Title:** [short, specific, max 12 words]
**Severity:** [Critical | High | Medium | Low]
**Environment:** [browser/device/version]
**Steps to Reproduce:**
1. ...
**Expected Result:** ...
**Actual Result:** ...
**Notes:** ...

<notes>
on chrome when i apply coupon SAVE10 on cart page and then change qty to 3 the discount
disappears but total still shows old amount. happens every time. checkout still works.
</notes>`,
      prompt: {
        system: "You are a QA lead who writes clear, standard bug reports. Follow the template exactly and write 'Not provided' for missing information.",
        user: "Template:\n**Title:** [short, specific, max 12 words]\n**Severity:** [Critical | High | Medium | Low]\n**Environment:** [browser/device/version]\n**Steps to Reproduce:**\n1. ...\n**Expected Result:** ...\n**Actual Result:** ...\n**Notes:** ...\n\n<notes>\non chrome when i apply coupon SAVE10 on cart page and then change qty to 3 the discount disappears but total still shows old amount. happens every time. checkout still works.\n</notes>"
      },
      result: `**Title:** Coupon discount removed after changing quantity on cart page
**Severity:** High
**Environment:** Chrome (version Not provided), device Not provided
**Steps to Reproduce:**
1. Add any product to the cart
2. Apply coupon SAVE10 on the cart page
3. Change the quantity to 3
**Expected Result:** Discount stays applied and the total updates for the new quantity.
**Actual Result:** Discount disappears but the total still shows the old amount.
**Notes:** Reproducible every time. Checkout still works, so customers may be charged an incorrect amount.`,
      explanation: "The template forces every report into the same shape and 'Not provided' exposes missing info (browser version) instead of hiding it. The severity is the model's judgment - the reviewer should confirm it."
    }
  ],
  tools: [
    { name: "Claude API structured outputs", use: "Guarantee JSON that matches your schema using output_config.format or messages.parse()", url: "https://docs.claude.com" },
    { name: "Claude (claude.ai) Projects", use: "Store a template as project instructions so every chat returns the same structure", url: "https://claude.ai" },
    { name: "Microsoft Excel", use: "Paste tables, use Text to Columns, or open AI-generated CSV files", url: "https://www.microsoft.com/microsoft-365/excel" },
    { name: "Python IDE (in-app)", use: "Validate JSON output with json.loads and simple rules", url: "/tools/python-ide" },
    { name: "AI Prompt Lab (in-app)", use: "Use the Format field to define tables/JSON and save as reusable templates", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What is structured output in the context of LLMs?", a: "Output in a predictable, machine-readable format such as JSON, CSV, a table with fixed columns or a fixed template, so it can be processed by code or pasted into tools without manual cleaning.", level: "Easy" },
    { q: "How do you prompt an LLM to return valid JSON?", a: "Show the exact schema with keys, types and allowed values; say 'return only valid JSON, no code fences or explanation'; define null for missing values; optionally give one example; then validate with a JSON parser.", level: "Easy" },
    { q: "Why should you validate JSON from an LLM even if the prompt asks for JSON?", a: "Prompt-only JSON is not guaranteed: the model may add extra text, wrong types, missing keys or invalid values. Validation prevents bad data from reaching databases or crashing code.", level: "Medium" },
    { q: "What are API structured outputs and why use them?", a: "A feature where you supply a JSON Schema (e.g. output_config.format in the Claude API) and the model's output is constrained to match it, giving schema-valid JSON reliably. It is preferred for production integrations.", level: "Medium" },
    { q: "How do you get AI tables that paste cleanly into Excel?", a: "Specify exact column names, use plain numbers without currency symbols or commas, ask for no extra text, or request CSV and import it.", level: "Easy" },
    { q: "What is an enum in a schema and why is it useful?", a: "A fixed list of allowed values (e.g. 'Low' | 'Medium' | 'High'). It stops the model from inventing labels like 'Moderate', keeping data consistent for filtering and reporting.", level: "Medium" },
    { q: "How should missing information be represented?", a: "Explicitly as null (JSON) or a fixed marker like 'NA' / 'Not provided', and the prompt should forbid guessing. This keeps data honest and easy to filter.", level: "Medium" },
    { q: "A long JSON list from the model is cut off midway. What happened and how do you fix it?", a: "The response hit max_tokens (stop_reason 'max_tokens'). Increase max_tokens, request fewer items per call (batching), or shorten fields. Always check stop_reason before parsing.", level: "Hard" },
    { q: "When would you use a template instead of JSON?", a: "When the output is for humans (reports, minutes, bug tickets) but must be consistent in structure. JSON is for machines; templates are for consistent human-readable documents.", level: "Medium" },
    { q: "How does messages.parse() help in the Python SDK?", a: "You pass a Pydantic model as the output format; the SDK sends the schema and returns a parsed, typed object, removing manual json.loads and validation boilerplate.", level: "Hard" }
  ],
  practice: [
    { task: "Write a prompt that turns 5 lines of your monthly expenses into CSV with columns Date, Item, Category, Amount. Save and open it in Excel.", hint: "Specify allowed categories and 'numbers only'.", solution: "Prompt: 'Convert to CSV with header Date,Item,Category,Amount. Category must be one of Food, Travel, Bills, Shopping, Other. Date DD-MM-YYYY, Amount number only. Output only CSV.' Then paste into Notepad, save as expenses.csv, open in Excel." },
    { task: "Design a JSON schema for a product review analysis: sentiment, rating guess, main issue, would_recommend.", hint: "Use enum for sentiment and boolean for would_recommend.", solution: "{\"sentiment\": \"Positive\"|\"Negative\"|\"Mixed\", \"rating_guess\": number 1-5, \"main_issue\": string or null, \"would_recommend\": boolean}. Prompt: 'Return only valid JSON matching this schema for the review in <review> tags.'" },
    { task: "Extend the Python validator to also check that experience_years is between 0 and 50.", hint: "Add a numeric range check after type checks.", solution: "Add: if not (0 <= data['experience_years'] <= 50): return False, 'experience_years out of range'" },
    { task: "Create a 'Daily Standup' template and use it for 3 days in a Claude Project or Custom GPT.", hint: "Headings: Yesterday, Today, Blockers, each max 3 bullets.", solution: "Project instruction: 'Always rewrite my notes into: ## Standup - [date] / **Yesterday:** max 3 bullets / **Today:** max 3 bullets / **Blockers:** bullets or None. Each bullet max 12 words, start with a verb.'" }
  ],
  quiz: [
    { question: "Which instruction best prevents extra text around JSON?", options: ["Be concise", "Return only valid JSON with no code fences or explanation", "Use a friendly tone", "Write JSON-ish"], answer: 1, explanation: "Explicitly forbid any extra text or fences." },
    { question: "What should a schema say for unknown values?", options: ["Guess a realistic value", "Leave the key out", "Use null (or a fixed marker) and do not guess", "Write 'maybe'"], answer: 2, explanation: "null keeps data honest and keys consistent." },
    { question: "Which Claude API feature guarantees output matching a JSON Schema?", options: ["temperature = 0", "assistant prefill", "top_p", "Structured outputs via output_config.format"], answer: 3, explanation: "Structured outputs constrain the response to the schema; temperature and prefill are not supported." },
    { question: "For numeric columns pasted into Excel, you should ask for:", options: ["Plain numbers without currency symbols or commas", "Numbers written in words", "Rs symbol before every value", "Random formatting"], answer: 0, explanation: "Plain numbers are recognised by Excel as numeric values." },
    { question: "A response stopped with stop_reason 'max_tokens'. What does it mean?", options: ["The model refused", "The output was cut off because it reached the token limit", "The JSON is guaranteed valid", "The API key is wrong"], answer: 1, explanation: "Increase max_tokens or request smaller batches." }
  ]
};
