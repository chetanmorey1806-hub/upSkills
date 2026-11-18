export default {
  id: 'day-18-spring-data-mongodb',
  title: 'Spring Data MongoDB: NoSQL, Documents, MongoRepository, MongoTemplate and Aggregation',
  module: 'Module 5: Spring Ecosystem Extras',
  day: 18,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Learn what NoSQL and MongoDB are, install MongoDB and Compass, map Java classes with @Document, perform CRUD with MongoRepository, write derived and @Query queries, use MongoTemplate for dynamic queries and updates, and build simple aggregation reports.',
  objectives: [
    'Compare SQL (relational) and NoSQL (document) databases and choose correctly',
    'Install MongoDB (local or Docker) and browse data with MongoDB Compass',
    'Map documents with @Document, @Id, @Field, @Indexed and embedded objects',
    'Use MongoRepository CRUD, derived queries and JSON-based @Query',
    'Use MongoTemplate for Query/Criteria, Update and basic aggregation pipelines',
  ],
  theory: [
    {
      heading: 'SQL vs NoSQL',
      content:
        'SQL databases (MySQL, PostgreSQL, Oracle) store data in tables with fixed columns and use JOINs between tables. Every row must follow the schema.\n\nNoSQL ("Not only SQL") databases store data in other shapes:\n- Document stores: MongoDB, Couchbase (JSON-like documents)\n- Key-value stores: Redis (Day 19)\n- Column-family stores: Cassandra\n- Graph databases: Neo4j\n\nAnalogy: A SQL table is like an Excel sheet - every row has the same columns. A MongoDB collection is like a file folder of printed forms - each form (document) can have slightly different fields, and an order form can contain its list of items on the same page instead of in another sheet.',
      points: [
        'SQL: fixed schema, strong relations and JOINs, ACID transactions, vertical scaling. Good for banking, ERP, billing',
        'MongoDB: flexible schema, nested data, horizontal scaling (sharding), very fast reads of a whole object. Good for catalogs, CMS, logs, user profiles, IoT data',
        'MongoDB also supports multi-document ACID transactions (on a replica set) since version 4.0',
        'Do not choose NoSQL just because it is "modern" - choose based on data shape and query needs',
      ],
    },
    {
      heading: 'MongoDB Concepts: Database, Collection, Document',
      content:
        'Mapping with SQL terms:\nDatabase -> Database\nTable -> Collection\nRow -> Document\nColumn -> Field\nPrimary key -> _id (automatically created ObjectId if you do not give one)\nJOIN -> Embedded documents or $lookup\n\nA document is stored as BSON (Binary JSON), which supports extra types like Date, Decimal128 and ObjectId.\n\nExample document in the "students" collection:\n{\n  "_id": ObjectId("66a1f0c2e4b0a1b2c3d4e5f6"),\n  "name": "Anita Sharma",\n  "email": "anita@gmail.com",\n  "course": "Java Full Stack",\n  "marks": 82,\n  "skills": ["Java", "SQL", "React"],\n  "address": { "city": "Pune", "pin": "411001" }\n}\n\nObjectId is a 12-byte value: timestamp + random value + counter, so it is unique without asking a central server.',
      points: [
        'Embed data that is always read together (address inside student)',
        'Reference (store an id) when data is large, shared or updated separately',
        'Maximum document size is 16 MB',
      ],
    },
    {
      heading: 'Installing MongoDB and Compass',
      content:
        'Option A - Docker (easiest):\ndocker run -d --name mongo -p 27017:27017 mongo:7\n\nOption B - Windows installer: download MongoDB Community Server (MSI) from mongodb.com, choose "Install MongoDB as a Service" and tick "Install MongoDB Compass".\n\nMongoDB Compass is the GUI: Connect to mongodb://localhost:27017, create a database, browse documents, run filters like { "marks": { "$gte": 60 } } and build aggregation pipelines visually.\n\nmongosh is the command-line shell: use college_db; db.students.find({ course: "Java Full Stack" })',
      syntax: '# application.properties\nspring.data.mongodb.uri=mongodb://localhost:27017/college_db\n# or separately:\n# spring.data.mongodb.host=localhost\n# spring.data.mongodb.port=27017\n# spring.data.mongodb.database=college_db\nspring.data.mongodb.auto-index-creation=true',
      tip: 'MongoDB creates the database and collection automatically on the first insert. You do not need CREATE TABLE.',
    },
    {
      heading: 'Mapping: @Document, @Id, @Field, @Indexed',
      content:
        'Dependency: spring-boot-starter-data-mongodb. Boot auto-configures MongoClient, MongoTemplate and repositories.\n\n- @Document(collection = "students"): this class is stored in the students collection.\n- @Id: maps to _id. Use String (ObjectId is converted to its hex string) so Spring fills it automatically on save.\n- @Field("full_name"): different field name in the database.\n- @Indexed(unique = true): creates an index (needs spring.data.mongodb.auto-index-creation=true).\n- @Transient: not saved.\n- @DBRef: reference to another document (use rarely; manual id references are simpler).\n- Embedded objects (Address) need no annotation - they are stored as nested documents.\n\nNo @Entity, no @GeneratedValue, no @Column - those are JPA annotations and do nothing here.',
      points: [
        'Spring also stores a _class field with the Java class name (used for polymorphism)',
        'Use @CreatedDate/@LastModifiedDate with @EnableMongoAuditing for timestamps',
      ],
    },
    {
      heading: 'MongoRepository and MongoTemplate',
      content:
        'MongoRepository<T, ID> works like JpaRepository: save, saveAll, findById, findAll, deleteById, count, existsById, plus findAll(Pageable) and insert().\n\nDerived queries are created from method names: findByCourse, findByMarksGreaterThan, findByNameContainingIgnoreCase, findBySkillsContaining, findByAddressCity (nested field!).\n\n@Query uses MongoDB JSON syntax instead of JPQL: @Query("{ \'marks\': { \'$gte\': ?0, \'$lte\': ?1 } }"). ?0, ?1 are parameters. fields = "{ \'name\': 1, \'marks\': 1 }" selects only some fields (projection).\n\nMongoTemplate is the lower-level, flexible API (like JdbcTemplate). Use it for:\n- dynamic queries built at runtime with Query + Criteria\n- partial updates with Update ($set, $inc, $push) without loading the whole document\n- aggregation pipelines',
      syntax: 'Query q = new Query(Criteria.where("course").is("Java Full Stack").and("marks").gte(60));\nList<Student> list = mongoTemplate.find(q, Student.class);\n\nmongoTemplate.updateFirst(Query.query(Criteria.where("email").is(email)),\n        new Update().inc("marks", 5), Student.class);',
    },
    {
      heading: 'Aggregation Basics',
      content:
        'Aggregation is MongoDB\'s version of GROUP BY. Data flows through a pipeline of stages, like water through filters:\n$match (WHERE) -> $group (GROUP BY) -> $sort (ORDER BY) -> $project (SELECT columns) -> $limit\n\nExample in mongosh - average marks per course for students who scored 40 or more:\ndb.students.aggregate([\n  { $match: { marks: { $gte: 40 } } },\n  { $group: { _id: "$course", avgMarks: { $avg: "$marks" }, total: { $sum: 1 } } },\n  { $sort: { avgMarks: -1 } }\n])\n\nIn Spring use Aggregation.newAggregation(match(...), group(...).avg(...).as(...), sort(...)) with MongoTemplate.aggregate().',
      points: [
        'Put $match early so fewer documents go through the pipeline (and indexes can be used)',
        '$lookup joins another collection, $unwind flattens an array into one document per element',
      ],
    },
  ],
  examples: [
    {
      title: 'Setup: MongoDB with Docker, Compass and Spring Boot',
      scenario: 'Start MongoDB, create a Spring Boot project and connect it.',
      steps: [
        'Run in a terminal: docker run -d --name mongo -p 27017:27017 mongo:7 (or install MongoDB Community Server on Windows)',
        'Open MongoDB Compass > New Connection > URI mongodb://localhost:27017 > Connect',
        'start.spring.io: Maven, Spring Boot 3.3.x, Java 17, Artifact student-mongo. Dependencies: Spring Web, Spring Data MongoDB, Validation, Lombok (optional) > GENERATE',
        'IntelliJ: File > Open > student-mongo. STS: File > Import > Existing Maven Projects',
        'Add the property in application.properties and run the application',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

# application.properties
spring.application.name=student-mongo
spring.data.mongodb.uri=mongodb://localhost:27017/college_db
spring.data.mongodb.auto-index-creation=true
# see the queries Spring sends
logging.level.org.springframework.data.mongodb.core.MongoTemplate=DEBUG

# docker-compose.yml (optional alternative to docker run)
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:`,
      result: `Console:
o.mongodb.driver.client : MongoClient with metadata {"driver": {"name": "mongo-java-driver|sync|spring-boot", ...}} created with settings ...
org.mongodb.driver.cluster : Monitor thread successfully connected to server with description ServerDescription{address=localhost:27017, type=STANDALONE, state=CONNECTED, ...}
Tomcat started on port 8080 (http) with context path '/'
Started StudentMongoApplication in 2.874 seconds`,
      explanation: 'With spring-boot-starter-data-mongodb on the classpath, Boot creates MongoClient and MongoTemplate using spring.data.mongodb.uri. If MongoDB is not running you will see "Exception in monitor thread while connecting to server localhost:27017 ... Connection refused" in the log.',
    },
    {
      title: 'Document Class and MongoRepository CRUD API',
      scenario: 'Create a Student document with an embedded Address and a full REST CRUD API.',
      steps: [
        'Create packages model, repository, service, controller under com.example.studentmongo',
        'Create Address and Student classes, StudentRepository, StudentService and StudentController',
        'Run the app and test with Postman: POST http://localhost:8080/api/students with Body > raw > JSON',
        'Open Compass > college_db > students to see the saved document',
      ],
      code: `// model/Address.java
package com.example.studentmongo.model;

public class Address {
    private String city;
    private String pin;
    public Address() { }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}

// model/Student.java
package com.example.studentmongo.model;

import jakarta.validation.constraints.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "students")
public class Student {
    @Id
    private String id;

    @NotBlank
    private String name;

    @Email @NotBlank
    @Indexed(unique = true)
    private String email;

    private String course;

    @Min(0) @Max(100)
    private int marks;

    private List<String> skills;
    private Address address;          // embedded document

    public Student() { }
    // getters and setters for all fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
}

// repository/StudentRepository.java
package com.example.studentmongo.repository;

import com.example.studentmongo.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmail(String email);
}

// service/StudentService.java
package com.example.studentmongo.service;

import com.example.studentmongo.model.Student;
import com.example.studentmongo.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class StudentService {
    private final StudentRepository repo;
    public StudentService(StudentRepository repo) { this.repo = repo; }

    public Student create(Student s) { s.setId(null); return repo.save(s); }
    public List<Student> all() { return repo.findAll(); }
    public Student get(String id) {
        return repo.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + id));
    }
    public Student update(String id, Student s) {
        get(id);             // throws 404 if missing
        s.setId(id);
        return repo.save(s); // save with existing id = replace the document
    }
    public void delete(String id) { get(id); repo.deleteById(id); }
}

// controller/StudentController.java
package com.example.studentmongo.controller;

import com.example.studentmongo.model.Student;
import com.example.studentmongo.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService service;
    public StudentController(StudentService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody Student s) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(s));
    }
    @GetMapping
    public List<Student> all() { return service.all(); }

    @GetMapping("/{id}")
    public Student one(@PathVariable String id) { return service.get(id); }

    @PutMapping("/{id}")
    public Student update(@PathVariable String id, @Valid @RequestBody Student s) {
        return service.update(id, s);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// Postman request body (POST /api/students)
{
  "name": "Anita Sharma",
  "email": "anita@gmail.com",
  "course": "Java Full Stack",
  "marks": 82,
  "skills": ["Java", "SQL", "React"],
  "address": { "city": "Pune", "pin": "411001" }
}`,
      result: `POST /api/students -> 201 Created
{
  "id": "66a1f0c2e4b0a1b2c3d4e5f6",
  "name": "Anita Sharma",
  "email": "anita@gmail.com",
  "course": "Java Full Stack",
  "marks": 82,
  "skills": ["Java", "SQL", "React"],
  "address": { "city": "Pune", "pin": "411001" }
}
(The id value is generated by MongoDB, so yours will be different.)

Compass > college_db > students shows:
{ _id: ObjectId('66a1f0c2e4b0a1b2c3d4e5f6'), name: 'Anita Sharma', ..., _class: 'com.example.studentmongo.model.Student' }

POST again with the same email -> 500 with log: E11000 duplicate key error collection: college_db.students index: email dup key: { email: "anita@gmail.com" }`,
      explanation: 'The id is a String; Spring converts the generated ObjectId to its hex string. The address object is stored inside the student document - no second collection, no join. The unique index on email is created at startup because auto-index-creation is true, so a duplicate insert fails with E11000 (DuplicateKeyException in Spring - handle it in @ControllerAdvice to return 409 Conflict).',
    },
    {
      title: 'Derived Queries and @Query with MongoDB JSON',
      scenario: 'Search students by course, marks range, skill, nested city and with projection.',
      steps: [
        'Add the methods below to StudentRepository',
        'Add a SearchController with GET endpoints',
        'Insert 4-5 students with Postman and call the endpoints',
      ],
      code: `// StudentRepository.java
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByEmail(String email);

    List<Student> findByCourse(String course);

    List<Student> findByMarksGreaterThanEqualOrderByMarksDesc(int marks);

    List<Student> findBySkillsContaining(String skill);     // array contains

    List<Student> findByAddressCity(String city);            // nested field address.city

    List<Student> findByNameContainingIgnoreCase(String part); // regex, case-insensitive

    long countByCourse(String course);

    @Query("{ 'marks': { '$gte': ?0, '$lte': ?1 } }")
    List<Student> findMarksBetween(int min, int max);

    // projection: return only name and marks (other fields are null)
    @Query(value = "{ 'course': ?0 }", fields = "{ 'name': 1, 'marks': 1 }")
    List<Student> findNamesAndMarksByCourse(String course);
}

// SearchController.java
@RestController
@RequestMapping("/api/students/search")
public class SearchController {
    private final StudentRepository repo;
    public SearchController(StudentRepository repo) { this.repo = repo; }

    @GetMapping("/top")
    public List<Student> top(@RequestParam int min) {
        return repo.findByMarksGreaterThanEqualOrderByMarksDesc(min);
    }
    @GetMapping("/city/{city}")
    public List<Student> byCity(@PathVariable String city) { return repo.findByAddressCity(city); }

    @GetMapping("/skill/{skill}")
    public List<Student> bySkill(@PathVariable String skill) { return repo.findBySkillsContaining(skill); }

    @GetMapping("/range")
    public List<Student> range(@RequestParam int min, @RequestParam int max) {
        return repo.findMarksBetween(min, max);
    }
}`,
      result: `Data: Anita(82, Pune, [Java,SQL,React]), Rahul(65, Mumbai, [Java,Spring]), Sneha(91, Pune, [Python,SQL]), Kiran(38, Nagpur, [HTML])

GET /api/students/search/top?min=60  -> Sneha(91), Anita(82), Rahul(65)
Log: find using query: { "marks" : { "$gte" : 60}} ... sort: { "marks" : -1}

GET /api/students/search/city/Pune   -> Anita, Sneha
Log: find using query: { "address.city" : "Pune"}

GET /api/students/search/skill/SQL   -> Anita, Sneha
GET /api/students/search/range?min=40&max=85 -> Anita(82), Rahul(65)`,
      explanation: 'Spring Data turns method names into MongoDB filters: GreaterThanEqual -> $gte, Containing on a List -> array match, AddressCity -> "address.city". @Query lets you write the raw filter yourself; ?0 and ?1 are replaced by method parameters. Without an OrderBy, MongoDB returns documents in natural (insertion) order, which is not guaranteed - add a sort when order matters.',
    },
    {
      title: 'MongoTemplate: Dynamic Search and Partial Updates',
      scenario: 'Search with optional filters (course, minMarks, city) and give bonus marks or add a skill without loading the full document.',
      steps: [
        'Create StudentQueryService that injects MongoTemplate (auto-configured by Boot)',
        'Add the endpoints in a controller',
        'Call GET /api/students/filter?course=Java Full Stack&minMarks=60 and PATCH /api/students/bonus?course=Java Full Stack&points=5',
      ],
      code: `// service/StudentQueryService.java
package com.example.studentmongo.service;

import com.example.studentmongo.model.Student;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentQueryService {
    private final MongoTemplate mongoTemplate;
    public StudentQueryService(MongoTemplate mongoTemplate) { this.mongoTemplate = mongoTemplate; }

    public List<Student> filter(String course, Integer minMarks, String city) {
        Query query = new Query();
        if (course != null)   query.addCriteria(Criteria.where("course").is(course));
        if (minMarks != null) query.addCriteria(Criteria.where("marks").gte(minMarks));
        if (city != null)     query.addCriteria(Criteria.where("address.city").regex("^" + city + "$", "i"));
        query.with(Sort.by(Sort.Direction.DESC, "marks")).limit(50);
        return mongoTemplate.find(query, Student.class);
    }

    // $inc on many documents
    public long giveBonus(String course, int points) {
        Query q = Query.query(Criteria.where("course").is(course).and("marks").lte(100 - points));
        UpdateResult r = mongoTemplate.updateMulti(q, new Update().inc("marks", points), Student.class);
        return r.getModifiedCount();
    }

    // $addToSet on one document (adds only if not present)
    public void addSkill(String email, String skill) {
        mongoTemplate.updateFirst(Query.query(Criteria.where("email").is(email)),
                new Update().addToSet("skills", skill), Student.class);
    }
}

// in a controller
@GetMapping("/api/students/filter")
public List<Student> filter(@RequestParam(required = false) String course,
                            @RequestParam(required = false) Integer minMarks,
                            @RequestParam(required = false) String city) {
    return queryService.filter(course, minMarks, city);
}

@PatchMapping("/api/students/bonus")
public Map<String, Object> bonus(@RequestParam String course, @RequestParam int points) {
    return Map.of("course", course, "updated", queryService.giveBonus(course, points));
}`,
      result: `GET /api/students/filter?course=Java Full Stack&minMarks=60
Log: find using query: { "course" : "Java Full Stack", "marks" : { "$gte" : 60}} fields: Document{{}} for class: class com.example.studentmongo.model.Student in collection: students
Response: [ Anita (82), Rahul (65) ]

PATCH /api/students/bonus?course=Java Full Stack&points=5
Response: { "course": "Java Full Stack", "updated": 2 }
Anita 82 -> 87, Rahul 65 -> 70 (checked in Compass)`,
      explanation: 'Query + Criteria lets you add conditions only when a parameter is present - hard to do with derived method names. updateMulti sends one $inc command to the server; the documents are never loaded into Java, so it is fast and safe from lost updates. The extra condition marks <= 100 - points makes sure nobody crosses 100.',
    },
    {
      title: 'Aggregation: Course-wise Report',
      scenario: 'Show count, average and highest marks per course for passed students (marks >= 40), sorted by average.',
      steps: [
        'Create a Java record CourseStats to hold one result row',
        'Create ReportService with an aggregation pipeline',
        'Expose GET /api/reports/courses and test in Postman',
        'Optional: build the same pipeline in Compass > Aggregations tab to compare',
      ],
      code: `// CourseStats.java
package com.example.studentmongo.model;
public record CourseStats(String course, long total, double avgMarks, int maxMarks) { }

// ReportService.java
package com.example.studentmongo.service;

import com.example.studentmongo.model.CourseStats;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import java.util.List;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
public class ReportService {
    private final MongoTemplate mongoTemplate;
    public ReportService(MongoTemplate mongoTemplate) { this.mongoTemplate = mongoTemplate; }

    public List<CourseStats> courseReport() {
        Aggregation agg = newAggregation(
            match(Criteria.where("marks").gte(40)),
            group("course").count().as("total")
                           .avg("marks").as("avgMarks")
                           .max("marks").as("maxMarks"),
            project("total", "avgMarks", "maxMarks").and("_id").as("course"),
            sort(Sort.Direction.DESC, "avgMarks")
        );
        AggregationResults<CourseStats> results =
            mongoTemplate.aggregate(agg, "students", CourseStats.class);
        return results.getMappedResults();
    }
}

// ReportController.java
@RestController
public class ReportController {
    private final ReportService reportService;
    public ReportController(ReportService reportService) { this.reportService = reportService; }

    @GetMapping("/api/reports/courses")
    public List<CourseStats> courses() { return reportService.courseReport(); }
}

// Same pipeline in mongosh / Compass
db.students.aggregate([
  { $match: { marks: { $gte: 40 } } },
  { $group: { _id: "$course", total: { $sum: 1 }, avgMarks: { $avg: "$marks" }, maxMarks: { $max: "$marks" } } },
  { $project: { total: 1, avgMarks: 1, maxMarks: 1, course: "$_id" } },
  { $sort: { avgMarks: -1 } }
])`,
      result: `Data: Anita(Java Full Stack, 82), Rahul(Java Full Stack, 65), Sneha(Data Analytics, 91), Kiran(Python, 38)

GET /api/reports/courses
[
  { "course": "Data Analytics",  "total": 1, "avgMarks": 91.0, "maxMarks": 91 },
  { "course": "Java Full Stack", "total": 2, "avgMarks": 73.5, "maxMarks": 82 }
]
(Kiran is removed by $match because 38 < 40, so Python does not appear.)`,
      explanation: '$match filters first, $group groups by course (the group key goes into _id), $project renames _id to course so it maps to the record field, and $sort orders by average. Java Full Stack average = (82 + 65) / 2 = 73.5.',
    },
  ],
  interview: [
    { q: 'What is MongoDB?', a: 'MongoDB is an open-source NoSQL document database. It stores data as BSON documents (JSON-like) in collections, has a flexible schema, supports indexes, aggregation, replication (replica sets) and horizontal scaling (sharding).', level: 'Easy' },
    { q: 'Difference between SQL and NoSQL databases?', a: 'SQL: tables with fixed schema, relations with JOINs, SQL language, strong ACID, mostly vertical scaling. NoSQL: flexible data models (document, key-value, column, graph), denormalised/embedded data, horizontal scaling, often eventual consistency. Choose by data shape and access pattern.', level: 'Easy' },
    { q: 'What is _id and ObjectId?', a: 'Every MongoDB document must have a unique _id field (primary key). If you do not provide it, MongoDB generates an ObjectId: a 12-byte value made from a timestamp, a random value and a counter, which is unique across machines.', level: 'Easy' },
    { q: 'Embedding vs referencing - when to use which?', a: 'Embed when the child data is small, belongs to one parent and is read together (address in student, items in an order). Reference (store ids) when data is large, grows without limit, is shared by many parents or updated independently (students and courses).', level: 'Medium' },
    { q: 'MongoRepository vs MongoTemplate?', a: 'MongoRepository is a high-level interface: CRUD and queries from method names or @Query, very little code. MongoTemplate is a lower-level class for dynamic queries (Query/Criteria), partial updates (Update with $set/$inc/$push), upserts, bulk operations and aggregations. Many projects use both.', level: 'Medium' },
    { q: 'How do you write a custom query in a MongoRepository?', a: 'Use @Query with a MongoDB JSON filter, e.g. @Query("{ \'marks\': { \'$gte\': ?0 } }"). ?0, ?1 refer to method parameters. The fields attribute gives a projection, and @Query(..., count = true / delete = true) are also possible.', level: 'Medium' },
    { q: 'What is the aggregation pipeline?', a: 'A sequence of stages that transform documents one after another: $match (filter), $group (group and compute sum/avg/max), $project (shape fields), $sort, $limit, $lookup (join), $unwind (flatten arrays). It is MongoDB\'s equivalent of SQL GROUP BY with joins.', level: 'Medium' },
    { q: 'Why does Spring add a _class field to documents?', a: 'It stores the fully qualified Java class name so that when reading, Spring knows which subclass to create (polymorphism). It can be disabled by customising MappingMongoConverter with a null type mapper if not needed.', level: 'Hard' },
    { q: 'Does MongoDB support transactions?', a: 'Single-document operations are always atomic. Since MongoDB 4.0, multi-document ACID transactions are supported on replica sets (4.2 on sharded clusters). In Spring, register a MongoTransactionManager bean and use @Transactional. A standalone server (like a simple Docker container) does not support them.', level: 'Hard' },
    { q: 'How are indexes created in Spring Data MongoDB?', a: 'Using @Indexed on a field, @CompoundIndex on the class, or @TextIndexed for text search. Since Boot 2.3 automatic creation is off by default - set spring.data.mongodb.auto-index-creation=true or create them with MongoTemplate.indexOps() / mongosh.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Product document (id, name, category, price, tags list, stock) with MongoRepository and endpoints: add product, list by category, products cheaper than a given price sorted by price ascending.',
      hint: 'Derived methods: findByCategory(String) and findByPriceLessThanOrderByPriceAsc(double).',
      solution: `@Document(collection = "products")
public class Product {
    @Id private String id;
    private String name;
    private String category;
    private double price;
    private List<String> tags;
    private int stock;
    // getters and setters
}

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategory(String category);
    List<Product> findByPriceLessThanOrderByPriceAsc(double price);
}

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repo;
    public ProductController(ProductRepository repo) { this.repo = repo; }

    @PostMapping
    public ResponseEntity<Product> add(@RequestBody Product p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
    }
    @GetMapping("/category/{category}")
    public List<Product> byCategory(@PathVariable String category) { return repo.findByCategory(category); }

    @GetMapping("/cheaper")
    public List<Product> cheaper(@RequestParam double price) { return repo.findByPriceLessThanOrderByPriceAsc(price); }
}`,
    },
    {
      task: 'Using MongoTemplate, write a method that reduces stock of a product by a quantity only if enough stock is available, and returns true/false.',
      hint: 'Put the stock check in the query: Criteria.where("id").is(id).and("stock").gte(qty), then updateFirst with inc("stock", -qty). Check getModifiedCount().',
      solution: `@Service
public class StockService {
    private final MongoTemplate mongoTemplate;
    public StockService(MongoTemplate mongoTemplate) { this.mongoTemplate = mongoTemplate; }

    public boolean reduceStock(String productId, int qty) {
        Query q = Query.query(Criteria.where("id").is(productId).and("stock").gte(qty));
        Update u = new Update().inc("stock", -qty);
        UpdateResult r = mongoTemplate.updateFirst(q, u, Product.class);
        return r.getModifiedCount() == 1;   // false = not enough stock (or no product)
    }
}
// Because the check and the update happen in ONE atomic server operation,
// two users can never both buy the last item.`,
    },
    {
      task: 'Write an aggregation that returns total stock value (price * stock) per category, highest first.',
      hint: 'Use project(...).andExpression("price * stock").as("value"), then group("category").sum("value").',
      solution: `public record CategoryValue(String category, double totalValue) { }

public List<CategoryValue> stockValue() {
    Aggregation agg = Aggregation.newAggregation(
        Aggregation.project("category").andExpression("price * stock").as("value"),
        Aggregation.group("category").sum("value").as("totalValue"),
        Aggregation.project("totalValue").and("_id").as("category"),
        Aggregation.sort(Sort.Direction.DESC, "totalValue"));
    return mongoTemplate.aggregate(agg, "products", CategoryValue.class).getMappedResults();
}

// mongosh equivalent
db.products.aggregate([
  { $project: { category: 1, value: { $multiply: ["$price", "$stock"] } } },
  { $group: { _id: "$category", totalValue: { $sum: "$value" } } },
  { $sort: { totalValue: -1 } }
])`,
    },
    {
      task: 'Add a paginated endpoint GET /api/students/page?page=0&size=5&sort=marks,desc using MongoRepository.',
      hint: 'MongoRepository already extends PagingAndSortingRepository; accept a Pageable parameter.',
      solution: `@GetMapping("/api/students/page")
public Page<Student> page(@PageableDefault(size = 5, sort = "marks", direction = Sort.Direction.DESC) Pageable pageable) {
    return repo.findAll(pageable);
}
// Response contains "content": [...], "totalElements", "totalPages", "number", "size".
// Spring Data issues a find with skip/limit plus a countDocuments query.`,
    },
  ],
  quiz: [
    { question: 'In MongoDB, a "collection" is similar to which SQL concept?', options: ['Database', 'Row', 'Table', 'Column'], answer: 2, explanation: 'Collection = table, document = row, field = column.' },
    { question: 'Which annotation maps a Java class to a MongoDB collection?', options: ['@Entity', '@Table', '@Collection', '@Document'], answer: 3, explanation: '@Document(collection = "students") is the Spring Data MongoDB mapping annotation. @Entity is JPA.' },
    { question: 'Which stage of an aggregation pipeline is like SQL WHERE?', options: ['$match', '$group', '$project', '$sort'], answer: 0, explanation: '$match filters documents; put it early in the pipeline.' },
    { question: 'Which is the best choice to increase marks of all students of one course in a single server call?', options: ['findAll() then save() in a loop', 'mongoTemplate.updateMulti(query, new Update().inc("marks", 5), Student.class)', 'repo.deleteAll() and insert again', '@Query with a JOIN'], answer: 1, explanation: 'updateMulti with $inc updates on the server without loading documents into Java.' },
    { question: 'What is the default port of MongoDB?', options: ['3306', '6379', '27017', '5432'], answer: 2, explanation: '27017 is MongoDB. 3306 = MySQL, 6379 = Redis, 5432 = PostgreSQL.' },
  ],
};
