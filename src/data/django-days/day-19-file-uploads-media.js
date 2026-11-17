export default {
  id: 'day-19-file-uploads-media',
  title: 'File Uploads (ImageField), Media Handling',
  module: 'Module 3: Forms & Views',
  day: 19,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Let students upload a profile photo and documents in the Student Portal using FileField and ImageField, configure MEDIA_ROOT and MEDIA_URL, validate size and type, and serve media in development.',
  objectives: [
    'Configure MEDIA_ROOT and MEDIA_URL and serve media files in development',
    'Add FileField and ImageField (with Pillow) to models and use upload_to',
    'Handle uploads with request.FILES and enctype="multipart/form-data"',
    'Validate file size and extension with validators',
    'Delete or replace old files and understand production media storage',
  ],
  theory: [
    {
      heading: 'Static files vs media files',
      content: 'Static files (CSS, JS, logos) are written by developers and shipped with the code. Media files are uploaded by users at runtime: profile photos, assignments, certificates. Think of static files as the school building and media files as the papers students hand in every day.',
      points: [
        'STATIC_URL / STATIC_ROOT -> developer files, collected by collectstatic',
        'MEDIA_URL / MEDIA_ROOT -> user uploads, saved by Django storage',
        'The database stores only the file PATH (a string), not the file bytes',
      ],
      syntax: `# settings.py
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"`,
    },
    {
      heading: 'FileField and ImageField',
      content: 'FileField accepts any file. ImageField is a FileField that also checks the file is a valid image (it needs the Pillow library: pip install Pillow). upload_to decides the sub-folder; it can be a string with date format codes or a function that returns a path.',
      syntax: `photo = models.ImageField(upload_to="students/photos/%Y/%m/", blank=True, null=True)
resume = models.FileField(upload_to="students/docs/")

def student_doc_path(instance, filename):
    return f"students/{instance.roll_no}/{filename}"`,
      tip: 'If two users upload "photo.jpg", Django adds a random suffix (photo_a1B2c3.jpg) instead of overwriting.',
    },
    {
      heading: 'Uploading from a form: request.FILES and enctype',
      content: 'Browsers only send file bytes when the form has method="post" and enctype="multipart/form-data". In the view, files arrive in request.FILES, separate from request.POST. A ModelForm must receive both: StudentForm(request.POST, request.FILES). Generic CreateView/UpdateView pass request.FILES automatically.',
      points: [
        'Forgot enctype -> form says "This field is required" even though you chose a file',
        'Forgot request.FILES in an FBV -> same error',
        'uploaded_file.name, .size (bytes), .content_type, .chunks()',
      ],
    },
    {
      heading: 'Validation: size and extension',
      content: 'Never trust uploads. Limit the size and allowed extensions. Django provides FileExtensionValidator; size checks are written as a small custom validator. ImageField already rejects files that Pillow cannot open as images.',
      syntax: `from django.core.validators import FileExtensionValidator

def validate_max_2mb(f):
    if f.size > 2 * 1024 * 1024:
        raise ValidationError("File too large (max 2 MB).")

resume = models.FileField(upload_to="docs/", validators=[FileExtensionValidator(["pdf"]), validate_max_2mb])`,
      tip: 'Extension checks are not a full security check. Never serve uploaded HTML/SVG from your main domain, and never execute uploaded files.',
    },
    {
      heading: 'Serving media in development and production',
      content: 'With DEBUG=True add static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) to urlpatterns. In production Django should NOT serve media: Nginx serves the media folder, or you use cloud storage like Amazon S3 via django-storages. Also note that deleting a model row does not delete its file; you must call field.delete() or use a signal.',
      points: [
        'Template: <img src="{{ student.photo.url }}">',
        'Guard empty files: {% if student.photo %}...{% endif %}',
        'Django 5 setting STORAGES = {"default": {...}, "staticfiles": {...}} replaces DEFAULT_FILE_STORAGE',
      ],
    },
  ],
  examples: [
    {
      title: 'Settings, model and URLs for photo upload',
      scenario: 'Add a profile photo and an ID-proof PDF to the Student model.',
      steps: [
        'Install Pillow: pip install Pillow (VS Code terminal or PyCharm Terminal tab), then pip freeze > requirements.txt',
        'Edit portal/settings.py to add MEDIA_URL and MEDIA_ROOT',
        'Add photo and id_proof fields to Student in students/models.py',
        'Run python manage.py makemigrations students and python manage.py migrate',
        'Update portal/urls.py to serve media when DEBUG is True',
      ],
      code: `# Project tree
student_portal/
├── manage.py
├── media/                  # created automatically on first upload
├── portal/
│   ├── settings.py
│   └── urls.py
└── students/
    ├── models.py
    ├── validators.py
    └── ...

# portal/settings.py
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# students/validators.py
from django.core.exceptions import ValidationError


def validate_file_size(f):
    limit_mb = 2
    if f.size > limit_mb * 1024 * 1024:
        raise ValidationError(f"Max file size is {limit_mb} MB.")


# students/models.py
from django.core.validators import FileExtensionValidator
from .validators import validate_file_size


def id_proof_path(instance, filename):
    return f"students/{instance.roll_no}/id/{filename}"


class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name="students")
    is_active = models.BooleanField(default=True)
    photo = models.ImageField(upload_to="students/photos/%Y/", blank=True, null=True,
                              validators=[validate_file_size])
    id_proof = models.FileField(upload_to=id_proof_path, blank=True,
                                validators=[FileExtensionValidator(["pdf"]), validate_file_size])


# portal/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("students.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# requirements.txt
Django>=5.0,<6.0
Pillow>=10.0
mysqlclient>=2.2`,
      result: 'Migration 0005_student_photo_student_id_proof is created. An uploaded photo is saved to media/students/photos/2026/asha.jpg and is visible at http://127.0.0.1:8000/media/students/photos/2026/asha.jpg.',
      explanation: 'The database column stores only "students/photos/2026/asha.jpg". MEDIA_ROOT is where the bytes go, MEDIA_URL is how browsers reach them.',
    },
    {
      title: 'Upload form with UpdateView and display the photo',
      scenario: 'A student edits their profile and uploads a photo; the detail page shows it.',
      steps: [
        'Add photo and id_proof to StudentForm fields',
        'Make sure the template form has enctype="multipart/form-data"',
        'Show the image in student_detail.html with a fallback',
        'Run the server and upload a JPG, then try a 5 MB file to see the error',
      ],
      code: `# students/forms.py
class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["name", "roll_no", "email", "course", "photo", "id_proof"]
        widgets = {
            "photo": forms.ClearableFileInput(attrs={"accept": "image/*"}),
            "id_proof": forms.ClearableFileInput(attrs={"accept": "application/pdf"}),
        }


# students/views.py  (UpdateView passes request.FILES for you)
class StudentUpdateView(SuccessMessageMixin, UpdateView):
    model = Student
    form_class = StudentForm
    success_message = "Profile of %(name)s updated."

<!-- templates/students/student_form.html -->
<form method="post" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">Save</button>
</form>

<!-- templates/students/student_detail.html -->
{% if student.photo %}
  <img src="{{ student.photo.url }}" alt="{{ student.name }}" width="150">
{% else %}
  {% load static %}<img src="{% static 'img/avatar.png' %}" width="150">
{% endif %}
{% if student.id_proof %}
  <a href="{{ student.id_proof.url }}">Download ID proof (PDF)</a>
{% endif %}`,
      result: 'Uploading asha.jpg shows the photo on the detail page. Uploading notes.txt as id_proof shows "File extension txt is not allowed. Allowed extensions are: pdf." A 5 MB photo shows "Max file size is 2 MB."',
      explanation: 'ClearableFileInput also gives a "Clear" checkbox in UpdateView so users can remove a file. The accept attribute only filters the file picker; the server validators do the real checking.',
    },
    {
      title: 'Function-based upload and replacing old files',
      scenario: 'A separate page lets a student change only their photo, and the old photo file is deleted from disk.',
      steps: [
        'Create PhotoForm in forms.py',
        'Write change_photo view that uses request.FILES',
        'Delete the old file after saving the new one',
        'Add a URL and test in the browser',
      ],
      code: `# students/forms.py
class PhotoForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["photo"]


# students/views.py
def change_photo(request, pk):
    student = get_object_or_404(Student, pk=pk)
    old_photo = student.photo.name if student.photo else None

    if request.method == "POST":
        form = PhotoForm(request.POST, request.FILES, instance=student)
        if form.is_valid():
            form.save()
            if old_photo and old_photo != student.photo.name:
                student.photo.storage.delete(old_photo)
            messages.success(request, "Photo changed.")
            return redirect(student)
    else:
        form = PhotoForm(instance=student)
    return render(request, "students/change_photo.html", {"form": form, "student": student})


# Saving a file manually (e.g. generated certificate)
from django.core.files.base import ContentFile
student.id_proof.save("certificate.pdf", ContentFile(pdf_bytes), save=True)`,
      result: 'After uploading a new photo, media/ contains only the new file; the old file was removed from disk.',
      explanation: 'Django never deletes old files automatically. We remember the old name, save the new file, then delete the old one with the storage API so it also works with S3.',
    },
    {
      title: 'Pure Python demo: validating an upload',
      scenario: 'Practise the same validation logic Django validators perform, without Django.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `ALLOWED = {"jpg", "jpeg", "png", "pdf"}
MAX_BYTES = 2 * 1024 * 1024

def validate(name, size):
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED:
        return f"{name}: rejected (extension '{ext}' not allowed)"
    if size > MAX_BYTES:
        return f"{name}: rejected ({size / 1024 / 1024:.1f} MB > 2 MB)"
    return f"{name}: accepted"

uploads = [("asha.JPG", 350_000), ("notes.txt", 1200), ("scan.pdf", 5_500_000), ("README", 10)]
for name, size in uploads:
    print(validate(name, size))`,
      python: {
        files: {
          'main.py': `ALLOWED = {"jpg", "jpeg", "png", "pdf"}
MAX_BYTES = 2 * 1024 * 1024

def validate(name, size):
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED:
        return f"{name}: rejected (extension '{ext}' not allowed)"
    if size > MAX_BYTES:
        return f"{name}: rejected ({size / 1024 / 1024:.1f} MB > 2 MB)"
    return f"{name}: accepted"

uploads = [("asha.JPG", 350_000), ("notes.txt", 1200), ("scan.pdf", 5_500_000), ("README", 10)]
for name, size in uploads:
    print(validate(name, size))`,
        },
      },
      result: `asha.JPG: accepted
notes.txt: rejected (extension 'txt' not allowed)
scan.pdf: rejected (5.2 MB > 2 MB)
README: rejected (extension '' not allowed)`,
      explanation: 'Extensions are compared in lower case and size is in bytes, the same as UploadedFile.size in Django.',
    },
  ],
  interview: [
    { q: 'Difference between static files and media files?', a: 'Static files are part of the code (CSS, JS, images) and collected with collectstatic. Media files are uploaded by users at runtime and saved under MEDIA_ROOT.', level: 'Easy' },
    { q: 'What library does ImageField need?', a: 'Pillow. Without it, system checks fail with fields.E210.', level: 'Easy' },
    { q: 'Why does my file upload say "This field is required" even after selecting a file?', a: 'The form is missing enctype="multipart/form-data" or the view did not pass request.FILES to the form.', level: 'Medium' },
    { q: 'What is stored in the database for a FileField?', a: 'Only the relative path (a varchar, default max_length 100), not the file contents.', level: 'Easy' },
    { q: 'What does upload_to accept?', a: 'A string (can include strftime codes like %Y/%m) or a callable(instance, filename) returning the path.', level: 'Medium' },
    { q: 'Does deleting a model instance delete its file?', a: 'No. You must delete it yourself, e.g. instance.photo.delete(save=False) in a post_delete signal or use a package like django-cleanup.', level: 'Medium' },
    { q: 'How are media files served in production?', a: 'Not by Django. Use Nginx to serve MEDIA_ROOT or a cloud storage backend (S3, GCS) via django-storages configured in STORAGES.', level: 'Medium' },
    { q: 'How do you validate file size?', a: 'Write a validator function that checks file.size and raises ValidationError, and add it to the field\'s validators or a form clean_<field> method.', level: 'Easy' },
    { q: 'What are FILE_UPLOAD_MAX_MEMORY_SIZE and DATA_UPLOAD_MAX_MEMORY_SIZE?', a: 'FILE_UPLOAD_MAX_MEMORY_SIZE (default 2.5 MB) decides when an upload is streamed to a temp file instead of memory. DATA_UPLOAD_MAX_MEMORY_SIZE limits the non-file request body size.', level: 'Hard' },
    { q: 'What security risks do uploads have?', a: 'Large files (DoS), malicious types (HTML/SVG with scripts, executables), path traversal in names, and serving private files publicly. Validate, limit size, store outside code, and serve from a separate domain or with access control.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Course banner ImageField saved under courses/banners/.',
      hint: 'upload_to string, blank=True.',
      solution: `class Course(models.Model):
    name = models.CharField(max_length=100)
    banner = models.ImageField(upload_to="courses/banners/", blank=True)`,
    },
    {
      task: 'Write a post_delete signal that removes a student photo from disk.',
      hint: 'receiver(post_delete, sender=Student).',
      solution: `from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=Student)
def delete_photo(sender, instance, **kwargs):
    if instance.photo:
        instance.photo.delete(save=False)`,
    },
    {
      task: 'Create an Assignment model with a PDF-only file, max 5 MB.',
      hint: 'FileExtensionValidator plus a size validator.',
      solution: `def max_5mb(f):
    if f.size > 5 * 1024 * 1024:
        raise ValidationError("Max 5 MB")

class Assignment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    file = models.FileField(upload_to="assignments/", validators=[FileExtensionValidator(["pdf"]), max_5mb])`,
    },
    {
      task: 'In a template, show "No photo" if the student has no photo.',
      hint: 'Test the field in {% if %}.',
      solution: `{% if student.photo %}<img src="{{ student.photo.url }}">{% else %}No photo{% endif %}`,
    },
  ],
  quiz: [
    { question: 'Which form attribute is required for file uploads?', options: ['method="get"', 'action="upload"', 'enctype="multipart/form-data"', 'type="file-form"'], answer: 2, explanation: 'Without multipart encoding the browser does not send file bytes.' },
    { question: 'Uploaded files are available in:', options: ['request.FILES', 'request.POST', 'request.GET', 'request.body only'], answer: 0, explanation: 'Files are separated into request.FILES.' },
    { question: 'ImageField requires which package?', options: ['NumPy', 'OpenCV', 'requests', 'Pillow'], answer: 3, explanation: 'Pillow is used to verify images.' },
    { question: 'In development, media files are served by adding:', options: ['collectstatic', 'static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)', 'whitenoise', 'nothing, it is automatic'], answer: 1, explanation: 'The static() helper adds URL patterns only when DEBUG is True.' },
    { question: 'What does the database store for an ImageField?', options: ['Image bytes', 'Base64 text', 'The relative file path', 'Image width only'], answer: 2, explanation: 'Only the path string is stored.' },
  ],
};
