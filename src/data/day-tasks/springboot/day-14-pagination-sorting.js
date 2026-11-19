const PRODUCTS = `CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  price INT
);
INSERT INTO products VALUES
(1, 'Pen', 20), (2, 'Notebook', 60), (3, 'Bag', 900),
(4, 'Bottle', 250), (5, 'Pencil', 10), (6, 'Calculator', 650),
(7, 'Eraser', 5), (8, 'Geometry Box', 120), (9, 'Marker', 35);`;

export default {
  lesson: 'day-14-pagination-sorting',
  minutes: 24,
  intro: 'Use PageRequest and Sort, read Page metadata, translate a page to SQL LIMIT/OFFSET and expose paging over REST.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'The `students` table has **45** rows. What does this print? (one value per line)',
      example: { title: 'pages are zero-based', code: 'PageRequest.of(0, 10)  // first page: rows 1-10' },
      code: `Page<Student> p = repo.findAll(PageRequest.of(2, 10));
System.out.println(p.getNumber());
System.out.println(p.getTotalElements());
System.out.println(p.getTotalPages());
System.out.println(p.getNumberOfElements());
System.out.println(p.isLast());`,
      expected: '2\n45\n5\n10\nfalse',
      explain: 'Page index 2 is the **third** page (rows 21-30), so it holds 10 rows. 45 rows / 10 per page = 5 pages (the last one has 5 rows). Page 2 is not the last page (that is index 4).',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Same 45 rows. What does this print?',
      example: { title: 'the last page can be smaller', code: '23 rows, size 10 → pages of 10, 10, 3' },
      code: `Page<Student> p = repo.findAll(PageRequest.of(4, 10));
System.out.println(p.getNumberOfElements() + " " + p.isLast() + " " + p.hasPrevious());`,
      expected: '5 true true',
      explain: 'Index 4 = rows 41-45, so only **5** elements. It is the last page, and pages 0-3 come before it, so `hasPrevious()` is true.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Create a `Pageable` for the **first** page of **5** products sorted by `price` from highest to lowest:\n```\nPageable pageable = ???;\n```',
      example: { title: 'sorting by two fields', code: 'Sort.by("city").ascending().and(Sort.by("name"))' },
      accept: ['PageRequest.of(0, 5, Sort.by("price").descending())', 'PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "price"))', 'PageRequest.of(0, 5, Sort.Direction.DESC, "price")', 'PageRequest.of(0,5,Sort.by(Direction.DESC,"price"))', 'PageRequest.of(0, 5, Direction.DESC, "price")'],
      explain: '`PageRequest.of(page, size, sort)` - page is **0** for the first page. `Sort.by("price").descending()` gives highest first. Writing `PageRequest.of(1, 5, ...)` for the "first page" is the most common off-by-one mistake.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Write the SQL that Spring Data runs for `productRepo.findAll(PageRequest.of(1, 3, Sort.by("price").descending()))` - the **second** page of 3 products, most expensive first. Return all columns.',
      example: { title: 'LIMIT with OFFSET', code: '-- skip 10 rows, take 5\nSELECT * FROM orders ORDER BY id LIMIT 5 OFFSET 10;' },
      setup: PRODUCTS,
      starter: '-- SELECT * FROM products ORDER BY ... LIMIT ... OFFSET ...;\n',
      solution: 'SELECT * FROM products ORDER BY price DESC LIMIT 3 OFFSET 3;',
      ordered: true,
      explain: 'OFFSET = page × size = 1 × 3 = **3** rows skipped, LIMIT = size = 3. Sorted by price DESC the rows are Bag, Calculator, Bottle | Geometry Box, Notebook, Marker | ... so page 1 is Geometry Box, Notebook, Marker. `LIMIT 3, 3` is the same in MySQL.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between returning `Page<T>` and `Slice<T>` from a repository?',
      options: [
        'Slice cannot be sorted',
        'Page runs an extra COUNT query to know total elements/pages; Slice only knows whether a next page exists (cheaper, good for infinite scroll)',
        'Slice loads all rows into memory',
        'There is no difference',
      ],
      answer: 1,
      explain: '`Page` = data + **count query** (totalElements, totalPages). `Slice` fetches size + 1 rows to know `hasNext()` and skips the count - great for "Load more" lists on big tables.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'The controller method is `public Page<ProductDto> list(Pageable pageable)`. Which request URLs are valid ways to call it? (choose all that apply)',
      options: ['/api/products?page=0&size=5', '/api/products?page=1&size=10&sort=price,desc', '/api/products?sort=name,asc&sort=price,desc', '/api/products?pageNumber=1&pageSize=10', '/api/products'],
      answers: [0, 1, 2, 4],
      explain: 'Spring binds `page`, `size` and `sort=field,direction` (repeatable for multiple sorts) into the `Pageable`. Without parameters it uses page 0, size 20. `pageNumber`/`pageSize` are not the default parameter names, so they are ignored.',
    },
  ],
};
