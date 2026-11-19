export default {
  lesson: 'day-19-file-uploads-media',
  minutes: 30,
  intro: 'Practise FileField/ImageField, upload_to, request.FILES and enctype, size/extension validation and media serving, and write the upload checks in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A photo upload form submits but `request.FILES` is always empty. What is the most likely cause?',
      options: ['MEDIA_ROOT is missing', 'The <form> is missing enctype="multipart/form-data" (or method="post")', 'Pillow is not installed', 'The image is too small'],
      answer: 1,
      explain: 'Without `enctype="multipart/form-data"` the browser sends only the file **name** as text, so `request.FILES` is empty. Also pass files to the form: `StudentForm(request.POST, request.FILES)`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the field so photos are stored under `media/students/photos/` and the field is optional:\n\n```\nclass Student(models.Model):\n    photo = models.ImageField(______, blank=True)\n```',
      accept: ["upload_to='students/photos/'", 'upload_to="students/photos/"', "upload_to='students/photos'", 'upload_to="students/photos"'],
      explain: '`upload_to` is a folder **relative to MEDIA_ROOT** (it can also be a function or contain date codes like `%Y/%m/`). The database only stores the relative path; `student.photo.url` gives `MEDIA_URL + path`. ImageField needs Pillow.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'In development, urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) serves uploads',
        'In production, media is usually served by Nginx or a storage service like S3',
        'FileExtensionValidator(["pdf"]) checks the extension of an uploaded file',
        'Deleting a model instance automatically deletes its file from disk',
        'Never trust the uploaded file name - Django cleans it and adds a suffix when a name already exists',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The `static()` helper only works with DEBUG=True. Deleting a row does **not** remove the file - clean up with a signal or a periodic job. Django sanitises file names and avoids overwriting by adding a random suffix.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `validate_upload(name, size, kind)` that returns a list of error messages (empty = OK):\n- `kind == \'photo\'`: extensions `jpg, jpeg, png` and max 2 MB\n- `kind == \'document\'`: extensions `pdf, docx` and max 5 MB\n- wrong extension → `f\'File extension “{ext}” is not allowed. Allowed extensions are: {list}.\'` where `{list}` is the allowed extensions joined with `\', \'` (ext lower-case, without the dot; a name without `.` has ext `\'\'`)\n- too large → `f\'File too large. Maximum size is {mb} MB.\'`\n(1 MB = 1024 × 1024 bytes)',
      example: { title: 'a size validator in Django', code: "def validate_size(f):\n    if f.size > 2 * 1024 * 1024:\n        raise ValidationError('File too large. Maximum size is 2 MB.')" },
      starter: `def validate_upload(name, size, kind):
    errors = []
    # TODO
    return errors
`,
      solution: `RULES = {'photo': (['jpg', 'jpeg', 'png'], 2), 'document': (['pdf', 'docx'], 5)}

def validate_upload(name, size, kind):
    errors = []
    allowed, mb = RULES[kind]
    ext = name.rsplit('.', 1)[1].lower() if '.' in name else ''
    if ext not in allowed:
        errors.append(f'File extension “{ext}” is not allowed. Allowed extensions are: {", ".join(allowed)}.')
    if size > mb * 1024 * 1024:
        errors.append(f'File too large. Maximum size is {mb} MB.')
    return errors
`,
      tests: [
        { call: "validate_upload('asha.JPG', 500000, 'photo')", expect: [] },
        { call: "validate_upload('asha.gif', 500000, 'photo')", expect: ['File extension “gif” is not allowed. Allowed extensions are: jpg, jpeg, png.'] },
        { call: "validate_upload('marksheet.pdf', 6 * 1024 * 1024, 'document')", expect: ['File too large. Maximum size is 5 MB.'] },
        { call: "validate_upload('virus', 3 * 1024 * 1024, 'photo')", expect: ['File extension “” is not allowed. Allowed extensions are: jpg, jpeg, png.', 'File too large. Maximum size is 2 MB.'] },
        { call: "validate_upload('photo.final.png', 2 * 1024 * 1024, 'photo')", expect: [], msg: 'Exactly 2 MB is allowed; use the LAST dot for the extension' },
      ],
      explain: 'The wording matches Django\'s `FileExtensionValidator`. Use the **last** dot (`photo.final.png` → png) and lower-case it. Checking the extension alone is not proof of the content - ImageField also opens the file with Pillow to make sure it is a real image.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `upload_path(instance, filename)` - a function for `upload_to=` that stores files as `students/<roll_no>/<slug>.<ext>`: `instance` is a dict with `roll_no`; `slug` is the original file name **without extension**, lower-case, with every run of characters that are not `a-z0-9` replaced by a single `-` and trimmed of `-`; ext is lower-case.',
      example: { title: 'regex replace', code: "import re\nprint(re.sub(r'[^a-z0-9]+', '-', 'my photo (1)').strip('-'))   # my-photo-1" },
      starter: `import re

def upload_path(instance, filename):
    # TODO
    return filename
`,
      solution: `import re

def upload_path(instance, filename):
    base, _, ext = filename.rpartition('.')
    slug = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')
    return f"students/{instance['roll_no']}/{slug}.{ext.lower()}"
`,
      tests: [
        { call: "upload_path({'roll_no': 'CS001'}, 'Asha Photo (Final).JPG')", expect: 'students/CS001/asha-photo-final.jpg' },
        { call: "upload_path({'roll_no': 'IT002'}, '12th_marksheet.pdf')", expect: 'students/IT002/12th-marksheet.pdf' },
      ],
      explain: '`upload_to` can be a function `(instance, filename)` returning the path relative to MEDIA_ROOT. Grouping by roll number keeps folders tidy, and slugifying removes spaces and odd characters that break URLs.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django import forms
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.validators import FileExtensionValidator

class ReceiptForm(forms.Form):
    receipt = forms.FileField(validators=[FileExtensionValidator(['pdf'])])

ok = ReceiptForm({}, {'receipt': SimpleUploadedFile('fee.pdf', b'%PDF-1.4 data')})
print(ok.is_valid(), ok.cleaned_data['receipt'].name, ok.cleaned_data['receipt'].size)
bad = ReceiptForm({}, {'receipt': SimpleUploadedFile('fee.exe', b'MZ')})
print(bad.is_valid(), bad.errors['receipt'][0])
print(ReceiptForm({}, {}).is_valid())`,
      expected: 'True fee.pdf 13\nFalse File extension “exe” is not allowed. Allowed extensions are: pdf.\nFalse',
      explain: 'Files are passed as the **second** argument (like `request.FILES`). The validator checks the extension; a missing required file fails validation too. `SimpleUploadedFile` is also how you fake uploads in tests.',
    },
  ],
};
