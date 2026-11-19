export default {
  lesson: 'day-114-unit-testing-xunit-nunit-moq',
  minutes: 35,
  intro: 'Write unit tests with xUnit ([Fact], [Theory], Assert), know the NUnit equivalents, follow Arrange-Act-Assert and isolate services with Moq.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the xUnit attribute for a test that runs **several times with different data**:\n```\n[______]\n[InlineData(85, "A")]\n[InlineData(65, "B")]\n[InlineData(30, "F")]\npublic void GetGrade_ReturnsExpected(int marks, string expected) { ... }\n```',
      example: { title: 'a single test', code: '[Fact]\npublic void Add_TwoNumbers_ReturnsSum() { ... }' },
      accept: ['Theory'],
      caseSensitive: true,
      explain: '`[Fact]` = one test with no parameters; `[Theory]` + `[InlineData]` = one test method run once per data row. NUnit uses `[Test]` and `[TestCase(85, "A")]` for the same ideas.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The test runner executes these 4 test cases against the method. Type `Passed` or `Failed` for each case in order, then the summary line `Total: 4, Passed: X, Failed: Y`.',
      example: { title: 'Arrange-Act-Assert', code: '// Arrange\nvar calc = new FeeCalculator();\n// Act\nvar fee = calc.Total(1000, 10);\n// Assert\nAssert.Equal(900, fee);' },
      code: `public string GetGrade(int marks) =>
    marks >= 80 ? "A" : marks > 60 ? "B" : marks >= 40 ? "C" : "F";

[Theory]
[InlineData(85, "A")]
[InlineData(60, "B")]
[InlineData(40, "C")]
[InlineData(39, "F")]
public void GetGrade_ReturnsExpected(int marks, string expected)
{
    var result = new GradeService().GetGrade(marks);
    Assert.Equal(expected, result);
}`,
      expected: `Passed
Failed
Passed
Passed
Total: 4, Passed: 3, Failed: 1`,
      explain: '60 is not `> 60`, so it returns "C" and the case expecting "B" fails - exactly the **boundary bug** that data-driven tests are good at catching. Always test the edges (39/40, 60/61, 79/80).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'With Moq, make the fake repository return a student for id 1. Complete the missing method:\n```\nvar repo = new Mock<IStudentRepository>();\nrepo.______(r => r.GetById(1)).Returns(new Student { Id = 1, Name = "Asha" });\nvar service = new StudentService(repo.Object);\n```',
      example: { title: 'verifying a call', code: 'repo.Verify(r => r.Delete(5), Times.Once);' },
      accept: ['Setup'],
      caseSensitive: true,
      explain: '`Setup(...).Returns(...)` defines the fake behaviour; `repo.Object` is the instance you inject; `Verify` checks that a method was called. The service is tested **without a database**.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about unit tests are TRUE? (choose all that apply)',
      options: [
        'A unit test checks one small unit (a method/class) in isolation, fast and without real databases or networks',
        'Test names like MethodName_Scenario_ExpectedResult make failures easy to understand',
        'Assert.Throws<ArgumentException>(() => service.Withdraw(-5)) checks that an exception is thrown',
        'Unit tests should depend on the order in which they run',
        'xUnit creates a new instance of the test class for every test',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Good unit tests are fast, isolated, repeatable and independent. xUnit creates a fresh test class per test so state cannot leak between tests (use the constructor for shared Arrange code).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Make the tests pass (TDD).** Implement `calculateFee(baseFee, { isScholar, siblingCount })`:\n- scholars get **50%** off\n- otherwise each sibling studying gives **10%** off, maximum **30%**\n- result rounded to the nearest rupee; throw `Error("Invalid fee")` if `baseFee <= 0`',
      example: { title: 'capping a value', code: 'const discount = Math.min(siblings * 10, 30);' },
      starter: 'function calculateFee(baseFee, { isScholar = false, siblingCount = 0 } = {}) {\n  // TODO\n}\n',
      solution: 'function calculateFee(baseFee, { isScholar = false, siblingCount = 0 } = {}) {\n  if (baseFee <= 0) throw new Error("Invalid fee");\n  const discount = isScholar ? 50 : Math.min(siblingCount * 10, 30);\n  return Math.round(baseFee * (100 - discount) / 100);\n}\n',
      tests: [
        { call: 'calculateFee(10000, { isScholar: true, siblingCount: 2 })', expect: 5000, msg: 'Scholars pay 50%' },
        { call: 'calculateFee(10000, { siblingCount: 2 })', expect: 8000, msg: '2 siblings → 20% off' },
        { call: 'calculateFee(10000, { siblingCount: 5 })', expect: 7000, msg: 'Sibling discount is capped at 30%' },
        { call: 'calculateFee(4999, {})', expect: 4999 },
        { call: '(() => { try { calculateFee(0, {}); return "no error"; } catch (e) { return e.message; } })()', expect: 'Invalid fee', msg: 'A fee <= 0 must throw Error("Invalid fee")' },
      ],
      explain: 'Each test is one business rule; together they are a specification. In C# these would be `[Theory]` rows plus `Assert.Throws<ArgumentException>`. Writing the tests first forces you to think about edge cases (the cap, zero) before coding.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**A hand-made mock.** Write `createMockRepo(students)` returning an object with `getById(id)` (returns the matching student or `null`) and `calls` - an array that records every call as `"getById(<id>)"`. Then write `getStudentName(repo, id)` that returns the name or `"Unknown"`.',
      example: { title: 'recording calls', code: 'const spy = { calls: [], save(x) { this.calls.push("save(" + x + ")"); } };' },
      starter: 'function createMockRepo(students) {\n  // TODO\n}\n\nfunction getStudentName(repo, id) {\n  // TODO\n}\n',
      solution: 'function createMockRepo(students) {\n  const calls = [];\n  return {\n    calls,\n    getById(id) {\n      calls.push("getById(" + id + ")");\n      return students.find((s) => s.id === id) || null;\n    },\n  };\n}\n\nfunction getStudentName(repo, id) {\n  const s = repo.getById(id);\n  return s ? s.name : "Unknown";\n}\n',
      tests: [
        { call: '(() => { const r = createMockRepo([{ id: 1, name: "Asha" }]); return [getStudentName(r, 1), getStudentName(r, 7), r.calls]; })()', expect: ['Asha', 'Unknown', ['getById(1)', 'getById(7)']], msg: 'Return names / "Unknown" and record each call' },
      ],
      explain: 'This is what Moq generates for you: `Setup` = the canned data, `Verify` = checking `calls`. Testing `getStudentName` against a mock proves the logic works no matter what the real database contains.',
    },
  ],
};
