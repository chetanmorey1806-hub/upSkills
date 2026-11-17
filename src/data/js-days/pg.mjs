// Rapid revision: one line per module, run to recall the key behaviour
const log = (label, ...v) => console.log(label.padEnd(26), ...v);

// Module 1 - Basics
log('M1 typeof null / NaN:', typeof null, typeof NaN);
log('M1 0.1 + 0.2 === 0.3:', 0.1 + 0.2 === 0.3, (0.1 + 0.2).toFixed(2));
// Module 2 - Functions & Arrays
const counter = (() => { let c = 0; return () => ++c; })();
counter(); counter();
log('M2 closure counter:', counter());
log('M2 [1,2,3].includes(2):', [1, 2, 3].includes(2));
// Module 3 - Objects & Data structures
log('M3 JSON round trip:', JSON.parse(JSON.stringify({ d: new Date(0), u: undefined })));
log('M3 Set dedupe:', [...new Set([1, 1, 2, 3, 3])]);
// Module 4 - DOM (browser only): querySelector, addEventListener, event delegation
log('M4 remember:', 'e.target vs e.currentTarget, preventDefault, stopPropagation');
// Module 5 - Async
log('M5 order:', 'sync -> microtasks (promises/await) -> macrotasks (timers)');
// Module 6 - Advanced
class A { static who() { return 'A'; } hi() { return 'hi from ' + this.constructor.name; } }
class B extends A {}
log('M6 class/proto:', new B().hi(), Object.getPrototypeOf(B) === A);
log('M6 bind partial:', ((a, b) => a * b).bind(null, 3)(4));
log('M6 regex test:', /^[6-9]\d{9}$/.test('9876543210'));
// Module 7 - Professional
function* ids() { let i = 1; while (true) yield i++; }
const gen = ids();
log('M7 generator:', gen.next().value, gen.next().value);
log('M7 ?? vs ||:', 0 ?? 'x', 0 || 'x');