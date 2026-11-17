from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    perms: set = field(default_factory=set)
    def has_perm(self, p):
        return p in self.perms

@dataclass
class Post:
    title: str
    author: User
    status: str = "DRAFT"

def can_view(user, post):
    return post.status == "PUBLISHED" or (user is not None and user is post.author)

def can_edit(user, post):
    return user is post.author or user.has_perm("blog.change_post")

def allowed_statuses(user):
    return ["DRAFT", "PUBLISHED"] if user.has_perm("blog.publish_post") else ["DRAFT"]

meena = User("Meena", {"blog.add_post"})
ravi = User("Ravi")
editor = User("Editor", {"blog.change_post", "blog.publish_post"})
draft = Post("Secret draft", meena)
live = Post("Django tips", meena, "PUBLISHED")

checks = {
    "anonymous sees live post": can_view(None, live),
    "anonymous sees draft": can_view(None, draft),
    "author sees own draft": can_view(meena, draft),
    "ravi edits meena's post": can_edit(ravi, live),
    "editor edits meena's post": can_edit(editor, live),
}
for name, value in checks.items():
    print(f"{name:28} -> {value}")
print("Meena can set:", allowed_statuses(meena))
print("Editor can set:", allowed_statuses(editor))