const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
        System.out.println("JDK installed and working!");
    }
}`;

const ex2Main = j`public class Main {
    public static void main(String[] args) {
        Greeter g = new Greeter();
        g.greet("Eclipse");
        g.greet("IntelliJ IDEA");
        System.out.println("Both IDEs compile with the same javac.");
    }
}`;

const ex2Greeter = j`public class Greeter {
    public void greet(String ide) {
        System.out.println("Hello from " + ide + "!");
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        System.out.println("Number of arguments: " + args.length);
        if (args.length == 0) {
            System.out.println("No arguments passed. Try: java Main Ravi Pune");
        } else {
            for (String a : args) {
                System.out.println("Argument: " + a);
            }
        }
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        String item = "Java Book";
        int quantity = 3;
        int price = 450;
        int total = quantity * price;

        System.out.println("===== BILL =====");
        System.out.println("Item     : " + item);
        System.out.println("Quantity : " + quantity);
        System.out.println("Price    : " + price);
        System.out.println("Total    : " + total);
        System.out.println("================");
    }
}`;

export default {
  id: 'day-02-jdk-eclipse-intellij-first-program',
  title: 'Installing JDK, Setting up Eclipse and IntelliJ IDEA, First Java Program, Compilation and Execution (javac/java)',
  module: 'Module 1: Java Basics',
  day: 2,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Install the JDK (Java 17/21) on Windows, macOS or Linux, configure JAVA_HOME and PATH, set up both Eclipse and IntelliJ IDEA step by step, and write, compile and run your first Java program from the IDE and from the command line.',
  objectives: [
    'Download and install JDK 17 or 21 and verify it with java -version and javac -version',
    'Set the JAVA_HOME and PATH environment variables correctly',
    'Install Eclipse IDE, create a Java project, class and run it',
    'Install IntelliJ IDEA Community Edition, create a Java project, class and run it',
    'Compile with javac and run with java from the command prompt/terminal and fix common errors',
  ],
  theory: [
    {
      heading: 'Step 1: Installing the JDK (Java 17 or 21 LTS)',
      content: j`The JDK contains the compiler (javac) and the runtime (java). Without it, neither Eclipse nor IntelliJ can compile code.

Where to download (any one is fine, all are free):
- Oracle JDK: https://www.oracle.com/java/technologies/downloads/
- Eclipse Temurin (OpenJDK by Adoptium): https://adoptium.net  (recommended, free for all use)

WINDOWS
1. Open adoptium.net, choose "Temurin 21 (LTS)", Operating System = Windows, Architecture = x64, Package = JDK, and download the .msi installer.
2. Double-click the .msi. On the "Custom Setup" screen, enable "Set JAVA_HOME variable" and "Add to PATH" (click the drive icon > "Will be installed on local hard drive").
3. Click Next > Install > Finish. Default folder: C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot
4. Open a NEW Command Prompt (Win + R > cmd) and type:
   java -version
   javac -version
   Both should print version 21 (or 17).

macOS
1. Download the .pkg for macOS (choose aarch64 for Apple Silicon M1/M2/M3, x64 for Intel).
2. Double-click and follow the installer. The JDK goes to /Library/Java/JavaVirtualMachines/.
3. Open Terminal and run java -version and javac -version.
   (Or with Homebrew: brew install --cask temurin@21)

LINUX (Ubuntu/Debian)
1. sudo apt update
2. sudo apt install openjdk-21-jdk     (or openjdk-17-jdk)
3. java -version  and  javac -version`,
      tip: 'Install the JDK, not just a JRE. If "java -version" works but "javac -version" says "not recognized", you have only a runtime or your PATH points to the wrong folder.',
    },
    {
      heading: 'Step 2: Setting JAVA_HOME and PATH (manual setup on Windows)',
      content: j`If you did not tick the installer options, set them manually. PATH tells the OS where to find javac.exe and java.exe. JAVA_HOME is used by tools like Maven, Gradle, Tomcat and IDEs.

Windows:
1. Press Win key, search "Edit the system environment variables", open it, click "Environment Variables...".
2. Under "System variables" click New:
   Variable name : JAVA_HOME
   Variable value: C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot   (your actual JDK folder, WITHOUT \bin)
3. Select the "Path" variable > Edit > New > type  %JAVA_HOME%\bin  > move it to the top > OK.
4. Click OK on all windows and open a NEW Command Prompt. Check:
   echo %JAVA_HOME%
   javac -version

macOS/Linux: add to ~/.zshrc or ~/.bashrc
   export JAVA_HOME=$(/usr/libexec/java_home -v 21)      (macOS)
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64   (Ubuntu)
   export PATH=$JAVA_HOME/bin:$PATH
then run: source ~/.zshrc`,
      points: [
        'JAVA_HOME = JDK root folder (no \\bin at the end)',
        'PATH must contain JAVA_HOME\\bin',
        'Always open a NEW terminal after changing environment variables',
        'If you have several JDKs, the first one found in PATH wins',
      ],
    },
    {
      heading: 'Step 3: Setting up Eclipse IDE (step by step)',
      content: j`Eclipse is a free, open-source IDE widely used in companies and training institutes.

Install:
1. Go to https://www.eclipse.org/downloads/ and download the Eclipse Installer.
2. Run it and choose "Eclipse IDE for Java Developers" (choose "Eclipse IDE for Enterprise Java and Web Developers" later for Servlets/JSP).
3. Select the Java VM: point it to your JDK 21 folder. Click INSTALL, accept the license, then LAUNCH.
4. Workspace: Eclipse asks for a workspace folder (e.g. C:\JavaWorkspace). All projects are stored here. Tick "Use this as default" and click Launch.
5. Close the Welcome tab.

Create and run the first program:
1. File > New > Java Project.
2. Project name: Day02. JRE: "Use an execution environment JRE: JavaSE-21". Untick "Create module-info.java file" (keep things simple). Click Finish.
3. In Package Explorer (left), expand Day02, right-click src > New > Class.
4. Name: Main. Tick "public static void main(String[] args)". Leave Package empty for now (Eclipse warns about default package; that is OK for learning). Click Finish.
5. Type your code inside main.
6. Save with Ctrl + S. Eclipse compiles automatically on save (red underlines = compile errors).
7. Run: right-click inside the editor > Run As > Java Application, or press Ctrl + F11, or click the green play button.
8. Output appears in the Console view at the bottom.

Useful Eclipse shortcuts:
- sysout + Ctrl + Space  -> System.out.println();
- main + Ctrl + Space    -> public static void main(...)
- Ctrl + Shift + F  format code
- Ctrl + Shift + O  organize imports
- Ctrl + 1          quick fix for errors
- Ctrl + /          comment / uncomment line

Change JDK in Eclipse: Window > Preferences > Java > Installed JREs > Add > Standard VM > select the JDK folder > tick it as default.`,
      tip: 'If Eclipse shows "Editor does not contain a main type", your class has no correct main method or the file is outside the src folder.',
    },
    {
      heading: 'Step 4: Setting up IntelliJ IDEA (step by step)',
      content: j`IntelliJ IDEA by JetBrains is the most popular Java IDE in industry. The Community Edition is free and is enough for Core Java. (Ultimate is paid and adds Spring/web tools; students can get it free with a student licence.)

Install:
1. Go to https://www.jetbrains.com/idea/download/ and download IntelliJ IDEA Community Edition (Windows .exe, macOS .dmg, or Linux .tar.gz / snap: sudo snap install intellij-idea-community --classic).
2. Run the installer. On Windows tick "Create Desktop Shortcut", "Add bin folder to PATH" and ".java" association. Finish and launch.

Create and run the first program:
1. On the Welcome screen click "New Project".
2. Choose "Java" on the left (New Project). Name: Day02. Location: any folder.
3. Build system: IntelliJ (simplest). JDK: choose your installed JDK 21. If it is not listed, click "Add JDK..." and select the JDK folder, or "Download JDK..." to let IntelliJ download one.
4. Untick "Add sample code" if you want an empty project. Click Create.
5. In the Project window (left), right-click src > New > Java Class > type Main > Enter.
6. Inside the class type psvm and press Tab to generate the main method. Type sout + Tab to generate System.out.println().
7. Run: click the green triangle in the gutter next to main, or press Shift + F10 (Windows/Linux) / Ctrl + R (macOS).
8. Output appears in the Run window at the bottom.

Useful IntelliJ shortcuts:
- psvm + Tab  -> main method        sout + Tab -> println
- Ctrl + Alt + L  reformat code     Alt + Enter  quick fix
- Ctrl + /  comment line             Shift + Shift  search everywhere

Change JDK in IntelliJ: File > Project Structure > Project > SDK > select or add JDK.`,
      tip: 'IntelliJ saves automatically; you never need Ctrl + S. Eclipse compiles on save; IntelliJ compiles when you run (Build > Build Project = Ctrl + F9).',
    },
    {
      heading: 'Step 5: First Program from the Command Line (javac and java)',
      content: j`Knowing how to compile without an IDE is essential for interviews and servers.

1. Create a folder, e.g. C:\JavaPrograms, and a file named Main.java (use Notepad or VS Code; make sure it is not saved as Main.java.txt).
2. Open Command Prompt in that folder: cd C:\JavaPrograms
3. Compile:  javac Main.java    -> creates Main.class (bytecode)
4. Run:      java Main          -> no .class extension!
5. Since Java 11 you can run a single file directly: java Main.java (it compiles in memory).

Compiling many files at once: javac *.java
Running with arguments: java Main Ravi Pune   (values go into the args array)`,
      syntax: `javac Main.java       // compile
java Main             // run
javac *.java          // compile all files in folder
java Main.java        // single-file source launch (Java 11+)`,
    },
    {
      heading: 'Common Errors for Beginners and Their Fixes',
      content: j`Most first-day problems are environment or naming mistakes:`,
      points: [
        "'javac' is not recognized as an internal or external command -> JDK bin folder is not in PATH; fix PATH and open a new terminal",
        'error: class Main is public, should be declared in a file named Main.java -> file name must exactly match the public class name (case-sensitive)',
        'Error: Could not find or load main class Main -> you are in the wrong folder, or you typed java Main.class instead of java Main',
        'Error: Main method not found in class Main -> main must be written exactly: public static void main(String[] args)',
        'error: \';\' expected -> a statement is missing a semicolon',
        'UnsupportedClassVersionError -> code compiled with a newer JDK is run on an older JVM; use the same version',
      ],
    },
  ],
  examples: [
    {
      title: 'Hello World: compile and run from IDE and command line',
      scenario: 'Verify the JDK installation by compiling and running the classic first program in all three ways.',
      steps: [
        'Command line: save as Main.java, run "javac Main.java" then "java Main"',
        'Eclipse: File > New > Java Project (Day02) > right-click src > New > Class > Main (tick main method) > paste code > Ctrl + F11',
        'IntelliJ: New Project > Java > JDK 21 > Create > right-click src > New > Java Class > Main > paste code > Shift + F10',
        'Check the output in the Console (Eclipse) or Run window (IntelliJ)',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Hello World
JDK installed and working!`,
      explanation: 'javac converts Main.java into Main.class. The java command starts the JVM, which looks for the main method with the exact signature public static void main(String[] args) and runs it line by line.',
    },
    {
      title: 'Two classes in two files',
      scenario: 'A real project has many files. Create Greeter.java and Main.java and compile them together.',
      steps: [
        'Eclipse: right-click src > New > Class > Greeter (no main). Then create Main with main',
        'IntelliJ: right-click src > New > Java Class > Greeter, then another class Main',
        'Command line: put both files in one folder and run "javac *.java" then "java Main"',
        'Run Main (the class that has the main method)',
      ],
      code: `// File: Greeter.java
${ex2Greeter}

// File: Main.java
${ex2Main}`,
      java: { files: { 'Main.java': ex2Main, 'Greeter.java': ex2Greeter } },
      result: `Hello from Eclipse!
Hello from IntelliJ IDEA!
Both IDEs compile with the same javac.`,
      explanation: 'Each public class lives in its own file with the same name. javac *.java compiles both and creates Main.class and Greeter.class. Main creates a Greeter object and calls its greet method twice.',
    },
    {
      title: 'Command-line arguments',
      scenario: 'Understand what the String[] args parameter of main is used for.',
      steps: [
        'Command line: javac Main.java, then run "java Main" and also "java Main Ravi Pune"',
        'Eclipse: Run > Run Configurations > Arguments tab > Program arguments: Ravi Pune > Run',
        'IntelliJ: Run > Edit Configurations > Program arguments: Ravi Pune > Apply > Run',
        'Compare the outputs with and without arguments',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Number of arguments: 0
No arguments passed. Try: java Main Ravi Pune`,
      explanation: 'The shown output is for "java Main" with no arguments, so args.length is 0. With "java Main Ravi Pune" the output would be: Number of arguments: 2, Argument: Ravi, Argument: Pune.',
    },
    {
      title: 'Simple bill program',
      scenario: 'Use variables and arithmetic in your first real program: calculate a shop bill.',
      steps: [
        'Create class Main in your IDE',
        'Declare item, quantity and price variables',
        'Multiply quantity and price to get the total',
        'Run and check the formatted bill',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `===== BILL =====
Item     : Java Book
Quantity : 3
Price    : 450
Total    : 1350
================`,
      explanation: 'total = 3 * 450 = 1350. Each println prints one line. The program shows that after setup, you can immediately start writing useful logic.',
    },
  ],
  interview: [
    { q: 'What is the difference between javac and java commands?', a: 'javac is the compiler: it converts .java source into .class bytecode. java is the launcher: it starts the JVM and executes the bytecode of the given class.', level: 'Easy' },
    { q: 'What is JAVA_HOME and why is it needed?', a: 'JAVA_HOME is an environment variable pointing to the JDK installation folder. Build tools and servers like Maven, Gradle and Tomcat use it to find the JDK.', level: 'Easy' },
    { q: 'What is the PATH variable used for?', a: 'PATH lists folders where the OS searches for executables. Adding JDK\\bin to PATH lets you type javac and java from any folder.', level: 'Easy' },
    { q: 'Can we save a Java file with a name different from the class name?', a: 'Yes, if the class is not public. If the class is public, the file name must match the class name exactly, otherwise compilation fails.', level: 'Medium' },
    { q: 'Why do we write "java Main" and not "java Main.class"?', a: 'The java command takes a class name, not a file name. The JVM finds Main.class through the classpath.', level: 'Easy' },
    { q: 'What is a workspace in Eclipse?', a: 'A workspace is a folder where Eclipse stores your projects along with settings and metadata (.metadata folder).', level: 'Easy' },
    { q: 'Eclipse vs IntelliJ IDEA?', a: 'Both are Java IDEs. Eclipse is free and open-source with workspaces and compiles on save. IntelliJ (Community free, Ultimate paid) has smarter code completion, auto-save and better refactoring. Concepts like project, src, run configuration are the same.', level: 'Medium' },
    { q: 'What happens if the main method is not static?', a: 'The code compiles, but running it gives "Error: Main method is not static in class Main" (in classic launch). The JVM needs to call main without creating an object.', level: 'Medium' },
    { q: 'What is the output of java Main if args is empty and the code prints args.length?', a: '0. When no arguments are passed, args is an empty array, not null.', level: 'Medium' },
    { q: 'What is UnsupportedClassVersionError?', a: 'It occurs when a class compiled by a newer JDK (e.g. 21) is run on an older JVM (e.g. 11). Fix by running on the same or newer JVM, or compiling with --release 11.', level: 'Hard' },
    { q: 'How many .class files are created when a .java file contains 3 classes?', a: 'Three. javac creates one .class file per class, regardless of how many are in one source file.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Install JDK 21, then write a program that prints "Setup Complete" and your IDE name. Run it from Eclipse, IntelliJ and the command line.',
      hint: 'Use println. On the command line use javac Main.java then java Main.',
      solution: j`public class Main {
    public static void main(String[] args) {
        System.out.println("Setup Complete");
        System.out.println("IDE: IntelliJ IDEA and Eclipse");
    }
}`,
    },
    {
      task: 'Write a program that prints the area of a rectangle with length 12 and width 5.',
      hint: 'area = length * width.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int length = 12;
        int width = 5;
        int area = length * width;
        System.out.println("Area = " + area);
    }
}`,
    },
    {
      task: 'Write a program that greets every name passed as a command-line argument, or prints "Hello Guest" when none are passed.',
      hint: 'Check args.length and loop over args.',
      solution: j`public class Main {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Hello Guest");
        }
        for (String name : args) {
            System.out.println("Hello " + name);
        }
    }
}`,
    },
    {
      task: 'Create two files: Calculator.java with a method add(int a, int b) that returns the sum, and Main.java that prints add(10, 20). Compile with javac *.java.',
      hint: 'Create a Calculator object in Main and call add.',
      solution: j`// Calculator.java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        Calculator c = new Calculator();
        System.out.println("Sum = " + c.add(10, 20));
    }
}`,
    },
    {
      task: 'Deliberately create these errors one by one and note the message: wrong file name, missing semicolon, misspelled println. Then fix them.',
      hint: 'Read the line number in the error message; javac points to the exact line.',
      solution: j`// Correct version after fixing all errors (file: Main.java)
public class Main {
    public static void main(String[] args) {
        System.out.println("All errors fixed");
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which command compiles Main.java?', options: ['java Main.java -c', 'javac Main.java', 'java Main', 'jar Main.java'], answer: 1, explanation: 'javac is the compiler; it produces Main.class.' },
    { question: 'JAVA_HOME should point to:', options: ['The JDK bin folder', 'The Eclipse folder', 'The workspace folder', 'The JDK root installation folder'], answer: 3, explanation: 'JAVA_HOME is the JDK root; PATH gets %JAVA_HOME%\\bin.' },
    { question: 'In IntelliJ IDEA, typing psvm and pressing Tab generates:', options: ['public static void main(String[] args)', 'System.out.println()', 'A new class', 'A for loop'], answer: 0, explanation: 'psvm is the live template for the main method; sout generates println.' },
    { question: 'In Eclipse, which shortcut runs the current program?', options: ['Ctrl + S', 'Ctrl + Shift + O', 'Ctrl + F11', 'Alt + Enter'], answer: 2, explanation: 'Ctrl + F11 runs the last launched / current Java application.' },
    { question: "'javac' is not recognized as an internal or external command. What is the most likely cause?", options: ['Syntax error in code', 'JDK bin folder is not in PATH', 'Class is not public', 'Wrong package name'], answer: 1, explanation: 'The OS cannot find javac.exe because PATH does not include the JDK bin directory.' },
  ],
};
