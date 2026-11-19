export default {
  lesson: 'day-16-java-desktop-gui-swing-javafx',
  minutes: 22,
  intro: 'Build Swing windows with layouts and listeners, respect the Event Dispatch Thread and know the JavaFX building blocks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement about Java desktop GUI libraries is correct?',
      options: [
        'AWT is the newest and recommended for all new apps',
        'Swing (javax.swing) is built on AWT and ships with the JDK; JavaFX is the modern toolkit that is now a separate library (OpenJFX)',
        'JavaFX is part of every JDK since Java 11',
        'Swing only works on Windows',
      ],
      answer: 1,
      explain: 'AWT → Swing (pure-Java components, in the JDK) → **JavaFX** (CSS styling, FXML, Scene Builder). Since Java 11 JavaFX is not bundled; you add OpenJFX as a dependency.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Your JFrame window closes, but the program keeps running in the background. Complete the line:\n```\nframe.setDefaultCloseOperation(???);\n```',
      example: { title: 'basic frame setup', code: 'JFrame frame = new JFrame("Login");\nframe.setSize(300, 200);\nframe.setVisible(true);' },
      accept: ['JFrame.EXIT_ON_CLOSE', 'WindowConstants.EXIT_ON_CLOSE'],
      explain: 'The default is `HIDE_ON_CLOSE`: the window disappears but the JVM keeps running. `JFrame.EXIT_ON_CLOSE` ends the application when the main window is closed.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A calculator\'s buttons all call `press(label)` from their ActionListener. The user clicks `1`, `2`, `*`, `3`, `=` and then `-`, `6`, `=`. What does the display show after each `=`? (two lines)',
      example: { title: 'wiring a button', code: 'btn.addActionListener(e -> press(btn.getText()));' },
      code: `String display = "";
int first; char op;

void press(String k) {
    if (Character.isDigit(k.charAt(0))) {
        display += k;
    } else if (k.equals("=")) {
        int second = Integer.parseInt(display);
        int r = switch (op) { case '+' -> first + second;
                              case '-' -> first - second;
                              default  -> first * second; };
        display = String.valueOf(r);
        System.out.println(display);
    } else {                       // + - *
        first = Integer.parseInt(display);
        op = k.charAt(0);
        display = "";
    }
}`,
      expected: '36\n30',
      explain: '"1","2" build 12; `*` stores first = 12; "3" → second = 3 → 12 × 3 = **36**. The display "36" then becomes `first` when `-` is pressed; 36 − 6 = **30**. Real calculators keep this state in fields of the frame class.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which layout manager best fits a calculator\'s 4 × 4 grid of equal-size buttons?',
      options: ['FlowLayout', 'BorderLayout', 'GridLayout(4, 4)', 'No layout - always use absolute positions'],
      answer: 2,
      explain: '`GridLayout(rows, cols)` gives every cell the same size - perfect for keypads. `BorderLayout` (default for a JFrame content pane) has NORTH/SOUTH/EAST/WEST/CENTER, e.g. display in NORTH and button panel in CENTER. Absolute positioning breaks when the window is resized.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Swing is not thread-safe. Complete `main` so the window is created on the **Event Dispatch Thread**:\n```\npublic static void main(String[] args) {\n    ???(() -> new LoginFrame().setVisible(true));\n}\n```',
      example: { title: 'long work off the EDT', text: 'Use SwingWorker for slow tasks (DB calls) so the UI does not freeze.' },
      accept: ['SwingUtilities.invokeLater', 'EventQueue.invokeLater', 'java.awt.EventQueue.invokeLater', 'javax.swing.SwingUtilities.invokeLater'],
      explain: '`SwingUtilities.invokeLater(...)` queues the code on the **EDT**, the single thread allowed to touch Swing components. Doing slow work on the EDT freezes the window; do it in a SwingWorker.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **JavaFX** are TRUE? (choose all that apply)',
      options: [
        'The main class extends Application and builds the UI in start(Stage stage)',
        'Stage = the window, Scene = the content inside it, made of Nodes',
        'FXML describes the UI in XML and a controller class handles events (@FXML)',
        'Scene Builder lets you design FXML screens by drag and drop',
        'JavaFX apps must use JFrame',
      ],
      answers: [0, 1, 2, 3],
      explain: 'JavaFX: `Application.launch()` → `start(Stage)` → `stage.setScene(new Scene(root))`. FXML separates layout from code, with `@FXML` fields and handler methods in the controller. JFrame belongs to Swing.',
    },
  ],
};
