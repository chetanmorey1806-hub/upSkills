export default {
  id: 'day-14-pagination-sorting',
  title: 'Pagination and Sorting',
  module: 'Module 3: Data Access',
  day: 14,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Return large data sets page by page and in a chosen order using Pageable, PageRequest, Sort, Page and Slice in Spring Data JPA, and expose them through REST endpoints.',
  objectives: [
    'Explain why pagination is needed for large tables',
    'Use PageRequest.of(page, size, Sort) and the Page<T> object',
    'Sort by one or many fields in ascending/descending order',
    'Accept page, size and sort from the URL with Pageable in a controller',
    'Return a clean paged DTO response and know Page vs Slice',
  ],
  theory: [
    {
      heading: '1. Why Pagination?',
      content: 'Imagine a table with 10 lakh orders. Calling findAll() loads every row into memory, takes seconds, and the browser freezes trying to show it. Pagination is like a book: you read page 1 with 20 lines, then page 2. The database returns only one small page using LIMIT and OFFSET.',
      points: [
        'Faster response and less memory',
        'Better user experience (infinite scroll or page numbers)',
        'Page numbers in Spring Data are ZERO-based: page 0 = first page',
      ],
    },
    {
      heading: '2. Pageable, PageRequest and Sort',
      content: 'Pageable is an interface that describes "which page, how big, in what order". PageRequest is its implementation. Sort describes ordering. JpaRepository already extends PagingAndSortingRepository, so findAll(Pageable) and findAll(Sort) are available for free.',
      syntax: `Sort sort = Sort.by("price").descending();
Sort multi = Sort.by(Sort.Order.asc("category"), Sort.Order.desc("price"));
Pageable pageable = PageRequest.of(0, 10, sort);   // page 0, 10 rows
Page<Product> page = repository.findAll(pageable);`,
      tip: 'Sort property names are ENTITY field names. Sort.by("unit_price") fails if the field is unitPrice — PropertyReferenceException.',
    },
    {
      heading: '3. The Page<T> Object',
      content: 'Page<T> contains the data AND metadata. To know the total pages Spring runs an extra COUNT query. Diagram in words: [content: 10 rows] + [number: 0] + [size: 10] + [totalElements: 53] + [totalPages: 6] + [first: true] + [last: false].',
      points: [
        'getContent() → List<T> rows of the current page',
        'getTotalElements() → total rows in the table (from COUNT query)',
        'getTotalPages() → ceil(totalElements / size)',
        'getNumber(), getSize(), isFirst(), isLast(), hasNext()',
        'map(fn) → convert Page<Entity> to Page<Dto> keeping metadata',
      ],
    },
    {
      heading: '4. Pageable in Controllers',
      content: 'Spring MVC can build a Pageable directly from request parameters: ?page=1&size=5&sort=price,desc&sort=name,asc. Use @PageableDefault to define defaults. You can also take page and size as @RequestParam and build PageRequest yourself, which gives you full control (e.g. maximum page size).',
      syntax: `@GetMapping
public Page<ProductDto> list(@PageableDefault(size = 10, sort = "id") Pageable pageable) {
    return service.list(pageable);
}`,
      tip: 'Limit size on the server (spring.data.web.pageable.max-page-size=100) so a client cannot ask for size=1000000.',
    },
    {
      heading: '5. Paging with Custom Queries',
      content: 'Any derived method or @Query can accept a Pageable as the last parameter and return Page<T>. For @Query with joins you may need to give countQuery separately.',
      syntax: `Page<Product> findByCategory(String category, Pageable pageable);

@Query(value = "SELECT p FROM Product p WHERE p.price > :min",
       countQuery = "SELECT COUNT(p) FROM Product p WHERE p.price > :min")
Page<Product> costly(@Param("min") double min, Pageable pageable);`,
    },
    {
      heading: '6. Page vs Slice vs List',
      content: 'Page runs an extra COUNT query to know total pages — good for page number buttons. Slice only knows whether a NEXT page exists (it fetches size + 1 rows) — good for "Load more" / infinite scroll and cheaper on huge tables. List with Pageable returns just rows with no metadata.',
      points: [
        'Page<T> → content + total count (2 queries)',
        'Slice<T> → content + hasNext (1 query)',
        'Spring Data 3.x warns when serializing PageImpl directly to JSON; returning your own DTO (or enabling @EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)) gives a stable JSON shape',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Paged and Sorted Product List',
      scenario: 'A product listing screen shows 5 products per page sorted by price.',
      steps: [
        'Reuse the catalog-api project from Day 13 (Product entity + ProductRepository + data.sql). Add 12 sample rows to data.sql',
        'Create ProductService with a method list(page, size, sortBy, dir)',
        'Create the controller method GET /api/products?page=0&size=5&sortBy=price&dir=desc',
        'IntelliJ: Run ▶ the main class, then open Services tool window to see the running app',
        'Eclipse/STS: Boot Dashboard > select app > (Re)start',
        'Test in browser: http://localhost:8080/api/products?page=1&size=5&sortBy=price&dir=asc',
      ],
      code: `// ===== service/ProductService.java =====
package com.shop.catalog.service;

import com.shop.catalog.entity.Product;
import com.shop.catalog.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository repo;
    public ProductService(ProductRepository repo) { this.repo = repo; }

    public Page<Product> list(int page, int size, String sortBy, String dir) {
        Sort sort = dir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        int safeSize = Math.min(size, 50);          // never more than 50 rows
        Pageable pageable = PageRequest.of(page, safeSize, sort);
        return repo.findAll(pageable);
    }
}

// ===== controller/ProductController.java =====
package com.shop.catalog.controller;

import com.shop.catalog.entity.Product;
import com.shop.catalog.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "5") int size,
                                    @RequestParam(defaultValue = "id") String sortBy,
                                    @RequestParam(defaultValue = "asc") String dir) {
        Page<Product> p = service.list(page, size, sortBy, dir);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("content", p.getContent());
        body.put("page", p.getNumber());
        body.put("size", p.getSize());
        body.put("totalElements", p.getTotalElements());
        body.put("totalPages", p.getTotalPages());
        body.put("last", p.isLast());
        return body;
    }
}`,
      result: `GET /api/products?page=1&size=5&sortBy=price&dir=asc   (12 rows in table)
{
  "content": [ ...5 products, 6th to 10th cheapest... ],
  "page": 1,
  "size": 5,
  "totalElements": 12,
  "totalPages": 3,
  "last": false
}

Console:
Hibernate: select ... from products p1_0 order by p1_0.price asc offset ? rows fetch first ? rows only
Hibernate: select count(p1_0.id) from products p1_0`,
      explanation: '12 rows / 5 per page = 3 pages (0, 1, 2). Page 1 is the second page. Two SQL queries run: one for the rows with offset 5, one COUNT for totalElements. We return a Map so the JSON shape is stable and clear for the frontend.',
    },
    {
      title: 'Example 2: Pageable Parameter with Filtering and DTO Mapping',
      scenario: 'Search products by category with paging, sorting by several fields, and return a lightweight DTO.',
      steps: [
        'Add Page<Product> findByCategory(String category, Pageable pageable) to ProductRepository',
        'Create record ProductDto and PageResponse<T> in package dto',
        'Write the controller method with a Pageable parameter and @PageableDefault',
        'Add spring.data.web.pageable.max-page-size=50 to application.properties',
        'Test: /api/products/category/MOBILE?page=0&size=3&sort=price,desc&sort=name,asc',
      ],
      code: `// ===== dto/ProductDto.java =====
package com.shop.catalog.dto;
public record ProductDto(Long id, String name, Double price) {}

// ===== dto/PageResponse.java =====
package com.shop.catalog.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(List<T> content, int page, int size,
                              long totalElements, int totalPages, boolean last) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(),
                p.getTotalElements(), p.getTotalPages(), p.isLast());
    }
}

// ===== ProductRepository.java (add) =====
Page<Product> findByCategory(String category, Pageable pageable);

// ===== ProductController.java (add) =====
@GetMapping("/category/{cat}")
public PageResponse<ProductDto> byCategory(
        @PathVariable String cat,
        @PageableDefault(size = 5, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
    Page<ProductDto> page = repo.findByCategory(cat, pageable)
            .map(p -> new ProductDto(p.getId(), p.getName(), p.getPrice()));
    return PageResponse.of(page);
}

// ===== application.properties =====
spring.data.web.pageable.max-page-size=50
spring.data.web.pageable.default-page-size=5`,
      result: `GET /api/products/category/MOBILE?page=0&size=3&sort=price,desc&sort=name,asc
{
  "content": [
    {"id":1,"name":"iPhone 15","price":79999.0},
    {"id":2,"name":"Galaxy S24","price":74999.0},
    {"id":3,"name":"Redmi Phone 13","price":12999.0}
  ],
  "page":0,"size":3,"totalElements":3,"totalPages":1,"last":true
}`,
      explanation: 'Spring converts the URL params into a Pageable automatically. Two sort params create a multi-field sort (price desc, then name asc). Page.map() converts entities to DTOs while keeping the paging metadata, and PageResponse gives a predictable JSON format.',
    },
    {
      title: 'Example 3: Slice for "Load More" (Infinite Scroll)',
      scenario: 'A mobile app shows a feed and only needs to know whether more items exist. Counting millions of rows on every scroll is expensive.',
      steps: [
        'Add Slice<Product> findByActiveTrue(Pageable pageable) to the repository',
        'Add GET /api/products/feed?page=0&size=4',
        'Run and watch the console: no COUNT query is executed',
        'In IntelliJ use the HTTP Client: GET http://localhost:8080/api/products/feed?page=0&size=4 then change page to 1, 2',
      ],
      code: `// ===== ProductRepository.java (add) =====
Slice<Product> findByActiveTrue(Pageable pageable);

// ===== ProductController.java (add) =====
@GetMapping("/feed")
public Map<String, Object> feed(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "4") int size) {
    Slice<Product> s = repo.findByActiveTrue(PageRequest.of(page, size, Sort.by("id")));
    return Map.of(
        "items", s.getContent(),
        "page", s.getNumber(),
        "hasNext", s.hasNext()
    );
}`,
      result: `GET /api/products/feed?page=0&size=4   (11 active products)
{"items":[...4 items...],"page":0,"hasNext":true}

GET /api/products/feed?page=2&size=4
{"items":[...3 items...],"page":2,"hasNext":false}

Console: only one select per call, it fetches size+1 (5) rows to decide hasNext. No count query.`,
      explanation: 'Slice asks the database for one extra row. If the extra row exists, hasNext = true. This avoids the COUNT(*) query that Page needs, which is much faster on very large tables.',
    },
  ],
  interview: [
    { q: 'Is the page number in Spring Data zero-based or one-based?', a: 'Zero-based. PageRequest.of(0, 10) is the first page. Many teams convert from 1-based UI numbers by subtracting 1, or set spring.data.web.pageable.one-indexed-parameters=true.', level: 'Easy' },
    { q: 'What is the difference between Page and Slice?', a: 'Page contains total elements and total pages, so it runs an extra COUNT query. Slice only knows if a next slice exists by fetching size+1 rows; it is cheaper and suited for infinite scroll.', level: 'Medium' },
    { q: 'How do you sort by multiple fields?', a: 'Sort.by(Sort.Order.asc("category"), Sort.Order.desc("price")) or Sort.by("category").ascending().and(Sort.by("price").descending()). In URLs: ?sort=category,asc&sort=price,desc.', level: 'Easy' },
    { q: 'Which repository interface provides findAll(Pageable)?', a: 'PagingAndSortingRepository (and ListPagingAndSortingRepository). JpaRepository extends them, so it is available automatically.', level: 'Easy' },
    { q: 'Why give countQuery in @Query?', a: 'For complex JPQL (joins, fetch joins, group by) Spring may not derive a correct count query. countQuery lets you provide an efficient, correct count explicitly.', level: 'Hard' },
    { q: 'How do you prevent clients from requesting a huge page size?', a: 'Set spring.data.web.pageable.max-page-size, or clamp the size in the service with Math.min(size, MAX).', level: 'Medium' },
    { q: 'How to convert Page<Entity> to Page<Dto>?', a: 'Use page.map(entity -> new Dto(...)). It keeps total elements and page info.', level: 'Easy' },
    { q: 'What SQL does pagination generate?', a: 'A query with LIMIT/OFFSET (or OFFSET ... FETCH FIRST n ROWS ONLY depending on dialect) plus a COUNT query for Page results.', level: 'Medium' },
    { q: 'What is the problem with deep OFFSET pagination and the alternative?', a: 'OFFSET 1000000 makes the DB scan and skip a million rows. Keyset (seek) pagination uses "where id > lastSeenId order by id limit n"; Spring Data supports it with ScrollPosition / Window in 3.1+.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create GET /api/employees?page=&size=&sortBy=&dir= that returns employees paged and sorted, with a default of 10 per page sorted by name.',
      hint: 'PageRequest.of(page, size, Sort.by(dir, sortBy)) using Sort.Direction.fromString(dir).',
      solution: `@GetMapping("/api/employees")
public PageResponse<Employee> list(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   @RequestParam(defaultValue = "name") String sortBy,
                                   @RequestParam(defaultValue = "asc") String dir) {
    Pageable p = PageRequest.of(page, Math.min(size, 100),
            Sort.by(Sort.Direction.fromString(dir), sortBy));
    return PageResponse.of(employeeRepository.findAll(p));
}`,
    },
    {
      task: 'Add a paged search: employees whose name contains a keyword, ignoring case.',
      hint: 'Derived method with Pageable as last parameter.',
      solution: `Page<Employee> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

@GetMapping("/api/employees/search")
public PageResponse<Employee> search(@RequestParam String q, Pageable pageable) {
    return PageResponse.of(repo.findByNameContainingIgnoreCase(q, pageable));
}`,
    },
    {
      task: 'Write a paged JPQL query for employees with salary greater than a value and provide a countQuery.',
      hint: '@Query(value = ..., countQuery = ...).',
      solution: `@Query(value = "SELECT e FROM Employee e WHERE e.salary > :min",
       countQuery = "SELECT COUNT(e) FROM Employee e WHERE e.salary > :min")
Page<Employee> richerThan(@Param("min") double min, Pageable pageable);`,
    },
    {
      task: 'Allow only whitelisted sort fields (name, salary, city) to avoid PropertyReferenceException for bad input.',
      hint: 'Use a Set.of(...) and fall back to "id".',
      solution: `private static final Set<String> ALLOWED = Set.of("name", "salary", "city");

public Page<Employee> list(int page, int size, String sortBy) {
    String field = ALLOWED.contains(sortBy) ? sortBy : "id";
    return repo.findAll(PageRequest.of(page, size, Sort.by(field)));
}`,
    },
  ],
  quiz: [
    { question: 'PageRequest.of(2, 10) returns which rows (1-based row numbers)?', options: ['11–20', '21–30', '20–30', '1–10'], answer: 1, explanation: 'Page 2 is the third page: offset 20, so rows 21–30.' },
    { question: 'Which type avoids the COUNT query?', options: ['Page', 'List with Sort', 'Slice', 'Iterable'], answer: 2, explanation: 'Slice only checks if there is a next slice.' },
    { question: 'URL parameter for multi-sort is:', options: ['?sort=price,desc&sort=name,asc', '?order=price-desc', '?sortBy=price&sortBy=name', '?sort=[price,name]'], answer: 0, explanation: 'Spring parses repeated sort=field,direction parameters.' },
    { question: 'Page.getTotalPages() for 23 elements with size 5 is:', options: ['4', '23', '6', '5'], answer: 3, explanation: 'ceil(23 / 5) = 5.' },
    { question: 'Which annotation sets default paging values for a Pageable parameter?', options: ['@SortDefault only', '@PageableDefault', '@PageSize', '@Paginated'], answer: 1, explanation: '@PageableDefault(size = 10, sort = "id").' },
  ],
};
