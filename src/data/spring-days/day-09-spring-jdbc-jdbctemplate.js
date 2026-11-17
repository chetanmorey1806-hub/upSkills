export default {
  id: 'day-09-spring-jdbc-jdbctemplate',
  title: 'Spring JDBC with JdbcTemplate',
  module: 'Module 3: Data Access',
  day: 9,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Remove repetitive JDBC boilerplate with Spring's JdbcTemplate: configure a DataSource, perform CRUD with update(), query(), queryForObject(), map rows with RowMapper/BeanPropertyRowMapper, use named parameters and batch updates.`,
  objectives: [
    `Explain the problems of plain JDBC and how the Template Method pattern solves them`,
    `Configure DataSource and JdbcTemplate beans with Java config (MySQL)`,
    `Write a DAO with insert, update, delete, find-by-id and find-all`,
    `Use RowMapper, BeanPropertyRowMapper, queryForObject and NamedParameterJdbcTemplate`,
    `Understand DataAccessException and batch updates`,
  ],
  theory: [
    {
      heading: 'Problems with plain JDBC',
      content: `Every plain JDBC method repeats the same steps: get a Connection, create a PreparedStatement, set parameters, execute, loop the ResultSet, catch SQLException (a checked exception), and close everything in finally. Only 2 or 3 lines are actually your logic. Forgetting to close a connection causes leaks that crash the app under load.`,
    },
    {
      heading: 'JdbcTemplate: the Template Method pattern',
      content: `JdbcTemplate does the fixed steps (open, prepare, execute, iterate, handle exceptions, close) and calls YOUR code only for the variable part: the SQL, the parameters and how to convert one row into an object (RowMapper callback). Analogy: a cake shop's machine handles mixing, baking and packing; you only choose the flavour. JdbcTemplate is thread-safe once configured, so one instance can be shared by all DAOs.`,
      points: [
        `update(sql, args...): INSERT, UPDATE, DELETE; returns affected row count`,
        `query(sql, rowMapper, args...): returns List<T>`,
        `queryForObject(sql, rowMapper, args...): exactly one row (throws EmptyResultDataAccessException if none)`,
        `queryForObject(sql, Integer.class): single value like COUNT(*)`,
        `queryForList / queryForMap: rows as Maps`,
        `batchUpdate(sql, List<Object[]>): many inserts in one round trip`,
        `execute(sql): DDL like CREATE TABLE`,
      ],
    },
    {
      heading: 'Dependencies and DataSource',
      content: `Add spring-jdbc and the MySQL driver. A DataSource gives connections. DriverManagerDataSource (from Spring) opens a new connection each time, fine for learning. In real apps use a pool like HikariCP.`,
      syntax: `<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-jdbc</artifactId>
  <version>6.1.14</version>
</dependency>
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>8.4.0</version>
</dependency>
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>5.1.0</version>
</dependency>`,
    },
    {
      heading: 'RowMapper and BeanPropertyRowMapper',
      content: `RowMapper<T> is a functional interface: T mapRow(ResultSet rs, int rowNum). You write it as a lambda or a class. BeanPropertyRowMapper.newInstance(Employee.class) maps columns to properties automatically by name (emp_name -> empName); the class needs a no-arg constructor and setters. DataClassRowMapper works for records.`,
      syntax: `RowMapper<Employee> mapper = (rs, rowNum) ->
    new Employee(rs.getInt("id"), rs.getString("name"), rs.getDouble("salary"));`,
    },
    {
      heading: 'NamedParameterJdbcTemplate',
      content: `With many ? placeholders, it is easy to mix up the order. NamedParameterJdbcTemplate uses :name placeholders and a Map or MapSqlParameterSource / BeanPropertySqlParameterSource.`,
      syntax: `String sql = "UPDATE employee SET salary = :salary WHERE id = :id";
named.update(sql, new MapSqlParameterSource().addValue("salary", 70000).addValue("id", 2));`,
    },
    {
      heading: 'Exception handling: DataAccessException',
      content: `JdbcTemplate converts checked SQLException into Spring's unchecked DataAccessException hierarchy (DuplicateKeyException, EmptyResultDataAccessException, DataIntegrityViolationException, BadSqlGrammarException...). You catch only what you can handle; the rest propagates. The same hierarchy is used for Hibernate/JPA, so service code is database-technology independent.`,
      tip: `Common mistakes: using queryForObject when the row may not exist (wrap in try/catch or use query(...).stream().findFirst()), and concatenating user input into SQL (always use ? or :name placeholders to avoid SQL injection).`,
    },
  ],
  examples: [
    {
      title: 'How JdbcTemplate works inside (plain Java simulation)',
      scenario: `A FakeJdbcTemplate owns the fixed steps (open, execute, iterate, close) and calls our RowMapper lambda for each row of an in-memory "table". This is the Template Method + callback idea with no database. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Notice our code only provides SQL text and a row-to-object lambda',
      ],
      code: `import java.util.*;

interface RowMapper<T> { T mapRow(Map<String, Object> row, int rowNum); }

record Employee(int id, String name, double salary) { }

class FakeJdbcTemplate {
    private final List<Map<String, Object>> table = new ArrayList<>();

    FakeJdbcTemplate() {
        table.add(row(1, "Asha", 85000.0));
        table.add(row(2, "Ravi", 62000.0));
    }
    private static Map<String, Object> row(int id, String name, double salary) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id); m.put("name", name); m.put("salary", salary);
        return m;
    }

    <T> List<T> query(String sql, RowMapper<T> mapper) {
        System.out.println("open connection");               // fixed step
        System.out.println("execute: " + sql);               // fixed step
        List<T> result = new ArrayList<>();
        int i = 0;
        for (Map<String, Object> r : table) result.add(mapper.mapRow(r, i++));  // YOUR callback
        System.out.println("close connection");              // fixed step (always)
        return result;
    }
}

public class Main {
    public static void main(String[] args) {
        FakeJdbcTemplate jdbc = new FakeJdbcTemplate();
        List<Employee> list = jdbc.query("SELECT * FROM employee",
                (r, n) -> new Employee((Integer) r.get("id"), (String) r.get("name"), (Double) r.get("salary")));
        list.forEach(System.out::println);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

interface RowMapper<T> { T mapRow(Map<String, Object> row, int rowNum); }

record Employee(int id, String name, double salary) { }

class FakeJdbcTemplate {
    private final List<Map<String, Object>> table = new ArrayList<>();

    FakeJdbcTemplate() {
        table.add(row(1, "Asha", 85000.0));
        table.add(row(2, "Ravi", 62000.0));
    }
    private static Map<String, Object> row(int id, String name, double salary) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id); m.put("name", name); m.put("salary", salary);
        return m;
    }

    <T> List<T> query(String sql, RowMapper<T> mapper) {
        System.out.println("open connection");
        System.out.println("execute: " + sql);
        List<T> result = new ArrayList<>();
        int i = 0;
        for (Map<String, Object> r : table) result.add(mapper.mapRow(r, i++));
        System.out.println("close connection");
        return result;
    }
}

public class Main {
    public static void main(String[] args) {
        FakeJdbcTemplate jdbc = new FakeJdbcTemplate();
        List<Employee> list = jdbc.query("SELECT * FROM employee",
                (r, n) -> new Employee((Integer) r.get("id"), (String) r.get("name"), (Double) r.get("salary")));
        list.forEach(System.out::println);
    }
}`,
        },
      },
      result: `open connection
execute: SELECT * FROM employee
close connection
Employee[id=1, name=Asha, salary=85000.0]
Employee[id=2, name=Ravi, salary=62000.0]`,
      explanation: `The template owns resource handling; the lambda (RowMapper) converts each row. Spring's real JdbcTemplate.query(sql, RowMapper) has the same shape, with a ResultSet instead of a Map.`,
    },
    {
      title: 'Project setup: MySQL table + DataSource + JdbcTemplate beans',
      scenario: `Prepare the database and Spring configuration used by the next examples.`,
      steps: [
        'Open MySQL Workbench (or mysql CLI) and run the SQL script',
        'Eclipse/STS: File > New > Maven Project (simple project), IntelliJ: File > New > Project > Maven, JDK 17',
        'Add spring-context, spring-jdbc, mysql-connector-j and HikariCP to pom.xml and reload Maven',
        'Create com.demo.config.DbConfig; change the password to yours',
      ],
      code: `-- SQL script
CREATE DATABASE springdb;
USE springdb;
CREATE TABLE employee (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  salary DOUBLE
);
INSERT INTO employee(name, salary) VALUES ('Asha', 85000), ('Ravi', 62000);

// DbConfig.java
package com.demo.config;
import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@Configuration
@ComponentScan("com.demo")
public class DbConfig {
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/springdb");
        ds.setUsername("root");
        ds.setPassword("root");
        ds.setMaximumPoolSize(5);
        return ds;
    }
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource ds) { return new JdbcTemplate(ds); }

    @Bean
    public NamedParameterJdbcTemplate namedJdbc(DataSource ds) { return new NamedParameterJdbcTemplate(ds); }
}`,
      result: `Table employee exists with rows (1, Asha, 85000) and (2, Ravi, 62000); context starts without errors.`,
      explanation: `javax.sql.DataSource is still javax because it is part of Java SE, not Jakarta EE. HikariDataSource is closed automatically on context shutdown because it has a close() method.`,
    },
    {
      title: 'EmployeeDao with full CRUD',
      scenario: `A @Repository using JdbcTemplate for create, read, update and delete.`,
      steps: [
        'Create record com.demo.model.Employee(int id, String name, double salary)',
        'Create com.demo.dao.EmployeeDao with the code below',
        'Create JdbcApp main class and run it',
      ],
      code: `// Employee.java
package com.demo.model;
public record Employee(int id, String name, double salary) { }

// EmployeeDao.java
package com.demo.dao;
import java.util.*;
import com.demo.model.Employee;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Repository;

@Repository
public class EmployeeDao {
    private final JdbcTemplate jdbc;
    private final RowMapper<Employee> mapper =
        (rs, rowNum) -> new Employee(rs.getInt("id"), rs.getString("name"), rs.getDouble("salary"));

    public EmployeeDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public int save(String name, double salary) {
        return jdbc.update("INSERT INTO employee(name, salary) VALUES (?, ?)", name, salary);
    }
    public List<Employee> findAll() {
        return jdbc.query("SELECT * FROM employee ORDER BY id", mapper);
    }
    public Optional<Employee> findById(int id) {
        return jdbc.query("SELECT * FROM employee WHERE id = ?", mapper, id).stream().findFirst();
    }
    public int updateSalary(int id, double salary) {
        return jdbc.update("UPDATE employee SET salary = ? WHERE id = ?", salary, id);
    }
    public int delete(int id) {
        return jdbc.update("DELETE FROM employee WHERE id = ?", id);
    }
    public int count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM employee", Integer.class);
    }
}

// JdbcApp.java
package com.demo;
import com.demo.config.DbConfig;
import com.demo.dao.EmployeeDao;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class JdbcApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(DbConfig.class)) {
            EmployeeDao dao = ctx.getBean(EmployeeDao.class);
            System.out.println("Inserted: " + dao.save("Meera", 71000));
            System.out.println("Updated: " + dao.updateSalary(2, 65000));
            dao.findAll().forEach(System.out::println);
            System.out.println("Find 99: " + dao.findById(99));
            System.out.println("Deleted: " + dao.delete(3));
            System.out.println("Count: " + dao.count());
        }
    }
}`,
      result: `Inserted: 1
Updated: 1
Employee[id=1, name=Asha, salary=85000.0]
Employee[id=2, name=Ravi, salary=65000.0]
Employee[id=3, name=Meera, salary=71000.0]
Find 99: Optional.empty
Deleted: 1
Count: 2`,
      explanation: `Output assumes a fresh table from the script (Meera gets id 3). Not a single try/catch/close appears in the DAO. Using query(...).stream().findFirst() avoids EmptyResultDataAccessException for missing rows. (HikariCP may also print INFO log lines when the pool starts.)`,
    },
    {
      title: 'BeanPropertyRowMapper, named parameters and batch insert',
      scenario: `Use less mapping code and safer named parameters; insert many rows at once.`,
      steps: [
        'Create class EmpBean with no-arg constructor, getters and setters (id, name, salary)',
        'Add the methods to EmployeeDao (inject NamedParameterJdbcTemplate too)',
        'Call them from main',
      ],
      code: `// BeanPropertyRowMapper (class needs setters)
List<EmpBean> list = jdbc.query("SELECT id, name, salary FROM employee",
        BeanPropertyRowMapper.newInstance(EmpBean.class));

// Named parameters
public List<Employee> findBySalaryRange(double min, double max) {
    String sql = "SELECT * FROM employee WHERE salary BETWEEN :min AND :max ORDER BY salary";
    var params = new MapSqlParameterSource().addValue("min", min).addValue("max", max);
    return named.query(sql, params, mapper);
}

// Batch insert
public int[] saveAll(List<Employee> emps) {
    List<Object[]> rows = emps.stream()
        .map(e -> new Object[] { e.name(), e.salary() })
        .toList();
    return jdbc.batchUpdate("INSERT INTO employee(name, salary) VALUES (?, ?)", rows);
}

// main
int[] counts = dao.saveAll(List.of(new Employee(0, "Kiran", 50000), new Employee(0, "Divya", 55000)));
System.out.println("Batch: " + java.util.Arrays.toString(counts));
dao.findBySalaryRange(50000, 70000).forEach(System.out::println);`,
      result: `Batch: [1, 1]
Employee[id=4, name=Kiran, salary=50000.0]
Employee[id=5, name=Divya, salary=55000.0]
Employee[id=2, name=Ravi, salary=65000.0]`,
      explanation: `Assumes the state after Example 3 (ids 1 and 2 remain, next auto-increment is 4). batchUpdate returns one count per row. Named parameters make SQL self-documenting and order-independent.`,
    },
  ],
  interview: [
    { q: 'What is JdbcTemplate?', a: 'A Spring class in spring-jdbc that simplifies JDBC by handling connection, statement, result set, exception translation and resource closing, implementing the Template Method pattern.', level: 'Easy' },
    { q: 'What boilerplate does JdbcTemplate remove?', a: 'Opening/closing connections and statements, iterating ResultSet, try/catch/finally and checked SQLException handling.', level: 'Easy' },
    { q: 'What is RowMapper?', a: 'A functional interface with mapRow(ResultSet, int) that converts one row into an object; JdbcTemplate calls it for each row.', level: 'Easy' },
    { q: 'RowMapper vs ResultSetExtractor?', a: 'RowMapper maps one row at a time; ResultSetExtractor receives the whole ResultSet, useful for joins building nested objects.', level: 'Hard' },
    { q: 'What does queryForObject throw when no row is found?', a: 'EmptyResultDataAccessException (and IncorrectResultSizeDataAccessException if more than one row).', level: 'Medium' },
    { q: 'Why does Spring use DataAccessException?', a: 'It is an unchecked, technology-independent hierarchy; it translates vendor SQL error codes into meaningful exceptions like DuplicateKeyException.', level: 'Medium' },
    { q: 'Is JdbcTemplate thread-safe?', a: 'Yes, after configuration it is stateless and can be shared as a singleton by many DAOs.', level: 'Medium' },
    { q: 'What is NamedParameterJdbcTemplate?', a: 'A wrapper around JdbcTemplate that supports :name placeholders with Map/SqlParameterSource instead of positional ?.', level: 'Easy' },
    { q: 'How do you perform batch operations?', a: 'jdbcTemplate.batchUpdate(sql, List<Object[]>) or with BatchPreparedStatementSetter; it returns int[] update counts.', level: 'Medium' },
    { q: 'DriverManagerDataSource vs HikariDataSource?', a: 'DriverManagerDataSource creates a new physical connection every time (testing only). HikariCP pools and reuses connections (production).', level: 'Medium' },
    { q: 'How do you get the generated id after insert?', a: 'Use KeyHolder with jdbc.update(PreparedStatementCreator, keyHolder) or SimpleJdbcInsert.executeAndReturnKey().', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Plain Java: add a queryForObject(String sql, RowMapper<T> mapper, int id) method to FakeJdbcTemplate that returns the matching row or throws RuntimeException("EmptyResult") if not found. Test with id 2 and id 9.',
      hint: 'Loop the table and compare row.get("id").',
      solution: `<T> T queryForObject(String sql, RowMapper<T> mapper, int id) {
    int i = 0;
    for (Map<String, Object> r : table) {
        if ((Integer) r.get("id") == id) return mapper.mapRow(r, i);
        i++;
    }
    throw new RuntimeException("EmptyResult");
}
// main
RowMapper<Employee> m = (r, n) -> new Employee((Integer) r.get("id"), (String) r.get("name"), (Double) r.get("salary"));
System.out.println(jdbc.queryForObject("SELECT ... WHERE id=?", m, 2));   // Employee[id=2, name=Ravi, salary=62000.0]
try { jdbc.queryForObject("SELECT ... WHERE id=?", m, 9); }
catch (RuntimeException e) { System.out.println(e.getMessage()); }       // EmptyResult`,
    },
    {
      task: 'Create a product table (id, name, price) and a ProductDao with save, findAll and findByName using JdbcTemplate.',
      hint: 'Use LIKE with ? and pass "%" + text + "%".',
      solution: `CREATE TABLE product(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50), price DOUBLE);

@Repository
public class ProductDao {
    private final JdbcTemplate jdbc;
    private final RowMapper<Product> m = (rs, n) -> new Product(rs.getInt("id"), rs.getString("name"), rs.getDouble("price"));
    public ProductDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public int save(String name, double price) { return jdbc.update("INSERT INTO product(name, price) VALUES (?, ?)", name, price); }
    public List<Product> findAll() { return jdbc.query("SELECT * FROM product", m); }
    public List<Product> findByName(String text) { return jdbc.query("SELECT * FROM product WHERE name LIKE ?", m, "%" + text + "%"); }
}
public record Product(int id, String name, double price) { }`,
    },
    {
      task: 'Write a method that returns total salary using queryForObject and handles a null result (empty table).',
      hint: 'SUM returns NULL on an empty table; use Double.class.',
      solution: `public double totalSalary() {
    Double total = jdbc.queryForObject("SELECT SUM(salary) FROM employee", Double.class);
    return total == null ? 0.0 : total;
}`,
    },
    {
      task: 'Insert an employee and return the generated id using SimpleJdbcInsert.',
      hint: 'new SimpleJdbcInsert(dataSource).withTableName("employee").usingGeneratedKeyColumns("id")',
      solution: `public int insertReturnId(String name, double salary) {
    SimpleJdbcInsert insert = new SimpleJdbcInsert(jdbc)
        .withTableName("employee")
        .usingGeneratedKeyColumns("id");
    Number id = insert.executeAndReturnKey(Map.of("name", name, "salary", salary));
    return id.intValue();
}`,
    },
  ],
  quiz: [
    { question: 'Which method executes an INSERT with JdbcTemplate?', options: ['query()', 'update()', 'insert()', 'executeQuery()'], answer: 1, explanation: 'update() handles INSERT/UPDATE/DELETE.' },
    { question: 'What does query(sql, rowMapper) return?', options: ['ResultSet', 'int', 'Map', 'List<T>'], answer: 3, explanation: 'A list of mapped objects.' },
    { question: 'Which exception type does JdbcTemplate throw?', options: ['SQLException (checked)', 'IOException', 'DataAccessException (unchecked)', 'JdbcException'], answer: 2, explanation: 'SQLException is translated into DataAccessException subclasses.' },
    { question: 'Placeholder style for NamedParameterJdbcTemplate?', options: [':name', '?', '#{name}', '@name'], answer: 0, explanation: 'Named parameters use a colon prefix.' },
    { question: 'Which design pattern is JdbcTemplate based on?', options: ['Observer', 'Template Method', 'Builder', 'Adapter'], answer: 1, explanation: 'It fixes the algorithm skeleton and calls back your code for variable parts.' },
  ],
};
