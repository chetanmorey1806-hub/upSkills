export default {
  lesson: 'day-31-date-time-api',
  minutes: 22,
  intro: 'Create, calculate, compare and format dates with LocalDate, LocalTime, Period, ChronoUnit and DateTimeFormatter.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'LocalDate arithmetic: what does this program print?',
      example: {
        title: 'LocalDate prints as yyyy-MM-dd',
        code: `LocalDate d = LocalDate.of(2025, 8, 15);
System.out.println(d.plusDays(1)); // 2025-08-16`,
      },
      code: `import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2024, 1, 31);
        d.plusDays(10);
        System.out.println(d);
        System.out.println(d.plusMonths(1));
        System.out.println(d.plusDays(1));
        System.out.println(d.getDayOfWeek());
        System.out.println(d.isLeapYear());
    }
}`,
      expected: `2024-01-31
2024-02-29
2024-02-01
WEDNESDAY
true`,
      explain: 'java.time objects are **immutable**: `d.plusDays(10)` returns a new date that is thrown away, so d is unchanged. Adding one month to 31 January gives the **last valid day** of February: 2024 is a leap year, so 2024-02-29. getDayOfWeek returns an enum constant such as WEDNESDAY.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Differences and formatting: what does this program print?',
      example: {
        title: 'custom pattern',
        code: `DateTimeFormatter f = DateTimeFormatter.ofPattern("dd-MM-yyyy");
System.out.println(LocalDate.of(2025, 1, 9).format(f)); // 09-01-2025`,
      },
      code: `import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate birth = LocalDate.of(2001, 8, 20);
        LocalDate today = LocalDate.of(2024, 3, 10);
        Period p = Period.between(birth, today);
        System.out.println(p.getYears() + " years " + p.getMonths() + " months " + p.getDays() + " days");
        System.out.println(ChronoUnit.DAYS.between(LocalDate.of(2024, 3, 1), LocalDate.of(2024, 4, 1)));
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println(LocalDate.of(2024, 3, 5).format(f));
        System.out.println(LocalTime.of(9, 30).plusMinutes(45));
        System.out.println(Duration.ofMinutes(135).toHours());
    }
}`,
      expected: `22 years 6 months 19 days
31
05/03/2024
10:15
2`,
      explain: '**Period** measures years-months-days (age calculation): 22 years 6 months, and from 20 Feb to 10 Mar 2024 is 19 days (February 2024 has 29 days). **ChronoUnit.DAYS.between** counts total days (March has 31). In the pattern, `MM` is month and `mm` would be minutes — a classic bug. LocalTime prints as HH:mm, and `toHours()` truncates 2 h 15 min to 2.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a LocalDate for **Independence Day 2025** (15 August 2025):
\`LocalDate day = ____;\``,
      example: {
        title: 'today and parsing',
        code: `LocalDate now = LocalDate.now();
LocalDate d = LocalDate.parse("2025-01-26");`,
      },
      accept: ['LocalDate.of(2025, 8, 15)', 'LocalDate.of(2025, Month.AUGUST, 15)', 'LocalDate.parse("2025-08-15")'],
      acceptRegex: [
        '^LocalDate\\s*\\.\\s*of\\s*\\(\\s*2025\\s*,\\s*8\\s*,\\s*15\\s*\\)\\s*[;{]?$',
        '^LocalDate\\s*\\.\\s*of\\s*\\(\\s*2025\\s*,\\s*Month\\s*\\.\\s*AUGUST\\s*,\\s*15\\s*\\)\\s*[;{]?$',
        '^LocalDate\\s*\\.\\s*parse\\s*\\(\\s*"2025-08-15"\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`LocalDate.of(year, month, day)` uses months **1-12** (unlike the old Calendar with 0-11), and you can also pass `Month.AUGUST`. `parse` expects the ISO format yyyy-MM-dd by default.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the pattern String for `DateTimeFormatter.ofPattern(...)` that prints dates like **05-03-2024** (day-month-year with dashes).',
      example: { title: 'pattern letters', text: '`dd` day, `MM` month, `yyyy` year, `HH` hour (24h), `mm` minutes' },
      accept: ['"dd-MM-yyyy"', 'dd-MM-yyyy', '"dd-MM-uuuu"', 'dd-MM-uuuu'],
      acceptRegex: ['^"dd-MM-yyyy"\\s*[;{]?$', '^dd\\s*-\\s*MM\\s*-\\s*yyyy\\s*[;{]?$', '^"dd-MM-uuuu"\\s*[;{]?$', '^dd\\s*-\\s*MM\\s*-\\s*uuuu\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`dd-MM-yyyy`: capital **MM** is the month. Writing `dd-mm-yyyy` prints the minutes field and fails for a LocalDate (it has no time), which is one of the most common date bugs.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which class should you use to store an **exam start time with date** like 2025-03-10 10:30, without a time zone?',
      options: ['LocalDate', 'LocalTime', 'LocalDateTime', 'Period'],
      answer: 2,
      explain: '**LocalDateTime** = date + time. LocalDate has only the date, LocalTime only the time, and Period is an amount of time (years/months/days), not a point in time. Use ZonedDateTime or Instant when time zones matter.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why did Java 8 replace `java.util.Date` and `Calendar` with `java.time`? (choose all that apply)',
      options: [
        'Date and Calendar are mutable and not thread-safe',
        'Calendar months start at 0, which causes bugs',
        'java.time classes are immutable and thread-safe',
        'java.time cannot do date arithmetic',
        'SimpleDateFormat is not thread-safe',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The old API was mutable, not thread-safe (SimpleDateFormat especially) and confusing (January = 0). java.time is immutable, thread-safe and has clear arithmetic methods like plusDays, minusMonths and between.',
    },
  ],
};
