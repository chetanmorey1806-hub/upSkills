const LIBRARY = `CREATE TABLE books (
  id     INT PRIMARY KEY,
  title  VARCHAR(80) NOT NULL,
  author VARCHAR(50) NOT NULL
);
CREATE TABLE members (
  id   INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
CREATE TABLE loans (
  id          INT PRIMARY KEY,
  book_id     INT NOT NULL,
  member_id   INT NOT NULL,
  issued_on   DATE NOT NULL,
  returned_on DATE
);
INSERT INTO books VALUES
(1, 'Wings of Fire', 'A. P. J. Abdul Kalam'),
(2, 'The Guide', 'R. K. Narayan'),
(3, 'Godan', 'Premchand'),
(4, 'Head First Java', 'Kathy Sierra');
INSERT INTO members VALUES (1, 'Asha Patil'), (2, 'Rohan Mehta'), (3, 'Sneha Kulkarni');
INSERT INTO loans VALUES
(1, 1, 1, '2025-06-01', '2025-06-10'),
(2, 4, 2, '2025-06-05', NULL),
(3, 2, 1, '2025-06-12', NULL),
(4, 3, 3, '2025-06-02', '2025-06-08');`;

export default {
  lesson: 'day-12-hibernate-project-interview',
  minutes: 25,
  intro: 'Revise the Library Management project: optimistic locking with @Version, a join query for the loans report, and key interview questions.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which annotation adds a version column for **optimistic locking** to the Book entity? (with @)\n```\n____\nprivate int version;\n```',
      example: { title: 'audit-like fields', code: '@Column(nullable = false)\nprivate int stock;' },
      accept: ['@Version', '@jakarta.persistence.Version'],
      caseSensitive: true,
      explain: '`@Version` makes Hibernate add `where id = ? and version = ?` to every UPDATE and increment the version. If another transaction changed the row first, 0 rows match and Hibernate throws an `OptimisticLockException` instead of silently overwriting.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Book 1 has `version = 0`. Two librarians load it in two different sessions at the same time. What is printed?',
      example: { title: 'the version check', code: '-- what Hibernate runs on commit\nupdate books set title=?, version=1 where id=1 and version=0' },
      code: `Session s1 = sf.openSession();
Session s2 = sf.openSession();
Book a = s1.get(Book.class, 1);   // version 0
Book b = s2.get(Book.class, 1);   // version 0

Transaction t1 = s1.beginTransaction();
a.setTitle("Wings of Fire (2nd ed.)");
t1.commit();
System.out.println("A saved, version " + a.getVersion());

Transaction t2 = s2.beginTransaction();
b.setAuthor("Abdul Kalam");
try {
    t2.commit();
    System.out.println("B saved");
} catch (PersistenceException e) {
    System.out.println("B failed: stale data");
}`,
      expected: 'A saved, version 1\nB failed: stale data',
      explain: 'Librarian A commits first: the row goes to version 1. B\'s UPDATE says `where version = 0`, which matches no row, so Hibernate throws an optimistic lock exception (a `PersistenceException`) and B\'s change is rolled back. The app should reload and let B retry, instead of losing A\'s update.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'The "Books currently issued" report: list the book `title` and member `name` for every loan that has **not been returned** (`returned_on` is NULL), sorted by title.',
      example: { title: 'join three tables', code: 'SELECT p.name, c.name\nFROM orders o\nJOIN products p ON p.id = o.product_id\nJOIN customers c ON c.id = o.customer_id\nWHERE o.delivered_on IS NULL;' },
      setup: LIBRARY,
      starter: '-- SELECT b.title, m.name FROM loans l JOIN ...\n',
      solution: 'SELECT b.title, m.name\nFROM loans l\nJOIN books b ON b.id = l.book_id\nJOIN members m ON m.id = l.member_id\nWHERE l.returned_on IS NULL\nORDER BY b.title;',
      ordered: true,
      explain: 'Use `IS NULL`, never `= NULL` (which is never true). Result: Head First Java → Rohan Mehta, The Guide → Asha Patil. In the project this is the HQL `select l.book.title, l.member.name from Loan l where l.returnedOn is null order by l.book.title`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'SessionFactory is thread-safe and heavy; Session is not thread-safe and short-lived',
        'get() returns null for a missing id, getReference()/load() returns a proxy',
        'JOIN FETCH is a standard fix for the N+1 problem',
        'Transactions belong around the service method that does the whole use case, not around each single DAO call',
        'hbm2ddl.auto=create is recommended for production',
      ],
      answers: [0, 1, 2, 3],
      explain: 'A use case like "issue a book" changes the loan **and** the stock, so both must be in one transaction at the service level. `create` would wipe the production database on every restart.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the library project, issuing a book must insert a Loan and reduce the book\'s stock. Where should `beginTransaction()` / `commit()` be?',
      options: [
        'Inside each DAO method separately',
        'In one service method (issueBook) that calls both DAO operations, so both succeed or both roll back',
        'In the entity\'s setter',
        'Transactions are not needed with Hibernate',
      ],
      answer: 1,
      explain: 'If the DAO methods each commit on their own, a failure after the first one leaves a Loan with unchanged stock. The **service layer** defines the unit of work and the DAOs share its session.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'The members list must show page 2 with 10 members per page, sorted by name. Which HQL call sequence is right?',
      options: [
        'createQuery("from Member m order by m.name").setFirstResult(10).setMaxResults(10)',
        'createQuery("from Member m order by m.name").setFirstResult(2).setMaxResults(10)',
        'createQuery("from Member m limit 10, 10")',
        'createQuery("from Member m").setMaxResults(20) and skip in Java',
      ],
      answer: 0,
      explain: 'The offset is (page − 1) × size = 10. `LIMIT` is not HQL syntax; Hibernate adds the right SQL for the dialect. Always add `order by` when paginating, otherwise the database may return rows in a different order on each page.',
    },
  ],
};
