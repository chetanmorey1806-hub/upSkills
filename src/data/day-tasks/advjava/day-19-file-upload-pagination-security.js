const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, course, marks) VALUES
('Asha Patil', 'Java', 88), ('Rohan Mehta', 'Python', 72), ('Sneha Kulkarni', 'Java', 65),
('Arjun Nair', 'MySQL', 91), ('Priya Sharma', 'Java', 79), ('Kiran Joshi', 'Python', 58),
('Meera Iyer', 'Java', 81), ('Vikram Rao', 'MySQL', 69);`;

export default {
  lesson: 'day-19-file-upload-pagination-security',
  minutes: 25,
  intro: 'Add file upload, LIMIT/OFFSET pagination, custom error pages and basic security to a Servlet/JSP app.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which annotation must the upload servlet have so that `request.getPart("photo")` works? (with @)',
      example: { title: 'reading the uploaded part', code: 'Part part = request.getPart("photo");\nString fileName = Paths.get(part.getSubmittedFileName()).getFileName().toString();\npart.write(uploadDir + File.separator + fileName);' },
      accept: ['@MultipartConfig', '@MultipartConfig()'],
      caseSensitive: true,
      explain: '`@MultipartConfig` (with optional `maxFileSize`, `maxRequestSize`, `fileSizeThreshold`) tells the container to parse `multipart/form-data`. The HTML form also needs `method="post"` and `enctype="multipart/form-data"`, otherwise only the file name is sent.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this pagination code print?',
      example: { title: 'page → offset', text: 'With 10 rows per page: page 1 → OFFSET 0, page 2 → OFFSET 10, page 3 → OFFSET 20.' },
      code: `int totalRecords = 23;
int pageSize = 5;
int page = 3;

int totalPages = (int) Math.ceil(totalRecords / (double) pageSize);
int offset = (page - 1) * pageSize;
int wrongPages = totalRecords / pageSize;

System.out.println("Total pages: " + totalPages);
System.out.println("Offset: " + offset);
System.out.println("Wrong pages: " + wrongPages);`,
      expected: 'Total pages: 5\nOffset: 10\nWrong pages: 4',
      explain: '23 / 5.0 = 4.6, rounded **up** = 5 pages (the last page has 3 rows). Integer division 23 / 5 gives 4 and loses those last 3 students, a common bug. Page 3 skips (3-1) × 5 = 10 rows.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'The student list shows **3 students per page**, ordered by `id`. Write the query for **page 2**.',
      example: { title: 'LIMIT with OFFSET', code: 'SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20; -- page 3 of 10' },
      setup: STUDENTS,
      starter: 'SELECT id, name, course FROM students\nORDER BY id\n-- LIMIT ... OFFSET ...\n',
      solution: 'SELECT id, name, course FROM students ORDER BY id LIMIT 3 OFFSET 3;',
      ordered: true,
      explain: 'Page 2 skips (2-1) × 3 = 3 rows and takes 3 → ids 4, 5, 6. Always use ORDER BY with pagination, otherwise the database may return rows in a different order on each page. `LIMIT 3, 3` (offset, count) is the MySQL short form.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match each attack to its defence. Which pairs are CORRECT? (choose all that apply)',
      options: [
        'SQL injection → PreparedStatement with ? placeholders',
        'XSS (script in a comment field) → escape output with <c:out> or fn:escapeXml',
        'CSRF → a secret token in each form, checked on POST',
        'Stolen password database → store BCrypt hashes, never plain text',
        'XSS → store passwords with MD5',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Each attack has its own fix. MD5 is broken for passwords and has nothing to do with XSS. Also: regenerate the session id after login (`request.changeSessionId()`), and check the user\'s role on the server for every protected action.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the custom 404 page mapping in web.xml (same tag name in both places):
\`\`\`
<error-page>
  <error-code>404</error-code>
  <____>/WEB-INF/errors/404.jsp</____>
</error-page>
\`\`\``,
      example: { title: 'an error page for an exception type', code: '<error-page>\n  <exception-type>java.sql.SQLException</exception-type>\n  <location>/WEB-INF/errors/db.jsp</location>\n</error-page>' },
      accept: ['location', '<location>'],
      explain: '`<error-page>` maps an `<error-code>` or `<exception-type>` to a `<location>`. Users then see a friendly page instead of Tomcat\'s stack trace, which would also leak internal details to attackers.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should you NOT save an upload using exactly the name the user sent, e.g. `part.write("/uploads/" + part.getSubmittedFileName())`?',
      options: [
        'Because file names cannot contain dots',
        'A name like ../../webapps/ROOT/shell.jsp could write outside the upload folder (path traversal), and two users can overwrite each other\'s files',
        'Because Part.write only accepts numbers',
        'It is always safe',
      ],
      answer: 1,
      explain: 'Never trust client input, including file names. Keep only the base name, check the extension/content type against an allow-list, limit the size, and preferably save under a generated name such as a UUID, outside the web root.',
    },
  ],
};
