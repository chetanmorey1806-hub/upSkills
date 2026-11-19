export default {
  lesson: 'day-02-initializr-project-structure',
  minutes: 18,
  intro: 'Practise the Initializr choices, the standard Maven folder layout, pom.xml and the commands that build and run a Boot app.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a generated Spring Boot Maven project, where does `application.properties` live?',
      options: ['src/main/java', 'src/main/resources', 'src/test/resources only', 'the project root next to pom.xml'],
      answer: 1,
      explain: '`src/main/resources` holds non-Java files that go on the classpath: `application.properties`/`.yml`, `static/` (CSS, JS, images) and `templates/`. Java code goes in `src/main/java`, tests in `src/test/java`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are real choices you make on **start.spring.io** (Spring Initializr)? (choose all that apply)',
      options: ['Project build tool (Maven / Gradle)', 'Spring Boot version', 'Group and Artifact', 'Java version', 'Which database rows to insert', 'Dependencies such as Spring Web'],
      answers: [0, 1, 2, 3, 5],
      explain: 'Initializr asks for build tool, language, Boot version, project metadata (group, artifact, package name, packaging, Java version) and dependencies. It generates the skeleton only - it knows nothing about your data.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Every generated pom.xml inherits dependency versions and plugin settings from one parent. Complete the missing artifactId:\n```\n<parent>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>???</artifactId>\n  <version>3.3.4</version>\n</parent>\n```',
      example: { title: 'why a parent?', text: 'Because of the parent you can write starters WITHOUT a <version> tag: the parent manages compatible versions for you.' },
      accept: ['spring-boot-starter-parent'],
      explain: '`spring-boot-starter-parent` provides dependency management (tested versions), Java/encoding defaults and plugin configuration. Adding your own `<version>` to every starter is a common mistake that can cause version conflicts.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which Maven Wrapper command runs the Spring Boot application from the terminal on Linux/macOS (project root)?',
      example: { title: 'the wrapper builds too', code: './mvnw clean package   # builds target/*.jar' },
      accept: ['./mvnw spring-boot:run', 'mvnw spring-boot:run', 'mvn spring-boot:run'],
      explain: '`./mvnw spring-boot:run` uses the **spring-boot-maven-plugin** goal `run`. On Windows it is `mvnw spring-boot:run`. The wrapper downloads the right Maven version, so you do not need Maven installed.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Your main class is in `com.upskillr.shop` and you create a controller in package `com.upskillr.controller`. Calling its URL gives **404**. Why?',
      options: [
        'Controllers must be in the default package',
        'Component scanning starts at the main class package (com.upskillr.shop) and its sub-packages, so com.upskillr.controller is never scanned',
        'Spring Boot only supports one controller',
        'The port is wrong',
      ],
      answer: 1,
      explain: '`@SpringBootApplication` scans the **main class package and below**. Put controllers in `com.upskillr.shop.controller` (a sub-package). This is one of the most common beginner setup mistakes.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'You run `./mvnw clean package` for this pom. What is the **file name** of the JAR created in `target/`?',
      example: { title: 'naming rule', text: 'Maven names the JAR <artifactId>-<version>.jar' },
      code: `<groupId>com.upskillr</groupId>
<artifactId>student-api</artifactId>
<version>0.0.1-SNAPSHOT</version>
<packaging>jar</packaging>`,
      expected: 'student-api-0.0.1-SNAPSHOT.jar',
      explain: 'The JAR name is `artifactId-version.jar` = **student-api-0.0.1-SNAPSHOT.jar**. The groupId is not part of the file name. Run it with `java -jar target/student-api-0.0.1-SNAPSHOT.jar`.',
    },
  ],
};
