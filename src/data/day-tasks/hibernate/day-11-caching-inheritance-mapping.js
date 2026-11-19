export default {
  lesson: 'day-11-caching-inheritance-mapping',
  minutes: 22,
  intro: 'Reduce database hits with first-level, second-level and query caches, and map class hierarchies with SINGLE_TABLE, JOINED and TABLE_PER_CLASS.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the scope of the **first-level cache**?',
      options: ['The whole application', 'One Session (persistence context); always on', 'One database table', 'The browser'],
      answer: 1,
      explain: 'The first-level cache belongs to a **Session**, is always enabled and cannot be turned off. It disappears when the session closes. The second-level cache lives in the **SessionFactory** and is shared by all sessions, but must be enabled explicitly.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Student 1 exists. The program runs the same code **twice**: first with the second-level cache disabled, then with it enabled (Student is `@Cacheable` with Ehcache). Each run starts with an empty cache. What is printed?',
      example: { title: 'which cache answers?', text: 'Same session → first-level cache. Different session → only the second-level cache can help; otherwise it is a new SELECT.' },
      code: `static long run(SessionFactory sf) {
    sf.getStatistics().clear();
    try (Session s1 = sf.openSession()) {
        s1.get(Student.class, 1);
        s1.get(Student.class, 1);
    }
    try (Session s2 = sf.openSession()) {
        s2.get(Student.class, 1);
    }
    return sf.getStatistics().getPrepareStatementCount();
}

System.out.println("Without L2: " + run(sfWithoutL2));
System.out.println("With L2: " + run(sfWithL2));`,
      expected: 'Without L2: 2\nWith L2: 1',
      explain: 'Without L2: s1 hits the DB once (the second get is a first-level cache hit), s2 is a new session and hits the DB again → 2. With L2: s1 loads it once and puts it in the SessionFactory cache; s2 finds it there → 1.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about the **second-level and query caches** are TRUE? (choose all that apply)',
      options: [
        'It is enabled with hibernate.cache.use_second_level_cache=true plus a provider such as Ehcache (JCache)',
        'An entity must be marked @Cacheable (and/or @Cache with a concurrency strategy) to be cached',
        'It suits data that is read often and changed rarely, like courses or cities',
        'The query cache stores the ids returned by a query and needs query.setCacheable(true)',
        'It is a good idea for data that changes every second, like live bank balances',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Caching rarely-changing reference data saves many queries. Frequently updated data causes constant invalidation and risk of stale reads, so do not cache it. The query cache stores ids only and relies on the entity cache for the rows.',
    },
    {
      type: 'fill',
      mins: 1,
      q: '`Payment` has subclasses `CardPayment` and `UpiPayment`. Store all of them in **one table** with a type column. Complete:\n`@Inheritance(strategy = InheritanceType.____)`',
      example: { title: 'another strategy', code: '@Inheritance(strategy = InheritanceType.JOINED)' },
      accept: ['SINGLE_TABLE', 'InheritanceType.SINGLE_TABLE'],
      caseSensitive: true,
      explain: '`SINGLE_TABLE` (the default) puts every subclass in one table: fastest queries, no joins, but subclass columns must be nullable. `JOINED` = one table per class joined by id (normalised). `TABLE_PER_CLASS` = one full table per concrete class (polymorphic queries need UNION).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'With SINGLE_TABLE, which annotation names the column that stores the subclass type (e.g. `payment_type`)? (with @)',
      example: { title: 'the value for one subclass', code: '@Entity\n@DiscriminatorValue("UPI")\npublic class UpiPayment extends Payment { ... }' },
      accept: ['@DiscriminatorColumn', '@DiscriminatorColumn(name = "payment_type")', '@DiscriminatorColumn(name="payment_type")'],
      caseSensitive: true,
      explain: '`@DiscriminatorColumn(name = "payment_type")` on the root class defines the column, and `@DiscriminatorValue("UPI")` on each subclass sets the value stored. Hibernate reads it to create the right subclass object.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`BaseEntity` holds `id`, `createdAt` and `updatedAt` for every entity, but you never query "all BaseEntities". What fits best?',
      options: ['@Inheritance(SINGLE_TABLE)', '@MappedSuperclass', '@Inheritance(JOINED)', '@Embeddable'],
      answer: 1,
      explain: '`@MappedSuperclass` just copies the inherited fields into each subclass table. It is not an entity itself, so there is no base table and no polymorphic queries, which is exactly right for common audit columns.',
    },
  ],
};
