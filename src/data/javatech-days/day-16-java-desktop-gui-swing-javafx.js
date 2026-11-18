const ex1 = `import javax.swing.*;
import java.awt.*;

public class ClickCounter {
    private int count = 0;

    public ClickCounter() {
        JFrame frame = new JFrame("Click Counter");          // the window
        frame.setSize(300, 150);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // stop program on close
        frame.setLocationRelativeTo(null);                    // centre on screen
        frame.setLayout(new FlowLayout());

        JLabel label = new JLabel("Clicked 0 times");
        JButton button = new JButton("Click me");

        // Event listener: runs every time the button is clicked
        button.addActionListener(e -> {
            count++;
            label.setText("Clicked " + count + " times");
        });

        frame.add(button);
        frame.add(label);
        frame.setVisible(true);                               // always call last
    }

    public static void main(String[] args) {
        // Swing is not thread-safe: build the UI on the Event Dispatch Thread
        SwingUtilities.invokeLater(ClickCounter::new);
    }
}`;

const ex2 = `import javax.swing.*;
import java.awt.*;

public class LayoutDemo {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Layout Managers");
            frame.setSize(500, 350);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLayout(new BorderLayout(5, 5));          // NORTH, SOUTH, EAST, WEST, CENTER

            // NORTH: a title
            JLabel title = new JLabel("Student Portal", SwingConstants.CENTER);
            title.setFont(new Font("SansSerif", Font.BOLD, 20));
            frame.add(title, BorderLayout.NORTH);

            // WEST: buttons stacked using GridLayout(rows, cols)
            JPanel menu = new JPanel(new GridLayout(4, 1, 5, 5));
            menu.add(new JButton("Home"));
            menu.add(new JButton("Courses"));
            menu.add(new JButton("Results"));
            menu.add(new JButton("Logout"));
            frame.add(menu, BorderLayout.WEST);

            // CENTER: a text area that takes the remaining space
            JTextArea area = new JTextArea("Welcome! Select an option from the menu.");
            frame.add(new JScrollPane(area), BorderLayout.CENTER);

            // SOUTH: FlowLayout puts components left to right
            JPanel bottom = new JPanel(new FlowLayout(FlowLayout.RIGHT));
            bottom.add(new JButton("Save"));
            bottom.add(new JButton("Cancel"));
            frame.add(bottom, BorderLayout.SOUTH);

            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
}`;

const ex3 = `import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Calculator extends JFrame implements ActionListener {
    private final JTextField display = new JTextField("0");
    private double first = 0;
    private char operator = ' ';
    private boolean startNew = true;

    public Calculator() {
        super("Calculator");
        setSize(300, 400);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new BorderLayout(5, 5));

        display.setEditable(false);
        display.setHorizontalAlignment(JTextField.RIGHT);
        display.setFont(new Font("SansSerif", Font.BOLD, 28));
        add(display, BorderLayout.NORTH);

        JPanel keys = new JPanel(new GridLayout(4, 4, 5, 5));
        String[] labels = {
            "7", "8", "9", "/",
            "4", "5", "6", "*",
            "1", "2", "3", "-",
            "C", "0", "=", "+"
        };
        for (String text : labels) {
            JButton b = new JButton(text);
            b.setFont(new Font("SansSerif", Font.PLAIN, 22));
            b.addActionListener(this);           // one listener for all buttons
            keys.add(b);
        }
        add(keys, BorderLayout.CENTER);
        setLocationRelativeTo(null);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        String cmd = e.getActionCommand();       // text of the clicked button
        if (cmd.matches("[0-9]")) {
            if (startNew) { display.setText(cmd); startNew = false; }
            else display.setText(display.getText() + cmd);
        } else if (cmd.equals("C")) {
            display.setText("0");
            first = 0; operator = ' '; startNew = true;
        } else if (cmd.equals("=")) {
            calculate();
            operator = ' ';
        } else {                                  // + - * /
            if (operator != ' ') calculate();     // allows 2 + 3 + 4
            first = Double.parseDouble(display.getText());
            operator = cmd.charAt(0);
            startNew = true;
        }
    }

    private void calculate() {
        double second = Double.parseDouble(display.getText());
        double result;
        switch (operator) {
            case '+' -> result = first + second;
            case '-' -> result = first - second;
            case '*' -> result = first * second;
            case '/' -> {
                if (second == 0) {
                    JOptionPane.showMessageDialog(this, "Cannot divide by zero", "Error", JOptionPane.ERROR_MESSAGE);
                    display.setText("0"); startNew = true;
                    return;
                }
                result = first / second;
            }
            default -> { return; }
        }
        // show 5 instead of 5.0
        display.setText(result == (long) result ? String.valueOf((long) result) : String.valueOf(result));
        first = result;
        startNew = true;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Calculator().setVisible(true));
    }
}`;

const ex4 = `import javax.swing.*;
import java.awt.*;

public class LoginForm {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(LoginForm::createUi);
    }

    private static void createUi() {
        JFrame frame = new JFrame("Login");
        frame.setSize(350, 200);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel form = new JPanel(new GridLayout(3, 2, 10, 10));
        form.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        JTextField userField = new JTextField();
        JPasswordField passField = new JPasswordField();   // shows dots
        JButton loginBtn = new JButton("Login");
        JButton clearBtn = new JButton("Clear");

        form.add(new JLabel("Username:"));
        form.add(userField);
        form.add(new JLabel("Password:"));
        form.add(passField);
        form.add(loginBtn);
        form.add(clearBtn);

        loginBtn.addActionListener(e -> {
            String user = userField.getText().trim();
            String pass = new String(passField.getPassword());   // char[] for security
            if (user.isEmpty() || pass.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Please enter username and password",
                        "Validation", JOptionPane.WARNING_MESSAGE);
            } else if (user.equals("admin") && pass.equals("admin123")) {
                JOptionPane.showMessageDialog(frame, "Welcome, " + user + "!");
            } else {
                JOptionPane.showMessageDialog(frame, "Invalid username or password",
                        "Login failed", JOptionPane.ERROR_MESSAGE);
                passField.setText("");
            }
        });

        clearBtn.addActionListener(e -> {
            userField.setText("");
            passField.setText("");
            userField.requestFocus();
        });

        frame.getRootPane().setDefaultButton(loginBtn);   // Enter key presses Login
        frame.add(form);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }
}`;

const ex5 = `<!-- ===== pom.xml (important parts) ===== -->
<properties>
    <maven.compiler.release>21</maven.compiler.release>
    <javafx.version>21.0.4</javafx.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.openjfx</groupId>
        <artifactId>javafx-controls</artifactId>
        <version>\${javafx.version}</version>
    </dependency>
    <dependency>
        <groupId>org.openjfx</groupId>
        <artifactId>javafx-fxml</artifactId>
        <version>\${javafx.version}</version>
    </dependency>
</dependencies>
<build>
    <plugins>
        <plugin>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-maven-plugin</artifactId>
            <version>0.0.8</version>
            <configuration>
                <mainClass>com.example.loginfx/com.example.loginfx.App</mainClass>
            </configuration>
        </plugin>
    </plugins>
</build>

// ===== src/main/java/module-info.java =====
module com.example.loginfx {
    requires javafx.controls;
    requires javafx.fxml;
    opens com.example.loginfx to javafx.fxml;   // FXML loader uses reflection on the controller
    exports com.example.loginfx;
}

// ===== src/main/java/com/example/loginfx/App.java =====
package com.example.loginfx;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class App extends Application {
    @Override
    public void start(Stage stage) throws Exception {         // Stage = the window
        FXMLLoader loader = new FXMLLoader(App.class.getResource("login.fxml"));
        Scene scene = new Scene(loader.load(), 360, 220);      // Scene = content inside the window
        stage.setTitle("JavaFX Login");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);                                          // calls start() on the FX thread
    }
}

<!-- ===== src/main/resources/com/example/loginfx/login.fxml ===== -->
<?xml version="1.0" encoding="UTF-8"?>
<?import javafx.geometry.Insets?>
<?import javafx.scene.control.*?>
<?import javafx.scene.layout.*?>

<GridPane xmlns:fx="http://javafx.com/fxml"
          fx:controller="com.example.loginfx.LoginController"
          hgap="10" vgap="10">
    <padding><Insets top="20" right="20" bottom="20" left="20"/></padding>

    <Label text="Username:" GridPane.rowIndex="0" GridPane.columnIndex="0"/>
    <TextField fx:id="usernameField" GridPane.rowIndex="0" GridPane.columnIndex="1"/>

    <Label text="Password:" GridPane.rowIndex="1" GridPane.columnIndex="0"/>
    <PasswordField fx:id="passwordField" GridPane.rowIndex="1" GridPane.columnIndex="1"/>

    <Button text="Login" defaultButton="true" onAction="#handleLogin"
            GridPane.rowIndex="2" GridPane.columnIndex="1"/>
    <Label fx:id="messageLabel" GridPane.rowIndex="3" GridPane.columnIndex="0"
           GridPane.columnSpan="2"/>
</GridPane>

// ===== src/main/java/com/example/loginfx/LoginController.java =====
package com.example.loginfx;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

public class LoginController {
    @FXML private TextField usernameField;       // names must match fx:id
    @FXML private PasswordField passwordField;
    @FXML private Label messageLabel;

    @FXML
    private void handleLogin() {                  // matches onAction="#handleLogin"
        String user = usernameField.getText().trim();
        String pass = passwordField.getText();
        if (user.isEmpty() || pass.isEmpty()) {
            messageLabel.setStyle("-fx-text-fill: orange;");
            messageLabel.setText("Please enter username and password");
        } else if (user.equals("admin") && pass.equals("admin123")) {
            messageLabel.setStyle("-fx-text-fill: green;");
            messageLabel.setText("Welcome, " + user + "!");
        } else {
            messageLabel.setStyle("-fx-text-fill: red;");
            messageLabel.setText("Invalid username or password");
            passwordField.clear();
        }
    }
}`;

const ex6 = `public class Main {
    // Pure logic: no Swing/JavaFX here, so it can be tested without a window
    static double calculate(double a, double b, char op) {
        return switch (op) {
            case '+' -> a + b;
            case '-' -> a - b;
            case '*' -> a * b;
            case '/' -> {
                if (b == 0) throw new ArithmeticException("Cannot divide by zero");
                yield a / b;
            }
            default -> throw new IllegalArgumentException("Unknown operator: " + op);
        };
    }

    static String login(String user, String pass) {
        if (user.isBlank() || pass.isBlank()) return "Please enter username and password";
        if (user.equals("admin") && pass.equals("admin123")) return "Welcome, admin!";
        return "Invalid username or password";
    }

    static void show(double a, char op, double b) {
        try {
            System.out.println(a + " " + op + " " + b + " = " + calculate(a, b, op));
        } catch (RuntimeException e) {
            System.out.println(a + " " + op + " " + b + " -> Error: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        show(12, '+', 8);
        show(15, '-', 20);
        show(6, '*', 7);
        show(10, '/', 4);
        show(5, '/', 0);
        show(2, '%', 3);
        System.out.println(login("admin", "admin123"));
        System.out.println(login("admin", "wrong"));
        System.out.println(login("", ""));
    }
}`;

export default {
  id: 'day-16-java-desktop-gui-swing-javafx',
  title: 'Java Desktop GUI: Swing Basics and Introduction to JavaFX (Calculator and Login Form)',
  module: 'Module 4: Modern Java, JVM & Desktop',
  day: 16,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Build desktop windows in Java with Swing (JFrame, JButton, layouts, event listeners) and get introduced to JavaFX (Stage, Scene, FXML, Scene Builder) by creating a calculator and a login form.',
  objectives: [
    'Create Swing windows with JFrame, JPanel, JLabel, JButton, JTextField and JPasswordField',
    'Arrange components using FlowLayout, BorderLayout and GridLayout',
    'Handle button clicks with ActionListener and lambdas, and show dialogs with JOptionPane',
    'Explain the JavaFX structure: Application, Stage, Scene, nodes, FXML and controller',
    'Design a JavaFX screen with Scene Builder and keep business logic separate from UI code',
  ],
  theory: [
    {
      heading: 'Desktop GUI in Java: AWT, Swing and JavaFX',
      content: 'A GUI (Graphical User Interface) lets users click buttons and type in boxes instead of using the console. Java has three toolkits. AWT (1995) uses the operating system\'s native widgets and is mostly outdated. Swing (Java 1.2) draws its own components, is part of the JDK (javax.swing) and still powers many internal business tools, IDEs like IntelliJ IDEA and NetBeans, and banking/billing desktop apps. JavaFX is the modern toolkit with CSS styling, FXML and better graphics; since Java 11 it is a separate download (OpenJFX).',
      points: [
        'Swing: no extra setup, comes with every JDK — good for learning and small tools',
        'JavaFX: modern look, CSS, FXML, charts, animations, media — add via Maven/Gradle',
        'Most new Java jobs are web/backend (Spring Boot), but GUI knowledge is asked for desktop, billing and lab projects',
        'Both follow the same idea: containers hold components, layouts position them, listeners handle events',
      ],
      tip: 'Class names in Swing start with J (JFrame, JButton) to separate them from old AWT classes (Frame, Button).',
    },
    {
      heading: 'Swing Building Blocks',
      content: 'Think of a Swing app like a house: JFrame is the house (window with title bar), JPanel is a room that groups things, and components (JLabel, JButton, JTextField) are the furniture. Components are added to panels, panels are added to the frame.',
      syntax: `JFrame frame = new JFrame("Title");
frame.setSize(400, 300);
frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
frame.add(new JButton("OK"));
frame.setVisible(true);   // last line`,
      points: [
        'JLabel: show text/image; JButton: clickable button',
        'JTextField: single-line input; JPasswordField: hidden input (getPassword() returns char[])',
        'JTextArea: multi-line text (wrap in JScrollPane); JCheckBox, JRadioButton + ButtonGroup, JComboBox (dropdown), JTable',
        'JOptionPane.showMessageDialog / showConfirmDialog / showInputDialog: quick popups',
        'Without EXIT_ON_CLOSE, closing the window leaves the program running in the background',
        'Call setVisible(true) after adding all components',
      ],
    },
    {
      heading: 'Layout Managers',
      content: 'A layout manager decides the position and size of components, so the window looks right when resized — like a shelf organiser that automatically arranges items. Avoid setLayout(null) with fixed pixel positions; it breaks on different screen sizes.',
      points: [
        'FlowLayout: left to right like words in a line, wraps to the next line (default for JPanel)',
        'BorderLayout: five areas NORTH, SOUTH, EAST, WEST, CENTER; CENTER takes extra space (default for JFrame)',
        'GridLayout(rows, cols): equal-sized cells — perfect for calculator keypads and simple forms',
        'BoxLayout: single row or column; GridBagLayout: flexible but complex grid',
        'Nest panels: e.g. a GridLayout panel inside the CENTER of a BorderLayout frame',
      ],
    },
    {
      heading: 'Event Handling and the Event Dispatch Thread',
      content: 'Swing follows the delegation event model: a source (button) generates an event (ActionEvent) and sends it to registered listeners (ActionListener). It is like a doorbell: pressing it (event) rings in the house and whoever is listening (listener) opens the door.',
      syntax: `button.addActionListener(e -> label.setText("Clicked"));          // lambda (Java 8+)

class MyHandler implements ActionListener {
    public void actionPerformed(ActionEvent e) { ... e.getActionCommand() ... }
}`,
      points: [
        'ActionListener: buttons, Enter in text field; KeyListener: keys; MouseListener: clicks/hover; WindowListener: closing',
        'e.getActionCommand() returns the button text — useful when one listener handles many buttons',
        'Swing is single-threaded: all UI work must happen on the Event Dispatch Thread (EDT); start with SwingUtilities.invokeLater',
        'Never do long tasks (DB call, file download) inside a listener — the window freezes. Use SwingWorker or a background thread',
      ],
      tip: 'Common mistake: comparing passwords with == or calling getText() on JPasswordField (deprecated). Use new String(passField.getPassword()) and equals().',
    },
    {
      heading: 'JavaFX: Application, Stage, Scene and Nodes',
      content: 'JavaFX uses a theatre analogy. The Stage is the theatre stage (the window). The Scene is the current play shown on the stage (the content). Nodes are the actors and props (Button, Label, TextField, layouts like VBox, HBox, GridPane, BorderPane) arranged in a tree called the scene graph. You can switch scenes on the same stage, like changing from a login screen to a dashboard.',
      syntax: `public class App extends Application {
    public void start(Stage stage) {
        Button b = new Button("Hello");
        b.setOnAction(e -> System.out.println("Clicked"));
        stage.setScene(new Scene(new VBox(b), 300, 200));
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
      points: [
        'Lifecycle: init() -> start(Stage) -> stop()',
        'Layouts: VBox (vertical), HBox (horizontal), GridPane (form), BorderPane (top/left/center/right/bottom), StackPane',
        'Styling with CSS: -fx-background-color, -fx-font-size; scene.getStylesheets().add(...)',
        'Setup: create a "JavaFX" project in IntelliJ (New Project > JavaFX) or add org.openjfx dependencies with Maven',
        'UI updates from a background thread must use Platform.runLater(...)',
      ],
    },
    {
      heading: 'FXML, Controllers and Scene Builder',
      content: 'FXML is an XML file that describes the UI (like HTML for a web page), while a Java controller class contains the event-handling code (like JavaScript). This separates design from logic so a designer can change the screen without touching Java. Scene Builder (free from Gluon) is a drag-and-drop designer that generates FXML.',
      points: [
        'fx:controller="package.LoginController" links the FXML to its controller',
        'fx:id="usernameField" + @FXML private TextField usernameField injects the component',
        'onAction="#handleLogin" calls the @FXML method handleLogin() in the controller',
        'FXMLLoader.load(...) reads the FXML and creates the node tree',
        'Scene Builder: drag controls from Library, set fx:id in the Code panel, set Controller class in the Document panel, save the .fxml',
        'IntelliJ: Settings > Languages & Frameworks > JavaFX > path to Scene Builder, then right-click .fxml > Open in SceneBuilder',
        'With modules, add "opens your.package to javafx.fxml" in module-info.java, otherwise you get IllegalAccessException',
      ],
    },
  ],
  examples: [
    {
      title: 'First Swing Window: Click Counter',
      scenario: 'Create a window with a button and a label that counts clicks — the "Hello World" of GUI programming.',
      steps: [
        'IntelliJ: File > New > Project > Java (JDK 17/21) > Create; right-click src > New > Java Class > ClickCounter',
        'Eclipse: File > New > Java Project; right-click src > New > Class > ClickCounter (tick public static void main)',
        'If Eclipse shows "javax.swing is not accessible", delete module-info.java or add requires java.desktop; to it',
        'Type the code and click Run — a small window appears in the centre of the screen',
        'Click the button a few times and watch the label update; close the window to stop the program',
      ],
      code: ex1,
      result: `A 300x150 window titled "Click Counter" opens with a "Click me" button and the label "Clicked 0 times".
After clicking 3 times the label shows: Clicked 3 times
Closing the window ends the program.`,
      explanation: 'JFrame is the window, FlowLayout places the button and label side by side. addActionListener registers a lambda that runs on every click; it updates the instance field count and the label. SwingUtilities.invokeLater makes sure the UI is created on the Event Dispatch Thread.',
    },
    {
      title: 'Layout Managers: BorderLayout + GridLayout + FlowLayout',
      scenario: 'Design a simple "Student Portal" screen with a title, side menu, content area and bottom buttons.',
      steps: [
        'Create class LayoutDemo with the code below',
        'Run it and resize the window with the mouse',
        'Notice: the CENTER text area grows, NORTH/SOUTH keep their height, WEST keeps its width',
        'Change GridLayout(4, 1) to GridLayout(2, 2) and see the menu become a 2x2 grid',
      ],
      code: ex2,
      result: `A 500x350 window titled "Layout Managers":
- Top: bold title "Student Portal"
- Left: four equal buttons Home, Courses, Results, Logout stacked vertically
- Centre: an editable text area "Welcome! Select an option from the menu."
- Bottom right: Save and Cancel buttons`,
      explanation: 'The frame uses BorderLayout; each region holds a panel with its own layout (nesting). GridLayout makes all menu buttons the same size; FlowLayout.RIGHT aligns the bottom buttons to the right. Wrapping JTextArea in JScrollPane adds scroll bars when text grows.',
    },
    {
      title: 'Swing Calculator with GridLayout and One ActionListener',
      scenario: 'Build a working four-function calculator — a very common college and fresher project.',
      steps: [
        'Create class Calculator that extends JFrame and implements ActionListener',
        'Add a read-only JTextField at the top and a 4x4 GridLayout of buttons in the centre',
        'Register "this" as the listener for every button; use e.getActionCommand() to know which was clicked',
        'Run and test: 7 * 6 = 42, 9 / 2 = 4.5, 8 / 0 shows an error dialog, C clears',
        'Extension: add a "." button and a backspace button',
      ],
      code: ex3,
      result: `Window "Calculator" with display "0" and buttons 7 8 9 / 4 5 6 * 1 2 3 - C 0 = +
Press 7, *, 6, = -> display shows 42
Press 9, /, 2, = -> display shows 4.5
Press 2, +, 3, +, 4, = -> display shows 9
Press 8, /, 0, = -> dialog "Cannot divide by zero", display resets to 0`,
      explanation: 'Digits are appended to the display (or start a new number after an operator). When an operator is pressed, the current number is stored in first and the operator remembered; pressing another operator first calculates the pending result, enabling chains like 2 + 3 + 4. calculate() uses a switch and shows whole numbers without ".0".',
    },
    {
      title: 'Swing Login Form with Validation and JOptionPane',
      scenario: 'Create a login screen that validates empty fields and checks credentials.',
      steps: [
        'Create class LoginForm with the code below',
        'Run it; try Login with empty fields, then admin / wrong, then admin / admin123',
        'Press Enter instead of clicking — setDefaultButton makes Enter trigger Login',
        'Real project: replace the hard-coded check with a JDBC query using PreparedStatement and a hashed password (BCrypt)',
      ],
      code: ex4,
      result: `Window "Login" with Username and Password fields and Login / Clear buttons.
Empty fields + Login -> warning dialog "Please enter username and password"
admin / wrong        -> error dialog "Invalid username or password" (password field cleared)
admin / admin123     -> dialog "Welcome, admin!"
Clear                -> both fields emptied, cursor in Username`,
      explanation: 'GridLayout(3, 2) creates a neat label/field form. JPasswordField.getPassword() returns a char[] so the password is not kept as an immutable String longer than needed. JOptionPane shows modal dialogs with different icons for warning and error.',
    },
    {
      title: 'JavaFX Login with FXML, Controller and Scene Builder',
      scenario: 'Rebuild the login form in JavaFX, with the UI in FXML (designed in Scene Builder) and logic in a controller.',
      steps: [
        'IntelliJ: File > New > Project > JavaFX, Group com.example, Artifact loginfx, JDK 21, Build system Maven > Next > Create',
        'Eclipse: install "e(fx)clipse" from Help > Eclipse Marketplace, or create a Maven project and add the pom.xml parts below',
        'Download Scene Builder from gluonhq.com/products/scene-builder and install it',
        'Create login.fxml under src/main/resources/com/example/loginfx; open it in Scene Builder',
        'In Scene Builder: drag a GridPane, add Labels, TextField, PasswordField, Button, Label; set fx:id for each in the Code panel and On Action = handleLogin for the button',
        'In the Document > Controller panel set controller class com.example.loginfx.LoginController; save',
        'Create App.java and LoginController.java, check module-info.java contains "opens com.example.loginfx to javafx.fxml"',
        'Run with the Maven tool window: Plugins > javafx > javafx:run (or mvn clean javafx:run)',
      ],
      code: ex5,
      result: `Window "JavaFX Login" (360x220) with Username, Password, Login button and a message label.
Empty fields      -> orange text: Please enter username and password
admin / wrong     -> red text: Invalid username or password
admin / admin123  -> green text: Welcome, admin!`,
      explanation: 'App.start() receives the Stage, loads the FXML into a Scene and shows it. FXMLLoader creates the controller named in fx:controller, injects fields marked @FXML whose names match fx:id, and wires onAction="#handleLogin" to the method. The message appears inside the window instead of a popup. Running with plain "java" without the JavaFX modules gives "JavaFX runtime components are missing" — that is why we use the javafx-maven-plugin.',
    },
    {
      title: 'Keep Logic Separate from the UI (testable without a window)',
      scenario: 'Move calculator and login rules into plain methods so they can be unit-tested and reused by both Swing and JavaFX screens.',
      steps: [
        'Create Main.java with calculate() and login() methods that do not use any GUI class',
        'Run it as a normal console program',
        'In the Swing/JavaFX listeners, just call these methods and display the result',
        'Later you can write JUnit tests for these methods (see Day 6 testing)',
      ],
      code: ex6,
      java: { files: { 'Main.java': ex6 } },
      result: `12.0 + 8.0 = 20.0
15.0 - 20.0 = -5.0
6.0 * 7.0 = 42.0
10.0 / 4.0 = 2.5
5.0 / 0.0 -> Error: Cannot divide by zero
2.0 % 3.0 -> Error: Unknown operator: %
Welcome, admin!
Invalid username or password
Please enter username and password`,
      explanation: 'The int arguments 12 and 8 are widened to double, so they print as 12.0 and 8.0. Division by zero is checked explicitly (double division would otherwise give Infinity). Unknown operators throw IllegalArgumentException, caught in show(). This MVC-style separation is how real desktop apps are organised: View (Swing/FXML), Controller (listeners), Model/Service (pure logic).',
    },
  ],
  interview: [
    { q: 'What is the difference between AWT and Swing?', a: 'AWT components are heavyweight — they use native OS widgets, so look differs by platform and the set is limited. Swing components are lightweight — drawn by Java itself, platform-independent look (pluggable look and feel), richer set (JTable, JTree, JTabbedPane). Swing is built on top of AWT and lives in javax.swing.', level: 'Easy' },
    { q: 'Swing vs JavaFX?', a: 'Swing is older, part of the JDK, mature and widely used in existing desktop apps. JavaFX is the modern toolkit: scene graph, CSS styling, FXML for UI design, Scene Builder, built-in charts, animations and media, better hardware-accelerated graphics. Since Java 11 JavaFX is a separate OpenJFX library.', level: 'Easy' },
    { q: 'What is a layout manager? Name the default layouts of JFrame and JPanel.', a: 'An object that sets size and position of components inside a container automatically. JFrame (content pane) uses BorderLayout by default; JPanel uses FlowLayout by default.', level: 'Easy' },
    { q: 'Explain the delegation event model in Swing.', a: 'An event source (e.g. JButton) generates an event object (ActionEvent) and passes it to all registered listener objects (ActionListener) by calling their method (actionPerformed). The listener is registered with addXxxListener. This separates the component from the event-handling code.', level: 'Medium' },
    { q: 'What is the Event Dispatch Thread and why use SwingUtilities.invokeLater?', a: 'Swing is not thread-safe; all UI creation and updates must happen on one special thread, the EDT. invokeLater queues the code to run on the EDT. Long tasks must run in a background thread (SwingWorker) and push UI updates back to the EDT, otherwise the UI freezes or behaves unpredictably.', level: 'Medium' },
    { q: 'Why does JPasswordField.getPassword() return char[] instead of String?', a: 'Strings are immutable and may stay in memory (String pool, heap) until GC; a char[] can be overwritten (Arrays.fill(pwd, \'0\')) right after use, reducing the time the password exists in memory.', level: 'Medium' },
    { q: 'What are Stage, Scene and Node in JavaFX?', a: 'Stage is the top-level window (the primary stage is passed to start()). Scene is the container for all content shown in a stage, with a root node. Nodes are UI elements and layouts (Button, Label, VBox, GridPane) forming the scene graph tree.', level: 'Easy' },
    { q: 'What is FXML and how is a controller connected to it?', a: 'FXML is an XML-based language to define a JavaFX UI separately from Java code. The root element declares fx:controller="package.Class"; FXMLLoader creates that controller, injects @FXML fields whose names match fx:id attributes, and binds event attributes like onAction="#methodName" to controller methods.', level: 'Medium' },
    { q: 'What is Scene Builder?', a: 'A free drag-and-drop visual designer (by Gluon) for JavaFX that generates FXML files. You design screens visually, set fx:id and event handler names, and the controller code is written in Java. It integrates with IntelliJ and Eclipse.', level: 'Easy' },
    { q: 'You get "Error: JavaFX runtime components are missing". How do you fix it?', a: 'Since Java 11 JavaFX is not in the JDK. Add OpenJFX dependencies (javafx-controls, javafx-fxml) and run with the javafx-maven-plugin (mvn javafx:run), or pass --module-path /path/to/javafx-sdk/lib --add-modules javafx.controls,javafx.fxml as VM options.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Swing temperature converter: a text field for Celsius, a button "Convert", and a label showing Fahrenheit. Show an error dialog for non-numeric input.',
      hint: 'F = C * 9 / 5 + 32. Use Double.parseDouble inside try-catch(NumberFormatException).',
      solution: `import javax.swing.*;
import java.awt.*;

public class TempConverter {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame f = new JFrame("Celsius to Fahrenheit");
            f.setSize(380, 120);
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            f.setLayout(new FlowLayout());

            JTextField input = new JTextField(8);
            JButton convert = new JButton("Convert");
            JLabel result = new JLabel("Fahrenheit: -");

            convert.addActionListener(e -> {
                try {
                    double c = Double.parseDouble(input.getText().trim());
                    double fah = c * 9 / 5 + 32;
                    result.setText(String.format("Fahrenheit: %.1f", fah));
                } catch (NumberFormatException ex) {
                    JOptionPane.showMessageDialog(f, "Please enter a valid number",
                            "Invalid input", JOptionPane.ERROR_MESSAGE);
                }
            });

            f.add(new JLabel("Celsius:"));
            f.add(input);
            f.add(convert);
            f.add(result);
            f.setLocationRelativeTo(null);
            f.setVisible(true);
        });
    }
}`,
    },
    {
      task: 'Create a Swing student registration form with name (JTextField), gender (JRadioButton Male/Female in a ButtonGroup), course (JComboBox: Java, Python, .NET) and a Submit button that shows all values in a JOptionPane.',
      hint: 'Use GridLayout(4, 2). Put radio buttons in a small JPanel and add both to one ButtonGroup.',
      solution: `import javax.swing.*;
import java.awt.*;

public class RegistrationForm {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame f = new JFrame("Student Registration");
            f.setSize(380, 220);
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            JPanel form = new JPanel(new GridLayout(4, 2, 8, 8));
            form.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

            JTextField name = new JTextField();
            JRadioButton male = new JRadioButton("Male", true);
            JRadioButton female = new JRadioButton("Female");
            ButtonGroup group = new ButtonGroup();
            group.add(male);
            group.add(female);
            JPanel genderPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
            genderPanel.add(male);
            genderPanel.add(female);
            JComboBox<String> course = new JComboBox<>(new String[]{"Java", "Python", ".NET"});
            JButton submit = new JButton("Submit");

            form.add(new JLabel("Name:"));    form.add(name);
            form.add(new JLabel("Gender:"));  form.add(genderPanel);
            form.add(new JLabel("Course:"));  form.add(course);
            form.add(new JLabel());           form.add(submit);

            submit.addActionListener(e -> {
                if (name.getText().isBlank()) {
                    JOptionPane.showMessageDialog(f, "Name is required");
                    return;
                }
                String gender = male.isSelected() ? "Male" : "Female";
                JOptionPane.showMessageDialog(f, "Name: " + name.getText().trim()
                        + "\\nGender: " + gender + "\\nCourse: " + course.getSelectedItem());
            });

            f.add(form);
            f.setLocationRelativeTo(null);
            f.setVisible(true);
        });
    }
}`,
    },
    {
      task: 'Write a JavaFX program WITHOUT FXML: a VBox with a TextField, a Button "Greet" and a Label. On click show "Hello, <name>!".',
      hint: 'Extend Application, build nodes in start(), button.setOnAction(e -> label.setText(...)).',
      solution: `package com.example.greet;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class GreetApp extends Application {
    @Override
    public void start(Stage stage) {
        TextField nameField = new TextField();
        nameField.setPromptText("Enter your name");
        Button greet = new Button("Greet");
        Label output = new Label();

        greet.setOnAction(e -> {
            String name = nameField.getText().trim();
            output.setText(name.isEmpty() ? "Please type a name" : "Hello, " + name + "!");
        });

        VBox root = new VBox(10, nameField, greet, output);
        root.setPadding(new Insets(20));
        stage.setScene(new Scene(root, 300, 160));
        stage.setTitle("Greeting");
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}`,
    },
    {
      task: 'Add keyboard support to the Swing calculator: typing digits and + - * / = on the keyboard should work like clicking buttons.',
      hint: 'Use the InputMap/ActionMap of the content pane, or add a KeyListener to the frame and call actionPerformed with a new ActionEvent. Key bindings are the recommended way.',
      solution: `// Add inside the Calculator constructor, after creating the buttons:
JRootPane root = getRootPane();
String keys = "0123456789+-*/=";
for (char ch : keys.toCharArray()) {
    String cmd = String.valueOf(ch);
    root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
        .put(KeyStroke.getKeyStroke(ch), "key" + cmd);
    root.getActionMap().put("key" + cmd, new AbstractAction() {
        @Override
        public void actionPerformed(ActionEvent e) {
            Calculator.this.actionPerformed(
                new ActionEvent(Calculator.this, ActionEvent.ACTION_PERFORMED, cmd));
        }
    });
}
// Enter key also means "="
root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
    .put(KeyStroke.getKeyStroke("ENTER"), "key=");
// Escape clears
root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
    .put(KeyStroke.getKeyStroke("ESCAPE"), "keyC");
root.getActionMap().put("keyC", new AbstractAction() {
    @Override
    public void actionPerformed(ActionEvent e) {
        Calculator.this.actionPerformed(
            new ActionEvent(Calculator.this, ActionEvent.ACTION_PERFORMED, "C"));
    }
});`,
    },
  ],
  quiz: [
    {
      question: 'Which method call is needed so that closing a JFrame also stops the program?',
      options: ['frame.dispose()', 'frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)', 'frame.setVisible(false)', 'System.gc()'],
      answer: 1,
      explanation: 'The default operation only hides the window; EXIT_ON_CLOSE terminates the JVM when the window is closed.',
    },
    {
      question: 'Which layout manager is best for a calculator keypad with equal-sized buttons?',
      options: ['FlowLayout', 'BorderLayout', 'GridLayout', 'No layout (null)'],
      answer: 2,
      explanation: 'GridLayout(rows, cols) gives every cell the same size, ideal for keypads.',
    },
    {
      question: 'In JavaFX, what does the Stage represent?',
      options: ['The top-level window', 'A button', 'A CSS file', 'The FXML controller'],
      answer: 0,
      explanation: 'Stage is the window; a Scene with its node tree is placed on the stage.',
    },
    {
      question: 'How is a TextField declared in FXML with fx:id="emailField" accessed in the controller?',
      options: ['TextField emailField = new TextField();', 'Using getElementById("emailField")', 'It cannot be accessed', '@FXML private TextField emailField;'],
      answer: 3,
      explanation: 'FXMLLoader injects the node into a field annotated with @FXML whose name matches the fx:id.',
    },
    {
      question: 'Why should a long database call NOT be made directly inside a Swing button listener?',
      options: ['Listeners cannot call JDBC', 'It blocks the Event Dispatch Thread and freezes the UI', 'Swing automatically cancels it', 'It causes a compile error'],
      answer: 1,
      explanation: 'Listeners run on the EDT; blocking it stops repainting and event handling. Use SwingWorker or a background thread.',
    },
  ],
};
