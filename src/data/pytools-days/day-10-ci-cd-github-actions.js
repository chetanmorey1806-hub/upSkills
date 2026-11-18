export default {
  id: "day-10-ci-cd-github-actions",
  title: "CI/CD with GitHub Actions: Test, Lint, Build and Deploy",
  module: "Module 3: Production",
  day: 10,
  level: "Advanced",
  duration: "3 hours",
  summary: "Automate your Python project with GitHub Actions: run ruff and pytest on every push and pull request, test across Python versions, cache dependencies, build Docker images and deploy automatically using secrets.",
  objectives: [
    "Explain CI, Continuous Delivery and Continuous Deployment in simple words",
    "Write a GitHub Actions workflow YAML with triggers, jobs, steps and runners",
    "Run linting (ruff) and tests (pytest + coverage) on every push and pull request",
    "Use a matrix to test multiple Python versions and cache pip dependencies",
    "Store credentials safely in GitHub Secrets and deploy only from the main branch",
    "Protect the main branch so that pull requests cannot merge with failing checks",
  ],
  theory: [
    {
      heading: "What is CI/CD and Why Companies Use It",
      content: "**Continuous Integration (CI)** means every time a developer pushes code or opens a pull request, an automatic system checks out the code, installs dependencies, runs the linter and runs all tests. If anything fails, the team knows within minutes instead of finding out on release day.\n\n**Continuous Delivery** means the code that passes CI is automatically packaged (for example a Docker image or a wheel) and kept ready to release; a human clicks a button to deploy. **Continuous Deployment** goes one step further: every change that passes CI is deployed to production automatically, with no manual step.\n\nThink of CI as a security guard at the gate of the main branch: no code enters without showing a valid pass (green tests).",
      points: [
        "Catches bugs early, when they are cheap to fix",
        "Removes \"works on my machine\" problems because tests run on a clean server",
        "Makes code review faster: reviewers see a green tick before reading the code",
        "Popular tools: GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure Pipelines",
      ],
    },
    {
      heading: "GitHub Actions Building Blocks",
      content: "GitHub Actions is the CI/CD system built into GitHub. It is free for public repositories and has a free monthly minute quota for private ones. Workflows are YAML files stored in the folder `.github/workflows/` of your repository.\n\nA **workflow** is triggered by an **event** (push, pull_request, schedule, manual workflow_dispatch). A workflow contains one or more **jobs**. Each job runs on a **runner** (a fresh virtual machine such as ubuntu-latest) and contains **steps**. A step either runs a shell command with `run:` or uses a ready-made **action** with `uses:` (for example actions/checkout@v4).",
      points: [
        "Jobs run in parallel by default; use needs: to make one job wait for another",
        "Every job gets a brand-new machine, so files are not shared between jobs unless you use artifacts",
        "Marketplace actions are versioned: actions/checkout@v4, actions/setup-python@v5",
        "Logs for each step are visible in the Actions tab of the repository",
      ],
      syntax: `.github/
  workflows/
    ci.yml        # runs tests and lint
    deploy.yml    # builds and deploys
`,
    },
    {
      heading: "Anatomy of a Python CI Workflow",
      content: "A typical Python CI workflow has these steps: check out the code, set up Python, install dependencies, run the linter, run the tests. If any step returns a non-zero exit code, the job fails and GitHub shows a red cross on the commit and the pull request.",
      syntax: `name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: pytest -q
`,
      tip: "YAML is indentation-sensitive and does not allow tabs. Always quote Python versions like \"3.10\", otherwise YAML reads 3.10 as the number 3.1.",
    },
    {
      heading: "Matrix Builds and Caching",
      content: "A **matrix** runs the same job many times with different values, for example Python 3.10, 3.11 and 3.12, or Ubuntu and Windows. This is important for libraries that must support several versions.\n\n**Caching** saves the downloaded pip packages between runs so the install step takes seconds instead of minutes. With actions/setup-python you simply add `cache: pip`; it uses the hash of requirements files as the cache key, so the cache refreshes automatically when requirements change.",
      syntax: `strategy:
  fail-fast: false
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
steps:
  - uses: actions/setup-python@v5
    with:
      python-version: \${{ matrix.python-version }}
      cache: pip
`,
      points: [
        "\${{ ... }} is the GitHub expression syntax for reading variables, secrets and matrix values",
        "fail-fast: false lets other matrix jobs finish even if one fails",
      ],
    },
    {
      heading: "Secrets, Environment Variables and Services",
      content: "Never write passwords, API keys or deploy tokens in the YAML file. Store them in **Settings > Secrets and variables > Actions** and read them as `\${{ secrets.NAME }}`. GitHub masks secret values in logs with ***.\n\nYou can also start helper containers for tests using **services**, for example a PostgreSQL or Redis container, so integration tests run against a real database.",
      syntax: `services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    ports: ["5432:5432"]
    options: >-
      --health-cmd pg_isready --health-interval 5s --health-retries 5
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
`,
      tip: "Secrets are NOT passed to workflows triggered by pull requests from forks. This protects your keys from strangers opening malicious PRs.",
    },
    {
      heading: "Continuous Deployment: Build and Deploy",
      content: "After tests pass, a deploy job can build a Docker image, push it to a registry (Docker Hub or GitHub Container Registry, ghcr.io) and tell the hosting platform to deploy. Use `needs: test` so deployment only runs after tests succeed, and an `if:` condition so only pushes to main deploy, not pull requests.\n\nMany platforms (Render, Railway, Heroku-like services) provide a **deploy hook URL**; calling it with curl triggers a new deploy. For servers like AWS EC2 you might SSH in and pull the new image.",
      points: [
        "needs: test - the deploy job waits for the test job",
        "if: github.ref == 'refs/heads/main' && github.event_name == 'push' - deploy only from main",
        "environment: production - lets you add manual approval rules in GitHub",
        "permissions: - give the workflow token the minimum rights it needs (least privilege)",
      ],
    },
    {
      heading: "Branch Protection and Good Practices",
      content: "CI is only useful if failing checks actually block merges. In **Settings > Branches > Branch protection rules** (or Rulesets), protect main: require a pull request, require status checks (your CI job) to pass, and optionally require at least one review.\n\nKeep pipelines fast (under 10 minutes), run the cheapest checks first (lint before tests), pin action versions, and add a status badge to README.md so everyone can see the build health.",
      points: [
        "Fast feedback: lint -> unit tests -> integration tests -> build -> deploy",
        "Use concurrency groups to cancel old runs when a new commit is pushed",
        "Use workflow_dispatch to allow manual runs from the Actions tab",
        "Use pre-commit locally so most lint errors never reach CI",
      ],
    },
  ],
  examples: [
    {
      title: "First CI Workflow: Lint and Test on Every Push",
      scenario: "Your team's FastAPI project has tests, but people forget to run them before pushing. You add a CI workflow that runs ruff and pytest on every push and pull request.",
      steps: [
        "In the project root create folders: mkdir -p .github/workflows",
        "Create the file .github/workflows/ci.yml with the YAML below",
        "Make sure requirements.txt contains pytest and ruff (or a separate requirements-dev.txt)",
        "Commit and push: git add . && git commit -m \"ci: add lint and test workflow\" && git push",
        "Open the repository on GitHub > Actions tab and watch the run",
      ],
      code: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Lint with ruff
        run: ruff check .

      - name: Run tests
        run: pytest -q
`,
      result: `Actions tab shows: CI - test (ubuntu-latest)  ✓ Success in 42s
  ✓ Check out code
  ✓ Set up Python
  ✓ Install dependencies
  ✓ Lint with ruff        All checks passed!
  ✓ Run tests             12 passed in 1.84s`,
      explanation: "The on: block triggers the workflow for pushes to main and for all pull requests. The job gets a fresh Ubuntu VM, checks out the code, installs Python 3.12 with pip caching, installs requirements and runs ruff then pytest. The `run: |` syntax lets you write several shell lines in one step. If ruff finds an error, the job stops and tests never run, giving fast feedback.",
    },
    {
      title: "Matrix Testing with Coverage Report",
      scenario: "You maintain a small open-source utility library that must work on Python 3.10, 3.11 and 3.12. You also want a coverage report and a failure if coverage drops below 80%.",
      steps: [
        "Add pytest-cov to requirements-dev.txt",
        "Replace the job in ci.yml with the matrix version below",
        "Push the change and open the Actions tab: you will see three parallel jobs",
        "Download the coverage artifact from the run summary page",
      ],
      code: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements-dev.txt
      - run: pytest --cov=mylib --cov-report=xml --cov-fail-under=80
      - name: Upload coverage
        if: matrix.python-version == '3.12'
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml
`,
      result: `test (3.10)  ✓  passed
test (3.11)  ✓  passed
test (3.12)  ✓  passed   TOTAL coverage: 87%
Artifacts: coverage-report`,
      explanation: "The matrix creates three jobs from one definition, and \${{ matrix.python-version }} injects the version into each. --cov-fail-under=80 makes pytest exit with an error if coverage is below 80%, failing the build. upload-artifact saves coverage.xml so you can download it, and the if: condition uploads it only once instead of three times.",
    },
    {
      title: "Integration Tests with a PostgreSQL Service Container",
      scenario: "Your Django app's tests need a real PostgreSQL database because they use Postgres-specific features. SQLite is not enough.",
      steps: [
        "Make settings.py read the database URL from the DATABASE_URL environment variable",
        "Add the services block and env block to the job as shown",
        "Push and check that the 'Initialize containers' step starts postgres",
        "Confirm the tests connect to localhost:5432",
      ],
      code: `jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: shop_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/shop_test
      SECRET_KEY: ci-only-not-secret
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt
      - run: python manage.py migrate
      - run: python manage.py test
`,
      result: `Initialize containers  ✓ postgres:16 healthy
Run python manage.py migrate   Applying contenttypes.0001_initial... OK ...
Run python manage.py test      Ran 34 tests in 3.112s  OK`,
      explanation: "The services block starts a Postgres container next to the runner. Health options make GitHub wait until Postgres is ready before running steps. The job-level env sets DATABASE_URL for every step. A dummy SECRET_KEY is fine in CI because it is only for tests; real secrets would come from secrets.",
    },
    {
      title: "Build a Docker Image and Deploy After Tests Pass",
      scenario: "On every push to main you want to build a Docker image, push it to GitHub Container Registry and trigger a Render deploy hook. Pull requests should only test, never deploy.",
      steps: [
        "In Render, copy the service's Deploy Hook URL",
        "In GitHub: Settings > Secrets and variables > Actions > New repository secret: RENDER_DEPLOY_HOOK",
        "Add the deploy job below to ci.yml under the existing test job",
        "Merge a PR into main and watch the deploy job start after test finishes",
      ],
      code: `  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}

      - name: Trigger Render deploy
        run: curl -fsS -X POST "\${{ secrets.RENDER_DEPLOY_HOOK }}"
`,
      result: `test    ✓ 1m 02s
deploy  ✓ 1m 48s
  ✓ Log in to GHCR
  ✓ Build and push image   pushed ghcr.io/team/shop-api:3f9c2ab...
  ✓ Trigger Render deploy  {"deploy":{"id":"dep-..."}}`,
      explanation: "needs: test makes deploy wait for tests; if tests fail, deploy is skipped. The if: condition blocks deploys from pull requests and other branches. GITHUB_TOKEN is an automatic token GitHub creates per run; permissions gives it only package write access. Tagging with the commit SHA makes every image traceable and easy to roll back. curl -f fails the step if Render returns an error.",
    },
    {
      title: "Protect main and Add a Status Badge",
      scenario: "Even with CI, someone merged a PR with a red build. You configure branch protection so this can never happen again and show build health in the README.",
      steps: [
        "GitHub repository > Settings > Branches > Add branch protection rule (or Rules > Rulesets)",
        "Branch name pattern: main",
        "Tick: Require a pull request before merging, Require approvals: 1",
        "Tick: Require status checks to pass before merging, then search and select 'test'",
        "Tick: Require branches to be up to date before merging, then Save",
        "Add the badge line to README.md and push",
      ],
      code: `<!-- README.md -->
![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)

# Optional: cancel outdated runs (add at top level of ci.yml)
concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true
`,
      result: `Pull request page: "Merging is blocked - Required status check 'test' has not succeeded"
README shows a green "CI passing" badge`,
      explanation: "Branch protection turns CI from a suggestion into a rule. The merge button stays disabled until the 'test' check is green and a reviewer approves. The concurrency block cancels an older run of the same branch when you push again, saving runner minutes.",
    },
  ],
  interview: [
    {
      q: "What is the difference between Continuous Integration, Continuous Delivery and Continuous Deployment?",
      a: "CI: every push/PR is automatically built and tested so integration problems are found early. Continuous Delivery: code that passes CI is automatically packaged and is always ready to release, but a human approves the production release. Continuous Deployment: every change that passes the pipeline is released to production automatically with no manual step.",
      level: "Easy",
    },
    {
      q: "Where do GitHub Actions workflow files live and what format are they?",
      a: "They are YAML files inside `.github/workflows/` in the repository, for example `.github/workflows/ci.yml`. Any .yml or .yaml file in that folder is treated as a workflow.",
      level: "Easy",
    },
    {
      q: "Explain workflow, job, step, runner and action.",
      a: "A workflow is the whole automated process defined in one YAML file and triggered by events. It contains jobs; each job runs on a runner (a VM such as ubuntu-latest, or a self-hosted machine). A job has ordered steps. A step either runs a shell command (`run:`) or uses an action (`uses:`), which is a reusable packaged unit such as actions/checkout@v4.",
      level: "Easy",
    },
    {
      q: "How do you run tests against several Python versions?",
      a: "Use `strategy.matrix`, e.g. `python-version: [\"3.10\", \"3.11\", \"3.12\"]`, and pass `\${{ matrix.python-version }}` to actions/setup-python. GitHub creates one job per combination and runs them in parallel. Quote the versions so YAML does not convert 3.10 to 3.1.",
      level: "Medium",
    },
    {
      q: "How do you keep secrets like API keys safe in a CI pipeline?",
      a: "Store them in GitHub Secrets (repository, environment or organization level) and reference them as `\${{ secrets.NAME }}`. Never commit them in code or YAML. GitHub masks them in logs, does not give them to PRs from forks, and you should grant the GITHUB_TOKEN minimal `permissions`. For cloud deploys prefer OIDC short-lived credentials over long-lived keys.",
      level: "Medium",
    },
    {
      q: "How can you speed up a slow Python CI pipeline?",
      a: "Cache pip dependencies (`cache: pip` in setup-python), run fast checks (lint) first, split jobs and run them in parallel, use pytest-xdist (`pytest -n auto`), only run expensive integration tests on main, cancel outdated runs with concurrency, use smaller Docker layers with build cache, and avoid installing unnecessary packages.",
      level: "Medium",
    },
    {
      q: "How do you make a deploy job run only after tests pass and only on the main branch?",
      a: "Add `needs: test` so it depends on the test job, and `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` so pull requests and other branches skip it. Optionally use `environment: production` with required reviewers for manual approval.",
      level: "Medium",
    },
    {
      q: "What is the GITHUB_TOKEN?",
      a: "An automatically generated, short-lived token created for every workflow run, available as `\${{ secrets.GITHUB_TOKEN }}`. It can access the current repository (e.g. push packages to ghcr.io, comment on PRs). Its rights are controlled by the `permissions:` key and it expires when the job ends.",
      level: "Medium",
    },
    {
      q: "What are service containers in GitHub Actions?",
      a: "Docker containers (like postgres:16 or redis:7) started alongside a job via the `services:` key. They let integration tests talk to real databases or caches. With `ports:` mapping, the job reaches them on localhost; health-check options make the job wait until they are ready.",
      level: "Medium",
    },
    {
      q: "A test passes locally but fails in CI. How do you debug it?",
      a: "Read the step logs carefully. Common causes: missing dependency not in requirements.txt, different Python version, environment variables or secrets not set, tests depending on local files, time zone or OS differences, test order dependence, or network calls. Reproduce with the same Python version in a fresh venv or Docker, pin versions, and make tests independent. You can re-run jobs with debug logging enabled.",
      level: "Hard",
    },
    {
      q: "How would you design a CI/CD pipeline for a Python microservice in production?",
      a: "On PR: ruff + type check (mypy), unit tests with coverage threshold, security scan (pip-audit / Dependabot). On merge to main: integration tests with service containers, build a Docker image tagged with the commit SHA, push to a registry, deploy to staging automatically, run smoke tests, then promote to production via an environment with manual approval or automatic canary/blue-green rollout. Keep rollback simple by redeploying the previous image tag. Protect main with required checks.",
      level: "Hard",
    },
    {
      q: "Why pin action versions like actions/checkout@v4 or even a commit SHA?",
      a: "Without a version you could get breaking changes or, worse, malicious code if an action is compromised. A major tag (@v4) gets compatible updates; pinning a full commit SHA is the most secure because tags can be moved. Dependabot can keep pinned actions updated.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create a CI workflow for a Flask project that runs on push and pull_request, sets up Python 3.12 with pip caching, installs requirements.txt and runs pytest.",
      hint: "Use actions/checkout@v4 and actions/setup-python@v5 with cache: pip.",
      solution: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest -q
`,
    },
    {
      task: "Split the pipeline into two jobs: 'lint' (ruff check and ruff format --check) and 'test' (pytest). The test job must run only if lint passes.",
      hint: "Use needs: lint in the test job.",
      solution: `jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install ruff
      - run: ruff check .
      - run: ruff format --check .
  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements.txt
      - run: pytest -q
`,
    },
    {
      task: "Add a matrix so the test job runs on Python 3.11 and 3.12 and on both ubuntu-latest and windows-latest (4 jobs total).",
      hint: "A matrix can have two keys; use \${{ matrix.os }} in runs-on.",
      solution: `test:
  runs-on: \${{ matrix.os }}
  strategy:
    fail-fast: false
    matrix:
      os: [ubuntu-latest, windows-latest]
      python-version: ["3.11", "3.12"]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: \${{ matrix.python-version }}
        cache: pip
    - run: pip install -r requirements.txt
    - run: pytest -q
`,
    },
    {
      task: "Write a scheduled workflow that runs pip-audit every Monday at 03:30 UTC and can also be started manually.",
      hint: "Use on: schedule with cron and workflow_dispatch.",
      solution: `name: Security audit
on:
  schedule:
    - cron: "30 3 * * 1"
  workflow_dispatch:
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install pip-audit
      - run: pip-audit -r requirements.txt
`,
    },
    {
      task: "Add a deploy job that calls a deploy hook stored as secret DEPLOY_HOOK_URL, only after tests pass and only for pushes to main.",
      hint: "Combine needs, if and secrets.",
      solution: `deploy:
  needs: test
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  runs-on: ubuntu-latest
  steps:
    - name: Trigger deploy
      run: curl -fsS -X POST "\${{ secrets.DEPLOY_HOOK_URL }}"
`,
    },
  ],
  quiz: [
    {
      question: "In which folder must GitHub Actions workflow files be placed?",
      options: [".github/actions/", ".github/workflows/", ".ci/", "workflows/"],
      answer: 1,
      explanation: "GitHub only reads workflow YAML files from .github/workflows/.",
    },
    {
      question: "Which key makes a job wait for another job to finish successfully?",
      options: ["after:", "depends:", "needs:", "wait-for:"],
      answer: 2,
      explanation: "needs: job_id creates a dependency; the job is skipped if the needed job fails.",
    },
    {
      question: "Why should you write python-version: \"3.10\" with quotes?",
      options: [
        "GitHub requires all values to be quoted",
        "Without quotes YAML reads it as the number 3.1",
        "Quotes make the job run faster",
        "It is only a style preference",
      ],
      answer: 1,
      explanation: "YAML parses 3.10 as a float, which becomes 3.1, so setup-python would install the wrong version.",
    },
    {
      question: "How do you read a repository secret named API_KEY in a workflow?",
      options: ["$API_KEY", "\${{ env.API_KEY }}", "\${{ secrets.API_KEY }}", "{{ API_KEY }}"],
      answer: 2,
      explanation: "Secrets are accessed through the secrets context: \${{ secrets.API_KEY }}.",
    },
    {
      question: "What does 'cache: pip' in actions/setup-python do?",
      options: [
        "Caches the test results",
        "Saves downloaded pip packages between runs to speed up installs",
        "Installs pip on the runner",
        "Uploads packages to PyPI",
      ],
      answer: 1,
      explanation: "It restores pip's download cache keyed on your requirements file hash, making installs faster.",
    },
    {
      question: "Which feature prevents merging a pull request while CI is failing?",
      options: ["Matrix strategy", "Service containers", "Branch protection with required status checks", "workflow_dispatch"],
      answer: 2,
      explanation: "Branch protection rules (or rulesets) can require specific checks to pass before the merge button is enabled.",
    },
  ],
};
