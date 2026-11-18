export default {
  id: "day-28-ai-coding-assistants",
  title: "AI Coding Assistants: GitHub Copilot, Cursor, Claude Code, Windsurf – Setup and Best Practices",
  module: "Module 5: AI for Developers",
  day: 28,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Learn how AI coding assistants help you write, explain, debug, test and refactor code. Set up GitHub Copilot in VS Code, Cursor, Claude Code in the terminal and Windsurf, understand inline completion vs chat vs agent mode, and adopt professional habits: give context, work in small steps, review every diff, run tests, and protect secrets.",
  objectives: [
    "Explain the three modes of AI coding help: inline completion, chat, and agentic (multi-file, runs commands)",
    "Install and use GitHub Copilot, Cursor, Claude Code and Windsurf step by step",
    "Write effective coding prompts with file context, constraints and acceptance tests",
    "Review AI-generated code for correctness, security and licensing; verify with tests",
    "Use project instruction files (e.g. CLAUDE.md, Copilot instructions, Cursor rules) to guide assistants"
  ],
  theory: [
    {
      heading: "What AI coding assistants do – three levels of help",
      content: "Think of three helpers. Level 1 is autocomplete on steroids: as you type, the assistant suggests the next line or whole function in grey text (press Tab to accept). Level 2 is a chat partner inside your editor: you select code and ask 'explain this', 'why does this fail?', 'write tests'. Level 3 is an agent: you describe a task ('add a password reset feature with tests'), and it reads files, edits several files, runs commands like tests, and shows you a diff to approve. All are powered by large language models trained on lots of code and text.",
      points: [
        "Inline completion: fastest, best for boilerplate and repetitive patterns",
        "Chat: explanations, debugging help, small generated snippets, learning a new library",
        "Agent mode: multi-file changes, running tests/commands, refactors – needs the most review",
        "The assistant sees only the context it is given (open files, selected code, repository index, instruction files)"
      ]
    },
    {
      heading: "The main tools and how to set them up",
      content: "GitHub Copilot is an extension for VS Code, Visual Studio, JetBrains IDEs and others, with inline suggestions, Copilot Chat and an agent mode; it has a free tier and is free for verified students and teachers through GitHub Education. Cursor is a VS Code-based AI editor with Tab completion, inline edit (Ctrl/Cmd+K), chat and an Agent that edits across files. Claude Code is Anthropic's agentic coding tool that runs in your terminal (and integrates with IDEs like VS Code and JetBrains): it reads your repo, edits files, runs commands and tests, and asks permission before risky actions. Windsurf is another AI-native editor whose agent 'Cascade' works across your codebase.",
      points: [
        "GitHub Copilot: 1) Install VS Code. 2) Extensions -> search 'GitHub Copilot' -> Install (Copilot Chat comes with it). 3) Sign in with GitHub and enable Copilot (Free, Pro, or Student via GitHub Education). 4) Type a comment like '# function to validate an Indian PIN code' and press Tab to accept. 5) Open Chat (Ctrl+Alt+I) and ask questions; switch the chat to Agent mode for multi-file tasks.",
        "Cursor: 1) Download from cursor.com and install. 2) Import VS Code settings/extensions. 3) Open your project folder. 4) Use Tab for completions, Ctrl/Cmd+K to edit selected code, Ctrl/Cmd+L for chat. 5) Use Agent for multi-file tasks and review each diff before accepting.",
        "Claude Code: 1) Install using the command on the official docs page (a native installer, or npm install -g @anthropic-ai/claude-code). 2) cd into your project and run 'claude'. 3) Log in with your Claude account or API key. 4) Run /init to create a CLAUDE.md with project notes. 5) Ask a task in plain English; approve file edits and commands when prompted. 6) Use plan mode for big tasks so it proposes a plan first.",
        "Windsurf: 1) Download from windsurf.com. 2) Open project. 3) Use Tab completions and the Cascade panel. 4) Describe tasks; review and accept changes."
      ],
      tip: "Students: apply for the GitHub Student Developer Pack – it includes free GitHub Copilot access."
    },
    {
      heading: "Prompting for code: context, constraints, acceptance criteria",
      content: "AI gives far better code when you give it what a senior developer would ask for: which file/function, language and version, framework, what the code must do, edge cases, style rules, and how you will check it. Ask for a plan before code on bigger tasks, and ask for tests along with the code. Work in small steps: one function, run tests, commit, next step. If the answer is wrong, paste the exact error message and the relevant code instead of saying 'it doesn't work'.",
      syntax: "Context: Python 3.12, Flask app, file app/auth.py\nTask: add a function is_strong_password(pw) -> bool\nRules: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special; no external libraries\nTests: write pytest tests incl. edge cases (empty, exactly 8 chars, unicode)\nOutput: code + tests only, then a 3-line explanation",
      points: [
        "Reference real files and functions; in Copilot use #file or @workspace, in Cursor use @ to attach files, in Claude Code name the path",
        "State constraints: no new dependencies, keep public API unchanged, follow existing style",
        "Ask for tests first or together – tests are your acceptance criteria",
        "For debugging: give the error, stack trace, input that triggers it, and what you expected"
      ]
    },
    {
      heading: "Project instruction files and agent workflow",
      content: "Assistants forget everything between sessions unless you write instructions down. Each tool supports a project instructions file that is loaded automatically: CLAUDE.md for Claude Code, .github/copilot-instructions.md for GitHub Copilot, and project rules for Cursor (e.g. files under .cursor/rules). Put build/test commands, coding conventions, folder structure and 'do not touch' areas there. A good agent workflow is: explore (let it read relevant files) -> plan (approve the plan) -> implement in small steps -> run tests -> review the diff -> commit.",
      points: [
        "Keep instruction files short and specific: commands, conventions, gotchas",
        "Use version control: commit before letting an agent make large changes, so you can roll back",
        "Let the agent run tests and linters, but read the diff yourself before merging",
        "Limit permissions: don't auto-approve destructive commands (deleting files, force pushes, production deploys)"
      ],
      syntax: "# CLAUDE.md (example)\n## Commands\n- Run tests: pytest -q\n- Lint: ruff check .\n## Conventions\n- Python 3.12, type hints required\n- Use services/ for business logic, routes/ only for HTTP\n## Never\n- Never commit .env or secrets\n- Never change database migrations that are already applied"
    },
    {
      heading: "Risks and best practices: correctness, security, secrets, learning",
      content: "AI code can look perfect and still be wrong: off-by-one errors, missing edge cases, outdated APIs, invented functions (package hallucination) or insecure patterns like SQL built with string concatenation. You remain the author and are responsible for what you commit. Review like a code reviewer, run tests, check new dependencies actually exist and are trustworthy, and never paste secrets or confidential code into tools your company has not approved. For learners: use AI to explain and to check your work, but write code yourself first – otherwise you won't build the skills interviews test.",
      points: [
        "Verify: run the code and tests; read every line you accept",
        "Security: watch for SQL injection, hard-coded keys, disabled TLS checks, unsafe eval",
        "Dependencies: confirm package names on the official registry (typosquatting risk)",
        "Secrets: keep keys in environment variables / secret managers; add .env to .gitignore",
        "Licensing & policy: follow company rules on which assistants and settings (e.g. code-reference filters) are allowed"
      ],
      tip: "Ask the assistant to critique its own code: 'Review this for bugs, edge cases and security issues and list them before fixing.'"
    }
  ],
  examples: [
    {
      title: "Fix a bug and add tests with an assistant – then verify by running",
      scenario: "Your function average_marks crashes with ZeroDivisionError on an empty list, and grade boundaries are untested. You ask Copilot Chat / Cursor / Claude Code to fix it and add tests, then you RUN the result yourself.",
      steps: [
        "Open the file in VS Code (Copilot), Cursor, or run 'claude' in the project folder",
        "Select the function and send the prompt shown in 'code'",
        "Review the diff: check the empty-list handling and the >= boundaries",
        "Run the code below in the in-app Python IDE (/tools/python-ide) or with python3",
        "Confirm all tests pass before committing"
      ],
      code: "Prompt to the assistant:\naverage_marks(marks) crashes with ZeroDivisionError when marks is empty.\n1) Fix it so an empty list returns 0.0 and the average is rounded to 2 decimals.\n2) Keep grade(avg) rules: >=75 Distinction, >=60 First Class, >=40 Pass, else Fail.\n3) Add unittest tests for normal input, empty list, and every boundary (75, 74.99, 40, 39.5).\nNo external libraries. Show the full updated file.",
      python: {
        files: {
          "main.py": `import unittest

# Version suggested by an AI assistant AFTER we asked it to fix the bug and add tests.
def average_marks(marks):
    """Return the average of a list of marks, rounded to 2 decimals.
    Empty list -> 0.0 (the original version crashed with ZeroDivisionError)."""
    if not marks:
        return 0.0
    return round(sum(marks) / len(marks), 2)

def grade(avg):
    if avg >= 75:
        return "Distinction"
    if avg >= 60:
        return "First Class"
    if avg >= 40:
        return "Pass"
    return "Fail"

class TestMarks(unittest.TestCase):
    def test_average(self):
        self.assertEqual(average_marks([80, 70, 90]), 80.0)
    def test_empty(self):
        self.assertEqual(average_marks([]), 0.0)
    def test_boundaries(self):
        self.assertEqual(grade(75), "Distinction")
        self.assertEqual(grade(74.99), "First Class")
        self.assertEqual(grade(40), "Pass")
        self.assertEqual(grade(39.5), "Fail")

if __name__ == "__main__":
    print("Average of [80, 70, 90]:", average_marks([80, 70, 90]), "->", grade(average_marks([80, 70, 90])))
    unittest.main(argv=["x", "-v"], exit=False)
`
        },
        stdin: ""
      },
      result: "Average of [80, 70, 90]: 80.0 -> Distinction\ntest_average (__main__.TestMarks.test_average) ... ok\ntest_boundaries (__main__.TestMarks.test_boundaries) ... ok\ntest_empty (__main__.TestMarks.test_empty) ... ok\n\n----------------------------------------------------------------------\nRan 3 tests in 0.001s\n\nOK",
      explanation: "The prompt states the bug, the expected behaviour, rules to keep, and the exact tests wanted. Running the tests yourself is the real proof – the assistant's confidence is not. (Test timing and the exact test-name format can differ slightly between Python versions.)"
    },
    {
      title: "Use Claude Code for a multi-file task with plan-first workflow",
      scenario: "In a Flask project you need a /health endpoint, a test for it, and a README note.",
      steps: [
        "Commit your current work (git add -A && git commit -m 'before health endpoint')",
        "Open a terminal in the project folder and run: claude",
        "Ask for a plan first using the prompt below (or switch to plan mode)",
        "Approve the plan, then let it edit files; approve each command it wants to run (e.g. pytest)",
        "Read the final diff (git diff) and run the tests yourself",
        "Commit with a clear message"
      ],
      code: "First, read app/__init__.py, app/routes.py and tests/ and propose a short plan – do not edit yet.\nTask: add GET /health returning JSON {\"status\": \"ok\"} with HTTP 200.\nRequirements: follow the existing blueprint pattern, add a pytest test in tests/test_health.py, add one line to README under 'Endpoints'.\nAfter I approve, implement it and run: pytest -q",
      result: "Claude Code lists the files it read and a 3–4 step plan; after approval it edits routes.py, creates tests/test_health.py, updates README, runs pytest and reports e.g. 'all tests passed', then shows a summary of changes.",
      explanation: "Plan-first prevents the agent from taking a wrong direction across many files. Committing first gives you an easy rollback, and running tests yourself confirms the result."
    },
    {
      title: "Explain unfamiliar code and spot security issues",
      scenario: "You joined a team and found a login function that builds SQL with string formatting.",
      steps: [
        "Select the function in VS Code (Copilot Chat) or Cursor (Ctrl/Cmd+L), or paste into claude.ai",
        "Send the prompt below",
        "Apply the parameterised-query fix and test with a normal login and an injection attempt like ' OR '1'='1"
      ],
      code: "Explain this function line by line for a junior developer, then list security problems and give a fixed version.\n\ndef login(cursor, username, password):\n    q = \"SELECT * FROM users WHERE username='%s' AND password='%s'\" % (username, password)\n    cursor.execute(q)\n    return cursor.fetchone() is not None",
      prompt: {
        system: "You are a senior Python developer and security reviewer. Explain simply, then be precise about risks and fixes.",
        user: "Explain this function line by line for a junior developer, then list security problems and give a fixed version.\n\ndef login(cursor, username, password):\n    q = \"SELECT * FROM users WHERE username='%s' AND password='%s'\" % (username, password)\n    cursor.execute(q)\n    return cursor.fetchone() is not None"
      },
      result: "Explanation of each line, then issues: (1) SQL injection via string formatting, (2) plain-text password comparison – passwords must be stored hashed (bcrypt/argon2), (3) SELECT * returns unneeded columns. Fixed version uses cursor.execute('SELECT password_hash FROM users WHERE username = %s', (username,)) and verifies the hash with a password-hashing library.",
      explanation: "Asking for explanation + risks + fix turns the assistant into a reviewer and a teacher. Always test the fix, including a malicious input."
    },
    {
      title: "Write project instructions so every session follows your rules",
      scenario: "Your team keeps getting AI code that uses the wrong test framework and puts logic in the wrong folder.",
      steps: [
        "In Claude Code run /init (creates CLAUDE.md), or create .github/copilot-instructions.md for Copilot, or a project rule for Cursor",
        "Paste and edit the template below to match your project",
        "Commit the file so the whole team shares it",
        "Ask the assistant a small task and confirm it follows the rules"
      ],
      code: "# Project instructions\n## Stack\n- Python 3.12, FastAPI, SQLAlchemy 2.x, pytest\n## Commands\n- Install: pip install -r requirements.txt\n- Test: pytest -q\n- Lint: ruff check .\n## Conventions\n- Business logic in app/services/, HTTP only in app/api/\n- Type hints on all public functions\n- Every new function needs a pytest test\n## Never\n- Never hard-code secrets; read from environment variables\n- Never edit alembic migrations that are already merged",
      result: "New AI suggestions use pytest, place logic in services/, include type hints, and avoid hard-coded secrets without you repeating these rules each time.",
      explanation: "Instruction files give the assistant persistent project context. Short, specific, command-oriented notes work best."
    }
  ],
  tools: [
    { name: "GitHub Copilot", use: "Inline suggestions, Copilot Chat and agent mode in VS Code/JetBrains/Visual Studio. How to use: 1) Install the GitHub Copilot extension. 2) Sign in with GitHub (free tier / student access). 3) Accept suggestions with Tab. 4) Chat with Ctrl+Alt+I; use #file / @workspace for context. 5) Use Agent mode for multi-file tasks and review diffs.", url: "https://github.com/features/copilot" },
    { name: "Cursor", use: "AI-first editor (VS Code based) with Tab, inline edit, chat and Agent. How to use: 1) Install from cursor.com. 2) Open project. 3) Tab for completions, Ctrl/Cmd+K inline edit, Ctrl/Cmd+L chat. 4) @-mention files. 5) Review and accept diffs.", url: "https://cursor.com" },
    { name: "Claude Code", use: "Agentic coding in the terminal and IDE: reads repo, edits files, runs tests with your permission. How to use: 1) Install via official docs. 2) Run 'claude' in project folder and log in. 3) /init to create CLAUDE.md. 4) Ask for a plan, approve. 5) Review diff, run tests, commit.", url: "https://www.anthropic.com/claude-code" },
    { name: "Windsurf", use: "AI editor with the Cascade agent for codebase-wide tasks. How to use: 1) Install from windsurf.com. 2) Open project. 3) Use Tab and Cascade panel. 4) Review and accept changes.", url: "https://windsurf.com" },
    { name: "GitHub Education", use: "Student Developer Pack including free GitHub Copilot for verified students. How to use: apply with your college email/ID, wait for approval, then enable Copilot in GitHub settings.", url: "https://education.github.com" },
    { name: "Python IDE (in-app)", use: "Run and test AI-generated Python code safely. How to use: open /tools/python-ide, paste code, Run, read test results.", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "What is the difference between inline completion, chat and agent mode?", a: "Inline completion predicts the next lines as you type. Chat answers questions and generates snippets on request using selected context. Agent mode takes a goal, plans, reads and edits multiple files, runs commands such as tests, and iterates – with the developer approving changes.", level: "Easy" },
    { q: "How do you make an AI coding assistant produce better code?", a: "Give precise context (files, language/framework versions), clear requirements and constraints, edge cases, expected tests, and existing conventions via instruction files; break work into small steps and ask for a plan before large changes.", level: "Easy" },
    { q: "What is 'package hallucination' and why is it dangerous?", a: "An AI suggests importing a package that does not exist (or has a slightly different name). Attackers can publish malicious packages with those names, so blindly installing suggestions can lead to supply-chain compromise. Always verify packages on the official registry.", level: "Medium" },
    { q: "How do you review AI-generated code?", a: "Read every line, check logic and edge cases, run tests and linters, look for security issues (injection, secrets, unsafe deserialisation), confirm APIs exist in your library version, check performance, and ensure it matches project conventions. Treat it like a pull request from a new teammate.", level: "Medium" },
    { q: "What are CLAUDE.md, copilot-instructions.md and Cursor rules used for?", a: "They are project-level instruction files automatically loaded by the assistant to provide persistent context: build/test commands, coding conventions, architecture notes and things to avoid.", level: "Medium" },
    { q: "Should junior developers use AI assistants?", a: "Yes, as a tutor and reviewer – to explain code, suggest tests and catch mistakes – but they should still write and understand code themselves, because over-reliance prevents skill growth and makes it hard to spot AI mistakes.", level: "Easy" },
    { q: "What safety controls should an agentic coding tool have?", a: "Permission prompts before editing files or running commands, allow/deny lists for commands, sandboxing, no direct access to production credentials, version control for rollback, and human review before merge/deploy.", level: "Hard" },
    { q: "How do you debug effectively with an AI assistant?", a: "Provide the full error and stack trace, minimal reproducible code, input data, expected vs actual behaviour and what you already tried; ask for hypotheses ranked by likelihood and a way to confirm each, rather than just 'fix it'.", level: "Medium" },
    { q: "How can teams measure whether AI assistants improve productivity?", a: "Track metrics like cycle time, review time, defect/bug rates, test coverage and developer satisfaction before and after adoption, and look at code quality – not just lines of code or acceptance rate of suggestions.", level: "Hard" },
    { q: "What company policy issues arise with AI coding tools?", a: "Which tools are approved, whether code/data is used for training, data retention, IP/licensing of suggestions, handling of secrets, and requirements for human review and attribution.", level: "Medium" }
  ],
  practice: [
    { task: "Install GitHub Copilot (or Cursor) and write a function 'is_valid_ifsc(code)' using only a comment as the prompt. Then write your own tests to check it.", hint: "IFSC: 11 characters, 4 letters, a 0, then 6 letters/digits.", solution: "Comment: '# Return True if code is a valid Indian IFSC: 4 uppercase letters, then 0, then 6 alphanumeric'. Accept suggestion (likely regex ^[A-Z]{4}0[A-Z0-9]{6}$). Tests: 'SBIN0001234' True, 'SBIN1001234' False, 'sbin0001234' False, '' False." },
    { task: "Ask an assistant to explain a 30-line piece of code you didn't write, then quiz yourself by explaining it back without AI.", hint: "Ask 'explain line by line, then give 3 questions to test my understanding'.", solution: "Use Copilot Chat /explain or Cursor chat. Answer the 3 questions in your own words and compare with the code's actual behaviour by running it." },
    { task: "Create a CLAUDE.md or copilot-instructions.md for one of your projects with commands, conventions and a 'Never' list.", hint: "Keep it under 25 lines.", solution: "Include stack versions, install/test/lint commands, folder conventions, and rules like 'never hard-code secrets'. Ask the assistant for a small change and check it follows the rules." },
    { task: "Take an AI-suggested function and ask the same assistant to review it for bugs and security issues. List what it found and verify each with a test.", hint: "Prompt: 'Act as a strict reviewer. List problems before fixing.'", solution: "Write one failing test per real issue found, apply the fixes, and confirm tests pass. Note any claimed issue that was not real – this trains your judgement." },
    { task: "Extend the average_marks example: add a function 'class_topper(students)' that returns the name with the highest average, with tests for ties and empty input.", hint: "Decide and document the tie rule first (e.g. alphabetical first).", solution: "def class_topper(students): if not students: return None; return sorted(students.items(), key=lambda kv: (-average_marks(kv[1]), kv[0]))[0][0]. Tests: normal, tie (alphabetical), empty dict -> None." }
  ],
  quiz: [
    { question: "Which mode lets the assistant edit multiple files and run tests?", options: ["Inline completion", "Agent mode", "Syntax highlighting", "Spell check"], answer: 1, explanation: "Agent mode plans and executes multi-step, multi-file tasks with commands." },
    { question: "Which file gives Claude Code persistent project instructions?", options: ["package.json", "CLAUDE.md", ".gitignore", "README.txt only"], answer: 1, explanation: "Claude Code loads CLAUDE.md automatically; /init helps create it." },
    { question: "The AI suggests 'pip install fastjsonx-utils' which you have never heard of. What should you do?", options: ["Install immediately", "Verify the package exists and is trustworthy on the official registry", "Rename it", "Ignore all AI suggestions forever"], answer: 1, explanation: "Hallucinated or typosquatted packages are a real supply-chain risk." },
    { question: "What is the BEST proof that AI-generated code works?", options: ["The AI said it is correct", "It looks clean", "Passing tests and your own review", "It compiled once"], answer: 2, explanation: "Tests plus human review are the real verification." },
    { question: "Where should API keys used by your code live?", options: ["Hard-coded in source", "In environment variables or a secret manager", "In the prompt", "In a public README"], answer: 1, explanation: "Never hard-code secrets; load them from the environment or a secret manager." }
  ]
};
