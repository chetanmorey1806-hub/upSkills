export default {
  lesson: 'day-10-fetch-types-n-plus-one-lazy',
  minutes: 22,
  intro: 'Detect the N+1 select problem, fix it with JOIN FETCH, entity graphs and batch fetching, and solve LazyInitializationException.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the **N+1 select problem**?',
      options: [
        'A query that returns N+1 rows instead of N',
        '1 query loads N parents, then accessing each parent\'s lazy collection fires 1 more query per parent: N extra queries',
        'Hibernate needs N+1 connections',
        'A primary key that starts at 1 instead of 0',
      ],
      answer: 1,
      explain: 'Example: `from Department` (1 query) and then `d.getEmployees().size()` in a loop runs one SELECT per department. With 100 departments that is 101 queries. You spot it in the `show_sql` log as the same SELECT repeated with different ids.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'There are **5 departments**. `employees` is LAZY. Statistics count every SQL statement. What does this print?',
      example: { title: 'counting queries', text: 'Loading a list = 1 query. Each first access to an uninitialised lazy collection = 1 more query. A JOIN FETCH loads parents and children together in 1 query.' },
      code: `Statistics stats = sf.getStatistics();

stats.clear();
List<Department> list = session.createQuery("from Department", Department.class).getResultList();
for (Department d : list) d.getEmployees().size();
System.out.println("Queries: " + stats.getPrepareStatementCount());

session.clear();
stats.clear();
List<Department> list2 = session.createQuery(
        "select distinct d from Department d join fetch d.employees", Department.class)
    .getResultList();
for (Department d : list2) d.getEmployees().size();
System.out.println("Queries: " + stats.getPrepareStatementCount());`,
      expected: 'Queries: 6\nQueries: 1',
      explain: 'First version: 1 query for departments + 5 queries for the 5 lazy collections = **6** (N+1). With `join fetch` the employees are loaded in the same SQL join, so the loop triggers no extra queries: **1**. (Departments without employees disappear with an inner join fetch; use `left join fetch` to keep them.)',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the HQL keyword that loads the collection in the same query:\n`select d from Department d join ____ d.employees`',
      example: { title: 'an entity graph alternative', code: '@EntityGraph(attributePaths = "employees") // Spring Data\n// or session.createEntityGraph(...) with jakarta.persistence.fetchgraph' },
      accept: ['fetch', 'FETCH'],
      explain: '`join fetch` (or `left join fetch`) tells Hibernate to initialise the association from the joined rows. A plain `join` only filters: the collection would still be loaded lazily later.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Code loads a Department in a DAO method, the session is closed, and then the JSP calls `dept.getEmployees().size()`. What happens?',
      options: [
        'Hibernate opens a new session automatically',
        'LazyInitializationException: could not initialize proxy/collection - no Session',
        'It returns 0',
        'NullPointerException',
      ],
      answer: 1,
      explain: 'A lazy collection can only be loaded while its session is open. Fixes: fetch what the view needs inside the transaction (JOIN FETCH / entity graph / DTO query) or initialise it before closing. Switching everything to EAGER or enabling "open session in view" hides the problem and often causes N+1 elsewhere.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good fixes for N+1? (choose all that apply)',
      options: [
        'JOIN FETCH in the HQL query',
        'An entity graph listing the associations to load',
        '@BatchSize(size = 10) on the collection so lazy loads happen in groups',
        'A DTO projection query that selects only the needed columns',
        'Making every association FetchType.EAGER',
      ],
      answers: [0, 1, 2, 3],
      explain: 'EAGER everywhere loads data you do not need on every query and, for collections in queries, still produces N+1 selects. Prefer LAZY mappings and decide per use case what to fetch.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'There are **25 departments**. The `employees` collection is LAZY with `@BatchSize(size = 10)`. How many SQL statements does this code run? Print as shown.',
      example: { title: 'batch fetching', text: 'When one lazy collection is accessed, Hibernate also loads the collections of up to `size` other departments in the session with one `where dept_id in (?, ?, ...)` query.' },
      code: `stats.clear();
List<Department> list = session.createQuery("from Department", Department.class).getResultList();
for (Department d : list) d.getEmployees().size();
System.out.println("Queries: " + stats.getPrepareStatementCount());`,
      expected: 'Queries: 4',
      explain: '1 query for the departments + ceil(25 / 10) = 3 batch queries (10 + 10 + 5 departments) = **4**, instead of 26 without batching. Batch fetching is a cheap global improvement; JOIN FETCH can bring it down to 1.',
    },
  ],
};
