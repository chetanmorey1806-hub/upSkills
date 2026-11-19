export default {
  lesson: 'day-07-pydantic-v2-validation-settings',
  minutes: 30,
  intro: 'Understand Pydantic v2: BaseModel, Field constraints, validators, model_dump/model_validate and pydantic-settings. The hands-on tasks build the same validation ideas with plain Python dataclasses so you see what Pydantic does for you.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why do we need runtime validation if the code already has type hints?',
      options: ['Type hints are checked by Python when the program runs', 'Type hints are NOT enforced at runtime; data from JSON, forms or env vars can still be wrong', 'Pydantic makes code run faster', 'Type hints only work in Python 2'],
      answer: 1,
      explain: 'Hints help editors and mypy, but `age: int` does not stop `"twenty"` arriving from an API request. Pydantic reads the hints and validates/converts real data at runtime, raising a clear `ValidationError`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are correct **Pydantic v2** APIs? (choose all that apply)',
      options: ['`user.model_dump()` → dict', '`User.model_validate(data)` → parse a dict', '`user.model_dump_json()` → JSON string', '`user.dict()` is the recommended v2 method', '`@field_validator("email")` for one field\'s custom rule', '`@model_validator(mode="after")` for rules across several fields'],
      answers: [0, 1, 2, 4, 5],
      explain: 'v2 renamed the methods with a `model_` prefix: `.dict()` → `model_dump()`, `.json()` → `model_dump_json()`, `parse_obj()` → `model_validate()`. The old names still exist but are deprecated.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'In Pydantic v2 "lax" mode, `class Item(BaseModel): qty: int; price: float`. What does this plain-Python imitation of its conversion print?',
      code: `def coerce_int(v):
    if isinstance(v, bool):
        raise TypeError
    if isinstance(v, str) and v.strip().lstrip("-").isdigit():
        return int(v)
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, int):
        return v
    raise ValueError("Input should be a valid integer")

for v in ["5", 7.0, 3]:
    print(coerce_int(v))
try:
    coerce_int("2.5")
except ValueError as e:
    print(e)`,
      expected: '5\n7\n3\nInput should be a valid integer',
      explain: 'In lax mode Pydantic converts "5" and 7.0 to int because no information is lost, but rejects "2.5" (it would lose the .5). `strict=True` turns conversion off. The message matches the one Pydantic shows.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Build a mini validator with a dataclass (what Pydantic does for you). `Student` has `name: str`, `age: int`, `email: str`. Write `parse_student(data)` that:\n- converts `age` with `int()` (strings like "21" allowed)\n- collects ALL errors as strings in a list:\n  - `"name: required"` if name is missing/blank\n  - `"age: must be an integer"` if conversion fails, else `"age: must be between 16 and 60"`\n  - `"email: invalid"` if it has no `@` or no `.` after the `@`\n- returns `Student(...)` if valid, otherwise the list of errors\n\nThe name is stripped and title-cased (like a `field_validator`).',
      example: { title: 'the Pydantic version (for comparison)', code: 'class Student(BaseModel):\n    name: str = Field(min_length=1)\n    age: int = Field(ge=16, le=60)\n    email: EmailStr\n\n    @field_validator("name")\n    @classmethod\n    def clean(cls, v): return v.strip().title()' },
      starter: 'from dataclasses import dataclass\n\n@dataclass\nclass Student:\n    name: str\n    age: int\n    email: str\n\ndef parse_student(data):\n    errors = []\n    # TODO\n    return errors\n',
      solution: 'from dataclasses import dataclass\n\n@dataclass\nclass Student:\n    name: str\n    age: int\n    email: str\n\ndef parse_student(data):\n    errors = []\n    name = str(data.get("name", "")).strip()\n    if not name:\n        errors.append("name: required")\n    age = None\n    try:\n        age = int(data.get("age"))\n        if not 16 <= age <= 60:\n            errors.append("age: must be between 16 and 60")\n    except (TypeError, ValueError):\n        errors.append("age: must be an integer")\n    email = str(data.get("email", ""))\n    local, at, domain = email.partition("@")\n    if not (local and at and "." in domain):\n        errors.append("email: invalid")\n    if errors:\n        return errors\n    return Student(name.title(), age, email)\n',
      tests: [
        { call: 'vars(parse_student({"name": "  asha patil ", "age": "21", "email": "asha@mail.in"}))', expect: { name: 'Asha Patil', age: 21, email: 'asha@mail.in' }, msg: 'Valid data → Student object (compared by fields)' },
        { call: 'parse_student({"name": "", "age": "abc", "email": "bad"})', expect: ['name: required', 'age: must be an integer', 'email: invalid'] },
        { call: 'parse_student({"name": "Ravi", "age": 12, "email": "r@x.com"})', expect: ['age: must be between 16 and 60'] },
        { call: 'parse_student({"name": "Om", "email": "om@site"})', expect: ['age: must be an integer', 'email: invalid'] },
      ],
      explain: 'Reporting every error at once (like Pydantic\'s ValidationError) is far friendlier for API clients than failing on the first one. Pydantic gives you this, plus type conversion and JSON schema, from just the class definition.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Imitate **pydantic-settings**. Write `load_settings(env)` that builds a `Settings` dataclass from an env dict, using the prefix `APP_` and case-insensitive keys:\n- `APP_NAME` → `app_name` (default `"UpSkillr"`)\n- `APP_PORT` → `port` int (default 8000)\n- `APP_DEBUG` → `debug` bool from `"1"`/`"true"`/`"yes"` (default False)\n- `APP_ADMINS` → `admins` list split on commas (default empty list)',
      example: { title: 'the pydantic-settings version', code: 'class Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")\n    app_name: str = "UpSkillr"\n    port: int = 8000' },
      starter: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Settings:\n    app_name: str = "UpSkillr"\n    port: int = 8000\n    debug: bool = False\n    admins: list = field(default_factory=list)\n\ndef load_settings(env):\n    # TODO\n    return Settings()\n',
      solution: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Settings:\n    app_name: str = "UpSkillr"\n    port: int = 8000\n    debug: bool = False\n    admins: list = field(default_factory=list)\n\ndef load_settings(env):\n    e = {k.upper(): v for k, v in env.items()}\n    s = Settings()\n    if "APP_NAME" in e:\n        s.app_name = e["APP_NAME"]\n    if "APP_PORT" in e:\n        s.port = int(e["APP_PORT"])\n    if "APP_DEBUG" in e:\n        s.debug = e["APP_DEBUG"].lower() in ("1", "true", "yes")\n    if "APP_ADMINS" in e:\n        s.admins = [a.strip() for a in e["APP_ADMINS"].split(",") if a.strip()]\n    return s\n',
      tests: [
        { call: 'vars(load_settings({}))', expect: { app_name: 'UpSkillr', port: 8000, debug: false, admins: [] } },
        { call: 'vars(load_settings({"APP_PORT": "9000", "app_debug": "TRUE", "APP_ADMINS": "asha, ravi"}))', expect: { app_name: 'UpSkillr', port: 9000, debug: true, admins: ['asha', 'ravi'] } },
        { call: 'load_settings({"PORT": "1"}).port', expect: 8000, msg: 'Only variables with the APP_ prefix are used' },
      ],
      explain: 'A typed settings object fails at start-up if, say, `APP_PORT=abc`, and the rest of the code reads `settings.port` as a real int. `field(default_factory=list)` avoids one shared mutable default list between instances.',
    },
  ],
};
