export default {
  lesson: 'day-05-knn-naive-bayes',
  minutes: 35,
  intro: 'Classify with K-Nearest Neighbours (distances, k, scaling) and Naive Bayes (Bayes\' theorem, GaussianNB, MultinomialNB for text).',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (Euclidean vs Manhattan distance between two customers)',
      code: `import numpy as np
a = np.array([2, 3])
b = np.array([5, 7])
print(np.sqrt(((a - b) ** 2).sum()))
print(np.abs(a - b).sum())`,
      expected: '5.0\n7',
      explain: 'Euclidean distance = √(3² + 4²) = 5 (straight line). Manhattan distance = |3| + |4| = 7 (along the grid). KNN uses Euclidean by default (`metric="minkowski", p=2`).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Features are `age` (20-60) and `income` (₹20,000-₹2,00,000). Why must you **scale** them before KNN?',
      options: ['KNN cannot read integers', 'Income has a much bigger range, so it dominates the distance and age is almost ignored', 'Scaling makes KNN train faster', 'Scaling removes outliers'],
      answer: 1,
      explain: 'Distance adds up differences: a ₹10,000 income gap swamps a 30-year age gap. StandardScaler / MinMaxScaler puts features on comparable scales so each one counts. Tree models do not need this; KNN, SVM and logistic regression do.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**KNN from scratch.** Write `knn_predict(X_train, y_train, x, k)` that returns the **majority label** among the `k` training points closest (Euclidean) to the point `x`. Use NumPy for distances and `collections.Counter` for the vote.',
      example: { title: 'nearest indexes', code: 'd = np.sqrt(((X - x) ** 2).sum(axis=1))\nidx = np.argsort(d)[:3]      # 3 nearest rows' },
      starter: 'import numpy as np\nfrom collections import Counter\n\ndef knn_predict(X_train, y_train, x, k):\n    # TODO\n    pass\n',
      solution: 'import numpy as np\nfrom collections import Counter\n\ndef knn_predict(X_train, y_train, x, k):\n    X = np.array(X_train, dtype=float)\n    d = np.sqrt(((X - np.array(x, dtype=float)) ** 2).sum(axis=1))\n    idx = np.argsort(d)[:k]\n    labels = [y_train[i] for i in idx]\n    return Counter(labels).most_common(1)[0][0]\n',
      tests: [
        { call: 'knn_predict([[1, 1], [1, 2], [2, 2], [8, 8], [9, 8], [8, 9]], ["low", "low", "low", "high", "high", "high"], [2, 1], 3)', expect: 'low' },
        { call: 'knn_predict([[1, 1], [1, 2], [2, 2], [8, 8], [9, 8], [8, 9]], ["low", "low", "low", "high", "high", "high"], [7, 7], 3)', expect: 'high' },
        { call: 'knn_predict([[0, 0], [0, 1], [5, 5], [6, 5], [5, 6]], ["A", "A", "B", "B", "B"], [1, 1], 1)', expect: 'A' },
        { call: 'knn_predict([[0, 0], [0, 1], [5, 5], [6, 5], [5, 6]], ["A", "A", "B", "B", "B"], [1, 1], 5)', expect: 'B' },
      ],
      explain: 'KNN has no real training: it stores the data and, at prediction time, finds the k closest points and votes. The last test shows the effect of k: with k = 1 the nearest point wins (A), with k = 5 (all points) the majority class wins (B) – large k = smoother, more biased model.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Choose k with cross-validation.** On the iris data, for each k in `[1, 3, 5, 7, 9, 11]` compute the mean 5-fold accuracy of `make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))` with `cross_val_score(..., cv=5)`. Store them in a dict `cv_acc = {k: mean accuracy rounded to 3}` and set `best_k` = the k with the highest mean (the **smallest** k if tied).',
      example: { title: 'cross_val_score', code: 'from sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5)\nscores.mean()' },
      starter: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = load_iris(return_X_y=True)\n\ncv_acc = {}\n# TODO\n',
      solution: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = load_iris(return_X_y=True)\n\ncv_acc = {}\nfor k in [1, 3, 5, 7, 9, 11]:\n    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))\n    cv_acc[k] = round(cross_val_score(pipe, X, y, cv=5).mean(), 3)\nbest_k = max(cv_acc, key=lambda k: (cv_acc[k], -k))\n',
      tests: [
        { call: 'sorted(cv_acc.keys())', expect: [1, 3, 5, 7, 9, 11] },
        { call: '[round(float(cv_acc[k]), 3) for k in [1, 3, 5, 7, 9, 11]]', expect: [0.947, 0.953, 0.96, 0.96, 0.96, 0.947] },
        { call: 'int(best_k)', expect: 5, msg: 'k = 5, 7 and 9 tie at 0.96: pick the smallest' },
      ],
      explain: 'Small k (1) follows noise (high variance); large k smooths too much (high bias). Cross-validation averages accuracy over 5 different splits, so the choice of k does not depend on one lucky split. Never pick k by looking at the test set.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Spam filter with Naive Bayes.** Using the messages in the starter:\n1. `vec = CountVectorizer()`; `X = vec.fit_transform(texts)`\n2. `nb = MultinomialNB()` fitted on `X`, `labels`\n3. `preds`: predictions (list of strings) for `new_msgs` (transform them with the **same** `vec`)\n4. `n_words`: size of the vocabulary (`len(vec.vocabulary_)`)',
      example: { title: 'text → counts → NB', code: 'vec = CountVectorizer()\nX = vec.fit_transform(["good movie", "bad movie"])\nMultinomialNB().fit(X, ["pos", "neg"]).predict(vec.transform(["good"]))' },
      starter: 'from sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\ntexts = ["win free cash now", "free prize claim now", "meeting at 10 tomorrow",\n         "lunch tomorrow with team", "claim your free gift", "project meeting notes"]\nlabels = ["spam", "spam", "ham", "ham", "spam", "ham"]\nnew_msgs = ["free cash prize", "team meeting tomorrow"]\n\n# TODO\n',
      solution: 'from sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\ntexts = ["win free cash now", "free prize claim now", "meeting at 10 tomorrow",\n         "lunch tomorrow with team", "claim your free gift", "project meeting notes"]\nlabels = ["spam", "spam", "ham", "ham", "spam", "ham"]\nnew_msgs = ["free cash prize", "team meeting tomorrow"]\n\nvec = CountVectorizer()\nX = vec.fit_transform(texts)\nnb = MultinomialNB().fit(X, labels)\npreds = list(nb.predict(vec.transform(new_msgs)))\nn_words = len(vec.vocabulary_)\n',
      tests: [
        { call: '[str(p) for p in preds]', expect: ['spam', 'ham'] },
        { call: 'int(n_words)', expect: 17 },
      ],
      explain: 'Naive Bayes multiplies P(word | class) for every word, "naively" assuming words are independent – wrong in reality but works very well for text. Laplace smoothing (`alpha=1`) stops an unseen word from making a probability 0. Always `transform` new text with the vectorizer fitted on training data; calling `fit_transform` again builds a different vocabulary.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which Naive Bayes variant suits **continuous numeric** features like petal length (assumes a normal distribution per class)? Write the sklearn class name.',
      accept: ['GaussianNB', 'Gaussian NB', 'Gaussian Naive Bayes', 'sklearn.naive_bayes.GaussianNB'],
      explain: '**GaussianNB** for continuous features, **MultinomialNB** for word counts / TF-IDF, **BernoulliNB** for binary present/absent features. Using MultinomialNB on negative numbers (e.g. scaled data) raises an error.',
    },
  ],
};
