export default {
  id: 'day-03-xml-config-constructor-setter-injection',
  title: 'XML Configuration, Constructor vs Setter Injection',
  module: 'Module 1: Spring Core',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Configure beans in a Spring XML file, inject values and references with <constructor-arg> and <property>, inject collections, and learn when to choose constructor injection over setter injection.`,
  objectives: [
    `Write a valid Spring 6 beans.xml with <bean>, <constructor-arg> and <property>`,
    `Inject literal values (value) and other beans (ref)`,
    `Inject List, Set, Map and Properties collections`,
    `Compare constructor and setter injection and pick the right one`,
    `Resolve constructor ambiguity with index, type and name`,
  ],
  theory: [
    {
      heading: 'Spring XML configuration file',
      content: `The oldest way to configure Spring is an XML file (usually beans.xml or applicationContext.xml) placed in src/main/resources so it is on the classpath. Each <bean> tag is a recipe: id = bean name, class = fully qualified class name. Analogy: the XML file is a wiring diagram for an electrician; the classes are the appliances and Spring is the electrician who connects them.`,
      syntax: `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
         https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="address" class="com.demo.Address">
        <constructor-arg value="Pune"/>
    </bean>

</beans>`,
      tip: `The XML declaration <?xml ...?> must be the very first line, with no blank line or comment before it.`,
    },
    {
      heading: 'Constructor injection in XML',
      content: `<constructor-arg> passes values to a constructor. Spring picks the constructor whose parameter count and types match. Use value="..." for simple types (String, int, double) and ref="beanId" for other beans. When there are several args you can use index (0-based), type or name to remove ambiguity.`,
      syntax: `<bean id="emp" class="com.demo.Employee">
    <constructor-arg index="0" value="101"/>
    <constructor-arg index="1" value="Asha"/>
    <constructor-arg name="address" ref="address"/>
</bean>
<!-- short form with c-namespace: xmlns:c="http://www.springframework.org/schema/c" -->
<bean id="emp2" class="com.demo.Employee" c:id="102" c:name="Ravi" c:address-ref="address"/>`,
    },
    {
      heading: 'Setter injection in XML',
      content: `<property name="salary"> calls setSalary(...) after the object is created with the no-arg constructor. The name must match the JavaBean property: property "salary" means method setSalary. Missing setter = BeanCreationException at startup.`,
      syntax: `<bean id="emp" class="com.demo.Employee">
    <property name="salary" value="55000"/>
    <property name="address" ref="address"/>
</bean>
<!-- p-namespace: xmlns:p="http://www.springframework.org/schema/p" -->
<bean id="emp3" class="com.demo.Employee" p:salary="60000" p:address-ref="address"/>`,
    },
    {
      heading: 'Constructor vs Setter injection',
      content: `Both are DI, but they fit different needs.`,
      points: [
        `Constructor: for mandatory dependencies; object is never half-built; supports final (immutable) fields; recommended by the Spring team`,
        `Setter: for optional dependencies or values that may change; object first created, then setters called`,
        `Setter injection overrides constructor injection if both set the same property (setter runs later)`,
        `Circular dependency (A needs B, B needs A) with constructor injection fails with BeanCurrentlyInCreationException; setter injection can resolve it (but better redesign)`,
        `Too many constructor parameters = a sign the class does too much (split it)`,
      ],
      tip: `Interview answer: "Use constructor injection for required dependencies and setter injection for optional ones."`,
    },
    {
      heading: 'Injecting collections',
      content: `Spring XML has tags for collections: <list>, <set>, <map> with <entry>, and <props> with <prop>. Use <ref bean="..."/> inside a collection to add bean references.`,
      syntax: `<property name="skills">
    <list><value>Java</value><value>Spring</value></list>
</property>
<property name="marks">
    <map>
        <entry key="Maths" value="90"/>
        <entry key="Science" value="85"/>
    </map>
</property>`,
    },
    {
      heading: 'Inner beans, autowire and loading multiple files',
      content: `An inner bean is a <bean> written inside <property> or <constructor-arg>; it has no id and cannot be reused. XML also supports autowire="byName" / "byType" / "constructor" on a <bean>, letting Spring find dependencies automatically (annotations on Day 4 are the modern way). You can split config into many files and combine them with <import resource="dao-beans.xml"/> or new ClassPathXmlApplicationContext("a.xml", "b.xml").`,
    },
  ],
  examples: [
    {
      title: 'Constructor vs setter injection in plain Java (manual DI)',
      scenario: `Before using XML, see what Spring does for each tag. <constructor-arg> = calling the constructor; <property> = calling the setter afterwards. Run it in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Notice that e2 has no address because the optional setter was not called',
      ],
      code: `class Address {
    final String city;
    Address(String city) { this.city = city; }
}

class Employee {
    private final int id;          // mandatory -> constructor
    private final String name;     // mandatory -> constructor
    private Address address;       // optional  -> setter
    private double salary;         // optional  -> setter

    Employee(int id, String name) {
        this.id = id; this.name = name;
        System.out.println("Constructor injection: id, name");
    }
    void setAddress(Address address) { this.address = address; System.out.println("Setter injection: address"); }
    void setSalary(double salary) { this.salary = salary; System.out.println("Setter injection: salary"); }

    public String toString() {
        return "Employee[" + id + ", " + name + ", " + (address == null ? "no address" : address.city) + ", " + salary + "]";
    }
}

public class Main {
    public static void main(String[] args) {
        Employee e1 = new Employee(101, "Asha");   // <constructor-arg>
        e1.setAddress(new Address("Pune"));        // <property name="address" ref=.../>
        e1.setSalary(55000);                       // <property name="salary" value="55000"/>
        System.out.println(e1);

        Employee e2 = new Employee(102, "Ravi");
        System.out.println(e2);
    }
}`,
      java: {
        files: {
          'Main.java': `class Address {
    final String city;
    Address(String city) { this.city = city; }
}

class Employee {
    private final int id;
    private final String name;
    private Address address;
    private double salary;

    Employee(int id, String name) {
        this.id = id; this.name = name;
        System.out.println("Constructor injection: id, name");
    }
    void setAddress(Address address) { this.address = address; System.out.println("Setter injection: address"); }
    void setSalary(double salary) { this.salary = salary; System.out.println("Setter injection: salary"); }

    public String toString() {
        return "Employee[" + id + ", " + name + ", " + (address == null ? "no address" : address.city) + ", " + salary + "]";
    }
}

public class Main {
    public static void main(String[] args) {
        Employee e1 = new Employee(101, "Asha");
        e1.setAddress(new Address("Pune"));
        e1.setSalary(55000);
        System.out.println(e1);

        Employee e2 = new Employee(102, "Ravi");
        System.out.println(e2);
    }
}`,
        },
      },
      result: `Constructor injection: id, name
Setter injection: address
Setter injection: salary
Employee[101, Asha, Pune, 55000.0]
Constructor injection: id, name
Employee[102, Ravi, no address, 0.0]`,
      explanation: `Constructor runs first (mandatory values), then setters (optional values). e2 is still a valid object because only id and name are required. salary prints 55000.0 because it is a double.`,
    },
    {
      title: 'Same wiring with Spring XML',
      scenario: `Let Spring do the exact wiring of the previous example from beans.xml.`,
      steps: [
        'Create a Maven project with spring-context 6.1.14 (Eclipse/STS: File > New > Maven Project; IntelliJ: File > New > Project > Maven)',
        'Create Address and Employee in package com.demo (make constructors and setters public)',
        'Create src/main/resources/beans.xml (Eclipse: New > Other > XML > XML File; IntelliJ: New > XML Configuration File > Spring Config if available, else New > File)',
        'Create XmlApp with main(), run it (Run As > Java Application / green ▶)',
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
         https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="address" class="com.demo.Address">
        <constructor-arg value="Pune"/>
    </bean>

    <bean id="emp1" class="com.demo.Employee">
        <constructor-arg index="0" value="101"/>
        <constructor-arg index="1" value="Asha"/>
        <property name="address" ref="address"/>
        <property name="salary" value="55000"/>
    </bean>

    <bean id="emp2" class="com.demo.Employee">
        <constructor-arg index="0" value="102"/>
        <constructor-arg index="1" value="Ravi"/>
    </bean>
</beans>

// XmlApp.java
package com.demo;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class XmlApp {
    public static void main(String[] args) {
        try (var ctx = new ClassPathXmlApplicationContext("beans.xml")) {
            System.out.println(ctx.getBean("emp1"));
            System.out.println(ctx.getBean("emp2"));
        }
    }
}`,
      result: `Constructor injection: id, name
Setter injection: address
Setter injection: salary
Constructor injection: id, name
Employee[101, Asha, Pune, 55000.0]
Employee[102, Ravi, no address, 0.0]`,
      explanation: `ApplicationContext creates all singletons at startup (in file order), so all injection messages appear before the toString lines. Spring converts the text "101" to int and "55000" to double automatically.`,
    },
    {
      title: 'Injecting List and Map collections',
      scenario: `A Student bean has a list of skills and a map of subject marks.`,
      steps: [
        'Create Student.java with setters setName, setSkills(List<String>), setMarks(Map<String,Integer>)',
        'Add the bean to beans.xml',
        'Run the main class',
      ],
      code: `// Student.java
package com.demo;
import java.util.*;
public class Student {
    private String name;
    private List<String> skills;
    private Map<String, Integer> marks;
    public void setName(String name) { this.name = name; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public void setMarks(Map<String, Integer> marks) { this.marks = marks; }
    public void show() {
        System.out.println(name + " skills=" + skills);
        System.out.println(name + " marks=" + marks);
    }
}

<!-- beans.xml -->
<bean id="student" class="com.demo.Student">
    <property name="name" value="Meera"/>
    <property name="skills">
        <list>
            <value>Java</value>
            <value>Spring</value>
            <value>SQL</value>
        </list>
    </property>
    <property name="marks">
        <map>
            <entry key="Maths" value="90"/>
            <entry key="Science" value="85"/>
        </map>
    </property>
</bean>

// main
try (var ctx = new ClassPathXmlApplicationContext("beans.xml")) {
    ctx.getBean("student", Student.class).show();
}`,
      result: `Meera skills=[Java, Spring, SQL]
Meera marks={Maths=90, Science=85}`,
      explanation: `Spring creates an ArrayList for <list> and a LinkedHashMap for <map>, so insertion order is kept. Values are converted to Integer using the generic type of the setter.`,
    },
    {
      title: 'Fixing constructor ambiguity',
      scenario: `Class Product has two constructors: Product(String name, int qty) and Product(int code, String name). XML with plain values may call the wrong one.`,
      steps: [
        'Write Product with both constructors',
        'Use type and index attributes in XML',
        'Run and check which constructor printed',
      ],
      code: `public class Product {
    public Product(String name, int qty) { System.out.println("name+qty: " + name + ", " + qty); }
    public Product(int code, String name) { System.out.println("code+name: " + code + ", " + name); }
}

<bean id="p1" class="com.demo.Product">
    <constructor-arg index="0" type="int" value="500"/>
    <constructor-arg index="1" type="java.lang.String" value="Pen"/>
</bean>`,
      result: `code+name: 500, Pen`,
      explanation: `With index and type Spring knows the first parameter is int, so Product(int, String) is chosen. Without them, results may surprise you. name="..." also works when the class is compiled with -parameters (Maven compiler default in Spring Boot, add it manually otherwise).`,
    },
  ],
  interview: [
    { q: 'How do you configure a bean in XML?', a: 'With <bean id="name" class="fully.qualified.Class"/> inside <beans> in a file on the classpath, loaded with ClassPathXmlApplicationContext.', level: 'Easy' },
    { q: 'Difference between value and ref attributes?', a: 'value injects a literal (String, number, boolean) converted to the target type; ref injects another bean by its id.', level: 'Easy' },
    { q: 'Constructor injection vs setter injection?', a: 'Constructor: mandatory dependencies, immutability, object always complete. Setter: optional dependencies, can be changed later, object created first then populated.', level: 'Medium' },
    { q: 'If both constructor and setter inject the same property, which wins?', a: 'Setter injection, because setters are called after the constructor and overwrite the value.', level: 'Medium' },
    { q: 'How does Spring handle circular dependencies?', a: 'With setter/field injection on singletons it uses early references (three-level singleton cache) to resolve them. With constructor injection it fails with BeanCurrentlyInCreationException. Spring Boot 2.6+ disables circular references by default.', level: 'Hard' },
    { q: 'What are p-namespace and c-namespace?', a: 'Short XML forms: p:prop="value" replaces <property>, c:arg="value" replaces <constructor-arg>. Add -ref suffix to inject beans.', level: 'Medium' },
    { q: 'How do you inject a collection in XML?', a: 'Use <list>, <set>, <map>/<entry>, or <props>/<prop> inside a <property> or <constructor-arg>.', level: 'Easy' },
    { q: 'What is an inner bean?', a: 'A bean defined inside a <property> or <constructor-arg> without an id; it is used only by its outer bean.', level: 'Medium' },
    { q: 'What exception occurs if a setter is missing for a <property>?', a: 'BeanCreationException caused by NotWritablePropertyException (invalid property).', level: 'Medium' },
    { q: 'What are XML autowire modes?', a: 'no (default), byName, byType, constructor. They let Spring find dependencies without explicit ref.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: create class Book with mandatory title (constructor) and optional price (setter). Create two books, set price on only one, and print both.',
      hint: 'Use a default value for price.',
      solution: `class Book {
    private final String title;
    private double price;
    Book(String title) { this.title = title; }
    void setPrice(double price) { this.price = price; }
    public String toString() { return title + " - " + price; }
}
public class Main {
    public static void main(String[] args) {
        Book b1 = new Book("Spring in Action");
        b1.setPrice(799);
        Book b2 = new Book("Java Basics");
        System.out.println(b1);  // Spring in Action - 799.0
        System.out.println(b2);  // Java Basics - 0.0
    }
}`,
    },
    {
      task: 'Write XML for Car(Engine engine) where Engine bean has property hp=150, using constructor injection.',
      hint: 'Define engine first, then ref it.',
      solution: `<bean id="engine" class="com.demo.Engine">
    <property name="hp" value="150"/>
</bean>
<bean id="car" class="com.demo.Car">
    <constructor-arg ref="engine"/>
</bean>`,
    },
    {
      task: 'Inject a Set<String> of cities and a java.util.Properties of db settings into a Config bean.',
      hint: 'Use <set> and <props><prop key="...">value</prop></props>.',
      solution: `<bean id="config" class="com.demo.Config">
    <property name="cities">
        <set><value>Delhi</value><value>Mumbai</value><value>Delhi</value></set>
    </property>
    <property name="db">
        <props>
            <prop key="url">jdbc:mysql://localhost:3306/test</prop>
            <prop key="user">root</prop>
        </props>
    </property>
</bean>
<!-- the duplicate Delhi is stored once in the Set -->`,
    },
    {
      task: 'Rewrite emp1 from Example 2 using c-namespace and p-namespace in one line.',
      hint: 'Add xmlns:c and xmlns:p to <beans>.',
      solution: `<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:c="http://www.springframework.org/schema/c"
       xmlns:p="http://www.springframework.org/schema/p" ...>
  <bean id="emp1" class="com.demo.Employee"
        c:_0="101" c:_1="Asha" p:address-ref="address" p:salary="55000"/>
</beans>`,
    },
  ],
  quiz: [
    { question: 'Which tag performs setter injection?', options: ['<constructor-arg>', '<property>', '<setter>', '<inject>'], answer: 1, explanation: '<property name="x"> calls setX().' },
    { question: 'Which attribute injects another bean?', options: ['value', 'bean', 'ref', 'link'], answer: 2, explanation: 'ref="beanId" injects a bean reference.' },
    { question: 'Best choice for a mandatory dependency?', options: ['Constructor injection', 'Setter injection', 'Static field', 'Lookup method'], answer: 0, explanation: 'The object cannot be created without it, and the field can be final.' },
    { question: 'Where should beans.xml be placed in a Maven project?', options: ['src/main/java', 'target/', 'project root', 'src/main/resources'], answer: 3, explanation: 'resources is copied to the classpath.' },
    { question: 'Circular dependency with only constructor injection results in...', options: ['It works silently', 'BeanCurrentlyInCreationException', 'NullPointerException at runtime', 'StackOverflowError in javac'], answer: 1, explanation: 'Spring cannot create either object first.' },
  ],
};
