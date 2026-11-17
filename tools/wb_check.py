"""Run a MySQL script through the Workbench Lab engine (same engine as the browser).
Usage: python3 tools/wb_check.py [--tsql] script.sql   (or pipe SQL on stdin). --tsql = SQL Server (SSMS Lab) mode
Prints each statement's result exactly like the lab's Action Output / Result Grid."""
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wb_engine import wb_run, wb_select_store
args = [a for a in sys.argv[1:] if a != '--tsql']
if '--tsql' in sys.argv: wb_select_store('tsql')
sql = open(args[0]).read() if args else sys.stdin.read()
for r in json.loads(wb_run(sql, stop_on_error=False))['results']:
    head = r['sql'].strip().split('\n')[0][:70]
    if r['type'] == 'rows':
        cols = r['columns']; rows = [['NULL' if v is None else str(v) for v in row] for row in r['rows']]
        w = [max(len(str(c)), *(len(x[i]) for x in rows)) if rows else len(str(c)) for i, c in enumerate(cols)]
        line = '+' + '+'.join('-' * (n + 2) for n in w) + '+'
        print('>>', head); print(line); print('| ' + ' | '.join(str(c).ljust(w[i]) for i, c in enumerate(cols)) + ' |'); print(line)
        for x in rows: print('| ' + ' | '.join(x[i].ljust(w[i]) for i in range(len(cols))) + ' |')
        print(line); print('%d row(s) returned' % len(rows))
    elif r['type'] == 'ok':
        print('>>', head, '->', r['message'])
    else:
        print('>>', head, '-> ERROR:', r['message'])
