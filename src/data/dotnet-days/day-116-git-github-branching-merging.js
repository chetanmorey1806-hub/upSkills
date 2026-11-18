const firstRepoCode = `# ===== One-time setup (Git for Windows: https://git-scm.com, or "winget install Git.Git") =====
git --version
git config --global user.name  "Ravi Kumar"
git config --global user.email "ravi@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf true        # Windows: convert line endings
git config --list

# ===== Create a .NET project and put it under version control =====
mkdir SchoolApp
cd SchoolApp
dotnet new sln -n SchoolApp
dotnet new webapi -n SchoolApi --use-controllers
dotnet sln add SchoolApi
dotnet new gitignore                           # official .NET .gitignore (bin/, obj/, .vs/ ...)

git init                                       # creates the hidden .git folder
git status                                     # what changed?
git add .                                      # stage everything (respecting .gitignore)
git status
git commit -m "Initial commit: SchoolApi Web API"
git log --oneline

# ===== Make a change and commit again =====
# (edit SchoolApi/Program.cs in Visual Studio, then)
git status
git diff                                       # see the exact lines changed
git add SchoolApi/Program.cs
git commit -m "Add health endpoint"
git log --oneline --graph

# ===== Undo helpers =====
git restore Program.cs                         # throw away unstaged changes in a file
git restore --staged Program.cs                # unstage (keep the change)
git commit --amend -m "Better message"         # fix the LAST commit (only if not pushed)
git revert <commit-id>                         # new commit that undoes an old one (safe after push)`;

const gitignoreCode = `# ===== .gitignore for a .NET + React (Vite) solution =====
# --- .NET build output ---
bin/
obj/
[Dd]ebug/
[Rr]elease/
*.user
*.suo

# --- Visual Studio / VS Code / Rider ---
.vs/
.vscode/*
!.vscode/extensions.json
.idea/

# --- Secrets and local settings (NEVER commit) ---
appsettings.Development.json
appsettings.*.local.json
*.pfx
.env
.env.local

# --- Logs, test results, publish output ---
*.log
TestResults/
publish/
*.zip

# --- React / Node ---
node_modules/
dist/
coverage/

# --- OS files ---
.DS_Store
Thumbs.db

# ===== Useful commands =====
# Already committed bin/ or a secret file by mistake? Stop tracking it (file stays on disk):
#   git rm -r --cached bin obj
#   git commit -m "Stop tracking build output"
# Check why a file is ignored:
#   git check-ignore -v SchoolApi/bin/Debug/net8.0/SchoolApi.dll
# NOTE: if a password was pushed, removing the file is NOT enough – rotate (change) the secret.`;

const branchingCode = `# ===== Feature branch workflow =====
git switch -c feature/student-search          # create + switch (older: git checkout -b ...)
# ... edit StudentsController.cs, add Search action ...
git add .
git commit -m "Add student search endpoint"
git switch main
git merge feature/student-search              # fast-forward if main has no new commits
git branch -d feature/student-search          # delete merged branch

# ===== A merge conflict =====
git switch -c feature/grade-rules
# change GradeFor: marks >= 85 => "A"
git commit -am "Raise A grade to 85"
git switch main
# a teammate's change on main: marks >= 95 => "A"
git commit -am "A grade only above 95"
git merge feature/grade-rules
#   Auto-merging School.Core/Calculator.cs
#   CONFLICT (content): Merge conflict in School.Core/Calculator.cs
#   Automatic merge failed; fix conflicts and then commit the result.

# --- Calculator.cs now contains conflict markers ---
<<<<<<< HEAD
        if (marks >= 95) return "A";
=======
        if (marks >= 85) return "A";
>>>>>>> feature/grade-rules

# --- Resolve: edit the file to the agreed version and remove ALL markers ---
        if (marks >= 90) return "A";

git add School.Core/Calculator.cs
git commit -m "Merge feature/grade-rules, agree on 90 for grade A"
# (or give up: git merge --abort)

# ===== Other useful branch commands =====
git branch                 # list local branches (* = current)
git branch -a              # include remote branches
git log --oneline --graph --all
git stash                  # park unfinished work, switch branch, then: git stash pop
git rebase main            # replay your feature commits on top of latest main (only on YOUR branches)
git cherry-pick <id>       # copy one commit onto the current branch
git tag v1.0.0             # mark a release`;

const githubCode = `# ===== Connect the local repo to GitHub =====
# 1) github.com > New repository > name: SchoolApp > Private > (do NOT add README) > Create
git remote add origin https://github.com/<your-user>/SchoolApp.git
git remote -v
git push -u origin main               # -u remembers origin/main as upstream; later just "git push"
# Login: Git Credential Manager opens a browser window (password login is not allowed – use browser / PAT / SSH)

# ===== Teammate clones the repo =====
git clone https://github.com/<your-user>/SchoolApp.git
cd SchoolApp
dotnet restore
dotnet build

# ===== Daily routine =====
git switch main
git pull                              # = git fetch + git merge origin/main
git switch -c feature/attendance
# ... work, commit small and often ...
git push -u origin feature/attendance
# GitHub shows "Compare & pull request" > write description > Reviewers > Create pull request
# Reviewer comments -> you push more commits to the same branch -> PR updates automatically
# Approve -> "Squash and merge" -> Delete branch
git switch main
git pull
git branch -d feature/attendance

# ===== fetch vs pull =====
git fetch origin                      # download new commits, do NOT change your files
git log main..origin/main --oneline   # see what is new
git merge origin/main                 # now integrate (pull does both steps)

# ===== The same in Visual Studio 2022 =====
# Git > Create Git Repository > Push to GitHub (sign in) > Create and Push
# View > Git Changes (Ctrl+0, Ctrl+G): write message > Commit All > Push (arrow up) / Pull (arrow down)
# Git > Manage Branches: new branch, merge, rebase, view history
# Conflicts: Git Changes shows "Unmerged Changes" > double-click > 3-way Merge Editor > Accept Merge

# ===== Protect main on GitHub =====
# Settings > Branches > Add rule "main": Require a pull request before merging,
# Require approvals (1), Require status checks to pass (the CI build from Day 118)`;

const hashCode = `using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

// Git stores every file version as a "blob" whose id = SHA-1("blob <size>" + byte 0 + content)
string BlobId(string content)
{
    byte[] body = Encoding.UTF8.GetBytes(content);
    byte[] header = Encoding.ASCII.GetBytes($"blob {body.Length}");
    byte[] data = header.Append((byte)0).Concat(body).ToArray();
    return Convert.ToHexString(SHA1.HashData(data)).ToLowerInvariant();
}

string[] versions = { "Hello Git", "Hello Git", "Hello git", "" };
foreach (var v in versions)
{
    string id = BlobId(v);
    string label = $"[{v}]";
    Console.WriteLine($"{label,-12} -> {id}  (short: {id[..7]})");
}

Console.WriteLine($"Same content, same id? {BlobId("Hello Git") == BlobId("Hello Git")}");
Console.WriteLine($"One letter changed, same id? {BlobId("Hello Git") == BlobId("Hello git")}");
`;

const simCode = `using System;
using System.Collections.Generic;
using System.Linq;

var commits = new Dictionary<string, CommitInfo>();
var branches = new Dictionary<string, string?> { ["main"] = null };   // branch -> latest commit
string head = "main";                                                 // current branch
int counter = 0;

Commit("Initial commit");
Commit("Add Student model");
Branch("feature/login");
Switch("feature/login");
Commit("Add login page");
Commit("Add JWT service");
Switch("main");
Commit("Fix README typo");
Merge("feature/login");          // histories diverged -> merge commit
Branch("hotfix");
Switch("hotfix");
Commit("Fix null check");
Switch("main");
Merge("hotfix");                 // main is behind -> fast-forward
Log();

string Commit(string message, string? secondParent = null)
{
    counter++;
    string id = $"c{counter}";
    var parents = new List<string>();
    if (branches[head] is string p) parents.Add(p);
    if (secondParent is not null) parents.Add(secondParent);
    commits[id] = new CommitInfo(id, message, parents);
    branches[head] = id;                                   // branch pointer moves forward
    Console.WriteLine($"[{head} {id}] {message}");
    return id;
}

void Branch(string name)
{
    branches[name] = branches[head];                       // a branch is just a pointer
    Console.WriteLine($"Created branch {name} at {branches[head]}");
}

void Switch(string name)
{
    head = name;
    Console.WriteLine($"Switched to branch '{name}'");
}

void Merge(string other)
{
    string? ours = branches[head];
    string? theirs = branches[other];
    if (IsAncestor(ours, theirs))
    {
        branches[head] = theirs;
        Console.WriteLine($"Fast-forward {head} -> {theirs}");
    }
    else
    {
        Commit($"Merge branch '{other}' into {head}", theirs);
    }
}

bool IsAncestor(string? ancestor, string? start)
{
    if (ancestor is null) return true;
    var stack = new Stack<string>();
    if (start is not null) stack.Push(start);
    var seen = new HashSet<string>();
    while (stack.Count > 0)
    {
        string c = stack.Pop();
        if (c == ancestor) return true;
        if (!seen.Add(c)) continue;
        foreach (var parent in commits[c].Parents) stack.Push(parent);
    }
    return false;
}

void Log()
{
    Console.WriteLine($"--- git log --oneline ({head}) ---");
    var reachable = new HashSet<string>();
    var stack = new Stack<string>();
    stack.Push(branches[head]!);
    while (stack.Count > 0)
    {
        string c = stack.Pop();
        if (!reachable.Add(c)) continue;
        foreach (var parent in commits[c].Parents) stack.Push(parent);
    }
    foreach (var id in reachable.OrderByDescending(x => int.Parse(x.Substring(1))))
    {
        CommitInfo ci = commits[id];
        string extra = ci.Parents.Count > 1 ? $"  (parents: {string.Join(", ", ci.Parents)})" : "";
        Console.WriteLine($"{id} {ci.Message}{extra}");
    }
}

record CommitInfo(string Id, string Message, List<string> Parents);
`;

export default {
  id: 'day-116-git-github-branching-merging',
  title: 'Git, GitHub, Branching, Commit, Push, Pull, Merge and .gitignore',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 116,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Every professional .NET team uses Git for version control and GitHub for collaboration. Learn the Git model (working directory, staging area, repository, commits as snapshots), the daily commands (init, status, add, commit, log, diff, restore), branching and merging (fast-forward, merge commits, conflicts), .gitignore for .NET + React, and the GitHub workflow (remote, push, pull, fetch, clone, pull requests, code review, branch protection) from the command line and from Visual Studio.',
  objectives: [
    'Explain version control, Git\'s three areas and how commits, branches and HEAD work',
    'Use git init, status, add, commit, log, diff, restore, revert confidently',
    'Create branches, merge them, and resolve merge conflicts',
    'Write a .gitignore for .NET and React projects and keep secrets out of Git',
    'Push to GitHub, clone, pull, fetch and work with pull requests in a team (CLI and Visual Studio)',
  ],
  theory: [
    {
      heading: 'What is version control and why Git?',
      content:
        'Version control records every change to your files so you can see who changed what, when and why, go back to any earlier version, and let many developers work on the same code at the same time. Without it teams email ZIP files named Final_v3_REAL.zip. Git is a DISTRIBUTED version control system: every developer has the full history locally, so commits, branches and logs work offline and are very fast. GitHub (also GitLab, Azure DevOps Repos, Bitbucket) is a website that hosts Git repositories and adds pull requests, issues, code review and CI/CD (GitHub Actions).',
      points: [
        'Git = the tool on your computer; GitHub = an online service that hosts Git repos',
        'Repository (repo) = project folder + its complete history (inside the hidden .git folder)',
        'Commit = a snapshot of the whole project with a message, author, date and parent commit(s)',
        'Each commit has a SHA-1 id like e51ca0d…; the first 7 characters are usually enough',
      ],
    },
    {
      heading: 'The three areas and the basic cycle',
      content:
        'Working directory: the files you edit. Staging area (index): the changes you have selected for the next commit. Repository: the committed history. The cycle is edit -> git add (stage) -> git commit (save snapshot). git status shows which files are untracked, modified or staged; git diff shows unstaged line changes and git diff --staged shows staged ones. Analogy: you write letters (working dir), put the ones you want to send into an envelope (staging), and post the envelope with a note on it (commit).',
      syntax: `git status
git add Program.cs            # or: git add .
git commit -m "Add health endpoint"
git log --oneline --graph --all
git diff / git diff --staged
git restore <file>            # discard local change
git restore --staged <file>   # unstage
git revert <id>               # undo a pushed commit safely`,
      tip: 'Write commit messages in the imperative: "Add login page", "Fix null reference in StudentService". Commit small, focused changes often.',
    },
    {
      heading: 'Branches and HEAD',
      content:
        'A branch is simply a movable pointer to a commit. main (or master) is the default branch. When you commit, the current branch pointer moves to the new commit. HEAD tells Git which branch you are on. Create a branch for every feature or bug fix (feature/login, bugfix/null-check) so main always stays working. Branches are cheap – creating one is just writing a 40-character id into a file.',
      syntax: `git branch                      # list
git switch -c feature/login     # create and switch
git switch main                 # switch back
git branch -d feature/login     # delete (after merge)
git stash / git stash pop       # park unfinished changes`,
    },
    {
      heading: 'Merging and resolving conflicts',
      content:
        'git merge <branch> brings another branch\'s commits into the current one. Fast-forward: if the current branch has no new commits, Git just moves the pointer forward – no new commit. Three-way merge: if both branches have new commits, Git creates a merge commit with two parents. A conflict happens when both sides changed the same lines: Git stops and writes <<<<<<< HEAD (your version), ======= and >>>>>>> other-branch (their version) into the file. Edit the file to the correct final code, remove the markers, then git add and git commit. git merge --abort cancels. Rebase (git rebase main) is an alternative that replays your commits on top of main for a straight history – never rebase commits others already pulled.',
    },
    {
      heading: '.gitignore – what must NOT be committed',
      content:
        '.gitignore lists patterns of files Git should ignore: build output (bin/, obj/), IDE folders (.vs/), user files (*.user), node_modules/ and dist/ for React, logs, and above all secrets (connection strings with passwords, JWT keys, .env files, certificates). Run "dotnet new gitignore" to get Microsoft\'s official template. .gitignore only affects UNTRACKED files – if something was already committed, use git rm --cached to stop tracking it. If a secret was ever pushed, assume it is leaked and rotate it.',
      points: [
        'Patterns: bin/ (folder), *.log (extension), !keep.log (exception), **/temp (any depth)',
        'Use User Secrets / environment variables for local secrets instead of appsettings.json',
        'GitHub secret scanning and push protection can block pushes that contain known key formats',
      ],
    },
    {
      heading: 'Remote repositories and the GitHub workflow',
      content:
        'origin is the conventional name of the remote repo. git push uploads your commits, git fetch downloads new commits without changing your files, git pull = fetch + merge, git clone copies a remote repo to your computer. Team workflow (GitHub Flow): pull main -> create a feature branch -> commit -> push the branch -> open a Pull Request (PR) -> teammates review and CI runs tests -> merge (merge commit, squash or rebase) -> delete the branch. Protect main with branch rules (PR required, approvals, passing checks). Forks are used to contribute to repos you cannot push to.',
      points: [
        'Authentication: Git Credential Manager (browser login), Personal Access Token, or SSH keys',
        'README.md, LICENSE and .gitignore are the first files of a good repo',
        'Issues + Projects track tasks; PRs can close issues with "Fixes #12"',
        'Visual Studio: Git menu, Git Changes window (Ctrl+0, Ctrl+G), Git Repository window for history',
      ],
    },
  ],
  examples: [
    {
      title: 'First repository: init, add, commit, log',
      scenario:
        'Create a SchoolApi Web API from the command line, add the official .NET .gitignore, and make the first commits. Learn to read git status and git log.',
      steps: [
        'Install Git for Windows (git-scm.com) and open Developer PowerShell (View > Terminal in Visual Studio)',
        'Run the configuration commands once with your own name and e-mail',
        'Run the project and Git commands one by one and read each output',
        'Open the folder in File Explorer with hidden items visible to see the .git folder',
      ],
      code: firstRepoCode,
      result: `PS> git init
Initialized empty Git repository in C:/Projects/SchoolApp/.git/

PS> git status
On branch main
No commits yet
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        SchoolApi/
        SchoolApp.sln

PS> git commit -m "Initial commit: SchoolApi Web API"
[main (root-commit) 3f1a2b9] Initial commit: SchoolApi Web API
 9 files changed, 214 insertions(+)

PS> git log --oneline
7c9d4e1 (HEAD -> main) Add health endpoint
3f1a2b9 Initial commit: SchoolApi Web API`,
      explanation:
        'git init creates the .git folder that stores the whole history. Untracked files are new files Git does not manage yet; git add . stages them (but not bin/ and obj/, thanks to .gitignore). Each commit prints a short id – yours will be different because ids are hashes of content, author and time. HEAD -> main shows the current branch and the commit it points to.',
    },
    {
      title: '.gitignore for a .NET + React solution',
      scenario:
        'Keep the repository clean and secrets safe: ignore build output, IDE settings, node_modules, logs and secret configuration. Fix the common mistake of having already committed bin/obj.',
      steps: [
        'In the solution folder run: dotnet new gitignore (creates the official template)',
        'Open .gitignore in Visual Studio (or VS Code) and add the React and secrets sections',
        'Run git status – bin/, obj/, node_modules/ and .vs/ no longer appear',
        'If they were committed earlier: git rm -r --cached bin obj, then commit',
      ],
      code: gitignoreCode,
      result: `PS> git check-ignore -v SchoolApi/bin/Debug/net8.0/SchoolApi.dll
.gitignore:2:bin/       SchoolApi/bin/Debug/net8.0/SchoolApi.dll

PS> git rm -r --cached SchoolApi/bin SchoolApi/obj
rm 'SchoolApi/bin/Debug/net8.0/SchoolApi.dll'
rm 'SchoolApi/obj/project.assets.json'
...
PS> git commit -m "Stop tracking build output"`,
      explanation:
        'check-ignore -v tells you which line of which .gitignore ignores a file – great for debugging patterns. git rm --cached removes files from Git\'s index only; they stay on your disk and are now ignored. Build output is never committed because it is generated by dotnet build and differs per machine; the source code plus .csproj files are enough to rebuild it.',
    },
    {
      title: 'Branching, merging and resolving a conflict',
      scenario:
        'Develop a feature on its own branch and merge it into main, then create a real conflict: two branches change the same grade rule. Resolve the conflict markers and complete the merge.',
      steps: [
        'Run the feature-branch commands; after git merge note the words "Fast-forward"',
        'Create the conflict by changing the same line on feature/grade-rules and on main',
        'Run git merge feature/grade-rules and open Calculator.cs – see the <<<<<<< ======= >>>>>>> markers',
        'In Visual Studio you can instead double-click the file in Git Changes > Unmerged Changes to use the Merge Editor',
        'Edit to the final version, git add the file, git commit',
      ],
      code: branchingCode,
      result: `PS> git merge feature/student-search
Updating 7c9d4e1..a41b0c2
Fast-forward
 SchoolApi/Controllers/StudentsController.cs | 12 ++++++++++++
 1 file changed, 12 insertions(+)

PS> git merge feature/grade-rules
Auto-merging School.Core/Calculator.cs
CONFLICT (content): Merge conflict in School.Core/Calculator.cs
Automatic merge failed; fix conflicts and then commit the result.

PS> git log --oneline --graph
*   e2d7f10 (HEAD -> main) Merge feature/grade-rules, agree on 90 for grade A
|\\
| * 5b3c9aa (feature/grade-rules) Raise A grade to 85
* | 91fe2d4 A grade only above 95
|/
* a41b0c2 Add student search endpoint`,
      explanation:
        'The first merge is a fast-forward: main had no new commits, so its pointer simply moved. The second time both branches changed the same line, so Git cannot choose and asks you. HEAD is your current branch (main) and the part after ======= is the incoming branch. After resolving, the merge commit e2d7f10 has two parents, which the --graph view draws as a diamond.',
    },
    {
      title: 'GitHub: remote, push, clone, pull and pull requests',
      scenario:
        'Publish SchoolApp to GitHub, let a teammate clone it, and follow the GitHub Flow: feature branch -> push -> pull request -> review -> squash merge -> pull. Also see how the same actions look in Visual Studio.',
      steps: [
        'Create an empty private repository named SchoolApp on github.com',
        'Run git remote add origin ... and git push -u origin main (sign in when the browser opens)',
        'Refresh the GitHub page – your code and commit history are online',
        'Create feature/attendance, commit, git push -u origin feature/attendance, then click "Compare & pull request"',
        'Ask a classmate to review; after approval click "Squash and merge" and "Delete branch"',
        'Locally: git switch main and git pull',
      ],
      code: githubCode,
      result: `PS> git push -u origin main
Enumerating objects: 24, done.
Writing objects: 100% (24/24), 5.12 KiB | 1.71 MiB/s, done.
To https://github.com/<your-user>/SchoolApp.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.

PS> git push -u origin feature/attendance
remote: Create a pull request for 'feature/attendance' on GitHub by visiting:
remote:      https://github.com/<your-user>/SchoolApp/pull/new/feature/attendance

PS> git pull
Updating e2d7f10..0c88b35
Fast-forward
 SchoolApi/Controllers/AttendanceController.cs | 48 ++++++++++++
 1 file changed, 48 insertions(+)`,
      explanation:
        'origin is a nickname for the GitHub URL. -u links your local branch to the remote branch so later git push/git pull need no arguments. Pull requests are where code review and automated checks (Day 118) happen before code reaches main. "Squash and merge" turns all the feature commits into one clean commit on main. git pull then fast-forwards your local main to match GitHub.',
    },
    {
      title: 'How Git names file versions (SHA-1 blob ids in C#)',
      scenario:
        'Git identifies every file version by a hash of its content. Reproduce git hash-object in C#: SHA-1 of "blob <size>", a zero byte, then the content. Identical content always gets the same id, and one changed letter gives a completely different id.',
      steps: [
        'File > New > Project > Console App, name it GitHashDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Compare with Git: in PowerShell run   "Hello Git" | Out-File -NoNewline -Encoding ascii h.txt ; git hash-object h.txt',
      ],
      code: hashCode,
      csharp: { files: { 'Program.cs': hashCode }, stdin: '' },
      result: `[Hello Git]  -> e51ca0d0b8c5b6e02473228bbf876ba000932e96  (short: e51ca0d)
[Hello Git]  -> e51ca0d0b8c5b6e02473228bbf876ba000932e96  (short: e51ca0d)
[Hello git]  -> c620bf05c2e149298f03ad767095fa3af71a206a  (short: c620bf0)
[]           -> e69de29bb2d1d6434b8b29ae775ad8c2e48c5391  (short: e69de29)
Same content, same id? True
One letter changed, same id? False`,
      explanation:
        'Because the id depends only on the content, Git stores identical files once and can instantly tell whether a file changed. e69de29… is the famous id of the empty file in every Git repository in the world. Commits are hashed the same way (tree id + parent ids + author + message), which is why changing an old commit changes every id after it. New Git versions can also use SHA-256, but SHA-1 is still the default.',
    },
    {
      title: 'Simulating branches, merge commits and fast-forward in C#',
      scenario:
        'Model commits as records with parent lists and branches as pointers in a Dictionary. Run the same story as a real project – feature branch, merge commit, hotfix with fast-forward – and print git log.',
      steps: [
        'File > New > Project > Console App, name it GitModelDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Add Commit("Update docs") on main before Merge("hotfix") and run again – it becomes a merge commit instead of a fast-forward',
      ],
      code: simCode,
      csharp: { files: { 'Program.cs': simCode }, stdin: '' },
      result: `[main c1] Initial commit
[main c2] Add Student model
Created branch feature/login at c2
Switched to branch 'feature/login'
[feature/login c3] Add login page
[feature/login c4] Add JWT service
Switched to branch 'main'
[main c5] Fix README typo
[main c6] Merge branch 'feature/login' into main
Created branch hotfix at c6
Switched to branch 'hotfix'
[hotfix c7] Fix null check
Switched to branch 'main'
Fast-forward main -> c7
--- git log --oneline (main) ---
c7 Fix null check
c6 Merge branch 'feature/login' into main  (parents: c5, c4)
c5 Fix README typo
c4 Add JWT service
c3 Add login page
c2 Add Student model
c1 Initial commit`,
      explanation:
        'Creating a branch only copies a pointer (feature/login -> c2). When feature/login is merged, main (c5) is not an ancestor of c4, so a merge commit c6 with two parents is created. For hotfix, main (c6) IS an ancestor of c7, so main just moves to c7 – a fast-forward. The log walks parent links from main\'s latest commit and therefore includes the feature commits c3 and c4.',
    },
  ],
  interview: [
    { q: 'What is the difference between Git and GitHub?', a: 'Git is a distributed version control tool that runs locally. GitHub is a hosting service for Git repositories that adds collaboration features: pull requests, issues, code review, Actions, security scanning.', level: 'Easy' },
    { q: 'Explain working directory, staging area and repository.', a: 'Working directory holds the files you edit; the staging area (index) holds changes selected for the next commit (git add); the repository stores committed snapshots (git commit).', level: 'Easy' },
    { q: 'What is the difference between git fetch and git pull?', a: 'fetch downloads new commits and updates remote-tracking branches (origin/main) without touching your work. pull = fetch + merge (or rebase) into the current branch.', level: 'Easy' },
    { q: 'What is a fast-forward merge?', a: 'When the current branch has no commits that the other branch lacks, Git simply moves the branch pointer forward to the other branch\'s commit; no merge commit is created.', level: 'Medium' },
    { q: 'How do you resolve a merge conflict?', a: 'Open the conflicting files, decide the final content between <<<<<<<, ======= and >>>>>>> markers, remove the markers, git add the files and git commit (or git merge --abort to cancel).', level: 'Easy' },
    { q: 'git revert vs git reset?', a: 'revert creates a new commit that undoes a previous one – safe on shared branches. reset moves the branch pointer back (--soft keeps changes staged, --mixed unstaged, --hard deletes them) – it rewrites history, so use it only on unpushed commits.', level: 'Medium' },
    { q: 'Merge vs rebase?', a: 'Merge keeps the true history and adds a merge commit. Rebase replays your commits on top of another branch, giving a linear history but creating new commit ids – never rebase commits others already use.', level: 'Hard' },
    { q: 'Why should bin/ and obj/ not be committed?', a: 'They are generated build output that can be recreated from source, differ per machine/configuration, are large, and cause constant conflicts.', level: 'Easy' },
    { q: 'You committed appsettings.json with a production password and pushed. What do you do?', a: 'Rotate/change the password immediately, remove the secret from the file (move it to secrets/environment variables), and optionally purge it from history with git filter-repo or BFG; removing it in a new commit alone is not enough because history still contains it.', level: 'Hard' },
    { q: 'What is a pull request?', a: 'A request on GitHub to merge one branch into another. It shows the diff, allows discussion and reviews, runs CI checks, and is merged only after approval.', level: 'Easy' },
    { q: 'What does git stash do?', a: 'Saves uncommitted changes on a stack and cleans the working directory so you can switch branches; git stash pop re-applies them.', level: 'Medium' },
    { q: 'What is HEAD?', a: 'A pointer to the current branch (or a specific commit in detached HEAD state). New commits are added where HEAD points.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a repo for your Student Management System, add .gitignore, make three meaningful commits (models, controller, React page) and show the history as a graph.',
      hint: 'dotnet new gitignore; git add; git commit -m; git log --oneline --graph.',
      solution: `git init
dotnet new gitignore
git add .
git commit -m "Add Student and Course models"
# edit StudentsController.cs
git commit -am "Add StudentsController CRUD"
# add React StudentList.jsx
git add .
git commit -m "Add React student list page"
git log --oneline --graph`,
    },
    {
      task: 'Practise conflicts: two branches change the same line of README.md differently. Merge them and resolve the conflict so the README contains both ideas.',
      hint: 'git switch -c a, edit, commit; git switch main, edit same line, commit; git merge a.',
      solution: `git switch -c docs/a
echo "School App - built with .NET 8" > README.md
git commit -am "README: mention .NET"
git switch main
echo "School App - React frontend" > README.md
git commit -am "README: mention React"
git merge docs/a           # CONFLICT
# edit README.md to: School App - .NET 8 API with React frontend
git add README.md
git commit -m "Merge docs/a: combine README text"`,
    },
    {
      task: 'Push your project to a new GitHub repository, open a pull request from a feature branch, and protect main so it requires a pull request.',
      hint: 'git remote add origin, git push -u; GitHub Settings > Branches > Add rule.',
      solution: `git remote add origin https://github.com/<you>/StudentManagement.git
git push -u origin main
git switch -c feature/search
# ... commit work ...
git push -u origin feature/search
# GitHub: Compare & pull request > Create
# Settings > Branches > Add branch protection rule > Branch name pattern: main
#   [x] Require a pull request before merging  [x] Require approvals: 1`,
    },
    {
      task: 'Extend the C# Git simulator with a Revert(string commitId) command that creates a new commit with message "Revert \'<message>\'".',
      hint: 'Look up commits[commitId].Message and call Commit($"Revert \'{msg}\'").',
      solution: `void Revert(string commitId)
{
    string msg = commits[commitId].Message;
    Commit($"Revert '{msg}'");
}
// Revert("c5");  ->  [main c8] Revert 'Fix README typo'`,
    },
    {
      task: 'Undo practice: (a) discard changes in a file, (b) unstage a file, (c) fix the last commit message, (d) undo a pushed commit safely.',
      hint: 'restore, restore --staged, commit --amend, revert.',
      solution: `git restore Program.cs                       # (a)
git restore --staged Program.cs              # (b)
git commit --amend -m "Add Student search"   # (c) only if not pushed yet
git revert 91fe2d4                           # (d) creates a new undo commit; then git push`,
    },
  ],
  quiz: [
    {
      question: 'Which command moves changes from the working directory into the staging area?',
      options: ['git commit', 'git push', 'git add', 'git fetch'],
      answer: 2,
      explanation: 'git add stages changes; git commit then saves the staged snapshot.',
    },
    {
      question: 'What does git pull do?',
      options: ['Uploads local commits', 'Fetches remote commits and merges them into the current branch', 'Deletes the remote branch', 'Creates a pull request'],
      answer: 1,
      explanation: 'pull = fetch + merge (or rebase if configured).',
    },
    {
      question: 'Which file stops Git from tracking bin/ and obj/ folders?',
      options: ['.gitignore', 'appsettings.json', '.gitconfig', 'README.md'],
      answer: 0,
      explanation: '.gitignore lists patterns of files and folders that Git should ignore.',
    },
    {
      question: 'Which command safely undoes a commit that was already pushed and pulled by teammates?',
      options: ['git reset --hard HEAD~1', 'git commit --amend', 'git rebase -i', 'git revert <commit-id>'],
      answer: 3,
      explanation: 'revert adds a new commit that reverses the change without rewriting shared history.',
    },
    {
      question: 'What do the markers <<<<<<< HEAD and >>>>>>> feature-x indicate?',
      options: ['A merge conflict between your branch and feature-x', 'A corrupted repository', 'Lines added by .gitignore', 'A successful fast-forward'],
      answer: 0,
      explanation: 'Git inserts conflict markers when both branches changed the same lines.',
    },
  ],
};
