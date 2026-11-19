export default {
  lesson: 'day-09-blueprints-application-factory',
  minutes: 30,
  intro: 'Practise Blueprints, url_prefix, blueprint endpoints and the create_app() factory, and write the registration logic in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Inside a template, how do you link to the `login` view that belongs to the Blueprint named `auth`?',
      options: ["url_for('login')", "url_for('auth.login')", "url_for('/auth/login')", "url_for('auth/login')"],
      answer: 1,
      explain: 'Blueprint endpoints are named **`blueprint_name.function_name`**, so it is `url_for(\'auth.login\')`. Inside the same blueprint you may use the short form `url_for(\'.login\')`. Plain `url_for(\'login\')` raises a BuildError because no app-level endpoint has that name.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line inside `create_app()` that mounts the `auth_bp` Blueprint so its routes start with `/auth`:\n\n```\ndef create_app():\n    app = Flask(__name__)\n    ______\n    return app\n```',
      accept: ["app.register_blueprint(auth_bp, url_prefix='/auth')", 'app.register_blueprint(auth_bp, url_prefix="/auth")'],
      explain: '`app.register_blueprint(bp, url_prefix=\'/auth\')` adds all the blueprint\'s routes under `/auth`. A blueprint does nothing until it is registered. The prefix can also be given when creating it: `Blueprint(\'auth\', __name__, url_prefix=\'/auth\')`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why use the application factory (`create_app()`) pattern? (choose all that apply)',
      options: [
        'You can create apps with different configs (development, testing, production)',
        'Tests can create a fresh app with an in-memory database',
        'Extensions are created once (db = SQLAlchemy()) and bound later with db.init_app(app), avoiding circular imports',
        'It makes Flask run without a WSGI server',
        'Inside views you use current_app instead of importing app',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The factory builds the app on demand, so each config (and each test) gets its own app. Extensions live in `extensions.py` without an app and are bound with `init_app`. Because there is no global `app`, code uses **`current_app`**. You still need a WSGI server (`gunicorn "app:create_app()"`).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from flask import Flask, Blueprint, url_for

main = Blueprint('main', __name__)
blog = Blueprint('blog', __name__, url_prefix='/blog')

@main.route('/')
def index():
    return 'Home'

@blog.route('/<int:post_id>')
def detail(post_id):
    return f'Post {post_id}'

def create_app():
    app = Flask(__name__)
    app.register_blueprint(main)
    app.register_blueprint(blog)
    return app

app = create_app()
with app.test_request_context():
    print(url_for('main.index'))
    print(url_for('blog.detail', post_id=7))
c = app.test_client()
print(c.get('/blog/7').get_data(as_text=True))
print(c.get('/7').status_code)`,
      expected: '/\n/blog/7\nPost 7\n404',
      explain: 'The `blog` blueprint has `url_prefix=\'/blog\'`, so its `/<int:post_id>` route lives at `/blog/7`, and `/7` matches nothing (404). Endpoints are `main.index` and `blog.detail`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write a tiny "blueprint registry". `register(app_routes, bp_name, bp_routes, url_prefix=\'\')` gets:\n- `app_routes`: the app\'s dict `{endpoint: url}` (update it in place and return it)\n- `bp_routes`: the blueprint\'s dict `{function_name: rule}`\n\nAdd every blueprint route with endpoint `bp_name + \'.\' + function_name` and url `url_prefix + rule` (a rule of `\'/\'` with a prefix gives just the prefix, e.g. `\'/blog\'`).',
      example: { title: 'building new keys from a dict', code: "prices = {'pen': 10}\nfor k, v in prices.items():\n    print('shop.' + k, v * 2)   # shop.pen 20" },
      starter: `def register(app_routes, bp_name, bp_routes, url_prefix=''):
    # TODO
    return app_routes
`,
      solution: `def register(app_routes, bp_name, bp_routes, url_prefix=''):
    for func, rule in bp_routes.items():
        url = url_prefix + rule
        if url_prefix and rule == '/':
            url = url_prefix
        app_routes[f'{bp_name}.{func}'] = url
    return app_routes
`,
      tests: [
        { call: "register({}, 'main', {'index': '/', 'about': '/about'})", expect: { 'main.index': '/', 'main.about': '/about' } },
        { call: "register({'static': '/static'}, 'auth', {'login': '/login', 'logout': '/logout'}, '/auth')", expect: { static: '/static', 'auth.login': '/auth/login', 'auth.logout': '/auth/logout' } },
        { call: "register({}, 'blog', {'index': '/', 'detail': '/<int:id>'}, '/blog')", expect: { 'blog.index': '/blog', 'blog.detail': '/blog/<int:id>' } },
      ],
      explain: 'This is what `register_blueprint` does: it copies the blueprint\'s deferred routes into the app, **prefixing** both the URL (`url_prefix`) and the endpoint name (`auth.login`). That namespacing is why two blueprints can both have an `index` view without clashing.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `create_app(config_name=\'development\')` - a plain-Python factory. It returns a NEW dict each time:\n```\n{\'config\': CONFIGS[config_name], \'blueprints\': [\'main\', \'auth\']}\n```\nand if `config_name` is `\'testing\'` the dict also has `\'db\': \'sqlite:///:memory:\'` (other configs: `\'db\': \'sqlite:///app.db\'`). Unknown names raise `ValueError`.',
      example: { title: 'a function that builds and returns a new object', code: "def make_order(item):\n    order = {'item': item, 'status': 'new'}\n    return order\n\nprint(make_order('pen') is make_order('pen'))   # False" },
      starter: `CONFIGS = {
    'development': {'DEBUG': True},
    'testing': {'TESTING': True},
    'production': {'DEBUG': False},
}

def create_app(config_name='development'):
    # TODO
    return {}
`,
      solution: `CONFIGS = {
    'development': {'DEBUG': True},
    'testing': {'TESTING': True},
    'production': {'DEBUG': False},
}

def create_app(config_name='development'):
    if config_name not in CONFIGS:
        raise ValueError(f'Unknown config {config_name}')
    app = {'config': dict(CONFIGS[config_name]), 'blueprints': ['main', 'auth']}
    app['db'] = 'sqlite:///:memory:' if config_name == 'testing' else 'sqlite:///app.db'
    return app
`,
      tests: [
        { call: 'create_app()', expect: { config: { DEBUG: true }, blueprints: ['main', 'auth'], db: 'sqlite:///app.db' } },
        { call: "create_app('testing')['db']", expect: 'sqlite:///:memory:' },
        { call: "create_app('production')['config']", expect: { DEBUG: false } },
        { call: "create_app('testing') is not create_app('testing')", expect: true, msg: 'Each call must build a new app' },
        { call: "(lambda d: (exec('try:\\n    create_app(\\'staging\\')\\n    r = \\'no error\\'\\nexcept ValueError:\\n    r = \\'ValueError\\'', globals(), d), d['r'])[1])({})", expect: 'ValueError', msg: 'An unknown config name must raise ValueError' },
      ],
      explain: 'The factory never relies on a global app: each call builds and configures a new one, which is why tests can call `create_app(\'testing\')` and get an isolated in-memory database. Failing fast on an unknown config name avoids silently running production with development settings.',
    },
  ],
};
