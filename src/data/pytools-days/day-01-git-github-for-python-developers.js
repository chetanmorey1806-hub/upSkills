export default {
  id: "day-01-git-github-for-python-developers",
  title: "Git and GitHub for Python Developers",
  module: "Module 1: Developer Workflow",
  day: 1,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn the everyday Git and GitHub workflow used in real Python teams: tracking changes, writing a proper .gitignore, working on branches, writing good commit messages and getting code merged through pull requests.",
  objectives: [
    "Explain what Git and GitHub are and how they differ",
    "Initialise a repository, stage changes and make clean commits",
    "Write a .gitignore that keeps venv, __pycache__ and .env out of Git",
    "Create, switch, merge and delete branches and resolve a simple merge conflict",
    "Push to GitHub and open, review and merge a pull request",
    "Write commit messages that follow a clear, conventional format",
  ],
  theory: [
    {
      heading: "What are Git and GitHub?",
      content: "**Git** is a version control system that runs on your laptop. It records snapshots (commits) of your project so you can see who changed what, go back to an older version, and work on features in parallel without breaking the main code.\n\n**GitHub** is a website that hosts Git repositories online. It adds collaboration features: pull requests, code review, issues, GitHub Actions (CI/CD) and project boards. GitLab and Bitbucket are alternatives. Git works fully offline; GitHub is where the team shares the code.\n\nAlmost every Python job in India (product companies, startups and service companies) expects you to be comfortable with Git. Interviewers often ask you to explain your daily Git workflow.",
      points: [
        "Repository (repo): a project folder tracked by Git (it has a hidden .git folder)",
        "Commit: a saved snapshot with a message, author and unique hash (e.g. a1b2c3d)",
        "Remote: a copy of the repo on a server, usually named origin",
        "Clone: download a full copy of a remote repo, including history",
      ],
    },
    {
      heading: "The Three Areas: Working Directory, Staging Area, Repository",
      content: "Git has three areas. The **working directory** is the files you edit. The **staging area** (index) is a list of changes you have chosen for the next commit. The **repository** stores the commits permanently.\n\nYou move changes with `git add` (working directory to staging) and `git commit` (staging to repository). This two-step process lets you commit only related changes together, even if you edited many files.",
      syntax: `git init                      # start tracking a folder
git status                    # what changed? what is staged?
git add app.py                # stage one file
git add .                     # stage everything (respects .gitignore)
git commit -m "Add login view" # save a snapshot
git log --oneline --graph     # view history
git diff                      # unstaged changes
git diff --staged             # staged changes`,
      tip: "Run git status before every commit. It is the single most useful Git command and prevents accidental commits.",
    },
    {
      heading: "The .gitignore File for Python Projects",
      content: "A `.gitignore` file lists files and folders Git should never track. In Python projects you must ignore the virtual environment, compiled bytecode, secrets, local databases and editor settings. Committing a `venv` folder adds thousands of useless files; committing a `.env` file can leak passwords and API keys publicly.\n\nIf a file is already tracked, adding it to .gitignore is not enough. You must untrack it with `git rm --cached <file>` and commit.",
      syntax: `# .gitignore for a Python project
venv/
.venv/
__pycache__/
*.pyc
.env
*.sqlite3
db.sqlite3
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.vscode/
.idea/`,
      tip: "GitHub offers a ready-made Python .gitignore template when you create a new repository. Use it and then add project-specific lines.",
    },
    {
      heading: "Branches and Merging",
      content: "A **branch** is a movable pointer to a commit. The default branch is usually `main`. You create a feature branch for every task (feature/login, fix/cart-total) so your unfinished work never breaks main.\n\nWhen the feature is done, you **merge** it back. If both branches changed the same lines, Git cannot decide and reports a **merge conflict**. You open the file, choose the correct code between the `<<<<<<<`, `=======` and `>>>>>>>` markers, remove the markers, then `git add` and `git commit`.",
      syntax: `git switch -c feature/login   # create and switch (newer than checkout -b)
git branch                     # list branches
git switch main                # go back to main
git merge feature/login        # merge feature into current branch
git branch -d feature/login    # delete merged branch`,
      points: [
        "Fast-forward merge: main had no new commits, so the pointer just moves forward",
        "Three-way merge: both branches moved, Git creates a merge commit",
        "Rebase: replays your commits on top of another branch for a linear history; never rebase commits others already pulled",
      ],
    },
    {
      heading: "Working with GitHub: Remote, Push, Pull, Fork",
      content: "After creating an empty repo on GitHub, connect your local repo to it and push. `git push` uploads commits; `git pull` downloads and merges others' commits (it is `git fetch` + `git merge`). Authentication uses a Personal Access Token or SSH key, not your account password.\n\nIn open source you **fork** (make your own copy of someone's repo on GitHub), clone your fork, push to it, and open a pull request to the original repo.",
      syntax: `git remote add origin https://github.com/<user>/student-api.git
git branch -M main
git push -u origin main        # -u remembers the upstream
git pull                       # get latest changes
git fetch                      # download without merging`,
    },
    {
      heading: "Pull Requests and Code Review",
      content: "A **pull request (PR)** is a request to merge one branch into another on GitHub. It shows the diff, lets teammates comment line by line, runs automated checks (tests, lint) and keeps a record of why a change was made.\n\nA good PR is small (ideally under 300-400 changed lines), has a clear title and description, links the issue (Closes #42), and passes CI. GitHub offers three merge options: merge commit, squash and merge (all commits become one), and rebase and merge.",
      points: [
        "Keep main protected: require a PR, at least one approval and passing checks",
        "Respond to review comments with new commits, not by force-pushing over history others are reading",
        "Delete the branch after merging to keep the repo clean",
      ],
    },
    {
      heading: "Writing Good Commit Messages",
      content: "A commit message explains **why** a change was made. Use a short summary line (about 50 characters, imperative mood: \"Add\", \"Fix\", not \"Added\"), a blank line, then an optional body. Many teams follow **Conventional Commits**: `type(scope): summary` where type is feat, fix, docs, refactor, test, chore, ci or style.\n\nGood: `fix(cart): apply GST after discount`. Bad: `changes`, `final code`, `asdf`.",
      syntax: `feat(auth): add JWT login endpoint

Users can now log in with email and password and receive
an access token valid for 30 minutes.

Closes #42`,
      tip: "Make small commits that do one thing. Small commits are easy to review, easy to revert and make git log useful.",
    },
  ],
  examples: [
    {
      title: "Start a Python Project with Git",
      scenario: "You are starting a new Flask practice project and want it tracked by Git from day one, without committing the virtual environment.",
      steps: [
        "Install Git from git-scm.com and set your name and email once",
        "Create the project folder and a virtual environment",
        "Create .gitignore before the first commit",
        "Stage and commit, then check the log",
      ],
      code: `git config --global user.name "Asha Patil"
git config --global user.email "asha@example.com"

mkdir student-api && cd student-api
python -m venv venv
echo "venv/" > .gitignore
echo "__pycache__/" >> .gitignore
echo ".env" >> .gitignore
echo "print('hello')" > app.py

git init
git add .
git status
git commit -m "chore: initial project setup"
git log --oneline`,
      result: `On branch main
Changes to be committed:
        new file:   .gitignore
        new file:   app.py

[main (root-commit) 3f9c2ab] chore: initial project setup
 2 files changed, 4 insertions(+)
3f9c2ab (HEAD -> main) chore: initial project setup`,
      explanation: "Because venv/ is in .gitignore, git status shows only .gitignore and app.py. The commit hash will differ on your machine. If your Git still names the default branch master, run git config --global init.defaultBranch main.",
    },
    {
      title: "Feature Branch Workflow",
      scenario: "You need to add a discount function without touching main until it is finished and reviewed.",
      steps: [
        "Create and switch to a feature branch",
        "Edit code and commit on the branch",
        "Switch back to main and merge",
        "Delete the branch",
      ],
      code: `git switch -c feature/discount
# edit pricing.py: add def apply_discount(price, pct): ...
git add pricing.py
git commit -m "feat(pricing): add apply_discount function"

git switch main
git merge feature/discount
git branch -d feature/discount
git log --oneline --graph`,
      result: `Updating 3f9c2ab..8d1e4f0
Fast-forward
 pricing.py | 3 +++
 1 file changed, 3 insertions(+)
Deleted branch feature/discount (was 8d1e4f0).
* 8d1e4f0 (HEAD -> main) feat(pricing): add apply_discount function
* 3f9c2ab chore: initial project setup`,
      explanation: "main had no new commits since the branch was created, so Git did a fast-forward merge: it simply moved the main pointer forward. No merge commit was needed.",
    },
    {
      title: "Resolving a Merge Conflict",
      scenario: "You and a teammate both changed the GST rate line in config.py on different branches.",
      steps: [
        "Merge the teammate's branch and notice the conflict",
        "Open the file and choose the right value",
        "Remove the conflict markers",
        "Stage and commit the resolution",
      ],
      code: `git merge feature/gst-update
# CONFLICT (content): Merge conflict in config.py

# config.py now contains:
<<<<<<< HEAD
GST_RATE = 18
=======
GST_RATE = 12
>>>>>>> feature/gst-update

# Edit to the agreed value and remove markers:
GST_RATE = 12

git add config.py
git commit -m "merge: resolve GST rate conflict"`,
      result: `[main 51c7e9a] merge: resolve GST rate conflict`,
      explanation: "HEAD shows your current branch's version; the part after ======= shows the incoming branch. Git cannot know which is right, so a human decides. VS Code shows buttons like Accept Current, Accept Incoming and Accept Both to make this easier.",
    },
    {
      title: "Push to GitHub and Open a Pull Request",
      scenario: "Your team requires every change to go through a PR on GitHub.",
      steps: [
        "Create an empty repository on github.com (no README, to avoid an initial conflict)",
        "Add the remote and push main",
        "Create a branch, commit, push the branch",
        "Open a PR on GitHub (or with the gh CLI), request review, merge after approval",
      ],
      code: `git remote add origin https://github.com/asha/student-api.git
git push -u origin main

git switch -c feature/health-check
# add a /health route
git commit -am "feat(api): add health check endpoint"
git push -u origin feature/health-check

# Optional: GitHub CLI
gh pr create --title "Add health check endpoint" \\
  --body "Adds GET /health returning {status: ok}. Closes #7"`,
      result: `https://github.com/asha/student-api/pull/1`,
      explanation: "git commit -am stages modified tracked files and commits in one step (it does not add new untracked files). After pushing the branch, GitHub shows a Compare & pull request button. Reviewers comment, CI runs, and once approved you merge and delete the branch.",
    },
    {
      title: "Undoing Mistakes Safely",
      scenario: "You committed a .env file by mistake and also want to undo a bad commit on a shared branch.",
      steps: [
        "Stop tracking .env but keep it on disk",
        "Undo a pushed commit safely with revert",
        "Unstage a file you added by mistake",
      ],
      code: `echo ".env" >> .gitignore
git rm --cached .env
git commit -m "chore: stop tracking .env"

git revert 8d1e4f0          # new commit that undoes 8d1e4f0
git restore --staged app.py # unstage, keep edits
git restore app.py          # discard local edits (careful!)`,
      result: `rm '.env'
[main 7a2b3c4] chore: stop tracking .env
[main 9e8f7d6] Revert "feat(pricing): add apply_discount function"`,
      explanation: "git rm --cached removes the file from Git but not from your disk. The secret still exists in old history, so you must rotate (change) the leaked password or key. git revert is safe for shared branches because it adds a new commit instead of rewriting history like git reset --hard.",
    },
  ],
  interview: [
    { q: "What is the difference between Git and GitHub?", a: "Git is a distributed version control tool that runs locally and tracks changes as commits. GitHub is a cloud hosting service for Git repositories that adds collaboration features such as pull requests, code review, issues and GitHub Actions. You can use Git without GitHub.", level: "Easy" },
    { q: "What is the staging area?", a: "The staging area (index) is an intermediate area where you place the changes you want in the next commit using git add. It lets you commit only related changes even if many files were edited.", level: "Easy" },
    { q: "What should a Python project's .gitignore contain?", a: "At minimum: venv/ or .venv/, __pycache__/, *.pyc, .env, local databases like db.sqlite3, test and coverage output (.pytest_cache/, .coverage, htmlcov/), build artefacts (dist/, build/, *.egg-info/) and IDE folders (.vscode/, .idea/).", level: "Easy" },
    { q: "Difference between git fetch and git pull?", a: "git fetch downloads new commits from the remote but does not change your working branch. git pull = git fetch + git merge (or rebase if configured), so it updates your current branch immediately.", level: "Easy" },
    { q: "Difference between git merge and git rebase?", a: "Merge combines two branches and may create a merge commit, preserving the true history. Rebase moves your commits on top of another branch, rewriting their hashes and giving a linear history. Rule: do not rebase commits that are already pushed and shared with others.", level: "Medium" },
    { q: "Difference between git reset and git revert?", a: "git revert creates a new commit that undoes a previous commit; history is kept, so it is safe on shared branches. git reset moves the branch pointer backwards (--soft keeps changes staged, --mixed keeps them unstaged, --hard discards them). Reset rewrites history and should be used only on local, unpushed commits.", level: "Medium" },
    { q: "How do you resolve a merge conflict?", a: "Run git status to see conflicted files, open each file, decide the correct content between the <<<<<<<, ======= and >>>>>>> markers, remove the markers, run tests, then git add the files and git commit (or git merge --continue). Communicate with the teammate if unsure.", level: "Medium" },
    { q: "You accidentally committed an API key and pushed it. What do you do?", a: "First revoke/rotate the key immediately, because it is already public. Then remove it from the code, move it to an environment variable or .env file listed in .gitignore, and git rm --cached the file. Optionally rewrite history with git filter-repo and force-push, but rotation is the essential step.", level: "Hard" },
    { q: "What makes a good pull request?", a: "Small and focused, a clear title, a description of what and why, linked issue, screenshots or sample output if relevant, tests added or updated, CI passing, and no unrelated formatting changes. Small PRs get faster and better reviews.", level: "Medium" },
    { q: "What is a good commit message?", a: "A short imperative summary (~50 chars) like 'fix(cart): apply GST after discount', a blank line, then an optional body explaining why. Conventional Commits types include feat, fix, docs, refactor, test, chore and ci.", level: "Easy" },
    { q: "What is git stash used for?", a: "git stash temporarily saves uncommitted changes and cleans the working directory, so you can switch branches (e.g. to fix an urgent bug). git stash pop brings the changes back. git stash list shows saved stashes.", level: "Medium" },
    { q: "Explain a branching strategy you have used.", a: "A common one is GitHub Flow: main is always deployable; create a short-lived feature branch per task, open a PR, get review and passing CI, merge to main and deploy. Larger teams may use Git Flow with develop and release branches, but most modern teams prefer short-lived branches and trunk-based development.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a folder calc-app with a venv, an app.py and a .gitignore. Initialise Git and make your first commit so that venv is not tracked.",
      hint: "Write .gitignore before running git add.",
      solution: `mkdir calc-app && cd calc-app
python -m venv venv
printf "venv/\\n__pycache__/\\n.env\\n" > .gitignore
echo "print(2 + 3)" > app.py
git init
git add .
git status          # only .gitignore and app.py
git commit -m "chore: initial commit"`,
    },
    {
      task: "On a branch feature/multiply, add a multiply function, commit it, merge it into main and delete the branch.",
      hint: "Use git switch -c, then git switch main and git merge.",
      solution: `git switch -c feature/multiply
echo "def multiply(a, b): return a * b" >> app.py
git commit -am "feat: add multiply function"
git switch main
git merge feature/multiply
git branch -d feature/multiply`,
    },
    {
      task: "Create a deliberate merge conflict: change the same line of app.py on two branches, merge them, and resolve it.",
      hint: "Edit the same line differently on main and on a branch, commit both, then merge.",
      solution: `git switch -c feature/a
sed -i 's/2 + 3/2 + 30/' app.py && git commit -am "change A"
git switch main
sed -i 's/2 + 3/20 + 3/' app.py && git commit -am "change B"
git merge feature/a          # CONFLICT in app.py
# open app.py, keep the correct line, delete <<<<<<< ======= >>>>>>> markers
git add app.py
git commit -m "merge: resolve app.py conflict"`,
    },
    {
      task: "Rewrite these bad commit messages in Conventional Commits style: 'done', 'fixed bug', 'updated readme', 'tests'.",
      hint: "Use type(scope): imperative summary.",
      solution: `done          -> feat(orders): add order cancellation endpoint
fixed bug     -> fix(cart): prevent negative quantity in cart
updated readme-> docs(readme): add local setup instructions
tests         -> test(auth): add tests for expired JWT tokens`,
    },
    {
      task: "Push your calc-app to a new GitHub repository, create a branch feature/readme, add a README.md, push it and open a pull request.",
      hint: "git remote add origin <url>, git push -u origin main, then push the branch and use the Compare & pull request button.",
      solution: `git remote add origin https://github.com/<you>/calc-app.git
git branch -M main
git push -u origin main
git switch -c feature/readme
echo "# Calc App" > README.md
git add README.md
git commit -m "docs: add README"
git push -u origin feature/readme
# On GitHub: Compare & pull request -> add description -> Create pull request -> Merge`,
    },
  ],
  quiz: [
    { question: "Which command moves changes from the working directory to the staging area?", options: ["git commit", "git add", "git push", "git stage-all"], answer: 1, explanation: "git add stages changes; git commit then saves the staged snapshot." },
    { question: "Which line should NOT be missing from a Python .gitignore?", options: ["*.py", "requirements.txt", "venv/", "README.md"], answer: 2, explanation: "The virtual environment must not be committed; requirements.txt and source files must be committed." },
    { question: "What does git pull do?", options: ["Only downloads commits", "Fetch and merge into the current branch", "Uploads local commits", "Deletes remote branches"], answer: 1, explanation: "git pull is git fetch followed by git merge (or rebase if configured)." },
    { question: "Which is the safest way to undo a commit already pushed to a shared branch?", options: ["git reset --hard", "git revert <hash>", "Delete the .git folder", "git push --force"], answer: 1, explanation: "git revert adds a new commit that undoes the change without rewriting shared history." },
    { question: "Which command creates and switches to a new branch?", options: ["git branch -d new", "git switch -c new", "git merge new", "git init new"], answer: 1, explanation: "git switch -c (or the older git checkout -b) creates and switches in one step." },
    { question: "Which commit message follows Conventional Commits?", options: ["Fixed stuff", "final changes", "fix(login): handle empty password", "Update"], answer: 2, explanation: "Conventional Commits use type(scope): short imperative summary." },
  ],
};
