import io
import unittest

def grade(marks):
    if not 0 <= marks <= 100:
        raise ValueError("marks must be 0-100")
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 40:
        return "C"
    return "F"

class GradeTests(unittest.TestCase):
    def test_a_grade(self):
        marks = 95                        # Arrange
        result = grade(marks)             # Act
        self.assertEqual(result, "A")     # Assert

    def test_boundaries(self):
        self.assertEqual(grade(75), "B")
        self.assertEqual(grade(40), "C")
        self.assertEqual(grade(39), "F")

    def test_invalid_marks(self):
        with self.assertRaises(ValueError):
            grade(120)

    def test_wrong_expectation(self):
        self.assertEqual(grade(89), "A")   # deliberate failing test

suite = unittest.defaultTestLoader.loadTestsFromTestCase(GradeTests)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("Ran:", result.testsRun)
print("Failures:", [t.id().split(".")[-1] for t, _ in result.failures])
print("Successful:", result.wasSuccessful())