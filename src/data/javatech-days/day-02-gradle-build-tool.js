const taskGraphCode = `import java.util.*;

public class Main {
    static Set<String> done = new HashSet<>();

    static List<String> dependsOn(String task) {
        return switch (task) {
            case "build" -> List.of("assemble", "check");
            case "assemble" -> List.of("jar");
            case "jar" -> List.of("classes");
            case "classes" -> List.of("compileJava", "processResources");
            case "check" -> List.of("test");
            case "test" -> List.of("classes", "compileTestJava");
            case "compileTestJava" -> List.of("classes");
            default -> List.of();
        };
    }

    static void execute(String task) {
        if (done.contains(task)) return;      // each task runs only once
        for (String dep : dependsOn(task)) {
            execute(dep);                     // run dependencies first
        }
        done.add(task);
        System.out.println("> Task :" + task);
    }

    public static void main(String[] args) {
        execute("build");
        System.out.println("BUILD SUCCESSFUL - " + done.size() + " tasks executed");
    }
}`;

export default {
  id: 'day-02-gradle-build-tool',
  title: 'Gradle Build Tool: build.gradle (Groovy and Kotlin DSL), Tasks, Configurations, Wrapper',
  module: 'Module 1: Build Tools, Git & Libraries',
  day: 2,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Learn Gradle, the fast build tool used by Android and many Spring Boot projects: build scripts in Groovy and Kotlin DSL, tasks and the task graph, dependency configurations, the Gradle Wrapper and a clear Maven vs Gradle comparison.',
  objectives: [
    'Read and write build.gradle and build.gradle.kts for a Java / Spring Boot project',
    'Use dependency configurations: implementation, api, compileOnly, runtimeOnly, testImplementation',
    'Create custom tasks and understand the task graph (dependsOn)',
    'Use the Gradle Wrapper (gradlew) and common commands',
    'Compare Maven and Gradle and choose the right one',
  ],
  theory: [
    {
      heading: '1. What is Gradle?',
      content: 'Gradle is a build automation tool like Maven, but the build file is CODE (Groovy or Kotlin), not XML. It uses the same Maven repositories (Maven Central) and the same folder structure (src/main/java, src/test/java). Gradle is fast because of incremental builds (only rebuilds what changed), a build cache and a background daemon process. Analogy: Maven is a fixed train timetable (strict, predictable); Gradle is a cab app (flexible route, you can program it), but both take you to the same destination: a JAR.',
      points: [
        'settings.gradle(.kts) – project name and included sub-projects',
        'build.gradle(.kts) – plugins, repositories, dependencies, tasks',
        'gradle.properties – JVM args and reusable properties',
        'gradlew / gradlew.bat + gradle/wrapper/ – the Wrapper',
        'Output goes to build/ (Maven uses target/)',
      ],
    },
    {
      heading: '2. build.gradle: Groovy DSL vs Kotlin DSL',
      content: 'Groovy DSL (build.gradle) is shorter and allows single quotes and optional brackets. Kotlin DSL (build.gradle.kts) uses double quotes and function-call brackets, and gives you autocomplete and compile-time errors in IntelliJ. New Spring Initializr and Android projects default to Kotlin DSL. Both do the same thing.',
      syntax: `// Groovy: build.gradle
plugins { id 'java' }
group = 'com.stn'
version = '1.0.0'
java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }
repositories { mavenCentral() }
dependencies {
    implementation 'org.apache.commons:commons-lang3:3.14.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}

// Kotlin: build.gradle.kts
plugins { java }
group = "com.stn"
version = "1.0.0"
java { toolchain { languageVersion.set(JavaLanguageVersion.of(17)) } }
repositories { mavenCentral() }
dependencies {
    implementation("org.apache.commons:commons-lang3:3.14.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
}`,
    },
    {
      heading: '3. Dependency Configurations',
      content: 'Gradle uses configurations instead of Maven scopes. The dependency notation is "group:name:version" (the same GAV).',
      points: [
        'implementation – compile + runtime, but NOT leaked to consumers of your library (≈ Maven compile, faster rebuilds)',
        'api – like implementation but exposed to consumers (needs the java-library plugin)',
        'compileOnly – compile time only (≈ provided), e.g. Lombok, servlet-api',
        'runtimeOnly – runtime only (≈ runtime), e.g. MySQL driver',
        'annotationProcessor – processors like Lombok and MapStruct (must be added separately!)',
        'testImplementation / testRuntimeOnly / testCompileOnly – test classpath only (≈ test)',
        'Old names compile and testCompile are REMOVED in Gradle 7+; you will see them only in old tutorials',
      ],
    },
    {
      heading: '4. Tasks and the Task Graph',
      content: 'Everything Gradle does is a task: compileJava, processResources, classes, jar, test, build, clean. Tasks depend on other tasks; Gradle builds a directed acyclic graph (DAG) and runs each needed task once, in the right order. "UP-TO-DATE" means inputs did not change, so the task was skipped. You can write your own tasks.',
      syntax: `tasks.register('hello') {
    group = 'custom'
    description = 'Prints a greeting'
    doLast { println "Hello from Gradle, version \${project.version}" }
}

tasks.named('build') { dependsOn 'hello' }`,
      points: [
        'gradle tasks – list tasks;  gradle build --dry-run – show what would run',
        'gradle test --tests "*StudentServiceTest" – run one test class',
        'gradle build -x test – build but exclude tests',
        'gradle dependencies --configuration runtimeClasspath – dependency tree',
        'Configuration phase (scripts evaluated) happens before Execution phase (doLast blocks run)',
      ],
    },
    {
      heading: '5. Gradle Wrapper',
      content: 'The Wrapper is a small script (gradlew on Linux/Mac, gradlew.bat on Windows) plus gradle/wrapper/gradle-wrapper.properties that pins the Gradle version. Anyone who clones the project runs ./gradlew build and the correct Gradle version is downloaded automatically: no installation, no "works on my machine" problems. ALWAYS commit the wrapper files to Git and use ./gradlew instead of a globally installed gradle.',
      syntax: `gradle wrapper --gradle-version 8.8    # generate/upgrade wrapper
./gradlew build                         # Linux / Mac
gradlew.bat build                       # Windows

# gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.8-bin.zip`,
    },
    {
      heading: '6. Maven vs Gradle',
      content: 'Both are good; companies choose one and stay with it. Learn to read both.',
      points: [
        'Build file: Maven pom.xml (XML, declarative) vs Gradle build.gradle(.kts) (Groovy/Kotlin code)',
        'Speed: Gradle is usually faster (incremental build, build cache, daemon)',
        'Flexibility: Gradle custom logic is easy; Maven needs plugins',
        'Learning curve: Maven is simpler and very predictable; Gradle has more concepts',
        'Lifecycle: Maven fixed phases; Gradle task graph',
        'Usage: Maven dominant in enterprise Java/Spring; Gradle default for Android, popular for Spring Boot, Kotlin',
        'Output folder: target/ vs build/; local cache: ~/.m2 vs ~/.gradle/caches',
      ],
      tip: 'IntelliJ: open the Gradle tool window (elephant icon) to run tasks and reload. Eclipse: install Buildship (included in Eclipse IDE for Java Developers) and use File > Import > Gradle > Existing Gradle Project.',
    },
  ],
  examples: [
    {
      title: 'Spring Boot REST Project with Gradle (Groovy DSL)',
      scenario: 'Generate a Spring Boot 3 project using Gradle - Groovy and understand every line of build.gradle.',
      steps: [
        'Open start.spring.io > Project: Gradle - Groovy > Java 17 > Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Lombok > Generate',
        'IntelliJ: File > Open > select the unzipped folder > Trust project. IntelliJ imports it using the Wrapper',
        'Eclipse: File > Import > Gradle > Existing Gradle Project > select the folder > Finish',
        'Run in terminal: ./gradlew bootRun (Windows: gradlew.bat bootRun)',
        'Build the executable JAR: ./gradlew clean build, then java -jar build/libs/demo-0.0.1-SNAPSHOT.jar',
      ],
      code: `// settings.gradle
rootProject.name = 'demo'

// build.gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.5'
}

group = 'com.stn'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}`,
      result: `$ ./gradlew clean build
> Task :clean
> Task :compileJava
> Task :processResources
> Task :classes
> Task :resolveMainClassName
> Task :bootJar
> Task :jar
> Task :assemble
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses
> Task :test
> Task :check
> Task :build

BUILD SUCCESSFUL in 9s
8 actionable tasks: 8 executed`,
      explanation: 'The Spring Boot plugin adds bootRun and bootJar; the dependency-management plugin imports the Spring Boot BOM, so starters have no version. Lombok is compileOnly + annotationProcessor (forgetting annotationProcessor is the #1 Lombok-with-Gradle mistake). MySQL is runtimeOnly. The fat JAR is build/libs/demo-0.0.1-SNAPSHOT.jar.',
    },
    {
      title: 'The Same Build in Kotlin DSL (build.gradle.kts)',
      scenario: 'Your team uses Kotlin DSL. Convert the console project build file.',
      steps: [
        'IntelliJ: File > New > Project > Java > Build system: Gradle > Gradle DSL: Kotlin > Create',
        'Open build.gradle.kts and type the code below',
        'Click the "Load Gradle Changes" icon (or Gradle tool window > Reload All)',
        'Gradle tool window > Tasks > application > run (double-click)',
      ],
      code: `// settings.gradle.kts
rootProject.name = "student-app"

// build.gradle.kts
plugins {
    java
    application
}

group = "com.stn"
version = "1.0.0"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.apache.commons:commons-lang3:3.14.0")
    testImplementation(platform("org.junit:junit-bom:5.10.2"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass.set("com.stn.App")
}

tasks.test {
    useJUnitPlatform()
}

// src/main/java/com/stn/App.java
package com.stn;

import org.apache.commons.lang3.StringUtils;

public class App {
    public static void main(String[] args) {
        System.out.println(StringUtils.upperCase("gradle kotlin dsl"));
    }
}`,
      result: `$ ./gradlew run
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :run
GRADLE KOTLIN DSL

BUILD SUCCESSFUL in 3s
2 actionable tasks: 2 executed`,
      explanation: 'Kotlin DSL needs double quotes and brackets: implementation("..."). The application plugin adds the run task and mainClass. platform(...) imports the JUnit BOM so the junit-jupiter version is managed. Running again without changes would print UP-TO-DATE for compileJava.',
    },
    {
      title: 'Custom Tasks, dependsOn and the Task Graph',
      scenario: 'Add a task that prints build info before every build, and a copy task that copies the JAR to a deploy folder.',
      steps: [
        'Open build.gradle and add the code at the end',
        'Run ./gradlew tasks --group custom to see your tasks',
        'Run ./gradlew build and watch buildInfo run first',
        'Run ./gradlew copyJar',
      ],
      code: `tasks.register('buildInfo') {
    group = 'custom'
    description = 'Prints project info'
    doLast {
        println "Project : \${project.name}"
        println "Version : \${project.version}"
        println "Java    : \${System.getProperty('java.version')}"
    }
}

tasks.named('compileJava') {
    dependsOn 'buildInfo'
}

tasks.register('copyJar', Copy) {
    group = 'custom'
    dependsOn 'jar'
    from layout.buildDirectory.dir('libs')
    into layout.projectDirectory.dir('deploy')
}`,
      result: `$ ./gradlew copyJar
> Task :buildInfo
Project : student-app
Version : 1.0.0
Java    : 17.0.11
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :jar
> Task :copyJar

BUILD SUCCESSFUL in 2s
4 actionable tasks: 4 executed`,
      explanation: 'copyJar depends on jar, jar on classes, classes on compileJava, and we made compileJava depend on buildInfo. Gradle resolves this graph and runs each task once. Code in doLast runs in the execution phase; code directly inside the register block runs during configuration.',
    },
    {
      title: 'How Gradle Resolves the Task Graph (runnable simulation)',
      scenario: 'Simulate how gradle build walks dependsOn links and runs every task exactly once.',
      steps: [
        'IntelliJ: File > New > Java Class > Main',
        'Type the code and click Run ▶',
        'Compare with ./gradlew build --dry-run on a real project',
      ],
      code: taskGraphCode,
      java: { files: { 'Main.java': taskGraphCode } },
      result: `> Task :compileJava
> Task :processResources
> Task :classes
> Task :jar
> Task :assemble
> Task :compileTestJava
> Task :test
> Task :check
> Task :build
BUILD SUCCESSFUL - 9 tasks executed`,
      explanation: 'execute() is a depth-first search: dependencies run before the task itself. classes is needed by jar, test and compileTestJava but runs only once because of the done set. This is the DAG idea behind Gradle (the real tool also skips UP-TO-DATE tasks).',
    },
    {
      title: 'Gradle Wrapper and Everyday Commands',
      scenario: 'A new teammate clones your repo with no Gradle installed.',
      steps: [
        'In your project run: gradle wrapper --gradle-version 8.8 (only once, needs a Gradle install or IntelliJ)',
        'Commit gradlew, gradlew.bat and the gradle/wrapper folder',
        'Teammate runs: git clone ... && cd student-app && ./gradlew build',
        'If Linux says Permission denied: chmod +x gradlew',
      ],
      code: `# files to commit
gradlew
gradlew.bat
gradle/wrapper/gradle-wrapper.jar
gradle/wrapper/gradle-wrapper.properties

# gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.8-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

# everyday commands
./gradlew clean build          # full build
./gradlew build -x test        # skip tests
./gradlew test --tests "com.stn.StudentServiceTest"
./gradlew dependencies --configuration runtimeClasspath
./gradlew bootRun              # Spring Boot
./gradlew build --refresh-dependencies`,
      result: `$ ./gradlew build
Downloading https://services.gradle.org/distributions/gradle-8.8-bin.zip
.............10%.............20%....  ...100%
Welcome to Gradle 8.8!
Starting a Gradle Daemon (subsequent builds will be faster)

BUILD SUCCESSFUL in 41s
7 actionable tasks: 7 executed`,
      explanation: 'The first run downloads Gradle 8.8 into ~/.gradle/wrapper and starts the daemon; next runs are fast. Everyone on the team and the CI server use exactly the same Gradle version.',
    },
  ],
  interview: [
    { q: 'What is Gradle?', a: 'An open-source build automation tool that uses a Groovy or Kotlin DSL instead of XML. It manages dependencies from Maven/other repositories, compiles, tests and packages the project, and is known for speed (incremental builds, build cache, daemon).', level: 'Easy' },
    { q: 'Difference between implementation and api?', a: 'Both are on the compile and runtime classpath of the module. With api, the dependency is also exposed on the compile classpath of modules that depend on yours; implementation hides it, which reduces recompilation and leaks. api requires the java-library plugin.', level: 'Hard' },
    { q: 'Map Maven scopes to Gradle configurations.', a: 'compile → implementation (or api), provided → compileOnly, runtime → runtimeOnly, test → testImplementation / testRuntimeOnly. Annotation processors need annotationProcessor.', level: 'Medium' },
    { q: 'What is the Gradle Wrapper and why commit it?', a: 'gradlew scripts + wrapper JAR + properties that download and use a fixed Gradle version. Committing it means every developer and CI uses the same version without installing Gradle.', level: 'Easy' },
    { q: 'What does UP-TO-DATE mean in Gradle output?', a: 'The task inputs and outputs have not changed since the last run, so Gradle skipped it (incremental build).', level: 'Medium' },
    { q: 'Groovy DSL vs Kotlin DSL?', a: 'Groovy (build.gradle) is dynamic and concise; Kotlin (build.gradle.kts) is statically typed, giving IDE autocomplete and compile-time errors, with stricter syntax (double quotes, parentheses). Functionally equivalent.', level: 'Medium' },
    { q: 'What are the build phases of Gradle?', a: 'Initialization (settings.gradle decides which projects take part), Configuration (build scripts are evaluated and the task graph is built), Execution (selected tasks run).', level: 'Hard' },
    { q: 'Maven vs Gradle: which is better?', a: 'Neither is universally better. Maven: XML, convention-driven, simple, widely used in enterprises. Gradle: faster, flexible scripting, default for Android. Choose based on team/project; both use Maven repositories.', level: 'Medium' },
    { q: 'How do you skip tests in Gradle?', a: './gradlew build -x test (exclude the test task).', level: 'Easy' },
    { q: 'Lombok annotations are not working in a Gradle project. Why?', a: 'Lombok was added only as compileOnly (or implementation) without annotationProcessor "org.projectlombok:lombok". Both are needed (and testCompileOnly/testAnnotationProcessor for tests).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a Groovy build.gradle for a Java 17 library with Jackson Databind (implementation), Lombok, MySQL driver (runtime) and JUnit 5.',
      hint: 'compileOnly + annotationProcessor for Lombok; useJUnitPlatform().',
      solution: `plugins {
    id 'java'
}

group = 'com.stn'
version = '1.0.0'

java {
    toolchain { languageVersion = JavaLanguageVersion.of(17) }
}

repositories { mavenCentral() }

dependencies {
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
    compileOnly 'org.projectlombok:lombok:1.18.32'
    annotationProcessor 'org.projectlombok:lombok:1.18.32'
    runtimeOnly 'com.mysql:mysql-connector-j:8.3.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

test {
    useJUnitPlatform()
}`,
    },
    {
      task: 'Convert the previous build file to Kotlin DSL.',
      hint: 'Double quotes, function-call syntax, tasks.test { }.',
      solution: `plugins {
    java
}

group = "com.stn"
version = "1.0.0"

java {
    toolchain { languageVersion.set(JavaLanguageVersion.of(17)) }
}

repositories { mavenCentral() }

dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.1")
    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")
    runtimeOnly("com.mysql:mysql-connector-j:8.3.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}`,
    },
    {
      task: 'Create a custom task "zipSources" of type Zip that zips src/ into build/dist/sources.zip, and a task "release" that depends on build and zipSources.',
      hint: 'tasks.register(name, Zip) with from, archiveFileName, destinationDirectory.',
      solution: `tasks.register('zipSources', Zip) {
    group = 'custom'
    from 'src'
    archiveFileName = 'sources.zip'
    destinationDirectory = layout.buildDirectory.dir('dist')
}

tasks.register('release') {
    group = 'custom'
    dependsOn 'build', 'zipSources'
    doLast { println 'Release ready in build/' }
}

// run: ./gradlew release`,
    },
    {
      task: 'Create a multi-project Gradle build: root "shop" with sub-projects common and service, where service depends on common.',
      hint: 'settings.gradle include, project(":common").',
      solution: `// settings.gradle
rootProject.name = 'shop'
include 'common', 'service'

// build.gradle (root)
subprojects {
    apply plugin: 'java'
    group = 'com.stn.shop'
    version = '1.0.0'
    repositories { mavenCentral() }
    java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }
}

// common/build.gradle
// (nothing extra needed)

// service/build.gradle
dependencies {
    implementation project(':common')
}

// build all: ./gradlew build     build one: ./gradlew :service:build`,
    },
  ],
  quiz: [
    { question: 'Which Gradle configuration is equivalent to Maven provided scope?', options: ['runtimeOnly', 'implementation', 'compileOnly', 'api'], answer: 2, explanation: 'compileOnly is available at compile time but not packaged / not on runtime classpath.' },
    { question: 'Which file pins the Gradle version for the Wrapper?', options: ['gradle-wrapper.properties', 'settings.gradle', 'gradle.properties', 'build.gradle'], answer: 0, explanation: 'distributionUrl in gradle/wrapper/gradle-wrapper.properties.' },
    { question: 'How do you build while skipping tests?', options: ['./gradlew build -DskipTests', './gradlew build -x test', './gradlew build --no-test', './gradlew assemble test'], answer: 1, explanation: '-x excludes a task. (./gradlew assemble also builds without tests.)' },
    { question: 'Where does Gradle put the built JAR by default?', options: ['target/', 'out/', 'dist/', 'build/libs/'], answer: 3, explanation: 'Gradle outputs to build/; JARs go to build/libs.' },
    { question: 'Which is true about Kotlin DSL?', options: ['It only works with Kotlin source code', 'It uses build.gradle.kts and gives type-safe autocomplete', 'It cannot use Maven Central', 'It replaces settings.gradle with pom.xml'], answer: 1, explanation: 'Kotlin DSL is for the build script; the project can be pure Java.' },
  ],
};
