export default {
  lesson: 'day-01-what-is-ml-types-workflow-sklearn-api',
  minutes: 30,
  intro: 'Classify ML problems by type, know the ML workflow and use the scikit-learn API (fit, predict, score, fit_transform) on a built-in dataset.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **supervised classification** problems? (choose all that apply)',
      options: ['Predict if a loan applicant will default (Yes/No)', 'Predict the price of a flat in Pune (₹)', 'Group customers into segments without any labels', 'Detect whether an email is spam', 'Predict which of 3 iris species a flower belongs to'],
      answers: [0, 3, 4],
      explain: 'Classification predicts a **category** from labelled examples (default yes/no, spam/not spam, species). Flat price is a **number** → regression. Grouping without labels is **unsupervised** clustering.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In scikit-learn, what is the correct order to train a model and use it?',
      options: ['model.predict(X_train) → model.fit(X_test)', 'model = Estimator() → model.fit(X_train, y_train) → model.predict(X_test)', 'model.fit(X_test, y_test) → model.score(X_train, y_train)', 'model.transform(y) → model.fit(X)'],
      answer: 1,
      explain: 'Every estimator follows the same API: create it with hyperparameters, `fit` on **training** data (features X and target y), then `predict` / `score` on **unseen** test data. Fitting on test data leaks information and gives over-optimistic results.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In ML vocabulary, the column you want to predict (e.g. "will churn") is called the **t____** (also called label or y). Write the word.',
      accept: ['target', 'target variable', 'label', 'y'],
      explain: 'The **target** (label, y) is what the model predicts; the input columns are **features** (X). Each row is a sample/observation. Mixing these up (e.g. leaving the target inside X) causes target leakage.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Train your first classifier on the built-in **iris** dataset:\n1. `X, y = load_iris(return_X_y=True)`\n2. split with `train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)` into `X_train, X_test, y_train, y_test`\n3. `model`: a `KNeighborsClassifier(n_neighbors=3)` fitted on the training data\n4. `acc`: the accuracy on the **test** set (`model.score`), rounded to 3 decimals\n5. `n_test`: the number of test rows',
      example: { title: 'fit / predict / score', code: 'from sklearn.tree import DecisionTreeClassifier\nclf = DecisionTreeClassifier(random_state=0)\nclf.fit(X_train, y_train)\npreds = clf.predict(X_test)\nprint(clf.score(X_test, y_test))   # accuracy' },
      starter: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\n# TODO\n',
      solution: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)\nmodel = KNeighborsClassifier(n_neighbors=3)\nmodel.fit(X_train, y_train)\nacc = round(model.score(X_test, y_test), 3)\nn_test = len(X_test)\n',
      tests: [
        { call: '[len(X_train), int(n_test)]', expect: [105, 45] },
        { call: 'round(float(acc), 3)', expect: 0.956 },
        { call: 'int(model.predict([[5.1, 3.5, 1.4, 0.2]])[0])', expect: 0, msg: 'model must be fitted (a classic setosa flower is class 0)' },
      ],
      explain: '`test_size=0.3` keeps 30% (45 of 150 rows) for testing; `stratify=y` keeps the same species mix in both parts; `random_state` makes the split reproducible. `score` on a classifier returns **accuracy** on the data you pass – always the test set for an honest estimate.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Transformers: fit_transform vs transform.** Scale the features with `StandardScaler`:\n1. `scaler`: fitted on `X_train` only, `X_train_s = scaler.fit_transform(X_train)`\n2. `X_test_s`: the test data scaled with the **same** scaler (`transform`, not fit again)\n3. `train_means`: the column means of `X_train_s` rounded to 2 decimals (list) – they should be ~0\n4. `mu`: `scaler.mean_` rounded to 2 decimals (list)',
      example: { title: 'fit on train, transform both', code: 'from sklearn.preprocessing import MinMaxScaler\nmm = MinMaxScaler()\nA_train = mm.fit_transform(A_train)   # learns min/max from train\nA_test = mm.transform(A_test)         # reuses them' },
      starter: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nX_train = np.array([[25, 30001], [32, 52000], [41, 61000], [29, 45000]])\nX_test = np.array([[35, 50000], [50, 90000]])\n\n# TODO\n',
      solution: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nX_train = np.array([[25, 30001], [32, 52000], [41, 61000], [29, 45000]])\nX_test = np.array([[35, 50000], [50, 90000]])\n\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s = scaler.transform(X_test)\ntrain_means = [round(float(m), 2) for m in X_train_s.mean(axis=0)]\nmu = [round(float(m), 2) for m in scaler.mean_]\n',
      tests: [
        { call: 'all(abs(float(m)) < 0.01 for m in X_train_s.mean(axis=0)) and len(train_means) == 2', expect: true, msg: 'X_train_s must be the scaled training data (column means ~0) and train_means must have 2 values' },
        { call: '[round(float(m), 2) for m in mu]', expect: [31.75, 47000.25] },
        { call: '[round(float(v), 3) for v in X_test_s[0]]', expect: [0.552, 0.265], msg: 'X_test_s must use the scaler fitted on X_train' },
      ],
      explain: 'A scaler **learns** statistics (mean, std) during `fit` and applies them in `transform`. Fit it on training data only and reuse it for test data – fitting again on the test set (or on all data before splitting) leaks information and makes test scores unreliable.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A **baseline** model always predicts the most frequent class. What does this print?',
      code: `from sklearn.dummy import DummyClassifier
X = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]
y = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1]
base = DummyClassifier(strategy="most_frequent").fit(X, y)
print(base.predict([[100], [-5]]))
print(base.score(X, y))`,
      expected: '[0 0]\n0.7',
      explain: 'The dummy model ignores the features and always answers class 0, which is right 7 times out of 10 → 70% accuracy without learning anything. Any real model must beat this **baseline** – on imbalanced data a "95% accurate" model may be no better than predicting the majority class.',
    },
  ],
};
