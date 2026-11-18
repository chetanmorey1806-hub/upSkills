export default {
  id: 'day-03-git-github-for-java-developers',
  title: 'Git and GitHub for Java Developers: Branching, Merge, Rebase, Pull Requests and Conflicts',
  module: 'Module 1: Build Tools, Git & Libraries',
  day: 3,
  level: 'Beginner',
  duration: '3 hours',
  summary: 'Use Git like a professional Java developer: init, add, commit, branch, merge, rebase, a proper .gitignore for Maven/Gradle/IDE files, pushing to GitHub, pull requests, resolving merge conflicts, using Git inside IntelliJ/Eclipse and following a branching strategy.',
  objectives: [
    'Explain working directory, staging area, local repo and remote repo',
    'Use init, status, add, commit, log, branch, switch, merge, rebase, push, pull',
    'Write a .gitignore for Java (Maven/Gradle/IntelliJ/Eclipse)',
    'Create a pull request on GitHub and resolve merge conflicts',
    'Follow a branching strategy (feature branches, Git Flow, trunk-based)',
  ],
  theory: [
    {
      heading: '1. Git Basics: Three Areas and Commits',
      content: 'Git is a distributed version control system: it saves snapshots (commits) of your project so you can go back, compare and work in parallel with a team. GitHub is a website that hosts Git repositories online and adds pull requests, issues and CI. Git works with three local areas. Analogy: working directory = your desk with papers; staging area = the envelope where you put the pages you want to send; commit = sealing the envelope with a label (message) and storing it in the cupboard (local repository); push = posting it to the office (GitHub).',
      syntax: `Working Directory --git add--> Staging Area --git commit--> Local Repo --git push--> Remote (GitHub)
                 <---------------------- git pull / git fetch + merge ---------------------`,
      points: [
        'git config --global user.name "Your Name" and user.email – one-time setup',
        'git init – create a repo; git clone URL – copy an existing repo',
        'git status – what changed; git diff – exact line changes',
        'git add file / git add . – stage; git commit -m "message" – save snapshot',
        'git log --oneline --graph – history; each commit has a unique SHA id',
        'HEAD = pointer to the commit/branch you are currently on',
      ],
    },
    {
      heading: '2. .gitignore for Java Projects',
      content: 'Never commit generated or personal files: compiled classes, target/ or build/ folders, IDE settings, logs, and secrets. They make the repo heavy and cause useless conflicts. DO commit source code, pom.xml / build.gradle, the Maven/Gradle wrapper and resources (without passwords).',
      syntax: `# Build output
target/
build/
out/
*.class
*.jar
*.war
!gradle/wrapper/gradle-wrapper.jar
!.mvn/wrapper/maven-wrapper.jar

# Gradle
.gradle/

# IntelliJ
.idea/
*.iml

# Eclipse / STS
.classpath
.project
.settings/
bin/

# VS Code
.vscode/

# OS / logs / secrets
.DS_Store
Thumbs.db
*.log
logs/
.env
application-local.properties`,
      tip: 'If you already committed target/ by mistake: add it to .gitignore and run git rm -r --cached target, then commit.',
    },
    {
      heading: '3. Branches, Merge and Rebase',
      content: 'A branch is a movable pointer to a commit: a separate line of work. You make a branch for each feature (feature/login), work there, and later merge it into main. Merge creates a merge commit joining two histories (true history, may look messy). Rebase replays your commits on top of the latest main (clean straight history, but rewrites commit ids). Golden rule: never rebase commits that are already pushed and shared with others.',
      syntax: `git branch                      # list
git switch -c feature/login      # create + switch (old: git checkout -b)
git switch main
git merge feature/login          # merge into current branch
git rebase main                  # (on feature) replay my commits on top of main
git branch -d feature/login      # delete merged branch`,
      points: [
        'Fast-forward merge: main had no new commits, so Git just moves the pointer (no merge commit)',
        'Three-way merge: both branches changed, Git creates a merge commit',
        'git merge --no-ff keeps a merge commit even when fast-forward is possible',
        'git rebase -i HEAD~3 lets you squash/reword your last 3 commits before a PR (interactive)',
      ],
    },
    {
      heading: '4. Working with GitHub: Remote, Push, Pull, Pull Requests',
      content: 'origin is the default name for the remote repository URL. git push sends your commits; git fetch downloads new commits without changing your files; git pull = fetch + merge (or rebase with --rebase). A Pull Request (PR) is a request on GitHub to merge your branch into main; teammates review code, CI runs tests, then someone clicks Merge. Forks are your own copy of someone else\'s repo, used for open-source contributions.',
      points: [
        'git remote add origin https://github.com/user/repo.git',
        'git push -u origin feature/login – first push sets upstream; later just git push',
        'GitHub needs a Personal Access Token or SSH key instead of the password',
        'PR checklist: small focused change, clear title, description, linked issue, tests pass, no target/ files',
        'Merge options on GitHub: Create merge commit, Squash and merge, Rebase and merge',
      ],
    },
    {
      heading: '5. Merge Conflicts',
      content: 'A conflict happens when two branches change the SAME lines of the same file. Git cannot decide, so it stops and marks the file. You open the file, choose the correct code, remove the markers, add and commit. IntelliJ and Eclipse show a 3-pane merge tool (yours, result, theirs) which makes this easy.',
      syntax: `<<<<<<< HEAD
    private double interestRate = 7.5;
=======
    private double interestRate = 8.0;
>>>>>>> feature/new-rate`,
      points: [
        'HEAD section = your current branch; the other section = incoming branch',
        'After editing: git add File.java then git commit (or git rebase --continue during rebase)',
        'Abort if confused: git merge --abort / git rebase --abort',
        'Prevent conflicts: pull often, small PRs, do not reformat whole files',
      ],
    },
    {
      heading: '6. Undo, Stash and Useful Commands',
      content: 'Mistakes are normal. Know how to undo safely.',
      points: [
        'git restore File.java – discard uncommitted changes in a file',
        'git restore --staged File.java – unstage (keep changes)',
        'git commit --amend – fix the last commit message / add a forgotten file (before pushing)',
        'git reset --soft HEAD~1 – undo last commit, keep changes staged; --hard deletes changes (dangerous)',
        'git revert <sha> – make a NEW commit that undoes an old one (safe for shared branches)',
        'git stash / git stash pop – save unfinished work temporarily to switch branches',
        'git tag v1.0.0 – mark a release; git cherry-pick <sha> – copy one commit to current branch',
      ],
    },
    {
      heading: '7. Git in IntelliJ / Eclipse and Branching Strategies',
      content: 'IntelliJ: VCS > Enable Version Control Integration (or Git > Clone); Commit tool window (Ctrl+K), Push (Ctrl+Shift+K), Update Project (Ctrl+T), branch widget at the bottom-right / top-left, Git log tab, conflict resolver with "Accept Left / Accept Right / Merge". Eclipse: Window > Show View > Git Repositories and Git Staging; right-click project > Team > Commit / Pull / Push / Switch To / Merge. Teams follow a branching strategy so everyone works the same way.',
      points: [
        'Feature branch workflow (GitHub Flow): main is always deployable; create feature/xyz from main, open PR, review, merge, deploy',
        'Git Flow: main (production), develop (integration), feature/*, release/*, hotfix/* – good for scheduled releases',
        'Trunk-based development: very short-lived branches merged to main daily, uses feature flags – good for CI/CD',
        'Branch names: feature/JIRA-101-login, bugfix/null-pointer-cart, hotfix/1.0.1',
        'Commit messages: imperative and clear – "Add JWT login endpoint", not "changes" or "fixed"',
      ],
    },
  ],
  examples: [
    {
      title: 'Create a Maven Project Repo and Push to GitHub',
      scenario: 'You created student-app in IntelliJ. Put it under Git and push it to a new GitHub repository.',
      steps: [
        'On github.com: New repository > name student-app > do NOT add README (keep empty) > Create',
        'Create .gitignore in the project root (see theory section 2)',
        'Open a terminal in the project folder (IntelliJ: View > Tool Windows > Terminal) and run the commands',
        'IntelliJ alternative: VCS > Create Git Repository, then Git > Commit, then Git > Push > Define remote',
        'Eclipse alternative: right-click project > Team > Share Project > Git > Create, then Team > Commit and Push',
      ],
      code: `git config --global user.name "Chetan"
git config --global user.email "chetan@example.com"

cd student-app
git init
git status
git add .
git commit -m "Initial commit: Maven student app"
git branch -M main
git remote add origin https://github.com/chetan/student-app.git
git push -u origin main`,
      result: `Initialized empty Git repository in /home/chetan/student-app/.git/
On branch master
No commits yet
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        pom.xml
        src/

[master (root-commit) 3f2a91c] Initial commit: Maven student app
 3 files changed, 58 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 pom.xml
 create mode 100644 src/main/java/com/stn/App.java
Enumerating objects: 9, done.
Writing objects: 100% (9/9), 1.21 KiB | 1.21 MiB/s, done.
To https://github.com/chetan/student-app.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.`,
      explanation: 'target/ and .idea/ do not appear in git status because .gitignore excludes them. git branch -M main renames master to main. -u remembers origin/main as upstream so later you just type git push / git pull. When asked for a password, use a GitHub Personal Access Token.',
    },
    {
      title: 'Feature Branch, Merge and Rebase',
      scenario: 'Add a "search student" feature on its own branch while main also receives a bug fix, then integrate.',
      steps: [
        'Create the branch: git switch -c feature/search',
        'Edit StudentService.java, commit',
        'Meanwhile a teammate pushed a fix to main; update main with git pull',
        'Option A: merge main into your branch, or Option B: rebase your branch on main',
        'IntelliJ: bottom-right branch widget > main > "Rebase Current onto Selected" or "Merge into Current"',
      ],
      code: `git switch -c feature/search
# ... edit StudentService.java ...
git add src/main/java/com/stn/StudentService.java
git commit -m "Add searchByName to StudentService"

git switch main
git pull                       # get teammate's fix
git switch feature/search

# Option B: rebase for a straight history
git rebase main

git log --oneline --graph --all
git push -u origin feature/search`,
      result: `Successfully rebased and updated refs/heads/feature/search.

* a71c3d2 (HEAD -> feature/search) Add searchByName to StudentService
* 9be04f1 (origin/main, main) Fix NPE when student email is null
* 3f2a91c Initial commit: Maven student app`,
      explanation: 'After rebase, our commit sits on top of the teammate\'s fix (new id a71c3d2), so the graph is a straight line. With merge instead, Git would create an extra merge commit and the graph would show two lines joining. Because feature/search was not pushed before, rebasing it is safe.',
    },
    {
      title: 'Resolving a Merge Conflict',
      scenario: 'main sets interestRate = 7.5 while your branch sets 8.0 on the same line of Account.java.',
      steps: [
        'Run git merge feature/new-rate on main and see the CONFLICT message',
        'Open Account.java: the conflict markers are shown',
        'IntelliJ: Git > Resolve Conflicts > double-click file > use the middle Result pane > Apply. Eclipse: right-click file > Team > Merge Tool',
        'Keep the correct value, remove markers, save',
        'git add Account.java && git commit',
      ],
      code: `git switch main
git merge feature/new-rate

# Account.java now contains:
public class Account {
<<<<<<< HEAD
    private double interestRate = 7.5;
=======
    private double interestRate = 8.0;
>>>>>>> feature/new-rate
}

# After fixing (team agreed on 8.0):
public class Account {
    private double interestRate = 8.0;
}

git add src/main/java/com/stn/Account.java
git commit -m "Merge feature/new-rate: use 8.0 interest rate"`,
      result: `Auto-merging src/main/java/com/stn/Account.java
CONFLICT (content): Merge conflict in src/main/java/com/stn/Account.java
Automatic merge failed; fix conflicts and then commit the result.

[main 5d8e0aa] Merge feature/new-rate: use 8.0 interest rate`,
      explanation: 'Git stops only for the conflicting file; other files are merged automatically. Never commit a file that still contains <<<<<<< markers: the Java code will not compile. Run mvn test before committing the merge.',
    },
    {
      title: 'Pull Request Workflow on GitHub',
      scenario: 'Submit feature/search for review and merge it into main through a PR.',
      steps: [
        'Push your branch: git push -u origin feature/search',
        'GitHub shows "Compare & pull request" > base: main, compare: feature/search',
        'Write a title and description (what, why, how to test) and add reviewers',
        'Reviewer comments on lines; you fix, commit and push again on the same branch: the PR updates automatically',
        'When approved and checks pass > "Squash and merge" > Delete branch',
        'Locally: git switch main && git pull && git branch -d feature/search',
      ],
      code: `## PR title
Add search student by name (#42)

## Description
- Added searchByName(String) in StudentService (case-insensitive)
- Added GET /students/search?name= endpoint
- Unit tests in StudentServiceTest

## How to test
1. mvn clean test
2. Run the app and call GET http://localhost:8080/students/search?name=riya

# Using GitHub CLI instead of the website:
gh pr create --base main --head feature/search --title "Add search student by name" --body-file pr.md
gh pr view --web`,
      result: `https://github.com/chetan/student-app/pull/42

Open  Add search student by name #42
chetan wants to merge 1 commit into main from feature/search
✓ All checks have passed (build / test)
Review: 1 approving review
[Squash and merge] -> Pull request successfully merged and closed`,
      explanation: 'PRs give code review, discussion and automated checks before code reaches main. Squash and merge turns all PR commits into one clean commit on main. In companies main is usually protected: direct pushes are blocked and at least one approval is required.',
    },
    {
      title: 'Undo Mistakes: restore, amend, reset, revert, stash',
      scenario: 'Common day-to-day situations a fresher faces.',
      steps: [
        'Read each scenario comment and run the matching command in a practice repo',
        'Use git log --oneline and git status after each command to see the effect',
      ],
      code: `# 1. I broke a file and want the last committed version back
git restore src/main/java/com/stn/App.java

# 2. I staged application.properties (with password) by mistake
git restore --staged src/main/resources/application.properties

# 3. Wrong commit message / forgot a file (NOT pushed yet)
git add StudentTest.java
git commit --amend -m "Add Student entity and tests"

# 4. Undo last local commit but keep my changes
git reset --soft HEAD~1

# 5. A bad commit is already pushed to main -> safe undo
git revert 9be04f1

# 6. Urgent bug on main while my feature is half done
git stash
git switch main
# ...fix, commit, push...
git switch feature/search
git stash pop

# 7. Committed target/ folder earlier
echo "target/" >> .gitignore
git rm -r --cached target
git commit -m "Stop tracking target folder"`,
      result: `$ git revert 9be04f1
[main c4410be] Revert "Fix NPE when student email is null"
 1 file changed, 1 insertion(+), 3 deletions(-)

$ git stash
Saved working directory and index state WIP on feature/search: a71c3d2 Add searchByName to StudentService
$ git stash pop
On branch feature/search
Changes not staged for commit:
        modified:   src/main/java/com/stn/StudentService.java
Dropped refs/stash@{0} (e2b1f0c...)`,
      explanation: 'revert is safe for shared history because it adds a new commit; reset and amend rewrite history, so use them only on commits you have not pushed. stash is a temporary shelf for unfinished work.',
    },
  ],
  interview: [
    { q: 'What is Git and how is it different from GitHub?', a: 'Git is a distributed version control system that runs locally and tracks changes as commits. GitHub is a cloud hosting service for Git repositories that adds pull requests, code review, issues, Actions (CI/CD) and collaboration features. Alternatives: GitLab, Bitbucket.', level: 'Easy' },
    { q: 'Explain working directory, staging area and repository.', a: 'Working directory: actual files you edit. Staging area (index): changes selected for the next commit via git add. Repository (.git): committed snapshots history. Remote: shared copy on GitHub.', level: 'Easy' },
    { q: 'Difference between git merge and git rebase?', a: 'Merge combines branches with a merge commit and preserves the true history. Rebase moves your commits on top of another branch, creating new commits and a linear history. Do not rebase commits that others already pulled.', level: 'Medium' },
    { q: 'Difference between git fetch and git pull?', a: 'fetch downloads new commits/branches from the remote but does not change your working branch. pull = fetch + merge (or rebase with --rebase) into the current branch.', level: 'Easy' },
    { q: 'What is a merge conflict and how do you resolve it?', a: 'It occurs when the same lines are changed differently in two branches. Git marks the file with <<<<<<<, =======, >>>>>>>; you edit to the correct content, remove markers, git add the file and commit (or rebase --continue). Then build and run tests.', level: 'Medium' },
    { q: 'git reset vs git revert?', a: 'reset moves the branch pointer back (--soft keeps changes staged, --mixed keeps them unstaged, --hard discards them) and rewrites history. revert creates a new commit that undoes a previous one; it is safe on shared branches.', level: 'Medium' },
    { q: 'What should be in .gitignore for a Spring Boot Maven project?', a: 'target/, *.class, *.jar (except wrapper jar), .idea/, *.iml, .classpath, .project, .settings/, logs/*.log, .env and local property files with secrets. Keep pom.xml, mvnw, .mvn/wrapper and src.', level: 'Easy' },
    { q: 'What is a pull request?', a: 'A GitHub feature to propose merging one branch into another. It shows the diff, allows review comments and approvals, runs CI checks, and then merges via merge commit, squash or rebase.', level: 'Easy' },
    { q: 'What is git stash?', a: 'It saves uncommitted changes on a stack and cleans the working directory so you can switch branches. git stash pop re-applies and removes the latest stash; git stash list shows them.', level: 'Easy' },
    { q: 'Explain a branching strategy you have used.', a: 'Example GitHub Flow: main is always deployable; each task gets a feature/<ticket> branch from main; push and open a PR; at least one review + green CI; squash merge; delete branch; deploy. Git Flow adds develop, release and hotfix branches for scheduled releases.', level: 'Medium' },
    { q: 'What is HEAD and detached HEAD?', a: 'HEAD points to the current branch (which points to a commit). Detached HEAD means HEAD points directly to a commit (e.g. after git checkout <sha>); new commits there are not on any branch unless you create one with git switch -c.', level: 'Hard' },
    { q: 'What does git cherry-pick do?', a: 'Applies the changes of a specific commit from another branch onto the current branch as a new commit, e.g. bringing a hotfix from main into a release branch.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write the full .gitignore for a Spring Boot project built with Maven that developers open in IntelliJ, Eclipse and VS Code.',
      hint: 'Build output, IDE files, logs, secrets; keep the Maven wrapper jar.',
      solution: `# Maven
target/
!.mvn/wrapper/maven-wrapper.jar

# Compiled / packages
*.class
*.jar
*.war
*.ear

# IntelliJ
.idea/
*.iml
*.ipr
*.iws
out/

# Eclipse / STS
.apt_generated
.classpath
.factorypath
.project
.settings/
.springBeans
.sts4-cache/
bin/

# VS Code
.vscode/

# Logs and OS
logs/
*.log
.DS_Store
Thumbs.db

# Secrets
.env
src/main/resources/application-local.properties`,
    },
    {
      task: 'Write the commands to: create branch feature/payment from main, commit two files, push it, and after the PR is merged update main and delete the branch locally and remotely.',
      hint: 'switch -c, add, commit, push -u, pull, branch -d, push --delete.',
      solution: `git switch main
git pull
git switch -c feature/payment
git add src/main/java/com/stn/PaymentService.java src/test/java/com/stn/PaymentServiceTest.java
git commit -m "Add PaymentService with UPI validation"
git push -u origin feature/payment
# ... open PR on GitHub, get approval, merge ...
git switch main
git pull
git branch -d feature/payment
git push origin --delete feature/payment`,
    },
    {
      task: 'Simulate a conflict yourself: in a new repo, create Greeting.java on main, change the same line differently in main and in branch feature/hi, merge, and resolve. Write all commands and the final file.',
      hint: 'Commit on both branches before merging.',
      solution: `mkdir conflict-demo && cd conflict-demo
git init
echo 'public class Greeting { String msg = "Hello"; }' > Greeting.java
git add . && git commit -m "Add Greeting"
git switch -c feature/hi
echo 'public class Greeting { String msg = "Hi"; }' > Greeting.java
git commit -am "Use Hi"
git switch main          # (or master)
echo 'public class Greeting { String msg = "Namaste"; }' > Greeting.java
git commit -am "Use Namaste"
git merge feature/hi     # CONFLICT (content): Merge conflict in Greeting.java

# edit Greeting.java to the final content:
public class Greeting { String msg = "Namaste"; }

git add Greeting.java
git commit -m "Merge feature/hi, keep Namaste"
git log --oneline --graph`,
    },
    {
      task: 'You accidentally committed your database password in application.properties (not pushed yet). Fix it so the password never reaches GitHub, and stop tracking the file.',
      hint: 'Edit file, add to .gitignore, git rm --cached, commit --amend.',
      solution: `# 1. Move the secret to an environment variable in application.properties:
#    spring.datasource.password=\${DB_PASSWORD}
# 2. Keep real values in application-local.properties and ignore it
echo "src/main/resources/application-local.properties" >> .gitignore
git rm --cached src/main/resources/application-local.properties
git add .gitignore src/main/resources/application.properties
git commit --amend -m "Add datasource config using environment variables"
git log -p -1            # verify no password in the commit
git push
# If it WAS already pushed: change the password immediately (rotate it);
# rewriting history is not enough because others may have cloned it.`,
    },
  ],
  quiz: [
    { question: 'Which command moves changes from the working directory to the staging area?', options: ['git commit', 'git push', 'git add', 'git stash'], answer: 2, explanation: 'git add stages changes; commit saves the staged snapshot.' },
    { question: 'Which is the SAFE way to undo a commit already pushed to a shared branch?', options: ['git revert <sha>', 'git reset --hard HEAD~1', 'git commit --amend', 'git rebase -i'], answer: 0, explanation: 'revert adds a new commit instead of rewriting shared history.' },
    { question: 'Which folder should NOT be committed in a Maven project?', options: ['src/main/java', 'target/', '.mvn/wrapper', 'src/test/java'], answer: 1, explanation: 'target/ is generated build output.' },
    { question: 'git pull is equivalent to:', options: ['git push + git fetch', 'git clone', 'git commit + git push', 'git fetch + git merge'], answer: 3, explanation: 'pull fetches remote commits and merges them (or rebases with --rebase).' },
    { question: 'In conflict markers, the part between <<<<<<< HEAD and ======= is:', options: ['The incoming branch changes', 'The common ancestor', 'Your current branch changes', 'A Git comment'], answer: 2, explanation: 'HEAD is the branch you are on; the part after ======= is from the branch being merged.' },
  ],
};
