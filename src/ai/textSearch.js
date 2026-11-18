// Tiny TF-IDF search used to teach embeddings / semantic search / RAG without any external service.
const STOP = new Set('a an the and or but if of to in on at for from by with is are was were be been it this that these those as i you he she we they my your our their what which who how why when where do does did can could should would will not no yes so than then there here into about over under also just only very more most such its'.split(' '));

export function tokenize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
    .map((w) => w.replace(/(ing|ed|es|s)$/, (m) => (w.length > 4 ? '' : m)));
}

export function chunkText(text, size = 60) {
  // split into chunks of ~size words, keeping paragraph boundaries when possible
  const paras = String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  paras.forEach((p) => {
    const words = p.split(/\s+/);
    for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size).join(' '));
  });
  return chunks;
}

export function buildIndex(docs) {
  const toks = docs.map(tokenize);
  const df = new Map();
  toks.forEach((t) => new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const N = docs.length;
  const idf = (w) => Math.log((N + 1) / ((df.get(w) || 0) + 1)) + 1;
  const vec = (t) => {
    const tf = new Map();
    t.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
    const v = new Map();
    tf.forEach((c, w) => v.set(w, (c / t.length) * idf(w)));
    return v;
  };
  const vectors = toks.map(vec);
  return {
    docs, vectors,
    search(query, k = 3) {
      const qv = vec(tokenize(query));
      return vectors.map((v, i) => ({ i, text: docs[i], score: cosine(qv, v) }))
        .sort((a, b) => b.score - a.score).slice(0, k);
    },
  };
}

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  a.forEach((x, w) => { na += x * x; if (b.has(w)) dot += x * b.get(w); });
  b.forEach((y) => { nb += y * y; });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
