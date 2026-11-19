export default {
  lesson: 'day-097-pagination-search-sort-filter-file-upload',
  minutes: 38,
  intro: 'Add paging, searching, sorting and filtering to a list endpoint with query parameters, and accept file uploads with IFormFile safely.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which request URL follows common REST conventions for "page 2 of IT employees named like ra, sorted by salary descending"?',
      options: [
        'GET /api/employees?page=2&pageSize=10&dept=IT&search=ra&sortBy=salary&desc=true',
        'POST /api/employees/search/page/2',
        'GET /api/employees/IT/ra/salary/desc/2',
        'GET /api/getEmployeesPage2',
      ],
      answer: 0,
      explain: 'Paging, search, sort and filter are **optional modifiers of the same collection**, so they go in the query string and bind to a `[FromQuery] EmployeeQuery` object. Path segments are for identifying resources.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the parameter type that receives an uploaded file in a `multipart/form-data` request:\n`public async Task<IActionResult> UploadPhoto(int id, ______ file)`',
      example: { title: 'several files', code: 'public async Task<IActionResult> Upload(List<IFormFile> files)' },
      accept: ['IFormFile'],
      caseSensitive: true,
      explain: '`IFormFile` gives `FileName`, `Length`, `ContentType` and `CopyToAsync(stream)`. Never trust `FileName`: generate your own name (e.g. a GUID) to avoid path traversal and overwrites.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this query return for `?search=a&sortBy=salary&desc=true&page=1&pageSize=2`? Type the names, one per line. Data (Name, Salary): Asha 60000, Ravi 40000, Meera 75000, Kiran 45000, Sana 52000.',
      example: { title: 'building the query step by step', code: 'var q = _db.Products.AsQueryable();\nif (minPrice != null) q = q.Where(p => p.Price >= minPrice);' },
      code: `var q = _db.Employees.AsQueryable();
if (!string.IsNullOrWhiteSpace(search))
    q = q.Where(e => e.Name.Contains(search));   // SQL Server collation: case-insensitive
q = sortBy == "salary"
    ? (desc ? q.OrderByDescending(e => e.Salary) : q.OrderBy(e => e.Salary))
    : q.OrderBy(e => e.Name);
var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();`,
      expected: `Meera
Asha`,
      explain: 'Every name contains "a" (case-insensitive: Asha, Ravi, Meera, Kiran, Sana). Sorted by salary descending: Meera 75000, Asha 60000, Sana 52000... Page 1 with size 2 → Meera, Asha. The order matters: **filter → sort → page**.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which checks should a file upload endpoint do? (choose all that apply)',
      options: [
        'Limit the size (e.g. 2 MB) and return 400 when it is too large',
        'Allow only expected extensions/content types (e.g. .jpg, .png, .pdf)',
        'Save with a server-generated file name, outside folders that execute code',
        'Use the client\'s file name as-is in Path.Combine',
        'Check file.Length > 0',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Uploads are a common attack vector: huge files, `.exe`/`.aspx` uploads and names like `../../web.config`. Validate size, type and emptiness and generate the stored name yourself.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 12,
      q: '**The same list endpoint in Express.** `GET /api/employees` supports:\n- `search` (case-insensitive part of name), `dept` (exact)\n- `sortBy=name|salary` (default name) and `desc=true`\n- `page` (default 1), `pageSize` (default 10)\n\nRespond `{ items, totalCount, page, pageSize }` where `totalCount` is the count **after filtering, before paging**.',
      example: { title: 'numeric query values', code: 'const page = Number(req.query.page) || 1;' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst employees = [\n  { id: 1, name: "Asha", dept: "IT", salary: 60000 },\n  { id: 2, name: "Ravi", dept: "HR", salary: 40000 },\n  { id: 3, name: "Meera", dept: "IT", salary: 75000 },\n  { id: 4, name: "Kiran", dept: "Sales", salary: 45000 },\n  { id: 5, name: "Sana", dept: "IT", salary: 52000 },\n];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst employees = [\n  { id: 1, name: "Asha", dept: "IT", salary: 60000 },\n  { id: 2, name: "Ravi", dept: "HR", salary: 40000 },\n  { id: 3, name: "Meera", dept: "IT", salary: 75000 },\n  { id: 4, name: "Kiran", dept: "Sales", salary: 45000 },\n  { id: 5, name: "Sana", dept: "IT", salary: 52000 },\n];\n\napp.get("/api/employees", (req, res) => {\n  const { search, dept, sortBy = "name", desc } = req.query;\n  const page = Number(req.query.page) || 1;\n  const pageSize = Number(req.query.pageSize) || 10;\n  let list = employees.slice();\n  if (search) list = list.filter((e) => e.name.toLowerCase().includes(String(search).toLowerCase()));\n  if (dept) list = list.filter((e) => e.dept === dept);\n  const key = sortBy === "salary" ? "salary" : "name";\n  list.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));\n  if (desc === "true") list.reverse();\n  const totalCount = list.length;\n  const items = list.slice((page - 1) * pageSize, page * pageSize);\n  res.json({ items, totalCount, page, pageSize });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'defaults: sorted by name', steps: [{ method: 'GET', url: '/api/employees', expect: { status: 200, json: { totalCount: 5, page: 1, pageSize: 10, items: [{ name: 'Asha' }, { name: 'Kiran' }, { name: 'Meera' }, { name: 'Ravi' }, { name: 'Sana' }] } } }] },
        { name: 'dept + salary desc', steps: [{ method: 'GET', url: '/api/employees?dept=IT&sortBy=salary&desc=true', expect: { json: { totalCount: 3, items: [{ name: 'Meera' }, { name: 'Asha' }, { name: 'Sana' }] } } }] },
        { name: 'search + paging', steps: [{ method: 'GET', url: '/api/employees?search=A&sortBy=salary&desc=true&page=2&pageSize=2', expect: { json: { totalCount: 5, page: 2, pageSize: 2, items: [{ name: 'Sana' }, { name: 'Kiran' }] } } }] },
      ],
      explain: 'Apply the steps in the same order as the EF Core query: filter, count, sort, page. Returning `totalCount` lets the client compute the number of pages. Parse query values to numbers - they always arrive as strings.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**Validate an upload.** `validateUpload(file)` gets `{ fileName, length }` and returns an error message or `null`:\n- `length` 0 → `"File is empty"`\n- more than 2 MB (2 * 1024 * 1024 bytes) → `"File too large"`\n- extension (case-insensitive) not `.jpg`, `.jpeg`, `.png` or `.pdf` → `"File type not allowed"`',
      example: { title: 'getting the extension', code: '"Report.Final.PDF".split(".").pop().toLowerCase() // "pdf"' },
      starter: 'function validateUpload(file) {\n  // TODO\n}\n',
      solution: 'function validateUpload(file) {\n  if (!file.length) return "File is empty";\n  if (file.length > 2 * 1024 * 1024) return "File too large";\n  const name = file.fileName || "";\n  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";\n  if (!["jpg", "jpeg", "png", "pdf"].includes(ext)) return "File type not allowed";\n  return null;\n}\n',
      tests: [
        { call: 'validateUpload({ fileName: "photo.JPG", length: 50000 })', expect: null },
        { call: 'validateUpload({ fileName: "a.png", length: 0 })', expect: 'File is empty' },
        { call: 'validateUpload({ fileName: "big.pdf", length: 3 * 1024 * 1024 })', expect: 'File too large' },
        { call: 'validateUpload({ fileName: "shell.aspx", length: 100 })', expect: 'File type not allowed' },
        { call: 'validateUpload({ fileName: "photo.jpg.exe", length: 100 })', expect: 'File type not allowed', msg: 'Only the LAST extension counts' },
      ],
      explain: 'The same checks belong in the C# action before `CopyToAsync`. Checking only that the name *contains* ".jpg" lets `photo.jpg.exe` through - always look at the last extension (and ideally the file\'s magic bytes).',
    },
  ],
};
