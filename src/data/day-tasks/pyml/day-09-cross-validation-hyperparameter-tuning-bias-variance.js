export default {
  lesson: 'day-09-cross-validation-hyperparameter-tuning-bias-variance',
  minutes: 35,
  intro: 'Estimate performance honestly with K-fold cross-validation, pick the right splitter, tune a Pipeline with GridSearchCV and diagnose under- vs overfitting.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'You forecast daily sales. Which cross-validation splitter is correct?',
      options: ['KFold(shuffle=True)', 'StratifiedKFold', 'TimeSeriesSplit', 'LeaveOneOut with shuffling'],
      answer: 2,
      explain: '**TimeSeriesSplit** always trains on the past and validates on the future. Shuffled folds let the model "see the future" during training, giving unrealistically good scores. StratifiedKFold is for classification class balance; GroupKFold keeps all rows of one customer/patient in the same fold.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Train accuracy **62%**, validation accuracy **60%**, and the business needs ~85%. What is the diagnosis?',
      options: ['High variance (overfitting) – add regularisation', 'High bias (underfitting) – use a more complex model or better features', 'Data leakage', 'The model is perfect'],
      answer: 1,
      explain: 'Both scores are low and close together → the model is too simple (**high bias**). Overfitting looks like a high train score with a much lower validation score. For underfitting add features, reduce regularisation or use a more flexible model; more data alone rarely helps.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**One split vs K-fold.** On the wine dataset (`load_wine(return_X_y=True)`) with `pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))`:\n1. `fold_scores`: the 5 accuracies from `cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0))`, each rounded to 3 (list)\n2. `cv_mean`, `cv_std`: their mean and standard deviation, rounded to 3',
      example: { title: 'cross_val_score with a splitter', code: 'cv = KFold(n_splits=5, shuffle=True, random_state=1)\nscores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")\nprint(scores.mean(), scores.std())' },
      starter: 'from sklearn.datasets import load_wine\nfrom sklearn.model_selection import cross_val_score, StratifiedKFold\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nX, y = load_wine(return_X_y=True)\n\n# TODO\n',
      solution: 'from sklearn.datasets import load_wine\nfrom sklearn.model_selection import cross_val_score, StratifiedKFold\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nX, y = load_wine(return_X_y=True)\n\npipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))\nscores = cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0))\nfold_scores = [round(float(s), 3) for s in scores]\ncv_mean = round(float(scores.mean()), 3)\ncv_std = round(float(scores.std()), 3)\n',
      tests: [
        { call: 'len(fold_scores)', expect: 5 },
        { call: '[round(float(cv_mean), 3), round(float(cv_std), 3)]', expect: [0.983, 0.014] },
      ],
      explain: 'Every row is used for validation exactly once, so the mean is a more reliable estimate than one split, and the std shows how much the score depends on the split. Report both: "98.3% ± 1.4%". The scaler sits inside the pipeline, so it is re-fitted on each training fold (no leakage).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**GridSearchCV on a Pipeline.** Tune `pipe = Pipeline([("sc", StandardScaler()), ("svc", SVC())])` on the breast cancer **training** split (`test_size=0.25, random_state=0, stratify=y`) with grid `{"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}` and `cv=5`.\nSet `best_params` (dict), `best_cv` (best CV score rounded to 3) and `test_acc` (test accuracy of `grid.best_estimator_`, rounded to 3).',
      example: { title: 'step__param names', code: 'grid = GridSearchCV(pipe, {"knn__n_neighbors": [3, 5, 7]}, cv=5)\ngrid.fit(X_train, y_train)\ngrid.best_params_, grid.best_score_' },
      starter: 'from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split, GridSearchCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nX, y = load_breast_cancer(return_X_y=True)\n\n# TODO\n',
      solution: 'from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split, GridSearchCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nX, y = load_breast_cancer(return_X_y=True)\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\npipe = Pipeline([("sc", StandardScaler()), ("svc", SVC())])\ngrid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10], "svc__kernel": ["linear", "rbf"]}, cv=5)\ngrid.fit(X_train, y_train)\nbest_params = grid.best_params_\nbest_cv = round(grid.best_score_, 3)\ntest_acc = round(grid.best_estimator_.score(X_test, y_test), 3)\n',
      tests: [
        { call: 'dict(best_params)', expect: { svc__C: 0.1, svc__kernel: 'linear' } },
        { call: '[round(float(best_cv), 3), round(float(test_acc), 3)]', expect: [0.988, 0.958] },
      ],
      explain: 'Parameters of a pipeline step are addressed as `stepname__param`. GridSearchCV tries all 3 × 2 = 6 combinations with 5-fold CV **on the training set only**, refits the best one on all training data, and you check it **once** on the untouched test set.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'How many models does this grid search train in total (including the final refit)? The code prints the number of candidates and folds.',
      code: `grid = {"max_depth": [3, 5, 10, None], "min_samples_leaf": [1, 5, 10]}
candidates = 1
for values in grid.values():
    candidates *= len(values)
folds = 5
print(candidates)
print(candidates * folds + 1)`,
      expected: '12\n61',
      explain: '4 × 3 = 12 combinations, each trained on 5 folds = 60 fits, plus 1 final refit on the whole training set = 61. Grids grow multiplicatively – that is why `RandomizedSearchCV(n_iter=20)` is preferred for large search spaces.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices avoid **leakage during tuning**? (choose all that apply)',
      options: ['Put scaling/encoding inside the Pipeline that GridSearchCV tunes', 'Keep a final test set that the search never sees', 'Choose hyperparameters by their score on the test set', 'Use nested CV to estimate the performance of the whole tuning procedure', 'Scale X once before splitting to save time'],
      answers: [0, 1, 3],
      explain: 'Choosing hyperparameters by the test score turns the test set into a validation set – the reported score becomes optimistic. Preprocessing fitted on all data leaks statistics from validation folds. Nested CV (an outer CV around GridSearchCV) gives an unbiased estimate when data is small.',
    },
  ],
};
