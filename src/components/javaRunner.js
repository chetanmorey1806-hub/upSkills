// Runs Java inside the browser with CheerpJ (a Java 17 JVM in WebAssembly, https://cheerpj.com).
// Nothing is installed on the computer: the first run downloads the JVM (~30 MB, then cached by the browser).
// javac comes with the JVM, so we compile the student's files and then run the class that has main().
// Scanner input: a tiny wrapper class points System.in at a file holding the "Program Input" text.

const LOADER = 'https://cjrtnc.leaningtech.com/5.0/loader.js';
const JAVA_VERSION = 17;

let ready = null;
let javac = null; // com.sun.tools.javac.Main, kept loaded so later compiles are fast (a few seconds)
const FAIL = '##JRUN_FAILED##';
let runCount = 0;
let busy = false;

function loadScript() {
  if (window.cheerpjInit) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = LOADER;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not download the Java engine. Check your internet connection and try again.'));
    document.head.appendChild(s);
  });
}

// CheerpJ prints System.out / System.err / javac messages into the element with id="console".
function consoleEl() {
  let el = document.getElementById('console');
  if (!el) {
    el = document.createElement('pre');
    el.id = 'console';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  return el;
}

export const javaStarted = () => !!ready;

export function ensureJava() {
  if (!ready) {
    ready = (async () => {
      await loadScript();
      await window.cheerpjInit({ version: JAVA_VERSION, status: 'none' });
      const lib = await window.cheerpjRunLibrary('');
      javac = await lib.com.sun.tools.javac.Main;
    })();
    ready.catch(() => { ready = null; });
  }
  return ready;
}

/** The class to run: the file that has `public static void main(...)`, with its package. */
export function findMainClass(files) {
  const names = Object.keys(files);
  const pick = names.find((n) => /^Main\.java$/.test(n) && /static\s+void\s+main\s*\(/.test(files[n]))
    || names.find((n) => /static\s+void\s+main\s*\(/.test(files[n]));
  if (!pick) return null;
  const cls = pick.replace(/\.java$/, '');
  const pkg = files[pick].match(/^\s*package\s+([\w.]+)\s*;/m)?.[1];
  return pkg ? `${pkg}.${cls}` : cls;
}

const settle = () => new Promise((r) => setTimeout(r, 60));

/**
 * Compile and run. files = { 'Main.java': '...' }, stdin = text the program reads.
 * Returns { phase: 'compile' | 'run', ok, out, ms }.
 */
export async function runJava(files, stdin = '', onStatus) {
  if (busy) throw new Error('A program is already running.');
  busy = true;
  try {
    const first = !ready;
    onStatus?.(first ? 'Starting Java… (first time only: downloading the Java engine, about 30 MB)' : 'Starting Java…');
    await ensureJava();
    const main = findMainClass(files);
    if (!main) return { phase: 'compile', ok: false, out: 'No class has a main method.\nAdd:  public static void main(String[] args) { ... }' };

    runCount += 1;
    const id = `${runCount}${Date.now().toString(36)}`;
    // /str/ is flat (no sub-folders) and javac needs Main.java to be called Main.java, so source files
    // are overwritten on every run; compiled classes go to a new folder each run so old classes never stick.
    const src = '/str';
    const out = `/files/r${id}/`;
    const enc = new TextEncoder();
    const paths = Object.entries(files).map(([name, code]) => {
      const p = `${src}/${name}`;
      window.cheerpjAddStringFile(p, enc.encode(code));
      return p;
    });
    const wrapper = `JRun${id}`;
    window.cheerpjAddStringFile(`${src}/stdin${id}.txt`, enc.encode(stdin.endsWith('\n') || !stdin ? stdin : `${stdin}\n`));
    window.cheerpjAddStringFile(`${src}/${wrapper}.java`, enc.encode(
      `public class ${wrapper} {\n  public static void main(String[] a) throws Throwable {\n    System.setIn(new java.io.FileInputStream("${src}/stdin${id}.txt"));\n    try { ${main}.main(a); }\n    catch (Throwable e) {\n      System.out.flush();\n      System.err.println("Exception in thread \\"main\\" " + e);\n      for (StackTraceElement s : e.getStackTrace()) { if (s.getClassName().equals("${wrapper}")) break; System.err.println("\\tat " + s); }\n      System.err.println("${FAIL}");\n    }\n    finally { System.out.flush(); System.err.flush(); }\n  }\n}\n`,
    ));

    const con = consoleEl();
    con.textContent = '';
    onStatus?.(first ? 'Compiling… (the first compile takes a little longer)' : 'Compiling…');
    const code = await javac.compile([...paths, `${src}/${wrapper}.java`, '-d', out, '-encoding', 'UTF-8']);
    await settle();
    const compileOut = con.textContent.replaceAll(`${src}/`, '');
    if (code !== 0) return { phase: 'compile', ok: false, out: compileOut || 'Compilation failed.' };

    con.textContent = '';
    onStatus?.('Running…');
    const t = performance.now();
    const exit = await window.cheerpjRunMain(wrapper, out);
    await settle();
    const raw = con.textContent;
    const failed = raw.includes(FAIL) || (exit != null && exit !== 0);
    const text = raw.replace(`${FAIL}\n`, '').replace(FAIL, '');
    return { phase: 'run', ok: !failed, out: text, ms: Math.round(performance.now() - t), exit: failed ? (exit || 1) : 0 };
  } finally {
    busy = false;
  }
}
