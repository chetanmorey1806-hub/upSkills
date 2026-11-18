const gavCode = `public class Main {
    public static void main(String[] args) {
        String groupId = "com.stn";
        String artifactId = "student-app";
        String version = "1.0.0";

        // Maven identifies every artifact by its GAV coordinates
        System.out.println("GAV: " + groupId + ":" + artifactId + ":" + version);

        // This is how Maven builds the folder path inside ~/.m2/repository
        String path = groupId.replace('.', '/') + "/" + artifactId + "/" + version
                + "/" + artifactId + "-" + version + ".jar";
        System.out.println("Local repo path: ~/.m2/repository/" + path);
    }
}`;

const lifecycleCode = `public class Main {
    static String[] phases = {"validate", "compile", "test", "package", "verify", "install", "deploy"};

    static void run(String target) {
        System.out.println("mvn " + target + " runs:");
        for (String p : phases) {
            System.out.println("  -> " + p);
            if (p.equals(target)) {
                break;          // Maven stops at the phase you asked for
            }
        }
    }

    public static void main(String[] args) {
        run("package");
        run("validate");
    }
}`;

export default {
  id: 'day-01-maven-deep-dive',
  title: 'Maven Deep Dive: pom.xml, Dependencies, Lifecycle, Plugins and Multi-module Projects',
  module: 'Module 1: Build Tools, Git & Libraries',
  day: 1,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Understand Maven completely: the pom.xml, GAV coordinates, dependency scopes and transitive dependencies, the build lifecycle, plugins, multi-module projects, settings.xml and how local/central repositories work.',
  objectives: [
    'Read and write a complete pom.xml with GAV, properties, dependencies and plugins',
    'Choose the right dependency scope and resolve transitive dependency conflicts',
    'Explain the Maven lifecycle phases and what each mvn command does',
    'Create a multi-module (parent + child) project',
    'Configure settings.xml and understand local, central and remote repositories',
  ],
  theory: [
    {
      heading: '1. What is Maven and Why Do We Need It?',
      content: 'Without Maven you download JAR files by hand, copy them into a lib folder, set the classpath and compile with long javac commands. Maven is a build and dependency management tool. You describe your project in ONE file (pom.xml = Project Object Model) and Maven downloads libraries, compiles, runs tests and creates the JAR/WAR. Analogy: pom.xml is a shopping list + recipe. You write "I need spring-boot 3.3 and JUnit 5" and Maven goes to the market (Maven Central), buys them, keeps them in your kitchen cupboard (~/.m2) and cooks the final dish (JAR).',
      points: [
        'Convention over configuration: source in src/main/java, tests in src/test/java, resources in src/main/resources, output in target/',
        'Dependency management: downloads JARs and their dependencies automatically',
        'Standard lifecycle: the same commands (mvn clean install) work for every project',
        'Plugins do the real work (compiler plugin, surefire for tests, jar plugin)',
        'Every IDE understands Maven: IntelliJ, Eclipse, VS Code, STS',
      ],
      syntax: `student-app/
 ├── pom.xml
 ├── src/main/java/com/stn/App.java
 ├── src/main/resources/application.properties
 ├── src/test/java/com/stn/AppTest.java
 └── target/              (generated: classes, test reports, student-app-1.0.0.jar)`,
    },
    {
      heading: '2. pom.xml and GAV Coordinates',
      content: 'Every Maven artifact (your project or a library) is identified by GAV: groupId (company / reverse domain, e.g. com.stn), artifactId (project name, e.g. student-app) and version (1.0.0 or 1.0.0-SNAPSHOT). packaging tells the output type (jar, war, pom). properties hold reusable values like the Java version. A SNAPSHOT version means "still in development, may change"; a release version (1.0.0) must never change once published.',
      syntax: `<project xmlns="http://maven.apache.org/POM/4.0.0" ...>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.stn</groupId>
  <artifactId>student-app</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>jar</packaging>
  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
</project>`,
      tip: 'Use properties like <junit.version>5.10.2</junit.version> and refer to them as \${junit.version} so you update a version in one place.',
    },
    {
      heading: '3. Dependencies, Scopes and Transitive Dependencies',
      content: 'A dependency is a library your code needs. Its scope decides WHEN it is on the classpath. If you depend on A and A depends on B, Maven also downloads B: this is a transitive dependency. When two versions of the same library come in, Maven uses "nearest definition wins" (shortest path in the tree; if equal, the first declared). You can exclude unwanted transitive JARs with <exclusions> and fix versions centrally with <dependencyManagement>.',
      points: [
        'compile (default) – needed to compile and run; included in the final package',
        'provided – needed to compile but the server provides it at runtime (jakarta.servlet-api on Tomcat, Lombok)',
        'runtime – not needed to compile, needed to run (MySQL JDBC driver)',
        'test – only for src/test (JUnit, Mockito); never in the final JAR',
        'system – a JAR from a local path (avoid); import – used only inside dependencyManagement to import a BOM',
        'mvn dependency:tree shows the full tree including transitive dependencies',
        'dependencyManagement only DECLARES versions; it does not add the dependency. A BOM (like spring-boot-dependencies) is a pom full of managed versions',
      ],
      syntax: `<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>8.3.0</version>
  <scope>runtime</scope>
  <exclusions>
    <exclusion>
      <groupId>com.google.protobuf</groupId>
      <artifactId>protobuf-java</artifactId>
    </exclusion>
  </exclusions>
</dependency>`,
    },
    {
      heading: '4. Build Lifecycle, Phases and Goals',
      content: 'Maven has three built-in lifecycles: clean (removes target/), default (builds) and site (documentation). The default lifecycle is an ordered list of phases. When you run a phase, Maven runs ALL earlier phases first. So mvn install = validate + compile + test + package + verify + install. A goal is a single task of a plugin (compiler:compile, surefire:test); phases are bound to goals.',
      points: [
        'validate – checks the pom is correct',
        'compile – compiles src/main/java into target/classes',
        'test – runs unit tests with the Surefire plugin',
        'package – creates the JAR/WAR in target/',
        'verify – runs integration test checks (Failsafe)',
        'install – copies the JAR into your local repository ~/.m2/repository so other local projects can use it',
        'deploy – uploads the JAR to a remote repository (Nexus/Artifactory) for the team',
        'Useful flags: -DskipTests (skip running tests), -Dmaven.test.skip=true (skip compiling tests too), -U (force update snapshots), -o (offline), -pl module -am (build one module)',
      ],
      syntax: `mvn clean            # delete target/
mvn compile          # validate + compile
mvn test             # ... + test
mvn clean package    # fresh build -> target/student-app-1.0.0.jar
mvn clean install -DskipTests`,
    },
    {
      heading: '5. Plugins',
      content: 'Maven itself is a small engine; plugins do the work. Common ones: maven-compiler-plugin (javac), maven-surefire-plugin (unit tests), maven-jar-plugin (JAR with manifest), maven-shade-plugin / maven-assembly-plugin (fat JAR with all dependencies), spring-boot-maven-plugin (executable Spring Boot JAR), maven-war-plugin (WAR files). You configure plugins inside <build><plugins>. <pluginManagement> in a parent declares plugin versions/config without activating them.',
      syntax: `<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-jar-plugin</artifactId>
      <version>3.4.1</version>
      <configuration>
        <archive>
          <manifest><mainClass>com.stn.App</mainClass></manifest>
        </archive>
      </configuration>
    </plugin>
  </plugins>
</build>`,
    },
    {
      heading: '6. Multi-module Projects',
      content: 'Big projects are split into modules: common (DTOs, utilities), service (business logic), web (REST controllers). A parent pom with packaging pom lists the <modules> and shares versions with dependencyManagement and pluginManagement. Each child has a <parent> section and can depend on a sibling module. Running mvn install on the parent builds all modules in the correct order (Maven calculates the "reactor" build order from dependencies).',
      syntax: `shop-parent/
 ├── pom.xml            (packaging = pom, <modules>)
 ├── shop-common/pom.xml
 ├── shop-service/pom.xml   (depends on shop-common)
 └── shop-web/pom.xml       (depends on shop-service)`,
      tip: 'Spring Boot projects use spring-boot-starter-parent as their parent: that is why you do not write versions for Spring dependencies.',
    },
    {
      heading: '7. Repositories and settings.xml',
      content: 'Maven searches for a JAR in this order: local repository (~/.m2/repository on your laptop) → remote repositories configured (company Nexus/Artifactory, mirrors) → Maven Central (https://repo.maven.apache.org/maven2). Once downloaded, the JAR stays in the local repo, so the next build works offline. settings.xml (in ~/.m2/settings.xml for the user or MAVEN_HOME/conf/settings.xml globally) holds machine-specific things that must NOT go in pom.xml: passwords for deploy servers, mirrors, proxy, local repo path, profiles.',
      points: [
        'Diagram: your project → ~/.m2/repository (cache) → company mirror → Maven Central',
        'Corrupt download? Delete that folder inside ~/.m2/repository and build again (or use -U)',
        'Never commit passwords in pom.xml; put them in settings.xml <servers>',
        'Maven Wrapper (mvnw / mvnw.cmd) lets a project use a fixed Maven version without installing Maven',
      ],
    },
  ],
  examples: [
    {
      title: 'A Complete pom.xml for a Java 17 Console App',
      scenario: 'Create a Maven project in IntelliJ / Eclipse that uses Apache Commons Lang, JUnit 5 for tests, and builds a runnable JAR.',
      steps: [
        'IntelliJ: File > New > Project > Maven Archetype (or Java with Build system = Maven) > GroupId com.stn, ArtifactId student-app > Create',
        'Eclipse: File > New > Maven Project > Create a simple project > enter Group Id and Artifact Id > Finish',
        'Replace pom.xml with the code below and click the "Load Maven Changes" (M) icon in IntelliJ, or right-click project > Maven > Update Project in Eclipse',
        'Open a terminal in the project folder and run: mvn clean package',
        'Run the JAR: java -jar target/student-app-1.0.0.jar',
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.stn</groupId>
  <artifactId>student-app</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.10.2</junit.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.apache.commons</groupId>
      <artifactId>commons-lang3</artifactId>
      <version>3.14.0</version>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>\${junit.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.5.2</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals><goal>shade</goal></goals>
            <configuration>
              <transformers>
                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>com.stn.App</mainClass>
                </transformer>
              </transformers>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>

// src/main/java/com/stn/App.java
package com.stn;

import org.apache.commons.lang3.StringUtils;

public class App {
    public static void main(String[] args) {
        System.out.println(StringUtils.capitalize("hello maven"));
        System.out.println(StringUtils.reverse("java"));
    }
}`,
      result: `[INFO] --- maven-compiler-plugin:3.13.0:compile (default-compile) @ student-app ---
[INFO] --- maven-surefire-plugin:3.2.5:test (default-test) @ student-app ---
[INFO] --- maven-jar-plugin:3.4.1:jar (default-jar) @ student-app ---
[INFO] --- maven-shade-plugin:3.5.2:shade (default) @ student-app ---
[INFO] BUILD SUCCESS

$ java -jar target/student-app-1.0.0.jar
Hello maven
avaj`,
      explanation: 'The compiler plugin compiles with Java 17, surefire runs tests, the jar plugin creates the JAR and the shade plugin (bound to the package phase) merges commons-lang3 into it and sets Main-Class in the manifest, so java -jar works. JUnit has test scope, so it is NOT inside the final JAR.',
    },
    {
      title: 'GAV Coordinates and the Local Repository Path (runnable)',
      scenario: 'Understand how Maven converts GAV into a folder inside ~/.m2/repository.',
      steps: [
        'IntelliJ: File > New > Java Class > Main (default package)',
        'Type the code and click Run ▶',
        'Then open your own ~/.m2/repository folder (C:\\Users\\you\\.m2\\repository on Windows) and find org/apache/commons/commons-lang3/3.14.0',
      ],
      code: gavCode,
      java: { files: { 'Main.java': gavCode } },
      result: `GAV: com.stn:student-app:1.0.0
Local repo path: ~/.m2/repository/com/stn/student-app/1.0.0/student-app-1.0.0.jar`,
      explanation: 'groupId dots become folders (com.stn → com/stn), then artifactId folder, then version folder, and the file name is artifactId-version.jar. mvn install copies your JAR exactly to this path so other projects on the same machine can depend on it.',
    },
    {
      title: 'Phases Run in Order (runnable simulation)',
      scenario: 'Show that running one phase runs every earlier phase of the default lifecycle.',
      steps: [
        'Create Main.java in IntelliJ or Eclipse',
        'Type the code and click Run ▶',
        'Compare with the real Maven output of mvn package in the terminal',
      ],
      code: lifecycleCode,
      java: { files: { 'Main.java': lifecycleCode } },
      result: `mvn package runs:
  -> validate
  -> compile
  -> test
  -> package
mvn validate runs:
  -> validate`,
      explanation: 'The loop prints each phase and stops when it reaches the target, exactly like Maven. That is why mvn package also runs the tests (and why -DskipTests exists). install and deploy are not run by package.',
    },
    {
      title: 'Dependency Scopes, Tree and Exclusions',
      scenario: 'A web app needs Spring Web (compile), servlet API (provided), MySQL driver (runtime) and JUnit (test). See the transitive dependencies.',
      steps: [
        'Add the dependencies below to pom.xml and reload Maven',
        'Run in terminal: mvn dependency:tree',
        'IntelliJ: open the Maven tool window > Dependencies node to see the same tree; Eclipse: open pom.xml > Dependency Hierarchy tab',
      ],
      code: `<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.6</version>
  </dependency>
  <dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
  </dependency>
  <dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
  </dependency>
</dependencies>`,
      result: `[INFO] com.stn:student-web:war:1.0.0
[INFO] +- org.springframework:spring-webmvc:jar:6.1.6:compile
[INFO] |  +- org.springframework:spring-aop:jar:6.1.6:compile
[INFO] |  +- org.springframework:spring-beans:jar:6.1.6:compile
[INFO] |  +- org.springframework:spring-context:jar:6.1.6:compile
[INFO] |  +- org.springframework:spring-core:jar:6.1.6:compile
[INFO] |  |  \\- org.springframework:spring-jcl:jar:6.1.6:compile
[INFO] |  +- org.springframework:spring-expression:jar:6.1.6:compile
[INFO] |  \\- org.springframework:spring-web:jar:6.1.6:compile
[INFO] +- jakarta.servlet:jakarta.servlet-api:jar:6.0.0:provided
[INFO] +- com.mysql:mysql-connector-j:jar:8.3.0:runtime
[INFO] |  \\- com.google.protobuf:protobuf-java:jar:3.25.1:runtime
[INFO] \\- org.junit.jupiter:junit-jupiter:jar:5.10.2:test
[INFO]    +- org.junit.jupiter:junit-jupiter-api:jar:5.10.2:test
[INFO]    +- org.junit.jupiter:junit-jupiter-params:jar:5.10.2:test
[INFO]    \\- org.junit.jupiter:junit-jupiter-engine:jar:5.10.2:test`,
      explanation: 'We declared 4 dependencies but Maven pulled many more (transitive). The scope is inherited: protobuf comes through a runtime dependency, so it is runtime too. If you do not need protobuf, add an <exclusion> for it inside the mysql dependency. The servlet API is provided because Tomcat already has it; packaging it in the WAR can cause conflicts.',
    },
    {
      title: 'Multi-module Project (Parent + Children)',
      scenario: 'Split a shop application into shop-common and shop-service modules managed by one parent.',
      steps: [
        'IntelliJ: create a Maven project shop-parent, delete its src folder, set packaging to pom',
        'Right-click shop-parent > New > Module > Maven > shop-common (IntelliJ adds it to <modules> automatically). Repeat for shop-service',
        'Eclipse: File > New > Other > Maven > Maven Module > choose parent project shop-parent',
        'Write the three pom files below',
        'Run mvn clean install in the shop-parent folder',
      ],
      code: `<!-- shop-parent/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.stn.shop</groupId>
  <artifactId>shop-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>

  <modules>
    <module>shop-common</module>
    <module>shop-service</module>
  </modules>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.2</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
</project>

<!-- shop-common/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.stn.shop</groupId>
    <artifactId>shop-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>shop-common</artifactId>
</project>

<!-- shop-service/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.stn.shop</groupId>
    <artifactId>shop-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>shop-service</artifactId>

  <dependencies>
    <dependency>
      <groupId>com.stn.shop</groupId>
      <artifactId>shop-common</artifactId>
      <version>\${project.version}</version>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>   <!-- version comes from parent dependencyManagement -->
    </dependency>
  </dependencies>
</project>`,
      result: `[INFO] Reactor Build Order:
[INFO]
[INFO] shop-parent                                                        [pom]
[INFO] shop-common                                                        [jar]
[INFO] shop-service                                                       [jar]
...
[INFO] Reactor Summary for shop-parent 1.0.0:
[INFO]
[INFO] shop-parent ........................................ SUCCESS [  0.210 s]
[INFO] shop-common ........................................ SUCCESS [  1.402 s]
[INFO] shop-service ....................................... SUCCESS [  0.988 s]
[INFO] BUILD SUCCESS`,
      explanation: 'The children inherit groupId, version, Java release and managed versions from the parent. Maven reads the inter-module dependency and builds shop-common before shop-service (reactor order). To build only shop-service and what it needs: mvn -pl shop-service -am install.',
    },
    {
      title: 'settings.xml with Mirror, Server Credentials and Proxy',
      scenario: 'Your company uses a Nexus repository and an office proxy. Configure Maven without putting secrets in pom.xml.',
      steps: [
        'Create or open ~/.m2/settings.xml (Windows: C:\\Users\\<you>\\.m2\\settings.xml)',
        'Paste the code and change the URLs/usernames',
        'IntelliJ: Settings > Build, Execution, Deployment > Build Tools > Maven > User settings file (check the path)',
        'Eclipse: Window > Preferences > Maven > User Settings > Update Settings',
        'In pom.xml add <distributionManagement> with the same server id, then run mvn deploy',
      ],
      code: `<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0">
  <localRepository>D:/maven-repo</localRepository>

  <mirrors>
    <mirror>
      <id>company-nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>https://nexus.company.com/repository/maven-public/</url>
    </mirror>
  </mirrors>

  <servers>
    <server>
      <id>company-releases</id>
      <username>chetan</username>
      <password>secret-token</password>
    </server>
  </servers>

  <proxies>
    <proxy>
      <id>office</id>
      <active>true</active>
      <protocol>https</protocol>
      <host>proxy.company.com</host>
      <port>8080</port>
    </proxy>
  </proxies>
</settings>

<!-- in pom.xml -->
<distributionManagement>
  <repository>
    <id>company-releases</id>
    <url>https://nexus.company.com/repository/maven-releases/</url>
  </repository>
</distributionManagement>`,
      result: `$ mvn deploy
[INFO] Downloading from company-nexus: https://nexus.company.com/repository/maven-public/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.pom
...
[INFO] --- maven-deploy-plugin:3.1.1:deploy (default-deploy) @ student-app ---
[INFO] Uploading to company-releases: https://nexus.company.com/repository/maven-releases/com/stn/student-app/1.0.0/student-app-1.0.0.jar
[INFO] BUILD SUCCESS`,
      explanation: 'mirrorOf * sends ALL downloads through Nexus instead of directly to Maven Central. The <server> id must match the <repository> id in distributionManagement so Maven knows which credentials to use. localRepository moves the cache to D: drive. None of these secrets go into Git.',
    },
  ],
  interview: [
    { q: 'What is Maven and what problems does it solve?', a: 'Maven is a build automation and dependency management tool for Java. It downloads libraries and their transitive dependencies, follows a standard folder structure, and provides a standard lifecycle (compile, test, package, install, deploy) so every project builds the same way with simple commands.', level: 'Easy' },
    { q: 'What is GAV?', a: 'groupId, artifactId and version: the three coordinates that uniquely identify an artifact in a repository. Example: org.springframework:spring-core:6.1.6.', level: 'Easy' },
    { q: 'Explain the dependency scopes.', a: 'compile (default, everywhere and packaged), provided (compile time only, server provides at runtime, e.g. servlet-api), runtime (only at runtime, e.g. JDBC driver), test (only test compile and run, e.g. JUnit), system (local JAR path, deprecated style), import (only in dependencyManagement to import a BOM).', level: 'Medium' },
    { q: 'What is a transitive dependency and how does Maven resolve version conflicts?', a: 'A dependency of your dependency. If two versions of the same artifact appear, Maven picks the nearest one in the tree (shortest path); if the depth is equal, the first declared wins. You can force a version with dependencyManagement or a direct declaration, and remove one with <exclusions>.', level: 'Medium' },
    { q: 'Difference between dependencies and dependencyManagement?', a: '<dependencies> actually adds the libraries to the project. <dependencyManagement> only defines versions/scopes so child modules can declare the dependency without a version. It adds nothing by itself.', level: 'Medium' },
    { q: 'What happens when you run mvn install?', a: 'Maven runs all default lifecycle phases up to install: validate, compile, test, package, verify, install. The packaged JAR is copied into the local repository (~/.m2/repository) so other local projects can use it.', level: 'Easy' },
    { q: 'Difference between mvn install and mvn deploy?', a: 'install copies the artifact into your local repository only (your machine). deploy runs install too and then uploads it to a remote repository (Nexus/Artifactory) configured in distributionManagement, so the whole team can use it.', level: 'Easy' },
    { q: 'Phase vs goal vs plugin?', a: 'A plugin is a collection of goals (maven-compiler-plugin). A goal is one task (compiler:compile). A phase is a step in the lifecycle (compile) to which goals are bound. Running a phase runs all its bound goals and all earlier phases.', level: 'Medium' },
    { q: 'What is the difference between -DskipTests and -Dmaven.test.skip=true?', a: '-DskipTests compiles the test classes but does not run them. -Dmaven.test.skip=true skips both compiling and running tests.', level: 'Medium' },
    { q: 'What is a SNAPSHOT version?', a: 'A development version like 1.0.0-SNAPSHOT that can change. Maven checks remote repos for newer snapshots (daily by default, or always with -U). Release versions are immutable.', level: 'Easy' },
    { q: 'What is settings.xml used for and where is it?', a: 'Machine/user-level configuration: local repository path, mirrors, proxies, server credentials and profiles. Global: MAVEN_HOME/conf/settings.xml, user: ~/.m2/settings.xml (user overrides global). Credentials belong here, not in pom.xml.', level: 'Medium' },
    { q: 'How do you create an executable fat JAR with Maven?', a: 'Use maven-shade-plugin or maven-assembly-plugin (jar-with-dependencies) with Main-Class in the manifest, or spring-boot-maven-plugin for Spring Boot apps. A normal maven-jar-plugin JAR does not contain dependencies.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a pom.xml for a JDBC console project "library-app" (groupId com.stn) with Java 17, MySQL driver as runtime dependency, and JUnit 5 as test dependency. Use a property for the JUnit version.',
      hint: 'maven.compiler.release, <scope>runtime</scope>, <scope>test</scope>, \${junit.version}.',
      solution: `<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.stn</groupId>
  <artifactId>library-app</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.10.2</junit.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <version>8.3.0</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>\${junit.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>`,
    },
    {
      task: 'Exclude commons-logging from spring-context 5.3.x and add jcl-over-slf4j instead. Show the dependency block.',
      hint: 'Use <exclusions> inside the spring-context dependency.',
      solution: `<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-context</artifactId>
  <version>5.3.33</version>
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>jcl-over-slf4j</artifactId>
  <version>2.0.13</version>
</dependency>

<!-- verify with: mvn dependency:tree -Dincludes=commons-logging  (should print nothing) -->`,
    },
    {
      task: 'Write the commands to: (a) clean and build without running tests, (b) run only the test class StudentServiceTest, (c) force-update snapshots, (d) build only module shop-web and the modules it depends on, (e) list available updates for dependencies.',
      hint: 'Flags -DskipTests, -Dtest=, -U, -pl -am, versions plugin.',
      solution: `mvn clean package -DskipTests              # (a)
mvn test -Dtest=StudentServiceTest         # (b)
mvn clean install -U                        # (c)
mvn -pl shop-web -am clean install          # (d)
mvn versions:display-dependency-updates     # (e)`,
    },
    {
      task: 'Write a Java program that, given a target phase name, prints how many default lifecycle phases Maven will execute (validate, compile, test, package, verify, install, deploy). For "install" it should print "install executes 6 phases".',
      hint: 'Loop through the array, count until the phase matches.',
      solution: `public class Main {
    public static void main(String[] args) {
        String[] phases = {"validate", "compile", "test", "package", "verify", "install", "deploy"};
        String target = "install";
        int count = 0;
        for (String p : phases) {
            count++;
            if (p.equals(target)) break;
        }
        System.out.println(target + " executes " + count + " phases");
    }
}
// Output: install executes 6 phases`,
    },
    {
      task: 'Create a parent pom "bank-parent" with modules bank-model and bank-api, where bank-api depends on bank-model. Manage the Lombok version (1.18.32, provided scope) in the parent.',
      hint: 'packaging pom, <modules>, <dependencyManagement>, child <parent>.',
      solution: `<!-- bank-parent/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.stn.bank</groupId>
  <artifactId>bank-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>bank-model</module>
    <module>bank-api</module>
  </modules>
  <properties>
    <maven.compiler.release>17</maven.compiler.release>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.32</version>
        <scope>provided</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
</project>

<!-- bank-model/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.stn.bank</groupId>
    <artifactId>bank-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>bank-model</artifactId>
  <dependencies>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
    </dependency>
  </dependencies>
</project>

<!-- bank-api/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.stn.bank</groupId>
    <artifactId>bank-parent</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>bank-api</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.stn.bank</groupId>
      <artifactId>bank-model</artifactId>
      <version>\${project.version}</version>
    </dependency>
  </dependencies>
</project>`,
    },
  ],
  quiz: [
    { question: 'Which scope should the MySQL JDBC driver usually have?', options: ['compile', 'runtime', 'test', 'provided'], answer: 1, explanation: 'Code uses only java.sql interfaces at compile time; the driver is needed only when the program runs.' },
    { question: 'Which command copies your JAR into ~/.m2/repository?', options: ['mvn package', 'mvn compile', 'mvn deploy only', 'mvn install'], answer: 3, explanation: 'install puts the artifact into the local repository. (deploy also runs install, but its purpose is uploading to a remote repository.)' },
    { question: 'What does <dependencyManagement> do?', options: ['Declares versions without adding dependencies', 'Downloads all dependencies immediately', 'Removes transitive dependencies', 'Configures plugins'], answer: 0, explanation: 'It only manages versions/scopes; children still need to declare the dependency.' },
    { question: 'Running mvn package will also run which phase?', options: ['install', 'deploy', 'test', 'clean'], answer: 2, explanation: 'All earlier phases of the default lifecycle run: validate, compile, test. clean belongs to a different lifecycle.' },
    { question: 'Where should repository passwords be stored?', options: ['pom.xml', 'application.properties', 'README.md', 'settings.xml'], answer: 3, explanation: 'settings.xml <servers> is machine-specific and not committed to Git.' },
  ],
};
