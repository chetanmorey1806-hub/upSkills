export default {
  lesson: 'day-10-transaction-management',
  minutes: 25,
  intro: 'Use declarative transactions with @Transactional: rollback rules, propagation, isolation and the classic pitfalls.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'By default, for which exceptions does `@Transactional` **roll back**?',
      options: [
        'Every exception',
        'Only unchecked exceptions (RuntimeException and its subclasses) and Errors',
        'Only checked exceptions',
        'It never rolls back unless you call rollback() yourself',
      ],
      answer: 1,
      explain: 'Spring\'s default rule: **RuntimeException / Error → rollback**, **checked Exception → commit**. This surprises many developers. Use `rollbackFor = Exception.class` to roll back on checked exceptions too.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The `enrollments` table is empty. `insert()` adds one row. What does this program print?',
      example: { title: 'checked vs unchecked', code: 'class PaymentException extends Exception {}           // checked\nclass SeatFullException extends RuntimeException {}   // unchecked' },
      code: `@Service
class EnrollmentService {
    @Transactional
    public void enrollA(String name) throws Exception {
        dao.insert(name);
        throw new Exception("Payment failed");          // checked
    }

    @Transactional
    public void enrollB(String name) {
        dao.insert(name);
        throw new IllegalStateException("Seat full");   // unchecked
    }
}

// main
try { service.enrollA("Asha"); } catch (Exception e) { System.out.println("Error: " + e.getMessage()); }
System.out.println("Rows: " + dao.count());
try { service.enrollB("Rohan"); } catch (Exception e) { System.out.println("Error: " + e.getMessage()); }
System.out.println("Rows: " + dao.count());`,
      expected: 'Error: Payment failed\nRows: 1\nError: Seat full\nRows: 1',
      explain: 'enrollA throws a **checked** exception, so by default the transaction **commits** and Asha\'s row stays (Rows: 1), even though the caller sees an error. enrollB throws a RuntimeException, so Rohan\'s insert is rolled back and the count stays 1.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Make `enrollA` roll back for checked exceptions too. Complete:\n`@Transactional(____ = Exception.class)`',
      example: { title: 'the opposite', code: '@Transactional(noRollbackFor = EmailFailedException.class)' },
      accept: ['rollbackFor'],
      caseSensitive: true,
      explain: '`rollbackFor = Exception.class` rolls back for every exception. `noRollbackFor` keeps the commit for exceptions you consider harmless (e.g. a failed welcome email).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`placeOrder()` (@Transactional) calls `auditService.log()` which has `@Transactional(propagation = Propagation.REQUIRES_NEW)`. `placeOrder()` later fails and rolls back. What happens to the audit row?',
      options: [
        'It is rolled back too',
        'It stays saved, because REQUIRES_NEW ran in its own separate transaction that already committed',
        'An exception is thrown when log() is called',
        'It is saved twice',
      ],
      answer: 1,
      explain: '`REQUIRED` (default) joins the caller\'s transaction, so everything commits or rolls back together. `REQUIRES_NEW` suspends the outer transaction and runs an **independent** one, perfect for audit logs that must survive a failed business operation.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are classic **@Transactional pitfalls** where the annotation silently has no effect? (choose all that apply)',
      options: [
        'Calling the @Transactional method from another method of the same class (self-invocation)',
        'Putting @Transactional on a private method',
        'Catching the exception inside the method and not rethrowing it',
        'Creating the service with new StudentService() instead of getting it from Spring',
        'Putting @Transactional on a public method of a Spring bean called from another bean',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Transactions are applied by a **proxy**: self-calls, private methods and objects made with `new` bypass it. If you swallow the exception, the proxy never sees it and commits. The last option is the correct way to use it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Transaction A reads Asha\'s balance, transaction B updates and **commits** it, A reads again and gets a different value. Which problem is this, and which isolation level prevents it?',
      options: [
        'Dirty read; prevented by READ_UNCOMMITTED',
        'Non-repeatable read; prevented by REPEATABLE_READ (and SERIALIZABLE)',
        'Phantom read; prevented by READ_COMMITTED',
        'Lost update; prevented by turning off transactions',
      ],
      answer: 1,
      explain: 'Dirty read = reading **uncommitted** data (prevented from READ_COMMITTED up). Non-repeatable read = the same row changes between two reads (prevented from REPEATABLE_READ up). Phantom = new rows appear in a range query (prevented by SERIALIZABLE). Set it with `@Transactional(isolation = Isolation.REPEATABLE_READ)`.',
    },
  ],
};
