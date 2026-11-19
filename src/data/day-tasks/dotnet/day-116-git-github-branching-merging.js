export default {
  lesson: 'day-116-git-github-branching-merging',
  minutes: 25,
  intro: 'Use Git daily: commit, branch, merge, push and pull with GitHub, resolve simple conflicts and keep bin/obj/node_modules out with .gitignore.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'In a new folder these commands run. What does the last command print? (`git status --short` shows `??` for untracked and `A ` for staged new files.)',
      example: { title: 'the three areas', code: 'working folder --git add--> staging area --git commit--> repository' },
      code: `git init
echo "Console.WriteLine(1);" > Program.cs
echo "# Readme" > README.md
git add README.md
git status --short`,
      expected: `A  README.md
?? Program.cs`,
      explain: 'Only README.md was added to the staging area (`A `); Program.cs is still untracked (`??`). Nothing is in a commit yet - `git commit -m "..."` would save only README.md.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the command that creates a new branch `feature/student-api` **and** switches to it:\n`git ______ feature/student-api`',
      example: { title: 'the newer command', code: 'git switch -c feature/login' },
      accept: ['checkout -b', 'switch -c'],
      acceptRegex: ['^(checkout\\s+-b|switch\\s+-c)$'],
      explain: '`git checkout -b <name>` (or `git switch -c <name>`) creates and moves to the branch in one step. Work on feature branches keeps `main` always deployable.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which entries belong in the `.gitignore` of a .NET + React solution? (choose all that apply)',
      options: ['bin/', 'obj/', 'node_modules/', 'Program.cs', '.vs/', 'appsettings.Development.json with real secrets (or use user-secrets instead)'],
      answers: [0, 1, 2, 4, 5],
      explain: 'Build output (bin/obj, dist), installed packages (node_modules) and IDE files (.vs) are regenerated and must not be committed; secrets must never be in Git. Source files like Program.cs obviously must be committed. `dotnet new gitignore` creates a good starting file.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You run `git pull` and get **CONFLICT (content): Merge conflict in StudentsController.cs**. What is the correct next step?',
      options: [
        'Delete the repository and clone again',
        'Open the file, choose/combine the code between <<<<<<<, ======= and >>>>>>>, remove the markers, then git add and git commit',
        'Run git push --force',
        'Ignore it; Git fixes it later',
      ],
      answer: 1,
      explain: 'A conflict means both sides changed the same lines. You decide the final code, remove the markers, stage the file (`git add`) and complete the merge with `git commit`. Force-pushing would overwrite your teammates\' work.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'First push of a new local branch to GitHub, setting the upstream so later you can just type `git push`:\n`git push ______ origin feature/student-api`',
      example: { title: 'later pushes', code: 'git push' },
      accept: ['-u', '--set-upstream'],
      explain: '`-u` (`--set-upstream`) links the local branch to `origin/feature/student-api`. Then open a **Pull Request** on GitHub so the code is reviewed before merging into main.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Starting on `main` with one commit **C1**, these commands run. Which commits does `git log --oneline` on `main` show at the end (newest first)? Type one commit name per line.',
      example: { title: 'a fast-forward merge', code: 'main: C1      feature: C1-C2\ngit checkout main && git merge feature  →  main: C1-C2' },
      code: `git checkout -b feature/login
# commit C2 "Add login API"
# commit C3 "Add JWT"
git checkout main
# commit C4 "Fix README"   (only on main)
git checkout feature/login
# commit C5 "Add tests"
git checkout main
git merge feature/login     # creates merge commit M`,
      expected: `M
C5
C4
C3
C2
C1`,
      explain: 'Because main moved on (C4) after the branch was created, Git cannot fast-forward and creates a **merge commit M** joining both histories. `git log` lists M first, then commits by date: C5, C4, C3, C2, C1 (main contains all of them now).',
    },
  ],
};
