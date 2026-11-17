export default {
  id: "day-02-installing-mysql-workbench",
  title: "Installing MySQL Server 8 and MySQL Workbench (Windows, macOS, Linux)",
  module: "Module 1: Getting Started with MySQL & Workbench",
  day: 2,
  level: "Beginner",
  duration: "2 hours",
  summary: "Install MySQL Community Server 8 and MySQL Workbench step by step on Windows, macOS and Linux, set the root password, verify that the server service is running, create and test a Workbench connection, and use the MySQL Command Line Client.",
  objectives: [
    "Download the correct MySQL installer for your operating system",
    "Install MySQL Server 8 and MySQL Workbench and set a strong root password",
    "Verify the MySQL service is running and listening on port 3306",
    "Create, test and open a connection in MySQL Workbench",
    "Log in with the MySQL Command Line Client and run basic commands"
  ],
  theory: [
    {
      heading: "What Exactly Are We Installing?",
      content: "MySQL has a client-server architecture. The MySQL Server (program name mysqld) is the engine that stores data and runs queries; it runs in the background as a service and listens on TCP port 3306. A client is any program that connects to the server and sends SQL: MySQL Workbench (graphical), the mysql command line client (text), or your Java/Python application. Think of the server as a restaurant kitchen and the clients as waiters taking orders to it. You need both: the server to hold the data and Workbench to work with it comfortably.",
      points: [
        "MySQL Community Server 8.x: free, open-source database server. Choose 8.0 or the 8.4 LTS release.",
        "MySQL Workbench 8.0.x: free official GUI for writing SQL, designing ER diagrams and administration.",
        "MySQL Shell (mysqlsh) and Connector/J, Connector/Python etc. are optional extras.",
        "Hardware: about 1 GB free disk and 4 GB RAM is plenty for learning.",
        "Download page: dev.mysql.com/downloads (choose \"MySQL Community (GPL) Downloads\"). You can click \"No thanks, just start my download\" to skip the Oracle login."
      ]
    },
    {
      heading: "Windows: Step-by-Step with MySQL Installer",
      content: "On Windows the easiest way is the MySQL Installer (an .msi package) which installs Server, Workbench, Shell and samples together.",
      points: [
        "Step 1: Go to dev.mysql.com/downloads/installer, choose \"Windows (x86, 32-bit), MSI Installer\" - the larger file (mysql-installer-community-8.0.xx.msi, about 300 MB) works offline. (It installs 64-bit products even though the label says 32-bit.)",
        "Step 2: Run the .msi. If asked, allow it to install the Microsoft Visual C++ Redistributable (Workbench needs it).",
        "Step 3: Choosing a Setup Type: select \"Custom\" (or \"Developer Default\"/\"Full\"). In Custom, add MySQL Server 8.0.x, MySQL Workbench 8.0.x and MySQL Shell from \"Available Products\" to \"Products To Be Installed\". Click Next, then Execute, and wait for green ticks.",
        "Step 4: Type and Networking: Config Type = Development Computer, keep TCP/IP checked, Port = 3306, X Protocol Port = 33060, tick \"Open Windows Firewall ports for network access\".",
        "Step 5: Authentication Method: choose \"Use Strong Password Encryption for Authentication (RECOMMENDED)\" (caching_sha2_password).",
        "Step 6: Accounts and Roles: type the MySQL Root Password twice. WRITE IT DOWN - you need it every time you connect. Optionally click \"Add User\" to create a normal user.",
        "Step 7: Windows Service: keep \"Configure MySQL Server as a Windows Service\" ticked, Service Name = MySQL80, tick \"Start the MySQL Server at System Startup\", run as Standard System Account.",
        "Step 8: Server File Permissions: keep the default, click Next, then Execute on \"Apply Configuration\". Wait until every step shows a green tick, then Finish.",
        "Step 9: Product Configuration may ask to configure Samples and Examples: enter the root password, click Check, then Next and Execute.",
        "Step 10: Installation Complete: tick \"Start MySQL Workbench after setup\" and click Finish."
      ],
      tip: "Add C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin to the PATH environment variable (System Properties > Environment Variables > Path > New) so that the mysql command works in any Command Prompt."
    },
    {
      heading: "macOS and Linux Installation",
      content: `macOS: download the DMG Archive for your chip from dev.mysql.com/downloads/mysql (macOS 14 (ARM, 64-bit) for Apple Silicon M1/M2/M3, x86 for Intel). Open the .pkg, click Continue > Agree > Install. On "Configure MySQL Server" choose "Use Strong Password Encryption", enter the root password and click Finish. The server is controlled from System Settings > MySQL (Start/Stop, "Start MySQL when your computer starts up"). Then download MySQL Workbench (macOS DMG), drag MySQLWorkbench.app to Applications. If macOS blocks it, open System Settings > Privacy & Security and click "Open Anyway". With Homebrew you can instead run: brew install mysql, brew services start mysql, then mysql_secure_installation.

Linux (Ubuntu/Debian): MySQL is in the standard repositories. Install the server, secure it, and install Workbench from the MySQL APT repository or the .deb from dev.mysql.com/downloads/workbench (Snap: sudo snap install mysql-workbench-community).`,
      syntax: `# Ubuntu / Debian
sudo apt update
sudo apt install mysql-server -y
sudo systemctl status mysql          # should show "active (running)"
sudo mysql_secure_installation       # set password policy, remove anonymous users, disallow remote root

# On Ubuntu root uses auth_socket. Give root a password so Workbench can log in:
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'Root@123';
FLUSH PRIVILEGES;
EXIT;

# Fedora / RHEL
sudo dnf install mysql-server -y
sudo systemctl enable --now mysqld
sudo grep 'temporary password' /var/log/mysqld.log   # first login password`,
      points: [
        "On Ubuntu, sudo mysql works without a password because root uses the auth_socket plugin. Workbench cannot use auth_socket, so set a password as shown.",
        "Start / stop / restart: sudo systemctl start mysql | stop mysql | restart mysql.",
        "Config file: /etc/mysql/mysql.conf.d/mysqld.cnf (Linux), C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini (Windows)."
      ]
    },
    {
      heading: "Verifying the Server Is Running",
      content: "After installation always confirm the service is up before opening Workbench. Most \"Cannot connect\" errors simply mean the service is stopped.",
      points: [
        "Windows: press Win+R, type services.msc, find MySQL80; Status should be Running. Right-click > Start if it is stopped. Or in an Administrator Command Prompt: net start MySQL80.",
        "macOS: System Settings > MySQL shows a green \"active\" indicator. Homebrew: brew services list.",
        "Linux: sudo systemctl status mysql shows \"active (running)\".",
        "Port check: netstat -ano | findstr 3306 (Windows) or sudo ss -tlnp | grep 3306 (Linux) should show mysqld listening.",
        "Error 2003 \"Can't connect to MySQL server on localhost:3306 (10061)\" = service stopped or wrong port. Error 1045 \"Access denied for user root@localhost (using password: YES)\" = wrong password."
      ]
    },
    {
      heading: "Creating a Connection in MySQL Workbench",
      content: "A connection stores the details Workbench needs to reach a server. The installer usually creates \"Local instance MySQL80\" automatically. To create one yourself:",
      points: [
        "Step 1: Open MySQL Workbench. On the Home screen, next to the heading \"MySQL Connections\", click the + (plus) icon. The \"Setup New Connection\" dialog opens.",
        "Step 2: Connection Name: e.g. Local College. Connection Method: Standard (TCP/IP).",
        "Step 3: Parameters tab: Hostname = 127.0.0.1 (or localhost), Port = 3306, Username = root.",
        "Step 4: Password: click \"Store in Vault...\" (Windows) / \"Store in Keychain...\" (macOS/Linux), type the root password, OK. If you skip this, Workbench asks every time.",
        "Step 5: Default Schema: leave empty for now (later you can enter college so it is selected automatically).",
        "Step 6: Click \"Test Connection\". You should see \"Successfully made the MySQL connection\" with the host, port, user and SSL information. Click OK.",
        "Step 7: Click OK to save. A new tile appears under MySQL Connections. Click the tile once to open the SQL Editor.",
        "Right-click a tile for Edit Connection..., Copy JDBC Connection String, Delete Connection."
      ],
      tip: "If Test Connection warns \"Incompatible/nonstandard server version\" just click Continue Anyway. This happens when Workbench is older than the server (e.g. Workbench 8.0 with Server 8.4/9.x)."
    },
    {
      heading: "MySQL Command Line Client",
      content: "The command line client is a text tool installed with the server. On Windows open Start > MySQL > \"MySQL 8.0 Command Line Client\" and type the root password (it logs in as root automatically). From any terminal (after adding bin to PATH) use mysql -u root -p. The prompt changes to mysql> and every statement must end with ; (or \\G for vertical output). Commands like USE, SHOW and SELECT work exactly as in Workbench.",
      syntax: `mysql -u root -p                       # -u user, -p ask for password
mysql -u root -p -h 127.0.0.1 -P 3306  # explicit host and port
mysql -u root -p college               # log in and select the college database

mysql> SELECT VERSION();
mysql> SHOW DATABASES;
mysql> USE college;
mysql> SHOW TABLES;
mysql> STATUS;      -- connection info, version, uptime
mysql> \\c           -- cancel the statement you are typing
mysql> EXIT;        -- or QUIT or \\q`,
      points: [
        "Use \\G instead of ; to show each row vertically: SELECT * FROM students\\G",
        "source C:/scripts/college.sql runs a whole .sql file from the client.",
        "The client is handy on servers that have no GUI and in interviews where you are asked to \"connect from the terminal\"."
      ]
    }
  ],
  examples: [
    {
      title: "Verify a fresh installation",
      scenario: "Installation finished. Confirm the server responds and list the system databases that MySQL creates automatically.",
      steps: [
        "Open MySQL Workbench and click the \"Local instance MySQL80\" tile (enter the root password if asked)",
        "A new SQL tab \"Query 1\" opens automatically",
        "Type the statements below",
        "Click the lightning bolt (Execute) or press Ctrl+Shift+Enter",
        "Each SELECT/SHOW opens its own Result tab (Result 1, Result 2...) below the editor"
      ],
      code: `SELECT VERSION() AS mysql_version, USER() AS logged_in_as;
SHOW DATABASES;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
SELECT VERSION() AS mysql_version, USER() AS logged_in_as;
SHOW DATABASES;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> SELECT VERSION() AS mysql_version, USER() AS logged_in_as
+------------------------------+----------------+
| mysql_version                | logged_in_as   |
+------------------------------+----------------+
| 8.0.36 (simulated on SQLite) | root@localhost |
+------------------------------+----------------+
1 row(s) returned
>> SHOW DATABASES
+----------+
| Database |
+----------+
| college  |
+----------+
1 row(s) returned`,
      explanation: "On a real fresh server SHOW DATABASES lists the system schemas information_schema, mysql, performance_schema and sys (plus sakila and world if you installed the samples). Never delete these. The lab only shows the databases you create, so it lists college. USER() confirms you are logged in as root@localhost."
    },
    {
      title: "Create your first practice database after installing",
      scenario: "Create a database for this course, make it the default, and check that it is empty.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab (Ctrl+T)",
        "Type the statements and press Ctrl+Shift+Enter",
        "In the Navigator, SCHEMAS tab, click the refresh icon (two circular arrows): college appears",
        "Right-click college > \"Set as Default Schema\" - its name turns bold"
      ],
      code: `CREATE DATABASE IF NOT EXISTS college;
USE college;
SELECT DATABASE() AS selected_database;
SHOW TABLES;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
SELECT DATABASE() AS selected_database;
SHOW TABLES;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> SELECT DATABASE() AS selected_database
+-------------------+
| selected_database |
+-------------------+
| college           |
+-------------------+
1 row(s) returned
>> SHOW TABLES
+-------------------+
| Tables_in_college |
+-------------------+
+-------------------+
0 row(s) returned`,
      explanation: "CREATE DATABASE creates an empty schema (in MySQL, DATABASE and SCHEMA mean the same thing). USE college is the SQL version of \"Set as Default Schema\". SHOW TABLES returns an empty grid because nothing has been created yet (in a fresh lab session; if you ran other examples you may see their tables)."
    },
    {
      title: "Same work from the MySQL Command Line Client",
      scenario: "Your lab PC has no GUI. Log in from the terminal, create a test table and read it back.",
      steps: [
        "Windows: Start > MySQL > MySQL 8.0 Command Line Client, type the root password. (Or open Command Prompt and run: mysql -u root -p)",
        "Linux/macOS: open Terminal and run: mysql -u root -p",
        "At the mysql> prompt type each statement and press Enter",
        "Type EXIT; to leave"
      ],
      code: `-- terminal
mysql -u root -p
Enter password: ********

mysql> USE college;
Database changed
mysql> CREATE TABLE install_check (id INT PRIMARY KEY, note VARCHAR(50));
mysql> INSERT INTO install_check VALUES (1, 'MySQL installed successfully');
mysql> SELECT * FROM install_check;
mysql> DROP TABLE install_check;
mysql> EXIT;
Bye`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS install_check;
CREATE TABLE install_check (id INT PRIMARY KEY, note VARCHAR(50));
INSERT INTO install_check VALUES (1, 'MySQL installed successfully');
SELECT * FROM install_check;
DROP TABLE install_check;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS install_check -> 0 row(s) affected
>> CREATE TABLE install_check (id INT PRIMARY KEY, note VARCHAR(50)) -> 0 row(s) affected
>> INSERT INTO install_check VALUES (1, 'MySQL installed successfully') -> 1 row(s) affected
>> SELECT * FROM install_check
+----+------------------------------+
| id | note                         |
+----+------------------------------+
| 1  | MySQL installed successfully |
+----+------------------------------+
1 row(s) returned
>> DROP TABLE install_check -> 0 row(s) affected`,
      explanation: "The command line client prints the same table borders and \"Query OK, 1 row affected\" messages that Workbench shows in its Output panel. Every statement must end with a semicolon; if you forget it the prompt changes to -> and waits for more input. Type ; and press Enter to finish it."
    },
    {
      title: "Troubleshooting checklist (no SQL)",
      scenario: "Workbench shows \"Cannot Connect to Database Server\" or \"Access denied\". Work through the fixes in order.",
      steps: [
        "Windows: Win+R > services.msc > find MySQL80 > Status must be Running; if not, right-click > Start",
        "Linux: sudo systemctl start mysql, then sudo systemctl status mysql",
        "In Workbench: right-click the connection tile > Edit Connection... > check Hostname 127.0.0.1, Port 3306, Username root",
        "Click \"Store in Vault...\" > Clear, then store the correct password again",
        "Click Test Connection until it says \"Successfully made the MySQL connection\""
      ],
      code: `Error 2003 (HY000): Can't connect to MySQL server on '127.0.0.1:3306' (10061)
  -> The MySQL service is stopped or uses another port. Start MySQL80 / check port.

Error 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
  -> Wrong password. Re-enter it, or reset it with the MySQL Installer > Reconfigure.

Error: Authentication plugin 'caching_sha2_password' cannot be loaded
  -> Very old client. Update Workbench / connector, or in Edit Connection > Advanced
     add: default-auth=mysql_native_password  (only for old tools).

Ubuntu: Access denied for root even with the right password
  -> root uses auth_socket. Run: sudo mysql, then
     ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'NewPass@123';`,
      result: "No query output: these are the four most common installation errors and their fixes. After fixing, \"Test Connection\" shows: Successfully made the MySQL connection. Information related to this connection: Host: 127.0.0.1 Port: 3306 User: root SSL: enabled with TLS_AES_128_GCM_SHA256. A successful MySQL connection was made with the parameters defined for this connection.",
      explanation: "Almost every connection problem is one of these: service stopped (2003), wrong password (1045), authentication plugin mismatch, or auth_socket on Ubuntu. Learn to read the error code first - it tells you which fix to apply."
    }
  ],
  interview: [
    {
      q: "What is the difference between MySQL Server and MySQL Workbench?",
      a: "MySQL Server (mysqld) is the database engine that stores data and executes SQL. MySQL Workbench is a client GUI tool used to connect to a server, write SQL, model databases and perform administration. Workbench without a server cannot store anything.",
      level: "Easy"
    },
    {
      q: "What port does MySQL use and how can you change it?",
      a: "Default TCP port 3306 (X Protocol 33060). Change the port setting in my.ini (Windows) or mysqld.cnf/my.cnf (Linux) under [mysqld], e.g. port=3307, and restart the service. Clients must then specify -P 3307.",
      level: "Easy"
    },
    {
      q: "How do you log in to MySQL from the command line?",
      a: "mysql -u root -p (prompts for password). Add -h host -P port for a remote server and a database name at the end to select it, e.g. mysql -u root -p -h 127.0.0.1 -P 3306 college.",
      level: "Easy"
    },
    {
      q: "What is caching_sha2_password?",
      a: "The default authentication plugin since MySQL 8.0. It uses SHA-256 hashing with server-side caching and is more secure than the older mysql_native_password. Very old clients that do not support it give the \"authentication plugin cannot be loaded\" error.",
      level: "Medium"
    },
    {
      q: "You get Error 2003 when connecting. What do you check?",
      a: "That the MySQL service is running (services.msc / systemctl status mysql), the host and port are correct, the firewall allows 3306, and for remote servers that bind-address allows external connections.",
      level: "Medium"
    },
    {
      q: "What does mysql_secure_installation do?",
      a: "It is a script that sets/validates the root password policy, removes anonymous users, disallows remote root login, removes the test database and reloads privilege tables.",
      level: "Medium"
    },
    {
      q: "Which system databases are created by default?",
      a: "information_schema (metadata views), mysql (users, privileges, system tables), performance_schema (performance instrumentation) and sys (friendly views over performance_schema).",
      level: "Medium"
    },
    {
      q: "Where is the MySQL configuration file located?",
      a: "Windows: C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini. Linux: /etc/mysql/my.cnf or /etc/mysql/mysql.conf.d/mysqld.cnf (Ubuntu), /etc/my.cnf (RHEL). macOS (Homebrew): /opt/homebrew/etc/my.cnf.",
      level: "Medium"
    },
    {
      q: "How do you check whether MySQL is running on Linux?",
      a: "sudo systemctl status mysql (or mysqld), or check the port with sudo ss -tlnp | grep 3306, or run mysqladmin -u root -p status.",
      level: "Easy"
    },
    {
      q: "What is the difference between localhost and 127.0.0.1 when connecting?",
      a: "On Linux/macOS, localhost makes the client use a Unix socket file, while 127.0.0.1 forces TCP/IP. On Windows both use TCP (or named pipes if enabled). If the socket path is wrong, 127.0.0.1 often works when localhost fails.",
      level: "Hard"
    }
  ],
  practice: [
    {
      task: "After installation, write the statements to display the server version and the current user with headings version_no and who.",
      hint: "VERSION() and USER() with AS.",
      solution: "SELECT VERSION() AS version_no, USER() AS who;"
    },
    {
      task: "Create a second database called practice_db, list all databases, then drop practice_db safely.",
      hint: "CREATE DATABASE IF NOT EXISTS, SHOW DATABASES, DROP DATABASE IF EXISTS.",
      solution: `CREATE DATABASE IF NOT EXISTS practice_db;
SHOW DATABASES;
DROP DATABASE IF EXISTS practice_db;`
    },
    {
      task: "Write the terminal command to log in as root to a server running on port 3307 on host 192.168.1.20 and select the database college directly.",
      hint: "Flags: -u, -p, -h, -P (capital P for port).",
      solution: "mysql -u root -p -h 192.168.1.20 -P 3307 college"
    },
    {
      task: "Create a new Workbench connection named \"College Dev\" that opens with the college schema selected by default. List the exact fields you fill in.",
      hint: "Home screen + icon > Setup New Connection.",
      solution: `Home screen > MySQL Connections (+)
Connection Name: College Dev
Connection Method: Standard (TCP/IP)
Hostname: 127.0.0.1   Port: 3306   Username: root
Password: Store in Vault... > type root password > OK
Default Schema: college
Test Connection > OK > OK`
    }
  ],
  quiz: [
    {
      question: "Which program actually stores the data and executes SQL?",
      options: [
        "MySQL Workbench",
        "MySQL Server (mysqld)",
        "MySQL Installer",
        "Command Prompt"
      ],
      answer: 1,
      explanation: "mysqld is the server. Workbench and the command line are clients."
    },
    {
      question: "In the MySQL Installer, where do you type the root password?",
      options: [
        "Type and Networking",
        "Windows Service",
        "Accounts and Roles",
        "Select Products"
      ],
      answer: 2,
      explanation: "The Accounts and Roles page asks for the MySQL Root Password and lets you add extra users."
    },
    {
      question: "Which command logs in as root and asks for the password?",
      options: [
        "mysql -r root -pass",
        "mysql -u root -p",
        "mysqld root",
        "login mysql root"
      ],
      answer: 1,
      explanation: "-u gives the user and -p asks for the password."
    },
    {
      question: "Error 1045 \"Access denied for user root@localhost\" usually means:",
      options: [
        "The service is stopped",
        "The port is blocked",
        "The table is missing",
        "The password (or authentication method) is wrong"
      ],
      answer: 3,
      explanation: "1045 is an authentication failure. A stopped service gives 2003."
    },
    {
      question: "In the \"Setup New Connection\" dialog, which button confirms the details work before saving?",
      options: [
        "Test Connection",
        "Configure Server Management",
        "Apply",
        "Execute"
      ],
      answer: 0,
      explanation: "Test Connection tries to log in and shows \"Successfully made the MySQL connection\"."
    }
  ]
};
