export default {
  id: 'day-02-hibernate-setup-maven',
  title: 'Hibernate Setup with Maven, hibernate.cfg.xml, First Entity',
  module: 'Module 1: Hibernate Basics',
  day: 2,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Create a Maven project in Eclipse or IntelliJ, add Hibernate 6 and the MySQL driver, write hibernate.cfg.xml, and save your first entity to MySQL while watching the generated SQL.`,
  objectives: [
    `Create a Maven Java project in Eclipse and in IntelliJ IDEA`,
    `Add hibernate-core 6 and mysql-connector-j dependencies to pom.xml`,
    `Write hibernate.cfg.xml with connection, dialect, show_sql and hbm2ddl.auto settings`,
    `Create a first @Entity class and a HibernateUtil helper that builds the SessionFactory`,
    `Run the program and read the generated CREATE TABLE and INSERT statements`,
  ],
  theory: [
    {
      heading: `Why Maven?`,
      content: `Hibernate 6 needs about 15 JAR files (hibernate-core, jakarta.persistence-api, byte-buddy, jboss-logging, antlr, classmate, jaxb ...). Downloading them by hand is error-prone. Maven reads pom.xml, downloads hibernate-core AND all its transitive dependencies from Maven Central into ~/.m2/repository, and puts them on the classpath.

Analogy: pom.xml is a shopping list. You write "hibernate-core 6.4.4" and Maven brings everything that comes in that box.

Standard Maven layout:
  hibernate-demo/
    pom.xml
    src/main/java/          -> Java code (entities, main class)
    src/main/resources/     -> hibernate.cfg.xml, log config
    src/test/java/          -> tests`,
      syntax: `<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>6.4.4.Final</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>`,
      tip: `Hibernate 6 moved its groupId from org.hibernate to org.hibernate.orm. Old tutorials using org.hibernate:hibernate-core:5.x will bring javax.persistence, which does not work with jakarta imports.`,
    },
    {
      heading: `Creating the Project in Eclipse and IntelliJ`,
      content: `Eclipse (Enterprise Java edition or STS):
1. File > New > Other > Maven > Maven Project > Next.
2. Tick "Create a simple project (skip archetype selection)" > Next.
3. Group Id: com.demo, Artifact Id: hibernate-demo, Packaging: jar > Finish.
4. Open pom.xml, add the dependencies and the compiler release 17 property, save.
5. Right-click project > Maven > Update Project (Alt+F5) > OK.
6. Right-click src/main/resources > New > File > hibernate.cfg.xml.

IntelliJ IDEA:
1. File > New > Project > choose "Maven" as Build system (or "Maven Archetype" with quickstart).
2. Name: hibernate-demo, JDK: 17, GroupId com.demo > Create.
3. Paste dependencies into pom.xml, then click the floating "Load Maven Changes" icon (or Maven tool window > Reload All).
4. Right-click src/main/resources > New > File > hibernate.cfg.xml.
5. Run classes with the green ▶ next to main().`,
      points: [
        `If resources folder is missing, create src/main/resources and (Eclipse) mark it as a source folder via Build Path`,
        `Use JDK 17+; Hibernate 6 requires Java 11 minimum`,
      ],
    },
    {
      heading: `hibernate.cfg.xml Explained`,
      content: `Hibernate looks for a file named hibernate.cfg.xml at the root of the classpath (src/main/resources) when you call new Configuration().configure().`,
      points: [
        `hibernate.connection.driver_class – com.mysql.cj.jdbc.Driver`,
        `hibernate.connection.url – jdbc:mysql://localhost:3306/hibernate_db`,
        `hibernate.connection.username / password – your DB credentials`,
        `hibernate.dialect – org.hibernate.dialect.MySQLDialect (optional in Hibernate 6, auto-detected; MySQL8Dialect is deprecated)`,
        `hibernate.show_sql – true prints every SQL; hibernate.format_sql – pretty multi-line printing`,
        `hibernate.hbm2ddl.auto – create | create-drop | update | validate | none`,
        `<mapping class="..."/> – registers each entity class`,
      ],
      tip: `Never use create or update on a production database. Use validate or none there, and manage schema with Flyway/Liquibase.`,
    },
    {
      heading: `hbm2ddl.auto Values`,
      content: `This setting decides what Hibernate does with tables at startup:

  create       -> DROP existing tables, then CREATE new ones (data lost every run)
  create-drop  -> like create, plus DROP when SessionFactory closes (good for tests)
  update       -> CREATE missing tables/columns, never drops (good while learning)
  validate     -> only checks that tables match entities, throws error if not
  none         -> do nothing (production)

Analogy: create = demolish and rebuild the house every morning; update = add new rooms if needed; validate = an inspector who only checks the house.`,
    },
    {
      heading: `First Entity and HibernateUtil`,
      content: `An entity is a simple Java class (POJO) marked with @Entity and having an @Id. Rules:
- Must have a no-argument constructor (public or protected).
- Must not be final (Hibernate creates proxy subclasses).
- Must have a primary key annotated with @Id.

HibernateUtil is a helper class that builds ONE SessionFactory in a static block and shares it, because building a SessionFactory is expensive (it reads metadata, starts the connection pool).`,
      syntax: `public class HibernateUtil {
    private static final SessionFactory FACTORY =
            new Configuration().configure().buildSessionFactory();
    public static SessionFactory getSessionFactory() { return FACTORY; }
}`,
    },
    {
      heading: `Reading Hibernate Console Output`,
      content: `When the program starts you will see INFO log lines like "HHH000412: Hibernate ORM core version 6.4.4.Final" and a connection pool warning "HHH10001002: Using built-in connection pool (not for production use!)". These are normal.

After that you see the SQL Hibernate generated, prefixed with "Hibernate:". The ? marks are JDBC bind parameters; Hibernate uses PreparedStatement internally, so it is safe from SQL injection.`,
      points: [
        `Column order in Hibernate 6 INSERTs is alphabetical by attribute name (email, name)`,
        `Table aliases in SELECTs look like s1_0 (Hibernate 6 naming style)`,
        `To see bound parameter values set logger org.hibernate.orm.jdbc.bind to TRACE`,
      ],
    },
  ],
  examples: [
    {
      title: `Complete pom.xml`,
      scenario: `The full Maven file for every Hibernate example in this course.`,
      steps: [
        `Open pom.xml in the project root`,
        `Replace the content with this file (keep your groupId/artifactId if different)`,
        `Eclipse: right-click project > Maven > Update Project. IntelliJ: click "Load Maven Changes"`,
        `Expand "Maven Dependencies" (Eclipse) or "External Libraries" (IntelliJ) and confirm hibernate-core-6.4.4.Final.jar is present`,
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.demo</groupId>
    <artifactId>hibernate-demo</artifactId>
    <version>1.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Hibernate 6 (brings jakarta.persistence-api transitively) -->
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-core</artifactId>
            <version>6.4.4.Final</version>
        </dependency>

        <!-- MySQL JDBC driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.3.0</version>
        </dependency>
    </dependencies>
</project>`,
      result: `[INFO] BUILD SUCCESS   (shown when you run: mvn compile)`,
      explanation: `Only two dependencies are needed. hibernate-core pulls in jakarta.persistence-api 3.1, jakarta.transaction-api, byte-buddy, jboss-logging and others transitively.`,
    },
    {
      title: `hibernate.cfg.xml for MySQL`,
      scenario: `Configure the connection, SQL logging and automatic table creation.`,
      steps: [
        `Create the database once in MySQL: CREATE DATABASE hibernate_db;`,
        `Right-click src/main/resources > New > File > hibernate.cfg.xml`,
        `Paste the XML and change username/password to yours`,
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <!-- JDBC connection -->
        <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/hibernate_db</property>
        <property name="hibernate.connection.username">root</property>
        <property name="hibernate.connection.password">root</property>

        <!-- Optional in Hibernate 6: dialect is auto-detected -->
        <property name="hibernate.dialect">org.hibernate.dialect.MySQLDialect</property>

        <!-- Show generated SQL -->
        <property name="hibernate.show_sql">true</property>
        <property name="hibernate.format_sql">false</property>

        <!-- Create/update tables automatically -->
        <property name="hibernate.hbm2ddl.auto">update</property>

        <!-- Entity classes -->
        <mapping class="com.demo.entity.Student"/>
    </session-factory>
</hibernate-configuration>`,
      result: `(No output by itself – it is read when the SessionFactory is built.)`,
      explanation: `configure() with no argument loads /hibernate.cfg.xml from the classpath. Every entity must be listed with <mapping class>; forgetting it gives "UnknownEntityTypeException: Unable to locate persister".`,
    },
    {
      title: `First Entity, HibernateUtil and Main – Save a Student`,
      scenario: `Create the Student entity, build the SessionFactory once and insert two rows.`,
      steps: [
        `Create package com.demo.entity and class Student (Eclipse: File > New > Class; IntelliJ: right-click java > New > Java Class, type com.demo.entity.Student)`,
        `Create package com.demo.util with class HibernateUtil`,
        `Create class com.demo.App with main()`,
        `Run App (Eclipse: right-click > Run As > Java Application; IntelliJ: green ▶)`,
        `Check MySQL Workbench: SELECT * FROM students;`,
      ],
      code: `// ===== src/main/java/com/demo/entity/Student.java =====
package com.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String email;

    public Student() {}                       // required by Hibernate
    public Student(String name, String email) {
        this.name = name;
        this.email = email;
    }
    public int getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @Override
    public String toString() { return "Student[" + id + ", " + name + ", " + email + "]"; }
}

// ===== src/main/java/com/demo/util/HibernateUtil.java =====
package com.demo.util;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static final SessionFactory FACTORY = build();

    private static SessionFactory build() {
        try {
            return new Configuration().configure().buildSessionFactory();
        } catch (Exception e) {
            System.err.println("SessionFactory creation failed: " + e);
            throw new ExceptionInInitializerError(e);
        }
    }
    public static SessionFactory getSessionFactory() { return FACTORY; }
    public static void shutdown() { FACTORY.close(); }
}

// ===== src/main/java/com/demo/App.java =====
package com.demo;

import com.demo.entity.Student;
import com.demo.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class App {
    public static void main(String[] args) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Student s1 = new Student("Asha", "asha@mail.com");
            Student s2 = new Student("Ravi", "ravi@mail.com");
            session.persist(s1);
            session.persist(s2);
            tx.commit();
            System.out.println("Saved: " + s1);
            System.out.println("Saved: " + s2);
        }
        HibernateUtil.shutdown();
    }
}`,
      result: `Hibernate: create table students (id integer not null auto_increment, email varchar(255), name varchar(255), primary key (id)) engine=InnoDB
Hibernate: insert into students (email,name) values (?,?)
Hibernate: insert into students (email,name) values (?,?)
Saved: Student[1, Asha, asha@mail.com]
Saved: Student[2, Ravi, ravi@mail.com]`,
      explanation: `On the first run, update creates the table (later runs skip it). With IDENTITY, Hibernate must run the INSERT immediately at persist() to get the auto-increment id back, so ids 1 and 2 are set on the objects. INFO log lines are omitted here.`,
    },
    {
      title: `Turning on format_sql and Parameter Logging`,
      scenario: `See pretty SQL and the actual values bound to the ? placeholders.`,
      steps: [
        `In hibernate.cfg.xml set hibernate.format_sql to true and add hibernate.highlight_sql true (optional, colours in console)`,
        `Optional: to see bind values, add a simplelogger or log4j2 config with org.hibernate.orm.jdbc.bind=trace`,
        `Run App again`,
      ],
      code: `<property name="hibernate.show_sql">true</property>
<property name="hibernate.format_sql">true</property>

<!-- src/main/resources/log4j2.xml requires log4j-core dependency; simplest way: -->
<!-- add dependency org.slf4j:slf4j-simple and in src/main/resources/simplelogger.properties: -->
org.slf4j.simpleLogger.log.org.hibernate.orm.jdbc.bind=trace`,
      result: `Hibernate:
    insert
    into
        students
        (email, name)
    values
        (?, ?)
binding parameter (1:VARCHAR) <- [asha@mail.com]
binding parameter (2:VARCHAR) <- [Asha]`,
      explanation: `format_sql makes long SQL readable. Bind logging proves Hibernate uses PreparedStatement parameters (safe from SQL injection). Exact log prefixes vary with the logging library.`,
    },
  ],
  interview: [
    { q: `What is the default name and location of the Hibernate configuration file?`, a: `hibernate.cfg.xml at the root of the classpath (src/main/resources in Maven). new Configuration().configure() loads it.`, level: 'Easy' },
    { q: `Which Maven dependency is needed for Hibernate 6?`, a: `org.hibernate.orm:hibernate-core:6.x plus the JDBC driver of your database (com.mysql:mysql-connector-j for MySQL).`, level: 'Easy' },
    { q: `What are the values of hbm2ddl.auto?`, a: `create, create-drop, update, validate, none (also create-only, drop). update is common in development; validate/none in production.`, level: 'Easy' },
    { q: `Why should an entity have a no-arg constructor?`, a: `Hibernate creates entity instances via reflection (Constructor.newInstance) when loading rows, then sets fields. Without a no-arg constructor it cannot instantiate the class.`, level: 'Medium' },
    { q: `Why should an entity class not be final?`, a: `Hibernate generates proxy subclasses (for lazy loading / getReference). A final class cannot be subclassed, so lazy proxies cannot be created.`, level: 'Medium' },
    { q: `What does show_sql do?`, a: `Prints every SQL statement Hibernate sends to the database to the console. format_sql makes it multi-line and readable.`, level: 'Easy' },
    { q: `Is the dialect mandatory in Hibernate 6?`, a: `No. Hibernate 6 detects the database and version from JDBC metadata. You may still set org.hibernate.dialect.MySQLDialect explicitly. Version-specific dialects like MySQL8Dialect are deprecated.`, level: 'Medium' },
    { q: `Why create SessionFactory only once?`, a: `It is expensive: it parses mappings, builds metadata, starts the connection pool and caches. It is thread-safe, so one instance per database is shared by the whole app.`, level: 'Easy' },
    { q: `What error do you get if you forget <mapping class> for an entity?`, a: `Operations on it fail with UnknownEntityTypeException / "Unable to locate persister" (or IllegalArgumentException: Not an entity) because Hibernate does not know the class.`, level: 'Medium' },
    { q: `Can Hibernate be configured without XML?`, a: `Yes: Configuration.setProperty(...) and addAnnotatedClass(Student.class), a hibernate.properties file, JPA persistence.xml, or Spring Boot application.properties.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Configure Hibernate fully in Java code (no hibernate.cfg.xml) and save one Student.`,
      hint: `Use new Configuration().setProperty(...).addAnnotatedClass(Student.class).`,
      solution: `import org.hibernate.*;
import org.hibernate.cfg.Configuration;
import com.demo.entity.Student;

public class JavaConfigApp {
    public static void main(String[] args) {
        SessionFactory sf = new Configuration()
            .setProperty("hibernate.connection.url", "jdbc:mysql://localhost:3306/hibernate_db")
            .setProperty("hibernate.connection.username", "root")
            .setProperty("hibernate.connection.password", "root")
            .setProperty("hibernate.show_sql", "true")
            .setProperty("hibernate.hbm2ddl.auto", "update")
            .addAnnotatedClass(Student.class)
            .buildSessionFactory();
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            s.persist(new Student("Meena", "meena@mail.com"));
            tx.commit();
        }
        sf.close();
    }
}`,
    },
    {
      task: `Create an Employee entity (id, name, salary) mapped to table employees, register it, and insert three employees.`,
      hint: `Remember the no-arg constructor and <mapping class="com.demo.entity.Employee"/>.`,
      solution: `package com.demo.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private double salary;
    public Employee() {}
    public Employee(String name, double salary) { this.name = name; this.salary = salary; }
}

// in main:
try (Session s = HibernateUtil.getSessionFactory().openSession()) {
    Transaction tx = s.beginTransaction();
    s.persist(new Employee("Asha", 50000));
    s.persist(new Employee("Ravi", 42000));
    s.persist(new Employee("John", 61000));
    tx.commit();
}
// SQL: create table employees (id integer not null auto_increment, name varchar(255), salary float(53) not null, primary key (id)) engine=InnoDB
//      insert into employees (name,salary) values (?,?)   x3`,
    },
    {
      task: `Run the App with hbm2ddl.auto = create, then with update, then with validate after renaming the field email to mail. Note what happens each time.`,
      hint: `validate should fail when a column is missing.`,
      solution: `create   -> table dropped and recreated each run; only latest 2 rows exist.
update   -> new column "mail" is added, old "email" column stays; rows accumulate.
validate -> fails at startup with SchemaManagementException:
            Schema-validation: missing column [mail] in table [students]  (if you
            renamed it and the column does not exist yet).`,
    },
    {
      task: `Make a checklist of common setup errors and their fixes.`,
      hint: `Think about driver, DB name, password, resources folder, mapping.`,
      solution: `1. "Communications link failure" -> MySQL not running / wrong port.
2. "Access denied for user" -> wrong username/password.
3. "Unknown database 'hibernate_db'" -> run CREATE DATABASE hibernate_db.
4. "Could not locate cfg.xml resource" -> file not in src/main/resources or misnamed.
5. "Unable to locate persister" -> missing <mapping class>.
6. "No default constructor for entity" -> add public Student() {}.
7. javax.persistence imports with Hibernate 6 -> change to jakarta.persistence.`,
    },
  ],
  quiz: [
    { question: `What is the correct Maven groupId for Hibernate 6 core?`, options: [`org.hibernate`, `org.hibernate.orm`, `jakarta.hibernate`, `com.hibernate`], answer: 1, explanation: `From Hibernate 6 the groupId is org.hibernate.orm.` },
    { question: `Where should hibernate.cfg.xml be placed in a Maven project?`, options: [`src/main/java`, `project root`, `src/main/resources`, `WEB-INF`], answer: 2, explanation: `Files in src/main/resources end up at the classpath root.` },
    { question: `Which hbm2ddl.auto value drops and recreates tables on every start?`, options: [`update`, `validate`, `none`, `create`], answer: 3, explanation: `create drops existing tables and creates them again.` },
    { question: `Which of these is required for every entity?`, options: [`@Id`, `@Table`, `@Column`, `A final modifier`], answer: 0, explanation: `@Entity classes must have a primary key (@Id). @Table and @Column are optional.` },
    { question: `Which property prints generated SQL to the console?`, options: [`hibernate.format_sql`, `hibernate.show_sql`, `hibernate.log_sql`, `hibernate.print_sql`], answer: 1, explanation: `show_sql prints; format_sql only formats it.` },
  ],
};
