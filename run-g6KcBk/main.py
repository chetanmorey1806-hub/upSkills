GROUPS = {
    "Teachers": {"students.view_student", "students.change_student", "students.publish_result"},
    "Office Staff": {"students.view_student", "students.add_student", "students.delete_student"},
}

class User:
    def __init__(self, name, groups=(), extra=(), is_superuser=False):
        self.name, self.groups, self.extra = name, set(groups), set(extra)
        self.is_superuser = is_superuser

    def get_all_permissions(self):
        perms = set(self.extra)
        for g in self.groups:
            perms |= GROUPS[g]
        return perms

    def has_perm(self, perm):
        return self.is_superuser or perm in self.get_all_permissions()

meena = User("Meena", groups=["Teachers"])
ravi = User("Ravi", groups=["Office Staff"], extra=["students.export_result"])
admin = User("Admin", is_superuser=True)

for perm in ["students.publish_result", "students.delete_student", "students.export_result"]:
    print(perm, "->", [u.name for u in (meena, ravi, admin) if u.has_perm(perm)])