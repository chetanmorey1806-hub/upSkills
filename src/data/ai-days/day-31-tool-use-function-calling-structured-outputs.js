export default {
  id: "day-31-tool-use-function-calling-structured-outputs",
  title: "Tool Use / Function Calling and Structured Outputs",
  module: "Module 5: AI for Developers",
  day: 31,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Give Claude 'hands': describe your own functions (tools) with JSON Schema, let Claude decide when to call them, run them in your code and return the results so Claude can answer with real data. Then get guaranteed machine-readable JSON with structured outputs (output_config.format and client.messages.parse). Includes Python and JavaScript code, a runnable no-API simulation of the tool loop, and safety rules.",
  objectives: [
    "Explain function calling: the model requests a tool, YOUR code runs it, and the result goes back to the model",
    "Define tools with name, description and input_schema (JSON Schema), optionally strict",
    "Implement the tool-use loop: check stop_reason == 'tool_use', run every tool_use block, return tool_result blocks in one user message",
    "Use structured outputs (output_config.format / messages.parse) to get schema-valid JSON",
    "Apply validation, error handling and permission rules to tool calls"
  ],
  theory: [
    {
      heading: "What is tool use (function calling)?",
      content: "A language model on its own only produces text – it can't look up today's weather, query your database or book a meeting. Tool use lets you list functions your app can run. Claude reads the user's request and the tool descriptions, and if a tool would help it replies with a tool_use block: the tool name and JSON arguments. Claude does NOT run the code; your program does, and sends back a tool_result. Then Claude writes the final answer using that data. Analogy: Claude is a manager who can't leave the office; it writes a clear instruction slip ('get_weather, city = Pune'), your assistant (your code) does the job and reports back, and the manager writes the reply to the customer.",
      points: [
        "1) You send: messages + tools (+ tool_choice {type: 'auto'})",
        "2) Claude replies with stop_reason 'tool_use' and one or more tool_use blocks (id, name, input)",
        "3) Your code runs the function(s) with that input",
        "4) You send back a user message containing tool_result blocks (tool_use_id + content)",
        "5) Claude continues – maybe calls more tools – until stop_reason is 'end_turn'"
      ]
    },
    {
      heading: "Defining tools with JSON Schema",
      content: "Each tool has a name, a clear description (when and why to use it) and an input_schema in JSON Schema format describing the arguments: their types, descriptions, enums and which are required. Descriptions matter a lot – they are how Claude decides which tool to call and with what values. Add strict: true (with additionalProperties: false and a required list) to guarantee that tool inputs exactly match the schema.",
      syntax: "{\n  \"name\": \"get_weather\",\n  \"description\": \"Get the current weather for a city. Use when the user asks about weather or temperature.\",\n  \"strict\": true,\n  \"input_schema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"city\": {\"type\": \"string\", \"description\": \"City name, e.g. Pune\"},\n      \"unit\": {\"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"]}\n    },\n    \"required\": [\"city\", \"unit\"],\n    \"additionalProperties\": false\n  }\n}",
      points: [
        "Name: short snake_case verb_noun (get_order, create_ticket)",
        "Description: what it does, when to use it, what it returns, limitations",
        "Use enums for fixed choices, and describe formats (dates as YYYY-MM-DD)",
        "tool_choice: use {type: 'auto'} – Claude decides. Forcing a specific tool ({type: 'any'} / {type: 'tool'}) is rejected on current models; steer with the prompt instead"
      ]
    },
    {
      heading: "The tool-use loop and its rules",
      content: "Your code runs a loop: call the API; if stop_reason is 'tool_use', append Claude's full assistant content to messages, execute every tool_use block, and append ONE user message containing all the tool_result blocks (Claude may request several tools in parallel). Repeat until stop_reason is 'end_turn'. If a tool fails, still return a tool_result with is_error: true and a helpful message so Claude can recover. Always parse tool input as JSON objects (the SDK gives you a dict/object) and validate it before acting.",
      points: [
        "Match every tool_result to its tool_use_id",
        "Return all results of one turn together in a single user message",
        "Errors -> tool_result with is_error: true (don't silently drop them)",
        "Put a maximum number of loop iterations as a guardrail",
        "Check stop_reason 'refusal' and 'max_tokens' before running tools",
        "The SDKs also offer a beta 'tool runner' helper that runs this loop for you"
      ]
    },
    {
      heading: "Structured outputs – guaranteed JSON",
      content: "Often you don't need tools – you just want data in a fixed shape (e.g. extract name, email and plan from an email into JSON for your database). Asking 'reply in JSON' usually works but can fail occasionally. Structured outputs constrain Claude's response to a JSON Schema you provide via output_config = {format: {type: 'json_schema', schema: {...}}}. The text block is then guaranteed to be valid JSON matching the schema. In Python you can also define a Pydantic model and call client.messages.parse(...) to get a validated object directly. Structured outputs replace older tricks like assistant-message prefill (which current models reject).",
      syntax: "output_config = {\n  \"format\": {\n    \"type\": \"json_schema\",\n    \"schema\": {\n      \"type\": \"object\",\n      \"properties\": {\"sentiment\": {\"type\": \"string\", \"enum\": [\"positive\", \"neutral\", \"negative\"]}, \"summary\": {\"type\": \"string\"}},\n      \"required\": [\"sentiment\", \"summary\"],\n      \"additionalProperties\": false\n    }\n  }\n}",
      points: [
        "Use structured outputs for extraction, classification, form-filling, data pipelines",
        "Use tools when Claude must fetch data or take actions in the middle of answering",
        "You can combine them: tools during the task + a structured final answer",
        "Still validate business rules (e.g. amount > 0) – schema-valid isn't the same as correct"
      ]
    },
    {
      heading: "Safety and design best practices",
      content: "Tools turn text into actions, so design them like an API for an untrusted caller. Give read-only tools freely; require confirmation for actions that change data, send messages or spend money. Validate inputs (types, ranges, allowed IDs belonging to the current user). Never build tools that execute arbitrary code or SQL from model input without strict sandboxing. Return concise results (only needed fields) to save tokens. Remember prompt injection: text returned by tools (web pages, emails, documents) may contain instructions – treat tool results as data, not commands.",
      points: [
        "Least privilege: a support bot's get_order should only see the logged-in user's orders",
        "Human confirmation for write/delete/payment tools",
        "Timeouts and error messages for slow or failing tools",
        "Log every tool call (name, input, result status) for auditing"
      ],
      tip: "Fewer, well-described tools beat many overlapping ones – overlapping tools confuse the model."
    }
  ],
  examples: [
    {
      title: "Weather + currency assistant with the tool-use loop (Python)",
      scenario: "A travel assistant can check weather and convert currency. Claude decides which tools to call; your code runs them.",
      steps: [
        "pip install anthropic and set ANTHROPIC_API_KEY",
        "Save as tools_demo.py and run: python3 tools_demo.py",
        "Watch the printed tool calls: Claude may call both tools in one turn",
        "Ask a question that needs no tool ('What is the capital of Japan?') and see it answer directly",
        "Make convert_currency raise an error for 'JPY' and see Claude handle the is_error result"
      ],
      code: `import json
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city. Use for any weather/temperature question.",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name, e.g. Pune"}},
            "required": ["city"],
            "additionalProperties": False,
        },
    },
    {
        "name": "convert_currency",
        "description": "Convert an amount in Indian rupees (INR) to another currency (USD or EUR).",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "description": "Amount in INR"},
                "to": {"type": "string", "enum": ["USD", "EUR"]},
            },
            "required": ["amount", "to"],
            "additionalProperties": False,
        },
    },
]

def get_weather(city):
    data = {"Pune": "29 C, partly cloudy", "Delhi": "33 C, hazy"}   # demo data
    return data.get(city, "No data for " + city)

def convert_currency(amount, to):
    rates = {"USD": 0.012, "EUR": 0.011}                             # demo rates only
    return f"{amount * rates[to]:.2f} {to}"

REGISTRY = {"get_weather": get_weather, "convert_currency": convert_currency}

messages = [{"role": "user", "content": "I'm going to Pune with 5000 rupees. What's the weather and how much is that in USD?"}]

for _ in range(5):                                   # guardrail: max 5 rounds
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=2048,
        tools=tools,
        tool_choice={"type": "auto"},
        messages=messages,
    )
    if response.stop_reason == "refusal":
        print("Claude declined.")
        break

    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason != "tool_use":
        print("".join(b.text for b in response.content if b.type == "text"))
        break

    results = []
    for block in response.content:
        if block.type == "tool_use":
            print("TOOL CALL:", block.name, json.dumps(block.input))
            try:
                output = REGISTRY[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": output})
            except Exception as exc:
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": f"Tool failed: {exc}", "is_error": True})
    messages.append({"role": "user", "content": results})   # ALL results in ONE message`,
      result: "TOOL CALL: get_weather {\"city\": \"Pune\"}\nTOOL CALL: convert_currency {\"amount\": 5000, \"to\": \"USD\"}\nPune is currently 29 C and partly cloudy. 5000 INR is about 60.00 USD (demo rate).",
      explanation: "Claude chose both tools in one turn (parallel tool use). The loop appends Claude's full content, runs each tool_use, and returns all tool_result blocks in one user message. When Claude has what it needs, stop_reason becomes 'end_turn' and we print the final text. strict: true guarantees inputs match the schema."
    },
    {
      title: "What your code does with a tool_use response (runnable simulation)",
      scenario: "Practise the dispatch part of the loop offline: given a response shaped like the API's, validate inputs, run functions and build the tool_result message.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or run python3 locally",
        "Paste into main.py and Run",
        "Remove 'to' from the second tool_use input and run again – see the is_error result",
        "Compare the printed JSON with what the real loop sends back to Claude"
      ],
      code: "for each tool_use block: validate -> run function -> tool_result {tool_use_id, content, is_error}; send all results in ONE user message",
      python: {
        files: {
          "main.py": `import json

# 1) Tool definitions - exactly the shape you send to the Claude API in \`tools\`
tools = [
    {"name": "get_weather", "description": "Get current weather for a city",
     "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}},
    {"name": "convert_currency", "description": "Convert an amount between currencies",
     "input_schema": {"type": "object", "properties": {"amount": {"type": "number"}, "to": {"type": "string"}},
                      "required": ["amount", "to"]}},
]

# 2) Your real functions
def get_weather(city):
    data = {"Pune": "29 C, partly cloudy", "Delhi": "33 C, hazy"}
    return data.get(city, "unknown city")
def convert_currency(amount, to):
    rates = {"USD": 0.012, "EUR": 0.011}   # demo rates only
    return f"{amount * rates[to]:.2f} {to}" if to in rates else "unsupported currency"
REGISTRY = {"get_weather": get_weather, "convert_currency": convert_currency}

# 3) A response shaped like what the API returns when stop_reason == "tool_use"
fake_response = {
    "stop_reason": "tool_use",
    "content": [
        {"type": "text", "text": "Let me check both."},
        {"type": "tool_use", "id": "toolu_01", "name": "get_weather", "input": {"city": "Pune"}},
        {"type": "tool_use", "id": "toolu_02", "name": "convert_currency", "input": {"amount": 5000, "to": "USD"}},
    ],
}

def validate(tool_name, args):
    schema = next(t["input_schema"] for t in tools if t["name"] == tool_name)
    missing = [k for k in schema["required"] if k not in args]
    return f"missing {missing}" if missing else None

# 4) Run every tool_use block and collect ALL results in ONE user message
results = []
if fake_response["stop_reason"] == "tool_use":
    for block in fake_response["content"]:
        if block["type"] != "tool_use":
            continue
        err = validate(block["name"], block["input"])
        out = err or REGISTRY[block["name"]](**block["input"])
        results.append({"type": "tool_result", "tool_use_id": block["id"], "content": out, "is_error": bool(err)})
print(json.dumps({"role": "user", "content": results}, indent=2))
`
        },
        stdin: ""
      },
      result: "{\n  \"role\": \"user\",\n  \"content\": [\n    {\n      \"type\": \"tool_result\",\n      \"tool_use_id\": \"toolu_01\",\n      \"content\": \"29 C, partly cloudy\",\n      \"is_error\": false\n    },\n    {\n      \"type\": \"tool_result\",\n      \"tool_use_id\": \"toolu_02\",\n      \"content\": \"60.00 USD\",\n      \"is_error\": false\n    }\n  ]\n}",
      explanation: "This is exactly the user message you append after a tool_use turn: one tool_result per tool_use, matched by id. Validation turns bad input into an is_error result instead of a crash, which lets Claude correct itself on the next turn."
    },
    {
      title: "Structured outputs: extract a lead from an email (Python, two ways)",
      scenario: "Sales emails arrive as free text. You need name, email, plan and demo_requested as guaranteed-valid JSON for your CRM.",
      steps: [
        "pip install anthropic pydantic and set ANTHROPIC_API_KEY",
        "Save as extract.py and run it",
        "Way A uses output_config.format with a raw JSON Schema; Way B uses client.messages.parse with a Pydantic model",
        "Try an email with no plan mentioned – see how the schema forces a value (consider allowing 'unknown' in the enum)"
      ],
      code: `import json
import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()
email = "Hi, I'm Jane Doe (jane@co.com). We'd like the Enterprise plan and a demo next week."

# ---- Way A: raw JSON Schema via output_config.format ----
response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract the lead details from this email:\\n" + email}],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan": {"type": "string", "enum": ["Free", "Pro", "Enterprise", "unknown"]},
                    "demo_requested": {"type": "boolean"},
                },
                "required": ["name", "email", "plan", "demo_requested"],
                "additionalProperties": False,
            },
        }
    },
)
if response.stop_reason == "end_turn":
    text = next(b.text for b in response.content if b.type == "text")
    lead = json.loads(text)
    print("Way A:", lead)

# ---- Way B: Pydantic model + messages.parse ----
class Lead(BaseModel):
    name: str
    email: str
    plan: str
    demo_requested: bool

parsed = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract the lead details from this email:\\n" + email}],
    output_format=Lead,
)
print("Way B:", parsed.parsed_output)`,
      result: "Way A: {'name': 'Jane Doe', 'email': 'jane@co.com', 'plan': 'Enterprise', 'demo_requested': True}\nWay B: name='Jane Doe' email='jane@co.com' plan='Enterprise' demo_requested=True",
      explanation: "With output_config.format the text block is guaranteed to be JSON that matches the schema, so json.loads won't fail on format. messages.parse goes further and returns a validated Pydantic object. Including 'unknown' in the enum gives the model an honest option when data is missing."
    },
    {
      title: "Tool use + structured output in JavaScript",
      scenario: "An order-status bot in Node.js: Claude calls get_order_status, then you also need a JSON ticket classification.",
      steps: [
        "npm install @anthropic-ai/sdk and set ANTHROPIC_API_KEY",
        "Save as orders.mjs and run: node orders.mjs",
        "Read the tool call log and final answer",
        "Then read the separate structured classification output"
      ],
      code: `import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const ORDERS = { A102: { item: "USB-C Cable", status: "in transit", eta: "2026-11-21" } };
const tools = [{
  name: "get_order_status",
  description: "Look up the status and delivery ETA of a customer's order by order ID.",
  strict: true,
  input_schema: {
    type: "object",
    properties: { order_id: { type: "string", description: "Order ID like A102" } },
    required: ["order_id"],
    additionalProperties: false,
  },
}];

const messages = [{ role: "user", content: "Where is my order A102?" }];
for (let round = 0; round < 5; round++) {
  const res = await client.messages.create({
    model: "claude-opus-5-5", max_tokens: 2048, tools, tool_choice: { type: "auto" }, messages,
  });
  if (res.stop_reason === "refusal") { console.log("Declined."); break; }
  messages.push({ role: "assistant", content: res.content });
  if (res.stop_reason !== "tool_use") {
    for (const b of res.content) if (b.type === "text") console.log(b.text);
    break;
  }
  const results = [];
  for (const b of res.content) {
    if (b.type !== "tool_use") continue;
    console.log("TOOL CALL:", b.name, JSON.stringify(b.input));
    const order = ORDERS[b.input.order_id];
    results.push(order
      ? { type: "tool_result", tool_use_id: b.id, content: JSON.stringify(order) }
      : { type: "tool_result", tool_use_id: b.id, content: "Order not found", is_error: true });
  }
  messages.push({ role: "user", content: results });
}

// Structured output: classify the ticket into fixed JSON
const cls = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 512,
  messages: [{ role: "user", content: "Classify this support ticket: 'Where is my order A102?'" }],
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["delivery", "billing", "technical", "other"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["category", "priority"],
        additionalProperties: false,
      },
    },
  },
});
const textBlock = cls.content.find((b) => b.type === "text");
console.log("Classification:", JSON.parse(textBlock.text));`,
      result: "TOOL CALL: get_order_status {\"order_id\":\"A102\"}\nYour order A102 (USB-C Cable) is in transit and expected on 21 Nov 2026.\nClassification: { category: 'delivery', priority: 'medium' }",
      explanation: "The JS loop mirrors Python: push full assistant content, run tool_use blocks, return tool_result blocks (is_error for unknown orders). The second call uses output_config.format so JSON.parse is safe."
    }
  ],
  tools: [
    { name: "Claude API – Tool use", use: "Let Claude call your functions via tools + tool_use/tool_result blocks. How to use: 1) Define tools with input_schema. 2) Send with tool_choice {type: 'auto'}. 3) On stop_reason 'tool_use' run each block. 4) Return tool_result blocks in one user message. 5) Loop until end_turn.", url: "https://platform.claude.com/docs" },
    { name: "Claude API – Structured outputs", use: "Guarantee schema-valid JSON responses with output_config.format or client.messages.parse. How to use: 1) Write a JSON Schema (or Pydantic model). 2) Pass output_config={'format': {...}} or output_format=Model to parse. 3) json.loads the text block or read parsed_output.", url: "https://platform.claude.com/docs" },
    { name: "Pydantic", use: "Define Python data models used with client.messages.parse for validated objects. How to use: pip install pydantic; class Lead(BaseModel): ...; pass output_format=Lead.", url: "https://docs.pydantic.dev" },
    { name: "JSON Schema", use: "Standard for describing tool inputs and structured outputs. How to use: define type, properties, required, enum, additionalProperties: false.", url: "https://json-schema.org" },
    { name: "Python IDE (in-app)", use: "Run the offline tool-dispatch simulation. How to use: open /tools/python-ide, paste code, Run.", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "Explain the tool-use (function-calling) flow.", a: "The developer sends tools (name, description, input_schema) with the request. If useful, the model responds with stop_reason 'tool_use' and tool_use blocks containing arguments. The application executes the functions and returns tool_result blocks (matched by tool_use_id) in a user message. The model then continues and produces a final answer or more tool calls.", level: "Easy" },
    { q: "Does the model execute the tool?", a: "No (for client tools). The model only proposes a call with arguments; your application decides whether and how to execute it and returns the result. This lets you enforce validation, permissions and confirmation.", level: "Easy" },
    { q: "Why are tool descriptions important?", a: "The model uses names and descriptions to decide which tool to call, when, and how to fill arguments. Clear descriptions with usage conditions, formats and limitations reduce wrong or missing calls.", level: "Medium" },
    { q: "What is parallel tool use and how should results be returned?", a: "The model can request several tools in one turn. Execute them (possibly concurrently) and return all tool_result blocks together in a single user message, each with the matching tool_use_id.", level: "Medium" },
    { q: "How do you handle a tool error?", a: "Return a tool_result with is_error: true and a clear error message (e.g. 'Order not found'). The model can then apologise, ask for clarification or try different arguments. Never drop the result, or the conversation becomes invalid.", level: "Medium" },
    { q: "What is the difference between tool use and structured outputs?", a: "Tool use lets the model request actions/data from your code during a task. Structured outputs constrain the model's final response to a JSON Schema for reliable parsing. They can be combined.", level: "Medium" },
    { q: "What does strict: true on a tool do?", a: "It guarantees the tool_use input matches the tool's JSON Schema exactly (requires additionalProperties: false and required fields), so you don't receive missing or extra arguments.", level: "Hard" },
    { q: "How would you make a tool that sends emails safe?", a: "Require user confirmation before sending, restrict recipients (e.g. only the logged-in user's contacts), validate content length, rate-limit, log every call, and treat retrieved content as untrusted to avoid prompt-injection-driven sends.", level: "Hard" },
    { q: "Why can't you force Claude to always call a specific tool on current models, and what do you do instead?", a: "Forced tool_choice ('any'/'tool') is rejected on current models. Use tool_choice auto with a clear instruction naming the tool, strict schemas, or structured outputs when you only need JSON.", level: "Hard" },
    { q: "Why must schema-valid JSON still be validated?", a: "A schema ensures structure and types, not truth or business rules. Values can still be wrong (wrong email, negative amount, ID belonging to another user), so validate semantics and permissions in code.", level: "Medium" }
  ],
  practice: [
    { task: "Add a third tool 'get_time(city)' to the Python weather demo and ask a question that needs all three tools.", hint: "Add to tools list and REGISTRY; use a small dict of demo times.", solution: "Tool schema with city required; def get_time(city): return {'Pune': '10:30 IST'}.get(city, 'unknown'). Ask: 'I'm in Pune with 5000 rupees – time, weather and USD value?' Claude should call all three, possibly in one turn." },
    { task: "In the simulation, add a tool_use for an unknown tool name 'book_hotel' and handle it gracefully.", hint: "Check if the name exists in REGISTRY before validation.", solution: "if block['name'] not in REGISTRY: results.append({'type':'tool_result','tool_use_id':block['id'],'content':'Unknown tool','is_error':True}); continue" },
    { task: "Write a JSON Schema for extracting invoice data: invoice_number, date (YYYY-MM-DD), total_amount (number), currency (enum INR/USD/EUR), line_items (array of {description, qty, price}).", hint: "Use type 'array' with an items object schema.", solution: "{'type':'object','properties':{'invoice_number':{'type':'string'},'date':{'type':'string','description':'YYYY-MM-DD'},'total_amount':{'type':'number'},'currency':{'type':'string','enum':['INR','USD','EUR']},'line_items':{'type':'array','items':{'type':'object','properties':{'description':{'type':'string'},'qty':{'type':'integer'},'price':{'type':'number'}},'required':['description','qty','price'],'additionalProperties':False}}},'required':['invoice_number','date','total_amount','currency','line_items'],'additionalProperties':False}" },
    { task: "Test a classification prompt with structured output on 10 sample tickets and count how many were classified correctly.", hint: "Prepare expected labels first; loop in Python.", solution: "Store tickets with expected categories; call messages.create with output_config.format for each; json.loads the result; compare and print accuracy. Investigate mistakes and improve category descriptions." },
    { task: "Design (in writing) the tools for a library assistant: search_books, check_availability, reserve_book. Mark which need user confirmation.", hint: "Think read vs write actions.", solution: "search_books(query) – read; check_availability(book_id) – read; reserve_book(book_id, student_id) – write, needs confirmation and must only use the logged-in student's ID." }
  ],
  quiz: [
    { question: "When Claude wants to call a tool, what is the stop_reason?", options: ["end_turn", "tool_use", "max_tokens", "refusal"], answer: 1, explanation: "stop_reason 'tool_use' signals that tool_use blocks need to be executed." },
    { question: "Who executes a client-defined tool such as get_weather?", options: ["Claude on Anthropic's servers", "Your application code", "The user's browser automatically", "Nobody"], answer: 1, explanation: "Your code runs the function and returns a tool_result." },
    { question: "How should results for three parallel tool calls be returned?", options: ["Three separate user messages", "One user message with three tool_result blocks", "In the system prompt", "They should be ignored"], answer: 1, explanation: "Return all results together in one user message." },
    { question: "Which parameter gives guaranteed schema-valid JSON responses?", options: ["temperature", "output_config.format", "stop_sequences", "max_tokens"], answer: 1, explanation: "Structured outputs use output_config.format (or messages.parse)." },
    { question: "Which tool_choice should you use on current Claude models?", options: ["{type: 'auto'}", "{type: 'any'}", "{type: 'tool', name: 'x'}", "{type: 'force'}"], answer: 0, explanation: "Forced tool choice is rejected; use auto and steer with the prompt." }
  ]
};
