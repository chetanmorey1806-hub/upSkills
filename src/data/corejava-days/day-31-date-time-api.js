export default {
  id: 'day-31-date-time-api',
  title: 'Date and Time API (java.time: LocalDate, LocalDateTime, Period, Duration, DateTimeFormatter)',
  module: 'Module 5: Core APIs & Generics',
  day: 31,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn the modern java.time API introduced in Java 8 to create, compare, calculate and format dates and times safely. You will replace the old, buggy Date/Calendar classes with immutable, thread-safe classes like LocalDate, LocalDateTime, Period and Duration.',
  objectives: [
    'Explain why java.time replaced java.util.Date and Calendar',
    'Create and manipulate LocalDate, LocalTime and LocalDateTime objects',
    'Calculate differences using Period, Duration and ChronoUnit',
    'Format and parse dates using DateTimeFormatter with custom patterns',
    'Handle invalid dates with DateTimeParseException',
  ],
  theory: [
    {
      heading: 'Why a New Date and Time API?',
      content: 'Before Java 8, programmers used java.util.Date and java.util.Calendar. These classes were confusing and error-prone: months started at 0 (January = 0), Date objects were mutable (anyone could change them), and SimpleDateFormat was not thread-safe. Java 8 introduced the java.time package (based on the popular Joda-Time library). Think of the old API as an old wall calendar where anyone can scribble over dates, and java.time as a printed, laminated calendar: you cannot change it, you can only make a new copy with the change.',
      points: [
        'All java.time classes are IMMUTABLE: methods like plusDays() return a NEW object',
        'All java.time classes are THREAD-SAFE because they are immutable',
        'Months are 1-12 (January = 1), as humans expect',
        'Clear separation: date only, time only, date+time, time zone, durations',
        'Package: java.time (core), java.time.format (formatting), java.time.temporal (ChronoUnit)',
      ],
      tip: 'Common mistake: writing d.plusDays(5); and expecting d to change. It does NOT. Always write d = d.plusDays(5);',
    },
    {
      heading: 'LocalDate, LocalTime and LocalDateTime',
      content: 'LocalDate stores only a date (year-month-day) like a birthday. LocalTime stores only a time (hour:minute:second) like an alarm. LocalDateTime stores both, like a train departure "2024-03-10 at 09:30". The word "Local" means there is no time zone information. Create them with now() (current) or of() (specific value). Diagram in words: LocalDateTime = LocalDate + LocalTime.',
      syntax: `LocalDate today = LocalDate.now();                 // current date (changes every day)
LocalDate d = LocalDate.of(2024, 1, 31);            // 2024-01-31
LocalTime t = LocalTime.of(9, 30);                  // 09:30
LocalDateTime dt = LocalDateTime.of(2024, 3, 10, 9, 30); // 2024-03-10T09:30
LocalDate next = d.plusDays(1).plusMonths(2);       // chaining, returns new objects
d.getDayOfWeek(); d.getMonth(); d.getYear(); d.isLeapYear();
d.isBefore(other); d.isAfter(other); d.isEqual(other);`,
      points: [
        'plusDays/plusWeeks/plusMonths/plusYears and minusXxx return new objects',
        'withDayOfMonth(1), withYear(2025) create a copy with one field changed',
        'plusMonths is smart: 2024-01-31 plus 1 month = 2024-02-29 (last valid day)',
        'toString() prints ISO format: 2024-03-10 and 2024-03-10T09:30',
      ],
    },
    {
      heading: 'Period, Duration and ChronoUnit',
      content: 'Period measures date-based amounts (years, months, days) — like a person\'s age "23 years 9 months 24 days". Duration measures time-based amounts (hours, minutes, seconds, nanos) — like a working shift "8 hours 15 minutes". ChronoUnit gives a single total number in any unit, like "total days between two dates".',
      syntax: `Period p = Period.between(birthDate, today);   // P23Y9M24D
p.getYears(); p.getMonths(); p.getDays();
Duration d = Duration.between(startTime, endTime); // PT8H15M30S
d.toHours(); d.toMinutes(); d.getSeconds();
long days = ChronoUnit.DAYS.between(d1, d2);       // total days`,
      points: [
        'Period works with LocalDate; Duration works with LocalTime/LocalDateTime/Instant',
        'Period.toString() looks like P1Y2M3D; Duration.toString() looks like PT8H15M30S',
        'Period.getDays() is only the "days" part, NOT total days — use ChronoUnit.DAYS for total',
      ],
      tip: 'Interview trap: Period.between(Jan 1, Mar 1).getDays() returns 0 (it is P2M). Total days needs ChronoUnit.DAYS.between().',
    },
    {
      heading: 'DateTimeFormatter: Formatting and Parsing',
      content: 'Formatting converts a date object into a String for display (like printing a date on a bill). Parsing converts a String typed by a user into a date object. DateTimeFormatter is immutable and thread-safe, so you can store it in a static final constant.',
      syntax: `DateTimeFormatter f = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
String text = dateTime.format(f);                  // 10-03-2024 09:30
LocalDate d = LocalDate.parse("25/12/2024", DateTimeFormatter.ofPattern("dd/MM/yyyy"));
LocalDate iso = LocalDate.parse("2024-12-25");     // ISO format needs no formatter`,
      points: [
        'dd = day, MM = month number, MMM = short month name (Dec), MMMM = full name (December)',
        'yyyy = year, HH = hour 0-23, hh = hour 1-12, mm = MINUTES, ss = seconds, a = AM/PM',
        'Common mistake: using mm (minutes) when you mean MM (month)',
        'Month names depend on Locale: use ofPattern("dd MMM yyyy", Locale.ENGLISH) for fixed output',
        'Invalid text throws DateTimeParseException (an unchecked exception)',
      ],
    },
    {
      heading: 'Time Zones and Instant (Overview)',
      content: 'ZonedDateTime is a LocalDateTime plus a ZoneId (like "Asia/Kolkata"). Instant is a point on the global timeline in UTC, like a machine timestamp. Use LocalDate/LocalDateTime for business rules (birthdays, due dates), ZonedDateTime when users are in different countries, and Instant for logs and database timestamps.',
      syntax: `ZonedDateTime india = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
ZonedDateTime ny = india.withZoneSameInstant(ZoneId.of("America/New_York"));
Instant stamp = Instant.now();   // e.g. 2024-03-10T04:00:00Z`,
      points: [
        'Old to new conversion: date.toInstant(), LocalDate.ofInstant(instant, zone)',
        'java.sql.Date.valueOf(localDate) converts for JDBC; JDBC 4.2 supports LocalDate directly',
      ],
    },
  ],
  examples: [
    {
      title: 'Working with LocalDate',
      scenario: 'A library system needs to know the weekday of a due date, whether the year is a leap year, and the date one month later.',
      steps: ['In IntelliJ: File > New > Java Class > Main (in Eclipse: File > New > Class, tick "public static void main")', 'Type the code below', 'Click Run ▶ (Eclipse: Run As > Java Application)'],
      code: `import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2024, 1, 31);
        System.out.println("Date: " + d);
        System.out.println("Plus 1 month: " + d.plusMonths(1));
        System.out.println("Day of week: " + d.getDayOfWeek());
        System.out.println("Month: " + d.getMonth() + " (" + d.getMonthValue() + ")");
        System.out.println("Leap year: " + d.isLeapYear());
        System.out.println("Day of year: " + d.getDayOfYear());
        LocalDate next = d.plusDays(1);
        d.plusDays(10); // result ignored - d does NOT change
        System.out.println("Next day: " + next);
        System.out.println("Original still: " + d);
        System.out.println("next is after d: " + next.isAfter(d));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2024, 1, 31);
        System.out.println("Date: " + d);
        System.out.println("Plus 1 month: " + d.plusMonths(1));
        System.out.println("Day of week: " + d.getDayOfWeek());
        System.out.println("Month: " + d.getMonth() + " (" + d.getMonthValue() + ")");
        System.out.println("Leap year: " + d.isLeapYear());
        System.out.println("Day of year: " + d.getDayOfYear());
        LocalDate next = d.plusDays(1);
        d.plusDays(10); // result ignored - d does NOT change
        System.out.println("Next day: " + next);
        System.out.println("Original still: " + d);
        System.out.println("next is after d: " + next.isAfter(d));
    }
}`,
        },
      },
      result: `Date: 2024-01-31
Plus 1 month: 2024-02-29
Day of week: WEDNESDAY
Month: JANUARY (1)
Leap year: true
Day of year: 31
Next day: 2024-02-01
Original still: 2024-01-31
next is after d: true`,
      explanation: 'LocalDate.of() creates a fixed date. plusMonths(1) on Jan 31 cannot give Feb 31, so Java picks the last valid day (Feb 29 in leap year 2024). d.plusDays(10) returns a new object that we ignore, proving immutability: d is still 2024-01-31.',
    },
    {
      title: 'Age Calculator with Period and ChronoUnit',
      scenario: 'An HR app calculates an employee\'s exact age and counts total days between two dates.',
      steps: ['Create class Main', 'Import java.time.* and java.time.temporal.ChronoUnit', 'Run and compare Period vs ChronoUnit output'],
      code: `import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate birth = LocalDate.of(2000, 5, 15);
        LocalDate today = LocalDate.of(2024, 3, 10);
        Period age = Period.between(birth, today);
        System.out.println("Period: " + age);
        System.out.println("Age: " + age.getYears() + " years, " + age.getMonths() + " months, " + age.getDays() + " days");

        LocalDate jan1 = LocalDate.of(2024, 1, 1);
        LocalDate mar1 = LocalDate.of(2024, 3, 1);
        System.out.println("Period days part: " + Period.between(jan1, mar1).getDays());
        System.out.println("Total days: " + ChronoUnit.DAYS.between(jan1, mar1));
        System.out.println("Total weeks: " + ChronoUnit.WEEKS.between(jan1, mar1));
        System.out.println("Custom period: " + Period.of(1, 2, 3));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate birth = LocalDate.of(2000, 5, 15);
        LocalDate today = LocalDate.of(2024, 3, 10);
        Period age = Period.between(birth, today);
        System.out.println("Period: " + age);
        System.out.println("Age: " + age.getYears() + " years, " + age.getMonths() + " months, " + age.getDays() + " days");

        LocalDate jan1 = LocalDate.of(2024, 1, 1);
        LocalDate mar1 = LocalDate.of(2024, 3, 1);
        System.out.println("Period days part: " + Period.between(jan1, mar1).getDays());
        System.out.println("Total days: " + ChronoUnit.DAYS.between(jan1, mar1));
        System.out.println("Total weeks: " + ChronoUnit.WEEKS.between(jan1, mar1));
        System.out.println("Custom period: " + Period.of(1, 2, 3));
    }
}`,
        },
      },
      result: `Period: P23Y9M24D
Age: 23 years, 9 months, 24 days
Period days part: 0
Total days: 60
Total weeks: 8
Custom period: P1Y2M3D`,
      explanation: 'Period splits the gap into years, months and days. From Jan 1 to Mar 1 the Period is exactly P2M, so getDays() is 0, while ChronoUnit.DAYS gives the real total (31 + 29 = 60). We use a fixed "today" so the output never changes; in real code use LocalDate.now().',
    },
    {
      title: 'Shift Hours with LocalDateTime, Duration and Formatter',
      scenario: 'An attendance system records check-in and check-out times and prints worked hours in a friendly format.',
      steps: ['Create class Main', 'Create two LocalDateTime objects', 'Use Duration.between and DateTimeFormatter', 'Run ▶'],
      code: `import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDateTime in = LocalDateTime.of(2024, 3, 10, 9, 30);
        LocalDateTime out = LocalDateTime.of(2024, 3, 10, 17, 45, 30);
        Duration worked = Duration.between(in, out);
        System.out.println("Check-in: " + in);
        System.out.println("Worked: " + worked);
        System.out.println("Hours: " + worked.toHours());
        System.out.println("Minutes: " + worked.toMinutes());
        System.out.println("Hours and minutes: " + worked.toHours() + "h " + worked.toMinutesPart() + "m");

        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        System.out.println("Formatted in: " + in.format(f));
        DateTimeFormatter f12 = DateTimeFormatter.ofPattern("hh:mm:ss");
        System.out.println("12-hour out: " + out.format(f12));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDateTime in = LocalDateTime.of(2024, 3, 10, 9, 30);
        LocalDateTime out = LocalDateTime.of(2024, 3, 10, 17, 45, 30);
        Duration worked = Duration.between(in, out);
        System.out.println("Check-in: " + in);
        System.out.println("Worked: " + worked);
        System.out.println("Hours: " + worked.toHours());
        System.out.println("Minutes: " + worked.toMinutes());
        System.out.println("Hours and minutes: " + worked.toHours() + "h " + worked.toMinutesPart() + "m");

        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        System.out.println("Formatted in: " + in.format(f));
        DateTimeFormatter f12 = DateTimeFormatter.ofPattern("hh:mm:ss");
        System.out.println("12-hour out: " + out.format(f12));
    }
}`,
        },
      },
      result: `Check-in: 2024-03-10T09:30
Worked: PT8H15M30S
Hours: 8
Minutes: 495
Hours and minutes: 8h 15m
Formatted in: 10-03-2024 09:30
12-hour out: 05:45:30`,
      explanation: 'Duration.between gives 8 hours 15 minutes 30 seconds (PT8H15M30S). toMinutes() is the total (495), while toMinutesPart() (Java 9+) is only the leftover minutes (15). Note LocalDateTime.toString() hides seconds when they are zero.',
    },
    {
      title: 'Parsing User Input Safely',
      scenario: 'A form accepts dates as dd/MM/yyyy text. The program must convert valid text to LocalDate and reject invalid text without crashing.',
      steps: ['Create class Main', 'Use LocalDate.parse with a formatter', 'Wrap parsing in try-catch for DateTimeParseException', 'Run ▶'],
      code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class Main {
    static final DateTimeFormatter IN = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    static final DateTimeFormatter OUT = DateTimeFormatter.ofPattern("dd MMM yyyy, EEEE", Locale.ENGLISH);

    public static void main(String[] args) {
        String[] inputs = {"25/12/2024", "2024-12-25", "15/08/1947"};
        for (String s : inputs) {
            try {
                LocalDate d = LocalDate.parse(s, IN);
                System.out.println(s + " -> " + d.format(OUT));
            } catch (DateTimeParseException e) {
                System.out.println(s + " -> Invalid format, use dd/MM/yyyy");
            }
        }
        LocalDate iso = LocalDate.parse("2024-02-29");
        System.out.println("ISO parse: " + iso);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class Main {
    static final DateTimeFormatter IN = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    static final DateTimeFormatter OUT = DateTimeFormatter.ofPattern("dd MMM yyyy, EEEE", Locale.ENGLISH);

    public static void main(String[] args) {
        String[] inputs = {"25/12/2024", "2024-12-25", "15/08/1947"};
        for (String s : inputs) {
            try {
                LocalDate d = LocalDate.parse(s, IN);
                System.out.println(s + " -> " + d.format(OUT));
            } catch (DateTimeParseException e) {
                System.out.println(s + " -> Invalid format, use dd/MM/yyyy");
            }
        }
        LocalDate iso = LocalDate.parse("2024-02-29");
        System.out.println("ISO parse: " + iso);
    }
}`,
        },
      },
      result: `25/12/2024 -> 25 Dec 2024, Wednesday
2024-12-25 -> Invalid format, use dd/MM/yyyy
15/08/1947 -> 15 Aug 1947, Friday
ISO parse: 2024-02-29`,
      explanation: 'The formatter is declared static final because it is immutable and thread-safe. Text that does not match the pattern throws DateTimeParseException, which we catch and report. EEEE prints the full weekday name; Locale.ENGLISH keeps the output the same on every computer.',
    },
  ],
  interview: [
    { q: 'Why was the java.time API introduced in Java 8?', a: 'java.util.Date and Calendar were mutable, not thread-safe, had zero-based months and a confusing design. java.time (JSR-310) provides immutable, thread-safe, clearly separated classes such as LocalDate, LocalTime, LocalDateTime, ZonedDateTime, Instant, Period and Duration.', level: 'Easy' },
    { q: 'What is the difference between LocalDate, LocalTime and LocalDateTime?', a: 'LocalDate holds only a date (2024-03-10), LocalTime only a time (09:30), LocalDateTime both (2024-03-10T09:30). None of them store a time zone.', level: 'Easy' },
    { q: 'Period vs Duration?', a: 'Period is a date-based amount in years, months and days (used with LocalDate). Duration is a time-based amount in seconds and nanoseconds (used with LocalTime, LocalDateTime, Instant).', level: 'Easy' },
    { q: 'What is the output? LocalDate d = LocalDate.of(2024,1,1); d.plusDays(5); System.out.println(d);', a: '2024-01-01. LocalDate is immutable; plusDays returns a new object which is discarded. Correct code: d = d.plusDays(5);', level: 'Easy' },
    { q: 'What is the output? System.out.println(LocalDate.of(2023,1,31).plusMonths(1));', a: '2023-02-28. February 2023 has 28 days, so Java adjusts to the last valid day of the month.', level: 'Medium' },
    { q: 'Is DateTimeFormatter thread-safe? What about SimpleDateFormat?', a: 'DateTimeFormatter is immutable and thread-safe, so it can be a shared static final constant. SimpleDateFormat is NOT thread-safe; sharing it between threads can produce wrong results.', level: 'Medium' },
    { q: 'How do you find the total number of days between two dates?', a: 'Use ChronoUnit.DAYS.between(start, end) or start.until(end, ChronoUnit.DAYS). Period.getDays() returns only the days component, not the total.', level: 'Medium' },
    { q: 'What is the difference between MM and mm in a date pattern?', a: 'MM is month-of-year, mm is minute-of-hour. Using "dd-mm-yyyy" by mistake prints minutes instead of the month.', level: 'Easy' },
    { q: 'What exception is thrown for invalid date text and is it checked?', a: 'java.time.format.DateTimeParseException, which extends DateTimeException (a RuntimeException), so it is unchecked. LocalDate.of(2023, 2, 30) throws DateTimeException.', level: 'Medium' },
    { q: 'When would you use Instant vs ZonedDateTime vs LocalDateTime?', a: 'Instant: a machine timestamp in UTC (logs, DB audit columns). ZonedDateTime: a date-time in a specific zone (scheduling meetings across countries). LocalDateTime: a date-time without zone (local business events like a shop opening time).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a program that reads a birth date in dd-MM-yyyy format and prints the age in years, months and days as of 2025-01-01.',
      hint: 'Use DateTimeFormatter.ofPattern("dd-MM-yyyy") and Period.between().',
      solution: `import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter birth date (dd-MM-yyyy): ");
        LocalDate birth = LocalDate.parse(sc.nextLine().trim(), DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        Period p = Period.between(birth, LocalDate.of(2025, 1, 1));
        System.out.println("Age: " + p.getYears() + "y " + p.getMonths() + "m " + p.getDays() + "d");
    }
}`,
    },
    {
      task: 'Print all the dates of Sundays in March 2024.',
      hint: 'Start from 2024-03-01, loop while month is MARCH, check getDayOfWeek() == DayOfWeek.SUNDAY.',
      solution: `import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2024, 3, 1);
        while (d.getMonth() == Month.MARCH) {
            if (d.getDayOfWeek() == DayOfWeek.SUNDAY) System.out.println(d);
            d = d.plusDays(1);
        }
    }
}`,
    },
    {
      task: 'A library book is issued on a given date and must be returned within 14 days. Fine is Rs.5 per late day. Given issue date 2024-03-01 and return date 2024-03-20, print the due date and fine.',
      hint: 'dueDate = issue.plusDays(14); lateDays = ChronoUnit.DAYS.between(dueDate, returnDate).',
      solution: `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate issue = LocalDate.of(2024, 3, 1);
        LocalDate returned = LocalDate.of(2024, 3, 20);
        LocalDate due = issue.plusDays(14);
        long late = Math.max(0, ChronoUnit.DAYS.between(due, returned));
        System.out.println("Due date: " + due);   // 2024-03-15
        System.out.println("Fine: Rs." + late * 5); // Rs.25
    }
}`,
    },
    {
      task: 'Given a meeting start time 10:45 and a length of 135 minutes, print the end time and whether it ends after 13:00.',
      hint: 'LocalTime.of(10,45).plusMinutes(135); use isAfter(LocalTime.of(13,0)).',
      solution: `import java.time.LocalTime;

public class Main {
    public static void main(String[] args) {
        LocalTime start = LocalTime.of(10, 45);
        LocalTime end = start.plusMinutes(135);
        System.out.println("Ends at: " + end);                         // 13:00
        System.out.println("After 1 PM: " + end.isAfter(LocalTime.of(13, 0))); // false
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which package contains LocalDate?', options: ['java.util', 'java.time', 'java.sql', 'java.date'], answer: 1, explanation: 'LocalDate and the rest of the modern API live in java.time (added in Java 8).' },
    { question: 'What does LocalDate.of(2024, 1, 1).plusDays(1) do to the original object?', options: ['Changes it to 2024-01-02', 'Throws an exception', 'Nothing; it returns a new object', 'Sets it to null'], answer: 2, explanation: 'java.time classes are immutable; plusDays returns a new LocalDate.' },
    { question: 'Which class should measure "8 hours 30 minutes"?', options: ['Period', 'Duration', 'LocalTime', 'ChronoUnit'], answer: 1, explanation: 'Duration represents a time-based amount (hours, minutes, seconds).' },
    { question: 'In a pattern, which letters represent the month number?', options: ['mm', 'MMMM', 'DD', 'MM'], answer: 3, explanation: 'MM is month-of-year; mm is minutes; DD is day-of-year.' },
    { question: 'What does Period.between(LocalDate.of(2024,1,1), LocalDate.of(2024,3,1)).getDays() return?', options: ['0', '60', '2', '59'], answer: 0, explanation: 'The period is P2M (2 months, 0 days); getDays() returns only the days part, which is 0.' },
  ],
};
