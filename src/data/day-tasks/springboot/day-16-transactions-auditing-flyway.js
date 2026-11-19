export default {
  lesson: 'day-16-transactions-auditing-flyway',
  minutes: 25,
  intro: 'Predict commit and rollback with @Transactional, enable JPA auditing and name Flyway migrations correctly.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Account A has 1000 and B has 500. `transfer("A", "B", 300)` is called from a controller and throws. After the call, what are the balances in the database? Type `A B`, e.g. `900 600`.',
      example: { title: 'all or nothing', text: 'Inside one transaction either every statement is committed, or (on rollback) none of them is.' },
      code: `@Transactional
public void transfer(String from, String to, int amount) {
    Account a = repo.findById(from).orElseThrow();
    Account b = repo.findById(to).orElseThrow();
    a.setBalance(a.getBalance() - amount);
    repo.save(a);
    if (amount > 200) {
        throw new IllegalStateException("Daily limit exceeded");
    }
    b.setBalance(b.getBalance() + amount);
    repo.save(b);
}`,
      expected: '1000 500',
      explain: '`IllegalStateException` is a **RuntimeException**, and by default `@Transactional` rolls back on unchecked exceptions. The debit from A is undone, so nothing changes: 1000 and 500.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Same accounts (1000 and 500), but now the method throws a **checked** exception after debiting A. What are the balances after the call? Type `A B`.',
      example: { title: 'the default rule', text: 'Default rollback: RuntimeException and Error → rollback. Checked Exception → commit (unless rollbackFor says otherwise).' },
      code: `@Transactional
public void transfer(String from, String to, int amount) throws LimitException {
    Account a = repo.findById(from).orElseThrow();
    a.setBalance(a.getBalance() - amount);
    repo.save(a);
    if (amount > 200) {
        throw new LimitException("Daily limit exceeded");  // extends Exception
    }
    ...
}`,
      expected: '700 500',
      explain: 'Surprise for many developers: a **checked** exception does NOT trigger rollback by default, so the debit is committed and 300 rupees "disappear". Fix it with `@Transactional(rollbackFor = Exception.class)`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`placeOrder()` (no annotation) calls `this.saveOrder()`, which is annotated `@Transactional`, in the **same class**. What happens?',
      options: [
        'saveOrder runs in a new transaction as expected',
        'No transaction is started, because the call does not go through the Spring proxy (self-invocation)',
        'The app fails to start',
        'Both methods run in two transactions',
      ],
      answer: 1,
      explain: 'Spring applies `@Transactional` through a **proxy** around the bean. A call via `this` skips the proxy, so the annotation is ignored. Put the annotation on the public method called from outside, or move the method to another bean. Also: it only works on public methods.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Your entity has `@CreatedDate private LocalDateTime createdAt;` and `@EntityListeners(AuditingEntityListener.class)`, but `createdAt` stays null. Which annotation is missing on a configuration class?',
      example: { title: 'who changed it?', code: '@CreatedBy private String createdBy;   // needs an AuditorAware bean' },
      accept: ['@EnableJpaAuditing', '@EnableJpaAuditing(auditorAwareRef = "auditorAware")'],
      explain: 'Auditing is switched on with **@EnableJpaAuditing** (e.g. on the main class or a @Configuration). Then `@CreatedDate` / `@LastModifiedDate` are filled automatically on insert/update.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Flyway already applied `V1__create_students.sql`. Write the **file name** for the next migration, version 2, that adds a phone column (description `add_phone_column`). It goes in `src/main/resources/db/migration`.',
      example: { title: 'the naming rule', code: 'V<version>__<description>.sql   (two underscores)' },
      accept: ['V2__add_phone_column.sql'],
      caseSensitive: true,
      explain: 'Flyway versioned migrations are named `V<version>__<description>.sql` with a capital **V** and **two** underscores. A single underscore or lowercase `v` means Flyway ignores the file. Never edit an applied migration - its checksum is stored in `flyway_schema_history`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'ACID: Atomicity means all statements of a transaction succeed or none do',
        '@Transactional(readOnly = true) is a good hint for query-only service methods',
        'With Flyway you should use spring.jpa.hibernate.ddl-auto=validate (or none) instead of update',
        'Flyway re-runs every migration on each startup',
        'Propagation.REQUIRED (default) joins an existing transaction or starts a new one',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Flyway runs each migration **only once** and records it in `flyway_schema_history`. Let Flyway own the schema and let Hibernate only `validate` it. `REQUIRED` is the default propagation; `REQUIRES_NEW` always starts a separate transaction.',
    },
  ],
};
