export default {
  id: 'day-20-spring-batch-scheduling',
  title: 'Spring Batch and Scheduling: @Scheduled, Cron, @Async and a CSV to Database Import Job',
  module: 'Module 5: Spring Ecosystem Extras',
  day: 20,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Run code automatically at fixed times with @Scheduled (fixedRate, fixedDelay, cron), run slow work in the background with @Async, and process large files reliably with Spring Batch 5 (Job, Step, ItemReader, ItemProcessor, ItemWriter) by building a CSV to MySQL import job.',
  objectives: [
    'Schedule tasks with @EnableScheduling and @Scheduled using fixedRate, fixedDelay, initialDelay and cron',
    'Write correct 6-field Spring cron expressions and use time zones',
    'Run methods asynchronously with @EnableAsync, @Async, CompletableFuture and a custom thread pool',
    'Explain Spring Batch architecture: Job, Step, chunk, JobRepository, JobLauncher, JobParameters',
    'Build a CSV to database import job with reader, processor, writer, skip logic and a listener',
  ],
  theory: [
    {
      heading: 'Scheduling with @Scheduled',
      content:
        'Many applications need jobs that run without a user request: send reminder emails at 9 AM, delete expired OTPs every 10 minutes, generate a daily sales report at midnight.\n\nSteps:\n1. Add @EnableScheduling on a @Configuration class (or the main class).\n2. Put @Scheduled on a public void method with NO parameters inside a Spring bean.\n\nOptions:\n- fixedRate = 5000: start every 5 seconds measured from the START of the previous run.\n- fixedDelay = 5000: wait 5 seconds after the previous run FINISHES.\n- initialDelay = 10000: wait 10 seconds after startup before the first run.\n- cron = "0 0 9 * * MON-FRI": calendar-based schedule.\n- zone = "Asia/Kolkata": time zone for cron.\n- Use fixedRateString = "${app.cleanup.rate}" or cron = "${app.report.cron}" to read the value from properties.\n\nAnalogy: fixedRate is a school bell that rings every 45 minutes no matter what. fixedDelay is a teacher who takes a 10-minute break after each class ends, however long the class was.',
      points: [
        'By default ALL scheduled methods share ONE thread (scheduling-1). A slow job delays the others. Increase with spring.task.scheduling.pool.size=5',
        'With fixedRate, if a run takes longer than the rate, the next run starts right after it finishes (no overlap on the same method)',
        'In a cluster of 3 instances, the job runs 3 times! Use ShedLock or Quartz (clustered) to run it once',
        'Exceptions in a scheduled method are logged and the schedule continues',
      ],
    },
    {
      heading: 'Spring Cron Expressions',
      content:
        'Spring cron has 6 fields (Linux cron has 5 - Spring adds seconds at the start):\nsecond  minute  hour  day-of-month  month  day-of-week\n\nSpecial characters: * (every), ? (no specific value, for day fields), - (range), , (list), / (step), L (last), # (nth weekday, e.g. MON#1 = first Monday).\n\nExamples:\n"0 * * * * *" -> every minute at second 0\n"*/10 * * * * *" -> every 10 seconds\n"0 0 9 * * MON-FRI" -> 9:00 AM on weekdays\n"0 30 23 * * *" -> 11:30 PM every day\n"0 0 0 1 * *" -> midnight on the 1st of every month\n"0 0 */2 * * *" -> every 2 hours\n"0 0 10 L * *" -> 10 AM on the last day of the month\n\nMacros: @hourly, @daily, @weekly, @monthly, @yearly.',
      tip: 'Common mistake: copying a 5-field Linux cron like "0 9 * * *" into Spring. Spring throws IllegalStateException: Cron expression must consist of 6 fields. Add the seconds field: "0 0 9 * * *".',
    },
    {
      heading: '@Async - Run in the Background',
      content:
        'Some work is slow but the user should not wait: sending an email after registration, generating a PDF, calling a slow third-party API.\n\n1. @EnableAsync on a configuration class.\n2. @Async on a public method of a Spring bean. The caller returns immediately; the method runs in another thread from a pool.\n3. Return type: void (fire and forget) or CompletableFuture<T> (caller can wait for or combine results).\n\nSpring Boot auto-configures a ThreadPoolTaskExecutor (threads named task-1, task-2...). Configure with spring.task.execution.pool.core-size, max-size, queue-capacity, or define your own executor bean and use @Async("emailExecutor").',
      points: [
        'Same proxy rule as caching and @Transactional: calling an @Async method from the same class runs it synchronously',
        'Exceptions in void @Async methods are not seen by the caller; use AsyncUncaughtExceptionHandler or CompletableFuture',
        'The @Async method runs in a new thread, so it does not join the caller\'s transaction or security context by default',
      ],
    },
    {
      heading: 'Spring Batch Architecture',
      content:
        'Spring Batch is a framework for processing LARGE volumes of data reliably: importing 10 lakh rows from CSV, month-end salary calculation, migrating data between databases, sending monthly bank statements.\n\nWhy not just a for-loop? Batch gives: chunk-based transactions, restart from the failure point, skip/retry of bad records, job history and statistics, parallel processing.\n\nBuilding blocks:\n- Job: the whole batch process (e.g. importStudentJob). Made of one or more Steps.\n- Step: one phase. Usually a CHUNK step = ItemReader -> ItemProcessor -> ItemWriter. Or a Tasklet step for a single task (delete a file).\n- ItemReader: reads one item at a time (FlatFileItemReader for CSV, JdbcCursorItemReader, JpaPagingItemReader).\n- ItemProcessor: transforms/validates one item; returning null FILTERS the item out.\n- ItemWriter: writes a whole chunk (list) at once (JdbcBatchItemWriter, JpaItemWriter, RepositoryItemWriter).\n- JobRepository: stores execution metadata in BATCH_* tables (JOB_INSTANCE, JOB_EXECUTION, STEP_EXECUTION...).\n- JobLauncher: starts a job with JobParameters.\n\nChunk processing in words (chunk size 100):\nread 1, process 1 ... read 100, process 100 -> write 100 together -> COMMIT -> next 100.\nIf chunk 7 fails, chunks 1-6 are already committed; on restart Batch continues from chunk 7.',
      points: [
        'JobInstance = Job + identifying JobParameters (e.g. file name + date). A COMPLETED instance cannot run again with the same parameters',
        'JobExecution = one attempt to run a JobInstance (FAILED, then COMPLETED on restart)',
        'Spring Boot 3 / Batch 5: do NOT add @EnableBatchProcessing (it switches off Boot auto-configuration); use new JobBuilder(name, jobRepository) and new StepBuilder(name, jobRepository)',
      ],
    },
    {
      heading: 'Spring Batch Configuration in Boot 3',
      content:
        'Dependency: spring-boot-starter-batch plus a database (MySQL/H2) for the JobRepository.\n\nProperties:\nspring.batch.jdbc.initialize-schema=always -> create BATCH_* tables (use "embedded" for H2 only, or run the schema-mysql.sql script yourself in production).\nspring.batch.job.enabled=true -> run the job automatically at startup (default true; if there are several jobs set spring.batch.job.name). Set false when you launch jobs from a controller or a scheduler.\n\nCombining Batch with @Scheduled: a scheduled method calls jobLauncher.run(job, params) with a unique parameter (like the current time) so each run is a new JobInstance.',
      syntax: '@Bean\npublic Job importJob(JobRepository repo, Step step1) {\n    return new JobBuilder("importStudentJob", repo)\n            .incrementer(new RunIdIncrementer())\n            .start(step1)\n            .build();\n}\n\n@Bean\npublic Step step1(JobRepository repo, PlatformTransactionManager tx) {\n    return new StepBuilder("csvStep", repo)\n            .<StudentCsv, Student>chunk(100, tx)\n            .reader(reader()).processor(processor()).writer(writer())\n            .build();\n}',
    },
  ],
  examples: [
    {
      title: 'Chunk Processing Simulated in Plain Java',
      scenario: 'Understand read-process-write in chunks and skipping bad records before using Spring Batch.',
      steps: [
        'IntelliJ: File > New > Project > Java > Create; add class Main',
        'Type the code below and click Run',
        'Change chunkSize to 3 and predict the new output',
      ],
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> lines = List.of("1,Ravi,78", "2,Sneha,35", "3,Amit,abc", "4,Pooja,91", "5,Karan,55");
        int chunkSize = 2;
        List<String> chunk = new ArrayList<>();
        int read = 0, written = 0, skipped = 0, chunkNo = 0;

        for (String line : lines) {
            read++;                                    // ItemReader
            String[] p = line.split(",");
            int marks;
            try {
                marks = Integer.parseInt(p[2]);
            } catch (NumberFormatException e) {         // skip policy
                skipped++;
                System.out.println("SKIP bad line: " + line);
                continue;
            }
            String processed = p[1].toUpperCase() + " -> " + (marks >= 40 ? "PASS" : "FAIL"); // ItemProcessor
            chunk.add(processed);
            if (chunk.size() == chunkSize) {           // ItemWriter + commit
                chunkNo++;
                System.out.println("Writing chunk " + chunkNo + ": " + chunk);
                written += chunk.size();
                chunk.clear();
            }
        }
        if (!chunk.isEmpty()) {                        // last partial chunk
            chunkNo++;
            System.out.println("Writing chunk " + chunkNo + ": " + chunk);
            written += chunk.size();
            chunk.clear();
        }
        System.out.println("Read=" + read + ", Written=" + written + ", Skipped=" + skipped);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> lines = List.of("1,Ravi,78", "2,Sneha,35", "3,Amit,abc", "4,Pooja,91", "5,Karan,55");
        int chunkSize = 2;
        List<String> chunk = new ArrayList<>();
        int read = 0, written = 0, skipped = 0, chunkNo = 0;

        for (String line : lines) {
            read++;                                    // ItemReader
            String[] p = line.split(",");
            int marks;
            try {
                marks = Integer.parseInt(p[2]);
            } catch (NumberFormatException e) {         // skip policy
                skipped++;
                System.out.println("SKIP bad line: " + line);
                continue;
            }
            String processed = p[1].toUpperCase() + " -> " + (marks >= 40 ? "PASS" : "FAIL"); // ItemProcessor
            chunk.add(processed);
            if (chunk.size() == chunkSize) {           // ItemWriter + commit
                chunkNo++;
                System.out.println("Writing chunk " + chunkNo + ": " + chunk);
                written += chunk.size();
                chunk.clear();
            }
        }
        if (!chunk.isEmpty()) {                        // last partial chunk
            chunkNo++;
            System.out.println("Writing chunk " + chunkNo + ": " + chunk);
            written += chunk.size();
            chunk.clear();
        }
        System.out.println("Read=" + read + ", Written=" + written + ", Skipped=" + skipped);
    }
}`,
        },
      },
      result: `Writing chunk 1: [RAVI -> PASS, SNEHA -> FAIL]
SKIP bad line: 3,Amit,abc
Writing chunk 2: [POOJA -> PASS, KARAN -> PASS]
Read=5, Written=4, Skipped=1`,
      explanation: 'Items are read and processed one by one but written in groups of 2. The bad line "abc" cannot be parsed, so it is skipped and does not fill a chunk slot. Spring Batch does exactly this, plus a database transaction per chunk and saving progress in BATCH_STEP_EXECUTION so it can restart.',
    },
    {
      title: '@Scheduled with fixedRate, fixedDelay and cron',
      scenario: 'Create a heartbeat log every 5 seconds, a cleanup job with fixedDelay, and a daily report at 9 AM IST on weekdays.',
      steps: [
        'start.spring.io: Spring Boot 3.3.x, Java 17, Artifact batch-demo. Dependencies: Spring Web, Spring Batch, Spring Data JPA, MySQL Driver (or H2), Lombok optional > GENERATE',
        'Add @EnableScheduling to a config class',
        'Create ScheduledTasks as a @Component',
        'Run the app and watch the console for 20 seconds',
      ],
      code: `# application.properties
spring.task.scheduling.pool.size=3
app.report.cron=0 0 9 * * MON-FRI

// config/SchedulingConfig.java
@Configuration
@EnableScheduling
public class SchedulingConfig { }

// ScheduledTasks.java
package com.example.batchdemo.tasks;

import org.slf4j.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Component
public class ScheduledTasks {
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);
    private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Scheduled(fixedRate = 5000)
    public void heartbeat() {
        log.info("Heartbeat at {}", LocalTime.now().format(F));
    }

    @Scheduled(initialDelay = 2000, fixedDelay = 10000)
    public void cleanup() throws InterruptedException {
        log.info("Cleanup started");
        Thread.sleep(3000);                         // pretend work takes 3 seconds
        log.info("Cleanup finished - deleted expired OTPs");
    }

    @Scheduled(cron = "\${app.report.cron}", zone = "Asia/Kolkata")
    public void dailyReport() {
        log.info("Generating daily sales report...");
    }
}`,
      result: `Started BatchDemoApplication in 2.9 seconds
10:15:00.112 [scheduling-1] INFO  ScheduledTasks : Heartbeat at 10:15:00
10:15:02.110 [scheduling-2] INFO  ScheduledTasks : Cleanup started
10:15:05.111 [scheduling-1] INFO  ScheduledTasks : Heartbeat at 10:15:05
10:15:05.112 [scheduling-2] INFO  ScheduledTasks : Cleanup finished - deleted expired OTPs
10:15:10.111 [scheduling-1] INFO  ScheduledTasks : Heartbeat at 10:15:10
10:15:15.111 [scheduling-3] INFO  ScheduledTasks : Heartbeat at 10:15:15
10:15:15.113 [scheduling-2] INFO  ScheduledTasks : Cleanup started
(Times depend on when you start the app; thread numbers may differ.)`,
      explanation: 'Heartbeat starts every 5 s from the start of the previous run. Cleanup starts 2 s after startup, runs 3 s, and starts again 10 s after it FINISHED (05 + 10 = 15). The cron job runs only at 09:00:00 IST Monday to Friday. Because the pool size is 3, the slow cleanup does not block the heartbeat; with the default size 1 they would wait for each other. The cron expression is read from properties using placeholder syntax.',
    },
    {
      title: '@Async Email Sending with CompletableFuture',
      scenario: 'Registration API returns immediately while a welcome email is "sent" in the background; also run two slow calls in parallel.',
      steps: [
        'Create AsyncConfig with @EnableAsync and a custom executor bean',
        'Create EmailService with @Async methods',
        'Create RegistrationController and call POST /api/register?email=ravi@gmail.com',
      ],
      code: `// config/AsyncConfig.java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "emailExecutor")
    public ThreadPoolTaskExecutor emailExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(2);
        ex.setMaxPoolSize(5);
        ex.setQueueCapacity(100);
        ex.setThreadNamePrefix("email-");
        ex.initialize();
        return ex;
    }
}

// service/EmailService.java
@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Async("emailExecutor")
    public void sendWelcomeEmail(String email) {
        log.info("Sending welcome email to {}", email);
        sleep(3000);                                // slow SMTP call
        log.info("Email sent to {}", email);
    }

    @Async("emailExecutor")
    public CompletableFuture<String> fetchMarks(String roll) {
        sleep(2000);
        return CompletableFuture.completedFuture("Marks of " + roll + " = 82");
    }

    @Async("emailExecutor")
    public CompletableFuture<String> fetchAttendance(String roll) {
        sleep(2000);
        return CompletableFuture.completedFuture("Attendance of " + roll + " = 91%");
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

// controller/RegistrationController.java
@RestController
public class RegistrationController {
    private static final Logger log = LoggerFactory.getLogger(RegistrationController.class);
    private final EmailService emailService;
    public RegistrationController(EmailService emailService) { this.emailService = emailService; }

    @PostMapping("/api/register")
    public Map<String, String> register(@RequestParam String email) {
        log.info("Saving user {}", email);
        emailService.sendWelcomeEmail(email);       // returns immediately
        log.info("Responding to client");
        return Map.of("status", "Registered. Check your email.");
    }

    @GetMapping("/api/report/{roll}")
    public List<String> report(@PathVariable String roll) {
        long start = System.currentTimeMillis();
        CompletableFuture<String> m = emailService.fetchMarks(roll);
        CompletableFuture<String> a = emailService.fetchAttendance(roll);
        CompletableFuture.allOf(m, a).join();       // both run in parallel
        log.info("Report built in {} ms", System.currentTimeMillis() - start);
        return List.of(m.join(), a.join());
    }
}`,
      result: `POST /api/register?email=ravi@gmail.com -> response in about 10 ms
{ "status": "Registered. Check your email." }
Console:
[nio-8080-exec-1] RegistrationController : Saving user ravi@gmail.com
[nio-8080-exec-1] RegistrationController : Responding to client
[email-1]         EmailService           : Sending welcome email to ravi@gmail.com
[email-1]         EmailService           : Email sent to ravi@gmail.com      (3 seconds later)
(The first two lines can appear in a slightly different order relative to the email-1 line because two threads run at the same time.)

GET /api/report/R101 -> ["Marks of R101 = 82", "Attendance of R101 = 91%"]
Console: Report built in 2006 ms   (about 2 seconds, not 4, because both ran in parallel)`,
      explanation: 'The controller thread (http-nio-8080-exec-1) does not wait for the email; a thread from emailExecutor runs it. For the report, two @Async calls start together and allOf().join() waits for both, so total time is about max(2, 2) = 2 seconds. Remember: the @Async methods are in a different bean (EmailService) so the proxy works.',
    },
    {
      title: 'Spring Batch: Import students.csv into MySQL',
      scenario: 'Read a CSV file, validate and transform each row, write valid rows to the students table in chunks of 3, skip bad rows, and print a summary.',
      steps: [
        'Put students.csv in src/main/resources (content shown at the top of the code)',
        'Create database: CREATE DATABASE batch_db; and add the properties',
        'Create the Student entity and StudentRepository (JPA)',
        'Create StudentCsv record, StudentProcessor, JobCompletionListener and BatchConfig',
        'Run the application: because spring.batch.job.enabled=true, the job runs at startup. Check the console and SELECT * FROM students in MySQL Workbench',
      ],
      code: `# src/main/resources/students.csv
rollNo,name,email,marks
101,Ravi Kumar,ravi@gmail.com,78
102,Sneha Patil,sneha@gmail.com,35
103,Amit Shah,amit@gmail.com,abc
104,Pooja Nair,pooja@gmail.com,91
105,Karan Mehta,,55
106,Divya Rao,divya@gmail.com,66

<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/batch_db
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.batch.jdbc.initialize-schema=always
spring.batch.job.enabled=true

// entity/Student.java
@Entity
@Table(name = "students")
public class Student {
    @Id
    private Integer rollNo;
    private String name;
    private String email;
    private Integer marks;
    private String result;
    public Student() { }
    public Student(Integer rollNo, String name, String email, Integer marks, String result) {
        this.rollNo = rollNo; this.name = name; this.email = email; this.marks = marks; this.result = result;
    }
    // getters and setters
}

// repository/StudentRepository.java
public interface StudentRepository extends JpaRepository<Student, Integer> { }

// batch/StudentCsv.java  - one CSV line as read (all text)
public record StudentCsv(String rollNo, String name, String email, String marks) { }

// batch/StudentProcessor.java
@Component
public class StudentProcessor implements ItemProcessor<StudentCsv, Student> {
    private static final Logger log = LoggerFactory.getLogger(StudentProcessor.class);

    @Override
    public Student process(StudentCsv in) {
        if (in.email() == null || in.email().isBlank()) {
            log.warn("Filtered roll {}: email missing", in.rollNo());
            return null;                       // null = filter (not written, not an error)
        }
        int marks = Integer.parseInt(in.marks().trim());   // "abc" -> NumberFormatException -> skip
        String result = marks >= 40 ? "PASS" : "FAIL";
        return new Student(Integer.valueOf(in.rollNo().trim()), in.name().trim().toUpperCase(),
                           in.email().trim().toLowerCase(), marks, result);
    }
}

// batch/JobCompletionListener.java
@Component
public class JobCompletionListener implements JobExecutionListener {
    private static final Logger log = LoggerFactory.getLogger(JobCompletionListener.class);

    @Override
    public void afterJob(JobExecution jobExecution) {
        for (StepExecution s : jobExecution.getStepExecutions()) {
            log.info("Step {}: read={}, written={}, filtered={}, skipped={}",
                s.getStepName(), s.getReadCount(), s.getWriteCount(), s.getFilterCount(), s.getSkipCount());
        }
        log.info("Job finished with status {}", jobExecution.getStatus());
    }
}

// batch/BatchConfig.java
package com.example.batchdemo.batch;

import com.example.batchdemo.entity.Student;
import com.example.batchdemo.repository.StudentRepository;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.data.RepositoryItemWriter;
import org.springframework.batch.item.data.builder.RepositoryItemWriterBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.context.annotation.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfig {

    @Bean
    public FlatFileItemReader<StudentCsv> reader() {
        return new FlatFileItemReaderBuilder<StudentCsv>()
                .name("studentCsvReader")
                .resource(new ClassPathResource("students.csv"))
                .linesToSkip(1)                                  // header line
                .delimited()
                .names("rollNo", "name", "email", "marks")
                .targetType(StudentCsv.class)                    // maps to the record
                .build();
    }

    @Bean
    public RepositoryItemWriter<Student> writer(StudentRepository repo) {
        return new RepositoryItemWriterBuilder<Student>()
                .repository(repo)
                .methodName("save")
                .build();
    }

    @Bean
    public Step csvStep(JobRepository jobRepository, PlatformTransactionManager tx,
                        FlatFileItemReader<StudentCsv> reader, StudentProcessor processor,
                        RepositoryItemWriter<Student> writer) {
        return new StepBuilder("csvStep", jobRepository)
                .<StudentCsv, Student>chunk(3, tx)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .faultTolerant()
                .skip(NumberFormatException.class)
                .skipLimit(10)
                .build();
    }

    @Bean
    public Job importStudentJob(JobRepository jobRepository, Step csvStep, JobCompletionListener listener) {
        return new JobBuilder("importStudentJob", jobRepository)
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .start(csvStep)
                .build();
    }
}`,
      result: `Console:
INFO o.s.b.a.b.JobLauncherApplicationRunner : Running default command line with: []
INFO o.s.b.c.l.support.SimpleJobLauncher   : Job: [SimpleJob: [name=importStudentJob]] launched with the following parameters: [{'run.id':'{value=1, type=class java.lang.Long, identifying=true}'}]
INFO o.s.batch.core.job.SimpleStepHandler  : Executing step: [csvStep]
WARN c.e.batchdemo.batch.StudentProcessor  : Filtered roll 105: email missing
INFO o.s.batch.core.step.AbstractStep      : Step: [csvStep] executed in 214ms
INFO c.e.b.batch.JobCompletionListener     : Step csvStep: read=6, written=4, filtered=1, skipped=1
INFO c.e.b.batch.JobCompletionListener     : Job finished with status COMPLETED
INFO o.s.b.c.l.support.SimpleJobLauncher   : Job: [SimpleJob: [name=importStudentJob]] completed with the following parameters: [{...}] and the following status: [COMPLETED] in 268ms

MySQL> SELECT * FROM students;
+---------+-------------+-----------------+-------+--------+
| roll_no | name        | email           | marks | result |
+---------+-------------+-----------------+-------+--------+
|     101 | RAVI KUMAR  | ravi@gmail.com  |    78 | PASS   |
|     102 | SNEHA PATIL | sneha@gmail.com |    35 | FAIL   |
|     104 | POOJA NAIR  | pooja@gmail.com |    91 | PASS   |
|     106 | DIVYA RAO   | divya@gmail.com |    66 | PASS   |
+---------+-------------+-----------------+-------+--------+`,
      explanation: 'The reader skips the header and maps each line to the StudentCsv record. Roll 105 is FILTERED (processor returned null), roll 103 is SKIPPED (NumberFormatException is in the skip list) - both are counted separately. Valid items are saved in chunks of 3, each chunk in its own transaction. Batch also writes history into BATCH_JOB_EXECUTION and BATCH_STEP_EXECUTION - open them in Workbench to see READ_COUNT, WRITE_COUNT, SKIP counts and STATUS. Running the app again creates run.id=2 thanks to RunIdIncrementer; save() simply updates the same rows because rollNo is the id.',
    },
    {
      title: 'Launch the Batch Job from a REST Endpoint and a Scheduler',
      scenario: 'Disable startup run; start the import job on demand with POST /api/jobs/import and also every night at 1 AM.',
      steps: [
        'Set spring.batch.job.enabled=false in application.properties',
        'Create JobTriggerController and NightlyImportScheduler as below',
        'Call POST http://localhost:8080/api/jobs/import from Postman',
      ],
      code: `# application.properties
spring.batch.job.enabled=false

// JobTriggerController.java
@RestController
@RequestMapping("/api/jobs")
public class JobTriggerController {
    private final JobLauncher jobLauncher;
    private final Job importStudentJob;

    public JobTriggerController(JobLauncher jobLauncher, Job importStudentJob) {
        this.jobLauncher = jobLauncher;
        this.importStudentJob = importStudentJob;
    }

    @PostMapping("/import")
    public Map<String, Object> runImport() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("startAt", System.currentTimeMillis())   // unique -> new JobInstance
                .toJobParameters();
        JobExecution exec = jobLauncher.run(importStudentJob, params);
        return Map.of("jobId", exec.getJobId(), "status", exec.getStatus().toString());
    }
}

// NightlyImportScheduler.java
@Component
public class NightlyImportScheduler {
    private static final Logger log = LoggerFactory.getLogger(NightlyImportScheduler.class);
    private final JobLauncher jobLauncher;
    private final Job importStudentJob;

    public NightlyImportScheduler(JobLauncher jobLauncher, Job importStudentJob) {
        this.jobLauncher = jobLauncher;
        this.importStudentJob = importStudentJob;
    }

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    public void runNightly() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("runDate", java.time.LocalDate.now().toString())
                .toJobParameters();
        JobExecution exec = jobLauncher.run(importStudentJob, params);
        log.info("Nightly import finished: {}", exec.getStatus());
    }
}`,
      result: `POST /api/jobs/import -> 200
{ "jobId": 2, "status": "COMPLETED" }
(Map.of key order in JSON may differ; jobId depends on how many times you ran it.)

Calling it again works too because startAt is different every time.
If you used fixed parameters and the instance had COMPLETED, Spring Batch throws:
JobInstanceAlreadyCompleteException: A job instance already exists and is complete for identifying parameters={...}`,
      explanation: 'The default JobLauncher runs synchronously, so the HTTP request waits until the job finishes and returns COMPLETED. For long jobs configure an async TaskExecutorJobLauncher and return 202 Accepted with the job id. The nightly job uses the date as parameter, so it can run only once per day - a safety net against accidental double imports.',
    },
  ],
  interview: [
    { q: 'Difference between fixedRate and fixedDelay?', a: 'fixedRate schedules each run at a fixed interval from the START of the previous run. fixedDelay waits the given time after the previous run FINISHES. Use fixedDelay when runs must not crowd each other (e.g. polling a slow API).', level: 'Easy' },
    { q: 'How many fields does a Spring cron expression have? Give an example.', a: 'Six: second, minute, hour, day of month, month, day of week. "0 0 9 * * MON-FRI" runs at 9:00:00 on weekdays. Linux crontab has 5 fields (no seconds).', level: 'Easy' },
    { q: 'Why might a @Scheduled job run multiple times in production?', a: 'Every application instance has its own scheduler. With 3 pods, the job runs 3 times. Use a distributed lock (ShedLock with a DB/Redis table), Quartz in clustered mode, or run the scheduler in only one dedicated instance.', level: 'Medium' },
    { q: 'What is @Async and what are its pitfalls?', a: '@Async runs a bean method in a separate thread from a TaskExecutor; requires @EnableAsync. Pitfalls: self-invocation does not work (proxy), method must be public, exceptions in void methods are lost unless handled, transactions/security context are not propagated, and an unbounded queue can hide overload.', level: 'Medium' },
    { q: 'What is Spring Batch? Name its main components.', a: 'A framework for robust, high-volume batch processing. Components: Job, Step, ItemReader, ItemProcessor, ItemWriter, JobRepository (metadata), JobLauncher, JobParameters, JobExecution/StepExecution, listeners.', level: 'Easy' },
    { q: 'What is chunk-oriented processing?', a: 'Items are read and processed one at a time and collected into a chunk of N; the whole chunk is written at once and committed in one transaction. It balances performance (batch writes) and safety (a failure only rolls back one chunk), and enables restart from the last committed chunk.', level: 'Medium' },
    { q: 'Difference between a chunk step and a Tasklet step?', a: 'A chunk step uses reader/processor/writer for item-by-item data. A Tasklet step executes a single execute() method once (or until it returns FINISHED) - used for tasks like deleting a temp file, calling a stored procedure, or sending a completion email.', level: 'Medium' },
    { q: 'What is the difference between JobInstance and JobExecution?', a: 'JobInstance is a logical run identified by job name + identifying JobParameters (e.g. import for date 2025-01-31). JobExecution is one attempt to run that instance. A failed instance can have several executions; once COMPLETED it cannot run again with the same parameters.', level: 'Hard' },
    { q: 'What happens if an ItemProcessor returns null?', a: 'The item is filtered: it is not passed to the writer and the filterCount of the StepExecution increases. It is not an error and does not count as a skip.', level: 'Medium' },
    { q: 'How do skip and retry work in Spring Batch?', a: 'After .faultTolerant(), .skip(Exception.class).skipLimit(n) skips bad items up to n times instead of failing the step; .retry(Exception.class).retryLimit(n) re-attempts an item on temporary errors (like deadlocks or network glitches). SkipListener can log skipped items to an error file.', level: 'Hard' },
    { q: 'Why should you not use @EnableBatchProcessing in Spring Boot 3?', a: 'In Spring Batch 5 / Boot 3, adding @EnableBatchProcessing (or extending DefaultBatchConfiguration) tells Boot to back off its batch auto-configuration - so jobs are not run at startup automatically and spring.batch.* properties like initialize-schema are ignored. Use it only when you want full manual control.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a scheduled job that runs every 30 seconds and deletes OTP records older than 5 minutes from an otp table using a JPA repository method.',
      hint: 'Derived delete method: deleteByCreatedAtBefore(LocalDateTime time) with @Transactional; use @Scheduled(fixedRate = 30000).',
      solution: `@Entity
public class Otp {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String mobile;
    private String code;
    private LocalDateTime createdAt = LocalDateTime.now();
    // getters and setters
}

public interface OtpRepository extends JpaRepository<Otp, Long> {
    @Transactional
    long deleteByCreatedAtBefore(LocalDateTime time);
}

@Component
public class OtpCleanupJob {
    private static final Logger log = LoggerFactory.getLogger(OtpCleanupJob.class);
    private final OtpRepository repo;
    public OtpCleanupJob(OtpRepository repo) { this.repo = repo; }

    @Scheduled(fixedRate = 30000)
    public void cleanup() {
        long deleted = repo.deleteByCreatedAtBefore(LocalDateTime.now().minusMinutes(5));
        log.info("Deleted {} expired OTPs", deleted);
    }
}
// Remember @EnableScheduling on a configuration class.`,
    },
    {
      task: 'Write cron expressions for: (a) every 15 minutes, (b) 6:30 PM every Saturday, (c) 8 AM on the 1st and 15th of each month, (d) every 5 seconds between 9 AM and 5 PM on weekdays.',
      hint: 'Fields: second minute hour day-of-month month day-of-week.',
      solution: `(a) "0 */15 * * * *"
(b) "0 30 18 * * SAT"
(c) "0 0 8 1,15 * *"
(d) "*/5 * 9-16 * * MON-FRI"   // hours 9..16 means up to 16:59:55, i.e. before 5 PM`,
    },
    {
      task: 'Create a Tasklet step that runs BEFORE the CSV import step and prints how many rows exist in the students table, then make the job run cleanupStep -> csvStep.',
      hint: 'new StepBuilder("countStep", repo).tasklet((contribution, ctx) -> { ...; return RepeatStatus.FINISHED; }, tx).',
      solution: `@Bean
public Step countStep(JobRepository jobRepository, PlatformTransactionManager tx, StudentRepository repo) {
    return new StepBuilder("countStep", jobRepository)
            .tasklet((contribution, chunkContext) -> {
                System.out.println("Rows before import: " + repo.count());
                return RepeatStatus.FINISHED;
            }, tx)
            .build();
}

@Bean
public Job importStudentJob(JobRepository jobRepository, Step countStep, Step csvStep,
                            JobCompletionListener listener) {
    return new JobBuilder("importStudentJob", jobRepository)
            .incrementer(new RunIdIncrementer())
            .listener(listener)
            .start(countStep)
            .next(csvStep)
            .build();
}
// Console on a fresh DB: Rows before import: 0, then the csvStep logs.`,
    },
    {
      task: 'Change the writer of the CSV job to JdbcBatchItemWriter using an INSERT ... ON DUPLICATE KEY UPDATE SQL so re-runs update existing rows efficiently.',
      hint: 'JdbcBatchItemWriterBuilder with .dataSource(ds).sql(...).beanMapped() and named parameters matching getters.',
      solution: `@Bean
public JdbcBatchItemWriter<Student> jdbcWriter(DataSource dataSource) {
    return new JdbcBatchItemWriterBuilder<Student>()
            .dataSource(dataSource)
            .sql("INSERT INTO students (roll_no, name, email, marks, result) " +
                 "VALUES (:rollNo, :name, :email, :marks, :result) " +
                 "ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), " +
                 "marks = VALUES(marks), result = VALUES(result)")
            .beanMapped()          // :rollNo -> getRollNo() etc.
            .build();
}
// In csvStep use .writer(jdbcWriter) - it sends each chunk as one JDBC batch,
// which is much faster than calling save() per item.`,
    },
  ],
  quiz: [
    { question: 'Which annotation is required to activate @Scheduled methods?', options: ['@EnableAsync', '@EnableBatchProcessing', '@EnableScheduling', '@EnableCron'], answer: 2, explanation: '@EnableScheduling registers the scheduled-task processor.' },
    { question: 'What does the Spring cron "0 0 9 * * MON-FRI" mean?', options: ['Every 9 minutes on weekdays', '9:00 AM Monday to Friday', '9 seconds past every minute', 'Midnight on the 9th of each month'], answer: 1, explanation: 'second=0, minute=0, hour=9, any day, any month, Monday-Friday.' },
    { question: 'In Spring Batch, what happens when an ItemProcessor returns null?', options: ['The item is filtered and not written', 'The job fails', 'The item is retried', 'null is inserted into the database'], answer: 0, explanation: 'Returning null filters the item; filterCount increases.' },
    { question: 'Where does Spring Batch store job execution history?', options: ['In application.properties', 'In log files only', 'In memory, lost on restart', 'In the BATCH_* tables managed by the JobRepository'], answer: 3, explanation: 'JobRepository persists JobInstance, JobExecution and StepExecution data to BATCH_* tables.' },
    { question: 'Calling an @Async method from another method in the SAME class will...', options: ['Run in a new thread', 'Throw an exception', 'Run synchronously because the proxy is bypassed', 'Be queued forever'], answer: 2, explanation: 'Like @Transactional and @Cacheable, @Async works through a proxy, so internal calls are not intercepted.' },
  ],
};
