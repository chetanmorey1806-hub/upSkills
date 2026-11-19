export default {
  lesson: 'day-20-spring-batch-scheduling',
  minutes: 24,
  intro: 'Schedule jobs with @Scheduled and cron, run background work with @Async and reason about Spring Batch chunk processing.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Your `@Scheduled` method never runs. Which annotation is missing on a configuration class?',
      example: { title: 'a scheduled method', code: '@Scheduled(fixedRate = 60000)\npublic void syncRates() { ... }' },
      accept: ['@EnableScheduling'],
      explain: '`@EnableScheduling` starts Spring\'s task scheduler. Scheduled methods must have no parameters and return void, and the class must be a Spring bean.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Each run of the task takes exactly **2 seconds**. The app starts at second 0 and the first run starts at 0. Type the start seconds of the **first three runs**, separated by spaces: line 1 for `fixedDelay = 5000`, line 2 for `fixedRate = 5000`.',
      example: { title: 'the difference', text: 'fixedDelay waits AFTER the previous run ends; fixedRate counts from the previous START.' },
      code: `@Scheduled(fixedDelay = 5000)
public void a() { work2Seconds(); }

@Scheduled(fixedRate = 5000)
public void b() { work2Seconds(); }`,
      expected: '0 7 14\n0 5 10',
      explain: '**fixedDelay**: run 0-2, wait 5 → start 7, ends 9, wait 5 → start 14. **fixedRate**: starts every 5 seconds from the previous start → 0, 5, 10 (the 2-second work fits inside the interval).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the Spring cron expression (6 fields) for **every day at 2:00 AM** (for the nightly CSV import).',
      example: { title: 'the 6 fields', code: '"0 30 9 * * MON-FRI"   // sec min hour day month weekday → 9:30 AM on weekdays' },
      accept: ['0 0 2 * * *', '"0 0 2 * * *"', '0 0 2 * * ?', '"0 0 2 * * ?"'],
      explain: 'Spring cron = **second minute hour day-of-month month day-of-week**: `0 0 2 * * *`. Linux crontab has only 5 fields (no seconds) - copying one into Spring is a classic mistake. Add `zone = "Asia/Kolkata"` to be explicit about time zones.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A registration endpoint calls `emailService.sendWelcome(user)` annotated with `@Async`, but the HTTP response still waits for the email. What is the most likely reason?',
      options: [
        '@Async only works with Kafka',
        '@EnableAsync is missing, or the method is called from inside the same class (self-invocation bypasses the proxy)',
        'Email cannot be sent asynchronously',
        '@Async methods must return String',
      ],
      answer: 1,
      explain: '`@Async` needs **@EnableAsync** and a call through the Spring proxy (from another bean). Async methods return `void` or `CompletableFuture<T>`. Configure a `ThreadPoolTaskExecutor` instead of relying on defaults.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A chunk-oriented step reads a CSV with **23** student rows using `.chunk(10)`. The processor returns `null` for **4** invalid rows (filtered). How many times is the writer\'s `write(chunk)` called, and how many students are written in total? (two lines)',
      example: { title: 'chunk processing', text: 'Read up to N items → process each → write the whole chunk in one transaction → repeat.' },
      code: `new StepBuilder("importStudents", jobRepository)
    .<StudentCsv, Student>chunk(10, txManager)
    .reader(csvReader)       // FlatFileItemReader, 23 rows
    .processor(validator)    // returns null for 4 bad rows
    .writer(dbWriter)
    .build();`,
      expected: '3\n19',
      explain: '23 rows in chunks of 10 → 10, 10, 3 = **3** chunks, so 3 write calls (each in its own transaction). Returning `null` from a processor **filters** the item, so 23 − 4 = **19** students are written.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **Spring Batch** are TRUE? (choose all that apply)',
      options: [
        'A Job is made of one or more Steps',
        'A chunk step uses an ItemReader, an optional ItemProcessor and an ItemWriter',
        'The JobRepository stores execution metadata, so a failed job can be restarted',
        'Spring Batch is meant for real-time chat messages',
        'FlatFileItemReader reads CSV files line by line',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Batch is for large, repeatable **bulk** jobs (imports, reports, billing), not real-time messaging. Metadata tables (BATCH_JOB_INSTANCE, BATCH_STEP_EXECUTION ...) make restarts and monitoring possible.',
    },
  ],
};
