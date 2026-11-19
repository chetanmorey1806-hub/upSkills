export default {
  lesson: 'day-11-neural-networks-deep-learning-nlp-basics',
  minutes: 35,
  intro: 'Compute a neural-network forward pass with NumPy, know activations, loss and backpropagation, train an MLP, and build a TF-IDF text classifier.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (activation functions)',
      code: `import numpy as np
z = np.array([-2.0, 0.0, 3.0])
print(np.maximum(0, z))
e = np.exp(np.array([1.0, 2.0, 3.0]))
p = e / e.sum()
print(p.round(3))
print(round(float(p.sum()), 3))`,
      expected: '[0. 0. 3.]\n[0.09  0.245 0.665]\n1.0',
      explain: '**ReLU** = max(0, z) keeps positives and zeroes negatives (the default for hidden layers). **Softmax** turns scores into probabilities that sum to 1 – used in the output layer for multi-class problems. Sigmoid is used for a single yes/no output.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Forward pass.** A tiny network has 2 inputs → 3 hidden neurons (ReLU) → 1 output (sigmoid). Write `forward(x)` that returns the output probability rounded to 3 decimals, using the weights `W1` (2×3), `b1` (3), `W2` (3×1), `b2` (1) from the starter.\n\nh = ReLU(x · W1 + b1), out = sigmoid(h · W2 + b2)',
      example: { title: 'one dense layer', code: 'h = np.maximum(0, x @ W + b)   # x: (n_inputs,), W: (n_inputs, n_units)' },
      starter: 'import numpy as np\nW1 = np.array([[0.5, -1.0, 0.8], [0.3, 0.6, -0.4]])\nb1 = np.array([0.1, 0.0, -0.2])\nW2 = np.array([[1.2], [-0.7], [0.9]])\nb2 = np.array([-0.5])\n\ndef forward(x):\n    # TODO\n    pass\n',
      solution: 'import numpy as np\nW1 = np.array([[0.5, -1.0, 0.8], [0.3, 0.6, -0.4]])\nb1 = np.array([0.1, 0.0, -0.2])\nW2 = np.array([[1.2], [-0.7], [0.9]])\nb2 = np.array([-0.5])\n\ndef forward(x):\n    x = np.array(x, dtype=float)\n    h = np.maximum(0, x @ W1 + b1)\n    z = h @ W2 + b2\n    return round(float(1 / (1 + np.exp(-z[0]))), 3)\n',
      tests: [
        { call: 'forward([1.0, 2.0])', expect: 0.69 },
        { call: 'forward([0.0, 0.0])', expect: 0.406 },
        { call: 'forward([2.0, -1.0])', expect: 0.889 },
      ],
      explain: 'Each layer is a matrix multiplication plus bias followed by an activation. Without the non-linear ReLU, stacking layers would collapse into one linear model. Training (backpropagation) adjusts W1, b1, W2, b2 to reduce the loss using the gradients of this same computation.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about training neural networks are TRUE? (choose all that apply)',
      options: ['Backpropagation uses the chain rule to compute the gradient of the loss for every weight', 'An epoch is one full pass over the training data', 'A learning rate that is too high can make the loss jump around or diverge', 'Deep learning is usually the best choice for small tabular datasets', 'Scaling inputs helps gradient-based training converge'],
      answers: [0, 1, 2, 4],
      explain: 'For small/medium **tabular** data, gradient boosting or random forests usually beat neural networks with far less tuning. Deep learning shines on images, audio, text and very large datasets.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**MLP in scikit-learn.** On the digits dataset (`load_digits(return_X_y=True)`, split `test_size=0.25, random_state=0, stratify=y`) train `make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), max_iter=300, random_state=0))`. Set `acc` = test accuracy rounded to 3 and `n_layers` = `pipe[-1].n_layers_` (input + hidden + output).',
      example: { title: 'MLPClassifier', code: 'mlp = MLPClassifier(hidden_layer_sizes=(64, 32), activation="relu", max_iter=200, random_state=1)\nmlp.fit(X_train, y_train)' },
      starter: 'from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neural_network import MLPClassifier\nX, y = load_digits(return_X_y=True)\n\n# TODO: pipe, acc, n_layers\n',
      solution: 'from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.neural_network import MLPClassifier\nX, y = load_digits(return_X_y=True)\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\npipe = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), max_iter=300, random_state=0))\npipe.fit(X_train, y_train)\nacc = round(pipe.score(X_test, y_test), 3)\nn_layers = pipe[-1].n_layers_\n',
      tests: [
        { call: 'bool(float(acc) >= 0.95)', expect: true, msg: 'the scaled MLP should reach at least 95% test accuracy' },
        { call: 'int(n_layers)', expect: 3 },
      ],
      explain: 'MLPClassifier is a fully-connected network trained with backpropagation (Adam optimiser by default). Scaling matters a lot for neural networks. For bigger models and GPUs you would write the same idea in Keras (`Sequential([Dense(32, activation="relu"), Dense(10, activation="softmax")])`) or PyTorch.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Sentiment classifier.** Build `clf = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression(max_iter=1000))`, fit it on `reviews` / `labels`, and set `preds` = predictions for `new_reviews` (list of strings). Also set `vocab_size` = number of terms learned by the vectorizer (`len(clf[0].vocabulary_)`).',
      example: { title: 'TF-IDF pipeline', code: 'clf = make_pipeline(TfidfVectorizer(stop_words="english"), MultinomialNB())\nclf.fit(texts, y)\nclf.predict(["new text"])' },
      starter: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nreviews = ["great product fast delivery", "very good quality", "loved it great value",\n           "bad quality broke quickly", "very bad delivery late", "not good waste of money"]\nlabels = ["pos", "pos", "pos", "neg", "neg", "neg"]\nnew_reviews = ["great quality", "late delivery bad"]\n\n# TODO\n',
      solution: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nreviews = ["great product fast delivery", "very good quality", "loved it great value",\n           "bad quality broke quickly", "very bad delivery late", "not good waste of money"]\nlabels = ["pos", "pos", "pos", "neg", "neg", "neg"]\nnew_reviews = ["great quality", "late delivery bad"]\n\nclf = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression(max_iter=1000))\nclf.fit(reviews, labels)\npreds = list(clf.predict(new_reviews))\nvocab_size = len(clf[0].vocabulary_)\n',
      tests: [
        { call: '[str(p) for p in preds]', expect: ['pos', 'neg'] },
        { call: 'int(vocab_size)', expect: 36 },
      ],
      explain: 'TF-IDF weights a word by how often it appears in a document (TF) and down-weights words that appear in every document (IDF), so "great" and "bad" matter more than "very". `ngram_range=(1, 2)` adds word pairs like "not good", which captures simple negation. The pipeline guarantees new text is vectorised with the same vocabulary.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In Keras, which output-layer activation is used for a **multi-class** classifier with 10 classes (one probability per class)? `Dense(10, activation="____")`',
      accept: ['softmax'],
      explain: '`softmax` gives 10 probabilities that sum to 1, paired with the `categorical_crossentropy` (or `sparse_categorical_crossentropy`) loss. Use `sigmoid` with 1 unit for binary problems and no activation (linear) for regression.',
    },
  ],
};
