export default {
  lesson: 'day-03-git-github-for-java-developers',
  minutes: 22,
  intro: 'Practise the Git workflow of a Java team: .gitignore, branches, merge vs rebase, conflicts and undoing changes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You edited `StudentService.java`. In which order does a change move through Git\'s three areas?',
      options: [
        'Repository → staging area → working directory',
        'Working directory → (git add) staging area → (git commit) local repository',
        'Staging area → working directory → GitHub',
        'Working directory → GitHub → staging area',
      ],
      answer: 1,
      explain: 'You edit in the **working directory**, `git add` puts the change in the **staging area**, `git commit` saves a snapshot in the **local repository**, and `git push` sends commits to GitHub.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which entries belong in the `.gitignore` of a Maven/Gradle Spring Boot project? (choose all that apply)',
      options: ['target/', 'build/', '.idea/', '*.class', 'src/', 'pom.xml', '*.log'],
      answers: [0, 1, 2, 3, 6],
      explain: 'Ignore **generated** files (target/, build/, *.class), IDE settings (.idea/, *.iml, .classpath) and logs. Never ignore `src/` or the build file (`pom.xml` / `build.gradle`) - teammates need them to build the project.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write ONE command that creates a new branch `feature/login` and switches to it.',
      example: { title: 'just switching', code: 'git switch main' },
      accept: ['git switch -c feature/login', 'git checkout -b feature/login', 'git switch --create feature/login'],
      explain: '`git switch -c feature/login` (new style) or `git checkout -b feature/login` (old style). Work on a feature branch and merge through a pull request instead of committing directly to `main`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'History: on `main` there are commits **A**, **B**. You branch `feature` from B and commit **C**, then **E**. Meanwhile a teammate adds **D** on main. Now on `feature` you run `git rebase main`. What does `git log --oneline` show on feature (newest first)? Type one commit letter per line.',
      example: { title: 'what rebase does', text: 'Rebase takes your branch\'s commits and replays them one by one on top of the new base, creating new commits (C\', E\').' },
      code: `main:     A - B - D
feature:       \\
                C - E

git switch feature
git rebase main`,
      expected: 'E\nC\nD\nB\nA',
      explain: 'Rebase re-applies C and E **after** D, giving a straight line A-B-D-C\'-E\'. Newest first: E, C, D, B, A. A merge instead would keep both lines and add a merge commit. Golden rule: do not rebase commits others already pulled.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'You committed too early. Write the command that **undoes the last commit but keeps your changes staged**.',
      example: { title: 'a safe undo for shared commits', code: 'git revert <commit-id>   # creates a new commit that reverses it' },
      accept: ['git reset --soft HEAD~1', 'git reset --soft HEAD^', 'git reset --soft HEAD~'],
      explain: '`git reset --soft HEAD~1` moves the branch back one commit and keeps the changes staged. `--hard` would delete them - be careful. For commits already pushed, prefer `git revert`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'After `git merge feature`, a file shows the block below. What must you do?\n```\n<<<<<<< HEAD\nprivate int maxStudents = 60;\n=======\nprivate int maxStudents = 80;\n>>>>>>> feature\n```',
      options: [
        'Nothing, Java ignores these markers',
        'Edit the file to the correct final code, remove all the markers, then git add the file and commit',
        'Run git push --force',
        'Delete the file',
      ],
      answer: 1,
      explain: 'The part above `=======` is **HEAD** (your current branch), below it is the incoming branch. Decide the correct code (maybe 60, 80 or something else), delete `<<<<<<<`, `=======`, `>>>>>>>`, then `git add` + `git commit`. Leaving markers breaks compilation.',
    },
  ],
};
