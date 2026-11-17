import argparse

class BaseCommand:
    help = ""
    def add_arguments(self, parser):
        pass
    def run_from_argv(self, argv):
        parser = argparse.ArgumentParser(prog="manage.py " + argv[0], description=self.help)
        self.add_arguments(parser)
        options = vars(parser.parse_args(argv[1:]))
        self.handle(**options)

class Command(BaseCommand):
    help = "Send fee reminders"
    def add_arguments(self, parser):
        parser.add_argument("course", nargs="?")
        parser.add_argument("--days", type=int, default=7)
        parser.add_argument("--dry-run", action="store_true")
    def handle(self, **options):
        print(options)

Command().run_from_argv(["send_fee_reminders"])
Command().run_from_argv(["send_fee_reminders", "BCA", "--days", "3", "--dry-run"])