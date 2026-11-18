export default {
  id: "day-03-word-and-pdf-automation",
  title: "Word and PDF Automation: python-docx and pypdf",
  module: "Module 1: Files & Office Automation",
  day: 3,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Generate Word documents such as offer letters and certificates with python-docx, fill templates automatically, and merge, split, rotate, protect and extract text from PDF files with pypdf.",
  objectives: [
    "Create Word documents with headings, styled text, tables and images using python-docx",
    "Fill a Word template by replacing placeholders like {{name}}",
    "Merge and split PDF files with pypdf",
    "Extract text from PDFs and understand the limits of scanned PDFs",
    "Generate bulk certificates for a list of students and convert them to PDF",
  ],
  theory: [
    {
      heading: "Why Automate Word and PDF?",
      content: "HR teams write hundreds of offer letters, colleges print certificates for every student, accounts teams merge invoices into one PDF for the auditor. These documents follow a fixed template where only a few values change. Python can produce them in seconds and with zero typing errors.\n\nTwo libraries cover most needs: **python-docx** for .docx Word files and **pypdf** for reading and manipulating existing PDFs.",
      points: [
        "pip install python-docx pypdf   (import names are docx and pypdf)",
        "python-docx works only with .docx, not the old .doc format",
        "pypdf manipulates PDFs (merge, split, rotate, encrypt, extract text); to draw new PDFs from scratch use reportlab or fpdf2",
      ],
    },
    {
      heading: "python-docx: Document, Paragraph, Run",
      content: "A Word file is a **Document** that contains **Paragraphs**. Each paragraph contains one or more **Runs**: pieces of text that share the same formatting. To make one word bold inside a sentence you add a separate run with `bold = True`. Headings are just paragraphs with a heading style.",
      syntax: `from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
doc.add_heading("Offer Letter", level=0)       # level 0 = Title style
p = doc.add_paragraph("Dear ")
name = p.add_run("Priya Sharma")
name.bold = True
p.add_run(", we are happy to offer you the role of Python Developer.")
p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
doc.add_paragraph("Joining date: 1 Dec 2025", style="List Bullet")
doc.add_picture("logo.png", width=Inches(1.2))
doc.add_page_break()
doc.save("offer_letter.docx")
`,
      tip: "Built-in style names (Title, Heading 1, List Bullet, Table Grid) must exist in the document's template. The default template of python-docx includes them.",
    },
    {
      heading: "Tables and Reading Existing Documents",
      content: "`doc.add_table(rows, cols)` creates a table; set `table.style = \"Table Grid\"` for visible borders. Access a cell with `table.cell(r, c)` or `table.rows[r].cells[c]`, and add rows with `table.add_row()`. To read a document, open it with `Document(path)` and loop over `doc.paragraphs` and `doc.tables`.",
      syntax: `table = doc.add_table(rows=1, cols=3)
table.style = "Table Grid"
hdr = table.rows[0].cells
hdr[0].text, hdr[1].text, hdr[2].text = "Component", "Monthly", "Annual"
row = table.add_row().cells
row[0].text, row[1].text, row[2].text = "Basic", "30,000", "3,60,000"

doc = Document("existing.docx")
for para in doc.paragraphs:
    print(para.style.name, "|", para.text)
`,
    },
    {
      heading: "Template Filling with Placeholders",
      content: "The most practical pattern is: design a nice template in Word with placeholders like `{{name}}` and `{{course}}`, then let Python replace them for each person. Setting `paragraph.text = ...` works but removes the run formatting of that paragraph. A safer approach replaces text inside each run. Word sometimes splits a placeholder across several runs (for example after spell-check), so type each placeholder in one go, or use the docxtpl library which handles this with Jinja2 syntax.",
      syntax: `def fill(doc, data):
    for p in doc.paragraphs:
        for run in p.runs:
            for key, value in data.items():
                run.text = run.text.replace("{{" + key + "}}", value)
`,
      tip: "Remember to also loop over doc.tables -> rows -> cells -> paragraphs, and over headers/footers in doc.sections, if placeholders appear there.",
    },
    {
      heading: "pypdf: Reading, Merging, Splitting",
      content: "`PdfReader` opens a PDF; `reader.pages` is a list-like object of pages. `PdfWriter` builds a new PDF: add pages with `add_page()` or append entire files with `append()`, then save with `write()`. In pypdf 5 and later the old `PdfMerger` class was removed; use `PdfWriter.append()` instead. Pages can be rotated with `page.rotate(90)`.",
      syntax: `from pypdf import PdfReader, PdfWriter

reader = PdfReader("report.pdf")
print(len(reader.pages))
print(reader.metadata.title if reader.metadata else None)

writer = PdfWriter()
writer.append("part1.pdf")
writer.append("part2.pdf", pages=(0, 3))   # first 3 pages only
writer.write("merged.pdf")
writer.close()
`,
    },
    {
      heading: "Extracting Text, Encryption and Limits",
      content: "`page.extract_text()` returns the text layer of a page. It works well for PDFs created digitally (from Word, Excel, software) but returns little or nothing for **scanned** PDFs, which are just images; those need OCR (pytesseract, OCRmyPDF). Text order can also be imperfect for complex layouts. For password protection use `writer.encrypt(user_password=..., algorithm=\"AES-256\")`; to open a protected file call `reader.decrypt(password)`.",
      points: [
        "Tables inside PDFs: try pdfplumber or camelot instead of plain text extraction",
        "AES encryption in pypdf needs the extra: pip install \"pypdf[crypto]\"",
        "Never store passwords in the script; read them from environment variables",
      ],
    },
    {
      heading: "Converting Word to PDF",
      content: "python-docx cannot export PDF itself. Common options: **docx2pdf** (uses installed Microsoft Word on Windows/macOS) or **LibreOffice headless** on any OS, which is ideal on Linux servers: `soffice --headless --convert-to pdf --outdir out certificate.docx`. You can call it from Python with `subprocess.run()`.",
      syntax: `import subprocess
subprocess.run(["soffice", "--headless", "--convert-to", "pdf",
                "--outdir", "pdf_out", "certificates/asha.docx"], check=True)
`,
    },
  ],
  examples: [
    {
      title: "Generate an Offer Letter in Word",
      scenario: "HR needs a formatted offer letter with a title, a personalised greeting, bold candidate name and a salary table.",
      steps: [
        "Install: pip install python-docx",
        "Create main.py and paste the code",
        "Run: python main.py",
        "Open offer_priya.docx in Word or LibreOffice Writer",
      ],
      code: `from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

candidate = {"name": "Priya Sharma", "role": "Python Developer", "ctc": "6,00,000"}

doc = Document()
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)

title = doc.add_heading("Offer of Employment", level=0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph("Dear ")
p.add_run(candidate["name"]).bold = True
p.add_run(f",\\nWe are pleased to offer you the position of {candidate['role']} "
          f"with an annual CTC of Rs {candidate['ctc']}.")

table = doc.add_table(rows=1, cols=2)
table.style = "Table Grid"
table.rows[0].cells[0].text = "Component"
table.rows[0].cells[1].text = "Annual (Rs)"
for comp, amt in [("Basic", "3,00,000"), ("HRA", "1,50,000"), ("Allowances", "1,50,000")]:
    cells = table.add_row().cells
    cells[0].text, cells[1].text = comp, amt

doc.add_paragraph("Please sign and return a copy of this letter.")
doc.save("offer_priya.docx")
print("Paragraphs:", len(doc.paragraphs), "| Table rows:", len(table.rows))
`,
      result: `Paragraphs: 3 | Table rows: 4`,
      explanation: "Changing the Normal style sets the default font for the whole document. add_heading(level=0) uses the Title style. add_run() returns a Run, so .bold = True makes only the name bold. The table uses the Table Grid style for borders and add_row() appends each salary component. doc.paragraphs counts body paragraphs (heading, greeting, closing line); table text is stored separately in doc.tables.",
    },
    {
      title: "Bulk Certificates from a Word Template",
      scenario: "A training institute has a certificate_template.docx containing {{name}}, {{course}} and {{date}}. Create one certificate per student.",
      steps: [
        "Install: pip install python-docx",
        "Create certificate_template.docx in Word with the three placeholders (type each placeholder in one go so it stays in a single run)",
        "Run: python main.py",
        "Check the certificates/ folder; optionally convert to PDF with LibreOffice (see last line)",
      ],
      code: `from pathlib import Path
from docx import Document

students = [
    {"name": "Asha Patil", "course": "Python Automation", "date": "15 Nov 2025"},
    {"name": "Rahul Verma", "course": "Python Automation", "date": "15 Nov 2025"},
    {"name": "Sneha Rao", "course": "Python Automation", "date": "15 Nov 2025"},
]

def replace_in_paragraph(paragraph, data):
    for run in paragraph.runs:
        for key, value in data.items():
            run.text = run.text.replace("{{" + key + "}}", value)

def fill_template(template, data, out_path):
    doc = Document(template)
    for p in doc.paragraphs:
        replace_in_paragraph(p, data)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    replace_in_paragraph(p, data)
    doc.save(out_path)

out = Path("certificates")
out.mkdir(exist_ok=True)
for s in students:
    file = out / (s["name"].replace(" ", "_") + ".docx")
    fill_template("certificate_template.docx", s, file)
    print("Created", file)

# Optional: convert all to PDF on any OS with LibreOffice installed
# soffice --headless --convert-to pdf --outdir certificates certificates/*.docx
`,
      result: `Created certificates/Asha_Patil.docx
Created certificates/Rahul_Verma.docx
Created certificates/Sneha_Rao.docx`,
      explanation: "We open a fresh copy of the template for each student, so placeholders are always present. Replacing inside runs keeps the fonts and colours designed in Word. Tables are scanned too because many certificate designs use a table for layout. File names are built from student names with spaces replaced by underscores.",
    },
    {
      title: "Merge Monthly Invoice PDFs",
      scenario: "The accounts team has invoice_01.pdf ... invoice_12.pdf and the auditor wants a single PDF in month order.",
      steps: [
        "Install: pip install pypdf",
        "Put all invoice PDFs in an invoices/ folder",
        "Run: python main.py",
      ],
      code: `from pathlib import Path
from pypdf import PdfReader, PdfWriter

files = sorted(Path("invoices").glob("invoice_*.pdf"))
writer = PdfWriter()
total_pages = 0
for f in files:
    pages = len(PdfReader(f).pages)
    writer.append(str(f))
    total_pages += pages
    print(f"Added {f.name} ({pages} pages)")

writer.add_metadata({"/Title": "Invoices FY 2025-26"})
with open("all_invoices.pdf", "wb") as fh:
    writer.write(fh)
print("Total pages:", total_pages)
`,
      result: `Added invoice_01.pdf (2 pages)
Added invoice_02.pdf (1 pages)
Added invoice_03.pdf (3 pages)
Total pages: 6
(output depends on your invoice files)`,
      explanation: "sorted() works because the month number is zero-padded (01, 02 ... 12). PdfWriter.append() adds every page of a file, including its bookmarks. add_metadata() sets the document title shown by PDF viewers. Writing to an open binary file handle is the most portable way to save.",
    },
    {
      title: "Split a PDF and Extract Text",
      scenario: "A 10-page bank statement must be split into single-page files, and the text of page 1 must be searched for the account summary.",
      steps: [
        "Install: pip install pypdf",
        "Place statement.pdf next to main.py",
        "Run: python main.py",
      ],
      code: `from pathlib import Path
from pypdf import PdfReader, PdfWriter

reader = PdfReader("statement.pdf")
out = Path("pages")
out.mkdir(exist_ok=True)

for i, page in enumerate(reader.pages, start=1):
    writer = PdfWriter()
    writer.add_page(page)
    writer.write(out / f"statement_page_{i:02d}.pdf")
print("Split into", len(reader.pages), "files")

text = reader.pages[0].extract_text() or ""
for line in text.splitlines():
    if "Closing Balance" in line:
        print("Found:", line.strip())
if not text.strip():
    print("No text layer: this is probably a scanned PDF, use OCR")
`,
      result: `Split into 10 files
Found: Closing Balance: Rs 48,250.75
(lines found depend on your statement)`,
      explanation: "Each page is added to its own PdfWriter and saved with a zero-padded number. extract_text() returns the page text when the PDF has a text layer. The empty-text check is an important real-world safeguard because scanned statements contain only images.",
    },
    {
      title: "Password-Protect Salary Slips",
      scenario: "Before emailing salary slips, each PDF must be protected with the employee's PAN-based password (a common Indian HR practice).",
      steps: [
        "Install: pip install \"pypdf[crypto]\" (adds AES support)",
        "Put slips in slips/ named by employee ID, e.g. E101.pdf",
        "Run: python main.py",
      ],
      code: `from pathlib import Path
from pypdf import PdfReader, PdfWriter

passwords = {"E101": "ABCDE1234F", "E102": "PQRSX5678K"}   # in real life: load from a secure source

out = Path("protected")
out.mkdir(exist_ok=True)
for emp_id, pwd in passwords.items():
    reader = PdfReader(f"slips/{emp_id}.pdf")
    writer = PdfWriter(clone_from=reader)
    writer.encrypt(user_password=pwd, algorithm="AES-256")
    writer.write(out / f"{emp_id}_protected.pdf")
    print("Protected", emp_id)

check = PdfReader(out / "E101_protected.pdf")
print("Encrypted:", check.is_encrypted, "| decrypt result:", check.decrypt("ABCDE1234F").name)
`,
      result: `Protected E101
Protected E102
Encrypted: True | decrypt result: OWNER_PASSWORD`,
      explanation: "PdfWriter(clone_from=reader) copies all pages and document structure. encrypt() with AES-256 needs the cryptography package (installed by the [crypto] extra). decrypt() returns a PasswordType enum (NOT_DECRYPTED, USER_PASSWORD or OWNER_PASSWORD). Here it shows OWNER_PASSWORD because when you do not pass owner_password, pypdf uses the same password for the owner too. Real passwords should come from HR data or a secrets store, never be hardcoded.",
    },
  ],
  interview: [
    { q: "What is the difference between a Paragraph and a Run in python-docx?", a: "A Paragraph is a block of text ending with a paragraph mark and has paragraph-level formatting (style, alignment, spacing). A Run is a continuous piece of text inside a paragraph with the same character formatting (bold, italic, font). One paragraph can contain many runs.", level: "Easy" },
    { q: "Why does replacing paragraph.text lose formatting?", a: "Setting paragraph.text deletes all existing runs and creates one new run with default formatting. To preserve formatting, replace text inside each run, or use a templating library like docxtpl.", level: "Medium" },
    { q: "A placeholder {{name}} is not replaced even though it is visible in Word. Why?", a: "Word may have split the placeholder across multiple runs (for example `{{na` and `me}}`) due to editing history, spell-check or formatting changes. Fix it by retyping the placeholder in one go, clearing formatting, or using docxtpl which merges runs for Jinja2 tags.", level: "Hard" },
    { q: "Can python-docx open .doc files?", a: "No. It supports only the Office Open XML .docx format. Convert .doc to .docx first, for example with LibreOffice headless.", level: "Easy" },
    { q: "How do you merge PDFs with the latest pypdf?", a: "Create a `PdfWriter`, call `writer.append(path)` for each file (optionally with `pages=(start, stop)`), then `writer.write(\"out.pdf\")`. The old PdfMerger class was deprecated and removed in pypdf 5.", level: "Medium" },
    { q: "Why does extract_text() return an empty string for some PDFs?", a: "The PDF is probably scanned: pages are images with no text layer. You need OCR such as pytesseract or OCRmyPDF. Some PDFs also use unusual font encodings that make extraction unreliable.", level: "Medium" },
    { q: "How do you convert a .docx to PDF on a Linux server?", a: "Install LibreOffice and run `soffice --headless --convert-to pdf --outdir out file.docx`, often through subprocess.run(). docx2pdf needs Microsoft Word, so it works only on Windows/macOS.", level: "Medium" },
    { q: "Which library would you use to create a PDF invoice from scratch?", a: "pypdf manipulates existing PDFs but is not designed to draw content. Use reportlab or fpdf2 to draw text, tables and images, or generate HTML and convert with WeasyPrint, or fill a Word template and convert it to PDF.", level: "Medium" },
    { q: "How would you add a watermark to every page of a PDF?", a: "Create a one-page watermark PDF, read it with PdfReader, then loop over the pages of the target and call `page.merge_page(watermark_page)` (or merge_transformed_page for positioning), and write the result with PdfWriter.", level: "Hard" },
    { q: "How do you read all text from a Word file including tables?", a: "Loop over `doc.paragraphs` for body text, and over `doc.tables -> table.rows -> row.cells -> cell.text` for tables. Headers and footers are under `doc.sections[i].header.paragraphs`.", level: "Easy" },
    { q: "How do you protect generated PDFs, and what should you avoid?", a: "Use `writer.encrypt(user_password=..., algorithm=\"AES-256\")` (needs pypdf[crypto]). Avoid hardcoding passwords or sending the password in the same email as the file; load secrets from environment variables or a vault.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a Word document 'meeting_notes.docx' with a heading, today's date, a bullet list of 3 agenda points, and a bold line 'Action items'.",
      hint: "Use add_heading, add_paragraph(style='List Bullet') and add_run().bold.",
      solution: `from datetime import date
from docx import Document

doc = Document()
doc.add_heading("Weekly Team Meeting", level=1)
doc.add_paragraph(f"Date: {date.today():%d %b %Y}")
for item in ["Sprint review", "Client feedback", "Next release plan"]:
    doc.add_paragraph(item, style="List Bullet")
doc.add_paragraph().add_run("Action items").bold = True
doc.save("meeting_notes.docx")
`,
    },
    {
      task: "Write a script that prints every heading (paragraphs whose style name starts with 'Heading') from a .docx file.",
      hint: "para.style.name gives the style name.",
      solution: `from docx import Document

doc = Document("meeting_notes.docx")
for para in doc.paragraphs:
    if para.style.name.startswith("Heading"):
        print(para.style.name, "->", para.text)
`,
    },
    {
      task: "Extract pages 2 to 4 (inclusive, human numbering) of report.pdf into summary.pdf.",
      hint: "Page indexes are 0-based, so human page 2 is index 1.",
      solution: `from pypdf import PdfReader, PdfWriter

reader = PdfReader("report.pdf")
writer = PdfWriter()
for i in range(1, 4):
    writer.add_page(reader.pages[i])
writer.write("summary.pdf")
`,
    },
    {
      task: "Search all PDFs in a folder for the word 'GSTIN' and print the file name and page number where it appears.",
      hint: "Loop files with glob, then enumerate(reader.pages, start=1) and check extract_text().",
      solution: `from pathlib import Path
from pypdf import PdfReader

for pdf in sorted(Path("docs").glob("*.pdf")):
    reader = PdfReader(pdf)
    for num, page in enumerate(reader.pages, start=1):
        if "GSTIN" in (page.extract_text() or ""):
            print(f"{pdf.name}: page {num}")
`,
    },
    {
      task: "Rotate every page of scanned.pdf by 90 degrees clockwise and save it as fixed.pdf.",
      hint: "page.rotate(90) rotates clockwise.",
      solution: `from pypdf import PdfReader, PdfWriter

reader = PdfReader("scanned.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)
    writer.pages[-1].rotate(90)
writer.write("fixed.pdf")
`,
    },
  ],
  quiz: [
    { question: "Which import is correct after pip install python-docx?", options: ["import python_docx", "from docx import Document", "from pydocx import Document", "import word"], answer: 1, explanation: "The package name is python-docx but the import name is docx." },
    { question: "In python-docx, what is a Run?", options: ["A whole page", "A table row", "A piece of text inside a paragraph with the same formatting", "A saved document"], answer: 2, explanation: "Runs hold character formatting such as bold or font size." },
    { question: "Which pypdf class is used to merge PDFs in pypdf 5 and later?", options: ["PdfMerger", "PdfWriter", "PdfJoiner", "PdfFileMerger"], answer: 1, explanation: "PdfMerger was removed; PdfWriter.append() replaces it." },
    { question: "What is reader.pages[0]?", options: ["The last page", "The first page", "The page count", "The document metadata"], answer: 1, explanation: "Pages are indexed from 0, so index 0 is page 1." },
    { question: "extract_text() returns an empty string. What is the most likely reason?", options: ["The PDF is encrypted with AES", "The PDF is scanned and has no text layer", "pypdf cannot read PDFs over 1 page", "The file name has spaces"], answer: 1, explanation: "Scanned PDFs are images; they need OCR." },
    { question: "Which tool converts .docx to PDF on a Linux server without Microsoft Word?", options: ["docx2pdf", "pypdf", "LibreOffice headless (soffice --convert-to pdf)", "openpyxl"], answer: 2, explanation: "docx2pdf needs Word; LibreOffice runs headless on Linux." },
  ],
};
