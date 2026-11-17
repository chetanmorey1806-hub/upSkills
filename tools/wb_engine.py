# MySQL-flavoured SQL engine on top of SQLite (used by the in-browser MySQL Workbench Lab).
import sqlite3, re, json, time, math, random, datetime

BT = chr(96)
_dbs = {}
_current = {'db': None}

MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

def _to_dt(v):
    if v is None: return None
    if isinstance(v, (int, float)): return None
    s = str(v).strip()
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d', '%Y-%m-%dT%H:%M:%S'):
        try: return datetime.datetime.strptime(s[:19] if 'H' in fmt else s[:10], fmt)
        except ValueError: pass
    return None

def _fmt_date(v, with_time):
    return v.strftime('%Y-%m-%d %H:%M:%S' if with_time else '%Y-%m-%d')

def _has_time(v):
    return isinstance(v, str) and len(v.strip()) > 10

def f_concat(*a):
    if any(x is None for x in a): return None
    return ''.join(_s(x) for x in a)
def f_concat_ws(sep, *a):
    if sep is None: return None
    return str(sep).join(_s(x) for x in a if x is not None)
def _s(x):
    if isinstance(x, float) and x.is_integer(): return str(int(x)) if abs(x) < 1e15 else str(x)
    return str(x)
def f_now(): return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
def f_curdate(): return datetime.date.today().isoformat()
def f_curtime(): return datetime.datetime.now().strftime('%H:%M:%S')
def _part(fn):
    def g(v):
        d = _to_dt(v)
        return None if d is None else fn(d)
    return g
f_year = _part(lambda d: d.year); f_month = _part(lambda d: d.month); f_day = _part(lambda d: d.day)
f_hour = _part(lambda d: d.hour); f_minute = _part(lambda d: d.minute); f_second = _part(lambda d: d.second)
f_dayname = _part(lambda d: DAYS[d.weekday()]); f_monthname = _part(lambda d: MONTHS[d.month - 1])
f_dayofweek = _part(lambda d: (d.weekday() + 1) % 7 + 1); f_quarter = _part(lambda d: (d.month - 1) // 3 + 1)
f_week = _part(lambda d: int(d.strftime('%U'))); f_dayofyear = _part(lambda d: d.timetuple().tm_yday)
f_date = _part(lambda d: d.date().isoformat())
f_last_day = _part(lambda d: (datetime.date(d.year + (d.month == 12), d.month % 12 + 1, 1) - datetime.timedelta(days=1)).isoformat())
def f_datediff(a, b):
    x, y = _to_dt(a), _to_dt(b)
    if x is None or y is None: return None
    return (x.date() - y.date()).days
def _add(v, n, unit, sign=1):
    d = _to_dt(v)
    if d is None or n is None: return None
    n = int(float(n)) * sign; unit = str(unit).upper()
    if unit in ('DAY', 'DAYS'): r = d + datetime.timedelta(days=n)
    elif unit == 'WEEK': r = d + datetime.timedelta(weeks=n)
    elif unit == 'HOUR': r = d + datetime.timedelta(hours=n)
    elif unit == 'MINUTE': r = d + datetime.timedelta(minutes=n)
    elif unit == 'SECOND': r = d + datetime.timedelta(seconds=n)
    elif unit in ('MONTH', 'QUARTER', 'YEAR'):
        months = n * (1 if unit == 'MONTH' else 3 if unit == 'QUARTER' else 12)
        t = d.year * 12 + d.month - 1 + months
        y, m = divmod(t, 12)
        import calendar
        r = d.replace(year=y, month=m + 1, day=min(d.day, calendar.monthrange(y, m + 1)[1]))
    else: return None
    return _fmt_date(r, _has_time(v) or unit in ('HOUR', 'MINUTE', 'SECOND'))
def f_date_add(v, n, unit): return _add(v, n, unit, 1)
def f_date_sub(v, n, unit): return _add(v, n, unit, -1)
def f_timestampdiff(unit, a, b):
    x, y = _to_dt(a), _to_dt(b)
    if x is None or y is None: return None
    u = str(unit).upper()
    if u == 'DAY': return (y - x).days
    if u == 'HOUR': return int((y - x).total_seconds() // 3600)
    if u == 'MINUTE': return int((y - x).total_seconds() // 60)
    if u == 'SECOND': return int((y - x).total_seconds())
    months = (y.year - x.year) * 12 + y.month - x.month
    if (y.day, y.hour, y.minute, y.second) < (x.day, x.hour, x.minute, x.second): months -= 1 if months > 0 else 0
    if u == 'MONTH': return months
    if u == 'QUARTER': return months // 3
    if u == 'YEAR': return months // 12
    return None
DF = {'%Y': '%Y', '%y': '%y', '%m': '%m', '%d': '%d', '%H': '%H', '%i': '%M', '%s': '%S', '%S': '%S', '%p': '%p', '%h': '%I', '%I': '%I', '%T': '%H:%M:%S', '%%': '%%'}
def f_date_format(v, fmt):
    d = _to_dt(v)
    if d is None or fmt is None: return None
    out, i = '', 0
    fmt = str(fmt)
    while i < len(fmt):
        tok = fmt[i:i+2]
        if fmt[i] == '%' and i + 1 < len(fmt):
            c = fmt[i+1]
            if tok in DF: out += d.strftime(DF[tok])
            elif c == 'M': out += MONTHS[d.month-1]
            elif c == 'b': out += MONTHS[d.month-1][:3]
            elif c == 'W': out += DAYS[d.weekday()]
            elif c == 'a': out += DAYS[d.weekday()][:3]
            elif c == 'e': out += str(d.day)
            elif c == 'c': out += str(d.month)
            elif c == 'D':
                n = d.day; suf = 'th' if 11 <= n <= 13 else {1:'st',2:'nd',3:'rd'}.get(n % 10, 'th'); out += f'{n}{suf}'
            elif c == 'j': out += d.strftime('%j')
            else: out += c
            i += 2
        else:
            out += fmt[i]; i += 1
    return out
def f_str_to_date(s, fmt):
    if s is None or fmt is None: return None
    pyf = str(fmt)
    for k, v in DF.items(): pyf = pyf.replace(k, v)
    pyf = pyf.replace('%M', '%B') if '%i' not in str(fmt) else pyf
    try:
        d = datetime.datetime.strptime(str(s), pyf)
        return _fmt_date(d, any(t in str(fmt) for t in ('%H', '%i', '%s', '%T')))
    except ValueError:
        return None
def f_if(c, a, b): return a if (c not in (None, 0, '0', '') and c) else b
def f_lpad(s, n, p):
    if s is None or n is None or p is None: return None
    s, n, p = str(s), int(n), str(p)
    if len(s) >= n: return s[:n]
    if not p: return None
    return ((p * n)[: n - len(s)]) + s
def f_rpad(s, n, p):
    if s is None or n is None or p is None: return None
    s, n, p = str(s), int(n), str(p)
    if len(s) >= n: return s[:n]
    if not p: return None
    return s + (p * n)[: n - len(s)]
def f_left(s, n): return None if s is None or n is None else str(s)[: max(0, int(n))]
def f_right(s, n): return None if s is None or n is None else (str(s)[-int(n):] if int(n) > 0 else '')
def f_reverse(s): return None if s is None else str(s)[::-1]
def f_locate(sub, s, pos=1):
    if sub is None or s is None: return None
    return str(s).find(str(sub), int(pos) - 1) + 1
def f_repeat(s, n): return None if s is None or n is None else str(s) * max(0, int(n))
def f_space(n): return ' ' * int(n or 0)
def f_char_length(s): return None if s is None else len(str(s))
def f_substring_index(s, d, n):
    if s is None or d is None or n is None: return None
    parts = str(s).split(str(d)); n = int(n)
    return str(d).join(parts[:n]) if n >= 0 else str(d).join(parts[n:])
def f_field(v, *a):
    for i, x in enumerate(a, 1):
        if x == v: return i
    return 0
def _num(x):
    return None if x is None else float(x)
def f_ceil(x): return None if x is None else math.ceil(float(x))
def f_floor(x): return None if x is None else math.floor(float(x))
def f_pow(a, b): return None if a is None or b is None else float(a) ** float(b)
def f_sqrt(x): return None if x is None or float(x) < 0 else math.sqrt(float(x))
def f_mod(a, b): return None if a is None or b in (None, 0) else (a % b if isinstance(a, int) and isinstance(b, int) else math.fmod(float(a), float(b)))
def f_truncate(x, d):
    if x is None or d is None: return None
    f = 10 ** int(d); v = math.trunc(float(x) * f) / f
    return int(v) if int(d) <= 0 else v
def f_round(x, d=0):
    if x is None: return None
    from decimal import Decimal, ROUND_HALF_UP
    q = Decimal(1).scaleb(-int(d))
    v = Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP)
    return int(v) if int(d) <= 0 else float(v)
def f_rand(seed=None): return random.random()
def f_greatest(*a): return None if any(x is None for x in a) else max(a)
def f_least(*a): return None if any(x is None for x in a) else min(a)
def f_sign(x): return None if x is None else (x > 0) - (x < 0)
def f_database(): return _current['db']
def f_version(): return '8.0.36 (simulated on SQLite)'
def f_user(): return 'root@localhost'
def f_uuid():
    import uuid; return str(uuid.uuid4())

UDFS = {
    'CONCAT': (f_concat, -1), 'CONCAT_WS': (f_concat_ws, -1), 'NOW': (f_now, 0), 'SYSDATE': (f_now, 0), 'CURRENT_TIMESTAMP_FN': (f_now, 0),
    'CURDATE': (f_curdate, 0), 'CURRENT_DATE_FN': (f_curdate, 0), 'CURTIME': (f_curtime, 0),
    'YEAR': (f_year, 1), 'MONTH': (f_month, 1), 'DAY': (f_day, 1), 'DAYOFMONTH': (f_day, 1), 'HOUR': (f_hour, 1), 'MINUTE': (f_minute, 1), 'SECOND': (f_second, 1),
    'DAYNAME': (f_dayname, 1), 'MONTHNAME': (f_monthname, 1), 'DAYOFWEEK': (f_dayofweek, 1), 'QUARTER': (f_quarter, 1), 'WEEK': (f_week, 1), 'DAYOFYEAR': (f_dayofyear, 1),
    'DATE_ONLY': (f_date, 1), 'LAST_DAY': (f_last_day, 1), 'DATEDIFF': (f_datediff, 2), 'DATE_ADD': (f_date_add, 3), 'DATE_SUB': (f_date_sub, 3),
    'ADDDATE': (f_date_add, 3), 'SUBDATE': (f_date_sub, 3), 'TIMESTAMPDIFF': (f_timestampdiff, 3), 'DATE_FORMAT': (f_date_format, 2), 'STR_TO_DATE': (f_str_to_date, 2),
    'IIF_MY': (f_if, 3), 'LPAD': (f_lpad, 3), 'RPAD': (f_rpad, 3), 'LEFT': (f_left, 2), 'RIGHT': (f_right, 2), 'REVERSE': (f_reverse, 1),
    'LOCATE': (f_locate, -1), 'POSITION_FN': (f_locate, 2), 'REPEAT': (f_repeat, 2), 'SPACE': (f_space, 1), 'CHAR_LENGTH': (f_char_length, 1), 'CHARACTER_LENGTH': (f_char_length, 1),
    'SUBSTRING_INDEX': (f_substring_index, 3), 'FIELD': (f_field, -1), 'UCASE': (lambda s: None if s is None else str(s).upper(), 1), 'LCASE': (lambda s: None if s is None else str(s).lower(), 1),
    'CEIL': (f_ceil, 1), 'CEILING': (f_ceil, 1), 'FLOOR': (f_floor, 1), 'POW': (f_pow, 2), 'POWER': (f_pow, 2), 'SQRT': (f_sqrt, 1), 'MOD': (f_mod, 2),
    'TRUNCATE': (f_truncate, 2), 'ROUND': (f_round, -1), 'RAND': (f_rand, -1), 'GREATEST': (f_greatest, -1), 'LEAST': (f_least, -1), 'SIGN': (f_sign, 1),
    'PI': (lambda: math.pi, 0), 'DATABASE': (f_database, 0), 'SCHEMA': (f_database, 0), 'VERSION': (f_version, 0), 'USER': (f_user, 0), 'CURRENT_USER_FN': (f_user, 0), 'UUID': (f_uuid, 0),
}

def _conn(name):
    if name not in _dbs:
        c = sqlite3.connect(':memory:', isolation_level=None)
        c.execute('PRAGMA foreign_keys = ON')
        for n, (fn, k) in UDFS.items():
            c.create_function(n, k, fn)
        _dbs[name] = c
    return _dbs[name]

# ---------- lexical helpers ----------
def _mask(sql):
    # returns (masked, literals) where string literals become placeholders \x00N\x00
    out, lits, i, n = [], [], 0, len(sql)
    while i < n:
        c = sql[i]
        if c in ("'", '"'):
            j = i + 1; buf = c
            while j < n:
                if sql[j] == '\\' and j + 1 < n: buf += sql[j:j+2]; j += 2; continue
                if sql[j] == c:
                    if j + 1 < n and sql[j+1] == c: buf += c + c; j += 2; continue
                    buf += c; j += 1; break
                buf += sql[j]; j += 1
            lit = buf
            if c == '"': lit = "'" + buf[1:-1].replace("'", "''").replace('""', '"') + "'"
            lit = lit.replace("\\'", "''").replace('\\n', '\n').replace('\\t', '\t').replace('\\\\', '\\')
            out.append('\x00%d\x00' % len(lits)); lits.append(lit); i = j
        elif c == '#' or (c == '-' and sql[i:i+3] in ('-- ', '--\t', '--\n') or sql[i:i+2] == '--' and i + 2 == n):
            j = sql.find('\n', i); j = n if j < 0 else j
            i = j
        elif sql[i:i+2] == '/*':
            j = sql.find('*/', i + 2); j = n if j < 0 else j + 2
            i = j
        else:
            out.append(c); i += 1
    return ''.join(out), lits

def _unmask(s, lits):
    return re.sub('\x00(\\d+)\x00', lambda m: lits[int(m.group(1))], s)

def split_statements(sql):
    # supports DELIMITER changes (Workbench style)
    stmts, delim, buf = [], ';', []
    lines = sql.replace('\r', '').split('\n')
    text = ''
    for line in lines:
        m = re.match(r'^\s*DELIMITER\s+(\S+)\s*$', line, re.I)
        if m:
            text_part = '\n'.join(buf)
            stmts.extend(_split_by(text_part, delim)); buf = []
            delim = m.group(1)
            continue
        buf.append(line)
    stmts.extend(_split_by('\n'.join(buf), delim))
    return [s for s in stmts if s.strip()]

def _split_by(text, delim):
    out, cur, i, n = [], [], 0, len(text)
    q = None
    while i < n:
        c = text[i]
        if q:
            cur.append(c)
            if c == '\\' and i + 1 < n: cur.append(text[i+1]); i += 2; continue
            if c == q: q = None
            i += 1; continue
        if c in ("'", '"', BT): q = c; cur.append(c); i += 1; continue
        if text.startswith('--', i) or c == '#':
            j = text.find('\n', i); j = n if j < 0 else j
            cur.append(text[i:j]); i = j; continue
        if text.startswith('/*', i):
            j = text.find('*/', i + 2); j = n if j < 0 else j + 2
            cur.append(text[i:j]); i = j; continue
        if text.startswith(delim, i):
            out.append(''.join(cur)); cur = []; i += len(delim); continue
        cur.append(c); i += 1
    if ''.join(cur).strip(): out.append(''.join(cur))
    # drop pure-comment chunks
    res = []
    for s in out:
        masked, _ = _mask(s)
        if masked.strip(): res.append(s.strip())
    return res

# ---------- translation ----------
def _replace_calls(s, name, fn):
    # rewrite NAME( args ) using fn(list_of_arg_strings) with paren matching
    pat = re.compile(r'\b' + name + r'\s*\(', re.I)
    out, i = '', 0
    while True:
        m = pat.search(s, i)
        if not m: out += s[i:]; break
        out += s[i:m.start()]
        j, depth, args, cur = m.end(), 1, [], ''
        while j < len(s) and depth:
            ch = s[j]
            if ch == '(': depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0: break
            if ch == ',' and depth == 1: args.append(cur); cur = ''
            else: cur += ch
            j += 1
        args.append(cur)
        out += fn([a.strip() for a in args]) if depth == 0 else s[m.start():j]
        i = j + 1
    return out

def translate(sql):
    s, lits = _mask(sql)
    s = s.replace(BT, '"')
    # table options
    s = re.sub(r'\)\s*(ENGINE|DEFAULT\s+CHARSET|CHARSET|COLLATE|AUTO_INCREMENT|COMMENT|ROW_FORMAT)\b[^;]*$', ')', s, flags=re.I)
    s = re.sub(r'\b(CHARACTER\s+SET|CHARSET)\s+\w+', '', s, flags=re.I)
    s = re.sub(r'\bCOLLATE\s+\w+', '', s, flags=re.I)
    s = re.sub(r'\b(UNSIGNED|ZEROFILL)\b', '', s, flags=re.I)
    s = re.sub(r'\bON\s+UPDATE\s+CURRENT_TIMESTAMP(\(\))?', '', s, flags=re.I)
    s = re.sub(r'\bENUM\s*\([^)]*\)', 'TEXT', s, flags=re.I)
    s = re.sub(r'\bSET\s*\(\s*\x00[^)]*\)', 'TEXT', s, flags=re.I)
    s = re.sub(r'\bCOMMENT\s+\x00\d+\x00', '', s, flags=re.I)
    # AUTO_INCREMENT columns -> INTEGER PRIMARY KEY AUTOINCREMENT
    if re.search(r'\bAUTO_INCREMENT\b', s, re.I) and re.match(r'\s*CREATE\s+TABLE', s, re.I):
        m = re.match(r'(\s*CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\w."]+\s*\()(.*)(\)\s*)$', s, re.I | re.S)
        if m:
            head, body, tail = m.group(1), m.group(2), m.group(3)
            parts, depth, cur = [], 0, ''
            for ch in body:
                if ch == '(': depth += 1
                if ch == ')': depth -= 1
                if ch == ',' and depth == 0: parts.append(cur); cur = ''
                else: cur += ch
            parts.append(cur)
            auto_cols = []
            new = []
            for p in parts:
                if re.search(r'\bAUTO_INCREMENT\b', p, re.I):
                    cm = re.match(r'\s*("?\w+"?)', p)
                    col = cm.group(1)
                    auto_cols.append(col.strip('"').lower())
                    new.append(' %s INTEGER PRIMARY KEY AUTOINCREMENT' % col + (' ' + ' '.join(re.findall(r'\b(?:REFERENCES\b.*)$', p, re.I)) if re.search(r'\bREFERENCES\b', p, re.I) else ''))
                else:
                    new.append(p)
            final = []
            for p in new:
                pk = re.match(r'\s*(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(\s*("?\w+"?)\s*\)\s*$', p, re.I)
                if pk and pk.group(1).strip('"').lower() in auto_cols: continue
                final.append(p)
            s = head + ','.join(final) + tail
    s = re.sub(r'\bAUTO_INCREMENT\b', '', s, flags=re.I)
    # KEY idx (col) inside CREATE TABLE -> drop (SQLite doesn't support inline non-unique index)
    s = re.sub(r',\s*(?:INDEX|KEY)\s+\w*\s*\([^)]*\)', '', s, flags=re.I)
    s = re.sub(r',\s*UNIQUE\s+(?:KEY|INDEX)\s+\w+\s*\(', ', UNIQUE (', s, flags=re.I)
    s = re.sub(r'\bINSERT\s+IGNORE\b', 'INSERT OR IGNORE', s, flags=re.I)
    s = re.sub(r'\b(TINYINT|SMALLINT|MEDIUMINT|BIGINT|INT)\s*\(\s*\d+\s*\)', r'\1', s, flags=re.I)
    s = re.sub(r'\bDOUBLE\s+PRECISION\b', 'DOUBLE', s, flags=re.I)
    # functions needing rewrite
    s = re.sub(r'\bIF\s*\(', 'IIF_MY(', s, flags=re.I) if not re.match(r'\s*(CREATE|DROP)\b', s, re.I) else re.sub(r'(?<!EXISTS\s)(?<!NOT\s)\bIF\s*\((?!\s*NOT|\s*EXISTS)', 'IIF_MY(', s, flags=re.I)
    s = re.sub(r'\bCURRENT_TIMESTAMP\s*\(\s*\)', 'NOW()', s, flags=re.I)
    s = re.sub(r'\bCURRENT_DATE\s*\(\s*\)', 'CURDATE()', s, flags=re.I)
    s = re.sub(r'\bCURRENT_USER\s*\(\s*\)', 'CURRENT_USER_FN()', s, flags=re.I)
    s = re.sub(r'\bDATE\s*\((?=[^)])', 'DATE_ONLY(', s, flags=re.I)
    s = re.sub(r'\bTIMESTAMPDIFF\s*\(\s*(\w+)\s*,', lambda m: "TIMESTAMPDIFF('%s'," % m.group(1).upper(), s, flags=re.I)
    def interval_fix(name):
        def fx(args):
            if len(args) == 2:
                im = re.match(r'INTERVAL\s+(.+?)\s+(\w+)\s*$', args[1], re.I | re.S)
                if im: return "%s(%s, %s, '%s')" % (name, args[0], im.group(1), im.group(2).upper())
                return "%s(%s, %s, 'DAY')" % (name, args[0], args[1])
            return '%s(%s)' % (name, ', '.join(args))
        return fx
    for nm in ('DATE_ADD', 'DATE_SUB', 'ADDDATE', 'SUBDATE'):
        s = _replace_calls(s, nm, interval_fix(nm))
    # expr + INTERVAL n DAY
    s = re.sub(r'([\w."]+(?:\([^()]*\))?)\s*([+-])\s*INTERVAL\s+(\d+)\s+(\w+)', lambda m: "DATE_%s(%s, %s, '%s')" % ('ADD' if m.group(2) == '+' else 'SUB', m.group(1), m.group(3), m.group(4).upper()), s, flags=re.I)
    s = _replace_calls(s, 'POSITION', lambda a: 'POSITION_FN(%s)' % ', '.join(re.split(r'\s+IN\s+', a[0], flags=re.I)) if len(a) == 1 else 'POSITION_FN(%s)' % ', '.join(a))
    s = re.sub(r'\bGROUP_CONCAT\s*\(\s*(DISTINCT\s+)?([^()]*?)(?:\s+ORDER\s+BY\s+[^()]*?)?\s+SEPARATOR\s+(\x00\d+\x00)\s*\)', lambda m: 'GROUP_CONCAT(%s%s, %s)' % (m.group(1) or '', m.group(2), m.group(3)), s, flags=re.I)
    s = re.sub(r'\bLIMIT\s+(\d+)\s+OFFSET\s+(\d+)', r'LIMIT \1 OFFSET \2', s, flags=re.I)
    s = re.sub(r'\bTRUE\b', '1', s, flags=re.I); s = re.sub(r'\bFALSE\b', '0', s, flags=re.I)
    s = re.sub(r'\bDIV\b', '/', s)
    s = re.sub(r'\s+XOR\s+', ' <> ', s, flags=re.I)
    return _unmask(s, lits)

# ---------- MySQL meta commands ----------
def _rows_result(cols, rows, stmt): return {'type': 'rows', 'columns': cols, 'rows': rows, 'sql': stmt}
def _ok(msg, stmt): return {'type': 'ok', 'message': msg, 'sql': stmt}

def _require_db(stmt):
    if not _current['db']:
        raise Exception('Error Code: 1046. No database selected. Select the default DB to be used by double-clicking its name in the SCHEMAS list in the sidebar, or run: USE database_name;')
    return _conn(_current['db'])

def _mysql_type(t):
    t = (t or '').upper()
    return t.lower() if t else ''

def run_one(stmt):
    raw = stmt.strip().rstrip(';').strip()
    masked, lits = _mask(raw)
    m0 = masked.strip()
    U = m0.upper()
    # CREATE DATABASE / SCHEMA
    m = re.match(r'CREATE\s+(?:DATABASE|SCHEMA)\s+(IF\s+NOT\s+EXISTS\s+)?[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        name = m.group(2).lower()
        if name in _dbs and not m.group(1): raise Exception("Error Code: 1007. Can't create database '%s'; database exists" % name)
        existed = name in _dbs
        _conn(name)
        return _ok('1 row(s) affected' if not existed else '0 row(s) affected, 1 warning(s): 1007 database exists', stmt)
    m = re.match(r'DROP\s+(?:DATABASE|SCHEMA)\s+(IF\s+EXISTS\s+)?[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        name = m.group(2).lower()
        if name not in _dbs:
            if m.group(1): return _ok('0 row(s) affected, 1 warning(s)', stmt)
            raise Exception("Error Code: 1008. Can't drop database '%s'; database doesn't exist" % name)
        n = len(_list_tables(_dbs[name]))
        _dbs[name].close(); del _dbs[name]
        if _current['db'] == name: _current['db'] = None
        return _ok('%d row(s) affected' % n, stmt)
    m = re.match(r'USE\s+[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        name = m.group(1).lower()
        if name not in _dbs: raise Exception("Error Code: 1049. Unknown database '%s'" % name)
        _current['db'] = name
        return _ok('0 row(s) affected', stmt)
    if re.match(r'SHOW\s+(DATABASES|SCHEMAS)', m0, re.I):
        return _rows_result(['Database'], [[d] for d in sorted(_dbs)], stmt)
    m = re.match(r'SHOW\s+(FULL\s+)?TABLES(?:\s+(?:FROM|IN)\s+(\w+))?', m0, re.I)
    if m:
        db = (m.group(2) or _current['db'] or '').lower()
        if not db: _require_db(stmt)
        if db not in _dbs: raise Exception("Error Code: 1049. Unknown database '%s'" % db)
        c = _dbs[db]
        rows = c.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()
        if m.group(1): return _rows_result(['Tables_in_' + db, 'Table_type'], [[r[0], 'BASE TABLE' if r[1] == 'table' else 'VIEW'] for r in rows], stmt)
        return _rows_result(['Tables_in_' + db], [[r[0]] for r in rows], stmt)
    m = re.match(r'(?:DESCRIBE|DESC|EXPLAIN|SHOW\s+(?:FULL\s+)?(?:COLUMNS|FIELDS)\s+(?:FROM|IN))\s+[' + BT + r'"]?(\w+)[' + BT + r'"]?\s*$', m0, re.I)
    if m:
        c = _require_db(stmt)
        t = m.group(1)
        info = c.execute('PRAGMA table_info("%s")' % t).fetchall()
        if not info: raise Exception("Error Code: 1146. Table '%s.%s' doesn't exist" % (_current['db'], t))
        fks = {r[3] for r in c.execute('PRAGMA foreign_key_list("%s")' % t).fetchall()}
        uniq = set()
        for il in c.execute('PRAGMA index_list("%s")' % t).fetchall():
            if il[2]:
                cols = [r[2] for r in c.execute('PRAGMA index_info("%s")' % il[1]).fetchall()]
                if len(cols) == 1: uniq.add(cols[0])
        sql_def = (c.execute("SELECT sql FROM sqlite_master WHERE name=?", (t,)).fetchone() or [''])[0] or ''
        rows = []
        for cid, name, typ, notnull, dflt, pk in info:
            key = 'PRI' if pk else 'UNI' if name in uniq else 'MUL' if name in fks else ''
            extra = 'auto_increment' if pk and re.search(r'\b%s\b[^,]*AUTOINCREMENT' % re.escape(name), sql_def, re.I) else ''
            rows.append([name, _mysql_type(typ), 'NO' if (notnull or pk) else 'YES', key, None if dflt is None else str(dflt).strip("'"), extra])
        return _rows_result(['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'], rows, stmt)
    m = re.match(r'SHOW\s+CREATE\s+TABLE\s+[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        c = _require_db(stmt)
        r = c.execute("SELECT sql FROM sqlite_master WHERE name=?", (m.group(1),)).fetchone()
        if not r: raise Exception("Error Code: 1146. Table '%s.%s' doesn't exist" % (_current['db'], m.group(1)))
        return _rows_result(['Table', 'Create Table'], [[m.group(1), r[0]]], stmt)
    m = re.match(r'SHOW\s+(?:INDEX|INDEXES|KEYS)\s+(?:FROM|IN)\s+[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        c = _require_db(stmt); t = m.group(1); rows = []
        for seq, name, unique, origin, partial in c.execute('PRAGMA index_list("%s")' % t).fetchall():
            for r in c.execute('PRAGMA index_info("%s")' % name).fetchall():
                rows.append([t, 0 if unique else 1, 'PRIMARY' if origin == 'pk' else name, r[0] + 1, r[2]])
        for col in c.execute('PRAGMA table_info("%s")' % t).fetchall():
            if col[5] and not any(r[2] == 'PRIMARY' for r in rows): rows.insert(0, [t, 0, 'PRIMARY', 1, col[1]])
        return _rows_result(['Table', 'Non_unique', 'Key_name', 'Seq_in_index', 'Column_name'], rows, stmt)
    if re.match(r'SHOW\s+(VARIABLES|STATUS|PROCESSLIST|GRANTS|ENGINES|WARNINGS|ERRORS)', m0, re.I):
        return _ok('Server administration commands (%s) need a real MySQL server. Practise them in MySQL Workbench.' % m0.split()[1].upper(), stmt)
    m = re.match(r'TRUNCATE\s+(?:TABLE\s+)?[' + BT + r'"]?(\w+)', m0, re.I)
    if m:
        c = _require_db(stmt)
        c.execute('DELETE FROM "%s"' % m.group(1))
        try: c.execute("DELETE FROM sqlite_sequence WHERE name=?", (m.group(1),))
        except sqlite3.OperationalError: pass
        return _ok('0 row(s) affected', stmt)
    if re.match(r'(CREATE|DROP)\s+(DEFINER\s*=\s*\S+\s+)?(PROCEDURE|FUNCTION|EVENT|USER|ROLE)\b|CALL\s|GRANT\s|REVOKE\s|FLUSH\s|SET\s+(GLOBAL|PASSWORD)|ALTER\s+USER', m0, re.I):
        kind = re.match(r'(\w+)(?:\s+\w+=\S+)?\s*(\w+)?', m0).group(0).upper()
        raise Exception('Not supported in this browser lab: %s. Stored procedures, functions, CALL, users and GRANT/REVOKE run only on a real MySQL server. Copy this script into MySQL Workbench to practise it.' % kind.split()[0] + ' ' + (m0.split()[1].upper() if len(m0.split()) > 1 else ''))
    if re.match(r'ALTER\s+TABLE\s+\S+\s+(MODIFY|CHANGE)\b', m0, re.I):
        raise Exception('ALTER TABLE ... MODIFY/CHANGE is MySQL-specific and is not supported by the browser engine. Practise it in MySQL Workbench. (ADD COLUMN, DROP COLUMN and RENAME work here.)')
    if re.match(r'(START\s+TRANSACTION|BEGIN\s*$)', m0, re.I):
        c = _require_db(stmt); c.execute('BEGIN'); return _ok('0 row(s) affected', stmt)
    if re.match(r'SET\s+(AUTOCOMMIT|SQL_SAFE_UPDATES|SESSION|NAMES|FOREIGN_KEY_CHECKS)\b', m0, re.I):
        mm = re.match(r'SET\s+FOREIGN_KEY_CHECKS\s*=\s*(\d)', m0, re.I)
        if mm and _current['db']: _conn(_current['db']).execute('PRAGMA foreign_keys = %s' % ('ON' if mm.group(1) == '1' else 'OFF'))
        return _ok('0 row(s) affected', stmt)
    if re.match(r'(SELECT\s+(DATABASE|VERSION|NOW|CURDATE|USER|\d|\x00|CONCAT|DATE|UPPER|LOWER|LENGTH|ROUND|IF|CASE)\b)', m0, re.I) and not re.search(r'\bFROM\b', m0, re.I) and not _current['db']:
        c = _conn('__scratch__')
    else:
        c = _require_db(stmt)
    sql = translate(raw)
    t0 = time.time()
    try:
        cur = c.execute(sql)
    except sqlite3.IntegrityError as e:
        msg = str(e)
        if 'UNIQUE' in msg: raise Exception("Error Code: 1062. Duplicate entry for key (%s)" % msg.split(':', 1)[-1].strip())
        if 'NOT NULL' in msg: raise Exception("Error Code: 1048. Column '%s' cannot be null" % msg.split('.')[-1])
        if 'FOREIGN KEY' in msg: raise Exception('Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails')
        if 'CHECK' in msg: raise Exception('Error Code: 3819. Check constraint is violated (%s)' % msg)
        raise Exception('Error Code: 1062. ' + msg)
    except sqlite3.OperationalError as e:
        msg = str(e)
        mm = re.match(r'no such table: (\w+)', msg)
        if mm: raise Exception("Error Code: 1146. Table '%s.%s' doesn't exist" % (_current['db'], mm.group(1)))
        mm = re.match(r'no such column: ([\w.]+)', msg)
        if mm: raise Exception("Error Code: 1054. Unknown column '%s' in 'field list'" % mm.group(1))
        mm = re.match(r'table (\w+) already exists', msg)
        if mm: raise Exception("Error Code: 1050. Table '%s' already exists" % mm.group(1))
        if 'syntax error' in msg: raise Exception('Error Code: 1064. You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use (%s)' % msg)
        raise Exception('Error Code: 1064. ' + msg)
    if cur.description:
        return _rows_result([d[0] for d in cur.description], [list(r) for r in cur.fetchall()], stmt)
    if re.match(r'(INSERT|UPDATE|DELETE|REPLACE)\b', m0, re.I):
        n = cur.rowcount if cur.rowcount >= 0 else 0
        extra = ''
        if re.match(r'UPDATE', m0, re.I): extra = ' Rows matched: %d  Changed: %d  Warnings: 0' % (n, n)
        if re.match(r'INSERT', m0, re.I) and n > 1: extra = ' Records: %d  Duplicates: 0  Warnings: 0' % n
        return _ok('%d row(s) affected%s' % (n, extra), stmt)
    return _ok('0 row(s) affected', stmt)

def _list_tables(c):
    return [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()]

def wb_run(sql, stop_on_error=True):
    results = []
    for st in split_statements(sql):
        t0 = time.time()
        try:
            r = run_one(st)
        except Exception as e:
            r = {'type': 'error', 'message': str(e), 'sql': st}
        r['ms'] = round((time.time() - t0) * 1000, 3)
        results.append(r)
        if r['type'] == 'error' and stop_on_error: break
    return json.dumps({'results': results, 'db': _current['db'], 'schemas': wb_schemas()}, default=str)

def wb_schemas():
    out = {}
    for name, c in sorted(_dbs.items()):
        if name.startswith('__'): continue
        tables = {}
        for t, typ in c.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name").fetchall():
            cols = [[r[1], (r[2] or '').lower(), bool(r[5])] for r in c.execute('PRAGMA table_info("%s")' % t).fetchall()]
            tables[t] = {'kind': typ, 'columns': cols}
        out[name] = tables
    return out

def wb_dump():
    return json.dumps({n: '\n'.join(c.iterdump()) for n, c in _dbs.items() if not n.startswith('__')})

def wb_load(dump_json, current=None):
    data = json.loads(dump_json or '{}')
    for n in list(_dbs):
        _dbs[n].close(); del _dbs[n]
    for n, script in data.items():
        c = _conn(n)
        c.execute('PRAGMA foreign_keys = OFF')
        if script.strip(): c.executescript(script)
        c.execute('PRAGMA foreign_keys = ON')
    _current['db'] = current if current in _dbs else None
    return json.dumps({'db': _current['db'], 'schemas': wb_schemas()})

def wb_reset():
    for n in list(_dbs):
        _dbs[n].close(); del _dbs[n]
    _current['db'] = None
    return json.dumps({'db': None, 'schemas': {}})
