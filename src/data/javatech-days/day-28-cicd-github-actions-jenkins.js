export default {
  id: 'day-28-cicd-github-actions-jenkins',
  title: 'CI/CD with GitHub Actions and Jenkins for Spring Boot Projects',
  module: 'Module 7: DevOps, Cloud & Professional Tools',
  day: 28,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Automate the path from git push to running software. Understand CI vs CD, pipeline stages (checkout, build, test, code quality with SonarQube, Docker build and push, deploy), write a complete GitHub Actions workflow and a declarative Jenkinsfile for a Spring Boot + React project, and manage secrets and environments safely.',
  objectives: [
    'Explain Continuous Integration, Continuous Delivery and Continuous Deployment',
    'Design pipeline stages with quality gates and artifacts',
    'Write GitHub Actions workflows: triggers, jobs, steps, caching, services, secrets, environments',
    'Write a declarative Jenkinsfile with stages, tools, credentials, post actions and SonarQube quality gate',
    'Build and push Docker images with proper tags and deploy to a server or Kubernetes',
  ],
  theory: [
    {
      heading: '1. CI, Continuous Delivery and Continuous Deployment',
      content: 'Without automation, a developer builds a JAR on his laptop ("works on my machine"), emails it or copies it with WinSCP to the server at 11 PM, and someone forgets to run tests. CONTINUOUS INTEGRATION (CI): every push/pull request is automatically built and tested on a clean machine, so integration problems are found within minutes. CONTINUOUS DELIVERY: every successful build produces a release-ready artifact (JAR/Docker image) that CAN be deployed to production with one click (manual approval). CONTINUOUS DEPLOYMENT: every change that passes all checks goes to production automatically, no human step. Analogy: CI is the quality check at the factory gate; delivery is packed boxes waiting in the warehouse; deployment is boxes automatically shipped to customers.',
      points: [
        'Pipeline = an ordered set of automated stages; if one fails, the rest stop (fail fast)',
        'Artifact = output of the build (JAR, Docker image, React dist folder) stored for later stages',
        'Benefits: fast feedback, consistent builds, fewer production bugs, faster releases',
        'Most Indian IT companies use Jenkins (self-hosted, older projects) or GitHub Actions / GitLab CI / Azure DevOps (newer projects)',
      ],
    },
    {
      heading: '2. Typical Pipeline Stages for a Java Project',
      content: 'A professional pipeline for a Spring Boot microservice usually looks like this. Each stage has a clear purpose and a pass/fail result.',
      syntax: `push / PR
  │
  ├─ 1. Checkout        git clone the commit
  ├─ 2. Build           mvn -B compile (JDK 21, cached ~/.m2)
  ├─ 3. Unit tests      mvn test  (JUnit + Mockito) -> test reports
  ├─ 4. Integration     mvn verify (Testcontainers / MySQL service)
  ├─ 5. Code quality    SonarQube scan + Quality Gate (coverage >= 80%, no new bugs)
  ├─ 6. Package         mvn package -> app.jar (artifact)
  ├─ 7. Docker          docker build + push image:sha / image:1.4.0
  ├─ 8. Deploy DEV      automatic
  ├─ 9. Deploy QA/UAT   automatic or on merge to release branch
  └─ 10. Deploy PROD    manual approval (Continuous Delivery)`,
      points: [
        'Run fast checks first (compile, unit tests) and slow ones later',
        'PR pipelines: build + test + Sonar only; main-branch pipelines: also image push and deploy',
        'Tag images with the Git commit SHA for traceability, plus a semantic version for releases; avoid deploying "latest"',
      ],
    },
    {
      heading: '3. GitHub Actions Concepts',
      content: 'GitHub Actions runs workflows defined as YAML files in .github/workflows/ of your repository. A WORKFLOW is triggered by EVENTS (push, pull_request, schedule, workflow_dispatch for manual run, release). It contains JOBS that run on RUNNERS (GitHub-hosted ubuntu-latest VMs, or self-hosted machines). Jobs run in parallel unless you add "needs". Each job has STEPS: either shell commands (run:) or reusable ACTIONS (uses: actions/checkout@v4). Secrets are stored in Settings > Secrets and variables > Actions and used as ${{ secrets.NAME }}. ENVIRONMENTS (dev, prod) can have their own secrets and required reviewers for approval.',
      points: [
        'actions/setup-java@v4 with cache: maven caches ~/.m2 between runs',
        'services: lets a job start containers like MySQL for integration tests',
        'Artifacts: actions/upload-artifact and download-artifact pass files between jobs',
        'Matrix builds: run the same job on Java 17 and 21',
        'GITHUB_TOKEN is automatic; with "permissions: packages: write" it can push to GHCR (ghcr.io)',
      ],
    },
    {
      heading: '4. Jenkins Concepts',
      content: 'Jenkins is a free, open-source, self-hosted automation server written in Java, very common in service companies and banks. Main ideas: CONTROLLER (master) schedules work, AGENTS (nodes) execute builds. Pipelines are written as code in a JENKINSFILE (Groovy DSL) stored in the repo. Declarative syntax: pipeline { agent, tools, environment, stages { stage { steps } }, post }. Plugins add features: Git, Pipeline, Maven Integration, Docker Pipeline, SonarQube Scanner, JUnit, Credentials Binding, Blue Ocean. CREDENTIALS (passwords, tokens, SSH keys) are stored in Jenkins and injected with withCredentials or credentials().',
      points: [
        'Pipeline job: one branch; Multibranch Pipeline: auto-creates a job per branch/PR containing a Jenkinsfile',
        'Triggers: GitHub webhook (push events), pollSCM, cron',
        'post { always / success / failure } for reports, cleanup and notifications (email, Slack, MS Teams)',
        'input step for manual approval before production',
      ],
    },
    {
      heading: '5. SonarQube and Quality Gates',
      content: 'SonarQube is a code-quality platform that statically analyses code for BUGS, VULNERABILITIES, CODE SMELLS, SECURITY HOTSPOTS, DUPLICATION and test COVERAGE (from the JaCoCo report). A QUALITY GATE is a set of conditions such as "coverage on new code >= 80%", "no new blocker bugs", "duplication < 3%". The pipeline waits for the quality gate result and FAILS if it is red — bad code cannot be merged or deployed. SonarCloud is the hosted version (free for public repos).',
      syntax: `mvn -B verify sonar:sonar \\
  -Dsonar.projectKey=shopkart-order-api \\
  -Dsonar.host.url=http://sonar.company.local:9000 \\
  -Dsonar.token=$SONAR_TOKEN`,
      tip: 'Add the jacoco-maven-plugin to pom.xml; otherwise SonarQube shows 0% coverage even when tests run.',
    },
    {
      heading: '6. Secrets, Branching and Good Practices',
      content: 'A pipeline has keys to your servers, so treat it carefully. Never print secrets (GitHub masks them, but base64 or splitting can leak). Prefer short-lived credentials (GitHub OIDC to AWS instead of long-lived access keys). Protect the main branch: require PR reviews and passing checks before merge. Keep pipelines fast (under 10 minutes) with caching and parallel jobs. Use the same pipeline definition for all environments with different parameters.',
      points: [
        'Branching models: GitFlow (develop, feature/*, release/*, hotfix/*) or trunk-based (short-lived feature branches into main)',
        'Semantic versioning: MAJOR.MINOR.PATCH (2.3.1); tag releases in Git',
        'Rollback plan: redeploy previous image tag; database migrations must be backward compatible (Flyway)',
        'Notifications: send failures to the team channel; whoever broke the build fixes it first',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Prepare the Maven Project — JaCoCo Coverage and Sonar Settings',
      scenario: 'Make the Spring Boot project CI-ready so pipelines can run tests, measure coverage and analyse code.',
      steps: [
        'Open pom.xml in IntelliJ or Eclipse and add the JaCoCo plugin and sonar properties below',
        'Make sure the Maven wrapper exists (mvnw, mvnw.cmd, .mvn/) — Spring Initializr adds it; commit it to Git',
        'Run locally: ./mvnw -B clean verify (Windows: mvnw.cmd -B clean verify)',
        'Open target/site/jacoco/index.html in a browser to see coverage',
        'Run SonarQube locally to try: docker run -d --name sonar -p 9000:9000 sonarqube:lts-community, login admin/admin, create a project and token',
      ],
      code: `<!-- pom.xml -->
<properties>
  <java.version>21</java.version>
  <sonar.projectKey>shopkart-order-api</sonar.projectKey>
  <sonar.projectName>ShopKart Order API</sonar.projectName>
  <sonar.coverage.jacoco.xmlReportPaths>\${project.build.directory}/site/jacoco/jacoco.xml</sonar.coverage.jacoco.xmlReportPaths>
</properties>

<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
        <execution>
          <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
          <id>report</id>
          <phase>verify</phase>
          <goals><goal>report</goal></goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>

# Local commands
./mvnw -B clean verify
./mvnw -B sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.token=squ_xxxxxxxxx`,
      result: `[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jacoco:0.8.12:report (report) @ order-api ---
[INFO] Analyzed bundle 'order-api' with 18 classes
[INFO] BUILD SUCCESS

sonar:sonar
[INFO] ANALYSIS SUCCESSFUL, you can find the results at: http://localhost:9000/dashboard?id=shopkart-order-api
Dashboard: Quality Gate Passed | Bugs 0 | Vulnerabilities 0 | Code Smells 7 | Coverage 82.4% | Duplications 1.2%
(numbers depend on your project)`,
      explanation: 'prepare-agent attaches the JaCoCo Java agent while tests run; the report goal writes HTML and XML reports in the verify phase, and Sonar reads the XML path. Using the Maven wrapper ensures the CI machine uses the exact Maven version the team uses. The ${project.build.directory} is a Maven property (target folder).',
    },
    {
      title: 'Example 2: GitHub Actions — Build, Test, Sonar, Docker Push and Deploy',
      scenario: 'On every PR: build + test + Sonar. On push to main: also build a Docker image, push it to Docker Hub and deploy to a Linux server via SSH with approval for production.',
      steps: [
        'Create .github/workflows/ci-cd.yml in the repository with the content below (IntelliJ: right-click project > New > File)',
        'In GitHub: Settings > Secrets and variables > Actions > New repository secret: SONAR_TOKEN, SONAR_HOST_URL, DOCKERHUB_USERNAME, DOCKERHUB_TOKEN',
        'Settings > Environments > New environment "production" > add Required reviewers (your team lead) and secrets SSH_HOST, SSH_USER, SSH_KEY',
        'Commit and push; open the Actions tab to watch the run (click a job to see live logs)',
        'Create a PR to see only the ci job run; merge to main to run docker and deploy jobs',
        'Add a status badge to README: ![CI](https://github.com/<user>/<repo>/actions/workflows/ci-cd.yml/badge.svg)',
      ],
      code: `# .github/workflows/ci-cd.yml
name: order-api CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  IMAGE_NAME: \${{ secrets.DOCKERHUB_USERNAME }}/order-api

jobs:
  ci:
    name: Build, Test and Sonar
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: orderdb_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -uroot -proot"
          --health-interval=10s --health-timeout=5s --health-retries=10

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0              # Sonar needs full history for "new code"

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Build and test
        run: ./mvnw -B clean verify
        env:
          SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/orderdb_test
          SPRING_DATASOURCE_USERNAME: root
          SPRING_DATASOURCE_PASSWORD: root

      - name: SonarQube scan
        run: ./mvnw -B sonar:sonar -Dsonar.qualitygate.wait=true
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: \${{ secrets.SONAR_HOST_URL }}

      - name: Upload JAR
        uses: actions/upload-artifact@v4
        with:
          name: order-api-jar
          path: target/*.jar
          retention-days: 7

  docker:
    name: Docker build and push
    needs: ci
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            \${{ env.IMAGE_NAME }}:\${{ github.sha }}
            \${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to production
    needs: docker
    runs-on: ubuntu-latest
    environment: production          # waits for required reviewer approval
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.SSH_HOST }}
          username: \${{ secrets.SSH_USER }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /opt/shopkart
            export TAG=\${{ github.sha }}
            docker compose pull api
            docker compose up -d api
            sleep 20
            curl -fsS http://localhost:8080/actuator/health`,
      result: `Actions tab -> "order-api CI/CD" run #42 (push to main by priya-dev)

✓ Build, Test and Sonar       3m 41s
    ✓ Set up JDK 21 (cache restored: ~/.m2 210 MB)
    ✓ Build and test  -> Tests run: 24, Failures: 0 ... BUILD SUCCESS
    ✓ SonarQube scan  -> QUALITY GATE STATUS: PASSED
✓ Docker build and push       1m 52s
    pushed yourname/order-api:3f9c2a1e... and :latest
⏸ Deploy to production        Waiting for review: priya-lead must approve
   (after approval)
✓ Deploy to production        38s
    {"status":"UP"}`,
      explanation: 'Three jobs chained with "needs": docker runs only after ci passes and only for pushes to main (PRs stop after ci). The MySQL service container is reachable at localhost:3306 because the job runs directly on the runner VM with a port mapping. sonar.qualitygate.wait=true makes the step fail if the quality gate fails. The production environment pauses the run until a reviewer approves. In the compose file on the server, the api image should be yourname/order-api:\${TAG:-latest} so the exact commit SHA is deployed. curl -f makes the job fail if the health check fails.',
    },
    {
      title: 'Example 3: Install Jenkins with Docker and Configure Tools, Credentials and SonarQube',
      scenario: 'Set up a Jenkins server for the team that can build Maven projects and run Docker commands.',
      steps: [
        'Run Jenkins (LTS, JDK 21) with Docker socket mounted (for learning; in companies use dedicated agents)',
        'Open http://localhost:8090, paste the initial admin password from the logs, choose "Install suggested plugins", create the admin user',
        'Manage Jenkins > Plugins > Available: install "Docker Pipeline", "SonarQube Scanner", "Pipeline: Stage View", "JUnit" (usually installed), "JaCoCo"',
        'Manage Jenkins > Tools: add JDK named "jdk21" (install automatically from adoptium.net) and Maven named "maven3" (install automatically 3.9.x)',
        'Manage Jenkins > Credentials > System > Global > Add: Username with password id "dockerhub-creds"; Secret text id "sonar-token"; SSH Username with private key id "prod-ssh"',
        'Manage Jenkins > System > SonarQube servers: name "sonar-server", URL http://sonar:9000, token credential "sonar-token"',
        'In SonarQube: Administration > Configuration > Webhooks > create webhook to http://jenkins:8080/sonarqube-webhook/ (needed for waitForQualityGate)',
      ],
      code: `# docker-compose for a learning CI lab: jenkins + sonarqube
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk21
    user: root                      # lab only, so it can use the docker socket
    ports:
      - "8090:8080"
      - "50000:50000"               # inbound agents
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
  sonar:
    image: sonarqube:lts-community
    ports:
      - "9000:9000"
    volumes:
      - sonar_data:/opt/sonarqube/data
volumes:
  jenkins_home:
  sonar_data:

# Install the docker CLI inside the Jenkins container (lab only)
docker compose up -d
docker compose exec jenkins bash -c "apt-get update && apt-get install -y docker.io"

# Initial admin password
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`,
      result: `docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
3f1c9e7b2a0d4c8e9b6a5f4e3d2c1b0a     (random on your machine)

Jenkins UI: "Jenkins is ready!" -> Dashboard
Manage Jenkins > Tools shows: JDK jdk21 (auto-install), Maven maven3 (auto-install 3.9.9)
Credentials list: dockerhub-creds, sonar-token, prod-ssh`,
      explanation: 'Jenkins stores all jobs, plugins and credentials in /var/jenkins_home, so a named volume keeps them across upgrades. Tool names (jdk21, maven3) and credential IDs are referenced from the Jenkinsfile, so they must match exactly. Mounting the Docker socket gives Jenkins full control of the host Docker — acceptable in a lab, but production setups use separate build agents (or Kubernetes agents) with restricted permissions.',
    },
    {
      title: 'Example 4: Declarative Jenkinsfile with Quality Gate, Docker Push and Manual Approval',
      scenario: 'Create a Multibranch Pipeline job that builds every branch; only main gets deployed after approval.',
      steps: [
        'Add the Jenkinsfile below to the repository root and push',
        'Jenkins Dashboard > New Item > name "order-api" > Multibranch Pipeline > Branch Sources > Add source GitHub (credentials: GitHub personal access token) > repository URL > Save',
        'In GitHub repo Settings > Webhooks > add http://<jenkins-host>:8090/github-webhook/ (content type application/json) so pushes trigger builds instantly (use ngrok for a laptop Jenkins)',
        'Open the main branch job > Stage View to watch stages; click "Proceed" at the Approve stage',
        'Open "Test Result" and "Coverage Report" links on the build page',
      ],
      code: `// Jenkinsfile (declarative)
pipeline {
    agent any

    tools {
        jdk 'jdk21'
        maven 'maven3'
    }

    environment {
        IMAGE      = 'yourdockerid/order-api'
        IMAGE_TAG  = "\${env.BUILD_NUMBER}-\${env.GIT_COMMIT.take(7)}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Unit Test') {
            steps {
                sh 'mvn -B clean verify'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                    jacoco execPattern: 'target/jacoco.exec'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh 'mvn -B sonar:sonar'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            when { branch 'main' }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        def img = docker.build("\${IMAGE}:\${IMAGE_TAG}")
                        img.push()
                        img.push('latest')
                    }
                }
            }
        }

        stage('Approve Production') {
            when { branch 'main' }
            steps {
                input message: "Deploy \${IMAGE_TAG} to PRODUCTION?", ok: 'Deploy', submitter: 'teamlead,admin'
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                sshagent(credentials: ['prod-ssh']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no ubuntu@prod.shopkart.in '
                        cd /opt/shopkart &&
                        TAG=\${IMAGE_TAG} docker compose pull api &&
                        TAG=\${IMAGE_TAG} docker compose up -d api'
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Build \${env.BUILD_NUMBER} succeeded"
        }
        failure {
            mail to: 'order-team@shopkart.in',
                 subject: "FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}",
                 body: "Check console output: \${env.BUILD_URL}"
        }
        always {
            cleanWs()
        }
    }
}`,
      result: `Stage View - order-api/main #17
| Checkout | Build & Unit Test | SonarQube Analysis | Quality Gate | Docker Build & Push | Approve Production | Deploy |
|   2s     |      1m 58s       |       41s          |     6s       |        1m 12s       |  (paused) Proceed  |  21s   |

Console Output (excerpt):
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
SonarQube task 'AYx...' status is 'SUCCESS'  Quality gate is 'OK'
Successfully tagged yourdockerid/order-api:17-3f9c2a1
The push refers to repository [docker.io/yourdockerid/order-api]
Deploy 17-3f9c2a1 to PRODUCTION?  Proceed or Abort  -> Approved by teamlead
Finished: SUCCESS

Feature branch feature/coupon #3: only Checkout, Build & Unit Test, SonarQube, Quality Gate run (others skipped).`,
      explanation: 'The Jenkinsfile lives with the code, so pipeline changes are reviewed like code. when { branch "main" } works in Multibranch pipelines, so feature branches only get CI. waitForQualityGate needs the SonarQube webhook to Jenkins. Groovy strings: single quotes are literal; double quotes interpolate Groovy variables like IMAGE_TAG. The junit and jacoco steps publish test trends and coverage on the build page. cleanWs() needs the Workspace Cleanup plugin.',
    },
  ],
  interview: [
    { q: 'What is CI/CD?', a: 'Continuous Integration automatically builds and tests every code change merged into a shared repository. Continuous Delivery keeps every passing build release-ready and deployable with manual approval; Continuous Deployment releases automatically to production when all checks pass.', level: 'Easy' },
    { q: 'What stages would you include in a pipeline for a Spring Boot microservice?', a: 'Checkout, build/compile, unit tests, integration tests, static analysis and coverage (SonarQube + JaCoCo, quality gate), security scan (dependencies/image), package, Docker build and push with versioned tag, deploy to dev/QA, approval, deploy to prod, smoke test/health check, notification.', level: 'Medium' },
    { q: 'Explain workflow, job, step and runner in GitHub Actions.', a: 'A workflow is a YAML file triggered by events. It has jobs that run on runners (VMs/containers), in parallel unless linked with needs. Each job has sequential steps that run shell commands or reusable actions.', level: 'Easy' },
    { q: 'How do you store and use secrets in GitHub Actions and Jenkins?', a: 'GitHub: repository/environment secrets referenced as secrets.NAME inside the expression syntax; masked in logs. Jenkins: Credentials store, used with credentials() in environment, withCredentials, sshagent or docker.withRegistry. Never hard-code secrets in the repo.', level: 'Medium' },
    { q: 'Declarative vs Scripted Jenkins pipeline?', a: 'Declarative uses a structured pipeline { stages { stage { steps } } } syntax with built-in validation, post sections and when conditions — recommended. Scripted is plain Groovy inside node { }, more flexible but harder to read. Declarative can still use script { } blocks.', level: 'Medium' },
    { q: 'What is a Quality Gate?', a: 'A set of pass/fail conditions in SonarQube (e.g., coverage on new code >= 80%, no new critical bugs or vulnerabilities, duplication below a limit). The pipeline waits for it and fails the build if conditions are not met.', level: 'Easy' },
    { q: 'How do you speed up a slow Maven pipeline?', a: 'Cache ~/.m2 (setup-java cache: maven), Docker layer caching, run unit and integration tests in parallel jobs, skip unnecessary plugins on PRs, use -T for parallel module builds, and run heavy suites nightly.', level: 'Medium' },
    { q: 'Why tag Docker images with the commit SHA instead of only latest?', a: 'An immutable, unique tag tells exactly which code is running, enables reliable rollback to a previous tag, and avoids caches pulling a stale "latest".', level: 'Medium' },
    { q: 'How is a manual approval done in GitHub Actions and in Jenkins?', a: 'GitHub Actions: job with environment: production where the environment has required reviewers. Jenkins: the input step, optionally limited to submitters, usually inside a timeout.', level: 'Medium' },
    { q: 'What is a webhook in CI?', a: 'An HTTP callback from GitHub/GitLab to the CI server sent on events like push or pull request, so the build starts immediately instead of polling the repository.', level: 'Easy' },
    { q: 'The build passes locally but fails in CI. What could be the reasons?', a: 'Different JDK/Maven versions, missing environment variables or secrets, tests depending on local DB/files/time zone, OS differences (case-sensitive file names on Linux), uncommitted files, flaky tests with ordering or timing issues. Use the Maven wrapper, Testcontainers and the same JDK.', level: 'Hard' },
    { q: 'How do you deploy without downtime and roll back safely?', a: 'Use rolling or blue-green deployments with health checks (Kubernetes readiness, load balancer), backward-compatible DB migrations (expand-contract with Flyway), versioned images, and keep previous versions to redeploy (kubectl rollout undo or redeploy previous tag).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a GitHub Actions workflow for the React frontend: install, lint, test and build on PRs, and upload the dist folder as an artifact.',
      hint: 'actions/setup-node@v4 with cache: npm; npm ci; npm run lint; npm test -- --run (Vitest).',
      solution: `# .github/workflows/frontend.yml
name: frontend CI
on:
  pull_request:
    paths: [ 'frontend/**' ]
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist`,
    },
    {
      task: 'Add a matrix to the Java CI job so tests run on both JDK 17 and JDK 21.',
      hint: 'strategy.matrix.java: [17, 21] and use matrix.java in setup-java.',
      solution: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        java: [ '17', '21' ]
    name: Test on JDK \${{ matrix.java }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: \${{ matrix.java }}
          cache: maven
      - run: ./mvnw -B verify
# Two parallel jobs appear: "Test on JDK 17" and "Test on JDK 21".`,
    },
    {
      task: 'Write a GitHub Actions job that deploys the new image to Kubernetes using kubectl and a kubeconfig stored as a secret, then waits for the rollout.',
      hint: 'azure/setup-kubectl, write the kubeconfig from a secret, kubectl set image, kubectl rollout status.',
      solution: `  deploy-k8s:
    needs: docker
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: azure/setup-kubectl@v4
      - name: Configure kubeconfig
        run: |
          mkdir -p ~/.kube
          echo "\${{ secrets.KUBECONFIG_B64 }}" | base64 -d > ~/.kube/config
          chmod 600 ~/.kube/config
      - name: Rollout new image
        run: |
          kubectl -n shop set image deployment/order-api \\
            order-api=\${{ secrets.DOCKERHUB_USERNAME }}/order-api:\${{ github.sha }}
          kubectl -n shop rollout status deployment/order-api --timeout=180s
      - name: Roll back on failure
        if: failure()
        run: kubectl -n shop rollout undo deployment/order-api`,
    },
    {
      task: 'Write a Jenkinsfile stage that runs unit tests and integration tests in parallel.',
      hint: 'parallel { stage(...) {...} stage(...) {...} } inside a stage; use maven-failsafe for ITs.',
      solution: `stage('Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'mvn -B test'
            }
            post { always { junit 'target/surefire-reports/*.xml' } }
        }
        stage('Integration Tests') {
            steps {
                sh 'mvn -B failsafe:integration-test failsafe:verify -DskipUnitTests=true'
            }
            post { always { junit allowEmptyResults: true, testResults: 'target/failsafe-reports/*.xml' } }
        }
    }
}
// Note: running both in the SAME workspace can conflict on target/;
// in real setups give each its own agent or use 'mvn -B verify' once.`,
    },
    {
      task: 'Write a nightly scheduled GitHub Actions workflow that runs OWASP dependency check and fails on high-severity CVEs.',
      hint: 'on.schedule cron (UTC); dependency-check-maven plugin with failBuildOnCVSS.',
      solution: `# .github/workflows/security-nightly.yml
name: nightly security scan
on:
  schedule:
    - cron: '30 20 * * *'      # 20:30 UTC = 02:00 IST
  workflow_dispatch:

jobs:
  owasp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - name: OWASP Dependency Check
        run: ./mvnw -B org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: dependency-check-report
          path: target/dependency-check-report.html`,
    },
  ],
  quiz: [
    {
      question: 'In which folder must GitHub Actions workflow files be placed?',
      options: ['.github/actions/', '.ci/workflows/', '.github/workflows/', 'src/main/workflows/'],
      answer: 2,
      explanation: 'Workflows live in .github/workflows/*.yml.',
    },
    {
      question: 'Continuous Delivery differs from Continuous Deployment because Continuous Delivery:',
      options: ['Requires a manual approval before production', 'Does not run tests', 'Never builds Docker images', 'Only works with Jenkins'],
      answer: 0,
      explanation: 'Delivery = always deployable, release triggered manually; Deployment = fully automatic.',
    },
    {
      question: 'In a declarative Jenkinsfile, which section runs after all stages, for example to send failure emails?',
      options: ['finally', 'after', 'cleanup only', 'post'],
      answer: 3,
      explanation: 'post { always / success / failure { ... } }.',
    },
    {
      question: 'Which GitHub Actions keyword makes a job wait for another job to finish successfully?',
      options: ['depends_on', 'needs', 'after', 'requires'],
      answer: 1,
      explanation: 'needs: ci makes the job run after ci succeeds.',
    },
    {
      question: 'SonarQube shows 0% coverage although tests ran. The most likely missing piece is:',
      options: ['The JaCoCo plugin/report', 'The Docker plugin', 'The Surefire plugin', 'A Dockerfile'],
      answer: 0,
      explanation: 'Sonar reads coverage from the JaCoCo XML report; without it coverage is 0%.',
    },
  ],
};
