export default {
  lesson: 'day-02-hibernate-setup-maven',
  minutes: 18,
  intro: 'Practise the Maven dependencies, hibernate.cfg.xml properties and hbm2ddl.auto values needed to save your first entity.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Complete the Maven dependency for Hibernate 6 (the artifactId):
\`\`\`
<dependency>
  <groupId>org.hibernate.orm</groupId>
  <artifactId>____</artifactId>
  <version>6.4.4.Final</version>
</dependency>
\`\`\``,
      example: { title: 'the MySQL driver', code: '<dependency>\n  <groupId>com.mysql</groupId>\n  <artifactId>mysql-connector-j</artifactId>\n  <version>8.3.0</version>\n</dependency>' },
      accept: ['hibernate-core'],
      explain: 'The core library is **`hibernate-core`** (groupId `org.hibernate.orm` from version 6; it was `org.hibernate` before). You also need the JDBC driver (`mysql-connector-j`), otherwise you get "No suitable driver".',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which `hibernate.hbm2ddl.auto` value **creates** the tables at startup and **drops** them when the SessionFactory closes?',
      options: ['update', 'create', 'create-drop', 'validate'],
      answer: 2,
      explain: '`create` drops and recreates at startup, `create-drop` also drops at shutdown (good for tests), `update` adds missing tables/columns and keeps data, `validate` only checks the schema matches the entities, and `none` does nothing.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which `hbm2ddl.auto` values are **safe for a production** database full of real student data? (choose all that apply)',
      options: ['create', 'create-drop', 'validate', 'none', 'update'],
      answers: [2, 3],
      explain: '`create` and `create-drop` delete all data. `update` never drops columns but can make unexpected changes and is not recommended in production. Use **validate** or **none** and manage schema changes with SQL scripts or tools like Flyway/Liquibase.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the property that prints every SQL statement Hibernate runs to the console:\n`<property name="hibernate.____">true</property>`',
      example: { title: 'related property', code: '<property name="hibernate.format_sql">true</property>' },
      accept: ['show_sql'],
      explain: '`hibernate.show_sql=true` prints lines like `Hibernate: insert into students ... values (?,?,?)`. Add `format_sql` to pretty-print them. Watching the generated SQL is the best way to learn and debug Hibernate.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In hibernate.cfg.xml, complete the attribute that registers the entity class:\n`<mapping ____="com.upskillr.entity.Student"/>`',
      example: { title: 'where the file lives', text: 'hibernate.cfg.xml goes in `src/main/resources` so it is on the classpath.' },
      accept: ['class'],
      explain: '`<mapping class="..."/>` tells Hibernate which annotated classes are entities. Forgetting it gives "Unknown entity" / "not an entity" errors when you call `persist`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should `hibernate.cfg.xml` be placed in a Maven project so that `new Configuration().configure()` finds it?',
      options: ['src/main/java', 'src/main/resources', 'the project root folder next to pom.xml', 'target/'],
      answer: 1,
      explain: '`configure()` with no arguments loads `hibernate.cfg.xml` from the **classpath root**, and Maven copies everything in `src/main/resources` there. Putting it in the project root causes "Could not locate cfg.xml resource".',
    },
  ],
};
