export default {
  lesson: 'day-07-mockito-tdd',
  minutes: 24,
  intro: 'Stub and verify dependencies with Mockito, capture arguments and follow the TDD red-green-refactor cycle.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between a Mockito **mock** and a **spy**?',
      options: [
        'There is no difference',
        'A mock is a fake whose methods do nothing/return defaults unless stubbed; a spy wraps a real object and calls the real methods unless stubbed',
        'A spy cannot be verified',
        'A mock calls the real database',
      ],
      answer: 1,
      explain: '`mock(Repo.class)` = empty fake. `spy(realObject)` = real behaviour with the option to override some methods. Mocks are used much more often; spies are useful for legacy code.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Stub the repository so `findById(1L)` returns the student `asha` wrapped in an Optional:\n```\n???\n```',
      example: { title: 'stubbing an exception', code: 'when(repo.findById(99L)).thenThrow(new RuntimeException("DB down"));' },
      accept: ['when(repo.findById(1L)).thenReturn(Optional.of(asha));', 'when(repo.findById(1L)).thenReturn(Optional.of(asha))', 'Mockito.when(repo.findById(1L)).thenReturn(Optional.of(asha));', 'doReturn(Optional.of(asha)).when(repo).findById(1L);', 'given(repo.findById(1L)).willReturn(Optional.of(asha));'],
      explain: '`when(call).thenReturn(value)` - the return type must match, so wrap it: `Optional.of(asha)`. Returning `asha` directly does not compile. BDD style `given(...).willReturn(...)` is the same thing.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (one value per line)',
      example: { title: 'consecutive stubbing', text: 'thenReturn(a, b) returns a on the first call, b on the second, and keeps returning the LAST value afterwards.' },
      code: `Dice dice = mock(Dice.class);
when(dice.roll()).thenReturn(3, 5);

System.out.println(dice.roll());
System.out.println(dice.roll());
System.out.println(dice.roll());
System.out.println(dice.sides());   // not stubbed, returns int`,
      expected: '3\n5\n5\n0',
      explain: 'Consecutive values 3, 5, then the last value repeats → 5. `sides()` was not stubbed, so the mock returns the default for `int`: **0**.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The service is tested with a mocked `EmailSender`. What does the test print?',
      example: { title: 'ArgumentCaptor', text: 'A captor records the argument the code under test passed to a mock, so you can assert on it.' },
      code: `// production code
public void register(String name, String email) {
    String msg = "Welcome " + name.trim() + "!";
    emailSender.send(email.toLowerCase(), msg);
}

// test
service.register("  Meera ", "MEERA@MAIL.COM");
ArgumentCaptor<String> to = ArgumentCaptor.forClass(String.class);
ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
verify(emailSender, times(1)).send(to.capture(), body.capture());
System.out.println(to.getValue());
System.out.println(body.getValue());`,
      expected: 'meera@mail.com\nWelcome Meera!',
      explain: '`verify(..., times(1))` passes because send was called once. The captors hold the real arguments: the lower-cased email and the message with the trimmed name. This lets you test what was sent without a real mail server.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the correct order of the **TDD** cycle?',
      options: ['Green → Red → Refactor', 'Write code → Refactor → Write test', 'Red (write a failing test) → Green (simplest code to pass) → Refactor (clean up, tests stay green)', 'Refactor → Red → Green'],
      answer: 2,
      explain: '**Red, Green, Refactor**. The failing test proves the test can catch the bug; the minimal code makes it pass; refactoring is safe because the tests guard behaviour.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'In a JUnit 5 test with Mockito, which statements are TRUE? (choose all that apply)',
      options: [
        '@ExtendWith(MockitoExtension.class) enables @Mock and @InjectMocks',
        '@InjectMocks creates the class under test and injects the @Mock fields into it',
        'verify(repo, never()).save(any()) checks save was never called',
        'Mockito can mock final classes and static methods only with PowerMock',
        'Strict stubs report a stubbing that the test never used',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Modern Mockito (5.x, inline mock maker) can mock final classes, and static methods with `mockStatic` - PowerMock is no longer needed. MockitoExtension uses strict stubs, which flags unused stubbing (UnnecessaryStubbingException).',
    },
  ],
};
