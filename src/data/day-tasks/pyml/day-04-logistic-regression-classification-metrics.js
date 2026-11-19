export default {
  lesson: 'day-04-logistic-regression-classification-metrics',
  minutes: 35,
  intro: 'Turn scores into probabilities with the sigmoid, read a confusion matrix, compute precision, recall and F1, and tune the decision threshold of a logistic regression.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (the sigmoid turns any score into a probability)',
      code: `import numpy as np
def sigmoid(z):
    return 1 / (1 + np.exp(-z))
print(sigmoid(0))
print(round(sigmoid(2), 3))
print(round(sigmoid(-2), 3))`,
      expected: '0.5\n0.881\n0.119',
      explain: 'σ(z) = 1 / (1 + e^(−z)) squeezes any number into (0, 1). A score of 0 gives exactly 0.5 – the default decision boundary. σ(−z) = 1 − σ(z), so 0.881 and 0.119 add up to 1.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A cancer-screening model must **miss as few sick patients as possible**. Which metric matters most?',
      options: ['Accuracy', 'Precision', 'Recall', 'Specificity'],
      answer: 2,
      explain: '**Recall** = TP / (TP + FN): of all truly sick patients, how many did we catch? Missing a sick patient (false negative) is the costly error here. **Precision** matters when false alarms are expensive (e.g. a spam filter deleting real emails). Accuracy is misleading on imbalanced data.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `scores(y_true, y_pred)` for binary labels (1 = positive) **without sklearn.metrics**. Return a dict with `tp`, `fp`, `fn`, `tn` (ints) and `precision`, `recall`, `f1` rounded to 3 decimals (use 0.0 if a denominator is 0).',
      example: { title: 'counting with zip', code: 'tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)' },
      starter: 'def scores(y_true, y_pred):\n    # TODO\n    return {}\n',
      solution: 'def scores(y_true, y_pred):\n    pairs = list(zip(y_true, y_pred))\n    tp = sum(1 for t, p in pairs if t == 1 and p == 1)\n    fp = sum(1 for t, p in pairs if t == 0 and p == 1)\n    fn = sum(1 for t, p in pairs if t == 1 and p == 0)\n    tn = sum(1 for t, p in pairs if t == 0 and p == 0)\n    prec = tp / (tp + fp) if tp + fp else 0.0\n    rec = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0\n    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn,\n            "precision": round(prec, 3), "recall": round(rec, 3), "f1": round(f1, 3)}\n',
      tests: [
        { call: 'scores([1, 0, 1, 1, 0, 0, 1, 0, 1, 0], [1, 0, 0, 1, 1, 0, 1, 0, 0, 0])', expect: { tp: 3, fp: 1, fn: 2, tn: 4, precision: 0.75, recall: 0.6, f1: 0.667 } },
        { call: '(lambda d: [d["tp"], d["fp"], d["fn"], d["tn"], d["precision"], d["recall"] == 1, d["f1"]])(scores([1, 1, 0], [1, 1, 1]))', expect: [2, 1, 0, 0, 0.667, true, 0.8], msg: 'scores([1, 1, 0], [1, 1, 1]): tp 2, fp 1, fn 0, tn 0, precision 0.667, recall 1.0, f1 0.8' },
      ],
      explain: 'Precision = TP / (TP + FP) – "when the model says yes, how often is it right?". Recall = TP / (TP + FN) – "how many real positives did it find?". F1 is their **harmonic** mean, which punishes a big gap between them.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Train a logistic regression on the **breast cancer** dataset:\n1. split `test_size=0.25, random_state=0, stratify=y`\n2. `pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))`, fit on train\n3. `cm`: the confusion matrix on the test set as a list of lists (`confusion_matrix(...).tolist()`)\n4. `auc`: ROC-AUC on the test set using `predict_proba(X_test)[:, 1]`, rounded to 3 decimals\n5. `f1`: F1-score on the test set, rounded to 3 decimals',
      example: { title: 'sklearn metrics', code: 'from sklearn.metrics import confusion_matrix, f1_score, roc_auc_score\nproba = model.predict_proba(X_test)[:, 1]\nroc_auc_score(y_test, proba)       # uses probabilities, not labels' },
      starter: 'from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, roc_auc_score, f1_score\nX, y = load_breast_cancer(return_X_y=True)\n\n# TODO\n',
      solution: 'from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, roc_auc_score, f1_score\nX, y = load_breast_cancer(return_X_y=True)\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\npipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))\npipe.fit(X_train, y_train)\npred = pipe.predict(X_test)\ncm = confusion_matrix(y_test, pred).tolist()\nauc = round(roc_auc_score(y_test, pipe.predict_proba(X_test)[:, 1]), 3)\nf1 = round(f1_score(y_test, pred), 3)\n',
      tests: [
        { call: '[[int(v) for v in r] for r in cm]', expect: [[50, 3], [3, 87]] },
        { call: 'round(float(auc), 3)', expect: 0.995 },
        { call: 'round(float(f1), 3)', expect: 0.967 },
      ],
      explain: 'In sklearn\'s confusion matrix rows are the **true** classes and columns the **predicted** ones: `[[TN, FP], [FN, TP]]` for labels 0/1. ROC-AUC must be computed from **probabilities** – passing hard 0/1 predictions throws away the ranking information and gives a lower, misleading AUC.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Threshold tuning.** `proba` holds predicted probabilities of fraud and `y_true` the real labels. Write `recall_at(threshold)` that predicts 1 when `proba >= threshold` and returns the recall rounded to 3 decimals. Then set `best_t`: the **highest** threshold from `[0.9, 0.7, 0.5, 0.3]` that reaches a recall of at least 0.8.',
      example: { title: 'custom threshold', code: 'pred = (proba >= 0.35).astype(int)   # instead of model.predict (0.5)' },
      starter: 'import numpy as np\nproba = np.array([0.95, 0.10, 0.62, 0.35, 0.80, 0.05, 0.45, 0.30, 0.72, 0.20])\ny_true = np.array([1, 0, 1, 1, 1, 0, 0, 0, 1, 0])\n\ndef recall_at(threshold):\n    # TODO\n    pass\n\nbest_t = None   # TODO\n',
      solution: 'import numpy as np\nproba = np.array([0.95, 0.10, 0.62, 0.35, 0.80, 0.05, 0.45, 0.30, 0.72, 0.20])\ny_true = np.array([1, 0, 1, 1, 1, 0, 0, 0, 1, 0])\n\ndef recall_at(threshold):\n    pred = (proba >= threshold).astype(int)\n    tp = int(((pred == 1) & (y_true == 1)).sum())\n    return round(tp / int((y_true == 1).sum()), 3)\n\nbest_t = next(t for t in [0.9, 0.7, 0.5, 0.3] if recall_at(t) >= 0.8)\n',
      tests: [
        { call: '[recall_at(0.9), recall_at(0.7), recall_at(0.5), recall_at(0.3) == 1]', expect: [0.2, 0.6, 0.8, true], msg: 'recall at 0.9 / 0.7 / 0.5 / 0.3 must be 0.2 / 0.6 / 0.8 / 1.0' },
        { call: 'best_t', expect: 0.5 },
      ],
      explain: 'Lowering the threshold catches more positives (recall ↑) but also flags more innocent cases (precision ↓). Pick the threshold from the **business** requirement ("catch at least 80% of fraud"), not the default 0.5 – here 0.5 happens to be the highest that meets it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Logistic regression is trained by minimising which loss? Write its common name (2 words, also called binary cross-entropy).',
      accept: ['log loss', 'logloss', 'log-loss', 'logistic loss', 'binary cross-entropy', 'binary cross entropy', 'cross entropy', 'cross-entropy'],
      explain: '**Log loss** = −mean(y·log(p) + (1−y)·log(1−p)). It punishes confident wrong answers very heavily (p = 0.99 for a true 0). MSE is not used because with the sigmoid it gives a non-convex, slow-to-train objective.',
    },
  ],
};
