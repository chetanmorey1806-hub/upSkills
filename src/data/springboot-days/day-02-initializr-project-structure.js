export default {
  id: 'day-02-initializr-project-structure',
  title: 'Spring Initializr, Project Structure, Maven, Running in IntelliJ and Eclipse (STS)',
  module: 'Module 1: Spring Boot Basics',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Generate a Spring Boot 3 project with Spring Initializr (web and IDE), understand every folder and file in it, learn the Maven commands and pom.xml, and run the app from IntelliJ IDEA, Eclipse/STS and the command line.',
  objectives: [
    'Generate a project using start.spring.io, IntelliJ IDEA and Spring Tool Suite',
    'Explain the purpose of each folder and file in a Spring Boot project',
    'Read and modify pom.xml: parent, properties, dependencies and the Boot Maven plugin',
    'Run the app from the IDE, with mvnw spring-boot:run and as an executable JAR',
    'Fix common setup problems (wrong JDK, Maven not imported, port in use)',
  ],
  theory: [
    {
      heading: 'Spring Initializr',
      content:
        'Spring Initializr (https://start.spring.io) is an online project generator. You choose build tool, language, Boot version, project metadata and dependencies, and it gives you a ready ZIP with a correct pom.xml, main class, test class and Maven Wrapper.\n\nAnalogy: it is like a "pizza builder" on a food app: choose base (Maven), size (Java 17), toppings (Web, JPA, MySQL) and it delivers a ready pizza.\n\nThe same generator is built into IntelliJ IDEA Ultimate (New Project > Spring Boot), IntelliJ Community (via the free "Spring Boot Helper" plugin or just use the website), and Eclipse STS (File > New > Spring Starter Project).',
      points: [
        'Project: Maven (we use Maven in this course)',
        'Language: Java',
        'Spring Boot: choose the latest stable 3.x (avoid SNAPSHOT/M versions)',
        'Group: reverse domain, e.g. com.example; Artifact: project name, e.g. student-api',
        'Package name: com.example.studentapi (auto-generated from group + artifact)',
        'Packaging: Jar (embedded server). Java: 17 or 21',
        'Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Validation, Lombok, DevTools as needed',
      ],
    },
    {
      heading: 'Project Structure Explained',
      content:
        'Folder tree in words:\nstudent-api/\n  pom.xml                         -> Maven build file (dependencies, plugins)\n  mvnw, mvnw.cmd, .mvn/           -> Maven Wrapper: run Maven without installing it\n  src/main/java/com/example/studentapi/\n      StudentApiApplication.java  -> main class with @SpringBootApplication\n      controller/ service/ repository/ entity/ dto/  -> your packages (create them)\n  src/main/resources/\n      application.properties      -> configuration\n      static/                     -> static files (HTML, CSS, JS, images) served as-is\n      templates/                  -> server-side templates (Thymeleaf)\n  src/test/java/.../StudentApiApplicationTests.java -> test that the context loads\n  target/                         -> build output (compiled classes, final JAR); never edit',
      points: [
        'Keep all your packages UNDER the main class package so component scan finds them',
        'resources folder is on the classpath; files there can be read with classpath: prefix',
        'target/ and .idea/ should be in .gitignore (Initializr creates one)',
        'HELP.md is just a generated help file, safe to delete',
      ],
    },
    {
      heading: 'Maven and pom.xml',
      content:
        'Maven is a build and dependency management tool. pom.xml (Project Object Model) describes the project. When you add a dependency, Maven downloads it (and its own dependencies, called transitive dependencies) from Maven Central into ~/.m2/repository.\n\nKey sections:\n- <parent> spring-boot-starter-parent: inherits versions and plugin defaults\n- <properties><java.version>17</java.version>: Java level\n- <dependencies>: starters and libraries (no versions needed for Boot-managed ones)\n- <build><plugins> spring-boot-maven-plugin: creates an executable "fat JAR" and provides spring-boot:run\n\nMaven lifecycle (most used): clean -> compile -> test -> package -> install.',
      syntax: './mvnw clean package          # build target/student-api-0.0.1-SNAPSHOT.jar\n./mvnw spring-boot:run         # run without building a jar\njava -jar target/student-api-0.0.1-SNAPSHOT.jar\n./mvnw clean package -DskipTests   # skip tests\n(on Windows use mvnw.cmd instead of ./mvnw)',
      points: [
        'Dependency scope: compile (default), runtime (e.g. MySQL driver), test (JUnit), provided',
        'optional=true is used for Lombok and DevTools so they are not passed to other projects',
        'After editing pom.xml: IntelliJ -> click the Maven "Load Maven Changes" icon (or Ctrl+Shift+O); Eclipse -> right-click project > Maven > Update Project (Alt+F5)',
      ],
    },
    {
      heading: 'Running in IntelliJ IDEA and Eclipse/STS',
      content:
        'IntelliJ IDEA:\n1. File > Open > choose the folder containing pom.xml > Open as Project > Trust.\n2. File > Project Structure > Project > SDK = 17 (download one from the dropdown if needed).\n3. Wait for indexing and Maven import (progress bar at bottom).\n4. Open the main class and click the green ▶ gutter icon > Run. Stop with the red ■ button.\n\nEclipse / Spring Tool Suite (STS):\n1. Install STS from spring.io/tools (or Eclipse Marketplace > "Spring Tools 4").\n2. File > Import > Maven > Existing Maven Projects > Root Directory = project folder > Finish. OR File > New > Spring Starter Project to generate directly.\n3. Window > Preferences > Java > Installed JREs > add JDK 17 and tick it.\n4. Right-click project > Run As > Spring Boot App. The Boot Dashboard view (Window > Show View > Other > Boot Dashboard) lets you start/stop/restart apps.',
      tip: 'If you see "release version 17 not supported", your IDE is using an older JDK. Fix the project SDK / installed JRE to 17.',
    },
    {
      heading: 'Common Setup Mistakes',
      content: 'Most first-day problems are setup problems, not code problems.',
      points: [
        'Web server failed to start. Port 8080 was already in use -> stop the other app or set server.port=8081',
        'Red imports everywhere -> Maven not imported; reload Maven project / Update Project',
        'Whitelabel Error Page 404 -> wrong URL or controller outside the main package',
        'Opening the parent folder instead of the folder with pom.xml -> IDE does not recognise the project',
        'Corporate proxy blocks Maven downloads -> configure proxy in ~/.m2/settings.xml',
      ],
    },
  ],
  examples: [
    {
      title: 'Generate and Run a Project from Spring Initializr',
      scenario: 'Create a student-api project with Spring Web and DevTools and run it from IntelliJ and STS.',
      steps: [
        'Go to start.spring.io; select Maven, Java, Spring Boot 3.3.x',
        'Group: com.example, Artifact: student-api, Packaging: Jar, Java: 17',
        'ADD DEPENDENCIES: Spring Web, Spring Boot DevTools > GENERATE',
        'Unzip; IntelliJ: File > Open > student-api > Trust Project',
        'STS: File > Import > Existing Maven Projects > student-api > Finish',
        'Run StudentApiApplication (IntelliJ: green ▶; STS: Run As > Spring Boot App)',
        'Check the console for "Tomcat started on port 8080"',
      ],
      code: `// ===== pom.xml (generated) =====
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>student-api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>student-api</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

// ===== src/main/java/com/example/studentapi/StudentApiApplication.java =====
package com.example.studentapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentApiApplication.class, args);
    }
}

// ===== src/test/java/com/example/studentapi/StudentApiApplicationTests.java =====
package com.example.studentapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class StudentApiApplicationTests {
    @Test
    void contextLoads() {
    }
}`,
      result: `  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.3.4)

Starting StudentApiApplication using Java 17.0.10
Tomcat initialized with port 8080 (http)
Tomcat started on port 8080 (http) with context path '/'
Started StudentApiApplication in 2.134 seconds`,
      explanation: 'The banner and "Tomcat started" lines confirm the app is up. Opening http://localhost:8080 now shows a Whitelabel Error Page (404) because we have no endpoints yet; that is expected and proves the server is running.',
    },
    {
      title: 'Organising Packages (Layered Structure) and a Status Endpoint',
      scenario: 'Create the standard packages and a controller in the controller sub-package to prove component scanning works for sub-packages.',
      steps: [
        'IntelliJ: right-click com.example.studentapi > New > Package > controller (repeat for service, repository, entity, dto)',
        'STS: right-click src/main/java > New > Package > com.example.studentapi.controller',
        'Create StatusController inside controller package',
        'Run the app and in Postman send GET http://localhost:8080/api/status',
      ],
      code: `// ===== com/example/studentapi/controller/StatusController.java =====
package com.example.studentapi.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("app", "student-api", "status", "UP");
    }
}

// Folder structure now:
// src/main/java/com/example/studentapi/
//   StudentApiApplication.java
//   controller/StatusController.java
//   service/  repository/  entity/  dto/   (empty for now)`,
      result: `GET http://localhost:8080/api/status
Status: 200 OK
{
  "app": "student-api",
  "status": "UP"
}
(Map.of does not guarantee key order, so "status" may appear before "app".)`,
      explanation: 'Because controller is a sub-package of com.example.studentapi, @ComponentScan (inside @SpringBootApplication) finds StatusController automatically. If you placed it in com.other.controller it would NOT be found and you would get 404.',
    },
    {
      title: 'Build and Run as an Executable JAR with the Maven Wrapper',
      scenario: 'Package the project into a fat JAR and run it from a terminal, the way it runs on a server.',
      steps: [
        'Open a terminal in the project folder (IntelliJ: View > Tool Windows > Terminal; STS: right-click project > Show In > Terminal)',
        'Run ./mvnw clean package (Windows: mvnw.cmd clean package)',
        'Alternatively IntelliJ: Maven tool window (right side) > Lifecycle > double-click package; STS: right-click project > Run As > Maven build... > Goals: clean package > Run',
        'Run java -jar target/student-api-0.0.1-SNAPSHOT.jar',
        'Override the port at runtime with --server.port=9090',
      ],
      code: `# Build
./mvnw clean package

# Run the fat jar
java -jar target/student-api-0.0.1-SNAPSHOT.jar

# Run on another port without changing code
java -jar target/student-api-0.0.1-SNAPSHOT.jar --server.port=9090

# Run directly with Maven (no jar)
./mvnw spring-boot:run`,
      result: `[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Building jar: .../target/student-api-0.0.1-SNAPSHOT.jar
[INFO] --- spring-boot:3.3.4:repackage (repackage) @ student-api ---
[INFO] BUILD SUCCESS

$ java -jar target/student-api-0.0.1-SNAPSHOT.jar --server.port=9090
Tomcat started on port 9090 (http) with context path '/'
Started StudentApiApplication in 2.0 seconds`,
      explanation: 'spring-boot-maven-plugin repackages the normal JAR into a "fat JAR" that contains your classes plus all dependency JARs and a launcher. Command-line arguments like --server.port override application.properties.',
    },
  ],
  interview: [
    { q: 'What is Spring Initializr?', a: 'A web tool and API (start.spring.io) that generates a Spring Boot project skeleton with chosen build tool, Java version, Boot version and dependencies. It is also integrated into IntelliJ IDEA, STS and VS Code.', level: 'Easy' },
    { q: 'What is the use of the Maven Wrapper (mvnw)?', a: 'It downloads and uses a fixed Maven version for the project, so anyone can build the project without installing Maven and everyone uses the same Maven version.', level: 'Easy' },
    { q: 'What is a fat JAR / uber JAR?', a: 'An executable JAR that contains the application classes plus all dependency JARs and the Spring Boot loader, so it can be run with java -jar without any external server or classpath setup. It is created by spring-boot-maven-plugin repackage goal.', level: 'Medium' },
    { q: 'What is the difference between src/main/resources/static and templates?', a: 'static holds files served directly (HTML, CSS, JS, images). templates holds server-side templates (e.g. Thymeleaf) that are processed with model data before being sent.', level: 'Easy' },
    { q: 'Why might a controller return 404 even though the code is correct?', a: 'Commonly because the controller class is in a package outside the main application package, so component scanning does not find it. Also wrong URL, wrong HTTP method or a missing context path.', level: 'Medium' },
    { q: 'What does spring-boot-starter-parent give you?', a: 'Managed versions for all Boot-supported dependencies, default compiler level from java.version, UTF-8 encoding, resource filtering and sensible plugin configuration.', level: 'Medium' },
    { q: 'Can you use Spring Boot without the starter parent?', a: 'Yes. Import spring-boot-dependencies as a BOM in <dependencyManagement> with scope import and type pom, and configure spring-boot-maven-plugin yourself. This is used when the project already has a company parent POM.', level: 'Hard' },
    { q: 'What are the ways to run a Spring Boot app?', a: 'Run the main class from the IDE, mvn spring-boot:run, java -jar on the packaged JAR, or as a Docker container. Also as a WAR on an external server if packaged as WAR with SpringBootServletInitializer.', level: 'Easy' },
    { q: 'What is the purpose of the generated contextLoads() test?', a: 'It starts the full Spring application context with @SpringBootTest; if any bean fails to be created or configuration is wrong, the test fails. It is a smoke test.', level: 'Medium' },
    { q: 'What is the difference between mvn package and mvn install?', a: 'package builds the JAR into target/. install additionally copies it to the local repository (~/.m2) so other local projects can use it as a dependency.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Generate a project "library-api" with Spring Web, Validation and DevTools using STS (File > New > Spring Starter Project) and write down the generated pom dependencies.',
      hint: 'In STS the wizard has two pages: metadata and dependencies.',
      solution: `<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>`,
    },
    {
      task: 'Add a static welcome page so that http://localhost:8080/ shows "Welcome to Library API".',
      hint: 'Spring Boot serves src/main/resources/static/index.html as the welcome page.',
      solution: `<!-- src/main/resources/static/index.html -->
<!DOCTYPE html>
<html>
<head><title>Library API</title></head>
<body>
  <h1>Welcome to Library API</h1>
  <p>Try <a href="/api/status">/api/status</a></p>
</body>
</html>`,
    },
    {
      task: 'Create controller, service, repository, entity and dto packages, then add a VersionController in controller that returns {"version":"1.0.0"} at GET /api/version.',
      hint: 'Return Map.of("version", "1.0.0").',
      solution: `package com.example.libraryapi.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class VersionController {

    @GetMapping("/version")
    public Map<String, String> version() {
        return Map.of("version", "1.0.0");
    }
}`,
    },
    {
      task: 'Build the project with tests skipped, then run the JAR on port 8085.',
      hint: '-DskipTests and --server.port.',
      solution: `./mvnw clean package -DskipTests
java -jar target/library-api-0.0.1-SNAPSHOT.jar --server.port=8085
# Console: Tomcat started on port 8085 (http)`,
    },
  ],
  quiz: [
    {
      question: 'Which file defines dependencies in a Maven Spring Boot project?',
      options: ['application.properties', 'pom.xml', 'build.gradle', 'web.xml'],
      answer: 1,
      explanation: 'pom.xml is the Maven Project Object Model.',
    },
    {
      question: 'Where should application.properties be placed?',
      options: ['src/main/java', 'project root', 'src/main/resources', 'target/classes only'],
      answer: 2,
      explanation: 'src/main/resources is on the classpath and Boot reads application.properties from there.',
    },
    {
      question: 'Which plugin creates the executable fat JAR?',
      options: ['spring-boot-maven-plugin', 'maven-war-plugin', 'maven-compiler-plugin', 'maven-surefire-plugin'],
      answer: 0,
      explanation: 'Its repackage goal creates the executable JAR.',
    },
    {
      question: 'In STS, how do you run a Boot app?',
      options: ['Run As > Java Applet', 'Run As > Run on Server only', 'Debug As > JUnit Test', 'Run As > Spring Boot App'],
      answer: 3,
      explanation: 'STS adds the Spring Boot App launch type and the Boot Dashboard.',
    },
    {
      question: 'A controller in package com.other.web is not found by an app whose main class is in com.example.demo. Why?',
      options: ['Controllers must be in the same file', 'Component scanning only covers com.example.demo and its sub-packages', 'Missing web.xml', 'Port is wrong'],
      answer: 1,
      explanation: '@SpringBootApplication scans the package of the main class and below.',
    },
  ],
};
