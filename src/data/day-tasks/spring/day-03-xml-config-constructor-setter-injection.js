export default {
  lesson: 'day-03-xml-config-constructor-setter-injection',
  minutes: 22,
  intro: 'Configure beans in XML with <constructor-arg> and <property>, inject collections, and choose constructor vs setter injection.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute that injects a **simple value** with setter injection:\n`<property name="course" ____="Java"/>`',
      example: { title: 'injecting another bean', code: '<property name="repository" ref="studentRepository"/>' },
      accept: ['value'],
      explain: 'Use `value` for strings and numbers (Spring converts "85" to int) and `ref` for another bean\'s id. `<property>` calls the setter (`setCourse`), so the class needs one.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'StudentService needs the bean `studentDao` in its constructor. Complete:\n`<constructor-arg ____="studentDao"/>`',
      example: { title: 'constructor value with index', code: '<constructor-arg index="0" value="Asha"/>\n<constructor-arg index="1" value="85"/>' },
      accept: ['ref'],
      explain: '`ref` points to another bean by id. Writing `value="studentDao"` would pass the **string** "studentDao" instead of the bean, giving a type conversion error.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      example: { title: 'the order Spring follows', text: 'Spring first calls the constructor (with `<constructor-arg>` values), then calls the setters for each `<property>`.' },
      code: `<!-- beans.xml -->
<bean id="student" class="com.upskillr.Student">
    <constructor-arg value="Asha"/>
    <constructor-arg value="70"/>
    <property name="marks" value="85"/>
</bean>

// Student.java
public Student(String name, int marks) {
    System.out.println("constructor");
    this.name = name; this.marks = marks;
}
public void setMarks(int marks) {
    System.out.println("setter");
    this.marks = marks;
}
public String toString() { return name + ":" + marks; }

// Main
var ctx = new ClassPathXmlApplicationContext("beans.xml");
System.out.println(ctx.getBean("student"));`,
      expected: 'constructor\nsetter\nAsha:85',
      explain: 'Constructor injection happens first (marks = 70), then setter injection overwrites it (marks = 85). So when both are used for the same field, the **setter wins**. That is one reason to keep required fields in the constructor only.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When should you prefer **constructor injection**?',
      options: [
        'For optional dependencies that have a sensible default',
        'For required dependencies, so the object can never exist without them and fields can be final',
        'Never; setter injection is always better',
        'Only for String values',
      ],
      answer: 1,
      explain: 'Constructor injection guarantees a fully initialised object, allows `final` fields (immutability) and makes missing dependencies fail at startup. Setter injection suits **optional** dependencies that can change later.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inject a \`List<String> subjects\` with setter injection. Fill the collection tag (both places):
\`\`\`
<property name="subjects">
    <____>
        <value>Java</value>
        <value>Spring</value>
    </____>
</property>
\`\`\``,
      example: { title: 'a map', code: '<property name="fees">\n  <map>\n    <entry key="Java" value="4999"/>\n  </map>\n</property>' },
      accept: ['list'],
      explain: 'Use `<list>` for List (keeps order, allows duplicates), `<set>` for Set, `<map>` with `<entry>` for Map and `<props>` for Properties. Inside, `<value>` is a literal and `<ref bean="..."/>` is a bean.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are valid values of the XML `autowire` attribute? (choose all that apply)',
      options: ['no', 'byName', 'byType', 'constructor', 'byValue', 'auto'],
      answers: [0, 1, 2, 3],
      explain: '`byName` matches the property name to a bean id, `byType` matches the type, `constructor` matches constructor parameters by type, and `no` (the default) means explicit wiring only. `byValue` and `auto` do not exist.',
    },
  ],
};
