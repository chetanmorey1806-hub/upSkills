export default {
  lesson: 'day-02-gradle-build-tool',
  minutes: 20,
  intro: 'Practise Gradle build scripts (Groovy and Kotlin DSL), dependency configurations, the task graph and the wrapper.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Which Gradle configuration is used for **JUnit**, so it is available only when compiling and running tests?',
      options: ['implementation', 'api', 'testImplementation', 'compileOnly'],
      answer: 2,
      explain: '`testImplementation` = Maven `test` scope. `implementation` is for normal code, `compileOnly` for compile-time-only things like Lombok (with `annotationProcessor`), `runtimeOnly` for JDBC drivers, `api` (java-library plugin) exposes a dependency to consumers.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the **Kotlin DSL** (`build.gradle.kts`) line that adds the Spring Boot web starter (version managed by the plugin).',
      example: { title: 'the Groovy DSL version', code: "implementation 'org.springframework.boot:spring-boot-starter-web'" },
      accept: ['implementation("org.springframework.boot:spring-boot-starter-web")'],
      explain: 'Kotlin DSL is real Kotlin code: function call with **parentheses** and **double quotes**. The Groovy form `implementation \'...\'` with single quotes and no parentheses does not compile in a `.kts` file.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'You run `./gradlew deploy`. What is printed (only the println lines, in order)?',
      example: { title: 'the task graph', text: 'Gradle builds a graph (DAG) of tasks and runs each needed task exactly once, dependencies first.' },
      code: `tasks.register("compileApp") {
    doLast { println("compile") }
}
tasks.register("testApp") {
    dependsOn("compileApp")
    doLast { println("test") }
}
tasks.register("deploy") {
    dependsOn("testApp", "compileApp")
    doLast { println("deploy") }
}`,
      expected: 'compile\ntest\ndeploy',
      explain: '`deploy` needs `testApp` and `compileApp`; `testApp` also needs `compileApp`. Gradle runs **compileApp once**, then testApp, then deploy - it never runs a task twice in one build.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which command builds the project (compile, test, assemble) using the **Gradle Wrapper** on Linux/macOS?',
      example: { title: 'listing tasks', code: './gradlew tasks' },
      accept: ['./gradlew build', 'gradlew build', './gradlew clean build'],
      explain: '`./gradlew build` downloads the exact Gradle version from `gradle/wrapper/gradle-wrapper.properties`, so every developer and CI server uses the same version. Commit the wrapper files to Git. On Windows: `gradlew build`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Where does Gradle put the built JAR of a Spring Boot project by default?',
      options: ['target/', 'build/libs/', 'out/jar/', 'dist/'],
      answer: 1,
      explain: 'Gradle output goes to `build/` and JARs to **build/libs/**. Maven uses `target/`. Remember to add `build/` and `.gradle/` to `.gitignore`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements comparing **Maven and Gradle** are TRUE? (choose all that apply)',
      options: [
        'Maven uses XML (pom.xml); Gradle uses a Groovy or Kotlin DSL',
        'Gradle has incremental builds and a build cache, so repeat builds are often faster',
        'Android projects use Gradle',
        'Gradle cannot download dependencies from Maven Central',
        'Both can build Spring Boot applications',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Both use the same repositories (`mavenCentral()` in Gradle). Maven is declarative and very standard; Gradle is more flexible and faster thanks to incremental work and caching. Android Studio uses Gradle.',
    },
  ],
};
