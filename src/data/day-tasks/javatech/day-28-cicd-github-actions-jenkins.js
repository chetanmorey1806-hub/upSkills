export default {
  lesson: 'day-28-cicd-github-actions-jenkins',
  minutes: 24,
  intro: 'Understand CI/CD stages and write the key parts of a GitHub Actions workflow and a Jenkinsfile for a Spring Boot project.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between **Continuous Delivery** and **Continuous Deployment**?',
      options: [
        'They are the same',
        'Delivery: every change is built, tested and ready to release, but going to production needs a manual approval; Deployment: every passing change goes to production automatically',
        'Delivery means emailing the JAR to the client',
        'Deployment skips tests',
      ],
      answer: 1,
      explain: 'CI = merge often + automatic build and tests. Continuous **Delivery** keeps the software always releasable (a human clicks "deploy"). Continuous **Deployment** removes that manual step.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the first step of the job so the workflow gets the repository code:\n```\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - ???\n      - uses: actions/setup-java@v4\n        with: { distribution: temurin, java-version: 21, cache: maven }\n      - run: mvn -B verify\n```',
      example: { title: 'a run step', code: '- name: Build\n  run: ./mvnw -B package' },
      accept: ['uses: actions/checkout@v4', 'uses: actions/checkout@v3', 'uses: actions/checkout@v5', '- uses: actions/checkout@v4'],
      explain: 'A runner starts empty, so the first step is almost always `uses: actions/checkout@v4`. Without it `mvn` fails with "no POM in this directory".',
    },
    {
      type: 'output',
      mins: 3,
      q: 'This workflow runs on a push to the branch **feature/login**. Which jobs run? Type each job name on its own line in execution order.',
      example: { title: 'needs and if', text: 'needs: makes a job wait for others (and skip if they fail). if: can skip a job based on the branch or event.' },
      code: `on:
  push:
    branches: ["**"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  test:
    needs: build
    steps: [...]
  docker:
    needs: test
    steps: [...]
  deploy:
    needs: docker
    if: github.ref == 'refs/heads/main'
    steps: [...]`,
      expected: 'build\ntest\ndocker',
      explain: '`needs` chains build → test → docker. `deploy` has an `if` that is true only for `refs/heads/main`, so on a feature branch it is **skipped**. That is a common pattern: test every branch, deploy only main.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The Docker Hub token is stored as a repository secret named `DOCKERHUB_TOKEN`. Complete the expression that reads it in the workflow:\n```\nwith:\n  username: upskillr\n  password: ???\n```',
      example: { title: 'reading a variable', code: '${{ vars.IMAGE_NAME }}' },
      accept: ['${{ secrets.DOCKERHUB_TOKEN }}', '${{secrets.DOCKERHUB_TOKEN}}'],
      caseSensitive: true,
      explain: '`${{ secrets.NAME }}` injects the secret at runtime and masks it in logs. Never commit passwords or tokens in the YAML or the code.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about a **declarative Jenkinsfile** are TRUE? (choose all that apply)',
      options: [
        'It starts with pipeline { agent any ... }',
        'stages { stage("Build") { steps { sh "mvn -B package" } } } defines a stage',
        'post { always { junit "target/surefire-reports/*.xml" } } publishes test results even when tests fail',
        'withCredentials(...) gives a step access to stored credentials',
        'A Jenkinsfile must be stored only on the Jenkins server, never in Git',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Pipeline as code: the Jenkinsfile lives **in the repository**, versioned with the app. `post` blocks run after stages (always/success/failure), and credentials are injected safely with `withCredentials`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In the pipeline, a SonarQube **quality gate** fails because new code has 45% test coverage (required 80%) and a critical bug. What should happen?',
      options: [
        'Deploy anyway, quality gates are only informational',
        'The pipeline stops (e.g. waitForQualityGate abortPipeline: true), and the developer fixes the issues before merging',
        'Delete the SonarQube project',
        'Lower the threshold to 0%',
      ],
      answer: 1,
      explain: 'A quality gate is a **merge/deploy blocker** for new code: coverage, bugs, vulnerabilities, duplications. Failing fast keeps bad code out of main.',
    },
  ],
};
