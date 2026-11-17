export default {
  id: 'day-19-file-upload-pagination-security',
  title: 'File Upload, Pagination, Error Pages and Security Basics',
  module: 'Module 3: JSP',
  day: 19,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Add real-world features to a Servlet/JSP application: uploading files with @MultipartConfig and Part, paginating database results with LIMIT/OFFSET, configuring custom error pages, and applying basic web security (XSS, SQL injection, CSRF, password hashing, session and access control).',
  objectives: [
    'Upload and download files using the Servlet 6 multipart API (Part, @MultipartConfig)',
    'Implement server-side pagination with LIMIT/OFFSET and JSTL page links',
    'Configure error pages for status codes and exception types in web.xml',
    'Prevent XSS, SQL injection and CSRF in Servlet/JSP apps',
    'Store passwords securely and protect pages with filters and session settings',
  ],
  theory: [
    {
      heading: 'File upload with Servlet multipart API',
      content:
        'Since Servlet 3.0 file upload is built in; no Apache Commons FileUpload needed. Steps:\n1. HTML form must use method="post" and enctype="multipart/form-data", with <input type="file" name="photo">.\n2. Annotate the Servlet with @MultipartConfig (or <multipart-config> in web.xml). It sets maxFileSize, maxRequestSize and fileSizeThreshold (size after which data is written to a temp file).\n3. In doPost call request.getPart("photo") (or getParts() for many files). Part gives getSubmittedFileName(), getSize(), getContentType(), getInputStream() and write(path).\n4. Normal text fields of the multipart form are still read with request.getParameter().\n\nAnalogy: a normal form is a postcard (only text). A multipart form is a parcel with several labelled boxes; each box (Part) can contain text or a file.',
      syntax: `@WebServlet("/upload")
@MultipartConfig(maxFileSize = 2 * 1024 * 1024, maxRequestSize = 5 * 1024 * 1024)
public class UploadServlet extends HttpServlet {
    protected void doPost(...) {
        Part part = request.getPart("photo");
        String name = Paths.get(part.getSubmittedFileName()).getFileName().toString();
        part.write(uploadDir + File.separator + name);
    }
}`,
      points: [
        'Without @MultipartConfig, getPart() throws IllegalStateException and getParameter() returns null.',
        'Exceeding maxFileSize causes IllegalStateException (wrapped) - catch it and show a message.',
        'Store uploads OUTSIDE the deployed webapp folder (it is wiped on redeploy), e.g. C:/uploads or /var/app/uploads, and serve them through a download Servlet.',
        'Never trust the submitted file name or content type: sanitise the name, check extension, generate a unique name (UUID).',
      ],
    },
    {
      heading: 'Pagination',
      content:
        'Showing 10,000 rows in one page is slow and unusable. Pagination shows a fixed number of rows per page (page size) with links to other pages.\n\nFormulas:\n- offset = (page - 1) * pageSize\n- totalPages = ceil(totalRows / pageSize) = (totalRows + pageSize - 1) / pageSize (integer division)\n\nSQL (MySQL): SELECT ... ORDER BY id LIMIT ? OFFSET ?   and   SELECT COUNT(*) FROM table.\n\nExample: 23 rows, pageSize 5 -> totalPages = (23 + 4) / 5 = 5. Page 3 -> offset 10 -> rows 11 to 15. Page 5 -> rows 21 to 23.\n\nAlways validate the page parameter: if missing, non-numeric, < 1 or > totalPages, correct it.',
      tip: 'Always use ORDER BY with LIMIT; without it the database may return rows in any order and pages can overlap.',
    },
    {
      heading: 'Error pages',
      content:
        'Instead of Tomcat\'s default stack-trace pages, configure friendly pages in web.xml. You can map by HTTP status code or by exception type. Inside an error page, these request attributes are available: jakarta.servlet.error.status_code, jakarta.servlet.error.message, jakarta.servlet.error.exception, jakarta.servlet.error.request_uri. In a JSP with isErrorPage="true" you also have the exception object.',
      syntax: `<error-page>
  <error-code>404</error-code>
  <location>/WEB-INF/errors/404.jsp</location>
</error-page>
<error-page>
  <error-code>500</error-code>
  <location>/WEB-INF/errors/500.jsp</location>
</error-page>
<error-page>
  <exception-type>java.lang.Throwable</exception-type>
  <location>/WEB-INF/errors/500.jsp</location>
</error-page>`,
      points: [
        'Most specific exception type wins; error-code pages handle response.sendError(404) and missing resources.',
        'Page-level errorPage directive (Day 15) overrides web.xml for that JSP.',
        'Never show stack traces to users in production; log them instead.',
      ],
    },
    {
      heading: 'Security basics: XSS and SQL injection',
      content:
        'XSS (Cross-Site Scripting): an attacker submits input like <script>steal(document.cookie)</script>; if your page prints it as-is, the script runs in other users\' browsers. Fix: escape output - <c:out value="${x}"/> or ${fn:escapeXml(x)}; mark cookies HttpOnly.\n\nSQL injection: building SQL with string concatenation, e.g. "WHERE name=\'" + name + "\'", lets input like \' OR \'1\'=\'1 change the query. Fix: always use PreparedStatement with ? placeholders. For ORDER BY column names (which cannot be parameters) use a whitelist.',
    },
    {
      heading: 'Security basics: CSRF, passwords, sessions and access control',
      content:
        'CSRF (Cross-Site Request Forgery): a malicious site makes the logged-in user\'s browser submit a form to your app (e.g. delete account) using their session cookie. Fix: a random CSRF token stored in session and added as a hidden field to every POST form; a filter rejects POSTs without the matching token. Also use POST (not GET links) for actions that change data, and SameSite cookies.\n\nPasswords: never store plain text. Store a salted slow hash (BCrypt, PBKDF2, Argon2). Java SE has PBKDF2WithHmacSHA256 built in.\n\nSessions: call request.changeSessionId() after login, invalidate() on logout, set a timeout, use HttpOnly and Secure cookies (web.xml <cookie-config>), and use HTTPS in production.\n\nAccess control: protect pages with an authentication filter (Day 13) or declarative <security-constraint> in web.xml; check roles on the server, never only hide buttons in the UI.',
      points: [
        'Validate all input on the server (length, type, format) even if JavaScript validates in the browser.',
        'Keep JSPs in WEB-INF so they cannot be called directly.',
        'Do not reveal whether the user name or the password was wrong; show one generic message.',
        'Limit upload size and type; never execute uploaded files.',
      ],
    },
  ],
  examples: [
    {
      title: 'Profile photo upload and download',
      scenario: 'Upload an image (JPG/PNG up to 2 MB) with a caption, save it with a unique name outside the webapp, list uploaded files, and serve them via a download Servlet.',
      steps: [
        'Use the Maven web project from Day 18 (or Eclipse Dynamic Web Project "upload-demo" with Tomcat 10.1). JSTL jars must be present.',
        'Create the upload folder, e.g. C:/app-uploads (Windows) or /home/<you>/app-uploads (Linux/Mac). Set it in web.xml as context-param uploadDir.',
        'Create WEB-INF/views/upload.jsp, com.demo.web.UploadServlet and com.demo.web.FileServlet.',
        'Run and open http://localhost:8080/<context>/upload. Choose a photo, type a caption, click Upload.',
        'Try a .txt file and a 5 MB image to see validation messages.',
      ],
      code: `<!-- WEB-INF/web.xml -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0">
  <context-param>
    <param-name>uploadDir</param-name>
    <param-value>C:/app-uploads</param-value>
  </context-param>
</web-app>

// com/demo/web/UploadServlet.java
package com.demo.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

@WebServlet("/upload")
@MultipartConfig(fileSizeThreshold = 512 * 1024,       // 512 KB in memory
                 maxFileSize = 2 * 1024 * 1024,        // 2 MB per file
                 maxRequestSize = 3 * 1024 * 1024)     // 3 MB whole request
public class UploadServlet extends HttpServlet {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png");
    private Path uploadDir;

    @Override
    public void init() throws ServletException {
        uploadDir = Paths.get(getServletContext().getInitParameter("uploadDir"));
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new ServletException("Cannot create upload folder", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try (Stream<Path> files = Files.list(uploadDir)) {
            List<String> names = files.map(p -> p.getFileName().toString()).sorted().toList();
            req.setAttribute("files", names);
        }
        req.getRequestDispatcher("/WEB-INF/views/upload.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String msg;
        try {
            Part part = req.getPart("photo");
            String caption = req.getParameter("caption");
            String original = Paths.get(part.getSubmittedFileName()).getFileName().toString();
            String ext = original.contains(".")
                    ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";

            if (part.getSize() == 0) {
                msg = "Please choose a file";
            } else if (!ALLOWED.contains(ext)) {
                msg = "Only JPG and PNG files are allowed";
            } else {
                String saved = UUID.randomUUID() + "." + ext;
                part.write(uploadDir.resolve(saved).toString());
                msg = "Uploaded " + original + " as " + saved + " (" + part.getSize() / 1024
                        + " KB) caption: " + caption;
            }
        } catch (IllegalStateException e) {        // size limits exceeded
            msg = "File too large (max 2 MB)";
        }
        req.getSession().setAttribute("flash", msg);
        resp.sendRedirect(req.getContextPath() + "/upload");
    }
}

// com/demo/web/FileServlet.java
package com.demo.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.file.*;

@WebServlet("/files/*")
public class FileServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Path dir = Paths.get(getServletContext().getInitParameter("uploadDir")).toAbsolutePath().normalize();
        String name = req.getPathInfo() == null ? "" : req.getPathInfo().substring(1);
        Path file = dir.resolve(name).normalize();
        if (name.isEmpty() || !file.startsWith(dir) || !Files.isRegularFile(file)) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);       // also blocks ../ tricks
            return;
        }
        String type = getServletContext().getMimeType(file.getFileName().toString());
        resp.setContentType(type != null ? type : "application/octet-stream");
        resp.setContentLengthLong(Files.size(file));
        if (req.getParameter("download") != null) {
            resp.setHeader("Content-Disposition", "attachment; filename=\\"" + file.getFileName() + "\\"");
        }
        Files.copy(file, resp.getOutputStream());
    }
}

<%-- WEB-INF/views/upload.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<h2>Upload Photo</h2>
<c:if test="\${not empty sessionScope.flash}">
  <p style="color:blue"><c:out value="\${sessionScope.flash}"/></p>
  <c:remove var="flash" scope="session"/>
</c:if>
<form action="\${pageContext.request.contextPath}/upload" method="post" enctype="multipart/form-data">
  Caption: <input name="caption"><br><br>
  Photo: <input type="file" name="photo" accept=".jpg,.jpeg,.png"><br><br>
  <button>Upload</button>
</form>
<h3>Uploaded files</h3>
<c:forEach items="\${files}" var="f">
  <div>
    <img src="\${pageContext.request.contextPath}/files/\${f}" height="60">
    <a href="\${pageContext.request.contextPath}/files/\${f}?download=1">\${f}</a>
  </div>
</c:forEach>
</body></html>`,
      result: 'Upload cat.png (150 KB), caption "My cat": blue message "Uploaded cat.png as 3f2a...e1.png (150 KB) caption: My cat" and the thumbnail appears in the list (UUID differs every time).\nUpload notes.txt: "Only JPG and PNG files are allowed".\nUpload a 5 MB image: "File too large (max 2 MB)".\nClicking the file name downloads it.',
      explanation: 'A flash message in session survives the redirect (PRG) and is removed after display. FileServlet normalises the path and checks it stays inside the upload folder to block path traversal such as /files/../../etc/passwd. Note: some Tomcat versions reject an oversized request before the Servlet code runs, so also set maxPostSize/maxSwallowSize on the Connector if needed.',
    },
    {
      title: 'Pagination of products with LIMIT / OFFSET',
      scenario: 'Show products 5 per page with Previous / page numbers / Next links. The DAO returns one page and the total count.',
      steps: [
        'Run the SQL to create the product table with 23 rows (the script uses a recursive CTE, MySQL 8+).',
        'Create com.demo.model.Product, com.demo.dao.ProductDao, com.demo.web.ProductController (/products) and WEB-INF/views/products.jsp. DBUtil is the same as Day 18 (database empdb).',
        'Run /products, /products?page=3, /products?page=99, /products?page=abc.',
      ],
      code: `-- MySQL (database empdb from Day 18)
CREATE TABLE product (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
INSERT INTO product (name, price)
WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 23)
SELECT CONCAT('Product ', n), n * 100 FROM seq;

// com/demo/model/Product.java
package com.demo.model;

import java.math.BigDecimal;

public class Product {
    private int id;
    private String name;
    private BigDecimal price;
    public Product(int id, String name, BigDecimal price) {
        this.id = id; this.name = name; this.price = price;
    }
    public int getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
}

// com/demo/dao/ProductDao.java
package com.demo.dao;

import com.demo.model.Product;
import com.demo.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductDao {
    public int count() throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM product");
             ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    public List<Product> findPage(int page, int size) throws SQLException {
        String sql = "SELECT id, name, price FROM product ORDER BY id LIMIT ? OFFSET ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, size);
            ps.setInt(2, (page - 1) * size);
            try (ResultSet rs = ps.executeQuery()) {
                List<Product> list = new ArrayList<>();
                while (rs.next()) {
                    list.add(new Product(rs.getInt(1), rs.getString(2), rs.getBigDecimal(3)));
                }
                return list;
            }
        }
    }
}

// com/demo/web/ProductController.java
package com.demo.web;

import com.demo.dao.ProductDao;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/products")
public class ProductController extends HttpServlet {
    private static final int PAGE_SIZE = 5;
    private final ProductDao dao = new ProductDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            int total = dao.count();
            int totalPages = Math.max(1, (total + PAGE_SIZE - 1) / PAGE_SIZE);
            int page;
            try {
                page = Integer.parseInt(req.getParameter("page"));
            } catch (NumberFormatException e) {
                page = 1;                           // missing or not a number
            }
            page = Math.max(1, Math.min(page, totalPages));

            req.setAttribute("products", dao.findPage(page, PAGE_SIZE));
            req.setAttribute("page", page);
            req.setAttribute("totalPages", totalPages);
            req.setAttribute("total", total);
            req.setAttribute("from", total == 0 ? 0 : (page - 1) * PAGE_SIZE + 1);
            req.setAttribute("to", Math.min(page * PAGE_SIZE, total));
            req.getRequestDispatcher("/WEB-INF/views/products.jsp").forward(req, resp);
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }
}

<%-- WEB-INF/views/products.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="base" value="\${pageContext.request.contextPath}/products"/>
<html><body>
<h2>Products</h2>
<p>Showing \${from} to \${to} of \${total}</p>
<table border="1" cellpadding="5">
  <tr><th>ID</th><th>Name</th><th>Price</th></tr>
  <c:forEach items="\${products}" var="p">
    <tr><td>\${p.id}</td><td><c:out value="\${p.name}"/></td><td>\${p.price}</td></tr>
  </c:forEach>
</table>
<p>
  <c:if test="\${page > 1}"><a href="\${base}?page=\${page - 1}">&laquo; Prev</a></c:if>
  <c:forEach begin="1" end="\${totalPages}" var="i">
    <c:choose>
      <c:when test="\${i == page}"><b>[\${i}]</b></c:when>
      <c:otherwise><a href="\${base}?page=\${i}">\${i}</a></c:otherwise>
    </c:choose>
  </c:forEach>
  <c:if test="\${page < totalPages}"><a href="\${base}?page=\${page + 1}">Next &raquo;</a></c:if>
</p>
</body></html>`,
      result: '/products -> "Showing 1 to 5 of 23", rows Product 1..Product 5 (100.00..500.00), links: [1] 2 3 4 5 Next »\n/products?page=3 -> "Showing 11 to 15 of 23", Product 11..15, links: « Prev 1 2 [3] 4 5 Next »\n/products?page=5 -> "Showing 21 to 23 of 23", 3 rows, no Next link\n/products?page=99 -> treated as page 5\n/products?page=abc -> treated as page 1',
      explanation: 'totalPages = (23 + 5 - 1) / 5 = 27 / 5 = 5 (integer division). Page 3 offset = (3-1)*5 = 10, so rows 11-15. Integer.parseInt(null) throws NumberFormatException, so a missing parameter also falls back to page 1.',
    },
    {
      title: 'Custom error pages for 404 and 500',
      scenario: 'Show branded pages for missing URLs and server errors, and log the exception.',
      steps: [
        'Add the error-page entries to WEB-INF/web.xml.',
        'Create WEB-INF/errors/404.jsp and WEB-INF/errors/500.jsp.',
        'Create a test Servlet /boom that throws an exception.',
        'Restart Tomcat. Open /no-such-page and /boom.',
      ],
      code: `<!-- WEB-INF/web.xml (inside <web-app>) -->
<error-page>
  <error-code>404</error-code>
  <location>/WEB-INF/errors/404.jsp</location>
</error-page>
<error-page>
  <error-code>500</error-code>
  <location>/WEB-INF/errors/500.jsp</location>
</error-page>
<error-page>
  <exception-type>java.lang.Throwable</exception-type>
  <location>/WEB-INF/errors/500.jsp</location>
</error-page>

<%-- WEB-INF/errors/404.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body style="font-family:sans-serif;text-align:center">
  <h1>404</h1>
  <p>Sorry, the page <b><c:out value="\${requestScope['jakarta.servlet.error.request_uri']}"/></b> was not found.</p>
  <a href="\${pageContext.request.contextPath}/">Go to Home</a>
</body></html>

<%-- WEB-INF/errors/500.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%
    if (exception != null) {
        application.log("Unhandled error on " + request.getAttribute("jakarta.servlet.error.request_uri"), exception);
    }
%>
<html><body style="font-family:sans-serif;text-align:center">
  <h1>Something went wrong</h1>
  <p>Our team has been notified. Please try again later.</p>
  <p>Error code: \${pageContext.errorData.statusCode}</p>
</body></html>

// com/demo/web/BoomServlet.java
package com.demo.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/boom")
public class BoomServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        throw new IllegalStateException("Test failure");
    }
}`,
      result: '/no-such-page -> "404 / Sorry, the page /<context>/no-such-page was not found." with a Home link (HTTP status remains 404).\n/boom -> "Something went wrong / Error code: 500" and the Tomcat log shows "Unhandled error on /<context>/boom" with the IllegalStateException stack trace.',
      explanation: 'The container forwards to the error page and sets jakarta.servlet.error.* attributes. pageContext.errorData gives statusCode, requestURI and throwable in EL. The user never sees a stack trace, while developers still get it in the log.',
    },
    {
      title: 'Security toolkit: password hashing, CSRF filter and safe output',
      scenario: 'Hash passwords with PBKDF2 (pure Java), protect all POST forms with a CSRF token filter, and set secure session cookie settings.',
      steps: [
        'Create com.demo.security.PasswordUtil, com.demo.security.CsrfFilter.',
        'Add the session-config block to web.xml.',
        'In every POST form add the hidden csrf field shown below.',
        'Test: submit a form normally (works); remove the hidden field with browser DevTools and submit (403).',
      ],
      code: `// com/demo/security/PasswordUtil.java
package com.demo.security;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class PasswordUtil {
    private static final int ITERATIONS = 210_000;
    private static final int KEY_BITS = 256;

    private PasswordUtil() { }

    /** Returns "iterations:saltBase64:hashBase64" to store in the DB. */
    public static String hash(String password) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS);
        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":"
                + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean verify(String password, String stored) {
        String[] p = stored.split(":");
        int it = Integer.parseInt(p[0]);
        byte[] salt = Base64.getDecoder().decode(p[1]);
        byte[] expected = Base64.getDecoder().decode(p[2]);
        byte[] actual = pbkdf2(password.toCharArray(), salt, it);
        return MessageDigest.isEqual(expected, actual);   // constant-time compare
    }

    private static byte[] pbkdf2(char[] pwd, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(pwd, salt, iterations, KEY_BITS);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}

// com/demo/security/CsrfFilter.java
package com.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@WebFilter("/*")
public class CsrfFilter extends HttpFilter {
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpSession session = req.getSession();
        String token = (String) session.getAttribute("csrfToken");
        if (token == null) {
            byte[] b = new byte[32];
            RANDOM.nextBytes(b);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(b);
            session.setAttribute("csrfToken", token);
        }
        if ("POST".equalsIgnoreCase(req.getMethod())) {
            String sent = req.getParameter("csrf");
            if (sent == null || !MessageDigest.isEqual(
                    sent.getBytes(StandardCharsets.UTF_8), token.getBytes(StandardCharsets.UTF_8))) {
                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid CSRF token");
                return;
            }
        }
        chain.doFilter(req, res);
    }
}

<%-- In every POST form (JSP) --%>
<form method="post" action="\${pageContext.request.contextPath}/employees">
  <input type="hidden" name="csrf" value="\${sessionScope.csrfToken}">
  ...
</form>

<!-- WEB-INF/web.xml : secure session cookie -->
<session-config>
  <session-timeout>20</session-timeout>
  <cookie-config>
    <http-only>true</http-only>
    <secure>true</secure>          <!-- only when running on HTTPS -->
  </cookie-config>
  <tracking-mode>COOKIE</tracking-mode>   <!-- no ;jsessionid in URLs -->
</session-config>

// Usage at registration / login
String stored = PasswordUtil.hash("Secret@123");   // save in users.password_hash column
boolean ok = PasswordUtil.verify("Secret@123", stored);   // true
boolean bad = PasswordUtil.verify("secret@123", stored);  // false`,
      result: 'PasswordUtil.hash returns a different string every time, e.g. "210000:q8G1...==:Zk3x...=" (random salt). verify with the right password -> true, wrong case -> false.\nNormal form submit works. Form without/with a modified csrf field -> HTTP 403 "Invalid CSRF token".',
      explanation: 'Salting makes equal passwords produce different hashes; many iterations slow down brute force. MessageDigest.isEqual compares in constant time. The CSRF token is unknown to other sites, so forged POSTs fail. If you enable this filter, also add the hidden csrf field to the upload form: Tomcat can parse the multipart body inside the filter because the target UploadServlet has @MultipartConfig. Remove <secure> when testing on plain http://localhost.',
    },
  ],
  interview: [
    { q: 'How do you upload a file in Servlet 6?', a: 'Use a form with method=post and enctype=multipart/form-data, annotate the Servlet with @MultipartConfig, and read the file with request.getPart("name"); save with part.write() or getInputStream().', level: 'Easy' },
    { q: 'What does @MultipartConfig do and what are its attributes?', a: 'Enables multipart parsing for the Servlet. Attributes: location (temp folder), fileSizeThreshold, maxFileSize, maxRequestSize.', level: 'Medium' },
    { q: 'Why should uploaded files not be stored inside the deployed webapp folder?', a: 'Redeploying or cleaning the server deletes them, and they may become directly executable/accessible. Store them in an external folder or cloud storage and serve through a controlled Servlet.', level: 'Medium' },
    { q: 'What is path traversal and how do you prevent it in a download Servlet?', a: 'An attacker uses ../ in the file name to read files outside the allowed folder. Normalise the resolved path and check it startsWith the base directory; also use generated file names.', level: 'Hard' },
    { q: 'How do you implement pagination in JDBC with MySQL?', a: 'SELECT ... ORDER BY col LIMIT pageSize OFFSET (page-1)*pageSize, plus SELECT COUNT(*) to compute total pages = ceil(total/pageSize).', level: 'Easy' },
    { q: 'Why is ORDER BY required with LIMIT/OFFSET?', a: 'Without an order, the database is free to return rows in any order, so pages may repeat or skip rows.', level: 'Medium' },
    { q: 'How do you configure error pages in a web app?', a: 'In web.xml with <error-page> using <error-code> or <exception-type> and a <location>. Page-level errorPage directive can be used for individual JSPs.', level: 'Easy' },
    { q: 'What is XSS and how do you prevent it in JSP?', a: 'Cross-Site Scripting: injecting scripts via user input that is shown to other users. Prevent by escaping output with c:out or fn:escapeXml, validating input, and HttpOnly cookies.', level: 'Medium' },
    { q: 'How do you prevent SQL injection?', a: 'Use PreparedStatement with ? parameters; never concatenate user input into SQL. Whitelist identifiers like sort columns.', level: 'Easy' },
    { q: 'What is CSRF and how do you prevent it?', a: 'Cross-Site Request Forgery tricks a logged-in browser into sending unwanted requests. Prevent with a per-session random token in forms checked by the server, SameSite cookies, and using POST for state changes.', level: 'Hard' },
    { q: 'How should passwords be stored?', a: 'As a salted, slow, one-way hash such as BCrypt, PBKDF2 or Argon2 - never plain text or simple MD5/SHA-1.', level: 'Medium' },
    { q: 'What session security settings would you apply?', a: 'HttpOnly and Secure cookies, COOKIE tracking mode, reasonable timeout, changeSessionId() after login, invalidate() on logout, HTTPS.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Allow uploading multiple PDF files at once (input with multiple attribute) and show the total size uploaded.',
      hint: 'Loop over request.getParts() and filter parts whose name is "docs".',
      solution: `@WebServlet("/upload-docs")
@MultipartConfig(maxFileSize = 5 * 1024 * 1024, maxRequestSize = 20 * 1024 * 1024)
public class MultiUploadServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        Path dir = Paths.get(getServletContext().getInitParameter("uploadDir"));
        long total = 0;
        int count = 0;
        for (Part part : req.getParts()) {
            if (!"docs".equals(part.getName()) || part.getSize() == 0) continue;
            String n = Paths.get(part.getSubmittedFileName()).getFileName().toString();
            if (!n.toLowerCase().endsWith(".pdf")) continue;
            part.write(dir.resolve(UUID.randomUUID() + ".pdf").toString());
            total += part.getSize();
            count++;
        }
        resp.getWriter().println(count + " PDF(s) uploaded, total " + total / 1024 + " KB");
    }
}

<!-- form -->
<form method="post" action="upload-docs" enctype="multipart/form-data">
  <input type="file" name="docs" multiple accept=".pdf">
  <button>Upload</button>
</form>`,
    },
    {
      task: 'Add a "page size" dropdown (5, 10, 20) to the product pagination, keeping the selected size in the page links.',
      hint: 'Read size param, whitelist it, add &size=${size} to all links.',
      solution: `// Controller
int size;
try { size = Integer.parseInt(req.getParameter("size")); } catch (NumberFormatException e) { size = 5; }
if (size != 5 && size != 10 && size != 20) size = 5;
int totalPages = Math.max(1, (total + size - 1) / size);
// ... use size instead of PAGE_SIZE, and req.setAttribute("size", size);

<%-- JSP --%>
<form method="get">
  <select name="size" onchange="this.form.submit()">
    <c:forEach items="\${[5,10,20]}" var="s">
      <option value="\${s}" \${s == size ? 'selected' : ''}>\${s}</option>
    </c:forEach>
  </select>
</form>
<a href="\${base}?page=\${i}&size=\${size}">\${i}</a>`,
    },
    {
      task: 'Rewrite this vulnerable code safely: String sql = "SELECT * FROM users WHERE email=\'" + email + "\' ORDER BY " + sortCol;',
      hint: 'PreparedStatement for the value; whitelist for the column.',
      solution: `Set<String> allowed = Set.of("name", "email", "created_at");
String col = allowed.contains(sortCol) ? sortCol : "name";
String sql = "SELECT id, name, email FROM users WHERE email = ? ORDER BY " + col;
try (Connection con = DBUtil.getConnection();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, email);
    try (ResultSet rs = ps.executeQuery()) {
        // map rows
    }
}`,
    },
    {
      task: 'Add an error page for NumberFormatException that says "Please enter numbers only" and a generic 403 page.',
      hint: 'Two more <error-page> entries; the specific exception type is chosen over Throwable.',
      solution: `<error-page>
  <exception-type>java.lang.NumberFormatException</exception-type>
  <location>/WEB-INF/errors/number.jsp</location>
</error-page>
<error-page>
  <error-code>403</error-code>
  <location>/WEB-INF/errors/403.jsp</location>
</error-page>

<%-- WEB-INF/errors/number.jsp --%>
<%@ page isErrorPage="true" contentType="text/html;charset=UTF-8" %>
<h2>Please enter numbers only.</h2>
<a href="javascript:history.back()">Go back</a>

<%-- WEB-INF/errors/403.jsp --%>
<%@ page isErrorPage="true" contentType="text/html;charset=UTF-8" %>
<h2>Access denied</h2>
<p>You do not have permission to view this page.</p>`,
    },
  ],
  quiz: [
    {
      question: 'Which form attribute is mandatory for file upload?',
      options: ['method="get"', 'enctype="multipart/form-data"', 'accept="file"', 'enctype="text/plain"'],
      answer: 1,
      explanation: 'Files are sent only with multipart/form-data and POST.',
    },
    {
      question: 'With 47 rows and page size 10, how many pages and what is the OFFSET for page 4?',
      options: ['4 pages, offset 40', '5 pages, offset 40', '5 pages, offset 30', '4 pages, offset 30'],
      answer: 2,
      explanation: '(47+9)/10 = 5 pages; offset = (4-1)*10 = 30.',
    },
    {
      question: 'What best prevents SQL injection?',
      options: ['PreparedStatement with ? parameters', 'Escaping quotes manually', 'Using POST instead of GET', 'Hiding error messages'],
      answer: 0,
      explanation: 'Parameters are sent separately from SQL, so input cannot change the query structure.',
    },
    {
      question: 'Which JSTL usage protects against XSS when printing user input?',
      options: ['${param.name}', '<c:set value="${param.name}"/>', '<c:import url="${param.name}"/>', '<c:out value="${param.name}"/>'],
      answer: 3,
      explanation: 'c:out escapes <, >, &, quotes by default.',
    },
    {
      question: 'Which is the recommended way to store user passwords?',
      options: ['Plain text in a hidden column', 'Base64 encoded', 'Salted slow hash like BCrypt or PBKDF2', 'MD5 hash'],
      answer: 2,
      explanation: 'Base64 is reversible and MD5 is fast/broken; use a salted slow hash.',
    },
  ],
};
